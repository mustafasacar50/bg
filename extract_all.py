import os
import re
import json
import random

docs_dir = r"D:\bulgarca_sınav_modulu\docs\extracted_texts"
output_file = r"D:\bulgarca_sınav_modulu\exam-app\src\data\questions.json"

vocab_pairs = []
sentences_pairs = []

# Cyrillic alphabet regex
cyrillic_re = re.compile(r'[А-Яа-яЁё]')

for filename in os.listdir(docs_dir):
    if not filename.endswith('.txt') or "P04" in filename:
        continue
        
    filepath = os.path.join(docs_dir, filename)
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        
    for line in lines:
        line = line.strip()
        if not line or not cyrillic_re.search(line):
            continue
            
        # Remove pronunciation in parentheses like (VODA) or [ZDRAVEY]
        clean_line = re.sub(r'\(.*?\)', '', line)
        clean_line = re.sub(r'\[.*?\]', '', clean_line)
        
        # Split by dash or equals or arrow
        parts = re.split(r'[-–=→]', clean_line)
        if len(parts) == 2:
            bg = parts[0].strip().upper()
            tr = parts[1].strip().upper()
            
            # Remove leading numbers like "1."
            bg = re.sub(r'^\d+\.?\s*', '', bg)
            
            # If valid looking
            if len(bg) > 1 and len(tr) > 1 and cyrillic_re.search(bg) and not cyrillic_re.search(tr):
                if len(bg.split()) > 3:
                    sentences_pairs.append((bg, tr))
                else:
                    vocab_pairs.append((bg, tr))
                    
        # Or split by multiple spaces if no dash
        elif "  " in clean_line:
            parts = [p.strip() for p in re.split(r' {2,}', clean_line) if p.strip()]
            if len(parts) >= 2:
                for i in range(len(parts)-1):
                    bg = parts[i].upper()
                    tr = parts[i+1].upper()
                    bg = re.sub(r'^\d+\.?\s*', '', bg)
                    if cyrillic_re.search(bg) and not cyrillic_re.search(tr) and len(bg) > 1 and len(tr) > 1:
                        if len(bg.split()) > 3:
                            sentences_pairs.append((bg, tr))
                        else:
                            vocab_pairs.append((bg, tr))

# Remove duplicates
vocab_pairs = list(set(vocab_pairs))
sentences_pairs = list(set(sentences_pairs))

# Generate questions
questions = []

# 1. MCQs from vocab
for i, (bg, tr) in enumerate(vocab_pairs):
    direction = random.choice(["bg_to_tr", "tr_to_bg"])
    
    if direction == "bg_to_tr":
        options = [tr]
        while len(options) < 4 and len(vocab_pairs) >= 4:
            rand_tr = random.choice(vocab_pairs)[1]
            if rand_tr not in options:
                options.append(rand_tr)
        random.shuffle(options)
        
        questions.append({
            "id": f"q_mcq_auto_{i}",
            "type": "mcq",
            "difficulty": 1 if i % 2 == 0 else 2,
            "tags": ["Kelime Bilgisi", "BG-TR"],
            "question": f"Aşağıdaki Bulgarca kelimenin Türkçe karşılığı nedir?\n\n**{bg}**",
            "options": [{"id": f"opt{j+1}", "text": opt} for j, opt in enumerate(options)],
            "answer": f"opt{options.index(tr) + 1}",
            "points": 5
        })
    else:
        options = [bg]
        while len(options) < 4 and len(vocab_pairs) >= 4:
            rand_bg = random.choice(vocab_pairs)[0]
            if rand_bg not in options:
                options.append(rand_bg)
        random.shuffle(options)
        
        questions.append({
            "id": f"q_mcq_auto_{i}",
            "type": "mcq",
            "difficulty": 1 if i % 2 == 0 else 2,
            "tags": ["Kelime Bilgisi", "TR-BG"],
            "question": f"Aşağıdaki Türkçe kelimenin Bulgarca karşılığı nedir?\n\n**{tr}**",
            "options": [{"id": f"opt{j+1}", "text": opt} for j, opt in enumerate(options)],
            "answer": f"opt{options.index(bg) + 1}",
            "points": 5
        })

