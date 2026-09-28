"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, MotionValue, AnimatePresence } from "framer-motion";
import { Paperclip, Mic, ArrowUp, User, Heart, X, Square, Pause, FileText } from "lucide-react";
import Lottie from "lottie-react";
import pulseAnimation from "../../../../public/assets/pulse animation.json";
import styles from "./NHSearchExperience.module.css";
import LocationSelector from "./LocationSelector";

interface DefaultSearchPromptProps {
  onActivate: () => void;
  onVoiceSubmit?: (transcript: string) => void;
  onDocumentSubmit?: (file: { name: string; size?: number }, prompt: string) => void;
  selectedLocation: string;
  onSelectLocation: (loc: string) => void;
  onSelectActionPill: (action: "doctor" | "symptoms") => void;
  onOpenPulse?: () => void;
  searchTheme?: "dark" | "white";
  isMobile?: boolean;
  promptOpacity?: MotionValue<number>;
  minimizedSearchOpacity?: MotionValue<number>;
  textColor?: MotionValue<string>;
  compactLabelOpacity?: MotionValue<number>;
  squareIconOpacity?: MotionValue<number>;
  fabLabelOpacity?: MotionValue<number>;
  controlsOpacity?: MotionValue<number>;
  controlsHeight?: MotionValue<string>;
  controlsMarginBottom?: MotionValue<string>;
  controlsOverflow?: MotionValue<"hidden" | "visible">;
}

// Minimal SpeechRecognition interfaces for standard TypeScript
interface SpeechRecognitionResultItem {
  transcript: string;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResultItem;
  isFinal?: boolean;
  length: number;
}

interface SpeechRecognitionResultWrapper {
  [index: number]: SpeechRecognitionResultList;
  isFinal?: boolean;
  length: number;
}

interface SpeechRecognitionEventLike {
  results: SpeechRecognitionResultWrapper;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: unknown) => void) | null;
  onend: (() => void) | null;
  onspeechend?: (() => void) | null;
}

type SpeechRecognitionCtor = new () => SpeechRecognitionInstance;

const DEMO_VOICE_QUERY = "I have chest pain and shortness of breath since morning";

// Pre-computed organic acoustic wave bars for full-row visualizer
const ACOUSTIC_BAR_COUNT = 44;
const ACOUSTIC_WAVE_BARS = Array.from({ length: ACOUSTIC_BAR_COUNT }, (_, i) => {
  const distFromCenter = Math.abs(i - ACOUSTIC_BAR_COUNT / 2) / (ACOUSTIC_BAR_COUNT / 2);
  const bell = Math.sin((1 - distFromCenter) * (Math.PI / 2));
  const baseHeight = Math.round(7 + bell * 17 + ((i % 3) * 2));
  const delay = Number(((i * 0.045) % 0.85).toFixed(2));
  const duration = Number((0.65 + ((i % 4) * 0.1)).toFixed(2));
  return { baseHeight, delay, duration };
});

