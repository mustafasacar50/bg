import json
import hashlib
import re

questions = []

def add_q(sentence, answer, hint, explanation=None, type_override=None):
    # Unique ID
    raw = sentence + answer + hint + str(type_override)
    qid = "q_auto_" + hashlib.md5(raw.encode('utf-8')).hexdigest()[:8]
    q_type = type_override if type_override else ("fill_in_the_blank" if "_____" in sentence else "translation")
    q = {
        "id": qid,
        "type": q_type,
        "sentence": sentence,
        "answer": answer,
        "hint": hint
    }
    if explanation:
        q["explanation"] = explanation
    
    # Avoid exact duplicates
    if not any(x['sentence'] == q['sentence'] and x['answer'] == q['answer'] and x['type'] == q['type'] for x in questions):
        questions.append(q)

def get_phonetic_rule(tr_word, bg_word):
    rules = []
    tr_upper = tr_word.upper()
    bg_upper = bg_word.upper()
    
    if 'Ş' in tr_upper and 'Ш' in bg_upper:
        rules.append("Türkçedeki Ş sesi Bulgarcada genellikle Ш ile yazılır.")
    if 'J' in tr_upper and 'Ж' in bg_upper:
        rules.append("Türkçedeki J sesi Bulgarcada Ж ile yazılır.")
    if ('LOJİ' in tr_upper or 'LOJI' in tr_upper) and 'ЛОГИ' in bg_upper:
        rules.append("Türkçedeki -loji/-ji sonları Bulgarcada çoğunlukla -логия/-гия biçimine yaklaşır.")
    if 'Ç' in tr_upper and 'Ч' in bg_upper:
        rules.append("Türkçedeki Ç sesi Bulgarcada genellikle Ч ile yazılır.")
    if 'Ç' in tr_upper and 'Ц' in bg_upper:
        rules.append("Bazı alıntı kelimelerde Ç/ts benzeri ses Ц ile yazılır.")
    if 'Ö' in tr_upper and 'ЬО' in bg_upper:
        rules.append("Ö sesi bazı kelimelerde yumuşatma işaretli ьо ile gösterilir.")
    if 'Ö' in tr_upper and 'О' in bg_upper:
        rules.append("Ö sesi birçok uluslararası alıntı kelimede O ile karşılanır.")
    if 'Ü' in tr_upper and 'Ю' in bg_upper:
        rules.append("Ü sesi kimi kelimelerde Ю ile yazılır.")
    if 'Ü' in tr_upper and 'У' in bg_upper:
        rules.append("Ü bazı alıntılarda У ile yazılır.")
    if 'SYON' in tr_upper and 'ЦИЯ' in bg_upper:
        rules.append("-syon sonları Bulgarcada çoğunlukla -ция olur.")
    if ('İZM' in tr_upper or 'IZM' in tr_upper) and 'ИЗЪМ' in bg_upper:
        rules.append("-izm ile biten kavramlar Bulgarcada -изъм ile yazılır.")
    if 'OTO' in tr_upper and 'АВТО' in bg_upper:
        rules.append("Oto- kökü Bulgarcada çoğu zaman авто- olur.")
        
    return " ".join(rules) if rules else None

def get_grammar_rule(bg_text):
    rules = []
    bg_lower = bg_text.lower()
    
    if 'казвам се' in bg_lower or 'се казва' in bg_lower:
        rules.append("Dil Notu: 'се' dönüşlülük unsurudur. 'Казвам се' kelime kelime 'kendime ... denir' gibi düşünülebilir ama Türkçede 'Benim adım ...' diye çevrilir.")
    if 'съм' in bg_lower or ' си ' in bg_lower or ' сме ' in bg_lower or ' сте ' in bg_lower or ' са ' in bg_lower:
        rules.append("Bulgarcada 'olmak' fiili (съм) çok önemlidir: аз съм, ти си, той/тя/то е, ние сме, вие сте, те са.")
    if ' ли ' in bg_lower or ' ли?' in bg_lower:
        rules.append("'ли' parçacığı evet/hayır sorusu yapar (Örn: Студент ли си? = Öğrenci misin?).")
    if 'вие' in bg_lower or 'вас' in bg_lower:
        rules.append("Resmi ve kibar konuşmada 'Вие' (Siz) kullanılır.")
    if 'господин' in bg_lower:
        rules.append("Bulgarcada hitap ederken kelimenin biçimi değişebilir. Örneğin господин = bay, ama doğrudan seslenirken 'господине!' denir.")
    if 'добро утро' in bg_lower:
        rules.append("Sabahları (сутрин) selamlaşırken 'Добро утро' denir.")
    if 'приятно ми е' in bg_lower:
        rules.append("Kalıp: 'Приятно ми е' tek başına 'Memnun oldum' demektir.")
        
    return " ".join(rules) if rules else None

