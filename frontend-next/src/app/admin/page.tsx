import type { Metadata } from "next";

import AdminGate from "@/components/admin/AdminGate";
import AdminLogin from "@/views/AdminLogin";
import { NOINDEX_METADATA } from "@/lib/seo/metadata";

export const metadata: Metadata = { title: { absolute: "Admin Login | Genie Media & Studio" }, ...NOINDEX_METADATA };

export default function AdminLoginRoute() {
  return (
    <AdminGate>
      <AdminLogin />
    </AdminGate>
  );
}
