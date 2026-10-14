import type { JsonLdObject } from "@/types";

export const VIZAG_SERVICE_AREA: JsonLdObject = {
  "@type": "City",
  name: "Visakhapatnam",
  alternateName: "Vizag",
  containedInPlace: { "@type": "State", name: "Andhra Pradesh", containedInPlace: { "@type": "Country", name: "India" } },
};

export const LOCAL_SERVICE_AREAS: JsonLdObject[] = [
  VIZAG_SERVICE_AREA,
  ...["Yendada", "Rushikonda", "MVP Colony", "Madhurawada"].map((name) => ({
    "@type": "Place",
    name: `${name}, Visakhapatnam`,
    containedInPlace: VIZAG_SERVICE_AREA,
  })),
];

export const INDIA_SERVICE_AREAS: JsonLdObject[] = [
  ...LOCAL_SERVICE_AREAS,
  { "@type": "State", name: "Andhra Pradesh", containedInPlace: { "@type": "Country", name: "India" } },
  { "@type": "Country", name: "India" },
];
