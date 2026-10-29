"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { ChevronRight, ChevronLeft, ChevronDown, Check, Shield, Award, Virus, Star, Clock, MapPin, ArrowUpRight } from "lucide-react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import TextSweepEffect from "@/components/ui/TextSweepEffect";
import { MetricValueReveal } from "@/components/sections/hero/Hero";
import styles from "./SpecialityDesign2.module.css";
import { Button } from "@/components/ui/Button";
import ModernCarousel from "@/components/ui/ModernCarousel";
import SpecialityPatientStories from "@/components/sections/patient-stories/SpecialityPatientStories";
import WhyChooseNHBento from "@/components/sections/why-choose-nh/WhyChooseNHBento";
import FloatingTOC, { TOCItem } from "@/components/ui/FloatingTOC";
import SpecialityFAQ from "@/components/ui/SpecialityFAQ";
import HospitalCarousel from "@/components/ui/HospitalCarousel";
import AdvanceTechnology from "@/components/sections/advance-technology/AdvanceTechnology";
import AdvanceTestsCarousel from "@/components/ui/AdvanceTestsCarousel";
import DoctorOverviewCarousel from "@/components/ui/DoctorOverviewCarousel";
import MedicallyReviewedBand from "@/components/ui/MedicallyReviewedBand";
import AboutSpecialitySection from "./AboutSpecialitySection";
import { HOSPITALS_DATA } from "@/data/hospitalsData";
import { ALL_SPECIALITIES } from "@/data/specialities";

const TOC_ITEMS: TOCItem[] = [
  { id: "overview", label: "Overview" },
  { id: "treatments", label: "Conditions We Treat" },
  { id: "doctors", label: "Our Doctors" },
  { id: "procedures", label: "Procedures & Surgeries" },
  { id: "technology", label: "Advance Technology" },
  { id: "tests", label: "Advance Tests" },
  { id: "about-speciality", label: "About Speciality" },
  { id: "doctor-overview", label: "Doctor Video Insights" },
  { id: "why-us", label: "Why Choose Us" },
  { id: "patient-stories", label: "Patient Stories" },
  { id: "hospitals", label: "Hospitals & Clinics" },
  { id: "faqs", label: "FAQs" },
];

// Add specific images manually (using generic assets or Next.js Image fallbacks)
const heroImage = "/assets/hero_bg.png"; // Placeholder
const gastroImage = "/assets/doctor_1.png"; // Placeholder
const breastImage = "/assets/doctor_2.png"; // Placeholder
const neuroImage = "/assets/doctor_3.png"; // Placeholder

const adultCancerCategories = [
  {
    id: "breast",
    title: "Breast Cancer & Oncoplasty Treatment",
    programmeTitle: "Breast Cancer & Oncoplasty Treatment Programme",
    icon: "/assets/breast_cancer.png",
    bg: "/assets/breast_cancer.png",
    desc: "Breast cancer care follows a clear plan with accurate diagnosis, tumour profiling, stage-wise treatment and support through recovery and follow-up.",
    subConditions: [
      { title: "Breast cancer", desc: "A cancer that starts in the cells of the breast, most often in the milk ducts or milk-producing glands." }
    ]
  },
  {
    id: "gastro",
    title: "Gastrointestinal (GI) Cancer Treatment",
    programmeTitle: "Gastrointestinal (GI) Cancer Treatment Programme",
    icon: "/assets/patient_in_1.png",
    bg: "/assets/patient_in_1.png",
    desc: "Gastrointestinal cancer refers to the development of cancer in any organ of the digestive tract, such as the stomach, liver, pancreas, and related organs.",
    subConditions: [
      { title: "Stomach Cancer", desc: "Gastrointestinal cancers affect the digestive system" },
      { title: "Oesophagus Cancer", desc: "Gastrointestinal cancers affect the digestive system" },
      { title: "HPB Cancer", desc: "Gastrointestinal cancers affect the digestive system" },
      { title: "Intestine Cancer", desc: "Gastrointestinal cancers affect the digestive system" },
      { title: "Colon Cancer", desc: "Gastrointestinal cancers affect the digestive system" },
      { title: "Pancreatic Cancer", desc: "Gastrointestinal cancers affect the digestive system" },
      { title: "Anal Cancer", desc: "Gastrointestinal cancers affect the digestive system" },
    ]
  },
  {
    id: "genitourinary",
    title: "Genitourinary Cancer Treatment",
    programmeTitle: "Genitourinary Cancer Treatment Programme",
    icon: "/assets/patient_in_2.png",
    bg: "/assets/patient_in_2.png",
    desc: "Advanced treatment and personalized care for cancers affecting the urinary tract and the male reproductive system.",
    subConditions: []
  },
  {
    id: "gynaecologic",
    title: "Gynaecologic Cancer Treatment",
    programmeTitle: "Gynaecologic Cancer Treatment Programme",
    icon: "/assets/gynaecologic_cancer.png",
    bg: "/assets/gynaecologic_cancer.png",
    desc: "Comprehensive diagnosis and treatment for cancers of the female reproductive system.",
    subConditions: []
  },
  {
    id: "headneck",
    title: "Head & Neck Cancer Treatment",
    programmeTitle: "Head & Neck Cancer Treatment Programme",
    icon: "/assets/hospital_1.png",
    bg: "/assets/hospital_1.png",
    desc: "Specialized care for cancers of the mouth, throat, voice box, and thyroid with a focus on preserving function.",
    subConditions: []
  },
  {
    id: "haematologic",
    title: "Haematologic-Oncology (Blood Cancer) Treatment",
    programmeTitle: "Haematologic-Oncology (Blood Cancer) Treatment Programme",
    icon: "/assets/hero_modern.png",
    bg: "/assets/hero_modern.png",
    desc: "Expert care for leukemia, lymphoma, myeloma, and other blood-related disorders, featuring advanced cellular therapies.",
    subConditions: []
  },
  {
    id: "neuro",
    title: "Neuro Oncology Treatment",
    programmeTitle: "Neuro Oncology Treatment Programme",
    icon: "/assets/neuro_cancer.png",
    bg: "/assets/neuro_cancer.png",
    desc: "Advanced treatment for brain and spinal cord tumors using cutting edge neuro-navigation and radiosurgery.",
    subConditions: []
  },
  {
    id: "musculoskeletal",
    title: "Musculoskeletal Oncology",
    programmeTitle: "Musculoskeletal Oncology Programme",
    icon: "/assets/patient_in_3.png",
    bg: "/assets/patient_in_3.png",
    desc: "Specialized care targeting bone and soft tissue sarcomas with a focus on limb salvage and function preservation.",
    subConditions: []
  },
  {
    id: "thoracic",
    title: "Thoracic (Lung) Cancer Treatment",
    programmeTitle: "Thoracic (Lung) Cancer Treatment Programme",
    icon: "/assets/patient_in_4.png",
    bg: "/assets/patient_in_4.png",
    desc: "Comprehensive diagnostic and therapeutic approaches for lung cancer and other malignancies of the chest cavity.",
    subConditions: []
  }
];

const paediatricCancerCategories = [
  {
    id: "paed-blood-disorders",
    title: "Paediatric Blood Disorders",
    programmeTitle: "Paediatric Blood Disorders Programme",
    icon: "https://stgaccinwbsprdlrs02.blob.core.windows.net/corporatewebsite/symptoms/January2026/2v70sJfGlQ4DODbvIqdV.webp",
    bg: "/assets/hero_modern.png",
    desc: "Comprehensive diagnostic and therapeutic care for children with benign blood conditions, including thalassaemia, sickle cell disease, haemophilia, and aplastic anaemia.",
    subConditions: [
      { title: "Thalassaemia Major", desc: "Genetic blood disorder affecting haemoglobin production in children." },
      { title: "Sickle Cell Disease", desc: "Inherited red blood cell condition causing pain crises and anaemia." },
      { title: "Aplastic Anaemia", desc: "Bone marrow failure leading to deficiency of all blood cell types." },
      { title: "Bleeding Disorders & Haemophilia", desc: "Clotting factor deficiencies treated with factor replacement therapy." }
    ]
  },
  {
    id: "paed-blood-cancers",
    title: "Paediatric Blood Cancers",
    programmeTitle: "Paediatric Blood Cancers Programme",
    icon: "https://stgaccinwbsprdlrs02.blob.core.windows.net/corporatewebsite/symptoms/January2026/gFWCGpcgxgt6RRgpP1QS.webp",
    bg: "/assets/patient_in_1.png",
    desc: "Dedicated childhood leukaemia and lymphoma programmes delivering advanced multi-agent chemotherapy, immunotherapy, and bone marrow transplants with world-class survival rates.",
    subConditions: [
      { title: "Acute Lymphoblastic Leukaemia (ALL)", desc: "Most common childhood cancer, treated with tailored risk-adapted protocols." },
      { title: "Acute Myeloid Leukaemia (AML)", desc: "Aggressive leukaemia treated with intensive chemotherapy and BMT." },
      { title: "Hodgkin & Non-Hodgkin Lymphoma", desc: "Lymph node malignancies managed with precision staging and systemic therapies." }
    ]
  },
  {
    id: "paed-brain-tumours",
    title: "Paediatric Brain Tumours",
    programmeTitle: "Paediatric Brain Tumours Programme",
    icon: "https://stgaccinwbsprdlrs02.blob.core.windows.net/corporatewebsite/symptoms/January2026/3DRjQiYG4tICdZ8nuWJ9.webp",
    bg: "/assets/neuro_cancer.png",
    desc: "Multidisciplinary neuro-oncology care combining paediatric neurosurgeons, radiation oncologists, and oncologists utilizing neuronavigation, proton therapy, and targeted treatment.",
    subConditions: [
      { title: "Medulloblastoma", desc: "Fast-growing high-grade embryonal brain tumour in the cerebellum." },
      { title: "Ependymoma", desc: "Tumours arising from the ependymal cells lining ventricles and spinal cord." },
      { title: "Low & High-Grade Gliomas", desc: "Glial cell tumours managed with microsurgery and targeted biologic therapies." },
      { title: "Craniopharyngioma", desc: "Benign suprasellar tumours requiring neuro-endoscopic sparing surgery." }
    ]
  },
  {
    id: "paed-solid-tumours",
    title: "Paediatric Solid Tumours",
    programmeTitle: "Paediatric Solid Tumours Programme",
    icon: "https://stgaccinwbsprdlrs02.blob.core.windows.net/corporatewebsite/symptoms/January2026/4iPN1V0pzmJ9qb0Rvxth.webp",
    bg: "/assets/patient_in_2.png",
    desc: "Specialized treatment protocols for kidney, liver, bone, muscle, and nerve tumours in children with limb preservation and organ-sparing surgical focus.",
    subConditions: [
      { title: "Neuroblastoma", desc: "Tumour arising from immature nerve cells, frequently in the adrenal glands." },
      { title: "Wilms' Tumour (Nephroblastoma)", desc: "Primary kidney cancer in children with high cure rates using combined therapy." },
      { title: "Osteosarcoma & Ewing Sarcoma", desc: "Bone cancers managed with limb-salvage surgery and chemotherapy." },
      { title: "Rhabdomyosarcoma", desc: "Soft-tissue sarcoma treated with multimodal therapy and surgery." }
    ]
  }
];

