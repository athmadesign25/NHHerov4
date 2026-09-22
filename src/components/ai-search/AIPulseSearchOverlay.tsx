"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, X, Mic, ArrowUp, Stethoscope, Heart, Brain, 
  Activity, Sparkles, Calendar, Loader2, MapPin, Clock, Star
} from "lucide-react";
import styles from "./AIPulseSearchOverlay.module.css";
import { searchHealthcare } from "../../lib/searchService";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  type?: "text" | "doctor-results" | "symptom-analysis";
  doctorResults?: DoctorCard[];
  analysisResult?: SymptomAnalysis;
  timestamp: number;
}

interface DoctorCard {
  id: string;
  name: string;
  speciality: string;
  hospital: string;
  city: string;
  experience: string;
  rating: number;
  available: string;
  fee: string;
  img: string;
}

interface SymptomAnalysis {
  detectedSymptoms: string[];
  possibleConditions: string[];
  recommendedSpeciality: string;
  urgencyLevel: "routine" | "soon" | "urgent";
  insight: string;
}

const mockDoctors: DoctorCard[] = [
  { id: "d1", name: "Dr. Rajiv Menon", speciality: "Cardiology", hospital: "NH Bangalore", city: "Bangalore", experience: "22 Years", rating: 4.9, available: "Available Today", fee: "₹1,500", img: "/assets/doctor_1.png" },
  { id: "d2", name: "Dr. Priya Sharma", speciality: "Neurology", hospital: "NH Kolkata", city: "Kolkata", experience: "15 Years", rating: 4.8, available: "Tomorrow", fee: "₹1,200", img: "/assets/doctor_2.png" },
  { id: "d3", name: "Dr. Arun Krishnan", speciality: "Oncology", hospital: "NH Bangalore", city: "Bangalore", experience: "28 Years", rating: 4.9, available: "Available Today", fee: "₹2,000", img: "/assets/doctor_3.png" },
  { id: "d4", name: "Dr. Shalini Singh", speciality: "General Medicine", hospital: "NH Mumbai", city: "Mumbai", experience: "14 Years", rating: 4.9, available: "Available Today", fee: "₹900", img: "/assets/hero_doctor.png" },
];

const symptomDB: Record<string, SymptomAnalysis> = {
  fever: { detectedSymptoms: ["Fever", "Possible inflammation"], possibleConditions: ["Viral infection", "Flu / Influenza", "Bacterial infection"], recommendedSpeciality: "General Medicine", urgencyLevel: "soon", insight: "Fever is often a sign of infection. Most cases resolve with rest and hydration, but persistent high fever (>103°F) needs prompt attention." },
  heart: { detectedSymptoms: ["Chest discomfort", "Cardiovascular concern"], possibleConditions: ["Angina", "Arrhythmia", "Hypertension"], recommendedSpeciality: "Cardiology", urgencyLevel: "urgent", insight: "Heart-related symptoms should always be evaluated by a Cardiologist. If you're experiencing severe chest pain, please seek emergency care immediately." },
  headache: { detectedSymptoms: ["Headache", "Head pain"], possibleConditions: ["Tension headache", "Migraine", "Cluster headache"], recommendedSpeciality: "Neurology", urgencyLevel: "routine", insight: "Most headaches are benign, but recurring or severe headaches with vision changes may indicate a neurological issue worth evaluating." },
  stomach: { detectedSymptoms: ["Stomach discomfort", "Abdominal discomfort"], possibleConditions: ["Acidity / Indigestion", "Gastroenteritis", "Irritable bowel syndrome (IBS)"], recommendedSpeciality: "Gastroenterology", urgencyLevel: "routine", insight: "Stomach pain and acidity can be managed with dietary adjustments, but recurring discomfort should be evaluated by a Gastroenterologist." },
  default: { detectedSymptoms: ["Health concern identified"], possibleConditions: ["Requires further evaluation"], recommendedSpeciality: "General Medicine", urgencyLevel: "routine", insight: "Based on your description, I recommend consulting a specialist for a thorough assessment. Narayana Health has experts across all specialties." }
};

