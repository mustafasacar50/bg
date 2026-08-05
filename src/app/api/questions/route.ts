import { NextResponse } from 'next/server';
import { getGitHubFile, updateGitHubFile } from '@/lib/github';

const FILE_PATH = 'src/data/questions.json';

export async function GET() {
  try {
    const fileData = await getGitHubFile(FILE_PATH);
    const questions = JSON.parse(fileData.content);
    return NextResponse.json({ questions });
  } catch (error) {
    console.error("GET Questions Error:", error);
    return NextResponse.json({ questions: [] });
  }
}

export async function PUT(request: Request) {
  try {
    const updatedQuestion = await request.json();
    
    const fileData = await getGitHubFile(FILE_PATH);
    const questions = JSON.parse(fileData.content);

    const qIndex = questions.findIndex((q: any) => q.id === updatedQuestion.id);
    if (qIndex === -1) {
      return NextResponse.json({ error: 'Soru bulunamadı' }, { status: 404 });
    }

    questions[qIndex] = { ...questions[qIndex], ...updatedQuestion };

    await updateGitHubFile(
      FILE_PATH, 
      JSON.stringify(questions, null, 2),
      `Update question ${updatedQuestion.id}`
    );

    return NextResponse.json({ success: true, question: questions[qIndex] });
  } catch (error) {
    console.error("PUT Question Error:", error);
    return NextResponse.json({ error: 'Soru güncellenemedi' }, { status: 500 });
  }
}
