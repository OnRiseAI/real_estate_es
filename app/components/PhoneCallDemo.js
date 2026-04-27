"use client";

import { useEffect, useRef, useState } from "react";
import {
  Room,
  RoomEvent,
  Track,
  ConnectionState,
  createLocalAudioTrack,
} from "livekit-client";

const STATES = {
  IDLE: "idle",
  CONNECTING: "connecting",
  ACTIVE: "active",
  ENDED: "ended",
  ERROR: "error",
};

function PhoneIcon({ className, muted = false }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      style={muted ? { transform: "rotate(135deg)" } : undefined}
    >
      <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 0 0-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z" />
    </svg>
  );
}

function MicIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
    </svg>
  );
}

function SignalBars({ className }) {
  return (
    <svg className={className} viewBox="0 0 18 12" fill="currentColor">
      <rect x="0" y="8" width="3" height="4" rx="0.5" opacity="0.9" />
      <rect x="5" y="5" width="3" height="7" rx="0.5" opacity="0.9" />
      <rect x="10" y="2" width="3" height="10" rx="0.5" opacity="0.9" />
      <rect x="15" y="0" width="3" height="12" rx="0.5" opacity="0.4" />
    </svg>
  );
}

function WifiIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 18 12" fill="currentColor">
      <path d="M9 11.5a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4zM9 7.5c1.38 0 2.63.56 3.54 1.46l1.06-1.06A6.98 6.98 0 0 0 9 5.5a6.98 6.98 0 0 0-4.6 2.4l1.06 1.06A4.98 4.98 0 0 1 9 7.5zM9 3.5c2.21 0 4.21.9 5.66 2.34l1.06-1.06A8.97 8.97 0 0 0 9 1.5a8.97 8.97 0 0 0-6.72 3.28l1.06 1.06A6.97 6.97 0 0 1 9 3.5z" />
    </svg>
  );
}

function BatteryIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 26 12" fill="none">
      <rect x="0.6" y="0.6" width="21" height="10.8" rx="2.4" stroke="currentColor" strokeWidth="1" opacity="0.55" />
      <rect x="2.2" y="2.2" width="15" height="7.6" rx="1.2" fill="currentColor" />
      <rect x="22.6" y="4" width="1.6" height="4" rx="0.6" fill="currentColor" opacity="0.55" />
    </svg>
  );
}

function formatTime(secs) {
  const mm = String(Math.floor(secs / 60)).padStart(2, "0");
  const ss = String(secs % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

// UK ring tone: 400Hz + 450Hz dual-tone, pattern 0.4s on / 0.2s off / 0.4s on / 2.0s off
// (one cycle = 3s). Plays exactly 2 cycles then auto-cleans up. Returns a controller
// with .stop() so callers can cut it short the moment Mia picks up.
function startUkRingTone({ rings = 2, gain = 0.18 } = {}) {
  if (typeof window === "undefined") return null;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;

  const ctx = new AudioCtx();
  const master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);

  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  osc1.type = "sine";
  osc2.type = "sine";
  osc1.frequency.value = 400;
  osc2.frequency.value = 450;
  osc1.connect(master);
  osc2.connect(master);
  osc1.start();
  osc2.start();

  const now = ctx.currentTime;
  // Each ring = 0.4s tone + 0.2s gap + 0.4s tone, then 2.0s silence before next cycle.
  const scheduleCycle = (offset) => {
    master.gain.setValueAtTime(0, now + offset);
    master.gain.linearRampToValueAtTime(gain, now + offset + 0.04);
    master.gain.setValueAtTime(gain, now + offset + 0.40);
    master.gain.linearRampToValueAtTime(0, now + offset + 0.44);
    master.gain.setValueAtTime(0, now + offset + 0.60);
    master.gain.linearRampToValueAtTime(gain, now + offset + 0.64);
    master.gain.setValueAtTime(gain, now + offset + 1.00);
    master.gain.linearRampToValueAtTime(0, now + offset + 1.04);
  };
  for (let i = 0; i < rings; i++) scheduleCycle(i * 3);

  // Auto cleanup once the last ring has fully played.
  const autoStop = setTimeout(() => {
    try { osc1.stop(); osc2.stop(); ctx.close(); } catch {}
  }, rings * 3000 + 200);

  return {
    stop() {
      clearTimeout(autoStop);
      try {
        master.gain.cancelScheduledValues(ctx.currentTime);
        master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.05);
        setTimeout(() => {
          try { osc1.stop(); osc2.stop(); ctx.close(); } catch {}
        }, 100);
      } catch {}
    },
  };
}