const cancerCategories = adultCancerCategories;

const proceduresData = [
  {
    id: "chemo",
    title: "Chemotherapy",
    bg: "/images/procedures/chemotherapy_hd.jpg",
    desc: "Systemic anti-cancer drug treatment in planned cycles. Helps shrink tumours, control spread, and support surgery/radiation plans.",
    stat: {
      value: "300+",
      label: "Bone marrow transplants yearly,<br />delivered with specialized care."
    }
  },
  {
    id: "radiation",
    title: "Radiation Oncology",
    bg: "/images/procedures/radiation_oncology_hd.jpg",
    desc: "Advanced targeted radiation therapies including IMRT, IGRT, and stereotactic radiosurgery for precise tumor targeting.",
    stat: {
      value: "10,000+",
      label: "Precision radiation sessions yearly<br />with sub-millimetre tumour targeting."
    }
  },
  {
    id: "immuno",
    title: "Immunotherapy",
    bg: "/images/procedures/immunotherapy_hd.jpg",
    desc: "Utilizing the body's immune system to identify and fight cancer cells effectively.",
    stat: {
      value: "85%+",
      label: "Improved therapeutic response rate<br />with personalised biomarker matching."
    }
  },
  {
    id: "targeted",
    title: "Targeted Therapy",
    bg: "/advanced-technology.png",
    desc: "Drugs designed to specifically target cancer cells while minimizing damage to normal cells.",
    stat: {
      value: "95%+",
      label: "Preservation of healthy tissue,<br />minimizing systemic toxic side effects."
    }
  },
  {
    id: "surgery",
    title: "Cancer Surgeries",
    bg: "/images/procedures/procedure_surgery.png",
    desc: "Surgical removal of tumors and surrounding tissues with precision and advanced techniques.",
    stat: {
      value: "12,500+",
      label: "Complex oncology surgeries performed<br />by multi-disciplinary surgical teams."
    }
  },
  {
    id: "intra-arterial",
    title: "Intra-Arterial Chemotherapy: Targeted Cancer Treatment",
    bg: "/images/procedures/procedure_mri.png",
    desc: "Delivering chemotherapy directly into the tumor's blood supply for maximum effect while minimizing systemic toxicity.",
    stat: {
      value: "4x",
      label: "Higher local drug concentration<br />directly delivered at the tumor site."
    }
  },
  {
    id: "ttf",
    title: "Tumor Treating Fields (TTF): A Non-Invasive Cancer Therapy Using Electric Fields",
    bg: "/bento-advanced-technology.jpg",
    desc: "Using electric fields to disrupt cancer cell division and slow tumor growth in a completely non-invasive manner.",
    stat: {
      value: "24/7",
      label: "Continuous non-invasive therapy<br />inhibiting active cancer cell division."
    }
  }
];

const categoryDoctorInfoMap: Record<string, { title: string; desc: string; specialty: string }> = {
  gastro: {
    title: "Our Experts for Gastrointestinal Cancer Treatment",
    desc: "Meet our senior surgical gastroenterologists, medical oncologists, and GI specialists delivering advanced digestive tract cancer care.",
    specialty: "Gastrointestinal Oncology",
  },
  breast: {
    title: "Our Experts for Breast Cancer & Oncoplasty Treatment",
    desc: "Consult our specialized breast surgical oncologists, reconstructive surgeons, and oncology teams offering precision, stage-wise care.",
    specialty: "Breast Oncoplastic Surgery",
  },
  genitourinary: {
    title: "Our Experts for Genitourinary Cancer Treatment",
    desc: "Meet our distinguished urologic oncologists specializing in robotic surgery, kidney, bladder, and prostate cancer care.",
    specialty: "Urologic Oncology",
  },
  gynaecologic: {
    title: "Our Experts for Gynaecologic Cancer Treatment",
    desc: "Consult our experienced gynaecologic oncologists delivering comprehensive diagnostics, fertility-sparing surgery, and targeted therapies.",
    specialty: "Gynaecologic Oncology",
  },
  headneck: {
    title: "Our Experts for Head & Neck Cancer Treatment",
    desc: "Meet our renowned head and neck surgeons, reconstructive specialists, and oncology experts committed to functional preservation and cure.",
    specialty: "Head & Neck Surgical Oncology",
  },
  haematologic: {
    title: "Our Experts for Blood Cancer & Haematologic Oncology",
    desc: "Consult our senior haematologists and bone marrow transplant experts pioneering cellular therapies and targeted treatments.",
    specialty: "Haemato-Oncology & BMT",
  },
  neuro: {
    title: "Our Experts for Neuro Oncology Treatment",
    desc: "Meet our elite neurosurgeons and neuro-oncologists specializing in precision stereotactic radiosurgery and complex brain tumour care.",
    specialty: "Neuro-Oncology & Neurosurgery",
  },
  musculoskeletal: {
    title: "Our Experts for Musculoskeletal Oncology Treatment",
    desc: "Consult our specialized orthopaedic oncologists dedicated to bone and soft-tissue sarcomas with limb-salvage expertise.",
    specialty: "Orthopaedic Oncology",
  },
  thoracic: {
    title: "Our Experts for Thoracic & Lung Cancer Treatment",
    desc: "Meet our dedicated thoracic surgeons and pulmonology oncologists delivering cutting-edge minimally invasive lung cancer treatments.",
    specialty: "Thoracic Surgical Oncology",
  },
  "paed-blood-disorders": {
    title: "Our Experts for Paediatric Blood Disorders",
    desc: "Compassionate paediatric haematologists providing specialized management for thalassaemia, sickle cell disease, and complex blood conditions.",
    specialty: "Paediatric Haematology",
  },
  "paed-blood-cancers": {
    title: "Our Experts for Paediatric Blood Cancers",
    desc: "World-class paediatric oncologists and BMT specialists offering evidence-based leukaemia and lymphoma protocols for children.",
    specialty: "Paediatric Haemato-Oncology",
  },
  "paed-brain-tumours": {
    title: "Our Experts for Paediatric Brain Tumours",
    desc: "Specialized paediatric neuro-oncology teams combining gentle micro-neurosurgery, neuronavigation, and supportive child care.",
    specialty: "Paediatric Neuro-Oncology",
  },
  "paed-solid-tumours": {
    title: "Our Experts for Paediatric Solid Tumours",
    desc: "Dedicated paediatric surgical oncologists focused on child-friendly protocols, organ-sparing techniques, and lifelong survivorship.",
    specialty: "Paediatric Surgical Oncology",
  },
};

function getCategoryDoctorInfo(cat?: { id: string; title: string; programmeTitle?: string }) {
  if (!cat) {
    return {
      title: "Our Doctors & Specialists",
      desc: "At Narayana Health, we're dedicated to providing advanced cancer care with expert doctors, modern technology, and compassionate support at every step of your journey.",
      specialty: "Oncology Specialist",
    };
  }

  if (categoryDoctorInfoMap[cat.id]) {
    return categoryDoctorInfoMap[cat.id];
  }

  const cleanTitle = cat.title.replace(/\s*\([^)]*\)/g, "").replace(/\s*Treatment\s*$/i, "").trim();
  return {
    title: `Our Experts for ${cleanTitle} Treatment`,
    desc: `Consult our multidisciplinary team of senior specialists delivering advanced, personalized care for ${cleanTitle.toLowerCase()}.`,
    specialty: `${cleanTitle} Specialist`,
  };
}

const categoryProcedureInfoMap: Record<string, { title: string; desc: string }> = {
  gastro: {
    title: "Procedures & Surgeries for Gastrointestinal Cancer",
    desc: "Advanced minimally invasive laparoscopic surgery, robotic GI resection, HIPEC, and precision multimodality therapies.",
  },
  breast: {
    title: "Procedures & Surgeries for Breast Cancer & Oncoplasty",
    desc: "Breast-conserving lumpectomy, oncoplastic breast reconstruction, sentinel lymph node biopsy, and targeted stereotactic radiation.",
  },
  genitourinary: {
    title: "Procedures & Surgeries for Genitourinary Cancer",
    desc: "Robotic radical prostatectomy, partial nephrectomy with nephron preservation, cystectomy with neobladder reconstruction, and targeted radiotherapy.",
  },
  gynaecologic: {
    title: "Procedures & Surgeries for Gynaecologic Cancer",
    desc: "Minimally invasive laparoscopic hysterectomy, cytoreductive surgery with HIPEC, fertility-sparing procedures, and precision brachytherapy.",
  },
  headneck: {
    title: "Procedures & Surgeries for Head & Neck Cancer",
    desc: "Microvascular free flap reconstruction, transoral robotic surgery (TORS), skull base surgery, and organ-preserving IMRT radiation.",
  },
  haematologic: {
    title: "Procedures & Advanced Therapies for Blood Cancers",
    desc: "Autologous and allogeneic stem cell transplants, CAR-T cellular therapy, targeted molecular inhibitors, and high-dose consolidation chemotherapy.",
  },
  neuro: {
    title: "Procedures & Surgeries for Neuro-Oncology",
    desc: "Neuronavigation-guided microsurgical tumour excision, awake craniotomy with functional mapping, CyberKnife radiosurgery, and TTFields.",
  },
  musculoskeletal: {
    title: "Procedures & Surgeries for Musculoskeletal Oncology",
    desc: "Complex limb-salvage sarcoma resections, custom 3D-printed modular megaprosthetic reconstructions, and intraoperative frozen-section margins.",
  },
  thoracic: {
    title: "Procedures & Surgeries for Thoracic & Lung Cancer",
    desc: "Minimally invasive VATS and robotic lobectomies, bronchoscopic airway stenting, sleeve resections, and stereotactic body radiotherapy (SBRT).",
  },
  "paed-blood-disorders": {
    title: "Procedures & Therapies for Paediatric Blood Disorders",
    desc: "Bone marrow transplantation, regular precision transfusion programmes, iron chelation regimens, and gene-informed cellular therapies.",
  },
  "paed-blood-cancers": {
    title: "Procedures & Therapies for Paediatric Blood Cancers",
    desc: "Multi-agent pediatric induction chemotherapy protocols, haploidentical BMT, targeted antibody therapies, and comprehensive supportive care.",
  },
  "paed-brain-tumours": {
    title: "Procedures & Surgeries for Paediatric Brain Tumours",
    desc: "Minimally invasive neuro-endoscopy, intraoperative brain mapping, ventricular shunting, and conformal radiation designed to protect growth and learning.",
  },
  "paed-solid-tumours": {
    title: "Procedures & Surgeries for Paediatric Solid Tumours",
    desc: "Organ-sparing tumour resections, limb-preservation oncology surgery, and customized paediatric multimodal systemic regimens.",
  },
};

function getCategoryProcedureInfo(cat?: { id: string; title: string; programmeTitle?: string }) {
  if (!cat) {
    return {
      title: "Procedures & Surgeries",
      desc: "Discover our comprehensive range of specialized procedures and surgeries designed for optimal patient outcomes.",
    };
  }

  if (categoryProcedureInfoMap[cat.id]) {
    return categoryProcedureInfoMap[cat.id];
  }

  const cleanTitle = cat.title.replace(/\s*\([^)]*\)/g, "").replace(/\s*Treatment\s*$/i, "").trim();
  return {
    title: `Procedures & Surgeries for ${cleanTitle}`,
    desc: `Discover our comprehensive range of specialized surgical procedures and advanced interventions for ${cleanTitle.toLowerCase()}.`,
  };
}

