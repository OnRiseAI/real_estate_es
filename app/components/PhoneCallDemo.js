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

function formatTime(secs) {
  const mm = String(Math.floor(secs / 60)).padStart(2, "0");
  const ss = String(secs % 60).padStart(2, "0");
  return `${mm}:${ss}`;
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

  const roomRef = useRef(null);
  const audioElRef = useRef(null);
  const startTimeRef = useRef(0);

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

    try {
      const tokenRes = await fetch("/api/livekit-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(businessName ? { business_name: businessName } : {}),
      });
      if (!tokenRes.ok) throw new Error(`Token request failed (${tokenRes.status})`);
      const { serverUrl, participantToken } = await tokenRes.json();
      if (!serverUrl || !participantToken) throw new Error("Missing token in response");

      const room = new Room({ adaptiveStream: true, dynacast: true });
      roomRef.current = room;

      room.on(RoomEvent.TrackSubscribed, (track) => {
        if (track.kind === Track.Kind.Audio && audioElRef.current) {
          track.attach(audioElRef.current);
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
      setErrorMsg(err?.message || "Could not start the call");
      setState(STATES.ERROR);
      if (roomRef.current) {
        try { await roomRef.current.disconnect(); } catch {}
      }
    }
  }

  async function endCall() {
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
  }

  useEffect(() => {
    return () => {
      if (roomRef.current) {
        try { roomRef.current.disconnect(); } catch {}
      }
    };
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
    <div className="relative w-full max-w-[380px] mx-auto">
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
        {/* Inner content — stack: identity | photo | cta */}
        <div className="flex flex-col h-full px-8 py-12">
          {/* Identity — top */}
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
                : state === STATES.ENDED
                ? "Call ended"
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
                : "AI receptionist · Costa del Sol"}
            </div>
          </div>

          {/* Photo — hero */}
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

          {/* CTA — bottom */}
          <div className="flex flex-col items-center gap-3">
            {state === STATES.IDLE && (
              <>
                <button
                  type="button"
                  onClick={startCall}
                  aria-label="Tap to call Mia"
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
                  Tap to call Mia
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

            {state === STATES.ENDED && (
              <>
                <div
                  className="text-[11px]"
                  style={{ color: "rgba(245,239,228,0.55)" }}
                >
                  Duration · {formatTime(duration)}
                </div>
                <button
                  type="button"
                  onClick={reset}
                  className="px-7 py-3 rounded-full text-[12px] font-bold tracking-[0.04em] transition-all"
                  style={{
                    background: "#A6472E",
                    color: "#F5EFE4",
                    boxShadow:
                      "0 14px 36px -8px rgba(166,71,46,0.6), inset 0 1px 0 rgba(255,255,255,0.15)",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#8A3A27")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#A6472E")}
                >
                  Call again
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
