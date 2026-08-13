const fs = require('fs');

// =========================================================
// DERS 3 MODÜL DOSYASINA KAPSAMLI SORU EKLEME
// Kaynak: ders3_tables_full.json (docx tablolar)
// Hedef: src/data/modules/balgoc___Bulgarca_A1_Ders_3.json
// =========================================================

const tables = JSON.parse(fs.readFileSync('ders3_tables_full.json', 'utf8'));
const modPath = 'src/data/modules/balgoc___Bulgarca_A1_Ders_3.json';
const mod = JSON.parse(fs.readFileSync(modPath, 'utf8'));

let idCounter = Date.now();
function makeId() { return `q_d3_tbl_${(idCounter++).toString(36)}`; }

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Mevcut soruların soru metinlerini topla (tekrar önleme)
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

// =========================================================
// TABLO 2: Diyalog soruları (7 satır: Soru | BG cevap | TR)
// =========================================================
const t2 = tables.find(t => t.table_index === 2);
if (t2) {
  t2.rows.slice(1).forEach(row => {
    const [soru, bgCevap, trCevap] = row;
    if (!soru || !bgCevap) return;
    // BG → TR çeviri sorusu
    if (addIfNew({ id: makeId(), type: 'translation', sentence: bgCevap, answer: trCevap, hint: 'Türkçe karşılığını yazınız', lesson: 'Ders 3' })) eklenen++;
    // TR → BG çeviri sorusu
    if (addIfNew({ id: makeId(), type: 'translation', sentence: trCevap, answer: bgCevap, hint: 'Bulgarca karşılığını yazınız', lesson: 'Ders 3' })) eklenen++;
    // Soru-cevap (kısa cevap)
    if (addIfNew({ id: makeId(), type: 'translation', sentence: soru + ' (Bulgarca cevap verin)', answer: bgCevap, hint: 'Bulgarca karşılığını yazınız', lesson: 'Ders 3' })) eklenen++;
  });
}

// =========================================================
// TABLO 3: Diyalog kelimeleri (13 satır: BG | TR | Dilbilgisi | Örnek)
// =========================================================
const t3 = tables.find(t => t.table_index === 3);
if (t3) {
  t3.rows.slice(1).forEach(row => {
    const [bg, tr, dilbilgisi, ornek] = row;
    if (!bg || !tr) return;
    if (addIfNew({ id: makeId(), type: 'translation', sentence: bg, answer: tr, hint: 'Türkçe karşılığını yazınız', lesson: 'Ders 3' })) eklenen++;
    if (addIfNew({ id: makeId(), type: 'translation', sentence: tr, answer: bg, hint: 'Bulgarca karşılığını yazınız', lesson: 'Ders 3' })) eklenen++;
    if (ornek && addIfNew({ id: makeId(), type: 'translation', sentence: ornek, answer: tr.split('/')[0].trim(), hint: 'Türkçe karşılığını yazınız', lesson: 'Ders 3' })) eklenen++;
  });
}

