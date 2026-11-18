import type { AdvanceTestItem } from "@/data/advanceTestsData";
import type { DoctorVideoItem } from "@/components/ui/DoctorOverviewCarousel";

export interface CardiacSubCondition {
  title: string;
  desc: string;
}

export interface CardiacProgrammeCategory {
  id: string;
  title: string;
  programmeTitle: string;
  icon: string;
  bg: string;
  desc: string;
  subConditions: CardiacSubCondition[];
}

export const cardiacBannerData = {
  title: "Cardiology & Cardiac Surgery",
  shortTitle: "Cardiac Sciences",
  subtitle:
    "Since 2000, we’ve pioneered heart care for adults and children at Narayana Health, with expert cardiologists and cardiac surgeons treating the entire spectrum of heart conditions.",
  ctaText: "Find a Specialist",
  ctaLink: "/doctors",
  number: "080-69266140",
  desktopImage:
    "https://stgaccinwbsprdlrs02.blob.core.windows.net/corporatewebsite/speciality-coe-contents/January2026/DAbJBal0jGzUvwv2SWqp.webp",
  mobileImage:
    "https://stgaccinwbsprdlrs02.blob.core.windows.net/corporatewebsite/speciality-coe-contents/January2026/i7w8i1ZMjb5JjhZgl9zS.webp",
  videoSrc: "/Specialities icons/Cardiology.mp4",
};

export const cardiacStatsData = [
  {
    value: 3500,
    suffix: "+",
    label: "Aortic surgeries performed\ntill date across centres.",
  },
  {
    value: 1000,
    suffix: "+",
    label: "Pulmonary thromboendarterectomies,\nhighest volume in India.",
  },
  {
    value: 600,
    suffix: "+",
    label: "Transcatheter Aortic Valve\nImplantations (TAVI) till date.",
  },
  {
    value: 1200,
    suffix: "+",
    label: "Robotic heart surgeries\nperformed till date.",
  },
];

export const cardiacMilestoneData = {
  badge: "Milestone",
  title: "India’s Largest Pediatric Cardiac Programme",
  desc: "Delivering advanced cardiac care for children at scale, backed by high clinical volumes and expertise.",
};

