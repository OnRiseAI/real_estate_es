"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import JsonLd from "../components/JsonLd";
import PhoneCallDemo from "../components/PhoneCallDemo";

const PALETTE = {
  cream: "#F5EFE4",
  creamSoft: "#EFE7D6",
  ink: "#1B1E28",
  inkSoft: "#2A2F3D",
  muted: "#6B6258",
  rule: "#CFC6B5",
  terracotta: "#C85A3C",
  terracottaDeep: "#A6472E",
  sea: "#1B4965",
};

const SERIF = "font-['Fraunces',_serif]";

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

const TOWNS = [
  "Sotogrande", "Manilva", "Estepona", "Benahavís", "Marbella",
  "Mijas", "Fuengirola", "Benalmádena", "Torremolinos", "Málaga", "Nerja",
];

const WEDGE = [
  {
    label: "The timezone problem",
    title: "Buyers call from London, Stockholm, Dubai.",
    body: "Your office closes at 19:00. Your buyers are one to four hours ahead and dial after dinner. Mia answers in English, 24 hours a day — so the lead doesn't land with the agency down the road before you're back in tomorrow.",
  },
  {
    label: "The language problem",
    title: "More of your international buyers stay on the line.",
    body: "Mia meets the German investor, the Saudi family, the Swedish couple and the Tokyo-based client each in their own language — fifteen in total, from Spanish and German to Arabic, Chinese and Japanese. The lead lands on your phone in clean English, so your follow-up's fast even when the call wasn't.",
  },
  {
    label: "The follow-up problem",
    title: "Proper message, delivered fast.",
    body: "Every call you'd have missed becomes a structured message in your inbox or on your phone within seconds — caller name, what they asked about, when to call back. No more 'she rang earlier' sticky notes.",
  },
];

const WORKFLOWS = [
  {
    label: "After-hours",
    title: "Your office closed at seven. Mia didn't.",
    body: "Buyers dial from London at 10pm, Stockholm at midnight, Dubai at 2am. Mia answers every one of those calls, qualifies cleanly, and sends you the message before you're back in tomorrow.",
    time: "22:00",
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    ),
  },
  {
    label: "Overflow",
    title: "Two lines ringing. You're on line one.",
    body: "Saturday morning, three enquiries hit at once. You take one, Mia picks up the rest. Business name, full intake, delivered to your phone — so nobody drops to voicemail after a four-ring wait.",
    time: "Sat 11:30",
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        <path d="M15.05 5A5 5 0 0 1 19 8.95M15.05 1A9 9 0 0 1 23 8.94" />
      </svg>
    ),
  },
  {
    label: "On the road",
    title: "Mid-showing. Hands full.",
    body: "You're walking a buyer through a villa in Benahavís and the office line rings. Mia takes it properly, then pings you the enquiry the moment you're back in the car.",
    time: "14:15",
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2" />
        <circle cx="6.5" cy="16.5" r="2.5" />
        <circle cx="16.5" cy="16.5" r="2.5" />
      </svg>
    ),
  },
];

const CONCERNS = [
  {
    q: "My partner is 63 and hates technology.",
    a: "You don't have to explain anything. Mia answers the phone in your business's name. Messages land as plain SMS or email — the caller's name, what they asked about, when to ring back. Your partner sees a text. That's the whole experience.",
  },
  {
    q: "How long is this going to take to set up?",
    a: "About ten minutes. You forward your office line to the number we give you, tell us your business name, and pick how you'd like the messages — SMS, email, or both. Mia goes live on the next incoming call. No app to install. No dashboard to learn. No training session.",
  },
  {
    q: "What if a buyer calls in Arabic, Chinese, or Japanese?",
    a: "Mia answers in the caller's own language. She handles fifteen out of the box — English, Spanish, German, French, Italian, Portuguese, Dutch, Swedish, Norwegian, Danish, Polish, Russian, Arabic, Japanese and Chinese — detecting which within the first few words and responding fluently. The structured message you receive is always in English, so your follow-up stays simple even when the call wasn't.",
  },
  {
    q: "What if she misses the nuance on a five-million-euro enquiry?",
    a: "She takes the enquiry, the caller's name, and a callback slot — cleanly. She doesn't negotiate price, argue the property, or commit you to a viewing. High-end buyers get the same graceful intake as any caller. Then the conversation is yours to win.",
  },
  {
    q: "What if I want to stop using it?",
    a: "Month-to-month, cancel any time in a single line of email. You stop being charged from the next billing cycle. Your forwarded number snaps back to voicemail. No hostage forms, no exit interviews, no ninety-day notice clause buried in the contract.",
  },
];

const TESTIMONIALS = [
  {
    quote: "We stopped losing Zillow leads at 9pm. Mia books the showing before they call the next agent.",
    name: "Marissa Chen",
    role: "Lead Agent",
    firm: "Coastal Compass",
    city: "San Diego, CA",
    initials: "MC",
    image: "/testimonial-marissa.png",
  },
  {
    quote: "My ISA cost $4,200 a month and quit every year. Mia costs a fraction of that and never calls in sick.",
    name: "Derek Hoffman",
    role: "Broker / Owner",
    firm: "Meridian Real Estate",
    city: "Austin, TX",
    initials: "DH",
    image: "/testimonial-derek.png",
  },
  {
    quote: "Showings up 23% month-over-month after we hooked Mia into Follow Up Boss.",
    name: "Priya Ramachandran",
    role: "Team Lead",
    firm: "Harbor & Hill Realty",
    city: "Boston, MA",
    initials: "PR",
    image: "/testimonial-priya.png",
  },
];

const ALTERNATIVES = [
  {
    label: "Voicemail",
    title: "Silence that costs you listings.",
    body: "The caller leaves a message you'll check in the morning — if they bother. Half don't. The other half leave a name and a number, no budget, no property, no context. By then they've tried three other agencies.",
    cost: "€0 /mo",
    costNote: "but every miss is a lost enquiry",
  },
  {
    label: "Virtual PA (9–5)",
    title: "Wrong hours, wrong specialty.",
    body: "Services like Moneypenny cost €350–900 a month and close at 5pm Monday to Friday. They don't know real estate. Your international buyers calling after dinner still land in voicemail. You're paying a premium for hours your office is already open.",
    cost: "€350–900 /mo",
    costNote: "business hours only",
  },
  {
    label: "Forwarding to your mobile",
    title: "You, distracted.",
    body: "Every call rings you — mid-showing, mid-dinner, mid-sleep. You answer frazzled or you don't answer. Either way the buyer forms a first impression of your agency from the way you handled their call from a car park.",
    cost: "€0 /mo",
    costNote: "but your attention isn't",
  },
];

const TIERS = [
  {
    name: "Solo",
    monthly: 199,
    yearly: 2189,
    best: "1 agent",
    calls: "150 minutes/mo",
    overage: "€0.50 per minute over",
    features: [
      "24/7 answering in 15 languages",
      "Greets in your business name",
      "SMS + email message delivery",
      "Month-to-month, cancel anytime",
    ],
    cta: "Start Solo",
    featured: false,
  },
  {
    name: "Team",
    monthly: 299,
    yearly: 3289,
    best: "2–10 agents",
    calls: "450 minutes/mo",
    overage: "€0.40 per minute over",
    features: [
      "Everything in Solo",
      "Multi-line coverage, no busy signal",
      "Shared team inbox",
      "Priority email support",
    ],
    cta: "Start Team",
    featured: true,
  },
  {
    name: "Office",
    monthly: 899,
    yearly: 9889,
    best: "Up to 50 agents",
    calls: "1,500 minutes/mo",
    overage: "€0.30 per minute over",
    features: [
      "Everything in Team",
      "Office line included",
      "Hands-on onboarding in 48h",
      "Dedicated account manager",
    ],
    cta: "Talk to us",
    featured: false,
  },
];

const DASHBOARD_STATS = [
  { label: "Calls handled", value: "847", trend: "+18% MoM" },
  { label: "Answered", value: "92%", trend: "after-hours 100%" },
  { label: "Avg length", value: "2:14", trend: "min per call" },
  { label: "Languages", value: "11", trend: "of 15 supported" },
];

const DASHBOARD_LANGS = [
  { code: "EN", pct: 41 },
  { code: "ES", pct: 22 },
  { code: "DE", pct: 14 },
  { code: "NL", pct: 9 },
  { code: "Other", pct: 14 },
];

const DASHBOARD_CALLS = [
  { name: "Sofia Reid", prop: "3-bed villa, Mijas", lang: "EN", time: "21:47", status: "new" },
  { name: "Lars Holm", prop: "Seafront, Estepona", lang: "NO", time: "18:30", status: "pending" },
  { name: "Mohammed K.", prop: "Penthouse, Marbella", lang: "AR", time: "11:05", status: "new" },
  { name: "Yuki Tanaka", prop: "Sotogrande", lang: "JA", time: "09:12", status: "done" },
  { name: "Pieter v.d. B.", prop: "Benalmádena", lang: "NL", time: "Yesterday", status: "done" },
];

const DASHBOARD_CHART = [12, 18, 15, 22, 28, 19, 24, 31, 27, 25, 34, 29, 33, 38, 42, 35, 32, 40, 45, 38, 41, 47, 39, 44, 52, 48, 46, 51, 55, 49];

const INTEGRATIONS = [
  { name: "HubSpot", category: "CRM", logo: "/logos/hubspot.svg" },
  { name: "Salesforce", category: "CRM", logo: "/logos/salesforce.svg" },
  { name: "Go High Level", category: "CRM", logo: "/logos/gohighlevel.svg" },
  { name: "Follow Up Boss", category: "CRM", logo: "/logos/followupboss.svg" },
  { name: "Pipedrive", category: "CRM", logo: "/logos/pipedrive.svg" },
  { name: "Zoho CRM", category: "CRM", logo: "/logos/zoho.svg" },
  { name: "Google Calendar", category: "Calendar", logo: "/logos/google-calendar.svg" },
  { name: "Outlook", category: "Calendar", logo: "/logos/microsoft-outlook.svg" },
  { name: "Cal.com", category: "Calendar", logo: "/logos/cal-com.svg" },
  { name: "Zapier", category: "Automation", logo: "/logos/zapier-icon.svg" },
  { name: "Make", category: "Automation", logo: "/logos/make.svg" },
  { name: "WhatsApp", category: "Messaging", logo: "/logos/whatsapp-icon.svg" },
];

