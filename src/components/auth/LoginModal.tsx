"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown, Mail, Smartphone, ArrowLeft } from "lucide-react";
import styles from "./LoginModal.module.css";
import Image from "next/image";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: () => void;
}

export default function LoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
  const [activeTab, setActiveTab] = useState<"mobile" | "email">("mobile");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [mobileNumber, setMobileNumber] = useState("");
  const [mobileError, setMobileError] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [mounted, setMounted] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleContinue = () => {
    if (activeTab === "mobile") {
      if (mobileNumber.length !== 10) {
        setMobileError(true);
        return;
      }
      setStep("otp");
    }
  };

  const handleVerify = () => {
    if (isVerifying) return;
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      if (onLoginSuccess) onLoginSuccess();
      onClose();
    }, 1500);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value && !/^\d+$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    } else if (e.key === "Enter") {
      handleVerify();
    }
  };
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset modal state when it opens
  useEffect(() => {
    if (isOpen) {
      setStep("phone");
      setMobileNumber("");
      setMobileError(false);
      setOtp(["", "", "", "", "", ""]);
      setActiveTab("mobile");
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
            {/* Image Column */}
            <div className={styles.imageColumn}>
              <Image 
                src="/assets/doctor_team.png" 
                alt="Narayana Health" 
                fill 
                style={{ objectFit: "cover", objectPosition: "center" }}
                priority
              />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent)", zIndex: 1 }}></div>
              <div style={{ position: "absolute", bottom: "32px", left: "32px", right: "32px", zIndex: 2, color: "#ffffff" }}>
                <h3 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "8px" }}>World-Class Care, Close to Home.</h3>
                <p style={{ fontSize: "14px", opacity: 0.9, lineHeight: 1.5 }}>Join India&apos;s most trusted healthcare network and manage your health seamlessly.</p>
              </div>
            </div>
          <div className={styles.formColumn}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "24px" }}>
              <button 
                onClick={onClose}
                style={{ 
                  background: "var(--color-bg-alt, #f8fafc)", 
                  border: "none", 
                  width: "36px", 
                  height: "36px", 
                  borderRadius: "50%", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center", 
                  cursor: "pointer", 
                  color: "var(--color-text-secondary, #475569)",
                  transition: "background 0.2s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "#e2e8f0"}
                onMouseLeave={(e) => e.currentTarget.style.background = "var(--color-bg-alt, #f8fafc)"}
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: "0px 24px 32px 24px", height: "510px", display: "flex", flexDirection: "column" }}>
              <div style={{ flexShrink: 0, textAlign: "center", marginBottom: "24px" }}>
                <h2 style={{ fontSize: "var(--font-size-xl, 20px)", fontWeight: 700, color: "var(--color-text, #0f172a)", margin: "0 0 8px 0" }}>Login / Register</h2>
                <p style={{ fontSize: "var(--font-size-sm, 14px)", color: "var(--color-text-secondary, #475569)", margin: 0, lineHeight: 1.5 }}>
                  Sign in to manage appointments, access reports, and stay connected with your doctors.
                </p>
              </div>
              
              <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: step === "otp" ? "space-between" : "flex-start" }}>
              {step === "phone" ? (
                <>
              {/* Tabs */}
              <div style={{ display: "flex", background: "#F1F5F9", borderRadius: 24, padding: "4px", gap: "4px", marginBottom: "24px" }}>
                <button
                  onClick={() => setActiveTab("mobile")}
                  style={{
                    position: "relative",
                    flex: 1,
                    padding: "6px 16px",
                    borderRadius: "20px",
                    border: "none",
                    background: "transparent",
                    color: activeTab === "mobile" ? "var(--color-emergency)" : "var(--color-text-secondary)",
                    fontWeight: activeTab === "mobile" ? 600 : 500,
                    fontSize: "var(--font-size-sm, 14px)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    outline: "none"
                  }}
                >
                  {activeTab === "mobile" && (
                    <motion.div
                      layoutId="loginToggle"
                      style={{ position: "absolute", inset: 0, background: "#ffffff", borderRadius: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.1)", zIndex: 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: "8px" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                      <path d="M10.5 18.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                      <path fillRule="evenodd" d="M8.625.75A3.375 3.375 0 0 0 5.25 4.125v15.75a3.375 3.375 0 0 0 3.375 3.375h6.75a3.375 3.375 0 0 0 3.375-3.375V4.125A3.375 3.375 0 0 0 15.375.75h-6.75ZM7.5 4.125C7.5 3.504 8.004 3 8.625 3H9.75v.375c0 .621.504 1.125 1.125 1.125h2.25c.621 0 1.125-.504 1.125-1.125V3h1.125c.621 0 1.125.504 1.125 1.125v15.75c0 .621-.504 1.125-1.125 1.125h-6.75A1.125 1.125 0 0 1 7.5 19.875V4.125Z" clipRule="evenodd" />
                    </svg> Mobile
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab("email")}
                  style={{
                    position: "relative",
                    flex: 1,
                    padding: "6px 16px",
                    borderRadius: "20px",
                    border: "none",
                    background: "transparent",
                    color: activeTab === "email" ? "var(--color-emergency)" : "var(--color-text-secondary)",
                    fontWeight: activeTab === "email" ? 600 : 500,
                    fontSize: "var(--font-size-sm, 14px)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    outline: "none"
                  }}
                >
                  {activeTab === "email" && (
                    <motion.div
                      layoutId="loginToggle"
                      style={{ position: "absolute", inset: 0, background: "#ffffff", borderRadius: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.1)", zIndex: 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: "8px" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                      <path d="M1.5 8.67v8.58a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V8.67l-8.928 5.493a3 3 0 0 1-3.144 0L1.5 8.67Z" />
                      <path d="M22.5 6.908V6.75a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3v.158l9.714 5.978a1.5 1.5 0 0 0 1.572 0L22.5 6.908Z" />
                    </svg> Email
                  </span>
                </button>
              </div>

              {/* Form Fields */}
              <div style={{ marginBottom: "24px" }}>
                {activeTab === "mobile" ? (
                  <div>
                    <label style={{ display: "block", fontSize: "var(--font-size-sm, 14px)", fontWeight: 600, color: "var(--color-text, #0f172a)", marginBottom: "8px" }}>Mobile Number</label>
                    <div style={{ display: "flex", gap: "12px" }}>
                      {/* Country Code */}
                      <div style={{ position: "relative", width: "100px", flexShrink: 0 }}>
                        <select
                          style={{
                            width: "100%",
                            padding: "14px 32px 14px 16px",
                            borderRadius: "100px",
                            border: "1.5px solid var(--color-border, #e2e8f0)",
                            background: "#ffffff",
                            fontSize: "var(--font-size-base, 16px)",
                            color: "var(--color-text, #0f172a)",
                            fontWeight: 500,
                            appearance: "none",
                            outline: "none",
                            cursor: "pointer"
                          }}
                          defaultValue="+91"
                        >
                          <option value="+91">🇮🇳 +91</option>
                          <option value="+880">🇧🇩 +880</option>
                        </select>
                        <div style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--color-text-secondary, #475569)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <ChevronDown size={16} />
                        </div>
                      </div>
                      
                      {/* Phone Input */}
                      <input 
                        type="tel"
                        maxLength={10}
                        placeholder="Enter your mobile number"
                        value={mobileNumber}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').substring(0, 10);
                          setMobileNumber(val);
                          setMobileError(false);
                        }}
                        style={{
                          flex: 1,
                          padding: "14px 16px",
                          borderRadius: "100px",
                          border: `1.5px solid ${mobileError ? "var(--color-emergency)" : "var(--color-border, #e2e8f0)"}`,
                          background: "#ffffff",
                          fontSize: "var(--font-size-base, 16px)",
                          color: "var(--color-text, #0f172a)",
                          outline: "none"
                        }}
                        onFocus={(e) => e.target.style.borderColor = mobileError ? "var(--color-emergency)" : "var(--color-primary)"}
                        onBlur={(e) => e.target.style.borderColor = mobileError ? "var(--color-emergency)" : "var(--color-border)"}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleContinue();
                          }
                        }}
                      />
                    </div>
                    {mobileError && (
                      <div style={{ color: "var(--color-emergency)", fontSize: "12px", fontWeight: 500, marginTop: "8px", marginLeft: "108px" }}>
                        Please enter a valid 10-digit mobile number.
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <label style={{ display: "block", fontSize: "var(--font-size-sm, 14px)", fontWeight: 600, color: "var(--color-text, #0f172a)", marginBottom: "8px" }}>Email ID</label>
                    <input 
                      type="email"
                      placeholder="Enter your email address"
                      style={{
                        width: "100%",
                        padding: "14px 16px",
                        borderRadius: "100px",
                        border: "1.5px solid var(--color-border, #e2e8f0)",
                        background: "#ffffff",
                        fontSize: "var(--font-size-base, 16px)",
                        color: "var(--color-text, #0f172a)",
                        outline: "none"
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Continue Button */}
              <button 
                onClick={handleContinue}
                style={{
                  width: "100%",
                  padding: "14px",
                  background: "var(--color-primary, #034ea2)",
                  color: "#ffffff",
                  fontSize: "var(--font-size-base, 16px)",
                  fontWeight: 700,
                  borderRadius: "100px",
                  border: "none",
                  cursor: "pointer",
                  transition: "background 0.2s"
                }}
              >
                Get OTP
              </button>

              {/* Divider */}
              <div style={{ display: "flex", alignItems: "center", margin: "24px 0" }}>
                <div style={{ flex: 1, height: "1px", background: "var(--color-border, #e2e8f0)" }} />
                <span style={{ padding: "0 16px", fontSize: "12px", color: "var(--color-text-secondary, #475569)", fontWeight: 500, textTransform: "uppercase" }}>OR</span>
                <div style={{ flex: 1, height: "1px", background: "var(--color-border, #e2e8f0)" }} />
              </div>

              {/* Google Button */}
              <button
                style={{
                  width: "100%",
                  padding: "14px",
                  background: "#ffffff",
                  border: "1.5px solid var(--color-border, #e2e8f0)",
                  borderRadius: "100px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "12px",
                  cursor: "pointer",
                  fontSize: "var(--font-size-base, 16px)",
                  fontWeight: 600,
                  color: "var(--color-text, #0f172a)",
                  transition: "background 0.2s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "var(--color-bg-alt, #f8fafc)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "#ffffff"}
              >
                <img 
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
                  alt="Google" 
                  style={{ width: "20px", height: "20px" }}
                />
                Sign in with Google
              </button>
              
              <p style={{ marginTop: "24px", fontSize: "12px", color: "var(--color-text-muted, #94a3b8)", textAlign: "center", lineHeight: 1.5 }}>
                By continuing, you agree to our <a href="#" style={{ color: "var(--color-primary)", textDecoration: "none" }}>Terms of Service</a> and <a href="#" style={{ color: "var(--color-primary)", textDecoration: "none" }}>Privacy Policy</a>.
              </p>
                </>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "24px", animation: "fadeIn 0.3s ease-in-out", height: "100%", justifyContent: "space-between" }}>
                  <div style={{ marginTop: "32px" }}>
                    <label style={{ display: "block", fontSize: "var(--font-size-sm, 14px)", fontWeight: 500, color: "var(--color-text-secondary, #475569)", marginBottom: "8px", textAlign: "center" }}>
                      Enter the 6-digit OTP sent to <br/>
                      <span style={{ fontWeight: 700, color: "var(--color-text, #0f172a)" }}>{mobileNumber}</span>
                      <button onClick={() => setStep("phone")} style={{ background: "none", border: "none", color: "var(--color-primary)", fontSize: "12px", fontWeight: 600, cursor: "pointer", marginLeft: "8px", textDecoration: "underline" }}>Edit</button>
                    </label>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginTop: "16px" }}>
                      {[0, 1, 2, 3, 4, 5].map((i) => (
                        <input
                          key={i}
                          ref={(el) => { otpRefs.current[i] = el; }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={otp[i]}
                          onChange={(e) => handleOtpChange(i, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(i, e)}
                          style={{
                            width: "48px",
                            height: "56px",
                            textAlign: "center",
                            fontSize: "24px",
                            fontWeight: 600,
                            borderRadius: "12px",
                            border: "1.5px solid var(--color-border, #e2e8f0)",
                            background: "#ffffff",
                            color: "var(--color-text, #0f172a)",
                            outline: "none"
                          }}
                          onFocus={(e) => e.target.style.borderColor = "var(--color-primary)"}
                          onBlur={(e) => e.target.style.borderColor = "var(--color-border)"}
                        />
                      ))}
                    </div>
                  </div>
                  <button 
                    onClick={handleVerify}
                    disabled={isVerifying || otp.join("").length !== 6}
                    style={{
                      width: "100%",
                      padding: "14px",
                      background: "var(--color-primary, #034ea2)",
                      opacity: (isVerifying || otp.join("").length !== 6) ? 0.5 : 1,
                      color: "#ffffff",
                      fontSize: "var(--font-size-base, 16px)",
                      fontWeight: 700,
                      borderRadius: "100px",
                      border: "none",
                      cursor: isVerifying ? "progress" : (otp.join("").length !== 6 ? "not-allowed" : "pointer"),
                      transition: "background 0.2s, opacity 0.2s",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: "8px"
                    }}
                  >
                    {isVerifying ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                          style={{ width: 18, height: 18, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%" }}
                        />
                        Verifying...
                      </>
                    ) : (
                      "Verify & Proceed"
                    )}
                  </button>
                </div>
              )}
              </div>

            </div>
            </div>
            
            </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
