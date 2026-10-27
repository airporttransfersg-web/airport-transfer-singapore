// @ts-check
import {readFileSync} from "node:fs";
import { defineConfig } from "astro/config";
import {reviewMarkup} from "./src/lib/listicle-review-markup.mjs";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";
import { releaseAwareInternalLinks } from "./src/lib/release-links.mjs";

// Widen the plugin type: @tailwindcss/vite and Astro currently declare
// different vite peer versions, so the inferred Plugin<any>[] trips ts(2322).
/** @type {any} */
const tailwind = tailwindcss();

// site — VERIFY: confirm the production domain before launch; canonical URLs
// and OpenGraph metadata are generated from it.
export default defineConfig({
  devToolbar: {enabled:false},
  site: "https://airporttransfersingapore.com",
  // sitemap needs no publishAt filter: a page held back by its release date
  // is never built in production, so it cannot reach the sitemap.
  integrations: [mdx(), sitemap({serialize(item){if(item.url.endsWith("/blog/changi-airport-transfer-options-compared/"))item.lastmod=new Date(readFileSync(new URL("./src/content/listicle-reviews/APT01/index.mdx",import.meta.url),"utf8").match(/^updatedAt:\s*"([^"\n]+)"/m)?.[1] ?? "").toISOString();return item;}})],
  markdown: {
    rehypePlugins: [[releaseAwareInternalLinks, {
      contentDir: fileURLToPath(new URL("./src/content/pages", import.meta.url)),
      enabled: (process.env.SITE_ENV ?? "").toLowerCase() === "production",
    }], [reviewMarkup, {site: "https://airporttransfersingapore.com/"}]],
  },
  vite: {
    plugins: [tailwind],
  },
});
