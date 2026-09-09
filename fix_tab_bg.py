with open('src/components/home/HeroSearchFirst.tsx', 'r') as f:
    content = f.read()

content = content.replace('background: isActive \n                                      ? "linear-gradient(var(--color-bg-card), var(--color-bg-card)) padding-box, linear-gradient(to bottom, var(--color-emergency, #EF4444) 0%, var(--color-bg-alt) 70%) border-box" \n                                      : "var(--color-bg-alt)",',
                          'background: isActive \n                                      ? "linear-gradient(var(--color-bg-card), var(--color-bg-card)) padding-box, linear-gradient(to bottom, var(--color-emergency, #EF4444) 0%, #F1F5F9 70%) border-box" \n                                      : "#F1F5F9",')

with open('src/components/home/HeroSearchFirst.tsx', 'w') as f:
    f.write(content)

print("Updated inactive tab background to #F1F5F9")
