const fs = require('fs');

const dativeShort = { "аз": "ми", "ти": "ти", "той": "му", "тя": "ѝ / и", "то": "му", "ние": "ни", "вие": "ви", "те": "им" };
const accusativeShort = { "аз": "ме", "ти": "те", "той": "го", "тя": "я", "то": "го", "ние": "ни", "вие": "ви", "те": "ги" };
const accusativeLong = { "аз": "мен / мене", "ти": "теб / тебе", "той": "него", "тя": "нея", "то": "него", "ние": "нас", "вие": "вас", "те": "тях" };

const updates = {
  // Dative short
  "ми": { type: "zamir", pronounForms: dativeShort, examples: [{ bg: "Приятно <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">ми</mark> е.", tr: "<u>Bana</u> hoştur (Memnun oldum)." }, { bg: "Дай <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">ми</mark> книгата.", tr: "Kitabı <u>bana</u> ver." }] },
  "ти": { type: "zamir", pronounForms: dativeShort },
  "му": { type: "zamir", pronounForms: dativeShort, examples: [{ bg: "Дадох <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">му</mark> парите.", tr: "Parayı <u>ona (erkek)</u> verdim." }, { bg: "Колата <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">му</mark> е нова.", tr: "<u>Onun</u> arabası yenidir." }] },
  "ѝ": { type: "zamir", pronounForms: dativeShort },
  "и": { type: "zamir", notes: "Hem 've' bağlacı hem de 'ona (dişil)' kısa zamiri olarak kullanılabilir." },
  "ни": { type: "zamir", pronounForms: dativeShort, examples: [{ bg: "Това е къщата <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">ни</mark>.", tr: "Bu <u>bizim</u> evimizdir." }] },
  "ви": { type: "zamir", pronounForms: dativeShort, examples: [{ bg: "Как <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">ви</mark> е името?", tr: "<u>Sizin</u> adınız nedir?" }] },
  "им": { type: "zamir", pronounForms: dativeShort, examples: [{ bg: "Казах <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">им</mark> истината.", tr: "<u>Onlara</u> gerçeği söyledim." }] },

  // Accusative short
  "ме": { type: "zamir", pronounForms: accusativeShort, examples: [{ bg: "Тя <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">ме</mark> вика.", tr: "O <u>beni</u> çağırıyor." }] },
  "те": { type: "zamir", pronounForms: accusativeShort },
  "го": { type: "zamir", pronounForms: accusativeShort, examples: [{ bg: "Видях <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">го</mark> вчера.", tr: "Dün <u>onu (erkek)</u> gördüm." }] },
  "я": { type: "zamir", pronounForms: accusativeShort, examples: [{ bg: "Не <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">я</mark> познавам.", tr: "<u>Onu (kadın)</u> tanımıyorum." }] },
  "ги": { type: "zamir", pronounForms: accusativeShort, examples: [{ bg: "Чувам <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">ги</mark>.", tr: "<u>Onları</u> duyuyorum." }] },

  // Long pronouns
  "мен": { type: "zamir", pronounForms: accusativeLong, examples: [{ bg: "Това е за <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">мен</mark>.", tr: "Bu <u>benim</u> içindir." }] },
  "теб": { type: "zamir", pronounForms: accusativeLong },
  "нас": { type: "zamir", pronounForms: accusativeLong, examples: [{ bg: "Елате при <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">нас</mark>.", tr: "<u>Bize (yanımıza)</u> gelin." }] },
  "вас": { type: "zamir", pronounForms: accusativeLong },

  // Prepositions / Question words
  "от": { type: "edat", notes: "-den / -dan ayrılma hali veya aidiyet bildirir.", examples: [{ bg: "Аз съм <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">от</mark> България.", tr: "Ben Bulgaristan'<u>danım</u>." }, { bg: "Това е писмо <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">от</mark> брат ми.", tr: "Bu kardeşim<u>den</u> bir mektup." }] },
  "откъде": { type: "soru", examples: [{ bg: "<mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">Откъде</mark> сте?", tr: "<u>Nereden</u>siniz?" }, { bg: "<mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">Откъде</mark> идваш?", tr: "<u>Nereden</u> geliyorsun?" }] },
  "от кого": { type: "soru", examples: [{ bg: "<mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">От кого</mark> е този подарък?", tr: "Bu hediye <u>kimden</u>?" }] },
  "в": { type: "edat", examples: [{ bg: "Живея <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">в</mark> София.", tr: "Sofya'<u>da</u> yaşıyorum." }, { bg: "Влизам <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">в</mark> стаята.", tr: "Oda<u>ya</u> giriyorum." }] },
  "на": { type: "edat", notes: "Yönelme (a/e) veya aidiyet (ın/in) bildirir.", examples: [{ bg: "Отивам <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">на</mark> работа.", tr: "İş<u>e</u> gidiyorum." }, { bg: "Колата <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">на</mark> Иван е нова.", tr: "İvan'<u>ın</u> arabası yenidir." }] },
  "за": { type: "edat", examples: [{ bg: "Това е <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">за</mark> теб.", tr: "Bu senin <u>için</u>." }, { bg: "Заминавам <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">за</mark> морето.", tr: "Deniz<u>e (deniz için)</u> yola çıkıyorum." }] },
  "с": { type: "edat", examples: [{ bg: "Пия кафе <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">с</mark> мляко.", tr: "Süt<u>lü (süt ile)</u> kahve içiyorum." }, { bg: "Говоря <mark class=\"bg-indigo-100/80 text-indigo-700 px-1 rounded\">с</mark> приятел.", tr: "Arkadaşım<u>la</u> konuşuyorum." }] }
};

function processFile(filename) {
  let data = JSON.parse(fs.readFileSync(filename, 'utf8'));
  let count = 0;
  data.words = data.words.map(w => {
    let key = w.bg.toLowerCase();
    if (updates[key]) {
      if (updates[key].type) w.type = updates[key].type;
      if (updates[key].pronounForms) w.pronounForms = updates[key].pronounForms;
      if (updates[key].notes && !w.notes) w.notes = updates[key].notes;
      if (updates[key].examples) {
        // preserve existing examples if they exist? No, the new ones are highlighted.
        w.examples = updates[key].examples;
      }
      count++;
    }
    return w;
  });
  if (count > 0) {
    fs.writeFileSync(filename, JSON.stringify(data, null, 2));
    console.log(`Updated ${count} grammatical words in ${filename}`);
  }
}

processFile('src/data/vocabulary/vocab_ders_1_2.json');
processFile('src/data/vocabulary/vocab_ders_3.json');
