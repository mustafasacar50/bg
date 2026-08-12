import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import miniDict from "@/data/vocabulary/mini_dict";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sentence, answer, moduleId } = body;

    if (!moduleId) {
      return NextResponse.json({ error: "moduleId is required" }, { status: 400 });
    }

    const vocabDir = path.join(process.cwd(), "src/data/vocabulary");
    
    const moduleMap: Record<string, string> = {
      "balgoc___Bulgarca_A1_Ders_1_2": "vocab_ders_1_2.json",
    };

    // ONLY analyze words from the actual sentence + answer
    const sentenceText = (sentence || '').toLowerCase();
    const answerText = (answer || '').toLowerCase();
    const focusText = `${sentenceText} ${answerText}`;

    // Extract individual Cyrillic words from the sentence
    const sentenceWords = focusText.match(/[а-яА-ЯёЁ]+/gi) || [];
    const uniqueWords = [...new Set(sentenceWords.map(w => w.toLowerCase()))];

    // Helper to check exact word match
    const hasWholeWord = (searchWord: string, inText: string) => {
      const escaped = searchWord.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(?:^|[^а-яА-ЯёЁa-zA-Z])(${escaped})(?:[^а-яА-ЯёЁa-zA-Z]|$)`, 'i');
      return regex.test(inText);
    };

    const acceptedTypes = ['fiil', 'sıfat', 'isim', 'zamir', 'parçacık', 'edat', 'bağlaç', 'zarf', 'ünlem'];

    // --- PHASE 1: Rich vocab lookup ---
    const richCards: any[] = [];
    const matchedBaseWords = new Set<string>(); // Track which sentence words were matched by rich vocab

    const vocabFile = moduleMap[moduleId];
    if (vocabFile) {
      const filePath = path.join(vocabDir, vocabFile);
      if (fs.existsSync(filePath)) {
        const content = JSON.parse(fs.readFileSync(filePath, "utf8"));
        
        let filtered: any[] = [];
        const indexFilePath = filePath.replace('.json', '_index.json');
        
        if (fs.existsSync(indexFilePath)) {
          const index = JSON.parse(fs.readFileSync(indexFilePath, "utf8"));
          const sentenceTokens = focusText.match(/[а-яА-ЯёЁa-zA-Z]+/gi) || [];
          const matchedBaseIds = new Set<string>();

          // 1-gram check
          sentenceTokens.forEach(t => {
            const clean = t.toLowerCase();
            if (index[clean]) {
              matchedBaseIds.add(index[clean]);
              matchedBaseWords.add(clean);
            }
          });

          // 2-gram check (for things like "запознайте се")
          for(let i = 0; i < sentenceTokens.length - 1; i++) {
            const bi = (sentenceTokens[i] + " " + sentenceTokens[i+1]).toLowerCase();
            if (index[bi]) {
              matchedBaseIds.add(index[bi]);
              matchedBaseWords.add(sentenceTokens[i].toLowerCase());
              matchedBaseWords.add(sentenceTokens[i+1].toLowerCase());
            }
          }

          filtered = content.words.filter((w: any) => 
            matchedBaseIds.has(w.bg.toLowerCase()) && 
            (acceptedTypes.includes(w.type) || w.notes)
          );
        } else {
          // Fallback to old linear scan if index doesn't exist
          filtered = content.words.filter((w: any) => {
            if (!acceptedTypes.includes(w.type) && !w.notes) return false;
            
            const baseWord = w.bg.toLowerCase();
            if (hasWholeWord(baseWord, focusText)) { matchedBaseWords.add(baseWord); return true; }
            
            if (w.conjugation) {
              for (const tense of Object.values(w.conjugation) as any[]) {
                for (const form of Object.values(tense)) {
                  const formStr = String(form).toLowerCase();
                  const formWords = formStr.split(/\s+/);
                  if (formWords.some(fw => hasWholeWord(fw, focusText) && fw.length > 2)) {
                    formWords.forEach(fw => matchedBaseWords.add(fw));
                    return true;
                  }
                }
              }
            }
            
            if (w.forms && Object.values(w.forms).some((f: any) => { const v = hasWholeWord(f, focusText); if(v) matchedBaseWords.add(f.toLowerCase()); return v; })) return true;
            if (w.nounForms && Object.values(w.nounForms).some((f: any) => { const v = hasWholeWord(f, focusText); if(v) matchedBaseWords.add(f.toLowerCase()); return v; })) return true;
            if (w.pronounForms && Object.values(w.pronounForms).some((f: any) => { const v = hasWholeWord(f, focusText); if(v) matchedBaseWords.add(f.toLowerCase()); return v; })) return true;
  
            return false;
          });
        }

        // Enrich with matched form
        for (const card of filtered) {
          let matchedForm = card.bg;
          let matchedReason = 'Kök form';

          const tenseNames: Record<string, string> = { present: 'Şimdiki Zaman', past: 'Geçmiş Zaman', future: 'Gelecek Zaman', imperative: 'Emir Kipi' };

          if (card.conjugation) {
            for (const [tense, forms] of Object.entries(card.conjugation)) {
              for (const [person, form] of Object.entries(forms as any)) {
                const formWords = String(form).toLowerCase().split(/\s+/);
                if (formWords.some(fw => hasWholeWord(fw, focusText) && fw.length > 2)) {
                  matchedForm = form;
                  matchedReason = `${tenseNames[tense] || tense} - ${person}`;
                }
              }
            }
          }

          if (card.pronounForms) {
            const caseNames: Record<string, string> = { eril: 'Eril', 'dişil': 'Dişil', 'nötr': 'Nötr', 'çoğul': 'Çoğul', belirtme: 'Belirtme Hali' };
            for (const [caseName, form] of Object.entries(card.pronounForms)) {
              if (hasWholeWord(form as string, focusText)) { matchedForm = form; matchedReason = caseNames[caseName] || caseName; }
            }
          }

          if (card.nounForms) {
            const formNames: Record<string, string> = { tekil: 'Tekil', tekil_belirli: 'Tekil (Belirli)', 'çoğul': 'Çoğul', 'çoğul_belirli': 'Çoğul (Belirli)' };
            for (const [formName, form] of Object.entries(card.nounForms)) {
              if (hasWholeWord(form as string, focusText)) { matchedForm = form; matchedReason = formNames[formName] || formName; }
            }
          }

          if (card.forms) {
            const formNames: Record<string, string> = { eril: 'Eril Form', 'dişil': 'Dişil Form', 'nötr': 'Nötr Form', 'çoğul': 'Çoğul Form' };
            for (const [formName, form] of Object.entries(card.forms)) {
              if (hasWholeWord(form as string, focusText)) { matchedForm = form; matchedReason = formNames[formName] || formName; }
            }
          }

          richCards.push({ ...card, matchedForm, matchedReason, source: 'rich' });
        }
      }
    }

    // --- PHASE 2: Mini dict lookup for remaining unmatched words ---
    const miniCards: any[] = [];
    for (const word of uniqueWords) {
      if (matchedBaseWords.has(word)) continue; // Already covered by rich vocab
      if (word.length <= 1) continue; // Skip single letters
      
      const entry = miniDict[word];
      if (entry) {
        miniCards.push({
          bg: word,
          tr: entry.tr,
          type: entry.type,
          notes: entry.note || null,
          matchedForm: word,
          matchedReason: 'Kök form',
          source: 'mini'
        });
        matchedBaseWords.add(word);
      }
    }

    // Combine: rich cards first, then mini cards. Dedup by bg word.
    const seen = new Set<string>();
    let allCards = [...richCards, ...miniCards].filter(card => {
      const key = card.bg.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Sort cards: Fiil > İsim > Sıfat > Zamir > Diğerleri
    const typePriority: Record<string, number> = {
      'fiil': 1,
      'isim': 2,
      'sıfat': 3,
      'zamir': 4,
      'zarf': 5,
      'edat': 6,
      'bağlaç': 7,
      'parçacık': 8,
      'ünlem': 9
    };

    allCards.sort((a, b) => {
      const pA = typePriority[a.type] || 99;
      const pB = typePriority[b.type] || 99;
      return pA - pB;
    });

    return NextResponse.json({ cards: allCards.slice(0, 8) });
  } catch (error: any) {
    console.error("Error in grammar analysis:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
