import { doctorsData, DoctorData } from "./doctors";
import { HOSPITALS_DATA, HospitalItem } from "./hospitalsData";

export interface DoctorDetailItem {
  name: string;
  designation: string;
  experience: string;
  hospital: string;
  image: string;
  speciality: string;
}

export interface DiseaseItem {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  organ: "heart" | "brain" | "kidney" | "liver" | "lungs" | "bones" | "stomach" | "cancer" | "urinary" | "paediatric" | "other";
  speciality: string;
  specialitySlug: string;
  letter: string;
  stageOrType: string;
  summary: string;
  overview: string;
  image: string;
  symptoms: string[];
  riskFactors: string[];
  diagnosticProcedures: string[];
  treatments: string[];
  isPopular?: boolean;
}

export const DISEASES_DATA: DiseaseItem[] = [
  {
    id: "coronary-artery-disease",
    slug: "coronary-artery-disease",
    title: "Coronary Artery Disease (CAD): Symptoms, Stenting & Bypass",
    shortTitle: "Coronary Artery Disease (CAD)",
    organ: "heart",
    speciality: "Cardiology & Cardiac Surgery",
    specialitySlug: "cardiology",
    letter: "C",
    stageOrType: "Chronic & Acute Stages",
    summary: "Narrowing or blockage of coronary arteries by atherosclerotic plaque restricting oxygen supply to heart muscle.",
    overview: "Coronary Artery Disease is the leading cardiovascular condition globally. Plaque buildup can cause angina, ischemia, or sudden myocardial infarction (heart attack). Multidisciplinary heart teams provide medical therapy, angioplasty, or CABG surgery.",
    image: "/images/procedures/procedure_cardiology.png",
    symptoms: ["Chest pressure radiating to arm or jaw", "Exertional breathlessness", "Extreme fatigue during mild exertion", "Cold sweats and nausea"],
    riskFactors: ["Hypertension", "Dyslipidemia (High LDL)", "Diabetes Mellitus", "Smoking & Sedentary Lifestyle", "Family History of CAD"],
    diagnosticProcedures: ["Coronary Angiogram", "Cardiac CT Angiography", "Treadmill Stress Test (TMT)", "2D Echocardiogram"],
    treatments: ["Percutaneous Coronary Intervention (PTCA / Stenting)", "Coronary Artery Bypass Graft (CABG)", "Optimal Medical Therapy & Cardiac Rehab"],
    isPopular: true,
  },
  {
    id: "aortic-valve-stenosis",
    slug: "aortic-valve-stenosis",
    title: "Aortic Valve Stenosis: Symptoms, TAVR & Surgical Valve Care",
    shortTitle: "Aortic Valve Stenosis",
    organ: "heart",
    speciality: "Cardiac Sciences & Structural Heart",
    specialitySlug: "cardiology",
    letter: "A",
    stageOrType: "Mild to Severe Calcific",
    summary: "Narrowing of aortic valve orifice restricting blood flow from the left ventricle into the systemic circulation.",
    overview: "Severe calcific aortic stenosis increases heart workload and can lead to syncope, heart failure, and sudden death. Minimally invasive catheter-based TAVR allows valve replacement without opening the chest.",
    image: "/images/procedures/heart_transplant_hero.jpg",
    symptoms: ["Chest tightness during walking", "Episodes of lightheadedness or syncope (blackouts)", "Shortness of breath on lying down", "Heart murmur heard on stethoscope"],
    riskFactors: ["Aging & Valve Calcification", "Bicuspid Aortic Valve (Congenital)", "History of Rheumatic Heart Disease", "Chronic Renal Failure"],
    diagnosticProcedures: ["Transthoracic Echocardiogram (TTE / TEE)", "Cardiac Catheterization", "Cardiac MRI", "CT Aorta TAVR Protocol"],
    treatments: ["Transcatheter Aortic Valve Replacement (TAVR)", "Surgical Aortic Valve Replacement (SAVR)", "Balloon Aortic Valvuloplasty"],
    isPopular: true,
  },
  {
    id: "ischemic-stroke",
    slug: "ischemic-stroke",
    title: "Acute Ischemic Stroke: Golden Hour Protocol & Mechanical Thrombectomy",
    shortTitle: "Acute Ischemic Stroke",
    organ: "brain",
    speciality: "Neurology & Neuro-Intervention",
    specialitySlug: "neurology",
    letter: "I",
    stageOrType: "Hyperacute (0-24h Window)",
    summary: "Sudden neurological deficit caused by blood clot occluding a cerebral artery supplying brain tissue.",
    overview: "Time is brain—millions of neurons die each minute of arterial occlusion. Immediate intravenous thrombolysis (clot buster) and mechanical thrombectomy within the golden window can reverse paralysis completely.",
    image: "/Specialities icons/Neurology.jpeg",
    symptoms: ["Face drooping on one side", "Arm or leg weakness / paralysis", "Slurred or unintelligible speech (dysphasia)", "Sudden loss of balance or double vision"],
    riskFactors: ["Hypertension", "Atrial Fibrillation (Cardiac Clots)", "Carotid Artery Atherosclerosis", "Diabetes & High Cholesterol", "Smoking"],
    diagnosticProcedures: ["Hyperacute CT Brain / CT Perfusion", "MRI Brain Stroke Protocol (DWI/FLAIR)", "Carotid & Vertebral Doppler Ultrasound", "Digital Subtraction Angiography (DSA)"],
    treatments: ["Intravenous Thrombolysis (IV rt-PA / TNK)", "Mechanical Endovascular Thrombectomy", "Carotid Stenting / Endarterectomy", "Neuro-Rehabilitation"],
    isPopular: true,
  },
  {
    id: "chronic-kidney-disease",
    slug: "chronic-kidney-disease",
    title: "Chronic Kidney Disease (CKD): Stages 1-5, Dialysis & Transplant",
    shortTitle: "Chronic Kidney Disease (CKD)",
    organ: "kidney",
    speciality: "Nephrology & Renal Transplant",
    specialitySlug: "nephrology",
    letter: "C",
    stageOrType: "Stages 1 to 5 (End-Stage)",
    summary: "Progressive, irreversible loss of renal function resulting in fluid retention, electrolyte imbalances, and toxin accumulation.",
    overview: "CKD develops silently over years due to diabetes and hypertension. Early nephrology management slows progression; advanced stage 5 is treated with hemodialysis, peritoneal dialysis, or kidney transplantation.",
    image: "/images/procedures/kidney_transplant.jpg",
    symptoms: ["Bilateral ankle and leg swelling", "Nausea, metallic taste, and loss of appetite", "Foamy urine or altered frequency", "Severe fatigue from anemia"],
    riskFactors: ["Longstanding Type 2 Diabetes", "Uncontrolled Hypertension", "Chronic Glomerulonephritis", "Polycystic Kidney Disease (PKD)", "NSAID Overuse"],
    diagnosticProcedures: ["Serum Creatinine & eGFR Calculation", "Urine Albumin-to-Creatinine Ratio (UACR)", "Renal Ultrasound with Doppler", "Renal Core Needle Biopsy"],
    treatments: ["Renoprotective Medical Regimens (SGLT2i/RAAS)", "High-Flux Hemodialysis", "Automated Peritoneal Dialysis", "Living Donor / Deceased Kidney Transplant"],
    isPopular: true,
  },
  {
    id: "liver-cirrhosis",
    slug: "liver-cirrhosis",
    title: "Liver Cirrhosis: Causes, Staging, Portal Hypertension & Transplant",
    shortTitle: "Liver Cirrhosis & Failure",
    organ: "liver",
    speciality: "Hepatology & Liver Transplant",
    specialitySlug: "gastroenterology",
    letter: "L",
    stageOrType: "Compensated to Decompensated",
    summary: "Late-stage fibrosis (scarring) of the liver caused by chronic liver diseases, impeding vital metabolic function and portal blood flow.",
    overview: "Cirrhosis leads to portal hypertension, ascites (fluid in abdomen), variceal bleeding, and hepatic encephalopathy. Living donor liver transplantation is the definitive cure for end-stage liver failure.",
    image: "/Specialities icons/Liver Transplant.svg",
    symptoms: ["Abdominal swelling (ascites)", "Deep jaundice (yellow eyes and skin)", "Vomiting blood (esophageal varices)", "Mental confusion and disorientation (encephalopathy)"],
    riskFactors: ["Chronic Hepatitis B or C Infection", "Non-Alcoholic Steatohepatitis (NASH / MASH)", "Chronic Alcohol Consumption", "Autoimmune Hepatitis", "Wilson's Disease"],
    diagnosticProcedures: ["FibroScan (Transient Elastography)", "Triple Phase Liver CT / MRI", "Upper GI Endoscopy for Varices", "Serum Alpha-Fetoprotein (AFP) Screen"],
    treatments: ["Endoscopic Variceal Ligation (EVL)", "TIPS Procedure (Transjugular Intrahepatic Shunt)", "Ascites Paracentesis & Diuretics", "Living / Deceased Donor Liver Transplant"],
    isPopular: true,
  },
  {
    id: "copd-chronic-bronchitis",
    slug: "copd-chronic-bronchitis",
    title: "COPD & Emphysema: Lung Function, Inhalers & Pulmonary Rehab",
    shortTitle: "COPD & Emphysema",
    organ: "lungs",
    speciality: "Pulmonology & Respiratory Medicine",
    specialitySlug: "pulmonology",
    letter: "C",
    stageOrType: "GOLD Stages 1 - 4",
    summary: "Chronic progressive lung disease causing airflow limitation, airway inflammation, and alveolar destruction.",
    overview: "COPD encompasses chronic bronchitis and emphysema. Symptoms include chronic cough with sputum, wheezing, and progressive dyspnoea. Comprehensive management includes modern bronchodilators, oxygen therapy, and pulmonary rehab.",
    image: "/Specialities icons/Pulmonology.jpeg",
    symptoms: ["Progressive shortness of breath on climbing stairs", "Chronic morning productive cough", "Frequent chest infections", "Tightness across chest and wheezing"],
    riskFactors: ["Tobacco Smoking (Cigarettes/Bidis)", "Biomass Fuel Smoke Exposure", "Occupational Dust & Chemical Fumes", "Alpha-1 Antitrypsin Deficiency"],
    diagnosticProcedures: ["Post-Bronchodilator Spirometry", "High-Resolution CT Chest (HRCT)", "Arterial Blood Gas Analysis (ABG)", "6-Minute Walk Test (6MWT)"],
    treatments: ["Dual Bronchodilator Inhaler Therapy (LAMA+LABA)", "Pulmonary Rehabilitation & Breathing Exercises", "Long-Term Home Oxygen Therapy (LTOT)", "Endobronchial Valves (EBV)"],
    isPopular: true,
  },
  {
    id: "knee-osteoarthritis",
    slug: "knee-osteoarthritis",
    title: "Knee Osteoarthritis: Cartilage Wear, Injections & Robotic Knee Surgery",
    shortTitle: "Knee Osteoarthritis",
    organ: "bones",
    speciality: "Orthopaedics & Robotic Joint Care",
    specialitySlug: "orthopaedics",
    letter: "K",
    stageOrType: "Kellgren-Lawrence Grades 1 to 4",
    summary: "Gradual breakdown of protective articular knee cartilage resulting in bone friction, pain, and angular deformity.",
    overview: "Knee osteoarthritis causes stiffness, crepitus (grating sound), and bowing of legs. Advanced stage 4 bone-on-bone arthritis is permanently relieved with precision robotic total or partial knee replacement.",
    image: "/Specialities icons/Orthopedics.jpeg",
    symptoms: ["Deep aching knee pain aggravated by weight-bearing", "Morning stiffness lasting 15-30 minutes", "Crepitus or grinding feeling when bending knee", "Bowing of knees (varus deformity)"],
    riskFactors: ["Age over 50 years", "Obesity & Excess Joint Load", "Prior Meniscus or ACL Ligament Tears", "Occupations Requiring Repetitive Squatting"],
    diagnosticProcedures: ["Weight-Bearing Standing Knee X-Rays", "3T MRI Knee for Cartilage Mapping", "CT Bone Scan for Robotic Alignment"],
    treatments: ["Viscosupplementation & PRP Injections", "Targeted Physical Therapy & Quad Strengthening", "Robotic-Assisted Total Knee Replacement (TKR)", "Unicompartmental (Partial) Knee Arthroplasty"],
    isPopular: true,
  },
  {
    id: "breast-cancer",
    slug: "breast-cancer",
    title: "Breast Cancer: Early Detection, Molecular Subtypes & Precision Oncology",
    shortTitle: "Breast Cancer",
    organ: "cancer",
    speciality: "Medical & Surgical Oncology",
    specialitySlug: "oncology",
    letter: "B",
    stageOrType: "Stages 0 to IV (ER/PR/HER2 Subtypes)",
    summary: "Malignant growth originating in breast ductal or lobular epithelium with potential for lymphatic spread.",
    overview: "Breast cancer is the most common cancer in women. When caught early through digital mammography, 5-year survival exceeds 90%. Comprehensive care integrates breast-conserving surgery, targeted therapies, and precision immunotherapy.",
    image: "/images/procedures/radiation_oncology_hd.jpg",
    symptoms: ["Painless firm lump in breast or underarm armpit", "Skin dimpling resembling orange peel (peau d'orange)", "Nipple retraction or bloody discharge", "Persistent focal breast tenderness or swelling"],
    riskFactors: ["BRCA1 or BRCA2 Genetic Mutations", "Increasing Age and Female Gender", "Dense Breast Tissue", "Family History of Breast or Ovarian Cancer", "Late Menopause / Early Menarche"],
    diagnosticProcedures: ["Digital 3D Breast Tomosynthesis (Mammogram)", "High-Resolution Breast Ultrasound", "Image-Guided Core Needle Biopsy", "IHC Biomarker Assay (ER/PR/HER2/Ki-67)"],
    treatments: ["Oncoplastic Breast-Conserving Surgery", "Sentinel Lymph Node Biopsy", "Adjuvant Chemotherapy & Targeted Trastuzumab", "Stereotactic Precision Radiation Therapy"],
    isPopular: true,
  },
  {
    id: "epilepsy-disorders",
    slug: "epilepsy-disorders",
    title: "Epilepsy & Seizure Disorders: Medication, VNS & Robotic Brain Surgery",
    shortTitle: "Epilepsy & Seizure Disorders",
    organ: "brain",
    speciality: "Neurology & Pediatric Epilepsy",
    specialitySlug: "neurology",
    letter: "E",
    stageOrType: "Focal, Generalized & Drug-Resistant",
    summary: "Chronic neurological disorder characterized by recurrent unprovoked seizures due to abnormal cortical electrical activity.",
    overview: "Epilepsy affects over 50 million people worldwide. For drug-resistant epilepsy, robotic stereotactic neurosurgery, Vagus Nerve Stimulation (VNS), and ketogenic dietary therapies offer seizure freedom.",
    image: "/Specialities icons/Neurology.jpeg",
    symptoms: ["Involuntary jerking of limbs", "Transient loss of consciousness or blank staring", "Aura of unusual smell, taste, or rising epigastric sensation", "Post-ictal confusion, headache, and drowsiness"],
    riskFactors: ["Past Traumatic Brain Injury (TBI)", "Birth Asphyxia & Neonatal Infections", "Mesial Temporal Sclerosis", "Cerebral Cavernous Malformations", "Genetic Predisposition"],
    diagnosticProcedures: ["Video Electroencephalography (Video EEG)", "Epilepsy-Protocol 3.0T Brain MRI", "Functional MRI (fMRI) & PET-CT Brain", "Neuropsychological Cognitive Mapping"],
    treatments: ["Antiseizure Medications (ASMs)", "Stereotactic Lesionectomy / Lobectomy", "Vagus Nerve Stimulation (VNS Therapy)", "Ketogenic Medical Diet Protocol"],
    isPopular: true,
  },
  {
    id: "gallstone-disease-cholecystitis",
    slug: "gallstone-disease-cholecystitis",
    title: "Gallstones & Acute Cholecystitis: Symptoms, Risks & Laparoscopic Care",
    shortTitle: "Gallstone Disease & Cholecystitis",
    organ: "liver",
    speciality: "Gastroenterology & Laparoscopic Surgery",
    specialitySlug: "gastroenterology",
    letter: "G",
    stageOrType: "Biliary Colic to Acute Cholecystitis",
    summary: "Hardened deposits of digestive fluid and cholesterol in the gallbladder causing acute inflammation or biliary duct blockages.",
    overview: "Gallstones can cause severe right upper quadrant colic after fatty meals. If a stone blocks the cystic or common bile duct, acute cholecystitis, pancreatitis, or cholangitis can occur. Laparoscopic cholecystectomy is the gold standard cure.",
    image: "/Specialities icons/General Surgery.jpeg",
    symptoms: ["Sudden intense pain in upper right abdomen", "Pain radiating to right shoulder blade or back", "Nausea, vomiting, and bloating after oily meals", "Low-grade fever with chills in acute inflammation"],
    riskFactors: ["Female Gender, Forty, Fertile, Fair (4 Fs)", "Rapid Weight Loss or Obesity", "High-Cholesterol Diet", "Diabetes Mellitus", "Family History"],
    diagnosticProcedures: ["Abdominal Ultrasound (98% Sensitivity)", "MRCP (Magnetic Resonance Cholangiopancreatography)", "Serum Bilirubin, Amylase & Lipase", "Liver Function Panel"],
    treatments: ["Laparoscopic Cholecystectomy (Keyhole Surgery)", "Single-Incision Laparoscopic Surgery (SILS)", "ERCP for Common Bile Duct Stone Extraction", "Intravenous Antibiotics & Hydration"],
    isPopular: false,
  },
  {
    id: "type-2-diabetes-mellitus",
    slug: "type-2-diabetes-mellitus",
    title: "Type 2 Diabetes Mellitus: Glycemic Control, Organ Protection & Care",
    shortTitle: "Type 2 Diabetes & Complications",
    organ: "stomach",
    speciality: "Endocrinology & Diabetology",
    specialitySlug: "endocrinology",
    letter: "T",
    stageOrType: "Metabolic Syndrome & Organ Risk",
    summary: "Chronic metabolic condition characterized by insulin resistance and relative insulin deficiency resulting in chronic hyperglycemia.",
    overview: "Uncontrolled diabetes damages microvascular and macrovascular beds leading to diabetic nephropathy, retinopathy, neuropathy, and accelerated coronary disease. Modern diabetes management emphasizes cardio-renal metabolic protection.",
    image: "/Specialities icons/General Surgery.jpeg",
    symptoms: ["Frequent urination, especially at night (polyuria)", "Excessive thirst and dry mouth (polydipsia)", "Unexplained weight loss despite constant hunger", "Tingling, burning, or numbness in feet (neuropathy)"],
    riskFactors: ["Obesity and Visceral Abdominal Fat", "Sedentary Physical Inactivity", "Family History of Diabetes", "Polycystic Ovary Syndrome (PCOS)", "History of Gestational Diabetes"],
    diagnosticProcedures: ["Fasting Plasma Glucose (FPG)", "Glycated Hemoglobin (HbA1c Test)", "Oral Glucose Tolerance Test (OGTT)", "Urine Microalbumin & eGFR Screen"],
    treatments: ["Modern SGLT2 Inhibitors & GLP-1 Receptor Agonists", "Metformin & Basal-Bolus Insulin Therapy", "Continuous Glucose Monitoring (CGM)", "Medical Nutrition Therapy & Structured Exercise"],
    isPopular: true,
  },
  {
    id: "congenital-heart-defects-children",
    slug: "congenital-heart-defects-children",
    title: "Congenital Heart Defects in Children: ASD, VSD & Corrective Surgery",
    shortTitle: "Congenital Heart Defects (Paediatric)",
    organ: "paediatric",
    speciality: "Paediatric Cardiology & Cardiac Surgery",
    specialitySlug: "paediatrics",
    letter: "C",
    stageOrType: "Acyanotic & Cyanotic Defects",
    summary: "Structural heart anomalies present at birth affecting the heart walls, valves, or great arteries.",
    overview: "Narayana Health is a global pioneer in paediatric cardiac surgery. Defects like Ventricular Septal Defect (VSD), Atrial Septal Defect (ASD), and Tetralogy of Fallot (TOF) are corrected with high success rates using minimally invasive catheter devices or open-heart surgery.",
    image: "/images/procedures/pediatric_abdomen.jpg",
    symptoms: ["Poor feeding, sweating during feeds, and failure to gain weight", "Bluish tint to skin, lips, or fingernails (cyanosis)", "Rapid breathing or recurrent chest infections", "Heart murmur detected on routine examination"],
    riskFactors: ["Maternal Rubella or Diabetes During Pregnancy", "Chromosomal Abnormalities (Down Syndrome)", "Maternal Medications or Alcohol Exposure", "Family History of Congenital Heart Defects"],
    diagnosticProcedures: ["Paediatric Transthoracic Echocardiogram (TTE)", "Fetal Echocardiography during Pregnancy", "Cardiac MRI & CT Angiography", "Diagnostic Cardiac Catheterization"],
    treatments: ["Percutaneous Device Closure (Amplatzer Device)", "Minimally Invasive Paediatric Cardiac Surgery", "Complex Single Ventricle Palliation (Fontan)", "Paediatric Cardiac Intensive Care Management"],
    isPopular: true,
  },
];

