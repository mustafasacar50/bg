import { NextResponse } from "next/server";
import { getGitHubFile, updateGitHubFile } from "@/lib/github";

const FILE_PATH = "src/data/exams.json";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { title, description, timeLimit, startTime, endTime, questions, questionPoints, lessons, targetGroups, isPublic } = data;

    if (!title || !questions || questions.length === 0) {
      return NextResponse.json({ error: "Eksik bilgi" }, { status: 400 });
    }

    const newExam = {
      id: `exam-${Date.now()}`,
      title,
      description: description || "",
      recommendedTimeMinutes: timeLimit || 30,
      level: "A1",
      lessons: lessons || [],
      questions,
      questionPoints: questionPoints || {},
      targetGroups: Array.isArray(targetGroups) ? targetGroups : [],
      isPublic: isPublic === true,
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
  } catch (error: unknown) {
    console.error("Error generating exam:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
