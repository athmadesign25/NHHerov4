"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search, X, ArrowRight, Plus, Mic, Send, Briefcase, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./NHSearchExperience.module.css";
import { 
  SearchResultsData, 
  DoctorCardData,
  getSearchResults, 
  countWords, 
  enforceWordLimit, 
  MAX_SEARCH_WORDS 
} from "./searchData";
import LocationSelector from "./LocationSelector";
import PrimaryResults from "./PrimaryResults";
import TertiaryResults from "./TertiaryResults";
import PulseAnalyzingCentral from "./PulseAnalyzingCentral";
import PulseAIAvatar from "./PulseAIAvatar";
import { analyzePulseIntent } from "./pulseClinicalEngine";

interface SearchResultsCanvasProps {
  query: string;
  results: SearchResultsData;
  onEditSearch: () => void;
  onSubmit?: (newQuery: string) => void;
  onClose: () => void;
  selectedLocation: string;
  onSelectLocation: (loc: string) => void;
  onSelectSpecialtyTag?: (tag: string) => void;
  onAskPulse?: () => void;
}

interface CompletedTurn {
  id: string;
  userPrompt: string;
  introText: string;
  narrative: string;
  doctor?: DoctorCardData;
  followupChips: string[];
  timestamp: string;
}

interface ActiveTurnState {
  id: string;
  userPrompt: string;
  introText: string;
  fullNarrative: string;
  displayedNarrative: string;
  typedIndex: number;
  doctor?: DoctorCardData;
  followupChips: string[];
  phase: "thinking" | "drafting" | "skeleton" | "complete";
}

