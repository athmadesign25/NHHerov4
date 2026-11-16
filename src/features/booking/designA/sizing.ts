/** The hospital view retains the source card's footprint. Video is content-led.
 * Sizing depends on this view, never the mode from which it was opened. */
export function bookingPanelHeight(sourceHeight: number, naturalHeight: number, availableHeight: number, mode: "hospital" | "video") {
  const desired = mode === "hospital" ? Math.max(sourceHeight, naturalHeight) : naturalHeight;
  return Math.max(0, Math.min(desired, availableHeight));
}
