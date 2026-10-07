<?php
declare(strict_types=1);

const API_BASE_URL  = '__API_BASE_URL__';
const SITE_URL      = '__SITE_URL__';
const SITE_NAME     = 'Genie Media & Studio';
const FRESH_SECONDS = 120;
const STALE_SECONDS = 86400;
const API_TIMEOUT   = 20;

function esc(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES | ENT_HTML5, 'UTF-8');
}

function clampAtWord(string $value, int $max): string
{
    $s = trim((string) preg_replace('/\s+/u', ' ', $value));
    if (mb_strlen($s) <= $max) {
        return $s;
    }
    $cut = mb_substr($s, 0, $max - 1);
    $space = mb_strrpos($cut, ' ');
    $cut = mb_substr($cut, 0, max($space === false ? 0 : $space, $max - 20));
    return rtrim($cut, " ,;:-–") . '…';
}

function cacheFile(string $url): string
{
    return rtrim(sys_get_temp_dir(), DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . 'gm_live_' . md5(__DIR__ . $url) . '.json';
}

function fetchItem(string $url): array
{
    $file = cacheFile($url);
    $age = is_file($file) ? time() - (int) filemtime($file) : PHP_INT_MAX;
    if ($age < FRESH_SECONDS) {
        $cached = json_decode((string) file_get_contents($file), true);
        if (is_array($cached)) {
            return $cached;
        }
    }

    $status = 0;
    $body = false;
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
        $ctx = stream_context_create(['http' => ['timeout' => API_TIMEOUT, 'ignore_errors' => true, 'header' => "Accept: application/json\r\n"]]);
        $body = @file_get_contents($url, false, $ctx);
        if (isset($http_response_header[0]) && preg_match('/\s(\d{3})\s/', $http_response_header[0], $m)) {
            $status = (int) $m[1];
        }
    }

    if ($status === 404) {
        $result = ['state' => 'missing'];
        @file_put_contents($file, json_encode($result), LOCK_EX);
        return $result;
    }
    $data = $body === false ? null : json_decode((string) $body, true);
    if ($status === 200 && is_array($data)) {
        $result = ['state' => 'found', 'item' => $data];
        @file_put_contents($file, json_encode($result), LOCK_EX);
        return $result;
    }
    if ($age < STALE_SECONDS) {
        $cached = json_decode((string) file_get_contents($file), true);
        if (is_array($cached)) {
            return $cached;
        }
    }
    return ['state' => 'unavailable'];
}

function notFound(): void
{
    http_response_code(404);
    header('Content-Type: text/html; charset=utf-8');
    header('X-Robots-Tag: noindex');
    $page = __DIR__ . '/404.html';
    echo is_file($page) ? (string) file_get_contents($page) : '<h1>Page not found</h1>';
    exit;
}

