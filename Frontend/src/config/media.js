/**
 * Externally hosted marketing videos.
 *
 * ⚠️  These previously pointed at https://karthik.kkdigitalgrowth.com/, which no
 * longer resolves — every request returned 404, producing console errors on
 * three separate pages and a broken player on two of them.
 *
 * The URLs are centralised here so re-hosting the clips is a one-line change.
 * Until they are re-hosted, set a value to `null` and the section will render
 * without the video rather than requesting a dead URL. Prefer serving them from
 * https://geniemedia.in/ (the same origin as the site) so they benefit from the
 * Hostinger CDN and the long cache lifetime configured in .htaccess.
 */
export const WEBSITES_VIDEO_URL = null;
export const PODCAST_CLIP_URL = null;
