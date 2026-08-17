"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Send, Mic, Plus, Calendar, FileText, Heart,
  MessageSquare, Clock, ChevronRight, History,
  Stethoscope, MapPin, Star, ArrowUpRight, Paperclip,
  User, Activity, FlaskConical, AlertCircle, CheckCircle,
  TrendingUp, Brain, Pill, Video, RefreshCw,
  MoreHorizontal, Copy, ThumbsUp, ThumbsDown, BookOpen,
  Phone, Upload, ChevronDown, Hospital, ArrowLeft, ChevronUp,
  Crown, Tag, Coins, Shield, Sparkles, Maximize2, Minimize2
} from "lucide-react";
import styles from "./PulseAIWorkspace.module.css";
import lottie from "lottie-web";
import PixelRipple from "../home/PixelRipple";

function LottieAnimation({ animationPath, width = 60, height = 60 }: { animationPath: string; width?: number; height?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const anim = lottie.loadAnimation({
      container: containerRef.current,
      renderer: "svg",
      loop: true,
      autoplay: true,
      path: animationPath
    });
    return () => anim.destroy();
  }, [animationPath]);

  return <div ref={containerRef} style={{ width, height, display: "flex", alignItems: "center", justifyContent: "center" }} />;
}

/* ─── TYPES ──────────────────────────────────────────────── */
type MsgRole = "user" | "ai";
type RespType =
  | "text" | "doctors" | "slot_picker" | "report"
  | "health_login" | "health_organs" | "health_analysis"
  | "booking_confirm" | "upload_state" | "triage" | "fallback"
  | "modify_selection" | "cancelled_card" | "order_summary"
  | "find_doctor_options" | "symptom_selector"
  | "inline_phone_input" | "inline_otp_input"
  | "tutorial_welcome" | "tutorial_step_report" | "tutorial_completed";

interface Doctor {
  id: string; name: string; qualification: string;
  speciality: string; hospital: string; plusHospitals?: number;
  slot: string; price: string; rating: number; photo: string;
}

interface ReportItem {
  name: string; value: string;
  status: "normal" | "high" | "low" | "borderline";
  range: string; unit: string;
}

interface FindingItem {
  text: string;
  severity: "concern" | "improving" | "normal";
  detail?: string;
  evidence?: string[];
}

interface OrganHealth {
  id: string; name: string; emoji: string; icon?: string;
  status: "needs_attention" | "moderate" | "doing_good";
  date: string; findings: FindingItem[];
  recommendedSpecialist: string; recommendation: string;
}

/* ─── ORGAN SVG ICON MAP ─────────────────────────────────── */
const organIconMap: Record<string, string> = {
  brain:        "/Icons pulse ai organs/Brain.svg",
  heart:        "/Icons pulse ai organs/Heart.svg",
  lungs:        "/Icons pulse ai organs/Lungs.svg",
  kidney:       "/Icons pulse ai organs/Kidney.svg",
  digestive:    "/Icons pulse ai organs/Digestive.svg",
  bones:        "/Icons pulse ai organs/Bones.svg",
  immunity:     "/Icons pulse ai organs/Immunity.svg",
  skin:         "/Icons pulse ai organs/Skin.svg",
  endocrine:    "/Icons pulse ai organs/Hormones.svg",
  reproductive: "/Icons pulse ai organs/Reproductive.svg",
};

interface TriagePathway {
  title: string;
  desc: string;
  ctaText: string;
  actionType: "er" | "video" | "consult";
  dept?: string;
}

interface OrderSummaryData {
  doctor: Doctor;
  slot: string;
  visitType: string;
  clinicName: string;
  fee: number;
}

interface FindDoctorOptionItem {
  title: string;
  badge: string;
  prompt: string;
  photo?: string;
  icon?: string;
}

interface Message {
  id: string; role: MsgRole; text: string; ts: Date;
  rtype?: RespType;
  doctors?: Doctor[];
  slotDoctor?: Doctor;
  orderSummaryData?: OrderSummaryData;
  reportItems?: ReportItem[];
  reportNote?: string;
  followUps?: string[];
  isThinking?: boolean;
  uploadStage?: "uploading" | "analyzing";
  uploadFileName?: string;
  triageUrgency?: "high" | "medium" | "low";
  triageAnalysis?: string;
  triagePathways?: TriagePathway[];
  findDoctorOptions?: {
    recommendedSpeciality: FindDoctorOptionItem;
    lastVisitedDoctor: FindDoctorOptionItem;
    subChips: { label: string; prompt: string }[];
  };
  inlinePhone?: string;
}

interface Convo {
  id: string; title: string; preview: string; ts: string;
}

/* ─── MOCK DATA ───────────────────────────────────────────── */
const MOCK_DOCTORS: Doctor[] = [
  {
    id: "d1", name: "Dr. Pradeep R Kumar", qualification: "MBBS, MD",
    speciality: "General Physician", hospital: "Mazumdar Shaw Medical Centre",
    plusHospitals: 1, slot: "Tomorrow, 02:30 PM", price: "₹800",
    rating: 4.9, photo: "/assets/doctor_1.png",
  },
  {
    id: "d2", name: "Dr. Ananya Krishnan", qualification: "MBBS, DM (Cardiology)",
    speciality: "Cardiologist", hospital: "Narayana Institute of Cardiac Sciences",
    slot: "Today, 05:00 PM", price: "₹1,200",
    rating: 4.8, photo: "/assets/doctor_2.png",
  },
  {
    id: "d3", name: "Dr. Rajiv Menon", qualification: "MBBS, MS, MCh",
    speciality: "Cardiac Surgeon", hospital: "Mazumdar Shaw Medical Centre",
    plusHospitals: 2, slot: "Thu, 10:00 AM", price: "₹1,500",
    rating: 4.95, photo: "/assets/doctor_1.png",
  },
  {
    id: "d4", name: "Dr. Vikas Yadav", qualification: "MBBS, MD (Nephrology)",
    speciality: "Nephrologist", hospital: "Mazumdar Shaw Medical Centre",
    slot: "Today, 04:00 PM", price: "₹1,000",
    rating: 4.85, photo: "/assets/doctor_1.png",
  },
  {
    id: "d5", name: "Dr. Rammaya Murthey", qualification: "MBBS, MD, FNB",
    speciality: "General Physician", hospital: "Narayana Institute of Cardiac Sciences",
    slot: "Tomorrow, 11:30 AM", price: "₹900",
    rating: 4.9, photo: "/assets/doctor_2.png",
  },
  {
    id: "d6", name: "Dr. Sonakshi Sinha", qualification: "MBBS, MD, DM (Cardiology)",
    speciality: "Cardiologist", hospital: "Narayana Institute of Cardiac Sciences",
    slot: "Tomorrow, 02:00 PM", price: "₹1,100",
    rating: 4.85, photo: "/assets/doctor_2.png",
  },
];

const MOCK_REPORT: ReportItem[] = [
  { name: "Hemoglobin",            value: "13.2", unit: "g/dL",  status: "normal",     range: "12.0 – 17.0" },
  { name: "Blood Sugar (Fasting)", value: "112",  unit: "mg/dL", status: "borderline", range: "70 – 100"    },
  { name: "Total Cholesterol",     value: "198",  unit: "mg/dL", status: "normal",     range: "< 200"       },
  { name: "LDL Cholesterol",       value: "128",  unit: "mg/dL", status: "borderline", range: "< 100"       },
  { name: "Creatinine",            value: "0.9",  unit: "mg/dL", status: "normal",     range: "0.6 – 1.2"   },
  { name: "TSH",                   value: "2.4",  unit: "mIU/L", status: "normal",     range: "0.4 – 4.0"   },
];

const ORGAN_HEALTH: OrganHealth[] = [
  {
    id: "brain",
    name: "Brain & Spine",
    emoji: "🧠",
    status: "needs_attention",
    date: "Nov 2024",
    findings: [
      { text: "Left hand tremors during testing", severity: "concern", detail: "Shaking in your left hand during fine motor skill evaluations.", evidence: ["Motor Skills Test (Nov 2024)"] },
      { text: "Reflexes reduced in lower limbs", severity: "concern", detail: "Bilateral reflex reduction in Achilles and patellar response.", evidence: ["Neurological Reflex Exam (Nov 2024)"] },
      { text: "Mild cervical spine compression", severity: "improving", detail: "Cervical spine compression shows slight improvement with physical therapy.", evidence: ["MRI Cervical Spine (Oct 2024)"] },
      { text: "Cognitive processing speed normal", severity: "normal", detail: "Executive functioning and reaction times remain within healthy limits." }
    ],
    recommendedSpecialist: "Neurologist",
    recommendation: "Evaluation of left hand tremors and neck compression to rule out early cervical radiculopathy."
  },
  {
    id: "heart",
    name: "Heart & Vessels",
    emoji: "🫀",
    status: "moderate",
    date: "Nov 2024",
    findings: [
      { text: "Blood pressure borderline (128/82)", severity: "improving", detail: "BP is in the pre-hypertension range. Improving compared to last reading (132/86).", evidence: ["Vitals Log (Nov 2024)"] },
      { text: "Total cholesterol at upper limit", severity: "concern", detail: "Serum cholesterol measured at 198 mg/dL, bordering high range.", evidence: ["Lipid Panel (Nov 2024)"] },
      { text: "Normal sinus rhythm on ECG", severity: "normal", detail: "Standard 12-lead electrocardiogram indicates healthy sinus activity with no arrhythmias." },
      { text: "Resting heart rate stable at 72 bpm", severity: "normal", detail: "Consistent pulse rates observed across multiple rest intervals." }
    ],
    recommendedSpecialist: "Cardiologist",
    recommendation: "Mild dyslipidemia and pre-hypertension noted. Dietary optimization and lipid profile follow-up recommended."
  },
  {
    id: "lungs",
    name: "Lungs",
    emoji: "🫁",
    status: "needs_attention",
    date: "Nov 2024",
    findings: [
      { text: "Mild bronchial wall thickening", severity: "concern", detail: "Chest radiograph indicates mild peribronchial cuffing, suggesting inflammation.", evidence: ["Chest X-Ray (Nov 2024)"] },
      { text: "Frequent seasonal dry cough", severity: "concern", detail: "Patient reported recurring dry cough episodes, especially during autumn.", evidence: ["Symptom Diary (Oct 2024)"] },
      { text: "Oxygen saturation optimal at 98%", severity: "normal", detail: "Resting pulse oximetry shows excellent oxygen perfusion levels." },
      { text: "Symmetric chest expansion", severity: "normal", detail: "Bilateral lung expansion is equal and chest wall excursions are normal." }
    ],
    recommendedSpecialist: "Pulmonologist",
    recommendation: "Evaluation of bronchial thickening and assessment for hyper-reactive airway disease."
  },
  {
    id: "kidney",
    name: "Kidney & Urinary",
    emoji: "🫘",
    status: "needs_attention",
    date: "Nov 2024",
    findings: [
      { text: "Post-void residual volume elevated", severity: "concern", detail: "Ultrasound shows post-void residual urine volume of 120ml (borderline high).", evidence: ["Pelvic Ultrasound (Nov 2024)"] },
      { text: "History of recurrent UTIs", severity: "concern", detail: "Patient has logged 3 urinary tract infections within the last 12 months.", evidence: ["Patient Records"] },
      { text: "Serum creatinine normal (0.9 mg/dL)", severity: "normal", detail: "Kidney waste clearance is healthy and within normal laboratory ranges." },
      { text: "eGFR optimal at 95 mL/min/1.73m²", severity: "normal", detail: "Estimated glomerular filtration rate indicates healthy renal function." }
    ],
    recommendedSpecialist: "Urologist",
    recommendation: "Urological review of post-void residual volume to manage history of recurrent UTIs."
  },
  {
    id: "digestive",
    name: "Digestive System",
    emoji: "🍏",
    status: "moderate",
    date: "Nov 2024",
    findings: [
      { text: "Mild fatty liver (Grade 1)", severity: "concern", detail: "Ultrasonic liver examination reveals mild echogenicity changes consistent with fatty infiltration.", evidence: ["Abdominal Ultrasound (Nov 2024)"] },
      { text: "Occasional gastroesophageal reflux", severity: "concern", detail: "Heartburn and acid regurgitation reported after heavy meals.", evidence: ["Symptom Logs"] },
      { text: "Liver enzymes (ALT/AST) normal", severity: "normal", detail: "Serum transaminases are within normal biological limits, indicating no active liver cell damage." },
      { text: "Healthy bowel pattern index", severity: "normal", detail: "Self-reported digestion schedules indicate no symptoms of chronic colitis or irregular motility." }
    ],
    recommendedSpecialist: "Gastroenterologist",
    recommendation: "Evaluation of fatty liver changes; consider lifestyle modifications and liver function tracking."
  },
  {
    id: "bones",
    name: "Bones & Joints",
    emoji: "🦴",
    status: "doing_good",
    date: "Nov 2024",
    findings: [
      { text: "Vitamin D level stable (32 ng/mL)", severity: "improving", detail: "Vitamin D levels have risen from 24 ng/mL to healthy range after oral supplementation.", evidence: ["Blood Panel (Nov 2024)"] },
      { text: "Normal bone density (T-Score -0.4)", severity: "normal", detail: "DEXA scan indicates healthy bone mass, well within normal density bounds.", evidence: ["DEXA Scan (Oct 2024)"] },
      { text: "No active joint inflammation", severity: "normal", detail: "Rheumatoid factor and C-reactive protein tests are completely negative." },
      { text: "Full range of motion in joints", severity: "normal", detail: "Flexion and extension indices for hips, knees, and spine show excellent joint flexibility." }
    ],
    recommendedSpecialist: "Orthopaedist",
    recommendation: "Maintain daily calcium intake and moderate physical exercise to support healthy bone density."
  },
  {
    id: "immunity",
    name: "Immune System",
    emoji: "🛡️",
    status: "moderate",
    date: "Nov 2024",
    findings: [
      { text: "WBC count elevated (11,200/µL)", severity: "concern", detail: "White blood cell count is slightly above the reference range (4,000 - 11,000/µL).", evidence: ["CBC Report (Nov 2024)"] },
      { text: "Lymphocyte count borderline high", severity: "concern", detail: "Relative lymphocyte fraction is slightly elevated, suggesting reactive response.", evidence: ["CBC Diff (Nov 2024)"] },
      { text: "Hemoglobin level optimal (13.2 g/dL)", severity: "normal", detail: "Red blood cell indices and iron content are completely normal and healthy." },
      { text: "Platelet count normal (240,000/µL)", severity: "normal", detail: "Thrombocyte count is optimal, indicating healthy clotting capabilities." }
    ],
    recommendedSpecialist: "Immunologist",
    recommendation: "Monitor WBC count for signs of persistent inflammation or minor transient infection."
  },
  {
    id: "skin",
    name: "Skin & Hair",
    emoji: "🧴",
    status: "doing_good",
    date: "Nov 2024",
    findings: [
      { text: "Skin hydration index optimal", severity: "normal", detail: "Integumentary moisture barriers are healthy with normal lipid levels." },
      { text: "No atypical lesions or moles", severity: "normal", detail: "Dermatological screen shows no signs of abnormal melanocyte clusters or precancerous lesions." },
      { text: "Normal hair follicle density", severity: "normal", detail: "Scalp assessment shows active and healthy hair follicle cycle ratios." },
      { text: "Nail bed health is excellent", severity: "normal", detail: "No clubbing, ridging, or signs of localized fungal infection observed." }
    ],
    recommendedSpecialist: "Dermatologist",
    recommendation: "Use standard hydration moisturizers and apply sunscreen for skin barrier preservation."
  },
  {
    id: "endocrine",
    name: "Endocrine & Hormones",
    emoji: "🩸",
    status: "moderate",
    date: "Nov 2024",
    findings: [
      { text: "Fasting blood sugar high (112 mg/dL)", severity: "concern", detail: "Fasting glucose is in the pre-diabetic range (100 - 125 mg/dL).", evidence: ["Blood Panel (Nov 2024)"] },
      { text: "HbA1c level borderline (5.9%)", severity: "concern", detail: "Glycated hemoglobin indicates borderline glycemic regulation over the last 90 days.", evidence: ["HbA1c Test (Nov 2024)"] },
      { text: "TSH levels optimal (2.4 mIU/L)", severity: "normal", detail: "Thyroid stimulating hormone is in the middle of the healthy biological range." },
      { text: "Normal fasting insulin levels", severity: "normal", detail: "Insulin production is within limits, indicating no severe insulin resistance." }
    ],
    recommendedSpecialist: "Endocrinologist",
    recommendation: "Prediabetic screening parameters. Exercise and carbohydrate restriction are recommended."
  },
  {
    id: "reproductive",
    name: "Reproductive Health",
    emoji: "👤",
    status: "doing_good",
    date: "Nov 2024",
    findings: [
      { text: "Serum PSA normal (0.8 ng/mL)", severity: "normal", detail: "Prostate-specific antigen levels are low, indicating minimal risk of prostate hyperplasias.", evidence: ["PSA Panel (Nov 2024)"] },
      { text: "Hormonal profile in target range", severity: "normal", detail: "Testosterone and gonadotropin balances are appropriate for age." },
      { text: "No symptoms of urinary urgency", severity: "normal", detail: "Self-reported voiding diaries indicate healthy urinary stream and control." },
      { text: "General urogenital status normal", severity: "normal", detail: "Physical screening shows no local structural abnormalities or hernias." }
    ],
    recommendedSpecialist: "Urologist",
    recommendation: "Annual screenings are recommended to monitor age-related prostate parameters."
  }
];

const HISTORY: Convo[] = [
  { id: "h1", title: "Book cardiology appointment", preview: "Found 3 cardiologists near you…",        ts: "Today, 10:23 AM"     },
  { id: "h2", title: "Summarise blood report",       preview: "Your CBC shows borderline glucose…",   ts: "Yesterday, 3:45 PM"  },
  { id: "h3", title: "Chest pain symptoms",          preview: "Here are immediate steps to take…",    ts: "Yesterday, 11:02 AM" },
  { id: "h4", title: "Diabetes management tips",     preview: "Here's your personalised plan…",       ts: "Mon, 9:15 AM"        },
  { id: "h5", title: "Find nearest hospital",        preview: "Mazumdar Shaw Medical Centre is 2km…", ts: "Sun, 6:00 PM"        },
];

const QUICK_PROMPTS = [
  { icon: Calendar,  label: "Book Appointment",  prompt: "Book appointment",               color: "#4f46e5" },
  { icon: FileText,  label: "Summarise Report",  prompt: "Summarise my blood report",      color: "#0891b2" },
  { icon: Heart,     label: "Know Your Health",  prompt: "How is my health",               color: "#e11d48" },
];

