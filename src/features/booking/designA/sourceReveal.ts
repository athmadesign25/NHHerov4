interface SourceVerticalBounds {
  top: number;
  height: number;
}

/** Reserve the stable toolbar extent, not its animated hide/show transform. */
export function readBookingSourceSafeTop(sourceHeight: number, viewportHeight: number, gutter: number) {
  const toolbar = document.querySelector<HTMLElement>("[data-d3-search-bar]");
  const toolbarBottom = toolbar
    ? (parseFloat(getComputedStyle(toolbar).top) || 0) + toolbar.offsetHeight
    : 0;
  return bookingSourceSafeTop(sourceHeight, viewportHeight, gutter, toolbarBottom);
}

export function bookingSourceSafeTop(sourceHeight: number, viewportHeight: number, gutter: number, toolbarBottom: number) {
  const belowToolbar = Math.max(gutter, toolbarBottom + gutter);
  // On a short viewport, prioritise the close button and booking action. The
  // modal owns the viewport; insisting on the toolbar gap would hide its foot.
  return sourceHeight <= viewportHeight - belowToolbar - gutter ? belowToolbar : gutter;
}

/** The closest scroll position that reveals the source, bounded by the page. */
export function bookingSourceRevealScroll(
  source: SourceVerticalBounds,
  viewportHeight: number,
  scrollTop: number,
  maximumScroll: number,
  safeTop: number,
  gutter: number,
) {
  const availableHeight = Math.max(0, viewportHeight - safeTop - gutter);
  let delta = 0;
  if (source.height > availableHeight || source.top < safeTop) delta = source.top - safeTop;
  else if (source.top + source.height > viewportHeight - gutter) delta = source.top + source.height - viewportHeight + gutter;
  return Math.min(Math.max(0, scrollTop + delta), Math.max(0, maximumScroll));
}
