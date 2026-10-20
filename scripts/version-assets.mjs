// Stamps every local stylesheet and script URL in the BUILT html with a content hash:
//   /assets/css/style.css          -> /assets/css/style.css?v=3f9a1c2e
//   /assets/js/scripts.js?ver=301  -> /assets/js/scripts.js?v=77b0e4d1
//
// Why: the live site serves these files with a one-year cache (Cloudflare and the
// visitor's browser). A file that changes but keeps its URL is not picked up by anyone
// who already has it, so new HTML can run against an OLD stylesheet. For a feature like
// the dark theme that is not cosmetic: a returning visitor whose system is dark would
// get dark pages and a stylesheet without the dark rules for cards, i.e. unreadable text.
// A hash in the URL makes a changed file a new URL, and an unchanged file keeps its URL,
// so the long cache is still fully used.
//
// Runs automatically after `npm run purge-css` (npm's post hook, see package.json), so
// the hash is taken from the FINAL, purged bytes. It never touches _site/ source and a
// plain `jekyll build` is unaffected; local development keeps the hand-written ?ver=.
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE = path.resolve(__dirname, '..', '_site');

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.name.endsWith('.html')) out.push(full);
  }
  return out;
}

const hashes = new Map();
function hashOf(urlPath) {
  if (hashes.has(urlPath)) return hashes.get(urlPath);
  const file = path.join(SITE, urlPath);
  let value = null;
  if (fs.existsSync(file)) {
    value = crypto.createHash('sha1').update(fs.readFileSync(file)).digest('hex').slice(0, 8);
  }
  hashes.set(urlPath, value);
  return value;
}

// href="/assets/css/x.css[?...]" and src="/assets/js/x.js[?...]", double-quoted as every template writes them.
const REF = /((?:href|src)=")(\/assets\/(?:css|js)\/[^"?#]+\.(?:css|js))(\?[^"#]*)?(")/g;

let files = 0, changed = 0, refs = 0;
const missing = new Set();
for (const file of walk(SITE)) {
  const before = fs.readFileSync(file, 'utf8');
  const after = before.replace(REF, (whole, open, urlPath, _query, close) => {
    const hash = hashOf(urlPath);
    if (!hash) { missing.add(urlPath); return whole; }
    refs++;
    return `${open}${urlPath}?v=${hash}${close}`;
  });
  files++;
  if (after !== before) { fs.writeFileSync(file, after); changed++; }
}

console.log(`version-assets: ${refs} references stamped in ${changed} of ${files} html files`);
if (missing.size) console.log(`version-assets: left unstamped (file not in _site): ${[...missing].join(', ')}`);