const simulateAIResponse = (query: string): Omit<Message, "id" | "timestamp"> => {
  const q = query.toLowerCase();
  const isDocSearch = /doctor|specialist|find|who|appointment|book|consult/i.test(q);
  const isSymptom = /fever|pain|cough|headache|chest|stomach|heart|back|joint|tired|weak/i.test(q);

  if (isDocSearch) {
    const specialty = /cardio|heart/i.test(q) ? "Cardiology" : /neuro|brain|headache/i.test(q) ? "Neurology" : "General Medicine";
    const filtered = mockDoctors.filter(d => d.speciality === specialty || specialty === "General Medicine").slice(0, 3);
    return { role: "assistant", content: `I found **${filtered.length} specialists** that match your needs. Here are the top-rated doctors at Narayana Health:`, type: "doctor-results", doctorResults: filtered };
  }

  if (isSymptom) {
    const key = /fever/.test(q) ? "fever" : /heart|chest/.test(q) ? "heart" : /head/.test(q) ? "headache" : /stomach|acid/.test(q) ? "stomach" : "default";
    const analysis = symptomDB[key];
    const matched = mockDoctors.filter(d => d.speciality === analysis.recommendedSpeciality || d.speciality === "General Medicine").slice(0, 2);
    return { role: "assistant", content: analysis.insight, type: "symptom-analysis", analysisResult: analysis, doctorResults: matched };
  }

  return { role: "assistant", content: `I understand you're looking for help with: *"${query}"*\n\nI can help you find the right doctor, understand your symptoms, or book an appointment. Could you share more about what you're experiencing?`, type: "text" };
};

const FEATURE_CHIPS = [
  { icon: <Stethoscope size={14} style={{ color: "#3b82f6" }} />, label: "Find the right doctor", query: "Help me find the right doctor for my condition" },
  { icon: <Heart size={14} style={{ color: "#ef4444" }} />, label: "Know your health", query: "Tell me about staying healthy and what checkups I need" },
  { icon: <Calendar size={14} style={{ color: "#3b82f6" }} />, label: "Book appointment", query: "I want to book an appointment with a specialist" },
];

const SUGGESTION_CHIPS = [
  { icon: <Activity size={14} style={{ color: "#ef4444" }} />, label: "I have chest pain", query: "I have chest pain and shortness of breath" },
  { icon: <Brain size={14} style={{ color: "#3b82f6" }} />, label: "Frequent headaches", query: "I get frequent headaches and migraines" },
  { icon: <Sparkles size={14} style={{ color: "#f59e0b" }} />, label: "I have fever", query: "I have high fever and body ache" },
  { icon: <Activity size={14} style={{ color: "#10b981" }} />, label: "Stomach pain", query: "I have stomach pain and acidity" },
];

const UrgencyBadge = ({ level }: { level: "routine" | "soon" | "urgent" }) => {
  const config = { routine: { label: "Routine Care", color: "#10b981", bg: "#ecfdf5" }, soon: { label: "See Soon", color: "#f59e0b", bg: "#fffbeb" }, urgent: { label: "Urgent", color: "#ef4444", bg: "#fef2f2" } };
  const c = config[level];
  return <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.05em", color: c.color, background: c.bg, border: `1px solid ${c.color}30`, padding: "2px 8px", borderRadius: 20, textTransform: "uppercase" }}>{c.label}</span>;
};

const DoctorResultCard = ({ doc }: { doc: DoctorCard }) => (
  <div className={styles.doctorCard}>
    <div className={styles.doctorCardLeft}>
      <div className={styles.doctorAvatar}>
        <img src={doc.img} alt={doc.name} onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0"; }} />
      </div>
      <div className={styles.doctorInfo}>
        <div className={styles.doctorName}>{doc.name}</div>
        <div className={styles.doctorSpec}>{doc.speciality}</div>
        <div className={styles.doctorMeta}><span><MapPin size={11} /> {doc.hospital}</span><span><Clock size={11} /> {doc.available}</span></div>
        <div className={styles.doctorRating}><Star size={11} fill="#f59e0b" color="#f59e0b" /><span>{doc.rating}</span><span className={styles.doctorExp}>{doc.experience}</span></div>
      </div>
    </div>
    <div className={styles.doctorCardRight}>
      <div className={styles.doctorFeeInfo}>
        <div className={styles.doctorFee}>{doc.fee}</div>
        <div className={styles.doctorFeeLabel}>Consultation</div>
      </div>
      <button className={styles.bookBtn}>Book Now</button>
    </div>
  </div>
);

