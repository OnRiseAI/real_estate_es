import { Redis } from "@upstash/redis";
import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";

export const runtime = "nodejs";
export const maxDuration = 60;

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const SUMMARY_MODEL = process.env.SUMMARY_MODEL || "gpt-4.1-mini";
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

async function extract(transcript) {
  if (!openai) return { summary: null, language: null, context: null };
  const formatted = formatTranscriptForPrompt(transcript);
  if (!formatted || formatted.length < 20) {
    return {
      summary:
        "Caller hung up almost immediately — no meaningful conversation to summarize.",
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
            "You analyze post-call transcripts for a voice AI receptionist named Mia. " +
            "Return JSON with EXACTLY these keys: " +
            "(1) `summary` — 1-2 sentence neutral paragraph (who, what they wanted, concrete details). No bullets. " +
            "(2) `language` — caller's primary language as ISO 639-1 uppercase (EN, ES, FR, DE, IT, PT, NL, ZH, JA, KO, ID, TR, RU, HI). Default EN if unclear. " +
            "(3) `context` — TIGHT one-line topic snippet, max 40 chars, title case (e.g. '3-bed villa, Mijas'). null if nothing concrete. " +
            "Output ONLY JSON.",
        },
        { role: "user", content: `Transcript:\n\n${formatted}` },
      ],
    });
    const content = response.choices?.[0]?.message?.content?.trim() || "{}";
    const parsed = JSON.parse(content);
    return {
      summary: typeof parsed.summary === "string" ? parsed.summary.trim() : null,
      language:
        typeof parsed.language === "string"
          ? parsed.language.trim().toUpperCase().slice(0, 3)
          : null,
      context:
        typeof parsed.context === "string"
          ? parsed.context.trim().slice(0, 60)
          : null,
    };
  } catch (err) {
    console.error("[BACKFILL] Extraction failed", err);
    return { summary: null, language: null, context: null };
  }
}

async function fetchAllCalls() {
  const out = [];
  let cursor = "0";
  do {
    const result = await redis.scan(cursor, { match: "call:*", count: 200 });
    cursor = String(result?.[0] ?? "0");
    const keys = result?.[1] ?? [];
    if (keys.length === 0) continue;
    const values = await Promise.all(keys.map((k) => redis.get(k)));
    for (let i = 0; i < keys.length; i++) {
      const raw = values[i];
      if (!raw) continue;
      try {
        const rec = typeof raw === "string" ? JSON.parse(raw) : raw;
        out.push({ key: keys[i], rec });
      } catch {
        /* skip */
      }
    }
  } while (cursor !== "0");
  return out;
}

export async function POST(request) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const force = !!body?.force;

  let entries;
  try {
    entries = await fetchAllCalls();
  } catch (err) {
    console.error("[BACKFILL] KV scan failed", err);
    return Response.json({ error: "KV scan failed" }, { status: 500 });
  }

  const stats = { total: entries.length, processed: 0, skipped: 0, errors: 0 };

  for (const { key, rec } of entries) {
    const needsBackfill =
      force ||
      !rec?.language ||
      !rec?.context ||
      !rec?.summary ||
      typeof rec?.status !== "string";

    if (!needsBackfill) {
      stats.skipped++;
      continue;
    }
    if (!Array.isArray(rec?.transcript) || rec.transcript.length === 0) {
      // Nothing to extract from — at minimum, ensure status is set.
      const updated = { ...rec, status: rec.status || "new" };
      try {
        await redis.set(key, JSON.stringify(updated), { ex: KV_TTL_SECONDS });
        stats.processed++;
      } catch {
        stats.errors++;
      }
      continue;
    }

    try {
      const { summary, language, context } = await extract(rec.transcript);
      const updated = {
        ...rec,
        summary: summary || rec.summary || null,
        language: language || rec.language || "EN",
        context: context || rec.context || null,
        status: rec.status || "new",
      };
      await redis.set(key, JSON.stringify(updated), { ex: KV_TTL_SECONDS });
      stats.processed++;
    } catch (err) {
      console.error("[BACKFILL] Failed for", key, err);
      stats.errors++;
    }
  }

  return Response.json({ ok: true, stats });
}

export async function GET() {
  return Response.json({
    info: "POST to this endpoint (Clerk-authed) to backfill missing language/context/summary/status on existing call records.",
  });
}
