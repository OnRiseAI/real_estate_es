"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { USE_CASES } from "../lib/useCases";

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } } };
const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } } };
const card = { hidden: { opacity: 0, y: 16, scale: 0.97 }, show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } } };

export default function UseCasesIndex() {
  return (
    <>
      <motion.section className="mb-16" initial="hidden" animate="show" variants={stagger}>
        <motion.div variants={fadeUp} className="text-[11px] font-bold tracking-[0.12em] uppercase text-[#2DD4BF]/70 mb-5">
          Use cases
        </motion.div>
        <motion.h1 variants={fadeUp} className="text-[clamp(2.4rem,5vw,4rem)] font-extrabold tracking-[-0.035em] leading-[1.05] text-white max-w-3xl">
          Built for the call you&rsquo;re missing <span className="text-[#2DD4BF]">right now.</span>
        </motion.h1>
        <motion.p variants={fadeUp} className="mt-6 text-[17px] text-[#A0A0AB] max-w-2xl leading-relaxed">
          Mia handles the workflows that cost Realtors most: missed calls, after-hours leads, paid-traffic speed-to-lead, and ISA qualification.
        </motion.p>
      </motion.section>

      <motion.section
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.1 }}
        variants={stagger}
      >
        {USE_CASES.map((u) => (
          <motion.div key={u.slug} variants={card}>
            <Link
              href={`/use-cases/${u.slug}`}
              className="card-glow block p-7 rounded-2xl border border-[#1A1A1F] bg-[#0E0E12] hover:border-[#2DD4BF]/30 transition-colors h-full"
            >
              <h2 className="text-[19px] font-bold text-white mb-3 leading-tight">{u.title}</h2>
              <p className="text-[14px] text-[#A0A0AB] leading-relaxed mb-5">{u.hook}</p>
              <span className="text-[13px] font-semibold text-[#2DD4BF]">Read the playbook &rarr;</span>
            </Link>
          </motion.div>
        ))}
      </motion.section>
    </>
  );
}
