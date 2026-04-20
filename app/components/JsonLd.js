"use client";

export default function JsonLd({ data }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://realestate.voiceaireceptionists.com";

export const ORGANIZATION = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Voice AI Receptionist for Realtors",
  url: BASE,
  logo: `${BASE}/favicon.svg`,
  sameAs: [],
  contactPoint: {
    "@type": "ContactPoint",
    email: "hello@voiceaireceptionists.com",
    contactType: "customer support",
    areaServed: "US",
    availableLanguage: "English",
  },
};

export const PRODUCT_OFFERS = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "Voice AI Receptionist for Realtors (Mia)",
  description:
    "AI receptionist built for US real estate agents. Answers every call 24/7, qualifies the lead, books showings into Follow Up Boss, kvCORE, Sierra Interactive, and BoomTown. Flat monthly pricing.",
  brand: { "@type": "Brand", name: "Voice AI Receptionist" },
  offers: [
    {
      "@type": "Offer",
      name: "Solo",
      price: "99",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: `${BASE}/pricing`,
    },
    {
      "@type": "Offer",
      name: "Team",
      price: "299",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: `${BASE}/pricing`,
    },
    {
      "@type": "Offer",
      name: "Brokerage",
      price: "899",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: `${BASE}/pricing`,
    },
  ],
};

export const PRICING_FAQ = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What happens if we exceed the included calls?",
      acceptedAnswer: { "@type": "Answer", text: "You only pay the per-call overage listed in your tier. No surprise per-minute charges. Most agents never hit the cap — we sized it that way." },
    },
    {
      "@type": "Question",
      name: "How does the money-back guarantee work?",
      acceptedAnswer: { "@type": "Answer", text: "If we don't book at least 5 qualified showings in your first 30 days, we refund the full month. No forms, no hoops — just email us." },
    },
    {
      "@type": "Question",
      name: "Do you really integrate natively with Follow Up Boss / kvCORE?",
      acceptedAnswer: { "@type": "Answer", text: "Yes — bidirectional sync, not a Zapier middleman. Leads land in your existing pipeline; showings book into your existing calendar." },
    },
    {
      "@type": "Question",
      name: "What if Mia can't answer a question?",
      acceptedAnswer: { "@type": "Answer", text: "She transfers warmly to you (or to your fallback number) and texts you the caller's context so you're not starting cold." },
    },
    {
      "@type": "Question",
      name: "Can I listen back to calls?",
      acceptedAnswer: { "@type": "Answer", text: "Every call is recorded and transcribed. Search by caller name, address, or topic. Owner of the lead gets a digest by email every morning." },
    },
    {
      "@type": "Question",
      name: "Will it sound like AI?",
      acceptedAnswer: { "@type": "Answer", text: "Run the live demo and decide. We use Cartesia Sonic-3 for voice — most callers don't realize until they're told." },
    },
  ],
};
