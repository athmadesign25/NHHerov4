const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
  LevelFormat, VerticalAlign, Footer, PageNumber, NumberFormat
} = require('docx');
const fs = require('fs');

// === OFFICIAL BRAND COLORS (from Brand Health Book) ===
const NH_BLUE       = "034EA2";   // Primary Blue — PANTONE P 102-8 C
const NH_RED        = "ED1C24";   // "Health" wordmark red — PANTONE P 48-8 C
const NH_BLUE_DARK  = "023070";   // Dark blue (deeper shade for sections)
const NH_BLUE_10    = "E6EDF8";   // Blue at 10% opacity (backgrounds)
const NH_BLUE_20    = "CDDAF1";   // Blue at 20%
const NH_BLUE_50    = "81A7D0";   // Blue at 50%
const WHITE         = "FFFFFF";
const LIGHT_BG      = "F3F5F9";   // Near-white blue-tinted background
const DARK_TEXT     = "1A1A2E";
const MID_TEXT      = "444455";
const LIGHT_GRAY    = "CCCCCC";
const MID_GRAY      = "999999";
const RULE_GRAY     = "DDDDDD";
const RED_LIGHT     = "FDECEA";

// Border helpers
const b = (color = LIGHT_GRAY, size = 1) => ({ style: BorderStyle.SINGLE, size, color });
const borders = (c = LIGHT_GRAY) => ({ top: b(c), bottom: b(c), left: b(c), right: b(c) });
const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

// Typography helpers
const run = (text, opts = {}) => new TextRun({ text, font: "Arial", ...opts });

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 400, after: 140 },
    border: { left: { style: BorderStyle.SINGLE, size: 20, color: NH_BLUE, space: 8 } },
    indent: { left: 200 },
    children: [run(text, { bold: true, size: 36, color: NH_BLUE })]
  });
}
function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 300, after: 100 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: NH_BLUE, space: 4 } },
    children: [run(text, { bold: true, size: 28, color: NH_BLUE })]
  });
}
function h3(text, color = DARK_TEXT) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 220, after: 80 },
    children: [run(text, { bold: true, size: 24, color })]
  });
}
function h4(text) {
  return new Paragraph({
    spacing: { before: 160, after: 60 },
    children: [run(text, { bold: true, size: 22, color: NH_BLUE, allCaps: true })]
  });
}
function body(text, opts = {}) {
  return new Paragraph({
    spacing: { before: 60, after: 60 },
    children: [run(text, { size: 22, color: MID_TEXT, ...opts })]
  });
}
function bullet(text, bold = false, color = MID_TEXT) {
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    spacing: { before: 40, after: 40 },
    children: [run(text, { size: 21, bold, color })]
  });
}
function subbullet(text) {
  return new Paragraph({
    numbering: { reference: "sub-bullets", level: 0 },
    spacing: { before: 30, after: 30 },
    children: [run(text, { size: 20, color: MID_TEXT })]
  });
}
function sp(n = 1) {
  return new Paragraph({ children: [run("")], spacing: { before: n * 80 } });
}
function hr() {
  return new Paragraph({
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: RULE_GRAY, space: 1 } },
    children: [run("")], spacing: { before: 120, after: 120 }
  });
}
function note(text, bg = NH_BLUE_10) {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [9360],
    rows: [new TableRow({ children: [new TableCell({
      borders: noBorders,
      shading: { fill: bg, type: ShadingType.CLEAR },
      margins: { top: 120, bottom: 120, left: 200, right: 200 },
      width: { size: 9360, type: WidthType.DXA },
      children: [new Paragraph({ children: [run(text, { size: 21, color: NH_BLUE, italics: true })] })]
    })]})]
  });
}
function warn(text) {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [9360],
    rows: [new TableRow({ children: [new TableCell({
      borders: { top: b(NH_RED,4), bottom: b(NH_RED,4), left: b(NH_RED,10), right: b(NH_RED,4) },
      shading: { fill: RED_LIGHT, type: ShadingType.CLEAR },
      margins: { top: 100, bottom: 100, left: 200, right: 200 },
      width: { size: 9360, type: WidthType.DXA },
      children: [new Paragraph({ children: [run(text, { size: 21, color: NH_RED, bold: true })] })]
    })]})]
  });
}

// Standard 2-col table
function t2(rows, col1 = 2600, col2 = 6760) {
  const col2w = 9360 - col1;
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [col1, col2w],
    rows: rows.map((r, i) => new TableRow({
      children: [
        new TableCell({
          borders: borders(RULE_GRAY),
          shading: { fill: i % 2 === 0 ? NH_BLUE_10 : WHITE, type: ShadingType.CLEAR },
          width: { size: col1, type: WidthType.DXA },
          margins: { top: 80, bottom: 80, left: 140, right: 140 },
          children: [new Paragraph({ children: [run(r[0], { bold: true, size: 20, color: NH_BLUE })] })]
        }),
        new TableCell({
          borders: borders(RULE_GRAY),
          shading: { fill: i % 2 === 0 ? WHITE : NH_BLUE_10, type: ShadingType.CLEAR },
          width: { size: col2w, type: WidthType.DXA },
          margins: { top: 80, bottom: 80, left: 140, right: 140 },
          children: [new Paragraph({ children: [run(r[1], { size: 20, color: DARK_TEXT })] })]
        }),
      ]
    }))
  });
}

// Header table (blue header row + data rows)
function thead(headers, rows) {
  const colW = Math.floor(9360 / headers.length);
  const colWidths = headers.map(() => colW);
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [
      new TableRow({
        tableHeader: true,
        children: headers.map(h => new TableCell({
          borders: borders(NH_BLUE_DARK),
          shading: { fill: NH_BLUE, type: ShadingType.CLEAR },
          width: { size: colW, type: WidthType.DXA },
          margins: { top: 100, bottom: 100, left: 120, right: 120 },
          children: [new Paragraph({ children: [run(h, { bold: true, size: 20, color: WHITE })] })]
        }))
      }),
      ...rows.map((row, i) => new TableRow({
        children: row.map(cell => new TableCell({
          borders: borders(RULE_GRAY),
          shading: { fill: i % 2 === 0 ? WHITE : LIGHT_BG, type: ShadingType.CLEAR },
          width: { size: colW, type: WidthType.DXA },
          margins: { top: 80, bottom: 80, left: 120, right: 120 },
          children: [new Paragraph({ children: [run(cell, { size: 20, color: DARK_TEXT })] })]
        }))
      }))
    ]
  });
}

// Color swatch table
function swatchRow(swatches) {
  const colW = Math.floor(9360 / swatches.length);
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: swatches.map(() => colW),
    rows: [
      // Color block row
      new TableRow({ children: swatches.map(s => new TableCell({
        borders: noBorders,
        shading: { fill: s.hex, type: ShadingType.CLEAR },
        width: { size: colW, type: WidthType.DXA },
        margins: { top: 400, bottom: 400, left: 80, right: 80 },
        children: [new Paragraph({ children: [run("", { size: 4 })] })]
      }))}),
      // Label row
      new TableRow({ children: swatches.map(s => new TableCell({
        borders: borders(RULE_GRAY),
        shading: { fill: LIGHT_BG, type: ShadingType.CLEAR },
        width: { size: colW, type: WidthType.DXA },
        margins: { top: 80, bottom: 80, left: 80, right: 80 },
        children: [
          new Paragraph({ alignment: AlignmentType.CENTER, children: [run(s.name, { bold: true, size: 18, color: DARK_TEXT })] }),
          new Paragraph({ alignment: AlignmentType.CENTER, children: [run('#' + s.hex, { size: 17, color: MID_TEXT })] }),
          new Paragraph({ alignment: AlignmentType.CENTER, children: [run(s.role, { size: 16, color: MID_GRAY, italics: true })] }),
        ]
      }))}),
    ]
  });
}

