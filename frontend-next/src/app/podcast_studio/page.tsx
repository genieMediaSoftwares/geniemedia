import type { Metadata } from "next";

import PodcastStudio from "@/views/PodcastStudio";
import JsonLd from "@/components/seo/JsonLd";
import { buildRouteMetadata } from "@/lib/seo/metadata";
import { metaForRoute } from "@/lib/seo/routeMeta";

export const metadata: Metadata = buildRouteMetadata("/podcast_studio");

export default function PodcastStudioRoute() {
  return (
    <>
      <JsonLd data={metaForRoute("/podcast_studio").schema} />
      <PodcastStudio />
    </>
  );
}
