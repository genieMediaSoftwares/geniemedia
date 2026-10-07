import { getPublishedBlogsSafe } from "@/lib/api/blogs";
import { getPublishedCaseStudiesSafe } from "@/lib/api/caseStudies";
import { caseStudyUrl } from "@/lib/caseStudies";
import { SITE, canonicalFor } from "@/lib/site";
import { blogCanonical } from "@/lib/seo/metadata";

export const dynamic = "force-static";

const PAGES: Array<[string, string]> = [
  ["Home", "/"],
  ["About", "/about"],
  ["Services", "/services"],
  ["Digital marketing", "/digital_marketing"],
  ["Web development", "/web_development"],
  ["Production house", "/production_house"],
  ["Podcast studio", "/podcast_studio"],
  ["Projects", "/projects"],
  ["Reviews", "/reviews"],
  ["Blog", "/blogs"],
  ["Contact", "/contact"],
  ["Privacy policy", "/privacy-policy"],
  ["Terms and conditions", "/terms-and-conditions"],
];

export async function GET(): Promise<Response> {
  const [posts, caseStudies] = await Promise.all([getPublishedBlogsSafe(), getPublishedCaseStudiesSafe()]);
  const lines = [
    `# ${SITE.name}`,
    "",
    `> ${SITE.description}`,
    "",
    `- Location: ${SITE.address.streetAddress}, ${SITE.address.addressLocality} - ${SITE.address.postalCode}`,
    `- Phone: ${SITE.contact.telephone}`,
    `- Email: ${SITE.contact.email}`,
    "",
    "## Pages",
    "",
    ...PAGES.map(([name, path]) => `- [${name}](${canonicalFor(path)})`),
    "",
    ...(caseStudies.length
      ? [
          "## Case studies",
          "",
          `- [All case studies](${canonicalFor("/case-studies")})`,
          ...caseStudies.map((cs) => `- [${cs.title}](${caseStudyUrl(cs.slug)})${cs.shortDescription ? `: ${cs.shortDescription}` : ""}`),
          "",
        ]
      : []),
    "## Articles",
    "",
    ...posts
      .filter((p) => !p.robots_directive.startsWith("noindex"))
      .map((p) => {
        const summary = String(p.direct_answer || p.metaDescription || "").replace(/\s+/g, " ").trim();
        return `- [${p.meta_title || p.title}](${blogCanonical(p)})${summary ? `: ${summary}` : ""}`;
      }),
    "",
  ];
  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}