export interface DiseaseDetailData {
  slug: string;
  title: string;
  shortTitle: string;
  speciality: string;
  specialitySlug: string;
  organ: string;
  stageOrType: string;
  heroImage: string;
  heroTitle: string;
  heroSubtitle: string;
  leadParagraph: string;
  metrics: {
    stage: string;
    treatmentApproach: string;
    clinicalSafety: string;
    specialistCare: string;
  };
  toc: { id: string; label: string }[];
  symptoms: string[];
  riskFactors: { factor: string; desc: string }[];
  diagnosticSteps: { step: string; title: string; desc: string }[];
  treatmentOptions: { title: string; desc: string; type: string }[];
  doctors: DoctorDetailItem[];
  hospitals: HospitalItem[];
  faqs: { q: string; a: string }[];
}

export function getDiseaseDetailData(slug: string): DiseaseDetailData {
  const match = DISEASES_DATA.find((d) => d.slug === slug) || DISEASES_DATA[0];

  const matched = doctorsData.filter((d: DoctorData) =>
    d.speciality.toLowerCase().includes(match.specialitySlug) ||
    d.keywords.some((k) => k.toLowerCase().includes(match.organ) || k.toLowerCase().includes(match.specialitySlug))
  ).slice(0, 3);

  const fallback = matched.length > 0 ? matched : doctorsData.slice(0, 3);

  const doctors: DoctorDetailItem[] = fallback.map((d: DoctorData) => ({
    name: d.name,
    designation: `Senior Consultant - ${d.speciality}`,
    experience: "15+ Years",
    hospital: d.hospital,
    image: d.photo,
    speciality: d.speciality,
  }));

  return {
    slug: match.slug,
    title: match.title,
    shortTitle: match.shortTitle,
    speciality: match.speciality,
    specialitySlug: match.specialitySlug,
    organ: match.organ,
    stageOrType: match.stageOrType,
    heroImage: match.image,
    heroTitle: match.title,
    heroSubtitle: match.summary,
    leadParagraph: match.overview,
    metrics: {
      stage: match.stageOrType,
      treatmentApproach: "Multidisciplinary Care",
      clinicalSafety: "98.6% Safety Score",
      specialistCare: match.speciality,
    },
    toc: [
      { id: "overview", label: "Disease Overview" },
      { id: "symptoms", label: "Signs & Symptoms" },
      { id: "risk-factors", label: "Causes & Risk Factors" },
      { id: "diagnostics", label: "Diagnostic Protocols" },
      { id: "treatments", label: "Treatment Protocols" },
      { id: "specialists", label: "Consult Specialists" },
      { id: "faqs", label: "Frequently Asked Questions" },
    ],
    symptoms: match.symptoms,
    riskFactors: match.riskFactors.map((r) => ({
      factor: r,
      desc: `Recognized epidemiological and clinical risk indicator in the onset and progression of ${match.shortTitle}.`,
    })),
    diagnosticSteps: match.diagnosticProcedures.map((d, idx) => ({
      step: `Phase 0${idx + 1}`,
      title: d,
      desc: `High-resolution diagnostic modality used by Narayana Health specialists to evaluate structural and functional staging.`,
    })),
    treatmentOptions: match.treatments.map((t, idx) => ({
      title: t,
      desc: `Advanced therapeutic intervention tailored to disease severity, patient co-morbidities, and long-term functional recovery.`,
      type: idx === 0 ? "First-Line Intervention" : "Advanced Modality",
    })),
    doctors: doctors,
    hospitals: HOSPITALS_DATA.slice(0, 3),
    faqs: [
      {
        q: `What are the earliest signs of ${match.shortTitle.toLowerCase()}?`,
        a: `Early manifestations commonly include ${match.symptoms.slice(0, 2).join(" and ")}. Catching these symptoms early significantly improves treatment outcomes and preserves organ function.`,
      },
      {
        q: `Can ${match.shortTitle.toLowerCase()} be cured or managed effectively?`,
        a: `With modern clinical care at Narayana Health, most conditions can be either cured surgically or managed with exceptional long-term quality of life through precision therapies and lifestyle adjustments.`,
      },
      {
        q: `What surgical or advanced procedures are available for this condition?`,
        a: `Narayana Health provides state-of-the-art procedures including ${match.treatments.join(", ")}, supported by world-class intensive care units.`,
      },
      {
        q: `How can I get an expert second opinion from Narayana Health?`,
        a: `You can upload your reports online or consult via tele-consultation with our senior multidisciplinary board for an unbiased, comprehensive treatment plan.`,
      },
    ],
  };
}
