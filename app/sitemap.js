import { CRMS } from "./lib/crms";
import { USE_CASES } from "./lib/useCases";
import { AUDIENCES } from "./lib/audiences";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://realestate.voiceaireceptionists.com";

export default function sitemap() {
  const now = new Date();

  const fixed = [
    { url: `${BASE}/`, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE}/pricing`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/demo`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/integrations`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/use-cases`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/about`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${BASE}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
  ];

  const integrations = CRMS.map((c) => ({
    url: `${BASE}/integrations/${c.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const useCases = USE_CASES.map((u) => ({
    url: `${BASE}/use-cases/${u.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const audiences = AUDIENCES.map((a) => ({
    url: `${BASE}/for/${a.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...fixed, ...integrations, ...useCases, ...audiences];
}
