"use client";

import { useRef } from "react";
import { motion, Variants, useScroll, useTransform, useSpring } from "framer-motion";
import Image from "next/image";
import { CheckCircle2, ChevronRight } from "lucide-react";
import SplitText from "@/components/ui/SplitText";
import styles from "./HealthPackages.module.css";
import Link from "next/link";

const packages = [
  {
    id: "basic-health",
    title: "Basic Health Checkup",
    image: "/Health Checkup/Basic health.png",
    description: "Essential screenings for a healthy lifestyle",
    idealFor: "Ideal for under 30 yrs",
    features: [
      "Complete Blood Count (CBC)",
      "Lipid Profile (Cholesterol)",
      "Liver Function Test",
      "Physician Consultation",
    ],
    popular: false,
  },
  {
    id: "comprehensive-master",
    title: "Master Health Check",
    image: "/Health Checkup/Master health.png",
    description: "Advanced diagnostic profile with cardiac and specialist consults.",
    idealFor: "Ideal for 30-50 yrs",
    features: [
      "Cardiac Risk Markers (ECG, TMT)",
      "Kidney & Liver Function",
      "Thyroid Profile",
      "Cardiologist Consultation",
      "Dietary Counseling",
    ],
    popular: true,
  },
  {
    id: "senior-citizen",
    title: "Senior Citizen Wellness",
    image: "/Health Checkup/Senior Citizen.png",
    description: "Specialized screenings tailored for age-related health monitoring.",
    idealFor: "50+ years",
    features: [
      "Bone Mineral Density",
      "Prostate/Breast Screening",
      "Vitamin D & B12 Levels",
      "Geriatric Consultation",
    ],
    popular: false,
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  },
};

export default function HealthPackages() {
  const containerRef = useRef<HTMLElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 95%", "start 70%"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 25,
    mass: 1,
    restDelta: 0.001
  });

  const sectionScale = useTransform(smoothProgress, [0, 1], [0.90, 1]);
  const sectionRadius = useTransform(smoothProgress, [0, 1], ["24px", "0px"]);

  return (
    <section ref={containerRef} className={styles.section} id="health-packages">
      <motion.div 
        className={styles.animatedWrapper}
        style={{
          scale: sectionScale,
          borderRadius: sectionRadius,
          overflow: "hidden",
          transformOrigin: "center top"
        }}
      >
        <div className="container">
          <div className={styles.header}>
            <div className={styles.titleWrap}>
              <div className="section-eyebrow">HEALTH PACKAGES</div>
              <SplitText text="Preventive Health Packages" tag="h2" className={styles.title} />
              <p className={`section-subtitle ${styles.subtitle}`}>
                Proactive healthcare designed for you. Choose from our specialized screening packages to stay ahead of health risks.
              </p>
            </div>
          </div>

          <motion.div 
            className={styles.grid}
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {packages.map((pkg) => (
              <motion.div 
                key={pkg.id} 
                className={`${styles.card} ${pkg.popular ? styles.popularCard : ""}`}
                variants={cardVariants}
                whileHover={{ y: -8, transition: { duration: 0.3, ease: "easeOut" } }}
              >
                {pkg.popular && <div className={styles.popularBadge}>MOST RECOMMENDED</div>}
                
                <div className={styles.iconWrap}>
                  <Image src={pkg.image} alt={pkg.title} fill style={{ objectFit: 'cover', objectPosition: 'center 15%' }} sizes="(max-width: 768px) 100vw, 33vw" unoptimized />
                </div>
                
                <div className={styles.cardContent}>
                  <div className={styles.cardTop}>
                    <h3 className={styles.cardTitle}>{pkg.title}</h3>
                    <p className={styles.cardDesc}>{pkg.description}</p>
                    <div className={styles.idealBadgeWrap}>
                      <span className={styles.idealBadge}>{pkg.idealFor}</span>
                    </div>
                  </div>

                  <div className={styles.cardBottom}>
                    <ul className={styles.featureList}>
                      {pkg.features.map((feature, i) => (
                        <li key={i} className={styles.featureItem}>
                          <CheckCircle2 size={16} className={styles.checkIcon} />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      className={`${styles.bookBtn} ${pkg.popular ? styles.bookBtnPrimary : styles.bookBtnSecondary}`}
                    >
                      Book Package
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <div className={styles.footerCta}>
            <Link href="/health-packages" className={styles.viewAllBtn}>
              View All Packages <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
