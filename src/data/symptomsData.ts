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

export interface SymptomItem {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  organ: "heart" | "brain" | "kidney" | "liver" | "lungs" | "bones" | "stomach" | "cancer" | "urinary" | "paediatric" | "other";
  speciality: string;
  specialitySlug: string;
  letter: string;
  severity: "Emergency" | "Urgent" | "Clinical Evaluation";
  urgencyLevel: string;
  summary: string;
  overview: string;
  image: string;
  commonCauses: string[];
  whenToSeekCare: string[];
  relatedConditions: string[];
  diagnosticTests: string[];
  recommendedSpecialist: string;
  isPopular?: boolean;
}

export const SYMPTOMS_DATA: SymptomItem[] = [
  {
    id: "chest-pain",
    slug: "chest-pain",
    title: "Chest Pain: Symptoms, Cardiac Causes & Emergency Triage",
    shortTitle: "Chest Pain & Pressure",
    organ: "heart",
    speciality: "Cardiology & Cardiac Surgery",
    specialitySlug: "cardiology",
    letter: "C",
    severity: "Emergency",
    urgencyLevel: "Immediate Attention",
    summary: "Tightness, squeezing, or burning in the central chest radiating to jaw, neck, shoulder, or left arm.",
    overview: "Chest pain is one of the most critical symptoms requiring immediate clinical evaluation to distinguish between life-threatening coronary syndromes, aortic emergencies, and non-cardiac causes such as GERD or musculoskeletal strain.",
    image: "/images/procedures/procedure_cardiology.png",
    commonCauses: [
      "Coronary Artery Disease & Acute Coronary Syndrome",
      "Myocardial Infarction (Heart Attack)",
      "Angina Pectoris (Exertional Ischemia)",
      "Aortic Dissection & Pericarditis",
      "Gastroesophageal Reflux (Acid Reflux)",
    ],
    whenToSeekCare: [
      "Pain radiates to left arm, back, neck, or lower jaw",
      "Accompanied by cold sweat, dizziness, or shortness of breath",
      "Crushing sensation that worsens on exertion or lasts > 5 minutes",
      "Sudden tearing chest pain radiating to shoulder blades",
    ],
    relatedConditions: ["Heart Attack", "Angina", "Hypertrophic Cardiomyopathy", "Pulmonary Embolism"],
    diagnosticTests: ["12-Lead ECG", "High-Sensitivity Troponin-I", "Echocardiogram", "Coronary CT Angiography"],
    recommendedSpecialist: "Interventional Cardiologist",
    isPopular: true,
  },
  {
    id: "shortness-of-breath",
    slug: "shortness-of-breath",
    title: "Shortness of Breath (Dyspnoea): Causes, Warning Signs & Care",
    shortTitle: "Shortness of Breath",
    organ: "lungs",
    speciality: "Pulmonology & Respiratory Care",
    specialitySlug: "pulmonology",
    letter: "S",
    severity: "Urgent",
    urgencyLevel: "Evaluate within 2-4 hrs",
    summary: "Air hunger, difficulty drawing a full breath, or chest tightness during rest or minimal daily exertion.",
    overview: "Dyspnoea or breathlessness may stem from cardiopulmonary disorders, acute airway obstruction, pulmonary arterial hypertension, or metabolic acidosis. Clinical oxygenation checks and spirometry are essential.",
    image: "/Specialities icons/Pulmonology.jpeg",
    commonCauses: [
      "Congestive Heart Failure & Left Ventricular Failure",
      "Chronic Obstructive Pulmonary Disease (COPD) & Emphysema",
      "Bronchial Asthma & Acute Bronchospasm",
      "Pulmonary Embolism & Deep Vein Thrombosis",
      "Interstitial Lung Disease (ILD)",
    ],
    whenToSeekCare: [
      "Inability to speak in full sentences or blue lips (cyanosis)",
      "Sudden onset breathlessness while resting or lying flat (orthopnoea)",
      "Accompanying high fever, wheezing, or bloody phlegm",
      "Oxygen saturation (SpO2) falling below 94% on pulse oximeter",
    ],
    relatedConditions: ["Asthma", "Heart Failure", "Pneumonia", "Pulmonary Hypertension"],
    diagnosticTests: ["Chest X-Ray / HRCT Chest", "Spirometry / PFT", "Arterial Blood Gas (ABG)", "2D Echocardiogram"],
    recommendedSpecialist: "Senior Pulmonologist",
    isPopular: true,
  },
  {
    id: "chronic-cough",
    slug: "chronic-cough",
    title: "Chronic Persistent Cough: Causes, Diagnosis & Treatment",
    shortTitle: "Chronic Persistent Cough",
    organ: "lungs",
    speciality: "Pulmonology & Respiratory Medicine",
    specialitySlug: "pulmonology",
    letter: "C",
    severity: "Clinical Evaluation",
    urgencyLevel: "Consult Specialist",
    summary: "Persistent dry or productive cough lasting longer than 8 weeks with throat clearing or nocturnal spasms.",
    overview: "A cough lasting over 8 weeks in adults is considered chronic. Common etiologies include cough-variant asthma, upper airway cough syndrome (post-nasal drip), gastroesophageal reflux, and pulmonary tuberculosis.",
    image: "/images/procedures/procedure_surgery.png",
    commonCauses: [
      "Cough-Variant Asthma & Environmental Allergies",
      "Gastroesophageal Reflux Disease (Silent Reflux)",
      "Upper Airway Cough Syndrome (Sinusitis / Postnasal Drip)",
      "Pulmonary Tuberculosis or Post-Infectious Hyperresponsiveness",
      "ACE Inhibitor Medication Side-Effects",
    ],
    whenToSeekCare: [
      "Coughing up blood or rust-colored sputum (hemoptysis)",
      "Unexplained weight loss or persistent evening drenching sweats",
      "Progressive worsening of breathlessness and fatigue",
      "Hoarseness of voice lasting longer than 3 weeks",
    ],
    relatedConditions: ["Asthma", "GERD", "Bronchiectasis", "Early Pulmonary Nodules"],
    diagnosticTests: ["High-Resolution CT Chest", "Induced Sputum Analysis & AFB", "Fiberoptic Bronchoscopy", "FeNO Breath Test"],
    recommendedSpecialist: "Chest Physician / Pulmonologist",
    isPopular: false,
  },
  {
    id: "palpitations-irregular-heartbeat",
    slug: "palpitations-irregular-heartbeat",
    title: "Palpitations & Irregular Heartbeat: Arrhythmia Care Guide",
    shortTitle: "Palpitations & Fluttering",
    organ: "heart",
    speciality: "Cardiology & Electrophysiology",
    specialitySlug: "cardiology",
    letter: "P",
    severity: "Urgent",
    urgencyLevel: "Evaluate within 24 hrs",
    summary: "Sensation of racing, fluttering, pounding, or skipped heartbeats while resting or under mild stress.",
    overview: "Cardiac palpitations range from benign premature ventricular contractions to serious arrhythmias like Atrial Fibrillation or Supraventricular Tachycardia (SVT) that elevate stroke risk.",
    image: "/images/procedures/procedure_cardiology.png",
    commonCauses: [
      "Atrial Fibrillation (AFib) & Atrial Flutter",
      "Supraventricular Tachycardia (SVT)",
      "Premature Ventricular Contractions (PVCs)",
      "Hyperthyroidism & Electrolyte Imbalance",
      "Anemia, Caffeine Excess, or Extreme Anxiety",
    ],
    whenToSeekCare: [
      "Palpitations associated with fainting, blackouts, or dizziness",
      "Concurrent chest tightness or lightheadedness",
      "Heart rate exceeding 140 bpm while completely at rest",
      "Known family history of sudden cardiac arrest",
    ],
    relatedConditions: ["Atrial Fibrillation", "Sick Sinus Syndrome", "Thyrotoxicosis"],
    diagnosticTests: ["24-48 Hour Holter Monitoring", "12-Lead Resting ECG", "Echocardiogram", "Electrophysiology Study (EPS)"],
    recommendedSpecialist: "Cardiac Electrophysiologist",
    isPopular: true,
  },
  {
    id: "severe-headache-migraine",
    slug: "severe-headache-migraine",
    title: "Severe Sudden Headache & Migraine: Red Flags & Neurological Care",
    shortTitle: "Severe Sudden Headache",
    organ: "brain",
    speciality: "Neurology & Neuro-Surgery",
    specialitySlug: "neurology",
    letter: "H",
    severity: "Emergency",
    urgencyLevel: "Emergency if Sudden",
    summary: "Sudden thunderclap pain, throbbing unilateral temple headache, or pain accompanied by visual aura and nausea.",
    overview: "While many headaches are migraines or tension headaches, a 'thunderclap' headache reaching maximum intensity within 60 seconds is a red-flag symptom for intracranial aneurysmal subarachnoid hemorrhage.",
    image: "/images/specialities/Brain and Spine.png",
    commonCauses: [
      "Migraine with or without Neurological Aura",
      "Intracranial Aneurysm Rupture / Subarachnoid Hemorrhage",
      "Cerebral Venous Sinus Thrombosis (CVST)",
      "Tension Headache & Cervicogenic Headache",
      "Cluster Headache & Trigeminal Neuralgia",
    ],
    whenToSeekCare: [
      "'Worst headache of your life' peaking in under 60 seconds",
      "Accompanying high fever, stiff neck, and confusion",
      "New weakness on one side of face or body (FAST protocol)",
      "Headache triggered by coughing, bending, or straining",
    ],
    relatedConditions: ["Brain Aneurysm", "Migraine", "Arteriovenous Malformation (AVM)", "Meningitis"],
    diagnosticTests: ["MRI Brain with MR Angiography (MRA)", "Non-Contrast CT Brain", "Lumbar Puncture (CSF Analysis)"],
    recommendedSpecialist: "Consultant Neurologist",
    isPopular: true,
  },
  {
    id: "seizures-and-convulsions",
    slug: "seizures-and-convulsions",
    title: "Seizures & Convulsions: Clinical Types, Causes & Protocol",
    shortTitle: "Seizures & Convulsions",
    organ: "brain",
    speciality: "Neurology & Epilepsy Care",
    specialitySlug: "neurology",
    letter: "S",
    severity: "Emergency",
    urgencyLevel: "Immediate Care",
    summary: "Uncontrolled jerking movements, temporary loss of consciousness, staring spells, or sudden confusion.",
    overview: "Seizures occur when there is an abnormal burst of electrical impulses in the brain. They can be focal or generalized. Prompt video-EEG monitoring and neuro-imaging identify the epileptogenic focus.",
    image: "/Specialities icons/Neurology.jpeg",
    commonCauses: [
      "Epilepsy & Inherited Seizure Disorders",
      "Acute Ischemic or Hemorrhagic Stroke",
      "Head Trauma & Post-Traumatic Brain Injury",
      "Brain Tumors or Neurocysticercosis",
      "Severe Hypoglycemia or Hyponatremia",
    ],
    whenToSeekCare: [
      "First-ever seizure occurrence in an adult or child",
      "Seizure lasting longer than 3-5 minutes (Status Epilepticus)",
      "Repeated seizures without regaining consciousness between episodes",
      "Breathing difficulty or injury sustained during the episode",
    ],
    relatedConditions: ["Epilepsy", "Cavernoma", "Cortical Dysplasia", "Febrile Convulsions"],
    diagnosticTests: ["Long-Term Video EEG", "High-Resolution 3T Epilepsy Protocol MRI", "Serum Electrolytes & Metabolic Screen"],
    recommendedSpecialist: "Epileptologist / Neurologist",
    isPopular: false,
  },
  {
    id: "blood-in-urine-hematuria",
    slug: "blood-in-urine-hematuria",
    title: "Blood in Urine (Hematuria): Causes, Workup & Urological Care",
    shortTitle: "Blood in Urine (Hematuria)",
    organ: "urinary",
    speciality: "Urology & Nephrology",
    specialitySlug: "urology",
    letter: "B",
    severity: "Urgent",
    urgencyLevel: "Urgent Urological Review",
    summary: "Pink, red, or cola-colored urine visible to the eye, or microscopic blood detected on routine urinalysis.",
    overview: "Hematuria can originate from anywhere along the urinary tract—kidneys, ureters, bladder, or prostate. Painless gross hematuria in adults over 40 must be urgently investigated to rule out urothelial malignancy.",
    image: "/Specialities icons/Urology.jpeg",
    commonCauses: [
      "Urinary Tract Infections (UTI) & Pyelonephritis",
      "Kidney or Ureteral Calculus (Stones)",
      "Benign Prostatic Hyperplasia (BPH) or Prostatitis",
      "Bladder, Renal Cell, or Prostate Carcinoma",
      "Glomerulonephritis & IgA Nephropathy",
    ],
    whenToSeekCare: [
      "Painless red urine without any burning or fever",
      "Inability to pass urine due to large blood clots (urinary retention)",
      "Accompanying high fever, chills, and severe flank pain",
      "History of heavy smoking with sudden hematuria",
    ],
    relatedConditions: ["Bladder Cancer", "Kidney Stones", "BPH", "Glomerulonephritis"],
    diagnosticTests: ["CT Urography (Triple Phase)", "Flexible Diagnostic Cystoscopy", "Urine Cytology", "Renal Ultrasound"],
    recommendedSpecialist: "Uro-Oncologist / Urologist",
    isPopular: true,
  },
  {
    id: "jaundice-yellowing-eyes-skin",
    slug: "jaundice-yellowing-eyes-skin",
    title: "Jaundice (Yellow Eyes & Skin): Liver & Biliary Evaluation",
    shortTitle: "Jaundice & Yellow Skin",
    organ: "liver",
    speciality: "Gastroenterology & Hepatology",
    specialitySlug: "gastroenterology",
    letter: "J",
    severity: "Urgent",
    urgencyLevel: "Evaluate within 24-48 hrs",
    summary: "Yellowish discoloration of whites of eyes (sclera) and skin, accompanied by dark tea-colored urine and pale stools.",
    overview: "Jaundice occurs when bilirubin levels build up in the blood. It indicates pre-hepatic hemolysis, hepatic parenchyma dysfunction (hepatitis, cirrhosis), or post-hepatic biliary duct obstruction by stones or tumors.",
    image: "/Specialities icons/Liver Transplant.svg",
    commonCauses: [
      "Acute Viral Hepatitis (A, B, C, or E)",
      "Gallstones Obstructing Common Bile Duct (Choledocholithiasis)",
      "Alcoholic Liver Disease & Cirrhosis",
      "Pancreatic Head Tumor or Cholangiocarcinoma",
      "Drug-Induced Liver Injury (DILI)",
    ],
    whenToSeekCare: [
      "High fever, shaking chills, and right upper belly pain (Charcot's triad)",
      "Confusion, disorientation, or drowsiness (Hepatic Encephalopathy)",
      "Vomiting blood or dark black tarry stools",
      "Rapidly deepening yellow skin tone with severe generalized itching",
    ],
    relatedConditions: ["Liver Cirrhosis", "Gallstone Disease", "Hepatitis B & C", "Pancreatic Cancer"],
    diagnosticTests: ["Comprehensive Liver Function Test (LFT)", "Ultrasound Abdomen & Doppler", "MRCP (Magnetic Resonance Cholangiopancreatography)", "Viral Hepatitis Serology"],
    recommendedSpecialist: "Senior Hepatologist / GI Surgeon",
    isPopular: true,
  },
  {
    id: "chronic-abdominal-pain",
    slug: "chronic-abdominal-pain",
    title: "Abdominal Pain: Upper, Lower & Pelvic Diagnosis Guide",
    shortTitle: "Chronic Abdominal Pain",
    organ: "stomach",
    speciality: "Gastroenterology & GI Surgery",
    specialitySlug: "gastroenterology",
    letter: "A",
    severity: "Clinical Evaluation",
    urgencyLevel: "Consult GI Specialist",
    summary: "Cramping, burning, dull, or sharp pain in the abdomen that recurs frequently or interferes with digestion.",
    overview: "Abdominal pain may arise from gastric ulcers, gallbladder inflammation, irritable bowel syndrome, inflammatory bowel disease, or appendicitis. Localizing the quadrant guides accurate diagnosis.",
    image: "/Specialities icons/General Surgery.jpeg",
    commonCauses: [
      "Peptic Ulcer Disease & Helicobacter Pylori Infection",
      "Irritable Bowel Syndrome (IBS) & Food Intolerances",
      "Gallstones (Biliary Colic) & Acute Cholecystitis",
      "Chronic Pancreatitis",
      "Inflammatory Bowel Disease (Crohn's & Ulcerative Colitis)",
    ],
    whenToSeekCare: [
      "Sudden rigid, board-like abdomen with severe tenderness",
      "Inability to keep liquids down for > 24 hours",
      "High fever with localized right lower abdominal pain (appendicitis)",
      "Black tarry stools or blood in vomit",
    ],
    relatedConditions: ["Peptic Ulcers", "Appendicitis", "Cholecystitis", "Crohn's Disease"],
    diagnosticTests: ["Upper GI Endoscopy", "Colonoscopy with Biopsy", "Contrast CT Abdomen & Pelvis", "H. Pylori Breath / Stool Test"],
    recommendedSpecialist: "Medical Gastroenterologist",
    isPopular: true,
  },
  {
    id: "joint-pain-and-swelling",
    slug: "joint-pain-and-swelling",
    title: "Joint Pain, Stiffness & Swelling: Arthritis & Ortho Guide",
    shortTitle: "Joint Pain & Stiffness",
    organ: "bones",
    speciality: "Orthopaedics & Joint Replacement",
    specialitySlug: "orthopaedics",
    letter: "J",
    severity: "Clinical Evaluation",
    urgencyLevel: "Consult Specialist",
    summary: "Aching, burning, or throbbing pain in knees, hips, or shoulders with morning stiffness and restricted motion.",
    overview: "Joint pain affects millions and can be degenerative (Osteoarthritis), autoimmune (Rheumatoid Arthritis, Psoriatic Arthritis), or metabolic (Gout). Early diagnosis prevents irreversible cartilage erosion.",
    image: "/Specialities icons/Orthopedics.jpeg",
    commonCauses: [
      "Osteoarthritis (Wear-and-Tear Cartilage Loss)",
      "Rheumatoid Arthritis & Autoimmune Synovitis",
      "Acute Gouty Arthritis (Uric Acid Crystal Deposition)",
      "Meniscus, ACL, or Rotator Cuff Tendon Tear",
      "Septic Arthritis (Bacterial Joint Infection)",
    ],
    whenToSeekCare: [
      "Hot, red, exquisitely tender swollen joint with high fever",
      "Complete inability to bear weight on the affected limb",
      "Sudden deformities following an accident or sports injury",
      "Severe morning stiffness lasting more than 60 minutes",
    ],
    relatedConditions: ["Knee Osteoarthritis", "Rheumatoid Arthritis", "Ankylosing Spondylitis", "Gout"],
    diagnosticTests: ["Digital Weight-Bearing X-Rays", "3.0T MRI Joint Scan", "Serum Uric Acid & ESR / CRP", "Autoimmune Panel (Anti-CCP & RF)"],
    recommendedSpecialist: "Orthopaedic Joint Specialist",
    isPopular: true,
  },
  {
    id: "unexplained-weight-loss",
    slug: "unexplained-weight-loss",
    title: "Unexplained Weight Loss: Warning Signs & Cancer Screening",
    shortTitle: "Unexplained Weight Loss",
    organ: "cancer",
    speciality: "Internal Medicine & Oncology",
    specialitySlug: "oncology",
    letter: "W",
    severity: "Urgent",
    urgencyLevel: "Comprehensive Workup",
    summary: "Losing more than 5% of body weight within 6 to 12 months without dieting, exercise, or intentional lifestyle changes.",
    overview: "Involuntary weight loss is a key systemic symptom that warrants systematic evaluation to exclude occult malignancy, endocrine disorders like hyperthyroidism or Type 1 diabetes, and chronic malabsorption syndromes.",
    image: "/images/procedures/genomics_hd.jpg",
    commonCauses: [
      "Occult Malignancies (GI, Lymphoma, Lung, Pancreas)",
      "Hyperthyroidism & Accelerated Metabolism",
      "Uncontrolled Diabetes Mellitus",
      "Chronic Malabsorption / Celiac Disease",
      "Chronic Systemic Infections (Tuberculosis)",
    ],
    whenToSeekCare: [
      "Weight loss > 10% of total body weight over 6 months",
      "Accompanying chronic low-grade fever, night sweats, or bone pain",
      "Noticeable lumps or enlarged lymph nodes in neck, armpit, or groin",
      "Changes in bowel habits or persistent early satiety",
    ],
    relatedConditions: ["Gastrointestinal Cancer", "Lymphoma", "Thyrotoxicosis", "Celiac Disease"],
    diagnosticTests: ["Whole-Body Digital PET-CT", "Comprehensive Metabolic Panel (CMP)", "Thyroid Profile (FT3, FT4, TSH)", "Upper & Lower GI Endoscopy"],
    recommendedSpecialist: "Senior Medical Oncologist / Physician",
    isPopular: false,
  },
  {
    id: "swelling-in-legs-edema",
    slug: "swelling-in-legs-edema",
    title: "Leg Swelling (Peripheral Oedema): Kidney, Heart & Vein Care",
    shortTitle: "Swelling in Legs & Ankles",
    organ: "kidney",
    speciality: "Nephrology & Renal Care",
    specialitySlug: "nephrology",
    letter: "S",
    severity: "Clinical Evaluation",
    urgencyLevel: "Evaluate within 48 hrs",
    summary: "Puffy swelling in feet, ankles, or shins where pressing with a finger leaves an indentation (pitting edema).",
    overview: "Fluid accumulation in lower extremities can indicate impaired renal salt excretion, congestive heart failure, chronic liver cirrhosis with low albumin, or deep venous insufficiency.",
    image: "/Specialities icons/Nephrology.jpeg",
    commonCauses: [
      "Chronic Kidney Disease & Nephrotic Syndrome",
      "Congestive Heart Failure (Right Heart Failure)",
      "Liver Cirrhosis with Hypoalbuminemia",
      "Deep Vein Thrombosis (DVT) in one leg",
      "Chronic Venous Insufficiency & Varicose Veins",
    ],
    whenToSeekCare: [
      "Sudden swelling in one leg accompanied by calf pain and warmth (DVT)",
      "Leg swelling accompanied by sudden breathlessness when lying flat",
      "Foamy urine or decreased volume of urine",
      "Facial puffiness around eyes noticeable in the morning",
    ],
    relatedConditions: ["Chronic Kidney Disease", "Heart Failure", "Deep Vein Thrombosis", "Nephrotic Syndrome"],
    diagnosticTests: ["Kidney Function Test & Serum Creatinine", "Urine Protein-to-Creatinine Ratio (UPCR)", "Venous Doppler Ultrasound of Legs", "2D Echocardiogram"],
    recommendedSpecialist: "Consultant Nephrologist",
    isPopular: true,
  },
  {
    id: "difficulty-swallowing-dysphagia",
    slug: "difficulty-swallowing-dysphagia",
    title: "Difficulty Swallowing (Dysphagia): Causes & Workup",
    shortTitle: "Difficulty Swallowing",
    organ: "stomach",
    speciality: "Gastroenterology & GI Oncology",
    specialitySlug: "gastroenterology",
    letter: "D",
    severity: "Urgent",
    urgencyLevel: "Early Evaluation",
    summary: "Feeling that food or liquid is sticking, hanging up, or refusing to go down into the stomach comfortably.",
    overview: "Dysphagia can be mechanical (esophageal stricture, ring, or cancer) or motility-related (achalasia, scleroderma, stroke). Any progressive dysphagia requires prompt endoscopic evaluation.",
    image: "/Specialities icons/General Surgery.jpeg",
    commonCauses: [
      "Esophageal Stricture from Acid Reflux",
      "Esophageal Carcinoma (Adenocarcinoma or Squamous Cell)",
      "Achalasia Cardia & Motility Disorders",
      "Neurological Impairment Following Stroke or Parkinson's",
      "Eosinophilic Esophagitis",
    ],
    whenToSeekCare: [
      "Progressive worsening: difficulty with solids progressing to liquids",
      "Accompanying choking spells or coughing while drinking",
      "Unintentional weight loss and regurgitation of undigested food",
      "Inability to swallow saliva (acute food bolus obstruction)",
    ],
    relatedConditions: ["Esophageal Cancer", "Achalasia", "Acid Reflux Stricture", "Stroke"],
    diagnosticTests: ["Diagnostic Upper GI Endoscopy", "Barium Swallow X-Ray", "High-Resolution Esophageal Manometry", "Chest & Neck CT Scan"],
    recommendedSpecialist: "Gastroenterologist & GI Surgeon",
    isPopular: false,
  },
  {
    id: "recurrent-fever-chills-children",
    slug: "recurrent-fever-chills-children",
    title: "Recurrent Fever & Chills in Children: Paediatric Protocol",
    shortTitle: "Childhood Recurrent Fever",
    organ: "paediatric",
    speciality: "Paediatric Medicine & Infectious Care",
    specialitySlug: "paediatrics",
    letter: "F",
    severity: "Urgent",
    urgencyLevel: "Consult Paediatrician",
    summary: "Repeated spikes of fever in infants or children accompanied by shivering, irritability, or poor feeding.",
    overview: "Fever is the immune system's response to infection. Recurrent or prolonged fever in children requires careful clinical assessment to prevent dehydration, febrile seizures, and to identify hidden bacterial foci.",
    image: "/Specialities icons/Paediatrics.jpeg",
    commonCauses: [
      "Viral Upper Respiratory Tract Infections & Flu",
      "Urinary Tract Infection in Young Children",
      "Otitis Media (Middle Ear Infection)",
      "Paediatric Dengue, Malaria, or Enteric Fever",
      "Kawasaki Disease or Systemic Juvenile Arthritis",
    ],
    whenToSeekCare: [
      "Fever in an infant under 3 months of age (temperature > 100.4°F)",
      "Child is unusually lethargic, difficult to wake, or persistently crying",
      "Appearance of a non-blanching purple rash (petechiae)",
      "Labored, rapid breathing with flaring nostrils or chest in-drawing",
    ],
    relatedConditions: ["Paediatric UTI", "Kawasaki Disease", "Dengue", "Otitis Media"],
    diagnosticTests: ["Complete Blood Count (CBC) & CRP", "Urine Routine & Microscopic Culture", "Blood Culture", "Rapid Viral Respiratory PCR"],
    recommendedSpecialist: "Senior Paediatrician",
    isPopular: true,
  },
];

