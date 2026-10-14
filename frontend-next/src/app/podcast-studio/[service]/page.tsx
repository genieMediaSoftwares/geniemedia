import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ServiceSubPage from "@/components/serviceSubPage/ServiceSubPage";
import JsonLd from "@/components/seo/JsonLd";
import { PODCAST_SECTION as SECTION, findSubPage } from "@/content/serviceSubPages";
import { buildSubPageMetadata, subPageGraph } from "@/lib/seo/serviceSubPageSeo";

export const dynamicParams = false;

type Params = { service: string };

export function generateStaticParams(): Params[] {
  return SECTION.pages.map((p) => ({ service: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const page = findSubPage(SECTION, (await params).service);
  return page ? buildSubPageMetadata(SECTION, page) : {};
}

export default async function PodcastStudioServiceRoute({ params }: { params: Promise<Params> }) {
  const page = findSubPage(SECTION, (await params).service);
  if (!page) notFound();
  return (
    <>
      <JsonLd data={subPageGraph(SECTION, page)} />
      <ServiceSubPage section={SECTION} page={page} />
    </>
  );
}
