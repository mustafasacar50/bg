const fs = require('fs');

async function translateWord(word) {
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=bg&tl=tr&dt=t&q=${encodeURIComponent(word)}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data && data[0] && data[0][0] && data[0][0][0]) {
      let translated = data[0][0][0].toLowerCase();
      return translated;
    }
  } catch (e) {
    console.error(`Error translating ${word}:`, e.message);
  }
  return 'Çeviri bekleniyor...';
}

async function main() {
  const missingWords = fs.readFileSync('missing_words.txt', 'utf8').split('\n').filter(Boolean);
  const vocabPath = 'src/data/vocabulary/vocab_ders_3.json';
  const vocab = JSON.parse(fs.readFileSync(vocabPath, 'utf8'));
  
  if (!vocab.words) vocab.words = [];
  
  console.log(`Starting translation for ${missingWords.length} words... This will take a moment.`);
  
  // To avoid hitting rate limits, process in small batches
  const batchSize = 10;
  for (let i = 0; i < missingWords.length; i += batchSize) {
    const batch = missingWords.slice(i, i + batchSize);
    console.log(`Processing batch ${i / batchSize + 1} of ${Math.ceil(missingWords.length / batchSize)}...`);
    
    await Promise.all(batch.map(async (word) => {
      // Basic heuristic: check if word already exists in vocab just in case
      const exists = vocab.words.some(w => w.bg.toLowerCase() === word.toLowerCase());
      if (!exists) {
        const translated = await translateWord(word);
        vocab.words.push({
          id: 'word_auto_d3_' + Date.now() + '_' + Math.floor(Math.random() * 10000),
          bg: word,
          tr: translated,
          type: 'otomatik',
          notes: '💡 Öğrenme İpucu: Bu kelimenin cümle içindeki kullanımına ve eklerine dikkat et. En iyi öğrenme yolu bu kelimeyi kendi kurduğun yeni bir cümlede kullanmaktır!',
          examples: []
        });
      }
    }));
    
    // Tiny delay between batches to respect rate limits
    await new Promise(r => setTimeout(r, 500));
  }
  
  fs.writeFileSync(vocabPath, JSON.stringify(vocab, null, 2), 'utf8');
  console.log('All missing words translated and added to vocab_ders_3.json!');
  
  // Re-generate index automatically
  console.log('Running index regeneration...');
  const { execSync } = require('child_process');
  execSync('node generate_index.js vocab_ders_3.json', { stdio: 'inherit' });
  console.log('Done!');
}

main();
