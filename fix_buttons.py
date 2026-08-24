with open('src/components/home/HeroSearchFirst.tsx', 'r') as f:
    content = f.read()

old_style = 'style={{ width: "100%", padding: "12px", background: "#f8fafc", color: "var(--color-primary)", border: "1px solid #e2e8f0", borderRadius: "100px", fontWeight: 600, fontSize: "var(--font-size-sm)", cursor: "pointer", marginTop: "8px", transition: "background 0.2s" }}'
new_style = 'style={{ display: "block", padding: "10px 24px", margin: "8px auto 0", background: "transparent", color: "var(--color-primary)", border: "1px solid var(--color-border)", borderRadius: "100px", fontWeight: 600, fontSize: "var(--font-size-sm)", cursor: "pointer", transition: "var(--transition-fast)" }}'

content = content.replace(old_style, new_style)

with open('src/components/home/HeroSearchFirst.tsx', 'w') as f:
    f.write(content)

print("Updated View All buttons to secondary style")
