"use client";

import React from "react";
import { motion } from "framer-motion";
import type { BookingStep } from "@/features/booking/types";
import styles from "./StepIndicator.module.css";

interface Step {
  number: BookingStep;
  label: string;
}

const STEPS: Step[] = [
  { number: 1, label: "Date & Time" },
  { number: 2, label: "Patient Details" },
  { number: 3, label: "Review & Confirm" },
];

interface StepIndicatorProps {
  currentStep: BookingStep;
  onStepClick?: (step: BookingStep) => void;
  completedSteps?: BookingStep[];
}

export default function StepIndicator({
  currentStep,
  onStepClick,
  completedSteps = [],
}: StepIndicatorProps) {
  return (
    <nav aria-label="Booking progress" className={styles.wrapper}>
      {STEPS.map((step, index) => {
        const isCompleted = completedSteps.includes(step.number);
        const isActive = currentStep === step.number;
        const isClickable = isCompleted && onStepClick;

        return (
          <React.Fragment key={step.number}>
            <button
              className={[
                styles.step,
                isActive ? styles.active : "",
                isCompleted ? styles.completed : "",
                isClickable ? styles.clickable : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => isClickable && onStepClick(step.number)}
              aria-current={isActive ? "step" : undefined}
              aria-label={`Step ${step.number}: ${step.label}${isCompleted ? " (completed)" : ""}`}
              disabled={!isClickable && !isActive}
            >
              <motion.span
                className={styles.node}
                animate={{
                  backgroundColor: isCompleted
                    ? "var(--color-success)"
                    : isActive
                    ? "var(--color-primary)"
                    : "var(--color-bg-alt)",
                  borderColor: isActive
                    ? "var(--color-primary)"
                    : isCompleted
                    ? "var(--color-success)"
                    : "var(--color-border)",
                }}
                transition={{ duration: 0.25 }}
              >
                {isCompleted ? (
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <span
                    className={styles.nodeNumber}
                    style={{ color: isActive ? "#fff" : "var(--color-text-muted)" }}
                  >
                    {step.number}
                  </span>
                )}
              </motion.span>
              <span className={styles.label}>{step.label}</span>
            </button>

            {index < STEPS.length - 1 && (
              <div className={styles.connector}>
                <motion.div
                  className={styles.connectorFill}
                  animate={{ scaleX: isCompleted ? 1 : 0 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  style={{ originX: 0 }}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
