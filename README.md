# Engineer's Workspace

A modern, responsive Engineering Calculator Hub built with plain HTML, CSS,
and JavaScript. No frameworks, no build tools, no backend — deploys straight
to GitHub Pages.

**One repo, one hub page, unlimited calculators.** Drop a new `.html` file
into `/calculators`, push — the hub page, filters, search, and stats update
themselves. No manifest file to maintain, no build step. (This mirrors the
same runtime-discovery pattern used in the Reading Room book library.)

## How it works

- `index.html` — the hub. On load it asks the GitHub API "what files are in
  `/calculators`?", then fetches each one and reads its `CALCULATOR_INFO`
  metadata comment to build a catalog card.
- `assets/js/workspace-core.js` — the shared brain. Talks to the GitHub API,
  parses each calculator's metadata, caches the result in `localStorage` for
  15 minutes so you're not hammering GitHub's API on every click.
- `assets/js/app.js` — hub page logic: renders cards from the discovered
  catalog, live search, category filters, stats, theme toggle, scroll
  reveals. Reads from `workspace-core.js`'s discovery, not a static array.
- `assets/css/style.css` — shared design tokens + hub page styles.
- `/calculators/*.html` — your actual calculator pages. Each one is a fully
  standalone file (its own `<style>` and `<script>`, no external JS
  dependencies) so it keeps working offline and stays copy-paste-portable —
  only the metadata comment at the top is read by the hub.

Because the catalog is discovered at runtime from the repo's file listing,
adding a calculator is genuinely just "add the file" — the site doesn't
need to be regenerated or edited anywhere else.

## Live structure

```
engineers-workspace/
├── index.html                       Homepage — calculator hub
├── assets/
│   ├── css/style.css                 Shared design tokens + homepage styles
│   └── js/
│       ├── workspace-core.js         GitHub discovery + CALCULATOR_INFO parsing + cache
│       └── app.js                    Homepage logic (render, search, filters, theme, stats)
└── calculators/
    └── scientific.html               First calculator (fully standalone file)
```

## One-time setup

Open `assets/js/workspace-core.js` and set these two lines near the top:

```js
githubUser: "YOUR_GITHUB_USERNAME",
githubRepo: "YOUR_REPO_NAME",
```

That's it. This only has to be done once for the whole repo. (Currently set
to `rohan-surwase` / `engineers-workspace` — update these if you rename the
repo or move it to a different account.)

Also make sure the repo is **public** (GitHub's file-listing API needs no
auth for public repos; a private repo would need a token, which isn't safe
to ship in client-side JS).

## Running it locally

No build step needed. Either:
- Open `index.html` directly in a browser — note the hub page needs network
  access to `api.github.com` to discover calculators, so it won't populate
  when opened as a bare `file://` path with no internet, or
- Serve the folder locally, e.g. `python3 -m http.server 8000`, then visit
  `http://localhost:8000`.

### Local testing on Android (Termux)

```
cd engineers-workspace
python -m http.server 8080
```

Then open `http://localhost:8080` in the browser.

## Deploying to GitHub Pages

1. Push this folder to a GitHub repository.
2. In the repo settings, enable **Pages** → **Deploy from branch** → select
   your default branch and the `/ (root)` folder.
3. Your hub will be live at `https://<username>.github.io/<repo>/`.

## Adding a new calculator (every time, going forward)

Every calculator is **one self-contained HTML file** — its own `<style>`
and `<script>`, no external JS dependencies, works fully offline. This
keeps each calculator copy-paste-portable and easy to review in isolation.
The hub never touches the calculator file itself at runtime beyond reading
its metadata comment.

**Steps:**

1. Copy `calculators/scientific.html` as a starting template (it already
   has the nav, theme toggle, back-to-home link, footer, and design tokens
   wired up).
2. Update the `CALCULATOR_INFO` metadata comment at the very top of the file:

   ```html
   <!-- CALCULATOR_INFO
   title: Ohm's Law Calculator
   description: Solve for voltage, current, resistance, or power instantly
   category: Electrical
   icon: ⚡
   featured: false
   -->
   ```

3. Replace the calculator UI markup and `<script>` logic with your own.
4. Save the file into `calculators/your-calculator-name.html`.
5. Push to GitHub.

Done. The hub page will pick it up (within 15 minutes if someone already
has a cached view — instantly for a fresh visitor), sorted alphabetically
by title, filed under the category you set, with search and stats updated
automatically. **No other file needs to change** — not `index.html`, not
`app.js`, not any manifest.

### CALCULATOR_INFO field reference

| Field | Required | Notes |
|---|---|---|
| `title` | Yes | Shown on the card and used for A–Z sort order. |
| `description` | No | Shown on the card under the title. |
| `category` | No | Used for the filter chips. Defaults to `General`. |
| `icon` | No | Any emoji or short glyph. Defaults to 🧮. |
| `featured` | No | `true` to show in the Featured section. Defaults to `false`. |

A calculator file with no `CALCULATOR_INFO` block (or missing `title`) is
silently skipped by the discovery step — it simply won't appear on the hub,
so it's safe to keep works-in-progress in `/calculators` before they're ready.

## Notes on the GitHub API and rate limits

Unauthenticated requests to the GitHub API are capped at 60 requests/hour
per IP address. Discovering N calculators costs 1 request for the file
listing + N requests (one per calculator, to read its metadata comment),
and the 15-minute cache in `localStorage` means a single visitor won't come
close to the limit in normal browsing. If you ever hit the limit anyway
(e.g. testing repeatedly from the same network), the hub page shows a
"Try again" link, or you can just wait a bit.

## Theme

Light/dark theme is controlled by a `data-theme` attribute on `<html>` and
persisted in `localStorage` under the key `ew-theme`. Every page (homepage
and every calculator) reads/writes this same key, so the choice stays
consistent as you navigate the whole site.

## Design language

The visual identity is drawn from technical drawings and drafting tools:
a faint blueprint grid-paper background, a "title block" stats panel
styled after the info box on an engineering drawing, and registration-mark
corners on cards (like alignment ticks on a technical print). Typography
is IBM Plex Sans (display/body) paired with IBM Plex Mono (data, labels,
the calculator keypad) — a typeface family designed for technical/engineering
contexts.

## Scientific calculator notes

- Expression-based input with real parenthesis support, implicit
  multiplication (`2π` → `2 × π`), and a hand-written recursive-descent
  parser (no `eval()`).
- DEG/RAD toggle for trig functions; a `2nd` shift key reveals inverse
  trig and alternate power functions to keep the keypad compact.
- Memory (MC/MR/M+/M−), calculation history, and angle-mode preference
  persist in `localStorage` (`ew_scientific_state`) — cleared independently
  from the theme setting.
- Full keyboard support: digits, `+ - * / ^ %`, parentheses, `Enter`/`=`,
  `Backspace`, `Delete` (Clear Entry), `Escape` (Clear All).

## Migration note (for future reference)

This project previously used a hand-maintained `assets/js/calculators-data.js`
array as the single source of truth, with the `CALCULATOR_INFO` comment
in each file kept only as a duplicate for a *future* generator script. That
generator is now `workspace-core.js`: it reads `CALCULATOR_INFO` directly
from every file in `/calculators` at runtime via the GitHub API, the same
way the Reading Room discovers books from their `<title>`/`<meta>` tags.
`calculators-data.js` has been removed — it's no longer part of the load
order in `index.html` and there is nothing left to hand-edit when adding a
calculator.
