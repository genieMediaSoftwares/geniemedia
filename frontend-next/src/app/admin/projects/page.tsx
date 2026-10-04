import type { Metadata } from "next";

import AdminGate from "@/components/admin/AdminGate";
import AdminProjects from "@/views/AdminProjects";
import { NOINDEX_METADATA } from "@/lib/seo/metadata";

// Admin screens are private: never indexed, never cached, client-rendered only.
export const metadata: Metadata = { title: { absolute: "Admin · Projects | Genie Media & Studio" }, ...NOINDEX_METADATA };
export const dynamic = "force-dynamic";

export default function AdminProjectsRoute() {
  return (
    <AdminGate requireAuth>
      <AdminProjects />
    </AdminGate>
  );
}