export const cardiacAdultCategories: CardiacProgrammeCategory[] = [
  {
    id: "cardiology-adult",
    title: "Cardiology",
    programmeTitle: "Cardiology Programme",
    icon: "/assets/patient_in_1.png",
    bg: "/images/cardiac/cardiology_clinical.jpg",
    desc: "Comprehensive diagnostic and medical heart care focused on early detection, clinical evaluation, and personalised long-term management of cardiovascular conditions.",
    subConditions: [
      {
        title: "Coronary Artery Disease (CAD)",
        desc: "Narrowing or blockage of coronary arteries reducing blood flow to the heart muscle.",
      },
      {
        title: "Heart Failure & Cardiomyopathy",
        desc: "Weakened heart muscle function managed with guideline-directed medical therapies.",
      },
      {
        title: "Arrhythmias & Palpitations",
        desc: "Irregular heart rhythms, atrial fibrillation, and electrical conduction abnormalities.",
      },
      {
        title: "Valvular Heart Disease",
        desc: "Stenosis or regurgitation in aortic, mitral, or tricuspid valves.",
      },
      {
        title: "Hypertensive Heart Disease",
        desc: "Long-standing high blood pressure leading to left ventricular hypertrophy and vascular damage.",
      },
      {
        title: "Pericardial & Myocardial Disorders",
        desc: "Inflammation or infection of the pericardial sac or heart muscle tissue.",
      },
    ],
  },
  {
    id: "interventional-cardiology",
    title: "Interventional Cardiology",
    programmeTitle: "Interventional Cardiology Programme",
    icon: "/assets/patient_in_2.png",
    bg: "/images/cardiac/interventional_cathlab.jpg",
    desc: "State-of-the-art catheterisation labs providing minimally invasive diagnostic and therapeutic procedures for blocked arteries and structural heart defects.",
    subConditions: [
      {
        title: "Coronary Angiography & Angioplasty (PTCA)",
        desc: "Balloon dilatation and drug-eluting stent placement to restore coronary blood flow.",
      },
      {
        title: "TAVI / TAVR",
        desc: "Transcatheter Aortic Valve Implantation replacing diseased aortic valves without open-heart surgery.",
      },
      {
        title: "Complex Coronary Interventions",
        desc: "Rotablation, intravascular lithotripsy (IVL), and bifurcation stenting for calcified lesions.",
      },
      {
        title: "Intravascular Imaging (IVUS & OCT)",
        desc: "High-resolution optical coherence tomography and ultrasound for optimal stent deployment.",
      },
      {
        title: "Percutaneous Balloon Valvuloplasty",
        desc: "Minimally invasive balloon opening of narrowed mitral and pulmonary heart valves.",
      },
      {
        title: "ASD & PFO Device Closures",
        desc: "Catheter-delivered closure devices for congenital atrial septal holes in adult patients.",
      },
    ],
  },
  {
    id: "cardiac-surgery-adult",
    title: "Cardiac Surgery",
    programmeTitle: "Cardiac Surgery Programme",
    icon: "/assets/patient_in_3.png",
    bg: "/images/cardiac/cardiac_surgery_or.jpg",
    desc: "Advanced surgical solutions for complex heart conditions, led by pioneering cardiothoracic surgeons performing high-volume bypass, valve, and aortic operations.",
    subConditions: [
      {
        title: "Coronary Artery Bypass Grafting (CABG)",
        desc: "Beating heart (off-pump) and conventional bypass surgeries restoring myocardial perfusion.",
      },
      {
        title: "Heart Valve Repair & Replacement",
        desc: "Biological and mechanical valve replacements and tissue-sparing repair techniques.",
      },
      {
        title: "Minimally Invasive Cardiac Surgery (MICS)",
        desc: "Small-incision keyhole surgery reducing post-operative pain and recovery time.",
      },
      {
        title: "Aortic Aneurysm & Dissection Repair",
        desc: "Complex surgical reconstructions of the ascending aorta, aortic arch, and root.",
      },
      {
        title: "Ventricular Aneurysmectomy",
        desc: "Surgical reconstruction of left ventricular wall following myocardial infarction.",
      },
    ],
  },
  {
    id: "thoracic-vascular",
    title: "Thoracic & Vascular Surgery",
    programmeTitle: "Thoracic & Vascular Surgery Programme",
    icon: "/assets/patient_in_4.png",
    bg: "/images/cardiac/thoracic_vascular_hybrid.jpg",
    desc: "Surgical and endovascular interventions for diseases of the pulmonary vasculature, aorta, and peripheral circulatory system.",
    subConditions: [
      {
        title: "Pulmonary Thromboendarterectomy (PTE)",
        desc: "India's highest volume programme clearing chronic thromboembolic pulmonary hypertension.",
      },
      {
        title: "Endovascular Aortic Repair (EVAR / TEVAR)",
        desc: "Minimally invasive stent grafting for thoracic and abdominal aortic aneurysms.",
      },
      {
        title: "Peripheral Arterial Bypass Surgery",
        desc: "Restoring arterial circulation in lower limb ischemia and diabetic vascular disease.",
      },
      {
        title: "Carotid Endarterectomy",
        desc: "Surgical plaque removal from carotid arteries to prevent ischemic stroke.",
      },
      {
        title: "Varicose Veins Laser Therapy",
        desc: "Minimally invasive radiofrequency and laser ablation for venous insufficiency.",
      },
    ],
  },
  {
    id: "heart-transplant",
    title: "Heart Transplant",
    programmeTitle: "Heart Transplant Programme",
    icon: "/assets/hospital_1.png",
    bg: "/images/cardiac/heart_transplant_icu.jpg",
    desc: "Comprehensive quaternary care for terminal heart failure, combining cardiac transplantation, mechanical circulatory support, and LVAD therapy.",
    subConditions: [
      {
        title: "End-Stage Heart Failure",
        desc: "Comprehensive management when maximal medical therapies are no longer effective.",
      },
      {
        title: "Left Ventricular Assist Device (LVAD)",
        desc: "Bridge-to-transplant and destination mechanical circulatory pump implantation.",
      },
      {
        title: "Donor Heart Matching & Transplantation",
        desc: "Expert surgical transplantation supported by dedicated cardiac intensive care units.",
      },
      {
        title: "Post-Transplant Immunosuppression & Care",
        desc: "Rigorous biopsy surveillance, infection control, and cardiac rehabilitation.",
      },
    ],
  },
  {
    id: "lung-transplant",
    title: "Lung Transplant",
    programmeTitle: "Lung Transplant Programme",
    icon: "/assets/hero_modern.png",
    bg: "/images/cardiac/lung_transplant_or.jpg",
    desc: "Dedicated advanced lung failure programme providing single-lung, double-lung, and combined heart-lung transplantation.",
    subConditions: [
      {
        title: "Pulmonary Arterial Hypertension (PAH)",
        desc: "Advanced medical therapy, ECMO bridging, and surgical lung transplantation.",
      },
      {
        title: "Idiopathic Pulmonary Fibrosis (IPF)",
        desc: "Lung transplant evaluation and surgical therapy for progressive interstitial fibrosis.",
      },
      {
        title: "Chronic Obstructive Pulmonary Disease (COPD)",
        desc: "Surgical options for severe end-stage emphysema and airflow limitation.",
      },
      {
        title: "Heart-Lung Transplantation",
        desc: "Simultaneous thoracic organ transplantation for combined cardiopulmonary failure.",
      },
    ],
  },
  {
    id: "robot-assisted-cardiac",
    title: "Robot-Assisted Cardiac Surgery",
    programmeTitle: "Robot-Assisted Cardiac Surgery Programme",
    icon: "/assets/hospital_1.png",
    bg: "/images/cardiac/robotic_cardiac_surgery.jpg",
    desc: "High-precision robotic surgery with the da Vinci surgical system, offering exceptional magnification, dexterity, and faster return to active life.",
    subConditions: [
      {
        title: "Robotic Internal Mammary Artery Takedown",
        desc: "Ultra-precise robotic harvesting of bypass conduits with minimal chest trauma.",
      },
      {
        title: "Robotic Mitral Valve Repair",
        desc: "Keyhole robotic valve repair avoiding median sternotomy and rib spreading.",
      },
      {
        title: "Robotic Atrial Septal Defect Closure",
        desc: "Minimally invasive robotic congenital hole closure in adult hearts.",
      },
      {
        title: "Robotic Cardiac Tumour Excision",
        desc: "Excision of cardiac myxomas through small port incisions with rapid recovery.",
      },
    ],
  },
];

