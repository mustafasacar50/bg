const fs = require('fs');

const replacements = [
  { file: 'src/app/api/admin-results/route.ts', from: 'file: any', to: 'file: { path: string }' },
  { file: 'src/app/api/dictionary-lookup/route.ts', from: 'w: any', to: 'w: { bg: string }' },
  { file: 'src/app/api/groups/route.ts', from: 'g: any', to: 'g: { id: string; name: string }' },
  { file: 'src/app/api/leaderboard/route.ts', from: 'u: any', to: 'u: { id: string; role: string; group?: string }' },
  { file: 'src/app/api/leaderboard/route.ts', from: 'student: any', to: 'student: { id: string; username?: string; name?: string }' },
  { file: 'src/app/api/leaderboard/route.ts', from: 'scoreRecord: any', to: 'scoreRecord: { score: number }' },
  { file: 'src/app/api/login/route.ts', from: 'u: any', to: 'u: { username: string; password?: string; id: string }' },
  { file: 'src/app/api/manage-exams/route.ts', from: 'e: any', to: 'e: { id: string }' },
  { file: 'src/app/api/manage-exams/route.ts', from: 'exam: any', to: 'exam: { id: string }' },
  { file: 'src/app/api/modules/[id]/route.ts', from: 'q: any', to: 'q: { id: string }' },
  { file: 'src/app/api/modules/[id]/route.ts', from: 'any[]', to: 'Array<{ id: string; [key: string]: unknown }>' },
  { file: 'src/app/api/modules/route.ts', from: 'q: any', to: 'q: { type: string; module: string; id: string }' },
  { file: 'src/app/api/push/cron/route.ts', from: 'data: any', to: 'data: { subscription: any }' },
  { file: 'src/app/api/questions/route.ts', from: 'q: any', to: 'q: { id: string }' },
  { file: 'src/app/api/training-scores/route.ts', from: 'u: any', to: 'u: { id: string; trainingScore?: number }' },
  { file: 'src/app/api/users/route.ts', from: 'u: any', to: 'u: { id: string; username: string }' },
  { file: 'src/app/api/vocabulary/route.ts', from: 'w: any', to: 'w: { bg: string; tr?: string; meaning?: string; topic?: string }' },
  { file: 'src/app/api/vocabulary/route.ts', from: 't: any', to: 't: { id: string }' },
  { file: 'src/app/api/training-progress/route.ts', from: 'progressData: any = {}', to: 'progressData: Record<string, unknown> = {}' },
];

replacements.forEach(r => {
  try {
    let content = fs.readFileSync(r.file, 'utf8');
    // Global replace
    let orig = content;
    content = content.split(r.from).join(r.to);
    if (content !== orig) {
      fs.writeFileSync(r.file, content);
      console.log(`Replaced in ${r.file}`);
    }
  } catch (e) {
    console.error(`Skipping ${r.file}: ${e.message}`);
  }
});
