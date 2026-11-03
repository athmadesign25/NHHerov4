/**
 * Tiny shared store for the drawer's collapsed state.
 *
 * The island variant has to render INSIDE the search experience — it is a
 * fourth bubble in that dock, not a lookalike floating beside it — and
 * that component sits in a different part of the tree. A module-level
 * store is the smallest thing that lets the banner tell it to make room.
 *
 * It was the floating action bar that hosted this before. The bar is
 * gone; the island inherited both the actions and this slot.
 */

export type CollapseMode = "toast" | "island";

let collapsed: CollapseMode | null = null;
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((l) => l());

export const bannerCollapse = {
  show(mode: CollapseMode) {
    collapsed = mode;
    emit();
  },
  clear() {
    collapsed = null;
    emit();
  },
  subscribe(l: () => void) {
    listeners.add(l);
    return () => void listeners.delete(l);
  },
  get: () => collapsed,
  /** Server render has no collapsed state, so it must agree with the first
      client render or hydration mismatches. */
  getServerSnapshot: () => null,
};
