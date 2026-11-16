import os
import zipfile
import xml.etree.ElementTree as ET
import csv

def make_excel(filename, sheets_data):
    """
    Creates a native OpenXML .xlsx file without external dependencies.
    sheets_data: list of dicts:
      {
         'name': 'Sheet Name',
         'headers': ['Col1', 'Col2', ...],
         'rows': [ ['Val1', 'Val2', ...], ... ],
         'col_widths': [20, 30, ...]
      }
    """
    
    # Pre-build shared strings table
    shared_strings = []
    string_map = {}
    
    def get_string_id(s):
        s = str(s) if s is not None else ""
        if s in string_map:
            return string_map[s]
        idx = len(shared_strings)
        shared_strings.append(s)
        string_map[s] = idx
        return idx

    # Pre-index all cell values
    for sheet in sheets_data:
        for h in sheet['headers']:
            get_string_id(h)
        for row in sheet['rows']:
            for val in row:
                get_string_id(val)

    # 1. [Content_Types].xml
    content_types = [
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
        '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">',
        '  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>',
        '  <Default Extension="xml" ContentType="application/xml"/>',
        '  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>',
        '  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>',
        '  <Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedString+xml"/>'
    ]
    for i in range(len(sheets_data)):
        content_types.append(f'  <Override PartName="/xl/worksheets/sheet{i+1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>')
    content_types.append('</Types>')

    # 2. _rels/.rels
    root_rels = [
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">',
        '  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>',
        '</Relationships>'
    ]

    # 3. xl/_rels/workbook.xml.rels
    wb_rels = [
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
    ]
    for i in range(len(sheets_data)):
        wb_rels.append(f'  <Relationship Id="rId{i+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet{i+1}.xml"/>')
    wb_rels.append(f'  <Relationship Id="rId{len(sheets_data)+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>')
    wb_rels.append(f'  <Relationship Id="rId{len(sheets_data)+2}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/>')
    wb_rels.append('</Relationships>')

    # 4. xl/workbook.xml
    wb_xml = [
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
        '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">',
        '  <sheets>'
    ]
    for i, s in enumerate(sheets_data):
        wb_xml.append(f'    <sheet name="{s["name"]}" sheetId="{i+1}" r:id="rId{i+1}"/>')
    wb_xml.append('  </sheets>')
    wb_xml.append('</workbook>')

    # 5. xl/styles.xml (professional styling: NH Blue header, alternate zebra rows, borders, clean font)
    styles_xml = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="3">
    <font><name val="Inter"/><sz val="10"/><color rgb="FF1F2937"/></font>
    <font><name val="Inter"/><sz val="10.5"/><b/><color rgb="FFFFFFFF"/></font>
    <font><name val="Inter"/><sz val="10"/><b/><color rgb="FF034EA2"/></font>
  </fonts>
  <fills count="5">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF034EA2"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFF8FAFC"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFE2E8F0"/></patternFill></fill>
  </fills>
  <borders count="2">
    <border><left/><right/><top/><bottom/></border>
    <border>
      <left style="thin"><color rgb="FFE2E8F0"/></left>
      <right style="thin"><color rgb="FFE2E8F0"/></right>
      <top style="thin"><color rgb="FFE2E8F0"/></top>
      <bottom style="thin"><color rgb="FFE2E8F0"/></bottom>
    </border>
  </borders>
  <cellStyleXfs count="1">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0"/>
  </cellStyleXfs>
  <cellXfs count="4">
    <!-- 0: normal -->
    <xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1"/>
    <!-- 1: header NH blue -->
    <xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1">
      <alignment horizontal="center" vertical="center" wrapText="1"/>
    </xf>
    <!-- 2: alternate zebra row -->
    <xf numFmtId="0" fontId="0" fillId="3" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1"/>
    <!-- 3: bold tag / code -->
    <xf numFmtId="0" fontId="2" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1"/>
  </cellXfs>
</styleSheet>"""

    # 6. xl/sharedStrings.xml
    ss_xml = [
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
        f'<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="{len(shared_strings)}" uniqueCount="{len(shared_strings)}">'
    ]
    for s in shared_strings:
        # Escape XML entities
        esc = s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;').replace('"', '&quot;')
        ss_xml.append(f'  <si><t>{esc}</t></si>')
    ss_xml.append('</sst>')

    def col_name(n):
        res = ""
        while n > 0:
            n, rem = divmod(n - 1, 26)
            res = chr(65 + rem) + res
        return res

    # Write ZIP
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    with zipfile.ZipFile(filename, 'w', compression=zipfile.ZIP_DEFLATED) as z:
        z.writestr('[Content_Types].xml', '\n'.join(content_types))
        z.writestr('_rels/.rels', '\n'.join(root_rels))
        z.writestr('xl/_rels/workbook.xml.rels', '\n'.join(wb_rels))
        z.writestr('xl/workbook.xml', '\n'.join(wb_xml))
        z.writestr('xl/styles.xml', styles_xml)
        z.writestr('xl/sharedStrings.xml', '\n'.join(ss_xml))

        for idx, sheet in enumerate(sheets_data):
            sheet_xml = [
                '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
                '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
            ]
            
            # Column widths
            if 'col_widths' in sheet and sheet['col_widths']:
                sheet_xml.append('  <cols>')
                for col_idx, w in enumerate(sheet['col_widths']):
                    sheet_xml.append(f'    <col min="{col_idx+1}" max="{col_idx+1}" width="{w}" customWidth="1"/>')
                sheet_xml.append('  </cols>')

            sheet_xml.append('  <sheetData>')
            
            # Header row (row 1)
            sheet_xml.append('    <row r="1" ht="28" customHeight="1">')
            for col_idx, h in enumerate(sheet['headers']):
                cell_ref = f'{col_name(col_idx+1)}1'
                sid = string_map[str(h)]
                sheet_xml.append(f'      <c r="{cell_ref}" t="s" s="1"><v>{sid}</v></c>')
            sheet_xml.append('    </row>')

            # Data rows
            for row_idx, row in enumerate(sheet['rows']):
                r_num = row_idx + 2
                style_id = 2 if row_idx % 2 == 1 else 0
                sheet_xml.append(f'    <row r="{r_num}" ht="22" customHeight="1">')
                for col_idx, val in enumerate(row):
                    cell_ref = f'{col_name(col_idx+1)}{r_num}'
                    sid = string_map[str(val)]
                    # Check if col 1 or 2 to give bold accent
                    cell_style = 3 if col_idx == 1 and str(val).startswith('<') else style_id
                    sheet_xml.append(f'      <c r="{cell_ref}" t="s" s="{cell_style}"><v>{sid}</v></c>')
                sheet_xml.append('    </row>')

            sheet_xml.append('  </sheetData>')
            sheet_xml.append('</worksheet>')
            z.writestr(f'xl/worksheets/sheet{idx+1}.xml', '\n'.join(sheet_xml))

print("Excel helper script created successfully.")
