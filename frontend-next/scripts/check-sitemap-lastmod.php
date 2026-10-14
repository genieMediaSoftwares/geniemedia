<?php
// Regression check for live SEO timestamps with and without an existing lastmod.
$source = file_get_contents(__DIR__ . '/../public/sitemap.php');
$start = strpos($source, 'function isoDate(');
$end = strpos($source, 'function cleanSlug(', $start);
eval(substr($source, $start, $end - $start));
$start = strpos($source, 'function esc(');
$end = strpos($source, 'function isoDate(', $start);
eval(substr($source, $start, $end - $start));
$start = strpos($source, 'function applySeoLastmod(');
$end = strpos($source, '$cacheFresh', $start);
eval(substr($source, $start, $end - $start));
define('SITE_URL', 'https://geniemedia.in');
$fixture = tempnam(sys_get_temp_dir(), 'gm_lastmod_');
try {
    file_put_contents($fixture, json_encode(['pages' => ['/about' => ['publishedAt' => '2026-10-14T10:00:00Z']]]));
    foreach (['' => '2026-10-14', '<lastmod>2026-10-01T00:00:00.000Z</lastmod>' => '2026-10-14', '<lastmod>2026-10-15T00:00:00.000Z</lastmod>' => '2026-10-15'] as $existing => $expected) {
        $xml = '<url><loc>https://geniemedia.in/about</loc>' . $existing . '<priority>0.8</priority></url>';
        $result = applySeoLastmod($xml, $fixture);
        if (substr_count($result, '<lastmod>') !== 1 || !str_contains($result, '<lastmod>' . $expected)) {
            throw new RuntimeException('Incorrect modification date: ' . $result);
        }
    }
    echo "Passed three sitemap lastmod regression cases.\n";
} finally {
    unlink($fixture);
}
