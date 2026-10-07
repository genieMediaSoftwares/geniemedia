import type { Metadata } from "next";

import LiveCaseStudyArticle from "@/components/caseStudy/LiveCaseStudyArticle";

export const metadata: Metadata = { title: { absolute: "Case Study | Genie Media & Studio" }, description: null };

export default function CaseStudyViewRoute() {
  return <LiveCaseStudyArticle />;
}
