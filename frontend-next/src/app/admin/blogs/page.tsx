import type { Metadata } from "next";

import AdminGate from "@/components/admin/AdminGate";
import AdminBlogs from "@/views/AdminBlogs";
import { NOINDEX_METADATA } from "@/lib/seo/metadata";

export const metadata: Metadata = { title: { absolute: "Admin · Blogs | Genie Media & Studio" }, ...NOINDEX_METADATA };

export default function AdminBlogsRoute() {
  return (
    <AdminGate requireAuth>
      <AdminBlogs />
    </AdminGate>
  );
}
