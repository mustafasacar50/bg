import json
import random
import uuid

# Dictionary of Bulgarian to Turkish (extracted from lessons)
vocabulary = [
    ("КУЧЕ", "KÖPEK"),
    ("КОТКA", "KEDİ"),
    ("ЦВЕТЕ", "ÇİÇEK"),
    ("КНИГА", "KİTAP"),
    ("КОЛА", "ARABA"),
    ("КОЛЕЛО", "BİSİKLET"),
    ("ЛАПТОП", "BİLGİSAYAR"),
    ("ДИВАН", "KOLTUK"),
    ("ХЛЯБ", "EKMEK"),
    ("ТЕЛЕФОН", "TELEFON"),
    ("РИЗА", "GÖMLEK"),
    ("ТЕТРАДКА", "DEFTER"),
    ("УЧИТЕЛ", "ÖĞRETMEN"),
    ("УЧЕНИК", "ÖĞRENCİ"),
    ("КЪЩА", "EV"),
    ("МАСА", "MASA"),
    ("СТОЛ", "SANDALYE"),
    ("ВРАТА", "KAPI"),
    ("ХИМИКАЛ", "TÜKENMEZ KALEM"),
    ("ЧАША", "BARDAK"),
    ("ШАПКА", "ŞAPKA"),
    ("ЯКЕ", "MONT"),
    ("АВТОБУС", "OTOBÜS"),
    ("ВЛАК", "TREN"),
    ("ФИЛМ", "FİLM"),
    ("УЧИЛИЩЕ", "OKUL"),
    ("МАГАЗИН", "MARKET"),
    ("ЛЕГЛО", "YATAK"),
    ("КАФЕ", "KAHVE"),
    ("ЧАЙ", "ÇAY"),
    ("БАЛОН", "BALON"),
    ("РАБОТА", "İŞ"),
    ("ВЕЧЕРЯ", "AKŞAM YEMEĞİ"),
    ("ЗАКУСКА", "KAHVALTI"),
    ("ОБЯД", "ÖĞLEN YEMEĞİ"),
    ("ЧАНТА", "ÇANTA"),
    ("ОБУВКИ", "AYAKKABI"),
    ("ТЕЛЕВИЗОР", "TELEVİZYON"),
    ("ВОДА", "SU"),
    ("СОК", "MEYVE SUYU"),
    ("МЛЯКО", "SÜT"),
    ("СИРЕНЕ", "PEYNİR"),
    ("КАШКАВАЛ", "KAŞAR"),
    ("МАСЛО", "TEREYAĞI"),
    ("ЯЙЦЕ", "YUMURTA"),
    ("САЛАМ", "SALAM"),
    ("ЗАХАР", "ŞEKER"),
    ("МЕД", "BAL"),
    ("ПУЛОВЕР", "KAZAK"),
    ("ТЕНИСКА", "TİŞÖRT"),
    ("ПАНТАЛОНИ", "PANTOLON"),
    ("ЧОРАПИ", "ÇORAP"),
    ("БОТУШИ", "ÇİZME"),
    ("ШАЛ", "ŞAL"),
    ("РЪКАВИЦИ", "ELDİVEN"),
    ("ПИЖАМА", "PİJAMA"),
    ("ОЧИЛА", "GÖZLÜK"),
    ("ЯБЪЛКА", "ELMA"),
    ("КРУША", "ARMUT"),
    ("ЯГОДА", "ÇİLEK"),
    ("ЧЕРЕША", "KİRAZ"),
    ("СЛИВА", "ERİK"),
    ("ПРАСКОВА", "ŞEFTALİ"),
    ("КАЙСИЯ", "KAYISI"),
    ("ГРОЗДЕ", "ÜZÜM"),
    ("ПЪПЕШ", "KAVUN"),
    ("ДИНЯ", "KARPUZ"),
    ("БАНАН", "MUZ"),
    ("ЛИМОН", "LİMON"),
    ("ПОРТОКАЛ", "PORTAKAL"),
    ("ДОМАТ", "DOMATES"),
    ("КРАСТАВИЦА", "SALATALIK"),
    ("МОРКОВ", "HAVUÇ"),
    ("ЗЕЛЕ", "LAHANA"),
    ("ЧУШКА", "BİBER"),
    ("КАРТОФ", "PATATES"),
    ("ГЪБА", "MANTAR"),
    ("СПАНАК", "ISPANAK"),
    ("МАРУЛЯ", "MARUL"),
    ("ЛУК", "SOĞAN"),
    ("ЧЕСЪН", "SARIMSAK"),
    ("МЪЖ", "ERKEK"),
    ("ЖЕНА", "KADIN"),
    ("ДЕТЕ", "ÇOCUK"),
    ("ГРАД", "ŞEHİR"),
    ("МОРЕ", "DENİZ"),
    ("УТРЕ", "YARIN"),
    ("ДНЕС", "BUGÜN"),
    ("ВЧЕРА", "DÜN"),
    ("СЕДМИЦА", "HAFTA"),
    ("МЕСЕЦ", "AY"),
    ("ГОДИНА", "YIL"),
    ("ПОНЕДЕЛНИК", "PAZARTESİ"),
    ("ВТОРНИК", "SALI"),
    ("СРЯДА", "ÇARŞAMBA"),
    ("ЧЕТВЪРТЪК", "PERŞEMBE"),
    ("ПЕТЪК", "CUMA"),
    ("СЪБОТА", "CUMARTESİ"),
    ("НЕДЕЛЯ", "PAZAR"),
    ("ПРОЛЕТ", "İLKBAHAR"),
    ("ЛЯТО", "YAZ"),
    ("ЕСЕН", "SONBAHAR"),
    ("ЗИМА", "KIŞ"),
    ("ЗДРАВЕЙ", "MERHABA"),
    ("ДОБРО УТРО", "GÜNAYDIN"),
    ("ДОБЪР ДЕН", "İYİ GÜNLER"),
    ("ДОБЪР ВЕЧЕР", "İYİ AKŞAMLAR"),
    ("ЛЕКА НОЩ", "İYİ GECELER"),
    ("ДОВИЖДАНЕ", "GÖRÜŞMEK ÜZERE"),
    ("БЛАГОДАРЯ", "TEŞEKKÜRLER"),
    ("МОЛЯ", "LÜTFEN"),
    ("ИЗВИНЯВАЙ", "PARDON"),
    ("ДА", "EVET"),
    ("НЕ", "HAYIR"),
    ("КОЙ", "KİM"),
    ("КАКВО", "NE"),
    ("КОГА", "NE ZAMAN"),
    ("КЪДЕ", "NEREDE"),
    ("ЗАЩО", "NEDEN"),
    ("КАК", "NASIL"),
    ("ЧИЙ", "KİMİN"),
    ("КОЛКО", "KAÇ")
]

