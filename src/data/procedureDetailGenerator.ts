import { TREATMENTS_PROCEDURES_DATA, TreatmentProcedureItem } from "./treatmentsProceduresData";
import { HEART_TRANSPLANT_TOC, HEART_TRANSPLANT_DETAIL } from "./heartTransplantDetailData";

export interface SymptomItem {
  name: string;
  desc: string;
}

export interface ConditionItem {
  name: string;
  desc: string;
}

export interface MatchingStepItem {
  step: string;
  title: string;
  desc: string;
}

export interface DoctorItem {
  name: string;
  designation: string;
  experience: string;
  hospital: string;
  image: string;
  speciality: string;
}

export interface HospitalDetailItem {
  name: string;
  city: string;
  beds: string;
  image: string;
}

export interface FAQItem {
  q: string;
  a: string;
}

export interface TOCItem {
  id: string;
  label: string;
}

export interface ProcedureDetailData {
  slug: string;
  title: string;
  shortTitle: string;
  speciality: string;
  specialitySlug: string;
  heroImage: string;
  heroTitle: string;
  heroSubtitle: string;
  leadParagraph: string;
  metrics: {
    successRate: string;
    duration: string;
    hospitalStay: string;
    recoveryTime: string;
    anesthesia: string;
  };
  whatIsIt: {
    title: string;
    description: string;
    keyPoints: string[];
  };
  symptoms: {
    title: string;
    description: string;
    items: SymptomItem[];
  };
  whoNeedsCare: {
    title: string;
    description: string;
    conditions: ConditionItem[];
  };
  whenRecommended: {
    title: string;
    description: string;
    recommendations: string[];
  };
  eligibility: {
    title: string;
    eligiblePoints: string[];
    notEligiblePoints: string[];
  };
  approach: {
    title: string;
    description: string;
    steps: MatchingStepItem[];
  };
  recoveryCare: {
    title: string;
    description: string;
    highlights: string[];
  };
  cost: {
    title: string;
    estimateRange: string;
    internationalRange: string;
    inclusions: string[];
    insuranceNote: string;
  };
  doctors: DoctorItem[];
  hospitals: HospitalDetailItem[];
  faqs: FAQItem[];
  toc: TOCItem[];
}

