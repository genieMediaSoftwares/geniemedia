/**
 * Fails if the two route-metadata tables have drifted apart.
 *
 * `Backend/config/routeMeta.js` and `Frontend/src/seo/routeMeta.js` hold the
 * same six routes. One is CommonJS running in Node, the other an ES module
 * bundled into the browser, and there is no shared build step, so the values
 * are duplicated by necessity.
 *
 * The failure mode that duplication invites is silent and slow: someone edits
 * the title in the React table, the server keeps serving the old one, and for
 * months a crawler that renders JavaScript sees a different title from one that
 * does not. This reads both files and compares them field by field.
 *
 *   npm run seo:routes
 */

const fs = require("fs");
const path = require("path");

const { ROUTE_META: BACKEND, canonicalFor } = require("../config/routeMeta");

const FRONTEND_FILE = path.join(__dirname, "..", "..", "Frontend", "src", "seo", "routeMeta.js");

/**
 * Reads the frontend table without importing it.
 *
 * It is an ES module using `export const`, which a CommonJS script cannot
 * require. Rather than add a bundler for one object, the export is extracted
 * and evaluated on its own.
 */
const readFrontendTable = () => {
  const src = fs.readFileSync(FRONTEND_FILE, "utf8");
  const start = src.indexOf("export const ROUTE_META = {");
  if (start === -1) throw new Error("ROUTE_META not found in the frontend table");

  const open = src.indexOf("{", start);
  let depth = 0;
  let end = -1;

  for (let i = open; i < src.length; i += 1) {
    if (src[i] === "{") depth += 1;
    else if (src[i] === "}") {
      depth -= 1;
      if (depth === 0) {
        end = i + 1;
        break;
      }
    }
  }

  if (end === -1) throw new Error("Could not find the end of the frontend table");

  // The extracted text is an object literal from a file in this repository, not
  // input from anywhere else.
  // eslint-disable-next-line no-new-func
  return new Function(`return ${src.slice(open, end)};`)();
};

const main = () => {
  let frontend;
  try {
    frontend = readFrontendTable();
  } catch (err) {
    console.error("❌ Could not read the frontend route table:", err.message);
    process.exit(1);
  }

  const paths = [...new Set([...Object.keys(BACKEND), ...Object.keys(frontend)])].sort();
  const problems = [];

  for (const route of paths) {
    const b = BACKEND[route];
    const f = frontend[route];

    if (!b) {
      problems.push(`${route}: present in the frontend table, missing from the backend`);
      continue;
    }
    if (!f) {
      problems.push(`${route}: present in the backend table, missing from the frontend`);
      continue;
    }

    for (const field of ["title", "description"]) {
      if (b[field] !== f[field]) {
        problems.push(
          `${route} ${field} differs\n      backend:  ${b[field]}\n      frontend: ${f[field]}`
        );
      }
    }
  }

  console.log(`Comparing ${paths.length} route(s)\n`);
  for (const route of paths) {
    const ok = BACKEND[route] && frontend[route] &&
      BACKEND[route].title === frontend[route].title &&
      BACKEND[route].description === frontend[route].description;
    console.log(`  ${ok ? "✅" : "❌"} ${route.padEnd(12)} ${canonicalFor(route)}`);
    if (ok) console.log(`     ${BACKEND[route].title}`);
  }

  if (problems.length) {
    console.error(`\n❌ ${problems.length} mismatch(es):\n`);
    problems.forEach((p) => console.error(`   - ${p}`));
    console.error("\nEdit both tables together.");
    process.exit(1);
  }

  console.log("\n✅ Both route tables agree.");
};

main();
