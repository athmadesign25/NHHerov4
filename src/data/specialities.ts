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
  detailVideo?: string;
  stat: { value: string; label: string };
  keyConditions?: string[];
  doctorCount?: number;
  isCoE?: boolean;
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
    tagline: "Comprehensive heart care — from preventive cardiology to complex cardiac surgery",
    icon: "/Specialities icons/Cardiology.svg",
    image: "/Specialities icons/Cardiology.jpeg",
    video: "/Specialities icons/Cardiology.mp4",
    stat: { value: "5K+", label: "Cardiac Surgeries" },
    keyConditions: ["Heart Attack", "CAD", "Angioplasty", "Bypass Surgery", "Arrhythmia", "Heart Failure"],
    doctorCount: 180,
    isCoE: true,
  },
  {
    slug: "oncology",
    name: "Cancer Care (Oncology)",
    shortName: "Cancer Care",
    category: "Cancer Care",
    tagline: "Comprehensive oncology with precision diagnostics, immunotherapy, and surgical excellence",
    icon: "/Specialities icons/Cancercare.svg",
    image: "/Specialities icons/Cancer Care.jpeg",
    video: "/Specialities icons/Cancer Care.mp4",
    detailVideo: "/Specialities icons/Cancer Care Detail.mp4",
    stat: { value: "10K+", label: "Patients Treated" },
    keyConditions: ["Breast Cancer", "Lung Cancer", "Chemotherapy", "Radiation Oncology", "Immunotherapy", "Surgical Oncology"],
    doctorCount: 220,
    isCoE: true,
  },
  {
    slug: "neurology",
    name: "Neurology & Neurosurgery",
    shortName: "Neurology",
    category: "Brain & Spine",
    tagline: "Advanced neurological treatments, stroke emergency care, and minimally invasive brain surgery",
    icon: "/Specialities icons/Neurology.svg",
    image: "/Specialities icons/Neurology.jpeg",
    video: "/Specialities icons/Neurology.mp4",
    stat: { value: "3K+", label: "Neuro Surgeries" },
    keyConditions: ["Brain Tumor", "Stroke Care", "Epilepsy", "Spine Surgery", "Parkinson's", "Migraine"],
    doctorCount: 140,
    isCoE: true,
  },
  {
    slug: "orthopaedics",
    name: "Orthopaedics & Joint Replacement",
    shortName: "Orthopaedics",
    category: "Bones & Joints",
    tagline: "Robotic joint replacement, arthroscopy, sports injury rehabilitation, and trauma care",
    icon: "/Specialities icons/Orthopaedics.svg",
    image: "/Specialities icons/Orthopedics.jpeg",
    video: "/Specialities icons/Orthopedics.mp4",
    stat: { value: "8K+", label: "Joint Replacements" },
    keyConditions: ["Knee Replacement", "Hip Replacement", "Arthritis", "Sports Injuries", "Fracture Care", "Spine Disorders"],
    doctorCount: 210,
    isCoE: true,
  },
  {
    slug: "nephrology",
    name: "Nephrology & Renal Transplant",
    shortName: "Nephrology",
    category: "Kidney & Urology",
    tagline: "Advanced kidney disease management, high-volume dialysis, and kidney transplants",
    icon: "/Specialities icons/Nephrology.svg",
    image: "/Specialities icons/Nephrology.jpeg",
    video: "/Specialities icons/Nephrology.mp4",
    stat: { value: "2K+", label: "Kidney Transplants" },
    keyConditions: ["Kidney Failure", "Dialysis", "Renal Transplant", "Chronic Kidney Disease", "Proteinuria", "Polycystic Kidney"],
    doctorCount: 95,
    isCoE: true,
  },
  {
    slug: "gastroenterology",
    name: "Gastroenterology & Hepatology",
    shortName: "Gastroenterology",
    category: "Digestive Health",
    tagline: "Comprehensive digestive, liver, biliary tract, and endoscopic therapeutic services",
    icon: "/Specialities icons/Gastro.svg",
    image: "/Specialities icons/Gastroenterology.jpeg",
    video: "/Specialities icons/Gastroenterology.mp4",
    stat: { value: "15K+", label: "Endoscopies Done" },
    keyConditions: ["Liver Cirrhosis", "GERD & Acidity", "Gallstones", "IBD / Crohn's", "Endoscopy", "Fatty Liver"],
    doctorCount: 160,
    isCoE: true,
  },
  {
    slug: "paediatrics",
    name: "Paediatrics & Neonatology",
    shortName: "Paediatrics",
    category: "Women & Children",
    tagline: "Dedicated neonatal intensive care (NICU) and multispecialty child healthcare",
    icon: "/Specialities icons/Paedratic.svg",
    image: "/Specialities icons/Paediatrics.jpeg",
    video: "/Specialities icons/Paediatrics.mp4",
    stat: { value: "12K+", label: "Children Treated" },
    keyConditions: ["NICU Care", "Pediatric Surgery", "Congenital Anomalies", "Growth & Nutrition", "Vaccinations", "Asthma in Kids"],
    doctorCount: 130,
    isCoE: true,
  },
  {
    slug: "pulmonology",
    name: "Pulmonology & Respiratory Medicine",
    shortName: "Pulmonology",
    category: "Respiratory",
    tagline: "Specialised diagnostic bronchoscopy, asthma, COPD, and sleep apnea management",
    icon: "/Specialities icons/Pulmonology.svg",
    image: "/Specialities icons/Pulmonology.jpeg",
    video: "/Specialities icons/Pulmonology.mp4",
    stat: { value: "4.5K+", label: "Respiratory Cases" },
    keyConditions: ["Asthma", "COPD", "Pneumonia", "Sleep Apnea", "Interstitial Lung Disease", "Bronchoscopy"],
    doctorCount: 85,
    isCoE: true,
  },
  {
    slug: "gynaecology",
    name: "Obstetrics & Gynaecology",
    shortName: "Gynaecology",
    category: "Women & Children",
    tagline: "High-risk pregnancy management, painless deliveries, and laparoscopic gynaecologic surgery",
    icon: "/Specialities icons/Gynaecology.svg",
    image: "/Specialities icons/Cancer Care.jpeg",
    stat: { value: "6K+", label: "Deliveries Annually" },
    keyConditions: ["High-Risk Pregnancy", "PCOS / PCOD", "Fibroids", "Infertility", "Laparoscopic Hysterectomy", "Menopause"],
    doctorCount: 175,
  },
  {
    slug: "urology",
    name: "Urology & Andrology",
    shortName: "Urology",
    category: "Kidney & Urology",
    tagline: "Laser kidney stone removal, robotic prostate surgery, and urinary tract reconstruction",
    icon: "/Specialities icons/Urology.svg",
    image: "/Specialities icons/Urology.jpeg",
    video: "/Specialities icons/Urology.mp4",
    stat: { value: "6K+", label: "Urological Procedures" },
    keyConditions: ["Kidney Stones", "Prostate Enlargement (BPH)", "Laser Stone Removal", "UTI", "Erectile Dysfunction", "Bladder Cancer"],
    doctorCount: 110,
  },
  {
    slug: "endocrinology",
    name: "Endocrinology & Diabetology",
    shortName: "Endocrinology",
    category: "Metabolic & Hormonal",
    tagline: "Specialised clinical care for diabetes complications, thyroid, and hormonal balance",
    icon: "/Specialities icons/Diabetology.svg",
    image: "/Specialities icons/Endocrinology.jpeg",
    video: "/Specialities icons/Endocrinology.mp4",
    stat: { value: "5K+", label: "Endocrine Cases" },
    keyConditions: ["Type 1 & 2 Diabetes", "Thyroid Disorders", "Obesity & Metabolism", "Osteoporosis", "Adrenal Conditions", "Pituitary"],
    doctorCount: 70,
  },
  {
    slug: "general-surgery",
    name: "General & Laparoscopic Surgery",
    shortName: "General Surgery",
    category: "Surgical",
    tagline: "State-of-the-art minimally invasive surgeries for abdominal, hernia, and soft tissue conditions",
    icon: "/Specialities icons/General Surgery.svg",
    image: "/Specialities icons/General Surgery.jpeg",
    video: "/Specialities icons/General Surgery.mp4",
    stat: { value: "8.5K+", label: "Surgeries Performed" },
    keyConditions: ["Hernia Repair", "Gallbladder Removal", "Appendectomy", "Piles & Fistula", "Trauma Surgery", "Laparoscopy"],
    doctorCount: 190,
  },
  {
    slug: "haematology-bmt",
    name: "Bone Marrow Transplant & Haematology",
    shortName: "BMT & Haematology",
    category: "Cancer Care",
    tagline: "Nation's premier bone marrow transplant unit for leukaemia, lymphoma, and sickle cell disease",
    icon: "/Specialities icons/Transplants.svg",
    image: "/Specialities icons/Cancer Care.jpeg",
    stat: { value: "300+", label: "BMTs Yearly" },
    keyConditions: ["Leukaemia", "Lymphoma", "Multiple Myeloma", "Aplastic Anaemia", "Thalassemia", "CAR-T Therapy"],
    doctorCount: 65,
    isCoE: true,
  },
  {
    slug: "dermatology",
    name: "Dermatology & Cosmetology",
    shortName: "Dermatology",
    category: "Skin & Aesthetics",
    tagline: "Expert medical dermatology, laser therapies, hair restoration, and aesthetic skin care",
    icon: "/Specialities icons/General Medicine.svg",
    image: "/Specialities icons/Nephrology.jpeg",
    stat: { value: "18K+", label: "Derm Consultations" },
    keyConditions: ["Psoriasis", "Eczema & Dermatitis", "Acne & Scar Treatment", "Hair Loss / Alopecia", "Vitiligo", "Skin Allergies"],
    doctorCount: 80,
  },
  {
    slug: "ent",
    name: "ENT (Ear, Nose & Throat)",
    shortName: "ENT",
    category: "Head & Neck",
    tagline: "Cochlear implants, endoscopic sinus surgery, voice rehabilitation, and hearing care",
    icon: "/Specialities icons/Pulmonology.svg",
    image: "/Specialities icons/Pulmonology.jpeg",
    stat: { value: "9K+", label: "ENT Procedures" },
    keyConditions: ["Sinusitis", "Hearing Loss", "Cochlear Implantation", "Tonsillitis", "Deviated Septum", "Vertigo"],
    doctorCount: 90,
  },
  {
    slug: "ophthalmology",
    name: "Ophthalmology (Eye Care)",
    shortName: "Ophthalmology",
    category: "Eye Care",
    tagline: "Advanced cataract surgery, refractive laser correction, retinal interventions, and glaucoma care",
    icon: "/Specialities icons/Neurology.svg",
    image: "/Specialities icons/Neurology.jpeg",
    stat: { value: "14K+", label: "Eye Surgeries" },
    keyConditions: ["Cataract Surgery", "Glaucoma", "Diabetic Retinopathy", "LASIK & SMILE", "Corneal Transplant", "Macular Degeneration"],
    doctorCount: 85,
  },
  {
    slug: "rheumatology",
    name: "Rheumatology & Clinical Immunology",
    shortName: "Rheumatology",
    category: "Bones & Joints",
    tagline: "Specialised management of autoimmune conditions, systemic lupus, and inflammatory arthritis",
    icon: "/Specialities icons/Gastro.svg",
    image: "/Specialities icons/Rheumatology.jpeg",
    video: "/Specialities icons/Rheumatology.mp4",
    stat: { value: "3.5K+", label: "Autoimmune Patients" },
    keyConditions: ["Rheumatoid Arthritis", "Lupus (SLE)", "Ankylosing Spondylitis", "Gout", "Scleroderma", "Vasculitis"],
    doctorCount: 45,
  },
  {
    slug: "liver-transplant",
    name: "Liver Transplant & HPB Surgery",
    shortName: "Liver Transplant",
    category: "Transplants",
    tagline: "Living donor and deceased donor liver transplants with internationally benchmarked survival rates",
    icon: "/Specialities icons/Liver Transplant.svg",
    image: "/Specialities icons/Gastroenterology.jpeg",
    stat: { value: "1.2K+", label: "Liver Transplants" },
    keyConditions: ["Liver Failure", "Living Donor Transplant", "Biliary Atresia", "Liver Tumors", "Pancreatic Cancer", "Portal Hypertension"],
    doctorCount: 55,
    isCoE: true,
  },
  {
    slug: "vascular-surgery",
    name: "Vascular & Endovascular Surgery",
    shortName: "Vascular Surgery",
    category: "Heart & Vascular",
    tagline: "Comprehensive arterial and venous interventions, aneurysm repairs, and diabetic foot care",
    icon: "/Specialities icons/Cardiac Science.svg",
    image: "/Specialities icons/Cardiology.jpeg",
    stat: { value: "4K+", label: "Vascular Interventions" },
    keyConditions: ["Varicose Veins", "Aortic Aneurysm", "Deep Vein Thrombosis (DVT)", "Diabetic Foot Care", "Peripheral Artery Disease", "Carotid Artery Disease"],
    doctorCount: 60,
  },
  {
    slug: "psychiatry",
    name: "Psychiatry & Behavioral Health",
    shortName: "Psychiatry",
    category: "Mind & Health",
    tagline: "Compassionate psychiatric evaluations, psychotherapy, mood disorder management, and neurodevelopment",
    icon: "/Specialities icons/Neurology.svg",
    image: "/Specialities icons/Neurology.jpeg",
    stat: { value: "8K+", label: "Counseling Sessions" },
    keyConditions: ["Depression", "Anxiety Disorders", "Bipolar Disorder", "Schizophrenia", "Sleep Disorders", "ADHD"],
    doctorCount: 50,
  },
  {
    slug: "critical-care",
    name: "Critical Care & Emergency Medicine",
    shortName: "Critical Care",
    category: "Emergency & ICU",
    tagline: "24/7 Level 1 Trauma Center, advanced ICUs, ECMO support, and rapid emergency response",
    icon: "/Specialities icons/General Medicine.svg",
    image: "/Specialities icons/General Surgery.jpeg",
    stat: { value: "24/7", label: "Emergency Response" },
    keyConditions: ["Trauma Resuscitation", "Sepsis Management", "ECMO Life Support", "Acute Respiratory Failure", "Multi-Organ Dysfunction", "Toxicology"],
    doctorCount: 150,
  },
  {
    slug: "plastic-surgery",
    name: "Plastic & Reconstructive Surgery",
    shortName: "Plastic Surgery",
    category: "Surgical",
    tagline: "Microsurgical reconstruction, post-trauma repairs, burn rehabilitation, and cosmetic procedures",
    icon: "/Specialities icons/Orthopaedics.svg",
    image: "/Specialities icons/Orthopedics.jpeg",
    stat: { value: "2.5K+", label: "Reconstructive Surgeries" },
    keyConditions: ["Burn Reconstruction", "Microvascular Surgery", "Cleft Lip & Palate", "Cosmetic Enhancements", "Hand Reconstruction", "Scar Revision"],
    doctorCount: 40,
  },
  {
    slug: "anaesthesia",
    name: "Anaesthesiology & Pain Medicine",
    shortName: "Anaesthesia",
    category: "Surgical",
    tagline: "High-risk surgical anaesthesia, neuroanaesthesia, regional nerve blocks, and chronic pain clinics",
    icon: "/Specialities icons/Neurology.svg",
    image: "/Specialities icons/Neurology.jpeg",
    stat: { value: "45K+", label: "Anaesthetic Cases" },
    keyConditions: ["Chronic Back Pain", "Surgical Sedation", "Cancer Pain Management", "Epidural Analgesia", "Nerve Blocks", "ICU Sedation"],
    doctorCount: 110,
  },
  {
    slug: "internal-medicine",
    name: "Internal Medicine & Infectious Diseases",
    shortName: "Internal Medicine",
    category: "General Medicine",
    tagline: "Holistic multi-system diagnosis, adult health preservation, fever clinics, and geriatric care",
    icon: "/Specialities icons/General Medicine.svg",
    image: "/Specialities icons/Nephrology.jpeg",
    stat: { value: "35K+", label: "Outpatients Yearly" },
    keyConditions: ["Fever of Unknown Origin", "Hypertension", "Infectious Diseases", "Geriatric Care", "Preventive Health Checkups", "Metabolic Syndrome"],
    doctorCount: 130,
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


export const specialitiesData = [
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
    image: "/Specialities icons/Oncology.svg",
    keywords: ["cancer", "tumor", "chemotherapy", "radiation", "lump", "biopsy", "oncologist", "cancer specialist", "carcinoma"] 
  },
  { 
    name: "Orthopaedics", 
    slug: "orthopaedics",
    image: "/Specialities icons/Orthopaedics.svg",
    keywords: ["bone", "joint", "fracture", "knee", "hip", "arthritis", "spine", "ortho", "back pain", "orthopedist", "orthopedic surgeon"] 
  },
  { 
    name: "Gastroenterology", 
    slug: "gastroenterology",
    image: "/Specialities icons/Gastro.svg",
    keywords: ["stomach", "digestion", "liver", "acid", "ulcer", "intestine", "gallbladder", "piles", "fistula", "gastro", "gastric", "gastroenterologist"] 
  },
  { 
    name: "Urology", 
    slug: "urology",
    image: "/Specialities icons/Urology.svg",
    keywords: ["kidney stone", "urine", "bladder", "prostate", "uti", "urologist", "urine infection", "dialysis"] 
  },
  { 
    name: "Pulmonology", 
    slug: "pulmonology",
    image: "/Specialities icons/Pulmonology.svg",
    keywords: ["lung", "breathing", "asthma", "tb", "cough", "respiratory", "pulmonologist", "chest specialist"] 
  },
  { 
    name: "Endocrinology", 
    slug: "endocrinology",
    image: "/Specialities icons/Diabetology.svg",
    keywords: ["diabetes", "thyroid", "sugar", "hormone", "pcos", "obesity", "endocrinologist", "sugar specialist"] 
  },
  { 
    name: "Gynecology", 
    slug: "gynecology",
    image: "/Specialities icons/Gynaecology.svg",
    keywords: ["pregnancy", "period", "uterus", "pcos", "women", "maternity", "delivery", "gynecologist", "obgyn"] 
  },
  { 
    name: "Pediatrics", 
    slug: "pediatrics",
    image: "/Specialities icons/Paedratic.svg",
    keywords: ["child", "baby", "vaccination", "infant", "kids", "pediatrician", "child specialist"] 
  },
  { 
    name: "Dermatology", 
    slug: "dermatology",
    image: "/Specialities icons/Orthopaedics.svg",
    keywords: ["skin", "hair", "acne", "rash", "allergy", "pimples", "dermatologist", "skin specialist"] 
  },
  { 
    name: "Ophthalmology", 
    slug: "ophthalmology",
    image: "/Specialities icons/Neurology.svg",
    keywords: ["eye", "vision", "cataract", "glaucoma", "lasik", "ophthalmologist", "eye specialist"] 
  },
  { 
    name: "ENT", 
    slug: "ent",
    image: "/Specialities icons/Pulmonology.svg",
    keywords: ["ear", "nose", "throat", "sinus", "tonsils", "hearing", "ent specialist"] 
  },
  { 
    name: "Psychiatry", 
    slug: "psychiatry",
    image: "/Specialities icons/Neurology.svg",
    keywords: ["mental", "depression", "anxiety", "stress", "sleep", "psychiatrist", "psychologist"] 
  }
];

