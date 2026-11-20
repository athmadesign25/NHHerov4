import type Lenis from "lenis";

/** Reset the smooth-scroll engine too; native scroll alone is overwritten on its next frame. */
export function scrollHealthToTop() {
  const lenis = (window as Window & { __lenis?: Lenis }).__lenis;
  if (lenis) {
    lenis.resize();
    lenis.scrollTo(0, { immediate: true, force: true });
  } else {
    window.scrollTo({ top: 0, behavior: "instant" });
  }
}
