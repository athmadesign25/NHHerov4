"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  Paperclip, Mic, ArrowRight, X, Check,
  User, Heart, Sparkles, CornerDownLeft, Command,
  Activity, Bone, Brain, AlertCircle, Stethoscope, SearchX,
  Clock
} from "lucide-react";
import styles from "./NHSearchExperience.module.css";
import LocationSelector from "./LocationSelector";
import { 
  PredictiveState, 
  getPredictiveCompletion, 
  fetchLiveApiPredictions,
  countWords,
  enforceWordLimit,
  MAX_SEARCH_WORDS,
  MAX_AUDIO_DURATION_SECONDS
} from "./searchData";

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
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: unknown) => void) | null;
  onend: (() => void) | null;
  onspeechend?: (() => void) | null;
}

type SpeechRecognitionCtor = new () => SpeechRecognitionInstance;

const DEMO_VOICE_QUERY = "I have chest pain and shortness of breath since morning";

const ACOUSTIC_BAR_COUNT = 44;
const ACOUSTIC_WAVE_BARS = Array.from({ length: ACOUSTIC_BAR_COUNT }, (_, i) => {
  const distFromCenter = Math.abs(i - ACOUSTIC_BAR_COUNT / 2) / (ACOUSTIC_BAR_COUNT / 2);
  const bell = Math.sin((1 - distFromCenter) * (Math.PI / 2));
  const baseHeight = Math.round(7 + bell * 17 + ((i % 3) * 2));
  const delay = Number(((i * 0.045) % 0.85).toFixed(2));
  const duration = Number((0.65 + ((i % 4) * 0.1)).toFixed(2));
  return { baseHeight, delay, duration };
});

const MOBILE_POPULAR_SEARCHES = [
  { label: "Cardiologist", query: "Cardiologist near me", icon: Heart },
  { label: "Chest pain", query: "I have chest pain", icon: Activity },
  { label: "Orthopaedic", query: "Orthopaedic doctor", icon: Bone },
  { label: "Knee pain", query: "I have knee pain", icon: Activity },
  { label: "Neurologist", query: "Neurologist specialist", icon: Brain },
  { label: "Pediatrician", query: "Pediatrician near me", icon: User },
];

interface ActiveSearchCanvasProps {
  query: string;
  onQueryChange: (val: string) => void;
  onSubmit: (query: string) => void;
  onClose: () => void;
  selectedLocation: string;
  onSelectLocation: (loc: string) => void;
  activePill: string | null;
  onSelectActionPill: (pill: "doctor" | "symptoms") => void;
}

