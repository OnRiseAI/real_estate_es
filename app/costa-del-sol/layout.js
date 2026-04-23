export const metadata = {
  title: "AI Receptionist for Costa del Sol Estate Agents | 24/7 English-Speaking",
  description:
    "24/7 English-speaking AI voice receptionist for estate agents on the Costa del Sol. From Sotogrande to Nerja — Mia answers every call, qualifies international buyers, and books viewings into your CRM. Flat monthly pricing in euros.",
  alternates: {
    canonical: "https://realestate.voiceaireceptionists.com/costa-del-sol",
  },
  openGraph: {
    title: "AI Receptionist for Costa del Sol Estate Agents",
    description:
      "Built for the Costa del Sol. English-speaking 24/7, covers Sotogrande to Nerja, books viewings straight into your calendar. €99/mo.",
    url: "https://realestate.voiceaireceptionists.com/costa-del-sol",
    siteName: "Voice AI Receptionist",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AI Receptionist for Costa del Sol Estate Agents",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Receptionist for Costa del Sol Estate Agents",
    description:
      "Built for the Costa del Sol. English-speaking 24/7, books viewings into your CRM. €99/mo.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function CostaDelSolLayout({ children }) {
  return children;
}
