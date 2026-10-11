// Small, dependency-free HTML reader for SEO checks. It extracts the tags an
// audit needs (title, meta, links, headings, images, JSON-LD) from server
// rendered HTML. It is deliberately tolerant: malformed markup yields fewer
// facts, never an exception.

const decode = (s) =>
  String(s || "")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");

const attrs = (tag) => {
  const out = {};
  const re = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*(?:=\s*("([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  const inner = tag.replace(/^<[a-zA-Z0-9]+/, "").replace(/\/?>$/, "");
  let m;
  while ((m = re.exec(inner))) {
    out[m[1].toLowerCase()] = decode(m[3] ?? m[4] ?? m[5] ?? "");
  }
  return out;
};

const stripTags = (html) =>
  decode(
    String(html || "")
      .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
      .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<svg\b[\s\S]*?<\/svg>/gi, " ")
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<[^>]+>/g, " ")
  )
    .replace(/\s+/g, " ")
    .trim();

function inspectHtml(html, pageUrl) {
  const doc = String(html || "");
  const headEnd = doc.search(/<\/head>/i);
  const head = headEnd >= 0 ? doc.slice(0, headEnd) : doc;
  const body = headEnd >= 0 ? doc.slice(headEnd) : doc;

  const metas = [...head.matchAll(/<meta\b[^>]*>/gi)].map((m) => attrs(m[0]));
  const metaByName = (name) => metas.filter((m) => (m.name || "").toLowerCase() === name).map((m) => m.content || "");
  const metaByProperty = (prop) => metas.filter((m) => (m.property || "").toLowerCase() === prop).map((m) => m.content || "");
  const linkTags = [...head.matchAll(/<link\b[^>]*>/gi)].map((m) => attrs(m[0]));

  const base = (() => {
    try {
      return new URL(pageUrl);
    } catch (_) {
      return null;
    }
  })();
  const abs = (href) => {
    try {
      return base ? new URL(href, base).toString() : href;
    } catch (_) {
      return null;
    }
  };

  const mainMatch = body.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
  const main = mainMatch ? mainMatch[1] : body;
  const visibleText = stripTags(main);

  const anchors = [...body.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)].map((m) => {
    const a = attrs(`<a ${m[1]}>`);
    return { href: a.href || "", url: a.href ? abs(a.href) : null, text: stripTags(m[2]).slice(0, 120), rel: a.rel || "", target: a.target || "" };
  });
  const images = [...body.matchAll(/<img\b[^>]*>/gi)].map((m) => {
    const a = attrs(m[0]);
    return { src: a.src || "", alt: Object.prototype.hasOwnProperty.call(a, "alt") ? a.alt : null, width: a.width || null, height: a.height || null };
  });
  const headings = (level) => [...doc.matchAll(new RegExp(`<h${level}\\b[^>]*>([\\s\\S]*?)<\\/h${level}>`, "gi"))].map((m) => stripTags(m[1]));
  const jsonLd = [...doc.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map((m) => {
    try {
      return { ok: true, data: JSON.parse(m[1]) };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  });
  const langMatch = doc.match(/<html\b[^>]*\blang=["']?([a-zA-Z-]+)/i);

  return {
    titles: [...head.matchAll(/<title\b[^>]*>([\s\S]*?)<\/title>/gi)].map((m) => decode(m[1]).trim()),
    descriptions: metaByName("description"),
    robots: metaByName("robots").join(", "),
    googlebot: metaByName("googlebot").join(", "),
    viewport: metaByName("viewport")[0] || null,
    canonicals: linkTags.filter((l) => (l.rel || "").toLowerCase() === "canonical").map((l) => l.href || ""),
    og: {
      title: metaByProperty("og:title")[0] || null,
      description: metaByProperty("og:description")[0] || null,
      image: metaByProperty("og:image")[0] || null,
      url: metaByProperty("og:url")[0] || null,
      type: metaByProperty("og:type")[0] || null,
    },
    twitterCard: metaByName("twitter:card")[0] || null,
    lang: langMatch ? langMatch[1] : null,
    h1: headings(1),
    h2: headings(2),
    anchors,
    images,
    jsonLd,
    wordCount: visibleText ? visibleText.split(" ").length : 0,
    visibleText,
    mixedContent: /\s(?:src|href)=["']http:\/\//i.test(body),
  };
}

const flattenJsonLd = (blocks) =>
  blocks
    .filter((b) => b.ok)
    .flatMap((b) => (Array.isArray(b.data) ? b.data : [b.data]))
    .flatMap((d) => (d && Array.isArray(d["@graph"]) ? d["@graph"] : [d]))
    .filter((n) => n && typeof n === "object");

module.exports = { inspectHtml, stripTags, flattenJsonLd, decode };
