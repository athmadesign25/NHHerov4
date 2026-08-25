"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Star, MapPin, Clock, Phone, PhoneCall, Calendar, ArrowLeft, CheckCircle2, CloudSun, Sun, Moon, RotateCcw, Video, ChevronLeft, ChevronRight } from "lucide-react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

const doctors: Record<string, {
  name: string; speciality: string; subSpeciality: string; hospital: string;
  city: string;
  locations?: { name: string; city: string }[]; experienceYears: string; rating: number; reviews: number;
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
    locations: [
      { name: "NH Bangalore — Mazumdar Shaw", city: "Bengaluru" },
      { name: "Narayana Health City", city: "Bengaluru" }
    ],
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
  "dr-4": {
    name: "Dr. Ananya Sharma", speciality: "Cardiology", subSpeciality: "Pediatric Cardiology",
    hospital: "SRCC Children's Hospital", city: "Mumbai",
    experienceYears: "12 Years", rating: 4.7, reviews: 185, img: "/assets/doctor_1.png",
    fee: "₹1,000",
    about: "Dr. Ananya Sharma is a dedicated pediatric cardiologist focused on congenital heart defects and early interventions in neonates.",
    specialities: [{ name: "Cardiology", subtext: "Pediatric Cardiology" }],
    languages: [{ name: "English", script: "A" }, { name: "Hindi", script: "अ" }, { name: "Marathi", script: "म" }],
    education: [{ title: "MBBS", institution: "Grant Medical College" }, { title: "MD Pediatrics", institution: "KEM Hospital" }],
    experience: [{ role: "Consultant Pediatric Cardiologist", hospital: "SRCC Children's Hospital" }],
    awards: [{ title: "Young Achiever Award", subtitle: "Pediatric Society, 2021" }],
    expertise: ["Fetal Echocardiography", "Neonatal Interventions", "Congenital Heart Defects"]
  },
  "dr-5": {
    name: "Dr. Sameer Desai", speciality: "Orthopedics", subSpeciality: "Joint Replacement",
    hospital: "NH Health City", city: "Bengaluru",
    experienceYears: "20 Years", rating: 4.6, reviews: 290, img: "/assets/doctor_2.png",
    fee: "₹1,500",
    about: "Dr. Sameer Desai specializes in complex joint replacement surgeries and sports medicine, helping athletes recover from severe injuries.",
    specialities: [{ name: "Orthopedics", subtext: "Joint Replacement | Sports Medicine" }],
    languages: [{ name: "English", script: "A" }, { name: "Kannada", script: "ಕ" }],
    education: [{ title: "MBBS", institution: "BMCRI" }, { title: "MS Orthopedics", institution: "AIIMS" }],
    experience: [{ role: "Head of Orthopedics", hospital: "NH Health City" }],
    awards: [{ title: "Excellence in Orthopedics", subtitle: "Medical Council, 2018" }],
    expertise: ["Knee Replacement", "Hip Replacement", "Arthroscopy"]
  },
  "dr-6": {
    name: "Dr. Vikram Singh", speciality: "Urology", subSpeciality: "Robotic Urology",
    hospital: "RTIICS", city: "Kolkata",
    experienceYears: "18 Years", rating: 4.9, reviews: 420, img: "/assets/doctor_3.png",
    fee: "₹1,200",
    about: "Dr. Vikram Singh is a pioneer in robotic urological surgeries and renal transplants.",
    specialities: [{ name: "Urology", subtext: "Robotic Surgery | Renal Transplant" }],
    languages: [{ name: "English", script: "A" }, { name: "Bengali", script: "ব" }],
    education: [{ title: "MBBS", institution: "Calcutta Medical College" }, { title: "MCh Urology", institution: "PGIMER" }],
    experience: [{ role: "Senior Urologist", hospital: "RTIICS" }],
    awards: [{ title: "Best Robotic Surgeon", subtitle: "Urological Society of India, 2022" }],
    expertise: ["Prostatectomy", "Renal Transplant", "Laser Lithotripsy"]
  },
  "dr-7": {
    name: "Dr. Neha Patel", speciality: "Dermatology", subSpeciality: "Aesthetic Dermatology",
    hospital: "SRCC Children's Hospital", city: "Mumbai",
    experienceYears: "14 Years", rating: 4.8, reviews: 350, img: "/assets/doctor_1.png",
    fee: "₹900",
    about: "Dr. Neha Patel is known for her advanced aesthetic treatments and laser skin therapies.",
    specialities: [{ name: "Dermatology", subtext: "Aesthetic Dermatology" }],
    languages: [{ name: "English", script: "A" }, { name: "Gujarati", script: "ગ" }],
    education: [{ title: "MBBS", institution: "KEM Hospital" }, { title: "MD Dermatology", institution: "Sion Hospital" }],
    experience: [{ role: "Consultant Dermatologist", hospital: "Apollo Spectra" }],
    awards: [{ title: "Best Dermatologist", subtitle: "Skin Care Association, 2019" }],
    expertise: ["Laser Hair Removal", "Acne Treatment", "Anti-aging Treatments"]
  },
  "dr-8": {
    name: "Dr. Rohan Kapoor", speciality: "Gastroenterology", subSpeciality: "Hepatology",
    hospital: "NH Bangalore — Mazumdar Shaw", city: "Bengaluru",
    experienceYears: "25 Years", rating: 4.9, reviews: 1500, img: "/assets/doctor_2.png",
    fee: "₹1,800",
    about: "Dr. Rohan Kapoor is an expert hepatologist handling complex liver diseases and transplant cases.",
    specialities: [{ name: "Gastroenterology", subtext: "Hepatology | Liver Transplant" }],
    languages: [{ name: "English", script: "A" }, { name: "Hindi", script: "अ" }],
    education: [{ title: "MBBS", institution: "AFMC" }, { title: "DM Gastroenterology", institution: "SGPGI" }],
    experience: [{ role: "Director of Hepatology", hospital: "NH Bangalore" }],
    awards: [{ title: "Lifetime Achievement", subtitle: "Liver Foundation, 2023" }],
    expertise: ["Liver Cirrhosis", "Hepatitis", "Liver Transplant"]
  }
};

