const fs = require('fs');

const path = 'src/data/vocabulary/vocab_ders_1_2.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

const newVerbs = [
    {
        bg: "чувам",
        tr: "duymak (imperfective)",
        type: "fiil",
        conjugation: {
            present: { "аз": "чувам", "ти": "чуваш", "той/тя/то": "чува", "ние": "чуваме", "вие": "чувате", "те": "чуват" },
            past: { "аз": "чувах", "ти": "чуваше", "той/тя/то": "чуваше", "ние": "чувахме", "вие": "чувахте", "те": "чуваха" },
            imperative: { "ти (sen)": "чувай", "вие (siz)": "чувайте" }
        }
    },
    {
        bg: "чуя",
        tr: "duymak (perfective)",
        type: "fiil",
        conjugation: {
            present: { "аз": "чуя", "ти": "чуеш", "той/тя/то": "чуе", "ние": "чуем", "вие": "чуете", "те": "чуят" },
            past: { "аз": "чух", "ти": "чу", "той/тя/то": "чу", "ние": "чухме", "вие": "чухте", "те": "чуха" },
            imperative: { "ти (sen)": "чуй", "вие (siz)": "чуйте" }
        }
    }
];

newVerbs.forEach(v => {
    let existing = data.words.find(w => w.bg === v.bg);
    if (existing) {
        Object.assign(existing, v);
    } else {
        data.words.push(v);
    }
});

fs.writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');
console.log('Added чуя and чувам');
