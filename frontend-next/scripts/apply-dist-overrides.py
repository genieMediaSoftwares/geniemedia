"""Post-build fix-up for pages whose SEO is controlled from /admin/seo.

The build copies the admin-published H1, and seo.php serves the admin-published title and
description at request time from dist/seo-live/config.json. When the owner approves new
values in code before updating /admin/seo, run this after `npm run build` so the upload
matches. The next admin publish (seo-sync.php) overwrites config.json again, so update
/admin/seo with the same values to make them permanent.

Usage: python scripts/apply-dist-overrides.py
"""
import html
import json
import pathlib
import sys

DIST = pathlib.Path(__file__).resolve().parent.parent / "dist"

# route -> new values (keep in sync with src/lib/seo/routeMeta.ts and the page H1 defaults)
OVERRIDES = {
    "/digital_marketing": {
        "seoTitle": "Digital Marketing Agency in Vizag | SEO, Ads & Content",
        "metaDescription": "Grow your business with SEO, Google Ads, local SEO, content marketing and social media services from Genie Media in Vizag and across India.",
        "h1": "Digital Marketing Agency for Growing Businesses in Vizag and India",
    },
    "/web_development": {
        "seoTitle": "Website Development Company in Vizag & India | Genie Media",
        "metaDescription": "Build a fast, responsive and SEO-friendly website with Genie Media's WordPress, Shopify, React and Next.js development services in Vizag.",
        "h1": "Website Development for Businesses in Vizag and Across India",
    },
    "/production_house": {
        "seoTitle": "Video Production House in Vizag & India | Genie Media",
        "metaDescription": "Create corporate videos, brand films, product videos and social media content with Genie Media's production house in Vizag.",
        "h1": "Video Production House for Brands and Businesses",
    },
    "/podcast_studio": {
        "seoTitle": "Podcast Studio Rental in Vizag | Genie Media & Studio",
        "metaDescription": "Book a professional podcast studio in Vizag for audio and video recording, production, editing and content repurposing.",
        "h1": "Professional Podcast Studio Rental in Vizag",
    },
}


def current_h1(page_html: str) -> str | None:
    start = page_html.find("<h1")
    if start < 0:
        return None
    end = page_html.find("</h1>", start)
    inner = page_html[page_html.find(">", start) + 1:end]
    while inner.startswith("<"):
        inner = inner[inner.find(">") + 1:]
    inner = inner.split("<")[0]
    return html.unescape(inner)


def main() -> int:
    cfg_path = DIST / "seo-live" / "config.json"
    cfg = json.loads(cfg_path.read_text(encoding="utf8"))
    problems = []
    for route, new in OVERRIDES.items():
        slug = route.strip("/")
        page = DIST / f"{slug}.html"
        text = page.read_text(encoding="utf8")
        old = current_h1(text)
        if old == new["h1"]:
            old = new.get("previous_h1")
        if old and old != new["h1"]:
            files = [page, DIST / f"{slug}.txt", *(DIST / slug).rglob("*.txt")]
            files = [f for f in files if f.is_file()]
            variants = {old, old.replace("&", "\\u0026")}
            for f in files:
                s = f.read_text(encoding="utf8")
                before = s
                for o in variants:
                    s = s.replace(f">{html.escape(o, quote=False)}</h1>", f">{html.escape(new['h1'], quote=False)}</h1>")
                    s = s.replace(f">{html.escape(o, quote=False)}</span></h1>", f">{html.escape(new['h1'], quote=False)}</span></h1>")
                    s = s.replace(f'"children":"{o}"', f'"children":"{new["h1"]}"')
                    s = s.replace(f'"h1":"{o}"', f'"h1":"{new["h1"]}"')
                    s = s.replace(f'\\"h1\\":\\"{o}\\"', f'\\"h1\\":\\"{new["h1"]}\\"')
                    s = s.replace(f'\\"children\\":\\"{o}\\"', f'\\"children\\":\\"{new["h1"]}\\"')
                if s != before:
                    f.write_text(s, encoding="utf8")
            if current_h1(page.read_text(encoding="utf8")) != new["h1"]:
                problems.append(f"{route}: H1 not replaced (found {old!r})")
            else:
                print(f"{route}: H1 {old!r} -> {new['h1']!r}")
        entry = cfg.get("pages", {}).get(route)
        if entry is not None:
            entry["seoTitle"] = new["seoTitle"]
            entry["metaDescription"] = new["metaDescription"]
            print(f"{route}: seo-live title/description updated")
    cfg_path.write_text(json.dumps(cfg, ensure_ascii=False, separators=(",", ":")), encoding="utf8")
    for p in problems:
        print("PROBLEM:", p, file=sys.stderr)
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main())
