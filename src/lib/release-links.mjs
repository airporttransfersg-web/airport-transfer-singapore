import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return walk(full);
    return /\.mdx?$/.test(name) ? [full] : [];
  });
}

function scalar(frontmatter, key) {
  const match = frontmatter.match(new RegExp(`^${key}:[ \\t]*(.+)$`, "m"));
  if (!match) return undefined;
  return match[1]
    .replace(/\s+#.*$/, "")
    .trim()
    .replace(/^["']|["']$/g, "");
}

function normalizePath(value) {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) return null;
  const path = value.split(/[?#]/, 1)[0];
  if (!path) return "/";
  return path === "/" || path.endsWith("/") ? path : `${path}/`;
}

/** Routes that must not be linked in a production build. */
export function unavailableContentSlugs(contentDir, now = new Date()) {
  const unavailable = new Set();
  for (const file of walk(contentDir)) {
    const raw = readFileSync(file, "utf8");
    const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!match) continue;

    const slug = normalizePath(scalar(match[1], "slug"));
    if (!slug) continue;

    const published = scalar(match[1], "published");
    const publishAt = scalar(match[1], "publishAt");
    const heldBack = publishAt && new Date(`${publishAt}T00:00:00Z`).getTime() > now.getTime();
    if (published === "false" || heldBack) unavailable.add(slug);
  }
  return unavailable;
}

function visit(node, unavailable) {
  if (!node || typeof node !== "object") return;

  if (node.type === "element" && node.tagName === "a") {
    const href = normalizePath(node.properties?.href);
    if (href && unavailable.has(href)) {
      const { href: _href, target: _target, rel: _rel, ...properties } = node.properties;
      node.tagName = "span";
      node.properties = { ...properties, dataReleasePending: "" };
    }
  }

  if (Array.isArray(node.children)) {
    for (const child of node.children) visit(child, unavailable);
  }
}

export function suppressUnavailableLinks(tree, unavailable) {
  visit(tree, unavailable);
  return tree;
}

/**
 * Rehype plugin: production builds render future internal links as plain text.
 * A later build restores the original anchor automatically when publishAt has
 * passed because the source Markdown is never rewritten.
 */
export function releaseAwareInternalLinks(options = {}) {
  const unavailable = options.enabled
    ? unavailableContentSlugs(options.contentDir, options.now ? new Date(options.now) : new Date())
    : new Set();

  return (tree) => suppressUnavailableLinks(tree, unavailable);
}