export const cardiacPaediatricCategories: CardiacProgrammeCategory[] = [
  {
    id: "paediatric-cardiology",
    title: "Paediatric Cardiology",
    programmeTitle: "Paediatric Cardiology Programme",
    icon: "https://stgaccinwbsprdlrs02.blob.core.windows.net/corporatewebsite/symptoms/January2026/2v70sJfGlQ4DODbvIqdV.webp",
    bg: "/images/cardiac/paediatric_cardiology.jpg",
    desc: "Specialised paediatric heart care from foetal echocardiography through non-surgical catheter interventions for newborns, infants, and children.",
    subConditions: [
      {
        title: "Atrial & Ventricular Septal Defects (ASD / VSD)",
        desc: "Common congenital holes between heart chambers treated with catheter device closures.",
      },
      {
        title: "Patent Ductus Arteriosus (PDA)",
        desc: "Persistent foetal vessel closing with coil or device occluders.",
      },
      {
        title: "Tetralogy of Fallot (TOF)",
        desc: "Fourfold congenital cardiac defect diagnosed and managed for corrective surgery.",
      },
      {
        title: "Coarctation of the Aorta",
        desc: "Narrowing of the large body artery treated with balloon dilatation or stenting.",
      },
      {
        title: "Paediatric Arrhythmias & Syncope",
        desc: "Holter monitoring, electrophysiology testing, and ablation in children.",
      },
    ],
  },
  {
    id: "paediatric-cardiac-surgery",
    title: "Paediatric Cardiac Surgery",
    programmeTitle: "Paediatric Cardiac Surgery Programme",
    icon: "/assets/patient_in_2.png",
    bg: "/images/cardiac/paediatric_cardiac_surgery.jpg",
    desc: "India's highest-volume paediatric cardiac surgical team, performing complex neonatal and infant open-heart surgeries with world-class outcomes.",
    subConditions: [
      {
        title: "Arterial Switch Operation (ASO)",
        desc: "Corrective surgery for Transposition of the Great Arteries within the first weeks of life.",
      },
      {
        title: "Single Ventricle Palliation (Norwood / Glenn / Fontan)",
        desc: "Staged surgical pathway for complex single ventricle congenital heart conditions.",
      },
      {
        title: "Total Anomalous Pulmonary Venous Return (TAPVR)",
        desc: "Urgent surgical rerouting of pulmonary veins into the left atrium.",
      },
      {
        title: "Neonatal Valve Repairs & Conduit Placements",
        desc: "Restoring valvular and outflow tract patency in fragile newborns.",
      },
    ],
  },
];

