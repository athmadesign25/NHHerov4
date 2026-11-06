"use client";

import { useEffect, useId, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type Lenis from "lenis";
import useMouseDragScroll from "@/app/search/designs/d20/useMouseDragScroll";
import styles from "./DoctorProfileSectionPicker.module.css";

export default function DoctorProfileSectionPicker({ sections, tone = "light" }: { sections: string[][]; tone?: "light" | "dark" }) {
  const [active, setActive] = useState(sections[0]?.[0] ?? "");
  const [edges, setEdges] = useState({ overflow: false, start: false, end: false });
  const [navHidden, setNavHidden] = useState(false);
  const navHiddenRef = useRef(false);
  const rail = useRef<HTMLDivElement>(null);
  const nav = useRef<HTMLElement>(null);
  const refreshActive = useRef<() => void>(() => {});
  const locked = useRef<string | null>(null);
  const unlockTimer = useRef<number | undefined>(undefined);
  const reduced = useReducedMotion();
  const id = useId();
  const sectionKey = sections.map(section => section[0]).join("|");
  useMouseDragScroll(rail, sectionKey);
  const measureEdges = () => {
    const element = rail.current;
    if (element) setEdges({
      // Measure against the whole track, so reserved arrow gutters cannot
      // themselves keep overflow enabled after the viewport grows.
      overflow: element.scrollWidth > (element.parentElement?.clientWidth ?? element.clientWidth) + 1,
      start: element.scrollLeft > 1,
      end: element.scrollLeft + element.clientWidth < element.scrollWidth - 1,
    });
  };
  const offset = (hidden = navHiddenRef.current) => {
    if (!nav.current) return 0;
    const style = getComputedStyle(nav.current);
    return (hidden ? 0 : parseFloat(style.getPropertyValue("--profile-nav-height"))) + nav.current.offsetHeight + parseFloat(style.getPropertyValue("--profile-anchor-gap"));
  };
  useEffect(() => {
    const navbar = document.querySelector("[data-site-nav]");
    if (!navbar) return;
    const sync = () => {
      navHiddenRef.current = navbar.getAttribute("data-nav-hidden") === "true";
      setNavHidden(navHiddenRef.current);
      const surface = nav.current?.parentElement;
      surface?.style.setProperty("--profile-nav-height", `${navbar.getBoundingClientRect().height}px`);
      surface?.style.setProperty("--profile-nav-offset", navHiddenRef.current ? "0px" : "var(--profile-nav-height)");
      refreshActive.current();
    };
    const observer = new MutationObserver(sync);
    observer.observe(navbar, { attributes: true, attributeFilter: ["data-nav-hidden"] });
    const resize = new ResizeObserver(sync);
    resize.observe(navbar);
    sync();
    return () => { observer.disconnect(); resize.disconnect(); };
  }, []);
  useEffect(() => {
    const element = rail.current;
    if (!element) return;
    const observer = new ResizeObserver(() => {
      measureEdges();
      nav.current?.parentElement?.style.setProperty("--profile-picker-height", `${nav.current.offsetHeight}px`);
    });
    observer.observe(element);
    if (nav.current) observer.observe(nav.current);
    measureEdges();
    return () => observer.disconnect();
  }, [sectionKey]);
  useEffect(() => {
    const ids = sectionKey.split("|");
    let frame = 0;
    const update = () => {
      frame = 0;
      if (locked.current) return;
      let current = ids[0];
      for (const section of ids) {
        if ((document.getElementById(section)?.getBoundingClientRect().top ?? Infinity) <= offset() + 32) current = section;
      }
      setActive(current);
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    refreshActive.current = onScroll;
    const interrupt = () => { locked.current = null; onScroll(); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    window.addEventListener("wheel", interrupt, { passive: true });
    window.addEventListener("touchmove", interrupt, { passive: true });
    return () => {
      refreshActive.current = () => {};
      cancelAnimationFrame(frame); clearTimeout(unlockTimer.current);
      window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll);
      window.removeEventListener("wheel", interrupt); window.removeEventListener("touchmove", interrupt);
    };
  }, [sectionKey]);
  useEffect(() => {
    const element = rail.current;
    const link = element?.querySelector<HTMLElement>('[aria-current="location"]');
    if (!element || !link) return;
    const delta = link.getBoundingClientRect().left - element.getBoundingClientRect().left;
    if (delta < 0 || delta + link.offsetWidth > element.clientWidth) element.scrollTo({ left: element.scrollLeft + delta - (element.clientWidth - link.offsetWidth) / 2, behavior: reduced ? "auto" : "smooth" });
  }, [active, reduced]);
  const choose = (section: string, keyboard: boolean) => {
    const target = document.getElementById(section);
    if (!target) return;
    setActive(section); locked.current = section; clearTimeout(unlockTimer.current);
    const pageTop = target.getBoundingClientRect().top + window.scrollY;
    // The global navbar retreats on downward scrolling and returns on upward
    // scrolling. Land below its final position, not its transient position.
    const delta = pageTop - offset() - window.scrollY;
    const hiddenAtDestination = pageTop - offset(true) >= 120 && (Math.abs(delta) < 12 ? navHiddenRef.current : delta > 0);
    const top = Math.max(0, pageTop - offset(hiddenAtDestination));
    window.history.replaceState(window.history.state, "", `${window.location.pathname}${window.location.search}#${section}`);
    const complete = () => {
      locked.current = null;
      if (keyboard) { const heading = target.querySelector<HTMLElement>("h2"); heading?.setAttribute("tabindex", "-1"); heading?.focus({ preventScroll: true }); }
    };
    const lenis = (window as Window & { __lenis?: Lenis }).__lenis;
    if (lenis) { lenis.resize(); lenis.scrollTo(top, { immediate: !!reduced, duration: .65, onComplete: complete }); }
    else { window.scrollTo({ top, behavior: reduced ? "auto" : "smooth" }); unlockTimer.current = window.setTimeout(complete, reduced ? 0 : 800); }
  };
  const scrollRail = (direction: number) => rail.current?.scrollBy({ left: direction * rail.current.clientWidth * .7, behavior: reduced ? "auto" : "smooth" });
  return <motion.nav ref={nav} layout="position" transition={{ layout: { duration: reduced ? 0 : .6, ease: [.16, 1, .3, 1] } }} className={`${styles.picker} ${navHidden ? styles.navHidden : ""}`} aria-label="Doctor profile sections" data-profile-section-picker data-tone={tone}>
    <div className={styles.track}>
      {edges.overflow && <button className={styles.arrow} type="button" disabled={!edges.start} aria-hidden={!edges.start} tabIndex={edges.start ? 0 : -1} onClick={() => scrollRail(-1)} aria-label="Earlier sections"><ChevronLeft size={16} aria-hidden /></button>}
      <div ref={rail} className={styles.rail} onScroll={measureEdges} data-lenis-prevent-horizontal data-fade-start={edges.start || undefined} data-fade-end={edges.end || undefined}>
        {sections.map(([section, label], index) => <a key={section} href={`#${section}`} aria-current={active === section ? "location" : undefined}
          onFocus={event => {
            const element = rail.current;
            if (!element) return;
            const link = event.currentTarget.getBoundingClientRect(); const bounds = element.getBoundingClientRect();
            if (link.left < bounds.left || link.right > bounds.right) element.scrollBy({ left: link.left - bounds.left - (element.clientWidth - link.width) / 2, behavior: reduced ? "auto" : "smooth" });
          }}
          onClick={event => { if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; event.preventDefault(); choose(section, event.detail === 0); }}
          onKeyDown={event => {
            const next = event.key === "ArrowRight" ? index + 1 : event.key === "ArrowLeft" ? index - 1 : event.key === "Home" ? 0 : event.key === "End" ? sections.length - 1 : null;
            if (next === null) return;
            event.preventDefault(); rail.current?.querySelectorAll<HTMLAnchorElement>("a")[(next + sections.length) % sections.length]?.focus({ preventScroll: true });
          }}>
          {active === section && <motion.span className={styles.selected} layoutId={`${id}-selection`} transition={{ duration: reduced ? 0 : .24, ease: [.22, 1, .36, 1] }} />}
          <span className={styles.label}>{label}</span>
        </a>)}
      </div>
      {edges.overflow && <button className={styles.arrow} type="button" disabled={!edges.end} aria-hidden={!edges.end} tabIndex={edges.end ? 0 : -1} onClick={() => scrollRail(1)} aria-label="More sections"><ChevronRight size={16} aria-hidden /></button>}
    </div>
  </motion.nav>;
}
