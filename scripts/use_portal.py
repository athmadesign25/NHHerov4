with open("src/components/pulse-ai/PulseAIWorkspace.tsx", "r") as f:
    content = f.read()

import re

if "import { createPortal } from" not in content:
    content = content.replace('import { useState, useEffect, useRef } from "react";', 'import { useState, useEffect, useRef } from "react";\nimport { createPortal } from "react-dom";')

old_return = """  return (
    <>
      {/* PulseTrigger has been removed because it is now triggered by the Hero search bar */}
      <AnimatePresence>"""

new_return = """  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const content = (
    <AnimatePresence>"""

content = content.replace(old_return, new_return)

old_end = """      </AnimatePresence>
    </>
  );
}"""

new_end = """      </AnimatePresence>
  );

  if (!mounted) return null;
  return createPortal(content, document.body);
}"""

content = content.replace(old_end, new_end)

with open("src/components/pulse-ai/PulseAIWorkspace.tsx", "w") as f:
    f.write(content)
