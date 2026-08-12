const fs = require('fs');

const path = 'src/data/vocabulary/vocab_ders_1_2.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

const newNouns = [
    { bg: "работа", tr: "iş, çalışma", type: "isim", nounForms: { "tekil": "работа", "tekil_belirli": "работата", "çoğul": "работи", "çoğul_belirli": "работите" } },
    { bg: "държава", tr: "devlet", type: "isim", nounForms: { "tekil": "държава", "tekil_belirli": "държавата", "çoğul": "държави", "çoğul_belirli": "държавите" } },
    { bg: "страна", tr: "ülke", type: "isim", nounForms: { "tekil": "страна", "tekil_belirli": "страната", "çoğul": "страни", "çoğul_belirli": "страните" } },
    { bg: "университет", tr: "üniversite", type: "isim", nounForms: { "tekil": "университет", "tekil_belirli": "университетът", "çoğul": "университети", "çoğul_belirli": "университетите" } },
    { bg: "празник", tr: "bayram", type: "isim", nounForms: { "tekil": "празник", "tekil_belirli": "празникът", "çoğul": "празници", "çoğul_belirli": "празниците" } },
    { bg: "успех", tr: "başarı", type: "isim", nounForms: { "tekil": "успех", "tekil_belirli": "успехът", "çoğul": "успехи", "çoğul_belirli": "успехите" } },
    { bg: "център", tr: "merkez", type: "isim", nounForms: { "tekil": "център", "tekil_belirli": "центърът", "çoğul": "центрове", "çoğul_belirli": "центровете" } },
    { bg: "хотел", tr: "otel", type: "isim", nounForms: { "tekil": "хотел", "tekil_belirli": "хотелът", "çoğul": "хотели", "çoğul_belirli": "хотелите" } },
    { bg: "телефон", tr: "telefon", type: "isim", nounForms: { "tekil": "телефон", "tekil_belirli": "телефонът", "çoğul": "телефони", "çoğul_belirli": "телефоните" } },
    { bg: "националност", tr: "milliyet", type: "isim", nounForms: { "tekil": "националност", "tekil_belirli": "националността", "çoğul": "националности", "çoğul_belirli": "националностите" } },
    { bg: "почивка", tr: "tatil", type: "isim", nounForms: { "tekil": "почивка", "tekil_belirli": "почивката", "çoğul": "почивки", "çoğul_belirli": "почивките" } },
    { bg: "звук", tr: "ses", type: "isim", nounForms: { "tekil": "звук", "tekil_belirli": "звукът", "çoğul": "звукове", "çoğul_belirli": "звуковете" } },
    { bg: "буква", tr: "harf", type: "isim", nounForms: { "tekil": "буква", "tekil_belirli": "буквата", "çoğul": "букви", "çoğul_belirli": "буквите" } },
    { bg: "помощ", tr: "yardım", type: "isim", nounForms: { "tekil": "помощ", "tekil_belirli": "помощта", "çoğul": "помощи", "çoğul_belirli": "помощите" } }
];

newNouns.forEach(v => {
    let existing = data.words.find(w => w.bg === v.bg);
    if (existing) {
        Object.assign(existing, v);
    } else {
        data.words.push(v);
    }
});

fs.writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');
console.log('Bulk added Nouns!');
