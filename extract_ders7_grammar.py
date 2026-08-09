import os
import json
import uuid
import re

TEXT_FILE = r"D:\bulgarca_sınav_modulu\docs\extracted_texts\balgoc___Bulgarca_A1_Ders_7_Tam_Ceviri_Aciklamali.txt"
JSON_FILE = r"D:\bulgarca_sınav_modulu\exam-app\src\data\modules\balgoc___Bulgarca_A1_Ders_7.json"

def create_id():
    return "q_ders7_" + uuid.uuid4().hex[:8]

def run():
    with open(TEXT_FILE, 'r', encoding='utf-8') as f:
        lines = f.read().splitlines()

    new_questions = []

    mode = None
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        # Determine mode
        if "Bulgarca | Türkçe | Edat notu" in line:
            mode = "edat_ornek"
            continue
        elif "Edat | Türkçe ana karşılık" in line:
            mode = "edat_anlam"
            continue
        elif "Doğru Bulgarca | Türkçe | Yanlış biçim" in line:
            mode = "edat_dogru_yanlis"
            continue
        elif "Kullanım | Bulgarca | Türkçe | Açıklama" in line:
            mode = "edat_kullanim"
            continue
        elif "Doğru | Türkçe | Neden" in line or "Doğru Bulgarca | Türkçe | Neden" in line:
            mode = "zamir_edat_neden"
            continue
        elif "Soru | Doğru cevap | Türkçe açıklama" in line:
            mode = "soru_cevap_aciklama"
            continue
        elif "Yakın biçim | Uzak biçim | Türkçe" in line:
            mode = "yakin_uzak"
            continue
        elif "Doğru Bulgarca | Türkçe | Açıklama" in line:
            mode = "edat_aciklama"
            continue
        elif "Örnek Bulgarca | Türkçe" in line or "Doğru Bulgarca | Türkçe" in line:
            mode = "dogru_turkce"
            continue
        elif line == "Bulgarca | Türkçe" or "Bulgarca | Türkçe | Not" in line:
            mode = "vocab"
            continue
        elif line.startswith("Kategori |") or line.startswith("İsim |"):
            mode = "ignore"
            continue
        elif line.startswith("6. Разговор") or line.startswith("7. Ders") or line.startswith("8. Mini"):
            mode = None

        parts = [p.strip() for p in line.split("|")]
        
        if mode == "edat_ornek" and len(parts) >= 3:
            bg, tr, notu = parts[0], parts[1], parts[2]
            if bg != "Bulgarca örnek" and bg:
                new_questions.append({
                    "id": create_id(),
                    "type": "translation",
                    "sentence": tr,
                    "answer": bg,
                    "hint": f"Bulgarca'ya çevirin. İpucu: {notu}",
                    "lesson": "Ders 7"
                })
                
        elif mode == "edat_anlam" and len(parts) >= 2:
            edat, tr = parts[0], parts[1]
            if edat != "Edat" and edat:
                new_questions.append({
                    "id": create_id(),
                    "type": "translation",
                    "sentence": edat + " (Edat Anlamı)",
                    "answer": tr,
                    "hint": "Bu Bulgarca edatın Türkçe karşılıklarını yazın",
                    "lesson": "Ders 7"
                })

        elif mode == "zamir_edat_neden" and len(parts) >= 3:
            bg, tr, neden = parts[0], parts[1], parts[2]
            if bg != "Doğru Bulgarca" and bg != "Doğru" and bg:
                new_questions.append({
                    "id": create_id(),
                    "type": "translation",
                    "sentence": tr,
                    "answer": bg,
                    "hint": f"Bulgarca'ya çevirin. İpucu: {neden}",
                    "lesson": "Ders 7"
                })

        elif mode == "soru_cevap_aciklama" and len(parts) >= 3:
            bg_soru, cevap, aciklama = parts[0], parts[1], parts[2]
            if bg_soru != "Soru" and "..." in bg_soru:
                # FITB question type
                ans_sent = bg_soru.replace("...", cevap)
                new_questions.append({
                    "id": create_id(),
                    "type": "fitb",
                    "sentence": bg_soru,
                    "answer": ans_sent,
                    "fitbTarget": cevap,
                    "hint": aciklama,
                    "lesson": "Ders 7"
                })

        elif mode == "yakin_uzak" and len(parts) >= 3:
            yakin, uzak, tr = parts[0], parts[1], parts[2]
            if yakin != "Yakın biçim" and yakin:
                new_questions.append({
                    "id": create_id(),
                    "type": "translation",
                    "sentence": f"{yakin} (Uzak Gösterme - o/şu biçimine çevirin)",
                    "answer": uzak,
                    "hint": "Cümleyi uzaktaki nesneyi işaret edecek şekilde değiştirin",
                    "lesson": "Ders 7"
                })
                
        elif mode == "edat_aciklama" and len(parts) >= 3:
            bg, tr, aciklama = parts[0], parts[1], parts[2]
            if bg != "Doğru Bulgarca" and bg:
                new_questions.append({
                    "id": create_id(),
                    "type": "translation",
                    "sentence": tr,
                    "answer": bg,
                    "hint": f"Bulgarca'ya çevirin. Kural: {aciklama}",
                    "lesson": "Ders 7"
                })
                
        elif mode == "dogru_turkce" and len(parts) >= 2:
            bg, tr = parts[0], parts[1]
            if bg != "Örnek Bulgarca" and bg != "Doğru Bulgarca" and bg:
                new_questions.append({
                    "id": create_id(),
                    "type": "translation",
                    "sentence": tr,
                    "answer": bg,
                    "hint": "Bulgarca'ya çevirin",
                    "lesson": "Ders 7"
                })

        elif mode == "vocab" and len(parts) >= 2:
            bg, tr = parts[0], parts[1]
            if bg != "Bulgarca" and bg:
                new_questions.append({
                    "id": create_id(),
                    "type": "translation",
                    "sentence": bg,
                    "answer": tr,
                    "hint": "Kelime anlamı",
                    "lesson": "Ders 7"
                })
                new_questions.append({
                    "id": create_id(),
                    "type": "translation",
                    "sentence": tr,
                    "answer": bg,
                    "hint": "Bulgarca kelime karşılığı",
                    "lesson": "Ders 7"
                })


    if not new_questions:
        print("No new questions extracted.")
        return

    # Append to existing JSON
    with open(JSON_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)

    print(f"Loaded {len(data.get('questions', []))} existing questions.")
    
    if "questions" not in data:
        data["questions"] = []
        
    existing_sentences = set((q['sentence'], q.get('answer')) for q in data['questions'])
    
    added = 0
    for nq in new_questions:
        key = (nq['sentence'], nq['answer'])
        if key not in existing_sentences:
            data['questions'].append(nq)
            existing_sentences.add(key)
            added += 1

    print(f"Added {added} new grammar/vocab questions for Ders 7.")
    
    with open(JSON_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

if __name__ == '__main__':
    run()
