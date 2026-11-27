import { readFileSync, writeFileSync, mkdirSync, cpSync, rmSync } from "node:fs";
import { BOROUGHS, CATEGORIES, type Category, type Resource } from "./types.ts";
import { site } from "./site.ts";

const root = new URL("..", import.meta.url);
const dist = new URL("dist/", root);

const resources: Resource[] = JSON.parse(
  readFileSync(new URL("src/data/resources.json", root), "utf8"),
);

// --- validation -----------------------------------------------------------

const errors: string[] = [];
const seen = new Set<string>();
for (const [i, r] of resources.entries()) {
  const where = `#${i} ${r.name ?? "(no name)"}`;
  if (!r.name) errors.push(`${where}: missing name`);
  if (seen.has(r.name)) errors.push(`${where}: duplicate name`);
  seen.add(r.name);
  if (!(r.category in CATEGORIES)) errors.push(`${where}: unknown category "${r.category}"`);
  for (const b of r.boroughs ?? []) {
    if (!BOROUGHS.includes(b)) errors.push(`${where}: unknown borough "${b}"`);
  }
  if (!r.boroughs?.length) errors.push(`${where}: no boroughs`);
  if (!/^https:\/\//.test(r.url)) errors.push(`${where}: url must be https`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(r.verified_on ?? "")) errors.push(`${where}: verified_on must be YYYY-MM-DD`);
}
if (errors.length) {
  console.error(`resources.json has ${errors.length} problem(s):\n  ${errors.join("\n  ")}`);
  process.exit(1);
}
if (process.argv.includes("--check")) {
  console.log(`resources.json OK (${resources.length} entries)`);
  process.exit(0);
}

// --- rendering ------------------------------------------------------------

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const telHref = (phone: string) => {
  const digits = phone.replace(/[^\d]/g, "");
  return digits.length <= 4 ? `tel:${digits}` : `tel:+${digits.length === 10 ? "1" + digits : digits}`;
};

const mapHref = (address: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

const card = (r: Resource) => `
<li class="card" data-category="${r.category}" data-boroughs="${esc(r.boroughs.join("|"))}"
    data-search="${esc([r.name, r.description, ...r.services, ...r.boroughs].join(" ").toLowerCase())}">
  <h3><a href="${esc(r.url)}" rel="noopener">${esc(r.name)}</a></h3>
  <p class="where">${r.boroughs.map(esc).join(" · ")}</p>
  <p>${esc(r.description)}</p>
  ${r.services.length ? `<ul class="tags">${r.services.map((s) => `<li>${esc(s)}</li>`).join("")}</ul>` : ""}
  <p class="actions">
    ${r.phone ? `<a class="btn" href="${telHref(r.phone)}">Call ${esc(r.phone)}</a>` : ""}
    ${r.address ? `<a class="btn" href="${mapHref(r.address)}" rel="noopener">Map: ${esc(r.address)}</a>` : ""}
    <a class="btn" href="${esc(r.url)}" rel="noopener">Website</a>
  </p>
  ${r.notes ? `<p class="note">${esc(r.notes)}</p>` : ""}
  <p class="verified">Last checked ${r.verified_on}</p>
</li>`;

const byCategory = Object.entries(CATEGORIES)
  .map(([key, label]) => ({
    key: key as Category,
    label,
    items: resources
      .filter((r) => r.category === key)
      .sort((a, b) => a.name.localeCompare(b.name)),
  }))
  .filter((c) => c.items.length);

const lastChecked = resources.map((r) => r.verified_on).sort().at(-1)!;

/** Absolute URL for a file in dist/. index.html maps to its directory, e.g. "/". */
const pageUrl = (file: string) => new URL(file.replace(/(^|\/)index\.html$/, "$1"), site.url + "/").href;

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(site.title)}</title>
<meta name="description" content="${esc(site.description)}">
<link rel="canonical" href="${pageUrl("index.html")}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Harm Reduction NYC">
<meta property="og:locale" content="en_US">
<meta property="og:title" content="${esc(site.title)}">
<meta property="og:description" content="${esc(site.description)}">
<meta property="og:url" content="${pageUrl("index.html")}">
<meta name="twitter:card" content="summary">
<script type="application/ld+json">${JSON.stringify({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Harm Reduction NYC",
  url: pageUrl("index.html"),
  description: site.description,
  publisher: { "@type": "Organization", name: site.orgName, url: site.orgUrl },
}).replace(/</g, "\\u003c")}</script>
<meta name="theme-color" content="#111111">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/styles.css">
</head>
<body>
<a class="skip" href="#directory">Skip to resources</a>

<aside class="emergency" aria-label="Emergency">
  <strong>Overdose? Call 911.</strong> Give naloxone, do rescue breaths, stay with them.
  New York's Good Samaritan law protects you and the person overdosing from most drug possession charges.
  <span class="lines">
    <a href="tel:988">988 crisis line</a>
    <a href="tel:+18004843731">Never Use Alone: 800-484-3731</a>
  </span>
</aside>

<header class="hero">
  <h1>harmreduction<span>nyc</span></h1>
  <p>${esc(site.tagline)}</p>
</header>

<main id="directory">
  <form class="filters" role="search" onsubmit="return false">
    <label>Search <input type="search" id="q" placeholder="naloxone, showers, Bronx, Spanish…" autocomplete="off"></label>
    <label>Borough
      <select id="borough">
        <option value="">All boroughs</option>
        ${BOROUGHS.slice(0, 5).map((b) => `<option>${b}</option>`).join("")}
      </select>
    </label>
    <label>Type
      <select id="category">
        <option value="">Everything</option>
        ${byCategory.map((c) => `<option value="${c.key}">${esc(c.label)}</option>`).join("")}
      </select>
    </label>
    <p id="count" aria-live="polite"></p>
  </form>

  <nav class="toc" aria-label="Categories">
    ${byCategory.map((c) => `<a href="#${c.key}">${esc(c.label)}</a>`).join("")}
  </nav>

  ${byCategory
    .map(
      (c) => `<section id="${c.key}" data-section="${c.key}">
    <h2>${esc(c.label)}</h2>
    <ul class="cards">${c.items.map(card).join("")}</ul>
  </section>`,
    )
    .join("\n")}
  <p id="empty" hidden>Nothing matches. Try fewer words, or call 311 / 988 for help finding services.</p>
</main>

<footer>
  <p>Something wrong, closed, or missing? <a href="${site.editUrl}">Tell us</a>. Services change often, so call ahead when you can.</p>
  <p>Directory last checked ${lastChecked}. Not medical advice. In an emergency, call 911.</p>
  <p>Maintained by <a href="${site.orgUrl}">${esc(site.orgName)}</a>. <a href="${site.donateUrl}">Support this work</a>.</p>
</footer>
<script src="/filter.js" defer></script>
</body>
</html>
`;

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });
cpSync(new URL("public/", root), dist, { recursive: true });

// Every HTML page the build emits. The sitemap is generated from this list, so a new page
// only needs adding here to be indexed.
const pages: { file: string; html: string; lastmod: string }[] = [
  { file: "index.html", html, lastmod: lastChecked },
];
for (const p of pages) writeFileSync(new URL(p.file, dist), p.html);

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((p) => `  <url><loc>${esc(pageUrl(p.file))}</loc><lastmod>${p.lastmod}</lastmod></url>`).join("\n")}
</urlset>
`;
writeFileSync(new URL("sitemap.xml", dist), sitemap);
writeFileSync(new URL("robots.txt", dist), `User-agent: *\nAllow: /\n\nSitemap: ${pageUrl("sitemap.xml")}\n`);

writeFileSync(new URL("resources.json", dist), JSON.stringify(resources, null, 2));
console.log(
  `Built dist/ with ${resources.length} resources in ${byCategory.length} categories, ${pages.length} page(s) in sitemap.xml`,
);
