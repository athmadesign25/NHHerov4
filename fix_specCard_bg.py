with open('src/components/home/HeroSearchFirst.module.css', 'r') as f:
    content = f.read()

old_block = """.specCard {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  height: 60px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;"""

new_block = """.specCard {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  height: 60px;
  background: linear-gradient(to right, #ffffff 0%, #EBF3FC 100%);
  border: 1px solid #e2e8f0;"""

content = content.replace(old_block, new_block)

with open('src/components/home/HeroSearchFirst.module.css', 'w') as f:
    f.write(content)

print("Updated specCard background")