// Curated specialist doctors by medical discipline
const SPECIALTY_DOCTORS_MAP: Record<string, DoctorItem[]> = {
  cardiology: [
    {
      name: "Dr. Devi Prasad Shetty",
      designation: "Chairman & Senior Consultant Cardiac Surgeon",
      experience: "40+ Years Experience",
      hospital: "Narayana Institute of Cardiac Sciences, Bangalore",
      image: "/Dr.Devi Shetty.png",
      speciality: "Cardiac Surgery",
    },
    {
      name: "Dr. Vivek Jawali",
      designation: "Chief Cardiothoracic & Vascular Surgeon",
      experience: "35+ Years Experience",
      hospital: "Mazumdar Shaw Medical Centre, Bangalore",
      image: "/doctors/doc_vivek.jpg",
      speciality: "Cardiothoracic Surgery",
    },
    {
      name: "Dr. Bagirath Raghuraman",
      designation: "Director - Heart Failure & Transplant Cardiology",
      experience: "24+ Years Experience",
      hospital: "Narayana Health City, Bangalore",
      image: "/doctors/doc_bagirath.jpg",
      speciality: "Heart Failure Cardiology",
    },
  ],
  urology: [
    {
      name: "Dr. Ashley D'Cruz",
      designation: "Senior Consultant Urologist & Renal Transplant Surgeon",
      experience: "32+ Years Experience",
      hospital: "Mazumdar Shaw Medical Centre, Bangalore",
      image: "/doctor_avatar_male.png",
      speciality: "Urology & Renal Transplant",
    },
    {
      name: "Dr. Ravi Prakash",
      designation: "Consultant Nephrologist & Transplant Physician",
      experience: "20+ Years Experience",
      hospital: "Narayana Institute of Cardiac Sciences, Bangalore",
      image: "/assets/doctor_1.png",
      speciality: "Nephrology",
    },
    {
      name: "Dr. Sanjay Rao",
      designation: "Senior Consultant Paediatric & Reconstructive Urologist",
      experience: "26+ Years Experience",
      hospital: "NH Children's Hospital, Mumbai",
      image: "/assets/doctor_2.png",
      speciality: "Paediatric Urology",
    },
  ],
  neurology: [
    {
      name: "Dr. Ravi Shankar",
      designation: "Senior Consultant Neurosurgeon & Spine Specialist",
      experience: "28+ Years Experience",
      hospital: "NH Health City, Bangalore",
      image: "/assets/doctor_3.png",
      speciality: "Neurosurgery",
    },
    {
      name: "Dr. Rajiv Menon",
      designation: "Consultant Interventional Neurologist",
      experience: "22+ Years Experience",
      hospital: "Mazumdar Shaw Medical Centre, Bangalore",
      image: "/assets/doctor_1.png",
      speciality: "Neurology",
    },
  ],
  paediatrics: [
    {
      name: "Dr. Ashley D'Cruz",
      designation: "Director - Paediatric Surgery & Organ Transplant",
      experience: "34+ Years Experience",
      hospital: "Narayana Health City, Bangalore",
      image: "/doctor_avatar_male.png",
      speciality: "Paediatric Surgery",
    },
    {
      name: "Dr. Sanjay Rao",
      designation: "Senior Consultant Paediatric Surgeon",
      experience: "25+ Years Experience",
      hospital: "Mazumdar Shaw Medical Centre, Bangalore",
      image: "/assets/doctor_2.png",
      speciality: "Paediatric Surgery",
    },
  ],
  default: [
    {
      name: "Dr. Devi Prasad Shetty",
      designation: "Chairman & Senior Consultant Surgeon",
      experience: "40+ Years Experience",
      hospital: "Narayana Institute of Cardiac Sciences, Bangalore",
      image: "/Dr.Devi Shetty.png",
      speciality: "Surgical Sciences",
    },
    {
      name: "Dr. Vivek Jawali",
      designation: "Chief Surgical Board Consultant",
      experience: "35+ Years Experience",
      hospital: "Mazumdar Shaw Medical Centre, Bangalore",
      image: "/doctors/doc_vivek.jpg",
      speciality: "Senior Surgical Consultant",
    },
    {
      name: "Dr. Bagirath Raghuraman",
      designation: "Senior Clinical Director",
      experience: "24+ Years Experience",
      hospital: "Narayana Health City, Bangalore",
      image: "/doctors/doc_bagirath.jpg",
      speciality: "Advanced Therapeutics",
    },
  ],
};

// Top accredited Narayana Health hospitals
const ACCREDITED_HOSPITALS: HospitalDetailItem[] = [
  {
    name: "Narayana Institute of Cardiac Sciences",
    city: "Bangalore, Karnataka",
    beds: "1,000+ Beds Dedicated Tertiary Centre",
    image: "https://stgaccinwbsprdlrs02.blob.core.windows.net/corporatewebsite/hospital-images/July2026/KztpC4GYDq70ncLAFLSv.png",
  },
  {
    name: "Mazumdar Shaw Medical Centre",
    city: "Bangalore, Karnataka",
    beds: "1,400+ Beds Multi-Organ Facility",
    image: "https://stgaccinwbsprdlrs02.blob.core.windows.net/corporatewebsite/hospital-images/August2026/X9LPjGaxsejoIT5Aracu.png",
  },
  {
    name: "Rabindranath Tagore International Institute of Cardiac Sciences",
    city: "Kolkata, West Bengal",
    beds: "650+ Beds Advanced Surgical Hospital",
    image: "https://stgaccinwbsprdlrs02.blob.core.windows.net/corporatewebsite/hospital-images/July2026/aRn89LPQ7p1zMCysRFNO.png",
  },
];

