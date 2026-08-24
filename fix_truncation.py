import re

with open('src/app/search/page.tsx', 'r') as f:
    content = f.read()

# 1. Clamp doctor name to max 2 lines
old_h3 = """<h3 style={{ fontSize: "var(--font-size-lg)", fontWeight: 700, color: "var(--color-text)", marginBottom: 4, cursor: "pointer", transition: "color 0.15s" }}>"""
new_h3 = """<h3 style={{ fontSize: "var(--font-size-lg)", fontWeight: 700, color: "var(--color-text)", marginBottom: 4, cursor: "pointer", transition: "color 0.15s", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", textOverflow: "ellipsis" }}>"""
content = content.replace(old_h3, new_h3)

# 2. Adjust degree clamping based on name length
old_degree = """<p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", textOverflow: "ellipsis" }}>{doc.degrees}</p>"""
new_degree = """<p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", display: "-webkit-box", WebkitLineClamp: doc.name.length > 22 ? 1 : 2, WebkitBoxOrient: "vertical", overflow: "hidden", textOverflow: "ellipsis" }}>{doc.degrees}</p>"""
content = content.replace(old_degree, new_degree)

with open('src/app/search/page.tsx', 'w') as f:
    f.write(content)

print("Updated truncation logic")
