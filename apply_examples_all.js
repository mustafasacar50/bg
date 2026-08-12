const fs = require('fs');

const pronounExamples = JSON.parse(fs.readFileSync('pronoun_examples.json', 'utf8'));
const verbExamples = JSON.parse(fs.readFileSync('verb_examples.json', 'utf8'));
const nounExamples = JSON.parse(fs.readFileSync('noun_examples_v2.json', 'utf8'));

const allExamples = { ...pronounExamples, ...verbExamples, ...nounExamples };

function applyExamplesToFile(filename) {
  const vocab = JSON.parse(fs.readFileSync(filename, 'utf8'));
  let updatedCount = 0;
  
  vocab.words = vocab.words.map(w => {
    const wordKey = w.bg.toLowerCase();
    if (allExamples[wordKey]) {
      w.examples = allExamples[wordKey];
      updatedCount++;
    }
    return w;
  });
  
  if (updatedCount > 0) {
    fs.writeFileSync(filename, JSON.stringify(vocab, null, 2), 'utf8');
    console.log(`Applied examples to ${updatedCount} words in ${filename}`);
  }
}

applyExamplesToFile('src/data/vocabulary/vocab_ders_1_2.json');
applyExamplesToFile('src/data/vocabulary/vocab_ders_3.json');
