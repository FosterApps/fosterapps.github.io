# fosterapps.github.io — Site Maintenance Guide

Static HTML/CSS site for fosterapps.com. No build step — edit files directly, push to deploy.

> **SEO work (new pages, keywords, guides, sitemap, JSON-LD):** follow [`SEO_BIBLE.md`](SEO_BIBLE.md) — it is the complete playbook and per-app status log. This file covers mechanical asset/CSS maintenance only.

## Directory structure

```
/                        → index.html (homepage)
/<slug>/index.html       → per-app landing page
/<slug>/assets/          → icon.png + screen-1..5.jpg for that app
/<slug>/privacy/         → privacy policy page
/assets/css/site.css     → shared stylesheet (currently v5)
/assets/js/site.js       → shared JS (nav dropdown, parallax)
/planly/                 → external app, not in factory repo
```

---

## How to update an app's assets

### Source of truth
All factory apps live in `/Users/mattfoster/Source/my-apps/app-factory/`.

| Asset | Source path |
|-------|-------------|
| App icon | `apps/<slug>/assets/icon.png` |
| ASC screenshots (en-US) | `design/<slug>/export/en-US/iPhone 1-5.png` |
| ASC screenshots (stead uses `en`) | `design/stead/export/en/iPhone 1-5.png` |

**Never use:**
- `apps/<slug>/screenshots/simulator/` — raw simulator captures, no marketing frame
- `apps/<slug>/assets/screens/se*.png` — pre-frame source files
- `apps/<slug>/screenshots/*/scaffold.png` — Figma scaffolds, not final

### Icon update procedure
```bash
SITE="/Users/mattfoster/Source/my-apps/fosterapps.github.io"
FACTORY="/Users/mattfoster/Source/my-apps/app-factory/apps"
SLUG="stead"   # change per app

cp "$FACTORY/$SLUG/assets/icon.png" "$SITE/$SLUG/assets/icon.png"
sips -Z 256 "$SITE/$SLUG/assets/icon.png" --out "$SITE/$SLUG/assets/icon.png" > /dev/null
```
**Rule:** Copy raw first, then resize in-place to 256px. Never resize the factory source. Never copy and resize in one step (sips `-Z` on the source path will corrupt the factory file).

### Screenshot update procedure
```bash
SITE="/Users/mattfoster/Source/my-apps/fosterapps.github.io"
DESIGN="/Users/mattfoster/Source/my-apps/app-factory/design"
SLUG="stead"
LOCALE="en"   # most apps use "en-US"; stead uses "en"

for i in 1 2 3 4 5; do
  src="$DESIGN/$SLUG/export/$LOCALE/iPhone $i.png"
  dst="$SITE/$SLUG/assets/screen-$i.jpg"
  tmp="/tmp/ss_${SLUG}_${i}.png"
  cp "$src" "$tmp"
  sips -Z 630 "$tmp" --out "$tmp" > /dev/null 2>&1
  sips -s format jpeg -s formatOptions 82 "$tmp" --out "$dst" > /dev/null 2>&1
done
```
**Rule:** Always output as `screen-1.jpg` through `screen-5.jpg`. Never reference old `iPhone 1.png` / `iPhone%201.jpg` filenames in HTML. Target size: 30–60KB per image.

### Locale map
| Slug | Export locale folder |
|------|---------------------|
| headache | `en-US` |
| soniceject | `en-US` |
| qrgen | `en-US` |
| stead | `en` |
| planly | not a factory app |

---

## Adding a new app to the site

1. Create `/<slug>/` with `index.html`, `assets/`, `privacy/`
2. Copy app page structure from an existing sub-page (e.g. `headache/index.html`)
3. Update assets using procedures above
4. Add to `index.html`:
   - Nav dropdown: add `<li>` entry with icon + name + subtitle + arrow SVG
   - App grid: add `.app-card` entry
   - Hero screen strip: optionally add one `screen-1.jpg` to the 5-image strip
5. Update CSS/JS version query string if `site.css` or `site.js` changed: `?v=N`

---

## CSS/JS versioning

All sub-pages must reference the same version as `index.html`:
```html
<link rel="stylesheet" href="../assets/css/site.css?v=5" />
<script src="../assets/js/site.js?v=5"></script>
```
When `site.css` or `site.js` changes, bump `v=N` in **every** HTML file. Currently v5.

Sub-pages that use `<details>/<summary>` nav are outdated — the correct pattern is `<div class="nav-dropdown"><button ...>` driven by site.js.

---

## Hero screenshot strip

Located in `index.html` above the fold. Shows 5 screenshots with parallax + rotation.
- Use `screen-1.jpg` from each app's assets
- Do not repeat the same app twice
- Order: vary by color/theme for visual contrast
- Each image: `width="180"` attribute, `loading="eager"`

## App cards (homepage grid)

Cards intentionally show **no screenshot** — icon + name + category + description + "View app →" only. The hero strip handles the visual showcase. Adding screenshots to cards makes the grid repetitive when all apps have similar framed marketing shots.

---

## Image size targets

| Asset | Target size | Max |
|-------|-------------|-----|
| App icon (`icon.png`) | ~60–100KB | 200KB |
| Screenshot (`screen-N.jpg`) | ~30–60KB | 100KB |
| Hero strip images | same as screenshots | — |

Use `sips -Z 256` for icons, `sips -Z 630 + formatOptions 82 jpeg` for screenshots.
