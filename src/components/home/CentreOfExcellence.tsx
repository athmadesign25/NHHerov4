"use client";

import React, { useRef } from "react";
import { animate, motion, useScroll, useTransform, useSpring } from "framer-motion";
import { ChevronRight, ArrowRight } from "lucide-react";
import styles from "./CentreOfExcellence.module.css";
import Link from "next/link";

const SPECIALITIES = [
  { name: "Cardiology & Cardiac Surgery", href: "/specialities/cardiology", icon: "/Specialities icons/Cardiology.svg", img: "/Specialities icons/Cardiology.jpeg", video: "/Specialities icons/Cardiology.mp4", stats: { value: "5K+", label: "Cardiac Surgeries Performed" } },
  { name: "Cancer Care", href: "/specialities/oncology", icon: "/Specialities icons/Cancercare.svg", img: "/Specialities icons/Cancer Care.jpeg", video: "/Specialities icons/Cancer Care.mp4", stats: { value: "10K+", label: "Oncology Patients Treated" } },
  { name: "Neurology & Neurosurgery", href: "/specialities/neurology", icon: "/Specialities icons/Neurology.svg", img: "/Specialities icons/Neurology.jpeg", video: "/Specialities icons/Neurology.mp4", stats: { value: "3K+", label: "Neuro Surgeries Performed" } },
  { name: "Orthopaedics", href: "/specialities/orthopaedics", icon: "/Specialities icons/Orthopaedics.svg", img: "/Specialities icons/Orthopedics.jpeg", video: "/Specialities icons/Orthopedics.mp4", stats: { value: "8K+", label: "Joint Replacements" } },
  { name: "Nephrology & Transplant", href: "/specialities/nephrology", icon: "/Specialities icons/Nephrology.svg", img: "/Specialities icons/Nephrology.jpeg", video: "/Specialities icons/Nephrology.mp4", stats: { value: "2K+", label: "Kidney Transplants" } },
  { name: "Gastroenterology", href: "/specialities/gastroenterology", icon: "/Specialities icons/Gastro.svg", img: "/Specialities icons/Gastroenterology.jpeg", video: "/Specialities icons/Gastroenterology.mp4", stats: { value: "15K+", label: "Endoscopies Performed" } },
  { name: "Pulmonology", href: "/specialities/pulmonology", icon: "/Specialities icons/Cardiology.svg", img: "/Specialities icons/Cardiology.jpeg", video: "/Specialities icons/Cardiology.mp4", stats: { value: "4.5K+", label: "Respiratory Cases" } },
  { name: "Paediatrics", href: "/specialities/paediatrics", icon: "/Specialities icons/Cancercare.svg", img: "/Specialities icons/Cancer Care.jpeg", video: "/Specialities icons/Cancer Care.mp4", stats: { value: "12K+", label: "Children Treated" } },
  { name: "General Surgery", href: "/specialities/general-surgery", icon: "/Specialities icons/Neurology.svg", img: "/Specialities icons/Neurology.jpeg", video: "/Specialities icons/Neurology.mp4", stats: { value: "8.5K+", label: "Surgeries Performed" } },
  { name: "Urology", href: "/specialities/urology", icon: "/Specialities icons/Orthopaedics.svg", img: "/Specialities icons/Orthopedics.jpeg", video: "/Specialities icons/Orthopedics.mp4", stats: { value: "6K+", label: "Urological Procedures" } },
  { name: "Endocrinology", href: "/specialities/endocrinology", icon: "/Specialities icons/Nephrology.svg", img: "/Specialities icons/Nephrology.jpeg", video: "/Specialities icons/Nephrology.mp4", stats: { value: "5K+", label: "Endocrine Cases" } },
  { name: "Rheumatology", href: "/specialities/rheumatology", icon: "/Specialities icons/Gastro.svg", img: "/Specialities icons/Gastroenterology.jpeg", video: "/Specialities icons/Gastroenterology.mp4", stats: { value: "3.5K+", label: "Rheumatology Patients" } },
];

const RollingNumber = ({ value, isHovered }: { value: string, isHovered: boolean }) => {
  const hasPlus = value.includes("+");
  const hasK = value.includes("K");
  const hasL = value.includes("L");
  
  let numValue = parseFloat(value.replace(/,/g, "").replace(/\+/g, "").replace(/K/g, "").replace(/L/g, ""));
  if (hasK) numValue *= 1000;
  if (hasL) numValue *= 100000;

  const [displayValue, setDisplayValue] = React.useState("0");

  React.useEffect(() => {
    if (isHovered) {
      const controls = animate(0, numValue, {
        duration: 0.85,
        ease: [0.22, 1, 0.36, 1], // Smooth cubic-bezier (ease-out)
        onUpdate: (val) => {
          const num = Math.round(val);
          if (num >= 100000) {
            setDisplayValue((num / 100000).toLocaleString('en-IN', { maximumFractionDigits: 1 }) + 'L');
          } else if (num >= 1000) {
            setDisplayValue((num / 1000).toLocaleString('en-IN', { maximumFractionDigits: 1 }) + 'K');
          } else {
            setDisplayValue(num.toLocaleString('en-IN'));
          }
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
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 95%", "start 30%"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 25,
    mass: 1,
    restDelta: 0.001
  });

  const gridScale = useTransform(smoothProgress, [0, 1], [0.65, 1]);
  const gridRadius = useTransform(smoothProgress, [0, 1], ["48px", "0px"]);

  return (
    <section ref={containerRef} className={styles.section} id="centre-of-excellence">
      <div className="container">
        <div className={styles.header}>
          <div className="section-eyebrow">CENTRES OF EXCELLENCE</div>
          <h2 className={styles.sectionTitle}>40+ Specialities. World-Class Care.</h2>
          <p className={`section-subtitle ${styles.sectionSubtitle}`}>
            Integrated expertise across tertiary and quaternary care, delivered through one trusted network.
          </p>
        </div>
      </div>

      <motion.div
        className={styles.gridAnimatedWrapper}
        style={{
          scale: gridScale,
          borderRadius: gridRadius,
          overflow: "hidden",
          transformOrigin: "center top"
        }}
      >
        <div className={styles.specialitiesGrid}>
          {SPECIALITIES.map((spec) => (
            <SpecialityCardItem key={spec.name} spec={spec} />
          ))}
        </div>
      </motion.div>
    </section>
  );
}