verbs = [
    ("ЯМ", "YİYORUM"),
    ("ПИЯ", "İÇİYORUM"),
    ("ЧЕТА", "OKUYORUM"),
    ("КУПУВАМ", "SATIN ALIYORUM"),
    ("ИДВАМ", "GELİYORUM"),
    ("СЕДЯ", "OTURUYORUM"),
    ("ОТИВАМ", "GİDİYORUM"),
    ("СТАВАМ", "KALKIYORUM"),
    ("МИЯ", "YIKIYORUM"),
    ("ЧИСТЯ", "TEMİZLİYORUM"),
    ("ПРАВЯ", "YAPIYORUM"),
    ("ОБИЧАМ", "SEVİYORUM"),
    ("ЖИВЕЯ", "YAŞIYORUM"),
    ("ГОВОРЯ", "KONUŞUYORUM"),
    ("УЧА", "ÇALIŞIYORUM")
]

all_items = vocabulary + verbs
questions = []

# 1. Generate MCQs (Bulgarian -> Turkish)
for i, (bg, tr) in enumerate(all_items):
    options = [tr]
    while len(options) < 4:
        rand_tr = random.choice(all_items)[1]
        if rand_tr not in options:
            options.append(rand_tr)
    random.shuffle(options)
    
    questions.append({
        "id": f"q_mcq_bg_tr_{i}",
        "type": "mcq",
        "difficulty": 1 if i % 2 == 0 else 2,
        "tags": ["Kelime Bilgisi", "A1"],
        "question": f"Aşağıdaki Bulgarca kelimenin Türkçe karşılığı nedir?\n\n**{bg}**",
        "options": options,
        "correctAnswer": tr,
        "points": 5
    })

