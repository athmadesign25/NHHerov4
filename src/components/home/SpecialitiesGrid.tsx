import Link from "next/link";
import { ChevronRight } from "lucide-react";

import styles from "./SpecialitiesGrid.module.css";

const specialities = [
  { name: "Cardiology & Cardiac Surgery", href: "/specialities/cardiology", icon: "/Specialities icons/Cardiology.svg" },
  { name: "Cancer Care", href: "/specialities/oncology", icon: "/Specialities icons/Cancercare.svg" },
  { name: "Neurology & Neurosurgery", href: "/specialities/neurology", icon: "/Specialities icons/Neurology.svg" },
  { name: "Orthopaedics", href: "/specialities/orthopaedics", icon: "/Specialities icons/Orthopaedics.svg" },
  { name: "Nephrology & Transplant", href: "/specialities/nephrology", icon: "/Specialities icons/Nephrology.svg" },
  { name: "Gastroenterology", href: "/specialities/gastroenterology", icon: "/Specialities icons/Gastro.svg" },
  { name: "Paediatrics & Neonatology", href: "/specialities/paediatrics", icon: "/Specialities icons/Paedratic.svg" },
  { name: "Obstetrics & Gynaecology", href: "/specialities/gynaecology", icon: "/Specialities icons/Gynaecology.svg" },
  { name: "Ophthalmology", href: "/specialities/ophthalmology", icon: "/Specialities icons/General Medicine.svg" },
  { name: "Urology", href: "/specialities/urology", icon: "/Specialities icons/Urology.svg" }
];

export default function SpecialitiesGrid() {
  return (
    <section
      id="specialities-section"
      aria-label="Medical specialities"
      className="section-alt"
      style={{
        padding: "120px 0px",
        background: "transparent"
      }}
    >
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: "var(--space-7)" }}>
          <div className="section-eyebrow">Our Specialities</div>
          <h2 style={{ fontSize: "clamp(28px, 3.2vw, 44px)", fontWeight: 900, color: "var(--text-primary, #333)", lineHeight: 1.18, letterSpacing: "-0.025em", marginBottom: "8px", paddingTop: "16px" }}>
            40+ Medical Specialities Under One Roof
          </h2>
          <p style={{ fontSize: "16px", color: "var(--text-secondary, #4A5568)", maxWidth: "560px", margin: "0px auto", paddingBottom: "32px" }}>
            From complex cardiac surgeries to advanced cancer care — Narayana Health covers every dimension of your health.
          </p>
        </div>
        <div className={styles.carouselGrid}>
          {specialities.map((spec, i) => (
            <Link
              key={i}
              aria-label={spec.name}
              href={spec.href}
              className={`${styles.carouselCard} speciality-card`}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "var(--space-5, 32px) var(--space-4, 24px)",
                borderRadius: "var(--radius-xl, 16px)",
                backgroundColor: "rgba(255, 255, 255, 0.4)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.5)",
                boxShadow: "0 8px 32px 0 rgba(3, 78, 162, 0.05), inset 0 1px 1px rgba(255, 255, 255, 0.7)",
                cursor: "pointer",
                textDecoration: "none",
                transition: "all 0.3s ease",
                height: "100%",
                minHeight: "130px",
                justifyContent: "center",
                gap: "var(--space-3, 16px)"
              }}
            >
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <img alt={spec.name} loading="lazy" width={64} height={64} src={spec.icon} style={{ color: "transparent", objectFit: "contain" }} />
              </span>
              <span style={{ fontSize: "13px", fontWeight: 600, textAlign: "center", lineHeight: 1.3, color: "var(--text-primary, #333)", transition: "color 0.2s" }}>
                {spec.name}
              </span>
            </Link>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: "var(--space-6, 48px)" }}>
          <Link href="/specialities" className={styles.viewAll}>
            View all specialties
            <ChevronRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