export default function SearchResultsCanvas({
  query,
  results,
  onEditSearch,
  onSubmit,
  onClose,
  selectedLocation,
  onSelectLocation,
  onSelectSpecialtyTag,
  onAskPulse,
}: SearchResultsCanvasProps) {
  const [inputValue, setInputValue] = useState(query || "c");
  const [activeQuery, setActiveQuery] = useState(query || "c");
  const [currentResults, setCurrentResults] = useState<SearchResultsData>(results);
  const [isRequerying, setIsRequerying] = useState(false);
  const [mobileTab, setMobileTab] = useState<"doctors" | "care">("doctors");

  // Pulse AI mode state
  const [isPulseActive, setIsPulseActive] = useState(false);
  const [pulseInput, setPulseInput] = useState("");
  const [completedTurns, setCompletedTurns] = useState<CompletedTurn[]>([]);
  const [activeTurn, setActiveTurn] = useState<ActiveTurnState | null>(null);
  const [isListening, setIsListening] = useState(false);

  const topInputRef = useRef<HTMLInputElement>(null);
  const pulseInputRef = useRef<HTMLInputElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const unifiedScrollRef = useRef<HTMLDivElement>(null);
  const chatStartRef = useRef<HTMLDivElement>(null);
  const chatAnchorRef = useRef<HTMLDivElement>(null);

  // Synchronize incoming props
  useEffect(() => {
    setCurrentResults(results);
  }, [results]);

  useEffect(() => {
    setActiveQuery(query || "c");
    setInputValue(query || "c");
  }, [query]);

  // Scroll position tracking: Re-appear top search bar ONLY when user scrolls all the way back up to semantic results
  const [isScrolledToTop, setIsScrolledToTop] = useState(true);

  useEffect(() => {
    const container = unifiedScrollRef.current;
    if (!container) return;

    const handleScroll = () => {
      // Re-appear when user scrolls all the way up to semantic results (<= 35px from top)
      const atTop = container.scrollTop <= 35;
      setIsScrolledToTop(atTop);
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  // Top search bar is visible if:
  // 1. In non-active mode (standard semantic search)
  // 2. In active Pulse mode, ONLY when scrolled up to the end of semantic results
  const showTopSearchBar = !isPulseActive || isScrolledToTop;

  // Measure primary result column width so the docked Pulse bar matches it exactly in non-active mode
  const [leftColWidth, setLeftColWidth] = useState<number | null>(null);

  useEffect(() => {
    const el = leftColRef.current;
    if (!el) return;

    const measure = () => {
      if (leftColRef.current) {
        const gridEl = leftColRef.current.querySelector<HTMLElement>(`.${styles.refDoctorsGrid}`);
        const targetEl = gridEl || leftColRef.current;
        if (targetEl.offsetWidth > 0) {
          setLeftColWidth(targetEl.offsetWidth);
        }
      }
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [currentResults]);

  // Handle top search query bar submit (re-queries semantic search)
  const handleTopSearchSubmit = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const clean = (typeof customQuery === "string" ? customQuery : inputValue).trim();
    if (!clean) return;

    setIsRequerying(true);
    setActiveQuery(clean);
    setInputValue(clean);

    try {
      const [newResults] = await Promise.all([
        getSearchResults(clean, selectedLocation),
        new Promise((resolve) => setTimeout(resolve, 550)),
      ]);

      if (newResults) {
        setCurrentResults(newResults);
        // Reset to initial semantic mode where left column scrolls independently
        setIsPulseActive(false);
        setActiveTurn(null);
        setCompletedTurns([]);
        if (unifiedScrollRef.current) {
          unifiedScrollRef.current.scrollTop = 0;
        }
      }
    } catch (err) {
      console.warn("Live search query error:", err);
    } finally {
      setIsRequerying(false);
    }
  };

  // ── Stage Orchestrator for Active Turn ──
  // 1. Thinking phase (750ms) -> Drafting phase
  useEffect(() => {
    if (!activeTurn || activeTurn.phase !== "thinking") return;
    const timer = setTimeout(() => {
      setActiveTurn((prev) => (prev ? { ...prev, phase: "drafting" } : null));
    }, 750);
    return () => clearTimeout(timer);
  }, [activeTurn?.phase]);

  // 2. Drafting typewriter character-by-character effect (14ms per char)
  useEffect(() => {
    if (!activeTurn || activeTurn.phase !== "drafting") return;

    if (activeTurn.typedIndex < activeTurn.fullNarrative.length) {
      const timer = setTimeout(() => {
        setActiveTurn((prev) => {
          if (!prev || prev.phase !== "drafting") return prev;
          const nextIndex = prev.typedIndex + 1;
          return {
            ...prev,
            typedIndex: nextIndex,
            displayedNarrative: prev.fullNarrative.slice(0, nextIndex),
          };
        });
      }, 14);
      return () => clearTimeout(timer);
    } else {
      // Typewriter finished -> transition to skeleton shimmer
      const timer = setTimeout(() => {
        setActiveTurn((prev) => (prev ? { ...prev, phase: "skeleton" } : null));
      }, 180);
      return () => clearTimeout(timer);
    }
  }, [activeTurn?.phase, activeTurn?.typedIndex, activeTurn?.fullNarrative]);

  // 3. Skeleton Shimmer phase (650ms) -> Complete (Doctor Card & Chips revealed!)
  useEffect(() => {
    if (!activeTurn || activeTurn.phase !== "skeleton") return;
    const timer = setTimeout(() => {
      setActiveTurn((prev) => (prev ? { ...prev, phase: "complete" } : null));
      // Smoothly ensure solution is in view
      setTimeout(() => {
        chatAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      }, 80);
    }, 650);
    return () => clearTimeout(timer);
  }, [activeTurn?.phase]);

  // Smooth scroll handler to glide semantic results UP so chat begins right at the top
  const performScrollToChat = useCallback(() => {
    if (!unifiedScrollRef.current) return;
    const container = unifiedScrollRef.current;

    // Reset internal scroll of doctor cards column if it had been scrolled in non-active mode
    if (leftColRef.current) {
      leftColRef.current.scrollTop = 0;
    }

    let targetY = 460;
    if (chatStartRef.current) {
      const offset = chatStartRef.current.offsetTop;
      if (offset > 120) {
        // Leave the bottom ~75px of Row 2 doctor cards peeking at the top (matching reference Image)
        targetY = Math.max(0, offset - 75);
      }
    }

    container.scrollTo({
      top: targetY,
      behavior: "smooth",
    });
  }, []);

  // Staged automatic scroll on transition into Pulse AI or new prompt
  useEffect(() => {
    if (!isPulseActive || !activeTurn) return;

    if (completedTurns.length === 0) {
      // First turn: smoothly glide semantic cards up so chat begins right at the top
      const t1 = setTimeout(performScrollToChat, 30);
      const t2 = setTimeout(performScrollToChat, 100);
      const t3 = setTimeout(performScrollToChat, 220);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    } else {
      // Subsequent turns in conversation: scroll down to reveal new turn
      const t = setTimeout(() => {
        chatAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      }, 80);
      return () => clearTimeout(t);
    }
  }, [isPulseActive, activeTurn?.id, completedTurns.length, performScrollToChat]);

  // Intelligent clinical responder that analyzes the user's inquiry and selects matching verified specialists
  const resolvePulseAIResponse = (
    queryText: string,
    location: string,
    availableDoctors: DoctorCardData[]
  ): {
    introText: string;
    narrative: string;
    doctor: DoctorCardData;
    followupChips: string[];
  } => {
    const lower = queryText.toLowerCase().trim();

    // 0. Specific Doctor Name Matching (Checks availableDoctors and prominent consultants)
    const matchedDoctor = availableDoctors.find((d) => {
      const cleanDocName = d.name.toLowerCase().replace(/^dr\.\s*/i, "");
      const parts = cleanDocName.split(" ").filter((p) => p.length >= 4);
      return parts.some((p) => lower.includes(p));
    });

    if (matchedDoctor) {
      return {
        introText: `Clinical Profile: ${matchedDoctor.name} (${matchedDoctor.speciality})`,
        narrative: `${matchedDoctor.name} is a senior consultant in ${matchedDoctor.speciality} at ${matchedDoctor.hospital}, bringing ${matchedDoctor.experience} of dedicated healthcare expertise. Known for clinical excellence and strong patient outcomes, consultations are available for in-person OPD clinics and telehealth video reviews.`,
        doctor: matchedDoctor,
        followupChips: [
          `Book OPD slot with ${matchedDoctor.name.split(" ")[1] || "Doctor"}`,
          "Check consultation fees & timings",
          "Doctor's clinical credentials",
        ],
      };
    }

    // 1. Greetings & Introduction ("hi", "hello", "hey", "help", "who are you")
    if (
      lower === "hi" ||
      lower === "hello" ||
      lower === "hey" ||
      lower.startsWith("hi ") ||
      lower.startsWith("hello ") ||
      lower.startsWith("hey ") ||
      lower.includes("who are you") ||
      lower.includes("what can you do") ||
      lower === "help"
    ) {
      const doc = availableDoctors[0] || {
        id: "doc-devi-shetty",
        name: "Dr. Devi Prasad Shetty",
        speciality: "Cardiac Sciences & Chairman",
        hospital: "Narayana Institute of Cardiac Sciences, Bangalore",
        experience: "35+ yrs of experience",
        image: "/doctors/doc_devi_shetty.jpg",
        city: location,
        availableToday: true,
        consultationType: "both",
      };
      return {
        introText: "Pulse AI Clinical Assistant · Narayana Health",
        narrative: "Hello! I am Pulse AI, Narayana Health's clinical intelligence assistant. How can I help you today? You can describe any symptoms you are experiencing, ask about treatment procedures or package costs, or request an appointment with our specialists.",
        doctor: doc,
        followupChips: [
          "Check symptoms with Pulse",
          "Find nearest hospital branch",
          "Book online video consult",
          "24/7 Emergency Helpline",
        ],
      };
    }

    // 2. Inquiries asking for explanation or more details
    if (
      lower.includes("explain") ||
      lower.includes("more detail") ||
      lower.includes("tell me more") ||
      lower.includes("elaborate") ||
      lower.includes("why")
    ) {
      return {
        introText: `Clinical assessment for "${queryText}"`,
        narrative: `Narayana Health's comprehensive clinical protocol starts with advanced diagnostic evaluation (12-lead ECG, 3T MRI, or specialized metabolic panels) to identify root causes. Following initial diagnosis, our multi-disciplinary medical board customizes an evidence-based medical or minimally invasive surgical treatment plan designed for rapid recovery.`,
        doctor: {
          id: "doc-devi-shetty",
          name: "Dr. Devi Prasad Shetty",
          speciality: "Senior Consultant Cardiac Surgeon & Chairman",
          hospital: "Narayana Institute of Cardiac Sciences, Bangalore",
          experience: "35+ yrs of experience",
          image: "/doctors/doc_devi_shetty.jpg",
          city: location,
          availableToday: true,
          consultationType: "both",
        },
        followupChips: [
          "What diagnostic tests are needed?",
          "Book consultation slot",
          "Explore treatment options",
        ],
      };
    }

    // 3. Cardiac inquiries (chest pain, heart, palpitation, bp, bypass, ecg)
    if (
      lower.includes("chest") ||
      lower.includes("heart") ||
      lower.includes("cardio") ||
      lower.includes("bp") ||
      lower.includes("palpitation") ||
      lower.includes("breath") ||
      lower.includes("valve")
    ) {
      return {
        introText: `Cardiac clinical triage for "${queryText}"`,
        narrative: `Exertional chest discomfort, palpitations, or sudden breathing changes require prompt cardiac screening to rule out myocardial ischemia or arrhythmias. At Narayana Health, we provide immediate ECG, 2D-Echocardiogram, and 24/7 cardiac emergency care led by world-renowned specialists.`,
        doctor: {
          id: "doc-devi-shetty",
          name: "Dr. Devi Prasad Shetty",
          speciality: "Cardiac Sciences & Cardiothoracic Surgery",
          hospital: "Narayana Institute of Cardiac Sciences, Bangalore",
          experience: "35+ yrs of experience",
          image: "/doctors/doc_devi_shetty.jpg",
          city: location,
          availableToday: true,
          consultationType: "both",
        },
        followupChips: [
          "Book ECG & 2D Echo",
          "Emergency Cardiac Helpline",
          "Video consult cardiologist",
        ],
      };
    }

    // 4. Orthopaedic & Joint inquiries (knee pain, joint, bone, back pain, spine, arthritis, umesha)
    if (
      lower.includes("knee") ||
      lower.includes("joint") ||
      lower.includes("bone") ||
      lower.includes("back") ||
      lower.includes("ortho") ||
      lower.includes("spine") ||
      lower.includes("fracture") ||
      lower.includes("arthritis") ||
      lower.includes("umesha")
    ) {
      return {
        introText: `Orthopaedic & musculoskeletal assessment for "${queryText}"`,
        narrative: `Persistent joint stiffness, cartilage wear, or radiating spinal discomfort should be evaluated with weight-bearing digital imaging or 3T MRI. Our orthopaedic team specializes in joint preservation, minimally invasive arthroscopy, and robotic-assisted replacements.`,
        doctor: {
          id: "doc-umesha",
          name: "Dr. Umesha C",
          speciality: "Orthopaedic & Joint Replacement Surgery",
          hospital: "Narayana Multispeciality Hospital, Mysore",
          experience: "16 yrs of experience",
          image: "/assets/doctor_3.png",
          city: location,
          availableToday: true,
          consultationType: "both",
        },
        followupChips: [
          "Book digital Joint X-Ray",
          "Robotic knee replacement info",
          "Physiotherapy rehabilitation",
        ],
      };
    }

    // 5. Oncology & Cancer inquiries (cancer, tumor, chemo, biopsy, radiation, oncology, deepak, kittur)
    if (
      lower.includes("cancer") ||
      lower.includes("tumor") ||
      lower.includes("chemo") ||
      lower.includes("biopsy") ||
      lower.includes("oncol") ||
      lower.includes("radiation") ||
      lower.includes("deepak") ||
      lower.includes("kittur")
    ) {
      return {
        introText: `Comprehensive oncology consultation guidance for "${queryText}"`,
        narrative: `At Mazumdar Shaw Cancer Centre, oncology cases are reviewed by our multi-disciplinary Tumour Board — bringing together surgical oncologists, medical oncologists, and radiation specialists to formulate a targeted, precision treatment regimen.`,
        doctor: {
          id: "doc-deepak-kittur",
          name: "Dr. Deepak Kittur C",
          speciality: "Surgical Oncology",
          hospital: "Sahyadri Narayana Multispeciality Hospital",
          experience: "23 yrs of experience",
          image: "/assets/hero_doctor.png",
          city: location,
          availableToday: true,
          consultationType: "both",
        },
        followupChips: [
          "Schedule Tumour Board Review",
          "Second opinion consultation",
          "PET-CT scan booking",
        ],
      };
    }

    // 6. Specific Doctor Inquiries: Dr. Pradeep Kumar
    if (lower.includes("pradeep")) {
      return {
        introText: `Senior Consultant profile for Dr. Pradeep Kumar`,
        narrative: `Dr. Pradeep Kumar is a senior interventional cardiologist at Narayana Health with extensive expertise in complex coronary interventions, radial angiography, and preventive cardiovascular care with an outstanding patient clinical track record.`,
        doctor: {
          id: "doc-pradeep",
          name: "Dr. Pradeep Kumar",
          speciality: "Interventional Cardiology",
          hospital: "Narayana Health City, Bangalore",
          experience: "21 yrs of experience",
          image: "/doctors/doc_bagirath.jpg",
          city: location,
          availableToday: true,
          consultationType: "both",
        },
        followupChips: [
          "Book in-person slot today",
          "Schedule online video consult",
          "Doctor's clinical credentials",
        ],
      };
    }

    // 7. Women's Health & Gynaecology (pregnancy, period, gynae, rashmi, pcos, baby, deliver)
    if (
      lower.includes("pregnan") ||
      lower.includes("gyn") ||
      lower.includes("period") ||
      lower.includes("rashmi") ||
      lower.includes("pcos") ||
      lower.includes("deliver") ||
      lower.includes("maternity")
    ) {
      return {
        introText: `Women's health & obstetrics guidance for "${queryText}"`,
        narrative: `Narayana Health offers complete care for women across high-risk obstetrics, painless deliveries, laparoscopic gynaecological procedures, and fertility management backed by advanced neonatal intensive care (NICU).`,
        doctor: {
          id: "doc-rashmi-hanchinal",
          name: "Dr. Rashmi C Hanchinal",
          speciality: "Obstetrics & Gynaecology",
          hospital: "Sahyadri Narayana Multispeciality Hospital",
          experience: "12 yrs of experience",
          image: "/doctors/doc_ananya.jpg",
          city: location,
          availableToday: true,
          consultationType: "both",
        },
        followupChips: [
          "Book Pelvic Ultrasound",
          "High-risk pregnancy clinic",
          "Maternity package details",
        ],
      };
    }

    // 8. Diabetes & Endocrinology (sugar, diabetes, thyroid, endocrine, chythanya)
    if (
      lower.includes("diabet") ||
      lower.includes("sugar") ||
      lower.includes("thyroid") ||
      lower.includes("endo") ||
      lower.includes("metabol") ||
      lower.includes("chythanya")
    ) {
      return {
        introText: `Endocrinology & metabolic management for "${queryText}"`,
        narrative: `Effective management of diabetes and thyroid imbalances requires structured glycemic tracking, lipid risk screening, and customized endocrinology care to prevent vascular, renal, or ocular complications.`,
        doctor: {
          id: "doc-chythanya",
          name: "Dr. Chythanya D C",
          speciality: "Endocrinology, Diabetes & Metabolic Medicine",
          hospital: "Narayana Multispeciality Hospital, Mysore",
          experience: "20 yrs of experience",
          image: "/assets/doctor_3.png",
          city: location,
          availableToday: true,
          consultationType: "both",
        },
        followupChips: [
          "Book HbA1c & Lipid profile",
          "Personalized diet consultation",
          "Check available doctor slots",
        ],
      };
    }

    // 9. Neurology / Brain / Headache / Migraine / Stroke
    if (
      lower.includes("headache") ||
      lower.includes("migraine") ||
      lower.includes("brain") ||
      lower.includes("neuro") ||
      lower.includes("seizure") ||
      lower.includes("dizzy") ||
      lower.includes("stroke") ||
      lower.includes("numb")
    ) {
      const neuroDoc = availableDoctors.find((d) => d.speciality.toLowerCase().includes("neuro")) || {
        id: "doc-neuro",
        name: "Dr. Uday Shankar C S",
        speciality: "Neurology & Neuro Sciences",
        hospital: "Mazumdar Shaw Medical Centre, Bangalore",
        experience: "19 yrs of experience",
        image: "/assets/hero_doctor.png",
        city: location,
        availableToday: true,
        consultationType: "both" as const,
      };
      return {
        introText: `Neurological assessment for "${queryText}"`,
        narrative: `Persistent or acute neurological symptoms such as intense headaches, localized numbness, or balance disturbances warrant comprehensive neurological screening, including high-resolution 3T MRI Brain scanning and specialist clinical evaluation.`,
        doctor: neuroDoc,
        followupChips: [
          "Book 3T Brain MRI scan",
          "Comprehensive headache clinic",
          "Stroke protocol helpline",
        ],
      };
    }

    // 10. Pediatrics & Child Health
    if (
      lower.includes("child") ||
      lower.includes("baby") ||
      lower.includes("pediatric") ||
      lower.includes("infant") ||
      lower.includes("kid")
    ) {
      const pediaDoc = availableDoctors.find((d) => d.speciality.toLowerCase().includes("paed") || d.speciality.toLowerCase().includes("ped")) || {
        id: "doc-pedia",
        name: "Dr. Cyrus Contractor",
        speciality: "Paediatric Medicine & Child Health",
        hospital: "NH Children's Hospital, Bangalore",
        experience: "17 yrs of experience",
        image: "/assets/doctor_1.png",
        city: location,
        availableToday: true,
        consultationType: "both" as const,
      };
      return {
        introText: `Pediatric & child health guidance for "${queryText}"`,
        narrative: `Our Department of Pediatrics provides dedicated neonatal and child care, covering acute childhood infections, growth and development milestones, pediatric surgical interventions, and immunizations under specialized pediatric supervision.`,
        doctor: pediaDoc,
        followupChips: [
          "Child vaccination schedule",
          "Pediatric OPD consultation",
          "Neonatal & pediatric ICU care",
        ],
      };
    }

    // 11. Pulmonology / Respiratory / Lungs / Cough / Asthma
    if (
      lower.includes("cough") ||
      lower.includes("asthma") ||
      lower.includes("lung") ||
      lower.includes("pulmon") ||
      lower.includes("wheez") ||
      lower.includes("bronch")
    ) {
      const pulmDoc = availableDoctors.find((d) => d.speciality.toLowerCase().includes("pulmon")) || {
        id: "doc-pulm",
        name: "Dr. Vivek Menon",
        speciality: "Pulmonology & Respiratory Medicine",
        hospital: "Mazumdar Shaw Medical Centre, Bangalore",
        experience: "18 yrs of experience",
        image: "/doctors/doc_vivek.jpg",
        city: location,
        availableToday: true,
        consultationType: "both" as const,
      };
      return {
        introText: `Respiratory & pulmonary triage for "${queryText}"`,
        narrative: `Persistent coughing, wheezing, or shortness of breath indicates bronchial hyper-responsiveness or lower respiratory conditions. Narayana Health's pulmonary suite provides pulmonary function tests (PFT), chest HRCT, and expert broncho-alveolar care.`,
        doctor: pulmDoc,
        followupChips: [
          "Book Pulmonary Function Test (PFT)",
          "Chest HRCT scan booking",
          "Asthma & allergy review",
        ],
      };
    }

    // 12. Gastroenterology / Liver / Digestion / Acidity
    if (
      lower.includes("stomach") ||
      lower.includes("gastric") ||
      lower.includes("acid") ||
      lower.includes("liver") ||
      lower.includes("abdomen") ||
      lower.includes("digest") ||
      lower.includes("gastro")
    ) {
      const gastroDoc = availableDoctors.find((d) => d.speciality.toLowerCase().includes("gastro")) || {
        id: "doc-gastro",
        name: "Dr. Bagirath Raghuraman",
        speciality: "Medical Gastroenterology & Hepatology",
        hospital: "Narayana Multispeciality Hospital, Bangalore",
        experience: "22 yrs of experience",
        image: "/doctors/doc_bagirath.jpg",
        city: location,
        availableToday: true,
        consultationType: "both" as const,
      };
      return {
        introText: `Gastroenterology clinical assessment for "${queryText}"`,
        narrative: `Recurrent acid reflux, abdominal cramping, or digestive discomfort requires targeted gastrointestinal investigation. We offer high-definition endoscopy, abdominal ultrasound, and specialized liver function panels for precise clinical management.`,
        doctor: gastroDoc,
        followupChips: [
          "Book Upper GI Endoscopy",
          "Abdominal Ultrasound scan",
          "Liver health checkup",
        ],
      };
    }

    // 13. Cost / Insurance / Hospital inquiries
    if (
      lower.includes("cost") ||
      lower.includes("price") ||
      lower.includes("package") ||
      lower.includes("insurance") ||
      lower.includes("cashless")
    ) {
      return {
        introText: `Transparent pricing & insurance desk for "${queryText}"`,
        narrative: `Narayana Health supports cashless hospitalisation across 35+ national insurance providers and TPAs. Our on-site financial counselling desk assists with pre-authorization, package estimation, and government health schemes.`,
        doctor: {
          id: "doc-vivek",
          name: "Dr. Vivek Menon",
          speciality: "Interventional Cardiologist & Clinical Director",
          hospital: "Mazumdar Shaw Medical Center, Bangalore",
          experience: "18 yrs of experience",
          image: "/doctors/doc_vivek.jpg",
          city: location,
          availableToday: true,
          consultationType: "both",
        },
        followupChips: [
          "Cashless insurance TPA list",
          "Health checkup packages",
          "Speak with patient coordinator",
        ],
      };
    }

    // 14. Booking / Appointments / Video Consult
    if (
      lower.includes("book") ||
      lower.includes("appointment") ||
      lower.includes("video") ||
      lower.includes("tele") ||
      lower.includes("slot")
    ) {
      return {
        introText: `Appointment scheduling for "${queryText}"`,
        narrative: `You can instantly confirm an OPD appointment or secure video consultation with verified senior consultants at Narayana Health. Same-day emergency walk-ins are also accommodated across all hospital branches.`,
        doctor: availableDoctors[0] || {
          id: "doc-devi-shetty",
          name: "Dr. Devi Prasad Shetty",
          speciality: "Cardiac Sciences & Chairman",
          hospital: "Narayana Institute of Cardiac Sciences, Bangalore",
          experience: "35+ yrs of experience",
          image: "/doctors/doc_devi_shetty.jpg",
          city: location,
          availableToday: true,
          consultationType: "both",
        },
        followupChips: [
          "Today's available slots",
          "Book video consultation",
          "View hospital locations",
        ],
      };
    }

    // 15. General clinical intent triage fallback via pulseClinicalEngine
    const triage = analyzePulseIntent(queryText, [], location);
    const matchingDoc = availableDoctors.find((d) => 
      triage.specialty && d.speciality.toLowerCase().includes(triage.specialty.toLowerCase())
    ) || availableDoctors[0] || {
      id: "doc-devi-shetty",
      name: "Dr. Devi Prasad Shetty",
      speciality: "Cardiac Sciences & Chairman",
      hospital: "Narayana Health City, Bangalore",
      experience: "35+ yrs of experience",
      image: "/doctors/doc_devi_shetty.jpg",
      city: location,
      availableToday: true,
      consultationType: "both",
    };

    return {
      introText: `Clinical assessment for "${queryText}"`,
      narrative: triage.clinicalMessage || `Based on your inquiry regarding "${queryText}", our medical team recommends an evaluation with a senior specialist in ${triage.specialty || matchingDoc.speciality || "Internal Medicine"}. We provide same-day diagnostic workups, in-person OPD clinics, and telehealth video reviews.`,
      doctor: matchingDoc,
      followupChips: [
        `Book OPD consultation with ${matchingDoc.name.split(" ")[1] || "Specialist"}`,
        "Check available appointment slots",
        "Explore specialized health packages",
      ],
    };
  };

  // Handle sending a prompt in Pulse
  const handleSendPulsePrompt = (customPrompt?: string) => {
    const raw = (customPrompt ?? pulseInput).trim();
    if (!raw) return;

    // If an animation is actively in progress, don't interrupt
    if (activeTurn && activeTurn.phase !== "complete") return;

    // Archive current completed turn if present
    if (activeTurn && activeTurn.phase === "complete") {
      setCompletedTurns((prev) => [
        ...prev,
        {
          id: activeTurn.id,
          userPrompt: activeTurn.userPrompt,
          introText: activeTurn.introText,
          narrative: activeTurn.fullNarrative,
          doctor: activeTurn.doctor,
          followupChips: activeTurn.followupChips,
          timestamp: "Just now",
        },
      ]);
    }

    setPulseInput("");
    setIsListening(false);

    const turnId = `turn-${Date.now()}`;
    const userPrompt = raw;

    // Intelligent clinical conversation resolution based on user inquiry
    const pulseReply = resolvePulseAIResponse(raw, selectedLocation, currentResults.doctors);

    // Step 1: Transition into unified AI mode
    setIsPulseActive(true);
    setIsScrolledToTop(false);

    // Initialize Active Turn in thinking phase
    setActiveTurn({
      id: turnId,
      userPrompt,
      introText: pulseReply.introText,
      fullNarrative: pulseReply.narrative,
      displayedNarrative: "",
      typedIndex: 0,
      doctor: pulseReply.doctor,
      followupChips: pulseReply.followupChips,
      phase: "thinking",
    });
  };

  return (
    <div className={styles.resultsContainer} style={{ position: "relative" }}>
      {/* ── Active Pulse Ambient Background Aura (Soft gradient aura in active chat mode) ── */}
      <div 
        className={`${styles.pulseActiveAmbientBg} ${isPulseActive ? styles.pulseActiveAmbientBgVisible : ""}`} 
        aria-hidden="true" 
      />

      {/* ── 1. Top Header Row: Location Dropdown + Close Button ── */}
      <div className={styles.topHeaderRow} style={{ position: "relative", zIndex: 10 }}>
        <div className={styles.headerLeftGroup}>
          <LocationSelector
            selectedLocation={selectedLocation}
            onSelectLocation={async (loc) => {
              onSelectLocation(loc);
              const updated = await getSearchResults(activeQuery, loc);
              setCurrentResults(updated);
            }}
          />
        </div>

        <button
          type="button"
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Close results"
        >
          <X size={18} />
        </button>
      </div>

      {/* ── 2. Top Search Query Bar (With Search icon & crisp blue underline) ── */}
      {/* Reappears ONLY when scrolled all the way to the top of semantic results, hides on scroll down */}
      <AnimatePresence>
        {showTopSearchBar && (
          <motion.div
            key="topQueryBarGroup"
            style={{ position: "relative", zIndex: 10, width: "100%" }}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0, overflow: "hidden" }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            <form 
              className={styles.resultsQueryBar} 
              onSubmit={handleTopSearchSubmit}
            >
              <div 
                className={styles.resultsQueryLeft}
                onClick={() => topInputRef.current?.focus()}
              >
                <Search size={22} className={styles.resultsQuerySearchIcon} />
                <input
                  ref={topInputRef}
                  type="text"
                  className={styles.resultsQueryInput}
                  value={inputValue}
                  onChange={(e) => {
                    const val = e.target.value;
                    const words = countWords(val);
                    if (words <= MAX_SEARCH_WORDS) {
                      setInputValue(val);
                    } else {
                      setInputValue(enforceWordLimit(val, MAX_SEARCH_WORDS));
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleTopSearchSubmit();
                    }
                  }}
                  placeholder="Search doctors, specialties, symptoms..."
                  aria-label="Search prompt"
                />
              </div>

              {inputValue.trim() !== activeQuery.trim() && inputValue.trim().length > 0 && !isRequerying && (
                <button
                  type="submit"
                  className={styles.querySendBtn}
                  title="Search with updated prompt"
                  aria-label="Submit search"
                >
                  <span>Search</span>
                  <ArrowRight size={14} />
                </button>
              )}
            </form>

            {/* Crisp Horizon Underline (NH Brand Blue) */}
            <div className={styles.redDivider} style={{ margin: "8px 0 12px" }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 3. Single Permanent Unified Canvas Container ── */}
      {/* ALWAYS mounted so layout, dimensions, and scroll transitions are 100% reliable */}
      <div 
        ref={unifiedScrollRef}
        className={styles.unifiedResultsScrollArea}
        data-lenis-prevent="true"
        style={{
          position: "relative",
          zIndex: 5,
          overflowY: isPulseActive ? "auto" : "hidden",
        }}
      >
        {/* Mobile Viewport Segmented Control */}
        {!isRequerying && (
          <div className={styles.mobileSegmentedControl} role="tablist" aria-label="Search results views">
            <button
              type="button"
              role="tab"
              aria-selected={mobileTab === "doctors"}
              className={`${styles.mobileSegmentBtn} ${mobileTab === "doctors" ? styles.mobileSegmentBtnActive : ""}`}
              onClick={() => setMobileTab("doctors")}
            >
              <span>Doctors ({currentResults.doctors.length})</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mobileTab === "care"}
              className={`${styles.mobileSegmentBtn} ${mobileTab === "care" ? styles.mobileSegmentBtnActive : ""}`}
              onClick={() => setMobileTab("care")}
            >
              <span>Care & Info ({currentResults.treatments.length + currentResults.articles.length})</span>
            </button>
          </div>
        )}

        {/* Semantic Results Section */}
        {isRequerying ? (
          <PulseAnalyzingCentral
            query={inputValue.trim() || activeQuery}
            selectedLocation={selectedLocation}
          />
        ) : (
          <div className={styles.resultsSplitLayout} data-mobile-tab={mobileTab}>
            {/* ── LEFT COLUMN: Recommended Doctors ── */}
            {/* Before Pulse is active: ONLY this left column scrolls vertically, with white gradient blur at bottom */}
            {/* When Pulse is active: overflow becomes visible so content flows up into the unified feed */}
            <div className={styles.resultsLeftColWrap}>
              <div
                ref={leftColRef}
                className={styles.resultsLeftCol}
                data-lenis-prevent="true"
                tabIndex={0}
                role="region"
                aria-label="Doctors list"
                style={
                  isPulseActive
                    ? { overflowY: "visible", height: "auto", maxHeight: "none", paddingBottom: 0 }
                    : { overflowY: "auto", height: "100%", maxHeight: "100%", paddingBottom: 110 }
                }
              >
                <PrimaryResults
                  doctors={currentResults.doctors}
                  selectedLocation={selectedLocation}
                  proximityMessage={currentResults.proximityMessage}
                  proximityTier={currentResults.proximityTier}
                  query={activeQuery}
                  status={currentResults.status}
                  errorMessage={currentResults.errorMessage}
                  onRetry={() => handleTopSearchSubmit()}
                  onSelectSpecialty={(spec) => handleTopSearchSubmit(undefined, spec)}
                  onAskPulse={() => {
                    handleSendPulsePrompt(`Help me understand care options for ${activeQuery}`);
                  }}
                />
              </div>

              {/* White gradient fade with background blur below small Pulse bar in non-active mode */}
              {!isPulseActive && (
                <div className={styles.pulseBottomGradientFade} aria-hidden="true" />
              )}
            </div>

            {/* ── RIGHT COLUMN: Treatments, Articles & Specialties (Steady & Static) ── */}
            <TertiaryResults
              treatments={currentResults.treatments}
              articles={currentResults.articles}
              relatedSpecialties={currentResults.relatedSpecialties}
              onSelectSpecialtyTag={(tag) => {
                if (onSelectSpecialtyTag) {
                  onSelectSpecialtyTag(tag);
                } else {
                  handleTopSearchSubmit(undefined, tag);
                }
              }}
              query={activeQuery}
            />
          </div>
        )}

        {/* ── Marker where conversational feed begins ── */}
        <div ref={chatStartRef} style={{ height: 1 }} />

        {/* ── 4. Conversational AI Stream (When Pulse is active) ── */}
        {isPulseActive && (
          <div className={styles.aiChatStreamSection}>
            {/* Prior Completed Turns */}
            {completedTurns.map((turn) => (
              <div key={turn.id} className={styles.aiTurnBlock}>
                {/* User Prompt Message Bubble (Right Aligned) */}
                <div className={styles.aiUserBubbleRow}>
                  <div className={styles.aiUserBubble}>{turn.userPrompt}</div>
                </div>

                {/* Pulse AI Clinical Response */}
                <div className={styles.aiBotResponseRow}>
                  <p className={styles.aiBotIntroText}>{turn.introText}</p>
                  <p className={styles.aiBotNarrativeText}>{turn.narrative}</p>

                  {turn.doctor && (
                    <div className={styles.aiBotDoctorCardWrap}>
                      <div className={styles.refDoctorCard} style={{ minHeight: 230, height: 230 }}>
                        <img
                          src={turn.doctor.image}
                          alt={turn.doctor.name}
                          className={styles.refDocFullImage}
                          draggable={false}
                        />
                        <div className={styles.refDocFullGradient} />
                        <div className={styles.refDocOverlayContent}>
                          <div className={styles.refDocBottomFlex}>
                            <div className={styles.refDocTextCol}>
                              <h3 className={styles.refDocName} title={turn.doctor.name}>
                                {turn.doctor.name}
                              </h3>
                              <div className={styles.refDocSpecialty} title={turn.doctor.speciality}>
                                {turn.doctor.speciality}
                              </div>
                              <div className={styles.refDocExpRow}>
                                <Briefcase size={12} className={styles.refDocExpIcon} />
                                <span>{turn.doctor.experience}</span>
                              </div>
                              <div className={styles.refDocHospital} title={turn.doctor.hospital}>
                                {turn.doctor.hospital}
                              </div>
                            </div>

                            <Link
                              href={`/doctors/${turn.doctor.id}/book?city=${encodeURIComponent(selectedLocation)}`}
                              className={styles.refBookBtnWhite}
                            >
                              Book
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Follow-up suggestion chips */}
                  <div className={styles.aiBotFollowupsWrap}>
                    <div className={styles.aiBotFollowupsHeader}>
                      <Sparkles size={16} className={styles.aiBotSparkleIcon} />
                      <span>If you are looking for something else</span>
                    </div>

                    <div className={styles.aiBotChipsRow}>
                      {turn.followupChips.map((chipText) => (
                        <button
                          key={chipText}
                          type="button"
                          className={styles.aiBotChipBtn}
                          onClick={() => handleSendPulsePrompt(chipText)}
                        >
                          {chipText}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Active Animated Turn (Prompt Inputted -> Thinking -> Drafting -> Skeleton -> Solution) */}
            {activeTurn && (
              <div key={activeTurn.id} className={styles.aiTurnBlock}>
                {/* Step 1: User Prompt Message Bubble animates in */}
                <div className={styles.aiUserBubbleRow}>
                  <motion.div
                    className={styles.aiUserBubble}
                    initial={{ opacity: 0, y: 12, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {activeTurn.userPrompt}
                  </motion.div>
                </div>

                {/* Step 2: Pulse is Thinking (Pulsing Avatar + Animated Dots) */}
                {activeTurn.phase === "thinking" && (
                  <motion.div
                    className={styles.pulseThinkingPill}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <PulseAIAvatar size={22} isPulsing />
                    <span>Pulse AI is analyzing symptoms &amp; matching specialists in {selectedLocation}</span>
                    <span className={styles.pulseThinkingDots}>
                      <span />
                      <span />
                      <span />
                    </span>
                  </motion.div>
                )}

                {/* Step 3: Pulse is Drafting Text (Typewriter effect) */}
                {(activeTurn.phase === "drafting" || activeTurn.phase === "skeleton" || activeTurn.phase === "complete") && (
                  <motion.div
                    className={styles.aiBotResponseRow}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <p className={styles.aiBotIntroText}>{activeTurn.introText}</p>
                    <p className={styles.aiBotNarrativeText}>
                      {activeTurn.phase === "drafting"
                        ? activeTurn.displayedNarrative
                        : activeTurn.fullNarrative}
                      {activeTurn.phase === "drafting" && (
                        <span className={styles.typewriterCaret} />
                      )}
                    </p>

                    {/* Step 4: Doctor Skeleton Card with Shimmer appears while thinking/loading */}
                    {activeTurn.phase === "skeleton" && (
                      <motion.div
                        className={styles.aiBotDoctorCardWrap}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.25 }}
                      >
                        <div className={styles.pulseDoctorSkeletonCard} style={{ height: 230, minHeight: 230 }}>
                          <div className={styles.pulseSkeletonShimmer} />
                          <div className={`${styles.pulseSkeletonBar} ${styles.pulseSkeletonBarTitle}`} />
                          <div className={`${styles.pulseSkeletonBar} ${styles.pulseSkeletonBarSub}`} />
                          <div className={`${styles.pulseSkeletonBar} ${styles.pulseSkeletonBarLocation}`} />
                          <div className={`${styles.pulseSkeletonBar} ${styles.pulseSkeletonBarBtn}`} />
                        </div>
                      </motion.div>
                    )}

                    {/* Step 5: Final Solution Revealed (Doctor Card + Follow-up Recommendation Chips) */}
                    {activeTurn.phase === "complete" && (
                      <>
                        {activeTurn.doctor && (
                          <motion.div
                            className={styles.aiBotDoctorCardWrap}
                            initial={{ opacity: 0, scale: 0.96, y: 8 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                          >
                            <div className={styles.refDoctorCard} style={{ minHeight: 230, height: 230 }}>
                              <img
                                src={activeTurn.doctor.image}
                                alt={activeTurn.doctor.name}
                                className={styles.refDocFullImage}
                                draggable={false}
                              />
                              <div className={styles.refDocFullGradient} />
                              <div className={styles.refDocOverlayContent}>
                                <div className={styles.refDocBottomFlex}>
                                  <div className={styles.refDocTextCol}>
                                    <h3 className={styles.refDocName} title={activeTurn.doctor.name}>
                                      {activeTurn.doctor.name}
                                    </h3>
                                    <div className={styles.refDocSpecialty} title={activeTurn.doctor.speciality}>
                                      {activeTurn.doctor.speciality}
                                    </div>
                                    <div className={styles.refDocExpRow}>
                                      <Briefcase size={12} className={styles.refDocExpIcon} />
                                      <span>{activeTurn.doctor.experience}</span>
                                    </div>
                                    <div className={styles.refDocHospital} title={activeTurn.doctor.hospital}>
                                      {activeTurn.doctor.hospital}
                                    </div>
                                  </div>

                                  <Link
                                    href={`/doctors/${activeTurn.doctor.id}/book?city=${encodeURIComponent(selectedLocation)}`}
                                    className={styles.refBookBtnWhite}
                                  >
                                    Book
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}

                        <motion.div
                          className={styles.aiBotFollowupsWrap}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.12, duration: 0.3 }}
                        >
                          <div className={styles.aiBotFollowupsHeader}>
                            <Sparkles size={16} className={styles.aiBotSparkleIcon} />
                            <span>If you are looking for something else</span>
                          </div>

                          <div className={styles.aiBotChipsRow}>
                            {activeTurn.followupChips.map((chipText, chipIdx) => (
                              <motion.button
                                key={chipText}
                                type="button"
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15 + chipIdx * 0.05, duration: 0.22 }}
                                className={styles.aiBotChipBtn}
                                onClick={() => handleSendPulsePrompt(chipText)}
                              >
                                {chipText}
                              </motion.button>
                            ))}
                          </div>
                        </motion.div>
                      </>
                    )}
                  </motion.div>
                )}
              </div>
            )}

            <div ref={chatAnchorRef} style={{ height: 1 }} />
          </div>
        )}
      </div>

      {/* ── Gradient Fade across the bottom dock when active in chat mode ── */}
      {isPulseActive && (
        <div className={styles.pulseDockActiveGradientFade} aria-hidden="true" />
      )}

      {/* ── Aurora Glow Field extending upward from bottom dock in Empty State ── */}
      {!isPulseActive && (currentResults.status === "empty" || currentResults.doctors.length === 0) && (
        <div className={styles.pulseAuroraGlowField} aria-hidden="true" />
      )}

      {/* ── 5. Persistent Docked "Ask Pulse ai" Input Bar at the Bottom ── */}
      {/* Small in non-active mode over doctor cards, expands smoothly to 100% full width in active mode */}
      <div 
        className={`${styles.floatingPulseDock} ${isPulseActive ? styles.floatingPulseDockExpanded : styles.floatingPulseDockCompact}`}
        style={{ zIndex: 25 }}
      >
        <div 
          className={styles.floatingPulseDockCol}
          style={{ width: "100%", maxWidth: "100%" }}
        >
          {/* Subtle Nudge when in Empty State */}
          {!isPulseActive && (currentResults.status === "empty" || currentResults.doctors.length === 0) && (
            <motion.button
              type="button"
              className={styles.pulseDockNudgePill}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => {
                pulseInputRef.current?.focus();
              }}
            >
              <Sparkles size={13} className={styles.pulseDockNudgeIcon} />
              <span>Can&apos;t find your condition? Describe symptoms to Pulse AI below</span>
            </motion.button>
          )}

          <form 
            className={`${styles.floatingPulsePill} ${isPulseActive ? styles.floatingPulsePillExpanded : styles.floatingPulsePillCompact}`}
            style={{ width: "100%", maxWidth: "100%" }}
            onSubmit={(e) => {
              e.preventDefault();
              handleSendPulsePrompt();
            }}
          >
          {/* Round Blue Plus Button */}
          <button
            type="button"
            className={styles.floatingPulsePlusBtn}
            onClick={() => pulseInputRef.current?.focus()}
            aria-label="New Prompt"
            title="Ask Pulse"
          >
            <Plus size={18} strokeWidth={2.4} />
          </button>

          {/* Input Field */}
          <input
            ref={pulseInputRef}
            type="text"
            className={styles.floatingPulseInput}
            placeholder="Ask Pulse ai"
            value={pulseInput}
            onChange={(e) => setPulseInput(e.target.value)}
            aria-label="Ask Pulse AI"
          />

          {/* Right Action: Send Button (if text entered) or Mic Icon */}
          {pulseInput.trim().length > 0 ? (
            <button
              type="submit"
              className={styles.floatingPulseSendBtn}
              aria-label="Send prompt"
              title="Send to Pulse AI"
            >
              <Send size={15} />
            </button>
          ) : (
            <button
              type="button"
              className={`${styles.floatingPulseMicBtn} ${isListening ? styles.floatingPulseMicActive : ""}`}
              onClick={() => {
                setIsListening((prev) => !prev);
                if (!isListening) {
                  setPulseInput("Tell me more about Dr Pradeep kumar");
                  pulseInputRef.current?.focus();
                }
              }}
              aria-label="Voice input"
              title={isListening ? "Listening..." : "Speak to Pulse AI"}
            >
              <Mic size={19} />
            </button>
          )}
        </form>
      </div>
    </div>
  </div>
);
}
