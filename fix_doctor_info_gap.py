with open('src/components/home/HeroSearchFirst.module.css', 'r') as f:
    content = f.read()

old_block = """.doctorInfo {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}"""

new_block = """.doctorInfo {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}"""

content = content.replace(old_block, new_block)

with open('src/components/home/HeroSearchFirst.module.css', 'w') as f:
    f.write(content)

print("Updated doctorInfo gap to 4px")
