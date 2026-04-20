"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } } };

export default function AboutPage() {
  return (
    <motion.section
      className="max-w-2xl mx-auto py-8"
      initial="hidden"
      animate="show"
      variants={stagger}
    >
      <motion.h1 variants={fadeUp} className="text-[clamp(2rem,4.5vw,3.2rem)] font-extrabold tracking-[-0.03em] leading-[1.05] text-white">
        Built by people who&rsquo;ve shipped voice AI for thousands of inbound calls.
      </motion.h1>

      <motion.p variants={fadeUp} className="mt-6 text-[16px] text-[#A0A0AB] leading-relaxed">
        We&rsquo;ve spent the last two years deploying production voice AI agents for high-call-volume businesses &mdash;
        auto dealerships, service centers, and after-hours coverage for teams that can&rsquo;t afford to miss a call.
        Real estate is the niche that asked for it the loudest.
      </motion.p>

      <motion.h2 variants={fadeUp} className="mt-12 text-[20px] font-bold text-white">
        Why one site per industry
      </motion.h2>
      <motion.p variants={fadeUp} className="mt-3 text-[15px] text-[#A0A0AB] leading-relaxed">
        Generic AI receptionist platforms can do real estate. They can also do dental, restaurants, and pet groomers.
        That&rsquo;s the problem &mdash; the agent that does everything is great at nothing.
        We build one site, one product, one prompt, one integration set per industry.
        For Realtors, that means native Follow Up Boss / kvCORE / Sierra / BoomTown integrations on day one,
        and an agent who understands what &ldquo;pre-approved&rdquo; means without being told.
      </motion.p>

      <motion.h2 variants={fadeUp} className="mt-12 text-[20px] font-bold text-white">
        How we&rsquo;re different
      </motion.h2>
      <motion.ul variants={fadeUp} className="mt-3 space-y-2 text-[15px] text-[#A0A0AB] leading-relaxed">
        <li>&middot; <span className="text-white font-semibold">Flat monthly pricing.</span> No per-minute meter, no &ldquo;talk to sales&rdquo; pricing pages.</li>
        <li>&middot; <span className="text-white font-semibold">Native CRM integrations</span> (not Zapier middleware that breaks every two weeks).</li>
        <li>&middot; <span className="text-white font-semibold">A live in-browser demo</span> &mdash; you can hear Mia before you ever talk to a salesperson.</li>
        <li>&middot; <span className="text-white font-semibold">A money-back guarantee.</span> 5 booked showings in 30 days or your full month back.</li>
      </motion.ul>

      <motion.div variants={fadeUp} className="mt-12">
        <Link
          href="/demo"
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#2DD4BF] hover:bg-[#5EEAD4] text-[#07070A] text-[15px] font-bold transition-all hover:shadow-[0_0_30px_rgba(45,212,191,0.25)]"
        >
          Hear Mia in 90 seconds &rarr;
        </Link>
      </motion.div>
    </motion.section>
  );
}
