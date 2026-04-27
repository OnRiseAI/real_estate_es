import { Redis } from "@upstash/redis";
import Link from "next/link";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

const PALETTE = {
  cream: "#F5EFE4",
  creamSoft: "#EFE7D6",
  ink: "#1B1E28",
  inkSoft: "#2A2F3D",
  muted: "#6B6258",
  rule: "#CFC6B5",
  terracotta: "#C85A3C",
  terracottaDeep: "#A6472E",
  sea: "#1B4965",
};

const SERIF = "Fraunces, Georgia, serif";

function formatDuration(sec) {
  if (typeof sec !== "number") return "—";
  const m = Math.floor(sec / 60);
  const s = String(sec % 60).padStart(2, "0");
  return `${m}:${s}`;
}

function formatDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

async function fetchCallRecord(sessionId) {
  if (!sessionId) return null;
  try {
    const raw = await redis.get(`call:${sessionId}`);
    if (!raw) return null;
    return typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch (err) {
    console.error("[CALLS PAGE] KV read failed", err);
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { sessionId } = await params;
  return {
    title: `Call · ${sessionId}`,
    robots: { index: false, follow: false },
  };
}

export default async function CallPage({ params }) {
  const { sessionId } = await params;
  const record = await fetchCallRecord(sessionId);

  if (!record) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: PALETTE.cream,
          color: PALETTE.ink,
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          padding: "60px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ maxWidth: 480, textAlign: "center" }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: PALETTE.terracotta,
              marginBottom: 12,
            }}
          >
            Not found
          </div>
          <h1
            style={{
              fontFamily: SERIF,
              fontSize: 32,
              fontWeight: 600,
              color: PALETTE.ink,
              margin: "0 0 16px",
              letterSpacing: "-0.01em",
            }}
          >
            We couldn&rsquo;t find this call.
          </h1>
          <p style={{ color: PALETTE.muted, fontSize: 14, lineHeight: 1.6 }}>
            The recording may have expired (90-day retention) or the session ID
            is wrong. Check the link from the lead notification email.
          </p>
        </div>
      </main>
    );
  }

  const {
    summary,
    transcript = [],
    duration_sec,
    recording_key,
    stored_at,
  } = record;

  const audioSrc = `/api/recordings/${encodeURIComponent(sessionId)}`;
  const dur = formatDuration(duration_sec);
  const callDate = formatDate(stored_at);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: PALETTE.cream,
        color: PALETTE.ink,
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        padding: "48px 24px 96px",
      }}
    >
      <link
        rel="preconnect"
        href="https://fonts.googleapis.com"
      />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Fraunces:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: PALETTE.terracotta,
              marginBottom: 10,
            }}
          >
            Call recording
          </div>
          <h1
            style={{
              fontFamily: SERIF,
              fontSize: 38,
              fontWeight: 600,
              color: PALETTE.ink,
              margin: "0 0 8px",
              letterSpacing: "-0.015em",
              lineHeight: 1.1,
            }}
          >
            {dur}
            <span
              style={{
                fontSize: 18,
                fontWeight: 400,
                color: PALETTE.muted,
                marginLeft: 14,
                letterSpacing: 0,
              }}
            >
              with Mia
            </span>
          </h1>
          <div
            style={{
              fontSize: 13,
              color: PALETTE.muted,
              letterSpacing: "0.02em",
            }}
          >
            {callDate}
          </div>
        </div>

        {/* Audio player */}
        <div
          style={{
            background: "#FFFFFF",
            border: `1px solid ${PALETTE.rule}`,
            borderRadius: 12,
            padding: "20px 22px",
            marginBottom: 32,
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: PALETTE.terracotta,
              marginBottom: 12,
            }}
          >
            Listen
          </div>
          <audio
            src={audioSrc}
            controls
            preload="metadata"
            style={{ width: "100%", height: 44 }}
          >
            Your browser does not support the audio element.
          </audio>
          {!recording_key && (
            <div
              style={{
                fontSize: 11,
                color: PALETTE.muted,
                marginTop: 10,
                fontStyle: "italic",
              }}
            >
              Recording may still be processing. Refresh in a minute if playback fails.
            </div>
          )}
        </div>

        {/* Summary */}
        {summary && (
          <div
            style={{
              background: PALETTE.creamSoft,
              borderLeft: `3px solid ${PALETTE.terracotta}`,
              padding: "18px 22px",
              marginBottom: 32,
              borderRadius: 6,
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: PALETTE.terracotta,
                marginBottom: 10,
              }}
            >
              Summary
            </div>
            <p
              style={{
                fontSize: 15,
                lineHeight: 1.6,
                color: PALETTE.ink,
                margin: 0,
              }}
            >
              {summary}
            </p>
          </div>
        )}

        {/* Transcript */}
        {transcript.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: PALETTE.terracotta,
                marginBottom: 18,
              }}
            >
              Transcript
            </div>
            {transcript.map((turn, i) => {
              const isMia = turn?.role === "assistant";
              const speaker = isMia ? "Mia" : "Caller";
              const accent = isMia ? PALETTE.terracotta : PALETTE.sea;
              const text = String(turn?.text ?? "").trim();
              if (!text) return null;
              return (
                <div
                  key={i}
                  style={{
                    marginBottom: 14,
                    paddingLeft: 14,
                    borderLeft: `2px solid ${accent}`,
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: accent,
                      marginBottom: 4,
                      letterSpacing: "0.04em",
                    }}
                  >
                    {speaker}
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      lineHeight: 1.55,
                      color: PALETTE.ink,
                    }}
                  >
                    {text}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {transcript.length === 0 && !summary && (
          <div
            style={{
              fontSize: 13,
              color: PALETTE.muted,
              fontStyle: "italic",
              padding: "20px 0",
            }}
          >
            This call has no transcript or summary captured. Likely a brief or
            silent session.
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            marginTop: 48,
            paddingTop: 20,
            borderTop: `1px solid ${PALETTE.rule}`,
            fontSize: 12,
            color: PALETTE.muted,
          }}
        >
          <Link
            href="/"
            style={{
              color: PALETTE.sea,
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            ← Back to site
          </Link>
        </div>
      </div>
    </main>
  );
}
