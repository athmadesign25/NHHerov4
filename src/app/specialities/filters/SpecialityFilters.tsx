"use client";

import { Fragment, useId, useLayoutEffect, useRef, useState } from "react";
import { motion, AnimatePresence, LayoutGroup, useReducedMotion } from "framer-motion";
import {
  Stethoscope,
  BadgeCheck,
  Building2,
  CalendarDays,
  Languages,
  UserRound,
  ChevronDown,
  Search,
  Check,
} from "lucide-react";
import { keepFilterHeadingVisible, prepareFilterListToggle } from "./filterScrolling";
import styles from "./SpecialityFilters.module.css";

export interface SpecialityFiltersProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  selectedClassification: string;
  onSelectClassification: (classification: string) => void;
  selectedLetter: string;
  onSelectLetter: (letter: string) => void;
  selectedCity?: string;
  onSelectCity?: (city: string) => void;
  categories: string[];
  categoryCounts: Record<string, number>;
  classificationCounts: Record<string, number>;
  availableLetters: Set<string>;
}

type FilterGroupKey =
  | "specialties"
  | "expertise"
  | "hospitals"
  | "availability"
  | "languages"
  | "genders";

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface FilterGroupConfig {
  key: FilterGroupKey;
  label: string;
  plural: string;
  Icon: typeof Stethoscope;
}

const GROUPS: readonly FilterGroupConfig[] = [
  { key: "specialties", label: "Speciality", plural: "specialities", Icon: Stethoscope },
  { key: "expertise", label: "Expertise", plural: "areas of expertise", Icon: BadgeCheck },
  { key: "hospitals", label: "Hospital", plural: "hospitals", Icon: Building2 },
  { key: "availability", label: "Availability", plural: "options", Icon: CalendarDays },
  { key: "languages", label: "Language", plural: "languages", Icon: Languages },
  { key: "genders", label: "Doctor gender", plural: "gender options", Icon: UserRound },
] as const;

