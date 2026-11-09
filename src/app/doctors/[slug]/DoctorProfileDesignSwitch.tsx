"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronUp } from "lucide-react";
import styles from "./DoctorProfileDesignSwitch.module.css";

/** Keep the profile exploration independent of the booking design parameter. */
export default function DoctorProfileDesignSwitch({ active, tone = "light" }: { active: 1 | 2; tone?: "light" | "dark" }) {
  const pathname = usePathname();
  const query = useSearchParams();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    const dismiss = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, [open]);

  useEffect(() => {
    const preview = root.current;
    const dock = preview?.closest("[data-doctor-profile]")?.querySelector<HTMLElement>("[data-profile-booking]");
    if (!preview) return;
    let frame = 0;
    const position = () => {
      const gap = parseFloat(getComputedStyle(preview).getPropertyValue("--space-8"));
      const bounds = preview.getBoundingClientRect();
      const dockBounds = dock?.getBoundingClientRect();
      const overlaps = dockBounds && bounds.left < dockBounds.right && bounds.right > dockBounds.left;
      if (overlaps) {
        preview.style.setProperty("--preview-dock-clearance", `${Math.max(0, window.innerHeight - dockBounds.top) + gap}px`);
      } else {
        preview.style.removeProperty("--preview-dock-clearance");
      }

      const menu = preview.querySelector<HTMLElement>("[data-preview-options]");
      if (menu) {
        // A tall mobile booking picker can leave too little space above the FAB.
        // Reposition only this temporary preview menu, never the booking controls.
        const positioned = preview.getBoundingClientRect();
        const above = Math.max(0, positioned.top - gap);
        const below = Math.max(0, window.innerHeight - positioned.bottom - gap);
        const menuHeight = menu.scrollHeight + menu.offsetHeight - menu.clientHeight;
        const down = above < menuHeight && below > above;
        preview.dataset.openDirection = down ? "down" : "up";
        preview.style.setProperty("--preview-menu-space", `${down ? below : above}px`);
      }
    };
    const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(position); };
    const observer = new ResizeObserver(schedule);
    if (dock) observer.observe(dock);
    observer.observe(preview);
    window.addEventListener("resize", schedule);
    position();
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", schedule);
      preview.style.removeProperty("--preview-dock-clearance");
      preview.style.removeProperty("--preview-menu-space");
      delete preview.dataset.openDirection;
    };
  }, [open]);

  return <nav ref={root} className={styles.switcher} aria-label="Profile design preview" data-tone={tone} data-profile-preview
    onKeyDown={event => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        trigger.current?.focus({ preventScroll: true });
      }
    }}
    onBlur={event => {
      if (event.relatedTarget instanceof Node && !event.currentTarget.contains(event.relatedTarget)) setOpen(false);
    }}>
    <button ref={trigger} type="button" className={styles.trigger} aria-label={`Compare doctor profile designs. Design ${active} selected`} aria-expanded={open} aria-controls={open ? id : undefined} onClick={() => setOpen(value => !value)}>
      <span>Design {active}</span><ChevronUp aria-hidden className={open ? styles.expanded : undefined} />
    </button>
    {open && <div id={id} className={styles.options} role="group" aria-label="Choose profile design" data-preview-options data-lenis-prevent>
      {([1, 2] as const).map(design => {
        const params = new URLSearchParams(query.toString());
        params.set("profileDesign", String(design));
        return <Link key={design} href={`${pathname}?${params.toString()}`} aria-current={design === active ? "page" : undefined} onClick={() => {
          setOpen(false);
          trigger.current?.focus({ preventScroll: true });
        }}><span>Design {design}</span>{design === active && <Check aria-hidden />}</Link>;
      })}
    </div>}
  </nav>;
}
