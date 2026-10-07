// Progressive enhancement: the full list renders without JS; this only filters it.
const q = document.getElementById("q");
const borough = document.getElementById("borough");
const category = document.getElementById("category");
const count = document.getElementById("count");
const empty = document.getElementById("empty");
const cards = [...document.querySelectorAll(".card")];
const sections = [...document.querySelectorAll("[data-section]")];

// Citywide/statewide/national services apply to every borough.
const WIDE = ["Citywide", "Statewide", "National"];

function apply() {
  const terms = q.value.toLowerCase().split(/\s+/).filter(Boolean);
  const b = borough.value;
  const c = category.value;
  let shown = 0;
  for (const el of cards) {
    const bs = el.dataset.boroughs.split("|");
    const ok =
      (!c || el.dataset.category === c) &&
      (!b || bs.includes(b) || bs.some((x) => WIDE.includes(x))) &&
      terms.every((t) => el.dataset.search.includes(t));
    el.hidden = !ok;
    if (ok) shown++;
  }
  for (const s of sections) s.hidden = !s.querySelector(".card:not([hidden])");
  empty.hidden = shown > 0;
  count.textContent = `${shown} of ${cards.length} resources`;

  const params = new URLSearchParams();
  if (q.value) params.set("q", q.value);
  if (b) params.set("borough", b);
  if (c) params.set("type", c);
  try {
    history.replaceState(null, "", params.size ? `?${params}` : location.pathname);
  } catch {}
}

// Restore filters from the URL so outreach workers can share filtered links.
const params = new URLSearchParams(location.search);
q.value = params.get("q") ?? "";
borough.value = params.get("borough") ?? "";
category.value = params.get("type") ?? "";

for (const el of [q, borough, category]) el.addEventListener("input", apply);
apply();
