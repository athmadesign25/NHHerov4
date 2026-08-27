import re

with open("src/components/layout/Navbar.tsx", "r") as f:
    content = f.read()

# On mount, read from localStorage
# Replace `const [isLoggedIn, setIsLoggedIn] = useState(false);`
# With a version that initializes from localStorage inside a useEffect
# But since it's Next.js (SSR), we must do it in useEffect to avoid hydration mismatch.
old_state = "const [isLoggedIn, setIsLoggedIn] = useState(false);"
new_state = """const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsLoggedIn(localStorage.getItem('isLoggedIn') === 'true');
    }
  }, []);"""
if old_state in content:
    content = content.replace(old_state, new_state)

# onLoginSuccess:
old_login = "onLoginSuccess={() => setIsLoggedIn(true)}"
new_login = "onLoginSuccess={() => { setIsLoggedIn(true); localStorage.setItem('isLoggedIn', 'true'); }}"
if old_login in content:
    content = content.replace(old_login, new_login)

# onLogout:
old_logout = "setIsLoggedIn(false);"
new_logout = "setIsLoggedIn(false); localStorage.removeItem('isLoggedIn');"
if old_logout in content:
    content = content.replace(old_logout, new_logout)

with open("src/components/layout/Navbar.tsx", "w") as f:
    f.write(content)
print("Updated Navbar to use localStorage")
