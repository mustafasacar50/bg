const fs = require('fs');

const path = 'src/data/vocabulary/vocab_ders_1_2.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

const newPronouns = [
    {
        bg: "се",
        tr: "kendi kendini (belirtme dönüşlü zamir)",
        type: "zamir",
        pronounForms: {
            "belirtme": "се"
        },
        notes: "Dönüşlü fiillerle birlikte kullanılır (örn. радвам се, казвам се). Eylemin özneye geri döndüğünü belirtir."
    },
    {
        bg: "си",
        tr: "kendine / kendi (yönelme/iyelik dönüşlü zamir)",
        type: "zamir",
        pronounForms: {
            "yönelme": "си"
        },
        notes: "Öznenin kendisine ait olan nesneleri belirtirken kullanılır. Örn: 'съпруга си' (kendi eşimi), 'колата си' (kendi arabamı)."
    }
];

newPronouns.forEach(v => {
    let existing = data.words.find(w => w.bg === v.bg);
    if (existing) {
        Object.assign(existing, v);
    } else {
        data.words.push(v);
    }
});

fs.writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');
console.log('Added се and си');
