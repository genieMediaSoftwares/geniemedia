import type { JsonLdGraph, JsonLdObject } from "@/types";
import { serializeJsonLd } from "@/lib/seo/schema";

/** Server-rendered JSON-LD block. Valid anywhere in the document. */
export default function JsonLd({ data }: { data: JsonLdGraph | JsonLdObject | undefined | null }) {
  if (!data) return null;
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} />;
}
