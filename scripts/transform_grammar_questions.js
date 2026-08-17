const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const args = process.argv.slice(2);
const aiKeyArg = args.find(a => a.startsWith('--ai-key='));
if (!aiKeyArg) {
  console.error('Hata: --ai-key=... parametresi zorunludur.');
  process.exit(1);
}
const aiKey = aiKeyArg.split('=')[1];
const genAI = new GoogleGenerativeAI(aiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

const MODULES_DIR = path.join(__dirname, '../src/data/modules');

async function run() {
  console.log('🔍 Gramer Analiz Soruları Aranıyor...');
  
  const files = fs.readdirSync(MODULES_DIR).filter(f => f.endsWith('.json'));
  let targetQuestions = [];
  
  files.forEach(file => {
    const filePath = path.join(MODULES_DIR, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    data.questions.forEach(q => {
      if (q.sentence && (q.sentence.includes('gramer yapısını analiz') || q.sentence.includes('gramer kuralını veya kelime bilgisini') || q.sentence.includes('bağlama göre anlamı nedir'))) {
        // Asıl cümleyi çek. Örn: "'Отсреща има голям гардероб...' cümlesinin gramer yapısını..."
        const match = q.sentence.match(/'(.*?)'/);
        if (match) {
          targetQuestions.push({
            file,
            id: q.id,
            bgSentence: match[1],
            oldSentence: q.sentence,
            oldAnswer: q.answer
          });
        } else {
            // Eğer tırnak içinde cümle yoksa (bazıları saf metin olabilir), soruyu tamamen silebiliriz ama şimdilik bırakalım.
        }
      }
    });
  });

  console.log(`⚠️ ${targetQuestions.length} adet teorik soru bulundu.`);
  if (targetQuestions.length === 0) return;

  console.log('🤖 AI\'dan çeviriler isteniyor (Tek parça halinde)...');
  
  const bgSentences = targetQuestions.map(t => t.bgSentence);
  const prompt = `Aşağıdaki Bulgarca cümlelerin her birinin MÜMKÜN OLDUĞUNCA DOĞAL VE GÜNLÜK TÜRKÇE çevirilerini oluştur.
SADECE JSON dizisi dön. Örnek: ["Karşıda gardırop var.", "Dün okula gittim."]

CÜMLELER:
${JSON.stringify(bgSentences, null, 2)}`;

  let translations = [];
  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    let jsonStr = text;
    const match = text.match(/```json\n([\s\S]*?)\n```/);
    if (match) jsonStr = match[1];
    translations = JSON.parse(jsonStr);
  } catch (e) {
    console.error('API Hatası:', e.message);
    process.exit(1);
  }

  if (translations.length !== targetQuestions.length) {
    console.error(`Hata: AI eksik veya fazla çeviri döndü! Beklenen: ${targetQuestions.length}, Gelen: ${translations.length}`);
    process.exit(1);
  }

  console.log('✅ Çeviriler alındı. Dosyalar güncelleniyor...');

  const filesToSave = new Set();
  const fileDataCache = {};

  targetQuestions.forEach((t, index) => {
    const filePath = path.join(MODULES_DIR, t.file);
    if (!fileDataCache[t.file]) {
       fileDataCache[t.file] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
    const data = fileDataCache[t.file];
    
    const qIndex = data.questions.findIndex(q => q.id === t.id);
    if (qIndex > -1) {
       // Yeni formatı uygula
       data.questions[qIndex].sentence = `Çeviriniz (Türkçesi: ${translations[index]})`;
       data.questions[qIndex].explanation = t.oldAnswer; // Eski analiz kuralı artık açıklama oldu!
       data.questions[qIndex].answer = t.bgSentence; // Beklenen cevap Bulgarcası oldu
       filesToSave.add(t.file);
    }
  });

  filesToSave.forEach(file => {
    const filePath = path.join(MODULES_DIR, file);
    fs.writeFileSync(filePath, JSON.stringify(fileDataCache[file], null, 2));
    console.log(`💾 ${file} başarıyla kaydedildi.`);
  });

  console.log('🎉 Tüm sıkıcı teorik sorular şahane çeviri pratiklerine dönüştürüldü!');
}

run();