/* ─── AI RESPONSE ENGINE ──────────────────────────────────── */
function aiResponse(q: string, isLoggedIn: boolean, userName = "Omkar"): Partial<Message> {
  const ql = q.toLowerCase();

  if (ql.startsWith("selected symptoms:")) {
    const symptoms = q.replace(/selected symptoms:/i, "").trim();
    const hasUrgent = ql.includes("breath") || ql.includes("chest") || ql.includes("heart");
    if (hasUrgent) {
      return {
        text: `⚠️ Urgent Assessment: Based on your selected symptoms (${symptoms}), there is potential cardiac/respiratory distress. We suggest consulting a Cardiologist or visiting the ER immediately.\n**We have selected our top Cardiologists in Bangalore for you below:**`,
        rtype: "doctors",
        doctors: MOCK_DOCTORS.filter(d => d.speciality.toLowerCase().includes("cardio")),
        followUps: ["Book video consultation", "Locate nearest ER", "Check medical records"]
      };
    }
    return {
      text: `Based on your selected symptoms (${symptoms}) and Bangalore's ongoing health trends, we recommend consulting a General Physician.\n**We have selected our top General Medicine specialists in Bangalore for you below:**`,
      rtype: "doctors",
      doctors: MOCK_DOCTORS.filter(d => d.speciality.toLowerCase().includes("physician") || d.speciality.toLowerCase().includes("general")),
      followUps: ["Book video consultation", "Book another speciality", "Check medical record history"]
    };
  }

  if (ql === "i have a symptom" || q.trim() === "I have been having" || q.trim() === "I have been having ") {
    return {
      text: "Express what you are feeling, or select any of these ongoing symptoms currently trending in your city (Bangalore):",
      rtype: "symptom_selector"
    };
  }

  if (ql === "i want to book an appointment") {
    return aiResponse("find doctor", isLoggedIn, userName);
  }

  if (ql === "summarize my health") {
    return aiResponse("health organs", isLoggedIn, userName);
  }

  if (ql === "analyse my reports") {
    return aiResponse("report", isLoggedIn, userName);
  }

  if (ql === "show my organ insights") {
    return aiResponse("health organs", isLoggedIn, userName);
  }

  if (ql === "upload and review my report") {
    return {
      text: "Please upload your medical report (PDF or Image) using the **'+'** button on the bottom left, and I will instantly analyze it for you.\n\nAlternatively, you can simulate a report analysis below:",
      followUps: ["Simulate blood report analysis", "Summarize my health"]
    };
  }

  if (ql === "find doctor" || ql.includes("find the right doctor") || ql === "find doctor card") {
    return {
      text: "Here are the doctors we recommend based on your previous consultations.\n\nYou can also find a doctor by describing your symptoms, choosing a specialty, or searching by doctor name.",
      rtype: "find_doctor_options",
      findDoctorOptions: {
        recommendedSpeciality: {
          title: "Book for General medicine",
          badge: "Recommended",
          prompt: "Book for General Physician"
        },
        lastVisitedDoctor: {
          title: "Book for Dr Pradeep kumar",
          badge: "Last visited",
          prompt: "Book for Dr Pradeep R Kumar",
          photo: "/images/misc/doctor_avatar_male.png"
        },
        subChips: [
          { label: "I have a symptom", prompt: "I have a symptom" },
          { label: "I know the speciality", prompt: "I know the speciality" },
          { label: "I know the doctor", prompt: "I know the doctor's name" }
        ]
      }
    };
  }

  if (ql.includes("i know the speciality") || ql.includes("choose a speciality") || ql.includes("know the speciality")) {
    return {
      text: "Which medical speciality would you like to consult?\n**Here are the primary specialities available for booking:**",
      followUps: [
        "Book for General Physician",
        "Book for Nephrologist",
        "Book for Cardiologist",
        "Book for Neurologist",
        "Book for Gastroenterologist"
      ]
    };
  }

  if (ql.includes("i know the doctor") || ql.includes("search doctor by name")) {
    return {
      text: "Which doctor would you like to book an appointment with?\n**Select from your frequent doctors or search by typing their name:**",
      followUps: [
        "Book for Dr Pradeep R Kumar",
        "Book for Dr Vikas Yadav",
        "Book for Dr Ananya Krishnan",
        "Book for Dr Sonakshi Sinha"
      ]
    };
  }

  if (ql.includes("upcoming appointments") || ql.includes("show appointments")) {
    return {
      text: "Here are your upcoming appointments.\n**You can track, reschedule or cancel your appointments anytime.**",
      followUps: ["Modify booking with Dr. Pradeep R Kumar", "Book another speciality", "Know your health"],
    };
  }

  if (ql.includes("modify booking") || ql.includes("modify appointment")) {
    return {
      text: "Sure, I can help you modify your appointment. What would you like to change?\n**Please select an option to modify your appointment.**",
      followUps: ["Reschedule appointment", "Cancel appointment", "Call support"],
    };
  }

  if (ql.includes("cancel appointment")) {
    return {
      text: "You're about to cancel this appointment.\n**Are you sure you want to continue?**",
      rtype: "modify_selection",
      followUps: ["Yes, cancel appointment", "No, keep appointment"],
    };
  }

  if (ql.includes("yes, cancel appointment")) {
    return {
      text: "Your appointment has been cancelled successfully.\nAny applicable refund details will be shared shortly.\n**Would you like help with booking another appointment or anything else?**",
      rtype: "cancelled_card",
      followUps: ["Book appointment", "Summarise report", "Know your health"],
    };
  }

  if (
    ql.includes("another speciality") || 
    ql.includes("book for general physician") || 
    ql.includes("book for nephrologist") || 
    ql.includes("book for dr vikas yadav") || 
    ql.includes("book for dr rammaya murthey") ||
    ql.includes("book another doctor")
  ) {
    if (ql.includes("general physician")) {
      return {
        text: "I understand how uncomfortable general symptoms can be and how important it is to get clarity. Based on your health record at Mazumdar Shaw Medical Centre and your primary health treatment history, we recommend starting with a General Medicine specialist.\n**We suggest booking an appointment with Dr. Pradeep R Kumar, your most visited general physician, for his next available slot tomorrow at 02:30 PM.**",
        rtype: "doctors",
        doctors: MOCK_DOCTORS.filter(d => d.speciality.toLowerCase().includes("physician") || d.speciality.toLowerCase().includes("general")),
        followUps: ["Book another speciality", "Book video consultation", "Describe symptoms"],
      };
    }
    if (ql.includes("nephrologist")) {
      return {
        text: "I know managing kidney health requires dedicated care and attention. Based on your clinical history of urinary tract procedures and your preferred location at Mazumdar Shaw Medical Centre, we recommend a Nephrologist.\n**We suggest booking an appointment with Dr. Vikas Yadav (qualification MD in Nephrology) for his next available slot today at 04:00 PM.**",
        rtype: "doctors",
        doctors: MOCK_DOCTORS.filter(d => d.speciality.toLowerCase().includes("nephrologist")),
        followUps: ["Book another speciality", "Book video consultation", "Describe symptoms"],
      };
    }
    if (ql.includes("vikas yadav")) {
      return {
        text: "I understand you are looking to check in with your neurologist. Given your history of left hand tremors and preferred clinic location at Narayana City, we recommend continuing your care path.\n**We suggest booking a follow-up with Dr. Vikas Yadav for his next available slot today at 04:00 PM.**",
        rtype: "doctors",
        doctors: MOCK_DOCTORS.filter(d => d.name.toLowerCase().includes("vikas")),
        followUps: ["Book another speciality", "Book video consultation", "Describe symptoms"],
      };
    }
    if (ql.includes("rammaya murthey")) {
      return {
        text: "I understand you want to consult Dr. Rammaya Murthey. Based on your previous general health checkups and preference for Narayana Institute of Cardiac Sciences, we recommend continuing with her.\n**We suggest booking an appointment with Dr. Rammaya Murthey for her next available slot tomorrow at 11:30 AM.**",
        rtype: "doctors",
        doctors: MOCK_DOCTORS.filter(d => d.name.toLowerCase().includes("rammaya")),
        followUps: ["Book another speciality", "Book video consultation", "Describe symptoms"],
      };
    }
    if (ql.includes("book another doctor")) {
      return {
        text: "Sure, let's find the specific doctor you want to consult with.\n**Please type out the doctor's name or medical speciality below so we can find the best match.**",
        followUps: ["Book for General Physician", "Book for Nephrologist", "Book for Dr Vikas Yadav", "Book for Dr Rammaya Murthey"],
      };
    }

    // Default "another speciality" choice screen matching mockup screenshot
    return {
      text: "I understand you want to book an appointment. Let's find the right specialist based on your wellness records.\n**Please specify your symptoms, preferred clinic, or search for a doctor directly below.**",
      followUps: [
        "Book for General Physician",
        "Book for Nephrologist",
        "Book for Dr Vikas Yadav",
        "Book for Dr Rammaya Murthey",
        "Book another doctor"
      ],
    };
  }

  if (ql.includes("book") || ql.includes("appointment") || ql.includes("doctor") || ql.includes("specialist")) {
    let matchedName = "";
    if (ql.includes("pradeep")) matchedName = "Dr. Pradeep R Kumar";
    else if (ql.includes("ananya")) matchedName = "Dr. Ananya Krishnan";
    else if (ql.includes("rajiv") || ql.includes("menon")) matchedName = "Dr. Rajiv Menon";
    else if (ql.includes("vikas") || ql.includes("yadav")) matchedName = "Dr. Vikas Yadav";
    else if (ql.includes("rammaya") || ql.includes("murthey")) matchedName = "Dr. Rammaya Murthey";
    else if (ql.includes("sonakshi") || ql.includes("sinha")) matchedName = "Dr. Sonakshi Sinha";

    if (matchedName) {
      const primaryDoc = MOCK_DOCTORS.find(d => d.name.toLowerCase().includes(matchedName.split(" ")[1].toLowerCase()));
      const restDocs = MOCK_DOCTORS.filter(d => d.id !== primaryDoc?.id);
      const sortedDocs = primaryDoc ? [primaryDoc, ...restDocs] : MOCK_DOCTORS;

      let reasonText = "";
      if (matchedName.includes("Pradeep")) {
        reasonText = "I understand you are seeking general care. Based on your history at Mazumdar Shaw Medical Centre and your most visited General Physician record, we recommend him.\n**We suggest booking an appointment with Dr. Pradeep R Kumar for his next available slot tomorrow at 02:30 PM.**";
      } else if (matchedName.includes("Ananya")) {
        reasonText = "I understand you are looking to check your cardiovascular health. Based on your history of cardiac wellness and your preference for the Narayana Institute of Cardiac Sciences, we recommend this cardiologist.\n**We suggest booking a consult with Dr. Ananya Krishnan for her next available slot today at 05:00 PM.**";
      } else if (matchedName.includes("Rajiv")) {
        reasonText = "I understand you want to review your cardiac surgery recovery. Based on your surgical history at Mazumdar Shaw Medical Centre, we recommend consulting your surgeon.\n**We suggest booking a consultation with Dr. Rajiv Menon for his next available slot on Thursday at 10:00 AM.**";
      } else if (matchedName.includes("Vikas")) {
        reasonText = "I understand you are looking to consult your neurologist. Based on your history of left hand tremors and Narayana City location preference, we recommend this specialist.\n**We suggest booking an appointment with Dr. Vikas Yadav for his next available slot today at 04:00 PM.**";
      } else if (matchedName.includes("Rammaya")) {
        reasonText = "I understand you want to consult with Dr. Rammaya Murthey. Based on your general wellness visits and preference for Narayana Institute of Cardiac Sciences, we recommend her.\n**We suggest booking an appointment with Dr. Rammaya Murthey for her next available slot tomorrow at 11:30 AM.**";
      } else if (matchedName.includes("Sonakshi")) {
        reasonText = "I understand you are looking for a cardiology follow-up. Based on your visits to Narayana Institute of Cardiac Sciences and cardiac care history, we recommend this specialist.\n**We suggest booking an appointment with Dr. Sonakshi Sinha for her next available slot tomorrow at 02:00 PM.**";
      } else {
        reasonText = `I understand you are looking to consult ${matchedName}.\n**Here is the matching doctor card below to review and schedule available timings.**`;
      }

      return {
        text: reasonText,
        rtype: "doctors",
        doctors: sortedDocs.slice(0, 3),
        followUps: ["Book video consultation", "Book another speciality", "Book another doctor", "Specify your symptoms"],
      };
    }

    // Attempt name extraction to check if user entered a specific doctor name not in our mock database
    let searchedName = "";
    if (ql.includes("dr ")) {
      const idx = ql.indexOf("dr ") + 3;
      searchedName = q.slice(idx).trim();
    } else if (ql.includes("doctor ")) {
      const idx = ql.indexOf("doctor ") + 7;
      searchedName = q.slice(idx).trim();
    }
    if (searchedName) {
      searchedName = searchedName.split(",")[0].trim();
      // Capitalize first letters for visual presentation
      const formattedName = searchedName.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
      return {
        text: `I couldn't find an exact match for "Dr. ${formattedName}".\n**You can still book an appointment by typing or selecting an option below.**`,
        followUps: [
          "Book for General Physician",
          "Book for Cardiology",
          "Book another doctor",
          "Book another speciality",
          "Specify your symptoms"
        ]
      };
    }

    // Parse search location if user searched by city/hospital location
    let searchedLocation = "";
    if (ql.includes("in ")) {
      const idx = ql.indexOf("in ") + 3;
      searchedLocation = q.slice(idx).trim();
    } else if (ql.includes("near ")) {
      const idx = ql.indexOf("near ") + 5;
      searchedLocation = q.slice(idx).trim();
    }

    if (searchedLocation) {
      searchedLocation = searchedLocation.split(",")[0].replace(/[?.]/g, "").trim();
      const formattedLoc = searchedLocation.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
      const nonBangaloreCities = ["mumbai", "delhi", "chennai", "kolkata", "pune", "hyderabad", "mysore"];
      const isOutside = nonBangaloreCities.some(city => ql.includes(city));

      if (isOutside) {
        return {
          text: `I understand you are searching for doctors in ${formattedLoc}. Currently we don't have clinics listed there. Based on your health record and preferred services, we suggest looking at our nearest hub in Bangalore.\n**We suggest booking an online video consultation or checking the specialist cards below.**`,
          rtype: "doctors",
          doctors: MOCK_DOCTORS.slice(0, 3),
          followUps: ["Book video consultation", "Book for General Physician", "Book for Nephrologist", "Book for another speciality"]
        };
      }

      return {
        text: `I understand you are looking for cardiologists near ${formattedLoc}. Based on your previous bookings and cardiac health history at the Narayana Institute of Cardiac Sciences, we have filtered local specialists.\n**We suggest selecting one of the recommended cardiologists below for a direct booking.**`,
        rtype: "doctors",
        doctors: MOCK_DOCTORS.slice(0, 3),
        followUps: [
          "Book for General Physician",
          "Book for Nephrologist",
          "Book for another speciality",
          "Specify your symptom",
          "Book video consultation"
        ]
      };
    }

    return {
      text: "I understand you are looking for top-rated specialists near you in Bangalore. Based on your preferred location and treatment history, we have highlighted the best matches.\n**We suggest choosing a specialist doctor below to review and schedule available calendar slots.**",
      rtype: "doctors", doctors: MOCK_DOCTORS.slice(0, 3),
      followUps: ["Book another speciality", "Book another doctor", "Specify your symptoms", "Book video consultation"],
    };
  }
  if (ql.includes("report") || ql.includes("summarise") || ql.includes("blood") || ql.includes("result")) {
    return {
      text: "I've analysed your latest blood report. Here's a clear summary with key flags:",
      rtype: "report", reportItems: MOCK_REPORT,
      reportNote: "⚠️ Your fasting blood sugar and LDL are slightly elevated. I recommend discussing these with a doctor at your next visit.",
      followUps: ["Book a diabetes consult", "Explain LDL levels", "Download full report", "Track over time"],
    };
  }
  if (ql.includes("health") || ql.includes("how is my") || ql.includes("organ") || ql.includes("wellness")) {
    if (!isLoggedIn) {
      return {
        text: "To access your personalised health insights, I need to verify your identity first. Your health data is securely linked to your Narayana Health account.",
        rtype: "health_login",
        followUps: ["Login to my account", "Register as new user"],
      };
    }
    return {
      text: "👋 **Hello " + userName + "**\nI've reviewed your recent health reports and prepared a quick summary.\n\nYou have a history of urinary issues treated with surgeries, and recent evaluations for Parkinson's disease and neck-related concerns.\n\n🩺 **Overall Health**\nYou're doing well overall, and most of your major organ systems appear stable based on your recent reports. A few health areas are being monitored to ensure they remain on track.\n\n👨‍⚕️ **Being Monitored**\n• **Digestive health** — Post-treatment recovery\n• **Kidney health** — Changes in urine test results\n• **Blood sugar** — Above the normal range\n• **Immune health** — Blood counts under observation\n\nTake a moment to check this out. \n\n1/10",
      rtype: "health_organs",
      followUps: ["Check for another organ health", "Specify your symptoms", "Upload report"],
    };
  }
  if (ql.includes("chest") || ql.includes("breathless") || ql.includes("heart") || ql.includes("cardiac")) {
    return {
      text: "🚨 Triage Assessment: Potential Cardiac or Respiratory Distress",
      rtype: "triage",
      triageUrgency: "high",
      triageAnalysis: "Your described symptoms (chest pain, chest pressure, or shortness of breath) indicate potential cardiovascular or respiratory distress. Immediate professional medical evaluation is recommended.",
      triagePathways: [
        {
          title: "Narayana Emergency Room (ER)",
          desc: "Go directly to the nearest Narayana Emergency block. Open 24/7 with immediate cardiology support.",
          ctaText: "Locate Nearest ER",
          actionType: "er"
        },
        {
          title: "Instant Video Consultation",
          desc: "Speak with an on-duty emergency general practitioner online in under 5 minutes for immediate guidance.",
          ctaText: "Start Video Consult",
          actionType: "video"
        },
        {
          title: "Book Cardiologist Appointment",
          desc: "Schedule an in-person diagnostic consult with a specialist if symptoms are mild or currently stable.",
          ctaText: "Select Cardiologist",
          actionType: "consult",
          dept: "Cardiology"
        }
      ],
      followUps: ["Book Cardiology Consult", "Track Vitals Snapshot", "Go to ER block", "Describe another symptom"],
    };
  }

  if (ql.includes("fever") || ql.includes("stomach") || ql.includes("headache") || ql.includes("pain") || ql.includes("cough") || ql.includes("symptom")) {
    return {
      text: "I understand how uncomfortable general symptoms like fever, pain, or discomfort can be, and how important it is to find relief quickly.\n**Based on your symptoms, we suggest booking an appointment with a General Physician for clinical evaluation, or selecting one of our top general doctors below.**",
      rtype: "doctors",
      doctors: MOCK_DOCTORS.filter(d => d.speciality.toLowerCase().includes("physician") || d.speciality.toLowerCase().includes("general")),
      followUps: ["Book video consultation", "Book another speciality", "Log symptoms", "Check health snapshot"],
    };
  }
  return {
    text: "🔍 I'm sorry, I didn't quite understand that. could you provide a little more detail?\n**Would you like help with any of these?**",
    rtype: "fallback",
    followUps: [
      "Book for General Physician",
      "Book for Nephrologist",
      "Book for Dr Vikas Yadav",
      "Book for Dr Rammaya Murthey",
      "Book another doctor",
      "Specify your symptom"
    ],
  };
}

/* ─── SPARKLE LOGO ────────────────────────────────────────── */
function SparkleIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <defs>
        <linearGradient id="sg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#8b5cf6" />
          <stop offset="50%"  stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      <path d="M16 2 L19 13 L30 16 L19 19 L16 30 L13 19 L2 16 L13 13 Z" fill="url(#sg)" />
      <circle cx="25" cy="7" r="3" fill="#06b6d4" opacity="0.7" />
      <circle cx="8"  cy="6" r="2" fill="#8b5cf6" opacity="0.5" />
    </svg>
  );
}

/* ─── THINKING DOTS ───────────────────────────────────────── */
function ThinkingDots({ label = "Checking on that…" }: { label?: string }) {
  return (
    <div className={styles.thinkingWrap}>
      <SparkleIcon size={20} />
      <div className={styles.thinkingDots}>
        {[0, 1, 2].map(i => (
          <motion.span key={i} className={styles.dot}
            animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
            transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.18 }}
          />
        ))}
        <span className={styles.thinkingLabel}>{label}</span>
      </div>
    </div>
  );
}

