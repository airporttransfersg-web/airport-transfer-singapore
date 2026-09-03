<!-- Narrative reference for the `pseo-run` skill. The executable version
     is skills/pseo-run/SKILL.md — this file carries the reasoning, the
     gate rationale and the failure modes behind it. -->

# Microsite pSEO Runbook

_MySingaporeDriver · Programmatic SEO_

A five-stage pipeline for standing up a new MSD microsite from keyword map to published pages — with the gate that has to pass before each stage hands off to the next.

**Run** 001 **Target** New microsite, separate domain **Batch** 10–30 pages **Waves** 5 → 10 → 15 **Read-out** Day 45

## What the experiment is testing

The pipeline is the thing under test, not the pages. The question is whether an agentic chain — structure, plan, generate, humanise, build — can produce pages that get indexed and rank without a human writing each one. Everything below exists to make that answerable rather than vibes-based.

Write the hypothesis down before Stage 1 and don't move it afterwards. Something like: _30 route pages built from one template and a variable data layer will reach 70% indexation by day 30 and at least 40% of them will hold an average position under 30 for their assigned head term by day 45._ A number you can be wrong about is the point.

**Publish in waves, not all at once.** Five seed pages, then ten, then fifteen — spaced roughly two weeks apart. A single 30-page drop on a new domain gives you one indexation signal you can't interpret. Three waves let you see whether wave 2 indexes faster than wave 1, which is the actual sign the domain is warming up. 

## The chain at a glance

Stage| Skill| Output artifact| Blocks on  
---|---|---|---  
**0** Frame | — | Hypothesis + metric, domain, tracker | Nothing  
**1** Site structure | `seo-site-architecture` | URL map, keyword ownership, link plan | Stage 0  
**2** Page architecture | `argentic-visual-semantic-seo-sales-structure-planning` | 8-sheet build sheet per template + data layer | Stage 1 gate  
**3** Generate + humanise | `whole-site-semantic-seo-content` → `humanise` → `clean-user-facing-text` | Section-by-section content xlsx, cleared | Stage 2 gate  
**4** Build handoff | Codex agent | Live site, sitemap, schema, llms.txt | Stage 3 gate  
**5** Measure | `gsc-diagnostic-audit` | Day-45 read-out, scale-or-kill call | Publish + 45 days  
  
Skill names above are the ones already installed in this project. Where a stage names two skills in sequence, run them in that order in the same thread so the second sees the first's output.

## Stage detail

STAGE 0

### Frame the experiment

Half an hour that decides whether the next six weeks produce a result or an opinion.

Input
    Commercial goal, candidate domain, MSD's existing keyword ownership
Output
    One-paragraph hypothesis, the metric, the tracker seeded with page rows
Owner
    You, not an agent

  1. **Pick the variable dimension.** Programmatic means one repeating pattern with a swappable value — routes, venues, vehicle classes, occasions. Pick _one_. Crossing two dimensions at 30 pages produces near-duplicates.
  2. **Register the domain and check its history.** Expired domain with a spam history will confound the whole read-out. Check archive and any prior indexation before committing.
  3. **Decide the boundary with mysingaporedriver.com.** Which head terms the microsite is allowed to target, and which are off-limits because MSD already owns them. Write this list down — Stage 1 checks against it.
  4. **Set the read-out date** and put it in the calendar now. Day 45 from wave 1 publish.

Gate 0 → 1

  * Hypothesis states a number and a date
  * Variable dimension is singular and has at least 30 real instances behind it
  * Off-limits term list exists and is written down

STAGE 1

### Site structure planning

Decide what pages exist and what each one owns, before a word is written.

Skill
    `seo-site-architecture`
Input
    Service list, the variable dimension, the off-limits terms, MSD's existing URL set
