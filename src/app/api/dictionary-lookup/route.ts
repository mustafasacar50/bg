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

    // Load rich vocabulary and index
    const vocabDir = path.join(process.cwd(), 'src/data/vocabulary');
    const vocabFile = path.join(vocabDir, 'vocab_ders_1_2.json');
    const indexFile = path.join(vocabDir, 'vocab_ders_1_2_index.json');

    if (fs.existsSync(vocabFile) && fs.existsSync(indexFile)) {
      const vocab = JSON.parse(fs.readFileSync(vocabFile, 'utf8'));
      const index = JSON.parse(fs.readFileSync(indexFile, 'utf8'));

      // 1. Try to find the exact word in the index
      let baseId = index[word];
      
      // 2. If not found, try finding a partial match or falling back (simple logic)
      if (!baseId) {
        // Fallback: check if any index key includes the word, or word includes the key
        const possibleKey = Object.keys(index).find(k => k.includes(word) || word.includes(k));
        if (possibleKey) {
            baseId = index[possibleKey];
        }
      }

      if (baseId) {
        // Find the full rich card
        const card = vocab.words.find((w: any) => w.bg.toLowerCase() === baseId.toLowerCase());
        if (card) {
          return NextResponse.json({ found: true, card });
        }
      }
    }

    // If not found in rich dictionary, return fallback
    return NextResponse.json({ found: false });

  } catch (error) {
    console.error('Dictionary lookup error:', error);
    return NextResponse.json({ error: 'Failed to lookup word' }, { status: 500 });
  }
}