const categoryTechnologyInfoMap: Record<string, { title: string; desc: string }> = {
  gastro: {
    title: "Advanced Technology for Gastrointestinal Cancer",
    desc: "Cutting-edge robotic da Vinci surgical systems, intraoperative 3D endoscopy, and high-definition molecular imaging engineered for precision digestive tract care.",
  },
  breast: {
    title: "Advanced Technology for Breast Cancer Care",
    desc: "3D digital mammography with tomosynthesis, automated breast ultrasound (ABUS), prone breast radiation, and robotic oncoplastic reconstruction systems.",
  },
  genitourinary: {
    title: "Advanced Technology for Genitourinary Cancer",
    desc: "Da Vinci robotic surgical platforms, high-resolution multiparametric 3T prostate MRI, and image-guided stereotactic radiation equipment.",
  },
  gynaecologic: {
    title: "Advanced Technology for Gynaecologic Cancer",
    desc: "Robotic laparoscopic consoles, 3D high-dose-rate (HDR) brachytherapy, and heated intraperitoneal chemotherapy delivery systems.",
  },
  headneck: {
    title: "Advanced Technology for Head & Neck Cancer",
    desc: "TransOral Robotic Surgery (TORS), intraoperative neuromonitoring, optical fluorescence imaging, and CyberKnife precision stereotactic radiation.",
  },
  haematologic: {
    title: "Advanced Technology for Blood Cancers & BMT",
    desc: "HEPA-filtered cleanroom stem cell processing suites, automated apheresis systems, flow cytometry, and next-generation genomic sequencing.",
  },
  neuro: {
    title: "Advanced Technology for Neuro-Oncology",
    desc: "CyberKnife® S7 stereotactic radiosurgery, intraoperative brain mapping, stealth neuronavigation, and non-invasive Tumour Treating Fields (TTFields).",
  },
  musculoskeletal: {
    title: "Advanced Technology for Musculoskeletal Oncology",
    desc: "Computer-assisted surgical navigation, custom 3D implant modeling, intraoperative frozen section pathology, and radiofrequency tumour ablation.",
  },
  thoracic: {
    title: "Advanced Technology for Thoracic & Lung Cancer",
    desc: "Low-dose 4D CT navigation, robotic thoracic surgery consoles, electromagnetic navigation bronchoscopy, and TrueBeam SBRT linear accelerators.",
  },
  "paed-blood-disorders": {
    title: "Advanced Technology for Paediatric Blood Disorders",
    desc: "Specialized paediatric stem cell cryopreservation units, automated cell counters, and micro-volume genetic testing platforms.",
  },
  "paed-blood-cancers": {
    title: "Advanced Technology for Paediatric Blood Cancers",
    desc: "State-of-the-art positive-pressure laminar airflow BMT suites, targeted cellular apheresis, and real-time minimal residual disease (MRD) tracking.",
  },
  "paed-brain-tumours": {
    title: "Advanced Technology for Paediatric Brain Tumours",
    desc: "Microscopic neuro-endoscopy, intraoperative brain mapping, ventricular shunting, and conformal radiation designed to protect cognitive development.",
  },
  "paed-solid-tumours": {
    title: "Advanced Technology for Paediatric Solid Tumours",
    desc: "High-resolution contrast-enhanced pediatric imaging, 3D virtual surgical planning, and delicate microsurgical instrumentation for children.",
  },
};

function getCategoryTechnologyInfo(cat?: { id: string; title: string; programmeTitle?: string }) {
  if (!cat) {
    return {
      title: "Advance Technology",
      desc: "We utilize cutting-edge medical equipment and technology to ensure precision, safety, and faster recovery.",
    };
  }

  if (categoryTechnologyInfoMap[cat.id]) {
    return categoryTechnologyInfoMap[cat.id];
  }

  const cleanTitle = cat.title.replace(/\s*\([^)]*\)/g, "").replace(/\s*Treatment\s*$/i, "").trim();
  return {
    title: `Advanced Technology for ${cleanTitle}`,
    desc: `We utilize cutting-edge medical equipment, robotic systems, and precision technologies engineered for ${cleanTitle.toLowerCase()}.`,
  };
}

const categoryTestsInfoMap: Record<string, { title: string; desc: string }> = {
  gastro: {
    title: "Advanced Diagnostics & Tests for Gastrointestinal Cancer",
    desc: "High-resolution endoscopic ultrasound (EUS), multiphase GI CT enterography, and liquid ctDNA biopsy for precision digestive tract tumour staging.",
  },
  breast: {
    title: "Advanced Diagnostics & Tests for Breast Cancer",
    desc: "Digital breast tomosynthesis, automated breast ultrasound (ABUS), breast MRI, and multigene expression assays (Oncotype DX) for personalized care.",
  },
  genitourinary: {
    title: "Advanced Diagnostics & Tests for Genitourinary Cancer",
    desc: "Multiparametric 3T prostate MRI, MRI-ultrasound fusion biopsy, and PSMA PET-CT scans providing precise staging for urinary and reproductive cancers.",
  },
  gynaecologic: {
    title: "Advanced Diagnostics & Tests for Gynaecologic Cancer",
    desc: "Pelvic multiparametric MRI, specialized transvaginal Doppler sonography, CA-125 kinetics, and comprehensive germline HRD/BRCA genomic screening.",
  },
  headneck: {
    title: "Advanced Diagnostics & Tests for Head & Neck Cancer",
    desc: "Narrow-band imaging (NBI) flexible endoscopy, high-resolution neck CT/MRI, HPV/p16 biomolecular testing, and fine-needle aspiration cytology.",
  },
  haematologic: {
    title: "Advanced Diagnostics & Tests for Blood Cancers",
    desc: "Multiparameter flow cytometry, cytogenetics, FISH chromosomal analysis, and NGS panels identifying actionable mutations with ultra-sensitive MRD tracking.",
  },
  neuro: {
    title: "Advanced Diagnostics & Tests for Neuro-Oncology",
    desc: "Functional MRI (fMRI), MR tractography/spectroscopy, neuro-endoscopic biopsy, and comprehensive IDH1/2 and MGMT methylation molecular profiling.",
  },
  musculoskeletal: {
    title: "Advanced Diagnostics & Tests for Musculoskeletal Oncology",
    desc: "Whole-body bone scintigraphy, dedicated limb MRI protocols, core needle image-guided biopsies, and cytogenetic translocation analysis for sarcomas.",
  },
  thoracic: {
    title: "Advanced Diagnostics & Tests for Thoracic & Lung Cancer",
    desc: "Endobronchial ultrasound (EBUS-TBNA), low-dose 4D spiral CT, and comprehensive NGS panel testing for EGFR, ALK, ROS1, and PD-L1 expression.",
  },
  "paed-blood-disorders": {
    title: "Advanced Diagnostics & Tests for Paediatric Blood Disorders",
    desc: "High-performance liquid chromatography (HPLC), haemoglobin electrophoresis, automated flow cytometric assays, and molecular genetic testing for children.",
  },
  "paed-blood-cancers": {
    title: "Advanced Diagnostics & Tests for Paediatric Blood Cancers",
    desc: "Rapid 10-color flow cytometric immunophenotyping, high-sensitivity minimal residual disease (MRD) assays, and pediatric cytogenomic microarrays.",
  },
  "paed-brain-tumours": {
    title: "Advanced Diagnostics & Tests for Paediatric Brain Tumours",
    desc: "Child-friendly 3T neuro-imaging, stereotactic molecular biopsy, and comprehensive methylation profiling tailored to pediatric central nervous system tumors.",
  },
  "paed-solid-tumours": {
    title: "Advanced Diagnostics & Tests for Paediatric Solid Tumours",
    desc: "Pediatric contrast-enhanced ultrasound, urinary catecholamine/metabolite testing, and histology-fusion genetic assays for childhood solid tumors.",
  },
};

function getCategoryTestsInfo(cat?: { id: string; title: string; programmeTitle?: string }) {
  if (!cat) {
    return {
      title: "Advance Tests",
      desc: "State-of-the-art diagnostic testing facilities offering accurate and rapid results for informed treatment plans.",
    };
  }

  if (categoryTestsInfoMap[cat.id]) {
    return categoryTestsInfoMap[cat.id];
  }

  const cleanTitle = cat.title.replace(/\s*\([^)]*\)/g, "").replace(/\s*Treatment\s*$/i, "").trim();
  return {
    title: `Advanced Diagnostics & Tests for ${cleanTitle}`,
    desc: `State-of-the-art diagnostic testing and biomarker profiling facilities offering accurate and rapid results for ${cleanTitle.toLowerCase()}.`,
  };
}

const categoryDoctorVideosInfoMap: Record<string, { title: string; desc: string }> = {
  gastro: {
    title: "Doctor Video Insights on Gastrointestinal Cancer",
    desc: "Watch our senior gastroenterologists and surgical oncologists explain complex GI procedures, recovery pathways, and clinical breakthroughs.",
  },
  breast: {
    title: "Doctor Video Insights on Breast Cancer & Oncoplasty",
    desc: "Watch leading breast onco-surgeons and specialists discuss tumour profiling, oncoplastic reconstruction, and personalised survivorship care.",
  },
  genitourinary: {
    title: "Doctor Video Insights on Genitourinary Cancer",
    desc: "Watch renowned uro-oncologists discuss robotic prostate surgery, bladder reconstruction, and precision radiation techniques.",
  },
  gynaecologic: {
    title: "Doctor Video Insights on Gynaecologic Cancer",
    desc: "Watch experienced gynaecologic oncologists share perspectives on fertility preservation, cytoreductive surgery, and innovative therapies.",
  },
  headneck: {
    title: "Doctor Video Insights on Head & Neck Cancer",
    desc: "Watch leading head and neck surgical oncologists detail organ-preservation protocols, microvascular reconstruction, and rehabilitation.",
  },
  haematologic: {
    title: "Doctor Video Insights on Blood Cancer & BMT",
    desc: "Watch distinguished haematologists and cellular therapy experts discuss bone marrow transplants, targeted therapies, and leukaemia care.",
  },
  neuro: {
    title: "Doctor Video Insights on Neuro-Oncology",
    desc: "Watch senior neurosurgeons and neuro-oncologists explain stereotactic radiosurgery, awake craniotomy, and brain tumour therapies.",
  },
  musculoskeletal: {
    title: "Doctor Video Insights on Musculoskeletal Oncology",
    desc: "Watch specialized orthopaedic oncologists explain complex bone sarcoma surgeries, limb-salvage reconstruction, and multidisciplinary care.",
  },
  thoracic: {
    title: "Doctor Video Insights on Thoracic & Lung Cancer",
    desc: "Watch expert thoracic surgeons discuss minimally invasive VATS, robotic lung resections, and targeted therapies for chest malignancies.",
  },
  "paed-blood-disorders": {
    title: "Doctor Video Insights on Paediatric Blood Disorders",
    desc: "Watch compassionate paediatric haematologists discuss advanced thalassaemia management, BMT cures, and specialized child care.",
  },
  "paed-blood-cancers": {
    title: "Doctor Video Insights on Paediatric Blood Cancers",
    desc: "Watch leading paediatric oncologists explain risk-adapted leukaemia treatments, stem cell transplants, and family-centered care.",
  },
  "paed-brain-tumours": {
    title: "Doctor Video Insights on Paediatric Brain Tumours",
    desc: "Watch paediatric neurosurgeons share insights on gentle micro-neurosurgery, brain mapping, and cognitive preservation in children.",
  },
  "paed-solid-tumours": {
    title: "Doctor Video Insights on Paediatric Solid Tumours",
    desc: "Watch specialized paediatric surgical oncologists discuss organ-preserving tumour resections and supportive rehabilitation for kids.",
  },
};

