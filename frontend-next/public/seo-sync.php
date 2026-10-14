<?php
declare(strict_types=1);

const API_BASE_URL = '__API_BASE_URL__';
const SYNC_SECRET = '__SEO_SYNC_SECRET__';
const LIVE_DIR = __DIR__ . '/seo-live';
const MAX_SKEW = 300;

function reply(int $status, array $body): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    header('X-Robots-Tag: noindex');
    echo json_encode($body, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    reply(405, ['ok' => false, 'error' => 'POST only']);
}
if (strlen(SYNC_SECRET) < 32 || strpos(SYNC_SECRET, '__') === 0) {
    reply(503, ['ok' => false, 'error' => 'Sync secret not configured']);
}

$body = (string) file_get_contents('php://input', false, null, 0, 4096);
$timestamp = (string) ($_SERVER['HTTP_X_SEO_TIMESTAMP'] ?? '');
$nonce = (string) ($_SERVER['HTTP_X_SEO_NONCE'] ?? '');
$signature = (string) ($_SERVER['HTTP_X_SEO_SIGNATURE'] ?? '');

if (!preg_match('/^\d{9,11}$/', $timestamp) || abs(time() - (int) $timestamp) > MAX_SKEW) {
    reply(401, ['ok' => false, 'error' => 'Stale or missing timestamp']);
}
if (!preg_match('/^[a-f0-9]{16,64}$/', $nonce) || !preg_match('/^[a-f0-9]{64}$/', $signature)) {
    reply(401, ['ok' => false, 'error' => 'Missing signature']);
}
$expected = hash_hmac('sha256', $timestamp . "\n" . $nonce . "\n" . $body, SYNC_SECRET);
if (!hash_equals($expected, $signature)) {
    reply(401, ['ok' => false, 'error' => 'Bad signature']);
}

if (!is_dir(LIVE_DIR . '/routes') && !mkdir(LIVE_DIR . '/routes', 0755, true) && !is_dir(LIVE_DIR . '/routes')) {
    reply(500, ['ok' => false, 'error' => 'Cannot create the seo-live folder']);
}
@file_put_contents(LIVE_DIR . '/.htaccess', "Require all denied\n");

$nonceFile = LIVE_DIR . '/nonces.json';
$lock = fopen(LIVE_DIR . '/sync.lock', 'c');
if ($lock === false || !flock($lock, LOCK_EX)) {
    reply(503, ['ok' => false, 'error' => 'Busy']);
}
$nonces = is_file($nonceFile) ? (json_decode((string) file_get_contents($nonceFile), true) ?: []) : [];
$nonces = array_filter($nonces, fn ($t) => is_int($t) && $t > time() - 2 * MAX_SKEW);
if (isset($nonces[$nonce])) {
    reply(409, ['ok' => false, 'error' => 'Replayed request']);
}
$nonces[$nonce] = time();
file_put_contents($nonceFile, json_encode($nonces));

$ch = curl_init(rtrim(API_BASE_URL, '/') . '/api/seo/published');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 40,
    CURLOPT_CONNECTTIMEOUT => 15,
    CURLOPT_HTTPHEADER => ['Accept: application/json'],
]);
$raw = curl_exec($ch);
$code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);
$list = $raw === false ? null : json_decode((string) $raw, true);
if ($code !== 200 || !is_array($list)) {
    reply(502, ['ok' => false, 'error' => "Could not load the published SEO configuration (HTTP $code). The live site keeps its previous version."]);
}

// The CMS stores the service pages under their pre-2026-10-14 underscore paths; the site uses
// hyphenated ones. Keep in sync with src/lib/legacyPaths.ts and scripts/postbuild.mjs.
const LEGACY_SECTION_PATHS = [
    '/digital_marketing' => '/digital-marketing',
    '/web_development' => '/web-development',
    '/production_house' => '/production-house',
    '/podcast_studio' => '/podcast-studio',
];
function public_path(string $path): string
{
    foreach (LEGACY_SECTION_PATHS as $from => $to) {
        if ($path === $from || strpos($path, $from . '/') === 0) return $to . substr($path, strlen($from));
    }
    return $path;
}
function public_url(string $url): string
{
    $parts = parse_url($url);
    if (!is_array($parts) || !isset($parts['path'])) return $url;
    $path = public_path($parts['path']);
    return $path === $parts['path'] ? $url : substr($url, 0, strpos($url, $parts['path'])) . $path . substr($url, strpos($url, $parts['path']) + strlen($parts['path']));
}

