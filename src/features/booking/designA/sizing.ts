/** Keep both consultation modes at the source-card height, capped by the viewport. */
export function bookingPanelHeight(sourceHeight: number, availableHeight: number) {
  return Math.max(0, Math.min(sourceHeight, availableHeight));
}
