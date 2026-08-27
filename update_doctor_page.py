import re

with open("src/app/doctors/[id]/page.tsx", "r") as f:
    content = f.read()

# Add ChevronDown to lucide-react import
if 'ChevronDown' not in content:
    content = content.replace("ChevronRight }", "ChevronRight, ChevronDown }")

# Add MOCK_FAMILY_MEMBERS outside component
mock_data = """
const MOCK_FAMILY_MEMBERS = [
  { id: 1, name: "Toshib", img: "https://i.pravatar.cc/150?img=11" },
  { id: 2, name: "Aarav", img: "https://i.pravatar.cc/150?img=12" },
  { id: 3, name: "Neha", img: "https://i.pravatar.cc/150?img=5" },
  { id: 4, name: "Rahul", img: "https://i.pravatar.cc/150?img=8" },
];
"""
if "MOCK_FAMILY_MEMBERS" not in content:
    content = content.replace("const slots =", mock_data + "\nconst slots =")

# Add state
state_old = """  const [consultationType, setConsultationType] = useState<"Hospital Visit" | "Video Consultation">("Hospital Visit");"""
state_new = """  const [consultationType, setConsultationType] = useState<"Hospital Visit" | "Video Consultation">("Hospital Visit");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeUserId, setActiveUserId] = useState(1);
  const [isMembersExpanded, setIsMembersExpanded] = useState(false);
  const activeUser = MOCK_FAMILY_MEMBERS.find(m => m.id === activeUserId) || MOCK_FAMILY_MEMBERS[0];
  const membersDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsLoggedIn(localStorage.getItem('isLoggedIn') === 'true');
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (membersDropdownRef.current && !membersDropdownRef.current.contains(event.target as Node)) {
        setIsMembersExpanded(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
"""
if "const [isLoggedIn, setIsLoggedIn] = useState(false);" not in content:
    content = content.replace(state_old, state_new)


# Add UI
ui_old = """            {/* Consultation Type Toggle */}"""
ui_new = """            {/* Select Member Dropdown */}
            {isLoggedIn && (
              <div style={{ marginBottom: 24, position: "relative" }} ref={membersDropdownRef}>
                <div style={{ fontSize: "var(--font-size-base)", fontWeight: 600, color: "var(--color-text)", marginBottom: 12 }}>Select member</div>
                <button 
                  onClick={() => setIsMembersExpanded(!isMembersExpanded)}
                  style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: "1.5px solid var(--color-border)", background: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <img src={activeUser.img} alt={activeUser.name} style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover" }} />
                    <span style={{ fontSize: "var(--font-size-base)", fontWeight: 600, color: "var(--color-text)" }}>{activeUser.name}</span>
                  </div>
                  <ChevronDown size={20} style={{ color: "var(--color-text-secondary)", transform: isMembersExpanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
                </button>

                <AnimatePresence>
                  {isMembersExpanded && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.15 }}
                      style={{ position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0, background: "#fff", borderRadius: 12, border: "1px solid var(--color-border)", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)", zIndex: 50, padding: 8, display: "flex", flexDirection: "column", gap: 4 }}
                    >
                      {MOCK_FAMILY_MEMBERS.map(member => (
                        <button
                          key={member.id}
                          onClick={() => { setActiveUserId(member.id); setIsMembersExpanded(false); }}
                          style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 12px", background: activeUserId === member.id ? "var(--color-bg-subtle)" : "transparent", border: "none", borderRadius: 8, cursor: "pointer", textAlign: "left", width: "100%" }}
                          onMouseEnter={(e) => { if (activeUserId !== member.id) e.currentTarget.style.background = "#F1F5F9"; }}
                          onMouseLeave={(e) => { if (activeUserId !== member.id) e.currentTarget.style.background = "transparent"; }}
                        >
                          <img src={member.img} alt={member.name} style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover" }} />
                          <span style={{ fontSize: "var(--font-size-sm)", fontWeight: 500, color: "var(--color-text)" }}>{member.name}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Consultation Type Toggle */}"""

if "Select member" not in content:
    content = content.replace(ui_old, ui_new)

with open("src/app/doctors/[id]/page.tsx", "w") as f:
    f.write(content)
print("Updated page.tsx with Select Member dropdown")
