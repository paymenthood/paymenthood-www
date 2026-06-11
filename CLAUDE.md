# PaymentHood WWW — Claude Instructions

## Layout & Header Rules
- Use `header-secondary.html` for all pages except the home page.
- Use `header.html` only for the home page (`index.html`).
- Do not add a contact-us form in the bottom of the home page.
- No social media links in the footer.
- No "Schedule App demo" link in the footer.

## Styling Rules
- **Resolve every style in this order — never skip a tier:**
  1. **Bootstrap 5.2 utilities/components** (`vendor.bundle.css`) and **site master classes** (`style.css`). Grids → `row g-*` + `col-*` (never redeclare CSS grid/flex layouts); cards → `.card` (site-styled: white, 12px radius, responsive padding, soft shadow); pills → `.badge` (site-styled uppercase pill); spacing/flex → `m*/p*`, `d-flex`, `gap-*`, `align-self-*`; typography → `fs-*`, `fw-*`, `small`, `lh-1`; colors → site utilities `txt-*`/`bg-*` (e.g. `txt-blue-50`, `bg-blue-200`, `tc-light`).
  2. **Shared components** in `assets/css/components.css` — pieces reused by 2+ secondary pages. Hub-page set: `.card-lift` (hover-lift on `.card`), `.badge-*` platform colorways, `.check-list` (✓ list), `.icon-circle`/`.icon-circle-lg`/`.step-num`, `.link-arrow`. Product-page set (used by all `integrations/<slug>/` pages): `.product-hero` (+`.hero-badge`/`.hero-lead`/`.hero-stat-pill`/`.hero-visual-card`/`.logo-box`/`.payment-type-*`/`.provider-mini-*`), `.stats-bar`/`.stat-*`, `.section-eyebrow`, `.mw-narrow`, `.txt-white-soft`, `.feature-grid`/`.feat-card`(+icon colorways incl. `.navy`), `.ptype-card.onetime|.subscription`, `.use-case-list`(+`--grid`)/`.uc-icon`, `.how-step*`, `.providers-strip`/`.provider-logo-pill`, `.why-card`, `.checkout-screenshot-wrap`, `.faq-*` (JS: `assets/js/product-page.js`), `.cta-banner`, `.install-hero` (+`.logo-wrap`/`.install-hero-logo`), `.screenshot-container--bare`. Product components are themed per page via custom properties set on `#main-content` in the page CSS: `--pp-accent`, `--pp-accent-rgb`, `--pp-hero-end`, `--pp-blob-rgb` (all default to the blue theme — pages on the default theme set nothing). Promote a rule from page CSS to here the moment a second page needs it; never copy it. The home page (`index.html`) does **not** load `components.css` — leave its markup and styles as they are.
  3. **Page CSS** (`assets/css/<page-name>.css`) — last resort, only for what the above cannot express: pseudo-elements unique to one page, image-sizing quirks, exact pixel dimensions, one-off overrides of global element styles.
- **Never modify** `assets/css/style.css`, `assets/css/vendor.bundle.css`, `assets/css/theme.css`, `_includes/header.html`, `_includes/header-secondary.html`, or `_includes/footer.html`.
- Follow the page layout and structure already established in `index.html`.

## Integration (Plugin) Page Structure
- Integration pages live under `integrations/<slug>/` as `index.html`; the folder name **is** the URL slug (e.g. `integrations/phoca-cart/index.html` → `/integrations/phoca-cart/`). Use the URL slug for the folder, not the source stem (`phoca-cart`, not `phocacart`).
- The installation/download page is `integrations/<slug>/installation/index.html` → `/integrations/<slug>/installation/`.
- The hub is `integrations/index.html` → `/integrations/`.
- **No `permalink:` front matter** on these — the folder structure drives the URL. Keep `layout: none`, `title`, `description`, `nav_active: integrations`.
- Product and installation pages are standalone files built entirely from the shared product-page components in `components.css` (see Styling Rules tier 2).
- Redirects from old URLs use the **`jekyll-redirect-from`** plugin (works locally and on every host). Add `redirect_from: /old-path/` to the destination page's front matter; the plugin generates a redirect stub at the old URL. This is the single source of truth for redirects — do not also add `.htaccess`/`_redirects` rules for the same path (file-vs-redirect precedence on Netlify gets ambiguous).
- `jekyll-sitemap` auto-generates `/sitemap.xml` — do **not** hand-write one (a manual sitemap silently disables the plugin).

