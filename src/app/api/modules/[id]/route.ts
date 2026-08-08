import { NextResponse } from 'next/server';
import fs from 'fs';
export const dynamic = 'force-dynamic';
import path from 'path';
import { getGitHubFile, updateGitHubFile } from '@/lib/github';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const moduleId = params.id;
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
