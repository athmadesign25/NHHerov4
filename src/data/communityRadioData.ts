export interface RadioEpisode {
  id: string;
  title: string;
  category: string;
  categorySlug: string;
  doctor: string;
  doctorRole: string;
  duration: string;
  airDate: string;
  language: string;
  summary: string;
  image: string;
  spotifyUrl: string;
  appleUrl: string;
  isFeatured?: boolean;
  listenCount: string;
}

export interface RadioBroadcaster {
  name: string;
  role: string;
  experience: string;
  hospital: string;
  image: string;
  episodesCount: number;
}

export interface RadioCategoryItem {
  id: string;
  name: string;
  icon: string;
  slugMatch: string[];
}

export const COMMUNITY_RADIO_HERO = {
  breadcrumbs: [
    { label: "Home", href: "/" },
    { label: "Community Radio" },
  ],
  title: "Community Waves Broadcasting Initiatives",
  subtitle:
    "Explore doctor-curated radio broadcasts, clinical wellness masterclasses, and community health explainers on Namma Naadi 90.4 FM and leading podcast networks.",
  image: "/images/csr/community_radio_hero_v4.jpg",
  stats: [
    { value: "90.4 FM", label: "Broadcast Frequency" },
    { value: "400K+", label: "Active Daily Listeners" },
    { value: "14 Hrs", label: "Daily Public Health Airtime" },
    { value: "8,500+", label: "Episodes & Bulletins Produced" },
  ],
};

export const RADIO_CATEGORIES: RadioCategoryItem[] = [
  { id: "all", name: "All Topics", icon: "/Specialities icons/General Surgery.jpeg", slugMatch: [] },
  { id: "cardiology", name: "Cardiology", icon: "/Specialities icons/Cardiology.jpeg", slugMatch: ["cardiology", "heart"] },
  { id: "paediatrics", name: "Paediatrics", icon: "/Specialities icons/Paediatrics.jpeg", slugMatch: ["paediatrics", "pediatric", "child"] },
  { id: "oncology", name: "Oncology", icon: "/Specialities icons/Cancer Care.jpeg", slugMatch: ["oncology", "cancer"] },
  { id: "neurology", name: "Neurology", icon: "/Specialities icons/Neurology.jpeg", slugMatch: ["neurology", "mental", "brain"] },
  { id: "orthopaedics", name: "Orthopaedics", icon: "/Specialities icons/Orthopedics.jpeg", slugMatch: ["orthopaedics", "orthopedics", "bones"] },
  { id: "diabetes", name: "Diabetes & Diet", icon: "/Specialities icons/Endocrinology.jpeg", slugMatch: ["endocrinology", "diabetes", "diet"] },
  { id: "community", name: "Community Health", icon: "/Specialities icons/General Medicine.jpeg", slugMatch: ["community", "sanitation", "rural"] },
];

