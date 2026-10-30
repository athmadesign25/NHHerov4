"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import styles from "./AboutSpecialitySection.module.css";

export interface AboutTabContent {
  id: string;
  tabLabel: string;
  title: string;
  intro: string;
  bullets: string[];
  summary: string;
  image?: string;
  imageTag?: string;
  imageCaption?: string;
}

interface AboutSpecialitySectionProps {
  specialitySlug: string;
  specialityTitle: string;
}

// ─── Speciality Content Definitions ──────────────────────────────────────────

const ONCOLOGY_TABS: AboutTabContent[] = [
  {
    id: "when-needed",
    tabLabel: "When do you need specialized cancer care?",
    title: "When do you need specialized cancer care?",
    intro:
      "Early detection, precise diagnostic staging, and prompt clinical intervention are vital for optimal cancer treatment outcomes. Your primary care physician or specialist may recommend an oncology evaluation for one of the following reasons:",
    bullets: [
      "Detection of unexplained or persistent lumps, swollen lymph nodes, or atypical tissue lesions.",
      "Unexplained significant weight loss, chronic fatigue, or persistent fever of unknown origin.",
      "Abnormal diagnostic findings on mammography, ultrasound, CT scans, MRIs, or PET-CT imaging.",
      "Atypical biopsy or histopathology results requiring definitive sub-specialised pathology review.",
      "Seeking a multidisciplinary second opinion before commencing surgery, chemotherapy, or radiotherapy.",
      "High-risk familial or genetic cancer predispositions (e.g., BRCA1/2, Lynch Syndrome).",
      "Comprehensive post-treatment surveillance and long-term remission monitoring.",
    ],
    summary:
      "While a cancer diagnosis can feel overwhelming, a dedicated multidisciplinary tumour board—combining surgical oncologists, medical oncologists, radiation oncologists, and supportive care specialists—delivers personalised treatment pathways designed for your specific clinical needs.",
    image: "/doctor_patient.png",
    imageTag: "Clinical Diagnostic Review",
    imageCaption: "Thorough clinical evaluation and multidisciplinary staging review at Narayana Health",
  },
  {
    id: "non-invasive",
    tabLabel: "Cancer treatments don't need to be invasive",
    title: "Cancer treatments don't need to be invasive",
    intro:
      "Advances in precision surgical technology, targeted molecular medicine, and stereotactic radiosurgery have transformed oncology. Treatments today aim to eliminate tumours while minimizing trauma and preserving your quality of life:",
    bullets: [
      "Robotic & Laparoscopic Surgical Oncology: Sub-millimetre precision, minimal incisions, negligible blood loss, and reduced infection risk.",
      "Organ-Preservation Protocols: Breast-conserving oncoplasty, limb-salvage surgeries, and sphincter-sparing colorectal procedures.",
      "Targeted Therapies & Immunotherapy: Precision molecular drugs that selectively destroy cancer cells while sparing healthy tissue.",
      "Stereotactic Radiosurgery (SBRT / CyberKnife / TrueBeam): Ultra-focused radiation delivering curative doses without surgical cuts.",
      "Daycare Systemic Chemotherapy Suites: Comfortable, ambulatory infusion care allowing patients to return home the same day.",
    ],
    summary:
      "Minimally invasive oncological techniques allow patients to recover significantly faster, maintain natural physiological functions, and transition quickly to adjuvant therapies with minimal downtime.",
    image: "/images/procedures/cyberknife_hd.jpg",
    imageTag: "Precision Radiosurgery",
    imageCaption: "Sub-millimetre non-invasive tumor targeting with advanced linear accelerators",
  },
  {
    id: "conditions",
    tabLabel: "Cancer Conditions and Tumour Types We Treat",
    title: "Cancer Conditions and Tumour Types We Treat",
    intro:
      "Our disease-management teams specialize in distinct oncological disciplines to ensure every tumour type is managed by sub-specialty authorities:",
    bullets: [
      "Gastrointestinal (GI) Cancers: Colorectal, stomach, esophageal, pancreatic, liver, and biliary tract tumours.",
      "Breast & Gynaecological Oncology: Breast cancers, ovarian, endometrial, and cervical malignancies with sentinel node mapping.",
      "Head & Neck Oncology: Oral cavity, tongue, thyroid, laryngeal, and skull-base tumours with microvascular reconstruction.",
      "Haematology & Bone Marrow Transplants: Leukaemia, lymphoma, multiple myeloma, and allogeneic/autologous transplants.",
      "Thoracic Oncology: Non-small cell lung cancer, mediastinal tumours, and pleural mesothelioma.",
      "Urological & Musculoskeletal Oncology: Prostate, bladder, renal cell carcinoma, and bone & soft tissue sarcomas.",
      "Paediatric Oncology: Child-friendly leukaemia, retinoblastoma, and neuroblastoma treatments with specialized paediatric intensivists.",
    ],
    summary:
      "Every single patient case is reviewed at our weekly Multidisciplinary Tumour Board (MDT), where surgical, medical, and radiation oncologists alongside pathologists and radiologists collaboratively validate the optimal treatment plan.",
    image: "/images/procedures/radiation_oncology_hd.jpg",
    imageTag: "Sub-Specialty Programs",
    imageCaption: "Specialized disease management teams dedicated to 14+ distinct tumor streams",
  },
  {
    id: "what-to-expect",
    tabLabel: "What to Expect",
    title: "What to Expect",
    intro:
      "From your initial visit to survivorship and recovery, Narayana Health provides dedicated navigation and clinical support at every step of your journey:",
    bullets: [
      "Step 1 — Comprehensive First Evaluation: Detailed diagnostic review, previous histopathology re-examination, and clinical staging consultation.",
      "Step 2 — Multidisciplinary Tumour Board Formulation: A customized treatment blueprint tailored specifically to your genetic and clinical profile.",
      "Step 3 — Dedicated Patient Care Navigator: A personal liaison assisting you with appointments, billing transparency, and treatment scheduling.",
      "Step 4 — Seamless Cashless Insurance Support: Dedicated on-site desk for prompt insurance pre-authorisations and cashless claims.",
      "Step 5 — Integrative Supportive Oncology: Nutritional counseling, pain & palliative management, and clinical psycho-oncology.",
      "Step 6 — Survivorship & Long-Term Follow-up: Structured monitoring schedules to ensure sustained remission and post-recovery wellness.",
    ],
    summary:
      "Our care coordinators are on standby 24/7 to answer your questions, assist with urgent second opinions, and ensure your treatment begins without unnecessary delays.",
    image: "/bento-patient-first.jpg",
    imageTag: "Patient Navigation",
    imageCaption: "Personalized clinical guidance, insurance pre-authorization, and continuous survivorship care",
  },
];

