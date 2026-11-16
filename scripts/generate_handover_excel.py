import os
import zipfile
import xml.sax.saxutils as saxutils

def make_excel_xml(filename_xls, sheets_data):
    """
    Creates an Excel 2003 XML spreadsheet (.xls).
    This format is 100% natively supported by every version of Microsoft Excel,
    Apple Numbers, Google Sheets, and LibreOffice without any schema or zip issues.
    """
    xml_lines = [
        '<?xml version="1.0"?>',
        '<?mso-application progid="Excel.Sheet"?>',
        '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"',
        ' xmlns:o="urn:schemas-microsoft-com:office:office"',
        ' xmlns:x="urn:schemas-microsoft-com:office:excel"',
        ' xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"',
        ' xmlns:html="http://www.w3.org/TR/REC-html40">',
        ' <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">',
        '  <Title>Narayana Health Design Tokens &amp; Components Handover</Title>',
        '  <Author>Narayana Health Design System</Author>',
        ' </DocumentProperties>',
        ' <Styles>',
        '  <Style ss:ID="Default" ss:Name="Normal">',
        '   <Alignment ss:Vertical="Center"/>',
        '   <Borders/>',
        '   <Font ss:FontName="Segoe UI" x:Family="Swiss" ss:Size="10" ss:Color="#1F2937"/>',
        '   <Interior/>',
        '   <NumberFormat/>',
        '   <Protection/>',
        '  </Style>',
        '  <Style ss:ID="HeaderStyle">',
        '   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>',
        '   <Borders>',
        '    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#022D61"/>',
        '    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#022D61"/>',
        '    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#022D61"/>',
        '    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#022D61"/>',
        '   </Borders>',
        '   <Font ss:FontName="Segoe UI" x:Family="Swiss" ss:Size="10.5" ss:Bold="1" ss:Color="#FFFFFF"/>',
        '   <Interior ss:Color="#034EA2" ss:Pattern="Solid"/>',
        '  </Style>',
        '  <Style ss:ID="RowEven">',
        '   <Alignment ss:Vertical="Center" ss:WrapText="1"/>',
        '   <Borders>',
        '    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>',
        '    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>',
        '    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>',
        '    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>',
        '   </Borders>',
        '   <Interior ss:Color="#F8FAFC" ss:Pattern="Solid"/>',
        '   <Font ss:FontName="Segoe UI" x:Family="Swiss" ss:Size="10" ss:Color="#1E293B"/>',
        '  </Style>',
        '  <Style ss:ID="RowOdd">',
        '   <Alignment ss:Vertical="Center" ss:WrapText="1"/>',
        '   <Borders>',
        '    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>',
        '    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>',
        '    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>',
        '    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>',
        '   </Borders>',
        '   <Interior ss:Color="#FFFFFF" ss:Pattern="Solid"/>',
        '   <Font ss:FontName="Segoe UI" x:Family="Swiss" ss:Size="10" ss:Color="#1E293B"/>',
        '  </Style>',
        '  <Style ss:ID="CodeStyle">',
        '   <Alignment ss:Vertical="Center" ss:WrapText="1"/>',
        '   <Borders>',
        '    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>',
        '    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>',
        '    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>',
        '    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>',
        '   </Borders>',
        '   <Font ss:FontName="Menlo" x:Family="Modern" ss:Size="9.5" ss:Bold="1" ss:Color="#034EA2"/>',
        '   <Interior ss:Color="#EFF6FF" ss:Pattern="Solid"/>',
        '  </Style>',
        ' </Styles>'
    ]

    for sheet in sheets_data:
        sheet_name = saxutils.escape(sheet['name'])
        xml_lines.append(f' <Worksheet ss:Name="{sheet_name}">')
        xml_lines.append('  <Table>')
        
        # Columns definition
        if 'col_widths' in sheet:
            for w in sheet['col_widths']:
                # Multiply width approx for points
                pts = max(60, int(w * 7.5))
                xml_lines.append(f'   <Column ss:AutoFitWidth="0" ss:Width="{pts}"/>')

        # Header row
        xml_lines.append('   <Row ss:Height="28" ss:StyleID="HeaderStyle">')
        for h in sheet['headers']:
            esc_val = saxutils.escape(str(h))
            xml_lines.append(f'    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">{esc_val}</Data></Cell>')
        xml_lines.append('   </Row>')

        # Data rows
        for row_idx, row in enumerate(sheet['rows']):
            base_style = "RowEven" if row_idx % 2 == 1 else "RowOdd"
            xml_lines.append(f'   <Row ss:Height="24">')
            for col_idx, val in enumerate(row):
                esc_val = saxutils.escape(str(val))
                # Highlight code or JSX tag
                if col_idx == 1 and str(val).startswith('<'):
                    style_id = "CodeStyle"
                else:
                    style_id = base_style
                xml_lines.append(f'    <Cell ss:StyleID="{style_id}"><Data ss:Type="String">{esc_val}</Data></Cell>')
            xml_lines.append('   </Row>')

        xml_lines.append('  </Table>')
        xml_lines.append(' </Worksheet>')

    xml_lines.append('</Workbook>')

    os.makedirs(os.path.dirname(filename_xls), exist_ok=True)
    with open(filename_xls, 'w', encoding='utf-8') as f:
        f.write('\n'.join(xml_lines))
    print(f"Generated Excel XML (.xls): {filename_xls}")


