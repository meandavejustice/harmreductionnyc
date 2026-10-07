# harmreductionnyc.com

Live at **https://harmreductionnyc.com**.

A plain, fast directory of harm reduction resources in New York City, maintained by
[Don't Forget the Streets](https://dontforgetthestreets.com).

Built for someone on a cracked phone with one bar of signal: one HTML page, one CSS
file, ~1 KB of optional JS for filtering, no framework, no tracking. Everything renders
without JavaScript.

## Editing the list

All content lives in [`src/data/resources.json`](src/data/resources.json). Each entry:

| field | notes |
| --- | --- |
| `name` | Unique. |
| `category` | One of the keys in `src/types.ts` → `CATEGORIES`. |
| `boroughs` | Any of `Manhattan`, `Bronx`, `Brooklyn`, `Queens`, `Staten Island`, `Citywide`, `Statewide`, `National`. Citywide/statewide/national entries show under every borough filter. |
| `description` | One sentence, plain language, person-first ("people who use drugs", not "addicts"). |
| `url` | https only. Link the most specific page (locations/hours), not just a homepage. |
| `phone`, `address` | Only if confirmed on the org's own site. `null` is fine; multi-site orgs should be `null`. |
| `services` | Short tags. Searchable, so use words people actually type ("showers", "Spanish"). |
| `verified_from`, `verified_on` | Where and when you confirmed it. Bump `verified_on` whenever you re-check. |
| `confidence` | `high` = confirmed on a primary source; `medium` = secondary source, needs a call. |
| `notes` | Anything a visitor should know (merged orgs, appointment-only, etc). |

Volunteers who don't use git can edit the JSON right in GitHub's web editor; the
`check` step on the pull request catches typos.

## Commands

Requires Node 22.18+ (runs the TypeScript directly, no build tooling).

```sh
npm run check   # validate resources.json
npm run build   # write dist/
npm run dev     # build and serve dist/ locally
npm run links   # hit every URL and report dead ones
```

## Deploying

Hosted on GitHub Pages, like dontforgetthestreets.com. `.github/workflows/deploy.yml`
builds and publishes `dist/` on every push to `main`; `public/CNAME` sets the custom domain.

The domain is registered at Namecheap (DNS on Namecheap's `registrar-servers.com` nameservers).
DNS records for GitHub Pages (full steps in LAUNCH.md):

| Type | Name | Value |
| --- | --- | --- |
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| AAAA | @ | 2606:50c0:8000::153 |
| AAAA | @ | 2606:50c0:8001::153 |
| AAAA | @ | 2606:50c0:8002::153 |
| AAAA | @ | 2606:50c0:8003::153 |
| CNAME | www | meandavejustice.github.io |

A GitHub Action (`.github/workflows/check-links.yml`) re-checks every link on the
1st of each month and on any PR that touches the data, so closed services get caught.

## Ideas for later

- Spanish translation (`resources.es.json` + a second page).
- A printable one-page PDF per borough for tabling and outreach bags.
- Map view, once addresses are filled in for the single-site entries.
- Embed the "Running a harm reduction org" wiki under `/guide` if that project lands here.
