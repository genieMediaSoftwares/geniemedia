import { SEO_TAXONOMY } from "../src/content/seoTaxonomy.ts";

export const PAGE_KEYWORDS = Object.fromEntries(
  SEO_TAXONOMY.map((topic) => [
    topic.path,
    Object.entries(topic.terms).flatMap(([tier, terms]) => terms.map((term) => ({ term, tier }))),
  ]),
);
