"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import LiveKitDemo from "../components/LiveKitDemo";

export default function DemoPage() {
  return (
    <section className="max-w-2xl mx-auto py-12">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="text-center mb-10"
      >
        <h1 className="text-[clamp(2rem,4.5vw,3.2rem)] font-extrabold tracking-[-0.03em] leading-[1.05] text-white">
          Talk to <span className="text-[#2DD4BF]">Mia</span>
        </h1>
        <p className="mt-4 text-[15px] text-[#A0A0AB] leading-relaxed max-w-lg mx-auto">
          Mia is the AI receptionist for &ldquo;Sunbelt Realty&rdquo; — a fictional Austin agent we set up for the demo.
          Speak as a buyer asking about a Zillow listing, or a seller wanting a CMA. Mia will qualify you and book a showing.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      >
        <LiveKitDemo />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-12 text-center"
      >
        <h2 className="text-[15px] font-semibold text-white mb-4">Things to try</h2>
        <ul className="text-[13px] text-[#6B6B76] space-y-2">
          <li>&ldquo;Hi, I saw your listing on Maple Street. Can I see it tomorrow at 5?&rdquo;</li>
          <li>&ldquo;I&rsquo;m thinking of selling my house in 78704. Can someone give me a value?&rdquo;</li>
          <li>&ldquo;I&rsquo;m pre-approved up to $650K and want to look this weekend.&rdquo;</li>
        </ul>
        <Link
          href="/"
          className="inline-flex items-center gap-2 mt-8 text-[14px] font-semibold text-[#2DD4BF] hover:text-[#5EEAD4]"
        >
          &larr; Back to homepage
        </Link>
      </motion.div>
    </section>
  );
}
