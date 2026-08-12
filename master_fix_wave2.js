const fs = require('fs');

// Ders 3'teki gerçek dilbilgisi/kelime öğretimi değeri taşıyan kelimelerin düzeltmeleri
const updates = {

  // ====== Önemli zarflar / edatlar / partiküller ======
  "как": { type: "soru", tr: "nasıl", examples: [
    { bg: "<mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">Как</mark> се казваш?", tr: "<u>Nasıl</u> adın? / Adın ne?" },
    { bg: "<mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">Как</mark> си?", tr: "<u>Nasılsın</u>?" }
  ]},
  "а": { type: "bağlaç", tr: "ama, oysa, ve, ya (karşıtlık/ekleme)", notes: "Hem hafif karşıtlık ('oysa, ama') hem de ekleme ('ve') bildiren çok yönlü bağlaçtır. 'Но'dan daha hafif bir karşıtlık ifade eder.", examples: [
    { bg: "Аз съм от България, <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">а</mark> ти откъде си?", tr: "Ben Bulgaristanlıyım, <u>ya</u> sen nerelisin?" },
    { bg: "Той учи, <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">а</mark> тя работи.", tr: "O okuyor, <u>oysa</u> o çalışıyor." }
  ]},
  "ли": { type: "partikel", tr: "mi / mı (soru partikeli)", notes: "Bulgarcada evet/hayır sorularını oluşturan değişmez partikeldir. Türkçedeki 'mi/mı' ekine benzer, ama ayrı yazılır ve vurgulu fiilden sonra gelir.", examples: [
    { bg: "Говориш <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">ли</mark> английски?", tr: "İngilizce konuşuyor <u>musun</u>?" },
    { bg: "Имате <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">ли</mark> деца?", tr: "Çocuğunuz var <u>mı</u>?" }
  ]},
  "също": { type: "zarf", tr: "da, de, ayrıca", examples: [
    { bg: "Аз <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">също</mark> съм студент.", tr: "Ben <u>de</u> öğrenciyim." },
    { bg: "Тя <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">също</mark> говори немски.", tr: "O <u>ayrıca</u> Almanca konuşuyor." }
  ]},
  "по": { type: "edat", tr: "üzerinde / boyunca / konusunda / göre", notes: "Çok anlamlı edattır: 1) Alan/dal belirtir (по медицина = tıp alanında), 2) Dağılım (по един = teker teker), 3) Yol boyunca/üzerinden. Türkçede tek bir ekle çevrilmez.", examples: [
    { bg: "Специалист <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">по</mark> компютри.", tr: "Bilgisayar <u>konusunda</u> uzman." },
    { bg: "Вървим <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">по</mark> улицата.", tr: "Cadde <u>boyunca</u> yürüyoruz." }
  ]},
  "при": { type: "edat", tr: "yanında / nezdinde / şartında", notes: "1) Konum: 'yanında, katında' (при мен = bende, benim yanımda), 2) Koşul: '-diğinde' (при необходимост = gerektiğinde).", examples: [
    { bg: "Елате <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">при</mark> мен.", tr: "<u>Yanıma</u> gelin." },
    { bg: "Работя <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">при</mark> него.", tr: "Onun <u>yanında</u> çalışıyorum." }
  ]},
  "над": { type: "edat", tr: "üstünde, üzerinde", examples: [
    { bg: "Лампата е <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">над</mark> масата.", tr: "Lamba masanın <u>üstündedir</u>." }
  ]},
  "у": { type: "edat", tr: "yanında (eski form, bizdeki var)", notes: "Eski Bulgarca edat. Günümüzde çoğunlukla 'у нас' (bizde, ülkemizde) ifadesinde kullanılır.", examples: [
    { bg: "<mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">У</mark> нас е много топло.", tr: "<u>Bizde (ülkemizde)</u> çok sıcak." }
  ]},
  "два": { type: "sayı", tr: "iki (eril)", examples: [
    { bg: "Имам <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">два</mark> брата.", tr: "<u>İki</u> erkek kardeşim var." }
  ]},
  "три": { type: "sayı", tr: "üç", examples: [
    { bg: "Тя говори <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">три</mark> езика.", tr: "<u>Üç</u> dil konuşuyor." }
  ]},
  "пет": { type: "sayı", tr: "beş", examples: [
    { bg: "Часовникът е <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">пет</mark> часа.", tr: "Saat <u>beş</u>tir." }
  ]},
  "сграда": { type: "isim", tr: "bina, yapı", gender: "dişil", nounForms: { "tekil": "сграда", "çoğul": "сгради" }, examples: [
    { bg: "Тази <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">сграда</mark> е много стара.", tr: "Bu <u>bina</u> çok eskidir." }
  ]},
  "хубаво": { type: "sıfat", tr: "güzel, iyi (nötr)", forms: { "eril": "хубав", "dişil": "хубава", "nötr": "хубаво", "çoğul": "хубави" }, examples: [
    { bg: "Времето е <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">хубаво</mark>.", tr: "Hava <u>güzel</u>." }
  ]},
  "голяма": { type: "sıfat", tr: "büyük (dişil)", forms: { "eril": "голям", "dişil": "голяма", "nötr": "голямо", "çoğul": "големи" }, examples: [
    { bg: "Имам <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">голяма</mark> стая.", tr: "Büyük bir odam var." }
  ]},
  "синьо": { type: "sıfat", tr: "mavi (nötr)", forms: { "eril": "син", "dişil": "синя", "nötr": "синьо", "çoğul": "сини" }, examples: [
    { bg: "Небето е <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">синьо</mark>.", tr: "Gökyüzü <u>mavidir</u>." }
  ]},
  "втори": { type: "sayı", tr: "ikinci", examples: [
    { bg: "Той е на <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">втори</mark> курс.", tr: "O <u>ikinci</u> sınıftadır." }
  ]},
  "вид": { type: "isim", tr: "tür, çeşit, görünüş", gender: "eril", nounForms: { "tekil": "вид", "çoğul": "видове" }, examples: [
    { bg: "Има различни <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">видове</mark> птици.", tr: "Farklı kuş <u>türleri</u> vardır." }
  ]},
  "сутрин": { type: "isim", tr: "sabah", gender: "dişil", nounForms: { "tekil": "сутрин", "çoğul": "сутрини" }, examples: [
    { bg: "Всяка <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">сутрин</mark> пия кафе.", tr: "Her <u>sabah</u> kahve içerim." }
  ]},
  "часа": { type: "isim", tr: "saatte (sayı + saat)", gender: "eril", nounForms: { "tekil": "час", "çoğul": "часа / часове" }, notes: "Sayılardan (2-4) sonra kullanılan forma: два часа (iki saat). Генитив чиıl Форması.", examples: [
    { bg: "Уча два <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">часа</mark> на ден.", tr: "Günde iki <u>saat</u> çalışıyorum." }
  ]},
  "моделиерка": { type: "isim", tr: "moda tasarımcısı (kadın)", gender: "dişil", nounForms: { "tekil": "моделиерка", "çoğul": "моделиерки" }, examples: [
    { bg: "Тя е известна <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">моделиерка</mark>.", tr: "O ünlü bir <u>kadın moda tasarımcısıdır</u>." }
  ]},
  "море": { type: "isim", tr: "deniz", gender: "nötr", nounForms: { "tekil": "море", "çoğul": "морета" }, examples: [
    { bg: "Ще отидем на <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">море</mark>.", tr: "<u>Denize</u> gideceğiz." }
  ]},
  "черно": { type: "sıfat", tr: "siyah, kara (nötr)", forms: { "eril": "черен", "dişil": "черна", "nötr": "черно", "çoğul": "черни" }, notes: "'Черно море' = Karadeniz", examples: [
    { bg: "Облечена е в <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">черно</mark>.", tr: "<u>Siyah</u> giyinmiş." }
  ]},
  "съседи": { type: "isim", tr: "komşular", gender: "eril", nounForms: { "tekil": "съсед", "çoğul": "съседи" }, examples: [
    { bg: "Нашите <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">съседи</mark> са много добри.", tr: "<u>Komşularımız</u> çok iyidir." }
  ]},
  "нейни": { type: "zamir", tr: "onun (dişil, çoğul)", examples: [
    { bg: "Това са <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">нейните</mark> книги.", tr: "Bunlar <u>onun</u> kitaplarıdır." }
  ]},

  // Özel yer adları
  "париж": { type: "isim", tr: "Paris", gender: "eril", nounForms: { "tekil": "Париж" }, examples: [
    { bg: "<mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">Париж</mark> е столицата на Франция.", tr: "<u>Paris</u>, Fransa'nın başkentidir." }
  ]},
  "истанбул": { type: "isim", tr: "İstanbul", gender: "eril", nounForms: { "tekil": "Истанбул" }, examples: [
    { bg: "<mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">Истанбул</mark> е най-голям град в Турция.", tr: "<u>İstanbul</u>, Türkiye'nin en büyük şehridir." }
  ]},
  "одрин": { type: "isim", tr: "Edirne", gender: "eril", nounForms: { "tekil": "Одрин" }, examples: [
    { bg: "<mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">Одрин</mark> е близо до границата.", tr: "<u>Edirne</u> sınıra yakındır." }
  ]},
  "измир": { type: "isim", tr: "İzmir", gender: "eril", nounForms: { "tekil": "Измир" }, examples: [
    { bg: "<mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">Измир</mark> е голям турски град.", tr: "<u>İzmir</u> büyük bir Türk şehridir." }
  ]},
  "бурса": { type: "isim", tr: "Bursa", gender: "dişil", nounForms: { "tekil": "Бурса" }, examples: [
    { bg: "<mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">Бурса</mark> е в Турция.", tr: "<u>Bursa</u> Türkiye'dedir." }
  ]},

  // Türkçe kökten Bulgarca'ya geçmiş / öğrencinin bilmesi gereken
  "емигрирали": { type: "fiil", tr: "göç etmiş olanlar", conjugation: {
    "present": { "аз": "емигрирам", "ти": "емигрираш", "той/тя/то": "емигрира", "ние": "емигрираме", "вие": "емигрирате", "те": "емигрират" }
  }, examples: [
    { bg: "Много българи са <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">емигрирали</mark> в чужбина.", tr: "Pek çok Bulgar yurtdışına <u>göç etmiştir</u>." }
  ]},
  "останали": { type: "fiil", tr: "kalanlar, kalmış olanlar", conjugation: {
    "present": { "аз": "оставам", "ти": "оставаш", "той/тя/то": "остава", "ние": "оставаме", "вие": "оставате", "те": "остават" }
  }, examples: [
    { bg: "Тези, които са <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">останали</mark>, помнят.", tr: "<u>Kalanlar</u> hatırlıyor." }
  ]},
  "момента": { type: "isim", tr: "an, şu an (belirli)", gender: "eril", nounForms: { "tekil": "момент", "belirli": "момента" }, examples: [
    { bg: "В <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">момента</mark> съм зает.", tr: "<u>Şu an</u> meşgulüm." }
  ]},
  "граничи": { type: "fiil", tr: "sınır komşusu oluyor" },

  // Öğretim terimleri - bunlar fonetik dersten, öğrenci dili açısından değil ders içeriği
  "кирилицата": { type: "isim", tr: "kiril alfabesi (belirli)", gender: "dişil", nounForms: { "tekil": "кирилица", "belirli": "кирилицата" }, examples: [
    { bg: "<mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">Кирилицата</mark> е използвана в България.", tr: "<u>Kiril alfabesi</u> Bulgaristan'da kullanılmaktadır." }
  ]},
  "азбуката": { type: "isim", tr: "alfabe (belirli)", gender: "dişil", nounForms: { "tekil": "азбука", "belirli": "азбуката", "çoğul": "азбуки" }, examples: [
    { bg: "Българската <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">азбука</mark> има 30 букви.", tr: "Bulgar <u>alfabesi</u> 30 harften oluşur." }
  ]},
  "гласни": { type: "isim", tr: "ünlüler (sesli harfler)", gender: "dişil", nounForms: { "tekil": "гласна", "çoğul": "гласни" }, examples: [
    { bg: "В bulgarian има 6 <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">гласни</mark> звука.", tr: "Bulgarcada 6 <u>ünlü</u> ses vardır." }
  ]},
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
    console.log('✓ Fixed ' + count + ' in ' + filename);
  }
}

processFile('src/data/vocabulary/vocab_ders_1_2.json');
processFile('src/data/vocabulary/vocab_ders_3.json');
console.log('Wave 2 fix complete.');
