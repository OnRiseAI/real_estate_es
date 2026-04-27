import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import SharedLayout from "./components/SharedLayout";

export const metadata = {
  title: "AI Receptionist for Costa del Sol Real Estate Agents | 24/7 English-Speaking",
  description:
    "24/7 English-speaking AI voice receptionist for real estate agents on the Costa del Sol. From Sotogrande to Nerja — Mia answers every call, qualifies international buyers, and books viewings into your CRM. Flat monthly pricing in euros.",
  metadataBase: new URL("https://realestate.voiceaireceptionists.com"),
  alternates: {
    canonical: "https://realestate.voiceaireceptionists.com/",
  },
  openGraph: {
    title: "AI Receptionist for Costa del Sol Real Estate Agents",
    description:
      "Built for the Costa del Sol. English-speaking 24/7, covers Sotogrande to Nerja, books viewings straight into your calendar. €99/mo.",
    url: "https://realestate.voiceaireceptionists.com/",
    siteName: "Voice AI Receptionist",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AI Receptionist for Costa del Sol Real Estate Agents",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Receptionist for Costa del Sol Real Estate Agents",
    description:
      "Built for the Costa del Sol. English-speaking 24/7, books viewings into your CRM. €99/mo.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&family=Fraunces:ital,opsz,wght@0,9..144,300..900;1,9..144,300..900&display=swap"
            rel="stylesheet"
          />
          <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        </head>
        <body className="antialiased">
          <SharedLayout>{children}</SharedLayout>
        </body>
      </html>
    </ClerkProvider>
  );
}
