/**
 * Offline structured-data validator.
 *
 * Checks the JSON-LD this app generates against the properties Google actually
 * requires for each rich result type, so a schema regression is caught here
 * rather than three weeks later in a Search Console report.
 *
 * It is NOT a replacement for the Rich Results Test — that one also renders the
 * page and checks eligibility. This checks the shape of what we emit, which is
 * the part that breaks silently.
 *
 * Usage:
 *   node scripts/validateStructuredData.js            # sample post
 *   node scripts/validateStructuredData.js <blog-id>  # a real row
 */

require("dotenv").config({ quiet: true });

const { generateStructuredData } = require("../services/structuredData");
const { hydrateSeoRow } = require("../services/blogSeoFields");

// Google's documented requirements, per type.
// https://developers.google.com/search/docs/appearance/structured-data
const RULES = {
  BlogPosting: {
    required: ["headline", "image", "datePublished"],
    recommended: ["dateModified", "author", "publisher", "mainEntityOfPage", "description"],
  },
  Article: {
    required: ["headline", "image", "datePublished"],
    recommended: ["dateModified", "author", "publisher"],
  },
  NewsArticle: {
    required: ["headline", "image", "datePublished"],
    recommended: ["dateModified", "author", "publisher"],
  },
  FAQPage: { required: ["mainEntity"], recommended: [] },
  BreadcrumbList: { required: ["itemListElement"], recommended: [] },
  Organization: { required: ["name", "url"], recommended: ["logo", "sameAs", "contactPoint", "address"] },
  WebSite: { required: ["url"], recommended: ["name", "publisher"] },
  Person: { required: ["name"], recommended: ["url", "description"] },
  ImageObject: { required: ["url"], recommended: ["width", "height", "caption"] },
  WebPage: { required: ["url"], recommended: ["name", "isPartOf", "breadcrumb"] },
};

const typesOf = (node) => (Array.isArray(node["@type"]) ? node["@type"] : [node["@type"]]);

const validate = (graph) => {
  const errors = [];
  const warnings = [];
  const seenIds = new Set();
  const referencedIds = new Set();

  // A node with an @id and nothing else is a reference. A node with an @id and
  // other properties is a definition — and in JSON-LD a definition is equally
  // valid nested inside another node, which is where the Organization's logo
  // lives. Both cases have to be walked recursively or a perfectly valid graph
  // reads as full of dangling pointers.
  const walk = (value) => {
    if (Array.isArray(value)) return value.forEach(walk);
    if (!value || typeof value !== "object") return;

    if (typeof value["@id"] === "string") {
      if (Object.keys(value).length === 1) referencedIds.add(value["@id"]);
      else seenIds.add(value["@id"]);
    }

    Object.values(value).forEach(walk);
  };

  graph.forEach(walk);

  for (const node of graph) {
    for (const type of typesOf(node)) {
      const rule = RULES[type];
      if (!rule) continue;

      for (const prop of rule.required) {
        if (node[prop] === undefined || node[prop] === null || node[prop] === "") {
          errors.push(`${type}: missing required property "${prop}"`);
        }
      }
      for (const prop of rule.recommended) {
        if (node[prop] === undefined) {
          warnings.push(`${type}: missing recommended property "${prop}"`);
        }
      }
    }

    // Dates must be ISO-8601 or Google discards them.
    for (const prop of ["datePublished", "dateModified"]) {
      if (node[prop] && Number.isNaN(Date.parse(node[prop]))) {
        errors.push(`${typesOf(node)[0]}: "${prop}" is not a valid date (${node[prop]})`);
      }
    }
  }

  // FAQPage: every entry needs a Question with a non-empty acceptedAnswer.
  const faq = graph.find((n) => typesOf(n).includes("FAQPage"));
  if (faq) {
    const entries = Array.isArray(faq.mainEntity) ? faq.mainEntity : [faq.mainEntity];
    entries.forEach((q, i) => {
      if (!q || !typesOf(q).includes("Question")) errors.push(`FAQPage: entry ${i + 1} is not a Question`);
      else if (!q.name) errors.push(`FAQPage: entry ${i + 1} has no question text`);
      else if (!q.acceptedAnswer || !q.acceptedAnswer.text)
        errors.push(`FAQPage: entry ${i + 1} ("${q.name}") has no answer text`);
    });
  }

  // BreadcrumbList positions must be 1..n with no gaps.
  const crumbs = graph.find((n) => typesOf(n).includes("BreadcrumbList"));
  if (crumbs) {
    const positions = (crumbs.itemListElement || []).map((c) => c.position);
    const expected = positions.map((_, i) => i + 1);
    if (JSON.stringify(positions) !== JSON.stringify(expected)) {
      errors.push(`BreadcrumbList: positions are [${positions}], expected [${expected}]`);
    }
  }

  // An @id referenced but never defined is a dangling pointer, which is how a
  // graph ends up with an article whose author resolves to nothing.
  for (const ref of referencedIds) {
    if (!seenIds.has(ref)) errors.push(`Dangling @id reference: ${ref}`);
  }

  return { errors, warnings };
};

