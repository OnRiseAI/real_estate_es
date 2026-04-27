import { Redis } from "@upstash/redis";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

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
  mutedSoft: "#9C9388",
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
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function truncate(s, n) {
  if (!s) return "";
  return s.length > n ? `${s.slice(0, n - 1).trim()}…` : s;
}

async function fetchAllCalls() {
  const records = [];
  let cursor = "0";
  try {
    do {
      const result = await redis.scan(cursor, {
        match: "call:*",
        count: 200,
      });
      cursor = String(result?.[0] ?? "0");
      const keys = result?.[1] ?? [];
      if (keys.length === 0) continue;
      const values = await Promise.all(keys.map((k) => redis.get(k)));
      for (let i = 0; i < values.length; i++) {
        const raw = values[i];
        if (!raw) continue;
        let rec;
        try {
          rec = typeof raw === "string" ? JSON.parse(raw) : raw;
        } catch {
          continue;
        }
        records.push(rec);
      }
    } while (cursor !== "0");
  } catch (err) {
    console.error("[DASHBOARD] KV scan failed", err);
    return [];
  }
  records.sort((a, b) => {
    const ta = new Date(a?.stored_at || 0).getTime();
    const tb = new Date(b?.stored_at || 0).getTime();
    return tb - ta;
  });
  return records;
}

export const metadata = {
  title: "Dashboard — VoiceAIReceptionists",
  robots: { index: false, follow: false },
};

export default async function DashboardPage({ searchParams }) {
  const params = (await searchParams) || {};
  const filter = params.filter === "leads" ? "leads" : "all";

  const allRecords = await fetchAllCalls();
  const records =
    filter === "leads"
      ? allRecords.filter((r) => r?.lead?.email || r?.lead?.phone)
      : allRecords;

  const totalCalls = allRecords.length;
  const totalLeads = allRecords.filter(
    (r) => r?.lead?.email || r?.lead?.phone
  ).length;

  return (
    <main
      style={{
        minHeight: "100vh",
        background: PALETTE.cream,
        color: PALETTE.ink,
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        padding: "32px 24px 96px",
      }}
    >
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Fraunces:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* Top bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 36,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: PALETTE.terracotta,
                marginBottom: 6,
              }}
            >
              VoiceAIReceptionists
            </div>
            <h1
              style={{
                fontFamily: SERIF,
                fontSize: 32,
                fontWeight: 600,
                color: PALETTE.ink,
                margin: 0,
                letterSpacing: "-0.015em",
              }}
            >
              All calls
            </h1>
          </div>
          <UserButton
            afterSignOutUrl="/sign-in"
            appearance={{
              elements: {
                avatarBox: { width: 36, height: 36 },
              },
            }}
          />
        </div>

        {/* Stats + filter */}
        <div
          style={{
            display: "flex",
            gap: 24,
            alignItems: "center",
            marginBottom: 28,
            paddingBottom: 18,
            borderBottom: `1px solid ${PALETTE.rule}`,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              fontSize: 13,
              color: PALETTE.muted,
              letterSpacing: "0.02em",
            }}
          >
            <strong style={{ color: PALETTE.ink, fontWeight: 600 }}>
              {totalCalls}
            </strong>{" "}
            calls ·{" "}
            <strong style={{ color: PALETTE.ink, fontWeight: 600 }}>
              {totalLeads}
            </strong>{" "}
            with leads
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ display: "flex", gap: 8 }}>
            <Link
              href="/dashboard"
              style={{
                fontSize: 12,
                fontWeight: 600,
                padding: "8px 14px",
                borderRadius: 999,
                background: filter === "all" ? PALETTE.ink : "transparent",
                color: filter === "all" ? PALETTE.cream : PALETTE.muted,
                textDecoration: "none",
                border: `1px solid ${filter === "all" ? PALETTE.ink : PALETTE.rule}`,
                letterSpacing: "0.04em",
              }}
            >
              All
            </Link>
            <Link
              href="/dashboard?filter=leads"
              style={{
                fontSize: 12,
                fontWeight: 600,
                padding: "8px 14px",
                borderRadius: 999,
                background: filter === "leads" ? PALETTE.ink : "transparent",
                color: filter === "leads" ? PALETTE.cream : PALETTE.muted,
                textDecoration: "none",
                border: `1px solid ${filter === "leads" ? PALETTE.ink : PALETTE.rule}`,
                letterSpacing: "0.04em",
              }}
            >
              Leads only
            </Link>
          </div>
        </div>

        {/* List */}
        {records.length === 0 ? (
          <div
            style={{
              padding: "60px 24px",
              textAlign: "center",
              color: PALETTE.muted,
              fontSize: 14,
            }}
          >
            {filter === "leads"
              ? "No form-submitted leads yet."
              : "No calls yet. Try a demo at realestate.voiceaireceptionists.com."}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {records.map((rec) => {
              const sid = rec?.session_id || "";
              const lead = rec?.lead || {};
              const callerName = lead.name || null;
              const callerBiz = lead.business || null;
              const dur = formatDuration(rec?.duration_sec);
              const date = formatDate(rec?.stored_at);
              const summary = rec?.summary || "";
              const hasLead = Boolean(lead.email || lead.phone);

              return (
                <Link
                  key={sid}
                  href={`/calls/${encodeURIComponent(sid)}`}
                  style={{
                    display: "block",
                    padding: "18px 16px",
                    borderBottom: `1px solid ${PALETTE.rule}`,
                    textDecoration: "none",
                    color: PALETTE.ink,
                    transition: "background 120ms ease",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      gap: 16,
                      marginBottom: 6,
                    }}
                  >
                    <div
                      style={{
                        fontFamily: SERIF,
                        fontSize: 18,
                        fontWeight: 500,
                        color: PALETTE.ink,
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {callerName ? (
                        <>
                          {callerName}
                          {callerBiz ? (
                            <span
                              style={{
                                color: PALETTE.muted,
                                fontWeight: 400,
                              }}
                            >
                              {" · "}
                              {callerBiz}
                            </span>
                          ) : null}
                        </>
                      ) : (
                        <span style={{ color: PALETTE.mutedSoft }}>
                          Anonymous demo
                        </span>
                      )}
                      {hasLead && (
                        <span
                          style={{
                            display: "inline-block",
                            marginLeft: 10,
                            fontSize: 9,
                            fontWeight: 700,
                            letterSpacing: "0.18em",
                            textTransform: "uppercase",
                            color: PALETTE.terracotta,
                            border: `1px solid ${PALETTE.terracotta}`,
                            padding: "2px 7px",
                            borderRadius: 999,
                            verticalAlign: "middle",
                          }}
                        >
                          Lead
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: PALETTE.muted,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {dur} · {date}
                    </div>
                  </div>
                  {summary && (
                    <div
                      style={{
                        fontSize: 13,
                        lineHeight: 1.55,
                        color: PALETTE.muted,
                      }}
                    >
                      {truncate(summary, 220)}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
