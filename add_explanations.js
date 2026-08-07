const fs = require('fs');
const path = require('path');

const modulePath = path.join(__dirname, 'src', 'data', 'modules', 'balgoc___Bulgarca_A1_Ders_1_2.json');

const moduleData = JSON.parse(fs.readFileSync(modulePath, 'utf8'));

const explanations = [
  { match: 'ЯМ', rule: "Bulgarcada 'Ben' (Аз) zamiri ile kullanılan fiiller (1. Tekil Şahıs) genellikle -м, -я veya -а harfleriyle biter. Örn: Аз ям (Ben yiyorum)." },
  { match: 'ПИЯ', rule: "Fiillerin 1. Tekil Şahıs çekimlerinde (Ben - Аз) sıklıkla -я takısı görürüz. Örn: Аз пия (Ben içiyorum)." },
  { match: 'ЧЕТА', rule: "'Аз чета' (Ben okuyorum). 'Çeta' kelimesi çete kurup okuma yapanları hayal ederek aklınızda kalabilir." },
  { match: 'КУПУВАМ', rule: "'Kupuvam' - Ben satın alıyorum. Kupa almaktan veya kuponla alışveriş yapmaktan çağrışım yapabilirsiniz." },
  { match: 'КАКВО', rule: "Soru kelimesi 'Какво?' (Ne?). Bulgarcada ne olduğunu sorarken en sık kullanılan temel kelimedir." },
  { match: 'КАК', rule: "'Как' (Nasıl). 'Как си?' (Nasılsın?) kalıbının temel taşıdır." },
  { match: 'КЪДЕ', rule: "'Къде' (Nerede). Bir yer sorarken cümlenin başında kullanılır." },
  { match: 'КОЙ', rule: "'Кой' (Kim). İnsanlar için kullanılır. Maskulin (eril) formdadır." },
  { match: 'УЧИЛИЩЕ', rule: "'Uçilişte' (Okul). 'Uçi-' kökü öğrenmek/okumakla ilgilidir (Уча: Çalışıyorum, Учител: Öğretmen)." },
  { match: 'КЪЩА', rule: "'Kışta' (Ev). Kışın sıcacık evimizde otururuz diye hafızanızda kodlayabilirsiniz." },
  { match: 'ХЛЯБ', rule: "'Hlyab' (Ekmek). Bulgar sofralarının vazgeçilmezidir. Rusçadaki 'Hleb' kelimesiyle aynı kökten gelir." },
  { match: 'ВОДА', rule: "'Voda' (Su). Slav dillerinin çoğunda 'Voda' su demektir (Votka kelimesi de 'küçük su' anlamına gelir)." },
  { match: 'ЗДРАВЕЙ', rule: "'Zdravey' (Merhaba). Kökü 'Zdrave' (Sağlık) kelimesine dayanır. Aslında karşı tarafa 'Sağlıklı ol' demiş oluyorsunuz." },
  { match: 'БЛАГОДАРЯ', rule: "'Blagodarya' (Teşekkür ederim). 'Blago' (iyilik/nimet) ve 'darya' (vermek/bağışlamak) kelimelerinin birleşiminden oluşur. Yani 'Sana iyilik bağışlıyorum' demektir." },
  { match: 'КУЧЕ', rule: "'Kuçe' (Köpek). Küçük tatlı bir köpeği (Kuçu kuçu) çağırırken çıkardığımız sese benzer." },
  { match: 'КОТКА', rule: "'Kotka' (Kedi). Kedi (Cat/Kot) kelimeleri birçok dilde benzer bir köke (Kot) sahiptir." },
  { match: 'КНИГА', rule: "'Kniga' (Kitap). 'Kınagecesi'nde okunan eski bir kitap gibi zihninizde absürt bir bağ kurabilirsiniz." },
  { match: 'УТРЕ', rule: "'Utre' (Yarın). 'Utro' (Sabah) kelimesinden türemiştir, ertesi sabah/yarın anlamına gelir." },
  { match: 'ВЧЕРА', rule: "'Vçera' (Dün). Gece anlamına gelen 'veçer' kelimesiyle bağlantılıdır." },
  { match: 'ДНЕС', rule: "'Dnes' (Bugün). 'Den' (Gün) kelimesinden türemiştir (Bu gün)." }
];

let updatedCount = 0;

moduleData.questions = moduleData.questions.map(q => {
  const text = `${q.sentence} ${q.answer} ${q.hint}`.toUpperCase();
  
  // Bulabildiği ilk kuralı eklesin
  for (let item of explanations) {
    if (text.includes(item.match)) {
      q.explanation = item.rule;
      updatedCount++;
      break;
    }
  }
  
  // Kural bulamadıysa ama fill in the blank ise genel bir tüyo verelim
  if (!q.explanation && q.type === 'blank') {
    q.explanation = "Bulgarcada kelime sonlarındaki sesli harfler kelimenin cinsiyetini (eril, dişil, nötr) belirler. Kelimeleri ezberlerken son harfine dikkat etmek gramer kurallarını uygularken çok işinize yarar.";
    updatedCount++;
  }
  
  return q;
});

fs.writeFileSync(modulePath, JSON.stringify(moduleData, null, 2));
console.log(`Updated ${updatedCount} questions with explanations.`);
