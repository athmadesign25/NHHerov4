import re
import os

target_files = [
    "src/app/articles/[slug]/ArticleDetail.module.css",
    "src/app/diagnostics/[slug]/DiagnosticDetail.module.css",
    "src/app/procedures/[slug]/ProcedureDetail.module.css",
    "src/app/symptoms/[slug]/SymptomDetail.module.css",
    "src/app/diseases/[slug]/DiseaseDetail.module.css",
    "src/app/treatments/TreatmentsLibrary.module.css",
    "src/app/diseases/DiseasesLibrary.module.css",
    "src/app/symptoms/SymptomsLibrary.module.css",
    "src/app/diagnostics/DiagnosticsLibrary.module.css",
    "src/components/blog/BlogHeroV3.module.css",
    "src/components/blog/BlogHero.module.css",
    "src/components/blog/BlogCtaBanner.module.css",
    "src/components/blog/MoreFromOurBlogCarousel.module.css",
    "src/components/ui/NearbyClinicalCarousels.module.css",
    "src/components/ui/ClinicalReviewedBySection.module.css",
    "src/components/ui/OrganSystemChipsCarousel.module.css",
    "src/components/ui/ClinicalFloatingSideActions.module.css",
    "src/app/dev-handover/DevHandover.module.css",
]

# Exact token mappings from check-tokens.mjs
REPLACEMENTS = [
    # Color literals
    (r'(?i)#ffffff\b(?!;?\s*/\*\s*token-ok)', 'var(--white)'),
    (r'(?i)#000000\b(?!;?\s*/\*\s*token-ok)', 'var(--black)'),
    (r'(?i)#1a1a2e\b', 'var(--navy-ink)'),
    (r'(?i)#023070\b', 'var(--blue-900)'),
    (r'(?i)#034EA2\b', 'var(--blue-brand)'),
    (r'(?i)#ed1c24\b', 'var(--red-emergency)'),
    (r'(?i)#f8fafc\b', 'var(--slate-50)'),
    (r'(?i)#f1f5f9\b', 'var(--slate-100)'),
    (r'(?i)#e2e8f0\b', 'var(--slate-200)'),
    (r'(?i)#cbd5e1\b', 'var(--slate-300)'),
    (r'(?i)#94a3b8\b', 'var(--slate-400)'),
    (r'(?i)#64748b\b', 'var(--slate-500)'),
    (r'(?i)#475569\b', 'var(--slate-600)'),
    (r'(?i)#334155\b', 'var(--slate-700)'),
    (r'(?i)#1e293b\b', 'var(--slate-800)'),
    (r'(?i)#0f172a\b', 'var(--slate-900)'),
    # RGBA opacity channel mappings
    (r'rgba\(\s*255\s*,\s*255\s*,\s*255\s*,', 'rgba(var(--white-rgb),'),
    (r'rgba\(\s*0\s*,\s*0\s*,\s*0\s*,', 'rgba(var(--black-rgb),'),
    (r'rgba\(\s*3\s*,\s*78\s*,\s*162\s*,', 'rgba(var(--blue-brand-rgb),'),
    (r'rgba\(\s*15\s*,\s*23\s*,\s*42\s*,', 'rgba(var(--slate-900-rgb),'),
    # Easings & Durations
    (r'cubic-bezier\(0\.16,\s*1,\s*0\.3,\s*1\)', 'var(--ease-spring)'),
    (r':\s*0\.15s\b', ': var(--duration-fast)'),
    (r':\s*0\.2s\b', ': var(--duration-base)'),
    (r':\s*0\.25s\b', ': var(--duration-base)'),
    (r':\s*0\.4s\b', ': var(--duration-slow)'),
    (r'\s+0\.15s\b', ' var(--duration-fast)'),
    (r'\s+0\.2s\b', ' var(--duration-base)'),
    (r'\s+0\.25s\b', ' var(--duration-base)'),
    (r'\s+0\.4s\b', ' var(--duration-slow)'),
    # Font sizes
    (r'(?i)#eef2f7\b', 'var(--blue-tint-50)'),
    (r'(?i)#0284c7\b', 'var(--sky-600)'),
    (r'(?i)#10b981\b', 'var(--emerald-500)'),
    (r'(?i)#fef2f2\b', 'var(--red-50)'),
    (r'(?i)#f87171\b', 'var(--red-400)'),
    (r'(?i)#dc2626\b', 'var(--red-600)'),
    (r'font-size:\s*10px\b', 'font-size: var(--font-size-2xs)'),
    (r'font-size:\s*11px\b', 'font-size: var(--font-size-2xs)'),
    (r'font-size:\s*12px\b', 'font-size: var(--font-size-xs)'),
    (r'font-size:\s*14px\b', 'font-size: var(--font-size-sm)'),
    (r'font-size:\s*16px\b', 'font-size: var(--font-size-base)'),
    (r'font-size:\s*18px\b', 'font-size: var(--font-size-lg)'),
    (r'font-size:\s*20px\b', 'font-size: var(--font-size-xl)'),
    (r'font-size:\s*24px\b', 'font-size: var(--font-size-2xl)'),
    (r'font-size:\s*30px\b', 'font-size: var(--font-size-3xl)'),
    (r'font-size:\s*32px\b', 'font-size: var(--font-size-3xl)'),
    (r'font-size:\s*36px\b', 'font-size: var(--font-size-4xl)'),
    (r'font-size:\s*40px\b', 'font-size: var(--font-size-4xl)'),
    (r'font-size:\s*42px\b', 'font-size: var(--font-size-display)'),
]

for fpath in target_files:
    if not os.path.exists(fpath):
        continue
    content = open(fpath).read()
    orig = content
    for pattern, repl in REPLACEMENTS:
        content = re.sub(pattern, repl, content)
    if content != orig:
        open(fpath, 'w').write(content)
        print(f"Updated tokens in: {fpath}")

print("Token replacement finished.")
