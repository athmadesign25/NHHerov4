"use client";

import React, { useState } from "react";
import { PhoneCall, CheckCircle2 } from "lucide-react";
import styles from "./RequestCallbackCTA.module.css";

export default function RequestCallbackCTA() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className={styles.successWrapper}>
        <CheckCircle2 size={32} className={styles.successIcon} />
        <h3 className={styles.successTitle}>Request Received</h3>
        <p className={styles.successText}>
          Our team will call you back within 15 minutes to assist with your booking.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.content}>
        <h3 className={styles.title}>Need help booking an appointment?</h3>
        <p className={styles.subtitle}>
          Leave your number and our support team will call you back to help you find the right slot.
        </p>
      </div>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <span className={styles.prefix}>+91</span>
          <input 
            type="tel" 
            className={styles.input} 
            placeholder="Enter mobile number" 
            pattern="[0-9]{10}"
            required 
          />
        </div>
        <button type="submit" className={styles.btn}>
          <PhoneCall size={16} />
          Request a Callback
        </button>
      </form>
    </div>
  );
}
