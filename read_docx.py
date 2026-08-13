import docx

doc = docx.Document(r'D:\bulgarca_sınav_modulu\docs\balgoc___Bulgarca_A1_Ders_3_Turkce_Aciklamali_Not.docx')
with open('temp_doc.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join([p.text for p in doc.paragraphs]))
