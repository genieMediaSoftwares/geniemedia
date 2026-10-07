import type { Metadata } from "next";

import PodcastStudio from "@/views/PodcastStudio";
import JsonLd from "@/components/seo/JsonLd";
import ServiceSeoSections from "@/components/seo/ServiceSeoSections";
import { getPublishedServiceSeo } from "@/lib/api/serviceSeo";
import RelatedCaseStudies from "@/components/caseStudy/RelatedCaseStudies";
import PlatformsWeUse from "@/components/PlatformsWeUse";
import { buildRouteMetadata } from "@/lib/seo/metadata";
import { metaForRoute } from "@/lib/seo/routeMeta";

export async function generateMetadata(): Promise<Metadata> {
  return buildRouteMetadata("/podcast_studio", await getPublishedServiceSeo("/podcast_studio"));
}

export default async function PodcastStudioRoute() {
  const seo = await getPublishedServiceSeo("/podcast_studio");
  return (
    <>
      <JsonLd data={metaForRoute("/podcast_studio", seo).schema} />
      <PodcastStudio platforms={<PlatformsWeUse type="podcastStudio" />} h1={seo?.preferredH1 || undefined} />
      {seo && <ServiceSeoSections sections={seo.sections} links={seo.internalLinks} />}
      <RelatedCaseStudies service="/podcast_studio" />
    </>
  );
}