$safeText = fn ($s, $min, $max) => is_string($s) && mb_strlen($s) >= $min && mb_strlen($s) <= $max && !preg_match('/[<>"\\\\\x00-\x1F]/u', $s);
$safeUrl = fn ($s) => is_string($s) && strlen($s) <= 300 && (bool) preg_match('#^https://[A-Za-z0-9.\-]+(/[A-Za-z0-9._~%/\-]*)?$#', $s);

$pages = [];
$routes = [];
$skipped = [];
foreach ($list as $item) {
    $path = public_path(is_array($item) ? (string) ($item['path'] ?? '') : '');
    if ($path !== '/' && !preg_match('#^/[a-z0-9_-]+(?:/[a-z0-9_-]+)*$#', $path)) {
        $skipped[] = ['path' => $path, 'reason' => 'invalid path'];
        continue;
    }
    $route = $path === '/' ? 'index' : ltrim($path, '/');
    if (!is_file(__DIR__ . '/' . $route . '.html')) {
        $skipped[] = ['path' => $path, 'reason' => 'no built page for this route'];
        continue;
    }
    $entry = ['version' => (int) ($item['version'] ?? 0), 'publishedAt' => (int) ($item['publishedAt'] ?? 0)];
    if ($safeText($item['seoTitle'] ?? null, 10, 70)) $entry['seoTitle'] = $item['seoTitle'];
    if ($safeText($item['metaDescription'] ?? null, 50, 200)) $entry['metaDescription'] = $item['metaDescription'];
    if (($item['canonicalUrl'] ?? '') !== '' && $safeUrl($item['canonicalUrl'])) $entry['canonicalUrl'] = public_url($item['canonicalUrl']);
    if (($item['ogImage'] ?? '') !== '' && $safeUrl($item['ogImage'])) $entry['ogImage'] = $item['ogImage'];
    if (($item['robotsIndex'] ?? true) === false || ($item['robotsFollow'] ?? true) === false) {
        $entry['robotsIndex'] = ($item['robotsIndex'] ?? true) !== false;
        $entry['robotsFollow'] = ($item['robotsFollow'] ?? true) !== false;
    }
    $pages[$path] = $entry;
    $routes[$route] = true;
}

$version = (int) max(array_merge([0], array_column($pages, 'version')));
$config = ['version' => $version, 'syncedAt' => time(), 'pages' => $pages];
$tmp = LIVE_DIR . '/config.json.tmp';
if (file_put_contents($tmp, json_encode($config, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)) === false || !rename($tmp, LIVE_DIR . '/config.json')) {
    reply(500, ['ok' => false, 'error' => 'Could not write the live configuration. The live site keeps its previous version.']);
}

$existing = [];
$it = new RecursiveIteratorIterator(new RecursiveDirectoryIterator(LIVE_DIR . '/routes', FilesystemIterator::SKIP_DOTS));
foreach ($it as $file) {
    $rel = str_replace('\\', '/', substr($file->getPathname(), strlen(LIVE_DIR . '/routes/')));
    if (substr($rel, -3) === '.on') $existing[substr($rel, 0, -3)] = $file->getPathname();
}
foreach ($existing as $route => $file) {
    if (!isset($routes[$route])) @unlink($file);
}
foreach (array_keys($routes) as $route) {
    $marker = LIVE_DIR . '/routes/' . $route . '.on';
    if (!is_dir(dirname($marker))) mkdir(dirname($marker), 0755, true);
    if (!is_file($marker)) touch($marker);
}

$errors = is_file(LIVE_DIR . '/errors.log') ? array_slice(file(LIVE_DIR . '/errors.log', FILE_IGNORE_NEW_LINES) ?: [], -10) : [];
flock($lock, LOCK_UN);
reply(200, ['ok' => true, 'version' => $version, 'routes' => array_keys($pages), 'skipped' => $skipped, 'recentGatewayErrors' => $errors]);
