"use client";

import React, { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./FloatingChatBot.module.css";

export default function FloatingChatBot() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className={styles.chatWindow}
          >
            <div
              style={{
                backgroundColor: "var(--color-primary, #034EA2)",
                color: "#fff",
                padding: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    backgroundColor: "rgba(255,255,255,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <MessageCircle size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600 }}>NH Assistant</h3>
                  <p style={{ margin: 0, fontSize: "12px", opacity: 0.8 }}>Online</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#fff",
                  cursor: "pointer",
                  padding: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "50%",
                  transition: "background-color 0.2s",
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)")}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                aria-label="Close Chat"
              >
                <X size={20} />
              </button>
            </div>
            
            <div style={{ flex: 1, backgroundColor: "#f8fafc", padding: "16px", display: "flex", flexDirection: "column", gap: "12px", overflowY: "auto" }}>
              <div style={{ alignSelf: "flex-start", backgroundColor: "#fff", padding: "12px 16px", borderRadius: "16px 16px 16px 0", maxWidth: "85%", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", fontSize: "14px", color: "#333", lineHeight: 1.5 }}>
                Hello! How can I help you today?
              </div>
            </div>
            
            <div style={{ padding: "16px", backgroundColor: "#fff", borderTop: "1px solid #eee", display: "flex", gap: "8px" }}>
              <input 
                type="text" 
                placeholder="Type your message..." 
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  borderRadius: "20px",
                  border: "1px solid #ddd",
                  fontSize: "14px",
                  outline: "none",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--color-primary, #034EA2)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#ddd")}
              />
              <button
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  backgroundColor: "var(--color-primary, #034EA2)",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
                aria-label="Send Message"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={styles.chatButton}
        aria-label="Toggle Chat Bot"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
              transition={{ duration: 0.15 }}
            >
              <X size={24} />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ opacity: 0, rotate: 90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: -90 }}
              transition={{ duration: 0.15 }}
            >
              <MessageCircle size={28} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  );
}
