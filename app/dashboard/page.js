import { Redis } from "@upstash/redis";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import StatusPill from "../components/StatusPill";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

const STATUS_LABELS = {
  new: "New",
  pending: "Pending",
  called_back: "Called back",
};

const STATUS_DOT = {
  new: "var(--terracotta)",
  pending: "#D4A04A",
  called_back: "#3F8B5C",
};

function formatDuration(sec) {
  if (typeof sec !== "number") return "—";
  const m = Math.floor(sec / 60);
  const s = String(sec % 60).padStart(2, "0");
  return `${m}:${s}`;
}

function formatTime(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

function initialsOf(name) {
  if (!name) return "··";
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "··";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function avatarSeedFor(name) {
  // Subtle ink palette so each name always gets the same shade
  const colors = [
    "linear-gradient(140deg, #1B1E28 0%, #2A2F3D 100%)",
    "linear-gradient(140deg, #1B4965 0%, #274C6B 100%)",
    "linear-gradient(140deg, #2A2F3D 0%, #1B1E28 100%)",
    "linear-gradient(140deg, #4A3F36 0%, #2A2F3D 100%)",
  ];
  if (!name) return colors[0];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  return colors[Math.abs(h) % colors.length];
}

function rangeDays(rangeParam) {
  const v = parseInt(rangeParam, 10);
  if ([7, 30, 90].includes(v)) return v;
  return 30;
}

async function fetchAllCalls() {
  const records = [];
  let cursor = "0";
  try {
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
          /* skip corrupt */
        }
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

function aggregateByDay(records, days) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const buckets = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    buckets.push({ key: d.toISOString().slice(0, 10), count: 0 });
  }
  const idx = new Map(buckets.map((b, i) => [b.key, i]));
  for (const r of records) {
    const day = String(r?.stored_at || "").slice(0, 10);
    const i = idx.get(day);
    if (typeof i === "number") buckets[i].count++;
  }
  return buckets;
}

function topLanguages(records) {
  const counts = new Map();
  let total = 0;
  for (const r of records) {
    const lang = r?.language || "EN";
    counts.set(lang, (counts.get(lang) || 0) + 1);
    total++;
  }
  if (total === 0) return [];
  return [...counts.entries()]
    .map(([code, n]) => ({ code, n, pct: Math.round((n / total) * 100) }))
    .sort((a, b) => b.n - a.n);
}

export const metadata = {
  title: "Dashboard — VoiceAIReceptionists",
  robots: { index: false, follow: false },
};

const DASH_CSS = `
:root {
  --cream: #F5EFE4;
  --cream-soft: #EFE7D6;
  --cream-deep: #E3D6BE;
  --paper: #FBF6EB;
  --ink: #1B1E28;
  --ink-soft: #2A2F3D;
  --muted: #6B6258;
  --muted-soft: #9C9388;
  --rule: #CFC6B5;
  --rule-soft: #E3D6BE;
  --terracotta: #C85A3C;
  --terracotta-deep: #A6472E;
  --terracotta-soft: #E89076;
  --olive: #7A8267;
  --sea: #1B4965;
  --serif: 'Fraunces', Georgia, 'Times New Roman', serif;
  --sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

@font-face { font-family: 'system-tnum'; src: local('SF Pro Display'), local('Helvetica Neue'); font-feature-settings: 'tnum'; }

.dash-root {
  min-height: 100vh;
  background:
    radial-gradient(circle at 20% 0%, rgba(200,90,60,0.06) 0%, transparent 45%),
    radial-gradient(circle at 80% 100%, rgba(122,130,103,0.05) 0%, transparent 50%),
    var(--cream);
  color: var(--ink);
  font-family: var(--sans);
  padding: 36px 28px 120px;
  position: relative;
  overflow-x: hidden;
}

/* Subtle paper grain overlay */
.dash-root::before {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 1;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' seed='3'/><feColorMatrix values='0 0 0 0 0.42, 0 0 0 0 0.38, 0 0 0 0 0.33, 0 0 0 0.06 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
  background-size: 160px;
  mix-blend-mode: multiply;
  opacity: 0.45;
}

.dash-shell {
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
}

@keyframes rise {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes growBar {
  from { transform: scaleY(0); }
  to   { transform: scaleY(1); }
}
@keyframes pulseDot {
  0%   { box-shadow: 0 0 0 0 rgba(200,90,60,0.55); }
  70%  { box-shadow: 0 0 0 10px rgba(200,90,60,0);  }
  100% { box-shadow: 0 0 0 0 rgba(200,90,60,0);    }
}

.fade-in    { animation: rise 700ms cubic-bezier(0.16,1,0.3,1) both; }
.fade-in-1  { animation: rise 700ms cubic-bezier(0.16,1,0.3,1) 60ms both;  }
.fade-in-2  { animation: rise 700ms cubic-bezier(0.16,1,0.3,1) 120ms both; }
.fade-in-3  { animation: rise 700ms cubic-bezier(0.16,1,0.3,1) 180ms both; }
.fade-in-4  { animation: rise 700ms cubic-bezier(0.16,1,0.3,1) 240ms both; }

/* Header */
.dash-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  flex-wrap: wrap;
  margin-bottom: 44px;
}

.dash-eyebrow {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.26em;
  text-transform: uppercase;
  color: var(--terracotta);
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.dash-eyebrow::before {
  content: '';
  display: inline-block;
  width: 26px;
  height: 1px;
  background: var(--terracotta);
}

.dash-title {
  font-family: var(--serif);
  font-size: clamp(36px, 5vw, 52px);
  font-weight: 500;
  color: var(--ink);
  margin: 0;
  letter-spacing: -0.02em;
  line-height: 1.02;
}
.dash-title em {
  font-style: italic;
  font-weight: 400;
  color: var(--terracotta-deep);
}

.dash-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.range-form { display: inline-block; margin: 0; }
.range-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 11px 16px;
  background: rgba(255,255,255,0.7);
  border: 1px solid var(--rule);
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  color: var(--ink);
  cursor: pointer;
  backdrop-filter: blur(6px);
  transition: border-color 200ms, background 200ms;
}
.range-pill:hover { border-color: var(--terracotta); background: rgba(255,255,255,0.95); }
.range-pill select {
  border: none;
  background: transparent;
  font-weight: 600;
  font-size: 12px;
  color: var(--ink);
  outline: none;
  cursor: pointer;
  padding-right: 6px;
  font-family: var(--sans);
}
.range-pill button {
  border: none;
  background: transparent;
  color: var(--ink);
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  padding: 0;
}

.export-btn {
  padding: 11px 18px;
  background: var(--ink);
  color: var(--cream);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.06em;
  border-radius: 999px;
  text-decoration: none;
  border: 1px solid var(--ink);
  transition: background 200ms, transform 200ms;
}
.export-btn:hover { background: var(--terracotta-deep); border-color: var(--terracotta-deep); transform: translateY(-1px); }

/* Stat cards */
.stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 14px;
  margin-bottom: 28px;
}
.stat-card {
  position: relative;
  background:
    linear-gradient(160deg, var(--paper) 0%, var(--cream-soft) 100%);
  border: 1px solid var(--rule-soft);
  border-radius: 16px;
  padding: 22px 24px 24px;
  overflow: hidden;
  transition: border-color 240ms;
}
.stat-card::after {
  content: '';
  position: absolute;
  bottom: -40%;
  right: -20%;
  width: 240px;
  height: 240px;
  background: radial-gradient(circle, rgba(200,90,60,0.07) 0%, transparent 60%);
  pointer-events: none;
}
.stat-card:hover { border-color: var(--terracotta-soft); }
.stat-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--muted);
  margin-bottom: 14px;
}
.stat-value {
  font-family: var(--serif);
  font-size: 52px;
  font-weight: 400;
  color: var(--ink);
  letter-spacing: -0.04em;
  line-height: 0.95;
  margin-bottom: 10px;
  font-variant-numeric: tabular-nums oldstyle-nums;
  font-feature-settings: 'tnum';
}
.stat-value em {
  font-style: italic;
  color: var(--terracotta);
}
.stat-sub {
  font-size: 12px;
  color: var(--terracotta);
  font-weight: 500;
  letter-spacing: 0.01em;
  font-style: italic;
  font-family: var(--serif);
}

/* Chart row */
.chart-row {
  display: grid;
  grid-template-columns: 1.45fr 1fr;
  gap: 14px;
  margin-bottom: 28px;
}
@media (max-width: 880px) {
  .chart-row { grid-template-columns: 1fr; }
}

.panel {
  background:
    linear-gradient(160deg, var(--paper) 0%, var(--cream-soft) 100%);
  border: 1px solid var(--rule-soft);
  border-radius: 16px;
  padding: 22px 26px 26px;
  position: relative;
}
.panel-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 22px;
}
.panel-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--muted);
}
.panel-meta {
  font-size: 11px;
  color: var(--muted-soft);
  letter-spacing: 0.06em;
  font-style: italic;
  font-family: var(--serif);
}

.bar-chart {
  display: flex;
  gap: 4px;
  align-items: flex-end;
  height: 200px;
  padding-top: 8px;
}
.bar {
  flex: 1;
  border-radius: 3px 3px 1px 1px;
  transform-origin: bottom center;
  animation: growBar 800ms cubic-bezier(0.22, 1, 0.36, 1) both;
  position: relative;
}
.bar.recent {
  background: linear-gradient(180deg, var(--terracotta) 0%, var(--terracotta-deep) 100%);
  box-shadow: 0 8px 20px -8px rgba(200,90,60,0.55);
}
.bar.older {
  background: linear-gradient(180deg, var(--muted-soft) 0%, var(--muted) 100%);
  opacity: 0.55;
}
.bar.empty { opacity: 0.18; min-height: 4px; }

/* Top languages */
.lang-list { display: flex; flex-direction: column; gap: 16px; }
.lang-row { display: flex; flex-direction: column; gap: 6px; }
.lang-meta {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: var(--ink);
  font-weight: 500;
  letter-spacing: 0.04em;
}
.lang-meta em {
  font-style: italic;
  color: var(--muted);
  font-weight: 400;
  font-family: var(--serif);
  font-size: 13px;
}
.lang-track {
  height: 5px;
  background: var(--cream-deep);
  border-radius: 2px;
  overflow: hidden;
}
.lang-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--terracotta) 0%, var(--terracotta-deep) 100%);
  border-radius: 2px;
}

/* Recent enquiries */
.enquiries-panel { padding: 22px 26px 12px; }
.enquiries-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 6px;
}
.enquiries-link {
  font-size: 12px;
  font-weight: 600;
  color: var(--terracotta);
  text-decoration: none;
  letter-spacing: 0.02em;
  transition: color 200ms;
}
.enquiries-link:hover { color: var(--terracotta-deep); }

.enquiry-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid var(--cream-deep);
  text-decoration: none;
  color: var(--ink);
  position: relative;
  transition: padding 220ms, background 220ms;
}
.enquiry-row::before {
  content: '';
  position: absolute;
  left: -10px; right: -10px; top: 0; bottom: 0;
  background: rgba(200,90,60,0);
  border-radius: 8px;
  z-index: -1;
  transition: background 220ms;
}
.enquiry-row:hover { padding-left: 8px; }
.enquiry-row:hover::before { background: rgba(200,90,60,0.06); }
.enquiry-row:last-child { border-bottom: none; }

.avatar {
  width: 42px;
  height: 42px;
  border-radius: 999px;
  color: var(--cream);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.05em;
  flex-shrink: 0;
  font-family: var(--serif);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.06);
}

.enquiry-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--ink);
  letter-spacing: -0.01em;
  font-family: var(--serif);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.enquiry-context {
  font-size: 12px;
  color: var(--muted);
  margin-top: 3px;
  font-style: italic;
  font-family: var(--serif);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.lang-badge {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  padding: 4px 10px;
  background: rgba(255,255,255,0.55);
  border: 1px solid var(--rule);
  border-radius: 999px;
  color: var(--muted);
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
}

.enquiry-time {
  font-size: 12px;
  color: var(--muted);
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
  min-width: 46px;
  text-align: right;
  letter-spacing: 0.02em;
}

.status-pill {
  font-size: 12px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  flex-shrink: 0;
  min-width: 100px;
  font-family: var(--serif);
  font-style: italic;
}
.status-dot {
  display: inline-block;
  width: 7px; height: 7px;
  border-radius: 999px;
}
.status-pill.pulse .status-dot { animation: pulseDot 1.8s ease-out infinite; }

.empty-state {
  padding: 44px 0 26px;
  text-align: center;
  color: var(--muted-soft);
  font-size: 13px;
  font-style: italic;
  font-family: var(--serif);
}

.show-more {
  font-size: 12px;
  color: var(--muted-soft);
  text-align: center;
  padding: 14px 0 6px;
  font-style: italic;
  font-family: var(--serif);
}

/* User button */
.user-btn-wrap { display: inline-flex; align-items: center; }
`;

export default async function DashboardPage({ searchParams }) {
  const params = (await searchParams) || {};
  const range = rangeDays(params.range);
  const filter = params.filter === "leads" ? "leads" : "all";

  const user = await currentUser();
  const accountName =
    user?.organizationMemberships?.[0]?.organization?.name ||
    user?.firstName ||
    "VoiceAIReceptionists";

  const allRecords = await fetchAllCalls();
  const cutoff = Date.now() - range * 24 * 60 * 60 * 1000;
  const inRange = allRecords.filter(
    (r) => new Date(r?.stored_at || 0).getTime() >= cutoff
  );
  const records =
    filter === "leads"
      ? inRange.filter((r) => r?.lead?.email || r?.lead?.phone)
      : inRange;

  const totalCalls = inRange.length;
  const totalLeads = inRange.filter(
    (r) => r?.lead?.email || r?.lead?.phone
  ).length;
  const avgDur = totalCalls
    ? Math.round(
        inRange.reduce((s, r) => s + (r?.duration_sec || 0), 0) / totalCalls
      )
    : 0;
  const langStats = topLanguages(inRange);
  const langCount = langStats.length || 1;
  const dayBuckets = aggregateByDay(inRange, range);
  const maxBar = Math.max(1, ...dayBuckets.map((b) => b.count));

  const month = new Date().toLocaleDateString("en-GB", { month: "long" });
  const year = new Date().getFullYear();

  return (
    <main className="dash-root">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,300..700&family=Inter:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <style dangerouslySetInnerHTML={{ __html: DASH_CSS }} />

      <div className="dash-shell">
        {/* Header */}
        <div className="dash-header fade-in">
          <div>
            <div className="dash-eyebrow">{accountName} · Dashboard</div>
            <h1 className="dash-title">
              {month} {year} <em>overview</em>
            </h1>
          </div>
          <div className="dash-actions">
            <RangeDropdown current={range} />
            <Link
              href={`/api/dashboard/export?range=${range}`}
              className="export-btn"
            >
              Export CSV
            </Link>
            <span className="user-btn-wrap">
              <UserButton
                afterSignOutUrl="/sign-in"
                appearance={{
                  elements: { avatarBox: { width: 38, height: 38 } },
                }}
              />
            </span>
          </div>
        </div>

        {/* Stat cards */}
        <div className="stat-grid fade-in-1">
          <StatCard
            label="Calls handled"
            value={String(totalCalls)}
            sub={
              totalLeads > 0
                ? `${totalLeads} converted to leads`
                : `Last ${range} days`
            }
          />
          <StatCard
            label="Answered"
            value="100%"
            sub="every call picked up"
          />
          <StatCard
            label="Avg length"
            value={formatDuration(avgDur)}
            sub="min per call"
          />
          <StatCard
            label="Languages"
            value={String(langCount)}
            sub="of 15 supported"
          />
        </div>

        {/* Charts */}
        <div className="chart-row fade-in-2">
          <div className="panel">
            <div className="panel-head">
              <div className="panel-label">Calls per day</div>
              <div className="panel-meta">Last {range} days</div>
            </div>
            <div className="bar-chart">
              {dayBuckets.map((b, i) => {
                const isRecent = i >= dayBuckets.length - 7;
                const heightPct = (b.count / maxBar) * 100;
                const cls = b.count === 0 ? "bar empty" : isRecent ? "bar recent" : "bar older";
                const style = {
                  height: `${Math.max(2, heightPct)}%`,
                  animationDelay: `${300 + i * 12}ms`,
                };
                return (
                  <div
                    key={b.key}
                    className={cls}
                    style={style}
                    title={`${b.key}: ${b.count} call${b.count === 1 ? "" : "s"}`}
                  />
                );
              })}
            </div>
          </div>

          <div className="panel">
            <div className="panel-head">
              <div className="panel-label">Top languages</div>
            </div>
            <div className="lang-list">
              {(langStats.length > 0
                ? langStats
                : [{ code: "EN", pct: 100, n: 0 }]
              )
                .slice(0, 5)
                .map((l) => (
                  <div className="lang-row" key={l.code}>
                    <div className="lang-meta">
                      <span>{l.code}</span>
                      <em>{l.pct}%</em>
                    </div>
                    <div className="lang-track">
                      <div
                        className="lang-fill"
                        style={{ width: `${l.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Recent enquiries */}
        <div className="panel enquiries-panel fade-in-3">
          <div className="enquiries-toolbar">
            <div className="panel-label">Recent enquiries</div>
            <Link
              className="enquiries-link"
              href={
                filter === "leads"
                  ? `/dashboard?range=${range}`
                  : `/dashboard?range=${range}&filter=leads`
              }
            >
              {filter === "leads" ? "← Show all" : "Leads only →"}
            </Link>
          </div>

          {records.length === 0 ? (
            <div className="empty-state">
              {filter === "leads"
                ? "No form-submitted leads in this window."
                : "No demo calls in the selected range."}
            </div>
          ) : (
            <div>
              {records.slice(0, 25).map((rec) => (
                <EnquiryRow key={rec.session_id} rec={rec} />
              ))}
              {records.length > 25 && (
                <div className="show-more">
                  Showing first 25 of {records.length} — narrow date range to see more
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function StatCard({ label, value, sub }) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}

function RangeDropdown({ current }) {
  return (
    <form method="get" action="/dashboard" className="range-form">
      <label className="range-pill">
        <select name="range" defaultValue={String(current)}>
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>
        <button type="submit">▾</button>
      </label>
    </form>
  );
}

function EnquiryRow({ rec }) {
  const sid = rec?.session_id || "";
  const lead = rec?.lead || {};
  const name = lead.name || "Anonymous";
  const business = lead.business || null;
  const summary = rec?.summary || "";
  // Use first 80 chars of summary or business as the context line
  const context =
    rec?.context ||
    business ||
    (summary ? truncateOneLine(summary, 80) : formatDuration(rec?.duration_sec));
  const lang = (rec?.language || "EN").toUpperCase();
  const time = formatTime(rec?.stored_at);
  const status = rec?.status || "new";

  return (
    <Link
      href={`/calls/${encodeURIComponent(sid)}`}
      className="enquiry-row"
    >
      <div className="avatar" style={{ background: avatarSeedFor(name) }}>
        {initialsOf(name)}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="enquiry-name">{name}</div>
        <div className="enquiry-context">{context}</div>
      </div>
      <div className="lang-badge">{lang}</div>
      <div className="enquiry-time">{time}</div>
      <StatusPill sessionId={sid} initialStatus={status} />
    </Link>
  );
}

function truncateOneLine(s, n) {
  if (!s) return "";
  // Strip newlines, take first sentence-ish chunk
  const flat = String(s).replace(/\s+/g, " ").trim();
  return flat.length > n ? flat.slice(0, n - 1).trim() + "…" : flat;
}
