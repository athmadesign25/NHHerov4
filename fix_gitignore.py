with open('.gitignore', 'r') as f:
    content = f.read()

import re

# Remove conflict markers
content = re.sub(r'<<<<<<< HEAD\n', '', content)
content = re.sub(r'=======\n', '', content)
content = re.sub(r'>>>>>>> athmahealth/homepage-V3-nahid\n', '', content)

with open('.gitignore', 'w') as f:
    f.write(content)