// =========================================================
// TABLO 5: Ülke → Milliyet tablosu (41 satır: Ülke | TR | Erkek | Kadın | Çoğul)
// =========================================================
const t5 = tables.find(t => t.table_index === 5);
const milliyetBankasi = [];
if (t5) {
  t5.rows.slice(1).forEach(row => {
    const [ulke, trUlke, erkek, kadin, cogul] = row;
    if (!ulke || !erkek) return;
    milliyetBankasi.push({ ulke, trUlke, erkek, kadin, cogul });
  });

  milliyetBankasi.forEach(m => {
    const erkekDistractors = milliyetBankasi.filter(x => x.erkek !== m.erkek).slice(0, 5).map(x => x.erkek);
    const kadinDistractors = milliyetBankasi.filter(x => x.kadin !== m.kadin).slice(0, 5).map(x => x.kadin);
    const cogulDistractors = milliyetBankasi.filter(x => x.cogul !== m.cogul).slice(0, 5).map(x => x.cogul);
    const ulkeDistractors = milliyetBankasi.filter(x => x.ulke !== m.ulke).slice(0, 5).map(x => x.ulke);

    // Ülke → Erkek milliyet
    if (addIfNew({ id: makeId(), type: 'multiple_choice', sentence: `${m.ulke} (${m.trUlke})'dan gelen bir erkek için doğru milliyet sözcüğü?`, options: shuffle([m.erkek, ...erkekDistractors.slice(0,3)]), answer: m.erkek, hint: 'Bulgarca karşılığını yazınız', lesson: 'Ders 3' })) eklenen++;
    // Ülke → Kadın milliyet
    if (addIfNew({ id: makeId(), type: 'multiple_choice', sentence: `${m.ulke} (${m.trUlke})'dan gelen bir kadın için doğru milliyet sözcüğü?`, options: shuffle([m.kadin, ...kadinDistractors.slice(0,3)]), answer: m.kadin, hint: 'Bulgarca karşılığını yazınız', lesson: 'Ders 3' })) eklenen++;
    // Ülke → Çoğul milliyet
    if (addIfNew({ id: makeId(), type: 'multiple_choice', sentence: `${m.ulke} (${m.trUlke})'dan gelen birden fazla kişi için doğru milliyet sözcüğü?`, options: shuffle([m.cogul, ...cogulDistractors.slice(0,3)]), answer: m.cogul, hint: 'Bulgarca karşılığını yazınız', lesson: 'Ders 3' })) eklenen++;
    // Erkek → Ülke (ters soru)
    if (addIfNew({ id: makeId(), type: 'multiple_choice', sentence: `"${m.erkek}" hangi ülkeden gelen erkeği tanımlar?`, options: shuffle([m.ulke, ...ulkeDistractors.slice(0,3)]), answer: m.ulke, hint: 'Bulgarca karşılığını yazınız', lesson: 'Ders 3' })) eklenen++;
    // Cümle içi boşluk
    if (addIfNew({ id: makeId(), type: 'fitb', sentence: `Той е от ${m.ulke}. Той е ____.`, answer: m.erkek, hint: 'Bulgarca karşılığını yazınız', lesson: 'Ders 3' })) eklenen++;
    if (addIfNew({ id: makeId(), type: 'fitb', sentence: `Тя е от ${m.ulke}. Тя е ____.`, answer: m.kadin, hint: 'Bulgarca karşılığını yazınız', lesson: 'Ders 3' })) eklenen++;
    // TR → BG ülke çevirisi
    if (addIfNew({ id: makeId(), type: 'translation', sentence: m.trUlke + ' (ülke adı)', answer: m.ulke, hint: 'Bulgarca karşılığını yazınız', lesson: 'Ders 3' })) eklenen++;
    if (addIfNew({ id: makeId(), type: 'translation', sentence: m.ulke + ' (ülke adı)', answer: m.trUlke, hint: 'Türkçe karşılığını yazınız', lesson: 'Ders 3' })) eklenen++;
  });
}

// =========================================================
// TABLO 7: Meslek kalıpları (22 satır: BG kalıp | TR)
// =========================================================
const t7 = tables.find(t => t.table_index === 7);
if (t7) {
  t7.rows.slice(1).forEach(row => {
    const [bg, tr] = row;
    if (!bg || !tr) return;
    if (addIfNew({ id: makeId(), type: 'translation', sentence: bg, answer: tr, hint: 'Türkçe karşılığını yazınız', lesson: 'Ders 3' })) eklenen++;
    if (addIfNew({ id: makeId(), type: 'translation', sentence: tr, answer: bg, hint: 'Bulgarca karşılığını yazınız', lesson: 'Ders 3' })) eklenen++;
  });
}

// =========================================================
// TABLO 8: Meslek listesi (67 satır: BG meslek | TR)
// =========================================================
const t8 = tables.find(t => t.table_index === 8);
const meslekBankasi = [];
if (t8) {
  t8.rows.slice(1).forEach(row => {
    const [bg, tr] = row;
    if (!bg || !tr) return;
    meslekBankasi.push({ bg, tr });
  });

  meslekBankasi.forEach(m => {
    const trDist = meslekBankasi.filter(x => x.bg !== m.bg).sort(() => Math.random() - 0.5).slice(0, 3).map(x => x.tr);
    const bgDist = meslekBankasi.filter(x => x.bg !== m.bg).sort(() => Math.random() - 0.5).slice(0, 3).map(x => x.bg);
    // BG → TR
    if (addIfNew({ id: makeId(), type: 'translation', sentence: m.bg + ' (meslek)', answer: m.tr, hint: 'Türkçe karşılığını yazınız', lesson: 'Ders 3' })) eklenen++;
    // TR → BG
    if (addIfNew({ id: makeId(), type: 'translation', sentence: m.tr + ' (meslek)', answer: m.bg, hint: 'Bulgarca karşılığını yazınız', lesson: 'Ders 3' })) eklenen++;
    // Çoktan seçmeli BG → TR
    if (trDist.length >= 3 && addIfNew({ id: makeId(), type: 'multiple_choice', sentence: `"${m.bg}" mesleğinin Türkçesi nedir?`, options: shuffle([m.tr, ...trDist]), answer: m.tr, hint: 'Türkçe karşılığını yazınız', lesson: 'Ders 3' })) eklenen++;
    // Çoktan seçmeli TR → BG
    if (bgDist.length >= 3 && addIfNew({ id: makeId(), type: 'multiple_choice', sentence: `"${m.tr}" mesleğinin Bulgarcası nedir?`, options: shuffle([m.bg, ...bgDist]), answer: m.bg, hint: 'Bulgarca karşılığını yazınız', lesson: 'Ders 3' })) eklenen++;
    // Cümle içi (О е / Тя е)
    if (addIfNew({ id: makeId(), type: 'fitb', sentence: `Той работи като ____. (${m.tr})`, answer: m.bg, hint: 'Bulgarca karşılığını yazınız', lesson: 'Ders 3' })) eklenen++;
  });
}

