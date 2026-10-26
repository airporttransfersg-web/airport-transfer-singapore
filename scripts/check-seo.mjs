#!/usr/bin/env node
/**
 * check:seo — the pSEO runbook gates, enforced at build time.
 *
 * astro check catches type errors. This catches the SEO errors that are just
 * as fatal and just as mechanical: two pages claiming one query, a page that
 * duplicates its sibling, a microsite page reaching for a term the money site
 * already owns, a release schedule that dumps a whole wave on one morning.
 *
 * No dependencies. Exits 1 on any failure so it can gate a deploy.
 */
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd(); // the site directory the npm script ran in
const PAGES_DIR = join(ROOT, "src/content/pages");
const OFF_LIMITS = join(ROOT, "seo/off-limits-terms.json");

const SIMILARITY_LIMIT = 0.70;   // Gate 3
const UNIQUE_FACT_FLOOR = 8;     // Gate 2
const OPERATIONAL_FLOOR = 3;     // Gate 2
const MAX_RELEASES_PER_DAY = 3;  // Gate 4B
const SHINGLE = 5;

const failures = [];
const warnings = [];
const fail = (gate, msg) => failures.push(`[${gate}] ${msg}`);
const warn = (gate, msg) => warnings.push(`[${gate}] ${msg}`);

/* ---------------------------------------------------------------- parsing */

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return walk(full);
    return /\.mdx?$/.test(name) ? [full] : [];
  });
}

/**
 * Top-level scalar frontmatter only. Nested blocks (faq, sections) are
 * deliberately ignored — Astro's zod schema already validates those, and a
 * real YAML parser is a dependency this script does not need.
 */
