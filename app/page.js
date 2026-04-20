"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

const cardVariant = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
};

const CRMS = [
  { name: "Follow Up Boss", short: "FUB" },
  { name: "kvCORE", short: "kvCORE" },
  { name: "Sierra Interactive", short: "Sierra" },
  { name: "BoomTown", short: "BoomTown" },
  { name: "CINC", short: "CINC" },
  { name: "Lofty", short: "Lofty" },
];

const WORKFLOWS = [
  {
    title: "Buyer inquiry → booked showing",
    body: "Caller saw your Zillow listing. We qualify (financing, timeline, area), pull their preferred slot, and drop the showing into your calendar before they hang up.",
  },
  {
    title: "Seller inquiry → CMA scheduled",
    body: "Homeowner thinking of listing. We capture address, motivation, timeline — and book a CMA with you for a time you actually have free.",
  },
  {
    title: "FSBO / cold opportunity → routed",
    body: "Out-of-area, FSBO, or vendor call? We answer, log the contact, and either route to you or send a polite decline so your phone is never the bottleneck.",
  },
];

const TIERS = [
  { name: "Solo", price: "$99", per: "/month", best: "1 agent", calls: "250 calls/mo included" },
  { name: "Team", price: "$299", per: "/month", best: "2–10 agents", calls: "750 calls/mo included" },
  { name: "Brokerage", price: "$899", per: "/month", best: "Office line + up to 50 agents", calls: "2,500 calls/mo included" },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <motion.section
        className="mb-24"
        initial="hidden"
        animate="show"
        variants={staggerContainer}
      >
        <motion.div variants={fadeUp} className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.08em] uppercase text-[#2DD4BF]/70 mb-6">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-[#2DD4BF] opacity-40" style={{ animation: "ring-pulse 2s ease-out infinite" }} />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2DD4BF]" />
          </span>
          Built for real estate, not retrofitted
        </motion.div>

        <motion.h1
          variants={fadeUp}
          className="text-[clamp(2.8rem,6vw,5rem)] font-extrabold tracking-[-0.035em] leading-[1.02] text-white max-w-4xl"
        >
          Every Zillow lead, answered <span className="text-[#2DD4BF]">before they call the next agent.</span>
        </motion.h1>
        <motion.p
          variants={fadeUp}
          className="mt-7 text-[18px] text-[#A0A0AB] max-w-2xl leading-relaxed font-medium"
        >
          A voice AI receptionist built for Realtors using Follow Up Boss, kvCORE, Sierra Interactive, and BoomTown.
          Answers every call, qualifies the lead, books the showing — flat monthly, no per-minute math.
        </motion.p>

        <motion.div variants={fadeUp} className="mt-10 flex flex-wrap items-center gap-4">
          <Link
            href="/demo"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#2DD4BF] hover:bg-[#5EEAD4] text-[#07070A] text-[15px] font-bold tracking-[-0.01em] transition-all hover:shadow-[0_0_30px_rgba(45,212,191,0.25)]"
          >
            Talk to Mia — live demo
          </Link>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-[#1A1A1F] hover:border-[#2DD4BF]/30 text-[#A0A0AB] hover:text-white text-[15px] font-semibold transition-colors"
          >
            See pricing
          </Link>
        </motion.div>
      </motion.section>

      {/* Workflows */}
      <motion.section
        className="mb-24"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
      >
        <motion.h2 variants={fadeUp} className="text-[28px] font-bold tracking-[-0.02em] text-white mb-10">
          Three workflows. Real estate, not generic SaaS.
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {WORKFLOWS.map((w, i) => (
            <motion.div
              key={i}
              variants={cardVariant}
              className="card-glow p-6 rounded-2xl border border-[#1A1A1F] bg-[#0E0E12]"
            >
              <div className="text-[11px] font-bold tracking-[0.1em] uppercase text-[#2DD4BF]/60 mb-3">
                Workflow {i + 1}
              </div>
              <h3 className="text-[17px] font-bold text-white mb-3 leading-tight">{w.title}</h3>
              <p className="text-[14px] text-[#6B6B76] leading-relaxed">{w.body}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Integrations */}
      <motion.section
        className="mb-24"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
      >
        <motion.div variants={fadeUp} className="mb-3 text-[11px] font-bold tracking-[0.1em] uppercase text-[#2DD4BF]/60">
          Native, not Zapier
        </motion.div>
        <motion.h2 variants={fadeUp} className="text-[28px] font-bold tracking-[-0.02em] text-white mb-3">
          Drops into the CRMs Realtors actually use.
        </motion.h2>
        <motion.p variants={fadeUp} className="text-[15px] text-[#6B6B76] max-w-xl mb-10">
          Bidirectional sync — leads land in your existing pipeline, showings book into your existing calendar.
        </motion.p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {CRMS.map((crm) => (
            <motion.div key={crm.name} variants={cardVariant}>
              <Link
                href={`/integrations/${crm.name.toLowerCase().replace(/\s+/g, "-")}`}
                className="card-glow block p-4 rounded-xl border border-[#1A1A1F] bg-[#0E0E12] hover:border-[#2DD4BF]/30 transition-colors text-center"
              >
                <div className="text-[14px] font-bold text-white">{crm.short}</div>
                <div className="text-[11px] text-[#44444D] mt-1">{crm.name}</div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Pricing teaser */}
      <motion.section
        className="mb-24"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
      >
        <motion.h2 variants={fadeUp} className="text-[28px] font-bold tracking-[-0.02em] text-white mb-3">
          Flat monthly pricing. No per-minute meter.
        </motion.h2>
        <motion.p variants={fadeUp} className="text-[15px] text-[#6B6B76] max-w-xl mb-10">
          30-day money-back if we don&rsquo;t book at least 5 showings. Cancel anytime.
        </motion.p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {TIERS.map((t) => (
            <motion.div
              key={t.name}
              variants={cardVariant}
              className="card-glow p-7 rounded-2xl border border-[#1A1A1F] bg-[#0E0E12]"
            >
              <div className="text-[12px] font-bold tracking-[0.1em] uppercase text-[#2DD4BF]/60 mb-4">{t.name}</div>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-[42px] font-extrabold text-white tracking-[-0.02em]">{t.price}</span>
                <span className="text-[15px] text-[#6B6B76] font-medium">{t.per}</span>
              </div>
              <div className="text-[13px] text-[#A0A0AB] mb-2">{t.best}</div>
              <div className="text-[12px] text-[#44444D]">{t.calls}</div>
            </motion.div>
          ))}
        </div>
        <motion.div variants={fadeUp} className="mt-8">
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 text-[14px] font-semibold text-[#2DD4BF] hover:text-[#5EEAD4]"
          >
            See full pricing details &rarr;
          </Link>
        </motion.div>
      </motion.section>
    </>
  );
}
