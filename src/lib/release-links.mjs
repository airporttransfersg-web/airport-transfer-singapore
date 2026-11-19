import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : /\.mdx?$/.test(name) ? [full] : [];
  });
}

function scalar(frontmatter, key) {
  const match = frontmatter.match(new RegExp(`^${key}:[ \\t]*(.+)$`, "m"));
  return match?.[1]?.replace(/\s+#.*$/, "").trim().replace(/^["']|["']$/g, "");
}

function normalizePath(value) {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) return null;
  const path = value.split(/[?#]/, 1)[0];
  return path === "/" || path.endsWith("/") ? path : `${path}/`;
}

function contentAvailability(contentDir, production, now = new Date()) {
  const available = new Set();
  const unavailable = new Set();
  for (const file of contentDir.flatMap(walk)) {
    const raw = readFileSync(file, "utf8");
    const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!match) continue;
    const slug = normalizePath(scalar(match[1], "slug"));
    if (!slug) continue;
    available.add(slug);
    const published = scalar(match[1], "published");
    const publishAt = scalar(match[1], "publishAt");
    const timestamp = publishAt ? new Date(publishAt.length === 10 ? `${publishAt}T00:00:00Z` : publishAt).getTime() : NaN;
    const approval = scalar(match[1], "approvedForProduction");
    const isGuide = scalar(match[1], "postId") !== undefined || approval !== undefined;
    const heldBack = publishAt && (!Number.isFinite(timestamp) || timestamp > now.getTime());
    if (published === "false" || (production && (heldBack || (isGuide && (approval !== "true" || !publishAt))))) unavailable.add(slug);
  }
  return { available, unavailable };
}

function visit(node, availability) {
  if (!node || typeof node !== "object") return;
  if (node.type === "element" && node.tagName === "a") {
    const href = normalizePath(node.properties?.href);
    // Physical Astro routes are not all content entries; preserve their links.
    // The normal link gate checks unknown targets rather than silently hiding them.
    if (href && availability.unavailable.has(href)) {
      const { href: _href, target: _target, rel: _rel, ...properties } = node.properties;
      node.tagName = "span";
      node.properties = { ...properties, dataReleasePending: "" };
    }
  }
  if (Array.isArray(node.children)) for (const child of node.children) visit(child, availability);
}

export function releaseAwareInternalLinks(options = {}) {
  const directories = [options.contentDir, ...(options.additionalContentDirs ?? [])];
  const availability = contentAvailability(directories, options.production === true, options.now ?? new Date());
  return (tree) => visit(tree, availability);
}
