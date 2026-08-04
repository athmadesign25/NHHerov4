"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useMotionValue,
  useTransform,
  animate,
  useInView,
} from "framer-motion";
import { MapPin, FlaskConical, Droplets, Shield, Search, ChevronRight , Activity, FileText} from "lucide-react";
import SplitText from "@/components/ui/SplitText";
import styles from "./HeroSearchFirst.module.css";
import Lottie from "lottie-react";
import pulseAnimation from "../../../public/assets/pulse animation.json";
import PixelRipple from "./PixelRipple";
import PulseAIWorkspace from "../pulse-ai/PulseAIWorkspace";

const popularTags = ["chest pain", "cancer", "surgery", "liver"];

// Speciality lists for auto-suggest with semantic keywords (symptoms, organs, treatments)
const specialitiesData = [
  { 
    name: "Cardiology", 
    slug: "cardiology",
    image: "/Specialities icons/Cardiology.svg",
    keywords: ["heart", "chest pain", "valve", "cardiac", "bypass", "bp", "hypertension", "angioplasty", "artery", "cardio", "palpitation", "cardiologist", "cardiac surgeon", "cardio specialists"] 
  },
  { 
    name: "Neurology", 
    slug: "neurology",
    image: "/Specialities icons/Neurology.svg",
    keywords: ["brain", "nerve", "stroke", "migraine", "headache", "spine", "seizure", "epilepsy", "paralysis", "neuro", "back pain", "neurologist", "neuro surgeon", "neuro specialists"] 
  },
  { 
    name: "Oncology", 
    slug: "oncology",
    image: "/Specialities icons/Cancercare.svg",
    keywords: ["cancer", "tumor", "chemotherapy", "radiation", "biopsy", "leukemia", "lymphoma", "onco", "tumor", "lump", "oncologist", "cancer specialist"] 
  },
  { 
    name: "Orthopaedics", 
    slug: "orthopaedics",
    image: "/Specialities icons/Orthopaedics.svg",
    keywords: ["bone", "joint", "fracture", "knee", "hip", "arthritis", "ligament", "sprain", "ortho", "backbone", "orthopaedic surgeon", "ortho specialist"] 
  },
  { 
    name: "Paediatrics", 
    slug: "paediatrics",
    image: "/Specialities icons/Paedratic.svg",
    keywords: ["child", "baby", "kid", "newborn", "vaccination", "paediatrician", "infant", "pediatric"] 
  },
  { 
    name: "Gastroenterology", 
    slug: "gastroenterology",
    image: "/Specialities icons/Gastro.svg",
    keywords: ["stomach", "liver", "digestion", "acidity", "gastric", "endoscopy", "ulcer", "gastro", "diarrhea"] 
  },
  { 
    name: "Ophthalmology", 
    slug: "ophthalmology",
    image: "/Specialities icons/General Medicine.svg",
    keywords: ["eye", "vision", "blind", "cataract", "lasik", "glasses", "lens", "sight"] 
  },
  { 
    name: "ENT", 
    slug: "ent",
    image: "/Specialities icons/Lab test default icon.svg",
    keywords: ["ear", "nose", "throat", "sinus", "tonsils", "hearing", "voice", "throat pain", "cold"] 
  },
  {
    name: "Gynecology",
    slug: "gynecology",
    image: "/Specialities icons/Gynaecology.svg",
    keywords: ["women", "pregnancy", "female", "maternity", "obgyn", "delivery", "period", "uterus"]
  },
  {
    name: "Dermatology",
    slug: "dermatology",
    image: "/Specialities icons/Diabetology.svg",
    keywords: ["skin", "hair", "nails", "acne", "rash", "dandruff", "eczema", "allergy"]
  },
  {
    name: "Urology",
    slug: "urology",
    image: "/Specialities icons/Urology.svg",
    keywords: ["urine", "bladder", "prostate", "kidney stone", "urinary"]
  },
  {
    name: "Pulmonology",
    slug: "pulmonology",
    image: "/Specialities icons/Pulmonology.svg",
    keywords: ["lungs", "breathing", "asthma", "respiratory", "cough", "bronchitis", "pneumonia"]
  },
  {
    name: "Dental Care",
    slug: "dental-care",
    image: "/Specialities icons/Dental.svg",
    keywords: ["teeth", "toothache", "root canal", "dental", "oral", "gums", "braces"]
  }
];

