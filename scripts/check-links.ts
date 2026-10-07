// Checks every resource URL and reports anything that isn't reachable.
// Run monthly (see .github/workflows/check-links.yml) so dead listings get caught.
import { readFileSync } from "node:fs";
import type { Resource } from "../src/types.ts";

const resources: Resource[] = JSON.parse(
  readFileSync(new URL("../src/data/resources.json", import.meta.url), "utf8"),
);

const check = async (r: Resource) => {
  try {
    const res = await fetch(r.url, {
      redirect: "follow",
      signal: AbortSignal.timeout(15_000),
      headers: { "user-agent": "harmreductionnyc.com link checker" },
    });
    return res.ok ? null : `${res.status}  ${r.name}  ${r.url}`;
  } catch (e) {
    return `ERR  ${r.name}  ${r.url}  (${(e as Error).message})`;
  }
};

const failures = (await Promise.all(resources.map(check))).filter(Boolean);
if (failures.length) {
  console.log(`${failures.length} of ${resources.length} links need a look:\n${failures.join("\n")}`);
  process.exit(1);
}
console.log(`All ${resources.length} links OK`);
