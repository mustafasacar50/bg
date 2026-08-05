const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'src', 'data', 'questions.json');
let questions = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

// Filter out old TEKRAR questions if they are few, to replace them with a rich set
questions = questions.filter(q => q.lesson !== 'Bulgarca TEKRAR');

const lesson = 'Bulgarca TEKRAR';

const sentences = [
  { bg: "ИМАТЕ ЛИ КОТКА?", tr: "Kediniz var mı?", blankbg: "ИМАТЕ ЛИ ____?", blankans: "КОТКА" },
  { bg: "ИМАТЕ ЛИ КУЧЕ?", tr: "Köpeğiniz var mı?", blankbg: "ИМАТЕ ЛИ ____?", blankans: "КУЧЕ" },
  { bg: "ОБИЧАТЕ ЛИ ЦВЕТЯ?", tr: "Çiçekleri sever misiniz?", blankbg: "____ ЛИ ЦВЕТЯ?", blankans: "ОБИЧАТЕ" },
  { bg: "ОБИЧАТЕ ЛИ ЧАЙ?", tr: "Çay sever misiniz?", blankbg: "ОБИЧАТЕ ЛИ ____?", blankans: "ЧАЙ" },
  { bg: "КЪДЕ ЖИВЕЕТЕ?", tr: "Nerede yaşıyorsunuz?", blankbg: "____ ЖИВЕЕТЕ?", blankans: "КЪДЕ" },
  { bg: "КАК СИ?", tr: "Nasılsın?", blankbg: "____ СИ?", blankans: "КАК" },
  { bg: "ТОЙ ИМА ЛИ КОЛА?", tr: "Onun arabası var mı?", blankbg: "ТОЙ ____ ЛИ КОЛА?", blankans: "ИМА" },
  { bg: "ТЯ НЯМА ЛИ КОЛЕЛО?", tr: "Onun bisikleti yok mu?", blankbg: "ТЯ НЯМА ЛИ ____?", blankans: "КОЛЕЛО" },
  { bg: "НА КОЛКО ГОДИНИ СИ?", tr: "Kaç yaşındasın?", blankbg: "НА КОЛКО ____ СИ?", blankans: "ГОДИНИ" },
  { bg: "ИМАШ ЛИ ЧЕРНО КОЛЕЛО?", tr: "Siyah bisikletin var mı?", blankbg: "ИМАШ ЛИ ____ КОЛЕЛО?", blankans: "ЧЕРНО" },
  { bg: "ОТ КЪДЕ СИ?", tr: "Nerelisin?", blankbg: "ОТ ____ СИ?", blankans: "КЪДЕ" },
  { bg: "КУЧЕТО ТИ БОЛНО ЛИ Е?", tr: "Köpeğin hasta mı?", blankbg: "КУЧЕТО ТИ ____ ЛИ Е?", blankans: "БОЛНО" },
  { bg: "ОБИЧАШ ЛИ ЧЕРВЕНИ ЯБЪЛКИ?", tr: "Kırmızı elmaları sever misin?", blankbg: "ОБИЧАШ ЛИ ЧЕРВЕНИ ____?", blankans: "ЯБЪЛКИ" },
  { bg: "ТОВА ТВОЯТА КОЛА ЛИ Е?", tr: "Bu senin araban mı?", blankbg: "ТОВА ТВОЯТА ____ ЛИ Е?", blankans: "КОЛА" },
  { bg: "НЕГОВАТА КЪЩА Е МАЛКА.", tr: "Onun evi küçüktür.", blankbg: "НЕГОВАТА КЪЩА Е ____.", blankans: "МАЛКА" },
  { bg: "ДНЕС РЪКАТА МЕ БОЛИ.", tr: "Bugün kolum ağrıyor.", blankbg: "____ РЪКАТА МЕ БОЛИ.", blankans: "ДНЕС" },
  { bg: "ДЯДО МИ Е БОЛЕН.", tr: "Dedem hasta.", blankbg: "ДЯДО МИ Е ____.", blankans: "БОЛЕН" },
  { bg: "ИЗВИНЕТЕ, КОЛКО Е ЧАСА?", tr: "Afedersiniz, saat kaç?", blankbg: "ИЗВИНЕТЕ, ____ Е ЧАСА?", blankans: "КОЛКО" },
  { bg: "КАКВО ИМАШ В ЧАНТАТА ?", tr: "Çantanda ne var?", blankbg: "КАКВО ИМАШ В ____ ?", blankans: "ЧАНТАТА" },
  { bg: "КЪДЕ СА ВАШИТЕ ДОКУМЕНТИ?", tr: "Belgeleriniz nerede?", blankbg: "КЪДЕ СА ВАШИТЕ ____?", blankans: "ДОКУМЕНТИ" },
  { bg: "В КЪЩИ Е МНОГО ТОПЛО.", tr: "Ev çok sıcak.", blankbg: "В КЪЩИ Е МНОГО ____.", blankans: "ТОПЛО" },
  { bg: "ОБИЧАМ БАНАНИ И ЯБЪЛКИ.", tr: "Muz ve elma severim.", blankbg: "ОБИЧАМ БАНАНИ И ____.", blankans: "ЯБЪЛКИ" },
  { bg: "ДНЕС КОЙ ДЕН Е ?", tr: "Bugün günlerden ne?", blankbg: "ДНЕС КОЙ ____ Е ?", blankans: "ДЕН" },
  { bg: "БРАТ ТИ УЧЕНИК ЛИ Е?", tr: "Erkek kardeşin öğrenci mi?", blankbg: "БРАТ ТИ ____ ЛИ Е?", blankans: "УЧЕНИК" },
  { bg: "УЧИТЕЛКАТА В СТАЯТА ЛИ Е ?", tr: "Öğretmen odada mı?", blankbg: "УЧИТЕЛКАТА В ____ ЛИ Е ?", blankans: "СТАЯТА" },
  { bg: "КОЛКО СТРУВА ТОВА КАФЕ?", tr: "Bu kahve ne kadar?", blankbg: "КОЛКО ____ ТОВА КАФЕ?", blankans: "СТРУВА" },
  { bg: "НАШИТЕ ЧАШИ СА НА МАСАТА.", tr: "Bardaklarımız masada.", blankbg: "НАШИТЕ ЧАШИ СА НА ____.", blankans: "МАСАТА" },
  { bg: "КОЛКО ХОРА ИМА В КОЛАТА?", tr: "Arabada kaç kişi var?", blankbg: "КОЛКО ____ ИМА В КОЛАТА?", blankans: "ХОРА" },
  { bg: "КЪДЕ ИМА ТОПЛА ВОДА?", tr: "Nerede sıcak su var?", blankbg: "КЪДЕ ИМА ТОПЛА ____?", blankans: "ВОДА" },
  { bg: "НАШАТА КОТКА Е БОЛНА.", tr: "Kedimiz hasta.", blankbg: "НАШАТА КОТКА Е ____.", blankans: "БОЛНА" },
  { bg: "АЗ НЯМАМ ШАПКА.", tr: "Şapkam yok.", blankbg: "АЗ НЯМАМ ____.", blankans: "ШАПКА" },
  { bg: "ЛИПСВАШ МИ.", tr: "Seni özledim.", blankbg: "____ МИ.", blankans: "ЛИПСВАШ" },
  { bg: "КЪДЕ СА МОИТЕ ЧОРАПИ?", tr: "Çoraplarım nerede?", blankbg: "КЪДЕ СА МОИТЕ ____?", blankans: "ЧОРАПИ" },
  { bg: "ЕДНО КАФЕ И ЕДНА ТОРТА МОЛЯ.", tr: "Bir kahve ve bir pasta lütfen.", blankbg: "ЕДНО КАФЕ И ЕДНА ____ МОЛЯ.", blankans: "ТОРТА" },
  { bg: "КОЙ Е ОНЗИ МЪЖ?", tr: "O adam kim?", blankbg: "КОЙ Е ОНЗИ ____?", blankans: "МЪЖ" },
  { bg: "АЗ И МОЕТО СЕМЕЙСТВО.", tr: "Ben ve ailem.", blankbg: "АЗ И МОЕТО ____.", blankans: "СЕМЕЙСТВО" },
  { bg: "ИМАШ МНОГО ХУБАВИ ОЧИ.", tr: "Çok güzel gözlerin var.", blankbg: "ИМАШ МНОГО ХУБАВИ ____.", blankans: "ОЧИ" },
  { bg: "ВИЕ ОТ КЪДЕ СТЕ?", tr: "Siz nerelisiniz?", blankbg: "ВИЕ ОТ ____ СТЕ?", blankans: "КЪДЕ" },
  { bg: "ТОВА ЧЕРЕН ХИМИКАЛ ЛИ Е?", tr: "Bu siyah tükenmez kalem mi?", blankbg: "ТОВА ЧЕРЕН ____ ЛИ Е?", blankans: "ХИМИКАЛ" },
  { bg: "ЕДНА СТУДЕНА БИРА МОЛЯ.", tr: "Bir soğuk bira lütfen.", blankbg: "ЕДНА СТУДЕНА ____ МОЛЯ.", blankans: "БИРА" },
  { bg: "БОЛИ МЕ ГЛАВАТА.", tr: "Başım ağrıyor.", blankbg: "БОЛИ МЕ ____.", blankans: "ГЛАВАТА" },
  { bg: "АЗ СЪМ ЛЕКАР.", tr: "Ben doktorum.", blankbg: "АЗ СЪМ ____.", blankans: "ЛЕКАР" },
  { bg: "АЗ ОТИВАМ В КИТАЙ.", tr: "Ben Çin'e gidiyorum.", blankbg: "АЗ ОТИВАМ В ____.", blankans: "КИТАЙ" },
  { bg: "ИМАТЕ ЛИ СЕСТРА?", tr: "Kız kardeşiniz var mı?", blankbg: "ИМАТЕ ЛИ ____?", blankans: "СЕСТРА" },
  { bg: "МОЯТ ТЕЛЕФОН Е РАЗВАЛЕН.", tr: "Telefonum bozuk.", blankbg: "МОЯТ ____ Е РАЗВАЛЕН.", blankans: "ТЕЛЕФОН" },
  { bg: "ПИЯ СТУДЕНА ВОДА.", tr: "Soğuk su içiyorum.", blankbg: "ПИЯ СТУДЕНА ____.", blankans: "ВОДА" },
  { bg: "ИМАШ ЛИ БРАТ?", tr: "Erkek kardeşin var mı?", blankbg: "ИМАШ ЛИ ____?", blankans: "БРАТ" },
  { bg: "ТОВА ЗЕЛЕНО ЦВЕТЕ ЛИ Е?", tr: "Bu yeşil çiçek mi?", blankbg: "ТОВА ЗЕЛЕНО ____ ЛИ Е?", blankans: "ЦВЕТЕ" },
  { bg: "АЗ СЪМ АДВОКАТ", tr: "Ben avukatım", blankbg: "АЗ СЪМ ____", blankans: "АДВОКАТ" },
  { bg: "НА МАСАТА ИМА ЛИ КНИГА?", tr: "Masada kitap var mı?", blankbg: "НА МАСАТА ИМА ЛИ ____?", blankans: "КНИГА" }
];

