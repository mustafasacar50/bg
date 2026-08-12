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
      "balgoc___Bulgarca_A1_Ders_3": "vocab_ders_3.json",
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

    // --- PHASE 1: Rich vocab lookup (search ALL vocab files, not just active module) ---
    const richCards: any[] = [];
    const matchedBaseWords = new Set<string>();

    // Always search ALL vocab files so D1-2 words show up in D3 sentences and vice versa
    const allVocabFiles = Object.values(moduleMap) as string[];
    // Put the active module's file first (priority)
    const activeVocabFile = moduleMap[moduleId];
    const orderedFiles = activeVocabFile
      ? [activeVocabFile, ...allVocabFiles.filter(f => f !== activeVocabFile)]
      : allVocabFiles;

    const globalMatchedBaseIds = new Set<string>();
    const seenWordBg = new Set<string>(); // deduplicate across files

    for (const vocabFile of orderedFiles) {
      const filePath = path.join(vocabDir, vocabFile);
      if (!fs.existsSync(filePath)) continue;
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
            if (Array.isArray(index[clean])) {
              index[clean].forEach((id: string) => matchedBaseIds.add(id));
            } else {
              matchedBaseIds.add(index[clean]);
            }
            matchedBaseWords.add(clean);
          }
        });

        // 2-gram check
        for(let i = 0; i < sentenceTokens.length - 1; i++) {
          const bi = (sentenceTokens[i] + " " + sentenceTokens[i+1]).toLowerCase();
          if (index[bi]) {
            if (Array.isArray(index[bi])) {
              index[bi].forEach((id: string) => matchedBaseIds.add(id));
            } else {
              matchedBaseIds.add(index[bi]);
            }
            matchedBaseWords.add(sentenceTokens[i].toLowerCase());
            matchedBaseWords.add(sentenceTokens[i+1].toLowerCase());
          }
        }

        filtered = content.words.filter((w: any) =>
          matchedBaseIds.has(w.bg.toLowerCase()) &&
          (acceptedTypes.includes(w.type) || w.notes) &&
          !seenWordBg.has(w.bg.toLowerCase())
        );
        filtered.forEach(w => seenWordBg.add(w.bg.toLowerCase()));

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
            
            if (w.forms) {
              const formsMatch = Object.values(w.forms).some((f: any) => {
                if (typeof f === 'object' && f !== null) {
                  return Object.values(f).some(subForm => {
                    const v = hasWholeWord(String(subForm), focusText);
                    if (v) matchedBaseWords.add(String(subForm).toLowerCase());
                    return v;
                  });
                }
                const v = hasWholeWord(String(f), focusText);
                if (v) matchedBaseWords.add(String(f).toLowerCase());
                return v;
              });
              if (formsMatch) return true;
            }
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
                // All words in the multi-word form must exist in the sentence
                if (formWords.every(fw => hasWholeWord(fw, focusText))) {
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
              if (typeof form === 'object' && form !== null) {
                // Handle nested forms like demonstrative pronouns { yakın: 'този', uzak: 'онзи' }
                for (const [subName, subForm] of Object.entries(form)) {
                   if (hasWholeWord(String(subForm), focusText)) {
                     matchedForm = subForm;
                     matchedReason = `${formNames[formName] || formName} (${subName})`;
                   }
                }
              } else {
                if (hasWholeWord(String(form), focusText)) { 
                  matchedForm = form; 
                  matchedReason = formNames[formName] || formName; 
                }
              }
            }
          }

          richCards.push({ ...card, matchedForm, matchedReason, source: 'rich' });
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

    // Combine: rich cards first, then mini cards.
    let allCards = [...richCards, ...miniCards];
    
    // Sort so that exact matches (base word == matched form) come first.
    // This ensures that if a word is matched directly (e.g. "тях"), it wins over a paradigm match (e.g. "мен" producing "тях").
    allCards.sort((a, b) => {
      const aExact = a.bg.toLowerCase() === a.matchedForm.toLowerCase() ? 0 : 1;
      const bExact = b.bg.toLowerCase() === b.matchedForm.toLowerCase() ? 0 : 1;
      return aExact - bExact;
    });

    // Dedup by matched form (we don't want to show multiple cards for the exact same word in the sentence)
    const seenMatched = new Set<string>();
    // Also dedup by bg word just in case multiple forms mapped to the same base word
    const seenBg = new Set<string>();
    
    allCards = allCards.filter(card => {
      const formKey = card.matchedForm.toLowerCase();
      const bgKey = card.bg.toLowerCase();
      if (seenMatched.has(formKey) || seenBg.has(bgKey)) return false;
      seenMatched.add(formKey);
      seenBg.add(bgKey);
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
