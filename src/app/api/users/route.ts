import { NextResponse } from 'next/server';
import { getGitHubFile, updateGitHubFile } from '@/lib/github';

const FILE_PATH = 'src/data/users.json';

export async function GET() {
  try {
    const fileData = await getGitHubFile(FILE_PATH);
    const users = JSON.parse(fileData.content);
    
    // Return all users for admin panel
    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Kullanıcılar getirilirken hata oluştu.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { username, password, name, group } = data;

    if (!username || !password || !name) {
      return NextResponse.json({ error: 'Gerekli alanlar eksik' }, { status: 400 });
    }

    const fileData = await getGitHubFile(FILE_PATH);
    let users = JSON.parse(fileData.content);

    // Check if username exists
    if (users.find((u: { id: string; username: string }) => u.username === username)) {
      return NextResponse.json({ error: 'Bu kullanıcı adı zaten alınmış.' }, { status: 400 });
    }

    // Generate new user ID
    const newId = `u${Date.now()}`;
    
    const newUser = {
      id: newId,
      username,
      password,
      role: 'student',
      name,
      group: group || ''
    };

    users.push(newUser);

    await updateGitHubFile(
      FILE_PATH,
      JSON.stringify(users, null, 2),
      `Add user ${username}`
    );

    return NextResponse.json({ success: true, user: newUser });
  } catch (error) {
    console.error('Error adding user:', error);
    return NextResponse.json({ error: 'Kullanıcı eklenirken hata oluştu.' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const { id, name, group, password, username } = data;

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const fileData = await getGitHubFile(FILE_PATH);
    let users = JSON.parse(fileData.content);

    const userIndex = users.findIndex((u: { id: string; username: string }) => u.id === id);
    if (userIndex === -1) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı.' }, { status: 404 });
    }

    if (data.isUserSelfUpdate) {
      if (users[userIndex].password !== data.currentPassword) {
        return NextResponse.json({ error: 'Mevcut şifreniz yanlış.' }, { status: 401 });
      }
    }

    // Check if new username exists
    if (username && username !== users[userIndex].username && users.find((u: { id: string; username: string }) => u.username === username)) {
      return NextResponse.json({ error: 'Bu kullanıcı adı zaten alınmış.' }, { status: 400 });
    }

    // Update fields
    if (name) users[userIndex].name = name;
    if (group !== undefined) users[userIndex].group = group;
    if (password) users[userIndex].password = password;
    if (username) users[userIndex].username = username;

    await updateGitHubFile(
      FILE_PATH,
      JSON.stringify(users, null, 2),
      `Update user profile ${id}`
    );

    // Return the safe user object
    const { password: _p, ...safeUser } = users[userIndex];
    return NextResponse.json({ success: true, user: safeUser });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Kullanıcı güncellenirken hata oluştu.' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const fileData = await getGitHubFile(FILE_PATH);
    let users = JSON.parse(fileData.content);

    const initialLength = users.length;
    users = users.filter((u: { id: string; username: string }) => u.id !== id);

    if (users.length === initialLength) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı.' }, { status: 404 });
    }

    await updateGitHubFile(
      FILE_PATH,
      JSON.stringify(users, null, 2),
      `Delete user ${id}`
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Kullanıcı silinirken hata oluştu.' }, { status: 500 });
  }
}
