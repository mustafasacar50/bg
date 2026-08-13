const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const modulePath = path.join(__dirname, 'src/data/modules/balgoc___Bulgarca_A1_Ders_5.json');
const tablesPath = path.join(__dirname, 'ders5_tables_full.json');

let mod = JSON.parse(fs.readFileSync(modulePath, 'utf8'));
const tables = JSON.parse(fs.readFileSync(tablesPath, 'utf8'));

// Generate a random ID
function generateId(prefix) {
  return `${prefix}_${crypto.randomBytes(4).toString('hex')}`;
}

const mevcutSorular = new Set();
mod.questions.forEach(q => {
  // Use sentence+answer as a better unique key for deduplication
  const key = (q.sentence || '') + '|' + (q.answer || '');
  mevcutSorular.add(key);
});

let addedCount = 0;

function addIfNew(soru) {
  const key = (soru.sentence || '') + '|' + (soru.answer || '');
  if (!mevcutSorular.has(key)) {
    mevcutSorular.add(key);
    mod.questions.push(soru);
    addedCount++;
    return true;
  }
  return false;
}

// 1. Kelime Tabloları (T0 ve T44)
[tables[0], tables[44]].forEach(table => {
  if (!table) return;
  // T0: Bulgarca / Kalıp | Türkçe | Açıklama
  // T44: Bulgarca | Türkçe
  const headers = table.rows[0];
  const isT0 = headers.length >= 3 && headers[2].includes('Açıklama');
  
  for (let i = 1; i < table.rows.length; i++) {
    const row = table.rows[i];
    const bg = row[0];
    const tr = row[1];
    if (!bg || !tr) continue;
    
    let explanation = '';
    if (isT0 && row.length > 2) {
      explanation = row[2];
    }
    
    // BG -> TR
    addIfNew({
      id: generateId('q_d5_vcb'),
      type: 'translation',
      sentence: bg,
      answer: tr,
      hint: 'Türkçe karşılığını yazınız',
      lesson: 'Ders 5',
      ...(explanation ? { explanation } : {})
    });
    
    // TR -> BG
    addIfNew({
      id: generateId('q_d5_vcb'),
      type: 'translation',
      sentence: tr,
      answer: bg,
      hint: 'Bulgarca karşılığını yazınız',
      lesson: 'Ders 5',
      ...(explanation ? { explanation } : {})
    });
  }
});

// 2. Gramer / Çoğul Tabloları (T1, T3)
// T1: Tekil | Normal çoğul | Sayıdan sonra adetli biçim | Türkçe
// T3: Tekil | Sayı ile | Türkçe
[tables[1], tables[3]].forEach(table => {
  if (!table) return;
  const isT1 = table.rows[0].length >= 4;
  for (let i = 1; i < table.rows.length; i++) {
    const row = table.rows[i];
    let tekil, cogul, sayiSonrasi, tr;
    if (isT1) {
      [tekil, cogul, sayiSonrasi, tr] = row;
    } else {
      tekil = row[0];
      sayiSonrasi = row[1];
      cogul = row[1]; // No normal plural provided in T3, they are often similar
      tr = row[2];
    }
    
    if (!tekil) continue;
    
    const explanation = `Tekil: ${tekil}\nNormal Çoğul: ${cogul || '-'}\nSayıdan Sonra (Adetli): ${sayiSonrasi}`;
    
    // Soru: Tekil -> Sayısal Çoğul
    if (sayiSonrasi) {
        addIfNew({
          id: generateId('q_d5_pl'),
          type: 'translation',
          sentence: `Sayıdan sonra kullanım (Örn: 2 adet) -> ${tekil} (${tr})`,
          answer: sayiSonrasi,
          hint: 'Bulgarca karşılığını yazınız',
          lesson: 'Ders 5',
          explanation
        });
    }
    
    // Soru: Tekil -> Normal Çoğul
    if (cogul && cogul !== sayiSonrasi && isT1) {
        addIfNew({
          id: generateId('q_d5_pl'),
          type: 'translation',
          sentence: `Çoğul hali -> ${tekil} (${tr})`,
          answer: cogul,
          hint: 'Bulgarca karşılığını yazınız',
          lesson: 'Ders 5',
          explanation
        });
    }
  }
});

// T43: Irregular plurals
// T43: Verilen | Çokluk / ara biçim | Sayı/kolko sonrası | Açıklama
if (tables[43]) {
  for (let i = 1; i < tables[43].rows.length; i++) {
    const [tekil, cogul, sayiSonrasi, aciklama] = tables[43].rows[i];
    if (!tekil) continue;
    const explanation = `Tekil: ${tekil}\nÇokluk: ${cogul}\nSayı sonrası: ${sayiSonrasi}\nNot: ${aciklama}`;
    addIfNew({
      id: generateId('q_d5_irr'),
      type: 'translation',
      sentence: `Çoğul (genel) -> ${tekil}`,
      answer: cogul,
      hint: 'Bulgarca karşılığını yazınız',
      lesson: 'Ders 5',
      explanation
    });
    addIfNew({
      id: generateId('q_d5_irr'),
      type: 'translation',
      sentence: `Sayıdan sonra -> ${tekil}`,
      answer: sayiSonrasi,
      hint: 'Bulgarca karşılığını yazınız',
      lesson: 'Ders 5',
      explanation
    });
  }
}

