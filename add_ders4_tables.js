const fs = require('fs');

// =========================================================
// DERS 4 MODÜL DOSYASINA KAPSAMLI SORU EKLEME
// Kaynak: ders4_tables_full.json
// Hedef: src/data/modules/balgoc___Bulgarca_A1_Ders_4.json
// =========================================================

const tables = JSON.parse(fs.readFileSync('ders4_tables_full.json', 'utf8'));
const modPath = 'src/data/modules/balgoc___Bulgarca_A1_Ders_4.json';
let mod = { id: "balgoc___Bulgarca_A1_Ders_4", title: "Ders 4 (Kapsamlı)", description: "Ders 4", questions: [] };
try {
  mod = JSON.parse(fs.readFileSync(modPath, 'utf8'));
} catch (e) {
  console.log("Mevcut modül okunamadı, yeni oluşturulacak.");
}

if (!mod.questions) mod.questions = [];

let idCounter = Date.now();
function makeId() { return `q_d4_tbl_${(idCounter++).toString(36)}`; }

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const mevcutSorular = new Set(mod.questions.map(q => q.sentence || q.question || ''));

function addIfNew(soru) {
  const key = soru.sentence || soru.question || '';
  if (!mevcutSorular.has(key)) {
    mevcutSorular.add(key);
    mod.questions.push(soru);
    return true;
  }
  return false;
}

let eklenen = 0;
const lessonStr = 'Ders 4';

// Helper for vocabulary tables (BG | TR)
function processVocabTable(tIndex, bgCol=0, trCol=1, hasHeader=true) {
  const t = tables.find(x => x.table_index === tIndex);
  if (!t) return;
  const rows = hasHeader ? t.rows.slice(1) : t.rows;
  
  const bank = [];
  rows.forEach(row => {
    const bg = row[bgCol];
    const tr = row[trCol];
    if (bg && tr && bg.toLowerCase() !== 'bulgarca' && tr.toLowerCase() !== 'türkçe') {
      bank.push({bg, tr});
    }
  });

  bank.forEach(m => {
    const trDist = bank.filter(x => x.bg !== m.bg).sort(() => Math.random() - 0.5).slice(0, 3).map(x => x.tr);
    const bgDist = bank.filter(x => x.bg !== m.bg).sort(() => Math.random() - 0.5).slice(0, 3).map(x => x.bg);

    if (addIfNew({ id: makeId(), type: 'translation', sentence: m.bg, answer: m.tr, hint: 'Türkçe karşılığını yazınız', lesson: lessonStr })) eklenen++;
    if (addIfNew({ id: makeId(), type: 'translation', sentence: m.tr, answer: m.bg, hint: 'Bulgarca karşılığını yazınız', lesson: lessonStr })) eklenen++;
    
    if (trDist.length >= 3 && addIfNew({ id: makeId(), type: 'multiple_choice', sentence: `"${m.bg}" kelimesinin Türkçesi nedir?`, options: shuffle([m.tr, ...trDist]), answer: m.tr, hint: 'Türkçe karşılığını yazınız', lesson: lessonStr })) eklenen++;
    if (bgDist.length >= 3 && addIfNew({ id: makeId(), type: 'multiple_choice', sentence: `"${m.tr}" kelimesinin Bulgarcası nedir?`, options: shuffle([m.bg, ...bgDist]), answer: m.bg, hint: 'Bulgarca karşılığını yazınız', lesson: lessonStr })) eklenen++;
  });
}

// 1. KELİME TABLOLARI (T0, T7, T8, T19, T20, T21, T22)
processVocabTable(0, 0, 1);
processVocabTable(7, 0, 1);
processVocabTable(8, 0, 1);
processVocabTable(19, 0, 1);
processVocabTable(20, 0, 1);
processVocabTable(21, 0, 1);
processVocabTable(22, 0, 1);

// 2. İSİM ÇOĞULLARI VE CİNSİYET (T3, T12, T13, T15)
// T3: Tekil | Çoğul | Türkçe | Cinsiyet
const t3 = tables.find(t => t.table_index === 3);
if (t3) {
  t3.rows.slice(1).forEach(row => {
    const [tekil, cogul, tr] = row;
    if (tekil && cogul) {
      if (addIfNew({ id: makeId(), type: 'translation', sentence: tekil + ' (tekil)', answer: cogul, hint: 'Bulgarca çoğul halini yazınız', lesson: lessonStr })) eklenen++;
      if (addIfNew({ id: makeId(), type: 'translation', sentence: cogul + ' (çoğul)', answer: tekil, hint: 'Bulgarca tekil halini yazınız', lesson: lessonStr })) eklenen++;
      if (addIfNew({ id: makeId(), type: 'translation', sentence: tr, answer: tekil, hint: 'Bulgarca karşılığını yazınız (tekil)', lesson: lessonStr })) eklenen++;
    }
  });
}

