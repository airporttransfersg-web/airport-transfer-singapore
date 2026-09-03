# Airport Transfer Singapore - Design System

## Design thesis

A calm, exacting Singapore transport brand: editorial enough to feel premium, practical enough to make booking effortless. Photography carries atmosphere; typography carries authority; fine rules and disciplined spacing carry structure. The result must feel like a real specialist operator, not a generic luxury template.

## Color tokens

- `--color-ink`: `#121315` - primary text, dark bands, primary actions
- `--color-ivory`: `#F6F3EC` - primary page background
- `--color-paper`: `#FFFFFF` - form and content surfaces
- `--color-brass`: `#9B825D` - restrained accent, rules, eyebrow text, outlined focus
- `--color-slate`: `#56606A` - secondary text
- `--color-mist`: `#DDD8CE` - dividers and quiet borders
- `--color-success`: `#315B45`
- `--color-destructive`: `#9E332D`

Do not use gradients as decoration. A restrained dark photographic overlay is allowed where needed for legibility.

## Typography

- Headline font: Geist, 500-600 weight
- Body and UI font: Hanken Grotesk, 400-600 weight
- Hero desktop: 64-72px, line-height 0.98-1.05, letter-spacing -0.035em
- Hero mobile: 42-48px, line-height 1.02
- Section heading desktop: 40-48px, line-height 1.05
- Section heading mobile: 30-36px, line-height 1.08
- Body large: 18px, line-height 1.55
- Body regular: 16px, line-height 1.6
- Eyebrow and labels: 12px, 600 weight, uppercase, 0.12em tracking

Never use 100px-plus display type. Avoid serif fonts and novelty faces. Use sentence case except for concise eyebrow labels.

## Layout

- Desktop content width: 1280px maximum
- Desktop gutters: 56-64px
- Mobile gutters: 20px
- Base spacing unit: 8px
- Section rhythm: 96-120px desktop, 64-80px mobile
- Prefer full-width editorial bands, split compositions, image-led rows, and hairline-separated lists
- Avoid repeated card grids. When modular content is required, use rules, shifts in scale, and alternating image/text alignment

## Shape and controls

- Default radius: 2px; maximum radius: 4px
- Buttons and inputs: 48-52px desktop height, at least 48px mobile
- Primary button: ink background, ivory text
- Secondary button: transparent, 1px ink or brass border
- Focus: visible 2px brass outline with 2px offset
- Shadows: none by default; a very soft form-surface shadow is allowed only when separation cannot be achieved with tone and border

## Imagery

Use one decisive photograph per composition: black executive vehicle at Changi Airport, airport arrival details, luggage handling, Singapore city architecture, chauffeur moments, and spacious vehicle interiors. Images should feel documentary, polished, and geographically specific. Do not use supercars, private jets, champagne glasses, staged handshakes, fake uniforms, abstract 3D shapes, or generic skyline montages. All generated imagery is placeholder material for later replacement.

## Navigation and actions

Header navigation: Services, Fleet & Rates, About, Blog, Contact.

Action hierarchy:

1. Request a Quote - primary
2. Book Online - outlined secondary
3. Call Us - quiet text action

Never include WhatsApp.

## Components

- Editorial header with text wordmark and restrained action cluster
- Homepage photographic hero with an integrated compact enquiry module
- Service hero with breadcrumb, topic, supporting copy, and decisive image
- Provider-neutral booking iframe placeholder immediately after every service hero; 700px recommended desktop height; provider and source marked `VERIFY`
- Service index expressed as image-led editorial rows or ruled modules rather than identical rounded cards
- Fleet category rows with capacity, use case, "model or equivalent", and "Request current rates"
- Quiet audience band for travellers, companies, hotels, and travel partners
- Three-step process with large numerals and minimal chrome
- Editorial article shell with featured image, metadata, summary, table of contents, long-form sections, callouts, related content, author block, and final service CTA
- Dark ink footer with structured link columns and contact placeholders

## Accessibility and responsive behavior

- Maintain WCAG AA contrast for text and controls
- Never place essential text over a busy image without a reliable overlay or solid field
- Use semantic headings in logical order
- Preserve visible form labels; do not rely on placeholders alone
- Minimum tap target 44px, preferred 48px
- Mobile designs must recompose image order, form layout, CTA hierarchy, and navigation intentionally
- Avoid horizontal scrolling and clipped type

## Anti-patterns

No gradient blobs, glassmorphism, glow effects, bento dashboards, pill-shaped everything, floating decorative icons, fake metrics, invented testimonials, oversized display type, excessive cards, or filler sections that repeat the same claim.

