// ─── Specialities Data ────────────────────────────────────────────────────────
// Single source of truth for all Treatment & Specialities pages.
// Consumed by:
//   - /specialities page (SpecialityMeta[])
//   - /specialities/[slug] page (SpecialityDetail via getSpecialityDetail())
//
// CONTENT NOTE: Cardiology detail content is clearly marked [DEMO CONTENT].
// All other specialities carry meta only — detail pages are out of scope
// until approved content is available.
// ─────────────────────────────────────────────────────────────────────────────

export interface SpecialityMeta {
  slug: string;
  name: string;
  shortName: string;
  category: string;
  tagline: string;
  icon: string;
  image: string;
  video?: string;
  stat: { value: string; label: string };
}

export interface SpecialityCondition {
  name: string;
}

export interface SpecialityProcedureGroup {
  group: string;
  items: string[];
}

export interface SpecialityHighlight {
  iconName: string;
  title: string;
  desc: string;
}

export interface SpecialityDoctor {
  id: string;
  name: string;
  subSpeciality: string;
  experienceYears: string;
  rating: number;
  img: string;
}

export interface SpecialityDetail extends SpecialityMeta {
  overviewParagraphs: string[];
  conditions: SpecialityCondition[];
  procedureGroups: SpecialityProcedureGroup[];
  highlights: SpecialityHighlight[];
  doctors: SpecialityDoctor[];
}

// ─── ALL SPECIALITIES ─────────────────────────────────────────────────────────

