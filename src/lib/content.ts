import { getCollection, type CollectionEntry } from "astro:content";
import { IS_PRODUCTION } from "./env";

export type PageEntry = CollectionEntry<"pages">;

export type SectionConfig = NonNullable<PageEntry["data"]["sections"]>[number];

/** Serve the optimized WebP variant for local fleet photos when available. */
export function optimizedImage(path: string | undefined): string | undefined {
  if (!path) return path;
  return path.replace(/\/images\/fleet\/([^/]+)\.png$/, "/images/fleet/webp/$1.webp");
}

/**
 * Has this entry's scheduled release passed?
 *
 * Staging renders everything so the whole set stays reviewable. Production
 * includes a page only once publishAt has arrived, which is what staggers a
 * wave across days without anyone editing a deploy script. The date lives in
 * frontmatter, so a scheduled release is always visible in a git diff.
 */
export function isReleased(entry: PageEntry, now: Date = new Date()): boolean {
  if (!IS_PRODUCTION) return true;
  const at = entry.data.publishAt;
  return !at || at.getTime() <= now.getTime();
}

/**
 * All entries eligible for this build.
 *
 * Single choke point: routes, indexes and the sitemap all read from here, so
 * a page held back by publishAt cannot leak into one of them.
 */
export async function publishedPages(): Promise<PageEntry[]> {
  const all = await getCollection("pages", ({ data }) => data.published);
  return all.filter((entry) => isReleased(entry));
}

/** Build-time route availability for shared navigation outside MDX content. */
export async function releasedRouteSet(): Promise<Set<string>> {
  const routes = new Set(["/", "/services/", "/blog/", "/contact/"]);
  for (const entry of await publishedPages()) routes.add(entry.data.slug);
  return routes;
}

/** Published entries for a pageType, newest first. */
export async function pagesOfType(
  pageType: PageEntry["data"]["pageType"],
): Promise<PageEntry[]> {
  const entries = (await publishedPages()).filter(
    (entry) => entry.data.pageType === pageType,
  );
  return entries.sort(
    (a, b) =>
      (b.data.datePublished?.getTime() ?? 0) -
      (a.data.datePublished?.getTime() ?? 0),
  );
}

export class SlugConflictError extends Error {}

/**
 * Normalizes the routing table for the catch-all route: validates explicit
 * slugs, rejects duplicates, and reserves "/" for the bespoke landing page.
 * Returns a map of route path (without surrounding slashes) → entry.
 */
export function buildRouteTable(entries: PageEntry[]): Map<string, PageEntry> {
  const table = new Map<string, PageEntry>();
  for (const entry of entries) {
    const slug = entry.data.slug;
    if (slug === "/") {
      throw new SlugConflictError(
        `"${entry.id}" reserves "/" — the landing page owns that route.`,
      );
    }
    const key = slug.replace(/^\/+|\/+$/g, "");
    if (!key || key.split("/").some((segment) => segment.length === 0)) {
      throw new SlugConflictError(
        `"${entry.id}" has an invalid slug "${slug}" — empty path segment.`,
      );
    }
    if (table.has(key)) {
      throw new SlugConflictError(
        `Duplicate slug "${slug}" in "${entry.id}" and "${table.get(key)?.id}".`,
      );
    }
    table.set(key, entry);
  }
  return table;
}

/** Breadcrumb segments derived from an explicit slug. */
export function breadcrumbFor(entry: PageEntry): Array<{ label: string; href: string | null }> {
  const segments = entry.data.slug.replace(/^\/+|\/+$/g, "").split("/");
  const crumbs: Array<{ label: string; href: string | null }> = [
    { label: "Home", href: "/" },
  ];
  segments.slice(0, -1).forEach((segment, index, prefix) => {
    const path = `/${prefix.slice(0, index + 1).join("/")}/`;
    crumbs.push({
      label: segment
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
      href: path,
    });
  });
  crumbs.push({ label: entry.data.title.split(":")[0].trim(), href: null });
  return crumbs;
}
