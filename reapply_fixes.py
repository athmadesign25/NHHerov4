import re

with open("src/app/doctors/[id]/page.tsx", "r") as f:
    content = f.read()

# Fix font size
content = content.replace(
    '<h1 style={{ fontSize: "var(--font-size-2xl)", fontWeight: 800, color: "var(--color-text)", margin: 0, letterSpacing: "-0.01em" }}>Select date & slot</h1>',
    '<h1 style={{ fontSize: "var(--font-size-xl)", fontWeight: 800, color: "var(--color-text)", margin: 0, letterSpacing: "-0.01em" }}>Select date & slot</h1>'
)

# Fix button border radius (only the Select Member button)
old_button = 'onClick={() => setIsMembersExpanded(!isMembersExpanded)}\n                  style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: "1.5px solid var(--color-border)", background: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}'
new_button = 'onClick={() => setIsMembersExpanded(!isMembersExpanded)}\n                  style={{ width: "100%", padding: "12px 16px", borderRadius: 100, border: "1.5px solid var(--color-border)", background: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}'
content = content.replace(old_button, new_button)

with open("src/app/doctors/[id]/page.tsx", "w") as f:
    f.write(content)
print("Reapplied fixes")
