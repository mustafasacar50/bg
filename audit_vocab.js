const fs = require('fs');

function audit(filename, label) {
  const v = JSON.parse(fs.readFileSync(filename, 'utf8'));
  const issues = [];
  v.words.forEach(w => {
    const problems = [];
    if (w.type === 'otomatik') problems.push('TIP=otomatik');
    if (w.type === 'isim' && !w.nounForms) problems.push('nounForms_YOK');
    if (w.type === 'sifat' && !w.forms) problems.push('forms_YOK');
    if (w.type === 'fiil' && !w.conjugation) problems.push('conjugation_YOK');
    if (w.type === 'zamir' && !w.pronounForms && !w.forms && !w.notes) problems.push('table_YOK');
    if (!w.examples || w.examples.length === 0) problems.push('ornek_YOK');
    if (problems.length > 0) issues.push({ bg: w.bg, tr: w.tr, type: w.type, problems });
  });
  console.log('\n=== ' + label + ' SORUNLAR (' + issues.length + ') ===');
  issues.forEach(i => console.log('  [' + i.type + '] ' + i.bg + ' | ' + i.problems.join(', ')));
  return issues;
}

const d12 = audit('src/data/vocabulary/vocab_ders_1_2.json', 'DERS 1-2');
const d3 = audit('src/data/vocabulary/vocab_ders_3.json', 'DERS 3');
