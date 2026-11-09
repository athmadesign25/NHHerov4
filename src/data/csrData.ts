export interface CsrHeroData {
  eyebrow: string;
  title: string;
  subtitle: string;
  videoUrl: string;
  posterUrl: string;
  stats: {
    label: string;
    value: string;
    description: string;
  }[];
}

export interface CsrEditorialItem {
  id: string;
  title: string;
  category: string;
  date: string;
  fileSize: string;
  downloadUrl: string;
  image: string;
  description: string;
}

export interface CsrProgramPoint {
  title: string;
  body: string;
  iconName: "camps" | "education" | "school" | "radio" | "heart" | "mobile" | "partnership" | "scholarship";
}

export interface CsrProgramItem {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  imagePosition: "left" | "right";
  points: CsrProgramPoint[];
  statBadge?: {
    number: string;
    label: string;
  };
  modalContent: {
    lead: string;
    paragraphs: string[];
    metrics: { label: string; value: string }[];
  };
}

export const CSR_HERO_DATA: CsrHeroData = {
  eyebrow: "NARAYANA HEALTH CORPORATE SOCIAL RESPONSIBILITY",
  title: "Transforming Communities by Inspiring Hope",
  subtitle: "Healthcare is an unconditional human right. Through proactive rural health camps, grassroots health education, neighborhood broadcasting, and life-saving pediatric cardiac surgery funds, our CSR initiatives empower India's most vulnerable populations.",
  videoUrl: "/5808902_Coll_wavebreak_Hospital_1280x720.mp4",
  posterUrl: "/images/csr/csr-health-camps.jpg",
  stats: [
    {
      value: "1.2M+",
      label: "Beneficiaries Touched",
      description: "Patients provided free clinical care, medication, and screenings.",
    },
    {
      value: "350+",
      label: "Rural Health Camps",
      description: "Conducted across deep rural panchayats & underserved belts.",
    },
    {
      value: "15,000+",
      label: "Little Hearts Saved",
      description: "Free and subsidized pediatric cardiac surgeries performed.",
    },
    {
      value: "90.4 FM",
      label: "Community Radio Reach",
      description: "Broadcasting daily public health guidance to 400K+ listeners.",
    },
  ],
};

export const CSR_EDITORIALS_DATA: CsrEditorialItem[] = [
  {
    id: "sambandh-edition-3",
    title: "Sambandh — CSR Newsletter Edition - 3",
    category: "Quarterly Newsletter",
    date: "November 2026",
    fileSize: "3.4 MB",
    downloadUrl: "#download",
    image: "/Advance Heart Care.jpg",
    description: "Milestones in rural oncology screening under Program H.O.P.E., mobile dental clinics, and nutrition support.",
  },
  {
    id: "reinventing-new-normal",
    title: "RE-Inventing New Normal",
    category: "Strategy Whitepaper",
    date: "October 2026",
    fileSize: "4.2 MB",
    downloadUrl: "#download",
    image: "/Bone & Joint.jpg",
    description: "Post-pandemic community healthcare framework focusing on decentralized triage and remote tele-consultations.",
  },
  {
    id: "covid-19-safety-recommendations",
    title: "COVID-19 After Lockdown Safety Recommendations",
    category: "Clinical Advisory",
    date: "September 2026",
    fileSize: "2.1 MB",
    downloadUrl: "#download",
    image: "/Brain and Spine.jpg",
    description: "Evidence-based 6-month safety and occupational health recommendations by the NH CSR Advisory Council.",
  },
  {
    id: "sambandh-edition-2",
    title: "Sambandh — CSR Newsletter Edition - 2",
    category: "Quarterly Newsletter",
    date: "June 2026",
    fileSize: "2.9 MB",
    downloadUrl: "#download",
    image: "/Digestive Health.png",
    description: "Special report on Maternal & Obstetric Monitoring (MOM) in rural taluks and school hygiene drives.",
  },
  {
    id: "sambandh-edition-1",
    title: "Sambandh — CSR Newsletter Edition - 1",
    category: "Quarterly Newsletter",
    date: "March 2026",
    fileSize: "2.7 MB",
    downloadUrl: "#download",
    image: "/Oncology Institute.jpg",
    description: "Inaugural newsletter detailing grassroot healthcare partnerships and community broadcasting milestones.",
  },
  {
    id: "annual-csr-governance-report",
    title: "Annual CSR Social Impact & Governance Charter",
    category: "Statutory Filing",
    date: "Annual FY 2026",
    fileSize: "5.6 MB",
    downloadUrl: "#download",
    image: "/why-nh-comprehensive-care.jpg",
    description: "Audited social return on investment (SROI), Schedule VII compliance, and community development roadmaps.",
  },
];

