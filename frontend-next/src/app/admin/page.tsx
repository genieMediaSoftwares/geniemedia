import type { Metadata } from "next";

import AdminGate from "@/components/admin/AdminGate";
import AdminLogin from "@/views/AdminLogin";
import { NOINDEX_METADATA } from "@/lib/seo/metadata";

// Admin screens are private: never indexed, never cached, client-rendered only.
export const metadata: Metadata = { title: { absolute: "Admin Login | Genie Media & Studio" }, ...NOINDEX_METADATA };
export const dynamic = "force-dynamic";

export default function AdminLoginRoute() {
  return (
    <AdminGate>
      <AdminLogin />
    </AdminGate>
  );
}