const PLAN_INCLUDED = [
  {
    label: "24/7 coverage",
    desc: "Every hour, every day of the year.",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    label: "15 languages",
    desc: "From English to 日本語 and back.",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
  {
    label: "Your business name",
    desc: "Mia greets as your firm, not ours.",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="9" y="2" width="6" height="11" rx="3" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
      </svg>
    ),
  },
  {
    label: "SMS & email delivery",
    desc: "Wherever you read your messages.",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <polyline points="22 6 12 13 2 6" />
      </svg>
    ),
  },
  {
    label: "30-day money-back",
    desc: "One email. Full refund. No dance.",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <polyline points="9 12 11 14 15 10" />
      </svg>
    ),
  },
  {
    label: "Cancel anytime",
    desc: "No contract, no lock-in, no retention call.",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
    ),
  },
];

const FAQ_ITEMS = [
  { q: "Which towns on the Costa del Sol do you cover?", a: "All of it — Sotogrande to Nerja. Mia handles enquiries about Marbella, Estepona, Fuengirola, Benalmádena, Mijas, Málaga, Benahavís, Manilva, Torremolinos, and anywhere in between." },
  { q: "Does Mia handle calls from UK buyers in a different time zone?", a: "Yes — that's the main reason agents here buy us. Mia answers 24/7 in English, so a buyer calling from London at 22:00 GMT gets a human-sounding answer and a proper message rather than voicemail." },
  { q: "Does she know about specific properties I have listed?", a: "Not out of the box — Mia is an answering service, not a property search tool. She greets in your business's name, takes the enquiry, qualifies the caller, and gets you the message. You follow up with the right listing." },
  { q: "Will Mia sound like a robot on an expensive enquiry?", a: "Run the live demo and decide. Warm, clear English, natural pacing — most callers don't realise they're speaking with an AI until they're told." },
  { q: "How do I receive the messages?", a: "Email, SMS, or both — whichever works for you. You get the caller's name, what they were asking about, and a suggested call-back time." },
  { q: "How does the money-back guarantee work?", a: "30-day money-back, no forms. If it isn't saving you time in the first month, email us and we refund the month." },
];

const SERVICE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "AI Receptionist for Costa del Sol Real Estate Agents",
  description: "24/7 English-speaking AI voice answering service for real estate agents on the Costa del Sol. Greets in your business's name, qualifies the caller, and delivers a proper message to you by email or SMS.",
  serviceType: "AI voice answering service for real estate",
  provider: { "@type": "Organization", name: "Voice AI Receptionist", url: "https://realestate.voiceaireceptionists.com" },
  areaServed: { "@type": "Place", name: "Costa del Sol, Spain" },
  availableLanguage: "English",
  offers: [
    { "@type": "Offer", name: "Solo", price: "199", priceCurrency: "EUR" },
    { "@type": "Offer", name: "Team", price: "299", priceCurrency: "EUR" },
    { "@type": "Offer", name: "Office", price: "899", priceCurrency: "EUR" },
  ],
};

const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
};

// Film-grain noise overlay — tiny inline SVG, no network request.
const GRAIN_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.35 0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`
)}`;

function SectionLabel({ children, color = PALETTE.sea }) {
  return (
    <div
      className="text-[11px] font-bold tracking-[0.22em] uppercase"
      style={{ color }}
    >
      {children}
    </div>
  );
}

function Rule() {
  return <div className="h-px w-full" style={{ background: PALETTE.rule }} />;
}

const LANGUAGES = [
  { name: "English", native: "English", code: "en", country: "gb" },
  { name: "Spanish", native: "Español", code: "es", country: "es" },
  { name: "German", native: "Deutsch", code: "de", country: "de" },
  { name: "French", native: "Français", code: "fr", country: "fr" },
  { name: "Italian", native: "Italiano", code: "it", country: "it" },
  { name: "Portuguese", native: "Português", code: "pt", country: "pt" },
  { name: "Dutch", native: "Nederlands", code: "nl", country: "nl" },
  { name: "Swedish", native: "Svenska", code: "sv", country: "se" },
  { name: "Norwegian", native: "Norsk", code: "no", country: "no" },
  { name: "Danish", native: "Dansk", code: "da", country: "dk" },
  { name: "Polish", native: "Polski", code: "pl", country: "pl" },
  { name: "Russian", native: "Русский", code: "ru", country: "ru" },
  { name: "Arabic", native: "العربية", code: "ar", country: "sa" },
  { name: "Chinese", native: "中文", code: "zh", country: "cn" },
  { name: "Japanese", native: "日本語", code: "ja", country: "jp" },
];

