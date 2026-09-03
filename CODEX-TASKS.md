# Codex tasks — airport-transfer-singapore

## 1. Delete the two retired duplicate pages

Both are earlier stub drafts that collide in intent with the fully written
versions. They are already `published: false`, so they no longer build, and
`public/_redirects` already carries the 301s — but the redirects only fire
once the files are gone from the route table permanently.

```
rm src/content/pages/services/corporate-transportation.mdx
rm src/content/pages/services/events-group-transportation.mdx
```

Keep: `corporate-transport.mdx`, `event-group-transport.mdx`.
Keep the existing redirect lines in `public/_redirects` — they are the reason
the old URLs stay safe:

```
/services/corporate-transportation/     /services/corporate-transport/     301
/services/events-group-transportation/  /services/event-group-transport/   301
```

Then run `npm run check`.

## 2. Backfill `headTerm` on every live page

Gate 1 cannot check uniqueness until each page declares the one query it
owns. `npm run check:seo` currently warns for every page. Add a `headTerm`
to each `.md`/`.mdx` frontmatter — one query per page, no repeats — and
confirm the warnings clear.

## 3. Clear the remaining `VERIFY` markers

`npm run check:seo` lists them. `site.config.ts` also carries VERIFY on the
phone number and booking provider.

## 4. Install `@astrojs/sitemap`

Not installed, and there is no sitemap being emitted. Add the integration to
`astro.config.mjs`, then restore the `Sitemap:` line in
`scripts/prepare-env.mjs` (a TODO marks the spot).

No filter is needed for scheduled releases: a page held back by `publishAt`
is never built in production, so it cannot reach the sitemap.
