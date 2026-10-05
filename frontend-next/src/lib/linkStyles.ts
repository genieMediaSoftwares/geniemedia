/**
 * Inline links inside running text (paragraphs, FAQ answers, intros).
 *
 * They read as part of the sentence: same colour, weight and size as the text
 * around them, no underline. They are still real <a href> links (crawlable,
 * clickable); hover dims them slightly, and keyboard focus shows an outline.
 *
 * Not for navigation, buttons, cards, breadcrumbs or the footer: those keep
 * their own designed styles.
 */
export const CONTENT_LINK =
  "text-inherit no-underline transition-opacity duration-200 hover:opacity-80 rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current";

/**
 * The same look for links inside rich text the page does not render itself
 * (blog article bodies, legal pages): apply to the container.
 */
export const RICH_TEXT_LINKS =
  "[&_a]:text-inherit [&_a]:no-underline [&_a]:transition-opacity [&_a]:duration-200 [&_a:hover]:opacity-80 [&_a]:rounded-sm [&_a:focus-visible]:outline [&_a:focus-visible]:outline-2 [&_a:focus-visible]:outline-offset-2 [&_a:focus-visible]:outline-current";