Output
    URL map, keyword ownership table, internal link and anchor plan, launch priority

  1. Run the skill against the microsite brief. Feed it the MSD sitemap too — it needs to see the money site to avoid pointing the microsite at terms MSD already ranks for.
  2. Apply **Query Deserves a Page** to every proposed URL: real demand, distinct entity, low similarity to its siblings, recurring pattern. Anything failing one of those becomes a section on a parent page instead of its own URL. At 30 pages you will typically cut 5–8 here, and that cut is the single highest-value thing this stage does.
  3. Fix the URL pattern once and never change it. Flat, predicate-led, no dates, no IDs.
  4. Write the anchor plan: outer informational pages link into core commercial pages, never the reverse, and no anchor text repeats three or more times sitewide.
  5. Mark which microsite pages carry the editorial outbound link to mysingaporedriver.com. Inside predicate-matched sections only — no footer link block.

▸ Stage 1 prompt
    
    
    I'm building a new microsite on [DOMAIN] as an external topical map
    feeding mysingaporedriver.com.
    
    Central entity: Singapore Transport
    Source context: Ground transport / chauffeur service, operator-run
    Variable dimension for the programmatic set: [ROUTES / VENUES / etc]
    
    Off-limits head terms (owned by mysingaporedriver.com):
    [LIST]
    
    Target: 25-30 URLs total, launched in three waves.
    
    Give me the site architecture: page hierarchy, URL structure,
    keyword ownership per page, cannibalisation check against both the
    microsite's own siblings and the MSD sitemap attached, internal
    linking and anchor plan, and launch priority by wave.
    
    Flag any proposed page that fails Query Deserves a Page and tell me
    which parent page it should fold into as a section instead.

Gate 1 → 2

  * No two microsite URLs share a head term
  * No microsite URL targets a term on the off-limits list
  * Every surviving URL passes all four QDAP criteria
  * Anchor plan exists and no anchor appears 3+ times

STAGE 2

### Agentic page architecture + the data layer

One template, thirty rows of real data. This is what separates programmatic from thirty hand-written pages.

Skill
    `argentic-visual-semantic-seo-sales-structure-planning`
Input
    Stage 1 URL map, one representative page's target query set
Output
    8-sheet build sheet per template, plus a data-layer spreadsheet with one row per page

  1. **Plan templates, not pages.** At this batch size expect two or three: a hub, a programmatic spoke, and possibly a comparison page. Run the structure skill once per template.
  2. **Split every section into constant or variable.** The build sheet's H1–H4 skeleton gets a third column: does this section's content change per page, or is it identical sitewide? Constant sections are written once. Variable sections get slots.
  3. **Build the data layer.** One row per page, one column per variable slot — distance, drive time, fare, meet point, peak window, nearby landmark, typical passenger profile, a local operational fact. Fill it from dispatch data and operator knowledge, not from the model.
  4. **Set the unique-fact floor.** Minimum eight page-unique facts per spoke page, of which at least three are operational things a competitor cannot state. Under that floor the page is thin regardless of word count. Add columns until every row clears it.
  5. Confirm the four mandatory information-gain assets are present in the skeleton: pricing table, route table with distance and a drive-time range, mode comparison matrix naming real local operators, and local operational facts.
  6. Lock the schema and meta spec — one pattern with variable slots, same as the copy.

**The data layer is the deliverable of this stage.** If it has empty cells when you reach Stage 3, the model will fill them, and it will fill them with plausible fiction. Every blank cell is a fabricated fact waiting to happen.

▸ Stage 2 prompt
    
    
    Attached: the Stage 1 site architecture for [DOMAIN].
    
    Build the page structure for the programmatic spoke template —
    the one that will be repeated across [N] pages, one per [DIMENSION].
    
    Two requirements on top of the standard build sheet:
    
    1. In the H1-H4 skeleton, mark every section CONSTANT (written once,
       identical sitewide) or VARIABLE (changes per page). For each
       VARIABLE section, name the exact data fields it needs.
    
    2. From those fields, give me a data-layer schema: the column list
       for a spreadsheet where each row is one page. Include a
       unique-fact count column — I'm enforcing a floor of 8 page-unique
       facts, at least 3 of them operational.
    
    Then do the same for the hub template.

