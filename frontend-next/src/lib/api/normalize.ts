import type {
  Blog,
  BlogCard,
  PortfolioItem,
  Project,
  ProjectStatus,
  BlogDefinition,
  BlogFaq,
  BlogInternalLink,
  BlogKeyFact,
  BlogSchemaType,
  BlogStatus,
  RobotsDirective,
  SlugHistoryEntry,
} from "@/types";
import { arr, isRecord, num, str } from "@/lib/api/coerce";
import { cleanSlug, stripHtml, toIso } from "@/lib/blog";

/**
 * Typed adapters for rows of the `blogs` table. Shared by the server pages and
 * the admin panel, so it must stay free of server-only imports.
 */

const ROBOTS: RobotsDirective[] = ["index,follow", "noindex,follow", "noindex,nofollow"];
const SCHEMA_TYPES: BlogSchemaType[] = ["Article", "BlogPosting", "FAQPage", "HowTo", "NewsArticle"];

const strings = (value: unknown): string[] =>
  arr(value)
    .map((v) => String(v ?? "").trim())
    .filter(Boolean);

const faqs = (value: unknown): BlogFaq[] =>
  arr(value)
    .filter(isRecord)
    .map((f) => ({ question: String(f.question ?? "").trim(), answer: String(f.answer ?? "").trim() }))
    .filter((f) => f.question || f.answer);

const facts = (value: unknown): BlogKeyFact[] =>
  arr(value)
    .filter(isRecord)
    .map((f) => ({ fact: String(f.fact ?? "").trim(), source: String(f.source ?? f.source_url ?? "").trim() }))
    .filter((f) => f.fact);

const definitions = (value: unknown): BlogDefinition[] =>
  arr(value)
    .filter(isRecord)
    .map((d) => ({ term: String(d.term ?? "").trim(), definition: String(d.definition ?? "").trim() }))
    .filter((d) => d.term);

const links = (value: unknown): BlogInternalLink[] =>
  arr(value)
    .filter(isRecord)
    .map((l) => ({ anchor_text: String(l.anchor_text ?? ""), target_slug: String(l.target_slug ?? "") }));

const history = (value: unknown): SlugHistoryEntry[] =>
  arr(value)
    .filter(isRecord)
    .map((h) => ({ slug: String(h.slug ?? ""), changed_at: str(h.changed_at) ?? undefined }))
    .filter((h) => h.slug);

/**
 * Typed adapter for one row of the `blogs` table as the API returns it.
 * Returns null for anything that is not a usable post.
 */
export function normalizeBlog(raw: unknown, { lenient = false }: { lenient?: boolean } = {}): Blog | null {
  if (!isRecord(raw)) return null;
  const id = num(raw.id);
  const title = str(raw.title) ?? (lenient ? "" : null);
  const permalink = cleanSlug(str(raw.permalink));
  // The admin list keeps half-finished drafts (lenient); public pages need a
  // title and a permalink to be renderable.
  if (id === null || title === null || (!lenient && (!title || !permalink))) return null;

  const robots = str(raw.robots_directive);
  const schemaType = str(raw.schema_type);

  return {
    id,
    title,
    permalink,
    metaDescription: str(raw.metaDescription),
    description: String(raw.description ?? ""),
    category: str(raw.category),
    image: str(raw.image),
    keywords: str(raw.keywords),
    status: (str(raw.status) === "published" ? "published" : "draft") as BlogStatus,
    createdAt: num(raw.createdAt),
    updatedAt: num(raw.updatedAt),
    meta_title: str(raw.meta_title),
    focus_keyword: str(raw.focus_keyword),
    secondary_keywords: strings(raw.secondary_keywords),
    canonical_url: str(raw.canonical_url),
    robots_directive: robots && (ROBOTS as string[]).includes(robots) ? (robots as RobotsDirective) : "index,follow",
    schema_type:
      schemaType && (SCHEMA_TYPES as string[]).includes(schemaType) ? (schemaType as BlogSchemaType) : "BlogPosting",
    faq_schema: faqs(raw.faq_schema),
    direct_answer: str(raw.direct_answer),
    key_facts: facts(raw.key_facts),
    definitions: definitions(raw.definitions),
    og_image_url: str(raw.og_image_url),
    alt_text: str(raw.alt_text),
    author_id: num(raw.author_id),
    author_name: str(raw.author_name),
    author_bio: str(raw.author_bio),
    reviewer_name: str(raw.reviewer_name),
    reviewer_role: str(raw.reviewer_role),
    reviewed_at: str(raw.reviewed_at),
    areas_covered: strings(raw.areas_covered),
    reading_time_minutes: num(raw.reading_time_minutes) ?? 0,
    word_count: num(raw.word_count) ?? 0,
    internal_links: links(raw.internal_links),
    slug_history: history(raw.slug_history),
    last_modified_at: str(raw.last_modified_at),
  };
}


/** The slim card shape the listing pages send to the browser. */
export const toBlogCard = (blog: Blog): BlogCard => ({
  id: blog.id,
  title: blog.title,
  permalink: blog.permalink,
  excerpt: blog.metaDescription || stripHtml(blog.description).slice(0, 220),
  category: blog.category,
  image: blog.image,
  createdAt: blog.createdAt,
  createdIso: toIso(blog.createdAt),
});


export function normalizeProject(raw: unknown): Project | null {
  if (!isRecord(raw)) return null;
  const id = num(raw.id);
  const title = str(raw.title);
  if (id === null || !title) return null;
  return {
    id,
    title,
    description: str(raw.description),
    category: str(raw.category),
    image: str(raw.image),
    projectUrl: str(raw.projectUrl),
    status: (str(raw.status) === "published" ? "published" : "draft") as ProjectStatus,
    displayOrder: num(raw.displayOrder) ?? 0,
    createdAt: num(raw.createdAt),
    updatedAt: num(raw.updatedAt),
  };
}

/** The shape the existing portfolio markup renders ({ name, image, url }). */
export const toPortfolioItem = (p: Project): PortfolioItem => ({
  id: p.id,
  name: p.title,
  image: p.image || "",
  url: p.projectUrl || "",
  description: p.description || "",
  category: p.category || "",
});