// =========================================================
// TABLO 11: Erkek/Kadın biçimleri (26 satır)
// =========================================================
const t11 = tables.find(t => t.table_index === 11);
const meslekCiftleri = [];
if (t11) {
  t11.rows.slice(1).forEach(row => {
    const [erkek, kadin, tr] = row;
    if (!erkek || !kadin) return;
    meslekCiftleri.push({ erkek, kadin, tr });
  });

  meslekCiftleri.forEach(m => {
    const kadinDist = meslekCiftleri.filter(x => x.kadin !== m.kadin).slice(0, 3).map(x => x.kadin);
    const erkekDist = meslekCiftleri.filter(x => x.erkek !== m.erkek).slice(0, 3).map(x => x.erkek);

    // Erkek → Kadın dönüşüm
    if (addIfNew({ id: makeId(), type: 'multiple_choice', sentence: `"${m.erkek}" (${m.tr}) mesleğinin kadın biçimi nedir?`, options: shuffle([m.kadin, ...kadinDist]), answer: m.kadin, hint: 'Bulgarca karşılığını yazınız', lesson: 'Ders 3' })) eklenen++;
    // Kadın → Erkek dönüşüm
    if (addIfNew({ id: makeId(), type: 'multiple_choice', sentence: `"${m.kadin}" (${m.tr}) mesleğinin erkek biçimi nedir?`, options: shuffle([m.erkek, ...erkekDist]), answer: m.erkek, hint: 'Bulgarca karşılığını yazınız', lesson: 'Ders 3' })) eklenen++;
    // TR → erkek
    if (addIfNew({ id: makeId(), type: 'translation', sentence: m.tr + ' (erkek biçimi)', answer: m.erkek, hint: 'Bulgarca karşılığını yazınız', lesson: 'Ders 3' })) eklenen++;
    // TR → kadın
    if (addIfNew({ id: makeId(), type: 'translation', sentence: m.tr + ' (kadın biçimi)', answer: m.kadin, hint: 'Bulgarca karşılığını yazınız', lesson: 'Ders 3' })) eklenen++;
    // Cümle içi
    if (addIfNew({ id: makeId(), type: 'fitb', sentence: `Майка ми е ____. (${m.tr} - kadın)`, answer: m.kadin, hint: 'Bulgarca karşılığını yazınız', lesson: 'Ders 3' })) eklenen++;
    if (addIfNew({ id: makeId(), type: 'fitb', sentence: `Баща ми е ____. (${m.tr} - erkek)`, answer: m.erkek, hint: 'Bulgarca karşılığını yazınız', lesson: 'Ders 3' })) eklenen++;
  });
}

// =========================================================
// TABLO 13: Geniş Ülke → Milliyet tablosu (27 satır)
// =========================================================
const t13 = tables.find(t => t.table_index === 13);
if (t13) {
  const t13Data = [];
  t13.rows.slice(1).forEach(row => {
    const [ulke, erkek, kadin, cogul] = row;
    if (!ulke || !erkek) return;
    t13Data.push({ ulke, erkek, kadin, cogul });
  });

  t13Data.forEach(m => {
    const erkekDist = t13Data.filter(x => x.erkek !== m.erkek).slice(0, 3).map(x => x.erkek);
    const kadinDist = t13Data.filter(x => x.kadin !== m.kadin).slice(0, 3).map(x => x.kadin);

    if (addIfNew({ id: makeId(), type: 'multiple_choice', sentence: `${m.ulke}'dan gelen erkek için milliyet sözcüğü?`, options: shuffle([m.erkek, ...erkekDist]), answer: m.erkek, hint: 'Bulgarca karşılığını yazınız', lesson: 'Ders 3' })) eklenen++;
    if (addIfNew({ id: makeId(), type: 'multiple_choice', sentence: `${m.ulke}'dan gelen kadın için milliyet sözcüğü?`, options: shuffle([m.kadin, ...kadinDist]), answer: m.kadin, hint: 'Bulgarca karşılığını yazınız', lesson: 'Ders 3' })) eklenen++;
    if (addIfNew({ id: makeId(), type: 'fitb', sentence: `Той е от ${m.ulke}. Той е ____.`, answer: m.erkek, hint: 'Bulgarca karşılığını yazınız', lesson: 'Ders 3' })) eklenen++;
    if (addIfNew({ id: makeId(), type: 'fitb', sentence: `Тя е от ${m.ulke}. Тя е ____.`, answer: m.kadin, hint: 'Bulgarca karşılığını yazınız', lesson: 'Ders 3' })) eklenen++;
    if (addIfNew({ id: makeId(), type: 'translation', sentence: m.ulke + ' (ülke)', answer: m.erkek + ' / ' + m.kadin, hint: 'Türkçe karşılığını yazınız', lesson: 'Ders 3' })) eklenen++;
  });
}

