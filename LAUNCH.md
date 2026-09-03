# Launch checklist — airport-transfer-singapore

Run in order. Nothing here is reversible-by-accident except step 0, which is
what makes the rest reversible.

## 0. Version control (do this first)

```bash
cd ../..            # repo root
git init && git add -A && git commit -m "Pre-launch state"
```

Steps 3 and 4 rewrite frontmatter across a dozen files. Without a commit here
there is no undo.

## 1. Gates must be green

```bash
npm run check          # astro check + the pSEO gates
```

Warnings about missing `headTerm` are expected until they are backfilled.
Failures are not — fix them before going further.

## 2. Decide what is live on day one

A real transport company launches with its services visible and adds route
pages over time. Recommended split:

- **Day one:** home, services hub, all service pages, company pages
- **Staggered:** the 7 Changi route pages (the programmatic set)

```bash
npm run schedule -- --start <YYYY-MM-DD> --weeks 4 --all \
  --always-live company,blog,services
```

To stagger the service pages too, drop `services` from `--always-live`. The
scheduler puts hubs before their spokes either way and refuses to write a
calendar that would orphan a child page.

## 3. Review the calendar, then write it

```bash
npm run schedule -- --start <YYYY-MM-DD> --weeks 4 --all --always-live company,blog,services --write
git diff              # every scheduled date, reviewable
```

Pages dated on or before launch day go live immediately. Anything later is
built out on its date by the daily cron.

## 4. Build for production and verify locally

```bash
npm run build:production
grep -c "noindex" dist/index.html      # expect 0
cat dist/robots.txt                    # expect "Allow: /" + the Sitemap line
ls dist/sitemap-index.xml              # must exist
```

Confirm a page with a future `publishAt` is **absent** from `dist/`.

## 5. Point the domain

- Production Cloudflare Pages project → the live domain, build command
  `npm run build:production`.
- Staging stays a **separate** project on its own hostname, keeps Cloudflare
  Access, and keeps building with plain `npm run build` so it stays noindexed.

## 6. Verify live

```bash
curl -sI https://airporttransfersingapore.com/ | grep -i x-robots-tag   # expect nothing
curl -s  https://airporttransfersingapore.com/robots.txt
curl -s  https://airporttransfersingapore.com/sitemap-index.xml | head
```

A scheduled page should return 404, not render.

## 7. Search Console

1. Add the property (domain property, not URL-prefix).
2. Verify via DNS TXT in Cloudflare.
3. Sitemaps → submit `sitemap-index.xml`. **Once.** Google re-reads it on its
   own; there is nothing to resubmit per wave.
4. URL Inspection → Request indexing on the home page and the services hub.
   Those two only — the rest is what the experiment is measuring.

## 8. Arm the release cron

Cloudflare Cron Trigger, daily 09:00 SGT:

1. `npm run check`
2. on pass, POST the production deploy hook
3. on fail, do nothing and report the failing gate

The cron never writes frontmatter. The build decides what is live, from
`publishAt`, so running it twice changes nothing and a missed day catches up.

## 9. Discovery files per wave

Regenerate `llms.txt` at the end of each wave so it lists pages that exist.
The sitemap needs no attention — held-back pages were never built into it.

## 10. Diary

Day 7, 14, 30 checks and the day-45 GSC audit. Put the day-45 date in the
calendar now, not later.
