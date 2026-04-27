"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
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

// Film-grain noise overlay — tiny inline SVG, no network request.
const GRAIN_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.35 0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`
)}`;

const PROMPTS = [
  "Hi, I saw your villa listing in Estepona. Can I arrange a viewing on Thursday?",
  "I'm thinking of selling my apartment in Benahavís. Can someone give me a valuation?",
  "I have approval for €1.2 million and I'm flying over from London this weekend.",
];

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

export default function DemoPage() {
  const [businessName, setBusinessName] = useState("");
  const trimmed = businessName.trim();
  const displayName = trimmed || "Coastline Estates";

  return (
    <div className="relative" style={{ background: PALETTE.cream, color: PALETTE.ink }}>
      {/* Film grain */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35] mix-blend-multiply"
        style={{ backgroundImage: `url("${GRAIN_SVG}")` }}
      />
      {/* Warm edge glows */}
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

      <div className="relative max-w-[960px] mx-auto px-6 md:px-10 py-20 md:py-28">
        {/* Heading */}
        <motion.section
          className="mb-14 text-center max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="mb-6">
            <SectionLabel color={PALETTE.terracotta}>Live demo · Voice Receptionist</SectionLabel>
          </div>
          <h1
            className={`${SERIF} text-[clamp(2.6rem,5.5vw,4.4rem)] leading-[1] tracking-[-0.025em]`}
            style={{ color: PALETTE.ink, fontWeight: 500 }}
          >
            Talk to{" "}
            <span style={{ fontStyle: "italic", color: PALETTE.sea }}>Mia</span>.
          </h1>
          <p
            className="mt-6 text-[17px] leading-[1.65] max-w-lg mx-auto"
            style={{ color: PALETTE.inkSoft }}
          >
            Type your brokerage name below and Mia will greet as if she worked
            there. Leave it blank for <em>Coastline Estates</em>.
          </p>
        </motion.section>

        {/* Business name input */}
        <motion.section
          className="mb-10 max-w-xl mx-auto"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <label className="block">
            <div className="mb-3">
              <SectionLabel>Your brokerage name</SectionLabel>
            </div>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g. Sol & Mar Properties"
              maxLength={120}
              className={`${SERIF} w-full bg-transparent border-0 border-b-[1.5px] text-[24px] md:text-[28px] leading-[1.3] tracking-[-0.01em] py-3 focus:outline-none transition-colors`}
              style={{
                color: PALETTE.ink,
                borderColor: trimmed ? PALETTE.terracotta : PALETTE.rule,
                fontWeight: 400,
              }}
            />
          </label>
          <div className="mt-3 h-5">
            {trimmed && (
              <div
                className="text-[12px] font-semibold tracking-[0.08em] uppercase"
                style={{ color: PALETTE.terracotta }}
              >
                Mia will answer as &ldquo;{trimmed}&rdquo;
              </div>
            )}
          </div>
        </motion.section>

        {/* Phone call demo */}
        <motion.section
          className="mb-20 flex justify-center"
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <PhoneCallDemo businessName={displayName} agentName="Mia" />
        </motion.section>

        {/* Things to try */}
        <motion.section
          className="mb-16 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="text-center mb-8">
            <SectionLabel>Things to try</SectionLabel>
          </div>
          <ul className="space-y-0">
            {PROMPTS.map((p, i) => (
              <li
                key={i}
                className="grid grid-cols-[auto_1fr] gap-6 md:gap-10 py-6 md:py-7"
                style={{
                  borderTop: `1px solid ${PALETTE.rule}`,
                  ...(i === PROMPTS.length - 1
                    ? { borderBottom: `1px solid ${PALETTE.rule}` }
                    : {}),
                }}
              >
                <div
                  className={`${SERIF} text-[32px] leading-[0.9] tracking-[-0.02em]`}
                  style={{ color: PALETTE.terracotta, fontWeight: 400 }}
                >
                  {String(i + 1).padStart(2, "0")}
                </div>
                <p
                  className={`${SERIF} text-[18px] md:text-[20px] leading-[1.45] tracking-[-0.005em]`}
                  style={{ color: PALETTE.ink, fontWeight: 400, fontStyle: "italic" }}
                >
                  <span style={{ color: PALETTE.terracotta, fontStyle: "normal" }}>“</span>
                  {p}
                  <span style={{ color: PALETTE.terracotta, fontStyle: "normal" }}>”</span>
                </p>
              </li>
            ))}
          </ul>
        </motion.section>

        {/* Back link */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[14px] font-semibold underline underline-offset-[6px] decoration-1"
            style={{ color: PALETTE.sea }}
          >
            ← Back to home
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