export const cardiacResearchCare = {
  title: "From Research to Real Care",
  subtitle:
    "Our Clinical Research program explores innovative treatments and therapies, giving patients access to the latest advancements in cardiac sciences while contributing to medical breakthroughs.",
  ctaText: "Know More",
  ctaLink: "https://www.narayanahealth.org/clinical-research",
  desktopImage:
    "https://stgaccinwbsprdlrs02.blob.core.windows.net/corporatewebsite/speciality-coe-contents/January2026/PeHCXpvJmBJv19xX0814.webp",
  mobileImage:
    "https://stgaccinwbsprdlrs02.blob.core.windows.net/corporatewebsite/speciality-coe-contents/January2026/KW2FHjwYth025MnOTnmo.webp",
};

export const cardiacRealStories = {
  title: "Real Stories. Real Healing.",
  subtitle:
    "Listen to our senior cardiologists and cardiac surgeons share insights into life-saving heart treatments and patient journeys.",
  items: [
    {
      subtitle:
        "Dr Sanjay Mehrotra, Senior Consultant Cardiology, Adult at Narayana Health City, Bommasandra, Bengaluru, exemplifies this through his treatment of Mr. K Yogesha Rao.",
      name: "Dr. Sanjay Mehrotra",
      title: "Senior Consultant Cardiology, Adult",
      location: "Narayana Health City, Bommasandra, Bengaluru",
      vdo_link: "https://www.youtube.com/embed/VZtcKMPzqdE",
    },
    {
      subtitle:
        "Mr. Amit Das, 31, was admitted with a major heart attack — a stark reminder that heart attacks among young people are rising alarmingly across South Asia.",
      name: "Dr. Subhashis Dey",
      title: "Senior Consultant Interventional Cardiologist",
      location: "Narayana Health, Barasat",
      vdo_link: "https://www.youtube.com/embed/P9sjRZx5l5c",
    },
  ],
};