export const ALL_SPECIALITIES: SpecialityMeta[] = [
  {
    slug: "cardiology",
    name: "Cardiology & Cardiac Surgery",
    shortName: "Cardiology",
    category: "Heart & Vascular",
    tagline: "Comprehensive heart care — from prevention to complex interventions",
    icon: "/Specialities icons/Cardiology.svg",
    image: "/Specialities icons/Cardiology.jpeg",
    video: "/Specialities icons/Cardiology.mp4",
    stat: { value: "5K+", label: "Cardiac Surgeries" },
  },
  {
    slug: "oncology",
    name: "Cancer Care",
    shortName: "Cancer Care",
    category: "Cancer Care",
    tagline: "Advanced cancer treatment with precision medicine and compassionate care",
    icon: "/Specialities icons/Cancercare.svg",
    image: "/Specialities icons/Cancer Care.jpeg",
    video: "/Specialities icons/Cancer Care.mp4",
    stat: { value: "10K+", label: "Patients Treated" },
  },
  {
    slug: "neurology",
    name: "Neurology & Neurosurgery",
    shortName: "Neurology",
    category: "Brain & Spine",
    tagline: "Specialised care for brain, spine, and nervous system disorders",
    icon: "/Specialities icons/Neurology.svg",
    image: "/Specialities icons/Neurology.jpeg",
    video: "/Specialities icons/Neurology.mp4",
    stat: { value: "3K+", label: "Neuro Surgeries" },
  },
  {
    slug: "orthopaedics",
    name: "Orthopaedics & Joint Replacement",
    shortName: "Orthopaedics",
    category: "Bones & Joints",
    tagline: "Joint replacement, sports medicine, and complex trauma care",
    icon: "/Specialities icons/Orthopaedics.svg",
    image: "/Specialities icons/Orthopedics.jpeg",
    video: "/Specialities icons/Orthopedics.mp4",
    stat: { value: "8K+", label: "Joint Replacements" },
  },
  {
    slug: "nephrology",
    name: "Nephrology & Transplant",
    shortName: "Nephrology",
    category: "Kidney & Urology",
    tagline: "Expert kidney care, dialysis, and transplant services",
    icon: "/Specialities icons/Nephrology.svg",
    image: "/Specialities icons/Nephrology.jpeg",
    video: "/Specialities icons/Nephrology.mp4",
    stat: { value: "2K+", label: "Kidney Transplants" },
  },
  {
    slug: "gastroenterology",
    name: "Gastroenterology",
    shortName: "Gastroenterology",
    category: "Digestive Health",
    tagline: "Comprehensive digestive and liver disease care",
    icon: "/Specialities icons/Gastro.svg",
    image: "/Specialities icons/Gastroenterology.jpeg",
    video: "/Specialities icons/Gastroenterology.mp4",
    stat: { value: "15K+", label: "Endoscopies Performed" },
  },
  {
    slug: "paediatrics",
    name: "Paediatrics & Neonatology",
    shortName: "Paediatrics",
    category: "Women & Children",
    tagline: "Dedicated child and newborn care from birth through adolescence",
    icon: "/Specialities icons/Paedratic.svg",
    image: "/Specialities icons/Cancer Care.jpeg",
    video: "/Specialities icons/Cancer Care.mp4",
    stat: { value: "12K+", label: "Children Treated" },
  },
  {
    slug: "gynaecology",
    name: "Obstetrics & Gynaecology",
    shortName: "Gynaecology",
    category: "Women & Children",
    tagline: "Comprehensive women's health across all stages of life",
    icon: "/Specialities icons/Gynaecology.svg",
    image: "/Specialities icons/Cancer Care.jpeg",
    stat: { value: "6K+", label: "Deliveries Annually" },
  },
  {
    slug: "pulmonology",
    name: "Pulmonology & Respiratory Medicine",
    shortName: "Pulmonology",
    category: "Respiratory",
    tagline: "Specialised care for lung and respiratory conditions",
    icon: "/Specialities icons/Pulmonology.svg",
    image: "/Specialities icons/Pulmonology.jpeg",
    video: "/Specialities icons/Pulmonology.mp4",
    stat: { value: "4.5K+", label: "Respiratory Cases" },
  },
  {
    slug: "urology",
    name: "Urology",
    shortName: "Urology",
    category: "Kidney & Urology",
    tagline: "Advanced urological care with minimally invasive techniques",
    icon: "/Specialities icons/Urology.svg",
    image: "/Specialities icons/Urology.jpeg",
    video: "/Specialities icons/Urology.mp4",
    stat: { value: "6K+", label: "Urological Procedures" },
  },
  {
    slug: "endocrinology",
    name: "Endocrinology & Diabetology",
    shortName: "Endocrinology",
    category: "Metabolic & Hormonal",
    tagline: "Specialised management of diabetes, thyroid, and hormonal disorders",
    icon: "/Specialities icons/Diabetology.svg",
    image: "/Specialities icons/Nephrology.jpeg",
    stat: { value: "5K+", label: "Endocrine Cases" },
  },
  {
    slug: "general-surgery",
    name: "General & Laparoscopic Surgery",
    shortName: "General Surgery",
    category: "Surgical",
    tagline: "Expert surgical care with minimally invasive approaches",
    icon: "/Specialities icons/General Surgery.svg",
    image: "/Specialities icons/General Surgery.jpeg",
    video: "/Specialities icons/General Surgery.mp4",
    stat: { value: "8.5K+", label: "Surgeries Performed" },
  },
];

export const SPECIALITY_CATEGORIES: string[] = [
  "All",
  ...Array.from(new Set(ALL_SPECIALITIES.map((s) => s.category))),
];

// ─── SPECIALITY DETAIL DATA ───────────────────────────────────────────────────

