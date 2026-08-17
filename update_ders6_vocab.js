const fs = require('fs');
const path = require('path');

const vocabFile = path.join(__dirname, 'src/data/vocabulary/vocab_ders_6.json');
const indexFile = path.join(__dirname, 'src/data/vocabulary/vocab_ders_6_index.json');

const vocabData = JSON.parse(fs.readFileSync(vocabFile, 'utf8'));
const indexData = JSON.parse(fs.readFileSync(indexFile, 'utf8'));

const newWords = [
  // Günler ve Zaman
  { bg: "понеделник", tr: "pazartesi", type: "isim", gender: "eril", notes: "Haftanın ilk günü (мъжки род).", examples: [{bg:"Днес е понеделник.", tr:"Bugün pazartesi."}] },
  { bg: "вторник", tr: "salı", type: "isim", gender: "eril", notes: "Haftanın ikinci günü.", examples: [{bg:"Утре е вторник.", tr:"Yarın salı."}] },
  { bg: "сряда", tr: "çarşamba", type: "isim", gender: "dişil", notes: "Haftanın üçüncü günü (женски род).", examples: [] },
  { bg: "четвъртък", tr: "perşembe", type: "isim", gender: "eril", notes: "Haftanın dördüncü günü.", examples: [] },
  { bg: "петък", tr: "cuma", type: "isim", gender: "eril", notes: "Haftanın beşinci günü.", examples: [] },
  { bg: "събота", tr: "cumartesi", type: "isim", gender: "dişil", notes: "Hafta sonunun ilk günü.", examples: [] },
  { bg: "неделя", tr: "pazar", type: "isim", gender: "dişil", notes: "Haftanın son günü.", examples: [] },
  { bg: "днес", tr: "bugün", type: "zarf", notes: "Zaman zarfı.", examples: [{bg:"Днес е почивен ден.", tr:"Bugün tatil günüdür."}] },
  { bg: "утре", tr: "yarın", type: "zarf", notes: "Zaman zarfı.", examples: [] },
  { bg: "вчера", tr: "dün", type: "zarf", notes: "Zaman zarfı.", examples: [] },
  { bg: "ден", tr: "gün", type: "isim", gender: "eril", notes: "Çoğulu: дни. Sayılarla kullanıldığında (2,3,5): дена.", examples: [{bg:"Хубав ден!", tr:"İyi günler!"}] },
  { bg: "почивен", tr: "tatil / dinlenme / boş (sıfat)", type: "sıfat", gender: "eril", notes: "почивен ден = tatil günü. 'почивам' (dinlenmek) fiilinden gelir.", examples: [{bg:"Днес е почивен ден.", tr:"Bugün tatil günüdür."}] },
  
  // Aylar
  { bg: "януари", tr: "ocak", type: "isim", gender: "eril", notes: "Aylar Bulgarcada eril kabul edilir. Edat olarak 'през' alır (през януари = ocak ayında).", examples: [{bg:"През януари е студено.", tr:"Ocak ayında hava soğuktur."}] },
  { bg: "февруари", tr: "şubat", type: "isim", gender: "eril", notes: "Ayların adları her zaman küçük harfle yazılır (cümlenin başı değilse).", examples: [] },
  { bg: "март", tr: "mart", type: "isim", gender: "eril", notes: "", examples: [] },
  { bg: "април", tr: "nisan", type: "isim", gender: "eril", notes: "", examples: [] },
  { bg: "май", tr: "mayıs", type: "isim", gender: "eril", notes: "", examples: [] },
  { bg: "юни", tr: "haziran", type: "isim", gender: "eril", notes: "", examples: [] },
  { bg: "юли", tr: "temmuz", type: "isim", gender: "eril", notes: "", examples: [] },
  { bg: "август", tr: "ağustos", type: "isim", gender: "eril", notes: "", examples: [] },
  { bg: "септември", tr: "eylül", type: "isim", gender: "eril", notes: "", examples: [] },
  { bg: "октомври", tr: "ekim", type: "isim", gender: "eril", notes: "", examples: [] },
  { bg: "ноември", tr: "kasım", type: "isim", gender: "eril", notes: "", examples: [] },
  { bg: "декември", tr: "aralık", type: "isim", gender: "eril", notes: "", examples: [] },

  // Zaman İfadeleri
  { bg: "кога", tr: "ne zaman", type: "zamir", notes: "Soru zamiri. Soru cümlelerinde başa gelir.", examples: [{bg:"Кога си роден?", tr:"Ne zaman doğdun?"}] },
  { bg: "колко", tr: "ne kadar / kaç", type: "zamir", notes: "Soru zamiri. Sayılabilen nesneler veya miktar sormak için kullanılır.", examples: [{bg:"Колко часът е?", tr:"Saat kaç?"}] },
  { bg: "време", tr: "zaman / hava", type: "isim", gender: "nötr", notes: "Nötr isim (среден род). Hem 'zaman' (time) hem 'hava durumu' (weather) anlamında kullanılır.", examples: [{bg:"Нямам време.", tr:"Zamanım yok."}] },
  { bg: "час", tr: "saat", type: "isim", gender: "eril", notes: "Çoğulu: часове. 'Колко е часът?' kalıbında belirli artikelli (часът) kullanılır.", examples: [{bg:"Един час.", tr:"Bir saat."}] },
  { bg: "минута", tr: "dakika", type: "isim", gender: "dişil", notes: "Çoğulu: минути.", examples: [] },
  { bg: "сравнение", tr: "karşılaştırma", type: "isim", gender: "nötr", notes: "'в сравнение с' (ile karşılaştırıldığında / -e göre) kalıbında sıkça kullanılır.", examples: [{bg:"В сравнение с вчера, днес е топло.", tr:"Düne göre bugün sıcak."}] },
  { bg: "средноевропейско", tr: "Orta Avrupa (nötr)", type: "sıfat", gender: "nötr", notes: "средна (orta) + европейско (avrupa). Nötr isimleri niteler.", examples: [] },
  { bg: "роден", tr: "doğmuş", type: "sıfat", gender: "eril", notes: "Eril form. Dişil: родена, Nötr: родено, Çoğul: родени.", examples: [{bg:"Кога си роден?", tr:"Ne zaman doğdun?"}] },
  
  // Önemli Edatlar ve Zamirler
  { bg: "през", tr: "boyunca / içinden / (ay-yıl için) ...'da", type: "edat", notes: "Aylar ve yıllar ile kullanıldığında o zaman dilimi içinde olduğunu belirtir (през януари = ocak ayında, през 2024 = 2024'te). Ayrıca fiziksel olarak bir şeyin 'içinden/arasından' geçmeyi ifade eder.", examples: [{bg:"През януари.", tr:"Ocak ayında."}] },
  { bg: "до", tr: "kadar / yanına", type: "edat", notes: "Mesafe (okula kadar) veya zaman (saat 5'e kadar) bildirebilir. Ayrıca 'yanında/yanına' anlamı vardır (до мен = yanıma/yanımda).", examples: [] },
  { bg: "за", tr: "için", type: "edat", notes: "Amaç, niyet veya hedef belirtir.", examples: [] },
  { bg: "с", tr: "ile / birlikte", type: "edat", notes: "Birliktelik belirtir. Kendisinden sonra gelen kelime 'с' veya 'з' ile başlıyorsa 'със' olur.", examples: [] },
  { bg: "със", tr: "ile / birlikte (s/z'den önce)", type: "edat", notes: "Aslı 'с' edatıdır. Okunuşu kolaylaştırmak için 'с' veya 'з' harfiyle başlayan kelimelerden önce 'със' yazılır.", examples: [{bg:"Кафе със захар.", tr:"Şekerli (şeker ile) kahve."}] },
  { bg: "и", tr: "ve", type: "bağlaç", notes: "En yaygın bağlaçtır.", examples: [] },
  { bg: "но", tr: "ama / fakat", type: "bağlaç", notes: "Zıtlık belirtir.", examples: [] },
  { bg: "или", tr: "veya", type: "bağlaç", notes: "Seçenek belirtir.", examples: [] },
  { bg: "тук", tr: "burada", type: "zarf", notes: "Yer belirten zarftır. 'Тука' şeklinde de konuşma dilinde kullanılır.", examples: [{bg:"Аз съм тук.", tr:"Ben buradayım."}] },
  { bg: "там", tr: "orada", type: "zarf", notes: "Yer belirten zarftır.", examples: [] },
  { bg: "си", tr: "kendine / kendi (dönüşlü iyelik)", type: "zamir", notes: "Kısa dönüşlü iyelik zamiri. Sahip olan kişiyle özne aynı olduğunda kullanılır. Ayrıca 'съм' fiilinin 'sen' çekimidir (Ти си = Sen ...sın).", examples: [{bg:"Кога си роден?", tr:"Ne zaman doğdun? (burada 'си' fiil çekimidir)"}, {bg:"Взех си чантата.", tr:"(Kendi) çantamı aldım."}] },
];

let addedCount = 0;
newWords.forEach(w => {
  if (!indexData[w.bg.toLowerCase()]) {
    // Fill required GrammarWord fields
    w.topic = w.topic || "topic_grammar";
    w.audio = "";
    w.tags = ["ders6"];
    if(!w.examples) w.examples = [];
    
    vocabData.words.push(w);
    indexData[w.bg.toLowerCase()] = w.bg;
    addedCount++;
  }
});

fs.writeFileSync(vocabFile, JSON.stringify(vocabData, null, 2));
fs.writeFileSync(indexFile, JSON.stringify(indexData, null, 2));
console.log('Successfully added ' + addedCount + ' new rich grammar words to Ders 6.');
