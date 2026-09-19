/**
 * Fetches a live URL the way an AI crawler does and reports what it can see.
 *
 * This is the scripted form of:
 *   curl -A "GPTBot" https://geniemedia.in/blog/<slug>
 *
 * The point of doing it as a bot with no JavaScript is that it answers the only
 * question that matters for AI citation: is the metadata and the article text
 * present in the first HTTP response, or does it only exist after React runs?
 * A browser will always make the page look fine, which is exactly why checking
 * in a browser proves nothing here.
 *
 * Usage:
 *   node scripts/verifySeoLive.js https://geniemedia.in/blog/seo/some-post
 *   node scripts/verifySeoLive.js http://localhost:5000/blog/seo/some-post
 */

const AGENTS = {
  GPTBot: "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; GPTBot/1.2; +https://openai.com/gptbot",
  ClaudeBot: "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; ClaudeBot/1.0; +claudebot@anthropic.com",
  PerplexityBot: "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot",
  Googlebot: "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
  facebookexternalhit: "facebookexternalhit/1.1",
  Browser: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36",
};

const pick = (html, re) => {
  const m = html.match(re);
  return m ? m[1].trim() : null;
};

const check = (label, value, detail = "") => {
  const ok = Boolean(value);
  console.log(`  ${ok ? "✅" : "❌"} ${label}${detail ? `: ${detail}` : ""}`);
  return ok;
};

const inspect = async (url, agentName) => {
  const started = Date.now();
  let res;
  let html;

  try {
    res = await fetch(url, { headers: { "User-Agent": AGENTS[agentName], Accept: "text/html" } });
    html = await res.text();
  } catch (err) {
    console.log(`\n── ${agentName} ──`);
    console.log(`  ❌ Request failed: ${err.message}`);
    return false;
  }

  const ms = Date.now() - started;
  console.log(`\n── ${agentName} ── ${res.status} in ${ms}ms, ${(html.length / 1024).toFixed(1)} kB`);

  if (res.status >= 300 && res.status < 400) {
    console.log(`  ↪ Redirects to ${res.headers.get("location")}`);
    return true;
  }

  let passed = true;

  const title = pick(html, /<title>([\s\S]*?)<\/title>/i);
  passed &= check("Title in raw HTML", title, title);

  const description = pick(html, /<meta[^>]*\sname=["']description["'][^>]*\scontent=["']([^"']*)["']/i);
  passed &= check("Meta description", description, description ? `${description.length} chars` : "");

  const canonical = pick(html, /<link[^>]*\srel=["']canonical["'][^>]*\shref=["']([^"']*)["']/i);
  passed &= check("Canonical", canonical, canonical);

  const ogTitle = pick(html, /<meta[^>]*\sproperty=["']og:title["'][^>]*\scontent=["']([^"']*)["']/i);
  const ogImage = pick(html, /<meta[^>]*\sproperty=["']og:image["'][^>]*\scontent=["']([^"']*)["']/i);
  passed &= check("Open Graph title", ogTitle);
  passed &= check("Open Graph image", ogImage, ogImage);

  const robots = pick(html, /<meta[^>]*\sname=["']robots["'][^>]*\scontent=["']([^"']*)["']/i);
  check("Robots directive", robots, robots || "not set (defaults to index,follow)");

  // JSON-LD
  const blocks = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  if (!blocks.length) {
    passed &= check("JSON-LD present", false);
  } else {
    const types = [];
    let parseOk = true;

    for (const block of blocks) {
      try {
        const parsed = JSON.parse(block[1]);
        const nodes = parsed["@graph"] || [parsed];
        for (const node of nodes) {
          const t = Array.isArray(node["@type"]) ? node["@type"].join("/") : node["@type"];
          if (t) types.push(t);
        }
      } catch (err) {
        parseOk = false;
        console.log(`  ❌ JSON-LD block failed to parse: ${err.message}`);
      }
    }

    passed &= check(`JSON-LD parses (${blocks.length} block${blocks.length > 1 ? "s" : ""})`, parseOk);
    console.log(`     types: ${types.join(", ")}`);

    check("Article schema", types.some((t) => /BlogPosting|Article|NewsArticle/.test(t)));
    check("Organization schema", types.some((t) => /Organization/.test(t)));
    check("BreadcrumbList schema", types.some((t) => /BreadcrumbList/.test(t)));
    // Only present when the editor added question/answer pairs, so its absence
    // is information rather than a fault.
    console.log(
      `     FAQPage schema: ${types.some((t) => /FAQPage/.test(t)) ? "yes" : "no (no FAQ pairs on this post)"}`
    );
  }

  // The decisive test: is the article readable without running JavaScript?
  //
  // Everything from <div id="root"> to </body> is taken, then scripts, styles
  // and comments are removed before measuring. Matching to a closing </div>
  // does not work: the injected article contains nested divs, and the build
  // puts an HTML comment between the root element and the next script tag.
  const rootStart = html.search(/<div id="root"[^>]*>/i);
  let textLength = 0;

  if (rootStart !== -1) {
    const bodyEnd = html.toLowerCase().indexOf("</body>", rootStart);
    textLength = html
      .slice(rootStart, bodyEnd === -1 ? undefined : bodyEnd)
      .replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ")
      .replace(/<!--[\s\S]*?-->/g, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim().length;
  }

  passed &= check(
    "Article text present without JavaScript",
    textLength > 200,
    `${textLength} characters inside #root`
  );

  // The short answer is metadata only — it reaches engines as the description
  // and the article abstract and is deliberately not rendered for readers, so
  // finding it in the body would be the bug, not missing it.
  const abstractPresent = /"abstract"\s*:/.test(html);
  console.log(`  ℹ️  Short answer as abstract: ${abstractPresent ? "yes" : "not set on this post"}`);

  return Boolean(passed);
};

const main = async () => {
  const url = process.argv[2];

  if (!url) {
    console.error("Usage: node scripts/verifySeoLive.js <url>");
    console.error("Example: node scripts/verifySeoLive.js https://geniemedia.in/blog/seo/my-post");
    process.exit(1);
  }

  console.log(`\nChecking ${url}`);
  console.log("=".repeat(60));

  const agents = ["GPTBot", "ClaudeBot", "PerplexityBot", "Googlebot", "facebookexternalhit", "Browser"];
  const results = [];

  for (const agent of agents) {
    results.push(await inspect(url, agent));
  }

  const failed = results.filter((r) => !r).length;
  console.log("\n" + "=".repeat(60));

  if (failed) {
    console.log(`❌ ${failed} of ${agents.length} agent checks had failures.`);
    process.exit(1);
  }

  console.log(`✅ All ${agents.length} agent checks passed.`);
};

main();
