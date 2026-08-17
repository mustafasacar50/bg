const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Parametre kontrolü
const args = process.argv.slice(2);
const aiKeyArg = args.find(a => a.startsWith('--ai-key='));
if (!aiKeyArg) {
  console.error('Hata: --ai-key=... parametresi zorunludur.');
  process.exit(1);
}
const aiKey = aiKeyArg.split('=')[1];

const MODULES_DIR = path.join(__dirname, '../src/data/modules');
const VOCAB_DIR = path.join(__dirname, '../src/data/vocabulary');
const EKSTRA_VOCAB_FILE = path.join(VOCAB_DIR, 'vocab_ders_ekstra.json');

// Yardımcı: Metinden Kiril kelimelerini temizle ve ayır
function extractWords(text) {
  if (!text) return [];
  return (text.match(/[а-яА-ЯёЁ]+/g) || []).map(w => w.toLowerCase());
}

async function run() {
  console.log('🔍 Kelimeler analiz ediliyor...');

  // 1. Mevcut Sözlüğü Yükle
  const dict = new Set();
  const vocabFiles = fs.readdirSync(VOCAB_DIR).filter(f => f.endsWith('.json') && f.startsWith('vocab_'));
  
  for (const file of vocabFiles) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(VOCAB_DIR, file), 'utf8'));
      let wordsArray = Array.isArray(data) ? data : (data.words || Object.values(data));
      
      wordsArray.forEach(entry => {
        if (!entry || typeof entry !== 'object') return;
        const mainWord = entry.word || entry.bg;
        if (mainWord) dict.add(mainWord.toLowerCase().trim());
        
        // Çekim ekleri vs
        if (entry.conjugation) {
          Object.values(entry.conjugation).forEach(tense => {
            if (typeof tense === 'object') {
              Object.values(tense).forEach(form => {
                 form.split(' ').forEach(fw => dict.add(fw.toLowerCase()));
              });
            }
          });
        }
        if (entry.nounForms) {
          Object.values(entry.nounForms).forEach(f => { if(f) dict.add(f.toLowerCase()); });
        }
        if (entry.forms) {
           Object.values(entry.forms).forEach(f => { 
             if(typeof f === 'string') dict.add(f.toLowerCase()); 
           });
        }
      });
    } catch(e) {
      console.warn(`Uyarı: ${file} okunamadı.`);
    }
  }

  // 2. Modüllerdeki (Sorulardaki) kelimeleri topla
  const missingFreq = {};
  const moduleFiles = fs.readdirSync(MODULES_DIR).filter(f => f.endsWith('.json'));
  
  for (const file of moduleFiles) {
    const content = JSON.parse(fs.readFileSync(path.join(MODULES_DIR, file), 'utf8'));
    if (!content.questions) continue;
    
    content.questions.forEach(q => {
      const textToAnalyze = (q.sentence || '') + ' ' + (q.answer || '');
      const words = extractWords(textToAnalyze);
      words.forEach(w => {
        if (w.length < 2) return; // 1 harflileri atla (edatlar vb genelde vardır)
        
        // Basit Suffix Toleransı (Eğer kökü sözlükte varsa sayma)
        let found = dict.has(w);
        if (!found) {
           if (w.endsWith('та') && dict.has(w.slice(0, -2))) found = true;
           if (w.endsWith('то') && dict.has(w.slice(0, -2))) found = true;
           if (w.endsWith('ът') && dict.has(w.slice(0, -2))) found = true;
           if (w.endsWith('те') && dict.has(w.slice(0, -2))) found = true;
           if (w.endsWith('я') && dict.has(w.slice(0, -1))) found = true;
           if (w.endsWith('ят') && dict.has(w.slice(0, -2))) found = true;
        }

        if (!found) {
          missingFreq[w] = (missingFreq[w] || 0) + 1;
        }
      });
    });
  }

  // En çok kullanılanları sırala
  const sortedMissing = Object.entries(missingFreq)
    .sort((a, b) => b[1] - a[1])
    .map(e => e[0])
    .filter(w => !['сте', 'сегашно', 'важни', 'номер', 'заповядайте', 'минало', 'свършено'].includes(w)); // Daha önce manuel eklediklerimiz

  console.log(`✅ Sözlükte olan kelime/form sayısı: ${dict.size}`);
  console.log(`⚠️ Tespit edilen eksik eşsiz kelime sayısı: ${sortedMissing.length}`);

  if (sortedMissing.length === 0) {
    console.log('🎉 Bütün kelimeler zaten sözlükte mevcut!');
    return;
  }

  console.log('🤖 Gemini API ile sözlük verileri üretiliyor...\n');

  const genAI = new GoogleGenerativeAI(aiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

  // Mevcut ekstra sözlüğü oku
  let ekstraVocab = [];
  if (fs.existsSync(EKSTRA_VOCAB_FILE)) {
    try { ekstraVocab = JSON.parse(fs.readFileSync(EKSTRA_VOCAB_FILE, 'utf8')); } 
    catch(e) {}
  }

  // 50'şerli batchler
  const BATCH_SIZE = 50;
  for (let i = 0; i < sortedMissing.length; i += BATCH_SIZE) {
    const batch = sortedMissing.slice(i, i + BATCH_SIZE);
    console.log(`Paket işleniyor: ${i + 1} - ${Math.min(i + BATCH_SIZE, sortedMissing.length)} / ${sortedMissing.length}`);

    const prompt = `
Aşağıda Bulgarca kelimelerin bir listesini veriyorum. Bu kelimeler A1 seviyesi bir eğitim uygulamasında geçiyor.
Görevin, bu kelimelerin her biri için detaylı sözlük (vocabulary) JSON formatını oluşturmaktır.

LİSTE:
${batch.join(', ')}

ÖNEMLİ KURALLAR:
1. SADECE JSON dizisi (array) döndür. Başka hiçbir açıklama yazma.
2. Eğer listedeki kelime BİR ÖZEL İSİMSE (insan ismi, Mitko, Kosta vb. veya şehir ismi) bu kelimeyi SONUCA EKLEME. (Diziden at).
3. Eğer kelime fiil çekiminden oluşuyorsa (örneğin 'купят' -> satın almak, 3. çoğul), JSON nesnesi "bg" ve "word" alanlarında kelimenin VERİLEN FORMUNU tutsun ancak translation kısmına anlamını yaz. Mümkünse conjugation objesini ekle.
4. JSON Formatı Örneği:
[
  {
    "word": "вкъщи",
    "bg": "вкъщи",
    "tr": "evde",
    "translation": "evde",
    "type": "zarf"
  },
  {
    "word": "палачинка",
    "bg": "палачинка",
    "tr": "krep",
    "translation": "krep",
    "type": "isim",
    "gender": "dişil",
    "nounForms": { "tekil": "палачинка", "çoğul": "палачинки" }
  },
  {
    "word": "има",
    "bg": "има",
    "tr": "var",
    "translation": "var / sahip",
    "type": "fiil",
    "conjugation": {
       "present": { "аз": "имам", "ти": "имаш", "той/тя/то": "има", "ние": "имаме", "вие": "имате", "те": "имат" }
    }
  }
]

Geçerli typelar: 'fiil', 'isim', 'sıfat', 'zamir', 'zarf', 'edat', 'bağlaç', 'ünlem', 'parçacık'.
Şimdi bana sadece yukarıdaki kelime listesinin JSON sözlüğünü dön:`;

    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      
      // Extract JSON from markdown if exists
      let jsonStr = text;
      const match = text.match(/```json\n([\s\S]*?)\n```/);
      if (match) jsonStr = match[1];

      const jsonArr = JSON.parse(jsonStr);
      
      if (Array.isArray(jsonArr) && jsonArr.length > 0) {
        ekstraVocab = [...ekstraVocab, ...jsonArr];
        
        // Her batch sonrası kaydet
        fs.writeFileSync(EKSTRA_VOCAB_FILE, JSON.stringify(ekstraVocab, null, 2));
        console.log(`✅ ${jsonArr.length} kelime başarıyla sözlüğe eklendi ve kaydedildi.`);
      }

      // API limitlerine takılmamak için 2 saniye bekle
      await new Promise(r => setTimeout(r, 2000));

    } catch (err) {
      console.error(`❌ Batch işlenirken hata oluştu: ${err.message}`);
      console.log('10 saniye bekleniyor...');
      await new Promise(r => setTimeout(r, 10000));
    }
  }

  console.log('\n🎉 TÜM İŞLEM TAMAMLANDI! Bütün kelimeler vocab_ders_ekstra.json dosyasına kaydedildi.');
}

run();
