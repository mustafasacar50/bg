const fs = require('fs');

const path = 'src/data/vocabulary/vocab_ders_1_2.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

const newVerbs = [
    {
        bg: "вървя",
        tr: "yürümek",
        pronunciation: "varvya",
        type: "fiil",
        topic: "topic_verbs",
        conjugation: {
            present: {
                "аз": "вървя",
                "ти": "вървиш",
                "той/тя/то": "върви",
                "ние": "вървим",
                "вие": "вървите",
                "те": "вървят"
            },
            past: {
                "аз": "вървях",
                "ти": "вървя",
                "той/тя/то": "вървя",
                "ние": "вървяхме",
                "вие": "вървяхте",
                "те": "вървяха"
            }
        },
        examples: [
            { bg: "Ние вървяхме дълго.", tr: "Biz uzun süre yürüdük." },
            { bg: "Аз вървя към парка.", tr: "Parka doğru yürüyorum." }
        ]
    },
    {
        bg: "успея",
        tr: "başarmak",
        pronunciation: "uspeya",
        type: "fiil",
        topic: "topic_verbs",
        conjugation: {
            present: {
                "аз": "успея",
                "ти": "успееш",
                "той/тя/то": "успее",
                "ние": "успеем",
                "вие": "успеете",
                "те": "успеят"
            },
            past: {
                "аз": "успях",
                "ти": "успя",
                "той/тя/то": "успя",
                "ние": "успяхме",
                "вие": "успяхте",
                "те": "успяха"
            }
        },
        examples: [
            { bg: "Не успяхме да го направим.", tr: "Bunu yapmayı başaramadık." }
        ]
    },
    {
        bg: "изкача",
        tr: "tırmanmak / çıkmak",
        pronunciation: "izkacha",
        type: "fiil",
        topic: "topic_verbs",
        conjugation: {
            present: {
                "аз": "изкача",
                "ти": "изкачиш",
                "той/тя/то": "изкачи",
                "ние": "изкачим",
                "вие": "изкачите",
                "те": "изкачат"
            },
            past: {
                "аз": "изкачих",
                "ти": "изкачи",
                "той/тя/то": "изкачи",
                "ние": "изкачихме",
                "вие": "изкачихте",
                "те": "изкачиха"
            }
        },
        examples: [
            { bg: "Трябва да изкачим върха.", tr: "Tepeye tırmanmalıyız." }
        ]
    }
];

newVerbs.forEach(verb => {
    if (!data.words.find(w => w.bg === verb.bg)) {
        data.words.push(verb);
    }
});

fs.writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');
console.log('Verbs added to vocab.');