export const cardiacFaqs = [
  {
    question: "What cardiac services and treatments are offered at Narayana Health?",
    answer:
      "Narayana Health offers the complete spectrum of heart care for both adult and paediatric patients, including preventive cardiology, advanced non-invasive diagnostics, interventional cardiology (angioplasty, TAVI), open-heart surgery (CABG, valve repairs), pulmonary thromboendarterectomy, heart and lung transplants, and robot-assisted cardiac surgery.",
  },
  {
    question: "Why is Narayana Health considered a leader in cardiac sciences?",
    answer:
      "With over 1,50,000 cardiac surgeries and 4,50,000+ cardiac procedures performed to date, Narayana Health operates India's largest paediatric and adult cardiac care networks, featuring JCI/NABH-accredited facilities, state-of-the-art hybrid catheterization labs, and world-renowned cardiac surgeons.",
  },
  {
    question: "What is TAVI / TAVR and does Narayana Health perform it?",
    answer:
      "Transcatheter Aortic Valve Implantation (TAVI) is a minimally invasive catheter-based procedure to replace a narrowed aortic valve without open-heart surgery. Narayana Health has successfully performed over 600+ TAVI procedures with excellent clinical outcomes.",
  },
  {
    question: "What should I bring to my first cardiology consultation?",
    answer:
      "Please bring all previous ECGs, 2D Echo reports, angiogram CDs, blood test results (lipid profile, blood sugar, kidney function), current prescription medications, and prior hospital discharge summaries.",
  },
  {
    question: "Are cashless insurance and emergency cardiac services available?",
    answer:
      "Yes, Narayana Health operates round-the-clock 24/7 cardiac emergency and cath labs for acute heart attack management. We are empanelled with all major insurance providers and TPAs for cashless hospitalization.",
  },
  {
    question: "What advanced technologies are used in cardiac care?",
    answer:
      "Our centres are equipped with 256-slice CT coronary angiography, 3D transoesophageal echocardiography (TEE), hybrid cardiac operation theatres, da Vinci robotic surgery systems, Carto 3D electrophysiology mapping, ECMO, and LVAD support systems.",
  },
];

export const cardiacProceduresData = [
  {
    id: "cabg",
    title: "Coronary Artery Bypass Grafting (CABG)",
    bg: "/images/procedures/procedure_surgery.png",
    image: "/images/procedures/procedure_surgery.png",
    desc: "Beating heart and conventional bypass surgeries re-routing blood flow around blocked arteries to restore oxygen-rich blood to the heart muscle.",
    slug: "coronary-artery-bypass-graft-cabg",
    stat: {
      value: "100,000+",
      label: "Heart surgeries performed<br />with world-class survival rates."
    }
  },
  {
    id: "tavi",
    title: "Transcatheter Aortic Valve Implantation (TAVI / TAVR)",
    bg: "/images/procedures/procedure_cardiology.png",
    image: "/images/procedures/procedure_cardiology.png",
    desc: "Minimally invasive catheter-based aortic valve replacement for severe aortic stenosis without opening the chest.",
    slug: "tavr-tavi-procedure",
    stat: {
      value: "600+",
      label: "TAVI procedures performed,<br />avoiding conventional open surgery."
    }
  },
  {
    id: "angioplasty",
    title: "Complex Coronary Angioplasty & Stenting",
    bg: "/images/procedures/procedure_cardiology.png",
    image: "/images/procedures/procedure_cardiology.png",
    desc: "Percutaneous coronary intervention utilizing drug-eluting stents, IVUS imaging, and rotablation for complex calcified lesions.",
    slug: "coronary-angioplasty",
    stat: {
      value: "150,000+",
      label: "Catheter interventions completed<br />with precision fractional flow reserve."
    }
  },
  {
    id: "transplant",
    title: "Heart Transplantation & LVAD Implantation",
    bg: "/images/procedures/procedure_surgery.png",
    image: "/images/procedures/procedure_surgery.png",
    desc: "Advanced surgical therapy for end-stage heart failure offering cardiac transplantation and long-term mechanical circulatory support.",
    slug: "heart-transplant",
    stat: {
      value: "150+",
      label: "Heart & lung transplants performed<br />by dedicated transplant teams."
    }
  },
  {
    id: "pte",
    title: "Pulmonary Thromboendarterectomy (PTE)",
    bg: "/images/procedures/procedure_surgery.png",
    image: "/images/procedures/procedure_surgery.png",
    desc: "Pioneering surgical clearance of chronic pulmonary artery clots, making Narayana Health India’s highest-volume centre for this procedure.",
    slug: "pulmonary-thromboendarterectomy",
    stat: {
      value: "1,000+",
      label: "PTE surgeries completed,<br />highest volume in India."
    }
  },
  {
    id: "robotic-valve",
    title: "Robot-Assisted Cardiac Valve Repair",
    bg: "/images/procedures/procedure_cardiology.png",
    image: "/images/procedures/procedure_cardiology.png",
    desc: "Sub-millimetre precision valve reconstruction performed through tiny keyhole incisions with the da Vinci robotic platform.",
    slug: "robot-assisted-cardiac-surgery",
    stat: {
      value: "1,200+",
      label: "Robotic surgeries performed till date<br />with minimal hospital stay."
    }
  },
];

