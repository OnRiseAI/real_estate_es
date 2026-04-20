"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import JsonLd, { PRODUCT_OFFERS, PRICING_FAQ } from "../components/JsonLd";

const TIERS = [
  {
    name: "Solo",
    price: "$99",
    per: "/month",
    best: "1 agent",
    calls: "250 calls/mo included",
    overage: "$0.50/call after",
    features: [
      "All CRMs (FUB, kvCORE, Sierra, BoomTown, CINC, Lofty)",
      "24/7 answering",
      "Calendar booking",
      "Live in-browser demo",
      "Email + SMS notifications",
    ],
  },
  {
    name: "Team",
    price: "$299",
    per: "/month",
    best: "2–10 agents",
    calls: "750 calls/mo included",
    overage: "$0.40/call after",
    featured: true,
    features: [
      "Everything in Solo",
      "Team dashboard",
      "Per-agent lead routing",
      "Per-agent calendar sync",
      "Call review + transcript search",
    ],
  },
  {
    name: "Brokerage",
    price: "$899",
    per: "/month",
    best: "Office line + up to 50 agents",
    calls: "2,500 calls/mo included",
    overage: "$0.30/call after",
    features: [
      "Everything in Team",
      "Office front-desk number",
      "Broker reporting dashboard",
      "Dedicated CSM",
      "White-label option",
    ],
  },
];

const FAQS = [
  {
    q: "What happens if we exceed the included calls?",
    a: "You only pay the per-call overage listed in your tier. No surprise per-minute charges. Most agents never hit the cap — we sized it that way.",
  },
  {
    q: "How does the money-back guarantee work?",
    a: "If we don't book at least 5 qualified showings in your first 30 days, we refund the full month. No forms, no hoops — just email us.",
  },
  {
    q: "Do you really integrate natively with Follow Up Boss / kvCORE?",
    a: "Yes — bidirectional sync, not a Zapier middleman. Leads land in your existing pipeline; showings book into your existing calendar. We add Sierra, BoomTown, CINC, and Lofty during onboarding.",
  },
  {
    q: "What if Mia can't answer a question?",
    a: "She transfers warmly to you (or to your fallback number) and texts you the caller's context so you're not starting cold.",
  },
  {
    q: "Can I listen back to calls?",
    a: "Every call is recorded and transcribed. Search by caller name, address, or topic. Owner of the lead gets a digest by email every morning.",
  },
  {
    q: "Will it sound like AI?",
    a: "Run the live demo and decide. We use Cartesia Sonic-3 for voice — most callers don't realize until they're told.",
  },
];

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

export default function PricingPage() {
  return (
    <>
      <JsonLd data={PRODUCT_OFFERS} />
      <JsonLd data={PRICING_FAQ} />

      <motion.section
        className="text-center mb-16"
        initial="hidden"
        animate="show"
        variants={staggerContainer}
      >
        <motion.h1
          variants={fadeUp}
          className="text-[clamp(2.4rem,5vw,4rem)] font-extrabold tracking-[-0.035em] leading-[1.02] text-white"
        >
          Flat monthly pricing. No per-minute math.
        </motion.h1>
        <motion.p
          variants={fadeUp}
          className="mt-6 text-[17px] text-[#A0A0AB] max-w-2xl mx-auto leading-relaxed"
        >
          Cancel anytime. 30-day money-back if we don&rsquo;t book at least 5 qualified showings in your first month.
        </motion.p>
      </motion.section>

      <motion.section
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-20"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.1 }}
        variants={staggerContainer}
      >
        {TIERS.map((tier) => (
          <motion.div
            key={tier.name}
            variants={fadeUp}
            className={`p-7 rounded-2xl border bg-[#0E0E12] ${
              tier.featured ? "border-[#2DD4BF]/40 shadow-[0_0_40px_rgba(45,212,191,0.08)]" : "border-[#1A1A1F]"
            }`}
          >
            {tier.featured && (
              <div className="text-[10px] font-bold tracking-[0.12em] uppercase text-[#2DD4BF] mb-3">
                Most popular
              </div>
            )}
            <div className="text-[12px] font-bold tracking-[0.1em] uppercase text-[#A0A0AB] mb-4">
              {tier.name}
            </div>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-[48px] font-extrabold text-white tracking-[-0.025em]">{tier.price}</span>
              <span className="text-[16px] text-[#6B6B76] font-medium">{tier.per}</span>
            </div>
            <div className="text-[14px] text-[#A0A0AB] mb-1">{tier.best}</div>
            <div className="text-[13px] text-[#6B6B76] mb-1">{tier.calls}</div>
            <div className="text-[12px] text-[#44444D] mb-6">{tier.overage}</div>

            <Link
              href="/demo"
              className={`block w-full text-center px-5 py-3 rounded-xl text-[14px] font-bold transition-all ${
                tier.featured
                  ? "bg-[#2DD4BF] hover:bg-[#5EEAD4] text-[#07070A] hover:shadow-[0_0_30px_rgba(45,212,191,0.25)]"
                  : "border border-[#1A1A1F] hover:border-[#2DD4BF]/30 text-white"
              }`}
            >
              Try the live demo
            </Link>

            <ul className="mt-6 space-y-2.5">
              {tier.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-[13px] text-[#A0A0AB]">
                  <svg className="w-4 h-4 mt-0.5 text-[#2DD4BF] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </motion.section>

      <motion.section
        className="max-w-3xl mx-auto p-8 rounded-2xl border border-[#2DD4BF]/20 bg-[#0E0E12] mb-20 text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-[11px] font-bold tracking-[0.12em] uppercase text-[#2DD4BF] mb-3">
          The guarantee
        </div>
        <h2 className="text-[24px] font-bold text-white mb-3">
          5 booked showings in 30 days, or your money back.
        </h2>
        <p className="text-[15px] text-[#A0A0AB] leading-relaxed">
          We win when you win. If our AI doesn&rsquo;t book at least 5 qualified showings into your calendar in the first 30 days,
          email us and we&rsquo;ll refund the full month. No forms, no friction.
        </p>
      </motion.section>

      <motion.section
        className="max-w-3xl mx-auto"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.1 }}
        variants={staggerContainer}
      >
        <motion.h2 variants={fadeUp} className="text-[28px] font-bold tracking-[-0.02em] text-white mb-10 text-center">
          Frequently asked
        </motion.h2>
        <div className="space-y-3">
          {FAQS.map((faq) => (
            <motion.details
              key={faq.q}
              variants={fadeUp}
              className="group p-5 rounded-xl border border-[#1A1A1F] bg-[#0E0E12] open:border-[#2DD4BF]/20"
            >
              <summary className="flex items-center justify-between cursor-pointer list-none">
                <span className="text-[15px] font-semibold text-white pr-4">{faq.q}</span>
                <svg className="w-5 h-5 text-[#6B6B76] group-open:rotate-180 transition-transform flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </summary>
              <p className="mt-3 text-[14px] text-[#A0A0AB] leading-relaxed">{faq.a}</p>
            </motion.details>
          ))}
        </div>
      </motion.section>
    </>
  );
}
