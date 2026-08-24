with open('src/components/home/HeroSearchFirst.tsx', 'r') as f:
    content = f.read()

old_str = 'style={{ display: "flex", gap: "2px", overflowX: "auto", scrollbarWidth: "none", borderBottom: "1px solid var(--color-border)", marginBottom: "16px" }}'
new_str = 'style={{ display: "flex", gap: "2px", overflowX: "auto", scrollbarWidth: "none", borderBottom: "1px solid var(--color-border)", marginBottom: "16px", background: "var(--color-bg-alt)" }}'

content = content.replace(old_str, new_str)

with open('src/components/home/HeroSearchFirst.tsx', 'w') as f:
    f.write(content)

print("Added fill color to tabs container")
