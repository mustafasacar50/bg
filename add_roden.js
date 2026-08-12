const fs = require('fs');

const path = 'src/data/vocabulary/vocab_ders_1_2.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

// Add "роден"
if (!data.words.find(w => w.bg === 'роден')) {
    data.words.push({
        bg: "роден",
        tr: "doğmuş (sıfat)",
        pronunciation: "roden",
        type: "sıfat",
        topic: "topic_adjectives",
        forms: {
            "eril": "роден",
            "dişil": "родена",
            "nötr": "родено",
            "çoğul": "родени"
        },
        examples: [
            { bg: "Аз съм родена в Турция.", tr: "Ben Türkiye'de doğdum. (kadın söyler)" },
            { bg: "Той е роден в България.", tr: "O, Bulgaristan'da doğdu." }
        ]
    });
}

fs.writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');
console.log('Added roden to vocab.');
