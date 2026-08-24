import re
content = open('src/app/search/page.tsx').read()

content = content.replace('filteredDoctors.map', 'displayDoctors.map')
content = content.replace('filteredTreatments.map', 'displayTreatments.map')
content = content.replace('filteredArticles.map', 'displayArticles.map')

content = content.replace('filteredDoctors.length === 0', 'displayDoctors.length === 0')
content = content.replace('filteredTreatments.length === 0', 'displayTreatments.length === 0')
content = content.replace('filteredArticles.length === 0', 'displayArticles.length === 0')

# Also the branch diff had `!isFiltering` for treatments and articles empty state
content = content.replace('displayTreatments.length === 0 && <EmptyState category="treatments" />', 'displayTreatments.length === 0 && !isFiltering && <EmptyState category="treatments" />')
content = content.replace('displayArticles.length === 0 && <EmptyState category="articles" />', 'displayArticles.length === 0 && !isFiltering && <EmptyState category="articles" />')

open('src/app/search/page.tsx', 'w').write(content)
print("Done mapping display data")
