import json
import hashlib
import docx

questions = []
seen_ids = set()

def add_q(sentence, answer, hint, explanation=None):
    raw = sentence + answer + hint
    qid = "q_auto_" + hashlib.md5(raw.encode('utf-8')).hexdigest()[:8]
    if qid in seen_ids:
        return
    seen_ids.add(qid)
    
    q = {
        "id": qid,
        "type": "blank",
        "points": 5,
        "sentence": sentence,
        "answer": answer.upper().strip(),
        "hint": hint
    }
    if explanation:
        q["explanation"] = explanation
    questions.append(q)

doc_path = r"D:\bulgarca_sınav_modulu\docs\balgoc___Bulgarca_A1_Ders_3_Turkce_Aciklamali_Not.docx"
doc = docx.Document(doc_path)
tables = doc.tables

# TABLE 5: Countries and Nationalities
# Columns: Държава / Ülke | Türkçe | Erkek | Kadın | Çoğul
t_countries = tables[5]
for i in range(1, len(t_countries.rows)):
    cells = t_countries.rows[i].cells
    if len(cells) < 5: continue
    bg_country = cells[0].text.strip()
    tr_country = cells[1].text.strip()
    eril = cells[2].text.strip()
    disil = cells[3].text.strip()
    cogul = cells[4].text.strip()
    
    # Translation questions
    add_q(f"_____ (Bulgarcası: {bg_country})", tr_country, "Türkçe karşılığını yazınız")
    add_q(f"_____ (Türkçesi: {tr_country})", bg_country, "Bulgarca karşılığını yazınız")
    
    # Contextual Grammer
    if eril and eril != "-":
        add_q(
            f"Той е от {bg_country}. Той е _____.", 
            eril, 
            f"Boşluğa '{tr_country} vatandaşı (erkek)' kelimesini yazın", 
            f"Bulgarcada milliyet isimleri cinsiyete göre değişir. Erkekler için eril form olan '{eril}' kullanılır."
        )
        add_q(f"_____ (Türkçesi: {tr_country} vatandaşı (erkek))", eril, "Bulgarca karşılığını yazınız")
        
    if disil and disil != "-":
        add_q(
            f"Тя е от {bg_country}. Тя е _____.", 
            disil, 
            f"Boşluğa '{tr_country} vatandaşı (kadın)' kelimesini yazın", 
            f"Bulgarcada milliyet isimleri cinsiyete göre değişir. Kadınlar için dişil form olan '{disil}' kullanılır."
        )
        add_q(f"_____ (Türkçesi: {tr_country} vatandaşı (kadın))", disil, "Bulgarca karşılığını yazınız")
        
    if cogul and cogul != "-":
        add_q(
            f"Те са от {bg_country}. Те са _____.", 
            cogul, 
            f"Boşluğa '{tr_country} vatandaşları (çoğul)' kelimesini yazın", 
            f"Bulgarcada milliyet isimleri sayıya göre değişir. Çoğul gruplar için '{cogul}' kullanılır."
        )


# TABLE 8: Professions (General List)
# Columns: Bulgarca meslek | Türkçesi
t_professions = tables[8]
for i in range(1, len(t_professions.rows)):
    cells = t_professions.rows[i].cells
    if len(cells) < 2: continue
    bg_prof = cells[0].text.strip()
    tr_prof = cells[1].text.strip()
    
    add_q(f"_____ (Bulgarcası: {bg_prof})", tr_prof, "Türkçe karşılığını yazınız")
    add_q(f"_____ (Türkçesi: {tr_prof})", bg_prof, "Bulgarca karşılığını yazınız")


# TABLE 11: Professions (Male / Female)
# Columns: Erkek biçimi | Kadın biçimi | Türkçe
t_prof_genders = tables[11]
for i in range(1, len(t_prof_genders.rows)):
    cells = t_prof_genders.rows[i].cells
    if len(cells) < 3: continue
    eril = cells[0].text.strip()
    disil = cells[1].text.strip()
    tr_prof = cells[2].text.strip()
    
    if eril == disil:
        add_q(
            f"Тя е жена, но по професия е _____.", 
            disil, 
            f"Boşluğa '{tr_prof}' kelimesini yazın",
            f"Bulgarcada bazı meslekler cinsiyete göre değişmez. Hem erkek hem kadın için '{eril}' kullanılır."
        )
    else:
        add_q(
            f"Той е мъж. По професия е _____.", 
            eril, 
            f"Boşluğa '{tr_prof}' kelimesini yazın",
            f"Bulgarcada meslekler cinsiyete göre değişir. Erkekler için eril form olan '{eril}' kullanılır."
        )
        add_q(
            f"Тя е жена. По професия е _____.", 
            disil, 
            f"Boşluğa '{tr_prof}' kelimesini yazın",
            f"Bulgarcada meslekler cinsiyete göre değişir. Kadınlar için dişil form olan '{disil}' kullanılır. Genellikle sonuna '-ка' eklenir."
        )