const doctorsData = [
  {
    name: "Dr. Ravi Prakash",
    speciality: "Cardiology",
    location: "Bengaluru",
    hospital: "Narayana Institute of Cardiac Sciences, Bangalore",
    additionalHospitals: 1,
    photo: "/assets/doctor_1.png",
    keywords: ["cardiology", "heart", "ravi", "prakash", "doctor", "specialist", "cardiologist"]
  },
  {
    name: "Dr. Ravi Kumar",
    speciality: "Cardiology",
    location: "Guwahati",
    hospital: "Narayana Superspeciality Hospital, Guwahati",
    photo: "/assets/doctor_2.png",
    keywords: ["cardiology", "heart", "ravi", "kumar", "doctor", "specialist", "cardiologist"]
  },
  {
    name: "Dr. Ravi Shankar",
    speciality: "Neurology",
    location: "Mumbai",
    hospital: "NH Children's Hospital, Mumbai",
    additionalHospitals: 2,
    photo: "/assets/doctor_3.png",
    keywords: ["neurology", "brain", "ravi", "shankar", "doctor", "specialist", "neurologist"]
  },
  {
    name: "Dr. Prakash Sharma",
    speciality: "Cardiology",
    location: "Bengaluru",
    hospital: "Narayana Multispeciality Hospital, HSR Bangalore",
    photo: "/assets/doctor_1.png",
    keywords: ["cardiology", "heart", "prakash", "sharma", "doctor", "specialist", "cardiologist"]
  },
  {
    name: "Dr. Prakash Gupta",
    speciality: "Orthopaedics",
    location: "Kolkata",
    hospital: "Narayana Superspeciality Hospital, Howrah, kolkata",
    photo: "/assets/doctor_2.png",
    keywords: ["orthopaedics", "bone", "prakash", "gupta", "doctor", "specialist", "orthopaedic"]
  },
  {
    name: "Dr. Rajiv Menon",
    speciality: "Cardiology",
    location: "Bengaluru",
    hospital: "Mazumdar Shaw Medical Centre, Bangalore",
    photo: "/assets/doctor_3.png",
    keywords: ["cardiology", "heart", "rajiv", "menon", "doctor", "specialist", "cardiologist"]
  },
  {
    name: "Dr. Priya Sharma",
    speciality: "Neurology",
    location: "Mumbai",
    hospital: "NH Children's Hospital, Mumbai",
    additionalHospitals: 1,
    photo: "/assets/doctor_1.png",
    keywords: ["neurology", "brain", "priya", "sharma", "doctor", "specialist", "neurologist"]
  },
  {
    name: "Dr. Arun Krishnan",
    speciality: "Oncology",
    location: "Kolkata",
    hospital: "Narayana Multispeciality Hospital, Barasat, kolkata",
    photo: "/assets/doctor_2.png",
    keywords: ["oncology", "cancer", "arun", "krishnan", "doctor", "specialist", "oncologist"]
  },
  {
    name: "Dr. Sunita Patel",
    speciality: "Orthopaedics",
    location: "Bengaluru",
    hospital: "Narayana Multispeciality Clinic, HSR Bangalore",
    photo: "/assets/doctor_3.png",
    keywords: ["orthopaedics", "bone", "joint", "sunita", "patel", "doctor", "specialist"]
  }
];

const doctorRoles = [
  {
    role: "Cardiologists",
    keywords: ["cardiology", "heart", "cardio", "bypass", "chest pain", "angioplasty", "clogged"]
  },
  {
    role: "Cardiac Surgeon",
    keywords: ["cardiology", "heart", "cardio", "bypass", "surgery", "angioplasty", "surgeon"]
  },
  {
    role: "Cardio Specialists",
    keywords: ["cardiology", "heart", "cardio", "specialist"]
  },
  {
    role: "Neurologists",
    keywords: ["neurology", "brain", "neuro", "stroke", "migraine", "headache"]
  },
  {
    role: "Neuro Surgeons",
    keywords: ["neurology", "brain", "neuro", "spine", "surgery", "surgeon"]
  },
  {
    role: "Oncologists",
    keywords: ["oncology", "cancer", "tumor", "chemotherapy"]
  },
  {
    role: "Cancer Specialists",
    keywords: ["oncology", "cancer", "onco", "tumor", "specialist"]
  },
  {
    role: "Orthopaedic Surgeons",
    keywords: ["orthopaedics", "bone", "joint", "ortho", "knee", "surgeon"]
  },
  {
    role: "Bone & Joint Specialists",
    keywords: ["orthopaedics", "bone", "joint", "ortho", "specialist"]
  },
  {
    role: "Paediatricians",
    keywords: ["paediatrics", "child", "kid", "baby", "pediatric"]
  },
  {
    role: "Gastroenterologists",
    keywords: ["gastroenterology", "stomach", "liver", "gastro"]
  }
];

