import { getPublishedServiceSeoAll } from "@/lib/api/serviceSeo";

export const dynamic = "force-static";

export async function GET(): Promise<Response> {
  const configs = await getPublishedServiceSeoAll();
  const body = {
    builtAt: Date.now(),
    serviceSeo: Object.fromEntries(configs.map((c) => [c.path, c.publishedAt])),
  };
  return new Response(JSON.stringify(body), {
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-cache" },
  });
}
