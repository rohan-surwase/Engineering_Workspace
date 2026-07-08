/**
 * app.js — Engineer's Workspace homepage
 * Handles: theme persistence, card rendering from CALCULATORS data,
 * live search, category filtering, stats, and scroll reveals.
 * No frameworks, no build step, no external dependencies.
 */
(function () {
  "use strict";

  const THEME_KEY = "ew-theme";

  /* ---------------- Theme ---------------- */
  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    const darkBtn = document.getElementById("theme-dark-btn");
    const lightBtn = document.getElementById("theme-light-btn");
    if (darkBtn && lightBtn) {
      darkBtn.setAttribute("aria-pressed", String(theme === "dark"));
      lightBtn.setAttribute("aria-pressed", String(theme === "light"));
    }
  }

  function initTheme() {
    let saved = null;
    try { saved = localStorage.getItem(THEME_KEY); } catch (e) { /* storage unavailable */ }
    const preferLight = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
    const theme = saved || (preferLight ? "light" : "dark");
    applyTheme(theme);

    const darkBtn = document.getElementById("theme-dark-btn");
    const lightBtn = document.getElementById("theme-light-btn");
    if (darkBtn) darkBtn.addEventListener("click", () => setTheme("dark"));
    if (lightBtn) lightBtn.addEventListener("click", () => setTheme("light"));
  }

  function setTheme(theme) {
    applyTheme(theme);
    try { localStorage.setItem(THEME_KEY, theme); } catch (e) { /* storage unavailable */ }
  }

  /* ---------------- Card rendering ---------------- */
  function cardHTML(calc) {
    const badge = calc.featured
      ? '<span class="featured-badge">Featured</span>'
      : "";
    return `
      <article class="calc-card reveal" data-title="${escapeAttr(calc.title.toLowerCase())}" data-desc="${escapeAttr(calc.description.toLowerCase())}" data-category="${escapeAttr(calc.category)}">
        <div class="top-row">
          <div class="calc-icon" aria-hidden="true">${calc.icon}</div>
          ${badge}
        </div>
        <div>
          <h3>${escapeHTML(calc.title)}</h3>
          <p class="desc">${escapeHTML(calc.description)}</p>
        </div>
        <div class="bottom-row">
          <span class="cat-tag">${escapeHTML(calc.category)}</span>
          <a class="open-btn" href="${calc.file}">
            Open
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M7 17L17 7M9 7h8v8"/>
            </svg>
          </a>
        </div>
      </article>`;
  }

  function escapeHTML(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));
  }
  function escapeAttr(str) { return escapeHTML(str); }

  function renderCategories(calcs) {
    const cats = Array.from(new Set(calcs.map((c) => c.category))).sort();
    const wrap = document.getElementById("filter-chips");
    if (!wrap) return;
    const chips = ["All", ...cats];
    wrap.innerHTML = chips
      .map(
        (cat, i) =>
          `<button class="chip" data-cat="${escapeAttr(cat)}" aria-pressed="${i === 0}">${escapeHTML(cat)}</button>`
      )
      .join("");
  }

  function renderStats(calcs) {
    const total = document.getElementById("stat-total");
    const catCount = document.getElementById("stat-categories");
    const featuredCount = document.getElementById("stat-featured");
    if (total) total.textContent = String(calcs.length);
    if (catCount) catCount.textContent = String(new Set(calcs.map((c) => c.category)).size);
    if (featuredCount) featuredCount.textContent = String(calcs.filter((c) => c.featured).length);
  }

  function renderFeatured(calcs) {
    const wrap = document.getElementById("featured-grid");
    const section = document.getElementById("featured-section");
    if (!wrap || !section) return;
    const featured = calcs.filter((c) => c.featured);
    if (featured.length === 0) {
      section.style.display = "none";
      return;
    }
    wrap.innerHTML = featured.map(cardHTML).join("");
  }

  function renderAll(calcs) {
    const wrap = document.getElementById("all-grid");
    if (!wrap) return;
    if (calcs.length === 0) {
      wrap.innerHTML = '<div class="empty-state">NO RESULTS — adjust your search or filter.</div>';
      return;
    }
    wrap.innerHTML = calcs.map(cardHTML).join("");
    observeReveals();
  }

  /* ---------------- Search + filter ---------------- */
  let activeCategory = "All";
  let activeQuery = "";

  function applyFilters() {
    const q = activeQuery.trim().toLowerCase();
    const filtered = CALCULATORS.filter((c) => {
      const matchesCat = activeCategory === "All" || c.category === activeCategory;
      const matchesQuery =
        !q ||
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q);
      return matchesCat && matchesQuery;
    });
    renderAll(filtered);
    const countEl = document.getElementById("all-count");
    if (countEl) countEl.textContent = `${filtered.length} of ${CALCULATORS.length}`;
  }

  function initSearch() {
    const input = document.getElementById("search-input");
    if (!input) return;
    input.addEventListener("input", (e) => {
      activeQuery = e.target.value;
      applyFilters();
    });
  }

  function initFilters() {
    const wrap = document.getElementById("filter-chips");
    if (!wrap) return;
    wrap.addEventListener("click", (e) => {
      const btn = e.target.closest(".chip");
      if (!btn) return;
      activeCategory = btn.dataset.cat;
      wrap.querySelectorAll(".chip").forEach((c) =>
        c.setAttribute("aria-pressed", String(c === btn))
      );
      applyFilters();
    });
  }

  /* ---------------- Scroll reveal ---------------- */
  function observeReveals() {
    const els = document.querySelectorAll(".reveal:not(.in)");
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    els.forEach((el) => io.observe(el));
  }

  /* ---------------- Init ---------------- */
  document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    renderCategories(CALCULATORS);
    renderStats(CALCULATORS);
    renderFeatured(CALCULATORS);
    renderAll(CALCULATORS);
    initSearch();
    initFilters();
    observeReveals();

    const yearEl = document.getElementById("footer-year");
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());
  });
})();
