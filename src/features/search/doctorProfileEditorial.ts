/** Published profile content, kept separate from appointment-preview values. */
export interface DoctorProfileEditorial {
  summary: readonly string[];
  education?: readonly { title: string; institution?: string }[];
  clinicalExperience?: readonly { role: string; hospital?: string }[];
  awards?: readonly { title: string; subtitle?: string }[];
  memberships?: readonly string[];
  /** Clinical concepts retained from NH; duplicate search tags are omitted. */
  treatments?: readonly string[];
  publications?: readonly { title: string; url?: string; detail?: string }[];
  articles?: readonly {
    title: string;
    url: string;
    date?: string;
    thumbnail?: string;
    /** Named author supplied by NH for this article; never inferred from the profile. */
    author?: string;
    category?: string;
    categoryUrl?: string;
    alt?: string;
  }[];
  sourceUrl: string;
  verifiedAt: string;
}

/**
 * Concise paraphrases and factual profile fields from official NH pages.
 * Each entry records its verification date; links retain access to the source.
 * Missing history stays absent: the directory's simulated experience, fees and
 * availability are never used to manufacture an editorial biography.
 */
export const doctorProfileEditorial: Readonly<Record<string, DoctorProfileEditorial>> = {
  "dr-1": {
    summary: [
      "Dr. Devi Prasad Shetty is a cardiac surgeon whose practice includes heart surgery for adults and surgery for children with congenital heart conditions.",
      "As Narayana Health’s Founder and Chairman, his work also focuses on expanding access to affordable healthcare alongside his clinical practice.",
    ],
    sourceUrl: "https://www.narayanahealth.org/c/bangalore/cardiac-surgery-adult/dr-devi-prasad-shetty",
    verifiedAt: "2026-11-03",
  },
  "dr-ashley": {
    summary: [
      "Dr. Ashley Lucien Joseph D Cruz is a senior consultant in paediatric surgery. His clinical areas include airway surgery in children, paediatric urology and kidney transplantation, as well as robotic surgery.",
      "His postgraduate qualifications cover general surgery and paediatric surgery. He consults at Mazumdar Shaw Medical Centre and Narayana Multispeciality Hospital, HSR, in Bangalore.",
    ],
    sourceUrl: "https://www.narayanahealth.org/c/bangalore/paediatric-surgery/dr-ashley-lucien-joseph-d-cruz",
    verifiedAt: "2026-11-03",
  },
  "d20-dr-abhinandan-s-punit": {
    summary: [
      "Dr. Abhinandan S Punit is a senior consultant and clinical lead in orthopaedic surgery, with a focus on joint replacement and robotic orthopaedic surgery.",
      "His interests include robotic and navigated hip and knee replacement, minimally invasive anterior hip replacement, shoulder surgery and hip arthroscopy. His published experience includes more than 6,000 operations and work with amateur and elite athletes, including athletes from the Sports Authority of India, Bangalore.",
    ],
    education: [
      { title: "MS (Orthopaedics), 2011", institution: "Kasturba Medical College" },
      { title: "DNB (Orthopaedics), 2012", institution: "National Board of Examinations" },
      { title: "Advanced training in hip, knee and shoulder surgery in the United Kingdom, Europe and Australia" },
    ],
    treatments: [
      "Robotic joint replacement",
      "Direct anterior hip replacement",
      "Hip arthroscopy",
      "Sports medicine",
      "ACL reconstruction",
      "Meniscal repair",
      "Shoulder stabilisation",
      "Rotator cuff repair"
    ],
    // The source names organisations here; no specific award is claimed.
    awards: [
      {
        "title": "Indian Orthopedic Association"
      },
      {
        "title": "Indian Arthroscopy Association"
      }
    ],
    articles: [
      {
        "title": "Oedema: Types, Causes, Symptoms, and Treatment",
        "url": "https://www.narayanahealth.org/blog/oedema-types-causes-symptoms-and-treatment",
        "author": "Dr. Abhinandan S Punit",
        "thumbnail": "/assets/doctor-profile-blogs/oedema-types-causes-symptoms-and-treatment.webp",
        "date": "February 20, 2025"
      },
      {
        "title": "Posterior Hip Replacement vs. Direct Anterior Hip Replacement",
        "url": "https://www.narayanahealth.org/blog/posterior-hip-replacement-vs-direct-anterior-hip-replacement",
        "author": "Dr. Abhinandan S Punit",
        "thumbnail": "/assets/doctor-profile-blogs/posterior-hip-replacement-vs-direct-anterior-hip-replacement.webp",
        "date": "February 04, 2025"
      },
      {
        "title": "Direct Anterior Hip Replacement: A Comprehensive Guide",
        "url": "https://www.narayanahealth.org/blog/direct-anterior-hip-replacement-a-comprehensive-guide",
        "author": "Dr. Abhinandan S Punit",
        "thumbnail": "/assets/doctor-profile-blogs/direct-anterior-hip-replacement-a-comprehensive-guide.webp",
        "date": "February 04, 2025"
      },
      {
        "title": "ACL Injury Rehabilitation: New Advances in Recovery Techniques",
        "url": "https://www.narayanahealth.org/blog/acl-injury-rehabilitation-new-advances-in-recovery-techniques",
        "author": "Dr. Abhinandan S Punit",
        "thumbnail": "/assets/doctor-profile-blogs/acl-injury-rehabilitation-new-advances-in-recovery-techniques.webp",
        "date": "January 27, 2025"
      },
      {
        "title": "AI in Orthopaedics: Transforming Diagnosis and Surgery",
        "url": "https://www.narayanahealth.org/blog/ai-in-orthopaedics-transforming-diagnosis-and-surgery",
        "author": "Dr. Abhinandan S Punit",
        "thumbnail": "/assets/doctor-profile-blogs/ai-in-orthopaedics-transforming-diagnosis-and-surgery.webp",
        "date": "December 06, 2024"
      }
    ],
    sourceUrl: "https://www.narayanahealth.org/c/bangalore/orthopaedics-and-joint-replacement/dr-abhinandan-s-punit",
    verifiedAt: "2026-11-04",
  },
  "d20-dr-aditi-singhvi": {
    "summary": [
      "Dr. Aditi Singhvi is a cardiologist specialising in advanced heart failure and heart transplantation. Her work at Narayana Institute of Cardiac Sciences includes the Heart Failure, LVAD and Heart Transplant Care Center.",
      "Her research focuses on outcomes in heart failure and after heart transplantation. She has authored peer-reviewed research and contributes to work on advanced heart disease, medical training and access to advanced heart failure therapies."
    ],
    "education": [
      {
        "title": "Residency in Internal Medicine",
        "institution": "Wayne State University, USA"
      },
      {
        "title": "Fellowship in Cardiology",
        "institution": "University of Connecticut, USA"
      },
      {
        "title": "Fellowship in Advanced Heart Failure and Transplant Cardiology",
        "institution": "Houston Methodist DeBakey Heart & Vascular Center, USA"
      }
    ],
    "clinicalExperience": [
      {
        "role": "Advanced Heart Failure and Transplant Cardiologist; Assistant Professor",
        "hospital": "Mount Sinai Hospital, New York, USA"
      }
    ],
    "awards": [
      {
        "title": "Top 10 publications recognition",
        "subtitle": "Journal of Heart and Lung Transplantation, 2020"
      },
      {
        "title": "National top 10% in Internal Medicine in-training examination",
        "subtitle": "2014"
      },
      {
        "title": "Senior Resident of the Month",
        "subtitle": "Henry Ford Hospital, July 2014"
      },
      {
        "title": "ICU Resident of the Month",
        "subtitle": "Henry Ford Hospital, October 2013"
      },
      {
        "title": "Academic performance certificate of merit",
        "subtitle": "Kasturba Medical College, 2011"
      },
      {
        "title": "Academic performance certificate of merit",
        "subtitle": "Kasturba Medical College, 2006"
      }
    ],
    "memberships": [
      "Fellow, American College of Cardiology",
      "International Society of Heart and Lung Transplantation",
      "Heart Failure Society of America",
      "American Society of Transplantation"
    ],
    "treatments": [
      "Acute, chronic and advanced heart failure",
      "Cardiogenic shock",
      "Dilated and ischaemic cardiomyopathy",
      "Peripartum cardiomyopathy",
      "Genetic or familial cardiomyopathy",
      "Cardio-oncology",
      "Hypertrophic cardiomyopathy",
      "Cardiac amyloidosis",
      "Cardiac sarcoidosis",
      "Heart failure with preserved ejection fraction (HFpEF)",
      "Valvular heart disease",
      "Pericardial disease",
      "Myocarditis",
      "Pulmonary hypertension due to heart disease",
      "Invasive haemodynamic monitoring and complex haemodynamics",
      "Advanced heart failure therapy evaluation",
      "Temporary mechanical circulatory support and ECMO management",
      "Durable left ventricular assist device (LVAD) management",
      "Heart transplant waiting-list management",
      "Post-heart transplant care, monitoring and preventive care",
      "Immunosuppression and transplant rejection management",
      "Right heart catheterisation",
      "Endomyocardial biopsy",
      "Cardiopulmonary exercise testing",
      "Remote monitoring and telehealth for heart failure",
      "CardioMEMS implantation and pulmonary artery pressure monitoring"
    ],
    "publications": [
      {
        "title": "Challenges in Heart Transplantation during COVID-19: A Single-Center Experience",
        "detail": "Singhvi A and colleagues"
      },
      {
        "title": "Left Ventricular Assist Devices 101: Shared Care for General Cardiologists and Primary Care",
        "detail": "Journal of Clinical Medicine, 2019",
        "url": "https://doi.org/10.3390/jcm8101720"
      },
      {
        "title": "Impact of Gd-153 scanning line source attenuation correction on downstream invasive testing",
        "detail": "Journal of Nuclear Cardiology, 2021",
        "url": "https://doi.org/10.1007/s12350-021-02565-2"
      },
      {
        "title": "Do ICD diagnostics predict failure of ventricular tachycardia response to antitachycardia pacing and need for a shock?",
        "detail": "Pacing and Clinical Electrophysiology",
        "url": "https://doi.org/10.1111/pace.14002"
      },
      {
        "title": "SPECT Myocardial Perfusion Imaging in Liver Transplantation Candidates",
        "detail": "Journal of Nuclear Cardiology, 2018",
        "url": "https://doi.org/10.1007/s12350-018-1388-3"
      },
      {
        "title": "Selexipag, an Oral Prostacyclin-Receptor Agonist for Pulmonary Arterial Hypertension",
        "detail": "Annals of Pharmacotherapy, 2017",
        "url": "https://pubmed.ncbi.nlm.nih.gov/28478717/"
      },
      {
        "title": "Pathophysiology of Nitrate Toxicity in Human and its Mitigation Measures",
        "detail": "Bulletins on Regional Assessment of Reactive Nitrogen, 2010"
      }
    ],
    "articles": [
      {
        "title": "Cardiac Cirrhosis: Meaning, Causes, Symptoms and Treatment",
        "url": "https://www.narayanahealth.org/blog/cardiac-cirrhosis-meaning-causes-symptoms-treatment",
        "author": "Dr. Aditi Singhvi",
        "thumbnail": "/assets/doctor-profile-blogs/cardiac-cirrhosis-meaning-causes-symptoms-treatment.webp",
        "date": "March 26, 2026"
      },
      {
        "title": "Heart Health and Winter Weight Gain: Tips to Stay on Track",
        "url": "https://www.narayanahealth.org/blog/heart-health-and-winter-weight-gain-tips-to-stay-on-track",
        "author": "Dr. Aditi Singhvi",
        "thumbnail": "/assets/doctor-profile-blogs/heart-health-and-winter-weight-gain-tips-to-stay-on-track.webp",
        "date": "December 19, 2024"
      },
      {
        "title": "Impact of Sleep on Heart Health",
        "url": "https://www.narayanahealth.org/blog/impact-of-sleep-on-heart-health",
        "author": "Dr. Aditi Singhvi",
        "thumbnail": "/assets/doctor-profile-blogs/impact-of-sleep-on-heart-health.webp",
        "date": "August 13, 2024"
      },
      {
        "title": "Heart Conditions and Pregnancy: Evaluating the Risks",
        "url": "https://www.narayanahealth.org/blog/heart-conditions-pregnancy-evaluating-risks",
        "author": "Dr. Aditi Singhvi",
        "thumbnail": "/assets/doctor-profile-blogs/heart-conditions-pregnancy-evaluating-risks.webp",
        "date": "July 29, 2024"
      },
      {
        "title": "Heart Failure: Understanding Risks, Symptoms, Diagnosis and Treatment",
        "url": "https://www.narayanahealth.org/blog/heart-failure-understanding-risks-symptoms-diagnosis-and-treatment",
        "author": "Dr. Aditi Singhvi",
        "thumbnail": "/assets/doctor-profile-blogs/heart-failure-understanding-risks-symptoms-diagnosis-and-treatment.webp",
        "date": "April 03, 2024"
      }
    ],
    "sourceUrl": "https://www.narayanahealth.org/c/bangalore/cardiology-adult/dr-aditi-singhvi",
    "verifiedAt": "2026-11-04"
  },
  "d20-dr-aditi-rao": {
    summary: [
      "Dr. Aditi Rao is a consultant in medical gastroenterology. She diagnoses and treats conditions affecting the digestive tract, liver, pancreas and biliary system.",
      "Her clinical interests include inflammatory bowel disease, irritable bowel syndrome, chronic diarrhoea, gastrointestinal bleeding and liver disease. She completed her specialist gastroenterology training at KLE Academy of Higher Education and Research.",
    ],
    education: [
      { title: "DM (Medical Gastroenterology)", institution: "KLE Academy of Higher Education and Research" },
    ],
    sourceUrl: "https://www.narayanahealth.org/c/bangalore/medical-gastroenterology/dr-aditi-rao",
    verifiedAt: "2026-11-03",
  },
};
