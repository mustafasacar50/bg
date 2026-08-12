const fs = require('fs');

const vocabFile = 'src/data/vocabulary/vocab_ders_3.json';
const vocab = JSON.parse(fs.readFileSync(vocabFile, 'utf8'));

// First, collect all inflected forms from all rich words
const allInflectedForms = new Map(); // form -> baseBg

vocab.words.forEach(w => {
  const base = w.bg.toLowerCase();
  
  const addForm = (form) => {
    if (!form) return;
    const clean = form.toLowerCase().trim();
    if (clean !== base) { // Only if it's different from the base
      allInflectedForms.set(clean, base);
    }
  };

  if (w.forms) Object.values(w.forms).forEach(addForm);
  if (w.nounForms) Object.values(w.nounForms).forEach(addForm);
  if (w.pronounForms) Object.values(w.pronounForms).forEach(addForm);
  
  if (w.conjugation) {
      Object.values(w.conjugation).forEach(tense => {
          Object.values(tense).forEach(addForm);
      });
  }
});

console.log(`Found ${allInflectedForms.size} inflected forms mapped to base words.`);

// Now, filter out any word whose base `bg` is inside the `allInflectedForms` map!
const originalLength = vocab.words.length;

vocab.words = vocab.words.filter(w => {
  const cleanBg = w.bg.toLowerCase().trim();
  if (allInflectedForms.has(cleanBg)) {
    console.log(`Removing redundant entry: '${cleanBg}' (covered by base '${allInflectedForms.get(cleanBg)}')`);
    return false;
  }
  return true;
});

console.log(`Removed ${originalLength - vocab.words.length} redundant entries.`);

fs.writeFileSync(vocabFile, JSON.stringify(vocab, null, 2), 'utf8');

const { execSync } = require('child_process');
execSync('node generate_index.js vocab_ders_3.json', { stdio: 'inherit' });
