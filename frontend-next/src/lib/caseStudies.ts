import type { CaseStudy, CaseStudyCategory, CaseStudyImage, CaseStudyMetric, CaseStudyStep, ServicePagePath } from "@/types";
import { arr, isRecord, num, str } from "@/lib/api/coerce";
import { SITE_ORIGIN } from "@/lib/site";

export const CASE_STUDY_CATEGORIES: Array<{ id: CaseStudyCategory; label: string; short: string; service: ServicePagePath }> = [
  { id: "digital-marketing", label: "Digital Marketing", short: "Digital Marketing", service: "/digital_marketing" },
  { id: "web-development", label: "Website Development", short: "Website", service: "/web_development" },
  { id: "production", label: "Video Production", short: "Video Production", service: "/production_house" },
  { id: "podcast", label: "Podcast Production", short: "Podcast", service: "/podcast_studio" },
];

export const SERVICE_PAGES: Record<ServicePagePath, { name: string; summary: string }> = {
  "/digital_marketing": {
    name: "Digital Marketing",
    summary: "SEO, Google Ads, social media and content that bring in enquiries.",
  },
  "/web_development": {
    name: "Website Development",
    summary: "Fast, mobile-friendly business websites and online stores.",
  },
  "/production_house": {
    name: "Video Production",
    summary: "Brand films, ad shoots, event coverage and photography.",
  },
  "/podcast_studio": {
    name: "Podcast Studio",
    summary: "Studio hire, multi-camera video podcasts and editing.",
  },
};

const CATEGORY_IDS = CASE_STUDY_CATEGORIES.map((c) => c.id) as string[];
const SERVICE_PATHS = Object.keys(SERVICE_PAGES);

export const categoryInfo = (id: CaseStudyCategory) => CASE_STUDY_CATEGORIES.find((c) => c.id === id) ?? CASE_STUDY_CATEGORIES[1];

export const caseStudyPath = (slug: string): string => `/case-studies/${slug}`;
export const caseStudyUrl = (slug: string): string => `${SITE_ORIGIN}${caseStudyPath(slug)}`;

const strings = (value: unknown): string[] =>
  arr(value)
    .map((v) => String(v ?? "").trim())
    .filter(Boolean);

const image = (raw: unknown): CaseStudyImage | null => {
  if (!isRecord(raw)) return null;
  const url = str(raw.url);
  if (!url) return null;
  return { url, alt: str(raw.alt) ?? "", caption: str(raw.caption) ?? "", width: num(raw.width), height: num(raw.height) };
};

export function normalizeCaseStudy(raw: unknown, { lenient = false }: { lenient?: boolean } = {}): CaseStudy | null {
  if (!isRecord(raw)) return null;
  const id = num(raw.id) ?? (lenient ? 0 : null);
  const slug = str(raw.slug) ?? (lenient ? "" : null);
  const title = str(raw.title) ?? (lenient ? "" : null);
  const clientName = str(raw.client_name) ?? (lenient ? "" : null);
  const category = str(raw.category);
  if (id === null || slug === null || title === null || clientName === null) return null;
  if (!lenient && (!category || !CATEGORY_IDS.includes(category))) return null;

  const coverUrl = str(raw.cover_image);

  return {
    id,
    projectId: num(raw.project_id),
    slug,
    title,
    clientName,
    clientLogo: str(raw.client_logo),
    shortDescription: str(raw.short_description) ?? "",
    category: (category && CATEGORY_IDS.includes(category) ? category : "web-development") as CaseStudyCategory,
    industry: str(raw.industry),
    location: str(raw.location),
    projectDate: str(raw.project_date),
    projectType: str(raw.project_type),
    overview: str(raw.overview) ?? "",
    challenge: str(raw.challenge) ?? "",
    goals: str(raw.goals) ?? "",
    approach: arr(raw.approach)
      .filter(isRecord)
      .map((s): CaseStudyStep => ({ title: str(s.title) ?? "", description: str(s.description) ?? "" }))
      .filter((s) => s.title || s.description),
    services: strings(raw.services),
    technologies: strings(raw.technologies),
    deliverables: strings(raw.deliverables),
    features: strings(raw.features),
    outcomes: strings(raw.outcomes),
    metrics: arr(raw.metrics)
      .filter(isRecord)
      .map((m): CaseStudyMetric => ({ label: str(m.label) ?? "", value: str(m.value) ?? "", source: str(m.source) ?? "" }))
      .filter((m) => m.label && m.value && m.source),
    cover: coverUrl
      ? { url: coverUrl, alt: str(raw.cover_alt) ?? "", caption: "", width: num(raw.cover_width), height: num(raw.cover_height) }
      : null,
    gallery: arr(raw.gallery)
      .map(image)
      .filter((g): g is CaseStudyImage => g !== null),
    videoUrl: str(raw.video_url),
    testimonial: str(raw.testimonial),
    testimonialAuthor: str(raw.testimonial_author),
    testimonialRole: str(raw.testimonial_role),
    websiteUrl: str(raw.website_url),
    relatedServices: strings(raw.related_services).filter((p): p is ServicePagePath => SERVICE_PATHS.includes(p)),
    relatedBlogs: strings(raw.related_blogs),
    seoTitle: str(raw.seo_title),
    seoDescription: str(raw.seo_description),
    ogImage: str(raw.og_image),
    status: str(raw.status) === "published" ? "published" : "draft",
    displayOrder: num(raw.display_order) ?? 0,
    publishedAt: num(raw.published_at),
    createdAt: num(raw.createdAt),
    updatedAt: num(raw.updatedAt),
  };
}

