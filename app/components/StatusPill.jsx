"use client";

import { useState, useTransition } from "react";

const ORDER = ["new", "pending", "called_back"];
const LABEL = {
  new: "New",
  pending: "Pending",
  called_back: "Called back",
};
const DOT = {
  new: "#C85A3C",
  pending: "#D4A04A",
  called_back: "#3F8B5C",
};

function nextStatus(current) {
  const idx = ORDER.indexOf(current);
  return ORDER[(idx + 1) % ORDER.length];
}

export default function StatusPill({
  sessionId,
  initialStatus = "new",
  size = "md",
}) {
  const [status, setStatus] = useState(initialStatus);
  const [pending, startTransition] = useTransition();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isUpdating) return;
    const next = nextStatus(status);
    const previous = status;
    setStatus(next);
    setIsUpdating(true);
    startTransition(async () => {
      try {
        const res = await fetch(
          `/api/calls/${encodeURIComponent(sessionId)}/status`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: next }),
          }
        );
        if (!res.ok) {
          // Revert on failure
          setStatus(previous);
          console.error("[StatusPill] update failed", res.status);
        }
      } catch (err) {
        setStatus(previous);
        console.error("[StatusPill] update error", err);
      } finally {
        setIsUpdating(false);
      }
    });
  };

  const isPulsing = status === "new";
  const fontSize = size === "lg" ? 13 : 12;
  const dotSize = size === "lg" ? 8 : 7;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isUpdating}
      title="Click to cycle status"
      style={{
        background: "transparent",
        border: "none",
        cursor: isUpdating ? "wait" : "pointer",
        padding: "6px 10px",
        margin: "-6px -10px",
        borderRadius: 999,
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        fontSize,
        fontWeight: 500,
        fontFamily: "Fraunces, Georgia, serif",
        fontStyle: "italic",
        color: "var(--ink, #1B1E28)",
        flexShrink: 0,
        minWidth: size === "lg" ? 120 : 100,
        opacity: isUpdating ? 0.6 : 1,
        transition: "background 200ms, opacity 200ms",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.background = "rgba(200,90,60,0.08)")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.background = "transparent")
      }
    >
      <span
        className={isPulsing ? "status-dot-pulse" : undefined}
        style={{
          display: "inline-block",
          width: dotSize,
          height: dotSize,
          borderRadius: 999,
          background: DOT[status] || "#6B6258",
          flexShrink: 0,
        }}
      />
      {LABEL[status] || status}
      <style jsx>{`
        @keyframes pulseDot {
          0% { box-shadow: 0 0 0 0 rgba(200,90,60,0.55); }
          70% { box-shadow: 0 0 0 10px rgba(200,90,60,0); }
          100% { box-shadow: 0 0 0 0 rgba(200,90,60,0); }
        }
        :global(.status-dot-pulse) {
          animation: pulseDot 1.8s ease-out infinite;
        }
      `}</style>
    </button>
  );
}