def is_cyrillic(text):
    return any('\u0400' <= char <= '\u04FF' for char in text)

def parse_file():
    with open('ders1_2_temp.txt', 'r', encoding='utf-8') as f:
        lines = [line.strip() for line in f.readlines()]
        
    i = 0
    while i < len(lines):
        line = lines[i]
        
        if '\t' in line:
            parts = line.split('\t')
            if len(parts) >= 2:
                p0 = parts[0].strip()
                p1 = parts[1].strip()
                p2 = parts[2].strip() if len(parts) > 2 else ""
                
                if not p0 or not p1:
                    i += 1
                    continue
                
                if 'kelime' in p0.lower() or 'kelime' in p1.lower() or 'bulgarca' in p0.lower() or 'bulgarca' in p1.lower():
                    i += 1
                    continue
                    
                bg_text = ""
                tr_text = ""
                
                if is_cyrillic(p0) and not is_cyrillic(p1):
                    bg_text = p0
                    if p1 == 'Türkçe' and i + 1 < len(lines) and not '\t' in lines[i+1]:
                        tr_text = lines[i+1].strip()
                        i += 1 # Consume the next line
                    else:
                        tr_text = p1
                        if p2 and not is_cyrillic(p2): tr_text += f" ({p2})"
                        
                elif not is_cyrillic(p0) and is_cyrillic(p1):
                    tr_text = p0
                    bg_text = p1
                    if p2 and not is_cyrillic(p2): tr_text += f" ({p2})"
                elif is_cyrillic(p1) and is_cyrillic(p2):
                    tr_text = p0
                    bg_text = p1
                
                if not bg_text or not tr_text or tr_text == bg_text:
                    i += 1
                    continue
                    
                # Do not accept "Türkçe" as a translation
                if tr_text == 'Türkçe':
                    i += 1
                    continue
                    
                rule = get_grammar_rule(bg_text)
                if not rule:
                    rule = get_phonetic_rule(tr_text, bg_text)
                
                if len(bg_text.split()) > 3 or len(tr_text.split()) > 3:
                    add_q(
                        sentence=f"Çeviriniz (Türkçesi: {tr_text})",
                        answer=bg_text,
                        hint="Bulgarca karşılığını yazınız",
                        explanation=rule
                    )
                    add_q(
                        sentence=f"Çeviriniz (Bulgarcası: {bg_text})",
                        answer=tr_text,
                        hint="Türkçe karşılığını yazınız",
                        explanation=rule
                    )
                    if len(bg_text.split()) >= 2:
                        add_q(
                            sentence=f"Kelimeleri sıraya dizerek cümleyi kurunuz: {tr_text}",
                            answer=bg_text,
                            hint="Doğru sıralamayı bul",
                            explanation=rule,
                            type_override="scramble"
                        )
                else:
                    add_q(
                        sentence=f"{tr_text} kelimesinin Bulgarca yazılışı:",
                        answer=bg_text,
                        hint="Bulgarca karşılığını yazınız",
                        explanation=rule
                    )
                    add_q(
                        sentence=f"{bg_text} kelimesinin Türkçe anlamı:",
                        answer=tr_text,
                        hint="Türkçe karşılığını yazınız",
                        explanation=rule
                    )
        i += 1

parse_file()
print(f"Generated {len(questions)} questions")

out_file = 'src/data/modules/balgoc___Bulgarca_A1_Ders_1_2.json'
with open(out_file, 'w', encoding='utf-8') as f:
    json.dump({
        "title": "Ders 1 ve 2: Alfabeye Giriş ve Tanışma",
        "questions": questions
    }, f, ensure_ascii=False, indent=2)

print(f"Generated {len(questions)} questions in {out_file}")
