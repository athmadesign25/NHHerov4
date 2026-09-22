"use client";

import React from "react";

interface PulseAIAvatarProps {
  size?: number;
  className?: string;
  isPulsing?: boolean;
}

/**
 * Official Pulse AI Avatar Icon matching the mobile app design (Image 1 reference)
 * Features:
 * - Soft coral / pink ambient aura beneath
 * - Gradient ring from violet (#8B5CF6) to electric blue (#2563EB)
 * - Inner clean white disc
 * - 5 vertical cyan/sky-blue frequency soundwave bars (#00C4FF)
 */
export default function PulseAIAvatar({
  size = 34,
  className = "",
  isPulsing = false,
}: PulseAIAvatarProps) {
  const strokeWidth = Math.max(2, size * 0.08);
  const barWidth = Math.max(1.8, size * 0.058);
  const gap = Math.max(1.5, size * 0.045);

  const barHeights = [
    size * 0.16,
    size * 0.32,
    size * 0.50,
    size * 0.32,
    size * 0.16,
  ];

  return (
    <div
      className={className}
      style={{
        position: "relative",
        width: size,
        height: size,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
      aria-hidden="true"
    >
      {/* ── Soft Coral / Pink Ambient Aura (Seen beneath icon in screenshot) ── */}
      <div
        style={{
          position: "absolute",
          inset: -Math.max(2, size * 0.1),
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(244, 63, 94, 0.45) 0%, rgba(244, 63, 94, 0.15) 52%, transparent 72%)",
          transform: `translateY(${Math.max(2, size * 0.08)}px)`,
          filter: "blur(2.5px)",
          pointerEvents: "none",
        }}
      />

      {/* ── Vibrant Gradient Ring (Purple/Violet to Electric Blue) ── */}
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          padding: `${strokeWidth}px`,
          background: "linear-gradient(135deg, #8B5CF6 0%, #6366F1 45%, #2563EB 100%)",
          boxShadow: isPulsing
            ? "0 0 16px rgba(139, 92, 246, 0.5), 0 2px 8px rgba(37, 99, 235, 0.35)"
            : "0 2px 8px rgba(37, 99, 235, 0.22)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxSizing: "border-box",
          position: "relative",
          zIndex: 1,
          transition: "box-shadow 0.3s ease",
        }}
      >
        {/* ── Inner White Disc ── */}
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            background: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: `${gap}px`,
          }}
        >
          {/* ── 5 Soundwave Frequency Bars (Cyan / Sky Blue) ── */}
          {barHeights.map((h, i) => (
            <span
              key={i}
              style={{
                width: `${barWidth}px`,
                height: `${h}px`,
                borderRadius: `${barWidth}px`,
                background: "linear-gradient(180deg, #00C4FF 0%, #0099FF 100%)",
                display: "inline-block",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
