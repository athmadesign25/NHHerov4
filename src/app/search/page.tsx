"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./search.module.css";
import { searchHealthcare, getCityId, NH_CITIES, type NormalizedResults } from "@/lib/searchService";
import { 
  Search, X, User, Building2, Activity, ShieldCheck, 
  FileText, Calendar, Star, MapPin, Clock, ArrowRight, ShieldAlert,
  ChevronRight, ChevronDown, Building, Video, PhoneCall, ArrowRightLeft, Filter
} from "lucide-react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

// Mock Data
const ALL_SPECIALTIES = [
  "Cardiologist",
  "Orthopaedician",
  "Oncologist",
  "Neurologist",
  "Pediatrician",
  "Cardiac Surgeon",
  "General Surgeon",
  "Vascular Surgeon",
  "Plastic Surgeon",
  "Gastroenterologist",
  "Pulmonologist",
  "Endocrinologist",
  "Nephrologist",
  "Urologist",
  "Gynecologist",
  "ENT Specialist",
  "Dermatologist",
  "Dentist"
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
      hospital: "Today, 02:30 PM",
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
    available: "Next Available: Tomorrow",
    availability: {
      hospital: "Tomorrow, 11:00 AM",
      video: "Tomorrow, 04:00 PM"
    },
    img: "/images/misc/doctor_avatar_female_v2.png",
    fee: "₹1,200",
    isExecutive: true,
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
      video: "Tomorrow, 09:00 AM"
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
      hospital: "Tomorrow, 01:00 PM",
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
      hospital: "Tue, 10:30 AM",
      video: "Tomorrow, 06:00 PM"
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
  {
    id: "dr-7",
    name: "Dr. Sandeep Kumar",
    speciality: "Orthopedic Surgery",
    degrees: "MBBS, MS (Orthopedics), Fellowship in Joint Replacement",
    hospital: "NH Guwahati",
    hospitalCount: "",
    city: "Guwahati",
    experience: "16 Years",
    rating: 4.5,
    reviews: 320,
    available: "Available Tomorrow",
    availability: {
      hospital: "Tomorrow, 10:00 AM",
      video: "Tomorrow, 04:30 PM"
    },
    img: "/images/misc/doctor_avatar_male_v2.png",
    fee: "₹800",
  },
  {
    id: "dr-8",
    name: "Dr. Vikram Singh",
    speciality: "Interventional Cardiology",
    degrees: "MBBS, MD, DM (Cardiology), FACC",
    hospital: "NH Jaipur",
    hospitalCount: "+1",
    city: "Jaipur",
    experience: "25 Years",
    rating: 4.9,
    reviews: 1540,
    available: "Next Available: Monday",
    availability: {
      hospital: "Mon, 11:30 AM",
      video: "Mon, 04:00 PM"
    },
    img: "/images/misc/doctor_avatar_male_v2.png",
    fee: "₹2,500",
    isExecutive: true,
  },
  {
    id: "dr-9",
    name: "Dr. Meera Nanda",
    speciality: "Medical Oncology",
    degrees: "MBBS, MD, DM (Medical Oncology)",
    hospital: "NH Delhi",
    hospitalCount: "",
    city: "Delhi",
    experience: "19 Years",
    rating: 4.7,
    reviews: 845,
    available: "No Slots Available",
    availability: {
      hospital: "Today, 02:00 PM",
      video: "26 Jan, 11:00 AM"
    },
    img: "/images/misc/doctor_avatar_female_v2.png",
    fee: "₹1,500",
  },
  {
    id: "dr-10",
    name: "Dr. Sameer Desai",
    speciality: "Pediatric Cardiology",
    degrees: "MBBS, MD (Pediatrics), FNB (Pediatric Cardiology)",
    hospital: "NH Mumbai",
    hospitalCount: "+2",
    city: "Mumbai",
    experience: "14 Years",
    rating: 4.8,
    reviews: 670,
    available: "Available Today",
    availability: {
      hospital: "Today, 03:00 PM",
      video: "Today, 05:00 PM"
    },
    img: "/images/misc/doctor_avatar_male_v2.png",
    fee: "₹1,100",
  },
  {
    id: "dr-11",
    name: "Dr. Kavita Reddy",
    speciality: "Surgical Oncology",
    degrees: "MBBS, MS, MCh (Surgical Oncology)",
    hospital: "NH Bangalore",
    hospitalCount: "",
    city: "Bangalore",
    experience: "21 Years",
    rating: 4.9,
    reviews: 1120,
    available: "Available Tomorrow",
    availability: {
      hospital: "Tomorrow, 09:30 AM",
      video: "Tomorrow, 12:00 PM"
    },
    img: "/images/misc/doctor_avatar_female_v2.png",
    fee: "₹1,800",
  },
  {
    id: "dr-12",
    name: "Dr. Ananya Sharma",
    speciality: "Joint Replacement",
    degrees: "MBBS, MS (Orthopedics)",
    hospital: "NH Shimoga",
    hospitalCount: "",
    city: "Shimoga",
    experience: "12 Years",
    rating: 4.6,
    reviews: 450,
    available: "Available Today",
    availability: {
      hospital: "Today, 02:00 PM",
      video: "Today, 05:00 PM"
    },
    img: "/images/misc/doctor_avatar_female_v2.png",
    fee: "₹750",
  },
  {
    id: "dr-13",
    name: "Dr. Rahul Verma",
    speciality: "Neuro Surgery",
    degrees: "MBBS, MS, MCh (Neurosurgery)",
    hospital: "NH Dharwad",
    hospitalCount: "",
    city: "Dharwad",
    experience: "22 Years",
    rating: 4.8,
    reviews: 1100,
    available: "Next Available: Tomorrow",
    availability: {
      hospital: "Tomorrow, 10:30 AM",
      video: "Tomorrow, 03:00 PM"
    },
    img: "/images/misc/doctor_avatar_male_v2.png",
    fee: "₹1,800",
  },
  {
    id: "dr-14",
    name: "Dr. Siddharth Rao",
    speciality: "Interventional Cardiology",
    degrees: "MBBS, MD, DM (Cardiology)",
    hospital: "NH Ahmedabad",
    hospitalCount: "+1",
    city: "Ahmedabad",
    experience: "18 Years",
    rating: 4.7,
    reviews: 890,
    available: "Available Today",
    availability: {
      hospital: "Today, 04:00 PM",
      video: "Today, 08:00 PM"
    },
    img: "/images/misc/doctor_avatar_male_v2.png",
    fee: "₹1,200",
  },
  {
    id: "dr-15",
    name: "Dr. Sneha Patil",
    speciality: "Medical Oncology",
    degrees: "MBBS, MD (Medicine), DM (Oncology)",
    hospital: "NH Kolar",
    hospitalCount: "",
    city: "Kolar",
    experience: "15 Years",
    rating: 4.9,
    reviews: 650,
    available: "Available Tomorrow",
    availability: {
      hospital: "Tue, 09:00 AM",
      video: "Tomorrow, 01:00 PM"
    },
    img: "/images/misc/doctor_avatar_female_v2.png",
    fee: "₹1,000",
  },
  {
    id: "dr-16",
    name: "Dr. Kunal Basu",
    speciality: "Pediatric Cardiology",
    degrees: "MBBS, MD, Fellowship in Pediatric Cardiology",
    hospital: "NH Barasat",
    hospitalCount: "",
    city: "Barasat",
    experience: "11 Years",
    rating: 4.5,
    reviews: 210,
    available: "Next Available: Thursday",
    availability: {
      hospital: "Today, 11:00 AM",
      video: "26 Jan, 10:00 AM"
    },
    img: "/images/misc/doctor_avatar_male_v2.png",
    fee: "₹900",
  },
  {
    id: "dr-17",
    name: "Dr. Amitab Ghosh",
    speciality: "Surgical Oncology",
    degrees: "MBBS, MS, MCh (Surgical Oncology)",
    hospital: "NH Jamshedpur",
    hospitalCount: "+2",
    city: "Jamshedpur",
    experience: "26 Years",
    rating: 4.9,
    reviews: 1800,
    available: "Available Today",
    availability: {
      hospital: "Today, 12:30 PM",
      video: "Today, 05:30 PM"
    },
    img: "/images/misc/doctor_avatar_male_v2.png",
    fee: "₹2,200",
    isExecutive: true,
  },
  {
    id: "dr-18",
    name: "Dr. Ritu Singh",
    speciality: "Orthopedic Surgery",
    degrees: "MBBS, MS (Orthopedics)",
    hospital: "NH Gurugram",
    hospitalCount: "",
    city: "Gurugram",
    experience: "14 Years",
    rating: 4.7,
    reviews: 740,
    available: "Available Today",
    availability: {
      hospital: "Today, 09:00 AM",
      video: "Today, 11:00 AM"
    },
    img: "/images/misc/doctor_avatar_female_v2.png",
    fee: "₹1,500",
  },
  {
    id: "dr-19",
    name: "Dr. Tariq Khan",
    speciality: "Neuro Surgery",
    degrees: "MBBS, MS, MCh (Neurosurgery)",
    hospital: "NH Howrah",
    hospitalCount: "+1",
    city: "Howrah",
    experience: "20 Years",
    rating: 4.8,
    reviews: 1300,
    available: "No Slots Available",
    availability: {
      hospital: "29 Jan, 10:00 AM",
      video: "29 Jan, 04:00 PM"
    },
    img: "/images/misc/doctor_avatar_male_v2.png",
    fee: "₹1,600",
  },
  {
    id: "dr-20",
    name: "Dr. Priti Gowda",
    speciality: "Joint Replacement",
    degrees: "MBBS, MS (Orthopedics)",
    hospital: "NH Mysore",
    hospitalCount: "",
    city: "Mysore",
    experience: "17 Years",
    rating: 4.6,
    reviews: 580,
    available: "Available Tomorrow",
    availability: {
      hospital: "Tomorrow, 04:00 PM",
      video: "Tomorrow, 06:00 PM"
    },
    img: "/images/misc/doctor_avatar_female_v2.png",
    fee: "₹1,100",
  },
  {
    id: "dr-21",
    name: "Dr. Vivek Anand",
    speciality: "Interventional Cardiology",
    degrees: "MBBS, MD, DM (Cardiology)",
    hospital: "NH Hosur",
    hospitalCount: "",
    city: "Hosur",
    experience: "13 Years",
    rating: 4.7,
    reviews: 490,
    available: "Available Today",
    availability: {
      hospital: "Today, 10:00 AM",
      video: "Today, 02:00 PM"
    },
    img: "/images/misc/doctor_avatar_male_v2.png",
    fee: "₹1,000",
  }
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
    type: "Procedures",
    image: "/images/procedures/procedure_cardiology.png",
  },
  {
    id: "treat-2",
    name: "Deep Brain Stimulation (DBS)",
    speciality: "Neurology",
    description: "Surgical procedure used to treat a variety of disabling neurological symptoms, most commonly for Parkinson's disease.",
    duration: "3 - 6 Hours",
    type: "Procedures",
    image: "/images/procedures/procedure_surgery.png",
  },
  {
    id: "treat-3",
    name: "Precision Radiotherapy & Chemotherapy",
    speciality: "Oncology",
    description: "Advanced radiotherapy including TrueBeam and personalized chemotherapy regimens tailored to treat specific cancer forms effectively.",
    duration: "Varies per plan",
    type: "Treatments",
    image: "/images/procedures/procedure_mri.png",
  },
  {
    id: "treat-4",
    name: "Knee & Hip Joint Replacements",
    speciality: "Orthopaedics",
    description: "Robot-assisted total and partial joint replacement procedures using durable implants designed for faster recovery and mobility.",
    duration: "1 - 2 Hours",
    type: "Procedures",
    image: "/images/procedures/procedure_surgery.png",
  },
  {
    id: "treat-5",
    name: "Advanced Gastrointestinal Endoscopy",
    speciality: "Gastroenterology",
    description: "Diagnostic and therapeutic endoscopic procedures for digestive disorders, including colonoscopy, ERCP, and EUS.",
    duration: "30 - 60 Mins",
    type: "Procedures",
    image: "/images/procedures/procedure_surgery.png",
  },
  {
    id: "treat-6",
    name: "Bone Marrow Transplant",
    speciality: "Haematology",
    description: "A procedure to replace damaged or destroyed bone marrow with healthy bone marrow stem cells.",
    duration: "2 - 4 Hours",
    type: "Treatments",
    image: "/images/procedures/procedure_surgery.png",
  },
  {
    id: "treat-7",
    name: "Cataract Surgery",
    speciality: "Ophthalmology",
    description: "A procedure to remove the lens of your eye and, in most cases, replace it with an artificial lens.",
    duration: "30 - 45 Mins",
    type: "Procedures",
    image: "/images/procedures/procedure_surgery.png",
  },
  {
    id: "treat-8",
    name: "Echocardiogram (ECHO)",
    speciality: "Cardiology",
    description: "An ultrasound of the heart to see how well the heart muscle and valves are working.",
    duration: "30 - 60 Mins",
    type: "Procedures",
    image: "/images/procedures/procedure_mri.png",
  },
  {
    id: "treat-9",
    name: "Laser Eye Surgery (LASIK)",
    speciality: "Ophthalmology",
    description: "A refractive surgical procedure that uses a laser to reshape the cornea to correct myopia, hyperopia, and astigmatism.",
    duration: "15 - 30 Mins",
    type: "Procedures",
    image: "/images/procedures/procedure_surgery.png",
  },
  {
    id: "treat-10",
    name: "MRI Scan (Magnetic Resonance Imaging)",
    speciality: "Radiology",
    description: "A non-invasive imaging technology that produces three dimensional detailed anatomical images.",
    duration: "30 - 90 Mins",
    type: "Treatments",
    image: "/images/procedures/procedure_mri.png",
  },
  {
    id: "treat-11",
    name: "Pacemaker Implantation",
    speciality: "Cardiology",
    description: "Surgery to implant a small electronic device in the chest to help regulate slow or irregular heartbeats.",
    duration: "1 - 2 Hours",
    type: "Procedures",
    image: "/images/procedures/procedure_cardiology.png",
  },
  {
    id: "treat-12",
    name: "Renal Dialysis",
    speciality: "Nephrology",
    description: "A treatment for kidney failure that removes waste and extra fluid from the blood.",
    duration: "3 - 4 Hours",
    type: "Treatments",
    image: "/images/procedures/procedure_mri.png",
  },
  {
    id: "treat-13",
    name: "Ultrasound Guided Biopsy",
    speciality: "Radiology",
    description: "A minimally invasive procedure that uses ultrasound imaging to help locate a lesion and guide a needle to extract tissue.",
    duration: "30 - 60 Mins",
    type: "Procedures",
    image: "/images/procedures/procedure_mri.png",
  },
  {
    id: "treat-14",
    name: "Varicose Vein Laser Therapy",
    speciality: "Vascular Surgery",
    description: "A minimally invasive laser treatment used to shrink and close abnormally enlarged veins in the legs.",
    duration: "45 - 60 Mins",
    type: "Treatments",
    image: "/images/procedures/procedure_surgery.png",
  }
];

