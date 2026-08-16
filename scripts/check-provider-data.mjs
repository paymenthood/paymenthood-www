// Machine-checkable half of the provider-page publication gate.
//
// The gate was originally "a human reads every field". That is the right rule
// for claims only a person can judge, and the wrong rule for everything else —
// with a provider file per gateway and a combo page per gateway x platform,
// a purely human gate never opens
// and the pages stay unpublished forever.
//
// So the gate is split. This script owns the part a machine does better:
//
//   1. Every URL in `links` and `verification.sources` resolves (no 404, no
//      dead host). A wrong URL is wrong permanently, unlike an incomplete
//      country list — this is the highest-value check in the file.
//   2. Required fields are present and well-formed.
//   3. No banned claim patterns: no fees, no counts, no completeness claims.
//      These are the things that go stale without anyone noticing, and the
//      reason they are banned is documented in .claude/skills/provider-page.
//   4. Every platform in `platforms:` has a combo page on disk. Those pages are
//      hand-written stubs — nothing generates them — so adding a provider
//      silently creates N dead URLs until someone remembers to make them.
//
// What it deliberately does NOT check is whether the characterisation is right
// ("Kuda has no card acceptance"). That still needs a person — but it is a
// judgement call on sourced prose, not a data-freshness chore.
//
// Usage:
//   node scripts/check-provider-data.mjs            # all providers
//   node scripts/check-provider-data.mjs paystack   # one
//   node scripts/check-provider-data.mjs --no-net   # skip URL checks (offline)

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIR = path.join(ROOT, '_data', 'providers');

const args = process.argv.slice(2);
const noNet = args.includes('--no-net');
const only = args.filter((a) => !a.startsWith('--'));

const REQUIRED = ['name', 'slug', 'status', 'category', 'region', 'logo',
                  'accent', 'accent_rgb', 'accent_text', 'summary'];

// Claims that rot. Kept in sync with the "never assert a count" rule.
const BANNED = [
  { re: /\b(?:over|more than|around|roughly|about|~)?\s*\d+\+?\s*(?:countries|currencies|markets|cryptocurrencies|coins|payment methods|channels|territories|regions)\b/i,
    why: 'count / completeness claim — state membership instead' },
  { re: /\b\d+(?:\.\d+)?\s*%/,
    why: 'percentage — almost always a fee, which this schema does not carry' },
  { re: /\bT\+\d\b/,
    why: 'settlement timing — changes without notice' },
];

function parse(text) {
  // Deliberately not a YAML library: this only needs scalars, the `links:`
  // block and the sources list, and the repo has no JS dependency for YAML.
  const out = { links: {}, sources: [] };
  for (const m of text.matchAll(/^([a-z_]+):[ \t]*(.*)$/gm)) {
    const [, k, raw] = m;
    let v = raw.trim();
    if (!v || v === '>-' || v === '|') continue;
    v = v.startsWith('"') ? v.slice(1, v.indexOf('"', 1)) : v.split(' #')[0].trim();
    if (out[k] === undefined) out[k] = v;
  }
  // Block scalars (`key: >-` followed by an indented body) carry their value on
  // the following lines, not on the key line. Without this every file reported
  // `summary` missing — the check was measuring the parser, not the data.
  for (const m of text.matchAll(/^([a-z_]+):[ \t]*[>|]-?\n((?:[ ]+\S.*\n)+)/gm)) {
    out[m[1]] = m[2].trim().replace(/\s+/g, ' ');
  }
  const linkBlock = text.match(/^links:\n((?:[ ]+\S.*\n)+)/m);
  if (linkBlock) {
    for (const m of linkBlock[1].matchAll(/^\s+([a-z_]+):\s*(\S+)\s*$/gm)) out.links[m[1]] = m[2];
  }
  for (const m of text.matchAll(/^\s{4}- (https?:\/\/\S+)\s*$/gm)) out.sources.push(m[1]);
  return out;
}

// A bot-blocked response is not a broken link. Cloudflare and friends answer
// 403/429 to any request without a real browser fingerprint, and several of the
// provider sites here do exactly that. Only a genuine 404/410, a DNS failure or
// a timeout means the URL is actually wrong — which is the thing worth failing
// on, because a wrong URL stays wrong forever while a blocked one is fine.
const BLOCKED = new Set([401, 403, 405, 406, 429, 503]);

async function reachable(url) {
  for (const method of ['HEAD', 'GET']) {
    try {
      const res = await fetch(url, { method, redirect: 'follow',
        headers: { 'user-agent': 'Mozilla/5.0 (compatible; PaymentHoodDocsCheck/1.0)' },
        signal: AbortSignal.timeout(15000) });
      if (res.ok) return { ok: true, status: res.status };
      if (BLOCKED.has(res.status)) return { ok: true, blocked: true, status: res.status };
      if (method === 'GET') return { ok: false, status: res.status };
    } catch (e) {
      if (method === 'GET') return { ok: false, status: e.name === 'TimeoutError' ? 'timeout' : 'unreachable' };
    }
  }
  return { ok: false, status: '?' };
}

const files = fs.readdirSync(DIR).filter((f) => f.endsWith('.yml'))
  .filter((f) => !only.length || only.includes(f.replace('.yml', '')));

let problems = 0;
const seen = new Map();

