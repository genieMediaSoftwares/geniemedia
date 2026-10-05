/**
 * Domain types for the data the Express backend returns.
 *
 * The backend hydrates the JSON columns into real arrays (hydrateSeoRow), but
 * older rows and partial admin payloads can still be missing fields, so the raw
 * shapes are kept loose and every consumer goes through the adapters in
 * src/lib/api/*, which produce the strict types below.
 */

export type BlogStatus = "published" | "draft";
export type RobotsDirective = "index,follow" | "noindex,follow" | "noindex,nofollow";
export type BlogSchemaType = "Article" | "BlogPosting" | "FAQPage" | "HowTo" | "NewsArticle";

export interface BlogFaq {
  question: string;
  answer: string;
}

export interface BlogKeyFact {
  fact: string;
  source: string;
}

export interface BlogDefinition {
  term: string;
  definition: string;
}

export interface BlogInternalLink {
  anchor_text: string;
  target_slug: string;
}

export interface SlugHistoryEntry {
  slug: string;
  changed_at?: string;
}

/** The SEO / AEO / GEO columns added by Backend/db/migrateBlogSeo.js. */
export interface BlogSEO {
  meta_title: string | null;
  focus_keyword: string | null;
  secondary_keywords: string[];
  canonical_url: string | null;
  robots_directive: RobotsDirective;
  schema_type: BlogSchemaType;
  faq_schema: BlogFaq[];
  direct_answer: string | null;
  key_facts: BlogKeyFact[];
  definitions: BlogDefinition[];
  og_image_url: string | null;
  alt_text: string | null;
  author_id: number | null;
  author_name: string | null;
  author_bio: string | null;
  reviewer_name: string | null;
  reviewer_role: string | null;
  reviewed_at: string | null;
  areas_covered: string[];
  reading_time_minutes: number;
  word_count: number;
  internal_links: BlogInternalLink[];
  slug_history: SlugHistoryEntry[];
  last_modified_at: string | null;
}

export interface Blog extends BlogSEO {
  id: number;
  title: string;
  /** Stored without a leading slash, may contain slashes ("category/post"). */
  permalink: string;
  metaDescription: string | null;
  /** Article body HTML (TipTap output). */
  description: string;
  category: string | null;
  image: string | null;
  keywords: string | null;
  status: BlogStatus;
  /** Epoch milliseconds. */
  createdAt: number | null;
  /** Epoch milliseconds. */
  updatedAt: number | null;
}

/** The subset of a blog the listing pages and cards need. */
export type BlogSummary = Pick<
  Blog,
  "id" | "title" | "permalink" | "metaDescription" | "description" | "category" | "image" | "createdAt" | "status" | "keywords" | "meta_title"
>;

/**
 * What a blog card needs, built on the server so the full article HTML is
 * never shipped to the browser just to render a listing.
 */
export interface BlogCard {
  id: number;
  title: string;
  permalink: string;
  excerpt: string;
  category: string | null;
  image: string | null;
  createdAt: number | null;
  createdIso: string | null;
}

export type ProjectStatus = "published" | "draft";

export interface Project {
  id: number;
  title: string;
  description: string | null;
  category: string | null;
  image: string | null;
  projectUrl: string | null;
  status: ProjectStatus;
  displayOrder: number;
  createdAt: number | null;
  updatedAt: number | null;
}

/** A project as the public portfolio markup renders it. */
export interface PortfolioItem {
  id?: number;
  name: string;
  image: string;
  url: string;
  description?: string;
  category?: string;
}

export interface ProjectSEO {
  title: string;
  description: string;
  canonical: string;
}

export interface Service {
  title: string;
  href: string;
  description?: string;
}

export interface Testimonial {
  name: string;
  role?: string;
  text: string;
  rating?: number;
}

export interface User {
  id: number;
  email: string;
}

/** Shape every backend error and mutation response shares. */
export interface ApiResponse {
  success: boolean;
  message?: string;
  detail?: string;
}

export interface LoginResponse extends ApiResponse {
  token?: string;
}

export interface MutationResponse extends ApiResponse {
  id?: number;
  warnings?: string[];
}

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
}

export interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
}

export interface UploadResult {
  url: string;
}

export interface RouteMetaEntry {
  title: string;
  description: string;
  image?: string;
  /** Short page name for the BreadcrumbList (defaults to the title's first part). */
  breadcrumb?: string;
}

export interface RouteMeta extends RouteMetaEntry {
  canonical: string;
  schema?: JsonLdGraph;
}

export type JsonLdValue = string | number | boolean | null | JsonLdObject | JsonLdValue[];
export interface JsonLdObject {
  [key: string]: JsonLdValue | undefined;
}
export interface JsonLdGraph {
  "@context": string;
  "@graph": JsonLdObject[];
}
