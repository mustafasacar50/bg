import { NextResponse } from "next/server";
import { getGitHubFile } from "@/lib/github";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    if (!studentId) {
      return NextResponse.json({ error: "Öğrenci ID gereklidir." }, { status: 400 });
    }

    // Fetch users to get the student's group
    const usersFile = await getGitHubFile('src/data/users.json').catch(() => ({ content: "[]" }));
    let users = [];
    try {
      users = JSON.parse(usersFile.content);
    } catch(e) {}

    const currentStudent = users.find((u: any) => u.id === studentId);
    if (!currentStudent || !currentStudent.group) {
      return NextResponse.json({ 
        success: true, 
        rank: 0, 
        totalStudents: 0, 
        totalScore: 0 
      });
    }

    const studentGroup = currentStudent.group;
    
    // Find all students in this group
    const groupStudents = users.filter((u: any) => u.group === studentGroup && u.role === 'student');

    // Fetch scores
    const scoresFile = await getGitHubFile('src/data/scores.json').catch(() => ({ content: "[]" }));
    let scores = [];
    try {
      scores = JSON.parse(scoresFile.content);
    } catch(e) {}

    // Calculate total points for each student in the group
    const studentPoints: Record<string, number> = {};
    
    groupStudents.forEach((student: any) => {
      // Include their training score as the base
      studentPoints[student.id] = student.trainingScore || 0;
    });

    scores.forEach((scoreRecord: any) => {
      if (studentPoints[scoreRecord.studentId] !== undefined && scoreRecord.score && typeof scoreRecord.score.total === 'number') {
        studentPoints[scoreRecord.studentId] += scoreRecord.score.total;
      }
    });

    // Create a sorted leaderboard
    const leaderboard = Object.keys(studentPoints)
      .map(id => ({
        id,
        score: studentPoints[id]
      }))
      .sort((a, b) => b.score - a.score);

    // Find current student's rank (1-indexed)
    const rankIndex = leaderboard.findIndex(item => item.id === studentId);
    const rank = rankIndex >= 0 ? rankIndex + 1 : 0;
    const totalScore = studentPoints[studentId] || 0;

    return NextResponse.json({
      success: true,
      rank,
      totalStudents: groupStudents.length,
      totalScore,
      groupName: studentGroup
    });

  } catch (error: any) {
    console.error("Leaderboard error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
