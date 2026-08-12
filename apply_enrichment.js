const fs = require('fs');
const path = require('path');

const targetFile = process.argv[2];
const updatesFile = process.argv[3];

if (!targetFile || !updatesFile) {
  console.error("Usage: node apply_enrichment.js <target_json> <updates_json>");
  process.exit(1);
}

const vocab = JSON.parse(fs.readFileSync(targetFile, 'utf8'));
const updates = JSON.parse(fs.readFileSync(updatesFile, 'utf8'));

let updatedCount = 0;

updates.forEach(update => {
  const wordIndex = vocab.words.findIndex(w => w.bg === update.bg && w.type === update.type);
  if (wordIndex !== -1) {
    vocab.words[wordIndex] = { ...vocab.words[wordIndex], ...update };
    updatedCount++;
  } else {
    // If not found by type, try just by bg
    const bgIndex = vocab.words.findIndex(w => w.bg === update.bg);
    if(bgIndex !== -1) {
        vocab.words[bgIndex] = { ...vocab.words[bgIndex], ...update };
        updatedCount++;
    } else {
        // If still not found, add it
        update.id = `word_auto_${Date.now()}_${Math.floor(Math.random()*1000)}`;
        vocab.words.push(update);
        console.log(`Added missing word: ${update.bg}`);
    }
  }
});

fs.writeFileSync(targetFile, JSON.stringify(vocab, null, 2));
console.log(`Successfully updated ${updatedCount} words in ${targetFile}`);
