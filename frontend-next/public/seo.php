<?php
declare(strict_types=1);

const SEO_LIVE_DIR = __DIR__ . '/seo-live';

function seo_h(string $s): string
{
    return str_replace(['&', '<', '>', '"', "'"], ['&amp;', '&lt;', '&gt;', '&quot;', '&#x27;'], $s);
}

function seo_unh(string $s): string
{
    return html_entity_decode($s, ENT_QUOTES | ENT_HTML5, 'UTF-8');
}

function seo_json(string $s): string
{
    return (string) json_encode($s, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
}

function seo_inner(string $s): string
{
    return substr(seo_json($s), 1, -1);
}

function seo_html_json(string $s): string
{
    return str_replace(['&', '<', '>', "\u{2028}", "\u{2029}"], ['\u0026', '\u003c', '\u003e', '\u2028', '\u2029'], $s);
}

function seo_head_values(string $html): array
{
    $head = (string) strstr($html, '</head>', true);
    $get = function (string $re) use ($head): ?string {
        return preg_match($re, $head, $m) ? seo_unh($m[1]) : null;
    };
    return [
        'title' => $get('#<title>([^<]*)</title>#'),
        'description' => $get('#<meta name="description" content="([^"]*)"/>#'),
        'robots' => $get('#<meta name="robots" content="([^"]*)"/>#'),
        'googlebot' => $get('#<meta name="googlebot" content="([^"]*)"/>#'),
        'canonical' => $get('#<link rel="canonical" href="([^"]*)"/>#'),
        'og:title' => $get('#<meta property="og:title" content="([^"]*)"/>#'),
        'og:description' => $get('#<meta property="og:description" content="([^"]*)"/>#'),
        'og:url' => $get('#<meta property="og:url" content="([^"]*)"/>#'),
        'og:image' => $get('#<meta property="og:image" content="([^"]*)"/>#'),
        'twitter:title' => $get('#<meta name="twitter:title" content="([^"]*)"/>#'),
        'twitter:description' => $get('#<meta name="twitter:description" content="([^"]*)"/>#'),
        'twitter:image' => $get('#<meta name="twitter:image" content="([^"]*)"/>#'),
    ];
}

function seo_robots(bool $index, bool $follow): string
{
    return ($index ? 'index' : 'noindex') . ', ' . ($follow ? 'follow' : 'nofollow');
}

function seo_safe_text(string $s, int $min, int $max): bool
{
    $len = mb_strlen($s);
    return $len >= $min && $len <= $max && !preg_match('/[<>"\\\\\x00-\x1F]/u', $s);
}

function seo_safe_url(string $s): bool
{
    return (bool) preg_match('#^https://[A-Za-z0-9.\-]+(/[A-Za-z0-9._~%/\-]*)?$#', $s) && strlen($s) <= 300;
}

function seo_plan(array $old, array $cfg): array
{
    $plan = [];
    $add = function (string $kind, string $key, ?string $from, string $to) use (&$plan) {
        if ($from !== null && $from !== $to) {
            $plan[] = ['kind' => $kind, 'key' => $key, 'from' => $from, 'to' => $to];
        }
    };
    $title = (string) ($cfg['seoTitle'] ?? '');
    $desc = (string) ($cfg['metaDescription'] ?? '');
    $canonical = (string) ($cfg['canonicalUrl'] ?? '');
    $image = (string) ($cfg['ogImage'] ?? '');
    $newTitle = seo_safe_text($title, 10, 70) ? $title : $old['title'];
    $newDesc = seo_safe_text($desc, 50, 200) ? $desc : $old['description'];
    $newCanonical = $canonical !== '' && seo_safe_url($canonical) ? $canonical : $old['canonical'];
    $newImage = $image !== '' && seo_safe_url($image) ? $image : $old['og:image'];

    if ($old['title'] !== null && $newTitle !== null) {
        $add('title', 'title', $old['title'], $newTitle);
        if ($old['og:title'] === $old['title']) $add('property', 'og:title', $old['og:title'], $newTitle);
        if ($old['twitter:title'] === $old['title']) $add('name', 'twitter:title', $old['twitter:title'], $newTitle);
        $add('jsonld', 'name', $old['title'], $newTitle);
    }
    if ($old['description'] !== null && $newDesc !== null) {
        $add('name', 'description', $old['description'], $newDesc);
        if ($old['og:description'] === $old['description']) $add('property', 'og:description', $old['og:description'], $newDesc);
        if ($old['twitter:description'] === $old['description']) $add('name', 'twitter:description', $old['twitter:description'], $newDesc);
        $add('jsonld', 'description', $old['description'], $newDesc);
    }
    if ($old['canonical'] !== null && $newCanonical !== null) {
        $add('canonical', 'canonical', $old['canonical'], $newCanonical);
        if ($old['og:url'] === $old['canonical']) $add('property', 'og:url', $old['og:url'], $newCanonical);
    }
    if ($old['og:image'] !== null && $newImage !== null) {
        $add('property', 'og:image', $old['og:image'], $newImage);
        if ($old['twitter:image'] === $old['og:image']) $add('name', 'twitter:image', $old['twitter:image'], $newImage);
    }
    if (array_key_exists('robotsIndex', $cfg) || array_key_exists('robotsFollow', $cfg)) {
        $index = ($cfg['robotsIndex'] ?? true) !== false;
        $follow = ($cfg['robotsFollow'] ?? true) !== false;
        if (!($index && $follow)) {
            $add('name', 'robots', $old['robots'], seo_robots($index, $follow));
            $add('name', 'googlebot', $old['googlebot'], seo_robots($index, $follow));
        }
    }
    return $plan;
}

function seo_fragments(array $p): array
{
    switch ($p['kind']) {
        case 'title':
            return ['{"children":' . seo_json($p['from']) . '}', '{"children":' . seo_json($p['to']) . '}'];
        case 'name':
            return ['{"name":"' . $p['key'] . '","content":' . seo_json($p['from']) . '}', '{"name":"' . $p['key'] . '","content":' . seo_json($p['to']) . '}'];
        case 'property':
            return ['{"property":"' . $p['key'] . '","content":' . seo_json($p['from']) . '}', '{"property":"' . $p['key'] . '","content":' . seo_json($p['to']) . '}'];
        case 'canonical':
            return ['{"rel":"canonical","href":' . seo_json($p['from']) . '}', '{"rel":"canonical","href":' . seo_json($p['to']) . '}'];
        case 'jsonld':
            return ['"' . $p['key'] . '":' . seo_json($p['from']), '"' . $p['key'] . '":' . seo_json($p['to'])];
    }
    return ['', ''];
}

function seo_head_tag(array $p, string $value): ?string
{
    switch ($p['kind']) {
        case 'title':
            return '<title>' . seo_h($value) . '</title>';
        case 'name':
            return '<meta name="' . $p['key'] . '" content="' . seo_h($value) . '"/>';
        case 'property':
            return '<meta property="' . $p['key'] . '" content="' . seo_h($value) . '"/>';
        case 'canonical':
            return '<link rel="canonical" href="' . seo_h($value) . '"/>';
    }
    return null;
}

function seo_visible_body(string $html): string
{
    $body = (string) strstr($html, '</head>');
    return (string) preg_replace('#<script\b[^>]*>.*?</script>#s', '', $body);
}

function seo_encode_chunk(string $s): string
{
    $json = (string) json_encode($s, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    $bs = chr(92);
    return str_replace(['&', '<', '>'], [$bs . 'u0026', $bs . 'u003c', $bs . 'u003e'], $json);
}

function seo_stream_edits(string $s, array $pairs): ?array
{
    $len = strlen($s);
    $rows = [];
    $pos = 0;
    while ($pos < $len) {
        if (!preg_match('/\G([0-9a-f]*):/', $s, $m, 0, $pos)) {
            return null;
        }
        $after = $pos + strlen($m[0]);
        if (($s[$after] ?? '') === 'T') {
            $comma = strpos($s, ',', $after);
            if ($comma === false) {
                return null;
            }
            $hex = substr($s, $after + 1, $comma - $after - 1);
            if (!preg_match('/^[0-9a-f]+$/', $hex)) {
                return null;
            }
            $start = $comma + 1;
            $end = $start + hexdec($hex);
            if ($end > $len) {
                return null;
            }
            $rows[] = ['hexAt' => $after + 1, 'hex' => $hex, 'start' => $start, 'end' => $end];
            $pos = $end;
        } else {
            $nl = strpos($s, "\n", $after);
            $pos = $nl === false ? $len : $nl + 1;
        }
    }

    $edits = [];
    foreach ($pairs as [$from, $to]) {
        $offset = 0;
        while (($at = strpos($s, $from, $offset)) !== false) {
            $edits[] = [$at, strlen($from), $to];
            $offset = $at + strlen($from);
        }
    }
    usort($edits, fn ($a, $b) => $a[0] <=> $b[0]);
    for ($i = 1; $i < count($edits); $i++) {
        if ($edits[$i][0] < $edits[$i - 1][0] + $edits[$i - 1][1]) {
            return null;
        }
    }
    foreach ($rows as $row) {
        $delta = 0;
        foreach ($edits as [$at, $oldLen, $new]) {
            $inside = $at >= $row['start'] && $at + $oldLen <= $row['end'];
            $straddles = !$inside && $at < $row['end'] && $at + $oldLen > $row['start'];
            if ($straddles) {
                return null;
            }
            if ($inside) {
                $delta += strlen($new) - $oldLen;
            }
        }
        if ($delta !== 0) {
            $edits[] = [$row['hexAt'], strlen($row['hex']), dechex(hexdec($row['hex']) + $delta)];
        }
    }
    usort($edits, fn ($a, $b) => $a[0] <=> $b[0]);
    return $edits;
}

function seo_apply_edits(string $s, array $edits, int $base = 0): string
{
    foreach (array_reverse($edits) as [$at, $oldLen, $new]) {
        $s = substr_replace($s, $new, $at - $base, $oldLen);
    }
    return $s;
}

function seo_patch(string $doc, string $routeHtml, array $cfg, bool $isHtml): array
{
    $old = seo_head_values($routeHtml);
    $plan = seo_plan($old, $cfg);
    if (!$plan) {
        return ['ok' => true, 'doc' => $doc, 'changed' => []];
    }
    $visible = seo_visible_body($routeHtml);
    foreach ($plan as $p) {
        if ($p['kind'] === 'title' && strpos($visible, '>' . seo_h($p['from']) . '<') !== false) {
            return ['ok' => false, 'doc' => $doc, 'error' => 'The current title is also visible page text; title changes need a rebuild.'];
        }
    }
    $pairs = [];
    foreach ($plan as $p) {
        $pairs[] = seo_fragments($p);
    }
    $fail = fn (string $why) => ['ok' => false, 'doc' => $doc, 'error' => $why];

    if (!$isHtml) {
        $edits = seo_stream_edits($doc, $pairs);
        if ($edits === null) {
            return $fail('The page data has an unexpected format; serving the built file.');
        }
        $out = seo_apply_edits($doc, $edits);
        foreach ($pairs as [$from, $to]) {
            if ($from !== $to && strpos($out, $from) !== false) {
                return $fail('An old value would remain in the page data.');
            }
        }
        return ['ok' => true, 'doc' => $out, 'changed' => array_values(array_unique(array_column($plan, 'key')))];
    }

    if (!preg_match_all('/self\.__next_f\.push\(\[1,("(?:[^"\\\\]++|\\\\.)*+")\]\)/', $doc, $calls, PREG_OFFSET_CAPTURE)) {
        return $fail('No page data found; serving the built page.');
    }
    $chunks = [];
    $stream = '';
    foreach ($calls[1] as [$literal, $offset]) {
        $decoded = json_decode($literal);
        if (!is_string($decoded)) {
            return $fail('Unreadable page data; serving the built page.');
        }
        $chunks[] = ['literal' => $literal, 'offset' => $offset, 'start' => strlen($stream), 'text' => $decoded];
        $stream .= $decoded;
    }
    $edits = seo_stream_edits($stream, $pairs);
    if ($edits === null) {
        return $fail('The page data has an unexpected format; serving the built page.');
    }
    $byChunk = [];
    foreach ($edits as $e) {
        $found = false;
        foreach ($chunks as $i => $c) {
            $end = $c['start'] + strlen($c['text']);
            if ($e[0] >= $c['start'] && $e[0] + $e[1] <= $end) {
                $byChunk[$i][] = $e;
                $found = true;
                break;
            }
        }
        if (!$found) {
            return $fail('A value crosses a page-data boundary; serving the built page.');
        }
    }
    $out = $doc;
    foreach (array_reverse($byChunk, true) as $i => $chunkEdits) {
        $c = $chunks[$i];
        if (seo_encode_chunk($c['text']) !== $c['literal']) {
            return $fail('Page data encoding could not be reproduced; serving the built page.');
        }
        $newLiteral = seo_encode_chunk(seo_apply_edits($c['text'], $chunkEdits, $c['start']));
        $out = substr_replace($out, $newLiteral, $c['offset'], strlen($c['literal']));
    }

    $changed = [];
    foreach ($plan as $p) {
        $fromTag = seo_head_tag($p, $p['from']);
        if ($fromTag !== null) {
            $out = str_replace($fromTag, (string) seo_head_tag($p, $p['to']), $out, $n);
            if ($n === 0) {
                return $fail("Could not find the {$p['key']} tag in the page head; serving the built page.");
            }
            $changed[] = $p['key'];
        } else {
            [$from, $to] = seo_fragments($p);
            $bs = chr(92);
            $out = preg_replace_callback('#(<script type="application/ld\+json">)(.*?)(</script>)#s', function ($m) use ($from, $to, $bs) {
                $f = str_replace('<', $bs . 'u003c', $from);
                $t = str_replace('<', $bs . 'u003c', $to);
                return $m[1] . str_replace($f, $t, $m[2]) . $m[3];
            }, $out);
            $changed[] = $p['key'];
        }
    }

    $check = seo_head_values($out);
    $stream2 = '';
    if (preg_match_all('/self\.__next_f\.push\(\[1,("(?:[^"\\\\]++|\\\\.)*+")\]\)/', $out, $calls2)) {
        foreach ($calls2[1] as $literal) {
            $decoded = json_decode($literal);
            if (!is_string($decoded)) {
                return $fail('Page data became unreadable after patching; serving the built page.');
            }
            $stream2 .= $decoded;
        }
    }
    if (seo_stream_edits($stream2, []) === null) {
        return $fail('Page data became inconsistent after patching; serving the built page.');
    }
    foreach ($pairs as [$from, $to]) {
        if ($from !== $to && strpos($stream2, $from) !== false) {
            return $fail('An old value would remain in the page data; serving the built page.');
        }
    }
    foreach ($plan as $p) {
        if ($p['kind'] === 'title' && $check['title'] !== $p['to']) {
            return $fail('The title could not be updated; serving the built page.');
        }
    }
    return ['ok' => true, 'doc' => $out, 'changed' => array_values(array_unique($changed))];
}

function seo_load_config(): ?array
{
    $file = SEO_LIVE_DIR . '/config.json';
    if (!is_file($file)) {
        return null;
    }
    $data = json_decode((string) file_get_contents($file), true);
    return is_array($data) ? $data : null;
}

function seo_log_error(string $route, string $message): void
{
    $line = gmdate('c') . "\t" . $route . "\t" . $message . "\n";
    @file_put_contents(SEO_LIVE_DIR . '/errors.log', $line, FILE_APPEND | LOCK_EX);
}

function seo_resolve(string $root, string $path): ?array
{
    $path = '/' . ltrim($path, '/');
    if (preg_match('#\.txt$#', $path)) {
        if (!preg_match('#^/([a-z0-9_-]+(?:/[a-z0-9_-]+)*)(?:\.txt|/__next\.[A-Za-z0-9._$-]+(?:/__PAGE__)?\.txt)$#', $path, $m)
            && !preg_match('#^/(index)\.txt$#', $path, $m)
            && !preg_match('#^/()__next\.[A-Za-z0-9._$-]+\.txt$#', $path, $m)) {
            return null;
        }
        $route = $m[1] === '' ? 'index' : $m[1];
        $file = $root . $path;
        $type = 'text/plain; charset=utf-8';
    } else {
        $route = trim($path, '/');
        if ($route === '') {
            $route = 'index';
        }
        if (!preg_match('#^[a-z0-9_-]+(?:/[a-z0-9_-]+)*$#', $route)) {
            return null;
        }
        $file = $root . '/' . $route . '.html';
        $type = 'text/html; charset=utf-8';
    }
    $real = realpath($file);
    $realRoot = realpath($root);
    if ($real === false || $realRoot === false || strpos($real, $realRoot . DIRECTORY_SEPARATOR) !== 0 || !is_file($real)) {
        return null;
    }
    $html = realpath($root . '/' . $route . '.html');
    if ($html === false || strpos($html, $realRoot . DIRECTORY_SEPARATOR) !== 0) {
        return null;
    }
    return ['route' => $route, 'file' => $real, 'html' => $html, 'type' => $type, 'isHtml' => $type[5] === 'h'];
}

function seo_serve(): void
{
    $root = __DIR__;
    $path = rawurldecode((string) parse_url((string) ($_SERVER['REQUEST_URI'] ?? '/'), PHP_URL_PATH));
    $target = seo_resolve($root, $path);
    if ($target === null) {
        http_response_code(404);
        header('Content-Type: text/html; charset=utf-8');
        $page = $root . '/404.html';
        echo is_file($page) ? (string) file_get_contents($page) : 'Not found';
        return;
    }
    $doc = (string) file_get_contents($target['file']);
    $config = seo_load_config();
    $routeKey = $target['route'] === 'index' ? '/' : '/' . $target['route'];
    $entry = $config['pages'][$routeKey] ?? null;
    $state = 'static';
    if (is_array($entry)) {
        $routeHtml = $target['isHtml'] ? $doc : (string) file_get_contents($target['html']);
        $result = seo_patch($doc, $routeHtml, $entry, $target['isHtml']);
        if ($result['ok']) {
            $doc = $result['doc'];
            $state = $result['changed'] ? 'live-v' . (int) ($entry['version'] ?? 0) : 'static';
        } else {
            seo_log_error($routeKey, (string) $result['error']);
            $state = 'fallback';
        }
    }
    $etag = '"' . md5($doc) . '"';
    header('Content-Type: ' . $target['type']);
    header('Cache-Control: public, max-age=0, must-revalidate');
    header('ETag: ' . $etag);
    header('X-Seo-Live: ' . $state);
    if (trim((string) ($_SERVER['HTTP_IF_NONE_MATCH'] ?? '')) === $etag) {
        http_response_code(304);
        return;
    }
    echo $doc;
}

if (PHP_SAPI !== 'cli' || getenv('SEO_PHP_SERVE') === '1') {
    seo_serve();
}
