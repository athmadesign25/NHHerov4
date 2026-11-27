"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThumbsUp, ThumbsDown, CheckCircle2, MessageSquarePlus, Send } from "lucide-react";
import styles from "./GuideFeedbackWidget.module.css";

interface GuideFeedbackWidgetProps {
  /** e.g. "article", "procedure guide", "condition guide", "test guide", "symptom guide", "hospital guide" */
  guideType?: string;
  theme?: "white" | "dynamic";
}

type VoteChoice = "up" | "down" | null;

export default function GuideFeedbackWidget({
  guideType = "guide",
  theme = "dynamic",
}: GuideFeedbackWidgetProps) {
  const [vote, setVote] = useState<VoteChoice>(null);
  const [showNoteBox, setShowNoteBox] = useState(false);
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleVote = (choice: "up" | "down") => {
    setSubmitted(false);
    if (vote === choice) {
      setShowNoteBox((prev) => !prev);
      return;
    }
    setVote(choice);
    // Automatically expand the note box on thumbs-down; keep on-demand for thumbs-up
    setShowNoteBox(choice === "down");
  };

  const handleSubmitNote = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setShowNoteBox(false);
  };

  const promptText = `Was this ${guideType} helpful?`;

  return (
    <div
      className={`${styles.feedbackSidebarSection} ${
        theme === "dynamic" ? styles.feedbackDynamic : styles.feedbackWhite
      }`}
      role="region"
      aria-label="Page feedback"
    >
      <span className={styles.feedbackEyebrow}>{promptText}</span>

      <div className={styles.thumbRow}>
        <button
          type="button"
          onClick={() => handleVote("up")}
          className={`${styles.thumbBtn} ${
            vote === "up" ? styles.thumbBtnActiveUp : ""
          }`}
          aria-pressed={vote === "up"}
          aria-label="Yes, this was helpful"
        >
          <ThumbsUp size={13} strokeWidth={2.2} aria-hidden="true" />
          <span>Yes</span>
        </button>

        <button
          type="button"
          onClick={() => handleVote("down")}
          className={`${styles.thumbBtn} ${
            vote === "down" ? styles.thumbBtnActiveDown : ""
          }`}
          aria-pressed={vote === "down"}
          aria-label="No, this needs improvement"
        >
          <ThumbsDown size={13} strokeWidth={2.2} aria-hidden="true" />
          <span>No</span>
        </button>

        {vote && !showNoteBox && (
          <button
            type="button"
            onClick={() => {
              setSubmitted(false);
              setShowNoteBox(true);
            }}
            className={styles.writeMoreTrigger}
            title="Write feedback note"
          >
            <MessageSquarePlus size={12} aria-hidden="true" />
            <span>{submitted ? "Edit note" : "Write more"}</span>
          </button>
        )}
      </div>

      <AnimatePresence initial={false}>
        {vote && !showNoteBox && (
          <motion.div
            key="feedback-status"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className={styles.statusNotice}
          >
            <CheckCircle2 size={13} className={styles.statusIcon} aria-hidden="true" />
            <span>
              {submitted
                ? "Thank you — your feedback helps improve our guides."
                : vote === "up"
                ? "Glad this helped! You can add a quick note anytime."
                : "Thanks for letting us know."}
            </span>
          </motion.div>
        )}

        {showNoteBox && (
          <motion.form
            key="feedback-note-form"
            onSubmit={handleSubmitNote}
            className={styles.noteForm}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: "hidden" }}
          >
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              maxLength={350}
              placeholder={
                vote === "down"
                  ? "What was missing or unclear? (optional)"
                  : "Tell us what helped most... (optional)"
              }
              className={styles.noteTextarea}
              aria-label="Additional feedback note"
            />
            <div className={styles.noteActions}>
              <button
                type="button"
                onClick={() => setShowNoteBox(false)}
                className={styles.noteCancelBtn}
              >
                Close
              </button>
              <button
                type="submit"
                disabled={!note.trim()}
                className={styles.noteSubmitBtn}
              >
                <Send size={11} aria-hidden="true" />
                <span>Send</span>
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
