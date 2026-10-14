import type { ServiceSubPage } from "@/content/serviceSubPage";

interface LocalProfile {
  title: string;
  heading?: string;
  description: string;
  detail: string;
  next: string;
}

// Each specialist keeps its own search intent. Local coverage supports the service;
// it does not create separate, near-identical pages for every neighbourhood.
const PROFILES: Record<string, LocalProfile> = {
  "seo-services": {
    title: "SEO Services in Vizag & India | Genie Media",
    description: "SEO services in Vizag (Visakhapatnam) and India from Genie Media. Keyword research, technical fixes and useful content for business websites.",
    detail: "A shop serving Vizag needs different search pages from a supplier selling across India. We review the areas you serve, the terms buyers use and the pages you already have. Then we plan SEO around those searches and track relevant visits and enquiries.",
    next: "Bring your website address and the services you want customers to find. We can review content, technical SEO and local search together.",
  },
  "local-seo": {
    title: "Local SEO Services in Vizag | Genie Media & Studio",
    heading: "Local SEO Services",
    description: "Local SEO services in Visakhapatnam from Genie Media. Google Business Profile and website support for Yendada, Rushikonda, MVP Colony and Vizag.",
    detail: "For businesses serving nearby customers, local SEO starts with accurate details. We check your business name, address, phone, services and profile links. Your website should explain where you serve customers without suggesting offices you do not have.",
    next: "Share your website and Google Business Profile link, along with your real service areas. We will review local visibility and contact details.",
  },
  "technical-seo": {
    title: "Technical SEO in Vizag & India | Genie Media",
    description: "Technical SEO services in Vizag and India. Genie Media checks crawling, indexing, canonicals, site speed and structured data for your website.",
    detail: "A clear local service page still needs to be crawlable. We check status codes, canonical URLs, sitemap entries and mobile page speed. For stores and larger sites, we also review filters and duplicate URLs that can split search visibility.",
    next: "Share your domain, platform and any Search Console errors. We will scope the technical review before making site changes.",
  },
  "on-page-seo": {
    title: "On-Page SEO in Vizag & India | Genie Media",
    description: "On-page SEO in Vizag and India from Genie Media. Clear titles, headings, internal links and service content for searchers in Visakhapatnam.",
    detail: "On-page SEO helps each page explain one clear service. We match titles, headings and answers to the buyer's intent. Local pages can name the areas you serve, while national pages focus on the offer and how customers can work with you remotely.",
    next: "Tell us which service pages matter most and which enquiries you want. We can review page copy, headings and internal links.",
  },
  "ecommerce-seo": {
    title: "Ecommerce SEO Services in Vizag & India | Genie Media",
    heading: "Ecommerce SEO Services",
    description: "Ecommerce SEO in Vizag and India from Genie Media. Product pages, category content and technical SEO for Shopify and WooCommerce stores.",
    detail: "Online stores need useful product and category pages, not a list of city keywords. We review product details, navigation and indexable URLs. Delivery areas and buying questions belong in clear text so customers in Andhra Pradesh and across India can decide before checkout.",
    next: "Send your store URL, platform and key product categories. We will review product discovery, category pages and technical priorities.",
  },
  "seo-audit": {
    title: "SEO Audit in Vizag & India | Genie Media",
    description: "SEO audit services in Vizag and India. Genie Media reviews technical SEO, content and local visibility, then provides a prioritised action plan.",
    detail: "An SEO audit should tell you what to fix and why it matters. We review crawling, page content, links and local business details. Then we prioritise the issues that affect your important services rather than chasing a single tool's score.",
    next: "Share your website and your main business goals. Search Console access, if available, helps us compare technical findings with search performance.",
  },
  "aeo": {
    title: "Answer Engine Optimization in Vizag | Genie Media",
    description: "AEO services in Vizag and India from Genie Media. Answer engine optimization with clear FAQs, service facts and structured data that matches your pages.",
    detail: "Answer engine optimization (AEO) starts with clear answers to real customer questions. We make services, location, pricing scope and contact details easy to understand. FAQs and structured data must agree with the visible page; no markup can guarantee an AI answer or citation.",
    next: "Share your service pages and the questions customers ask before buying. We will review answers, page structure and verified business facts.",
  },
  "geo": {
    title: "Generative Engine Optimization in Vizag | Genie Media",
    description: "Generative engine optimization (GEO) in Vizag and India from Genie Media. Clear brand facts, useful content and technical SEO for AI search discovery.",
    detail: "Generative engine optimization (GEO) helps make your business information clear across the pages you publish. We check service descriptions, business identity and supporting sources. For Google AI search, useful indexed pages and sound SEO remain the foundation; inclusion is not guaranteed.",
    next: "Share your website and official business profiles. We will check whether your published facts, service pages and supporting content are consistent.",
  },
  "google-ads": {
    title: "Google Ads in Vizag & India | Genie Media",
    description: "Google Ads and PPC management in Vizag and India from Genie Media. Search campaigns, landing pages and conversion tracking for business enquiries.",
    detail: "A local ad campaign can focus on the areas where you sell or provide a service. A national campaign needs different targeting and landing pages. We agree the locations, budget and enquiry goals before launch, then review search terms and conversion costs.",
    next: "Tell us your offer, target areas and planned ad budget. We will discuss search campaigns, landing pages and tracking separately from management fees.",
  },
  "content-marketing": {
    title: "Content Marketing Services in Vizag | Genie Media",
    heading: "Content Marketing Services",
    description: "Content marketing services in Vizag and India. Genie Media plans website copy, blogs and social content around customer questions and business goals.",
    detail: "A useful content plan follows the questions people ask before they buy. We connect service pages, blog articles and social content around those questions. Local details help when relevant, while clear explanations let buyers across India understand the same offer.",
    next: "Share your services, audience and existing articles. We will identify useful topics and agree a content calendar and review process.",
  },
  "social-media-marketing": {
    title: "Social Media Marketing Services in Vizag | Genie Media",
    heading: "Social Media Marketing Services",
    description: "Social media marketing in Vizag and India. Genie Media plans Instagram and Facebook content, Reels, Meta Ads and reporting for your business.",
    detail: "Social media marketing for a nearby café differs from campaigns for a national online store. We agree the audience, content themes and offers first. Then posts, Reels and Meta Ads support the same message, with enquiries and campaign results reviewed alongside engagement.",
    next: "Share your social profiles, audience and goals. We will agree content frequency, creative scope and whether paid social campaigns are needed.",
  },
  "lead-generation": {
    title: "Lead Generation in Vizag & India | Genie Media",
    description: "Lead generation services in Vizag and India from Genie Media. Google Ads, Meta Ads, focused landing pages and tracking for qualified enquiries.",
    detail: "Lead generation starts with a clear offer and a way for people to respond. Local campaigns can target the areas your team serves. National campaigns need a clear remote sales process. We track lead quality as well as enquiry volume and cost.",
    next: "Tell us what makes an enquiry a good fit and how your team follows up. We will scope the campaign, capture pages and reporting.",
  },
  "conversion-optimization": {
    title: "Conversion Optimization in Vizag | Genie Media",
    description: "Conversion rate optimization in Vizag and India from Genie Media. Improve landing pages, forms and enquiry paths using tracking and user research.",
    detail: "Conversion rate optimization (CRO) helps visitors take the next step. We review where people leave, which forms create friction and whether the offer is clear. Tests depend on available traffic, so we agree a suitable method before comparing results.",
    next: "Share your website, traffic sources and the actions you want visitors to take. We will check tracking before suggesting changes.",
  },
  "website-development": {
    title: "Custom Website Development in Vizag | Genie Media",
    heading: "Custom Website Development",
    description: "Custom website development in Vizag and India. Genie Media plans page structures, forms, payments and integrations around your business requirements.",
    detail: "Custom website development starts with the work your site needs to do. We scope page structures, enquiry forms, payment flows and integrations before choosing a platform. Review the requirements, design and working site with our Visakhapatnam team before launch.",
    next: "Send your page requirements, preferred platform and any existing website. We will agree design, content, development and launch scope.",
  },
  "website-design": {
    title: "Website Designers in Vizag | Genie Media & Studio",
    heading: "Website Designers",
    description: "Website designers in Vizag for mobile-friendly business sites and online stores. Genie Media plans navigation, page layouts and UI/UX around your customers.",
    detail: "Website design helps people find information without effort. We plan navigation, mobile layouts and calls to action around your audience. For local businesses, hours and contact details should be easy to reach; for online brands, product discovery matters too.",
    next: "Share your brand assets, reference sites and the pages you need. We will discuss layouts and review the design before development starts.",
  },
  "business-websites": {
    title: "Business Website Development in Vizag | Genie Media",
    heading: "Business Website Development",
    description: "Business website development in Vizag and India from Genie Media. Service pages, enquiry forms and mobile-friendly company websites.",
    detail: "A business website should explain what you do, whom you serve and how to get in touch. We organise services, company details and enquiry forms into clear pages. The content can support local buyers in Vizag and customers across India without duplicate location pages.",
    next: "Share your services, company information and contact requirements. We will plan a sitemap and the content needed for each page.",
  },
  "ecommerce-websites": {
    title: "E-commerce Website Development in Vizag | Genie Media",
    heading: "E-commerce Website Development",
    description: "E-commerce website development in Vizag and India. Genie Media builds Shopify and WooCommerce stores with product pages and checkout flows.",
    detail: "An e-commerce website needs clear products, delivery information and a checkout that works on mobile. We review your catalogue, payment needs and order process. Then we build an online store that supports customers in the regions where you actually deliver.",
    next: "Send your product count, payment needs and shipping process. We will compare store platforms and scope catalogue setup and checkout.",
  },
  "seo-friendly-websites": {
    title: "SEO-Friendly Websites in Vizag | Genie Media",
    description: "SEO-friendly website development in Vizag and India from Genie Media. Crawlable pages, clear headings, fast loading and useful service content.",
    detail: "An SEO-friendly website needs readable pages and technical foundations that support search. We plan titles, headings, links and indexable URLs during the build. Clear service answers also help visitors compare your offer, while business details support local discovery.",
    next: "Share your key services and current domain. We will plan the site structure and SEO requirements alongside the design and development scope.",
  },
  wordpress: {
    title: "WordPress Development in Vizag | Genie Media",
    description: "WordPress website development in Vizag and India from Genie Media. Business sites, editable pages and SEO foundations for your team.",
    detail: "WordPress suits teams that want to publish service pages and articles themselves. We plan page templates, forms and editing tools around your workflow. Plugin choices and maintenance matter too, so they form part of the scope before launch.",
    next: "Share your content needs and any existing WordPress site. We will agree the theme, plugins, page templates and handover requirements.",
  },
  shopify: {
    title: "Shopify Development in Vizag & India | Genie Media",
    description: "Shopify development in Vizag and India from Genie Media. Online store design, product setup and mobile shopping experiences for growing brands.",
    detail: "Shopify development brings your products, brand and buying process into one store. We review collections, navigation and product information before building. The store should clearly explain delivery, returns and payment options for the customers you serve.",
    next: "Send your catalogue size, brand assets and fulfilment needs. We will scope the Shopify theme, store setup and required integrations.",
  },
  woocommerce: {
    title: "WooCommerce Development in Vizag | Genie Media",
    description: "WooCommerce development in Vizag and India from Genie Media. WordPress stores, product pages and checkout setup with clear maintenance scope.",
    detail: "WooCommerce lets you run an online store within WordPress. We plan the catalogue, checkout and payment setup around your order process. Hosting, plugins and ongoing updates need clear ownership so your store remains manageable after launch.",
    next: "Share your products, payment requirements and hosting details. We will agree the store build, integrations and maintenance scope.",
  },
  "react-development": {
    title: "React Development in Vizag & India | Genie Media",
    description: "React development in Vizag and India from Genie Media. Custom interfaces and web applications planned around your business requirements.",
    detail: "React development suits websites and applications with custom interactions. We define screens, user journeys and data needs before coding. Search-facing pages also need a rendering plan, so the choice of framework follows the product and SEO requirements.",
    next: "Share your feature list, user roles and API requirements. We will assess the application scope and agree the architecture and delivery stages.",
  },
  "nextjs-development": {
    title: "Next.js Development in Vizag & India | Genie Media",
    description: "Next.js development in Vizag and India from Genie Media. Fast business websites and custom applications with rendering and SEO planned together.",
    detail: "Next.js development can support fast service websites and custom applications. We choose static or server rendering to suit the content and features. Search-friendly HTML, metadata and deployment requirements are planned together rather than added only at the end.",
    next: "Tell us your content workflow, application features and hosting requirements. We will scope the Next.js build and deployment approach.",
  },
  "react-native": {
    title: "React Native Development in Vizag | Genie Media",
    description: "React Native app development in Vizag and India from Genie Media. Android and iOS applications with agreed features, testing and release scope.",
    detail: "React Native app development supports Android and iOS products with shared code. We define mobile screens, permissions and integrations around the users you serve. App releases and store requirements need their own plan alongside the website or backend.",
    next: "Share your app idea, required features and backend needs. We will scope design, development, device testing and release support.",
  },
  "website-redesign": {
    title: "Website Redesign Services in Vizag | Genie Media",
    heading: "Website Redesign Services",
    description: "Website redesign in Vizag and India from Genie Media. Refresh mobile layouts, service content and enquiry paths while planning SEO migration.",
    detail: "Website redesign should improve clarity while protecting useful existing pages. We review navigation, mobile layouts and enquiry paths first. If URLs change, we plan redirects and update internal links so customers and search engines can reach the replacement pages.",
    next: "Share your current site and the problems you want to fix. We will review content, design and any SEO migration needs before rebuilding.",
  },
  "website-maintenance": {
    title: "Website Maintenance Services in Vizag | Genie Media",
    heading: "Website Maintenance Services",
    description: "Website maintenance in Vizag and India from Genie Media. Updates, backups and support for business websites with an agreed service scope.",
    detail: "Website maintenance helps keep your pages, forms and platform working after launch. We agree which updates, backups and checks are included. Content changes can also keep services and contact details accurate as your business grows into new areas.",
    next: "Send your platform, hosting details and support requirements. We will review access and agree maintenance tasks and response expectations.",
  },
  "website-speed-optimization": {
    title: "Website Speed Optimization in Vizag | Genie Media",
    description: "Website speed optimization in Vizag and India from Genie Media. Review images, scripts and Core Web Vitals to improve mobile page performance.",
    detail: "Website speed optimization starts by measuring the pages people actually use. We review image sizes, scripts, fonts and hosting behaviour. Then we prioritise fixes that improve mobile loading while keeping forms, checkout and other important features working.",
    next: "Share your site URL and any slow pages. We will review performance data and scope fixes for your platform and hosting setup.",
  },
  rental: {
    title: "Podcast Studio Rental in Vizag | Genie Media",
    description: "Podcast studio rental in Yendada, Visakhapatnam. Book Genie Media's Vizag studio with microphones and sets, or add a camera and crew package.",
    detail: "Podcast studio rental gives you a prepared recording space without buying a full setup. Creators from Rushikonda, MVP Colony and wider Vizag can record at our Yendada studio. Choose studio-only hire or discuss a team package before booking.",
    next: "Tell us your preferred date, session length and whether you need a crew. We will confirm the package and availability before booking.",
  },
  "video-podcast": {
    title: "Video Podcast Studio in Vizag | Genie Media",
    description: "Video podcast recording in Yendada, Visakhapatnam. Genie Media offers two- and three-camera studio packages for interviews and business podcasts.",
    detail: "Video podcast recording needs clear audio, lighting and camera framing. Our team packages support interviews and branded conversations at the Yendada studio. Discuss editing and short clips in advance so the recording plan suits the formats you want to publish.",
    next: "Share the guest count, recording length and formats you need. We will confirm the camera package and quote editing separately where required.",
  },
  production: {
    title: "Podcast Production in Vizag & India | Genie Media",
    description: "Podcast production in Vizag and India from Genie Media. Episode planning, editing and publishing support, with recording at our Yendada studio.",
    detail: "Podcast production brings planning, recording and post-production into one workflow. Record at our Visakhapatnam studio or share existing footage for remote production support. We agree episode structure, review stages and delivery formats so your team knows what to prepare.",
    next: "Share your show idea, episode length and recording plan. We will scope planning, production, editing and publishing support for your needs.",
  },
  editing: {
    title: "Podcast Editing in Vizag & India | Genie Media",
    description: "Podcast editing in Vizag and India from Genie Media. Audio cleanup, video edits and episode delivery for creators working locally or remotely.",
    detail: "Podcast editing turns a recording into an episode people can follow. We can work with audio and video files from creators across India. First, we check the source quality. Then we agree cleanup, cuts, captions and output formats within the editing scope.",
    next: "Send a sample, the recording length and your required outputs. We will quote the edit and agree a review process before work starts.",
  },
  pricing: {
    title: "Podcast Studio Pricing in Vizag | Genie Media",
    description: "Compare Genie Media podcast studio prices in Yendada, Vizag. Studio-only hire and team packages with two or three cameras, with editing quoted separately.",
    detail: "Podcast studio pricing depends on your chosen package and session length. Use the published package table to compare studio-only hire with team-supported recording. Ask about editing and other add-ons before booking so the total scope is clear.",
    next: "Tell us your date, duration and preferred package. We will confirm availability and any separately priced editing or add-ons.",
  },
  booking: {
    title: "Book a Podcast Studio in Vizag | Genie Media",
    description: "Book Genie Media's podcast studio in Yendada, Visakhapatnam. Check session availability and choose studio-only or camera and crew recording packages.",
    detail: "Booking a podcast studio starts with your preferred date, duration and recording needs. The studio is in Yendada, serving creators from Rushikonda, MVP Colony and across Vizag. Confirm the slot and package with our team before arranging your guests' travel.",
    next: "Use the booking form or WhatsApp to share your preferred session. Our team will confirm the slot and package details.",
  },
  "content-repurposing": {
    title: "Podcast Content Repurposing in Vizag | Genie Media",
    description: "Podcast content repurposing in Vizag and India from Genie Media. Turn episodes into Reels, Shorts, captions and useful content for your channels.",
    detail: "Podcast content repurposing helps one recording support several channels. We select useful moments for Reels and Shorts, then adapt captions or written content to the audience. Creators across India can share footage remotely without travelling to the studio.",
    next: "Share your episode, target channels and the number of clips or articles you need. We will agree formats, captions and review stages.",
  },
};

