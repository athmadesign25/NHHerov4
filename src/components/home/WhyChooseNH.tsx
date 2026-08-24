"use client";

import React from "react";
import styles from "./WhyChooseNH.module.css";

export default function WhyChooseNH() {
  return (
    <section className={styles.section} id="WhyChooseNH_section">
      <div className={styles.container}>
        <img
          src="/WhyNH.png?v=3"
          alt="Why Choose Narayana Health"
          className={styles.fullImage}
        />
      </div>
    </section>
  );
}
