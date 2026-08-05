import { NextResponse } from 'next/server';
import { getGitHubFile, updateGitHubFile } from '@/lib/github';

const FILE_PATH = 'src/data/exams.json';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    const fileData = await getGitHubFile(FILE_PATH);
    const exams = JSON.parse(fileData.content);

    if (id) {
      const exam = exams.find((e: any) => e.id === id);
      if (!exam) return NextResponse.json({ error: 'Sınav bulunamadı' }, { status: 404 });
      return NextResponse.json({ exam });
    }

    return NextResponse.json({ exams });
  } catch (error) {
    console.error('Error reading exams:', error);
    return NextResponse.json({ error: 'Sınavlar okunamadı.' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const updatedExam = await request.json();

    if (!updatedExam.id) {
      return NextResponse.json({ error: 'Exam ID is required' }, { status: 400 });
    }

    const fileData = await getGitHubFile(FILE_PATH);
    let exams = JSON.parse(fileData.content);

    const index = exams.findIndex((e: any) => e.id === updatedExam.id);
    if (index === -1) {
      return NextResponse.json({ error: 'Sınav bulunamadı.' }, { status: 404 });
    }

    exams[index] = { ...exams[index], ...updatedExam };
    
    await updateGitHubFile(
      FILE_PATH,
      JSON.stringify(exams, null, 2),
      `Update exam ${updatedExam.id}`
    );

    return NextResponse.json({ success: true, exam: exams[index] });
  } catch (error) {
    console.error('Error updating exam:', error);
    return NextResponse.json({ error: 'Sınav güncellenirken hata oluştu.' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Exam ID is required' }, { status: 400 });
    }

    const fileData = await getGitHubFile(FILE_PATH);
    let exams = JSON.parse(fileData.content);

    const initialLength = exams.length;
    exams = exams.filter((exam: any) => exam.id !== id);

    if (exams.length === initialLength) {
      return NextResponse.json({ error: 'Sınav bulunamadı.' }, { status: 404 });
    }

    await updateGitHubFile(
      FILE_PATH,
      JSON.stringify(exams, null, 2),
      `Delete exam ${id}`
    );

    return NextResponse.json({ success: true, message: 'Sınav silindi.' });
  } catch (error) {
    console.error('Error deleting exam:', error);
    return NextResponse.json({ error: 'Sınav silinirken hata oluştu.' }, { status: 500 });
  }
}
