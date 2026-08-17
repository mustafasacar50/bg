const fs = require('fs');

const targetFile = 'D:/bulgarca_sınav_modulu/exam-app/src/data/vocabulary/vocab_ders_6.json';
const data = JSON.parse(fs.readFileSync(targetFile, 'utf8'));

const chunks = [];
for (let i = 1; i <= 5; i++) {
  try {
    const chunkPath = `D:/bulgarca_sınav_modulu/exam-app/src/data/vocabulary/chunk_${i}.json`;
    if (fs.existsSync(chunkPath)) {
      const chunkData = JSON.parse(fs.readFileSync(chunkPath, 'utf8'));
      chunks.push(...chunkData);
    }
  } catch (err) {}
}

let updatedCount = 0;

for (let i = 0; i < data.words.length; i++) {
  const word = data.words[i];
  if (word.type === 'fiil') {
    let updatedVerb = chunks.find(c => c.bg === word.bg);
    if (!updatedVerb) {
      // Fuzzy match by checking if word.bg appears anywhere in the conjugations
      updatedVerb = chunks.find(c => {
        if (!c.conjugation) return false;
        for (const tense of Object.values(c.conjugation)) {
          if (Object.values(tense).includes(word.bg)) return true;
        }
        return false;
      });
    }
    
    if (!updatedVerb) {
      // Try startsWith or simple fuzzy
      updatedVerb = chunks.find(c => c.bg.startsWith(word.bg.slice(0, 4)));
    }

    if (updatedVerb) {
      word.conjugation = updatedVerb.conjugation;
      word.examples = updatedVerb.examples;
      updatedCount++;
    } else {
      console.log('Still no match for:', word.bg);
    }
  }
}

console.log(`Updated ${updatedCount} verbs in the JSON structure.`);

fs.writeFileSync(targetFile, JSON.stringify(data, null, 2), 'utf8');
console.log('Successfully wrote back to vocab_ders_6.json');
