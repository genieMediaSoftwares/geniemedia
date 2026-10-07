import type { Metadata } from "next";

import AdminGate from "@/components/admin/AdminGate";
import AdminSeo from "@/views/AdminSeo";
import { NOINDEX_METADATA } from "@/lib/seo/metadata";

export const metadata: Metadata = { title: { absolute: "Admin · SEO Keyword Manager | Genie Media & Studio" }, ...NOINDEX_METADATA };

export default function AdminSeoRoute() {
  return (
    <AdminGate requireAuth>
      <AdminSeo />
    </AdminGate>
  );
}
