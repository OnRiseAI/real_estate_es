import "./globals.css";
import SharedLayout from "./components/SharedLayout";

export const metadata = {
  title: "Voice AI Receptionist for Realtors — Never miss a Zillow lead again",
  description:
    "AI receptionist built for real estate. Answers every Zillow, Realtor.com, and missed call 24/7. Books showings into Follow Up Boss, kvCORE, Sierra, BoomTown. Flat monthly pricing. 30-day money-back.",
  metadataBase: new URL("https://realestate.voiceaireceptionists.com"),
  openGraph: {
    title: "Voice AI Receptionist for Realtors",
    description:
      "Built for real estate. Answers every call, qualifies the lead, books the showing. Native FUB, kvCORE, Sierra, BoomTown.",
    url: "https://realestate.voiceaireceptionists.com",
    siteName: "Voice AI Receptionist",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Voice AI Receptionist for Realtors",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Voice AI Receptionist for Realtors",
    description:
      "Built for real estate. Answers every call, qualifies the lead, books the showing.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className="antialiased">
        <SharedLayout>{children}</SharedLayout>
      </body>
    </html>
  );
}
