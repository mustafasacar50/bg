const fs = require('fs');

const examples = JSON.parse(fs.readFileSync('noun_examples_v2.json', 'utf8'));

function applyExamplesToFile(filename) {
  const vocab = JSON.parse(fs.readFileSync(filename, 'utf8'));
  let updatedCount = 0;
  
  vocab.words = vocab.words.map(w => {
    if (w.type === 'isim' && examples[w.bg.toLowerCase()]) {
      w.examples = examples[w.bg.toLowerCase()];
      updatedCount++;
    }
    return w;
  });
  
  if (updatedCount > 0) {
    fs.writeFileSync(filename, JSON.stringify(vocab, null, 2), 'utf8');
    console.log(`Applied examples to ${updatedCount} nouns in ${filename}`);
  }
}

applyExamplesToFile('src/data/vocabulary/vocab_ders_1_2.json');
applyExamplesToFile('src/data/vocabulary/vocab_ders_3.json');
