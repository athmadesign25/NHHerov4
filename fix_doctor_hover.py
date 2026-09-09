with open('src/components/home/HeroSearchFirst.module.css', 'r') as f:
    content = f.read()

old_block = """.doctorCard:hover {
  background: #ffffff;
  border-color: var(--color-primary, #034ea2);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(3, 78, 162, 0.08);
}"""

new_block = """.doctorCard:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(3, 78, 162, 0.08);
}"""

content = content.replace(old_block, new_block)

with open('src/components/home/HeroSearchFirst.module.css', 'w') as f:
    f.write(content)

print("Simplified doctor card hover")