const packagesData = [
  {
    id: "pkg-1",
    name: "Executive Full Body Health Checkup",
    price: "₹4,999",
    tests: "68 Tests",
    inclusions: ["Complete Blood Count (CBC)", "Lipid Profile", "Liver Function", "Kidney Function", "Diabetic Screening", "ECG", "Physician Consultation"],
    popular: true,
    gender: "Anyone",
    hospital: "NH Bangalore",
    type: "Health Packages",
    image: "/Health Checkup/Basic health.png",
    idealFor: "Ideal for Men • 20-35 yrs"
  },
  {
    id: "pkg-2",
    name: "Advanced Cardiac Evaluation Package",
    price: "₹3,500",
    tests: "12 Tests",
    inclusions: ["ECG", "Echocardiography (ECHO)", "TMT (Treadmill Test)", "Lipid Profile", "Cardiologist Consultation"],
    popular: false,
    gender: "Anyone",
    hospital: "NH Mumbai",
    type: "Health Packages",
    image: "/Health Checkup/Men's health.png",
    idealFor: "Ideal for Men • 35-50 yrs"
  },
  {
    id: "pkg-3",
    name: "Women's Wellness Shield Checkup",
    price: "₹3,999",
    tests: "42 Tests",
    inclusions: ["Thyroid Profile", "Mammography / Breast Ultrasound", "Pap Smear", "Vitamin D3", "Gynecologist Consultation"],
    popular: true,
    gender: "Female",
    hospital: "NH Bangalore",
    type: "Health Packages",
    image: "/Health Checkup/Master health.png",
    idealFor: "Ideal for Women • 20-40 yrs"
  },
  {
    id: "pkg-4",
    name: "Active Joint & Bone Health Package",
    price: "₹2,200",
    tests: "8 Tests",
    inclusions: ["Calcium Test", "Vitamin D3", "Uric Acid", "Orthopaedic consultation", "Bone Mineral Density Scan"],
    popular: false,
    gender: "Anyone",
    hospital: "NH Kolkata",
    type: "Health Packages",
    image: "/Health Checkup/Senior Citizen.png",
    idealFor: "Ideal for Seniors • 60+ yrs"
  },
];

