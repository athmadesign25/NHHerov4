with open('src/components/home/HeroSearchFirst.module.css', 'r') as f:
    content = f.read()

# Replace specifically the color under .doctorSpec at around line 1157
old_block = """.doctorSpec {
  font-size: 11px;
  font-weight: 700;
  color: var(--color-primary, #034ea2);"""
new_block = """.doctorSpec {
  font-size: 11px;
  font-weight: 700;
  color: var(--color-text-secondary);"""

content = content.replace(old_block, new_block)

with open('src/components/home/HeroSearchFirst.module.css', 'w') as f:
    f.write(content)

print("Updated doctorSpec color to gray")
