#!/usr/bin/env node
/**
 * Renders every app page's download buttons from stores.json and the stores' own live status.
 *
 *   node tools/store-buttons.mjs              all apps in stores.json
 *   node tools/store-buttons.mjs spiritbox    just these slugs
 *   node tools/store-buttons.mjs --check      print what would change, write nothing
 *
 * stores.json only says which stores an app is planned for. Whether it is live is asked of the stores:
 *   - App Store: itunes.apple.com/lookup by bundle id (default com.fosterapps.<slug>; set ios.bundleId,
 *     or ios.id for an app outside the factory). A result = live, and its trackId is the link.
 *   - Google Play: the public listing page for android.package (default com.fosterapps.<slug>).
 *     HTTP 200 = live, 404 = not published (internal testing only, or never released).
 * If any lookup fails (network, rate limit), nothing is written — a blip must never flip a live app to
 * "Coming soon". Runs daily in .github/workflows/store-buttons.yml, so buttons follow the stores.
 *
 * Per page (<slug>/index.html):
 *   - Download buttons live between <!-- store-buttons:hero|cta --> and <!-- /store-buttons -->.
 *     First run converts the old hand-written App Store anchors (apps.apple.com or #download) into
 *     those regions: the first becomes "hero", the rest "cta".
 *   - live -> a link to the listing; not live -> a muted "Coming soon to ..." label (not a link).
 *   - <meta name="apple-itunes-app"> (Safari's Smart App Banner) only while the App Store listing is live.
 *   - The SoftwareApplication JSON-LD "url" points at a live listing, or at the page itself when none is live.
 *   - The hero kicker ("Available on the App Store") lives between <!-- store-eyebrow --> markers and says
 *     which stores the app is live on, or "Coming soon to ..." when it is live on none.
 *   - Links assets/css/stores.css.
 * Static output, so buttons work without JavaScript and crawlers see real links.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const STORES_CSS_VERSION = 1;
const args = process.argv.slice(2);
const check = args.includes('--check');
const only = args.filter((a) => !a.startsWith('--'));

const config = JSON.parse(readFileSync(join(ROOT, 'stores.json'), 'utf8'));
const slugs = Object.keys(config).filter((k) => !k.startsWith('_') && (only.length === 0 || only.includes(k)));

// ── Live status from the stores ───────────────────────────────────────────────
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Retries transient failures (Apple's lookup rate-limits with an HTML page); throws after the last try. */
async function withRetry(what, fn) {
  let last;
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      return await fn();
    } catch (e) {
      last = e;
      await sleep(3000 * attempt);
    }
  }
  throw new Error(`${what}: ${last.message}`);
}

