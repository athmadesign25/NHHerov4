import re
import sys

file_path = 'src/app/search/page.tsx'
with open(file_path, 'r') as f:
    content = f.read()

# 1. Update TABS
old_tabs = """const TABS = [
  { id: "doctors", label: "Doctors", countKey: "doctors" },
  { id: "packages_tests", label: "Health Packages & Tests", countKey: "packages_tests" },
  { id: "treatments", label: "Treatments & Procedures", countKey: "treatments" },
  { id: "articles", label: "Articles & Blogs", countKey: "articles" },
];"""
new_tabs = """const TABS = [
  { id: "doctors", label: "Doctors", countKey: "doctors" },
  { id: "specialties", label: "Specialty", countKey: "specialties" },
  { id: "packages_tests", label: "Health Packages & Tests", countKey: "packages_tests" },
  { id: "treatments", label: "Treatments & Procedures", countKey: "treatments" },
  { id: "articles", label: "Articles & Blogs", countKey: "articles" },
];"""
content = content.replace(old_tabs, new_tabs)

# 2. Add filteredSpecialties & displaySpecialties
# Find filteredTreatments definition and insert before it
filtered_treatments_regex = r'(const filteredTreatments = treatmentsData\.filter\(\(t\) => \{)'

display_specialties_code = """
  // Specialties tab
  const filteredSpecialties: any[] = []; // No static mock provided initially, fallback empty if no API
  const displaySpecialties = useApiData && apiData!.specialities
    ? apiData!.specialities.map((s) => ({
        id: s.id,
        name: s.name,
        description: s.description || "",
        image: (s as any).image || "/images/misc/procedure_placeholder.png"
      }))
    : filteredSpecialties;

  \g<1>"""
content = re.sub(filtered_treatments_regex, display_specialties_code, content)

# 3. Update counts
old_counts = """  const counts: Record<string, number | string> = {
    doctors: isFiltering && !apiData ? "…" : useApiData ? apiData!.doctors.length : filteredDoctors.length,
    hospitals: filteredHospitals.length,
    treatments: isFiltering && !apiData ? "…" : useApiData
      ? apiData!.procedures.length + apiData!.treatments.length
      : filteredTreatments.length,
    packages_tests: filteredPackages.length + filteredLabs.length,
    articles: isFiltering && !apiData ? "…" : useApiData ? apiData!.blogs.length : filteredArticles.length,
  };"""
new_counts = """  const counts: Record<string, number | string> = {
    doctors: isFiltering && !apiData ? "…" : useApiData ? apiData!.doctors.length : filteredDoctors.length,
    specialties: isFiltering && !apiData ? "…" : useApiData && apiData!.specialities ? apiData!.specialities.length : 0,
    hospitals: filteredHospitals.length,
    treatments: isFiltering && !apiData ? "…" : useApiData
      ? apiData!.procedures.length + apiData!.treatments.length
      : filteredTreatments.length,
    packages_tests: filteredPackages.length + filteredLabs.length,
    articles: isFiltering && !apiData ? "…" : useApiData ? apiData!.blogs.length : filteredArticles.length,
  };"""
content = content.replace(old_counts, new_counts)

# 4. Add UI block
# I'll insert it right before the `{activeTab === "treatments" && (` block which should be around line 1856.
treatments_block_regex = r'(\s*\{\s*activeTab === "treatments" && \()'

specialties_ui_block = """
              {/* SPECIALTIES PANEL */}
              {activeTab === "specialties" && (
                <div className={styles.doctorsLayout}>
                  <div className={styles.filterPanel}>
                    {/* Basic filter sidebar placeholder for specialties */}
                    <div className={styles.filterGroup}>
                      <h4 className={styles.filterTitle}>Category</h4>
                      <p style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>Filtering options for specialties can go here.</p>
                    </div>
                  </div>
                  <div className={styles.doctorResultsArea}>
                    <div style={{ fontSize: 15, color: "#334155", fontWeight: 500, padding: "4px 0 0px", marginBottom: 20 }}>
                      Showing results for specialties {query ? `matching "${query}" ` : ""}in {location === "All" ? "all locations" : `${location} location`}
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(330px, 1fr))", gap: 20 }}>
                      {displaySpecialties.map((spec) => (
                        <motion.div 
                          key={spec.id} 
                          whileHover={{ y: -4, boxShadow: "var(--shadow-lg)" }}
                          transition={{ duration: 0.2 }}
                          style={{ 
                            background: "var(--color-bg-card)", 
                            border: "1px solid var(--color-border)", 
                            borderRadius: 16, 
                            overflow: "hidden", 
                            boxShadow: "var(--shadow-sm)",
                            cursor: "pointer"
                          }}
                        >
                          <div style={{ width: "100%", height: 240, position: "relative", padding: 16 }}>
                            <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 12, overflow: "hidden" }}>
                              <Image 
                                src={spec.image || "/images/misc/procedure_placeholder.png"} 
                                alt={spec.name} 
                                fill 
                                style={{ objectFit: "cover" }} 
                              />
                            </div>
                          </div>
                          <div style={{ padding: "0 20px 20px" }}>
                            <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--color-text)", marginBottom: 8, lineHeight: 1.3 }}>{spec.name}</h3>
                            <p style={{ fontSize: 14, color: "var(--color-text-secondary)", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                              {spec.description || "Comprehensive care and advanced treatments for various conditions."}
                            </p>
                          </div>
                          <div style={{ padding: "16px 20px", borderTop: "1px solid var(--color-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--color-primary)" }}>View Details</span>
                            <ArrowRight size={16} color="var(--color-primary)" />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    
                    {displaySpecialties.length === 0 && !isFiltering && <EmptyState category="specialties" />}
                  </div>
                </div>
              )}
\g<1>"""
content = re.sub(treatments_block_regex, specialties_ui_block, content, count=1)

with open(file_path, 'w') as f:
    f.write(content)

print("Applied specialties tab successfully")
