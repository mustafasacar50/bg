"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, BookOpen, Activity, AlertCircle, CheckCircle, XCircle } from "lucide-react";

export default function StudentReportPage() {
  const params = useParams();
  const studentId = params?.id as string;
  
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<any>(null);
  const [examScores, setExamScores] = useState<any[]>([]);
  const [trainingData, setTrainingData] = useState<any>({});
  const [modules, setModules] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, scoresRes, trainRes, modRes] = await Promise.all([
          fetch('/api/users'),
          fetch('/api/scores'),
          fetch(`/api/training-progress?studentId=${studentId}`),
          fetch('/api/modules')
        ]);
        
        const userData = await userRes.json();
        const scoreData = await scoresRes.json();
        const trainData = await trainRes.json();
        const modData = await modRes.json();

        if (userData.users) {
          const user = userData.users.find((u: any) => u.id === studentId);
          setStudent(user);
        }
        
        if (scoreData.scores) {
          const sExams = scoreData.scores.filter((s: any) => s.studentId === studentId);
          sExams.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setExamScores(sExams);
        }
        
        if (trainData.progress) {
          setTrainingData(trainData.progress);
        }

        if (modData.modules) {
           setModules(modData.modules);
        }

      } catch (e) {
        console.error("Error fetching report", e);
      }
      setLoading(false);
    };
    fetchData();
  }, [studentId]);

  if (loading) {
    return <div className="p-10 text-center animate-pulse text-slate-500 font-bold">Rapor Yükleniyor...</div>;
  }

  if (!student) {
    return <div className="p-10 text-center text-red-500 font-bold">Öğrenci bulunamadı.</div>;
  }

  return (
    <div className="py-4">
      <Link href="/admin/users" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 font-medium mb-4">
        <ArrowLeft size={16} /> Öğrenciler Listesine Dön
      </Link>
      
      <header className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-6 flex flex-col sm:flex-row items-center gap-4">
        <div className="bg-indigo-100 p-4 rounded-full text-indigo-600">
           <User size={32} />
        </div>
        <div>
           <h1 className="text-2xl font-bold text-slate-800">{student.name}</h1>
           <p className="text-slate-500 text-sm">{student.username} • Grup: {student.group || 'Yok'}</p>
        </div>
        <div className="ml-auto flex gap-4 text-center">
           <div className="bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">
             <div className="text-xs font-bold text-emerald-600 uppercase">Toplam Puan (Sınav)</div>
             <div className="text-xl font-black text-emerald-700">{student.score || 0}</div>
           </div>
           <div className="bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100">
             <div className="text-xs font-bold text-indigo-600 uppercase">Eğitim Puanı</div>
             <div className="text-xl font-black text-indigo-700">{student.trainingScore || 0}</div>
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Antrenman İstatistikleri */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-4">
            <Activity className="text-amber-500" size={24} />
            <h2 className="text-xl font-bold text-slate-800">Antrenman (Training) Durumu</h2>
          </div>
          
          <div className="space-y-4">
             {Object.keys(trainingData).length === 0 ? (
               <div className="text-sm text-slate-500 italic">Henüz antrenman yapılmamış.</div>
             ) : (
               modules.map(mod => {
                 const p = trainingData[mod.id];
                 if (!p) return null;
                 
                 const total = mod.questionCount || 0;
                 const progressPct = total > 0 ? Math.round((p.allProgress / total) * 100) : 0;
                 const mistakesCount = p.mistakes ? p.mistakes.length : 0;

                 return (
                   <div key={mod.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-bold text-slate-800 text-sm">{mod.title}</h3>
                        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">{p.score || 0} Puan</span>
                      </div>
                      <div className="flex flex-col gap-1 mt-2">
                         <div className="text-xs text-slate-500 flex justify-between">
                            <span>Genel İlerleme: {p.allProgress} / {total}</span>
                            <span className="font-bold">{progressPct}%</span>
                         </div>
                         <div className="w-full bg-slate-200 rounded-full h-1.5">
                            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${progressPct}%` }}></div>
                         </div>
                         <div className="mt-2 text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-1 rounded self-start flex items-center gap-1">
                            <AlertCircle size={12} /> {mistakesCount} Bilinmeyen Soru
                         </div>
                      </div>
                   </div>
                 );
               })
             )}
          </div>
        </section>

        {/* Sınav Detayları */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-4">
            <BookOpen className="text-blue-500" size={24} />
            <h2 className="text-xl font-bold text-slate-800">Sınav Detayları</h2>
          </div>

          <div className="space-y-4">
             {examScores.length === 0 ? (
                <div className="text-sm text-slate-500 italic">Henüz girilen bir sınav yok.</div>
             ) : (
                examScores.map((exam, i) => (
                  <details key={exam.id || i} className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden group">
                    <summary className="p-4 font-bold text-slate-800 cursor-pointer flex justify-between items-center hover:bg-slate-100">
                       <div className="flex flex-col">
                         <span>Sınav Puanı: <span className="text-indigo-600">{exam.score?.total || 0}</span></span>
                         <span className="text-xs text-slate-400 font-normal mt-1">{new Date(exam.date).toLocaleString('tr-TR')}</span>
                       </div>
                       <div className="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded">Detayları Gör ▼</div>
                    </summary>
                    <div className="p-4 border-t border-slate-200 bg-white space-y-3 max-h-96 overflow-y-auto">
                       {exam.answers && Object.keys(exam.answers).length > 0 ? (
                         Object.entries(exam.answers).map(([qId, ansObj]: any) => (
                            <div key={qId} className={`p-3 rounded-lg border text-sm ${ansObj.isCorrect ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                               <div className="font-semibold text-slate-700 mb-1 flex items-start gap-2">
                                  {ansObj.isCorrect ? <CheckCircle size={16} className="text-emerald-500 shrink-0 mt-0.5" /> : <XCircle size={16} className="text-rose-500 shrink-0 mt-0.5" />}
                                  <span>{ansObj.question}</span>
                               </div>
                               <div className="pl-6 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs mt-2">
                                  <div>
                                    <span className="text-slate-500">Cevap: </span>
                                    <span className={`font-bold ${ansObj.isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>{ansObj.userAnswer || '-boş-'}</span>
                                  </div>
                                  {!ansObj.isCorrect && (
                                    <div>
                                      <span className="text-slate-500">Doğrusu: </span>
                                      <span className="font-bold text-emerald-700">{ansObj.correctAnswer}</span>
                                    </div>
                                  )}
                               </div>
                            </div>
                         ))
                       ) : (
                         <div className="text-xs text-slate-500">Detaylı log bulunamadı.</div>
                       )}
                    </div>
                  </details>
                ))
             )}
          </div>
        </section>
      </div>
    </div>
  );
}
