# realestate.voiceaireceptionists.com

A niched-down marketing + live demo site for a voice AI receptionist built specifically for US real estate agents. First vertical of a planned `voiceaireceptionists.com` multi-subdomain product family (`dental.*`, `restaurants.*`, etc. to follow).

**Status:** Phase 1 scaffold complete (homepage, pricing, demo placeholder). LiveKit demo agent + remaining marketing pages in progress.

## Stack
- Next.js 16.1 (App Router) + React 19 + Tailwind v4 + Framer Motion
- LiveKit Cloud for the in-browser voice demo (Python agent runtime + WebRTC frontend)
- Vercel for hosting

## Local dev
```bash
cp .env.local.example .env.local   # then fill in LiveKit keys
npm install
npm run dev                         # http://localhost:3000
```

## Build plan
See `~/.claude/plans/unified-questing-brooks.md` for the full 6-phase build plan.
Strategic context: `C:/Users/usuario/Desktop/RealEstate_research/output/synthesis.md`.

## Repo conventions
- All marketing copy avoids "AI Receptionist for Real Estate" / "Never Miss a Lead" / "AI Answering Service" — these phrases are saturated across 8+ competitors. Differentiate on specificity (Realtor / brokerage / FUB / kvCORE) and the money-back guarantee.
- Brand voice: quietly confident. Not bro-sales, not stiff-corporate.
- Pricing: flat monthly tiers (Solo $99, Team $299, Brokerage $899). Per-minute math is explicitly killed; per-call overage is fine print, not the headline.