function getCategoryDoctorVideosInfo(cat?: { id: string; title: string; programmeTitle?: string }) {
  if (!cat) {
    return {
      title: "Doctor Video Insights",
      desc: "Watch our leading specialists discuss advanced treatments, patient outcomes, and innovative surgical care.",
    };
  }

  if (categoryDoctorVideosInfoMap[cat.id]) {
    return categoryDoctorVideosInfoMap[cat.id];
  }

  const cleanTitle = cat.title.replace(/\s*\([^)]*\)/g, "").replace(/\s*Treatment\s*$/i, "").trim();
  return {
    title: `Doctor Video Insights on ${cleanTitle}`,
    desc: `Watch our leading specialists discuss advanced treatments, patient outcomes, and clinical care for ${cleanTitle.toLowerCase()}.`,
  };
}

const categoryWhyUsInfoMap: Record<string, { title: string; desc: string }> = {
  gastro: {
    title: "Why Choose Us for Gastrointestinal Cancer Care",
    desc: "Experience world-class clinical outcomes, multidisciplinary tumour boards, robotic surgical precision, and compassionate digestive tract oncology care.",
  },
  breast: {
    title: "Why Choose Us for Breast Cancer Care",
    desc: "Comprehensive care with dual-certified oncoplastic surgeons, personalized genetic risk evaluation, and dedicated breast health navigators.",
  },
  genitourinary: {
    title: "Why Choose Us for Genitourinary Cancer Care",
    desc: "Pioneering robotic surgery platforms, nerve-sparing techniques, and personalized radiation protocols focused on preserving quality of life.",
  },
  gynaecologic: {
    title: "Why Choose Us for Gynaecologic Cancer Care",
    desc: "Dedicated women's oncology wing, organ-sparing and fertility-preserving surgical mastery, and compassionate comprehensive rehabilitation.",
  },
  headneck: {
    title: "Why Choose Us for Head & Neck Cancer Care",
    desc: "High-volume microvascular reconstruction excellence, organ-preservation strategies, and comprehensive speech and swallow therapy teams.",
  },
  haematologic: {
    title: "Why Choose Us for Blood Cancer & BMT",
    desc: "Over 300 bone marrow transplants performed annually, state-of-the-art HEPA-filtered units, and pioneering access to advanced cellular therapies.",
  },
  neuro: {
    title: "Why Choose Us for Neuro-Oncology Care",
    desc: "High-precision CyberKnife® S7 radiosurgery, intraoperative functional brain mapping, and integrated rehabilitation for complex nervous system tumors.",
  },
  musculoskeletal: {
    title: "Why Choose Us for Musculoskeletal Oncology",
    desc: "Specialized orthopaedic onco-surgeons with limb-salvage rates exceeding 90%, 3D-printed custom endoprosthetics, and holistic recovery pathways.",
  },
  thoracic: {
    title: "Why Choose Us for Thoracic & Lung Cancer Care",
    desc: "Leading minimally invasive VATS expertise, rapid-access multi-specialty lung clinics, and biomarker-guided targeted immunotherapies.",
  },
  "paed-blood-disorders": {
    title: "Why Choose Us for Paediatric Blood Disorders",
    desc: "Dedicated child-friendly hematology wards, high-volume curative stem cell transplant protocols, and lifetime comprehensive supportive care.",
  },
  "paed-blood-cancers": {
    title: "Why Choose Us for Paediatric Blood Cancers",
    desc: "Outstanding childhood leukemia survival rates, dedicated pediatric ICUs, and compassionate family-centered multidisciplinary oncology teams.",
  },
  "paed-brain-tumours": {
    title: "Why Choose Us for Paediatric Brain Tumours",
    desc: "Specialized pediatric neuro-navigation, conformal tissue-sparing radiotherapy, and integrated neuro-cognitive rehabilitation for children.",
  },
  "paed-solid-tumours": {
    title: "Why Choose Us for Paediatric Solid Tumours",
    desc: "Pioneering limb-salvage protocols, child-specific organ-sparing surgical interventions, and dedicated post-treatment survivorship clinics.",
  },
};

function getCategoryWhyUsInfo(cat?: { id: string; title: string; programmeTitle?: string }) {
  if (!cat) {
    return {
      title: "Why Choose Us",
      desc: "Experience world-class healthcare with our team of expert specialists, compassionate care, and evidence-based treatments.",
    };
  }

  if (categoryWhyUsInfoMap[cat.id]) {
    return categoryWhyUsInfoMap[cat.id];
  }

  const cleanTitle = cat.title.replace(/\s*\([^)]*\)/g, "").replace(/\s*Treatment\s*$/i, "").trim();
  return {
    title: `Why Choose Us for ${cleanTitle} Care`,
    desc: `Experience world-class healthcare with our team of expert specialists, compassionate care, and evidence-based treatments for ${cleanTitle.toLowerCase()}.`,
  };
}

const categoryPatientStoriesInfoMap: Record<string, { title: string; desc: string }> = {
  gastro: {
    title: "Patient Stories: Recovery in Gastrointestinal Cancer",
    desc: "Real patients share their journeys of healing, advanced GI surgical care, and renewed vitality.",
  },
  breast: {
    title: "Patient Stories: Courage & Hope in Breast Cancer",
    desc: "Inspiring recovery journeys of women who conquered breast cancer with advanced oncoplastic and targeted therapies.",
  },
  genitourinary: {
    title: "Patient Stories: Restored Health in Genitourinary Cancer",
    desc: "Real journeys of patients reclaiming life and wellness through minimally invasive robotic urologic care.",
  },
  gynaecologic: {
    title: "Patient Stories: Healing Journeys in Gynaecologic Cancer",
    desc: "Inspiring journeys of women treated with advanced organ-preserving and comprehensive oncology protocols.",
  },
  headneck: {
    title: "Patient Stories: Triumphs in Head & Neck Cancer",
    desc: "Real survivors share their recovery, restored smiles, and rehabilitation through expert multidisciplinary care.",
  },
  haematologic: {
    title: "Patient Stories: Conquering Blood Cancers & BMT",
    desc: "Inspiring journeys of patients gifted a new lease on life through bone marrow transplants and precision cellular therapy.",
  },
  neuro: {
    title: "Patient Stories: Courage & Healing in Neuro-Oncology",
    desc: "Personal stories of patients overcoming complex brain and spinal tumours through precision radiosurgery and care.",
  },
  musculoskeletal: {
    title: "Patient Stories: Restored Mobility in Bone & Soft-Tissue Oncology",
    desc: "Real journeys of patients who regained mobility and strength through limb-salvage sarcoma surgeries.",
  },
  thoracic: {
    title: "Patient Stories: Breathing Easy After Lung & Thoracic Care",
    desc: "Inspiring stories of recovery and renewed vitality after minimally invasive thoracic lung cancer treatments.",
  },
  "paed-blood-disorders": {
    title: "Little Champions: Triumphs Over Paediatric Blood Disorders",
    desc: "Heartfelt stories of brave young children overcoming thalassaemia, aplastic anaemia, and complex blood disorders.",
  },
  "paed-blood-cancers": {
    title: "Brave Hearts: Inspiring Recoveries in Paediatric Blood Cancers",
    desc: "Uplifting journeys of children who defeated leukaemia and lymphoma with tender care and curative protocols.",
  },
  "paed-brain-tumours": {
    title: "Little Champions: Healing After Paediatric Brain Tumour Care",
    desc: "Inspiring stories of children and families reclaiming joyful childhoods after complex neuro-oncology treatment.",
  },
  "paed-solid-tumours": {
    title: "Stories of Resilience: Beating Paediatric Solid Tumours",
    desc: "Inspiring recoveries of brave young patients treated with compassionate, organ-sparing paediatric surgical care.",
  },
};

function getCategoryPatientStoriesInfo(cat?: { id: string; title: string; programmeTitle?: string }) {
  if (!cat) {
    return {
      title: "Patient Stories & Recovery",
      desc: "Hear directly from our patients about their journey to recovery and from our doctors about their approach to care.",
    };
  }

  if (categoryPatientStoriesInfoMap[cat.id]) {
    return categoryPatientStoriesInfoMap[cat.id];
  }

  const cleanTitle = cat.title.replace(/\s*\([^)]*\)/g, "").replace(/\s*Treatment\s*$/i, "").trim();
  return {
    title: `Patient Stories: Hope & Recovery in ${cleanTitle}`,
    desc: `Real patients share their inspiring recovery journeys and return to healthy living through expert care in ${cleanTitle.toLowerCase()}.`,
  };
}

const categoryHospitalsInfoMap: Record<string, { title: string; desc: string }> = {
  gastro: {
    title: "Hospitals & Centres of Excellence for Gastrointestinal Cancer",
    desc: "Find our premier cancer institutes equipped with advanced gastrointestinal robotic surgery suites, endotherapy units, and specialized GI ICU infrastructure.",
  },
  breast: {
    title: "Hospitals & Dedicated Breast Cancer Centres",
    desc: "Locate our specialized breast health facilities offering comprehensive mammography, oncoplastic surgery theatres, and personalized multidisciplinary cancer clinics.",
  },
  genitourinary: {
    title: "Hospitals & Advanced Uro-Oncology Centres",
    desc: "Find our state-of-the-art hospitals featuring da Vinci robotic surgical systems, specialized prostate suites, and dedicated uro-oncology intensive care.",
  },
  gynaecologic: {
    title: "Hospitals & Dedicated Gynaecologic Oncology Centres",
    desc: "Explore our world-class women's cancer centres offering minimally invasive surgical suites, advanced HIPEC infrastructure, and compassionate supportive care.",
  },
  headneck: {
    title: "Hospitals & Advanced Head & Neck Cancer Centres",
    desc: "Locate our tertiary hospitals featuring dedicated microvascular reconstruction theatres, speech rehabilitation facilities, and precision head and neck radiation units.",
  },
  haematologic: {
    title: "Hospitals & Advanced Bone Marrow Transplant (BMT) Centres",
    desc: "Find our internationally accredited hospital networks featuring state-of-the-art HEPA-filtered BMT units, cellular therapy labs, and 24/7 stem cell processing.",
  },
  neuro: {
    title: "Hospitals & Advanced Neuro-Oncology Centres",
    desc: "Locate our premier neurosurgical centres equipped with CyberKnife® S7, intraoperative MRI, neuro-navigation suites, and dedicated neuro-ICU care.",
  },
  musculoskeletal: {
    title: "Hospitals & Musculoskeletal Sarcoma Centres",
    desc: "Discover our specialized orthopaedic oncology hospitals equipped with 3D-printing implant suites, limb-salvage surgical infrastructure, and recovery wards.",
  },
  thoracic: {
    title: "Hospitals & Advanced Thoracic Cancer Centres",
    desc: "Find our specialized hospitals featuring hybrid thoracic operating theatres, endobronchial ultrasound suites, and high-dependency pulmonary care units.",
  },
  "paed-blood-disorders": {
    title: "Hospitals & Child-Friendly Haematology Centres",
    desc: "Locate our dedicated paediatric healthcare facilities with child-centric day care wards, specialized thalassaemia suites, and compassionate family-supportive care.",
  },
  "paed-blood-cancers": {
    title: "Hospitals & Paediatric Oncology Centres of Excellence",
    desc: "Find our specialized children's hospitals featuring sterile paediatric BMT units, family-centred cancer wards, and round-the-clock paediatric intensive care.",
  },
  "paed-brain-tumours": {
    title: "Hospitals & Paediatric Neuro-Oncology Centres",
    desc: "Discover our elite children's neurosurgical hospitals equipped with child-specific neuro-navigation, gentle anaesthesia protocols, and cognitive therapy units.",
  },
  "paed-solid-tumours": {
    title: "Hospitals & Paediatric Surgical Oncology Centres",
    desc: "Locate our premier paediatric surgical centres featuring child-friendly operating rooms, specialized organ-sparing technology, and dedicated post-op survivorship wings.",
  },
};

