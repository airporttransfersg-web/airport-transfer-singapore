# ATS IndexChex automation

The `Deploy production site` workflow submits newly released ATS URLs after the
Cloudflare Pages deployment completes and its live sitemap reflects the new
production build. It reads the canonical production sitemap index, ignores
non-ATS URLs, and remembers accepted URLs in a GitHub Actions cache to avoid
resubmitting the same URLs on later daily release runs.

The GitHub repository needs the Actions repository secret `INDEXCHEX_API_KEY`.
Keep the key in GitHub Secrets; never commit it or print it in workflow logs.
If the key is missing, the website deploy can succeed while IndexChex submission
is skipped with a clear workflow notice.

For a one-URL smoke test, use **Actions → Deploy production site → Run
workflow** and set `indexchex_url_limit` to `1`. The default `0` submits all
newly released URLs. Scheduled runs use that default and continue with any URLs
left over from a limited test.

Submissions use the IndexChex native API at `https://indexchex.com/api`,
standard URL submission (no `instantIndex` option), and batches of at most 1,000
URLs. The workflow only submits production sitemap URLs after verifying they are
present in the live ATS sitemap.
