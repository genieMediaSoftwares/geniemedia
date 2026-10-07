import type { HealthPage } from "@/lib/seo/keywordHealth";

const textOf = (el: Element | null): string => {
  if (!el) return "";
  if (!el.querySelector("br")) return (el.textContent || "").replace(/\s+/g, " ").trim();
  const copy = el.cloneNode(true) as Element;
  copy.querySelectorAll("br").forEach((br) => br.replaceWith(" "));
  return (copy.textContent || "").replace(/\s+/g, " ").trim();
};

export function snapshotFromHtml(html: string): HealthPage {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const main = doc.querySelector("main[data-seo-content='true']") || doc.querySelector("main") || doc.body;
  main.querySelectorAll("script, style, noscript, template, svg").forEach((el) => el.remove());
  const paragraphs = [...main.querySelectorAll("p, li")].map(textOf).filter((t) => t.split(" ").length >= 4);
  const blocks: Array<{ section: string; text: string }> = [];
  let section = textOf(main.querySelector("h1"));
  for (const el of main.querySelectorAll("h1, h2, h3, p, li, dd")) {
    if (el.tagName === "H1" || el.tagName === "H2") {
      section = textOf(el);
      continue;
    }
    if (el.querySelector("p, li")) continue;
    const text = textOf(el);
    if (text.split(" ").length >= 3) blocks.push({ section, text });
  }
  return {
    blocks,
    title: textOf(doc.querySelector("head > title")),
    description: doc.querySelector("meta[name='description']")?.getAttribute("content") || "",
    h1s: [...main.querySelectorAll("h1")].map(textOf),
    h2s: [...main.querySelectorAll("h2")].map(textOf),
    h3s: [...main.querySelectorAll("h3")].map(textOf),
    openingText: paragraphs.slice(0, 2).join(" "),
    text: textOf(main),
    links: [...main.querySelectorAll("a[href]")].map((a) => ({ href: a.getAttribute("href") || "", text: textOf(a) })),
  };
}

export interface DraftOverlay {
  seoTitle: string;
  metaDescription: string;
  preferredH1: string;
  sections: Array<{ heading: string; body: string }>;
  internalLinks: Array<{ label: string; href: string }>;
}

export function applyDraft(page: HealthPage, draft: DraftOverlay, builtIn?: DraftOverlay | null): HealthPage {
  const base = builtIn ? stripOverlay(page, builtIn) : page;
  const sectionText = draft.sections.map((s) => `${s.heading} ${s.body}`).join(" ");
  return {
    title: draft.seoTitle || base.title,
    description: draft.metaDescription || base.description,
    h1s: draft.preferredH1 ? [draft.preferredH1] : base.h1s,
    h2s: [...base.h2s, ...draft.sections.map((s) => s.heading), ...(draft.internalLinks.length ? ["Related Pages"] : [])],
    h3s: base.h3s,
    openingText: base.openingText,
    text: `${base.text} ${sectionText} ${draft.internalLinks.map((l) => l.label).join(" ")}`,
    links: [...base.links, ...draft.internalLinks.map((l) => ({ href: l.href, text: l.label }))],
    blocks: [...(base.blocks || []), ...draft.sections.map((s) => ({ section: s.heading, text: s.body }))],
  };
}

function stripOverlay(page: HealthPage, published: DraftOverlay): HealthPage {
  const headings = new Set([...published.sections.map((s) => s.heading), ...(published.internalLinks.length ? ["Related Pages"] : [])]);
  let text = page.text;
  for (const s of published.sections) text = text.replace(`${s.heading}`, " ").replace(s.body.replace(/\s+/g, " "), " ");
  const hrefs = new Set(published.internalLinks.map((l) => l.href));
  return {
    ...page,
    h2s: page.h2s.filter((h) => !headings.has(h)),
    text,
    links: page.links.filter((l) => !hrefs.has(l.href)),
  };
}
