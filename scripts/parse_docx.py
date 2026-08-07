import docx
import json
import uuid
import sys
import os

def parse_docx(file_path):
    print(f"Parsing {file_path}...")
    doc = docx.Document(file_path)
    questions = []
    
    # Process tables
    for table in doc.tables:
        if len(table.rows) < 2:
            continue
            
        header = [cell.text.strip().lower() for cell in table.rows[0].cells]
        
        # Type 1: Vocabulary table (Türkçe kelime / Bulgarca yazım / Türkçe anlam)
        if len(header) >= 3 and ('bulgarca' in header[1] or 'yazım' in header[1]) and ('anlam' in header[2] or 'türkçe' in header[2]):
            for row in table.rows[1:]:
                cells = [cell.text.strip() for cell in row.cells]
                if len(cells) < 3 or not cells[1] or not cells[2]:
                    continue
                
                tr_word = cells[2]
                bg_word = cells[1].upper() # Answer is usually uppercase for validation
                
                if tr_word.lower() == 'türkçe anlam/not' or 'türkçe' in tr_word.lower():
                    continue
                    
                # Clean up answers (remove parenthesis notes if any)
                clean_tr = tr_word.split('/')[0].split('(')[0].strip()
                clean_bg = bg_word.split('/')[0].split('(')[0].strip()
                
                if not clean_bg or not clean_tr:
                    continue

                questions.append({
                    "id": f"q_auto_{uuid.uuid4().hex[:8]}",
                    "type": "blank",
                    "points": 5,
                    "sentence": f"_____ (Bulgarcası: {clean_bg})",
                    "answer": clean_tr.upper(),
                    "hint": "Türkçe karşılığını yazınız"
                })
                
                questions.append({
                    "id": f"q_auto_{uuid.uuid4().hex[:8]}",
                    "type": "blank",
                    "points": 5,
                    "sentence": f"_____ (Türkçesi: {clean_tr})",
                    "answer": clean_bg.upper(),
                    "hint": "Bulgarca karşılığını yazınız"
                })
                
        # Type 2: Simple 2-column vocabulary
        elif len(header) >= 2 and ('bulgarca' in header[0] or 'kelime' in header[0]) and ('türkçe' in header[1] or 'anlam' in header[1]):
            for row in table.rows[1:]:
                cells = [cell.text.strip() for cell in row.cells]
                if len(cells) < 2 or not cells[0] or not cells[1]:
                    continue
                    
                bg_word = cells[0].upper()
                tr_word = cells[1]
                
                clean_tr = tr_word.split('/')[0].split('(')[0].strip()
                clean_bg = bg_word.split('/')[0].split('(')[0].strip()
                
                if not clean_bg or not clean_tr:
                    continue

                questions.append({
                    "id": f"q_auto_{uuid.uuid4().hex[:8]}",
                    "type": "blank",
                    "points": 5,
                    "sentence": f"_____ (Türkçesi: {clean_tr})",
                    "answer": clean_bg.upper(),
                    "hint": "Bulgarca karşılığını yazınız"
                })
                questions.append({
                    "id": f"q_auto_{uuid.uuid4().hex[:8]}",
                    "type": "blank",
                    "points": 5,
                    "sentence": f"_____ (Bulgarcası: {clean_bg})",
                    "answer": clean_tr.upper(),
                    "hint": "Türkçe karşılığını yazınız"
                })

    return questions

if __name__ == '__main__':
    file_path = r"D:\bulgarca_sınav_modulu\docs\balgoc___Bulgarca_A1_Ders_1_2_Tam_Ceviri_Aciklamali.docx"
    questions = parse_docx(file_path)
    
    print(f"Generated {len(questions)} questions.")
    
    os.makedirs(r"D:\bulgarca_sınav_modulu\exam-app\src\data\modules", exist_ok=True)
    out_path = r"D:\bulgarca_sınav_modulu\exam-app\src\data\modules\balgoc___Bulgarca_A1_Ders_1_2.json"
    
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump({"title": "Ders 1 ve 2 - Alıştırma Havuzu", "questions": questions}, f, ensure_ascii=False, indent=2)
    print(f"Saved to {out_path}")
