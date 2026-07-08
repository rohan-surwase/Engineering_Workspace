# Engineer's Workspace

A modern, responsive Engineering Calculator Hub built with plain HTML, CSS,
and JavaScript. No frameworks, no build tools, no backend — deploys straight
to GitHub Pages.

## Live structure

```
engineers-workspace/
├── index.html                     Homepage — calculator hub
├── assets/
│   ├── css/style.css               Shared design tokens + homepage styles
│   └── js/
│       ├── app.js                  Homepage logic (search, filters, theme, stats)
│       └── calculators-data.js     Data source the homepage renders from
└── calculators/
    └── scientific.html             First calculator (fully standalone file)
```

## Running it locally

No build step needed. Either:
- Open `index.html` directly in a browser, or
- Serve the folder locally, e.g. `python3 -m http.server 8000`, then visit
  `http://localhost:8000`.

## Deploying to GitHub Pages

1. Push this folder to a GitHub repository.
2. In the repo settings, enable **Pages** → **Deploy from branch** → select
   your default branch and the `/ (root)` folder.
3. Your hub will be live at `https://<username>.github.io/<repo>/`.

## Theme

Light/dark theme is controlled by a `data-theme` attribute on `<html>` and
persisted in `localStorage` under the key `ew-theme`. Every page (homepage
and every calculator) reads/writes this same key, so the choice stays
consistent as you navigate the whole site.

## Adding a new calculator

Every calculator is **one self-contained HTML file** — its own `<style>`
and `<script>`, no external JS dependencies, works fully offline. This
keeps each calculator copy-paste-portable and easy to review in isolation.

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
4. Add a matching entry to `assets/js/calculators-data.js`:

   ```js
   {
     id: "ohms-law",
     title: "Ohm's Law Calculator",
     description: "Solve for voltage, current, resistance, or power instantly",
     category: "Electrical",
     icon: "⚡",
     featured: false,
     file: "calculators/ohms-law.html",
   }
   ```

That's the entire contract. The homepage grid, category filters, search,
and stats all read from that one array — no other file needs to change.

### Why the metadata block exists

The `CALCULATOR_INFO` comment inside each calculator file is the
authoritative source of truth for that calculator's metadata. Keeping it
inside the file (not just in `calculators-data.js`) means a future
generator script can scan every file in `/calculators`, parse each
`CALCULATOR_INFO` block, and **regenerate `calculators-data.js`
automatically** — so the array above never has to be hand-maintained once
that script exists. Until then, update both places by hand as shown.

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
