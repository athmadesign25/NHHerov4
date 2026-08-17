"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./search.module.css";
import { 
  Search, X, User, Building2, Activity, ShieldCheck, 
  FileText, Calendar, Star, MapPin, Clock, ArrowRight, ShieldAlert,
  ChevronRight, Building, Video, PhoneCall, ArrowRightLeft
} from "lucide-react";

// Mock Data
const ALL_SPECIALTIES = [
  "Adult Cardiology", "Adult Critical Care Medicine", "Adult Haemato-oncology and BMT", "Anesthesiology", "Audiology",
  "Blood Bank", "Breast Oncology & Oncoplastic Surgery", "Cancer Care", "Cardiac Sciences", "Cardiac Surgery - Adult", 
  "Cardiology", "Cardiology - Paediatric", "Child & Adolescent Psychiatry", "Clinical Genetics", "Clinical Hematology", 
  "Clinical Immunology", "Clinical Nutrition", "Clinical Psychology", "Cosmetology", "Critical Care"
];

const doctorsData = [
  {
    id: "dr-1",
    name: "Dr. Rajiv Menon",
    speciality: "Cardiologist",
    degrees: "MBBS, MD (General Medicine)",
    hospital: "Mazumdar Shaw Medical Centre",
    hospitalCount: "+1",
    city: "Bangalore",
    experience: "22 Years",
    rating: 4.9,
    reviews: 1240,
    available: "Available Today",
    availability: {
      hospital: "Tom, 02:30 PM",
      video: "Today, 10:00 AM"
    },
    img: "/images/misc/doctor_avatar_male_v2.png",
    fee: "₹1,950",
  },
  {
    id: "dr-2",
    name: "Dr. Priya Sharma",
    speciality: "Neurologist",
    degrees: "MBBS, MD, DM (Neurology)",
    hospital: "NH Kolkata",
    hospitalCount: "",
    city: "Kolkata",
    experience: "15 Years",
    rating: 4.8,
    reviews: 890,
    available: "Next Available: Tom",
    availability: {
      hospital: "Tom, 11:00 AM",
      video: "Tom, 04:00 PM"
    },
    img: "/images/misc/doctor_avatar_female_v2.png",
    fee: "₹1,200",
  },
  {
    id: "dr-3",
    name: "Dr. Arun Krishnan",
    speciality: "Oncologist",
    degrees: "MBBS, MS, MCh (Surgical Oncology)",
    hospital: "NH Bangalore",
    hospitalCount: "+2",
    city: "Bangalore",
    experience: "28 Years",
    rating: 4.9,
    reviews: 2100,
    available: "Available Today",
    availability: {
      hospital: "Today, 05:30 PM",
      video: "Tom, 09:00 AM"
    },
    img: "/images/misc/doctor_avatar_male_v2.png",
    fee: "₹2,000",
  },
  {
    id: "dr-4",
    name: "Dr. Sunita Patel",
    speciality: "Orthopaedics",
    degrees: "MBBS, MS (Orthopaedics)",
    hospital: "NH Ahmedabad",
    hospitalCount: "",
    city: "Ahmedabad",
    experience: "18 Years",
    rating: 4.7,
    reviews: 560,
    available: "Available Today",
    availability: {
      hospital: "Tom, 01:00 PM",
      video: "Today, 03:00 PM"
    },
    img: "/images/misc/doctor_avatar_female_v2.png",
    fee: "₹1,000",
  },
  {
    id: "dr-5",
    name: "Dr. Mohammed Raza",
    speciality: "Cardiologist",
    degrees: "MBBS, MD, DM (Cardiology)",
    hospital: "NH Mumbai",
    hospitalCount: "+1",
    city: "Mumbai",
    experience: "20 Years",
    rating: 4.8,
    reviews: 980,
    available: "Next Available: Day After",
    availability: {
      hospital: "Wed, 10:30 AM",
      video: "Tom, 06:00 PM"
    },
    img: "/images/misc/doctor_avatar_male_v2.png",
    fee: "₹1,800",
  },
  {
    id: "dr-6",
    name: "Dr. Ananya Roy",
    speciality: "Neurologist",
    degrees: "MBBS, MD (Medicine)",
    hospital: "NH Kolkata",
    hospitalCount: "",
    city: "Kolkata",
    experience: "12 Years",
    rating: 4.6,
    reviews: 430,
    available: "Available Today",
    availability: {
      hospital: "Today, 04:30 PM",
      video: "Today, 07:00 PM"
    },
    img: "/images/misc/doctor_avatar_female_v2.png",
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
  { id: "packages_tests", label: "Health Packages & Tests", countKey: "packages_tests" },
  { id: "treatments", label: "Treatments", countKey: "treatments" },
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

  // Filter State
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [selectedHospitals, setSelectedHospitals] = useState<string[]>([]);
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([]);
  const [selectedExpertise, setSelectedExpertise] = useState<string[]>([]);
  const [selectedGender, setSelectedGender] = useState<string[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string[]>([]);
  const [specLimit, setSpecLimit] = useState(8);
  const [isFiltering, setIsFiltering] = useState(false);
  const [consultationType, setConsultationType] = useState<"Hospital Visit" | "Video Consultation">("Hospital Visit");

  // Toggle filter helper
  const toggleFilter = (setter: React.Dispatch<React.SetStateAction<string[]>>, value: string) => {
    setter(prev => prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]);
    setIsFiltering(true);
    setTimeout(() => setIsFiltering(false), 300);
  };

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
    packages_tests: filteredPackages.length + filteredLabs.length,
    articles: filteredArticles.length,
  };

  return (
    <div style={{ paddingTop: "var(--nav-height)", minHeight: "100vh", background: "var(--color-bg-card)" }}>
      {/* Top Search Banner */}
      <div style={{ background: "linear-gradient(135deg, #022352 0%, #034EA2 100%)", padding: "40px 0 48px", color: "#FFFFFF" }}>
        <div className="container">
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
                    padding: "0 48px 0 52px",
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
                    style={{ position: "absolute", right: 20, top: 16, background: "none", border: "none", cursor: "pointer", color: "#94A3B8" }}
                  >
                    <X size={20} />
                  </button>
                )}
                <Search 
                  size={20} 
                  style={{ position: "absolute", left: 20, top: 16, color: "#94A3B8" }} 
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
                    fontWeight: 400,
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
      <div className="container" style={{ paddingTop: 0, paddingBottom: 24 }}>
        {/* Horizontal Navigation Filters */}
        <div className={styles.tabScroll}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const count = counts[tab.countKey];
            return (
              <button
                key={tab.id}
                className={isActive ? styles.activeTab : ""}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  position: "relative",
                  padding: "12px 18px",
                  background: isActive 
                    ? "linear-gradient(var(--color-bg-card), var(--color-bg-card)) padding-box, linear-gradient(to bottom, var(--color-emergency, #EF4444) 0%, var(--color-bg-alt) 70%) border-box" 
                    : "var(--color-bg-alt)",
                  border: "1px solid transparent",
                  borderBottom: "1px solid transparent",
                  borderRadius: "16px 16px 0 0",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: isActive ? "#000000" : "#64748B",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: -1,
                  transition: "all 0.2s ease",
                }}
              >
                {tab.label}
                <span 
                  style={{ 
                    fontSize: 11, 
                    background: isActive ? "rgba(3, 78, 162, 0.08)" : "#E2E8F0", 
                    color: isActive ? "#000000" : "#64748B",
                    padding: "2px 6px",
                    borderRadius: 10,
                    fontWeight: 500
                  }}
                >
                  {count}
                </span>
                {isActive && (
                  <motion.div 
                    layoutId="activeTabUnderline"
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: "calc(50% - 18px)",
                      width: 36,
                      height: 2,
                      background: "var(--color-emergency, #EF4444)",
                      borderRadius: 4,
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
                <div className={styles.doctorsLayout}>
                  {/* Left Sidebar Filters */}
                  <div className={styles.filterPanel}>
                    {/* Specialty Filter */}
                    {/* Specialty Filter */}
                    <div className={styles.filterGroup}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                        <h4 className={styles.filterTitle} style={{ marginBottom: 0 }}>Specialty</h4>
                        {selectedSpecialties.length > 0 && (
                          <button
                            onClick={() => {
                              setSelectedSpecialties([]);
                              setSpecLimit(8);
                              setIsFiltering(true);
                              setTimeout(() => setIsFiltering(false), 300);
                            }}
                            style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", color: "var(--color-primary)", fontSize: "var(--font-size-sm)", fontWeight: 600, cursor: "pointer", padding: 0 }}
                          >
                            Clear
                          </button>
                        )}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {ALL_SPECIALTIES.slice(0, specLimit).map((spec) => (
                          <label key={spec} className={styles.checkboxLabel}>
                            <input 
                              type="checkbox" 
                              className={styles.checkboxInput}
                              checked={selectedSpecialties.includes(spec)}
                              onChange={() => toggleFilter(setSelectedSpecialties, spec)}
                            />
                            {spec}
                          </label>
                        ))}
                        {specLimit < ALL_SPECIALTIES.length && (
                          <button 
                            onClick={() => setSpecLimit(ALL_SPECIALTIES.length)}
                            style={{ 
                              background: "none", 
                              border: "none", 
                              color: "var(--color-primary)", 
                              fontWeight: 600, 
                              textAlign: "left", 
                              cursor: "pointer", 
                              padding: 0, 
                              marginTop: 4, 
                              fontSize: "var(--font-size-sm)" 
                            }}
                          >
                            + {ALL_SPECIALTIES.length - specLimit} more
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Hospital Filter */}
                    <div className={styles.filterGroup}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                        <h4 className={styles.filterTitle} style={{ marginBottom: 0 }}>Hospital</h4>
                        {selectedHospitals.length > 0 && (
                          <button
                            onClick={() => {
                              setSelectedHospitals([]);
                              setIsFiltering(true);
                              setTimeout(() => setIsFiltering(false), 300);
                            }}
                            style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", color: "var(--color-primary)", fontSize: "var(--font-size-sm)", fontWeight: 600, cursor: "pointer", padding: 0 }}
                          >
                            Clear
                          </button>
                        )}
                      </div>
                      {["Narayana Health City", "Mazumdar Shaw Medical Center", "MSMC Clinic"].map((hosp) => (
                        <label key={hosp} className={styles.checkboxLabel}>
                          <input 
                            type="checkbox" 
                            className={styles.checkboxInput}
                            checked={selectedHospitals.includes(hosp)}
                            onChange={() => toggleFilter(setSelectedHospitals, hosp)}
                          />
                          {hosp}
                        </label>
                      ))}
                    </div>

                    {/* Availability Filter */}
                    <div className={styles.filterGroup}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                        <h4 className={styles.filterTitle} style={{ marginBottom: 0 }}>Availability</h4>
                        {selectedAvailability.length > 0 && (
                          <button
                            onClick={() => {
                              setSelectedAvailability([]);
                              setIsFiltering(true);
                              setTimeout(() => setIsFiltering(false), 300);
                            }}
                            style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", color: "var(--color-primary)", fontSize: "var(--font-size-sm)", fontWeight: 600, cursor: "pointer", padding: 0 }}
                          >
                            Clear
                          </button>
                        )}
                      </div>
                      {["Available Today", "Available Tomorrow", "Next 7 Days"].map((avail) => (
                        <label key={avail} className={styles.checkboxLabel}>
                          <input 
                            type="checkbox" 
                            className={styles.checkboxInput}
                            checked={selectedAvailability.includes(avail)}
                            onChange={() => toggleFilter(setSelectedAvailability, avail)}
                          />
                          {avail}
                        </label>
                      ))}
                    </div>

                    {/* Expertise Filter */}
                    <div className={styles.filterGroup}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                        <h4 className={styles.filterTitle} style={{ marginBottom: 0 }}>Expertise</h4>
                        {selectedExpertise.length > 0 && (
                          <button
                            onClick={() => {
                              setSelectedExpertise([]);
                              setIsFiltering(true);
                              setTimeout(() => setIsFiltering(false), 300);
                            }}
                            style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", color: "var(--color-emergency)", fontSize: 12, fontWeight: 700, cursor: "pointer", padding: 0 }}
                          >
                            Clear <X size={12} />
                          </button>
                        )}
                      </div>
                      {["Surgeon", "Consultant", "Specialist"].map((exp) => (
                        <label key={exp} className={styles.checkboxLabel}>
                          <input 
                            type="checkbox" 
                            className={styles.checkboxInput}
                            checked={selectedExpertise.includes(exp)}
                            onChange={() => toggleFilter(setSelectedExpertise, exp)}
                          />
                          {exp}
                        </label>
                      ))}
                    </div>

                    {/* Gender Filter */}
                    <div className={styles.filterGroup}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                        <h4 className={styles.filterTitle} style={{ marginBottom: 0 }}>Gender</h4>
                        {selectedGender.length > 0 && (
                          <button
                            onClick={() => {
                              setSelectedGender([]);
                              setIsFiltering(true);
                              setTimeout(() => setIsFiltering(false), 300);
                            }}
                            style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", color: "var(--color-emergency)", fontSize: 12, fontWeight: 700, cursor: "pointer", padding: 0 }}
                          >
                            Clear <X size={12} />
                          </button>
                        )}
                      </div>
                      {["Male", "Female", "Any"].map((gender) => (
                        <label key={gender} className={styles.checkboxLabel}>
                          <input 
                            type="checkbox" 
                            className={styles.checkboxInput}
                            checked={selectedGender.includes(gender)}
                            onChange={() => toggleFilter(setSelectedGender, gender)}
                          />
                          {gender}
                        </label>
                      ))}
                    </div>

                    {/* Language Filter */}
                    <div className={styles.filterGroup}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                        <h4 className={styles.filterTitle} style={{ marginBottom: 0 }}>Language</h4>
                        {selectedLanguage.length > 0 && (
                          <button
                            onClick={() => {
                              setSelectedLanguage([]);
                              setIsFiltering(true);
                              setTimeout(() => setIsFiltering(false), 300);
                            }}
                            style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", color: "var(--color-emergency)", fontSize: 12, fontWeight: 700, cursor: "pointer", padding: 0 }}
                          >
                            Clear <X size={12} />
                          </button>
                        )}
                      </div>
                      {["English", "Hindi", "Kannada", "Bengali", "Marathi"].map((lang) => (
                        <label key={lang} className={styles.checkboxLabel}>
                          <input 
                            type="checkbox" 
                            className={styles.checkboxInput}
                            checked={selectedLanguage.includes(lang)}
                            onChange={() => toggleFilter(setSelectedLanguage, lang)}
                          />
                          {lang}
                        </label>
                      ))}
                    </div>


                  </div>

                  {/* Main Grid Content Area */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                    {/* Active Filter Pills */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                      {/* Custom Toggle Switch */}
                      <div 
                        style={{ 
                          display: "flex", 
                          alignItems: "center", 
                          background: "#E2E8F0", 
                          borderRadius: 24, 
                          padding: 4, 
                          gap: 4 
                        }}
                      >
                        <button
                          onClick={() => {
                            if (consultationType !== "Hospital Visit") {
                              setConsultationType("Hospital Visit");
                              setIsFiltering(true);
                              setTimeout(() => setIsFiltering(false), 300);
                            }
                          }}
                          style={{
                            position: "relative",
                            display: "flex",
                            alignItems: "center",
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
                                filter: consultationType === "Hospital Visit" ? "none" : "grayscale(1) brightness(0.6) contrast(0.8)",
                                transition: "var(--transition-fast)"
                              }} 
                            />
                            Hospital Visit
                          </span>
                        </button>
                        <button
                          onClick={() => {
                            if (consultationType !== "Video Consultation") {
                              setConsultationType("Video Consultation");
                              setIsFiltering(true);
                              setTimeout(() => setIsFiltering(false), 300);
                            }
                          }}
                          style={{
                            position: "relative",
                            display: "flex",
                            alignItems: "center",
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
                                filter: consultationType === "Video Consultation" ? "none" : "grayscale(1) brightness(0.6) contrast(0.8)",
                                transition: "var(--transition-fast)"
                              }} 
                            />
                            Video Consultation
                          </span>
                        </button>
                      </div>

                      {/* Dynamic Filter Pills */}
                      {[
                        ...selectedSpecialties.map(val => ({ label: val, remove: () => toggleFilter(setSelectedSpecialties, val) })),
                        ...selectedHospitals.map(val => ({ label: val, remove: () => toggleFilter(setSelectedHospitals, val) })),
                        ...selectedAvailability.map(val => ({ label: val, remove: () => toggleFilter(setSelectedAvailability, val) })),
                        ...selectedExpertise.map(val => ({ label: val, remove: () => toggleFilter(setSelectedExpertise, val) })),
                        ...selectedGender.map(val => ({ label: val, remove: () => toggleFilter(setSelectedGender, val) })),
                        ...selectedLanguage.map(val => ({ label: val, remove: () => toggleFilter(setSelectedLanguage, val) }))
                      ].map((filter, index) => (
                        <div 
                          key={index} 
                          style={{ 
                            display: "inline-flex", 
                            alignItems: "center", 
                            gap: 6, 
                            background: "rgba(237, 28, 36, 0.08)", 
                            border: "1px solid var(--color-emergency)", 
                            borderRadius: 16, 
                            padding: "4px 12px", 
                            fontSize: 13, 
                            fontWeight: 500,
                            color: "var(--color-emergency)" 
                          }}
                        >
                          {filter.label}
                          <button 
                            onClick={filter.remove}
                            style={{ 
                              display: "flex", 
                              alignItems: "center", 
                              justifyContent: "center", 
                              background: "none", 
                              border: "none", 
                              padding: 0, 
                              cursor: "pointer", 
                              color: "var(--color-emergency)" 
                            }}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(330px, 1fr))", gap: 20 }}>
                    {isFiltering ? (
                      Array.from({ length: 4 }).map((_, i) => (
                        <motion.div 
                          key={`skel-${i}`} 
                          animate={{ opacity: [0.3, 0.7, 0.3] }} 
                          transition={{ duration: 1, repeat: Infinity, ease: "easeInOut", delay: i * 0.1 }}
                          style={{ background: "var(--color-bg-card)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}
                        >
                          <div style={{ padding: 18, borderBottom: "1px solid var(--color-border)" }}>
                            <div style={{ display: "flex", gap: 16 }}>
                              <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0 }}>
                                <div style={{ width: 80, height: 80, borderRadius: 12, background: "#E2E8F0" }} />
                                <div style={{ width: 80, height: 18, borderRadius: 6, background: "#E2E8F0" }} />
                              </div>
                              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8, paddingTop: 4 }}>
                                <div style={{ width: "70%", height: 22, background: "#E2E8F0", borderRadius: 4 }} />
                                <div style={{ width: "50%", height: 16, background: "#E2E8F0", borderRadius: 4 }} />
                                <div style={{ width: "80%", height: 14, background: "#E2E8F0", borderRadius: 4 }} />
                              </div>
                            </div>
                          </div>
                          <div style={{ padding: 18 }}>
                             <div style={{ width: "60%", height: 14, background: "#E2E8F0", borderRadius: 4, marginBottom: 16 }} />
                             <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                               <div style={{ width: 100, height: 28, background: "#E2E8F0", borderRadius: 14 }} />
                               <div style={{ width: 100, height: 28, background: "#E2E8F0", borderRadius: 14 }} />
                             </div>
                             <div style={{ height: 1, background: "var(--color-border)", margin: "16px -18px 16px -18px" }} />
                             <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                               <div style={{ width: 80, height: 24, background: "#E2E8F0", borderRadius: 4 }} />
                               <div style={{ display: "flex", gap: 8 }}>
                                 <div style={{ width: 44, height: 44, borderRadius: 22, background: "#E2E8F0" }} />
                                 <div style={{ width: 100, height: 44, borderRadius: 22, background: "#E2E8F0" }} />
                               </div>
                             </div>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      filteredDoctors.map((doc) => (
                    <div 
                      key={doc.id}
                      style={{ 
                        background: "var(--color-bg-card)", 
                        border: "1px solid var(--color-border)", 
                        borderRadius: 16, 
                        overflow: "hidden",
                        boxShadow: "var(--shadow-sm)" 
                      }}
                    >
                      {/* Top Section */}
                      <div style={{ background: "linear-gradient(135deg, #ffffff 0%, var(--color-primary-light) 100%)", padding: 18 }}>
                        <div style={{ display: "flex", gap: 16 }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0 }}>
                            <Link href={`/doctors/${doc.id}`} style={{ position: "relative", width: 80, height: 80, borderRadius: 12, overflow: "hidden", background: "var(--color-border)", display: "block" }}>
                              <Image src={doc.img} alt={doc.name} fill style={{ objectFit: "cover" }} />
                            </Link>
                            <Link href={`/doctors/${doc.id}`} style={{ display: "flex", justifyContent: "center", alignItems: "center", width: 80, padding: "4px 0", background: "var(--color-bg-alt)", color: "var(--color-primary)", borderRadius: 6, fontSize: 9, fontWeight: 500, textDecoration: "none" }}>
                              View Profile <ChevronRight size={10} style={{ marginLeft: 2 }} />
                            </Link>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column" }}>
                            <h3 style={{ fontSize: "var(--font-size-lg)", fontWeight: 700, color: "var(--color-text)", marginBottom: 4 }}>{doc.name}</h3>
                            <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)", fontWeight: 500 }}>{doc.speciality}</p>
                            <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>{doc.degrees}</p>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Section */}
                      <div style={{ padding: 18 }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 12 }}>
                          <MapPin size={16} style={{ color: "var(--color-text-secondary)", flexShrink: 0, marginTop: 2 }} />
                          <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)" }}>
                            {doc.hospital} {doc.hospitalCount && <span style={{ color: "var(--color-primary)", fontWeight: 700 }}>{doc.hospitalCount}</span>}
                          </p>
                        </div>
                        
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                          <Clock size={16} style={{ color: "var(--color-text-secondary)" }} />
                          <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text)" }}>Next available at</p>
                        </div>

                        <div style={{ display: "flex", flexWrap: "nowrap", overflowX: "auto", scrollbarWidth: "none", gap: 12, marginBottom: 16 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "linear-gradient(135deg, var(--color-emergency-light) 0%, #ffffff 100%)", color: "var(--color-text)", padding: "6px 10px", borderRadius: 20, fontSize: "var(--font-size-xs)", fontWeight: 600, whiteSpace: "nowrap" }}>
                            <Image src="/Appointment/Hospital_visit.svg" alt="Hospital Visit" width={16} height={16} />
                            {doc.availability.hospital}
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "linear-gradient(135deg, var(--color-emergency-light) 0%, #ffffff 100%)", color: "var(--color-text)", padding: "6px 10px", borderRadius: 20, fontSize: "var(--font-size-xs)", fontWeight: 600, whiteSpace: "nowrap" }}>
                            <Image src="/Appointment/Video_consultation.svg" alt="Video Consultation" width={16} height={16} />
                            {doc.availability.video}
                          </div>
                        </div>

                        <div style={{ height: 1, background: "var(--color-border)", margin: "16px -18px 16px -18px" }} />

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div style={{ display: "flex", flexDirection: "column" }}>
                            <span style={{ fontSize: "var(--font-size-lg)", fontWeight: 800, color: "var(--color-text)", lineHeight: 1 }}>{doc.fee}</span>
                            <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", marginTop: 4, lineHeight: 1 }}>onwards</span>
                          </div>
                          <div style={{ display: "flex", gap: 8 }}>
                            <a href={`tel:+919876543210`} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 44, height: 44, borderRadius: 22, border: "1px solid var(--color-border)", color: "var(--color-primary)", textDecoration: "none", transition: "var(--transition-fast)", flexShrink: 0 }}>
                              <PhoneCall size={18} />
                            </a>
                            <Link href={`/doctors/${doc.id}/book`} style={{ height: 44, padding: "0 24px", background: "var(--color-primary)", color: "var(--color-text-inverse)", borderRadius: 22, fontSize: "var(--font-size-sm)", fontWeight: 700, textDecoration: "none", transition: "var(--transition-fast)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              Book now
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  )))}
                  {filteredDoctors.length === 0 && !isFiltering && <EmptyState category="doctors" />}
                </div>
                </div>
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

              {/* HEALTH PACKAGES & TESTS PANEL */}
              {activeTab === "packages_tests" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
                  {filteredPackages.length > 0 && (
                    <div>
                      <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--color-text)", marginBottom: 16 }}>Health Packages</h2>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
                        {filteredPackages.map((pkg) => (
                          <div 
                            key={pkg.id}
                            style={{ 
                              background: "#FFFFFF", 
                              border: pkg.popular ? "2px solid var(--color-primary)" : "1px solid #E2E8F0", 
                              borderRadius: 16, 
                              padding: 20, 
                              boxShadow: "var(--shadow-sm)",
                              position: "relative"
                            }}
                          >
                            {pkg.popular && (
                              <span style={{ position: "absolute", top: -11, right: 20, background: "var(--color-primary)", color: "#FFFFFF", fontSize: 9, fontWeight: 800, padding: "2px 8px", borderRadius: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>
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
                                <div style={{ fontSize: 11, color: "var(--color-primary)", fontWeight: 700, paddingLeft: 20 }}>
                                  + {pkg.inclusions.length - 4} more tests & evaluations
                                </div>
                              )}
                            </div>

                            <div style={{ borderTop: "1px solid #F1F5F9", paddingTop: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <div>
                                <div style={{ fontSize: 11, color: "#64748B" }}>Total Cost</div>
                                <div style={{ fontSize: 18, fontWeight: 800, color: "#1E293B" }}>{pkg.price}</div>
                              </div>
                              <Link href="/" style={{ padding: "8px 16px", background: "var(--color-primary)", color: "#FFFFFF", borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
                                Book Package
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {filteredLabs.length > 0 && (
                    <div>
                      <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--color-text)", marginBottom: 16 }}>Test Labs</h2>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
                        {filteredLabs.map((lab) => (
                          <div 
                            key={lab.id}
                            style={{ 
                              background: "#FFFFFF", 
                              border: "1px solid #E2E8F0", 
                              borderRadius: 16, 
                              padding: 18, 
                              boxShadow: "var(--shadow-sm)" 
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
                              <Link href="/" style={{ padding: "8px 16px", background: "transparent", color: "var(--color-primary)", border: "1px solid var(--color-primary)", borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: "none" }}>
                                Add Test
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {filteredPackages.length === 0 && filteredLabs.length === 0 && (
                    <EmptyState category="health packages and tests" />
                  )}
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
