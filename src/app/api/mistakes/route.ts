import { NextResponse } from "next/server";
import { getGitHubFile } from "@/lib/github";

const MISTAKES_PATH = "src/data/user_mistakes.json";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    if (!studentId) {
      return NextResponse.json({ error: "Student ID required" }, { status: 400 });
    }

    const fileData = await getGitHubFile(MISTAKES_PATH).catch(() => ({ content: "{}" }));
    let userMistakes: Record<string, string[]> = {};
    try {
      userMistakes = JSON.parse(fileData.content);
    } catch(e) {}

    const mistakeIds = userMistakes[studentId] || [];

    return NextResponse.json({ success: true, mistakes: mistakeIds });
  } catch (error: unknown) {
    console.error("Error fetching mistakes:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
