import os
import json
import uuid
import re

TEXT_FILE = r"D:\bulgarca_sınav_modulu\docs\extracted_texts\balgoc___Bulgarca_A1_Ders_11_Ders4_Formatinda_Turkce_Aciklamali_Not (1).txt"
JSON_FILE = r"D:\bulgarca_sınav_modulu\exam-app\src\data\modules\balgoc___Bulgarca_A1_Ders_11.json"

def create_id():
    return "q_ders11_" + uuid.uuid4().hex[:8]

def run():
    with open(TEXT_FILE, 'r', encoding='utf-8') as f:
        lines = f.read().splitlines()

    new_questions = []

    mode = None
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        if "Bulgarca | Türkçe | Not" in line or ("Bulgarca | Türkçe" in line and "географски" in line):
            mode = "vocab"
            continue
        elif "Temel fiil | Аз – aorist | Türkçe" in line:
            mode = "aorist_verbs"
            continue
        elif "Alıştırma cümlesi | Doğru Bulgarca | Türkçesi" in line:
            mode = "aorist_context"
            continue
        elif "Fiil/cümle çekirdeği | Аз | Ти | Той/Тя" in line:
            mode = "aorist_table"
            continue
        elif "Кону | Bulgarca örnek | Türkçe" in line or "Konu | Bulgarca" in line or "11. Ders Sonu Özet" in line:
            mode = None
        elif line.startswith("Kişi |") or line.startswith("Sayı |") or line.startswith("Bulgarca |"):
            pass

        if mode == "vocab" and "|" in line:
            parts = [p.strip() for p in line.split("|")]
            if len(parts) >= 2 and parts[0] != "Bulgarca" and parts[0] != "Слово":
                bg = parts[0]
                tr = parts[1]
                if bg and tr:
                    new_questions.append({
                        "id": create_id(),
                        "type": "translation",
                        "sentence": bg,
                        "answer": tr,
                        "hint": "Kelime anlamı",
                        "lesson": "Ders 11"
                    })
                    new_questions.append({
                        "id": create_id(),
                        "type": "translation",
                        "sentence": tr,
                        "answer": bg,
                        "hint": "Bulgarca kelime karşılığı",
                        "lesson": "Ders 11"
                    })

        elif mode == "aorist_verbs" and "|" in line:
            parts = [p.strip() for p in line.split("|")]
            if len(parts) >= 3 and parts[0] != "Temel fiil":
                base = parts[0]
                aorist = parts[1]
                tr = parts[2]
                if base and aorist:
                    new_questions.append({
                        "id": create_id(),
                        "type": "translation",
                        "sentence": f"{base} (Aorist 1. Tekil Şahıs - аз)",
                        "answer": aorist,
                        "hint": "Fiili Aorist (Geçmiş Zaman) yapın",
                        "lesson": "Ders 11"
                    })

        elif mode == "aorist_context" and "|" in line:
            parts = [p.strip() for p in line.split("|")]
            if len(parts) >= 3 and parts[0] != "Alıştırma cümlesi":
                q_sent = parts[0] 
                ans_sent = parts[1] 
                tr_sent = parts[2]
                
                m = re.search(r'\((.*?)\)', q_sent)
                if m:
                    base_verb = m.group(1)
                    new_questions.append({
                        "id": create_id(),
                        "type": "translation",
                        "sentence": tr_sent,
                        "answer": ans_sent,
                        "hint": f"Bulgarca'ya çevirin. İpucu: {base_verb} fiilini aorist kullanın.",
                        "lesson": "Ders 11"
                    })
                    
        elif mode == "aorist_table" and "|" in line:
            parts = [p.strip() for p in line.split("|")]
            if len(parts) >= 7 and parts[0] != "Fiil/cümle çekirdeği":
                base_phrase = parts[0]
                az = parts[1]
                ti = parts[2]
                toy = parts[3]
                nie = parts[4]
                vie = parts[5]
                te = parts[6]
                
                new_questions.append({
                    "id": create_id(),
                    "type": "translation",
                    "sentence": f"{base_phrase} (Ние / Biz)",
                    "answer": nie,
                    "hint": "Fiili Aorist - 1. Çoğul Şahıs (Ние) formunda yazın",
                    "lesson": "Ders 11"
                })
                new_questions.append({
                    "id": create_id(),
                    "type": "translation",
                    "sentence": f"{base_phrase} (Те / Onlar)",
                    "answer": te,
                    "hint": "Fiili Aorist - 3. Çoğul Şahıs (Те) formunda yazın",
                    "lesson": "Ders 11"
                })

    if not new_questions:
        print("No new questions extracted.")
        return

    with open(JSON_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)

    print(f"Loaded {len(data['questions'])} existing questions.")
    
    existing_sentences = set((q['sentence'], q.get('answer')) for q in data['questions'])
    
    added = 0
    for nq in new_questions:
        key = (nq['sentence'], nq['answer'])
        if key not in existing_sentences:
            data['questions'].append(nq)
            existing_sentences.add(key)
            added += 1

    print(f"Added {added} new grammar/vocab questions.")
    
    with open(JSON_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        
    print("EXAMPLES:")
    for ex in new_questions[:5]:
        print(f"- [{ex['hint']}] Soru: {ex['sentence']} | Cevap: {ex['answer']}")
    print("...")
    for ex in new_questions[-5:]:
        print(f"- [{ex['hint']}] Soru: {ex['sentence']} | Cevap: {ex['answer']}")

if __name__ == '__main__':
    run()
