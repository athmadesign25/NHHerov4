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

export interface DiagnosticItem {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  organ: "heart" | "brain" | "kidney" | "liver" | "lungs" | "bones" | "stomach" | "cancer" | "urinary" | "paediatric" | "other";
  modality: "Radiology & Imaging" | "Laboratory & Pathology" | "Cardio Diagnostics" | "Endoscopy & Interventional" | "Genomics & Molecular";
  speciality: string;
  specialitySlug: string;
  letter: string;
  preparation: string;
  turnaroundTime: string;
  sampleType: string;
  summary: string;
  overview: string;
  image: string;
  whyItIsDone: string[];
  preparationInstructions: string[];
  testProcedure: string;
  isPopular?: boolean;
}

export const DIAGNOSTICS_DATA: DiagnosticItem[] = [
  {
    id: "digital-chest-x-ray",
    slug: "digital-chest-x-ray",
    title: "Digital Chest X-Ray (PA View): Infection, Heart & Lung Imaging",
    shortTitle: "Digital Chest X-Ray",
    organ: "lungs",
    modality: "Radiology & Imaging",
    speciality: "Radiology & Pulmonology",
    specialitySlug: "pulmonology",
    letter: "D",
    preparation: "No Fasting Required",
    turnaroundTime: "Within 30 Minutes",
    sampleType: "Low-Dose Digital X-Ray",
    summary: "Instant high-definition radiographic imaging of lungs, heart silhouette, mediastinum, ribs, and diaphragm.",
    overview: "A digital chest X-ray is the fundamental frontline imaging test used to evaluate respiratory symptoms, rule out pneumonia, identify pleural effusion, assess cardiomegaly (enlarged heart), and screen for pulmonary tuberculosis.",
    image: "/Specialities icons/Pulmonology.jpeg",
    whyItIsDone: [
      "Investigating persistent cough, shortness of breath, or chest pain",
      "Screening for pneumonia, bronchitis, and lung infections",
      "Evaluating heart enlargement (cardiomegaly) and heart failure fluid",
      "Detecting rib fractures or diaphragm abnormalities after trauma",
    ],
    preparationInstructions: [
      "No dietary fasting or fluid restrictions needed",
      "Remove metal jewelry, chains, and underwire clothing from chest area",
      "Inform the radiographer if there is any possibility of pregnancy",
      "Wear comfortable loose clothing or a clean hospital gown",
    ],
    testProcedure: "You will stand in front of a flat digital detector plate, take a deep breath, and hold it for 2 to 3 seconds while the low-dose exposure is captured instantly.",
    isPopular: true,
  },
  {
    id: "3-tesla-multiparametric-mri",
    slug: "3-tesla-multiparametric-mri",
    title: "3.0 Tesla High-Field MRI Scan: Brain, Spine & Joint Imaging",
    shortTitle: "3.0 Tesla MRI Scan",
    organ: "brain",
    modality: "Radiology & Imaging",
    speciality: "Radiology & Neuro-Sciences",
    specialitySlug: "neurology",
    letter: "M",
    preparation: "Metal Screening Required",
    turnaroundTime: "Same Day Report",
    sampleType: "3.0T Magnetic Resonance",
    summary: "Ultra-high-definition non-radiation magnetic resonance imaging for neuro, spine, musculo-skeletal, and soft tissue anatomy.",
    overview: "Using a 3.0 Tesla magnetic field with zero ionizing radiation, this scan produces sub-millimeter anatomical cross-sections of the brain, spinal cord, soft tissue tumors, and joint cartilage with unmatched diagnostic clarity.",
    image: "/images/procedures/procedure_mri.png",
    whyItIsDone: [
      "Diagnosing acute and old strokes, brain aneurysms, and tumors",
      "Detailed imaging of spinal disc herniations, cord compression, and sciatica",
      "Assessing knee, hip, and shoulder ligament tears (ACL, meniscus, rotator cuff)",
      "Multiparametric evaluation of prostate and liver lesions",
    ],
    preparationInstructions: [
      "Complete a thorough ferromagnetic safety screening questionnaire",
      "Notify staff of cardiac pacemakers, metal cochlear implants, or surgical clips",
      "Fast for 4 hours if intravenous gadolinium contrast is ordered",
      "Notify team if you have severe claustrophobia (mild sedation available)",
    ],
    testProcedure: "You will lie comfortably on the motorized scanner table. Ear protection is provided for sound dampening while specialized radiofrequency coils capture ultra-thin slices over 20-35 minutes.",
    isPopular: true,
  },
  {
    id: "128-slice-cardiac-ct-angiography",
    slug: "128-slice-cardiac-ct-angiography",
    title: "128-Slice Cardiac CT Angiography: Coronary Plaque & Calcium Score",
    shortTitle: "Cardiac CT Angiography",
    organ: "heart",
    modality: "Radiology & Imaging",
    speciality: "Cardiology & Cardiac Imaging",
    specialitySlug: "cardiology",
    letter: "C",
    preparation: "Fasting 4 Hours",
    turnaroundTime: "Same Day Report",
    sampleType: "Sub-Millimeter Dual Source CT",
    summary: "Non-invasive coronary artery imaging detecting arterial stenosis, soft plaque, and Agatston calcium score in 5 heartbeats.",
    overview: "Cardiac CT Angiography visualizes the coronary arteries non-invasively using ECG-gated ultrafast multi-slice scanning. It accurately rules out coronary blockages in low-to-intermediate risk chest pain patients without invasive catheterization.",
    image: "/images/procedures/procedure_cardiology.png",
    whyItIsDone: [
      "Evaluating atypical chest pain or unexplained shortness of breath",
      "Calculating Agatston coronary calcium score for preventive risk assessment",
      "Checking patency of coronary stents and bypass grafts (CABG)",
      "Ruling out coronary artery disease with > 99% negative predictive value",
    ],
    preparationInstructions: [
      "Fast from food and milk for 4 hours prior to the procedure",
      "Avoid caffeine, coffee, tea, and energy drinks for 24 hours (stabilizes heart rate)",
      "Drink plenty of water to ensure proper hydration for contrast clearance",
      "Bring recent serum creatinine blood test report for renal safety check",
    ],
    testProcedure: "An intravenous cannula is placed in your arm. ECG leads monitor your rhythm, contrast is administered through an automated injector, and high-speed images are acquired during a single brief breath-hold.",
    isPopular: true,
  },
  {
    id: "digital-pet-ct-scan",
    slug: "digital-pet-ct-scan",
    title: "Digital Whole-Body PET-CT Scan: Cancer Staging & Metabolic Staging",
    shortTitle: "Digital PET-CT Scan",
    organ: "cancer",
    modality: "Radiology & Imaging",
    speciality: "Nuclear Medicine & Oncology",
    specialitySlug: "oncology",
    letter: "P",
    preparation: "Fasting 6 Hours",
    turnaroundTime: "Same Day Report",
    sampleType: "18F-FDG / Ga-68 Tracer",
    summary: "Sub-millimeter metabolic molecular PET combined with high-resolution anatomical CT for cancer detection and staging.",
    overview: "Digital PET-CT combines functional metabolic uptake of radiotracers like Fluorodeoxyglucose (18F-FDG) with cross-sectional anatomical CT to pinpoint active cellular malignancy, evaluate treatment response, and detect recurrent tumors.",
    image: "/images/procedures/petct_hd.jpg",
    whyItIsDone: [
      "Accurate staging of known cancers before surgery or chemotherapy",
      "Assessing early metabolic response during chemotherapy or immunotherapy",
      "Detecting occult cancer relapse months before structural changes appear",
      "Evaluating pyrexia of unknown origin (PUO) and systemic vasculitis",
    ],
    preparationInstructions: [
      "Strict fasting for 6 hours (plain drinking water is allowed and encouraged)",
      "Follow a low-carbohydrate, no-sugar diet for 24 hours prior to scan",
      "Avoid strenuous physical workouts, gym, and heavy lifting for 24 hours",
      "Diabetic patients will receive specialized blood glucose management guidance",
    ],
    testProcedure: "After checking your fasting blood sugar, a tiny dose of radiotracer is injected. You will rest quietly in a relaxing lounge for 60 minutes while the tracer distributes, followed by a 15-minute whole-body scan.",
    isPopular: true,
  },
  {
    id: "2d-echocardiogram-color-doppler",
    slug: "2d-echocardiogram-color-doppler",
    title: "2D Echocardiogram with Color Doppler: Heart Function & Valve Health",
    shortTitle: "2D Echocardiogram (Echo)",
    organ: "heart",
    modality: "Cardio Diagnostics",
    speciality: "Cardiology & Non-Invasive Heart Care",
    specialitySlug: "cardiology",
    letter: "E",
    preparation: "No Fasting Required",
    turnaroundTime: "Immediate Report",
    sampleType: "Ultrasound Soundwaves",
    summary: "Real-time ultrasound evaluation of heart chambers, ejection fraction (EF), cardiac valves, and blood flow velocity.",
    overview: "A 2D Echo uses harmless high-frequency ultrasound waves to measure left ventricular ejection fraction, detect valve regurgitation or stenosis, evaluate wall motion abnormalities, and detect pericardial effusion.",
    image: "/images/procedures/procedure_cardiology.png",
    whyItIsDone: [
      "Assessing heart pumping efficiency and ejection fraction (normal 55-65%)",
      "Diagnosing heart valve diseases (mitral/aortic stenosis or regurgitation)",
      "Evaluating breathlessness, unexplained leg swelling, or heart murmurs",
      "Monitoring cardiotoxicity during chemotherapy regimens",
    ],
    preparationInstructions: [
      "No fasting or dietary restriction is needed",
      "Take your routine daily cardiovascular medications as scheduled",
      "Wear a two-piece outfit that allows easy access to the chest area",
      "Bring any prior ECG or echo reports for comparative assessment",
    ],
    testProcedure: "You will recline on an examination couch on your left side. A water-based gel is applied to the chest, and an ultrasound probe is gently moved across your ribs while the doctor examines moving cardiac chambers on screen.",
    isPopular: true,
  },
  {
    id: "diagnostic-upper-gi-endoscopy",
    slug: "diagnostic-upper-gi-endoscopy",
    title: "Upper GI Endoscopy (Gastroscopy): Ulcers, Acidity & Biopsy",
    shortTitle: "Upper GI Endoscopy",
    organ: "stomach",
    modality: "Endoscopy & Interventional",
    speciality: "Gastroenterology & GI Endoscopy",
    specialitySlug: "gastroenterology",
    letter: "U",
    preparation: "Fasting 6-8 Hours",
    turnaroundTime: "Same Day Report",
    sampleType: "High-Definition Video Endoscope",
    summary: "Direct visual examination of esophagus, stomach lining, and duodenum with optical zoom and targeted biopsy.",
    overview: "An upper endoscopy uses a slender, flexible tube with a high-definition camera to examine the upper digestive tract. It detects acid reflux damage, gastritis, peptic ulcers, H. pylori, and early tumors, with rapid tissue biopsy.",
    image: "/Specialities icons/General Surgery.jpeg",
    whyItIsDone: [
      "Investigating persistent acidity, chronic heartburn, or indigestion",
      "Evaluating difficulty or pain during swallowing (dysphagia/odynophagia)",
      "Diagnosing upper gastrointestinal bleeding or black tarry stools",
      "Screening for H. Pylori, celiac disease, and gastric polyps",
    ],
    preparationInstructions: [
      "Strict overnight fasting or minimum 6 to 8 hours without food or water",
      "Inform the gastroenterologist of any blood-thinning medications (Aspirin/Clopidogrel)",
      "Arrange for an accompanying family member if conscious sedation is used",
      "Remove dentures and dental plates prior to the procedure",
    ],
    testProcedure: "A mild numbing spray is applied to the back of the throat, and light conscious sedation ensures you feel zero discomfort. The thin endoscope is gently guided down while high-definition images are captured in 8-12 minutes.",
    isPopular: true,
  },
  {
    id: "kidney-function-test-microalbumin",
    slug: "kidney-function-test-microalbumin",
    title: "Comprehensive Kidney Function Panel (KFT) & Urine Microalbumin",
    shortTitle: "Kidney Function Test (KFT)",
    organ: "kidney",
    modality: "Laboratory & Pathology",
    speciality: "Nephrology & Clinical Biochemistry",
    specialitySlug: "nephrology",
    letter: "K",
    preparation: "Overnight Fasting Preferred",
    turnaroundTime: "Within 2-4 Hours",
    sampleType: "Serum Blood & Spot Urine",
    summary: "Precision serum creatinine, BUN, electrolytes (Na, K, Cl), and urine albumin-to-creatinine ratio (UACR).",
    overview: "This comprehensive biochemical profile calculates your exact estimated Glomerular Filtration Rate (eGFR) and detects microscopic kidney damage years before irreversible symptoms manifest.",
    image: "/Specialities icons/Nephrology.jpeg",
    whyItIsDone: [
      "Routine screening for all individuals with diabetes or hypertension",
      "Evaluating leg puffiness, facial edema, or dark frothy urine",
      "Monitoring safety of medications cleared through the kidneys",
      "Staging and monitoring Chronic Kidney Disease (CKD) progression",
    ],
    preparationInstructions: [
      "Fasting for 8-10 hours is recommended for accurate biochemical baseline",
      "Drink adequate water to avoid dehydration which can falsely elevate creatinine",
      "Avoid excessive cooked red meat consumption the evening before the test",
      "Collect first morning mid-stream urine sample for microalbumin analysis",
    ],
    testProcedure: "A simple, painless blood draw of 3-5 ml from a forearm vein and a small spot urine collection. Automated NABL-accredited clinical chemistry analyzers process the samples with strict quality control.",
    isPopular: true,
  },
  {
    id: "liver-function-profile-lft",
    slug: "liver-function-profile-lft",
    title: "Comprehensive Liver Function Test (LFT): Enzymes, Bilirubin & Proteins",
    shortTitle: "Liver Function Test (LFT)",
    organ: "liver",
    modality: "Laboratory & Pathology",
    speciality: "Hepatology & Clinical Pathology",
    specialitySlug: "gastroenterology",
    letter: "L",
    preparation: "Fasting 8-10 Hours",
    turnaroundTime: "Within 2-4 Hours",
    sampleType: "Venous Blood (3 ml)",
    summary: "Measurement of Total & Direct Bilirubin, SGOT/AST, SGPT/ALT, Alkaline Phosphatase (ALP), Total Protein, and Albumin.",
    overview: "The liver function test assesses hepatocyte integrity, biliary excretion, and synthetic capability. Elevated transaminases indicate liver inflammation or fatty liver, while elevated alkaline phosphatase suggests biliary tract obstruction.",
    image: "/Specialities icons/Liver Transplant.svg",
    whyItIsDone: [
      "Investigating jaundice, dark urine, pale stools, or right upper belly pain",
      "Screening for Fatty Liver Disease (NAFLD / NASH) and metabolic syndrome",
      "Monitoring liver health in patients taking cholesterol or antibiotic medications",
      "Assessing alcohol-related liver injury or viral hepatitis infection",
    ],
    preparationInstructions: [
      "Fast for 8 to 10 hours prior to the blood draw (water is permitted)",
      "Refrain from consuming alcoholic beverages for at least 48 hours beforehand",
      "Inform the phlebotomist of any over-the-counter supplements or herbal remedies",
      "Rest for 5 minutes in the clinic before sample collection",
    ],
    testProcedure: "A phlebotomist cleans your inner elbow with an antiseptic wipe and collects a small blood sample using a sterile vacutainer needle. Automated spectrophotometers deliver results within hours.",
    isPopular: true,
  },
  {
    id: "high-resolution-ct-chest-hrct",
    slug: "high-resolution-ct-chest-hrct",
    title: "High-Resolution CT Chest (HRCT): Interstitial Lung Disease & Fibrosis",
    shortTitle: "HRCT Chest Scan",
    organ: "lungs",
    modality: "Radiology & Imaging",
    speciality: "Pulmonology & Thoracic Radiology",
    specialitySlug: "pulmonology",
    letter: "H",
    preparation: "No Fasting Required",
    turnaroundTime: "Same Day Report",
    sampleType: "0.5mm Ultra-Thin CT Slices",
    summary: "Ultra-thin 0.5mm to 1mm volumetric CT slices of lung parenchyma detecting early interstitial lung disease, COVID sequelae, and bronchiectasis.",
    overview: "HRCT Chest is the gold-standard modality for visualizing the fine architecture of lung tissue. It identifies ground-glass opacities, honeycombing, emphysematous bullae, and airway remodeling far beyond the sensitivity of standard X-rays.",
    image: "/Specialities icons/Pulmonology.jpeg",
    whyItIsDone: [
      "Diagnosing Interstitial Lung Disease (ILD) and Idiopathic Pulmonary Fibrosis",
      "Evaluating unexplained chronic dry cough or exertional oxygen desaturation",
      "Assessing bronchiectasis, post-COVID lung scarring, and occupational lung diseases",
      "Detailed characterization of indeterminate solitary pulmonary nodules",
    ],
    preparationInstructions: [
      "No food fasting required for non-contrast HRCT scans",
      "Remove metallic necklaces, piercings, and clothes with metallic buttons/zippers",
      "Bring any prior chest X-rays or CT discs for side-by-side radiologist comparison",
      "Notify the radiographer if you have severe asthma or shortness of breath lying flat",
    ],
    testProcedure: "You will lie flat on your back on the CT table. As the scanner ring moves smoothly around your chest, automated voice instructions will guide you through two brief 5-second breath-holds.",
    isPopular: false,
  },
  {
    id: "dexa-bone-mineral-density-scan",
    slug: "dexa-bone-mineral-density-scan",
    title: "DEXA Bone Mineral Densitometry (BMD): Osteoporosis & Fracture Risk",
    shortTitle: "DEXA Bone Density Scan",
    organ: "bones",
    modality: "Radiology & Imaging",
    speciality: "Orthopaedics & Rheumatology",
    specialitySlug: "orthopaedics",
    letter: "D",
    preparation: "Stop Calcium Supplements 24h",
    turnaroundTime: "Within 1 Hour",
    sampleType: "Dual-Energy X-Ray",
    summary: "Precise T-score and Z-score bone mineral density measurement of lumbar spine, hip, and femoral neck for osteoporosis screening.",
    overview: "DEXA scanning is the globally accepted standard for quantifying bone mineral density. It classifies bone health into Normal, Osteopenia, or Osteoporosis, allowing early intervention to prevent catastrophic fragility fractures.",
    image: "/Specialities icons/Orthopedics.jpeg",
    whyItIsDone: [
      "Screening for osteoporosis in postmenopausal women and men over 60",
      "Evaluating fracture risk in patients with prior low-trauma fractures",
      "Monitoring response to osteoporosis medications (bisphosphonates, teriparatide)",
      "Assessing bone loss in patients on long-term corticosteroid therapy",
    ],
    preparationInstructions: [
      "Stop taking calcium supplements or multivitamins for 24 hours prior to scan",
      "Wear comfortable clothes without metal zippers, snaps, buckles, or metal buttons",
      "Do not schedule if you have had a barium study or contrast CT within past 7 days",
      "Inform the technician if you have bilateral hip replacements or spinal fusion hardware",
    ],
    testProcedure: "You will lie comfortably on a padded open examination table. A gentle scanning arm passes overhead over your hip and lumbar spine. The scan is completely painless, silent, and takes only 10 to 15 minutes.",
    isPopular: true,
  },
  {
    id: "next-generation-sequencing-genomics",
    slug: "next-generation-sequencing-genomics",
    title: "Next-Generation Sequencing (NGS): 500+ Gene Precision Oncology Panel",
    shortTitle: "NGS Comprehensive Genomic Panel",
    organ: "cancer",
    modality: "Genomics & Molecular",
    speciality: "Medical Oncology & Precision Medicine",
    specialitySlug: "oncology",
    letter: "N",
    preparation: "Biopsy Block / Blood Sample",
    turnaroundTime: "7 - 10 Working Days",
    sampleType: "Tumor Tissue Block / Peripheral Blood",
    summary: "Massively parallel high-throughput DNA and RNA sequencing detecting actionable cancer driver mutations and biomarker matches.",
    overview: "NGS comprehensive genomic profiling analyzes over 500 genes simultaneously to identify driver mutations (EGFR, ALK, KRAS, BRAF, BRCA1/2, NTRK), Tumor Mutational Burden (TMB), and Microsatellite Instability (MSI) to guide targeted therapies.",
    image: "/images/procedures/genomics_hd.jpg",
    whyItIsDone: [
      "Selecting FDA-approved targeted therapies for solid tumors and lymphomas",
      "Determining patient eligibility for novel immunotherapy checkpoint inhibitors",
      "Identifying hereditary cancer predispositions in family members (BRCA, Lynch)",
      "Matching advanced cancer patients with precision global clinical trials",
    ],
    preparationInstructions: [
      "Requires formalin-fixed paraffin-embedded (FFPE) tumor biopsy block or slides",
      "If liquid biopsy ctDNA is requested, 10 ml of peripheral blood is drawn in special tubes",
      "Coordinate with hospital pathology department for histology block retrieval",
      "Genetic counseling consultation is available prior to panel order",
    ],
    testProcedure: "DNA/RNA is extracted from the specimen and sequenced on state-of-the-art Illumina NGS platforms. Advanced bioinformatics pipelines analyze variants, reviewed by a molecular tumor board.",
    isPopular: true,
  },
  {
    id: "colonoscopy-diagnostic-polypectomy",
    slug: "colonoscopy-diagnostic-polypectomy",
    title: "Full Diagnostic Colonoscopy & Polypectomy: Colorectal Health",
    shortTitle: "Diagnostic Colonoscopy",
    organ: "stomach",
    modality: "Endoscopy & Interventional",
    speciality: "Gastroenterology & Colorectal Surgery",
    specialitySlug: "gastroenterology",
    letter: "C",
    preparation: "Bowel Preparation Required",
    turnaroundTime: "Same Day Report",
    sampleType: "HD Colonoscope Video",
    summary: "High-definition endoscopic visualization of the entire large intestine and terminal ileum with on-table polyp removal.",
    overview: "Colonoscopy is both diagnostic and preventive. By identifying and removing precancerous adenomatous polyps in real-time, colonoscopy reduces the risk of colorectal cancer by up to 90%.",
    image: "/Specialities icons/General Surgery.jpeg",
    whyItIsDone: [
      "Routine colorectal cancer screening starting at age 45 or earlier with family risk",
      "Investigating unexplained rectal bleeding, chronic diarrhea, or constipation",
      "Evaluating inflammatory bowel disease (Crohn's disease and Ulcerative Colitis)",
      "Follow-up surveillance after previous polyps or colorectal resection",
    ],
    preparationInstructions: [
      "Follow a clear liquid diet the day before the procedure (no solid food)",
      "Drink the prescribed bowel-cleansing prep solution as instructed to cleanse colon",
      "Arrange for an adult companion to accompany you home after conscious sedation",
      "Discuss any antiplatelet or anticoagulant medicines with the gastroenterologist beforehand",
    ],
    testProcedure: "Under gentle, painless conscious sedation, a flexible video colonoscope is inserted and navigated to the cecum. If polyps are spotted, they are painlessly removed using cold or hot snare electrocautery in 20-30 minutes.",
    isPopular: true,
  },
];

