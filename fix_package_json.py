import json

with open('package.json', 'r') as f:
    data = json.load(f)

if "allowScripts" not in data:
    data["allowScripts"] = {}

data["allowScripts"]["sharp"] = True
data["allowScripts"]["unrs-resolver"] = True

with open('package.json', 'w') as f:
    json.dump(data, f, indent=2)

print("Added allowScripts to package.json")
