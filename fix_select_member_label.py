import re

with open("src/app/doctors/[id]/page.tsx", "r") as f:
    content = f.read()

# Add User to imports
content = content.replace(
    'ChevronRight, ChevronDown } from "lucide-react";',
    'ChevronRight, ChevronDown, User } from "lucide-react";'
)

# Update Select member label
old_label = '<div style={{ fontSize: "var(--font-size-base)", fontWeight: 600, color: "var(--color-text)", marginBottom: 12 }}>Select member</div>'
new_label = '<div style={{ fontSize: "var(--font-size-base)", fontWeight: 500, color: "var(--color-text)", display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}><User size={18} style={{ color: "var(--color-text)" }} />Select member</div>'
content = content.replace(old_label, new_label)

with open("src/app/doctors/[id]/page.tsx", "w") as f:
    f.write(content)
print("Updated Select member label")