export interface DiagnosticDetailData {
  slug: string;
  title: string;
  shortTitle: string;
  modality: string;
  speciality: string;
  specialitySlug: string;
  organ: string;
  preparation: string;
  turnaroundTime: string;
  sampleType: string;
  heroImage: string;
  heroTitle: string;
  heroSubtitle: string;
  leadParagraph: string;
  metrics: {
    turnaround: string;
    preparation: string;
    sampleType: string;
    accreditation: string;
  };
  toc: { id: string; label: string }[];
  whyItIsDone: string[];
  preparationInstructions: string[];
  testProcedure: string;
  doctors: DoctorDetailItem[];
  hospitals: HospitalItem[];
  faqs: { q: string; a: string }[];
}

export function getDiagnosticDetailData(slug: string): DiagnosticDetailData {
  const match = DIAGNOSTICS_DATA.find((d) => d.slug === slug) || DIAGNOSTICS_DATA[0];

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
    modality: match.modality,
    speciality: match.speciality,
    specialitySlug: match.specialitySlug,
    organ: match.organ,
    preparation: match.preparation,
    turnaroundTime: match.turnaroundTime,
    sampleType: match.sampleType,
    heroImage: match.image,
    heroTitle: match.title,
    heroSubtitle: match.summary,
    leadParagraph: match.overview,
    metrics: {
      turnaround: match.turnaroundTime,
      preparation: match.preparation,
      sampleType: match.sampleType,
      accreditation: "NABL & NABH Accredited",
    },
    toc: [
      { id: "overview", label: "Test Overview" },
      { id: "why-done", label: "Clinical Indications" },
      { id: "preparation", label: "Preparation & Fasting" },
      { id: "procedure", label: "Procedure & Experience" },
      { id: "centers", label: "Accredited Centers" },
      { id: "specialists", label: "Consult Specialists" },
      { id: "faqs", label: "Frequently Asked Questions" },
    ],
    whyItIsDone: match.whyItIsDone,
    preparationInstructions: match.preparationInstructions,
    testProcedure: match.testProcedure,
    doctors: doctors,
    hospitals: HOSPITALS_DATA.slice(0, 3),
    faqs: [
      {
        q: `Do I need a doctor's prescription to undergo a ${match.shortTitle.toLowerCase()}?`,
        a: `Yes, diagnostic radiology and interventional investigations generally require a prescription from a qualified physician. Routine screening tests and blood panels can also be booked through our preventive health specialists.`,
      },
      {
        q: `How and when will I receive my test results?`,
        a: `Your authenticated test report will be available digitally on the Narayana Health patient app and patient portal within ${match.turnaroundTime.toLowerCase()}. Physical copies and radiology films can also be collected from the diagnostics desk.`,
      },
      {
        q: `Is the ${match.shortTitle.toLowerCase()} painful or uncomfortable?`,
        a: `Our experienced technologists and radiographers follow gentle, patient-centric protocols. For scans or blood draws, any discomfort is minimal, and procedures requiring endoscopy or sedation are performed under conscious sedation to ensure zero pain.`,
      },
      {
        q: `Can I get home sample collection for laboratory tests?`,
        a: `Yes! For pathology blood tests, urine panels, and routine biochemistry, Narayana Health provides trained phlebotomists for certified home sample collection across major metropolitan areas.`,
      },
    ],
  };
}
