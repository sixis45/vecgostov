# Deploying: GitHub + Cloudflare Pages

The repository is **`sixis45/vecgostov`** on GitHub. `main` is the production branch; Cloudflare builds and publishes it on every push, and gives every other branch and pull request its own preview URL. Nothing else publishes the site: no GitHub Actions, no Workers, no Functions.

## 1. GitHub

The repo already exists and is private. This work lives on the branch `claude/cool-darwin-4khc2j`; merge it into `main` when you are happy with it (a pull request on GitHub, or locally):

```bash
git clone https://github.com/sixis45/vecgostov.git
cd vecgostov
git checkout main
git merge claude/cool-darwin-4khc2j
git push origin main
```

What is committed: sources, `content/site.json`, the optimized images in `src/assets/img/`, fonts, the two Unsplash photos (under 1 MB together) and the illustrated stand-ins. What is not: `node_modules/`, `dist/`, `.wrangler/`, `.env*`, and `photos/originals/` (put big camera files there).

No secrets are needed anywhere: the site has no API keys, forms or tracking.

## 2. Cloudflare Pages (default: Git integration)

1. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** tab → **Connect to Git**.
   (If the Create screen opens on Workers, use the "Pages" tab or the "Looking to deploy Pages?" link.)
2. Authorise GitHub if asked, then select **sixis45/vecgostov** → **Begin setup**.
3. Settings:

   | Setting | Value |
   | --- | --- |
   | Project name | `vecgostov` (gives you `https://vecgostov.pages.dev`) |
   | Production branch | `main` |
   | Framework preset | None |
   | Build command | `npm run build` |
   | Build output directory | `dist` |
   | Root directory | *(leave empty)* |
   | Environment variables | `NODE_VERSION` = `22` *(optional; `.nvmrc` already says 22)* |

4. **Save and Deploy**. The first build takes about a minute (`npm clean-install`, then the build itself takes under a second).

After that:

- Push to `main` → live at `https://vecgostov.pages.dev`.
- Push any other branch or open a pull request → a preview URL like `https://<branch>.vecgostov.pages.dev`.
- `dist/_headers` (security headers, CSP, caching), `dist/_redirects` and `dist/404.html` are picked up automatically.

### If a build uses an old commit or nothing deploys

- **Banner "This project is disconnected from your Git account"**: GitHub isn't allowed to notify Cloudflare about this repository. On GitHub open **Settings → Applications → Installed GitHub Apps → Cloudflare Workers and Pages → Configure**, and under **Repository access** add `vecgostov` (or choose All repositories). Refresh the Pages project; the banner disappears.
- **"Retry deployment" rebuilds the same commit**, not the newest one. To build the latest `main`, push a new commit to `main` (merging a pull request counts).

### Fallback: manual deploy with Wrangler

Only if Git integration isn't an option:

```bash
npm run build
npx wrangler login                     # once, opens the browser
npx wrangler pages deploy dist --project-name vecgostov --branch main
```

To check the build locally with Cloudflare's own runtime (same headers, redirects and 404 handling as production):

```bash
npm run build && npx wrangler pages dev dist
```

## 3. Custom domain (later, nothing is configured yet)

`https://vecgostov.pages.dev` works right away for testing, before any domain exists.

**A subdomain of matejdoljak.com, e.g. `apartmaji.matejdoljak.com` (DNS stays at Namecheap).** In the Pages project open **Custom domains → Set up a custom domain**, enter the subdomain, and Cloudflare shows a CNAME target (`vecgostov.pages.dev`). Then at Namecheap: **Domain List → matejdoljak.com → Manage → Advanced DNS → Add new record → CNAME**, Host `apartmaji`, Value `vecgostov.pages.dev`, TTL Automatic. Add the domain in Cloudflare *first*, then the CNAME, otherwise the subdomain shows an error until verification. This only adds one new record; it leaves every existing record (and the main site on Netlify) untouched.

**A new, separate domain.** Option A, keep DNS at Namecheap: point `www` at `vecgostov.pages.dev` with a CNAME as above and use Namecheap's URL redirect for the bare domain → `https://www.…`. It is simple, but the bare domain is only a redirect. Option B, move the nameservers to Cloudflare: add the domain as a site in Cloudflare (Free plan), copy the two nameservers Cloudflare gives you into Namecheap under **Domain → Nameservers → Custom DNS**, wait for activation, then add the domain under the Pages project's Custom domains. Cloudflare then creates the DNS records and certificates itself, and both `example.si` and `www.example.si` can serve the site.

## 4. Once the domain is known: checklist

1. Put it in `content/site.json`: `"domain": "https://apartmaji.matejdoljak.com"` (no trailing slash). Rebuild and push. That single change turns on:
   - `<link rel="canonical">` on every page
   - `hreflang` alternates (sl, en, x-default)
   - `og:url` and an absolute `og:image` URL (social previews need it)
   - `sitemap.xml` and the `Sitemap:` line in `robots.txt`
2. Open the site on the domain and check a social preview (for example the Facebook Sharing Debugger).
3. Add the domain to Google Search Console and submit `https://<domain>/sitemap.xml`.
4. Put the website link in the Google Business Profile.
5. Optional: redirect `vecgostov.pages.dev` to the domain (Cloudflare **Rules → Redirect Rules**, or Bulk Redirects).

`robots.txt` is permissive until then and contains no absolute URLs.

## 5. Analytics (off by default)

No analytics, cookies or tracking are on the site. Cloudflare Web Analytics is cookieless and can be switched on later without code changes: Pages project → **Metrics → Web Analytics → Enable**. Because the site's Content-Security-Policy only allows its own files, also allow Cloudflare's beacon in `src/static/_headers`:

```
script-src 'self' https://static.cloudflareinsights.com; … connect-src 'self' https://cloudflareinsights.com;
```
