const fs = require('fs');

// ===================================================================
// MASTER FIX SCRIPT - Ders 1-2 ve Ders 3 için tam audit düzeltmeleri
// ===================================================================

const updates = {

  // ====== ZARFLAR ======
  "много": { type: "zarf", tr: "çok, çok fazla", examples: [
    { bg: "Тя е <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">много</mark> умна.", tr: "O <u>çok</u> akıllı." },
    { bg: "Благодаря <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">много</mark>!", tr: "Çok <u>teşekkürler</u>!" }
  ]},
  "добре": { type: "zarf", tr: "iyi, güzel, tamam", examples: [
    { bg: "Тя говори <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">добре</mark> български.", tr: "O Bulgarca'yı <u>iyi</u> konuşuyor." },
    { bg: "<mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">Добре</mark>, разбрах.", tr: "<u>Tamam</u>, anladım." }
  ]},
  "там": { type: "zarf", tr: "orada, oraya", examples: [
    { bg: "Той е <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">там</mark>.", tr: "O <u>orada</u>." },
    { bg: "Отиди <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">там</mark>.", tr: "<u>Oraya</u> git." }
  ]},
  "още": { type: "zarf", tr: "henüz, hâlâ, daha", examples: [
    { bg: "Той <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">още</mark> спи.", tr: "O <u>hâlâ</u> uyuyor." },
    { bg: "Имаш ли <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">още</mark> въпроси?", tr: "<u>Daha</u> sorun var mı?" }
  ]},
  "сега": { type: "zarf", tr: "şimdi, şu an", examples: [
    { bg: "Аз <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">сега</mark> уча.", tr: "Şu an <u>şimdi</u> çalışıyorum." },
    { bg: "Какво правиш <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">сега</mark>?", tr: "<u>Şimdi</u> ne yapıyorsun?" }
  ]},
  "трудно": { type: "zarf", tr: "zor, güçlükle", examples: [
    { bg: "Езикът е <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">трудно</mark> за учене.", tr: "Dil öğrenmek <u>zordur</u>." },
    { bg: "<mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">Трудно</mark> намирам думата.", tr: "Kelimeyi bulmak <u>güç</u>." }
  ]},
  "дори": { type: "zarf", tr: "bile, hatta", examples: [
    { bg: "Тя <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">дори</mark> не дойде.", tr: "O <u>bile</u> gelmedi." },
    { bg: "<mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">Дори</mark> малко е достатъчно.", tr: "<u>Hatta</u> az bile yeterlidir." }
  ]},
  "интензивно": { type: "zarf", tr: "yoğun şekilde", examples: [
    { bg: "Уча <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">интензивно</mark>.", tr: "<u>Yoğun şekilde</u> çalışıyorum." }
  ]},
  "вече": { type: "zarf", tr: "artık, zaten", examples: [
    { bg: "Той <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">вече</mark> не живее тук.", tr: "O artık burada <u>yaşamıyor</u>." },
    { bg: "<mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">Вече</mark> съм готов.", tr: "<u>Artık</u> hazırım." }
  ]},

  // ====== BAĞLAÇLAR ======
  "не": { type: "bağlaç", tr: "değil, hayır (olumsuzluk)", examples: [
    { bg: "Аз <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">не</mark> разбирам.", tr: "Ben <u>anlamıyorum</u> (anlamıyorum = не)." },
    { bg: "<mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">Не</mark>! Не е вярно.", tr: "<u>Hayır!</u> Bu doğru değil." }
  ]},
  "да": { type: "bağlaç", tr: "evet / -mek için (fiil bağlacı)", notes: "İki temel kullanımı var: 1) Evet anlamında onay bildirmek. 2) Fiilden önce gelip 'mastar' işlevi gören bağlaç (Турски еквивалент: -mek/-mak).", examples: [
    { bg: "<mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">Да</mark>! Разбирам.", tr: "<u>Evet!</u> Anlıyorum." },
    { bg: "Искам <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">да</mark> уча.", tr: "Çalış<u>mak</u> istiyorum." }
  ]},
  "но": { type: "bağlaç", tr: "ama, fakat", examples: [
    { bg: "Обичам да уча, <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">но</mark> времето е малко.", tr: "Çalışmayı seviyorum <u>ama</u> zaman az." },
    { bg: "Той е умен, <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">но</mark> мързелив.", tr: "O akıllı <u>fakat</u> tembel." }
  ]},
  "защото": { type: "bağlaç", tr: "çünkü", examples: [
    { bg: "Уча, <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">защото</mark> обичам езиците.", tr: "Dilleri sevdiğim için çalışıyorum — <u>çünkü</u>." },
    { bg: "Не дойдох, <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">защото</mark> бях болен.", tr: "Hasta olduğum <u>için</u> gelmedim." }
  ]},
  "затова": { type: "bağlaç", tr: "bu yüzden, bu nedenle", examples: [
    { bg: "Няма пари, <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">затова</mark> не купи нищо.", tr: "Parası yoktu, <u>bu yüzden</u> hiçbir şey almadı." }
  ]},
  "ако": { type: "bağlaç", tr: "eğer, şayet", examples: [
    { bg: "<mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">Ако</mark> имаш въпрос, питай.", tr: "Sorun varsa — <u>eğer</u> sorun varsa — sor." },
    { bg: "<mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">Ако</mark> дойдеш, ще те видя.", tr: "<u>Eğer</u> gelirsen, seni görürüm." }
  ]},
  "когато": { type: "bağlaç", tr: "ne zaman, -dığında", examples: [
    { bg: "<mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">Когато</mark> бях малък, играх много.", tr: "Küçük<u>ken</u>, çok oynardım." }
  ]},
  "че": { type: "bağlaç", tr: "ki, -diğini", notes: "Dolaylı anlatım kuran en temel bağlaçtır. Türkçede '-diğini/-eceğini' çevrilir.", examples: [
    { bg: "Знам, <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">че</mark> си добър студент.", tr: "İyi bir öğrenci olduğunu biliyorum — <u>ki</u> iyi bir öğrenci." },
    { bg: "Мисля, <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">че</mark> е вярно.", tr: "Bunun doğru olduğunu düşünüyorum." }
  ]},

  // ====== EDATLAR ======
  "между": { type: "edat", tr: "arasında", examples: [
    { bg: "Столът е <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">между</mark> масата и вратата.", tr: "Sandalye masa <u>ile</u> kapı <u>arasında</u>." },
    { bg: "<mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">Между</mark> нас няма тайни.", tr: "Bizim <u>aramızda</u> sır yok." }
  ]},
  "преди": { type: "edat", tr: "önce, -den önce", examples: [
    { bg: "<mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">Преди</mark> вечеря ще се обадя.", tr: "Akşam yemeğin<u>den önce</u> arayacağım." },
    { bg: "<mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">Преди</mark> работата пих кафе.", tr: "İş<u>ten önce</u> kahve içtim." }
  ]},
  "като": { type: "edat", tr: "gibi, olarak", examples: [
    { bg: "Работи <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">като</mark> учител.", tr: "Öğretmen <u>olarak</u> çalışıyor." },
    { bg: "Тя пее <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">като</mark> ангел.", tr: "O bir melek <u>gibi</u> şarkı söylüyor." }
  ]},
  "със": { type: "edat", tr: "ile, birlikte (s/z ile başlayan kelimelerden önce)", notes: "'С' edatının sibilant (s/z/ш) harflerle başlayan kelimelerden önce kullanılan biçimidir. Telaffuz kolaylığı için ünsüz benzeşmesi kuralı.", examples: [
    { bg: "Чай <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">със</mark> захар.", tr: "Şekerli çay (şeker <u>ile</u> çay)." },
    { bg: "Говоря <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">със</mark> сестра ми.", tr: "Kız kardeşim<u>le</u> konuşuyorum." }
  ]},

  // ====== FİİLLER ======
  "има": { type: "fiil", tr: "var (sahip)", conjugation: {
    "present": { "аз": "имам", "ти": "имаш", "той/тя/то": "има", "ние": "имаме", "вие": "имате", "те": "имат" }
  }, examples: [
    { bg: "В стаята <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">има</mark> маса.", tr: "Odada masa <u>var</u>." },
    { bg: "Той <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">има</mark> нова кола.", tr: "Onun yeni bir arabası <u>var</u>." }
  ]},
  "имаме": { type: "fiil", tr: "sahibiz / var (biz)", conjugation: {
    "present": { "аз": "имам", "ти": "имаш", "той/тя/то": "има", "ние": "имаме", "вие": "имате", "те": "имат" }
  }, examples: [
    { bg: "<mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">Имаме</mark> нова колежка.", tr: "Yeni bir kadın meslektaşımız <u>var</u>." }
  ]},
  "имате": { type: "fiil", tr: "sahipsiniz", conjugation: {
    "present": { "аз": "имам", "ти": "имаш", "той/тя/то": "има", "ние": "имаме", "вие": "имате", "те": "имат" }
  }, examples: [
    { bg: "<mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">Имате</mark> ли въпрос?", tr: "Sorunuz <u>var mı</u>?" }
  ]},
  "могат": { type: "fiil", tr: "yapabilirler", conjugation: {
    "present": { "аз": "мога", "ти": "можеш", "той/тя/то": "може", "ние": "можем", "вие": "можете", "те": "могат" }
  }, examples: [
    { bg: "Те <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">могат</mark> да помогнат.", tr: "Onlar yardım ede<u>bilirler</u>." }
  ]},
  "работя": { type: "fiil", tr: "çalışıyorum", conjugation: {
    "present": { "аз": "работя", "ти": "работиш", "той/тя/то": "работи", "ние": "работим", "вие": "работите", "те": "работят" }
  }, examples: [
    { bg: "Аз <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">работя</mark> всеки ден.", tr: "Ben her gün <u>çalışıyorum</u>." }
  ]},
  "имам": { type: "fiil", tr: "var (bende), sahip olmak", conjugation: {
    "present": { "аз": "имам", "ти": "имаш", "той/тя/то": "има", "ние": "имаме", "вие": "имате", "те": "имат" }
  }, examples: [
    { bg: "Аз <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">имам</mark> много приятели.", tr: "Benim çok arkadaşım <u>var</u>." }
  ]},
  "граничи": { type: "fiil", tr: "sınır komşusu oluyor", conjugation: {
    "present": { "аз": "гранича", "ти": "граничиш", "той/тя/то": "граничи", "ние": "граничим", "вие": "граничите", "те": "граничат" }
  }, examples: [
    { bg: "България <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">граничи</mark> с Гърция.", tr: "Bulgaristan Yunanistan ile <u>sınır komşusudur</u>." }
  ]},
  "учи": { type: "fiil", tr: "öğreniyor / okuyor", conjugation: {
    "present": { "аз": "уча", "ти": "учиш", "той/тя/то": "учи", "ние": "учим", "вие": "учите", "те": "учат" }
  }, examples: [
    { bg: "Тя <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">учи</mark> медицина.", tr: "O tıp <u>okuyor</u>." },
    { bg: "Той <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">учи</mark> много.", tr: "O çok <u>çalışıyor</u>." }
  ]},
  "радвам": { type: "fiil", tr: "sevinmek (- се: sevinirim)", conjugation: {
    "present": { "аз": "радвам се", "ти": "радваш се", "той/тя/то": "радва се", "ние": "радваме се", "вие": "радвате се", "те": "радват се" }
  }, notes: "Dönüşlü fiildir. Daima 'се' zamiriyle kullanılır.", examples: [
    { bg: "<mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">Радвам се</mark> да се запозная.", tr: "Tanıştığımıza <u>sevindim</u>." }
  ]},
  "надявам": { type: "fiil", tr: "umut etmek (-се: umuyorum)", conjugation: {
    "present": { "аз": "надявам се", "ти": "надяваш се", "той/тя/то": "надява се", "ние": "надяваме се", "вие": "надявате се", "те": "надяват се" }
  }, notes: "Dönüşlü fiildir. Daima 'се' zamiriyle kullanılır.", examples: [
    { bg: "<mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">Надявам се</mark> да се видим скоро.", tr: "Yakında görüşeceğimizi <u>umuyorum</u>." }
  ]},
  "запознахме": { type: "fiil", tr: "tanıştık", conjugation: {
    "present": { "аз": "запознавам се", "ти": "запознаваш се", "той/тя/то": "запознава се", "ние": "запознаваме се", "вие": "запознавате се", "те": "запознават се" }
  }, examples: [
    { bg: "Приятно ни беше, че се <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">запознахме</mark>.", tr: "<u>Tanıştığımıza</u> sevindik." }
  ]},
  "обичате": { type: "fiil", tr: "seviyorsunuz", conjugation: {
    "present": { "аз": "обичам", "ти": "обичаш", "той/тя/то": "обича", "ние": "обичаме", "вие": "обичате", "те": "обичат" }
  }, examples: [
    { bg: "Какво <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">обичате</mark> да правите?", tr: "Yapmayı ne <u>seversiniz</u>?" }
  ]},
  "обадете": { type: "fiil", tr: "arayın (telefon), haber verin (emir)", conjugation: {
    "present": { "аз": "обадя се", "ти": "обадиш се", "той/тя/то": "обади се", "ние": "обадим се", "вие": "обадете се", "те": "обадят се" }
  }, examples: [
    { bg: "<mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">Обадете</mark> ми се!", tr: "Beni <u>arayın</u>!" }
  ]},
  "елате": { type: "fiil", tr: "gelin (emir, çoğul)", conjugation: {
    "present": { "аз": "ела (gel)", "ти": "ела", "той/тя/то": "нека дойде", "ние": "хайде да дойдем", "вие": "елате", "те": "нека дойдат" }
  }, examples: [
    { bg: "<mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">Елате</mark> при нас!", tr: "Bize <u>gelin</u>!" }
  ]},
  "срещнат": { type: "fiil", tr: "karşılaşırlar", conjugation: {
    "present": { "аз": "срещам", "ти": "срещаш", "той/тя/то": "среща", "ние": "срещаме", "вие": "срещате", "те": "срещат" }
  }, examples: [
    { bg: "Те ще се <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">срещнат</mark> в парка.", tr: "Onlar parkta <u>karşılaşacaklar</u>." }
  ]},
  "видим": { type: "fiil", tr: "görelim", conjugation: {
    "present": { "аз": "виждам", "ти": "виждаш", "той/тя/то": "вижда", "ние": "виждаме", "вие": "виждате", "те": "виждат" }
  }, examples: [
    { bg: "Надявам се да се <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">видим</mark>.", tr: "Görüşmeyi umuyorum — <u>görelim</u>." }
  ]},
  "мечтае": { type: "fiil", tr: "hayal ediyor" },

  // ====== İSİMLER ======
  "вестник": { type: "isim", tr: "gazete", gender: "eril", nounForms: { "tekil": "вестник", "çoğul": "вестници" }, examples: [
    { bg: "Купих <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">вестник</mark>.", tr: "Bir <u>gazete</u> aldım." }
  ]},
  "телевизия": { type: "isim", tr: "televizyon", gender: "dişil", nounForms: { "tekil": "телевизия", "çoğul": "телевизии" }, examples: [
    { bg: "Гледам <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">телевизия</mark> вечер.", tr: "Akşamları <u>televizyon</u> izlerim." }
  ]},
  "море": { type: "isim", tr: "deniz", gender: "nötr", nounForms: { "tekil": "море", "çoğul": "морета" }, examples: [
    { bg: "Обичам <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">морето</mark>.", tr: "<u>Denizi</u> severim." }
  ]},
  "граница": { type: "isim", tr: "sınır", gender: "dişil", nounForms: { "tekil": "граница", "çoğul": "граници" }, examples: [
    { bg: "България има обща <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">граница</mark> с Турция.", tr: "Bulgaristan'ın Türkiye ile ortak bir <u>sınırı</u> var." }
  ]},
  "гора": { type: "isim", tr: "orman, dağ", gender: "dişil", nounForms: { "tekil": "гора", "çoğul": "гори" }, examples: [
    { bg: "Разхождаме се в <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">гората</mark>.", tr: "<u>Ormanda</u> yürüyoruz." }
  ]},
  "стоматология": { type: "isim", tr: "stomatoji, diş hekimliği", gender: "dişil", nounForms: { "tekil": "стоматология" }, examples: [
    { bg: "Той учи <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">стоматология</mark>.", tr: "<u>Diş hekimliği</u> okuyor." }
  ]},
  "журналистика": { type: "isim", tr: "gazetecilik", gender: "dişil", nounForms: { "tekil": "журналистика" }, examples: [
    { bg: "Тя е студентка по <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">журналистика</mark>.", tr: "O <u>gazetecilik</u> öğrencisidir." }
  ]},
  "репортер": { type: "isim", tr: "muhabir, reporter", gender: "eril", nounForms: { "tekil": "репортер", "çoğul": "репортери" }, examples: [
    { bg: "Тя е <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">репортер</mark> в телевизията.", tr: "O televizyonda <u>muhabirdir</u>." }
  ]},
  "специалист": { type: "isim", tr: "uzman", gender: "eril", nounForms: { "tekil": "специалист", "çoğul": "специалисти" }, examples: [
    { bg: "Той е <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">специалист</mark> по компютри.", tr: "O bilgisayar <u>uzmanıdır</u>." }
  ]},
  "мама": { type: "isim", tr: "anne (hitap)", gender: "dişil", nounForms: { "tekil": "мама", "çoğul": "мами" }, notes: "Майка (anne) kelimesinin daha samimi, gündelik kullanımıdır.", examples: [
    { bg: "<mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">Мамо</mark>, ела тук!", tr: "<u>Anne</u>, buraya gel!" }
  ]},
  "татко": { type: "isim", tr: "baba (hitap)", gender: "eril", nounForms: { "tekil": "татко", "çoğul": "татковци" }, notes: "Баща (baba) kelimesinin daha samimi, gündelik kullanımıdır.", examples: [
    { bg: "<mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">Татко</mark>, кога ще дойдеш?", tr: "<u>Baba</u>, ne zaman geleceksin?" }
  ]},
  "гости": { type: "isim", tr: "misafirler, konuklar", gender: "eril", nounForms: { "tekil": "гост", "çoğul": "гости" }, examples: [
    { bg: "Ще дойдат <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">гости</mark>.", tr: "<u>Misafirler</u> gelecek." }
  ]},
  "приятелка": { type: "isim", tr: "kız arkadaş, kadın dost", gender: "dişil", nounForms: { "tekil": "приятелка", "çoğul": "приятелки" }, examples: [
    { bg: "Тя е моята <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">приятелка</mark>.", tr: "O benim <u>kız arkadaşım</u>." }
  ]},
  "радиостанции": { type: "isim", tr: "radyo istasyonları", gender: "dişil", nounForms: { "tekil": "радиостанция", "çoğul": "радиостанции" }, examples: [
    { bg: "Слушам различни <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">радиостанции</mark>.", tr: "Farklı <u>radyo istasyonları</u> dinlerim." }
  ]},
  "лекциите": { type: "isim", tr: "dersler (belirli, çoğul)", gender: "dişil", nounForms: { "tekil": "лекция", "çoğul": "лекции", "çoğul_belirli": "лекциите" }, examples: [
    { bg: "<mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">Лекциите</mark> започват в 9.", tr: "<u>Dersler</u> saat 9'da başlıyor." }
  ]},
  "колегите": { type: "isim", tr: "meslektaşlar (belirli)", gender: "eril", nounForms: { "tekil": "колега", "çoğul": "колеги", "çoğul_belirli": "колегите" }, examples: [
    { bg: "<mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">Колегите</mark> ми са много добри.", tr: "<u>Meslektaşlarım</u> çok iyidir." }
  ]},
  "градове": { type: "isim", tr: "şehirler", gender: "eril", nounForms: { "tekil": "град", "çoğul": "градове" }, examples: [
    { bg: "Обичам да посещавам нови <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">градове</mark>.", tr: "Yeni <u>şehirler</u> ziyaret etmeyi severim." }
  ]},
  "възможност": { type: "isim", tr: "imkân, fırsat", gender: "dişil", nounForms: { "tekil": "възможност", "çoğul": "възможности" }, examples: [
    { bg: "Имам <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">възможност</mark> да уча.", tr: "Okuma <u>imkânım</u> var." }
  ]},
  "хора": { type: "isim", tr: "insanlar", gender: "eril", nounForms: { "tekil": "човек", "çoğul": "хора", "çoğul_belirli": "хората" }, notes: "Düzensiz çoğul: човек (insan) → хора (insanlar). 'Hора' tamamen farklı bir kök formudur.", examples: [
    { bg: "Много <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">хора</mark> учат езици.", tr: "Pek çok <u>insan</u> dil öğreniyor." }
  ]},
  "телефона": { type: "isim", tr: "telefonu (belirli, dolaylı)", gender: "eril", nounForms: { "tekil": "телефон", "belirli": "телефонът / телефона", "çoğul": "телефони" }, notes: "Telefon (eril) → Özne: телефонът, Nesne: телефона. Bu formu nesne olarak kullanılır.", examples: [
    { bg: "Дай ми <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">телефона</mark>.", tr: "<u>Telefonu</u> ver bana." }
  ]},

  // ====== SIFATLAR ======
  "балкански": { type: "sıfat", tr: "Balkan (eril/çoğul)", forms: { "eril": "балкански", "dişil": "балканска", "nötr": "балканско", "çoğul": "балкanski" }, examples: [
    { bg: "България е <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">балканска</mark> страна.", tr: "Bulgaristan bir <u>Balkan</u> ülkesidir." }
  ]},
  "приятен": { type: "sıfat", tr: "hoş, güzel, memnun edici", forms: { "eril": "приятен", "dişil": "приятна", "nötr": "приятно", "çoğul": "приятни" }, examples: [
    { bg: "Срещата беше много <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">приятна</mark>.", tr: "Toplantı çok <u>güzeldi</u>." },
    { bg: "Той е <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">приятен</mark> човек.", tr: "O <u>hoş</u> bir insandır." }
  ]},
  "различни": { type: "sıfat", tr: "farklı, çeşitli (çoğul)", forms: { "eril": "различен", "dişil": "различна", "nötr": "различно", "çoğul": "различни" }, examples: [
    { bg: "Имаме <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">различни</mark> интереси.", tr: "<u>Farklı</u> ilgi alanlarımız var." }
  ]},
  "столичен": { type: "sıfat", tr: "başkente ait", forms: { "eril": "столичен", "dişil": "столична", "nötr": "столично", "çoğul": "столични" }, examples: [
    { bg: "Те работят в <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">столично</mark> училище.", tr: "Başkent okulunda çalışıyorlar." }
  ]},
  "обща": { type: "sıfat", tr: "ortak (dişil)", forms: { "eril": "общ", "dişil": "обща", "nötr": "общо", "çoğul": "общи" }, examples: [
    { bg: "Имаме <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">обща</mark> граница.", tr: "<u>Ortak</u> sınırımız var." }
  ]},
  "турски": { type: "sıfat", tr: "Türk (eril/çoğul)", forms: { "eril": "турски", "dişil": "турска", "nötr": "турско", "çoğul": "турски" }, examples: [
    { bg: "Говоря <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">турски</mark> език.", tr: "<u>Türkçe</u> konuşuyorum." }
  ]},
  "английски": { type: "sıfat", tr: "İngiliz, İngilizce (eril/çoğul)", forms: { "eril": "английски", "dişil": "английска", "nötr": "английско", "çoğul": "английски" }, examples: [
    { bg: "Уча <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">английски</mark> език.", tr: "<u>İngilizce</u> dil öğreniyorum." }
  ]},
  "французки": { type: "sıfat", tr: "Fransız, Fransızca (eril/çoğul)", forms: { "eril": "французки", "dişil": "французка", "nötr": "французко", "çoğul": "французки" }, examples: [
    { bg: "Тя говори <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">французки</mark>.", tr: "O <u>Fransızca</u> konuşuyor." }
  ]},
  "компютърен": { type: "sıfat", tr: "bilgisayarla ilgili, bilgisayar (eril)", forms: { "eril": "компютърен", "dişil": "компютърна", "nötr": "компютърно", "çoğul": "компютърни" }, examples: [
    { bg: "Той е <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">компютърен</mark> специалист.", tr: "O bir bilgisayar uzmanıdır." }
  ]},
  "родена": { type: "sıfat", tr: "doğmuş (dişil)", forms: { "eril": "роден", "dişil": "родена", "nötr": "родено", "çoğul": "родени" }, examples: [
    { bg: "Тя е <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">родена</mark> в София.", tr: "O Sofya'da <u>doğmuş</u>." }
  ]},
  "строителен": { type: "sıfat", tr: "inşaat (eril)", forms: { "eril": "строителен", "dişil": "строителна", "nötr": "строително", "çoğul": "строителни" }, examples: [
    { bg: "Работи в <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">строителна</mark> фирма.", tr: "Bir <u>inşaat</u> firmasında çalışıyor." }
  ]},

  // ====== ÖZEL İSİMLER (ülkeler, isimler) ======
  "италия": { type: "isim", tr: "İtalya", gender: "dişil", nounForms: { "tekil": "Италия" }, examples: [
    { bg: "<mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">Италия</mark> е красива страна.", tr: "<u>İtalya</u> güzel bir ülkedir." }
  ]},
  "русия": { type: "isim", tr: "Rusya", gender: "dişil", nounForms: { "tekil": "Русия" }, examples: [
    { bg: "<mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">Русия</mark> е най-голямата страна в света.", tr: "<u>Rusya</u> dünyanın en büyük ülkesidir." }
  ]},
  "франция": { type: "isim", tr: "Fransa", gender: "dişil", nounForms: { "tekil": "Франция" }, examples: [
    { bg: "Париж е столицата на <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">Франция</mark>.", tr: "Paris, <u>Fransa'nın</u> başkentidir." }
  ]},
  "германия": { type: "isim", tr: "Almanya", gender: "dişil", nounForms: { "tekil": "Германия" }, examples: [
    { bg: "<mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">Германия</mark> е в Западна Европа.", tr: "<u>Almanya</u> Batı Avrupa'dadır." }
  ]},
  "унгария": { type: "isim", tr: "Macaristan", gender: "dişil", nounForms: { "tekil": "Унгария" }, examples: [
    { bg: "<mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">Унгария</mark> е в Централна Европа.", tr: "<u>Macaristan</u> Orta Avrupa'dadır." }
  ]},
  "австралия": { type: "isim", tr: "Avustralya", gender: "dişil", nounForms: { "tekil": "Австралия" }, examples: [
    { bg: "<mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">Австралия</mark> е голям континент.", tr: "<u>Avustralya</u> büyük bir kıtadır." }
  ]},
  "канада": { type: "isim", tr: "Kanada", gender: "dişil", nounForms: { "tekil": "Канада" }, examples: [
    { bg: "<mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">Канада</mark> е до Съединените щати.", tr: "<u>Kanada</u>, Amerika Birleşik Devletleri'nin yanındadır." }
  ]},
  "аржентина": { type: "isim", tr: "Arjantin", gender: "dişil", nounForms: { "tekil": "Аржентина" }, examples: [
    { bg: "<mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">Аржентина</mark> е в Южна Америка.", tr: "<u>Arjantin</u> Güney Amerika'dadır." }
  ]},
  "украйна": { type: "isim", tr: "Ukrayna", gender: "dişil", nounForms: { "tekil": "Украйна" }, examples: [
    { bg: "<mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">Украйна</mark> граничи с Румъния.", tr: "<u>Украyna</u> Romanya ile sınır komşusudur." }
  ]},
  "румъния": { type: "isim", tr: "Romanya", gender: "dişil", nounForms: { "tekil": "Румъния" }, examples: [
    { bg: "<mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">Румъния</mark> е на север от България.", tr: "<u>Romanya</u>, Bulgaristan'ın kuzeyindedir." }
  ]},
  "словения": { type: "isim", tr: "Slovenya", gender: "dişil", nounForms: { "tekil": "Словения" }, examples: [
    { bg: "<mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">Словения</mark> е малка, но красива страна.", tr: "<u>Slovenya</u> küçük ama güzel bir ülkedir." }
  ]},
  "армения": { type: "isim", tr: "Ermenistan", gender: "dişil", nounForms: { "tekil": "Армения" }, examples: [
    { bg: "<mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">Армения</mark> е малка страна.", tr: "<u>Ermenistan</u> küçük bir ülkedir." }
  ]},
  "грузия": { type: "isim", tr: "Gürcistan", gender: "dişil", nounForms: { "tekil": "Грузия" }, examples: [
    { bg: "<mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">Грузия</mark> е на Кавказ.", tr: "<u>Gürcistan</u> Kafkasya'dadır." }
  ]},
  "сирия": { type: "isim", tr: "Suriye", gender: "dişil", nounForms: { "tekil": "Сирия" }, examples: [
    { bg: "<mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">Сирия</mark> е в Близкия изток.", tr: "<u>Suriye</u> Orta Doğu'dadır." }
  ]},
  "ирак": { type: "isim", tr: "Irak", gender: "eril", nounForms: { "tekil": "Ирак" }, examples: [
    { bg: "<mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">Ирак</mark> е в Близкия изток.", tr: "<u>Irak</u> Orta Doğu'dadır." }
  ]},
  "иран": { type: "isim", tr: "İran", gender: "eril", nounForms: { "tekil": "Иран" }, examples: [
    { bg: "<mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">Иран</mark> е голяма страна.", tr: "<u>İran</u> büyük bir ülkedir." }
  ]},
  "сащ": { type: "isim", tr: "ABD (Amerika Birleşik Devletleri)", notes: "САЩ = Съединените американски щати", examples: [
    { bg: "<mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">САЩ</mark> са много голяма страна.", tr: "<u>ABD</u> çok büyük bir ülkedir." }
  ]},

  // ====== YÖN/COĞRAFYA kelimeleri ======
  "север": { type: "isim", tr: "kuzey", gender: "eril", nounForms: { "tekil": "север" }, examples: [
    { bg: "Румъния е на <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">север</mark> от България.", tr: "Romanya Bulgaristan'ın <u>kuzeyindedir</u>." }
  ]},
  "юг": { type: "isim", tr: "güney", gender: "eril", nounForms: { "tekil": "юг" }, examples: [
    { bg: "Гърция е на <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">юг</mark>.", tr: "Yunanistan <u>güneyde</u>dir." }
  ]},
  "изток": { type: "isim", tr: "doğu", gender: "eril", nounForms: { "tekil": "изток" }, examples: [
    { bg: "Слънцето изгрява на <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">изток</mark>.", tr: "Güneş <u>doğuda</u> yükseliyor." }
  ]},
  "запад": { type: "isim", tr: "batı", gender: "eril", nounForms: { "tekil": "запад" }, examples: [
    { bg: "Слънцето залязва на <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">запад</mark>.", tr: "Güneş <u>batıda</u> batıyor." }
  ]},
  "югоизток": { type: "isim", tr: "güneydoğu", gender: "eril", nounForms: { "tekil": "югоизток" }, examples: [
    { bg: "Турция е на <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">югоизток</mark>.", tr: "Türkiye <u>güneydoğuda</u>dır." }
  ]},
  "североизток": { type: "isim", tr: "kuzeydoğu", gender: "eril", nounForms: { "tekil": "североизток" }, examples: [
    { bg: "Черно море е на <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">североизток</mark>.", tr: "Karadeniz <u>kuzeydoğuda</u>dır." }
  ]},
  "северозапад": { type: "isim", tr: "kuzeybatı", gender: "eril", nounForms: { "tekil": "северозапад" }, examples: [
    { bg: "Сърбия е на <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">северозапад</mark>.", tr: "Sırbistan <u>kuzeybatıda</u>dır." }
  ]},

  // ====== DİĞER ÖNEMLİ KELİMELER ======
  "ще": { type: "fiil", tr: "-(e)cek/-acak (gelecek zaman yardımcısı)", notes: "Bulgarcada gelecek zamanı oluşturan yardımcı kelimedir. Değişmez formda tüm şahıslar için aynı kullanılır: ще + fiil.", examples: [
    { bg: "Аз <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">ще</mark> дойда утре.", tr: "Ben yarın <u>geleceğim</u>." },
    { bg: "Те <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">ще</mark> учат.", tr: "Onlar <u>çalışacaklar</u>." }
  ]},
  "малко": { type: "zarf", tr: "biraz, az miktarda", examples: [
    { bg: "Дай ми <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">малко</mark> вода.", tr: "Bana <u>biraz</u> su ver." },
    { bg: "Говоря <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">малко</mark> български.", tr: "<u>Biraz</u> Bulgarca konuşuyorum." }
  ]},
  "всеки": { type: "zamir", tr: "her, herkes (eril)", examples: [
    { bg: "<mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">Всеки</mark> ден уча.", tr: "<u>Her</u> gün çalışıyorum." },
    { bg: "<mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">Всеки</mark> може да учи.", tr: "<u>Herkes</u> öğrenebilir." }
  ]},
  "госпожо": { type: "isim", tr: "Bayan... (seslenme hali)", notes: "Госпожа kelimesinin seslenme (vocative) halidir. Birisine seslenmek için kullanılır: Госпожо Иванова! = Sayın Bayan Ivanova!", examples: [
    { bg: "<mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">Госпожо</mark> Николова, добре дошла!", tr: "Sayın <u>Bayan</u> Nikolova, hoş geldiniz!" }
  ]},
  "довиждане": { type: "zarf", tr: "hoşça kalın, güle güle", examples: [
    { bg: "<mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">Довиждане</mark>! До утре!", tr: "<u>Güle güle!</u> Yarına kadar!" }
  ]},
  "запишете": { type: "fiil", tr: "yazın (not alın, kaydedin) - emir", conjugation: {
    "present": { "аз": "запиша", "ти": "запишеш", "той/тя/то": "запише", "ние": "запишем", "вие": "запишете", "те": "запишат" }
  }, examples: [
    { bg: "Моля, <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">запишете</mark> домашното.", tr: "Lütfen ödevi <u>yazın</u>." }
  ]},
  "прочете": { type: "fiil", tr: "okusun / okuyup bitirsin", conjugation: {
    "present": { "аз": "прочета", "ти": "прочетеш", "той/тя/то": "прочете", "ние": "прочетем", "вие": "прочетете", "те": "прочетат" }
  }, examples: [
    { bg: "Моля, <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">прочете</mark> текста.", tr: "Lütfen metni <u>okuyun</u>." }
  ]},
  "представя": { type: "fiil", tr: "tanıtıyor, sunuyor", conjugation: {
    "present": { "аз": "представям", "ти": "представяш", "той/тя/то": "представя", "ние": "представяме", "вие": "представяте", "те": "представят" }
  }, examples: [
    { bg: "Позволете ми да ви <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">представя</mark>.", tr: "Sizi <u>tanıştırmama</u> izin verin." }
  ]},
  "разрешете": { type: "fiil", tr: "izin verin (emir)", conjugation: {
    "present": { "аз": "разреша", "ти": "разрешиш", "той/тя/то": "разреши", "ние": "разрешим", "вие": "разрешите", "те": "разрешат" }
  }, examples: [
    { bg: "<mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">Разрешете</mark> ми да се представя.", tr: "Kendimi tanıtmama <u>izin verin</u>." }
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
    console.log('✓ Fixed ' + count + ' words in ' + filename);
  }
}

processFile('src/data/vocabulary/vocab_ders_1_2.json');
processFile('src/data/vocabulary/vocab_ders_3.json');
console.log('Master fix complete.');
