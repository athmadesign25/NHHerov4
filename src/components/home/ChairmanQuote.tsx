"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import SplitText from "@/components/ui/SplitText";
import styles from "./ChairmanQuote.module.css";

export default function ChairmanQuote() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]);

  return (
    <section className={styles.section} id="chairman-quote" ref={containerRef}>
      <motion.div
        style={{
          position: "absolute",
          top: "-25%",
          left: 0,
          width: "100%",
          height: "150%",
          backgroundImage: "url('/images/backgrounds/leadership-bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          y: bgY,
          zIndex: 0,
        }}
      />
      <div className="container" style={{ position: "relative", zIndex: 1 }}>
        <motion.div
          className={styles.card}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            className={styles.content}
            initial={{ opacity: 0, x: -28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className={`section-eyebrow ${styles.eyebrow}`}>
              LEADERSHIP
            </div>

            <SplitText
              text="Healthcare must move beyond buildings and beds."
              tag="p"
              className={styles.quote}
            />

            <motion.p
              className={styles.body}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            >
              The future lies in integrated systems that unite clinical excellence, digital
              intelligence, and human insight. When technology and care move as one, health shifts
              from episodic treatment to lifelong partnership, anticipating risk, enabling
              prevention, and creating a system that is connected, predictive, and truly
              transformative.
            </motion.p>
          </motion.div>

          <div className={styles.imageWrap}>
            <motion.div
              className={styles.imageFrame}
              initial={{ opacity: 0, x: 28, scale: 0.97 }}
              whileInView={{ opacity: 1, x: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            >
              <motion.div className={styles.imageInner}>
                <Image
                  src="/images/backgrounds/chairman-portrait.png"
                  alt="Dr. Devi Prasad Shetty — Founder and Chairman, Narayana Health"
                  fill
                  className={styles.image}
                  sizes="(max-width: 1024px) 100vw, 45vw"
                />

                <div className={styles.identityPill}>
                  <span className={styles.name}>Dr. Devi Prasad Shetty</span>
                  <span className={styles.title}>Founder and Chairman, Narayana Health</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
