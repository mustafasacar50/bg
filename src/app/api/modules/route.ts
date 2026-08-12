import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const modulesDir = path.join(process.cwd(), 'src', 'data', 'modules');
    if (!fs.existsSync(modulesDir)) {
      return NextResponse.json({ modules: [] });
    }

    const files = fs.readdirSync(modulesDir);
    const modules = [];

    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(modulesDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(content);
        
        let bgCount = 0;
        let trCount = 0;
        
        if (data.questions) {
          data.questions.forEach((q: { type: string; module: string; id: string }) => {
            const hint = (q.hint || '').toLowerCase();
            if (hint.includes('bulgarca')) bgCount++;
            else if (hint.includes('türkçe')) trCount++;
          });
        }
        
        modules.push({
          id: file.replace('.json', ''),
          title: data.title || file,
          questionCount: data.questions ? data.questions.length : 0,
          bgCount,
          trCount
        });
      }
    }

    // Sort alphabetically by ID
    modules.sort((a, b) => a.id.localeCompare(b.id));

    return NextResponse.json({ modules });
  } catch (error) {
    console.error('Error reading modules:', error);
    return NextResponse.json({ error: 'Failed to read modules' }, { status: 500 });
  }
}
