"use client";

import { motion } from "framer-motion";
import Link from "next/link";

function PhoneIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

export default function SharedLayout({ children }) {
  return (
    <div className="min-h-screen relative">
      {/* Background gradient glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 70% 50% at 50% -5%, rgba(45, 212, 191, 0.06) 0%, transparent 70%)",
        }}
      />

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="sticky top-0 z-50 bg-[#07070A]/80 backdrop-blur-xl border-b border-[#141418]"
      >
        <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#2DD4BF] to-[#0D9488] flex items-center justify-center">
              <PhoneIcon className="w-4 h-4 text-[#07070A]" />
            </div>
            <span className="text-[17px] font-bold tracking-[-0.01em] text-white">
              VoiceAI<span className="text-[#2DD4BF]">Receptionist</span>
            </span>
          </Link>
          <div className="hidden sm:flex items-center gap-6">
            <Link href="/pricing" className="text-[13px] font-semibold text-[#A0A0AB] hover:text-white transition-colors">Pricing</Link>
            <Link href="/integrations" className="text-[13px] font-semibold text-[#A0A0AB] hover:text-white transition-colors">Integrations</Link>
            <Link href="/demo" className="text-[13px] font-semibold text-[#07070A] bg-[#2DD4BF] hover:bg-[#5EEAD4] px-4 py-2 rounded-lg transition-colors">Try the demo</Link>
          </div>
        </div>
      </motion.header>

      {/* Main */}
      <main className="relative z-10 px-6 py-16 md:py-24">
        <div className="max-w-[1200px] mx-auto">
          {children}
        </div>
      </main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="relative z-10 border-t border-[#111116] mt-20"
      >
        <div className="max-w-[1200px] mx-auto px-6 py-8 flex items-center justify-between flex-wrap gap-4">
          <span className="text-[13px] font-bold text-[#2A2A30]">VoiceAIReceptionist</span>
          <div className="flex items-center gap-6 text-[11px] text-[#2A2A30] font-medium">
            <Link href="/pricing" className="hover:text-[#6B6B76] transition-colors">Pricing</Link>
            <Link href="/integrations" className="hover:text-[#6B6B76] transition-colors">Integrations</Link>
            <Link href="/blog" className="hover:text-[#6B6B76] transition-colors">Blog</Link>
            <Link href="/contact" className="hover:text-[#6B6B76] transition-colors">Contact</Link>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}
