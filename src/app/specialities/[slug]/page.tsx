"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, Brain, Bone, ArrowLeft, ChevronRight, CheckCircle2, Users, Star } from "lucide-react";

const specialityData: Record<string, {
  name: string; icon: React.ElementType; desc: string; overview: string;
  conditions: string[]; procedures: string[]; color: string;
}> = {
  cardiology: {
    name: "Cardiology", icon: Heart, color: "#E74C3C",
    desc: "Comprehensive heart care from prevention to complex interventions",
    overview: "Our Cardiology department is one of the largest and most advanced cardiac care facilities in India, performing over 20,000 cardiac procedures annually. Our team of 120+ cardiologists and cardiac surgeons brings expertise from leading global institutions.",
    conditions: ["Coronary Artery Disease", "Heart Failure", "Valvular Heart Disease", "Arrhythmias", "Congenital Heart Disease", "Cardiomyopathy"],
    procedures: ["Angioplasty & Stenting", "Bypass Surgery (CABG)", "TAVR / TAVI", "Pacemaker Implantation", "Cardiac Ablation", "Heart Transplant"],
  },
  neurology: {
    name: "Neurology", icon: Brain, color: "#9B59B6",
    desc: "Advanced neurological care for brain, spine, and nervous system conditions",
    overview: "Our Neurology and Neurosurgery department provides comprehensive care for conditions of the brain, spine, and peripheral nervous system with the latest technology including robotic surgical systems.",
    conditions: ["Stroke", "Parkinson's Disease", "Epilepsy", "Multiple Sclerosis", "Brain Tumours", "Alzheimer's Disease"],
    procedures: ["Deep Brain Stimulation", "Neurovascular Interventions", "Stereotactic Radiosurgery", "Spinal Surgeries", "Epilepsy Surgery"],
  },
  orthopaedics: {
    name: "Orthopaedics", icon: Bone, color: "#2ECC71",
    desc: "Joint replacement, sports medicine, and complex trauma care",
    overview: "Our Orthopaedic team offers the full spectrum of musculoskeletal care from sports injuries to complex joint replacements using the latest computer-assisted and robotic surgical techniques.",
    conditions: ["Arthritis", "Sports Injuries", "Fractures", "Spine Disorders", "Bone Tumours", "Ligament Tears"],
    procedures: ["Knee Replacement", "Hip Replacement", "Arthroscopy", "Spinal Fusion", "Trauma Surgery", "Limb Reconstruction"],
  },
  oncology: {
    name: "Oncology", icon: CheckCircle2, color: "#E67E22",
    desc: "Comprehensive cancer care with cutting-edge treatments",
    overview: "Mazumdar Shaw Medical Center is India's first dedicated cancer hospital and remains a global leader in oncology care, treating all types of cancers with precision medicine, immunotherapy, and advanced surgery.",
    conditions: ["Breast Cancer", "Lung Cancer", "GI Cancers", "Head & Neck Cancer", "Blood Cancers", "Brain Tumours"],
    procedures: ["Robotic Cancer Surgery", "Bone Marrow Transplant", "Radiation Therapy", "Immunotherapy", "Targeted Therapy", "Chemotherapy"],
  },
};

const sampleDoctors = [
  { id: "dr-1", name: "Dr. Rajiv Menon", img: "/assets/doctor_1.png", exp: "22 Years", rating: 4.9 },
  { id: "dr-2", name: "Dr. Priya Sharma", img: "/assets/doctor_2.png", exp: "15 Years", rating: 4.8 },
  { id: "dr-3", name: "Dr. Arun Krishnan", img: "/assets/doctor_3.png", exp: "28 Years", rating: 4.9 },
];

