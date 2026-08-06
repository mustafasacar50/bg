import { NextResponse } from 'next/server';
import { getGitHubFile, updateGitHubFile } from '@/lib/github';

const FILE_PATH = 'src/data/groups.json';

export async function GET() {
  try {
    const fileData = await getGitHubFile(FILE_PATH);
    const groups = JSON.parse(fileData.content);
    
    return NextResponse.json({ success: true, groups });
  } catch (error) {
    console.error('Error fetching groups:', error);
    return NextResponse.json({ error: 'Gruplar getirilirken hata oluştu.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { name } = data;

    if (!name) {
      return NextResponse.json({ error: 'Grup adı gereklidir.' }, { status: 400 });
    }

    const fileData = await getGitHubFile(FILE_PATH);
    let groups = JSON.parse(fileData.content);

    // Check if group name exists
    if (groups.find((g: any) => g.name.toLowerCase() === name.toLowerCase())) {
      return NextResponse.json({ error: 'Bu isimde bir grup zaten var.' }, { status: 400 });
    }

    const newGroup = {
      id: `g_${Date.now()}`,
      name
    };

    groups.push(newGroup);

    await updateGitHubFile(
      FILE_PATH,
      JSON.stringify(groups, null, 2),
      `Add group ${name}`
    );

    return NextResponse.json({ success: true, group: newGroup });
  } catch (error) {
    console.error('Error adding group:', error);
    return NextResponse.json({ error: 'Grup eklenirken hata oluştu.' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const { id, name } = data;

    if (!id || !name) {
      return NextResponse.json({ error: 'Eksik bilgi.' }, { status: 400 });
    }

    const fileData = await getGitHubFile(FILE_PATH);
    let groups = JSON.parse(fileData.content);

    const index = groups.findIndex((g: any) => g.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Grup bulunamadı.' }, { status: 404 });
    }

    // Check name collision
    if (groups.find((g: any) => g.id !== id && g.name.toLowerCase() === name.toLowerCase())) {
      return NextResponse.json({ error: 'Bu isimde başka bir grup zaten var.' }, { status: 400 });
    }

    groups[index].name = name;

    await updateGitHubFile(
      FILE_PATH,
      JSON.stringify(groups, null, 2),
      `Update group ${id}`
    );

    return NextResponse.json({ success: true, group: groups[index] });
  } catch (error) {
    console.error('Error updating group:', error);
    return NextResponse.json({ error: 'Grup güncellenirken hata oluştu.' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Group ID is required' }, { status: 400 });
    }

    const fileData = await getGitHubFile(FILE_PATH);
    let groups = JSON.parse(fileData.content);

    const initialLength = groups.length;
    groups = groups.filter((g: any) => g.id !== id);

    if (groups.length === initialLength) {
      return NextResponse.json({ error: 'Grup bulunamadı.' }, { status: 404 });
    }

    await updateGitHubFile(
      FILE_PATH,
      JSON.stringify(groups, null, 2),
      `Delete group ${id}`
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting group:', error);
    return NextResponse.json({ error: 'Grup silinirken hata oluştu.' }, { status: 500 });
  }
}
