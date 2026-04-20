"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function DemoPage() {
  return (
    <section className="max-w-2xl mx-auto text-center py-20">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#2DD4BF]/10 border border-[#2DD4BF]/20 text-[11px] font-bold tracking-[0.08em] uppercase text-[#2DD4BF] mb-8"
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full rounded-full bg-[#2DD4BF] opacity-40" style={{ animation: "ring-pulse 2s ease-out infinite" }} />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2DD4BF]" />
        </span>
        Live demo coming online
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="text-[clamp(2.2rem,5vw,3.6rem)] font-extrabold tracking-[-0.03em] leading-[1.05] text-white"
      >
        Talk to <span className="text-[#2DD4BF]">Mia</span> — your demo Realtor&rsquo;s receptionist.
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="mt-6 text-[16px] text-[#A0A0AB] leading-relaxed"
      >
        The live in-browser demo plugs in here. Mia will qualify a buyer or seller call, gather contact details, and book a showing into a calendar. No phone call needed — speak from your browser.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="mt-10 p-12 rounded-3xl border border-dashed border-[#2DD4BF]/30 bg-[#0E0E12]"
      >
        <div className="text-[13px] text-[#6B6B76] font-medium">
          LiveKit-powered demo agent wires in here — Phase 3 of the build.
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 mt-6 text-[14px] font-semibold text-[#2DD4BF] hover:text-[#5EEAD4]"
        >
          &larr; Back to homepage
        </Link>
      </motion.div>
    </section>
  );
}
