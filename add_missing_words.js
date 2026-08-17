const fs = require('fs');
const path = require('path');

const vocabFile = 'D:/bulgarca_sınav_modulu/exam-app/src/data/vocabulary/vocab_ders_1_2.json';
const indexFile = 'D:/bulgarca_sınav_modulu/exam-app/src/data/vocabulary/vocab_ders_1_2_index.json';

const vocab = JSON.parse(fs.readFileSync(vocabFile, 'utf8'));
const index = JSON.parse(fs.readFileSync(indexFile, 'utf8'));

const newWords = [
  {
    bg: "фонетичния",
    tr: "fonetik (belirli)",
    type: "SIFAT",
    examples: ["фонетичен кабинет (fonetik laboratuvarı)"],
    audio: "",
    tags: ["ders6", "sıfat"]
  },
  {
    bg: "кабинет",
    tr: "çalışma odası / laboratuvar",
    type: "İSİM",
    examples: ["фонетичен кабинет (fonetik laboratuvarı)"],
    audio: "",
    tags: ["ders6", "isim"]
  },
  {
    bg: "провеждам",
    tr: "yapmak / gerçekleştirmek",
    type: "FİİL",
    examples: ["провеждаме занятия (ders yapıyoruz)"],
    audio: "",
    tags: ["ders6", "fiil"]
  },
  {
    bg: "практическите",
    tr: "uygulamalı (belirli)",
    type: "SIFAT",
    examples: ["практически занятия (uygulamalı dersler)"],
    audio: "",
    tags: ["ders6", "sıfat"]
  },
  {
    bg: "занятия",
    tr: "dersler / meşguliyetler",
    type: "İSİM",
    examples: ["практически занятия (uygulamalı dersler)"],
    audio: "",
    tags: ["ders6", "isim"]
  }
];

// Add to vocab
for (const nw of newWords) {
  if (!vocab.words.find(w => w.bg === nw.bg)) {
    vocab.words.push(nw);
  }
}

// Add to index
index["фонетичния"] = "фонетичния";
index["кабинет"] = "кабинет";
index["провеждаме"] = "провеждам";
index["провеждам"] = "провеждам";
index["практическите"] = "практическите";
index["занятия"] = "занятия";

fs.writeFileSync(vocabFile, JSON.stringify(vocab, null, 2));
fs.writeFileSync(indexFile, JSON.stringify(index, null, 2));

console.log('Added missing words to dictionary.');
