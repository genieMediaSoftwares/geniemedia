import type { Metadata } from "next";

import LegalPage, { LegalContact, type LegalSection } from "@/components/legal/LegalPage";
import JsonLd from "@/components/seo/JsonLd";
import { SITE_HOST, SITE_ORIGIN } from "@/lib/site";
import { buildRouteMetadata } from "@/lib/seo/metadata";
import { metaForRoute } from "@/lib/seo/routeMeta";
import { CONTENT_LINK } from "@/lib/linkStyles";

export const metadata: Metadata = buildRouteMetadata("/privacy-policy");

// Describes what the site actually does: the contact form (contact.php), the
// WhatsApp booking hand-off, GA4/GTM, YouTube-nocookie and Google Maps embeds,
// and the admin login token. Update this page when any of those change.
const SECTIONS: LegalSection[] = [
  {
    id: "who-we-are",
    title: "Who we are",
    body: (
      <p>
        This website, <a href={SITE_ORIGIN}>{SITE_HOST}</a>, is operated by Genie Media &amp; Studio, a
        digital marketing, web development, video production and podcast studio business based in Visakhapatnam,
        Andhra Pradesh, India (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;). We are responsible for the personal
        data described in this policy.
      </p>
    ),
  },
  {
    id: "data-we-collect",
    title: "Information we collect",
    body: (
      <>
        <p>
          <strong>Information you give us.</strong> When you use our contact form, we receive your name, email
          address, phone number, the service you are interested in and your message. When you call, email or message
          us on WhatsApp, we receive whatever you choose to share in that conversation.
        </p>
        <p>
          <strong>Studio bookings.</strong> The podcast studio booking form does not store your details on our
          website. When you submit it, it opens WhatsApp with your chosen package, date, time slot, name, email, phone
          and notes pre-filled, and nothing is sent until you press send in WhatsApp.
        </p>
        <p>
          <strong>Information collected automatically.</strong> Like most websites, our hosting providers record
          standard technical data such as your IP address, browser type, the pages you request and the time of the
          request. With analytics enabled, we also collect usage information described in the &quot;Cookies and
          analytics&quot; section below.
        </p>
        <p>We do not knowingly collect sensitive personal data, and we do not collect payment card details on this website.</p>
      </>
    ),
  },
  {
    id: "how-we-use",
    title: "How we use your information",
    body: (
      <ul>
        <li>To reply to your enquiry and provide quotes, proposals and the services you request.</li>
        <li>To arrange and confirm studio bookings and project work.</li>
        <li>To understand how visitors use the website so we can improve its content and performance.</li>
        <li>To keep the website and our systems secure and to prevent misuse.</li>
        <li>To comply with legal, tax and accounting obligations.</li>
      </ul>
    ),
  },
  {
    id: "cookies",
    title: "Cookies and analytics",
    body: (
      <>
        <p>
          We use <strong>Google Analytics 4</strong> and <strong>Google Tag Manager</strong> to measure how visitors
          use the website, for example which pages are viewed and for how long. These tools set cookies and send usage
          data to Google. You can learn how Google uses this data at{" "}
          <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer">
            policies.google.com/technologies/partner-sites
          </a>{" "}
          and can opt out with the{" "}
          <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">
            Google Analytics opt-out browser add-on
          </a>
          .
        </p>
        <p>
          Some pages show embedded <strong>YouTube</strong> videos (loaded from youtube-nocookie.com only when you
          choose to play one) and a <strong>Google Maps</strong> map of our office. These services are provided by
          Google and may set their own cookies when they load.
        </p>
        <p>You can block or delete cookies in your browser settings. Most of the website will continue to work without them.</p>
      </>
    ),
  },
  {
    id: "sharing",
    title: "Who we share information with",
    body: (
      <>
        <p>We do not sell your personal data. We share it only where needed to run the website and our business:</p>
        <ul>
          <li>Website hosting and email providers that store and deliver the website and your messages.</li>
          <li>Google, for analytics, video and map embeds as described above.</li>
          <li>WhatsApp (Meta), if you choose to contact or book with us through WhatsApp.</li>
          <li>Professional advisers, or authorities where the law requires us to disclose information.</li>
        </ul>
        <p>Some of these providers may process data outside India.</p>
      </>
    ),
  },
  {
    id: "retention",
    title: "How long we keep information",
    body: (
      <p>
        We keep enquiry and client correspondence for as long as needed to respond, deliver our services and meet our
        legal and accounting obligations, and then delete or anonymise it. Analytics data is kept according to the
        retention settings of our Google Analytics account.
      </p>
    ),
  },
  {
    id: "security",
    title: "Security",
    body: (
      <p>
        The website is served over HTTPS and access to our systems is restricted to authorised staff. No method of
        transmission or storage is completely secure, so we cannot guarantee absolute security, but we take
        reasonable steps to protect your information.
      </p>
    ),
  },
  {
    id: "your-rights",
    title: "Your rights",
    body: (
      <>
        <p>
          Subject to applicable law, including India&apos;s Digital Personal Data Protection Act, 2023, you may ask us
          to access, correct or erase the personal data we hold about you, or withdraw consent you have given. To make
          a request, email <a href="mailto:admin@geniemedia.in">admin@geniemedia.in</a>. We may need to verify your
          identity before acting on it.
        </p>
      </>
    ),
  },
  {
    id: "children",
    title: "Children",
    body: <p>This website is intended for businesses and adults. We do not knowingly collect personal data from children.</p>,
  },
  {
    id: "third-party-links",
    title: "Links to other websites",
    body: (
      <p>
        Our website links to client projects, social media profiles and other sites we do not control. Their own
        privacy policies apply when you visit them.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes to this policy",
    body: <p>We may update this policy from time to time. The &quot;Last updated&quot; date at the top shows when it last changed.</p>,
  },
  {
    id: "contact",
    title: "Contact us",
    body: (
      <>
        <p>For any question about this policy or your personal data, contact us at:</p>
        <LegalContact />
      </>
    ),
  },
];

export default function PrivacyPolicyRoute() {
  return (
    <>
      <JsonLd data={metaForRoute("/privacy-policy").schema} />
      <LegalPage
        title="Privacy Policy"
        updated="4 October 2026"
        updatedIso="2026-10-04"
        intro={
          <p>
            This policy explains what personal information Genie Media &amp; Studio collects through this website, how
            we use it and the choices you have. See also our <a href="/terms-and-conditions" className={CONTENT_LINK}>Terms &amp; Conditions</a>.
          </p>
        }
        sections={SECTIONS}
      />
    </>
  );
}
