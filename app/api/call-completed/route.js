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

async function generateExtraction(transcript) {
  if (!openai) {
    return { summary: null, language: null, context: null };
  }
  const formatted = formatTranscriptForPrompt(transcript);
  if (!formatted || formatted.length < 20) {
    return {
      summary: "Caller hung up almost immediately — no meaningful conversation to summarize.",
      language: "EN",
      context: null,
    };
  }

  try {
    const response = await openai.chat.completions.create({
      model: SUMMARY_MODEL,
      temperature: 0.3,
      max_tokens: 320,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You analyze post-call transcripts for a voice AI receptionist named Mia. Mia takes calls for real-estate / hospitality / dental / similar businesses. For each transcript, return a JSON object with EXACTLY these three keys: " +
            "(1) `summary` — a single 1-2 sentence paragraph in neutral natural English capturing who the caller appears to be, what they wanted, and any concrete details (location, timeline, business type, specific feature interest). No bullets. Vary openings naturally. " +
            "(2) `language` — the caller's primary spoken language as an ISO 639-1 uppercase code (EN, ES, FR, DE, IT, PT, NL, ZH, JA, KO, ID, TR, RU, HI). Default to EN if unclear. " +
            "(3) `context` — a TIGHT one-line property-or-topic snippet, max 40 chars, in title case, e.g., '3-bed villa, Mijas' or 'Crown lengthening consult' or 'Sunday booking, party of 8'. Just the concrete thing they were calling about. If the caller didn't say anything specific, return null. " +
            "If the caller barely engaged, summary still describes that briefly, language is EN, context is null. " +
            "Output ONLY the JSON object, nothing else.",
        },
        {
          role: "user",
          content: `Transcript:\n\n${formatted}`,
        },
      ],
    });
    const content = response.choices?.[0]?.message?.content?.trim() || "{}";
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (err) {
      console.error("[CALL COMPLETED] Failed to parse extraction JSON", err, content);
      return { summary: null, language: null, context: null };
    }
    const summary = typeof parsed.summary === "string" ? parsed.summary.trim() : null;
    const language = typeof parsed.language === "string"
      ? parsed.language.trim().toUpperCase().slice(0, 3)
      : null;
    const context = typeof parsed.context === "string"
      ? parsed.context.trim().slice(0, 60)
      : null;
    return { summary, language, context };
  } catch (err) {
    console.error("[CALL COMPLETED] Extraction failed", err);
    return { summary: null, language: null, context: null };
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

  const { summary, language, context } = await generateExtraction(transcript);

  const record = {
    session_id,
    room_name: room_name || null,
    duration_sec: typeof duration_sec === "number" ? duration_sec : null,
    summary: summary || null,
    language: language || "EN",
    context: context || null,
    transcript: Array.isArray(transcript) ? transcript : [],
    recording_key: recording_key || null,
    egress_id: egress_id || null,
    status: "new",
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

  return Response.json({
    ok: true,
    summary_generated: !!summary,
    language,
    context,
  });
}