// =========================================================
// TABLO 14: "Искам да стана" kalıpları (9 satır)
// =========================================================
const t14 = tables.find(t => t.table_index === 14);
if (t14) {
  t14.rows.slice(1).forEach(row => {
    const [bg, tr, dilbilgisi, ornek] = row;
    if (!bg || !tr) return;
    if (addIfNew({ id: makeId(), type: 'translation', sentence: bg, answer: tr, hint: 'Türkçe karşılığını yazınız', lesson: 'Ders 3' })) eklenen++;
    if (addIfNew({ id: makeId(), type: 'translation', sentence: tr, answer: bg, hint: 'Bulgarca karşılığını yazınız', lesson: 'Ders 3' })) eklenen++;
    if (ornek && addIfNew({ id: makeId(), type: 'translation', sentence: ornek, answer: tr.split('/')[0].trim(), hint: 'Türkçe karşılığını yazınız', lesson: 'Ders 3' })) eklenen++;
  });
}

// =========================================================
// TABLO 15: Yazım alıştırması - doğru biçimler (14 satır)
// =========================================================
const t15 = tables.find(t => t.table_index === 15);
if (t15) {
  t15.rows.slice(1).forEach(row => {
    const [dogruBG, tr] = row;
    if (!dogruBG || !tr) return;
    if (addIfNew({ id: makeId(), type: 'translation', sentence: dogruBG, answer: tr, hint: 'Türkçe karşılığını yazınız', lesson: 'Ders 3' })) eklenen++;
    if (addIfNew({ id: makeId(), type: 'translation', sentence: tr, answer: dogruBG, hint: 'Bulgarca karşılığını yazınız', lesson: 'Ders 3' })) eklenen++;
  });
}

// =========================================================
// TABLO 16: Coğrafya kalıpları (9 satır: BG | TR | Dilbilgisi | Örnek)
// =========================================================
const t16 = tables.find(t => t.table_index === 16);
if (t16) {
  t16.rows.slice(1).forEach(row => {
    const [bg, tr, dilbilgisi, ornek] = row;
    if (!bg || !tr) return;
    if (addIfNew({ id: makeId(), type: 'translation', sentence: bg, answer: tr, hint: 'Türkçe karşılığını yazınız', lesson: 'Ders 3' })) eklenen++;
    if (addIfNew({ id: makeId(), type: 'translation', sentence: tr, answer: bg, hint: 'Bulgarca karşılığını yazınız', lesson: 'Ders 3' })) eklenen++;
    if (ornek && addIfNew({ id: makeId(), type: 'translation', sentence: ornek, answer: tr, hint: 'Türkçe karşılığını yazınız', lesson: 'Ders 3' })) eklenen++;
  });
}

// =========================================================
// TABLO 18: TR → BG ters çeviri (8 satır)
// =========================================================
const t18 = tables.find(t => t.table_index === 18);
if (t18) {
  t18.rows.slice(1).forEach(row => {
    const [tr, bg] = row;
    if (!tr || !bg) return;
    if (addIfNew({ id: makeId(), type: 'translation', sentence: tr, answer: bg, hint: 'Bulgarca karşılığını yazınız', lesson: 'Ders 3' })) eklenen++;
    if (addIfNew({ id: makeId(), type: 'translation', sentence: bg, answer: tr, hint: 'Türkçe karşılığını yazınız', lesson: 'Ders 3' })) eklenen++;
  });
}

// Kaydet
fs.writeFileSync(modPath, JSON.stringify(mod, null, 2), 'utf8');

// hint'e göre son sayım
const bgCount = mod.questions.filter(q => (q.hint || '').toLowerCase().includes('bulgarca')).length;
const trCount = mod.questions.filter(q => (q.hint || '').toLowerCase().includes('türkçe')).length;

console.log(`\n✅ Eklenen yeni soru: ${eklenen}`);
console.log(`📊 Modül toplam soru sayısı: ${mod.questions.length}`);
console.log(`🔵 BG sorular (hint=Bulgarca): ${bgCount}`);
console.log(`🟢 TR sorular (hint=Türkçe): ${trCount}`);
console.log(`⚪ Filtre dışı (other): ${mod.questions.length - bgCount - trCount}`);

