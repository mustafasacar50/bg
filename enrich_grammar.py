import json
import os
import re

RULES = [
    {
        "keywords": ["съм", " си ", " сме ", " сте ", " са "],
        "title": "Kural: \"Съм\" (Olmak) Fiili",
        "text": """A1 düzeyinde en önemli fiil “съм” (olmak) fiilidir. Durum, meslek ve milliyet bildirirken kullanılır.
аз съм (ben ...'im)        ние сме (biz ...'iz)
ти си (sen ...'sin)        вие сте (siz ...'siniz)
той/тя/то е (o ...'dir)    те са (onlar ...'dir)"""
    },
    {
        "keywords": ["казвам", "казвате", "казваш"],
        "title": "Kural: Resmiyet ve Hitap",
        "text": """- Как се казвате? resmi/kibar biçimdir (Siz).
- Как се казваш? samimi tekil biçimdir (Sen).
- “Казвам се ...” kelime kelime “kendime ... denir” gibi düşünülse de Türkçede “Benim adım ...” diye çevrilir."""
    },
    {
        "keywords": [" ли ", " ли?"],
        "title": "Kural: \"Ли\" Soru Eki",
        "text": """Bulgarcada "ли" parçacığı Türkçedeki "mı/mi" gibi evet/hayır sorusu yapar ve genellikle vurgulanan kelimeden/yüklemden hemen sonra gelir.
Örnek: Учиш ли? = Okuyor musun? / Студент ли си? = Öğrenci misin?"""
    },
    {
        "keywords": ["студент", "студентка", "тази", "онзи", "какъв", "каква", "той", "тя", "то "],
        "title": "Kural: Cinsiyet Uyumu",
        "text": """Bulgarcada "O" zamiri ve işaret sıfatları bile ismin cinsiyetine göre değişir:
- Той (Eril - O), Тя (Dişil - O), То (Nötr - O)
- Студент (Erkek öğrenci), Студентка (Kadın öğrenci)
- Тази (Bu - dişil isimler için), Онзи (Şu/Öteki - eril isimler için)
- Какъв? (Nasıl/Hangi - eril), Каква? (Nasıl/Hangi - dişil)"""
    },
    {
        "keywords": ["до него", " го ", " я ", " ги "],
        "title": "Kural: Zamirlerin Kullanımı",
        "text": """- го = onu (eril kısa nesne zamiridir). 
- до него = onun yanında (Bir edattan -до- sonra kullanıldığı için uzun form "него" kullanılmıştır).
Kısa formlar fiilden önce, uzun formlar edatlardan sonra gelir."""
    },
    {
        "keywords": [" ще "],
        "title": "Kural: Gelecek Zaman (Ще)",
        "text": """Fiilden önce gelen "ще" parçacığı cümleyi gelecek zamana (yapacağım, edeceğim) çevirir. (Örn: Ще се запознаем = Tanışacağız)."""
    },
    {
        "keywords": ["има", "няма", "имам", "нямам"],
        "title": "Kural: İmam (Sahibim) vs İma (Var)",
        "text": """- имам (sahip olmak): Özneye bağlıdır. "Benim arabam var" derken şahsa göre çekimlenir.
  (имам, имаш, има, имаме, имате, имат)
- има / няма (var / yok): Türkçedeki gibi genel "var/yok" anlamı taşır, şahsa göre çekimlenmez. "Odada yatak var" (В стаята има легло) gibi durumları belirtir."""
    },
    {
        "keywords": ["уча", "учиш", "учи", "учим", "учите", "учат"],
        "title": "Kural: Fiil Çekimi - Уча (Öğrenmek)",
        "text": """аз уча (ben öğrenirim)       ние учим (biz öğreniriz)
ти учиш (sen öğrenirsin)     вие учите (siz öğrenirsiniz)
той/тя/то учи (o öğrenir)    те учат (onlar öğrenirler)"""
    },
    {
        "keywords": ["разбирам", "разбираш", "разбира", "разбираме", "разбирате", "разбират"],
        "title": "Kural: Fiil Çekimi - Разбирам (Anlamak)",
        "text": """аз разбирам (ben anlarım)       ние разбираме (biz anlarız)
ти разбираш (sen anlarsın)      вие разбирате (siz anlarsınız)
той/тя/то разбира (o anlar)     те разбират (onlar anlarlar)"""
    },
    {
        "keywords": ["говоря", "говориш", "говори", "говорим", "говорите", "говорят"],
        "title": "Kural: Fiil Çekimi - Говоря (Konuşmak)",
        "text": """аз говоря (ben konuşurum)       ние говорим (biz konuşuruz)
ти говориш (sen konuşursun)     вие говорите (siz konuşursunuz)
той/тя/то говори (o konuşur)    те говорят (onlar konuşurlar)"""
    },
    {
        "keywords": ["зная", "знам", "знаеш", "знае", "знаем", "знаете", "знаят"],
        "title": "Kural: Fiil Çekimi - Зная (Bilmek)",
        "text": """аз знам/зная (ben bilirim)      ние знаем (biz biliriz)
ти знаеш (sen bilirsin)         вие знаете (siz bilirsiniz)
той/тя/то знае (o bilir)        те знаят (onlar bilirler)"""
    }
]

def enrich_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    enriched_count = 0
    for q in data.get('questions', []):
        text_to_search = (q.get('sentence', '') + ' ' + q.get('answer', '')).lower()
        # To avoid adding the same rule twice if ran multiple times
        existing_exp = q.get('explanation', '')
        if not existing_exp:
            existing_exp = ""
            
        added_rules = []
        
        for rule in RULES:
            # Check if keyword is in text
            if any(kw.lower() in text_to_search for kw in rule['keywords']):
                # Prevent duplication if the script runs again
                if rule['title'] not in existing_exp:
                    added_rules.append(f"📘 {rule['title']}\n{rule['text']}")
                    
        if added_rules:
            # Append to existing explanation
            new_exp = existing_exp + "\n\n" + "\n\n".join(added_rules)
            q['explanation'] = new_exp.strip()
            enriched_count += 1

    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        
    print(f"{file_path}: Enriched {enriched_count} questions.")

modules = [
    'src/data/modules/balgoc___Bulgarca_A1_Ders_1_2.json',
    'src/data/modules/balgoc___Bulgarca_A1_Ders_3.json',
    'src/data/modules/balgoc___Bulgarca_A1_Ders_4.json'
]

for m in modules:
    if os.path.exists(m):
        enrich_file(m)