const SPECIALITY_DETAILS: Record<string, SpecialityDetail> = {
  // ── Cardiology ──────────────────────────────────────────────────────────────
  // [DEMO CONTENT — Replace with approved NH editorial content before production]
  cardiology: {
    slug: "cardiology",
    name: "Cardiology & Cardiac Surgery",
    shortName: "Cardiology",
    category: "Heart & Vascular",
    tagline: "Comprehensive heart care — from prevention to complex interventions",
    icon: "/Specialities icons/Cardiology.svg",
    image: "/Specialities icons/Cardiology.jpeg",
    video: "/Specialities icons/Cardiology.mp4",
    stat: { value: "5K+", label: "Cardiac Surgeries" },

    overviewParagraphs: [
      "Narayana Health's Cardiac Sciences programme is one of the largest and most advanced cardiac care networks in India, with dedicated cardiac centres across 25+ hospitals. Our team of cardiologists, cardiac surgeons, and allied specialists provide the full spectrum of heart care — from non-invasive diagnostics and preventive cardiology to complex interventional procedures and open-heart surgery.",
      "Our centres are equipped with state-of-the-art catheterisation laboratories, hybrid operating rooms, and advanced imaging systems. We treat the complete range of heart conditions in adults and children, including coronary artery disease, structural heart disease, arrhythmias, heart failure, and congenital heart defects.",
    ],

    conditions: [
      { name: "Coronary Artery Disease" },
      { name: "Heart Failure" },
      { name: "Valvular Heart Disease" },
      { name: "Arrhythmias & Electrophysiology" },
      { name: "Congenital Heart Disease" },
      { name: "Cardiomyopathy" },
      { name: "Aortic Diseases" },
      { name: "Peripheral Vascular Disease" },
      { name: "Hypertensive Heart Disease" },
      { name: "Pericardial Disease" },
    ],

    procedureGroups: [
      {
        group: "Interventional",
        items: [
          "Coronary Angiography & Angioplasty",
          "Stenting (BMS & DES)",
          "Balloon Valvuloplasty",
          "TAVR / TAVI",
          "ASD / VSD Device Closure",
          "Pacemaker Implantation",
          "ICD & CRT-D Implantation",
          "Cardiac Ablation",
        ],
      },
      {
        group: "Surgical",
        items: [
          "Coronary Artery Bypass Grafting (CABG)",
          "Valve Repair & Replacement",
          "Aortic Surgery",
          "Heart Transplantation",
          "Ventricular Assist Device (VAD)",
          "Congenital Heart Surgery",
          "Minimally Invasive Cardiac Surgery",
        ],
      },
      {
        group: "Diagnostic",
        items: [
          "Echocardiography (2D, 3D, TEE)",
          "Stress Testing (TMT)",
          "Holter Monitoring",
          "CT Coronary Angiography",
          "Cardiac MRI",
          "Nuclear Cardiology (SPECT, PET)",
          "Electrophysiology Study",
        ],
      },
    ],

    highlights: [
      {
        iconName: "Heart",
        title: "High-Volume Cardiac Programme",
        desc: "One of India's highest-volume cardiac care networks, with thousands of complex procedures performed annually across our centres.",
      },
      {
        iconName: "Microscope",
        title: "Advanced Interventional Labs",
        desc: "State-of-the-art catheterisation laboratories and hybrid operating rooms equipped for the most complex cardiac interventions.",
      },
      {
        iconName: "Users",
        title: "Multidisciplinary Heart Team",
        desc: "Every complex case is evaluated by a dedicated Heart Team — cardiologists, cardiac surgeons, imaging specialists, and anaesthesiologists.",
      },
      {
        iconName: "Shield",
        title: "Affordable Excellence",
        desc: "World-class cardiac care delivered at a fraction of the cost compared to Western institutions — without compromise on quality or outcomes.",
      },
      {
        iconName: "Baby",
        title: "Paediatric Cardiac Care",
        desc: "Specialised facilities and surgeons for congenital heart disease in newborns, infants, and children.",
      },
      {
        iconName: "Clock",
        title: "24/7 Cardiac Emergency",
        desc: "Round-the-clock cardiac emergency services with dedicated rapid response teams for heart attacks and acute cardiac events.",
      },
    ],

    doctors: [
      {
        id: "dr-1",
        name: "Dr. Rajiv Menon",
        subSpeciality: "Interventional Cardiology",
        experienceYears: "22 Years",
        rating: 4.9,
        img: "/assets/doctor_1.png",
      },
    ],
  },
};

// ─── Public API ───────────────────────────────────────────────────────────────

export function getSpecialityDetail(slug: string): SpecialityDetail | null {
  return SPECIALITY_DETAILS[slug] ?? null;
}

export function getSpecialityMeta(slug: string): SpecialityMeta | null {
  return ALL_SPECIALITIES.find((s) => s.slug === slug) ?? null;
}
