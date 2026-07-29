"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./search.module.css";
import { 
  Search, X, User, Building2, Activity, ShieldCheck, 
  FileText, Calendar, Star, MapPin, Clock, ArrowRight, ShieldAlert
} from "lucide-react";

// Mock Data
const doctorsData = [
  {
    id: "dr-1",
    name: "Dr. Rajiv Menon",
    speciality: "Cardiology",
    hospital: "NH Bangalore",
    city: "Bangalore",
    experience: "22 Years",
    rating: 4.9,
    reviews: 1240,
    available: "Available Today",
    img: "/assets/doctor_1.png",
    fee: "₹1,500",
  },
  {
    id: "dr-2",
    name: "Dr. Priya Sharma",
    speciality: "Neurology",
    hospital: "NH Kolkata",
    city: "Kolkata",
    experience: "15 Years",
    rating: 4.8,
    reviews: 890,
    available: "Next Available: Tomorrow",
    img: "/assets/doctor_2.png",
    fee: "₹1,200",
  },
  {
    id: "dr-3",
    name: "Dr. Arun Krishnan",
    speciality: "Oncology",
    hospital: "NH Bangalore",
    city: "Bangalore",
    experience: "28 Years",
    rating: 4.9,
    reviews: 2100,
    available: "Available Today",
    img: "/assets/doctor_3.png",
    fee: "₹2,000",
  },
  {
    id: "dr-4",
    name: "Dr. Sunita Patel",
    speciality: "Orthopaedics",
    hospital: "NH Ahmedabad",
    city: "Ahmedabad",
    experience: "18 Years",
    rating: 4.7,
    reviews: 560,
    available: "Available Today",
    img: "/assets/hero_doctor.png",
    fee: "₹1,000",
  },
  {
    id: "dr-5",
    name: "Dr. Mohammed Raza",
    speciality: "Cardiology",
    hospital: "NH Mumbai",
    city: "Mumbai",
    experience: "20 Years",
    rating: 4.8,
    reviews: 980,
    available: "Next Available: Day After",
    img: "/assets/doctor_1.png",
    fee: "₹1,800",
  },
  {
    id: "dr-6",
    name: "Dr. Ananya Roy",
    speciality: "Neurology",
    hospital: "NH Kolkata",
    city: "Kolkata",
    experience: "12 Years",
    rating: 4.6,
    reviews: 430,
    available: "Available Today",
    img: "/assets/doctor_2.png",
    fee: "₹900",
  },
];

const hospitalsData = [
  {
    id: "hosp-1",
    name: "Narayana Health City",
    city: "Bangalore",
    address: "Bommasandra Industrial Area, Bangalore",
    type: "Super Speciality",
    beds: "2000+ Beds",
    rating: 4.8,
    specs: ["Cardiology", "Oncology", "Neurology", "Transplants"],
  },
  {
    id: "hosp-2",
    name: "Rabindranath Tagore International Institute of Cardiac Sciences",
    city: "Kolkata",
    address: "Mukundapur, Kolkata",
    type: "Cardiac & Multispeciality",
    beds: "650 Beds",
    rating: 4.7,
    specs: ["Cardiology", "Gastroenterology", "Nephrology"],
  },
  {
    id: "hosp-3",
    name: "Mazumdar Shaw Medical Center",
    city: "Bangalore",
    address: "NH Health City, Bangalore",
    type: "Oncology & Multispeciality",
    beds: "1400 Beds",
    rating: 4.9,
    specs: ["Oncology", "Neurology", "Orthopaedics", "Pediatrics"],
  },
  {
    id: "hosp-4",
    name: "SRCC Children's Hospital",
    city: "Mumbai",
    address: "Haji Ali, Mumbai",
    type: "Paediatric Super Speciality",
    beds: "350 Beds",
    rating: 4.8,
    specs: ["Paediatrics", "Neonatology", "Paediatric Cardiology"],
  },
];

