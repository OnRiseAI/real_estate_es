import { Resend } from "resend";
import { Redis } from "@upstash/redis";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

const FROM_ADDRESS =
  process.env.LEAD_FROM_EMAIL || "Mia <onboarding@resend.dev>";
const TO_ADDRESS = process.env.LEAD_NOTIFY_TO;
const REPLY_TO = process.env.LEAD_REPLY_TO || "jon@onrise.ai";
const DASHBOARD_BASE =
  process.env.DASHBOARD_BASE_URL || "https://app.voiceaireceptionists.com";

const SUMMARY_POLL_TIMEOUT_MS = 10_000;
const SUMMARY_POLL_INTERVAL_MS = 750;

function escapeHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function isLikelyEmail(s) {
  if (typeof s !== "string") return false;
  const trimmed = s.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchCallRecord(sessionId) {
  if (!sessionId) return null;
  try {
    const raw = await redis.get(`call:${sessionId}`);
    if (!raw) return null;
    if (typeof raw === "string") {
      try {
        return JSON.parse(raw);
      } catch {
        return null;
      }
    }
    return raw;
  } catch (err) {
    console.error("[LEAD CAPTURE] KV read failed", err);
    return null;
  }
}

async function pollForCallRecord(sessionId, timeoutMs, intervalMs) {
  if (!sessionId) return null;
  const deadline = Date.now() + timeoutMs;
  let record = await fetchCallRecord(sessionId);
  while (!record?.summary && Date.now() < deadline) {
    await sleep(intervalMs);
    record = await fetchCallRecord(sessionId);
  }
  return record;
}

function formatDuration(durationSec) {
  if (typeof durationSec !== "number") return "—";
  return `${Math.floor(durationSec / 60)}:${String(durationSec % 60).padStart(2, "0")}`;
}

function buildInternalEmail(payload, callRecord) {
  const { name, business, email, phone, duration_sec, page_url, captured_at, livekit_session_id } =
    payload;
  const dur = formatDuration(duration_sec);
  const summary = callRecord?.summary || null;
  const dashboardUrl = livekit_session_id
    ? `${DASHBOARD_BASE}/calls/${encodeURIComponent(livekit_session_id)}`
    : null;

  const subject = `New demo lead — ${escapeHtml(name)} at ${escapeHtml(business)}`;

  const summaryBlockHtml = summary
    ? `
  <div style="margin:0 0 24px;padding:18px 20px;background:#F5EFE4;border-left:3px solid #C85A3C;border-radius:6px">
    <div style="font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#C85A3C;margin-bottom:8px">Call summary</div>
    <div style="font-size:14px;line-height:1.55;color:#1B1E28">${escapeHtml(summary)}</div>
  </div>`
    : "";

  const summaryBlockText = summary ? `\n\nCALL SUMMARY\n${summary}\n` : "";

  const html = `
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#1B1E28">
  <div style="font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#C85A3C;margin-bottom:8px">New demo lead</div>
  <h1 style="font-family:Fraunces,Georgia,serif;font-size:28px;font-weight:600;margin:0 0 24px;color:#1B1E28">${escapeHtml(name)} · ${escapeHtml(business)}</h1>

  ${summaryBlockHtml}

  <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
    <tr><td style="padding:8px 0;color:#6B6258;width:140px;font-size:13px">Name</td><td style="padding:8px 0;font-size:14px;font-weight:500">${escapeHtml(name)}</td></tr>
    <tr><td style="padding:8px 0;color:#6B6258;font-size:13px">Business</td><td style="padding:8px 0;font-size:14px;font-weight:500">${escapeHtml(business)}</td></tr>
    <tr><td style="padding:8px 0;color:#6B6258;font-size:13px">Email</td><td style="padding:8px 0;font-size:14px;font-weight:500"><a href="mailto:${escapeHtml(email)}" style="color:#C85A3C;text-decoration:none">${escapeHtml(email)}</a></td></tr>
    <tr><td style="padding:8px 0;color:#6B6258;font-size:13px">Phone</td><td style="padding:8px 0;font-size:14px;font-weight:500"><a href="tel:${escapeHtml(phone)}" style="color:#C85A3C;text-decoration:none">${escapeHtml(phone)}</a></td></tr>
    <tr><td style="padding:8px 0;color:#6B6258;font-size:13px">Demo duration</td><td style="padding:8px 0;font-size:14px;font-weight:500">${dur}</td></tr>
    <tr><td style="padding:8px 0;color:#6B6258;font-size:13px">Page</td><td style="padding:8px 0;font-size:13px"><a href="${escapeHtml(page_url)}" style="color:#1B4965">${escapeHtml(page_url)}</a></td></tr>
    <tr><td style="padding:8px 0;color:#6B6258;font-size:13px">Captured</td><td style="padding:8px 0;font-size:13px;color:#6B6258">${escapeHtml(captured_at)}</td></tr>
  </table>

  <div style="padding:16px;background:#F5EFE4;border-radius:8px;font-size:13px;color:#6B6258;line-height:1.5">
    They tried Mia for ${dur} and asked to be called back. Reach out within 24 hours.
  </div>

  ${
    dashboardUrl
      ? `<div style="margin-top:24px;text-align:center">
    <a href="${escapeHtml(dashboardUrl)}" style="display:inline-block;padding:12px 22px;background:#A6472E;color:#F5EFE4;text-decoration:none;font-weight:700;font-size:13px;letter-spacing:0.04em;border-radius:24px">
      🎧 Listen to the call →
    </a>
  </div>`
      : ""
  }
</div>`.trim();

  const text = `New demo lead\n\n${name} · ${business}${summaryBlockText}\n\nEmail: ${email}\nPhone: ${phone}\nDemo duration: ${dur}\nPage: ${page_url}\nCaptured: ${captured_at}\n\nThey tried Mia for ${dur} and asked to be called back. Reach out within 24 hours.${
    dashboardUrl ? `\n\nListen to the call: ${dashboardUrl}` : ""
  }`;

  return { subject, html, text };
}

function buildProspectEmail(payload, callRecord) {
  const { name, business, duration_sec } = payload;
  const dur = formatDuration(duration_sec);
  const summary = callRecord?.summary || null;
  const transcript = Array.isArray(callRecord?.transcript)
    ? callRecord.transcript
    : [];

  const subject = summary
    ? `Your conversation with Mia · ${dur}`
    : `Thanks for trying Mia, ${name}`;

  const transcriptHtml =
    transcript.length > 0
      ? `
  <div style="margin:24px 0 0;padding:0">
    <div style="font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#C85A3C;margin-bottom:14px">Transcript</div>
    ${transcript
      .map((turn) => {
        const isMia = turn?.role === "assistant";
        const speaker = isMia ? "Mia" : name || "You";
        const speakerColor = isMia ? "#C85A3C" : "#1B4965";
        const text = escapeHtml(String(turn?.text ?? "").trim());
        if (!text) return "";
        return `
    <div style="margin-bottom:14px;padding-left:14px;border-left:2px solid ${speakerColor}">
      <div style="font-size:11px;font-weight:700;color:${speakerColor};margin-bottom:4px;letter-spacing:0.04em">${escapeHtml(speaker)}</div>
      <div style="font-size:14px;line-height:1.55;color:#1B1E28">${text}</div>
    </div>`;
      })
      .join("")}
  </div>`
      : "";

  const transcriptText =
    transcript.length > 0
      ? `\n\n--- TRANSCRIPT ---\n${transcript
          .map((turn) => {
            const speaker =
              turn?.role === "assistant" ? "Mia" : name || "You";
            const text = String(turn?.text ?? "").trim();
            return text ? `${speaker}: ${text}` : "";
          })
          .filter(Boolean)
          .join("\n\n")}`
      : "";

  const summaryHtml = summary
    ? `
  <div style="margin:24px 0;padding:18px 20px;background:#F5EFE4;border-left:3px solid #C85A3C;border-radius:6px">
    <div style="font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#C85A3C;margin-bottom:8px">Summary</div>
    <div style="font-size:14px;line-height:1.55;color:#1B1E28">${escapeHtml(summary)}</div>
  </div>`
    : "";

  const intro = summary
    ? `Hi ${escapeHtml(name)}, thanks for taking Mia for a spin. Here&rsquo;s a recap of your ${dur} conversation, plus the full transcript below. If this is the kind of receptionist you&rsquo;d want answering calls for ${escapeHtml(business)}, just hit reply — I&rsquo;ll get back to you within 24 hours.`
    : `Hi ${escapeHtml(name)}, thanks for taking Mia for a spin. We&rsquo;re processing the recap of your conversation now. In the meantime, if you&rsquo;d like to talk through how Mia could answer calls for ${escapeHtml(business)}, just hit reply — I&rsquo;ll get back to you within 24 hours.`;

  const html = `
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:580px;margin:0 auto;padding:32px 24px;color:#1B1E28;background:#FFFFFF">
  <div style="font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#C85A3C;margin-bottom:10px">Your call recap</div>
  <h1 style="font-family:Fraunces,Georgia,serif;font-size:30px;font-weight:600;margin:0 0 18px;color:#1B1E28;letter-spacing:-0.01em">Thanks${escapeHtml(name) ? `, ${escapeHtml(name)}` : ""}.</h1>

  <p style="font-size:15px;line-height:1.6;color:#3a3530;margin:0 0 8px">${intro}</p>

  ${summaryHtml}
  ${transcriptHtml}

  <div style="margin-top:32px;padding-top:20px;border-top:1px solid #E3D6BE;font-size:12px;line-height:1.5;color:#6B6258">
    Mia is a voice AI receptionist by VoiceAIReceptionists. She answers, qualifies, and books — for real estate, hospitality, dental, and more. Reply to this email to chat about deploying her at ${escapeHtml(business)}.
  </div>
</div>`.trim();

  const text = `Hi ${name}, thanks for taking Mia for a spin.\n\n${
    summary ? `Summary: ${summary}\n` : "We're processing the recap now.\n"
  }${transcriptText}\n\nIf this is the kind of receptionist you'd want for ${business}, just hit reply.\n\n— Mia (on behalf of VoiceAIReceptionists)`;

  return { subject, html, text };
}

export async function POST(request) {
  let payload;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const { name, business, email, phone, livekit_session_id } = payload || {};
  if (!name || !business || !email || !phone) {
    return Response.json(
      { ok: false, error: "Missing required field" },
      { status: 400 }
    );
  }
  if (!isLikelyEmail(email)) {
    return Response.json(
      { ok: false, error: "Invalid email" },
      { status: 400 }
    );
  }

  console.log("[LEAD CAPTURE]", JSON.stringify(payload));

  const n8nUrl = process.env.ONRISE_N8N_LEAD_WEBHOOK;
  if (n8nUrl) {
    fetch(n8nUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch((err) => console.error("[LEAD CAPTURE] n8n forward error", err));
  }

  let callRecord = null;
  if (livekit_session_id) {
    callRecord = await pollForCallRecord(
      livekit_session_id,
      SUMMARY_POLL_TIMEOUT_MS,
      SUMMARY_POLL_INTERVAL_MS
    );
    if (!callRecord?.summary) {
      console.warn(
        "[LEAD CAPTURE] No summary available after poll for session",
        livekit_session_id
      );
    }

    // Merge lead info into the KV record so the dashboard listing can display
    // name/business/email/phone alongside the call summary. Best-effort — if
    // KV write fails, we still send the emails.
    try {
      const merged = {
        ...(callRecord || { session_id: livekit_session_id }),
        lead: {
          name: payload.name || null,
          business: payload.business || null,
          email: payload.email || null,
          phone: payload.phone || null,
          captured_at: payload.captured_at || new Date().toISOString(),
        },
        lead_captured_at: payload.captured_at || new Date().toISOString(),
      };
      await redis.set(`call:${livekit_session_id}`, JSON.stringify(merged), {
        ex: 60 * 60 * 24 * 90,
      });
      callRecord = merged;
    } catch (err) {
      console.error("[LEAD CAPTURE] KV merge of lead info failed", err);
    }
  }

  if (!resend) {
    console.warn("[LEAD CAPTURE] RESEND_API_KEY not set — skipping email send");
    return Response.json({ ok: true });
  }

  // 1. Internal notification email to LEAD_NOTIFY_TO (Jon)
  if (TO_ADDRESS) {
    try {
      const { subject, html, text } = buildInternalEmail(payload, callRecord);
      const result = await resend.emails.send({
        from: FROM_ADDRESS,
        to: TO_ADDRESS.split(",").map((s) => s.trim()),
        replyTo: REPLY_TO,
        subject,
        html,
        text,
      });
      if (result.error) {
        console.error("[LEAD CAPTURE] Internal email error", result.error);
      }
    } catch (err) {
      console.error("[LEAD CAPTURE] Internal email exception", err);
    }
  } else {
    console.warn("[LEAD CAPTURE] LEAD_NOTIFY_TO not set — skipping internal email");
  }

  // 2. Prospect-facing email with transcript / summary
  try {
    const {
      subject: pSubject,
      html: pHtml,
      text: pText,
    } = buildProspectEmail(payload, callRecord);
    const result = await resend.emails.send({
      from: FROM_ADDRESS,
      to: [email.trim()],
      replyTo: REPLY_TO,
      subject: pSubject,
      html: pHtml,
      text: pText,
    });
    if (result.error) {
      console.error("[LEAD CAPTURE] Prospect email error", result.error);
    }
  } catch (err) {
    console.error("[LEAD CAPTURE] Prospect email exception", err);
  }

  return Response.json({ ok: true });
}
