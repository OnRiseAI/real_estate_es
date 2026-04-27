import { Redis } from "@upstash/redis";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const runtime = "nodejs";

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT_URL,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
});

const R2_BUCKET = process.env.R2_BUCKET || "voiceaireceptionists-recordings";

export async function GET(request, { params }) {
  const { sessionId } = await params;
  if (!sessionId) {
    return Response.json({ error: "Missing sessionId" }, { status: 400 });
  }

  let raw;
  try {
    raw = await redis.get(`call:${sessionId}`);
  } catch (err) {
    console.error("[RECORDINGS] KV read failed", err);
    return Response.json({ error: "Storage unavailable" }, { status: 502 });
  }
  if (!raw) {
    return Response.json({ error: "Session not found" }, { status: 404 });
  }

  let record;
  try {
    record = typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch {
    return Response.json({ error: "Corrupt record" }, { status: 500 });
  }

  const recordingKey = record?.recording_key || `recordings/${sessionId}.ogg`;

  if (
    !process.env.R2_ACCESS_KEY_ID ||
    !process.env.R2_SECRET_ACCESS_KEY ||
    !process.env.R2_ENDPOINT_URL
  ) {
    return Response.json(
      { error: "R2 credentials not configured on server" },
      { status: 500 }
    );
  }

  let signedUrl;
  try {
    signedUrl = await getSignedUrl(
      s3,
      new GetObjectCommand({ Bucket: R2_BUCKET, Key: recordingKey }),
      { expiresIn: 600 }
    );
  } catch (err) {
    console.error("[RECORDINGS] Sign URL failed", err);
    return Response.json({ error: "Failed to generate URL" }, { status: 502 });
  }

  return Response.redirect(signedUrl, 302);
}