function useClock() {
  const [time, setTime] = useState(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  });
  useEffect(() => {
    const id = setInterval(() => {
      const d = new Date();
      setTime(`${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`);
    }, 30_000);
    return () => clearInterval(id);
  }, []);
  return time;
}

export default function PhoneCallDemo({
  businessName = "",
  agentName = "Mia",
  subtitleIdle = "AI receptionist",
}) {
  const [state, setState] = useState(STATES.IDLE);
  const [agentSpeaking, setAgentSpeaking] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [duration, setDuration] = useState(0);
  const [formName, setFormName] = useState("");
  const [formBusiness, setFormBusiness] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formError, setFormError] = useState(null);
  const [livekitRoomName, setLivekitRoomName] = useState(null);

  const roomRef = useRef(null);
  const audioElRef = useRef(null);
  const startTimeRef = useRef(0);
  const ringRef = useRef(null);

  const stopRing = () => {
    if (ringRef.current) {
      ringRef.current.stop();
      ringRef.current = null;
    }
  };

  const clock = useClock();

  useEffect(() => {
    if (state !== STATES.ACTIVE) return;
    const id = setInterval(() => {
      setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 500);
    return () => clearInterval(id);
  }, [state]);

  async function startCall() {
    setState(STATES.CONNECTING);
    setErrorMsg("");
    setDuration(0);

    // Start UK ring tone synchronously inside the click handler so mobile
    // browsers grant audio permission via the user gesture.
    stopRing();
    ringRef.current = startUkRingTone({ rings: 2 });

    try {
      const tokenRes = await fetch("/api/livekit-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(businessName ? { business_name: businessName } : {}),
          caller_local_hour: new Date().getHours(),
        }),
      });
      if (!tokenRes.ok) throw new Error(`Token request failed (${tokenRes.status})`);
      const { serverUrl, participantToken, roomName } = await tokenRes.json();
      if (!serverUrl || !participantToken) throw new Error("Missing token in response");
      if (roomName) setLivekitRoomName(roomName);

      const room = new Room({ adaptiveStream: true, dynacast: true });
      roomRef.current = room;

      room.on(RoomEvent.TrackSubscribed, (track) => {
        if (track.kind === Track.Kind.Audio) {
          // Mia just "picked up" — kill the ring tone immediately.
          stopRing();
          if (audioElRef.current) track.attach(audioElRef.current);
        }
      });

      room.on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
        const agentTalking = speakers.some(
          (p) => p.identity !== room.localParticipant.identity
        );
        setAgentSpeaking(agentTalking);
      });

      room.on(RoomEvent.Disconnected, () => {
        setAgentSpeaking(false);
        setState((prev) => (prev === STATES.ACTIVE ? STATES.ENDED : prev));
      });

      room.on(RoomEvent.ConnectionStateChanged, (cs) => {
        if (cs === ConnectionState.Connected) {
          startTimeRef.current = Date.now();
          setState(STATES.ACTIVE);
        }
      });

      await room.connect(serverUrl, participantToken);

      const micTrack = await createLocalAudioTrack({
        echoCancellation: true,
        noiseSuppression: true,
      });
      await room.localParticipant.publishTrack(micTrack, {
        source: Track.Source.Microphone,
      });
    } catch (err) {
      console.error("PhoneCallDemo error", err);
      stopRing();
      setErrorMsg(err?.message || "Could not start the call");
      setState(STATES.ERROR);
      if (roomRef.current) {
        try { await roomRef.current.disconnect(); } catch {}
      }
    }
  }

  async function endCall() {
    stopRing();
    if (roomRef.current) {
      try { await roomRef.current.disconnect(); } catch {}
      roomRef.current = null;
    }
    setAgentSpeaking(false);
    setState(STATES.ENDED);
  }

  function reset() {
    setState(STATES.IDLE);
    setErrorMsg("");
    setDuration(0);
    setFormName("");
    setFormBusiness("");
    setFormEmail("");
    setFormPhone("");
    setFormSubmitting(false);
    setFormSubmitted(false);
    setFormError(null);
    setLivekitRoomName(null);
  }

  async function handleFormSubmit(e) {
    e.preventDefault();
    setFormError(null);
    setFormSubmitting(true);
    try {
      const res = await fetch("/api/lead-capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName.trim(),
          business: formBusiness.trim(),
          email: formEmail.trim(),
          phone: formPhone.trim(),
          source: "demo_post_call",
          duration_sec: duration,
          page_url: typeof window !== "undefined" ? window.location.href : "",
          captured_at: new Date().toISOString(),
          livekit_session_id: livekitRoomName,
        }),
      });
      if (!res.ok) {
        throw new Error(`Submit failed (${res.status})`);
      }
      setFormSubmitted(true);
    } catch (err) {
      setFormError(err.message || "Something went wrong. Try again.");
    } finally {
      setFormSubmitting(false);
    }
  }

  useEffect(() => {
    return () => {
      stopRing();
      if (roomRef.current) {
        try { roomRef.current.disconnect(); } catch {}
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const statusLabel =
    state === STATES.IDLE
      ? "Incoming call"
      : state === STATES.CONNECTING
      ? "Connecting…"
      : state === STATES.ACTIVE
      ? formatTime(duration)
      : state === STATES.ENDED
      ? `Call ended · ${formatTime(duration)}`
      : "Call failed";

  const subtitle = businessName
    ? state === STATES.ACTIVE || state === STATES.CONNECTING
      ? `On call · ${businessName}`
      : businessName
    : subtitleIdle;

  return (
    <div className="relative w-full max-w-[240px] sm:max-w-[280px] lg:max-w-[300px] mx-auto">
      <audio ref={audioElRef} autoPlay playsInline />

      {/* Soft ambient warm glow behind phone */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 blur-3xl opacity-60 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 45%, rgba(200,90,60,0.22) 0%, rgba(27,30,40,0.08) 40%, transparent 75%)",
        }}
      />

      {/* Phone frame — no status bar, no chrome, pure product surface */}
      <div
        className="relative overflow-hidden"
        style={{
          aspectRatio: "9 / 18",
          borderRadius: 52,
          background:
            "linear-gradient(180deg, #1A1619 0%, #0D0A0B 55%, #0A0808 100%)",
          boxShadow:
            "0 50px 100px -30px rgba(27,30,40,0.45), 0 0 0 1px rgba(232,144,118,0.06), inset 0 1px 0 rgba(255,255,255,0.04)",
        }}
      >
        {/* Inner content — stack: status | identity | photo | cta */}
        <div className="flex flex-col h-full px-7 pt-5 pb-12">
          {/* Status bar */}
          <div className="flex items-center justify-between mb-10">
            <div
              className="text-[12px] font-semibold tabular-nums"
              style={{ color: "rgba(245,239,228,0.82)", letterSpacing: "0.01em" }}
            >
              {clock}
            </div>
            <div
              className="flex items-center gap-[7px]"
              style={{ color: "rgba(245,239,228,0.72)" }}
            >
              <SignalBars className="h-[9px] w-auto" />
              <WifiIcon className="h-[9px] w-auto" />
              <BatteryIcon className="h-[11px] w-auto" />
            </div>
          </div>

          {/* Identity — hidden post-call to free body space for form */}
          {state !== STATES.ENDED && (
            <div className="text-center">
              <div
                className="text-[9px] font-bold tracking-[0.32em] uppercase mb-3"
                style={{ color: "#E89076", opacity: 0.9 }}
              >
                {state === STATES.IDLE
                  ? "Live demo"
                  : state === STATES.CONNECTING
                  ? "Connecting"
                  : state === STATES.ACTIVE
                  ? "On call"
                  : "Error"}
              </div>
              <div
                className="leading-none"
                style={{
                  fontFamily: "Fraunces, serif",
                  fontWeight: 500,
                  fontSize: 34,
                  color: "#F5EFE4",
                  letterSpacing: "-0.015em",
                }}
              >
                {agentName}
              </div>
              <div
                className="text-[11px] mt-2 font-medium"
                style={{ color: "rgba(245,239,228,0.45)", letterSpacing: "0.02em" }}
              >
                {state === STATES.ACTIVE
                  ? formatTime(duration)
                  : "Costa del Sol"}
              </div>
            </div>
          )}

          {/* Photo — hero (hidden when call ended; small chip shown above form instead) */}
          {state !== STATES.ENDED && (
          <div className="flex-1 flex items-center justify-center py-8">
            <div className="relative" style={{ width: 196, height: 196 }}>
              {/* Idle pulse rings */}
              {state === STATES.IDLE && (
                <>
                  <span
                    aria-hidden
                    className="absolute inset-[-8px] rounded-full"
                    style={{
                      border: "1px solid rgba(232,144,118,0.18)",
                      animation: "phone-ring 3s ease-out infinite",
                    }}
                  />
                  <span
                    aria-hidden
                    className="absolute inset-[-8px] rounded-full"
                    style={{
                      border: "1px solid rgba(232,144,118,0.18)",
                      animation: "phone-ring 3s ease-out infinite",
                      animationDelay: "1.5s",
                    }}
                  />
                </>
              )}

              {/* Active breathing glow */}
              {state === STATES.ACTIVE && (
                <span
                  aria-hidden
                  className="absolute inset-[-18px] rounded-full"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(232,144,118,0.45) 0%, rgba(200,90,60,0.15) 40%, transparent 75%)",
                    filter: "blur(20px)",
                    transform: agentSpeaking ? "scale(1.15)" : "scale(1)",
                    opacity: agentSpeaking ? 0.9 : 0.55,
                    transition:
                      "transform 400ms ease-out, opacity 400ms ease-out",
                  }}
                />
              )}

              {/* Cream circle fallback — visible only if /mia.png missing */}
              <div
                aria-hidden
                className="absolute inset-0 rounded-full flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, #F5EFE4 0%, #EFE7D6 60%, #E3D6BE 100%)",
                }}
              >
                <span
                  style={{
                    fontFamily: "Fraunces, serif",
                    fontSize: 88,
                    fontWeight: 500,
                    fontStyle: "italic",
                    color: "#1B1E28",
                    letterSpacing: "-0.04em",
                    lineHeight: 1,
                  }}
                >
                  {agentName.charAt(0)}
                </span>
              </div>

              {/* Real photo */}
              <img
                src="/mia.png"
                alt={agentName}
                onError={(e) => {
                  e.currentTarget.style.visibility = "hidden";
                }}
                className="absolute inset-0 w-full h-full rounded-full object-cover"
                style={{
                  boxShadow:
                    "0 30px 60px -20px rgba(0,0,0,0.55), inset 0 0 0 2px rgba(232,144,118,0.15)",
                }}
              />
            </div>
          </div>
          )}

          {/* CTA — bottom (becomes body when call ended) */}
          <div className={`flex flex-col items-center gap-3 ${state === STATES.ENDED ? "flex-1 justify-center" : ""}`}>
            {state === STATES.IDLE && (
              <>
                <button
                  type="button"
                  onClick={startCall}
                  aria-label="Tap to talk to Mia"
                  className="px-8 py-3.5 rounded-full text-[13px] font-bold tracking-[0.04em] transition-all"
                  style={{
                    background: "#A6472E",
                    color: "#F5EFE4",
                    boxShadow:
                      "0 14px 36px -8px rgba(166,71,46,0.6), inset 0 1px 0 rgba(255,255,255,0.15)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#8A3A27";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#A6472E";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  Tap to talk
                </button>
                <div
                  className="text-[9px] font-bold tracking-[0.24em] uppercase"
                  style={{ color: "rgba(245,239,228,0.38)" }}
                >
                  Speak any language · 2 min
                </div>
              </>
            )}

            {state === STATES.CONNECTING && (
              <div className="flex flex-col items-center gap-2">
                <div
                  className="flex items-center gap-1.5"
                  style={{ color: "rgba(245,239,228,0.6)" }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" style={{ animationDelay: "0.2s" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" style={{ animationDelay: "0.4s" }} />
                </div>
                <div
                  className="text-[11px] font-semibold"
                  style={{ color: "rgba(245,239,228,0.5)" }}
                >
                  Connecting
                </div>
              </div>
            )}

            {state === STATES.ACTIVE && (
              <>
                <div
                  className="inline-flex items-center gap-2 text-[11px] font-semibold"
                  style={{ color: "#E89076" }}
                >
                  <span className="relative flex h-1.5 w-1.5">
                    <span
                      className="absolute inline-flex h-full w-full rounded-full opacity-50"
                      style={{
                        background: "#E89076",
                        animation: "ring-pulse 2s ease-out infinite",
                      }}
                    />
                    <span
                      className="relative inline-flex rounded-full h-1.5 w-1.5"
                      style={{ background: "#E89076" }}
                    />
                  </span>
                  {agentSpeaking ? "Mia is speaking" : "Listening"}
                </div>
                <button
                  type="button"
                  onClick={endCall}
                  aria-label="End call"
                  className="px-6 py-2.5 rounded-full text-[11px] font-bold tracking-[0.08em] uppercase transition-all"
                  style={{
                    background: "rgba(245,239,228,0.08)",
                    color: "#F5EFE4",
                    border: "1px solid rgba(245,239,228,0.2)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#A6472E";
                    e.currentTarget.style.borderColor = "#A6472E";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(245,239,228,0.08)";
                    e.currentTarget.style.borderColor = "rgba(245,239,228,0.2)";
                  }}
                >
                  End call
                </button>
              </>
            )}

            {state === STATES.ENDED && !formSubmitted && (
              <>
                <div className="flex items-center justify-center gap-2.5 mb-1">
                  <div
                    className="rounded-full overflow-hidden flex-shrink-0"
                    style={{
                      width: 38,
                      height: 38,
                      boxShadow: "0 0 0 1.5px rgba(232,144,118,0.3)",
                    }}
                  >
                    <img
                      src="/mia.png"
                      alt={agentName}
                      onError={(e) => {
                        e.currentTarget.style.visibility = "hidden";
                      }}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col leading-tight">
                    <div
                      className="text-[8px] font-bold tracking-[0.28em] uppercase"
                      style={{ color: "#E89076", opacity: 0.9 }}
                    >
                      Call ended
                    </div>
                    <div
                      className="text-[12px] mt-0.5"
                      style={{ color: "rgba(245,239,228,0.85)" }}
                    >
                      {agentName} ·{" "}
                      <span className="tabular-nums">{formatTime(duration)}</span>
                    </div>
                  </div>
                </div>
                <form
                  onSubmit={handleFormSubmit}
                  className="w-full max-w-[280px] flex flex-col gap-2.5 mt-2"
                >
                  <div
                    className="text-[13px] font-semibold text-center"
                    style={{ color: "#F5EFE4" }}
                  >
                    Want Mia answering your phone?
                  </div>
                  <div
                    className="text-[10px] text-center mb-1 leading-relaxed"
                    style={{ color: "rgba(245,239,228,0.5)" }}
                  >
                    We&rsquo;ll email you a recap of the call and follow up within 24 hours.
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="First name"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    disabled={formSubmitting}
                    autoComplete="given-name"
                    className="px-4 py-2.5 rounded-full text-[13px] outline-none focus:border-[rgba(245,239,228,0.4)]"
                    style={{
                      background: "rgba(245,239,228,0.07)",
                      color: "#F5EFE4",
                      border: "1px solid rgba(245,239,228,0.15)",
                    }}
                  />
                  <input
                    type="text"
                    required
                    placeholder="Business name"
                    value={formBusiness}
                    onChange={(e) => setFormBusiness(e.target.value)}
                    disabled={formSubmitting}
                    autoComplete="organization"
                    className="px-4 py-2.5 rounded-full text-[13px] outline-none focus:border-[rgba(245,239,228,0.4)]"
                    style={{
                      background: "rgba(245,239,228,0.07)",
                      color: "#F5EFE4",
                      border: "1px solid rgba(245,239,228,0.15)",
                    }}
                  />
                  <input
                    type="email"
                    required
                    placeholder="Email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    disabled={formSubmitting}
                    autoComplete="email"
                    className="px-4 py-2.5 rounded-full text-[13px] outline-none focus:border-[rgba(245,239,228,0.4)]"
                    style={{
                      background: "rgba(245,239,228,0.07)",
                      color: "#F5EFE4",
                      border: "1px solid rgba(245,239,228,0.15)",
                    }}
                  />
                  <input
                    type="tel"
                    required
                    placeholder="+34 600 000 000"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    disabled={formSubmitting}
                    autoComplete="tel"
                    className="px-4 py-2.5 rounded-full text-[13px] outline-none focus:border-[rgba(245,239,228,0.4)]"
                    style={{
                      background: "rgba(245,239,228,0.07)",
                      color: "#F5EFE4",
                      border: "1px solid rgba(245,239,228,0.15)",
                    }}
                  />
                  {formError && (
                    <div
                      className="text-[10px] text-center"
                      style={{ color: "#E89076" }}
                    >
                      {formError}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="px-7 py-3 rounded-full text-[12px] font-bold tracking-[0.04em] transition-all mt-1"
                    style={{
                      background: formSubmitting ? "#6B6258" : "#A6472E",
                      color: "#F5EFE4",
                      boxShadow:
                        "0 14px 36px -8px rgba(166,71,46,0.6), inset 0 1px 0 rgba(255,255,255,0.15)",
                      cursor: formSubmitting ? "wait" : "pointer",
                    }}
                    onMouseEnter={(e) => {
                      if (!formSubmitting) e.currentTarget.style.background = "#8A3A27";
                    }}
                    onMouseLeave={(e) => {
                      if (!formSubmitting) e.currentTarget.style.background = "#A6472E";
                    }}
                  >
                    {formSubmitting ? "Sending…" : "Get a callback →"}
                  </button>
                  <button
                    type="button"
                    onClick={reset}
                    disabled={formSubmitting}
                    className="text-[10px] tracking-[0.18em] uppercase mt-1 transition-colors hover:text-[rgba(245,239,228,0.7)]"
                    style={{ color: "rgba(245,239,228,0.4)" }}
                  >
                    ← Try another call
                  </button>
                </form>
              </>
            )}

            {state === STATES.ENDED && formSubmitted && (
              <>
                <div className="flex items-center justify-center gap-2.5 mb-2">
                  <div
                    className="rounded-full overflow-hidden flex-shrink-0"
                    style={{
                      width: 38,
                      height: 38,
                      boxShadow: "0 0 0 1.5px rgba(232,144,118,0.3)",
                    }}
                  >
                    <img
                      src="/mia.png"
                      alt={agentName}
                      onError={(e) => {
                        e.currentTarget.style.visibility = "hidden";
                      }}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col leading-tight">
                    <div
                      className="text-[8px] font-bold tracking-[0.28em] uppercase"
                      style={{ color: "#E89076", opacity: 0.9 }}
                    >
                      Call ended
                    </div>
                    <div
                      className="text-[12px] mt-0.5"
                      style={{ color: "rgba(245,239,228,0.85)" }}
                    >
                      {agentName} ·{" "}
                      <span className="tabular-nums">{formatTime(duration)}</span>
                    </div>
                  </div>
                </div>
                <div
                  className="text-[16px] font-semibold text-center max-w-[260px]"
                  style={{ color: "#F5EFE4", fontFamily: "Fraunces, serif" }}
                >
                  Thanks{formName ? `, ${formName}` : ""}.
                </div>
                <div
                  className="text-[11px] text-center max-w-[260px] leading-relaxed"
                  style={{ color: "rgba(245,239,228,0.55)" }}
                >
                  Check your inbox for the call recap. We&rsquo;ll follow up within 24 hours.
                </div>
                <button
                  type="button"
                  onClick={reset}
                  className="text-[10px] tracking-[0.18em] uppercase mt-3 transition-colors hover:text-[rgba(245,239,228,0.7)]"
                  style={{ color: "rgba(245,239,228,0.4)" }}
                >
                  ← Try another call
                </button>
              </>
            )}

            {state === STATES.ERROR && (
              <>
                <div
                  className="text-[10px] max-w-[240px] text-center"
                  style={{ color: "#E89076" }}
                >
                  {errorMsg}
                </div>
                <button
                  type="button"
                  onClick={reset}
                  className="px-6 py-2.5 rounded-full text-[11px] font-bold tracking-[0.08em] uppercase transition-all"
                  style={{
                    border: "1px solid rgba(245,239,228,0.3)",
                    color: "#F5EFE4",
                    background: "transparent",
                  }}
                >
                  Try again
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
