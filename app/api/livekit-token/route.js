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
  const brand = (body.brand || "").toString().slice(0, 200);
  const brief = (body.brief || "").toString().slice(0, 6000);

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

  // Per-session data rides on the agent dispatch so the Python agent can read
  // it via ctx.job.metadata in entrypoint.
  const dispatchMetadata = brief ? JSON.stringify({ brand, brief }) : "";

  at.roomConfig = {
    agents: [{ agentName: "mia-realtor", metadata: dispatchMetadata }],
  };

  return Response.json({
    serverUrl: livekitUrl,
    participantToken: await at.toJwt(),
    roomName,
    personalized: Boolean(brief),
  });
}
