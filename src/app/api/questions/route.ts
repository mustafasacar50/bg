import { NextResponse } from 'next/server';
import { getGitHubFile, updateGitHubFile } from '@/lib/github';
import fs from 'fs';
import path from 'path';

const FILE_PATH = 'src/data/questions.json';

export async function GET() {
  try {
    let questions = [];
    
    // Try local file first (handles >1MB limitation and is faster)
    try {
      const localPath = path.join(process.cwd(), FILE_PATH);
      if (fs.existsSync(localPath)) {
        const content = fs.readFileSync(localPath, 'utf8');
        questions = JSON.parse(content);
      }
    } catch (localErr) {
      console.warn("Could not read local questions.json, falling back to GitHub API", localErr);
    }
    
    // Fallback to GitHub API if local failed or was empty
    if (!questions || questions.length === 0) {
      const fileData = await getGitHubFile(FILE_PATH);
      questions = JSON.parse(fileData.content);
    }

    // Also load module questions
    try {
      const modulesDir = path.join(process.cwd(), 'src', 'data', 'modules');
      if (fs.existsSync(modulesDir)) {
        const files = fs.readdirSync(modulesDir);
        for (const file of files) {
          if (file.endsWith('.json')) {
            const content = fs.readFileSync(path.join(modulesDir, file), 'utf8');
            const data = JSON.parse(content);
            if (data.questions && Array.isArray(data.questions)) {
              questions = questions.concat(data.questions);
            }
          }
        }
      }
    } catch (fsError) {
      console.error("Error reading module questions:", fsError);
    }

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

    const qIndex = questions.findIndex((q: { id: string }) => q.id === updatedQuestion.id);
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
