export interface FeaturedDoctorItem {
  name: string;
  designation: string;
  experience: string;
  hospital: string;
  image: string;
  bio: string;
  speciality: string;
  expertise: string;
  profileSlug?: string;
}

const ENT_FEATURED_DOCTORS: FeaturedDoctorItem[] = [
  {
    name: "Dr. Rohit Udaya Prasad",
    designation: "Lead Consultant & Head — ENT & Head-Neck Surgery",
    speciality: "ENT & Head-Neck Surgery",
    experience: "24+ yrs",
    expertise: "Endoscopic Sinus Surgery · Cochlear Implants · Micro-Laryngeal & Skull Base Surgery",
    hospital: "Mazumdar Shaw Medical Centre, Bangalore",
    image: "/doctors/doc_vivek.jpg",
    bio: "Dr. Rohit Udaya Prasad is a distinguished surgical authority in otolaryngology and head-neck interventions, serving as Lead Consultant and Head of Department at Narayana Health. Over two decades, he has pioneered advanced micro-ear procedures, auditory rehabilitation programmes, and complex endoscopic skull base surgeries with exemplary clinical precision.\n\nRenowned for his patient-first surgical philosophy, Dr. Prasad champions tissue-sparing endoscopic techniques and organ-preserving protocols that accelerate recovery while protecting vital sensory functions. He collaborates closely with oncology and neurosurgery teams to manage complex sinus conditions, pediatric auditory anomalies, and micro-laryngeal voice disorders.",
    profileSlug: "dr-rohit-udaya-prasad",
  },
];

const CARDIAC_FEATURED_DOCTORS: FeaturedDoctorItem[] = [
  {
    name: "Dr. Devi Prasad Shetty",
    designation: "Founder & Chairman",
    speciality: "Cardiac Surgery",
    experience: "40+ yrs",
    expertise: "Complex Adult & Paediatric Cardiac Surgery · Valve Repairs · Off-Pump CABG",
    hospital: "Narayana Institute of Cardiac Sciences",
    image: "/doctors/doc_devi_shetty.jpg",
    bio: "Dr. Devi Prasad Shetty stands as a visionary force who has not only reshaped healthcare in India but has also transformed the landscape of cardiac surgery. As the Founder and Senior Consultant Cardiac Surgeon at Narayana Health, his strong commitment has propelled world-class clinical care and healthcare accessibility across the nation.",
    profileSlug: "dr-devi-prasad-shetty",
  },
  {
    name: "Dr. Varun Shetty",
    designation: "Senior Consultant",
    speciality: "Cardiothoracic Surgery",
    experience: "15+ yrs",
    expertise: "Minimally Invasive Cardiac Surgery · Heart Failure & LVAD · Aortic Surgery",
    hospital: "Narayana Institute of Cardiac Sciences",
    image: "/assets/doctor_1.png",
    bio: "Dr. Varun Shetty is a dedicated Consultant Cardiac Surgeon at Narayana Institute of Cardiac Sciences in Bangalore. With a focus on delivering high-quality cardiac care, he brings expertise and commitment to his role as a Cardiac Surgery Consultant.",
    profileSlug: "dr-varun-shetty",
  },
];

