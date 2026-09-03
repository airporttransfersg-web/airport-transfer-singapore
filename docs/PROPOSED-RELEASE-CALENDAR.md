# Proposed production release calendar

Status: approved and applied. These dates are written into the page frontmatter.

This plan follows the requested launch order, keeps the first week focused on a complete site foundation, and limits the release to one or two new pages per day. Dates are stored as date-only `publishAt` values; the daily production rebuild should run after 08:00 Singapore time (GMT+8). The production build publishes only pages whose `publishAt` date has arrived. Staging continues to render the complete site.

## Week 1 — site foundation

| Date | Pages | Route |
| --- | --- | --- |
| Tue 1 Sep 2026 | Home page | `/` |
| Tue 1 Sep 2026 | Service hub | `/services/` |
| Tue 1 Sep 2026 | About | `/about/` |
| Wed 2 Sep 2026 | Contact | `/contact/` |
| Thu 3 Sep 2026 | Blog hub | `/blog/` |
| On hold | Terms of service — awaiting legal operator details | `/terms/` |
| Fri 4 Sep 2026 | Privacy policy | `/privacy/` |

## Week 2 — core services

| Date | Pages | Route |
| --- | --- | --- |
| Mon 7 Sep 2026 | Changi Airport transfer hub | `/services/changi-airport-transfers/` |
| Tue 8 Sep 2026 | Hourly chauffeur | `/services/hourly-chauffeur/` |
| Tue 8 Sep 2026 | Cruise terminal transfer | `/services/cruise-terminal-transfer/` |
| Wed 9 Sep 2026 | Corporate transport | `/services/corporate-transport/` |
| Thu 10 Sep 2026 | Seletar Airport transfers | `/services/seletar-airport-transfers/` |
| Thu 10 Sep 2026 | City and hotel transfer | `/services/city-transfer/` |
| Fri 11 Sep 2026 | Events and group transport | `/services/event-group-transport/` |

The “main service page” is treated as the `/services/` hub in Week 1; the Changi page is the dedicated hub in Week 2.

## Week 3 — route pages, first group

| Date | Pages | Route |
| --- | --- | --- |
| Mon 14 Sep 2026 | R-Orchard | `/services/changi-airport-transfers/orchard/` |
| Tue 15 Sep 2026 | R-Clarke Quay | `/services/changi-airport-transfers/clarke-quay/` |
| Wed 17 Sep 2026 | R-Bukit Timah | `/services/changi-airport-transfers/bukit-timah/` |
| Fri 18 Sep 2026 | R-Holland Village | `/services/changi-airport-transfers/holland-village/` |

## Week 4 — route pages, second group

| Date | Pages | Route |
| --- | --- | --- |
| Mon 21 Sep 2026 | R-MBCCS | `/services/changi-airport-transfers/mbccs/` |
| Tue 22 Sep 2026 | R-Sentosa | `/services/changi-airport-transfers/sentosa/` |
| Thu 24 Sep 2026 | R-SCC HarbourFront | `/services/changi-airport-transfers/scc/` |

## Week 5 — remaining supporting pages

| Date | Pages | Route |
| --- | --- | --- |
| Mon 28 Sep 2026 | Fleet and rates | `/fleet-rates/` |
| Mon 28 Sep 2026 | Contract accounts | `/contract-accounts/` |
| Tue 29 Sep 2026 | Changi airport transfer guide | `/blog/changi-airport-transfer-guide/` |
| Wed 30 Sep 2026 | Choosing an airport transfer vehicle | `/blog/choosing-airport-transfer-vehicle/` |
| Thu 1 Oct 2026 | Hourly chauffeur questions | `/blog/hourly-chauffeur-questions/` |
| Fri 2 Oct 2026 | VIP Airport Assistance | `/services/vip-airport-assistance/` |

## Release rules

- Week 1 has six releasable foundation pages; Terms remains on hold pending legal operator details.
- Week 2 has seven core service pages, released across four weekdays.
- Weeks 3–4 contain all seven requested route pages.
- Week 5 contains six remaining published pages, within the requested five-to-six-pages-per-week range.
- Links to a page scheduled for a later date are rendered as plain text until that page is released; the next production build restores the link automatically.
- The sitemap contains only pages released at the time of each production build.
- A production build must pass the internal-link integrity check before deployment.

## Approval

These dates have been assigned to the matching page frontmatter as `publishAt` values. Review the production preflight, then configure the daily production rebuild after 08:00 Singapore time. This document remains the human-readable schedule next to the page-level dates.