function parse(file) {
  const raw = readFileSync(file, "utf8");
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return null;
  const data = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z][A-Za-z0-9_]*):[ \t]*(.*)$/);
    if (!kv) continue;                       // indented or list line
    let [, key, value] = kv;
    value = value.trim();
    // YAML inline comment: a "#" preceded by whitespace, outside quotes.
    if (!/^["']/.test(value)) value = value.replace(/\s+#.*$/, "").trim();
    value = value.replace(/^["'](.*)["']$/, "$1");
    if (value === "") continue;              // key opens a nested block
    data[key] = value;
  }
  return { file, data, body: m[2] };
}

function words(body) {
  return body
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#*_>|`-]/g, " ")
    .toLowerCase()
    .split(/[^a-z0-9$]+/)
    .filter(Boolean);
}

function shingles(body) {
  const w = words(body);
  const set = new Set();
  for (let i = 0; i + SHINGLE <= w.length; i++) set.add(w.slice(i, i + SHINGLE).join(" "));
  return set;
}

function jaccard(a, b) {
  if (!a.size || !b.size) return 0;
  let shared = 0;
  const [small, large] = a.size <= b.size ? [a, b] : [b, a];
  for (const s of small) if (large.has(s)) shared++;
  return shared / (a.size + b.size - shared);
}

/* ------------------------------------------------------------------ gates */

const pages = walk(PAGES_DIR).map(parse).filter(Boolean);
const live = pages.filter((p) => p.data.published !== "false");
const rel = (p) => relative(ROOT, p.file);

// Gate 1 — one page, one query.
const byTerm = new Map();
for (const p of live) {
  const term = p.data.headTerm?.toLowerCase();
  if (!term) continue;
  if (byTerm.has(term)) {
    fail("Gate 1", `headTerm "${term}" claimed by both ${rel(byTerm.get(term))} and ${rel(p)}`);
  } else {
    byTerm.set(term, p);
  }
}

// Gate 1 — don't reach for what the money site owns.
if (existsSync(OFF_LIMITS)) {
  const blocked = JSON.parse(readFileSync(OFF_LIMITS, "utf8")).terms.map((t) => t.toLowerCase());
  for (const p of live) {
    const term = p.data.headTerm?.toLowerCase();
    if (term && blocked.includes(term)) {
      fail("Gate 1", `${rel(p)} targets "${term}", owned by the money site`);
    }
  }
}

// Gate 1 — a page with no headTerm is a page nobody has decided the query for.
for (const p of live) {
  if (!p.data.headTerm) warn("Gate 1", `${rel(p)} has no headTerm — uniqueness cannot be checked`);
}

// Gate 1 — slugs must be unique. (The build enforces this too; catching it
// here names both files instead of failing on the second one.)
const bySlug = new Map();
for (const p of live) {
  const slug = p.data.slug;
  if (!slug) continue;
  if (bySlug.has(slug)) {
    fail("Gate 1", `duplicate slug ${slug} in ${rel(bySlug.get(slug))} and ${rel(p)}`);
  } else {
    bySlug.set(slug, p);
  }
}

// Gate 2 — a page in a run carries its run metadata, or it isn't in the run.
for (const p of live) {
  if (!p.data.run) continue;
  const need = ["wave", "headTerm", "uniqueFacts", "operationalFacts"];
  const missing = need.filter((k) => p.data[k] === undefined);
  if (missing.length) {
    fail("Gate 2", `${rel(p)} is in ${p.data.run} but is missing: ${missing.join(", ")}`);
    continue;
  }
  const unique = Number(p.data.uniqueFacts);
  const operational = Number(p.data.operationalFacts);
  if (unique < UNIQUE_FACT_FLOOR) {
    fail("Gate 2", `${rel(p)} has ${unique} unique facts, floor is ${UNIQUE_FACT_FLOOR}`);
  }
  if (operational < OPERATIONAL_FLOOR) {
    fail("Gate 2", `${rel(p)} has ${operational} operational facts, floor is ${OPERATIONAL_FLOOR}`);
  }
}

// Gate 3 — near-duplicates get indexed, then dropped. Catch them before that.
const fingerprints = live.map((p) => ({ page: p, set: shingles(p.body) }));
for (let i = 0; i < fingerprints.length; i++) {
  for (let j = i + 1; j < fingerprints.length; j++) {
    const score = jaccard(fingerprints[i].set, fingerprints[j].set);
    if (score >= SIMILARITY_LIMIT) {
      fail(
        "Gate 3",
        `${(score * 100).toFixed(0)}% similar: ${rel(fingerprints[i].page)} vs ${rel(fingerprints[j].page)}`,
      );
    } else if (score >= SIMILARITY_LIMIT - 0.1) {
      warn(
        "Gate 3",
        `${(score * 100).toFixed(0)}% similar (under the limit, watch it): ${rel(fingerprints[i].page)} vs ${rel(fingerprints[j].page)}`,
      );
    }
  }
}

// Gate 3 — nothing unresolved ships.
for (const p of live) {
  if (/\[NEEDED\]/.test(p.body)) fail("Gate 3", `${rel(p)} still contains a [NEEDED] marker`);
  if (/\bVERIFY\b/.test(p.body)) warn("Gate 3", `${rel(p)} contains a VERIFY marker`);
}

// Gate 4B — a wave is a schedule, not a dump.
const perDay = new Map();
for (const p of live) {
  if (!p.data.publishAt) continue;
  const value = String(p.data.publishAt);
  const instant = new Date(value);
  if (!/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})?)?$/.test(value) || Number.isNaN(instant.getTime())) {
    fail("Gate 4B", `${rel(p)} has an unparseable publishAt: ${p.data.publishAt}`);
    continue;
  }
  const day = value.slice(0, 10);
  perDay.set(day, [...(perDay.get(day) ?? []), p]);
}
for (const [day, group] of [...perDay].sort()) {
  if (group.length > MAX_RELEASES_PER_DAY) {
    fail(
      "Gate 4B",
      `${group.length} pages scheduled for ${day} (max ${MAX_RELEASES_PER_DAY}): ${group.map(rel).join(", ")}`,
    );
  }
}

/* ----------------------------------------------------------------- report */

const scheduled = [...perDay.values()].reduce((n, g) => n + g.length, 0);
console.log(
  `check:seo — ${live.length} live pages, ${byTerm.size} with a headTerm, ${scheduled} scheduled`,
);
for (const w of warnings) console.log(`  warn  ${w}`);
for (const f of failures) console.error(`  FAIL  ${f}`);

if (failures.length) {
  console.error(`\n${failures.length} gate failure(s). Fix these before deploying.`);
  process.exit(1);
}
console.log(warnings.length ? `\nPassed with ${warnings.length} warning(s).` : "\nAll gates passed.");
