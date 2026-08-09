import { NextResponse } from 'next/server';
import fs from 'fs';
export const dynamic = 'force-dynamic';
import path from 'path';
import { getGitHubFile, updateGitHubFile } from '@/lib/github';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const moduleId = params.id;
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    // Handle virtual vocabulary module
    if (moduleId === 'vocab') {
      if (!studentId) {
        return NextResponse.json({ error: 'studentId required for vocab module' }, { status: 400 });
      }

      // 1. Get unknown words for student
      const progPath = path.join(process.cwd(), 'src', 'data', 'training_progress.json');
      let unknownWords: string[] = [];
      if (fs.existsSync(progPath)) {
        const progData = JSON.parse(fs.readFileSync(progPath, 'utf8'));
        unknownWords = progData[studentId]?.unknownWords || [];
      }

      if (unknownWords.length === 0) {
        return NextResponse.json({ title: 'Kelime Sepetim', questions: [] });
      }

      // 2. Scan all modules for matching questions
      const modulesDir = path.join(process.cwd(), 'src', 'data', 'modules');
      const files = fs.existsSync(modulesDir) ? fs.readdirSync(modulesDir).filter(f => f.endsWith('.json')) : [];
      
      const allMatchingQuestions: any[] = [];
      const seenIds = new Set();

      for (const file of files) {
        const content = fs.readFileSync(path.join(modulesDir, file), 'utf8');
        try {
          const modData = JSON.parse(content);
          if (modData.questions) {
            for (const q of modData.questions) {
              const text = (q.sentence + ' ' + q.answer).toLowerCase();
              const hasUnknown = unknownWords.some(w => text.includes(w));
              if (hasUnknown && !seenIds.has(q.id)) {
                allMatchingQuestions.push(q);
                seenIds.add(q.id);
              }
            }
          }
        } catch(e) {}
      }

      return NextResponse.json({ title: 'Kelime Sepetim', questions: allMatchingQuestions });
    }

    // Normal module handling
    const filePath = path.join(process.cwd(), 'src', 'data', 'modules', `${moduleId}.json`);
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error reading module:', error);
    return NextResponse.json({ error: 'Failed to read module' }, { status: 500 });
  }
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const moduleId = params.id;
    const body = await request.json();
    const { action, questionId, updatedData } = body;

    if (!questionId) {
      return NextResponse.json({ error: 'questionId is required' }, { status: 400 });
    }

    const filePath = `src/data/modules/${moduleId}.json`;
    
    // Fetch current file from GitHub (or local fallback)
    const fileData = await getGitHubFile(filePath);
    if (!fileData || !fileData.content) {
      return NextResponse.json({ error: 'Failed to read module file from GitHub' }, { status: 500 });
    }

    let data;
    try {
      data = JSON.parse(fileData.content);
    } catch (e) {
      return NextResponse.json({ error: 'Failed to parse JSON file' }, { status: 500 });
    }

    if (!data.questions) {
      return NextResponse.json({ error: 'Module has no questions' }, { status: 400 });
    }

    const qIndex = data.questions.findIndex((q: any) => q.id === questionId);
    if (qIndex === -1) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    if (action === 'delete') {
      data.questions.splice(qIndex, 1);
    } else if (action === 'update' && updatedData) {
      data.questions[qIndex] = { ...data.questions[qIndex], ...updatedData };
    } else {
      return NextResponse.json({ error: 'Invalid action or missing updatedData' }, { status: 400 });
    }

    // Save back to GitHub
    const newContent = JSON.stringify(data, null, 2);
    await updateGitHubFile(
      filePath,
      newContent,
      `${action === 'delete' ? 'Delete' : 'Update'} question ${questionId} in module ${moduleId}`
    );

    return NextResponse.json({ success: true, updatedQuestion: action === 'update' ? data.questions[qIndex] : null });
  } catch (error: any) {
    console.error('Error modifying question:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