// 3. Doğru İfadeler Tablosu (T2)
// Doğru ifade | Türkçe | Neden?
if (tables[2]) {
  for (let i = 1; i < tables[2].rows.length; i++) {
    const [bg, tr, neden] = tables[2].rows[i];
    if (!bg) continue;
    
    addIfNew({
      id: generateId('q_d5_expr'),
      type: 'translation',
      sentence: bg,
      answer: tr,
      hint: 'Türkçe karşılığını yazınız',
      lesson: 'Ders 5',
      ...(neden ? { explanation: neden } : {})
    });
    
    addIfNew({
      id: generateId('q_d5_expr'),
      type: 'translation',
      sentence: tr,
      answer: bg,
      hint: 'Bulgarca karşılığını yazınız',
      lesson: 'Ders 5',
      ...(neden ? { explanation: neden } : {})
    });
  }
}

// 4. Test Soruları (T4 - T42)
// This applies to all test tables.
for (let i = 4; i <= 42; i++) {
  const table = tables[i];
  if (!table) continue;
  
  const headers = table.rows[0];
  const isType1 = headers.length >= 4 && headers[1] === 'Bulgarca' && headers[3] === 'Durum'; // T4-T23
  const isType2 = headers.length >= 3 && headers[1] === 'Anlam' && headers[2] === 'Durum'; // T24-T42
  
  let options = [];
  let answer = '';
  let explanationLines = [];
  
  for (let r = 1; r < table.rows.length; r++) {
    const row = table.rows[r];
    if (isType1) {
      const secenek = row[0]; // а, б, в
      const bg = row[1];
      const not = row[2];
      const durum = row[3];
      
      if (!bg) continue;
      options.push(bg);
      explanationLines.push(`${secenek}) ${bg} -> ${not} [${durum}]`);
      
      if (durum.toLowerCase().includes('doğru')) {
        answer = bg;
      }
    } else if (isType2) {
      const bgSecenek = row[0]; // e.g., "а) учим"
      // Clean option string
      const bg = bgSecenek.replace(/^[а-яa-z]\)\s*/i, '').trim();
      const anlam = row[1];
      const durum = row[2];
      
      if (!bg) continue;
      options.push(bg);
      explanationLines.push(`${bgSecenek} -> ${anlam} [${durum}]`);
      
      if (durum.toLowerCase().includes('doğru')) {
        answer = bg;
      }
    }
  }
  
  // Only add if we found a valid multiple choice set
  if (options.length > 1 && answer) {
    addIfNew({
      id: generateId('q_d5_mc'),
      type: 'multiple_choice',
      sentence: 'Aşağıdakilerden hangisi gramer olarak doğrudur?',
      options: options,
      answer: answer,
      hint: 'Bulgarca dilbilgisi kurallarına uygun olanı seçiniz.',
      explanation: explanationLines.join('\n'),
      lesson: 'Ders 5'
    });
    
    // Also add the correct sentence as a regular translation if Type1
    if (isType1) {
       // Find the TR translation from explanation
       const correctRow = table.rows.find(r => r[3] && r[3].toLowerCase().includes('doğru'));
       if (correctRow) {
         let trTrans = correctRow[2].split('(')[0].trim(); // "Siz kimsiniz? (kadın için...)" -> "Siz kimsiniz?"
         addIfNew({
           id: generateId('q_d5_mc_tr'),
           type: 'translation',
           sentence: trTrans,
           answer: answer,
           hint: 'Bulgarca karşılığını yazınız',
           lesson: 'Ders 5'
         });
       }
    }
  }
}

fs.writeFileSync(modulePath, JSON.stringify(mod, null, 2), 'utf8');

console.log(`✅ Eklenen yeni soru: ${addedCount}`);
console.log(`📊 Modül toplam soru sayısı: ${mod.questions.length}`);

// Calculate counts
const bgCount = mod.questions.filter(q => q.hint && q.hint.toLowerCase().includes('bulgarca')).length;
const trCount = mod.questions.filter(q => q.hint && q.hint.toLowerCase().includes('türkçe')).length;
const otherCount = mod.questions.length - bgCount - trCount;

console.log(`🔵 BG sorular (hint=Bulgarca): ${bgCount}`);
console.log(`🟢 TR sorular (hint=Türkçe): ${trCount}`);
console.log(`⚪ Filtre dışı (other): ${otherCount}`);
