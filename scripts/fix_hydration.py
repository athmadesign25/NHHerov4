with open("src/components/pulse-ai/PulseAIWorkspace.tsx", "r") as f:
    content = f.read()

import re

# Replace useState initialization
old_use_state = """  const [showDisclaimer, setShowDisclaimer] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('pulse_hide_disclaimer') !== 'true';
    }
    return true;
  });"""

new_use_state = """  const [showDisclaimer, setShowDisclaimer] = useState(true);"""

content = content.replace(old_use_state, new_use_state)

# Find where to inject the useEffect
# We can just put it right after the initialQueryProcessed ref (line 3760ish)
target = "const initialQueryProcessed = useRef(false);"
new_target = """  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('pulse_hide_disclaimer') === 'true') {
      setShowDisclaimer(false);
    }
  }, []);

  const initialQueryProcessed = useRef(false);"""

content = content.replace(target, new_target)

with open("src/components/pulse-ai/PulseAIWorkspace.tsx", "w") as f:
    f.write(content)
