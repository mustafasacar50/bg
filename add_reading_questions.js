const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'src', 'data', 'questions.json');
let questions = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

// Generate some reading paragraphs with blanks
// 4 blanks per paragraph
const readingData = [
  {
    lesson: 'BULGARA A1 ÇARŞAMBA-CUMA 2.DERS 07.03',
    tr: 'Benim adım İvan. Ben Sofya\'da yaşıyorum. Benim büyük bir ailem var. Annem öğretmen, babam ise mühendis.',
    text: 'Моето име е ____1____. Аз живея в ____2____. Имам голямо ____3____. Майка ми е учителка, а баща ми е ____4____.',
    answers: { '1': 'Иван', '2': 'София', '3': 'семейство', '4': 'инженер' }
  },
  {
    lesson: 'BULGARA A1 ÇARŞAMBA-CUMA 2.DERS 07.03',
    tr: 'Bugün hava çok güzel. Güneş parlıyor ve gökyüzü mavi. Biz parka gidiyoruz. Orada arkadaşlarımızla buluşacağız.',
    text: 'Днес времето е много ____1____. Слънцето свети и небето е ____2____. Ние отиваме в ____3____. Там ще се срещнем с нашите ____4____.',
    answers: { '1': 'хубаво', '2': 'синьо', '3': 'парка', '4': 'приятели' }
  },
  {
    lesson: 'BULGARA A1 ÇARŞAMBA-CUMA 2.DERS 07.03',
    tr: 'Yeni bir araba satın aldım. Arabamın rengi kırmızı. Çok hızlı gidiyor. Onu sürmeyi çok seviyorum.',
    text: 'Купих си нова ____1____. Цветът на колата ми е ____2____. Тя върви много ____3____. Много обичам да я ____4____.',
    answers: { '1': 'кола', '2': 'червен', '3': 'бързо', '4': 'карам' }
  },
  {
    lesson: 'BULGARA A1 ÇARŞAMBA-CUMA 2.DERS 07.03',
    tr: 'Akşam yemeği için pizza sipariş ettik. Pizza çok büyüktü ve sıcaktı. Yanında soğuk kola içtik. Hepimiz çok doyduk.',
    text: 'За вечеря поръчахме ____1____. Пицата беше много голяма и ____2____. С нея пихме студена ____3____. Всички се ____4____ много.',
    answers: { '1': 'пица', '2': 'топла', '3': 'кола', '4': 'нахранихме' }
  },
  {
    lesson: 'BULGARCA A1 ÇARŞAMBA-CUMA 7.DERS 26.03',
    tr: 'Sabahları erken kalkarım. Önce kahve içerim, sonra kahvaltı yaparım. Kahvaltıda genellikle peynir ve zeytin yerim.',
    text: 'Сутрин ставам ____1____. Първо пия ____2____, после закусвам. На закуска обикновено ям ____3____ и маслини. Много е ____4____.',
    answers: { '1': 'рано', '2': 'кафе', '3': 'сирене', '4': 'вкусно' }
  },
  {
    lesson: 'BULGARCA A1 ÇARŞAMBA-CUMA 7.DERS 26.03',
    tr: 'Hafta sonu sinemaya gittik. Film çok heyecanlıydı. Sonra restoranda akşam yemeği yedik. Pazar günü ise evde dinlendik.',
    text: 'През уикенда отидохме на ____1____. Филмът беше много ____2____. После вечеряхме в ____3____. В неделя си почивахме в ____4____.',
    answers: { '1': 'кино', '2': 'интересен', '3': 'ресторант', '4': 'къщи' }
  },
  {
    lesson: 'BULGARCA A1 ÇARŞAMBA-CUMA 7.DERS 26.03',
    tr: 'Kışın dağlara gitmeyi severim. Orada kayak yaparım. Hava soğuktur ama manzara çok güzeldir. Sıcak çikolata içeriz.',
    text: 'През зимата обичам да ходя на ____1____. Там карам ____2____. Времето е студено, но гледката е много ____3____. Пием горещ ____4____.',
    answers: { '1': 'планина', '2': 'ски', '3': 'красива', '4': 'шоколад' }
  },
  {
    lesson: 'BULGARCA A1 ÇARŞAMBA-CUMA 7.DERS 26.03',
    tr: 'Dün kütüphaneye gittim. Yeni bir kitap ödünç aldım. Kitabın konusu çok ilginç. Akşam hemen okumaya başladım.',
    text: 'Вчера отидох в ____1____. Взех назаем нова ____2____. Темата на книгата е много ____3____. Вечерта веднага започнах да я ____4____.',
    answers: { '1': 'библиотеката', '2': 'книга', '3': 'интересна', '4': 'чета' }
  },
  {
    lesson: 'BULGARCA A1- ÇARŞAMBA-CUMA 6. DERS 22.03',
    tr: 'Benim bir kedim ve bir köpeğim var. Kedi siyah, köpek ise beyaz. Onlar bahçede oynamayı çok seviyorlar.',
    text: 'Аз имам една ____1____ и едно куче. Котката е черна, а кучето е ____2____. Те много обичат да ____3____ в градината. Всеки ден сме ____4____.',
    answers: { '1': 'котка', '2': 'бяло', '3': 'играят', '4': 'заедно' }
  },
  {
    lesson: 'BULGARCA A1- ÇARŞAMBA-CUMA 6. DERS 22.03',
    tr: 'Benim erkek kardeşim üniversitede okuyor. O yirmi yaşında. Tıp fakültesinde öğrenci. Gelecekte iyi bir doktor olmak istiyor.',
    text: 'Моят брат учи в ____1____. Той е на двадесет ____2____. Студент е в медицинския факултет. В бъдеще иска да стане добър ____3____. Много чете ____4____.',
    answers: { '1': 'университета', '2': 'години', '3': 'лекар', '4': 'книги' }
  },
  {
    lesson: 'BULGARCA A1- ÇARŞAMBA-CUMA 6. DERS 22.03',
    tr: 'Bugün annemin doğum günü. Ona güzel bir hediye aldım. Akşam sürpriz bir parti yapacağız. Annem çok mutlu olacak.',
    text: 'Днес е рожденият ден на моята ____1____. Купих й хубав ____2____. Довечера ще направим парти ____3____. Тя ще бъде много ____4____.',
    answers: { '1': 'майка', '2': 'подарък', '3': 'изненада', '4': 'щастлива' }
  },
  {
    lesson: 'BULGARCA A1- ÇARŞAMBA-CUMA 6. DERS 22.03',
    tr: 'Büyükbabam köyde yaşıyor. Orada taze sebzeler yetiştiriyor. Yazın onu ziyarete gideriz. Köyün havası çok temiz.',
    text: 'Моят дядо живее на ____1____. Там отглежда пресни ____2____. През лятото отиваме да го ____3____. Въздухът на село е много ____4____.',
    answers: { '1': 'село', '2': 'зеленчуци', '3': 'видим', '4': 'чист' }
  },
  {
    lesson: 'BULGARCA ÇARŞAMBA-CUMA 1.DERS-5.03',
    tr: 'Merhaba, nasılsınız? Ben iyiyim, teşekkür ederim. Sizin adınız ne? Memnun oldum.',
    text: 'Здравейте, как ____1____? Аз съм добре, ____2____. Как се ____3____ вие? Приятно ми е да се ____4____.',
    answers: { '1': 'сте', '2': 'благодаря', '3': 'казвате', '4': 'запознаем' }
  },
  {
    lesson: 'BULGARCA ÇARŞAMBA-CUMA 1.DERS-5.03',
    tr: 'Bu benim çantam. Çantamın içinde kitaplar ve defterler var. Ayrıca bir kalem kutusu da bulunuyor.',
    text: 'Това е моята ____1____. В нея има книги и ____2____. Също така има и един ____3____ за химикалки. Той е ____4____ на цвят.',
    answers: { '1': 'чанта', '2': 'тетрадки', '3': 'несесер', '4': 'червен' }
  },
  {
    lesson: 'BULGARCA ÇARŞAMBA-CUMA 1.DERS-5.03',
    tr: 'Sınıfımız çok aydınlık ve geniş. Tahta beyaz renkli. Masaların üzerinde bilgisayarlar var. Öğretmenimiz derse başlıyor.',
    text: 'Нашата класна стая е много светла и ____1____. Дъската е с бял ____2____. На масите има ____3____. Нашият учител започва ____4____.',
    answers: { '1': 'широка', '2': 'цвят', '3': 'компютри', '4': 'урока' }
  },
  {
    lesson: 'BULGARCA ÇARŞAMBA-CUMA 1.DERS-5.03',
    tr: 'Bugün hava güneşli ve sıcak. Parka yürüyüş yapmaya çıktım. Birçok insan dışarıda. Kuşlar şarkı söylüyor.',
    text: 'Днес времето е слънчево и ____1____. Излязох на ____2____ в парка. Много хора са ____3____. Птиците пеят ____4____.',
    answers: { '1': 'топло', '2': 'разходка', '3': 'навън', '4': 'песни' }
  },
  {
    lesson: 'BULGARCA ÇARŞAMBA-CUMA 4. DERS 14.03',
    tr: 'Marketten ekmek, süt ve yumurta aldım. Toplam yirmi leva tuttu. Kasiyere parayı verdim ve para üstünü aldım.',
    text: 'От магазина купих ____1____, мляко и яйца. Общо струваше двадесет ____2____. Дадох парите на ____3____ и взех ____4____.',
    answers: { '1': 'хляб', '2': 'лева', '3': 'касиера', '4': 'рестото' }
  },
  {
    lesson: 'BULGARCA ÇARŞAMBA-CUMA 4. DERS 14.03',
    tr: 'Tatil için denize gittik. Su çok sıcaktı. Plajda güneşlendik ve yüzdük. Akşamları sahilde yürüyüş yaptık.',
    text: 'Отидохме на ____1____ за почивка. Водата беше много ____2____. На плажа се пекохме и ____3____. Вечер се разхождахме по ____4____.',
    answers: { '1': 'море', '2': 'топла', '3': 'плувахме', '4': 'бряг' }
  },
  {
    lesson: 'BULGARCA ÇARŞAMBA-CUMA 4. DERS 14.03',
    tr: 'Yeni ayakkabılar aldım. Onlar siyah ve çok rahat. Her gün işe onlarla gidiyorum. Ayaklarım hiç ağrımıyor.',
    text: 'Купих си нови ____1____. Те са черни и много ____2____. Всеки ден ходя на ____3____ с тях. Краката ми изобщо не ме ____4____.',
    answers: { '1': 'обувки', '2': 'удобни', '3': 'работа', '4': 'болят' }
  },
  {
    lesson: 'BULGARCA ÇARŞAMBA-CUMA 4. DERS 14.03',
    tr: 'Hastaneye gittim çünkü hastaydım. Doktor bana ilaç yazdı. Üç gün boyunca dinlenmemi söyledi. Şimdi daha iyiyim.',
    text: 'Отидох в ____1____, защото бях болен. Лекарят ми предписа ____2____. Каза ми да си ____3____ три дни. Сега съм по-____4____.',
    answers: { '1': 'болницата', '2': 'лекарства', '3': 'почивам', '4': 'добре' }
  },
  {
    lesson: 'Bulgarca TEKRAR',
    tr: 'Ben bir öğretmenim ve okulu seviyorum. Öğrencilerim çok akıllı. Sınıfta ders anlatmak benim için bir zevk.',
    text: 'Аз съм ____1____ и обичам училището. Моите ученици са много ____2____. За мен е удоволствие да преподавам ____3____ в класната стая. Всички сме много ____4____.',
    answers: { '1': 'учител', '2': 'умни', '3': 'уроци', '4': 'щастливи' }
  },
  {
    lesson: 'Bulgarca TEKRAR',
    tr: 'Dün hava yağmurluydu. Bu yüzden dışarı çıkmadık. Evde televizyon izledik ve çay içtik. Sıcak çay iyi geldi.',
    text: 'Вчера времето беше ____1____. Затова не излязохме ____2____. Вкъщи гледахме телевизия и пихме ____3____. Топлият чай ни дойде ____4____.',
    answers: { '1': 'дъждовно', '2': 'навън', '3': 'чай', '4': 'добре' }
  },
  {
    lesson: 'Bulgarca TEKRAR',
    tr: 'Bugün ofiste çok işim var. Sabah dokuzdan akşam beşe kadar çalıştım. Toplantılar çok uzun sürdü. Akşam eve yorgun döndüm.',
    text: 'Днес имам много ____1____ в офиса. Работих от девет сутринта до пет ____2____. Срещите продължиха много ____3____. Вечерта се прибрах вкъщи ____4____.',
    answers: { '1': 'работа', '2': 'вечерта', '3': 'дълго', '4': 'уморен' }
  },
  {
    lesson: 'Bulgarca TEKRAR',
    tr: 'Annem mutfakta yemek yapıyor. O çok güzel çorba pişirir. Mutfaktan güzel kokular geliyor. Birazdan sofraya oturacağız.',
    text: 'Майка ми готви ____1____ в кухнята. Тя прави много хубава ____2____. От кухнята идват хубави ____3____. След малко ще седнем на ____4____.',
    answers: { '1': 'ядене', '2': 'супа', '3': 'миризми', '4': 'масата' }
  },
  {
    lesson: 'Bulgarca TEKRAR',
    tr: 'Pazar günü parkta piknik yaptık. Yanımızda meyve ve sandviç getirdik. Çocuklar topla oynadı. Biz çimlerde uzandık.',
    text: 'В неделя направихме ____1____ в парка. Донесохме си плодове и ____2____. Децата играха с ____3____. Ние лежахме на ____4____.',
    answers: { '1': 'пикник', '2': 'сандвичи', '3': 'топка', '4': 'тревата' }
  }
];

let idCounter = 100;
const newQuestions = readingData.map(data => {
  const qId = `q_reading_auto_${idCounter++}`;
  const ans = {};
  for(let key in data.answers) {
    ans[`${qId}_${key}`] = data.answers[key];
  }
  
  return {
    id: qId,
    type: 'reading',
    difficulty: 3,
    tags: ['Okuma Parçası', 'Boşluk Doldurma'],
    lesson: data.lesson,
    text: data.text,
    trHint: data.tr,
    answers: ans,
    points: 20
  };
});

// Avoid duplicates if running multiple times
questions = questions.filter(q => q.type !== 'reading');
questions = [...questions, ...newQuestions];

fs.writeFileSync(dataPath, JSON.stringify(questions, null, 2), 'utf-8');
console.log(`Added ${newQuestions.length} reading questions!`);
