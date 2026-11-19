// @ts-check
import {readFileSync,readdirSync} from "node:fs";
import { defineConfig } from "astro/config";
import {reviewMarkup} from "./src/lib/listicle-review-markup.mjs";
import {releaseNow} from "./src/lib/listicle-release.mjs";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";
import { releaseAwareInternalLinks } from "./src/lib/release-links.mjs";

// Widen the plugin type: @tailwindcss/vite and Astro currently declare
// different vite peer versions, so the inferred Plugin<any>[] trips ts(2322).
/** @type {any} */
const tailwind = tailwindcss();

// Article lastmod follows the actual checked/updated date, including future refresh PRs.
const reviewDirectory=new URL('./src/content/listicle-reviews/',import.meta.url);
const listicleModified=new Map(readdirSync(reviewDirectory,{withFileTypes:true}).filter(entry=>entry.isDirectory()).map(entry=>{
 const source=readFileSync(new URL(entry.name+'/index.mdx',reviewDirectory),'utf8');
 const slug=source.match(/^slug:\s*"([^"\n]+)"/m)?.[1];
 const updated=source.match(/^updatedAt:\s*"([^"\n]+)"/m)?.[1];
 return [slug,updated?new Date(updated).toISOString():undefined];
}));

// site — VERIFY: confirm the production domain before launch; canonical URLs
// and OpenGraph metadata are generated from it.
export default defineConfig({
  devToolbar: {enabled:false},
  site: "https://airporttransfersingapore.com",
  // sitemap needs no publishAt filter: a page held back by its release date
  // is never built in production, so it cannot reach the sitemap.
  integrations: [mdx(), sitemap({serialize(item){const at=listicleModified.get(new URL(item.url).pathname);if(at)item.lastmod=at;return item;}})],
  markdown: {
    rehypePlugins: [[releaseAwareInternalLinks, {
      contentDir: fileURLToPath(new URL("./src/content/pages", import.meta.url)),
      additionalContentDirs: [fileURLToPath(new URL("./src/content/listicle-reviews", import.meta.url))],
      production: (process.env.SITE_ENV ?? "").toLowerCase() === "production",
      now: new Date(releaseNow()),
    }], [reviewMarkup, {site: "https://airporttransfersingapore.com/"}]],
  },
  vite: {
    plugins: [tailwind],
  },
});
