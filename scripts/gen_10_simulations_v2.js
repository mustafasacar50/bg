const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '../src/data/modules');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// 10 Detaylı ve Öğretici Simülasyon
const simulations = [
  // LEVEL 1
  {
    filename: 'simulations_l1_new_neighbor.json',
    data: {
      title: 'Seviye 1: Yeni Komşu ile Tanışma',
      difficulty: 1,
      description: 'Yeni taşındığınız binada komşunuzla tanışıyorsunuz. Temel selamlaşma ve "съм" (olmak) fiili kullanımı.',
      questions: [
        { 
          id: 'l1_nn_1', type: 'dialogue', speaker: 'Siz', sentence: '...', answer: 'Здравейте! Аз съм вашият нов съсед.', 
          options: [
            'Какво правите тук?', 
            'Здравейте! Аз съм вашият нов съсед.', 
            'Колко струва апартаментът?', 
            'Къде е тоалетната?'
          ], 
          hint: 'Merhaba! Ben sizin yeni komşunuzum.', 
          explanation: 'Kendinizi tanıtarak söze giriyorsunuz. "Аз съм" (Ben ...-im) yapısı Bulgarcada isim cümlelerinin temelidir.' 
        },
        { 
          id: 'l1_nn_2', type: 'dialogue', speaker: 'Komşu', sentence: 'Здравейте! Добре дошли. Откъде сте?', answer: 'Много благодаря! Аз съм от Турция.', 
          options: [
            'Много благодаря! Аз съм от Турция.', 
            'Не искам да казвам.', 
            'Отивам на пазар.', 
            'Времето е лошо.'
          ], 
          hint: 'Çok teşekkürler! Ben Türkiyeliyim.', 
          explanation: 'Nereli olduğunuzu belirtiyorsunuz. "Откъде сте?" (Nerelisiniz?) sorusuna "Аз съм от [Ülke]" şeklinde cevap verilir.' 
        },
        { 
          id: 'l1_nn_3', type: 'dialogue', speaker: 'Komşu', sentence: 'Радвам се да се запознаем. Аз се казвам Петър.', answer: 'Приятно ми е, Петър. Аз се казвам Али.', 
          options: [
            'Къде работиш?', 
            'Довиждане, Петър.', 
            'Приятно ми е, Петър. Аз се казвам Али.', 
            'Това е моят брат.'
          ], 
          hint: 'Memnun oldum Peter. Benim adım Ali.', 
          explanation: '"Приятно ми е" (Memnun oldum) kalıbı tanışmalarda en sık kullanılan nazik ifadedir.' 
        },
        { 
          id: 'l1_nn_4', type: 'dialogue', speaker: 'Komşu', sentence: 'Ако имате нужда от нещо, почукайте на вратата ми.', answer: 'Много сте любезен, благодаря. Хубав ден!', 
          options: [
            'Много сте любезен, благодаря. Хубав ден!', 
            'Ще спя сега.', 
            'Дай ми пари.', 
            'Не те разбирам.'
          ], 
          hint: 'Çok naziksiniz, teşekkürler. İyi günler!', 
          explanation: '"Много сте любезен" (Çok naziksiniz) diyerek konuşmayı kibarca sonlandırıyorsunuz.' 
        }
      ]
    }
  },
  {
    filename: 'simulations_l1_bakery.json',
    data: {
      title: 'Seviye 1: Fırında Alışveriş',
      difficulty: 1,
      description: 'Mahalle fırınından ekmek ve poğaça alıyorsunuz. Sayılar ve rica kipleri.',
      questions: [
        { 
          id: 'l1_b_1', type: 'dialogue', speaker: 'Fırıncı', sentence: 'Добро утро! Какво ще желаете?', answer: 'Добро утро! Искам един бял хляб, моля.', 
          options: [
            'Обичам ябълки.', 
            'Къде е спирката?', 
            'Имам две котки.', 
            'Добро утро! Искам един бял хляб, моля.'
          ], 
          hint: 'Günaydın! Bir beyaz ekmek istiyorum, lütfen.', 
          explanation: '"Искам" (İstiyorum) kelimesi temel ihtiyaçları belirtirken kullanılır. "Моля" (Lütfen) nezaket bildirir.' 
        },
        { 
          id: 'l1_b_2', type: 'dialogue', speaker: 'Fırıncı', sentence: 'Ето белия хляб. Нещо сладко за закуска?', answer: 'Да, дайте ми и две кифли с мармалад.', 
          options: [
            'Да, дайте ми и две кифли с мармалад.', 
            'Не, аз съм вегетарианец.', 
            'Търся обувки.', 
            'Аз не говоря български.'
          ], 
          hint: 'Evet, bana iki tane marmelatlı poğaça (kifla) da verin.', 
          explanation: 'Bulgarcada sayılardan sonra gelen isimler çoğul olur (кифла -> кифли). "Дайте ми" (Bana verin) emir kipi olsa da alışverişte yaygındır.' 
        },
        { 
          id: 'l1_b_3', type: 'dialogue', speaker: 'Fırıncı', sentence: 'Разбира се. Общо стават 4 лева и 50 стотинки.', answer: 'Ето 5 лева. Задръжте рестото.', 
          options: [
            'Това е безплатно.', 
            'Нямам пари.', 
            'Ето 5 лева. Задръжте рестото.', 
            'Колко е часът?'
          ], 
          hint: 'İşte 5 leva. Üstü kalsın.', 
          explanation: '"Задръжте рестото" (Üstü kalsın / Para üstünü tutun), özellikle küçük hesaplarda kullanılan kibar bir bahşiş ifadesidir.' 
        },
        { 
          id: 'l1_b_4', type: 'dialogue', speaker: 'Fırıncı', sentence: 'Много благодарим! Заповядайте пак!', answer: 'Ще дойда. Довиждане!', 
          options: [
            'Кога отваряте?', 
            'Ще дойда. Довиждане!', 
            'Аз съм изморен.', 
            'Не обичам хляб.'
          ], 
          hint: 'Geleceğim. Hoşça kalın!', 
          explanation: '"Заповядайте пак" (Yine bekleriz) esnafın klasik vedasıdır.' 
        }
      ]
    }
  },
  
  // LEVEL 2
  {
    filename: 'simulations_l2_pharmacy.json',
    data: {
      title: 'Seviye 2: Eczanede İlaç Alma',
      difficulty: 2,
      description: 'Baş ağrısı için ilaç alıyorsunuz. "Трябва да" (Gereklilik) yapısı.',
      questions: [
        { 
          id: 'l2_p_1', type: 'dialogue', speaker: 'Siz', sentence: '...', answer: 'Здравейте. Имам силно главоболие. Можете ли да ми препоръчате нещо?', 
          options: [
            'Къде е болницата?', 
            'Здравейте. Имам силно главоболие. Можете ли да ми препоръчате нещо?', 
            'Трябва ми вода.', 
            'Търся лекар.'
          ], 
          hint: 'Merhaba. Şiddetli baş ağrım var. Bana bir şey önerebilir misiniz?', 
          explanation: '"Главоболие" (Baş ağrısı) kelimesi "Глава" (Baş) ve "Болка" (Ağrı) birleşimidir.' 
        },
        { 
          id: 'l2_p_2', type: 'dialogue', speaker: 'Eczacı', sentence: 'Разбира се. Имате ли алергия към някакви лекарства, например парацетамол?', answer: 'Не, нямам никакви алергии.', 
          options: [
            'Не, нямам никакви алергии.', 
            'Искам антибиотик.', 
            'Обичам шоколад.', 
            'Да, алергичен съм към котки.'
          ], 
          hint: 'Hayır, hiçbir alerjim yok.', 
          explanation: 'Bulgarcada olumsuzluk vurgulanırken "никакви" (hiçbir) ile çift olumsuzluk ("нямам никакви") yapılır.' 
        },
        { 
          id: 'l2_p_3', type: 'dialogue', speaker: 'Eczacı', sentence: 'Добре, вземете тези хапчета. Трябва да пиете по едно на всеки 8 часа.', answer: 'Трябва ли да ги пия на пълен стомах?', 
          options: [
            'Какво е стомах?', 
            'Трябва ли да ги пия на пълен стомах?', 
            'Колко струва бирата?', 
            'Не искам хапчета.'
          ], 
          hint: 'Onları tok karnına mı (dolu mideye) içmeliyim?', 
          explanation: '"Трябва ли да..." (Yapmalı mıyım?) kalıbı zorunluluk sorar. "На пълен стомах" tok karnına demektir.' 
        },
        { 
          id: 'l2_p_4', type: 'dialogue', speaker: 'Eczacı', sentence: 'Да, препоръчително е след хранене. Струват 6 лева.', answer: 'Добре, ето картата ми за плащане.', 
          options: [
            'Добре, ето картата ми за плащане.', 
            'Ще ги изхвърля.', 
            'Нямам проблеми.', 
            'Утре ще дойда.'
          ], 
          hint: 'Tamam, işte ödeme için kartım.', 
          explanation: '"Карта за плащане" banka kartı/kredi kartı anlamında kullanılır.' 
        }
      ]
    }
  },
  {
    filename: 'simulations_l2_train_station.json',
    data: {
      title: 'Seviye 2: Tren Garında',
      difficulty: 2,
      description: 'Filibe (Plovdiv) için bilet alıyorsunuz ve peronu soruyorsunuz. Gelecek zaman "Ще".',
      questions: [
        { 
          id: 'l2_ts_1', type: 'dialogue', speaker: 'Gişe Memuru', sentence: 'Следващ, моля! Накъде ще пътувате?', answer: 'Бих искал един двупосочен билет за Пловдив за утре сутрин.', 
          options: [
            'Аз съм от влака.', 
            'Бих искал един двупосочен билет за Пловдив за утре сутрин.', 
            'Колко тежи багажът?', 
            'Влакът закъснява.'
          ], 
          hint: 'Yarın sabah için Filibe\'ye bir gidiş-dönüş bileti rica ediyorum.', 
          explanation: '"Бих искал" (İsterdim / Rica ediyorum) şart kipiyle çok kibar bir isteği belirtir. "Двупосочен" (İki yönlü/gidiş-dönüş) demektir.' 
        },
        { 
          id: 'l2_ts_2', type: 'dialogue', speaker: 'Gişe Memuru', sentence: 'Има влак в 08:30 и в 10:15. Кой предпочитате?', answer: 'Ще хвана този в 08:30. Първа класа, ако е възможно.', 
          options: [
            'Не искам влак.', 
            'Ще хвана този в 08:30. Първа класа, ако е възможно.', 
            'Часът е десет.', 
            'Влакът е бърз.'
          ], 
          hint: '08:30\'dakini yakalayacağım. Mümkünse birinci sınıf.', 
          explanation: '"Ще" parçacığı Bulgarcada gelecek zaman yapar (Ще хвана = Yakalayacağım).' 
        },
        { 
          id: 'l2_ts_3', type: 'dialogue', speaker: 'Gişe Memuru', sentence: 'Да, има свободни места в първа класа. Цената е 32 лева.', answer: 'Ето парите. От кой коловоз тръгва влакът?', 
          options: [
            'Ето парите. От кой коловоз тръгва влакът?', 
            'Колко е голям Пловдив?', 
            'Аз нямам 32 лева.', 
            'Обичам да пътувам.'
          ], 
          hint: 'İşte para. Tren hangi perondan kalkıyor?', 
          explanation: 'Garlarda "peron" için genellikle "коловоз" kelimesi kullanılır.' 
        },
        { 
          id: 'l2_ts_4', type: 'dialogue', speaker: 'Gişe Memuru', sentence: 'Влакът тръгва от трети коловоз. Приятно пътуване!', answer: 'Благодаря! Желая ви спокойна смяна.', 
          options: [
            'Благодаря! Желая ви спокойна смяна.', 
            'Ще спя във влака.', 
            'Трети е лошо число.', 
            'Колко дълго?'
          ], 
          hint: 'Teşekkürler! Size sakin bir vardiya dilerim.', 
          explanation: '"Спокойна смяна" (Sakin vardiya / İyi çalışmalar), çalışan kişilere sıkça söylenen sıcak bir veda sözüdür.' 
        }
      ]
    }
  },

  // LEVEL 3
  {
    filename: 'simulations_l3_job_interview_it.json',
    data: {
      title: 'Seviye 3: Bilişim Sektöründe İş Mülakatı',
      difficulty: 3,
      description: 'Bir yazılım firmasında İK ile becerilerinizi tartışıyorsunuz. Mesleki terminoloji.',
      questions: [
        { 
          id: 'l3_it_1', type: 'dialogue', speaker: 'İK Müdürü', sentence: 'Добре дошли. Разгледахме вашето CV. Бихте ли споделили повече за опита си с уеб разработката?', answer: 'Здравейте. Имам пет години опит, главно като Front-end разработчик, използвайки React и TypeScript.', 
          options: [
            'Обичам да играя компютърни игри.', 
            'Не знам какво е уеб разработка.', 
            'Здравейте. Имам пет години опит, главно като Front-end разработчик, използвайки React и TypeScript.', 
            'Компютърът ми е счупен.'
          ], 
          hint: 'Merhaba. Temel olarak React ve TypeScript kullanarak Front-end geliştirici olarak beş yıllık tecrübem var.', 
          explanation: '"Главно" (Esas olarak/Temel olarak) kelimesi vurgu yapar. "Разработчик" yazılımcı/geliştirici demektir.' 
        },
        { 
          id: 'l3_it_2', type: 'dialogue', speaker: 'İK Müdürü', sentence: 'Чудесно. Как се справяте с работата в екип и разрешаването на конфликти?', answer: 'Вярвам, че откритата комуникация е ключът. Винаги се опитвам да разбера гледната точка на колегите си.', 
          options: [
            'Работя сам, мразя екипи.', 
            'Аз винаги съм прав.', 
            'Напускам, ако има конфликт.', 
            'Вярвам, че откритата комуникация е ключът. Винаги се опитвам да разбера гледната точка на колегите си.'
          ], 
          hint: 'Açık iletişimin anahtar olduğuna inanıyorum. Her zaman meslektaşlarımın bakış açısını anlamaya çalışırım.', 
          explanation: '"Гледна точка" (Bakış açısı) deyimi profesyonel ortamlarda çok geçer. "Открита комуникация" (Açık iletişim) aranan bir özelliktir.' 
        },
        { 
          id: 'l3_it_3', type: 'dialogue', speaker: 'İK Müdürü', sentence: 'Това е много зрял подход. Какви са вашите очаквания за заплащане?', answer: 'Търся заплата, която отговаря на отговорностите на позицията и текущите стандарти в индустрията.', 
          options: [
            'Искам милион лева.', 
            'Търся заплата, която отговаря на отговорностите на позицията и текущите стандарти в индустрията.', 
            'Заплатата не е важна за мен.', 
            'Колкото ми дадете.'
          ], 
          hint: 'Pozisyonun sorumluluklarına ve sektördeki mevcut standartlara uygun bir maaş arıyorum.', 
          explanation: '"Отговаря на..." (...\'a uygun / karşılık gelen) kalıbı müzakerelerde profesyonel bir sınır çizer.' 
        },
        { 
          id: 'l3_it_4', type: 'dialogue', speaker: 'İK Müdürü', sentence: 'Разбирам. Ще се свържем с вас до края на седмицата с обратна връзка.', answer: 'Очаквам обаждането ви. Благодаря за отделеното време!', 
          options: [
            'Очаквам обаждането ви. Благодаря за отделеното време!', 
            'Не ми се чака.', 
            'Защо толкова дълго?', 
            'Забравете за мен.'
          ], 
          hint: 'Aramanızı bekliyorum. Ayırdığınız zaman için teşekkürler!', 
          explanation: '"Обратна връзка" (Geri bildirim - Feedback) ve "Отделено време" (Ayırılan zaman) iş dünyası terimleridir.' 
        }
      ]
    }
  },
  {
    filename: 'simulations_l3_police_report.json',
    data: {
      title: 'Seviye 3: Karakolda İfade Verme',
      difficulty: 3,
      description: 'Cüzdanınızı çaldırdınız ve karakolda olayı anlatıyorsunuz. Geçmiş zaman kipleri.',
      questions: [
        { 
          id: 'l3_pr_1', type: 'dialogue', speaker: 'Polis Memuru', sentence: 'Добър ден. Какъв е проблемът? Защо искате да подадете оплакване?', answer: 'Здравейте. Преди половин час ми откраднаха портфейла в центъра на града.', 
          options: [
            'Здравейте. Преди половин час ми откраднаха портфейла в центъра на града.', 
            'Искам да стана полицай.', 
            'Намерих пари на улицата.', 
            'Изгубих се.'
          ], 
          hint: 'Merhaba. Yarım saat önce şehir merkezinde cüzdanımı çaldılar.', 
          explanation: '"Откраднаха ми портфейла" (Cüzdanımı çaldılar) geçmiş zaman (минали свършено време) cümlesidir.' 
        },
        { 
          id: 'l3_pr_2', type: 'dialogue', speaker: 'Polis Memuru', sentence: 'Разбирам. Можете ли да опишете как точно се случи това?', answer: 'Вървях по главната улица и изведнъж някой ме блъсна. После усетих, че портфейлът ми липсва.', 
          options: [
            'Не помня нищо.', 
            'Вървях по главната улица и изведнъж някой ме блъсна. После усетих, че портфейлът ми липсва.', 
            'Просто падна от джоба ми.', 
            'Аз им го дадох.'
          ], 
          hint: 'Ana caddede yürüyordum ve aniden biri bana çarptı. Sonra cüzdanımın eksik olduğunu hissettim.', 
          explanation: '"Вървях" (Yürüyordum - Sürekli geçmiş) ile "Блъсна" (Çarptı - Anlık geçmiş) fiillerinin kullanımı hikaye anlatımı için önemlidir.' 
        },
        { 
          id: 'l3_pr_3', type: 'dialogue', speaker: 'Polis Memuru', sentence: 'Успяхте ли да видите лицето на извършителя?', answer: 'За съжаление не. Беше висок мъж с тъмно яке и шапка, но не видях лицето му.', 
          options: [
            'Беше малко дете.', 
            'Да, това беше моят приятел.', 
            'За съжаление не. Беше висок мъж с тъмно яке и шапка, но не видях лицето му.', 
            'Не знам какво е извършител.'
          ], 
          hint: 'Maalesef hayır. Koyu renk ceketli ve şapkalı uzun boylu bir adamdı ama yüzünü görmedim.', 
          explanation: '"За съжаление" (Maalesef) ve fiziksel betimlemeler ("тъмно яке", "шапка") burada hedef kelimelerdir.' 
        },
        { 
          id: 'l3_pr_4', type: 'dialogue', speaker: 'Polis Memuru', sentence: 'Ще съставим протокол. Какви документи имаше в портфейла ви?', answer: 'Личната ми карта, шофьорската книжка и около 100 лева в брой.', 
          options: [
            'Нямаше нищо важно.', 
            'Личната ми карта, шофьорската книжка и около 100 лева в брой.', 
            'Само снимка на кучето ми.', 
            'Милион долара.'
          ], 
          hint: 'Kimlik kartım, ehliyetim ve yaklaşık 100 leva nakit.', 
          explanation: '"Лична карта" (Kimlik) ve "Шофьорска книжка" (Ehliyet) resmi belgelerin Bulgarca isimleridir.' 
        }
      ]
    }
  },

  // LEVEL 4
  {
    filename: 'simulations_l4_bank_mortgage.json',
    data: {
      title: 'Seviye 4: Kredi Şartlarının Müzakeresi',
      difficulty: 4,
      description: 'Bir bankada ev kredisi faiz oranlarını tartışıyorsunuz. Finansal terimler içerir.',
      questions: [
        { 
          id: 'l4_bm_1', type: 'dialogue', speaker: 'Banka Müdürü', sentence: 'Здравейте. Разгледахме документите ви за ипотечен кредит. Можем да ви предложим лихва от 4.5% на годишна база.', answer: 'Благодаря. Въпреки това, лихвеният процент ми се струва малко висок. Има ли възможност за предоговаряне?', 
          options: [
            'Съгласен съм, давайте парите.', 
            'Това е ужасно!', 
            'Благодаря. Въпреки това, лихвеният процент ми се струва малко висок. Има ли възможност за предоговаряне?', 
            'Какво е лихва?'
          ], 
          hint: 'Teşekkürler. Buna rağmen faiz oranı bana biraz yüksek geliyor. Yeniden müzakere etme imkanı var mı?', 
          explanation: '"Въпреки това" (Buna rağmen/Yine de) ve "Предоговаряне" (Yeniden müzakere) C1 seviyesi profesyonel ifadelerdir.' 
        },
        { 
          id: 'l4_bm_2', type: 'dialogue', speaker: 'Banka Müdürü', sentence: 'Разбирам позицията ви. Ако прехвърлите работната си заплата в нашата банка, можем да свалим лихвата на 3.9%.', answer: 'Това звучи доста по-приемливо. А какви са таксите за предсрочно погасяване?', 
          options: [
            'Не искам да прехвърлям нищо.', 
            'Това звучи доста по-приемливо. А какви са таксите за предсрочно погасяване?', 
            'Ще си помисля.', 
            'Какво е заплата?'
          ], 
          hint: 'Bu kulağa çok daha kabul edilebilir geliyor. Peki erken ödeme ücretleri (cezaları) nelerdir?', 
          explanation: '"Приемливо" (Kabul edilebilir) ve "Предсрочно погасяване" (Krediyi erken kapatma/ödeme) finansal dilde esastır.' 
        },
        { 
          id: 'l4_bm_3', type: 'dialogue', speaker: 'Banka Müdürü', sentence: 'Според новия закон, след първата година няма наказателна такса за предсрочно погасяване.', answer: 'Отлично. Тогава бих искал да стартираме процедурата по одобрение.', 
          options: [
            'Не ми пука за закона.', 
            'Отлично. Тогава бих искал да стартираме процедурата по одобрение.', 
            'Искам да говоря с адвокат.', 
            'Защо първата година?'
          ], 
          hint: 'Harika. O halde onay prosedürünü başlatmak isterim.', 
          explanation: '"Процедура по одобрение" (Onay süreci) resmi işlemlerde kullanılan doğru sözcüktür.' 
        },
        { 
          id: 'l4_bm_4', type: 'dialogue', speaker: 'Banka Müdürü', sentence: 'Ще подготвя предварителния договор. Ще ви трябва и оценка на имота от независим лицензиран оценител.', answer: 'Имате ли списък с препоръчани оценители, с които банката работи?', 
          options: [
            'Аз ще го оценя сам.', 
            'Какво е оценител?', 
            'Имате ли списък с препоръчани оценители, с които банката работи?', 
            'Не искам договор.'
          ], 
          hint: 'Bankanın çalıştığı önerilen değerleme uzmanlarının bir listesi var mı?', 
          explanation: '"Оценител" (Değerleme uzmanı/Eksper) kelimesi konut kredisinde kilit bir rol oynar.' 
        }
      ]
    }
  },
  {
    filename: 'simulations_l4_complaint_restaurant.json',
    data: {
      title: 'Seviye 4: Restoranda Şikayet',
      difficulty: 4,
      description: 'Lüks bir restoranda yemeğinizle ilgili ciddi bir sorunu şef garsona iletiyorsunuz.',
      questions: [
        { 
          id: 'l4_cr_1', type: 'dialogue', speaker: 'Şef Garson', sentence: 'Извинете, господине/госпожо. Има ли някакъв проблем? Забелязах, че не сте докоснали храната си.', answer: 'Да, لسъжаление има проблем. Пържолата е напълно сурова отвътре, а аз изрично я поръчах добре изпечена.', 
          options: [
            'Да, لسъжаление има проблем. Пържолата е напълно сурова отвътре, а аз изрично я поръчах добре изпечена.', 
            'Не съм гладен.', 
            'Просто гледам храната.', 
            'Всичко е перфектно.'
          ], 
          hint: 'Evet, maalesef bir sorun var. Bifteğin içi tamamen çiğ, oysa ben onu açıkça (özellikle) iyi pişmiş sipariş etmiştim.', 
          explanation: '"Изрично" (Açıkça, bilhassa) ve "Добре изпечена" (İyi pişmiş) kelimeleri spesifik memnuniyetsizliği güçlü şekilde ifade eder.' 
        },
        { 
          id: 'l4_cr_2', type: 'dialogue', speaker: 'Şef Garson', sentence: 'О, поднасям най-искрените си извинения. Веднага ще я върна в кухнята. Желаете ли нещо друго междувременно?', answer: 'Оценявам извинението ви. Не, благодаря, просто бих искал ястието ми да бъде приготвено правилно.', 
          options: [
            'Искам парите си обратно веднага!', 
            'Оценявам извинението ви. Не, благодаря, просто бих искал ястието ми да бъде приготвено правилно.', 
            'Искам безплатна бира.', 
            'Не ми пука за извиненията.'
          ], 
          hint: 'Özrünüzü takdir ediyorum. Hayır teşekkürler, sadece yemeğimin doğru şekilde hazırlanmasını isterim.', 
          explanation: '"Поднасям извинения" (Özür sunmak) çok resmi bir ifadedir. "Оценявам" (Takdir ediyorum) kalarak profesyonelce yanıt veriyorsunuz.' 
        },
        { 
          id: 'l4_cr_3', type: 'dialogue', speaker: 'Şef Garson', sentence: 'Разбира се, ще се погрижа лично. За сметка на заведението, ще ви предложим десерт по ваш избор след вечерята.', answer: 'Много любезен жест, благодаря. Надявам се втория път всичко да е наред.', 
          options: [
            'Искам два десерта.', 
            'Това е подкуп!', 
            'Не ям сладко.', 
            'Много любезен жест, благодаря. Надявам се втория път всичко да е наред.'
          ], 
          hint: 'Çok nazik bir jest, teşekkürler. Umarım ikinci seferde her şey yolunda olur.', 
          explanation: '"За сметка на заведението" (Müessesenin ikramı) anlamına gelir. Siz de durumu yatıştırarak kabul ediyorsunuz.' 
        },
        { 
          id: 'l4_cr_4', type: 'dialogue', speaker: 'Şef Garson', sentence: 'Обещавам ви, че няма да има повече разочарования. Главният готвач вече работи по новата порция.', answer: 'Добре, ще изчакам. Благодаря за бързата и адекватна реакция.', 
          options: [
            'Побързайте.', 
            'Ще видим.', 
            'Добре, ще изчакам. Благодаря за бързата и адекватна реакция.', 
            'Не вярвам на готвача.'
          ], 
          hint: 'Tamam, bekleyeceğim. Hızlı ve yeterli/uygun tepkiniz için teşekkürler.', 
          explanation: '"Адекватна реакция" (Uygun/yerinde tepki) kurumsal iletişimde kriz çözümünü takdir etmenin şık bir yoludur.' 
        }
      ]
    }
  },

  // LEVEL 5
  {
    filename: 'simulations_l5_philosophical.json',
    data: {
      title: 'Seviye 5: Teknoloji ve Gelecek Üzerine Derin Tartışma',
      difficulty: 5,
      description: 'Bir üniversite seminerinde Yapay Zekanın toplumsal etkileri üzerine tartışıyorsunuz.',
      questions: [
        { 
          id: 'l5_pt_1', type: 'dialogue', speaker: 'Profesör', sentence: 'Смятате ли, че изкуственият интелект ще доведе до масова безработица или по-скоро ще трансформира пазара на труда?', answer: 'Според мен, по-вероятно е да наблюдаваме дълбока трансформация. Автоматизацията ще премахне рутинните задачи, но ще създаде нови, изискващи креативност.', 
          options: [
            'Роботите ще ни убият всички.', 
            'Според мен, по-вероятно е да наблюдаваме дълбока трансформация. Автоматизацията ще премахне рутинните задачи, но ще създаде нови, изискващи креативност.', 
            'Не знам, не се интересувам от технологии.', 
            'Ще си намеря работа в селото.'
          ], 
          hint: 'Bence derin bir dönüşüm gözlemlememiz daha olası. Otomasyon rutin görevleri ortadan kaldıracak, ancak yaratıcılık gerektiren yenilerini yaratacaktır.', 
          explanation: 'Gelişmiş analitik düşünce. "Рутинни задачи" (Rutin görevler) ve "Дълбока трансформация" (Derin dönüşüm) C2 seviyesi tartışma ögeleridir.' 
        },
        { 
          id: 'l5_pt_2', type: 'dialogue', speaker: 'Profesör', sentence: 'Изключително точно наблюдение. Но не се ли притеснявате от факта, че образователната система изостава от тези технологични скокове?', answer: 'Абсолютно. Има остра нужда от парадигмална промяна в образованието – фокусът трябва да се измести от запаметяване към критично мислене.', 
          options: [
            'Училището е скучно така или иначе.', 
            'Учителите не знаят нищо.', 
            'Абсолютно. Има остра нужда от парадигмална промяна в образованието – фокусът трябва да се измести от запаметяване към критично мислене.', 
            'Децата трябва да играят навън.'
          ], 
          hint: 'Kesinlikle. Eğitimde paradigma değişimine şiddetli bir ihtiyaç var - odak ezberlemeden eleştirel düşünmeye kaymalıdır.', 
          explanation: '"Парадигмална промяна" (Paradigma değişimi) ve "Критично мислене" (Eleştirel düşünme) akademik dilde kilit kavramlardır.' 
        },
        { 
          id: 'l5_pt_3', type: 'dialogue', speaker: 'Profesör', sentence: 'Съгласен съм. И все пак, кой трябва да поеме отговорността за преквалификацията на текущата работна сила? Държавата или корпорациите?', answer: 'Смятам, че е необходима симбиоза между двете. Държавата трябва да създаде законодателна рамка, а корпорациите да инвестират в човешкия капитал.', 
          options: [
            'Всеки сам да се оправя.', 
            'Само държавата, те имат пари.', 
            'Смятам, че е необходима симбиоза между двете. Държавата трябва да създаде законодателна рамка, а корпорациите да инвестират в човешкия капитал.', 
            'Корпорациите са зли.'
          ], 
          hint: 'Bence ikisi arasında bir ortak yaşama (simbiyoza) ihtiyaç var. Devlet yasal bir çerçeve oluşturmalı ve şirketler insan sermayesine yatırım yapmalıdır.', 
          explanation: '"Симбиоза" (Simbiyoz/Ortak yaşam), "Законодателна рамка" (Yasal çerçeve) gibi terimler soyut düşünceyi ifade etme yeteneğinizi kanıtlar.' 
        },
        { 
          id: 'l5_pt_4', type: 'dialogue', speaker: 'Profesör', sentence: 'Блестяща аргументация! Беше истинско удоволствие да дебатирам с вас по тази толкова наболяла тема.', answer: 'Удоволствието беше изцяло мое, професоре. Темата е необятна и изисква непрекъснат обществен диалог.', 
          options: [
            'Удоволствието беше изцяло мое, професоре. Темата е необятна и изисква непрекъснат обществен диалог.', 
            'Благодаря, аз съм най-умният.', 
            'Довиждане.', 
            'Стига сме говорили за това.'
          ], 
          hint: 'Zevk tamamen bana ait profesör. Konu uçsuz bucaksız ve sürekli bir kamusal diyalog gerektiriyor.', 
          explanation: '"Наболяла тема" (Kanayan yara / Acil konu) deyimine, "Необятна" (Uçsuz bucaksız) gibi çok üst düzey edebi bir kelimeyle yanıt veriyorsunuz.' 
        }
      ]
    }
  },
  {
    filename: 'simulations_l5_contract_negotiation.json',
    data: {
      title: 'Seviye 5: Ticari Sözleşme İhtilafı',
      difficulty: 5,
      description: 'İki şirket arasında tedarik gecikmesinden kaynaklanan hukuki bir anlaşmazlığı müzakere ediyorsunuz.',
      questions: [
        { 
          id: 'l5_cn_1', type: 'dialogue', speaker: 'Tedarikçi Firma', sentence: 'Разбираме недоволството ви относно забавянето на доставките, но форсмажорните обстоятелства на границата бяха извън нашия контрол.', answer: 'Осъзнаваме сложността на ситуацията, но съгласно член 4 от договора, всяко забавяне над 10 дни подлежи на неустойки.', 
          options: [
            'Осъзнаваме сложността на ситуацията, но съгласно член 4 от договора, всяко забавяне над 10 дни подлежи на неустойки.', 
            'Ще ви съдя до дупка!', 
            'Не ме интересуват вашите оправдания, искам си стоката.', 
            'Какво е форсмажор?'
          ], 
          hint: 'Durumun karmaşıklığının farkındayız, ancak sözleşmenin 4. maddesi uyarınca 10 günü aşan her türlü gecikme cezai şartlara tabidir.', 
          explanation: '"Съгласно" (...uyarınca) ve "Неустойка" (Cezai şart/Tazminat) hukuki ve ticari metinlerin belkemiğidir.' 
        },
        { 
          id: 'l5_cn_2', type: 'dialogue', speaker: 'Tedarikçi Firma', sentence: 'Готови сме да предложим отстъпка от 15% за следващата поръчка, като жест на добра воля, за да избегнем съдебни спорове.', answer: 'Предложението ви е стъпка в правилната посока, но претърпените от нас пропуснати ползи надвишават значително тази сума.', 
          options: [
            '15 процента е нищо, искам 50!', 
            'Предложението ви е стъпка в правилната посока, но претърпените от нас пропуснати ползи надвишават значително тази сума.', 
            'Съгласен съм, давайте отстъпката.', 
            'Не искам да правя повече бизнес с вас.'
          ], 
          hint: 'Teklifiniz doğru yönde atılmış bir adım, ancak uğradığımız kâr kaybı (kaçırılan faydalar) bu tutarı önemli ölçüde aşıyor.', 
          explanation: '"Пропуснати ползи" (Mahrum kalınan kâr / Kaçırılan fırsatlar) Hukuk ve İşletme dilinde maddi zararı niteleyen terimdir.' 
        },
        { 
          id: 'l5_cn_3', type: 'dialogue', speaker: 'Tedarikçi Firma', sentence: 'Добре, нека бъдем прагматични. Ако покрием логистичните ви разходи за този месец и задържим отстъпката, бихме ли постигнали консенсус?', answer: 'Ако това споразумение бъде официализирано в анекс към текущия договор до края на деня, сме склонни да го приемем.', 
          options: [
            'Ако това споразумение бъде официализирано в анекс към текущия договор до края на деня, сме склонни да го приемем.', 
            'Не, искам още пари.', 
            'Трябва да питам шефа си.', 
            'Звучи добре, няма нужда от документи.'
          ], 
          hint: 'Eğer bu anlaşma gün sonuna kadar mevcut sözleşmeye bir zeyilname (ek) ile resmileştirilirse, kabul etme eğilimindeyiz.', 
          explanation: '"Официализирано" (Resmileştirilmiş), "Анекс" (Zeyilname/Ek belge) ve "Склонни да приемем" (Kabul etme eğiliminde olmak) kelimeleri pürüzsüz bir kurumsal diplomasi örneğidir.' 
        },
        { 
          id: 'l5_cn_4', type: 'dialogue', speaker: 'Tedarikçi Firma', sentence: 'Имаме сделка. Нашият юридически отдел ще изпрати черновата на анекса до един час.', answer: 'Очакваме я. Радвам се, че успяхме да разрешим този казус извънсъдебно.', 
          options: [
            'Очакваме я. Радвам се, че успяхме да разрешим този казус извънсъдебно.', 
            'Най-накрая свърши.', 
            'Не забравяйте отстъпката.', 
            'Чао.'
          ], 
          hint: 'Bekliyoruz. Bu vakayı/sorunu mahkeme dışında (sulh yoluyla) çözebildiğimize sevindim.', 
          explanation: '"Казус" (Vaka/Durum) ve "Извънсъдебно" (Mahkeme dışı) hukuki terimler barındıran kapanış ifadesidir.' 
        }
      ]
    }
  }
];

simulations.forEach(sim => {
  const fullPath = path.join(outDir, sim.filename);
  fs.writeFileSync(fullPath, JSON.stringify(sim.data, null, 2));
  console.log('Created: ' + sim.filename);
});