const SymptomAnalysisCard = ({ analysis }: { analysis: SymptomAnalysis }) => (
  <div className={styles.analysisCard}>
    <div className={styles.analysisHeader}><Activity size={16} /><span>Pulse AI Health Analysis</span><UrgencyBadge level={analysis.urgencyLevel} /></div>
    <div className={styles.analysisGrid}>
      <div className={styles.analysisSection}><div className={styles.analysisSectionTitle}>Detected Symptoms</div>{analysis.detectedSymptoms.map((s, i) => <div key={i} className={styles.symptomPill}>{s}</div>)}</div>
      <div className={styles.analysisSection}><div className={styles.analysisSectionTitle}>Possible Conditions</div>{analysis.possibleConditions.map((c, i) => <div key={i} className={styles.conditionItem}>• {c}</div>)}</div>
    </div>
    <div className={styles.analysisRecommendation}><Stethoscope size={13} /><span>Recommended: <strong>{analysis.recommendedSpeciality}</strong></span></div>
  </div>
);

const MessageBubble = ({ msg }: { msg: Message }) => {
  if (msg.role === "user") {
    return <motion.div initial={{ opacity: 0, y: 12, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} className={styles.userMessage}>{msg.content}</motion.div>;
  }

  const formatContent = (text: string) => text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("*") && part.endsWith("*")) return <em key={i}>{part.slice(1, -1)}</em>;
    return part.split("\n").map((line, j, arr) => <React.Fragment key={j}>{line}{j < arr.length - 1 && <br />}</React.Fragment>);
  });

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className={styles.assistantMessage}>
      <div className={styles.assistantIcon}><Sparkles size={14} /></div>
      <div className={styles.assistantContent}>
        <div className={styles.assistantText}>{formatContent(msg.content)}</div>
        {msg.type === "symptom-analysis" && msg.analysisResult && <SymptomAnalysisCard analysis={msg.analysisResult} />}
        {msg.doctorResults && msg.doctorResults.length > 0 && <div className={styles.doctorResults}>{msg.doctorResults.map(doc => <DoctorResultCard key={doc.id} doc={doc} />)}</div>}
      </div>
    </motion.div>
  );
};

const TypingIndicator = () => (
  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={styles.assistantMessage}>
    <div className={styles.assistantIcon}><Sparkles size={14} /></div>
    <div className={styles.typingDots}><span /><span /><span /></div>
  </motion.div>
);

interface AIPulseSearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