// Helper to get 3 random wrong options
function getWrongOptions(correct, pool, key) {
  const wrongs = pool.filter(item => item[key] !== correct).map(item => item[key]);
  // Shuffle wrongs
  wrongs.sort(() => 0.5 - Math.random());
  return wrongs.slice(0, 3);
}

const newQuestions = [];
let idCounter = 1000;

sentences.forEach((s) => {
  // 1. MCQ TR -> BG
  const trToBgOptions = [s.bg, ...getWrongOptions(s.bg, sentences, 'bg')].sort(() => 0.5 - Math.random());
  const trToBgAnswerIndex = trToBgOptions.indexOf(s.bg);
  newQuestions.push({
    id: `q_mcq_tekrar_${idCounter++}`,
    type: 'mcq',
    difficulty: 2,
    tags: ['Cümle Çevirisi', 'TR-BG'],
    lesson: lesson,
    question: `Aşağıdaki Türkçe cümlenin Bulgarca karşılığı nedir?\n\n**${s.tr}**`,
    options: trToBgOptions.map((opt, i) => ({ id: `opt${i+1}`, text: opt })),
    answer: `opt${trToBgAnswerIndex+1}`,
    points: 5
  });

  // 2. MCQ BG -> TR
  const bgToTrOptions = [s.tr, ...getWrongOptions(s.tr, sentences, 'tr')].sort(() => 0.5 - Math.random());
  const bgToTrAnswerIndex = bgToTrOptions.indexOf(s.tr);
  newQuestions.push({
    id: `q_mcq_tekrar_${idCounter++}`,
    type: 'mcq',
    difficulty: 2,
    tags: ['Cümle Çevirisi', 'BG-TR'],
    lesson: lesson,
    question: `Aşağıdaki Bulgarca cümlenin Türkçe karşılığı nedir?\n\n**${s.bg}**`,
    options: bgToTrOptions.map((opt, i) => ({ id: `opt${i+1}`, text: opt })),
    answer: `opt${bgToTrAnswerIndex+1}`,
    points: 5
  });

  // 3. Blank
  newQuestions.push({
    id: `q_blank_tekrar_${idCounter++}`,
    type: 'blank',
    difficulty: 2,
    tags: ['Cümle', 'Boşluk Doldurma'],
    lesson: lesson,
    sentence: s.blankbg,
    hint: s.tr,
    answers: { [`q_blank_tekrar_${idCounter-1}`]: s.blankans },
    points: 10
  });
});

