import pdfplumber
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r'D:\bulgarca_sınav_modulu\docs\orj___A1-V-4.pdf'

all_text = []
all_tables = []

with pdfplumber.open(pdf_path) as pdf:
    print(f"Total pages: {len(pdf.pages)}")
    for i, page in enumerate(pdf.pages):
        # Metin çıkar
        text = page.extract_text()
        if text:
            all_text.append({"page": i+1, "text": text})
        
        # Tablo çıkar
        tables = page.extract_tables()
        for j, table in enumerate(tables):
            if table and any(any(cell for cell in row) for row in table):
                all_tables.append({
                    "page": i+1,
                    "table_index": j,
                    "rows": [[cell or '' for cell in row] for row in table]
                })

# Metni kaydet
with open('ders4_pdf_text.txt', 'w', encoding='utf-8') as f:
    for p in all_text:
        f.write(f"\n=== SAYFA {p['page']} ===\n")
        f.write(p['text'])
        f.write('\n')

# Tabloları kaydet
with open('ders4_pdf_tables.json', 'w', encoding='utf-8') as f:
    json.dump(all_tables, f, ensure_ascii=False, indent=2)

print(f"Text pages: {len(all_text)}")
print(f"Tables found: {len(all_tables)}")
for t in all_tables:
    print(f"  Page {t['page']} Table {t['table_index']}: {len(t['rows'])} rows | {t['rows'][0][:3]}")
