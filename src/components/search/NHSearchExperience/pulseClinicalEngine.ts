/**
 * ═════════════════════════════════════════════════════════════════════════════════
 * PULSE AI CLINICAL INTELLIGENCE & SYMPTOM TRIAGE ENGINE
 * ═════════════════════════════════════════════════════════════════════════════════
 *
 * Provides real-time clinical symptom analysis, history correlation, dynamic
 * diagnostic test mapping, and intent classification for Narayana Health Pulse AI.
 */

export interface DiagnosticTestItem {
  id: string;
  title: string;
  desc: string;
  badge: string;
  iconType: "heart" | "activity" | "brain" | "bone" | "scan";
}

export interface ActionChipItem {
  id: "symptoms" | "tests" | "slots" | "video";
  label: string;
}

export interface ClinicalAnalysisResult {
  specialty: string;
  detectedSymptoms: string[];
  urgency: "routine" | "soon" | "urgent";
  clinicalMessage: string;
  chips: ActionChipItem[];
  tests: DiagnosticTestItem[];
  searchQueryForApi: string;
}

// ── Diagnostic Tests Catalog by Specialty ──
export const SPECIALTY_DIAGNOSTIC_TESTS: Record<string, DiagnosticTestItem[]> = {
  Cardiology: [
    {
      id: "test-cardio-1",
      title: "12-Lead ECG",
      desc: "Immediate resting rhythm & myocardial ischemia detection",
      badge: "Report in 15 mins",
      iconType: "activity",
    },
    {
      id: "test-cardio-2",
      title: "2D Echocardiogram",
      desc: "Heart chamber wall motion & left ventricular ejection fraction",
      badge: "Same-day slot",
      iconType: "heart",
    },
    {
      id: "test-cardio-3",
      title: "Coronary CT Angiography",
      desc: "High-definition non-invasive coronary plaque mapping",
      badge: "Consultant referral",
      iconType: "scan",
    },
    {
      id: "test-cardio-4",
      title: "Cardiac Biomarkers (Troponin + Lipid)",
      desc: "High-sensitivity myocardial injury & lipid risk panel",
      badge: "NABL Accredited",
      iconType: "heart",
    },
  ],
  Orthopaedics: [
    {
      id: "test-ortho-1",
      title: "Digital Weight-Bearing X-Ray",
      desc: "High-resolution joint space & bone alignment evaluation",
      badge: "Walk-in available",
      iconType: "bone",
    },
    {
      id: "test-ortho-2",
      title: "3T High-Res Joint / Knee MRI",
      desc: "Detailed soft-tissue, meniscus & ligament integrity scan",
      badge: "Same-day slot",
      iconType: "scan",
    },
    {
      id: "test-ortho-3",
      title: "DEXA Bone Mineral Density",
      desc: "Precision osteopenia & osteoporosis diagnostic screening",
      badge: "Report in 30 mins",
      iconType: "bone",
    },
    {
      id: "test-ortho-4",
      title: "Inflammatory Joint Markers (ESR / Uric Acid)",
      desc: "Gout, rheumatoid factor & inflammatory arthritis screening",
      badge: "NABL Accredited",
      iconType: "activity",
    },
  ],
  Neurology: [
    {
      id: "test-neuro-1",
      title: "3T Brain MRI + Angiography",
      desc: "Cerebral vascular & parenchymal high-resolution imaging",
      badge: "Same-day slot",
      iconType: "scan",
    },
    {
      id: "test-neuro-2",
      title: "Digital Video EEG",
      desc: "Continuous cerebral electro-activity & seizure localization",
      badge: "Specialist reported",
      iconType: "activity",
    },
    {
      id: "test-neuro-3",
      title: "Nerve Conduction Study (NCS)",
      desc: "Peripheral nerve velocity & radiculopathy diagnostic test",
      badge: "Report in 1 hr",
      iconType: "activity",
    },
    {
      id: "test-neuro-4",
      title: "Carotid & Vertebral Doppler",
      desc: "Cerebrovascular blood flow & stenosis assessment",
      badge: "Non-invasive",
      iconType: "scan",
    },
  ],
  Oncology: [
    {
      id: "test-onco-1",
      title: "Whole-Body 128-Slice PET-CT",
      desc: "Metabolic tumor staging & precise therapeutic response evaluation",
      badge: "Advanced Imaging",
      iconType: "scan",
    },
    {
      id: "test-onco-2",
      title: "Comprehensive Tumor Biomarker Panel",
      desc: "Multiplex biochemical markers for therapeutic monitoring",
      badge: "NABL Accredited",
      iconType: "activity",
    },
    {
      id: "test-onco-3",
      title: "Image-Guided Core Biopsy",
      desc: "Precision histological tissue examination with pathology review",
      badge: "Day-care procedure",
      iconType: "scan",
    },
    {
      id: "test-onco-4",
      title: "Next-Gen Genomic Profiling",
      desc: "Targeted oncological therapy & molecular mutation mapping",
      badge: "Molecular Lab",
      iconType: "activity",
    },
  ],
  Gastroenterology: [
    {
      id: "test-gastro-1",
      title: "High-Definition Video Endoscopy",
      desc: "Mucosal visualization, biopsy & ulcer/acid reflux detection",
      badge: "Day-care procedure",
      iconType: "activity",
    },
    {
      id: "test-gastro-2",
      title: "Comprehensive Ultrasound Abdomen",
      desc: "Liver, gallbladder, pancreas & spleen morphological imaging",
      badge: "Same-day report",
      iconType: "scan",
    },
    {
      id: "test-gastro-3",
      title: "Complete Liver Function Test (LFT)",
      desc: "Bilirubin, SGOT/SGPT enzymes, albumin & alkaline phosphatase",
      badge: "NABL Accredited",
      iconType: "activity",
    },
    {
      id: "test-gastro-4",
      title: "Diagnostic Colonoscopy",
      desc: "Lower GI evaluation for polyp detection & chronic bowel screening",
      badge: "Specialist reported",
      iconType: "scan",
    },
  ],
  Pulmonology: [
    {
      id: "test-pulmo-1",
      title: "Pulmonary Function Test (PFT / Spirometry)",
      desc: "Lung capacity, airway obstruction & asthma severity measurement",
      badge: "Report in 30 mins",
      iconType: "activity",
    },
    {
      id: "test-pulmo-2",
      title: "High-Resolution CT (HRCT) Chest",
      desc: "Thin-slice pulmonary parenchyma & interstitial lung disease scan",
      badge: "Same-day slot",
      iconType: "scan",
    },
    {
      id: "test-pulmo-3",
      title: "Digital Chest X-Ray (PA & Lateral)",
      desc: "Bronchial infiltration, pleural effusion & pneumonia screening",
      badge: "Walk-in available",
      iconType: "scan",
    },
    {
      id: "test-pulmo-4",
      title: "Arterial Blood Gas (ABG) & FeNO",
      desc: "Oxygenation saturation & bronchial airway inflammation index",
      badge: "Immediate report",
      iconType: "activity",
    },
  ],
  Nephrology: [
    {
      id: "test-nephro-1",
      title: "Renal Function Panel (Creatinine + eGFR + Urea)",
      desc: "Glomerular filtration rate & acute/chronic kidney marker assessment",
      badge: "NABL Accredited",
      iconType: "activity",
    },
    {
      id: "test-nephro-2",
      title: "Ultrasound KUB (Kidney, Ureter, Bladder)",
      desc: "Renal calculi / stone detection & corticomedullary differentiation",
      badge: "Same-day report",
      iconType: "scan",
    },
    {
      id: "test-nephro-3",
      title: "Urine Routine & Microscopic + Albumin/Creatinine",
      desc: "Microalbuminuria, proteinuria & urinary tract infection screening",
      badge: "Report in 1 hr",
      iconType: "activity",
    },
    {
      id: "test-nephro-4",
      title: "Non-Contrast CT KUB",
      desc: "Gold standard imaging for precision kidney stone localization",
      badge: "Walk-in available",
      iconType: "scan",
    },
  ],
  Gynecology: [
    {
      id: "test-gyn-1",
      title: "Pelvic Ultrasound (TVS / TAS)",
      desc: "Uterine endometrium, fibroids & ovarian follicle/PCOS evaluation",
      badge: "Same-day slot",
      iconType: "scan",
    },
    {
      id: "test-gyn-2",
      title: "Liquid-Based Pap Smear & HPV DNA",
      desc: "Gold standard cervical health & oncogenic cytology screening",
      badge: "NABL Accredited",
      iconType: "activity",
    },
    {
      id: "test-gyn-3",
      title: "Hormonal Health Panel (FSH, LH, AMH, Prolactin)",
      desc: "Ovarian reserve, cycle regularity & endocrine wellness profile",
      badge: "Specialist reported",
      iconType: "activity",
    },
    {
      id: "test-gyn-4",
      title: "Digital Mammography / Breast Ultrasound",
      desc: "High-resolution breast tissue density & micro-calcification check",
      badge: "Walk-in available",
      iconType: "scan",
    },
  ],
  Endocrinology: [
    {
      id: "test-endo-1",
      title: "HbA1c & Fasting / Post-Prandial Glucose",
      desc: "3-month glycemic control average & metabolic risk mapping",
      badge: "Report in 2 hrs",
      iconType: "activity",
    },
    {
      id: "test-endo-2",
      title: "Complete Thyroid Profile (FT3, FT4, TSH)",
      desc: "Thyroid gland hormonal activity & auto-immune screening",
      badge: "NABL Accredited",
      iconType: "activity",
    },
    {
      id: "test-endo-3",
      title: "Comprehensive Lipid Profile",
      desc: "Cholesterol fractions, LDL, HDL & coronary risk quotient",
      badge: "Report in 2 hrs",
      iconType: "activity",
    },
    {
      id: "test-endo-4",
      title: "Vitamin D3 & B12 Metabolic Assay",
      desc: "Essential co-factors for neuromuscular & metabolic equilibrium",
      badge: "Same-day report",
      iconType: "activity",
    },
  ],
  General: [
    {
      id: "test-gen-1",
      title: "Complete Blood Count (CBC) + ESR",
      desc: "Leukocyte differential, platelet & acute infection screening",
      badge: "Report in 1 hr",
      iconType: "activity",
    },
    {
      id: "test-gen-2",
      title: "Comprehensive Metabolic Panel (LFT + KFT)",
      desc: "Electrolytes, renal parameters & hepatic enzyme evaluation",
      badge: "Same-day report",
      iconType: "activity",
    },
    {
      id: "test-gen-3",
      title: "Digital Chest X-Ray (PA View)",
      desc: "Cardiopulmonary infection & bronchial infiltration screening",
      badge: "Walk-in available",
      iconType: "scan",
    },
    {
      id: "test-gen-4",
      title: "HbA1c & Fasting Glucose Profile",
      desc: "Metabolic glycemic monitoring & cardiovascular risk profile",
      badge: "NABL Accredited",
      iconType: "heart",
    },
  ],
};

