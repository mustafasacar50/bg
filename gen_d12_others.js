const fs = require('fs');

const updates = [
  {
    bg: "довиждане", type: "zarf",
    examples: [
      { bg: 'Благодаря, <mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">довиждане</mark>!', tr: 'Teşekkürler, <u>hoşça kalın</u>!' },
      { bg: 'Ще се видим утре, <mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">довиждане</mark>.', tr: 'Yarın görüşürüz, <u>görüşmek üzere</u>.' }
    ]
  },
  {
    bg: "такъв", type: "zamir",
    examples: [
      { bg: 'Искам <mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">такъв</mark> телефон.', tr: '<u>Böyle (bunun gibi)</u> bir telefon istiyorum.' },
      { bg: 'Той е <mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">такъв</mark> човек.', tr: 'O <u>böyle</u> bir insandır.' }
    ],
    pronounForms: { "Eril": "такъв", "Dişil": "такава", "Nötr": "такова", "Çoğul": "такива" }
  },
  {
    bg: "се", type: "zamir",
    examples: [
      { bg: 'Той <mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">се</mark> казва Иван.', tr: 'Onun adı İvan (Kendini İvan adlandırıyor).' },
      { bg: 'Аз <mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">се</mark> радвам.', tr: 'Ben seviniyorum.' }
    ]
  },
  {
    bg: "си", type: "zamir",
    examples: [
      { bg: 'Взех <mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">си</mark> чантата.', tr: '<u>Kendi</u> çantamı aldım.' },
      { bg: 'Как <mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">си</mark>?', tr: 'Nasıl<u>sın</u>?' }
    ],
    notes: 'Hem kısa dönüşlü mülkiyet zamiri (kendime ait) hem de 2. tekil şahıs "olmak" fiili (sın) olarak kullanılır.'
  },
  {
    bg: "отново", type: "zarf",
    examples: [
      { bg: 'Ще опитаме <mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">отново</mark>.', tr: '<u>Yeniden (tekrar)</u> deneyeceğiz.' },
      { bg: 'Той дойде <mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">отново</mark>.', tr: 'O <u>tekrar</u> geldi.' }
    ]
  },
  {
    bg: "синьо", type: "sıfat",
    examples: [
      { bg: 'Небето е <mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">синьо</mark>.', tr: 'Gökyüzü <u>mavidir</u>.' },
      { bg: 'Искам <mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">синьо</mark> яке.', tr: '<u>Mavi</u> bir ceket istiyorum.' }
    ],
    nounForms: { "Eril (m)": "син", "Dişil (f)": "синя", "Nötr (n)": "синьо", "Çoğul (pl)": "сини" }
  },
  {
    bg: "над", type: "edat",
    examples: [
      { bg: 'Самолетът лети <mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">над</mark> града.', tr: 'Uçak şehrin <u>üzerinde (yukarısında)</u> uçuyor.' },
      { bg: 'Лампата е <mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">над</mark> масата.', tr: 'Lamba masanın <u>üzerindedir</u>.' }
    ]
  },
  {
    bg: "у", type: "edat",
    examples: [
      { bg: 'Ключовете са <mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">у</mark> мен.', tr: 'Anahtarlar <u>benim yanımda (bende)</u>.' },
      { bg: 'Ще отидем <mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">у</mark> дома.', tr: 'Eve (yuvamıza) gideceğiz.' }
    ]
  },
  {
    bg: "голяма", type: "sıfat",
    examples: [
      { bg: 'Това е <mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">голяма</mark> къща.', tr: 'Bu <u>büyük</u> bir evdir.' },
      { bg: 'Имаме <mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">голяма</mark> отговорност.', tr: '<u>Büyük</u> bir sorumluluğumuz var.' }
    ],
    nounForms: { "Eril (m)": "голям", "Dişil (f)": "голяма", "Nötr (n)": "голямо", "Çoğul (pl)": "големи" }
  },
  {
    bg: "турски", type: "sıfat",
    examples: [
      { bg: 'Уча <mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">турски</mark> език.', tr: '<u>Türk</u> dili öğreniyorum.' },
      { bg: 'Обичам <mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">турски</mark> чай.', tr: '<u>Türk</u> çayını severim.' }
    ],
    nounForms: { "Eril (m)": "турски", "Dişil (f)": "турска", "Nötr (n)": "турско", "Çoğul (pl)": "турски" }
  },
  {
    bg: "мен", type: "zamir",
    examples: [
      { bg: 'Ела с <mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">мен</mark>!', tr: '<u>Benimle</u> gel!' },
      { bg: 'За <mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">мен</mark> това е важно.', tr: '<u>Benim için</u> bu önemlidir.' }
    ],
    pronounForms: { "Yalın Hâl (Ben)": "аз", "İsmin -i Hâli (Beni) - Kısa": "ме", "İsmin -i Hâli (Beni) - Uzun": "мен / мене" }
  },
  {
    bg: "хубаво", type: "sıfat",
    examples: [
      { bg: 'Тук е много <mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">хубаво</mark>.', tr: 'Burası çok <u>güzeldir</u>.' },
      { bg: 'Това е <mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">хубаво</mark> време.', tr: 'Bu <u>güzel</u> bir havadır.' }
    ],
    nounForms: { "Eril (m)": "хубав", "Dişil (f)": "хубава", "Nötr (n)": "хубаво", "Çoğul (pl)": "хубави" }
  },
  {
    bg: "различни", type: "sıfat",
    examples: [
      { bg: 'Ние сме <mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">различни</mark>.', tr: 'Biz <u>farklıyız</u>.' },
      { bg: 'Имаме <mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">различни</mark> мнения.', tr: '<u>Farklı</u> görüşlerimiz var.' }
    ],
    nounForms: { "Eril (m)": "различен", "Dişil (f)": "различна", "Nötr (n)": "различно", "Çoğul (pl)": "различни" }
  },
  {
    bg: "онази", type: "zamir",
    examples: [
      { bg: '<mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">Онази</mark> сграда е нова.', tr: '<u>Şu/O (uzak/dişil)</u> bina yenidir.' }
    ],
    pronounForms: { "Eril (uzak)": "онзи", "Dişil (uzak)": "онази", "Nötr (uzak)": "онова", "Çoğul (uzak)": "онези" }
  },
  {
    bg: "онова", type: "zamir",
    examples: [
      { bg: 'Какво е <mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">онова</mark> дърво?', tr: '<u>Şu/O (uzak/nötr)</u> ağaç nedir?' }
    ],
    pronounForms: { "Eril (uzak)": "онзи", "Dişil (uzak)": "онази", "Nötr (uzak)": "онова", "Çoğul (uzak)": "онези" }
  },
  {
    bg: "онези", type: "zamir",
    examples: [
      { bg: '<mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">Онези</mark> хора са туристи.', tr: '<u>Şu/O (uzak/çoğul)</u> insanlar turisttir.' }
    ],
    pronounForms: { "Eril (uzak)": "онзи", "Dişil (uzak)": "онази", "Nötr (uzak)": "онова", "Çoğul (uzak)": "онези" }
  }
];

fs.writeFileSync('updates_d12_others.json', JSON.stringify(updates, null, 2));
