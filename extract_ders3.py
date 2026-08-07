import json
import hashlib

questions = []

def add_q(sentence, answer, hint, explanation=None):
    # Unique ID
    raw = sentence + answer + hint
    qid = "q_auto_" + hashlib.md5(raw.encode('utf-8')).hexdigest()[:8]
    q = {
        "id": qid,
        "type": "blank",
        "points": 5,
        "sentence": sentence,
        "answer": answer,
        "hint": hint
    }
    if explanation:
        q["explanation"] = explanation
    questions.append(q)

# --- 1. ÇEVİRİ SORULARI (Klasik) ---
# Bazı temel kelime ve cümleleri çeviri olarak ekleyelim
translations = [
    ("Добър ден, госпожице!", "İyi günler, hanımefendi!"),
    ("Откъде сте?", "Nerelisiniz?"),
    ("Аз съм от Турция.", "Ben Türkiye'denim."),
    ("Приятно ми е.", "Memnun oldum."),
    ("Как се казвате?", "Adınız nedir?"),
    ("Аз съм студент.", "Ben öğrenciyim."),
    ("Ще се запознаем с тях.", "Onlarla tanışacağız.")
]

for bg, tr in translations:
    add_q(f"_____ (Bulgarcası: {bg})", tr.upper(), "Türkçe karşılığını yazınız")
    add_q(f"_____ (Türkçesi: {tr})", bg.upper(), "Bulgarca karşılığını yazınız")


# --- 2. GRAMER (BOŞLUK DOLDURMA) SORULARI ---

grammar_qs = [
    {
        "bg_sentence": "Това е Джеврие. Тя е _____.",
        "expected": "СТУДЕНТКА",
        "hint": "Boşluğa 'öğrenci (kadın)' kelimesini yazın",
        "explanation": "Bulgarcada meslekler cinsiyete göre değişir. Kadın öğrenci için 'студентка', genel veya erkek öğrenci için 'студент' kullanılır."
    },
    {
        "bg_sentence": "И аз съм _____.",
        "expected": "СТУДЕНТ",
        "hint": "Boşluğa 'öğrenci (erkek)' kelimesini yazın",
        "explanation": "Erkekler (veya genel kullanım) için 'студент' kelimesi kullanılır. Kadın olsaydı 'студентка' olurdu."
    },
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
        "bg_sentence": "_____ сте по националност?",
        "expected": "КАКЪВ",
        "hint": "Boşluğa 'Ne/Hangi (eril)' kelimesini yazın",
        "explanation": "'Какъв' (Nasıl/Ne), erkekler için milliyet veya meslek sorarken kullanılır. Kadınlar için 'Каква' kullanılır."
    },
    {
        "bg_sentence": "_____ сте по националност?",
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
        "bg_sentence": "Никос е _____, Емине е туркиня.",
        "expected": "ГРЪК",
        "hint": "Boşluğa 'Yunan (erkek)' kelimesini yazın",
        "explanation": "Milliyet isimleri de cinsiyete göre değişir. Yunan erkek için 'грък', Yunan kadın için 'гъркиня' kullanılır."
    },
    {
        "bg_sentence": "Емине е _____, Мирча е румънец.",
        "expected": "ТУРКИНЯ",
        "hint": "Boşluğa 'Türk (kadın)' kelimesini yazın",
        "explanation": "Türk kadın için 'туркиня', Türk erkek için 'турчин' kullanılır."
    },
    {
        "bg_sentence": "Ние имаме сънародници и в _____ страни.",
        "expected": "ДРУГИ",
        "hint": "Boşluğa 'başka/diğer (çoğul)' kelimesini yazın",
        "explanation": "'Други', 'други' (başka/diğer) sıfatının ÇOĞUL halidir. 'Страни' (ülkeler) çoğul olduğu için sıfat da çoğul eki almıştır."
    },
    {
        "bg_sentence": "Ана е преводачка, Лучия е _____, Мари е моделиерка.",
        "expected": "СЕКРЕТАРКА",
        "hint": "Boşluğa 'sekreter (kadın)' kelimesini yazın",
        "explanation": "Mesleklerin sonuna '-ка' eki getirilerek dişil (kadın) formları elde edilir. (Секретар -> Секретарка)"
    },
    {
        "bg_sentence": "Мария е преподавателка, а Иван сега е _____.",
        "expected": "БИЗНЕСМЕН",
        "hint": "Boşluğa 'iş adamı' kelimesini yazın",
        "explanation": "Bazı kelimeler İngilizceden doğrudan geçmiştir. 'Бизнесмен' (İş adamı) eril formdadır."
    },
    {
        "bg_sentence": "Баща ми е учител, майка ми е _____.",
        "expected": "ЛЕКАРКА",
        "hint": "Boşluğa 'doktor (kadın)' kelimesini yazın",
        "explanation": "Erkek doktor 'лекар', kadın doktor 'лекарка' olarak adlandırılır."
    },
    {
        "bg_sentence": "Две от колежките работят във фризьорски салон – едната е _____, а другата – фризьорка.",
        "expected": "МАНИКЮРИСТКА",
        "hint": "Boşluğa 'manikürcü (kadın)' kelimesini yazın",
        "explanation": "Yabancı kökenli -ист ile biten meslekler, kadınlar için -ка eki alır: Маникюрист (erkek) -> Маникюристка (kadın)."
    }
]

for g in grammar_qs:
    # Boşluk doldurma formatını simüle et
    sentence_fmt = f"_____ (Bulgarcası: {g['bg_sentence']})"
    add_q(sentence_fmt, g['expected'].upper(), g['hint'], g['explanation'])


# JSON olarak kaydet
module_data = {
    "title": "Balkan Göçmenleri İçin Bulgarca - Ders 3 (Açıklamalı Kurallar)",
    "questions": questions
}

with open('src/data/modules/balgoc___Bulgarca_A1_Ders_3_Turkce_Aciklamali_Not.json', 'w', encoding='utf-8') as f:
    json.dump(module_data, f, ensure_ascii=False, indent=2)

print(f"Toplam {len(questions)} soru üretildi.")
