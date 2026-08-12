const fs = require('fs');

const path = 'src/data/vocabulary/vocab_ders_1_2.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

// 1. Add forms to "студент" and "студентка"
let student = data.words.find(w => w.bg === 'студент');
if (student) {
    student.forms = { "eril": "студент", "dişil": "студентка", "çoğul": "студенти" };
}
let studentka = data.words.find(w => w.bg === 'студентка');
if (studentka) {
    studentka.forms = { "eril": "студент", "dişil": "студентка", "çoğul": "студенти" };
}

// 2. Add Personal Object Pronouns (Zamirler) to vocab
const newPronouns = [
    {
        bg: "него",
        tr: "onu / ona (eril/nötr, uzun form)",
        pronunciation: "nego",
        type: "zamir",
        topic: "topic_pronouns",
        pronounForms: {
            "yalın (o)": "той / то",
            "belirtme kısa (onu)": "го",
            "belirtme uzun (onu)": "него",
            "yönelme kısa (ona)": "му",
            "yönelme uzun (ona)": "на него"
        },
        examples: [
            { bg: "Виждам него.", tr: "Onu görüyorum." },
            { bg: "Давам на него.", tr: "Ona veriyorum." }
        ]
    },
    {
        bg: "го",
        tr: "onu (eril/nötr, kısa form)",
        pronunciation: "go",
        type: "zamir",
        topic: "topic_pronouns",
        pronounForms: {
            "yalın (o)": "той / то",
            "belirtme kısa (onu)": "го",
            "belirtme uzun (onu)": "него",
            "yönelme kısa (ona)": "му",
            "yönelme uzun (ona)": "на него"
        },
        examples: [
            { bg: "Аз го виждам.", tr: "Ben onu görüyorum." }
        ]
    },
    {
        bg: "нея",
        tr: "onu / ona (dişil, uzun form)",
        pronunciation: "neya",
        type: "zamir",
        topic: "topic_pronouns",
        pronounForms: {
            "yalın (o)": "тя",
            "belirtme kısa (onu)": "я",
            "belirtme uzun (onu)": "нея",
            "yönelme kısa (ona)": "ѝ",
            "yönelme uzun (ona)": "на нея"
        },
        examples: [
            { bg: "Познавам нея.", tr: "Onu tanıyorum." }
        ]
    },
    {
        bg: "я",
        tr: "onu (dişil, kısa form)",
        pronunciation: "ya",
        type: "zamir",
        topic: "topic_pronouns",
        pronounForms: {
            "yalın (o)": "тя",
            "belirtme kısa (onu)": "я",
            "belirtme uzun (onu)": "нея",
            "yönelme kısa (ona)": "ѝ",
            "yönelme uzun (ona)": "на нея"
        },
        examples: [
            { bg: "Аз я познавам.", tr: "Ben onu tanıyorum." }
        ]
    },
    {
        bg: "им",
        tr: "onlara (çoğul, kısa form)",
        pronunciation: "im",
        type: "zamir",
        topic: "topic_pronouns",
        pronounForms: {
            "yalın (onlar)": "те",
            "belirtme kısa (onları)": "ги",
            "belirtme uzun (onları)": "тях",
            "yönelme kısa (onlara)": "им",
            "yönelme uzun (onlara)": "на тях"
        },
        examples: [
            { bg: "Казвам им истината.", tr: "Onlara gerçeği söylüyorum." }
        ]
    },
    {
        bg: "ги",
        tr: "onları (çoğul, kısa form)",
        pronunciation: "gi",
        type: "zamir",
        topic: "topic_pronouns",
        pronounForms: {
            "yalın (onlar)": "те",
            "belirtme kısa (onları)": "ги",
            "belirtme uzun (onları)": "тях",
            "yönelme kısa (onlara)": "им",
            "yönelme uzun (onlara)": "на тях"
        },
        examples: [
            { bg: "Виждам ги.", tr: "Onları görüyorum." }
        ]
    },
    {
        bg: "му",
        tr: "ona (eril/nötr, kısa form)",
        pronunciation: "mu",
        type: "zamir",
        topic: "topic_pronouns",
        pronounForms: {
            "yalın (o)": "той / то",
            "belirtme kısa (onu)": "го",
            "belirtme uzun (onu)": "него",
            "yönelme kısa (ona)": "му",
            "yönelme uzun (ona)": "на него"
        },
        examples: [
            { bg: "Казвам му.", tr: "Ona söylüyorum." }
        ]
    },
    {
        bg: "ѝ",
        tr: "ona (dişil, kısa form)",
        pronunciation: "i",
        type: "zamir",
        topic: "topic_pronouns",
        pronounForms: {
            "yalın (o)": "тя",
            "belirtme kısa (onu)": "я",
            "belirtme uzun (onu)": "нея",
            "yönelme kısa (ona)": "ѝ",
            "yönelme uzun (ona)": "на нея"
        },
        examples: [
            { bg: "Давам ѝ книгата.", tr: "Ona kitabı veriyorum." }
        ]
    },
    {
        bg: "тях",
        tr: "onları / onlara (çoğul, uzun form)",
        pronunciation: "tyah",
        type: "zamir",
        topic: "topic_pronouns",
        pronounForms: {
            "yalın (onlar)": "те",
            "belirtme kısa (onları)": "ги",
            "belirtme uzun (onları)": "тях",
            "yönelme kısa (onlara)": "им",
            "yönelme uzun (onlara)": "на тях"
        },
        examples: [
            { bg: "Обичам тях.", tr: "Onları seviyorum." }
        ]
    }
];

newPronouns.forEach(p => {
    if (!data.words.find(w => w.bg === p.bg)) {
        data.words.push(p);
    }
});

fs.writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');
console.log('Vocab updated.');
