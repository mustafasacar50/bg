const fs = require('fs');

const vocabFile = 'src/data/vocabulary/vocab_ders_3.json';
const batchFile = process.argv[2];

if (!batchFile) {
  console.error('Lütfen bir batch JSON dosyası verin.');
  process.exit(1);
}

const vocab = JSON.parse(fs.readFileSync(vocabFile, 'utf8'));
const batch = JSON.parse(fs.readFileSync(batchFile, 'utf8'));

let updated = 0;

Object.entries(batch).forEach(([bg, richData]) => {
  const wordIndex = vocab.words.findIndex(w => w.bg.toLowerCase() === bg.toLowerCase());
  
  if (wordIndex !== -1) {
    // Preserve ID, update everything else
    const id = vocab.words[wordIndex].id;
    vocab.words[wordIndex] = {
      ...vocab.words[wordIndex],
      ...richData,
      id
    };
    // Remove "otomatik" type if it's now properly defined
    if (richData.type) {
        vocab.words[wordIndex].type = richData.type;
    }
    updated++;
  } else {
    console.log(`Uyarı: '${bg}' kelimesi vocab_ders_3.json'da bulunamadı! Yeni kelime olarak ekleniyor.`);
    vocab.words.push({
        id: 'word_enriched_' + Date.now() + Math.random().toString().slice(2, 6),
        bg,
        ...richData
    });
    updated++;
  }
});

fs.writeFileSync(vocabFile, JSON.stringify(vocab, null, 2), 'utf8');
console.log(`${updated} kelime başarıyla zenginleştirildi!`);

const { execSync } = require('child_process');
execSync('node generate_index.js vocab_ders_3.json', { stdio: 'inherit' });
