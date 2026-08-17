const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '../src/data/modules');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const simulations = [
  // LEVEL 1 (2 adet)
  {
    filename: 'simulations_l1_cafe.json',
    data: {
      title: 'Seviye 1: Kafede Sipariş (ЛЕСНО)',
      difficulty: 1,
      description: 'Basit bir kahve siparişi verin. Temel selamlaşma и sayılar.',
      questions: [
        { id: 'l1c_1', type: 'dialogue', speaker: 'Garson', sentence: 'Здравейте! Какво ще обичате?', answer: 'Здравейте! Едно кафе, моля.', options: ['Здравейте! Едно кафе, моля.', 'Чао, до скоро.', 'Къде е тоалетната?', 'Аз съм от Турция.'], hint: 'Merhaba! Bir kahve lütfen.', explanation: 'Garson "Merhaba! Ne arzu edersiniz?" dedi.' },
        { id: 'l1c_2', type: 'dialogue', speaker: 'Garson', sentence: 'Какво кафе? Еспресо или капучино?', answer: 'Еспресо, със захар.', options: ['Две бири.', 'Еспресо, със захар.', 'Не, благодаря.', 'Добър вечер.'], hint: 'Espresso, şekerli.', explanation: 'Nasıl bir kahve istediğinizi soruyor.' },
        { id: 'l1c_3', type: 'dialogue', speaker: 'Garson', sentence: 'Нещо друго желаете ли? Вода?', answer: 'Да, една минерална вода.', options: ['Да, една минерална вода.', 'Не, аз съм добре.', 'Това е моят брат.', 'Как се казвате?'], hint: 'Evet, bir maden suyu.', explanation: 'Başka bir şey isteyip istemediğinizi soruyor.' },
        { id: 'l1c_4', type: 'dialogue', speaker: 'Garson', sentence: 'Добре, веднага ги нося. Общо е 5 лева.', answer: 'Заповядайте. Благодаря!', options: ['Къде е сметката?', 'Заповядайте. Благодаря!', 'Аз не разбирам.', 'Лека нощ.'], hint: 'Buyurun. Teşekkürler!', explanation: 'Hesap miktarını söyledi.' }
      ]
    }
  },
  {
    filename: 'simulations_l1_metro.json',
    data: {
      title: 'Seviye 1: Metro Nerede?',
      difficulty: 1,
      description: 'Yolda tanımadığınız birine adres soruyorsunuz.',
      questions: [
        { id: 'l1m_1', type: 'dialogue', speaker: 'Siz', sentence: '...', answer: 'Извинете, говорите ли английски?', options: ['Какво правите?', 'Извинете, говорите ли английски?', 'Аз съм студент.', 'Един хляб.'], hint: 'Affedersiniz, İngilizce konuşuyor musunuz?', explanation: 'Söze kibarca giriyorsunuz.' },
        { id: 'l1m_2', type: 'dialogue', speaker: 'Yabancı', sentence: 'Не много добре. Разбирам малко.', answer: 'Добре. Къде е метрото?', options: ['Добре. Къде е метрото?', 'Колко струва?', 'Искам вода.', 'Аз съм лекар.'], hint: 'Tamam. Metro nerede?', explanation: 'Doğrudan metronun yerini sorun.' },
        { id: 'l1m_3', type: 'dialogue', speaker: 'Yabancı', sentence: 'Метрото е направо и после надясно.', answer: 'Направо и надясно. Много благодаря!', options: ['Направо и надясно. Много благодаря!', 'Довиждане, приятен ден.', 'Не искам.', 'Това е вкусно.'], hint: 'Düz ve sağa. Çok teşekkürler!', explanation: 'Düz gidip sağa dönmeniz gerektiğini söyledi.' },
        { id: 'l1m_4', type: 'dialogue', speaker: 'Yabancı', sentence: 'Моля, приятен ден!', answer: 'Приятен ден и на вас!', options: ['Приятен ден и на вас!', 'Колко е часът?', 'Здравейте.', 'Аз съм българин.'], hint: 'Size de iyi günler!', explanation: 'Rica edip iyi günler diledi. Karşılık verin.' }
      ]
    }
  },
  // LEVEL 2 (2 adet)
  {
    filename: 'simulations_l2_hotel.json',
    data: {
      title: 'Seviye 2: Otel Rezervasyonu',
      difficulty: 2,
      description: 'Otele vardınız ve resepsiyonda check-in yapıyorsunuz.',
      questions: [
        { id: 'l2h_1', type: 'dialogue', speaker: 'Resepsiyon', sentence: 'Добър ден! Добре дошли в нашия хотел. С какво мога да ви помогна?', answer: 'Добър ден! Имам резервация за една стая.', options: ['Искам да купя хляб.', 'Добър ден! Имам резервация за една стая.', 'Къде е гарата?', 'Аз съм от София.'], hint: 'İyi günler! Bir oda için rezervasyonum var.', explanation: 'Otelde olduğunuzu ve rezervasyonunuz olduğunu belirtiyorsunuz.' },
        { id: 'l2h_2', type: 'dialogue', speaker: 'Resepsiyon', sentence: 'На кое име е резервацията, моля?', answer: 'На името на Иван Иванов.', options: ['На името на Иван Иванов.', 'Аз съм на 30 години.', 'Това е моят багаж.', 'Много благодаря.'], hint: 'İvan İvanov adına.', explanation: 'Adınızı soruyor.' },
        { id: 'l2h_3', type: 'dialogue', speaker: 'Resepsiyon', sentence: 'Да, виждам я. За три нощувки, нали?', answer: 'Точно така. Закуската включена ли е?', options: ['Не, не знам.', 'Точно така. Закуската включена ли е?', 'Къде мога да паркирам?', 'Чао.'], hint: 'Kesinlikle öyle. Kahvaltı dahil mi?', explanation: '3 gece olduğunu doğrulayıp kahvaltıyı sorun.' },
        { id: 'l2h_4', type: 'dialogue', speaker: 'Resepsiyon', sentence: 'Да, закуската е от 7 до 10 часа. Ето вашия ключ. Стая 205.', answer: 'Благодаря ви много. Хубав ден!', options: ['Къде е банята?', 'Благодаря ви много. Хубав ден!', 'Колко струва?', 'Не искам ключ.'], hint: 'Çok teşekkür ederim. İyi günler!', explanation: 'Anahtarı aldınız.' }
      ]
    }
  },
  {
    filename: 'simulations_l2_market.json',
    data: {
      title: 'Seviye 2: Süpermarkette Kasa Sırası',
      difficulty: 2,
      description: 'Markette alışverişinizi bitirdiniz, kasada ödeme yapıyorsunuz.',
      questions: [
        { id: 'l2m_1', type: 'dialogue', speaker: 'Kasiyer', sentence: 'Добър вечер. Имате ли клиентска карта?', answer: 'Добър вечер. Не, нямам.', options: ['Добър вечер. Не, нямам.', 'Аз съм студент.', 'Да, искам хляб.', 'Къде е млякото?'], hint: 'İyi akşamlar. Hayır, yok.', explanation: 'Müşteri kartınız olup olmadığını sordu.' },
        { id: 'l2m_2', type: 'dialogue', speaker: 'Kasiyer', sentence: 'Желаете ли торбичка?', answer: 'Да, една малка торбичка, моля.', options: ['Не, благодаря.', 'Да, една малка торбичка, моля.', 'Колко е часът?', 'Обичам ябълки.'], hint: 'Evet, küçük bir poşet lütfen.', explanation: 'Poşet isteyip istemediğinizi sordu.' },
        { id: 'l2m_3', type: 'dialogue', speaker: 'Kasiyer', sentence: 'Всичко прави 24 лева и 50 стотинки. В брой или с карта?', answer: 'Ще платя с карта.', options: ['В брой.', 'Ще платя с карта.', 'Това е много скъпо.', 'Къде мога да седна?'], hint: 'Kartla ödeyeceğim.', explanation: 'Nakit mi kartla mı ödeyeceğinizi soruyor.' },
        { id: 'l2m_4', type: 'dialogue', speaker: 'Kasiyer', sentence: 'Готово. Искате ли касовата бележка?', answer: 'Да, дайте ми я. Благодаря!', options: ['Да, дайте ми я. Благодаря!', 'Не искам.', 'Довиждане.', 'Какво е това?'], hint: 'Evet, verin. Teşekkürler!', explanation: 'Fişi isteyip istemediğinizi sordu.' }
      ]
    }
  },
  // LEVEL 3 (2 adet)
  {
    filename: 'simulations_l3_doctor.json',
    data: {
      title: 'Seviye 3: Doktor Randevusu',
      difficulty: 3,
      description: 'Kendinizi iyi hissetmiyorsunuz ve doktora gittiniz.',
      questions: [
        { id: 'l3d_1', type: 'dialogue', speaker: 'Doktor', sentence: 'Влезте. От какво се оплаквате?', answer: 'Здравейте, докторе. Не се чувствам добре, имам температура.', options: ['Аз съм здрав.', 'Здравейте, докторе. Не се чувствам добре, имам температура.', 'Искам да ям.', 'Боли ме кракът.'], hint: 'Merhaba doktor. İyi hissetmiyorum, ateşim var.', explanation: 'Şikayetinizi soruyor.' },
        { id: 'l3d_2', type: 'dialogue', speaker: 'Doktor', sentence: 'От кога имате температура? Кашляте ли?', answer: 'От вчера вечерта. Имам и лека кашлица.', options: ['От една година.', 'От вчера вечерта. Имам и лека кашлица.', 'Не знам.', 'Нямам температура.'], hint: 'Dün akşamdan beri. Ve hafif bir öksürüğüm var.', explanation: 'Ne zamandır sürdüğünü ve öksürük olup olmadığını sordu.' },
        { id: 'l3d_3', type: 'dialogue', speaker: 'Doktor', sentence: 'Да ви прегледам... Гърлото ви е зачервено. Ще ви предпиша антибиотик.', answer: 'Колко често трябва да го пия?', options: ['Благодаря.', 'Колко често трябва да го пия?', 'Не искам лекарства.', 'Къде е аптеката?'], hint: 'Onu ne sıklıkla içmeliyim?', explanation: 'İlacı ne sıklıkla kullanacağınızı sorun.' },
        { id: 'l3d_4', type: 'dialogue', speaker: 'Doktor', sentence: 'На всеки 12 часа, след ядене. Озздравявайте бързо!', answer: 'Благодаря ви много, докторе.', options: ['Добре.', 'Благодаря ви много, докторе.', 'Това е лошо.', 'Чао.'], hint: 'Çok teşekkür ederim doktor.', explanation: 'Reçeteyi aldınız и teşekkür ediyorsunuz.' }
      ]
    }
  },
  {
    filename: 'simulations_l3_friends.json',
    data: {
      title: 'Seviye 3: Arkadaşla Hafta Sonu Planı',
      difficulty: 3,
      description: 'Bir arkadaşınızla hafta sonu ne yapacağınızı konuşuyorsunuz.',
      questions: [
        { id: 'l3f_1', type: 'dialogue', speaker: 'Maria', sentence: 'Здравей! Какво ще правиш този уикенд?', answer: 'Здравей! Нямам планове все още. Защо питаш?', options: ['Ще спя.', 'Здравей! Нямам планове все още. Защо питаш?', 'Нямам време.', 'Аз работя.'], hint: 'Selam! Henüz planım yok. Neden soruyorsun?', explanation: 'Arkadaşınız hafta sonu planınızı sordu.' },
        { id: 'l3f_2', type: 'dialogue', speaker: 'Maria', sentence: 'Мислех да отидем на планина, времето ще бъде страхотно.', answer: 'Това звучи чудесно! Къде точно искаш да отидем?', options: ['Не, не обичам планината.', 'Това звучи чудесно! Къде точно искаш да отидем?', 'Скъпо е.', 'Нямам кола.'], hint: 'Kulağa harika geliyor! Tam olarak nereye gitmek istiyorsun?', explanation: 'Dağa gitme fikrine sıcak bakın ve yeri sorun.' },
        { id: 'l3f_3', type: 'dialogue', speaker: 'Maria', sentence: 'Към Витоша. Може да направим пикник и да се разходим.', answer: 'Супер идея. Какво трябва да взема с мен?', options: ['Само пари.', 'Супер идея. Какво трябва да взема с мен?', 'Не искам пикник.', 'Късно е.'], hint: 'Süper fikir. Yanıma ne almalıyım?', explanation: 'Yanınıza ne almanız gerektiğini sorun.' },
        { id: 'l3f_4', type: 'dialogue', speaker: 'Maria', sentence: 'Вземи си удобни обувки и може би малко сандвичи. Аз ще взема напитки.', answer: 'Разбрахме се! В колко часа ще се срещнем?', options: ['Не.', 'Разбрахме се! В колко часа ще се срещнем?', 'Забравих.', 'Няма проблем.'], hint: 'Anlaştık! Saat kaçta buluşacağız?', explanation: 'Buluşma saatini sorun.' }
      ]
    }
  },
  // LEVEL 4 (2 adet)
  {
    filename: 'simulations_l4_realestate.json',
    data: {
      title: 'Seviye 4: Emlakçı ile Ev Gezme',
      difficulty: 4,
      description: 'Kiralık bir ev bakıyorsunuz, emlakçıyla detayları konuşuyorsunuz.',
      questions: [
        { id: 'l4r_1', type: 'dialogue', speaker: 'Emlakçı', sentence: 'Това е апартаментът. Както виждате, холът е много просторен и светъл.', answer: 'Да, харесва ми. Изложението южно ли е?', options: ['Не ми харесва.', 'Да, харесва ми. Изложението южно ли е?', 'Много е малък.', 'Искам да си тръгвам.'], hint: 'Evet, beğendim. Cephesi güney mi?', explanation: 'Evin cephesini soruyorsunuz (Güney cephe sıcak olur).' },
        { id: 'l4r_2', type: 'dialogue', speaker: 'Emlakçı', sentence: 'Да, изцяло южен. Сметките за отопление през зимата са много ниски.', answer: 'А как е решен въпросът с паркирането? Има ли гараж?', options: ['Колко струва?', 'А как е решен въпросът с паркирането? Има ли гараж?', 'Искам да купя.', 'Не ме интересува.'], hint: 'Peki park sorunu nasıl çözülmüş? Garaj var mı?', explanation: 'Park yeri olup olmadığını sorun.' },
        { id: 'l4r_3', type: 'dialogue', speaker: 'Emlakçı', sentence: 'Гараж няма, но зад блока има голям безплатен паркинг.', answer: 'Разбирам. А съседите шумни ли са?', options: ['Разбирам. А съседите шумни ли са?', 'Това е проблем.', 'Ще го наема.', 'Мразя паркинги.'], hint: 'Anlıyorum. Peki komşular gürültülü mü?', explanation: 'Komşuların durumunu sorun.' },
        { id: 'l4r_4', type: 'dialogue', speaker: 'Emlakçı', sentence: 'Не, сградата е много спокойна, предимно млади семейства живеят тук.', answer: 'Добре, мисля, че ще го наема. Какви са условията за договора?', options: ['Не го искам.', 'Добре, мисля, че ще го наема. Какви са условията за договора?', 'Твърде скъпо.', 'Трябва да помисля.'], hint: 'Tamam, sanırım kiralayacağım. Sözleşme şartları neler?', explanation: 'Evi tutmaya karar verdiniz, sözleşmeyi sorun.' }
      ]
    }
  },
  {
    filename: 'simulations_l4_jobinterview.json',
    data: {
      title: 'Seviye 4: İş Görüşmesi',
      difficulty: 4,
      description: 'Bir şirkette mülakata girdiniz. ИК (İK) uzmanıyla konuşuyorsunuz.',
      questions: [
        { id: 'l4j_1', type: 'dialogue', speaker: 'İK Uzmanı', sentence: 'Заповядайте, седнете. Нека започнем с въпроса: защо искате да работите в нашата компания?', answer: 'Защото компанията ви е лидер в сектора и предлага отлични възможности за развитие.', options: ['Трябват ми пари.', 'Защото компанията ви е лидер в сектора и предлага отлични възможности за развитие.', 'Не знам.', 'Близо е до нас.'], hint: 'Çünkü şirketiniz sektörde lider ve gelişim için harika fırsatlar sunuyor.', explanation: 'Neden bu şirketi istediğinize profesyonel bir cevap verin.' },
        { id: 'l4j_2', type: 'dialogue', speaker: 'İK Uzmanı', sentence: 'Какъв е предишният ви опит на подобна позиция?', answer: 'Работил съм три години като специалист по продажбите в международна фирма.', options: ['Нямам опит.', 'Работил съм три години като специалист по продажбите в международна фирма.', 'Бях сервитьор.', 'Това е тайна.'], hint: 'Uluslararası bir şirkette satış uzmanı olarak üç yıl çalıştım.', explanation: 'Önceki deneyiminizden bahsedin.' },
        { id: 'l4j_3', type: 'dialogue', speaker: 'İK Uzmanı', sentence: 'Това е чудесно. А как се справяте с работата под напрежение?', answer: 'Свикнал съм със стреса. Опитвам се да приоритизирам задачите си.', options: ['Паникьосвам се.', 'Свикнал съм със стреса. Опитвам се да приоритизирам задачите си.', 'Напускам.', 'Не обичам напрежение.'], hint: 'Strese alışkınım. Görevlerimi önceliklendirmeye çalışırım.', explanation: 'Stresle nasıl başa çıktığınızı anlatın.' },
        { id: 'l4j_4', type: 'dialogue', speaker: 'İK Uzmanı', sentence: 'Имате ли някакви въпроси към мен относно позицията?', answer: 'Да, бих искал да попитам какво включва стандартният работен ден?', options: ['Не, нямам.', 'Колко е заплатата?', 'Кога почивам?', 'Да, бих искал да попитам какво включва стандартният работен ден?'], hint: 'Evet, standart bir iş gününün neleri içerdiğini sormak isterdim.', explanation: 'İşin detaylarıyla ilgili bir soru sorun.' }
      ]
    }
  },
  // LEVEL 5 (2 adet)
  {
    filename: 'simulations_l5_customs.json',
    data: {
      title: 'Seviye 5: Gümrük Kontrolü',
      difficulty: 5,
      description: 'Sınır kapısındasınız ve gümrük memuru sorular soruyor.',
      questions: [
        { id: 'l5c_1', type: 'dialogue', speaker: 'Gümrük Memuru', sentence: 'Паспорта и документите на колата, моля.', answer: 'Заповядайте. Ето паспорта ми и зелената карта на автомобила.', options: ['Нямам паспорт.', 'Заповядайте. Ето паспорта ми и зелената карта на автомобила.', 'Къде отивам?', 'Аз съм турист.'], hint: 'Buyurun. İşte pasaportum ve arabanın yeşil kartı.', explanation: 'Belgeleri eksiksiz teslim ediyorsunuz.' },
        { id: 'l5c_2', type: 'dialogue', speaker: 'Gümrük Memuru', sentence: 'Каква е целта на пътуването ви в България?', answer: 'Пътувам с цел туризъм. Ще посетя София и Пловдив за една седмица.', options: ['Не знам.', 'Пътувам с цел туризъм. Ще посетя София и Пловдив за една седмица.', 'Отивам на работа.', 'Просто се разхождам.'], hint: "Turizm amacıyla seyahat ediyorum. Bir haftalığına Sofya ve Filibe'yi ziyaret edeceğim.", explanation: 'Amacınızı net açıklayın.' },
        { id: 'l5c_3', type: 'dialogue', speaker: 'Gümrük Memuru', sentence: 'Носите ли стоки за деклариране? Цигари, алкохол над разрешеното количество?', answer: 'Не, нямам нищо за деклариране. Нося само личен багаж.', options: ['Да, имам много цигари.', 'Не, нямам нищо за деклариране. Нося само личен багаж.', 'Какво е деклариране?', 'Мисля, че да.'], hint: 'Hayır, beyan edecek bir şeyim yok. Sadece kişisel bagaj taşıyorum.', explanation: 'Beyan edilecek malınız olmadığını belirtin.' },
        { id: 'l5c_4', type: 'dialogue', speaker: 'Gümrük Memuru', sentence: 'Отворете багажника за проверка, моля.', answer: 'Разбира се, веднага ще го отворя.', options: ['Не искам.', 'Разбира се, веднага ще го отворя.', 'Защо?', 'Ключът е изгубен.'], hint: 'Tabii ki, hemen açacağım.', explanation: 'Zorluk çıkarmadan bagajı açmayı kabul edin.' }
      ]
    }
  },
  {
    filename: 'simulations_l5_bank.json',
    data: {
      title: 'Seviye 5: Banka Kredi Başvurusu',
      difficulty: 5,
      description: 'Ev almak için bankadan ipotekli konut кредити çekmek istiyorsunuz.',
      questions: [
        { id: 'l5b_1', type: 'dialogue', speaker: 'Banka Memuru', sentence: 'Добър ден. Как мога да ви бъда полезен днес?', answer: 'Интересувам се от условията за отпускане на ипотечен кредит за покупка на жилище.', options: ['Искам пари.', 'Интересувам се от условията за отпускане на ипотечен кредит за покупка на жилище.', 'Къде е банкоматът?', 'Искам да закрия сметката си.'], hint: 'Konut satın almak için ipotek kredisi verilme şartlarıyla ilgileniyorum.', explanation: 'İpotekli konut kredisi şartlarını sormak istiyorsunuz.' },
        { id: 'l5b_2', type: 'dialogue', speaker: 'Banka Memuru', sentence: 'Разбирам. Имате ли вече избран имот и на каква стойност е той?', answer: 'Да, избрал съм апартамент на стойност 100 хиляди евро.', options: ['Не.', 'Да, избрал съм апартамент на стойност 100 хиляди евро.', 'Много е скъпо.', 'Какво значение има?'], hint: 'Evet, 100 bin Euro değerinde bir daire seçtim.', explanation: 'Seçtiğiniz gayrimenkulün değerini belirtin.' },
        { id: 'l5b_3', type: 'dialogue', speaker: 'Banka Memuru', sentence: 'Какъв процент самоучастие можете да осигурите?', answer: 'Мога да осигуря 20 процента от сумата като първоначална вноска.', options: ['Нямам пари.', 'Мога да осигуря 20 процента от сумата като първоначална вноска.', 'Всичко.', 'Не разбирам.'], hint: "Peşinat olarak tutarın yüzde 20'sini sağlayabilirim.", explanation: 'Peşinat miktarınızı belirtin.' },
        { id: 'l5b_4', type: 'dialogue', speaker: 'Banka Memuru', sentence: 'Това е напълно достатъчно. Ще трябва да попълните тези формуляри и да донесете удостоверение за доходите.', answer: 'Благодаря за информацията. Ще подготвя документите и ще дойда отново.', options: ['Не искам формуляри.', 'Благодаря за информацията. Ще подготвя документите и ще дойда отново.', 'Кога ще получа парите?', 'Чао.'], hint: 'Bilgi için teşekkürler. Belgeleri hazırlayıp tekrar geleceğim.', explanation: 'Belgeleri hazırlayıp geleceğinizi söyleyin.' }
      ]
    }
  }
];

simulations.forEach(sim => {
  const fullPath = path.join(outDir, sim.filename);
  fs.writeFileSync(fullPath, JSON.stringify(sim.data, null, 2));
  console.log('Created: ' + sim.filename);
});
