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
    <div className="relative w-full max-w-[360px] mx-auto">
      {/* Ambient teal glow behind the phone */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 blur-3xl opacity-60 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 40%, rgba(45,212,191,0.35) 0%, rgba(13,148,136,0.15) 45%, transparent 75%)",
        }}
      />

      {/* Phone shell */}
      <div
        className="relative rounded-[44px] p-[3px] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.9)]"
        style={{
          background:
            "linear-gradient(160deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 40%, rgba(45,212,191,0.12) 100%)",
        }}
      >
        <div className="rounded-[41px] bg-[#07070A] overflow-hidden border border-[#141419]">
          <audio ref={audioElRef} autoPlay playsInline />

          {/* Status bar */}
          <div className="flex items-center justify-between px-7 pt-4 pb-2 text-white/70 text-[11px] font-semibold tracking-wide">
            <span>{clock}</span>
            <div className="flex items-center gap-1.5">
              <SignalBars className="w-[16px] h-[10px]" />
              <WifiIcon className="w-[15px] h-[10px]" />
              <div className="flex items-center gap-[2px] ml-1">
                <div className="w-[20px] h-[10px] rounded-[2px] border border-white/50 relative">
                  <div className="absolute inset-[1.5px] rounded-[1px] bg-white/80" style={{ width: "60%" }} />
                </div>
                <div className="w-[1px] h-[4px] bg-white/50 rounded-full" />
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 pt-3 pb-6 min-h-[460px] flex flex-col">
            {/* Header */}
            <div className="text-center mt-2 mb-8">
              <div className="text-[12px] font-bold tracking-[0.14em] uppercase text-[#6B6B76] mb-1">
                {state === STATES.IDLE ? "Voice AI Receptionist" : subtitle}
              </div>
              <div className="text-[26px] font-bold text-white tracking-[-0.01em]">{agentName}</div>
              <div className="text-[13px] text-[#6B6B76] mt-0.5">
                {state === STATES.IDLE ? subtitle : statusLabel}
              </div>
            </div>

            {/* Avatar + rings */}
            <div className="relative mx-auto mb-10 mt-2" style={{ width: 180, height: 180 }}>
              {state === STATES.IDLE && (
                <>
                  <span className="absolute inset-0 rounded-full border border-[#2DD4BF]/30" style={{ animation: "phone-ring 2.4s ease-out infinite" }} />
                  <span className="absolute inset-0 rounded-full border border-[#2DD4BF]/30" style={{ animation: "phone-ring 2.4s ease-out infinite", animationDelay: "0.8s" }} />
                  <span className="absolute inset-0 rounded-full border border-[#2DD4BF]/30" style={{ animation: "phone-ring 2.4s ease-out infinite", animationDelay: "1.6s" }} />
                </>
              )}
              {state === STATES.ACTIVE && (
                <>
                  <span
                    className="absolute rounded-full bg-[#2DD4BF]/20"
                    style={{
                      inset: agentSpeaking ? "-12px" : "-6px",
                      transition: "inset 200ms ease-out",
                      filter: "blur(8px)",
                    }}
                  />
                  <span
                    className="absolute rounded-full border border-[#2DD4BF]/50"
                    style={{
                      inset: "-4px",
                      animation: "phone-ring 1.8s ease-out infinite",
                    }}
                  />
                </>
              )}

              <div
                className="absolute inset-[18px] rounded-full flex items-center justify-center text-[#07070A] shadow-[0_20px_40px_-10px_rgba(45,212,191,0.6)]"
                style={{
                  background:
                    "radial-gradient(circle at 35% 30%, #7EEED8 0%, #2DD4BF 40%, #0D9488 100%)",
                }}
              >
                <span className="text-[56px] font-extrabold tracking-[-0.04em]">
                  {agentName.charAt(0)}
                </span>
              </div>
            </div>

            {/* Mic hint / error */}
            <div className="text-center mb-5 h-5">
              {state === STATES.IDLE && (
                <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#6B6B76]">
                  <MicIcon className="w-3 h-3" />
                  <span>Microphone access required</span>
                </div>
              )}
              {state === STATES.CONNECTING && (
                <div className="text-[11px] font-semibold text-[#A0A0AB] animate-pulse">
                  Establishing secure connection…
                </div>
              )}
              {state === STATES.ACTIVE && (
                <div className="inline-flex items-center gap-2 text-[11px] font-semibold text-[#2DD4BF]">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-[#2DD4BF] opacity-40" style={{ animation: "ring-pulse 2s ease-out infinite" }} />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#2DD4BF]" />
                  </span>
                  {agentSpeaking ? "Mia is speaking" : "Listening to you"}
                </div>
              )}
              {state === STATES.ERROR && errorMsg && (
                <div className="text-[11px] font-semibold text-[#F87171] px-4 truncate">
                  {errorMsg}
                </div>
              )}
              {state === STATES.ENDED && (
                <div className="text-[11px] font-semibold text-[#6B6B76]">
                  Thanks for the call.
                </div>
              )}
            </div>

            {/* Action button(s) */}
            <div className="mt-auto flex items-center justify-center gap-10">
              {state === STATES.IDLE && (
                <button
                  onClick={startCall}
                  aria-label="Start call with Mia"
                  className="group relative flex items-center justify-center w-[68px] h-[68px] rounded-full bg-[#22C55E] hover:bg-[#16A34A] transition-all shadow-[0_15px_40px_-10px_rgba(34,197,94,0.7)] hover:scale-[1.04] active:scale-[0.98]"
                >
                  <span className="absolute inset-0 rounded-full bg-[#22C55E]/40 animate-ping" />
                  <PhoneIcon className="relative w-7 h-7 text-white" />
                </button>
              )}
              {state === STATES.CONNECTING && (
                <button
                  disabled
                  className="flex items-center justify-center w-[68px] h-[68px] rounded-full bg-[#22C55E]/60 shadow-[0_15px_40px_-10px_rgba(34,197,94,0.5)] cursor-wait"
                >
                  <PhoneIcon className="w-7 h-7 text-white animate-pulse" />
                </button>
              )}
              {state === STATES.ACTIVE && (
                <button
                  onClick={endCall}
                  aria-label="End call"
                  className="flex items-center justify-center w-[68px] h-[68px] rounded-full bg-[#EF4444] hover:bg-[#DC2626] transition-all shadow-[0_15px_40px_-10px_rgba(239,68,68,0.7)] hover:scale-[1.04] active:scale-[0.98]"
                >
                  <PhoneIcon className="w-7 h-7 text-white" muted />
                </button>
              )}
              {(state === STATES.ENDED || state === STATES.ERROR) && (
                <button
                  onClick={reset}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-[#2DD4BF]/40 hover:bg-[#2DD4BF]/10 text-[#2DD4BF] text-[13px] font-bold tracking-[-0.01em] transition-colors"
                >
                  <PhoneIcon className="w-4 h-4" />
                  {state === STATES.ERROR ? "Try again" : "Call again"}
                </button>
              )}
            </div>

            {/* Caption */}
            <div className="text-center mt-6 text-[10px] font-semibold tracking-[0.08em] uppercase text-[#44444D]">
              Calls last up to 10 minutes · English only
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