export const cardiacTestsData: AdvanceTestItem[] = [
  {
    id: "ct-coronary-angio",
    name: "256-Slice CT Coronary Angiography",
    category: "Non-Invasive Imaging",
    desc: "Ultra-fast, non-invasive imaging of coronary arteries providing sub-millimetre visualization of plaque and stenosis in a single heartbeat.",
    image: "/images/cardiac/tests/ct_coronary_angio.jpg",
    sampleType: "IV Contrast Imaging",
    turnaroundTime: "Same Day Report",
    badge: "Ultra-Fast",
  },
  {
    id: "3d-tee",
    name: "3D Transoesophageal Echocardiography (3D TEE)",
    category: "Structural Diagnostics",
    desc: "Real-time three-dimensional high-resolution ultrasound providing detailed structural assessment of heart valves and congenital defects.",
    image: "/images/cardiac/tests/3d_tee_ultrasound.jpg",
    sampleType: "Endoscopic Ultrasound",
    turnaroundTime: "Immediate Results",
    badge: "Real-Time 3D",
  },
  {
    id: "cardiac-mri",
    name: "Cardiac MRI & Myocardial Viability Imaging",
    category: "Magnetic Resonance",
    desc: "Gold-standard magnetic resonance imaging assessing heart muscle tissue viability, fibrosis, scar tissue, and perfusion.",
    image: "/images/cardiac/tests/cardiac_mri.jpg",
    sampleType: "Non-Invasive MRI",
    turnaroundTime: "24 Hours",
    badge: "Gold Standard",
  },
  {
    id: "carto-ep-mapping",
    name: "Electrophysiological (EP) 3D Carto Mapping",
    category: "Electrophysiology",
    desc: "High-density anatomical and electrical mapping locating complex arrhythmia sources for precise catheter radiofrequency ablation.",
    image: "/images/cardiac/tests/carto_ep_mapping.jpg",
    sampleType: "Intracardiac Catheter",
    turnaroundTime: "Procedure Direct",
    badge: "High Precision",
  },
  {
    id: "nuclear-spect-pet",
    name: "Nuclear Myocardial Perfusion SPECT / PET Scan",
    category: "Nuclear Cardiology",
    desc: "Radionuclide imaging measuring myocardial blood flow under rest and stress to detect reversible ischemia with high sensitivity.",
    image: "/images/cardiac/tests/nuclear_spect_pet.jpg",
    sampleType: "Nuclear Isotope Tracer",
    turnaroundTime: "Same Day Report",
    badge: "Ischemia Detection",
  },
  {
    id: "ffr-ivus-oct",
    name: "Fractional Flow Reserve (FFR) & IVUS Imaging",
    category: "Intravascular Physiology",
    desc: "Intracoronary physiological pressure wire and intravascular ultrasound measuring functional significance of arterial blockages.",
    image: "/images/cardiac/tests/ffr_ivus_oct.jpg",
    sampleType: "Intravascular Catheter",
    turnaroundTime: "Cath Lab Direct",
    badge: "10-Micron Resolution",
  },
];

