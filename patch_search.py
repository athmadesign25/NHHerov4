import re

file_path = "src/components/search/NHSearchExperience/NHSearchExperience.tsx"
with open(file_path, "r") as f:
    content = f.read()

# 1. Add pulseTarget state
content = content.replace(
    'const [pulseInitialQuery, setPulseInitialQuery] = useState("");',
    '''const [pulseInitialQuery, setPulseInitialQuery] = useState("");

  const [pulseTarget, setPulseTarget] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);

  useEffect(() => {
    const handleUpdatePulsePos = () => {
      const el = document.getElementById("pulse-ai-dock-target");
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (rect.height > 0) {
        setPulseTarget({
          top: Math.round(rect.top),
          left: Math.round(rect.left),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        });
      }
    };
    handleUpdatePulsePos();
    window.addEventListener("scroll", handleUpdatePulsePos, { passive: true });
    window.addEventListener("resize", handleUpdatePulsePos, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleUpdatePulsePos);
      window.removeEventListener("resize", handleUpdatePulsePos);
    };
  }, []);'''
)

# 2. Add reversingRef and positionProgress
content = content.replace(
    '''  const defaultProgress = useMotionValue(0);
  const baseProgress = scrollProgress || defaultProgress;

  // Accelerate the scroll animation on mobile so it completes in 40% of the normal distance
  // This makes the transition to FAB feel much cleaner and more responsive to a single swipe
  const fastMobileProgress = useTransform(baseProgress, [0, 0.4], [0, 1]);
  const activeProgress = isMobile ? fastMobileProgress : baseProgress;''',
    '''  const defaultProgress = useMotionValue(0);
  const baseProgress = scrollProgress || defaultProgress;

  const REVERSE_CUT = 0.45;
  const reversingRef = React.useRef(false);
  const lastBaseProgressRef = React.useRef(0);

  const positionProgress = useTransform(baseProgress, (v) =>
    reversingRef.current ? (v > REVERSE_CUT ? 1 : 0) : v
  );

  // Accelerate the scroll animation on mobile so it completes in 40% of the normal distance
  // This makes the transition to FAB feel much cleaner and more responsive to a single swipe
  const fastMobileProgress = useTransform(baseProgress, [0, 0.4], [0, 1]);
  const activeProgress = isMobile ? fastMobileProgress : positionProgress;'''
)

# 3. Update useMotionValueEvent to track reversing
content = content.replace(
    '''  useMotionValueEvent(activeProgress, "change", (latest) => {
    setIsMorphing(latest > 0.02);''',
    '''  useMotionValueEvent(baseProgress, "change", (latest) => {
    const delta = latest - lastBaseProgressRef.current;
    if (delta < -0.0008) reversingRef.current = true;
    else if (delta > 0.0008) reversingRef.current = false;
    lastBaseProgressRef.current = latest;
  });

  useMotionValueEvent(activeProgress, "change", (latest) => {
    setIsMorphing(latest > 0.02);'''
)

# 4. Restore target width/height/radius
content = content.replace(
    '''  const targetButton3Top = isMobile
    ? Math.round(winSize.h - 36 - compactHeight)
    : squareTopInPlace;

  const targetButton3Left = isMobile
    ? Math.round(winSize.w - 16 - compactWidth)
    : (winSize.w - 124);''',
    '''  const targetButton3Top = isMobile
    ? Math.round(winSize.h - 36 - compactHeight)
    : pulseTarget?.top ?? squareTopInPlace;

  const targetButton3Left = isMobile
    ? Math.round(winSize.w - 16 - compactWidth)
    : pulseTarget?.left ?? (winSize.w - 124);
    
  const targetWidth = isMobile ? compactWidth : pulseTarget?.width ?? compactWidth;
  const targetHeight = isMobile ? compactHeight : pulseTarget?.height ?? compactHeight;
  const targetRadius = isMobile || !pulseTarget ? compactRadius : 14;'''
)

# 5. Fix arrays to use targetWidth/targetHeight/targetRadius
content = content.replace(
    ': [startWidth, compactWidth, compactWidth, compactWidth];',
    ': [startWidth, compactWidth, compactWidth, targetWidth];'
)
content = content.replace(
    ': [startHeight, compactHeight, compactHeight, compactHeight];',
    ': [startHeight, compactHeight, compactHeight, targetHeight];'
)
content = content.replace(
    ': [20, compactRadius, compactRadius, compactRadius];',
    ': [20, compactRadius, compactRadius, targetRadius];'
)

with open(file_path, "w") as f:
    f.write(content)

print("Patched NHSearchExperience.tsx successfully")
