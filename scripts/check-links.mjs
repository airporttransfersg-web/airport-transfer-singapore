#!/usr/bin/env node
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";

const ROOT = process.cwd();
const DIST = join(ROOT, "dist");
const REDIRECTS = join(DIST, "_redirects");

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

function routeFor(file) {
  const rel = relative(DIST, file).replaceAll("\\", "/");
  if (rel === "index.html") return "/";
  if (rel.endsWith("/index.html")) return `/${dirname(rel)}/`;
  return `/${rel}`;
}

function routePath(value, fromRoute) {
  if (!value || value.startsWith("#") || /^(?:mailto|tel|javascript|data):/i.test(value)) return null;
  let url;
  try {
    url = new URL(value, `https://internal.test${fromRoute}`);
  } catch {
    return null;
  }
  if (url.host !== "internal.test") return null;
  const path = decodeURIComponent(url.pathname);
  if (/\.[a-z0-9]{2,8}$/i.test(path)) return path;
  return path === "/" || path.endsWith("/") ? path : `${path}/`;
}

const htmlFiles = walk(DIST).filter((file) => file.endsWith(".html"));
const routes = new Set(htmlFiles.map(routeFor));
const redirectSources = new Set(
  readFileSync(REDIRECTS, "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => line.split(/\s+/)[0])
    .filter((path) => !path.includes("*")),
);

const failures = [];
for (const file of htmlFiles) {
  const from = routeFor(file);
  const html = readFileSync(file, "utf8");
  for (const match of html.matchAll(/<a\b[^>]*\bhref=(?:"([^"]*)"|'([^']*)')[^>]*>/gi)) {
    const raw = match[1] ?? match[2];
    const target = routePath(raw, from);
    if (!target) continue;
    if (redirectSources.has(target)) {
      failures.push(`${from} links to redirect source ${target}`);
    } else if (!routes.has(target) && !target.startsWith("/api/") && !resolve(DIST, `.${target}`).startsWith(DIST)) {
      failures.push(`${from} has unsafe internal link ${raw}`);
    } else if (!routes.has(target) && !target.startsWith("/api/") && !statTargetExists(target)) {
      failures.push(`${from} links to missing route ${target}`);
    }
  }
}

function statTargetExists(target) {
  try {
    return statSync(join(DIST, target.replace(/^\//, ""))).isFile();
  } catch {
    return false;
  }
}

if (failures.length) {
  for (const failure of failures) console.error(`  FAIL  ${failure}`);
  console.error(`\ncheck:links — ${failures.length} broken or non-canonical internal link(s).`);
  process.exit(1);
}

console.log(`check:links — ${htmlFiles.length} HTML files, all internal links resolve directly.`);
