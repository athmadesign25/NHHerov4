"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import { MapPin, FlaskConical, Droplets, Shield, Search, ChevronRight , Activity, FileText} from "lucide-react";
import SplitText from "@/components/ui/SplitText";
import styles from "./HeroSearchFirst.module.css";
import Lottie from "lottie-react";
import pulseAnimation from "../../../public/assets/pulse animation.json";
import PixelRipple from "./PixelRipple";
import PulseAIWorkspace from "../pulse-ai/PulseAIWorkspace";
import { NeatGradient } from "@firecms/neat";

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


const carouselItems = [
  {
    id: 0,
    title: "Advanced Cardiology & Surgical Care",
    videoSrc: "/NH YT Vid 01.mp4",
    poster: "/Hero image.png",
  },
  {
    id: 1,
    title: "Compassionate Care & Expert Doctors",
    videoSrc: "/NH YT Vid 02.mp4",
    poster: "/doctor_patient.png",
  },
  {
    id: 2,
    title: "World-Class Multispecialty Healthcare",
    videoSrc: "/NH YT Vid 03.mp4",
    poster: "/Advance Heart Care.jpg",
  },
];

export default function HeroSearchFirst() {

  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDropdownTab, setActiveDropdownTab] = useState<"doctors_specialities" | "treatments_tests" | "articles">("doctors_specialities");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [isOpen, setIsOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const [isPulseActive, setIsPulseActive] = useState(false);
  const [showPixelRipple, setShowPixelRipple] = useState(false);

  // Carousel infinite step counter (always moves leftward)
  const [step, setStep] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const videoRef0 = useRef<HTMLVideoElement | null>(null);
  const videoRef1 = useRef<HTMLVideoElement | null>(null);
  const videoRef2 = useRef<HTMLVideoElement | null>(null);
  const carouselVideoRefs = useRef<Array<React.RefObject<HTMLVideoElement | null>>>([videoRef0, videoRef1, videoRef2]);

  // Track viewport width for pixel-accurate carousel layout
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );
  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Auto-move carousel every 4.5 seconds (deliberate stay + silky transition)
  useEffect(() => {
    if (isOpen) return;

    const timer = setInterval(() => {
      setIsTransitioning(true);
      setStep((prev) => prev + 1);
    }, 4500);

    return () => clearInterval(timer);
  }, [isOpen]);

  // Active center tile data index is (step + 1) % 3
  const activeTileIndex = (step + 1) % carouselItems.length;

  // Video playback controller: Video plays ONLY when a tile settles in center focus
  useEffect(() => {
    carouselVideoRefs.current.forEach((ref, idx) => {
      if (!ref.current) return;
      if (idx === activeTileIndex && !isTransitioning && !isOpen) {
        ref.current.currentTime = 0;
        ref.current.play().catch((err) => {
          console.log("Carousel video play prevented:", err);
        });
      } else {
        ref.current.pause();
        ref.current.currentTime = 0;
      }
    });
  }, [activeTileIndex, isTransitioning, isOpen]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPulseActive) {
      // Delay ripple slightly to sync with the chat expansion animation (0.4s)
      timer = setTimeout(() => setShowPixelRipple(true), 300);
    } else {
      setShowPixelRipple(false);
    }
    return () => clearTimeout(timer);
  }, [isPulseActive]);
  const [lastSearch, setLastSearch] = useState<string | null>(null);
  const searchRef = useRef<HTMLFormElement>(null);
  const prefersReducedMotion = useReducedMotion();

  // NeatGradient animated background
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gradientRef = useRef<NeatGradient | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const config = {
      colors: [
        { color: '#F7F6F2', enabled: true },
        { color: '#F7F6F2', enabled: true },
        { color: '#FFFDF3', enabled: true },
        { color: '#F7F6F2', enabled: true },
        { color: '#196AD8', enabled: true },
        { color: '#FF9191', enabled: true },
      ],
      speed: 2.5,
      horizontalPressure: 3,
      verticalPressure: 4,
      waveFrequencyX: 2,
      waveFrequencyY: 3,
      waveAmplitude: 5,
      secondaryWaveEnabled: false,
      secondaryWaveFrequencyX: 3,
      secondaryWaveFrequencyY: 3,
      secondaryWaveAmplitude: 5,
      secondaryWaveSpeed: 0.6,
      secondaryWaveAngle: 1,
      shadows: 1,
      highlights: 5,
      colorBrightness: 1,
      colorSaturation: 7,
      wireframe: false,
      antialias: false,
      colorBlending: 8,
      backgroundColor: '#003FFF',
      backgroundAlpha: 1,
      grainScale: 0,
      grainSparsity: 0,
      grainIntensity: 0,
      grainSpeed: 1,
      resolution: 1,
      yOffset: -26943,
      yOffsetWaveMultiplier: 4,
      yOffsetColorMultiplier: 4,
      yOffsetFlowMultiplier: 4,
      flowDistortionA: 0,
      flowDistortionB: 0,
      flowScale: 1,
      flowEase: 0,
      flowEnabled: true,
      enableProceduralTexture: false,
      transparentTextureVoid: false,
      textureMode: 'bitmap',
      bakeEdgeSoftness: 1,
      textureVoidLikelihood: 0.45,
      textureVoidWidthMin: 200,
      textureVoidWidthMax: 486,
      textureBandDensity: 2.15,
      textureColorBlending: 0.01,
      textureSeed: 333,
      textureEase: 0.5,
      proceduralBackgroundColor: '#000000',
      textureShapeTriangles: 20,
      textureShapeCircles: 15,
      textureShapeBars: 15,
      textureShapeSquiggles: 10,
      domainWarpEnabled: false,
      domainWarpIntensity: 0,
      domainWarpScale: 3,
      vignetteIntensity: 0,
      vignetteRadius: 0.8,
      fresnelEnabled: false,
      fresnelPower: 2,
      fresnelIntensity: 0.5,
      fresnelColor: '#FFFFFF',
      iridescenceEnabled: false,
      iridescenceIntensity: 0.5,
      iridescenceSpeed: 1,
      prismEdgeEnabled: false,
      prismEdgeIntensity: 0.5,
      prismEdgeThinness: 3,
      prismEdgeSpread: 1,
      prismEdgeSpeed: 0.5,
      prismEdgeRipple: 1,
      bloomIntensity: 0,
      bloomThreshold: 0.7,
      chromaticAberration: 0,
      shapeType: 'plane',
      shapeRotationX: 0,
      shapeRotationY: 0,
      shapeRotationZ: 0,
      shapeAutoRotateSpeedX: 0,
      shapeAutoRotateSpeedY: 0,
      sphereRadius: 15,
      torusRadius: 15,
      torusTube: 5,
      cylinderRadius: 10,
      cylinderHeight: 40,
      planeBend: 0,
      planeTwist: 0,
      silhouetteFade: 0.25,
      cylinderFade: 0.08,
      ribbonFade: 0.05,
      flatShading: true,
      cameraLock: true,
      cameraX: 0,
      cameraY: 0,
      cameraZ: 0,
      cameraRotationX: 0,
      cameraRotationY: 0,
      cameraRotationZ: 0,
      cameraZoom: 1,
    };

    gradientRef.current = new NeatGradient({
      ref: canvasRef.current,
      ...(config as any),
    });

    const handleScroll = () => {
      if (gradientRef.current) {
        gradientRef.current.yOffset = window.scrollY;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      gradientRef.current?.destroy();
    };
  }, []);

  // Cursor-reactive global window tracking logic for search bar glow
  const glowWrapRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const targetGlowRef = useRef({ mx: 400, my: 30, strength: 0.55, r: 65, g: 99, b: 236 });
  const currentGlowRef = useRef({ mx: 400, my: 30, strength: 0.55, r: 65, g: 99, b: 236 });
  const [isApproach, setIsApproach] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const handleGlobalPointerMove = (e: PointerEvent) => {
      if (!searchContainerRef.current || !glowWrapRef.current) return;

      const wrapRect = glowWrapRef.current.getBoundingClientRect();
      const containerRect = searchContainerRef.current.getBoundingClientRect();

      const px = e.clientX - wrapRect.left;
      const py = e.clientY - wrapRect.top;

      const dx = Math.max(containerRect.left - e.clientX, 0, e.clientX - containerRect.right);
      const dy = Math.max(containerRect.top - e.clientY, 0, e.clientY - containerRect.bottom);
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Ambient 0.50 brightness across full screen (1200px range), smoothly ramping up to 1.0 when near
      const proximity = Math.max(0, Math.min(1, 1 - dist / 1200));
      const strength = 0.50 + 0.50 * (proximity * proximity);

      setIsApproach(dist < 180);

      // Horizontal color interpolation: Blue (#4163EC) on left -> Pink (#AA3040) on right
      const f = Math.max(0, Math.min(1, (e.clientX - containerRect.left) / containerRect.width));
      const r = Math.round(65 + f * (170 - 65));
      const g = Math.round(99 + f * (48 - 99));
      const b = Math.round(236 + f * (64 - 236));

      targetGlowRef.current = { mx: px, my: py, strength, r, g, b };
    };

    window.addEventListener("pointermove", handleGlobalPointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", handleGlobalPointerMove);
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (prefersReducedMotion) return;

    let rafId: number;

    const loop = () => {
      const target = targetGlowRef.current;
      const current = currentGlowRef.current;

      current.mx += (target.mx - current.mx) * 0.15;
      current.my += (target.my - current.my) * 0.15;
      current.strength += (target.strength - current.strength) * 0.15;
      current.r += (target.r - current.r) * 0.15;
      current.g += (target.g - current.g) * 0.15;
      current.b += (target.b - current.b) * 0.15;

      if (glowWrapRef.current) {
        glowWrapRef.current.style.setProperty("--mx", `${current.mx.toFixed(1)}px`);
        glowWrapRef.current.style.setProperty("--my", `${current.my.toFixed(1)}px`);
        glowWrapRef.current.style.setProperty("--glow-strength", current.strength.toFixed(3));
        glowWrapRef.current.style.setProperty(
          "--glow-color",
          `${Math.round(current.r)}, ${Math.round(current.g)}, ${Math.round(current.b)}`
        );
      }

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [prefersReducedMotion]);


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

  // Close dropdown on click outside and reset search query
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsPulseActive(false);
        setSearchQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Set glow effect SVG rect rx dynamically from computed border-radius + 6px offset for outside glow
  useEffect(() => {
    if (searchContainerRef.current) {
      const computedRx = parseFloat(window.getComputedStyle(searchContainerRef.current).borderRadius) || 27;
      const rx = `${computedRx + 6}px`;
      const rects = searchContainerRef.current.querySelectorAll<SVGRectElement>(`.${styles.glowBlur}, .${styles.glowLine}`);
      rects.forEach(rect => rect.setAttribute("rx", rx));
    }
  }, [isOpen]);

  return (
    <section className={styles.hero} id="hero-section-search-first">
      {/* NeatGradient animated mesh background */}
      <canvas ref={canvasRef} className={styles.neatCanvas} />
      <div className={`${styles.videoOverlay} ${isOpen ? styles.videoOverlayActive : ""}`} />
      <PixelRipple trigger={showPixelRipple} />

      <div className={styles.centerWrap}>
        <div className={styles.heroStack}>
          <div className={`${styles.titleUnit} ${isOpen ? styles.titleHidden : ""}`}>
            <motion.h1
              className={styles.headline}
              initial={{ opacity: 0, y: 22, filter: "blur(16px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 0.2, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            >
              Trusted Care, Every Day
            </motion.h1>
            <motion.p 
              className={styles.subHeadline}
              initial={{ opacity: 0, y: 22, filter: "blur(16px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 0.45, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            >
              Compassion Backed by Expertise
            </motion.p>
            
          </div>

<motion.form
                    ref={searchRef}
                    onSubmit={handleSearch}
                    className={`${styles.searchBarForm} ${isOpen ? styles.searchBarFormActive : ""}`}
                    initial={{ opacity: 0, y: 22, filter: "blur(16px)" }}
                    animate={{ 
                      opacity: 1,
                      y: 0,
                      filter: "blur(0px)"
                    }}
                    transition={
                      hasOpened 
                        ? { duration: 0.2, ease: "easeOut" } 
                        : { delay: 0.7, duration: 1.2, ease: [0.16, 1, 0.3, 1] }
                    }
                  >
                    {!isPulseActive && (
                      <div
                        ref={glowWrapRef}
                        className={`${styles.glowWrap} ${isApproach ? styles.glowWrapApproach : ""}`}
                      >
                        <div className={styles.searchGlow} aria-hidden="true" />
                        <div ref={searchContainerRef} className={`${styles.searchContainer} ${styles.glow} ${isOpen ? styles.searchContainerActive : ""}`}>
                          <svg className={styles.glowContainer}>
                            <rect pathLength={100} strokeLinecap="round" className={styles.glowBlur} />
                            <rect pathLength={100} strokeLinecap="round" className={styles.glowLine} />
                          </svg>
                          <div className={styles.searchIconWrapper}>
                            <Search className={styles.searchIcon} size={18} />
                          </div>
                          <input
                            type="text"
                            placeholder="Book Doctors, Find Specialities or Treatments.."
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
                              if (!isOpen) {
                                setIsOpen(true);
                                setHasOpened(true);
                                e.preventDefault();
                                return;
                              }
                              setIsPulseActive(true);
                            }}
                          >
                            <Lottie animationData={pulseAnimation} className={styles.pulseIcon} loop={true} />
                            <span className={styles.pulseText}>Ask Pulse</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Progressive Search Dropdown */}
                    <AnimatePresence mode="wait">
                      {isPulseActive ? (
                        <motion.div
                          key="pulse-workspace"
                          className={styles.pulseWorkspaceContainer}
                          initial={{ height: 56, opacity: 0.5 }}
                          animate={{ height: "75vh", opacity: 1 }}
                          exit={{ height: 56, opacity: 0 }}
                          transition={{ duration: 0.4, ease: "easeInOut" }}
                        >
                           <PulseAIWorkspace onClose={() => setIsPulseActive(false)} />
                        </motion.div>
                      ) : isOpen ? (
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
                </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </motion.form>



        </div>
      </div>

      {/* Auto-Moving 3-Tile Video Carousel (Strict Unidirectional Leftward Flow) */}
      <motion.div 
        className={`${styles.heroCarouselSection} ${isOpen ? styles.heroCarouselHidden : ""}`}
        initial={{ opacity: 0, y: 30, filter: "blur(18px)" }}
        animate={{ 
          opacity: isOpen ? 0 : 1, 
          y: isOpen ? 40 : 0, 
          filter: isOpen ? "blur(8px)" : "blur(0px)" 
        }}
        transition={
          isOpen
            ? { duration: 0.35, ease: "easeOut" }
            : { delay: 0.95, duration: 1.3, ease: [0.16, 1, 0.3, 1] }
        }
      >
        <div className={styles.carouselStage}>
          {[-1, 0, 1, 2, 3].map((slotOffset) => {
            const k = step + slotOffset;
            const dataIndex = ((k % carouselItems.length) + carouselItems.length) % carouselItems.length;
            const item = carouselItems[dataIndex];

            const isCenter = slotOffset === 1;
            const isLeft   = slotOffset === 0;
            const isRight  = slotOffset === 2;

            // ── Pixel layout calculation ─────────────────────────
            const GAP = 16;
            const centerW = Math.round(Math.min(Math.max(windowWidth * 0.42, 420), 720));
            const sideW   = Math.round((windowWidth - centerW - GAP * 2) / 2);
            const centerH = Math.round(Math.min(Math.max(windowWidth * 0.28, 240), 370));
            const sideH   = Math.round(Math.min(Math.max(windowWidth * 0.21, 180), 280));

            const leftPos   = 0;
            const centerPos = sideW + GAP;
            const rightPos  = sideW + GAP + centerW + GAP;

            let targetLeft = 0;
            let targetWidth = sideW;
            let targetHeight = sideH;
            let targetOpacity = 0.55;
            let targetFilter = "brightness(0.6)";

            if (slotOffset === -1) {
              // Exiting off-screen to the left
              targetLeft = -sideW - 60;
              targetWidth = sideW;
              targetHeight = sideH;
              targetOpacity = 0;
              targetFilter = "blur(8px) brightness(0.4)";
            } else if (slotOffset === 0) {
              // Left side position
              targetLeft = leftPos;
              targetWidth = sideW;
              targetHeight = sideH;
              targetOpacity = 0.55;
              targetFilter = "brightness(0.6)";
            } else if (slotOffset === 1) {
              // Center focused position
              targetLeft = centerPos;
              targetWidth = centerW;
              targetHeight = centerH;
              targetOpacity = 1;
              targetFilter = "brightness(1)";
            } else if (slotOffset === 2) {
              // Right side position
              targetLeft = rightPos;
              targetWidth = sideW;
              targetHeight = sideH;
              targetOpacity = 0.55;
              targetFilter = "brightness(0.6)";
            } else if (slotOffset === 3) {
              // Entering off-screen from the right
              targetLeft = windowWidth + 80;
              targetWidth = sideW;
              targetHeight = sideH;
              targetOpacity = 0;
              targetFilter = "blur(8px) brightness(0.4)";
            }

            let initialLeft = targetLeft;
            let initialOpacity = targetOpacity;
            let initialFilter = targetFilter;

            if (slotOffset === 3) {
              initialLeft = windowWidth + 120;
              initialOpacity = 0;
              initialFilter = "blur(8px) brightness(0.4)";
            } else if (slotOffset === -1) {
              initialLeft = -sideW - 120;
              initialOpacity = 0;
              initialFilter = "blur(8px) brightness(0.4)";
            }

            const r = 13.529;
            const borderRadiusVal = isLeft
              ? `0 ${r}px 0 0`
              : isRight
              ? `${r}px 0 0 0`
              : `${r}px ${r}px 0 0`;

            return (
              <motion.div
                key={k}
                className={`${styles.carouselCard} ${isCenter ? styles.carouselCardActive : styles.carouselCardInactive}`}
                initial={{
                  left:         initialLeft,
                  width:        targetWidth,
                  height:       targetHeight,
                  borderRadius: borderRadiusVal,
                  opacity:      initialOpacity,
                  filter:       initialFilter,
                  zIndex:       isCenter ? 10 : 5,
                }}
                animate={{
                  left:         targetLeft,
                  width:        targetWidth,
                  height:       targetHeight,
                  borderRadius: borderRadiusVal,
                  opacity:      targetOpacity,
                  filter:       targetFilter,
                  zIndex:       isCenter ? 10 : 5,
                }}
                transition={{
                  duration: 1.15,
                  ease: [0.22, 1, 0.36, 1],
                }}
                onAnimationComplete={() => {
                  if (isCenter) setIsTransitioning(false);
                }}
                onClick={() => {
                  if (isRight) {
                    setIsTransitioning(true);
                    setStep((prev) => prev + 1);
                  } else if (isLeft) {
                    setIsTransitioning(true);
                    setStep((prev) => prev - 1);
                  }
                }}
              >
                <video
                  ref={(el) => {
                    if (!el) return;
                    if (isCenter && !isOpen) {
                      el.play().catch(() => {});
                    } else {
                      el.pause();
                      el.currentTime = 0;
                    }
                  }}
                  src={item.videoSrc}
                  poster={item.poster}
                  muted
                  loop
                  playsInline
                  className={styles.carouselVideo}
                  style={{ objectPosition: 'center', transform: 'scale(1.20)' }}
                />
                <div className={styles.carouselOverlay} />
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Aesthetic Bottom Corner Blur Frame Overlays */}
      <div className={styles.bottomLeftBlurFrame} aria-hidden="true" />
      <div className={styles.bottomRightBlurFrame} aria-hidden="true" />
    </section>
  );
}
