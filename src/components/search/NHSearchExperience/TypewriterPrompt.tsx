"use client";

import { useEffect, useState } from "react";

const PHRASES = [
  "Find a cardiologist",
  "I have a fever",
  "Nearest hospital",
  "Book a health checkup",
  "Track my reports",
];

const TYPE_MS = 45;
const DELETE_MS = 28;
const HOLD_MS = 1600;

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
