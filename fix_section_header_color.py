with open('src/components/home/HeroSearchFirst.module.css', 'r') as f:
    content = f.read()

old_block = """.sectionHeader {
  text-align: left;
  width: 100%;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--color-primary, #034ea2);"""

new_block = """.sectionHeader {
  text-align: left;
  width: 100%;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  color: #000000;"""

content = content.replace(old_block, new_block)

with open('src/components/home/HeroSearchFirst.module.css', 'w') as f:
    f.write(content)

print("Updated sectionHeader color to black")
