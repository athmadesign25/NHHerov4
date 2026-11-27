"use client";

import React from "react";
import { motion } from "framer-motion";
import styles from "./CsrTransitionBridge.module.css";

export default function CsrTransitionBridge() {
  return (
    <section className={styles.transitionBridgeWrapper} aria-label="Founder message on healthcare equity">
      <div className={styles.bridgeContainer}>
        <div className={styles.editorialRule} aria-hidden="true" />

        <motion.div
          className={styles.bridgeContent}
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className={styles.bridgeEyebrow}>GRASSROOTS IMPACT ECOSYSTEM</span>

          <blockquote className={styles.bridgeQuote}>
            &ldquo;Healthcare is not a privilege for the few — it is a fundamental human right we deliver to India&rsquo;s most vulnerable doorsteps.&rdquo;
          </blockquote>

          <div className={styles.bridgeAuthor}>
            <span className={styles.authorName}>Dr. Devi Prasad Shetty</span>
            <span className={styles.authorTitle}>Founder &amp; Chairman, Narayana Health</span>
          </div>
        </motion.div>

        <div className={styles.editorialRule} aria-hidden="true" />
      </div>
    </section>
  );
}