async function appStoreId(slug, ios) {
  const query = ios.id ? `id=${ios.id}` : `bundleId=${ios.bundleId ?? `com.fosterapps.${slug}`}`;
  return withRetry(`App Store lookup ${query}`, async () => {
    const res = await fetch(`https://itunes.apple.com/lookup?${query}&country=us`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = JSON.parse(await res.text()); // throws on Apple's HTML rate-limit page -> retried
    return json.resultCount > 0 ? String(json.results[0].trackId) : null;
  });
}

async function playLive(pkg) {
  return withRetry(`Google Play listing ${pkg}`, async () => {
    const res = await fetch(`https://play.google.com/store/apps/details?id=${pkg}&hl=en_US&gl=US`);
    if (res.status === 200) return true;
    if (res.status === 404) return false;
    throw new Error(`HTTP ${res.status}`);
  });
}

try {
  for (const slug of slugs) {
    const app = config[slug];
    if (app.ios) {
      const id = await appStoreId(slug, app.ios);
      app.ios.status = id ? 'live' : 'soon';
      if (id) app.ios.id = id;
      await sleep(400);
    }
    if (app.android) {
      app.android.package ??= `com.fosterapps.${slug}`;
      app.android.status = (await playLive(app.android.package)) ? 'live' : 'soon';
    }
  }
} catch (e) {
  console.error(`✗ store lookup failed, nothing written: ${e.message}`);
  process.exit(1);
}

const APPLE_SVG = '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>';
const PLAY_SVG = '<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="M3.6 1.8c-.3.3-.5.8-.5 1.4v17.6c0 .6.2 1.1.5 1.4l.1.1 9.9-9.9v-.2L3.7 1.7l-.1.1zm13.3 13.4-3.3-3.3v-.2l3.3-3.3.1.1 3.9 2.2c1.1.6 1.1 1.7 0 2.3l-3.9 2.2h-.1zm.1-.1L13.6 12l-10 10c.4.4 1 .4 1.7.1l11.7-7zm0-6.2L5.3 1.9c-.7-.4-1.3-.3-1.7.1l10 10 3.4-3z"/></svg>';

const STORES = {
  ios: {
    svg: APPLE_SVG,
    storeName: 'App Store',
    liveEyebrow: 'Download on the',
    soonEyebrow: 'Coming soon to the',
    url: (s) => `https://apps.apple.com/app/id${s.id}`,
  },
  android: {
    svg: PLAY_SVG,
    storeName: 'Google Play',
    liveEyebrow: 'Get it on',
    soonEyebrow: 'Coming soon to',
    url: (s) => `https://play.google.com/store/apps/details?id=${s.package}`,
  },
};

const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

function button(app, key) {
  const store = app[key];
  const def = STORES[key];
  if (store.status === 'live') {
    const href = def.url(store);
    return `<a class="store-btn store-btn--live" href="${href}" target="_blank" rel="noopener" style="--store-accent:${app.color};" aria-label="${esc(`${def.liveEyebrow} ${def.storeName}: ${app.name}`)}">${def.svg}<span class="store-btn__text"><span class="store-btn__eyebrow">${def.liveEyebrow}</span><span class="store-btn__store">${def.storeName}</span></span></a>`;
  }
  return `<span class="store-btn store-btn--soon" role="note" aria-label="${esc(`${app.name} is ${def.soonEyebrow.toLowerCase()} ${def.storeName}`)}">${def.svg}<span class="store-btn__text"><span class="store-btn__eyebrow">${def.soonEyebrow}</span><span class="store-btn__store">${def.storeName}</span></span></span>`;
}

function region(app, kind) {
  const keys = ['ios', 'android'].filter((k) => app[k]);
  // Live listings first, so the button a visitor can act on leads.
  keys.sort((a, b) => (app[b].status === 'live') - (app[a].status === 'live'));
  const buttons = keys.map((k) => button(app, k)).join('\n');
  return `<!-- store-buttons:${kind} -->\n<div class="store-buttons${kind === 'cta' ? ' store-buttons--cta' : ''}">\n${buttons}\n</div>\n<!-- /store-buttons -->`;
}

function eyebrow(app) {
  const keys = ['ios', 'android'].filter((k) => app[k]);
  const live = keys.filter((k) => app[k].status === 'live');
  const names = (ks) => ks.map((k) => (k === 'ios' ? 'the App Store' : 'Google Play')).join(' and ');
  return live.length ? `Available on ${names(live)}` : `Coming soon to ${names(keys)}`;
}

function primaryUrl(app, slug) {
  for (const k of ['ios', 'android']) if (app[k]?.status === 'live') return STORES[k].url(app[k]);
  return `https://fosterapps.com/${slug}/`;
}

let failures = 0;
for (const slug of slugs) {
  const app = config[slug];
  const file = join(ROOT, slug, 'index.html');
  if (!existsSync(file)) {
    console.log(`- ${slug}: no ${slug}/index.html, skipped`);
    continue;
  }
  const before = readFileSync(file, 'utf8');
  let html = before;
  const notes = [];

  // 1. Button regions: refresh existing markers, or convert the old anchors on first run.
  const markerRe = /<!-- store-buttons:(hero|cta) -->[\s\S]*?<!-- \/store-buttons -->/g;
  if (markerRe.test(html)) {
    html = html.replace(markerRe, (_, kind) => region(app, kind));
  } else {
    let n = 0;
    html = html.replace(
      /<a class="button primary" href="(?:https:\/\/apps\.apple\.com[^"]*|#download)"[^>]*>[\s\S]*?<\/a>/g,
      () => region(app, n++ === 0 ? 'hero' : 'cta'),
    );
    if (n === 0) {
      console.error(`✗ ${slug}: no download anchor or store-buttons marker found — add <!-- store-buttons:hero --><!-- /store-buttons --> by hand`);
      failures++;
      continue;
    }
    notes.push(`converted ${n} anchor(s)`);
  }

  // 1b. Hero kicker text.
  const eyebrowRe = /<!-- store-eyebrow -->[\s\S]*?<!-- \/store-eyebrow -->/;
  if (eyebrowRe.test(html)) {
    html = html.replace(eyebrowRe, `<!-- store-eyebrow -->${eyebrow(app)}<!-- /store-eyebrow -->`);
  } else {
    html = html.replace(
      /(<span class="dot" aria-hidden="true"><\/span>\s*)(?:Available on the App Store|Coming to the App Store)/,
      `$1<!-- store-eyebrow -->${eyebrow(app)}<!-- /store-eyebrow -->`,
    );
  }

  // 2. stores.css link (after site.css).
  if (!html.includes('assets/css/stores.css')) {
    html = html.replace(/(<link rel="stylesheet" href="\.\.\/assets\/css\/site\.css\?v=\d+" \/>)/, `$1\n    <link rel="stylesheet" href="../assets/css/stores.css?v=${STORES_CSS_VERSION}" />`);
  } else {
    html = html.replace(/assets\/css\/stores\.css\?v=\d+/, `assets/css/stores.css?v=${STORES_CSS_VERSION}`);
  }

  // 3. Smart App Banner only while the App Store listing is live.
  html = html.replace(/\n\s*<meta name="apple-itunes-app"[^>]*>/g, '');
  if (app.ios?.status === 'live') {
    html = html.replace(/(<meta name="viewport"[^>]*>)/, `$1\n    <meta name="apple-itunes-app" content="app-id=${app.ios.id}" />`);
  }

  // 4. JSON-LD url -> a live listing, or this page.
  html = html.replace(/("url":\s*")https:\/\/(?:apps\.apple\.com|play\.google\.com)[^"]*(")/g, `$1${primaryUrl(app, slug)}$2`);

  // 5. Nothing may still point at a store listing that isn't live.
  const stale = [...html.matchAll(/https:\/\/apps\.apple\.com\/[^"'\s<]*id(\d+)/g)].map((m) => m[1]).filter((id) => !(app.ios?.status === 'live' && app.ios.id === id));
  if (stale.length) {
    console.error(`✗ ${slug}: still links App Store id(s) ${[...new Set(stale)].join(', ')} outside the generated buttons`);
    failures++;
  }

  if (html === before) {
    console.log(`= ${slug}: up to date`);
    continue;
  }
  const summary = ['ios', 'android'].filter((k) => app[k]).map((k) => `${k} ${app[k].status}`).join(', ');
  console.log(`${check ? '~' : '✓'} ${slug}: ${summary}${notes.length ? ` (${notes.join(', ')})` : ''}`);
  if (!check) writeFileSync(file, html);
}
process.exitCode = failures ? 1 : 0;
