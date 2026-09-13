import { readFileSync } from "node:fs";
import { join } from "node:path";

if ((process.env.SITE_ENV ?? "").toLowerCase() !== "production") {
  console.log("verify-production-seo — skipped (SITE_ENV is not production)");
  process.exit(0);
}

const root = process.cwd();
const robots = readFileSync(join(root, "public", "robots.txt"), "utf8");
const headers = readFileSync(join(root, "public", "_headers"), "utf8");

if (!/User-agent:\s*\*/i.test(robots) || !/Allow:\s*\//i.test(robots) || /Disallow:\s*\//i.test(robots)) {
  throw new Error("Production robots.txt is not crawlable.");
}
if (/X-Robots-Tag:\s*noindex/i.test(headers)) {
  throw new Error("Production _headers still sends X-Robots-Tag: noindex.");
}

const routes = {
  "/": "index.html",
  "/about/": join("about", "index.html"),
  "/contact/": join("contact", "index.html"),
};
for (const [route, file] of Object.entries(routes)) {
  const html = readFileSync(join(root, "dist", file), "utf8");
  if (/<meta[^>]+name=["']robots["'][^>]+noindex/i.test(html)) {
    throw new Error(`Production route ${route} contains a noindex meta tag.`);
  }
}

console.log("verify-production-seo — production robots and launch routes are indexable");
