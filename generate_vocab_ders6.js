const fs = require('fs');
const path = require('path');

const vocabData = {
  moduleId: "balgoc___Bulgarca_A1_Ders_6",
  level: "A1",
  lessonTitle: "Ders 6: Derslik, Zaman ve Emir Kipi",
  topics: [
    { id: "topic_classroom", title: "Sınıf Eşyaları", description: "Sınıftaki nesneler" },
    { id: "topic_time", title: "Zaman ve Tarih", description: "Günler, aylar, mevsimler ve saatler" },
    { id: "topic_grammar", title: "Gramer", description: "Emir kipi ve belirli artikel" },
    { id: "topic_dialogue", title: "Günlük Diyaloglar", description: "İş seyahati ve oto servis kelimeleri" }
  ],
  words: [
    // Sınıf Eşyaları
    {
      bg: "аудитория", tr: "amfi / derslik", pronunciation: "auditoriya", type: "isim", gender: "dişil", topic: "topic_classroom",
      notes: "Dişil isim (женски род). Belirli formu: аудиторията (amfi). Üniversitelerdeki büyük derslikler için kullanılır.",
      examples: [{ bg: "Лекциите се провеждат в една аудитория.", tr: "Dersler bir amfide yapılıyor." }]
    },
    {
      bg: "етаж", tr: "kat", pronunciation: "etaj", type: "isim", gender: "eril", topic: "topic_classroom",
      notes: "Eril isim (мъжки род). Belirli tam formu: етажът, kısa formu: етажа. (Örn: първият етаж - birinci kat).",
      examples: [{ bg: "Тя е на втория етаж.", tr: "O, ikinci kattadır." }]
    },
    {
      bg: "покривка", tr: "masa örtüsü", pronunciation: "pokrivka", type: "isim", gender: "dişil", topic: "topic_classroom",
      notes: "Dişil isim. Belirli formu: покривката. 'Покривам' (örtmek) fiilinden türemiştir.",
      examples: [{ bg: "На масата няма покривка.", tr: "Masanın üzerinde örtü yok." }]
    },
    {
      bg: "редица", tr: "sıra / dizi", pronunciation: "reditsa", type: "isim", gender: "dişil", topic: "topic_classroom",
      notes: "Dişil isim. Çoğulu: редици. İnsan veya nesnelerin yan yana/arka arkaya dizilişini ifade eder.",
      examples: [{ bg: "Те са наредени в редици.", tr: "Sıralar halinde dizilmişlerdir." }]
    },
    {
      bg: "прозорец", tr: "pencere", pronunciation: "prozorets", type: "isim", gender: "eril", topic: "topic_classroom",
      notes: "Eril isim. Çoğul formu: прозорци. Belirli çoğul formu: прозорците. Sessiz harf düşmesi (е -> i) kuralına uyar.",
      examples: [{ bg: "Прозорците са големи.", tr: "Pencereler büyüktür." }]
    },
    {
      bg: "врата", tr: "kapı", pronunciation: "vrata", type: "isim", gender: "dişil", topic: "topic_classroom",
      notes: "Dişil isim. Belirli formu: вратата.",
      examples: [{ bg: "Вратата е кафява.", tr: "Kapı kahverengidir." }]
    },
    {
      bg: "стена", tr: "duvar", pronunciation: "stena", type: "isim", gender: "dişil", topic: "topic_classroom",
      notes: "Dişil isim. Çoğulu: стени, Belirli çoğulu: стените.",
      examples: [{ bg: "Стените са бели.", tr: "Duvarlar beyazdır." }]
    },
    {
      bg: "таван", tr: "tavan", pronunciation: "tavan", type: "isim", gender: "eril", topic: "topic_classroom",
      notes: "Eril isim. Belirli tam formu: таванът. 'На тавана' = tavanda.",
      examples: [{ bg: "Таванът също е бял.", tr: "Tavan da beyazdır." }]
    },
    {
      bg: "под", tr: "zemin / yer", pronunciation: "pod", type: "isim", gender: "eril", topic: "topic_classroom",
      notes: "Eril isim. Belirli tam formu: подът. Zemin kat anlamına da gelebilir.",
      examples: [{ bg: "Подът е покрит с паркет.", tr: "Zemin parke ile kaplıdır." }]
    },
    {
      bg: "дъска", tr: "tahta", pronunciation: "dıska", type: "isim", gender: "dişil", topic: "topic_classroom",
      notes: "Dişil isim. Belirli formu: дъската. 'Бяла дъска' = beyaz tahta.",
      examples: [{ bg: "На стената има бяла дъска.", tr: "Duvarda beyaz bir tahta var." }]
    },
    {
      bg: "кутия", tr: "kutu", pronunciation: "kutiya", type: "isim", gender: "dişil", topic: "topic_classroom",
      notes: "Dişil isim. Belirli formu: кутията.",
      examples: [{ bg: "Има кутия с гъба.", tr: "Süngerli bir kutu var." }]
    },
    {
      bg: "маркер", tr: "tahta kalemi / marker", pronunciation: "marker", type: "isim", gender: "eril", topic: "topic_classroom",
      notes: "Eril isim. Belirli tam formu: маркерът.",
      examples: [{ bg: "Пиша с маркер.", tr: "Marker ile yazıyorum." }]
    },
    {
      bg: "фонетичния", tr: "fonetik (belirli)", pronunciation: "fonetiçniya", type: "sıfat", gender: "eril", topic: "topic_classroom",
      notes: "Eril sıfat (фонетичен). '-ия' eki eril kısa artikelidir. (Örn: във фонетичния кабинет).",
      examples: [{ bg: "Такава има във фонетичния кабинет.", tr: "Fonetik laboratuvarında vardır." }]
    },
    {
      bg: "кабинет", tr: "çalışma odası / laboratuvar", pronunciation: "kabinet", type: "isim", gender: "eril", topic: "topic_classroom",
      notes: "Eril isim. Doktor muayenehanesi, ofis veya okullardaki özel derslikler (laboratuvar) için kullanılır.",
      examples: [{ bg: "Отивам в кабинета.", tr: "Çalışma odasına gidiyorum." }]
    },

    // Fiiller ve Gramer
    {
      bg: "може", tr: "mümkün olmak / yapabilmek", pronunciation: "moje", type: "fiil", gender: null, topic: "topic_grammar",
      notes: "Kuralsız (yardımcı) fiil. Kendisinden sonra 'да' bağlacı alarak mastar/istek belirtir: 'може да се членува' (belirli hale getirilebilir).",
      examples: [{ bg: "Съществителното име може да се членува.", tr: "İsim belirli hale getirilebilir." }]
    },
    {
      bg: "име", tr: "isim / ad", pronunciation: "ime", type: "isim", gender: "nötr", topic: "topic_grammar",
      notes: "Nötr isim (среден род). Belirli formu: името. Çoğulu: имена (kuralsız). 'Съществително име' = İsim (Dilbilgisi).",
      examples: [{ bg: "Съществителното име може да се членува.", tr: "İsim belirli hale getirilebilir." }]
    },
    {
      bg: "се", tr: "kendi kendini (dönüşlü zamir)", pronunciation: "se", type: "zamir", gender: null, topic: "topic_grammar",
      notes: "Dönüşlü/Edilgen zamir. Fiillerle birlikte kullanılarak dönüşlülük veya edilgenlik (pasif) anlamı katar. (Örn: казвам се = adlandırılıyorum).",
      examples: [{ bg: "Тя се нарича високосна.", tr: "O artık (yıl) olarak adlandırılır." }]
    },
    {
      bg: "да", tr: "evet / -mek için (fiil bağlacı)", pronunciation: "da", type: "bağlaç", gender: null, topic: "topic_grammar",
      notes: "Hem 'evet' anlamına gelir, hem de iki fiili bağlayarak Türkçe'deki mastar (-mek/-mak) ekini karşılar. (Örn: искам да уча = öğrenmek istiyorum).",
      examples: [{ bg: "Нека да играя.", tr: "Bırak oynayayım." }]
    },
    {
      bg: "провеждам", tr: "gerçekleştirmek / yapmak", pronunciation: "provejdam", type: "fiil", gender: null, topic: "topic_grammar",
      notes: "Düzenli bir fiildir. 'провеждаме' = biz yapıyoruz/gerçekleştiriyoruz. Genelde ders, toplantı, etkinlik yapmak anlamında kullanılır.",
      examples: [{ bg: "В него провеждаме занятия.", tr: "Onda/orada dersleri yapıyoruz." }]
    },
    {
      bg: "практическите", tr: "uygulamalı (belirli)", pronunciation: "prakticheskite", type: "sıfat", gender: "çoğul", topic: "topic_grammar",
      notes: "Çoğul belirli sıfat. Kökü 'практически' (uygulamalı).",
      examples: [{ bg: "Практическите занятия са важни.", tr: "Uygulamalı dersler önemlidir." }]
    },
    {
      bg: "занятия", tr: "dersler / etkinlikler", pronunciation: "zanyatiya", type: "isim", gender: "nötr", topic: "topic_grammar",
      notes: "Nötr ismin (занятие) çoğul halidir. Genelde üniversite veya kurs dersleri için kullanılır.",
      examples: [{ bg: "Имаме практически занятия.", tr: "Uygulamalı derslerimiz var." }]
    },
    
    // Zaman ve Mevsimler
    {
      bg: "сезон", tr: "mevsim", pronunciation: "sezon", type: "isim", gender: "eril", topic: "topic_time",
      notes: "Eril isim. Belirli tam form: сезонът, kısa form: сезона. Çoğul: сезони.",
      examples: [{ bg: "Мъжки род: сезон – сезона – сезонът.", tr: "Eril cins: mevsim - belirli mevsimi - belirli mevsim." }]
    },
    {
      bg: "ера", tr: "çağ", pronunciation: "era", type: "isim", gender: "dişil", topic: "topic_time",
      notes: "Dişil isim. Belirli formu: ерата. Zaman birimlerinin en büyüğü.",
      examples: [{ bg: "Най-голямата мярка за време е ера.", tr: "Zaman için en büyük ölçü birimi çağdır." }]
    },
    {
      bg: "век", tr: "yüzyıl / asır", pronunciation: "vek", type: "isim", gender: "eril", topic: "topic_time",
      notes: "Eril isim. Çoğul formu: векове. 100 yılı kapsar.",
      examples: [{ bg: "Един век е равен на сто години.", tr: "Bir yüzyıl yüz yıla eşittir." }]
    },
    {
      bg: "година", tr: "yıl", pronunciation: "godina", type: "isim", gender: "dişil", topic: "topic_time",
      notes: "Dişil isim. Belirli formu: годината. Çoğul: години.",
      examples: [{ bg: "Годината има 12 месеца.", tr: "Yılın 12 ayı vardır." }]
    },
    {
      bg: "високосна", tr: "artık (yıl)", pronunciation: "visokosna", type: "sıfat", gender: "dişil", topic: "topic_time",
      notes: "Dişil sıfat. 'Високосна година' Şubat ayının 29 çektiği artık yıl demektir.",
      examples: [{ bg: "Тя се нарича високосна година.", tr: "Ona artık yıl denir." }]
    },
    {
      bg: "мръква", tr: "hava kararır", pronunciation: "mrıkva", type: "fiil", gender: null, topic: "topic_time",
      notes: "Sadece 3. tekil şahısta kullanılan doğa olayı fiili (безличен глагол). 'Се мръква' şeklinde kullanılır.",
      examples: [{ bg: "В колко часа се мръква?", tr: "Saat kaçta hava kararır?" }]
    },
    {
      bg: "съмва", tr: "gün ağarır", pronunciation: "sımva", type: "fiil", gender: null, topic: "topic_time",
      notes: "Doğa olayı fiili. 'Се съмва' şeklinde kullanılır.",
      examples: [{ bg: "В колко часа се съмва?", tr: "Saat kaçta gün ağarır?" }]
    },

    // Diyaloglar
    {
      bg: "командировка", tr: "iş seyahati", pronunciation: "komandirovka", type: "isim", gender: "dişil", topic: "topic_dialogue",
      notes: "Dişil isim. 'В командировка' = iş seyahatinde.",
      examples: [{ bg: "Моят мъж е в командировка.", tr: "Kocam iş seyahatinde." }]
    },
    {
      bg: "счетоводителка", tr: "muhasebeci (kadın)", pronunciation: "schetovoditelka", type: "isim", gender: "dişil", topic: "topic_dialogue",
      notes: "Dişil isim. Eril formu: счетоводител.",
      examples: [{ bg: "Аз съм счетоводителка.", tr: "Ben muhasebeciyim." }]
    },
    {
      bg: "шведска маса", tr: "açık büfe", pronunciation: "shvedska masa", type: "isim tamlaması", gender: "dişil", topic: "topic_dialogue",
      notes: "Harfi harfine 'İsveç masası' demektir, ancak Bulgarcada 'açık büfe' anlamında kullanılır.",
      examples: [{ bg: "Закуската е на шведска маса.", tr: "Kahvaltı açık büfedir." }]
    },
    {
      bg: "пренощува", tr: "gecelemek / yatıya kalmak", pronunciation: "prenoshtuva", type: "fiil", gender: null, topic: "topic_dialogue",
      notes: "Geceyi geçirmek anlamında fiil.",
      examples: [{ bg: "Ще пренощува в хотела.", tr: "Otelde geceleyecek." }]
    },
    {
      bg: "автосервиз", tr: "oto servis / tamirhane", pronunciation: "avtoserviz", type: "isim", gender: "eril", topic: "topic_dialogue",
      notes: "Eril isim. Araba tamir edilen yer.",
      examples: [{ bg: "Колата е в автосервиза.", tr: "Araba oto servistedir." }]
    },
    {
      bg: "ходова част", tr: "yürüyen aksam", pronunciation: "hodova chast", type: "isim tamlaması", gender: "dişil", topic: "topic_dialogue",
      notes: "Araçların alt, tekerlek ve süspansiyon sistemleri için kullanılan otomotiv terimi.",
      examples: [{ bg: "Има проблем с ходовата част.", tr: "Yürüyen aksamda problem var." }]
    },
    {
      bg: "секретен болт", tr: "kilitli bijon / özel vida", pronunciation: "sekreten bolt", type: "isim tamlaması", gender: "eril", topic: "topic_dialogue",
      notes: "Otomobil lastiklerinin çalınmasını önleyen şifreli özel vida/bijon.",
      examples: [{ bg: "Трябва ми секретен болт за гумата.", tr: "Lastik için kilitli bijona ihtiyacım var." }]
    },
    {
      bg: "гума", tr: "lastik (araç) / silgi", pronunciation: "guma", type: "isim", gender: "dişil", topic: "topic_dialogue",
      notes: "Dişil isim. Bağlama göre araç lastiği veya silgi anlamına gelebilir.",
      examples: [{ bg: "Трябва да сменя предната гума.", tr: "Ön lastiği değiştirmem lazım." }]
    }
  ]
};