function processPluralTable(tIndex, tekilCol, cogulCol, trCol) {
  const t = tables.find(x => x.table_index === tIndex);
  if (!t) return;
  t.rows.slice(1).forEach(row => {
    const tekil = row[tekilCol];
    const cogul = row[cogulCol];
    const tr = row[trCol];
    if (tekil && cogul) {
      if (addIfNew({ id: makeId(), type: 'translation', sentence: tekil + ' (tekil)', answer: cogul, hint: 'Bulgarca çoğul halini yazınız', lesson: lessonStr })) eklenen++;
      if (addIfNew({ id: makeId(), type: 'translation', sentence: cogul + ' (çoğul)', answer: tekil, hint: 'Bulgarca tekil halini yazınız', lesson: lessonStr })) eklenen++;
      if (tr && addIfNew({ id: makeId(), type: 'translation', sentence: tr, answer: tekil, hint: 'Bulgarca karşılığını yazınız', lesson: lessonStr })) eklenen++;
    }
  });
}
processPluralTable(12, 0, 1, 2); // T12: Tekil | Çoğul | Türkçe
processPluralTable(13, 1, 0, 2); // T13: Çoğul | Tekil | Türkçe
processPluralTable(15, 1, 0, 2); // T15: Çoğul | Tekil | Türkçe

// T9, T10, T11: İsim Havuzları (Kelime | Çoğul | Cinsiyet)
// In DOCX some rows are [TR - BG, Çoğul, Cinsiyet]. Need to split if possible.
[9, 10, 11].forEach(tIndex => {
  const t = tables.find(x => x.table_index === tIndex);
  if (t) {
    t.rows.slice(1).forEach(row => {
      let [kelimeTrBg, cogul, cinsiyet] = row;
      if (!kelimeTrBg || !cogul) return;
      // kelimeTrBg is often like "Akşam - Вечер"
      let bg = kelimeTrBg;
      let tr = "";
      if (kelimeTrBg.includes('-')) {
        const parts = kelimeTrBg.split('-');
        tr = parts[0].trim();
        bg = parts[1].trim();
      }
      
      if (addIfNew({ id: makeId(), type: 'translation', sentence: bg + ' (tekil)', answer: cogul, hint: 'Bulgarca çoğul halini yazınız', lesson: lessonStr })) eklenen++;
      if (tr && addIfNew({ id: makeId(), type: 'translation', sentence: tr, answer: bg, hint: 'Bulgarca karşılığını yazınız (tekil)', lesson: lessonStr })) eklenen++;
      if (cinsiyet) {
         let trCins = cinsiyet.includes('ж.р') ? 'dişil' : cinsiyet.includes('м.р') ? 'eril' : cinsiyet.includes('ср.р') ? 'nötr' : '';
         if (trCins) {
           if (addIfNew({ id: makeId(), type: 'multiple_choice', sentence: `"${bg}" kelimesinin cinsiyeti nedir?`, options: shuffle(['eril', 'dişil', 'nötr']), answer: trCins, hint: 'Türkçe karşılığını yazınız', lesson: lessonStr })) eklenen++;
         }
      }
    });
  }
});

// 3. FİİLLER: T4 (имам/нямам) ve T5 (6 fiil)
const t4 = tables.find(t => t.table_index === 4);
if (t4) {
  t4.rows.slice(1).forEach(row => {
    const [kisi, imam, trImam, nyamam, trNyamam] = row;
    if (kisi && imam) {
      if (addIfNew({ id: makeId(), type: 'fitb', sentence: `${kisi} ____. (sahibim/var)`, answer: imam, hint: 'Bulgarca karşılığını yazınız', lesson: lessonStr })) eklenen++;
      if (nyamam && addIfNew({ id: makeId(), type: 'fitb', sentence: `${kisi} ____. (sahip değilim/yok)`, answer: nyamam, hint: 'Bulgarca karşılığını yazınız', lesson: lessonStr })) eklenen++;
      if (trImam && addIfNew({ id: makeId(), type: 'translation', sentence: `${kisi} ${imam}`, answer: trImam, hint: 'Türkçe karşılığını yazınız', lesson: lessonStr })) eklenen++;
    }
  });
}

