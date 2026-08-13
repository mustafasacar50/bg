import docx
import json
import sys

# Force UTF-8 output
sys.stdout.reconfigure(encoding='utf-8')

doc_path = r'D:\bulgarca_sınav_modulu\docs\balgoc___Bulgarca_A1_Ders_3_Turkce_Aciklamali_Not.docx'
doc = docx.Document(doc_path)

# Extract all tables
all_tables = []
for i, table in enumerate(doc.tables):
    rows = []
    for row in table.rows:
        cells = [cell.text.strip() for cell in row.cells]
        # Remove duplicate cells (merged cells repeat)
        unique_cells = []
        seen = set()
        for c in cells:
            if c not in seen:
                unique_cells.append(c)
                seen.add(c)
        if any(c for c in unique_cells):
            rows.append(unique_cells)
    if rows:
        all_tables.append({"table_index": i, "rows": rows})

# Save all table data
with open('ders3_tables_full.json', 'w', encoding='utf-8') as f:
    json.dump(all_tables, f, ensure_ascii=False, indent=2)

print(f"Saved {len(all_tables)} tables")
for t in all_tables:
    print(f"Table {t['table_index']}: {len(t['rows'])} rows -> {t['rows'][0]}")
