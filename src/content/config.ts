import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const slugPattern = /^\/[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*\/$/;

const sectionSchema = z.object({
  type: z.enum([
    "feature-grid",
    "faq",
    "related-content",
    "call-to-action",
  ]),
  heading: z.string().optional(),
  variant: z.string().optional(),
  items: z
    .array(
      z.object({
        icon: z.string().optional(),
        title: z.string(),
        body: z.string().optional(),
        bullets: z.array(z.string()).optional(),
      }),
    )
    .optional(),
});

const faqItemSchema = z.object({
  question: z.string(),
  answer: z.string(),
});

const pages = defineCollection({
  // File-path IDs (not the default slug-derived IDs) so two entries with the
  // same explicit slug both reach the route table, where duplicates fail the
  // build instead of silently overwriting each other.
  loader: glob({
    pattern: "**/*.{md,mdx}",
    base: "./src/content/pages",
    generateId: ({ entry }) => entry.replace(/\.(md|mdx)$/, ""),
  }),
  schema: z
    .object({
      title: z.string().min(1),
      description: z.string().min(1),
      /** Canonical route; must begin and end with "/". */
      slug: z.string().regex(slugPattern, {
        message:
          'slug must start and end with "/" and use lowercase hyphen-separated segments, e.g. /services/airport-transfers/',
      }),
      pageType: z.enum(["article", "guide", "service", "location", "faq"]),
      template: z.enum(["article", "service", "sales"]).optional(),
      heading: z.string().min(1).optional(),
      published: z.boolean().default(true),
      noindex: z.boolean().default(false),
      canonical: z.string().url().optional(),
      image: z.string().optional(),
      imageAlt: z.string().optional(),
      summary: z.string().optional(),
      author: z.string().optional(),
      authorBio: z.string().optional(),
      authorImage: z.string().optional(),
      datePublished: z.coerce.date().optional(),
      dateModified: z.coerce.date().optional(),
      readingTime: z.coerce.string().optional(),
      sections: z.array(sectionSchema).default([]),
      faq: z.array(faqItemSchema).optional(),
      // --- pSEO run fields (programmatic SEO runbook) ---------------------
      /** Experiment id, e.g. "run-001". Presence turns on the Stage 2 gates. */
      run: z.string().optional(),
      /** Release wave within the run. */
      wave: z.union([z.literal(1), z.literal(2), z.literal(3)]).optional(),
      /** The ONE query this page owns. Must be unique across the collection. */
      headTerm: z.string().min(3).optional(),
      /** Scheduled production release. Staging ignores it. */
      publishAt: z.coerce.date().optional(),
      /** Page-unique facts. Floor of 8 enforced by check:seo when run is set. */
      uniqueFacts: z.number().int().min(0).optional(),
      /** Of those, facts only an operator can state. Floor of 3. */
      operationalFacts: z.number().int().min(0).optional(),
      /** Data-layer row this page was generated from. */
      sourceRow: z.string().optional(),

      // Transport-specific extension fields (generic base schema stays portable).
      service: z.string().optional(),
      location: z.string().optional(),
      bookingMode: z.enum(["external", "embed"]).optional(),
      bookingUrl: z.string().optional(),
    })
    .strict(),
});

export const collections = { pages };
