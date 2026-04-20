# Mia — LiveKit Agent

Voice AI receptionist runtime for `voiceaireceptionist.com`. Joins LiveKit rooms when dispatched, handles inbound buyer/seller calls, books showings, and (in production) writes to the agent's CRM.

## Local dev

```bash
cd agents
uv sync
uv run realtor_receptionist.py download-files   # one-time silero VAD weights
cp ../.env.local .env.local                      # share LiveKit creds
uv run realtor_receptionist.py dev              # run locally, joins your LK Cloud
```

## Deploy to LiveKit Cloud

```bash
lk agent deploy
```

Agent name registered in LiveKit Cloud: **`realtor-receptionist`**. The Next.js token endpoint at `/api/livekit-token` dispatches this agent into every demo room via `RoomConfiguration.agents`.

## Stub tools (replace for production)

| Tool | Stub returns | Production wiring |
|---|---|---|
| `schedule_showing` | Logs and returns success string | Calendly / Google Calendar / FUB calendar API |
| `qualify_lead` | Logs lead intent | Follow Up Boss / kvCORE lead create endpoint |
| `transfer_to_human` | Returns transfer message (no actual transfer) | LiveKit SIP transfer or PSTN handoff |
| `send_followup_sms` | Logs SMS payload | Telnyx / Twilio messaging API |

## Models (per `~/.agents/skills/livekit-agents/SKILL.md`)

- STT: `deepgram/flux-general`
- LLM: `openai/gpt-5-mini` (start small, swap to `gpt-5.3-chat-latest` only if reasoning ceiling is hit)
- TTS: `cartesia/sonic-3` (voice ID `9626c31c-bec5-4cca-baa8-f8ba9e84c8bc` — placeholder, swap when we pick Mia's voice)