const labsData = [
  {
    id: "lab-1",
    name: "Complete Blood Count (CBC) with ESR",
    price: "₹349",
    time: "Reports in 6 Hours",
    parameters: "24 Parameters (Hb, RBC, WBC, Platelets, etc.)",
    gender: "Anyone",
    hospital: "NH Bangalore",
    type: "Tests"
  },
  {
    id: "lab-2",
    name: "Lipid Profile (Cholesterol Test)",
    price: "₹499",
    time: "Reports in 8 Hours",
    parameters: "8 Parameters (Total Cholesterol, HDL, LDL, Triglycerides)",
    gender: "Anyone",
    hospital: "NH Mumbai",
    type: "Tests"
  },
  {
    id: "lab-3",
    name: "HbA1c (Glycated Haemoglobin)",
    price: "₹399",
    time: "Reports in 6 Hours",
    parameters: "Measures average blood sugar levels over the past 3 months",
    gender: "Anyone",
    hospital: "NH Delhi",
    type: "Tests"
  },
  {
    id: "lab-4",
    name: "Thyroid Profile (T3, T4, TSH)",
    price: "₹599",
    time: "Reports in 12 Hours",
    parameters: "3 Key Thyroid Hormones Checked",
    gender: "Anyone",
    hospital: "NH Jaipur",
    type: "Tests"
  },
  {
    id: "lab-5",
    name: "Liver Function Test (LFT)",
    price: "₹699",
    time: "Reports in 8 Hours",
    parameters: "11 Parameters including Bilirubin, SGOT, SGPT, Proteins",
    gender: "Anyone",
    hospital: "NH Guwahati",
    type: "Tests"
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
    image: "/images/articles/blog_heart_health.png",
  },
  {
    id: "art-2",
    title: "Living with Migraines: Identifying Triggers and Finding Relief",
    author: "Dr. Priya Sharma",
    readTime: "8 Min Read",
    category: "Neurology",
    date: "May 28, 2026",
    summary: "Migraine isn't just a headache. Discover the neurological triggers, preventative care, and advanced therapeutic methods like Botox or neuromodulation for chronic relief.",
    image: "/images/articles/blog_migraine.png",
  },
  {
    id: "art-3",
    title: "Cancer Care: The Role of Early Screening & Detection",
    author: "Dr. Arun Krishnan",
    readTime: "6 Min Read",
    category: "Oncology",
    date: "June 02, 2026",
    summary: "Early detection saves lives. Learn how periodic screenings, self-examinations, and modern molecular diagnostics help spot oncology issues in their initial treatable stages.",
    image: "/images/articles/blog_cancer_care.png",
  },
  {
    id: "art-4",
    title: "Keeping Joints and Bones Healthy in Your Golden Years",
    author: "Dr. Sunita Patel",
    readTime: "4 Min Read",
    category: "Orthopaedics",
    date: "April 15, 2026",
    summary: "Osteoarthritis and bone loss are common as we age. Find out how targeted physical therapy, diet, and posture correction help prevent orthopaedic operations.",
    image: "/images/articles/blog_joints_bones.png",
  },
];

