import { doctorsData, DoctorData } from "./doctors";

export interface ArticleItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  categorySlug: string;
  author: string;
  authorRole: string;
  authorAvatar: string;
  readTime: string;
  publishedDate: string;
  image: string;
  summary: string;
  overview: string;
  keyTakeaways: string[];
  sections: { heading: string; body: string }[];
  isPopular?: boolean;
}

export const ARTICLES_DIRECTORY_DATA: ArticleItem[] = [
  {
    id: "understanding-heart-health-5-tips",
    slug: "understanding-heart-health-5-tips",
    title: "Understanding Heart Health: 5 Critical Tips to Keep Your Heart Strong",
    category: "Cardiology & Heart Care",
    categorySlug: "cardiology",
    author: "Dr. Devi Prasad Shetty",
    authorRole: "Chairman & Senior Cardiac Surgeon",
    authorAvatar: "/doctor_patient.png",
    readTime: "5 min read",
    publishedDate: "October 2026",
    image: "/images/articles/blog_heart_health.png",
    summary: "Discover essential lifestyle habits, dietary strategies, and preventive cardiovascular screening guidelines.",
    overview: "Cardiovascular diseases remain the leading cause of mortality worldwide. Yet, over 80% of premature heart attacks and strokes are preventable through proactive lifestyle interventions, blood pressure regulation, and timely lipid management.",
    keyTakeaways: [
      "Keep LDL cholesterol below 70 mg/dL for high-risk individuals",
      "Engage in 150 minutes of moderate aerobic exercise weekly",
      "Maintain blood pressure below 120/80 mmHg",
      "Screen for coronary calcium score (CAC) if you have family history",
      "Avoid smoking and tobacco in all forms",
    ],
    sections: [
      {
        heading: "1. The Silent Evolution of Atherosclerosis",
        body: "Atherosclerosis begins decades before any chest tightness or angina appears. Soft cholesterol plaques quietly deposit within the intimal layers of coronary arteries. Regular lipid panels and high-sensitivity CRP testing detect systemic vascular inflammation before symptoms manifest.",
      },
      {
        heading: "2. The Role of Aerobic Conditioning & Vascular Health",
        body: "Aerobic activities—such as brisk walking, swimming, or cycling—stimulate endothelial nitric oxide production. Nitric oxide promotes natural vasodilation, reduces arterial stiffness, and enhances coronary collateral circulation.",
      },
      {
        heading: "3. Nutrition as Cardio-Metabolic Medicine",
        body: "Adopt a dietary framework rich in soluble fiber, colorful polyphenols, and monounsaturated fatty acids like extra virgin olive oil and nuts. Drastically restrict trans fats, refined sugars, and ultra-processed sodium-dense snacks.",
      },
      {
        heading: "4. Stress, Cortisol & Cardiac Rhythm",
        body: "Chronic occupational and emotional stress surges circulating cortisol and catecholamines, predisposing individuals to hypertension, coronary spasm, and cardiac arrhythmias like Atrial Fibrillation.",
      },
    ],
    isPopular: true,
  },
  {
    id: "living-with-migraines-triggers-relief",
    slug: "living-with-migraines-triggers-relief",
    title: "Living with Migraines: Identifying Triggers and Finding Relief",
    category: "Neurology & Brain Health",
    categorySlug: "neurology",
    author: "Dr. Ravi Prakash",
    authorRole: "Consultant Neurologist",
    authorAvatar: "/assets/doctor_1.png",
    readTime: "6 min read",
    publishedDate: "October 2026",
    image: "/Specialities icons/Neurology.jpeg",
    summary: "Comprehensive guide to tracking neurological triggers, sensory aura, and modern CGRP antagonist treatments.",
    overview: "Migraine is not just a severe headache; it is a complex neurological disorder involving trigeminovascular system activation, cortical spreading depression, and neurogenic inflammation.",
    keyTakeaways: [
      "Keep a meticulous migraine diary noting sleep, diet, and screen time",
      "Identify personal dietary triggers: aged cheeses, artificial sweeteners, nitrates",
      "Explore modern CGRP monoclonal antibody therapies for refractory cases",
      "Maintain consistent sleep-wake cycles and adequate daily hydration",
    ],
    sections: [
      {
        heading: "1. Distinguishing Migraine from Other Headaches",
        body: "Migraines typically feature unilateral throbbing pain of moderate to severe intensity, aggravated by physical exertion, accompanied by photophobia, phonophobia, and nausea.",
      },
      {
        heading: "2. Understanding the Migraine Aura",
        body: "Roughly 25-30% of migraineurs experience visual or sensory auras—scintillating scotomas, zigzag flashing lights, or tingling in fingers—peaking 20 to 60 minutes prior to headache onset.",
      },
      {
        heading: "3. Acute Rescue vs Preventive Therapy",
        body: "Acute abortive medications (triptans, gepants) must be taken at the earliest onset of pain. For individuals experiencing more than 4 disabling headache days per month, prophylactic medications prevent chronification.",
      },
    ],
    isPopular: true,
  },
  {
    id: "cancer-care-early-screening-detection",
    slug: "cancer-care-early-screening-detection",
    title: "Cancer Care: The Transformative Power of Early Screening & Detection",
    category: "Oncology & Cancer Care",
    categorySlug: "oncology",
    author: "Dr. Mazumdar Shaw",
    authorRole: "Senior Medical Oncologist",
    authorAvatar: "/images/procedures/genomics_hd.jpg",
    readTime: "7 min read",
    publishedDate: "September 2026",
    image: "/Specialities icons/Cancer Care.jpeg",
    summary: "Why early detection saves lives: recommended screening timelines for breast, cervical, colorectal, and lung cancer.",
    overview: "When detected at Stage 1, five-year survival rates for cancers like breast, cervix, and colon exceed 90%. Modern digital imaging, molecular liquid biopsies, and genetic panels allow oncologists to intercept disease before metastatic spread.",
    keyTakeaways: [
      "Annual mammograms for women starting at age 40",
      "Pap smear and HPV DNA co-testing every 3 to 5 years",
      "Colorectal screening (colonoscopy) starting at age 45",
      "Low-dose CT (LDCT) chest screening for heavy current or former smokers",
    ],
    sections: [
      {
        heading: "1. The Biology of Early Intervention",
        body: "In early stages, malignant lesions remain confined to their primary basement membrane. Complete surgical excision or targeted stereotactic radiotherapy offers high cure rates with minimal collateral tissue toxicity.",
      },
      {
        heading: "2. Genetic Risk Stratification (BRCA & Lynch Syndrome)",
        body: "Individuals with family clusters of breast, ovarian, or colorectal cancers benefit immensely from hereditary multigene panel testing to establish customized surveillance protocols.",
      },
    ],
    isPopular: true,
  },
  {
    id: "keeping-joints-and-bones-healthy",
    slug: "keeping-joints-and-bones-healthy",
    title: "Keeping Joints and Bones Healthy: Cartilage Preservation & DEXA Scans",
    category: "Orthopaedics & Bone Health",
    categorySlug: "orthopaedics",
    author: "Dr. Ravi Kumar",
    authorRole: "Senior Joint Replacement Surgeon",
    authorAvatar: "/assets/doctor_2.png",
    readTime: "5 min read",
    publishedDate: "September 2026",
    image: "/Specialities icons/Orthopedics.jpeg",
    summary: "Practical guidance on nutrition, weight management, strength training, and preventing fragility fractures.",
    overview: "Osteoarthritis and osteoporosis are two distinct skeletal conditions often coexisting with age. Combining weight-bearing exercise, adequate vitamin D3/calcium, and muscle balance protects joints for life.",
    keyTakeaways: [
      "Maintain healthy body mass index (every 1 kg lost relieves 4 kg of knee pressure)",
      "Schedule a DEXA bone scan if you are female over 65 or male over 70",
      "Incorporate resistance training twice weekly to stimulate bone remodeling",
      "Ensure serum 25-hydroxy vitamin D levels remain above 30 ng/mL",
    ],
    sections: [
      {
        heading: "1. Joint Mechanics & Cartilage Nutrition",
        body: "Articular cartilage lacks direct blood vessels and receives nutrients through synovial fluid movement during joint loading. Gentle, regular movement keeps cartilage lubricated.",
      },
      {
        heading: "2. When Is Joint Replacement Necessary?",
        body: "When conservative measures (physiotherapy, viscosupplementation, PRP) fail to relieve bone-on-bone pain, robotic-assisted partial or total joint replacement restores pain-free mobility.",
      },
    ],
    isPopular: false,
  },
  {
    id: "diabetes-management-and-organ-protection",
    slug: "diabetes-management-and-organ-protection",
    title: "Modern Diabetes Care: Beyond Blood Sugar to Cardio-Renal Protection",
    category: "Diabetology & Endocrinology",
    categorySlug: "endocrinology",
    author: "Dr. Devi Prasad Shetty",
    authorRole: "Cardiologist & Healthcare Visionary",
    authorAvatar: "/doctor_patient.png",
    readTime: "6 min read",
    publishedDate: "August 2026",
    image: "/Specialities icons/Endocrinology.jpeg",
    summary: "How modern SGLT2 inhibitors and continuous glucose monitoring protect your kidneys, heart, and retinas.",
    overview: "Diabetes management is no longer merely about maintaining a normal HbA1c; modern evidence emphasizes preserving the vascular endothelial lining against microvascular and macrovascular complications.",
    keyTakeaways: [
      "Target an individualized HbA1c between 6.5% and 7.0%",
      "Check annual urine albumin-to-creatinine ratio (UACR) for kidney protection",
      "Undergo annual dilated fundus examinations by a retina specialist",
      "Adopt continuous glucose monitoring (CGM) to detect nocturnal hypoglycemia",
    ],
    sections: [
      {
        heading: "1. The Glucose Variability Phenomenon",
        body: "Sharp post-meal glucose spikes trigger free radical oxidative stress that accelerates arterial plaque deposition. Eating complex fibers and proteins before carbohydrates blunts post-prandial excursions.",
      },
    ],
    isPopular: true,
  },
  {
    id: "sugar-free-sweets-for-diabetics",
    slug: "sugar-free-sweets-for-diabetics",
    title: "Sugar Free Sweets for Diabetics: How to Enjoy Festivities Without Blood Sugar Spikes",
    category: "Diabetes",
    categorySlug: "endocrinology",
    author: "NH Narayana Health",
    authorRole: "Clinical Endocrinology Team",
    authorAvatar: "/assets/doctor_1.png",
    readTime: "4 min read",
    publishedDate: "Nov 2, 2026",
    image: "/images/articles/sugar_free_sweets_diwali.jpg",
    summary: "Doctor-backed festive dietary guide on natural low-glycemic sweeteners, portion control, and fiber pairing.",
    overview: "Festivals often pose a unique dietary challenge for individuals living with Type 1 or Type 2 diabetes. Choosing natural low-glycemic alternatives and pairing sweets with protein and fiber helps prevent acute post-prandial glycemic excursions.",
    keyTakeaways: [
      "Opt for stevia, monk fruit, or erythritol rather than artificial aspartame blends",
      "Consume sweets after a balanced protein-rich meal rather than on an empty stomach",
      "Stay well-hydrated to help kidneys excrete excess circulating glucose",
      "Check 2-hour postprandial glucose levels to observe personal glycemic response",
    ],
    sections: [
      {
        heading: "1. The Science of the Glycemic Index",
        body: "Traditional Indian sweets made from refined sugar and white flour cause rapid spikes in serum insulin. Substituting almond flour and natural erythritol blunts this insulin surge significantly.",
      },
      {
        heading: "2. The Importance of Fiber and Healthy Fats",
        body: "Incorporating nuts like walnuts, pistachios, and chia seeds slows gastric emptying, creating a gradual, sustained release of glucose rather than a sharp peak.",
      },
    ],
    isPopular: true,
  },
  {
    id: "impact-of-air-pollution-on-heart-health",
    slug: "impact-of-air-pollution-on-heart-health",
    title: "Impact of Air Pollution on Heart Health: Risks, Symptoms and Prevention",
    category: "Cardiology",
    categorySlug: "cardiology",
    author: "Dr. Rajat Kar",
    authorRole: "Consultant Cardiologist",
    authorAvatar: "/assets/doctor_1.png",
    readTime: "5 min read",
    publishedDate: "Oct 30, 2026",
    image: "/Specialities icons/Cardiology.jpeg",
    summary: "How fine particulate matter (PM2.5) induces systemic vascular inflammation and triggers acute cardiac events.",
    overview: "Airborne pollution isn't just a respiratory concern; PM2.5 particles directly cross the pulmonary alveolar-capillary barrier into the bloodstream, triggering vascular oxidative stress and coronary plaque destabilization.",
    keyTakeaways: [
      "Fine particulate matter PM2.5 triggers acute endothelial dysfunction and vasoconstriction",
      "Patients with pre-existing coronary artery disease face elevated risk on poor AQI days",
      "Use N95 masks and indoor HEPA air purification during high smog indices",
      "Maintain strict adherence to cardiovascular medications during winter inversions",
    ],
    sections: [
      {
        heading: "1. The Inhalation to Vascular Translocation Pathway",
        body: "Ultrafine combustion particles translocate directly into the systemic circulation, causing autonomic nervous system imbalance and heightened platelet reactivity.",
      },
    ],
    isPopular: true,
  },
  {
    id: "can-stroke-symptoms-disappear-within-minutes",
    slug: "can-stroke-symptoms-disappear-within-minutes",
    title: "Can Stroke Symptoms Disappear Within Minutes? TIA Warning Signs You Shouldn't Ignore",
    category: "Neurology",
    categorySlug: "neurology",
    author: "Dr. Gourav Goyal",
    authorRole: "Senior Consultant Neurologist",
    authorAvatar: "/assets/doctor_1.png",
    readTime: "5 min read",
    publishedDate: "Oct 30, 2026",
    image: "/Specialities icons/Neurology.jpeg",
    summary: "Recognize Transient Ischemic Attacks (mini-strokes), the BE-FAST rule, and urgent emergency neuro-triage protocols.",
    overview: "A Transient Ischemic Attack (TIA) is a temporary blockage of blood flow to the brain that resolves spontaneously within minutes or hours. However, a TIA is a major medical warning sign: nearly 1 in 3 people who experience a TIA go on to suffer a full stroke within 48 hours without immediate intervention.",
    keyTakeaways: [
      "Use the BE-FAST acronym: Balance, Eyes, Face drooping, Arm weakness, Speech difficulty, Time to call 1800 309 0309",
      "Never wait to see if neurological symptoms return; undergo urgent MRI brain DWI screening",
      "Carotid artery ultrasound and echocardiography detect cardiac and vascular emboli sources",
      "Immediate antiplatelet therapy dramatically reduces imminent stroke risk",
    ],
    sections: [
      {
        heading: "1. What Happens During a Transient Ischemic Attack?",
        body: "A micro-embolus temporarily occludes a cerebral capillary bed, causing focal neurological deficits. Once the body's natural fibrinolytic system dissolves the clot, blood flow restores—yet the underlying vascular vulnerability remains.",
      },
      {
        heading: "2. The Critical Golden Hour for Stroke Prevention",
        body: "Immediate hospital arrival allows stroke teams to perform CT perfusion imaging and initiate dual antiplatelet or anticoagulation therapy before irreversible infarction occurs.",
      },
    ],
    isPopular: true,
  },
  {
    id: "chikungunya-joint-pain-why-it-lasts",
    slug: "chikungunya-joint-pain-why-it-lasts",
    title: "Chikungunya Joint Pain: Why It Lasts for Months and When to Seek Specialist Care",
    category: "Rheumatology",
    categorySlug: "rheumatology",
    author: "NH Narayana Health",
    authorRole: "Rheumatology & Immunology Care",
    authorAvatar: "/doctor_patient.png",
    readTime: "5 min read",
    publishedDate: "Oct 30, 2026",
    image: "/Specialities icons/Rheumatology.jpeg",
    summary: "Comprehensive guide to post-viral chronic arthritis, inflammatory cytokines, and targeted physical rehabilitation.",
    overview: "While fever from the mosquito-borne Chikungunya virus typically subsides within 7 to 10 days, the debilitating polyarthralgia and stiffness in small and large joints can persist for months or even years due to persistent viral RNA remnants and autoimmune synovial inflammation.",
    keyTakeaways: [
      "Post-chikungunya arthritis affects wrists, ankles, knees, and small joints of hands",
      "Early evaluation by a rheumatologist prevents irreversible joint cartilage erosion",
      "Low-dose immunomodulatory medications provide relief in persistent inflammatory synovitis",
      "Gentle aquatic physiotherapy maintains joint range of motion without bearing excess weight",
    ],
    sections: [
      {
        heading: "1. Persistent Synovial Inflammation Explained",
        body: "The chikungunya alphavirus triggers prolonged elevated levels of IL-6 and TNF-alpha within synovial fluid, mimicking seronegative rheumatoid arthritis.",
      },
      {
        heading: "2. Safe Pain Management Protocols",
        body: "Avoid chronic unsupervised NSAID use to protect renal and gastric mucosal health; consult your rheumatologist for disease-modifying regimens when joint swelling persists past 6 weeks.",
      },
    ],
    isPopular: true,
  },
  {
    id: "dengue-fever-recovery-platelet-guide",
    slug: "dengue-fever-recovery-platelet-guide",
    title: "Dengue Fever Recovery: Platelet Count, Warning Signs & Home Care Guidelines",
    category: "General Medicine",
    categorySlug: "general-medicine",
    author: "Dr. Sunita Patel",
    authorRole: "Senior Consultant Internal Medicine",
    authorAvatar: "/assets/doctor_1.png",
    readTime: "4 min read",
    publishedDate: "Oct 28, 2026",
    image: "/Specialities icons/General Surgery.jpeg",
    summary: "Clear medical protocols for monitoring hematocrit, safe oral hydration, and recognizing critical plasma leak phases.",
    overview: "In dengue fever, the critical phase often begins as the fever drops between Day 3 and Day 7. Understanding plasma leakage and hematocrit concentration is far more clinically crucial than focusing solely on the platelet count number.",
    keyTakeaways: [
      "Platelet transfusions are rarely indicated unless platelets fall below 10,000/μL or active bleeding occurs",
      "Watch for critical warning signs: persistent vomiting, severe abdominal pain, mucosal bleeding, extreme lethargy",
      "Oral rehydration with electrolytes is the single most effective home management tool",
      "Never take NSAIDs or aspirin during dengue fever as they amplify bleeding tendencies",
    ],
    sections: [
      {
        heading: "1. The Critical Plasma Leakage Phase",
        body: "Capillary permeability increases during defervescence. Routine complete blood counts (CBC) monitoring hematocrit (PCV) rise serve as an early warning for intravascular fluid depletion.",
      },
    ],
    isPopular: false,
  },
  {
    id: "best-air-purifier-plants-lung-health",
    slug: "best-air-purifier-plants-lung-health",
    title: "Best Air Purifier Plants for Home: Doctor-Approved Houseplants for Lung Health",
    category: "Pulmonology",
    categorySlug: "pulmonology",
    author: "Dr. Ravi Kumar",
    authorRole: "Consultant Pulmonologist",
    authorAvatar: "/assets/doctor_1.png",
    readTime: "4 min read",
    publishedDate: "Oct 26, 2026",
    image: "/Specialities icons/Pulmonology.jpeg",
    summary: "NASA-studied houseplants that absorb indoor volatile organic compounds (VOCs) and enhance respiratory wellness.",
    overview: "Indoor air pollutants such as benzene, formaldehyde, and particulate matter (PM2.5) can exacerbate asthma, allergic rhinitis, and chronic obstructive pulmonary disease (COPD). Certain hardy indoor plants actively metabolize these airborne toxins through their leaves and root microflora.",
    keyTakeaways: [
      "Snake Plant (Sansevieria) releases oxygen at night, making it ideal for bedrooms",
      "Areca Palm and Peace Lily significantly increase indoor humidity and trap particulate dust",
      "Keep plant foliage clean and dust-free to maintain optimal stomatal gas exchange",
      "Air-purifying plants work best in conjunction with HEPA air filters in heavily polluted urban areas",
    ],
    sections: [
      {
        heading: "1. Phyto-Remediation Mechanisms in Urban Homes",
        body: "Plants absorb volatile organic compounds through open stomata, transporting them to the rhizosphere where soil microorganisms break down synthetic chemical residues safely.",
      },
    ],
    isPopular: false,
  },
  {
    id: "robotic-kidney-transplant-advancements",
    slug: "robotic-kidney-transplant-advancements",
    title: "Robotic Kidney Transplantation: Minimally Invasive Techniques, Donor Safety, and Recovery",
    category: "Nephrology",
    categorySlug: "nephrology",
    author: "Dr. Kavita Reddy",
    authorRole: "Director - Renal Sciences & Transplant Surgery",
    authorAvatar: "/assets/doctor_1.png",
    readTime: "6 min read",
    publishedDate: "Oct 24, 2026",
    image: "/Specialities icons/Nephrology.jpeg",
    summary: "How da Vinci robotic surgical systems minimize surgical incision size, blood loss, and recovery time in renal transplants.",
    overview: "Robotic-assisted kidney transplantation (RAKT) represents the pinnacle of minimally invasive transplant surgery, particularly benefiting patients with higher body mass index or prior abdominal surgeries by drastically lowering wound complication rates.",
    keyTakeaways: [
      "Robotic instruments offer 3D 10x magnified visualization and tremor-free 360-degree micro-vascular suturing",
      "Significantly shorter hospital stays and quicker return to normal physical activity",
      "Laparoscopic living donor nephrectomy ensures minimal donor discomfort and rapid post-operative healing",
      "Strict immunosuppressive protocol adherence remains crucial for long-term allograft survival",
    ],
    sections: [
      {
        heading: "1. Precision Vascular Anastomosis with Robotics",
        body: "Articulated EndoWrist instruments enable transplant surgeons to place delicate 6-0 prolene sutures on the renal artery and vein with sub-millimeter precision, minimizing ischemia time.",
      },
    ],
    isPopular: true,
  },
  {
    id: "pediatric-fever-guide-for-parents",
    slug: "pediatric-fever-guide-for-parents",
    title: "Parent's Guide to Childhood Fevers: When to Monitor & When to Rush to Emergency",
    category: "Paediatrics & Child Health",
    categorySlug: "paediatrics",
    author: "Dr. Ravi Prakash",
    authorRole: "Paediatric Specialist",
    authorAvatar: "/assets/doctor_1.png",
    readTime: "4 min read",
    publishedDate: "August 2026",
    image: "/Specialities icons/Paediatrics.jpeg",
    summary: "Clear medical guidelines for parents: hydration, safe antipyretic dosing, and detecting red-flag symptoms.",
    overview: "Fever in children often causes parental anxiety. Fever itself is a physiological defense mechanism against viral and bacterial invaders; recognizing the child's activity level and hydration status is paramount.",
    keyTakeaways: [
      "Any fever in infants under 3 months requires immediate pediatric emergency evaluation",
      "Focus on the child's alertness, fluid intake, and playfulness rather than the thermometer number alone",
      "Never administer aspirin to children due to Reye's syndrome risk",
      "Watch for non-blanching rashes, stiff neck, or extreme lethargy",
    ],
    sections: [
      {
        heading: "1. Safe Hydration and Antipyretic Protocols",
        body: "Administer weight-based paracetamol under pediatric guidance. Offer small, frequent sips of oral rehydration solution, breast milk, or clear soups to prevent dehydration.",
      },
    ],
    isPopular: false,
  },
  {
    id: "cough-syrup-for-kids-parents-guide",
    slug: "cough-syrup-for-kids-parents-guide",
    title: "Cough Syrup for Kids: A Parent's Complete Guide to Cough and Cold Medicines",
    category: "Pediatric",
    categorySlug: "pediatric",
    author: "Narayana Health",
    authorRole: "Clinical Paediatrics Advisory Panel",
    authorAvatar: "/icons/benefits/nh.svg",
    readTime: "4 min read",
    publishedDate: "November 04, 2026",
    image: "/Specialities icons/Paediatrics.jpeg",
    summary: "Essential pediatric safety guide on over-the-counter cough syrups, active ingredients, age-appropriate dosages, and doctor-approved soothing remedies.",
    overview: "Cough in young children is a frequent reason for pediatric visits. While cough syrups are ubiquitous, pediatric clinical guidelines advise careful scrutiny of active ingredients, especially in children under 6 years of age.",
    keyTakeaways: [
      "Avoid multi-symptom cold formulations in children under 4 without pediatric consultation",
      "Honey is a proven, safe demulcent for cough in children older than 1 year (never under 12 months)",
      "Always measure doses using the oral syringe or calibrated cup provided, never household kitchen spoons",
      "Seek emergency care if child displays stridor, intercostal retractions, or persistent high fever",
    ],
    sections: [
      {
        heading: "1. Understanding What is in Pediatric Syrups",
        body: "Most pediatric cough syrups contain either antitussives (dextromethorphan) or expectorants (guaifenesin). Pediatricians recommend warm fluid hydration and saline nasal drops as initial frontline relief.",
      },
      {
        heading: "2. Age-Based Safety Benchmarks",
        body: "Regulatory health authorities advise against OTC cough suppressants in toddlers. Warm steam inhalations and elevated head position during sleep offer gentle, non-pharmacological airway soothing.",
      },
    ],
    isPopular: true,
  },
  {
    id: "what-indias-nfhs-6-survey-reveals",
    slug: "what-indias-nfhs-6-survey-reveals",
    title: "What India's NFHS-6 Survey Reveals About Obesity, Anaemia and Diabetes",
    category: "Diabetes",
    categorySlug: "diabetes",
    author: "Narayana Health",
    authorRole: "Epidemiology & Preventive Health Desk",
    authorAvatar: "/icons/benefits/nh.svg",
    readTime: "5 min read",
    publishedDate: "November 03, 2026",
    image: "/images/articles/sugar_free_sweets_diwali.jpg",
    summary: "Clinical insights from the National Family Health Survey-6: understanding the surge in abdominal adiposity, early metabolic syndrome, and proactive prevention.",
    overview: "The National Family Health Survey highlights shifting epidemiological patterns across urban and semi-urban India. While undernutrition remains a challenge, abdominal obesity and pre-diabetes are rising across younger age cohorts.",
    keyTakeaways: [
      "Waist-to-height ratio > 0.5 is an early marker of visceral adiposity and insulin resistance",
      "Annual HbA1c screening is recommended for all adults above 25 with family history of diabetes",
      "Dietary shift towards minimally processed whole grains blunts postprandial glycemic excursions",
      "Moderate physical activity for 30 minutes daily reduces visceral fat accumulation by up to 25%",
    ],
    sections: [
      {
        heading: "1. The Rising Curve of Pre-Diabetes in Young Working Adults",
        body: "Sedentary occupations and high-glycemic refined carbohydrates are driving metabolic dysregulation a decade earlier than previous generations. Routine preventive screening detects impaired fasting glucose before beta-cell exhaustion.",
      },
      {
        heading: "2. Integrative Strategies for Sustainable Glycemic Control",
        body: "Adopting a plate method with 50% non-starchy vegetables, 25% lean protein, and 25% complex carbohydrates helps maintain consistent energy levels while protecting cardiovascular and renal function.",
      },
    ],
    isPopular: true,
  },
];

