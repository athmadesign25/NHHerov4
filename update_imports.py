import os
import re

file_moves = {'/NH Logo_white.svg': '/logos/NH Logo_white.svg', '/NH-logo.svg': '/logos/NH-logo.svg', '/NH_Logo_white_1.png': '/logos/NH_Logo_white_1.png', '/narayana_health_insurance_logo.png': '/logos/narayana_health_insurance_logo.png', '/narayana_health_insurance_logo.svg': '/logos/narayana_health_insurance_logo.svg', '/narayana_health_insurance_logo_colored.png': '/logos/narayana_health_insurance_logo_colored.png', '/narayana_health_insurance_logo_white.png': '/logos/narayana_health_insurance_logo_white.png', '/narayana_one_health_logo.png': '/logos/narayana_one_health_logo.png', '/narayana_one_health_logo.svg': '/logos/narayana_one_health_logo.svg', '/narayana_one_health_logo_colored.png': '/logos/narayana_one_health_logo_colored.png', '/narayana_one_health_logo_colored.svg': '/logos/narayana_one_health_logo_colored.svg', '/narayana_one_health_logo_white.png': '/logos/narayana_one_health_logo_white.png', '/App store.svg': '/logos/App store.svg', '/Google play.svg': '/logos/Google play.svg', '/Hero Video.mp4': '/videos/Hero Video.mp4', '/Hero-Video-New.mp4': '/videos/Hero-Video-New.mp4', '/Doctor patient.mp4': '/videos/Doctor patient.mp4', '/Hero image.png': '/images/backgrounds/Hero image.png', '/chairman background.png': '/images/backgrounds/chairman background.png', '/chairman-bg.jpg': '/images/backgrounds/chairman-bg.jpg', '/chairman-portrait.png': '/images/backgrounds/chairman-portrait.png', '/leadership-bg.png': '/images/backgrounds/leadership-bg.png', '/specialities-bg.png': '/images/backgrounds/specialities-bg.png', '/why-choose-nh-bg.png': '/images/backgrounds/why-choose-nh-bg.png', '/DownloadNHbanner.jpeg': '/images/backgrounds/DownloadNHbanner.jpeg', '/pulse-tile-blood-report.png': '/images/pulse-ai/pulse-tile-blood-report.png', '/pulse-tile-calcium-high.png': '/images/pulse-ai/pulse-tile-calcium-high.png', '/pulse-tile-doc-neurology.png': '/images/pulse-ai/pulse-tile-doc-neurology.png', '/pulse-tile-father-knee.png': '/images/pulse-ai/pulse-tile-father-knee.png', '/pulse-tile-hairfall-test.png': '/images/pulse-ai/pulse-tile-hairfall-test.png', '/pulse-tile-sore-throat.png': '/images/pulse-ai/pulse-tile-sore-throat.png', '/pulse_find_doctor_banner.png': '/images/pulse-ai/pulse_find_doctor_banner.png', '/pulse_health_insights_banner.png': '/images/pulse-ai/pulse_health_insights_banner.png', '/pulse-ai.png': '/images/pulse-ai/pulse-ai.png', '/Advance Heart Care.jpg': '/images/specialities/Advance Heart Care.jpg', '/Advance Heart Care.png': '/images/specialities/Advance Heart Care.png', '/Bone & Joint.jpg': '/images/specialities/Bone & Joint.jpg', '/Bone & Joint.png': '/images/specialities/Bone & Joint.png', '/Brain and Spine.jpg': '/images/specialities/Brain and Spine.jpg', '/Brain and Spine.png': '/images/specialities/Brain and Spine.png', '/Digestive Health.png': '/images/specialities/Digestive Health.png', '/Oncology Institute.jpg': '/images/specialities/Oncology Institute.jpg', '/Oncology Institute.png': '/images/specialities/Oncology Institute.png', '/speciality_cardiology.png': '/images/specialities/speciality_cardiology.png', '/Mockups.png': '/images/misc/Mockups.png', '/doctor_patient.png': '/images/misc/doctor_patient.png', '/doctor_avatar_female.png': '/images/misc/doctor_avatar_female.png', '/doctor_avatar_male.png': '/images/misc/doctor_avatar_male.png', '/patient_omkar.png': '/images/misc/patient_omkar.png'}

SRC_DIR = "/Users/Toshibvishalbegde/Downloads/nh-herovideo/src"

for root, dirs, files in os.walk(SRC_DIR):
    for file in files:
        if file.endswith((".tsx", ".ts", ".css", ".js", ".jsx")):
            filepath = os.path.join(root, file)
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()
            
            modified = False
            for old_url, new_url in file_moves.items():
                if old_url in content:
                    content = content.replace(f'"{old_url}"', f'"{new_url}"')
                    content = content.replace(f"'{old_url}'", f"'{new_url}'")
                    content = content.replace(f'`{old_url}`', f'`{new_url}`')
                    modified = True
            
            if modified:
                with open(filepath, "w", encoding="utf-8") as f:
                    f.write(content)
                print(f"Updated references in {filepath}")

print("Update imports finished.")
