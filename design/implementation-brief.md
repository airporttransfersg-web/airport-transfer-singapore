# Airport Transfer Singapore - Stitch Prototype Brief

## Scope

Create the standard nine-screen Stitch prototype for airporttransfersingapore.com:

1. Landing desktop
2. Landing mobile
3. Airport transfer service desktop
4. Airport transfer service mobile
5. Blog index desktop
6. Blog article desktop
7. Blog article mobile
8. Services index desktop
9. Booking-focused hourly chauffeur service desktop

This phase ends at visual approval. Astro implementation begins only after the user approves the Stitch direction and exports the Stitch zip.

## Audience and conversion

The site serves leisure travellers, business travellers, corporate travel managers, hotels, and travel agents.

- Primary action: Request a Quote through an email enquiry form
- Secondary action: Book Online through the existing booking application
- Tertiary action: Call Us
- Do not include WhatsApp

## Services and fleet

Service-page copy, vehicle details, policies, and rates are provisional and must be marked `VERIFY` where factual confirmation is required.

Initial services:

- Singapore Airport Transfers
- Hourly Chauffeur Service
- Corporate Transportation
- Hotel and City Transfers
- Events and Group Transportation
- VIP Airport Assistance

Initial fleet categories:

- Business Sedan - up to 3 passengers
- Premium MPV - up to 6 passengers
- Executive Van - up to 7 passengers
- First Class - luxury sedans, MPVs, and vans
- Accessible Vehicles - wheelchair-adapted options
- Minibus and Coach - approximately 9 to 40 passengers

Use "model or equivalent" and "Request current rates" until the catalogue is confirmed. Never invent reviews, awards, customer logos, performance statistics, prices, legal statements, or availability promises.

### Fleet photography

Seven fleet-accurate operator photographs have been supplied and catalogued under `design/assets/fleet-reference/`. Use these in preference to AI-generated vehicle images during implementation.

Website components must load the plate-free derivatives from `design/assets/fleet-public-safe/`, never the unedited reference originals.

- Mercedes-Benz S-Class: First Class and hero imagery
- Toyota Alphard: Premium MPV
- Mercedes-Benz V-Class: Executive Van and hotel-transfer imagery
- Mercedes-Benz Sprinter: Minibus and group transportation
- Multi-vehicle street photograph: corporate/event operations imagery

A dedicated Business Sedan, wheelchair-accessible vehicle, and full-size coach photograph are still required. Publication also requires an image-rights check and treatment of visible registration plates, third-party logos, incidental people, and identifying details.

## Content architecture

- Homepage target topic: airport transfer Singapore
- Service family: `/services/`
- Blog family: `/blog/`
- Representative service: Singapore Airport Transfers
- Booking-focused service: Hourly Chauffeur Service
- Representative article: A Practical Guide to Changi Airport Transfers

Every service screen must place a provider-neutral rectangular booking-form iframe placeholder immediately after its hero. Reserve approximately 700px desktop height and make it full-width and responsive on mobile. Label provider and source `VERIFY`.

## Acceptance criteria

- Exactly nine canonical screen roles in one Stitch project
- One shared design-system asset across all screens
- Desktop and mobile are purpose-composed, not simple crops
- Clear semantic heading hierarchy, breadcrumbs on secondary pages, and editorial long-form structure
- Primary conversion is immediately legible
- No WhatsApp, fabricated proof, or unconfirmed rates
- No generic AI visual tropes such as gradient blobs, glass cards, bento dashboards, excessive rounded cards, decorative icon tiles, or oversized novelty typography
