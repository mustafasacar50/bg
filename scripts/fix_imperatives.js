const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '../src/data/modules');

let totalDeleted = 0;
let totalSplit = 0;

fs.readdirSync(dir).forEach(f => {
  if (!f.endsWith('.json')) return;
  const filePath = path.join(dir, f);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  let changed = false;
  let newQuestions = [];

  data.questions.forEach(q => {
    if (!q.sentence) {
      newQuestions.push(q);
      return;
    }
    
    // 1. "cümlesinin anlamı nedir?" sorularını tamamen sil (Teorik ve sıkıcı tekrarlar)
    if (q.sentence.includes('anlamı nedir') || q.sentence.includes('cümlesinin anlamı')) {
      totalDeleted++;
      changed = true;
      return; // Atla
    }

    // 2. Parantezi kapanmayan veya " - " ile birleşik (Örn: играй - играйте) soruları ayır
    // Örnek q.sentence: "_____ – чете́те (Anlamı: oku - okuyun/okuyunuz" veya "чети́ – _____ (Anlamı: oku - okuyun/okuyunuz"
    // Veya "игра́й – игра́йте (Anlamı: oyna - oynayın/oynayınız)"
    
    // Anlamı: ... formatını yakalayalım
    const meaningMatch = q.sentence.match(/\(?Anlamı:\s*([^-]+)\s*-\s*([^)]+)\)?/i);
    // Fiil çiftini (bg) yakalayalım
    let bgWords = [];
    if (q.type === 'fill_in_the_blank_2' || q.sentence.includes('_____')) {
       // Answer'ı ve cümleyi birleştirip asıl iki kelimeyi bulalım
       let fullSentence = q.sentence.replace('_____', q.answer).split(/\(Anlamı/i)[0].trim();
       bgWords = fullSentence.split(/\s*[-–—]\s*/);
    } else {
       let fullSentence = q.sentence.split(/\(Anlamı/i)[0].trim();
       bgWords = fullSentence.split(/\s*[-–—]\s*/);
    }

    if (meaningMatch && bgWords.length === 2 && bgWords[0] && bgWords[1]) {
       // bgWords[0] -> Sen formu, bgWords[1] -> Siz formu
       // meaningMatch[1] -> Sen anlamı, meaningMatch[2] -> Siz anlamı
       const senBg = bgWords[0].trim();
       const sizBg = bgWords[1].trim();
       const senTr = meaningMatch[1].trim();
       const sizTr = meaningMatch[2].replace(')', '').trim(); // Eğer parantez kapanmamışsa bile temizler

       // İki yeni çeviri sorusu oluştur
       newQuestions.push({
         ...q,
         id: q.id + '_sen',
         type: 'translation_bg_tr',
         sentence: senTr,
         answer: senBg,
         hint: 'Bulgarcaya çeviriniz',
         explanation: 'Sen (ти) formunda emir kipi.'
       });

       newQuestions.push({
         ...q,
         id: q.id + '_siz',
         type: 'translation_bg_tr',
         sentence: sizTr,
         answer: sizBg,
         hint: 'Bulgarcaya çeviriniz',
         explanation: 'Siz (вие) formunda veya kibar formda emir kipi.'
       });

       totalSplit++;
       changed = true;
       return; // Eski birleşik soruyu atla
    }

    // Hiçbir kurala uymuyorsa aynen ekle
    newQuestions.push(q);
  });

  if (changed) {
    data.questions = newQuestions;
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`${f} güncellendi. Silinen: ${totalDeleted}, Ayrıştırılan: ${totalSplit}`);
  }
});

console.log('--- İŞLEM TAMAM ---');
console.log('Toplam Silinen Saçma "Anlamı nedir?" Sorusu:', totalDeleted);
console.log('Toplam İkiye Bölünen Emir Kipi Sorusu:', totalSplit);