const treatmentsData = [
  // Treatments
  {
    name: "Angioplasty & Bypass Surgery",
    type: "treatment",
    speciality: "Cardiology",
    description: "Restores blood flow to blocked heart arteries using state-of-the-art stents and surgical bypass techniques.",
    keywords: ["heart", "chest pain", "valve", "cardiac", "bypass", "angioplasty", "artery", "cardio", "clogged"],
    image: "/Specialities icons/Cardiology.svg"
  },
  {
    name: "Deep Brain Stimulation (DBS)",
    type: "treatment",
    speciality: "Neurology",
    description: "Advanced neurosurgical procedure delivering electrical stimulation to brain areas targeting movement disorders.",
    keywords: ["brain", "nerve", "stroke", "spine", "seizure", "epilepsy", "parkinson", "tremor"],
    image: "/Specialities icons/Neurology.svg"
  },
  {
    name: "Precision Radiotherapy & Chemotherapy",
    type: "treatment",
    speciality: "Oncology",
    description: "Targeted cancer treatment using precise radiation beams and chemotherapy regimens to eliminate cancer cells.",
    keywords: ["cancer", "tumor", "chemotherapy", "radiation", "biopsy", "leukemia", "lymphoma", "chemo"],
    image: "/Specialities icons/Cancercare.svg"
  },
  {
    name: "Knee & Hip Joint Replacements",
    type: "treatment",
    speciality: "Orthopaedics",
    description: "Minimally invasive surgeries to replace worn-out joint surfaces with artificial implants for pain-free mobility.",
    keywords: ["bone", "joint", "fracture", "knee", "hip", "arthritis", "ligament", "sprain", "replacement"],
    image: "/Specialities icons/Orthopaedics.svg"
  },
  {
    name: "Advanced Gastrointestinal Endoscopy",
    type: "treatment",
    speciality: "Gastroenterology",
    description: "Diagnostic and therapeutic visual scope evaluation of the upper and lower digestive tract organs.",
    keywords: ["stomach", "liver", "digestion", "acidity", "gastric", "endoscopy", "ulcer", "gastro"],
    image: "/Specialities icons/Gastro.svg"
  },
  
  // Health Checkups
  {
    name: "Executive Full Body Health Checkup",
    type: "health_checkup",
    testCount: "84 tests included",
    description: "A comprehensive health screening covering vital organs like liver, kidney, heart, and metabolic parameters.",
    keywords: ["health package", "checkup", "full body", "preventive", "blood test", "screening", "urine test", "ecg", "ultrasound", "package", "health"],
    image: "/Health Checkup/Basic health.png"
  },
  {
    name: "Comprehensive Cardiac Health Package",
    type: "health_checkup",
    testCount: "12 tests included",
    description: "Specialized diagnostics targeting cardiac health, including ECG, lipid profile, and cardiologist consult.",
    keywords: ["heart checkup", "cardiac", "blood test", "ecg", "cholesterol", "lipid profile", "health package", "package", "heart"],
    image: "/Health Checkup/Master health.png"
  },
  {
    name: "Advanced Diabetes Screening Package",
    type: "health_checkup",
    testCount: "15 tests included",
    description: "Monitors blood glucose levels, HbA1c, renal profile, and nerve function for diabetes management.",
    keywords: ["diabetes", "sugar check", "blood test", "hba1c", "glucose", "insulin", "health package", "package"],
    image: "/Health Checkup/Senior Citizen.png"
  },
  
  // Lab Tests
  {
    name: "CBC (Complete Blood Count) Lab Test",
    type: "lab_test",
    testCount: "24 parameters included",
    description: "Evaluates your overall health and detects a wide range of disorders, including anemia and leukemia.",
    keywords: ["cbc", "blood test", "lab test", "hemoglobin", "infection", "anemia", "test"],
    image: "/Health Checkup/Basic health.png"
  },
  {
    name: "Thyroid Profile (T3, T4, TSH) Lab Test",
    type: "lab_test",
    testCount: "3 parameters included",
    description: "Measures the level of thyroid hormones in your blood to diagnose hyperthyroidism or hypothyroidism.",
    keywords: ["thyroid", "tsh", "blood test", "lab test", "hormone", "hypothyroidism", "test"],
    image: "/Health Checkup/Master health.png"
  },
  {
    name: "Lipid Profile (Cholesterol) Lab Test",
    type: "lab_test",
    testCount: "8 parameters included",
    description: "Measures cholesterol and triglycerides to assess cardiovascular health and risk of stroke or heart disease.",
    keywords: ["lipid profile", "cholesterol", "blood test", "lab test", "heart", "triglycerides", "test"],
    image: "/Health Checkup/Senior Citizen.png"
  }
];

const articlesData = [
  {
    name: "Understanding Heart Health: 5 Tips to Keep Your Heart Strong",
    keywords: ["heart", "cardiac", "strong", "healthy", "lifestyle", "angioplasty"],
    image: "https://images.unsplash.com/photo-1531983412531-1f49a365ffed?w=150&h=150&fit=crop&q=80",
    description: "Discover essential lifestyle changes and habits that promote long-term cardiovascular wellness."
  },
  {
    name: "Living with Migraines: Identifying Triggers and Finding Relief",
    keywords: ["migraine", "headache", "brain", "nerve", "seizure", "triggers"],
    image: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=150&h=150&fit=crop&q=80",
    description: "Learn how to track your triggers and explore effective treatments for severe migraine headaches."
  },
  {
    name: "Cancer Care: The Role of Early Screening & Detection",
    keywords: ["cancer", "tumor", "chemo", "screening", "detection"],
    image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=150&h=150&fit=crop&q=80",
    description: "Early detection is key. Understand the recommended screening guidelines for different types of cancer."
  },
  {
    name: "Keeping Joints and Bones Healthy in Your Golden Years",
    keywords: ["bone", "joint", "healthy", "aging", "arthritis"],
    image: "https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?w=150&h=150&fit=crop&q=80",
    description: "Practical advice on nutrition, exercise, and supplements to maintain bone density as you age."
  }
];

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


