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
    image: "/images/procedures/procedure_cardiology.png",
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
    image: "/images/procedures/radiation_oncology_hd.jpg",
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
    image: "/Specialities icons/General Surgery.jpeg",
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

  const related = ARTICLES_DIRECTORY_DATA.filter((a) => a.slug !== match.slug).slice(0, 3);

  const toc = [
    { id: "overview", label: "Overview & Introduction" },
    { id: "key-takeaways", label: "Doctor's Key Takeaways" },
    ...match.sections.map((s, idx) => ({
      id: `section-${idx + 1}`,
      label: s.heading.replace(/^\d+\.\s*/, ""),
    })),
    { id: "specialists", label: "Consult Specialists" },
    { id: "related", label: "Related Health Articles" },
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
