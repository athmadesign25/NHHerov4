"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, X, ChevronDown } from "lucide-react";
import styles from "./AddPatientModal.module.css";
import Image from "next/image";
import { TextField } from "./TextField";
import { RadioGroup } from "./Radio";
import { Button } from "./Button";

interface AddPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPatient?: (name: string) => void;
}

export default function AddPatientModal({ isOpen, onClose, onAddPatient }: AddPatientModalProps) {
  const [mounted, setMounted] = useState(false);
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset modal state when it opens
  useEffect(() => {
    if (isOpen) {
      setFullName("");
    }
  }, [isOpen]);
  
  // Prevent body scroll when modal is open and pause background video
  useEffect(() => {
    const videos = document.querySelectorAll("video");
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      videos.forEach(v => v.pause());
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      videos.forEach(v => v.play().catch(err => console.log("Playback prevented:", err)));
    }
    
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      // Only force play on unmount if we were open
      if (isOpen) {
        document.querySelectorAll("video").forEach(v => v.play().catch(e => {}));
      }
    };
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onAddPatient) {
      onAddPatient(fullName || "New Patient");
    }
    onClose();
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div 
          data-lenis-prevent="true"
          style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px"
        }}>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.4)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
            }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={styles.modalContainer}
          >
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Add a Patient</h2>
              <button 
                onClick={onClose} 
                className={styles.closeButton}
                aria-label="Close modal"
                type="button"
              >
                <X size={18} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.infoBanner}>
                A one-time, non-refundable registration charge is included.
              </div>
              
              <form onSubmit={handleSubmit} className={styles.formGrid}>
                {/* Full Name */}
                <div className={styles.formGroup}>
                  <label className={styles.inputLabel}>Full Name*</label>
                  <TextField 
                    type="text" 
                    placeholder="Enter your full name" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
                
                {/* Date of Birth & Gender */}
                <div className={styles.formRow}>
                  <div className={`${styles.formGroup} ${styles.halfWidth}`}>
                    <label className={styles.inputLabel}>Date of Birth*</label>
                    <TextField 
                      type="text" 
                      placeholder="DD/MM/YYYY" 
                      required
                      onFocus={(e) => e.target.type = 'date'}
                      onBlur={(e) => {
                        if (!e.target.value) e.target.type = 'text';
                      }}
                      icon={<Calendar size={18} />}
                    />
                  </div>
                  
                  <div className={`${styles.formGroup} ${styles.halfWidth}`}>
                    <label className={styles.inputLabel}>Gender*</label>
                    <RadioGroup 
                      name="gender"
                      defaultValue="male"
                      required
                      options={[
                        { label: 'Male', value: 'male' },
                        { label: 'Female', value: 'female' },
                        { label: 'Others', value: 'others' }
                      ]}
                    />
                  </div>
                </div>
                
                {/* Mobile & Email */}
                <div className={styles.formRow}>
                  <div className={`${styles.formGroup} ${styles.halfWidth}`}>
                    <label className={styles.inputLabel}>Mobile Number*</label>
                    <div className={styles.phoneContainer}>
                      <div className={styles.countryCodeWrapper}>
                        <select className={styles.countrySelect} defaultValue="+91">
                          <option value="+91">🇮🇳 +91</option>
                          <option value="+880">🇧🇩 +880</option>
                        </select>
                        <div className={styles.chevronWrapper}>
                          <ChevronDown size={16} />
                        </div>
                      </div>
                      <input 
                        type="tel" 
                        className={styles.phoneInputField} 
                        placeholder="Enter your mobile number" 
                        maxLength={10} 
                        required 
                        pattern="[0-9]{10}"
                      />
                    </div>
                  </div>
                  
                  <div className={`${styles.formGroup} ${styles.halfWidth}`}>
                    <label className={styles.inputLabel}>Email ID</label>
                    <TextField type="email" placeholder="Enter your email" />
                  </div>
                </div>
                
                {/* Pincode */}
                <div className={styles.formRow}>
                  <div className={`${styles.formGroup} ${styles.halfWidth}`}>
                    <label className={styles.inputLabel}>Pincode*</label>
                    <TextField type="text" placeholder="Enter pincode" maxLength={6} required pattern="[0-9]{6}" />
                  </div>
                  <div className={styles.halfWidth}></div>
                </div>
                
                {/* Submit Button */}
                <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'center' }}>
                  <Button type="submit" size="md" style={{ minWidth: '200px' }}>
                    Add Patient
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