# TABLE 7: Kalıplar
t_kalip = tables[7]
for i in range(1, len(t_kalip.rows)):
    cells = t_kalip.rows[i].cells
    if len(cells) < 2: continue
    bg_kalip = cells[0].text.strip()
    tr_kalip = cells[1].text.strip()
    
    add_q(f"_____ (Bulgarcası: {bg_kalip})", tr_kalip, "Türkçe karşılığını yazınız")
    add_q(f"_____ (Türkçesi: {tr_kalip})", bg_kalip, "Bulgarca karşılığını yazınız")


# TABLE 2 & 10: Soru / Cevap / Türkçe Dialogları
for t_idx in [2, 10]:
    t_dialog = tables[t_idx]
    for i in range(1, len(t_dialog.rows)):
        cells = t_dialog.rows[i].cells
        if len(cells) < 3: continue
        bg_q = cells[0].text.strip()
        bg_a = cells[1].text.strip()
        tr_a = cells[2].text.strip()
        
        add_q(f"_____ (Bulgarcası: {bg_q})", bg_a, "Soruya Bulgarca cevap veriniz")
        add_q(f"_____ (Bulgarcası: {bg_a})", tr_a, "Türkçe karşılığını yazınız")
        add_q(f"_____ (Türkçesi: {tr_a})", bg_a, "Bulgarca karşılığını yazınız")

# TABLE 3: Vocabulary & Grammar
t_vocab = tables[3]
for i in range(1, len(t_vocab.rows)):
    cells = t_vocab.rows[i].cells
    if len(cells) < 4: continue
    bg_word = cells[0].text.strip()
    tr_word = cells[1].text.strip()
    grammar = cells[2].text.strip()
    example = cells[3].text.strip()
    
    # Kelime içinde taksim (/) varsa parçalayalım (örn: студент / студентка)
    if "/" in bg_word and "/" in tr_word:
        bg_parts = [p.strip() for p in bg_word.split("/")]
        tr_parts = [p.strip() for p in tr_word.split("/")]
        for bp, tp in zip(bg_parts, tr_parts):
            add_q(f"_____ (Bulgarcası: {bp})", tp, "Türkçe karşılığını yazınız", f"Bilgi: {grammar}. Örnek: {example}")
            add_q(f"_____ (Türkçesi: {tp})", bp, "Bulgarca karşılığını yazınız", f"Bilgi: {grammar}. Örnek: {example}")
    else:
        add_q(f"_____ (Bulgarcası: {bg_word})", tr_word, "Türkçe karşılığını yazınız", f"Bilgi: {grammar}. Örnek: {example}")
        add_q(f"_____ (Türkçesi: {tr_word})", bg_word, "Bulgarca karşılığını yazınız", f"Bilgi: {grammar}. Örnek: {example}")

