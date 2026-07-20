# SEO Bible — fosterapps.com Playbook

> **Living document.** Add discoveries, update when strategies are validated or invalidated.
> **Last updated:** 2026-07-14
> **Cross-references:** [`CLAUDE.md`](CLAUDE.md) (site maintenance: assets, CSS versioning, image sizes), factory [`docs/playbooks/ASO_BIBLE.md`](../app-factory/docs/playbooks/ASO_BIBLE.md) (App Store keyword research — the sibling channel)
> **Source pattern:** Adam Lyttle's SEO-site strategy (landing + guides + FAQ pages per app) adapted to this static-HTML portfolio site.

---

## The Process (Start Here)

> **The site's one job: train Google on what each app deserves to rank for.**

When asked to "do SEO for `<slug>`" or "add `<slug>` to the site," work through this in order. Every step has a detailed section below.

1. **Classify the app** — full treatment, or hygiene-only? (See [App Tiers](#app-tiers-where-to-spend-effort))
2. **Keyword research** — reuse the app's ASO keyword set as seeds, then expand to web long-tails via Google autocomplete / People Also Ask. Target 5–10 long-tail queries. (See [Keyword Research](#keyword-research-for-web))
3. **Build/upgrade the landing page** — all required sections + all required head tags + JSON-LD. (See [Landing Page Spec](#landing-page-spec))
4. **Build guide pages** — one page per long-tail keyword, full-treatment apps only. (See [Guide Pages](#guide-pages-the-long-tail-machine))
5. **Calculator apps only:** embed a real working web calculator on the landing page. (See [Calculator Playbook](#the-web-calculator-playbook-highest-leverage))
6. **Update `sitemap.xml`** — every new page, every time. A page not in the sitemap may as well not exist. (See [Technical Checklist](#technical-seo-checklist))
7. **Submit in Google Search Console** — resubmit sitemap after any page additions.
8. **Log it** — update the [Per-App Status Log](#per-app-status-log) and set a GSC check-in reminder for +6 weeks.

---

## Core Philosophy

Web SEO is the **second distribution channel**, mirroring the ASO strategy exactly:

**Find search demand → Validate the SERP → Publish pages that answer it → Rank → Funnel to App Store**

- People searching Google for a problem your app solves won't type the app's name. They type the problem: *"how much asphalt do I need for my driveway."* The site's pages must be named after those exact queries — same "name the exact thing" mechanic as the ASO Bible's clone-and-niche playbook, just on Google instead of the App Store.
- **Short-tail keywords** ("qr code generator") are owned by giants. Never target them. **Long-tail queries** (specific questions, specific tasks) have low competition and higher intent — a visitor who searched the exact problem is far more likely to download.
- A pretty landing page alone does not rank. The ranking work happens in **guide pages and FAQ content** — each one a net cast for one specific query.
- fosterapps.com is an existing indexed domain — new pages skip the new-domain sandbox and can rank in weeks, not quarters. Every page shipped today compounds.

---

## App Tiers (Where to Spend Effort)

Not every app earns guide pages. Classify before building:

| Tier | Treatment | Which apps | Why |
|------|-----------|------------|-----|
| **A — Full** | Landing + web calculator + 5–8 guide pages + FAQ schema | asphalt, duct, gravel, future calculator apps | Calculator queries are heavily web-searched; a working web calculator is a genuinely rankable utility, not marketing copy |
| **B — Content** | Landing + 3–5 guide pages + FAQ schema | stead (evergreen home-maintenance questions), soniceject (1–2 guides max) | Infinite low-competition question long-tails that pivot naturally to the app |
| **C — Hygiene** | Landing page with full head tags + JSON-LD, in sitemap. No guides. | headache*, qrgen, phpusd, inrusd, milestone, planly | Either YMYL (health) where a no-author static site won't rank guides, or head terms owned by giants (xe.com, qr-code-generator.com) |

*headache: do the hygiene pass now; guide pages are a slower, lower-confidence bet due to Google's higher trust bar for health content (YMYL / E-E-A-T). Revisit only if GSC shows the landing page pulling impressions.

**Rule of thumb for new apps:** if the app was validated through the kw-hunt pipeline on a "task/quantity/measurement" keyword (calculators, converters, estimators), it's Tier A. If its value is answering recurring how-often/how-to questions, Tier B. If its web SERP is owned by 100k-review-equivalent domains, Tier C.

---

## Keyword Research (for Web)

Web SERP competition ≠ App Store competition. Redo validation per channel.

### Step 1 — Seed from ASO
Pull the app's existing keyword set (`apps/<slug>/metadata.json` in the factory repo, or Astro `get_app_keywords`). These are validated demand — use them as seeds only, not final targets.

### Step 2 — Expand to long-tails
For each seed, collect:
- **Google autocomplete:** type the seed + each letter a–z, note completions
- **People Also Ask** boxes on the seed's SERP — each PAA question is a candidate FAQ/guide page
- **"Related searches"** at the bottom of the SERP
- Question forms: `how much…`, `how often…`, `how to…`, `what size…`, `calculator for…`

Keep queries that are **full natural-language phrases** (4+ words), not head terms.

### Step 3 — SERP confirmation (the real signal, same as ASO)
Google each candidate and ask:
- **Who holds the top 5?** Forums (Reddit, DIY forums), thin content-farm pages, or old abandoned pages → **rankable, proceed.** Major brands/publishers with dedicated pages exactly matching the query → skip, try a variant.
- **Is there a featured snippet / AI overview?** If yes and it's sourced from a weak page, a better-structured answer can steal it.
- **Does the SERP show calculators/tools?** If people get tool-type results, a real embedded calculator page will outrank prose.

### Step 4 — Build the target set
- 5–10 long-tail queries per Tier A/B app
- Each query gets **exactly one page** (guide or FAQ entry). Never target one query with two pages (self-cannibalization) or two queries with one page (dilution).
- Log the chosen queries in the [Per-App Status Log](#per-app-status-log) so future sessions don't duplicate.

---

## Landing Page Spec

Path: `/<slug>/index.html`. Copy structure from the best existing sub-page, then verify every item below.

### Required sections (in order)
1. **Hero** — H1 contains the app name **+ primary keyword** (e.g. "Stead — Home Maintenance Tracker & Schedule"). One-sentence value prop. App Store download badge above the fold. This headline is what Google reads first and what visitors read first — it must work for both.
2. **Screenshots** — 3–5, from `assets/screen-1..5.jpg` (sourcing/size rules in [`CLAUDE.md`](CLAUDE.md)). Every `<img>` gets descriptive `alt` text containing a keyword naturally ("Asphalt tonnage calculator showing driveway estimate"), plus `width`/`height` attributes and `loading="lazy"` (except hero images).
3. **How it works** — 3–4 steps, plain language. Talks to Google and humans simultaneously: literally state what the app does using target vocabulary.
4. **[Tier A only] Embedded calculator** — see [Calculator Playbook](#the-web-calculator-playbook-highest-leverage).
5. **FAQ** — 4–8 questions. Each question is a real query people search (from Step 2 research), answered in 2–4 sentences. Questions that deserve depth get a "Learn more →" link to their guide page. Mark up with `FAQPage` JSON-LD.
6. **Guides teaser** — [Tier A/B] linked list of the guide pages. This is the internal-linking hub that passes authority to the long-tail pages.
7. **Reviews/social proof** — if the app has ratings worth showing, quote 1–3.
8. **Final CTA** — download badge again.
9. **Footer** — links to privacy, support (mailto), homepage, and sibling app pages (cross-links help the whole domain).

### Required `<head>` tags (every page, no exceptions)
```html
<title>App Name — Primary Keyword | FosterApps</title>          <!-- ≤60 chars ideal -->
<meta name="description" content="…" />                          <!-- 140–160 chars, contains primary keyword, ends with a reason to click -->
<link rel="canonical" href="https://fosterapps.com/<slug>/" />
<meta property="og:title" content="…" />
<meta property="og:description" content="…" />
<meta property="og:image" content="https://fosterapps.com/<slug>/assets/screen-1.jpg" />
<meta property="og:url" content="https://fosterapps.com/<slug>/" />
<meta property="og:type" content="website" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="viewport" content="width=device-width, initial-scale=1" />  <!-- should already exist -->
```

### Required JSON-LD (landing pages)
`SoftwareApplication` block, in a `<script type="application/ld+json">` in `<head>`:
```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Headache Journal: Migraine Log",
  "operatingSystem": "iOS",
  "applicationCategory": "HealthApplication",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
  "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.8", "ratingCount": "123" },
  "url": "https://apps.apple.com/app/id6748004128",
  "description": "…same as meta description…"
}
```
- `applicationCategory`: use the closest schema.org value (`HealthApplication`, `UtilitiesApplication`, `FinanceApplication`, `BusinessApplication`, `LifestyleApplication`).
- **Omit `aggregateRating` entirely if the app has < 5 real ratings** — never fabricate. Pull real numbers from ASC or Astro `get_app_ratings` and update when doing any page touch-up.
- `offers.price` is `"0"` — the app is free to download; IAP pricing doesn't go here.

FAQ section additionally gets a `FAQPage` block:
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "…exact question…",
      "acceptedAnswer": { "@type": "Answer", "text": "…the on-page answer text…" } }
  ]
}
```
The JSON-LD answers must match the visible on-page text — mismatches risk a manual action.

---

## Guide Pages (the Long-Tail Machine)

Path: `/<slug>/guides/<keyword-slug>/index.html` (e.g. `/asphalt/guides/how-much-asphalt-for-driveway/`). One page per target query.

### Structure (this order matters — answer first, pitch second)
1. **H1 = the query**, phrased as the searcher typed it ("How Much Asphalt Do I Need for a Driveway?")
2. **Direct answer in the first paragraph** — 2–3 sentences that fully answer the question. This is what wins featured snippets and AI-overview citations. Do not bury the answer under an intro.
3. **The detailed how-to** — steps, formula, worked example with real numbers, common mistakes. 600–1,200 words. Written for a human doing the task, not for a crawler: specific numbers, specific tools, specific edge cases. Thin filler pages hurt the whole domain.
4. **The app pivot** — "or skip the math:" one paragraph + screenshot + download badge showing how the app does this in seconds. Natural, not a hard sell — the reader already got their answer for free; that's what earns the click.
5. **Related guides** — link 2–3 sibling guide pages + the app landing page.

### Guide page requirements
- Full head-tag set (title = the query, ≤60 chars; meta description answers the query in one line)
- JSON-LD: `HowTo` schema for step-based guides, or `FAQPage` for question-answer pages. `Article` as fallback.
- Breadcrumb link back to `/<slug>/`
- Added to `sitemap.xml` and linked from the landing page's guides section (orphan pages don't rank)
- Reuses the shared stylesheet (`../../assets/css/site.css?v=N` — check current version in [`CLAUDE.md`](CLAUDE.md))

### Writing quality bar
Each guide must pass: *"Would this page be worth reading if the app didn't exist?"* If no, it's spam and Google will treat the domain accordingly. The free answer IS the marketing.

---

## The Web Calculator Playbook (Highest Leverage)

For Tier A apps, the landing page (or a dedicated `/…/calculator/` guide page) embeds a **fully working calculator**, not a screenshot of one.

- **Port the math from the factory:** the pure calculation logic lives in `packages/core/src/<slug>Calculator.ts` (e.g. `asphaltCalculator.ts` — 145 lb/ft³ density, quarter-ton rounding). Hand-port to vanilla JS inline in the page. No build step, no frameworks, no external scripts — this site is static HTML and must stay dependency-free.
- Inputs mirror the app's primary flow (length, width, depth → tons + cost). Results update live.
- Below the results: *"Save jobs, price materials, and estimate on-site with the free iPhone app"* + download badge. The calculator answers the query; the app offers persistence/mobility — a real reason to download after getting the free answer.
- Why this wins: for "X calculator" queries, Google prefers pages that ARE the tool. Tool pages earn organic backlinks (forums, Reddit answers) that pure marketing pages never get. Those links lift the entire domain, including every other app's pages.

---

## Technical SEO Checklist

### sitemap.xml (the perennial failure point — check every session)
- Lives at repo root, hand-maintained. **Every content page** (landing pages, guide pages) must have a `<loc>` entry. Privacy pages: include, low priority. 404: exclude.
- `<lastmod>` on entries you touch, `YYYY-MM-DD`.
- **Regeneration procedure:** `find . -name "index.html" -not -path "./404*"` from the site root, diff against current sitemap, add what's missing.
- After any addition: resubmit in GSC (Search Console → Sitemaps → `https://fosterapps.com/sitemap.xml`).

### robots.txt
Must allow all + point to the sitemap:
```
User-agent: *
Allow: /
Sitemap: https://fosterapps.com/sitemap.xml
```

### Google Search Console (one-time + recurring)
- Property: `fosterapps.com` (domain property, verified). If not verified: DNS TXT record via the domain registrar.
- After creating pages: URL Inspection → Request Indexing on the 2–3 most important new URLs (faster than waiting for the sitemap crawl).
- Recurring: check **Performance → Queries** at 4–6 week intervals per the measurement cadence below.

### Page-level hygiene (every page)
- One `<h1>` per page; `<h2>` for sections — heading hierarchy is the content outline Google reads
- All images: `alt`, `width`, `height`, `loading="lazy"` below the fold; size targets per [`CLAUDE.md`](CLAUDE.md) (screenshots 30–60KB)
- No external JS/CSS dependencies; shared stylesheet with correct `?v=N` (bump procedure in [`CLAUDE.md`](CLAUDE.md))
- Internal links: every page reachable within 2 clicks of the homepage; guides link to landing, landing links to guides, footer cross-links sibling apps
- Mobile rendering sane (the shared CSS handles this; eyeball anything custom like calculators)

---

## Measurement & Timeline (Set Expectations, Then Check)

| When | What to check | Healthy signal |
|------|---------------|----------------|
| +1–2 weeks | GSC → Pages: are new URLs indexed? | Indexed (request indexing manually if not) |
| +4–8 weeks | GSC → Performance → Queries, filtered per page | Impressions appearing for target queries — **impressions are the first checkpoint, not clicks** |
| +2–4 months | Same | First clicks; long-tail positions 5–20 |
| +4–6 months | Same + App Store Connect "web referrer" sources | Meaningful traffic; positions 1–10 on low-competition long-tails |

**Rotation rule (same discipline as ASO):** if a guide page has zero impressions for its target query after 8–10 weeks, the query was mis-validated — rewrite the page against a variant query rather than writing net-new pages. If a page is getting impressions but no clicks, fix the title/meta description (that's a CTR problem, not a ranking problem).

**Strategic timing implication:** content ranks on a 2–4 month delay, so **build Tier A pages when the app is scaffolded, not when it ships.** A duct/calculator page published today supports a Q4 app launch.

---

## Per-App Status Log

*(Update this table whenever pages are added or GSC is checked.)*

| Slug | Tier | Landing | Head tags + JSON-LD | Guides | In sitemap | Notes |
|------|------|---------|--------------------|--------|-----------|-------|
| stead | B | ✅ live | ❌ no meta desc, no JSON-LD | ❌ none | ✅ | Live app; best Tier B candidate |
| headache | C* | ✅ live | ❌ | — | ❌ **missing** | Live app missing from sitemap — fix first |
| soniceject | B | ✅ live | ❌ | ❌ | ✅ | 1–2 guides max ("water out of iPhone speaker") |
| qrgen | C | ✅ live | ❌ | — | ✅ | Head terms owned by giants; hygiene only |
| milestone | C | ✅ live | ❌ | — | ❌ **missing** | |
| phpusd | C | ✅ live | ❌ | — | ❌ **missing** | Currency SERP = xe.com; hygiene only |
| planly | C | ✅ live | ❌ | — | ✅ | External app |
| duct | **A** | ✅ live (marketing only) | ❌ no meta desc*, no JSON-LD | ❌ none | ❌ **missing** | *og:/twitter: tags + description present, no JSON-LD/schema yet. Still needs: sitemap entry, web calculator, 5–8 guide pages, FAQ schema — landing page alone ≠ Tier A done |
| asphalt | **A** | ❌ not started | — | ❌ | ❌ | Build with calculator at scaffold-complete, before ship |
| gravel | **A** | ❌ not started | — | ❌ | ❌ | Same treatment when scaffolded |

### Known site-wide gaps (as of 2026-07-14 audit)
1. `sitemap.xml` lists only planly/stead/soniceject/qrgen — headache, milestone, phpusd missing
2. **Zero meta descriptions** on any app page
3. **Zero JSON-LD** anywhere (no SoftwareApplication, no FAQPage)
4. No FAQ or guide content exists yet on any page
5. GSC verification/submission status unconfirmed — verify at search.google.com/search-console before assuming pages are indexed

---

## Checklists

### New/upgraded landing page
```
LANDING PAGE CHECKLIST — /<slug>/
──────────────────────────────────
Head:
  [ ] <title> ≤60 chars: name + primary keyword
  [ ] meta description 140–160 chars w/ keyword
  [ ] canonical URL
  [ ] og:title/description/image/url + twitter:card
  [ ] SoftwareApplication JSON-LD (real rating data or omit rating)

Body:
  [ ] H1 = app name + primary keyword
  [ ] Download badge above the fold
  [ ] Screenshots w/ keyword-bearing alt text, width/height, lazy
  [ ] How-it-works section using target vocabulary
  [ ] FAQ section (4–8 real search queries) + FAQPage JSON-LD
  [ ] Tier A: working embedded calculator
  [ ] Tier A/B: guides section linking guide pages
  [ ] Footer: privacy, support, homepage, sibling apps

Plumbing:
  [ ] Assets follow CLAUDE.md sourcing + size rules
  [ ] Correct site.css ?v=N
  [ ] Added to sitemap.xml with lastmod
  [ ] Added to homepage nav dropdown + app grid (per CLAUDE.md)
  [ ] GSC: sitemap resubmitted, indexing requested
  [ ] Per-App Status Log updated
```

### New guide page
```
GUIDE PAGE CHECKLIST — /<slug>/guides/<kw-slug>/
──────────────────────────────────
  [ ] Target query validated (SERP check done, not already targeted by another page)
  [ ] H1 = the query as searched
  [ ] Direct answer in first paragraph (snippet bait)
  [ ] 600–1,200 words of genuinely useful how-to (passes "worth reading without the app?" test)
  [ ] App pivot section w/ screenshot + badge
  [ ] HowTo or FAQPage JSON-LD matching visible text
  [ ] Title/meta description/canonical/OG set
  [ ] Linked FROM the landing page guides section
  [ ] Links TO landing page + 2–3 sibling guides
  [ ] In sitemap.xml
  [ ] Query logged in Per-App Status Log
```

---

## Discoveries & Learnings Log

### 2026-07-14
- Playbook created from Adam Lyttle transcript ("This Fable 5 prompt builds an entire SEO website for your app") + full site audit.
- Audit found: stale sitemap (3 live apps missing), zero meta descriptions, zero structured data, no guide/FAQ content, duct has no landing page at all.
- Key strategic insight: for calculator apps, an embedded working web calculator beats the transcript's generic guide-page template — tool pages match query intent, earn backlinks, and mirror the factory's kw-hunt validation channel on a second surface.
- Tiering decision: currency (phpusd/inrusd) and qrgen are hygiene-only — their web SERPs are owned by xe.com-class incumbents, unlike their App Store SERPs. Web and App Store competition must be validated independently.
- headache classified C* (hygiene now, guides deferred): YMYL — Google holds health content on anonymous static sites to a higher E-E-A-T bar.
