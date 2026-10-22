// Editorial selection from the supplied disease/condition reference.
// Alphabetical down each column, then continuing into the next column.
export const DOCTOR_CONDITIONS = [
  "Acid Reflux", "Alzheimer's Disease", "Anxiety Disorders", "Asthma",
  "Atrial Fibrillation", "Attention Deficit Hyperactivity Disorder", "Autism Spectrum Disorder",
  "Bipolar Disorder", "Cancer", "Chronic Kidney Disease", "COPD", "Crohn's Disease",
  "Diabetes", "Eczema", "Epilepsy", "Heart Disease", "Hepatitis",
  "Hypertension", "Irritable Bowel Syndrome", "Lupus", "Multiple Sclerosis",
  "Osteoporosis", "Parkinson's Disease", "Polycystic Ovary Syndrome", "Psoriasis", "PTSD",
  "Sleep Apnea", "Stroke", "Thyroid Disorders", "Urinary Tract Infection",
].sort((a, b) => a.localeCompare(b, "en", { sensitivity: "base" }));
