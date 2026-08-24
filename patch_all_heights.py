import re
content = open('src/components/home/HeroSearchFirst.module.css').read()
content = content.replace('max-height: min(70vh, 580px);', 'max-height: min(85vh, 650px);')
content = content.replace('max-height: 580px;', 'max-height: 650px;')
content = content.replace('max-height: 350px;', 'max-height: 650px;')
content = content.replace('max-height: 300px;', 'max-height: 650px;')
content = content.replace('max-height: 400px;', 'max-height: 650px;')
open('src/components/home/HeroSearchFirst.module.css', 'w').write(content)
print("Done patching all heights")
