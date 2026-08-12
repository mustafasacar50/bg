const fs = require('fs');
const path = require('path');

const vocabFile = 'src/data/vocabulary/vocab_ders_1_2.json';
const indexFile = 'src/data/vocabulary/vocab_ders_1_2_index.json';

const data = JSON.parse(fs.readFileSync(vocabFile, 'utf8'));
const index = {};

const addWord = (inflected, baseBg) => {
    if (!inflected) return;
    const clean = inflected.toLowerCase().trim();
    if (clean.includes('/')) {
        clean.split('/').forEach(part => addWord(part, baseBg));
        return;
    }
    // Only map single words or multi-words cleanly
    index[clean] = baseBg;
};

data.words.forEach(w => {
    const base = w.bg.toLowerCase();
    addWord(base, base);

    if (w.forms) Object.values(w.forms).forEach(f => addWord(f, base));
    if (w.nounForms) Object.values(w.nounForms).forEach(f => addWord(f, base));
    if (w.pronounForms) Object.values(w.pronounForms).forEach(f => addWord(f, base));
    
    if (w.conjugation) {
        Object.values(w.conjugation).forEach(tense => {
            Object.values(tense).forEach(form => addWord(form, base));
        });
    }
});

fs.writeFileSync(indexFile, JSON.stringify(index, null, 2), 'utf8');
console.log(`Index generated with ${Object.keys(index).length} unique inflected forms mapping to base words.`);
