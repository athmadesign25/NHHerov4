import re
import sys

file_path = 'src/app/search/page.tsx'
with open(file_path, 'r') as f:
    content = f.read()

# 1. Replace the placeholder in the filter panel
old_filter_panel = """                  <div className={styles.filterPanel}>
                    {/* Basic filter sidebar placeholder for specialties */}
                    <div className={styles.filterGroup}>
                      <h4 className={styles.filterTitle}>Category</h4>
                      <p style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>Filtering options for specialties can go here.</p>
                    </div>
                  </div>"""

new_filter_panel = """                  <div className={styles.filterPanel}>
                    {/* A-Z Filter */}
                    <div className={styles.filterGroup}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                        <h4 className={styles.filterTitle} style={{ marginBottom: 0 }}>Browse by A-Z</h4>
                        {selectedAlphabets.length > 0 && (
                          <button
                            onClick={() => {
                              setSelectedAlphabets([]);
                              setIsFiltering(true);
                              setTimeout(() => setIsFiltering(false), 300);
                            }}
                            style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", color: "var(--color-emergency)", fontSize: 12, fontWeight: 700, cursor: "pointer", padding: 0 }}
                          >
                            Clear <X size={12} />
                          </button>
                        )}
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
                        {Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)).map(letter => (
                          <label key={letter} style={{
                            display: "flex", alignItems: "center", justifyContent: "center", 
                            padding: "8px 0", border: "1px solid", 
                            borderColor: selectedAlphabets.includes(letter) ? "var(--color-emergency)" : "var(--color-border)",
                            background: selectedAlphabets.includes(letter) ? "rgba(237, 28, 36, 0.08)" : "#fff",
                            color: selectedAlphabets.includes(letter) ? "var(--color-emergency)" : "var(--color-text)",
                            borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 600,
                            transition: "all 0.2s"
                          }}>
                            <input 
                              type="checkbox" 
                              style={{ display: "none" }}
                              checked={selectedAlphabets.includes(letter)}
                              onChange={() => toggleFilter(setSelectedAlphabets, letter)}
                            />
                            {letter}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>"""

content = content.replace(old_filter_panel, new_filter_panel)

# 2. Filter displaySpecialties during rendering
old_map_start = """                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(330px, 1fr))", gap: 20 }}>
                      {displaySpecialties.map((spec) => ("""

new_map_start = """                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(330px, 1fr))", gap: 20 }}>
                      {displaySpecialties
                        .filter(spec => selectedAlphabets.length === 0 || selectedAlphabets.includes(spec.name.charAt(0).toUpperCase()))
                        .map((spec) => ("""
                        
content = content.replace(old_map_start, new_map_start)

# 3. Add pill tags for active alphabet filters above the grid
old_results_header = """                    <div style={{ fontSize: 15, color: "#334155", fontWeight: 500, padding: "4px 0 0px", marginBottom: 20 }}>
                      Showing results for specialties {query ? `matching "${query}" ` : ""}in {location === "All" ? "all locations" : `${location} location`}
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(330px, 1fr))", gap: 20 }}>"""

new_results_header = """                    <div style={{ fontSize: 15, color: "#334155", fontWeight: 500, padding: "4px 0 0px", marginBottom: 20 }}>
                      Showing results for specialties {query ? `matching "${query}" ` : ""}in {location === "All" ? "all locations" : `${location} location`}
                    </div>

                    {selectedAlphabets.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
                        {selectedAlphabets.map(val => (
                          <div 
                            key={val}
                            style={{ 
                              display: "flex", alignItems: "center", gap: 6,
                              padding: "6px 12px", background: "var(--color-bg-card)",
                              border: "1px solid var(--color-border)", borderRadius: 100,
                              fontSize: 13, fontWeight: 600, color: "var(--color-text)"
                            }}
                          >
                            {val}
                            <button 
                              onClick={() => toggleFilter(setSelectedAlphabets, val)}
                              style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex", alignItems: "center", color: "var(--color-text-secondary)" }}
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(330px, 1fr))", gap: 20 }}>"""

content = content.replace(old_results_header, new_results_header)

with open(file_path, 'w') as f:
    f.write(content)

print("Added A-Z filter and logic successfully")