// Section title block (covers page)
function sectionCover(title, subtitle = "") {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [480, 8880],
    rows: [new TableRow({ children: [
      new TableCell({
        borders: noBorders,
        shading: { fill: NH_BLUE, type: ShadingType.CLEAR },
        width: { size: 480, type: WidthType.DXA },
        margins: { top: 160, bottom: 160, left: 80, right: 80 },
        children: [new Paragraph({ children: [run("", { size: 4 })] })]
      }),
      new TableCell({
        borders: { top: b(RULE_GRAY), bottom: b(RULE_GRAY), left: noBorder, right: noBorder },
        shading: { fill: WHITE, type: ShadingType.CLEAR },
        width: { size: 8880, type: WidthType.DXA },
        margins: { top: 100, bottom: 100, left: 280, right: 80 },
        children: [
          new Paragraph({ children: [run(title, { bold: true, size: 30, color: NH_BLUE })] }),
          subtitle ? new Paragraph({ children: [run(subtitle, { size: 21, color: MID_TEXT, italics: true })] }) : new Paragraph({ children: [run("")] })
        ]
      })
    ]})]
  });
}

const doc = new Document({
  numbering: {
    config: [
      { reference: "bullets",
        levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "sub-bullets",
        levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u25E6",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 1080, hanging: 360 } } } }] },
      { reference: "numbers",
        levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "alpha",
        levels: [{ level: 0, format: LevelFormat.UPPER_LETTER, text: "%1.",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    ]
  },
  styles: {
    default: { document: { run: { font: "Arial", size: 22, color: DARK_TEXT } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 36, bold: true, color: NH_BLUE, font: "Arial" },
        paragraph: { spacing: { before: 400, after: 140 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, color: NH_BLUE, font: "Arial" },
        paragraph: { spacing: { before: 300, after: 100 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, color: DARK_TEXT, font: "Arial" },
        paragraph: { spacing: { before: 220, after: 80 }, outlineLevel: 2 } },
    ]
  },

  sections: [

    // ======================================================
    // COVER PAGE
    // ======================================================
    {
      properties: {
        page: { size: { width: 12240, height: 15840 },
          margin: { top: 0, right: 0, bottom: 0, left: 0 } }
      },
      children: [
        // Blue top band
        new Table({ width: { size: 12240, type: WidthType.DXA }, columnWidths: [12240],
          rows: [new TableRow({ children: [new TableCell({
            borders: noBorders,
            shading: { fill: NH_BLUE, type: ShadingType.CLEAR },
            width: { size: 12240, type: WidthType.DXA },
            margins: { top: 2400, bottom: 1600, left: 1440, right: 1440 },
            children: [
              new Paragraph({ alignment: AlignmentType.LEFT, spacing: { before: 0, after: 100 },
                children: [run("NH", { bold: true, size: 120, color: "CCDDF5" })] }),
              new Paragraph({ alignment: AlignmentType.LEFT, spacing: { before: 0, after: 60 },
                children: [run("NARAYANA HEALTH", { bold: true, size: 64, color: WHITE })] }),
              new Paragraph({ alignment: AlignmentType.LEFT, spacing: { before: 0, after: 0 },
                border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: "6699CC", space: 0 } },
                children: [run("", { size: 4 })] }),
            ]
          })]})]}),
        // White info band
        new Table({ width: { size: 12240, type: WidthType.DXA }, columnWidths: [12240],
          rows: [new TableRow({ children: [new TableCell({
            borders: noBorders,
            shading: { fill: WHITE, type: ShadingType.CLEAR },
            width: { size: 12240, type: WidthType.DXA },
            margins: { top: 1200, bottom: 1200, left: 1440, right: 1440 },
            children: [
              new Paragraph({ spacing: { before: 0, after: 120 },
                children: [run("Website Design System", { bold: true, size: 56, color: DARK_TEXT })] }),
              new Paragraph({ spacing: { before: 0, after: 80 },
                children: [run("Comprehensive Brand & Design Reference for Website Redesign", { size: 28, color: MID_TEXT })] }),
              new Paragraph({ spacing: { before: 0, after: 40 },
                children: [run("Based on Official Brand Health Book + Website Audit | May 2026", { size: 22, color: MID_GRAY, italics: true })] }),
            ]
          })]})]}),
        // Red accent bottom
        new Table({ width: { size: 12240, type: WidthType.DXA }, columnWidths: [12240],
          rows: [new TableRow({ children: [new TableCell({
            borders: noBorders,
            shading: { fill: NH_RED, type: ShadingType.CLEAR },
            width: { size: 12240, type: WidthType.DXA },
            margins: { top: 240, bottom: 240, left: 1440, right: 1440 },
            children: [new Paragraph({ children: [
              run("narayanahealth.org  |  1800 309 0309  |  Founded 2000 by Dr. Devi Prasad Shetty", { size: 20, color: WHITE })
            ]})]
          })]})]}),
      ]
    },

    // ======================================================
    // MAIN CONTENT
    // ======================================================
    {
      properties: {
        page: { size: { width: 12240, height: 15840 },
          margin: { top: 1080, right: 1080, bottom: 1200, left: 1080 } }
      },
      footers: {
        default: new Footer({ children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            border: { top: { style: BorderStyle.SINGLE, size: 6, color: NH_BLUE, space: 6 } },
            children: [
              run("Narayana Health — Website Design System  |  narayanahealth.org  |  Confidential", { size: 18, color: MID_GRAY })
            ]
          })
        ]})
      },
      children: [

        // =====================
        // TABLE OF CONTENTS
        // =====================
        h1("Design System Contents"),
        sp(),
        thead(
          ["#", "Section", "Coverage"],
          [
            ["1", "Brand Identity & Philosophy", "Logo, mark, clearspace, do's & don'ts"],
            ["2", "Official Color Palette", "Primary, secondary, tints, web-safe values"],
            ["3", "Typography System", "Typefaces, weights, sizes, scale, web fallbacks"],
            ["4", "Iconography System", "Grid, rules, color usage, icon categories"],
            ["5", "Photography Guidelines", "Use / avoid rules, 3 categories"],
            ["6", "Logo Usage Rules", "Clear space, backgrounds, sub-brands, app icon"],
            ["7", "Website Information Architecture", "Full nav structure, URL map"],
            ["8", "Page Templates & Layouts", "Homepage, speciality, hospital, doctor, health library"],
            ["9", "UI Components & Design Tokens", "Buttons, cards, forms, navigation, badges"],
            ["10", "Spacing & Grid System", "Layout grid, spacing scale, containers"],
            ["11", "Shadows, Borders & Elevation", "Shadow tokens, border radii, depth levels"],
            ["12", "Motion & Animation", "Transitions, micro-interactions principles"],
            ["13", "Communication Templates", "Digital ad specs, social media, email"],
            ["14", "Stationery Reference", "Cards, letterheads, envelopes — for consistency"],
            ["15", "Do's & Don'ts Summary", "Quick reference for all designers"],
          ]
        ),

        // =====================
        // SECTION 1: BRAND IDENTITY
        // =====================
        sp(2), hr(),
        h1("1. Brand Identity & Philosophy"),
        sp(),
        body("Narayana Health was founded in 2000 by Dr. Devi Prasad Shetty with a mission to make world-class healthcare affordable and accessible to all. The brand identity reflects this through a confident, clinical, yet warm visual language built entirely around two brand colors, one typeface, and a distinctive heart-cross logo mark."),
        sp(),
        h2("1.1 Brand Essence"),
        t2([
          ["Mission", "Delivering high-quality, affordable healthcare to the broader population through economies of scale"],
          ["Vision", "One brand, one vision, one name — Narayana Health as the primary identity across all facilities"],
          ["Taglines", "'Trusted Care, Every Day' (website) | 'Take Care' (all offline communication)"],
          ["Sub-tagline", "'Compassion Backed by Expertise' | 'We are there to Take Care'"],
          ["Network desc.", "'Our Network: Hospitals | Health City | Clinics | Labs | Pharma | One Health'"],
          ["Founder", "Dr. Devi Prasad Shetty — Cardiac Surgeon"],
          ["Founded", "2000, Bengaluru, Karnataka"],
          ["Listed", "BSE & NSE (Ticker: NH) — January 2016"],
          ["Scale", "24+ hospitals, 5,800+ beds, 14+ cities, 40+ specialities, Cayman Islands international facility"],
        ]),
        sp(),
        h2("1.2 The Logo"),
        body("The Narayana Health logo consists of a beating hearts icon (two overlapping hearts in blue and red forming a medical cross/plus sign) placed above left of the wordmark 'Narayana' (in blue) with 'Health' below (in red)."),
        sp(),
        warn("CRITICAL RULE: The logo must ALWAYS be reproduced in full. There is NO standalone icon/insignia version. The complete logo — icon + wordmark — must appear together in every application."),
        sp(),
        t2([
          ["Logo Mark", "Two interlocking hearts forming a plus/cross symbol — blue (#034EA2) + red (#ED1C24)"],
          ["'Narayana'", "Bold sans-serif — Helvetica Neue — in brand blue #034EA2"],
          ["'Health'", "Bold sans-serif — Helvetica Neue — in brand red #ED1C24"],
          ["Min. size (print)", "1 inch / 25.4mm width minimum"],
          ["Min. size (screen)", "175 pixels width minimum"],
          ["Max size", "No maximum size restriction"],
          ["Background", "ALWAYS requires a white background behind the logo"],
          ["Non-white bg", "Place logo in a white rounded-bottom band; clear space = 2× heart unit outside the band"],
          ["Clear space rule", "Maintain 2× the heart icon's width clear of any other content on all sides"],
          ["Proportions", "Defined by 'N' stroke width as the base unit A; grid = A, 1.5A, 3A, 5A measurements"],
        ]),
        sp(),
        h2("1.3 Logo Colour Variants"),
        t2([
          ["Full Colour", "Blue mark + Blue 'Narayana' + Red 'Health' — use on white backgrounds (primary)"],
          ["Reversed / White", "All-white version — use on blue (#034EA2) or dark backgrounds only"],
          ["Single Colour Blue", "Full logo in solid blue — monochrome print contexts"],
          ["Mobile App iOS", "Blue & Red hearts on rounded white square (squircle background)"],
          ["Mobile App Android", "Blue & Red hearts on circular white background"],
        ]),
        sp(),
        h2("1.4 Logo Don'ts (from Brand Health Book)"),
        warn("All of the following are PROHIBITED. Never deviate from these rules in any web or digital application."),
        sp(),
        t2([
          ["✗ Stretch/condense", "Never change dimensions or aspect ratio of the logo"],
          ["✗ Alter placement", "Never move individual elements (icon vs wordmark positioning is fixed)"],
          ["✗ Crop wordmark", "Never show partial logo — always full mark"],
          ["✗ Use half logo", "Never split or use half the logo anywhere"],
          ["✗ Recolour elements", "Never change the blue or red to any other colour"],
          ["✗ Replace typeface", "Never swap Helvetica Neue for another font in the logo"],
          ["✗ Skew or bend", "No warping, perspective, or distortion of any kind"],
          ["✗ Rotate", "Logo always appears upright, never rotated"],
          ["✗ Wrong colours", "Only use exact HEX #034EA2 and #ED1C24"],
          ["✗ Rearrange type", "Fixed layout — 'Narayana' above 'Health', never beside"],
          ["✗ Add elements", "No decorative borders, icons, text, or embellishments around the logo"],
          ["✗ Drop shadows/strokes", "No visual effects of any kind on the logo"],
        ]),

        // =====================
        // SECTION 2: COLORS
        // =====================
        sp(2), hr(),
        h1("2. Official Color Palette"),
        body("The color system has been officially defined in the Brand Health Book. It is built on two primary colors — blue and red — with a supporting palette of blue tints and white. This must be applied strictly and consistently across all digital touchpoints."),
        sp(),
        h2("2.1 Primary Brand Colors"),
        swatchRow([
          { hex: "034EA2", name: "NH Blue", role: "Primary — Logo, CTAs, Nav, Headings" },
          { hex: "ED1C24", name: "NH Red", role: "'Health' word, accents, alerts" },
          { hex: "FFFFFF", name: "White", role: "Backgrounds, reverse text" },
        ]),
        sp(),
        thead(["Color", "HEX", "RGB", "CMYK", "PANTONE", "Web Usage"],
          [
            ["NH Primary Blue", "#034EA2", "R3 G78 B162", "C100 M80 Y0 K0", "P 102-8 C", "Nav bar, CTAs, headings, icons, links, borders"],
            ["NH Red / 'Health'", "#ED1C24", "R237 G28 B36", "C0 M100 Y100 K0", "P 48-8 C", "Logo 'Health' text, accent lines, emergency CTAs, alerts"],
            ["Pure White", "#FFFFFF", "R255 G255 B255", "—", "P 1-1 C", "Page bg, card surfaces, text-on-blue"],
          ]
        ),
        sp(),
        h2("2.2 Extended Blue Tint Scale (Supporting Palette)"),
        body("The brand palette specifies various blue tints (5%–95% opacity). These are the web-safe approximations for use in digital design:"),
        sp(),
        swatchRow([
          { hex: "EEF3FA", name: "Blue 5%", role: "Page bg, hover states" },
          { hex: "E6EDF8", name: "Blue 10%", role: "Section bg, card bg" },
          { hex: "CDDAF1", name: "Blue 20%", role: "Badges, chips, borders" },
          { hex: "9AB5E2", name: "Blue 40%", role: "Inactive elements" },
          { hex: "81A7D0", name: "Blue 50%", role: "Dividers, secondary info" },
        ]),
        sp(),
        swatchRow([
          { hex: "4978BB", name: "Blue 70%", role: "Subheadings, links" },
          { hex: "1B5AAD", name: "Blue 85%", role: "Hover on CTA" },
          { hex: "034EA2", name: "Blue 100%", role: "Primary — all main uses" },
          { hex: "023070", name: "Blue 120%", role: "Dark bg, footer, nav overlay" },
          { hex: "011D48", name: "Blue 150%", role: "Dark header blocks only" },
        ]),
        sp(),
        h2("2.3 Neutral & UI Colors"),
        thead(["Token Name", "HEX", "Usage"],
          [
            ["text-primary", "#1A1A2E", "Primary body text, headings on white"],
            ["text-secondary", "#444455", "Secondary text, descriptions"],
            ["text-muted", "#777788", "Placeholders, metadata, timestamps"],
            ["text-disabled", "#AAAAAA", "Disabled states"],
            ["border-light", "#E0E0E0", "Card borders, input borders"],
            ["border-medium", "#CCCCCC", "Section dividers"],
            ["bg-page", "#F3F5F9", "Global page background"],
            ["bg-card", "#FFFFFF", "Card / panel backgrounds"],
            ["bg-section-alt", "#EEF3FA", "Alternating section backgrounds"],
            ["success-green", "#2E7D32", "Available / online badges"],
            ["warning-amber", "#F57C00", "Promotional, limited-time CTAs"],
            ["error-red", "#D32F2F", "Errors, emergency callouts (distinct from brand red)"],
          ]
        ),
        sp(),
        h2("2.4 Color Usage Principles"),
        warn("Red (#ED1C24) is EXCLUSIVELY for the 'Health' wordmark in the logo, the red vertical accent bar in communication layouts, and emergency-related content. It must NEVER replace blue as a CTA or primary action color on the website."),
        sp(),
        bullet("Blue is dominant — it must constitute ≥60% of any brand-colored surface"),
        bullet("White provides breathing room — generous white space is a brand characteristic"),
        bullet("Blue tints create hierarchy and depth without introducing new colors"),
        bullet("Red appears as a deliberate accent, not as a general-purpose highlight"),
        bullet("Never use gradients on the primary logo or wordmark"),
        bullet("Maintain WCAG AA contrast ratio (minimum 4.5:1) for all body text on web"),

        // =====================
        // SECTION 3: TYPOGRAPHY
        // =====================
        sp(2), hr(),
        h1("3. Typography System"),
        body("Helvetica Neue is the SOLE official typeface for all Narayana Health communications. The Brand Health Book states: 'Use Helvetica font for all communication.' This applies to print, digital, signage, and all web interfaces."),
        sp(),
        h2("3.1 Official Type Hierarchy (from Brand Health Book)"),
        thead(["Role", "Font Weight", "Usage"],
          [
            ["Headline / Display", "Helvetica Neue LT Heavy", "Hero headlines, H1, campaign headlines, poster headlines"],
            ["Brand Positioning", "Helvetica Neue LT Heavy Italic", "'Take Care', 'Trusted Care' — brand taglines only"],
            ["Sub-heading", "Helvetica Neue Bold", "H2, H3, section titles, card headings, doctor names"],
            ["Body Copy / UI", "Helvetica Neue Regular", "All body text, descriptions, nav items, form labels"],
            ["Medium Weight", "Helvetica Neue Medium", "Button text, captions, metadata, badge labels"],
          ]
        ),
        sp(),
        h2("3.2 Web Font Implementation"),
        note("Helvetica Neue is a licensed typeface and is not a Google Font. For web implementation, use one of the following stacks in priority order:"),
        sp(),
        t2([
          ["Preferred (Licensed)", "'Helvetica Neue', Helvetica, Arial, sans-serif"],
          ["Google Font fallback", "Inter (closest free match — geometric sans-serif)"],
          ["System stack", "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif"],
          ["Min font size (print)", "6pt (from Brand Health Book)"],
          ["Min font size (web)", "12px for metadata; 14px for secondary; 16px for body"],
          ["Min font size (video)", "12pt (from YouTube template specs)"],
        ]),
        sp(),
        h2("3.3 Website Type Scale"),
        thead(["Level", "Size", "Weight", "Color", "Usage"],
          [
            ["Display / Hero H1", "48–64px", "Heavy / 900", "#034EA2 or #FFFFFF", "Homepage hero headline only"],
            ["Page Title H1", "36–42px", "Bold / 700", "#034EA2", "Interior page titles, speciality names"],
            ["Section H2", "28–32px", "Bold / 700", "#034EA2 or #1A1A2E", "Section headings, hospital names"],
            ["Sub-section H3", "22–26px", "Semi-bold / 600", "#1A1A2E", "Card titles, doctor names, FAQ questions"],
            ["Card Title H4", "18–20px", "Semi-bold / 600", "#034EA2", "Speciality cards, procedure cards"],
            ["Body Large", "17–18px", "Regular / 400", "#444455", "Hero sub-copy, key descriptions"],
            ["Body Regular", "15–16px", "Regular / 400", "#444455", "Standard body text, article copy"],
            ["Body Small", "13–14px", "Regular / 400", "#777788", "Captions, metadata, timestamps"],
            ["Label / Badge", "11–12px", "Medium / 500", "#034EA2 or #FFFFFF", "Tags, chips, availability badges — CAPS"],
            ["Navigation", "14–15px", "Medium / 500", "#1A1A2E or #FFFFFF", "Nav links — not all-caps on digital"],
            ["Button", "14–16px", "Semi-bold / 600", "#FFFFFF", "CTA buttons — title case preferred"],
            ["Footer", "13–14px", "Regular / 400", "#FFFFFF or #CCDDF5", "Footer links on dark background"],
          ]
        ),
        sp(),
        h2("3.4 Regional / Multilingual Typefaces"),
        body("For regional language content, use the following official brand-specified fonts:"),
        t2([
          ["Gujarati", "Noto Sans Gujarati Bold — for Gujarat hospital pages and regional signage"],
          ["Bengali", "Noto Sans Bengali Bold — for Bangladesh/Kolkata content and international patient section"],
          ["Assamese", "Shorif Shishir Bijoy 2003 — for Guwahati/Assam regional pages"],
          ["Hindi", "Noto Sans Devanagari — for national campaigns (internal signage uses Devanagari throughout)"],
          ["General rule", "Always pair regional type with Helvetica Neue for the English component; same hierarchy applies"],
        ]),
        sp(),
        h2("3.5 Typography Do's & Don'ts"),
        bullet("DO: Always left-align body text; center-align only for stats/metrics/standees"),
        bullet("DO: Maintain 1.5–1.7× line height for body copy"),
        bullet("DO: Use positive letter-spacing (+0.05em) for ALL-CAPS labels only"),
        bullet("DO: Limit to 3 weight variations per page (Heavy/Bold/Regular or Bold/Medium/Regular)"),
        bullet("DON'T: Never italic body copy — italics reserved for brand positioning taglines only"),
        bullet("DON'T: Never use type below 12px on screen or 6pt in print"),
        bullet("DON'T: Never substitute a display/decorative font for Helvetica Neue"),
        bullet("DON'T: Never use justified text alignment — always left-aligned"),

        // =====================
        // SECTION 4: ICONOGRAPHY
        // =====================
        sp(2), hr(),
        h1("4. Iconography System"),
        body("Narayana Health has an official icon grid system defined in the Brand Health Book. Icons are flat/outlined style, built on a 10×10 grid with a 1-unit safe area on all sides, giving an effective design space of 8×8 units (or 9×9 per the brand book specification)."),
        sp(),
        h2("4.1 Icon Grid System"),
        t2([
          ["Grid size", "10×10 box grid"],
          ["Safe area", "1 box all around (icon content within inner 8×8 or 9×9 area)"],
          ["Max height", "17 boxes (for tall icon compositions with text)"],
          ["Gap to label", "23pt minimum between icon and accompanying text label"],
          ["Style", "Flat, clean, geometric — no photorealistic detail"],
          ["Stroke weight", "Consistent, proportional to grid size"],
        ]),
        sp(),
        h2("4.2 Icon Color Variants"),
        t2([
          ["Communication icons (single color)", "Used in ads, social media, print — solid single color (usually brand blue #034EA2 or white on dark bg)"],
          ["Hospital signage icons (two color)", "Blue (#034EA2) + Red (#ED1C24) — EVERY signage icon MUST contain BOTH brand colors"],
          ["Web UI icons", "Use single-color blue (#034EA2) or white, consistent with context"],
          ["Department icons", "Heart Care, Bone & Spine Care, Physical Medicine — use established department marks"],
        ]),
        warn("Hospital signage icons must always use both brand colors (#034EA2 + #ED1C24). This rule is non-negotiable per the Brand Health Book."),
        sp(),
        h2("4.3 Icon Categories for Website"),
        thead(["Category", "Examples", "Style"],
          [
            ["Medical Specialities", "Heart, brain, bone, kidney, eye, lungs, spine, stethoscope", "Two-tone Blue+Red (web: blue outline)"],
            ["Navigation / UI", "Search, menu, arrow, close, phone, location pin, calendar", "Single-color blue or gray"],
            ["Service types", "Hospital, clinic, lab, pharmacy, ambulance, consultation", "Single-color, simplified"],
            ["Actions / CTAs", "Book, call, download, directions, share, video, upload", "Single-color blue or white-on-blue"],
            ["Status / Badges", "Checkmark, available, verified, JCI/NABH accreditation", "Green (available), Blue (verified)"],
            ["Network indicators", "Stats counters — beds, patients, specialities, years", "Large numerals with small label below"],
          ]
        ),

        // =====================
        // SECTION 5: PHOTOGRAPHY
        // =====================
        sp(2), hr(),
        h1("5. Photography Guidelines"),
        body("The Brand Health Book defines photography as spanning 'the spectrum of optimism to vitality.' All imagery must depict people who are 'responsible, aware, and committed.' The brand is portrayed best with 'relatable faces and characters in a plausible middle-class environment.'"),
        sp(),
        h2("5.1 Three Approved Image Categories"),
        thead(["Category", "Guidelines", "Rules"],
          [
            ["OUTDOOR", "Happy, bright, open environments — nature, parks, streets. Denoting health, hope, and prosperity.", "• Background must not be cluttered\n• Protagonists must NOT look into camera\n• No enhanced blues or blacks in processing\n• No doctor imagery outdoors"],
            ["INDOOR", "Home, domestic, comfortable settings. Well-lit, decluttered, warm environments.", "• Protagonists must NOT look into camera\n• Denotes hope, happiness, good health\n• Avoid blurry or posed patient shots"],
            ["DOCTOR", "Clinical settings within hospital premises only. Professional and reassuring.", "• Doctor may look directly into camera (confidently)\n• OR doctor reassuring/caring for patient (not looking at camera)\n• Always within hospital premises\n• White coat standard unless surgical context"],
          ]
        ),
        sp(),
        h2("5.2 Images to AVOID (Official Brand Book Rules)"),
        warn("These are strictly prohibited in ALL Narayana Health communications including the website:"),
        sp(),
        bullet("✗ Doctor outside hospital premises"),
        bullet("✗ Outdoor photos with enhanced blues or blacks (heavy post-processing)"),
        bullet("✗ Posed, staged patient photos"),
        bullet("✗ Blurry or out-of-focus images"),
        bullet("✗ Imagery depicting extreme poverty or social deprivation"),
        bullet("✗ Exaggerated emotions (crying, distress, extreme joy)"),
        bullet("✗ Imagery showing hopelessness, sadness, or disappointment"),
        bullet("✗ Imagery of internal organs, anatomical diagrams in photography"),
        bullet("✗ Photos of medical technology/equipment (MRI machines, operating theatres)"),
        sp(),
        h2("5.3 Web Image Specifications"),
        t2([
          ["Format", "WebP (primary for web performance); JPEG fallback"],
          ["Quality", "q=75 (as used on current site via Next.js image optimization)"],
          ["CDN", "Azure Blob Storage CDN — current infrastructure"],
          ["Hero images", "16:9 or wider; min 1920×800px; max file size 500KB"],
          ["Doctor photos", "1:1 ratio for circular crop; min 400×400px; clean neutral background"],
          ["Card images", "4:3 or 3:2; min 600×400px"],
          ["OG/Social images", "1200×630px; include logo"],
          ["Color grading", "Neutral to cool-toned; avoid heavy saturation or dramatic filters"],
          ["Stock photos", "Use diverse, relatable Indian middle-class subjects; avoid obvious Western stock imagery"],
        ]),

        // =====================
        // SECTION 6: LOGO USAGE ON WEB
        // =====================
        sp(2), hr(),
        h1("6. Logo Usage on Web"),
        sp(),
        h2("6.1 Header / Navigation"),
        t2([
          ["Position", "Top-left of sticky navigation bar"],
          ["Background", "White navigation bar — logo displays in full color"],
          ["On scroll (blue nav)", "White reverse logo — blue mark becomes white, or white band behind colored logo"],
          ["Minimum size", "175px width on screen"],
          ["Clear space (digital)", "Maintain 2× heart icon width clear space on all sides"],
          ["Mobile header", "Logo may be slightly smaller but never below 120px wide"],
          ["Click target", "Always links to homepage (/)"],
        ]),
        sp(),
        h2("6.2 Sub-Brand Logos (Partner Hospitals)"),
        body("Partner hospital logos use a 'conjoined' layout where the partner name/logo appears alongside the NH logo. Rules:"),
        bullet("Conjoined partner logos may ONLY be used independently within hospital premises"),
        bullet("For major campaigns (ATL/BTL): Use Narayana Health logo only; partner name appears in footer with address"),
        bullet("Partner hospitals: RL Jalappa (Kolar), Dharamshila, Bafna, MMI Health, Brahmananda Narayana Hospital (Jamshedpur)"),
        sp(),
        h2("6.3 One Health Sub-Brand"),
        body("The 'One Health' logo covers Lab and Clinic sub-brands. It can be used independently alongside Narayana Health branding. On the website, One Health services are listed in the network tagline: 'Hospitals | Health City | Clinics | Labs | Pharma | One Health'"),
        sp(),
        h2("6.4 Department Sub-Brands (Internal Use)"),
        bullet("Heart Care — dedicated department mark"),
        bullet("Bone & Spine Care — dedicated department mark"),
        bullet("Physical Medicine & Rehabilitation — dedicated department mark"),
        bullet("These appear on internal signage and can be used on department-specific web pages"),

        // =====================
        // SECTION 7: INFORMATION ARCHITECTURE
        // =====================
        sp(2), hr(),
        h1("7. Website Information Architecture"),
        body("The site is structured around three primary user journeys: (1) Find care and book an appointment, (2) Learn about specialities and hospitals, (3) Explore the organization. Navigation is persistent, global, and location-aware."),
        sp(),
        h2("7.1 Primary Navigation (8 Main Sections)"),
        thead(["Nav Item", "Key Sub-pages", "Primary CTA"],
          [
            ["Find a Doctor", "Search by name/speciality/city; Doctor profiles; Availability", "Book Appointment / Call"],
            ["Specialities", "30+ speciality pages; Conditions & Procedures per speciality", "Book Appointment"],
            ["Hospitals", "City-based listing; Individual hospital pages; Virtual Tour", "Request Consultation"],
            ["Procedures", "Cutting-edge surgical & medical procedures A–Z", "Learn More / Book"],
            ["Health Library", "Diseases A–Z; Wellness articles; Condition guides", "Find a Specialist"],
            ["Health Checks", "Preventive packages; Age/gender-based filters; Book online", "Book Health Check"],
            ["International Patients", "Plan Visit; Estimate; Bangladesh Help Desk; Insurance", "Make an Enquiry"],
            ["About Us", "NH Overview; Leadership; Awards; CSR; Research; Careers", "Contact / Careers"],
          ]
        ),
        sp(),
        h2("7.2 Utility Navigation (Top-Right Header)"),
        t2([
          ["Book Appointment", "PRIMARY CTA — blue button, always visible in sticky header"],
          ["Download NH Care App", "Text link to App Store / Play Store"],
          ["Location Selector", "City dropdown — filters doctors, hospitals, phone numbers"],
          ["Pay Online", "Patient bill payment link"],
          ["1800 309 0309", "Toll-free number — prominently displayed"],
        ]),
        sp(),
        h2("7.3 Complete URL Structure"),
        thead(["URL Pattern", "Page", "Type"],
          [
            ["/", "Homepage", "Marketing"],
            ["/specialities", "All Specialities", "Hub"],
            ["/specialities/[slug]", "Individual Speciality", "Depth"],
            ["/find-a-doctor → /ocaapp/doctors/[city]", "Doctor Search & Booking", "Transactional"],
            ["/hospitals", "Hospital Network", "Hub"],
            ["/hospitals/[slug]", "Individual Hospital", "Depth"],
            ["/procedures", "All Procedures", "Hub"],
            ["/diseases", "Health Library Hub", "Content"],
            ["/diseases/[slug]", "Article / Condition", "Content"],
            ["/health-checks", "Health Check Packages", "Transactional"],
            ["/about-us", "About Narayana Health", "Brand"],
            ["/csr-overview", "CSR Overview", "Brand"],
            ["/csr-health", "CSR Health Initiatives", "Brand"],
            ["internationalpatientcare.*", "International Patients Portal", "Subdomain"],
            ["hospital.*", "Hospital Landing Pages", "Subdomain"],
            ["jobs.*", "Careers Portal", "Subdomain"],
            ["narayana.health", "Patient Health Records (PHR)", "Product"],
          ]
        ),
        sp(),
        h2("7.4 Footer Navigation"),
        t2([
          ["Column 1 — Quick Links", "Home | Find a Doctor | Specialities | Hospitals | Procedures | Health Library"],
          ["Column 2 — Patient Services", "Health Checks | International Patients | Insurance | Pay Online | Feedback | Virtual Tour"],
          ["Column 3 — About NH", "About Us | Awards & Accreditation | CSR | Research | Media | Investor Relations"],
          ["Column 4 — Legal", "Privacy Policy | Terms & Conditions | Cookie Policy | Disclaimer | Sitemap"],
          ["Column 5 — Contact", "Toll-free: 1800 309 0309 | info@narayanahealth.org | City-specific numbers"],
          ["Social Links", "Facebook | Instagram | LinkedIn | YouTube | Twitter/X"],
          ["App Downloads", "NH Care App — iOS App Store + Google Play badges"],
          ["Network descriptor", "'Our Network: Hospitals | Health City | Clinics | Labs | Pharma | One Health'"],
          ["Footer brand tagline", "'Take Care' in Helvetica Neue Heavy Italic"],
        ]),

        // =====================
        // SECTION 8: PAGE TEMPLATES
        // =====================
        sp(2), hr(),
        h1("8. Page Templates & Layouts"),
        sp(),
        h2("8.1 Homepage Layout"),
        t2([
          ["Hero Carousel", "Full-width; 60–70vh desktop; auto-rotate 5s; H1 white bold + sub white regular; 2 CTAs (primary blue + ghost white)"],
          ["Quick Access Bar", "5–6 icon links: Find Doctor | Specialities | Hospitals | Health Checks | Procedures | International"],
          ["Trust Stats Strip", "4 stats: 2.5M+ Patients | 64K+ International | 78 Nationalities | 30+ Specialities; blue/white alternating"],
          ["Specialities Grid", "Icon + label cards; hover: blue highlight; 6–8 featured, 'View All' CTA"],
          ["Find Doctor Widget", "Inline search: city + speciality + name; Book button in blue"],
          ["Featured Hospitals", "Card grid: city photo + hospital name + top specialities + CTA"],
          ["Featured Procedures", "3–4 highlighted procedures with blue accent left-border"],
          ["Health Library", "3–4 article cards: image + headline + snippet + date + 'Read More'"],
          ["Patient Stories", "Video or quote testimonials; faces of relatable patients"],
          ["International CTA", "Full-width blue band: stats + 'Make an Enquiry' CTA + Bangladesh help desk callout"],
          ["CSR Section", "Warm photography (outdoor/lifestyle) + brief text + 'Learn More'"],
          ["App Download Banner", "Dark blue bg + NH Care App icon + QR code + store badges"],
        ]),
        sp(),
        h2("8.2 Speciality Page Template"),
        bullet("Hero: Full-width banner image + page title + breadcrumb (Home > Specialities > [Name])"),
        bullet("Overview: 2–3 paragraph intro to the department at NH"),
        bullet("Conditions Treated: Card grid or bullet list"),
        bullet("Procedures Offered: Linked list with procedure names"),
        bullet("Technology & Equipment: Text section (no equipment photography per brand guidelines)"),
        bullet("Our Doctors: Filterable card grid by hospital"),
        bullet("Hospital Availability: Which NH facilities offer this speciality"),
        bullet("Patient Outcomes / Stories: 1–2 testimonial cards"),
        bullet("Book Appointment CTA: Sticky bottom CTA on mobile"),
        sp(),
        h2("8.3 Hospital Page Template"),
        bullet("Hero: Hospital exterior + name + city + accreditation badges (JCI/NABH)"),
        bullet("Key Facts: Beds, OTs, ICUs, years operational"),
        bullet("Specialities at this Hospital: Icon grid linking to speciality pages"),
        bullet("Our Doctors: Filterable by speciality"),
        bullet("Facilities: Text-based list (no equipment photos)"),
        bullet("Visitor Info: Address, OPD timings, parking, transport"),
        bullet("Virtual Tour: Link/embed"),
        bullet("Insurance Accepted: Logo grid"),
        sp(),
        h2("8.4 Find a Doctor Page Template"),
        bullet("Search bar: Name / Speciality / Condition — autocomplete"),
        bullet("City filter: Dropdown (Bangalore, Delhi, Kolkata, Gurugram, etc.)"),
        bullet("Filter panel: Speciality | Hospital | Language | Availability"),
        bullet("Doctor cards: Circular photo | Name bold | Designation | Speciality chip | Hospital | Availability badge | Book + Call buttons"),
        bullet("Pagination with city persistence"),
        sp(),
        h2("8.5 Health Library Article Template"),
        bullet("Article grid on hub: Image + H3 title + snippet + category chip + date + 'Read More'"),
        bullet("A–Z alphabet filter + category filter"),
        bullet("Article detail: H1 | Structured sections (Overview, Causes, Symptoms, Diagnosis, Treatment, FAQ)"),
        bullet("Inline CTA: 'Book Appointment with a [Speciality] Specialist' — blue button mid-article"),
        bullet("Author: Reviewed by [Doctor Name, Designation] — blue text"),
        bullet("Social share buttons at bottom"),

        // =====================
        // SECTION 9: UI COMPONENTS
        // =====================
        sp(2), hr(),
        h1("9. UI Components & Design Tokens"),
        sp(),
        h2("9.1 Buttons"),
        thead(["Type", "Background", "Text", "Border", "Usage"],
          [
            ["Primary CTA", "#034EA2", "#FFFFFF", "None", "Book Appointment, Know More, Submit — all primary actions"],
            ["Primary Hover", "#023070", "#FFFFFF", "None", "Darkened blue on hover"],
            ["Secondary / Ghost", "#FFFFFF", "#034EA2", "2px #034EA2", "Learn More, View All, Cancel — secondary actions"],
            ["Ghost Hover", "#EEF3FA", "#023070", "2px #023070", "Light blue fill on hover"],
            ["Emergency / Phone", "#ED1C24", "#FFFFFF", "None", "Emergency number buttons, urgent health alerts"],
            ["Disabled", "#CCCCCC", "#888888", "None", "Inactive/unavailable actions"],
            ["Text Link", "transparent", "#034EA2", "None, underline on hover", "Inline links, footer links"],
          ]
        ),
        sp(),
        note("Button border-radius: 4–6px (slightly rounded, not fully pill-shaped). Button padding: 12–16px vertical, 24–32px horizontal. Font: Helvetica Neue Medium/Semi-bold, 14–16px."),
        sp(),
        h2("9.2 Doctor Cards"),
        t2([
          ["Container", "White bg, 1px border #E0E0E0, border-radius 8px, box-shadow (light)"],
          ["Photo", "Circular crop, 80–100px diameter, placeholder if unavailable"],
          ["Name", "Helvetica Neue Bold, 16–18px, color #1A1A2E"],
          ["Designation", "Regular, 13–14px, color #034EA2"],
          ["Speciality", "Chip/badge: #EEF3FA bg, #034EA2 text, 12px, border-radius 12px"],
          ["Hospital", "14px, gray text, map-pin icon prefix"],
          ["Availability", "Green pill: 'Available'; gray pill: 'Call for Time'"],
          ["CTAs", "Blue 'Book Appointment' button + phone icon link"],
        ]),
        sp(),
        h2("9.3 Navigation Bar"),
        t2([
          ["Default bg", "White (#FFFFFF), 1px bottom border #E0E0E0"],
          ["Scrolled / colored bg", "NH Blue (#034EA2); all text/icons white"],
          ["Logo", "Top-left; full color on white; white reverse on blue"],
          ["Nav items", "Helvetica Neue Medium, 14–15px; dark on white, white on blue"],
          ["Dropdown menus", "White bg, blue left-border accent on active; grid layout for Specialities, list for Hospitals"],
          ["Primary CTA", "Blue button 'Book Appointment' — always top-right; stays blue even on blue nav (use darker shade #023070)"],
          ["Mobile", "Hamburger → full-width slide-in drawer from left; same hierarchy, larger touch targets (min 48px)"],
          ["Sticky", "Stays fixed at top on all scroll positions"],
        ]),
        sp(),
        h2("9.4 Speciality / Service Cards"),
        t2([
          ["Container", "White bg, hover: blue (#034EA2) bg; transition 200ms ease"],
          ["Icon", "Medical specialty icon; blue on white; white on hover-blue"],
          ["Label", "Helvetica Neue Medium, 13–14px; dark on white; white on blue hover"],
          ["Interaction", "Card is entirely clickable; links to /specialities/[slug]"],
          ["Grid", "5–6 column on desktop; 3 on tablet; 2 on mobile"],
        ]),
        sp(),
        h2("9.5 Hero Banner"),
        t2([
          ["Structure", "Full-width image carousel with content overlay"],
          ["Image guidelines", "Clinical photography: doctors, patients, lifestyle — per brand photo rules"],
          ["Overlay", "Dark gradient from left (50–60% opacity) OR blue (#034EA2) block for copy area"],
          ["H1", "Helvetica Neue LT Heavy, 48–64px, white"],
          ["Sub-copy", "Helvetica Neue Regular, 18–22px, white or light (#CCDDF5)"],
          ["CTAs", "Primary blue button + optional ghost/outline white button"],
          ["Carousel", "Auto-advance every 5–6s; prev/next arrows; dot indicators; pause on hover"],
          ["Mobile height", "40–50vh on mobile; 60–70vh on desktop"],
        ]),
        sp(),
        h2("9.6 Forms & Inputs"),
        t2([
          ["Input field", "White bg, 1px #E0E0E0 border, border-radius 4px, 14–15px text"],
          ["Focus state", "2px blue (#034EA2) border ring"],
          ["Error state", "2px red (#ED1C24) border, error message below in red"],
          ["Dropdown", "White bg with blue caret; options list with blue highlight on hover"],
          ["Search bar", "White with blue magnifier icon; autocomplete with blue text suggestions"],
          ["Label", "Above input, 13–14px, Helvetica Neue Medium, #1A1A2E"],
          ["Placeholder", "14px, #AAAAAA"],
          ["Submit button", "Primary blue CTA, full width on mobile"],
        ]),
        sp(),
        h2("9.7 Badges, Tags & Chips"),
        t2([
          ["Availability — Online", "Green (#2E7D32) dot + 'Available' text; pill shape"],
          ["Availability — Unavailable", "Gray dot + 'Call for Appointment'; gray pill"],
          ["Speciality Tag", "Blue bg tint (#EEF3FA), blue text (#034EA2), border-radius 12px, 11–12px"],
          ["Location Chip", "Gray bg, map-pin icon, 12–13px, gray text"],
          ["Accreditation", "JCI badge, NABH badge — official logos only; never recreated"],
          ["Stats Counter", "Large bold number (Helvetica Neue Heavy), small descriptor below (Regular)"],
          ["New / Featured", "Red (#ED1C24) ribbon — use sparingly"],
        ]),
        sp(),
        h2("9.8 Trust Stats Strip"),
        t2([
          ["Layout", "Horizontal row of 4 stats; white or blue background; center-aligned"],
          ["Stat number", "Helvetica Neue LT Heavy, 36–42px, NH Blue (#034EA2) or white"],
          ["Descriptor", "Helvetica Neue Regular, 13–14px, gray or white"],
          ["Dividers", "1px vertical line between stats"],
          ["Official figures", "2.5M+ Patients Treated | 64,000+ International Patients | 78 Nationalities | 30+ Specialities"],
        ]),

        // =====================
        // SECTION 10: SPACING & GRID
        // =====================
        sp(2), hr(),
        h1("10. Spacing & Grid System"),
        sp(),
        h2("10.1 Layout Grid"),
        t2([
          ["Desktop (≥1280px)", "12-column grid, 1200–1400px max container, 24–32px gutters, 48px margins"],
          ["Tablet (768–1279px)", "8-column grid, fluid container, 20px gutters, 32px margins"],
          ["Mobile (320–767px)", "4-column grid, fluid container, 16px gutters, 20px margins"],
          ["Content width", "Max 1240px centered; hero images full-bleed (100vw)"],
        ]),
        sp(),
        h2("10.2 Spacing Scale (8px Base Unit)"),
        thead(["Token", "Value", "Usage"],
          [
            ["space-1", "4px", "Icon-to-text gap, fine adjustments"],
            ["space-2", "8px", "Tight inline spacing, badge padding"],
            ["space-3", "12px", "Input padding, small internal spacing"],
            ["space-4", "16px", "Card padding (mobile), standard gap"],
            ["space-5", "24px", "Card padding (desktop), section element spacing"],
            ["space-6", "32px", "Between card groups, section internal padding"],
            ["space-7", "48px", "Between major sections"],
            ["space-8", "64px", "Section top/bottom padding (desktop)"],
            ["space-9", "96px", "Hero section padding, major breaks"],
            ["space-10", "128px", "Large feature section spacing"],
          ]
        ),
        sp(),
        h2("10.3 Section Alternation Pattern"),
        body("The website uses alternating section backgrounds to create visual rhythm without additional colors:"),
        bullet("Section 1: White (#FFFFFF) background"),
        bullet("Section 2: Light blue-gray (#F3F5F9 or #EEF3FA) background"),
        bullet("Section 3: White (#FFFFFF) background"),
        bullet("Section 4: NH Blue (#034EA2) background — for stats strip or CTA blocks"),
        bullet("Never use two consecutive blue (#034EA2) sections"),

        // =====================
        // SECTION 11: SHADOWS & ELEVATION
        // =====================
        sp(2), hr(),
        h1("11. Shadows, Borders & Elevation"),
        sp(),
        h2("11.1 Shadow System"),
        thead(["Level", "CSS Value", "Usage"],
          [
            ["elevation-0", "none", "Flat elements, section backgrounds"],
            ["elevation-1", "0 1px 3px rgba(3,78,162,0.08), 0 1px 2px rgba(0,0,0,0.06)", "Cards (resting), inputs"],
            ["elevation-2", "0 4px 6px rgba(3,78,162,0.10), 0 2px 4px rgba(0,0,0,0.06)", "Cards (hover), dropdowns"],
            ["elevation-3", "0 10px 15px rgba(3,78,162,0.12), 0 4px 6px rgba(0,0,0,0.08)", "Modals, floating panels"],
            ["elevation-4", "0 20px 25px rgba(3,78,162,0.15), 0 10px 10px rgba(0,0,0,0.04)", "Nav dropdowns, sticky headers"],
          ]
        ),
        sp(),
        note("Use blue-tinted shadows (rgba(3,78,162,...)) not pure black shadows — this maintains brand color harmony at the shadow level."),
        sp(),
        h2("11.2 Border Radius"),
        t2([
          ["radius-sm", "4px — input fields, small chips, table cells"],
          ["radius-md", "8px — cards, modal containers, dropdown menus"],
          ["radius-lg", "12px — hero content boxes, large feature cards"],
          ["radius-xl", "20px — app store badge buttons, rounded CTA pills (sparingly)"],
          ["radius-full", "9999px — avatar circles, availability pills, tag chips"],
          ["No radius", "0px — full-bleed sections, hero banners, table header rows"],
        ]),
        sp(),
        h2("11.3 Borders"),
        t2([
          ["Card border", "1px solid #E0E0E0 — standard card containers"],
          ["Input border", "1px solid #CCCCCC — default; 2px #034EA2 on focus"],
          ["Section divider", "1px solid #E8E8E8 — between sections in same container"],
          ["Active nav item", "3px solid #034EA2 bottom border — active navigation state"],
          ["Accent left border", "4–6px solid #034EA2 — callout boxes, list items with hierarchy"],
          ["Red accent bar", "Width = 1/7 of overall container (per brand template system)"],
        ]),

        // =====================
        // SECTION 12: MOTION
        // =====================
        sp(2), hr(),
        h1("12. Motion & Animation Principles"),
        sp(),
        t2([
          ["General philosophy", "Subtle, purposeful motion — never decorative for its own sake"],
          ["Transition duration", "150ms (micro: hover/focus) | 250ms (standard: open/close) | 400ms (page: hero)"],
          ["Easing", "ease-out for elements entering; ease-in for elements leaving; ease-in-out for toggles"],
          ["Hero carousel", "Fade transition 600ms; auto-advance 5000ms; pause on hover"],
          ["Card hover", "Lift effect: box-shadow elevation 1→2; translate Y -4px; 200ms ease-out"],
          ["CTA hover", "Background darkens (#034EA2 → #023070); 150ms ease"],
          ["Dropdown menus", "Fade + slide down 250ms ease-out"],
          ["Page transitions", "Scroll reveal: fade-in + translate-up on scroll-into-view; stagger 100ms between items"],
          ["Loading states", "Skeleton screens in #EEF3FA with shimmer animation; no spinner overlays"],
          ["Stat counters", "Animated count-up on scroll-into-view; 1200ms duration"],
          ["Reduced motion", "Respect prefers-reduced-motion: no animations, instant transitions"],
        ]),

        // =====================
        // SECTION 13: DIGITAL COMMUNICATION SPECS
        // =====================
        sp(2), hr(),
        h1("13. Digital Communication Templates"),
        body("The Brand Health Book defines official dimensions for all digital communication. These must be referenced for website banners, social media integration, and email campaigns."),
        sp(),
        h2("13.1 GDN / Web Banner Sizes (from Brand Book)"),
        t2([
          ["Square", "300×300px"],
          ["Half Page (Tall)", "300×600px"],
          ["Leaderboard", "750×90px"],
          ["Email / Emailer", "1080×1920px"],
        ]),
        sp(),
        h2("13.2 Social Media (from Brand Book)"),
        t2([
          ["Feed Post (square)", "1080×1080px — with image AND without image variants defined"],
          ["Carousel Post", "1080×1080px per slide; maintain background continuity across slides"],
          ["YouTube Thumbnail", "Two templates defined — left: doctor photo, right: blue copy block"],
          ["YouTube Shorts", "9:16 vertical; 4 frames: intro, doctor intro, content, outro/end card"],
          ["YouTube End Slide", "Common template: large NH logo centered, phone + website + app links"],
          ["PowerPoint", "Standard 16:9; left half: doctor photo; right half: blue content area with NH logo"],
        ]),
        sp(),
        h2("13.3 Key Digital Design Layout Pattern"),
        body("Across ALL communication templates (ads, social, email, outdoor), Narayana Health uses a consistent 2-zone layout:"),
        bullet("LEFT ZONE: Photography / human image (warm, aspirational, lifestyle)"),
        bullet("RIGHT ZONE: Brand blue (#034EA2) block with white headline text"),
        bullet("ACCENT: Red (#ED1C24) vertical bar at 1/7th width of the copy zone"),
        bullet("BOTTOM STRIP: Red or blue band — 'Our Network: Hospitals | Health City | Clinics | Labs | Pharma | One Health'"),
        bullet("FOOTER LINE: 'Take Care | Location | Phone number'"),
        note("This 2-zone layout is the unifying visual system across all NH touchpoints. The website hero banners and feature sections should reference this compositional approach."),

        // =====================
        // SECTION 14: STATIONERY REFERENCE
        // =====================
        sp(2), hr(),
        h1("14. Stationery Specifications Reference"),
        body("Stationery dimensions are important reference for the design team to understand brand standards across all touchpoints. The website redesign should maintain visual consistency with these physical materials."),
        sp(),
        h2("14.1 Stationery Inventory (from Brand Health Book)"),
        thead(["Item", "Size", "Key Elements"],
          [
            ["Doctor Visiting Card (front)", "90×55mm", "Logo TL | Doctor name (blue bold) | Designation (red) | Hospital address | Phone | Accreditations | QR code"],
            ["General Visiting Card (back)", "90×55mm", "Blue bg | 'Take Care' italic | QR code for services"],
            ["Letterhead (Hospital)", "A4 (210×297mm)", "Logo TL | website TR | footer: address + phone + email + accreditations + QR"],
            ["Letterhead (Corporate)", "A4 (210×297mm)", "Logo TL | website TR | footer: Bommasandra address + CIN"],
            ["Prescription Pad", "A4 (210×297mm)", "Logo TL | Doctor details TR | Patient name/age/sex/date | Footer: address + phone + website"],
            ["Envelope A4 (Hospital)", "9×12 inch", "Logo TL | Patient fields | Footer: blue band 'Our Network' strip"],
            ["Patient Folder", "254×304.8mm", "Cover: logo + QR codes | Inside: blue | 'We are there to Take Care'"],
            ["ID Card (Employee)", "85.73×54mm", "Logo top | Photo | Name + designation + ID number (blue bar bottom)"],
            ["Visitor Pass", "88.9×139.7mm", "Logo + patient details | Blue ID band at bottom"],
            ["Notepad (Hospital/Corporate)", "A5 (148×210mm)", "Cover: logo + date lines | Back: address + accreditations"],
            ["MRI/CT Envelope", "482.6×381mm", "Logo + 'MRI/CT Scan' label + patient fields"],
            ["X-Ray Envelope", "330.2×266.7mm", "Logo + patient fields + 'protect from sunlight' note"],
          ]
        ),
        sp(),
        h2("14.2 Consistent Stationery Elements"),
        bullet("'Take Care' — appears on ALL stationery (Helvetica Neue LT Heavy Italic, blue on white or white on blue)"),
        bullet("'Our Network: Hospitals | Health City | Clinics | Labs | Pharma | One Health' — all external-facing stationery"),
        bullet("1800 309 0309 — toll-free number always included with phone icon"),
        bullet("www.narayanahealth.org — website URL always included with globe icon"),
        bullet("Accreditations strip — JCI + NABH logos on all hospital stationery"),
        bullet("QR code — links to services or app download; appears on most stationery"),
        bullet("Minimum font size: 6pt in all stationery applications"),

        // =====================
        // SECTION 15: DO'S & DON'TS
        // =====================
        sp(2), hr(),
        h1("15. Design Do's & Don'ts — Quick Reference"),
        sp(),
        h2("15.1 Color Do's & Don'ts"),
        thead(["✓ DO", "✗ DON'T"],
          [
            ["Use #034EA2 as the primary brand color throughout", "Use any other blue not derived from #034EA2"],
            ["Use #ED1C24 only for 'Health' wordmark, accent bars, and emergencies", "Use red as a general CTA or highlight color"],
            ["Build tints using opacity of #034EA2 (5%–95%)", "Introduce any new colors not in the brand system"],
            ["Maintain WCAG AA contrast on all text", "Use light blue text on white backgrounds"],
            ["Use white generously for clean breathing space", "Create dark/heavy all-blue pages"],
          ]
        ),
        sp(),
        h2("15.2 Typography Do's & Don'ts"),
        thead(["✓ DO", "✗ DON'T"],
          [
            ["Use Helvetica Neue for all type (or licensed fallback)", "Use any other typeface for brand communications"],
            ["Follow the 5-weight hierarchy (Heavy/Bold/Medium/Regular/Heavy Italic)", "Mix more than 3 weights on a single screen"],
            ["'Take Care' and brand taglines in Helvetica Neue LT Heavy Italic", "Use the Heavy Italic for body copy or general text"],
            ["Regional content in specified regional fonts (Noto Sans etc)", "Use generic system fonts for regional language content"],
            ["Minimum 16px body text; 12px for metadata only", "Go below 12px on screen or 6pt in print"],
          ]
        ),
        sp(),
        h2("15.3 Photography Do's & Don'ts"),
        thead(["✓ DO", "✗ DON'T"],
          [
            ["Show relatable Indian middle-class subjects, optimistic mood", "Show extreme poverty, deprivation, or desperation"],
            ["Doctor photos: inside hospital, confident camera-facing OR caring for patient", "Show doctors outside hospital premises"],
            ["Lifestyle shots: subjects NOT looking at camera", "Use posed, obviously staged patient photography"],
            ["Cool-neutral color grading, natural lighting", "Enhance blues/blacks dramatically; heavy filters"],
            ["Lifestyle images showing health, vitality, hope", "Show internal organs, medical equipment in photographs"],
          ]
        ),
        sp(),
        h2("15.4 Logo Do's & Don'ts"),
        thead(["✓ DO", "✗ DON'T"],
          [
            ["Always reproduce logo in full (icon + wordmark)", "Use the heart icon as a standalone mark"],
            ["Always place logo on white background or white band", "Place logo directly on photography or dark colors without white band"],
            ["Maintain 2× heart unit clear space on all sides", "Allow other elements to crowd the logo"],
            ["Minimum 175px wide on screen / 1 inch in print", "Reproduce logo at smaller sizes"],
            ["Use only exact HEX #034EA2 and #ED1C24 in the logo", "Alter, recolor, or add effects to the logo"],
          ]
        ),
        sp(),
        h2("15.5 Website-Specific Rules"),
        bullet("'Book Appointment' button must ALWAYS be visible in the sticky header"),
        bullet("Location selector must persist across pages and filter doctor/hospital results"),
        bullet("All interior pages must show breadcrumb navigation (Home > Section > Page)"),
        bullet("Bangladesh Help Desk must remain prominently visible in the International Patients section"),
        bullet("Stats (2.5M+, 64K+, 78 nations, 30+ specialities) must appear on the homepage trust strip"),
        bullet("JCI and NABH accreditation badges must appear on hospital pages"),
        bullet("'Take Care' sign-off appears on all outbound communications (emails, stationery)"),
        bullet("'Our Network: Hospitals | Health City | Clinics | Labs | Pharma | One Health' must appear in footer"),

        // END
        sp(2), hr(),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 200, after: 60 },
          children: [run("— End of Design System Document —", { size: 20, color: MID_GRAY, italics: true })]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 40, after: 40 },
          children: [run("Narayana Health Website Design System | Based on Official Brand Health Book | narayanahealth.org | May 2026", { size: 18, color: MID_GRAY })]
        }),
      ]
    }
  ]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync('/home/claude/NH_Website_Design_System.docx', buffer);
  console.log('Done!');
});
