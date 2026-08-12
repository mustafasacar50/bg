const fs = require('fs');

const path = 'src/data/vocabulary/vocab_ders_1_2.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

// 1. Remove "студентка" to avoid duplicates (since "студент" has forms covering it)
data.words = data.words.filter(w => w.bg !== 'студентка');

// 2. Remove the standalone pronoun forms we added previously
const removePronouns = ['него', 'го', 'нея', 'я', 'им', 'ги', 'му', 'ѝ', 'тях'];
data.words = data.words.filter(w => !(w.type === 'zamir' && removePronouns.includes(w.bg)));

// 3. Update the base nominative pronouns with their full pronounForms
const pronounMap = {
    "аз": {
        "yalın (ben)": "аз",
        "belirtme kısa (beni)": "ме",
        "belirtme uzun (beni)": "мене",
        "yönelme kısa (bana)": "ми",
        "yönelme uzun (bana)": "на мене"
    },
    "ти": {
        "yalın (sen)": "ти",
        "belirtme kısa (seni)": "те",
        "belirtme uzun (seni)": "тебе",
        "yönelme kısa (sana)": "ти",
        "yönelme uzun (sana)": "на тебе"
    },
    "той": {
        "yalın (o)": "той",
        "belirtme kısa (onu)": "го",
        "belirtme uzun (onu)": "него",
        "yönelme kısa (ona)": "му",
        "yönelme uzun (ona)": "на него"
    },
    "тя": {
        "yalın (o)": "тя",
        "belirtme kısa (onu)": "я",
        "belirtme uzun (onu)": "нея",
        "yönelme kısa (ona)": "ѝ",
        "yönelme uzun (ona)": "на нея"
    },
    "то": {
        "yalın (o)": "то",
        "belirtme kısa (onu)": "го",
        "belirtme uzun (onu)": "него",
        "yönelme kısa (ona)": "му",
        "yönelme uzun (ona)": "на него"
    },
    "ние": {
        "yalın (biz)": "ние",
        "belirtme kısa (bizi)": "ни",
        "belirtme uzun (bizi)": "нас",
        "yönelme kısa (bize)": "ни",
        "yönelme uzun (bize)": "на нас"
    },
    "вие": {
        "yalın (siz)": "вие",
        "belirtme kısa (sizi)": "ви",
        "belirtme uzun (sizi)": "вас",
        "yönelme kısa (size)": "ви",
        "yönelme uzun (size)": "на вас"
    },
    "те": {
        "yalın (onlar)": "те",
        "belirtme kısa (onları)": "ги",
        "belirtme uzun (onları)": "тях",
        "yönelme kısa (onlara)": "им",
        "yönelme uzun (onlara)": "на тях"
    }
};

data.words.forEach(w => {
    if (w.type === 'zamir' && pronounMap[w.bg]) {
        w.pronounForms = pronounMap[w.bg];
    }
});

fs.writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');
console.log('Vocab cleaned and updated.');
