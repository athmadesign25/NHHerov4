import re

with open('src/app/search/page.tsx', 'r') as f:
    content = f.read()

# 1. Remove the displaySpecialties block from its current location
bad_block_regex = r'\s*// Specialties tab\n\s*const filteredSpecialties: any\[\] = \[\]; // No static mock provided initially, fallback empty if no API\n\s*const displaySpecialties = useApiData && apiData!\.specialities\n\s*\? apiData!\.specialities\.map\(\(s\) => \(\{\n\s*id: s\.id,\n\s*name: s\.name,\n\s*description: s\.description \|\| "",\n\s*image: \(s as any\)\.image \|\| "/images/misc/procedure_placeholder\.png"\n\s*\}\)\)\n\s*: filteredSpecialties;\n'
content = re.sub(bad_block_regex, '\n', content)

# 2. Insert it back immediately after useApiData definition
use_api_data_regex = r'(const useApiData = apiData !== null && query\.trim\(\) !== "";)'
new_specialties_block = """\g<1>

  // Specialties tab
  const filteredSpecialties: any[] = []; // No static mock provided initially, fallback empty if no API
  const displaySpecialties = useApiData && apiData!.specialities
    ? apiData!.specialities.map((s) => ({
        id: s.id,
        name: s.name,
        description: s.description || "",
        image: (s as any).image || "/images/misc/procedure_placeholder.png"
      }))
    : filteredSpecialties;
"""
content = re.sub(use_api_data_regex, new_specialties_block, content)

with open('src/app/search/page.tsx', 'w') as f:
    f.write(content)

print("Fixed useApiData ordering")
