import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";

import { CACHE_TAGS, SERVER_API_BASE_URL } from "@/lib/api/client";
import { cleanSlug } from "@/lib/blog";

/**
 * On-demand refresh after an admin save, so a published, edited or deleted
 * post (or project) is reflected immediately instead of after the 60-second
 * ISR window.
 *
 * Authorised with the admin's own JWT: no new secret is shared with the
 * frontend. The token is checked by the backend itself — GET
 * /api/admin/projects/0 runs verifyToken first, so a valid token yields 404
 * (no project 0) and an invalid one 401/403.
 *
 * Body: { type: "blogs" | "projects", permalinks?: string[] }
 */
export const dynamic = "force-dynamic";

const IMMEDIATE = { expire: 0 };

async function isAdminToken(authorization: string | null): Promise<boolean> {
  if (!authorization) return false;
  try {
    const res = await fetch(`${SERVER_API_BASE_URL}/api/admin/projects/0`, {
      headers: { Authorization: authorization },
      cache: "no-store",
      signal: AbortSignal.timeout(30_000),
    });
    return res.status === 404 || res.ok;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  if (!(await isAdminToken(req.headers.get("authorization")))) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  let body: unknown = null;
  try {
    body = await req.json();
  } catch {
    /* empty body: refresh everything below */
  }
  const record = typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {};
  const type = record.type === "projects" ? "projects" : record.type === "blogs" ? "blogs" : "all";
  const permalinks = Array.isArray(record.permalinks) ? record.permalinks.map((p) => cleanSlug(String(p))).filter(Boolean) : [];

  if (type === "blogs" || type === "all") {
    revalidateTag(CACHE_TAGS.blogs, IMMEDIATE);
    for (const slug of permalinks) {
      revalidateTag(`blog:${slug}`, IMMEDIATE);
      revalidatePath(`/blog/${slug}`);
    }
    revalidatePath("/blogs");
    revalidatePath("/sitemap.xml");
    revalidatePath("/llms.txt");
  }
  if (type === "projects" || type === "all") {
    revalidateTag(CACHE_TAGS.projects, IMMEDIATE);
    revalidatePath("/");
    revalidatePath("/projects");
    revalidatePath("/web_development");
  }

  return NextResponse.json({ success: true, revalidated: type, permalinks });
}
