import os
import shutil
import glob
import re

ROOT_DIR = "/Users/Toshibvishalbegde/Downloads/nh-herovideo"
PUBLIC_DIR = os.path.join(ROOT_DIR, "public")
SRC_DIR = os.path.join(ROOT_DIR, "src")

# 1. Clean up Git artifacts and DS_Store
print("Cleaning up git artifacts and DS_Store...")
for root, dirs, files in os.walk(ROOT_DIR):
    if "node_modules" in root or ".git" in root:
        continue
    for file in files:
        if file.endswith(".orig") or file.endswith(".rej") or file == ".DS_Store":
            os.remove(os.path.join(root, file))
            print(f"Deleted {os.path.join(root, file)}")

# 2. Move root scripts
print("Moving root scripts...")
scripts_dir = os.path.join(ROOT_DIR, "scripts")
os.makedirs(scripts_dir, exist_ok=True)
scripts_to_move = ["fix_hydration.py", "fix_localstorage.py", "revert_portal.py", "use_portal.py", "test_script.js"]
for script in scripts_to_move:
    src = os.path.join(ROOT_DIR, script)
    if os.path.exists(src):
        shutil.move(src, os.path.join(scripts_dir, script))
        print(f"Moved {script} to scripts/")

# 3. Organize public assets
print("Organizing public assets...")
categories = {
    "logos": [
        "NH Logo_white.svg", "NH-logo.svg", "NH_Logo_white_1.png",
        "narayana_health_insurance_logo.png", "narayana_health_insurance_logo.svg",
        "narayana_health_insurance_logo_colored.png", "narayana_health_insurance_logo_white.png",
        "narayana_one_health_logo.png", "narayana_one_health_logo.svg",
        "narayana_one_health_logo_colored.png", "narayana_one_health_logo_colored.svg",
        "narayana_one_health_logo_white.png", "App store.svg", "Google play.svg"
    ],
    "videos": [
        "Hero Video.mp4", "Hero-Video-New.mp4", "Doctor patient.mp4"
    ],
    "images/backgrounds": [
        "Hero image.png", "chairman background.png", "chairman-bg.jpg", "chairman-portrait.png",
        "leadership-bg.png", "specialities-bg.png", "why-choose-nh-bg.png", "DownloadNHbanner.jpeg"
    ],
    "images/pulse-ai": [
        "pulse-tile-blood-report.png", "pulse-tile-calcium-high.png", "pulse-tile-doc-neurology.png",
        "pulse-tile-father-knee.png", "pulse-tile-hairfall-test.png", "pulse-tile-sore-throat.png",
        "pulse_find_doctor_banner.png", "pulse_health_insights_banner.png", "pulse-ai.png"
    ],
    "images/specialities": [
        "Advance Heart Care.jpg", "Advance Heart Care.png",
        "Bone & Joint.jpg", "Bone & Joint.png",
        "Brain and Spine.jpg", "Brain and Spine.png",
        "Digestive Health.png",
        "Oncology Institute.jpg", "Oncology Institute.png",
        "speciality_cardiology.png"
    ],
    "images/misc": [
        "Mockups.png", "doctor_patient.png", "doctor_avatar_female.png", "doctor_avatar_male.png",
        "patient_omkar.png"
    ]
}

file_moves = {}

for category, files in categories.items():
    cat_dir = os.path.join(PUBLIC_DIR, category)
    os.makedirs(cat_dir, exist_ok=True)
    for file in files:
        src = os.path.join(PUBLIC_DIR, file)
        if os.path.exists(src):
            dst = os.path.join(cat_dir, file)
            shutil.move(src, dst)
            # Create mapping for code replacement: old -> new
            # Important: handle spaces in URLs if they were encoded
            old_url = f"/{file}"
            new_url = f"/{category}/{file}"
            file_moves[old_url] = new_url
            print(f"Moved {file} to {category}/")

print("File moves dictionary:")
print(file_moves)

print("Organize script finished successfully.")
