"use client";

import { motion } from "framer-motion";
import Link from "next/link";
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
    body: "Your office closes at 19:00. Your buyers are one to four hours ahead and dial after dinner. Mia answers in English, 24 hours a day, so the lead doesn't bounce to the next agency.",
  },
  {
    label: "The language problem",
    title: "English-speaking, end to end.",
    body: "No broken English, no language fumbling on a half-million-euro enquiry. Mia listens carefully, qualifies the caller's interest — area, rough budget, timeline — cleanly, in natural English.",
  },
  {
    label: "The follow-up problem",
    title: "Proper message, delivered fast.",
    body: "Every call you'd have missed becomes a structured message in your inbox or on your phone within seconds — caller name, what they asked about, when to call back. No more 'she rang earlier' sticky notes.",
  },
];

const WORKFLOWS = [
  {
    label: "Buyer enquiry",
    title: "From call to structured message.",
    body: "Caller saw one of your listings and wants to know more. Mia greets in your brokerage's name, qualifies area preference, rough budget and timeline — then sends you the message so you can call back warm.",
  },
  {
    label: "Seller enquiry",
    title: "Valuation lead, captured clean.",
    body: "Owner in Benahavís thinking of selling. Mia captures the property address, motivation, and timeline — and pushes it through so you can line up a valuation call when you're back in office.",
  },
  {
    label: "Everything else",
    title: "Filtered, not ignored.",
    body: "Notary, gestor, cleaner, or a buyer looking in Valencia? Mia answers politely, logs the contact, and only pings you for the calls that matter. Your phone stops being the bottleneck.",
  },
];

const TIERS = [
  { name: "Solo", price: "€99", per: "/month", best: "1 agent", calls: "250 calls/mo included", featured: false },
  { name: "Team", price: "€299", per: "/month", best: "2–10 agents", calls: "750 calls/mo included", featured: true },
  { name: "Brokerage", price: "€899", per: "/month", best: "Office line + up to 50 agents", calls: "2,500 calls/mo included", featured: false },
];

const FAQ_ITEMS = [
  { q: "Which towns on the Costa del Sol do you cover?", a: "All of it — Sotogrande to Nerja. Mia handles enquiries about Marbella, Estepona, Fuengirola, Benalmádena, Mijas, Málaga, Benahavís, Manilva, Torremolinos, and anywhere in between." },
  { q: "Does Mia handle calls from UK buyers in a different time zone?", a: "Yes — that's the main reason agents here buy us. Mia answers 24/7 in English, so a buyer calling from London at 22:00 GMT gets a human-sounding answer and a proper message rather than voicemail." },
  { q: "Does she know about specific properties I have listed?", a: "Not out of the box — Mia is an answering service, not a property search tool. She greets in your brokerage's name, takes the enquiry, qualifies the caller, and gets you the message. You follow up with the right listing." },
  { q: "Will Mia sound like a robot on an expensive enquiry?", a: "Run the live demo and decide. Warm, clear English, natural pacing — most callers don't realise they're speaking with an AI until they're told." },
  { q: "How do I receive the messages?", a: "Email, SMS, or both — whichever works for you. You get the caller's name, what they were asking about, and a suggested call-back time." },
  { q: "How does the money-back guarantee work?", a: "30-day money-back, no forms. If it isn't saving you time in the first month, email us and we refund the month." },
];

