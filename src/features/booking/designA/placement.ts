export interface BookingSourceBounds {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface BookingResultsBounds {
  left: number;
  width: number;
}

/**
 * Edge cards keep their outer edge; interior cards grow equally to both sides.
 * Expansion stays within the results grid, never across its sidebar.
 * Source height is the baseline: content changes must not recenter the panel.
 */
export function expandedBookingPlacement(
  source: BookingSourceBounds,
  viewport: { width: number; height: number },
  panel: { width: number; height: number },
  gutter: number,
  results?: BookingResultsBounds,
) {
  const clamp = (value: number, minimum: number, maximum: number) => Math.min(Math.max(minimum, value), maximum);
  const horizontalGutter = Math.min(Math.max(0, gutter), viewport.width / 2);
  const verticalGutter = Math.min(Math.max(0, gutter), viewport.height / 2);
  const viewportLeft = horizontalGutter;
  const viewportRight = viewport.width - horizontalGutter;
  const leftBoundary = results ? clamp(results.left, viewportLeft, viewportRight) : viewportLeft;
  const rightBoundary = results
    ? clamp(results.left + Math.max(0, results.width), leftBoundary, viewportRight)
    : viewportRight;

  const sourceLeft = clamp(source.left, leftBoundary, rightBoundary);
  const sourceRight = clamp(source.left + source.width, leftBoundary, rightBoundary);
  const centre = (sourceLeft + sourceRight) / 2;
  // Account for subpixel grid rounding without mistaking an interior column
  // for an edge column simply because it has slightly more room on one side.
  const edge: "left" | "right" | "center" = sourceLeft - leftBoundary <= 1
    ? "left" : rightBoundary - sourceRight <= 1 ? "right" : "center";
  const availableWidth = edge === "left" ? rightBoundary - sourceLeft
    : edge === "right" ? sourceRight - leftBoundary
    : 2 * Math.min(centre - leftBoundary, rightBoundary - centre);
  const width = Math.min(Math.max(0, panel.width), availableWidth);
  const height = Math.min(Math.max(0, source.height), Math.max(0, viewport.height - verticalGutter * 2));

  return {
    left: edge === "left" ? sourceLeft : edge === "right" ? sourceRight - width : centre - width / 2,
    top: clamp(source.top, verticalGutter, viewport.height - verticalGutter - height),
    width,
    height,
    edge,
  };
}