const SAMPLE = {
  id: 0,
  title: "Sample Post For Validation",
  permalink: "seo/sample-post-for-validation",
  metaDescription: "A sample post used to validate that the generated structured data matches what Google requires.",
  description:
    '<h2>Section</h2><p>Body text with an <a href="/services">internal link</a> and enough words to be realistic.</p>',
  category: "Search Engine Optimization (SEO)",
  image: "https://geniemedia.in/uploads/sample.webp",
  alt_text: "Sample image",
  keywords: "sample, validation",
  createdAt: Date.now() - 86400000,
  updatedAt: Date.now(),
  meta_title: "Sample Post For Validation",
  focus_keyword: "sample post",
  secondary_keywords: ["validation"],
  direct_answer: "This sample exists so the structured data generator can be validated without touching real content.",
  faq_schema: [{ question: "Is this real?", answer: "No, it is a fixture." }],
  key_facts: [{ fact: "Validation catches schema regressions early.", source: "https://example.com" }],
  definitions: [{ term: "JSON-LD", definition: "A way of embedding structured data in a page as JSON." }],
  author_name: "Validation Bot",
  author_bio: "Runs the structured data checks.",
  schema_type: "BlogPosting",
  robots_directive: "index,follow",
  word_count: 40,
  reading_time_minutes: 1,
};

const report = (label, graph) => {
  const { errors, warnings } = validate(graph["@graph"]);
  console.log(`\n=== ${label} ===`);
  console.log(`Nodes: ${graph["@graph"].length}`);
  if (errors.length) {
    console.log(`\n❌ ${errors.length} error(s):`);
    errors.forEach((e) => console.log(`   - ${e}`));
  } else {
    console.log("✅ No schema errors");
  }
  if (warnings.length) {
    console.log(`\n⚠️  ${warnings.length} recommended field(s) missing:`);
    warnings.forEach((w) => console.log(`   - ${w}`));
  }
  return errors.length;
};

const main = async () => {
  const id = process.argv[2];

  if (!id) {
    const failed = report("Sample post", generateStructuredData(SAMPLE));
    process.exit(failed ? 1 : 0);
  }

  const mysql = require("mysql2");
  const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  db.query("SELECT * FROM blogs WHERE id = ?", [id], (err, rows) => {
    if (err) {
      console.error("DB error:", err.message);
      process.exit(1);
    }
    if (!rows.length) {
      console.error(`No blog with id ${id}`);
      process.exit(1);
    }
    const failed = report(`Blog #${id}: ${rows[0].title}`, generateStructuredData(hydrateSeoRow(rows[0])));
    db.end();
    process.exit(failed ? 1 : 0);
  });
};

main();
