"use client";

import React, { useState, useEffect, useRef } from "react";

import Lottie from "lottie-react";
import pulseAnimation from "@/../public/assets/pulse animation.json";
import starAnimation from "@/../public/assets/AI Searching 2.json";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { MapPin, FlaskConical, Droplets, Shield, Search, ChevronRight , Activity, FileText, Video, Building2 } from "lucide-react";
import styles from "@/components/home/HeroSearchFirst.module.css";
import PixelRipple from "@/components/home/PixelRipple";
import PulseAIWorkspace from "@/components/pulse-ai/PulseAIWorkspace";
import { searchHealthcare, getCityId, NH_CITIES, type NormalizedResults } from "@/lib/searchService";
import QuickTags from "@/features/home/hero/components/QuickTags";
import { popularTags, specialitiesData, type DoctorData, doctorsData, getRealtimePulseResponse, doctorRoles, treatmentsData, articlesData } from "@/features/home/hero/hero.data";

function HighlightMatch({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <span>{text}</span>;

  const regex = new RegExp(`(${query.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part, index) =>
        regex.test(part) ? (
          <span key={index} className={styles.highlight}>
            {part}
          </span>
        ) : (
          part
        )
      )}
    </span>
  );
}






interface HeroSearchProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  isPulseActive: boolean;
  onPulseActiveChange: (isActive: boolean) => void;
}

export default function HeroSearch({ isOpen, onOpenChange: setIsOpen, isPulseActive, onPulseActiveChange: setIsPulseActive }: HeroSearchProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDropdownTab, setActiveDropdownTab] = useState<"doctors" | "specialties" | "treatments_tests" | "articles">("doctors");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [activeIndex, setActiveIndex] = React.useState(0);

  const [hasOpened, setHasOpened] = useState(false);
  const [isPulseAnalyzed, setIsPulseAnalyzed] = useState(false);
  const [hasSubmittedQuery, setHasSubmittedQuery] = useState(false);
  const [showGenericMatchesInPulse, setShowGenericMatchesInPulse] = useState(false);
  const [simulatedUserLocation, setSimulatedUserLocation] = useState<"same_city" | "nearby" | "far_away">("same_city");
  const [showPixelRipple, setShowPixelRipple] = useState(false);

  const [pulseInitialAction, setPulseInitialAction] = useState<string | null>(null);
  const [pulseInitialActionData, setPulseInitialActionData] = useState<any>(null);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("isLoggedIn");
      setIsUserLoggedIn(stored !== "false");
    }
    const handleLoginChange = () => {
      const stored = sessionStorage.getItem("isLoggedIn");
      setIsUserLoggedIn(stored !== "false");
    };
    window.addEventListener("login-state-changed", handleLoginChange);
    return () => window.removeEventListener("login-state-changed", handleLoginChange);
  }, []);

  useEffect(() => {
    const handleOpenPulse = () => {
      setHasOpened(true);
      setIsPulseActive(true);
      // Give time for layout to shift before animating content
      setTimeout(() => setIsPulseAnalyzed(true), 300);
      setSearchQuery("");
      setHasSubmittedQuery(false);
    };
    window.addEventListener("openPulseAI", handleOpenPulse);
    return () => window.removeEventListener("openPulseAI", handleOpenPulse);
  }, []);

  const handlePulseLaunchWithAction = (action: string, doctorData: any) => {
    setPulseInitialAction(action);
    setPulseInitialActionData(doctorData);
    setIsPulseActive(true);
  };

  const handleKnowYourHealthClick = (query: string) => {
    setSearchQuery(query);
    if (!isUserLoggedIn) {
      handlePulseLaunchWithAction("require_login_module", { moduleName: "Know your health", query });
    } else {
      setIsPulseActive(true);
    }
  };

  const isConversational = searchQuery.trim().split(/\s+/).filter(Boolean).length > 4 || 
                          /have|fever|cough|tomorrow|symptom|feel|pain/i.test(searchQuery.trim());

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPulseActive) {
      document.body.style.overflow = "hidden";
      // Delay ripple slightly to sync with the chat expansion animation (0.4s)
      timer = setTimeout(() => setShowPixelRipple(true), 300);
    } else {
      document.body.style.overflow = "";
      setShowPixelRipple(false);
    }
    return () => {
      document.body.style.overflow = "";
      clearTimeout(timer);
    };
  }, [isPulseActive]);
  const [lastSearch, setLastSearch] = useState<string | null>(null);

  // --- API integration state ---
  const [apiData, setApiData] = useState<NormalizedResults | null>(null);
  const [isApiLoading, setIsApiLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const searchRef = useRef<HTMLFormElement>(null);
  const prefersReducedMotion = useReducedMotion();

  // Scroll Animation Logic

  const handleScrollDown = () => {
    const nextSection = document.getElementById("hero-section")?.nextElementSibling;
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
    }
  };

  // Load last search from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("nh_last_search");
      if (saved) {
        setLastSearch(saved);
      }
    }
  }, []);

  // Debounced API call — fires from first character, cancels stale requests
  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    if (abortControllerRef.current) abortControllerRef.current.abort();

    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) {
      setApiData(null);
      setIsApiLoading(false);
      return;
    }

    setIsApiLoading(true);
    const cityId = getCityId(selectedLocation);

    debounceTimerRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortControllerRef.current = controller;
      try {
        const results = await searchHealthcare(trimmedQuery, cityId, controller.signal);
        if (!controller.signal.aborted) {
          setApiData(results);
          setIsApiLoading(false);
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        if (!controller.signal.aborted) {
          console.error("[Search API]", err);
          setApiData(null);
          setIsApiLoading(false);
        }
      }
    }, 280);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [searchQuery, selectedLocation]);

  // Reset dropdown tab to Doctors when typing/query changes
  useEffect(() => {
    setActiveDropdownTab("doctors");
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      if (typeof window !== "undefined") {
        localStorage.setItem("nh_last_search", query);
        setLastSearch(query);
      }
      router.push(`/search?q=${encodeURIComponent(query)}`);
      setIsOpen(false);
      setIsPulseActive(false);
    }
  };

  const handleSelectSuggestion = (name: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("nh_last_search", name);
      setLastSearch(name);
    }
    router.push(`/search?q=${encodeURIComponent(name)}`);
    setIsOpen(false);
    setIsPulseActive(false);
  };

  // Filter lists based on input (semantic keyword search & exact name match)
  const showDefaults = !searchQuery.trim();
  
  const isDoctorQuery = searchQuery.toLowerCase().includes("dr") || searchQuery.toLowerCase().includes("doctor");

  const filteredDoctors = (showDefaults 
    ? doctorsData.map(doc => ({ ...doc, score: 1 }))
    : doctorsData.map((doc) => {
        const nameMatch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
        const specMatch = doc.speciality.toLowerCase().includes(searchQuery.toLowerCase());
        const matchingKeyword = doc.keywords.find((kw) => 
          kw.toLowerCase().includes(searchQuery.toLowerCase())
        );

        return {
          ...doc,
          nameMatch,
          specMatch,
          matchingKeyword,
          score: nameMatch ? 3 : specMatch ? 2 : matchingKeyword ? 1 : 0
        };
      })
      .filter((doc) => doc.score > 0)
      .sort((a, b) => b.score - a.score)
  )
  .filter(doc => selectedLocation === "All Locations" || doc.location === selectedLocation)
  .slice(0, 6);

  const filteredSpecs = showDefaults 
    ? specialitiesData.slice(0, 6).map(spec => ({ ...spec, matchingKeyword: null }))
    : specialitiesData.map((spec) => {
        const nameMatch = spec.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchingKeyword = spec.keywords.find((kw) => 
          kw.toLowerCase().includes(searchQuery.toLowerCase())
        );

        return {
          ...spec,
          nameMatch,
          matchingKeyword,
          score: nameMatch ? 2 : matchingKeyword ? 1 : 0
        };
      })
      .filter((spec) => spec.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);

  const filteredTreatments = showDefaults 
    ? treatmentsData.map(t => ({ ...t, matchingKeyword: null }))
    : treatmentsData.map((t) => {
        const nameMatch = t.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchingKeyword = t.keywords.find((kw) => 
          kw.toLowerCase().includes(searchQuery.toLowerCase())
        );

        return {
          ...t,
          nameMatch,
          matchingKeyword,
          score: nameMatch ? 2 : matchingKeyword ? 1 : 0
        };
      })
      .filter((t) => t.score > 0)
      .sort((a, b) => b.score - a.score);

  const filteredOnlyTreatments = filteredTreatments.filter(t => t.type === "treatment").slice(0, 6);
  const filteredHealthCheckups = filteredTreatments.filter(t => t.type === "health_checkup").slice(0, 6);
  const filteredLabTests = filteredTreatments.filter(t => t.type === "lab_test").slice(0, 6);

  const filteredArticles = showDefaults 
    ? articlesData.slice(0, 6).map(a => ({ ...a, matchingKeyword: null }))
    : articlesData.map((a) => {
        const nameMatch = a.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchingKeyword = a.keywords.find((kw) => 
          kw.toLowerCase().includes(searchQuery.toLowerCase())
        );

        return {
          ...a,
          nameMatch,
          matchingKeyword,
          score: nameMatch ? 2 : matchingKeyword ? 1 : 0
        };
      })
      .filter((a) => a.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);

  const hasSuggestions = filteredDoctors.length > 0 || filteredSpecs.length > 0 || filteredTreatments.length > 0 || filteredArticles.length > 0;

  // --- Derive display data: prefer API results when available, fall back to static ---
  const useApiData = apiData !== null && searchQuery.trim() !== "";

  const displayDoctors = useApiData
    ? apiData!.doctors.slice(0, 6).map((d) => ({
        name: d.name,
        speciality: d.speciality,
        location: d.hospital,
        hospital: d.hospital,
        additionalHospitals: undefined as number | undefined,
        photo: d.photo,
        keywords: [] as string[],
        consultationModes: (
          d.vcEnabled && (d.apptEnabled || d.walkinEnabled) ? "both"
            : d.vcEnabled ? "video"
            : "hospital"
        ) as "both" | "video" | "hospital",
        availability: d.availability,
      }))
    : filteredDoctors;

  const displaySpecs = useApiData
    ? apiData!.specialities.slice(0, 6).map((s) => ({
        name: s.name,
        slug: s.slug,
        image: s.image,
        keywords: [] as string[],
        matchingKeyword: null as string | null,
      }))
    : filteredSpecs;

  const displaySubSpecs = useApiData
    ? apiData!.subSpecialities.slice(0, 6).map((s) => ({
        name: s.name,
        slug: s.slug,
        image: s.image,
        parentSpeciality: s.parentSpeciality,
      }))
    : [];

  const loading = isApiLoading && !apiData;
  const tabCounts = {
    doctors: loading ? -1 : useApiData ? apiData!.doctors.length : filteredDoctors.length,
    specialties: loading ? -1 : useApiData
      ? apiData!.specialities.length + apiData!.subSpecialities.length
      : filteredSpecs.length,
    treatments: loading ? -1 : useApiData
      ? apiData!.procedures.length + apiData!.treatments.length
      : filteredTreatments.length,
    articles: loading ? -1 : useApiData ? apiData!.blogs.length : filteredArticles.length,
  };

  // Combine procedures + treatments for the "Procedures & Treatments" tab
  const displayProcedureItems = useApiData
    ? apiData!.procedures.map((p) => ({
        name: p.name,
        type: "Procedures" as const,
        speciality: p.speciality,
        image: p.image,
      }))
    : filteredOnlyTreatments;

  const displayTreatmentItems = useApiData
    ? apiData!.treatments.map((t) => ({
        name: t.name,
        type: "Treatments" as const,
        speciality: t.speciality,
        image: t.image,
      }))
    : [];

  const displayArticles = useApiData
    ? apiData!.blogs.slice(0, 6).map((b) => ({
        name: b.name,
        keywords: [] as string[],
        image: b.image,
        description: b.speciality || "",
        matchingKeyword: null as string | null,
      }))
    : filteredArticles;

  // Close dropdown on click outside and reset search query
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
  
  return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <motion.form
                    ref={searchRef}
                    onSubmit={handleSearch}
                    className={`${styles.searchBarForm} ${isOpen ? styles.searchBarFormActive : ""}`}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ 
                      opacity: 1, 
                      y: isOpen ? -490 : 0 
                    }}
                    transition={isOpen 
                      ? { duration: 0.4, ease: [0.16, 1, 0.3, 1] } 
                      : hasOpened 
                        ? { duration: 0.2, ease: "easeOut" } 
                        : { delay: 0.4, duration: 0.6 }
                    }
                  >
                    {!isPulseActive && (
                      <div className={`${styles.searchContainer} ${isOpen ? styles.searchContainerActive : ""}`}>
                      <div
                        className={`${styles.searchIconWrapper} ${styles.searchIconPulse}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isConversational) {
                            if (!isPulseAnalyzed) {
                              setIsPulseAnalyzed(true);
                            } else {
                              setIsPulseActive(true);
                              setIsOpen(false);
                            }
                          } else {
                            setIsPulseActive(true);
                          }
                        }}
                        title="Open Pulse AI"
                        style={{ cursor: "pointer" }}
                      >
                        <Search className={styles.searchIcon} size={18} />
                      </div>
                      <input
                        id="hero-search-input"
                        type="text"
                        placeholder="Search doctors, specialities, or treatments..."
                        value={searchQuery}
                        autoComplete="off"
                        autoCorrect="off"
                        spellCheck={false}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setIsOpen(true);
                          setHasOpened(true);
                        }}
                        onFocus={() => {
                          setIsOpen(true);
                          setHasOpened(true);
                        }}
                        className={styles.searchInput}
                      />

                    </div>
                    )}

                    {/* Progressive Search Dropdown */}
                    <AnimatePresence mode="wait">
                      {isOpen ? (
                        <motion.div
                          key="dropdown"
                          className={styles.dropdown}
                          initial={{ opacity: 0, y: 10, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.98 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                          data-lenis-prevent
                        >


                          {!searchQuery.trim() ? (
                    <div className={styles.popularSearchesContainer}>
{/* Popular Tags */}
                      <QuickTags tags={popularTags} onSelectTag={setSearchQuery} />

                      {/* Pulse AI Intent-Driven Entry Points */}
                      <div className={styles.dropdownPulseDivider}>
                        <span>Ask Pulse AI Workspace</span>
                      </div>

                      <div className={styles.entryCardsContainer}>
                        {/* Card 1: Find the right doctor */}
                        <div 
                          className={`${styles.entryCard} ${styles.blueThemeCard}`}
                          onClick={() => {
                            setSearchQuery("");
                            setIsPulseActive(true);
                          }}
                          style={{ cursor: "pointer" }}
                        >
                          <div className={styles.entryCardHeader}>
                            <div className={styles.entryCardBannerWrap}>
                              <img 
                                src="/images/pulse-ai/pulse_find_doctor_banner.png" 
                                alt="Find the right doctor" 
                                className={styles.entryCardBannerImg} 
                              />
                            </div>
                            <div className={styles.entryCardMeta}>
                              <h3 className={styles.entryCardTitle}>Find the right doctor</h3>
                              <p className={styles.entryCardSubtitle}>Book the consultation you need</p>
                            </div>
                            <div className={styles.entryCardChevronBtn}>
                              <ChevronRight size={16} />
                            </div>
                          </div>
                        </div>

                        {/* Card 2: Know your health */}
                        <div 
                          className={`${styles.entryCard} ${styles.tealThemeCard}`}
                          onClick={() => {
                            handleKnowYourHealthClick("Know your health");
                          }}
                          style={{ cursor: "pointer" }}
                        >
                          <div className={styles.entryCardHeader}>
                            <div className={styles.entryCardBannerWrap}>
                              <img 
                                src="/images/pulse-ai/pulse_health_insights_banner.png" 
                                alt="Know your health" 
                                className={styles.entryCardBannerImg} 
                              />
                            </div>
                            <div className={styles.entryCardMeta}>
                              <h3 className={styles.entryCardTitle}>Know your health</h3>
                              <p className={styles.entryCardSubtitle}>Get insights from medical history</p>
                            </div>
                            <div className={styles.entryCardChevronBtn}>
                              <ChevronRight size={16} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      {isConversational ? (
                        <div className={styles.pulsePreviewWrapper} data-lenis-prevent>
                          {/* 1. Top Section: General search results (Standard Matches) - Only shown before analysis */}
                          {!isPulseAnalyzed && (
                            <div className={styles.pulseGeneralMatches}>
                              <div className={styles.pulsePreviewTitle}>Standard Matches</div>
                              <div className={styles.dropdownTabContent} style={{ maxHeight: "200px" }}>
                                <div className={styles.dropdownSection}>
                                  {/* Speciality matched if any */}
                                  {filteredSpecs.length > 0 && (
                                    <div style={{ marginBottom: "12px" }}>
                                      <div className={styles.sectionHeader} style={{ fontSize: "11px", marginBottom: "6px" }}>Specialities</div>
                                      <div className={styles.specGrid} style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
                                        {filteredSpecs.map((spec) => (
                                          <div
                                            key={spec.name}
                                            onClick={() => handleSelectSuggestion(spec.name)}
                                            className={styles.specCard}
                                            style={{ padding: "6px 10px" }}
                                          >
                                            <img
                                              src={spec.image || "/Specialities icons/General Medicine.svg"}
                                              alt={spec.name}
                                              className={styles.specImage}
                                              style={{ width: "24px", height: "24px" }}
                                            />
                                            <div className={styles.specName} style={{ fontSize: "12.5px" }}>
                                              <HighlightMatch text={spec.name} query={searchQuery} />
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                   {(() => {
                                     const hospitalDoctors = filteredDoctors.filter(doc => {
                                       if (simulatedUserLocation === "far_away") return false;
                                       return doc.consultationModes === "hospital" || doc.consultationModes === "both" || !doc.consultationModes;
                                     });

                                     const videoDoctors = filteredDoctors.filter(doc => {
                                       if (simulatedUserLocation === "far_away") {
                                         return doc.consultationModes === "video" || doc.consultationModes === "both" || !doc.consultationModes;
                                       }
                                       return doc.consultationModes === "video";
                                     });

                                     if (filteredDoctors.length === 0) {
                                       return filteredSpecs.length === 0 ? (
                                         <div className={styles.noResults} style={{ padding: "8px 0" }}>No direct general results found</div>
                                       ) : null;
                                     }

                                     return (
                                       <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "8px" }}>
                                         {hospitalDoctors.length > 0 && (
                                           <div>
                                             <div className={styles.sectionHeader} style={{ fontSize: "11px", marginBottom: "6px", color: "#16a34a", display: "flex", alignItems: "center", gap: "4px" }}>
                                               <Building2 size={12} /> Hospital Visit (In-Person)
                                             </div>
                                             <div className={styles.doctorGrid} style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "8px" }}>
                                               {hospitalDoctors.map((doc) => (
                                                <div
                                                  key={doc.name}
                                                  onClick={() => handleSelectSuggestion(doc.name)}
                                                  className={styles.doctorCard}
                                                >
                                                  <div style={{ display: "flex", gap: "16px", alignItems: "flex-start", width: "100%" }}>
                                                    <img
                                                      src={doc.photo || "/images/misc/doctor_avatar_male.png"}
                                                      alt={doc.name}
                                                      className={styles.doctorPhoto}
                                                    />
                                                    <div className={styles.doctorInfo} style={{ width: "100%" }}>
                                                      <div className={styles.doctorName}>
                                                        <HighlightMatch text={doc.name} query={searchQuery} />
                                                      </div>
                                                      <div className={styles.doctorSpec}>{doc.speciality}</div>
                                                      <div className={styles.doctorLoc}>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.locIcon}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                                                        <span>
                                                          <span style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                                            {doc.hospital}
                                                            {doc.additionalHospitals && (
                                                              <span className={styles.plusMoreBadge}> +{doc.additionalHospitals}</span>
                                                            )}
                                                          </span>
                                                        </span>
                                                      </div>
                                                    </div>
                                                  </div>
                                                  
                                                  <div style={{ display: "flex", gap: "4px", alignItems: "center", flexWrap: "wrap", width: "100%", borderTop: "1px solid var(--color-border)", paddingTop: "10px", marginTop: "2px" }}>
                                                    <div style={{ display: "flex", alignItems: "center", gap: "4px", background: "#ffffff", color: "var(--color-text)", padding: "2px 6px", borderRadius: "20px", fontSize: "10px", fontWeight: 600, whiteSpace: "nowrap", border: "1px solid var(--color-border)" }}>
                                                      <img src="/Appointment/Hospital_visit.svg" alt="Hospital Visit" width={10} height={10} />
                                                      {doc.availability?.hospital || "Today 05:30 PM"}
                                                    </div>
                                                    {(doc.consultationModes === "both" || !doc.consultationModes) && (
                                                      <div style={{ display: "flex", alignItems: "center", gap: "4px", background: "#ffffff", color: "var(--color-text)", padding: "2px 6px", borderRadius: "20px", fontSize: "10px", fontWeight: 600, whiteSpace: "nowrap", border: "1px solid var(--color-border)" }}>
                                                        <img src="/Appointment/Video_consultation.svg" alt="Video Consultation" width={10} height={10} />
                                                        {doc.availability?.video || "Today 05:30 PM"}
                                                      </div>
                                                    )}
                                                  </div>
                                                </div>
                                               ))}
                                             </div>
                                           </div>
                                         )}

                                         {videoDoctors.length > 0 && (
                                           <div>
                                             <div className={styles.sectionHeader} style={{ fontSize: "11px", marginBottom: "6px", color: "#7c3aed", display: "flex", alignItems: "center", gap: "4px" }}>
                                               <Video size={12} /> Video Consultation (Online)
                                             </div>
                                             <div className={styles.doctorGrid} style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "8px" }}>
                                               {videoDoctors.map((doc) => (
                                                <div
                                                  key={doc.name}
                                                  onClick={() => handleSelectSuggestion(doc.name)}
                                                  className={styles.doctorCard}
                                                >
                                                  <div style={{ display: "flex", gap: "16px", alignItems: "flex-start", width: "100%" }}>
                                                    <img
                                                      src={doc.photo || "/images/misc/doctor_avatar_male.png"}
                                                      alt={doc.name}
                                                      className={styles.doctorPhoto}
                                                    />
                                                    <div className={styles.doctorInfo} style={{ width: "100%" }}>
                                                      <div className={styles.doctorName}>
                                                        <HighlightMatch text={doc.name} query={searchQuery} />
                                                      </div>
                                                      <div className={styles.doctorSpec}>{doc.speciality}</div>
                                                      <div className={styles.doctorLoc}>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.locIcon}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                                                        <span>
                                                          <span style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                                            {doc.hospital}
                                                            {doc.additionalHospitals && (
                                                              <span className={styles.plusMoreBadge}> +{doc.additionalHospitals}</span>
                                                            )}
                                                          </span>
                                                        </span>
                                                      </div>
                                                    </div>
                                                  </div>
                                                  
                                                  <div style={{ display: "flex", gap: "4px", alignItems: "center", flexWrap: "wrap", width: "100%", borderTop: "1px solid var(--color-border)", paddingTop: "10px", marginTop: "2px" }}>
                                                    {simulatedUserLocation === "far_away" && doc.consultationModes === "hospital" ? (
                                                      <span title="No Online Consultation" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "18px", height: "18px", borderRadius: "50%", background: "#f1f5f9", border: "1px solid #cbd5e1" }}>
                                                        <span style={{ fontSize: "9px" }}>❌</span>
                                                      </span>
                                                    ) : (
                                                      <div style={{ display: "flex", alignItems: "center", gap: "4px", background: "#ffffff", color: "var(--color-text)", padding: "2px 6px", borderRadius: "20px", fontSize: "10px", fontWeight: 600, whiteSpace: "nowrap", border: "1px solid var(--color-border)" }}>
                                                        <img src="/Appointment/Video_consultation.svg" alt="Video Consultation" width={10} height={10} />
                                                        {doc.availability?.video || "Today 05:30 PM"}
                                                      </div>
                                                    )}
                                                  </div>
                                                </div>
                                               ))}
                                             </div>
                                           </div>
                                         )}
                                       </div>
                                     );
                                   })()}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* 2. Bottom Section: Pulse AI Preview / Widget (Dynamic based on analysis status) */}
                          {(() => {
                            if (!isPulseAnalyzed) {
                              if (!hasSubmittedQuery) {
                                return null;
                              } else {
                                return (
                                  <div 
                                    className={styles.pulseAIWidgetBox}
                                    style={{ padding: "18px", background: "linear-gradient(135deg, #f5f3ff 0%, #fae8ff 100%)", border: "1px solid #ddd6fe", borderRadius: "14px", display: "flex", flexDirection: "column", gap: "10px", alignItems: "center", textAlign: "center", marginTop: "12px" }}
                                  >
                                    <div style={{ fontSize: "14.5px", fontWeight: 700, color: "#6b21a8", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                                      <Lottie animationData={starAnimation} style={{ width: "28px", height: "28px" }} loop={true} />
                                      <span>Personalize Results with Pulse AI</span>
                                      <Lottie animationData={pulseAnimation} style={{ width: "42px", height: "24px" }} loop={true} />
                                    </div>
                                    <div style={{ fontSize: "12px", color: "#475569", maxWidth: "480px", lineHeight: "1.4" }}>
                                      Want a more customized, personalized diagnostic summary? Let our Pulse AI analyze your symptoms to find matching doctors and care pathways.
                                    </div>
                                    <button
                                      type="button"
                                      className={styles.askPulseAiSubmitBtn}
                                      onClick={() => setIsPulseAnalyzed(true)}
                                      style={{ background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)", color: "white", border: "none", borderRadius: "9999px", padding: "8px 24px", fontSize: "12.5px", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 12px rgba(124, 58, 237, 0.25)", transition: "all 0.2s" }}
                                    >
                                      Ask Pulse AI
                                    </button>
                                  </div>
                                );
                              }
                            }

                            const response = getRealtimePulseResponse(searchQuery);

                            // IF showGenericMatchesInPulse is true, show MINIMIZED Pulse AI banner + full Standard Matches!
                            if (showGenericMatchesInPulse) {
                              return (
                                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                  {/* Minimized Pulse AI Banner */}
                                  <div 
                                    className={styles.pulseAIPreviewBox}
                                    style={{ padding: "10px 14px", background: "linear-gradient(135deg, #f5f3ff 0%, #fae8ff 100%)", border: "1px solid #ddd6fe", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                                  >
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                      <Lottie animationData={starAnimation} style={{ width: "20px", height: "20px" }} loop={true} />
                                      <span style={{ fontSize: "12.5px", fontWeight: 750, color: "#6b21a8" }}>
                                        Pulse AI Curated Match: {response.suggestedSpec} Specialist Recommended ({response.suggestedDoc.name})
                                      </span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setShowGenericMatchesInPulse(false);
                                      }}
                                      style={{ background: "white", border: "1px solid #7c3aed", borderRadius: "9999px", padding: "4px 12px", fontSize: "11px", fontWeight: 700, color: "#7c3aed", cursor: "pointer", boxShadow: "0 2px 6px rgba(124, 58, 237, 0.15)" }}
                                    >
                                      View Full Curated Match
                                    </button>
                                  </div>

                                  {/* Standard Matches Section */}
                                  <div className={styles.pulseGeneralMatches}>
                                    <div className={styles.pulsePreviewTitle}>Standard Matches</div>
                                    <div className={styles.dropdownTabContent} style={{ maxHeight: "200px" }}>
                                      <div className={styles.dropdownSection}>
                                        {/* Speciality matched if any */}
                                        {filteredSpecs.length > 0 && (
                                          <div style={{ marginBottom: "12px" }}>
                                            <div className={styles.sectionHeader} style={{ fontSize: "11px", marginBottom: "6px" }}>Specialities</div>
                                            <div className={styles.specGrid} style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
                                              {filteredSpecs.map((spec) => (
                                                <div
                                                  key={spec.name}
                                                  onClick={() => handleSelectSuggestion(spec.name)}
                                                  className={styles.specCard}
                                                  style={{ padding: "6px 10px" }}
                                                >
                                                  <img
                                                    src={spec.image || "/Specialities icons/General Medicine.svg"}
                                                    alt={spec.name}
                                                    className={styles.specImage}
                                                    style={{ width: "24px", height: "24px" }}
                                                  />
                                                  <div className={spec.name} style={{ fontSize: "12.5px" }}>
                                                    <HighlightMatch text={spec.name} query={searchQuery} />
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}

                                        {/* Doctors matched if any */}
                                        {filteredDoctors.length > 0 ? (
                                          <div>
                                            <div className={styles.sectionHeader} style={{ fontSize: "11px", marginBottom: "6px" }}>Doctors</div>
                                            <div className={styles.doctorGrid} style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "8px" }}>
                                              {filteredDoctors.map((doc) => (
                                                <div
                                                  key={doc.name}
                                                  onClick={() => handleSelectSuggestion(doc.name)}
                                                  className={styles.doctorCard}
                                                >
                                                  <div style={{ display: "flex", gap: "16px", alignItems: "flex-start", width: "100%" }}>
                                                    <img
                                                      src={doc.photo || "/images/misc/doctor_avatar_male.png"}
                                                      alt={doc.name}
                                                      className={styles.doctorPhoto}
                                                    />
                                                    <div className={styles.doctorInfo} style={{ width: "100%" }}>
                                                      <div className={styles.doctorName}>
                                                        <HighlightMatch text={doc.name} query={searchQuery} />
                                                      </div>
                                                      <div className={styles.doctorSpec}>{doc.speciality}</div>
                                                      <div className={styles.doctorLoc}>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.locIcon}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                                                        <span>
                                                          <span style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                                            {doc.hospital}
                                                            {doc.additionalHospitals && (
                                                              <span className={styles.plusMoreBadge}> +{doc.additionalHospitals}</span>
                                                            )}
                                                          </span>
                                                        </span>
                                                      </div>
                                                    </div>
                                                  </div>
                                                  
                                                  <div style={{ display: "flex", gap: "4px", alignItems: "center", flexWrap: "wrap", width: "100%", borderTop: "1px solid var(--color-border)", paddingTop: "10px", marginTop: "2px" }}>
                                                    <div style={{ display: "flex", alignItems: "center", gap: "4px", background: "#ffffff", color: "var(--color-text)", padding: "2px 6px", borderRadius: "20px", fontSize: "10px", fontWeight: 600, whiteSpace: "nowrap", border: "1px solid var(--color-border)" }}>
                                                      <img src="/Appointment/Hospital_visit.svg" alt="Hospital Visit" width={10} height={10} />
                                                      {doc.availability?.hospital || "Today 05:30 PM"}
                                                    </div>
                                                    {(doc.consultationModes === "both" || !doc.consultationModes) && (
                                                      <div style={{ display: "flex", alignItems: "center", gap: "4px", background: "#ffffff", color: "var(--color-text)", padding: "2px 6px", borderRadius: "20px", fontSize: "10px", fontWeight: 600, whiteSpace: "nowrap", border: "1px solid var(--color-border)" }}>
                                                        <img src="/Appointment/Video_consultation.svg" alt="Video Consultation" width={10} height={10} />
                                                        {doc.availability?.video || "Today 05:30 PM"}
                                                      </div>
                                                    )}
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        ) : (
                                          filteredSpecs.length === 0 && (
                                            <div className={styles.noResults} style={{ padding: "8px 0" }}>No direct general results found</div>
                                          )
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            }

                            // Full Pulse AI recommendations view
                            return (
                              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                <div 
                                  className={`${styles.pulseAIPreviewBox} ${styles.pulseAIPreviewBoxAnalyzed}`}
                                >
                                  <div className={styles.pulsePreviewHeaderRow}>
                                    <div className={styles.pulsePreviewBadge}>
                                      <Lottie animationData={starAnimation} className={styles.pulsePreviewLottie} loop={true} />
                                      {isUserLoggedIn ? (
                                        <span className={styles.pulseAnalyzedBadgeTitle}>🔥 PULSE AI CURATED MATCH</span>
                                      ) : (
                                        <span className={styles.pulseAnalyzedBadgeTitle} style={{ color: "#0891b2" }}>✨ PULSE AI SPECIALIST RECOMMENDATIONS</span>
                                      )}
                                    </div>
                                    {isUserLoggedIn ? (
                                      <div className={styles.pulsePreviewTag} style={{ color: "#7c3aed", background: "#f5f3ff", border: "1px solid #ddd6fe" }}>Curated Live</div>
                                    ) : (
                                      <div className={styles.pulsePreviewTag} style={{ color: "#0891b2", background: "#ecfeff", border: "1px solid #a5f3fc" }}>Specialists matched</div>
                                    )}
                                  </div>

                                  {simulatedUserLocation === "far_away" && (
                                    <div 
                                      style={{
                                        padding: "10px 14px",
                                        background: "#fff1f2",
                                        border: "1px solid #fecdd3",
                                        borderRadius: "8px",
                                        color: "#be123c",
                                        fontSize: "12px",
                                        fontWeight: 600,
                                        marginTop: "8px",
                                        marginBottom: "8px",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "8px"
                                      }}
                                    >
                                      ⚠️ No physical Narayana Health facilities within 100km of your area. Online Video Consultation mode is active.
                                    </div>
                                  )}

                                  {simulatedUserLocation === "nearby" && (
                                    <div 
                                      style={{
                                        padding: "10px 14px",
                                        background: "#fff7ed",
                                        border: "1px solid #ffedd5",
                                        borderRadius: "8px",
                                        color: "#c2410c",
                                        fontSize: "12px",
                                        fontWeight: 600,
                                        marginTop: "8px",
                                        marginBottom: "8px",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "8px"
                                      }}
                                    >
                                      📍 No direct hospitals in your city. Found matching specialists nearby (within 100km). Hospital Visit is available.
                                    </div>
                                  )}

                                  {isUserLoggedIn ? (
                                    <>
                                      <div className={styles.pulsePreviewEmpathy}>
                                        &ldquo;{response.empathy}&rdquo;
                                      </div>

                                      <div className={styles.pulsePreviewRecommendedDoc}>
                                        <img 
                                          src={response.suggestedDoc.photo} 
                                          alt={response.suggestedDoc.name} 
                                          className={styles.pulsePreviewDocPhoto} 
                                        />
                                        <div className={styles.pulsePreviewDocDetails}>
                                          <div className={styles.pulsePreviewBestMatchTag}>
                                            ✨ Best Match / Recommended Specialist
                                          </div>
                                          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "4px" }}>
                                            <div className={styles.pulsePreviewDocName}>
                                              {response.suggestedDoc.name}
                                              <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                                                {(simulatedUserLocation === "same_city" || simulatedUserLocation === "nearby") && 
                                                 (response.suggestedDoc.consultationModes === "hospital" || response.suggestedDoc.consultationModes === "both" || !response.suggestedDoc.consultationModes) && (
                                                  <span style={{ display: "inline-flex", alignItems: "center", gap: "3px", fontSize: "9px", fontWeight: 700, color: "#16a34a", background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "1px 6px", borderRadius: "4px" }}>
                                                    <Building2 size={9} /> Hospital Visit {simulatedUserLocation === "nearby" ? "(65km)" : ""}
                                                  </span>
                                                )}
                                                {(response.suggestedDoc.consultationModes === "video" || response.suggestedDoc.consultationModes === "both" || !response.suggestedDoc.consultationModes) && (
                                                  <span style={{ display: "inline-flex", alignItems: "center", gap: "3px", fontSize: "9px", fontWeight: 700, color: "#7c3aed", background: "#f5f3ff", border: "1px solid #ddd6fe", padding: "1px 6px", borderRadius: "4px" }}>
                                                    <Video size={9} /> Video Consult
                                                  </span>
                                                )}
                                                {simulatedUserLocation === "far_away" && response.suggestedDoc.consultationModes === "hospital" && (
                                                  <span style={{ display: "inline-flex", alignItems: "center", gap: "3px", fontSize: "9px", fontWeight: 700, color: "#94a3b8", background: "#f1f5f9", border: "1px solid #e2e8f0", padding: "1px 6px", borderRadius: "4px" }}>
                                                    ❌ No Online
                                                  </span>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                          <div className={styles.pulsePreviewDocSub}>
                                            {response.suggestedSpec} • {response.suggestedDoc.hospital}
                                          </div>
                                          <div className={styles.pulsePreviewDocSlot}>
                                            Next Slot: <strong>{response.slot}</strong>
                                          </div>
                                        </div>
                                        <div className={styles.pulsePreviewActions}>
                                          <button 
                                            className={styles.pulsePreviewBookBtn}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handlePulseLaunchWithAction("book_now", response.suggestedDoc);
                                            }}
                                          >
                                            Book Now
                                          </button>
                                          <button 
                                            className={styles.pulsePreviewModifyBtn}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handlePulseLaunchWithAction("book_now", response.suggestedDoc);
                                            }}
                                          >
                                            Modify &amp; Book
                                          </button>
                                        </div>
                                      </div>
                                    </>
                                  ) : (
                                    <>
                                      <div className={styles.pulsePreviewEmpathy} style={{ color: "#475569", fontWeight: 500 }}>
                                        We found 3 highly qualified <strong>{response.suggestedSpec}</strong> specialists matching your symptoms. Select a doctor to review slots:
                                      </div>

                                      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "12px" }}>
                                        {response.recommendedDocs.map((doc: any) => (
                                          <div 
                                            key={doc.id}
                                            className={styles.pulsePreviewRecommendedDoc} 
                                            style={{ border: "1px solid #e2e8f0", padding: "10px 14px", borderRadius: "10px", background: "#f8fafc", margin: 0 }}
                                          >
                                            <img 
                                              src={doc.photo} 
                                              alt={doc.name} 
                                              className={styles.pulsePreviewDocPhoto} 
                                              style={{ width: "42px", height: "42px" }}
                                            />
                                            <div className={styles.pulsePreviewDocDetails}>
                                              <div className={styles.pulsePreviewDocName} style={{ fontSize: "14px", fontWeight: 700 }}>
                                                {doc.name}
                                              </div>
                                              <div className={styles.pulsePreviewDocSub} style={{ fontSize: "12px", color: "#64748b" }}>
                                                {doc.qualification} • {doc.hospital}
                                              </div>
                                              <div className={styles.pulsePreviewDocSlot} style={{ fontSize: "12.5px" }}>
                                                Next Slot: <strong style={{ color: "#0891b2" }}>{doc.slot}</strong>
                                              </div>
                                            </div>
                                            <div className={styles.pulsePreviewActions}>
                                              <button 
                                                className={styles.pulsePreviewBookBtn}
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handlePulseLaunchWithAction("book_now", doc);
                                                }}
                                                style={{ padding: "6px 14px", fontSize: "12px" }}
                                              >
                                                Book Now
                                              </button>
                                              <button 
                                                className={styles.pulsePreviewModifyBtn}
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handlePulseLaunchWithAction("book_now", doc);
                                                }}
                                                style={{ padding: "6px 14px", fontSize: "12px" }}
                                              >
                                                View Slots
                                              </button>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </>
                                  )}

                                  {/* Secondary alternate search options section */}
                                  <div className={styles.pulsePreviewSecondarySection}>
                                    <div className={styles.pulseSecondaryTitle}>
                                      <span>✨ If you are looking for something else</span>
                                    </div>
                                    <div className={styles.pulseSecondaryActionsRow}>
                                      <div className={styles.pulseSecondaryChips}>
                                        <button 
                                          className={styles.pulseSecondaryChip}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setSearchQuery("I have been having ");
                                            setIsPulseActive(true);
                                            setIsOpen(false);
                                          }}
                                        >
                                          I have a symptom
                                        </button>
                                        <button 
                                          className={styles.pulseSecondaryChip}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setSearchQuery("I am looking for a ");
                                            setIsPulseActive(true);
                                            setIsOpen(false);
                                          }}
                                        >
                                          I know the speciality
                                        </button>
                                        <button 
                                          className={styles.pulseSecondaryChip}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setSearchQuery("I want to consult Dr. ");
                                            setIsPulseActive(true);
                                            setIsOpen(false);
                                          }}
                                        >
                                          I know the doctor
                                        </button>
                                      </div>
                                      <button 
                                        className={styles.pulseViewAllDocsBtn}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setIsPulseActive(true);
                                        }}
                                      >
                                        View all recommended doctors →
                                      </button>
                                    </div>
                                  </div>
                                </div>

                                {/* Collapsible option to view generic Standard Matches */}
                                <div style={{ display: "flex", justifyContent: "center", marginTop: "4px" }}>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setShowGenericMatchesInPulse(true);
                                    }}
                                    style={{
                                      background: "#ffffff",
                                      border: "1px solid #cbd5e1",
                                      color: "#64748b",
                                      padding: "6px 14px",
                                      borderRadius: "9999px",
                                      fontSize: "12px",
                                      fontWeight: 600,
                                      cursor: "pointer",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "4px",
                                      transition: "all 0.15s ease"
                                    }}
                                  >
                                    Show Standard Matches ▾
                                  </button>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      ) : (
                        <>
                          {/* Tabs Selector at the top */}
                          <div style={{ display: "flex", gap: "2px", overflowX: "auto", scrollbarWidth: "none", marginBottom: "16px", background: "var(--color-bg-alt)", borderRadius: "16px 16px 0 0" }}>
                            {[
                              { id: "doctors", label: "Doctors", count: tabCounts.doctors },
                              { id: "specialties", label: "Specialty", count: tabCounts.specialties },
                              { id: "treatments_tests", label: "Treatments & Procedures", count: tabCounts.treatments },
                              { id: "articles", label: "Articles & Blogs", count: tabCounts.articles }
                            ].map((tab) => {
                              const isActive = activeDropdownTab === tab.id;
                              return (
                                <button
                                  key={tab.id}
                                  type="button"
                                  onClick={() => setActiveDropdownTab(tab.id as any)}
                                  style={{
                                    position: "relative",
                                    padding: "12px 18px",
                                    background: isActive 
                                      ? "linear-gradient(var(--color-bg-card), var(--color-bg-card)) padding-box, linear-gradient(to bottom, var(--color-emergency, #EF4444) 0%, #F1F5F9 70%) border-box" 
                                      : "#F1F5F9",
                                    border: "1px solid transparent",
                                    borderRadius: "16px 16px 0 0",
                                    fontSize: "14px",
                                    fontWeight: 600,
                                    color: isActive ? "#000000" : "#64748B",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    marginBottom: "-1px",
                                    transition: "0.2s",
                                    whiteSpace: "nowrap"
                                  }}
                                >
                                  {tab.label}
                                  <span style={{
                                    fontSize: "11px", 
                                    background: isActive ? "rgba(3, 78, 162, 0.08)" : "#E2E8F0", 
                                    color: isActive ? "#000000" : "#64748B",
                                    padding: "2px 6px",
                                    borderRadius: "10px",
                                    fontWeight: 500
                                  }}>
                                    {tab.count < 0 ? "…" : tab.count}
                                  </span>
                                  {isActive && (
                                    <div style={{
                                      position: "absolute",
                                      bottom: 0,
                                      left: "calc(50% - 18px)",
                                      width: "36px",
                                      height: "2px",
                                      background: "var(--color-emergency, #EF4444)",
                                      borderRadius: "4px",
                                      transformOrigin: "center bottom"
                                    }} />
                                  )}
                                </button>
                              );
                            })}
                          </div>

                          <div className={styles.dropdownTabContent} style={{ maxHeight: activeDropdownTab === "treatments_tests" ? "min(50vh, 420px)" : undefined }} data-lenis-prevent>
                            {activeDropdownTab === "doctors" && (
                              <div className={styles.dropdownSection} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "-8px" }}>
                                  <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)", fontWeight: 500 }}>Showing matches from the nearest available facility.</span>
                                  <div className={styles.dropdownLocationFilter}>
                                    <MapPin size={14} className={styles.locationPinIcon} />
                                  <select
                                    value={selectedLocation}
                                    onChange={(e) => setSelectedLocation(e.target.value)}
                                    className={styles.locationDropdownSelect}
                                  >
                                    <option value="All Locations">All Locations</option>
                                    {NH_CITIES.map((c) => (
                                      <option key={c.value} value={c.value}>{c.label}</option>
                                    ))}
                                  </select>
                                  </div>
                                </div>
                                {/* Doctors Section */}
                                {displayDoctors.length > 0 && (
                                  (() => {
                                    const hospitalDoctors = displayDoctors.filter(doc => {
                                      if (simulatedUserLocation === "far_away") return false;
                                      return doc.consultationModes === "hospital" || doc.consultationModes === "both" || !doc.consultationModes;
                                    });

                                    const videoDoctors = displayDoctors.filter(doc => {
                                      if (simulatedUserLocation === "far_away") {
                                        return doc.consultationModes === "video" || doc.consultationModes === "both" || !doc.consultationModes;
                                      }
                                      return doc.consultationModes === "video";
                                    });

                                    return (
                                      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                        {hospitalDoctors.length > 0 && (
                                          <div>
                                            <div className={styles.sectionHeader} style={{ color: "#16a34a", display: "flex", alignItems: "center", gap: "4px" }}>
                                              <Building2 size={13} /> Hospital Visit (In-Person)
                                            </div>
                                            <div className={styles.doctorGrid}>
                                              {hospitalDoctors.slice(0, 6).map((doc) => (
                                                <div
                                                  key={doc.name}
                                                  onClick={() => handleSelectSuggestion(doc.name)}
                                                  className={styles.doctorCard}
                                                >
                                                  <div style={{ display: "flex", gap: "16px", alignItems: "flex-start", width: "100%" }}>
                                                    <img
                                                      src={doc.photo || "/images/misc/doctor_avatar_male.png"}
                                                      alt={doc.name}
                                                      className={styles.doctorPhoto}
                                                    />
                                                    <div className={styles.doctorInfo} style={{ width: "100%" }}>
                                                      <div className={styles.doctorName}>
                                                        <HighlightMatch text={doc.name} query={searchQuery} />
                                                      </div>
                                                      <div className={styles.doctorSpec}>{doc.speciality}</div>
                                                      <div className={styles.doctorLoc}>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.locIcon}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                                                        <span>
                                                          <span style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                                            {doc.hospital}
                                                            {doc.additionalHospitals && (
                                                              <span className={styles.plusMoreBadge}> +{doc.additionalHospitals}</span>
                                                            )}
                                                          </span>
                                                        </span>
                                                      </div>
                                                    </div>
                                                  </div>
                                                  
                                                  <div style={{ display: "flex", gap: "4px", alignItems: "center", flexWrap: "wrap", width: "100%", borderTop: "1px solid var(--color-border)", paddingTop: "10px", marginTop: "2px" }}>
                                                    <div style={{ display: "flex", alignItems: "center", gap: "4px", background: "#ffffff", color: "var(--color-text)", padding: "2px 6px", borderRadius: "20px", fontSize: "10px", fontWeight: 600, whiteSpace: "nowrap", border: "1px solid var(--color-border)" }}>
                                                      <img src="/Appointment/Hospital_visit.svg" alt="Hospital Visit" width={10} height={10} />
                                                      {doc.availability?.hospital || "Today 05:30 PM"}
                                                    </div>
                                                    {(doc.consultationModes === "both" || !doc.consultationModes) && (
                                                      <div style={{ display: "flex", alignItems: "center", gap: "4px", background: "#ffffff", color: "var(--color-text)", padding: "2px 6px", borderRadius: "20px", fontSize: "10px", fontWeight: 600, whiteSpace: "nowrap", border: "1px solid var(--color-border)" }}>
                                                        <img src="/Appointment/Video_consultation.svg" alt="Video Consultation" width={10} height={10} />
                                                        {doc.availability?.video || "Today 05:30 PM"}
                                                      </div>
                                                    )}
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}

                                        {videoDoctors.length > 0 && (
                                          <div>
                                            <div className={styles.sectionHeader} style={{ color: "#7c3aed", display: "flex", alignItems: "center", gap: "4px" }}>
                                              <Video size={13} /> Video Consultation (Online)
                                            </div>
                                            <div className={styles.doctorGrid}>
                                              {videoDoctors.slice(0, 6).map((doc) => (
                                                <div
                                                  key={doc.name}
                                                  onClick={() => handleSelectSuggestion(doc.name)}
                                                  className={styles.doctorCard}
                                                >
                                                  <div style={{ display: "flex", gap: "16px", alignItems: "flex-start", width: "100%" }}>
                                                    <img
                                                      src={doc.photo || "/images/misc/doctor_avatar_male.png"}
                                                      alt={doc.name}
                                                      className={styles.doctorPhoto}
                                                    />
                                                    <div className={styles.doctorInfo} style={{ width: "100%" }}>
                                                      <div className={styles.doctorName}>
                                                        <HighlightMatch text={doc.name} query={searchQuery} />
                                                      </div>
                                                      <div className={styles.doctorSpec}>{doc.speciality}</div>
                                                      <div className={styles.doctorLoc}>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.locIcon}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                                                        <span>
                                                          <span style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                                            {doc.hospital}
                                                            {doc.additionalHospitals && (
                                                              <span className={styles.plusMoreBadge}> +{doc.additionalHospitals}</span>
                                                            )}
                                                          </span>
                                                        </span>
                                                      </div>
                                                    </div>
                                                  </div>
                                                  
                                                  <div style={{ display: "flex", gap: "4px", alignItems: "center", flexWrap: "wrap", width: "100%", borderTop: "1px solid var(--color-border)", paddingTop: "10px", marginTop: "2px" }}>
                                                    {simulatedUserLocation === "far_away" && doc.consultationModes === "hospital" ? (
                                                      <span title="No Online Consultation" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "18px", height: "18px", borderRadius: "50%", background: "#f1f5f9", border: "1px solid #cbd5e1" }}>
                                                        <span style={{ fontSize: "9px" }}>❌</span>
                                                      </span>
                                                    ) : (
                                                      <div style={{ display: "flex", alignItems: "center", gap: "4px", background: "#ffffff", color: "var(--color-text)", padding: "2px 6px", borderRadius: "20px", fontSize: "10px", fontWeight: 600, whiteSpace: "nowrap", border: "1px solid var(--color-border)" }}>
                                                        <img src="/Appointment/Video_consultation.svg" alt="Video Consultation" width={10} height={10} />
                                                        {doc.availability?.video || "Today 05:30 PM"}
                                                      </div>
                                                    )}
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })()
                                )}

                                {displayDoctors.length === 0 && !isApiLoading && (
                                  <div className={styles.noResults}>No matching doctors found</div>
                                )}

                                {isApiLoading && (
                                  <div className={styles.noResults} style={{ color: "var(--color-text-muted)", fontStyle: "italic" }}>Searching…</div>
                                )}

                                {tabCounts.doctors > 6 && (
                                  <button
                                    style={{ display: "block", padding: "10px 24px", margin: "8px auto 0", background: "transparent", color: "var(--color-primary)", border: "1px solid var(--color-border)", borderRadius: "100px", fontWeight: 600, fontSize: "var(--font-size-sm)", cursor: "pointer", transition: "var(--transition-fast)" }}
                                    onClick={() => {
                                      setIsOpen(false);
                                      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
                                    }}
                                  >
                                    View all {tabCounts.doctors} Doctors
                                  </button>
                                )}
                              </div>
                            )}

                            {activeDropdownTab === "specialties" && (
                              <div className={styles.dropdownSection} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                <div style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)", fontWeight: 500, marginBottom: "-8px" }}>
                                  Showing top matching specialties.
                                </div>
                                {/* Specialities Section */}
                                {displaySpecs.length > 0 && (
                                  <div>
                                    <div className={styles.sectionHeader}>Specialities</div>
                                    <div className={styles.specGrid}>
                                      {displaySpecs.slice(0, 6).map((spec) => (
                                        <div
                                          key={spec.name}
                                          onClick={() => handleSelectSuggestion(spec.name)}
                                          className={styles.specCard}
                                        >
                                          <img
                                            src={spec.image || "/Specialities icons/General Medicine.svg"}
                                            alt={spec.name}
                                            className={styles.specImage}
                                          />
                                          <div className={styles.specInfo} style={{ display: 'flex', flexDirection: 'column', gap: '2px', overflow: 'hidden' }}>
                                            <div className={styles.specName}>
                                              <HighlightMatch text={spec.name} query={searchQuery} />
                                            </div>
                                            {spec.matchingKeyword && (
                                              <div style={{ fontSize: "10.5px", color: "#64748B", fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                Relates to: <HighlightMatch text={spec.matchingKeyword} query={searchQuery} />
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {displaySpecs.length === 0 && !isApiLoading && displaySubSpecs.length === 0 && (
                                  <div className={styles.noResults}>No matching specialities found</div>
                                )}

                                {/* Sub-Specialities section — only shown when API data is active */}
                                {displaySubSpecs.length > 0 && (
                                  <div>
                                    <div className={styles.sectionHeader}>Sub-Specialities</div>
                                    <div className={styles.specGrid}>
                                      {displaySubSpecs.map((sub) => (
                                        <div
                                          key={sub.name}
                                          onClick={() => handleSelectSuggestion(sub.name)}
                                          className={styles.specCard}
                                        >
                                          <img
                                            src={sub.image || "/Specialities icons/General Medicine.svg"}
                                            alt={sub.name}
                                            className={styles.specImage}
                                          />
                                          <div className={styles.specInfo} style={{ display: "flex", flexDirection: "column", gap: "2px", overflow: "hidden" }}>
                                            <div className={styles.specName}>
                                              <HighlightMatch text={sub.name} query={searchQuery} />
                                            </div>
                                            {sub.parentSpeciality && (
                                              <div style={{ fontSize: "10.5px", color: "#64748B", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                {sub.parentSpeciality.split(",")[0]}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {isApiLoading && displaySpecs.length === 0 && displaySubSpecs.length === 0 && (
                                  <div className={styles.noResults} style={{ color: "var(--color-text-muted)", fontStyle: "italic" }}>Searching…</div>
                                )}

                                {tabCounts.specialties > 6 && (
                                  <button
                                    style={{ display: "block", padding: "10px 24px", margin: "8px auto 0", background: "transparent", color: "var(--color-primary)", border: "1px solid var(--color-border)", borderRadius: "100px", fontWeight: 600, fontSize: "var(--font-size-sm)", cursor: "pointer", transition: "var(--transition-fast)" }}
                                    onClick={() => {
                                      setIsOpen(false);
                                      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
                                    }}
                                  >
                                    View all {tabCounts.specialties} Specialties
                                  </button>
                                )}
                              </div>
                            )}

                            {activeDropdownTab === "treatments_tests" && (
                              <div className={styles.dropdownSection} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                <div style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)", fontWeight: 500, marginBottom: "-8px" }}>
                                  Showing top matching procedures and treatments.
                                </div>
                                {useApiData ? (
                                  <>
                                    {displayTreatmentItems.length > 0 && (
                                      <div>
                                        <div className={styles.sectionHeader}>Treatments</div>
                                        <div className={styles.treatmentGrid}>
                                          {displayTreatmentItems.map((t) => (
                                            <div
                                              key={t.name}
                                              onClick={() => handleSelectSuggestion(t.name)}
                                              className={styles.treatmentCard}
                                            >
                                              {t.image && (
                                                <img
                                                  src={t.image}
                                                  alt={t.name}
                                                  className={styles.treatmentImage}
                                                />
                                              )}
                                              <div className={styles.treatmentInfo}>
                                                <div className={styles.treatmentHeader}>
                                                  <div className={styles.treatmentName}>
                                                    <HighlightMatch text={t.name} query={searchQuery} />
                                                  </div>
                                                  {t.speciality && (
                                                    <div style={{ fontSize: "10.5px", color: "var(--color-primary, #034EA2)", fontWeight: 500 }}>
                                                      {t.speciality}
                                                    </div>
                                                  )}
                                                </div>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                    {displayProcedureItems.length > 0 && (
                                      <div>
                                        <div className={styles.sectionHeader}>Procedures</div>
                                        <div className={styles.treatmentGrid}>
                                          {displayProcedureItems.map((t) => (
                                            <div
                                              key={t.name}
                                              onClick={() => handleSelectSuggestion(t.name)}
                                              className={styles.treatmentCard}
                                            >
                                              {t.image && (
                                                <img
                                                  src={t.image}
                                                  alt={t.name}
                                                  className={styles.treatmentImage}
                                                />
                                              )}
                                              <div className={styles.treatmentInfo}>
                                                <div className={styles.treatmentHeader}>
                                                  <div className={styles.treatmentName}>
                                                    <HighlightMatch text={t.name} query={searchQuery} />
                                                  </div>
                                                  {t.speciality && (
                                                    <div style={{ fontSize: "10.5px", color: "var(--color-primary, #034EA2)", fontWeight: 500 }}>
                                                      {t.speciality}
                                                    </div>
                                                  )}
                                                </div>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                    {displayTreatmentItems.length > 0 && (
                                      <div>
                                        <div className={styles.sectionHeader}>Treatments</div>
                                        <div className={styles.treatmentGrid}>
                                          {displayTreatmentItems.map((t) => (
                                            <div
                                              key={t.name}
                                              onClick={() => handleSelectSuggestion(t.name)}
                                              className={styles.treatmentCard}
                                            >
                                              {t.image && (
                                                <img
                                                  src={t.image}
                                                  alt={t.name}
                                                  className={styles.treatmentImage}
                                                />
                                              )}
                                              <div className={styles.treatmentInfo}>
                                                <div className={styles.treatmentHeader}>
                                                  <div className={styles.treatmentName}>
                                                    <HighlightMatch text={t.name} query={searchQuery} />
                                                  </div>
                                                  {t.speciality && (
                                                    <div style={{ fontSize: "10.5px", color: "var(--color-primary, #034EA2)", fontWeight: 500 }}>
                                                      {t.speciality}
                                                    </div>
                                                  )}
                                                </div>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                    {displayProcedureItems.length === 0 && displayTreatmentItems.length === 0 && !isApiLoading && (
                                      <div className={styles.noResults}>No matching treatments or tests found</div>
                                    )}
                                    {isApiLoading && displayProcedureItems.length === 0 && displayTreatmentItems.length === 0 && (
                                      <div className={styles.noResults} style={{ color: "var(--color-text-muted)", fontStyle: "italic" }}>Searching…</div>
                                    )}
                                  </>
                                ) : (
                                  <>
                                    {/* Health Checkup Packages Section */}
                                    {filteredHealthCheckups.length > 0 && (
                                      <div>
                                        <div className={styles.sectionHeader}>Health Checkup Packages</div>
                                        <div className={styles.treatmentGrid}>
                                          {filteredHealthCheckups.slice(0, 6).map((t) => (
                                            <div
                                              key={t.name}
                                              onClick={() => handleSelectSuggestion(t.name)}
                                              className={styles.treatmentCard}
                                            >
                                              {t.image && (
                                                <img
                                                  src={t.image}
                                                  alt={t.name}
                                                  className={styles.treatmentImage}
                                                />
                                              )}
                                              <div className={styles.treatmentInfo}>
                                                <div className={styles.treatmentHeader}>
                                                  <div className={styles.treatmentName}>
                                                    <HighlightMatch text={t.name} query={searchQuery} />
                                                  </div>
                                                  <div style={{ fontSize: "10.5px", color: "var(--color-primary, #034EA2)", fontWeight: 500 }}>
                                                    {(t as any).testCount}
                                                  </div>
                                                </div>
                                                <div className={styles.treatmentDesc}>{t.description}</div>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* Lab Tests Section */}
                                    {filteredLabTests.length > 0 && (
                                      <div>
                                        <div className={styles.sectionHeader}>Lab Tests</div>
                                        <div className={styles.treatmentGrid}>
                                          {filteredLabTests.slice(0, 6).map((t) => (
                                            <div
                                              key={t.name}
                                              onClick={() => handleSelectSuggestion(t.name)}
                                              className={styles.treatmentCard}
                                            >
                                              {t.name.includes("CBC") ? (
                                                <div className={styles.labIconWrap} style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", color: "#EF4444" }}>
                                                  <Droplets size={20} />
                                                </div>
                                              ) : t.name.includes("Thyroid") ? (
                                                <div className={styles.labIconWrap} style={{ backgroundColor: "rgba(168, 85, 247, 0.1)", color: "#A855F7" }}>
                                                  <FlaskConical size={20} />
                                                </div>
                                              ) : (
                                                <div className={styles.labIconWrap} style={{ backgroundColor: "rgba(16, 185, 129, 0.1)", color: "#10B981" }}>
                                                  <Activity size={20} />
                                                </div>
                                              )}
                                              <div className={styles.treatmentInfo}>
                                                <div className={styles.treatmentHeader}>
                                                  <div className={styles.treatmentName}>
                                                    <HighlightMatch text={t.name} query={searchQuery} />
                                                  </div>
                                                  <div style={{ fontSize: "10.5px", color: "var(--color-primary, #034EA2)", fontWeight: 500 }}>
                                                    {(t as any).testCount}
                                                  </div>
                                                </div>
                                                <div className={styles.treatmentDesc}>{t.description}</div>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* Treatments Section */}
                                    {filteredOnlyTreatments.length > 0 && (
                                      <div>
                                        <div className={styles.sectionHeader}>Treatments</div>
                                        <div className={styles.treatmentGrid}>
                                          {filteredOnlyTreatments.slice(0, 6).map((t) => (
                                            <div
                                              key={t.name}
                                              onClick={() => handleSelectSuggestion(t.name)}
                                              className={styles.treatmentCard}
                                            >
                                              {t.image && (
                                                <img
                                                  src={t.image}
                                                  alt={t.name}
                                                  className={styles.treatmentImage}
                                                />
                                              )}
                                              <div className={styles.treatmentInfo}>
                                                <div className={styles.treatmentHeader}>
                                                  <div className={styles.treatmentName}>
                                                    <HighlightMatch text={t.name} query={searchQuery} />
                                                  </div>
                                                  <div style={{ fontSize: "10.5px", color: "var(--color-primary, #034EA2)", fontWeight: 500 }}>
                                                    Related to: <HighlightMatch text={(t as any).speciality ?? ""} query={searchQuery} />
                                                  </div>
                                                </div>
                                                <div className={styles.treatmentDesc}>{t.description}</div>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {filteredTreatments.length === 0 && (
                                      <div className={styles.noResults}>No matching treatments or tests found</div>
                                    )}
                                  </>
                                )}

                                {tabCounts.treatments > 8 && (
                                  <button
                                    style={{ display: "block", padding: "10px 24px", margin: "8px auto 0", background: "transparent", color: "var(--color-primary)", border: "1px solid var(--color-border)", borderRadius: "100px", fontWeight: 600, fontSize: "var(--font-size-sm)", cursor: "pointer", transition: "var(--transition-fast)" }}
                                    onClick={() => {
                                      setIsOpen(false);
                                      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
                                    }}
                                  >
                                    View all {tabCounts.treatments} Procedures &amp; Treatments
                                  </button>
                                )}
                              </div>
                            )}

                            {activeDropdownTab === "articles" && (
                              <div className={styles.dropdownSection} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                <div style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)", fontWeight: 500, marginBottom: "-8px" }}>
                                  Showing top matching articles and blogs.
                                </div>
                                <div className={styles.articleList}>
                                  {displayArticles.length > 0 ? (
                                    displayArticles.slice(0, 6).map((a) => (
                                      <div
                                        key={a.name}
                                        onClick={() => handleSelectSuggestion(a.name)}
                                        className={styles.treatmentCard}
                                      >
                                        {a.image ? (
                                          <img
                                            src={a.image}
                                            alt={a.name}
                                            className={styles.articleImage}
                                          />
                                        ) : (
                                          <div className={styles.itemIconWrap}>
                                            <FileText size={14} />
                                          </div>
                                        )}
                                        <div className={styles.treatmentInfo}>
                                          <div className={styles.treatmentHeader}>
                                            <div className={styles.treatmentName}>
                                              <HighlightMatch text={a.name} query={searchQuery} />
                                            </div>
                                            {a.matchingKeyword && (
                                              <div style={{ fontSize: "10.5px", color: "var(--color-primary, #034EA2)", fontWeight: 500 }}>
                                                Relates to: <HighlightMatch text={a.matchingKeyword} query={searchQuery} />
                                              </div>
                                            )}
                                          </div>
                                          {a.description && (
                                            <div className={styles.treatmentDesc}>
                                              {a.description}
                                            </div>
                                          )}
                                        </div>
                                        {lastSearch && lastSearch.toLowerCase() === a.name.toLowerCase() && (
                                          <span className={styles.itemTag}>Last Searched</span>
                                        )}
                                      </div>
                                    ))
                                  ) : isApiLoading ? (
                                    <div className={styles.noResults} style={{ color: "var(--color-text-muted)", fontStyle: "italic" }}>Searching…</div>
                                  ) : (
                                    <div className={styles.noResults}>No matching articles found</div>
                                  )}
                                </div>

                                {tabCounts.articles > 6 && (
                                  <button
                                    style={{ display: "block", padding: "10px 24px", margin: "8px auto 0", background: "transparent", color: "var(--color-primary)", border: "1px solid var(--color-border)", borderRadius: "100px", fontWeight: 600, fontSize: "var(--font-size-sm)", cursor: "pointer", transition: "var(--transition-fast)" }}
                                    onClick={() => {
                                      setIsOpen(false);
                                      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
                                    }}
                                  >
                                    View all {tabCounts.articles} Articles &amp; Blogs
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </>
                  )}
                </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </motion.form>
      {isPulseActive && typeof document !== "undefined" && createPortal(
        <div style={{ position: "fixed", inset: 0, zIndex: 99999, pointerEvents: "auto" }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(11, 15, 25, 0.5)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }} />
          <PixelRipple trigger={showPixelRipple} />
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column" }}>
            <PulseAIWorkspace 
              initialQuery={pulseInitialAction ? "" : searchQuery}
              initialAction={pulseInitialAction}
              initialActionData={pulseInitialActionData}
              onClose={() => {
                setIsPulseActive(false);
                setPulseInitialAction(null);
                setPulseInitialActionData(null);
              }}
            />
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
