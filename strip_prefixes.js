const fs = require('fs'); 
const path = require('path'); 
const dir = 'src/data/modules'; 
const files = fs.readdirSync(dir); 

files.forEach(f => { 
  if(!f.endsWith('.json')) return; 
  let content = fs.readFileSync(path.join(dir, f), 'utf8'); 
  let original = content; 
  
  // Replace "Çeviriniz (Bulgarcası: <text>)" with "<text>"
  content = content.replace(/Çeviriniz \(Bulgarcası:\s*(.*?)\)/g, '$1'); 
  // Replace "Çeviriniz (Türkçesi: <text>)" with "<text>"
  content = content.replace(/Çeviriniz \(Türkçesi:\s*(.*?)\)/g, '$1'); 
  
  if (original !== content) { 
    fs.writeFileSync(path.join(dir, f), content); 
    console.log('Updated ' + f); 
  } 
});
