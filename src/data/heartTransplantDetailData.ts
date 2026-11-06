export interface TOCEntry {
  id: string;
  label: string;
}

export const HEART_TRANSPLANT_TOC: TOCEntry[] = [
  { id: "overview", label: "Heart Transplant in India: Surgery, Cost & Success Rate" },
  { id: "what-is-it", label: "What Is a Heart Transplant?" },
  { id: "who-needs-care", label: "Who Needs Heart Transplant Care?" },
  { id: "when-recommended", label: "When Is a Heart Transplant Recommended?" },
  { id: "eligibility", label: "Heart Transplant Eligibility Criteria" },
  { id: "who-not-eligible", label: "Who May Not Be Eligible?" },
  { id: "donor-matching", label: "How Donor Matching Works" },
  { id: "waiting-list", label: "The Heart Transplant Waiting List" },
  { id: "pre-transplant-tests", label: "Pre-Transplant Evaluation: Tests Before Surgery" },
  { id: "surgical-procedure", label: "Surgical Procedure & Technology" },
  { id: "recovery-care", label: "Post-Transplant Recovery & Care" },
  { id: "cost-insurance", label: "Cost & Insurance in India" },
  { id: "specialists", label: "Top Cardiac Transplant Surgeons" },
  { id: "hospitals", label: "Equipped Transplant Hospitals" },
  { id: "faqs", label: "Frequently Asked Questions" },
];