export const paragraphs = (value: string | null | undefined): string[] =>
  String(value || "")
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s*\n\s*/g, " ").trim())
    .filter(Boolean);

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export const formatProjectDate = (value: string | null | undefined): string | null => {
  const m = String(value || "").match(/^(\d{4})-(\d{2})$/);
  if (!m) return null;
  const month = MONTHS[Number(m[2]) - 1];
  return month ? `${month} ${m[1]}` : null;
};

export const servicesFor = (cs: CaseStudy): ServicePagePath[] =>
  cs.relatedServices.length ? cs.relatedServices : [categoryInfo(cs.category).service];

export function relatedCaseStudies(all: CaseStudy[], current: CaseStudy, limit = 3): CaseStudy[] {
  const services = new Set(servicesFor(current));
  const score = (cs: CaseStudy) =>
    (cs.category === current.category ? 2 : 0) + (servicesFor(cs).some((s) => services.has(s)) ? 1 : 0);
  return all
    .filter((cs) => cs.slug !== current.slug)
    .map((cs) => ({ cs, s: score(cs) }))
    .filter(({ s }) => s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map(({ cs }) => cs);
}

export const caseStudiesForService = (all: CaseStudy[], service: ServicePagePath, limit = 3): CaseStudy[] =>
  all.filter((cs) => servicesFor(cs).includes(service)).slice(0, limit);

export function videoEmbedUrl(url: string | null | undefined): string | null {
  const s = String(url || "");
  const yt = s.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([\w-]{6,})/i);
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}`;
  const vimeo = s.match(/vimeo\.com\/(\d+)/i);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return null;
}

const clampAtWord = (value: string, max: number): string => {
  const s = value.replace(/\s+/g, " ").trim();
  if (s.length <= max) return s;
  const cut = s.slice(0, max - 1);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(" "), max - 20)).replace(/[,;:\-–\s]+$/, "")}…`;
};

export const caseStudyTitle = (cs: CaseStudy): string => {
  if (cs.seoTitle) return cs.seoTitle;
  const { label, short } = categoryInfo(cs.category);
  const candidates = [
    `${cs.clientName} ${label} Case Study | Genie Media & Studio`,
    `${cs.clientName} ${short} Case Study | Genie Media & Studio`,
    `${cs.clientName} ${short} Case Study | Genie Media`,
  ];
  const fallback = `${cs.clientName} Case Study | Genie Media`;
  return candidates.find((t) => t.length <= 60) ?? (fallback.length <= 60 ? fallback : clampAtWord(`${cs.clientName} Case Study`, 60));
};

const firstSentence = (text: string): string => {
  const p = paragraphs(text)[0] || "";
  const m = p.match(/^.+?[.!?](?=\s|$)/);
  return (m ? m[0] : p).trim();
};

export const caseStudyDescription = (cs: CaseStudy): string => {
  if (cs.seoDescription) return clampAtWord(cs.seoDescription, 160);
  const base = cs.shortDescription || firstSentence(cs.overview) || cs.title;
  const extra = firstSentence(cs.overview);
  const combined = base.length < 120 && extra && !base.includes(extra) ? `${base} ${extra}` : base;
  return clampAtWord(combined, 160);
};

export interface ReadinessItem {
  label: string;
  done: boolean;
}

export const publishReadiness = (cs: CaseStudy): ReadinessItem[] => [
  { label: "Short description (50+ characters)", done: cs.shortDescription.length >= 50 },
  { label: "Project overview (150+ characters)", done: cs.overview.length >= 150 },
  { label: "The challenge or the project goals", done: Boolean(cs.challenge || cs.goals) },
  { label: "At least one approach step", done: cs.approach.length > 0 },
  { label: "At least one deliverable", done: cs.deliverables.length > 0 },
  { label: "Cover image with a description", done: Boolean(cs.cover && cs.cover.alt) },
];