for (const file of files) {
  const text = fs.readFileSync(path.join(DIR, file), 'utf8');
  const d = parse(text);
  const issues = [];

  for (const k of REQUIRED) if (!d[k]) issues.push(`missing required field: ${k}`);
  if (d.accent && !/^#[0-9a-f]{6}$/i.test(d.accent)) issues.push(`accent is not a hex colour: ${d.accent}`);
  if (d.accent_text && !/^#[0-9a-f]{6}$/i.test(d.accent_text)) issues.push(`accent_text is not a hex colour: ${d.accent_text}`);
  if (!d.links.website) issues.push('missing links.website');
  if (!d.sources.length) issues.push('verification.sources is empty');

  // `logo` being present is not the same as the file existing. CCBill shipped pointing at
  // ccbil-light.jpg while the file on disk was ccbil-light.png, so the providers grid rendered
  // a broken image and nothing reported it — the field was set, which was all anyone checked.
  if (d.logo && !fs.existsSync(path.join(ROOT, d.logo.replace(/^\//, ''))))
    issues.push(`logo file does not exist: ${d.logo}`);

  // Combo pages (integrations/<platform>/<provider>/) are hand-written stubs —
  // no loop builds them from this data. So `platforms:` is a promise the repo
  // does not keep on its own: CCBill listed five platforms and shipped with all
  // five pages absent, every one a 404 that nothing else reported. Only the
  // missing direction is checked; a stub for a platform no longer listed here
  // still renders, it just advertises a combination we no longer claim.
  for (const plat of (d.platforms || '').replace(/[[\]]/g, '').split(',').map((s) => s.trim()).filter(Boolean)) {
    if (!fs.existsSync(path.join(ROOT, 'integrations', plat, d.slug ?? '', 'index.html')))
      issues.push(`missing combo page: integrations/${plat}/${d.slug}/index.html`);
  }

  // Banned claims — check the prose only, not the comment header that explains
  // the rule (it necessarily contains examples of what it forbids).
  const prose = text.split('\n').filter((l) => !l.trimStart().startsWith('#')).join('\n');
  for (const { re, why } of BANNED) {
    const hit = prose.match(re);
    if (hit) issues.push(`banned claim ${JSON.stringify(hit[0].trim())} — ${why}`);
  }

  const blocked = [];
  const urls = [...new Set([...Object.values(d.links), ...d.sources])];
  if (!noNet) {
    for (const u of urls) {
      if (!seen.has(u)) seen.set(u, await reachable(u));
      const r = seen.get(u);
      if (!r.ok) issues.push(`DEAD LINK (${r.status}): ${u}`);
      else if (r.blocked) blocked.push(`${r.status} ${u}`);
    }
  }

  const flagged = /^\s*#\s*NOTE:/m.test(text);
  const label = flagged ? ' [has a # NOTE: — needs a human regardless]' : '';
  if (issues.length) {
    problems++;
    console.log(`\n✗ ${file}${label}`);
    for (const i of issues) console.log(`    ${i}`);
  } else {
    console.log(`✓ ${file}${label}${blocked.length ? `  (${blocked.length} bot-blocked, not machine-checkable)` : ''}`);
  }
}

console.log(`\n${files.length} file(s) checked, ${problems} with problems` +
            (noNet ? '  (URL checks skipped)' : `, ${seen.size} unique URLs tested`));

// ── Publication status ──────────────────────────────────────────────────────
// This used to be a banner rendered into every unverified page. It belongs here
// instead: you want this list when you sit down to review, not on top of every
// page you happen to open. The banner is gone, the gate is not — `noindex` and
// `sitemap: false` in each page's front matter still decide what search engines
// see. This only reports the current state of that.
const pages = [];
for (const file of files) {
  const slug = file.replace('.yml', '');
  const stub = path.join(ROOT, 'providers', slug, 'index.html');
  if (!fs.existsSync(stub)) continue;
  const fm = fs.readFileSync(stub, 'utf8');
  const data = fs.readFileSync(path.join(DIR, file), 'utf8');
  pages.push({
    slug,
    published: !/^noindex:\s*true/m.test(fm),
    // `[^\S\n]*` not `\s*`: \s matches newlines, so `\s*\S` happily skipped an
    // empty `verified_by:` and matched the first character of the NEXT line —
    // reporting every unsigned file as signed.
    signed: /^[ \t]*verified_by:[ \t]*\S/m.test(data),
  });
}

// `provider_count` in _config.yml is hand-maintained — Jekyll config cannot compute it —
// and it drives the "+N more" mosaic link and the "All N providers" line on pricing. It
// drifts every time a provider is published, because publishing happens in the data file
// and nothing points back at the config. Only meaningful on a full run: a single-slug run
// legitimately sees fewer files.
if (!only.length) {
  const liveCount = files.filter((f) =>
    /^status:\s*live/m.test(fs.readFileSync(path.join(DIR, f), 'utf8'))).length;
  const cfg = fs.readFileSync(path.join(ROOT, '_config.yml'), 'utf8').match(/^provider_count:\s*(\d+)/m);
  if (cfg && Number(cfg[1]) !== liveCount) {
    problems++;
    console.log(`\n✗ _config.yml\n    provider_count is ${cfg[1]} but ${liveCount} providers are status: live`);
  }
}

const live = pages.filter((p) => p.published);
const held = pages.filter((p) => !p.published);
console.log('\nPUBLICATION STATUS');
console.log(`  published (indexable) : ${live.length}` +
            (live.length ? `  ${live.map((p) => p.slug).join(', ')}` : ''));
console.log(`  held back (noindex)   : ${held.length}`);
if (held.length) {
  const ready = held.filter((p) => p.signed).map((p) => p.slug);
  console.log(`     signed off, still noindex : ${ready.length ? ready.join(', ') : 'none'}`);
  console.log(`     awaiting sign-off         : ${held.length - ready.length}`);
  console.log('  To publish: set verification.verified_by in the data file, then delete the');
  console.log('  noindex/sitemap lines from providers/<slug>/index.html.');
}

process.exit(problems ? 1 : 0);
