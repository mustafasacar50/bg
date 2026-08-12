const fs = require('fs');

// ============================================================
// İŞARET ZAMİRLERİ — Tam paradigma tablosu
// Tüm formlar birbiriyle ilişkili ve hepsi aynı tabloyu göstermeli
// ============================================================

const demonstrativeTable = {
  "Eril (o/bu)": { "yakın (bu)": "този", "uzak (o/şu)": "онзи" },
  "Dişil (o/bu)": { "yakın (bu)": "тази", "uzak (o/şu)": "онази" },
  "Nötr (o/bu)": { "yakın (bu)": "това", "uzak (o/şu)": "онова" },
  "Çoğul (bunlar/onlar)": { "yakın (bunlar)": "тези", "uzak (onlar)": "онези" }
};

const demonstrativeForms = {
  "Eril": { "yakın": "този", "uzak": "онзи" },
  "Dişil": { "yakın": "тази", "uzak": "онази" },
  "Nötr": { "yakın": "това", "uzak": "онова" },
  "Çoğul": { "yakın": "тези", "uzak": "онези" }
};

const demoNote = "Bulgarca işaret zamirleri KONUM'a göre değişir: Yakın (bu/bunlar) ve Uzak (o/şu/onlar). Her iki grupta da CİNSİYET (eril/dişil/nötr) farkı vardır.";

const demoUpdates = {
  "този": {
    type: "zamir",
    tr: "bu (eril)",
    forms: demonstrativeForms,
    notes: demoNote,
    examples: [
      { bg: "<mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">Този</mark> мъж е мой приятел.", tr: "<u>Bu</u> adam benim arkadaşım." },
      { bg: "<mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">Този</mark> университет е нов.", tr: "<u>Bu</u> üniversite yenidir." }
    ]
  },
  "тази": {
    type: "zamir",
    tr: "bu (dişil)",
    forms: demonstrativeForms,
    notes: demoNote,
    examples: [
      { bg: "<mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">Тази</mark> жена е лекарка.", tr: "<u>Bu</u> kadın doktordur." },
      { bg: "<mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">Тази</mark> книга е интересна.", tr: "<u>Bu</u> kitap ilginçtir." }
    ]
  },
  "това": {
    type: "zamir",
    tr: "bu (nötr) / bu (genel)",
    forms: demonstrativeForms,
    notes: demoNote + "\n\n'Това е...' kalıbı Bulgarca'nın en temel cümle yapısıdır: 'Това е книга' = 'Bu bir kitaptır'. Cinsiyet fark etmez!",
    examples: [
      { bg: "<mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">Това</mark> е трудно.", tr: "<u>Bu</u> zordur." },
      { bg: "<mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">Това</mark> е моят брат.", tr: "<u>Bu</u> benim erkek kardeşimdir." },
      { bg: "Какво е <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">това</mark>?", tr: "<u>Bu</u> nedir?" }
    ]
  },
  "тези": {
    type: "zamir",
    tr: "bunlar (çoğul, yakın)",
    forms: demonstrativeForms,
    notes: demoNote,
    examples: [
      { bg: "<mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">Тези</mark> студенти са от Турция.", tr: "<u>Bu</u> öğrenciler Türkiye'dendir." },
      { bg: "<mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">Тези</mark> книги са мои.", tr: "<u>Bunlar</u> benim kitaplarımdır." }
    ]
  },
  "онзи": {
    type: "zamir",
    tr: "o / şu (eril, uzak)",
    forms: demonstrativeForms,
    notes: demoNote,
    examples: [
      { bg: "<mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">Онзи</mark> мъж е непознат.", tr: "<u>O / Şu</u> adam yabancıdır." },
      { bg: "Виждаш ли <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">онзи</mark> магазин?", tr: "<u>Şu</u> mağazayı görüyor musun?" }
    ]
  },
  "онази": {
    type: "zamir",
    tr: "o / şu (dişil, uzak)",
    forms: demonstrativeForms,
    notes: demoNote,
    examples: [
      { bg: "<mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">Онази</mark> жена е много красива.", tr: "<u>O / Şu</u> kadın çok güzeldir." }
    ]
  },
  "онова": {
    type: "zamir",
    tr: "o / şu (nötr, uzak)",
    forms: demonstrativeForms,
    notes: demoNote,
    examples: [
      { bg: "<mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">Онова</mark> е важно.", tr: "<u>O / Şu</u> önemlidir." }
    ]
  },
  "онези": {
    type: "zamir",
    tr: "onlar / şunlar (çoğul, uzak)",
    forms: demonstrativeForms,
    notes: demoNote,
    examples: [
      { bg: "<mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">Онези</mark> студенти не са тук.", tr: "<u>O / Şu</u> öğrenciler burada değil." }
    ]
  }
};

// Also fix трудно and затова missing from both indexes cross-file
const additionalUpdates = {
  "трудно": {
    type: "zarf",
    tr: "zor, güçlükle",
    examples: [
      { bg: "Езикът е <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">трудно</mark> за учене.", tr: "Dil öğrenmek <u>zordur</u>." },
      { bg: "<mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">Трудно</mark> се намират думи.", tr: "Kelimeler <u>güçlükle</u> bulunuyor." }
    ]
  },
  "затова": {
    type: "bağlaç",
    tr: "bu yüzden, bu nedenle",
    examples: [
      { bg: "Езикът е труден, <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">затова</mark> трябва да учим.", tr: "Dil zor, <u>bu yüzden</u> çalışmamız gerekiyor." },
      { bg: "Тя е болна, <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">затова</mark> не дойде.", tr: "O hasta, <u>bu yüzden</u> gelmedi." }
    ]
  }
};

const allUpdates = { ...demoUpdates, ...additionalUpdates };

// We need to ADD missing pronouns to BOTH files
function ensureWordExists(data, bg, entry) {
  const exists = data.words.find(w => w.bg.toLowerCase() === bg.toLowerCase());
  if (!exists) {
    data.words.push({ bg, ...entry });
    return true;
  }
  return false;
}

function processFile(filename) {
  let data = JSON.parse(fs.readFileSync(filename, 'utf8'));
  let updated = 0;
  let added = 0;

  // Update existing words
  data.words = data.words.map(w => {
    const key = w.bg.toLowerCase();
    const upd = allUpdates[key];
    if (upd) {
      Object.keys(upd).forEach(k => { w[k] = upd[k]; });
      updated++;
    }
    return w;
  });

  // Add missing demonstrative pronouns
  const demos = ['тази', 'това', 'тези', 'онази', 'онова', 'онези'];
  demos.forEach(bg => {
    const upd = demoUpdates[bg];
    if (upd && ensureWordExists(data, bg, upd)) {
      added++;
    }
  });

  // Also add трудно and затова if missing
  ['трудно', 'затова'].forEach(bg => {
    const upd = additionalUpdates[bg];
    if (upd && ensureWordExists(data, bg, upd)) {
      added++;
    }
  });

  fs.writeFileSync(filename, JSON.stringify(data, null, 2));
  console.log(`✓ ${filename}: ${updated} updated, ${added} added`);
}

processFile('src/data/vocabulary/vocab_ders_1_2.json');
processFile('src/data/vocabulary/vocab_ders_3.json');
console.log('Done. Regenerate index next.');
