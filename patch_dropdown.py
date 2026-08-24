import re
content = open('src/components/home/HeroSearchFirst.module.css').read()
content = content.replace('max-height: 440px;', 'max-height: 650px;')
content = content.replace('max-height: min(56vh, 420px);', 'max-height: min(85vh, 650px);')
open('src/components/home/HeroSearchFirst.module.css', 'w').write(content)
print("Done patching outer dropdown height")
