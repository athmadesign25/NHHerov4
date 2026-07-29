"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import SplitText from "@/components/ui/SplitText";
import styles from "./ChairmanQuote.module.css";

export default function ChairmanQuote() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], [-40, 40]);

  return (
    <section className={styles.section} id="chairman-quote" ref={sectionRef}>
      <div className="container">
        <div className={styles.inner}>
          {/* Left — Quote Content */}
          <motion.div
            className={styles.content}
            initial={{ opacity: 0, x: -48 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Decorative quote mark */}
            <div className={styles.quoteDecor}>&ldquo;</div>

            {/* SplitText headline */}
            <SplitText
              text="Healthcare must move beyond buildings and beds."
              tag="h2"
              className={styles.quote}
            />

            <motion.p
              className={styles.body}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              The future lies in integrated systems that unite clinical excellence, digital
              intelligence, and human insight. When technology and care move as one, health shifts
              from episodic treatment to lifelong partnership, anticipating risk, enabling
              prevention, and creating a system that is connected, predictive, and truly
              transformative.
            </motion.p>

            <motion.div
              className={styles.signature}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.55, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className={styles.signatureLine} />
              <div className={styles.signatureText}>

                <span className={styles.name}>Dr. Devi Prasad Shetty</span>
                <span className={styles.title}>Founder and Chairman, Narayana Health</span>
              </div>
            </motion.div>


          </motion.div>

          <div className={styles.imageWrap}>
            <motion.div
              className={styles.imageFrame}
              initial={{ opacity: 0, x: 48, scale: 0.96 }}
              whileInView={{ opacity: 1, x: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
              style={{ y: imageY }}
            >
              <motion.div className={styles.imageInner}>
                <Image
                  src="/chairman-portrait.png"
                  alt="Dr. Devi Prasad Shetty — Founder and Chairman, Narayana Health"
                  fill
                  className={styles.image}
                  sizes="(max-width: 1024px) 100vw, 45vw"
                />
              </motion.div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