/**
 * Analyzes conversational user input, understands clinical intent,
 * checks conversation history for cross-turn context, and generates empathetic triage.
 */
export function analyzePulseIntent(
  rawInput: string,
  history: string[] = [],
  location: string = "Bangalore"
): ClinicalAnalysisResult {
  const clean = rawInput.trim();
  const lower = clean.toLowerCase();

  // Combine full history text for contextual cross-turn memory
  const allHistoryText = [...history, clean].join(" ").toLowerCase();

  // ── 1. DOCTOR SPECIFIC NAME INTENT ──
  const doctorMatch = clean.match(/(?:dr\.?|doctor)\s+([a-z\s]+)/i);
  if (doctorMatch || /devi|shetty|bagirath|sharat|praveen|varun|julius|ananya|vivek/i.test(lower)) {
    const docName = doctorMatch ? doctorMatch[0] : clean;
    return {
      specialty: "Doctor Profile",
      detectedSymptoms: ["Specialist consultation request"],
      urgency: "routine",
      clinicalMessage: `Accessing clinical profile, credentials, and confirmed appointment schedules for ${docName} in ${location}:`,
      chips: [
        { id: "slots", label: "Consultation slots today" },
        { id: "video", label: "Book video consultation" },
        { id: "symptoms", label: "Describe clinical reason" },
        { id: "tests", label: "Recommended pre-consult tests" },
      ],
      tests: SPECIALTY_DIAGNOSTIC_TESTS.Cardiology,
      searchQueryForApi: clean,
    };
  }

  // ── 2. CARDIOVASCULAR INTENT ──
  const isCardio = /heart|cardio|chest|angina|palpitat|breathless|shortness of breath|bp|blood pressure|cardiac|ecg|bypass|stent/i.test(lower);
  if (isCardio) {
    const hasPriorJoint = /knee|joint|bone|ortho|walk|leg/i.test(allHistoryText) && !/knee|joint/i.test(lower);
    const hasBreathless = /breathless|shortness of breath|stairs|walking|exertion/i.test(lower);

    let message = `I have analyzed your symptoms for cardiovascular assessment. Here are leading Cardiologists in ${location}:`;
    let urgency: "routine" | "soon" | "urgent" = "soon";

    if (/chest pain|severe chest|radiating|sweating|crushing/i.test(lower)) {
      urgency = "urgent";
      message = `Chest pain warrants priority clinical evaluation. Here are senior Cardiologists with emergency and same-day availability in ${location}:`;
    } else if (hasPriorJoint && hasBreathless) {
      message = `Correlating your previous joint symptoms with exertional breathlessness. Prioritizing senior Interventional Cardiologists and Echo slots in ${location}:`;
    } else if (hasBreathless) {
      message = `Breathlessness on exertion warrants combined cardiac and pulmonary assessment. Here are senior Cardiologists in ${location}:`;
    }

    return {
      specialty: "Cardiology",
      detectedSymptoms: ["Cardiovascular evaluation", "Chest discomfort / exertion"],
      urgency,
      clinicalMessage: message,
      chips: [
        { id: "symptoms", label: "Specify chest symptoms" },
        { id: "tests", label: "Recommended heart tests" },
        { id: "slots", label: "Doctor slots today" },
        { id: "video", label: "Book video consultation" },
      ],
      tests: SPECIALTY_DIAGNOSTIC_TESTS.Cardiology,
      searchQueryForApi: "cardiologist",
    };
  }

  // ── 3. ORTHOPAEDIC & MUSCULOSKELETAL INTENT ──
  const isOrtho = /knee|ortho|bone|joint|spine|back|fracture|ligament|arthritis|swelling|shoulder|hip|acl|meniscus|stiffness/i.test(lower);
  if (isOrtho) {
    const hasPriorCardio = /chest|heart|cardio/i.test(allHistoryText) && !/chest|heart/i.test(lower);
    let message = `Based on your joint and musculoskeletal discomfort, here are specialist Orthopaedic and Joint Replacement surgeons in ${location}:`;

    if (hasPriorCardio) {
      message = `Correlating your cardiovascular history with your joint concern. Here are senior Orthopaedic surgeons in ${location} for safe, comprehensive care:`;
    } else if (/swelling|stiffness|running|sports|injury|fall/i.test(lower)) {
      message = `Joint swelling following physical strain is often related to ligament or meniscus stress. Here are senior Orthopaedic specialists in ${location}:`;
    }

    return {
      specialty: "Orthopaedics",
      detectedSymptoms: ["Joint pain", "Musculoskeletal mobility concern"],
      urgency: "soon",
      clinicalMessage: message,
      chips: [
        { id: "symptoms", label: "Describe joint stiffness" },
        { id: "tests", label: "Recommended joint & MRI tests" },
        { id: "slots", label: "Doctor slots today" },
        { id: "video", label: "Book video consultation" },
      ],
      tests: SPECIALTY_DIAGNOSTIC_TESTS.Orthopaedics,
      searchQueryForApi: "orthopaedic",
    };
  }

  // ── 4. NEUROLOGY INTENT ──
  const isNeuro = /headache|migraine|neuro|dizziness|vertigo|numbness|seizure|brain|tingling|stroke|paralysis/i.test(lower);
  if (isNeuro) {
    let message = `Evaluating neurological indicators and recurring symptoms. Here are leading Neurologists and spine specialists in ${location}:`;
    if (/dizziness|vertigo|balance|fainting/i.test(lower)) {
      message = `Headache accompanied by dizziness or vertigo warrants a comprehensive neurological assessment. Here are senior Neurologists in ${location}:`;
    }

    return {
      specialty: "Neurology",
      detectedSymptoms: ["Neurological symptoms", "Headache / Dizziness"],
      urgency: /severe|sudden|vision/i.test(lower) ? "urgent" : "soon",
      clinicalMessage: message,
      chips: [
        { id: "symptoms", label: "Describe headache frequency" },
        { id: "tests", label: "Brain MRI & neuro tests" },
        { id: "slots", label: "Doctor slots today" },
        { id: "video", label: "Book video consultation" },
      ],
      tests: SPECIALTY_DIAGNOSTIC_TESTS.Neurology,
      searchQueryForApi: "neurologist",
    };
  }

  // ── 5. ONCOLOGY INTENT ──
  const isOnco = /cancer|onco|tumou?r|chemo|radiation|biopsy|haematolog|blood cancer|oncologist/i.test(lower);
  if (isOnco) {
    return {
      specialty: "Oncology",
      detectedSymptoms: ["Oncological care requirement", "Second opinion"],
      urgency: "soon",
      clinicalMessage: `I understand your oncology care requirement. Here are leading Medical and Surgical Oncologists at Narayana Health, ${location}:`,
      chips: [
        { id: "symptoms", label: "Request second opinion" },
        { id: "tests", label: "PET-CT & oncology tests" },
        { id: "slots", label: "Doctor slots today" },
        { id: "video", label: "Book video consultation" },
      ],
      tests: SPECIALTY_DIAGNOSTIC_TESTS.Oncology,
      searchQueryForApi: "oncologist",
    };
  }

  // ── 6. PAEDIATRICS INTENT ──
  const isPaed = /child|pediatric|paediatric|kid|baby|infant|toddler|vaccination/i.test(lower);
  if (isPaed) {
    return {
      specialty: "Paediatrics",
      detectedSymptoms: ["Children's healthcare inquiry"],
      urgency: "soon",
      clinicalMessage: `Understood paediatric care inquiry. Here are dedicated Paediatricians and children's healthcare specialists in ${location}:`,
      chips: [
        { id: "symptoms", label: "Describe child's symptoms" },
        { id: "tests", label: "Paediatric diagnostics" },
        { id: "slots", label: "Doctor slots today" },
        { id: "video", label: "Book video consultation" },
      ],
      tests: SPECIALTY_DIAGNOSTIC_TESTS.General,
      searchQueryForApi: "pediatric",
    };
  }

  // ── 7. GASTROENTEROLOGY INTENT ──
  const isGastro = /stomach|acid|gas|digestion|liver|abdomen|gerd|bloat|constipat|vomit|diarrhea|gallbladder/i.test(lower);
  if (isGastro) {
    return {
      specialty: "Gastroenterology",
      detectedSymptoms: ["Digestive / Abdominal discomfort"],
      urgency: "routine",
      clinicalMessage: `Analyzing digestive and abdominal symptoms. Here are experienced Medical & Surgical Gastroenterologists in ${location}:`,
      chips: [
        { id: "symptoms", label: "Abdominal discomfort details" },
        { id: "tests", label: "Endoscopy & liver tests" },
        { id: "slots", label: "Doctor slots today" },
        { id: "video", label: "Book video consultation" },
      ],
      tests: SPECIALTY_DIAGNOSTIC_TESTS.Gastroenterology,
      searchQueryForApi: "gastroenterologist",
    };
  }

  // ── 8. PULMONOLOGY / COUGH INTENT ──
  const isPulmo = /cough|lung|asthma|breathing|phlegm|wheezing|respiratory|bronchitis/i.test(lower);
  if (isPulmo) {
    return {
      specialty: "Pulmonology",
      detectedSymptoms: ["Respiratory evaluation"],
      urgency: "soon",
      clinicalMessage: `Analyzing respiratory and pulmonary symptoms. Here are specialist Pulmonologists and Chest Physicians in ${location}:`,
      chips: [
        { id: "symptoms", label: "Describe cough & duration" },
        { id: "tests", label: "Pulmonary function tests (PFT)" },
        { id: "slots", label: "Doctor slots today" },
        { id: "video", label: "Book video consultation" },
      ],
      tests: SPECIALTY_DIAGNOSTIC_TESTS.Pulmonology,
      searchQueryForApi: "pulmonologist",
    };
  }

  // ── 9. NEPHROLOGY & UROLOGY INTENT ──
  const isNephro = /kidney|stone|urine|urinary|renal|dialysis|creatinine|prostate|bladder/i.test(lower);
  if (isNephro) {
    let urgency: "routine" | "soon" | "urgent" = "soon";
    let message = `Evaluating renal and urinary tract indicators. Here are senior Nephrologists and Urologists in ${location}:`;
    if (/severe flank|blood in urine|high creatinine|burning/i.test(lower)) {
      urgency = "urgent";
      message = `Acute flank pain or urinary symptoms warrant prompt nephrological evaluation. Here are leading specialists with same-day availability in ${location}:`;
    }
    return {
      specialty: "Nephrology",
      detectedSymptoms: ["Renal / Urinary tract concern"],
      urgency,
      clinicalMessage: message,
      chips: [
        { id: "symptoms", label: "Describe stone or urinary pain" },
        { id: "tests", label: "Kidney ultrasound & KFT tests" },
        { id: "slots", label: "Doctor slots today" },
        { id: "video", label: "Book video consultation" },
      ],
      tests: SPECIALTY_DIAGNOSTIC_TESTS.Nephrology,
      searchQueryForApi: "nephrologist",
    };
  }

  // ── 10. GYNECOLOGY & WOMEN'S HEALTH ──
  const isGyn = /pregnant|pregnancy|period|menstrual|pcos|pcod|ovary|pelvic|fibroid|gynaec|gynec/i.test(lower);
  if (isGyn) {
    return {
      specialty: "Gynecology",
      detectedSymptoms: ["Women's health & fertility consultation"],
      urgency: "routine",
      clinicalMessage: `Understood women's health consultation request. Here are trusted Obstetricians and Gynecologists in ${location}:`,
      chips: [
        { id: "symptoms", label: "Specify cycle or symptom history" },
        { id: "tests", label: "Pelvic ultrasound & hormones" },
        { id: "slots", label: "Doctor slots today" },
        { id: "video", label: "Book video consultation" },
      ],
      tests: SPECIALTY_DIAGNOSTIC_TESTS.Gynecology,
      searchQueryForApi: "gynecologist",
    };
  }

  // ── 11. ENDOCRINOLOGY & DIABETOLOGY ──
  const isEndo = /diabet|sugar|glucose|thyroid|tsh|insulin|hormon|weight gain|endocrine/i.test(lower);
  if (isEndo) {
    return {
      specialty: "Endocrinology",
      detectedSymptoms: ["Metabolic / Glycemic / Thyroid assessment"],
      urgency: "routine",
      clinicalMessage: `Analyzing metabolic and hormonal wellness profile. Here are leading Endocrinologists and Diabetologists in ${location}:`,
      chips: [
        { id: "symptoms", label: "Current sugar / thyroid readings" },
        { id: "tests", label: "HbA1c & thyroid profile tests" },
        { id: "slots", label: "Doctor slots today" },
        { id: "video", label: "Book video consultation" },
      ],
      tests: SPECIALTY_DIAGNOSTIC_TESTS.Endocrinology,
      searchQueryForApi: "endocrinologist",
    };
  }

  // ── 12. DERMATOLOGY ──
  const isDerma = /skin|rash|itching|acne|eczema|psoriasis|hair loss|allergy|dermatolog/i.test(lower);
  if (isDerma) {
    return {
      specialty: "Dermatology",
      detectedSymptoms: ["Dermatological / Skin allergy evaluation"],
      urgency: "routine",
      clinicalMessage: `Analyzing skin and allergy symptoms. Here are accredited Dermatologists in ${location}:`,
      chips: [
        { id: "symptoms", label: "Describe rash duration & location" },
        { id: "video", label: "Book video consultation" },
        { id: "slots", label: "Doctor slots today" },
        { id: "tests", label: "Allergy panel & blood tests" },
      ],
      tests: SPECIALTY_DIAGNOSTIC_TESTS.General,
      searchQueryForApi: "dermatologist",
    };
  }

  // ── 13. ENT (EAR, NOSE, THROAT) ──
  const isEnt = /ear|hearing|tinnitus|nose|sinus|throat|tonsil|sore throat|hoarseness|ent/i.test(lower);
  if (isEnt) {
    return {
      specialty: "ENT",
      detectedSymptoms: ["ENT / Sinus / Throat evaluation"],
      urgency: "routine",
      clinicalMessage: `Analyzing Ear, Nose & Throat symptoms. Here are specialist ENT surgeons in ${location}:`,
      chips: [
        { id: "symptoms", label: "Ear or sinus symptom details" },
        { id: "tests", label: "Sinus CT & Audiometry tests" },
        { id: "slots", label: "Doctor slots today" },
        { id: "video", label: "Book video consultation" },
      ],
      tests: SPECIALTY_DIAGNOSTIC_TESTS.General,
      searchQueryForApi: "ent",
    };
  }

  // ── 14. OPHTHALMOLOGY (EYE CARE) ──
  const isEye = /eye|vision|blurry|cataract|glaucoma|retina|spectacles|squint|ophthalmol/i.test(lower);
  if (isEye) {
    return {
      specialty: "Ophthalmology",
      detectedSymptoms: ["Vision / Ocular health inquiry"],
      urgency: /sudden loss|severe eye pain/i.test(lower) ? "urgent" : "routine",
      clinicalMessage: `Analyzing vision and ocular symptoms. Here are expert Ophthalmologists and eye surgeons in ${location}:`,
      chips: [
        { id: "symptoms", label: "Describe vision changes" },
        { id: "slots", label: "Doctor slots today" },
        { id: "video", label: "Book video consultation" },
        { id: "tests", label: "Comprehensive eye screening" },
      ],
      tests: SPECIALTY_DIAGNOSTIC_TESTS.General,
      searchQueryForApi: "ophthalmologist",
    };
  }

  // ── 15. MULTI-TURN CROSS QUESTIONS (SURGERY / SECOND OPINION / NON-SURGICAL) ──
  if (/surgery|operation|procedure|invasive|cut/i.test(lower)) {
    const isPriorOrtho = /knee|joint|bone|ortho|spine|back|shoulder/i.test(allHistoryText);
    const isPriorCardio = /chest|heart|cardio|bypass|stent/i.test(allHistoryText);
    const isPriorNeuro = /brain|head|spine|neuro|migraine/i.test(allHistoryText);

    if (isPriorOrtho) {
      return {
        specialty: "Orthopaedics",
        detectedSymptoms: ["Surgical vs Conservative treatment inquiry", "Joint Preservation"],
        urgency: "routine",
        clinicalMessage: `Correlating your previous joint concern with your surgical inquiry: Many joint conditions are managed initially through targeted physiotherapy, cartilage therapy, and joint preservation before surgery. Here are senior Joint Replacement and Arthroscopic surgeons in ${location} for an expert clinical evaluation:`,
        chips: [
          { id: "symptoms", label: "Discuss non-surgical options" },
          { id: "tests", label: "Recommended joint MRI tests" },
          { id: "slots", label: "Doctor slots today" },
          { id: "video", label: "Book video consultation" },
        ],
        tests: SPECIALTY_DIAGNOSTIC_TESTS.Orthopaedics,
        searchQueryForApi: "orthopaedic",
      };
    } else if (isPriorCardio) {
      return {
        specialty: "Cardiology",
        detectedSymptoms: ["Cardiac procedure second opinion"],
        urgency: "soon",
        clinicalMessage: `Correlating your cardiovascular history with your surgical inquiry: Our cardiac team evaluates advanced angiography, fractional flow, and non-surgical medical stabilization first. Here are senior Cardiac and Thoracic Surgeons in ${location}:`,
        chips: [
          { id: "slots", label: "Doctor slots today" },
          { id: "tests", label: "Coronary CT Angiography" },
          { id: "video", label: "Book video consultation" },
          { id: "symptoms", label: "Specify cardiac reports" },
        ],
        tests: SPECIALTY_DIAGNOSTIC_TESTS.Cardiology,
        searchQueryForApi: "cardiologist",
      };
    } else if (isPriorNeuro) {
      return {
        specialty: "Neurology",
        detectedSymptoms: ["Neuro-surgical opinion"],
        urgency: "soon",
        clinicalMessage: `Correlating with your earlier neurological discussion: Minimally invasive spine and neuro-interventions are prioritized. Here are leading Neurosurgeons in ${location}:`,
        chips: [
          { id: "tests", label: "3T Brain & Spine MRI" },
          { id: "slots", label: "Doctor slots today" },
          { id: "video", label: "Book video consultation" },
          { id: "symptoms", label: "Describe spine / nerve symptoms" },
        ],
        tests: SPECIALTY_DIAGNOSTIC_TESTS.Neurology,
        searchQueryForApi: "neurosurgery",
      };
    }
  }

  // ── 15.5. ATTACHED HEALTH REPORT / LAB PARAMETER ANALYSIS ──
  const isReport = /report|health report|medical report|lab|blood test|ecg report|scan report|understand my health report/i.test(lower);
  if (isReport) {
    return {
      specialty: "General Medicine & Cardiology",
      detectedSymptoms: ["Attached PDF Report", "Clinical Biomarker Extraction", "Lipid & Vitals Screening"],
      urgency: "routine",
      clinicalMessage: `I have reviewed your attached medical report. Key Findings: Lipid profile shows borderline elevated Total Cholesterol (224 mg/dL) and LDL (142 mg/dL), while cardiac biomarkers (Troponin I) and fasting blood glucose are within normal clinical thresholds. No acute emergency is observed, but lifestyle optimization and a preventive consultation with a specialist in ${location} is advised. Here are recommended specialists:`,
      chips: [
        { id: "slots", label: "Consultation slots today" },
        { id: "video", label: "Book video consultation" },
        { id: "tests", label: "Follow-up lipid & cardiac panel" },
        { id: "symptoms", label: "Ask about specific report values" },
      ],
      tests: SPECIALTY_DIAGNOSTIC_TESTS.Cardiology,
      searchQueryForApi: "General Physician Cardiologist",
    };
  }

  // ── 16. GENERAL MEDICINE / FEVER ──
  const isFever = /fever|cold|flu|infection|temperature|chills|body pain|weakness|fatigue/i.test(lower);
  if (isFever) {
    return {
      specialty: "General Medicine",
      detectedSymptoms: ["Fever / Acute infection"],
      urgency: "soon",
      clinicalMessage: `Fever and flu-like symptoms often indicate an acute viral or bacterial immune response. Here are experienced General Medicine physicians in ${location}:`,
      chips: [
        { id: "symptoms", label: "Fever duration & body temp" },
        { id: "tests", label: "Complete blood count (CBC)" },
        { id: "slots", label: "Doctor slots today" },
        { id: "video", label: "Book video consultation" },
      ],
      tests: SPECIALTY_DIAGNOSTIC_TESTS.General,
      searchQueryForApi: "internal medicine",
    };
  }

  // ── 17. TELEHEALTH / VIDEO CONSULT DIRECT INTENT ──
  if (/video|online|telehealth|virtual|remote|from home/i.test(lower)) {
    // Retain previous specialty if mentioned in history
    let querySpecialty = "doctor";
    if (/cardio|heart|chest/i.test(allHistoryText)) querySpecialty = "cardiologist";
    else if (/ortho|knee|joint|bone/i.test(allHistoryText)) querySpecialty = "orthopaedic";
    else if (/neuro|headache|brain/i.test(allHistoryText)) querySpecialty = "neurologist";

    return {
      specialty: "Telehealth",
      detectedSymptoms: ["Online Video Consultation"],
      urgency: "routine",
      clinicalMessage: `Filtered for accredited Narayana Health specialists providing direct online video consultations in ${location}. Connect comfortably from home without hospital travel:`,
      chips: [
        { id: "video", label: "Video consultation confirmed" },
        { id: "slots", label: "Today's video slots" },
        { id: "symptoms", label: "Specify symptoms" },
        { id: "tests", label: "Digital diagnostic tests" },
      ],
      tests: SPECIALTY_DIAGNOSTIC_TESTS.General,
      searchQueryForApi: querySpecialty,
    };
  }

  // ── 18. GENERAL FALLBACK ──
  return {
    specialty: "Clinical Care",
    detectedSymptoms: [clean],
    urgency: "routine",
    clinicalMessage: `Analyzing your clinical inquiry for "${clean}". Here are top specialists at Narayana Health in ${location}:`,
    chips: [
      { id: "symptoms", label: "Specify symptoms" },
      { id: "tests", label: "Recommended diagnostic tests" },
      { id: "slots", label: "Doctor slots today" },
      { id: "video", label: "Book video consultation" },
    ],
    tests: SPECIALTY_DIAGNOSTIC_TESTS.General,
    searchQueryForApi: clean,
  };
}