// Match Questions
// We can group 5 sentences at a time to create a Match question
for(let i=0; i < sentences.length; i+=5) {
  const group = sentences.slice(i, i+5);
  if(group.length < 5) break;

  const lefts = group.map((g, idx) => ({ id: `left${idx+1}`, text: g.bg }));
  const rights = group.map((g, idx) => ({ id: `right${idx+1}`, text: g.tr }));
  
  // shuffle rights
  rights.sort(() => 0.5 - Math.random());

  const matches = {};
  lefts.forEach(left => {
    const correctTr = group.find(g => g.bg === left.text).tr;
    const right = rights.find(r => r.text === correctTr);
    matches[left.id] = right.id;
  });

  newQuestions.push({
    id: `q_match_tekrar_${idCounter++}`,
    type: 'match',
    difficulty: 2,
    tags: ['Eşleştirme', 'Cümle'],
    lesson: lesson,
    instruction: "Bulgarca cümleleri Türkçe anlamlarıyla eşleştiriniz.",
    leftItems: lefts,
    rightItems: rights,
    matches: matches,
    points: 15
  });
}

questions = [...questions, ...newQuestions];
fs.writeFileSync(dataPath, JSON.stringify(questions, null, 2), 'utf-8');
console.log(`Added ${newQuestions.length} new questions to Bulgarca TEKRAR!`);