const CARDIOLOGY_TABS: AboutTabContent[] = [
  {
    id: "when-needed",
    tabLabel: "When do you need cardiac surgery?",
    title: "When do you need cardiac surgery?",
    intro:
      "There are some cases when cardiac surgery is unavoidable. Your doctor may recommend cardiac surgery for one of the following reasons:",
    bullets: [
      "Treating an acute heart attack or unstable coronary ischemia.",
      "Preventing a recurrent heart attack and restoring myocardial blood supply.",
      "Treating progressive heart failure and cardiogenic shock.",
      "Addressing intra-cardiac blood clots and thromboembolic hazards.",
      "Removing calcified plaque buildup and opening severely narrowed coronary arteries.",
      "Addressing irregular heartbeats and complex, medication-resistant arrhythmias.",
      "Opening blocked or narrowed arteries through hybrid surgical interventions.",
      "Repairing adult congenital heart problems (ASD, VSD, Tetralogy of Fallot).",
      "Fixing heart valve disorders (TAVR, minimally invasive mitral and aortic valve repair).",
    ],
    summary:
      "While heart surgery can feel overwhelming, a successful procedure done by specialised cardiac surgeons can treat disorders that prevent the normal functioning of your heart or blood vessels. This can have several life-changing benefits, restoring energy and longevity.",
    image: "/health-checkup-consultation.jpg",
    imageTag: "Cardiac Evaluation",
    imageCaption: "Comprehensive cardiovascular diagnostics and procedural planning",
  },
  {
    id: "non-invasive",
    tabLabel: "Cardiac surgeries don't need to be invasive",
    title: "Cardiac surgeries don't need to be invasive",
    intro:
      "Modern cardiovascular medicine has pioneered minimally invasive and catheter-based interventions that deliver surgical outcomes without sternotomy:",
    bullets: [
      "Minimally Invasive Cardiac Surgery (MICS): Small keyhole incisions between ribs, avoiding bone-cutting of the sternum.",
      "Transcatheter Aortic Valve Replacement (TAVR / TAVI): Valve replacement performed through a catheter via the femoral artery.",
      "Robotic-Assisted Cardiac Interventions: Enhanced 3D visualization and tremor-free microscopic dexterity.",
      "Radial Artery Angioplasty: Same-day discharge procedures accessing coronary arteries through the wrist.",
      "Complex Structural Heart Closures: Device closures for ASD, VSD, and PFO performed in state-of-the-art hybrid cath labs.",
    ],
    summary:
      "Keyhole and robotic heart procedures mean significantly less postoperative discomfort, negligible blood transfusions, shorter hospital stays, and rapid resumption of regular lifestyle.",
    image: "/images/procedures/procedure_cardiology.png",
    imageTag: "Keyhole & Catheter Care",
    imageCaption: "Transcatheter valve implantation and minimally invasive cardiac surgeries",
  },
  {
    id: "conditions",
    tabLabel: "Heart Conditions and Diseases We Treat:",
    title: "Heart Conditions and Diseases We Treat:",
    intro:
      "Our cardiac institutes provide quaternary care for the full spectrum of cardiovascular, thoracic, and vascular conditions:",
    bullets: [
      "Coronary Artery Disease (CAD): Triple vessel disease, left main stenosis, and diffuse multivessel blockages.",
      "Valvular Heart Disease: Severe aortic stenosis, mitral regurgitation, tricuspid valve disease, and infective endocarditis.",
      "Heart Failure & Cardiomyopathy: Dilated and hypertrophic cardiomyopathy, LVAD implantation, and heart transplants.",
      "Cardiac Arrhythmias: Atrial fibrillation, ventricular tachycardia, 3D electrophysiology mapping, and pacemaker/ICD implants.",
      "Aortic Aneurysms & Dissections: Endovascular aortic repair (EVAR/TEVAR) and David procedure valve-sparing root replacement.",
      "Paediatric Congenital Heart Anomalies: Infant and neonatal open-heart surgeries, arterial switch, and Norwood procedures.",
    ],
    summary:
      "With over 5,000+ cardiac surgeries annually and Asia's highest clinical volumes, our cardiac teams consistently deliver survival rates matching international benchmarks.",
    image: "/Advance Heart Care.jpg",
    imageTag: "Quaternary Heart Center",
    imageCaption: "Asia's leading high-volume cardiac institutes delivering world-class outcomes",
  },
  {
    id: "what-to-expect",
    tabLabel: "What to Expect",
    title: "What to Expect",
    intro:
      "From pre-procedure preparation to cardiac rehabilitation, our team ensures complete safety, transparency, and personal guidance:",
    bullets: [
      "Thorough Pre-Operative Assessment: 3D echocardiography, coronary CT, and comprehensive anaesthetic risk stratification.",
      "Transparent Counselling: Clear explanation of surgical and catheter-based options with your surgical team.",
      "Dedicated Intensive Care: Round-the-clock cardiac anaesthetists and critical care nurses in our specialized CT-ICUs.",
      "Rapid Recovery Protocols: Early post-op ambulation to prevent deep vein thrombosis and encourage lung expansion.",
      "Supervised Cardiac Rehab: Physiotherapy, cardiopulmonary exercise training, and dietary education prior to discharge.",
    ],
    summary:
      "Our emergency cardiac helplines and 24/7 cath labs ensure rapid 'door-to-balloon' intervention times under 60 minutes for acute cardiac emergencies.",
    image: "/bento-patient-first.jpg",
    imageTag: "Patient-First Care",
    imageCaption: "Comprehensive intensive care monitoring, rapid recovery protocols, and guided rehab",
  },
];

