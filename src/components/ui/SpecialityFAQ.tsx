"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import styles from "./SpecialityFAQ.module.css";

export interface FAQItem {
  question?: string;
  answer?: string;
  q?: string;
  a?: string;
}

export interface SpecialityFAQProps {
  faqs: FAQItem[];
  theme?: "light" | "dark";
  fluid?: boolean;
  className?: string;
  defaultOpenIndex?: number | null;
}

export function SpecialityFAQ({
  faqs,
  theme = "dark",
  fluid = false,
  className = "",
  defaultOpenIndex = 0,
}: SpecialityFAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(defaultOpenIndex);

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

  if (!faqs || faqs.length === 0) return null;

  return (
    <motion.div
      className={`${styles.faqList} ${fluid ? styles.faqListFluid : ""} ${theme === "dark" ? styles.themeDark : ""} ${className}`}
      role="list"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.08,
            delayChildren: 0.1,
          },
        },
      }}
    >
      {faqs.map((faq, i) => {
        const isOpen = openIndex === i;
        const qText = faq.question || faq.q || "";
        const aText = faq.answer || faq.a || "";

        return (
          <motion.div
            key={i}
            className={`${styles.faqItem} ${isOpen ? styles.faqItemOpen : ""}`}
            role="listitem"
            variants={{
              hidden: { opacity: 0, y: 20, filter: "blur(6px)" },
              visible: {
                opacity: 1,
                y: 0,
                filter: "blur(0px)",
                transition: {
                  duration: 0.45,
                  ease: [0.22, 1, 0.36, 1],
                },
              },
            }}
          >
            <button
              type="button"
              className={styles.faqQuestion}
              onClick={() => toggle(i)}
              aria-expanded={isOpen}
              aria-controls={`faq-answer-${i}`}
              id={`faq-question-${i}`}
            >
              <span className={styles.questionText}>{qText}</span>
              <motion.span
                className={styles.icon}
                animate={{ scale: [0.92, 1] }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                aria-hidden="true"
              >
                {isOpen ? (
                  <Minus size={18} strokeWidth={2} />
                ) : (
                  <Plus size={18} strokeWidth={2} />
                )}
              </motion.span>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={`faq-answer-${i}`}
                  role="region"
                  aria-labelledby={`faq-question-${i}`}
                  className={styles.faqAnswer}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                  style={{ overflow: "hidden" }}
                >
                  <p className={styles.answerText}>{aText}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

export { SpecialityFAQ as ClinicalFAQ };
export default SpecialityFAQ;