# 2. Generate MCQs (Turkish -> Bulgarian)
for i, (bg, tr) in enumerate(all_items):
    options = [bg]
    while len(options) < 4:
        rand_bg = random.choice(all_items)[0]
        if rand_bg not in options:
            options.append(rand_bg)
    random.shuffle(options)
    
    questions.append({
        "id": f"q_mcq_tr_bg_{i}",
        "type": "mcq",
        "difficulty": 1 if i % 2 == 0 else 2,
        "tags": ["Çeviri", "A1"],
        "question": f"Aşağıdaki Türkçe kelimenin Bulgarca karşılığı nedir?\n\n**{tr}**",
        "options": options,
        "correctAnswer": bg,
        "points": 5
    })

# 3. Generate Matching Questions (Blocks of 5)
random.shuffle(all_items)
for i in range(0, len(all_items) - 5, 5):
    pairs = all_items[i:i+5]
    questions.append({
        "id": f"q_match_{i}",
        "type": "matching",
        "difficulty": 2,
        "tags": ["Eşleştirme", "A1"],
        "question": "Aşağıdaki Bulgarca kelimeleri Türkçe anlamlarıyla eşleştiriniz.",
        "pairs": [{"left": p[0], "right": p[1]} for p in pairs],
        "points": 10
    })

# 4. Generate Fill in the Blanks (Sentences)
sentences = [
    ("АЗ {blank} ЯБЪЛКА.", "ЯМ", "BEN ELMA YİYORUM.", ["ПИЯ", "ЧЕТА", "ЯМ"]),
    ("ТОЙ {blank} ВОДА.", "ПИЯ", "O SU İÇİYOR.", ["ЯМ", "ПИЯ", "СЕДЯ"]),
    ("НИЕ {blank} КНИГА.", "ЧЕТА", "BİZ KİTAP OKUYORUZ.", ["ЧИСТЯ", "ЧЕТА", "МИЯ"]),
    ("{blank} Е ТОВА?", "КАКВО", "BU NEDİR?", ["КОЙ", "КАКВО", "КЪДЕ"]),
    ("{blank} СИ?", "КАК", "NASILSIN?", ["КОЛКО", "КАК", "ЗАЩО"]),
    ("ТОВА {blank} ЛИ Е?", "МАСА", "BU MASA MI?", ["СТОЛ", "МАСА", "ВРАТА"]),
    ("АЗ ОТИВАМ НА {blank}.", "УЧИЛИЩЕ", "BEN OKULA GİDİYORUM.", ["УЧИЛИЩЕ", "РАБОТА", "МАГАЗИН"])
]

for i, (q, a, tr_hint, opts) in enumerate(sentences):
    questions.append({
        "id": f"q_blank_{i}",
        "type": "fill_in_blank",
        "difficulty": 3,
        "tags": ["Cümle", "Boşluk Doldurma"],
        "question": f"Cümleyi uygun kelime ile tamamlayınız.\n(İpucu: {tr_hint})\n\n{q}",
        "options": opts,
        "correctAnswer": a,
        "points": 15
    })

# Total expected: ~135 + 135 + 27 + 7 = 304 questions
# Save to file
output_path = r"D:\bulgarca_sınav_modulu\exam-app\src\data\questions.json"
with open(output_path, "w", encoding="utf-8") as f:
    json.dump(questions, f, ensure_ascii=False, indent=2)

print(f"Generated {len(questions)} questions successfully!")
