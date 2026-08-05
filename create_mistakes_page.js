const fs = require('fs');

let content = fs.readFileSync('src/app/exam/[id]/page.tsx', 'utf-8');

// Replace examId
content = content.replace('const params = useParams();', '');
content = content.replace('const examId = params.id as string;', 'const examId = "mistakes";');

// Update fetchData
content = content.replace(/const examRes = await fetch\(`\/api\/manage-exams\?id=\$\{examId\}`\);[\s\S]*?if \(examData\.exam && qData\.questions\) \{/, `
        const mistakesRes = await fetch(\`/api/mistakes?studentId=\${student.id}\`);
        const mistakesData = await mistakesRes.json();
        const qRes = await fetch('/api/questions');
        const qData = await qRes.json();

        if (mistakesData.success && qData.questions) {
          const fetchedExam = {
            id: "mistakes",
            title: "Hata Havuzu Sınavı",
            description: "Yanlış yaptığınız veya boş bıraktığınız sorulardan oluşturulan özel sınav.",
            level: "Karma",
            recommendedTimeMinutes: Math.ceil((mistakesData.mistakes?.length || 10) * 1.5)
          };
          setExam(fetchedExam);
          
          let examQs = mistakesData.mistakes.map((qId: string) => 
            qData.questions.find((q: any) => q.id === qId)
          ).filter(Boolean);

          // Shuffle and take max 50 questions
          examQs = examQs.sort(() => 0.5 - Math.random()).slice(0, 50);

          if (examQs.length === 0) {
            router.push("/dashboard");
            return;
          }
`);

// Adjust the useEffect dependencies
content = content.replace('}, [examId]);', '}, [student]);');

// Fix handleFinalSubmit fetch body where it has examId
// Actually examId is now "mistakes" so it's fine.

fs.mkdirSync('src/app/exam/mistakes', { recursive: true });
fs.writeFileSync('src/app/exam/mistakes/page.tsx', content, 'utf-8');
console.log("Mistakes page created.");
