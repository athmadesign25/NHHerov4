/** Add future listing previews here; the switcher grows without widening the FAB. */
export const HEALTH_DESIGNS = [
  { id: "1", label: "Design 1", description: "Original" },
  { id: "2", label: "Design 2", description: "Compare & choose" },
  { id: "3", label: "Design 3", description: "Browse by centre" },
] as const;

export type HealthDesign = (typeof HEALTH_DESIGNS)[number]["id"];

export const DEFAULT_HEALTH_DESIGN: HealthDesign = "3";

/** Only explicit preview IDs override the current design, on listing and detail routes. */
export function resolveHealthDesign(value: string | string[] | null | undefined): HealthDesign {
  return HEALTH_DESIGNS.find(design => design.id === value)?.id ?? DEFAULT_HEALTH_DESIGN;
}
