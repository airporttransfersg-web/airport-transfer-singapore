/**
 * Build environment. Defaults to "staging" on purpose: staging is the
 * noindexed, access-gated variant, so a missing or misspelled SITE_ENV can
 * only ever fail toward "less exposed", never toward an accidental launch.
 *
 *   SITE_ENV=production pnpm build   → live site, publishAt honoured, indexable
 *   pnpm build                       → staging, everything rendered, noindex
 */
export type SiteEnv = "staging" | "production";

const raw = (import.meta.env.SITE_ENV ?? process.env.SITE_ENV ?? "").toLowerCase();

export const SITE_ENV: SiteEnv = raw === "production" ? "production" : "staging";
export const IS_PRODUCTION = SITE_ENV === "production";
export const IS_STAGING = !IS_PRODUCTION;
