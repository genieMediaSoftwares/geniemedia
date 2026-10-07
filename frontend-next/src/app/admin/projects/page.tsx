import type { Metadata } from "next";

import AdminGate from "@/components/admin/AdminGate";
import AdminProjects from "@/views/AdminProjects";
import { NOINDEX_METADATA } from "@/lib/seo/metadata";

export const metadata: Metadata = { title: { absolute: "Admin · Projects | Genie Media & Studio" }, ...NOINDEX_METADATA };

export default function AdminProjectsRoute() {
  return (
    <AdminGate requireAuth>
      <AdminProjects />
    </AdminGate>
  );
}