Gate 2 → 3

  * Every section is marked constant or variable — none unclassified
  * Data layer has zero empty cells across all page rows
  * Every row clears the 8-unique-fact floor, 3+ operational
  * All four information-gain assets present in the skeleton
  * Any figure you cannot source is marked `[NEEDED]`, not guessed

STAGE 3

### Content generation and humanisation

Generate against the template and the data layer, then strip the machine register out of it.

Skills
    `whole-site-semantic-seo-content` → `humanise` → `clean-user-facing-text`
Input
    Build sheets, filled data layer, MSD house voice reference
Output
    Section-by-section content xlsx, humanised, duplication-checked

  1. **Constant sections first, once.** Write them, humanise them, approve them, freeze them. They never get regenerated per page.
  2. **Then variable sections in batches of five pages.** Batching keeps the model's context on the data rather than on its own previous output, which is where template-echo comes from.
  3. **Spin the shared sections that must vary.** The fleet write-up and any block reused from MSD sales pages get rewritten per page so the category names stay identical but the prose does not.
  4. Run `humanise` across the full set, then `clean-user-facing-text` for the invisible-character and final-prose pass.
  5. **Run the duplication check.** Pairwise similarity across all pages. Anything over 70% goes back to Stage 3 step 2 with more data-layer columns surfaced in the copy. This is the check that most pSEO experiments skip and then die of.
  6. Surfer term optimisation, then Grammarly, per the standing SOP.
  7. **Fact-check every number against the data layer.** Any figure in the copy that isn't traceable to a cell gets cut.

▸ Stage 3 prompt
    
    
    Attached: build sheet for the [TEMPLATE] template, and the data
    layer with [N] rows.
    
    Write the VARIABLE sections for rows 1-5 only.
    
    Rules:
    - Every factual claim must trace to a cell in the data layer. If a
      cell is blank, write [NEEDED] — do not infer, estimate or round.
    - Match the answer template per section: a price query gets a
      currency figure in sentence one; a duration query gets a range.
    - The grammatical subject of each heading and its first sentence
      must match the subject of the target query.
    - No two pages may open their [SECTION] with the same sentence
      pattern. Vary the construction, not just the nouns.
    
    Return as one row per section, in the build sheet's column format.

Gate 3 → 4

  * Max pairwise similarity between any two pages under 70%
  * Zero `[NEEDED]` markers remaining
  * Every number traced to a data-layer cell
  * Humanise and clean passes both run on the final text, not an earlier draft
  * You have read three pages end to end yourself

STAGE 4

### Build handoff to the Codex agent

Hand over structured data and a spec, not prose and hope.

Input
    Content xlsx, link architecture sheet, schema/meta spec
Output
    Built site, sitemap, schema in visible DOM, `llms.txt`
Format
    One JSON or MDX file per page + one build spec

  1. **Convert the content xlsx into per-page structured files.** Do not paste prose into a chat and ask for a site. One file per page, keyed by section ID, so the build is deterministic and re-runnable when copy changes.
  2. **Write the build spec once:** template components per section type, the schema pattern with its variable slots, meta title/description patterns, the internal link rules from Stage 1, and the URL pattern.
  3. Have the agent build one page first. Review it. Then let it build the rest — a bad template multiplied by 30 is 30 rebuilds.
  4. Generate `llms.txt` with the `llms-txt-generator` skill once the URL set is final.
  5. Ship robots, sitemap, canonical tags, and analytics before wave 1 goes live. Not after.

