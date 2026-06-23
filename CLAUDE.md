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

## SEO & semantic HTML
**All SEO + semantic-HTML conventions live in [.docs/seo-and-semantic-html.md](.docs/seo-and-semantic-html.md) — read it before editing pages or the shared `header.html`/`footer.html`/`faq.html`/`integration-product.html`.** It is a **shared standard kept byte-identical with the `VpnHood.www` repo** (edit both copies together). It covers seo-tag/JSON-LD/sitemap/robots & site metadata, generated structured data (FAQPage/SoftwareApplication/BreadcrumbList from includes — never hand-written), favicons/app-icons/manifest, the heading outline (one H1, no skipped levels), title-tag branding, inline-SVG a11y, `<ul><li>` link groups, and announcing `target="_blank"` new-tab links. These are binding for any markup change.
- **Title rule (this site):** `{% seo %}` runs **without** `title=false`, so jekyll-seo-tag appends ` | PaymentHood` itself — page `title:` front matter must **not** contain the brand (it would render doubled). (VpnHood does the opposite via `title=false`; see the doc's §3 table.)

## Integration Pages (`integrations/…`)
- Layout: `integrations/<slug>/index.html` (product), `integrations/<slug>/installation/index.html` (install guide), `integrations/index.html` (hub). The folder name **is** the URL slug (`phoca-cart`, not `phocacart`).
- **All per-integration data lives in one file: `_data/integrations/<slug>.yml`** with three keys:
  - `product:` — drives the shared product template (see below): `platform`, `compat`, `download_url`, `repo`, `logo`, `checkout_image`, `ecosystem`, `install_path`, plus optionals (`noun`, `audience`, `compat_name`, `hero_title_html`, `store`, `supports_subscriptions`). The template's top comment documents each field.
  - `software:` — name, operating_system, download_url, optional version/release_notes.
  - `faqs:` — list of `q:`/`a:` pairs; inline HTML allowed in answers.
- **The entire product-page body is one shared template, `_includes/integration-product.html`.** A product page is just a thin stub: front matter (`layout: none`, `slug`, `redirect_from`, `nav_active: integrations`, `title`, `description`) → `{% include header-secondary.html %}` → `software-application.html` → `breadcrumb.html` → the `components.css` link → an inline `<style>` setting the `--pp-*` theme vars on `#main-content` → `{% include integration-product.html slug=page.slug %}` → `footer.html` (see `integrations/woocommerce/index.html`). **To change product-page copy or structure, edit the template, not the stubs** — the template renders the hero, all sections, the providers strip, and the FAQ for every plugin. Never hand-write product markup per page.
- Shared includes generate all structured data — **never hand-write `SoftwareApplication`/`FAQPage`/`BreadcrumbList` JSON-LD or FAQ accordion markup**:
  - `{% include software-application.html app=site.data.integrations.<slug>.software %}` — product stub only, never on install pages (one canonical software listing per plugin).
  - `{% include faq.html items=… %}` — rendered **inside** `integration-product.html`; emits the accordion **and** the FAQPage schema. Optional params: `eyebrow`, `bg`, `first_open`.
  - `{% include breadcrumb.html %}` — on every integration page; derives the trail from `page.url`. Segment labels come from `_data/breadcrumb_labels.yml` — add an entry only for special casing (e.g. `whmcs: WHMCS`); unmapped segments fall back to a capitalized slug.
  - Hyphenated slugs break dot-access inside include tags — assign first: `{% assign d = site.data.integrations["phoca-cart"] %}` then `app=d.software` (see `integrations/phoca-cart/index.html`).
- **Installation pages are still standalone hand-written files** (the shared template is product-only). New install page = copy an existing `*/installation/index.html`, keep the shared class names exactly (`install-hero`, `step-card`, …), link `components.css`, and add `{% include breadcrumb.html %}`. Never create page-prefixed clones of shared components.
- Exactly **one `<h1>` per page** — it's the visible page title from `header-secondary.html`. Hero/in-content headings are `<h2>` (keep a size class like `h1`/`display-4` so the visual size is unchanged).

## CSS Rules
**Core principle: one unified class vocabulary across the whole site.** Always reach for Bootstrap utilities and existing site/master classes before writing any CSS; the same visual pattern must use the same class on every page (never a per-page re-implementation or near-duplicate). New CSS is a last resort, only for what no existing class can express.

**All site CSS is authored as SCSS** and compiled by Jekyll (jekyll-sass-converter / Dart Sass). The compiled URLs are unchanged — `<link>` tags still point at `/assets/css/<name>.css`:
- Entry files live in `assets/css/*.scss` (front matter required, two `---` lines). `style.scss` and `components.scss` are thin `@use` lists; **cascade order of the `@use` lines is intentional — never re-sort them.** Page stylesheets (`providers.scss`, `integrations.scss`) hold their rules inline.
- `assets/css/style.scss` → partials in **`_sass/theme/`** (palette, fonts, base, utilities, buttons, typography, forms, preloader, accordion, blocks, plugin-pages, header, menu, sections, overrides, extras, integrations-menu). This is the master theme, loaded by `header.html` on every page. `_overrides.scss` and later partials are deliberately late-cascade — site-specific rules that beat the theme.
- `assets/css/components.scss` → partials in **`_sass/components/`** (shared, product-hero, product-sections, faq, cta, install).
- `assets/css/vendor.bundle.scss` → **`_sass/vendor/`**: `_bootstrap-overrides.scss` (the theme's Bootstrap variables — the ONLY place to customize Bootstrap) → `bootstrap/` (official Bootstrap v5.2.2 Sass source, **unmodified — never edit**) → `_icocrypto-vendor-pack.scss` (Font Awesome, select2, Magnific, Owl, icon fonts, animate — verbatim vendored CSS, **never edit**). Note the theme's custom grid: extra `mb: 410px` breakpoint, `xxl` at 1600px, 30px gutters, spacers `6`/`gs`.
- Never create a plain `.css` file in `assets/css/` whose name collides with a `.scss` entry, and never edit anything under `_site/` (build output).
- The theme partials were extracted from the old 11,800-line ICOCrypto `style.css` with all verifiably-unused rules removed (verified against a site-wide class census). Repeated selectors with different bodies inside a partial are intentional cascade overrides — keep their order.

Resolve every style in this order — never skip a tier:
1. **Bootstrap 5.2 + master classes** (`vendor.bundle.css`, `_sass/theme/`): grids `row g-*`/`col-*`, spacing `m*/p*`/`gap-*`/`d-flex`, typography `fs-*`/`fw-*`, colors `txt-*`/`bg-*` (e.g. `txt-blue-50`, `bg-blue-200`), `.card`, `.badge`.
2. **`_sass/components/`** (compiled into `components.css`) — anything reused by 2+ secondary pages (browse the partials for the inventory: product-hero set, stats-bar, feat-card, faq, install-hero, cta-banner, …). Product components are themed per page via `--pp-accent`, `--pp-accent-rgb`, `--pp-hero-end`, `--pp-blob-rgb` set on `#main-content` (defaults = blue). Promote a rule here the moment a second page needs it; add variants as modifiers (`.use-case-list--grid`), never fork into page CSS.
3. **Page SCSS** (`assets/css/<page>.scss`) — last resort: `--pp-*` overrides, unique pseudo-elements, sizing quirks.

Conventions:
- **No inline `<style>` blocks or `style=""` attributes** in new or refactored pages. Sole sanctioned exception: the one-line `<style>` on a product-page stub that sets the `--pp-*` theme vars on `#main-content` (this replaced the old per-slug `assets/css/<slug>-product.css` files).
- kebab-case class names; page-specific classes are page-prefixed, component classes are generic. Grep `_sass/` for collisions before naming (e.g. `.step-card` is taken).
- Use palette vars (`var(--blue-200)`, `var(--gray-200)`, …, defined in `_sass/theme/_palette.scss`) — never hardcode a hex that matches a var. No `@media` in page SCSS (use Bootstrap cols + auto-fit grids). No new custom properties except the documented `--pp-*` overrides. Beat a global selector by scoping under a parent class, not `!important`.
- SCSS style: `//` comments; nest only states/children that sit directly with their parent (`&:hover`, `img`); keep rules flat when other rules interleave — nesting must never change emitted rule order. No SCSS variables/mixins/`@extend` — the palette is CSS custom properties.
- Bootstrap customization goes in `_sass/vendor/_bootstrap-overrides.scss` (variables only) — never in `_sass/vendor/bootstrap/` or the vendor pack. `_sass/theme/` is the master theme and the header/footer includes are shared by every page — editable, but changes there affect the whole site, so make them deliberate and global in intent.

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
