with open('src/components/home/HeroSearchFirst.tsx', 'r') as f:
    content = f.read()

import re

# Find the exact block we want to replace
start_str = "                          <div className={styles.dropdownTabs}>"
end_str = "                          </div>\n\n                          <div className={styles.dropdownTabContent}"

start_idx = content.find(start_str)
end_idx = content.find(end_str)

if start_idx == -1 or end_idx == -1:
    print("Could not find block to replace")
    exit(1)

old_block = content[start_idx:end_idx]

# Define the new block
new_block = """                          <div style={{ display: "flex", gap: "2px", overflowX: "auto", scrollbarWidth: "none", borderBottom: "1px solid var(--color-border)", marginBottom: "16px" }}>
                            {[
                              { id: "doctors", label: "Doctors", count: tabCounts.doctors },
                              { id: "specialties", label: "Specialty", count: tabCounts.specialties },
                              { id: "treatments_tests", label: "Treatments & Procedures", count: tabCounts.treatments },
                              { id: "articles", label: "Articles & Blogs", count: tabCounts.articles }
                            ].map((tab) => {
                              const isActive = activeDropdownTab === tab.id;
                              return (
                                <button
                                  key={tab.id}
                                  type="button"
                                  onClick={() => setActiveDropdownTab(tab.id as any)}
                                  style={{
                                    position: "relative",
                                    padding: "12px 18px",
                                    background: isActive 
                                      ? "linear-gradient(var(--color-bg-card), var(--color-bg-card)) padding-box, linear-gradient(to bottom, var(--color-emergency, #EF4444) 0%, var(--color-bg-alt) 70%) border-box" 
                                      : "var(--color-bg-alt)",
                                    border: "1px solid transparent",
                                    borderRadius: "16px 16px 0 0",
                                    fontSize: "14px",
                                    fontWeight: 600,
                                    color: isActive ? "#000000" : "#64748B",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    marginBottom: "-1px",
                                    transition: "0.2s",
                                    whiteSpace: "nowrap"
                                  }}
                                >
                                  {tab.label}
                                  <span style={{
                                    fontSize: "11px", 
                                    background: isActive ? "rgba(3, 78, 162, 0.08)" : "#E2E8F0", 
                                    color: isActive ? "#000000" : "#64748B",
                                    padding: "2px 6px",
                                    borderRadius: "10px",
                                    fontWeight: 500
                                  }}>
                                    {tab.count < 0 ? "…" : tab.count}
                                  </span>
                                  {isActive && (
                                    <div style={{
                                      position: "absolute",
                                      bottom: 0,
                                      left: "calc(50% - 18px)",
                                      width: "36px",
                                      height: "2px",
                                      background: "var(--color-emergency, #EF4444)",
                                      borderRadius: "4px",
                                      transformOrigin: "center bottom"
                                    }} />
                                  )}
                                </button>
                              );
                            })}
"""

content = content.replace(old_block, new_block)

with open('src/components/home/HeroSearchFirst.tsx', 'w') as f:
    f.write(content)

print("Updated dropdown tabs to use new styling")