const slots = ["9:00 AM", "10:30 AM", "11:00 AM", "2:00 PM", "3:30 PM", "4:00 PM"];

const generateDates = (daysCount: number) => {
  const dates = [];
  const today = new Date();
  
  const formatterDay = new Intl.DateTimeFormat('en-US', { weekday: 'short' });
  const formatterMonth = new Intl.DateTimeFormat('en-US', { month: 'short' });
  
  for (let i = 0; i < daysCount; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push({
      date: String(d.getDate()).padStart(2, '0'),
      day: formatterDay.format(d),
      month: formatterMonth.format(d).toUpperCase()
    });
  }
  return dates;
};

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
  const [actualDates] = useState(() => generateDates(15));
  const [selectedDate, setSelectedDate] = useState(actualDates[0].date);
  const [selectedTime, setSelectedTime] = useState("09:15 AM");
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  useEffect(() => {
    setIsLoadingSlots(true);
    const timer = setTimeout(() => {
      setIsLoadingSlots(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [consultationType, selectedDate]);

  const activeMonth = actualDates.find(d => d.date === selectedDate)?.month || actualDates[0].month;

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const similarScrollRef = useRef<HTMLDivElement>(null);
  
  const scrollDates = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 150;
      scrollContainerRef.current.scrollBy({ left: direction === "left" ? -scrollAmount : scrollAmount, behavior: "smooth" });
    }
  };

  const scrollSimilar = (direction: "left" | "right") => {
    if (similarScrollRef.current) {
      const scrollAmount = 340;
      similarScrollRef.current.scrollBy({ left: direction === "left" ? -scrollAmount : scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div style={{ paddingTop: "var(--nav-height)", minHeight: "100vh", background: "var(--color-bg-card)" }}>
      <div className="container" style={{ paddingTop: "var(--sp-4)", paddingBottom: "var(--sp-4)" }}>
        <Breadcrumbs 
          theme="light"
          items={[
            { label: "Home", href: "/" },
            { label: "Doctors", href: "/search?q=Dr.&location=All" },
            { label: doc.name }
          ]}
        />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 550px", gap: "var(--sp-4)", alignItems: "start" }}>
          {/* Left Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-3)" }}>
            
            {/* Unified Top Profile and Details Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              style={{ background: "var(--color-bg-card)", borderRadius: 16, border: "1px solid var(--color-border)", boxShadow: "var(--shadow-sm)", overflow: "hidden", display: "flex", flexDirection: "column" }}
            >
              <div style={{ background: "linear-gradient(135deg, #ffffff 0%, var(--color-primary-light) 100%)", padding: "24px 32px" }}>
                <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
                  <div style={{ position: "relative", width: 180, height: 180, borderRadius: 12, overflow: "hidden", flexShrink: 0, border: "1px solid rgba(255,255,255,0.5)" }}>
                    <Image src={doc.img} alt={doc.name} fill style={{ objectFit: "cover" }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 200, display: "flex", flexDirection: "column" }}>
                    <h1 style={{ fontSize: "var(--font-size-3xl)", fontWeight: 800, color: "var(--color-text)", letterSpacing: "-0.01em", marginBottom: 4 }}>{doc.name}</h1>
                    <div style={{ fontSize: "var(--font-size-lg)", color: "var(--color-text)", fontWeight: 400, marginBottom: 12 }}>{doc.speciality} · {doc.subSpeciality}</div>
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
                      {(doc.locations || [{ name: doc.hospital, city: doc.city }]).map((loc, idx) => (
                        <div key={idx} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)", fontWeight: 500 }}>
                          <MapPin size={16} style={{ color: "var(--color-text)" }} />
                          {loc.name}, {loc.city}
                        </div>
                      ))}
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)", fontWeight: 500, marginTop: 4 }}>
                        <Clock size={16} style={{ color: "var(--color-text)" }} />
                        {doc.experienceYears} Experience
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rich Details Sections */}
              <div style={{ padding: "32px", display: "flex", flexDirection: "column", gap: 40 }}>
              
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

              </div>
            </motion.div>
          </div>

          {/* Right Column - Booking Slots */}
          <div style={{ position: "sticky", top: "calc(var(--nav-height) + 24px)", background: "var(--color-bg-card)", borderRadius: 16, border: "1px solid var(--color-border)", padding: "var(--sp-4)", boxShadow: "var(--shadow-sm)" }}>
            {/* Consultation Type Toggle */}
            <div style={{ 
              display: "flex", 
              alignItems: "center",
              background: "#F1F5F9", 
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
                  justifyContent: "center",
                  flex: 1,
                  padding: "6px 16px",
                  borderRadius: 20,
                  border: "none",
                  background: "transparent",
                  color: consultationType === "Hospital Visit" ? "var(--color-emergency)" : "#475569",
                  fontWeight: consultationType === "Hospital Visit" ? 600 : 500,
                  cursor: "pointer",
                  outline: "none"
                }}
              >
                {consultationType === "Hospital Visit" && (
                  <motion.div
                    layoutId="activeConsultation"
                    style={{ position: "absolute", inset: 0, background: "#ffffff", borderRadius: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.1)", zIndex: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 8 }}>
                  <Image src="/Appointment/Hospital_visit.svg" alt="Hospital Visit" width={16} height={16} style={{ filter: consultationType === "Hospital Visit" ? "none" : "grayscale(1) brightness(0)" }} />
                  Hospital Visit
                </span>
              </button>
              
              <button
                onClick={() => setConsultationType("Video Consultation")}
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flex: 1,
                  padding: "6px 16px",
                  borderRadius: 20,
                  border: "none",
                  background: "transparent",
                  color: consultationType === "Video Consultation" ? "var(--color-emergency)" : "#475569",
                  fontWeight: consultationType === "Video Consultation" ? 600 : 500,
                  cursor: "pointer",
                  outline: "none"
                }}
              >
                {consultationType === "Video Consultation" && (
                  <motion.div
                    layoutId="activeConsultation"
                    style={{ position: "absolute", inset: 0, background: "#ffffff", borderRadius: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.1)", zIndex: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 8 }}>
                  <Image src="/Appointment/Video_consultation.svg" alt="Video Consultation" width={16} height={16} style={{ filter: consultationType === "Video Consultation" ? "none" : "grayscale(1) brightness(0)" }} />
                  Video Consult
                </span>
              </button>
            </div>

            {/* Hospital Selector */}
            <AnimatePresence initial={false}>
              {consultationType === "Hospital Visit" && (
                <motion.div 
                  initial={{ height: 0, opacity: 0, marginBottom: 0 }} 
                  animate={{ height: "auto", opacity: 1, marginBottom: 24 }} 
                  exit={{ height: 0, opacity: 0, marginBottom: 0 }}
                  style={{ overflow: "hidden" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "var(--font-size-base)", color: "var(--color-text)", fontWeight: 500, marginBottom: 12 }}>
                    <MapPin size={18} style={{ color: "var(--color-text)" }} />
                    Select Hospital
                  </div>
                  <div style={{ position: "relative" }}>
                    <select 
                      style={{
                        width: "100%", padding: "12px 36px 12px 16px", borderRadius: 100, border: "1.5px solid var(--color-border)", background: "transparent",
                        fontSize: "var(--font-size-sm)", color: "var(--color-text)", outline: "none", cursor: "pointer", fontWeight: 500, appearance: "none",
                        textOverflow: "ellipsis", whiteSpace: "nowrap", overflow: "hidden"
                      }}
                      defaultValue={doc.hospital}
                    >
                      <option value={doc.hospital}>{doc.hospital}</option>
                      <option value="nh-health-city">NH Health City, Bangalore</option>
                    </select>
                    <div style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", display: "flex", alignItems: "center" }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--color-text-secondary)" }}>
                        <path d="m6 9 6 6 6-6"/>
                      </svg>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Date Selector */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div style={{ fontSize: "var(--font-size-base)", fontWeight: 500, color: "var(--color-text)", display: "flex", alignItems: "center", gap: 8 }}>
                  <Calendar size={18} style={{ color: "var(--color-text)" }} />
                  Select date
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button onClick={() => {
                    setSelectedDate(actualDates[0].date);
                    if (scrollContainerRef.current) scrollContainerRef.current.scrollTo({ left: 0, behavior: "smooth" });
                  }} style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", color: "var(--color-primary)", fontWeight: 600, fontSize: "var(--font-size-sm)", cursor: "pointer", padding: 0 }}>
                    <RotateCcw size={14} /> Today
                  </button>
                  <div style={{ width: 1, height: 16, background: "var(--color-border)", margin: "0 4px" }} />
                  <button onClick={() => scrollDates("left")} style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "var(--color-bg-alt)", border: "none", borderRadius: "50%", width: 28, height: 28, cursor: "pointer", color: "var(--color-text-secondary)" }}>
                    <ChevronLeft size={16} />
                  </button>
                  <button onClick={() => scrollDates("right")} style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "var(--color-bg-alt)", border: "none", borderRadius: "50%", width: 28, height: 28, cursor: "pointer", color: "var(--color-text-secondary)" }}>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "stretch", gap: 12 }}>
                <div style={{ background: "#F1F5F9", borderRadius: 12, padding: "0 8px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: "var(--font-size-xs)", fontWeight: 700, color: "var(--color-text-secondary)", transform: "rotate(-90deg)", letterSpacing: "0.1em", whiteSpace: "nowrap" }}>{activeMonth}</span>
                </div>
                <div ref={scrollContainerRef} style={{ display: "flex", gap: 12, overflowX: "auto", flex: 1, paddingBottom: 4, scrollbarWidth: "none", msOverflowStyle: "none", scrollSnapType: "x mandatory" }} className="hide-scrollbar">
                  <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; }`}</style>
                  {actualDates.map((d, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        setSelectedDate(d.date);
                        e.currentTarget.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
                      }}
                      style={{
                        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, padding: "8px 0", width: 52, flexShrink: 0,
                        border: selectedDate === d.date ? "1.5px solid var(--color-primary)" : "1.5px solid transparent",
                        borderRadius: 12, background: "transparent",
                        cursor: "pointer", transition: "all 0.2s",
                        position: "relative",
                        scrollSnapAlign: "start"
                      }}
                    >
                      <span style={{ fontSize: "var(--font-size-lg)", fontWeight: 600, color: selectedDate === d.date ? "var(--color-primary)" : "var(--color-text)" }}>{d.date}</span>
                      <span style={{ fontSize: "var(--font-size-xs)", fontWeight: 500, color: selectedDate === d.date ? "var(--color-primary)" : "var(--color-text-secondary)" }}>{d.day}</span>
                      {index !== 0 && (
                        <div style={{ position: "absolute", left: -6, top: "20%", height: "60%", width: 1, background: "var(--color-border-light)" }} />
                      )}
                    </button>
                  ))}
                </div>
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
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {isLoadingSlots ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <motion.div key={i} initial={{ opacity: 0.4 }} animate={{ opacity: 1 }} transition={{ repeat: Infinity, duration: 0.5, repeatType: "reverse" }} style={{ width: 80, height: 34, borderRadius: 100, background: "#F1F5F9" }} />
                    ))
                  ) : (consultationType === "Hospital Visit" ? ["09:15 AM", "09:45 AM", "10:15 AM", "10:45 AM", "11:15 AM", "11:45 AM"] : ["09:30 AM", "10:00 AM", "11:00 AM", "11:30 AM"]).map((slot) => (
                    <button 
                      key={slot} 
                      onClick={() => setSelectedTime(slot)}
                      style={{ 
                        padding: "8px 16px", border: selectedTime === slot ? "1.5px solid var(--color-primary)" : "1.5px solid var(--color-border)", 
                        borderRadius: 100, fontSize: "var(--font-size-xs)", fontWeight: 600, 
                        color: selectedTime === slot ? "var(--color-primary)" : "var(--color-text)", cursor: "pointer", 
                        background: selectedTime === slot ? "var(--color-primary-light)" : "#fff", transition: "all 0.15s",
                        fontFamily: "inherit"
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
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {isLoadingSlots ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <motion.div key={i} initial={{ opacity: 0.4 }} animate={{ opacity: 1 }} transition={{ repeat: Infinity, duration: 0.5, repeatType: "reverse" }} style={{ width: 80, height: 34, borderRadius: 100, background: "#F1F5F9" }} />
                    ))
                  ) : (consultationType === "Hospital Visit" ? ["12:45 PM", "01:15 PM", "01:45 PM", "02:15 PM", "02:45 PM", "03:15 PM"] : ["12:00 PM", "12:30 PM", "02:00 PM", "03:00 PM"]).map((slot) => (
                    <button 
                      key={slot} 
                      onClick={() => setSelectedTime(slot)}
                      style={{ 
                        padding: "8px 16px", border: selectedTime === slot ? "1.5px solid var(--color-primary)" : "1.5px solid var(--color-border)", 
                        borderRadius: 100, fontSize: "var(--font-size-xs)", fontWeight: 600, 
                        color: selectedTime === slot ? "var(--color-primary)" : "var(--color-text)", cursor: "pointer", 
                        background: selectedTime === slot ? "var(--color-primary-light)" : "#fff", transition: "all 0.15s",
                        fontFamily: "inherit"
                      }}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              {/* Evening */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)", marginBottom: 12 }}>
                  <Moon size={16} style={{ color: "#F59E0B" }} /> Evening
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {isLoadingSlots ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <motion.div key={i} initial={{ opacity: 0.4 }} animate={{ opacity: 1 }} transition={{ repeat: Infinity, duration: 0.5, repeatType: "reverse" }} style={{ width: 80, height: 34, borderRadius: 100, background: "#F1F5F9" }} />
                    ))
                  ) : (consultationType === "Hospital Visit" ? ["05:30 PM", "06:00 PM", "06:30 PM", "07:00 PM", "07:30 PM", "08:00 PM"] : ["04:00 PM", "04:30 PM", "05:00 PM", "07:00 PM"]).map((slot) => (
                    <button 
                      key={slot} 
                      onClick={() => setSelectedTime(slot)}
                      style={{ 
                        padding: "8px 16px", border: selectedTime === slot ? "1.5px solid var(--color-primary)" : "1.5px solid var(--color-border)", 
                        borderRadius: 100, fontSize: "var(--font-size-xs)", fontWeight: 600, 
                        color: selectedTime === slot ? "var(--color-primary)" : "var(--color-text)", cursor: "pointer", 
                        background: selectedTime === slot ? "var(--color-primary-light)" : "#fff", transition: "all 0.15s",
                        fontFamily: "inherit"
                      }}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button id="book-appointment-btn" style={{ width: "100%", padding: "14px", background: "var(--color-primary)", color: "#fff", fontWeight: 700, fontSize: "var(--font-size-base)", borderRadius: 100, border: "none", cursor: "pointer", transition: "background 0.15s, transform 0.15s", marginBottom: 10 }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--color-primary-dark)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--color-primary)"; (e.currentTarget as HTMLElement).style.transform = ""; }}
            >
              Book Appointment
            </button>
            <a href="tel:18001030" id="doctor-call-btn" style={{ width: "100%", padding: "14px", border: "1.5px solid var(--color-primary)", color: "var(--color-primary)", fontWeight: 700, fontSize: "var(--font-size-base)", borderRadius: "100px", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "background-color 0.15s", textDecoration: "none" }}
               onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "var(--color-bg-subtle)"; }}
               onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}
            >
              <PhoneCall size={15} />
              Call for Enquiry
            </a>
          </div>
        </div>

        {/* Similar Doctors */}
        <div style={{ marginTop: "var(--sp-8)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--sp-4)" }}>
            <h2 style={{ fontSize: "var(--font-size-xl)", fontWeight: 800, color: "var(--color-text)", letterSpacing: "-0.01em" }}>Similar Doctors</h2>
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => scrollSimilar("left")} style={{ width: 40, height: 40, borderRadius: "50%", border: "1px solid var(--color-border)", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--color-text)", transition: "all 0.2s" }} onMouseEnter={(e) => { e.currentTarget.style.background = "var(--color-bg-subtle)"; e.currentTarget.style.borderColor = "var(--color-text)"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = "var(--color-border)"; }}>
                <ChevronLeft size={20} />
              </button>
              <button onClick={() => scrollSimilar("right")} style={{ width: 40, height: 40, borderRadius: "50%", border: "1px solid var(--color-border)", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--color-text)", transition: "all 0.2s" }} onMouseEnter={(e) => { e.currentTarget.style.background = "var(--color-bg-subtle)"; e.currentTarget.style.borderColor = "var(--color-text)"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = "var(--color-border)"; }}>
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
          
          <div style={{ position: "relative" }}>
            <div ref={similarScrollRef} className="hide-scrollbar" style={{ display: "flex", gap: "var(--sp-4)", overflowX: "auto", paddingBottom: "var(--sp-4)", scrollSnapType: "x mandatory", scrollbarWidth: "none", paddingRight: "100px" }}>
              <style dangerouslySetInnerHTML={{ __html: `.hide-scrollbar::-webkit-scrollbar { display: none; }` }} />
              
              {Object.entries(doctors).filter(([docId]) => docId !== id).map(([docId, doc]) => (
                <div key={docId} style={{ background: "var(--color-bg-card)", border: "1px solid var(--color-border)", borderRadius: "16px", overflow: "visible", boxShadow: "var(--shadow-sm)", position: "relative", minWidth: 320, flexShrink: 0, scrollSnapAlign: "start" }}>
                  <div style={{ background: "linear-gradient(135deg, #ffffff 0%, var(--color-primary-light) 100%)", padding: "18px", borderTopLeftRadius: "16px", borderTopRightRadius: "16px" }}>
                    <div style={{ display: "flex", gap: "16px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px", flexShrink: 0 }}>
                        <Link style={{ position: "relative", width: "120px", height: "120px", borderRadius: "12px", overflow: "hidden", background: "var(--color-border)", display: "block" }} href={`/doctors/${docId}`}>
                          <div style={{ width: "100%", height: "100%", position: "relative" }}>
                            <Image alt={doc.name} loading="lazy" decoding="async" fill style={{ position: "absolute", height: "100%", width: "100%", left: 0, top: 0, right: 0, bottom: 0, objectFit: "cover", color: "transparent" }} sizes="100vw" src={doc.img} />
                            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent, rgba(0, 0, 0, 0.5))", color: "#ffffff", fontSize: "9px", fontWeight: 600, padding: "20px 4px 4px 4px", display: "flex", justifyContent: "center", alignItems: "center", opacity: 0, transform: "translateY(10px)" }}>
                              View profile 
                              <ChevronRight size={10} style={{ marginLeft: "2px" }} />
                            </div>
                          </div>
                        </Link>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                        <Link style={{ textDecoration: "none" }} href={`/doctors/${docId}`}>
                          <h3 style={{ fontSize: "var(--font-size-lg)", fontWeight: 700, color: "var(--color-text)", marginBottom: "4px", cursor: "pointer", transition: "color 0.15s", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", textOverflow: "ellipsis" }}>{doc.name}</h3>
                        </Link>
                        <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{doc.speciality}</p>
                        <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", textOverflow: "ellipsis" }}>MBBS, MD (General Medicine)</p>
                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "6px" }}>
                          <span style={{ fontSize: "12px", background: "#FFFFFF", padding: "2px 8px", borderRadius: "12px", color: "#475569", fontWeight: 500 }}>{doc.experienceYears}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div style={{ padding: "18px" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: "12px" }}>
                      <MapPin size={16} style={{ color: "var(--color-text-secondary)", flexShrink: 0, marginTop: "2px" }} />
                      <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{doc.hospital} <span style={{ color: "var(--color-primary)", fontWeight: 700 }}>+1</span></p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                      <Clock size={16} style={{ color: "var(--color-text-secondary)" }} />
                      <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text)" }}>Next available at</p>
                    </div>
                    <div style={{ display: "flex", flexWrap: "nowrap", overflowX: "auto", scrollbarWidth: "none", gap: "12px", marginBottom: "16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "linear-gradient(135deg, var(--color-emergency-light) 0%, #ffffff 100%)", color: "var(--color-text)", padding: "6px 10px", borderRadius: "20px", fontSize: "var(--font-size-xs)", fontWeight: 600, whiteSpace: "nowrap" }}>
                        <img alt="Hospital Visit" loading="lazy" width="16" height="16" src="/Appointment/Hospital_visit.svg" />
                        Available Today
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "linear-gradient(135deg, var(--color-emergency-light) 0%, #ffffff 100%)", color: "var(--color-text)", padding: "6px 10px", borderRadius: "20px", fontSize: "var(--font-size-xs)", fontWeight: 600, whiteSpace: "nowrap" }}>
                        <img alt="Video Consultation" loading="lazy" width="16" height="16" src="/Appointment/Video_consultation.svg" />
                        Today, 10:00 AM
                      </div>
                    </div>
                    <div style={{ height: "1px", background: "var(--color-border)", margin: "16px 0" }}></div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontSize: "var(--font-size-lg)", fontWeight: 800, color: "var(--color-text)", lineHeight: 1 }}>{doc.fee}</span>
                        <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", marginTop: "4px", lineHeight: 1 }}>onwards</span>
                      </div>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <a href="tel:18001030" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "44px", height: "44px", borderRadius: "22px", border: "1px solid var(--color-border)", color: "var(--color-primary)", textDecoration: "none", transition: "var(--transition-fast)", flexShrink: 0 }}>
                          <PhoneCall size={18} />
                        </a>
                        <Link style={{ height: "44px", padding: "0 24px", background: "var(--color-primary)", color: "var(--color-text-inverse)", borderRadius: "22px", fontSize: "var(--font-size-sm)", fontWeight: 700, textDecoration: "none", transition: "var(--transition-fast)", display: "flex", alignItems: "center", justifyContent: "center" }} href={`/doctors/${docId}/book`}>
                          Book now
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Right side fade overlay */}
            <div style={{ position: "absolute", top: 0, right: 0, bottom: "var(--sp-4)", width: "120px", background: "linear-gradient(to right, transparent, var(--color-bg-card))", pointerEvents: "none" }} />
          </div>
        </div>

        </div>
      </div>
  );
}
