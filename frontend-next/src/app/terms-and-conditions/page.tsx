import type { Metadata } from "next";

import LegalPage, { LegalContact, type LegalSection } from "@/components/legal/LegalPage";
import JsonLd from "@/components/seo/JsonLd";
import { SITE_HOST, SITE_ORIGIN } from "@/lib/site";
import { buildRouteMetadata } from "@/lib/seo/metadata";
import { metaForRoute } from "@/lib/seo/routeMeta";
import { CONTENT_LINK } from "@/lib/linkStyles";

export const metadata: Metadata = buildRouteMetadata("/terms-and-conditions");

// General website terms. Commercial terms for a specific engagement (scope,
// pricing, payment schedule, cancellations) are deliberately left to the
// written quote or agreement for that job rather than invented here.
const SECTIONS: LegalSection[] = [
  {
    id: "acceptance",
    title: "Acceptance of these terms",
    body: (
      <p>
        These terms govern your use of <a href={SITE_ORIGIN}>{SITE_HOST}</a>, operated by Genie Media
        &amp; Studio, Visakhapatnam, India. By using the website you agree to them. If you do not agree, please do not
        use the website.
      </p>
    ),
  },
  {
    id: "services",
    title: "Our services",
    body: (
      <>
        <p>
          The website describes our digital marketing, website development, video production and podcast studio
          services. Descriptions, examples and prices shown are for general information and may change without notice.
        </p>
        <p>
          A service engagement begins only when we confirm it with you in writing (for example by email, a quote or an
          agreement). The scope, deliverables, timelines, fees, payment terms and any cancellation terms set out in that
          written confirmation apply to the engagement and take precedence over these website terms.
        </p>
      </>
    ),
  },
  {
    id: "bookings",
    title: "Studio bookings",
    body: (
      <p>
        Submitting the studio booking form sends a booking request to us through WhatsApp. It is not a confirmed
        booking. A slot is reserved only once we confirm availability and the booking details with you.
      </p>
    ),
  },
  {
    id: "results",
    title: "No guaranteed results",
    body: (
      <p>
        Marketing outcomes such as search rankings, traffic, leads and sales depend on many factors outside our control,
        including search engine and platform algorithms. Unless agreed otherwise in writing, we do not guarantee any
        specific result.
      </p>
    ),
  },
  {
    id: "intellectual-property",
    title: "Intellectual property",
    body: (
      <>
        <p>
          The content of this website, including text, graphics, logos, images, videos and design, belongs to Genie
          Media &amp; Studio or its licensors. You may view it and share links to it, but you may not copy, reproduce
          or republish it for commercial purposes without our written permission.
        </p>
        <p>
          Client websites and work shown in our portfolio remain the property of the respective clients and are shown
          as examples of our work.
        </p>
      </>
    ),
  },
  {
    id: "acceptable-use",
    title: "Acceptable use",
    body: (
      <>
        <p>When using the website you agree not to:</p>
        <ul>
          <li>break any law or infringe anyone&apos;s rights;</li>
          <li>submit false, misleading, abusive or spam messages through our forms;</li>
          <li>attempt to gain unauthorised access to the website, its admin area or related systems;</li>
          <li>interfere with the website&apos;s operation, for example with malicious code or excessive automated requests.</li>
        </ul>
      </>
    ),
  },
  {
    id: "accuracy",
    title: "Information on the website",
    body: (
      <p>
        We try to keep the website accurate and up to date, but its content, including blog articles, is provided for
        general information only and is not professional advice for your specific situation. We may change or remove
        content at any time.
      </p>
    ),
  },
  {
    id: "third-party",
    title: "Third-party links and services",
    body: (
      <p>
        The website links to and embeds third-party services such as YouTube, Google Maps, WhatsApp and social media
        platforms. We are not responsible for their content or practices, and their own terms apply.
      </p>
    ),
  },
  {
    id: "liability",
    title: "Limitation of liability",
    body: (
      <p>
        The website is provided on an &quot;as is&quot; and &quot;as available&quot; basis. To the extent permitted by
        law, Genie Media &amp; Studio is not liable for any indirect or consequential loss arising from your use of, or
        inability to use, the website. Nothing in these terms limits liability that cannot be limited under applicable
        law.
      </p>
    ),
  },
  {
    id: "privacy",
    title: "Privacy",
    body: (
      <p>
        How we handle personal information is explained in our <a href="/privacy-policy">Privacy Policy</a>.
      </p>
    ),
  },
  {
    id: "law",
    title: "Governing law",
    body: (
      <p>
        These terms are governed by the laws of India. Any dispute relating to them is subject to the jurisdiction of
        the courts at Visakhapatnam, Andhra Pradesh.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes to these terms",
    body: <p>We may update these terms from time to time. The &quot;Last updated&quot; date at the top shows when they last changed.</p>,
  },
  {
    id: "contact",
    title: "Contact us",
    body: (
      <>
        <p>Questions about these terms can be sent to:</p>
        <LegalContact />
      </>
    ),
  },
];

export default function TermsRoute() {
  return (
    <>
      <JsonLd data={metaForRoute("/terms-and-conditions").schema} />
      <LegalPage
        title="Terms & Conditions"
        updated="4 October 2026"
        updatedIso="2026-10-04"
        intro={
          <p>
            Please read these terms before using our website. They sit alongside our{" "}
            <a href="/privacy-policy" className={CONTENT_LINK}>Privacy Policy</a> and
            any written agreement for a specific project.
          </p>
        }
        sections={SECTIONS}
      />
    </>
  );
}
