/**
 * workspace-core.js — Engineer's Workspace catalog discovery
 * ----------------------------------------------------------------------
 * This is the shared brain, modeled directly on the Reading Room's
 * `library-core.js`. It talks to the GitHub API, discovers every
 * calculator that exists in /calculators at runtime, and parses each
 * file's CALCULATOR_INFO comment block to build the catalog.
 *
 * There is no manifest file to hand-maintain. Drop a new .html file
 * into /calculators with a CALCULATOR_INFO block at the top, push, and
 * the homepage picks it up automatically (immediately for a fresh
 * visitor, within CACHE_MINUTES for a cached one).
 * ----------------------------------------------------------------------
 */
window.EW = window.EW || {};

(function () {
  "use strict";

  // ---- One-time setup: set these two lines for your own repo ----------
  const config = {
    githubUser: "rohan-surwase",
    githubRepo: "engineers-workspace",
    calculatorsPath: "calculators",
    cacheKey: "ew-catalog-cache-v1",
    cacheMinutes: 15,
  };

  /**
   * Parses a CALCULATOR_INFO metadata comment out of a calculator file's
   * raw HTML, e.g.:
   *
   *   <!-- CALCULATOR_INFO
   *   title: Ohm's Law Calculator
   *   description: Solve for voltage, current, resistance, or power
   *   category: Electrical
   *   icon: ⚡
   *   featured: false
   *   -->
   */
  function parseInfoBlock(html) {
    const match = html.match(/<!--\s*CALCULATOR_INFO([\s\S]*?)-->/i);
    if (!match) return null;

    const fields = {};
    match[1].split("\n").forEach((line) => {
      const m = line.match(/^\s*([a-zA-Z_]+)\s*:\s*(.*?)\s*$/);
      if (m && m[2] !== "") fields[m[1].toLowerCase()] = m[2];
    });

    if (!fields.title) return null; // title is the only required field

    return {
      title: fields.title,
      description: fields.description || "",
      category: fields.category || "General",
      icon: fields.icon || "🧮",
      featured: String(fields.featured).toLowerCase() === "true",
    };
  }

  function idFromFilename(name) {
    return name.replace(/\.html$/i, "");
  }

  async function fetchCalculatorFileList() {
    const url = `https://api.github.com/repos/${config.githubUser}/${config.githubRepo}/contents/${config.calculatorsPath}`;
    const res = await fetch(url, { headers: { Accept: "application/vnd.github+json" } });
    if (!res.ok) {
      throw new Error(`GitHub API returned ${res.status} for ${url}`);
    }
    const list = await res.json();
    if (!Array.isArray(list)) {
      throw new Error("Unexpected GitHub API response — check githubUser/githubRepo.");
    }
    return list.filter((f) => f.type === "file" && /\.html$/i.test(f.name));
  }

  async function fetchOneCalculator(fileEntry) {
    const res = await fetch(fileEntry.download_url);
    if (!res.ok) throw new Error(`Could not fetch ${fileEntry.name}`);
    const html = await res.text();
    const info = parseInfoBlock(html);
    if (!info) return null; // file exists but has no CALCULATOR_INFO block — skip it
    return {
      id: idFromFilename(fileEntry.name),
      file: `${config.calculatorsPath}/${fileEntry.name}`,
      ...info,
    };
  }

  function readCache() {
    try {
      const raw = localStorage.getItem(config.cacheKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (Date.now() - parsed.time > config.cacheMinutes * 60 * 1000) return null;
      return parsed.data;
    } catch (e) {
      return null; // storage unavailable or corrupted cache — fall through to a live fetch
    }
  }

  function writeCache(data) {
    try {
      localStorage.setItem(config.cacheKey, JSON.stringify({ time: Date.now(), data }));
    } catch (e) {
      /* storage unavailable — not fatal, just no caching this session */
    }
  }

  /**
   * Discovers every calculator in the repo and returns a promise that
   * resolves to the CALCULATORS array the homepage renders from.
   * Pass `forceRefresh: true` to bypass the cache (used by the
   * homepage's "Try again" link).
   */
  async function discoverCalculators(opts) {
    const forceRefresh = !!(opts && opts.forceRefresh);

    if (!forceRefresh) {
      const cached = readCache();
      if (cached) return cached;
    }

    const files = await fetchCalculatorFileList();
    const settled = await Promise.all(
      files.map((f) => fetchOneCalculator(f).catch(() => null))
    );
    const calculators = settled.filter(Boolean);
    calculators.sort((a, b) => a.title.localeCompare(b.title));

    writeCache(calculators);
    return calculators;
  }

  window.EW.config = config;
  window.EW.getCalculators = discoverCalculators;
})();