export default function CostaDelSolPage() {
  const audioRef = useRef(null);
  const [playingCode, setPlayingCode] = useState(null);
  const [billingYearly, setBillingYearly] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const trimmedBusiness = businessName.trim();
  const displayBusiness = trimmedBusiness || "Coastline Estates";

  // Auto-typing placeholder — cycles examples so visitors see they can type their own.
  const [animatedPlaceholder, setAnimatedPlaceholder] = useState("");
  useEffect(() => {
    if (trimmedBusiness) return; // user is typing — leave them alone
    const examples = [
      "Costa Estates",
      "Sol & Mar Properties",
      "Marbella Homes",
      "Andalucía Living",
      "Sotogrande Realty",
    ];
    let cancelled = false;
    let exampleIdx = 0;
    let charIdx = 0;
    let mode = "typing"; // typing | holding | deleting
    let timer;

    const tick = () => {
      if (cancelled) return;
      const target = examples[exampleIdx];
      if (mode === "typing") {
        charIdx += 1;
        setAnimatedPlaceholder(target.slice(0, charIdx));
        if (charIdx >= target.length) {
          mode = "holding";
          timer = setTimeout(tick, 1600);
        } else {
          timer = setTimeout(tick, 55 + Math.random() * 50);
        }
      } else if (mode === "holding") {
        mode = "deleting";
        timer = setTimeout(tick, 0);
      } else {
        charIdx -= 1;
        setAnimatedPlaceholder(target.slice(0, Math.max(charIdx, 0)));
        if (charIdx <= 0) {
          mode = "typing";
          exampleIdx = (exampleIdx + 1) % examples.length;
          timer = setTimeout(tick, 350);
        } else {
          timer = setTimeout(tick, 25 + Math.random() * 20);
        }
      }
    };
    timer = setTimeout(tick, 400);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [trimmedBusiness]);

  const playLanguageSample = (code) => {
    // Stop whatever's currently playing
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    // Toggle off if same button clicked
    if (playingCode === code) {
      setPlayingCode(null);
      return;
    }
    const audio = new Audio(`/audio/sample-${code}.mp3`);
    audio.addEventListener("ended", () => {
      setPlayingCode((cur) => (cur === code ? null : cur));
      audioRef.current = null;
    });
    audio.addEventListener("error", () => {
      setPlayingCode(null);
      audioRef.current = null;
    });
    audio.play().catch(() => { setPlayingCode(null); });
    audioRef.current = audio;
    setPlayingCode(code);
  };

  return (
    <>
      <JsonLd data={SERVICE_SCHEMA} />
      <JsonLd data={FAQ_SCHEMA} />

      {/* Full-bleed cream canvas — SharedLayout renders the editorial shell for this route */}
      <div
        className="relative"
        style={{ background: PALETTE.cream, color: PALETTE.ink }}
      >
        {/* Film grain */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.35] mix-blend-multiply"
          style={{ backgroundImage: `url("${GRAIN_SVG}")` }}
        />
        {/* Warm edge glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[520px]"
          style={{
            background:
              "radial-gradient(ellipse 60% 70% at 85% 0%, rgba(200,90,60,0.10) 0%, transparent 70%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[320px]"
          style={{
            background:
              "radial-gradient(ellipse 60% 70% at 15% 100%, rgba(27,73,101,0.12) 0%, transparent 70%)",
          }}
        />

        <div className="relative max-w-[1200px] mx-auto px-6 md:px-10 py-20 md:py-28">
          {/* ─── HERO ─── */}
          <motion.section
            className="mb-28 md:mb-36 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] gap-12 lg:gap-16 items-center"
            initial="hidden"
            animate="show"
            variants={staggerContainer}
          >
            <div>
              <motion.div variants={fadeUp} className="mb-8">
                <SectionLabel color={PALETTE.terracotta}>
                  Costa del Sol · For real estate agents
                </SectionLabel>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                className={`${SERIF} text-[clamp(3rem,6.5vw,5.6rem)] leading-[0.98] tracking-[-0.025em]`}
                style={{ color: PALETTE.ink, fontWeight: 500 }}
              >
                Missed calls,{" "}
                <span style={{ fontStyle: "italic", color: PALETTE.sea }}>
                  booked viewings.
                </span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="mt-8 text-[20px] md:text-[22px] leading-[1.35] font-semibold max-w-xl"
                style={{ color: PALETTE.ink, letterSpacing: "-0.005em" }}
              >
                Your office shuts at 7. Your buyers call till midnight.
                <span className="block mt-1.5">Mia answers.</span>
              </motion.p>

              {/* Brokerage name input — Mia greets as if she works there */}
              <motion.div variants={fadeUp} className="mt-10 max-w-md">
                <label className="block">
                  <div
                    className="text-[10px] font-bold tracking-[0.22em] uppercase mb-2"
                    style={{ color: PALETTE.sea }}
                  >
                    Enter your business name &amp; speak with Mia
                  </div>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder={animatedPlaceholder || " "}
                    maxLength={120}
                    className={`${SERIF} w-full bg-transparent border-0 border-b-[1.5px] text-[20px] md:text-[22px] leading-[1.3] tracking-[-0.005em] py-2 focus:outline-none transition-colors placeholder:text-[#1B1E28] placeholder:opacity-100`}
                    style={{
                      color: PALETTE.ink,
                      borderColor: trimmedBusiness ? PALETTE.terracotta : PALETTE.rule,
                      fontWeight: 400,
                    }}
                  />
                </label>
                <div className="mt-2 h-4">
                  {trimmedBusiness ? (
                    <div
                      className="text-[10px] font-semibold tracking-[0.08em] uppercase"
                      style={{ color: PALETTE.terracotta }}
                    >
                      Mia answers as &ldquo;{trimmedBusiness}&rdquo;
                    </div>
                  ) : (
                    <div
                      className="text-[11px]"
                      style={{ color: PALETTE.muted, fontStyle: "italic" }}
                    >
                      Leave blank for Coastline Estates
                    </div>
                  )}
                </div>
              </motion.div>

              <motion.div variants={fadeUp} className="mt-6 flex flex-wrap items-center gap-4">
                <Link
                  href="#pricing"
                  className="inline-flex items-center gap-2 text-[14px] font-semibold underline underline-offset-[6px] decoration-1"
                  style={{ color: PALETTE.sea }}
                >
                  See pricing →
                </Link>
              </motion.div>

            </div>

            <motion.div
              id="try-mia"
              variants={fadeUp}
              className="w-full lg:justify-self-end scroll-mt-24"
            >
              <PhoneCallDemo businessName={displayBusiness} agentName="Mia" />
            </motion.div>
          </motion.section>

          {/* ─── BENEFIT STRIP — four outcome pills, sub-hero ─── */}
          <motion.section
            className="mb-28 md:mb-36"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
          >
            <motion.div
              variants={fadeUp}
              className="flex flex-wrap items-center justify-center gap-3 md:gap-4"
            >
              {[
                "24/7 cover",
                "15 languages",
                "Viewings by morning",
                "Flat monthly pricing",
              ].map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-2.5 px-5 py-3 rounded-full text-[14px] font-semibold"
                  style={{
                    background: PALETTE.creamSoft,
                    color: PALETTE.ink,
                    border: `1px solid ${PALETTE.rule}`,
                    letterSpacing: "0.005em",
                  }}
                >
                  <span
                    aria-hidden
                    className="inline-block w-1.5 h-1.5 rounded-full"
                    style={{ background: PALETTE.terracotta }}
                  />
                  {item}
                </span>
              ))}
            </motion.div>
          </motion.section>

          {/* ─── LANGUAGES GRID — fifteen tongues, tap to hear ─── */}
          <motion.section
            className="mb-28 md:mb-36"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeUp} className="mb-10">
              <SectionLabel>Languages · Fifteen tongues</SectionLabel>
              <h2
                className={`${SERIF} mt-4 text-[clamp(2rem,4.2vw,3.4rem)] leading-[1.05] tracking-[-0.015em]`}
                style={{ color: PALETTE.ink, fontWeight: 500 }}
              >
                <span className="block">Fifteen languages. One less reason to hang up.</span>
                <span
                  className="block mt-1"
                  style={{ fontStyle: "italic", color: PALETTE.muted }}
                >
                  Tap any to hear her.
                </span>
              </h2>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="grid grid-cols-3 md:grid-cols-5 gap-2.5 md:gap-3"
            >
              {LANGUAGES.map((lang) => {
                const isPlaying = playingCode === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => playLanguageSample(lang.code)}
                    aria-label={`Hear Mia in ${lang.name}${isPlaying ? " (playing — tap to stop)" : ""}`}
                    className="group relative text-left px-3 py-2.5 md:px-3.5 md:py-3 rounded-xl flex items-center gap-2.5 md:gap-3 transition-all"
                    style={{
                      background: isPlaying ? PALETTE.terracotta : PALETTE.creamSoft,
                      color: isPlaying ? PALETTE.cream : PALETTE.ink,
                      border: `1px solid ${isPlaying ? PALETTE.terracotta : PALETTE.rule}`,
                      cursor: "pointer",
                      boxShadow: isPlaying
                        ? "0 10px 24px -14px rgba(200,90,60,0.45)"
                        : "none",
                    }}
                    onMouseEnter={(e) => {
                      if (!isPlaying) {
                        e.currentTarget.style.borderColor = PALETTE.terracotta;
                        e.currentTarget.style.transform = "translateY(-1px)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isPlaying) {
                        e.currentTarget.style.borderColor = PALETTE.rule;
                        e.currentTarget.style.transform = "translateY(0)";
                      }
                    }}
                  >
                    <img
                      src={`https://flagcdn.com/${lang.country}.svg`}
                      alt=""
                      aria-hidden
                      loading="lazy"
                      className="shrink-0 rounded-[2px] object-cover select-none"
                      style={{
                        width: 22,
                        height: 16,
                        boxShadow: "0 1px 2px rgba(27,30,40,0.2)",
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <div
                        className={`${SERIF} text-[14px] md:text-[15px] leading-[1.15] tracking-[-0.005em] truncate`}
                        style={{ fontWeight: 500 }}
                      >
                        {lang.native}
                      </div>
                      <div
                        className="text-[8.5px] md:text-[9px] font-bold tracking-[0.18em] uppercase mt-0.5 truncate"
                        style={{
                          color: isPlaying
                            ? "rgba(245,239,228,0.75)"
                            : PALETTE.muted,
                        }}
                      >
                        {lang.name}
                      </div>
                    </div>
                    <motion.span
                      aria-hidden
                      className="flex items-center justify-center rounded-full shrink-0"
                      animate={
                        isPlaying
                          ? { scale: 1, boxShadow: "0 0 0 0 rgba(200,90,60,0)" }
                          : {
                              scale: [1, 1.12, 1],
                              boxShadow: [
                                "0 0 0 0 rgba(200,90,60,0.45)",
                                "0 0 0 6px rgba(200,90,60,0)",
                                "0 0 0 0 rgba(200,90,60,0)",
                              ],
                            }
                      }
                      transition={
                        isPlaying
                          ? { duration: 0.2 }
                          : { duration: 1.8, repeat: Infinity, ease: "easeInOut" }
                      }
                      style={{
                        width: 20,
                        height: 20,
                        background: isPlaying
                          ? "rgba(245,239,228,0.18)"
                          : PALETTE.terracotta,
                      }}
                    >
                      {isPlaying ? (
                        <svg width="7" height="8" viewBox="0 0 10 12" fill={PALETTE.cream}>
                          <rect x="0" y="0" width="3" height="12" rx="0.5" />
                          <rect x="7" y="0" width="3" height="12" rx="0.5" />
                        </svg>
                      ) : (
                        <svg width="7" height="8" viewBox="0 0 10 12" fill={PALETTE.cream}>
                          <path d="M0 1 L0 11 L10 6 Z" />
                        </svg>
                      )}
                    </motion.span>
                  </button>
                );
              })}
            </motion.div>

            <motion.p
              variants={fadeUp}
              className="mt-8 text-[14px] leading-[1.65]"
              style={{ color: PALETTE.muted, fontStyle: "italic" }}
            >
              Mia detects the caller's language within the first few words and responds fluently. The message that lands on your phone is always in English.
            </motion.p>
          </motion.section>

          {/* ─── COAST / TOWN STRIP (marquee between rule lines) ─── */}
          <motion.section
            className="mb-28 md:mb-36"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeUp} className="mb-6">
              <SectionLabel>Coverage · West to east</SectionLabel>
            </motion.div>
            <Rule />
            <motion.div
              variants={fadeUp}
              className="overflow-hidden py-8 md:py-12"
              style={{
                WebkitMaskImage:
                  "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
                maskImage:
                  "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
              }}
            >
              <div
                className={`${SERIF} animate-marquee flex items-center whitespace-nowrap w-max text-[clamp(1.6rem,3.2vw,2.4rem)] leading-[1.2] tracking-[-0.01em]`}
                style={{ color: PALETTE.ink, fontWeight: 400 }}
              >
                {[...TOWNS, ...TOWNS].map((t, i) => (
                  <span key={`${t}-${i}`} className="inline-flex items-center">
                    <span style={{ fontStyle: i % 2 ? "italic" : "normal" }}>{t}</span>
                    <span
                      aria-hidden
                      style={{ color: PALETTE.terracotta, margin: "0 0.9em" }}
                    >
                      ·
                    </span>
                  </span>
                ))}
              </div>
            </motion.div>
            <Rule />
          </motion.section>

          {/* ─── WEDGE: NUMBERED EDITORIAL ─── */}
          <motion.section
            className="mb-28 md:mb-36"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeUp} className="mb-8">
              <SectionLabel>The problem we solve</SectionLabel>
              <h2
                className={`${SERIF} mt-4 text-[clamp(2rem,4.2vw,3.4rem)] leading-[1.05] tracking-[-0.015em]`}
                style={{ color: PALETTE.ink, fontWeight: 500 }}
              >
                <span className="block">Your buyers are in London, Stockholm, Dubai.</span>
                <span
                  className="block mt-1"
                  style={{ fontStyle: "italic", color: PALETTE.muted }}
                >
                  Your office closes at seven.
                </span>
              </h2>
            </motion.div>

            <div className="mt-16 space-y-0">
              {WEDGE.map((w, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 md:gap-14 py-10 md:py-12"
                  style={{
                    borderTop: `1px solid ${PALETTE.rule}`,
                    ...(i === WEDGE.length - 1 ? { borderBottom: `1px solid ${PALETTE.rule}` } : {}),
                  }}
                >
                  <div
                    className={`${SERIF} text-[56px] md:text-[72px] leading-[0.9] tracking-[-0.02em]`}
                    style={{ color: PALETTE.terracotta, fontWeight: 400 }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div className="max-w-2xl">
                    <SectionLabel>{w.label}</SectionLabel>
                    <h3
                      className={`${SERIF} mt-3 text-[24px] md:text-[30px] leading-[1.2] tracking-[-0.01em]`}
                      style={{ color: PALETTE.ink, fontWeight: 500 }}
                    >
                      {w.title}
                    </h3>
                    <p
                      className="mt-4 text-[17px] leading-[1.7]"
                      style={{ color: PALETTE.inkSoft }}
                    >
                      {w.body}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* ─── REAL EXAMPLE — rendered artifact, not adjectives ─── */}
          <motion.section
            className="mb-28 md:mb-36"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeUp} className="mb-10">
              <SectionLabel>A real example</SectionLabel>
              <h2
                className={`${SERIF} mt-4 text-[clamp(2rem,4.2vw,3.4rem)] leading-[1.05] tracking-[-0.015em]`}
                style={{ color: PALETTE.ink, fontWeight: 500 }}
              >
                <span className="block">Monday, 22:47.</span>
                <span
                  className="block mt-1"
                  style={{ fontStyle: "italic", color: PALETTE.muted }}
                >
                  A London buyer dials.
                </span>
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)] gap-12 lg:gap-16 items-start">
              <motion.ol variants={fadeUp} className="relative">
                {[
                  {
                    time: "22:47",
                    title: "The call lands.",
                    body: "Your office closed four hours ago. The caller saw the three-bed villa in Mijas on Idealista and wants a viewing the week after next.",
                  },
                  {
                    time: "22:48",
                    title: "Mia answers in your business's name.",
                    body: "She takes the caller's name, rough budget, timeline, and preferred slot — cleanly, in natural English. Call ends at 22:49.",
                  },
                  {
                    time: "22:50",
                    title: "Message on your phone.",
                    body: "Structured enquiry lands as an SMS — caller, property, budget, timeline, language.",
                    highlight: true,
                  },
                  {
                    time: "08:12 Tue",
                    title: "You ring back warm.",
                    body: "The agency down the road never got the call.",
                  },
                ].map((step, i, arr) => {
                  const isLast = i === arr.length - 1;
                  return (
                    <li key={i} className="relative pl-9 pb-10 last:pb-0">
                      {/* vertical connector */}
                      {!isLast && (
                        <span
                          aria-hidden
                          className="absolute top-[14px] bottom-0"
                          style={{
                            left: 5,
                            width: 1,
                            background: PALETTE.rule,
                          }}
                        />
                      )}
                      {/* dot */}
                      <span
                        aria-hidden
                        className="absolute"
                        style={{
                          left: 0,
                          top: 6,
                          width: 11,
                          height: 11,
                          borderRadius: 999,
                          background: step.highlight ? PALETTE.terracotta : PALETTE.cream,
                          border: `2px solid ${PALETTE.terracotta}`,
                          boxShadow: step.highlight
                            ? "0 0 0 4px rgba(200,90,60,0.15)"
                            : "none",
                        }}
                      />
                      <div
                        className="text-[11px] font-bold tracking-[0.22em] uppercase"
                        style={{ color: PALETTE.terracotta }}
                      >
                        {step.time}
                      </div>
                      <h3
                        className={`${SERIF} mt-2 text-[20px] md:text-[22px] leading-[1.25] tracking-[-0.005em]`}
                        style={{ color: PALETTE.ink, fontWeight: 500 }}
                      >
                        {step.title}
                      </h3>
                      <p
                        className="mt-2 text-[15px] leading-[1.65]"
                        style={{ color: PALETTE.inkSoft }}
                      >
                        {step.body}
                      </p>
                    </li>
                  );
                })}
              </motion.ol>

              <motion.div variants={fadeUp} className="w-full lg:justify-self-end">
                <div
                  className="rounded-[28px] p-7 md:p-8"
                  style={{
                    background: "#FFFDF7",
                    border: `1px solid ${PALETTE.rule}`,
                    boxShadow: "0 24px 60px -28px rgba(27,30,40,0.25)",
                  }}
                >
                  <div className="flex items-center justify-between pb-4 mb-4" style={{ borderBottom: `1px solid ${PALETTE.rule}` }}>
                    <div>
                      <div className="text-[10px] font-bold tracking-[0.22em] uppercase" style={{ color: PALETTE.terracotta }}>
                        SMS · Mon 22:50
                      </div>
                      <div className={`${SERIF} mt-1 text-[18px]`} style={{ color: PALETTE.ink, fontWeight: 500 }}>
                        Coastline Estates · Mia
                      </div>
                    </div>
                    <div className="text-[11px] font-semibold" style={{ color: PALETTE.muted }}>
                      New enquiry
                    </div>
                  </div>
                  <div className="text-[14px] leading-[1.65]" style={{ color: PALETTE.ink }}>
                    <div><strong>Caller:</strong> Sophie Reid · +44 207 …</div>
                    <div className="mt-2"><strong>Property:</strong> 3-bed villa, Calle Calvario, Mijas</div>
                    <div className="mt-2"><strong>Budget:</strong> around €680k</div>
                    <div className="mt-2"><strong>Timeline:</strong> viewing week after next, mornings preferred</div>
                    <div className="mt-2"><strong>Language:</strong> English</div>
                    <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${PALETTE.rule}`, color: PALETTE.muted, fontStyle: "italic" }}>
                      Suggest ringing back before 10:00 UK time.
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.section>

          {/* ─── TESTIMONIALS — placeholder US demo quotes, replace before public launch ─── */}
          <motion.section
            className="mb-28 md:mb-36"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.1 }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeUp} className="mb-10">
              <SectionLabel>From US agents</SectionLabel>
              <h2
                className={`${SERIF} mt-4 text-[clamp(2rem,4.2vw,3.4rem)] leading-[1.05] tracking-[-0.015em]`}
                style={{ color: PALETTE.ink, fontWeight: 500 }}
              >
                <span className="block">Already paying us.</span>
                <span
                  className="block mt-1"
                  style={{ fontStyle: "italic", color: PALETTE.muted }}
                >
                  No more missed calls.
                </span>
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {TESTIMONIALS.map((t, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className="p-8 rounded-2xl flex flex-col"
                  style={{
                    background: PALETTE.creamSoft,
                    border: `1px solid ${PALETTE.rule}`,
                  }}
                >
                  <div
                    className={`${SERIF} text-[40px] leading-none tracking-[-0.02em] mb-4`}
                    style={{ color: PALETTE.terracotta, fontWeight: 400 }}
                  >
                    “
                  </div>
                  <blockquote
                    className={`${SERIF} text-[18px] md:text-[19px] leading-[1.4] tracking-[-0.005em] flex-1`}
                    style={{ color: PALETTE.ink, fontWeight: 500, fontStyle: "italic" }}
                  >
                    {t.quote}
                  </blockquote>
                  <div
                    className="mt-6 pt-5 flex items-center gap-3"
                    style={{ borderTop: `1px solid ${PALETTE.rule}` }}
                  >
                    <div
                      className="relative flex items-center justify-center rounded-full shrink-0 overflow-hidden"
                      style={{
                        width: 40,
                        height: 40,
                        background: PALETTE.ink,
                        color: PALETTE.cream,
                        fontFamily: "Fraunces, serif",
                        fontSize: 14,
                        fontWeight: 500,
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {/* Initials fallback — covered by the div below when image loads.
                          Using backgroundImage (not <img>) so a missing file shows nothing,
                          not a broken-image icon. */}
                      <span aria-hidden>{t.initials}</span>
                      {t.image && (
                        <div
                          role="img"
                          aria-label={t.name}
                          className="absolute inset-0 rounded-full bg-cover bg-center"
                          style={{ backgroundImage: `url(${t.image})` }}
                        />
                      )}
                    </div>
                    <div className="leading-tight">
                      <div className="text-[14.5px] font-semibold" style={{ color: PALETTE.ink }}>
                        {t.name}
                      </div>
                      <div className="text-[13px] mt-1" style={{ color: PALETTE.muted }}>
                        {t.role} · {t.firm}
                      </div>
                      <div className="text-[12px] mt-0.5" style={{ color: PALETTE.muted, fontStyle: "italic" }}>
                        {t.city}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* ─── MID-PAGE CTA — ringing phone band ─── */}
          <motion.section
            className="mb-28 md:mb-36"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
          >
            <motion.div
              variants={fadeUp}
              className="relative rounded-[24px] md:rounded-[28px] overflow-hidden px-7 md:px-12 py-10 md:py-12 grid grid-cols-1 md:grid-cols-[auto_1fr_auto] gap-7 md:gap-10 items-center"
              style={{ background: PALETTE.ink, color: PALETTE.cream }}
            >
              {/* Warm radial glow from the left */}
              <div
                aria-hidden
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse 65% 120% at 0% 50%, rgba(200,90,60,0.30) 0%, transparent 65%)",
                }}
              />
              {/* Faint grid shimmer on the right to balance */}
              <div
                aria-hidden
                className="absolute inset-0 pointer-events-none opacity-30"
                style={{
                  background:
                    "radial-gradient(ellipse 50% 90% at 100% 0%, rgba(245,239,228,0.08) 0%, transparent 60%)",
                }}
              />

              {/* Ringing phone icon with expanding rings */}
              <div className="relative flex items-center justify-center shrink-0" style={{ width: 84, height: 84 }}>
                {[0, 0.7, 1.4].map((delay) => (
                  <motion.span
                    key={delay}
                    aria-hidden
                    className="absolute rounded-full"
                    style={{
                      width: 56,
                      height: 56,
                      border: `1.5px solid ${PALETTE.terracotta}`,
                    }}
                    animate={{ scale: [1, 1.8], opacity: [0.55, 0] }}
                    transition={{
                      duration: 2.1,
                      repeat: Infinity,
                      ease: "easeOut",
                      delay,
                    }}
                  />
                ))}
                <motion.span
                  aria-hidden
                  className="relative flex items-center justify-center rounded-full"
                  style={{ width: 56, height: 56, background: PALETTE.terracotta }}
                  animate={{ rotate: [0, -10, 8, -6, 4, 0, 0, 0] }}
                  transition={{
                    duration: 1.6,
                    repeat: Infinity,
                    repeatDelay: 0.6,
                    ease: "easeInOut",
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill={PALETTE.cream}>
                    <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 0 0-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z" />
                  </svg>
                </motion.span>
              </div>

              {/* Copy */}
              <div className="relative">
                <div
                  className="text-[11px] font-bold tracking-[0.22em] uppercase"
                  style={{ color: PALETTE.terracotta }}
                >
                  Live demo · 2 min
                </div>
                <h3
                  className={`${SERIF} mt-2.5 text-[clamp(1.5rem,3vw,2.2rem)] leading-[1.15] tracking-[-0.01em]`}
                  style={{ fontWeight: 500 }}
                >
                  <span className="block">Ring Mia and try her yourself.</span>
                  <span
                    className="block mt-1"
                    style={{ fontStyle: "italic", color: "rgba(245,239,228,0.62)" }}
                  >
                    Two minutes. Any language.
                  </span>
                </h3>
              </div>

              {/* CTA */}
              <Link
                href="/demo"
                className="relative inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-[14px] font-bold tracking-[-0.005em] transition-all whitespace-nowrap self-start md:self-auto"
                style={{
                  background: PALETTE.terracotta,
                  color: PALETTE.cream,
                  boxShadow: "0 18px 40px -14px rgba(200,90,60,0.55)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = PALETTE.terracottaDeep)}
                onMouseLeave={(e) => (e.currentTarget.style.background = PALETTE.terracotta)}
              >
                Call Mia now →
              </Link>
            </motion.div>
          </motion.section>

          {/* ─── DELIVERY TESTIMONY — real broker, pullquote scale ─── */}
          <motion.section
            className="mb-28 md:mb-36"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
          >
            <motion.blockquote
              variants={fadeUp}
              className={`${SERIF} text-[clamp(1.8rem,4vw,3rem)] leading-[1.2] tracking-[-0.015em] max-w-4xl`}
              style={{ color: PALETTE.ink, fontWeight: 400 }}
            >
              <span style={{ color: PALETTE.terracotta }}>“</span>
              <span style={{ fontStyle: "italic" }}>
                I don't open an app. The message is already on my phone. Caller,
                property, budget, callback time. I ring back while I'm still making
                coffee.
              </span>
              <span style={{ color: PALETTE.terracotta }}>”</span>
            </motion.blockquote>

            <motion.div variants={fadeUp} className="mt-8 flex items-center gap-4">
              <div
                className="relative flex items-center justify-center rounded-full shrink-0 overflow-hidden"
                style={{
                  width: 52,
                  height: 52,
                  background: PALETTE.ink,
                  color: PALETTE.cream,
                  fontFamily: "Fraunces, serif",
                  fontSize: 16,
                  fontWeight: 500,
                }}
              >
                <span aria-hidden>DH</span>
                <div
                  role="img"
                  aria-label="Derek Hoffman"
                  className="absolute inset-0 rounded-full bg-cover bg-center"
                  style={{ backgroundImage: "url(/testimonial-derek.png)" }}
                />
              </div>
              <div className="leading-tight">
                <div
                  className="text-[14px] font-semibold"
                  style={{ color: PALETTE.ink }}
                >
                  Derek Hoffman
                </div>
                <div
                  className="text-[12px] mt-0.5"
                  style={{ color: PALETTE.muted }}
                >
                  Broker / Owner · Meridian Real Estate
                </div>
                <div
                  className="text-[11px] mt-0.5"
                  style={{ color: PALETTE.muted, fontStyle: "italic" }}
                >
                  Austin, TX
                </div>
              </div>
            </motion.div>
          </motion.section>

          {/* ─── WORKFLOWS ─── */}
          <motion.section
            className="mb-28 md:mb-36"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeUp} className="mb-8">
              <SectionLabel>What Mia covers</SectionLabel>
              <h2
                className={`${SERIF} mt-4 text-[clamp(2rem,4.2vw,3.4rem)] leading-[1.05] tracking-[-0.015em]`}
                style={{ color: PALETTE.ink, fontWeight: 500 }}
              >
                <span className="block">Three moments you'd miss the call.</span>
                <span
                  className="block mt-1"
                  style={{ fontStyle: "italic", color: PALETTE.muted }}
                >
                  Mia doesn't.
                </span>
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 mt-12">
              {WORKFLOWS.map((w, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className="group relative p-7 md:p-8 rounded-2xl transition-all"
                  style={{
                    background: PALETTE.creamSoft,
                    border: `1px solid ${PALETTE.rule}`,
                  }}
                  whileHover={{ y: -3 }}
                >
                  {/* Timestamp — editorial detail, top-right */}
                  <div
                    className="absolute top-6 right-7 text-[10px] font-bold tracking-[0.22em] uppercase"
                    style={{ color: PALETTE.muted, fontStyle: "italic" }}
                  >
                    {w.time}
                  </div>

                  {/* Icon badge */}
                  <div
                    className="flex items-center justify-center rounded-full mb-6 transition-all"
                    style={{
                      width: 48,
                      height: 48,
                      background: PALETTE.ink,
                      color: PALETTE.terracotta,
                    }}
                  >
                    {w.icon}
                  </div>

                  <SectionLabel>{w.label}</SectionLabel>
                  <h3
                    className={`${SERIF} mt-3 text-[22px] md:text-[24px] leading-[1.2] tracking-[-0.005em]`}
                    style={{ color: PALETTE.ink, fontWeight: 500 }}
                  >
                    {w.title}
                  </h3>
                  <p
                    className="mt-4 text-[15px] leading-[1.65]"
                    style={{ color: PALETTE.inkSoft }}
                  >
                    {w.body}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* ─── DASHBOARD MOCKUP — visual proof of the product ─── */}
          <motion.section
            className="mb-28 md:mb-36"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeUp} className="mb-10">
              <SectionLabel>Dashboard · Bird's eye view</SectionLabel>
              <h2
                className={`${SERIF} mt-4 text-[clamp(2rem,4.2vw,3.4rem)] leading-[1.05] tracking-[-0.015em]`}
                style={{ color: PALETTE.ink, fontWeight: 500 }}
              >
                <span className="block">The business Mia saved last week.</span>
                <span
                  className="block mt-1"
                  style={{ fontStyle: "italic", color: PALETTE.muted }}
                >
                  Counted, by call, by language, by day.
                </span>
              </h2>
              <p
                className="mt-5 text-[16px] leading-[1.65] max-w-2xl"
                style={{ color: PALETTE.inkSoft }}
              >
                Messages land on your phone in real time. The dashboard is for when you want to see how many calls Mia took, where your international buyers came from, or export the week to your CRM.
              </p>
            </motion.div>

            {/* Browser frame + dashboard mockup */}
            <motion.div
              variants={fadeUp}
              className="relative rounded-[14px] md:rounded-[18px] overflow-hidden"
              style={{
                boxShadow:
                  "0 40px 80px -30px rgba(27,30,40,0.45), 0 18px 40px -18px rgba(27,30,40,0.25)",
                border: `1px solid ${PALETTE.rule}`,
              }}
            >
              {/* Browser chrome */}
              <div
                className="flex items-center gap-3 px-4 py-3"
                style={{ background: PALETTE.ink }}
              >
                <div className="flex gap-1.5">
                  <span
                    aria-hidden
                    className="block w-3 h-3 rounded-full"
                    style={{ background: "#FF5F56" }}
                  />
                  <span
                    aria-hidden
                    className="block w-3 h-3 rounded-full"
                    style={{ background: "#FFBD2E" }}
                  />
                  <span
                    aria-hidden
                    className="block w-3 h-3 rounded-full"
                    style={{ background: "#27C93F" }}
                  />
                </div>
                <div
                  className="flex-1 mx-4 px-3 py-1.5 rounded-md text-[11px] font-medium text-center truncate"
                  style={{
                    background: "rgba(245,239,228,0.08)",
                    color: "rgba(245,239,228,0.55)",
                  }}
                >
                  mia.app/coastline-estates/dashboard
                </div>
                <div
                  className="w-7 h-7 rounded-full shrink-0"
                  style={{ background: "rgba(245,239,228,0.15)" }}
                />
              </div>

              {/* Dashboard body */}
              <div className="p-5 md:p-7" style={{ background: "#FFFDF7" }}>
                {/* Dashboard header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                  <div>
                    <div
                      className="text-[10px] font-bold tracking-[0.22em] uppercase"
                      style={{ color: PALETTE.terracotta }}
                    >
                      Coastline Estates · Dashboard
                    </div>
                    <h3
                      className={`${SERIF} text-[20px] md:text-[24px] mt-1 leading-tight`}
                      style={{ color: PALETTE.ink, fontWeight: 500 }}
                    >
                      April 2026 overview
                    </h3>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="text-[11px] font-semibold px-3 py-1.5 rounded-full inline-flex items-center gap-1.5"
                      style={{
                        background: PALETTE.creamSoft,
                        color: PALETTE.inkSoft,
                        border: `1px solid ${PALETTE.rule}`,
                      }}
                    >
                      Last 30 days
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <polyline points="2 3.5 5 6.5 8 3.5" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="text-[11px] font-semibold px-3 py-1.5 rounded-full"
                      style={{ background: PALETTE.ink, color: PALETTE.cream }}
                    >
                      Export CSV
                    </button>
                  </div>
                </div>

                {/* 4 Stat cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                  {DASHBOARD_STATS.map((s, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-xl"
                      style={{
                        background: PALETTE.creamSoft,
                        border: `1px solid ${PALETTE.rule}`,
                      }}
                    >
                      <div
                        className="text-[9px] font-bold tracking-[0.18em] uppercase"
                        style={{ color: PALETTE.muted }}
                      >
                        {s.label}
                      </div>
                      <div
                        className={`${SERIF} text-[26px] md:text-[30px] mt-1 leading-none tracking-[-0.025em]`}
                        style={{ color: PALETTE.ink, fontWeight: 500 }}
                      >
                        {s.value}
                      </div>
                      <div
                        className="mt-2 text-[10px]"
                        style={{ color: PALETTE.terracotta }}
                      >
                        {s.trend}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chart + Languages */}
                <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-3 mb-5">
                  {/* Bar chart */}
                  <div
                    className="p-4 rounded-xl"
                    style={{
                      background: PALETTE.creamSoft,
                      border: `1px solid ${PALETTE.rule}`,
                    }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className="text-[9px] font-bold tracking-[0.18em] uppercase"
                        style={{ color: PALETTE.muted }}
                      >
                        Calls per day
                      </div>
                      <div
                        className="text-[10px]"
                        style={{ color: PALETTE.muted }}
                      >
                        Last 30 days
                      </div>
                    </div>
                    <div className="flex items-end gap-[3px] h-[100px] md:h-[120px]">
                      {DASHBOARD_CHART.map((d, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-t-[2px]"
                          style={{
                            height: `${(d / 55) * 100}%`,
                            background:
                              i >= DASHBOARD_CHART.length - 5
                                ? PALETTE.terracotta
                                : PALETTE.ink,
                            opacity:
                              i >= DASHBOARD_CHART.length - 5 ? 1 : 0.55,
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Language breakdown */}
                  <div
                    className="p-4 rounded-xl"
                    style={{
                      background: PALETTE.creamSoft,
                      border: `1px solid ${PALETTE.rule}`,
                    }}
                  >
                    <div
                      className="text-[9px] font-bold tracking-[0.18em] uppercase mb-4"
                      style={{ color: PALETTE.muted }}
                    >
                      Top languages
                    </div>
                    <div className="space-y-3">
                      {DASHBOARD_LANGS.map((l, i) => (
                        <div key={i}>
                          <div className="flex justify-between text-[11px] mb-1">
                            <span
                              style={{ color: PALETTE.ink, fontWeight: 600 }}
                            >
                              {l.code}
                            </span>
                            <span style={{ color: PALETTE.muted }}>
                              {l.pct}%
                            </span>
                          </div>
                          <div
                            className="h-1.5 rounded-full overflow-hidden"
                            style={{ background: "rgba(27,30,40,0.08)" }}
                          >
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${(l.pct / 41) * 100}%`,
                                background: PALETTE.terracotta,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recent calls list */}
                <div
                  className="rounded-xl overflow-hidden"
                  style={{
                    background: PALETTE.creamSoft,
                    border: `1px solid ${PALETTE.rule}`,
                  }}
                >
                  <div
                    className="flex items-center justify-between px-4 pt-4 pb-3"
                  >
                    <div
                      className="text-[9px] font-bold tracking-[0.18em] uppercase"
                      style={{ color: PALETTE.muted }}
                    >
                      Recent enquiries
                    </div>
                    <div
                      className="text-[10px] font-semibold"
                      style={{ color: PALETTE.terracotta }}
                    >
                      View all →
                    </div>
                  </div>
                  <div>
                    {DASHBOARD_CALLS.map((c, i) => {
                      const statusColor =
                        c.status === "new"
                          ? PALETTE.terracotta
                          : c.status === "pending"
                          ? "#C9A42D"
                          : "#2D8659";
                      const statusLabel =
                        c.status === "new"
                          ? "New"
                          : c.status === "pending"
                          ? "Pending"
                          : "Called back";
                      return (
                        <div
                          key={i}
                          className="flex items-center gap-3 px-4 py-3"
                          style={{ borderTop: `1px solid ${PALETTE.rule}` }}
                        >
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                            style={{
                              background: PALETTE.ink,
                              color: PALETTE.cream,
                              fontFamily: "Fraunces, serif",
                            }}
                          >
                            {c.name
                              .split(" ")
                              .filter((w) => /^[A-Za-z]/.test(w))
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div
                              className="text-[12px] md:text-[13px] font-semibold truncate"
                              style={{ color: PALETTE.ink }}
                            >
                              {c.name}
                            </div>
                            <div
                              className="text-[11px] truncate"
                              style={{ color: PALETTE.muted }}
                            >
                              {c.prop}
                            </div>
                          </div>
                          <div
                            className="hidden sm:block text-[10px] font-bold px-2 py-0.5 rounded"
                            style={{
                              background: "rgba(27,30,40,0.06)",
                              color: PALETTE.inkSoft,
                            }}
                          >
                            {c.lang}
                          </div>
                          <div
                            className="hidden md:block text-[11px] w-[70px] text-right"
                            style={{ color: PALETTE.muted }}
                          >
                            {c.time}
                          </div>
                          <div className="inline-flex items-center gap-1.5 shrink-0">
                            <span
                              aria-hidden
                              className="block w-2 h-2 rounded-full"
                              style={{ background: statusColor }}
                            />
                            <span
                              className="text-[10px] font-semibold hidden sm:inline"
                              style={{ color: PALETTE.inkSoft }}
                            >
                              {statusLabel}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Mock-label under the frame */}
            <motion.p
              variants={fadeUp}
              className="mt-4 text-[12px] leading-[1.5] text-center"
              style={{ color: PALETTE.muted, fontStyle: "italic" }}
            >
              Preview. Dashboard ships with every plan.
            </motion.p>
          </motion.section>

          {/* ─── PRICING ─── */}
          <motion.section
            id="pricing"
            className="mb-28 md:mb-36 scroll-mt-24"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeUp} className="mb-8">
              <SectionLabel>Pricing · In euros</SectionLabel>
              <h2
                className={`${SERIF} mt-4 text-[clamp(2rem,4.2vw,3.4rem)] leading-[1.05] tracking-[-0.015em]`}
                style={{ color: PALETTE.ink, fontWeight: 500 }}
              >
                <span className="block">Flat monthly.</span>
                <span
                  className="block mt-1"
                  style={{ fontStyle: "italic", color: PALETTE.muted }}
                >
                  No surprise bills.
                </span>
              </h2>
              <p
                className="mt-5 text-[16px] leading-[1.65]"
                style={{ color: PALETTE.inkSoft }}
              >
                One-time €500 build fee, then flat monthly. 30-day money-back, no forms.
              </p>
            </motion.div>

            {/* Reassurance pills */}
            <motion.div
              variants={fadeUp}
              className="mb-8 flex flex-wrap items-center justify-center gap-2.5"
            >
              {["Cancel anytime", "Month-to-month", "Live in 3 days"].map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[12.5px] font-semibold"
                  style={{
                    background: PALETTE.creamSoft,
                    color: PALETTE.inkSoft,
                    border: `1px solid ${PALETTE.rule}`,
                    letterSpacing: "0.005em",
                  }}
                >
                  <span
                    aria-hidden
                    className="inline-block w-1.5 h-1.5 rounded-full"
                    style={{ background: PALETTE.terracotta }}
                  />
                  {item}
                </span>
              ))}
            </motion.div>

            {/* Billing toggle */}
            <motion.div variants={fadeUp} className="mb-10 flex justify-center">
              <div
                className="inline-flex items-center p-1 rounded-full relative"
                style={{ background: PALETTE.creamSoft, border: `1px solid ${PALETTE.rule}` }}
              >
                <button
                  type="button"
                  onClick={() => setBillingYearly(false)}
                  className="px-5 md:px-6 py-2 rounded-full text-[13px] font-semibold transition-all"
                  style={{
                    background: !billingYearly ? PALETTE.ink : "transparent",
                    color: !billingYearly ? PALETTE.cream : PALETTE.inkSoft,
                    cursor: "pointer",
                    border: "none",
                  }}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setBillingYearly(true)}
                  className="relative px-5 md:px-6 py-2 rounded-full text-[13px] font-semibold transition-all"
                  style={{
                    background: billingYearly ? PALETTE.ink : "transparent",
                    color: billingYearly ? PALETTE.cream : PALETTE.inkSoft,
                    cursor: "pointer",
                    border: "none",
                  }}
                >
                  Yearly
                  <span
                    className="absolute -top-2.5 -right-3 px-2 py-0.5 text-[9px] font-bold tracking-[0.08em] uppercase rounded-full whitespace-nowrap"
                    style={{ background: PALETTE.terracotta, color: PALETTE.cream }}
                  >
                    1 month free
                  </span>
                </button>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {TIERS.map((t) => {
                const savings = t.monthly * 12 - t.yearly;
                return (
                  <motion.div
                    key={t.name}
                    variants={fadeUp}
                    className="relative p-8 rounded-2xl flex flex-col"
                    style={{
                      background: t.featured ? PALETTE.ink : PALETTE.creamSoft,
                      color: t.featured ? PALETTE.cream : PALETTE.ink,
                      border: t.featured ? "none" : `1px solid ${PALETTE.rule}`,
                      transform: t.featured ? "translateY(-12px)" : "none",
                      boxShadow: t.featured
                        ? "0 30px 60px -24px rgba(27,30,40,0.45)"
                        : "none",
                    }}
                  >
                    {t.featured && (
                      <div
                        className="absolute -top-3 left-8 px-3 py-1 text-[10px] font-bold tracking-[0.18em] uppercase rounded-full"
                        style={{ background: PALETTE.terracotta, color: PALETTE.cream }}
                      >
                        Most agents pick this
                      </div>
                    )}
                    <div className={`${SERIF} text-[22px] tracking-[-0.005em]`} style={{ fontWeight: 500 }}>
                      {t.name}
                    </div>
                    <div className="mt-4 flex items-baseline gap-1.5">
                      <span
                        className={`${SERIF} text-[48px] tracking-[-0.025em] leading-none`}
                        style={{ fontWeight: 500 }}
                      >
                        €{t.monthly}
                      </span>
                      <span
                        className="text-[14px] font-medium"
                        style={{ color: t.featured ? "rgba(245,239,228,0.6)" : PALETTE.muted }}
                      >
                        /month
                      </span>
                    </div>
                    <div
                      className="mt-2 text-[12px] leading-[1.5]"
                      style={{ color: t.featured ? "rgba(245,239,228,0.55)" : PALETTE.muted }}
                    >
                      {billingYearly
                        ? `€${t.yearly.toLocaleString()} billed annually · save €${savings.toLocaleString()}`
                        : `or €${t.yearly.toLocaleString()} yearly · save €${savings.toLocaleString()}`}
                    </div>
                    <div
                      className="mt-1.5 inline-flex items-center gap-1.5 text-[11px] font-bold tracking-[0.14em] uppercase"
                      style={{
                        color: t.featured ? "rgba(245,239,228,0.8)" : PALETTE.terracotta,
                      }}
                    >
                      <span>+ €500 one-time build</span>
                    </div>

                    <div
                      className="mt-5 text-[13px] font-semibold"
                      style={{ color: t.featured ? "rgba(245,239,228,0.85)" : PALETTE.inkSoft }}
                    >
                      {t.best}
                    </div>
                    <div
                      className="mt-1 text-[13px]"
                      style={{ color: t.featured ? "rgba(245,239,228,0.55)" : PALETTE.muted }}
                    >
                      {t.calls} · {t.overage}
                    </div>

                    <div
                      className="my-6 h-px"
                      style={{
                        background: t.featured ? "rgba(245,239,228,0.15)" : PALETTE.rule,
                      }}
                    />

                    <ul className="space-y-3 flex-1">
                      {t.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-[13.5px] leading-[1.5]">
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke={PALETTE.terracotta}
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="shrink-0 mt-0.5"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          <span style={{ color: t.featured ? "rgba(245,239,228,0.9)" : PALETTE.inkSoft }}>
                            {f}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <Link
                      href="/demo"
                      className="mt-8 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-[14px] font-bold tracking-[-0.005em] transition-all w-full"
                      style={{
                        background: t.featured ? PALETTE.terracotta : "transparent",
                        color: t.featured ? PALETTE.cream : PALETTE.ink,
                        border: t.featured ? "none" : `1px solid ${PALETTE.ink}`,
                        boxShadow: t.featured
                          ? "0 14px 30px -12px rgba(200,90,60,0.55)"
                          : "none",
                      }}
                      onMouseEnter={(e) => {
                        if (t.featured) {
                          e.currentTarget.style.background = PALETTE.terracottaDeep;
                        } else {
                          e.currentTarget.style.background = PALETTE.ink;
                          e.currentTarget.style.color = PALETTE.cream;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (t.featured) {
                          e.currentTarget.style.background = PALETTE.terracotta;
                        } else {
                          e.currentTarget.style.background = "transparent";
                          e.currentTarget.style.color = PALETTE.ink;
                        }
                      }}
                    >
                      {t.cta} →
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            {/* What's included in every plan — dark feature band */}
            <motion.div
              variants={fadeUp}
              className="relative mt-12 rounded-[28px] overflow-hidden px-8 md:px-12 py-10 md:py-14"
              style={{ background: PALETTE.ink, color: PALETTE.cream }}
            >
              {/* Warm corner glow */}
              <div
                aria-hidden
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse 60% 90% at 100% 0%, rgba(200,90,60,0.22) 0%, transparent 65%)",
                }}
              />
              <div
                aria-hidden
                className="absolute inset-0 pointer-events-none opacity-40"
                style={{
                  background:
                    "radial-gradient(ellipse 50% 80% at 0% 100%, rgba(27,73,101,0.28) 0%, transparent 60%)",
                }}
              />

              <div className="relative">
                <div
                  className="text-[11px] font-bold tracking-[0.22em] uppercase"
                  style={{ color: PALETTE.terracotta }}
                >
                  In every plan
                </div>
                <h3
                  className={`${SERIF} mt-3 text-[clamp(1.5rem,3vw,2.2rem)] leading-[1.15] tracking-[-0.01em] max-w-2xl`}
                  style={{ fontWeight: 500 }}
                >
                  <span className="block">The non-negotiables.</span>
                  <span
                    className="block mt-1"
                    style={{ fontStyle: "italic", color: "rgba(245,239,228,0.6)" }}
                  >
                    Whatever tier you pick.
                  </span>
                </h3>

                <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-8 md:gap-y-10">
                  {PLAN_INCLUDED.map((item, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <span
                        aria-hidden
                        className="flex items-center justify-center rounded-full shrink-0"
                        style={{
                          width: 40,
                          height: 40,
                          background: "rgba(200,90,60,0.14)",
                          color: PALETTE.terracotta,
                          border: `1px solid rgba(200,90,60,0.35)`,
                        }}
                      >
                        {item.icon}
                      </span>
                      <div className="min-w-0">
                        <div
                          className={`${SERIF} text-[17px] md:text-[18px] leading-[1.2] tracking-[-0.005em]`}
                          style={{ fontWeight: 500 }}
                        >
                          {item.label}
                        </div>
                        <div
                          className="mt-1.5 text-[13.5px] leading-[1.5]"
                          style={{ color: "rgba(245,239,228,0.62)" }}
                        >
                          {item.desc}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Micro-testimonial anchoring the price */}
            <motion.div variants={fadeUp} className="mt-14 flex items-start gap-4">
              <div
                className={`${SERIF} text-[64px] leading-none shrink-0`}
                style={{ color: PALETTE.terracotta, fontWeight: 400 }}
              >
                “
              </div>
              <div className="flex-1 pt-2">
                <p
                  className={`${SERIF} text-[17px] md:text-[19px] leading-[1.4] whitespace-normal md:whitespace-nowrap`}
                  style={{ color: PALETTE.ink, fontWeight: 400, fontStyle: "italic" }}
                >
                  My ISA cost $4,200 a month and quit every year. Mia costs a fraction of that and never calls in sick.
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <div
                    className="relative flex items-center justify-center rounded-full shrink-0 overflow-hidden"
                    style={{
                      width: 36,
                      height: 36,
                      background: PALETTE.ink,
                      color: PALETTE.cream,
                      fontFamily: "Fraunces, serif",
                      fontSize: 12,
                      fontWeight: 500,
                    }}
                  >
                    <span aria-hidden>DH</span>
                    <div
                      role="img"
                      aria-label="Derek Hoffman"
                      className="absolute inset-0 rounded-full bg-cover bg-center"
                      style={{ backgroundImage: "url(/testimonial-derek.png)" }}
                    />
                  </div>
                  <div className="text-[13px]" style={{ color: PALETTE.muted }}>
                    <span className="font-semibold" style={{ color: PALETTE.ink }}>Derek Hoffman</span>
                    <span> · Broker / Owner · Meridian Real Estate · Austin, TX</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.section>

          {/* ─── MONEY-BACK STRIP — risk reversal while price is still on screen ─── */}
          <motion.section
            className="mb-28 md:mb-36"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
          >
            <motion.div
              variants={fadeUp}
              className="rounded-[24px] p-8 md:p-12 grid grid-cols-1 md:grid-cols-[auto_1fr] gap-8 md:gap-14 items-center"
              style={{
                background: PALETTE.creamSoft,
                border: `1px solid ${PALETTE.rule}`,
              }}
            >
              <div
                className={`${SERIF} text-[72px] md:text-[96px] leading-[0.85] tracking-[-0.03em]`}
                style={{ color: PALETTE.terracotta, fontWeight: 400 }}
              >
                30
                <span className={`${SERIF} text-[22px] align-top ml-1`} style={{ color: PALETTE.muted, fontStyle: "italic" }}>
                  days
                </span>
              </div>
              <div>
                <SectionLabel>Risk reversal</SectionLabel>
                <h3
                  className={`${SERIF} mt-3 text-[26px] md:text-[32px] leading-[1.2] tracking-[-0.01em]`}
                  style={{ color: PALETTE.ink, fontWeight: 500 }}
                >
                  One email. Full refund.{" "}
                  <span style={{ fontStyle: "italic", color: PALETTE.muted }}>
                    No forms, no dance.
                  </span>
                </h3>
                <p className="mt-4 text-[15px] leading-[1.7] max-w-xl" style={{ color: PALETTE.inkSoft }}>
                  If Mia isn't saving you time by day thirty, email us a single line
                  and we refund the month in full. No retention call, no audit, no
                  questions about what went wrong.
                </p>
              </div>
            </motion.div>
          </motion.section>

          {/* ─── INTEGRATIONS — tools Mia plugs into ─── */}
          <motion.section
            className="mb-28 md:mb-36"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.1 }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeUp} className="mb-10">
              <SectionLabel>Integrations · API-first</SectionLabel>
              <h2
                className={`${SERIF} mt-4 text-[clamp(2rem,4.2vw,3.4rem)] leading-[1.05] tracking-[-0.015em]`}
                style={{ color: PALETTE.ink, fontWeight: 500 }}
              >
                <span className="block">Plugs into your stack.</span>
                <span
                  className="block mt-1"
                  style={{ fontStyle: "italic", color: PALETTE.muted }}
                >
                  Any system with an API.
                </span>
              </h2>
              <p
                className="mt-5 text-[16px] leading-[1.65] max-w-2xl"
                style={{ color: PALETTE.inkSoft }}
              >
                Webhooks, REST APIs, standard connectors. Mia drops every enquiry exactly where you want it — your CRM, your calendar, your team's messaging. Built your own in-house? We'll wire it up.
              </p>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3"
            >
              {INTEGRATIONS.map((i) => (
                <div
                  key={i.name}
                  className="group relative p-5 rounded-xl flex flex-col items-center justify-center text-center gap-3 transition-all min-h-[140px]"
                  style={{
                    background: PALETTE.creamSoft,
                    border: `1px solid ${PALETTE.rule}`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = PALETTE.terracotta;
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = PALETTE.rule;
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <div className="flex items-center justify-center h-10">
                    {i.logo ? (
                      <img
                        src={i.logo}
                        alt=""
                        aria-hidden
                        loading="lazy"
                        className="h-8 w-auto transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div
                        className={`${SERIF} text-[22px] leading-none tracking-[-0.01em]`}
                        style={{ color: PALETTE.terracotta, fontWeight: 500 }}
                      >
                        {i.short}
                      </div>
                    )}
                  </div>
                  <div>
                    <div
                      className="text-[14px] font-semibold leading-tight"
                      style={{ color: PALETTE.ink }}
                    >
                      {i.name}
                    </div>
                    <div
                      className="mt-1 text-[10px] font-bold tracking-[0.18em] uppercase"
                      style={{ color: PALETTE.muted }}
                    >
                      {i.category}
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Wildcard: your custom system */}
            <motion.div
              variants={fadeUp}
              className="relative mt-5 rounded-xl flex items-center gap-5 px-6 md:px-8 py-5 md:py-6"
              style={{
                background: PALETTE.ink,
                color: PALETTE.cream,
              }}
            >
              <div
                className="flex items-center justify-center rounded-full shrink-0"
                style={{
                  width: 44,
                  height: 44,
                  background: "rgba(200,90,60,0.16)",
                  color: PALETTE.terracotta,
                  border: `1px solid rgba(200,90,60,0.4)`,
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="16 18 22 12 16 6" />
                  <polyline points="8 6 2 12 8 18" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className="text-[10px] font-bold tracking-[0.22em] uppercase"
                  style={{ color: PALETTE.terracotta }}
                >
                  Everything else
                </div>
                <div
                  className={`${SERIF} mt-1 text-[17px] md:text-[20px] leading-[1.3]`}
                  style={{ fontWeight: 500 }}
                >
                  Your custom CRM, your in-house dashboard, your niche real-estate tool — anything with a REST endpoint or a webhook. We wire it up.
                </div>
              </div>
            </motion.div>
          </motion.section>

          {/* ─── COMPARISON — why Mia vs the existing alternatives ─── */}
          <motion.section
            className="mb-28 md:mb-36"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.1 }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeUp} className="mb-10 max-w-2xl">
              <SectionLabel>What you're using now</SectionLabel>
              <h2
                className={`${SERIF} mt-4 text-[clamp(2rem,4.2vw,3.4rem)] leading-[1.05] tracking-[-0.015em]`}
                style={{ color: PALETTE.ink, fontWeight: 500 }}
              >
                Three things Costa del Sol agents rely on.{" "}
                <span style={{ fontStyle: "italic", color: PALETTE.muted }}>
                  All three leak.
                </span>
              </h2>
            </motion.div>

            <div className="space-y-0">
              {ALTERNATIVES.map((alt, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto] gap-6 md:gap-14 py-10 md:py-12 items-start"
                  style={{ borderTop: `1px solid ${PALETTE.rule}` }}
                >
                  <div
                    className={`${SERIF} text-[44px] md:text-[56px] leading-[0.9] tracking-[-0.02em]`}
                    style={{ color: PALETTE.terracotta, fontWeight: 400 }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div className="max-w-xl">
                    <SectionLabel>{alt.label}</SectionLabel>
                    <h3
                      className={`${SERIF} mt-3 text-[22px] md:text-[26px] leading-[1.2] tracking-[-0.005em]`}
                      style={{ color: PALETTE.ink, fontWeight: 500 }}
                    >
                      {alt.title}
                    </h3>
                    <p
                      className="mt-4 text-[16px] leading-[1.7]"
                      style={{ color: PALETTE.inkSoft }}
                    >
                      {alt.body}
                    </p>
                  </div>
                  <div className="md:text-right md:min-w-[160px]">
                    <div
                      className={`${SERIF} text-[20px] md:text-[24px] leading-none tracking-[-0.005em]`}
                      style={{ color: PALETTE.ink, fontWeight: 500 }}
                    >
                      {alt.cost}
                    </div>
                    <div
                      className="mt-2 text-[12px] leading-[1.4]"
                      style={{ color: PALETTE.muted, fontStyle: "italic" }}
                    >
                      {alt.costNote}
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Mia contrast row */}
              <motion.div
                variants={fadeUp}
                className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto] gap-6 md:gap-14 py-10 md:py-12 items-start rounded-[24px] mt-8"
                style={{
                  background: PALETTE.ink,
                  color: PALETTE.cream,
                  padding: "2.5rem 2rem",
                }}
              >
                <div
                  className={`${SERIF} text-[44px] md:text-[56px] leading-[0.9] tracking-[-0.02em]`}
                  style={{ color: PALETTE.terracotta, fontWeight: 400 }}
                >
                  ✓
                </div>
                <div className="max-w-xl">
                  <div
                    className="text-[11px] font-bold tracking-[0.22em] uppercase"
                    style={{ color: PALETTE.terracotta }}
                  >
                    Mia
                  </div>
                  <h3
                    className={`${SERIF} mt-3 text-[22px] md:text-[26px] leading-[1.2] tracking-[-0.005em]`}
                    style={{ fontWeight: 500 }}
                  >
                    Answers at 22:00 in English. Qualifies the buyer. Sends you the message in sixty seconds.
                  </h3>
                  <p
                    className="mt-4 text-[16px] leading-[1.7]"
                    style={{ color: "rgba(245,239,228,0.8)" }}
                  >
                    24/7 coverage, proper English, structured enquiry on your phone or inbox before the caller's kettle has boiled. No missed leads, no distracted phone calls from the motorway, no €900/month for nine-to-five cover you already have.
                  </p>
                </div>
                <div className="md:text-right md:min-w-[160px]">
                  <div
                    className={`${SERIF} text-[22px] md:text-[28px] leading-none tracking-[-0.005em]`}
                    style={{ fontWeight: 500 }}
                  >
                    from €199 /mo
                  </div>
                  <div
                    className="mt-2 text-[12px] leading-[1.4]"
                    style={{ color: "rgba(245,239,228,0.55)", fontStyle: "italic" }}
                  >
                    flat monthly, minutes included
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.section>

          {/* ─── FAQ ─── */}
          <motion.section
            className="mb-28 md:mb-36"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.1 }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeUp} className="mb-10 max-w-2xl">
              <SectionLabel>FAQ</SectionLabel>
              <h2
                className={`${SERIF} mt-4 text-[clamp(2rem,4.2vw,3.4rem)] leading-[1.05] tracking-[-0.015em]`}
                style={{ color: PALETTE.ink, fontWeight: 500 }}
              >
                Questions Costa del Sol agents{" "}
                <span style={{ fontStyle: "italic", color: PALETTE.muted }}>
                  ask first.
                </span>
              </h2>
            </motion.div>

            <div>
              {FAQ_ITEMS.map((item, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className="grid grid-cols-1 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)] gap-4 md:gap-14 py-8"
                  style={{
                    borderTop: `1px solid ${PALETTE.rule}`,
                    ...(i === FAQ_ITEMS.length - 1 ? { borderBottom: `1px solid ${PALETTE.rule}` } : {}),
                  }}
                >
                  <h3
                    className={`${SERIF} text-[20px] md:text-[22px] leading-[1.3] tracking-[-0.005em]`}
                    style={{ color: PALETTE.ink, fontWeight: 500 }}
                  >
                    {item.q}
                  </h3>
                  <p className="text-[16.5px] leading-[1.7]" style={{ color: PALETTE.inkSoft }}>
                    {item.a}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* ─── CLOSING CTA ─── */}
          <motion.section
            className="mb-12"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
          >
            <motion.div
              variants={fadeUp}
              className="relative rounded-[32px] p-10 md:p-16 text-center overflow-hidden"
              style={{ background: PALETTE.ink, color: PALETTE.cream }}
            >
              <div
                aria-hidden
                className="absolute inset-0 pointer-events-none opacity-50"
                style={{
                  background:
                    "radial-gradient(ellipse 50% 60% at 50% 0%, rgba(200,90,60,0.35) 0%, transparent 70%)",
                }}
              />
              <div className="relative">
                <div className="mb-5">
                  <SectionLabel color={PALETTE.terracotta}>
                    Hear Mia answer a Costa del Sol enquiry
                  </SectionLabel>
                </div>
                <h2
                  className={`${SERIF} text-[clamp(2rem,4.5vw,3.4rem)] leading-[1.05] tracking-[-0.015em] max-w-3xl mx-auto`}
                  style={{ fontWeight: 500 }}
                >
                  Two minutes with Mia.{" "}
                  <span style={{ fontStyle: "italic", color: PALETTE.terracotta }}>
                    Your next booked viewing.
                  </span>
                </h2>
                <p
                  className="mt-6 text-[16px] leading-[1.6] max-w-xl mx-auto"
                  style={{ color: "rgba(245,239,228,0.7)" }}
                >
                  Type your business name on the demo page. Mia will greet as if she
                  worked there, and take a sample enquiry.
                </p>
                <Link
                  href="/demo"
                  className="mt-8 inline-flex items-center gap-2 px-8 py-4 rounded-full text-[14px] font-bold tracking-[-0.005em] transition-all"
                  style={{
                    background: PALETTE.terracotta,
                    color: PALETTE.cream,
                    boxShadow: "0 18px 40px -14px rgba(200,90,60,0.55)",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = PALETTE.terracottaDeep)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = PALETTE.terracotta)}
                >
                  Talk to Mia now
                </Link>
              </div>
            </motion.div>
          </motion.section>
        </div>
      </div>
    </>
  );
}
