export const runtime = "nodejs";

const N8N_WEBHOOK = process.env.CONTACT_N8N_WEBHOOK_URL;

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "invalid json" }, { status: 400 });
  }

  if (!body?.email || !body?.message) {
    return Response.json({ error: "email and message required" }, { status: 400 });
  }

  // Forward to n8n if configured. If not, log and accept.
  if (N8N_WEBHOOK) {
    try {
      const res = await fetch(N8N_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "realestate.voiceaireceptionists.com/contact",
          submittedAt: new Date().toISOString(),
          ...body,
        }),
      });
      if (!res.ok) {
        console.error("n8n webhook returned non-OK", res.status);
      }
    } catch (err) {
      console.error("n8n webhook failed", err);
    }
  } else {
    console.log("[contact] (no webhook configured)", body);
  }

  return Response.json({ ok: true });
}
