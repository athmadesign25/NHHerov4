with open('src/components/home/HeroSearchFirst.tsx', 'r') as f:
    content = f.read()

old_str = 'style={{ display: "flex", gap: "2px", overflowX: "auto", scrollbarWidth: "none", borderBottom: "1px solid var(--color-border)", marginBottom: "16px", background: "var(--color-bg-alt)" }}'
new_str = 'style={{ display: "flex", gap: "2px", overflowX: "auto", scrollbarWidth: "none", borderBottom: "1px solid var(--color-border)", marginBottom: "16px", background: "var(--color-bg-alt)", borderRadius: "16px 16px 0 0" }}'

content = content.replace(old_str, new_str)

with open('src/components/home/HeroSearchFirst.tsx', 'w') as f:
    f.write(content)

print("Added border radius to tabs container")
