"use client";

import React, { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import styles from "./HealthPackages.module.css";
import TextSweepEffect from "@/components/ui/TextSweepEffect";

type PackageCard = {
  id: string;
  name: string;
  image: string;
  testsCount: number;
  reportsWithin: string;
  variant: 1 | 2 | 3;
  // A representative sample of included tests (not the full testsCount) —
  // shown as individual chips on hover, with the remainder summarized as
  // one "+N more" chip. See TEST_CHIPS_SHOWN below.
  tests: string[];
};

// How many individual test-name chips to show before collapsing the rest
// into a single "+N more" chip — 2 per row x 3 rows, per spec.
const TEST_CHIPS_SHOWN = 6;

// Mock/demo data, keyed by city — packages (and their contents) genuinely
// vary per unit, so this is structured as a lookup rather than one fixed
// list. Only Bangalore is populated for now; any other/undetected city
// falls through to the empty state below. `variant` selects one of three
// fixed card treatments (background gradient/border/shadow) from the
// design spec — cosmetic only, not tied to package content.
const PACKAGES_BY_CITY: Record<string, PackageCard[]> = {
  Bangalore: [
    {
      id: "healthy-heart",
      name: "Healthy Heart Package",
      image: "/health-packages/heart.png",
      testsCount: 42,
      reportsWithin: "8 hours",
      variant: 1,
      tests: ["ECG", "2D Echo", "Lipid Profile", "HbA1c", "Blood Pressure", "Chest X-Ray"],
    },
    {
      id: "thyroid-health",
      name: "Thyroid Health Package",
      image: "/health-packages/thyroid.png",
      testsCount: 15,
      reportsWithin: "2 hours",
      variant: 2,
      tests: ["TSH", "T3", "T4", "Anti-TPO", "Free T3", "Free T4"],
    },
    {
      id: "diabetes-care",
      name: "Diabetes Package",
      image: "/health-packages/diabetes.png",
      testsCount: 9,
      reportsWithin: "06:45 PM",
      variant: 3,
      tests: ["FBS", "PPBS", "HbA1c", "Lipid Profile", "Kidney Function", "Urine Routine"],
    },
  ],
};

// No real geolocation wired up — mock detected city, same convention as
// the rest of the homepage's placeholder data.
const DETECTED_CITY = "Bangalore";

// Inline SVGs (design-provided, exact paths) rather than lucide icons —
// these three have no lucide equivalent close enough to the spec.
function UspIconBooking() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M15.9137 3.99918C16.0268 3.67854 16.0277 3.32898 15.9161 3.00779C15.8045 2.68661 15.5872 2.41285 15.2996 2.23142C15.012 2.04998 14.6714 1.97162 14.3334 2.00919C13.9955 2.04675 13.6804 2.19802 13.4397 2.43818L4.43968 11.4382C4.22982 11.6479 4.08687 11.9151 4.02891 12.2061C3.97094 12.4971 4.00056 12.7987 4.11403 13.0728C4.22749 13.347 4.4197 13.5813 4.66635 13.7462C4.91299 13.9111 5.20299 13.9991 5.49968 13.9992H9.50168C9.58156 13.9993 9.66025 14.0185 9.73116 14.0553C9.80207 14.092 9.86315 14.1453 9.90927 14.2105C9.95539 14.2757 9.98522 14.351 9.99625 14.4301C10.0073 14.5092 9.9992 14.5898 9.97268 14.6652L8.08568 19.9992C7.97249 20.3199 7.97167 20.6696 8.08336 20.9909C8.19505 21.3122 8.41261 21.5859 8.70035 21.7673C8.9881 21.9487 9.32894 22.0269 9.66697 21.9891C10.005 21.9512 10.3201 21.7997 10.5607 21.5592L19.5607 12.5592C19.7703 12.3493 19.9129 12.0821 19.9707 11.7912C20.0284 11.5003 19.9986 11.1988 19.8851 10.9249C19.7715 10.6509 19.5793 10.4167 19.3327 10.252C19.0861 10.0872 18.7962 9.99924 18.4997 9.99918H14.5027C14.4226 9.99929 14.3437 9.98017 14.2725 9.94342C14.2014 9.90667 14.1401 9.85337 14.0938 9.788C14.0476 9.72263 14.0177 9.64711 14.0067 9.56779C13.9957 9.48846 14.0039 9.40766 14.0307 9.33218L15.9137 3.99918Z" stroke="#FEF5F5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function UspIconCare() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M3.85019 8.61912C3.70423 7.96165 3.72665 7.27796 3.91535 6.63146C4.10405 5.98496 4.45294 5.39657 4.92966 4.92084C5.40638 4.44512 5.9955 4.09747 6.6424 3.91012C7.2893 3.72277 7.97303 3.70179 8.63019 3.84912C8.9919 3.28342 9.4902 2.81788 10.0791 2.49541C10.6681 2.17293 11.3287 2.00391 12.0002 2.00391C12.6716 2.00391 13.3323 2.17293 13.9212 2.49541C14.5102 2.81788 15.0085 3.28342 15.3702 3.84912C16.0284 3.70114 16.7133 3.72203 17.3612 3.90983C18.0091 4.09764 18.599 4.44626 19.076 4.92327C19.5531 5.40029 19.9017 5.99019 20.0895 6.63812C20.2773 7.28605 20.2982 7.97095 20.1502 8.62912C20.7159 8.99083 21.1814 9.48912 21.5039 10.0781C21.8264 10.667 21.9954 11.3277 21.9954 11.9991C21.9954 12.6706 21.8264 13.3312 21.5039 13.9202C21.1814 14.5091 20.7159 15.0074 20.1502 15.3691C20.2975 16.0263 20.2765 16.71 20.0892 17.3569C19.9018 18.0038 19.5542 18.5929 19.0785 19.0697C18.6027 19.5464 18.0144 19.8953 17.3679 20.084C16.7213 20.2727 16.0377 20.2951 15.3802 20.1491C15.019 20.717 14.5203 21.1845 13.9303 21.5084C13.3404 21.8324 12.6782 22.0022 12.0052 22.0022C11.3322 22.0022 10.67 21.8324 10.0801 21.5084C9.49011 21.1845 8.99143 20.717 8.63019 20.1491C7.97303 20.2965 7.2893 20.2755 6.6424 20.0881C5.9955 19.9008 5.40638 19.5531 4.92966 19.0774C4.45294 18.6017 4.10405 18.0133 3.91535 17.3668C3.72665 16.7203 3.70423 16.0366 3.85019 15.3791C3.28015 15.0184 2.81061 14.5193 2.48524 13.9283C2.15988 13.3374 1.98926 12.6737 1.98926 11.9991C1.98926 11.3245 2.15988 10.6609 2.48524 10.0699C2.81061 9.47895 3.28015 8.97988 3.85019 8.61912Z" stroke="#FEF5F5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M16 9L10.5 14.5L8 12" stroke="#FEF5F5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function UspIconReports() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M6.5998 21C6.12241 21 5.66458 20.8104 5.32701 20.4728C4.98945 20.1352 4.7998 19.6774 4.7998 19.2V4.8C4.7998 4.32261 4.98945 3.86478 5.32701 3.52721C5.66458 3.18965 6.12241 3 6.5998 3H13.7998C14.0847 2.99954 14.3669 3.05544 14.6301 3.16449C14.8933 3.27354 15.1323 3.43359 15.3334 3.6354L18.5626 6.8646C18.765 7.06576 18.9255 7.30501 19.0348 7.56855C19.1442 7.83208 19.2003 8.11468 19.1998 8.4V19.2C19.1998 19.6774 19.0102 20.1352 18.6726 20.4728C18.335 20.8104 17.8772 21 17.3998 21H6.5998Z" stroke="#FEF5F5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M13.7998 3V7.5C13.7998 7.7387 13.8946 7.96761 14.0634 8.1364C14.2322 8.30518 14.4611 8.4 14.6998 8.4H19.1998" stroke="#FEF5F5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10.2004 12.8984H8.40039" stroke="#FEF5F5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M15.6004 16.5H8.40039" stroke="#FEF5F5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

const USPS = [
  { icon: UspIconBooking, label: "Quick & easy online booking" },
  { icon: UspIconCare, label: "Complete care from trusted specialists" },
  { icon: UspIconReports, label: "Fast, same-day reports" },
];

// Card fact icons (tests / reports-within) — each card instance renders its
// own copy, so gradient ids get a per-card suffix to stay unique in the DOM.
// `flat`, used by the light-mode card variant, swaps the two-tone gradient
// for a single flat fill matching the USP row's icon color exactly (per
// spec: "icon can be same color as USP icon") rather than a gradient.
function FactIconTests({ idSuffix, flat }: { idSuffix: string; flat?: boolean }) {
  const gid = `hp-tests-grad-${idSuffix}`;
  return (
    <svg width="22" height="22" viewBox="0 0 23 23" fill="none" aria-hidden>
      <path d="M22.4206 7.48364L16.1246 1.18761C16.0466 1.10956 15.954 1.04764 15.8521 1.0054C15.7502 0.963151 15.6409 0.941406 15.5306 0.941406C15.4203 0.941406 15.3111 0.963151 15.2092 1.0054C15.1072 1.04764 15.0147 1.10956 14.9367 1.18761L1.3761 14.7482C0.494999 15.6293 0 16.8243 0 18.0704C0 19.3165 0.494999 20.5115 1.3761 21.3926C2.25721 22.2737 3.45224 22.7687 4.69831 22.7687C5.94438 22.7687 7.13941 22.2737 8.02051 21.3926L19.7616 9.65157L22.0921 8.87506C22.228 8.82988 22.35 8.7507 22.4466 8.64506C22.5433 8.53942 22.6113 8.41082 22.6442 8.27149C22.6771 8.13216 22.6738 7.98673 22.6347 7.84901C22.5956 7.7113 22.5218 7.58589 22.4206 7.48469V7.48364ZM19.0428 8.12059C18.919 8.16168 18.8066 8.23102 18.7143 8.32311L14.5621 12.4753C13.6733 12.7797 12.2798 12.8951 10.4623 11.9507C9.35002 11.3693 8.34476 11.1112 7.46541 11.0346L15.5306 2.96834L20.2726 7.7103L19.0428 8.12059Z" fill={flat ? "#FEF5F5" : `url(#${gid})`} />
      {!flat && (
        <defs>
          <linearGradient id={gid} x1="11.3333" y1="0.941406" x2="11.3333" y2="22.7687" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FEF5F5" />
            <stop offset="1" stopColor="#989393" />
          </linearGradient>
        </defs>
      )}
    </svg>
  );
}

function FactIconReports({ idSuffix, flat }: { idSuffix: string; flat?: boolean }) {
  const gid = `hp-reports-grad-${idSuffix}`;
  return (
    <svg width="22" height="22" viewBox="0 0 23 23" fill="none" aria-hidden>
      <path d="M20.6677 4.61397L16.3087 0.255C16.2277 0.174068 16.1315 0.109891 16.0256 0.0661378C15.9198 0.022384 15.8064 -8.97825e-05 15.6919 2.69558e-07H6.97393C6.5115 2.69558e-07 6.06802 0.183699 5.74103 0.510686C5.41404 0.837672 5.23034 1.28116 5.23034 1.74359V3.48718H3.48675C3.02433 3.48718 2.58084 3.67088 2.25385 3.99787C1.92686 4.32485 1.74316 4.76834 1.74316 5.23077V20.9231C1.74316 21.3855 1.92686 21.829 2.25385 22.156C2.58084 22.483 3.02433 22.6667 3.48675 22.6667H15.6919C16.1543 22.6667 16.5978 22.483 16.9248 22.156C17.2518 21.829 17.4355 21.3855 17.4355 20.9231V19.1795H19.1791C19.6415 19.1795 20.085 18.9958 20.412 18.6688C20.739 18.3418 20.9227 17.8983 20.9227 17.4359V5.23077C20.9227 5.11625 20.9003 5.00283 20.8565 4.897C20.8128 4.79117 20.7486 4.695 20.6677 4.61397ZM12.2047 18.3077H6.97393C6.74272 18.3077 6.52097 18.2158 6.35748 18.0523C6.19399 17.8889 6.10214 17.6671 6.10214 17.4359C6.10214 17.2047 6.19399 16.9829 6.35748 16.8194C6.52097 16.656 6.74272 16.5641 6.97393 16.5641H12.2047C12.4359 16.5641 12.6577 16.656 12.8212 16.8194C12.9846 16.9829 13.0765 17.2047 13.0765 17.4359C13.0765 17.6671 12.9846 17.8889 12.8212 18.0523C12.6577 18.2158 12.4359 18.3077 12.2047 18.3077ZM12.2047 14.8205H6.97393C6.74272 14.8205 6.52097 14.7287 6.35748 14.5652C6.19399 14.4017 6.10214 14.1799 6.10214 13.9487C6.10214 13.7175 6.19399 13.4958 6.35748 13.3323C6.52097 13.1688 6.74272 13.0769 6.97393 13.0769H12.2047C12.4359 13.0769 12.6577 13.1688 12.8212 13.3323C12.9846 13.4958 13.0765 13.7175 13.0765 13.9487C13.0765 14.1799 12.9846 14.4017 12.8212 14.5652C12.6577 14.7287 12.4359 14.8205 12.2047 14.8205ZM19.1791 17.4359H17.4355V8.71795C17.4356 8.60343 17.4131 8.49001 17.3693 8.38418C17.3256 8.27835 17.2614 8.18218 17.1805 8.10115L12.8215 3.74218C12.7405 3.66125 12.6443 3.59707 12.5385 3.55332C12.4326 3.50956 12.3192 3.48709 12.2047 3.48718H6.97393V1.74359H15.3312L19.1791 5.59147V17.4359Z" fill={flat ? "#FEF5F5" : `url(#${gid})`} />
      {!flat && (
        <defs>
          <linearGradient id={gid} x1="11.3329" y1="0" x2="11.3329" y2="22.6667" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FEF5F5" />
            <stop offset="1" stopColor="#989393" />
          </linearGradient>
        </defs>
      )}
    </svg>
  );
}

function ArrowGlyph({ dark }: { dark?: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
      <path d="M16.9992 5.43781V14.2778C16.9992 14.4582 16.9275 14.6311 16.8 14.7586C16.6725 14.8862 16.4995 14.9578 16.3192 14.9578C16.1388 14.9578 15.9659 14.8862 15.8383 14.7586C15.7108 14.6311 15.6392 14.4582 15.6392 14.2778V7.07916L5.92027 16.7989C5.79267 16.9265 5.61961 16.9982 5.43917 16.9982C5.25872 16.9982 5.08566 16.9265 4.95807 16.7989C4.83047 16.6713 4.75879 16.4983 4.75879 16.3178C4.75879 16.1374 4.83047 15.9643 4.95807 15.8367L14.6778 6.11781H7.47917C7.29882 6.11781 7.12586 6.04617 6.99833 5.91864C6.87081 5.79112 6.79917 5.61816 6.79917 5.43781C6.79917 5.25747 6.87081 5.0845 6.99833 4.95698C7.12586 4.82946 7.29882 4.75781 7.47917 4.75781H16.3192C16.4995 4.75781 16.6725 4.82946 16.8 4.95698C16.9275 5.0845 16.9992 5.25747 16.9992 5.43781Z" fill={dark ? "#1A1A2E" : "white"}/>
    </svg>
  );
}

const PHASE1_END = 0.32;
const MOBILE_BREAKPOINT = 900;

// Once the frame has grown past this fraction of its own grow-in (p1),
// it COMMITS to being fully grown regardless of exact further scroll
// position — removes the need to scroll precisely to land on "100% grown"
// for the section to feel fully "stuck". Release back to normal
// scroll-linked growth only once scrolled back up past a distinctly lower
// fraction (hysteresis avoids flicker right at one boundary value).
const GROW_COMMIT_FRACTION = 0.7;
const GROW_RELEASE_FRACTION = 0.55;
// How long the snap (frame width/height/radius/scale, on commit or
// release) takes to visually settle — a real CSS transition, applied only
// for this one moment, not during normal per-scroll updates.
const SNAP_TRANSITION_MS = 420;

// Card/label/explore reveal is time-based once "full", not scroll-linked
// — scrolling further (or stopping) doesn't change how it plays out.
// Scrolling back up out of "full" reverses it over a fixed, quicker
// duration instead of unwinding at the same pace it played forward.
const AUTO_REVEAL_STAGGER_MS = 130;
const AUTO_REVEAL_ITEM_MS = 500;
const AUTO_REVERSE_MS = 420;

// Package card entrance: blur + grow into place, plus a small per-card
// vertical offset so the three don't all settle from the exact same
// height — alternating up/down rather than a uniform slide-up.
const CARD_SCALE_FROM = 0.85;
const CARD_BLUR_FROM_PX = 14;
const CARD_ENTRY_Y_OFFSETS_PX = [26, -18, 22];

// Mouse-follow tilt on hover: max rotation in degrees at the card's own
// edge (cursor at dead center = 0deg). Kept small/subtle per spec.
const TILT_MAX_DEG = 2.5;

const EASE = [0.16, 1, 0.3, 1] as const;

// Centered text reveal: a strict one-by-one sequence — eyebrow, then title
// (via TextSweepEffect, the same sweep-in treatment used for every other
// section's title), then each USP item — gated on the `textRevealed`
// boolean (see the scroll-trigger writeup above applyState) rather than a
// generic whileInView, since this section is sticky-pinned and a naive
// viewport check would fire the instant the pinned box exists at all. Each
// stage's start delay is derived from the one before it finishing (or
// nearly finishing), so the sequence reads as continuous rather than
// segmented.
const TITLE_LINES = ["Making preventive care simple,", "seamless and stress free."];
const TITLE_SWEEP_MS = 1400;

const TEXT_REVEAL_EYEBROW_DELAY = 0;
const TEXT_REVEAL_TITLE_DELAY = 0.3;
// USPs start a bit before the title's own sweep fully resolves, so the
// sequence reads as continuous rather than strictly segmented.
const TEXT_REVEAL_USP_BASE_DELAY = TEXT_REVEAL_TITLE_DELAY + (TITLE_SWEEP_MS / 1000) * 0.65;
const TEXT_REVEAL_USP_STAGGER = 0.12;

// Enter/exit scale — restores the previous version's "text grows in with
// the section, then everything eases back down as you scroll past it"
// feel. Enter scales the frame's CONTENT (so copy grows in step with the
// photo, not just the crop window); exit scales the frame itself back
// down and un-rounds it as it scrolls away, computed from the section's
// own bottom edge crossing the viewport post-pin — no extra page height
// needed, it just rides the natural scroll-away distance.
const ENTER_SCALE_FROM = 0.84;
const EXIT_SCALE_TO = 0.9;
const EXIT_RADIUS_PX = 20;
const EXIT_DURATION = 0.75;

// Threshold (on phase-1 progress) past which the frame is fully grown and
// covers the whole viewport — the page bg swaps to light exactly then, so
// the switch is hidden behind opaque content instead of ever being seen.
const LIGHT_SWITCH_THRESHOLD = 0.98;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export default function HealthPackages() {
  const sectionRef = useRef<HTMLElement>(null);
  const stickyViewportRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const bgVideoRef = useRef<HTMLVideoElement>(null);
  const scrimDullRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const railItemRefs = useRef<(HTMLElement | null)[]>([]);
  // Background video: only ever plays while the section has actually
  // appeared on screen, and (on desktop) pauses the instant the auto
  // card-reveal starts (see applyAutoReveal) — resuming immediately if you
  // scroll back up out of the "full" state, and simply staying paused for
  // the rest of the scroll once past that point. Driven by a manual
  // ping-pong scrubber (see stepPingPong below) rather than native loop,
  // so "should it be advancing right now" lives in this one ref. The
  // forward leg still uses real play()/pause() (see stepPingPong) — only
  // the reverse leg has no native equivalent to fall back on.
  const hasAppearedRef = useRef(false);
  const videoShouldPlayRef = useRef(false);
  // Ping-pong scrub state: +1/-1 direction currently playing, the previous
  // rAF timestamp (for real elapsed time between ticks, reset to null on
  // pause so a resume doesn't compute one huge jump), and an accumulator
  // for throttling the manual reverse-seek rate (see stepPingPong).
  const pingPongDirRef = useRef<1 | -1>(1);
  const pingPongLastTsRef = useRef<number | null>(null);
  const pingPongReverseAccumRef = useRef(0);
  const pingPongRafRef = useRef<number | null>(null);
  // Left-column text reveal gate — flips true exactly once (ref-guarded,
  // same one-shot pattern as hasAppearedRef/isPlayingRef above) the moment
  // the scroll-driven trigger condition below is met, and drives the
  // Framer Motion word/line/item reveal further down via `animate` rather
  // than initial/whileInView.
  const textRevealedRef = useRef(false);
  const [textRevealed, setTextRevealed] = useState(false);

  // Dark/light card preview toggle — a temporary review-only control (see
  // the floating button further down), not a permanent product feature.
  // isLightMode drives which color variant the package cards render in;
  // sectionVisible mirrors hasAppearedRef into React state purely so the
  // toggle button itself can mount/unmount (it has no reason to float over
  // any other section on the page).
  const [isLightMode, setIsLightMode] = useState(false);
  const [sectionVisible, setSectionVisible] = useState(false);

  // "growing": frame size/radius tracks raw scroll (p1raw) as before.
  // "full": frame is pinned at its fully-grown end values and the card
  // reveal plays out on its own timer instead of scroll position — see
  // GROW_COMMIT_FRACTION/GROW_RELEASE_FRACTION above for how the two sides
  // switch. hasInitializedRef lets the very first applyState call (which
  // may already land past the commit point if the page loads mid-scroll)
  // set state instantly instead of visibly animating on load.
  const sectionPhaseRef = useRef<"growing" | "full">("growing");
  const hasInitializedRef = useRef(false);
  // Current position (ms) within the card-reveal timeline — driven by
  // startAutoForward/startAutoReverse's own rAF loops, not by scroll.
  const autoElapsedRef = useRef(0);
  const autoRafRef = useRef<number | null>(null);
  const snapTimeoutRef = useRef<number | null>(null);
  // True only once the forward reveal has fully settled (elapsed reached
  // totalAutoMs) — gates the mouse-follow tilt handlers below so they
  // never fight the entrance animation's own inline-style writes to the
  // same element while a card is still mid-reveal.
  const cardsSettledRef = useRef(false);

  const packages = PACKAGES_BY_CITY[DETECTED_CITY] ?? [];
  const hasPackages = packages.length > 0;
  const railSlots = hasPackages ? ["label", ...packages.map((p) => p.id), "explore"] : ["explore"];
  // Last rail item's own reveal finishes at this elapsed time — the auto
  // timeline runs from 0 to exactly this many ms.
  const totalAutoMs = (railSlots.length - 1) * AUTO_REVEAL_STAGGER_MS + AUTO_REVEAL_ITEM_MS;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduced = mq.matches;
    const isMobile = () => window.innerWidth < MOBILE_BREAKPOINT;

    // Drives the card row + label + explore button + bottom overlay +
    // text-block parallax purely off elapsed ms within the reveal
    // timeline — startAutoForward/startAutoReverse below are the only
    // things that ever change what `elapsedMs` is; scroll position
    // itself never touches this.
    const applyAutoReveal = (elapsedMs: number) => {
      const scrimDull = scrimDullRef.current;
      const leftCol = leftColRef.current;
      const bgVideo = bgVideoRef.current;
      const overallT = clamp01(elapsedMs / totalAutoMs);
      if (scrimDull) scrimDull.style.opacity = String(overallT * 0.7);
      if (leftCol) leftCol.style.transform = `translateY(${-34 * overallT}px)`;

      railItemRefs.current.forEach((el, i) => {
        if (!el) return;
        const startMs = i * AUTO_REVEAL_STAGGER_MS;
        const t = clamp01((elapsedMs - startMs) / AUTO_REVEAL_ITEM_MS);
        const isCard = hasPackages && i >= 1 && i <= packages.length;
        const isExplore = i === railSlots.length - 1;
        if (isCard) {
          const cardIdx = i - 1;
          const yOffset = CARD_ENTRY_Y_OFFSETS_PX[cardIdx % CARD_ENTRY_Y_OFFSETS_PX.length] * (1 - t);
          el.style.transform = `translateY(${yOffset.toFixed(2)}px) scale(${CARD_SCALE_FROM + (1 - CARD_SCALE_FROM) * t})`;
          el.style.filter = `blur(${CARD_BLUR_FROM_PX * (1 - t)}px)`;
        } else if (isExplore) {
          el.style.transform = `scale(${CARD_SCALE_FROM + (1 - CARD_SCALE_FROM) * t})`;
          el.style.filter = `blur(${CARD_BLUR_FROM_PX * (1 - t)}px)`;
        } else {
          // "Most Booked in {city}" label — a plain blur-in, no motion
          // (used to slide in via translateX, which read as floating into
          // frame rather than simply resolving into focus).
          el.style.transform = "none";
          el.style.filter = `blur(${CARD_BLUR_FROM_PX * (1 - t)}px)`;
        }
        el.style.opacity = String(t);
      });

      // Video pauses the instant the reveal has genuinely started, resumes
      // the instant it's fully back to 0 (i.e. reverse has completed) —
      // stepPingPong below reads this ref each frame rather than this
      // calling play()/pause() directly.
      if (bgVideo) {
        videoShouldPlayRef.current = hasAppearedRef.current && elapsedMs <= 0;
      }
    };

    // Plays elapsed forward at real wall-clock speed (1:1) from wherever it
    // currently is up to totalAutoMs, then stops — this is what "auto,
    // fires once the section is full, not linked to scroll" means: once
    // triggered, it just runs on its own for totalAutoMs regardless of
    // whatever the user's scroll position does in the meantime.
    const startAutoForward = () => {
      if (autoRafRef.current) cancelAnimationFrame(autoRafRef.current);
      cardsSettledRef.current = false;
      const startTime = performance.now() - autoElapsedRef.current;
      const step = (now: number) => {
        const elapsed = Math.min(now - startTime, totalAutoMs);
        autoElapsedRef.current = elapsed;
        applyAutoReveal(elapsed);
        if (elapsed < totalAutoMs) {
          autoRafRef.current = requestAnimationFrame(step);
        } else {
          autoRafRef.current = null;
          cardsSettledRef.current = true;
        }
      };
      autoRafRef.current = requestAnimationFrame(step);
    };

    // Unwinds elapsed back to 0 over a fixed short duration regardless of
    // how far in the reveal currently is — a quick "close" rather than the
    // slower forward pace played in reverse.
    const startAutoReverse = () => {
      if (autoRafRef.current) cancelAnimationFrame(autoRafRef.current);
      cardsSettledRef.current = false;
      const from = autoElapsedRef.current;
      if (from <= 0) {
        applyAutoReveal(0);
        return;
      }
      const startTime = performance.now();
      const step = (now: number) => {
        const t = clamp01((now - startTime) / AUTO_REVERSE_MS);
        const elapsed = from * (1 - t);
        autoElapsedRef.current = elapsed;
        applyAutoReveal(elapsed);
        if (t < 1) {
          autoRafRef.current = requestAnimationFrame(step);
        } else {
          autoRafRef.current = null;
        }
      };
      autoRafRef.current = requestAnimationFrame(step);
    };

    // Real CSS transition applied only for the one "snap" moment (commit
    // or release), then cleared — so normal per-scroll updates during the
    // "growing" phase stay instant or, once dependent CSS var is set,
    // the transition doesn't fight later continuous updates.
    const enableFrameSnapTransition = () => {
      const frame = frameRef.current;
      const grid = gridRef.current;
      const bgVideo = bgVideoRef.current;
      const transition = `width ${SNAP_TRANSITION_MS}ms ease, height ${SNAP_TRANSITION_MS}ms ease, border-radius ${SNAP_TRANSITION_MS}ms ease, transform ${SNAP_TRANSITION_MS}ms ease`;
      if (frame) frame.style.transition = transition;
      if (grid) grid.style.transition = `transform ${SNAP_TRANSITION_MS}ms ease`;
      if (bgVideo) bgVideo.style.transition = `transform ${SNAP_TRANSITION_MS}ms ease`;
      if (snapTimeoutRef.current) window.clearTimeout(snapTimeoutRef.current);
      snapTimeoutRef.current = window.setTimeout(() => {
        if (frame) frame.style.transition = "";
        if (grid) grid.style.transition = "";
        if (bgVideo) bgVideo.style.transition = "";
      }, SNAP_TRANSITION_MS + 60);
    };

    const applyState = (p: number, exitP: number) => {
      const frame = frameRef.current;
      const bgVideo = bgVideoRef.current;
      const grid = gridRef.current;
      if (!frame || !bgVideo || !grid) return;

      const p1raw = clamp01(p / PHASE1_END);
      const exitT = clamp01(exitP / EXIT_DURATION);

      if (!hasInitializedRef.current) {
        // First-ever call (mount): if the page happens to load already
        // scrolled past the commit point, jump straight to "full" with no
        // animation instead of visibly snapping/auto-revealing on load.
        hasInitializedRef.current = true;
        if (p1raw >= GROW_COMMIT_FRACTION) {
          sectionPhaseRef.current = "full";
          autoElapsedRef.current = totalAutoMs;
          cardsSettledRef.current = true;
        } else {
          sectionPhaseRef.current = "growing";
          autoElapsedRef.current = 0;
        }
        applyAutoReveal(autoElapsedRef.current);
      } else {
        const wasFull = sectionPhaseRef.current === "full";
        if (!wasFull && p1raw >= GROW_COMMIT_FRACTION) {
          sectionPhaseRef.current = "full";
          enableFrameSnapTransition();
          startAutoForward();
        } else if (wasFull && p1raw < GROW_RELEASE_FRACTION) {
          sectionPhaseRef.current = "growing";
          enableFrameSnapTransition();
          startAutoReverse();
        }
      }

      // Re-checked on every scroll tick (not just at the exact moment a
      // phase transition fires startAutoForward/startAutoReverse's own
      // per-frame applyAutoReveal calls) — otherwise this stays stuck at
      // whichever value it last had from mount or the last transition,
      // e.g. never noticing hasAppearedRef flipped true while just
      // continuing to scroll within an already-settled phase.
      videoShouldPlayRef.current = hasAppearedRef.current && autoElapsedRef.current <= 0;

      const isFull = sectionPhaseRef.current === "full";
      const p1 = isFull ? 1 : p1raw;

      // Frame: box grow (width/height/radius) while entering, then a
      // separate scale-down + un-round as it exits — the two never
      // overlap in time, so they can share the one element cleanly.
      const enterScale = ENTER_SCALE_FROM + (1 - ENTER_SCALE_FROM) * p1;
      const exitScale = 1 - (1 - EXIT_SCALE_TO) * exitT;
      frame.style.width = `${76 + 24 * p1}%`;
      frame.style.height = `${72 + 28 * p1}%`;
      const exitRadiusPx = EXIT_RADIUS_PX * exitT;
      const enterRadiusPx = 26 * (1 - p1);
      frame.style.borderRadius = `${exitRadiusPx > 0 ? exitRadiusPx : enterRadiusPx}px`;
      frame.style.transform = `scale(${exitScale})`;
      bgVideo.style.transform = `scale(${1.14 - 0.08 * p1})`;

      // Content (copy + rail) grows in with the frame, then eases back
      // down together with it on exit — restores the "text enlarges with
      // the section" feel from the previous version.
      grid.style.transform = `scale(${enterScale * exitScale})`;

      // Left-column text reveal: one-shot gate, flips the React state on
      // as soon as the section/frame has actually entered the screen
      // (hasAppearedRef, from the IntersectionObserver below) rather than
      // waiting for the frame to be almost fully grown — text used to only
      // show up right as the section committed to "full", which read as
      // appearing far too late. Never flips back once true — the Framer
      // Motion word/line/item choreography below is driven entirely off
      // that boolean, not off p1 or hasAppeared directly, so it plays out
      // on its own timeline once triggered.
      if (!textRevealedRef.current && hasAppearedRef.current) {
        textRevealedRef.current = true;
        setTextRevealed(true);
      }

      // Page bg swaps to light once the frame fully covers the viewport —
      // hidden behind the opaque photo, so the switch is never seen, and
      // it's already light by the time the exit shrink reveals the edges
      // again. Fully reversible on scroll-up. Applied directly here (same
      // rAF tick as the frame's own width/height/scale) rather than via a
      // React state + CSS class, which had just enough render lag for a
      // brief flash of the wrong color to show through on a fast scroll-up
      // — this keeps the color switch perfectly in sync with the frame.
      const stickyViewport = stickyViewportRef.current;
      const nextIsLight = p1 >= LIGHT_SWITCH_THRESHOLD;
      if (stickyViewport) {
        stickyViewport.style.backgroundColor = nextIsLight ? "var(--color-bg, #fafcfc)" : "#031224";
      }
    };

    const computeProgress = () => {
      const section = sectionRef.current;
      if (!section) return { p: 0, exitP: 0 };
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = rect.height - vh;
      const p = total <= 0 ? 0 : clamp01(-rect.top / total);
      const exitP = clamp01((vh - rect.bottom) / vh);
      return { p, exitP };
    };

    let ticking = false;
    const tick = () => {
      ticking = false;
      if (reduced || isMobile()) return;
      const { p, exitP } = computeProgress();
      applyState(p, exitP);
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(tick);
    };
    const onResize = () => {
      if (!reduced && !isMobile()) {
        const { p, exitP } = computeProgress();
        applyState(p, exitP);
      }
    };
    const onMotionChange = () => {
      reduced = mq.matches;
      if (reduced) applyState(1, 0);
    };

    if (reduced) {
      applyState(1, 0);
    } else if (!isMobile()) {
      const { p, exitP } = computeProgress();
      applyState(p, exitP);
    } else if (!textRevealedRef.current) {
      // Mobile: no sticky pin, so applyState's scroll-driven trigger check
      // never runs — the left-column text should just be visible like the
      // rest of the static mobile layout (matches the rail's own mobile
      // CSS override further down, which forces the same items opaque).
      textRevealedRef.current = true;
      setTextRevealed(true);
    }

    // Drives hasAppearedRef and, for desktop, immediately re-syncs the
    // video the moment visibility changes (rather than waiting for the
    // next scroll event, which might not come right away if the page
    // loads with the section already in view). On mobile/reduced-motion,
    // where applyState's own scroll-driven phase-2 gating never runs,
    // this is the only thing controlling play/pause — simple
    // visible-or-not, since there's no cards-overlay phase to also gate on
    // there.
    const section = sectionRef.current;
    let observer: IntersectionObserver | null = null;
    if (section) {
      observer = new IntersectionObserver(
        ([entry]) => {
          hasAppearedRef.current = entry.isIntersecting;
          setSectionVisible(entry.isIntersecting);
          if (reduced || isMobile()) {
            videoShouldPlayRef.current = entry.isIntersecting;
          } else {
            const { p, exitP } = computeProgress();
            applyState(p, exitP);
          }
        },
        { threshold: 0 }
      );
      observer.observe(section);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    mq.addEventListener?.("change", onMotionChange);

    // Manual ping-pong loop. Forward uses REAL play() — native decode
    // paints every frame smoothly, same as any normal <video>. Reverse has
    // no native equivalent (negative playbackRate isn't decoded by any
    // major engine), so it falls back to manually walking currentTime
    // backward — but only ever at a throttled interval, never every rAF
    // tick: seeking a compressed video re-decodes from the prior keyframe
    // forward, and re-issuing a new seek before the decoder finishes
    // painting the last one just cancels it, so a plain per-frame seek
    // updates the *number* every tick but the *picture* never visibly
    // changes (confirmed by diffing screenshots — currentTime was
    // advancing correctly the whole time, the frame on screen wasn't).
    // Spacing seeks out (see PING_PONG_REVERSE_SEEK_INTERVAL_MS) gives the
    // decoder time to actually land each one, at the cost of the reverse
    // leg looking closer to a slideshow than smooth playback.
    //
    // videoShouldPlayRef (set above, and by the observer below) gates
    // whether either leg advances at all or just holds position, so this
    // composes with the same pause-on-reveal/resume-on-scroll-up rules as
    // a plain play()/pause() pair would.
    //
    // A tiny inset from the true 0/duration boundary — setting currentTime
    // to EXACTLY video.duration is a known cross-browser edge case (some
    // engines snap it back toward 0 instead of holding at the end), so
    // both turnaround points sit just inside the real ends instead.
    const PING_PONG_EDGE_INSET_S = 0.05;
    const PING_PONG_REVERSE_SEEK_INTERVAL_MS = 90;
    const stepPingPong = (ts: number) => {
      const video = bgVideoRef.current;
      const last = pingPongLastTsRef.current;
      pingPongLastTsRef.current = ts;
      if (video && Number.isFinite(video.duration) && video.duration > 0 && last !== null) {
        const deltaMs = Math.min(ts - last, 100);
        const maxT = Math.max(0, video.duration - PING_PONG_EDGE_INSET_S);
        const minT = PING_PONG_EDGE_INSET_S;

        if (!videoShouldPlayRef.current) {
          if (!video.paused) video.pause();
        } else if (pingPongDirRef.current === 1) {
          if (video.paused) video.play().catch(() => {});
          if (video.currentTime >= maxT) {
            video.pause();
            pingPongDirRef.current = -1;
            pingPongReverseAccumRef.current = 0;
          }
        } else {
          if (!video.paused) video.pause();
          pingPongReverseAccumRef.current += deltaMs;
          if (pingPongReverseAccumRef.current >= PING_PONG_REVERSE_SEEK_INTERVAL_MS) {
            const stepSec = pingPongReverseAccumRef.current / 1000;
            pingPongReverseAccumRef.current = 0;
            let next = video.currentTime - stepSec;
            if (next <= minT) {
              next = minT;
              pingPongDirRef.current = 1;
            }
            video.currentTime = next;
          }
        }
      }
      pingPongRafRef.current = requestAnimationFrame(stepPingPong);
    };
    pingPongRafRef.current = requestAnimationFrame(stepPingPong);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      mq.removeEventListener?.("change", onMotionChange);
      observer?.disconnect();
      if (autoRafRef.current) cancelAnimationFrame(autoRafRef.current);
      if (snapTimeoutRef.current) window.clearTimeout(snapTimeoutRef.current);
      if (pingPongRafRef.current) cancelAnimationFrame(pingPongRafRef.current);
    };
  }, [railSlots.length]);

  // Mouse-follow tilt — only once a card has actually settled (see
  // cardsSettledRef above), so this never races the entrance animation's
  // own writes to the same element's inline transform. .cardStack itself
  // carries the shared `perspective` (see CSS), so each card's own
  // transform only needs the rotation, not a repeated perspective(...).
  const handleCardMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!cardsSettledRef.current) return;
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const rotateY = (px - 0.5) * 2 * TILT_MAX_DEG;
    const rotateX = -(py - 0.5) * 2 * TILT_MAX_DEG;
    el.style.transform = `scale(1.05) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;
  };

  const handleCardMouseLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!cardsSettledRef.current) return;
    e.currentTarget.style.transform = "scale(1)";
  };

  return (
    <section
      ref={sectionRef}
      className={styles.section}
      id="health-packages"
      // Always "dark" here, deliberately not tied to the sticky viewport's
      // own bg-color switch above (applyState's nextIsLight) — that flips
      // early, as soon as the frame is fully grown, purely so the color is
      // already correct once the exit shrink reveals it, while it's safely
      // hidden behind the still-opaque frame the entire time in between.
      // The FAB/navbar probe THIS attribute to decide text color, so it
      // needs to track what's actually on screen (dark photo/video/cards
      // for virtually the whole dwell), not that internal pre-emption.
      // Once the section has genuinely scrolled past (out of the FAB's
      // fixed screen position), the probe naturally picks up
      // whichever section comes next instead — no dynamic toggle needed.
      data-nav-theme="dark"
    >
      <div ref={stickyViewportRef} className={styles.stickyViewport}>
        <div ref={frameRef} className={styles.frame}>
          {/* No `loop` — looping is handled manually via ping-pong scrubbing
              (see stepPingPong in the effect above), not native playback. */}
          <video
            ref={bgVideoRef}
            className={styles.bgVideo}
            src="/5411341_Coll_wavebreak_People_1280x720.mp4"
            muted
            playsInline
            aria-hidden
          />
          <div className={styles.scrimBase} aria-hidden />
          <div className={styles.titleBlur} aria-hidden>
            <div className={`${styles.titleBlurLayer} ${styles.titleBlurLayer1}`} />
            <div className={`${styles.titleBlurLayer} ${styles.titleBlurLayer2}`} />
            <div className={`${styles.titleBlurLayer} ${styles.titleBlurLayer3}`} />
            <div className={`${styles.titleBlurLayer} ${styles.titleBlurLayer4}`} />
          </div>
          <div className={styles.topOverlay} aria-hidden />
          <div ref={scrimDullRef} className={styles.bottomOverlay} aria-hidden />

          <div ref={gridRef} className={styles.grid}>
            <div ref={leftColRef} className={styles.textBlock}>
              <div className={styles.titleGroup}>
                {/* Eyebrow (label + dash) slides in from above as one unit,
                    first in the sequence. */}
                <motion.div
                  className={styles.eyebrowUnit}
                  initial={{ opacity: 0, y: -16, filter: "blur(6px)" }}
                  animate={textRevealed ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
                  transition={{ duration: 0.6, delay: TEXT_REVEAL_EYEBROW_DELAY, ease: EASE }}
                >
                  <div className="section-eyebrow">PREVENTIVE HEALTH PACKAGES</div>
                </motion.div>
                <h2 className={styles.title}>
                  <TextSweepEffect
                    words={[TITLE_LINES.join(" ")]}
                    sweepMs={TITLE_SWEEP_MS}
                    delayMs={TEXT_REVEAL_TITLE_DELAY * 1000}
                    finalColor="#ffffff"
                    active={textRevealed}
                  />
                </h2>
              </div>
              <ul className={styles.uspList}>
                {USPS.map((usp, uspIdx) => (
                  <motion.li
                    key={usp.label}
                    className={styles.uspItem}
                    initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
                    animate={textRevealed ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
                    transition={{
                      duration: 0.5,
                      delay: TEXT_REVEAL_USP_BASE_DELAY + uspIdx * TEXT_REVEAL_USP_STAGGER,
                      ease: EASE,
                    }}
                  >
                    <span className={styles.uspIconBox}>
                      <usp.icon />
                    </span>
                    <span className={styles.uspLabel}>{usp.label}</span>
                  </motion.li>
                ))}
              </ul>
            </div>

            <div className={styles.bottomStack}>
              {hasPackages ? (
                <>
                  <div
                    ref={(el) => { railItemRefs.current[railSlots.indexOf("label")] = el; }}
                    className={styles.railLabel}
                  >
                    Most Booked in {DETECTED_CITY}
                  </div>

                  <div className={styles.cardStack}>
                    {packages.map((pkg) => {
                      const overflowCount = pkg.testsCount - TEST_CHIPS_SHOWN;
                      return (
                        // Fixed-height slot is the actual grid item (so the
                        // hover-expanded card's extra height never affects
                        // grid sizing or pushes siblings); the card itself
                        // is absolutely positioned within it, bottom-
                        // anchored, so growing height pushes its own top
                        // edge up instead of the slot's bottom edge down.
                        <div key={pkg.id} className={styles.packageCardSlot}>
                          <Link
                            href={`/health-packages/${pkg.id}`}
                            ref={(el) => { railItemRefs.current[railSlots.indexOf(pkg.id)] = el; }}
                            className={`${styles.packageCard} ${styles[`packageCardV${pkg.variant}`]} ${isLightMode ? styles.packageCardLightMode : ""}`}
                            onMouseMove={handleCardMouseMove}
                            onMouseLeave={handleCardMouseLeave}
                          >
                            <span className={styles.packageCardBorder} aria-hidden />
                            <img src={pkg.image} alt="" className={styles.packageCardImage} />
                            <div className={styles.packageCardContent}>
                              <h3 className={styles.packageCardTitle}>{pkg.name}</h3>
                              <div className={styles.packageCardFacts}>
                                {/* Reports first, tests second (order shifted from the
                                    original tests-then-reports layout) — this fact row
                                    stays put on hover while the tests row below it grows
                                    downward into the individual test-name chips. */}
                                <div className={styles.packageCardFact}>
                                  <span className={styles.packageCardFactIcon}>
                                    <FactIconReports idSuffix={pkg.id} flat={isLightMode} />
                                  </span>
                                  <span className={styles.packageCardFactText}>
                                    <span className={styles.factLight}>Reports within</span>
                                    <span className={styles.factBold}>{pkg.reportsWithin}</span>
                                  </span>
                                </div>
                                <div className={`${styles.packageCardFact} ${styles.packageCardFactTests}`}>
                                  <span className={styles.packageCardFactIcon}>
                                    <FactIconTests idSuffix={pkg.id} flat={isLightMode} />
                                  </span>
                                  <div className={styles.packageCardTestsSwap}>
                                    {/* Simple count — visible normally, blurs out on hover. */}
                                    <span className={styles.packageCardTestsSimple}>
                                      <span className={styles.factBold}>{pkg.testsCount} tests</span>
                                      <span className={styles.factLight}>included</span>
                                    </span>
                                    {/* Individual test chips — hidden normally (0fr grid
                                        row, see CSS), blurs into view on hover at its
                                        exact natural height. */}
                                    <div className={styles.packageCardTestChipsWrap}>
                                      <div className={styles.packageCardTestChipsInner}>
                                        <div className={styles.packageCardTestChips}>
                                          {pkg.tests.map((t) => (
                                            <span key={t} className={styles.testChip}>{t}</span>
                                          ))}
                                          {overflowCount > 0 && (
                                            <span className={styles.testChip}>+{overflowCount} more</span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <span className={styles.arrowBadge} aria-hidden>
                              <ArrowGlyph dark={isLightMode} />
                            </span>
                          </Link>
                        </div>
                      );
                    })}
                  </div>

                  <Link
                    href="/health-packages"
                    ref={(el) => { railItemRefs.current[railSlots.indexOf("explore")] = el; }}
                    className={styles.exploreRow}
                  >
                    Explore all packages
                  </Link>
                </>
              ) : (
                <Link
                  href="/hospitals"
                  ref={(el) => { railItemRefs.current[railSlots.indexOf("explore")] = el; }}
                  className={styles.exploreRow}
                >
                  Find a check-up near you
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Review-only preview toggle — not a real product feature, just a
          quick way to compare the dark vs. light package-card treatments
          side by side. Rendered as a direct child of <section> (not
          inside .frame/.grid, both of which set will-change/transform and
          would otherwise become this fixed element's containing block
          instead of the viewport), and only while the section itself is
          on screen. */}
      {sectionVisible && (
        <button
          type="button"
          className={styles.modeToggle}
          onClick={() => setIsLightMode((v) => !v)}
          aria-label="Toggle package card preview between dark and light mode"
        >
          {isLightMode ? "Light cards" : "Dark cards"}
        </button>
      )}
    </section>
  );
}
