"use client";

/**
 * Empathetic Female Text-To-Speech Synthesizer
 * Plays a warm, gentle female voice phrase ("Getting you the right care") during clinical analysis.
 */
export function playFemaleEmpatheticVoice(
  phrase: string = "Getting you the right care",
  onEnd?: () => void
): void {
  if (typeof window === "undefined") {
    if (onEnd) onEnd();
    return;
  }

  // 1. Play a subtle, reassuring soft acoustic chime via Web Audio API
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) {
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5 note (soothing, gentle)
      osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.35); // E5 note
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.65);
    }
  } catch {
    // Ignore audio context autoplay restrictions gracefully
  }

  // 2. Play Web Speech API Female Voice Utterance
  if (!("speechSynthesis" in window)) {
    if (onEnd) setTimeout(onEnd, 1800);
    return;
  }

  try {
    // Cancel any previous speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(phrase);
    utterance.rate = 0.88; // Calm, reassuring pace
    utterance.pitch = 1.15; // Gentle female pitch
    utterance.volume = 1.0;
    utterance.lang = "en-US";

    const selectFemaleVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices || voices.length === 0) return null;

      // Priority list of premium natural female voices
      const preferredFemaleNames = [
        "google uk english female",
        "google us english female",
        "samantha",
        "victoria",
        "karen",
        "zira",
        "serena",
        "fiona",
        "moira",
        "veena",
        "microsoft zira",
        "natural",
        "female",
      ];

      for (const pref of preferredFemaleNames) {
        const found = voices.find(
          (v) => v.name.toLowerCase().includes(pref) && v.lang.startsWith("en")
        );
        if (found) return found;
      }

      // Fallback: Any English non-male voice
      return (
        voices.find((v) => v.lang.startsWith("en") && !v.name.toLowerCase().includes("male")) ||
        voices[0]
      );
    };

    const bestVoice = selectFemaleVoice();
    if (bestVoice) {
      utterance.voice = bestVoice;
    }

    let finished = false;
    const safeCallback = () => {
      if (!finished) {
        finished = true;
        if (onEnd) onEnd();
      }
    };

    utterance.onend = safeCallback;
    utterance.onerror = safeCallback;

    // Safety fallback timeout
    setTimeout(safeCallback, 2200);

    // If voices are not yet loaded in Chrome/Safari, listen to onvoiceschanged
    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        const v = selectFemaleVoice();
        if (v) utterance.voice = v;
        window.speechSynthesis.speak(utterance);
      };
    } else {
      window.speechSynthesis.speak(utterance);
    }
  } catch (e) {
    console.warn("Speech synthesis error:", e);
    if (onEnd) setTimeout(onEnd, 1800);
  }
}