def make_clean_xlsx(filename_xlsx, sheets_data):
    """
    Creates a minimal, 100% compliant OpenXML .xlsx file
    adhering strictly to Microsoft ECMA-376 schema standards.
    """
    shared_strings = []
    string_map = {}

    def get_sid(s):
        s = str(s) if s is not None else ""
        if s in string_map:
            return string_map[s]
        idx = len(shared_strings)
        shared_strings.append(s)
        string_map[s] = idx
        return idx

    for sheet in sheets_data:
        for h in sheet['headers']:
            get_sid(h)
        for row in sheet['rows']:
            for val in row:
                get_sid(val)

    # [Content_Types].xml
    ct = [
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
        '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">',
        '  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>',
        '  <Default Extension="xml" ContentType="application/xml"/>',
        '  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>',
        '  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>',
        '  <Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedString+xml"/>'
    ]
    for i in range(len(sheets_data)):
        ct.append(f'  <Override PartName="/xl/worksheets/sheet{i+1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>')
    ct.append('</Types>')

    # _rels/.rels
    root_rels = [
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">',
        '  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>',
        '</Relationships>'
    ]

    # xl/_rels/workbook.xml.rels
    wb_rels = [
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
    ]
    for i in range(len(sheets_data)):
        wb_rels.append(f'  <Relationship Id="rId{i+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet{i+1}.xml"/>')
    wb_rels.append(f'  <Relationship Id="rId{len(sheets_data)+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>')
    wb_rels.append(f'  <Relationship Id="rId{len(sheets_data)+2}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/>')
    wb_rels.append('</Relationships>')

    # xl/workbook.xml
    wb_xml = [
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
        '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">',
        '  <bookViews><workbookView xWindow="0" yWindow="0" windowWidth="22000" windowHeight="12000"/></bookViews>',
        '  <sheets>'
    ]
    for i, s in enumerate(sheets_data):
        wb_xml.append(f'    <sheet name="{saxutils.escape(s["name"])}" sheetId="{i+1}" r:id="rId{i+1}"/>')
    wb_xml.append('  </sheets>')
    wb_xml.append('</workbook>')

    # xl/styles.xml with 100% compliant schema: fonts, fills, borders (with diagonal!), cellStyleXfs, cellXfs
    styles_xml = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="3">
    <font><sz val="10"/><color rgb="FF1F2937"/><name val="Arial"/><family val="2"/></font>
    <font><b/><sz val="10.5"/><color rgb="FFFFFFFF"/><name val="Arial"/><family val="2"/></font>
    <font><b/><sz val="10"/><color rgb="FF034EA2"/><name val="Arial"/><family val="2"/></font>
  </fonts>
  <fills count="4">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF034EA2"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFF8FAFC"/></patternFill></fill>
  </fills>
  <borders count="2">
    <border><left/><right/><top/><bottom/><diagonal/></border>
    <border>
      <left style="thin"><color rgb="FFE2E8F0"/></left>
      <right style="thin"><color rgb="FFE2E8F0"/></right>
      <top style="thin"><color rgb="FFE2E8F0"/></top>
      <bottom style="thin"><color rgb="FFE2E8F0"/></bottom>
      <diagonal/>
    </border>
  </borders>
  <cellStyleXfs count="1">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0"/>
  </cellStyleXfs>
  <cellXfs count="4">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1"/>
    <xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1">
      <alignment horizontal="center" vertical="center" wrapText="1"/>
    </xf>
    <xf numFmtId="0" fontId="0" fillId="3" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1"/>
    <xf numFmtId="0" fontId="2" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1"/>
  </cellXfs>
  <cellStyles count="1">
    <cellStyle name="Normal" xfId="0" builtinId="0"/>
  </cellStyles>