▸ Stage 4 handoff spec — what the build agent needs
    
    
    REPO: [repo]
    STACK: [framework]
    
    INPUTS
      /content/pages/*.json   one per page, section-keyed
      /content/spec.md        this document
    
    BUILD RULES
    1. Every section in the JSON renders into the visible DOM. Nothing
       in schema that isn't also visible on the page.
    2. FAQPage schema answers must be byte-identical to the visible
       answer text.
    3. Internal links come from links[] in each page JSON. Do not
       invent links. Do not add a footer link block.
    4. URL pattern: [PATTERN]. Slug comes from the JSON, not the title.
    5. Tables get their own horizontally scrolling container.
    6. No client-side rendering of body content.
    
    DELIVERABLES
      built site, sitemap.xml, robots.txt, llms.txt,
      a report listing any page whose JSON was incomplete

Gate 4 → publish

  * Content visible in raw HTML with JS disabled
  * FAQ schema text matches visible text exactly
  * Every internal link resolves; zero orphan pages
  * Canonical tags correct, no accidental noindex
  * LCP under 2.5s on mobile for a spoke page
  * GSC property verified and sitemap submitted

STAGE 4B

### Staging on Cloudflare, then scheduled release

One build, two environments, and a publish date held in the content rather than in a deploy queue.

Staging
    Cloudflare Pages preview project — behind Access, `noindex`, `Disallow: /`
Production
    The EMD, same Astro build, filtered by `publishAt`
Trigger
    Cloudflare Cron Trigger → `check` → deploy hook, daily

  1. **Staging lockdown is already done — keep it that way.** `public/robots.txt` carries `Disallow: /` and `public/_headers` sets `X-Robots-Tag: noindex, nofollow, noarchive`, both marked STAGING ONLY. The risk is that those are the same two files that ship to production and someone edits them by hand at launch. Generate both from an environment flag instead, so staging cannot lose its `noindex` and production cannot inherit it. Put Cloudflare Access in front of the staging project as the second lock.
  2. **Put the release date in the frontmatter, not in a deploy script.** The schema already has `published` and `noindex`; add `publishAt`. Production `getCollection` filters to `published && (!publishAt || publishAt <= now)`; staging ignores the field and renders everything. The sitemap has to use the same filter or it will advertise pages that 404.
  3. **Cron rebuilds, it doesn't publish.** Hermes fires a Cloudflare deploy hook on a schedule; the build decides what's live. That makes the whole thing idempotent — a failed run just means the next one picks the page up, and nothing half-publishes.
  4. **Approve on staging against the Gate 4 list** , not by looking at it. Raw HTML with JS off, schema against visible text, links resolve.
  5. **Drip inside a wave.** One or two pages a day rather than a wave landing in a single build.

**Be clear about what the drip does and doesn't do.** Spacing releases gives you a readable indexation signal and avoids a step-change in site size — worth doing. It is not a defence against scaled content abuse: that policy is about whether pages are individually useful and differentiated, and thirty near-identical pages trickled out over six weeks are still thirty near-identical pages. The Gate 3 similarity check and the unique-fact floor are what protect you here. The schedule is just good sequencing.

▸ The release cron
    
    
    Two separate jobs. Don't merge them.
    
    A. SCHEDULER — run once per wave, by you, not on a timer
       Assigns publishAt across the wave window: max 2 pages per
       calendar day, weekdays only. Writes the dates into the mdx
       frontmatter and commits. Reviewable as a diff.
    
    B. RELEASE — Cloudflare Cron Trigger, daily 09:00 SGT
       1. pnpm --dir sites/<name> run check      (incl. check:seo)
       2. on pass, POST the Cloudflare Pages deploy hook
       3. on fail, do nothing and report which gate failed
    
    The build decides what goes live, from publishAt. The cron only
    rebuilds. That makes it idempotent — run it twice, nothing changes;
    miss a day, the next run catches up; nothing ever half-publishes.
    
    Never let job B write frontmatter. A scheduled release you cannot
    see in a git diff is one you cannot undo.

Gate 4B → live

  * Staging is behind Access, noindex, and robots-disallowed
  * Production build excludes any page with a future `publish_at`
  * Deploy hook is idempotent — running it twice changes nothing
  * No calendar day carries more than two new pages

STAGE 4C

### Launch day — flipping to the live domain

One command changes the environment. Everything else is verifying that it did.

Command
    `SITE_ENV=production pnpm --dir sites/<name> run build`
What flips
    `robots.txt`, `_headers`, and the `publishAt` filter — all three from one flag
Order
    Content live before discovery files, always

  1. **Nobody hand-edits`robots.txt` or `_headers`.** `scripts/prepare-env.mjs` writes both from `SITE_ENV` on every build, and the default is staging. A missing or misspelled flag can only fail toward _less_ exposed — never toward an accidental launch, and never toward a live site that quietly kept its `noindex`.
  2. **Point the domain at the production Pages project** and confirm the staging project keeps its own hostname, its Access rule and its `Disallow: /`. Two projects, two environments — never one project reused, or the staging URL ends up indexed alongside the real one.
  3. **Verify before you announce:** `curl -sI https://<domain>/ | grep -i x-robots-tag` returns nothing, `/robots.txt` reads `Allow: /`, and a page held back by `publishAt` returns 404 rather than rendering.
  4. **Then the discovery files, in this order:** sitemap generated and reachable → `Sitemap:` line present in `robots.txt` → sitemap submitted in Search Console → `llms.txt` published. Submitting a sitemap that lists pages which aren't live yet is the one own-goal available on launch day.
  5. **Generate`llms.txt` with the `llms-txt-generator` skill,** after the URL set is final. It lists the pages that exist now — regenerate it at the end of each wave rather than pre-listing pages that haven't been released.

Gate 4C → live

  * No `X-Robots-Tag` on production responses; staging still has one
  * Production `robots.txt` reads `Allow: /` and names the sitemap
  * Sitemap contains only released pages
  * Held-back pages 404 in production and render on staging
  * Search Console property verified for the live domain, sitemap submitted

STAGE 4D

### The release pattern

A varied calendar, generated once, written into frontmatter, reviewable before it runs.

Command
    `pnpm run schedule -- --start 2026-09-01 --weeks 4`
Shape
    Batches of 1–3, gaps of 1–4 days, weekdays, ~11 publishing days across 30
Applies with
    `--write` — dry run by default

A fixed cadence — three pages every Monday — is a pattern in itself. The generator draws batch sizes and gaps from weighted sets, so the calendar comes out uneven the way a real publishing schedule is uneven, and a fixed seed makes it reproducible: the same command always yields the same dates, so the plan can be reviewed and re-run rather than being a surprise.

Day| Pages| Gap to next  
---|---|---  
Tue 1 Sep| 2| 6 days  
Mon 7 Sep| 2| 1 day  
Tue 8 Sep| 1| 3 days  
Fri 11 Sep| 1| 3 days  
Wed 16 Sep| 2| 5 days  
Thu 24 Sep| 3| …  
  
  1. **Core pages don't stagger.** About, terms, privacy, rates and contact go live on day one — a real site has those from the start, and a visitor who lands on wave 1 needs them. The generator excludes `company/` by default.
  2. **Order is wave first, then priority.** Your best pages go out early, while you still have time to react to what happens to them.
  3. **Review the dry run, then`--write`.** The dates land in frontmatter, so the schedule is a file you can read, not a queue you have to trust.
  4. **The daily cron only rebuilds.** It never writes a date. A release you cannot see in a diff is one you cannot undo.

**Same caveat, once more.** An uneven calendar sequences the experiment and keeps the indexation signal readable. It does not make thin pages safe, and it is not what stands between you and a scaled-content problem — the similarity gate and the unique-fact floor are. Ship the schedule for the first reason.

STAGE 5

### Measure and decide

The experiment only exists if this stage happens on schedule.

Skill
    `gsc-diagnostic-audit`
Checkpoints
    Day 7 · Day 14 · Day 30 · Day 45
Output
    Read-out and a scale, fix, or kill call

Day| Check| What you're looking for  
---|---|---  
7| Indexation| Wave 1 crawled at all. Zero crawled pages at day 7 is a technical problem, not an SEO one.  
14| Indexation + first impressions| >50% of wave 1 indexed. Publish wave 2.  
30| Impressions, query mix| Are the queries the ones the page was built to own, or drift? Publish wave 3.  
45| Full GSC audit| Position, CTR, cannibalisation between microsite siblings and against MSD.  
  
Run `gsc-diagnostic-audit` at day 45 across the microsite _and_ mysingaporedriver.com together. The failure mode worth catching early is the microsite competing with the money site rather than feeding it.

Call| Condition| Next  
---|---|---  
SCALE| >70% indexed, >40% of pages under position 30| Extend the data layer, next 50 pages, same template  
FIX| Indexed but flat impressions, or query drift| Harden the template — the structure is wrong, not the pipeline  
KILL| <30% indexed at day 45| Stop. Diagnose domain, quality or duplication before spending more  
  
## Wiring it into the AI Site Manager

You already have a build chain: a GitHub skill supplies design prompts, Stitch returns nine layout variations, you cull them, and the approved layout goes to Codex. That chain is a _design_ track. The runbook is a _content_ track. They are not competing — they run in parallel and meet once, inside Codex.

> _(Diagram omitted in the Markdown export — see the hosted version.)_

The Stage 2 build sheet is the single source both tracks branch from — it tells Stitch which components a section needs and tells the data layer which fields to carry. Hermes records where each page sits; it does not move work between stages.

**The one ordering change.** Right now Stitch runs first and content is poured into whatever layout you approved. For a programmatic set that is backwards: the section skeleton decides what the layout has to hold. Move Stitch to _after_ Stage 2, so a variation that quietly drops the route table or turns the comparison matrix into an image is disqualified rather than approved.

### Where each step lands in `ai-sites-manager`

The repo already implements most of this. `WORKFLOW.md` describes a four-step Stitch → Astro chain, `skills/stitch-astro-site-builder` drives it, and `sites/airport-transfer-singapore/` is a working instance. The runbook slots in without restructuring anything.

Repo location| Runbook stage| Change needed  
---|---|---  
`sites/<name>/`| Container for the run| None — one site folder per microsite is already the unit  
`skills/local-transport-seo-page-pack`| Stages 1–3| Have it emit the section skeleton before the design brief, not after  
`skills/stitch-astro-site-builder`| Design track| Feed the brief from the Stage 2 skeleton; keep the nine-screen prototype  
`design/screens/`, `design/review/`| Stitch culling| None — the reject/approve trail already exists here  
`src/content/config.ts`| **The gate mechanism**|  Extend the zod schema with the pSEO fields — see below  
`src/content/pages/**.mdx`| Stage 3 output| Frontmatter _is_ the data layer; no separate JSON needed  
`.hermes/environment.json`| Stage 4 build + check| None — it already knows bootstrap, build, test, start  
`public/_headers`, `robots.txt`| Stage 4B staging| Generate them per environment instead of hand-editing at launch  
  
**Correction to the earlier plan: drop the`state.json`.** Hermes here is a build runner, not a memory store — `.hermes/environment.json` holds bootstrap, build, test and start recipes. There is a much better place for run state than a file an agent has to remember to update: the Astro content schema. It is `.strict()`, it runs on every build, and a page that violates it fails `astro check` rather than shipping. Put the gates in the schema and they enforce themselves.

### Gates as schema, not as a checklist

Add the pSEO fields to the `pages` collection. Every one of them is a gate you currently have to remember; as a required field it becomes a build failure instead.

▸ src/content/config.ts — additions
    
    
    // pSEO run fields — added to the existing pages schema
    run:        z.string().optional(),        // "run-001"
    wave:       z.union([z.literal(1), z.literal(2), z.literal(3)]).optional(),
    headTerm:   z.string().min(3).optional(), // the ONE term this page owns
    publishAt:  z.coerce.date().optional(),   // scheduled release, see 4B
    uniqueFacts:      z.number().int().min(8).optional(),
    operationalFacts: z.number().int().min(3).optional(),
    sourceRow:  z.string().optional(),        // data-layer row this page came from
    
    // then, in a check script:
    // - headTerm must be unique across the collection      → Gate 1
    // - headTerm must not appear in off-limits-terms.json  → Gate 1
    // - a page with run set must have wave, headTerm,
    //   uniqueFacts and operationalFacts                   → Gate 2
    // - pairwise similarity of body text under 70%         → Gate 3

The loader already generates file-path IDs specifically so duplicate slugs fail the build rather than silently overwriting. Extend that instinct: a `check:seo` script beside `astro check`, wired into Hermes' `test` recipe, so a gate violation stops the deploy the same way a type error does.

**Two duplicate pairs are live in the repo right now.** `/services/corporate-transport/` and `/services/corporate-transportation/` are both `published: true` and target the same intent; so are `/services/event-group-transport/` and `/services/events-group-transportation/`. The slugs differ so the build passes — which is exactly the hole the `headTerm` uniqueness check closes. Worth resolving before launch rather than after they split each other's signal.

### Culling the nine

Picking by eye is fine for the last step, not the first. Score all nine against the skeleton before you look at whether you like them — it turns nine into about three in a minute, and the three that survive are all publishable.

Check| Disqualifies if  
---|---  
Section coverage| Any section in the Stage 2 skeleton has no home in the layout  
Heading order| H2/H3 order differs from the skeleton, or headings are baked into images  
Tables are tables| Rate table, route table or comparison matrix rendered as a graphic  
First viewport| The page's answer template isn't visible without scrolling  
Repeatability| The layout only works with the exact content length of the sample page  
Text in DOM| Anything load-bearing needs JS to appear  
  
### What Hermes actually does here

Hermes' recipe already names the four commands that matter — `npm install`, `npm run build`, `npm run check`, `npm run dev`. That makes it the right thing to run the gates, and the wrong thing to remember them. Give it one addition and one prohibition:

Hermes does| Hermes does not  
---|---  
Run `check` (now including `check:seo`) before every deploy| Write or edit page copy  
Fire the Cloudflare deploy hook on the release schedule| Decide that a page is ready  
Report which pages failed which gate, from the check output| Hold a private record of project state  
  
Everything it would have remembered is in the frontmatter, in git, and visible in a diff. The tracker spreadsheet stays as the human view for the stages that happen before content exists — Stage 0 and 1, where there are no files yet.

## Failure modes to watch

Symptom| Real cause| Caught at  
---|---|---  
Pages indexed then dropped| Near-duplicate content across the set| Gate 3 similarity check  
Ranks for nothing it was built for| Heading subject doesn't match query subject| Gate 2 answer templates  
Microsite outranks MSD on a money term| Off-limits list not enforced| Gate 1  
Numbers in the copy are wrong| Blank data-layer cells filled by the model| Gate 2 zero-blanks rule  
Nothing crawled after 7 days| Robots, canonical or JS rendering| Gate 4  
Read-out never happens| Day 45 wasn't in the calendar at Stage 0| Gate 0  
  
## Who does what

Four things do work in this pipeline and it isn't obvious which to talk to when. The split is not arbitrary: each stage goes to whichever one holds the tool that stage needs. **Nothing is ever copy-pasted between them.** The handoff is always a file in `sites/<name>/` — that is the whole point of putting the run in the repo.

Stage| Who| Why them| Lands as  
---|---|---|---  
0 Frame| You| It's a commercial decision, not a task| `00-setup.md`  
1 Structure| Claude| Holds `seo-site-architecture`| URL map + `seo/off-limits-terms.json`  
2 Architecture| Claude| Holds the structure-planning skill| Build sheet + data layer xlsx  
2b Design| Codex| Holds the Stitch MCP| `design/screens/`, `design/review/`  
3 Content| Claude| Holds the content, humanise and clean skills| `src/content/pages/**.mdx`  
4 Build| Codex| It's a code task, in the repo| Components, templates, a passing build  
4C Launch| You + Codex| One flag, then verification| `SITE_ENV=production`  
4D Release| A script + cron| Deterministic; nobody should be deciding daily| `publishAt` in frontmatter  
5 Measure| Claude| Holds `gsc-diagnostic-audit`| Read-out + the verdict  
  
**The rule that keeps it straight:** Claude decides _what the pages say_ , Codex decides _how the site is built_ , Hermes _runs the checks_ , and the scripts decide _when pages go live_. When you're unsure who to ask, ask which of those four questions you're actually asking.

### One wave, end to end

#| Where| What you say  
---|---|---  
1| Claude thread| "Run Stage 1 for `sites/<name>`. Variable dimension is X, off-limits terms are Y." → URL map, written to the repo.  
2| Claude, same thread| "Stage 2 for the spoke template." → build sheet + the data-layer columns. **You fill the data layer.** This is the only manual step and the one nobody else can do.  
3| Codex| "Read `02-design-brief.md`, generate the Stitch variations, and disqualify any that fail the section-coverage rules in `skills/pseo-run/SKILL.md`." You pick from what survives.  
4| Claude| "Stage 3, rows 1–5, write straight into `src/content/pages/`." Then humanise, then the similarity check.  
5| Codex| "Build these pages against the approved template. `npm run check` must pass."  
6| Terminal| `npm run schedule -- --start … --weeks 4`, review, then `--write`.  
7| Cron| Runs `check`, fires the deploy hook. You do nothing for four weeks.  
8| Claude, day 45| "Run the GSC audit across the microsite and MSD together."  
  
Steps 1, 2, 4 and 8 are one continuous Claude thread if you want them to be — the skills chain. Steps 3 and 5 are Codex, in the repo. Step 6 is you, once per wave. Step 7 is nobody.

**Where the confusion usually starts:** asking Codex to write the copy, or asking Claude to build the site. Codex will happily write page copy and it will be structurally fine and semantically flat — no query templates, no answer templates, no entity coverage. Claude will happily write Astro components and they'll work and won't match your design system. Each one produces plausible output outside its lane, which is exactly why the split needs to be deliberate.

## What comes after Run 001

Two additions are already planned. Both are worth building — but both depend on Run 001 producing a verdict first, because each one assumes the template is worth feeding.

Addition| Skill| Depends on  
---|---|---  
**Discovery-file upkeep**  
Sitemap resubmission and `llms.txt` regeneration at each wave | `llms-txt-generator`, plus a `postbuild` hook | Nothing — build it into Stage 4C now. Both files go stale the moment a wave lands, and a stale `llms.txt` is worse than none.  
**MOFU supporting content**  
Hub-and-spoke articles feeding the microsite's money pages | `supporting-content-hardening` \+ `pillar-content-hardening` | A SCALE or FIX verdict. Adding supporting content to a set that failed indexation just multiplies the problem.  
**GSC measurement cron**  
Scheduled pull, then a tweak list per page | `gsc-diagnostic-audit` on a schedule | At least 60 days of GSC history. Run it earlier and it reads noise as signal.  
  
For the measurement cron, monthly is the right cadence — not weekly. Position data on a young site moves enough week to week that a weekly job generates a tweak list you shouldn't act on, and acting on it destroys your ability to attribute anything. Have it write into the same `state.json` Hermes owns, as a `gsc` block per page, so the audit and the build history sit in one place.

MySingaporeDriver · pSEO Run 001 · drafted 27 Aug 2026 · update this page rather than forking it
