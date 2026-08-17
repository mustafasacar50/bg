const fs = require('fs');
const path = 'D:/bulgarca_sınav_modulu/exam-app/src/data/modules/balgoc___Bulgarca_A1_Ders_6.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

data.questions.forEach(q => {
  if (!q.hint || (!q.hint.toLowerCase().includes('bulgarca') && !q.hint.toLowerCase().includes('türkçe'))) {
    q.hint = 'Bulgarca';
  }
});

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log('Fixed hints for ' + data.questions.length + ' questions.');
