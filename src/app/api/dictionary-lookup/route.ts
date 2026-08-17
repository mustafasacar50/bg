import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const word = searchParams.get('word')?.toLowerCase().trim();

    if (!word) {
      return NextResponse.json({ error: 'Word parameter is required' }, { status: 400 });
    }

    const vocabDir = path.join(process.cwd(), 'src/data/vocabulary');
    if (!fs.existsSync(vocabDir)) {
      return NextResponse.json({ found: false });
    }

    const files = fs.readdirSync(vocabDir);
    const indexFiles = files.filter(f => f.endsWith('_index.json'));

    let foundCard = null;

    for (const idxFile of indexFiles) {
      const indexFilePath = path.join(vocabDir, idxFile);
      const indexData = JSON.parse(fs.readFileSync(indexFilePath, 'utf8'));

      // 1. Exact match
      let baseId = indexData[word];

      // 2. Partial match
      if (!baseId) {
        const possibleKey = Object.keys(indexData).find(k => k.includes(word) || word.includes(k));
        if (possibleKey) {
          baseId = indexData[possibleKey];
        }
      }

      if (baseId) {
        // Find the corresponding vocab file
        const vocabFileName = idxFile.replace('_index.json', '.json');
        const vocabFilePath = path.join(vocabDir, vocabFileName);
        
        if (fs.existsSync(vocabFilePath)) {
          const vocabData = JSON.parse(fs.readFileSync(vocabFilePath, 'utf8'));
          const card = vocabData.words.find((w: { bg: string }) => w.bg.toLowerCase() === baseId.toLowerCase());
          
          if (card) {
            foundCard = card;
            break; // Stop searching once found
          }
        }
      }
    }

    if (foundCard) {
      return NextResponse.json({ found: true, card: foundCard });
    }

    return NextResponse.json({ found: false });

  } catch (error) {
    console.error('Dictionary lookup error:', error);
    return NextResponse.json({ error: 'Failed to lookup word' }, { status: 500 });
  }
}
