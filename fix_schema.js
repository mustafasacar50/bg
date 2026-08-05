const fs = require('fs');

const data = JSON.parse(fs.readFileSync('src/data/questions.json', 'utf8'));

const fixedData = data.map(q => {
  if (q.type === 'mcq') {
    // Check if it's already in the old format
    if (q.options[0] && typeof q.options[0] === 'object') return q;
    
    const newOptions = q.options.map((optText, index) => ({
      id: `opt${index + 1}`,
      text: optText
    }));
    
    const correctOpt = newOptions.find(o => o.text === q.correctAnswer);
    
    return {
      ...q,
      options: newOptions,
      answer: correctOpt ? correctOpt.id : 'opt1'
    };
  }
  
  if (q.type === 'match' || q.type === 'matching') {
    if (q.options && q.options[0] && typeof q.options[0] === 'object') return q;
    
    q.type = 'match';
    
    // original: pairs: [{left: "...", right: "..."}]
    if (q.pairs && q.pairs[0].left) {
      const newOptions = q.pairs.map((p, index) => ({
        id: `opt${index + 1}`,
        text: p.right
      }));
      
      const newPairs = q.pairs.map((p, index) => ({
        word: p.left,
        match: `opt${index + 1}`
      }));
      
      // Shuffle options
      newOptions.sort(() => 0.5 - Math.random());
      
      return {
        ...q,
        pairs: newPairs,
        options: newOptions
      };
    }
    return q;
  }
  
  if (q.type === 'blank' || q.type === 'fill_in_blank') {
    q.type = 'blank';
    if (q.answers) return q; // already in old format
    
    let sentence = q.question;
    // Extract hint from question text: "Cümleyi uygun kelime ile tamamlayınız.\n(İpucu: BEN ELMA YİYORUM.)\n\nАЗ {blank} ЯБЪЛКА."
    const lines = sentence.split('\n');
    let hintText = "";
    if (lines.length > 1) {
      const hintLine = lines.find(l => l.includes("İpucu:"));
      if (hintLine) {
        hintText = hintLine.replace("(İpucu: ", "").replace(")", "");
      }
      sentence = lines[lines.length - 1]; // the actual sentence
    }
    
    sentence = sentence.replace('{blank}', '____');
    
    return {
      ...q,
      sentence: sentence,
      hint: hintText,
      answers: {
        [q.id]: q.correctAnswer
      }
    };
  }
  
  return q;
});

fs.writeFileSync('src/data/questions.json', JSON.stringify(fixedData, null, 2));
console.log('Fixed questions.json!');
