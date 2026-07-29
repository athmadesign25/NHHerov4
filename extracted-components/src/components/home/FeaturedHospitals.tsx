"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, ChevronRight } from "lucide-react";
import styles from "./FeaturedHospitals.module.css";

const hospitals = [
  {
    id: "hospital-bangalore",
    name: "NH Bangalore — Mazumdar Shaw",
    location: "Bengaluru, Karnataka",
    beds: "1,400+ Beds",
    speciality: "Cardiology & Oncology Hub",
    image: "/assets/hospital_1.png",
    href: "/",
  },
  {
    id: "hospital-kolkata",
    name: "NH Kolkata — Narayana Multispeciality",
    location: "Kolkata, West Bengal",
    beds: "800+ Beds",
    speciality: "Cardiac Sciences Centre",
    image: "/assets/hospital_2.png",
    href: "/",
  },
  {
    id: "hospital-ahmedabad",
    name: "NH Ahmedabad — Health City",
    location: "Ahmedabad, Gujarat",
    beds: "600+ Beds",
    speciality: "Bone Marrow Transplant",
    image: "/assets/hospital_3.png",
    href: "/",
  },
];

export default function FeaturedHospitals() {
  return (
    <section className={`section ${styles.section}`} id="featured-hospitals">
      <div className="container">
        <div className={`section-header ${styles.sectionHeader}`}>
          <div>
            <div className="section-eyebrow">Our Facilities</div>
            <h2 className="section-title">Featured Hospitals</h2>
            <p className="section-subtitle">
              State-of-the-art facilities designed for your safety and comfort.
            </p>
          </div>
          <Link href="/" className={styles.viewAll} id="hospitals-view-all">
            View All Hospitals
            <ChevronRight size={16} />
          </Link>
        </div>

        <div className={styles.grid}>
          {hospitals.map((hospital, i) => (
            <motion.div
              key={hospital.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: i * 0.1, duration: 0.5, ease: "easeOut" }}
            >
              <Link href={hospital.href} className={styles.card} id={hospital.id}>
                <div className={styles.imageWrap}>
                  <Image
                    src={hospital.image}
                    alt={hospital.name}
                    fill
                    className={styles.image}
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className={styles.imageOverlay} />
                  <div className={styles.badge}>{hospital.speciality}</div>
                </div>
                <div className={styles.body}>
                  <div className={styles.location}>
                    <MapPin size={13} />
                    {hospital.location}
                  </div>
                  <h3 className={styles.name}>{hospital.name}</h3>
                  <div className={styles.beds}>{hospital.beds}</div>
                  <div className={styles.action}>
                    View Hospital
                    <ChevronRight size={14} />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