function getCategoryHospitalsInfo(cat?: { id: string; title: string; programmeTitle?: string }) {
  if (!cat) {
    return {
      title: "Hospitals & Clinics",
      desc: "Find our state-of-the-art facilities conveniently located to serve you with the highest standards of medical care.",
    };
  }

  if (categoryHospitalsInfoMap[cat.id]) {
    return categoryHospitalsInfoMap[cat.id];
  }

  const cleanTitle = cat.title.replace(/\s*\([^)]*\)/g, "").replace(/\s*Treatment\s*$/i, "").trim();
  return {
    title: `Hospitals & Centres for ${cleanTitle}`,
    desc: `Find our state-of-the-art facilities and dedicated medical centres delivering world-class care for ${cleanTitle.toLowerCase()}.`,
  };
}

const doctors = [
  {
    id: "dr-1",
    name: "Dr. Anthony Pais",
    spec: "Surgical Oncology",
    exp: "28+ years of experience",
    loc: "Mazumdar Shaw Cancer Centre, Bengaluru",
    img: "/doctors/doc_vivek.jpg"
  },
  {
    id: "dr-2",
    name: "Dr. Ananya Rao",
    spec: "Medical Oncology",
    exp: "16 years of experience",
    loc: "Narayana Multispeciality Hospital, HSR Layout, Bengaluru",
    img: "/assets/doctor_1.png"
  },
  {
    id: "dr-3",
    name: "Dr. Rajiv Menon",
    spec: "Gastrointestinal Oncology",
    exp: "22 years of experience",
    loc: "Narayana Health City, Bommasandra, Bengaluru",
    img: "/assets/doctor_2.png"
  },
  {
    id: "dr-4",
    name: "Dr. Priya Sharma",
    spec: "Radiation Oncology",
    exp: "15 years of experience",
    loc: "Narayana Multispeciality Hospital, Whitefield, Bengaluru",
    img: "/assets/doctor_3.png"
  },
  {
    id: "dr-5",
    name: "Dr. Arun Krishnan",
    spec: "Haemato-Oncology & BMT",
    exp: "20 years of experience",
    loc: "Mazumdar Shaw Medical Centre, Bengaluru",
    img: "/assets/hero_doctor.png"
  },
  {
    id: "dr-6",
    name: "Dr. Vivek Shetty",
    spec: "Head & Neck Surgical Oncology",
    exp: "18 years of experience",
    loc: "Narayana Health City, Bengaluru",
    img: "/assets/doctor_2.png"
  }
];

const faqData = [
  {
    question: "What types of cancer does Narayana Health treat?",
    answer: "Narayana Health offers comprehensive cancer care across all major cancer types including breast, gastrointestinal, genitourinary, gynaecologic, head & neck, haematologic (blood cancers), neuro-oncology, musculoskeletal, and thoracic (lung) cancers. Our multidisciplinary teams provide personalised treatment plans for each patient."
  },
  {
    question: "What treatment options are available for cancer patients?",
    answer: "We offer a full spectrum of cancer treatments including surgery, chemotherapy, radiation oncology (IMRT, IGRT, stereotactic radiosurgery), immunotherapy, targeted therapy, bone marrow transplants, intra-arterial chemotherapy, and Tumour Treating Fields (TTF). Treatment is customised based on cancer type, stage, and individual patient profile."
  },
  {
    question: "How do I get a second opinion at Narayana Health?",
    answer: "You can request a second opinion by booking an appointment online or visiting any of our cancer centres. Our tumour board — a multidisciplinary team of oncologists, surgeons, radiologists, and pathologists — reviews complex cases together to recommend the most appropriate treatment plan."
  },
  {
    question: "Does Narayana Health offer bone marrow transplants?",
    answer: "Yes. Our haematology and bone marrow transplant units perform over 300 bone marrow transplants every year. We offer both autologous and allogeneic transplants for leukaemia, lymphoma, myeloma, and other blood disorders, supported by dedicated BMT wards and post-transplant care teams."
  },
  {
    question: "What should I bring to my first oncology appointment?",
    answer: "Please bring all previous medical records including biopsy reports, imaging scans (CT, MRI, PET), blood test results, and a list of current medications. If you have had prior treatment at another hospital, a discharge summary and operative notes are also helpful. This allows our doctors to review your full history and advise without delays."
  },
  {
    question: "Are insurance and cashless treatments available?",
    answer: "Narayana Health is empanelled with most major insurance providers and TPAs for cashless treatment. Our patient services team can assist you in verifying your coverage, initiating pre-authorisation, and managing the insurance documentation process so you can focus entirely on your recovery."
  },
  {
    question: "How can I find the right cancer specialist at Narayana Health?",
    answer: "You can search for specialists by cancer type, location, or doctor name on our website. Alternatively, call our helpline or use the online appointment booking system to be matched with the appropriate oncologist based on your diagnosis and location."
  },
];

