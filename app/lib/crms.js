// Source of truth for CRM landing pages. Each entry powers /integrations/[slug].
// When adding a CRM, no other file changes — sitemap + index page pick it up.

export const CRMS = [
  {
    slug: "follow-up-boss",
    name: "Follow Up Boss",
    short: "FUB",
    pitch: "The Realtor's lead-management workhorse. Every Zillow, Realtor.com, and IDX lead lands in your FUB pipeline with our integration — already qualified.",
    headline: "Voice AI built for Follow Up Boss.",
    sub: "Mia answers your calls, qualifies the lead, and writes the contact, intent, timeline, and budget straight into your FUB pipeline — before they hang up.",
    syncs: [
      { what: "Inbound caller becomes a new FUB person", how: "Auto-created with name, phone, and source = 'Voice AI'" },
      { what: "Qualification answers map to FUB custom fields", how: "Timeline, budget, financing, area of interest" },
      { what: "Booked showing creates a FUB appointment", how: "On the agent's calendar, with notes from the call" },
      { what: "Call recording attached to the contact", how: "Full transcript searchable in FUB" },
    ],
  },
  {
    slug: "kvcore",
    name: "kvCORE",
    short: "kvCORE",
    pitch: "Inside Real Estate's all-in-one platform powers tens of thousands of teams. Our integration writes voice-captured leads directly into kvCORE Smart CRM with full context.",
    headline: "Voice AI for kvCORE — without the Zapier middleman.",
    sub: "Direct API integration with kvCORE Smart CRM. Mia logs the lead, the conversation, and the booked showing — and triggers your Smart Numbers + Smart Drips automatically.",
    syncs: [
      { what: "New lead in kvCORE Smart CRM", how: "Source-tagged 'Voice AI', routed by your existing rules" },
      { what: "Behavioral score updated", how: "High-intent callers get the priority score they earned" },
      { what: "Smart Drip campaigns fire", how: "Auto-enrolled based on intent (buyer / seller / renter)" },
      { what: "Showing → Smart Calendar", how: "Booked into the agent's calendar with property + caller details" },
    ],
  },
  {
    slug: "sierra-interactive",
    name: "Sierra Interactive",
    short: "Sierra",
    pitch: "Sierra runs the back office for many of the highest-producing teams. Our integration treats Sierra as the system of record — voice leads land like any other channel.",
    headline: "Voice AI that writes back to Sierra Interactive.",
    sub: "Mia hands every qualified call to Sierra: contact created, source tagged, follow-up plan triggered, showing on the calendar. No CSV imports, no manual cleanup.",
    syncs: [
      { what: "Voice lead → Sierra contact", how: "Pushed live with name, phone, email, source = Voice AI" },
      { what: "Action plan triggered", how: "Your existing Sierra plan fires based on intent type" },
      { what: "Property of interest captured", how: "MLS lookup attempted by address mentioned on call" },
      { what: "Agent notification", how: "SMS + email to the assigned agent the moment Mia hangs up" },
    ],
  },
  {
    slug: "boomtown",
    name: "BoomTown",
    short: "BoomTown",
    pitch: "BoomTown's predictive CRM runs many of the largest brokerages. Our integration plugs into the lead-distribution and follow-up engine like any first-party source.",
    headline: "Voice AI that respects BoomTown's playbook.",
    sub: "Mia routes voice-captured leads through BoomTown's existing distribution rules. Your team responds in BoomTown the same way they always have — Mia just made the lead show up.",
    syncs: [
      { what: "Lead created in BoomTown", how: "Routed via your existing distribution and round-robin rules" },
      { what: "Lead category set", how: "A / B / C scoring inferred from qualification answers" },
      { what: "Tasks generated", how: "Standard BoomTown follow-up tasks queue immediately" },
      { what: "Call summary on the contact", how: "Three-line summary + full transcript link" },
    ],
  },
  {
    slug: "cinc",
    name: "CINC",
    short: "CINC",
    pitch: "CINC powers high-volume lead generation for big teams. Our integration converts CINC's website + paid traffic into actually-answered phone leads.",
    headline: "Voice AI for CINC teams who refuse to miss a call.",
    sub: "Mia picks up the calls your CINC paid traffic earns. Qualification, contact creation, and showing booking all happen inside CINC — no parallel CRM to maintain.",
    syncs: [
      { what: "New CINC lead from voice channel", how: "Marked source = Voice AI, attributed to original ad if call origin known" },
      { what: "Drip + email campaigns triggered", how: "Auto-enrolled in your CINC nurture based on intent" },
      { what: "Agent SMS alert", how: "Assigned agent texted with hot-lead summary" },
      { what: "Showing booked", how: "Added to the CINC calendar with property + caller context" },
    ],
  },
  {
    slug: "lofty",
    name: "Lofty",
    short: "Lofty",
    pitch: "Lofty (formerly Chime) is the AI-forward CRM for modern teams. Our voice AI is a natural complement to Lofty's automation — we capture the call Lofty's text/email can't.",
    headline: "Voice AI that finishes what Lofty starts.",
    sub: "Lofty's automations bring leads in. Mia answers when they call you back — qualifying, routing, and booking the showing directly inside Lofty.",
    syncs: [
      { what: "Lofty lead created", how: "From any inbound voice call, source-tagged Voice AI" },
      { what: "Smart Plans triggered", how: "Mia's qualification picks the right Lofty Smart Plan automatically" },
      { what: "Tasks + reminders", how: "Created in Lofty for the assigned agent, prioritized by intent" },
      { what: "Call insights", how: "Sentiment + intent summary attached to the contact" },
    ],
  },
];

export function findCrm(slug) {
  return CRMS.find((c) => c.slug === slug) || null;
}