const t5 = tables.find(t => t.table_index === 5);
if (t5) {
  const headers = t5.rows[0];
  t5.rows.slice(1).forEach(row => {
    const kisi = row[0];
    if (!kisi) return;
    for(let i=1; i<row.length; i++) {
       const fiil = row[i];
       const fiilAnlam = headers[i]; // e.g. "уча (öğrenmek/okumak)"
       if (fiil && fiilAnlam) {
         if (addIfNew({ id: makeId(), type: 'fitb', sentence: `${kisi} ____. (${fiilAnlam.split('(')[0].trim()})`, answer: fiil.split('(')[0].trim(), hint: 'Bulgarca karşılığını yazınız', lesson: lessonStr })) eklenen++;
       }
    }
  });
}

// 4. SAYILAR: T6 (Rakam | Asıl BG | Sıra BG | Asıl TR | Sıra TR)
const t6 = tables.find(t => t.table_index === 6);
if (t6) {
  t6.rows.slice(1).forEach(row => {
    const [rakam, asilBg, siraBg, asilTr, siraTr] = row;
    if (rakam && asilBg) {
      if (addIfNew({ id: makeId(), type: 'translation', sentence: rakam + ' (sayı)', answer: asilBg, hint: 'Bulgarca karşılığını yazınız', lesson: lessonStr })) eklenen++;
      if (addIfNew({ id: makeId(), type: 'translation', sentence: asilBg, answer: rakam, hint: 'Türkçe karşılığını yazınız', lesson: lessonStr })) eklenen++;
      if (siraBg && addIfNew({ id: makeId(), type: 'translation', sentence: rakam + '. (sıra sayısı)', answer: siraBg, hint: 'Bulgarca karşılığını yazınız', lesson: lessonStr })) eklenen++;
      if (siraBg && addIfNew({ id: makeId(), type: 'translation', sentence: siraBg, answer: rakam + '.', hint: 'Türkçe karşılığını yazınız', lesson: lessonStr })) eklenen++;
    }
  });
}

// 5. DİYALOG VE BOŞLUK DOLDURMA (T1, T18)
const t1 = tables.find(t => t.table_index === 1);
if (t1) {
  t1.rows.slice(1).forEach(row => {
    const [soruBg, soruTr, cevapBg, cevapTr] = row;
    if (soruBg && soruTr) {
      if (addIfNew({ id: makeId(), type: 'translation', sentence: soruBg, answer: soruTr, hint: 'Türkçe karşılığını yazınız', lesson: lessonStr })) eklenen++;
      if (addIfNew({ id: makeId(), type: 'translation', sentence: soruTr, answer: soruBg, hint: 'Bulgarca karşılığını yazınız', lesson: lessonStr })) eklenen++;
    }
    if (cevapBg && cevapTr) {
      if (addIfNew({ id: makeId(), type: 'translation', sentence: cevapBg, answer: cevapTr, hint: 'Türkçe karşılığını yazınız', lesson: lessonStr })) eklenen++;
      if (addIfNew({ id: makeId(), type: 'translation', sentence: cevapTr, answer: cevapBg, hint: 'Bulgarca karşılığını yazınız', lesson: lessonStr })) eklenen++;
    }
  });
}

const t18 = tables.find(t => t.table_index === 18);
if (t18) {
  t18.rows.slice(1).forEach(row => {
    const [cümleBosluk, dogru, tr] = row;
    if (dogru && tr) {
      if (addIfNew({ id: makeId(), type: 'translation', sentence: dogru, answer: tr, hint: 'Türkçe karşılığını yazınız', lesson: lessonStr })) eklenen++;
    }
  });
}


// Kaydet
fs.writeFileSync(modPath, JSON.stringify(mod, null, 2), 'utf8');

const bgCount = mod.questions.filter(q => (q.hint || '').toLowerCase().includes('bulgarca')).length;
const trCount = mod.questions.filter(q => (q.hint || '').toLowerCase().includes('türkçe')).length;

console.log(`\n✅ Eklenen yeni soru: ${eklenen}`);
console.log(`📊 Modül toplam soru sayısı: ${mod.questions.length}`);
console.log(`🔵 BG sorular (hint=Bulgarca): ${bgCount}`);
console.log(`🟢 TR sorular (hint=Türkçe): ${trCount}`);
console.log(`⚪ Filtre dışı (other): ${mod.questions.length - bgCount - trCount}`);
