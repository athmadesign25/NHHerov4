"use client";

import React from "react";

export type SpecialityDesignId = 1 | 2;

export interface SpecialityDesignMeta {
  id: SpecialityDesignId;
  label: string;
  shortLabel: string;
  description: string;
  badge: string;
}

export const SPECIALITY_DESIGNS: SpecialityDesignMeta[] = [
  {
    id: 1,
    label: "Design 1",
    shortLabel: "Design 1",
    description: "Design 1 (Current Master)",
    badge: "Design 1",
  },
  {
    id: 2,
    label: "Design 2",
    shortLabel: "Design 2",
    description: "Design 2 (Customized)",
    badge: "Design 2",
  },
];

interface SpecialityDesignControllerProps {
  activeDesign?: SpecialityDesignId;
  onDesignChange?: (id: SpecialityDesignId) => void;
}

export default function SpecialityDesignController(
  _props?: SpecialityDesignControllerProps
) {
  // Controller hidden as requested — Design 2 is the permanent final variation
  return null;
}
