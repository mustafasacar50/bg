const fs = require('fs');

const path = 'src/data/vocabulary/vocab_ders_1_2.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

const verbs = [
    {
        bg: "запозная се",
        tr: "tanışmak",
        pronunciation: "zapoznaya se",
        type: "fiil",
        topic: "topic_verbs",
        conjugation: {
            present: {
                "аз": "запозная се",
                "ти": "запознаеш се",
                "той/тя/то": "запознае се",
                "ние": "запознаем се",
                "вие": "запознаете се",
                "те": "запознаят се"
            },
            past: {
                "аз": "запознах се",
                "ти": "запозна се",
                "той/тя/то": "запозна се",
                "ние": "запознахме се",
                "вие": "запознахте се",
                "те": "запознаха се"
            },
            imperative: {
                "ти (sen)": "запознай се",
                "вие (siz)": "запознайте се"
            }
        },
        examples: [
            { bg: "Запознайте се!", tr: "Tanışın!" }
        ]
    },
    {
        bg: "обадя се",
        tr: "haber vermek / aramak",
        pronunciation: "obadya se",
        type: "fiil",
        topic: "topic_verbs",
        conjugation: {
            present: {
                "аз": "обадя се",
                "ти": "обадиш се",
                "той/тя/то": "обади се",
                "ние": "обадим се",
                "вие": "обадите се",
                "те": "обадят се"
            },
            past: {
                "аз": "обадих се",
                "ти": "обади се",
                "той/тя/то": "обади се",
                "ние": "обадихме се",
                "вие": "обадихте се",
                "те": "обадиха се"
            },
            imperative: {
                "ти (sen)": "обади се",
                "вие (siz)": "обадете се"
            }
        }
    },
    {
        bg: "извиня се",
        tr: "özür dilemek",
        pronunciation: "izvinya se",
        type: "fiil",
        topic: "topic_verbs",
        conjugation: {
            present: {
                "аз": "извиня се",
                "ти": "извиниш се",
                "той/тя/то": "извини се",
                "ние": "извиним се",
                "вие": "извините се",
                "те": "извинят се"
            },
            past: {
                "аз": "извиних се",
                "ти": "извини се",
                "той/тя/то": "извини се",
                "ние": "извинихме се",
                "вие": "извинихте се",
                "те": "извиниха се"
            },
            imperative: {
                "ти (sen)": "извини се",
                "вие (siz)": "извинете се / извинявайте"
            }
        }
    },
    {
        bg: "разреша",
        tr: "izin vermek",
        pronunciation: "razresha",
        type: "fiil",
        topic: "topic_verbs",
        conjugation: {
            present: {
                "аз": "разреша",
                "ти": "разрешиш",
                "той/тя/то": "разреши",
                "ние": "разрешим",
                "вие": "разрешите",
                "те": "разрешат"
            },
            past: {
                "аз": "разреших",
                "ти": "разреши",
                "той/тя/то": "разреши",
                "ние": "разрешихме",
                "вие": "разрешихте",
                "те": "разрешиха"
            },
            imperative: {
                "ти (sen)": "разреши",
                "вие (siz)": "разрешете"
            }
        }
    },
    {
        bg: "представя се",
        tr: "kendini tanıtmak",
        pronunciation: "predstavya se",
        type: "fiil",
        topic: "topic_verbs",
        conjugation: {
            present: {
                "аз": "представя се",
                "ти": "представиш се",
                "той/тя/то": "представи се",
                "ние": "представим се",
                "вие": "представите се",
                "те": "представят се"
            },
            past: {
                "аз": "представих се",
                "ти": "представи се",
                "той/тя/то": "представи се",
                "ние": "представихме се",
                "вие": "представихте се",
                "те": "представиха се"
            },
            imperative: {
                "ти (sen)": "представи се",
                "вие (siz)": "представете се"
            }
        }
    }
];

verbs.forEach(v => {
    let existing = data.words.find(w => w.bg === v.bg);
    if (existing) {
        Object.assign(existing, v);
    } else {
        data.words.push(v);
    }
});

fs.writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');
console.log('Added verbs with imperative forms.');
