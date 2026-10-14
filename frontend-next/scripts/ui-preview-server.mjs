import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "dist");
const types = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".json": "application/json", ".txt": "text/plain", ".xml": "application/xml", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".ico": "image/x-icon", ".mp4": "video/mp4", ".woff2": "font/woff2" };
http.createServer((request, response) => {
  const url = new URL(request.url, "http://127.0.0.1");
  const name = decodeURIComponent(url.pathname).replace(/^\/+/, "");
  let file = path.resolve(root, name || "index.html");
  if (!file.startsWith(`${root}${path.sep}`) && file !== root) { response.writeHead(403).end(); return; }
  if (!path.extname(file) && fs.existsSync(`${file}.html`)) file += ".html";
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, "index.html");
  const found = fs.existsSync(file) && fs.statSync(file).isFile();
  if (!found) file = path.join(root, "404.html");
  if (!fs.existsSync(file)) { response.writeHead(404).end(); return; }
  response.writeHead(found ? 200 : 404, { "Content-Type": types[path.extname(file)] || "application/octet-stream", "Cache-Control": "no-store" });
  if (request.method === "HEAD") response.end(); else fs.createReadStream(file).pipe(response);
}).listen(5173, "127.0.0.1", () => console.log("Local static preview: http://127.0.0.1:5173"));
