import { AccessToken } from "livekit-server-sdk";

export const runtime = "nodejs";

export async function POST(req) {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const livekitUrl = process.env.LIVEKIT_URL;

  if (!apiKey || !apiSecret || !livekitUrl) {
    return Response.json(
      { error: "LiveKit env vars missing on server" },
      { status: 500 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const roomName = body.room_name || `realtor-demo-${Date.now()}`;
  const identity = body.participant_identity || `caller-${Date.now()}`;
  const participantName = body.participant_name || "Demo Caller";
  const businessName = (body.business_name || "").toString().trim().slice(0, 120);
  const callerLocalHour = Number.isInteger(body.caller_local_hour)
    && body.caller_local_hour >= 0
    && body.caller_local_hour <= 23
      ? body.caller_local_hour
      : null;

  const at = new AccessToken(apiKey, apiSecret, {
    identity,
    name: participantName,
    ttl: "10m",
  });

  at.addGrant({
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  });

  // Per-session data travels on the agent dispatch — read via ctx.job.metadata.
  const metaPayload = {};
  if (businessName) metaPayload.business_name = businessName;
  if (callerLocalHour !== null) metaPayload.caller_local_hour = callerLocalHour;
  const dispatchMetadata = Object.keys(metaPayload).length
    ? JSON.stringify(metaPayload)
    : "";

  at.roomConfig = {
    agents: [{ agentName: "Mia_Real_Estate", metadata: dispatchMetadata }],
  };

  return Response.json({
    serverUrl: livekitUrl,
    participantToken: await at.toJwt(),
    roomName,
    personalized: Boolean(businessName),
  });
}
