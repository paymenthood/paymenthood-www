# PaymentHood WWW — Project Instructions

Marketing site for PaymentHood (payment orchestration platform). Static Jekyll site: every page is a standalone HTML file with front matter (`layout: none` — no Jekyll layouts) that includes a shared header/footer.

## Build & Deploy
- Jekyll 4.x pinned via `Gemfile`. Local build: `bundle exec jekyll build` (output `_site/`, gitignored).
- **Pushing `main` deploys production.** `.github/workflows/jekyll.yml` builds and publishes to GitHub Pages (`build_type=workflow`); served at https://www.paymenthood.com behind Cloudflare (Cloudflare handles the http→https redirect). Never switch Pages back to the legacy branch builder — it runs Jekyll 3.9, not our pinned version.
- Plugins (wired in `_config.yml`):
  - `jekyll-seo-tag` — `{% seo %}` in the headers emits title/canonical/OG/Twitter tags. Page `title:` must **not** end in “| PaymentHood” (the tag appends the site name itself).
  - `jekyll-sitemap` — auto-generates `/sitemap.xml`; never hand-write one (a manual file silently disables the plugin).
  - `jekyll-redirect-from` — `redirect_from: /old-path/` front matter is the **only** redirect mechanism; no `.htaccess`/`_redirects` duplicates.
- Utility pages (`404.html`, `thank-you.html`) carry `sitemap: false` + `noindex: true`.

## Page Anatomy
- Home (`index.html`) uses `{% include header.html %}`. **Every other page** uses `{% include header-secondary.html %}`, which renders `page.title` as the visible `<h1>` — so titles must read well as a heading, and section titles start at `<h2>`.
- Front matter: `layout: none`, `title`, `description`, `nav_active` (`home|integrations|pricing|providers`). **No `permalink:`** — the folder path is the URL.
- Stylesheet links go immediately after the header include, before `<main>`: `components.css` first, then the page CSS so it can override.

## Integration Pages (`integrations/…`)
- Layout: `integrations/<slug>/index.html` (product), `integrations/<slug>/installation/index.html` (install guide), `integrations/index.html` (hub). The folder name **is** the URL slug (`phoca-cart`, not `phocacart`).
- **All per-integration data lives in one file: `_data/integrations/<slug>.yml`** with two keys — `software:` (name, operating_system, download_url, optional version/release_notes) and `faqs:` (list of `q:`/`a:` pairs; inline HTML allowed in answers). Shared includes generate everything from it — **never hand-write `SoftwareApplication`/`FAQPage`/`BreadcrumbList` JSON-LD or FAQ accordion markup**:
  - `{% include software-application.html app=site.data.integrations.<slug>.software %}` — product page only, never on install pages (one canonical software listing per plugin).
  - `{% include faq.html items=site.data.integrations.<slug>.faqs %}` — renders the accordion **and** the FAQPage schema. Optional params: `eyebrow`, `bg`, `first_open`.
  - `{% include breadcrumb.html %}` — on every integration page; derives the trail from `page.url`. Segment labels come from `_data/breadcrumb_labels.yml` — add an entry only for special casing (e.g. `whmcs: WHMCS`); unmapped segments fall back to a capitalized slug.
  - Hyphenated slugs break dot-access inside include tags — assign first: `{% assign d = site.data.integrations["phoca-cart"] %}` then `app=d.software` / `items=d.faqs` (see `integrations/phoca-cart/index.html`).
- New page = copy the **markup structure** of the canonical page (`integrations/woocommerce/index.html`; any `*/installation/index.html` for installs) and keep the shared class names exactly (`product-hero`, `stats-bar`, `feat-card`, `ptype-card`, `install-hero`, …). Never create page-prefixed clones of shared components (the old `woo-*`/`vm-*` clones cost ~480 duplicated lines per page and were removed deliberately).
- Page CSS `assets/css/<slug>-product.css` contains **only** the `--pp-*` theme overrides and logo/screenshot sizing quirks; near-empty (or absent, for the default blue theme) is correct.

## CSS Rules
**Core principle: one unified class vocabulary across the whole site.** Always reach for Bootstrap utilities and existing site/master classes before writing any CSS; the same visual pattern must use the same class on every page (never a per-page re-implementation or near-duplicate). New CSS is a last resort, only for what no existing class can express.

Resolve every style in this order — never skip a tier:
1. **Bootstrap 5.2 + master classes** (`vendor.bundle.css`, `style.css`): grids `row g-*`/`col-*`, spacing `m*/p*`/`gap-*`/`d-flex`, typography `fs-*`/`fw-*`, colors `txt-*`/`bg-*` (e.g. `txt-blue-50`, `bg-blue-200`), `.card`, `.badge`.
2. **`assets/css/components.css`** — anything reused by 2+ secondary pages (browse the file for the inventory: product-hero set, stats-bar, feat-card, faq, install-hero, cta-banner, …). Product components are themed per page via `--pp-accent`, `--pp-accent-rgb`, `--pp-hero-end`, `--pp-blob-rgb` set on `#main-content` (defaults = blue). Promote a rule here the moment a second page needs it; add variants as modifiers (`.use-case-list--grid`), never fork into page CSS.
3. **Page CSS** (`assets/css/<page>.css`) — last resort: `--pp-*` overrides, unique pseudo-elements, sizing quirks.

Conventions:
- **No inline `<style>` blocks or `style=""` attributes** in new or refactored pages.
- kebab-case class names; page-specific classes are page-prefixed, component classes are generic. Check `style.css` for collisions before naming (e.g. `.step-card` is taken).
- Use palette vars (`var(--blue-200)`, `var(--gray-200)`, …) — never hardcode a hex that matches a var. No `@media` in page CSS (use Bootstrap cols + auto-fit grids). No new custom properties except the documented `--pp-*` overrides. Beat a global selector by scoping under a parent class, not `!important`.
- `vendor.bundle*.css` is vendored Bootstrap — don't hand-edit it. `style.css`/`theme.css` are the master theme and the header/footer includes are shared by every page — editable, but changes there affect the whole site, so make them deliberate and global in intent.

## Markup Patterns (follow index.html)
- Section head: `<div class="section-head [wide|wide-sm] [text-center]">` → `<span>` eyebrow → `<h2 class="txt-blue-600">` → `<p>`.
- Animations: `animated` + `data-animate="fadeInUp"` + `data-delay=".N"` (section heads use `.1`/`.2`/`.3`).
- Buttons: `<a class="vh-btn btn-* …"><span>Label</span><em class="ti ti-arrow-right ps-2"></em></a>`.
- Decorative overlays: `<div class="nk-ovm shape-y"></div>` / `shape-x-2` as the last child of a section.

## Fixed Design Decisions (don't revisit)
- No contact-us form at the bottom of the home page.
- Footer: no social-media links, no “Schedule App demo” link.
- The home page does **not** load `components.css` — leave its markup and styles as they are.

## Gotchas
- Liquid parses `{% %}` tags even inside `{% comment %}` blocks — never put example include tags in comments.
- Local builds render absolute URLs as `http://localhost:4000`; production builds use `site.url`. Don't "fix" localhost URLs seen in a local `_site`.
