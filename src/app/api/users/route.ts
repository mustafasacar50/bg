import { NextResponse } from 'next/server';
import { getGitHubFile, updateGitHubFile } from '@/lib/github';

const FILE_PATH = 'src/data/users.json';

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const { id, name, group } = data;

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const fileData = await getGitHubFile(FILE_PATH);
    let users = JSON.parse(fileData.content);

    const userIndex = users.findIndex((u: any) => u.id === id);
    if (userIndex === -1) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı.' }, { status: 404 });
    }

    // Update name and group
    if (name) users[userIndex].name = name;
    if (group !== undefined) users[userIndex].group = group;

    await updateGitHubFile(
      FILE_PATH,
      JSON.stringify(users, null, 2),
      `Update user profile ${id}`
    );

    // Return the safe user object (without password)
    const { password, ...safeUser } = users[userIndex];
    return NextResponse.json({ success: true, user: safeUser });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Kullanıcı güncellenirken hata oluştu.' }, { status: 500 });
  }
}
