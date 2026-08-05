import { NextResponse } from "next/server";
import { getGitHubFile, updateGitHubFile } from "@/lib/github";

const FILE_PATH = "src/data/scores.json";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Check if user is logged in
    if (!data.student || !data.student.id) {
      return NextResponse.json({ error: "Oturum açmanız gerekiyor." }, { status: 401 });
    }

    const fileData = await getGitHubFile(FILE_PATH);
    let scores = [];
    try {
      scores = JSON.parse(fileData.content);
    } catch(e) {
      scores = [];
    }

    // Append new score
    const newScore = {
      id: `score-${Date.now()}`,
      examId: data.examId,
      studentId: data.student.id,
      studentName: data.student.name,
      score: data.score,
      answers: data.answers,
      date: data.date
    };

    scores.push(newScore);

    // Commit to github
    await updateGitHubFile(
      FILE_PATH,
      JSON.stringify(scores, null, 2),
      `Add exam result for ${data.student.name}`
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error submitting exam:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
