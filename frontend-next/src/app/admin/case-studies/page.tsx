import type { Metadata } from "next";

import AdminGate from "@/components/admin/AdminGate";
import AdminCaseStudies from "@/views/AdminCaseStudies";
import { NOINDEX_METADATA } from "@/lib/seo/metadata";

export const metadata: Metadata = { title: { absolute: "Admin · Case Studies | Genie Media & Studio" }, ...NOINDEX_METADATA };

export default function AdminCaseStudiesRoute() {
  return (
    <AdminGate requireAuth>
      <AdminCaseStudies />
    </AdminGate>
  );
}
