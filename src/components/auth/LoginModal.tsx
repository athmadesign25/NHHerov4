"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown, Mail, Smartphone } from "lucide-react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [activeTab, setActiveTab] = useState<"mobile" | "email">("mobile");
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
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
            style={{
              position: "relative",
              zIndex: 10000,
              background: "var(--color-bg-card, #ffffff)",
              width: "100%",
              maxWidth: "440px",
              borderRadius: "24px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column"
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px", borderBottom: "1px solid var(--color-border)" }}>
              <h2 style={{ fontSize: "var(--font-size-xl, 20px)", fontWeight: 700, color: "var(--color-text, #0f172a)", margin: 0 }}>Login / Register</h2>
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
            <div style={{ padding: "32px 24px" }}>
              
              {/* Tabs */}
              <div style={{ display: "flex", background: "var(--color-bg-alt, #f8fafc)", borderRadius: "100px", padding: "4px", marginBottom: "24px" }}>
                <button
                  onClick={() => setActiveTab("mobile")}
                  style={{
                    position: "relative",
                    flex: 1,
                    padding: "10px",
                    borderRadius: "100px",
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
                      style={{ position: "absolute", inset: 0, background: "#ffffff", borderRadius: 100, boxShadow: "0 1px 3px rgba(0,0,0,0.1)", zIndex: 0 }}
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
                    padding: "10px",
                    borderRadius: "100px",
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
                      style={{ position: "absolute", inset: 0, background: "#ffffff", borderRadius: 100, boxShadow: "0 1px 3px rgba(0,0,0,0.1)", zIndex: 0 }}
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
                        <div style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--color-text-secondary, #475569)" }}>
                          <ChevronDown size={16} />
                        </div>
                      </div>
                      
                      {/* Phone Input */}
                      <input 
                        type="tel"
                        placeholder="Enter your mobile number"
                        style={{
                          flex: 1,
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

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
