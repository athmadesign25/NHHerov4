"use client";

import React from "react";
import { Shield } from "lucide-react";
import type { PatientDetails, Gender, PatientRelation } from "@/features/booking/types";
import styles from "./PatientDetailsForm.module.css";

interface PatientDetailsFormProps {
  value: PatientDetails;
  onChange: <K extends keyof PatientDetails>(field: K, value: PatientDetails[K]) => void;
}

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

const RELATION_OPTIONS: { value: PatientRelation; label: string }[] = [
  { value: "self", label: "Self" },
  { value: "spouse", label: "Spouse" },
  { value: "child", label: "Child" },
  { value: "parent", label: "Parent" },
  { value: "other", label: "Other" },
];

export default function PatientDetailsForm({ value, onChange }: PatientDetailsFormProps) {
  const nameError =
    value.name.length > 0 && value.name.trim().length < 2 ? "Name must be at least 2 characters" : "";
  const ageError =
    value.age !== "" && (Number(value.age) < 1 || Number(value.age) > 120)
      ? "Please enter a valid age (1–120)"
      : "";

  return (
    <div className={styles.wrapper}>

      {/* Relation selector */}
      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Booking for</legend>
        <div className={styles.pillGroup} role="group" aria-label="Patient relation">
          {RELATION_OPTIONS.map((rel) => {
            const isActive = value.relation === rel.value;
            return (
              <button
                key={rel.value}
                type="button"
                id={`relation-${rel.value}`}
                className={[styles.pill, isActive ? styles.pillActive : ""].join(" ")}
                aria-pressed={isActive}
                onClick={() => onChange("relation", rel.value)}
              >
                {rel.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Name + Age row */}
      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="patient-name">
            Patient Name <span className={styles.required} aria-hidden>*</span>
          </label>
          <input
            id="patient-name"
            type="text"
            placeholder="Full name"
            autoComplete="name"
            className={[styles.input, nameError ? styles.inputError : ""].join(" ")}
            value={value.name}
            onChange={(e) => onChange("name", e.target.value)}
            aria-describedby={nameError ? "name-error" : undefined}
            aria-required="true"
          />
          {nameError && (
            <span id="name-error" className={styles.errorMsg} role="alert">
              {nameError}
            </span>
          )}
        </div>

        <div className={[styles.field, styles.fieldAge].join(" ")}>
          <label className={styles.label} htmlFor="patient-age">
            Age <span className={styles.required} aria-hidden>*</span>
          </label>
          <input
            id="patient-age"
            type="number"
            inputMode="numeric"
            placeholder="Age"
            min={1}
            max={120}
            className={[styles.input, ageError ? styles.inputError : ""].join(" ")}
            value={value.age}
            onChange={(e) => onChange("age", e.target.value)}
            aria-describedby={ageError ? "age-error" : undefined}
            aria-required="true"
          />
          {ageError && (
            <span id="age-error" className={styles.errorMsg} role="alert">
              {ageError}
            </span>
          )}
        </div>
      </div>

      {/* Gender selector */}
      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>
          Gender <span className={styles.required} aria-hidden>*</span>
        </legend>
        <div className={styles.pillGroup} role="group" aria-label="Gender">
          {GENDER_OPTIONS.map((g) => {
            const isActive = value.gender === g.value;
            return (
              <button
                key={g.value}
                type="button"
                id={`gender-${g.value}`}
                className={[styles.pill, isActive ? styles.pillActive : ""].join(" ")}
                aria-pressed={isActive}
                onClick={() => onChange("gender", g.value)}
              >
                {g.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Reason (optional) */}
      <div className={styles.field}>
        <label className={styles.label} htmlFor="patient-reason">
          Reason for visit
          <span className={styles.optional}> (optional)</span>
        </label>
        <textarea
          id="patient-reason"
          placeholder="Briefly describe your symptoms or reason for consultation…"
          maxLength={200}
          rows={3}
          className={styles.textarea}
          value={value.reason}
          onChange={(e) => onChange("reason", e.target.value)}
        />
        <span className={styles.charCount}>{value.reason.length}/200</span>
      </div>

      {/* Privacy note */}
      <div className={styles.privacyNote} role="note">
        <Shield size={14} className={styles.privacyIcon} aria-hidden />
        <span>Your details are encrypted and never shared without consent.</span>
      </div>
    </div>
  );
}