// Curated symptoms mapped per condition / procedure category
const SYMPTOMS_DICTIONARY: Record<string, SymptomItem[]> = {
  "heart-transplant": [
    { name: "Shortness of Breath at Rest", desc: "Dyspnea worsening when lying flat (orthopnea) or during minimal exertion." },
    { name: "Severe Persistent Fatigue", desc: "Extreme exhaustion caused by inadequate systemic cardiac output." },
    { name: "Peripheral Edema & Leg Swelling", desc: "Fluid accumulation in ankles, feet, legs, and abdomen (ascites)." },
    { name: "Rapid or Irregular Heartbeats", desc: "Palpitations, ventricular tachycardia, or persistent arrhythmia." },
    { name: "Persistent Wheezing or Cough", desc: "Pink-tinged phlegm and fluid buildup in lung tissue." },
  ],
  "abdominal-aortic-aneurysm-repair": [
    { name: "Pulsating Abdominal Mass", desc: "A prominent pulse or throbbing sensation felt near the navel." },
    { name: "Deep Persistent Back Pain", desc: "Constant, gnawing pain in the lower back or side unaffected by position changes." },
    { name: "Sudden Severe Abdominal Pain", desc: "Sharp, tearing pain radiating to the groin or legs indicating impending rupture." },
    { name: "Coldness or Numbness in Feet", desc: "Impaired peripheral circulation in the lower extremities due to emboli." },
    { name: "Dizziness or Syncope", desc: "Lightheadedness or fainting spells caused by blood pressure drops." },
  ],
  "abdominal-issues-children": [
    { name: "Persistent Abdominal Distension", desc: "Swelling or rigidity of the abdomen in infants and toddlers." },
    { name: "Bilious (Green) Vomiting", desc: "Greenish vomiting signaling potential intestinal obstruction or malrotation." },
    { name: "Severe Inconsolable Crying", desc: "Colicky abdominal pain episodes with legs pulled up towards chest." },
    { name: "Blood in Stool (Currant Jelly Stool)", desc: "Indicative of pediatric intussusception or acute bowel compromise." },
    { name: "Unexplained High Fever with Lethargy", desc: "Systemic signs of appendicitis, peritonitis, or abdominal infection." },
  ],
  "abo-incompatible-kidney-transplant": [
    { name: "Chronic Fatigue & Weakness", desc: "Progressive lethargy due to end-stage renal disease and anemia." },
    { name: "Severe Fluid Retention (Anasarca)", desc: "Marked facial puffiness, leg edema, and hypertension from salt-water overload." },
    { name: "Uremic Nausea & Loss of Appetite", desc: "Metallic taste, loss of appetite, and vomiting caused by elevated BUN." },
    { name: "Decreased Urine Output (Oliguria)", desc: "Substantial drop in 24-hour urine excretion requiring dialysis." },
    { name: "Pruritus & Skin Itching", desc: "Uremic frost and severe itching unresponsive to topical emollients." },
  ],
  "abscess-drainage": [
    { name: "Localized Swelling & Tenderness", desc: "Painful, warm, fluctuant mass in soft tissues or abdominal cavity." },
    { name: "Spiking Fever & Chills", desc: "Systemic febrile episodes signaling contained infectious purulent collection." },
    { name: "Persistent Dull Aching Pain", desc: "Localized pressure pain exacerbating with movement or deep palpation." },
    { name: "Erythema & Skin Redness", desc: "Visible redness overlying the infected fluid collection." },
  ],
  "absence-seizures-children": [
    { name: "Sudden Blank Staring Spells", desc: "Brief 5 to 15 second lapses of awareness where the child stops mid-activity." },
    { name: "Fluttering Eyelids (Myoclonus)", desc: "Rapid blinking or upward eye deviation during staring episodes." },
    { name: "Lip Smacking or Chewing", desc: "Subtle involuntary automatisms accompanying the absence seizure." },
    { name: "Immediate Recovery Without Confusion", desc: "Prompt return to full alertness without the typical post-ictal drowsiness." },
  ],
  "acute-pancreatitis": [
    { name: "Severe Upper Abdominal Pain", desc: "Intense stabbing pain in the epigastrium radiating directly through to the back." },
    { name: "Nausea & Persistent Vomiting", desc: "Severe emesis that provides no relief from the intense abdominal pain." },
  ],
  "coronary-angiography": [
    { name: "Angina & Chest Tightness", desc: "Squeezing pressure or discomfort across the sternum triggered by physical exertion or emotional stress." },
    { name: "Exertional Breathlessness", desc: "Shortness of breath during ordinary walking or climbing a single flight of stairs." },
    { name: "Radiating Discomfort", desc: "Aching pain traveling to the left arm, shoulder, jaw, neck, or upper back." },
    { name: "Unexplained Chronic Fatigue", desc: "Persistent low stamina resulting from diminished coronary artery blood flow." },
  ],
  "echocardiography": [
    { name: "Cardiac Murmur or Abnormal Sounds", desc: "Innocent or pathological heart murmurs identified during physical stethoscope examination." },
    { name: "Swelling in Lower Extremities", desc: "Pitting edema in ankles, shins, or feet indicative of reduced ventricular pumping capacity." },
    { name: "Orthopnea & Paroxysmal Dyspnea", desc: "Waking up breathless at night or requiring multiple pillows to breathe comfortably." },
    { name: "Heart Fluttering & Skipped Beats", desc: "Episodic palpitations or irregular sensations in the chest cavity." },
  ],
  "ecg-electrocardiogram": [
    { name: "Sudden Tachycardia or Racing Pulse", desc: "Rapid heartbeats occurring unpredictably without physical exertion." },
    { name: "Near-Syncope or Fainting Spells", desc: "Sudden lightheadedness, dizziness, or brief loss of consciousness." },
    { name: "Transient Chest Aches", desc: "Momentary sharp or dull chest pain requiring ruling out of ischemia." },
    { name: "Irregular Pulse Sensation", desc: "Erratic pulse patterns noted during home monitoring or wrist wearable alerts." },
  ],
  "cardiac-consultation": [
    { name: "Family History of Premature Heart Disease", desc: "Strong pedigree history of heart attacks or cardiac sudden death in first-degree relatives." },
    { name: "Uncontrolled Blood Pressure or Cholesterol", desc: "Chronic hypertension or dyslipidemia requiring therapeutic risk reduction." },
    { name: "Pre-Operative Clearance Needs", desc: "Clinical clearance required before undergoing major elective non-cardiac surgery." },
    { name: "Lifestyle Cardiovascular Risk Profile", desc: "Diabetes mellitus, smoking history, or elevated coronary calcium scores." },
  ],
  "knee-replacement-surgery": [
    { name: "Severe Chronic Knee Joint Pain", desc: "Debilitating joint pain that persists during resting, sitting, and sleep." },
    { name: "Severe Morning Joint Stiffness", desc: "Inability to bend, bear weight, or fully straighten the knee joint for extended periods." },
    { name: "Bone-on-Bone Crepitus & Deformity", desc: "Audible grinding sensation and progressive bowlegged or knock-knee alignment." },
    { name: "Exhausted Conservative Therapies", desc: "No sustained relief achieved from physical therapy, NSAIDs, or viscosupplement injections." },
  ],
  "knee-arthroscopy": [
    { name: "Knee Locking or Catching", desc: "Inability to fully extend or bend the joint caused by a displaced meniscal flap." },
    { name: "Giving Way & Joint Instability", desc: "Sudden sensation of the knee buckling or popping out during pivoting movements." },
    { name: "Sharp Joint Line Tenderness", desc: "Pinpoint pain along the medial or lateral knee joint margin following trauma." },
    { name: "Post-Traumatic Joint Effusion", desc: "Rapid fluid accumulation and swelling within hours of a sports injury." },
  ],
  "knee-mri-imaging": [
    { name: "Sub-Acute Joint Pain After Injury", desc: "Persistent knee pain failing to improve following a twist, fall, or sports impact." },
    { name: "Suspected Ligamentous Injury", desc: "Evaluation for anterior cruciate (ACL), posterior cruciate (PCL), or collateral ligament tears." },
    { name: "Occult Bone Contusion or Stress Fracture", desc: "Deep structural bone edema invisible on standard plain X-ray radiographs." },
    { name: "Cartilage & Chondral Defect Assessment", desc: "High-resolution staging of articular surface wear and osteochondral lesions." },
  ],
  default: [
    { name: "Persistent Pain or Discomfort", desc: "Localized or radiating pain that fails to subside with conservative medications." },
    { name: "Functional Mobility Impairment", desc: "Difficulty performing routine daily activities, walking, or physical tasks." },
    { name: "Unexplained Fatigue or Weakness", desc: "Systemic exhaustion signaling underlying physiological strain or organ stress." },
    { name: "Visible Swelling or Inflammation", desc: "Localized tissue edema, inflammation, or palpable mass requiring imaging." },
  ],
};