export const CSR_PROGRAMS_DATA: CsrProgramItem[] = [

  {
    id: "health-wellness",
    eyebrow: "PRIMARY HEALTHCARE & SCREENING",
    title: "Transforming Lives through Health and Wellness",
    description: "Accessible quality care is a fundamental human right. Our primary healthcare drives take world-class clinical capabilities directly into remote villages, urban settlements, and underserved agrarian belts to diagnose illnesses before they turn critical.",
    image: "/images/csr/csr-health-camps.jpg",
    imageAlt: "Female doctor examining young girl with mother in rural health clinic",
    imagePosition: "left",
    statBadge: {
      number: "120K+",
      label: "Rural Consultations",
    },
    points: [
      {
        iconName: "camps",
        title: "Community Health Camps",
        body: "Organizing free Health camps in underserved areas, providing medical check-ups, screenings, ECG diagnostics, and consultations.",
      },
      {
        iconName: "education",
        title: "Health Education Programs",
        body: "Conducting workshops and seminars to raise awareness about preventive healthcare, lifestyle diseases, hypertension, and healthy living.",
      },
      {
        iconName: "school",
        title: "School Health Program",
        body: "Conducting workshops and seminars to raise awareness about preventive healthcare, lifestyle diseases, malnutrition, and pediatric eye health.",
      },
    ],
    modalContent: {
      lead: "Narayana Health's Health & Wellness initiatives bridge the critical distance between tertiary medical centers and grassroots rural communities.",
      paragraphs: [
        "In many rural parts of India, access to a qualified physician or essential diagnostic screening requires travelling 40 to 80 kilometers. Narayana Health CSR deploys multidisciplinary medical teams including cardiologists, general physicians, pediatricians, and nurses directly into village panchayats.",
        "Equipped with portable ultrasound scanners, rapid blood-profiling kits, and digital ECG monitors, our camps identify chronic conditions such as rheumatic heart disease, hypertension, diabetes, and oncological lesions at an early, highly treatable stage.",
        "Patients requiring advanced surgical intervention or tertiary hospital treatment are smoothly referred and sponsored through the Narayana Hrudayalaya Foundation hospital network.",
      ],
      metrics: [
        { label: "Free Camps Held", value: "350+ Annual" },
        { label: "Free Medications Dispensed", value: "85,000+ Units" },
        { label: "Primary Referrals", value: "4,200+ Cases" },
        { label: "Districts Covered", value: "18 Districts" },
      ],
    },
  },
  {
    id: "education-support",
    eyebrow: "EDUCATION & ALLIED HEALTHCARE",
    title: "Building Bridges of Support through Education",
    description: "Socio-economic well-being is inseparable from educational empowerment. Narayana Health collaborates with government institutions to modernize rural school ecosystems, champion girl child education, and sponsor youth into specialized allied healthcare careers.",
    image: "/images/csr/csr-education.jpg",
    imageAlt: "Indian schoolgirls in clean blue uniforms reading and learning in classroom",
    imagePosition: "right",
    statBadge: {
      number: "450+",
      label: "Scholarships Granted",
    },
    points: [
      {
        iconName: "partnership",
        title: "Government Partnerships",
        body: "Collaborating with district education authorities to equip government schools with pure drinking water stations, clean sanitation, and digital learning smart-boards.",
      },
      {
        iconName: "scholarship",
        title: "Scholarships for Nursing & Paramedics",
        body: "Providing full tuition and hostel stipends for underprivileged rural girls pursuing degrees in nursing, dialysis technology, and emergency medical care.",
      },
      {
        iconName: "school",
        title: "Youth Health Literacy & STEM Labs",
        body: "Mentoring high-school students through hands-on science workshops, adolescent hygiene guidance, and career pathways in modern clinical medicine.",
      },
    ],
    modalContent: {
      lead: "By providing academic infrastructure and sponsoring vocational healthcare qualifications, we break generational cycles of poverty.",
      paragraphs: [
        "Our educational interventions focus on two parallel tracks: improving baseline learning environments in government schools, and creating sustainable employment by training youth in hospital professions.",
        "Under our flagship Nursing & Paramedic Scholarship, students from marginalized families receive fully funded tuition at accredited medical colleges, along with mentored clinical internships across Narayana Health hospitals.",
        "Upon graduation, over 95% of scholars secure formal hospital employment, transforming their families' economic trajectory while contributing vital healthcare workforce capacity to India.",
      ],
      metrics: [
        { label: "Schools Adopted", value: "42 Schools" },
        { label: "Students Benefited", value: "16,000+" },
        { label: "Nursing Scholars Graduated", value: "450+ Youths" },
        { label: "Placement Rate", value: "98.5%" },
      ],
    },
  },
  {
    id: "neighborhood-broadcasting",
    eyebrow: "COMMUNITY RADIO & TELEHEALTH",
    title: "Neighborhood Broadcasting Initiative — Namma Naadi (90.4 FM)",
    description: "Established in January 2017, Namma Naadi (90.4 FM) is a community radio programme by Narayana Hrudayalaya Foundation, in collaboration with Narayana Health. Serving communities in and around Anekal Taluk, Bengaluru Rural, Namma Naadi delivers reliable public health knowledge directly into homes and farmsteads.",
    image: "/images/csr/csr-community-radio.jpg",
    imageAlt: "Two Indian healthcare broadcasters with headphones in Namma Naadi radio studio",
    imagePosition: "left",
    statBadge: {
      number: "400K+",
      label: "Daily Listeners",
    },
    points: [
      {
        iconName: "radio",
        title: "Doctor-Led Live Health Programs",
        body: "Senior Narayana Health clinicians host live interactive call-in shows, answering listener questions on maternal health, child nutrition, and chronic disease.",
      },
      {
        iconName: "education",
        title: "Agrarian Guidance & Weather Bulletins",
        body: "Broadcasting daily agro-climatic advisories, soil health guidance, and government welfare scheme announcements for agrarian families.",
      },
      {
        iconName: "mobile",
        title: "Namma Naadi Mobile Streaming App",
        body: "With the Namma Naadi app, available on Google Play Store, communities can access live streaming of on-air programmes and enjoy podcasts at their convenience.",
      },
    ],
    modalContent: {
      lead: "Namma Naadi (90.4 FM) gives a credible voice to rural public health, dismantling medical superstitions and answering real questions every day.",
      paragraphs: [
        "Operating from its broadcast studio in Bengaluru Rural, Namma Naadi ('Our Pulse') is one of India's premier hospital-run community radio stations. The channel broadcasts 14 hours every single day in Kannada and local dialects.",
        "Listeners can dial into live programs to consult Narayana Health physicians free of charge, discussing everything from pediatric fevers to mental wellness, cardiac symptoms, and first aid.",
        "The station also serves as an emergency communication lifeline during natural disasters and seasonal epidemics, delivering verified clinical advice directly into villages.",
      ],
      metrics: [
        { label: "Broadcast Hours", value: "14 Hrs / Day" },
        { label: "Episodes Aired", value: "8,500+" },
        { label: "Live Callers Answered", value: "32,000+" },
        { label: "App Downloads", value: "50,000+" },
      ],
    },
  },
  {
    id: "pediatric-cardiac",
    eyebrow: "CRITICAL CHARITABLE INTERVENTIONS",
    title: "Saving Little Hearts & Specialized Charitable Surgeries",
    description: "Dr. Devi Shetty established Narayana Health on the foundational belief that no child should ever be denied cardiac surgery due to lack of family financial resources. Our dedicated CSR surgery corpus provides world-class pediatric interventions completely free of charge.",
    image: "/images/csr/csr-pediatric-cardiac.jpg",
    imageAlt: "Pediatric heart doctor checking a smiling recovered toddler with parents",
    imagePosition: "right",
    statBadge: {
      number: "15,000+",
      label: "Heart Surgeries Funded",
    },
    points: [
      {
        iconName: "heart",
        title: "Free Pediatric Congenital Heart Surgeries",
        body: "Full underwriting of complex surgical repairs for conditions such as Tetralogy of Fallot, Ventricular Septal Defects (VSD), and arterial switch procedures.",
      },
      {
        iconName: "mobile",
        title: "Mobile Mammography & Cancer Screening Vans",
        body: "Customized air-conditioned mobile screening buses equipped with low-dose digital mammography, delivering free breast cancer diagnosis to rural women.",
      },
      {
        iconName: "camps",
        title: "Railway Emergency Health Centers",
        body: "Operating 24x7 emergency medical centers at high-traffic railway stations to deliver instantaneous triage, CPR, and stabilization to commuters.",
      },
    ],
    modalContent: {
      lead: "Every child born with a congenital heart defect deserves an equal opportunity to live, play, learn, and grow.",
      paragraphs: [
        "In India, over 200,000 children are born with congenital heart defects every single year. Without timely surgical intervention, more than 25% do not survive their first year. Narayana Health performs the highest volume of pediatric heart surgeries globally.",
        "Through our CSR foundation, children from economically disadvantaged households are identified during district screening camps and admitted directly to our pediatric super-specialty wings.",
        "The foundation covers comprehensive hospitalization, diagnostic tests, intensive care, valve implants, post-surgical medication, and long-term follow-up consultations at zero cost to the family.",
      ],
      metrics: [
        { label: "Pediatric Surgeries", value: "15,000+ Total" },
        { label: "Mobile Mammograms", value: "65,000+ Screened" },
        { label: "Emergency Rail Triage", value: "180,000+ Patients" },
        { label: "Survival Rate", value: "98.7%" },
      ],
    },
  },
];

export function getCsrProgramBySlug(slug: string): CsrProgramItem {
  const found = CSR_PROGRAMS_DATA.find((p) => p.id === slug);
  return found || CSR_PROGRAMS_DATA[0];
}

