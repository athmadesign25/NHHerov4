"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star, MapPin, Clock, Phone, Calendar, Award, ArrowLeft, CheckCircle2 } from "lucide-react";

const doctors: Record<string, {
  name: string; speciality: string; subSpeciality: string; hospital: string;
  city: string; experience: string; rating: number; reviews: number;
  img: string; fee: string; about: string; education: string[];
  expertise: string[]; languages: string[];
}> = {
  "dr-1": {
    name: "Dr. Rajiv Menon", speciality: "Cardiology", subSpeciality: "Interventional Cardiology",
    hospital: "NH Bangalore — Mazumdar Shaw", city: "Bengaluru",
    experience: "22 Years", rating: 4.9, reviews: 1240, img: "/assets/doctor_1.png",
    fee: "₹1,500",
    about: "Dr. Rajiv Menon is one of India's foremost interventional cardiologists with over 22 years of experience in complex coronary interventions, structural heart disease, and advanced heart failure management.",
    education: ["MBBS — AIIMS Delhi", "MD Cardiology — CMC Vellore", "Fellowship in Interventional Cardiology — Cleveland Clinic, USA"],
    expertise: ["Complex PCI", "TAVR", "Mitral Valve Repair", "Heart Failure Management", "Cardiac Devices"],
    languages: ["English", "Hindi", "Kannada", "Tamil"],
  },
  "dr-2": {
    name: "Dr. Priya Sharma", speciality: "Neurology", subSpeciality: "Neurointerventional",
    hospital: "NH Kolkata", city: "Kolkata",
    experience: "15 Years", rating: 4.8, reviews: 890, img: "/assets/doctor_2.png",
    fee: "₹1,200",
    about: "Dr. Priya Sharma is a leading neurologist specialising in neurointerventional procedures and movement disorders.",
    education: ["MBBS — Maulana Azad Medical College", "DM Neurology — NIMHANS Bengaluru"],
    expertise: ["Stroke Management", "Parkinson's Disease", "Epilepsy", "Multiple Sclerosis"],
    languages: ["English", "Hindi", "Bengali"],
  },
  "dr-3": {
    name: "Dr. Arun Krishnan", speciality: "Oncology", subSpeciality: "Surgical Oncology",
    hospital: "NH Bangalore — Mazumdar Shaw", city: "Bengaluru",
    experience: "28 Years", rating: 4.9, reviews: 2100, img: "/assets/doctor_3.png",
    fee: "₹2,000",
    about: "Dr. Arun Krishnan is internationally recognised for his expertise in minimally invasive cancer surgeries and complex robotic oncological procedures.",
    education: ["MBBS — Mysore Medical College", "MS Surgery — Bangalore Medical College", "Fellowship in Surgical Oncology — MD Anderson, USA"],
    expertise: ["Robotic Cancer Surgery", "Gastrointestinal Oncology", "Breast Cancer", "Melanoma"],
    languages: ["English", "Kannada", "Tamil", "Hindi"],
  },
};

const slots = ["9:00 AM", "10:30 AM", "11:00 AM", "2:00 PM", "3:30 PM", "4:00 PM"];

