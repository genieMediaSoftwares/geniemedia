<?php
/**
 * Contact form handler for Genie Media & Studio (Hostinger).
 *
 * Receives the JSON the website's contact form posts:
 *   { "name", "email", "phone", "service", "message" }
 * and emails it to the business inbox. Always answers JSON:
 *   { "success": true, "message": "..." }  or  { "success": false, "message": "..." }
 *
 * The __PLACEHOLDERS__ below are filled from frontend-next/.env by
 * `npm run build` (scripts/postbuild.mjs). Edit .env, not this file.
 */

declare(strict_types=1);

const TO_EMAIL   = '__CONTACT_TO_EMAIL__';   // inbox that receives enquiries
const FROM_EMAIL = '__CONTACT_FROM_EMAIL__'; // must be a mailbox on this domain (Hostinger SPF)
const SITE_URL   = '__SITE_URL__';           // only this site may post here

const MAX_PER_WINDOW = 5;    // submissions allowed per IP...
const WINDOW_SECONDS = 600;  // ...per 10 minutes

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

function respond(int $status, bool $success, string $message): void
{
    http_response_code($status);
    echo json_encode(['success' => $success, 'message' => $message]);
    exit;
}

// Same-site requests only (the form is served from SITE_URL).
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '' && rtrim($origin, '/') !== rtrim(SITE_URL, '/')) {
    respond(403, false, 'Requests from this origin are not allowed.');
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    respond(405, false, 'Method not allowed.');
}

// Simple per-IP rate limit, stored in the system temp folder.
$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$rateFile = rtrim(sys_get_temp_dir(), DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . 'gm_contact_' . md5($ip);
$now = time();
$hits = [];
if (is_file($rateFile)) {
    $saved = json_decode((string) @file_get_contents($rateFile), true);
    if (is_array($saved)) {
        $hits = array_values(array_filter($saved, static fn ($t) => is_int($t) && $t > $now - WINDOW_SECONDS));
    }
}
if (count($hits) >= MAX_PER_WINDOW) {
    respond(429, false, 'Too many messages. Please try again in a few minutes.');
}

// Read the JSON body (fall back to a classic form post).
$raw = (string) file_get_contents('php://input', false, null, 0, 20000);
$data = json_decode($raw, true);
if (!is_array($data)) {
    $data = $_POST;
}

/** Trimmed single-line text, capped in length. */
function field(array $data, string $key, int $max): string
{
    $value = isset($data[$key]) && is_scalar($data[$key]) ? (string) $data[$key] : '';
    $value = trim(preg_replace('/\s+/u', ' ', $value) ?? '');
    return mb_substr($value, 0, $max);
}

$name    = field($data, 'name', 100);
$email   = field($data, 'email', 254);
$phone   = field($data, 'phone', 30);
$service = field($data, 'service', 100);
$message = isset($data['message']) && is_scalar($data['message'])
    ? mb_substr(trim((string) $data['message']), 0, 5000)
    : '';

if ($name === '' || $email === '' || $message === '') {
    respond(422, false, 'Please fill in your name, email and message.');
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(422, false, 'Please enter a valid email address.');
}
if ($phone !== '' && !preg_match('/^[0-9+()\-.\s]{6,30}$/', $phone)) {
    respond(422, false, 'Please enter a valid phone number.');
}

// Header injection guard: nothing that ends up in a mail header may contain a line break.
$safeName  = str_replace(["\r", "\n"], ' ', $name);
$safeEmail = str_replace(["\r", "\n"], '', $email);

$subject = 'New website enquiry from ' . $safeName . ($service !== '' ? ' (' . $service . ')' : '');
$body = implode("\n", [
    'New enquiry from the website contact form',
    '',
    'Name:    ' . $name,
    'Email:   ' . $email,
    'Phone:   ' . ($phone !== '' ? $phone : '-'),
    'Service: ' . ($service !== '' ? $service : '-'),
    '',
    'Message:',
    $message,
    '',
    '--',
    'Sent from ' . SITE_URL . '/contact on ' . date('Y-m-d H:i') . ' (IP ' . $ip . ')',
]);

$headers = implode("\r\n", [
    'From: Genie Media Website <' . FROM_EMAIL . '>',
    'Reply-To: ' . $safeName . ' <' . $safeEmail . '>',
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'X-Mailer: PHP/' . PHP_VERSION,
]);

$encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';
$sent = @mail(TO_EMAIL, $encodedSubject, $body, $headers, '-f' . FROM_EMAIL);

if (!$sent) {
    error_log('contact.php: mail() failed for enquiry from ' . $safeEmail);
    respond(500, false, 'Your message could not be sent right now. Please call or WhatsApp us.');
}

$hits[] = $now;
@file_put_contents($rateFile, json_encode($hits), LOCK_EX);

respond(200, true, 'Thank you! Your message has been sent. We will get back to you soon.');