export interface SymptomDetailData {
  slug: string;
  title: string;
  shortTitle: string;
  speciality: string;
  specialitySlug: string;
  organ: string;
  severity: string;
  urgencyLevel: string;
  heroImage: string;
  heroTitle: string;
  heroSubtitle: string;
  leadParagraph: string;
  metrics: {
    urgency: string;
    specialist: string;
    diagnosticTurnaround: string;
    hospitalNetwork: string;
  };
  toc: { id: string; label: string }[];
  emergencySigns: string[];
  causes: { name: string; desc: string; type: string }[];
  whenToSeekCare: string[];
  diagnosticPath: { step: string; title: string; desc: string }[];
  doctors: DoctorDetailItem[];
  hospitals: HospitalItem[];
  faqs: { q: string; a: string }[];
}

export function getSymptomDetailData(slug: string): SymptomDetailData {
  const match = SYMPTOMS_DATA.find((s) => s.slug === slug) || SYMPTOMS_DATA[0];

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
    severity: match.severity,
    urgencyLevel: match.urgencyLevel,
    heroImage: match.image,
    heroTitle: match.title,
    heroSubtitle: match.summary,
    leadParagraph: match.overview,
    metrics: {
      urgency: match.severity,
      specialist: match.recommendedSpecialist,
      diagnosticTurnaround: "Same-Day Triaging",
      hospitalNetwork: "24×7 Across NH",
    },
    toc: [
      { id: "overview", label: "Overview & Nature" },
      { id: "emergency-warning", label: "Red-Flag Emergency Signs" },
      { id: "causes", label: "Common Clinical Causes" },
      { id: "when-to-consult", label: "When to See a Doctor" },
      { id: "diagnostic-pathway", label: "Diagnostic Pathway" },
      { id: "specialists", label: "Consult Specialists" },
      { id: "faqs", label: "Frequently Asked Questions" },
    ],
    emergencySigns: match.whenToSeekCare,
    causes: match.commonCauses.map((c, idx) => ({
      name: c,
      desc: `Detailed clinical evaluation helps pinpoint whether ${c.toLowerCase()} is the primary driver of this symptom.`,
      type: idx === 0 ? "Primary Driver" : "Differential Diagnosis",
    })),
    whenToSeekCare: [
      ...match.whenToSeekCare,
      "Symptoms fail to improve after 48-72 hours of prescribed rest or medication",
      "Persistent disruption of everyday physical activity, appetite, or restful sleep",
    ],
    diagnosticPath: match.diagnosticTests.map((t, idx) => ({
      step: `Step 0${idx + 1}`,
      title: t,
      desc: `Comprehensive evidence-based testing to rapidly establish a precise diagnosis and rule out critical complications.`,
    })),
    doctors: doctors,
    hospitals: HOSPITALS_DATA.slice(0, 4),
    faqs: [
      {
        q: `How quickly should I seek medical help for ${match.shortTitle.toLowerCase()}?`,
        a: `If you experience severe pain, breathing difficulty, dizziness, or any red-flag warning signs, seek immediate emergency triage at the nearest Narayana Health emergency department. For recurring or milder symptoms, schedule a specialist consultation within 24 to 48 hours.`,
      },
      {
        q: `What tests are typically ordered during the first consultation?`,
        a: `Depending on the clinical examination, your doctor may recommend baseline diagnostic investigations such as ${match.diagnosticTests.slice(0, 3).join(", ")}, along with targeted blood panels.`,
      },
      {
        q: `Can ${match.shortTitle.toLowerCase()} be managed without surgery or hospitalization?`,
        a: `Yes, the majority of conditions presenting with ${match.shortTitle.toLowerCase()} are managed effectively with tailored medical therapies, lifestyle modifications, and minimally invasive protocols when caught early.`,
      },
      {
        q: `Can I get a virtual second opinion for ${match.shortTitle.toLowerCase()}?`,
        a: `Yes. Narayana Health offers secure digital tele-consultations where our senior consultants review your prior reports, scans, and clinical history to provide comprehensive guidance.`,
      },
    ],
  };
}
