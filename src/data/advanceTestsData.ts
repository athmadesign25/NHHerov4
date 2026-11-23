export interface AdvanceTestItem {
  id: string;
  name: string;
  category: string;
  desc: string;
  image: string;
  sampleType: string;
  turnaroundTime: string;
  accuracy?: string;
  badge?: string;
}

export const ADVANCE_TESTS_DATA: AdvanceTestItem[] = [
  {
    id: "ngs-genomics",
    name: "Next-Generation Sequencing (NGS) Comprehensive Genomic Profiling",
    category: "Precision Genomics",
    desc: "Multi-gene profiling of 500+ somatic and germline alterations. Identifies actionable driver mutations (EGFR, ALK, KRAS, BRAF, BRCA1/2) to match patients with targeted therapies and clinical trials.",
    image: "/images/procedures/genomics_hd.jpg",
    sampleType: "Tumour Tissue / Blood",
    turnaroundTime: "7 - 10 Days",
    accuracy: "99.9% Precision",
    badge: "Gold Standard",
  },
  {
    id: "pet-ct-imaging",
    name: "Digital PET-CT Whole-Body Molecular Imaging",
    category: "Molecular Imaging",
    desc: "Sub-millimeter resolution molecular scanner using 18F-FDG and Gallium-68 tracers. Enables ultra-precise cancer staging, metabolic tumor volume calculation, and early treatment response assessment.",
    image: "/images/procedures/petct_hd.jpg",
    sampleType: "Metabolic Tracer",
    turnaroundTime: "Same Day Report",
    accuracy: "Sub-mm Resolution",
    badge: "Ultra-High Def",
  },
  {
    id: "liquid-biopsy",
    name: "Liquid Biopsy & ctDNA Minimal Residual Disease (MRD)",
    category: "Liquid Biopsy",
    desc: "Non-invasive peripheral blood test detecting circulating tumour DNA (ctDNA). Allows real-time surveillance of minimal residual disease and detects early relapse up to 9 months before radiological visibility.",
    image: "/images/procedures/procedure_surgery.png",
    sampleType: "Peripheral Blood (10ml)",
    turnaroundTime: "5 - 7 Days",
    accuracy: "Zero Invasiveness",
    badge: "Non-Invasive",
  },
  {
    id: "immunohistochemistry-pdl1",
    name: "Multiplex Immunohistochemistry & PD-L1 Biomarker Assay",
    category: "Immunopathology",
    desc: "Spatial tissue biomarker analysis evaluating tumor immune microenvironment checkpoints (PD-L1, MMR/MSI, HER2) to determine eligibility for immune checkpoint inhibitors and targeted monoclonal antibodies.",
    image: "/images/procedures/immunotherapy_hd.jpg",
    sampleType: "Biopsy Tissue",
    turnaroundTime: "48 - 72 Hours",
    accuracy: "Immuno-Stratified",
    badge: "Biomarker Match",
  },
  {
    id: "mpmri-fusion",
    name: "Multiparametric MRI (mpMRI) & Fusion Diagnostic Imaging",
    category: "Advanced Radiology",
    desc: "3.0 Tesla high-field multiparametric MRI combining diffusion-weighted and dynamic contrast-enhanced sequencing for deep anatomical delineation and targeted cognitive fusion biopsy guidance.",
    image: "/images/procedures/procedure_mri.png",
    sampleType: "3.0T MRI Scan",
    turnaroundTime: "Same Day Report",
    accuracy: "3D Targeting",
    badge: "3.0 Tesla",
  },
  {
    id: "flow-cytometry",
    name: "High-Parameter Flow Cytometry & Immunophenotyping",
    category: "Haemato-Pathology",
    desc: "Rapid 10-color spectral flow cytometric immunophenotyping of bone marrow and peripheral blood for definitive leukaemia/lymphoma subtyping, lineage determination, and 10⁻⁵ MRD monitoring.",
    image: "/images/procedures/chemotherapy_hd.jpg",
    sampleType: "Bone Marrow / Blood",
    turnaroundTime: "24 - 48 Hours",
    accuracy: "10-Color Spectral",
    badge: "Rapid Diagnostic",
  },
  {
    id: "fish-cytogenetics",
    name: "Fluorescence In Situ Hybridization (FISH) Cytogenetics",
    category: "Cytogenetics",
    desc: "High-sensitivity molecular probe detection of specific chromosomal translocations, gene amplifications, and structural deletions (BCR-ABL, HER2, MYC) for precision prognostic risk stratification.",
    image: "/images/procedures/radiation_oncology_hd.jpg",
    sampleType: "Cellular Nuclei",
    turnaroundTime: "3 - 5 Days",
    accuracy: "Single-Cell Probe",
    badge: "Cytogenetic Probe",
  },
];
