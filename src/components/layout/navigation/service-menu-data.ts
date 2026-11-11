// NH's live CoE directory order, verified 4 November 2026:
// https://www.narayanahealth.org/center-of-excellence
export const SERVICE_CENTRES = [
  { label: "Cardiac Sciences", href: "/specialities/cardiology" },
  { label: "Cancer Care", href: "/specialities/oncology" },
  { label: "Neuro Sciences", href: "/specialities/neurology" },
  { label: "Gastro Sciences", href: "/specialities/gastroenterology" },
  { label: "Orthopaedics", href: "/specialities/orthopaedics" },
  { label: "Image Guided Therapy", href: "/search?q=Image%20Guided%20Therapy" },
  { label: "Robotic Surgery", href: "https://www.narayanahealth.org/center-of-excellence/robotic-surgery" },
  { label: "Solid-Organ & Bone Marrow Transplant", href: "https://www.narayanahealth.org/center-of-excellence/solid-organ-bone-marrow-transplant" },
  { label: "Renal Sciences", href: "https://www.narayanahealth.org/center-of-excellence/renal-sciences" },
];
export const SERVICE_TILES = [
  { label: "Ambulance Service Emergency", lines: ["Ambulance", "Service", "Emergency"], href: "/emergency", image: "/navigation/services-ambulance.webp", tone: "emergency" },
  { label: "Book Health Checkup", lines: ["Book Health", "Checkup"], href: "/health-checkups", image: "/health-packages/diabetes.png", tone: "checkup" },
  { label: "Diagnostics and tests", lines: ["Diagnostics", "and tests"], href: "/diagnostics", image: "/images/procedures/procedure_mri.png", tone: "diagnostics" },
  { label: "Aarogyam", lines: ["Aarogyam"], href: "/health-checkups?hospital=prestige", image: "/health-checkup-consultation.jpg", tone: "wellness" },
  { label: "Clinical Specialties", lines: ["Clinical", "Specialties"], href: "/specialities", image: "/pulse_find_doctor_banner.png", tone: "clinical" },
  { label: "Health Insurance", lines: ["Health", "Insurance"], href: "https://www.narayanahealth.insurance/", image: "/doctor_patient.png", tone: "insurance" },
];

interface ServiceMenuSection {
  id: string;
  label: string;
  image: string;
  imageSizes?: string;
  alt: string;
  groups: { title: string; links: { label: string; href: string }[] }[];
  notice?: string;
  footer?: { label: string; href: string };
}

export const SERVICE_MENU_SECTIONS: ServiceMenuSection[] = [
  {
    id: "centres", label: "Centres of Excellence",
    image: "/navigation/hospitals/cardiac-sciences-original.png", imageSizes: "(min-width: 1100px) 1400px, 100vw", alt: "Narayana Health hospital campus",
    groups: [{ title: "Specialist care", links: SERVICE_CENTRES }],
  },
  {
    id: "services", label: "Services", image: "/health-checkup-consultation.jpg", alt: "A specialist supporting a patient's health checkup",
    groups: [
      { title: "Care and services", links: [
        { label: "Book Health Checkup", href: SERVICE_TILES[1].href },
        { label: "Diagnostics", href: SERVICE_TILES[2].href },
        { label: "Clinical Specialties", href: SERVICE_TILES[4].href },
        { label: "Narayana One Health", href: "/search?q=One%20Health" },
      ] },
      { title: "More care options", links: [SERVICE_TILES[3], SERVICE_TILES[0]] },
    ],
  },
  {
    id: "insurance", label: "Health Insurance", image: "/doctor_patient.png", alt: "A doctor listening to a patient",
    // Real current product names, used as provisional menu content.
    // https://www.narayanahealth.insurance/product
    groups: [{ title: "Individual plans", links: [
      { label: "Narayana Aditi", href: "https://www.narayanahealth.insurance/aditi-lp1" },
      { label: "Arya Health Insurance", href: "https://www.narayanahealth.insurance/arya-health-insurance" },
    ] }],
  },
];
