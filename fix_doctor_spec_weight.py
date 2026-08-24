with open('src/components/home/HeroSearchFirst.module.css', 'r') as f:
    content = f.read()

old_block = """.doctorSpec {
  font-size: 11px;
  font-weight: 700;
  color: var(--color-text-secondary);"""
new_block = """.doctorSpec {
  font-size: 11px;
  font-weight: 500;
  color: var(--color-text-secondary);"""

content = content.replace(old_block, new_block)

with open('src/components/home/HeroSearchFirst.module.css', 'w') as f:
    f.write(content)

print("Updated doctorSpec font weight to medium (500)")
