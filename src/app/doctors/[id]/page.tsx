"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Star, MapPin, Clock, Phone, Calendar, ArrowLeft, CheckCircle2, CloudSun, Sun, RotateCcw, Video } from "lucide-react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

const doctors: Record<string, {
  name: string; speciality: string; subSpeciality: string; hospital: string;
  city: string; experienceYears: string; rating: number; reviews: number;
  img: string; fee: string; about: string;
  specialities: { name: string; subtext: string }[];
  languages: { name: string; script: string }[];
  education: { title: string; institution: string }[];
  experience: { role: string; hospital: string }[];
  awards: { title: string; subtitle: string }[];
  expertise: string[];
}> = {
  "dr-1": {
    name: "Dr. Rajiv Menon", speciality: "Cardiology", subSpeciality: "Interventional Cardiology",
    hospital: "NH Bangalore — Mazumdar Shaw", city: "Bengaluru",
    experienceYears: "22 Years", rating: 4.9, reviews: 1240, img: "/assets/doctor_1.png",
    fee: "₹1,500",
    about: "Dr. Rajiv Menon is one of India's foremost interventional cardiologists with over 22 years of experience in complex coronary interventions, structural heart disease, and advanced heart failure management.",
    specialities: [
      { name: "Uro Oncology", subtext: "Minimal Access Surgery | Robotic Surgery" },
      { name: "Urology", subtext: "Renal Transplant | Minimal Access Surgery | Robotic Surgery" },
    ],
    languages: [
      { name: "English", script: "A" },
      { name: "Hindi", script: "अ" },
      { name: "Kannada", script: "ಕ" },
      { name: "Tamil", script: "த" },
      { name: "Malyalam", script: "മ" },
      { name: "Telugu", script: "త" }
    ],
    education: [
      { title: "MS General Surgery, 1982", institution: "Kasthurba medical college" },
      { title: "MBBS, 1982", institution: "Kasthurba medical college" },
      { title: "Professor cardiac sciences", institution: "Royal college of London" }
    ],
    experience: [
      { role: "Founder and Chairman, 1982", hospital: "Narayana group of hospitals" },
      { role: "Senior cardia consultant", hospital: "Manipal hospital" },
      { role: "Visiting consultant", hospital: "Fortis hospitals" },
      { role: "Director", hospital: "Apollo Hospitals" },
      { role: "Head of Surgery", hospital: "AIIMS" },
      { role: "Consultant", hospital: "Cleveland Clinic" }
    ],
    awards: [
      { title: "Life time achievement award", subtitle: "Clinical gold care, 2018" },
      { title: "Royal fellow ship", subtitle: "Londo college of medical science" },
      { title: "Visiting consultant", subtitle: "Fortis hospitals" },
      { title: "Best Surgeon", subtitle: "National Medical Board, 2015" },
      { title: "Excellence in Healthcare", subtitle: "Govt of India, 2010" }
    ],
    expertise: [
      "Routine and complicated labor",
      "Obstetric emergencies",
      "Tubectomy",
      "Laparoscopic"
    ]
  },
  "dr-2": {
    name: "Dr. Priya Sharma", speciality: "Neurology", subSpeciality: "Neurointerventional",
    hospital: "NH Kolkata", city: "Kolkata",
    experienceYears: "15 Years", rating: 4.8, reviews: 890, img: "/assets/doctor_2.png",
    fee: "₹1,200",
    about: "Dr. Priya Sharma is a leading neurologist specialising in neurointerventional procedures and movement disorders.",
    specialities: [{ name: "Neurology", subtext: "Neurointerventional Procedures" }],
    languages: [{ name: "English", script: "A" }, { name: "Hindi", script: "अ" }, { name: "Bengali", script: "ব" }],
    education: [{ title: "MBBS", institution: "Maulana Azad Medical College" }, { title: "DM Neurology", institution: "NIMHANS Bengaluru" }],
    experience: [{ role: "Senior Consultant", hospital: "NH Kolkata" }],
    awards: [{ title: "Best Neurologist", subtitle: "Kolkata Medical Council, 2020" }],
    expertise: ["Stroke Management", "Parkinson's Disease", "Epilepsy", "Multiple Sclerosis"]
  },
  "dr-3": {
    name: "Dr. Arun Krishnan", speciality: "Oncology", subSpeciality: "Surgical Oncology",
    hospital: "NH Bangalore — Mazumdar Shaw", city: "Bengaluru",
    experienceYears: "28 Years", rating: 4.9, reviews: 2100, img: "/assets/doctor_3.png",
    fee: "₹2,000",
    about: "Dr. Arun Krishnan is internationally recognised for his expertise in minimally invasive cancer surgeries and complex robotic oncological procedures.",
    specialities: [{ name: "Oncology", subtext: "Surgical Oncology | Robotic Surgery" }],
    languages: [{ name: "English", script: "A" }, { name: "Kannada", script: "ಕ" }, { name: "Tamil", script: "த" }, { name: "Hindi", script: "अ" }],
    education: [{ title: "MBBS", institution: "Mysore Medical College" }, { title: "Fellowship in Surgical Oncology", institution: "MD Anderson, USA" }],
    experience: [{ role: "Head of Oncology", hospital: "NH Bangalore" }],
    awards: [{ title: "Outstanding Surgeon", subtitle: "Oncology Association, 2019" }],
    expertise: ["Robotic Cancer Surgery", "Gastrointestinal Oncology", "Breast Cancer", "Melanoma"]
  },
};

