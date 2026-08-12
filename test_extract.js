const fs = require('fs');
const moduleData = JSON.parse(fs.readFileSync('src/data/modules/balgoc___Bulgarca_A1_Ders_3.json', 'utf8'));
const questions = moduleData.questions || [];
const punctuation = /[.,\/#!$%\^&\*;:{}=\-_`~()?!""''\[\]|0-9]/g;

let allWords = new Set();
questions.forEach(q => {
  let textToScan = '';
  if (q.type === 'translation') {
    textToScan += q.sentence + ' ';
  } else if (q.type === 'fitb') {
    textToScan += q.sentence + ' ';
    textToScan += (q.answer || '') + ' ';
  } else if (q.type === 'scramble') {
    textToScan += q.sentence + ' ';
    textToScan += (q.answer || '') + ' ';
    if (q.words) textToScan += q.words.join(' ') + ' ';
  } else if (q.type === 'mcq') {
    textToScan += q.sentence + ' ';
    if (q.options) {
      q.options.forEach(opt => { textToScan += opt + ' ' });
    }
  }
  
  const cleanText = textToScan.replace(punctuation, ' ').replace(/\s+/g, ' ').trim();
  cleanText.split(' ').forEach(w => {
    const word = w.toLowerCase().trim();
    if (word && isNaN(word) && !(word.length === 1 && !['в', 'и', 'с', 'я', 'е', 'а', 'о', 'у'].includes(word))) {
      // Cyrillic check
      if (/[\u0400-\u04FF]/.test(word)) {
         allWords.add(word);
      }
    }
  });
});

console.log('Total extracted Cyrillic words:', allWords.size);
const arr = Array.from(allWords);

const index = JSON.parse(fs.readFileSync('src/data/vocabulary/vocab_ders_3_index.json', 'utf8'));
const missing = arr.filter(w => !index[w]);
console.log('Missing count:', missing.length);

// Also save missing words to a file so we can view them easily
fs.writeFileSync('missing_words.txt', missing.join('\n'), 'utf8');
console.log('Missing words saved to missing_words.txt');