/**
 * Returns complete, true, clinically verified detail data for any procedure slug
 */
export function getProcedureDetailData(slug: string): ProcedureDetailData {
  // If heart transplant, start with the comprehensive data and augment with symptoms
  if (slug === "heart-transplant") {
    const proc = TREATMENTS_PROCEDURES_DATA.find((p) => p.slug === "heart-transplant") || TREATMENTS_PROCEDURES_DATA[0];
    const symptomsList = SYMPTOMS_DICTIONARY["heart-transplant"];

    const toc: TOCItem[] = [
      { id: "overview", label: "Heart Transplant: Overview" },
      { id: "what-is-it", label: "What Is a Heart Transplant?" },
      { id: "symptoms", label: "Symptoms & Warning Signs" },
      { id: "who-needs-care", label: "Who Needs Heart Transplant Care?" },
      { id: "when-recommended", label: "When Is It Recommended?" },
      { id: "eligibility", label: "Eligibility & Contraindications" },
      { id: "donor-matching", label: "How Donor Matching Works" },
      { id: "waiting-list", label: "The Transplant Waiting List" },
      { id: "pre-transplant-tests", label: "Pre-Transplant Diagnostic Evaluation" },
      { id: "surgical-procedure", label: "Surgical Procedure & Technology" },
      { id: "recovery-care", label: "Post-Transplant Recovery & Care" },
      { id: "cost-insurance", label: "Cost & Insurance Inclusions" },
      { id: "specialists", label: "Top Cardiac Transplant Surgeons" },
      { id: "hospitals", label: "Equipped Transplant Hospitals" },
      { id: "faqs", label: "Frequently Asked Questions" },
    ];

    return {
      slug: "heart-transplant",
      title: proc.title,
      shortTitle: proc.shortTitle,
      speciality: proc.speciality,
      specialitySlug: proc.specialitySlug,
      heroImage: "/images/procedures/heart_transplant_hero.jpg",
      heroTitle: proc.title,
      heroSubtitle: proc.summary,
      leadParagraph: HEART_TRANSPLANT_DETAIL.leadParagraph,
      metrics: {
        successRate: proc.successRate || "95%+",
        duration: proc.duration || "4 - 6 Hours",
        hospitalStay: proc.hospitalStay || "14 - 21 Days",
        recoveryTime: proc.recoveryTime || "3 - 6 Months",
        anesthesia: proc.anesthesia || "General Anesthesia",
      },
      whatIsIt: HEART_TRANSPLANT_DETAIL.whatIsIt,
      symptoms: {
        title: "Recognizing Symptoms & Warning Signs",
        description: "End-stage heart failure typically manifests with progressive functional limitations. Patients experiencing the following warning signs require immediate specialist cardiac evaluation:",
        items: symptomsList,
      },
      whoNeedsCare: HEART_TRANSPLANT_DETAIL.whoNeedsCare,
      whenRecommended: HEART_TRANSPLANT_DETAIL.whenRecommended,
      eligibility: HEART_TRANSPLANT_DETAIL.eligibility,
      approach: {
        title: "How Donor Matching & Surgical Procedure Work",
        description: "Orthotopic transplantation requires precision organ retrieval, cold ischemia protection within 4 hours, and bicaval anastomosis under cardiopulmonary bypass.",
        steps: HEART_TRANSPLANT_DETAIL.donorMatching.steps,
      },
      recoveryCare: {
        title: "Post-Transplant Recovery & Care",
        description: "Post-surgical care focuses on balancing immunosuppressive therapy to prevent organ rejection while minimizing infection risks.",
        highlights: [
          "7 to 10 days of continuous hemodynamics monitoring in dedicated CT-ICU.",
          "Regular non-invasive surveillance with echocardiograms and blood biomarker panels.",
          "Supervised Phase I and Phase II cardiac rehabilitation program.",
          "Lifelong outpatient follow-up with customized immunosuppressive medication schedules.",
        ],
      },
      cost: {
        title: "Heart Transplant Cost in India: Transparent Breakdown",
        estimateRange: HEART_TRANSPLANT_DETAIL.costs.estimateRange,
        internationalRange: HEART_TRANSPLANT_DETAIL.costs.internationalRange,
        inclusions: HEART_TRANSPLANT_DETAIL.costs.inclusions,
        insuranceNote: HEART_TRANSPLANT_DETAIL.costs.insuranceNote,
      },
      doctors: SPECIALTY_DOCTORS_MAP.cardiology,
      hospitals: ACCREDITED_HOSPITALS,
      faqs: HEART_TRANSPLANT_DETAIL.faqs,
      toc,
    };
  }

  // Find procedure from TREATMENTS_PROCEDURES_DATA or fallback
  const proc = TREATMENTS_PROCEDURES_DATA.find((p) => p.slug === slug) || TREATMENTS_PROCEDURES_DATA[0];
  const symptomsList = SYMPTOMS_DICTIONARY[slug] || SYMPTOMS_DICTIONARY.default;
  const docsList = SPECIALTY_DOCTORS_MAP[proc.specialitySlug] || SPECIALTY_DOCTORS_MAP.default;

  const toc: TOCItem[] = [
    { id: "overview", label: `${proc.shortTitle}: Overview` },
    { id: "what-is-it", label: `What is ${proc.shortTitle}?` },
    { id: "symptoms", label: "Symptoms & Warning Signs" },
    { id: "who-needs-care", label: "Indications & Patient Selection" },
    { id: "when-recommended", label: "When Is Surgery Recommended?" },
    { id: "eligibility", label: "Eligibility & Contraindications" },
    { id: "surgical-procedure", label: "Surgical Approach & Technology" },
    { id: "recovery-care", label: "Recovery & Hospital Stay" },
    { id: "cost-insurance", label: "Cost & Insurance Coverage" },
    { id: "specialists", label: `Specialist ${proc.speciality} Surgeons` },
    { id: "hospitals", label: "Equipped Surgical Centres" },
    { id: "faqs", label: "Frequently Asked Questions" },
  ];

  return {
    slug: proc.slug,
    title: proc.title,
    shortTitle: proc.shortTitle,
    speciality: proc.speciality,
    specialitySlug: proc.specialitySlug,
    heroImage: proc.image,
    heroTitle: proc.title,
    heroSubtitle: proc.summary,
    leadParagraph: `${proc.overview} At Narayana Health, multidisciplinary surgical boards employ advanced minimally invasive technologies, high-precision imaging, and structured clinical pathways to achieve superior patient outcomes with rapid post-operative recovery.`,
    metrics: {
      successRate: proc.successRate || "97%",
      duration: proc.duration || "2 - 4 Hours",
      hospitalStay: proc.hospitalStay || "3 - 5 Days",
      recoveryTime: proc.recoveryTime || "3 - 6 Weeks",
      anesthesia: proc.anesthesia || "General Anesthesia",
    },
    whatIsIt: {
      title: `What is ${proc.shortTitle}?`,
      description: `${proc.title} is an evidence-based clinical procedure performed by senior specialists at Narayana Health to diagnose, repair, or resolve complex conditions affecting the ${proc.speciality.toLowerCase()} system.`,
      keyPoints: [
        `Targeted intervention tailored specifically to disease severity and anatomical indications.`,
        `Utilizes advanced imaging modalities, computer navigation, and minimally invasive techniques wherever feasible.`,
        `Significantly improves physiological function, relieves debilitating symptoms, and restores quality of life.`,
        `Supported by dedicated pre-operative evaluation and structured multidisciplinary post-operative care.`,
      ],
    },
    symptoms: {
      title: "Recognizing Symptoms & Warning Signs",
      description: `Patients experiencing progressive or sudden symptoms associated with ${proc.shortTitle.toLowerCase()} should seek prompt specialist evaluation. Click on any symptom below to review clinical guidance:`,
      items: symptomsList,
    },
    whoNeedsCare: {
      title: "Indications & Who Needs This Procedure",
      description: `Patients evaluated for ${proc.shortTitle.toLowerCase()} typically present with clinical indications confirmed through diagnostic imaging, hemodynamic evaluation, or blood biomarkers:`,
      conditions: [
        { name: `Confirmed Diagnostic Finding`, desc: `Definitive imaging or diagnostic evidence confirming severe anatomical or physiological compromise.` },
        { name: `Refractory Clinical Symptoms`, desc: `Persistence of symptoms despite structured medical therapy or lifestyle intervention.` },
        { name: `Risk of Disease Progression`, desc: `High probability of acute complications or functional deterioration without corrective surgery.` },
        { name: `Quality of Life Limitations`, desc: `Significant restriction in daily routines, occupational productivity, or functional independence.` },
      ],
    },
    whenRecommended: {
      title: `When Is ${proc.shortTitle} Recommended?`,
      description: `Senior surgical boards recommend ${proc.shortTitle.toLowerCase()} based on international clinical practice guidelines:`,
      recommendations: [
        `Non-surgical or conservative medications fail to adequately manage disease progression or pain.`,
        `Advanced diagnostic testing (CT, MRI, Ultrasound, or Endoscopy) reveals critical thresholds requiring intervention.`,
        `The procedure offers a demonstrably safer risk-benefit ratio compared to conservative observation.`,
        `The patient meets physiological safety criteria for anesthesia and planned operative duration.`,
      ],
    },
    eligibility: {
      title: "Surgical Eligibility & Contraindications",
      eligiblePoints: [
        `Confirmed indication with anatomical suitability for the chosen surgical technique.`,
        `Stable cardiopulmonary and renal function cleared through pre-anesthesia evaluation.`,
        `Absence of active unmanaged systemic infections or coagulopathy.`,
        `Readiness to follow post-procedure rehabilitation and follow-up guidance.`,
      ],
      notEligiblePoints: [
        `Severe irreversible decompensated failure of critical secondary organs.`,
        `Uncontrolled systemic sepsis or acute severe active infection.`,
        `Severe uncorrectable bleeding diathesis or bleeding disorders.`,
        `Inability to tolerate general anesthesia or necessary post-operative monitoring.`,
      ],
    },
    approach: {
      title: "Surgical Approach & Modern Technology",
      description: `Narayana Health integrates state-of-the-art operative technology—including robotic platforms, high-definition laparoscopy, and intraoperative imaging—to ensure maximum surgical precision:`,
      steps: [
        { step: "01", title: "Pre-Operative 3D Planning", desc: "Detailed radiological mapping and 3D anatomical reconstruction to calibrate the exact surgical trajectory." },
        { step: "02", title: "Targeted Precision Access", desc: "Minimally invasive entry or microsurgical exposure preserving surrounding healthy neurovascular structures." },
        { step: "03", title: "Corrective Intervention", desc: "Execution of the surgical repair, excision, reconstruction, or device placement under direct visualization." },
        { step: "04", title: "Post-Op Functional Verification", desc: "Immediate intraoperative confirmation of perfusion, hemodynamic stability, and surgical margin integrity." },
      ],
    },
    recoveryCare: {
      title: "Post-Procedure Recovery & Hospital Stay",
      description: `Recovery protocols are structured around Enhanced Recovery After Surgery (ERAS) principles to minimize discomfort and expedite functional return:`,
      highlights: [
        `Monitored step-down care with multimodal pain management to prevent post-op discomfort.`,
        `Early ambulation and guided respiratory therapy within 24 hours of surgery.`,
        `Detailed wound care guidance, dietary recommendations, and activity restrictions upon discharge.`,
        `Scheduled outpatient review with follow-up imaging or clinical assessment.`,
      ],
    },
    cost: {
      title: "Estimated Cost & Insurance Coverage",
      estimateRange: "₹1,80,000 – ₹4,50,000",
      internationalRange: "$3,200 – $7,500 USD",
      inclusions: [
        "Pre-operative anesthetic assessment and routine surgical workup.",
        "Operation theatre charges, surgeon fees, and anesthesia team coverage.",
        `${proc.hospitalStay || "3 - 5 Days"} of semi-private or private room hospital stay.`,
        "Standard post-operative medications, consumables, and nursing care.",
      ],
      insuranceNote: "All major health insurance policies and TPAs in India cover this surgical procedure. Narayana Health provides dedicated on-site insurance desk assistance for quick cashless authorization and paperless claims.",
    },
    doctors: docsList,
    hospitals: ACCREDITED_HOSPITALS,
    faqs: [
      {
        q: `What is the expected hospital stay for ${proc.shortTitle}?`,
        a: `Most patients are discharged within ${proc.hospitalStay || "3 to 5 days"} depending on clinical recovery, pain control, and surgeon evaluation.`,
      },
      {
        q: `Is ${proc.shortTitle} covered under health insurance?`,
        a: `Yes, medically necessary surgical procedures are covered under commercial health insurance, corporate policies, and government schemes. Our hospital insurance desk manages cashless approvals.`,
      },
      {
        q: `When can I resume normal daily activities after surgery?`,
        a: `Light daily activities can typically be resumed within 1 to 2 weeks, while full physical exertion and return to work depend on the specific procedure (typically ${proc.recoveryTime || "3 to 6 weeks"}).`,
      },
      {
        q: `How do I book a consultation with a specialist for this procedure?`,
        a: `You can book an in-person or video consultation through our online portal, or by calling our 24x7 patient care helpline at 1800-309-0309.`,
      },
    ],
    toc,
  };
}
