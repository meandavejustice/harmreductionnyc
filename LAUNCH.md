# Launching harmreductionnyc.com

## Where the domain lives

| | |
| --- | --- |
| Registrar | **Namecheap** (namecheap.com → Domain List → harmreductionnyc.com → Manage) |
| Nameservers | dns1/dns2.registrar-servers.com (Namecheap BasicDNS) |
| Registered | 2020-12-21 |
| Expires | **2026-12-21**. Check that auto-renew is on. |
| Points at now | 162.255.119.71, which is Namecheap's parking/redirect server |

Source: Verisign's RDAP record for the domain, checked 2026-10-07.

## 1. Create the repo

On github.com/new, create **meandavejustice/harmreductionnyc** as public and empty
(no README, license or .gitignore). Claude then pushes the site to it.

## 2. Turn on GitHub Pages

In the repo, go to Settings → Pages:
- Source: **GitHub Actions**
- Custom domain: `harmreductionnyc.com`. The `public/CNAME` file sets it too.

## 3. Point DNS at GitHub (Namecheap)

Go to Domain List → harmreductionnyc.com → **Manage** → **Advanced DNS** tab.

1. Under Host Records, delete the defaults: the `URL Redirect Record` on `@` and the
   `CNAME` for `www` → `parkingpage.namecheap.com`. Leave any MX/TXT email records.
2. Click **Add New Record** for each of these:

| Type | Host | Value | TTL |
| --- | --- | --- | --- |
| A Record | @ | 185.199.108.153 | Automatic |
| A Record | @ | 185.199.109.153 | Automatic |
| A Record | @ | 185.199.110.153 | Automatic |
| A Record | @ | 185.199.111.153 | Automatic |
| AAAA Record | @ | 2606:50c0:8000::153 | Automatic |
| AAAA Record | @ | 2606:50c0:8001::153 | Automatic |
| AAAA Record | @ | 2606:50c0:8002::153 | Automatic |
| AAAA Record | @ | 2606:50c0:8003::153 | Automatic |
| CNAME Record | www | meandavejustice.github.io. | Automatic |

3. Click the green checkmark to save each one.

## 4. Lock it down

- Once DNS resolves (usually under 30 minutes on Namecheap), tick **Enforce HTTPS** on the Pages settings page.
- Recommended: go to GitHub → your profile Settings → Pages → **Add a domain** and verify
  `harmreductionnyc.com`. GitHub gives you a TXT record (`_github-pages-challenge-meandavejustice`)
  to add in Advanced DNS. Verifying stops anyone else's repo from claiming the domain.

## Check it worked

```sh
dig +short harmreductionnyc.com        # the four 185.199.x.153 addresses
dig +short www.harmreductionnyc.com    # meandavejustice.github.io + the same IPs
```