const treatmentsData = [
  {
    id: "treat-1",
    name: "Angioplasty & Bypass Surgery",
    speciality: "Cardiology",
    description: "Minimally invasive coronary angioplasty and advanced coronary artery bypass grafting (CABG) surgeries to restore normal blood flow to the heart.",
    duration: "2 - 5 Hours",
  },
  {
    id: "treat-2",
    name: "Deep Brain Stimulation (DBS)",
    speciality: "Neurology",
    description: "Surgical procedure used to treat a variety of disabling neurological symptoms, most commonly for Parkinson's disease.",
    duration: "3 - 6 Hours",
  },
  {
    id: "treat-3",
    name: "Precision Radiotherapy & Chemotherapy",
    speciality: "Oncology",
    description: "Advanced radiotherapy including TrueBeam and personalized chemotherapy regimens tailored to treat specific cancer forms effectively.",
    duration: "Varies per plan",
  },
  {
    id: "treat-4",
    name: "Knee & Hip Joint Replacements",
    speciality: "Orthopaedics",
    description: "Robot-assisted total and partial joint replacement procedures using durable implants designed for faster recovery and mobility.",
    duration: "1 - 2 Hours",
  },
  {
    id: "treat-5",
    name: "Advanced Gastrointestinal Endoscopy",
    speciality: "Gastroenterology",
    description: "Diagnostic and therapeutic endoscopic procedures for digestive disorders, including colonoscopy, ERCP, and EUS.",
    duration: "30 - 60 Mins",
  },
];

const packagesData = [
  {
    id: "pkg-1",
    name: "Executive Full Body Health Checkup",
    price: "₹4,999",
    tests: "68 Tests",
    inclusions: ["Complete Blood Count (CBC)", "Lipid Profile", "Liver Function", "Kidney Function", "Diabetic Screening", "ECG", "Physician Consultation"],
    popular: true,
  },
  {
    id: "pkg-2",
    name: "Advanced Cardiac Evaluation Package",
    price: "₹3,500",
    tests: "12 Tests",
    inclusions: ["ECG", "Echocardiography (ECHO)", "TMT (Treadmill Test)", "Lipid Profile", "Cardiologist Consultation"],
    popular: false,
  },
  {
    id: "pkg-3",
    name: "Women's Wellness Shield Checkup",
    price: "₹3,999",
    tests: "42 Tests",
    inclusions: ["Thyroid Profile", "Mammography / Breast Ultrasound", "Pap Smear", "Vitamin D3", "Gynecologist Consultation"],
    popular: true,
  },
  {
    id: "pkg-4",
    name: "Active Joint & Bone Health Package",
    price: "₹2,200",
    tests: "8 Tests",
    inclusions: ["Calcium Test", "Vitamin D3", "Uric Acid", "Orthopaedic consultation", "Bone Mineral Density Scan"],
    popular: false,
  },
];

const labsData = [
  {
    id: "lab-1",
    name: "Complete Blood Count (CBC) with ESR",
    price: "₹349",
    time: "Reports in 6 Hours",
    parameters: "24 Parameters (Hb, RBC, WBC, Platelets, etc.)",
  },
  {
    id: "lab-2",
    name: "Lipid Profile (Cholesterol Test)",
    price: "₹499",
    time: "Reports in 8 Hours",
    parameters: "8 Parameters (Total Cholesterol, HDL, LDL, Triglycerides)",
  },
  {
    id: "lab-3",
    name: "HbA1c (Glycated Haemoglobin)",
    price: "₹399",
    time: "Reports in 6 Hours",
    parameters: "Measures average blood sugar levels over the past 3 months",
  },
  {
    id: "lab-4",
    name: "Thyroid Profile (T3, T4, TSH)",
    price: "₹599",
    time: "Reports in 12 Hours",
    parameters: "3 Key Thyroid Hormones Checked",
  },
  {
    id: "lab-5",
    name: "Liver Function Test (LFT)",
    price: "₹699",
    time: "Reports in 8 Hours",
    parameters: "11 Parameters including Bilirubin, SGOT, SGPT, Proteins",
  },
];

