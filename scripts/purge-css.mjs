// Strips unused CSS rules from the built vendor.bundle.css and style.css
// (Lighthouse "Reduce unused CSS" — these ship ~97%/75% unused, mostly
// Bootstrap/Font Awesome/select2/Owl/Magnific rules this site never renders).
//
// Runs against the BUILT _site output only — _sass/vendor/ and the rest of
// the SCSS source are never touched, per this repo's "never edit vendor"
// rule; a plain `jekyll build` still reproduces the full unpurged CSS, so
// this must run on every deploy (see .github/workflows/jekyll.yml), not as
// a one-off local cleanup.
//
// Safety notes:
//   - PurgeCSS only sees literal text, so any class assigned dynamically via
//     JS (classList.add(variable)) is invisible to it unless that string
//     also appears somewhere in the scanned content. We therefore scan the
//     site's own JS files too, and keep an explicit safelist for classes
//     that Bootstrap's bundled JS (offcanvas/collapse/etc.) or animate.css
//     add without ever writing the literal class name into our HTML.
//   - Validated locally (2026-07-13): served the purged output and exercised
//     every JS-driven UI element (offcanvas nav, header has-fixed on scroll,
//     FAQ accordion, provider filter tabs, chat email gate, pricing
//     calculator) — pixel-identical, zero console errors. Re-validate the
//     same way if you touch the safelist or add a new interactive component.
import { PurgeCSS } from 'purgecss';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SITE = path.join(ROOT, '_site');

function walk(dir, exts, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, exts, out);
    else if (exts.some((e) => entry.name.endsWith(e))) out.push(full);
  }
  return out;
}

const htmlFiles = walk(SITE, ['.html']);
const jsFiles = [
  path.join(ROOT, 'assets/js/scripts.js'),
  path.join(ROOT, 'assets/js/product-page.js'),
  path.join(ROOT, 'assets/js/bootstrap.bundle.min.js'),
];

const content = [
  ...htmlFiles.map((f) => ({ raw: fs.readFileSync(f, 'utf8'), extension: 'html' })),
  ...jsFiles.map((f) => ({ raw: fs.readFileSync(f, 'utf8'), extension: 'js' })),
];

const cssFiles = [
  path.join(SITE, 'assets/css/vendor.bundle.css'),
  path.join(SITE, 'assets/css/style.css'),
];

const results = await new PurgeCSS().purge({
  content,
  css: cssFiles.map((f) => ({ raw: fs.readFileSync(f, 'utf8'), name: f })),
  safelist: {
    standard: [
      // this site's own dynamically-toggled classes (scripts.js / product-page.js / inline chat-widget JS)
      'open', 'open-nav', 'navbar-active', 'has-fixed', 'has-ovm', 'has-mask', 'loading',
      // animate.css keyframe classes assigned via data-animate at runtime
      /^fadeIn/, /^fadeOut/, /^animated$/,
      // Bootstrap JS-driven interactive states that DO appear on this site:
      // offcanvas (mobile nav) toggles .show/.offcanvas-backdrop at runtime;
      // .collapse is used once; .active/.disabled are nav/form states.
      /show/, /collaps/, /backdrop/, /offcanvas/, /active/, /disabled/,
      // custom chat widget elements
      /^ph-/, /^pheg-/,
    ],
    // NOTE: previously `deep: [/carousel/,/modal/,/dropdown/,/tooltip/,/popover/,
    // /toast/]` force-kept ~28KB of Bootstrap component CSS this site never uses
    // (verified: 0 usages in markup — the mega-menu is custom .menu-mega, the
    // logo strip is custom .linear-slider, not Owl/Bootstrap carousel). Removing
    // it lets PurgeCSS drop those rules, which is what Lighthouse's "unused CSS"
    // flagged. Re-add a component here only if you actually start using it.
    // Attribute selectors whose value contains a SPACE — e.g.
    // .integration-logo img[alt="Phoca Cart"]. The extractor below tokenises
    // on non-word chars, so "Phoca Cart" only ever yields "Phoca" and "Cart"
    // separately and never matches the quoted two-word value; PurgeCSS then
    // drops the rule. (Single-word ones like [alt="J2Commerce"] survive fine.)
    // Keeping the whole .integration-logo block preserves every such variant.
    greedy: [/integration-logo/],
  },
  defaultExtractor: (c) => c.match(/[\w-/:%.]+(?<!:)/g) || [],
});

for (let i = 0; i < results.length; i++) {
  const origPath = cssFiles[i];
  const before = fs.statSync(origPath).size;
  fs.writeFileSync(origPath, results[i].css);
  const after = Buffer.byteLength(results[i].css, 'utf8');
  console.log(path.basename(origPath), `${before} -> ${after} bytes (${(100 * after / before).toFixed(1)}% remaining)`);
}