### New Integration Page Recipe (mandatory — never clone)
When adding a new `integrations/<slug>/` product or installation page:
1. Copy the **markup structure** of an existing page (`integrations/woocommerce/index.html` is the canonical product page; any `*/installation/index.html` for installs) and keep the shared class names exactly as they are — `product-hero`, `stats-bar`, `feat-card`, `ptype-card`, `faq-item`, `install-hero`, etc. **Never create page-prefixed copies of these components** (the old `woo-*`/`vm-*`/`phoca-*`/`j2c-*` clones cost ~480 duplicated CSS lines per page and were removed on purpose).
2. Create `assets/css/<slug>-product.css` containing **only**: the `--pp-*` theme overrides on `#main-content` (omit entirely for the default blue theme) and logo/screenshot sizing quirks. A near-empty (or absent) page CSS file is correct.
3. Per-integration **structured data lives in one file**, `_data/integrations/<slug>.yml`, with two keys — `software` (name, operating_system, download_url, optional version/release_notes) and `faqs` (a list of `q`/`a` pairs; answers may contain inline HTML). Two shared includes render the JSON-LD + markup from it, so **never hand-write a `SoftwareApplication`, `FAQPage`, or the FAQ accordion**:
   - `{% include software-application.html app=site.data.integrations.<slug>.software %}` — emits the `SoftwareApplication` JSON-LD (constants like the free-price offer/author baked in; `description` from `page.description`; `installUrl` derived from `page.url`). Put it once on the product page only — not on installation pages.
   - `{% include faq.html items=site.data.integrations.<slug>.faqs %}` — emits both the visible accordion (wired to the shared `assets/js/product-page.js` `toggleFaq`) and the `FAQPage` JSON-LD. Optional params: `eyebrow`, `bg`, `first_open`.
   - If the slug has a hyphen, dot-access fails in an include tag — assign first: `{% assign d = site.data.integrations["my-slug"] %}{% include software-application.html app=d.software %}` … `{% include faq.html items=d.faqs %}` (see `integrations/phoca-cart/index.html`).
4. Breadcrumb JSON-LD is generated from the page URL at build time — drop in `{% include breadcrumb.html %}` (typically right after the page's `SoftwareApplication` script) and never hand-write a `BreadcrumbList`. The include derives the trail from `page.url`; segment display names come from `_data/breadcrumb_labels.yml`, so add an entry there only for special casing (e.g. `whmcs: WHMCS`) — unmapped segments fall back to a capitalized slug. It assumes directory-style (trailing-slash) URLs and emits nothing on the home page.
5. If the new page needs a component variant that doesn't exist yet, add it to `components.css` as a modifier (like `.use-case-list--grid`, `.screenshot-container--bare`) — don't fork the component into page CSS.

## CSS for New Pages (Plugin Pattern)
When adding or optimizing a secondary page (non-home), follow this pattern:

1. **No inline `<style>` blocks or `style=""` attributes in page files.** Styles go to `assets/css/components.css` (shared) or a dedicated `assets/css/<page-name>.css` (page-only), per the Styling Rules order.
2. **Link placement:** immediately after `{% include header-secondary.html %}`, before `<main>` — `components.css` first, then the page CSS so it can override:
   ```html
   {% include header-secondary.html %}
   <link rel="stylesheet" href="{{ '/assets/css/components.css' | relative_url }}">
   <link rel="stylesheet" href="{{ '/assets/css/<page-name>.css' | relative_url }}">
   ```
3. **Only put genuinely page-specific rules** in the page CSS file. Replace everything that has an equivalent master class with the real utility/class (Bootstrap or site custom), and everything reusable with a `components.css` component. A page CSS file with only a handful of rules (or none) is the goal, not a smell.
4. **Page CSS file conventions** (mirror `assets/css/whmcs-product.css` / `virtuemart-product.css`):
   - Header banner comment: `/* ===…\n   filename.css  —  styles for page.html only\n   ===… */`
   - Section dividers: `/* ── Section Name ─────────────────────────────────────────── */`
   - 4-space indent; one property per line (flex-centering trios and single-declaration rules may be one-liners).
   - Use master palette vars (`var(--blue-200)`, `var(--blue-600)`, `var(--gray-200)`, `var(--blue-50)`, etc.) — never hardcode hex values that match an existing var.
   - No `@media` queries in page CSS files; use Bootstrap cols + auto-fit grids for responsiveness.
   - No new CSS custom properties defined in page files — consume what `:root` provides in `style.css`. Sole exception: overriding the documented `--pp-*` theme vars on `#main-content` to retheme the shared product components.
5. **Class naming:** kebab-case. The few genuinely page-specific classes in page CSS are prefixed per page (e.g. `integration-card-logo`) to avoid collisions; `components.css` classes use generic component names (`card-lift`, `check-list`, `product-hero`, `feat-card`). Do not page-prefix a class that exists (or should exist) in `components.css`.
6. **Watch for master-CSS name collisions** before naming a class — e.g. `.step-card` is owned by `style.css:8374` for install pages.
7. **Specificity:** when a rule must beat a global selector (e.g. `a:hover`), scope it under a parent class rather than using `!important`.

## Section / Markup Patterns (follow index.html)
- Section headings use the canonical block: `<div class="section-head [wide|wide-sm] [text-center]">` → `<span>` eyebrow → `<h2 class="txt-blue-600">` → `<p>`.
- Animations: `class="... animated" data-animate="fadeInUp" data-delay=".N"`. Section heads use delays `.1`/`.2`/`.3` for span/h2/p.
- Buttons: `<a class="vh-btn btn-* …"><span>Label</span><em class="ti ti-arrow-right ps-2"></em></a>`.
- Each secondary page already has an `<h1>` from `header-secondary.html` (`page.title`); section titles start at `<h2>`.
- Decorative overlays: `<div class="nk-ovm shape-y"></div>` / `shape-x-2` appended as last child of the section.
