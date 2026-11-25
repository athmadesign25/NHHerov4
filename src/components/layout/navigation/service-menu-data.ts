import {
  Bean, Bone, Bot, Brain, Dna, HeartPulse, Ribbon, ScanLine,
  Stethoscope, type LucideIcon,
} from "lucide-react";

// NH's live CoE directory order, verified 4 November 2026:
// https://www.narayanahealth.org/center-of-excellence
export const SERVICE_CENTRES = [
  { label: "Cardiac Sciences", icon: HeartPulse, href: "/specialities/cardiology" },
  { label: "Cancer Care", icon: Ribbon, href: "/specialities/oncology" },
  { label: "Neuro Sciences", icon: Brain, href: "/specialities/neurology" },
  { label: "Gastro Sciences", icon: Stethoscope, href: "/specialities/gastroenterology" },
  { label: "Orthopaedics", icon: Bone, href: "/specialities/orthopaedics" },
  { label: "Image Guided Therapy", icon: ScanLine, href: "/search?q=Image%20Guided%20Therapy" },
  { label: "Robotic Surgery", icon: Bot, href: "https://www.narayanahealth.org/center-of-excellence/robotic-surgery" },
  { label: "Solid-Organ & Bone Marrow Transplant", icon: Dna, href: "https://www.narayanahealth.org/center-of-excellence/solid-organ-bone-marrow-transplant" },
  { label: "Renal Sciences", icon: Bean, href: "https://www.narayanahealth.org/center-of-excellence/renal-sciences" },
];
export const SERVICE_TILES = [
  { label: "Ambulance Service Emergency", lines: ["Ambulance", "Service", "Emergency"], href: "/emergency", image: "/navigation/services-ambulance.webp", tone: "emergency" },
  { label: "Book Health Checkup", lines: ["Book Health", "Checkup"], href: "/#health-packages", image: "/health-packages/diabetes.png", tone: "checkup" },
  { label: "Diagnostics and tests", lines: ["Diagnostics", "and tests"], href: "/search?q=Diagnostics%20and%20tests", image: "/images/procedures/procedure_mri.png", tone: "diagnostics" },
  { label: "Aarogyam", lines: ["Aarogyam"], href: "/search?q=Aarogyam", image: "/health-checkup-consultation.jpg", tone: "wellness" },
  { label: "Clinical Specialties", lines: ["Clinical", "Specialties"], href: "/specialities", image: "/pulse_find_doctor_banner.png", tone: "clinical" },
  { label: "Health Insurance", lines: ["Health", "Insurance"], href: "https://www.narayanahealth.insurance/", image: "/doctor_patient.png", tone: "insurance" },
];

interface ServiceMenuSection {
  id: string;
  label: string;
  image: string;
  imageSizes?: string;
  alt: string;
  groups: { title: string; links: { label: string; href: string; icon?: LucideIcon; lines?: string[]; image?: string; imageTreatment?: "cutout" | "portrait" | "ambulance" | "diagnostics"; tag?: string }[] }[];
  brands?: { label: string; href: string; logo: string; background: string; logoShape?: "wide" | "portrait"; descriptor?: string; tag?: string }[];
  notice?: string;
  footer?: { label: string; href: string };
}

export const SERVICE_MENU_SECTIONS: ServiceMenuSection[] = [
  {
    id: "preventive", label: "Preventive Health",
    image: "/health-checkup-consultation.jpg", alt: "Preventive care at Narayana Health",
    groups: [
      { title: "Health checkups", links: [{ label: "Book Health Checkup", href: SERVICE_TILES[1].href, lines: SERVICE_TILES[1].lines, image: "/health-packages/diabetes.png", imageTreatment: "cutout" }] },
    ],
    brands: [
      { label: "Aarogyam", href: SERVICE_TILES[3].href, logo: "/navigation/services/aarogyam-logo.svg", background: "/navigation/services/aarogyam-clinic.webp", logoShape: "wide", tag: "Clinic" },
      { label: "Narayana One Health", href: "/search?q=One%20Health", logo: "/navigation/services/one-health-logo.svg", background: "/navigation/services/one-health-clinic.webp", logoShape: "portrait", tag: "Clinic" },
    ],
  },
  {
    id: "insurance", label: "Insurance", image: "/doctor_patient.png", alt: "Narayana Health insurance",
    groups: [{ title: "Insurance plans", links: [
      { label: "Narayana Aditi Insurance", lines: ["Narayana Aditi", "Insurance"], href: "https://www.narayanahealth.insurance/aditi-lp1", image: "/Health Checkup/Master health.png", imageTreatment: "portrait" },
      { label: "Arya Health Insurance", href: "https://www.narayanahealth.insurance/arya-health-insurance", lines: ["Arya Health", "Insurance"], image: "/Health Checkup/Senior Citizen.png", imageTreatment: "portrait" },
    ] }],
  },
  {
    id: "services", label: "Care & Services", image: "/health-checkup-consultation.jpg", alt: "Narayana Health services",
    groups: [{ title: "Care and services", links: [
      { label: "Clinical Specialties", href: SERVICE_TILES[4].href, lines: SERVICE_TILES[4].lines, image: "/pulse_find_doctor_banner.png" },
      { label: "Diagnostics", href: SERVICE_TILES[2].href, image: "/bone-health-package.png", imageTreatment: "diagnostics" },
      { label: "Ambulance & Emergency", href: SERVICE_TILES[0].href, lines: ["Ambulance &", "Emergency"], image: "/navigation/services/nh-ambulance-cutout-v2.webp", imageTreatment: "ambulance" },
    ] }],
  },
  {
    id: "centres", label: "Centres of Excellence",
    image: "/navigation/hospitals/cardiac-sciences-original.png", imageSizes: "(min-width: 1100px) 1400px, 100vw", alt: "Narayana Health hospital campus",
    groups: [{ title: "Specialist care", links: SERVICE_CENTRES }],
    footer: { label: "View all", href: "/centre-of-excellence" },
  },
];