export default function DoctorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const doc = doctors[id] || doctors["dr-1"];

  return (
    <div style={{ paddingTop: "var(--nav-height)", minHeight: "100vh", background: "var(--color-bg-alt)" }}>
      <div className="container" style={{ padding: "var(--sp-4) var(--sp-3)" }}>
        <Link href="/doctors" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--color-primary)", fontWeight: 600, fontSize: "var(--font-size-sm)", marginBottom: "var(--sp-3)" }} id="back-to-doctors">
          <ArrowLeft size={16} /> Back to Doctors
        </Link>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "var(--sp-4)", alignItems: "start" }}>
          {/* Left */}
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-3)" }}>
            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              style={{ background: "#fff", borderRadius: "var(--radius-xl)", border: "1px solid var(--color-border-light)", padding: "var(--sp-4)", boxShadow: "var(--shadow-md)" }}
            >
              <div style={{ display: "flex", gap: "var(--sp-4)", alignItems: "flex-start", flexWrap: "wrap" }}>
                <div style={{ position: "relative", width: 140, height: 140, borderRadius: "var(--radius-xl)", overflow: "hidden", flexShrink: 0, background: "var(--color-primary-light)" }}>
                  <Image src={doc.img} alt={doc.name} fill style={{ objectFit: "cover" }} />
                </div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <h1 style={{ fontSize: "var(--font-size-3xl)", fontWeight: 900, color: "var(--color-text)", letterSpacing: "-0.02em", marginBottom: 4 }}>{doc.name}</h1>
                  <div style={{ fontSize: "var(--font-size-lg)", color: "var(--color-primary)", fontWeight: 700, marginBottom: 6 }}>{doc.speciality} · {doc.subSpeciality}</div>
                  <div style={{ display: "flex", gap: "var(--sp-3)", flexWrap: "wrap", marginBottom: "var(--sp-2)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)" }}>
                      <MapPin size={14} style={{ color: "var(--color-primary)" }} />
                      {doc.hospital}, {doc.city}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)" }}>
                      <Clock size={14} style={{ color: "var(--color-primary)" }} />
                      {doc.experience} Experience
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ display: "flex", gap: 2 }}>
                      {[1,2,3,4,5].map((s) => <Star key={s} size={14} fill={s <= Math.floor(doc.rating) ? "#F59E0B" : "none"} stroke="#F59E0B" />)}
                    </div>
                    <span style={{ fontSize: "var(--font-size-sm)", fontWeight: 700, color: "var(--color-text)" }}>{doc.rating}</span>
                    <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>({doc.reviews.toLocaleString()} reviews)</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* About */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.45 }}
              style={{ background: "#fff", borderRadius: "var(--radius-xl)", border: "1px solid var(--color-border-light)", padding: "var(--sp-4)", boxShadow: "var(--shadow-sm)" }}>
              <h2 style={{ fontSize: "var(--font-size-xl)", fontWeight: 800, color: "var(--color-text)", marginBottom: "var(--sp-2)", letterSpacing: "-0.01em" }}>About</h2>
              <p style={{ fontSize: "var(--font-size-base)", color: "var(--color-text-secondary)", lineHeight: 1.75 }}>{doc.about}</p>
            </motion.div>

            {/* Education & Expertise */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--sp-3)" }}>
              {[
                { title: "Education", items: doc.education, icon: Award },
                { title: "Areas of Expertise", items: doc.expertise, icon: CheckCircle2 },
              ].map(({ title, items, icon: Icon }, i) => (
                <motion.div key={title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.08, duration: 0.45 }}
                  style={{ background: "#fff", borderRadius: "var(--radius-xl)", border: "1px solid var(--color-border-light)", padding: "var(--sp-3)", boxShadow: "var(--shadow-sm)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "var(--sp-2)" }}>
                    <Icon size={16} style={{ color: "var(--color-primary)" }} />
                    <h3 style={{ fontSize: "var(--font-size-base)", fontWeight: 800, color: "var(--color-text)" }}>{title}</h3>
                  </div>
                  <ul style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {items.map((item) => (
                      <li key={item} style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)", paddingLeft: 12, borderLeft: "2px solid var(--color-primary-light)" }}>
                        {item}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right — Booking Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            style={{ position: "sticky", top: "calc(var(--nav-height) + 24px)", background: "#fff", borderRadius: "var(--radius-xl)", border: "1px solid var(--color-border-light)", padding: "var(--sp-4)", boxShadow: "var(--shadow-lg)" }}
          >
            <div style={{ marginBottom: "var(--sp-3)" }}>
              <div style={{ fontSize: "var(--font-size-xs)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-text-muted)", marginBottom: 4 }}>Consultation Fee</div>
              <div style={{ fontSize: "var(--font-size-3xl)", fontWeight: 900, color: "var(--color-text)" }}>{doc.fee}</div>
              <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-success)", fontWeight: 600 }}>● Available Today</div>
            </div>

            <div style={{ marginBottom: "var(--sp-3)" }}>
              <div style={{ fontSize: "var(--font-size-sm)", fontWeight: 700, color: "var(--color-text)", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                <Calendar size={14} style={{ color: "var(--color-primary)" }} />
                Available Slots — Today
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
                {slots.map((slot) => (
                  <button key={slot} id={`slot-${slot.replace(/\s|:/g, "")}`} style={{ padding: "8px 4px", border: "1.5px solid var(--color-border)", borderRadius: "var(--radius-md)", fontSize: "var(--font-size-xs)", fontWeight: 600, color: "var(--color-text)", cursor: "pointer", background: "#fff", fontFamily: "var(--font-family)", transition: "all 0.15s" }}
                    onMouseEnter={(e) => { const el = e.currentTarget; el.style.background = "var(--color-primary)"; el.style.color = "#fff"; el.style.borderColor = "var(--color-primary)"; }}
                    onMouseLeave={(e) => { const el = e.currentTarget; el.style.background = "#fff"; el.style.color = "var(--color-text)"; el.style.borderColor = "var(--color-border)"; }}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            <button id="book-appointment-btn" style={{ width: "100%", padding: "14px", background: "var(--color-primary)", color: "#fff", fontWeight: 700, fontSize: "var(--font-size-base)", borderRadius: "var(--radius-md)", border: "none", cursor: "pointer", fontFamily: "var(--font-family)", marginBottom: 10, transition: "background 0.15s, transform 0.15s" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--color-primary-dark)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--color-primary)"; (e.currentTarget as HTMLElement).style.transform = ""; }}
            >
              Book Appointment
            </button>
            <a href="tel:18001030" id="doctor-call-btn" style={{ width: "100%", padding: "12px", border: "1.5px solid var(--color-border)", color: "var(--color-text-secondary)", fontWeight: 600, fontSize: "var(--font-size-sm)", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "border-color 0.15s, color 0.15s" }}>
              <Phone size={15} />
              Call for Enquiry
            </a>

            <div style={{ marginTop: "var(--sp-3)", paddingTop: "var(--sp-2)", borderTop: "1px solid var(--color-border-light)" }}>
              <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", marginBottom: 6 }}>Languages spoken</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {doc.languages.map((l) => <span key={l} style={{ padding: "3px 10px", background: "var(--color-primary-light)", color: "var(--color-primary)", borderRadius: "var(--radius-full)", fontSize: "var(--font-size-xs)", fontWeight: 600 }}>{l}</span>)}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
