"use client";

import { motion } from "framer-motion";
import { useState } from "react";

export default function ContactPage() {
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [errMsg, setErrMsg] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("sending");
    const data = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setStatus("sent");
      e.currentTarget.reset();
    } catch (err) {
      setStatus("error");
      setErrMsg(err?.message || "Something went wrong");
    }
  }

  return (
    <section className="max-w-xl mx-auto py-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <h1 className="text-[clamp(2rem,4.5vw,3.2rem)] font-extrabold tracking-[-0.03em] leading-[1.05] text-white">
          Talk to a human.
        </h1>
        <p className="mt-4 text-[16px] text-[#A0A0AB] leading-relaxed">
          For onboarding, integrations, brokerage rollouts, or anything else.
          We respond within one business day &mdash; usually faster, because that&rsquo;s our whole product pitch.
        </p>
      </motion.div>

      <motion.form
        onSubmit={handleSubmit}
        className="mt-10 space-y-4"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      >
        <Field label="Your name" name="name" required />
        <Field label="Email" name="email" type="email" required />
        <Field label="Phone (optional)" name="phone" type="tel" />
        <Field label="Brokerage / team name" name="company" />
        <Field label="CRM you use" name="crm" placeholder="e.g. Follow Up Boss, kvCORE, Sierra Interactive" />
        <Field label="What's on your mind?" name="message" textarea required />

        {status === "sent" ? (
          <div className="p-4 rounded-xl bg-[#2DD4BF]/10 border border-[#2DD4BF]/30 text-[14px] text-[#2DD4BF]">
            Got it. We&rsquo;ll be in touch within one business day.
          </div>
        ) : (
          <button
            type="submit"
            disabled={status === "sending"}
            className="w-full px-6 py-4 rounded-xl bg-[#2DD4BF] hover:bg-[#5EEAD4] disabled:bg-[#1A1A1F] disabled:text-[#6B6B76] text-[#07070A] text-[15px] font-bold tracking-[-0.01em] transition-all hover:shadow-[0_0_30px_rgba(45,212,191,0.25)]"
          >
            {status === "sending" ? "Sending…" : "Send"}
          </button>
        )}
        {status === "error" && (
          <div className="text-[12px] text-[#F87171]">Couldn&rsquo;t send: {errMsg}. Try again or email hello@voiceaireceptionists.com</div>
        )}
      </motion.form>
    </section>
  );
}

function Field({ label, name, type = "text", required = false, placeholder = "", textarea = false }) {
  return (
    <label className="block">
      <span className="block text-[12px] font-semibold text-[#A0A0AB] mb-2">{label}{required && <span className="text-[#2DD4BF] ml-1">*</span>}</span>
      {textarea ? (
        <textarea
          name={name}
          required={required}
          placeholder={placeholder}
          rows={5}
          className="w-full px-4 py-3 rounded-xl border border-[#1A1A1F] bg-[#0E0E12] focus:border-[#2DD4BF]/50 focus:outline-none text-[14px] text-white placeholder-[#44444D] transition-colors"
        />
      ) : (
        <input
          type={type}
          name={name}
          required={required}
          placeholder={placeholder}
          className="w-full px-4 py-3 rounded-xl border border-[#1A1A1F] bg-[#0E0E12] focus:border-[#2DD4BF]/50 focus:outline-none text-[14px] text-white placeholder-[#44444D] transition-colors"
        />
      )}
    </label>
  );
}