export default function SpecialityDesign2({ slug }: { slug: string }) {
  
  const currentSpec = ALL_SPECIALITIES.find(s => s.slug === slug);
  const title = currentSpec?.name || 'Cancer Care';
  const videoSrc = currentSpec?.detailVideo || currentSpec?.video || "/videos/Hero-Video-New.mp4";
  
  const [patientType, setPatientType] = useState<"Adult" | "Paediatric">("Adult");

  const currentCategories = patientType === "Adult" ? adultCancerCategories : paediatricCancerCategories;

  const [activeCategory, setActiveCategory] = useState("gastro");
  const [prevCategory, setPrevCategory] = useState("gastro");
  const [isWiping, setIsWiping] = useState(false);
  const [wipeDirection, setWipeDirection] = useState<"leftToRight" | "rightToLeft">("leftToRight");
  const [activeProcedure, setActiveProcedure] = useState("chemo");

  const selectedCat = currentCategories.find(c => c.id === activeCategory) || currentCategories[0];
  const activeDoctorInfo = getCategoryDoctorInfo(selectedCat);
  const activeProcedureInfo = getCategoryProcedureInfo(selectedCat);
  const activeTechnologyInfo = getCategoryTechnologyInfo(selectedCat);
  const activeTestsInfo = getCategoryTestsInfo(selectedCat);
  const activeDoctorVideosInfo = getCategoryDoctorVideosInfo(selectedCat);
  const activeWhyUsInfo = getCategoryWhyUsInfo(selectedCat);
  const activePatientStoriesInfo = getCategoryPatientStoriesInfo(selectedCat);
  const activeHospitalsInfo = getCategoryHospitalsInfo(selectedCat);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handlePatientTypeChange = (type: "Adult" | "Paediatric", keepDropdownOpen = false) => {
    if (type === patientType) return;
    setPatientType(type);
    const targetCategories = type === "Adult" ? adultCancerCategories : paediatricCancerCategories;
    const defaultCat = targetCategories[0]?.id || "";
    setPrevCategory(activeCategory);
    setActiveCategory(defaultCat);
    setIsWiping(true);
    if (!keepDropdownOpen) {
      setIsDropdownOpen(false);
    }
  };

  const handleCategorySelect = (newId: string) => {
    if (newId === activeCategory) return;
    const oldIdx = currentCategories.findIndex(c => c.id === activeCategory);
    const newIdx = currentCategories.findIndex(c => c.id === newId);
    setWipeDirection(newIdx >= oldIdx ? "leftToRight" : "rightToLeft");
    setPrevCategory(activeCategory);
    setActiveCategory(newId);
    setIsWiping(true);
  };

  const [isTabsPinned, setIsTabsPinned] = useState(false);
  const [isNearFooter, setIsNearFooter] = useState(false);
  const tabsSentinelRef = useRef<HTMLDivElement>(null);
  const footerSentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = tabsSentinelRef.current;
    if (!sentinel) return;

    const checkPinned = () => {
      const rect = sentinel.getBoundingClientRect();
      setIsTabsPinned(rect.top <= 70);
    };

    checkPinned();

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isPastTop = !entry.isIntersecting && entry.boundingClientRect.top <= 70;
        setIsTabsPinned(isPastTop);
      },
      { root: null, threshold: 0 }
    );

    observer.observe(sentinel);

    window.addEventListener("scroll", checkPinned, { passive: true });
    const lenis = (window as unknown as { lenis?: { on?: (evt: string, fn: () => void) => void; off?: (evt: string, fn: () => void) => void } }).lenis;
    if (lenis && typeof lenis.on === "function") {
      lenis.on("scroll", checkPinned);
    }

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", checkPinned);
      if (lenis && typeof lenis.off === "function") {
        lenis.off("scroll", checkPinned);
      }
    };
  }, []);

  // Track active navbar theme ("light" | "dark") from document.documentElement
  const [navTheme, setNavTheme] = useState<"light" | "dark">("dark");
  useEffect(() => {
    if (typeof document === "undefined") return;

    const updateTheme = () => {
      const active = document.documentElement.getAttribute("data-nav-theme-active");
      if (active === "light" || active === "dark") {
        setNavTheme(active);
        return;
      }

      const probeX = window.innerWidth / 2;
      const probeY = 100;
      const elements = document.elementsFromPoint(probeX, probeY);
      for (const el of elements) {
        if (el.closest("nav") || el.closest('[class*="programmeTabsWrapper"]') || el.closest("footer")) continue;
        const themeEl = el.closest("[data-nav-theme]");
        if (themeEl) {
          const t = themeEl.getAttribute("data-nav-theme");
          if (t === "light" || t === "dark") {
            setNavTheme(t);
            return;
          }
        }
      }
    };

    updateTheme();

    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === "attributes" && m.attributeName === "data-nav-theme-active") {
          updateTheme();
        }
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-nav-theme-active"]
    });

    window.addEventListener("scroll", updateTheme, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", updateTheme);
    };
  }, []);

  useEffect(() => {
    const footerSentinel = footerSentinelRef.current;
    if (!footerSentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsNearFooter(entry.isIntersecting);
      },
      { root: null, threshold: 0, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(footerSentinel);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash;
    if (hash) {
      const target = document.querySelector(hash);
      if (target) {
        setTimeout(() => {
          target.scrollIntoView({ behavior: "instant" });
        }, 200);
      }
    }
  }, []);

  // Stats Carousel for responsive viewport (< 1100px)
  const [activeStatIndex, setActiveStatIndex] = useState(0);
  const statsTrackRef = useRef<HTMLDivElement>(null);
  const statCardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleStatsScroll = () => {
    const track = statsTrackRef.current;
    if (!track) return;
    const scrollLeft = track.scrollLeft;
    let closestIndex = 0;
    let minDiff = Infinity;
    statCardRefs.current.forEach((card, idx) => {
      if (!card) return;
      const cardLeft = card.offsetLeft - track.offsetLeft;
      const diff = Math.abs(cardLeft - scrollLeft);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = idx;
      }
    });
    setActiveStatIndex(closestIndex);
  };

  const scrollToStat = (index: number) => {
    const track = statsTrackRef.current;
    const card = statCardRefs.current[index];
    if (track && card) {
      const leftPos = card.offsetLeft - track.offsetLeft;
      track.scrollTo({ left: leftPos, behavior: "smooth" });
      setActiveStatIndex(index);
    }
  };

  const doctorsRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: doctorsRef,
    offset: ["start end", "start center"]
  });
  const pageBgColor = useTransform(scrollYProgress, [0, 1], ["#0a1128", "#ffffff"]);
  const pageTextColor = useTransform(scrollYProgress, [0, 1], ["#ffffff", "#0f172a"]);
  const subCardBg = useTransform(scrollYProgress, [0, 1], ["rgba(255, 255, 255, 0.05)", "#ffffff"]);
  const subCardBorder = useTransform(scrollYProgress, [0, 1], ["rgba(255, 255, 255, 0.1)", "rgba(15, 23, 42, 0.08)"]);
  const subCardShadow = useTransform(scrollYProgress, [0, 1], ["0 0 0 rgba(0, 0, 0, 0)", "0 4px 16px rgba(0, 0, 0, 0.04)"]);
  const subTitleColor = useTransform(scrollYProgress, [0, 1], ["#ffffff", "#1A1A2E"]);
  const subDescColor = useTransform(scrollYProgress, [0, 1], ["rgba(255, 255, 255, 0.7)", "#4A5568"]);
  const subArrowColor = useTransform(scrollYProgress, [0, 1], ["#ffffff", "#034EA2"]);
  const subIconBg = useTransform(scrollYProgress, [0, 1], ["rgba(237, 28, 36, 0.2)", "rgba(237, 28, 36, 0.08)"]);


  return (
    <div className={styles.pageContainer}>
      <FloatingTOC items={TOC_ITEMS} />

      {/* Hero Section */}
      <section id="overview" className={styles.hero} data-nav-theme="dark">
        <div className={styles.heroBg}>
          <video 
            src={videoSrc}
            autoPlay
            loop
            muted
            playsInline
          />
          <div className={styles.heroRightBlur} />
        </div>
        
        <div className={styles.heroInner}>
          <div className={styles.heroSplitLayout}>
            <div className={styles.heroContent}>
              <motion.div 
                style={{ marginBottom: "-8px", opacity: 0.6 }}
                initial={{ opacity: 0, y: -16, filter: "blur(12px)" }}
                animate={{ opacity: 0.6, y: 0, filter: "blur(0px)" }}
                transition={{ delay: 0.1, duration: 0.5, ease: "easeOut" }}
              >
                <Breadcrumbs 
                  items={[
                    { label: "Home", href: "/" },
                    { label: "Specialities", href: "/specialities" },
                    { label: title }
                  ]} 
                />
              </motion.div>
              <h1 className={styles.heroTitle}>
                <TextSweepEffect words={[title]} sweepMs={2600} delayMs={80} finalColor="#FFFFFF" />
              </h1>
              <motion.p
                className={styles.heroDesc}
                initial={{ opacity: 0, y: -16, filter: "blur(12px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ delay: 0.25, duration: 0.5, ease: "easeOut" }}
              >
                At Narayana Health, we're dedicated to providing advanced cancer care with expert doctors, 
                modern technology, and compassionate support at every step of your journey.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 16, filter: "blur(12px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ delay: 0.6, duration: 0.5, ease: "easeOut" }}
                style={{ display: "inline-flex" }}
              >
                <Link href="#doctors" className={styles.heroButton}>
                  Find a specialist
                </Link>
              </motion.div>
            </div>

            {/* Right side panel adjacent to hero title */}
            <div className={styles.heroSidePanelWrap}>
              <motion.div
                className={styles.statsGlassContainer}
                initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.35 }}
                  className={styles.metricsRow}
                  ref={statsTrackRef}
                  onScroll={handleStatsScroll}
                >
                  {[
                    { value: 300, suffix: "+", label: "Bone marrow transplants yearly,\ndelivered with specialized care." },
                    { value: 6000, suffix: "+", label: "Cancer surgeries performed every year\nwith precision and care." },
                    { value: 74000, suffix: "+", label: "Yearly chemotherapies, enabling\ncomplete patient treatment access." },
                    { value: 100000, suffix: "+", label: "Radiation fractions yearly, enabled by\nadvanced expertise." },
                  ].map((stat, i) => (
                    <div 
                      className={styles.metricItem} 
                      key={i}
                      ref={(el) => { statCardRefs.current[i] = el; }}
                    >
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={stat.label}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -15 }}
                          transition={{ duration: 0.25, delay: 0.2 + i * 0.05, ease: "easeOut" }}
                          style={{ display: "flex", flexDirection: "column", minWidth: 0, width: "100%", overflow: "hidden" }}
                        >
                          <div className={styles.metricValue}>
                            <MetricValueReveal value={stat.value} suffix={stat.suffix} />
                          </div>
                          <div className={styles.metricLabel}>
                            {stat.label.split("\n").map((line, idx) => (
                              <React.Fragment key={idx}>
                                {line}
                                {idx !== stat.label.split("\n").length - 1 && (
                                  <>
                                    <br className={styles.metricBreak} />
                                    <span className={styles.metricSpace}> </span>
                                  </>
                                )}
                              </React.Fragment>
                            ))}
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  ))}

                  <div className={styles.statsDivider} />

                  <motion.div 
                    className={styles.milestoneSection}
                    ref={(el) => { statCardRefs.current[4] = el as HTMLDivElement | null; }}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5, ease: "easeOut" }}
                  >
                    <span className={styles.milestoneBadge}>
                      <Award size={12} aria-hidden="true" />
                      Milestone
                    </span>
                    <h3 className={styles.milestoneTitle}>First CAR T-Cell Therapy in South India</h3>
                    <p className={styles.milestoneDesc}>
                      India&apos;s first CAR T-cell therapy
                      <br className={styles.metricBreak} />
                      <span className={styles.metricSpace}> </span>
                      for relapsed lymphoma.
                    </p>
                  </motion.div>
                </motion.div>

                {/* Responsive Carousel Controls (< 1100px) */}
                <div className={styles.statsCarouselControls}>
                  <button
                    type="button"
                    className={styles.statsCarouselArrow}
                    onClick={() => scrollToStat(Math.max(0, activeStatIndex - 1))}
                    disabled={activeStatIndex === 0}
                    aria-label="Previous statistic"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <div className={styles.statsCarouselDots} role="tablist" aria-label="Statistics carousel pagination">
                    {[0, 1, 2, 3, 4].map((idx) => (
                      <button
                        key={idx}
                        type="button"
                        role="tab"
                        aria-selected={activeStatIndex === idx}
                        aria-label={`Slide ${idx + 1} of 5`}
                        className={`${styles.statsCarouselDot} ${activeStatIndex === idx ? styles.activeDot : ""}`}
                        onClick={() => scrollToStat(idx)}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    className={styles.statsCarouselArrow}
                    onClick={() => scrollToStat(Math.min(4, activeStatIndex + 1))}
                    disabled={activeStatIndex === 4}
                    aria-label="Next statistic"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
      {/* Scroll-animated background wrapper */}
      <motion.div style={{ backgroundColor: pageBgColor, color: pageTextColor }}>
        {/* Treatments Section */}
        <section id="treatments" className={styles.treatmentsSection} data-nav-theme="dark">
        <div className="container">
          <div className={styles.sectionHeader}>
            <motion.h2 
              className={styles.sectionTitle}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <TextSweepEffect words={["Cancer We Treat"]} sweepMs={2600} delayMs={80} finalColor="#FFFFFF" />
            </motion.h2>
            <motion.p 
              className={styles.sectionDesc}
              initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            >
              At Narayana Health, we're dedicated to providing advanced cancer care with expert doctors, 
              modern technology, and compassionate support at every step of your journey.
            </motion.p>
          </div>
        </div>

        {/* Pinned sentinel element */}
        <div ref={tabsSentinelRef} style={{ height: "1px", width: "100%", pointerEvents: "none" }} />

        {/* Placeholder element to preserve layout flow when dropdown becomes pinned */}
        {isTabsPinned && (
          <div style={{ height: "66px", width: "100%", pointerEvents: "none" }} aria-hidden="true" />
        )}

        {/* Pinned Programme Dropdown Bar */}
        <div 
          data-theme={isTabsPinned ? navTheme : undefined}
          className={`${styles.programmeTabsWrapper} ${isTabsPinned ? `${styles.programmeTabsWrapperPinned} ${navTheme === "light" ? styles.programmeTabsWrapperLight : styles.programmeTabsWrapperDark}` : ""} ${isNearFooter ? styles.programmeTabsWrapperHidden : ""}`}
        >
          <div className={isTabsPinned ? styles.programmeTabsContainerPinned : styles.programmeTabsContainer}>
            {isTabsPinned ? (
              <div className={styles.pinnedBreadcrumbRow}>
                {/* 0. All Specialities Link */}
                <Link
                  href="/specialities"
                  className={styles.breadcrumbLink}
                  title="All Specialities"
                  aria-label="View all medical specialities"
                >
                  Specialities
                </Link>

                <ChevronRight size={14} className={styles.breadcrumbChevron} aria-hidden="true" />

                {/* 1. Main Speciality Root */}
                <button
                  type="button"
                  className={styles.breadcrumbSpecialityBtn}
                  onClick={() => {
                    const hero = document.getElementById("overview");
                    if (hero) hero.scrollIntoView({ behavior: "smooth" });
                  }}
                  title={`Scroll to ${title} overview`}
                  aria-label={`Scroll to ${title} overview`}
                >
                  {title}
                </button>

                {/* 2 & 3. Patient Type + Sub-Specialty Programme Dropdown */}
                <div className={styles.programmeDropdownWrapper} ref={dropdownRef}>
                  <div className={styles.breadcrumbCombinedDropdown}>
                    <button
                      type="button"
                      className={`${styles.breadcrumbTypeBtn} ${isDropdownOpen ? styles.breadcrumbTypeBtnOpen : ""}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsDropdownOpen((prev) => !prev);
                      }}
                      title={`Patient type: ${patientType}. Click to change programme or patient type.`}
                      aria-haspopup="listbox"
                      aria-expanded={isDropdownOpen}
                      aria-label={`Current patient type: ${patientType}. Click to change.`}
                    >
                      <span>{patientType}</span>
                    </button>

                    <ChevronRight size={14} className={styles.breadcrumbChevron} aria-hidden="true" />

                    <button
                      type="button"
                      className={`${styles.breadcrumbSelectedTabTrigger} ${isDropdownOpen ? styles.breadcrumbSelectedTabTriggerOpen : ""}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsDropdownOpen((prev) => !prev);
                      }}
                      aria-haspopup="listbox"
                      aria-expanded={isDropdownOpen}
                      aria-label={`Selected programme: ${(selectedCat?.title || "").replace(/\s+(Treatment|Programme).*$/, "")} (${patientType}). Click to change programme.`}
                    >
                      <span className={styles.breadcrumbSelectedTabTitle}>
                        {(selectedCat?.title || "").replace(/\s+(Treatment|Programme).*$/, "")}
                      </span>
                      <ChevronDown
                        size={14}
                        className={`${styles.breadcrumbChevronDown} ${isDropdownOpen ? styles.breadcrumbChevronDownOpen : ""}`}
                        aria-hidden="true"
                      />
                    </button>
                  </div>

                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        className={styles.programmeDropdownMenu}
                        role="listbox"
                        aria-label="Cancer Treatment Programmes Selection"
                        data-lenis-prevent="true"
                        onWheel={(e) => e.stopPropagation()}
                        initial={{ opacity: 0, y: -6, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.98 }}
                        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                      >
                        {/* Left side: Patient Type Segregated Sidebar */}
                        <div className={styles.dropdownSidebar} role="tablist" aria-label="Patient Type">
                          <div className={styles.dropdownSidebarHeader}>
                            <span className={styles.dropdownSectionLabel}>Patient Type</span>
                          </div>
                          <div className={styles.dropdownTypeOptions}>
                            {(["Adult", "Paediatric"] as const).map((type) => {
                              const isSelected = patientType === type;
                              const count = type === "Adult" ? adultCancerCategories.length : paediatricCancerCategories.length;
                              return (
                                <button
                                  key={type}
                                  type="button"
                                  role="tab"
                                  aria-selected={isSelected}
                                  className={`${styles.dropdownTypeOptionBtn} ${isSelected ? styles.dropdownTypeOptionBtnActive : ""}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePatientTypeChange(type, true);
                                  }}
                                >
                                  <span className={styles.dropdownTypeOptionIndicator} aria-hidden="true" />
                                  <span className={styles.dropdownTypeOptionName}>{type}</span>
                                  <span className={styles.dropdownTypeOptionCount}>{count}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Right side: Cancer Programmes List */}
                        <div className={styles.dropdownListPanel} data-lenis-prevent="true">
                          <div className={styles.dropdownListHeader}>
                            <span className={styles.dropdownSectionLabel}>
                              {patientType} Programmes ({currentCategories.length})
                            </span>
                          </div>
                          <div
                            className={styles.dropdownScrollList}
                            data-lenis-prevent="true"
                            onWheel={(e) => e.stopPropagation()}
                          >
                            {currentCategories.map((cat) => {
                              const isActive = cat.id === activeCategory;
                              const displayTitle = (cat.title || "").replace(/\s+(Treatment|Programme).*$/, "");
                              return (
                                <button
                                  key={cat.id}
                                  type="button"
                                  role="option"
                                  aria-selected={isActive}
                                  className={`${styles.programmeDropdownItem} ${isActive ? styles.programmeDropdownItemActive : ""}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCategorySelect(cat.id);
                                    setIsDropdownOpen(false);
                                  }}
                                >
                                  <span className={styles.programmeDropdownItemImageWrap}>
                                    <img
                                      src={cat.icon}
                                      alt={cat.programmeTitle || cat.title}
                                      className={styles.programmeDropdownItemImage}
                                      loading="lazy"
                                      width={26}
                                      height={26}
                                    />
                                  </span>
                                  <span className={styles.programmeDropdownItemText}>
                                    <span className={styles.programmeDropdownItemTitle}>
                                      {displayTitle}
                                    </span>
                                  </span>
                                  {isActive && (
                                    <Check size={15} className={styles.programmeDropdownCheck} aria-hidden="true" />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              /* Dropdown Selection with active programme upfront (Unpinned centered pill) */
              <div className={styles.programmeDropdownWrapper} ref={dropdownRef}>
                <button
                  type="button"
                  className={`${styles.programmeDropdownTrigger} ${isDropdownOpen ? styles.programmeDropdownTriggerOpen : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDropdownOpen((prev) => !prev);
                  }}
                  aria-haspopup="listbox"
                  aria-expanded={isDropdownOpen}
                  aria-label={`Selected programme: ${(selectedCat?.title || "").replace(/\s+(Treatment|Programme).*$/, "")} (${patientType}). Click to change programme.`}
                >
                  <div className={styles.programmeDropdownTriggerLeft}>
                    <span className={styles.programmeDropdownTriggerBadge}>
                      {patientType}
                    </span>
                    <span className={styles.programmeDropdownDivider} aria-hidden="true" />
                    <span className={styles.programmeDropdownItemImageWrap}>
                      <img
                        src={selectedCat?.icon}
                        alt={selectedCat?.programmeTitle || selectedCat?.title}
                        className={styles.programmeDropdownItemImage}
                        loading="lazy"
                        width={28}
                        height={28}
                      />
                    </span>
                    <span className={styles.programmeDropdownTriggerText}>
                      <span className={styles.programmeDropdownTriggerTitle}>
                        {(selectedCat?.title || "").replace(/\s+(Treatment|Programme).*$/, "")}
                      </span>
                    </span>
                  </div>
                  <ChevronDown
                    size={16}
                    className={`${styles.programmeDropdownChevron} ${isDropdownOpen ? styles.programmeDropdownChevronOpen : ""}`}
                    aria-hidden="true"
                  />
                </button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      className={styles.programmeDropdownMenu}
                      role="listbox"
                      aria-label="Cancer Treatment Programmes Selection"
                      data-lenis-prevent="true"
                      onWheel={(e) => e.stopPropagation()}
                      initial={{ opacity: 0, y: -6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.98 }}
                      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                    >
                      {/* Left side: Patient Type Segregated Sidebar */}
                      <div className={styles.dropdownSidebar} role="tablist" aria-label="Patient Type">
                        <div className={styles.dropdownSidebarHeader}>
                          <span className={styles.dropdownSectionLabel}>Patient Type</span>
                        </div>
                        <div className={styles.dropdownTypeOptions}>
                          {(["Adult", "Paediatric"] as const).map((type) => {
                            const isSelected = patientType === type;
                            const count = type === "Adult" ? adultCancerCategories.length : paediatricCancerCategories.length;
                            return (
                              <button
                                key={type}
                                type="button"
                                role="tab"
                                aria-selected={isSelected}
                                className={`${styles.dropdownTypeOptionBtn} ${isSelected ? styles.dropdownTypeOptionBtnActive : ""}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePatientTypeChange(type, true);
                                }}
                              >
                                <span className={styles.dropdownTypeOptionIndicator} aria-hidden="true" />
                                <span className={styles.dropdownTypeOptionName}>{type}</span>
                                <span className={styles.dropdownTypeOptionCount}>{count}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Right side: Cancer Programmes List */}
                      <div className={styles.dropdownListPanel} data-lenis-prevent="true">
                        <div className={styles.dropdownListHeader}>
                          <span className={styles.dropdownSectionLabel}>
                            {patientType} Programmes ({currentCategories.length})
                          </span>
                        </div>
                        <div
                          className={styles.dropdownScrollList}
                          data-lenis-prevent="true"
                          onWheel={(e) => e.stopPropagation()}
                        >
                          {currentCategories.map((cat) => {
                            const isActive = cat.id === activeCategory;
                            const displayTitle = (cat.title || "").replace(/\s+(Treatment|Programme).*$/, "");
                            return (
                              <button
                                key={cat.id}
                                type="button"
                                role="option"
                                aria-selected={isActive}
                                className={`${styles.programmeDropdownItem} ${isActive ? styles.programmeDropdownItemActive : ""}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCategorySelect(cat.id);
                                  setIsDropdownOpen(false);
                                }}
                              >
                                <span className={styles.programmeDropdownItemImageWrap}>
                                  <img
                                    src={cat.icon}
                                    alt={cat.programmeTitle || cat.title}
                                    className={styles.programmeDropdownItemImage}
                                    loading="lazy"
                                    width={26}
                                    height={26}
                                  />
                                </span>
                                <span className={styles.programmeDropdownItemText}>
                                  <span className={styles.programmeDropdownItemTitle}>
                                    {displayTitle}
                                  </span>
                                </span>
                                {isActive && (
                                  <Check size={15} className={styles.programmeDropdownCheck} aria-hidden="true" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>


        {/* Full-width Selected Programme Showcase Banner */}
        {(() => {
          const selectedCat = currentCategories.find(c => c.id === activeCategory) || currentCategories[0];
          const prevCat = currentCategories.find(c => c.id === prevCategory) || selectedCat;
          return (
            <motion.div 
              className={styles.accordionContainerFullWidth}
              initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className={styles.selectedProgrammeHero}>
                {/* HeroWipeSlideshow mask-wipe transition between background images */}
                <div 
                  className={styles.selectedProgrammeBgImage}
                  style={{ backgroundImage: `url("${prevCat.bg}")`, zIndex: 1 }}
                />
                {isWiping && (
                  <motion.div
                    key={`${prevCategory}->${activeCategory}`}
                    className={styles.selectedProgrammeBgImage}
                    style={{ 
                      backgroundImage: `url("${selectedCat.bg}")`,
                      zIndex: 2,
                      transformOrigin: "50% 50%",
                      WebkitBackfaceVisibility: "hidden",
                      backfaceVisibility: "hidden"
                    }}
                    initial={{
                      clipPath: wipeDirection === "rightToLeft" 
                        ? "inset(0% 0% 0% 100%)" 
                        : "inset(0% 100% 0% 0%)",
                      scale: 1.025
                    }}
                    animate={{
                      clipPath: "inset(0% 0% 0% 0%)",
                      scale: 1
                    }}
                    transition={{
                      duration: 1.15,
                      ease: [0.16, 1, 0.3, 1]
                    }}
                    onAnimationComplete={() => {
                      setPrevCategory(activeCategory);
                      setIsWiping(false);
                    }}
                  />
                )}

                <div className={styles.selectedProgrammeOverlay} />

                {/* Right / Main Programme Details */}
                <AnimatePresence initial={false}>
                  <motion.div 
                    key={selectedCat.id}
                    className={styles.selectedProgrammeContent}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, position: "absolute" }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div className={styles.selectedProgrammeInner}>
                      <Link href="#overview" className={styles.knowMoreAction}>
                        Know more
                        <span className={styles.actionUnderline} aria-hidden="true" />
                      </Link>
                      <h3 className={styles.selectedProgrammeTitle}>
                        {selectedCat.programmeTitle || selectedCat.title}
                      </h3>
                      <p className={styles.selectedProgrammeDesc}>
                        {selectedCat.desc}
                      </p>
                      <div className={styles.selectedProgrammeActions}>
                        <Link href="#doctors" className={styles.heroButton}>
                          Find a specialist
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })()}

        <div className={styles.subConditionsContainer}>
          <AnimatePresence mode="wait">
            {currentCategories.find(c => c.id === activeCategory)?.subConditions?.length ? (
              <motion.div 
                key={activeCategory}
                className={styles.subConditionsGrid}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.08,
                      delayChildren: 0.1,
                    }
                  }
                }}
                exit={{ opacity: 0, y: -16, filter: "blur(6px)", transition: { duration: 0.25 } }}
              >
                {currentCategories.find(c => c.id === activeCategory)?.subConditions.map((cond, i) => (
                  <motion.div 
                    key={i} 
                    className={styles.subConditionCard}
                    variants={{
                      hidden: { opacity: 0, y: 28, filter: "blur(10px)", scale: 0.96 },
                      visible: {
                        opacity: 1,
                        y: 0,
                        filter: "blur(0px)",
                        scale: 1,
                        transition: {
                          duration: 0.55,
                          ease: [0.16, 1, 0.3, 1],
                        }
                      }
                    }}
                    style={{
                      backgroundColor: subCardBg,
                      borderColor: subCardBorder,
                      boxShadow: subCardShadow,
                    }}
                    whileHover={{ y: -6, scale: 1.015, transition: { duration: 0.2 } }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <motion.div className={styles.subConditionIcon}>
                      <Virus size={14} stroke="#FEF5F5" />
                    </motion.div>
                    <div className={styles.subConditionContent}>
                      <motion.div className={styles.subConditionTitle} style={{ color: subTitleColor }}>
                        {cond.title}
                      </motion.div>
                      <motion.div className={styles.subConditionDesc} style={{ color: subDescColor }}>
                        {cond.desc}
                      </motion.div>
                    </div>
                    <motion.div className={styles.subConditionArrowWrap} style={{ color: subArrowColor }}>
                      <ChevronRight size={14} className={styles.subConditionArrow} />
                    </motion.div>
                  </motion.div>
                ))}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </section>

      <section ref={doctorsRef} id="doctors" className={styles.doctorsSection} data-nav-theme="light">
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle} style={{ color: "var(--color-text)" }}>
              <TextSweepEffect
                key={activeCategory}
                words={[activeDoctorInfo.title]}
                sweepMs={2600}
                delayMs={80}
                finalColor="var(--color-text)"
              />
            </h2>
            <AnimatePresence mode="wait">
              <motion.p 
                key={activeCategory}
                className={styles.sectionDesc} 
                style={{ color: "var(--color-text-secondary)" }}
                initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                {activeDoctorInfo.desc}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        <div className={styles.doctorsGridWrapper}>
          <div className={styles.refDoctorsGrid}>
            {doctors.map((doc, i) => (
              <motion.div 
                key={i} 
                className={styles.refDoctorCard}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Image 
                  src={doc.img} 
                  alt={doc.name} 
                  fill 
                  className={styles.refDocFullImage}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1440px) 33vw, 25vw"
                />
                <div className={styles.refDocFullGradient}></div>
                
                <div className={styles.refDocOverlayContent}>
                  <div className={styles.refDocBottomFlex}>
                    <div className={styles.refDocTextCol}>
                      <h3 className={`${styles.refDocName} ${styles.refDocNameMultiLine}`} title={doc.name}>
                        {doc.name}
                      </h3>
                      <div className={styles.refDocSpecialty} title={activeDoctorInfo.specialty}>
                        {activeDoctorInfo.specialty}
                      </div>
                      <div className={styles.refDocExpRow}>
                        <Clock size={12} className={styles.refDocExpIcon} />
                        <span>{doc.exp}</span>
                      </div>
                      <div className={`${styles.refDocHospital} ${styles.refDocHospitalSingleLine}`} title={doc.loc}>
                        {doc.loc}
                      </div>
                    </div>
                    
                    <Link href={`/doctors/${doc.id}`} className={styles.refBookBtnWhite}>
                      Book
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div 
          style={{ display: "flex", justifyContent: "center", marginTop: "var(--sp-8)" }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link href="/doctors" className={styles.secondaryButton}>
              View more
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Pinned Procedures & Surgeries Section */}
      <div id="procedures" className={styles.pinnedProceduresTrack} data-nav-theme="light">
        <section className={styles.pinnedProceduresSticky}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle} style={{ color: "var(--color-text)" }}>
                <TextSweepEffect
                  key={activeCategory}
                  words={[activeProcedureInfo.title]}
                  sweepMs={2600}
                  delayMs={80}
                  finalColor="var(--color-text)"
                />
              </h2>
              <AnimatePresence mode="wait">
                <motion.p 
                  key={activeCategory}
                  className={styles.sectionDesc} 
                  style={{ color: "var(--color-text-secondary)" }}
                  initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  {activeProcedureInfo.desc}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>
            
          <div
            style={{
              width: "100%",
              margin: "0 auto",
              padding: "0 16px",
              boxSizing: "border-box",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <ModernCarousel 
              items={proceduresData.map(proc => ({
                id: proc.id,
                title: proc.title,
                desc: proc.desc,
                bg: proc.bg,
                stat: proc.stat
              }))}
              activeId={activeProcedure}
              onActiveChange={setActiveProcedure}
            />
          </div>
        </section>
      </div>

      {/* Dynamic Sections as per design sequence */}
      {[
        { id: "technology", title: activeTechnologyInfo.title, desc: activeTechnologyInfo.desc },
        { id: "tests", title: activeTestsInfo.title, desc: activeTestsInfo.desc },
        { id: "about-speciality", title: "About Speciality", desc: `Comprehensive guide to clinical conditions, modern treatment indications, and patient pathways for ${title}.` },
        { id: "doctor-overview", title: activeDoctorVideosInfo.title, desc: activeDoctorVideosInfo.desc },
        { id: "why-us", title: activeWhyUsInfo.title, desc: activeWhyUsInfo.desc },
        { id: "patient-stories", title: activePatientStoriesInfo.title, desc: activePatientStoriesInfo.desc },
        { id: "hospitals", title: activeHospitalsInfo.title, desc: activeHospitalsInfo.desc },
        { id: "faqs", title: "FAQs", desc: "Find answers to common questions about our specialities, treatments, and patient care processes." }
      ].map((section, idx) => {
        if (section.id === "patient-stories") {
          return (
            <div id={section.id} key={idx} data-nav-theme="light" style={{ width: "100%", maxWidth: "100%", overflow: "hidden", background: "var(--color-surface, var(--white))" }}>
              <SpecialityPatientStories
                title={section.title}
                subtitle={section.desc}
                activeCategory={activeCategory}
                theme="light"
              />
            </div>
          );
        }
        const isWhyUs = section.id === "why-us";
        const isHospitals = section.id === "hospitals";
        const isFaqs = section.id === "faqs";
        const isDarkTheme = isWhyUs;
        
        const isTransparentSection = section.id === "technology" || section.id === "about-speciality" || isWhyUs;
        let sectionBg = isTransparentSection ? "transparent" : (idx % 2 === 0 ? "var(--color-bg-alt)" : "var(--color-surface)");
        if (section.id === "about-speciality") {
          sectionBg = "transparent";
        } else if (section.id === "doctor-overview") {
          sectionBg = "var(--color-surface)";
        } else if (isHospitals || isFaqs) {
          sectionBg = "var(--white)";
        }
        
        const isDarkSection = false;
        const titleColor = isDarkSection ? "var(--white)" : "var(--color-text)";
        const descColor = isDarkSection ? "rgba(var(--white-rgb), 0.75)" : "var(--color-text-secondary)";

        return (
        <section 
          key={idx} 
          id={section.id} 
          className={styles.doctorsSection} 
          data-nav-theme={isDarkTheme ? "dark" : "light"} 
          style={{ 
            ...(sectionBg && sectionBg !== "transparent" ? { background: sectionBg } : {}),
            position: "relative"
          }}
        >
          <div className="container">
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle} style={{ color: titleColor }}>
                <TextSweepEffect
                  key={
                    section.id === "technology" || section.id === "tests" || section.id === "doctor-overview" || section.id === "why-us" || section.id === "hospitals"
                      ? `${section.id}-${activeCategory}`
                      : section.title
                  }
                  words={[section.title]}
                  sweepMs={2600}
                  delayMs={80}
                  finalColor={titleColor}
                />
              </h2>
              {section.id === "technology" || section.id === "tests" || section.id === "doctor-overview" || section.id === "why-us" || section.id === "hospitals" ? (
                <AnimatePresence mode="wait">
                  <motion.p 
                    key={activeCategory}
                    className={styles.sectionDesc} 
                    style={{ color: descColor }}
                    initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  >
                    {section.desc}
                  </motion.p>
                </AnimatePresence>
              ) : (
                <motion.p 
                  className={styles.sectionDesc} 
                  style={{ color: descColor }}
                  initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
                  whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                >
                  {section.desc}
                </motion.p>
              )}
            </div>
          </div>
          {section.id === "technology" ? (
            <div style={{ width: "100%", maxWidth: "100%", overflow: "hidden" }}>
              <AdvanceTechnology />
            </div>
          ) : section.id === "tests" ? (
            <div style={{ width: "100%", maxWidth: "100%", overflowX: "clip", overflowY: "visible" }}>
              <motion.div
                initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              >
                <AdvanceTestsCarousel />
              </motion.div>
            </div>
          ) : section.id === "about-speciality" ? (
            <div style={{ width: "100%", maxWidth: "100%", overflow: "hidden" }}>
              <AboutSpecialitySection
                specialitySlug={slug}
                specialityTitle={title}
              />
            </div>
          ) : section.id === "doctor-overview" ? (
            <div style={{ width: "100%", maxWidth: "100%", overflow: "hidden" }}>
              <motion.div
                initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              >
                <DoctorOverviewCarousel />
              </motion.div>
            </div>
          ) : section.id === "why-us" ? (
            <div style={{ width: "100%", maxWidth: "100%", overflow: "hidden" }}>
              <WhyChooseNHBento />
            </div>
          ) : section.title === "FAQs" ? (
            <SpecialityFAQ faqs={faqData} theme="light" />
          ) : section.id === "hospitals" ? (
            <div style={{ width: "100%", maxWidth: "100%", overflow: "hidden" }}>
              <motion.div
                initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              >
                <HospitalCarousel hospitals={HOSPITALS_DATA} theme="light" />
              </motion.div>
            </div>
          ) : (
            <div className="container">
              <motion.div 
                style={{ 
                  width: "100%", 
                  height: "280px", 
                  borderRadius: "var(--radius-xl)", 
                  background: "var(--color-border-light)", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center", 
                  color: "var(--color-text-muted)",
                  fontSize: "var(--font-size-lg)",
                  fontWeight: 500,
                  border: "2px dashed var(--color-border)"
                }}
                initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              >
                [ Content Module: {section.title} ]
              </motion.div>
            </div>
          )}
        </section>
        );
      })}

      {/* Sleek Medically Reviewed Band above footer */}
      <MedicallyReviewedBand specialityName={currentSpec?.name || "Cancer Care / Oncology"} />

      {/* Footer sentinel for hiding pinned bar */}
      <div ref={footerSentinelRef} style={{ height: "0px", width: "100%", pointerEvents: "none", opacity: 0 }} />

      </motion.div>
    </div>
  );
}