export const popularTags = ["chest pain", "cancer", "surgery", "liver"];


export const COE_SPECIALITIES = [
  {
    name: "Cardiology & Cardiac Surgery",
    href: "/specialities/cardiology",
    icon: "/Specialities icons/Cardiology.svg",
    img: "/Specialities icons/Cardiology.jpeg",
    video: "/Specialities icons/Cardiology.mp4",
    stats: { value: "5K+", label: "Cardiac Surgeries Performed" },
  },
  {
    name: "Cancer Care",
    href: "/specialities/oncology",
    icon: "/Specialities icons/Cancercare.svg",
    img: "/Specialities icons/Cancer Care.jpeg",
    video: "/Specialities icons/Cancer Care.mp4",
    stats: { value: "10K+", label: "Oncology Patients Treated" },
  },
  {
    name: "Neurology & Neurosurgery",
    href: "/specialities/neurology",
    icon: "/Specialities icons/Neurology.svg",
    img: "/Specialities icons/Neurology.jpeg",
    video: "/Specialities icons/Neurology.mp4",
    stats: { value: "3K+", label: "Neuro Surgeries Performed" },
  },
  {
    name: "Orthopaedics",
    href: "/specialities/orthopaedics",
    icon: "/Specialities icons/Orthopaedics.svg",
    img: "/Specialities icons/Orthopedics.jpeg",
    video: "/Specialities icons/Orthopedics.mp4",
    stats: { value: "8K+", label: "Joint Replacements" },
  },
  {
    name: "Nephrology & Transplant",
    href: "/specialities/nephrology",
    icon: "/Specialities icons/Nephrology.svg",
    img: "/Specialities icons/Nephrology.jpeg",
    video: "/Specialities icons/Nephrology.mp4",
    stats: { value: "2K+", label: "Kidney Transplants" },
  },
  {
    name: "Gastroenterology",
    href: "/specialities/gastroenterology",
    icon: "/Specialities icons/Gastro.svg",
    img: "/Specialities icons/Gastroenterology.jpeg",
    video: "/Specialities icons/Gastroenterology.mp4",
    stats: { value: "15K+", label: "Endoscopies Performed" },
  },
  {
    name: "Pulmonology",
    href: "/specialities/pulmonology",
    icon: "/Specialities icons/Cardiology.svg",
    img: "/Specialities icons/Cardiology.jpeg",
    video: "/Specialities icons/Cardiology.mp4",
    stats: { value: "4.5K+", label: "Respiratory Cases" },
  },
  {
    name: "Paediatrics",
    href: "/specialities/paediatrics",
    icon: "/Specialities icons/Cancercare.svg",
    img: "/Specialities icons/Cancer Care.jpeg",
    video: "/Specialities icons/Cancer Care.mp4",
    stats: { value: "12K+", label: "Children Treated" },
  },
  {
    name: "General Surgery",
    href: "/specialities/general-surgery",
    icon: "/Specialities icons/Neurology.svg",
    img: "/Specialities icons/Neurology.jpeg",
    video: "/Specialities icons/Neurology.mp4",
    stats: { value: "8.5K+", label: "Surgeries Performed" },
  },
  {
    name: "Urology",
    href: "/specialities/urology",
    icon: "/Specialities icons/Orthopaedics.svg",
    img: "/Specialities icons/Orthopedics.jpeg",
    video: "/Specialities icons/Orthopedics.mp4",
    stats: { value: "6K+", label: "Urological Procedures" },
  },
  {
    name: "Endocrinology",
    href: "/specialities/endocrinology",
    icon: "/Specialities icons/Nephrology.svg",
    img: "/Specialities icons/Nephrology.jpeg",
    video: "/Specialities icons/Nephrology.mp4",
    stats: { value: "5K+", label: "Endocrine Cases" },
  },
  {
    name: "Rheumatology",
    href: "/specialities/rheumatology",
    icon: "/Specialities icons/Gastro.svg",
    img: "/Specialities icons/Gastroenterology.jpeg",
    video: "/Specialities icons/Gastroenterology.mp4",
    stats: { value: "3.5K+", label: "Rheumatology Patients" },
  }
];