const ONCOLOGY_FEATURED_DOCTORS: FeaturedDoctorItem[] = [
  {
    name: "Dr. Arun Krishnan",
    designation: "Director & Senior Consultant — BMT",
    speciality: "Haemato-Oncology & BMT",
    experience: "20+ yrs",
    expertise: "Allogeneic & Autologous BMT · Cellular Therapy · Acute Leukaemia Management",
    hospital: "Mazumdar Shaw Cancer Centre",
    image: "/assets/doctor_1.png",
    bio: "Dr. Arun Krishnan stands as an internationally acclaimed haemato-oncologist and clinical pioneer in bone marrow transplantation and cellular therapies, delivering world-class remission outcomes for complex hematologic disorders.",
    profileSlug: "dr-arun-krishnan",
  },
  {
    name: "Dr. Akshita Singh",
    designation: "Lead Consultant & Director — Breast Oncology",
    speciality: "Breast Surgical Oncology",
    experience: "16+ yrs",
    expertise: "Oncoplastic Breast Surgery · Sentinel Lymph Node Biopsy · Organ-Preserving Surgery",
    hospital: "Narayana Multispeciality Hospital",
    image: "/assets/hero_doctor.png",
    bio: "Dr. Akshita Singh is an acclaimed surgical oncologist specializing in advanced breast cancer management, oncoplastic breast reconstructions, and personalized multidisciplinary clinical care protocols.",
    profileSlug: "dr-akshita-singh",
  },
];

const ORTHOPAEDICS_FEATURED_DOCTORS: FeaturedDoctorItem[] = [
  {
    name: "Dr. Sharan Shivaraj Patil",
    designation: "Chief Orthopaedic Surgeon & Chairman",
    speciality: "Orthopaedics & Joint Replacement",
    experience: "32+ yrs",
    expertise: "Robotic Joint Replacement · Complex Hip & Knee Revision · Pelvi-Acetabular Trauma",
    hospital: "Mazumdar Shaw Medical Centre",
    image: "/assets/doctor_1.png",
    bio: "Dr. Sharan Shivaraj Patil is an internationally renowned orthopaedic surgeon who has performed over 15,000 joint reconstructions. He is globally recognized for pioneering robotic-arm assisted arthroplasty and complex revision surgeries.",
    profileSlug: "dr-sharan-patil",
  },
  {
    name: "Dr. Ramneek Mahajan",
    designation: "Senior Director — Orthopaedics & Joint Reconstruction",
    speciality: "Joint Replacement & Arthroscopy",
    experience: "25+ yrs",
    expertise: "Navigated Knee Replacement · Sports Arthroscopy · Cartilage Restoration",
    hospital: "Narayana Superspeciality Hospital",
    image: "/assets/hero_doctor.png",
    bio: "Dr. Ramneek Mahajan specializes in primary and revision joint arthroplasties and minimally invasive sports ligament reconstructions with rapid recovery clinical protocols.",
    profileSlug: "dr-ramneek-mahajan",
  },
  {
    name: "Dr. Venuthurla Ram Mohan Reddy",
    designation: "Senior Consultant — Orthopaedic Surgery",
    speciality: "Orthopaedics & Spine Trauma",
    experience: "26+ yrs",
    expertise: "Computer-Navigated Arthroplasty · Complex Fracture Reconstruction · Geriatric Orthopaedics",
    hospital: "Narayana Institute of Spine Care",
    image: "/assets/doctor_3.png",
    bio: "Dr. Venuthurla Ram Mohan Reddy brings over two decades of advanced surgical excellence in navigated joint reconstruction, complex trauma management, and geriatric bone health restoration.",
    profileSlug: "dr-ram-mohan-reddy",
  },
  {
    name: "Dr. Prashanth B. N.",
    designation: "Consultant — Arthroscopy & Sports Medicine",
    speciality: "Arthroscopy & Sports Injuries",
    experience: "16+ yrs",
    expertise: "Shoulder & Knee Arthroscopy · Multi-Ligament Reconstruction · Rotator Cuff Repair",
    hospital: "Mazumdar Shaw Medical Centre",
    image: "/doctors/doc_devi_shetty.jpg",
    bio: "Dr. Prashanth B. N. is an expert in keyhole arthroscopic procedures and athletic trauma recovery, restoring joint mobility for elite athletes and active individuals.",
    profileSlug: "dr-prashanth-b-n",
  },
];