# METİN İÇİ GRAMER (Bölüm 1'den elle eklediğim eski kurallar)
grammar_qs = [
    {
        "bg_sentence": "Добър ден, _____!",
        "expected": "ГОСПОЖИЦЕ",
        "hint": "Boşluğa 'küçük hanım/hanımefendi' kelimesini yazın",
        "explanation": "'Госпожице', genç veya evli olmayan kadınlara yönelik resmi bir hitaptır."
    },
    {
        "bg_sentence": "А _____ госпожица коя е?",
        "expected": "ТАЗИ",
        "hint": "Boşluğa 'bu (dişil)' kelimesini yazın",
        "explanation": "'Тази' kelimesi dişil (kadın/dişi) isimler için 'bu' anlamına gelir. 'Госпожица' dişil olduğu için 'тази' kullanılır."
    },
    {
        "bg_sentence": "А тази госпожица _____ е?",
        "expected": "КОЯ",
        "hint": "Boşluğa 'kim (dişil)' kelimesini yazın",
        "explanation": "'Коя', dişil isimler için 'Kim?' sorusudur. Eril olsaydı 'Кой' kullanılırdı."
    },
    {
        "bg_sentence": "_____ господин кой е?",
        "expected": "ОНЗИ",
        "hint": "Boşluğa 'şu/öteki (eril)' kelimesini yazın",
        "explanation": "'Онзи', eril (erkek) isimler için 'şu/öteki' anlamına gelir. 'Господин' eril olduğu için kullanılır."
    },
    {
        "bg_sentence": "Познавате _____ го?",
        "expected": "ЛИ",
        "hint": "Boşluğa 'mı/mi' soru edatını yazın",
        "explanation": "'Ли' Bulgarcada soru edatıdır ve her zaman vurgulanan kelimeden (genellikle yüklemden/fiilden) hemen sonra gelir."
    },
    {
        "bg_sentence": "Българи _____ са?",
        "expected": "ЛИ",
        "hint": "Boşluğa 'mı/mi' soru edatını yazın",
        "explanation": "Soru edatı 'ли' kendinden önceki kelimeyi (burada Българи) soru yapar: 'Bulgarlar mı?'"
    },
    {
        "bg_sentence": "_____ сте по националност? (Erkek birine sorarken)",
        "expected": "КАКЪВ",
        "hint": "Boşluğa 'Ne/Hangi (eril)' kelimesini yazın",
        "explanation": "'Какъв' (Nasıl/Ne), erkekler için milliyet veya meslek sorarken kullanılır. Kadınlar için 'Каква' kullanılır."
    },
    {
        "bg_sentence": "_____ сте по националност? (Kadın birine sorarken)",
        "expected": "КАКВА",
        "hint": "Boşluğa 'Ne/Hangi (dişil)' kelimesini yazın",
        "explanation": "'Каква' (Nasıl/Ne), kadınlar için milliyet veya meslek sorarken kullanılır. Erkekler için 'Какъв' kullanılır."
    },
    {
        "bg_sentence": "Той е професор. _____ е преподавателят ни.",
        "expected": "ТОЙ",
        "hint": "Boşluğa 'O (eril)' zamirini yazın",
        "explanation": "'Той', eril (erkek) isimler için 'O' şahıs zamiridir. Dişil için 'Тя', nötr için 'То' kullanılır."
    },
    {
        "bg_sentence": "Това е Джеврие. _____ е от Одрин.",
        "expected": "ТЯ",
        "hint": "Boşluğa 'O (dişil)' zamirini yazın",
        "explanation": "'Тя', dişil (kadın) isimler için 'O' şahıs zamiridir. Cevriye kadın olduğu için 'Тя' kullanılır."
    },
    {
        "bg_sentence": "_____ се запознаем с тях.",
        "expected": "ЩЕ",
        "hint": "Boşluğa gelecek zaman ekini/kelimesini yazın",
        "explanation": "'Ще' (okunuşu: şte), kendisinden sonra gelen fiili Gelecek Zaman yapar (Ecek/Acak). Örn: Ще се запознаем = Tanışacağız."
    },
    {
        "bg_sentence": "Ние имаме сънародници и в _____ страни.",
        "expected": "ДРУГИ",
        "hint": "Boşluğa 'başka/diğer (çoğul)' kelimesini yazın",
        "explanation": "'Други', 'други' (başka/diğer) sıfatının ÇOĞUL halidir. 'Страни' (ülkeler) çoğul olduğu için sıfat da çoğul eki almıştır."
    }
]

for g in grammar_qs:
    sentence_fmt = f"_____ (Bulgarcası: {g['bg_sentence']})"
    add_q(sentence_fmt, g['expected'], g['hint'], g['explanation'])


# METİN CÜMLELERİ (Tüm paragraf diyalogları)
current_bg = ""
for p in doc.paragraphs:
    text = p.text.strip()
    if text.startswith("BG:"):
        current_bg = text[3:].strip()
    elif text.startswith("TR:") and current_bg:
        tr_text = text[3:].strip()
        if tr_text.startswith("(") and tr_text.endswith(")"):
            tr_text = tr_text[1:-1].strip()
        add_q(f"_____ (Bulgarcası: {current_bg})", tr_text, "Türkçe karşılığını yazınız")
        add_q(f"_____ (Türkçesi: {tr_text})", current_bg, "Bulgarca karşılığını yazınız")
        current_bg = ""



module_data = {
    "title": "Balkan Göçmenleri İçin Bulgarca - Ders 3 (Açıklamalı Kurallar)",
    "questions": questions
}

with open('src/data/modules/balgoc___Bulgarca_A1_Ders_3_Turkce_Aciklamali_Not.json', 'w', encoding='utf-8') as f:
    json.dump(module_data, f, ensure_ascii=False, indent=2)

print(f"Toplam {len(questions)} soru üretildi.")