export const RADIO_EPISODES: RadioEpisode[] = [
  {
    id: "preventive-cardiology-signs",
    title: "Preventive Cardiology & Early Heart Attack Warning Signs",
    category: "Cardiology",
    categorySlug: "cardiology",
    doctor: "Dr. Devi Prasad Shetty",
    doctorRole: "Chairman & Senior Cardiac Surgeon",
    duration: "28 mins",
    airDate: "November 2026",
    language: "Kannada & English",
    summary:
      "Recognizing subtle chest tightness, the golden hour in acute cardiac emergencies, and everyday diet habits to prevent early-onset heart attacks in working populations.",
    image: "/images/articles/blog_heart_health.png",
    spotifyUrl: "https://open.spotify.com",
    appleUrl: "https://podcasts.apple.com",
    isFeatured: true,
    listenCount: "42.8K plays",
  },
  {
    id: "maternal-nutrition-1000-days",
    title: "Maternal Nutrition & The Vital First 1,000 Days of Child Care",
    category: "Paediatrics",
    categorySlug: "paediatrics",
    doctor: "Dr. Shreedhara C",
    doctorRole: "Senior Consultant Pediatrician, NH Health City",
    duration: "24 mins",
    airDate: "October 2026",
    language: "Kannada",
    summary:
      "Essential iron, calcium, and protein requirements for expectant mothers in rural communities, tracking infant growth milestones, and dispelling neonatal feeding myths.",
    image: "/images/csr/csr-pediatric-cardiac.jpg",
    spotifyUrl: "https://open.spotify.com",
    appleUrl: "https://podcasts.apple.com",
    isFeatured: true,
    listenCount: "31.4K plays",
  },
  {
    id: "youth-mental-wellness-anxiety",
    title: "Youth Mental Wellness & Exam Anxiety De-escalation",
    category: "Neurology",
    categorySlug: "neurology",
    doctor: "Dr. Priya Sharma",
    doctorRole: "Consultant Psychiatrist & Adolescent Counselor",
    duration: "26 mins",
    airDate: "October 2026",
    language: "Kannada & English",
    summary:
      "Practical coping strategies for students in high schools and colleges facing academic stress, overcoming social stigma, and building emotional resilience.",
    image: "/images/csr/csr-education.jpg",
    spotifyUrl: "https://open.spotify.com",
    appleUrl: "https://podcasts.apple.com",
    isFeatured: true,
    listenCount: "38.2K plays",
  },
  {
    id: "cancer-early-detection",
    title: "Cancer Awareness: Early Warning Signals & Mobile Mammography",
    category: "Oncology",
    categorySlug: "oncology",
    doctor: "Dr. Vikram Belliappa",
    doctorRole: "Consultant Surgical Oncologist",
    duration: "30 mins",
    airDate: "September 2026",
    language: "Kannada & English",
    summary:
      "Dispelling cancer fears, identifying non-healing ulcers or abnormal lumps early, and how rural communities can access free digital mammography screening vans.",
    image: "/images/articles/blog_cancer_care.png",
    spotifyUrl: "https://open.spotify.com",
    appleUrl: "https://podcasts.apple.com",
    isFeatured: true,
    listenCount: "29.7K plays",
  },
  {
    id: "hypertension-diabetes-agrarian",
    title: "Managing Hypertension & Diabetes in Agrarian and Factory Belts",
    category: "Diabetes & Diet",
    categorySlug: "diabetes",
    doctor: "Dr. Rajesh Kumar",
    doctorRole: "Senior Consultant Physician, Internal Medicine",
    duration: "22 mins",
    airDate: "September 2026",
    language: "Kannada",
    summary:
      "Practical lifestyle adjustments for farmers and factory workers in Bommasandra to control blood sugar, manage blood pressure, and avoid silent kidney damage.",
    image: "/images/articles/sugar_free_sweets_diwali.jpg",
    spotifyUrl: "https://open.spotify.com",
    appleUrl: "https://podcasts.apple.com",
    isFeatured: false,
    listenCount: "24.1K plays",
  },
  {
    id: "pediatric-immunization-fevers",
    title: "Child Immunization Schedules & Managing Monsoon Fevers at Home",
    category: "Paediatrics",
    categorySlug: "paediatrics",
    doctor: "Dr. Ananya Rao",
    doctorRole: "Pediatric Critical Care Specialist",
    duration: "19 mins",
    airDate: "August 2026",
    language: "Kannada & English",
    summary:
      "Demystifying childhood vaccinations, home management of high fever in toddlers, recognizing dengue warning signs, and when to seek emergency hospital triage.",
    image: "/images/csr/csr-health-camps.jpg",
    spotifyUrl: "https://open.spotify.com",
    appleUrl: "https://podcasts.apple.com",
    isFeatured: false,
    listenCount: "20.5K plays",
  },
  {
    id: "ortho-joint-health-workers",
    title: "Ergonomics & Joint Health for Agricultural and Industrial Workers",
    category: "Orthopaedics",
    categorySlug: "orthopaedics",
    doctor: "Dr. Harish Nayak",
    doctorRole: "Senior Consultant Orthopedic Surgeon",
    duration: "25 mins",
    airDate: "August 2026",
    language: "Kannada",
    summary:
      "Preventing chronic lower back pain, knee osteoarthritis, and posture strain among workers in Bommasandra factories and rural farming families.",
    image: "/images/articles/blog_joints_bones.png",
    spotifyUrl: "https://open.spotify.com",
    appleUrl: "https://podcasts.apple.com",
    isFeatured: false,
    listenCount: "25.3K plays",
  },
  {
    id: "sanitation-clean-water-dengue",
    title: "Swachha Grama: Safe Drinking Water & Vector-Borne Disease Control",
    category: "Community Health",
    categorySlug: "community",
    doctor: "Dr. Ramesh Babu",
    doctorRole: "Director of Community Health & Preventive Care",
    duration: "21 mins",
    airDate: "July 2026",
    language: "Kannada",
    summary:
      "Community-level water chlorination practices, identifying stagnant mosquito breeding sites around village wells, and coordinated seasonal epidemic preparedness.",
    image: "/images/csr/community_radio_hero_v4.jpg",
    spotifyUrl: "https://open.spotify.com",
    appleUrl: "https://podcasts.apple.com",
    isFeatured: false,
    listenCount: "18.9K plays",
  },
];

export const RADIO_BROADCASTERS: RadioBroadcaster[] = [
  {
    name: "Dr. Devi Prasad Shetty",
    role: "Chairman & Senior Cardiac Surgeon",
    experience: "35+ Years Experience",
    hospital: "Narayana Institute of Cardiac Sciences, Bangalore",
    image: "/doctor_patient.png",
    episodesCount: 18,
  },
  {
    name: "Dr. Shreedhara C",
    role: "Senior Consultant - Paediatrics & Child Health",
    experience: "22+ Years Experience",
    hospital: "Narayana Health City, Bangalore",
    image: "/assets/doctor_1.png",
    episodesCount: 14,
  },
  {
    name: "Dr. Priya Sharma",
    role: "Consultant - Psychiatry & Adolescent Counseling",
    experience: "16+ Years Experience",
    hospital: "Mazumdar Shaw Medical Centre, Bangalore",
    image: "/assets/doctor_2.png",
    episodesCount: 11,
  },
  {
    name: "Dr. Vikram Belliappa",
    role: "Consultant - Surgical Oncology & Cancer Care",
    experience: "19+ Years Experience",
    hospital: "Mazumdar Shaw Medical Centre, Bangalore",
    image: "/assets/doctor_3.png",
    episodesCount: 9,
  },
];
