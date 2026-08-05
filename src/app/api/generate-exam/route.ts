import { NextResponse } from "next/server";
import { getGitHubFile, updateGitHubFile } from "@/lib/github";

const FILE_PATH = "src/data/exams.json";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { title, description, timeLimit, questions, questionPoints, startTime, endTime } = data;

    const newExam = {
      id: `exam-${Date.now()}`,
      title,
      description,
      recommendedTimeMinutes: parseInt(timeLimit) || 30,
      level: "A1",
      lessons: data.lessons || [],
      questions,
      questionPoints,
      startTime: startTime || null,
      endTime: endTime || null
    };

    const fileData = await getGitHubFile(FILE_PATH);
    let exams = JSON.parse(fileData.content);
    exams.push(newExam);

    await updateGitHubFile(
      FILE_PATH,
      JSON.stringify(exams, null, 2),
      `Admin generated new exam: ${title}`
    );

    return NextResponse.json({ success: true, exam: newExam });
  } catch (error: any) {
    console.error("Error generating exam:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
