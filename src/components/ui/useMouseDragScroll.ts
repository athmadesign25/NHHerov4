"use client";

import { useEffect, type RefObject } from "react";

type DragGesture = {
  pointerId: number;
  startX: number;
  startY: number;
  scrollLeft: number;
  dragging: boolean;
};

/** Adds desktop grab-to-scroll without changing native touch or simple clicks. */
export default function useMouseDragScroll(ref: RefObject<HTMLDivElement | null>, resetKey?: unknown) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const strip: HTMLDivElement = element;
    let gesture: DragGesture | null = null;
    let suppressClick = false;

    function finish() {
      const finished = gesture;
      gesture = null;
      if (finished?.dragging) suppressClick = true;
      strip.removeAttribute("data-dragging");
      window.removeEventListener("pointermove", move, true);
      window.removeEventListener("pointerup", end, true);
      window.removeEventListener("pointercancel", end, true);
      window.removeEventListener("blur", finish);
      if (finished && strip.hasPointerCapture(finished.pointerId)) strip.releasePointerCapture(finished.pointerId);
    }

    function move(event: PointerEvent) {
      if (!gesture || event.pointerId !== gesture.pointerId) return;
      if (!(event.buttons & 1)) { finish(); return; }
      const deltaX = event.clientX - gesture.startX;
      const deltaY = event.clientY - gesture.startY;
      if (!gesture.dragging) {
        if (Math.abs(deltaX) < 6) return;
        if (Math.abs(deltaY) > Math.abs(deltaX)) { finish(); return; }
        gesture.dragging = true;
        strip.dataset.dragging = "true";
        // Delay capture until this is a drag so a normal button click retains
        // its original target. Window listeners also cover a release outside.
        try { strip.setPointerCapture(event.pointerId); } catch { /* Pointer may already have ended. */ }
      }
      event.preventDefault();
      strip.scrollLeft = gesture.scrollLeft - deltaX;
    }

    function end(event: PointerEvent) {
      if (gesture?.pointerId === event.pointerId) finish();
    }

    function start(event: PointerEvent) {
      if (event.pointerType !== "mouse" || event.button !== 0 || !event.isPrimary) return;
      finish();
      suppressClick = false;
      if (strip.scrollWidth <= strip.clientWidth + 1) return;
      gesture = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        scrollLeft: strip.scrollLeft,
        dragging: false,
      };
      window.addEventListener("pointermove", move, { capture: true, passive: false });
      window.addEventListener("pointerup", end, true);
      window.addEventListener("pointercancel", end, true);
      window.addEventListener("blur", finish);
    }

    function click(event: MouseEvent) {
      if (!suppressClick || event.detail === 0) return;
      suppressClick = false;
      event.preventDefault();
      event.stopImmediatePropagation();
    }

    function dragStart(event: DragEvent) {
      if (gesture) event.preventDefault();
    }

    strip.addEventListener("pointerdown", start, true);
    strip.addEventListener("lostpointercapture", end);
    strip.addEventListener("click", click, true);
    strip.addEventListener("dragstart", dragStart);
    return () => {
      finish();
      strip.removeEventListener("pointerdown", start, true);
      strip.removeEventListener("lostpointercapture", end);
      strip.removeEventListener("click", click, true);
      strip.removeEventListener("dragstart", dragStart);
    };
  }, [ref, resetKey]);
}
