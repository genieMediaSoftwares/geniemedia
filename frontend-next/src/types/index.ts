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
  permalink: string;
  metaDescription: string | null;
  description: string;
  category: string | null;
  image: string | null;
  keywords: string | null;
  status: BlogStatus;
  createdAt: number | null;
  updatedAt: number | null;
}

export type BlogSummary = Pick<
  Blog,
  "id" | "title" | "permalink" | "metaDescription" | "description" | "category" | "image" | "createdAt" | "status" | "keywords" | "meta_title"
>;

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

export type CaseStudyCategory = "digital-marketing" | "web-development" | "production" | "podcast";
export type ServicePagePath = "/digital_marketing" | "/web_development" | "/production_house" | "/podcast_studio";

export interface CaseStudyStep {
  title: string;
  description: string;
}

export interface CaseStudyMetric {
  label: string;
  value: string;
  source: string;
}

export interface CaseStudyImage {
  url: string;
  alt: string;
  caption: string;
  width: number | null;
  height: number | null;
}

export interface CaseStudy {
  id: number;
  projectId: number | null;
  slug: string;
  title: string;
  clientName: string;
  clientLogo: string | null;
  shortDescription: string;
  category: CaseStudyCategory;
  industry: string | null;
  location: string | null;
  projectDate: string | null;
  projectType: string | null;
  overview: string;
  challenge: string;
  goals: string;
  approach: CaseStudyStep[];
  services: string[];
  technologies: string[];
  deliverables: string[];
  features: string[];
  outcomes: string[];
  metrics: CaseStudyMetric[];
  cover: CaseStudyImage | null;
  gallery: CaseStudyImage[];
  videoUrl: string | null;
  testimonial: string | null;
  testimonialAuthor: string | null;
  testimonialRole: string | null;
  websiteUrl: string | null;
  relatedServices: ServicePagePath[];
  relatedBlogs: string[];
  seoTitle: string | null;
  seoDescription: string | null;
  ogImage: string | null;
  status: "published" | "draft";
  displayOrder: number;
  publishedAt: number | null;
  createdAt: number | null;
  updatedAt: number | null;
}
