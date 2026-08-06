"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./CentreOfExcellence.module.css";
import Link from "next/link";


const SPECIALITIES = [
  {
    name: "Cardiology & Cardiac Surgery",
    href: "/specialities/cardiology",
    icon: "/Specialities icons/Cardiology.svg",
    img: "/Specialities icons/Cardiology.jpeg",
    video: "/Specialities icons/Cardiology.mp4",
    stats: { treatments: "1,200+", patients: "15,000+", tools: "18+" }
  },
  {
    name: "Cancer Care",
    href: "/specialities/oncology",
    icon: "/Specialities icons/Cancercare.svg",
    img: "/Specialities icons/Cancer Care.jpeg",
    video: "/Specialities icons/Cancer Care.mp4",
    stats: { treatments: "1,050+", patients: "12,000+", tools: "14+" }
  },
  {
    name: "Neurology & Neurosurgery",
    href: "/specialities/neurology",
    icon: "/Specialities icons/Neurology.svg",
    img: "/Specialities icons/Neurology.jpeg",
    video: "/Specialities icons/Neurology.mp4",
    stats: { treatments: "890+", patients: "9,500+", tools: "16+" }
  },
  {
    name: "Orthopaedics",
    href: "/specialities/orthopaedics",
    icon: "/Specialities icons/Orthopaedics.svg",
    img: "/Specialities icons/Orthopedics.jpeg",
    video: "/Specialities icons/Orthopedics.mp4",
    stats: { treatments: "2,400+", patients: "22,000+", tools: "12+" }
  },
  {
    name: "Nephrology & Transplant",
    href: "/specialities/nephrology",
    icon: "/Specialities icons/Nephrology.svg",
    img: "/Specialities icons/Nephrology.jpeg",
    video: "/Specialities icons/Nephrology.mp4",
    stats: { treatments: "450+", patients: "6,800+", tools: "8+" }
  },
  {
    name: "Gastroenterology",
    href: "/specialities/gastroenterology",
    icon: "/Specialities icons/Gastro.svg",
    img: "/Specialities icons/Gastroenterology.jpeg",
    video: "/Specialities icons/Gastroenterology.mp4",
    stats: { treatments: "1,500+", patients: "16,500+", tools: "10+" }
  },
  {
    name: "Paediatrics & Neonatology",
    href: "/specialities/paediatrics",
    icon: "/Specialities icons/Paedratic.svg",
    img: "/doctor_patient.png",
    video: "/Doctor patient.mp4",
    stats: { treatments: "3,100+", patients: "30,000+", tools: "20+" }
  },
  {
    name: "Obstetrics & Gynaecology",
    href: "/specialities/gynaecology",
    icon: "/Specialities icons/Gynaecology.svg",
    img: "/why-choose-nh-bg.png",
    video: "/Doctor patient.mp4",
    stats: { treatments: "2,800+", patients: "25,000+", tools: "15+" }
  },
  {
    name: "Ophthalmology",
    href: "/specialities/ophthalmology",
    icon: "/Specialities icons/General Medicine.svg",
    img: "/chairman background.png",
    video: "/Doctor patient.mp4",
    stats: { treatments: "1,600+", patients: "14,000+", tools: "11+" }
  },
  {
    name: "Urology",
    href: "/specialities/urology",
    icon: "/Specialities icons/Urology.svg",
    img: "/pulse_health_insights_banner.png",
    video: "/Doctor patient.mp4",
    stats: { treatments: "950+", patients: "8,200+", tools: "9+" }
  },
  {
    name: "Pulmonology",
    href: "/specialities/pulmonology",
    icon: "/Specialities icons/Pulmonology.svg",
    img: "/specialities-bg.png",
    video: "/Doctor patient.mp4",
    stats: { treatments: "780+", patients: "6,500+", tools: "8+" }
  },
  {
    name: "Dental Care",
    href: "/specialities/dental",
    icon: "/Specialities icons/Dental.svg",
    img: "/leadership-bg.png",
    video: "/Doctor patient.mp4",
    stats: { treatments: "1,100+", patients: "10,500+", tools: "12+" }
  },
];

function FlipCard({ spec }: { spec: typeof SPECIALITIES[0] }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleMouseEnter = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  return (
    <Link 
      href={spec.href} 
      aria-label={spec.name} 
      className={styles.flipCardWrapper}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={styles.flipCardInner}>
        
        {/* Front Side */}
        <div className={styles.flipCardFront}>
          <div className={styles.cardImageContainer}>
            <img 
              src={spec.img} 
              alt={spec.name} 
              className={spec.name.includes("Nephrology") || spec.name.includes("Urology") ? `${styles.cardCoverImg} ${styles.imgContain}` : styles.cardCoverImg} 
            />
            <div className={styles.vignetteOverlay} />
          </div>
          
          <div className={styles.frontContent}>
            <div className={styles.specIconBadge}>
              <img alt={spec.name} src={spec.icon} className={styles.specIconImg} />
            </div>
            <h4 className={styles.frontTitle}>{spec.name}</h4>
          </div>
        </div>

        {/* Back Side */}
        <div className={styles.flipCardBack}>
          <video 
            ref={videoRef}
            src={spec.video} 
            className={styles.backVideo} 
            muted 
            loop 
            playsInline 
          />
          <div className={styles.videoOverlay} />
          
          <div className={styles.backContent}>
            <h4 className={styles.backTitle}>{spec.name}</h4>
            <div className={styles.statsDivider} />
            <div className={styles.statsList}>
              <div className={styles.statItem}>
                <span className={styles.statVal}>{spec.stats.treatments}</span>
                <span className={styles.statLabel}>Successful Treatments</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statVal}>{spec.stats.patients}</span>
                <span className={styles.statLabel}>Patients Cared For</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statVal}>{spec.stats.tools}</span>
                <span className={styles.statLabel}>Advanced Tools</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </Link>
  );
}

export default function CentreOfExcellence() {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section ref={sectionRef} className={styles.section} id="centre-of-excellence">
      <div className="container">
        <div className={styles.header}>
          <div className="section-eyebrow">CENTRES OF EXCELLENCE</div>
          <h2 className={styles.sectionTitle}>40+ Specialities. World-Class Care.</h2>
          <p className={`section-subtitle ${styles.sectionSubtitle}`}>
            Integrated expertise across tertiary and quaternary care, delivered through one trusted network.
          </p>
        </div>

      </div>

      {/* Full width edge-to-edge speciality wall */}
      <div className={styles.specialitiesGridEdgeToEdge}>
        {SPECIALITIES.map((spec) => (
          <FlipCard key={spec.name} spec={spec} />
        ))}
      </div>

      <div className="container">
        <div className={styles.specialitiesCtaWrap}>
          <Link href="/specialities" className={styles.specialitiesCta}>
            View all specialties
            <ChevronRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
