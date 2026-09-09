with open("src/components/pulse-ai/PulseAIWorkspace.tsx", "r") as f:
    content = f.read()

import re

# Revert import
content = content.replace('import React, { useState, useRef, useEffect, useCallback } from "react";\nimport { createPortal } from "react-dom";', 'import React, { useState, useRef, useEffect, useCallback } from "react";')

# Revert return
old_return = """  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const content = (
    <AnimatePresence>"""
new_return = """  return (
    <>
      <AnimatePresence>"""
content = content.replace(old_return, new_return)

old_end = """      </AnimatePresence>
  );

  if (!mounted) return null;
  return createPortal(content, document.body);
}"""
new_end = """      </AnimatePresence>
    </>
  );
}"""
content = content.replace(old_end, new_end)

with open("src/components/pulse-ai/PulseAIWorkspace.tsx", "w") as f:
    f.write(content)
