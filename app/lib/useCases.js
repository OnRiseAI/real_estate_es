// Source of truth for use-case landing pages. Each entry powers /use-cases/[slug].

export const USE_CASES = [
  {
    slug: "missed-call-automation",
    title: "Missed call automation for Realtors",
    seoTitle: "Missed Call Automation for Real Estate — Recover Every Lost Lead",
    keyword: "missed call automation real estate",
    hook: "40% of real estate calls go unanswered. The first agent to call back almost always wins the lead.",
    sub: "When your phone is ringing while you're showing a house, Mia answers, qualifies, and books — turning every missed call into either a logged lead or a booked showing.",
    pillars: [
      { h: "Answers in under one ring", b: "Mia picks up before the third ring even on your busiest day. No 'sorry I missed you' callbacks 4 hours later." },
      { h: "Qualifies on the call", b: "Captures intent, timeline, budget, financing, and area of interest — so you call back warm or skip cold leads entirely." },
      { h: "Writes back to your CRM", b: "Lead lands in Follow Up Boss / kvCORE / Sierra / BoomTown with full context. Your follow-up workflows fire automatically." },
    ],
  },
  {
    slug: "after-hours-answering",
    title: "After-hours answering for real estate teams",
    seoTitle: "24/7 After-Hours Answering Service for Realtors & Brokerages",
    keyword: "after hours answering service realtors",
    hook: "Buyers call after they leave the open house. Your phone is on silent. They call the next agent.",
    sub: "Mia covers nights, weekends, and the showing-after-showing dead zones. Same brand voice. Same CRM. Zero late-night phone juggling.",
    pillars: [
      { h: "True 24/7 coverage", b: "No 'business hours.' Mia works at 2 AM, on Sundays, during showings, and on Christmas Day." },
      { h: "Sounds like a member of your team", b: "Trained on your scripts, your area, your inventory. Callers don't get a robot voice menu." },
      { h: "Hands off the right calls", b: "Hot leads get an instant SMS to your cell. Vendor and cold calls get a polite log-and-decline." },
    ],
  },
  {
    slug: "speed-to-lead",
    title: "Speed-to-lead for Zillow and Realtor.com leads",
    seoTitle: "Speed-to-Lead Voice AI — Answer Every Zillow Lead in Under 60 Seconds",
    keyword: "speed to lead real estate AI",
    hook: "78% of Zillow buyers go with the first agent who responds. Most agents take 47 minutes.",
    sub: "When a paid lead calls — Zillow, Realtor.com, Homes.com, your IDX — Mia answers in under one ring, qualifies, and books a showing before they call the next name on the list.",
    pillars: [
      { h: "Sub-1-second answer time", b: "Mia is always available. The next agent on the buyer's list never gets the chance." },
      { h: "Qualifies the lead, not just the contact", b: "Pre-approved? Cash? Investor? Flake? Mia asks the questions you'd ask, gates accordingly." },
      { h: "Books showings into your calendar", b: "Live calendar lookup. No 'someone will call you back.' The showing is on your calendar before the call ends." },
    ],
  },
  {
    slug: "zillow-realtor-com-leads",
    title: "Mia for Zillow + Realtor.com inbound calls",
    seoTitle: "AI Receptionist for Zillow & Realtor.com Inbound Leads",
    keyword: "Zillow Realtor.com lead automation AI",
    hook: "You're paying $200-$1,000 per lead. Then you miss the call. Then the lead is gone.",
    sub: "Mia is the safety net for every paid lead source. She answers the call your media spend earned — qualifies, books, and writes the lead back into your CRM.",
    pillars: [
      { h: "Pays for itself in one rescued lead", b: "One booked showing from a previously-missed Zillow lead covers the full month." },
      { h: "Source-attributes the call", b: "Lead lands in your CRM tagged Zillow / Realtor.com / Google Ads — your reporting stays clean." },
      { h: "Honors your existing routing", b: "Round-robin in BoomTown? Solo in FUB? Team rules in kvCORE? Mia respects them all." },
    ],
  },
  {
    slug: "ai-isa-for-realtors",
    title: "AI Inside Sales Agent (ISA) for Realtors",
    seoTitle: "AI ISA for Realtors — The 24/7 Inside Sales Agent That Doesn't Quit",
    keyword: "AI ISA real estate",
    hook: "Human ISAs cost $3,000–$5,000/month, work 40 hours, and quit every 9 months. Mia costs less than your gym membership and never calls in sick.",
    sub: "Mia handles the inbound qualification + outbound follow-up tasks an ISA does — at flat monthly pricing, with full CRM integration, and no recruiting cycle.",
    pillars: [
      { h: "Qualifies inbound like a trained ISA", b: "Same questions, same scripts, same intent gating — without the salary or the turnover." },
      { h: "Triggers your existing nurture cadence", b: "When Mia logs a lead in FUB / kvCORE, your text + email drip campaigns fire automatically." },
      { h: "Hands hot leads to you in real time", b: "Cash buyer ready this weekend? Instant SMS to your phone. You take the call — Mia handed you a teed-up appointment." },
    ],
  },
];

export function findUseCase(slug) {
  return USE_CASES.find((u) => u.slug === slug) || null;
}