function CountingNumber({ value, suffix = "", duration = 2 }: { value: number, suffix?: string, duration?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10px" });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest).toLocaleString('en-IN') + suffix);

  useEffect(() => {
    if (isInView) {
      const animation = animate(count, value, { duration, ease: "easeOut" });
      return animation.stop;
    }
  }, [isInView, value, count, duration]);

  return <motion.span ref={ref}>{rounded}</motion.span>;
}

interface RealtimePulseResponse {
  empathy: string;
  suggestedDoc: {
    id: string;
    name: string;
    qualification: string;
    speciality: string;
    hospital: string;
    plusHospitals?: number;
    slot: string;
    price: string;
    rating: number;
    photo: string;
    location?: string;
  };
  suggestedSpec: string;
  slot: string;
}

function getRealtimePulseResponse(query: string): RealtimePulseResponse {
  const ql = query.toLowerCase();
  
  if (ql.includes("heart") || ql.includes("chest") || ql.includes("cardio")) {
    return {
      empathy: "I understand you are concerned about chest or cardiac symptoms. Based on your profile and preferred clinic (NICS Bangalore), we recommend a Cardiology review.",
      suggestedDoc: {
        id: "d2",
        name: "Dr. Ananya Krishnan",
        qualification: "MBBS, DM (Cardiology)",
        speciality: "Cardiologist",
        hospital: "Narayana Institute of Cardiac Sciences",
        plusHospitals: 0,
        slot: "Today, 05:00 PM",
        price: "₹1,200",
        rating: 4.8,
        photo: "/assets/doctor_2.png",
        location: "Bengaluru"
      },
      suggestedSpec: "Cardiology",
      slot: "Today, 05:00 PM"
    };
  }
  
  if (ql.includes("brain") || ql.includes("nerve") || ql.includes("headache") || ql.includes("stroke") || ql.includes("tremor") || ql.includes("migraine")) {
    return {
      empathy: "I understand you are experiencing nerve or headache symptoms. Based on your health record of neurological checks, we recommend starting with a Neurologist.",
      suggestedDoc: {
        id: "d4",
        name: "Dr. Vikas Yadav",
        qualification: "MBBS, MD (Nephrology)",
        speciality: "Nephrologist",
        hospital: "Mazumdar Shaw Medical Centre",
        plusHospitals: 0,
        slot: "Today, 04:00 PM",
        price: "₹1,000",
        rating: 4.85,
        photo: "/assets/doctor_1.png",
        location: "Bengaluru"
      },
      suggestedSpec: "Neurology",
      slot: "Today, 04:00 PM"
    };
  }

  if (ql.includes("cancer") || ql.includes("tumor") || ql.includes("oncology") || ql.includes("lump")) {
    return {
      empathy: "I understand you are seeking guidance on tumor or oncology concerns. Based on your preferences at Narayana Superspeciality, we recommend consulting our lead Oncologist.",
      suggestedDoc: {
        id: "d3",
        name: "Dr. Rajiv Menon",
        qualification: "MBBS, MS, MCh",
        speciality: "Cardiac Surgeon",
        hospital: "Mazumdar Shaw Medical Centre",
        plusHospitals: 2,
        slot: "Thu, 10:00 AM",
        price: "₹1,500",
        rating: 4.95,
        photo: "/assets/doctor_1.png",
        location: "Bengaluru"
      },
      suggestedSpec: "Oncology",
      slot: "Thu, 10:00 AM"
    };
  }

  if (ql.includes("bone") || ql.includes("joint") || ql.includes("fracture") || ql.includes("knee") || ql.includes("back pain")) {
    return {
      empathy: "I understand you have joint or bone pain. Based on your activity and local medical profile at HSR, we suggest consulting a Bone & Joint specialist.",
      suggestedDoc: {
        id: "d4",
        name: "Dr. Vikas Yadav",
        qualification: "MBBS, MD (Nephrology)",
        speciality: "Nephrologist",
        hospital: "Mazumdar Shaw Medical Centre",
        plusHospitals: 0,
        slot: "Today, 04:00 PM",
        price: "₹1,000",
        rating: 4.85,
        photo: "/assets/doctor_1.png",
        location: "Bengaluru"
      },
      suggestedSpec: "Orthopaedics",
      slot: "Today, 04:00 PM"
    };
  }

  return {
    empathy: "I understand you are experiencing general discomfort like fever or cough. Based on your location in Bangalore and your last consult with Dr. Vikas Yadav, we suggest seeing a General Physician.",
    suggestedDoc: {
      id: "d1",
      name: "Dr. Pradeep R Kumar",
      qualification: "MBBS, MD",
      speciality: "General Physician",
      hospital: "Mazumdar Shaw Medical Centre",
      plusHospitals: 1,
      slot: "Tomorrow, 02:30 PM",
      price: "₹800",
      rating: 4.9,
      photo: "/assets/doctor_1.png",
      location: "Bengaluru"
    },
    suggestedSpec: "General Medicine",
    slot: "Tomorrow, 02:30 PM"
  };
}

export default function HeroSearchFirst() {

  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDropdownTab, setActiveDropdownTab] = useState<"doctors_specialities" | "treatments_tests" | "articles">("doctors_specialities");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [isOpen, setIsOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const [isPulseActive, setIsPulseActive] = useState(false);
  const [pulseInitialAction, setPulseInitialAction] = useState<string | null>(null);
  const [pulseInitialActionData, setPulseInitialActionData] = useState<any>(null);
  const [showPixelRipple, setShowPixelRipple] = useState(false);

  const handlePulseLaunchWithAction = (action: string, doctorData: any) => {
    setPulseInitialAction(action);
    setPulseInitialActionData(doctorData);
    setIsPulseActive(true);
  };

  const isConversational = searchQuery.trim().split(" ").length > 3 || 
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
  const searchRef = useRef<HTMLFormElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const prefersReducedMotion = useReducedMotion();

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

  // Reset dropdown tab to Doctors when typing/query changes
  useEffect(() => {
    setActiveDropdownTab("doctors_specialities");
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      if (typeof window !== "undefined") {
        localStorage.setItem("nh_last_search", query);
        setLastSearch(query);
      }

      // Pulse Trigger Heuristic
      const isConversational = query.split(" ").length > 3 || 
                               /have|fever|cough|tomorrow|symptom|feel|pain/i.test(query);

      if (isConversational) {
        setIsPulseActive(true);
      } else {
        router.push(`/search?q=${encodeURIComponent(query)}`);
      }
      setIsOpen(false);
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

  const conversationalSpecs = [
    { name: "General Physician", slug: "general-physician", image: "/Specialities icons/General Medicine.svg" },
    { name: "ENT", slug: "ent", image: "/Specialities icons/Lab test default icon.svg" }
  ];

  const conversationalDoctors = [
    { name: "Dr. Pradeep R Kumar", speciality: "General Physician", hospital: "Mazumdar Shaw Medical Centre, Bangalore", photo: "/assets/doctor_1.png" },
    { name: "Dr. Rammaya Murthey", speciality: "General Physician", hospital: "Narayana Institute of Cardiac Sciences, Bangalore", photo: "/assets/doctor_2.png" },
    { name: "Dr. Vikas Yadav", speciality: "ENT Specialist", hospital: "Narayana City Clinic, Bangalore", photo: "/assets/doctor_1.png" }
  ];

  const displaySpecs = isConversational && (filteredSpecs.length === 0 || /fever|cough|symptom|headache|stomach|pain|feel/i.test(searchQuery))
    ? conversationalSpecs
    : filteredSpecs.slice(0, 2);

  const displayDoctors = isConversational && (filteredDoctors.length === 0 || /fever|cough|symptom|headache|stomach|pain|feel/i.test(searchQuery))
    ? conversationalDoctors
    : filteredDoctors.slice(0, 3);

  const hasSuggestions = filteredDoctors.length > 0 || filteredSpecs.length > 0 || filteredTreatments.length > 0 || filteredArticles.length > 0;

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

  // Control video playback based on search state
  useEffect(() => {
    let intervalId: NodeJS.Timeout | undefined = undefined;
    
    if (videoRef.current) {
      if (isOpen) {
        // Smoothly slow down the video
        let rate = videoRef.current.playbackRate;
        intervalId = setInterval(() => {
          if (videoRef.current && isOpen) {
            rate -= 0.05; // Decrease rate gradually
            if (rate <= 0.1) {
              videoRef.current.pause();
              videoRef.current.playbackRate = 1.0; // reset for next play
              clearInterval(intervalId);
            } else {
              videoRef.current.playbackRate = rate;
            }
          } else {
            clearInterval(intervalId);
          }
        }, 30); // ~600ms total duration
      } else {
        clearInterval(intervalId);
        videoRef.current.playbackRate = 1.0;
        videoRef.current.play().catch((err) => {
          console.log("Playback prevented:", err);
        });
      }
    }
    return () => clearInterval(intervalId);
  }, [isOpen]);

  return (
    <section className={styles.hero} id="hero-section-search-first">
      <video
        ref={videoRef}
        src="/Hero-Video-New.mp4"
        autoPlay
        muted
        loop
        playsInline
        className={styles.bgVideo}
      />
      <div className={`${styles.videoOverlay} ${isOpen ? styles.videoOverlayActive : ""}`} />
      <PixelRipple trigger={showPixelRipple} />

      <div className={styles.centerWrap}>
        <div className={styles.heroStack}>
          <div className={`${styles.titleUnit} ${isOpen ? styles.titleHidden : ""}`}>
            <SplitText text="Trusted Care, Every Day" tag="h1" className={styles.headline} delay={0.08} />
            <motion.p 
              className={styles.subHeadline}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.5, ease: "easeOut" }}
            >
              Compassion Backed by Expertise
            </motion.p>
            
          </div>

<motion.form
                    ref={searchRef}
                    onSubmit={handleSearch}
                    className={`${styles.searchBarForm} ${isOpen ? styles.searchBarFormActive : ""}`}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ 
                      opacity: 1, 
                      y: isOpen ? -340 : 0 
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
                      <div className={styles.searchIconWrapper}>
                        <Search className={styles.searchIcon} size={18} />
                      </div>
                      <input
                        id="hero-search-input"
                        type="text"
                        placeholder="Search doctors, specialities, or treatments..."
                        value={searchQuery}
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
                      <div 
                        className={styles.pulseIconWrapper} 
                        style={{ marginRight: '14px' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsPulseActive(true);
                        }}
                      >
                        <Lottie animationData={pulseAnimation} className={styles.pulseIcon} loop={true} />
                        <span className={styles.pulseText}>Ask Pulse</span>
                      </div>

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
                      <div className={styles.popularSearches}>
                        <div className={styles.popularTitle}>what people are searching for :</div>
                        <div className={styles.popularTags}>
                          {["chest pain", "cancer", "surgery", "liver"].map((tag) => (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => setSearchQuery(tag)}
                              className={styles.popularTagBtn}
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Pulse AI Intent-Driven Entry Points */}
                      <div className={styles.dropdownPulseDivider}>
                        <span>Ask Pulse AI Workspace</span>
                      </div>

                      <div className={styles.entryCardsContainer}>
                        {/* Card 1: Find the right doctor */}
                        <div 
                          className={`${styles.entryCard} ${styles.blueThemeCard}`}
                          onClick={() => {
                            setSearchQuery("Find doctor");
                            setIsPulseActive(true);
                          }}
                          style={{ cursor: "pointer" }}
                        >
                          <div className={styles.entryCardHeader}>
                            <div className={styles.entryCardBannerWrap}>
                              <img 
                                src="/pulse_find_doctor_banner.png" 
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

                          <div className={styles.intentSubSection}>
                            <span className={styles.intentLabel}>Try asking for</span>
                            <div className={styles.intentChipsWrap}>
                              <button 
                                className={`${styles.intentChip} ${styles.blueChip}`} 
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  setSearchQuery("I have been having ");
                                  const searchInput = document.getElementById("hero-search-input");
                                  if (searchInput) searchInput.focus();
                                }}
                              >
                                I have a symptom
                              </button>
                              <button 
                                className={`${styles.intentChip} ${styles.blueChip}`} 
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  setSearchQuery("I want to consult Dr. ");
                                  const searchInput = document.getElementById("hero-search-input");
                                  if (searchInput) searchInput.focus();
                                }}
                              >
                                I know the doctor's name
                              </button>
                              <button 
                                className={`${styles.intentChip} ${styles.blueChip}`} 
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  setSearchQuery("I want to book an appointment");
                                  setIsPulseActive(true);
                                }}
                              >
                                I want to book an appointment
                              </button>
                              <button 
                                className={`${styles.intentChip} ${styles.blueChip}`} 
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  setSearchQuery("I am looking for a ");
                                  const searchInput = document.getElementById("hero-search-input");
                                  if (searchInput) searchInput.focus();
                                }}
                              >
                                I know the speciality
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Card 2: Know your health */}
                        <div 
                          className={`${styles.entryCard} ${styles.tealThemeCard}`}
                          onClick={() => {
                            setSearchQuery("Know your health");
                            setIsPulseActive(true);
                          }}
                          style={{ cursor: "pointer" }}
                        >
                          <div className={styles.entryCardHeader}>
                            <div className={styles.entryCardBannerWrap}>
                              <img 
                                src="/pulse_health_insights_banner.png" 
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

                          <div className={styles.intentSubSection}>
                            <span className={styles.intentLabel}>Try asking for</span>
                            <div className={styles.intentChipsWrap}>
                              <button 
                                className={`${styles.intentChip} ${styles.tealChip}`} 
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  setSearchQuery("Summarize my health");
                                  setIsPulseActive(true);
                                }}
                              >
                                Summarize my health
                              </button>
                              <button 
                                className={`${styles.intentChip} ${styles.tealChip}`} 
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  setSearchQuery("Please analyse report ");
                                  const searchInput = document.getElementById("hero-search-input");
                                  if (searchInput) searchInput.focus();
                                }}
                              >
                                Analyse my reports
                              </button>
                              <button 
                                className={`${styles.intentChip} ${styles.tealChip}`} 
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  setSearchQuery("Show my organ insights");
                                  setIsPulseActive(true);
                                }}
                              >
                                Show my organ insights
                              </button>
                              <button 
                                className={`${styles.intentChip} ${styles.tealChip}`} 
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  setSearchQuery("Upload and review my report");
                                  setIsPulseActive(true);
                                }}
                              >
                                Upload and review my report
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      {isConversational ? (
                        <div className={styles.pulsePreviewWrapper} data-lenis-prevent>
                          {/* 1. Top Section: General search results */}
                          <div className={styles.pulseGeneralMatches}>
                            <div className={styles.pulsePreviewTitle}>Standard Matches</div>
                            <div className={styles.dropdownTabContent} style={{ maxHeight: "200px" }}>
                              <div className={styles.dropdownSection}>
                                {/* Speciality matched if any */}
                                {displaySpecs.length > 0 && (
                                  <div style={{ marginBottom: "12px" }}>
                                    <div className={styles.sectionHeader} style={{ fontSize: "11px", marginBottom: "6px" }}>Specialities</div>
                                    <div className={styles.specGrid} style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
                                      {displaySpecs.map((spec) => (
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

                                {/* Doctors matched if any */}
                                {displayDoctors.length > 0 ? (
                                  <div>
                                    <div className={styles.sectionHeader} style={{ fontSize: "11px", marginBottom: "6px" }}>Doctors</div>
                                    <div className={styles.doctorGrid} style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
                                      {displayDoctors.map((doc) => (
                                        <div
                                          key={doc.name}
                                          onClick={() => handleSelectSuggestion(doc.name)}
                                          className={styles.doctorCard}
                                          style={{ padding: "8px 10px" }}
                                        >
                                          <img
                                            src={doc.photo || "/doctor_avatar_male.png"}
                                            alt={doc.name}
                                            className={styles.doctorPhoto}
                                            style={{ width: "32px", height: "32px" }}
                                          />
                                          <div className={styles.doctorInfo}>
                                            <div className={styles.doctorName} style={{ fontSize: "13px" }}>
                                              <HighlightMatch text={doc.name} query={searchQuery} />
                                            </div>
                                            <div className={styles.doctorSpec} style={{ fontSize: "11px" }}>{doc.speciality}</div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ) : (
                                  displaySpecs.length === 0 && (
                                    <div className={styles.noResults} style={{ padding: "8px 0" }}>No direct general results found</div>
                                  )
                                )}
                              </div>
                            </div>
                          </div>

                          {/* 2. Bottom Section: Pulse AI Pending/Hint (Glow Gradient box) */}
                          <div 
                            className={styles.pulseAIPreviewBox}
                            onClick={handleSearch}
                          >
                            <div className={styles.pulsePreviewHeaderRow}>
                              <div className={styles.pulsePreviewBadge}>
                                <Lottie animationData={pulseAnimation} className={styles.pulsePreviewLottie} loop={true} />
                                <span>Pulse AI Curated Pathway</span>
                              </div>
                              <div className={styles.pulsePreviewTag} style={{ color: "#7c3aed", background: "#f5f3ff", border: "1px solid #ddd6fe" }}>Ready to Analyze</div>
                            </div>

                            <div className={styles.pulseAIPendingContent}>
                              <div className={styles.pulseAIPendingText}>
                                We detected a symptom sentence: <strong>&ldquo;{searchQuery}&rdquo;</strong>
                              </div>
                              <p className={styles.pulseAIPendingHint}>
                                Press <strong>Enter ↵</strong> or click <strong>Ask Pulse</strong> to submit this query to Pulse AI. It will analyze your symptom, draft an empathy response, and recommend matching specialists.
                              </p>
                              <div className={styles.pulseAIPendingCTA}>
                                <span>Analyze Sentence with Pulse AI</span>
                                <ChevronRight size={14} style={{ display: "inline-block", verticalAlign: "middle", marginLeft: "4px" }} />
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* Tabs Selector at the top */}
                          <div className={styles.dropdownTabs}>
                            <div className={styles.dropdownTabButtons}>
                              <button
                                type="button"
                                onClick={() => setActiveDropdownTab("doctors_specialities")}
                                className={`${styles.dropdownTab} ${activeDropdownTab === "doctors_specialities" ? styles.activeTab : ""}`}
                              >
                                Appointments ({filteredDoctors.length + filteredSpecs.length})
                              </button>
                              <button
                                type="button"
                                onClick={() => setActiveDropdownTab("treatments_tests")}
                                className={`${styles.dropdownTab} ${activeDropdownTab === "treatments_tests" ? styles.activeTab : ""}`}
                              >
                                Treatments & Tests ({filteredTreatments.length})
                              </button>
                              <button
                                type="button"
                                onClick={() => setActiveDropdownTab("articles")}
                                className={`${styles.dropdownTab} ${activeDropdownTab === "articles" ? styles.activeTab : ""}`}
                              >
                                Articles ({filteredArticles.length})
                              </button>
                            </div>

                            {activeDropdownTab === "doctors_specialities" && (
                              <div className={styles.dropdownLocationFilter}>
                                <MapPin size={14} className={styles.locationPinIcon} />
                                <select
                                  value={selectedLocation}
                                  onChange={(e) => setSelectedLocation(e.target.value)}
                                  className={styles.locationDropdownSelect}
                                >
                                  <option value="All Locations">All Locations</option>
                                  {Array.from(new Set(doctorsData.map((d) => d.location))).map((loc) => (
                                    <option key={loc} value={loc}>
                                      {loc}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )}
                          </div>

                          <div className={styles.dropdownTabContent} data-lenis-prevent>
                            {activeDropdownTab === "doctors_specialities" && (
                              <div className={styles.dropdownSection} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                {/* Doctors Section */}
                                {filteredDoctors.length > 0 && (
                                  <div>
                                    <div className={styles.sectionHeader}>Doctors</div>
                                    <div className={styles.doctorGrid}>
                                      {filteredDoctors.map((doc) => (
                                        <div
                                          key={doc.name}
                                          onClick={() => handleSelectSuggestion(doc.name)}
                                          className={styles.doctorCard}
                                        >
                                          <img
                                            src={doc.photo || "/doctor_avatar_male.png"}
                                            alt={doc.name}
                                            className={styles.doctorPhoto}
                                          />
                                          <div className={styles.doctorInfo}>
                                            <div className={styles.doctorName}>
                                              <HighlightMatch text={doc.name} query={searchQuery} />
                                            </div>
                                            <div className={styles.doctorSpec}>{doc.speciality}</div>
                                            <div className={styles.doctorLoc}>
                                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.locIcon}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                                              <span>
                                                {doc.hospital}
                                                {doc.additionalHospitals && (
                                                  <span className={styles.plusMoreBadge}> +{doc.additionalHospitals}</span>
                                                )}
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Specialities Section */}
                                {filteredSpecs.length > 0 && (
                                  <div>
                                    <div className={styles.sectionHeader}>Specialities</div>
                                    <div className={styles.specGrid}>
                                      {filteredSpecs.map((spec) => (
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

                                {filteredDoctors.length === 0 && filteredSpecs.length === 0 && (
                                  <div className={styles.noResults}>No matching doctors or specialities found</div>
                                )}
                              </div>
                            )}

                            {activeDropdownTab === "treatments_tests" && (
                              <div className={styles.dropdownSection} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                {/* Health Checkup Packages Section */}
                                {filteredHealthCheckups.length > 0 && (
                                  <div>
                                    <div className={styles.sectionHeader}>Health Checkup Packages</div>
                                    <div className={styles.treatmentGrid}>
                                      {filteredHealthCheckups.map((t) => (
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
                                              <div style={{ fontSize: '10.5px', color: 'var(--color-primary, #034EA2)', fontWeight: 500 }}>
                                                {t.testCount}
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
                                      {filteredLabTests.map((t) => (
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
                                              <div style={{ fontSize: '10.5px', color: 'var(--color-primary, #034EA2)', fontWeight: 500 }}>
                                                {t.testCount}
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
                                      {filteredOnlyTreatments.map((t) => (
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
                                              <div style={{ fontSize: '10.5px', color: 'var(--color-primary, #034EA2)', fontWeight: 500 }}>
                                                Related to: <HighlightMatch text={t.speciality ?? ""} query={searchQuery} />
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
                                  <div className={styles.noResults}>No matching treatments, packages or tests found</div>
                                )}
                              </div>
                            )}

                            {activeDropdownTab === "articles" && (
                              <div className={styles.dropdownSection}>
                                {filteredArticles.length > 0 ? (
                                  filteredArticles.map((a) => (
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
                                ) : (
                                  <div className={styles.noResults}>No matching articles found</div>
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

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={isOpen ? { opacity: 0, y: 20, pointerEvents: "none" } : { opacity: 1, y: 0, pointerEvents: "auto" }}
            transition={{ duration: 0.6, delay: isOpen ? 0 : 0.4, ease: [0.16, 1, 0.3, 1] }}
            className={styles.metricsRow}
          >
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
              className={styles.metricItem}
            >
              <div className={styles.metricValue}><CountingNumber value={5000} suffix="+" /></div>
              <div className={styles.metricLabel}>Robotic Surgeries<br/>Performed</div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
              className={styles.metricItem}
            >
              <div className={styles.metricValue}><CountingNumber value={550000} suffix="+" /></div>
              <div className={styles.metricLabel}>Cardiac Consults<br/>Annually</div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7, ease: "easeOut" }}
              className={styles.metricItem}
            >
              <div className={styles.metricValue}><CountingNumber value={33000} suffix="+" /></div>
              <div className={styles.metricLabel}>Image Guided<br/>Procedures</div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8, ease: "easeOut" }}
              className={styles.metricItem}
            >
              <div className={styles.metricValue}><CountingNumber value={8000} suffix="+" /></div>
              <div className={styles.metricLabel}>Solid Organ<br/>Transplants</div>
            </motion.div>
          </motion.div>

        </div>
      </div>
      {isPulseActive && (
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
      )}
    </section>
  );
}
