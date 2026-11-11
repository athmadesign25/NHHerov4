/** Add future listing previews here; the switcher grows without widening the FAB. */
export const HEALTH_DESIGNS = [
  { id: "1", label: "Design 1", description: "Original" },
  { id: "2", label: "Design 2", description: "Compare & choose" },
] as const;

export type HealthDesign = (typeof HEALTH_DESIGNS)[number]["id"];