// Helper to generate content for any other speciality dynamically
function getSpecialityTabs(slug: string, title: string): AboutTabContent[] {
  if (slug === "oncology") return ONCOLOGY_TABS;
  if (slug === "cardiology") return CARDIOLOGY_TABS;

  return [
    {
      id: "when-needed",
      tabLabel: `When do you need a ${title} specialist?`,
      title: `When do you need specialized ${title} care?`,
      intro: `There are key indications when specialist evaluation is essential for long-term health and recovery. Your doctor may recommend a ${title} consultation for one of the following reasons:`,
      bullets: [
        `Persistent or progressive symptoms unresponsive to primary medical management.`,
        `Diagnostic imaging or laboratory markers indicating organ dysfunction or structural abnormalities.`,
        `Definitive second opinion and evaluation by sub-specialised clinical consultants.`,
        `Planning advanced procedural or minimally invasive surgical interventions.`,
        `Complex multi-organ conditions requiring multidisciplinary clinical collaboration.`,
        `Long-term preventive management, rehabilitation, and lifestyle optimization.`,
      ],
      summary: `At Narayana Health, our ${title} department brings together board-certified clinicians, advanced therapeutic technology, and dedicated nursing care to formulate personalized clinical pathways.`,
      image: "/doctor_patient.png",
      imageTag: "Specialist Consultation",
      imageCaption: `Personalized clinical evaluation by board-certified ${title} specialists`,
    },
    {
      id: "non-invasive",
      tabLabel: `${title} treatments don't need to be invasive`,
      title: `Modern ${title} Care: Minimally Invasive & Conservative Approaches`,
      intro: `Modern medical technology has revolutionized ${title}. Treatments today emphasize organ preservation, minimal trauma, and rapid recovery:`,
      bullets: [
        `Minimally invasive keyhole procedures and catheter-based interventions.`,
        `Robotic-assisted precision treatments that minimize tissue trauma and blood loss.`,
        `Advanced non-surgical therapies, targeted pharmaceuticals, and biologic medications.`,
        `High-definition diagnostic guidance ensuring sub-millimetre therapeutic accuracy.`,
        `Daycare ambulatory protocols allowing patients to return home on the same day.`,
      ],
      summary: `Our conservative and minimally invasive approaches significantly reduce hospital stays, minimize post-procedure discomfort, and accelerate your return to normal daily routines.`,
      image: "/images/procedures/procedure_surgery.png",
      imageTag: "Minimally Invasive",
      imageCaption: `Advanced keyhole and robotic precision treatments for ${title}`,
    },
    {
      id: "conditions",
      tabLabel: `Conditions and Diseases We Treat`,
      title: `Conditions and Diseases We Treat in ${title}`,
      intro: `Our specialized department provides tertiary and quaternary clinical care across the entire spectrum of ${title} disorders:`,
      bullets: [
        `Acute and urgent presentations requiring immediate clinical intervention.`,
        `Chronic disorders requiring long-term disease monitoring and lifestyle management.`,
        `Complex, multi-factorial conditions requiring multidisciplinary tumour/clinical boards.`,
        `Structural and degenerative diseases requiring restorative procedural intervention.`,
        `Post-treatment follow-up, disease remission surveillance, and secondary prevention.`,
      ],
      summary: `Every patient benefits from evidence-based clinical protocols validated across Narayana Health's national network of 25+ hospitals.`,
      image: "/bento-clinical-excellence.png",
      imageTag: "Clinical Excellence",
      imageCaption: `Comprehensive care pathways tailored to ${title} patients`,
    },
    {
      id: "what-to-expect",
      tabLabel: "What to Expect",
      title: "What to Expect During Your Care Journey",
      intro: `From your initial evaluation to discharge and ongoing rehabilitation, we ensure seamless communication and transparent support:`,
      bullets: [
        `Step 1 — Comprehensive Clinical Review: Thorough evaluation of previous reports, symptoms, and medical history.`,
        `Step 2 — Transparent Discussion: Clear explanation of diagnostic findings, treatment choices, and expected outcomes.`,
        `Step 3 — Formulated Treatment Plan: Tailored specifically to your lifestyle, medical profile, and overall wellbeing.`,
        `Step 4 — Dedicated Patient Support: Assistance with appointment coordination, pre-authorisations, and insurance claims.`,
        `Step 5 — Ongoing Care & Follow-Up: Structured outpatient review and continuous access to care specialists.`,
      ],
      summary: `Our dedicated medical coordinators are available 24/7 to address any clinical inquiries and assist you in booking prompt consultations.`,
      image: "/bento-patient-first.jpg",
      imageTag: "Compassionate Care",
      imageCaption: `Seamless navigation, insurance assistance, and 24/7 support`,
    },
  ];
}