export default function ActiveSearchCanvas({
  query,
  onQueryChange,
  onSubmit,
  onClose,
  selectedLocation,
  onSelectLocation,
  activePill,
  onSelectActionPill,
}: ActiveSearchCanvasProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedSugIndex, setSelectedSugIndex] = useState<number>(-1);
  const [livePrediction, setLivePrediction] = useState<PredictiveState | null>(null);
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [liveVoiceTranscript, setLiveVoiceTranscript] = useState("");
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const isListeningRef = useRef(false);
  const voiceRecognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const voiceSimulationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const voiceStreamIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const voiceSilenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const voiceDurationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const liveVoiceTranscriptRef = useRef("");
  const recordingSecondsRef = useRef(0);

  // Recent Searches (History for logged in user, cache for guest user)
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const isLogged = localStorage.getItem("isLoggedIn") === "true" || sessionStorage.getItem("isLoggedIn") === "true";
    const storageKey = isLogged ? "nh_user_search_history" : "nh_guest_search_history";

    const fallbackSeed = isLogged
      ? ["Dr. Devi Prasad Shetty", "Cardiologist near me", "Lipid profile test", "Knee replacement surgery"]
      : ["Cardiologist in Bangalore", "Chest pain symptoms", "Orthopaedic doctor", "Pediatrician near me"];

    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRecentSearches(parsed.slice(0, 4));
          return;
        }
      }
    } catch {
      // fallback to seed
    }

    setRecentSearches(fallbackSeed.slice(0, 4));
  }, []);

  const saveSearchToHistory = (itemQuery: string) => {
    const clean = itemQuery.trim();
    if (!clean || typeof window === "undefined") return;
    const isLogged = localStorage.getItem("isLoggedIn") === "true" || sessionStorage.getItem("isLoggedIn") === "true";
    const storageKey = isLogged ? "nh_user_search_history" : "nh_guest_search_history";

    setRecentSearches((prev) => {
      const next = [clean, ...prev.filter((q) => q.toLowerCase() !== clean.toLowerCase())].slice(0, 4);
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        // ignore storage error
      }
      return next;
    });
  };

  const handleClearHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window === "undefined") return;
    const isLogged = localStorage.getItem("isLoggedIn") === "true" || sessionStorage.getItem("isLoggedIn") === "true";
    const storageKey = isLogged ? "nh_user_search_history" : "nh_guest_search_history";
    try {
      localStorage.setItem(storageKey, JSON.stringify([]));
    } catch {
      // ignore
    }
    setRecentSearches([]);
  };

  // Compute immediate local prediction (0ms for demo speed)
  const localPrediction: PredictiveState | null = query.trim()
    ? getPredictiveCompletion(query)
    : null;

  // Debounced API prediction to fetch real entities from upstream search database
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setLivePrediction(null);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const live = await fetchLiveApiPredictions(trimmed, selectedLocation, controller.signal);
        if (!controller.signal.aborted) {
          setLivePrediction(live);
        }
      } catch {
        // Fallback gracefully
      }
    }, 140);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, selectedLocation]);

  // Merge predictions:
  // If query is an explicit demo key ("c", "ch", "chest", "k", "kn", "knee"), use local scenario
  // Otherwise use livePrediction if available, else fallback to localPrediction
  const isHardcodedScenario = 
    query.trim().toLowerCase() === "c" || 
    query.trim().toLowerCase() === "ch" || 
    query.trim().toLowerCase() === "chest" || 
    query.trim().toLowerCase().startsWith("chest p") || 
    query.trim().toLowerCase() === "k" || 
    query.trim().toLowerCase() === "kn" || 
    query.trim().toLowerCase() === "knee" || 
    query.trim().toLowerCase().startsWith("knee p") ||
    query.trim().toLowerCase().startsWith("xy") ||
    query.trim().toLowerCase().startsWith("xz");

  const prediction = isHardcodedScenario 
    ? (localPrediction || livePrediction)
    : (livePrediction || localPrediction);

  const clearActiveVoiceTimers = useCallback(() => {
    if (voiceSimulationTimerRef.current) {
      clearTimeout(voiceSimulationTimerRef.current);
      voiceSimulationTimerRef.current = null;
    }
    if (voiceStreamIntervalRef.current) {
      clearInterval(voiceStreamIntervalRef.current);
      voiceStreamIntervalRef.current = null;
    }
    if (voiceSilenceTimerRef.current) {
      clearTimeout(voiceSilenceTimerRef.current);
      voiceSilenceTimerRef.current = null;
    }
    if (voiceDurationIntervalRef.current) {
      clearInterval(voiceDurationIntervalRef.current);
      voiceDurationIntervalRef.current = null;
    }
  }, []);

  // Auto-focus input when opening & place cursor cleanly at end of any pre-filled transcript
  useEffect(() => {
    const el = inputRef.current;
    if (el) {
      el.focus();
      const len = el.value.length;
      if (len > 0) {
        el.setSelectionRange(len, len);
      }
    }
    return () => {
      isListeningRef.current = false;
      clearActiveVoiceTimers();
      if (voiceRecognitionRef.current) {
        try {
          voiceRecognitionRef.current.abort();
        } catch {}
        voiceRecognitionRef.current = null;
      }
    };
  }, [clearActiveVoiceTimers]);

  const finishActiveVoice = useCallback((finalText?: string) => {
    if (!isListeningRef.current) return;
    isListeningRef.current = false;
    clearActiveVoiceTimers();

    if (voiceRecognitionRef.current) {
      try {
        voiceRecognitionRef.current.stop();
      } catch {}
      voiceRecognitionRef.current = null;
    }

    const resolvedText = (finalText || liveVoiceTranscriptRef.current || DEMO_VOICE_QUERY).trim();
    const limitedText = enforceWordLimit(resolvedText, MAX_SEARCH_WORDS);

    liveVoiceTranscriptRef.current = "";
    recordingSecondsRef.current = 0;
    setLiveVoiceTranscript("");
    setRecordingSeconds(0);
    setIsVoiceListening(false);
    onQueryChange(limitedText);

    if (typeof window !== "undefined") {
      window.requestAnimationFrame(() => {
        const el = inputRef.current;
        if (el) {
          el.focus();
          el.setSelectionRange(limitedText.length, limitedText.length);
        }
      });
    }
  }, [clearActiveVoiceTimers, onQueryChange]);

  const handleCancelActiveVoice = useCallback(() => {
    isListeningRef.current = false;
    clearActiveVoiceTimers();

    if (voiceRecognitionRef.current) {
      try {
        voiceRecognitionRef.current.abort();
      } catch {}
      voiceRecognitionRef.current = null;
    }

    liveVoiceTranscriptRef.current = "";
    recordingSecondsRef.current = 0;
    setLiveVoiceTranscript("");
    setRecordingSeconds(0);
    setIsVoiceListening(false);

    if (typeof window !== "undefined") {
      window.requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  }, [clearActiveVoiceTimers]);

  const handleStartActiveVoice = useCallback(() => {
    clearActiveVoiceTimers();
    isListeningRef.current = true;
    liveVoiceTranscriptRef.current = "";
    recordingSecondsRef.current = 0;
    setLiveVoiceTranscript("");
    setRecordingSeconds(0);
    setIsVoiceListening(true);

    voiceDurationIntervalRef.current = setInterval(() => {
      if (!isListeningRef.current) {
        clearActiveVoiceTimers();
        return;
      }
      recordingSecondsRef.current += 1;
      setRecordingSeconds(recordingSecondsRef.current);

      if (recordingSecondsRef.current >= MAX_AUDIO_DURATION_SECONDS) {
        finishActiveVoice();
      }
    }, 1000);

    let speechApiFound = false;
    if (typeof window !== "undefined") {
      const win = window as unknown as {
        SpeechRecognition?: SpeechRecognitionCtor;
        webkitSpeechRecognition?: SpeechRecognitionCtor;
      };
      const SpeechCtor = win.SpeechRecognition || win.webkitSpeechRecognition;

      if (SpeechCtor) {
        try {
          const rec = new SpeechCtor();
          rec.continuous = false;
          rec.interimResults = true;
          rec.lang = "en-IN";

          rec.onresult = (ev) => {
            if (!isListeningRef.current) return;
            let interim = "";
            let final = "";

            for (let i = 0; i < ev.results.length; i++) {
              const res = ev.results[i];
              if (res.isFinal) {
                final += res[0]?.transcript || "";
              } else {
                interim += res[0]?.transcript || "";
              }
            }

            const current = enforceWordLimit((final || interim).trim(), MAX_SEARCH_WORDS);
            if (current) {
              liveVoiceTranscriptRef.current = current;
              setLiveVoiceTranscript(current);
              if (voiceSimulationTimerRef.current) {
                clearTimeout(voiceSimulationTimerRef.current);
                voiceSimulationTimerRef.current = null;
              }
              if (voiceStreamIntervalRef.current) {
                clearInterval(voiceStreamIntervalRef.current);
                voiceStreamIntervalRef.current = null;
              }
            }

            if (final) {
              finishActiveVoice(final);
            } else {
              if (voiceSilenceTimerRef.current) clearTimeout(voiceSilenceTimerRef.current);
              voiceSilenceTimerRef.current = setTimeout(() => {
                if (isListeningRef.current && current) {
                  finishActiveVoice(current);
                }
              }, 1600);
            }
          };

          rec.onerror = () => {
            // Allow interactive demo fallback to proceed smoothly if mic access is unavailable
          };

          rec.onspeechend = () => {
            if (voiceSilenceTimerRef.current) clearTimeout(voiceSilenceTimerRef.current);
            voiceSilenceTimerRef.current = setTimeout(() => {
              if (isListeningRef.current) {
                finishActiveVoice();
              }
            }, 800);
          };

          rec.onend = () => {
            if (isListeningRef.current) {
              finishActiveVoice();
            }
          };

          rec.start();
          voiceRecognitionRef.current = rec;
          speechApiFound = true;
        } catch {
          speechApiFound = false;
        }
      }
    }

    voiceSimulationTimerRef.current = setTimeout(() => {
      if (!isListeningRef.current) return;
      const words = DEMO_VOICE_QUERY.split(" ");
      let idx = 0;
      let accum = "";

      voiceStreamIntervalRef.current = setInterval(() => {
        if (!isListeningRef.current) return;
        if (idx < words.length) {
          accum += (accum ? " " : "") + words[idx];
          liveVoiceTranscriptRef.current = accum;
          setLiveVoiceTranscript(accum);
          idx++;
        } else {
          if (voiceStreamIntervalRef.current) {
            clearInterval(voiceStreamIntervalRef.current);
            voiceStreamIntervalRef.current = null;
          }
          voiceSilenceTimerRef.current = setTimeout(() => {
            if (isListeningRef.current) {
              finishActiveVoice(accum);
            }
          }, 900);
        }
      }, 260);
    }, speechApiFound ? 3200 : 1600);
  }, [clearActiveVoiceTimers, finishActiveVoice]);

  // Keyboard handler for Tab completion, arrow navigation, enter submit
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Tab") {
      // Tab accepts the inline predictive completion
      if (prediction && prediction.fullText) {
        e.preventDefault();
        onQueryChange(prediction.fullText);
      }
    } else if (e.key === "ArrowRight" && inputRef.current) {
      // Right arrow at end of text also accepts prediction
      const atEnd = inputRef.current.selectionStart === query.length;
      if (atEnd && prediction && prediction.fullText) {
        e.preventDefault();
        onQueryChange(prediction.fullText);
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (prediction && selectedSugIndex >= 0 && prediction.suggestions[selectedSugIndex]) {
        const target = prediction.suggestions[selectedSugIndex];
        saveSearchToHistory(target);
        onSubmit(target);
      } else if (query.trim()) {
        saveSearchToHistory(query.trim());
        onSubmit(query.trim());
      } else if (prediction && prediction.fullText) {
        saveSearchToHistory(prediction.fullText);
        onSubmit(prediction.fullText);
      } else {
        saveSearchToHistory("Cardiologist near me");
        onSubmit("Cardiologist near me");
      }
    } else if (e.key === "ArrowDown" && prediction) {
      e.preventDefault();
      setSelectedSugIndex((prev) =>
        prev < prediction.suggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp" && prediction) {
      e.preventDefault();
      setSelectedSugIndex((prev) =>
        prev > 0 ? prev - 1 : prediction.suggestions.length - 1
      );
    } else if (e.key === "Escape") {
      if (query.length > 0 || activePill) {
        e.preventDefault();
        e.stopPropagation();
        onQueryChange("");
        inputRef.current?.focus();
      } else {
        e.preventDefault();
        onClose();
      }
    }
  };

  /**
   * Accepts prediction and updates query
   */
  const handleAcceptPrediction = (fullText: string) => {
    onQueryChange(fullText);
    inputRef.current?.focus();
  };

  return (
    <div className={styles.activeContainer}>
      {/* Top Header Row: Location Pill + Pulse AI Badge + Close button */}
      <div className={styles.topHeaderRow}>
        <div className={styles.headerLeftGroup}>
          {/* Location Selector */}
          <LocationSelector
            selectedLocation={selectedLocation}
            onSelectLocation={onSelectLocation}
          />
        </div>

        {/* Close Button */}
        <button
          type="button"
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Close search"
        >
          <X size={18} />
        </button>
      </div>

      {/* Input Row with Live Predictive Sentence Ghost Overlay or Inline Voice Recording */}
      <div className={styles.activeInputRow}>
        {isVoiceListening ? (
          <motion.div
            key="active-voice-listening"
            className={styles.compactAcousticRow}
            initial={{ opacity: 0, y: 2 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className={styles.voiceListeningBadge}>
              <span className={styles.voiceListeningDot} />
              <span>LISTENING</span>
            </div>

            {liveVoiceTranscript ? (
              <span className={styles.voiceLiveTranscript}>
                &ldquo;{liveVoiceTranscript}&rdquo;
              </span>
            ) : (
              <span className={styles.voiceLivePlaceholder}>
                Speak symptoms...
              </span>
            )}

            {recordingSeconds >= MAX_AUDIO_DURATION_SECONDS - 10 && recordingSeconds < MAX_AUDIO_DURATION_SECONDS && (
              <div
                className={styles.voiceLastSecondsBlink}
                role="status"
                aria-live="polite"
              >
                <span>{MAX_AUDIO_DURATION_SECONDS - recordingSeconds}s remaining</span>
              </div>
            )}

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

            <div className={styles.voiceListeningActions}>
              <button
                type="button"
                className={styles.voiceCancelBtn}
                onClick={handleCancelActiveVoice}
                title="Cancel recording"
                aria-label="Cancel voice recording"
              >
                <X size={15} strokeWidth={2.0} />
              </button>
              <button
                type="button"
                className={styles.voiceConfirmBtn}
                onClick={() => finishActiveVoice()}
                title="Done recording"
                aria-label="Confirm and insert transcribed text"
              >
                <Check size={15} strokeWidth={2.0} />
              </button>
            </div>
          </motion.div>
        ) : (
          <>
            <button 
              type="button" 
              className={styles.standaloneIconBtn} 
              aria-label="Attach medical records or file"
            >
              <Paperclip size={18} />
            </button>

            <div className={styles.inputGhostWrapper}>
              {/* Real interactive input */}
              <input
                ref={inputRef}
                type="text"
                className={styles.activeTextInput}
                value={query}
                onChange={(e) => {
                  const val = e.target.value;
                  const words = countWords(val);
                  if (words > MAX_SEARCH_WORDS) {
                    onQueryChange(enforceWordLimit(val, MAX_SEARCH_WORDS));
                  } else {
                    onQueryChange(val);
                  }
                  setSelectedSugIndex(-1);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Start typing symptom, specialty or doctor..."
                aria-label="Search symptoms, conditions or doctors"
                autoComplete="off"
                spellCheck="false"
              />

              {/* Out-of-Word-Limit Error Indicator & Clear / Undo Button */}
              {(countWords(query) >= MAX_SEARCH_WORDS || query.length > 0) && (
                <div className={styles.inputEndAdornment}>
                  {countWords(query) >= MAX_SEARCH_WORDS && (
                    <span className={styles.inputWordLimitError} role="alert">
                      500 words limit reached
                    </span>
                  )}
                  {query.length > 0 && (
                    <button
                      type="button"
                      className={styles.inputClearBtn}
                      aria-label="Clear search input"
                      title="Clear search"
                      onClick={() => {
                        onQueryChange("");
                        inputRef.current?.focus();
                      }}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              )}

              {/* Inline ghost predictive sentence overlay */}
              {prediction && prediction.suffix && query.length > 0 && (
                <div
                  className={styles.ghostTextOverlay}
                  onClick={() => handleAcceptPrediction(prediction.fullText)}
                  title="Click or press Tab to complete"
                >
                  <span className={styles.ghostInvisibleTyped}>{query}</span>
                  <span className={styles.ghostSuffix}>{prediction.suffix}</span>
                  <span className={styles.tabBadge}>Tab ⇥</span>
                </div>
              )}
            </div>

            {query.trim().length === 0 && (
              <button 
                type="button" 
                className={styles.standaloneIconBtn} 
                onClick={handleStartActiveVoice}
                aria-label="Voice search"
                title="Speak to type"
              >
                <Mic size={18} />
              </button>
            )}

            <button
              type="button"
              className={styles.submitArrowBtn}
              aria-label="Submit search"
              onClick={() => {
                if (prediction && selectedSugIndex >= 0 && prediction.suggestions[selectedSugIndex]) {
                  const target = prediction.suggestions[selectedSugIndex];
                  saveSearchToHistory(target);
                  onSubmit(target);
                } else if (query.trim()) {
                  saveSearchToHistory(query.trim());
                  onSubmit(query.trim());
                } else if (prediction && prediction.fullText) {
                  saveSearchToHistory(prediction.fullText);
                  onSubmit(prediction.fullText);
                } else {
                  saveSearchToHistory("Cardiologist near me");
                  onSubmit("Cardiologist near me");
                }
              }}
            >
              <ArrowRight size={16} strokeWidth={2.0} />
            </button>
          </>
        )}
      </div>

      {/* Red Horizon Divider Line */}
      <motion.div 
        className={styles.redDivider}
        initial={{ opacity: 0, scaleX: 0.8 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ duration: 0.32, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
      />

      {/* Quick Actions (Unboxed lightweight text + icon directly on the glass) */}
      <motion.div 
        className={styles.activePillsRow}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      >
        <button
          type="button"
          className={`${styles.inlineActionBtn} ${activePill === "doctor" ? styles.inlineActionBtnActive : ""}`}
          onClick={() => onSelectActionPill("doctor")}
          aria-pressed={activePill === "doctor"}
          title={activePill === "doctor" ? "Click to undo selection" : "Find a doctor"}
        >
          <User size={14} className={styles.inlineActionIcon} />
          <span>Find a doctor</span>
          {activePill === "doctor" && (
            <span className={styles.inlineActionUndoWrap} title="Undo" aria-hidden="true">
              <X size={11} className={styles.inlineActionUndoIcon} />
            </span>
          )}
        </button>

        <button
          type="button"
          className={`${styles.inlineActionBtn} ${activePill === "symptoms" ? styles.inlineActionBtnActive : ""}`}
          onClick={() => onSelectActionPill("symptoms")}
          aria-pressed={activePill === "symptoms"}
          title={activePill === "symptoms" ? "Click to undo selection" : "Describe my symptoms"}
        >
          <Heart size={14} className={styles.inlineActionIcon} />
          <span>Describe my symptoms</span>
          {activePill === "symptoms" && (
            <span className={styles.inlineActionUndoWrap} title="Undo" aria-hidden="true">
              <X size={11} className={styles.inlineActionUndoIcon} />
            </span>
          )}
        </button>
      </motion.div>

      {/* ── STATE 2: EMPTY CANVAS (When user has not typed yet) ── */}
      {!prediction && query.trim().length === 0 && (
        <motion.div 
          className={styles.emptyCanvasPrompt}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Either Recent Searches or Popular Searches (not both stacked) */}
          {recentSearches.length > 0 ? (
            <div className={styles.recentHistorySection}>
              <div className={styles.recentHistoryHeader}>
                <span className={styles.recentHistoryLabel}>Recent searches</span>
                <button
                  type="button"
                  className={styles.recentHistoryClearBtn}
                  onClick={handleClearHistory}
                  title="Clear recent searches"
                >
                  Clear
                </button>
              </div>

              <div className={styles.historyFastTagsRow}>
                {recentSearches.slice(0, 4).map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={styles.historyFastTag}
                    onClick={() => {
                      saveSearchToHistory(item);
                      onQueryChange(item);
                      onSubmit(item);
                    }}
                  >
                    <Clock size={12} className={styles.fastTagIcon} />
                    <span>{item}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className={styles.mobileQuickTray}>
              <span className={styles.mobileQuickLabel}>Popular searches</span>
              <div className={styles.mobileQuickChips}>
                {MOBILE_POPULAR_SEARCHES.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      className={styles.mobileQuickChip}
                      onClick={() => {
                        saveSearchToHistory(item.query);
                        onQueryChange(item.query);
                        onSubmit(item.query);
                      }}
                    >
                      <Icon size={13} className={styles.mobileQuickChipIcon} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* ── LIVE PREDICTIVE SECTION (When user types any character) ── */}
      {prediction && (
        <div className={styles.suggestionsSection}>
          {prediction.status === "error" ? (
            <div className={styles.predictiveErrorTray}>
              <div className={styles.predictiveErrorHeader}>
                <span>Directory connection issue</span>
                <span className={styles.predictiveEmptyAction}>— Press Enter to retry</span>
              </div>
              <div className={styles.predictiveTrayChipsRow}>
                {["Cardiology", "Orthopaedics", "Neurology", "General Medicine"].map((spec) => (
                  <button
                    key={spec}
                    type="button"
                    className={styles.predictiveTrayChip}
                    onClick={() => {
                      onQueryChange(spec);
                      onSubmit(spec);
                    }}
                  >
                    {spec}
                  </button>
                ))}
              </div>
            </div>
          ) : prediction.status === "empty" || prediction.suggestions.length === 0 ? (
            <div className={styles.predictiveEmptyTray}>
              <div className={styles.predictiveEmptyHeader}>
                <span>No suggestions for &ldquo;{query}&rdquo;</span>
                <span className={styles.predictiveEmptyAction}>— Press Enter to search</span>
              </div>
              <div className={styles.predictiveTrayChipsRow}>
                {["Cardiology", "Orthopaedics", "Neurology", "Pediatrics", "Oncology"].map((spec) => (
                  <button
                    key={spec}
                    type="button"
                    className={styles.predictiveTrayChip}
                    onClick={() => {
                      onQueryChange(spec);
                      onSubmit(spec);
                    }}
                  >
                    {spec}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className={styles.suggestionsHeaderRow}>
                <span className={styles.suggestionsHeader}>Suggested predictions</span>
              </div>

              <div className={styles.suggestionsList} role="listbox">
                {prediction.suggestions.slice(0, 4).map((sug, idx) => (
                  <button
                    key={sug}
                    type="button"
                    className={`${styles.suggestionItem} ${
                      selectedSugIndex === idx ? styles.suggestionItemActive : ""
                    }`}
                    onClick={() => {
                      saveSearchToHistory(sug);
                      onSubmit(sug);
                    }}
                    onMouseEnter={() => setSelectedSugIndex(idx)}
                    role="option"
                    aria-selected={selectedSugIndex === idx}
                  >
                    <ArrowRight size={14} className={styles.suggestionArrow} />
                    <span className={styles.suggestionText}>
                      {sug}
                    </span>
                    <span className={styles.pressEnterHint}>
                      <CornerDownLeft size={12} />
                    </span>
                  </button>
                ))}
              </div>

              {/* Pulse AI Status */}
              <div className={styles.pulseStatusRow}>
                <span className={styles.sparkleIcon}>✦</span>
                <span>Pulse understands what you&apos;re trying to say</span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
