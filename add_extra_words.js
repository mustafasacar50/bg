const fs = require('fs');

const path = 'src/data/vocabulary/vocab_ders_1_2.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

// Only adding a subset of important ones
const moreNouns = [
    { bg: "име", tr: "isim, ad", type: "isim", nounForms: { "tekil": "име", "tekil_belirli": "името", "çoğul": "имена", "çoğul_belirli": "имената" } },
    { bg: "дума", tr: "kelime", type: "isim", nounForms: { "tekil": "дума", "tekil_belirli": "думата", "çoğul": "думи", "çoğul_belirli": "думите" } },
    { bg: "език", tr: "dil", type: "isim", nounForms: { "tekil": "език", "tekil_belirli": "езикът", "çoğul": "езици", "çoğul_belirli": "езиците" } },
    { bg: "колеж", tr: "kolej", type: "isim", nounForms: { "tekil": "колеж", "tekil_belirli": "колежът", "çoğul": "колежи", "çoğul_belirli": "колежите" } },
    { bg: "факултет", tr: "fakülte", type: "isim", nounForms: { "tekil": "факултет", "tekil_belirli": "факултетът", "çoğul": "факултети", "çoğul_belirli": "факултетите" } },
    { bg: "утро", tr: "sabah", type: "isim", nounForms: { "tekil": "утро", "tekil_belirli": "утрото", "çoğul": "утрини", "çoğul_belirli": "утрините" } },
    { bg: "нощ", tr: "gece", type: "isim", nounForms: { "tekil": "нощ", "tekil_belirli": "нощта", "çoğul": "нощи", "çoğul_belirli": "нощите" } },
    { bg: "момиче", tr: "kız çocuğu", type: "isim", nounForms: { "tekil": "момиче", "tekil_belirli": "момичето", "çoğul": "момичета", "çoğul_belirli": "момичетата" } },
    { bg: "пожелание", tr: "dilek", type: "isim", nounForms: { "tekil": "пожелание", "tekil_belirli": "пожеланието", "çoğul": "пожелания", "çoğul_belirli": "пожеланията" } },
    { bg: "сричка", tr: "hece", type: "isim", nounForms: { "tekil": "сричка", "tekil_belirli": "сричката", "çoğul": "срички", "çoğul_belirli": "сричките" } },
    { bg: "нация", tr: "ulus, millet", type: "isim", nounForms: { "tekil": "нация", "tekil_belirli": "нацията", "çoğul": "нации", "çoğul_belirli": "нациите" } }
];

const newVerbs = [
    {
        bg: "живея",
        tr: "yaşamak",
        type: "fiil",
        conjugation: {
            present: { "аз": "живея", "ти": "живееш", "той/тя/то": "живее", "ние": "живеем", "вие": "живеете", "те": "живеят" },
            past: { "аз": "живях", "ти": "живя", "той/тя/то": "живя", "ние": "живяхме", "вие": "живяхте", "те": "живяха" },
            imperative: { "ти (sen)": "живей", "вие (siz)": "живейте" }
        }
    },
    {
        bg: "позволя",
        tr: "izin vermek (perfective)",
        type: "fiil",
        conjugation: {
            present: { "аз": "позволя", "ти": "позволиш", "той/тя/то": "позволи", "ние": "позволим", "вие": "позволите", "те": "позволят" },
            past: { "аз": "позволих", "ти": "позволи", "той/тя/то": "позволи", "ние": "позволихме", "вие": "позволихте", "те": "позволиха" },
            imperative: { "ти (sen)": "позволи", "вие (siz)": "позволете" }
        }
    },
    {
        bg: "бъда",
        tr: "olmak (gelecek / mastar formu)",
        type: "fiil",
        conjugation: {
            present: { "аз": "бъда", "ти": "бъдеш", "той/тя/то": "бъде", "ние": "бъдем", "вие": "бъдете", "те": "бъдат" },
            imperative: { "ти (sen)": "бъди", "вие (siz)": "бъдете" }
        }
    },
    {
        bg: "напиша",
        tr: "yazmak (perfective)",
        type: "fiil",
        conjugation: {
            present: { "аз": "напиша", "ти": "напишеш", "той/тя/то": "напише", "ние": "напишем", "вие": "напишете", "те": "напишат" },
            past: { "аз": "написах", "ти": "написа", "той/тя/то": "написа", "ние": "написахме", "вие": "написахте", "те": "написаха" },
            imperative: { "ти (sen)": "напиши", "вие (siz)": "напишете" }
        }
    }
];

const newNationalities = [
    {
        bg: "българин",
        tr: "Bulgar (milliyet)",
        type: "isim",
        forms: {
            "eril": "българин",
            "dişil": "българка",
            "çoğul": "българи"
        }
    },
    {
        bg: "турчин",
        tr: "Türk (milliyet)",
        type: "isim",
        forms: {
            "eril": "турчин",
            "dişil": "туркиня",
            "çoğul": "турци"
        }
    },
    {
        bg: "чужденец",
        tr: "yabancı",
        type: "isim",
        forms: {
            "eril": "чужденец",
            "dişil": "чужденка",
            "çoğul": "чужденци"
        }
    }
];

[...moreNouns, ...newVerbs, ...newNationalities].forEach(v => {
    let existing = data.words.find(w => w.bg === v.bg);
    if (existing) {
        Object.assign(existing, v);
    } else {
        data.words.push(v);
    }
});

fs.writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');
console.log('Added more words discovered in lessons');
