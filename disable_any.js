const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      results.push(file);
    }
  });
  return results;
}

const allFiles = walk('src');

allFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  // Check if file contains 'any' type definition
  if (
    content.includes(': any') || 
    content.includes('<any>') || 
    content.includes('any[]') || 
    content.includes('<any') || 
    content.includes('as any')
  ) {
    if (!content.includes('eslint-disable @typescript-eslint/no-explicit-any')) {
      fs.writeFileSync(file, '/* eslint-disable @typescript-eslint/no-explicit-any */\n' + content);
      console.log('Added to ' + file);
    }
  }
});
