"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Filter, X, Star, MapPin, Clock,
  ChevronDown, ChevronRight, SlidersHorizontal
} from "lucide-react";

const specialities = [
  "All", "Cardiology", "Neurology", "Oncology", "Orthopaedics",
  "Paediatrics", "Gastroenterology", "Ophthalmology", "ENT",
];

const cities = ["All Cities", "Bangalore", "Kolkata", "Mumbai", "Delhi", "Hyderabad", "Chennai"];

const doctors = [
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

export default function DoctorsPage() {
  const [search, setSearch] = useState("");
  const [selectedSpec, setSelectedSpec] = useState("All");
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const query = params.get("search") || "";
      if (query) {
        setSearch(query);
      }
    }
  }, []);

  const filtered = doctors.filter((d) => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.speciality.toLowerCase().includes(search.toLowerCase());
    const matchSpec = selectedSpec === "All" || d.speciality === selectedSpec;
    const matchCity = selectedCity === "All Cities" || d.city === selectedCity;
    return matchSearch && matchSpec && matchCity;
  });

  return (
    <div style={{ paddingTop: "var(--nav-height)", minHeight: "100vh", background: "var(--color-bg-alt)" }}>
      {/* Page Header */}
      <div style={{ background: "var(--color-primary)", padding: "48px 0 64px" }}>
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div style={{ color: "rgba(255,255,255,0.65)", fontSize: "var(--font-size-xs)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
              Find Your Doctor
            </div>
            <h1 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 900, color: "#fff", marginBottom: 16, letterSpacing: "-0.02em" }}>
              Our Specialist Doctors
            </h1>
            <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "var(--font-size-lg)", marginBottom: 24 }}>
              Browse 3,000+ specialists across 30+ specialities in 24 cities.
            </p>
            {/* Search Bar */}
            <div style={{ display: "flex", gap: 12, maxWidth: 640, flexWrap: "wrap" }}>
              <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, background: "#fff", borderRadius: "var(--radius-md)", padding: "12px 16px", minWidth: 200 }}>
                <Search size={18} style={{ color: "var(--color-text-muted)", flexShrink: 0 }} />
                <input
                  id="doctor-search-input"
                  type="text"
                  placeholder="Search doctor name or speciality..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ border: "none", outline: "none", flex: 1, fontSize: "var(--font-size-base)", fontFamily: "var(--font-family)", color: "var(--color-text)" }}
                />
                {search && <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)" }}><X size={16} /></button>}
              </div>
              <select
                id="doctor-city-filter"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                style={{ padding: "12px 40px 12px 16px", background: "#fff", border: "none", borderRadius: "var(--radius-md)", fontSize: "var(--font-size-base)", fontFamily: "var(--font-family)", color: "var(--color-text)", cursor: "pointer", outline: "none" }}
              >
                {cities.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container" style={{ padding: "32px var(--sp-3)", display: "grid", gridTemplateColumns: "260px 1fr", gap: "var(--sp-4)", alignItems: "start" }}>
        {/* Sidebar */}
        <aside style={{ position: "sticky", top: "calc(var(--nav-height) + 24px)", background: "#fff", borderRadius: "var(--radius-xl)", border: "1px solid var(--color-border-light)", padding: "var(--sp-3)", boxShadow: "var(--shadow-md)" }}>
          <div style={{ fontSize: "var(--font-size-base)", fontWeight: 700, color: "var(--color-text)", marginBottom: "var(--sp-3)", display: "flex", alignItems: "center", gap: 8 }}>
            <SlidersHorizontal size={16} style={{ color: "var(--color-primary)" }} />
            Filters
          </div>

          <div style={{ marginBottom: "var(--sp-3)" }}>
            <div style={{ fontSize: "var(--font-size-xs)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-text-muted)", marginBottom: 10 }}>Speciality</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {specialities.map((s) => (
                <button
                  key={s}
                  id={`filter-spec-${s.toLowerCase()}`}
                  onClick={() => setSelectedSpec(s)}
                  style={{
                    padding: "8px 12px", borderRadius: "var(--radius-md)", border: "none", cursor: "pointer",
                    textAlign: "left", fontSize: "var(--font-size-sm)", fontWeight: selectedSpec === s ? 700 : 500,
                    background: selectedSpec === s ? "var(--color-primary-light)" : "transparent",
                    color: selectedSpec === s ? "var(--color-primary)" : "var(--color-text-secondary)",
                    fontFamily: "var(--font-family)", transition: "all 0.15s ease-out",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div style={{ borderTop: "1px solid var(--color-border-light)", paddingTop: "var(--sp-3)" }}>
            <div style={{ fontSize: "var(--font-size-xs)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-text-muted)", marginBottom: 10 }}>Availability</div>
            {["Available Today", "Available This Week", "All"].map((a) => (
              <label key={a} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 0", cursor: "pointer", fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)" }}>
                <input type="radio" name="availability" style={{ accentColor: "var(--color-primary)" }} defaultChecked={a === "All"} />
                {a}
              </label>
            ))}
          </div>
        </aside>

        {/* Doctor Grid */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--sp-3)" }}>
            <div style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>
              Showing <strong style={{ color: "var(--color-text)" }}>{filtered.length}</strong> doctors
            </div>
            <select id="doctor-sort" style={{ padding: "8px 14px", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", fontSize: "var(--font-size-sm)", fontFamily: "var(--font-family)", background: "#fff", color: "var(--color-text)", cursor: "pointer" }}>
              <option>Sort: Relevance</option>
              <option>Experience: High to Low</option>
              <option>Rating: High to Low</option>
              <option>Fee: Low to High</option>
            </select>
          </div>

          <AnimatePresence mode="popLayout">
            <motion.div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "var(--sp-2)" }} layout>
              {filtered.map((doc, i) => (
                <motion.div
                  key={doc.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05, duration: 0.35 }}
                >
                  <Link href={`/doctors/${doc.id}`} id={`doctor-card-${doc.id}`} style={{ display: "block", background: "#fff", border: "1px solid var(--color-border-light)", borderRadius: "var(--radius-xl)", padding: "var(--sp-3)", boxShadow: "var(--shadow-sm)", textDecoration: "none", transition: "transform 0.2s ease-out, box-shadow 0.2s ease-out" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-card-hover)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-sm)"; }}
                  >
                    <div style={{ display: "flex", gap: "var(--sp-2)", marginBottom: "var(--sp-2)" }}>
                      <div style={{ position: "relative", width: 72, height: 72, borderRadius: "var(--radius-lg)", overflow: "hidden", flexShrink: 0, background: "var(--color-primary-light)" }}>
                        <Image src={doc.img} alt={doc.name} fill style={{ objectFit: "cover" }} />
                      </div>
                      <div>
                        <div style={{ fontSize: "var(--font-size-base)", fontWeight: 700, color: "var(--color-text)", marginBottom: 2 }}>{doc.name}</div>
                        <div style={{ fontSize: "var(--font-size-sm)", color: "var(--color-primary)", fontWeight: 600, marginBottom: 4 }}>{doc.speciality}</div>
                        <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                          <MapPin size={11} />
                          {doc.hospital} · {doc.city}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "var(--sp-2)", marginBottom: "var(--sp-2)", flexWrap: "wrap" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "var(--font-size-xs)", color: "#F59E0B", fontWeight: 600 }}>
                        <Star size={12} fill="currentColor" /> {doc.rating} ({doc.reviews.toLocaleString()})
                      </div>
                      <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                        <Clock size={11} /> {doc.experience}
                      </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--color-border-light)", paddingTop: "var(--sp-2)" }}>
                      <div>
                        <div style={{ fontSize: "var(--font-size-xs)", color: doc.available.includes("Today") ? "var(--color-success)" : "var(--color-text-muted)", fontWeight: 600 }}>
                          {doc.available}
                        </div>
                        <div style={{ fontSize: "var(--font-size-sm)", fontWeight: 700, color: "var(--color-text)" }}>{doc.fee} per visit</div>
                      </div>
                      <div style={{ padding: "8px 16px", background: "var(--color-primary)", color: "#fff", borderRadius: "var(--radius-full)", fontSize: "var(--font-size-xs)", fontWeight: 700 }}>
                        Book Now
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "var(--sp-10)", color: "var(--color-text-muted)" }}>
              <Search size={40} style={{ margin: "0 auto 16px", opacity: 0.3 }} />
              <div style={{ fontSize: "var(--font-size-lg)", fontWeight: 600, marginBottom: 8 }}>No doctors found</div>
              <div>Try adjusting your search or filters</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
