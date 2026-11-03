/** Keep a pinned heading in view when collapsing its scrolled options. */
export function keepFilterHeadingVisible(trigger: HTMLButtonElement) {
  const viewport = trigger.closest<HTMLElement>("[data-filter-scroll-viewport]");
  const group = trigger.closest<HTMLElement>("[data-filter-group]");
  const header = trigger.closest<HTMLElement>("[data-filter-category-header]");
  if (!viewport || !group || !header) return;

  const inset = parseFloat(getComputedStyle(header).top);
  if (!Number.isFinite(inset)) return;
  const viewportTop = viewport.getBoundingClientRect().top;
  const headerBox = header.getBoundingClientRect();
  if (headerBox.top > viewportTop + inset + 1 || headerBox.bottom <= viewportTop + inset) return;
  const groupTop = group.getBoundingClientRect().top;
  if (groupTop >= viewportTop + inset) return;

  const styles = getComputedStyle(group);
  const padding = parseFloat(styles.paddingTop) + parseFloat(styles.borderTopWidth);
  viewport.scrollTop = Math.max(0, viewport.scrollTop + groupTop + padding - viewportTop - inset);
}

/** Capture before changing the list, then restore its reading position before paint. */
export function prepareFilterListToggle(trigger: HTMLButtonElement, expanding: boolean) {
  const viewport = trigger.closest<HTMLElement>("[data-filter-scroll-viewport]");
  const optionsId = trigger.getAttribute("aria-controls");
  const options = optionsId ? document.getElementById(optionsId) : null;
  const previousRows = new Set(options?.querySelectorAll<HTMLLabelElement>("label"));
  const scrollTop = viewport?.scrollTop ?? 0;
  const triggerOffset = viewport ? trigger.getBoundingClientRect().top - viewport.getBoundingClientRect().top : 0;

  return () => {
    if (expanding) {
      const firstNewRow = Array.from(options?.querySelectorAll<HTMLLabelElement>("label") ?? [])
        .find((row) => !previousRows.has(row));
      // Continue keyboard navigation with the revealed options, not the button now below them.
      const focusTarget = firstNewRow?.querySelector<HTMLInputElement>("input:not(:disabled)") ?? firstNewRow;
      focusTarget?.focus({ preventScroll: true });
      if (viewport) viewport.scrollTop = scrollTop;
    } else if (viewport) {
      // Keep Show less in place when the longer list above it is removed.
      const nextOffset = trigger.getBoundingClientRect().top - viewport.getBoundingClientRect().top;
      viewport.scrollTop += nextOffset - triggerOffset;
      trigger.focus({ preventScroll: true });
    }
  };
}
