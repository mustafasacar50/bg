const fs = require('fs');

const updates = [
  {
    bg: "се", type: "zamir",
    examples: [
      { bg: 'Аз <mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">се</mark> казвам Али.', tr: 'Benim adım Ali (Kendimi Ali olarak adlandırıyorum).' },
      { bg: 'Тя <mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">се</mark> мие.', tr: 'O (kendini) yıkıyor.' }
    ],
    notes: 'Dönüşlülük zamiridir (kendini). Birçok fiille birleşerek dönüşlü/edilgen anlam katar (örn: казвам се, радвам се).'
  },
  {
    bg: "го", type: "zamir",
    examples: [
      { bg: 'Аз <mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">го</mark> виждам.', tr: 'Ben <u>onu (eril/nötr)</u> görüyorum.' },
      { bg: 'Познаваш ли <mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">го</mark>?', tr: '<u>Onu</u> tanıyor musun?' }
    ],
    pronounForms: { "Yalın Hâl (Kim/Ne)": "той / то", "İsmin -i Hâli (Kimi) - Kısa": "го", "İsmin -i Hâli (Kimi) - Uzun": "него" },
    notes: '3. Tekil Şahıs Eril (той) ve Nötr (то) zamirlerinin kısa ismin -i (Akuzatif) halidir.'
  },
  {
    bg: "тяхната", type: "zamir",
    examples: [
      { bg: '<mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">Тяхната</mark> къща е голяма.', tr: '<u>Onların (dişil/belirli)</u> evi büyüktür.' },
      { bg: 'Това е <mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">тяхната</mark> кола.', tr: 'Bu <u>onların</u> arabası.' }
    ],
    pronounForms: { "Eril": "техен", "Dişil": "тяхна", "Nötr": "тяхно", "Çoğul": "техни", "Dişil (Belirli)": "тяхната" }
  },
  {
    bg: "такива", type: "zamir",
    examples: [
      { bg: 'Нямам <mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">такива</mark> пари.', tr: 'Bende <u>böyle</u> (o kadar) para yok.' },
      { bg: 'Обичам <mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">такива</mark> книги.', tr: '<u>Böyle/Öylesi (çoğul)</u> kitapları severim.' }
    ],
    pronounForms: { "Eril": "такъв", "Dişil": "такава", "Nötr": "такова", "Çoğul": "такива" }
  },
  {
    bg: "техните", type: "zamir",
    examples: [
      { bg: 'Познавам <mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">техните</mark> приятели.', tr: '<u>Onların (çoğul/belirli)</u> arkadaşlarını tanıyorum.' },
      { bg: '<mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">Техните</mark> деца са малки.', tr: '<u>Onların</u> çocukları küçüktür.' }
    ],
    pronounForms: { "Eril": "техен", "Dişil": "тяхна", "Nötr": "тяхно", "Çoğul": "техни", "Çoğul (Belirli)": "техните" }
  },
  {
    bg: "ги", type: "zamir",
    examples: [
      { bg: 'Аз <mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">ги</mark> обичам.', tr: 'Ben <u>onları</u> seviyorum.' },
      { bg: 'Къде са ключовете? Не <mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">ги</mark> намирам.', tr: 'Anahtarlar nerede? <u>Onları</u> bulamıyorum.' }
    ],
    pronounForms: { "Yalın Hâl (Onlar)": "те", "İsmin -i Hâli (Kimi) - Kısa": "ги", "İsmin -i Hâli (Kimi) - Uzun": "тях" },
    notes: '3. Çoğul Şahıs (те) zamirinin kısa ismin -i (Akuzatif) halidir.'
  },
  {
    bg: "моят", type: "zamir",
    examples: [
      { bg: '<mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">Моят</mark> брат е студент.', tr: '<u>Benim (eril/belirli)</u> erkek kardeşim öğrencidir.' },
      { bg: 'Това е <mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">моят</mark> телефон.', tr: 'Bu <u>benim</u> telefonum.' }
    ],
    pronounForms: { "Eril": "мой", "Dişil": "моя", "Nötr": "мое", "Çoğul": "мои", "Eril (Belirli)": "моят" }
  },
  {
    bg: "моята", type: "zamir",
    examples: [
      { bg: '<mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">Моята</mark> сестра работи тук.', tr: '<u>Benim (dişil/belirli)</u> kız kardeşim burada çalışıyor.' },
      { bg: 'Търся <mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">моята</mark> чанта.', tr: '<u>Benim</u> çantamı arıyorum.' }
    ],
    pronounForms: { "Eril": "мой", "Dişil": "моя", "Nötr": "мое", "Çoğul": "мои", "Dişil (Belirli)": "моята" }
  },
  {
    bg: "която", type: "zamir",
    examples: [
      { bg: 'Жената, <mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">която</mark> пее, е моя приятелка.', tr: 'Şarkı söyleyen <u>(ki o)</u> kadın benim arkadaşımdır.' },
      { bg: 'Книгата, <mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">която</mark> чета, е интересна.', tr: 'Okuduğum <u>(ki o)</u> kitap ilginçtir.' }
    ],
    pronounForms: { "Eril (който)": "който", "Dişil (която)": "която", "Nötr (което)": "което", "Çoğul (които)": "които" }
  },
  {
    bg: "мои", type: "zamir",
    examples: [
      { bg: 'Това са <mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">мои</mark> книги.', tr: 'Bunlar <u>benim (çoğul)</u> kitaplarım.' },
      { bg: 'Имам <mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">мои</mark> правила.', tr: '<u>Benim</u> kurallarım var.' }
    ],
    pronounForms: { "Eril": "мой", "Dişil": "моя", "Nötr": "мое", "Çoğul": "мои", "Çoğul (Belirli)": "моите" }
  },
  {
    bg: "друг", type: "zamir",
    examples: [
      { bg: 'Искам <mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">друг</mark> телефон.', tr: '<u>Başka/Diğer (eril)</u> bir telefon istiyorum.' },
      { bg: 'Той е <mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">друг</mark> човек.', tr: 'O <u>başka</u> bir insan.' }
    ],
    pronounForms: { "Eril": "друг", "Dişil": "друга", "Nötr": "друго", "Çoğul": "други" }
  },
  {
    bg: "другата", type: "zamir",
    examples: [
      { bg: 'Дай ми <mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">другата</mark> химикалка.', tr: 'Bana <u>diğer (dişil/belirli)</u> tükenmez kalemi ver.' },
      { bg: 'Ще дойда през <mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">другата</mark> седмица.', tr: '<u>Diğer (gelecek)</u> hafta geleceğim.' }
    ],
    pronounForms: { "Eril": "друг", "Dişil": "друга", "Nötr": "друго", "Çoğul": "други", "Dişil (Belirli)": "другата" }
  },
  {
    bg: "нейни", type: "zamir",
    examples: [
      { bg: 'Това са <mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">нейни</mark> обувки.', tr: 'Bunlar <u>onun (dişil sahip/çoğul)</u> ayakkabıları.' },
      { bg: 'Познавам <mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">нейни</mark> роднини.', tr: 'Onun akrabalarını tanıyorum.' }
    ],
    pronounForms: { "Eril": "неин", "Dişil": "нейна", "Nötr": "нейно", "Çoğul": "нейни" }
  },
  {
    bg: "онази", type: "zamir",
    examples: [
      { bg: '<mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">Онази</mark> жена е моя леля.', tr: '<u>Şu/O (uzak/dişil)</u> kadın benim teyzemdir.' },
      { bg: 'Помниш ли <mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">онази</mark> вечер?', tr: '<u>O</u> akşamı hatırlıyor musun?' }
    ],
    pronounForms: { "Eril (uzak)": "онзи", "Dişil (uzak)": "онази", "Nötr (uzak)": "онова", "Çoğul (uzak)": "онези" }
  },
  {
    bg: "онова", type: "zamir",
    examples: [
      { bg: 'Какво е <mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">онова</mark> нещо?', tr: '<u>Şu/O (uzak/nötr)</u> şey nedir?' },
      { bg: 'Искам <mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">онова</mark> яке.', tr: '<u>O</u> ceketi istiyorum.' }
    ],
    pronounForms: { "Eril (uzak)": "онзи", "Dişil (uzak)": "онази", "Nötr (uzak)": "онова", "Çoğul (uzak)": "онези" }
  },
  {
    bg: "онези", type: "zamir",
    examples: [
      { bg: 'Кои са <mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">онези</mark> хора?', tr: '<u>Şu/O (uzak/çoğul)</u> insanlar kimlerdir?' },
      { bg: 'Дай ми <mark class="bg-indigo-100/80 text-indigo-700 px-1 rounded">онези</mark> книги.', tr: 'Bana <u>o</u> kitapları ver.' }
    ],
    pronounForms: { "Eril (uzak)": "онзи", "Dişil (uzak)": "онази", "Nötr (uzak)": "онова", "Çoğul (uzak)": "онези" }
  }
];

fs.writeFileSync('updates_d3_pronouns.json', JSON.stringify(updates, null, 2));
