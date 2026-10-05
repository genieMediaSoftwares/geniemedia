<?php
/**
 * Deletes one image from public_html/uploads/ (Hostinger).
 *
 * Called by the Express backend (server-to-server) after a blog or project is
 * deleted, or its image is replaced/removed, so the uploads folder always
 * matches the database. Not for browsers.
 *
 *   POST /delete-upload.php
 *   Header:  X-Delete-Secret: <UPLOAD_DELETE_SECRET>
 *   Body:    {"file": "1791179014_1791179014571-854746835.png.webp"}
 *
 * Safety: shared-secret auth (constant-time compare), POST only, a bare file
 * name only (no paths), image extensions only, and the resolved path must be
 * inside uploads/. A file that is already gone counts as success.
 *
 * __UPLOAD_DELETE_SECRET__ is filled from frontend-next/.env by
 * `npm run build` (scripts/postbuild.mjs). Edit .env, not this file.
 */

declare(strict_types=1);

const DELETE_SECRET = '__UPLOAD_DELETE_SECRET__';
const UPLOADS_DIR   = __DIR__ . '/uploads';
const ALLOWED_EXT   = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif'];

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Robots-Tag: noindex, nofollow');

function respond(int $status, bool $success, string $message): void
{
    http_response_code($status);
    echo json_encode(['success' => $success, 'message' => $message]);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    respond(405, false, 'Method not allowed.');
}

// Refuse to run with a missing or placeholder secret.
if (strlen(DELETE_SECRET) < 32 || strpos(DELETE_SECRET, '__') === 0) {
    respond(503, false, 'Delete endpoint is not configured.');
}

$given = (string) ($_SERVER['HTTP_X_DELETE_SECRET'] ?? '');
if ($given === '' || !hash_equals(DELETE_SECRET, $given)) {
    respond(401, false, 'Unauthorized.');
}

$payload = json_decode((string) file_get_contents('php://input', false, null, 0, 2000), true);
$file = is_array($payload) && isset($payload['file']) && is_string($payload['file']) ? trim($payload['file']) : '';

// A bare file name only: no folders, no "..", nothing unusual.
if ($file === '' || $file !== basename($file) || !preg_match('/^[A-Za-z0-9][A-Za-z0-9._-]{0,200}$/', $file)) {
    respond(400, false, 'Invalid file name.');
}
$ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
if (!in_array($ext, ALLOWED_EXT, true)) {
    respond(400, false, 'Only image files can be deleted.');
}

$dir = realpath(UPLOADS_DIR);
if ($dir === false) {
    respond(500, false, 'Uploads folder not found.');
}
$target = $dir . DIRECTORY_SEPARATOR . $file;

if (!file_exists($target)) {
    respond(200, true, 'Already deleted.');
}

// The real path must still be inside uploads/ (guards against symlinks).
$real = realpath($target);
if ($real === false || strpos($real, $dir . DIRECTORY_SEPARATOR) !== 0 || !is_file($real)) {
    respond(400, false, 'Invalid file.');
}

if (!@unlink($real)) {
    respond(500, false, 'Could not delete the file.');
}
respond(200, true, 'Deleted.');