export const HEART_TRANSPLANT_DETAIL = {
  title: "Heart Transplant in India: Surgery, Cost & Success Rate",
  heroTitle: "Heart Transplant in India",
  heroSubtitle: "Surgery, Cost & Success Rate",
  leadParagraph: "A heart transplant is a life-saving option for patients with end-stage heart failure when medicines and devices no longer work. Careful heart transplant eligibility assessment, accurate donor matching, and disciplined post-transplant care play a major role in improving the heart transplant success rate. In India, the heart transplant cost varies depending on surgery complexity, ICU stay, and lifelong medicines, making long-term planning essential.",
  
  whatIsIt: {
    title: "What Is a Heart Transplant?",
    description: "A heart transplant is a surgical procedure in which a failing or diseased heart is replaced with a healthy donor heart from a deceased donor. This treatment is reserved for patients whose heart can no longer pump enough blood to meet the body's needs, despite maximum medical therapy.",
    keyPoints: [
      "It is used only for end-stage heart failure.",
      "It improves survival, energy levels, and daily functioning.",
      "It requires lifelong medical follow-up and immunosuppressive medicines.",
      "Unlike temporary treatments such as pacemakers, defibrillators, or mechanical pumps, a heart transplant offers a long-term solution when the heart is beyond recovery.",
    ]
  },

  whoNeedsCare: {
    title: "Who Needs Heart Transplant Care?",
    description: "Patients needing heart transplant care usually experience severe limitations in daily life. These include breathlessness even at rest, repeated hospital admissions, swelling of legs or abdomen, extreme fatigue, and inability to perform basic activities.",
    conditions: [
      { name: "Dilated or restrictive cardiomyopathy", desc: "Weakening or stiffening of the heart muscle walls." },
      { name: "Advanced coronary artery disease (CAD)", desc: "Severe irreversible heart attacks causing extensive muscle scarring." },
      { name: "Severe end-stage congenital heart disease", desc: "Structural heart defects present from birth that cannot be repaired." },
      { name: "Severe heart valve disease with ventricular failure", desc: "Valvular damage leading to irreversible cardiac dilation." },
      { name: "Refractory life-threatening cardiac arrhythmias", desc: "Rhythm disorders unresponsive to medications, ablation, or ICDs." },
    ]
  },

  whenRecommended: {
    title: "When Is a Heart Transplant Recommended?",
    description: "A heart transplant is typically advised when other treatment options have been exhausted and life expectancy without a transplant is significantly reduced.",
    recommendations: [
      "Optimal medicines (such as beta-blockers, ACE inhibitors, and diuretics) no longer control symptoms.",
      "Interventional procedures like angioplasty or coronary bypass surgery (CABG) cannot restore blood flow safely.",
      "Cardiac resynchronization therapy (CRT) or implantable cardioverter-defibrillators (ICD) are insufficient.",
      "Mechanical circulatory support, such as a left ventricular assist device (LVAD), is not viable or is used only as a bridge to transplant.",
      "Peak oxygen uptake (VO2 max) during exercise testing drops below critical safety thresholds (usually < 12–14 mL/kg/min).",
    ]
  },

  eligibility: {
    title: "Heart Transplant Eligibility Criteria",
    eligiblePoints: [
      "End-stage heart failure with NYHA Class III or IV functional impairment.",
      "Good compliance and psychological readiness to follow lifelong medication schedules.",
      "Absence of irreversible failure of other vital organs (such as advanced cirrhosis or untreatable renal failure).",
      "Adequate family or caregiver support system for recovery management.",
      "Age typically up to 70 years, evaluated on physiological fitness.",
    ],
    notEligiblePoints: [
      "Active, untreated systemic infection or sepsis.",
      "Recent active malignancy (cancer) with potential for recurrence.",
      "Severe irreversible pulmonary hypertension with fixed high pulmonary vascular resistance (> 4-5 Wood units).",
      "Active substance abuse (alcohol, smoking, illicit drugs).",
      "Severe peripheral vascular or cerebrovascular disease that limits rehabilitation.",
    ]
  },

  donorMatching: {
    title: "How Donor Matching Works",
    steps: [
      { step: "01", title: "ABO Blood Group Compatibility", desc: "The recipient and donor must have compatible ABO blood groups to avoid acute hyperacute rejection." },
      { step: "02", title: "Body Size & Weight Concordance", desc: "The donor heart size must appropriately match the recipient's height, weight, and thoracic cavity dimensions within +/- 20-30%." },
      { step: "03", title: "HLA Tissue & Antibody Crossmatch", desc: "Panel Reactive Antibody (PRA) and virtual crossmatching ensure the recipient does not possess pre-formed donor-specific antibodies (DSA)." },
      { step: "04", title: "Cold Ischemia Time Window", desc: "The donor heart must be retrieved, transported under strict hypothermic conditions, and implanted within a strict 4-hour window." },
    ]
  },

  costs: {
    title: "Heart Transplant Cost in India: Transparent Breakdown",
    estimateRange: "₹20,00,000 – ₹32,00,000",
    internationalRange: "$28,000 – $42,000 USD",
    inclusions: [
      "Pre-transplant recipient evaluation and donor retrieval logistics.",
      "Complex open-heart transplantation surgery with cardiopulmonary bypass.",
      "7 to 10 days of specialized Cardiac Transplant ICU (CT-ICU) monitoring.",
      "10 to 14 days of step-down recovery ward stay.",
      "Initial induction and maintenance immunosuppressant drugs.",
      "Endomyocardial biopsy surveillance and serial echocardiograms.",
    ],
    insuranceNote: "Most major health insurance policies in India now cover organ transplants including heart transplants up to the sum insured. Narayana Health works with 40+ insurance partners and TPAs to process cashless authorizations and government scheme benefits."
  },

  faqs: [
    {
      q: "What is the average life expectancy after a heart transplant?",
      a: "With modern immunosuppressive therapies and expert surveillance, over 90% of patients survive the first year, and the average survival exceeds 12 to 15 years, with many patients living healthy, productive lives for 20+ years."
    },
    {
      q: "How does Narayana Health ensure donor heart availability?",
      a: "Narayana Health is a registered transplant centre with the state and national organ allocation bodies (such as NOTTO and ROTTO/SOTTO). Organ allocation strictly follows waiting-list priority, medical urgency, and geographic allocation rules."
    },
    {
      q: "What is the recovery timeline after a heart transplant?",
      a: "Patients typically spend 7 to 10 days in the specialized Cardiac Transplant ICU, followed by 1 to 2 weeks in a monitored ward. Most patients resume light activities within 6 to 8 weeks and return to regular work within 3 to 6 months."
    },
    {
      q: "Can I exercise after receiving a heart transplant?",
      a: "Yes. Cardiac rehabilitation is an essential component of recovery. Under supervised guidance, patients gradually build stamina with walking, light jogging, cycling, and resistance exercises."
    },
    {
      q: "What are the common side effects of anti-rejection medications?",
      a: "Immunosuppressants help prevent the body from rejecting the donor heart. Possible side effects include slight susceptibility to infections, mild tremors, elevated blood pressure, or increased blood sugar levels, all of which are managed through careful dosage adjustments."
    }
  ],

  doctors: [
    {
      name: "Dr. Devi Prasad Shetty",
      designation: "Chairman & Senior Consultant Cardiac Surgeon",
      experience: "40+ Years Experience",
      hospital: "Narayana Institute of Cardiac Sciences, Bangalore",
      image: "/Dr.Devi Shetty.png",
      cases: "15,000+ Heart Surgeries"
    },
    {
      name: "Dr. Vivek Jawali",
      designation: "Chief Cardiothoracic & Vascular Surgeon",
      experience: "35+ Years Experience",
      hospital: "Mazumdar Shaw Medical Centre, Bangalore",
      image: "/doctors/doc_vivek.jpg",
      cases: "20,000+ Surgeries"
    },
    {
      name: "Dr. Bagirath Raghuraman",
      designation: "Director - Heart Failure & Transplant Cardiology",
      experience: "24+ Years Experience",
      hospital: "Narayana Health City, Bangalore",
      image: "/doctors/doc_bagirath.jpg",
      cases: "150+ Heart Transplants"
    }
  ],

  hospitals: [
    {
      name: "Narayana Institute of Cardiac Sciences",
      city: "Bangalore, Karnataka",
      beds: "1,000+ Beds Dedicated Cardiac Care",
      image: "https://stgaccinwbsprdlrs02.blob.core.windows.net/corporatewebsite/hospital-images/July2026/KztpC4GYDq70ncLAFLSv.png"
    },
    {
      name: "Rabindranath Tagore International Institute of Cardiac Sciences",
      city: "Kolkata, West Bengal",
      beds: "650+ Beds Multi-Organ Transplant",
      image: "https://stgaccinwbsprdlrs02.blob.core.windows.net/corporatewebsite/hospital-images/July2026/aRn89LPQ7p1zMCysRFNO.png"
    },
    {
      name: "Mazumdar Shaw Medical Centre",
      city: "Bangalore, Karnataka",
      beds: "1,400+ Beds Comprehensive Care",
      image: "https://stgaccinwbsprdlrs02.blob.core.windows.net/corporatewebsite/hospital-images/August2026/X9LPjGaxsejoIT5Aracu.png"
    }
  ]
};
