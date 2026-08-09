const fs = require('fs'); 
const path = require('path'); 
const dir = 'src/data/modules'; 
const files = fs.readdirSync(dir); 

files.forEach(f => { 
  if(!f.endsWith('.json')) return; 
  let content = fs.readFileSync(path.join(dir, f), 'utf8'); 
  let original = content; 
  
  // Replace other prefixes
  content = content.replace(/Kelimeleri sıraya dizerek cümleyi kurunuz:\s*/g, ''); 
  content = content.replace(/Boşlukları doldurunuz:\s*/g, ''); 
  
  if (original !== content) { 
    fs.writeFileSync(path.join(dir, f), content); 
    console.log('Updated ' + f); 
  } 
});
