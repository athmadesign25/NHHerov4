"use client";

import React, { useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Star, MapPin, Clock, Phone, PhoneCall, Calendar, ArrowLeft, CheckCircle2, CloudSun, Sun, Moon, RotateCcw, Video, ChevronLeft, ChevronRight, ChevronDown, User } from "lucide-react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import DoctorVideoGallery from "@/components/seo-marketing/DoctorVideoGallery/DoctorVideoGallery";
import DoctorFAQ from "@/components/seo-marketing/DoctorFAQ/DoctorFAQ";
import RequestCallbackCTA from "@/components/seo-marketing/RequestCallbackCTA/RequestCallbackCTA";
import { searchDoctorsData } from "@/app/search/mockDoctors";
import { allSearchDataDoctors } from "@/components/search/NHSearchExperience/searchData";
import MemberSelector, { type FamilyMember } from "@/components/booking/MemberSelector/MemberSelector";
import LoginModal from "@/features/auth/LoginModal";
import { useAuthState } from "@/features/auth/hooks/useAuthState";
import { saveBooking } from "@/features/booking/bookingStore";

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
  "dr-rajiv-menon": {
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

function getDoctorDetail(slug: string) {
  // Tier 1: hardcoded premium doctor profiles
  if (doctors[slug]) return doctors[slug];

  // Tier 2: mockDoctors (SearchResultsView — IDs like "dr-1", "dr-2")
  const mockMatch = searchDoctorsData.find((d) => d.id === slug);
  if (mockMatch) {
    return {
      name: mockMatch.name,
      speciality: mockMatch.speciality,
      subSpeciality: mockMatch.degrees,
      hospital: mockMatch.hospital,
      city: mockMatch.city,
      locations: [{ name: mockMatch.hospital, city: mockMatch.city }],
      experienceYears: mockMatch.experience,
      rating: mockMatch.rating,
      reviews: mockMatch.reviews,
      img: mockMatch.img,
      fee: mockMatch.fee,
      about: `${mockMatch.name} is a renowned ${mockMatch.speciality} consultant at Narayana Health (${mockMatch.hospital}, ${mockMatch.city}) with over ${mockMatch.experience} of dedicated clinical excellence.`,
      specialities: [{ name: mockMatch.speciality, subtext: mockMatch.degrees || "Consultant Specialist" }],
      languages: [{ name: "English", script: "A" }, { name: "Hindi", script: "अ" }],
      education: [{ title: mockMatch.degrees || "MBBS, MD", institution: "Premier Medical Institute" }],
      experience: [{ role: `Senior ${mockMatch.speciality} Consultant`, hospital: mockMatch.hospital }],
      awards: [{ title: "Clinical Excellence in Patient Care", subtitle: "Narayana Health" }],
      expertise: [mockMatch.speciality, "Diagnostic Assessment", "Comprehensive Outpatient Care"],
    };
  }

  // Tier 3: NHSearchExperience static doctors (IDs like "doc-devi-shetty", "doc-bagirath")
  const searchMatch = allSearchDataDoctors.find((d) => d.id === slug);
  if (searchMatch) {
    return {
      name: searchMatch.name,
      speciality: searchMatch.speciality,
      subSpeciality: searchMatch.expertise || searchMatch.speciality,
      hospital: searchMatch.hospital,
      city: searchMatch.city,
      locations: [{ name: searchMatch.hospital, city: searchMatch.city }],
      experienceYears: searchMatch.experience,
      rating: 4.8,
      reviews: 320,
      img: searchMatch.image,
      fee: "₹1,200",
      about: `${searchMatch.name} is a distinguished ${searchMatch.speciality} specialist at ${searchMatch.hospital}, Narayana Health, with ${searchMatch.experience} of exemplary clinical expertise and patient-centred care.`,
      specialities: [{ name: searchMatch.speciality, subtext: searchMatch.expertise || "Senior Consultant" }],
      languages: [{ name: "English", script: "A" }, { name: "Hindi", script: "अ" }, { name: "Kannada", script: "ಕ" }],
      education: [{ title: "MBBS, MD — Specialisation", institution: "Premier Indian Medical Institution" }],
      experience: [{ role: `Senior ${searchMatch.speciality}`, hospital: searchMatch.hospital }],
      awards: [{ title: "Excellence in Patient Care", subtitle: "Narayana Health" }],
      expertise: [searchMatch.speciality, searchMatch.expertise || "Advanced Diagnostics", "Comprehensive Care"],
    };
  }

  return null;
}


export default function DoctorDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Try all known data sources first
  const dbDoc = getDoctorDetail(slug);

  // Universal URL-params fallback — works for any doctor card regardless of ID format.
  // PrimaryResults / SearchResultsCanvas pass these when linking to /doctors/[id].
  const urlName       = searchParams.get("name");
  const urlSpecialty  = searchParams.get("specialty");
  const urlHospital   = searchParams.get("hospital");
  const urlExperience = searchParams.get("experience");
  const urlCity       = searchParams.get("city");
  const urlImg        = searchParams.get("img");

  const fallbackDoc = urlName
    ? {
        name: urlName,
        speciality: urlSpecialty || "Consultant Specialist",
        subSpeciality: urlSpecialty || "Senior Consultant",
        hospital: urlHospital || "Narayana Health",
        city: urlCity || "Bangalore",
        locations: [{ name: urlHospital || "Narayana Health", city: urlCity || "Bangalore" }],
        experienceYears: urlExperience || "10+ Years",
        rating: 4.8,
        reviews: 320,
        img: urlImg || "/images/misc/doctor_avatar_male_v2.png",
        fee: "₹1,200",
        about: `${urlName} is a distinguished ${urlSpecialty || "specialist"} at ${urlHospital || "Narayana Health"} with ${urlExperience || "extensive"} of clinical expertise and patient-centred care.`,
        specialities: [{ name: urlSpecialty || "Specialty", subtext: "Senior Consultant, Narayana Health" }],
        languages: [{ name: "English", script: "A" }, { name: "Hindi", script: "अ" }],
        education: [{ title: "MBBS, MD — Super Specialisation", institution: "Premier Indian Medical Institution" }],
        experience: [{ role: `Senior Consultant — ${urlSpecialty || "Specialist"}`, hospital: urlHospital || "Narayana Health" }],
        awards: [{ title: "Excellence in Patient Care", subtitle: "Narayana Health" }],
        expertise: [urlSpecialty || "Clinical Excellence", "Advanced Diagnostics", "Comprehensive Outpatient Care"],
      }
    : null;

  const dynamicSlugDoc = (() => {
    const formattedName = slug
      .replace(/^dr-?/i, "")
      .split("-")
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    const docName = formattedName ? `Dr. ${formattedName}` : "Dr. Aditi Singhvi";
    return {
      name: docName,
      speciality: "Cardiology",
      subSpeciality: "Senior Consultant",
      hospital: "Narayana Health City",
      city: "Bengaluru",
      locations: [
        { name: "NH Bangalore — Mazumdar Shaw", city: "Bengaluru" },
        { name: "Narayana Health City", city: "Bengaluru" },
      ],
      experienceYears: "18+ Years",
      rating: 4.9,
      reviews: 420,
      img: "/assets/doctor_1.png",
      fee: "₹1,200",
      about: `${docName} is a distinguished specialist at Narayana Health with extensive expertise in advanced clinical patient care.`,
      specialities: [{ name: "Cardiology", subtext: "Senior Consultant, Narayana Health" }],
      languages: [{ name: "English", script: "A" }, { name: "Hindi", script: "अ" }],
      education: [{ title: "MBBS, MD, DM", institution: "Premier Medical Institute" }],
      experience: [{ role: "Senior Consultant", hospital: "Narayana Health City" }],
      awards: [{ title: "Excellence in Clinical Care", subtitle: "Narayana Health" }],
      expertise: ["Clinical Diagnostics", "Patient Consultation", "Advanced Therapeutics"],
    };
  })();

  const doc = dbDoc ?? fallbackDoc ?? dynamicSlugDoc;

  const [consultationType, setConsultationType] = useState<"Hospital Visit" | "Video Consultation">("Hospital Visit");
  
  // Rolling 15 days
  const [actualDates] = useState(() => {
    const dates = [];
    const today = new Date();
    const formatterDay = new Intl.DateTimeFormat("en-US", { weekday: "short" });
    const formatterMonth = new Intl.DateTimeFormat("en-US", { month: "short" });
    for (let i = 0; i < 15; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      dates.push({
        date: String(d.getDate()).padStart(2, "0"),
        day: formatterDay.format(d),
        month: formatterMonth.format(d).toUpperCase(),
        fullDate: d.toISOString().split("T")[0],
      });
    }
    return dates;
  });

  const [selectedDate, setSelectedDate] = useState(actualDates[0]?.date || "01");
  const [selectedTime, setSelectedTime] = useState("09:15 AM");
  const [selectedHospital, setSelectedHospital] = useState(doc.hospital);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { isUserLoggedIn } = useAuthState();

  const [selectedMember, setSelectedMember] = useState<FamilyMember>({
    id: 1,
    name: "Aditya",
    relation: "self",
    age: "32",
    gender: "male",
  });

  const activeMonth = actualDates.find((d) => d.date === selectedDate)?.month || actualDates[0]?.month || "OCT";

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollDates = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 150;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const similarScrollRef = useRef<HTMLDivElement>(null);
  const scrollSimilar = (direction: "left" | "right") => {
    if (similarScrollRef.current) {
      const scrollAmount = 340;
      similarScrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleDateSelect = (d: (typeof actualDates)[0]) => {
    setSelectedDate(d.date);
    setIsLoadingSlots(true);
    setTimeout(() => setIsLoadingSlots(false), 180);
  };

  const proceedToBooking = () => {
    const chosenDateObj = actualDates.find((d) => d.date === selectedDate) || actualDates[0];
    const record = saveBooking({
      doctorSlug: slug,
      doctorName: doc.name,
      speciality: doc.speciality,
      consultationType: consultationType === "Hospital Visit" ? "hospital" : "video",
      hospital: consultationType === "Hospital Visit" ? selectedHospital : "",
      date: chosenDateObj.fullDate,
      time: selectedTime,
      patientName: selectedMember.name.trim() || "Patient",
      relation: selectedMember.relation || "self",
      fee: doc.fee,
    });
    router.push(
      `/doctors/${encodeURIComponent(slug)}/book/confirmation?ref=${encodeURIComponent(record.ref)}`
    );
  };

  const handleBookAppointment = () => {
    if (!isUserLoggedIn) {
      setIsAuthModalOpen(true);
    } else {
      proceedToBooking();
    }
  };

  const handleLoginSuccess = () => {
    setIsAuthModalOpen(false);
    proceedToBooking();
  };

  const similarDoctors = searchDoctorsData
    .filter((d) => d.id !== slug && d.name.toLowerCase() !== doc.name.toLowerCase())
    .slice(0, 8);
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

            {/* SEO & Marketing Components */}
            <DoctorVideoGallery doctorName={doc.name} />
            <DoctorFAQ doctorName={doc.name} />
            <RequestCallbackCTA />

          </div>

          {/* Right — Interactive Booking Card (Toshib work pattern) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            style={{ position: "sticky", top: "calc(var(--nav-height) + 24px)", background: "var(--color-bg-card)", borderRadius: 16, border: "1px solid var(--color-border)", padding: "var(--sp-4)", boxShadow: "var(--shadow-sm)" }}
          >
            {/* Consultation Type Toggle */}
            <div style={{ display: "flex", alignItems: "center", background: "#F1F5F9", borderRadius: 24, padding: 4, gap: 4, marginBottom: 20 }}>
              <button
                type="button"
                onClick={() => setConsultationType("Hospital Visit")}
                style={{
                  position: "relative", display: "flex", alignItems: "center", justifyContent: "center", flex: 1, padding: "8px 16px",
                  borderRadius: 20, border: "none", background: "transparent",
                  color: consultationType === "Hospital Visit" ? "var(--color-emergency)" : "#475569",
                  fontWeight: consultationType === "Hospital Visit" ? 600 : 500, cursor: "pointer", outline: "none",
                  fontSize: "var(--font-size-sm)"
                }}
              >
                {consultationType === "Hospital Visit" && (
                  <motion.div layoutId="activeDocConsultation" style={{ position: "absolute", inset: 0, background: "#ffffff", borderRadius: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.1)", zIndex: 0 }} transition={{ type: "spring", stiffness: 400, damping: 30 }} />
                )}
                <span style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 8 }}>
                  <Image src="/Appointment/Hospital_visit.svg" alt="" width={16} height={16} style={{ filter: consultationType === "Hospital Visit" ? "none" : "grayscale(1) brightness(0)" }} />
                  Hospital Visit
                </span>
              </button>
              <button
                type="button"
                onClick={() => setConsultationType("Video Consultation")}
                style={{
                  position: "relative", display: "flex", alignItems: "center", justifyContent: "center", flex: 1, padding: "8px 16px",
                  borderRadius: 20, border: "none", background: "transparent",
                  color: consultationType === "Video Consultation" ? "var(--color-emergency)" : "#475569",
                  fontWeight: consultationType === "Video Consultation" ? 600 : 500, cursor: "pointer", outline: "none",
                  fontSize: "var(--font-size-sm)"
                }}
              >
                {consultationType === "Video Consultation" && (
                  <motion.div layoutId="activeDocConsultation" style={{ position: "absolute", inset: 0, background: "#ffffff", borderRadius: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.1)", zIndex: 0 }} transition={{ type: "spring", stiffness: 400, damping: 30 }} />
                )}
                <span style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 8 }}>
                  <Image src="/Appointment/Video_consultation.svg" alt="" width={16} height={16} style={{ filter: consultationType === "Video Consultation" ? "none" : "grayscale(1) brightness(0)" }} />
                  Video Consult
                </span>
              </button>
            </div>

            {/* Select Member Dropdown (Toshib pattern + Add Patient) */}
            <div style={{ marginBottom: 20 }}>
              <MemberSelector
                selectedMemberId={selectedMember.id}
                onSelectMember={(m) => setSelectedMember(m)}
              />
            </div>

            {/* Hospital Selector (for Hospital Visit) */}
            {consultationType === "Hospital Visit" && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "var(--font-size-base)", color: "var(--color-text)", fontWeight: 500, marginBottom: 8 }}>
                  <MapPin size={18} />
                  Select hospital
                </div>
                <div style={{ position: "relative" }}>
                  <select
                    value={selectedHospital}
                    onChange={(e) => setSelectedHospital(e.target.value)}
                    style={{
                      width: "100%", padding: "10px 36px 10px 16px", borderRadius: 100, border: "1.5px solid var(--color-border)",
                      background: "#fff", fontSize: "var(--font-size-sm)", color: "var(--color-text)", outline: "none", cursor: "pointer",
                      fontWeight: 500, appearance: "none"
                    }}
                  >
                    {(doc.locations || [{ name: doc.hospital, city: doc.city }]).map((loc, idx) => (
                      <option key={idx} value={loc.name}>{loc.name}</option>
                    ))}
                  </select>
                  <div style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                    <ChevronDown size={16} style={{ color: "var(--color-text-secondary)" }} />
                  </div>
                </div>
              </div>
            )}

            {/* Date Selector */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ fontSize: "var(--font-size-base)", fontWeight: 500, color: "var(--color-text)", display: "flex", alignItems: "center", gap: 8 }}>
                  <Calendar size={18} />
                  Select date
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDate(actualDates[0].date);
                      if (scrollContainerRef.current) scrollContainerRef.current.scrollTo({ left: 0, behavior: "smooth" });
                    }}
                    style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", color: "var(--color-primary)", fontWeight: 600, fontSize: "var(--font-size-xs)", cursor: "pointer" }}
                  >
                    <RotateCcw size={12} /> Today
                  </button>
                  <div style={{ width: 1, height: 14, background: "var(--color-border)", margin: "0 2px" }} />
                  <button type="button" onClick={() => scrollDates("left")} style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "#f1f5f9", border: "none", borderRadius: "50%", width: 26, height: 26, cursor: "pointer", color: "var(--color-text-secondary)" }}>
                    <ChevronLeft size={14} />
                  </button>
                  <button type="button" onClick={() => scrollDates("right")} style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "#f1f5f9", border: "none", borderRadius: "50%", width: 26, height: 26, cursor: "pointer", color: "var(--color-text-secondary)" }}>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "stretch", gap: 8 }}>
                <div style={{ background: "#F1F5F9", borderRadius: 10, padding: "0 8px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--color-text-secondary)", transform: "rotate(-90deg)", letterSpacing: "0.08em" }}>{activeMonth}</span>
                </div>
                <div ref={scrollContainerRef} style={{ display: "flex", gap: 8, overflowX: "auto", flex: 1, paddingBottom: 4, scrollbarWidth: "none" }}>
                  {actualDates.map((d, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleDateSelect(d)}
                      style={{
                        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, padding: "6px 0", width: 48, flexShrink: 0,
                        border: selectedDate === d.date ? "1.5px solid var(--color-primary)" : "1.5px solid var(--color-border)",
                        borderRadius: 10, background: selectedDate === d.date ? "var(--color-primary-light)" : "#fff",
                        cursor: "pointer", transition: "all 0.15s"
                      }}
                    >
                      <span style={{ fontSize: "var(--font-size-base)", fontWeight: 700, color: selectedDate === d.date ? "var(--color-primary)" : "var(--color-text)" }}>{d.date}</span>
                      <span style={{ fontSize: "11px", fontWeight: 500, color: selectedDate === d.date ? "var(--color-primary)" : "var(--color-text-secondary)" }}>{d.day}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Time Selector */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: "var(--font-size-base)", fontWeight: 500, color: "var(--color-text)", display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <Clock size={18} />
                Select time
              </div>

              {/* Morning */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "13px", color: "var(--color-text-secondary)", marginBottom: 8 }}>
                  <CloudSun size={15} style={{ color: "#F59E0B" }} /> Morning
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {isLoadingSlots ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} style={{ width: 75, height: 32, borderRadius: 100, background: "#F1F5F9" }} />
                    ))
                  ) : (consultationType === "Hospital Visit" ? ["09:15 AM", "09:45 AM", "10:15 AM", "11:15 AM"] : ["09:30 AM", "10:00 AM", "11:00 AM"]).map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedTime(slot)}
                      style={{
                        padding: "6px 14px", border: selectedTime === slot ? "1.5px solid var(--color-primary)" : "1.5px solid var(--color-border)",
                        borderRadius: 100, fontSize: "var(--font-size-xs)", fontWeight: 600,
                        color: selectedTime === slot ? "var(--color-primary)" : "var(--color-text)", cursor: "pointer",
                        background: selectedTime === slot ? "var(--color-primary-light)" : "#fff", transition: "all 0.15s"
                      }}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              {/* Afternoon */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "13px", color: "var(--color-text-secondary)", marginBottom: 8 }}>
                  <Sun size={15} style={{ color: "#F59E0B" }} /> Afternoon
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {isLoadingSlots ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} style={{ width: 75, height: 32, borderRadius: 100, background: "#F1F5F9" }} />
                    ))
                  ) : (consultationType === "Hospital Visit" ? ["12:45 PM", "01:15 PM", "02:15 PM"] : ["12:00 PM", "01:30 PM", "02:30 PM"]).map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedTime(slot)}
                      style={{
                        padding: "6px 14px", border: selectedTime === slot ? "1.5px solid var(--color-primary)" : "1.5px solid var(--color-border)",
                        borderRadius: 100, fontSize: "var(--font-size-xs)", fontWeight: 600,
                        color: selectedTime === slot ? "var(--color-primary)" : "var(--color-text)", cursor: "pointer",
                        background: selectedTime === slot ? "var(--color-primary-light)" : "#fff", transition: "all 0.15s"
                      }}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              {/* Evening */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "13px", color: "var(--color-text-secondary)", marginBottom: 8 }}>
                  <Moon size={15} style={{ color: "#F59E0B" }} /> Evening
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {isLoadingSlots ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} style={{ width: 75, height: 32, borderRadius: 100, background: "#F1F5F9" }} />
                    ))
                  ) : (consultationType === "Hospital Visit" ? ["05:30 PM", "06:15 PM", "07:00 PM"] : ["05:00 PM", "06:30 PM"]).map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedTime(slot)}
                      style={{
                        padding: "6px 14px", border: selectedTime === slot ? "1.5px solid var(--color-primary)" : "1.5px solid var(--color-border)",
                        borderRadius: 100, fontSize: "var(--font-size-xs)", fontWeight: 600,
                        color: selectedTime === slot ? "var(--color-primary)" : "var(--color-text)", cursor: "pointer",
                        background: selectedTime === slot ? "var(--color-primary-light)" : "#fff", transition: "all 0.15s"
                      }}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* CTAs */}
            <button
              id="book-appointment-btn"
              type="button"
              onClick={handleBookAppointment}
              style={{
                width: "100%", padding: "14px", background: "var(--color-primary)", color: "#fff",
                fontWeight: 700, fontSize: "var(--font-size-base)", borderRadius: 100, border: "none",
                cursor: "pointer", transition: "background 0.15s, transform 0.15s", marginBottom: 10
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--color-primary-dark)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--color-primary)"; (e.currentTarget as HTMLElement).style.transform = ""; }}
            >
              Book Appointment
            </button>
            <a
              href="tel:18001030"
              id="doctor-call-btn"
              style={{
                width: "100%", padding: "12px", border: "1.5px solid var(--color-primary)", color: "var(--color-primary)",
                fontWeight: 600, fontSize: "var(--font-size-sm)", borderRadius: 100, display: "flex",
                alignItems: "center", justifyContent: "center", gap: 6, transition: "background-color 0.15s", textDecoration: "none"
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "var(--color-bg-subtle)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}
            >
              <PhoneCall size={15} />
              Call for Enquiry
            </a>

          </motion.div>
        </div>

        {/* Similar Doctors Carousel (Taken from Toshib work) */}
        {similarDoctors.length > 0 && (
          <div style={{ marginTop: "var(--sp-8)", marginBottom: "var(--sp-6)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--sp-4)" }}>
              <h2 style={{ fontSize: "var(--font-size-2xl)", fontWeight: 800, color: "var(--color-text)", letterSpacing: "-0.01em" }}>
                Similar doctors
              </h2>
              <div style={{ display: "flex", gap: "var(--sp-2)" }}>
                <button
                  type="button"
                  onClick={() => scrollSimilar("left")}
                  style={{ width: 40, height: 40, borderRadius: "50%", border: "1px solid var(--color-border)", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--color-text)", transition: "all 0.2s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "var(--color-bg-subtle)"; e.currentTarget.style.borderColor = "var(--color-text)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = "var(--color-border)"; }}
                  aria-label="Previous similar doctors"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  type="button"
                  onClick={() => scrollSimilar("right")}
                  style={{ width: 40, height: 40, borderRadius: "50%", border: "1px solid var(--color-border)", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--color-text)", transition: "all 0.2s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "var(--color-bg-subtle)"; e.currentTarget.style.borderColor = "var(--color-text)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = "var(--color-border)"; }}
                  aria-label="Next similar doctors"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            <div style={{ position: "relative" }}>
              <div
                ref={similarScrollRef}
                style={{
                  display: "flex",
                  gap: "var(--sp-4)",
                  overflowX: "auto",
                  paddingBottom: "var(--sp-4)",
                  scrollSnapType: "x mandatory",
                  scrollbarWidth: "none",
                  paddingRight: "100px",
                }}
              >
                {similarDoctors.map((sDoc) => (
                  <div
                    key={sDoc.id}
                    style={{
                      background: "var(--color-bg-card)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 16,
                      overflow: "visible",
                      boxShadow: "var(--shadow-sm)",
                      position: "relative",
                      minWidth: 320,
                      flexShrink: 0,
                      scrollSnapAlign: "start",
                    }}
                  >
                    <div
                      style={{
                        background: "linear-gradient(135deg, #ffffff 0%, var(--color-primary-light) 100%)",
                        padding: 18,
                        borderTopLeftRadius: 16,
                        borderTopRightRadius: 16,
                      }}
                    >
                      <div style={{ display: "flex", gap: 16 }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0 }}>
                          <Link
                            style={{ position: "relative", width: 120, height: 120, borderRadius: 12, overflow: "hidden", background: "var(--color-border)", display: "block" }}
                            href={`/doctors/${sDoc.id}?name=${encodeURIComponent(sDoc.name)}`}
                          >
                            <div style={{ width: "100%", height: "100%", position: "relative" }}>
                              <Image
                                alt={sDoc.name}
                                loading="lazy"
                                fill
                                style={{ objectFit: "cover" }}
                                sizes="120px"
                                src={sDoc.img || "/images/misc/doctor_avatar_male_v2.png"}
                              />
                            </div>
                          </Link>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                          <Link style={{ textDecoration: "none" }} href={`/doctors/${sDoc.id}?name=${encodeURIComponent(sDoc.name)}`}>
                            <h3 style={{ fontSize: "var(--font-size-lg)", fontWeight: 700, color: "var(--color-text)", marginBottom: 4, cursor: "pointer", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                              {sDoc.name}
                            </h3>
                          </Link>
                          <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {sDoc.speciality}
                          </p>
                          <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                            {sDoc.degrees || "MBBS, MD"}
                          </p>
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
                            <span style={{ fontSize: 12, background: "#FFFFFF", padding: "2px 8px", borderRadius: 12, color: "#475569", fontWeight: 500 }}>
                              {sDoc.experience}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div style={{ padding: 18 }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 12 }}>
                        <MapPin size={16} style={{ color: "var(--color-text-secondary)", flexShrink: 0, marginTop: 2 }} />
                        <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {sDoc.hospital} <span style={{ color: "var(--color-primary)", fontWeight: 700 }}>+1</span>
                        </p>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                        <Clock size={16} style={{ color: "var(--color-text-secondary)" }} />
                        <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text)" }}>Next available at</p>
                      </div>
                      <div style={{ display: "flex", flexWrap: "nowrap", overflowX: "auto", scrollbarWidth: "none", gap: 10, marginBottom: 16 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, background: "linear-gradient(135deg, var(--color-emergency-light) 0%, #ffffff 100%)", color: "var(--color-text)", padding: "6px 10px", borderRadius: 20, fontSize: "var(--font-size-xs)", fontWeight: 600, whiteSpace: "nowrap" }}>
                          <Image alt="" width={16} height={16} src="/Appointment/Hospital_visit.svg" />
                          Available Today
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, background: "linear-gradient(135deg, var(--color-emergency-light) 0%, #ffffff 100%)", color: "var(--color-text)", padding: "6px 10px", borderRadius: 20, fontSize: "var(--font-size-xs)", fontWeight: 600, whiteSpace: "nowrap" }}>
                          <Image alt="" width={16} height={16} src="/Appointment/Video_consultation.svg" />
                          Today, 10:00 AM
                        </div>
                      </div>
                      <div style={{ height: 1, background: "var(--color-border)", margin: "16px 0" }} />
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <span style={{ fontSize: "var(--font-size-lg)", fontWeight: 800, color: "var(--color-text)", lineHeight: 1 }}>{sDoc.fee}</span>
                          <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", marginTop: 4, lineHeight: 1 }}>onwards</span>
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <a href="tel:18001030" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 44, height: 44, borderRadius: 22, border: "1px solid var(--color-border)", color: "var(--color-primary)", textDecoration: "none", transition: "var(--transition-fast)", flexShrink: 0 }}>
                            <PhoneCall size={18} />
                          </a>
                          <Link style={{ height: 44, padding: "0 22px", background: "var(--color-primary)", color: "var(--color-text-inverse)", borderRadius: 22, fontSize: "var(--font-size-sm)", fontWeight: 700, textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center" }} href={`/doctors/${sDoc.id}/book?mode=hospital`}>
                            Book now
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Right side fade overlay */}
              <div style={{ position: "absolute", top: 0, right: 0, bottom: "var(--sp-4)", width: 120, background: "linear-gradient(to right, transparent, var(--color-bg-card))", pointerEvents: "none" }} />
            </div>
          </div>
        )}
      </div>

      {/* Auth Login Modal */}
      <LoginModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
