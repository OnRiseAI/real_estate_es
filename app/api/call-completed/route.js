import { Redis } from "@upstash/redis";
import OpenAI from "openai";

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const SUMMARY_MODEL = process.env.SUMMARY_MODEL || "gpt-4.1-mini";
// Match the R2 lifecycle (90-day auto-delete) so KV record + recording expire together.
const KV_TTL_SECONDS = 60 * 60 * 24 * 90;

function formatTranscriptForPrompt(transcript) {
  if (!Array.isArray(transcript)) return "";
  return transcript
    .map((turn) => {
      const role =
        turn?.role === "user"
          ? "CALLER"
          : turn?.role === "assistant"
          ? "MIA"
          : (turn?.role || "?").toUpperCase();
      const text = String(turn?.text ?? "").trim();
      return text ? `${role}: ${text}` : "";
    })
    .filter(Boolean)
    .join("\n");
}

async function generateSummary(transcript) {
  if (!openai) {
    return null;
  }
  const formatted = formatTranscriptForPrompt(transcript);
  if (!formatted || formatted.length < 20) {
    return "Caller hung up almost immediately — no meaningful conversation to summarize.";
  }

  try {
    const response = await openai.chat.completions.create({
      model: SUMMARY_MODEL,
      temperature: 0.3,
      max_tokens: 220,
      messages: [
        {
          role: "system",
          content:
            "You write concise post-call summaries for a voice AI receptionist named Mia. The receptionist demos for visitors evaluating Mia for their own business. Write a single 1-2 sentence paragraph (no bullets) capturing: who the caller appears to be, what they wanted to know about, and any concrete details they mentioned (location, timeline, business type, specific feature interest). Be neutral and factual. If the caller barely engaged, say so briefly. Never start with 'The caller' twice; vary openings naturally.",
        },
        {
          role: "user",
          content: `Conversation transcript:\n\n${formatted}`,
        },
      ],
    });
    const content = response.choices?.[0]?.message?.content?.trim() || null;
    return content;
  } catch (err) {
    console.error("[CALL COMPLETED] Summary generation failed", err);
    return null;
  }
}

export async function POST(request) {
  let payload;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const { session_id, room_name, duration_sec, transcript, recording_key, egress_id } =
    payload || {};
  if (!session_id) {
    return Response.json(
      { ok: false, error: "Missing session_id" },
      { status: 400 }
    );
  }

  console.log(
    "[CALL COMPLETED]",
    JSON.stringify({
      session_id,
      room_name,
      duration_sec,
      transcript_turns: Array.isArray(transcript) ? transcript.length : 0,
      recording_key: recording_key || null,
      egress_id: egress_id || null,
    })
  );

  const summary = await generateSummary(transcript);

  const record = {
    session_id,
    room_name: room_name || null,
    duration_sec: typeof duration_sec === "number" ? duration_sec : null,
    summary: summary || null,
    transcript: Array.isArray(transcript) ? transcript : [],
    recording_key: recording_key || null,
    egress_id: egress_id || null,
    stored_at: new Date().toISOString(),
  };

  try {
    await redis.set(`call:${session_id}`, JSON.stringify(record), {
      ex: KV_TTL_SECONDS,
    });
  } catch (err) {
    console.error("[CALL COMPLETED] KV write failed", err);
    return Response.json(
      { ok: false, error: "Storage write failed" },
      { status: 500 }
    );
  }

  return Response.json({ ok: true, summary_generated: !!summary });
}
