const fs = require('fs');
const db = fs.readFileSync('src/data/mockDB.ts', 'utf8');

const qMatches = db.match(/module:\s*['"]m3['"]/g);
console.log('M3 Questions:', qMatches ? qMatches.length : 0);

const vMatches = db.match(/topic:\s*['"][^'"]*3[^'"]*['"]/g); // Roughly finding module 3 topics
console.log('M3 Topics:', vMatches ? vMatches.length : 0);