const articlesData = [
  {
    id: "art-1",
    title: "Understanding Heart Health: 5 Tips to Keep Your Heart Strong",
    author: "Dr. Rajiv Menon",
    readTime: "5 Min Read",
    category: "Cardiology",
    date: "June 12, 2026",
    summary: "Heart health is vital for overall wellness. Learn from top cardiologists about the warning signs of cardiac issues and lifestyle changes to safeguard your cardiovascular system.",
  },
  {
    id: "art-2",
    title: "Living with Migraines: Identifying Triggers and Finding Relief",
    author: "Dr. Priya Sharma",
    readTime: "8 Min Read",
    category: "Neurology",
    date: "May 28, 2026",
    summary: "Migraine isn't just a headache. Discover the neurological triggers, preventative care, and advanced therapeutic methods like Botox or neuromodulation for chronic relief.",
  },
  {
    id: "art-3",
    title: "Cancer Care: The Role of Early Screening & Detection",
    author: "Dr. Arun Krishnan",
    readTime: "6 Min Read",
    category: "Oncology",
    date: "June 02, 2026",
    summary: "Early detection saves lives. Learn how periodic screenings, self-examinations, and modern molecular diagnostics help spot oncology issues in their initial treatable stages.",
  },
  {
    id: "art-4",
    title: "Keeping Joints and Bones Healthy in Your Golden Years",
    author: "Dr. Sunita Patel",
    readTime: "4 Min Read",
    category: "Orthopaedics",
    date: "April 15, 2026",
    summary: "Osteoarthritis and bone loss are common as we age. Find out how targeted physical therapy, diet, and posture correction help prevent orthopaedic operations.",
  },
];