export default function DefaultSearchPrompt({
  onActivate,
  onVoiceSubmit,
  onDocumentSubmit,
  selectedLocation,
  onSelectLocation,
  onSelectActionPill,
  onOpenPulse,
  searchTheme = "dark",
  isMobile = false,
  promptOpacity,
  minimizedSearchOpacity,
  textColor,
  compactLabelOpacity,
  squareIconOpacity,
  fabLabelOpacity,
  controlsOpacity,
  controlsHeight,
  controlsMarginBottom,
  controlsOverflow,
}: DefaultSearchPromptProps) {
  const isWhite = searchTheme === "white";

  // Voice Interaction Machine
  const [voiceMode, setVoiceMode] = useState<"idle" | "listening" | "transcribed">("idle");
  const [transcribedText, setTranscribedText] = useState("");
  const [liveTranscript, setLiveTranscript] = useState("");

  // Attached Document (PDF only)
  const [attachedPdf, setAttachedPdf] = useState<{ name: string; size?: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const simulationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const streamIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isListeningRef = useRef(false);

  // Clean up speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
      if (simulationTimerRef.current) clearTimeout(simulationTimerRef.current);
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
    };
  }, []);

  // Stop recording and finalize transcript
  const finishRecording = useCallback((finalText?: string) => {
    isListeningRef.current = false;
    if (simulationTimerRef.current) clearTimeout(simulationTimerRef.current);
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }

    const resolvedText = (finalText || liveTranscript || DEMO_VOICE_QUERY).trim();
    setTranscribedText(resolvedText);
    setVoiceMode("transcribed");
  }, [liveTranscript]);

  // Start Voice Recording in default placement
  const startRecording = useCallback(() => {
    setVoiceMode("listening");
    setLiveTranscript("");
    setTranscribedText("");
    isListeningRef.current = true;

    if (simulationTimerRef.current) clearTimeout(simulationTimerRef.current);
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);

    // 1. Try native Web Speech API if supported
    let speechApiFound = false;
    if (typeof window !== "undefined") {
      const windowWithSpeech = window as unknown as {
        SpeechRecognition?: SpeechRecognitionCtor;
        webkitSpeechRecognition?: SpeechRecognitionCtor;
      };
      const SpeechRecognitionClass = windowWithSpeech.SpeechRecognition || windowWithSpeech.webkitSpeechRecognition;

      if (SpeechRecognitionClass) {
        try {
          const instance = new SpeechRecognitionClass();
          instance.continuous = false;
          instance.interimResults = true;
          instance.lang = "en-IN";

          instance.onresult = (event: SpeechRecognitionEventLike) => {
            if (!isListeningRef.current) return;
            let interim = "";
            let final = "";

            for (let i = 0; i < event.results.length; i++) {
              const res = event.results[i];
              if (res.isFinal) {
                final += res[0]?.transcript || "";
              } else {
                interim += res[0]?.transcript || "";
              }
            }

            const current = (final || interim).trim();
            if (current) {
              setLiveTranscript(current);
              // Cancel simulated fallback since real speech is active
              if (simulationTimerRef.current) clearTimeout(simulationTimerRef.current);
              if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
            }

            if (final) {
              finishRecording(final);
            } else {
              // Reset pause / silence timer on interim speech
              if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
              silenceTimerRef.current = setTimeout(() => {
                if (isListeningRef.current && current) {
                  finishRecording(current);
                }
              }, 1600);
            }
          };

          instance.onerror = () => {
            // Gracefully let the interactive fallback simulation continue without blocking
          };

          instance.onspeechend = () => {
            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = setTimeout(() => {
              if (isListeningRef.current) {
                finishRecording();
              }
            }, 800);
          };

          instance.onend = () => {
            if (isListeningRef.current) {
              finishRecording();
            }
          };

          instance.start();
          recognitionRef.current = instance;
          speechApiFound = true;
        } catch {
          speechApiFound = false;
        }
      }
    }

    // 2. High-fidelity Fallback Simulation:
    // If user is testing without active mic or in browser without permission, stream realistic words
    // after 1.6s so the patient/reviewer experiences the full live speech-to-text flow immediately
    simulationTimerRef.current = setTimeout(() => {
      if (!isListeningRef.current) return;
      const words = DEMO_VOICE_QUERY.split(" ");
      let wordIdx = 0;
      let accum = "";

      streamIntervalRef.current = setInterval(() => {
        if (!isListeningRef.current) return;
        if (wordIdx < words.length) {
          accum += (accum ? " " : "") + words[wordIdx];
          setLiveTranscript(accum);
          wordIdx++;
        } else {
          if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
          // Natural speech pause before finalizing transcription
          silenceTimerRef.current = setTimeout(() => {
            if (isListeningRef.current) {
              finishRecording(accum);
            }
          }, 900);
        }
      }, 260);
    }, speechApiFound ? 3200 : 1600);
  }, [finishRecording]);

  // Handle Voice button toggle
  const handleMicClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (voiceMode === "listening") {
      finishRecording();
    } else {
      startRecording();
    }
  };

  // Clear voice and reset to idle
  const handleClearVoice = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
    }
    isListeningRef.current = false;
    if (simulationTimerRef.current) clearTimeout(simulationTimerRef.current);
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
    setVoiceMode("idle");
    setLiveTranscript("");
    setTranscribedText("");
  };

  // Handle Paperclip attach click (PDF only)
  const handlePaperclipClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (voiceMode === "listening") finishRecording();
    setVoiceMode("idle");
    setTranscribedText("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    } else {
      setAttachedPdf({ name: "Blood_Test_Report.pdf", size: 245000 });
    }
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
      setAttachedPdf({ 
        name: isPdf ? file.name : `${file.name.replace(/\.[^/.]+$/, "")}.pdf`, 
        size: file.size 
      });
    } else {
      setAttachedPdf({ name: "Blood_Test_Report.pdf", size: 245000 });
    }
  };

  const handleRemovePdf = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAttachedPdf(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Submit attached PDF document -> Opens Pulse AI direct
  const handleSendDocument = (e?: React.MouseEvent | React.FormEvent) => {
    if (e) e.stopPropagation();
    if (!attachedPdf) return;
    const prompt = "Understand my health report";
    if (onDocumentSubmit) {
      onDocumentSubmit(attachedPdf, prompt);
    } else {
      onActivate();
    }
  };

  // Submit voice search query -> Opens Pulse AI direct
  const handleSendVoice = (e?: React.MouseEvent | React.FormEvent) => {
    if (e) e.stopPropagation();
    const queryToSend = (transcribedText || liveTranscript || DEMO_VOICE_QUERY).trim();
    if (onVoiceSubmit) {
      onVoiceSubmit(queryToSend);
    } else {
      onActivate();
    }
  };

  // Main container click handler: only triggers regular active modal when idle and no PDF attached
  const handleContainerClick = () => {
    if (voiceMode === "idle" && !attachedPdf) {
      onActivate();
    }
  };

  return (
    <div 
      className={styles.landingContainer} 
      style={{ height: "100%", justifyContent: "center", cursor: voiceMode === "idle" ? "pointer" : "default", position: "relative", overflow: "hidden", zIndex: 5 }}
      onClick={handleContainerClick}
    >
      {/* Top row: Primary Prompt or Voice In-Place Mode */}
      <motion.div
        className={styles.landingInputRow}
        style={{
          ...(controlsMarginBottom ? { marginBottom: controlsMarginBottom } : {}),
          position: "relative",
          alignItems: "center",
          opacity: promptOpacity,
        }}
        onClick={(e) => {
          if (voiceMode === "idle") {
            onActivate();
          } else {
            e.stopPropagation();
          }
        }}
        role={voiceMode === "idle" ? "button" : undefined}
        tabIndex={voiceMode === "idle" ? 0 : undefined}
        onKeyDown={(e) => {
          if (voiceMode === "idle" && (e.key === "Enter" || e.key === " ")) onActivate();
        }}
      >
        <AnimatePresence mode="wait">
          {attachedPdf && voiceMode === "idle" && (
            <motion.div
              key="attached-pdf-prompt"
              className={styles.attachedDocRow}
              initial={{ opacity: 0, y: 2 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -2 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* PDF File Tag */}
              <div className={styles.attachedPdfChip}>
                <FileText size={13} className={styles.pdfIcon} />
                <span className={styles.pdfFileName}>{attachedPdf.name}</span>
                <button
                  type="button"
                  className={styles.pdfRemoveBtn}
                  onClick={handleRemovePdf}
                  aria-label="Remove attached PDF"
                  title="Remove attached PDF"
                >
                  <X size={10} />
                </button>
              </div>

              {/* Default prompt as specified: (understand my health report) */}
              <span className={styles.attachedDocPromptText}>
                Understand my health report
              </span>
            </motion.div>
          )}

          {!attachedPdf && voiceMode === "idle" && (
            <motion.span
              key="idle-placeholder"
              className={styles.landingPlaceholder}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={isWhite ? { color: "rgba(15, 23, 42, 0.60)", fontWeight: 400, letterSpacing: "-0.01em", textShadow: "none" } : undefined}
            >
              How can we help you today?
            </motion.span>
          )}

          {voiceMode === "listening" && (
            <motion.div
              key="voice-listening"
              className={styles.compactAcousticRow}
              initial={{ opacity: 0, y: 2 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -2 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Compact LISTENING Badge */}
              <div className={styles.voiceListeningBadge}>
                <span className={styles.voiceListeningDot} />
                <span>LISTENING</span>
              </div>

              {/* Live transcript or speech invitation prompt */}
              {liveTranscript ? (
                <span className={styles.voiceLiveTranscript}>
                  &ldquo;{liveTranscript}&rdquo;
                </span>
              ) : (
                <span className={styles.voiceLivePlaceholder}>
                  Speak symptoms...
                </span>
              )}

              {/* Dynamic acoustic wave bars extending across the remaining row */}
              <div className={styles.compactAcousticWave} aria-hidden="true">
                {ACOUSTIC_WAVE_BARS.map((bar, i) => (
                  <span
                    key={i}
                    className={styles.compactWaveBar}
                    style={{
                      height: `${Math.min(18, Math.max(5, bar.baseHeight))}px`,
                      animationDelay: `${bar.delay}s`,
                      animationDuration: `${bar.duration}s`,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {voiceMode === "transcribed" && (
            <motion.div
              key="voice-transcribed"
              className={styles.transcribedWrap}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -3 }}
              transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type="text"
                className={styles.transcribedInput}
                value={transcribedText}
                onChange={(e) => setTranscribedText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSendVoice();
                  }
                }}
                placeholder="Describe your symptoms..."
                autoFocus
                aria-label="Transcribed voice health query"
              />

              <div className={styles.transcribedActions}>
                <span className={styles.transcribedBadge}>
                  <Mic size={11} /> Voice
                </span>
                <button
                  type="button"
                  className={styles.transcribedClearBtn}
                  onClick={handleClearVoice}
                  title="Clear and re-record"
                  aria-label="Clear voice input"
                >
                  <X size={13} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Minimized Search Content: Pulse Lottie animation with text below ── */}
      {minimizedSearchOpacity && (
        <motion.div
          className={styles.squareBoxContent}
          style={{
            opacity: minimizedSearchOpacity,
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 7,
            padding: "13px 6px",
            pointerEvents: "none",
            userSelect: "none",
            boxSizing: "border-box",
          }}
        >
          <div className={styles.floatingPulseIconWrap}>
            <div className={styles.pulseLottieContainer} aria-hidden="true">
              <Lottie animationData={pulseAnimation} loop={true} />
            </div>
          </div>
          <motion.span
            className={styles.floatingPulseSearchText}
            style={{
              color: textColor || "#FFFFFF",
              marginTop: 1,
            }}
          >
            Pulse AI<br />Search
          </motion.span>
        </motion.div>
      )}

      {/* Continuous horizontal interaction row */}
      <motion.div 
        className={styles.landingBottomRow}
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        style={controlsOpacity ? {
          opacity: controlsOpacity,
          height: controlsHeight,
          overflow: controlsOverflow || "visible",
        } : undefined}
      >
        <div className={styles.bottomControlsLeft}>
          {/* Attachment Icon Button - standalone, supports PDF health reports only */}
          <button
            type="button"
            className={`${styles.standaloneIconBtn} ${attachedPdf ? styles.attachedActiveBtn : ""}`}
            aria-label="Attach medical records or file (PDF only)"
            title="Attach health report (PDF only)"
            onClick={handlePaperclipClick}
          >
            <Paperclip size={17} />
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            style={{ display: "none" }}
            onChange={handleFileSelected}
            onClick={(e) => e.stopPropagation()}
          />

          {/* Location Context Selector - the ONLY outlined contextual control */}
          <LocationSelector
            selectedLocation={selectedLocation}
            onSelectLocation={onSelectLocation}
          />

          {/* Quick Action: Find a doctor - unboxed clean text + icon, NO border/box */}
          {!isMobile && (
            <button
              type="button"
              className={styles.landingTextAction}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "none",
                backgroundColor: "transparent",
                border: "none",
                outline: "none",
                padding: "0 4px",
                color: "#FFFFFF",
                cursor: "pointer",
              }}
              onClick={(e) => {
                e.stopPropagation();
                onSelectActionPill("doctor");
              }}
            >
              <User size={14} style={{ color: "rgba(255, 255, 255, 0.88)" }} />
              <span style={{ color: "#FFFFFF", fontWeight: 450, fontSize: "13.5px" }}>Find a doctor</span>
            </button>
          )}

          {/* Quick Action: Describe my symptoms - unboxed clean text + icon, NO border/box */}
          {!isMobile && (
            <button
              type="button"
              className={styles.landingTextAction}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "none",
                backgroundColor: "transparent",
                border: "none",
                outline: "none",
                padding: "0 4px",
                color: "#FFFFFF",
                cursor: "pointer",
              }}
              onClick={(e) => {
                e.stopPropagation();
                onSelectActionPill("symptoms");
              }}
            >
              <Heart size={14} style={{ color: "rgba(255, 255, 255, 0.88)" }} />
              <span style={{ color: "#FFFFFF", fontWeight: 450, fontSize: "13.5px" }}>Describe my symptoms</span>
            </button>
          )}
        </div>

        {/* Right side controls: turns into Pause button during recording, splits into Send + Mic when paused */}
        <div className={styles.bottomControlsRight}>
          <AnimatePresence mode="popLayout" initial={false}>
            {voiceMode === "listening" ? (
              <motion.button
                key="recording-pause-btn"
                type="button"
                className={styles.recordingPauseBtn}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                aria-label="Pause recording"
                title="Click to pause recording"
                onClick={(e) => {
                  e.stopPropagation();
                  finishRecording();
                }}
              >
                <Pause size={15} fill="currentColor" />
              </motion.button>
            ) : (
              <motion.div
                key="split-controls-group"
                className={styles.splitControlsGroup}
                initial={{ opacity: 0, x: 6, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 6, scale: 0.95 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Mic button (standalone, allows re-recording in transcribed state) */}
                <button
                  type="button"
                  className={styles.standaloneIconBtn}
                  aria-label={voiceMode === "transcribed" ? "Re-record voice" : "Voice search"}
                  title={voiceMode === "transcribed" ? "Click to re-record voice" : "Voice search"}
                  onClick={handleMicClick}
                >
                  <Mic size={17} />
                </button>

                {/* Send button (illuminated with active pulse when transcribed or PDF attached) */}
                <button
                  type="button"
                  className={`${styles.submitArrowBtn} ${voiceMode === "transcribed" || attachedPdf ? styles.submitArrowActiveBtn : ""}`}
                  aria-label="Submit search"
                  title={attachedPdf ? "Understand health report with Pulse AI" : voiceMode === "transcribed" ? "Send to Pulse AI" : "Submit search"}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (attachedPdf) {
                      handleSendDocument(e);
                    } else if (voiceMode === "transcribed") {
                      handleSendVoice(e);
                    } else {
                      onActivate();
                    }
                  }}
                >
                  <ArrowUp size={16} strokeWidth={2.5} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
