import { readFile, writeFile } from "node:fs/promises";
import { resolve, sep } from "node:path";

const apiBase = process.env.INDEXCHEX_API_BASE_URL ?? "https://indexchex.com/api";
const siteUrl = new URL(process.env.INDEXCHEX_SITE_URL ?? "https://airporttransfersingapore.com");
const sitemapUrl = new URL(process.env.INDEXCHEX_SITEMAP_URL ?? "/sitemap-index.xml", siteUrl);
const localSitemap = resolve(process.cwd(), process.env.INDEXCHEX_LOCAL_SITEMAP ?? "dist/sitemap-index.xml");
const distRoot = resolve(process.cwd(), "dist");
const historyPath = process.env.INDEXCHEX_HISTORY_PATH ?? ".indexchex-submitted-urls";
const apiKey = process.env.INDEXCHEX_API_KEY;
const urlLimit = Number(process.env.INDEXCHEX_URL_LIMIT ?? "0");

if (!apiKey) throw new Error("INDEXCHEX_API_KEY is not configured.");
if (siteUrl.protocol !== "https:" || sitemapUrl.origin !== siteUrl.origin) {
  throw new Error("IndexChex site and sitemap URLs must use the same HTTPS origin.");
}
if (!Number.isSafeInteger(urlLimit) || urlLimit < 0) {
  throw new Error("INDEXCHEX_URL_LIMIT must be a non-negative whole number; 0 means unlimited.");
}

function locations(xml) {
  return [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)]
    .map((match) => match[1].replaceAll("&amp;", "&").trim());
}

async function collectLocalSitemap(file, seen = new Set()) {
  const absolute = resolve(file);
  if (absolute !== distRoot && !absolute.startsWith(`${distRoot}${sep}`)) {
    throw new Error("Local sitemap entry escaped the production dist directory.");
  }
  if (seen.has(absolute)) throw new Error("Local sitemap index contains a cycle.");
  seen.add(absolute);
  const xml = await readFile(absolute, "utf8");
  const locs = locations(xml);

  if (/<sitemapindex\b/i.test(xml)) {
    const urls = [];
    for (const loc of locs) {
      const child = new URL(loc, siteUrl);
      if (child.origin !== siteUrl.origin) continue;
      urls.push(...await collectLocalSitemap(resolve(distRoot, decodeURIComponent(child.pathname).slice(1)), seen));
    }
    return urls;
  }

  return locs.filter((loc) => {
    try { return new URL(loc).origin === siteUrl.origin; } catch { return false; }
  });
}

async function collectLiveSitemap(url, seen = new Set(), depth = 0) {
  if (depth > 4 || seen.has(url.href)) throw new Error("Live sitemap index is cyclic or too deeply nested.");
  seen.add(url.href);
  const response = await fetch(url, { signal: AbortSignal.timeout(15_000) });
  if (!response.ok) throw new Error(`Production sitemap returned HTTP ${response.status}: ${url.pathname}`);
  const xml = await response.text();
  const locs = locations(xml);

  if (/<sitemapindex\b/i.test(xml)) {
    const urls = [];
    for (const loc of locs) {
      const child = new URL(loc, url);
      if (child.origin !== siteUrl.origin) continue;
      urls.push(...await collectLiveSitemap(child, seen, depth + 1));
    }
    return urls;
  }

  return locs.filter((loc) => {
    try { return new URL(loc).origin === siteUrl.origin; } catch { return false; }
  });
}

const expectedUrls = [...new Set(await collectLocalSitemap(localSitemap))].sort();
if (expectedUrls.length === 0) throw new Error("The production build sitemap contains no canonical site URLs.");

let liveUrls = [];
const deadline = Date.now() + 3 * 60_000;
let lastError;
while (Date.now() < deadline) {
  try {
    liveUrls = await collectLiveSitemap(sitemapUrl);
    const liveSet = new Set(liveUrls);
    if (expectedUrls.every((url) => liveSet.has(url))) break;
    lastError = new Error(`Cloudflare sitemap is not current yet (${liveSet.size}/${expectedUrls.length} expected URLs live).`);
  } catch (error) {
    lastError = error;
  }
  await new Promise((res) => setTimeout(res, 10_000));
}
if (expectedUrls.some((url) => !new Set(liveUrls).has(url))) {
  throw new Error(`Production release was not confirmed in the live sitemap within 3 minutes. ${lastError?.message ?? ""}`);
}

let submittedUrls = new Set();
try {
  const history = await readFile(historyPath, "utf8");
  submittedUrls = new Set(history.split(/\r?\n/).map((url) => url.trim()).filter(Boolean));
} catch (error) {
  if (error?.code !== "ENOENT") throw error;
}

const resubmitUrls=new Set((process.env.INDEXCHEX_RESUBMIT_URLS??"").split(/\r?\n/).map(x=>x.trim()).filter(Boolean));
for(const url of resubmitUrls)if(!expectedUrls.includes(url))throw Error("Resubmission URL is not in the released canonical sitemap: "+url);
const eligibleUrls = expectedUrls.filter((url) => !submittedUrls.has(url)||resubmitUrls.has(url));
const newUrls = urlLimit === 0 ? eligibleUrls : eligibleUrls.slice(0, urlLimit);
if (newUrls.length === 0) {
  console.log(`IndexChex: all ${expectedUrls.length} live ATS URL(s) were already submitted; nothing to do.`);
  process.exit(0);
}

for (let offset = 0; offset < newUrls.length; offset += 1_000) {
  const urls = newUrls.slice(offset, offset + 1_000);
  const response = await fetch(`${apiBase}/v1/index-submit/jobs`, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json", Authorization: apiKey },
    body: JSON.stringify({ urls, name: `ATS production release ${new Date().toISOString().slice(0, 10)}` }),
    signal: AbortSignal.timeout(30_000),
  });
  const text = await response.text();
  let payload;
  try { payload = text ? JSON.parse(text) : null; }
  catch { throw new Error(`IndexChex returned non-JSON HTTP ${response.status} for URL submission.`); }
  if (!response.ok) {
    throw new Error(`IndexChex HTTP ${response.status} for URL submission: ${payload?.message ?? payload?.error ?? "request failed"}`);
  }
  if (payload?.job_id === undefined || payload?.job_id === null) {
    throw new Error("IndexChex did not return a job_id; submission history was not updated.");
  }
  for (const url of urls) submittedUrls.add(url);
  await writeFile(historyPath, `${[...submittedUrls].sort().join("\n")}\n`);
  console.log(`IndexChex accepted ${urls.length} ATS URL(s) in job ${payload.job_id}.`);
}

console.log(`IndexChex ATS release sync complete: submitted ${newUrls.length} new URL(s); ${eligibleUrls.length - newUrls.length} new URL(s) left for a later run; ${expectedUrls.length - eligibleUrls.length} already submitted.`);