const SERVICE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "AI Receptionist for Costa del Sol Estate Agents",
  description: "24/7 English-speaking AI voice answering service for estate agents on the Costa del Sol. Greets in your brokerage's name, qualifies the caller, and delivers a proper message to you by email or SMS.",
  serviceType: "AI voice answering service for real estate",
  provider: { "@type": "Organization", name: "Voice AI Receptionist", url: "https://realestate.voiceaireceptionists.com" },
  areaServed: { "@type": "Place", name: "Costa del Sol, Spain" },
  availableLanguage: "English",
  offers: [
    { "@type": "Offer", name: "Solo", price: "99", priceCurrency: "EUR" },
    { "@type": "Offer", name: "Team", price: "299", priceCurrency: "EUR" },
    { "@type": "Offer", name: "Brokerage", price: "899", priceCurrency: "EUR" },
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

export default function CostaDelSolPage() {
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
                  Costa del Sol · For estate agents
                </SectionLabel>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                className={`${SERIF} text-[clamp(3rem,6.5vw,5.6rem)] leading-[0.98] tracking-[-0.025em]`}
                style={{ color: PALETTE.ink, fontWeight: 500 }}
              >
                The AI receptionist for{" "}
                <span style={{ fontStyle: "italic", color: PALETTE.sea }}>
                  Costa del Sol
                </span>{" "}
                estate agents.
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="mt-8 text-[18px] leading-[1.6] font-medium max-w-xl"
                style={{ color: PALETTE.inkSoft }}
              >
                From Sotogrande to Nerja — your international buyers call at all hours.
                Mia answers in English, qualifies the enquiry, and sends you a proper
                message within seconds. Flat monthly, no per-minute math.
              </motion.p>

              <motion.div variants={fadeUp} className="mt-10 flex flex-wrap items-center gap-4">
                <Link
                  href="#pricing"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-[14px] font-bold tracking-[-0.005em] transition-all"
                  style={{
                    background: PALETTE.terracotta,
                    color: PALETTE.cream,
                    boxShadow: "0 18px 40px -14px rgba(200,90,60,0.55)",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = PALETTE.terracottaDeep)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = PALETTE.terracotta)}
                >
                  See pricing
                </Link>
                <Link
                  href="/demo"
                  className="inline-flex items-center gap-2 text-[14px] font-semibold underline underline-offset-[6px] decoration-1"
                  style={{ color: PALETTE.sea }}
                >
                  Open the full demo page →
                </Link>
              </motion.div>
            </div>

            <motion.div variants={fadeUp} className="w-full lg:justify-self-end">
              <PhoneCallDemo businessName="Coastline Estates" />
            </motion.div>
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
            <motion.div variants={fadeUp} className="mb-8 max-w-2xl">
              <SectionLabel>The problem we solve</SectionLabel>
              <h2
                className={`${SERIF} mt-4 text-[clamp(2rem,4.2vw,3.4rem)] leading-[1.05] tracking-[-0.015em]`}
                style={{ color: PALETTE.ink, fontWeight: 500 }}
              >
                Your buyers are in London, Stockholm, Dubai.{" "}
                <span style={{ fontStyle: "italic", color: PALETTE.muted }}>
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
                      className="mt-4 text-[16px] leading-[1.7]"
                      style={{ color: PALETTE.inkSoft }}
                    >
                      {w.body}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* ─── DELIVERY PULL QUOTE ─── */}
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
                Messages on your phone. Seconds after the call ends. No new CRM to
                learn, no dashboard to log into — just the caller's name, what they
                were asking about, and when to ring them back.
              </span>
              <span style={{ color: PALETTE.terracotta }}>”</span>
            </motion.blockquote>
            <motion.div variants={fadeUp} className="mt-6">
              <SectionLabel color={PALETTE.muted}>Delivery · Email or SMS</SectionLabel>
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
            <motion.div variants={fadeUp} className="mb-8 max-w-2xl">
              <SectionLabel>How Mia works</SectionLabel>
              <h2
                className={`${SERIF} mt-4 text-[clamp(2rem,4.2vw,3.4rem)] leading-[1.05] tracking-[-0.015em]`}
                style={{ color: PALETTE.ink, fontWeight: 500 }}
              >
                Three kinds of call.{" "}
                <span style={{ fontStyle: "italic", color: PALETTE.muted }}>
                  Handled properly.
                </span>
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10 mt-12">
              {WORKFLOWS.map((w, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className="relative pt-8"
                  style={{ borderTop: `1px solid ${PALETTE.rule}` }}
                >
                  <div
                    className={`${SERIF} absolute -top-5 left-0 text-[32px] leading-none px-3`}
                    style={{
                      color: PALETTE.terracotta,
                      background: PALETTE.cream,
                      fontWeight: 400,
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <SectionLabel>{w.label}</SectionLabel>
                  <h3
                    className={`${SERIF} mt-3 text-[22px] md:text-[26px] leading-[1.2] tracking-[-0.005em]`}
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

          {/* ─── PRICING ─── */}
          <motion.section
            id="pricing"
            className="mb-28 md:mb-36 scroll-mt-24"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeUp} className="mb-10 max-w-2xl">
              <SectionLabel>Pricing · In euros</SectionLabel>
              <h2
                className={`${SERIF} mt-4 text-[clamp(2rem,4.2vw,3.4rem)] leading-[1.05] tracking-[-0.015em]`}
                style={{ color: PALETTE.ink, fontWeight: 500 }}
              >
                Flat monthly.{" "}
                <span style={{ fontStyle: "italic", color: PALETTE.muted }}>
                  No per-minute meter.
                </span>
              </h2>
              <p
                className="mt-5 text-[16px] leading-[1.65] max-w-lg"
                style={{ color: PALETTE.inkSoft }}
              >
                30-day money-back, no forms. Cancel anytime.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {TIERS.map((t) => (
                <motion.div
                  key={t.name}
                  variants={fadeUp}
                  className="relative p-8 rounded-2xl"
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
                      {t.price}
                    </span>
                    <span
                      className="text-[14px] font-medium"
                      style={{ color: t.featured ? "rgba(245,239,228,0.6)" : PALETTE.muted }}
                    >
                      {t.per}
                    </span>
                  </div>
                  <div
                    className="mt-5 text-[13px] font-semibold"
                    style={{ color: t.featured ? "rgba(245,239,228,0.85)" : PALETTE.inkSoft }}
                  >
                    {t.best}
                  </div>
                  <div
                    className="mt-2 text-[13px]"
                    style={{ color: t.featured ? "rgba(245,239,228,0.55)" : PALETTE.muted }}
                  >
                    {t.calls}
                  </div>
                </motion.div>
              ))}
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
                  <p className="text-[15px] leading-[1.7]" style={{ color: PALETTE.inkSoft }}>
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
                  Two minutes is all it takes to judge if she's good enough{" "}
                  <span style={{ fontStyle: "italic", color: PALETTE.terracotta }}>
                    for your phones.
                  </span>
                </h2>
                <p
                  className="mt-6 text-[16px] leading-[1.6] max-w-xl mx-auto"
                  style={{ color: "rgba(245,239,228,0.7)" }}
                >
                  Type your brokerage name on the demo page. Mia will greet as if she
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