const NEURO_FEATURED_DOCTORS: FeaturedDoctorItem[] = [
  {
    name: "Dr. Ravi Shankar",
    designation: "Senior Consultant Neurosurgeon & Spine Specialist",
    speciality: "Neurosurgery & Spine",
    experience: "28+ yrs",
    expertise: "Minimally Invasive Spine Surgery · Skull Base Surgery · Micro-Vascular Decompression",
    hospital: "NH Health City, Bangalore",
    image: "/assets/doctor_3.png",
    bio: "Dr. Ravi Shankar is an acclaimed neurosurgeon specializing in minimally invasive spine surgery, micro-vascular decompression, and complex neuro-oncology interventions.",
    profileSlug: "dr-ravi-shankar",
  },
  {
    name: "Dr. Rajiv Menon",
    designation: "Consultant Interventional Neurologist",
    speciality: "Interventional Neurology",
    experience: "22+ yrs",
    expertise: "Mechanical Thrombectomy · Endovascular Coiling · Acute Stroke Care",
    hospital: "Mazumdar Shaw Medical Centre, Bangalore",
    image: "/assets/doctor_1.png",
    bio: "Dr. Rajiv Menon provides cutting-edge neuro-interventional stroke care, endovascular thrombectomy, and comprehensive neuro-vascular management protocols.",
    profileSlug: "dr-rajiv-menon",
  },
];

const UROLOGY_FEATURED_DOCTORS: FeaturedDoctorItem[] = [
  {
    name: "Dr. Ashley Lucien Joseph D Cruz",
    designation: "Senior Consultant Urologist & Paediatric Surgeon",
    speciality: "Paediatric Surgery",
    experience: "29+ yrs",
    expertise: "Robotic Surgery · Paediatric Airway Surgery · Paediatric Urology & Kidney Transplant",
    hospital: "Mazumdar Shaw Medical Centre",
    image: "/images/doctors/d20-real/dr-sanjay-rao.webp",
    bio: "Dr. Ashley Lucien Joseph D Cruz is a pioneering paediatric and reconstructive surgeon leading complex neonatal corrections, renal transplants, and advanced minimally invasive procedures with extraordinary clinical precision.",
    profileSlug: "dr-ashley-lucien-joseph-d-cruz",
  },
  {
    name: "Dr. Ravi Prakash",
    designation: "Consultant Nephrologist & Transplant Physician",
    speciality: "Nephrology & Renal Care",
    experience: "20+ yrs",
    expertise: "ABO-Incompatible Kidney Transplant · Critical Care Nephrology · Glomerular Diseases",
    hospital: "Narayana Institute of Cardiac Sciences",
    image: "/assets/doctor_1.png",
    bio: "Dr. Ravi Prakash specializes in ABO-incompatible kidney transplants, preventive nephrology, and acute intensive renal care with compassionate patient guidance.",
    profileSlug: "dr-ravi-prakash",
  },
];

export function getSpecialityFeaturedDoctors(slug: string, isCardiac: boolean): FeaturedDoctorItem[] {
  const s = slug.toLowerCase();
  if (s.includes("ent") || s.includes("ear") || s.includes("throat")) {
    return ENT_FEATURED_DOCTORS;
  }
  if (s.includes("ortho") || s.includes("bone") || s.includes("joint")) {
    return ORTHOPAEDICS_FEATURED_DOCTORS;
  }
  if (isCardiac || s.includes("cardiac") || s.includes("cardiology")) {
    return CARDIAC_FEATURED_DOCTORS;
  }
  if (s.includes("cancer") || s.includes("oncology") || s.includes("bmt") || s.includes("haemat") || s.includes("transplant")) {
    return ONCOLOGY_FEATURED_DOCTORS;
  }
  if (s.includes("neuro")) {
    return NEURO_FEATURED_DOCTORS;
  }
  if (s.includes("urology") || s.includes("nephro") || s.includes("kidney") || s.includes("renal") || s.includes("robot") || s.includes("paediatric") || s.includes("pediatric")) {
    return UROLOGY_FEATURED_DOCTORS;
  }
  return CARDIAC_FEATURED_DOCTORS;
}
