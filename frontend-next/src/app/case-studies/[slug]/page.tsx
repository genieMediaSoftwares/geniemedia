import type { Metadata } from "next";
import { notFound } from "next/navigation";

import CaseStudyArticle, { type RelatedArticle } from "@/components/caseStudy/CaseStudyArticle";
import CaseStudyTracker from "@/components/caseStudy/CaseStudyTracker";
import JsonLd from "@/components/seo/JsonLd";
import { getPublishedBlogsSafe } from "@/lib/api/blogs";
import { getPublishedCaseStudiesSafe } from "@/lib/api/caseStudies";
import { blogPath, cleanSlug } from "@/lib/blog";
import { caseStudyDescription, caseStudyTitle, caseStudyUrl, relatedCaseStudies } from "@/lib/caseStudies";
import { NOINDEX_METADATA } from "@/lib/seo/metadata";
import { caseStudyGraph } from "@/lib/seo/schema";
import { SITE } from "@/lib/site";

export const dynamicParams = false;

const PLACEHOLDER = "none";

type Params = { slug: string };

const find = async (slug: string) => (await getPublishedCaseStudiesSafe()).find((cs) => cs.slug === slug) ?? null;

export async function generateStaticParams(): Promise<Params[]> {
  const items = await getPublishedCaseStudiesSafe();
  return items.length ? items.map((cs) => ({ slug: cs.slug })) : [{ slug: PLACEHOLDER }];
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const cs = await find((await params).slug);
  if (!cs) return { title: { absolute: "Page not found | Genie Media & Studio" }, ...NOINDEX_METADATA };

  const title = caseStudyTitle(cs);
  const description = caseStudyDescription(cs);
  const url = caseStudyUrl(cs.slug);
  const image = cs.ogImage || cs.cover?.url || SITE.defaultOgImage;

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
    openGraph: {
      type: "article",
      url,
      title,
      description,
      siteName: SITE.name,
      locale: SITE.locale,
      images: [{ url: image, alt: cs.ogImage ? cs.title : cs.cover?.alt || cs.title }],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default async function CaseStudyRoute({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const all = await getPublishedCaseStudiesSafe();
  const cs = all.find((c) => c.slug === slug);
  if (!cs) notFound();

  const wanted = new Set(cs.relatedBlogs.map((s) => cleanSlug(s)));
  const articles: RelatedArticle[] = wanted.size
    ? (await getPublishedBlogsSafe())
        .filter((b) => wanted.has(cleanSlug(b.permalink)) && !b.robots_directive.startsWith("noindex"))
        .map((b) => ({ title: b.title, href: blogPath(b.permalink), category: b.category }))
    : [];

  return (
    <>
      <JsonLd data={caseStudyGraph(cs)} />
      <CaseStudyTracker slug={cs.slug} />
      <CaseStudyArticle cs={cs} related={relatedCaseStudies(all, cs)} articles={articles} />
    </>
  );
}
