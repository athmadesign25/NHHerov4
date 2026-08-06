"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring, animate } from "framer-motion";
import { ChevronRight, ArrowRight } from "lucide-react";
import styles from "./CentreOfExcellence.module.css";
import Link from "next/link";

const SPECIALITIES = [
  { name: "Cardiology & Cardiac Surgery", href: "/specialities/cardiology", icon: "/Specialities icons/Cardiology.svg", img: "/Specialities icons/Cardiology.jpeg", video: "/Specialities icons/Cardiology.mp4", stats: { value: "5,000+", label: "Cardiac Surgeries Performed" } },
  { name: "Cancer Care", href: "/specialities/oncology", icon: "/Specialities icons/Cancercare.svg", img: "/Specialities icons/Cancer Care.jpeg", video: "/Specialities icons/Cancer Care.mp4", stats: { value: "10,000+", label: "Oncology Patients Treated" } },
  { name: "Neurology & Neurosurgery", href: "/specialities/neurology", icon: "/Specialities icons/Neurology.svg", img: "/Specialities icons/Neurology.jpeg", video: "/Specialities icons/Neurology.mp4", stats: { value: "3,000+", label: "Neuro Surgeries Performed" } },
  { name: "Orthopaedics", href: "/specialities/orthopaedics", icon: "/Specialities icons/Orthopaedics.svg", img: "/Specialities icons/Orthopedics.jpeg", video: "/Specialities icons/Orthopedics.mp4", stats: { value: "8,000+", label: "Joint Replacements" } },
  { name: "Nephrology & Transplant", href: "/specialities/nephrology", icon: "/Specialities icons/Nephrology.svg", img: "/Specialities icons/Nephrology.jpeg", video: "/Specialities icons/Nephrology.mp4", stats: { value: "2,000+", label: "Kidney Transplants" } },
  { name: "Gastroenterology", href: "/specialities/gastroenterology", icon: "/Specialities icons/Gastro.svg", img: "/Specialities icons/Gastroenterology.jpeg", video: "/Specialities icons/Gastroenterology.mp4", stats: { value: "15,000+", label: "Endoscopies Performed" } },
];

const RollingNumber = ({ value, isHovered }: { value: string, isHovered: boolean }) => {
  const numValue = parseInt(value.replace(/,/g, "").replace(/\+/g, ""));
  const hasPlus = value.includes("+");
  const [displayValue, setDisplayValue] = React.useState("0");

  React.useEffect(() => {
    if (isHovered) {
      const controls = animate(0, numValue, {
        duration: 1.2,
        ease: "easeOut",
        onUpdate: (val) => {
          setDisplayValue(Math.floor(val).toLocaleString());
        }
      });
      return controls.stop;
    } else {
      setDisplayValue("0");
    }
  }, [isHovered, numValue]);

  return <span>{displayValue}{hasPlus ? "+" : ""}</span>;
};

const SpecialityCardItem = ({ spec }: { spec: typeof SPECIALITIES[0] }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovered, setIsHovered] = React.useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  return (
    <Link 
      aria-label={spec.name} 
      href={spec.href} 
      className={styles.specialityCard}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <img alt={spec.name} loading="lazy" src={spec.img} className={styles.cardImage} />
      {spec.video && (
        <video 
          ref={videoRef}
          src={spec.video}
          className={styles.cardVideo}
          muted
          loop
          playsInline
        />
      )}
      <div className={styles.cardTextWrap}>
        {spec.stats && (
          <div className={styles.cardStats}>
            <div className={styles.metricValue}>
              <RollingNumber value={spec.stats.value} isHovered={isHovered} />
            </div>
            <div className={styles.metricLabel}>{spec.stats.label}</div>
          </div>
        )}
        <span className={styles.specialityName}>{spec.name}</span>
        <span className={styles.cardAction}>
          Explore <ChevronRight size={14} />
        </span>
      </div>
    </Link>
  );
};

export default function CentreOfExcellence() {
  const containerRef = useRef<HTMLElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [maxScroll, setMaxScroll] = React.useState(0);

  React.useEffect(() => {
    const handleResize = () => {
      if (wrapRef.current && gridRef.current) {
        const wrapWidth = wrapRef.current.clientWidth;
        const gridWidth = gridRef.current.scrollWidth;
        const offsetFromRight = wrapWidth / 2;
        const scrollDistance = gridWidth - (wrapWidth / 2) - offsetFromRight;
        setMaxScroll(Math.max(0, scrollDistance));
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 70,
    damping: 25,
    mass: 1,
    restDelta: 0.001
  });

  const xTransform = useTransform(smoothProgress, [0, 0.8], [0, -maxScroll], { clamp: true });

  return (
    <section ref={containerRef} className={styles.scrollContainer} id="centre-of-excellence">
      <div className={styles.stickySection}>
        <div className="container">
          <div className={styles.header}>
            <div className="section-eyebrow">CENTRES OF EXCELLENCE</div>
            <h2 className={styles.sectionTitle}>40+ Specialities. World-Class Care.</h2>
            <p className={`section-subtitle ${styles.sectionSubtitle}`}>
              Integrated expertise across tertiary and quaternary care, delivered through one trusted network.
            </p>
          </div>
        </div>

        <div ref={wrapRef} className={styles.specialitiesGridWrap}>
          <motion.div 
            ref={gridRef} 
            className={styles.specialitiesGrid} 
            style={{ x: xTransform }}
          >
          {SPECIALITIES.map((spec) => (
            <SpecialityCardItem key={spec.name} spec={spec} />
          ))}
          <Link href="/specialities" className={styles.viewAllCard}>
            <div className={styles.viewAllContent}>
              <div className={styles.viewAllIconWrap}>
                <ArrowRight size={24} />
              </div>
              <span className={styles.viewAllSubText}>View all</span>
            </div>
          </Link>
        </motion.div>
      </div>
      </div>
    </section>
  );
}