export default function AboutSpecialitySection({
  specialitySlug,
  specialityTitle,
}: AboutSpecialitySectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const tabs = getSpecialityTabs(specialitySlug, specialityTitle);
  const [activeTabId, setActiveTabId] = useState<string>(tabs[0]?.id || "when-needed");

  // Scroll-linked expansion to fill full screen width like Advance Technology & Why Choose Us
  const { scrollYProgress: enterProgress } = useScroll({
    target: containerRef,
    offset: ["start 92%", "start 25%"],
  });

  const gridScale = useTransform(enterProgress, [0, 1], [0.92, 1.0]);
  const gridWidth = useTransform(enterProgress, [0, 1], ["92%", "100%"]);
  const gridBlur = useTransform(enterProgress, [0, 0.4], ["blur(12px)", "blur(0px)"]);

  const activeContent = tabs.find((t) => t.id === activeTabId) || tabs[0];

  return (
    <div className={styles.sectionWrapper} ref={containerRef}>
      <motion.div
        className={styles.bentoExpandWrapper}
        style={{
          scale: gridScale,
          width: gridWidth,
          filter: gridBlur,
        }}
      >
        <div className={styles.aboutCard}>
          {/* AdvanceTechnology Interactive List Style */}
          <div className={styles.techItemsList} role="tablist" aria-label="About Speciality Topics">
            {tabs.map((tab, idx) => {
              const isActive = tab.id === activeTabId;
              return (
                <div
                  key={tab.id}
                  role="tab"
                  id={`about-tab-${tab.id}`}
                  aria-selected={isActive}
                  aria-controls={`about-panel-${tab.id}`}
                  tabIndex={0}
                  className={`${styles.techItemRow} ${isActive ? styles.techItemRowActive : ""}`}
                  onClick={() => setActiveTabId(tab.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setActiveTabId(tab.id);
                    }
                  }}
                >
                  <div className={styles.techItemHeader}>
                    <div className={styles.techItemTitleGroup}>
                      <span className={styles.techItemNumber}>0{idx + 1}</span>
                      <h4 className={styles.techItemTitle}>{tab.tabLabel}</h4>
                    </div>

                    <div
                      className={`${styles.techActionBtn} ${isActive ? styles.techActionBtnActive : ""}`}
                      aria-label={`${tab.tabLabel} - View details`}
                    >
                      {isActive ? (
                        <ArrowRight size={15} />
                      ) : (
                        <ArrowUpRight size={15} />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Active Content Panel */}
          <div
            id={`about-panel-${activeContent.id}`}
            role="tabpanel"
            aria-labelledby={`about-tab-${activeContent.id}`}
            className={styles.contentPane}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeContent.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              >
                <h3 className={styles.contentTitle}>{activeContent.title}</h3>
                <p className={styles.contentIntro}>{activeContent.intro}</p>

                {activeContent.image && (
                  <div className={styles.contentImageBanner}>
                    <Image
                      src={activeContent.image}
                      alt={activeContent.title}
                      fill
                      sizes="(max-width: 900px) 100vw, 800px"
                      className={styles.contentImage}
                    />
                  </div>
                )}

                <ul className={styles.bulletList}>
                  {activeContent.bullets.map((bullet, i) => (
                    <li key={i} className={styles.bulletItem}>
                      {bullet}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