export default function SpecialityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params);
  const spec = specialityData[slug] || specialityData["cardiology"];
  const Icon = spec.icon;

  return (
    <div style={{ paddingTop: "var(--nav-height)", minHeight: "100vh" }}>
      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, var(--color-primary-dark), var(--color-primary))", padding: "64px 0 80px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="container" style={{ position: "relative" }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.65)", fontWeight: 600, fontSize: "var(--font-size-sm)", marginBottom: "var(--sp-3)" }} id="spec-back">
            <ArrowLeft size={16} /> Home
          </Link>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-3)", marginBottom: "var(--sp-3)", flexWrap: "wrap" }}>
              <div style={{ width: 72, height: 72, borderRadius: "var(--radius-xl)", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}>
                <Icon size={32} />
              </div>
              <div>
                <div style={{ fontSize: "var(--font-size-xs)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.6)", marginBottom: 4 }}>Department of</div>
                <h1 style={{ fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1.1 }}>{spec.name}</h1>
              </div>
            </div>
            <p style={{ fontSize: "var(--font-size-xl)", color: "rgba(255,255,255,0.8)", marginBottom: "var(--sp-5)", maxWidth: 560 }}>{spec.desc}</p>
            <div style={{ display: "flex", gap: "var(--sp-4)", flexWrap: "wrap" }}>
              {[{ icon: Users, label: "120+ Doctors" }, { icon: Star, label: "4.9 Rating" }, { icon: CheckCircle2, label: "NABH Certified" }].map(({ icon: I, label }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, color: "rgba(255,255,255,0.85)", fontSize: "var(--font-size-sm)", fontWeight: 600 }}>
                  <I size={16} /> {label}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container" style={{ padding: "var(--sp-8) var(--sp-3)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--sp-8)", marginBottom: "var(--sp-8)" }}>
          {/* Overview */}
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <h2 style={{ fontSize: "var(--font-size-3xl)", fontWeight: 800, color: "var(--color-text)", marginBottom: "var(--sp-3)", letterSpacing: "-0.02em" }}>Department Overview</h2>
            <p style={{ fontSize: "var(--font-size-base)", color: "var(--color-text-secondary)", lineHeight: 1.8, marginBottom: "var(--sp-4)" }}>{spec.overview}</p>
            <Link href="/doctors" id="spec-find-doctors" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 24px", background: "var(--color-primary)", color: "#fff", fontWeight: 700, fontSize: "var(--font-size-sm)", borderRadius: "var(--radius-full)" }}>
              Find {spec.name} Doctors <ChevronRight size={16} />
            </Link>
          </motion.div>

          {/* Conditions & Procedures */}
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-3)" }}>
            {[{ title: "Conditions Treated", items: spec.conditions }, { title: "Procedures & Treatments", items: spec.procedures }].map((section, i) => (
              <motion.div key={section.title} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.45 }}
                style={{ background: i === 0 ? "var(--color-primary-light)" : "#fff", border: "1px solid var(--color-border-light)", borderRadius: "var(--radius-xl)", padding: "var(--sp-3)" }}>
                <h3 style={{ fontSize: "var(--font-size-base)", fontWeight: 800, color: "var(--color-text)", marginBottom: "var(--sp-2)" }}>{section.title}</h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {section.items.map((item) => (
                    <span key={item} style={{ padding: "5px 14px", background: i === 0 ? "#fff" : "var(--color-primary-light)", color: i === 0 ? "var(--color-text)" : "var(--color-primary)", borderRadius: "var(--radius-full)", fontSize: "var(--font-size-xs)", fontWeight: 600 }}>
                      {item}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Doctors */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--sp-4)" }}>
            <h2 style={{ fontSize: "var(--font-size-3xl)", fontWeight: 800, color: "var(--color-text)", letterSpacing: "-0.02em" }}>Our {spec.name} Specialists</h2>
            <Link href="/doctors" id="spec-view-all-doctors" style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--color-primary)", fontWeight: 700, fontSize: "var(--font-size-sm)" }}>
              View All <ChevronRight size={14} />
            </Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--sp-3)" }}>
            {sampleDoctors.map((doc, i) => (
              <motion.div key={doc.id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.45 }}>
                <Link href={`/doctors/${doc.id}`} id={`spec-doctor-${doc.id}`} style={{ display: "flex", flexDirection: "column", background: "#fff", border: "1px solid var(--color-border-light)", borderRadius: "var(--radius-xl)", overflow: "hidden", textDecoration: "none", boxShadow: "var(--shadow-md)", transition: "transform 0.2s, box-shadow 0.2s" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-card-hover)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-md)"; }}
                >
                  <div style={{ position: "relative", width: "100%", aspectRatio: "1", background: "var(--color-primary-light)" }}>
                    <Image src={doc.img} alt={doc.name} fill style={{ objectFit: "cover" }} />
                  </div>
                  <div style={{ padding: "var(--sp-2) var(--sp-3)" }}>
                    <div style={{ fontWeight: 700, color: "var(--color-text)", marginBottom: 2 }}>{doc.name}</div>
                    <div style={{ fontSize: "var(--font-size-sm)", color: "var(--color-primary)", fontWeight: 600, marginBottom: 4 }}>{spec.name}</div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>{doc.exp}</span>
                      <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: "var(--font-size-xs)", color: "#F59E0B", fontWeight: 700 }}>
                        <Star size={11} fill="currentColor" /> {doc.rating}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