function render(string $template, array $meta, int $status = 200): void
{
    $path = __DIR__ . '/' . $template;
    if (!is_file($path)) {
        notFound();
    }
    $html = (string) file_get_contents($path);
    $html = (string) preg_replace('#<meta\s+name="(description|robots|googlebot)"[^>]*>#i', '', $html);
    $html = (string) preg_replace('#<link\s+rel="canonical"[^>]*>#i', '', $html);
    $html = (string) preg_replace('#<title>.*?</title>#is', '<title>' . esc($meta['title']) . '</title>', $html, 1);

    $tags = [
        '<meta name="description" content="' . esc($meta['description']) . '"/>',
        '<link rel="canonical" href="' . esc($meta['canonical']) . '"/>',
        '<meta name="robots" content="' . esc($meta['robots']) . '"/>',
        '<meta property="og:type" content="' . esc($meta['ogType']) . '"/>',
        '<meta property="og:url" content="' . esc($meta['canonical']) . '"/>',
        '<meta property="og:title" content="' . esc($meta['title']) . '"/>',
        '<meta property="og:description" content="' . esc($meta['description']) . '"/>',
        '<meta property="og:site_name" content="' . esc(SITE_NAME) . '"/>',
        '<meta property="og:image" content="' . esc($meta['image']) . '"/>',
        '<meta name="twitter:card" content="summary_large_image"/>',
        '<meta name="twitter:title" content="' . esc($meta['title']) . '"/>',
        '<meta name="twitter:description" content="' . esc($meta['description']) . '"/>',
        '<meta name="twitter:image" content="' . esc($meta['image']) . '"/>',
    ];
    if (!empty($meta['jsonLd'])) {
        $json = json_encode($meta['jsonLd'], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        $tags[] = '<script type="application/ld+json">' . str_replace('<', '<', (string) $json) . '</script>';
    }
    $html = (string) preg_replace('#</head>#i', implode('', $tags) . '</head>', $html, 1);

    http_response_code($status);
    if ($status === 503) {
        header('Retry-After: 120');
    }
    header('Content-Type: text/html; charset=utf-8');
    header('Cache-Control: public, max-age=0, must-revalidate');
    echo $html;
    exit;
}

function breadcrumb(array $crumbs): array
{
    $items = [];
    foreach ($crumbs as $i => [$name, $url]) {
        $items[] = ['@type' => 'ListItem', 'position' => $i + 1, 'name' => $name, 'item' => $url];
    }
    return ['@context' => 'https://schema.org', '@type' => 'BreadcrumbList', 'itemListElement' => $items];
}

$path = rawurldecode((string) parse_url((string) ($_SERVER['REQUEST_URI'] ?? ''), PHP_URL_PATH));
$type = (string) ($_GET['type'] ?? '');

if ($type === 'case-study') {
    if (!preg_match('#^/case-studies/([a-z0-9]+(?:-[a-z0-9]+)*)/?$#', $path, $m)) {
        notFound();
    }
    $slug = $m[1];
    $canonical = SITE_URL . '/case-studies/' . $slug;
    $result = fetchItem(API_BASE_URL . '/api/case-studies/' . rawurlencode($slug));

    if ($result['state'] === 'missing' || ($result['state'] === 'found' && ($result['item']['status'] ?? '') !== 'published')) {
        notFound();
    }
    if ($result['state'] !== 'found') {
        render('case-study-view.html', [
            'title' => 'Case Study | ' . SITE_NAME, 'description' => '', 'canonical' => $canonical,
            'robots' => 'noindex, follow', 'ogType' => 'article', 'image' => SITE_URL . '/GenieMedia-Logo.png',
        ], 503);
    }

    $cs = $result['item'];
    $client = trim((string) ($cs['client_name'] ?? ''));
    $labels = [
        'digital-marketing' => ['Digital Marketing', 'Digital Marketing'],
        'web-development'   => ['Website Development', 'Website'],
        'production'        => ['Video Production', 'Video Production'],
        'podcast'           => ['Podcast Production', 'Podcast'],
    ];
    [$label, $short] = $labels[(string) ($cs['category'] ?? '')] ?? ['Website Development', 'Website'];

    $title = trim((string) ($cs['seo_title'] ?? ''));
    if ($title === '') {
        foreach (["$client $label Case Study | " . SITE_NAME, "$client $short Case Study | " . SITE_NAME, "$client $short Case Study | Genie Media", "$client Case Study | Genie Media"] as $candidate) {
            if (mb_strlen($candidate) <= 60) {
                $title = $candidate;
                break;
            }
        }
        if ($title === '') {
            $title = clampAtWord("$client Case Study", 60);
        }
    }

    $overview = trim((string) ($cs['overview'] ?? ''));
    $firstParagraph = trim((string) (preg_split('/\n\s*\n/', $overview)[0] ?? ''));
    $firstSentence = preg_match('/^.+?[.!?](?=\s|$)/su', $firstParagraph, $sm) ? trim($sm[0]) : $firstParagraph;
    $description = trim((string) ($cs['seo_description'] ?? ''));
    if ($description === '') {
        $base = trim((string) ($cs['short_description'] ?? '')) ?: ($firstSentence ?: (string) ($cs['title'] ?? ''));
        $description = (mb_strlen($base) < 120 && $firstSentence !== '' && mb_strpos($base, $firstSentence) === false) ? "$base $firstSentence" : $base;
    }
    $description = clampAtWord($description, 160);
    $image = (string) ($cs['og_image'] ?? '') ?: ((string) ($cs['cover_image'] ?? '') ?: SITE_URL . '/GenieMedia-Logo.png');

    render('case-study-view.html', [
        'title' => $title,
        'description' => $description,
        'canonical' => $canonical,
        'robots' => 'index, follow, max-image-preview:large',
        'ogType' => 'article',
        'image' => $image,
        'jsonLd' => breadcrumb([['Home', SITE_URL . '/'], ['Case Studies', SITE_URL . '/case-studies'], [$client, $canonical]]),
    ]);
}

if ($type === 'blog') {
    $slug = trim((string) preg_replace('#^/+blog/+#', '', $path), '/');
    if ($slug === '' || !preg_match('#^[A-Za-z0-9][A-Za-z0-9/_\-]*$#', $slug)) {
        notFound();
    }
    $self = SITE_URL . '/blog/' . $slug;
    $encoded = implode('/', array_map('rawurlencode', explode('/', $slug)));
    $result = fetchItem(API_BASE_URL . '/api/blog/' . $encoded);

    if ($result['state'] === 'missing' || ($result['state'] === 'found' && ($result['item']['status'] ?? '') !== 'published')) {
        notFound();
    }
    if ($result['state'] !== 'found') {
        render('blog-view.html', [
            'title' => 'Blog | ' . SITE_NAME, 'description' => '', 'canonical' => $self,
            'robots' => 'noindex, follow', 'ogType' => 'article', 'image' => SITE_URL . '/GenieMedia-Logo.png',
        ], 503);
    }

    $blog = $result['item'];
    $canonical = $self;
    $custom = trim((string) ($blog['canonical_url'] ?? ''));
    if ($custom !== '' && preg_match('#^https?://#i', $custom)) {
        $parts = parse_url($custom);
        $site = parse_url(SITE_URL);
        if (($parts['host'] ?? '') === ($site['host'] ?? '') && strpos((string) ($parts['path'] ?? ''), '/blog/') === 0) {
            $canonical = rtrim($custom, '/');
        }
    }
    $directive = (string) ($blog['robots_directive'] ?? 'index,follow');
    $robots = str_replace(',', ', ', in_array($directive, ['index,follow', 'noindex,follow', 'noindex,nofollow'], true) ? $directive : 'index,follow');
    $plain = trim((string) preg_replace('/\s+/', ' ', strip_tags((string) ($blog['description'] ?? ''))));
    $description = (string) ($blog['metaDescription'] ?? '') ?: ((string) ($blog['direct_answer'] ?? '') ?: mb_substr($plain, 0, 160));
    $title = (string) ($blog['meta_title'] ?? '') ?: (string) ($blog['title'] ?? 'Blog');
    $image = (string) ($blog['og_image_url'] ?? '') ?: ((string) ($blog['image'] ?? '') ?: SITE_URL . '/GenieMedia-Logo.png');

    render('blog-view.html', [
        'title' => $title,
        'description' => clampAtWord($description, 160),
        'canonical' => $canonical,
        'robots' => $robots === 'index, follow' ? 'index, follow, max-image-preview:large' : $robots,
        'ogType' => 'article',
        'image' => $image,
        'jsonLd' => breadcrumb([['Home', SITE_URL . '/'], ['Blog', SITE_URL . '/blogs'], [(string) ($blog['title'] ?? ''), $canonical]]),
    ]);
}

notFound();
