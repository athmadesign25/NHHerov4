"use client";

import React, { useState, useEffect } from "react";
import type { MotionValue } from "framer-motion";
import NHSearchExperienceDesktop from "./NHSearchExperienceDesktop";
import NHSearchExperienceMobile from "./NHSearchExperienceMobile";

export type SearchState = "landing" | "active" | "results" | "skeleton" | "pulse";

export interface AnchorRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface NHSearchExperienceProps {
  onOpenChange?: (open: boolean) => void;
  initialState?: SearchState;
  initialLocation?: string;
  onOpenPulseAI?: (query: string) => void;
  scrollProgress?: MotionValue<number>;
  anchorRect?: AnchorRect;
}

export default function NHSearchExperience(props: NHSearchExperienceProps) {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 900);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile, { passive: true });
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // During SSR or before measurement, render desktop experience by default
  if (isMobile) {
    return <NHSearchExperienceMobile {...props} />;
  }

  return <NHSearchExperienceDesktop {...props} />;
}
