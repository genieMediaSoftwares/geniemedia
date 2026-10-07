<?php
declare(strict_types=1);

const API_BASE_URL  = '__API_BASE_URL__';
const SITE_URL      = '__SITE_URL__';
const CACHE_SECONDS = 300;
const API_TIMEOUT   = 20;

$pagesFile    = __DIR__ . '/sitemap-pages.xml';
$fallbackFile = __DIR__ . '/sitemap-static.xml';
$cacheFile    = rtrim(sys_get_temp_dir(), DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . 'gm_sitemap_' . md5(__DIR__) . '.xml';

function send(string $xml): void
{
    header('Content-Type: application/xml; charset=utf-8');
    header('Cache-Control: public, max-age=' . CACHE_SECONDS);
    echo $xml;
    exit;
}

function fetchJson(string $url): ?array
{
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => API_TIMEOUT,
            CURLOPT_CONNECTTIMEOUT => 10,
            CURLOPT_HTTPHEADER     => ['Accept: application/json'],
            CURLOPT_FOLLOWLOCATION => true,
        ]);
        $body = curl_exec($ch);
        $status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
    } else {
        $ctx = stream_context_create(['http' => ['timeout' => API_TIMEOUT, 'header' => "Accept: application/json\r\n"]]);
        $body = @file_get_contents($url, false, $ctx);
        $status = $body === false ? 0 : 200;
    }
    if ($body === false || $status !== 200) {
        return null;
    }
    $data = json_decode((string) $body, true);
    return is_array($data) ? $data : null;
}

function esc(string $value): string
{
    return htmlspecialchars($value, ENT_XML1 | ENT_QUOTES, 'UTF-8');
}

function isoDate($value): string
{
    if ($value === null || $value === '') {
        return '';
    }
    if (is_numeric($value)) {
        $ts = (int) floor(((float) $value) / 1000);
    } else {
        $ts = strtotime((string) $value);
        if ($ts === false) {
            return '';
        }
    }
    return gmdate('Y-m-d\TH:i:s.000\Z', $ts);
}

function cleanSlug(string $raw): string
{
    $s = preg_replace('#^/+#', '', $raw) ?? '';
    $s = preg_replace('#^blog/#', '', $s) ?? '';
    return preg_replace('#/+$#', '', $s) ?? '';
}

function canonicalFor(array $blog): string
{
    $self = SITE_URL . '/blog/' . cleanSlug((string) ($blog['permalink'] ?? ''));
    $custom = trim((string) ($blog['canonical_url'] ?? ''));
    if ($custom === '' || !preg_match('#^https?://#i', $custom)) {
        return $self;
    }
    $parts = parse_url($custom);
    $site = parse_url(SITE_URL);
    $path = $parts['path'] ?? '/';
    if (($parts['host'] ?? '') === ($site['host'] ?? '') && strpos($path, '/blog/') === 0) {
        return rtrim($custom, '/');
    }
    return $self;
}

if (is_file($cacheFile) && time() - (int) filemtime($cacheFile) < CACHE_SECONDS) {
    send((string) file_get_contents($cacheFile));
}

$pages = is_file($pagesFile) ? (string) file_get_contents($pagesFile) : '';
$blogs = fetchJson(API_BASE_URL . '/api/blogs');
$caseStudies = $blogs === null ? null : fetchJson(API_BASE_URL . '/api/case-studies');

if ($pages !== '' && $blogs !== null && $caseStudies !== null) {
    $entries = [];
    $studyEntries = [];
    $latestStudy = '';
    foreach ($caseStudies as $cs) {
        $slug = is_array($cs) ? (string) ($cs['slug'] ?? '') : '';
        if (($cs['status'] ?? '') !== 'published' || !preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/', $slug)) {
            continue;
        }
        $lastmod = isoDate($cs['updatedAt'] ?? null) ?: isoDate($cs['published_at'] ?? null) ?: isoDate($cs['createdAt'] ?? null);
        if ($lastmod > $latestStudy) {
            $latestStudy = $lastmod;
        }
        $entry = "<url>
<loc>" . esc(SITE_URL . '/case-studies/' . $slug) . "</loc>
";
        if ($lastmod !== '') {
            $entry .= "<lastmod>{$lastmod}</lastmod>
";
        }
        $entry .= "<changefreq>monthly</changefreq>
<priority>0.7</priority>
";
        if (!empty($cs['cover_image'])) {
            $entry .= "<image:image>
<image:loc>" . esc((string) $cs['cover_image']) . "</image:loc>
</image:image>
";
        }
        $studyEntries[] = $entry . "</url>";
    }
    if ($studyEntries) {
        $hub = "<url>
<loc>" . esc(SITE_URL . '/case-studies') . "</loc>
";
        if ($latestStudy !== '') {
            $hub .= "<lastmod>{$latestStudy}</lastmod>
";
        }
        $entries[] = $hub . "<changefreq>monthly</changefreq>
<priority>0.8</priority>
</url>";
        array_push($entries, ...$studyEntries);
    }
    foreach ($blogs as $blog) {
        if (!is_array($blog) || ($blog['status'] ?? '') !== 'published' || trim((string) ($blog['permalink'] ?? '')) === '') {
            continue;
        }

        if (strpos((string) ($blog['robots_directive'] ?? ''), 'noindex') === 0) {
            continue;
        }
        $lastmod = isoDate($blog['last_modified_at'] ?? null) ?: isoDate($blog['updatedAt'] ?? null) ?: isoDate($blog['createdAt'] ?? null);
        $entry = "<url>\n<loc>" . esc(canonicalFor($blog)) . "</loc>\n";
        if ($lastmod !== '') {
            $entry .= "<lastmod>{$lastmod}</lastmod>\n";
        }
        $entry .= "<changefreq>weekly</changefreq>\n<priority>0.8</priority>\n";
        if (!empty($blog['image'])) {
            $entry .= "<image:image>\n<image:loc>" . esc((string) $blog['image']) . "</image:loc>\n</image:image>\n";
        }
        $entries[] = $entry . "</url>";
    }

    $xml = str_replace('</urlset>', implode("\n", $entries) . "\n</urlset>", $pages);
    @file_put_contents($cacheFile, $xml, LOCK_EX);
    send($xml);
}

if (is_file($cacheFile)) {
    send((string) file_get_contents($cacheFile));
}
if (is_file($fallbackFile)) {
    send((string) file_get_contents($fallbackFile));
}
http_response_code(503);
header('Retry-After: 300');
send('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>');
