"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { User, ChevronDown, Check, Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./MemberSelector.module.css";
import type { PatientRelation, Gender } from "@/features/booking/types";

export interface FamilyMember {
  id: string | number;
  name: string;
  relation: PatientRelation;
  age?: string;
  gender?: Gender | "";
  img?: string;
}

const DEFAULT_MEMBERS: FamilyMember[] = [
  { id: 1, name: "Aditya", relation: "self", img: "https://i.pravatar.cc/150?img=11", age: "32", gender: "male" },
  { id: 2, name: "Aarav", relation: "child", img: "https://i.pravatar.cc/150?img=12", age: "6", gender: "male" },
  { id: 3, name: "Hazel", relation: "spouse", img: "https://i.pravatar.cc/150?img=5", age: "30", gender: "female" },
  { id: 4, name: "Rahul", relation: "parent", img: "https://i.pravatar.cc/150?img=8", age: "62", gender: "male" },
];

interface MemberSelectorProps {
  selectedMemberId?: string | number;
  onSelectMember: (member: FamilyMember) => void;
}

export default function MemberSelector({ selectedMemberId, onSelectMember }: MemberSelectorProps) {
  const [members, setMembers] = useState<FamilyMember[]>(DEFAULT_MEMBERS);
  const [activeId, setActiveId] = useState<string | number>(selectedMemberId ?? 1);
  const [isOpen, setIsOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New patient form fields
  const [newName, setNewName] = useState("");
  const [newRelation, setNewRelation] = useState<PatientRelation>("child");
  const [newAge, setNewAge] = useState("");
  const [newGender, setNewGender] = useState<Gender>("male");

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load custom members from localStorage if available
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("nh_family_members");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMembers(parsed);
          }
        }
      } catch {
        // use defaults
      }
    }
  }, []);

  // Sync external selectedMemberId
  useEffect(() => {
    if (selectedMemberId !== undefined) {
      setActiveId(selectedMemberId);
    }
  }, [selectedMemberId]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeMember = members.find((m) => String(m.id) === String(activeId)) || members[0];

  const handleSelect = (member: FamilyMember) => {
    setActiveId(member.id);
    setIsOpen(false);
    onSelectMember(member);
  };

  const handleOpenAddModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    setNewName("");
    setNewAge("");
    setNewRelation("child");
    setNewGender("male");
    setIsAddModalOpen(true);
  };

  const handleSaveNewPatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newMember: FamilyMember = {
      id: Date.now(),
      name: newName.trim(),
      relation: newRelation,
      age: newAge.trim(),
      gender: newGender,
      img: newGender === "female" ? "https://i.pravatar.cc/150?img=47" : "https://i.pravatar.cc/150?img=53",
    };

    const updated = [...members, newMember];
    setMembers(updated);
    setActiveId(newMember.id);
    setIsAddModalOpen(false);

    try {
      localStorage.setItem("nh_family_members", JSON.stringify(updated));
    } catch {
      // storage unavailable
    }

    onSelectMember(newMember);
  };

  return (
    <div className={styles.container} ref={dropdownRef}>
      <div className={styles.label}>
        <User size={18} className={styles.labelIcon} aria-hidden />
        Select member
      </div>

      <button
        type="button"
        className={[styles.trigger, isOpen ? styles.triggerOpen : ""].join(" ")}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className={styles.triggerLeft}>
          {activeMember?.img ? (
            <img src={activeMember.img} alt={activeMember.name} className={styles.avatar} />
          ) : (
            <div className={styles.avatar} />
          )}
          <span className={styles.name}>{activeMember?.name}</span>
          <span className={styles.relationTag}>
            {activeMember?.relation === "self" ? "You" : activeMember?.relation}
          </span>
        </div>
        <ChevronDown
          size={16}
          className={[styles.chevron, isOpen ? styles.chevronRotated : ""].join(" ")}
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={styles.dropdown}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.16 }}
            role="listbox"
          >
            {members.map((member) => {
              const isActive = String(member.id) === String(activeId);
              return (
                <button
                  key={member.id}
                  type="button"
                  className={[styles.memberOption, isActive ? styles.memberOptionActive : ""].join(" ")}
                  onClick={() => handleSelect(member)}
                  role="option"
                  aria-selected={isActive}
                >
                  <div className={styles.optionLeft}>
                    {member.img ? (
                      <img src={member.img} alt={member.name} className={styles.optionAvatar} />
                    ) : (
                      <div className={styles.optionAvatar} />
                    )}
                    <div>
                      <div className={styles.optionName}>{member.name}</div>
                      <div className={styles.optionMeta}>
                        <span className={styles.relationTag}>
                          {member.relation === "self" ? "You" : member.relation}
                        </span>
                        {member.age && (
                          <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
                            • {member.age} yrs
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {isActive && <Check size={16} className={styles.optionCheck} />}
                </button>
              );
            })}

            <div className={styles.divider} />

            <button
              type="button"
              className={styles.addPatientBtn}
              onClick={handleOpenAddModal}
            >
              <Plus size={16} />
              Add new patient / member
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Patient Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className={styles.modalBackdrop} onClick={() => setIsAddModalOpen(false)}>
            <motion.div
              className={styles.modalCard}
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.94, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 16 }}
              transition={{ duration: 0.2 }}
            >
              <div className={styles.modalHeader}>
                <h3 className={styles.modalTitle}>Add Family Member</h3>
                <button
                  type="button"
                  className={styles.closeBtn}
                  onClick={() => setIsAddModalOpen(false)}
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveNewPatient} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className={styles.formInput}
                    autoFocus
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Relationship</label>
                  <div className={styles.pillRow}>
                    {(["spouse", "child", "parent", "other"] as PatientRelation[]).map((rel) => (
                      <button
                        key={rel}
                        type="button"
                        className={[styles.pillBtn, newRelation === rel ? styles.pillBtnActive : ""].join(" ")}
                        onClick={() => setNewRelation(rel)}
                      >
                        {rel.charAt(0).toUpperCase() + rel.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Age</label>
                    <input
                      type="number"
                      placeholder="e.g. 28"
                      min="1"
                      max="120"
                      value={newAge}
                      onChange={(e) => setNewAge(e.target.value)}
                      className={styles.formInput}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Gender</label>
                    <div className={styles.pillRow}>
                      {(["male", "female", "other"] as Gender[]).map((g) => (
                        <button
                          key={g}
                          type="button"
                          className={[styles.pillBtn, newGender === g ? styles.pillBtnActive : ""].join(" ")}
                          onClick={() => setNewGender(g)}
                          style={{ padding: "6px 10px" }}
                        >
                          {g === "male" ? "M" : g === "female" ? "F" : "Other"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className={styles.modalFooter}>
                  <button
                    type="button"
                    className={styles.btnCancel}
                    onClick={() => setIsAddModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={styles.btnSave}
                    disabled={!newName.trim()}
                  >
                    Save & Select
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
