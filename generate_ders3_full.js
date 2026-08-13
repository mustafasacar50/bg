const fs = require('fs');

// =========================================================
// DERS 3 - KAPSAMLI OTOMATİK SORU ÜRETİCİ
// Hedef: vocab_ders_3.json içindeki HER kelimeden ve
// temp_doc.txt içindeki HER diyalog cümlesinden soru üret
// =========================================================

function makeId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

// Şıkları karıştır
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// HTML mark taglarını temizle
function clean(str) {
  return (str || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

// Kelimeden anlamlı şık üret: aynı kategoriden ya da genel havuzdan
function getDistractors(word, allWords, count) {
  const sameCat = allWords.filter(w =>
    w.bg !== word.bg && w.category === word.category
  );
  const other = allWords.filter(w =>
    w.bg !== word.bg && w.category !== word.category
  );
  const pool = [...sameCat, ...other];
  // Shuffle ve al
  const shuffled = pool.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// =========================================================
// 1. VOCAB'DAN OTOMATİK SORU ÜRETİMİ
// Her kelime için:
//   a) BG → TR (Bulgarcası ne anlama gelir?)
//   b) TR → BG (Türkçe ifadenin Bulgarcası nedir?)
//   c) Örnek cümle içinde boşluk (kelimeyi bilen örnek mevcutsa)
// =========================================================

const vocab = JSON.parse(fs.readFileSync('src/data/vocabulary/vocab_ders_3.json', 'utf8'));
const allWords = vocab.words;
const lesson = "Ders 3: Откъде сте?";

const yeniSorular = [];

allWords.forEach((word) => {
  const bgClean = clean(word.bg);
  const trClean = clean(word.tr);

  // Anlamlı çeldirici bul (en az 3 tane)
  const distractors = getDistractors(word, allWords, 5);
  if (distractors.length < 3) return; // Yeterli çeldirici yoksa atla

  const trDistractors = distractors.slice(0, 3).map(d => clean(d.tr));
  const bgDistractors = distractors.slice(0, 3).map(d => clean(d.bg));

  // --- SORU TİPİ A: BG → TR ---
  yeniSorular.push({
    id: makeId('d3_bg_tr'),
    lesson,
    type: "multiple_choice",
    difficulty: word.category === 'selamlasma' || word.category === 'zamir' ? "easy" :
                word.category === 'meslek' || word.category === 'milliyet' ? "medium" : "medium",
    tags: [word.category || "kelime", "bg_tr", "ders3"],
    question: `"${bgClean}" ne anlama gelir?`,
    options: shuffle([trClean, ...trDistractors]),
    answer: trClean,
    points: 1,
  });

  // --- SORU TİPİ B: TR → BG ---
  yeniSorular.push({
    id: makeId('d3_tr_bg'),
    lesson,
    type: "multiple_choice",
    difficulty: word.category === 'selamlasma' || word.category === 'zamir' ? "easy" :
                word.category === 'meslek' || word.category === 'milliyet' ? "medium" : "medium",
    tags: [word.category || "kelime", "tr_bg", "ders3"],
    question: `"${trClean}" ifadesinin Bulgarcası nedir?`,
    options: shuffle([bgClean, ...bgDistractors]),
    answer: bgClean,
    points: 1,
  });

  // --- SORU TİPİ C: Örnek cümlede boşluk ---
  if (word.examples && word.examples.length > 0) {
    const ex = word.examples[0];
    const bgEx = clean(ex.bg);
    const trEx = clean(ex.tr);

    // BG cümleden kelimeyi çıkar, boşluk yap
    const blanked = bgEx.replace(bgClean, '____');
    if (blanked !== bgEx && blanked.length > 5) { // Değişim olduysa
      yeniSorular.push({
        id: makeId('d3_fill'),
        lesson,
        type: "fill_blank",
        difficulty: "medium",
        tags: [word.category || "kelime", "cumle", "ders3"],
        question: `"${trEx}" - Boşluğu doldurun: "${blanked}"`,
        options: shuffle([bgClean, ...bgDistractors.slice(0, 3)]),
        answer: bgClean,
        points: 1,
      });
    }
  }
});

// =========================================================
// 2. DİYALOG CÜMLELERİNDEN SORU ÜRETİMİ
// temp_doc.txt'deki her BG/TR çiftinden çeviri sorusu
// =========================================================

const docText = fs.readFileSync('temp_doc.txt', 'utf8');
const lines = docText.split('\n').map(l => l.trim());

const bgtrPairs = [];
for (let i = 0; i < lines.length - 1; i++) {
  const bgLine = lines[i];
  const trLine = lines[i + 1];
  if (bgLine.startsWith('BG:') && trLine.startsWith('TR:')) {
    // BG: "Бюлент: – Добър ден, госпожице!" -> cümleyi çıkar
    const bgMatch = bgLine.replace(/^BG:\s*(.*?:\s*–?\s*)?/, '').replace(/[–—]/g, '').trim();
    const trMatch = trLine.replace(/^TR:\s*\(.*?:\s*/, '').replace(/\)$/, '').replace(/^–\s*/, '').trim();
    if (bgMatch.length > 5 && trMatch.length > 5) {
      bgtrPairs.push({ bg: bgMatch, tr: trMatch });
    }
  }
}

console.log(`📋 ${bgtrPairs.length} diyalog cümlesi bulundu`);

// Her diyalog cümlesi için iki yönlü çeviri sorusu
const diyalogTrBanks = bgtrPairs.map(p => p.tr);
const diyalogBgBanks = bgtrPairs.map(p => p.bg);

bgtrPairs.forEach((pair, idx) => {
  // BG → TR çeviri sorusu
  const trDistractors = diyalogTrBanks
    .filter(t => t !== pair.tr)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  if (trDistractors.length >= 3) {
    yeniSorular.push({
      id: makeId('d3_diag_bg'),
      lesson,
      type: "multiple_choice",
      difficulty: pair.bg.split(' ').length <= 4 ? "easy" : pair.bg.split(' ').length <= 8 ? "medium" : "hard",
      tags: ["diyalog_ceviri", "bg_tr", "ders3"],
      question: `"${pair.bg}" Türkçe anlamı nedir?`,
      options: shuffle([pair.tr, ...trDistractors]),
      answer: pair.tr,
      points: pair.bg.split(' ').length > 8 ? 2 : 1,
    });
  }

  // TR → BG çeviri sorusu (her 2 cümlede bir - fazla tekrar olmasın)
  if (idx % 2 === 0) {
    const bgDistractors = diyalogBgBanks
      .filter(b => b !== pair.bg)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    if (bgDistractors.length >= 3) {
      yeniSorular.push({
        id: makeId('d3_diag_tr'),
        lesson,
        type: "multiple_choice",
        difficulty: pair.tr.split(' ').length <= 4 ? "easy" : "medium",
        tags: ["diyalog_ceviri", "tr_bg", "ders3"],
        question: `"${pair.tr}" ifadesinin Bulgarcası nedir?`,
        options: shuffle([pair.bg, ...bgDistractors]),
        answer: pair.bg,
        points: 1,
      });
    }
  }
});

// =========================================================
// 3. GRAMER DRİLLERİ - Olmak fiili tam çekim
// =========================================================
const olmakSorulari = [
  // Заменяем пропуск на форму
  { zamir: "Аз", cevap: "съм", cumle_tr: "Ben Bulgaristan'danım." },
  { zamir: "Ти", cevap: "си", cumle_tr: "Sen Türkiye'densin." },
  { zamir: "Той", cevap: "е", cumle_tr: "O öğrencidir (erkek)." },
  { zamir: "Тя", cevap: "е", cumle_tr: "O öğrencidir (kadın)." },
  { zamir: "Ние", cevap: "сме", cumle_tr: "Biz Sofya'danız." },
  { zamir: "Вие", cevap: "сте", cumle_tr: "Siz nerelisiniz?" },
  { zamir: "Те", cevap: "са", cumle_tr: "Onlar öğrencidir." },
];

const olmakDistractors = ["съм", "си", "е", "сме", "сте", "са"];

const ulkeler = [
  { ulke: "България", sehir: "София" },
  { ulke: "Турция", sehir: "Истанбул" },
  { ulke: "Гърция", sehir: "Атина" },
  { ulke: "Румъния", sehir: "Букурещ" },
  { ulke: "Сърбия", sehir: "Белград" },
];

olmakSorulari.forEach(s => {
  const distractors = olmakDistractors.filter(d => d !== s.cevap).slice(0, 3);
  // Farklı ülkelerle çeşitli cümleler
  ulkeler.forEach((u, ui) => {
    yeniSorular.push({
      id: makeId('d3_gram_olmak'),
      lesson,
      type: "fill_blank",
      difficulty: "easy",
      tags: ["gramer", "olmak_fiili", "conjugation", "ders3"],
      question: `"${s.zamir} ____ от ${u.ulke}." - Boşluğu doldurun. (${s.cumle_tr})`,
      options: shuffle([s.cevap, ...distractors]),
      answer: s.cevap,
      points: 1,
    });
  });
});

// =========================================================
// 4. MİLLİYET DÖNÜŞÜM SORULARI (ülke → eril/dişil)
// =========================================================
const milliyetler = [
  { ulke: "България", erkek: "българин", kadin: "българка", cogul: "българи" },
  { ulke: "Турция", erkek: "турчин", kadin: "туркиня", cogul: "турци" },
  { ulke: "Гърция", erkek: "грък", kadin: "гъркиня", cogul: "гърци" },
  { ulke: "Румъния", erkek: "румънец", kadin: "румънка", cogul: "румънци" },
  { ulke: "Сърбия", erkek: "сърбин", kadin: "сърбкиня", cogul: "сърби" },
  { ulke: "Русия", erkek: "руснак", kadin: "рускиня", cogul: "руснаци" },
  { ulke: "Франция", erkek: "французин", kadin: "французойка", cogul: "французи" },
  { ulke: "Италия", erkek: "италианец", kadin: "италианка", cogul: "италианци" },
  { ulke: "Германия", erkek: "германец", kadin: "германка", cogul: "германци" },
  { ulke: "Албания", erkek: "албанец", kadin: "албанка", cogul: "албанци" },
  { ulke: "САЩ", erkek: "американец", kadin: "американка", cogul: "американци" },
];

milliyetler.forEach(m => {
  const erkekDistractors = milliyetler.filter(x => x.ulke !== m.ulke).slice(0, 3).map(x => x.erkek);
  const kadinDistractors = milliyetler.filter(x => x.ulke !== m.ulke).slice(0, 3).map(x => x.kadin);

  // Eril soru
  yeniSorular.push({
    id: makeId('d3_mil_erk'),
    lesson,
    type: "multiple_choice",
    difficulty: "medium",
    tags: ["milliyet", "eril", "ders3"],
    question: `${m.ulke}'dan gelen bir erkek için doğru milliyet sözcüğü hangisidir?`,
    options: shuffle([m.erkek, ...erkekDistractors]),
    answer: m.erkek,
    points: 1,
  });

  // Dişil soru
  yeniSorular.push({
    id: makeId('d3_mil_kdn'),
    lesson,
    type: "multiple_choice",
    difficulty: "medium",
    tags: ["milliyet", "disil", "ders3"],
    question: `${m.ulke}'dan gelen bir kadın için doğru milliyet sözcüğü hangisidir?`,
    options: shuffle([m.kadin, ...kadinDistractors]),
    answer: m.kadin,
    points: 1,
  });

  // Ülke → eril sorusu (cümle içi)
  yeniSorular.push({
    id: makeId('d3_mil_cumle'),
    lesson,
    type: "fill_blank",
    difficulty: "medium",
    tags: ["milliyet", "cumle", "ders3"],
    question: `"Той е от ${m.ulke}. Той е ____." - Doğru milliyeti seçin.`,
    options: shuffle([m.erkek, ...erkekDistractors]),
    answer: m.erkek,
    points: 1,
  });

  // Dişil cümle içi
  yeniSorular.push({
    id: makeId('d3_mil_disil_cumle'),
    lesson,
    type: "fill_blank",
    difficulty: "medium",
    tags: ["milliyet", "disil_cumle", "ders3"],
    question: `"Тя е от ${m.ulke}. Тя е ____." - Doğru milliyeti seçin.`,
    options: shuffle([m.kadin, ...kadinDistractors]),
    answer: m.kadin,
    points: 1,
  });
});

// =========================================================
// 5. YÖNLER VE COĞRAFYA SORULARI - Her yön için birden fazla soru
// =========================================================
const yonler = [
  { bg: "север", tr: "kuzey" },
  { bg: "юг", tr: "güney" },
  { bg: "изток", tr: "doğu" },
  { bg: "запад", tr: "batı" },
  { bg: "северозапад", tr: "kuzeybatı" },
  { bg: "североизток", tr: "kuzeydoğu" },
  { bg: "югозапад", tr: "güneybatı" },
  { bg: "югоизток", tr: "güneydoğu" },
];

const denizler = [
  { bg: "Черно море", tr: "Karadeniz" },
  { bg: "Мраморно море", tr: "Marmara Denizi" },
  { bg: "Егейско море", tr: "Ege Denizi" },
  { bg: "Средиземно море", tr: "Akdeniz" },
];

const sinirCumleleri = [
  { soru: "Türkiye kuzeybatıda hangi ülkelerle sınır komşusudur?", cevap: "България и Гърция", yanlis: ["Сърбия и Румъния", "Иран и Ирак", "Грузия и Армения"] },
  { soru: "Türkiye kuzeydoğuda hangi ülkelerle sınır komşusudur?", cevap: "Грузия и Армения", yanlis: ["България и Гърция", "Иран и Ирак", "Сирия и Ирак"] },
  { soru: "Türkiye doğuda hangi ülkeyle sınır komşusudur?", cevap: "Иран", yanlis: ["Ирак", "Сирия", "Армения"] },
  { soru: "Bulgaristan batıda hangi ülkelerle sınır komşusudur?", cevap: "Сърбия и Македония", yanlis: ["Румъния и Гърция", "Турция и Гърция", "Русия и Украйна"] },
  { soru: "Bulgaristan kuzeyinde hangi ülke bulunur?", cevap: "Румъния", yanlis: ["Гърция", "Сърбия", "Турция"] },
  { soru: "Bulgaristan güneyinde hangi ülkeler bulunur?", cevap: "Турция и Гърция", yanlis: ["Сърбия и Македония", "Румъния и Молдова", "Русия и Украйна"] },
  { soru: "Türkiye kuzeyden hangi denizlerle çevrelidir?", cevap: "Черно море и Мраморно море", yanlis: ["Егейско море и Средиземно море", "Черно море и Егейско море", "Мраморно море и Средиземно море"] },
  { soru: "Türkiye'nin batısında hangi deniz bulunur?", cevap: "Егейско море", yanlis: ["Черно море", "Мраморно море", "Средиземно море"] },
  { soru: "Türkiye'nin güneyinde hangi deniz bulunur?", cevap: "Средиземно море", yanlis: ["Черно море", "Мраморно море", "Егейско море"] },
];

sinirCumleleri.forEach(s => {
  yeniSorular.push({
    id: makeId('d3_sinir'),
    lesson,
    type: "multiple_choice",
    difficulty: "hard",
    tags: ["cografi", "sinirlar", "ders3"],
    question: s.soru,
    options: shuffle([s.cevap, ...s.yanlis]),
    answer: s.cevap,
    points: 2,
  });
});

yonler.forEach(y => {
  const distractors = yonler.filter(x => x.bg !== y.bg).slice(0, 3).map(x => x.tr);
  yeniSorular.push({
    id: makeId('d3_yon_bg_tr'),
    lesson,
    type: "multiple_choice",
    difficulty: "easy",
    tags: ["yonler", "bg_tr", "ders3"],
    question: `"${y.bg}" ne anlama gelir?`,
    options: shuffle([y.tr, ...distractors]),
    answer: y.tr,
    points: 1,
  });
  const bgDistractors = yonler.filter(x => x.bg !== y.bg).slice(0, 3).map(x => x.bg);
  yeniSorular.push({
    id: makeId('d3_yon_tr_bg'),
    lesson,
    type: "multiple_choice",
    difficulty: "medium",
    tags: ["yonler", "tr_bg", "ders3"],
    question: `"${y.tr}" Bulgarcası nedir?`,
    options: shuffle([y.bg, ...bgDistractors]),
    answer: y.bg,
    points: 1,
  });
});

denizler.forEach(d => {
  const distractors = denizler.filter(x => x.bg !== d.bg).map(x => x.tr);
  yeniSorular.push({
    id: makeId('d3_deniz'),
    lesson,
    type: "multiple_choice",
    difficulty: "easy",
    tags: ["cografi", "deniz", "ders3"],
    question: `"${d.bg}" ne anlama gelir?`,
    options: shuffle([d.tr, ...distractors]),
    answer: d.tr,
    points: 1,
  });
});

// =========================================================
// 6. MEVCUT SORULARI TEMİZLE (ders3 sorularını sıfırla)
// ve yeni kapsamlı soru setini yaz
// =========================================================
const mevcutSorular = JSON.parse(fs.readFileSync('src/data/questions.json', 'utf8'));

// Eski Ders 3 sorularını çıkar
const eskiD3 = mevcutSorular.filter(s => s.lesson && s.lesson.includes("Ders 3"));
const digerSorular = mevcutSorular.filter(s => !s.lesson || !s.lesson.includes("Ders 3"));

// Tekrar eden soruları temizle (aynı soru metni varsa bir tane kalsın)
const soruMap = new Map();
yeniSorular.forEach(s => {
  if (!soruMap.has(s.question)) {
    soruMap.set(s.question, s);
  }
});
const benzersizSorular = [...soruMap.values()];

const tumSorular = [...digerSorular, ...benzersizSorular];
fs.writeFileSync('src/data/questions.json', JSON.stringify(tumSorular, null, 2), 'utf8');

// =========================================================
// RAPOR
// =========================================================
console.log(`\n🗑️  Kaldırılan eski Ders 3 soruları: ${eskiD3.length}`);
console.log(`✅ Yeni Ders 3 soruları eklendi: ${benzersizSorular.length}`);
console.log(`📊 Toplam soru sayısı: ${tumSorular.length}`);

const zorlukler = {};
const tipler = {};
benzersizSorular.forEach(s => {
  zorlukler[s.difficulty] = (zorlukler[s.difficulty] || 0) + 1;
  const tag = s.tags[0];
  tipler[tag] = (tipler[tag] || 0) + 1;
});

console.log('\n📈 Zorluk dağılımı:');
Object.entries(zorlukler).sort((a,b) => b[1]-a[1]).forEach(([k,v]) => console.log(`  ${k}: ${v}`));
console.log('\n🏷️  Kategori dağılımı (ilk 15):');
Object.entries(tipler).sort((a,b) => b[1]-a[1]).slice(0,15).forEach(([k,v]) => console.log(`  ${k}: ${v}`));
