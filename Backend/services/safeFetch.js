// Outbound requests to URLs that come from admins or page content (backlink
// sources, external links found by the audit) must never reach the server's
// own network. The agents below resolve DNS themselves and refuse private,
// loopback, link-local and other non-public addresses at connection time, so
// every redirect hop and any DNS rebinding is checked, not just the first URL.

const dns = require("dns");
const http = require("http");
const https = require("https");
const net = require("net");

const blockedV4 = (ip) => {
  const [a, b] = ip.split(".").map(Number);
  return (
    a === 0 || a === 10 || a === 127 || (a === 100 && b >= 64 && b <= 127) || (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 192 && b === 0) ||
    (a === 198 && (b === 18 || b === 19)) || a >= 224
  );
};

const blockedIp = (ip) => {
  if (net.isIPv4(ip)) return blockedV4(ip);
  const v = ip.toLowerCase();
  const mapped = v.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped) return blockedV4(mapped[1]);
  return v === "::" || v === "::1" || /^f[cd]/.test(v) || /^fe[89ab]/.test(v) || /^ff/.test(v) || v.startsWith("64:ff9b:") || v.startsWith("2001:db8");
};

const publicLookup = (hostname, options, callback) => {
  dns.lookup(hostname, { ...options, all: true }, (err, addresses) => {
    if (err) return callback(err);
    const bad = addresses.find((a) => blockedIp(a.address));
    if (bad || !addresses.length) return callback(Object.assign(new Error(`Blocked non-public address for ${hostname}`), { code: "EBLOCKED" }));
    if (options && options.all) return callback(null, addresses);
    callback(null, addresses[0].address, addresses[0].family);
  });
};

const httpAgent = new http.Agent({ lookup: publicLookup });
const httpsAgent = new https.Agent({ lookup: publicLookup });

const isPublicHttpUrl = (value) => {
  try {
    const u = new URL(value);
    if (!["http:", "https:"].includes(u.protocol) || u.username || u.password) return false;
    const host = u.hostname.replace(/^\[|\]$/g, "");
    return !(net.isIP(host) && blockedIp(host)) && host !== "localhost";
  } catch (_) {
    return false;
  }
};

const publicRequestOptions = (extra = {}) => ({
  httpAgent,
  httpsAgent,
  proxy: false,
  maxContentLength: 5 * 1024 * 1024,
  beforeRedirect: (opts) => {
    if (!["http:", "https:"].includes(opts.protocol)) throw new Error("Blocked redirect protocol");
  },
  ...extra,
});

module.exports = { isPublicHttpUrl, publicRequestOptions, blockedIp };
