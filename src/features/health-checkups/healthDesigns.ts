/** Approved health-checkup design for the final handoff. */
export const HEALTH_DESIGNS = [
  { id: "4", label: "Design 4", description: "Discover your checkup" },
] as const;

export type HealthDesign = (typeof HEALTH_DESIGNS)[number]["id"];

export const DEFAULT_HEALTH_DESIGN: HealthDesign = "4";

/** Older preview links resolve to the approved design on listing and detail routes. */
export function resolveHealthDesign(value: string | string[] | null | undefined): HealthDesign {
  return HEALTH_DESIGNS.find(design => design.id === value)?.id ?? DEFAULT_HEALTH_DESIGN;
}
