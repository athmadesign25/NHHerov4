"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./DoctorFAQ.module.css";

interface FAQItem {
  question: string;
  answer: string;
}

interface DoctorFAQProps {
  doctorName: string;
  faqs?: FAQItem[];
}

export default function DoctorFAQ({ doctorName, faqs }: DoctorFAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // First item open by default

  const defaultFaqs: FAQItem[] = [
    {
      question: `What are the qualifications of ${doctorName}?`,
      answer: `${doctorName} is highly qualified with extensive medical training. They hold specialized degrees and certifications in their field of expertise from premier medical institutions.`
    },
    {
      question: `What conditions does ${doctorName} treat?`,
      answer: `${doctorName} specializes in diagnosing and treating a wide range of complex conditions related to their core specialty. They use evidence-based approaches for both chronic management and acute interventions.`
    },
    {
      question: `Does ${doctorName} offer video consultations?`,
      answer: `Yes, ${doctorName} offers secure video consultations through the Narayana Health platform. You can easily book a "Video Consult" slot from the booking section above.`
    }
  ];

  const displayFaqs = faqs || defaultFaqs;

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.heading}>Frequently Asked Questions</h2>
      <div className={styles.faqList}>
        {displayFaqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div 
              key={index} 
              className={[styles.faqItem, isOpen ? styles.faqItemOpen : ""].join(" ")}
            >
              <button
                className={styles.questionBtn}
                onClick={() => setOpenIndex(isOpen ? null : index)}
                aria-expanded={isOpen}
              >
                <span className={styles.questionText}>{faq.question}</span>
                <ChevronDown 
                  size={18} 
                  className={[styles.icon, isOpen ? styles.iconOpen : ""].join(" ")} 
                />
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className={styles.answerWrapper}
                  >
                    <div className={styles.answerText}>
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
      
      {/* Hidden JSON-LD for Schema.org AEO optimization */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": displayFaqs.map((faq) => ({
              "@type": "Question",
              "name": faq.question,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
              }
            }))
          })
        }}
      />
    </div>
  );
}
