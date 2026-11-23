/** Shared visual variants of the complete appointment preview. */
export const JOURNEY_DESIGNS = ["d7", "d8", "d9", "d10", "d11", "d12", "d13", "d14", "d15-light", "d15-dark"] as const;
export type JourneyDesign = typeof JOURNEY_DESIGNS[number];
export type Design15Variant = "d15-light" | "d15-dark";
export type QuickJourneyDesign = "d13" | "d14" | Design15Variant;

export function isDesign15Variant(value: string | null | undefined): value is Design15Variant {
  return value === "d15-light" || value === "d15-dark";
}

export function isQuickJourneyDesign(value: string | null | undefined): value is QuickJourneyDesign {
  return value === "d13" || value === "d14" || isDesign15Variant(value);
}

export function isJourneyDesign(value: string | null | undefined): value is JourneyDesign {
  return JOURNEY_DESIGNS.some(design => design === value);
}

export function resolveJourneyDesign(value: string | null | undefined): JourneyDesign {
  return isJourneyDesign(value) ? value : "d7";
}

export const JOURNEY_DESIGN_NAMES: Record<JourneyDesign, string> = {
  d7: "Midnight glass",
  d8: "Pearl",
  d9: "Contrast",
  d10: "Daybreak",
  d11: "Clarity",
  d12: "Midnight clarity",
  d13: "Care, without the wait",
  d14: "Care, in focus",
  "d15-light": "Care, made clear · Light",
  "d15-dark": "Care, made clear · Dark",
};