</styleSheet>"""

    # xl/sharedStrings.xml
    ss_xml = [
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
        f'<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="{len(shared_strings)}" uniqueCount="{len(shared_strings)}">'
    ]
    for s in shared_strings:
        esc = saxutils.escape(str(s))
        ss_xml.append(f'  <si><t>{esc}</t></si>')
    ss_xml.append('</sst>')

    def col_name(n):
        res = ""
        while n > 0:
            n, rem = divmod(n - 1, 26)
            res = chr(65 + rem) + res
        return res

    with zipfile.ZipFile(filename_xlsx, 'w', compression=zipfile.ZIP_DEFLATED) as z:
        z.writestr('[Content_Types].xml', '\n'.join(ct))
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
            
            if 'col_widths' in sheet and sheet['col_widths']:
                sheet_xml.append('  <cols>')
                for col_idx, w in enumerate(sheet['col_widths']):
                    sheet_xml.append(f'    <col min="{col_idx+1}" max="{col_idx+1}" width="{w}" customWidth="1"/>')
                sheet_xml.append('  </cols>')

            sheet_xml.append('  <sheetData>')
            
            # Header
            sheet_xml.append('    <row r="1" ht="28" customHeight="1">')
            for col_idx, h in enumerate(sheet['headers']):
                cell_ref = f'{col_name(col_idx+1)}1'
                sid = string_map[str(h)]
                sheet_xml.append(f'      <c r="{cell_ref}" t="s" s="1"><v>{sid}</v></c>')
            sheet_xml.append('    </row>')

            # Rows
            for row_idx, row in enumerate(sheet['rows']):
                r_num = row_idx + 2
                style_id = 2 if row_idx % 2 == 1 else 0
                sheet_xml.append(f'    <row r="{r_num}" ht="24" customHeight="1">')
                for col_idx, val in enumerate(row):
                    cell_ref = f'{col_name(col_idx+1)}{r_num}'
                    sid = string_map[str(val)]
                    cell_style = 3 if col_idx == 1 and str(val).startswith('<') else style_id
                    sheet_xml.append(f'      <c r="{cell_ref}" t="s" s="{cell_style}"><v>{sid}</v></c>')
                sheet_xml.append('    </row>')

            sheet_xml.append('  </sheetData>')
            sheet_xml.append('</worksheet>')
            z.writestr(f'xl/worksheets/sheet{idx+1}.xml', '\n'.join(sheet_xml))
    print(f"Generated clean OpenXML (.xlsx): {filename_xlsx}")
