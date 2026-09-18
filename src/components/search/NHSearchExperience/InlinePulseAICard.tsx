"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ChevronUp,
  Send,
  Paperclip,
  Mic,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  Stethoscope,
  Clock,
  FileText,
  Volume2,
} from "lucide-react";
import styles from "./NHSearchExperience.module.css";

interface Message {
  id: string;
  sender: "ai" | "user";
  text: string;
  time: string;
  isUrgent?: boolean;
  actionButtons?: Array<{ label: string; action: string }>;
}

interface InlinePulseAICardProps {
  pulseRecommendationText: string;
  query: string;
  selectedLocation: string;
  isExpanded: boolean;
  onToggleExpand: (expanded: boolean) => void;
  onBookDoctor?: (doctorName?: string) => void;
}

export default function InlinePulseAICard({
  pulseRecommendationText,
  query,
  selectedLocation,
  isExpanded,
  onToggleExpand,
  onBookDoctor,
}: InlinePulseAICardProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isCardiac = /chest|pain|heart|cardio|breath|palpitation|attack/i.test(query || "");

  // Initialize contextual welcome message when first expanded
  useEffect(() => {
    if (isExpanded && messages.length === 0) {
      const initialText = isCardiac
        ? `Hello, I'm Pulse AI. I noticed you searched for **"${query || "cardiologist near me"}"** in **${selectedLocation}**.\n\n⚠️ **Urgent Assessment**: If you are experiencing sudden severe crushing chest pain radiating to your left arm or jaw, please visit our nearest emergency room immediately or call **1062**.\n\nOtherwise, ask any clinical question or describe your symptoms below for personalized specialist guidance.`
        : `Hello, I'm Pulse AI. Based on your search for **"${query || "specialists"}"** in **${selectedLocation}**, our top specialists are listed above.\n\nDescribe any specific symptoms, diagnostic tests, or clinical questions below for tailored recommendations.`;

      setMessages([
        {
          id: "welcome-msg",
          sender: "ai",
          text: initialText,
          time: "Just now",
          isUrgent: isCardiac,
          actionButtons: isCardiac
            ? [
                { label: "Book Senior Cardiologist", action: "book" },
                { label: "Check Chest Pain Urgency", action: "triage" },
              ]
            : [{ label: "Book Consultation", action: "book" }],
        },
      ]);
    }
  }, [isExpanded, query, selectedLocation, isCardiac, messages.length]);

  // Scroll to bottom of message thread
  useEffect(() => {
    if (isExpanded) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isThinking, isExpanded]);

  // Focus input when opened
  useEffect(() => {
    if (isExpanded) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [isExpanded]);

  // Generate realistic clinical response
  const generateClinicalResponse = (userPrompt: string): Message => {
    const qLower = userPrompt.toLowerCase();
    const timeStr = "Just now";

    if (qLower.includes("urgency") || qLower.includes("emergency") || qLower.includes("chest pain") || qLower.includes("heart attack")) {
      return {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: `**Clinical Urgency Triage Protocol**:\n\n• **Immediate Emergency (Call 1062)**: Pressure/tightness in central chest > 10 mins, cold sweating, nausea, pain spreading to left shoulder or neck.\n• **Urgent Cardiology Visit**: Discomfort with physical exertion, shortness of breath on climbing stairs, irregular fluttering heartbeats.\n• **Specialist recommendation**: Dr. Devi Prasad Shetty & Dr. Bagirath Raghuraman at Narayana Health City have consultations available today.`,
        time: timeStr,
        isUrgent: true,
        actionButtons: [
          { label: "Book Dr. Devi Prasad Shetty", action: "book-shetty" },
          { label: "Call Emergency (1062)", action: "call-1062" },
        ],
      };
    }

    if (qLower.includes("test") || qLower.includes("ecg") || qLower.includes("echo") || qLower.includes("angiography")) {
      return {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: `**Recommended Diagnostic Tests for ${query || "Cardiac Care"}**:\n\n1. **12-Lead Electrocardiogram (ECG)**: Detects immediate electrical disturbances and ischemia (10 mins).\n2. **2D Echocardiography**: High-resolution ultrasound assessing heart valve & pumping efficiency.\n3. **Cardiac Biomarkers (Troponin-T)**: Rapid blood marker for acute cardiac muscle strain.\n\nAll diagnostics can be booked alongside your specialist consultation in Bangalore with zero wait time.`,
        time: timeStr,
        actionButtons: [
          { label: "Book ECG + Consultation", action: "book" },
          { label: "View Diagnostic Packages", action: "packages" },
        ],
      };
    }

    if (qLower.includes("slot") || qLower.includes("today") || qLower.includes("doctor") || qLower.includes("appointment")) {
      return {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: `**Available Specialist Slots Today in Bangalore**:\n\n• **Dr. Devi Prasad Shetty** (Cardiology) — Slots from 4:30 PM (Narayana Health City)\n• **Dr. Bagirath Raghuraman** (Cardiology) — Slots from 2:15 PM\n• **Dr. Ananya Rao** (Cardiology) — Slots from 5:00 PM\n\nYou can click "Book" on any doctor card above or choose a specialist here.`,
        time: timeStr,
        actionButtons: [{ label: "Reserve Today's Slot", action: "book" }],
      };
    }

    if (qLower.includes("second opinion") || qLower.includes("report")) {
      return {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: `**Narayana Health Expert Second Opinion**:\n\nOur senior medical review board provides detailed evaluation of angiograms, ECGs, and surgical recommendations within 24 hours. Click the 📎 clip icon below to attach your digital medical records.`,
        time: timeStr,
        actionButtons: [{ label: "Attach Reports", action: "attach" }],
      };
    }

    // Default intelligent clinical guidance
    return {
      id: `ai-${Date.now()}`,
      sender: "ai",
      text: `Based on your question about **"${userPrompt}"**, our clinical guidelines in **${selectedLocation}** advise an in-person or video consultation with a registered specialist. Would you like to check available slots, compare specialist credentials, or describe other symptoms?`,
      time: timeStr,
      actionButtons: [
        { label: "Check Available Slots", action: "book" },
        { label: "Ask Another Question", action: "continue" },
      ],
    };
  };

  const handleSendMessage = (textToSend?: string) => {
    const promptText = (textToSend || inputValue).trim();
    if (!promptText || isThinking) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: promptText,
      time: "Just now",
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsThinking(true);

    // Realistic AI thinking delay (550ms)
    setTimeout(() => {
      const aiResponse = generateClinicalResponse(promptText);
      setMessages((prev) => [...prev, aiResponse]);
      setIsThinking(false);
    }, 550);
  };

  const handleActionClick = (action: string) => {
    if (action === "call-1062") {
      window.location.href = "tel:1062";
    } else if (action === "attach") {
      setUploadNotice("Report attachment ready: Click paperclip to upload PDF/JPG");
      setTimeout(() => setUploadNotice(null), 4000);
    } else if (action === "triage") {
      handleSendMessage("How urgent is chest pain?");
    } else {
      onBookDoctor?.();
    }
  };

  const handleAttachClick = () => {
    setUploadNotice("📁 Medical report attachment: PDF, JPG, DICOM supported");
    setTimeout(() => setUploadNotice(null), 3500);
  };

  const handleMicClick = () => {
    setIsListening(true);
    setInputValue("I have chest tightness and need advice");
    setTimeout(() => {
      setIsListening(false);
    }, 1200);
  };

  // ─────────────────────────────────────────────────────────────
  // 1. COLLAPSED COMPACT NUDGE CARD
  // ─────────────────────────────────────────────────────────────
  if (!isExpanded) {
    return (
      <div
        className={styles.pulseNudgeBox}
        onClick={() => onToggleExpand(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onToggleExpand(true);
        }}
        aria-label="Ask Pulse AI for personalised recommendations and clinical guidance"
      >
        <div className={styles.pulseNudgeLeft}>
          <div className={styles.pulseNudgeIconWrap} aria-hidden>
            <div className={styles.pulseBars}>
              <span className={styles.pulseBar1} />
              <span className={styles.pulseBar2} />
              <span className={styles.pulseBar3} />
            </div>
          </div>
          <div className={styles.pulseNudgeTextWrap}>
            <div className={styles.pulseNudgeTitleRow}>
              <span className={styles.pulseNudgeText}>{pulseRecommendationText}</span>
              <span className={styles.pulseNudgeBadge}>Pulse AI</span>
            </div>
            <div className={styles.pulseNudgeSubtext}>
              Ask clinical questions, describe symptoms, or get tailored specialist recommendations.
            </div>
          </div>
        </div>

        <div className={styles.pulseNudgeAction}>
          <button
            type="button"
            className={styles.pulseNudgeBtn}
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand(true);
            }}
          >
            <span>Ask Pulse</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 2. EXPANDED INLINE PULSE AI WORKSPACE CARD
  // ─────────────────────────────────────────────────────────────
  return (
    <motion.div
      layout
      className={styles.pulseExpandedCard}
      initial={{ opacity: 0, y: 8, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.99 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Header Row */}
      <div className={styles.pulseExpandedHeader}>
        <div className={styles.pulseExpandedHeaderLeft}>
          <div className={styles.pulseNudgeIconWrap} aria-hidden>
            <div className={styles.pulseBars}>
              <span className={styles.pulseBar1} />
              <span className={styles.pulseBar2} />
              <span className={styles.pulseBar3} />
            </div>
          </div>
          <div>
            <div className={styles.pulseExpandedTitleRow}>
              <h3 className={styles.pulseExpandedTitle}>Pulse AI Clinical Assistant</h3>
              <span className={styles.pulseExpandedLiveBadge}>
                <span className={styles.pulseExpandedLiveDot} />
                LIVE
              </span>
            </div>
            <p className={styles.pulseExpandedSubtitle}>
              Tailored for <strong style={{ color: "#E2E8F0" }}>{query || "Cardiac Care"}</strong> in {selectedLocation}
            </p>
          </div>
        </div>

        <button
          type="button"
          className={styles.pulseExpandedMinimizeBtn}
          onClick={() => onToggleExpand(false)}
          title="Minimize Pulse AI assistant"
          aria-label="Minimize Pulse AI assistant"
        >
          <span>Minimize</span>
          <ChevronUp size={14} />
        </button>
      </div>

      {uploadNotice && (
        <div className={styles.pulseUploadToast}>
          <span>{uploadNotice}</span>
        </div>
      )}

      {/* Messages Stream */}
      <div className={styles.pulseMessagesStream}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={
              msg.sender === "user"
                ? styles.pulseUserMessageRow
                : styles.pulseAiMessageRow
            }
          >
            {msg.sender === "ai" && (
              <div className={styles.pulseAiAvatar} aria-hidden>
                <Stethoscope size={13} color="#00C4FF" />
              </div>
            )}

            <div
              className={
                msg.sender === "user"
                  ? styles.pulseUserBubble
                  : `${styles.pulseAiBubble} ${msg.isUrgent ? styles.pulseAiBubbleUrgent : ""}`
              }
            >
              <div className={styles.pulseBubbleText}>
                {msg.text.split("\n").map((line, idx) => {
                  if (!line.trim()) return <div key={idx} style={{ height: 6 }} />;
                  // Bold markdown renderer
                  const parts = line.split(/(\*\*.*?\*\*)/g);
                  return (
                    <p key={idx} style={{ margin: "2px 0" }}>
                      {parts.map((p, pIdx) => {
                        if (p.startsWith("**") && p.endsWith("**")) {
                          return (
                            <strong key={pIdx} style={{ color: msg.isUrgent ? "#FCA5A5" : "#38BDF8" }}>
                              {p.slice(2, -2)}
                            </strong>
                          );
                        }
                        return p;
                      })}
                    </p>
                  );
                })}
              </div>

              {msg.actionButtons && msg.actionButtons.length > 0 && (
                <div className={styles.pulseBubbleActions}>
                  {msg.actionButtons.map((btn, bIdx) => (
                    <button
                      key={bIdx}
                      type="button"
                      className={
                        btn.action.includes("1062")
                          ? styles.pulseEmergencyActionBtn
                          : styles.pulseContextActionBtn
                      }
                      onClick={() => handleActionClick(btn.action)}
                    >
                      <span>{btn.label}</span>
                      <ArrowRight size={11} />
                    </button>
                  ))}
                </div>
              )}

              <span className={styles.pulseBubbleTime}>{msg.time}</span>
            </div>
          </div>
        ))}

        {isThinking && (
          <div className={styles.pulseAiMessageRow}>
            <div className={styles.pulseAiAvatar} aria-hidden>
              <Stethoscope size={13} color="#00C4FF" />
            </div>
            <div className={styles.pulseThinkingBubble}>
              <span className={styles.pulseThinkingDot} />
              <span className={styles.pulseThinkingDot} />
              <span className={styles.pulseThinkingDot} />
              <span style={{ fontSize: 11.5, color: "#94A3B8", marginLeft: 6 }}>
                Pulse AI is analyzing clinical data…
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div className={styles.pulseQuickChipsRow}>
        <button
          type="button"
          className={styles.pulseQuickChip}
          onClick={() => handleSendMessage("How urgent is my symptom?")}
        >
          <span>⚡ Check symptom urgency</span>
        </button>
        <button
          type="button"
          className={styles.pulseQuickChip}
          onClick={() => handleSendMessage("Which heart tests do I need?")}
        >
          <span>⚡ Recommended heart tests</span>
        </button>
        <button
          type="button"
          className={styles.pulseQuickChip}
          onClick={() => handleSendMessage("Which doctors have slots today?")}
        >
          <span>⚡ Doctor slots today</span>
        </button>
        <button
          type="button"
          className={styles.pulseQuickChip}
          onClick={() => handleSendMessage("How do I get a second opinion?")}
        >
          <span>⚡ Second opinion</span>
        </button>
      </div>

      {/* Interactive Input Composer */}
      <form
        className={styles.pulseComposerForm}
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
      >
        <button
          type="button"
          className={styles.pulseComposerAttachBtn}
          title="Attach ECG, Blood Report or Prescriptions"
          onClick={handleAttachClick}
          aria-label="Attach medical records"
        >
          <Paperclip size={15} />
        </button>

        <input
          ref={inputRef}
          type="text"
          className={styles.pulseComposerInput}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={
            isListening
              ? "Listening to voice prompt…"
              : "Describe your symptoms or ask a clinical question…"
          }
          aria-label="Ask Pulse AI"
        />

        <button
          type="button"
          className={`${styles.pulseComposerMicBtn} ${isListening ? styles.pulseComposerMicActive : ""}`}
          title="Voice prompt"
          onClick={handleMicClick}
          aria-label="Voice prompt"
        >
          <Mic size={15} />
        </button>

        <button
          type="submit"
          disabled={!inputValue.trim() || isThinking}
          className={styles.pulseComposerSendBtn}
          title="Send prompt to Pulse AI"
          aria-label="Send prompt"
        >
          <Send size={13} />
        </button>
      </form>

      {/* Trust & Clinical Disclaimer */}
      <div className={styles.pulseDisclaimerRow}>
        <span>
          Pulse AI provides certified clinical decision support. For life-threatening emergencies, call Narayana Emergency <strong>1062</strong> immediately.
        </span>
      </div>
    </motion.div>
  );
}
