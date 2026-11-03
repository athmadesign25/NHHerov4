/** Published profile content, kept separate from appointment-preview values. */
export interface DoctorProfileEditorial {
  summary: readonly string[];
  education?: readonly { title: string; institution?: string }[];
  clinicalExperience?: readonly { role: string; hospital?: string }[];
  awards?: readonly { title: string; subtitle?: string }[];
  memberships?: readonly string[];
  sourceUrl: string;
  verifiedAt: string;
}

/**
 * Concise paraphrases of official NH profiles checked on 3 November 2026.
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
      "His training includes orthopaedics and traumatology in India, followed by advanced training in hip, knee and shoulder surgery in the United Kingdom, Europe and Australia.",
    ],
    education: [
      { title: "MS (Orthopaedics), 2011", institution: "Kasturba Medical College" },
      { title: "DNB (Orthopaedics), 2012", institution: "National Board of Examinations" },
      { title: "Advanced training in hip, knee and shoulder surgery in the United Kingdom, Europe and Australia" },
    ],
    sourceUrl: "https://www.narayanahealth.org/c/bangalore/orthopaedics-and-joint-replacement/dr-abhinandan-s-punit",
    verifiedAt: "2026-11-03",
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
