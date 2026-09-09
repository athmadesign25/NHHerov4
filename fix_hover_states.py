with open('src/components/home/HeroSearchFirst.module.css', 'r') as f:
    content = f.read()

# specCard:hover
old_spec = """.specCard:hover {
  background: #ffffff;
  border-color: var(--color-primary, #034ea2);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(3, 78, 162, 0.08);
}"""

new_spec = """.specCard:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(3, 78, 162, 0.08);
}"""

content = content.replace(old_spec, new_spec)

# treatmentCard:hover
old_treatment = """.treatmentCard:hover {
  background: #ffffff;
  border-color: var(--color-primary, #034ea2);
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(3, 78, 162, 0.08);
}"""

new_treatment = """.treatmentCard:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(3, 78, 162, 0.08);
}"""

content = content.replace(old_treatment, new_treatment)

with open('src/components/home/HeroSearchFirst.module.css', 'w') as f:
    f.write(content)

print("Simplified hover states for spec and treatment cards")
