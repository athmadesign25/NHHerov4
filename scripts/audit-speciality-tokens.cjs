/** Static shared-token coverage for the speciality scope; not an estimate of migration hours.
 * Run from the repository root: node scripts/audit-speciality-tokens.cjs
 */
const fs = require('fs'), path = require('path');
const { createRequire } = require('module');
const req = createRequire(path.join(process.cwd(), 'package.json'));
const postcss = req('postcss'), ts = req('typescript');
const groups = { directory: ['src/app/specialities/page.module.css', 'src/app/specialities/page.tsx'], about: ['src/components/speciality/AboutSpecialitySection.module.css', 'src/components/speciality/AboutSpecialitySection.tsx'], details: ['src/app/specialities/[slug]/Speciality.module.css', 'src/components/speciality/SpecialityDesign2.module.css', 'src/components/speciality/SpecialityDesign1.tsx', 'src/components/speciality/SpecialityDesign2.tsx', 'src/app/specialities/[slug]/page.tsx'] };
const global = new Map;
postcss.parse(fs.readFileSync('src/app/globals.css', 'utf8')).walkDecls(d => { if (d.prop.startsWith('--'))
    global.set(d.prop, d.value); });
const results = {};
function category(prop) { if (/^(color|background(?:-color|-image)?|(?:border.*|outline.*)-(?:color)|fill|stroke|border|outline)$/.test(prop))
    return 'colour'; if (/^(?:margin|padding)(?:-|$)|^(?:gap|row-gap|column-gap)$/.test(prop))
    return 'spacing'; if (/radius/.test(prop))
    return 'radius'; if (/^(font-size|line-height|letter-spacing|font-family)$/.test(prop))
    return 'typography'; if (/^(transition|animation)(?:-|$)/.test(prop))
    return 'motion'; if (/^(box-shadow|text-shadow|backdrop-filter|filter)$/.test(prop))
    return 'effects'; return null; }
function resolve(value, locals, seen = new Set) { let out = '', i = 0; while (i < value.length) {
    let a = value.indexOf('var(', i);
    if (a < 0) {
        out += value.slice(i);
        break;
    }
    out += value.slice(i, a);
    let depth = 1, b = a + 4;
    for (; b < value.length && depth; b++) {
        if (value[b] === '(')
            depth++;
        if (value[b] === ')')
            depth--;
    }
    let body = value.slice(a + 4, b - 1), n = 0, comma = -1;
    for (let k = 0; k < body.length; k++) {
        if (body[k] === '(')
            n++;
        if (body[k] === ')')
            n--;
        if (body[k] === ',' && !n) {
            comma = k;
            break;
        }
    }
    let name = (comma < 0 ? body : body.slice(0, comma)).trim(), fallback = comma < 0 ? '' : body.slice(comma + 1);
    if (locals.has(name) && !seen.has(name)) {
        out += resolve(locals.get(name), locals, new Set([...seen, name]));
    }
    else if (global.has(name))
        out += 'SHARED_TOKEN';
    else if (fallback)
        out += resolve(fallback, locals, seen);
    else
        out += 'UNRESOLVED_TOKEN';
    i = b;
} return out; }
function record(group, file, line, prop, value, locals, forceMotion = false) { let cat = forceMotion ? 'motion' : category(prop); if (!cat)
    return; value = value.replace(/^['"`]|['"`]$/g, ''); let v = resolve(value, locals); let used = v.includes('SHARED_TOKEN') || forceMotion && /\b(?:duration|ease)\./.test(value); let raw = /#[\da-f]{3,8}\b|(?:rgba?|hsla?)\(\s*[\d.-]|\b(?:white|black|navy|red)\b/i.test(v); if (['spacing', 'radius', 'typography', 'effects'].includes(cat)) {
    raw ||= /(?<![\w-])(?:\d*\.)?\d+(?:px|rem|em)\b/.test(v.replace(/\b0(?:px|rem|em)\b/g, ''));
    if (prop === 'line-height' && /^\d*\.?\d+$/.test(v.trim()))
        raw = true;
    if (prop === 'font-family' && !used && !/^(inherit|initial|unset)$/.test(v.trim()))
        raw = true;
} if (cat === 'motion') {
    raw ||= forceMotion ? !used : /(?:\d*\.)?\d+m?s\b|cubic-bezier\(|\b(?:ease|ease-in|ease-out|linear)\b/.test(v);
} raw ||= v.includes('UNRESOLVED_TOKEN'); if (!used && !raw)
    return; let r = results[group] ??= { adopted: 0, remaining: 0, categories: {}, examples: [] }; let c = r.categories[cat] ??= { adopted: 0, remaining: 0 }; let key = used && !raw ? 'adopted' : 'remaining'; r[key]++; c[key]++; if (key === 'remaining' && r.examples.length < 12)
    r.examples.push({ file, line, prop, value }); }
for (const [group, files] of Object.entries(groups)) {
    for (const file of files) {
        let source = fs.readFileSync(file, 'utf8');
        if (file.endsWith('.css')) {
            let root = postcss.parse(source), locals = new Map;
            root.walkDecls(d => { if (d.prop.startsWith('--'))
                locals.set(d.prop, d.value); });
            root.walkDecls(d => { if (!d.prop.startsWith('--'))
                record(group, file, d.source.start.line, d.prop, d.value, locals); });
        }
        else {
            let sf = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
            const walkObject = (o, kind) => { for (let p of o.properties) {
                if (!ts.isPropertyAssignment(p))
                    continue;
                let name = p.name.getText(sf).replace(/['"]/g, ''), val = p.initializer;
                if (ts.isObjectLiteralExpression(val))
                    walkObject(val, kind);
                else if (kind === 'style' || ['duration', 'ease'].includes(name)) {
                    let cssName = name.replace(/[A-Z]/g, c => '-' + c.toLowerCase());
                    record(group, file, sf.getLineAndCharacterOfPosition(p.pos).line + 1, cssName, val.getText(sf), new Map, kind === 'transition');
                }
            } };
            const visit = n => { if (ts.isJsxAttribute(n) && ['style', 'transition'].includes(n.name.getText(sf)) && n.initializer && ts.isJsxExpression(n.initializer) && n.initializer.expression && ts.isObjectLiteralExpression(n.initializer.expression))
                walkObject(n.initializer.expression, n.name.getText(sf)); ts.forEachChild(n, visit); };
            visit(sf);
        }
    }
}
let total = { adopted: 0, remaining: 0, categories: {} };
for (const r of Object.values(results)) {
    r.percent = Math.round(100 * r.adopted / (r.adopted + r.remaining));
    total.adopted += r.adopted;
    total.remaining += r.remaining;
    for (const [k, v] of Object.entries(r.categories)) {
        let t = total.categories[k] ??= { adopted: 0, remaining: 0 };
        t.adopted += v.adopted;
        t.remaining += v.remaining;
    }
}
total.percent = Math.round(100 * total.adopted / (total.adopted + total.remaining));
for (const t of Object.values(total.categories))
    t.percent = Math.round(100 * t.adopted / (t.adopted + t.remaining));
console.log(JSON.stringify({ method: 'Declaration-level static estimate; shared tokens and aliases count; hard-coded fallbacks ignored when token resolves; breakpoints, layout ratios, SVG assets and non-style animation geometry excluded. Mixed raw/token declarations count as remaining.', results, total }, null, 2));
