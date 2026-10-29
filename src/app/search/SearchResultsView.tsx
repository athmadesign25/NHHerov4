"use client";

import { Suspense } from "react";
import Design20SearchResults from "./designs/d20/Design20SearchResults";
import styles from "./search.module.css";

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

// TABS imported from searchTabs

export default function SearchResultsPage() {
  return <Suspense fallback={<div className={styles.previewLoading} role="status">Loading search results…</div>}>
    <Design20SearchResults catalogs={{ hospitals: hospitalsData, treatments: treatmentsData, packages: packagesData, labs: labsData, articles: articlesData }} />
  </Suspense>;
}
