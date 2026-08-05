import { NextResponse } from 'next/server';
import { getGitHubFile } from '@/lib/github';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    // Fetch users from GitHub (or local fs if no token)
    const usersFile = await getGitHubFile('src/data/users.json');
    const users = JSON.parse(usersFile.content);

    const user = users.find((u: any) => u.username === username && u.password === password);

    if (user) {
      // Don't send password back to client
      const { password: _, ...safeUser } = user;
      return NextResponse.json({ success: true, user: safeUser });
    }

    return NextResponse.json(
      { success: false, error: 'Kullanıcı adı veya şifre hatalı' }, 
      { status: 401 }
    );
  } catch (error) {
    console.error("Login hatası:", error);
    return NextResponse.json({ success: false, error: 'Sunucu hatası' }, { status: 500 });
  }
}
