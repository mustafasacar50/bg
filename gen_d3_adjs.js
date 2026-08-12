const fs = require('fs');

const updates = [
  {
    bg: "добър", type: "sıfat",
    examples: [
      { bg: 'Той е много <mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">добър</mark> човек.', tr: 'O çok <u>iyi</u> bir insandır.' },
      { bg: 'Тя има <mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">добро</mark> сърце.', tr: 'Onun <u>iyi</u> bir kalbi vardır.' },
      { bg: 'Те са <mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">добри</mark> студенти.', tr: 'Onlar <u>iyi</u> öğrencilerdir.' }
    ],
    nounForms: { "Eril (m)": "добър", "Dişil (f)": "добра", "Nötr (n)": "добро", "Çoğul (pl)": "добри" }
  },
  {
    bg: "български", type: "sıfat",
    examples: [
      { bg: 'Това е <mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">български</mark> град.', tr: 'Bu bir <u>Bulgar</u> şehridir.' },
      { bg: 'Уча <mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">български</mark> език.', tr: '<u>Bulgar</u> dilini öğreniyorum.' },
      { bg: 'Тя обича <mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">българската</mark> музика.', tr: 'O <u>Bulgar</u> müziğini sever.' }
    ],
    nounForms: { "Eril (m)": "български", "Dişil (f)": "българска", "Nötr (n)": "българско", "Çoğul (pl)": "български" }
  },
  {
    bg: "балкански", type: "sıfat",
    examples: [
      { bg: 'България е <mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">балканска</mark> страна.', tr: 'Bulgaristan bir <u>Balkan</u> ülkesidir.' },
      { bg: 'Харесвам <mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">балканската</mark> кухня.', tr: '<u>Balkan</u> mutfağını beğeniyorum.' }
    ],
    nounForms: { "Eril (m)": "балкански", "Dişil (f)": "балканска", "Nötr (n)": "балканско", "Çoğul (pl)": "балкански" }
  },
  {
    bg: "различни", type: "sıfat",
    examples: [
      { bg: 'Имаме <mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">различни</mark> интереси.', tr: '<u>Farklı</u> ilgi alanlarımız var.' },
      { bg: 'Това е съвсем <mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">различен</mark> проблем.', tr: 'Bu tamamen <u>farklı</u> bir problemdir.' }
    ],
    nounForms: { "Eril (m)": "различен", "Dişil (f)": "различна", "Nötr (n)": "различно", "Çoğul (pl)": "различни" }
  },
  {
    bg: "други", type: "sıfat",
    examples: [
      { bg: 'Имате ли <mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">други</mark> въпроси?', tr: '<u>Başka</u> sorularınız var mı?' },
      { bg: 'Искам <mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">другата</mark> книга.', tr: '<u>Diğer</u> kitabı istiyorum.' }
    ],
    nounForms: { "Eril (m)": "друг", "Dişil (f)": "друга", "Nötr (n)": "друго", "Çoğul (pl)": "други" }
  },
  {
    bg: "турски", type: "sıfat",
    examples: [
      { bg: 'Пия <mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">турско</mark> кафе.', tr: '<u>Türk</u> kahvesi içiyorum.' },
      { bg: 'Тя има <mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">турски</mark> произход.', tr: 'Onun <u>Türk</u> kökeni var.' }
    ],
    nounForms: { "Eril (m)": "турски", "Dişil (f)": "турска", "Nötr (n)": "турско", "Çoğul (pl)": "турски" }
  },
  {
    bg: "родена", type: "sıfat",
    examples: [
      { bg: 'Тя е <mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">родена</mark> в София.', tr: 'O Sofya\'da <u>doğmuştur</u>.' },
      { bg: 'Аз съм <mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">роден</mark> през май.', tr: 'Ben mayısta <u>doğdum</u> (eril konuşan).' }
    ],
    nounForms: { "Eril (m)": "роден", "Dişil (f)": "родена", "Nötr (n)": "родено", "Çoğul (pl)": "родени" }
  },
  {
    bg: "английски", type: "sıfat",
    examples: [
      { bg: 'Той говори <mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">английски</mark> език.', tr: 'O <u>İngiliz</u> dilini konuşuyor.' },
      { bg: 'Имам <mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">английска</mark> кола.', tr: '<u>İngiliz</u> arabam var.' }
    ],
    nounForms: { "Eril (m)": "английски", "Dişil (f)": "английска", "Nötr (n)": "английско", "Çoğul (pl)": "английски" }
  },
  {
    bg: "компютърен", type: "sıfat",
    examples: [
      { bg: 'Тя работи в <mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">компютърна</mark> фирма.', tr: 'O <u>bilgisayar</u> firmasında çalışıyor.' },
      { bg: 'Това е <mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">компютърен</mark> проблем.', tr: 'Bu bir <u>bilgisayar</u> problemidir.' }
    ],
    nounForms: { "Eril (m)": "компютърен", "Dişil (f)": "компютърна", "Nötr (n)": "компютърно", "Çoğul (pl)": "компютърни" }
  },
  {
    bg: "хубаво", type: "sıfat",
    examples: [
      { bg: 'Времето днес е <mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">хубаво</mark>.', tr: 'Bugün hava <u>güzeldir</u>.' },
      { bg: 'Тя е <mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">хубава</mark> жена.', tr: 'O <u>güzel</u> bir kadındır.' }
    ],
    nounForms: { "Eril (m)": "хубав", "Dişil (f)": "хубава", "Nötr (n)": "хубаво", "Çoğul (pl)": "хубави" }
  },
  {
    bg: "строителен", type: "sıfat",
    examples: [
      { bg: 'Той е <mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">строителен</mark> инженер.', tr: 'O bir <u>inşaat</u> mühendisidir.' },
      { bg: 'Работят в <mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">строителна</mark> компания.', tr: 'Bir <u>inşaat</u> şirketinde çalışıyorlar.' }
    ],
    nounForms: { "Eril (m)": "строителен", "Dişil (f)": "строителна", "Nötr (n)": "строително", "Çoğul (pl)": "строителни" }
  },
  {
    bg: "хубава", type: "sıfat",
    examples: [
      { bg: 'Имате много <mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">хубава</mark> къща.', tr: 'Çok <u>güzel</u> bir evin var.' },
      { bg: 'Това е <mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">хубав</mark> филм.', tr: 'Bu <u>güzel</u> bir filmdir.' }
    ],
    nounForms: { "Eril (m)": "хубав", "Dişil (f)": "хубава", "Nötr (n)": "хубаво", "Çoğul (pl)": "хубави" }
  },
  {
    bg: "медицинска", type: "sıfat",
    examples: [
      { bg: 'Тя е <mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">медицинска</mark> сестра.', tr: 'O bir <u>hemşiredir</u> (tıbbi kız kardeş).' },
      { bg: 'Това е <mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">медицински</mark> център.', tr: 'Bu bir <u>tıp/sağlık</u> merkezidir.' }
    ],
    nounForms: { "Eril (m)": "медицински", "Dişil (f)": "медицинска", "Nötr (n)": "медицинско", "Çoğul (pl)": "медицински" }
  },
  {
    bg: "модна", type: "sıfat",
    examples: [
      { bg: 'Работя в <mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">модна</mark> къща.', tr: 'Bir <u>moda</u> evinde çalışıyorum.' },
      { bg: 'Това е <mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">модно</mark> списание.', tr: 'Bu bir <u>moda</u> dergisidir.' }
    ],
    nounForms: { "Eril (m)": "моден", "Dişil (f)": "модна", "Nötr (n)": "модно", "Çoğul (pl)": "модни" }
  },
  {
    bg: "свободното", type: "sıfat",
    examples: [
      { bg: 'Какво правиш през <mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">свободното</mark> си време?', tr: '<u>Boş</u> zamanında ne yaparsın?' },
      { bg: 'Това място <mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">свободно</mark> ли е?', tr: 'Bu yer <u>boş</u> mu?' }
    ],
    nounForms: { "Eril (m)": "свободен", "Dişil (f)": "свободна", "Nötr (n)": "свободно", "Çoğul (pl)": "свободни" }
  },
  {
    bg: "нощен", type: "sıfat",
    examples: [
      { bg: 'Тя работи на <mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">нощна</mark> смяна.', tr: 'O <u>gece</u> vardiyasında çalışıyor.' },
      { bg: 'Това е <mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">нощен</mark> клуб.', tr: 'Bu bir <u>gece</u> kulübüdür.' }
    ],
    nounForms: { "Eril (m)": "нощен", "Dişil (f)": "нощна", "Nötr (n)": "нощно", "Çoğul (pl)": "нощни" }
  },
  {
    bg: "таксиметров", type: "sıfat",
    examples: [
      { bg: 'Той е <mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">таксиметров</mark> шофьор.', tr: 'O bir <u>taksi</u> şoförüdür.' }
    ],
    nounForms: { "Eril (m)": "таксиметров", "Dişil (f)": "таксиметрова", "Nötr (n)": "таксиметрово", "Çoğul (pl)": "таксиметрови" }
  },
  {
    bg: "фризьорски", type: "sıfat",
    examples: [
      { bg: 'Отивам във <mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">фризьорски</mark> салон.', tr: '<u>Kuaför</u> salonuna gidiyorum.' }
    ],
    nounForms: { "Eril (m)": "фризьорски", "Dişil (f)": "фризьорска", "Nötr (n)": "фризьорско", "Çoğul (pl)": "фризьорски" }
  },
  {
    bg: "столичен", type: "sıfat",
    examples: [
      { bg: 'Това е <mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">столичен</mark> вестник.', tr: 'Bu bir <u>başkent (Sofya)</u> gazetesidir.' },
      { bg: 'Тя живее в <mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">столична</mark> община.', tr: 'O <u>büyükşehir (başkent)</u> belediyesinde yaşıyor.' }
    ],
    nounForms: { "Eril (m)": "столичен", "Dişil (f)": "столична", "Nötr (n)": "столично", "Çoğul (pl)": "столични" }
  },
  {
    bg: "черно", type: "sıfat",
    examples: [
      { bg: 'Имам <mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">черно</mark> палто.', tr: '<u>Siyah</u> bir paltom var.' },
      { bg: 'Тя има <mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">черна</mark> коса.', tr: 'Onun <u>siyah</u> saçı var.' }
    ],
    nounForms: { "Eril (m)": "черен", "Dişil (f)": "черна", "Nötr (n)": "черно", "Çoğul (pl)": "черни" }
  },
  {
    bg: "обща", type: "sıfat",
    examples: [
      { bg: 'Имаме <mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">обща</mark> цел.', tr: '<u>Ortak</u> bir amacımız var.' },
      { bg: 'Това е <mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">общ</mark> проблем.', tr: 'Bu <u>genel (ortak)</u> bir sorundur.' }
    ],
    nounForms: { "Eril (m)": "общ", "Dişil (f)": "обща", "Nötr (n)": "общо", "Çoğul (pl)": "общи" }
  },
  {
    bg: "сред", type: "edat",
    examples: [
      { bg: 'Аз съм <mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">сред</mark> приятели.', tr: 'Arkadaşların <u>arasındayım</u>.' },
      { bg: 'Къщата е <mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">сред</mark> гората.', tr: 'Ev ormanın <u>ortasındadır</u>.' }
    ]
  },
  {
    bg: "във", type: "edat",
    examples: [
      { bg: 'Отивам <mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">във</mark> Варна.', tr: 'Varna\'<u>ya</u> gidiyorum.' },
      { bg: 'Ключовете са <mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">във</mark> фурната.', tr: 'Anahtarlar fırının <u>içinde</u>.' }
    ],
    notes: '"във" edatı, kendisinden sonra gelen kelime "в" veya "ф" harfiyle başlıyorsa telaffuz kolaylığı için kullanılır (Normalde "в").'
  }
];

fs.writeFileSync('updates_d3_adjs.json', JSON.stringify(updates, null, 2));
