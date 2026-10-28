"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Phone, ShieldCheck } from "lucide-react";
import DesignSwitcher from "../DesignSwitcher";
import { isDesign15Variant, isQuickJourneyDesign, resolveJourneyDesign, type JourneyDesign } from "../journeyDesigns";
import { safeReturnTo } from "@/features/booking/design13/navigation";
import styles from "./Design7Shell.module.css";

type JourneyStep = "discover" | "appointment" | "patient" | "review" | "payment" | "confirmed";
const DAYBREAK_QUERY = "(min-width: 1024px) and (prefers-reduced-motion: no-preference)";

function subscribeToDaybreakViewport(onChange: () => void) {
  const query = window.matchMedia(DAYBREAK_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

const daybreakViewport = () => window.matchMedia(DAYBREAK_QUERY).matches;
const staticLightViewport = () => false;

export default function Design7Shell({ children, currentStep = "discover", compact = false, design }: {
  children: ReactNode;
  currentStep?: JourneyStep;
  compact?: boolean;
  design?: JourneyDesign;
}) {
  const pathname = usePathname();
  const params = useSearchParams();
  const router = useRouter();
  const variant = design ?? resolveJourneyDesign(params.get("design"));
  const shell = useRef<HTMLDivElement>(null);
  const canTransition = useSyncExternalStore(subscribeToDaybreakViewport, daybreakViewport, staticLightViewport);
  const [daybreak, setDaybreak] = useState({ path: "", light: false });
  const isLight = variant === "d8" || variant === "d9" || variant === "d11" || variant === "d15-light" ||
    (variant === "d10" && (!canTransition || (daybreak.path === pathname && daybreak.light)));
  const tone = isLight ? "light" : "dark";
  const headerTone = variant === "d9" ? "dark" : tone;
  const stage = currentStep === "discover" ? "discover" : "booking";
  const directoryParams = new URLSearchParams({ design: variant });
  const city = params.get("city") || params.get("location");
  const mode = params.get("mode");
  if (city) directoryParams.set("location", city);
  if (mode === "hospital" || mode === "video") directoryParams.set("mode", mode);
  const directoryFallback = `/search/doctors?${directoryParams.toString()}`;
  const directoryHref = isQuickJourneyDesign(variant) && currentStep !== "discover"
    ? safeReturnTo(params.get("returnTo"), directoryFallback, variant)
    : directoryFallback;

  useEffect(() => {
    if (variant !== "d10" || !canTransition || !shell.current) return;
    const root = shell.current;
    const triggerRatio = stage === "discover" ? 0.18 : 0.28;
    let observer: IntersectionObserver | undefined;
    const observeContent = () => {
      const target = root.querySelector("[data-journey-results], [data-journey-booking-content]");
      if (!target) return false;
      observer?.disconnect();
      observer = new IntersectionObserver(([entry]) => {
        setDaybreak({ path: pathname, light: entry.boundingClientRect.top <= window.innerHeight * triggerRatio });
      }, { rootMargin: `0px 0px -${Math.round(window.innerHeight * (1 - triggerRatio))}px 0px`, threshold: 0 });
      observer.observe(target);
      return true;
    };
    // Booking restores after mount; wait for its visible content without polling.
    const mutations = new MutationObserver(() => {
      if (observeContent()) mutations.disconnect();
    });
    if (!observeContent()) mutations.observe(root, { childList: true, subtree: true });
    window.addEventListener("resize", observeContent);
    return () => { observer?.disconnect(); mutations.disconnect(); window.removeEventListener("resize", observeContent); };
  }, [variant, canTransition, pathname, stage]);

  return <div ref={shell} className={styles.shell} data-design7-shell data-ui-theme={tone}
    data-journey-design={variant} data-journey-tone={tone} data-journey-stage={stage}>
    <a className={styles.skip} href="#d7-content">Skip to content</a>
    <header className={styles.header} data-journey-palette={headerTone}>
      <div className={styles.headerInner}>
        <Link href="/" className={styles.logo} aria-label="Narayana Health home">
          <Image src={headerTone === "dark" ? "/NH-logo-white.svg" : "/NH-logo.svg"} width={84} height={40} alt="Narayana Health" priority />
        </Link>
        <nav className={styles.navigation} aria-label="Appointment navigation">
          <Link href={directoryHref} aria-current={currentStep === "discover" ? "page" : undefined}>
            {currentStep !== "discover" && <ArrowLeft size={16} aria-hidden />}
            Find a doctor
          </Link>
          <Link href="/" className={styles.website}>Explore Narayana <ArrowUpRight size={15} aria-hidden /></Link>
        </nav>
        <a href="tel:18602080208" className={styles.help} aria-label="Need help? Call Narayana Health">
          <Phone size={16} aria-hidden /><span>Need help?</span>
        </a>
      </div>
    </header>
    <div id="d7-content" className={`${styles.content} ${compact ? styles.compact : ""}`} tabIndex={-1}>
      {children}
    </div>
    <footer className={styles.footer}>
      <div>
        <span className={styles.footerBrand}>Care, made simpler.</span>
        <p>Your next step to better health.</p>
      </div>
      {variant !== "d14" && !isDesign15Variant(variant) && <div className={styles.previewNote}>
        <ShieldCheck size={18} aria-hidden />
        <p>Interactive preview. No real appointments, payments or SMS are sent.</p>
      </div>}
      <a href="tel:18602080208">1860 208 0208 <ArrowUpRight size={15} aria-hidden /></a>
    </footer>
    <DesignSwitcher scope="search-top" currentVariant={variant} onVariantChange={(variant) => {
      const next = new URLSearchParams(params.toString());
      next.set("design", variant);
      router.push(`${pathname}?${next.toString()}`);
    }} />
  </div>;
}
