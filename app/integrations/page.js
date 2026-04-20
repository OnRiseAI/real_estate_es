"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { CRMS } from "../lib/crms";

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } } };
const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } } };
const card = { hidden: { opacity: 0, y: 16, scale: 0.97 }, show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } } };

export default function IntegrationsIndex() {
  return (
    <>
      <motion.section className="mb-16" initial="hidden" animate="show" variants={stagger}>
        <motion.div variants={fadeUp} className="text-[11px] font-bold tracking-[0.12em] uppercase text-[#2DD4BF]/70 mb-5">
          Native, not Zapier
        </motion.div>
        <motion.h1 variants={fadeUp} className="text-[clamp(2.4rem,5vw,4rem)] font-extrabold tracking-[-0.035em] leading-[1.05] text-white max-w-3xl">
          The CRMs Realtors actually use.<br/><span className="text-[#2DD4BF]">Wired in directly.</span>
        </motion.h1>
        <motion.p variants={fadeUp} className="mt-6 text-[17px] text-[#A0A0AB] max-w-2xl leading-relaxed">
          Mia writes to your real estate CRM the same way you would — leads, intent, timeline, budget, booked showings.
          No CSVs. No middleman automation step that breaks every two weeks.
        </motion.p>
      </motion.section>

      <motion.section
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.1 }}
        variants={stagger}
      >
        {CRMS.map((crm) => (
          <motion.div key={crm.slug} variants={card}>
            <Link
              href={`/integrations/${crm.slug}`}
              className="card-glow block p-7 rounded-2xl border border-[#1A1A1F] bg-[#0E0E12] hover:border-[#2DD4BF]/30 transition-colors h-full"
            >
              <div className="flex items-baseline justify-between mb-4">
                <h2 className="text-[20px] font-bold text-white">{crm.name}</h2>
                <span className="text-[11px] font-bold tracking-[0.12em] uppercase text-[#2DD4BF]/60">{crm.short}</span>
              </div>
              <p className="text-[14px] text-[#A0A0AB] leading-relaxed mb-5">{crm.pitch}</p>
              <span className="text-[13px] font-semibold text-[#2DD4BF]">See the integration &rarr;</span>
            </Link>
          </motion.div>
        ))}
      </motion.section>

      <motion.section
        className="mt-16 p-6 rounded-2xl border border-dashed border-[#1A1A1F] text-center"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-[14px] text-[#6B6B76]">
          Don&rsquo;t see your CRM?{" "}
          <Link href="/contact" className="text-[#2DD4BF] font-semibold hover:text-[#5EEAD4]">
            Tell us what you use
          </Link>{" "}
          — we&rsquo;ve added integrations in under two weeks for top-volume teams.
        </p>
      </motion.section>
    </>
  );
}