/* ─── DOCTOR CARD ─────────────────────────────────────────── */
function DoctorCard({ doc, onBookNow }: { doc: Doctor; onBookNow: (doc: Doctor) => void }) {
  return (
    <motion.div className={styles.doctorCard}
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      {/* Top section: Photo + Name/Specialty */}
      <div className={styles.doctorCardTop}>
        <img src={doc.photo} alt={doc.name} className={styles.doctorPhoto}
          onError={e => { (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' fill='%23e2e8f0' rx='16'/%3E%3Ccircle cx='40' cy='32' r='14' fill='%23cbd5e1'/%3E%3Cellipse cx='40' cy='64' rx='24' ry='16' fill='%23cbd5e1'/%3E%3C/svg%3E"; }}
        />
        <div className={styles.doctorMeta}>
          <div className={styles.doctorName}>{doc.name}</div>
          <div className={styles.doctorSpec}>{doc.speciality}</div>
          <div className={styles.doctorQual}>{doc.qualification}</div>
        </div>
      </div>

      {/* Middle section: Location & Red Slot Pill */}
      <div className={styles.doctorCardMiddle}>
        <div className={styles.doctorHospital}>
          <MapPin size={14} className={styles.hospitalPinIcon} />
          <span className={styles.hospitalText}>{doc.hospital}</span>
          {doc.plusHospitals && <span className={styles.plusTag}>+{doc.plusHospitals}</span>}
        </div>
        <div className={styles.slotPill}>
          <span className={styles.slotHomeIcon}>🏠</span>
          <span className={styles.slotTimeText}>{doc.slot}</span>
        </div>
      </div>

      {/* Divider */}
      <div className={styles.cardDivider} />

      {/* Bottom section: Price and Book button */}
      <div className={styles.doctorCardBottom}>
        <div className={styles.priceWrap}>
          <div className={styles.doctorPrice}>{doc.price}</div>
          <div className={styles.doctorPriceLabel}>onwards</div>
        </div>
        <button className={styles.bookNowBtn} onClick={() => onBookNow(doc)}>Book now</button>
      </div>
    </motion.div>
  );
}

/* ─── SLOT PICKER CARD ────────────────────────────────────── */
interface ClinicOption {
  id: string;
  name: string;
  area: string;
  fee: number;
  feeStr: string;
  morningSlots: { time: string; isRecommended?: boolean }[];
  afternoonSlots: { time: string; isRecommended?: boolean }[];
}

function SlotPickerCard({ doctor, onConfirm }: { doctor: Doctor; onConfirm: (details: { slot: string; type: string; clinic: string; fee: number }) => void }) {
  const [visitType, setVisitType] = useState<"hospital" | "video">("hospital");
  const [selectedDate, setSelectedDate] = useState(0);

  // Clinic options for the doctor across different hospitals in the city
  const clinicOptions: ClinicOption[] = [
    {
      id: "c1",
      name: doctor.hospital || "Mazumdar Shaw Medical Centre",
      area: "Health City, Bommasandra",
      fee: 800,
      feeStr: "₹800",
      morningSlots: [
        { time: "09:15 AM", isRecommended: true },
        { time: "10:30 AM", isRecommended: false },
        { time: "11:45 AM", isRecommended: false }
      ],
      afternoonSlots: [
        { time: "02:30 PM", isRecommended: false },
        { time: "04:00 PM", isRecommended: false },
        { time: "05:15 PM", isRecommended: false }
      ]
    },
    {
      id: "c2",
      name: "Narayana City Clinic",
      area: "HSR Layout, Sector 3",
      fee: 750,
      feeStr: "₹750",
      morningSlots: [
        { time: "08:45 AM", isRecommended: false },
        { time: "11:15 AM", isRecommended: true }
      ],
      afternoonSlots: [
        { time: "03:30 PM", isRecommended: false },
        { time: "04:45 PM", isRecommended: false }
      ]
    },
    {
      id: "c3",
      name: "Narayana Multispeciality Hospital",
      area: "Whitefield Main Rd",
      fee: 900,
      feeStr: "₹900",
      morningSlots: [
        { time: "10:00 AM", isRecommended: false },
        { time: "11:30 AM", isRecommended: false }
      ],
      afternoonSlots: [
        { time: "01:15 PM", isRecommended: false },
        { time: "06:00 PM", isRecommended: true }
      ]
    }
  ];

  const [selectedClinic, setSelectedClinic] = useState<ClinicOption>(clinicOptions[0]);

  // Video Consultation tele-health configuration
  const videoData = {
    fee: 500,
    feeStr: "₹500",
    morningSlots: [
      { time: "08:30 AM", isRecommended: false },
      { time: "11:00 AM", isRecommended: false }
    ],
    afternoonSlots: [
      { time: "01:30 PM", isRecommended: false },
      { time: "05:30 PM", isRecommended: true },
      { time: "07:15 PM", isRecommended: false }
    ]
  };

  const currentFeeStr = visitType === "hospital" ? selectedClinic.feeStr : videoData.feeStr;
  const currentNumericFee = visitType === "hospital" ? selectedClinic.fee : videoData.fee;
  const currentMorning = visitType === "hospital" ? selectedClinic.morningSlots : videoData.morningSlots;
  const currentAfternoon = visitType === "hospital" ? selectedClinic.afternoonSlots : videoData.afternoonSlots;

  const [selectedTime, setSelectedTime] = useState("09:15 AM");

  const handleClinicChange = (clinic: ClinicOption) => {
    setSelectedClinic(clinic);
    const recM = clinic.morningSlots.find(s => s.isRecommended);
    const recA = clinic.afternoonSlots.find(s => s.isRecommended);
    setSelectedTime(recM?.time || recA?.time || clinic.morningSlots[0]?.time || "09:15 AM");
  };

  const handleVisitTypeChange = (type: "hospital" | "video") => {
    setVisitType(type);
    if (type === "video") {
      const recM = videoData.morningSlots.find(s => s.isRecommended);
      const recA = videoData.afternoonSlots.find(s => s.isRecommended);
      setSelectedTime(recM?.time || recA?.time || videoData.morningSlots[0]?.time || "05:30 PM");
    } else {
      handleClinicChange(selectedClinic);
    }
  };

  const dates = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i + 1);
    return {
      day: d.getDate(),
      label: ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][d.getDay()],
      isToday: i === 0
    };
  });

  return (
    <motion.div className={styles.slotPickerCard}
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      {/* Doctor mini header */}
      <div className={styles.slotDocHeader}>
        <img src={doctor.photo} alt={doctor.name} className={styles.slotDocPhoto}
          onError={e => { (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' fill='%23f1f5f9' rx='10'/%3E%3C/svg%3E"; }} />
        <div>
          <div className={styles.slotDocName}>{doctor.name}</div>
          <div className={styles.slotDocSpec}>{doctor.speciality}</div>
          <div className={styles.slotDocHospital}><MapPin size={11} />{visitType === "hospital" ? selectedClinic.name : "Narayana Tele-Health Online"}</div>
        </div>
      </div>

      {/* Visit type toggle */}
      <div className={styles.visitToggle}>
        <button className={`${styles.visitBtn} ${visitType === "hospital" ? styles.visitBtnActive : ""}`}
          onClick={() => handleVisitTypeChange("hospital")}>
          <Hospital size={14} /> Hospital Visit
        </button>
        <button className={`${styles.visitBtn} ${visitType === "video" ? styles.visitBtnActive : ""}`}
          onClick={() => handleVisitTypeChange("video")}>
          <Video size={14} /> Video Consultation
        </button>
      </div>

      {/* Clinic branch selection (Only when Hospital Visit selected) */}
      {visitType === "hospital" && (
        <div className={styles.slotSection}>
          <div className={styles.slotSectionLabel}>
            <MapPin size={13} /> Select Preferred Clinic Branch
          </div>
          <div className={styles.clinicBranchRow}>
            {clinicOptions.map(c => (
              <button
                key={c.id}
                className={`${styles.clinicBranchBtn} ${selectedClinic.id === c.id ? styles.clinicBranchBtnActive : ""}`}
                onClick={() => handleClinicChange(c)}
              >
                <div>
                  <div className={styles.clinicBranchName}>{c.name}</div>
                  <div className={styles.clinicBranchMeta}>{c.area}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Date selector */}
      <div className={styles.slotSection}>
        <div className={styles.slotSectionLabel}><Calendar size={13} /> Select date</div>
        <div className={styles.dateRow}>
          {dates.map((d, i) => (
            <button key={i} className={`${styles.dateBtn} ${selectedDate === i ? styles.dateBtnActive : ""}`}
              onClick={() => setSelectedDate(i)}>
              <span className={styles.dateDay}>{d.label}</span>
              <span className={styles.dateDayNum}>{d.day}</span>
              {d.isToday && <span className={styles.todayChip}>Today</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Time slots */}
      <div className={styles.slotSection}>
        <div className={styles.slotSectionLabel}>
          <Clock size={13} /> Select time · {visitType === "video" ? "Online Tele-Consult" : selectedClinic.name}
        </div>
        
        {currentMorning.length > 0 && (
          <div className={styles.timeGroup}>
            <div className={styles.timeGroupLabel}>☀ Morning</div>
            <div className={styles.timeRow}>
              {currentMorning.map(s => (
                <button
                  key={s.time}
                  className={`${styles.timeBtn} ${selectedTime === s.time ? styles.timeBtnActive : ""} ${s.isRecommended ? styles.timeBtnRecommended : ""}`}
                  onClick={() => setSelectedTime(s.time)}
                >
                  {s.time}
                  {s.isRecommended && <span className={styles.recommendedTag}>✨ Recommended</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {currentAfternoon.length > 0 && (
          <div className={styles.timeGroup}>
            <div className={styles.timeGroupLabel}>🌤 Afternoon / Evening</div>
            <div className={styles.timeRow}>
              {currentAfternoon.map(s => (
                <button
                  key={s.time}
                  className={`${styles.timeBtn} ${selectedTime === s.time ? styles.timeBtnActive : ""} ${s.isRecommended ? styles.timeBtnRecommended : ""}`}
                  onClick={() => setSelectedTime(s.time)}
                >
                  {s.time}
                  {s.isRecommended && <span className={styles.recommendedTag}>✨ Recommended</span>}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Price + Confirm */}
      <div className={styles.slotFooter}>
        <div className={styles.slotPrice}>
          <span className={styles.slotPriceVal}>{currentFeeStr}</span>
          <span className={styles.slotPriceLabel}>
            • {visitType === "video" ? "Video Consultation" : selectedClinic.name} • {dates[selectedDate]?.label} {dates[selectedDate]?.day} Feb • {selectedTime}
          </span>
        </div>
        <button className={styles.confirmSlotBtn}
          onClick={() => onConfirm({
            slot: `${dates[selectedDate]?.label} ${dates[selectedDate]?.day} Feb, ${selectedTime}`,
            type: visitType,
            clinic: visitType === "hospital" ? selectedClinic.name : "Narayana Tele-Health",
            fee: currentNumericFee
          })}>
          <CheckCircle size={15} /> Confirm &amp; Proceed to Checkout
        </button>
      </div>
    </motion.div>
  );
}

/* ─── OFFICIAL NARAYANA HEALTH IN-APP BOOKING SUMMARY ─────── */
function OrderSummaryCard({
  doctor,
  slot,
  visitType,
  clinicName,
  fee,
  userName = "Omkar V",
  onPaySuccess
}: {
  doctor: Doctor;
  slot: string;
  visitType: string;
  clinicName: string;
  fee: number;
  userName?: string;
  onPaySuccess: (paymentMethod: string, netAmount: number) => void;
}) {
  const [hasAryaPlan, setHasAryaPlan] = useState(true);
  const [couponApplied, setCouponApplied] = useState(true);
  const [couponCode, setCouponCode] = useState("NH10");
  const [couponDiscount, setCouponDiscount] = useState(100);
  const [useHealthCredits, setUseHealthCredits] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const aryaFee = hasAryaPlan ? 189 : 0;
  const creditsDiscount = useHealthCredits ? 50 : 0;
  const currentCouponDisc = couponApplied ? couponDiscount : 0;

  const totalPayable = Math.max(0, fee + aryaFee - currentCouponDisc - creditsDiscount);

  const handlePay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onPaySuccess("UPI / NetBanking", totalPayable);
    }, 1000);
  };

  return (
    <motion.div className={styles.nhBookingSummaryCard}
      initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      {/* Header Bar */}
      <div className={styles.nhHeaderBar}>
        <div className={styles.nhHeaderTitleRow} style={{ marginBottom: '14px' }}>
          <span className={styles.nhHeaderTitle}>Booking summary</span>
        </div>
      </div>

      <div className={styles.nhSummaryBody}>
        {/* Appointment details */}
        <div className={styles.nhApptBox}>
          <div className={styles.nhApptDocHeader}>
            <img src={doctor.photo} alt={doctor.name} className={styles.nhDocAvatar}
              onError={e => { (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='44' height='44' viewBox='0 0 44 44'%3E%3Crect width='44' height='44' fill='%23e2e8f0' rx='10'/%3E%3C/svg%3E"; }} />
            <div style={{ flex: 1 }}>
              <div className={styles.nhDocName}>{doctor.name}</div>
              <div className={styles.nhDocSpec}>{doctor.speciality}</div>
            </div>
            <ChevronDown size={18} color="#64748b" />
          </div>

          <div className={styles.nhApptInfoList}>
            <div className={styles.nhApptInfoItem}>
              <MapPin size={14} color="#64748b" />
              <span>{visitType === "video" ? "Narayana Tele-Health Online" : clinicName || doctor.hospital}</span>
            </div>
            <div className={styles.nhApptInfoItem}>
              <Calendar size={14} color="#64748b" />
              <span>{slot}</span>
            </div>
            <div className={styles.nhApptInfoItem}>
              <User size={14} color="#64748b" />
              <span>{userName}</span>
            </div>
          </div>
        </div>

        {/* Arya Plan Banner */}
        {hasAryaPlan && (
          <div className={styles.aryaBanner}>
            <div className={styles.aryaTopRow}>
              <div className={styles.aryaLeft}>
                <Crown size={18} color="#701a75" />
                <div>
                  <div className={styles.aryaTitle}>You've added the Arya Plan!</div>
                  <div className={styles.aryaSub}>12 months plan</div>
                </div>
              </div>
              <button className={styles.aryaRemoveBtn} onClick={() => setHasAryaPlan(false)}>Remove</button>
            </div>
            <div className={styles.aryaSavedBadge}>₹1200 saved on this order</div>
          </div>
        )}

        {/* Offers and benefits section */}
        <div className={styles.offersSection}>
          <div className={styles.offersSectionTitle}>Offers and benefits</div>

          {/* Coupon Card */}
          <div className={styles.couponCard}>
            <div className={styles.couponCardTop}>
              <div className={styles.couponLeftInfo}>
                <Tag size={18} color="#034ea2" />
                <div>
                  <div className={styles.couponTitle}>COUPON CODE</div>
                  <div className={styles.couponSaveSub}>Save extra <span className={styles.couponSaveNum}>₹200</span></div>
                </div>
              </div>
              <button
                className={styles.applyPillBtn}
                onClick={() => {
                  setCouponApplied(!couponApplied);
                  if (!couponApplied) setCouponDiscount(200);
                }}
              >
                {couponApplied ? "Applied ✓" : "Apply"}
              </button>
            </div>

            <div className={styles.viewAllCouponsRow}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Sparkles size={16} color="#10b981" />
                <span>View all coupons</span>
              </div>
              <ChevronRight size={16} color="#64748b" />
            </div>
          </div>

          {/* Sponsorship card */}
          <div className={styles.sponsorshipCard}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Shield size={16} color="#034ea2" />
              <span>Apply sponsorship benefits</span>
            </div>
            <ChevronRight size={16} color="#64748b" />
          </div>

          {/* Health Credits toggle */}
          <div className={styles.healthCreditsCard}>
            <div className={styles.healthCreditsLeft}>
              <Coins size={18} color="#854d0e" />
              <span>50 Health Credits applied</span>
            </div>
            <div
              className={`${styles.toggleSwitch} ${useHealthCredits ? styles.toggleSwitchActive : ""}`}
              onClick={() => setUseHealthCredits(!useHealthCredits)}
            >
              <div className={`${styles.toggleThumb} ${useHealthCredits ? styles.toggleThumbActive : ""}`} />
            </div>
          </div>
        </div>

        {/* Payment details box */}
        <div className={styles.paymentDetailsBox}>
          <div className={styles.paymentDetailsTitle}>Payment details</div>

          <div className={styles.paymentLine}>
            <span>Consultation fee</span>
            <span>₹{fee.toLocaleString("en-IN")}</span>
          </div>

          {hasAryaPlan && (
            <div className={styles.paymentLine}>
              <span>Arya plan membership</span>
              <span>+₹189</span>
            </div>
          )}

          {couponApplied && (
            <div className={styles.paymentLineGreen}>
              <span>Discount Applied ({couponCode})</span>
              <span>-₹{couponDiscount}</span>
            </div>
          )}

          {useHealthCredits && (
            <div className={styles.paymentLineGreen}>
              <span>Health Credits Applied</span>
              <span>-₹50</span>
            </div>
          )}

          <div className={styles.paymentLineDivider} />

          <div className={styles.totalPayableLine}>
            <span>Total payable</span>
            <span>₹{totalPayable.toLocaleString("en-IN")}</span>
          </div>
        </div>

        {/* Primary CTA */}
        <button className={styles.nhPayNowBtn} onClick={handlePay} disabled={isProcessing}>
          {isProcessing ? "Processing Payment..." : `Pay ₹${totalPayable.toLocaleString("en-IN")}`}
        </button>
      </div>
    </motion.div>
  );
}



/* ─── OVERALL HEALTH AT A GLANCE (PM requested section) ─────── */
function OverallHealthGlance({ userName = "Omkar" }: { userName?: string }) {
  const attentionCount = ORGAN_HEALTH.filter(o => o.status === "needs_attention").length;
  const headline = attentionCount === 0
    ? "You're doing well overall, and most of your major organ systems appear stable based on your recent reports. A few health areas are being monitored to ensure they remain on track."
    : attentionCount <= 2
    ? "You're doing well overall, and most of your major organ systems appear stable based on your recent reports. A few health areas are being monitored to ensure they remain on track."
    : "Some areas need your attention, and some parameters are outside of normal range based on your recent reports.";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "8px 0 16px 0", color: "#1e293b", fontFamily: "inherit" }}>
      {/* Intro */}
      <div>
        <div style={{ fontSize: "15px", fontWeight: 700, color: "#1e293b", display: "flex", alignItems: "center", gap: "6px" }}>
          👋 Hello {userName}
        </div>
        <div style={{ fontSize: "14.5px", color: "#334155", marginTop: "4px", lineHeight: "1.5" }}>
          I've reviewed your recent health reports and prepared a quick summary.
        </div>
      </div>

      {/* Overall Health Section */}
      <div>
        <div style={{ fontSize: "15px", fontWeight: 700, color: "#1e293b", display: "flex", alignItems: "center", gap: "6px" }}>
          🩺 Overall Health
        </div>
        <div style={{ fontSize: "14.5px", color: "#334155", marginTop: "4px", lineHeight: "1.5" }}>
          {headline}
        </div>
      </div>

      {/* Being Monitored Section */}
      <div>
        <div style={{ fontSize: "15px", fontWeight: 700, color: "#1e293b", display: "flex", alignItems: "center", gap: "6px" }}>
          👨‍⚕️ Being Monitored
        </div>
        <ul style={{ listStyleType: "none", paddingLeft: 0, margin: "6px 0 0 0", display: "flex", flexDirection: "column", gap: "6px" }}>
          {[
            "Digestive health — Post-treatment recovery",
            "Kidney health — Changes in urine test results",
            "Blood sugar — Above the normal range",
            "Immune health — Blood counts under observation"
          ].map((item, idx) => (
            <li key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "14.5px", color: "#334155", lineHeight: "1.4" }}>
              <span style={{ color: "#64748b" }}>•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f1f5f9", paddingTop: "12px", marginTop: "4px" }}>
        <span style={{ fontSize: "14px", fontWeight: 600, color: "#475569" }}>
          Take a moment to check this out.
        </span>
        <span style={{ fontSize: "11px", fontWeight: 500, color: "#94a3b8" }}>
          1/10
        </span>
      </div>
    </div>
  );
}

/* ─── NO DATA ORGAN CARD ────────────────────────────────────── */
function NoDataOrganCard({ organName, onConsult }: { organName: string; onConsult: () => void }) {
  return (
    <div className={styles.noDataCard}>
      <div className={styles.noDataIllustration}>🩺</div>
      <div className={styles.noDataTitle}>No reports available</div>
      <div className={styles.noDataFeaturePills}>
        <div className={styles.noDataPill}>
          <div className={styles.noDataPillIcon}><Activity size={16} /></div>
          Detect early
        </div>
        <div className={styles.noDataPill}>
          <div className={styles.noDataPillIcon}><TrendingUp size={16} /></div>
          Track progress
        </div>
        <div className={styles.noDataPill}>
          <div className={styles.noDataPillIcon}><CheckCircle size={16} /></div>
          Stay protected
        </div>
      </div>
      {/* Specialist card — health checkup variant */}
      <div className={styles.specialistRec} style={{ width: "100%" }}>
        <div className={styles.specialistRecHeader}>
          <div className={styles.specialistRecIconBox}>
            <Heart size={20} color="#034ea2" />
          </div>
          <div className={styles.specialistRecHeaderText}>
            <div className={styles.specialistRecLabel}>Recommended</div>
            <div className={styles.specialistRecName}>Explore all health checkups</div>
          </div>
        </div>
        <div className={styles.specialistRecNote}>
          Complete a health checkup or upload your reports to get personalized insights for {organName}.
        </div>
        <button className={styles.consultBtn} onClick={onConsult}>Consult</button>
      </div>
    </div>
  );
}

/* ─── ORGAN CARD (right-panel detail card) ─────────────────── */
function OrganCard({ organ, onViewFindings, onConsult }: {
  organ: OrganHealth;
  onViewFindings: (o: OrganHealth) => void;
  onConsult: () => void;
}) {
  const isAttention = organ.status === "needs_attention";
  const isModerate  = organ.status === "moderate";
  const isGood      = organ.status === "doing_good";
  // Show no-data card for organs that have only "normal" findings and doing_good
  const hasNoData   = isGood && organ.findings.every(f => f.severity === "normal") && !organ.findings[0]?.evidence;

  const statusLabel    = isAttention ? "Needs attention" : isModerate ? "Moderate" : "All good";
  const statusClass    = isAttention ? styles.organStatusAlert    : isModerate ? styles.organStatusModerate : styles.organStatusGood;
  const headerBgClass  = isAttention ? styles.organCardHeaderAlert : isModerate ? styles.organCardHeaderModerate : styles.organCardHeaderGood;
  const iconBgClass    = isAttention ? styles.organIconBgAlert     : isModerate ? styles.organIconBgModerate    : styles.organIconBgGood;
  const svgSrc         = organIconMap[organ.id];

  if (hasNoData) {
    return <NoDataOrganCard organName={organ.name} onConsult={onConsult} />;
  }

  return (
    <div className={styles.organDetailCard}>
      {/* ── Gradient header strip ── */}
      <div className={`${styles.organCardHeader} ${headerBgClass}`}>
        <div className={`${styles.organCardIconBg} ${iconBgClass}`}>
          {svgSrc
            ? <img src={svgSrc} alt={organ.name} className={styles.organSvgIcon} />
            : <span className={styles.organEmoji}>{organ.emoji}</span>}
        </div>
        <div className={styles.organCardMeta}>
          <div className={styles.organCardName}>{organ.name}</div>
          <div className={`${styles.organCardStatus} ${statusClass}`}>
            <span className={`${styles.organStatusDotInline} ${
              isAttention ? styles.dotRed : isModerate ? styles.dotAmber : styles.dotGreen
            }`} />
            {statusLabel}
          </div>
        </div>
        <div className={styles.organCardDate}>
          <FileText size={11} />
          {organ.date.replace(" ", "'")}
        </div>
      </div>

      {/* ── Card body ── */}
      <div className={styles.organCardBody}>
        {/* Findings */}
        <div className={styles.findingsList}>
          {organ.findings.slice(0, 4).map((f, i) => {
            const isC = f.severity === "concern";
            const isI = f.severity === "improving";
            return (
              <div key={i} className={styles.findingItem}>
                <span className={`${styles.findingIconCircle} ${
                  isC ? styles.findingIconRed : isI ? styles.findingIconAmber : styles.findingIconGreen
                }`}>
                  {isC ? "!" : isI ? "~" : "✓"}
                </span>
                <span className={styles.findingText}>{f.text}</span>
              </div>
            );
          })}
          <button className={styles.viewFindingsBtn} onClick={() => onViewFindings(organ)}>
            View all findings
          </button>
        </div>

        {/* ── Specialist inner card (doing_good = health checkup variant) ── */}
        <div className={styles.specialistRec}>
          <div className={styles.specialistRecHeader}>
            <div className={styles.specialistRecIconBox}>
              {isGood
                ? <Heart size={20} color="#034ea2" />
                : <Stethoscope size={20} color="#034ea2" />}
            </div>
            <div className={styles.specialistRecHeaderText}>
              <div className={styles.specialistRecLabel}>
                {isGood ? "Recommended" : "Recommended specialist"}
              </div>
              <div className={styles.specialistRecName}>
                {isGood ? "Explore all health checkups" : organ.recommendedSpecialist}
              </div>
            </div>
          </div>
          <div className={styles.specialistRecNote}>{organ.recommendation}</div>
          <button className={styles.consultBtn} onClick={onConsult}>Consult</button>
        </div>
      </div>
    </div>
  );
}

/* ─── HEALTH ORGANS PANEL (sidebar + detail two-column) ─────── */
function HealthOrgansPanel({
  onViewFindings, onConsult, userName = "Omkar"
}: {
  onViewFindings: (o: OrganHealth) => void;
  onConsult: () => void;
  userName?: string;
}) {
  const [selectedId, setSelectedId] = useState("brain");
  const organ = ORGAN_HEALTH.find(o => o.id === selectedId) ?? ORGAN_HEALTH[0];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0, width: "100%", marginTop: "12px" }}>
      {/* ── Organ selector label ── */}
      <div style={{ fontSize: "12.5px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "12px" }}>
        Select an organ to see its insights
      </div>

      {/* ── Two-column layout ── */}
      <div className={styles.healthPanelLayout}>
        {/* Left sidebar */}
        <div className={styles.organSidebar}>
          <div className={styles.organSidebarList}>
            {ORGAN_HEALTH.map(o => {
              const isActive = selectedId === o.id;
              const svgSrc   = organIconMap[o.id];
              const isAttn   = o.status === "needs_attention";
              const isMod    = o.status === "moderate";
              return (
                <button
                  key={o.id}
                  className={`${styles.organSidebarItem} ${isActive ? styles.organSidebarItemActive : ""}`}
                  onClick={() => setSelectedId(o.id)}
                >
                  <div className={styles.organSidebarIconWrap}>
                    {svgSrc
                      ? <img src={svgSrc} alt={o.name} className={styles.organSidebarSvg} />
                      : <span style={{ fontSize: 22 }}>{o.emoji}</span>}
                    <span className={`${styles.organSidebarDot} ${
                      isAttn ? styles.dotRed : isMod ? styles.dotAmber : styles.dotGreen
                    }`} />
                  </div>
                  <span className={styles.organSidebarLabel}>{o.name.split(" ")[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right detail card */}
        <div className={styles.organDetailPanel}>
          <motion.div
            key={selectedId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <OrganCard organ={organ} onViewFindings={onViewFindings} onConsult={onConsult} />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

/* ─── ORGAN DETAIL POPUP ("View all findings" modal) ────────── */
function OrganDetailPopup({ organ, onClose, onConsult }: {
  organ: OrganHealth; onClose: () => void; onConsult: () => void;
}) {
  const isAttention = organ.status === "needs_attention";
  const isModerate  = organ.status === "moderate";
  const statusLabel = isAttention ? "Needs attention" : isModerate ? "Moderate" : "Doing good";
  const statusClass = isAttention ? styles.organStatusAlert : isModerate ? styles.organStatusModerate : styles.organStatusGood;
  const iconBgClass = isAttention ? styles.organIconBgAlert  : isModerate ? styles.organIconBgModerate  : styles.organIconBgGood;
  const svgSrc      = organIconMap[organ.id];

  return (
    <motion.div className={styles.detailBackdrop}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}>
      <motion.div className={styles.detailModal}
        initial={{ opacity: 0, scale: 0.93, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 24 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        onClick={e => e.stopPropagation()}>

        <button className={styles.detailClose} onClick={onClose} aria-label="Close details modal">
          <X size={18} />
        </button>

        {/* Header */}
        <div className={styles.detailHeader}>
          <div className={`${styles.detailHeaderIcon} ${iconBgClass}`}>
            {svgSrc
              ? <img src={svgSrc} alt={organ.name} className={styles.organSvgIconLg} />
              : <span style={{ fontSize: 22 }}>{organ.emoji}</span>}
          </div>
          <div>
            <div className={styles.detailHeaderName}>{organ.name}</div>
            <div className={`${styles.detailHeaderStatus} ${statusClass}`}>
              <span className={`${styles.organStatusDotInline} ${
                isAttention ? styles.dotRed : isModerate ? styles.dotAmber : styles.dotGreen
              }`} />
              {statusLabel}
            </div>
          </div>
          <div className={styles.organCardDate} style={{ marginLeft: "auto" }}>{organ.date.replace(" ", "'")}</div>
        </div>

        {/* All findings */}
        <div className={styles.detailFindings}>
          {organ.findings.map((f, i) => {
            const isC = f.severity === "concern";
            const isI = f.severity === "improving";
            return (
              <div key={i} className={styles.detailFinding}>
                <div className={styles.detailFindingHeader}>
                  <span className={`${styles.findingIconCircle} ${
                    isC ? styles.findingIconRed : isI ? styles.findingIconAmber : styles.findingIconGreen
                  }`}>
                    {isC ? "!" : isI ? "~" : "✓"}
                  </span>
                  <span className={styles.detailFindingTitle}>{f.text}</span>
                  {f.evidence && f.evidence.length > 0 && (
                    <FileText size={14} className={styles.detailFindingDocIcon} />
                  )}
                </div>
                {f.detail && <div className={styles.detailFindingDetail}>{f.detail}</div>}
                {f.evidence && f.evidence.map(ev => (
                  <div key={ev} className={styles.detailFindingEvidence}>• {ev}</div>
                ))}
              </div>
            );
          })}
        </div>

        {/* Specialist */}
        <div className={styles.detailSpecialist}>
          <div className={styles.specialistRecIconContainer}>
            <Stethoscope size={18} color="#034ea2" />
          </div>
          <div>
            <div className={styles.specialistRecLabel}>RECOMMENDED SPECIALIST</div>
            <div className={styles.specialistRecName}>{organ.recommendedSpecialist}</div>
            <div className={styles.specialistRecNote}>{organ.recommendation}</div>
          </div>
        </div>

        <button className={styles.consultBtn} onClick={onConsult}>Consult</button>
      </motion.div>
    </motion.div>
  );
}

/* ─── REPORT ROW ──────────────────────────────────────────── */
function ReportRow({ item, delay }: { item: ReportItem; delay: number }) {
  const colors: Record<string, string> = { normal: "#22c55e", high: "#ef4444", low: "#3b82f6", borderline: "#f59e0b" };
  return (
    <motion.div className={styles.reportRow}
      initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay, duration: 0.25 }}>
      <span className={styles.reportName}>{item.name}</span>
      <span className={styles.reportValue}>{item.value} <span className={styles.reportUnit}>{item.unit}</span></span>
      <span className={styles.reportRange}>{item.range}</span>
      <span className={styles.reportStatus} style={{ color: colors[item.status] }}>
        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
      </span>
    </motion.div>
  );
}

/* ─── UPLOAD STATE BUBBLE ─────────────────────────────────── */
function UploadStateBubble({ stage, fileName }: { stage: "uploading" | "analyzing"; fileName: string }) {
  return (
    <div className={styles.uploadBubble}>
      <div className={styles.uploadThumb}>
        <FileText size={28} color="#8b5cf6" />
        {stage === "uploading" && (
          <div className={styles.uploadProgressRing}>
            <motion.div className={styles.uploadProgressFill}
              animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
          </div>
        )}
      </div>
      <div className={styles.uploadInfo}>
        <div className={styles.uploadFileName}>{fileName}</div>
        <div className={styles.uploadStatus}>
          {stage === "uploading" ? "Uploading report…" : "Analysing your report…"}
        </div>
      </div>
    </div>
  );
}

/* ─── REGISTER MODAL ──────────────────────────────────────── */
function RegisterModal({ onClose, onRegister, onLoginInstead }: {
  onClose: () => void;
  onRegister: () => void;
  onLoginInstead: () => void;
}) {
  const [name, setName]       = useState("");
  const [gender, setGender]   = useState<"male" | "female" | "other" | "">("");
  const [phone, setPhone]     = useState("");
  const [email, setEmail]     = useState("");
  const [pincode, setPincode] = useState("");

  const canSubmit = name && gender && phone.length === 10;

  return (
    <motion.div className={styles.modalBackdrop}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className={styles.loginModal}
        initial={{ opacity: 0, scale: 0.9, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 24 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        onClick={e => e.stopPropagation()}>
        <button className={styles.modalCloseBtn} onClick={onClose} aria-label="Close"><X size={18} /></button>

        <div className={styles.modalBrand}>
          <div className={styles.modalBrandLogo}><Heart size={22} color="#fff" fill="#fff" /></div>
          <span className={styles.modalBrandName}>Narayana Health</span>
        </div>

        <div className={styles.registerNotice}>
          <AlertCircle size={13} />
          A one-time registration fee of ₹22 applies for new members. If you&apos;re already registered, link using MRN.
        </div>

        <h2 className={styles.modalTitle}>Register New Member</h2>
        <p className={styles.modalSubtitle}>Add member details to complete your booking</p>

        <div className={styles.registerForm}>
          <div className={styles.registerField}>
            <label className={styles.registerLabel}>Name *</label>
            <input type="text" placeholder="Full name" value={name}
              onChange={e => setName(e.target.value)} className={styles.registerInput} />
          </div>
          <div className={styles.registerField}>
            <label className={styles.registerLabel}>Gender *</label>
            <div className={styles.genderToggle}>
              {(["Male", "Female", "Others"] as const).map(g => (
                <button key={g}
                  className={`${styles.genderBtn} ${gender === g.toLowerCase() ? styles.genderBtnActive : ""}`}
                  onClick={() => setGender(g.toLowerCase() as any)}>{g}</button>
              ))}
            </div>
          </div>
          <div className={styles.registerField}>
            <label className={styles.registerLabel}>Mobile number *</label>
            <div className={styles.phoneInputWrap}>
              <span className={styles.phonePrefix}><Phone size={14} /> +91</span>
              <input type="tel" placeholder="9876543210" value={phone} maxLength={10}
                onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                className={styles.phoneInput} />
            </div>
            <div className={styles.registerHint}>All communications will be done on this mobile number</div>
          </div>
          <div className={styles.registerField}>
            <label className={styles.registerLabel}>Email</label>
            <input type="email" placeholder="Email (optional)" value={email}
              onChange={e => setEmail(e.target.value)} className={styles.registerInput} />
          </div>
          <div className={styles.registerField}>
            <label className={styles.registerLabel}>Pincode *</label>
            <input type="text" placeholder="560001" value={pincode} maxLength={6}
              onChange={e => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className={styles.registerInput} />
          </div>
        </div>

        <button className={styles.modalCtaBtn} disabled={!canSubmit}
          onClick={() => canSubmit && onRegister()}>
          <CheckCircle size={16} /> Submit
        </button>

        <button className={styles.modalChangeLink} onClick={onLoginInstead}>
          Already a registered member? <strong>Link using MRN</strong>
        </button>

        <p className={styles.modalDisclaimer}>
          By continuing, you agree to our{" "}
          <a href="#" className={styles.modalLink}>Terms of Service</a> &amp;{" "}
          <a href="#" className={styles.modalLink}>Privacy Policy</a>
        </p>
      </motion.div>
    </motion.div>
  );
}

/* ─── LOGIN MODAL ─────────────────────────────────────────── */
function LoginModal({ onClose, onLogin }: { onClose: () => void; onLogin: () => void }) {
  const [phone, setPhone] = useState("");
  const [step, setStep]   = useState<"phone" | "otp">("phone");
  const [otp, setOtp]     = useState(["", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const otpRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null),
                   useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  const handleOtpChange = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    setError(null);
    const next = [...otp]; next[i] = val; setOtp(next);
    if (val && i < 3) otpRefs[i + 1].current?.focus();
  };
  const handleOtpKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) otpRefs[i - 1].current?.focus();
  };

  const handleVerify = () => {
    const enteredOtp = otp.join("");
    if (enteredOtp !== "9999") {
      setError("Invalid OTP. Please use code 9999.");
      return;
    }
    setError(null);
    onLogin();
  };

  const canProceed = step === "phone" ? phone.length === 10 : otp.every(d => d !== "");

  return (
    <motion.div className={styles.modalBackdrop}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className={styles.loginModal}
        initial={{ opacity: 0, scale: 0.9, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 24 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        onClick={e => e.stopPropagation()}>
        <button className={styles.modalCloseBtn} onClick={onClose} aria-label="Close"><X size={18} /></button>
        <div className={styles.modalBrand}>
          <div className={styles.modalBrandLogo}><Heart size={22} color="#fff" fill="#fff" /></div>
          <span className={styles.modalBrandName}>Narayana Health</span>
        </div>
        <h2 className={styles.modalTitle}>{step === "phone" ? "Login to continue" : "Verify your number"}</h2>
        <p className={styles.modalSubtitle}>
          {step === "phone" ? "Sign in to book appointments, tests & health checkups" : `Enter the 4-digit OTP sent to +91 ${phone}`}
        </p>
        {step === "phone" ? (
          <div className={styles.modalForm}>
            <div className={styles.phoneInputWrap}>
              <span className={styles.phonePrefix}><Phone size={14} /> +91</span>
              <input type="tel" placeholder="Enter 10-digit mobile number" value={phone} maxLength={10}
                onChange={e => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                  setPhone(val);
                }}
                className={styles.phoneInput} autoFocus />
            </div>
            <button className={styles.modalCtaBtn} onClick={() => {
              if (canProceed) {
                setStep("otp");
                setError(null);
                if (phone === "9999999999") {
                  setOtp(["9", "9", "9", "9"]);
                }
              }
            }} disabled={!canProceed}>
              Send OTP <ArrowUpRight size={16} />
            </button>
          </div>
        ) : (
          <div className={styles.modalForm}>
            <div className={styles.otpRow}>
              {otp.map((d, i) => (
                <input key={i} ref={otpRefs[i]} type="text" inputMode="numeric" maxLength={1} value={d}
                  onChange={e => handleOtpChange(i, e.target.value)} onKeyDown={e => handleOtpKey(i, e)}
                  className={styles.otpBox} autoFocus={i === 0} />
              ))}
            </div>
            {error && <div className={styles.otpErrorMsg}>{error}</div>}
            <button className={styles.modalCtaBtn} onClick={handleVerify} disabled={!canProceed}>
              <CheckCircle size={16} /> Verify & Proceed
            </button>
            <button className={styles.modalChangeLink} onClick={() => { setStep("phone"); setOtp(["","","",""]); setError(null); }}>
              Change number
            </button>
          </div>
        )}
        <p className={styles.modalDisclaimer}>
          By continuing, you agree to our <a href="#" className={styles.modalLink}>Terms</a> &amp; <a href="#" className={styles.modalLink}>Privacy Policy</a>
        </p>
      </motion.div>
    </motion.div>
  );
}

/* ─── TEXT REVEAL ANIMATION ───────────────────────────────── */
function TextReveal({
  text,
  baseDelay = 0,
  fontWeight = 300,
  color = "#475569",
  wordDelay = 0.025,
  align = "left"
}: {
  text: string;
  baseDelay?: number;
  fontWeight?: number | string;
  color?: string;
  wordDelay?: number;
  align?: "left" | "center";
}) {
  let globalWordIndex = 0;
  const paragraphs = text.split("\n\n");

  return (
    <span style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%", alignItems: align === "center" ? "center" : "flex-start" }}>
      {paragraphs.map((para, pIdx) => {
        if (!para.trim()) return null;
        const lines = para.split("\n");
        return (
          <span key={pIdx} style={{ display: "inline-flex", flexWrap: "wrap", rowGap: "0.15em", columnGap: "0.25em", justifyContent: align === "center" ? "center" : "flex-start", width: "100%" }}>
            {lines.map((line, lIdx) => {
              const parts = line.split(/(\*\*[^*]+\*\*)/g);
              return (
                <React.Fragment key={lIdx}>
                  {lIdx > 0 && <span style={{ width: "100%", height: 0 }} />}
                  {parts.map((part, partIdx) => {
                    const isBold = part.startsWith("**") && part.endsWith("**");
                    const cleanPart = isBold ? part.slice(2, -2) : part;
                    const words = cleanPart.split(" ").filter(w => w.length > 0);

                    return words.map((word, wIdx) => {
                      const currentWordIndex = globalWordIndex++;
                      return (
                        <motion.span
                          key={`${partIdx}-${wIdx}`}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.28,
                            delay: baseDelay + currentWordIndex * wordDelay,
                            ease: [0.2, 0.65, 0.3, 0.9]
                          }}
                          style={{ 
                            display: "inline-block",
                            fontWeight: isBold ? 800 : fontWeight,
                            color: isBold ? "#1e293b" : color
                          }}
                        >
                          {word}
                        </motion.span>
                      );
                    });
                  })}
                </React.Fragment>
              );
            })}
          </span>
        );
      })}
    </span>
  );
}

/* ─── BURST CANVAS (Pixel Wave → Converge to Center) ──────── */
function BurstCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width  = (canvas.width  = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const spacing  = 20;     // dot grid spacing (slightly denser)
    const colors = [
      [139, 92, 246],  // violet
      [6, 182, 212],   // cyan
      [99, 102, 241],  // indigo
      [236, 72, 153],  // pink
      [59, 130, 246]   // blue
    ];

    interface GridDot {
      gx: number; gy: number;      // original grid position
      x: number;  y: number;       // current render position (moves during convergence)
      brightness: number;
      rgb: number[];
      baseOpacity: number;
      phase: number;               // 0=dim mesh, 1=wave-lit, 2=converging
      convergeFactor: number;      // 0→1 during converge
    }

    function makeDots() {
      const cols = Math.floor(width  / spacing) + 1;
      const rows = Math.floor(height / spacing) + 1;
      const arr: GridDot[] = [];
      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          arr.push({
            gx: c * spacing, gy: r * spacing,
            x: c * spacing,  y: r * spacing,
            brightness: 0,
            rgb: colors[Math.floor(Math.random() * colors.length)],
            baseOpacity: 0.08,  // Brighter base mesh
            phase: 0,
            convergeFactor: 0
          });
        }
      }
      return arr;
    }

    let dots = makeDots();

    const centerX = width  / 2;
    const centerY = height / 2;

    // ── Phase 1: Outward Wave ──────────────────────────────────
    let waveRadius   = 0;
    const waveSpeed     = 9;    // Deliberate wave pace
    const waveThickness = 200;  // Slightly wider wave front
    const maxRadius  = Math.sqrt(centerX * centerX + centerY * centerY) + waveThickness;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Wave propagation
      if (waveRadius < maxRadius) {
        waveRadius += waveSpeed;
      }

      for (const d of dots) {
        const dx0 = d.gx - centerX;
        const dy0 = d.gy - centerY;
        const dist = Math.sqrt(dx0 * dx0 + dy0 * dy0);

        // Wave illumination
        if (waveRadius > 0 && dist < waveRadius && dist > waveRadius - waveThickness) {
          const factor    = (dist - (waveRadius - waveThickness)) / waveThickness;
          const intensity = Math.pow(factor, 1.8) * 1.0;
          if (intensity > d.brightness) d.brightness = intensity;
        }

        // Decay brightness back to mesh
        if (d.brightness > d.baseOpacity) {
          d.brightness -= 0.005;
          if (d.brightness < d.baseOpacity) d.brightness = d.baseOpacity;
        }

        d.x = d.gx;
        d.y = d.gy;

        // Draw pixel
        const [r, g, b] = d.rgb;
        if (d.brightness > d.baseOpacity + 0.01) {
          ctx.fillStyle = `rgba(${r},${g},${b},${d.brightness})`;
        } else {
          ctx.fillStyle = `rgba(255,255,255,${d.brightness})`;
        }
        ctx.fillRect(d.x - 1, d.y - 1, 2, 2);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    const handleResize = () => {
      width  = canvas.width  = window.innerWidth;
      height = canvas.height = window.innerHeight;
      dots   = makeDots();
      waveRadius = 0;
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, zIndex: 3, pointerEvents: "none" }} />;
}


/* ─── CONCENTRIC STRIPS FLOW FIELD CANVAS ─────────────────── */
function GlitterCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    interface Dash {
      x: number;
      y: number;
      origX: number;
      origY: number;
      length: number;
      width: number;
      color: string;
      speedX: number;
      speedY: number;
      angle: number;
      opacity: number;
    }

    interface Wave {
      x: number;
      y: number;
      radius: number;
      maxRadius: number;
      speed: number;
      strength: number;
    }

    const dashes: Dash[] = [];
    const waves: Wave[] = [];
    let lastWaveSpawnTime = 0;
    const lastMousePos = { x: -1000, y: -1000 };

    const colors = [
      "rgba(139, 92, 246, 1)", // violet
      "rgba(6, 182, 212, 1)",  // cyan
      "rgba(79, 70, 229, 1)",  // indigo
      "rgba(3, 78, 162, 1)",   // narayana blue
      "rgba(232, 121, 249, 1)"  // magenta
    ];

    // Pre-populate dashes in a structured random grid
    const spacing = 35;
    const cols = Math.floor(width / spacing) + 1;
    const rows = Math.floor(height / spacing) + 1;

    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const origX = c * spacing + (Math.random() - 0.5) * spacing * 0.6;
        const origY = r * spacing + (Math.random() - 0.5) * spacing * 0.6;
        
        dashes.push({
          x: origX,
          y: origY,
          origX,
          origY,
          length: Math.random() * 6 + 4,
          width: Math.random() * 1.5 + 1.5,
          color: colors[Math.floor(Math.random() * colors.length)],
          speedX: 0,
          speedY: 0,
          angle: 0,
          opacity: 0, // Invisible by default
        });
      }
    }

    const mouse = { x: -1000, y: -1000, active: false };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      // Check if mouse is within the focused workspace card
      const container = document.querySelector(`[class*="workspaceContainer"]`);
      let isInside = false;
      if (container) {
        const rect = container.getBoundingClientRect();
        isInside = (
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom
        );
      }

      if (!isInside) {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        mouse.active = true;

        const now = Date.now();
        const dx = mouse.x - lastMousePos.x;
        const dy = mouse.y - lastMousePos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Spawn a wave if mouse moved significantly and at least 150ms has passed
        if (now - lastWaveSpawnTime > 150 && dist > 15) {
          waves.push({
            x: mouse.x,
            y: mouse.y,
            radius: 0,
            maxRadius: 400,
            speed: 5.5,
            strength: 1.0,
          });
          lastWaveSpawnTime = now;
          lastMousePos.x = mouse.x;
          lastMousePos.y = mouse.y;
        }
      } else {
        mouse.active = false;
      }
    };
    window.addEventListener("mousemove", handleMouseMove);

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Update waves list
      for (let w = waves.length - 1; w >= 0; w--) {
        const wave = waves[w];
        wave.radius += wave.speed;
        wave.strength = Math.max(0, 1 - wave.radius / wave.maxRadius);
        if (wave.radius >= wave.maxRadius) {
          waves.splice(w, 1);
        }
      }

      for (let i = 0; i < dashes.length; i++) {
        const d = dashes[i];

        let targetOpacity = 0;
        let targetX = d.origX;
        let targetY = d.origY;
        let targetAngle = d.angle;

        let maxWaveOpacity = 0;
        let weightedX = 0;
        let weightedY = 0;
        let totalWeight = 0;

        if (waves.length > 0) {
          for (let w = 0; w < waves.length; w++) {
            const wave = waves[w];
            const dx = d.origX - wave.x;
            const dy = d.origY - wave.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            const distToWaveFront = Math.abs(dist - wave.radius);
            const waveWidth = 80;

            if (distToWaveFront < waveWidth) {
              const waveIntensity = Math.pow(1 - distToWaveFront / waveWidth, 1.5) * wave.strength;
              if (waveIntensity > maxWaveOpacity) {
                maxWaveOpacity = waveIntensity;
              }

              const angleToWave = Math.atan2(dy, dx);
              // Push outwards slightly as the wave front moves past
              const pushForce = Math.sin((distToWaveFront / waveWidth) * Math.PI) * 20 * waveIntensity;
              
              weightedX += (d.origX + Math.cos(angleToWave) * pushForce) * waveIntensity;
              weightedY += (d.origY + Math.sin(angleToWave) * pushForce) * waveIntensity;
              totalWeight += waveIntensity;
            }
          }
        }

        // Apply brief fallback logic for static mouse pointer
        if (mouse.active) {
          const dx = d.origX - mouse.x;
          const dy = d.origY - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const hoverRadius = 80;
          if (dist < hoverRadius) {
            const hoverIntensity = Math.pow(1 - dist / hoverRadius, 1.2) * 0.25;
            if (hoverIntensity > maxWaveOpacity) {
              maxWaveOpacity = hoverIntensity;
            }
          }
        }

        targetOpacity = maxWaveOpacity * 0.85;

        if (totalWeight > 0) {
          targetX = weightedX / totalWeight;
          targetY = weightedY / totalWeight;
        }

        // Concentric angle calculation around closest wave or mouse pointer
        let centralX = mouse.x;
        let centralY = mouse.y;
        let minCenterDist = 999999;
        
        for (let w = 0; w < waves.length; w++) {
          const wave = waves[w];
          const dx = d.x - wave.x;
          const dy = d.y - wave.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < minCenterDist) {
            minCenterDist = dist;
            centralX = wave.x;
            centralY = wave.y;
          }
        }

        if (waves.length > 0 || mouse.active) {
          const dx = d.x - centralX;
          const dy = d.y - centralY;
          targetAngle = Math.atan2(dy, dx) + Math.PI / 2;
        }

        // Apply spring physics for position
        const springX = (targetX - d.x) * 0.08;
        const springY = (targetY - d.y) * 0.08;

        d.speedX += springX;
        d.speedY += springY;

        // Damping/friction
        d.speedX *= 0.75;
        d.speedY *= 0.75;

        d.x += d.speedX;
        d.y += d.speedY;

        // Smoothly interpolate opacity and angle
        d.opacity += (targetOpacity - d.opacity) * 0.15;
        
        // Handle angle wrap-around for smooth rotation interpolation
        let diff = targetAngle - d.angle;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;
        d.angle += diff * 0.25;

        // Only draw if visible
        if (d.opacity > 0.01) {
          ctx.strokeStyle = d.color;
          ctx.globalAlpha = d.opacity;
          ctx.lineWidth = d.width;
          ctx.lineCap = "round";
          ctx.beginPath();
          
          const hx = Math.cos(d.angle) * (d.length / 2);
          const hy = Math.sin(d.angle) * (d.length / 2);
          ctx.moveTo(d.x - hx, d.y - hy);
          ctx.lineTo(d.x + hx, d.y + hy);
          ctx.stroke();
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 2,
      }}
    />
  );
}

function SymptomSelector({ text, onAction }: { text?: string; onAction: (type: string, data?: unknown) => void }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [freeText, setFreeText] = useState("");

  const symptoms = [
    { label: "🤒 Fever", value: "Fever" },
    { label: "😷 Dry Cough", value: "Dry Cough" },
    { label: "🤕 Headache", value: "Headache" },
    { label: "🦵 Joint Pain", value: "Joint Pain" },
    { label: "🥱 Fatigue", value: "Fatigue" },
    { label: "👃 Runny Nose", value: "Runny Nose" },
    { label: "🤢 Nausea", value: "Nausea" },
    { label: "🫁 Shortness of breath", value: "Shortness of breath" },
    { label: "😰 Chills", value: "Chills" },
    { label: "🌡️ Body Ache", value: "Body Ache" },
  ];

  const handleToggle = (val: string) => {
    setSelected(prev =>
      prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val]
    );
  };

  const handleSubmit = () => {
    const allSymptoms = [...selected, ...(freeText.trim() ? [freeText.trim()] : [])];
    if (allSymptoms.length > 0) {
      onAction("submit_symptoms", allSymptoms.join(", "));
    }
  };

  const hasAny = selected.length > 0 || freeText.trim().length > 0;

  return (
    <div style={{
      background: "#ffffff",
      border: "1.5px solid #e2e8f0",
      borderRadius: "16px",
      padding: "20px",
      boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
      width: "100%",
      maxWidth: "560px"
    }}>
      {/* Empathetic Greeting Text inside the card for unified composition */}
      {text && (
        <div style={{
          fontSize: "14px",
          lineHeight: "1.6",
          color: "#334155",
          fontWeight: 500,
          marginBottom: "16px",
          borderBottom: "1px solid #f1f5f9",
          paddingBottom: "14px"
        }}>
          {text}
        </div>
      )}

      {/* Header */}
      <div style={{
        fontSize: "11.5px",
        fontWeight: 700,
        color: "#64748b",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        marginBottom: "12px",
        display: "flex",
        alignItems: "center",
        gap: "6px"
      }}>
        <span>🩺 Select any matching symptoms</span>
      </div>

      {/* Multi-select chips */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "14px" }}>
        {symptoms.map(s => {
          const isSelected = selected.includes(s.value);
          return (
            <button
              key={s.value}
              onClick={() => handleToggle(s.value)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                padding: "7px 13px",
                borderRadius: "20px",
                border: isSelected ? "1.5px solid #7c3aed" : "1.5px solid #e2e8f0",
                background: isSelected
                  ? "linear-gradient(135deg, #ede9fe 0%, #fae8ff 100%)"
                  : "#f8fafc",
                color: isSelected ? "#7c3aed" : "#475569",
                fontSize: "13px",
                fontWeight: isSelected ? 600 : 500,
                cursor: "pointer",
                transition: "all 0.18s ease",
                boxShadow: isSelected ? "0 2px 8px rgba(124,58,237,0.12)" : "none"
              }}
            >
              {isSelected && <span style={{ fontSize: "10px" }}>✓</span>}
              {s.label}
            </button>
          );
        })}
      </div>

      {/* Free-text area */}
      <div style={{
        background: "#f8fafc",
        border: "1.5px solid #e2e8f0",
        borderRadius: "10px",
        padding: "10px 12px",
        marginBottom: "14px"
      }}>
        <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 600, marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
          Or describe in your own words
        </div>
        <textarea
          value={freeText}
          onChange={e => setFreeText(e.target.value)}
          placeholder="e.g. I have had a sore throat and mild fever since yesterday..."
          rows={2}
          style={{
            width: "100%",
            background: "transparent",
            border: "none",
            outline: "none",
            resize: "none",
            fontSize: "13.5px",
            color: "#1e293b",
            fontFamily: "inherit",
            lineHeight: "1.5"
          }}
        />
      </div>

      {/* Footer */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderTop: "1.5px solid #f1f5f9",
        paddingTop: "12px"
      }}>
        <span style={{ fontSize: "12px", color: "#94a3b8" }}>
          {!hasAny
            ? "Select or describe your symptoms"
            : `${selected.length} chip(s) selected${freeText.trim() ? " + custom" : ""}`}
        </span>
        <button
          onClick={handleSubmit}
          disabled={!hasAny}
          style={{
            background: hasAny
              ? "linear-gradient(135deg, #7c3aed 0%, #db2777 100%)"
              : "#cbd5e1",
            color: "#ffffff",
            border: "none",
            borderRadius: "20px",
            padding: "9px 20px",
            fontSize: "13.5px",
            fontWeight: 700,
            cursor: hasAny ? "pointer" : "not-allowed",
            boxShadow: hasAny ? "0 4px 14px rgba(124,58,237,0.25)" : "none",
            transition: "all 0.2s",
            display: "flex",
            alignItems: "center",
            gap: "6px"
          }}
        >
          ✨ Analyze &amp; Find Doctor
        </button>
      </div>
    </div>
  );
}

function InlinePhoneInput({ onAction }: { onAction: (type: string, data?: unknown) => void }) {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  const handleSend = () => {
    const cleanPhone = phone.trim();
    if (!/^\d{10}$/.test(cleanPhone)) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }
    setError("");
    onAction("submit_inline_phone", cleanPhone);
  };

  return (
    <div style={{
      background: "#ffffff",
      border: "1.5px solid #e2e8f0",
      borderRadius: "20px",
      padding: "24px",
      boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
      width: "100%",
      maxWidth: "440px",
      marginTop: "8px"
    }}>
      {/* Premium Badge Header */}
      <div style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        background: "rgba(3, 78, 162, 0.08)",
        color: "#034ea2",
        padding: "6px 12px",
        borderRadius: "30px",
        fontSize: "11px",
        fontWeight: 700,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        marginBottom: "16px"
      }}>
        <Sparkles size={12} fill="#034ea2" /> Unlocks Pulse AI Benefits
      </div>

      {/* Benefits checklist */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        marginBottom: "20px",
        background: "#f8fafc",
        padding: "16px",
        borderRadius: "12px",
        border: "1px dashed #cbd5e1"
      }}>
        <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
          <div style={{ color: "#034ea2", marginTop: "2px" }}><Shield size={14} /></div>
          <div>
            <div style={{ fontSize: "12.5px", fontWeight: 700, color: "#1e293b" }}>Secure Health Profile</div>
            <div style={{ fontSize: "11.5px", color: "#64748b" }}>Sync with your official clinical records & test histories.</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
          <div style={{ color: "#10b981", marginTop: "2px" }}><Activity size={14} /></div>
          <div>
            <div style={{ fontSize: "12.5px", fontWeight: 700, color: "#1e293b" }}>Personalized Health Trends</div>
            <div style={{ fontSize: "11.5px", color: "#64748b" }}>Unlock smart report summary & organ health trackers.</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
          <div style={{ color: "#f59e0b", marginTop: "2px" }}><Clock size={14} /></div>
          <div>
            <div style={{ fontSize: "12.5px", fontWeight: 700, color: "#1e293b" }}>Priority Consult Confirmation</div>
            <div style={{ fontSize: "11.5px", color: "#64748b" }}>Confirm appointment slots & sync instantly with doctors.</div>
          </div>
        </div>
      </div>

      <div style={{ fontSize: "14px", fontWeight: 700, color: "#1e293b", marginBottom: "4px" }}>
        Enter Mobile Number
      </div>
      <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "16px" }}>
        Instant verification to securely link your profile.
      </div>

      <div style={{ display: "flex", gap: "8px", position: "relative" }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          background: "#f8fafc",
          border: "1.5px solid #cbd5e1",
          borderRadius: "8px",
          padding: "0 12px",
          fontSize: "14px",
          color: "#475569",
          fontWeight: 600
        }}>
          +91
        </div>
        <input 
          type="text" 
          value={phone}
          maxLength={10}
          onChange={e => {
            const val = e.target.value.replace(/\D/g, "");
            setPhone(val);
            if (val.length === 10) setError("");
          }}
          placeholder="00000 00000"
          style={{
            flex: 1,
            padding: "10px 14px",
            border: "1.5px solid #cbd5e1",
            borderRadius: "8px",
            outline: "none",
            fontSize: "14px",
            color: "#1e293b",
            fontWeight: 600
          }}
          onKeyDown={e => { if (e.key === "Enter") handleSend(); }}
        />
      </div>
      {error && (
        <div style={{ color: "#ef4444", fontSize: "11px", marginTop: "6px", fontWeight: 500 }}>
          {error}
        </div>
      )}
      <button
        onClick={handleSend}
        style={{
          width: "100%",
          marginTop: "16px",
          background: "linear-gradient(135deg, #034ea2 0%, #002d62 100%)",
          color: "#ffffff",
          border: "none",
          borderRadius: "8px",
          padding: "12px",
          fontSize: "13.5px",
          fontWeight: 700,
          cursor: "pointer",
          transition: "opacity 0.2s"
        }}
        onMouseEnter={e => e.currentTarget.style.opacity = "0.95"}
        onMouseLeave={e => e.currentTarget.style.opacity = "1"}
      >
        Send OTP via SMS
      </button>
    </div>
  );
}

function InlineOTPInput({ phone, onAction }: { phone: string; onAction: (type: string, data?: unknown) => void }) {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  const handleVerify = () => {
    if (otp.length !== 4) {
      setError("Please enter a 4-digit code");
      return;
    }
    setError("");
    onAction("submit_inline_otp", otp);
  };

  const maskedPhone = phone.length >= 10 
    ? `XXXXX XX${phone.slice(-3)}` 
    : phone;

  return (
    <div style={{
      background: "#ffffff",
      border: "1.5px solid #e2e8f0",
      borderRadius: "16px",
      padding: "20px",
      boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
      width: "100%",
      maxWidth: "420px",
      marginTop: "8px"
    }}>
      <div style={{ fontSize: "14px", fontWeight: 700, color: "#1e293b", marginBottom: "8px" }}>
        Enter Verification Code
      </div>
      <div style={{ fontSize: "12.5px", color: "#64748b", lineHeight: "1.5", marginBottom: "16px" }}>
        We have sent a 4-digit OTP to <strong style={{ color: "#334155" }}>+91 {maskedPhone}</strong>. Enter it below to complete sign in:
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
        <input 
          type="text" 
          maxLength={4}
          value={otp}
          onChange={e => {
            const val = e.target.value.replace(/\D/g, "");
            setOtp(val);
            if (val.length === 4) setError("");
          }}
          placeholder="••••"
          style={{
            width: "140px",
            padding: "10px",
            border: "1.5px solid #cbd5e1",
            borderRadius: "8px",
            outline: "none",
            fontSize: "18px",
            textAlign: "center",
            letterSpacing: "8px",
            fontWeight: 700,
            color: "#1e293b"
          }}
          onKeyDown={e => { if (e.key === "Enter") handleVerify(); }}
        />
      </div>
      {error && (
        <div style={{ color: "#ef4444", fontSize: "11.5px", marginTop: "8px", textAlign: "center", fontWeight: 500 }}>
          {error}
        </div>
      )}
      <button
        onClick={handleVerify}
        style={{
          width: "100%",
          marginTop: "16px",
          background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
          color: "#ffffff",
          border: "none",
          borderRadius: "8px",
          padding: "12px",
          fontSize: "13.5px",
          fontWeight: 700,
          cursor: "pointer",
          transition: "opacity 0.2s"
        }}
        onMouseEnter={e => e.currentTarget.style.opacity = "0.95"}
        onMouseLeave={e => e.currentTarget.style.opacity = "1"}
      >
        Verify &amp; Confirm Booking
      </button>
    </div>
  );
}

/* ─── MESSAGE BUBBLE ──────────────────────────────────────── */
function MsgBubble({ msg, onAction, onPrefill, activeChipId, userName = "Omkar", tutorialStep }: {
  msg: Message;
  onAction: (type: string, data?: unknown) => void;
  onPrefill?: (prefix: string, chipId: string) => void;
  activeChipId?: string | null;
  userName?: string;
  tutorialStep?: string;
}) {
  const wordCount = msg.text ? msg.text.split(/\s+/).filter(w => w.length > 0).length : 0;
  const revealDelay = Math.max(0.6, wordCount * 0.025 + 0.3);

  if (msg.isThinking) return <ThinkingDots />;
  if (msg.rtype === "upload_state") return (
    <UploadStateBubble stage={msg.uploadStage!} fileName={msg.uploadFileName!} />
  );

  if (msg.role === "user") return (
    <motion.div className={styles.userBubble}
      initial={{ opacity: 0, y: 8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.22 }}>
      {msg.text}
    </motion.div>
  );

  if (msg.rtype === "tutorial_welcome") return (
    <motion.div className={styles.aiBubbleWrap}
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }}>
      <div className={styles.aiAvatar}><SparkleIcon size={16} /></div>
      <div className={styles.aiBubble} style={{ display: "flex", flexDirection: "column" }}>
        <p className={styles.aiText} style={{ marginBottom: "16px" }}>{msg.text}</p>
        <div className={styles.tutOptionsGrid} style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%", maxWidth: "480px" }}>

          <button className={styles.tutOptionCard} onClick={() => onAction("start_tutorial_triage")}
            style={{ display: "flex", alignItems: "center", gap: "12px", background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: "12px", padding: "12px 16px", cursor: "pointer", textAlign: "left", transition: "all 0.2s" }}>
            <span style={{ fontSize: "20px" }}>🩺</span>
            <div>
              <div style={{ fontWeight: 700, color: "#1e293b", fontSize: "13px" }}>Describe what you&apos;re feeling, your health, or what you&apos;re looking for — Pulse will help you out</div>
              <div style={{ fontSize: "11px", color: "#64748b" }}>Ask: &quot;I have a sudden headache since morning&quot;</div>
            </div>
          </button>
          <button className={styles.tutOptionCard} onClick={() => onAction("start_tutorial_report")}
            style={{ display: "flex", alignItems: "center", gap: "12px", background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: "12px", padding: "12px 16px", cursor: "pointer", textAlign: "left", transition: "all 0.2s" }}>
            <span style={{ fontSize: "20px" }}>📄</span>
            <div>
              <div style={{ fontWeight: 700, color: "#1e293b", fontSize: "13px" }}>Scan Medical Report</div>
              <div style={{ fontSize: "11px", color: "#64748b" }}>Attach: &quot;blood_report_jan2025.pdf&quot;</div>
            </div>
          </button>
        </div>
        <button onClick={() => onAction("skip_tutorial")}
          style={{ background: "none", border: "none", color: "#94a3b8", fontSize: "11px", fontWeight: 600, cursor: "pointer", marginTop: "12px", alignSelf: "flex-start", padding: 0 }}>
          Skip tour &amp; go directly to chat ✕
        </button>
      </div>
    </motion.div>
  );

  if (msg.rtype === "tutorial_step_report") return (
    <motion.div className={styles.aiBubbleWrap}
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }}>
      <div className={styles.aiAvatar}><SparkleIcon size={16} /></div>
      <div className={styles.aiBubble} style={{ display: "flex", flexDirection: "column" }}>
        <p className={styles.aiText} style={{ marginBottom: "12px" }}>{msg.text}</p>
        <button onClick={() => onAction("prefill_report")}
          className={tutorialStep === "report_prefilled" ? styles.pulsePurpleBtn : ""}
          style={{ display: "flex", alignItems: "center", gap: "8px", background: "linear-gradient(135deg, #ede9fe, #dbeafe)", border: "1.5px dashed #a78bfa", color: "#7c3aed", fontWeight: 700, fontSize: "13px", padding: "10px 20px", borderRadius: "24px", cursor: "pointer", transition: "all 0.2s", alignSelf: "flex-start" }}>
          📎 Simulate Report Attachment
        </button>
      </div>
    </motion.div>
  );

  if (msg.rtype === "tutorial_completed") return (
    <motion.div className={styles.aiBubbleWrap}
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }}>
      <div className={styles.aiAvatar}><SparkleIcon size={16} /></div>
      <div className={styles.aiBubble} style={{ display: "flex", flexDirection: "column" }}>
        <p className={styles.aiText} style={{ marginBottom: "16px" }}>{msg.text}</p>
        <button onClick={() => onAction("finish_tutorial")}
          className={tutorialStep === "report_sent" ? styles.pulseBlueBtn : ""}
          style={{ background: "#034EA2", color: "#fff", border: "none", fontWeight: 700, fontSize: "14px", padding: "12px 28px", borderRadius: "24px", cursor: "pointer", boxShadow: "0 4px 12px rgba(3,78,162,0.2)", alignSelf: "flex-start" }}>
          🎉 Start Chat Workspace
        </button>
      </div>
    </motion.div>
  );


  return (
    <motion.div className={styles.aiBubbleWrap}
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }}>
      <div className={styles.aiAvatar}><SparkleIcon size={16} /></div>
      <div className={styles.aiBubble}>
        {/* Text */}
        {msg.text && msg.rtype !== "symptom_selector" && (
          <div className={styles.aiText}>
            <TextReveal text={msg.text} />
          </div>
        )}

        {/* Find Doctor Options Cards */}
        {msg.rtype === "find_doctor_options" && msg.findDoctorOptions && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: revealDelay, duration: 0.3 }}
            className={styles.findDoctorOptionsContainer}
          >
            {/* Card 1: Recommended Speciality */}
            <motion.button
              className={styles.findDoctorOptionCard}
              whileHover={{ scale: 1.01, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onAction("follow_up", msg.findDoctorOptions?.recommendedSpeciality.prompt)}
            >
              <div className={styles.findDoctorCardLeft}>
                <div className={styles.findDoctorIconBadgeBlue}>
                  <Stethoscope size={18} color="#0284C7" />
                </div>
                <span className={styles.findDoctorCardTitle}>
                  {msg.findDoctorOptions.recommendedSpeciality.title}
                </span>
              </div>
              <span className={styles.findDoctorCardTag}>
                ✦ {msg.findDoctorOptions.recommendedSpeciality.badge}
              </span>
            </motion.button>

            {/* Card 2: Last Visited Doctor */}
            <motion.button
              className={styles.findDoctorOptionCard}
              whileHover={{ scale: 1.01, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onAction("follow_up", msg.findDoctorOptions?.lastVisitedDoctor.prompt)}
            >
              <div className={styles.findDoctorCardLeft}>
                <img 
                  src={msg.findDoctorOptions.lastVisitedDoctor.photo || "/images/misc/doctor_avatar_male.png"} 
                  alt="Doctor" 
                  className={styles.findDoctorAvatarImg} 
                />
                <span className={styles.findDoctorCardTitle}>
                  {msg.findDoctorOptions.lastVisitedDoctor.title}
                </span>
              </div>
              <span className={styles.findDoctorCardTag}>
                ✦ {msg.findDoctorOptions.lastVisitedDoctor.badge}
              </span>
            </motion.button>

            {/* Sub Chips Section */}
            <div className={styles.findDoctorSubChipsSection}>
              <div className={styles.findDoctorSparkleHeader}>
                <Sparkles size={16} color="#38BDF8" />
                <span>If you are looking for something else</span>
              </div>
              <div className={styles.findDoctorSubChipsWrap}>
                {msg.findDoctorOptions.subChips.map(chip => {
                  const isSymptom = chip.label.toLowerCase().includes("symptom");
                  const isSpeciality = chip.label.toLowerCase().includes("speciality");
                  const isDoctor = chip.label.toLowerCase().includes("doctor");
                  let prefix = "";
                  let chipId = "";
                  if (isSymptom) { prefix = "I have been having "; chipId = "find_symptom"; }
                  else if (isSpeciality) { prefix = "I am looking for a "; chipId = "find_speciality"; }
                  else if (isDoctor) { prefix = "I want to consult Dr. "; chipId = "find_doctor"; }

                  return (
                    <button
                      key={chip.label}
                      className={`${styles.findDoctorSubChip} ${activeChipId === chipId ? styles.findDoctorSubChipActive : ""}`}
                      onClick={() => {
                        if (onPrefill && prefix) {
                          onPrefill(prefix, chipId);
                        } else {
                          onAction("follow_up", chip.prompt);
                        }
                      }}
                    >
                      {chip.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Doctors */}
        {msg.rtype === "doctors" && msg.doctors && (
          <motion.div
            initial={{ opacity: 0, height: 0, overflow: "hidden" }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ delay: revealDelay, duration: 0.35, ease: "easeOut" }}
            style={{ width: "100%" }}
          >
            <div className={styles.doctorScroll}>
              <div className={styles.doctorList}>
                {msg.doctors.map((d, i) => (
                  <motion.div key={d.id} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: revealDelay + i * 0.1 }}>
                    <DoctorCard doc={d} onBookNow={doc => onAction("book_now", doc)} />
                  </motion.div>
                ))}
              </div>
              <button className={styles.viewAllBtn}><ArrowUpRight size={14} /> View all doctors</button>
            </div>
          </motion.div>
        )}

        {/* Slot picker */}
        {msg.rtype === "slot_picker" && msg.slotDoctor && (
          <SlotPickerCard
            doctor={msg.slotDoctor}
            onConfirm={({ slot, type, clinic, fee }) =>
              onAction("confirm_slot", { doctor: msg.slotDoctor, slot, type, clinic, fee })
            }
          />
        )}

        {/* Report — single clinical findings card style */}
        {msg.rtype === "report" && (
          <div className={styles.reportAnalysisCard}>
            {/* Gradient header */}
            <div className={styles.reportAnalysisCardHeader}>
              <div className={styles.reportAnalysisIconBox} style={{ background: "rgba(3,78,162,0.1)" }}>
                <FileText size={22} color="#034ea2" />
              </div>
              <div className={styles.reportAnalysisHeaderMeta}>
                <div className={styles.reportAnalysisTitle}>Report Analysis</div>
                <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 500, marginTop: "2px" }}>
                  Based on Visit Summary, Lab Report
                </div>
              </div>
              <div className={styles.reportAnalysisDate}>
                <FileText size={11} /> Nov&apos;2024
              </div>
            </div>
            {/* Findings */}
            <div className={styles.reportAnalysisBody}>
              {[
                { title: "Reflexes reduced", detail: "Imaging showed mild compression in your neck area.", severity: "concern" },
                { title: "Reflexes reduced", detail: "Imaging showed mild compression in your neck area.", severity: "concern" },
                { title: "Left hand tremors", detail: "You reported shaking in your left hand.", severity: "normal" },
                { title: "Left hand tremors", detail: "You reported shaking in your left hand.", severity: "normal" }
              ].map((item, idx) => {
                const isConcern = item.severity === "concern";
                return (
                  <div key={idx} className={styles.reportFindingItem}>
                    <span className={`${styles.reportFindingIconCircle} ${
                      isConcern ? styles.findingIconRed : styles.findingIconGreen
                    }`}>
                      {isConcern ? "!" : "✓"}
                    </span>
                    <div className={styles.reportFindingText}>
                      <div className={styles.reportFindingTitle}>{item.title}</div>
                      <div className={styles.reportFindingDetail}>{item.detail}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Specialist card */}
            <div className={styles.specialistRec} style={{ margin: "0 18px 18px" }}>
              <div className={styles.specialistRecHeader}>
                <div className={styles.specialistRecIconBox}>
                  <Stethoscope size={20} color="#034ea2" />
                </div>
                <div className={styles.specialistRecHeaderText}>
                  <div className={styles.specialistRecLabel}>Recommended specialist</div>
                  <div className={styles.specialistRecName}>Gastroenterologist</div>
                </div>
              </div>
              <div className={styles.specialistRecNote}>
                You need to have Evaluation of mild it to fatty liver changes for better health
              </div>
              <button className={styles.consultBtn} onClick={() => onAction("consult")}>Consult</button>
            </div>
          </div>
        )}

        {/* Triage assessment */}
        {msg.rtype === "triage" && msg.triageUrgency && msg.triagePathways && (
          <div className={styles.triageCard}>
            <div className={styles.triageHeader}>
              <span className={`${styles.urgencyBadge} ${styles[`urgency_${msg.triageUrgency}`]}`}>
                {msg.triageUrgency === "high" ? "🚨 HIGH URGENCY" : "⚠️ GENERAL RECOMMENDATION"}
              </span>
              <span className={styles.triageTitle}>Care Escalation Pathways</span>
            </div>
            
            <p className={styles.triageAnalysisText}>{msg.triageAnalysis}</p>

            <div className={styles.escalationPathways}>
              {msg.triagePathways.map((path) => (
                <div key={path.title} className={styles.pathwayCard}>
                  <div className={styles.pathwayInfo}>
                    <div className={styles.pathwayTitle}>{path.title}</div>
                    <div className={styles.pathwayDesc}>{path.desc}</div>
                  </div>
                  <button 
                    className={styles.pathwayCta}
                    onClick={() => {
                      if (path.actionType === "er") {
                        onAction("follow_up", "Where is the nearest ER?");
                      } else if (path.actionType === "video") {
                        onAction("follow_up", "Book video consultation");
                      } else if (path.actionType === "consult" && path.dept) {
                        onAction("follow_up", `Book appointment with ${path.dept} specialist`);
                      }
                    }}
                  >
                    {path.ctaText} <ArrowUpRight size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Interactive Multi-Select Symptom Selector */}
        {msg.rtype === "symptom_selector" && (
          <SymptomSelector text={msg.text} onAction={onAction} />
        )}

        {/* Inline Triage Login Inputs */}
        {msg.rtype === "inline_phone_input" && (
          <InlinePhoneInput onAction={onAction} />
        )}

        {msg.rtype === "inline_otp_input" && (
          <InlineOTPInput phone={msg.inlinePhone || ""} onAction={onAction} />
        )}

        {/* Fallback navigation cards */}
        {msg.rtype === "fallback" && (
          <div className={styles.quickCards} style={{ marginTop: "12px", width: "100%" }}>
            {QUICK_PROMPTS.map(({ icon: Icon, label, prompt, color }) => (
              <button key={label} className={styles.quickCard} onClick={() => onAction("follow_up", prompt)}>
                <div className={styles.quickCardIcon} style={{ background: `${color}18`, color }}><Icon size={22} /></div>
                <span className={styles.quickCardLabel}>{label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Modify Selection Card (Reschedule vs Cancel confirmation) */}
        {msg.rtype === "modify_selection" && (
          <div className={styles.modifySelectionCard}>
            <div className={styles.modifyCardTop}>
              <img src="/assets/doctor_1.png" alt="Doctor" className={styles.modifyDocImg} />
              <div className={styles.modifyCardDetails}>
                <div className={styles.modifyDocName}>Appointment with Dr. Pradeep R Kumar</div>
                <div className={styles.modifyDocSub}>Cardiologist • MBBS</div>
                <div className={styles.modifyTimeRow}>📅 Tue, 18 Feb 2025 | 09:00 AM</div>
                <div className={styles.modifyLocRow}>📍 Narayana Health City International</div>
              </div>
            </div>
            <div className={styles.modifyActionRow}>
              <button className={styles.modifyBtnPrimary} onClick={() => onAction("follow_up", "Reschedule appointment")}>
                Reschedule appointment
              </button>
              <button className={styles.modifyBtnSecondary} onClick={() => onAction("follow_up", "Cancel appointment")}>
                Cancel appointment
              </button>
            </div>
          </div>
        )}

        {/* Order Summary & Checkout Card */}
        {msg.rtype === "order_summary" && msg.orderSummaryData && (
          <OrderSummaryCard
            doctor={msg.orderSummaryData.doctor}
            slot={msg.orderSummaryData.slot}
            visitType={msg.orderSummaryData.visitType}
            clinicName={msg.orderSummaryData.clinicName}
            fee={msg.orderSummaryData.fee}
            userName={userName}
            onPaySuccess={(payMethod, amount) => {
              onAction("complete_payment", {
                doctor: msg.orderSummaryData?.doctor,
                slot: msg.orderSummaryData?.slot,
                visitType: msg.orderSummaryData?.visitType,
                clinicName: msg.orderSummaryData?.clinicName,
                payMethod,
                amount
              });
            }}
          />
        )}

        {/* Booking Confirmation Card */}
        {msg.rtype === "booking_confirm" && (
          <div className={styles.bookingConfirmCard}>
            <div className={styles.bookingConfirmHeader}>
              <div className={styles.bookingSuccessIconWrap}>
                <CheckCircle size={22} color="#16a34a" />
              </div>
              <div>
                <div className={styles.bookingConfirmTitle}>Appointment Confirmed!</div>
                <div className={styles.bookingConfirmSub}>Your slot is reserved &amp; synced with clinic records</div>
              </div>
            </div>

            <div className={styles.bookingConfirmBody}>
              <div className={styles.bookingDocInfo}>
                <img
                  src={msg.slotDoctor?.photo || "/images/misc/doctor_avatar_male.png"}
                  alt={msg.slotDoctor?.name || "Doctor"}
                  className={styles.bookingDocPhoto}
                />
                <div>
                  <div className={styles.bookingDocName}>{msg.slotDoctor?.name || "Dr. Pradeep R Kumar"}</div>
                  <div className={styles.bookingDocSpec}>{msg.slotDoctor?.speciality || "General Physician"}</div>
                  <div className={styles.bookingDocHospital}>
                    <MapPin size={12} /> {msg.slotDoctor?.hospital || "Mazumdar Shaw Medical Centre"}
                  </div>
                </div>
              </div>

              <div className={styles.bookingGridDetails}>
                <div className={styles.bookingDetailItem}>
                  <span className={styles.bookingDetailLabel}>Date &amp; Time</span>
                  <span className={styles.bookingDetailVal}>📅 {msg.text.match(/\*\*(.*?)\*\*/)?.[1] || "Tomorrow, 02:30 PM"}</span>
                </div>
                <div className={styles.bookingDetailItem}>
                  <span className={styles.bookingDetailLabel}>Booking ID</span>
                  <span className={styles.bookingDetailVal}>#NH-894210</span>
                </div>
              </div>
            </div>

            <div className={styles.bookingNextActions}>
              <div className={styles.bookingNextTitle}>Next Steps</div>
              <div className={styles.bookingCtaGrid}>
                <button className={styles.bookingCtaPrimary} onClick={() => onAction("follow_up", "Add appointment to my calendar")}>
                  <Calendar size={14} /> Add to Calendar
                </button>
                <button className={styles.bookingCtaSecondary} onClick={() => onAction("follow_up", "Get directions to hospital")}>
                  <MapPin size={14} /> Get Directions
                </button>
                <button className={styles.bookingCtaSecondary} onClick={() => onAction("follow_up", "Book another appointment")}>
                  <Plus size={14} /> Book Another
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cancelled State Card */}
        {msg.rtype === "cancelled_card" && (
          <div className={styles.cancelledCardContainer}>
            <div className={styles.cancelledAlertStrip}>
              <span>❌ Your appointment is cancelled</span>
            </div>
            <div className={styles.modifyCardTop} style={{ padding: "16px", borderBottom: "none" }}>
              <img src="/assets/doctor_1.png" alt="Doctor" className={styles.modifyDocImg} />
              <div className={styles.modifyCardDetails}>
                <div className={styles.modifyDocName} style={{ color: "#64748b", textDecoration: "line-through" }}>
                  Appointment with Dr. Pradeep R Kumar
                </div>
                <div className={styles.modifyDocSub}>Cardiologist • MBBS</div>
                <div className={styles.modifyTimeRow}>📅 Tue, 18 Feb 2025 | 09:00 AM</div>
                <div className={styles.modifyLocRow}>📍 Narayana Health City International</div>
              </div>
            </div>
            <div style={{ padding: "0 16px 16px" }}>
              <button className={styles.modifyBtnPrimary} onClick={() => onAction("follow_up", "Book appointment")} style={{ width: "100%" }}>
                Book again
              </button>
            </div>
          </div>
        )}

        {/* Cancelled State Quick Home Navigation Cards */}
        {msg.rtype === "cancelled_card" && (
          <div className={styles.quickCards} style={{ marginTop: "16px", width: "100%" }}>
            {QUICK_PROMPTS.map(({ icon: Icon, label, prompt, color }) => (
              <button key={label} className={styles.quickCard} onClick={() => onAction("follow_up", prompt)}>
                <div className={styles.quickCardIcon} style={{ background: `${color}18`, color }}><Icon size={22} /></div>
                <span className={styles.quickCardLabel}>{label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Health login prompt */}
        {msg.rtype === "health_login" && (
          <div className={styles.healthLoginPrompt}>
            <div className={styles.healthLoginIcon}><SparkleIcon size={32} /></div>
            <div className={styles.healthLoginText}>Sign in to view your personalised health data</div>
            <div className={styles.healthLoginBtns}>
              <button className={styles.healthLoginBtn} onClick={() => onAction("show_login")}>Login to my account</button>
              <button className={`${styles.healthLoginBtn} ${styles.healthLoginBtnSecondary}`} onClick={() => onAction("show_register")}>Register as new user</button>
            </div>
          </div>
        )}

        {/* Health organs */}
        {msg.rtype === "health_organs" && (
          <motion.div
            initial={{ opacity: 0, height: 0, overflow: "hidden" }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ delay: revealDelay, duration: 0.35, ease: "easeOut" }}
            style={{ width: "100%" }}
          >
            <HealthOrgansPanel
              onViewFindings={organ => onAction("view_organ_detail", organ)}
              onConsult={() => onAction("consult")}
              userName={userName}
            />
          </motion.div>
        )}

        {/* Health analysis (after upload) — card style */}
        {msg.rtype === "health_analysis" && (
          <div className={styles.reportAnalysisCard}>
            <div className={styles.reportAnalysisCardHeader}>
              <div className={styles.reportAnalysisIconBox} style={{ background: "rgba(3,78,162,0.1)" }}>
                <FileText size={22} color="#034ea2" />
              </div>
              <div className={styles.reportAnalysisHeaderMeta}>
                <div className={styles.reportAnalysisTitle}>Report Analysis</div>
                <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 500, marginTop: "2px" }}>
                  Based on Visit Summary, Lab Report
                </div>
              </div>
              <div className={styles.reportAnalysisDate}><FileText size={11} /> Nov&apos;2024</div>
            </div>
            <div className={styles.reportAnalysisBody}>
              {[
                { title: "Reflexes reduced", detail: "Imaging showed mild compression in your neck area.", severity: "concern" },
                { title: "Reflexes reduced", detail: "Imaging showed mild compression in your neck area.", severity: "concern" },
                { title: "Left hand tremors", detail: "You reported shaking in your left hand.", severity: "normal" },
                { title: "Left hand tremors", detail: "You reported shaking in your left hand.", severity: "normal" }
              ].map((item, idx) => {
                const isConcern = item.severity === "concern";
                return (
                  <div key={idx} className={styles.reportFindingItem}>
                    <span className={`${styles.reportFindingIconCircle} ${
                      isConcern ? styles.findingIconRed : styles.findingIconGreen
                    }`}>
                      {isConcern ? "!" : "✓"}
                    </span>
                    <div className={styles.reportFindingText}>
                      <div className={styles.reportFindingTitle}>{item.title}</div>
                      <div className={styles.reportFindingDetail}>{item.detail}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Specialist card */}
            <div className={styles.specialistRec} style={{ margin: "0 18px 18px" }}>
              <div className={styles.specialistRecHeader}>
                <div className={styles.specialistRecIconBox}>
                  <Stethoscope size={20} color="#034ea2" />
                </div>
                <div className={styles.specialistRecHeaderText}>
                  <div className={styles.specialistRecLabel}>Recommended specialist</div>
                  <div className={styles.specialistRecName}>Gastroenterologist</div>
                </div>
              </div>
              <div className={styles.specialistRecNote}>
                You need to have Evaluation of mild it to fatty liver changes for better health
              </div>
              <button className={styles.consultBtn} onClick={() => onAction("consult")}>Consult</button>
            </div>
          </div>
        )}

        {/* Follow-ups */}
        {msg.followUps && (
          <div className={styles.followUps}>
            {msg.followUps.map(f => (
              <button key={f} className={styles.followUpChip}
                onClick={() => onAction("follow_up", f)}>{f}</button>
            ))}
          </div>
        )}

        {/* Action row */}
        {!msg.isThinking && (
          <div className={styles.aiActions}>
            {[ThumbsUp, ThumbsDown, Copy, RefreshCw].map((Icon, i) => (
              <button key={i} className={styles.aiAction}><Icon size={13} /></button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ─── WELCOME SCREEN ──────────────────────────────────────── */
const welcomeContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.5,
    },
  },
};

const welcomeCardVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scaleY: 0.95,
    scaleX: 0.95,
    transformOrigin: "top center",
  },
  visible: {
    opacity: 1,
    y: 0,
    scaleY: 1,
    scaleX: 1,
    transition: {
      type: "spring" as const,
      stiffness: 220,
      damping: 18,
      mass: 0.8,
    },
  },
};

function WelcomeScreen({ onPrompt, onPrefill, activeChipId, isLoggedIn, userName = "Omkar V" }: { onPrompt: (p: string) => void; onPrefill: (prefix: string, chipId: string) => void; activeChipId: string | null; isLoggedIn: boolean; userName?: string }) {
  return (
    <div className={styles.pulseNewLandingContainer}>
      {/* 1. Sparkle Animated AI Icon & Greeting */}
      <motion.div 
        className={styles.landingHeroSection}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className={styles.sparkleIconContainer} style={{ width: "94px", height: "94px" }}>
          <div className={styles.sparkleIconGlow} style={{ inset: "-12px" }} />
          <div style={{ zIndex: 2 }}>
            <LottieAnimation animationPath="/Logo/AI Searching 2.json" width={94} height={94} />
          </div>
        </div>

        <h1 className={styles.greetingTitle}>
          {isLoggedIn ? `Hi ${userName}` : "Hi there!"} <span className={styles.wavingHand}>👋</span>
        </h1>
        <p className={styles.greetingSubtitle}>How can I help you today?</p>
      </motion.div>

      {/* 2. Main Entry Point Cards Container */}
      <div className={styles.entryCardsContainer}>
        {/* Card 1: Find the right doctor (Blue theme) */}
        <motion.div 
          className={`${styles.entryCard} ${styles.blueThemeCard}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          whileHover={{ y: -6, scale: 1.015, boxShadow: "0 14px 34px rgba(0, 0, 0, 0.08)" }}
          whileTap={{ scale: 0.995 }}
          onClick={() => onPrompt("Find doctor")}
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
              <ChevronRight size={18} />
            </div>
          </div>

          <div className={styles.intentSubSection}>
            <span className={styles.intentLabel}>Try asking for</span>
            <div className={styles.intentChipsWrap}>
              <button className={`${styles.intentChip} ${styles.blueChip} ${activeChipId === "symptom" ? styles.intentChipActive : ""}`} onClick={(e) => { e.stopPropagation(); onPrefill("I have been having ", "symptom"); }}>
                I have a symptom
              </button>
              <button className={`${styles.intentChip} ${styles.blueChip} ${activeChipId === "doctor" ? styles.intentChipActive : ""}`} onClick={(e) => { e.stopPropagation(); onPrefill("I want to consult Dr. ", "doctor"); }}>
                I know the doctor's name
              </button>
              <button className={`${styles.intentChip} ${styles.blueChip} ${activeChipId === "book" ? styles.intentChipActive : ""}`} onClick={(e) => { e.stopPropagation(); onPrompt("I want to book an appointment"); }}>
                I want to book an appointment
              </button>
              <button className={`${styles.intentChip} ${styles.blueChip} ${activeChipId === "speciality" ? styles.intentChipActive : ""}`} onClick={(e) => { e.stopPropagation(); onPrefill("I am looking for a ", "speciality"); }}>
                I know the speciality
              </button>
            </div>
          </div>
        </motion.div>

        {/* Card 2: Know your health (Mint/Teal theme) */}
        <motion.div 
          className={`${styles.entryCard} ${styles.tealThemeCard}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          whileHover={{ y: -6, scale: 1.015, boxShadow: "0 14px 34px rgba(0, 0, 0, 0.08)" }}
          whileTap={{ scale: 0.995 }}
          onClick={() => onPrompt("Know your health")}
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
              <ChevronRight size={18} />
            </div>
          </div>

          <div className={styles.intentSubSection}>
            <span className={styles.intentLabel}>Try asking for</span>
            <div className={styles.intentChipsWrap}>
              <button className={`${styles.intentChip} ${styles.tealChip} ${activeChipId === "health_summary" ? styles.intentChipActive : ""}`} onClick={(e) => { e.stopPropagation(); onPrompt("Summarize my health"); }}>
                Summarize my health
              </button>
              <button className={`${styles.intentChip} ${styles.tealChip} ${activeChipId === "report" ? styles.intentChipActive : ""}`} onClick={(e) => { e.stopPropagation(); onPrefill("Please analyse report ", "report"); }}>
                Analyse my reports
              </button>
              <button className={`${styles.intentChip} ${styles.tealChip} ${activeChipId === "organ_insights" ? styles.intentChipActive : ""}`} onClick={(e) => { e.stopPropagation(); onPrompt("Show my organ insights"); }}>
                Show my organ insights
              </button>
              <button className={`${styles.intentChip} ${styles.tealChip} ${activeChipId === "upload_review" ? styles.intentChipActive : ""}`} onClick={(e) => { e.stopPropagation(); onPrompt("Upload and review my report"); }}>
                Upload and review my report
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/* ─── RIGHT PANEL ─────────────────────────────────────────── */
function RightPanel({ onPrompt }: { onPrompt: (p: string) => void }) {
  return (
    <div className={styles.rightPanel}>
      <div className={styles.rpSection}>
        <div className={styles.rpSectionTitle}>Quick Actions</div>
        <div className={styles.rpActions}>
          {[
            { icon: Calendar,    label: "Book Appointment", prompt: "Book appointment"        },
            { icon: FlaskConical,label: "Book Lab Test",    prompt: "Book a lab test"          },
            { icon: FileText,    label: "Upload Report",    prompt: "Summarise my blood report"},
            { icon: Activity,    label: "Health Checkup",   prompt: "Book health checkup"      },
            { icon: Video,       label: "Video Consult",    prompt: "Book video consultation"  },
            { icon: Pill,        label: "Pharmacy",         prompt: "Order medicines"          },
          ].map(({ icon: Icon, label, prompt }) => (
            <button key={label} className={styles.rpActionBtn} onClick={() => onPrompt(prompt)}>
              <Icon size={15} /><span>{label}</span>
            </button>
          ))}
        </div>
      </div>
      <div className={styles.rpSection}>
        <div className={styles.rpSectionTitle}>Health Snapshot</div>
        <div className={styles.vitalsGrid}>
          {[
            { label: "Blood Pressure", value: "118/76", unit: "mmHg",icon: Activity, color: "#22c55e", good: true  },
            { label: "Blood Sugar",    value: "112",    unit: "mg/dL",icon: TrendingUp,color:"#f59e0b", good: false },
            { label: "BMI",            value: "23.4",   unit: "",     icon: User,    color: "#22c55e", good: true  },
            { label: "Heart Rate",     value: "72",     unit: "bpm",  icon: Heart,   color: "#22c55e", good: true  },
          ].map(({ label, value, unit, icon: Icon, color, good }) => (
            <div key={label} className={styles.vitalCard}>
              <div className={styles.vitalIcon} style={{ background: `${color}18`, color }}><Icon size={15} /></div>
              <div className={styles.vitalValue}>{value} <span className={styles.vitalUnit}>{unit}</span></div>
              <div className={styles.vitalLabel}>{label}</div>
              <div className={styles.vitalStatus} style={{ color }}>
                {good ? <CheckCircle size={11} /> : <AlertCircle size={11} />}{good ? "Normal" : "Review"}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className={styles.rpSection}>
        <div className={styles.rpSectionTitle}>Upcoming Appointments</div>
        <div className={styles.rpAppts}>
          {[
            { name: "Dr. Ananya Krishnan", spec: "Cardiology",  date: "Tomorrow, 05:00 PM", icon: "🩺" },
            { name: "Full Body Checkup",   spec: "Diagnostics", date: "Fri, 09:00 AM",      icon: "🔬" },
          ].map(a => (
            <div key={a.name} className={styles.rpAppt}>
              <div className={styles.rpApptIcon}>{a.icon}</div>
              <div>
                <div className={styles.rpApptName}>{a.name}</div>
                <div className={styles.rpApptSpec}>{a.spec}</div>
                <div className={styles.rpApptDate}><Clock size={11} />{a.date}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── SIDEBAR ─────────────────────────────────────────────── */
function Sidebar({ history, activeId, onSelect, onNew, onClose }: {
  history: Convo[]; activeId: string | null;
  onSelect: (id: string) => void; onNew: () => void; onClose: () => void;
}) {
  return (
    <div className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <div className={styles.sidebarBrand}>
          <SparkleIcon size={24} />
          <div>
            <span className={styles.brandName}>Pulse<span className={styles.brandAi}>.ai</span></span>
            <span className={styles.brandBeta}>beta</span>
          </div>
        </div>
        <button className={styles.sidebarClose} onClick={onClose} aria-label="Close Pulse AI"><X size={18} /></button>
      </div>
      <button className={styles.newChatBtn} onClick={onNew}><Plus size={16} /> New Conversation</button>
      {/* Recent history list is hidden as chat history is not stored */}
      <div style={{ flexGrow: 1 }} />
      <div className={styles.sidebarFooter}>
        <button className={styles.sidebarFooterBtn}><User size={14} /> Profile</button>
        <button className={styles.sidebarFooterBtn}><BookOpen size={14} /> Health Records</button>
      </div>
    </div>
  );
}



const ASSOCIATED_PROFILES = [
  { id: "p1", name: "Omkar V", relation: "Self", avatar: "/images/misc/patient_omkar.png" },
  { id: "p2", name: "Ramesh V", relation: "Father", avatar: "/assets/doctor_1.png" },
  { id: "p3", name: "Saraswathi V", relation: "Mother", avatar: "/assets/doctor_2.png" },
  { id: "p4", name: "Ananya V", relation: "Daughter", avatar: "/assets/doctor_2.png" }
];

/* ─── ANIMATED PLACEHOLDER COMPONENT ─────────────────────── */
const PLACEHOLDER_INTENTS = [
  "Book an appointment with Dr. Sonakshi Sinha…",
  "How is my heart health looking?",
  "Explain my recent blood report results…",
  "I've been feeling chest tightness lately…",
  "Find a cardiologist near me…",
  "What does my HbA1c level mean?",
  "Schedule a follow-up for my diabetes…",
  "I need a second opinion on my MRI results…",
  "What are the next steps after my surgery?",
  "Can Pulse AI summarise my last 3 reports?",
];

function AnimatedPlaceholder({ visible }: { visible: boolean }) {
  const [index, setIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [phase, setPhase] = useState<"typing" | "hold" | "erasing">("typing");

  useEffect(() => {
    if (!visible) return;
    const target = PLACEHOLDER_INTENTS[index];
    let timeout: ReturnType<typeof setTimeout>;

    if (phase === "typing") {
      if (displayed.length < target.length) {
        timeout = setTimeout(() => {
          setDisplayed(target.slice(0, displayed.length + 1));
        }, 38);
      } else {
        timeout = setTimeout(() => setPhase("hold"), 1800);
      }
    } else if (phase === "hold") {
      timeout = setTimeout(() => setPhase("erasing"), 400);
    } else if (phase === "erasing") {
      if (displayed.length > 0) {
        timeout = setTimeout(() => {
          setDisplayed(displayed.slice(0, -1));
        }, 18);
      } else {
        setIndex(i => (i + 1) % PLACEHOLDER_INTENTS.length);
        setPhase("typing");
      }
    }

    return () => clearTimeout(timeout);
  }, [phase, displayed, index, visible]);

  if (!visible) return null;
  return (
    <span
      style={{
        position: "absolute",
        left: "18px",
        top: "50%",
        transform: "translateY(-50%)",
        pointerEvents: "none",
        color: "#94a3b8",
        fontSize: "13.5px",
        whiteSpace: "nowrap",
        overflow: "hidden",
        zIndex: 1
      }}
    >
      {displayed}
      <span
        style={{
          display: "inline-block",
          width: "1.5px",
          height: "14px",
          background: "linear-gradient(180deg, #8b5cf6, #06b6d4)",
          marginLeft: "1px",
          verticalAlign: "middle",
          animation: "cursorBlink 1s step-end infinite"
        }}
      />
    </span>
  );
}

/* ─── MAIN WORKSPACE ──────────────────────────────────────── */
function Workspace({
  onClose, initialQuery, clearInitialQuery,
  initialAction, initialActionData, clearInitialAction,
  isLoggedIn, setIsLoggedIn,
  isMaximized, onToggleMaximize
}: {
  onClose: () => void;
  initialQuery?: string;
  clearInitialQuery?: () => void;
  initialAction?: string | null;
  initialActionData?: any;
  clearInitialAction?: () => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (val: boolean) => void;
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
}) {
  // Associated Accounts Profiles selector
  const [activeProfile, setActiveProfile] = useState(ASSOCIATED_PROFILES[0]);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  // Onboarding / Tutorial state tracker
  const [tutorialStep, setTutorialStep] = useState<"welcome" | "triage_prefilled" | "triage_sent" | "report_prefilled" | "report_sent" | "done">("done");
  const [spotlightDismissed, setSpotlightDismissed] = useState(true);

  const [msgs, setMsgs] = useState<Message[]>([]);

  const [input, setInput]             = useState("");
  const [isThinking, setIsThinking]   = useState(false);
  const [activeConvo, setActiveConvo] = useState<string | null>(null);
  const [history]                     = useState<Convo[]>(HISTORY);
  const [showLogin, setShowLogin]     = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ type: string; data?: unknown } | null>(null);
  const [organDetailPopup, setOrganDetailPopup] = useState<OrganHealth | null>(null);
  const [showPlusMenu, setShowPlusMenu]   = useState(false);
  const [showRightPanelDropdown, setShowRightPanelDropdown] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const fileRef                           = useRef<HTMLInputElement>(null);
  const chatRef                           = useRef<HTMLDivElement>(null);
  const inputRef                          = useRef<HTMLTextAreaElement>(null);
  const topMenuRef                        = useRef<HTMLDivElement>(null);
  const [showGoToTop, setShowGoToTop]     = useState(false);

  const [activeChipId, setActiveChipId] = useState<string | null>(null);

  const handlePrefillPrompt = useCallback((prefix: string, chipId: string) => {
    setInput(prefix);
    setActiveChipId(chipId);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.selectionStart = prefix.length;
        inputRef.current.selectionEnd = prefix.length;
      }
    }, 50);
  }, []);

  const scrollToTopMenu = useCallback(() => {
    if (chatRef.current) {
      chatRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" }), 80);
  }, []);
  useEffect(() => { scrollToBottom(); }, [msgs, scrollToBottom]);

  useEffect(() => {
    const el = chatRef.current;
    if (!el) return;
    const handleScroll = () => {
      if (el.scrollTop > 80 && msgs.length > 0 && !isThinking) {
        setShowGoToTop(true);
      } else {
        setShowGoToTop(false);
      }
    };
    el.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => el.removeEventListener("scroll", handleScroll);
  }, [msgs.length, isThinking]);

  const injectAI = useCallback((partial: Partial<Message>, delay = 1600) => {
    const thinkId = `think-${Date.now()}`;
    setIsThinking(true);

    if (partial.rtype === "doctors" && partial.text) {
      // Split into empathy and bold suggestion
      const lines = partial.text.split("\n");
      const empathyText = lines[0] || "";
      const suggestionText = lines[1] || "";
      const docMsgId = `ai-progressive-${Date.now()}`;

      // 1. Show thinking, then append Empathy Msg
      setMsgs(prev => [...prev, { id: thinkId, role: "ai", text: "", ts: new Date(), isThinking: true }]);
      
      setTimeout(() => {
        const initMsg: Message = {
          id: docMsgId,
          role: "ai",
          text: empathyText,
          ts: new Date(),
          rtype: "text"
        };
        setMsgs(prev => [...prev.filter(m => m.id !== thinkId), initMsg]);

        // 2. Add next suggestion text within the same bubble
        setTimeout(() => {
          setMsgs(prev => prev.map(m => {
            if (m.id === docMsgId) {
              return { ...m, text: empathyText + "\n" + suggestionText };
            }
            return m;
          }));

          // 3. Load doctor cards in the same bubble
          setTimeout(() => {
            setMsgs(prev => prev.map(m => {
              if (m.id === docMsgId) {
                return {
                  ...m,
                  rtype: "doctors",
                  doctors: partial.doctors,
                  followUps: partial.followUps
                };
              }
              return m;
            }));
            setIsThinking(false);
          }, 1800);

        }, 2200);

      }, 1600);

    } else {
      // Standard non-progressive route
      setMsgs(prev => [...prev, { id: thinkId, role: "ai", text: "", ts: new Date(), isThinking: true }]);
      setTimeout(() => {
        setMsgs(prev => [
          ...prev.filter(m => m.id !== thinkId),
          { id: `ai-${Date.now()}`, role: "ai", text: "", ts: new Date(), ...partial } as Message
        ]);
        setIsThinking(false);
      }, delay + Math.random() * 400);
    }
  }, []);

  const sendMessage = useCallback((text: string) => {
    if (!text.trim() || isThinking) return;
    setActiveChipId(null);

    // INTERCEPT IF TUTORIAL SIMULATION IS ACTIVE
    if (tutorialStep === "triage_prefilled") {
      const userMsg: Message = { id: `u-${Date.now()}`, role: "user", text: text.trim(), ts: new Date() };
      setMsgs(prev => [...prev, userMsg]);
      setInput("");
      setTutorialStep("triage_sent");
      setIsThinking(true);

      const resp = {
        rtype: "doctors" as const,
        text: "I understand that dealing with a sudden tension headache since morning can be quite draining and disruptive. Based on your profile health history (mild cervical wellness records), your preferred clinic location at Narayana City Clinic, and the fact that Dr. Vikas Yadav is your most visited specialist, we have retrieved the best matched pathways.\n**We suggest choosing the recommended specialist below to review and schedule available calendar slots (such as Today, 04:00 PM).**",
        doctors: [
          {
            id: "d-neuro",
            name: "Dr. Vikas Yadav",
            qualification: "MD, DM - Neurology",
            speciality: "Neurologist · Narayana City Clinic",
            hospital: "Narayana City Clinic",
            slot: "Today, 04:00 PM",
            price: "₹800",
            rating: 4.8,
            photo: "/assets/doctor_1.png"
          }
        ]
      };

      injectAI(resp);

      // Show report simulation guide bubble after progressive unfolding finishes (5.8 seconds)
      setTimeout(() => {
        const nextMsg: Message = {
          id: `ai-next-${Date.now()}`,
          role: "ai",
          text: "Excellent! That is profile-based doctor matching and reasoning. Next, let's explore reading a lab report. Click below to simulate attaching a PDF:",
          ts: new Date(),
          rtype: "tutorial_step_report"
        };
        setMsgs(prev => [...prev, nextMsg]);
        setSpotlightDismissed(false);
      }, 5800);

      return;
    }

    if (tutorialStep === "report_prefilled") {
      const userMsg: Message = { id: `u-${Date.now()}`, role: "user", text: text.trim(), ts: new Date() };
      setMsgs(prev => [...prev, userMsg]);
      setInput("");
      setTutorialStep("report_sent");
      setIsThinking(true);

      setTimeout(() => {
        setIsThinking(false);
        const aiMsg1: Message = {
          id: `ai-report-${Date.now()}`,
          role: "ai",
          text: "I scanned the report. Here is the translated summary table of key values:",
          ts: new Date(),
          rtype: "report",
          reportItems: [
            { name: "Hemoglobin", value: "13.2", unit: "g/dL", range: "12 – 16", status: "normal" },
            { name: "Blood Glucose", value: "112", unit: "mg/dL", range: "70 – 100", status: "high" },
            { name: "Platelets", value: "2.4", unit: "L/μL", range: "1.5 – 4.5", status: "normal" }
          ],
          reportNote: "Blood Glucose is slightly elevated (Review). If this is persistent, consult a General Physician."
        };
        const aiMsg2: Message = {
          id: `ai-finish-${Date.now()}`,
          role: "ai",
          text: "You've successfully completed the quick guided tour! You now know how to interact with Pulse.ai. Start typing anything to ask a question or explore further.",
          ts: new Date(),
          rtype: "tutorial_completed"
        };
        setMsgs(prev => [...prev, aiMsg1, aiMsg2]);
        setSpotlightDismissed(false);
      }, 1500);
      return;
    }

    // Default regular message route
    const userMsg: Message = { id: `u-${Date.now()}`, role: "user", text: text.trim(), ts: new Date() };
    setMsgs(prev => [...prev, userMsg]);
    setInput("");
    const resp = aiResponse(text, isLoggedIn, activeProfile.name);
    injectAI(resp);
  }, [isThinking, isLoggedIn, injectAI, tutorialStep, activeProfile]);

  const handleAction = useCallback((type: string, data?: unknown) => {
    switch (type) {
      case "start_tutorial_triage": {
        setInput("I have a sudden headache since morning");
        setTutorialStep("triage_prefilled");
        setSpotlightDismissed(false);
        inputRef.current?.focus();
        break;
      }
      case "start_tutorial_report":
      case "prefill_report": {
        setInput("📎 blood_report_jan2025.pdf");
        setTutorialStep("report_prefilled");
        setSpotlightDismissed(false);
        inputRef.current?.focus();
        break;
      }
      case "skip_tutorial":
      case "finish_tutorial": {
        try {
          sessionStorage.setItem("pulse_has_onboarded", "true");
        } catch {}
        setTutorialStep("done");
        setMsgs([]);
        break;
      }
      case "execute_query": {
        const query = data as string;
        sendMessage(query);
        break;
      }
      case "book_now": {
        const doc = data as Doctor;
        const slotMsg: Message = { id: `slot-${Date.now()}`, role: "ai", text: `Great choice! Select a date and time to see ${doc.name}.`, ts: new Date(), rtype: "slot_picker", slotDoctor: doc };
        setMsgs(prev => [...prev, slotMsg]);
        break;
      }
      case "confirm_slot": {
        const { doctor, slot, type: vtype, clinic, fee } = (data || {}) as {
          doctor?: Doctor; slot?: string; type?: string; clinic?: string; fee?: number;
        };
        const lastSlotMsg = msgs.slice().reverse().find(m => m.rtype === "slot_picker");
        const doc = doctor || lastSlotMsg?.slotDoctor || MOCK_DOCTORS[0];
        const finalClinic = clinic || (vtype === "video" ? "Narayana Tele-Health" : doc.hospital || "Mazumdar Shaw Medical Centre");

        if (!isLoggedIn) {
          setPendingAction({ type: "confirm_slot", data });
          injectAI({
            text: "To finalize your booking, please enter your mobile number to sign in or register:",
            rtype: "inline_phone_input"
          }, 300);
        } else {
          injectAI({
            text: `Here is your order summary for **${doc.name}** at **${finalClinic}**. Please review your member discount, apply coupons, and complete payment:`,
            rtype: "order_summary",
            orderSummaryData: {
              doctor: doc,
              slot: slot || "Tomorrow, 09:15 AM",
              visitType: vtype || "hospital",
              clinicName: finalClinic,
              fee: fee || 800
            }
          }, 500);
        }
        break;
      }
      case "submit_inline_phone": {
        const phone = data as string;
        // 1. Show user message in chat
        setMsgs(prev => [...prev, {
          id: `usr-phone-${Date.now()}`,
          role: "user",
          text: `+91 ${phone}`,
          ts: new Date()
        }]);
        // 2. Inject AI message to ask for OTP
        injectAI({
          text: `Please verify your phone number. We have sent a 4-digit verification code to +91 XXXXX XX${phone.slice(-3)}.`,
          rtype: "inline_otp_input",
          inlinePhone: phone
        }, 600);
        break;
      }
      case "submit_inline_otp": {
        const otp = data as string;
        // 1. Show user message in chat
        setMsgs(prev => [...prev, {
          id: `usr-otp-${Date.now()}`,
          role: "user",
          text: `OTP entered: ${otp}`,
          ts: new Date()
        }]);
        // 2. Simulate login success and sync session state
        setIsLoggedIn(true);
        if (typeof window !== "undefined") {
          sessionStorage.setItem("isLoggedIn", "true");
          window.dispatchEvent(new Event("login-state-changed"));
        }
        // 3. Inject AI response message
        injectAI({
          text: "🎉 Login successful! Welcome back, Omkar V. Resuming your booking details...",
          rtype: "text"
        }, 400);
        break;
      }
      case "complete_payment": {
        const { doctor, slot, visitType: vtype, clinicName, payMethod, amount } = data as {
          doctor: Doctor; slot: string; visitType: string; clinicName: string; payMethod: string; amount: number;
        };
        injectAI({
          text: `✅ Payment of **₹${amount}** via **${payMethod}** successful! Your appointment with **${doctor?.name || "Dr. Pradeep R Kumar"}** is confirmed for **${slot}** (${vtype === "video" ? "Video Consultation" : clinicName}).`,
          rtype: "booking_confirm",
          slotDoctor: doctor,
          followUps: ["Add appointment to my calendar", "Get directions to hospital", "Book another appointment"],
        }, 600);
        break;
      }
      case "booking_confirmed": {
        const { doctor, slot, vtype } = data as { doctor: Doctor; slot: string; vtype: string };
        injectAI({
          text: `✅ Your appointment with **${doctor.name}** is confirmed for **${slot}** (${vtype === "video" ? "Video Consultation" : "Hospital Visit"}).`,
          rtype: "booking_confirm",
          slotDoctor: doctor,
          followUps: ["Add appointment to my calendar", "Get directions to hospital", "Book another appointment"],
        }, 800);
        break;
      }
      case "view_organ_detail":
        setOrganDetailPopup(data as OrganHealth);
        break;
      case "consult":
        sendMessage("Book appointment with recommended specialist");
        break;
      case "show_login":
        setShowLogin(true);
        break;
      case "show_register":
        setShowRegister(true);
        break;
      case "follow_up":
        sendMessage(data as string);
        break;
      case "submit_symptoms": {
        const symptoms = data as string;
        // Post user bubble showing selected symptoms
        const userSymptomMsg: Message = {
          id: `u-sym-${Date.now()}`,
          role: "user",
          text: `I am experiencing: ${symptoms}`,
          ts: new Date()
        };
        setMsgs(prev => [...prev, userSymptomMsg]);
        // Analyse via aiResponse with prefixed key
        const resp = aiResponse(`selected symptoms: ${symptoms}`, isLoggedIn, activeProfile.name);
        injectAI(resp, 1400);
        break;
      }
      default:
        break;
    }
  }, [isLoggedIn, injectAI, sendMessage, activeProfile]);


  // After login, resume pending action
  useEffect(() => {
    if (isLoggedIn && pendingAction) {
      const action = pendingAction;
      setPendingAction(null);
      handleAction(action.type, action.data);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  

  const initialQueryProcessed = useRef(false);

  // Execute external query from Hero search CTA
  useEffect(() => {
    if (initialQuery && !initialQueryProcessed.current) {
      initialQueryProcessed.current = true;
      const trimmed = initialQuery.trim();
      // "I have been having" chip → skip sending a half-sentence; show symptom selector directly
      if (trimmed === "I have been having" || trimmed === "I have been having ") {
        const aiMsg: Message = {
          id: `ai-sym-${Date.now()}`,
          role: "ai",
          text: "To help us recommend the right specialist, please describe what you are feeling or select any of the common symptoms below:",
          ts: new Date(),
          rtype: "symptom_selector"
        };
        setMsgs([aiMsg]);
      } else {
        sendMessage(trimmed);
      }
      clearInitialQuery?.();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  const initialActionProcessed = useRef(false);

  // Execute external slot booking direct action from Hero search
  useEffect(() => {
    if (initialAction && initialActionData && !initialActionProcessed.current) {
      initialActionProcessed.current = true;

      if (initialAction === "require_login_module") {
        const { moduleName, query } = initialActionData as { moduleName: string; query: string };
        
        // Setup welcome message explaining what the module can do, but requiring login
        const introMsg: Message = {
          id: `intro-${Date.now()}`,
          role: "ai",
          text: `Welcome to **${moduleName}**! Here you can get insights from your medical history, review your lab reports, and analyze your organ health. To access these personalized features, please verify your mobile number:`,
          ts: new Date()
        };
        setMsgs([introMsg]);
        
        // Save the eventual query to run after login
        setPendingAction({ type: "execute_query", data: query });
        
        // Inject the inline phone input immediately
        injectAI({
          text: "Enter your mobile number to sign in or register:",
          rtype: "inline_phone_input"
        }, 300);
        
        clearInitialAction?.();
        return;
      }

      const doc = initialActionData as any;
      
      // Setup natural booking conversation history
      const userMsg: Message = { 
        id: `u-${Date.now()}`, 
        role: "user", 
        text: `Book appointment with ${doc.name}`, 
        ts: new Date() 
      };
      setMsgs([userMsg]);
      
      // Directly open slot picker
      handleAction(initialAction, initialActionData);
      
      clearInitialAction?.();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialAction, initialActionData]);

  const handleLogin = () => {
    setIsLoggedIn(true);
    setShowLogin(false);
    setShowRegister(false);
  };

  const handleRegister = () => {
    setIsLoggedIn(true);
    setShowRegister(false);
    setShowLogin(false);
  };

  // Handle file upload via + menu
  const handleFileUpload = (file: File) => {
    setShowPlusMenu(false);
    const uploadingMsg: Message = {
      id: `upload-${Date.now()}`, role: "ai", text: "",
      ts: new Date(), rtype: "upload_state", uploadStage: "uploading", uploadFileName: file.name
    };
    setMsgs(prev => [...prev, uploadingMsg]);

    setTimeout(() => {
      setMsgs(prev => prev.map(m =>
        m.id === uploadingMsg.id ? { ...m, uploadStage: "analyzing" as const } : m
      ));
      setTimeout(() => {
        setMsgs(prev => prev.filter(m => m.id !== uploadingMsg.id));
        injectAI({
          text: `I've analysed your uploaded report **${file.name}**. Here's what I found:`,
          rtype: "health_analysis",
          reportItems: MOCK_REPORT,
          reportNote: "⚠️ Fasting blood sugar and LDL are slightly elevated. I recommend a follow-up with your doctor.",
          followUps: ["Book diabetes consult", "Explain findings", "Save to health records", "Upload another report"],
        }, 1200);
      }, 2000);
    }, 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInput(val);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 140) + "px";

    if (activeChipId) {
      let expectedPrefix = "";
      if (activeChipId === "symptom" || activeChipId === "find_symptom") expectedPrefix = "I have been having ";
      else if (activeChipId === "speciality" || activeChipId === "find_speciality") expectedPrefix = "I am looking for a ";
      else if (activeChipId === "doctor" || activeChipId === "find_doctor") expectedPrefix = "I want to consult Dr. ";
      else if (activeChipId === "report") expectedPrefix = "Please analyse report ";

      if (!val.startsWith(expectedPrefix)) {
        setActiveChipId(null);
      }
    }
  };

  return (
    <div className={`${styles.workspaceLayout} ${isMaximized ? styles.workspaceLayoutMaximized : ""}`}>
      {/* SIDEBAR — visible when maximized */}
      {isMaximized && (
        <div className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <div className={styles.sidebarBrand}>
              <img src="/assets/Pulse AI logo.svg" alt="Pulse AI" style={{ height: "30px" }} />
            </div>
            <button className={styles.sidebarClose} onClick={onClose} aria-label="Close Pulse AI">
              <X size={16} />
            </button>
          </div>
          <button className={styles.newChatBtn} onClick={() => { setMsgs([]); setInput(""); }}>
            <Plus size={14} /> New Chat
          </button>
          <div className={styles.historyLabel}>
            <History size={12} /> Recent
          </div>
          <div className={styles.historyList}>
            {history.map(c => (
              <button key={c.id} className={`${styles.historyItem} ${activeConvo === c.id ? styles.historyItemActive : ""}`}
                onClick={() => setActiveConvo(c.id)}>
                <MessageSquare size={14} className={styles.historyIcon} />
                <div className={styles.historyContent}>
                  <div className={styles.historyTitle}>{c.title}</div>
                  <div className={styles.historyPreview}>{c.preview}</div>
                  <div className={styles.historyTs}>{c.ts}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
      {/* CENTER CHAT */}
      <div className={styles.chatArea}>
        <div className={styles.chatHeader}>
          <div className={styles.chatHeaderLeft}>
            <button 
              onClick={() => {
                if (msgs.length > 0) {
                  setMsgs([]);
                } else if (onClose) {
                  onClose();
                }
              }}
              style={{ background: "none", border: "none", cursor: "pointer", padding: "6px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#1e293b", transition: "background 0.2s" }}
              title="Back"
            >
              <ArrowLeft size={20} />
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <img src="/assets/Pulse AI logo.svg" alt="Pulse AI Logo" style={{ height: "32px" }} />
            </div>
          </div>
          <div className={styles.chatHeaderRight} style={{ position: "relative" }}>
            {isLoggedIn ? (
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className={styles.userProfilePill}
                  style={{ cursor: "pointer", border: "1px solid rgba(0,0,0,0.08)", background: "#f8fafc", display: "flex", alignItems: "center", gap: "6px", padding: "6px 12px", borderRadius: "20px", transition: "all 0.2s" }}
                >
                  <img src={activeProfile.avatar} alt={activeProfile.name} className={styles.userPillAvatar} />
                  <span className={styles.userPillName}>{activeProfile.name}</span>
                  <ChevronDown size={14} style={{ opacity: 0.6, transform: showProfileDropdown ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
                </button>

                {showProfileDropdown && (
                  <div
                    style={{
                      position: "absolute",
                      top: "calc(100% + 8px)",
                      right: 0,
                      background: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "12px",
                      boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
                      width: "220px",
                      zIndex: 1000,
                      padding: "6px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px"
                    }}
                  >
                    <div style={{ padding: "6px 10px", fontSize: "10px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Associated Profiles
                    </div>
                    {ASSOCIATED_PROFILES.map(p => (
                      <button
                        key={p.id}
                        onClick={() => {
                          setActiveProfile(p);
                          setShowProfileDropdown(false);
                          setMsgs(prev => [
                            ...prev,
                            {
                              id: `sys-switch-${Date.now()}`,
                              role: "ai",
                              text: `Patient context switched to **${p.name} (${p.relation})**. Pulse is now retrieving matching history and parameters for **${p.name}**.`,
                              ts: new Date(),
                              rtype: "text"
                            }
                          ]);
                        }}
                        style={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          padding: "8px 10px",
                          borderRadius: "8px",
                          background: activeProfile.id === p.id ? "#f1f5f9" : "transparent",
                          border: "none",
                          cursor: "pointer",
                          textAlign: "left",
                          transition: "background 0.15s"
                        }}
                        onMouseEnter={e => {
                          if (activeProfile.id !== p.id) e.currentTarget.style.background = "#f8fafc";
                        }}
                        onMouseLeave={e => {
                          if (activeProfile.id !== p.id) e.currentTarget.style.background = "transparent";
                        }}
                      >
                        <img src={p.avatar} alt={p.name} style={{ width: "24px", height: "24px", borderRadius: "50%", background: "#e2e8f0" }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: "12.5px", fontWeight: 700, color: "#1e293b" }}>{p.name}</div>
                          <div style={{ fontSize: "10px", color: "#64748b" }}>{p.relation}</div>
                        </div>
                        {activeProfile.id === p.id && (
                          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#034ea2" }} />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <button className={styles.loginTriggerBtn} onClick={() => setShowLogin(true)}>
                Sign In
              </button>
            )}
            <button
              className={styles.headerIconBtn}
              style={{ marginLeft: "6px" }}
              onClick={onToggleMaximize}
              title={isMaximized ? "Restore window view" : "Expand to full screen"}
            >
              {isMaximized ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
            <button className={styles.headerIconBtn} style={{ marginLeft: "4px" }} onClick={onClose} title="Close Pulse AI">
              <X size={18} />
            </button>
          </div>
        </div>

        {showDisclaimer && (
          <div className={styles.disclaimerBar}>
            <div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <AlertCircle size={13} style={{ color: "#b45309", flexShrink: 0 }} />
                <span>
                  Pulse AI is a support assistant to guide your health journey. For any diagnosis, treatment, or medical decisions, please always seek final clinical advice from a licensed physician.
                </span>
              </div>
              <button onClick={(e) => { e.stopPropagation(); setShowDisclaimer(false); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#b45309", display: "flex", alignItems: "center", justifyContent: "center", padding: "2px", marginLeft: "12px", flexShrink: 0 }} aria-label="Close disclaimer">
                <X size={14} />
              </button>
            </div>
          </div>
        )}

        <div className={styles.chatMessages} ref={chatRef} data-lenis-prevent>
          <div ref={topMenuRef} id="pulse-main-menu-top" style={{ display: "flex", flexDirection: "column", width: "100%", justifyContent: "center", alignItems: "center" }}>
            <div style={{ maxWidth: "800px", width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <WelcomeScreen onPrompt={sendMessage} onPrefill={handlePrefillPrompt} activeChipId={activeChipId} isLoggedIn={isLoggedIn} userName={activeProfile.name} />
            </div>
          </div>

          {msgs.length > 0 && (
            <div className={styles.msgList} style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px dashed rgba(139, 92, 246, 0.2)" }}>
              {msgs.map(m => (
                <MsgBubble key={m.id} msg={m} onAction={handleAction} onPrefill={handlePrefillPrompt} activeChipId={activeChipId} userName={activeProfile.name} tutorialStep={tutorialStep} />
              ))}
            </div>
          )}
        </div>

        {/* Floating Go To Top Menu Button */}
        <AnimatePresence>
          {showGoToTop && (
            <motion.button
              initial={{ opacity: 0, y: 12, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              onClick={scrollToTopMenu}
              className={styles.goToTopMenuBtn}
              aria-label="Go to top menu"
            >
              <div className={styles.goToTopIconWrap}>
                <ChevronUp size={15} className={styles.goToTopIcon} />
              </div>
              <span className={styles.goToTopText}>Go to top menu</span>
            </motion.button>
          )}
        </AnimatePresence>



        {/* Input Bar */}
        <div className={styles.inputBar} style={{ position: "relative" }}>
          <AnimatePresence>
            {activeChipId && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className={styles.prefillGuideTooltip}
                style={{
                  position: "absolute",
                  bottom: "76px",
                  left: "50%",
                  zIndex: 100
                }}
              >
                <span style={{ marginRight: "6px" }}>✍️</span>
                <span>
                  {activeChipId.includes("symptom") && "Complete typing your symptoms (e.g. fever, headache)"}
                  {activeChipId.includes("speciality") && "Complete typing the speciality (e.g. cardiologist)"}
                  {activeChipId.includes("doctor") && "Complete typing the doctor's name"}
                  {activeChipId === "report" && "Complete typing the report name"}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          <div style={{ maxWidth: "800px", width: "100%", display: "flex", alignItems: "flex-end", gap: "8px", margin: "0 auto" }}>
            <div className={styles.plusMenuWrap}>
              <button className={styles.circularPlusBtn} onClick={() => setShowPlusMenu(p => !p)} aria-label="Attach file">
                <Plus size={18} />
              </button>
              <AnimatePresence>
                {showPlusMenu && (
                  <motion.div className={styles.plusMenu}
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.18 }}>
                    <button className={styles.plusMenuItem} onClick={() => fileRef.current?.click()}>
                      <FileText size={20} color="#8b5cf6" />
                      <div>
                        <div className={styles.plusMenuLabel}>Files</div>
                        <div className={styles.plusMenuSub}>Supported: PDF · File size less than 10 MB</div>
                      </div>
                    </button>
                    <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className={styles.hiddenInput}
                      onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); e.target.value = ""; }} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className={styles.pillInputWrap} style={{ position: "relative" }}>
              <AnimatedPlaceholder visible={!input && !isThinking} />
              <textarea ref={inputRef} value={input} onChange={handleInputChange} onKeyDown={handleKeyDown}
                placeholder="" className={styles.pillChatInput} rows={1} disabled={isThinking} />

              {input.trim() ? (
                <button 
                  className={`${styles.sendInsideBtn} ${(tutorialStep === "triage_prefilled" || tutorialStep === "report_prefilled") ? styles.pulseSendGlow : ""}`} 
                  onClick={() => sendMessage(input)} 
                  aria-label="Send message"
                >
                  <Send size={16} />
                </button>
              ) : (
                <button className={styles.micInsideBtn} aria-label="Voice input">
                  <Mic size={18} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Onboarding Spotlight Overlay */}
        {!spotlightDismissed && tutorialStep !== "done" && (
          <div className={styles.spotlightOverlay}>
            <div className={styles.spotlightDimmer} style={(tutorialStep === "triage_sent" || tutorialStep === "report_sent") ? { background: "rgba(15,23,42,0.08)" } : undefined} onClick={() => setSpotlightDismissed(true)} />
            {tutorialStep === "welcome" && (
              <div className={styles.spotlightTooltip} style={{ bottom: "240px" }}>
                <div className={styles.spotlightStep}>Guided Tour · Step 1 of 3</div>
                <div className={styles.spotlightHeadline}>Try a simulated scenario</div>
                <div className={styles.spotlightDesc}>
                  Select either <strong>🩺 Describe what you&apos;re feeling</strong> or <strong>📄 Scan Medical Report</strong> to see a live-chat demo.
                </div>
                <div className={styles.spotlightActions}>
                  <button className={styles.spotlightDismiss} onClick={() => { setTutorialStep("done"); setSpotlightDismissed(true); sessionStorage.setItem("pulse_has_onboarded", "true"); }}>
                    Skip tour
                  </button>
                  <button className={styles.spotlightGotIt} onClick={() => setSpotlightDismissed(true)}>
                    Got it
                  </button>
                </div>
                <div className={styles.spotlightArrow} />
              </div>
            )}

            {tutorialStep === "triage_prefilled" && (
              <>
                <div className={styles.spotlightPulseRing} style={{ bottom: "28px" }} />
                <div className={styles.spotlightTooltip}>
                  <div className={styles.spotlightStep}>Guided Tour · Step 2 of 3</div>
                  <div className={styles.spotlightHeadline}>Send the query!</div>
                  <div className={styles.spotlightDesc}>
                    We prefilled the question for you. Click the blue send button in the input bar below to send it to the clinical AI.
                  </div>
                  <div className={styles.spotlightActions}>
                    <button className={styles.spotlightDismiss} onClick={() => { setTutorialStep("done"); setSpotlightDismissed(true); sessionStorage.setItem("pulse_has_onboarded", "true"); }}>
                      Skip
                    </button>
                    <button className={styles.spotlightGotIt} onClick={() => setSpotlightDismissed(true)}>
                      Got it
                    </button>
                  </div>
                  <div className={styles.spotlightArrow} />
                </div>
              </>
            )}

            {tutorialStep === "triage_sent" && (
              <>
                <div className={styles.spotlightTooltip} style={{ bottom: "280px" }}>
                  <div className={styles.spotlightStep}>Guided Tour · Doctor Matching Completed</div>
                  <div className={styles.spotlightHeadline}>Clinical Matching Done</div>
                  <div className={styles.spotlightDesc}>
                    This is how doctor matching and clinical reasoning works. You can now try analyzing a medical lab report. **Click Next: Document Analysis below to proceed.**
                  </div>
                  <div className={styles.spotlightActions}>
                    <button className={styles.spotlightDismiss} onClick={() => { setTutorialStep("done"); setSpotlightDismissed(true); sessionStorage.setItem("pulse_has_onboarded", "true"); }}>
                      Skip to Main App
                    </button>
                    <button className={styles.spotlightGotIt} onClick={() => { setTutorialStep("report_prefilled"); setSpotlightDismissed(false); }}>
                      Next: Document Analysis
                    </button>
                  </div>
                </div>
              </>
            )}

            {tutorialStep === "report_prefilled" && (
              <>
                <div className={styles.spotlightTooltip} style={{ bottom: "200px" }}>
                  <div className={styles.spotlightStep}>Guided Tour · Step 3 of 3</div>
                  <div className={styles.spotlightHeadline}>Analyze report</div>
                  <div className={styles.spotlightDesc}>
                    **Click the pulsing purple "Simulate Report Attachment" button** inside the chat bubble above to upload and translate the lab report parameters.
                  </div>
                  <div className={styles.spotlightActions}>
                    <button className={styles.spotlightDismiss} onClick={() => { setTutorialStep("done"); setSpotlightDismissed(true); sessionStorage.setItem("pulse_has_onboarded", "true"); }}>
                      Skip
                    </button>
                    <button className={styles.spotlightGotIt} onClick={() => setSpotlightDismissed(true)}>
                      Got it
                    </button>
                  </div>
                  <div className={styles.spotlightArrow} />
                </div>
              </>
            )}

            {tutorialStep === "report_sent" && (
              <>
                <div className={styles.spotlightTooltip} style={{ bottom: "240px" }}>
                  <div className={styles.spotlightStep}>Guided Tour · Completed</div>
                  <div className={styles.spotlightHeadline}>Report Analysis Done</div>
                  <div className={styles.spotlightDesc}>
                    Pulse parsed the report variables successfully. **Click the pulsing blue "Start Chat Workspace" button** inside the chat bubble to enter the full app workspace.
                  </div>
                  <div className={styles.spotlightActions}>
                    <button className={styles.spotlightDismiss} onClick={() => { setTutorialStep("done"); setSpotlightDismissed(true); sessionStorage.setItem("pulse_has_onboarded", "true"); }}>
                      Go to Main App
                    </button>
                    <button className={styles.spotlightGotIt} onClick={() => { setTutorialStep("done"); setSpotlightDismissed(true); sessionStorage.setItem("pulse_has_onboarded", "true"); }}>
                      Finish Tour
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>


      {/* ORGAN DETAIL POPUP */}
      <AnimatePresence>
        {organDetailPopup && (
          <OrganDetailPopup organ={organDetailPopup}
            onClose={() => setOrganDetailPopup(null)}
            onConsult={() => { setOrganDetailPopup(null); sendMessage("Book appointment with recommended specialist"); }} />
        )}
      </AnimatePresence>

      {/* LOGIN MODAL */}
      <AnimatePresence>
        {showLogin && <LoginModal onClose={() => setShowLogin(false)} onLogin={handleLogin} />}
      </AnimatePresence>

      {/* REGISTER MODAL */}
      <AnimatePresence>
        {showRegister && (
          <RegisterModal
            onClose={() => setShowRegister(false)}
            onRegister={handleRegister}
            onLoginInstead={() => { setShowRegister(false); setShowLogin(true); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── FLOATING TRIGGER ────────────────────────────────────── */
function PulseTrigger({ onClick }: { onClick: () => void }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // Auto-expand after page settle
    const expandTimer = setTimeout(() => {
      setIsExpanded(true);
    }, 2500);

    // Auto-collapse after 7 seconds of showing off
    const collapseTimer = setTimeout(() => {
      setIsExpanded(false);
    }, 9500);

    return () => {
      clearTimeout(expandTimer);
      clearTimeout(collapseTimer);
    };
  }, []);

  const handleHoverStart = () => {
    setIsHovered(true);
    setIsExpanded(true);
  };

  const handleHoverEnd = () => {
    setIsHovered(false);
    setTimeout(() => {
      setIsExpanded(false);
    }, 1200);
  };

  return (
    <motion.button
      onClick={onClick}
      onHoverStart={handleHoverStart}
      onHoverEnd={handleHoverEnd}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      initial={{ opacity: 0, y: 16, width: "56px" }}
      animate={{ 
        opacity: 1, 
        y: 0,
        width: isExpanded ? "330px" : "56px"
      }}
      transition={{ 
        width: { type: "spring", stiffness: 125, damping: 18, mass: 1 },
        opacity: { delay: 1.2, duration: 0.5 },
        y: { delay: 1.2, duration: 0.5 }
      }}
      style={{
        position: "fixed",
        bottom: "32px",
        left: "32px",
        zIndex: 900,
        display: "flex",
        alignItems: "center",
        height: "56px",
        borderRadius: "28px",
        background: "linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)",
        boxShadow: "0 8px 32px rgba(139,92,246,0.35), 0 2px 8px rgba(0,0,0,0.15)",
        border: "none",
        cursor: "pointer",
        padding: "4px",
        overflow: "hidden"
      }}
      aria-label="Open Pulse AI"
      id="pulse-ai-trigger"
    >
      {/* Pulse Ring (only when collapsed) */}
      {!isExpanded && (
        <motion.div
          style={{
            position: "absolute",
            inset: "-6px",
            borderRadius: "50%",
            border: "2px solid rgba(139,92,246,0.4)",
            pointerEvents: "none"
          }}
          animate={{ scale: [1, 1.35, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* Bubble inner (icon wrapper) */}
      <div style={{
        width: "48px",
        height: "48px",
        borderRadius: "50%",
        background: "rgba(255,255,255,0.15)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        transition: "background 0.2s"
      }}>
        <img src="/Logo/Pulse bubble.svg" alt="Pulse Bubble" style={{ width: "26px", height: "26px" }} />
      </div>

      {/* Text message (only when expanded) */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            style={{
              display: "flex",
              flexDirection: "column",
              paddingLeft: "10px",
              paddingRight: "12px",
              textAlign: "left",
              whiteSpace: "nowrap",
              overflow: "hidden"
            }}
          >
            <span style={{ fontSize: "13px", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.01em" }}>
              Consult Pulse AI ✦
            </span>
            <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.85)", fontWeight: 500, marginTop: "1px" }}>
              Hi, ask to book doctors or check health
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

const SHOWCASE_SLIDES = [
  {
    id: 0,
    title: "Smart Clinical Triage",
    desc: "Describe symptoms in plain text. Get immediate risk levels and direct department routing.",
    icon: Stethoscope,
    color: "#034ea2",
    badge: "CLINICAL TRIAGE"
  },
  {
    id: 1,
    title: "Lab Report Intelligence",
    desc: "Upload blood work/scans. Translate complex diagnostics into clear summaries instantly.",
    icon: FileText,
    color: "#06b6d4",
    badge: "DIAGNOSTIC INSIGHTS"
  },
  {
    id: 2,
    title: "Instant Booking Pathways",
    desc: "Match recommended care guidelines directly to slot bookings inside your chat.",
    icon: Calendar,
    color: "#8b5cf6",
    badge: "CARE PATHWAYS"
  }
];

/* ─── GATEWAY (BENEFIT HOOK LOGIN BANNER) ─────────────────── */
function PulseAIGateway({
  onLoginSuccess,
  onClose
}: {
  onLoginSuccess: () => void;
  onClose: () => void;
}) {
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const otpRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null),
                   useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % SHOWCASE_SLIDES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const handleOtpChange = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    setError(null);
    const next = [...otp]; next[i] = val; setOtp(next);
    if (val && i < 3) otpRefs[i + 1].current?.focus();
  };

  const handleOtpKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) otpRefs[i - 1].current?.focus();
  };

  const handleVerify = () => {
    if (otp.join("") !== "9999") {
      setError("Invalid OTP. Please use code 9999.");
      return;
    }
    setError(null);
    onLoginSuccess();
  };

  const canProceed = step === "phone" ? phone.length === 10 : otp.every(d => d !== "");

  return (
    <div className={styles.gatewayLayout}>
      <button className={styles.modalCloseBtn} onClick={onClose} aria-label="Close"><X size={18} /></button>
      
      {/* LEFT: SHOWCASE */}
      <div className={styles.gatewayShowcase}>
        <div className={styles.gatewayBrand}>
          <div className={styles.modalBrandLogo}><Heart size={20} color="#fff" fill="#fff" /></div>
          <span className={styles.gatewayBrandName}>Narayana Health <span style={{ color: "#06b6d4" }}>Pulse AI</span></span>
        </div>

        <h2 className={styles.showcaseTitle}>Unlock Pulse AI ✦</h2>
        <p className={styles.showcaseSubtitle}>
          Verify your identity to experience the next generation of clinical assistance.
        </p>

        <div style={{ flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "center", position: "relative", minHeight: "220px", overflow: "hidden", margin: "16px 0" }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlide}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              style={{ width: "100%" }}
            >
              <div className={styles.gatewayFeatureCard} style={{ background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)", padding: "18px 20px", flexDirection: "column", gap: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                  <div className={styles.featureIconWrap} style={{ color: SHOWCASE_SLIDES[activeSlide].color, background: "#ffffff" }}>
                    {React.createElement(SHOWCASE_SLIDES[activeSlide].icon, { size: 20 })}
                  </div>
                  <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.06em", color: "rgba(255, 255, 255, 0.45)", textTransform: "uppercase" }}>
                    {SHOWCASE_SLIDES[activeSlide].badge}
                  </span>
                </div>
                <div className={styles.featureText} style={{ marginTop: "6px" }}>
                  <h3 className={styles.featureTitle} style={{ fontSize: "15px", color: "#ffffff", fontWeight: 700 }}>
                    {SHOWCASE_SLIDES[activeSlide].title}
                  </h3>
                  <p className={styles.featureDesc} style={{ fontSize: "12.5px", color: "rgba(255, 255, 255, 0.7)", lineHeight: "1.45", marginTop: "4px" }}>
                    {SHOWCASE_SLIDES[activeSlide].desc}
                  </p>
                </div>
              </div>

              {/* High-Fidelity UI Preview Section */}
              <div style={{ marginTop: "14px", background: "rgba(15, 23, 42, 0.4)", borderRadius: "14px", border: "1px solid rgba(255, 255, 255, 0.12)", padding: "16px", width: "100%", boxShadow: "0 12px 36px rgba(0,0,0,0.3)" }}>
                {activeSlide === 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "10px", fontWeight: 800, color: "rgba(255,255,255,0.45)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Matched Specialist</span>
                      <span style={{ fontSize: "10px", background: "rgba(3, 78, 162, 0.45)", color: "#38bdf8", padding: "2px 8px", borderRadius: "9999px", fontWeight: 700 }}>🎯 98% Profile Match</span>
                    </div>
                    
                    <div style={{ display: "flex", gap: "12px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "12px", alignItems: "center" }}>
                      <img src="/assets/doctor_1.png" alt="Doctor" style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#e2e8f0" }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ fontSize: "13px", fontWeight: 700, color: "#ffffff" }}>Dr. Vikas Yadav</span>
                          <span style={{ fontSize: "10px", color: "#eab308" }}>⭐ 4.8</span>
                        </div>
                        <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)" }}>Neurologist • Narayana City Clinic</div>
                        <div style={{ fontSize: "10px", color: "#38bdf8", fontWeight: 600, marginTop: "2px" }}>Visited twice recently for tremors</div>
                      </div>
                      <button style={{ background: "#034ea2", color: "#fff", border: "none", fontSize: "11px", fontWeight: 700, padding: "6px 14px", borderRadius: "8px", cursor: "pointer", transition: "opacity 0.15s" }}>
                        Consult
                      </button>
                    </div>

                    <div style={{ display: "flex", gap: "6px", alignItems: "center", background: "rgba(3, 78, 162, 0.15)", borderRadius: "8px", padding: "8px 10px", border: "1px dashed rgba(3, 78, 162, 0.3)" }}>
                      <span style={{ fontSize: "13px" }}>💡</span>
                      <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.8)", lineHeight: "1.4" }}>
                        Suggested based on your history of **left hand tremors** &amp; **cervical spine wellness**.
                      </span>
                    </div>
                  </div>
                )}

                {activeSlide === 1 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "10px", fontWeight: 800, color: "rgba(255,255,255,0.45)", letterSpacing: "0.06em", textTransform: "uppercase" }}>AI Translated Insights</span>
                      <span style={{ fontSize: "10px", background: "rgba(6, 182, 212, 0.25)", color: "#22d3ee", padding: "2px 8px", borderRadius: "9999px", fontWeight: 700 }}>Patient-Friendly Summary</span>
                    </div>
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {/* Translated Sugar */}
                      <div style={{ background: "rgba(244, 63, 94, 0.08)", border: "1px solid rgba(244, 63, 94, 0.2)", borderRadius: "8px", padding: "10px", display: "flex", gap: "8px" }}>
                        <span style={{ fontSize: "14px" }}>⚠️</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "2px" }}>
                            <span style={{ color: "#ffffff", fontWeight: 700 }}>Blood Sugar (Fasting)</span>
                            <span style={{ color: "#fb7185", fontWeight: 700 }}>Slightly High</span>
                          </div>
                          <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)", lineHeight: "1.4" }}>
                            Your fasting sugar is slightly above average. **Reduce heavy sweets and carbs over the next few days.**
                          </p>
                        </div>
                      </div>

                      {/* Translated Cholesterol */}
                      <div style={{ background: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.2)", borderRadius: "8px", padding: "10px", display: "flex", gap: "8px" }}>
                        <span style={{ fontSize: "14px" }}>✅</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "2px" }}>
                            <span style={{ color: "#ffffff", fontWeight: 700 }}>Total Cholesterol</span>
                            <span style={{ color: "#34d399", fontWeight: 700 }}>Healthy &amp; Safe</span>
                          </div>
                          <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)", lineHeight: "1.4" }}>
                            Your fat levels are in a safe range. **Excellent job maintaining your dietary habits.**
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeSlide === 2 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "10px", fontWeight: 800, color: "rgba(255,255,255,0.45)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Direct Booking Pathways</span>
                      <span style={{ fontSize: "10px", background: "rgba(16, 185, 129, 0.2)", color: "#34d399", padding: "2px 8px", borderRadius: "9999px", fontWeight: 700 }}>⚡ Instant Scheduling</span>
                    </div>

                    <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", padding: "10px", display: "flex", flexDirection: "column", gap: "8px" }}>
                      <div style={{ fontSize: "11.5px", color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>Select Available Time Slot:</div>
                      
                      {/* Date Row Mockup */}
                      <div style={{ display: "flex", gap: "6px" }}>
                        <div style={{ flex: 1, background: "rgba(3, 78, 162, 0.3)", border: "1px solid #034ea2", borderRadius: "6px", padding: "4px 6px", textAlign: "center", fontSize: "10px", color: "#ffffff", fontWeight: 600 }}>
                          Today
                        </div>
                        <div style={{ flex: 1, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", padding: "4px 6px", textAlign: "center", fontSize: "10px", color: "rgba(255,255,255,0.6)" }}>
                          Tomorrow
                        </div>
                        <div style={{ flex: 1, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", padding: "4px 6px", textAlign: "center", fontSize: "10px", color: "rgba(255,255,255,0.6)" }}>
                          Fri, 17 Jul
                        </div>
                      </div>

                      {/* Time Row Mockup */}
                      <div style={{ display: "flex", gap: "6px", marginTop: "2px" }}>
                        <div style={{ flex: 1, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", padding: "4px", textAlign: "center", fontSize: "10px", color: "rgba(255,255,255,0.6)" }}>
                          09:15 AM
                        </div>
                        <div style={{ flex: 1, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", padding: "4px", textAlign: "center", fontSize: "10px", color: "rgba(255,255,255,0.6)" }}>
                          11:30 AM
                        </div>
                        <div style={{ flex: 1, background: "#10b981", border: "1px solid #10b981", borderRadius: "6px", padding: "4px", textAlign: "center", fontSize: "10px", color: "#ffffff", fontWeight: 700, boxShadow: "0 0 10px rgba(16,185,129,0.3)" }}>
                          04:00 PM ★
                        </div>
                      </div>
                    </div>

                    <button style={{ width: "100%", background: "#10b981", color: "#ffffff", border: "none", borderRadius: "8px", padding: "8px", fontSize: "12px", fontWeight: 700, cursor: "pointer", transition: "background 0.15s" }}>
                      ⚡ Confirm Slot Instantly
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Slider Dots */}
          <div style={{ display: "flex", gap: "6px", marginTop: "16px" }}>
            {SHOWCASE_SLIDES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveSlide(idx)}
                style={{
                  width: activeSlide === idx ? "20px" : "6px",
                  height: "6px",
                  borderRadius: "3px",
                  background: activeSlide === idx ? "#06b6d4" : "rgba(255,255,255,0.25)",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
                }}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        <div className={styles.gatewayTrustStrip}>
          <span>🛡️ HIPAA Secure</span>
          <span>⚡ Direct Care Routing</span>
          <span>👨‍⚕️ Expert Doctor Verified</span>
        </div>
      </div>

      {/* RIGHT: SIGN IN */}
      <div className={styles.gatewayFormPanel}>
        <div className={styles.gatewayFormCard}>
          <h3 className={styles.formCardTitle}>{step === "phone" ? "Secure Login" : "Verify OTP"}</h3>
          <p className={styles.formCardSubtitle}>
            {step === "phone" ? "Enter your mobile number to access personalized clinical insights." : `A verification code has been sent to +91 ${phone}`}
          </p>

          {step === "phone" ? (
            <div className={styles.gatewayInputGroup}>
              <div className={styles.phoneInputWrap}>
                <span className={styles.phonePrefix}><Phone size={14} /> +91</span>
                <input type="tel" placeholder="Enter 10-digit number" value={phone} maxLength={10}
                  onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  className={styles.phoneInput} autoFocus />
              </div>
              <button className={styles.gatewayCtaBtn} onClick={() => canProceed && setStep("otp")} disabled={!canProceed}>
                Send Verification OTP <ArrowUpRight size={16} />
              </button>
            </div>
          ) : (
            <div className={styles.gatewayInputGroup}>
              <div className={styles.otpRow}>
                {otp.map((d, i) => (
                  <input key={i} ref={otpRefs[i]} type="text" inputMode="numeric" maxLength={1} value={d}
                    onChange={e => handleOtpChange(i, e.target.value)} onKeyDown={e => handleOtpKey(i, e)}
                    className={styles.otpBox} autoFocus={i === 0} />
                ))}
              </div>
              {error && <div className={styles.otpErrorMsg}>{error}</div>}
              <button className={styles.gatewayCtaBtn} onClick={handleVerify} disabled={!canProceed}>
                <CheckCircle size={16} /> Verify & Access Pulse ✦
              </button>
              <button className={styles.gatewayLinkBtn} onClick={() => { setStep("phone"); setOtp(["","","",""]); setError(null); }}>
                Change mobile number
              </button>
            </div>
          )}

          <div className={styles.gatewayFooterDisclaimer}>
            By continuing, you agree to Narayana Health’s <a href="#" className={styles.gatewayLink}>Terms</a> &amp; <a href="#" className={styles.gatewayLink}>Privacy Policy</a>.
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── ROOT EXPORT ─────────────────────────────────────────── */
export default function PulseAIWorkspace({
  onClose,
  initialQuery: propInitialQuery = "",
  initialAction: propInitialAction = null,
  initialActionData: propInitialActionData = null
}: {
  onClose?: () => void;
  initialQuery?: string;
  initialAction?: string | null;
  initialActionData?: any;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const [initialQuery, setInitialQuery] = useState(propInitialQuery);
  const [initialAction, setInitialAction] = useState<string | null>(propInitialAction);
  const [initialActionData, setInitialActionData] = useState<any>(propInitialActionData);
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("isLoggedIn");
      return stored !== "false";
    }
    return true;
  });
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    const handleLoginChange = () => {
      if (typeof window !== "undefined") {
        const stored = sessionStorage.getItem("isLoggedIn");
        setIsLoggedIn(stored !== "false");
      }
    };
    window.addEventListener("login-state-changed", handleLoginChange);
    return () => window.removeEventListener("login-state-changed", handleLoginChange);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      if (typeof window !== "undefined" && (window as any).lenis) {
        (window as any).lenis.stop();
      }
    } else {
      document.body.style.overflow = "";
      if (typeof window !== "undefined" && (window as any).lenis) {
        (window as any).lenis.start();
      }
    }
    return () => {
      document.body.style.overflow = "";
      if (typeof window !== "undefined" && (window as any).lenis) {
        (window as any).lenis.start();
      }
    };
  }, [isOpen]);

  useEffect(() => {
    const handleExternalOpen = (e: Event) => {
      const customEvent = e as CustomEvent<{ query?: string }>;
      const query = customEvent.detail?.query || "";
      setInitialQuery(query);
      setIsOpen(true);
    };
    window.addEventListener("open-pulse-ai", handleExternalOpen);
    return () => window.removeEventListener("open-pulse-ai", handleExternalOpen);
  }, []);

  useEffect(() => {
    if (isOpen && isMaximized) {
      document.body.classList.add("pulse-maximized");
    } else {
      document.body.classList.remove("pulse-maximized");
    }
    return () => document.body.classList.remove("pulse-maximized");
  }, [isOpen, isMaximized]);

  const handleClose = () => {
    setIsOpen(false);
    if (onClose) onClose();
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div className={`${styles.workspaceOverlay} ${isMaximized ? styles.workspaceOverlayMaximized : ""}`} key="pulse-workspace"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}>
            <div className={styles.overlayBg}>
              <PixelRipple trigger={isOpen} />
            </div>
            <motion.div className={`${styles.workspaceContainer} ${isMaximized ? styles.workspaceContainerMaximized : ""}`}
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={{ 
                opacity: 1,
                y: 0,
                scale: 1,
                transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] } 
              }}
              exit={{ 
                opacity: 0,
                y: 10,
                scale: 0.98,
                transition: { duration: 0.12, ease: [0.22, 1, 0.36, 1] } 
              }}
            >
              <Workspace
                onClose={handleClose}
                initialQuery={initialQuery}
                clearInitialQuery={() => setInitialQuery("")}
                initialAction={initialAction}
                initialActionData={initialActionData}
                clearInitialAction={() => {
                  setInitialAction(null);
                  setInitialActionData(null);
                }}
                isLoggedIn={isLoggedIn}
                setIsLoggedIn={setIsLoggedIn}
                isMaximized={isMaximized}
                onToggleMaximize={() => setIsMaximized(m => !m)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
