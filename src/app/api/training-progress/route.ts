import { NextResponse } from "next/server";
import { getGitHubFile, updateGitHubFile } from "@/lib/github";

const FILE_PATH = "src/data/training_progress.json";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    
    if (!studentId) {
      return NextResponse.json({ error: "studentId is required" }, { status: 400 });
    }

    const fileData = await getGitHubFile(FILE_PATH).catch(() => ({ content: "{}" }));
    
    let progressData: any = {};
    try {
      progressData = JSON.parse(fileData.content);
    } catch(e) {
      progressData = {};
    }

    return NextResponse.json({ progress: progressData[studentId] || {} });
  } catch (error: any) {
    console.error("Error fetching training progress:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    if (!data.studentId || !data.moduleId) {
      return NextResponse.json({ error: "studentId and moduleId are required" }, { status: 400 });
    }

    const fileData = await getGitHubFile(FILE_PATH).catch(() => ({ content: "{}" }));
    
    let progressData: any = {};
    try {
      progressData = JSON.parse(fileData.content);
    } catch(e) {
      progressData = {};
    }

    // Initialize student if not exists
    if (!progressData[data.studentId]) {
      progressData[data.studentId] = {};
    }

    // Initialize module if not exists
    if (!progressData[data.studentId][data.moduleId]) {
      progressData[data.studentId][data.moduleId] = {
        mistakes: [],
        allProgress: 0,
        mistakesProgress: 0,
        score: 0,
        lastUpdated: new Date().toISOString()
      };
    }

    // Update fields if provided
    const modProgress = progressData[data.studentId][data.moduleId];
    
    if (data.mistakes !== undefined) modProgress.mistakes = data.mistakes;
    if (data.allProgress !== undefined) modProgress.allProgress = data.allProgress;
    if (data.mistakesProgress !== undefined) modProgress.mistakesProgress = data.mistakesProgress;
    if (data.score !== undefined) modProgress.score = data.score;
    
    modProgress.lastUpdated = new Date().toISOString();

    await updateGitHubFile(
      FILE_PATH,
      JSON.stringify(progressData, null, 2),
      `Update training progress for ${data.studentId} on ${data.moduleId}`
    );

    return NextResponse.json({ success: true, data: modProgress });
  } catch (error: any) {
    console.error("Error saving training progress:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
