// Audience-specific landing pages — same product, different framing per buyer.

export const AUDIENCES = [
  {
    slug: "solo-agents",
    name: "Solo Realtors",
    seoTitle: "AI Voice Receptionist for Solo Realtors — Never Miss a Lead Alone",
    headline: "Built for the agent who is the team.",
    sub: "You're showing, you're prospecting, you're driving. Mia is your back office — answering every call, qualifying every lead, booking every showing into your calendar.",
    pain: "When you're solo, every missed call is a missed commission. There's no front desk. There's no team lead to cover you. There's just your phone — and the next agent the buyer calls.",
    fits: [
      "You're the only person on your business — no admin, no ISA, no receptionist",
      "You buy Zillow / Realtor.com / Homes.com leads and miss most of the live calls",
      "You use Follow Up Boss, kvCORE, Sierra, BoomTown, CINC, or Lofty",
      "Your sphere-of-influence calls outside business hours and you can't always pick up",
    ],
    tier: { name: "Solo", price: "$99/mo" },
  },
  {
    slug: "teams",
    name: "Real estate teams",
    seoTitle: "AI Receptionist for Real Estate Teams — Lead Routing + Speed-to-Lead",
    headline: "One voice agent. The whole team's calls. Routed to the right person.",
    sub: "Mia answers, qualifies, and routes — to the agent who owns the listing, the lead pod, or the next person up on the round-robin. Per-agent calendar sync, per-agent CRM seat, broker-level reporting.",
    pain: "Team leaders solve the same problem every Monday: who answered what call, who's owed what credit, why did Bob's lead get routed to Sarah. Mia removes the routing math by doing it consistently every time.",
    fits: [
      "You run a 2-10 agent team under a brokerage",
      "You buy paid leads at the team level and split them by rules",
      "Your agents share a CRM (or want to) but each works their own pipeline",
      "You want a centralized view of every call without micromanaging",
    ],
    tier: { name: "Team", price: "$299/mo" },
  },
  {
    slug: "brokerages",
    name: "Brokerages",
    seoTitle: "AI Voice Receptionist for Brokerages — Office Line + Per-Agent Coverage",
    headline: "The office line that never sends a buyer to voicemail.",
    sub: "Your published office number rings. Mia answers in your brokerage's voice — books the right agent, transfers the urgent calls, logs the rest. Plus per-agent Personal AI coverage for the team you choose to roll out to.",
    pain: "Most brokerage office lines field walk-in calls during the day, voicemail at night. Mia covers both — and gives you a broker-level dashboard showing which agents are converting voice leads (and which aren't).",
    fits: [
      "You run an independent or franchise brokerage with 10–50 agents",
      "Your published office number gets meaningful inbound from drive-by + paid traffic",
      "You want to roll out per-agent voice AI selectively (not force it on everyone)",
      "You need broker-level reporting on lead source attribution and per-agent conversion",
    ],
    tier: { name: "Brokerage", price: "$899/mo" },
  },
];

export function findAudience(slug) {
  return AUDIENCES.find((a) => a.slug === slug) || null;
}
