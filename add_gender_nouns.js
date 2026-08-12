const fs = require('fs');

const path = 'src/data/vocabulary/vocab_ders_1_2.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

const nouns = [
    {
        bg: "колега",
        tr: "meslektaş",
        pronunciation: "kolega",
        type: "isim",
        topic: "topic_nouns",
        forms: {
            "eril": "колега",
            "dişil": "колежка",
            "çoğul": "колеги"
        }
    },
    {
        bg: "приятел",
        tr: "arkadaş",
        pronunciation: "priyatel",
        type: "isim",
        topic: "topic_nouns",
        forms: {
            "eril": "приятел",
            "dişil": "приятелка",
            "çoğul": "приятели"
        }
    }
];

nouns.forEach(n => {
    let existing = data.words.find(w => w.bg === n.bg);
    if (existing) {
        Object.assign(existing, n);
    } else {
        data.words.push(n);
    }
});

fs.writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');
console.log('Added kolega and priyatel with gender forms.');