export const cardiacDoctorVideosList: DoctorVideoItem[] = [
  {
    id: "cardiac-vid-1",
    title: "Treating Complex Heart Conditions: Insights & Patient Recovery",
    category: "Interventional Cardiology",
    duration: "4:15",
    youtubeId: "VZtcKMPzqdE",
    videoSrc: "/NH YT Vid 01.mp4",
    thumbnail: "/images/procedures/procedure_cardiology.png",
    doctor: {
      name: "Dr. Sanjay Mehrotra",
      role: "Senior Consultant — Cardiology, Adult",
      hospital: "Narayana Health City, Bommasandra, Bengaluru",
      experience: "28+ Years Exp",
      avatar: "/doctors/doc_bagirath.jpg",
    },
  },
  {
    id: "cardiac-vid-2",
    title: "Heart Attacks in Young Adults: Critical Case & Prevention Guidance",
    category: "Preventive Cardiology",
    duration: "5:42",
    youtubeId: "P9sjRZx5l5c",
    videoSrc: "/NH YT Vid 02.mp4",
    thumbnail: "/images/procedures/procedure_cardiology.png",
    doctor: {
      name: "Dr. Subhashis Dey",
      role: "Senior Consultant — Interventional Cardiology",
      hospital: "Narayana Health, Barasat",
      experience: "20+ Years Exp",
      avatar: "/doctors/doc_vivek.jpg",
    },
  },
  {
    id: "cardiac-vid-3",
    title: "Affordable Cardiac Surgery & Modern Paediatric Heart Innovations",
    category: "Cardiac Surgery & Congenital Care",
    duration: "6:10",
    youtubeId: "f8ZJ2zYv-3I",
    videoSrc: "/Doctor patient.mp4",
    thumbnail: "/images/procedures/procedure_surgery.png",
    doctor: {
      name: "Dr. Devi Prasad Shetty",
      role: "Founder & Chairman — Narayana Health",
      hospital: "Narayana Institute of Cardiac Sciences",
      experience: "40+ Years Exp",
      avatar: "/doctors/doc_devi_shetty.jpg",
    },
  },
];

export const cardiacDoctorsData = [
  {
    id: "dr-devi-shetty",
    name: "Dr. Devi Prasad Shetty",
    spec: "Chairman & Senior Consultant Cardiac Surgeon",
    exp: "35+ years of experience",
    loc: "Narayana Institute of Cardiac Sciences, Bommasandra, Bengaluru",
    img: "/assets/hero_doctor.png",
  },
  {
    id: "dr-sanjay-mehrotra",
    name: "Dr. Sanjay Mehrotra",
    spec: "Senior Consultant Cardiology, Adult",
    exp: "28+ years of experience",
    loc: "Narayana Health City, Bommasandra, Bengaluru",
    img: "/assets/doctor_1.png",
  },
  {
    id: "dr-bagirath-raghuraman",
    name: "Dr. Bagirath Raghuraman",
    spec: "Senior Consultant Interventional Cardiology & Heart Failure",
    exp: "24+ years of experience",
    loc: "Narayana Institute of Cardiac Sciences, Bengaluru",
    img: "/assets/doctor_2.png",
  },
  {
    id: "dr-subhashis-dey",
    name: "Dr. Subhashis Dey",
    spec: "Senior Consultant Interventional Cardiologist",
    exp: "20+ years of experience",
    loc: "Narayana Health, Barasat",
    img: "/assets/doctor_3.png",
  },
  {
    id: "dr-ashley-dsouza",
    name: "Dr. Ashley D'Souza",
    spec: "Consultant Cardiothoracic & Vascular Surgery",
    exp: "18+ years of experience",
    loc: "Narayana Multispeciality Hospital, HSR Layout, Bengaluru",
    img: "/assets/doctor_1.png",
  },
];
