const fs = require('fs');
const path = require('path');

const argFile = process.argv[2] || 'vocab_ders_1_2.json';
const vocabFile = path.join('src/data/vocabulary', argFile);
const indexFile = path.join('src/data/vocabulary', argFile.replace('.json', '_index.json'));

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
    if(index[clean] && index[clean] !== baseBg) { if(Array.isArray(index[clean])) { if(!index[clean].includes(baseBg)) index[clean].push(baseBg); } else { index[clean] = [index[clean], baseBg]; } } else { index[clean] = baseBg; }
};

data.words.forEach(w => {
    const base = w.bg.toLowerCase();
    addWord(base, base);

    if (w.forms) Object.values(w.forms).forEach(f => {
        if (typeof f === 'string') addWord(f, base);
        else if (typeof f === 'object' && f !== null) Object.values(f).forEach(v => addWord(v, base));
    });
    if (w.nounForms) Object.values(w.nounForms).forEach(f => addWord(f, base));
    // We intentionally DO NOT index w.pronounForms. 
    // Short pronouns should only be matched if they appear directly, not reverse-matched from their roots.
    if (w.conjugation) {
        Object.values(w.conjugation).forEach(tense => {
            Object.values(tense).forEach(form => addWord(form, base));
        });
    }
});

fs.writeFileSync(indexFile, JSON.stringify(index, null, 2), 'utf8');
console.log(`Index generated with ${Object.keys(index).length} unique inflected forms mapping to base words.`);
