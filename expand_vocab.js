const fs = require('fs');

const path = 'src/data/vocabulary/vocab_ders_1_2.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

// 1. Add "искам" and "харесвам" conjugations
const verbsToAdd = [
    {
        bg: "искам",
        tr: "istemek",
        pronunciation: "iskam",
        type: "fiil",
        topic: "topic_verbs",
        conjugation: {
            present: {
                "аз": "искам",
                "ти": "искаш",
                "той/тя/то": "иска",
                "ние": "искаме",
                "вие": "искате",
                "те": "искат"
            },
            past: {
                "аз": "исках",
                "ти": "искаше",
                "той/тя/то": "искаше",
                "ние": "искахме",
                "вие": "искахте",
                "те": "искаха"
            }
        },
        examples: [
            { bg: "Искам кафе.", tr: "Kahve istiyorum." },
            { bg: "Тя не иска да дойде.", tr: "O gelmek istemiyor." }
        ]
    },
    {
        bg: "харесвам",
        tr: "beğenmek / hoşlanmak",
        pronunciation: "haresvam",
        type: "fiil",
        topic: "topic_verbs",
        conjugation: {
            present: {
                "аз": "харесвам",
                "ти": "харесваш",
                "той/тя/то": "харесва",
                "ние": "харесваме",
                "вие": "харесвате",
                "те": "харесват"
            },
            past: {
                "аз": "харесвах",
                "ти": "харесваше",
                "той/тя/то": "харесваше",
                "ние": "харесвахме",
                "вие": "харесвахте",
                "те": "харесваха"
            }
        },
        examples: [
            { bg: "Харесвам тази книга.", tr: "Bu kitabı beğeniyorum." },
            { bg: "Ние много я харесваме.", tr: "Biz onu çok beğeniyoruz." }
        ]
    }
];

verbsToAdd.forEach(verb => {
    let existing = data.words.find(w => w.bg === verb.bg);
    if (existing) {
        Object.assign(existing, verb);
    } else {
        data.words.push(verb);
    }
});

// 2. Add "такъв" and "какъв" with forms and 4 examples each
const demonstrativesToAdd = [
    {
        bg: "такъв",
        tr: "böyle (bir)",
        pronunciation: "takav",
        type: "zamir",
        topic: "topic_demonstratives",
        forms: {
            "eril": "такъв",
            "dişil": "такава",
            "nötr": "такова",
            "çoğul": "такива"
        },
        examples: [
            { bg: "Искам такъв телефон.", tr: "Böyle bir telefon istiyorum. (eril)" },
            { bg: "Тя има такава рокля.", tr: "Onun böyle bir elbisesi var. (dişil)" },
            { bg: "Това е такова нещо.", tr: "Bu böyle bir şey. (nötr)" },
            { bg: "Обичам такива филми.", tr: "Böyle filmleri severim. (çoğul)" }
        ]
    },
    {
        bg: "какъв",
        tr: "nasıl / hangi",
        pronunciation: "kakav",
        type: "zamir",
        topic: "topic_questions",
        forms: {
            "eril": "какъв",
            "dişil": "каква",
            "nötr": "какво",
            "çoğul": "какви"
        },
        examples: [
            { bg: "Какъв е този човек?", tr: "Bu nasıl bir adam? (eril)" },
            { bg: "Каква е тази книга?", tr: "Bu nasıl bir kitap? (dişil)" },
            { bg: "Какво е това?", tr: "Bu nedir/nasıl bir şey? (nötr)" },
            { bg: "Какви са тези хора?", tr: "Bunlar nasıl insanlar? (çoğul)" }
        ]
    }
];

demonstrativesToAdd.forEach(dem => {
    let existing = data.words.find(w => w.bg === dem.bg);
    if (existing) {
        Object.assign(existing, dem);
    } else {
        data.words.push(dem);
    }
});

// 3. Update "този" and "онзи" to have 4 examples each
let tozi = data.words.find(w => w.bg === 'този');
if (tozi) {
    tozi.examples = [
        { bg: "Този мъж е уморен.", tr: "Bu adam yorgun. (eril)" },
        { bg: "Тази жена е красива.", tr: "Bu kadın güzel. (dişil)" },
        { bg: "Това дете играе.", tr: "Bu çocuk oynuyor. (nötr)" },
        { bg: "Тези хора са тук.", tr: "Bu insanlar burada. (çoğul)" }
    ];
}

let onzi = data.words.find(w => w.bg === 'онзи');
if (onzi) {
    onzi.examples = [
        { bg: "Онзи компютър е бърз.", tr: "Şu bilgisayar hızlı. (eril)" },
        { bg: "Онази кола е нова.", tr: "Şu araba yeni. (dişil)" },
        { bg: "Онова момче чете.", tr: "Şu çocuk okuyor. (nötr)" },
        { bg: "Онези студенти учат.", tr: "Şu öğrenciler ders çalışıyor. (çoğul)" }
    ];
}

// 4. Update "момиче" to have nounForms (singular/plural)
let momiche = data.words.find(w => w.bg === 'момиче');
if (momiche) {
    momiche.nounForms = {
        "tekil": "момиче",
        "tekil_belirli": "момичето",
        "çoğul": "момичета",
        "çoğul_belirli": "момичетата"
    };
} else {
    data.words.push({
        bg: "момиче",
        tr: "kız (çocuk)",
        pronunciation: "momiche",
        type: "isim",
        gender: "nötr",
        nounForms: {
            "tekil": "момиче",
            "tekil_belirli": "момичето",
            "çoğul": "момичета",
            "çoğul_belirli": "момичетата"
        },
        examples: [
            { bg: "Това момиче е умно.", tr: "Bu kız zeki." },
            { bg: "Момичетата играят в парка.", tr: "Kızlar parkta oynuyor." }
        ]
    });
}

// Ensure "рокля" is also properly structured if present
let roklya = data.words.find(w => w.bg === 'рокля');
if (roklya) {
    roklya.nounForms = {
        "tekil": "рокля",
        "tekil_belirli": "роклята",
        "çoğul": "рокли",
        "çoğul_belirli": "роклите"
    };
} else {
    data.words.push({
        bg: "рокля",
        tr: "elbise",
        pronunciation: "roklya",
        type: "isim",
        gender: "dişil",
        nounForms: {
            "tekil": "рокля",
            "tekil_belirli": "роклята",
            "çoğul": "рокли",
            "çoğul_belirli": "роклите"
        },
        examples: [
            { bg: "Искам такава рокля.", tr: "Böyle bir elbise istiyorum." }
        ]
    });
}


fs.writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');
console.log('Words updated and expanded successfully.');