export default function AIPulseSearchOverlay({ isOpen, onClose, initialQuery = "" }: AIPulseSearchOverlayProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState(initialQuery);
  const [isTyping, setIsTyping] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("isLoggedIn");
      setIsUserLoggedIn(stored !== "false");
    }
    const handleLoginChange = () => {
      const stored = sessionStorage.getItem("isLoggedIn");
      setIsUserLoggedIn(stored !== "false");
    };
    window.addEventListener("login-state-changed", handleLoginChange);
    return () => window.removeEventListener("login-state-changed", handleLoginChange);
  }, []);

  const handleLoginToggle = () => {
    if (typeof window !== "undefined") {
      const current = sessionStorage.getItem("isLoggedIn") !== "false";
      sessionStorage.setItem("isLoggedIn", current ? "false" : "true");
      setIsUserLoggedIn(!current);
      window.dispatchEvent(new Event("login-state-changed"));
    }
  };

  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const placeholders = [
    "Ask Pulse AI — describe symptoms, find a doctor...",
    "Tell me your symptoms... (e.g., I have a headache)",
    "Find a specialist... (e.g., Best cardiologist)",
    "Ask about health evaluations... (e.g., Full body checkup)"
  ];

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setPlaceholderIndex(prev => (prev + 1) % placeholders.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isOpen]);

  const [liveResults, setLiveResults] = useState<any>(null);

  useEffect(() => {
    if (isOpen) { 
      setTimeout(() => inputRef.current?.focus(), 300); 
      setInputValue(initialQuery || ""); 
      setLiveResults(null);
    }
    else { 
      setMessages([]); 
      setHasStarted(false); 
      setInputValue(""); 
      setLiveResults(null);
    }
  }, [isOpen, initialQuery]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const sendMessage = useCallback(async (query: string) => {
    if (!query.trim()) return;
    const userMsg: Message = { id: `u-${Date.now()}`, role: "user", content: query.trim(), type: "text", timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInputValue("");
    setLiveResults(null); // Clear live suggestions on enter
    setHasStarted(true);
    setIsTyping(true);

    try {
      // 1. Fetch real results from the internal search API
      const searchResults = await searchHealthcare(query.trim(), null);
      
      // 2. Format query and get AI insights
      const baseResponse = simulateAIResponse(query);
      
      // 3. Inject real API doctor results if matching doctor records are found
      if (searchResults.doctors && searchResults.doctors.length > 0) {
        baseResponse.type = "doctor-results";
        baseResponse.doctorResults = searchResults.doctors.slice(0, 3).map((doc) => ({
          id: String(doc.id),
          name: doc.name,
          speciality: doc.speciality,
          hospital: doc.hospital || "Narayana Health",
          city: "India",
          experience: "15+ Years",
          rating: 4.8,
          available: doc.availability.hospital || "Available Today",
          fee: "₹1,000",
          img: doc.photo || "/assets/hero_doctor.png"
        }));
      }

      await new Promise(r => setTimeout(r, 600));
      setIsTyping(false);
      setMessages(prev => [...prev, { id: `a-${Date.now()}`, timestamp: Date.now(), ...baseResponse }]);
    } catch (err) {
      console.warn("Real API fetch failed, falling back to mock response.", err);
      // Fallback
      await new Promise(r => setTimeout(r, 600));
      const responseData = simulateAIResponse(query);
      setIsTyping(false);
      setMessages(prev => [...prev, { id: `a-${Date.now()}`, timestamp: Date.now(), ...responseData }]);
    }
  }, []);

  const handleSubmit = useCallback((e?: React.FormEvent) => { e?.preventDefault(); if (inputValue.trim()) sendMessage(inputValue); }, [inputValue, sendMessage]);
  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); } };
  const handleTextareaChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => { 
    const val = e.target.value;
    setInputValue(val); 
    e.target.style.height = "auto"; 
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px"; 

    // Live search query results mapping as user types
    if (val.trim().length >= 1) {
      try {
        const results = await searchHealthcare(val.trim(), null);
        setLiveResults(results);
      } catch (err) {
        console.warn("Live search fetch error", err);
      }
    } else {
      setLiveResults(null);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className={styles.overlay} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 15 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className={styles.panel}
          >

            {/* Header */}
            <div className={styles.header}>
              <div className={styles.headerLeft}>
                <div style={{ width: "108px", height: "auto", display: "flex", alignItems: "center" }}>
                  <img src="/NH_Logo_white_1.png" alt="Narayana Health" style={{ width: "100%", height: "auto" }} />
                </div>
              </div>
              <button className={styles.closeBtn} onClick={onClose} aria-label="Close"><X size={20} /></button>
            </div>

            {/* Body */}
            <div className={styles.body}>
              {inputValue.trim().length > 0 && liveResults ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px", padding: "10px 0" }}>
                  
                  {/* Specialities Matches */}
                  {liveResults.specialities && liveResults.specialities.length > 0 && (
                    <div>
                      <div style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>Specialities</div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "8px" }}>
                        {liveResults.specialities.map((spec: any) => (
                          <div
                            key={spec.id}
                            onClick={() => sendMessage(spec.name)}
                            style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 12px", background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "12px", cursor: "pointer" }}
                          >
                            <img src={spec.image || "/Specialities icons/General Medicine.svg"} alt={spec.name} style={{ width: "24px", height: "24px" }} />
                            <div style={{ fontSize: "13px", fontWeight: 600, color: "#ffffff" }}>{spec.name}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Doctors Matches */}
                  {liveResults.doctors && liveResults.doctors.length > 0 && (
                    <div>
                      <div style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>Doctors</div>
                      <div className={styles.doctorResults} style={{ gap: "8px" }}>
                        {liveResults.doctors.slice(0, 3).map((doc: any) => (
                          <DoctorResultCard
                            key={doc.id}
                            doc={{
                              id: String(doc.id),
                              name: doc.name,
                              speciality: doc.speciality,
                              hospital: doc.hospital || "Narayana Health",
                              city: "India",
                              experience: "15+ Years",
                              rating: 4.8,
                              available: doc.availability.hospital || "Available Today",
                              fee: "₹1,000",
                              img: doc.photo || "/assets/hero_doctor.png"
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Treatments Matches */}
                  {liveResults.treatments && liveResults.treatments.length > 0 && (
                    <div>
                      <div style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>Treatments</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        {liveResults.treatments.map((t: any) => (
                          <div
                            key={t.id}
                            onClick={() => sendMessage(t.name)}
                            style={{ display: "inline-flex", padding: "6px 12px", background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "20px", fontSize: "12px", color: "#e2e8f0", cursor: "pointer" }}
                          >
                            {t.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Ask Pulse AI Workspace Banner (nude/minimal style) */}
                  <div 
                    onClick={() => sendMessage(inputValue)}
                    style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "space-between", 
                      padding: "16px 20px", 
                      background: "linear-gradient(135deg, rgba(124, 58, 237, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%)", 
                      border: "1px solid rgba(124, 58, 237, 0.2)", 
                      borderRadius: "20px", 
                      cursor: "pointer", 
                      marginTop: "10px" 
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ color: "#a78bfa" }}><Sparkles size={20} /></div>
                      <div>
                        <div style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff" }}>Ask Pulse AI Workspace</div>
                        <div style={{ fontSize: "11.5px", color: "#94a3b8", marginTop: "2px" }}>Get AI-powered health insights and doctor recommendations for "{inputValue}"</div>
                      </div>
                    </div>
                    <div style={{ fontSize: "12px", fontWeight: 700, color: "#a78bfa" }}>Ask Pulse →</div>
                  </div>

                </div>
              ) : !hasStarted ? (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className={styles.welcomeState}>
                  <div className={styles.welcomeLogoWrap}>
                    <div className={styles.welcomeLogo}><Sparkles size={28} /></div>
                    <div className={styles.welcomeRing} />
                    <div className={styles.welcomeRing2} />
                  </div>
                  <h2 className={styles.welcomeTitle}>
                    {isUserLoggedIn ? "Hi Omkar" : "Hi User"}
                  </h2>
                  <p className={styles.welcomeSub}>
                    Describe symptoms, find specialized Narayana doctors, or explore health plans.
                  </p>
                  {!isUserLoggedIn && (
                    <button onClick={handleLoginToggle} className={styles.loginCta}>
                      Login to personalize your health experience →
                    </button>
                  )}

                  {/* Features shortcuts */}
                  <div className={styles.chips} style={{ marginTop: "28px", zIndex: 2 }}>
                    {FEATURE_CHIPS.map(chip => (
                      <button key={chip.label} className={styles.featureChip} onClick={() => sendMessage(chip.query)}>
                        <span className={styles.featureChipIcon}>{chip.icon}</span>
                        <span className={styles.featureChipLabel}>{chip.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Suggestion Chips in the Center */}
                  <div className={styles.chips} style={{ marginTop: "14px", zIndex: 2 }}>
                    {SUGGESTION_CHIPS.map(chip => (
                      <button key={chip.label} className={styles.chip} onClick={() => sendMessage(chip.query)}>
                        <span className={styles.chipIcon}>{chip.icon}</span>
                        <span>{chip.label}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <div className={styles.messagesContainer}>
                  <AnimatePresence initial={false}>
                    {messages.map(msg => <MessageBubble key={msg.id} msg={msg} />)}
                    {isTyping && <TypingIndicator key="typing" />}
                  </AnimatePresence>
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input Section */}
            <div className={styles.inputSection}>

              <form onSubmit={handleSubmit} className={styles.inputBar}>
                <div className={styles.inputWrap}>
                  <div className={styles.searchIconWrapper}>
                    <Search className={styles.searchIcon} size={18} />
                  </div>
                  <textarea
                    ref={inputRef}
                    value={inputValue}
                    onChange={handleTextareaChange}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholders[placeholderIndex]}
                    className={styles.input}
                    rows={1}
                  />
                  <div className={styles.inputActions}>
                    <button type="button" className={styles.micBtn} aria-label="Voice input">
                      <Mic size={18} />
                    </button>
                    <button
                      type="submit"
                      className={`${styles.sendBtn} ${inputValue.trim() ? styles.sendBtnActive : ""}`}
                      disabled={!inputValue.trim() || isTyping}
                      aria-label="Send"
                    >
                      {isTyping ? <Loader2 size={18} className={styles.spinIcon} /> : <ArrowUp size={18} />}
                    </button>
                  </div>
                </div>
              </form>

              <div className={styles.inputFooter}>Pulse AI can make mistakes. For medical emergencies, call <strong>1800-309-6060</strong>.</div>
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
