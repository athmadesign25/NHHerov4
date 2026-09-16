"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, Clock, Calendar, ChevronLeft, ChevronRight, RotateCcw, CloudSun, Sun, Moon, ArrowLeft, CheckCircle2, Languages } from "lucide-react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

// Mock data (same as profile page)
const doctors: Record<string, {
  name: string; speciality: string; subSpeciality: string; hospital: string;
  city: string; experienceYears: string; rating: number; reviews: number;
  img: string; fee: string;
}> = {
  "dr-1": {
    name: "Dr. Rajiv Menon", speciality: "Cardiology", subSpeciality: "Interventional Cardiology",
    hospital: "NH Bangalore — Mazumdar Shaw", city: "Bengaluru",
    experienceYears: "22 Years", rating: 4.9, reviews: 1240, img: "/assets/doctor_1.png",
    fee: "₹1,500"
  },
  "dr-2": {
    name: "Dr. Priya Sharma", speciality: "Neurology", subSpeciality: "Neurointerventional",
    hospital: "NH Kolkata", city: "Kolkata",
    experienceYears: "15 Years", rating: 4.8, reviews: 890, img: "/assets/doctor_2.png",
    fee: "₹1,200"
  },
  "dr-3": {
    name: "Dr. Arun Krishnan", speciality: "Oncology", subSpeciality: "Surgical Oncology",
    hospital: "NH Bangalore — Mazumdar Shaw", city: "Bengaluru",
    experienceYears: "28 Years", rating: 4.9, reviews: 2100, img: "/assets/doctor_3.png",
    fee: "₹2,000"
  },
};

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

export default function BookingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const doc = doctors[id] || doctors["dr-1"];

  const [consultationType, setConsultationType] = useState<"Hospital Visit" | "Video Consultation">("Hospital Visit");
  const [actualDates] = useState(() => generateDates(15));
  const [selectedDate, setSelectedDate] = useState(actualDates[0].date);
  const [selectedTime, setSelectedTime] = useState("09:15 AM");

  const activeMonth = actualDates.find(d => d.date === selectedDate)?.month || actualDates[0].month;

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const scrollDates = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320;
      scrollContainerRef.current.scrollBy({ left: direction === "left" ? -scrollAmount : scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div style={{ paddingTop: "var(--nav-height)", minHeight: "100vh", background: "var(--color-bg-card)", paddingBottom: 60 }}>
      <div className="container" style={{ paddingTop: 0, paddingBottom: 24 }}>
        
        {/* Navigation / Header */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 32, marginTop: 24 }}>
          <Breadcrumbs 
            theme="light"
            items={[
              { label: "Home", href: "/" },
              { label: "Doctors", href: "/search?q=Dr.&location=All" },
              { label: doc.name, href: `/doctors/${id}` },
              { label: "Book Appointment" }
            ]}
          />
          <Link href={`/doctors/${id}`} style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--color-text-secondary)", textDecoration: "none", fontWeight: 600, fontSize: "var(--font-size-sm)", width: "fit-content" }}>
            <ArrowLeft size={18} />
            Back to Profile
          </Link>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 550px", gap: "var(--sp-6)", alignItems: "start" }}>
          
          {/* Left Column - Doctor Summary */}
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-4)" }}>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <h1 style={{ fontSize: "var(--font-size-2xl)", fontWeight: 800, color: "var(--color-text)", marginBottom: 8, letterSpacing: "-0.01em" }}>
                Complete your booking
              </h1>
              <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--font-size-base)", lineHeight: 1.5, marginBottom: 24 }}>
                Review the doctor's details and select an available time slot for your consultation.
              </p>

              {/* Doctor Mini Card */}
              <div style={{ background: "#F8FAFC", border: "1px solid var(--color-border)", borderRadius: 16, padding: 20, display: "flex", gap: 20, alignItems: "center" }}>
                <div style={{ position: "relative", width: 90, height: 90, borderRadius: 12, overflow: "hidden", flexShrink: 0 }}>
                  <Image src={doc.img} alt={doc.name} fill style={{ objectFit: "cover" }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <h2 style={{ fontSize: "var(--font-size-lg)", fontWeight: 700, color: "var(--color-text)", marginBottom: 4 }}>{doc.name}</h2>
                  <div style={{ fontSize: "var(--font-size-sm)", color: "var(--color-primary)", fontWeight: 600, marginBottom: 12 }}>
                    {doc.speciality} • {doc.subSpeciality}
                  </div>
                  
                  <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "var(--font-size-xs)", color: "var(--color-text-secondary)", fontWeight: 500 }}>
                      <Clock size={14} />
                      {doc.experienceYears} Experience
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "var(--font-size-xs)", color: "var(--color-text-secondary)", fontWeight: 500 }}>
                      <MapPin size={14} />
                      {doc.hospital}, {doc.city}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "var(--font-size-xs)", color: "var(--color-text-secondary)", fontWeight: 500 }}>
                      <Languages size={14} />
                      {(doc as any).languages?.map((l: any) => (typeof l === "string" ? l : l.name))?.join(", ") || "English, Hindi"}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Fee & Policy Info */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              style={{ background: "#ffffff", border: "1px solid var(--color-border)", borderRadius: 16, padding: 20, display: "flex", flexDirection: "column", gap: 16 }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--color-border-light)", paddingBottom: 16 }}>
                <div style={{ color: "var(--color-text-secondary)", fontWeight: 500 }}>Consultation Fee</div>
                <div style={{ color: "var(--color-text)", fontWeight: 700, fontSize: "var(--font-size-lg)" }}>{doc.fee}</div>
              </div>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <CheckCircle2 size={18} style={{ color: "var(--color-primary)", flexShrink: 0, marginTop: 2 }} />
                <div>
                  <div style={{ fontSize: "var(--font-size-sm)", fontWeight: 600, color: "var(--color-text)", marginBottom: 2 }}>Verified Doctor</div>
                  <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-secondary)" }}>Medical registration and credentials verified by NH.</div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Booking Slots */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            style={{ background: "var(--color-bg-card)", borderRadius: 16, border: "1px solid var(--color-border)", padding: "var(--sp-4)", boxShadow: "var(--shadow-sm)" }}
          >
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
            {consultationType === "Hospital Visit" && (
              <div style={{ marginBottom: 24 }}>
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
              </div>
            )}

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
                  {["09:15 AM", "09:45 AM", "10:15 AM", "10:45 AM", "11:15 AM", "11:45 AM"].map((slot) => (
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
                  {["12:45 PM", "01:15 PM", "01:45 PM", "02:15 PM", "02:45 PM", "03:15 PM"].map((slot) => (
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
                  {["05:30 PM", "06:00 PM", "06:30 PM", "07:00 PM", "07:30 PM", "08:00 PM"].map((slot) => (
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
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--color-primary-dark)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--color-primary)"; (e.currentTarget as HTMLElement).style.transform = ""; }}
            >
              Book Appointment
            </button>
            <a href="tel:18001030" id="doctor-call-btn" style={{ width: "100%", padding: "12px", border: "1.5px solid var(--color-primary)", color: "var(--color-primary)", fontWeight: 600, fontSize: "var(--font-size-sm)", borderRadius: 100, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "background-color 0.15s", textDecoration: "none" }}
               onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "var(--color-primary-light)"; }}
               onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M13 2a9 9 0 0 1 9 9"/><path d="M13 6a5 5 0 0 1 5 5"/><path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384"/></svg>
              Call for Enquiry
            </a>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
