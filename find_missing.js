const fs = require('fs');

const index = JSON.parse(fs.readFileSync('src/data/vocabulary/vocab_ders_1_2_index.json', 'utf8'));
const moduleData = JSON.parse(fs.readFileSync('src/data/modules/balgoc___Bulgarca_A1_Ders_1_2.json', 'utf8'));
const questions = moduleData.questions || [];

const missingWords = new Set();
const punctuation = /[.,\/#!$%\^&\*;:{}=\-_`~()?!""'']/g;

questions.forEach(q => {
  let textToScan = '';
  
  if (q.type === 'mcq' || q.type === 'translation') {
    if (q.lang === 'bg') textToScan += (q.question || q.text || '') + ' ';
    if (q.options) {
      q.options.forEach(opt => { 
        textToScan += (typeof opt === 'string' ? opt : (opt.text || '')) + ' ' 
      });
    }
    if (q.expected) textToScan += q.expected + ' ';
  } else if (q.type === 'fitb') {
    textToScan += (q.fitbTarget || q.expected || '') + ' ';
    textToScan += (q.text || q.question || '') + ' ';
  } else if (q.type === 'scramble') {
    if (q.words) textToScan += q.words.join(' ') + ' ';
    textToScan += (q.text || q.question || '') + ' ';
    if (q.expected) textToScan += q.expected + ' ';
  }
  
  const cleanText = textToScan.replace(punctuation, ' ').replace(/\s+/g, ' ').trim();
  const words = cleanText.split(' ');
  
  words.forEach(w => {
    const word = w.toLowerCase().trim();
    if (!word || !isNaN(word)) return;
    if (word.length === 1 && !['в', 'и', 'с', 'я', 'е', 'а', 'о', 'у'].includes(word)) return;
    
    // Check if word exists in index
    if (!index[word]) {
      missingWords.add(word);
    }
  });
});

console.log('Total questions scanned:', questions.length);
console.log('Missing words count:', missingWords.size);
console.log('Missing words:', Array.from(missingWords).sort().join(', '));