# 2. Matching from vocab
random.shuffle(vocab_pairs)
for i in range(0, len(vocab_pairs) - 5, 5):
    pairs = vocab_pairs[i:i+5]
    
    shuffled_right = [p[1] for p in pairs]
    random.shuffle(shuffled_right)
    
    match_options = [{"id": f"opt{j+1}", "text": text} for j, text in enumerate(shuffled_right)]
    
    questions.append({
        "id": f"q_match_auto_{i}",
        "type": "match",
        "difficulty": 2,
        "tags": ["Eşleştirme", "Otomatik Üretim"],
        "question": "Aşağıdaki Bulgarca kelimeleri Türkçe anlamlarıyla eşleştiriniz.",
        "pairs": [
            {
                "word": p[0], 
                "match": match_options[[opt["text"] for opt in match_options].index(p[1])]["id"]
            } for p in pairs
        ],
        "options": match_options,
        "points": 10
    })

# 3. Blanks from sentences (hide a random word)
for i, (bg, tr) in enumerate(sentences_pairs):
    words = bg.split()
    if len(words) < 3: continue
    
    # pick a random word to blank out that is cyrillic and longer than 2 chars
    valid_words = [w for w in words if len(w) > 2 and cyrillic_re.search(w)]
    if not valid_words: continue
    
    target = random.choice(valid_words)
    target_clean = re.sub(r'[.,!?;:]', '', target)
    
    sentence_blanked = bg.replace(target, "____", 1)
    
    questions.append({
        "id": f"q_blank_auto_{i}",
        "type": "blank",
        "difficulty": 3,
        "tags": ["Cümle", "Boşluk Doldurma"],
        "sentence": sentence_blanked,
        "hint": tr,
        "answers": {
            f"q_blank_auto_{i}": target_clean
        },
        "points": 15
    })

# 4. Sentence Translation MCQs from sentences
for i, (bg, tr) in enumerate(sentences_pairs):
    direction = random.choice(["bg_to_tr", "tr_to_bg"])
    
    if direction == "bg_to_tr":
        options = [tr]
        while len(options) < 4 and len(sentences_pairs) >= 4:
            rand_tr = random.choice(sentences_pairs)[1]
            if rand_tr not in options:
                options.append(rand_tr)
        random.shuffle(options)
        
        questions.append({
            "id": f"q_mcq_sentence_{i}",
            "type": "mcq",
            "difficulty": 3,
            "tags": ["Cümle Çevirisi", "BG-TR"],
            "question": f"Aşağıdaki Bulgarca cümlenin Türkçe karşılığı nedir?\n\n**{bg}**",
            "options": [{"id": f"opt{j+1}", "text": opt} for j, opt in enumerate(options)],
            "answer": f"opt{options.index(tr) + 1}",
            "points": 10
        })
    else:
        options = [bg]
        while len(options) < 4 and len(sentences_pairs) >= 4:
            rand_bg = random.choice(sentences_pairs)[0]
            if rand_bg not in options:
                options.append(rand_bg)
        random.shuffle(options)
        
        questions.append({
            "id": f"q_mcq_sentence_{i}",
            "type": "mcq",
            "difficulty": 3,
            "tags": ["Cümle Çevirisi", "TR-BG"],
            "question": f"Aşağıdaki Türkçe cümlenin Bulgarca karşılığı nedir?\n\n**{tr}**",
            "options": [{"id": f"opt{j+1}", "text": opt} for j, opt in enumerate(options)],
            "answer": f"opt{options.index(bg) + 1}",
            "points": 10
        })

# Save the fresh questions list directly
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(questions, f, ensure_ascii=False, indent=2)

print(f"Extracted {len(vocab_pairs)} vocab pairs and {len(sentences_pairs)} sentences.")
print(f"Total questions in bank now: {len(questions)}")
