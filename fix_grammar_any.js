const fs = require('fs');

let c = fs.readFileSync('src/app/api/grammar-analysis/route.ts', 'utf8');

c = c.replace(/import \{ NextResponse \} from 'next\/server';/, `import { NextResponse } from 'next/server';\n\ninterface GrammarWord {\n  bg: string;\n  type?: string;\n  conjugation?: Record<string, Record<string, string>>;\n  forms?: Record<string, string>;\n  nounForms?: Record<string, string>;\n  pronounForms?: Record<string, string>;\n  matchedReason?: string;\n  [key: string]: unknown;\n}`);
c = c.replace(/any\[\]/g, 'GrammarWord[]');
c = c.replace(/\(w: any\)/g, '(w: GrammarWord)');
c = c.replace(/forms as any/g, 'forms as Record<string, string>');
c = c.replace(/\(f: any\)/g, '(f: string)');
c = c.replace(/Map<string, any>/g, 'Map<string, GrammarWord>');
c = c.replace(/as any\[\]/g, 'as GrammarWord[]');

fs.writeFileSync('src/app/api/grammar-analysis/route.ts', c);
console.log('Fixed src/app/api/grammar-analysis/route.ts');