const TABS = [
  { id: "doctors", label: "Doctors", countKey: "doctors" },
  { id: "specialties", label: "Specialty", countKey: "specialties" },
  { id: "packages_tests", label: "Health Packages & Tests", countKey: "packages_tests" },
  { id: "treatments", label: "Treatments & Procedures", countKey: "treatments" },
  { id: "articles", label: "Articles & Blogs", countKey: "articles" },
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
  const [selectedAlphabets, setSelectedAlphabets] = useState<string[]>([]);
  const [selectedTreatmentTypes, setSelectedTreatmentTypes] = useState<string[]>([]);
  
  const [selectedPackageGender, setSelectedPackageGender] = useState<string[]>([]);
  const [selectedPackageHospitals, setSelectedPackageHospitals] = useState<string[]>([]);
  const [selectedPackageType, setSelectedPackageType] = useState<string[]>([]);

  const [specLimit, setSpecLimit] = useState(8);
  const [isFiltering, setIsFiltering] = useState(false);
  const [consultationType, setConsultationType] = useState<"Hospital Visit" | "Video Consultation">("Hospital Visit");

  // --- API integration ---
  const [apiData, setApiData] = useState<NormalizedResults | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);



  // Toggle filter helper

  // Debounced API call — triggers from 1 char, re-fetches on city change
  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    if (abortControllerRef.current) abortControllerRef.current.abort();

    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      setApiData(null);
      return;
    }

    setIsFiltering(true);
    const cityId = getCityId(location);

    debounceTimerRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortControllerRef.current = controller;
      try {
        const results = await searchHealthcare(trimmedQuery, cityId, controller.signal);
        if (!controller.signal.aborted) {
          setApiData(results);
          setIsFiltering(false);
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        if (!controller.signal.aborted) {
          console.error("[Search API]", err);
          setApiData(null);
          setIsFiltering(false);
        }
      }
    }, 280);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, location]);


  const toggleFilter = (setter: React.Dispatch<React.SetStateAction<string[]>>, value: string) => {
    setter(prev => prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]);
    setIsFiltering(true);
    setTimeout(() => setIsFiltering(false), 300);
  };

  // Sync state if URL query changes
  useEffect(() => {
    const q = initialQuery.trim().toLowerCase();
    const isSpecialty = doctorsData.some(d => d.speciality.toLowerCase() === q);
    
    if (isSpecialty && q !== "") {
      const matchedSpecialty = doctorsData.find(d => d.speciality.toLowerCase() === q)?.speciality;
      if (matchedSpecialty) {
        setSelectedSpecialties([matchedSpecialty]);
        setQuery("");
      }
    } else {
      setQuery(initialQuery);
      setSelectedSpecialties([]);
    }

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
    const matchesQuery = query === "" ? true : (
      d.name.toLowerCase().includes(query.toLowerCase()) ||
      d.speciality.toLowerCase().includes(query.toLowerCase()) ||
      d.hospital.toLowerCase().includes(query.toLowerCase())
    );
    const matchesLocation = location === "All" || d.city.toLowerCase() === location.toLowerCase();
    const matchesSpecialty = selectedSpecialties.length === 0 || selectedSpecialties.includes(d.speciality);
    const matchesHospital = selectedHospitals.length === 0 || selectedHospitals.includes(d.hospital);

    return matchesQuery && matchesLocation && matchesSpecialty && matchesHospital;
  });

  const filteredHospitals = hospitalsData.filter((h) => {
    const matchesQuery = h.name.toLowerCase().includes(query.toLowerCase()) ||
      h.city.toLowerCase().includes(query.toLowerCase()) ||
      h.specs.some(s => s.toLowerCase().includes(query.toLowerCase()));
    const matchesLocation = location === "All" || h.city.toLowerCase() === location.toLowerCase();
    return matchesQuery && matchesLocation;
  });

  const filteredTreatments = treatmentsData.filter((t) => {
    const matchesQuery = t.name.toLowerCase().includes(query.toLowerCase()) ||
      t.speciality.toLowerCase().includes(query.toLowerCase()) ||
      t.description.toLowerCase().includes(query.toLowerCase());
    
    const matchesAlphabet = selectedAlphabets.length === 0 || selectedAlphabets.includes(t.name.charAt(0).toUpperCase());
    const matchesType = selectedTreatmentTypes.length === 0 || selectedTreatmentTypes.includes(t.type);
    
    return matchesQuery && matchesAlphabet && matchesType;
  });

  const filteredPackages = packagesData.filter((p) => {
    const matchesQuery = p.name.toLowerCase().includes(query.toLowerCase()) || p.inclusions.some(i => i.toLowerCase().includes(query.toLowerCase()));
    const matchesGender = selectedPackageGender.length === 0 || selectedPackageGender.includes(p.gender as string) || p.gender === "Anyone";
    const matchesHospital = selectedPackageHospitals.length === 0 || selectedPackageHospitals.includes(p.hospital as string);
    const matchesType = selectedPackageType.length === 0 || selectedPackageType.includes(p.type as string);
    return matchesQuery && matchesGender && matchesHospital && matchesType;
  });

  const filteredLabs = labsData.filter((l) => {
    const matchesQuery = l.name.toLowerCase().includes(query.toLowerCase()) || l.parameters.toLowerCase().includes(query.toLowerCase());
    const matchesGender = selectedPackageGender.length === 0 || selectedPackageGender.includes(l.gender as string) || l.gender === "Anyone";
    const matchesHospital = selectedPackageHospitals.length === 0 || selectedPackageHospitals.includes(l.hospital as string);
    const matchesType = selectedPackageType.length === 0 || selectedPackageType.includes(l.type as string);
    return matchesQuery && matchesGender && matchesHospital && matchesType;
  });

  const filteredArticles = articlesData.filter((a) =>
    a.title.toLowerCase().includes(query.toLowerCase()) ||
    a.category.toLowerCase().includes(query.toLowerCase()) ||
    a.summary.toLowerCase().includes(query.toLowerCase())
  );

  
  // --- Derive display data: API results override static when query is active ---
  const useApiData = apiData !== null && query.trim() !== "";

  // Specialties tab
  const filteredSpecialties: any[] = []; // No static mock provided initially, fallback empty if no API
  const displaySpecialties = useApiData && apiData!.specialities
    ? apiData!.specialities.map((s) => ({
        id: s.id,
        name: s.name,
        description: s.description || "",
        image: (s as any).image || "/images/misc/procedure_placeholder.png"
      }))
    : filteredSpecialties;


  // Doctors: map API fields to the shape the card already expects
  const displayDoctors = useApiData
    ? apiData!.doctors.map((d) => ({
        id: String(d.id),
        name: d.name,
        speciality: d.speciality,
        degrees: d.speciality,
        hospital: d.hospital,
        hospitalCount: "",
        city: location,
        experience: "",
        rating: 0,
        reviews: 0,
        available: d.apptEnabled || d.walkinEnabled ? "Available Today" : "Check Availability",
        availability: d.availability,
        img: d.photo,
        fee: "",
        isExecutive: false,
      }))
    : filteredDoctors;

  // Treatments & Procedures tab — treatments first
  const displayTreatments = useApiData
    ? [
        ...apiData!.treatments.map((t) => ({
          id: `treat-api-${t.id}`,
          name: t.name,
          speciality: t.speciality,
          description: t.speciality ? `Related to ${t.speciality}` : "",
          duration: "",
          type: "Treatments" as string,
          image: t.image,
        })),
        ...apiData!.procedures.map((p) => ({
          id: `proc-api-${p.id}`,
          name: p.name,
          speciality: p.speciality,
          description: p.speciality ? `Related to ${p.speciality}` : "",
          duration: "",
          type: "Procedures" as string,
          image: p.image,
        })),
      ]
    : filteredTreatments;

  // Articles & Blogs tab
  const displayArticles = useApiData
    ? apiData!.blogs.map((b) => ({
        id: `blog-api-${b.id}`,
        title: b.name,
        author: "",
        readTime: "",
        category: b.speciality || "Health",
        date: "",
        summary: "",
        image: b.image,
      }))
    : filteredArticles;

  const counts: Record<string, number | string> = {
    doctors: isFiltering && !apiData ? "…" : useApiData ? apiData!.doctors.length : filteredDoctors.length,
    specialties: isFiltering && !apiData ? "…" : useApiData && apiData!.specialities ? apiData!.specialities.length : 0,
    hospitals: filteredHospitals.length,
    treatments: isFiltering && !apiData ? "…" : useApiData
      ? apiData!.procedures.length + apiData!.treatments.length
      : filteredTreatments.length,
    packages_tests: filteredPackages.length + filteredLabs.length,
    articles: isFiltering && !apiData ? "…" : useApiData ? apiData!.blogs.length : filteredArticles.length,
  };


  const activeDynamicFiltersCount = 
    selectedSpecialties.length + 
    selectedHospitals.length + 
    selectedAvailability.filter(v => v !== "Available Today" && v !== "Available Tomorrow").length + 
    selectedExpertise.length + 
    selectedGender.length + 
    selectedLanguage.length;

  const shouldGroupFilters = activeDynamicFiltersCount > 5;

  return (
    <div style={{ paddingTop: "var(--nav-height)", minHeight: "100vh", background: "var(--color-bg-card)" }}>
      {/* Top Search Banner */}
      <div style={{ background: "linear-gradient(to bottom, #FFFFFF 0%, var(--color-bg-alt) 100%)", padding: "24px 0 24px", color: "var(--color-text)" }}>
        <div className="container">
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <Breadcrumbs theme="light" items={[
                { label: "Home", href: "/" },
                { label: "Search Results" }
              ]} />
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
                    borderRadius: 26,
                    border: "none",
                    outline: "none",
                    fontSize: 16,
                    color: "#1E293B",
                    fontWeight: 500,
                    boxShadow: "var(--shadow-sm)",
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
                  <div className={styles.filterPanel} data-lenis-prevent="true">
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
                      {["Orthopedic Surgery", "Joint Replacement", "Interventional Cardiology", "Pediatric Cardiology", "Medical Oncology", "Surgical Oncology", "Neuro Surgery"].map((exp) => (
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
                    {/* Top Control Bar (Pills + Location) */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", width: "100%", gap: 16 }}>
                      {/* Active Filter Pills (Left Side) */}
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", flex: 1 }}>
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

                      {/* Default Quick Filter Pills */}
                      <button
                        onClick={() => toggleFilter(setSelectedAvailability, "Available Today")}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          height: 32,
                          padding: "0 12px",
                          boxSizing: "border-box",
                          borderRadius: 16,
                          border: `1px solid ${selectedAvailability.includes("Available Today") ? "var(--color-emergency)" : "var(--color-border)"}`,
                          background: selectedAvailability.includes("Available Today") ? "rgba(237, 28, 36, 0.08)" : "#ffffff",
                          color: selectedAvailability.includes("Available Today") ? "var(--color-emergency)" : "var(--color-text-secondary)",
                          fontSize: 13,
                          fontWeight: 500,
                          cursor: "pointer",
                          transition: "var(--transition-fast)"
                        }}
                      >
                        Today
                      </button>
                      <button
                        onClick={() => toggleFilter(setSelectedAvailability, "Available Tomorrow")}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          height: 32,
                          padding: "0 12px",
                          boxSizing: "border-box",
                          borderRadius: 16,
                          border: `1px solid ${selectedAvailability.includes("Available Tomorrow") ? "var(--color-emergency)" : "var(--color-border)"}`,
                          background: selectedAvailability.includes("Available Tomorrow") ? "rgba(237, 28, 36, 0.08)" : "#ffffff",
                          color: selectedAvailability.includes("Available Tomorrow") ? "var(--color-emergency)" : "var(--color-text-secondary)",
                          fontSize: 13,
                          fontWeight: 500,
                          cursor: "pointer",
                          transition: "var(--transition-fast)"
                        }}
                      >
                        Tomorrow
                      </button>

                      {/* Dynamic Filter Pills */}
                      {[
                        ...(shouldGroupFilters && selectedSpecialties.length > 1 
                          ? [{ label: `Speciality (${selectedSpecialties.length})`, remove: () => setSelectedSpecialties([]) }] 
                          : selectedSpecialties.map(val => ({ label: val, remove: () => toggleFilter(setSelectedSpecialties, val) }))),
                        ...(shouldGroupFilters && selectedHospitals.length > 1 
                          ? [{ label: `Hospital (${selectedHospitals.length})`, remove: () => setSelectedHospitals([]) }] 
                          : selectedHospitals.map(val => ({ label: val, remove: () => toggleFilter(setSelectedHospitals, val) }))),
                        ...(shouldGroupFilters && selectedAvailability.filter(v => v !== "Available Today" && v !== "Available Tomorrow").length > 1 
                          ? [{ label: `Availability (${selectedAvailability.filter(v => v !== "Available Today" && v !== "Available Tomorrow").length})`, remove: () => setSelectedAvailability(prev => prev.filter(v => v === "Available Today" || v === "Available Tomorrow")) }] 
                          : selectedAvailability.filter(v => v !== "Available Today" && v !== "Available Tomorrow").map(val => ({ label: val, remove: () => toggleFilter(setSelectedAvailability, val) }))),
                        ...(shouldGroupFilters && selectedExpertise.length > 1 
                          ? [{ label: `Expertise (${selectedExpertise.length})`, remove: () => setSelectedExpertise([]) }] 
                          : selectedExpertise.map(val => ({ label: val, remove: () => toggleFilter(setSelectedExpertise, val) }))),
                        ...(shouldGroupFilters && selectedGender.length > 1 
                          ? [{ label: `Gender (${selectedGender.length})`, remove: () => setSelectedGender([]) }] 
                          : selectedGender.map(val => ({ label: val, remove: () => toggleFilter(setSelectedGender, val) }))),
                        ...(shouldGroupFilters && selectedLanguage.length > 1 
                          ? [{ label: `Language (${selectedLanguage.length})`, remove: () => setSelectedLanguage([]) }] 
                          : selectedLanguage.map(val => ({ label: val, remove: () => toggleFilter(setSelectedLanguage, val) })))
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
                            height: 32,
                            padding: "0 12px",
                            boxSizing: "border-box", 
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

                      {/* Location Pill (Right Side) */}
                      <div style={{ display: "flex", alignItems: "center", gap: 4, background: "#ffffff", border: "1px solid var(--color-border)", borderRadius: 16, padding: "0 8px 0 12px", height: 32, flexShrink: 0, position: "relative" }}>
                        <MapPin size={14} color="var(--color-primary)" />
                        <select
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          style={{
                            appearance: "none",
                            WebkitAppearance: "none",
                            border: "none",
                            background: "transparent",
                            fontSize: 13,
                            fontWeight: 600,
                            color: "var(--color-primary)",
                            cursor: "pointer",
                            outline: "none",
                            paddingRight: 16
                          }}
                        >
                          <option value="All">All Locations</option>
                          <option value="Bangalore">Bangalore</option>
                          <option value="Guwahati">Guwahati</option>
                          <option value="Dharwad">Dharwad</option>
                          <option value="Shimoga">Shimoga</option>
                          <option value="Ahmedabad">Ahmedabad</option>
                          <option value="Jaipur">Jaipur</option>
                          <option value="Kolar">Kolar</option>
                          <option value="Mumbai">Mumbai</option>
                          <option value="Raipur">Raipur</option>
                          <option value="Kolkata">Kolkata</option>
                          <option value="Davangere">Davangere</option>
                          <option value="Barasat">Barasat</option>
                          <option value="Jamshedpur">Jamshedpur</option>
                          <option value="Gurugram">Gurugram</option>
                          <option value="Howrah">Howrah</option>
                          <option value="Delhi">Delhi</option>
                          <option value="Mysore">Mysore</option>
                          <option value="Hosur">Hosur</option>
                        </select>
                        <ChevronDown size={14} color="var(--color-primary)" style={{ position: "absolute", right: 8, pointerEvents: "none" }} />
                      </div>
                    </div>

                    {/* Search Summary Text */}
                    {activeTab === "doctors" && (
                      <div style={{ fontSize: 15, color: "#334155", fontWeight: 500, padding: "4px 0 0px", marginBottom: -12 }}>
                        Showing results for {consultationType === "Video Consultation" ? "video consultations" : "hospital visits"} in {location === "All" ? "all locations" : `${location} location`}
                      </div>
                    )}

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
                             <div style={{ height: 1, background: "var(--color-border)", margin: "16px 0" }} />
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
                      displayDoctors.map((doc) => (
                    <div 
                      key={doc.id}
                      style={{ 
                        background: "var(--color-bg-card)", 
                        border: "1px solid var(--color-border)", 
                        borderRadius: 16, 
                        overflow: "visible", // Changed to visible for the ribbon folds to show
                        boxShadow: "var(--shadow-sm)",
                        position: "relative" // Added position relative for the absolute ribbon
                      }}
                    >
                      {(doc as any).isExecutive && (
                        <div style={{ position: "absolute", top: -4, right: 20, zIndex: 10, width: 88, height: 24 }}>
                          <Image src="/Appointment/Executive tag.svg" alt="Executive" width={88} height={24} />
                          <div style={{ position: "absolute", inset: 0, overflow: "hidden", WebkitMaskImage: "url('/Appointment/Executive tag.svg')", maskImage: "url('/Appointment/Executive tag.svg')", WebkitMaskSize: "contain", maskSize: "contain", WebkitMaskRepeat: "no-repeat", maskRepeat: "no-repeat" }}>
                            <motion.div
                              initial={{ x: "-150%" }}
                              animate={{ x: "250%" }}
                              transition={{
                                repeat: Infinity,
                                duration: 2.5,
                                ease: "easeInOut",
                                repeatDelay: 2
                              }}
                              style={{
                                position: "absolute",
                                top: 0,
                                bottom: 0,
                                width: "40%",
                                background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.25), transparent)",
                                transform: "skewX(-20deg)"
                              }}
                            />
                          </div>
                        </div>
                      )}
                      {/* Top Section */}
                      <div style={{ background: "linear-gradient(135deg, #ffffff 0%, var(--color-primary-light) 100%)", padding: 18, borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
                        <div style={{ display: "flex", gap: 16 }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0 }}>
                            <Link href={`/doctors/${doc.id}`} style={{ position: "relative", width: 120, height: 120, borderRadius: 12, overflow: "hidden", background: "var(--color-border)", display: "block" }}>
                              <motion.div whileHover="hover" initial="initial" style={{ width: "100%", height: "100%", position: "relative" }}>
                                <Image src={doc.img} alt={doc.name} fill style={{ objectFit: "cover" }} />
                                <motion.div 
                                  variants={{
                                    initial: { opacity: 0, y: 10 },
                                    hover: { opacity: 1, y: 0 }
                                  }}
                                  transition={{ duration: 0.2 }}
                                  style={{
                                    position: "absolute",
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    background: "linear-gradient(transparent, rgba(0, 0, 0, 0.5))",
                                    color: "#ffffff",
                                    fontSize: 9,
                                    fontWeight: 600,
                                    padding: "20px 4px 4px 4px",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center"
                                  }}
                                >
                                  View profile <ChevronRight size={10} style={{ marginLeft: 2 }} />
                                </motion.div>
                              </motion.div>
                            </Link>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                            <Link href={`/doctors/${doc.id}`} style={{ textDecoration: "none" }}>
                              <h3 style={{ fontSize: "var(--font-size-lg)", fontWeight: 700, color: "var(--color-text)", marginBottom: 4, cursor: "pointer", transition: "color 0.15s", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {doc.name}
                              </h3>
                            </Link>
                            <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{doc.speciality}</p>
                            <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", display: "-webkit-box", WebkitLineClamp: doc.name.length > 22 ? 1 : 2, WebkitBoxOrient: "vertical", overflow: "hidden", textOverflow: "ellipsis" }}>{doc.degrees}</p>
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 }}>
                              <span style={{ fontSize: 10, background: "#FFFFFF", padding: "2px 8px", borderRadius: 12, color: "#475569", fontWeight: 400 }}>English</span>
                              <span style={{ fontSize: 10, background: "#FFFFFF", padding: "2px 8px", borderRadius: 12, color: "#475569", fontWeight: 400 }}>Hindi</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Section */}
                      <div style={{ padding: 18 }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 12 }}>
                          <MapPin size={16} style={{ color: "var(--color-text-secondary)", flexShrink: 0, marginTop: 2 }} />
                          <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {doc.hospital} {doc.hospitalCount && <span style={{ color: "var(--color-primary)", fontWeight: 700 }}>{doc.hospitalCount}</span>}
                          </p>
                        </div>
                        
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                          <Clock size={16} style={{ color: "var(--color-text-secondary)" }} />
                          <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text)" }}>Next available at</p>
                        </div>

                        <div style={{ display: "flex", flexWrap: "nowrap", overflowX: "auto", scrollbarWidth: "none", gap: 12, marginBottom: 16 }}>
                          {consultationType !== "Video Consultation" && (
                            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "linear-gradient(135deg, var(--color-emergency-light) 0%, #ffffff 100%)", color: "var(--color-text)", padding: "6px 10px", borderRadius: 20, fontSize: "var(--font-size-xs)", fontWeight: 600, whiteSpace: "nowrap" }}>
                              <Image src="/Appointment/Hospital_visit.svg" alt="Hospital Visit" width={16} height={16} />
                              {doc.availability.hospital}
                            </div>
                          )}
                          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "linear-gradient(135deg, var(--color-emergency-light) 0%, #ffffff 100%)", color: "var(--color-text)", padding: "6px 10px", borderRadius: 20, fontSize: "var(--font-size-xs)", fontWeight: 600, whiteSpace: "nowrap" }}>
                            <Image src="/Appointment/Video_consultation.svg" alt="Video Consultation" width={16} height={16} />
                            {doc.availability.video}
                          </div>
                        </div>

                        <div style={{ height: 1, background: "var(--color-border)", margin: "16px 0" }} />

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
                  {displayDoctors.length === 0 && !isFiltering && <EmptyState category="doctors" />}
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
              {/* SPECIALTIES PANEL */}
              {activeTab === "specialties" && (
                <div className={styles.doctorsLayout}>
                  <div className={styles.filterPanel} data-lenis-prevent="true">
                    {/* A-Z Filter */}
                    <div className={styles.filterGroup}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                        <h4 className={styles.filterTitle} style={{ marginBottom: 0 }}>Browse by A-Z</h4>
                        {selectedAlphabets.length > 0 && (
                          <button
                            onClick={() => {
                              setSelectedAlphabets([]);
                              setIsFiltering(true);
                              setTimeout(() => setIsFiltering(false), 300);
                            }}
                            style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", color: "var(--color-emergency)", fontSize: 12, fontWeight: 700, cursor: "pointer", padding: 0 }}
                          >
                            Clear <X size={12} />
                          </button>
                        )}
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
                        {Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)).map(letter => (
                          <label key={letter} style={{
                            display: "flex", alignItems: "center", justifyContent: "center", 
                            padding: "8px 0", border: "1px solid", 
                            borderColor: selectedAlphabets.includes(letter) ? "var(--color-emergency)" : "var(--color-border)",
                            background: selectedAlphabets.includes(letter) ? "rgba(237, 28, 36, 0.08)" : "#fff",
                            color: selectedAlphabets.includes(letter) ? "var(--color-emergency)" : "var(--color-text)",
                            borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 600,
                            transition: "all 0.2s"
                          }}>
                            <input 
                              type="checkbox" 
                              style={{ display: "none" }}
                              checked={selectedAlphabets.includes(letter)}
                              onChange={() => toggleFilter(setSelectedAlphabets, letter)}
                            />
                            {letter}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className={styles.doctorResultsArea}>
                    <div style={{ fontSize: 15, color: "#334155", fontWeight: 500, padding: "4px 0 0px", marginBottom: 20 }}>
                      Showing results for specialties {query ? `matching "${query}" ` : ""}in {location === "All" ? "all locations" : `${location} location`}
                    </div>

                    {selectedAlphabets.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
                        {selectedAlphabets.map(val => (
                          <div 
                            key={val}
                            style={{ 
                              display: "inline-flex", 
                              alignItems: "center", 
                              gap: 6, 
                              background: "rgba(237, 28, 36, 0.08)", 
                              border: "1px solid var(--color-emergency)", 
                              borderRadius: 100, 
                              height: 32,
                              padding: "0 12px",
                              boxSizing: "border-box", 
                              fontSize: 13, 
                              fontWeight: 600,
                              color: "var(--color-emergency)" 
                            }}
                          >
                            {val}
                            <button 
                              onClick={() => toggleFilter(setSelectedAlphabets, val)}
                              style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", padding: 0, cursor: "pointer", color: "var(--color-emergency)" }}
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(330px, 1fr))", gap: 20 }}>
                      {displaySpecialties
                        .filter(spec => selectedAlphabets.length === 0 || selectedAlphabets.includes(spec.name.charAt(0).toUpperCase()))
                        .map((spec) => (
                        <motion.div 
                          key={spec.id} 
                          whileHover={{ y: -4, boxShadow: "var(--shadow-lg)" }}
                          transition={{ duration: 0.2 }}
                          style={{ 
                            background: "var(--color-bg-card)", 
                            border: "1px solid var(--color-border)", 
                            borderRadius: 16, 
                            overflow: "hidden", 
                            boxShadow: "var(--shadow-sm)",
                            cursor: "pointer"
                          }}
                        >
                          <div style={{ width: "100%", height: 240, position: "relative", padding: 16 }}>
                            <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 12, overflow: "hidden" }}>
                              <Image 
                                src={spec.image || "/images/misc/procedure_placeholder.png"} 
                                alt={spec.name} 
                                fill 
                                style={{ objectFit: "cover" }} 
                              />
                            </div>
                          </div>
                          <div style={{ padding: "0 20px 20px" }}>
                            <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--color-text)", marginBottom: 8, lineHeight: 1.3 }}>{spec.name}</h3>
                            <p style={{ fontSize: 14, color: "var(--color-text-secondary)", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                              {spec.description || "Comprehensive care and advanced treatments for various conditions."}
                            </p>
                          </div>
                          <div style={{ padding: "16px 20px", borderTop: "1px solid var(--color-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--color-primary)" }}>View Details</span>
                            <ArrowRight size={16} color="var(--color-primary)" />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    
                    {displaySpecialties.filter(spec => selectedAlphabets.length === 0 || selectedAlphabets.includes(spec.name.charAt(0).toUpperCase())).length === 0 && !isFiltering && <EmptyState category="specialties" />}
                  </div>
                </div>
              )}

              {activeTab === "treatments" && (
                <div className={styles.doctorsLayout}>
                  {/* Left Sidebar Filters */}
                  <div className={styles.filterPanel} data-lenis-prevent="true">
                    {/* A-Z Filter */}
                    <div className={styles.filterGroup}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                        <h4 className={styles.filterTitle} style={{ marginBottom: 0 }}>Browse by A-Z</h4>
                        {selectedAlphabets.length > 0 && (
                          <button
                            onClick={() => {
                              setSelectedAlphabets([]);
                              setIsFiltering(true);
                              setTimeout(() => setIsFiltering(false), 300);
                            }}
                            style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", color: "var(--color-emergency)", fontSize: 12, fontWeight: 700, cursor: "pointer", padding: 0 }}
                          >
                            Clear <X size={12} />
                          </button>
                        )}
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
                        {Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)).map(letter => (
                          <label key={letter} style={{
                            display: "flex", alignItems: "center", justifyContent: "center", 
                            padding: "8px 0", border: "1px solid", 
                            borderColor: selectedAlphabets.includes(letter) ? "var(--color-emergency)" : "var(--color-border)",
                            background: selectedAlphabets.includes(letter) ? "rgba(237, 28, 36, 0.08)" : "#fff",
                            color: selectedAlphabets.includes(letter) ? "var(--color-emergency)" : "var(--color-text)",
                            borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 600,
                            transition: "all 0.2s"
                          }}>
                            <input 
                              type="checkbox" 
                              style={{ display: "none" }}
                              checked={selectedAlphabets.includes(letter)}
                              onChange={() => toggleFilter(setSelectedAlphabets, letter)}
                            />
                            {letter}
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Type Filter */}
                    <div className={styles.filterGroup}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                        <h4 className={styles.filterTitle} style={{ marginBottom: 0 }}>Type</h4>
                        {selectedTreatmentTypes.length > 0 && (
                          <button
                            onClick={() => {
                              setSelectedTreatmentTypes([]);
                              setIsFiltering(true);
                              setTimeout(() => setIsFiltering(false), 300);
                            }}
                            style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", color: "var(--color-emergency)", fontSize: 12, fontWeight: 700, cursor: "pointer", padding: 0 }}
                          >
                            Clear <X size={12} />
                          </button>
                        )}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {["Procedures", "Treatments"].map((type) => (
                          <label key={type} className={styles.checkboxLabel}>
                            <input 
                              type="checkbox" 
                              className={styles.checkboxInput}
                              checked={selectedTreatmentTypes.includes(type)}
                              onChange={() => toggleFilter(setSelectedTreatmentTypes, type)}
                            />
                            {type}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Main Grid Content Area */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                    {/* Active Filters Pills */}
                    {(selectedAlphabets.length > 0 || selectedTreatmentTypes.length > 0) && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                        {[
                          ...selectedAlphabets.map(val => ({ label: val, remove: () => toggleFilter(setSelectedAlphabets, val) })),
                          ...selectedTreatmentTypes.map(val => ({ label: val, remove: () => toggleFilter(setSelectedTreatmentTypes, val) }))
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
                              height: 32,
                              padding: "0 12px",
                              boxSizing: "border-box", 
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
                    )}

                    {/* Search Summary Text */}
                    {activeTab === "treatments" && (
                      <div style={{ fontSize: 15, color: "#334155", fontWeight: 500, padding: "4px 0 0px", marginBottom: -12 }}>
                        Showing results for {selectedTreatmentTypes.length > 0 ? selectedTreatmentTypes.join(" and ").toLowerCase() : "procedures and treatments"} {query ? `matching "${query}" ` : ""}in {location === "All" ? "all locations" : `${location} location`}
                      </div>
                    )}

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(330px, 1fr))", gap: 20 }}>
                      {displayTreatments.map((treat) => (
                        <motion.div 
                          key={treat.id} 
                          whileHover={{ y: -4, boxShadow: "var(--shadow-lg)" }}
                          transition={{ duration: 0.2 }}
                          style={{ 
                            background: "var(--color-bg-card)", 
                            border: "1px solid var(--color-border)", 
                            borderRadius: 16, 
                            overflow: "hidden", 
                            boxShadow: "var(--shadow-sm)",
                            cursor: "pointer"
                          }}
                        >
                          <div style={{ width: "100%", height: 240, position: "relative", padding: 16 }}>
                            <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 12, overflow: "hidden" }}>
                              <Image 
                                src={(treat as any).image || "/images/misc/procedure_placeholder.png"} 
                                alt={treat.name} 
                                fill 
                                style={{ objectFit: "cover" }} 
                              />
                              <div style={{ 
                                position: "absolute", top: 8, left: 8, 
                                background: "rgba(255,255,255,0.9)", padding: "4px 10px", 
                                borderRadius: 20, fontSize: 12, fontWeight: 700, 
                                color: "var(--color-primary)" 
                              }}>
                                {(treat as any).type || "Procedures"}
                              </div>
                            </div>
                          </div>
                          <div style={{ padding: "0 20px 20px 20px" }}>
                            <span style={{ 
                              fontSize: 10, color: "var(--color-primary)", 
                              fontWeight: 700, textTransform: "uppercase", 
                              letterSpacing: "0.05em", marginBottom: 12, 
                              display: "inline-block" 
                            }}>
                              {treat.speciality}
                            </span>
                            <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--color-text)", marginBottom: 8, lineHeight: 1.3 }}>
                              {treat.name}
                            </h3>
                            <p style={{ 
                              fontSize: 14, color: "var(--color-text-secondary)", 
                              lineHeight: 1.5, marginBottom: 20, 
                              display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" 
                            }}>
                              {treat.description}
                            </p>

                          </div>
                        </motion.div>
                      ))}
                    </div>
                    {displayTreatments.length === 0 && !isFiltering && <EmptyState category="treatments" />}
                  </div>
                </div>
              )}

              {/* HEALTH PACKAGES & TESTS PANEL */}
              {activeTab === "packages_tests" && (
                <div className={styles.doctorsLayout}>
                  {/* Sidebar Filters */}
                  <div className={styles.filterPanel} data-lenis-prevent="true">

                    {/* Gender Filter */}
                    <div className={styles.filterGroup}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                        <h4 className={styles.filterTitle} style={{ marginBottom: 0 }}>Gender</h4>
                        {selectedPackageGender.length > 0 && (
                          <button
                            onClick={() => {
                              setSelectedPackageGender([]);
                              setIsFiltering(true);
                              setTimeout(() => setIsFiltering(false), 300);
                            }}
                            style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", color: "var(--color-emergency)", fontSize: 12, fontWeight: 700, cursor: "pointer", padding: 0 }}
                          >
                            Clear <X size={12} />
                          </button>
                        )}
                      </div>
                      {["Male", "Female", "Anyone"].map((gender) => (
                        <label key={gender} className={styles.checkboxLabel}>
                          <input 
                            type="checkbox" 
                            className={styles.checkboxInput}
                            checked={selectedPackageGender.includes(gender)}
                            onChange={() => toggleFilter(setSelectedPackageGender, gender)}
                          />
                          {gender}
                        </label>
                      ))}
                    </div>

                    {/* Hospitals Filter */}
                    <div className={styles.filterGroup}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                        <h4 className={styles.filterTitle} style={{ marginBottom: 0 }}>Hospital</h4>
                        {selectedPackageHospitals.length > 0 && (
                          <button
                            onClick={() => {
                              setSelectedPackageHospitals([]);
                              setIsFiltering(true);
                              setTimeout(() => setIsFiltering(false), 300);
                            }}
                            style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", color: "var(--color-primary)", fontSize: "var(--font-size-sm)", fontWeight: 600, cursor: "pointer", padding: 0 }}
                          >
                            Clear
                          </button>
                        )}
                      </div>
                      {["NH Bangalore", "NH Mumbai", "NH Delhi", "NH Kolkata", "NH Jaipur", "NH Guwahati"].map((hosp) => (
                        <label key={hosp} className={styles.checkboxLabel}>
                          <input 
                            type="checkbox" 
                            className={styles.checkboxInput}
                            checked={selectedPackageHospitals.includes(hosp)}
                            onChange={() => toggleFilter(setSelectedPackageHospitals, hosp)}
                          />
                          {hosp}
                        </label>
                      ))}
                    </div>

                    {/* Type Filter */}
                    <div className={styles.filterGroup}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                        <h4 className={styles.filterTitle} style={{ marginBottom: 0 }}>Type</h4>
                        {selectedPackageType.length > 0 && (
                          <button
                            onClick={() => {
                              setSelectedPackageType([]);
                              setIsFiltering(true);
                              setTimeout(() => setIsFiltering(false), 300);
                            }}
                            style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", color: "var(--color-primary)", fontSize: "var(--font-size-sm)", fontWeight: 600, cursor: "pointer", padding: 0 }}
                          >
                            Clear
                          </button>
                        )}
                      </div>
                      {["Health Packages", "Tests"].map((type) => (
                        <label key={type} className={styles.checkboxLabel}>
                          <input 
                            type="checkbox" 
                            className={styles.checkboxInput}
                            checked={selectedPackageType.includes(type)}
                            onChange={() => toggleFilter(setSelectedPackageType, type)}
                          />
                          {type}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Main Content Area */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 24, flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", width: "100%", gap: 16 }}>
                      {/* Active Filter Pills (Left Side) */}
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", flex: 1 }}>
                        {/* Quick Filter Pills (Default) */}
                        {!selectedPackageGender.includes("Male") && (
                          <button 
                            onClick={() => toggleFilter(setSelectedPackageGender, "Male")}
                            style={{ 
                              display: "inline-flex", alignItems: "center", gap: 6, 
                              background: "#FFFFFF", border: "1px solid var(--color-border)", 
                              borderRadius: 16, height: 32, padding: "0 16px", 
                              fontSize: 13, fontWeight: 500, color: "var(--color-text)", cursor: "pointer",
                              transition: "var(--transition-fast)"
                            }}
                          >
                            Male
                          </button>
                        )}
                        {!selectedPackageGender.includes("Female") && (
                          <button 
                            onClick={() => toggleFilter(setSelectedPackageGender, "Female")}
                            style={{ 
                              display: "inline-flex", alignItems: "center", gap: 6, 
                              background: "#FFFFFF", border: "1px solid var(--color-border)", 
                              borderRadius: 16, height: 32, padding: "0 16px", 
                              fontSize: 13, fontWeight: 500, color: "var(--color-text)", cursor: "pointer",
                              transition: "var(--transition-fast)"
                            }}
                          >
                            Female
                          </button>
                        )}
                        
                        {/* Dynamic Filter Pills */}
                        {[
                          ...(selectedPackageGender.map(val => ({ label: val, remove: () => toggleFilter(setSelectedPackageGender, val) }))),
                          ...(selectedPackageHospitals.map(val => ({ label: val, remove: () => toggleFilter(setSelectedPackageHospitals, val) }))),
                          ...(selectedPackageType.map(val => ({ label: val, remove: () => toggleFilter(setSelectedPackageType, val) })))
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
                              height: 32,
                              padding: "0 12px",
                              boxSizing: "border-box", 
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
                                color: "var(--color-emergency)",
                                marginLeft: 4
                              }}
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 4, background: "#ffffff", border: "1px solid var(--color-border)", borderRadius: 16, padding: "0 8px 0 12px", height: 32, flexShrink: 0, position: "relative" }}>
                        <MapPin size={14} color="var(--color-primary)" />
                        <select
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          style={{
                            appearance: "none",
                            WebkitAppearance: "none",
                            border: "none",
                            background: "transparent",
                            fontSize: 13,
                            fontWeight: 600,
                            color: "var(--color-primary)",
                            cursor: "pointer",
                            outline: "none",
                            paddingRight: 16
                          }}
                        >
                          <option value="All">All Locations</option>
                          <option value="Bangalore">Bangalore</option>
                          <option value="Guwahati">Guwahati</option>
                          <option value="Dharwad">Dharwad</option>
                          <option value="Shimoga">Shimoga</option>
                          <option value="Ahmedabad">Ahmedabad</option>
                          <option value="Jaipur">Jaipur</option>
                          <option value="Kolar">Kolar</option>
                          <option value="Mumbai">Mumbai</option>
                          <option value="Raipur">Raipur</option>
                          <option value="Kolkata">Kolkata</option>
                          <option value="Davangere">Davangere</option>
                          <option value="Barasat">Barasat</option>
                          <option value="Jamshedpur">Jamshedpur</option>
                          <option value="Gurugram">Gurugram</option>
                          <option value="Howrah">Howrah</option>
                          <option value="Delhi">Delhi</option>
                          <option value="Mysore">Mysore</option>
                          <option value="Hosur">Hosur</option>
                        </select>
                        <ChevronDown size={14} color="var(--color-primary)" style={{ position: "absolute", right: 8, pointerEvents: "none" }} />
                      </div>
                    </div>

                    {/* Search Summary Text */}
                    {activeTab === "packages_tests" && (
                      <div style={{ fontSize: 15, color: "#334155", fontWeight: 500, padding: "4px 0 0px", marginBottom: -12 }}>
                        Showing results for {selectedPackageType.length > 0 ? selectedPackageType.join(" and ").toLowerCase() : "health packages and tests"} {query ? `matching "${query}" ` : ""}in {location === "All" ? "all locations" : `${location} location`}
                      </div>
                    )}

                  {filteredPackages.length > 0 && (
                    <div>
                      <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--color-text)", marginBottom: 16 }}>Health Packages</h2>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
                        {filteredPackages.map((pkg) => (
                          <div 
                            key={pkg.id}
                            style={{ 
                              background: "#FFFFFF", 
                              border: "1px solid #E2E8F0", 
                              borderRadius: 16, 
                              padding: 20, 
                              boxShadow: "var(--shadow-sm)",
                              position: "relative",
                              display: "flex",
                              flexDirection: "column"
                            }}
                          >
                            <div style={{ flex: 1 }}>
                              {pkg.image && (
                                <div style={{ position: "relative", width: "100%", height: 170, marginBottom: 16, borderRadius: 12, overflow: "hidden" }}>
                                  <Image src={pkg.image} alt={pkg.name} fill sizes="(max-width: 768px) 100vw, 300px" style={{ objectFit: "cover", objectPosition: "top" }} />
                                </div>
                              )}
                              <div style={{ marginBottom: 12 }}>
                                {pkg.idealFor && (
                                  <div style={{ 
                                    display: "inline-flex", 
                                    alignItems: "center", 
                                    padding: "4px 10px", 
                                    background: "rgba(3, 78, 162, 0.08)", 
                                    color: "#1E293B", 
                                    borderRadius: 16, 
                                    fontSize: 11, 
                                    fontWeight: 400, 
                                    marginBottom: 8 
                                  }}>
                                    {pkg.idealFor}
                                  </div>
                                )}
                                <h3 style={{ fontSize: 17, fontWeight: 700, color: "#1E293B", marginTop: 4 }}>{pkg.name}</h3>
                              </div>
                              
                              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 8 }}>
                                {pkg.inclusions.slice(0, pkg.name.length > 34 ? 4 : 5).map((inc) => (
                                  <div key={inc} style={{ fontSize: 12, color: "#475569", display: "flex", alignItems: "center", gap: 6 }}>
                                    <ShieldCheck size={14} style={{ color: "#10B981" }} /> {inc}
                                  </div>
                                ))}
                                <div style={{ fontSize: 11, color: "var(--color-primary)", fontWeight: 700, paddingLeft: 20 }}>
                                  + {pkg.tests} included
                                </div>
                              </div>
                            </div>

                            <div style={{ height: 1, background: "var(--color-border)", margin: "16px 0" }} />
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <div style={{ display: "flex", flexDirection: "column" }}>
                                <span style={{ fontSize: "var(--font-size-lg)", fontWeight: 800, color: "var(--color-text)", lineHeight: 1 }}>{pkg.price}</span>
                                <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", marginTop: 4, lineHeight: 1 }}>Total cost</span>
                              </div>
                              <div style={{ display: "flex", gap: 8 }}>
                                <a href={`tel:+919876543210`} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 44, height: 44, borderRadius: 22, border: "1px solid var(--color-border)", color: "var(--color-primary)", textDecoration: "none", transition: "var(--transition-fast)", flexShrink: 0 }}>
                                  <PhoneCall size={18} />
                                </a>
                                <Link href="/" style={{ height: 44, padding: "0 24px", background: "var(--color-primary)", color: "var(--color-text-inverse)", borderRadius: 22, fontSize: "var(--font-size-sm)", fontWeight: 700, textDecoration: "none", transition: "var(--transition-fast)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                  Book Package
                                </Link>
                              </div>
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
                              boxShadow: "var(--shadow-sm)",
                              display: "flex",
                              flexDirection: "column"
                            }}
                          >
                            <div style={{ flex: 1 }}>
                              <div style={{ marginBottom: 12 }}>
                                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1E293B" }}>{lab.name}</h3>
                                <p style={{ fontSize: 11, color: "#64748B", marginTop: 4 }}>{lab.parameters}</p>
                              </div>
                              <p style={{ fontSize: 12, color: "#64748B", display: "flex", alignItems: "center", gap: 4, marginBottom: 8 }}>
                                <Clock size={12} /> {lab.time}
                              </p>
                            </div>
                            <div style={{ height: 1, background: "var(--color-border)", margin: "16px 0" }} />
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <div style={{ display: "flex", flexDirection: "column" }}>
                                <span style={{ fontSize: "var(--font-size-lg)", fontWeight: 800, color: "var(--color-text)", lineHeight: 1 }}>{lab.price}</span>
                                <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", marginTop: 4, lineHeight: 1 }}>Total cost</span>
                              </div>
                              <div style={{ display: "flex", gap: 8 }}>
                                <a href={`tel:+919876543210`} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 44, height: 44, borderRadius: 22, border: "1px solid var(--color-border)", color: "var(--color-primary)", textDecoration: "none", transition: "var(--transition-fast)", flexShrink: 0 }}>
                                  <PhoneCall size={18} />
                                </a>
                                <Link href="/" style={{ height: 44, padding: "0 24px", background: "transparent", color: "var(--color-primary)", border: "1px solid var(--color-primary)", borderRadius: 22, fontSize: "var(--font-size-sm)", fontWeight: 700, textDecoration: "none", transition: "var(--transition-fast)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                  Add Test
                                </Link>
                              </div>
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
                </div>
              )}

              {/* SPECIALTIES PANEL */}
              {activeTab === "specialty" && (
                <div className={styles.doctorsLayout}>
                  {/* Left Sidebar Filters */}
                  <div className={styles.filterPanel} data-lenis-prevent="true">
                    {/* A-Z Filter */}
                    <div className={styles.filterGroup}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                        <h4 className={styles.filterTitle} style={{ marginBottom: 0 }}>Browse by A-Z</h4>
                        {selectedAlphabets.length > 0 && (
                          <button
                            onClick={() => {
                              setSelectedAlphabets([]);
                              setIsFiltering(true);
                              setTimeout(() => setIsFiltering(false), 300);
                            }}
                            style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", color: "var(--color-emergency)", fontSize: 12, fontWeight: 700, cursor: "pointer", padding: 0 }}
                          >
                            Clear <X size={12} />
                          </button>
                        )}
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
                        {Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)).map(letter => (
                          <label key={letter} style={{
                            display: "flex", alignItems: "center", justifyContent: "center", 
                            padding: "8px 0", border: "1px solid", 
                            borderColor: selectedAlphabets.includes(letter) ? "var(--color-emergency)" : "var(--color-border)",
                            background: selectedAlphabets.includes(letter) ? "rgba(237, 28, 36, 0.08)" : "#fff",
                            color: selectedAlphabets.includes(letter) ? "var(--color-emergency)" : "var(--color-text)",
                            borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 600,
                            transition: "all 0.2s"
                          }}>
                            <input 
                              type="checkbox" 
                              style={{ display: "none" }}
                              checked={selectedAlphabets.includes(letter)}
                              onChange={() => toggleFilter(setSelectedAlphabets, letter)}
                            />
                            {letter}
                          </label>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* Main Grid Content Area */}
                  <div>
                    <div style={{ fontSize: 15, color: "#334155", fontWeight: 500, padding: "4px 0 0px", marginBottom: 16 }}>
                      Showing results for specialties {query ? `matching "${query}" ` : ""}in {location === "All" ? "all locations" : `${location} location`}
                    </div>

                    {selectedAlphabets.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
                        {selectedAlphabets.map(alphabet => (
                          <div 
                            key={alphabet}
                            style={{ 
                              display: "inline-flex", alignItems: "center", gap: 6, 
                              background: "rgba(237, 28, 36, 0.08)", border: "1px solid var(--color-emergency)", 
                              borderRadius: 16, height: 32, padding: "0 12px", 
                              fontSize: 13, fontWeight: 500, color: "var(--color-emergency)"
                            }}
                          >
                            {alphabet}
                            <button 
                              onClick={() => toggleFilter(setSelectedAlphabets, alphabet)}
                              style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", padding: 0, cursor: "pointer", color: "var(--color-emergency)" }}
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <h2 style={{ fontSize: 24, fontWeight: 700, color: "var(--color-text)", marginBottom: selectedAlphabets.length > 0 ? 16 : 24 }}>Specialties</h2>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
                      {filteredSpecialty.filter(s => selectedAlphabets.length === 0 || selectedAlphabets.includes(s.charAt(0).toUpperCase())).map((spec) => {
                        const iconMap: Record<string, string> = {
                          "Cardiologist": "Cardiology.svg",
                          "Orthopaedician": "Orthopaedics.svg",
                          "Oncologist": "Cancercare.svg",
                          "Neurologist": "Neurology.svg",
                          "Pediatrician": "Paedratic.svg",
                          "Cardiac Surgeon": "Cardiac Science.svg",
                          "General Surgeon": "General Surgery.svg",
                          "Vascular Surgeon": "General Surgery.svg",
                          "Plastic Surgeon": "General Surgery.svg",
                          "Gastroenterologist": "Gastro.svg",
                          "Pulmonologist": "Pulmonology.svg",
                          "Endocrinologist": "Diabetology.svg",
                          "Nephrologist": "Nephrology.svg",
                          "Urologist": "Urology.svg",
                          "Gynecologist": "Gynaecology.svg",
                          "ENT Specialist": "General Medicine.svg",
                          "Dermatologist": "General Medicine.svg",
                          "Dentist": "Dental.svg"
                        };
                        const iconFile = iconMap[spec] || "General Medicine.svg";

                        return (
                          <motion.div 
                            key={spec}
                            whileHover={{ y: -4, boxShadow: "var(--shadow-lg)" }}
                            transition={{ duration: 0.2 }}
                            style={{ 
                              background: "linear-gradient(to right, #ffffff 0%, var(--color-primary-light) 100%)", 
                              padding: "0 20px", 
                              borderRadius: 12, 
                              border: "1px solid var(--color-border)",
                              display: "flex",
                              alignItems: "center",
                              gap: 12,
                              cursor: "pointer",
                              height: 72
                            }}
                          >
                            <img 
                              src={`/Specialities icons/${iconFile}`} 
                              alt={spec} 
                              style={{ width: 24, height: 24, objectFit: "contain" }} 
                            />
                            <span style={{ fontSize: 16, fontWeight: 600, color: "var(--color-text)", lineHeight: 1.2 }}>{spec}</span>
                          </motion.div>
                        );
                      })}
                    </div>
                    {filteredSpecialty.filter(s => selectedAlphabets.length === 0 || selectedAlphabets.includes(s.charAt(0).toUpperCase())).length === 0 && <EmptyState category="specialties" />}
                  </div>
                </div>
              )}

              {/* ARTICLES PANEL */}
              {activeTab === "articles" && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
                  {displayArticles.map((art) => (
                    <motion.div 
                      key={art.id}
                      whileHover={{ y: -4, boxShadow: "var(--shadow-lg)" }}
                      transition={{ duration: 0.2 }}
                      style={{ 
                        background: "var(--color-bg-card)", 
                        border: "1px solid var(--color-border)", 
                        borderRadius: 16, 
                        overflow: "hidden", 
                        boxShadow: "var(--shadow-sm)",
                        cursor: "pointer"
                      }}
                    >
                      <div style={{ width: "100%", height: 240, position: "relative", padding: 16 }}>
                        <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 12, overflow: "hidden" }}>
                          <Image 
                            src={art.image}
                            alt={art.title}
                            fill
                            style={{ objectFit: "cover" }}
                          />
                        </div>
                      </div>
                      <div style={{ padding: "0 20px 20px 20px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                          <span style={{ fontSize: 10, color: "var(--color-primary)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
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
                        <div style={{ height: 1, background: "var(--color-border)", margin: "16px 0" }} />
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12 }}>
                          <span style={{ color: "#475569" }}>By <strong>{art.author}</strong></span>
                          <span style={{ color: "#94A3B8", display: "flex", alignItems: "center", gap: 4 }}>
                            <Clock size={12} /> {art.readTime}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {displayArticles.length === 0 && !isFiltering && <EmptyState category="articles" />}
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
