const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '../src/data/modules');
let updatedCount = 0;
let deletedCount = 0;

fs.readdirSync(dir).forEach(f => {
  if(!f.endsWith('.json')) return;
  const filePath = path.join(dir, f);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  let changed = false;

  data.questions.forEach(q => {
    if (q.sentence && q.sentence.includes('kilit ifadenin (Bulgarca) yazılışı?')) {
      // 1. Cümleyi çek
      const match = q.sentence.match(/Kelime testi: \"(.*)\" cümlesinde/);
      if (!match) return;
      const bgContext = match[1];

      // 2. Explanation'dan Türkçe anlamı çek
      let trMeaning = '';
      if (q.explanation) {
        const expMatch = q.explanation.match(/«.*»\s*\((.*?)\)/);
        if (expMatch) {
          trMeaning = expMatch[1];
        }
      }

      if (trMeaning) {
        // Kelimenin anlamı varsa, soruyu çok net bir şekilde güncelliyoruz.
        q.sentence = `Kelime Çevirisi: "${trMeaning}"\n(Cümle Bağlamı: ${bgContext})`;
        changed = true;
        updatedCount++;
      } else {
        // Çevirisi (Explanation'ı) yoksa, öğrenci için imkansız sorudur. Siliyoruz.
        q.toBeDeleted = true;
      }
    }
  });

  if (changed || data.questions.some(q => q.toBeDeleted)) {
    const originalLength = data.questions.length;
    data.questions = data.questions.filter(q => !q.toBeDeleted);
    deletedCount += (originalLength - data.questions.length);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`${f} güncellendi.`);
  }
});

console.log('--- İŞLEM TAMAM ---');
console.log('Toplam düzeltilen Kelime Çevirisi sorusu (Açık ve Net Hale Getirilen):', updatedCount);
console.log('Anlamı olmadığı için silinen imkansız sorular:', deletedCount);
