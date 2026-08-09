#!/usr/bin/env node
//
// Technical SEO health check against the LIVE site.
//
//   node scripts/check-seo-health.mjs            # sample 25 URLs from the sitemap
//   node scripts/check-seo-health.mjs --all      # check every URL (slow)
//   node scripts/check-seo-health.mjs --n 60     # sample a specific number
//
// This checks the half of indexing that is yours to control: are the pages
// reachable, are they allowed to be indexed, does each one point a canonical at
// itself, and does the sitemap agree with reality. It cannot tell you what
// Google has actually indexed — nothing outside Search Console can. Run this
// first; if it is clean, any remaining problem is Google's crawl schedule, not
// your site, and the answer is to wait rather than to change things.
//
// Exit code 1 if anything is wrong, so it can gate a deploy.

const SITE = process.env.SITE_URL || "https://www.paymenthood.com";
const args = process.argv.slice(2);
const ALL = args.includes("--all");
const N = (() => {
  const i = args.indexOf("--n");
  return i !== -1 && args[i + 1] ? parseInt(args[i + 1], 10) : 25;
})();

const bad = [];
const note = (url, msg) => bad.push({ url, msg });

async function get(url) {
  const res = await fetch(url, { redirect: "follow" });
  return { status: res.status, finalUrl: res.url, body: await res.text() };
}

// ── sitemap ───────────────────────────────────────────────────────────────
console.log(`Checking ${SITE}\n`);

let urls = [];
try {
  const sm = await get(`${SITE}/sitemap.xml`);
  if (sm.status !== 200) {
    console.error(`  sitemap.xml returned HTTP ${sm.status}`);
    process.exit(1);
  }
  urls = [...sm.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
  console.log(`  sitemap.xml           HTTP 200, ${urls.length} URLs`);
} catch (e) {
  console.error(`  sitemap.xml unreachable: ${e.message}`);
  process.exit(1);
}

// ── robots.txt ────────────────────────────────────────────────────────────
const robots = await get(`${SITE}/robots.txt`);
console.log(`  robots.txt            HTTP ${robots.status}`);
if (!/^\s*Sitemap:/im.test(robots.body)) {
  note("/robots.txt", "does not point at the sitemap");
}
if (/^\s*Disallow:\s*\/\s*$/im.test(robots.body)) {
  note("/robots.txt", "Disallow: / blocks the whole site");
}

// ── sample the pages ──────────────────────────────────────────────────────
// Spread the sample across the sitemap rather than taking the first N, so a
// section that is broken at the far end is not invisible.
const sample = ALL
  ? urls
  : urls.filter((_, i) => i % Math.max(1, Math.ceil(urls.length / N)) === 0);

console.log(`  checking ${sample.length} page(s)...\n`);

let ok = 0;
for (const url of sample) {
  let page;
  try {
    page = await get(url);
  } catch (e) {
    note(url, `unreachable: ${e.message}`);
    continue;
  }
  const path = url.replace(SITE, "") || "/";

  if (page.status !== 200) {
    note(path, `HTTP ${page.status}`);
    continue;
  }
  // A sitemap URL that lands somewhere else is a redirect Google has to
  // resolve on every crawl, and a canonical it may disagree with.
  if (page.finalUrl.replace(/\/$/, "") !== url.replace(/\/$/, "")) {
    note(path, `redirects to ${page.finalUrl.replace(SITE, "")}`);
  }
  if (/<meta[^>]+name=["']robots["'][^>]*noindex/i.test(page.body)) {
    note(path, "carries noindex but is in the sitemap");
  }
  const canon = page.body.match(
    /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i
  );
  if (!canon) {
    note(path, "no canonical tag");
  } else if (canon[1].replace(/\/$/, "") !== url.replace(/\/$/, "")) {
    note(path, `canonical points elsewhere: ${canon[1]}`);
  }
  const title = page.body.match(/<title[^>]*>(.*?)<\/title>/is);
  if (!title || !title[1].trim()) {
    note(path, "no title");
  } else if (title[1].trim().length > 60) {
    note(path, `title ${title[1].trim().length} chars (truncated in results)`);
  }
  const desc = page.body.match(
    /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i
  );
  if (!desc || !desc[1].trim()) {
    note(path, "no meta description");
  } else if (desc[1].length > 160) {
    note(path, `description ${desc[1].length} chars (truncated in results)`);
  }
  ok++;
}

// ── report ────────────────────────────────────────────────────────────────
console.log(`  ${ok}/${sample.length} page(s) clean\n`);

if (bad.length === 0) {
  console.log("No technical problem found.");
  console.log("");
  console.log("What this does NOT tell you: how many pages Google has actually");
  console.log("indexed. Only Search Console knows that —");
  console.log("  Indexing -> Pages   for the breakdown and the reasons");
  console.log("  Sitemaps            should read Success with all URLs discovered");
  process.exit(0);
}

console.log(`${bad.length} problem(s):\n`);
for (const b of bad) console.log(`  ${b.url}\n      ${b.msg}`);
process.exit(1);
