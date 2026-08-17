with open("src/components/pulse-ai/PulseAIWorkspace.tsx", "r") as f:
    content = f.read()

import re

# Remove the useEffect that reads from localStorage
target = """  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('pulse_hide_disclaimer') === 'true') {
      setShowDisclaimer(false);
    }
  }, []);"""
content = content.replace(target, "")

# Remove localStorage.setItem from the onClick
old_onclick = "onClick={(e) => { e.stopPropagation(); setShowDisclaimer(false); localStorage.setItem('pulse_hide_disclaimer', 'true'); }}"
new_onclick = "onClick={(e) => { e.stopPropagation(); setShowDisclaimer(false); }}"
content = content.replace(old_onclick, new_onclick)

with open("src/components/pulse-ai/PulseAIWorkspace.tsx", "w") as f:
    f.write(content)
