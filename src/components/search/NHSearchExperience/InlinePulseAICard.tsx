"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ChevronUp,
  Send,
  Paperclip,
  Mic,
  Stethoscope,
} from "lucide-react";
import styles from "./NHSearchExperience.module.css";

interface Message {
  id: string;
  sender: "ai" | "user";
  text: string;
  time: string;
}

interface InlinePulseAICardProps {
  pulseRecommendationText: string;
  query: string;
  selectedLocation: string;
  isExpanded: boolean;
  onToggleExpand: (expanded: boolean) => void;
}

export default function InlinePulseAICard({
  pulseRecommendationText,
  query,
  selectedLocation,
  isExpanded,
  onToggleExpand,
}: InlinePulseAICardProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize contextual welcome message when first expanded (matching Pulse AI tone)
  useEffect(() => {
    if (isExpanded && messages.length === 0) {
      const initialText = `I understand you are looking for **${query || "cardiologists"}** in **${selectedLocation}**. Based on your search, we have highlighted our top specialists above.\n\nWe suggest selecting one of the recommended cardiologists below for a direct booking, or let me know if you would like to specify symptoms.`;

      setMessages([
        {
          id: "welcome-msg",
          sender: "ai",
          text: initialText,
          time: "Just now",
        },
      ]);
    }
  }, [isExpanded, query, selectedLocation, messages.length]);

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

  // Generate realistic clinical response matching Pulse AI tone
  const generateClinicalResponse = (userPrompt: string): Message => {
    const qLower = userPrompt.toLowerCase();
    const timeStr = "Just now";

    if (qLower.includes("urgency") || qLower.includes("emergency") || qLower.includes("chest pain") || qLower.includes("heart attack")) {
      return {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: `If you have severe sudden chest pressure or difficulty breathing, please visit the nearest Narayana emergency room or call **1062** immediately.\n\nFor stable symptoms, you can book an appointment with our cardiologists above.`,
        time: timeStr,
      };
    }

    if (qLower.includes("test") || qLower.includes("ecg") || qLower.includes("echo") || qLower.includes("angiography")) {
      return {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: `Common cardiac assessments include a **12-lead ECG** and **2D Echocardiogram**. These can be scheduled along with your doctor visit at Narayana Health City.`,
        time: timeStr,
      };
    }

    if (qLower.includes("slot") || qLower.includes("today") || qLower.includes("doctor") || qLower.includes("appointment")) {
      return {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: `Consultation slots are open today with our senior cardiologists in Bangalore. You can tap **Book** on any doctor card above to reserve a time.`,
        time: timeStr,
      };
    }

    if (qLower.includes("video") || qLower.includes("online") || qLower.includes("teleconsult")) {
      return {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: `Online video consultations are available if you prefer consulting a specialist from home. Would you like to select a specialist?`,
        time: timeStr,
      };
    }

    if (qLower.includes("symptom") || qLower.includes("specify") || qLower.includes("feeling")) {
      return {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: `Please describe what you are feeling (e.g. chest discomfort, shortness of breath, palpitations), and I will guide you to the right test or specialist.`,
        time: timeStr,
      };
    }

    if (qLower.includes("second opinion") || qLower.includes("report")) {
      return {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: `You can share previous lab reports or discharge summaries by tapping the 📎 attachment icon for a second opinion from our medical board.`,
        time: timeStr,
      };
    }

    // Default intelligent clinical guidance
    return {
      id: `ai-${Date.now()}`,
      sender: "ai",
      text: `Based on your preferences, our specialists in **${selectedLocation}** are available. You can ask about symptoms, tests, or slot availability.`,
      time: timeStr,
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

    // Realistic AI thinking delay (500ms)
    setTimeout(() => {
      const aiResponse = generateClinicalResponse(promptText);
      setMessages((prev) => [...prev, aiResponse]);
      setIsThinking(false);
    }, 500);
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
              Tailored for <strong style={{ color: "#E2E8F0" }}>{query || "cardiologists"}</strong> in {selectedLocation}
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
                  : styles.pulseAiBubble
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
                            <strong key={pIdx} style={{ color: "#38BDF8" }}>
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
                Pulse AI is analyzing…
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
          onClick={() => handleSendMessage("Specify symptoms")}
        >
          <span>Specify symptoms</span>
        </button>
        <button
          type="button"
          className={styles.pulseQuickChip}
          onClick={() => handleSendMessage("Recommended heart tests")}
        >
          <span>Recommended heart tests</span>
        </button>
        <button
          type="button"
          className={styles.pulseQuickChip}
          onClick={() => handleSendMessage("Doctor slots today")}
        >
          <span>Doctor slots today</span>
        </button>
        <button
          type="button"
          className={styles.pulseQuickChip}
          onClick={() => handleSendMessage("Book video consultation")}
        >
          <span>Book video consultation</span>
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
              : "Ask Pulse AI or describe symptoms…"
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
    </motion.div>
  );
}