export interface ArticleDetailData {
  slug: string;
  title: string;
  category: string;
  categorySlug: string;
  author: string;
  authorRole: string;
  authorAvatar: string;
  readTime: string;
  publishedDate: string;
  heroImage: string;
  summary: string;
  overview: string;
  keyTakeaways: string[];
  sections: { heading: string; body: string }[];
  toc: { id: string; label: string }[];
  doctors: { name: string; designation: string; experience: string; hospital: string; image: string; speciality: string }[];
  relatedArticles: ArticleItem[];
}

export function getArticleDetailData(slug: string): ArticleDetailData {
  const match = ARTICLES_DIRECTORY_DATA.find((a) => a.slug === slug) || ARTICLES_DIRECTORY_DATA[0];

  const matchedDocs = doctorsData.filter((d: DoctorData) =>
    d.speciality.toLowerCase().includes(match.categorySlug) ||
    d.keywords.some((k) => k.toLowerCase().includes(match.categorySlug))
  ).slice(0, 3);

  const fallbackDocs = matchedDocs.length > 0 ? matchedDocs : doctorsData.slice(0, 3);

  const doctors = fallbackDocs.map((d: DoctorData) => ({
    name: d.name,
    designation: `Senior Consultant - ${d.speciality}`,
    experience: "15+ Years",
    hospital: d.hospital,
    image: d.photo,
    speciality: d.speciality,
  }));

  const related = ARTICLES_DIRECTORY_DATA.filter((a) => a.slug !== match.slug).slice(0, 8);

  const toc = [
    { id: "overview", label: "Overview & Introduction" },
    { id: "key-takeaways", label: "Doctor's Key Takeaways" },
    ...match.sections.map((s, idx) => ({
      id: `section-${idx + 1}`,
      label: s.heading.replace(/^\d+\.\s*/, ""),
    })),
    { id: "specialists", label: "Consult Specialists" },
    { id: "more-from-nh", label: "More from Narayana Health" },
    { id: "related", label: "More from Our Blog" },
  ];

  return {
    slug: match.slug,
    title: match.title,
    category: match.category,
    categorySlug: match.categorySlug,
    author: match.author,
    authorRole: match.authorRole,
    authorAvatar: match.authorAvatar,
    readTime: match.readTime,
    publishedDate: match.publishedDate,
    heroImage: match.image,
    summary: match.summary,
    overview: match.overview,
    keyTakeaways: match.keyTakeaways,
    sections: match.sections,
    toc: toc,
    doctors: doctors,
    relatedArticles: related,
  };
}
