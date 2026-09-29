"use client";

import { useEffect, useState } from "react";

const PHRASES = [
  "How can we help you today?",
  "Find a cardiologist in Bangalore...",
  "I have fever, cough and body ache...",
  "Book an appointment with a neurologist...",
  "Nearest 24/7 Narayana hospital...",
  "Consult an orthopedic doctor for knee pain...",
  "Describe your symptoms for instant AI guidance...",
  "Upload health reports for a clinical summary...",
];

const TYPE_MS = 38;
const DELETE_MS = 20;
const HOLD_MS = 1800;

export default function TypewriterPrompt({ className, style }: { className?: string; style?: React.CSSProperties }) {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const full = PHRASES[phraseIndex];
    let timeout: ReturnType<typeof setTimeout>;

    if (!deleting && text === full) {
      timeout = setTimeout(() => setDeleting(true), HOLD_MS);
    } else if (deleting && text === "") {
      setDeleting(false);
      setPhraseIndex((i) => (i + 1) % PHRASES.length);
    } else {
      timeout = setTimeout(() => {
        setText(full.slice(0, text.length + (deleting ? -1 : 1)));
      }, deleting ? DELETE_MS : TYPE_MS);
    }

    return () => clearTimeout(timeout);
  }, [text, deleting, phraseIndex]);

  return (
    <span className={className} style={style}>
      {text}
      <span aria-hidden style={{ display: "inline-block", marginLeft: 2, animation: "nh-caret-blink 0.9s step-end infinite" }}>
        |
      </span>
    </span>
  );
}
