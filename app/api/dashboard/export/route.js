import { Redis } from "@upstash/redis";
import { auth } from "@clerk/nextjs/server";

export const runtime = "nodejs";

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

function csvEscape(v) {
  if (v === null || v === undefined) return "";
  const s = String(v);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

async function fetchAllCalls() {
  const records = [];
  let cursor = "0";
  do {
    const result = await redis.scan(cursor, { match: "call:*", count: 200 });
    cursor = String(result?.[0] ?? "0");
    const keys = result?.[1] ?? [];
    if (keys.length === 0) continue;
    const values = await Promise.all(keys.map((k) => redis.get(k)));
    for (const raw of values) {
      if (!raw) continue;
      try {
        records.push(typeof raw === "string" ? JSON.parse(raw) : raw);
      } catch {
        /* skip */
      }
    }
  } while (cursor !== "0");
  return records;
}

export async function GET(request) {
  // Gate via Clerk — only signed-in users can export.
  const { userId } = await auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const url = new URL(request.url);
  const rangeParam = parseInt(url.searchParams.get("range") || "30", 10);
  const range = [7, 30, 90].includes(rangeParam) ? rangeParam : 30;
  const cutoff = Date.now() - range * 24 * 60 * 60 * 1000;

  let records = [];
  try {
    records = await fetchAllCalls();
  } catch (err) {
    console.error("[EXPORT] KV scan failed", err);
    return new Response("Internal error", { status: 500 });
  }

  const inRange = records.filter(
    (r) => new Date(r?.stored_at || 0).getTime() >= cutoff
  );
  inRange.sort(
    (a, b) =>
      new Date(b?.stored_at || 0).getTime() -
      new Date(a?.stored_at || 0).getTime()
  );

  const headers = [
    "captured_at",
    "session_id",
    "name",
    "business",
    "email",
    "phone",
    "language",
    "duration_sec",
    "status",
    "context",
    "summary",
    "recording_url",
  ];

  const baseUrl =
    process.env.DASHBOARD_BASE_URL || "https://app.voiceaireceptionists.com";

  const lines = [headers.join(",")];
  for (const r of inRange) {
    const lead = r?.lead || {};
    lines.push(
      [
        r?.stored_at || "",
        r?.session_id || "",
        lead.name || "",
        lead.business || "",
        lead.email || "",
        lead.phone || "",
        r?.language || "",
        r?.duration_sec ?? "",
        r?.status || "new",
        r?.context || "",
        r?.summary || "",
        r?.session_id
          ? `${baseUrl}/calls/${encodeURIComponent(r.session_id)}`
          : "",
      ]
        .map(csvEscape)
        .join(",")
    );
  }

  const today = new Date().toISOString().slice(0, 10);
  const filename = `voiceaireceptionists-calls-${range}d-${today}.csv`;

  return new Response(lines.join("\n"), {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
