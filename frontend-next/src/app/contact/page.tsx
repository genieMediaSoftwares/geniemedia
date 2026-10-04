import type { Metadata } from "next";

import ContactSec from "@/components/contactSection";
import JsonLd from "@/components/seo/JsonLd";
import { buildRouteMetadata } from "@/lib/seo/metadata";
import { metaForRoute } from "@/lib/seo/routeMeta";

export const metadata: Metadata = buildRouteMetadata("/contact");

export default function ContactRoute() {
  return (
    <>
      <JsonLd data={metaForRoute("/contact").schema} />
      <ContactSec isPage />
    </>
  );
}
