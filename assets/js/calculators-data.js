/**
 * calculators-data.js
 * ------------------------------------------------------------------------
 * This file is the single source of truth the homepage reads to render
 * calculator cards, category filters, and stats.
 *
 * IMPORTANT — Auto-discovery contract:
 * Each entry here corresponds 1:1 to the CALCULATOR_INFO metadata comment
 * block at the top of a file inside /calculators/. A future generator
 * script can parse every calculators/*.html file for its CALCULATOR_INFO
 * block and regenerate the CALCULATORS array below automatically —
 * without ever touching index.html, style.css, or app.js.
 *
 * CALCULATOR_INFO block format (place at top of every calculator file):
 *
 *   <!-- CALCULATOR_INFO
 *   title: Scientific Calculator
 *   description: Advanced scientific calculator with scientific functions
 *   category: General
 *   icon: 🧮
 *   featured: true
 *   -->
 *
 * Field mapping:
 *   title        -> title
 *   description  -> description
 *   category     -> category
 *   icon         -> icon (any emoji or short glyph)
 *   featured     -> featured (true/false)
 *   file path    -> id + file (derived from the calculator's filename)
 *
 * To add a new calculator by hand (until the generator exists):
 *   1. Create calculators/your-calculator.html with a CALCULATOR_INFO block.
 *   2. Append a matching object to the CALCULATORS array below.
 * That's it — the homepage grid, filters, search, and stats update
 * automatically with no other changes required.
 * ------------------------------------------------------------------------
 */

const CALCULATORS = [
  {
    id: "scientific",
    title: "Scientific Calculator",
    description:
      "Advanced scientific calculator with trigonometric, logarithmic, memory, and history functions.",
    category: "General",
    icon: "🧮",
    featured: true,
    file: "calculators/scientific.html",
  },
];

// Expose for both classic <script> includes and future module use.
if (typeof module !== "undefined" && module.exports) {
  module.exports = CALCULATORS;
}
