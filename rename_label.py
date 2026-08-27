import re

with open("src/app/doctors/[id]/page.tsx", "r") as f:
    content = f.read()

# Replace "Select member" with "Booking for" inside the label
old_label = '/>Select member</div>'
new_label = '/>Booking for</div>'
content = content.replace(old_label, new_label)

with open("src/app/doctors/[id]/page.tsx", "w") as f:
    f.write(content)
print("Updated label text")
