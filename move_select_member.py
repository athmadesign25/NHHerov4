with open("src/app/doctors/[id]/page.tsx", "r") as f:
    content = f.read()

start_marker = "            {/* Select Member Dropdown */}"
end_marker = "            {/* Consultation Type Toggle */}"

dropdown_start = content.find(start_marker)
dropdown_end = content.find(end_marker)

if dropdown_start != -1 and dropdown_end != -1:
    dropdown_code = content[dropdown_start:dropdown_end]
    content = content[:dropdown_start] + content[dropdown_end:]

    hospital_marker = "            {/* Hospital Selector */}"
    hospital_start = content.find(hospital_marker)
    
    if hospital_start != -1:
        content = content[:hospital_start] + dropdown_code + content[hospital_start:]
        
        with open("src/app/doctors/[id]/page.tsx", "w") as f:
            f.write(content)
        print("Moved Select Member Dropdown")
    else:
        print("Could not find Hospital Selector")
else:
    print("Could not find Select Member Dropdown or Consultation Type Toggle")
