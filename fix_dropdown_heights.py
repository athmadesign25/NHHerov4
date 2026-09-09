import re

content = open('src/components/home/HeroSearchFirst.module.css', 'r').read()

# Lines to change based on the grep output:
# 334:  max-height: min(85vh, 650px); -> dropdownTabContent
# 656:  max-height: min(85vh, 650px); -> mobile .dropdown
# 844:  max-height: 650px; -> standard .dropdown
# 1037: max-height: 650px; -> standard .dropdownTabContent
# 1365: max-height: 650px; -> media query .dropdown
# 1413: max-height: 650px; -> media query .dropdown
# 1776: max-height: 600px; -> pulsePreviewWrapper
# 1783: max-height: 650px; -> pulse container?

# We will just replace all these manually since we know exactly what we did in the last script.

# Outer containers
content = content.replace('max-height: 650px;', 'max-height: min(75vh, 580px);') 
content = content.replace('max-height: min(85vh, 650px);', 'max-height: min(65vh, 540px);')

open('src/components/home/HeroSearchFirst.module.css', 'w').write(content)
print("Done fixing heights dynamically")
