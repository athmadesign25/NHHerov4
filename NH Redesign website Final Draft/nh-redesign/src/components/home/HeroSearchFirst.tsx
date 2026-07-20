"use client";

import React from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import { Search } from "lucide-react";
import SplitText from "@/components/ui/SplitText";
import styles from "./HeroSearchFirst.module.css";
import Lottie from "lottie-react";
import pulseAnimation from "../../../public/assets/pulse animation.json";

const popularTags = ["chest pain", "cancer", "surgery", "liver"];

export default function HeroSearchFirst() {
  const searchRef = React.useRef<HTMLDivElement>(null);

  const prefersReducedMotion = useReducedMotion();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);

  React.useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (!searchRef.current?.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <section className={styles.hero} id="hero-section-search-first">
      <video
        src="/Hero Video.mp4"
        autoPlay
        muted
        loop
        playsInline
        className={styles.bgVideo}
      />
      <div className={styles.videoOverlay} />

      <div className={styles.centerWrap}>
        <div className={styles.heroStack}>
          <div className={styles.titleUnit}>
            <SplitText text="Trusted Care, Every Day" tag="h1" className={styles.headline} delay={0.05} />
            <p className={styles.subHeadline}>
              Compassion Backed by Expertise
            </p>
            <form className={styles.searchBarForm} onSubmit={(e) => e.preventDefault()} style={{ marginTop: '32px' }}>
              <div className={styles.searchContainer}>
                <div className={styles.searchIconWrapper}>
                  <Search className={styles.searchIcon} size={18} />
                </div>
                <input
                  type="text"
                  placeholder="Book Doctors, Find Specialities or Treatments.."
                  className={styles.searchInput}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className={styles.pulseIconWrapper} style={{ marginRight: '10px' }}>
                  <Lottie animationData={pulseAnimation} className={styles.pulseIcon} loop={true} />
                </div>
              </div>
            </form>
          </div>


        </div>
      </div>

      <div className={styles.pulseShellAnchor}>
        <div className={styles.pulseShell}>
          <div className={styles.pulseInner}>
            <div className={styles.pulseCenterUnit}>
              <div
                className={`${styles.logoGlow} ${prefersReducedMotion ? styles.logoGlowStatic : ""}`}
                aria-hidden
              />
              <div className={styles.pulseLogoUnit}>
                <img src="/pulse-ai.png" alt="Pulse AI" className={styles.pulseLogoImg} />
              </div>
              <div className={styles.pulseTextUnit}>
                <div className={styles.pulseTitle}>Ask Pulse AI</div>
                <p className={styles.pulseDescription}>Describe your symptoms, or ask a question..</p>
                <p className={styles.pulseVersion}>v1.0</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
