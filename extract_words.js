// Script to extract unique Bulgarian words from Ders 1-2
const fs = require('fs');
const path = require('path');

const modulePath = path.join(__dirname, 'src/data/modules/balgoc___Bulgarca_A1_Ders_1_2.json');
const data = JSON.parse(fs.readFileSync(modulePath, 'utf8'));

// Cyrillic word regex
const cyrillicWordRe = /[А-Яа-яЁёЪъ]+/g;

// Collect all unique Cyrillic words with their contexts
const wordMap = new Map();

for (const q of data.questions) {
  const fields = [q.sentence, q.answer, q.explanation || ''];
  const allText = fields.join(' ');
  const words = allText.match(cyrillicWordRe) || [];
  
  for (const w of words) {
    const lower = w.toLowerCase();
    if (!wordMap.has(lower)) {
      wordMap.set(lower, { original: w, count: 0, questions: new Set() });
    }
    const entry = wordMap.get(lower);
    entry.count++;
    entry.questions.add(q.id);
  }
}

// Also extract BG-TR translation pairs from translation questions
const pairs = [];
for (const q of data.questions) {
  if (q.type === 'translation') {
    const isBgSentence = cyrillicWordRe.test(q.sentence);
    if (isBgSentence) {
      pairs.push({ bg: q.sentence, tr: q.answer, qId: q.id });
    } else {
      const isBgAnswer = cyrillicWordRe.test(q.answer);
      if (isBgAnswer) {
        pairs.push({ bg: q.answer, tr: q.sentence, qId: q.id });
      }
    }
  }
}

// Sort by frequency
const sorted = [...wordMap.entries()]
  .sort((a, b) => b[1].count - a[1].count);

console.log(`\n=== DERS 1-2 KELIME ANALIZI ===`);
console.log(`Toplam benzersiz Kiril kelime: ${sorted.length}`);
console.log(`Toplam ceviri cifti: ${pairs.length}`);
console.log(`\n--- EN SIK KULLANILAN 80 KELIME ---`);

for (const [word, info] of sorted.slice(0, 80)) {
  console.log(`${info.original.padEnd(20)} x${String(info.count).padStart(4)}  (${info.questions.size} soruda)`);
}

// Save full word list to file
const output = {
  totalWords: sorted.length,
  totalPairs: pairs.length,
  words: sorted.map(([word, info]) => ({
    word: info.original,
    lowercase: word,
    frequency: info.count,
    questionCount: info.questions.size,
    questionIds: [...info.questions].slice(0, 5)
  })),
  translationPairs: pairs.slice(0, 50)
};

const outPath = path.join(__dirname, 'src/data/vocabulary');
if (!fs.existsSync(outPath)) fs.mkdirSync(outPath, { recursive: true });
fs.writeFileSync(
  path.join(outPath, 'raw_words_ders_1_2.json'),
  JSON.stringify(output, null, 2),
  'utf8'
);

console.log(`\nHam kelime listesi kaydedildi: src/data/vocabulary/raw_words_ders_1_2.json`);
