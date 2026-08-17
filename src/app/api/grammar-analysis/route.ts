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
    
    // Dynamically find all vocab files
    const allFiles = fs.existsSync(vocabDir) ? fs.readdirSync(vocabDir) : [];
    const allVocabFiles = allFiles.filter(f => f.startsWith('vocab_') && f.endsWith('.json') && !f.endsWith('_index.json'));
    
    let activeVocabFile = null;
    if (moduleId.includes("Ders_1_2")) activeVocabFile = "vocab_ders_1_2.json";
    else if (moduleId.includes("Ders_3")) activeVocabFile = "vocab_ders_3.json";
    else if (moduleId.includes("Ders_4")) activeVocabFile = "vocab_ders_4.json";
    else if (moduleId.includes("Ders_5")) activeVocabFile = "vocab_ders_5.json";
    else if (moduleId.includes("Ders_6")) activeVocabFile = "vocab_ders_6.json";
    else if (moduleId.includes("Ders_7")) activeVocabFile = "vocab_ders_7.json";
    else if (moduleId.includes("Ders_8")) activeVocabFile = "vocab_ders_8.json";
    else if (moduleId.includes("Ders_9")) activeVocabFile = "vocab_ders_9.json";
    else if (moduleId.includes("Ders_10")) activeVocabFile = "vocab_ders_10.json";
    else if (moduleId.includes("Ders_11")) activeVocabFile = "vocab_ders_11.json";

    // Normalize accents to avoid mismatch during analysis
    const normalizeString = (str: string) => str ? str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase() : '';
    const sentenceText = normalizeString(sentence);
    const answerText = normalizeString(answer);
    const focusText = `${sentenceText} ${answerText}`;

    // Extract individual Cyrillic words from the sentence
    const sentenceWords = focusText.match(/[а-яА-ЯёЁ]+/gi) || [];
    const uniqueWords = [...new Set(sentenceWords.map(w => w.toLowerCase()))];

    // Helper to check exact word match
    const hasWholeWord = (searchWord: string, inText: string) => {
      if (!searchWord || searchWord.trim().length === 0) return false;
      const escaped = searchWord.trim().toLowerCase().replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&');
      if (searchWord.length <= 2) {
        const regexExact = new RegExp(`(?:^|[^а-яА-ЯёЁa-zA-Z])(${escaped})(?:[^а-яА-ЯёЁa-zA-Z]|$)`, 'i');
        return regexExact.test(inText);
      }
      // Strict suffix tolerance for Bulgarian articles and common endings (-та, -то, -ът, -те, -я, -ят, -че, -и)
      const regex = new RegExp(`(?:^|[^а-яА-ЯёЁa-zA-Z])(${escaped}(?:та|то|ът|те|я|ят|че|и)?)(?:[^а-яА-ЯёЁa-zA-Z]|$)`, 'i');
      return regex.test(inText);
    };

    const acceptedTypes = ['fiil', 'sıfat', 'isim', 'zamir', 'parçacık', 'edat', 'bağlaç', 'zarf', 'ünlem'];

    // --- PHASE 1: Rich vocab lookup (search ALL vocab files, not just active module) ---
    const richCards: GrammarWord[] = [];
    const matchedBaseWords = new Set<string>();

    // Always search ALL vocab files so D1-2 words show up in D3 sentences and vice versa
    // allVocabFiles and activeVocabFile are already defined above
    const orderedFiles = activeVocabFile
      ? [activeVocabFile, ...allVocabFiles.filter(f => f !== activeVocabFile)]
      : allVocabFiles;

    const globalMatchedBaseIds = new Set<string>();
    const seenWordBg = new Set<string>(); // deduplicate across files

    for (const vocabFile of orderedFiles) {
      const filePath = path.join(vocabDir, vocabFile);
      if (!fs.existsSync(filePath)) continue;
      const content = JSON.parse(fs.readFileSync(filePath, "utf8"));

      // Always fallback to linear scan instead of using index files because index files get out of sync.
      let wordsArray = [];
      if (Array.isArray(content)) wordsArray = content;
      else if (content.words && Array.isArray(content.words)) wordsArray = content.words;
      else wordsArray = Object.values(content);

      let filtered: GrammarWord[] = wordsArray.filter((w: GrammarWord) => {
        if (!w || typeof w !== 'object') return false;
        if (!acceptedTypes.includes(w.type) && !w.notes) return false;
        
        const baseWord = normalizeString(w.bg || '');
        if (!baseWord) return false;
        if (hasWholeWord(baseWord, focusText)) { matchedBaseWords.add(baseWord); return true; }
        
        if (w.conjugation) {
          for (const tense of Object.values(w.conjugation) as any[]) {
            for (const form of Object.values(tense)) {
              const formStr = normalizeString(String(form));
              const formWords = formStr.split(/\\s+/);
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
        if (w.nounForms && Object.values(w.nounForms).some((f: any) => { 
          if (f === null || f === undefined) return false;
          const v = hasWholeWord(String(f), focusText); 
          if(v) matchedBaseWords.add(String(f).toLowerCase()); 
          return v; 
        })) return true;
        
        // We intentionally SKIP w.pronounForms here to prevent reverse-matching
        return false;
      });

        // Enrich with matched form
        for (const card of filtered) {
          let matchedForm = card.bg;
          let matchedReason = 'Kök form';

          const tenseNames: Record<string, string> = { present: 'Şimdiki Zaman', past: 'Geçmiş Zaman', future: 'Gelecek Zaman', imperative: 'Emir Kipi' };

          if (card.conjugation) {
            for (const [tense, forms] of Object.entries(card.conjugation)) {
              for (const [person, form] of Object.entries(forms as Record<string, string>)) {
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
              if (form !== null && form !== undefined && hasWholeWord(String(form), focusText)) { 
                matchedForm = String(form); 
                matchedReason = formNames[formName] || formName; 
              }
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
    const miniCards: GrammarWord[] = [];
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
    allCards.sort((a, b) => {
      const aExact = (a.bg || '').toLowerCase() === (a.matchedForm || '').toLowerCase() ? 0 : 1;
      const bExact = (b.bg || '').toLowerCase() === (b.matchedForm || '').toLowerCase() ? 0 : 1;
      return aExact - bExact;
    });

    // Merge cards sharing the same matched form, and dedup by base word
    const mergedMap = new Map<string, GrammarWord>();
    const seenBg = new Set<string>();
    
    for (const card of allCards) {
      const formKey = (card.matchedForm || '').toLowerCase();
      const bgKey = (card.bg || '').toLowerCase();
      if (!bgKey) continue;

      if (mergedMap.has(formKey)) {
        // Form already exists, merge missing paradigms/data into it (Union Set approach)
        const existing = mergedMap.get(formKey);
        if (!existing.pronounForms && card.pronounForms) existing.pronounForms = card.pronounForms;
        if (!existing.nounForms && card.nounForms) existing.nounForms = card.nounForms;
        if (!existing.forms && card.forms) existing.forms = card.forms;
        if (!existing.conjugation && card.conjugation) existing.conjugation = card.conjugation;
        if ((!existing.examples || existing.examples.length === 0) && card.examples) existing.examples = card.examples;
        if (!existing.notes && card.notes) existing.notes = card.notes;
        
        seenBg.add(bgKey);
      } else if (!seenBg.has(bgKey)) {
        // First time seeing this matched form, and first time seeing this base word
        mergedMap.set(formKey, { ...card });
        seenBg.add(bgKey);
      }
    }
    
    allCards = Array.from(mergedMap.values());

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
  } catch (error: unknown) {
    console.error("Error in grammar analysis:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
