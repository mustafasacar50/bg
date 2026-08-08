import { NextResponse } from 'next/server';
import fs from 'fs';
export const dynamic = 'force-dynamic';
import path from 'path';

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