const TABS = [
  { id: "doctors", label: "Doctors", countKey: "doctors" },
  { id: "hospitals", label: "Hospitals", countKey: "hospitals" },
  { id: "treatments", label: "Treatments", countKey: "treatments" },
  { id: "packages", label: "Health Packages", countKey: "packages" },
  { id: "labs", label: "Test Labs", countKey: "labs" },
  { id: "articles", label: "Articles", countKey: "articles" },
];

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const initialQuery = searchParams.get("q") || searchParams.get("search") || "";
  const initialLocation = searchParams.get("location") || "All";
  const [query, setQuery] = useState(initialQuery);
  const [location, setLocation] = useState(initialLocation);
  const [activeTab, setActiveTab] = useState("doctors");

  // Sync state if URL query changes
  useEffect(() => {
    setQuery(initialQuery);
    setLocation(searchParams.get("location") || "All");
    setActiveTab("doctors");
  }, [initialQuery, searchParams]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(query.trim())}&location=${encodeURIComponent(location)}`);
    setActiveTab("doctors");
  };

  // Filter logic for each category
  const filteredDoctors = doctorsData.filter((d) => {
    const matchesQuery = d.name.toLowerCase().includes(query.toLowerCase()) ||
      d.speciality.toLowerCase().includes(query.toLowerCase()) ||
      d.hospital.toLowerCase().includes(query.toLowerCase());
    const matchesLocation = location === "All" || d.city.toLowerCase() === location.toLowerCase();
    return matchesQuery && matchesLocation;
  });

  const filteredHospitals = hospitalsData.filter((h) => {
    const matchesQuery = h.name.toLowerCase().includes(query.toLowerCase()) ||
      h.city.toLowerCase().includes(query.toLowerCase()) ||
      h.specs.some(s => s.toLowerCase().includes(query.toLowerCase()));
    const matchesLocation = location === "All" || h.city.toLowerCase() === location.toLowerCase();
    return matchesQuery && matchesLocation;
  });

  const filteredTreatments = treatmentsData.filter((t) =>
    t.name.toLowerCase().includes(query.toLowerCase()) ||
    t.speciality.toLowerCase().includes(query.toLowerCase()) ||
    t.description.toLowerCase().includes(query.toLowerCase())
  );

  const filteredPackages = packagesData.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    p.inclusions.some(i => i.toLowerCase().includes(query.toLowerCase()))
  );

  const filteredLabs = labsData.filter((l) =>
    l.name.toLowerCase().includes(query.toLowerCase()) ||
    l.parameters.toLowerCase().includes(query.toLowerCase())
  );

  const filteredArticles = articlesData.filter((a) =>
    a.title.toLowerCase().includes(query.toLowerCase()) ||
    a.category.toLowerCase().includes(query.toLowerCase()) ||
    a.summary.toLowerCase().includes(query.toLowerCase())
  );

  const counts: Record<string, number> = {
    doctors: filteredDoctors.length,
    hospitals: filteredHospitals.length,
    treatments: filteredTreatments.length,
    packages: filteredPackages.length,
    labs: filteredLabs.length,
    articles: filteredArticles.length,
  };

  return (
    <div style={{ paddingTop: "var(--nav-height)", minHeight: "100vh", background: "#F8FAFC" }}>
      {/* Top Search Banner */}
      <div style={{ background: "linear-gradient(135deg, #022352 0%, #034EA2 100%)", padding: "40px 0 48px", color: "#FFFFFF" }}>
        <div className="container" style={{ maxWidth: 840 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <h1 style={{ fontSize: "var(--font-size-xl)", fontWeight: 800, letterSpacing: "-0.01em" }}>
                Search Results
              </h1>
            </div>

            <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
              <div style={{ position: "relative", flex: 1 }}>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search doctors, hospitals, packages, tests, conditions..."
                  style={{
                    width: "100%",
                    height: 52,
                    padding: "0 80px 0 20px",
                    borderRadius: 12,
                    border: "none",
                    outline: "none",
                    fontSize: 16,
                    color: "#1E293B",
                    fontWeight: 500,
                    boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                  }}
                />
                {query && (
                  <button 
                    type="button" 
                    onClick={() => setQuery("")}
                    style={{ position: "absolute", right: 48, top: 16, background: "none", border: "none", cursor: "pointer", color: "#94A3B8" }}
                  >
                    <X size={20} />
                  </button>
                )}
                <Search 
                  size={20} 
                  style={{ position: "absolute", right: 20, top: 16, color: "#94A3B8" }} 
                />
              </div>

              {/* Location Filter Selector */}
              <div className={styles.locationContainer}>
                <MapPin size={18} style={{ marginRight: 8, color: "var(--color-primary, #034EA2)" }} />
                <select
                  value={location}
                  onChange={(e) => {
                    const newLoc = e.target.value;
                    setLocation(newLoc);
                    router.push(`/search?q=${encodeURIComponent(query.trim())}&location=${encodeURIComponent(newLoc)}`);
                  }}
                  style={{
                    border: "none",
                    outline: "none",
                    background: "transparent",
                    fontSize: 15,
                    fontWeight: 600,
                    color: "#1E293B",
                    cursor: "pointer",
                    paddingRight: 8,
                  }}
                >
                  <option value="All">All Locations</option>
                  <option value="Bangalore">Bangalore</option>
                  <option value="Kolkata">Kolkata</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Ahmedabad">Ahmedabad</option>
                </select>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Tabs and Content Wrapper */}
      <div className="container" style={{ padding: "24px var(--sp-3)", maxWidth: 1024 }}>
        {/* Horizontal Navigation Filters */}
        <div className={styles.tabScroll}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const count = counts[tab.countKey];
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  position: "relative",
                  padding: "10px 18px",
                  background: isActive ? "#FFFFFF" : "transparent",
                  border: isActive ? "1px solid #E2E8F0" : "1px solid transparent",
                  borderBottom: isActive ? "1px solid transparent" : "1px solid transparent",
                  borderRadius: "8px 8px 0 0",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: isActive ? "var(--color-primary, #034EA2)" : "#64748B",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: -9,
                  transition: "all 0.2s ease",
                }}
              >
                {tab.label}
                <span 
                  style={{ 
                    fontSize: 11, 
                    background: isActive ? "rgba(3, 78, 162, 0.08)" : "#E2E8F0", 
                    color: isActive ? "var(--color-primary, #034EA2)" : "#64748B",
                    padding: "2px 6px",
                    borderRadius: 10,
                    fontWeight: 700
                  }}
                >
                  {count}
                </span>
                {isActive && (
                  <motion.div 
                    layoutId="activeTabUnderline"
                    style={{
                      position: "absolute",
                      bottom: -1,
                      left: 0,
                      right: 0,
                      height: 2,
                      background: "var(--color-primary, #034EA2)",
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content Panels */}
        <div>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* DOCTORS PANEL */}
              {activeTab === "doctors" && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
                  {filteredDoctors.map((doc) => (
                    <div 
                      key={doc.id}
                      style={{ 
                        background: "#FFFFFF", 
                        border: "1px solid #E2E8F0", 
                        borderRadius: 16, 
                        padding: 16, 
                        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" 
                      }}
                    >
                      <div style={{ display: "flex", gap: 16, marginBottom: 12 }}>
                        <div style={{ position: "relative", width: 64, height: 64, borderRadius: 12, overflow: "hidden", flexShrink: 0, background: "rgba(3,78,162,0.05)" }}>
                          <Image src={doc.img} alt={doc.name} fill style={{ objectFit: "cover" }} />
                        </div>
                        <div>
                          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1E293B" }}>{doc.name}</h3>
                          <p style={{ fontSize: 13, color: "var(--color-primary, #034EA2)", fontWeight: 600 }}>{doc.speciality}</p>
                          <p style={{ fontSize: 12, color: "#64748B", display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
                            <MapPin size={12} /> {doc.hospital} · {doc.city}
                          </p>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 16, borderTop: "1px solid #F1F5F9", paddingTop: 12, fontSize: 13, color: "#64748B" }}>
                        <div>Experience: <strong style={{ color: "#1E293B" }}>{doc.experience}</strong></div>
                        <div style={{ display: "flex", alignItems: "center", gap: 3, color: "#F59E0B" }}>
                          <Star size={14} fill="currentColor" /> <strong>{doc.rating}</strong> ({doc.reviews})
                        </div>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
                        <div>
                          <div style={{ fontSize: 11, color: "var(--color-success, #10B981)", fontWeight: 600 }}>{doc.available}</div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: "#1E293B" }}>{doc.fee} <span style={{ fontSize: 11, fontWeight: 400, color: "#64748B" }}>consult fee</span></div>
                        </div>
                        <Link href={`/doctors/${doc.id}`} style={{ padding: "8px 16px", background: "var(--color-primary, #034EA2)", color: "#FFFFFF", borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
                          Book Slot
                        </Link>
                      </div>
                    </div>
                  ))}
                  {filteredDoctors.length === 0 && <EmptyState category="doctors" />}
                </div>
              )}

              {/* HOSPITALS PANEL */}
              {activeTab === "hospitals" && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
                  {filteredHospitals.map((hosp) => (
                    <div 
                      key={hosp.id}
                      style={{ 
                        background: "#FFFFFF", 
                        border: "1px solid #E2E8F0", 
                        borderRadius: 16, 
                        padding: 20, 
                        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" 
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                        <div>
                          <span style={{ fontSize: 10, background: "rgba(3,78,162,0.08)", color: "var(--color-primary, #034EA2)", padding: "2px 8px", borderRadius: 4, fontWeight: 700 }}>
                            {hosp.type}
                          </span>
                          <h3 style={{ fontSize: 17, fontWeight: 700, color: "#1E293B", marginTop: 6 }}>{hosp.name}</h3>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#F59E0B", fontSize: 14, fontWeight: 700 }}>
                          <Star size={14} fill="currentColor" /> {hosp.rating}
                        </div>
                      </div>
                      <p style={{ fontSize: 13, color: "#64748B", display: "flex", alignItems: "center", gap: 4, marginBottom: 14 }}>
                        <MapPin size={13} /> {hosp.address}
                      </p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
                        {hosp.specs.map(spec => (
                          <span key={spec} style={{ fontSize: 11, background: "#F1F5F9", color: "#475569", padding: "3px 8px", borderRadius: 6, fontWeight: 500 }}>
                            {spec}
                          </span>
                        ))}
                      </div>
                      <div style={{ borderTop: "1px solid #F1F5F9", paddingTop: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 13, color: "#475569", fontWeight: 600 }}>{hosp.beds}</span>
                        <Link href="/" style={{ fontSize: 13, color: "var(--color-primary, #034EA2)", fontWeight: 700, display: "flex", alignItems: "center", gap: 4, textDecoration: "none" }}>
                          View Hospital <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>
                  ))}
                  {filteredHospitals.length === 0 && <EmptyState category="hospitals" />}
                </div>
              )}

              {/* TREATMENTS PANEL */}
              {activeTab === "treatments" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {filteredTreatments.map((treat) => (
                    <div 
                      key={treat.id}
                      style={{ 
                        background: "#FFFFFF", 
                        border: "1px solid #E2E8F0", 
                        borderRadius: 16, 
                        padding: 20, 
                        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" 
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                        <div>
                          <span style={{ fontSize: 10, background: "rgba(220,38,38,0.08)", color: "#DC2626", padding: "2px 8px", borderRadius: 4, fontWeight: 700 }}>
                            {treat.speciality}
                          </span>
                          <h3 style={{ fontSize: 18, fontWeight: 700, color: "#1E293B", marginTop: 6 }}>{treat.name}</h3>
                        </div>
                        <span style={{ fontSize: 12, color: "#64748B", display: "flex", alignItems: "center", gap: 4 }}>
                          <Clock size={12} /> {treat.duration}
                        </span>
                      </div>
                      <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.6, marginBottom: 16 }}>
                        {treat.description}
                      </p>
                      <div style={{ display: "flex", gap: 12 }}>
                        <Link href="/doctors" style={{ padding: "8px 16px", background: "var(--color-primary, #034EA2)", color: "#FFFFFF", borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
                          Find Specialists
                        </Link>
                        <Link href="/" style={{ padding: "8px 16px", background: "transparent", color: "var(--color-primary, #034EA2)", border: "1px solid var(--color-primary, #034EA2)", borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
                          Learn Treatment Details
                        </Link>
                      </div>
                    </div>
                  ))}
                  {filteredTreatments.length === 0 && <EmptyState category="treatments" />}
                </div>
              )}

              {/* HEALTH PACKAGES PANEL */}
              {activeTab === "packages" && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
                  {filteredPackages.map((pkg) => (
                    <div 
                      key={pkg.id}
                      style={{ 
                        background: "#FFFFFF", 
                        border: pkg.popular ? "2px solid var(--color-primary, #034EA2)" : "1px solid #E2E8F0", 
                        borderRadius: 16, 
                        padding: 20, 
                        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
                        position: "relative"
                      }}
                    >
                      {pkg.popular && (
                        <span style={{ position: "absolute", top: -11, right: 20, background: "var(--color-primary, #034EA2)", color: "#FFFFFF", fontSize: 9, fontWeight: 800, padding: "2px 8px", borderRadius: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                          Most Popular
                        </span>
                      )}
                      <div style={{ marginBottom: 12 }}>
                        <span style={{ fontSize: 12, color: "#64748B", fontWeight: 600 }}>{pkg.tests} Included</span>
                        <h3 style={{ fontSize: 17, fontWeight: 700, color: "#1E293B", marginTop: 4 }}>{pkg.name}</h3>
                      </div>
                      
                      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                        {pkg.inclusions.slice(0, 4).map((inc) => (
                          <div key={inc} style={{ fontSize: 12, color: "#475569", display: "flex", alignItems: "center", gap: 6 }}>
                            <ShieldCheck size={14} style={{ color: "#10B981" }} /> {inc}
                          </div>
                        ))}
                        {pkg.inclusions.length > 4 && (
                          <div style={{ fontSize: 11, color: "var(--color-primary, #034EA2)", fontWeight: 700, paddingLeft: 20 }}>
                            + {pkg.inclusions.length - 4} more tests & evaluations
                          </div>
                        )}
                      </div>

                      <div style={{ borderTop: "1px solid #F1F5F9", paddingTop: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ fontSize: 11, color: "#64748B" }}>Total Cost</div>
                          <div style={{ fontSize: 18, fontWeight: 800, color: "#1E293B" }}>{pkg.price}</div>
                        </div>
                        <Link href="/" style={{ padding: "8px 16px", background: "var(--color-primary, #034EA2)", color: "#FFFFFF", borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
                          Book Package
                        </Link>
                      </div>
                    </div>
                  ))}
                  {filteredPackages.length === 0 && <EmptyState category="health packages" />}
                </div>
              )}

              {/* TEST LABS PANEL */}
              {activeTab === "labs" && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
                  {filteredLabs.map((lab) => (
                    <div 
                      key={lab.id}
                      style={{ 
                        background: "#FFFFFF", 
                        border: "1px solid #E2E8F0", 
                        borderRadius: 16, 
                        padding: 18, 
                        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" 
                      }}
                    >
                      <div style={{ marginBottom: 12 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1E293B" }}>{lab.name}</h3>
                        <p style={{ fontSize: 11, color: "#64748B", marginTop: 4 }}>{lab.parameters}</p>
                      </div>
                      <p style={{ fontSize: 12, color: "#64748B", display: "flex", alignItems: "center", gap: 4, marginBottom: 16 }}>
                        <Clock size={12} /> {lab.time}
                      </p>
                      <div style={{ borderTop: "1px solid #F1F5F9", paddingTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 16, fontWeight: 800, color: "#1E293B" }}>{lab.price}</span>
                        <Link href="/" style={{ padding: "8px 16px", background: "transparent", color: "var(--color-primary, #034EA2)", border: "1px solid var(--color-primary, #034EA2)", borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: "none" }}>
                          Add Test
                        </Link>
                      </div>
                    </div>
                  ))}
                  {filteredLabs.length === 0 && <EmptyState category="lab tests" />}
                </div>
              )}

              {/* ARTICLES PANEL */}
              {activeTab === "articles" && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
                  {filteredArticles.map((art) => (
                    <div 
                      key={art.id}
                      style={{ 
                        background: "#FFFFFF", 
                        border: "1px solid #E2E8F0", 
                        borderRadius: 16, 
                        padding: 20, 
                        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" 
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                        <span style={{ fontSize: 10, background: "rgba(3,78,162,0.08)", color: "var(--color-primary, #034EA2)", padding: "2px 8px", borderRadius: 4, fontWeight: 700 }}>
                          {art.category}
                        </span>
                        <span style={{ fontSize: 11, color: "#94A3B8" }}>{art.date}</span>
                      </div>
                      <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1E293B", lineHeight: 1.4, marginBottom: 8 }}>
                        {art.title}
                      </h3>
                      <p style={{ fontSize: 13, color: "#64748B", lineHeight: 1.5, marginBottom: 16 }}>
                        {art.summary}
                      </p>
                      <div style={{ borderTop: "1px solid #F1F5F9", paddingTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12 }}>
                        <span style={{ color: "#475569" }}>By <strong>{art.author}</strong></span>
                        <span style={{ color: "#94A3B8", display: "flex", alignItems: "center", gap: 4 }}>
                          <Clock size={12} /> {art.readTime}
                        </span>
                      </div>
                    </div>
                  ))}
                  {filteredArticles.length === 0 && <EmptyState category="articles" />}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ category }: { category: string }) {
  return (
    <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "64px 24px", background: "#FFFFFF", borderRadius: 16, border: "1px dashed #CBD5E1" }}>
      <ShieldAlert size={40} style={{ color: "#94A3B8", margin: "0 auto 12px" }} />
      <h3 style={{ fontSize: 16, fontWeight: 700, color: "#475569", marginBottom: 4 }}>No matching {category} found</h3>
      <p style={{ fontSize: 13, color: "#94A3B8" }}>Try adjusting your search criteria or typing alternate keywords.</p>
    </div>
  );
}

export default function SearchResultsPage() {
  return (
    <Suspense fallback={<div style={{ paddingTop: "120px", textAlign: "center" }}>Loading search results...</div>}>
      <SearchResultsContent />
    </Suspense>
  );
}
