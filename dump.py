import docx
import sys

try:
    doc = docx.Document(r'D:\bulgarca_sınav_modulu\docs\balgoc___Bulgarca_A1_Ders_1_2_Tam_Ceviri_Aciklamali.docx')
    with open('ders1_2_full.txt', 'w', encoding='utf-8') as f:
        for p in doc.paragraphs:
            if p.text.strip():
                f.write(p.text.strip() + '\n')
except Exception as e:
    print(e)
