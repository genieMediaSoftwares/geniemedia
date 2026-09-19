import React, { useEffect } from "react";
import { Helmet } from "react-helmet-async";

/**
 * Sets the title, description and canonical URL for a route.
 *
 *   <SEO
 *     title="Genie Media | Digital Marketing Agency in Visakhapatnam"
 *     description="…"
 *     canonical="https://geniemedia.in/"
 *   />
 *
 * WHY THERE IS AN EFFECT IN HERE AND NOT JUST <Helmet>
 *
 * On React 19, react-helmet-async hands metadata to React's own tag hoisting
 * instead of running its own DOM reconciler. React appends the <meta> and
 * <link> elements it renders; it does not look for matching tags that were
 * already in the HTML and replace them. Two things put such tags there before
 * React runs: the defaults in index.html, and the head the Express server
 * injects for crawlers (Backend/services/htmlInjector.js).
 *
 * Left alone, /about would serve one canonical from the server and gain a
 * second from React — two canonicals disagreeing about which URL is the real
 * one, which is worse than having none at all.
 *
 * So both of those sources label their tags `data-seo-ssr="1"`, and the effect
 * below removes them once this component has mounted and declared its own.
 * Crawlers that never execute JavaScript keep the server's tags; browsers end
 * up with exactly one of each. `<title>` needs no such treatment, since it is
 * set through document.title rather than by adding a second element.
 *
 * Nothing else in the head is touched. The analytics snippet, the favicon and
 * the verification tags live in index.html, carry no marker, and are never
 * read or written here.
 */

/** Tags this component declares, and therefore the ones it takes over. */
const HANDOFF_SELECTOR = "head [data-seo-ssr]";

export default function SEO({
  title,
  description,
  canonical,
  image,
  type = "website",
  children,
}) {
  useEffect(() => {
    // Runs after React has committed its own tags, so there is never a moment
    // with no description or canonical in the document.
    document.querySelectorAll(HANDOFF_SELECTOR).forEach((el) => el.remove());
  }, [title, description, canonical, image, type]);

  return (
    <Helmet prioritizeSeoTags>
      {title ? <title>{title}</title> : null}
      {description ? <meta name="description" content={description} /> : null}
      {canonical ? <link rel="canonical" href={canonical} /> : null}

      {/* `robots` is deliberately NOT managed here. The server emits it, and on
          a blog post useBlogSeo keeps it current. If this component owned it
          too, rendering a route that passes no robots value would drop the
          server's tag and with it max-image-preview:large. One owner per tag,
          and for robots that owner is not React. */}

      {/* Open Graph */}
      {title ? <meta property="og:title" content={title} /> : null}
      {description ? <meta property="og:description" content={description} /> : null}
      {canonical ? <meta property="og:url" content={canonical} /> : null}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="Genie Media & Studio" />
      <meta property="og:locale" content="en_IN" />
      {image ? <meta property="og:image" content={image} /> : null}

      {/* Twitter / X */}
      <meta name="twitter:card" content="summary_large_image" />
      {title ? <meta name="twitter:title" content={title} /> : null}
      {description ? <meta name="twitter:description" content={description} /> : null}
      {image ? <meta name="twitter:image" content={image} /> : null}

      {children}
    </Helmet>
  );
}
