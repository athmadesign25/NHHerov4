with open('src/app/search/page.tsx', 'r') as f:
    content = f.read()

content = content.replace('<div className={styles.filterPanel}>', '<div className={styles.filterPanel} data-lenis-prevent="true">')

with open('src/app/search/page.tsx', 'w') as f:
    f.write(content)

print("Fixed lenis scroll issues")
