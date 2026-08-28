export const popularTags = ["chest pain", "cancer", "surgery", "liver"];

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

export type DoctorData = {
  name: string;
  speciality: string;
  location: string;
  hospital: string;
  additionalHospitals?: number;
  photo: string;
  keywords: string[];
  consultationModes?: "hospital" | "video" | "both";
  availability?: { hospital?: string; video?: string };
};

export const doctorsData: DoctorData[] = [
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
    name: "Dr. Amit Bansal",
    speciality: "Cardiology",
    location: "Mumbai",
    hospital: "NH Children's Hospital, Mumbai",
    photo: "/assets/doctor_1.png",
    keywords: ["cardiology", "heart", "amit", "bansal", "doctor", "specialist", "cardiologist"]
  },
  {
    name: "Dr. Kavita Reddy",
    speciality: "Cardiology",
    location: "Bengaluru",
    hospital: "Narayana Institute of Cardiac Sciences, Bangalore",
    photo: "/assets/doctor_2.png",
    keywords: ["cardiology", "heart", "kavita", "reddy", "doctor", "specialist", "cardiologist"]
  },
  {
    name: "Dr. Sameer Desai",
    speciality: "Cardiology",
    location: "Guwahati",
    hospital: "Narayana Superspeciality Hospital, Guwahati",
    photo: "/assets/doctor_3.png",
    keywords: ["cardiology", "heart", "sameer", "desai", "doctor", "specialist", "cardiologist"]
  },
  {
    name: "Dr. Ananya Singh",
    speciality: "Cardiology",
    location: "Kolkata",
    hospital: "Narayana Superspeciality Hospital, Howrah, kolkata",
    photo: "/assets/doctor_1.png",
    keywords: ["cardiology", "heart", "ananya", "singh", "doctor", "specialist", "cardiologist"]
  },
  {
    name: "Dr. Vikram Joshi",
    speciality: "Cardiology",
    location: "Bengaluru",
    hospital: "Narayana Multispeciality Hospital, HSR Bangalore",
    photo: "/assets/doctor_2.png",
    keywords: ["cardiology", "heart", "vikram", "joshi", "doctor", "specialist", "cardiologist"]
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

export const getRealtimePulseResponse = (query: string) => {
  return {
    suggestedSpec: "Cardiology",
    suggestedDoc: doctorsData[0],
    empathy: "I understand you are feeling unwell. Let's find a doctor for you.",
    slot: "Today, 4:00 PM",
    recommendedDocs: doctorsData.slice(0, 3)
  };
};

export const doctorRoles = [
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

export const treatmentsData = [
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

export const articlesData = [
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
