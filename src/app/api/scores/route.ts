import { NextResponse } from 'next/server';
import { getGitHubFile } from '@/lib/github';

const FILE_PATH = 'src/data/scores.json';

export async function GET() {
  try {
    const fileData = await getGitHubFile(FILE_PATH);
    const scores = JSON.parse(fileData.content);
    return NextResponse.json({ scores });
  } catch (error) {
    console.error('Error reading scores:', error);
    return NextResponse.json({ scores: [] });
  }
}