const slots = ["9:00 AM", "10:30 AM", "11:00 AM", "2:00 PM", "3:30 PM", "4:00 PM"];

function ExpandableList({ items, renderItem, initialCount = 3 }: { items: any[], renderItem: (item: any, i: number) => React.ReactNode, initialCount?: number }) {
  const [expanded, setExpanded] = useState(false);
  const showMore = items.length > initialCount;
  const displayItems = expanded ? items : items.slice(0, initialCount);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {displayItems.map((item, i) => renderItem(item, i))}
      {showMore && (
        <button 
          onClick={() => setExpanded(!expanded)} 
          style={{ background: "transparent", border: "none", color: "var(--color-primary)", fontWeight: 600, fontSize: "var(--font-size-sm)", cursor: "pointer", display: "flex", alignItems: "center", width: "fit-content", padding: 0, marginTop: 4 }}
        >
          {expanded ? "- Show less" : `+ ${items.length - initialCount} more`}
        </button>
      )}
    </div>
  );
}

function SectionHeading({ title }: { title: string }) {
  return <h2 style={{ fontSize: "var(--font-size-xl)", fontWeight: 800, color: "var(--color-text)", marginBottom: 20, letterSpacing: "-0.01em" }}>{title}</h2>;
}

export default function DoctorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const doc = doctors[id] || doctors["dr-1"];

  const [consultationType, setConsultationType] = useState<"Hospital Visit" | "Video Consultation">("Hospital Visit");
  const [selectedDate, setSelectedDate] = useState("27");
  const [selectedTime, setSelectedTime] = useState("09:15 AM");

  return (
    <div style={{ paddingTop: "var(--nav-height)", minHeight: "100vh", background: "var(--color-bg-card)" }}>
      <div className="container" style={{ padding: "var(--sp-4) var(--sp-3)", maxWidth: 1320 }}>
        <Breadcrumbs 
          theme="light"
          items={[
            { label: "Home", href: "/" },
            { label: "Doctors", href: "/search?q=Dr.&location=All" },
            { label: doc.name }
          ]}
        />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: "var(--sp-4)", alignItems: "start" }}>
          {/* Left Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-3)" }}>
            
            {/* Top Profile Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              style={{ background: "var(--color-bg-card)", borderRadius: 16, border: "1px solid var(--color-border)", boxShadow: "var(--shadow-sm)", overflow: "hidden" }}
            >
              <div style={{ background: "linear-gradient(135deg, #ffffff 0%, var(--color-primary-light) 100%)", padding: 24 }}>
                <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
                  <div style={{ position: "relative", width: 140, height: 140, borderRadius: 12, overflow: "hidden", flexShrink: 0, border: "1px solid rgba(255,255,255,0.5)" }}>
                    <Image src={doc.img} alt={doc.name} fill style={{ objectFit: "cover" }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 200, display: "flex", flexDirection: "column" }}>
                    <h1 style={{ fontSize: "var(--font-size-3xl)", fontWeight: 800, color: "var(--color-text)", letterSpacing: "-0.01em", marginBottom: 4 }}>{doc.name}</h1>
                    <div style={{ fontSize: "var(--font-size-lg)", color: "var(--color-text)", fontWeight: 400, marginBottom: 12 }}>{doc.speciality} · {doc.subSpeciality}</div>
                    
                    <div style={{ display: "flex", gap: "var(--sp-4)", flexWrap: "wrap", marginBottom: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)", fontWeight: 500 }}>
                        <MapPin size={16} style={{ color: "var(--color-text)" }} />
                        {doc.hospital}, {doc.city}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)", fontWeight: 500 }}>
                        <Clock size={16} style={{ color: "var(--color-text)" }} />
                        {doc.experienceYears} Experience
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Rich Details Sections */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.45 }}
              style={{ background: "var(--color-bg-card)", borderRadius: 16, border: "1px solid var(--color-border)", padding: "32px", boxShadow: "var(--shadow-sm)", display: "flex", flexDirection: "column", gap: 40 }}>
              
              {/* About (Keeping this as a clean intro block) */}
              {doc.about && (
                <div>
                  <SectionHeading title="About" />
                  <p style={{ fontSize: "var(--font-size-base)", color: "var(--color-text-secondary)", lineHeight: 1.75 }}>{doc.about}</p>
                </div>
              )}

              {/* Specialty */}
              <div>
                <SectionHeading title="Specialty" />
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  {doc.specialities.map((item, i) => (
                    <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--color-emergency)", marginTop: 8, flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: "var(--font-size-base)", fontWeight: 600, color: "var(--color-text)", marginBottom: 2 }}>{item.name}</div>
                        <div style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)" }}>{item.subtext}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Languages */}
              <div>
                <SectionHeading title="Languages known" />
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {doc.languages.map((lang, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 14px", background: "#F8FAFC", borderRadius: 20, border: "1px solid var(--color-border)" }}>
                      <span style={{ color: "var(--color-primary)", fontWeight: 700, fontSize: "var(--font-size-sm)" }}>{lang.script}</span>
                      <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text)", fontWeight: 500 }}>{lang.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Education */}
              <div>
                <SectionHeading title="Education" />
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  {doc.education.map((item, i) => (
                    <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--color-emergency)", marginTop: 8, flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: "var(--font-size-base)", fontWeight: 600, color: "var(--color-text)", marginBottom: 2 }}>{item.title}</div>
                        <div style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)" }}>{item.institution}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Work Experience */}
              <div>
                <SectionHeading title="Work experience" />
                <ExpandableList 
                  items={doc.experience}
                  renderItem={(item, i) => (
                    <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--color-emergency)", marginTop: 8, flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: "var(--font-size-base)", fontWeight: 600, color: "var(--color-text)", marginBottom: 2 }}>{item.role}</div>
                        <div style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)" }}>{item.hospital}</div>
                      </div>
                    </div>
                  )}
                />
              </div>

              {/* Awards & Recognition */}
              <div>
                <SectionHeading title="Award & recognition" />
                <ExpandableList 
                  items={doc.awards}
                  renderItem={(item, i) => (
                    <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--color-emergency)", marginTop: 8, flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: "var(--font-size-base)", fontWeight: 600, color: "var(--color-text)", marginBottom: 2 }}>{item.title}</div>
                        <div style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)" }}>{item.subtitle}</div>
                      </div>
                    </div>
                  )}
                />
              </div>

              {/* Fields of Expertise */}
              <div>
                <SectionHeading title="Fields of expertise" />
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {doc.expertise.map((item, i) => (
                    <div key={i} style={{ display: "flex", gap: 12, alignItems: "center" }}>
                      <CheckCircle2 size={20} style={{ color: "#10B981", flexShrink: 0 }} />
                      <div style={{ fontSize: "var(--font-size-base)", color: "var(--color-text)", fontWeight: 500 }}>{item}</div>
                    </div>
                  ))}
                </div>
              </div>

            </motion.div>
          </div>

          {/* Right — Booking Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            style={{ position: "sticky", top: "calc(var(--nav-height) + 24px)", background: "var(--color-bg-card)", borderRadius: 16, border: "1px solid var(--color-border)", padding: "var(--sp-4)", boxShadow: "var(--shadow-lg)" }}
          >
            {/* Consultation Type Toggle */}
            <div style={{ 
              display: "flex", 
              alignItems: "center",
              background: "#E2E8F0", 
              borderRadius: 24, 
              padding: 4, 
              gap: 4,
              marginBottom: 24
            }}>
              <button
                onClick={() => setConsultationType("Hospital Visit")}
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  padding: "6px 16px",
                  borderRadius: 20,
                  border: "none",
                  background: "transparent",
                  color: consultationType === "Hospital Visit" ? "var(--color-emergency)" : "#475569",
                  fontWeight: 600,
                  cursor: "pointer",
                  outline: "none"
                }}
              >
                {consultationType === "Hospital Visit" && (
                  <motion.div
                    layoutId="activeConsultation"
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "#ffffff",
                      borderRadius: 20,
                      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                      zIndex: 0
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 8 }}>
                  <Image 
                    src="/Appointment/Hospital_visit.svg" 
                    alt="Hospital Visit" 
                    width={16} 
                    height={16} 
                    style={{ 
                      filter: consultationType === "Hospital Visit" ? "none" : "grayscale(1) brightness(0)",
                      transition: "var(--transition-fast)"
                    }} 
                  />
                  Hospital Visit
                </span>
              </button>
              
              <button
                onClick={() => setConsultationType("Video Consultation")}
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  padding: "6px 16px",
                  borderRadius: 20,
                  border: "none",
                  background: "transparent",
                  color: consultationType === "Video Consultation" ? "var(--color-emergency)" : "#475569",
                  fontWeight: 500,
                  cursor: "pointer",
                  outline: "none"
                }}
              >
                {consultationType === "Video Consultation" && (
                  <motion.div
                    layoutId="activeConsultation"
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "#ffffff",
                      borderRadius: 20,
                      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                      zIndex: 0
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 8 }}>
                  <Image 
                    src="/Appointment/Video_consultation.svg" 
                    alt="Video Consultation" 
                    width={16} 
                    height={16} 
                    style={{ 
                      filter: consultationType === "Video Consultation" ? "none" : "grayscale(1) brightness(0)",
                      transition: "var(--transition-fast)"
                    }} 
                  />
                  Video Consultation
                </span>
              </button>
            </div>

            {/* Hospital Selector (Only for Hospital Visit) */}
            {consultationType === "Hospital Visit" && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "var(--font-size-base)", color: "var(--color-text)", fontWeight: 500, marginBottom: 12 }}>
                  <MapPin size={18} style={{ color: "var(--color-text)" }} />
                  Select Hospital
                </div>
                <div style={{ position: "relative" }}>
                  <select 
                    style={{
                      width: "100%",
                      padding: "12px 36px 12px 16px",
                      borderRadius: "100px",
                      border: "1.5px solid var(--color-border)",
                      background: "transparent",
                      fontSize: "var(--font-size-sm)",
                      color: "var(--color-text)",
                      fontFamily: "inherit",
                      appearance: "none",
                      outline: "none",
                      cursor: "pointer",
                      fontWeight: 500,
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      overflow: "hidden"
                    }}
                    defaultValue={doc.hospital}
                  >
                    <option value={doc.hospital}>{doc.hospital}</option>
                    <option value="nh-health-city">NH Health City, Bangalore</option>
                    <option value="rnt-hospital">Rabindranath Tagore International Institute, Kolkata</option>
                  </select>
                  <div style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", display: "flex" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--color-text-secondary)" }}>
                      <path d="m6 9 6 6 6-6"/>
                    </svg>
                  </div>
                </div>
              </div>
            )}

            {/* Date Selector */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div style={{ fontSize: "var(--font-size-base)", fontWeight: 500, color: "var(--color-text)", display: "flex", alignItems: "center", gap: 8 }}>
                  <Calendar size={18} style={{ color: "var(--color-text)" }} />
                  Select date
                </div>
                <button 
                  onClick={() => setSelectedDate("24")}
                  style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", color: "var(--color-primary)", fontWeight: 600, fontSize: "var(--font-size-sm)", cursor: "pointer", padding: 0 }}
                >
                  <RotateCcw size={14} /> Today
                </button>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ background: "#F1F5F9", borderRadius: 20, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: "var(--font-size-xs)", fontWeight: 700, color: "var(--color-text-secondary)", transform: "rotate(-90deg)", letterSpacing: "0.1em" }}>FEB</span>
                </div>
                
                {[
                  { date: "24", day: "Mon" },
                  { date: "25", day: "Tue" },
                  { date: "26", day: "Wed" },
                  { date: "27", day: "Thu" },
                  { date: "28", day: "Fri" }
                ].map((d, i) => (
                  <button
                    key={d.date}
                    onClick={() => setSelectedDate(d.date)}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 4,
                      padding: "8px 0",
                      width: 52,
                      border: selectedDate === d.date ? "1.5px solid var(--color-primary)" : "1.5px solid transparent",
                      borderRadius: 12,
                      background: "transparent",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      position: "relative"
                    }}
                  >
                    <span style={{ fontSize: "var(--font-size-lg)", fontWeight: 600, color: selectedDate === d.date ? "var(--color-primary)" : "var(--color-text)" }}>{d.date}</span>
                    <span style={{ fontSize: "var(--font-size-xs)", fontWeight: 500, color: selectedDate === d.date ? "var(--color-primary)" : "var(--color-text-secondary)" }}>{d.day}</span>
                    {/* Vertical separator between items, except first and last */}
                    {i !== 0 && i !== 4 && (
                      <div style={{ position: "absolute", left: -6, top: "20%", height: "60%", width: 1, background: "var(--color-border-light)" }} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Selector */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontSize: "var(--font-size-base)", fontWeight: 500, color: "var(--color-text)", display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                <Clock size={18} style={{ color: "var(--color-text)" }} />
                Select time
              </div>

              {/* Morning */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)", marginBottom: 12 }}>
                  <CloudSun size={16} style={{ color: "#F59E0B" }} /> Morning
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                  {["09:15 AM", "09:45 AM", "10:15 AM", "10:45 AM", "11:15 AM", "11:45 AM"].map((slot) => (
                    <button 
                      key={slot} 
                      onClick={() => setSelectedTime(slot)}
                      style={{ 
                        padding: "10px 4px", 
                        border: selectedTime === slot ? "1.5px solid var(--color-primary)" : "1.5px solid var(--color-border)", 
                        borderRadius: "100px", 
                        fontSize: "var(--font-size-xs)", 
                        fontWeight: 600, 
                        color: selectedTime === slot ? "var(--color-primary)" : "var(--color-text)", 
                        cursor: "pointer", 
                        background: selectedTime === slot ? "var(--color-primary-light)" : "#fff", 
                        fontFamily: "var(--font-family)", 
                        transition: "all 0.15s" 
                      }}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              {/* Afternoon */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)", marginBottom: 12 }}>
                  <Sun size={16} style={{ color: "#F59E0B" }} /> Afternoon
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                  {["12:45 PM", "01:15 PM", "01:45 PM", "02:15 PM", "02:45 PM", "03:15 PM"].map((slot) => (
                    <button 
                      key={slot} 
                      onClick={() => setSelectedTime(slot)}
                      style={{ 
                        padding: "10px 4px", 
                        border: selectedTime === slot ? "1.5px solid var(--color-primary)" : "1.5px solid var(--color-border)", 
                        borderRadius: "100px", 
                        fontSize: "var(--font-size-xs)", 
                        fontWeight: 600, 
                        color: selectedTime === slot ? "var(--color-primary)" : "var(--color-text)", 
                        cursor: "pointer", 
                        background: selectedTime === slot ? "var(--color-primary-light)" : "#fff", 
                        fontFamily: "var(--font-family)", 
                        transition: "all 0.15s" 
                      }}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              {/* Evening */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)", marginBottom: 12 }}>
                  <CloudSun size={16} style={{ color: "#F59E0B" }} /> Evening
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                  {["04:45 PM"].map((slot) => (
                    <button 
                      key={slot} 
                      onClick={() => setSelectedTime(slot)}
                      style={{ 
                        padding: "10px 4px", 
                        border: selectedTime === slot ? "1.5px solid var(--color-primary)" : "1.5px solid var(--color-border)", 
                        borderRadius: "100px", 
                        fontSize: "var(--font-size-xs)", 
                        fontWeight: 600, 
                        color: selectedTime === slot ? "var(--color-primary)" : "var(--color-text)", 
                        cursor: "pointer", 
                        background: selectedTime === slot ? "var(--color-primary-light)" : "#fff", 
                        fontFamily: "var(--font-family)", 
                        transition: "all 0.15s" 
                      }}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button id="book-appointment-btn" style={{ width: "100%", padding: "14px", background: "var(--color-primary)", color: "#fff", fontWeight: 700, fontSize: "var(--font-size-base)", borderRadius: "100px", border: "none", cursor: "pointer", fontFamily: "var(--font-family)", marginBottom: 10, transition: "background 0.15s, transform 0.15s" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--color-primary-dark)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--color-primary)"; (e.currentTarget as HTMLElement).style.transform = ""; }}
            >
              Book Appointment
            </button>
            <a href="tel:18001030" id="doctor-call-btn" style={{ width: "100%", padding: "12px", border: "1.5px solid var(--color-border)", color: "var(--color-text-secondary)", fontWeight: 600, fontSize: "var(--font-size-sm)", borderRadius: "100px", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "border-color 0.15s, color 0.15s" }}>
              <Phone size={15} />
              Call for Enquiry
            </a>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
