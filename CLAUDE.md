# PaymentHood WWW — Claude Instructions

## Layout & Header Rules
- Use `header-secondary.html` for all pages except the home page.
- Use `header.html` only for the home page (`index.html`).
- Do not add a contact-us form in the bottom of the home page.
- No social media links in the footer.
- No "Schedule App demo" link in the footer.

## Styling Rules
- Always prefer existing site custom styles (`style.css`, Bootstrap utilities in `vendor.bundle.css`) over writing new CSS.
- Only write page-specific CSS when no existing class covers the need.
- **Never modify** `assets/css/style.css`, `assets/css/vendor.bundle.css`, `assets/css/theme.css`, `_includes/header.html`, `_includes/header-secondary.html`, or `_includes/footer.html`.
- Follow the page layout and structure already established in `index.html`.

## Integration (Plugin) Page Structure
- Integration pages live under `integrations/<slug>/` as `index.html`; the folder name **is** the URL slug (e.g. `integrations/phoca-cart/index.html` → `/integrations/phoca-cart/`). Use the URL slug for the folder, not the source stem (`phoca-cart`, not `phocacart`).
- The installation/download page is `integrations/<slug>/installation/index.html` → `/integrations/<slug>/installation/`.
- The hub is `integrations/index.html` → `/integrations/`.
- **No `permalink:` front matter** on these — the folder structure drives the URL. Keep `layout: none`, `title`, `description`, `nav_active: integrations`.
- Product-page content is assembled from `_includes/<slug>-product/*.html`; installation pages are standalone.
- Redirects from old URLs use the **`jekyll-redirect-from`** plugin (works locally and on every host). Add `redirect_from: /old-path/` to the destination page's front matter; the plugin generates a redirect stub at the old URL. This is the single source of truth for redirects — do not also add `.htaccess`/`_redirects` rules for the same path (file-vs-redirect precedence on Netlify gets ambiguous).
- `jekyll-sitemap` auto-generates `/sitemap.xml` — do **not** hand-write one (a manual sitemap silently disables the plugin).

## CSS for New Pages (Plugin Pattern)
When adding or optimizing a secondary page (non-home), follow this pattern:

1. **No inline `<style>` blocks in page files.** Move all styles to a dedicated `assets/css/<page-name>.css`.
2. **Link placement:** immediately after `{% include header-secondary.html %}`, before `<main>`:
   ```html
   {% include header-secondary.html %}
   <link rel="stylesheet" href="{{ '/assets/css/<page-name>.css' | relative_url }}">
   ```
3. **Only put genuinely page-specific rules** in the page CSS file. Replace everything that has an equivalent master class with the real utility/class (Bootstrap or site custom).
4. **Page CSS file conventions** (mirror `assets/css/whmcs-product.css` / `virtuemart-product.css`):
   - Header banner comment: `/* ===…\n   filename.css  —  styles for page.html only\n   ===… */`
   - Section dividers: `/* ── Section Name ─────────────────────────────────────────── */`
   - 4-space indent; one property per line (flex-centering trios and single-declaration rules may be one-liners).
   - Use master palette vars (`var(--blue-200)`, `var(--blue-600)`, `var(--gray-200)`, `var(--blue-50)`, etc.) — never hardcode hex values that match an existing var.
   - No `@media` queries in page CSS files; use Bootstrap cols + auto-fit grids for responsiveness.
   - No CSS custom properties defined in page files — only consume what `:root` provides in `style.css`.
5. **Class naming:** kebab-case, prefixed per page (`integration-*`/`integrations-*`, `woo-*`, `vm-*`, etc.) to avoid collisions with master CSS.
6. **Watch for master-CSS name collisions** before naming a class — e.g. `.step-card` is owned by `style.css:8374` for install pages.
7. **Specificity:** when a rule must beat a global selector (e.g. `a:hover`), scope it under a parent class rather than using `!important`.

## Section / Markup Patterns (follow index.html)
- Section headings use the canonical block: `<div class="section-head [wide|wide-sm] [text-center]">` → `<span>` eyebrow → `<h2 class="txt-blue-600">` → `<p>`.
- Animations: `class="... animated" data-animate="fadeInUp" data-delay=".N"`. Section heads use delays `.1`/`.2`/`.3` for span/h2/p.
- Buttons: `<a class="vh-btn btn-* …"><span>Label</span><em class="ti ti-arrow-right ps-2"></em></a>`.
- Each secondary page already has an `<h1>` from `header-secondary.html` (`page.title`); section titles start at `<h2>`.
- Decorative overlays: `<div class="nk-ovm shape-y"></div>` / `shape-x-2` appended as last child of the section.
