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

  // Play Web Speech API Female Voice Utterance (pure natural voice, no preceding chime tone)
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
