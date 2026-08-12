const fs = require('fs');

// The issue: Ни, Ви carry wrong translations (biz/sen) — they should be the SHORT forms (us/you)
// Малък, до, скоро, би, светът are all type=otomatik with no richness at all.
// И bağlaç but marked zamir wrongly.
// Сърбия, Македония are otomatik proper nouns — need type + examples.

const shortDativeTable = {
  "Аз (ben) → ": "ми",
  "Ти (sen) → ": "ти",
  "Той (o/erkek) → ": "му",
  "Тя (o/kadın) → ": "ѝ / и",
  "То (o/nötr) → ": "му",
  "Ние (biz) → ": "ни",
  "Вие (siz) → ": "ви",
  "Те (onlar) → ": "им"
};

const shortAccusativeTable = {
  "Аз (ben) → ": "ме",
  "Ти (sen) → ": "те",
  "Той (o/erkek) → ": "го",
  "Тя (o/kadın) → ": "я",
  "То (o/nötr) → ": "го",
  "Ние (biz) → ": "ни",
  "Вие (siz) → ": "ви",
  "Те (onlar) → ": "ги"
};

const updates = {
  // ---- Bağlaç düzeltmesi: "и" ve zamir olanlar ----
  "и": {
    type: "bağlaç",
    tr: "ve",
    notes: "Bulgarca en temel bağlaçtır. 'Ve' anlamına gelir. Dikkat: 'Тя (и) ona ait' bağlamında 'и' kısa dişil zamir de olabilir; ama bağlaç olarak sıklıkla kullanılır.",
    examples: [
      { bg: "Аз <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">и</mark> ти сме приятели.", tr: "Ben <u>ve</u> sen arkadaşız." },
      { bg: "Той <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">и</mark> тя учат заедно.", tr: "O <u>ve</u> o (kadın) beraber okuyorlar." }
    ]
  },

  // Ни ve Ви: short pronouns, correct translations
  "ни": {
    type: "zamir",
    tr: "bize / bizim (kısa form)",
    pronounForms: shortDativeTable,
    notes: "Kısa dative/iyelik zamiridir. Ние'nin (biz) kısa halidir: 'bize', 'bizi', 'bizim' anlamlarını taşır.",
    examples: [
      { bg: "Дай <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">ни</mark> малко вода.", tr: "<u>Bize</u> biraz su ver." },
      { bg: "Помогни <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">ни</mark>!", tr: "<u>Bize</u> yardım et!" }
    ]
  },
  "ви": {
    type: "zamir",
    tr: "size / sizin (kısa form)",
    pronounForms: shortDativeTable,
    notes: "Kısa dative/iyelik zamiridir. Вие'nin (siz) kısa halidir: 'size', 'sizi', 'sizin' anlamlarını taşır.",
    examples: [
      { bg: "Как <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">ви</mark> е името?", tr: "Adınız <u>ne (sizin)</u>?" },
      { bg: "Изпратих <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">ви</mark> имейл.", tr: "<u>Size</u> e-posta gönderdim." }
    ]
  },

  // ---- "До" edat - çok anlamlı, kritik ----
  "до": {
    type: "edat",
    tr: "-a kadar / -e kadar / yanına / ile",
    notes: "Bulgarcanın en çok kullanılan edatlarından biridir. Birden fazla anlamı vardır:\n• Zaman: '-a kadar' (до утре = yarına kadar)\n• Mekan: 'yanına / -e kadar' (до училище = okula kadar)\n• Birliktelik: 'ile, yanında' (Ела до мен = Yanıma gel)",
    examples: [
      { bg: "Ще чакам <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">до</mark> утре.", tr: "Yarın<u>a kadar</u> bekleyeceğim." },
      { bg: "Живея <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">до</mark> морето.", tr: "Deniz<u>in yanında (yakınında)</u> yaşıyorum." },
      { bg: "Ела <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">до</mark> мен.", tr: "Yanım<u>a</u> gel." }
    ]
  },

  // ---- "Скоро" zarf ----
  "скоро": {
    type: "zarf",
    tr: "yakında, kısa süre içinde",
    examples: [
      { bg: "<mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">Скоро</mark> ще се видим.", tr: "<u>Yakında</u> görüşeceğiz." },
      { bg: "Тя <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">скоро</mark> ще дойде.", tr: "O <u>yakında</u> gelecek." }
    ]
  },

  // ---- "Би" - koşul eki yardımcı fiil ----
  "би": {
    type: "fiil",
    tr: "-(e)rdi / -se olurdu (koşul kipi yardımcısı)",
    notes: "Bulgarcada şart/koşul kipi (условно наклонение) oluşturmak için kullanılan yardımcı kelimedir. Tüm şahıslar için DEĞİŞMEZ — tek bir form olan 'би' kullanılır. Fiil ile birlikte kullanılır: 'Аз би дошел' (Gelebilirdim/Gelsezdim).",
    forms: {
      "Аз би + [fiil]": "Аз би дошел (Gelebilirdim)",
      "Ти би + [fiil]": "Ти би отишъл (Gidebilirdin)",
      "Той/Тя/То би + [fiil]": "Той би учил (Okuyabilirdi)",
      "Ние би + [fiil]": "Ние би дошли (Gelebilirdik)",
      "Вие би + [fiil]": "Вие би помогнали (Yardım edebilirdiniz)",
      "Те би + [fiil]": "Те би знали (Bilmişlerdi)"
    },
    examples: [
      { bg: "Аз <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">би</mark> дошъл, ако имах время.", tr: "Zamanım olsaydı <u>gelirdim</u>." },
      { bg: "Той <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">би</mark> искал да те види.", tr: "O seni <u>görmek isterdi</u>." }
    ]
  },

  // ---- "Малък" sıfat ----
  "малък": {
    type: "sıfat",
    tr: "küçük",
    forms: {
      "eril": "малък",
      "dişil": "малка",
      "nötr": "малко",
      "çoğul": "малки"
    },
    notes: "Sıfatı belirli ekiyle kullanmak için: eril → малкият, dişil → малката, nötr → малкото, çoğul → малките",
    examples: [
      { bg: "Той е <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">малък</mark> за тази работа.", tr: "Bu iş için <u>küçük</u>tür." },
      { bg: "Имам <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">малка</mark> стая.", tr: "Küçük bir odam var." },
      { bg: "Тя има <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">малко</mark> куче.", tr: "Onun <u>küçük</u> bir köpeği var." }
    ]
  },

  // ---- "Светът" isim ----
  "светът": {
    type: "isim",
    tr: "dünya (belirli)",
    gender: "eril",
    nounForms: {
      "tekil": "свят",
      "belirli": "светът",
      "çoğul": "светове"
    },
    notes: "Temel form 'свят' (dünya). 'Светът' belirli halidir (определен член). İçindeki 'т' harfi kaybolabilir: 'света' (от света = dünyadan).",
    examples: [
      { bg: "<mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">Светът</mark> е голям.", tr: "<u>Dünya</u> büyüktür." },
      { bg: "Той иска да обиколи целия <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">свят</mark>.", tr: "O tüm <u>dünyayı</u> gezmek istiyor." }
    ]
  },

  // ---- Ülke adları ----
  "сърбия": {
    type: "isim",
    tr: "Sırbistan",
    gender: "dişil",
    nounForms: { "tekil": "Сърбия" },
    examples: [
      { bg: "<mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">Сърбия</mark> е съседна на България.", tr: "<u>Sırbistan</u>, Bulgaristan'a komşudur." },
      { bg: "Аз съм от <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">Сърбия</mark>.", tr: "Ben <u>Sırbistan</u>'danım." }
    ]
  },
  "македония": {
    type: "isim",
    tr: "Kuzey Makedonya",
    gender: "dişil",
    nounForms: { "tekil": "Македония" },
    examples: [
      { bg: "<mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">Македония</mark> граничи с България.", tr: "<u>Makedonya</u>, Bulgaristan ile sınır komşusudur." }
    ]
  }
};

function processFile(filename) {
  let data = JSON.parse(fs.readFileSync(filename, 'utf8'));
  let count = 0;
  data.words = data.words.map(w => {
    const key = w.bg.toLowerCase();
    const upd = updates[key];
    if (upd) {
      if (upd.type !== undefined) w.type = upd.type;
      if (upd.tr !== undefined) w.tr = upd.tr;
      if (upd.notes !== undefined) w.notes = upd.notes;
      if (upd.forms !== undefined) w.forms = upd.forms;
      if (upd.nounForms !== undefined) w.nounForms = upd.nounForms;
      if (upd.pronounForms !== undefined) w.pronounForms = upd.pronounForms;
      if (upd.gender !== undefined) w.gender = upd.gender;
      if (upd.conjugation !== undefined) w.conjugation = upd.conjugation;
      if (upd.examples !== undefined) w.examples = upd.examples;
      count++;
    }
    return w;
  });
  if (count > 0) {
    fs.writeFileSync(filename, JSON.stringify(data, null, 2));
    console.log(`✓ Fixed ${count} words in ${filename}`);
  }
}

processFile('src/data/vocabulary/vocab_ders_1_2.json');
processFile('src/data/vocabulary/vocab_ders_3.json');
console.log('Done!');