const indexData = {};
vocabData.words.forEach(w => {
  indexData[w.bg] = w.bg;
  // create some variations
  if (w.bg === "аудитория") indexData["аудиторията"] = w.bg;
  if (w.bg === "етаж") { indexData["етажа"] = w.bg; indexData["етажът"] = w.bg; }
  if (w.bg === "покривка") indexData["покривката"] = w.bg;
  if (w.bg === "редица") indexData["редици"] = w.bg;
  if (w.bg === "прозорец") { indexData["прозорци"] = w.bg; indexData["прозорците"] = w.bg; }
  if (w.bg === "врата") indexData["вратата"] = w.bg;
  if (w.bg === "стена") { indexData["стени"] = w.bg; indexData["стените"] = w.bg; }
  if (w.bg === "таван") indexData["тавана"] = w.bg;
  if (w.bg === "под") indexData["пода"] = w.bg;
  if (w.bg === "дъска") indexData["дъската"] = w.bg;
  if (w.bg === "кабинет") indexData["кабинета"] = w.bg;
  if (w.bg === "име") indexData["името"] = w.bg;
  if (w.bg === "провеждам") indexData["провеждаме"] = w.bg;
  if (w.bg === "сезон") { indexData["сезона"] = w.bg; indexData["сезонът"] = w.bg; indexData["сезони"] = w.bg; indexData["сезоните"] = w.bg; }
  if (w.bg === "ера") indexData["ерата"] = w.bg;
  if (w.bg === "година") { indexData["годината"] = w.bg; indexData["години"] = w.bg; }
  if (w.bg === "мръква") indexData["мръква"] = w.bg;
  if (w.bg === "съмва") indexData["съмва"] = w.bg;
  if (w.bg === "командировка") indexData["командировката"] = w.bg;
  if (w.bg === "счетоводителка") indexData["счетоводителката"] = w.bg;
  if (w.bg === "автосервиз") indexData["автосервиза"] = w.bg;
  if (w.bg === "гума") { indexData["гумата"] = w.bg; indexData["гуми"] = w.bg; }
});

const vocabPath = path.join('D:/bulgarca_sınav_modulu/exam-app/src/data/vocabulary/vocab_ders_6.json');
const indexPath = path.join('D:/bulgarca_sınav_modulu/exam-app/src/data/vocabulary/vocab_ders_6_index.json');

fs.writeFileSync(vocabPath, JSON.stringify(vocabData, null, 2), 'utf8');
fs.writeFileSync(indexPath, JSON.stringify(indexData, null, 2), 'utf8');

console.log('Successfully generated vocab_ders_6.json and its index with highly detailed grammar rules.');
