import { Redis } from "@upstash/redis";
import { auth } from "@clerk/nextjs/server";

export const runtime = "nodejs";

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

const ALLOWED = new Set(["new", "pending", "called_back"]);
const TTL = 60 * 60 * 24 * 90;

export async function POST(request, { params }) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { sessionId } = await params;
  if (!sessionId) {
    return Response.json({ error: "Missing sessionId" }, { status: 400 });
  }
  let payload;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const status = payload?.status;
  if (!ALLOWED.has(status)) {
    return Response.json({ error: "Invalid status" }, { status: 400 });
  }

  let raw;
  try {
    raw = await redis.get(`call:${sessionId}`);
  } catch (err) {
    console.error("[STATUS] KV read failed", err);
    return Response.json({ error: "Storage unavailable" }, { status: 502 });
  }
  if (!raw) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  let record;
  try {
    record = typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch {
    return Response.json({ error: "Corrupt record" }, { status: 500 });
  }

  record.status = status;
  record.status_updated_at = new Date().toISOString();
  record.status_updated_by = userId;

  try {
    await redis.set(`call:${sessionId}`, JSON.stringify(record), { ex: TTL });
  } catch (err) {
    console.error("[STATUS] KV write failed", err);
    return Response.json({ error: "Storage write failed" }, { status: 502 });
  }

  return Response.json({ ok: true, status });
}
