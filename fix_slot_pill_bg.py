with open('src/components/home/HeroSearchFirst.tsx', 'r') as f:
    content = f.read()

content = content.replace('background: "transparent"', 'background: "#ffffff"')

with open('src/components/home/HeroSearchFirst.tsx', 'w') as f:
    f.write(content)

print("Changed fill to white for slot pills in HeroSearchFirst")