export function localiseServicePages(pages: ServiceSubPage[]): ServiceSubPage[] {
  return pages.map((page) => {
    const profile = PROFILES[page.slug];
    if (!profile) throw new Error(`Missing local service content for ${page.slug}`);
    const atStudio = page.plan.schema.includes("LocalBusiness");
    const coverage = atStudio
      ? "Recording takes place at Genie Media & Studio in KP Icon, Yendada, Visakhapatnam (Vizag), Andhra Pradesh. We welcome creators from Rushikonda, MVP Colony, Madhurawada and across the city. Customers travelling from elsewhere in India should confirm a session before visiting."
      : "Genie Media & Studio works from Yendada, Visakhapatnam (Vizag), Andhra Pradesh. We support businesses in Rushikonda, MVP Colony and Madhurawada, and work remotely with clients across Andhra Pradesh and India. We agree your requirements, share updates and review the work together.";
    return {
      ...page,
      title: profile.title,
      description: profile.description,
      directorySummary: profile.detail.split(/(?<=\.)\s+/)[0],
      h1: `${profile.heading || page.name} in ${atStudio ? "Yendada, Visakhapatnam" : "Vizag and India"}`,
      sections: [...(page.sections ?? []), {
        heading: `${page.name} for Customers in Visakhapatnam`,
        paragraphs: [profile.detail, coverage],
      }],
      faqs: [...page.faqs, {
        q: `How can I arrange ${page.name.toLowerCase()} in Yendada, Rushikonda or MVP Colony?`,
        a: `${coverage} ${profile.next}`,
      }],
    };
  });
}
