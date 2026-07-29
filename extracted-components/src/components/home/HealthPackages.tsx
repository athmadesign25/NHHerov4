"use client";

import { motion, Variants } from "framer-motion";
import Image from "next/image";
import { CheckCircle2, ChevronRight } from "lucide-react";
import MagneticButton from "@/components/ui/MagneticButton";
import SplitText from "@/components/ui/SplitText";
import styles from "./HealthPackages.module.css";
import Link from "next/link";

const packages = [
  {
    id: "basic-health",
    title: "Basic Health Checkup",
    image: "/Health Checkup/Basic health.png",
    description: "Essential screenings for a healthy lifestyle, ideal for individuals under 30.",

    features: [
      "Complete Blood Count (CBC)",
      "Lipid Profile (Cholesterol)",
      "Liver Function Test",
      "Physician Consultation",
    ],
    accent: "#3B82F6", // Blue
    popular: false,
  },
  {
    id: "comprehensive-master",
    title: "Master Health Check",
    image: "/Health Checkup/Master health.png",
    description: "Advanced diagnostic profile with cardiac and specialist consults. Ideal for 30-50 yrs.",

    features: [
      "Cardiac Risk Markers (ECG, TMT)",
      "Kidney & Liver Function",
      "Thyroid Profile",
      "Cardiologist Consultation",
      "Dietary Counseling",
    ],
    accent: "#ED1C24", // NH Red
    popular: true,
  },
  {
    id: "senior-citizen",
    title: "Senior Citizen Wellness",
    image: "/Health Checkup/Senior Citizen.png",
    description: "Specialized screenings tailored for age-related health monitoring (50+ yrs).",

    features: [
      "Bone Mineral Density",
      "Prostate/Breast Screening",
      "Vitamin D & B12 Levels",
      "Geriatric Consultation",
    ],
    accent: "#8B5CF6", // Purple
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
  return (
    <section className={`section ${styles.section}`} id="health-packages">
      <div className="container">
        <div className={styles.header}>
          <div className={styles.titleWrap}>
            <div className="section-eyebrow" style={{ color: "#FFFFFF" }}>HEALTH PACKAGES</div>
            <SplitText text="Preventive Health Packages" tag="h2" className={styles.title} />
            <p className={styles.subtitle}>
              Proactive healthcare designed for you. Choose from our specialized screening packages to stay ahead of health risks.
            </p>
          </div>
          <MagneticButton strength={0.1} type="div">
            <Link href="/health-packages" className={styles.viewAllBtn}>
              View All Packages <ChevronRight size={16} />
            </Link>
          </MagneticButton>
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
              {pkg.popular && <div className={styles.popularBadge}>Most Recommended</div>}
              
              <div className={styles.cardTop}>
                <div className={styles.iconWrap}>
                  <Image src={pkg.image} alt={pkg.title} width={0} height={0} sizes="100vw" style={{ width: '100%', height: 'auto' }} />
                </div>
                <h3 className={styles.cardTitle}>{pkg.title}</h3>
                <p className={styles.cardDesc}>{pkg.description}</p>
              </div>



              <div className={styles.cardBottom}>
                <ul className={styles.featureList}>
                  {pkg.features.map((feature, i) => (
                    <li key={i} className={styles.featureItem}>
                      <CheckCircle2 size={16} className={styles.checkIcon} style={{ color: pkg.accent }} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button 
                  className={styles.bookBtn}
                  style={{ 
                    backgroundColor: pkg.popular ? pkg.accent : 'transparent', 
                    color: pkg.popular ? '#FFF' : pkg.accent, 
                    border: `1.5px solid ${pkg.accent}`,
                    backdropFilter: 'none',
                    WebkitBackdropFilter: 'none'
                  }}
                >
                  Book Package
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
