import React from "react";

interface VirusIconProps {
  size?: number;
  stroke?: string;
  color?: string;
  className?: string;
}

export function VirusIcon({
  size = 14,
  stroke = "currentColor",
  color,
  className,
}: VirusIconProps) {
  const iconStroke = color || stroke || "currentColor";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={iconStroke}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="7" />
      <path d="M12 14.991h.01" />
      <path d="M12 22v-3" />
      <path d="M12 2v3" />
      <path d="M13 22h-2" />
      <path d="M13 2h-2" />
      <path d="M13.99 10H14" />
      <path d="m16.5 19.794-1-1.733" />
      <path d="m16.5 4.205-1 1.732" />
      <path d="m19.794 16.5-1.732-1" />
      <path d="m19.794 7.5-1.732 1" />
      <path d="M2 12h3" />
      <path d="M2 13v-2" />
      <path d="M22 12h-3" />
      <path d="M22 13v-2" />
      <path d="m4.206 16.5 1.732-1" />
      <path d="m4.206 7.5 1.732 1" />
      <path d="m7.5 19.794 1-1.733" />
      <path d="m7.5 4.205 1 1.732" />
      <path d="M9 12h.01" />
    </svg>
  );
}

export default VirusIcon;
