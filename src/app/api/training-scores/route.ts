import { NextResponse } from 'next/server';
import { getGitHubFile, updateGitHubFile } from '@/lib/github';

const FILE_PATH = 'src/data/users.json';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { studentId, pointsDelta } = data;

    if (!studentId || typeof pointsDelta !== 'number') {
      return NextResponse.json({ error: 'Gerekli alanlar eksik' }, { status: 400 });
    }

    const fileData = await getGitHubFile(FILE_PATH);
    let users = JSON.parse(fileData.content);

    const userIndex = users.findIndex((u: { id: string; trainingScore?: number }) => u.id === studentId);
    if (userIndex === -1) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı.' }, { status: 404 });
    }

    // Initialize or update training score
    const currentScore = users[userIndex].trainingScore || 0;
    users[userIndex].trainingScore = currentScore + pointsDelta;

    await updateGitHubFile(
      FILE_PATH,
      JSON.stringify(users, null, 2),
      `Update training score for ${studentId} (${pointsDelta > 0 ? '+' : ''}${pointsDelta})`
    );

    return NextResponse.json({ success: true, newScore: users[userIndex].trainingScore });
  } catch (error) {
    console.error('Error updating training score:', error);
    return NextResponse.json({ error: 'Puan güncellenirken hata oluştu.' }, { status: 500 });
  }
}