export default function SpecialityFilters({
  selectedCategory,
  onSelectCategory,
  selectedClassification,
  onSelectClassification,
  selectedLetter,
  onSelectLetter,
  selectedCity = "All",
  onSelectCity,
  categories,
  categoryCounts,
  classificationCounts,
}: SpecialityFiltersProps) {
  const id = useId();
  const reducedMotion = Boolean(useReducedMotion());
  const transition = { duration: reducedMotion ? 0 : 0.25, ease: [0.22, 1, 0.36, 1] as const };

  // Only "specialties" is open initially, matching DoctorFilters
  const [openGroup, setOpenGroup] = useState<FilterGroupKey | null>("specialties");
  const [searches, setSearches] = useState<Partial<Record<FilterGroupKey, string>>>({});
  const [expanded, setExpanded] = useState<Partial<Record<FilterGroupKey, boolean>>>({});

  // Additional mock multi-select states for preview groups
  const [selectedSpecialities, setSelectedSpecialities] = useState<string[]>([]);
  const [selectedExpertise, setSelectedExpertise] = useState<string[]>([]);
  const [selectedHospitals, setSelectedHospitals] = useState<string[]>([]);
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);

  const finishListToggle = useRef<(() => void) | null>(null);
  useLayoutEffect(() => {
    const finish = finishListToggle.current;
    finishListToggle.current = null;
    finish?.();
  }, [expanded]);

  // Options provider for each group
  const getOptionsForGroup = (groupKey: FilterGroupKey): FilterOption[] => {
    switch (groupKey) {
      case "specialties": {
        // Full list of specialities matching Narayana Health directory
        const list = [
          "Adult Cardiac Surgery",
          "Adult Cardiology",
          "Adult Critical Care Medicine",
          "Breast Oncology & Oncoplastic Surgery",
          "Cardiologist",
          "Cardiology & Cardiac Surgery",
          "Cancer Care (Oncology)",
          "Neurology & Neurosurgery",
          "Orthopaedics & Joint Replacement",
          "Nephrology & Renal Transplant",
          "Gastroenterology & Hepatology",
          "Paediatrics & Neonatology",
          "Pulmonology & Respiratory Medicine",
          "Obstetrics & Gynaecology",
          "Urology & Andrology",
          "Vascular & Endovascular Surgery",
          "Dermatology & Cosmetology",
          "ENT / Otorhinolaryngology",
          "Endocrinology & Diabetology",
          "Rheumatology & Clinical Immunology",
          "Psychiatry & Clinical Psychology",
          "Ophthalmology",
          "Dental Sciences & Maxillofacial Surgery",
          "Haematology & BMT",
          "Plastic & Reconstructive Surgery",
          "Emergency & Trauma Care",
          "General & Laparoscopic Surgery",
          "Internal Medicine",
          "Physiotherapy & Rehabilitation",
          "Nuclear Medicine & PET-CT",
          "Interventional Radiology",
          "Anaesthesiology & Pain Management",
          "Infectious Diseases",
          "Medical Genetics",
          "Geriatric Medicine",
          "Palliative Care",
          "Robotic Surgery",
          "Liver Transplant & HPB Surgery",
          "Cardiac Electrophysiology",
        ];
        return list.map((name) => ({
          value: name,
          label: name,
          count: categoryCounts[name] || (categoryCounts[name.split(" ")[0]] ?? undefined),
        }));
      }

      case "expertise":
        return [
          { value: "Centres of Excellence", label: "Centres of Excellence", count: classificationCounts["Centres of Excellence Only"] || 8 },
          { value: "Clinical Specialities", label: "Clinical Specialities", count: 32 },
          { value: "Robotic Surgery", label: "Robotic Surgery", count: 14 },
          { value: "Organ Transplant", label: "Organ Transplant", count: 18 },
          { value: "Comprehensive Cancer Care", label: "Comprehensive Cancer Care", count: 24 },
          { value: "Pediatric Super Specialities", label: "Pediatric Super Specialities", count: 16 },
          { value: "Minimally Invasive Procedures", label: "Minimally Invasive Procedures", count: 28 },
          { value: "Critical Care & ECMO", label: "Critical Care & ECMO", count: 12 },
        ];

      case "hospitals":
        return [
          { value: "Bangalore", label: "Narayana Health City, Bangalore", count: 42 },
          { value: "Mazumdar Shaw", label: "Mazumdar Shaw Medical Centre, Bangalore", count: 38 },
          { value: "Kolkata", label: "Rabindranath Tagore Institute (RTIICS), Kolkata", count: 36 },
          { value: "Howrah", label: "Narayana Superspeciality Hospital, Howrah", count: 28 },
          { value: "Delhi NCR", label: "Narayana Hospital, Gurugram", count: 32 },
          { value: "Ahmedabad", label: "Narayana Multispeciality Hospital, Ahmedabad", count: 26 },
          { value: "Jaipur", label: "Narayana Multispeciality Hospital, Jaipur", count: 24 },
          { value: "Mumbai", label: "SRCC Children's Hospital, Mumbai", count: 22 },
        ];

      case "availability":
        return [
          { value: "24/7 Emergency Support", label: "24/7 Emergency Support", count: 15 },
          { value: "OPD Today", label: "OPD Appointments Today", count: 38 },
          { value: "Weekend Consultations", label: "Weekend Consultations Available", count: 29 },
          { value: "Video Consultation", label: "Online Video Consultation", count: 41 },
        ];

      case "languages":
        return [
          { value: "English", label: "English", count: 64 },
          { value: "Hindi", label: "Hindi", count: 52 },
          { value: "Kannada", label: "Kannada", count: 45 },
          { value: "Bengali", label: "Bengali", count: 38 },
          { value: "Telugu", label: "Telugu", count: 30 },
          { value: "Tamil", label: "Tamil", count: 26 },
        ];

      case "genders":
        return [
          { value: "Female", label: "Female doctors", count: 142 },
          { value: "Male", label: "Male doctors", count: 285 },
        ];
    }
  };

  const getSelectedValues = (groupKey: FilterGroupKey): string[] => {
    switch (groupKey) {
      case "specialties":
        if (selectedCategory && selectedCategory !== "All") {
          return Array.from(new Set([selectedCategory, ...selectedSpecialities]));
        }
        return selectedSpecialities;
      case "expertise":
        if (selectedClassification && selectedClassification !== "All") {
          return Array.from(new Set([selectedClassification, ...selectedExpertise]));
        }
        return selectedExpertise;
      case "hospitals":
        if (selectedCity && selectedCity !== "All") {
          return Array.from(new Set([selectedCity, ...selectedHospitals]));
        }
        return selectedHospitals;
      case "availability":
        return selectedAvailability;
      case "languages":
        return selectedLanguages;
      case "genders":
        return selectedGenders;
    }
  };

  const toggleOption = (groupKey: FilterGroupKey, val: string) => {
    switch (groupKey) {
      case "specialties": {
        const current = getSelectedValues("specialties");
        const next = current.includes(val) ? current.filter((x) => x !== val) : [...current, val];
        setSelectedSpecialities(next);
        // Connect with page category selection if primary selected
        if (next.length > 0) {
          onSelectCategory(next[0]);
        } else {
          onSelectCategory("All");
        }
        break;
      }
      case "expertise": {
        const current = getSelectedValues("expertise");
        const next = current.includes(val) ? current.filter((x) => x !== val) : [...current, val];
        setSelectedExpertise(next);
        if (next.includes("Centres of Excellence")) {
          onSelectClassification("Centres of Excellence Only");
        } else {
          onSelectClassification("All");
        }
        break;
      }
      case "hospitals": {
        const current = getSelectedValues("hospitals");
        const next = current.includes(val) ? current.filter((x) => x !== val) : [...current, val];
        setSelectedHospitals(next);
        if (onSelectCity) {
          onSelectCity(next[0] || "All");
        }
        break;
      }
      case "availability":
        setSelectedAvailability((prev) =>
          prev.includes(val) ? prev.filter((x) => x !== val) : [...prev, val]
        );
        break;
      case "languages":
        setSelectedLanguages((prev) =>
          prev.includes(val) ? prev.filter((x) => x !== val) : [...prev, val]
        );
        break;
      case "genders":
        setSelectedGenders((prev) =>
          prev.includes(val) ? prev.filter((x) => x !== val) : [...prev, val]
        );
        break;
    }
  };

  const clearGroup = (groupKey: FilterGroupKey) => {
    switch (groupKey) {
      case "specialties":
        setSelectedSpecialities([]);
        onSelectCategory("All");
        break;
      case "expertise":
        setSelectedExpertise([]);
        onSelectClassification("All");
        break;
      case "hospitals":
        setSelectedHospitals([]);
        if (onSelectCity) onSelectCity("All");
        break;
      case "availability":
        setSelectedAvailability([]);
        break;
      case "languages":
        setSelectedLanguages([]);
        break;
      case "genders":
        setSelectedGenders([]);
        break;
    }
  };

  return (
    <div className={styles.filters}>
      <LayoutGroup id={id}>
        {GROUPS.map((group) => {
          const options = getOptionsForGroup(group.key);
          const selected = getSelectedValues(group.key);
          const search = searches[group.key] ?? "";
          const matching = options.filter((option) =>
            option.label.toLowerCase().includes(search.trim().toLowerCase())
          );
          const isExpanded = expanded[group.key] ?? false;
          const visible = search.trim() || isExpanded
            ? matching
            : matching.filter((option, index) => index < 5 || selected.includes(option.value));
          const hidden = matching.length - visible.length;
          const Icon = group.Icon;
          const open = openGroup === group.key;
          const triggerId = `${id}-${group.key}-trigger`;
          const panelId = `${id}-${group.key}-panel`;

          return (
            <Fragment key={group.key}>
              <motion.section
                className={styles.group}
                data-filter-group="true"
                data-expanded={open}
                aria-labelledby={triggerId}
                layout={reducedMotion ? false : "position"}
                transition={transition}
              >
                <div className={styles.groupHeader} data-filter-category-header="true">
                  <h3 className={styles.groupHeading}>
                    <motion.button
                      type="button"
                      id={triggerId}
                      className={styles.groupToggle}
                      aria-expanded={open}
                      aria-controls={panelId}
                      transition={transition}
                      onClick={(event) => {
                        if (open) keepFilterHeadingVisible(event.currentTarget);
                        setOpenGroup(open ? null : group.key);
                      }}
                    >
                      <Icon size={17} className={styles.groupIcon} aria-hidden />
                      <span className={styles.groupLabel}>{group.label}</span>
                      {selected.length > 0 && (
                        <motion.span
                          className={styles.count}
                          initial={reducedMotion ? false : { opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={transition}
                        >
                          {selected.length}
                        </motion.span>
                      )}
                      <ChevronDown size={16} className={styles.chevron} aria-hidden />
                    </motion.button>
                  </h3>
                  <button
                    type="button"
                    className={styles.clearGroup}
                    disabled={selected.length === 0}
                    aria-hidden={selected.length === 0}
                    aria-label={`Clear ${group.label.toLowerCase()}`}
                    title={`Clear ${group.label.toLowerCase()}`}
                    onClick={() => {
                      clearGroup(group.key);
                      document.getElementById(triggerId)?.focus({ preventScroll: true });
                    }}
                  >
                    Clear
                  </button>
                </div>

                <div
                  id={panelId}
                  className={styles.panel}
                  aria-labelledby={triggerId}
                  aria-hidden={!open}
                  inert={!open}
                >

                  <AnimatePresence initial={false} mode="popLayout">
                    {open && (
                      <motion.div
                        key="content"
                        initial={reducedMotion ? false : { opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{
                          opacity: 0,
                          y: reducedMotion ? 0 : -4,
                          transition: { duration: reducedMotion ? 0 : 0.12 },
                        }}
                        transition={transition}
                      >
                        {options.length > 5 && (
                          <label className={styles.search}>
                            <Search size={16} aria-hidden />
                            <input
                              type="search"
                              value={search}
                              onChange={(e) =>
                                setSearches({ ...searches, [group.key]: e.target.value })
                              }
                              placeholder={`Search ${group.label.toLowerCase()}`}
                              aria-label={`Search ${group.label.toLowerCase()} filters`}
                            />
                          </label>
                        )}

                        <fieldset id={`${id}-${group.key}`} className={styles.options}>
                          <legend className={styles.srOnly}>{group.label}</legend>
                          {options.length === 0 && (
                            <p className={styles.hint}>
                              {group.label} details haven’t been provided.
                            </p>
                          )}
                          {visible.map((option) => {
                            const isSelected = selected.includes(option.value);
                            return (
                              <motion.label
                                key={option.value}
                                className={styles.option}
                                tabIndex={-1}
                                layout={reducedMotion ? false : "position"}
                                initial={reducedMotion ? false : { opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={transition}
                              >
                                <span className={styles.checkControl}>
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => toggleOption(group.key, option.value)}
                                  />
                                  <Check
                                    size={14}
                                    strokeWidth={2}
                                    absoluteStrokeWidth
                                    className={styles.checkIcon}
                                    aria-hidden
                                  />
                                </span>
                                <span className={styles.optionLabel}>{option.label}</span>
                                {option.count !== undefined && (
                                  <span
                                    className={styles.resultCount}
                                    aria-label={`${option.count} matching`}
                                  >
                                    {option.count}
                                  </span>
                                )}
                              </motion.label>
                            );
                          })}
                          {options.length > 0 && matching.length === 0 && (
                            <p className={styles.hint} role="status">
                              No matches. Try another search.
                            </p>
                          )}
                        </fieldset>

                        {!search.trim() && (hidden > 0 || isExpanded) && options.length > 5 && (
                          <button
                            type="button"
                            className={styles.showMore}
                            aria-expanded={Boolean(isExpanded)}
                            aria-controls={`${id}-${group.key}`}
                            aria-label={
                              isExpanded
                                ? `Show fewer ${group.plural}`
                                : `Show ${hidden} more ${group.plural}`
                            }
                            onClick={(event) => {
                              finishListToggle.current = prepareFilterListToggle(
                                event.currentTarget,
                                !isExpanded
                              );
                              setExpanded((prev) => ({
                                ...prev,
                                [group.key]: !prev[group.key],
                              }));
                            }}
                          >
                            {isExpanded ? "Show less" : `Show ${hidden} more`}
                          </button>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.section>
            </Fragment>
          );
        })}
      </LayoutGroup>
    </div>
  );
}
