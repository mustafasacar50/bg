"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut, BookOpen, Clock, Award, User, RefreshCw, Loader2, Edit3, X, Check, Wand2, Settings } from "lucide-react";
import Link from "next/link";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DashboardPage() {
  const [student, setStudent] = useState<any>(null);
  const [exams, setExams] = useState<any[]>([]);
  const [scores, setScores] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any>(null);
  const [mistakeCount, setMistakeCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState("");
  const [editGroup, setEditGroup] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    const session = localStorage.getItem("student_session");
    if (!session) {
      router.push("/");
    } else {
      const parsed = JSON.parse(session);
      setStudent(parsed);
      setEditName(parsed.name || "");
      setEditGroup(parsed.group || "");
    }
  }, [router]);

  useEffect(() => {
    if (!student) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [examsRes, scoresRes, mistakesRes, lbRes] = await Promise.all([
          fetch('/api/manage-exams'),
          fetch('/api/scores'),
          fetch(`/api/mistakes?studentId=${student.id}`),
          fetch(`/api/leaderboard?studentId=${student.id}`)
        ]);
        
        const examsData = await examsRes.json();
        const scoresData = await scoresRes.json();
        const mistakesData = await mistakesRes.json();
        const lbData = await lbRes.json();
        
        if (examsData.exams) {
          // Filter exams based on isPublic and targetGroups
          const filteredExams = examsData.exams.filter((exam: any) => {
            if (exam.isPublic) return true;
            if (student.group && exam.targetGroups && exam.targetGroups.includes(student.group)) {
              return true;
            }
            return false;
          });
          setExams(filteredExams.reverse());
        }
        if (mistakesData.success && mistakesData.mistakes) {
          setMistakeCount(mistakesData.mistakes.length);
        }
        if (lbData.success) {
          setLeaderboard(lbData);
        }
        
        // Filter scores to only include this student's scores
        if (scoresData.scores) {
          const myScores = scoresData.scores.filter((s: any) => s.studentId === student.id);
          // Sort by date descending (newest first)
          myScores.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setScores(myScores);
        }
      } catch (error) {
        console.error("Data fetch error", error);
      }
      setLoading(false);
    };

    fetchData();
  }, [student]);

  const handleLogout = () => {
    localStorage.removeItem("student_session");
    router.push("/");
  };

  const saveProfile = async () => {
    if (!editName.trim()) return;
    setIsSavingProfile(true);
    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: student.id,
          name: editName.trim(),
          group: editGroup.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        setStudent(data.user);
        localStorage.setItem("student_session", JSON.stringify(data.user));
        setIsEditingProfile(false);
      } else {
        alert(data.error || "Güncelleme başarısız");
      }
    } catch (e) {
      alert("Hata oluştu.");
    }
    setIsSavingProfile(false);
  };

  if (!student) return null;

  return (
    <div className="py-4 pb-20">
      <header className="flex justify-between items-start mb-6 bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <div className="bg-primary/10 p-2 rounded-full text-primary">
              <User size={24} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Öğrenci Paneli</p>
              {!isEditingProfile ? (
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-800">{student.name}</h2>
                  <button onClick={() => setIsEditingProfile(true)} className="text-slate-400 hover:text-primary transition-colors p-1">
                    <Edit3 size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2 mt-2 max-w-sm">
                  <input 
                    type="text" 
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="text-input py-1.5 px-3 text-sm"
                    placeholder="Adınız Soyadınız"
                  />
                  <input 
                    type="text" 
                    value={editGroup}
                    onChange={e => setEditGroup(e.target.value)}
                    className="text-input py-1.5 px-3 text-sm"
                    placeholder="Grup / Sınıf (Örn: A1)"
                  />
                  <div className="flex gap-2">
                    <button onClick={saveProfile} disabled={isSavingProfile} className="btn btn-primary py-1 px-3 text-xs flex items-center gap-1">
                      {isSavingProfile ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Kaydet
                    </button>
                    <button onClick={() => setIsEditingProfile(false)} disabled={isSavingProfile} className="btn bg-slate-100 text-slate-600 hover:bg-slate-200 py-1 px-3 text-xs flex items-center gap-1">
                      <X size={14} /> İptal
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          {!isEditingProfile && student.group && (
            <span className="inline-block mt-2 ml-12 px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-md">
              Grup: {student.group}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {student?.role === 'admin' && (
            <Link href="/admin" className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex flex-col items-center gap-1 group">
              <Settings size={20} className="group-hover:rotate-45 transition-transform duration-300" />
              <span className="text-[10px] font-bold">Yönetim</span>
            </Link>
          )}
          <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex flex-col items-center gap-1 group">
            <LogOut size={20} className="group-hover:translate-x-0.5 transition-transform" />
            <span className="text-[10px] font-bold">Çıkış Yap</span>
          </button>
        </div>
      </header>

      <div className="flex justify-between items-start flex-col md:flex-row gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Hoş Geldin, {student?.name}! 👋</h1>
          <p className="text-slate-600 font-medium">Bulgarca öğrenme serüveninde bugün neler yapacaksın?</p>
        </div>
      </div>

      <div className="hero mb-6">
        <span className="eyebrow">📚 Sınav Merkezi</span>
        <h1>Mevcut Sınavlar</h1>
        <p>Aşağıdaki listeden çözmek istediğiniz sınava tıklayarak başlayabilirsiniz.</p>
      </div>

      {/* Leaderboard Rank Widget */}
      {leaderboard && leaderboard.rank > 0 && (
        <div className="bg-gradient-to-r from-amber-100 to-yellow-50 border border-amber-200 rounded-2xl p-5 mb-8 flex items-center gap-5 shadow-sm">
          <div className="text-4xl">🏆</div>
          <div>
            <h2 className="font-bold text-amber-900 text-lg mb-1">{leaderboard.groupName} İçi Sıralaman: <span className="text-2xl font-black">{leaderboard.rank}.</span></h2>
            <p className="text-amber-700 text-sm font-medium">Toplam <span className="font-bold">{leaderboard.totalScore}</span> puanın var. Gruptaki {leaderboard.totalStudents} öğrenci arasındasın. Bol bol sınav çözerek zirveye tırman!</p>
          </div>
        </div>
      )}

      {/* Progress Chart & Logs */}
      {!loading && scores.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-2xl font-bold">Gelişim Grafiğin 📈</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 card p-6">
              <h3 className="font-bold text-slate-700 mb-4">Sınav Puanları (Zaman İçinde)</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={[...scores].reverse().map(s => ({
                      date: new Date(s.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
                      Puan: s.score?.total || 0,
                      fullTitle: exams.find(e => e.id === s.examId)?.title || "Bilinmeyen Sınav"
                    }))}
                    margin={{ top: 5, right: 20, left: -20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{fontSize: 12, fill: '#94a3b8'}} stroke="#cbd5e1" />
                    <YAxis tick={{fontSize: 12, fill: '#94a3b8'}} stroke="#cbd5e1" />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      labelStyle={{ fontWeight: 'bold', color: '#1e293b', marginBottom: '4px' }}
                      formatter={(value: any, name: any, props: any) => [
                        <div key="val" className="font-bold">{value} Puan</div>, 
                        <div key="title" className="text-xs text-slate-500 mt-1">{props.payload.fullTitle}</div>
                      ]}
                    />
                    <Line type="monotone" dataKey="Puan" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: 'white' }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="card p-6 flex flex-col h-full max-h-[350px]">
              <h3 className="font-bold text-slate-700 mb-4">Son Etkinlikler</h3>
              <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                {scores.slice(0, 10).map((score: any, idx: number) => {
                  const examName = exams.find(e => e.id === score.examId)?.title || "Bilinmeyen Sınav";
                  return (
                    <div key={idx} className="flex flex-col border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-sm text-slate-800 line-clamp-1 flex-1 pr-2">{examName}</span>
                        <span className={`text-xs font-black px-2 py-0.5 rounded-md ${
                          score.score?.total >= 80 ? 'bg-green-100 text-green-700' :
                          score.score?.total >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {score.score?.total} Puan
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        {new Date(score.date).toLocaleString('tr-TR')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Exams Section Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Mevcut Sınavlar</h2>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 text-slate-400 gap-3">
          <Loader2 size={40} className="animate-spin text-primary" />
          <span className="font-medium animate-pulse">Sınavlarınız yükleniyor...</span>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {mistakeCount > 0 && (
            <div className="card bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200 shadow-md mb-2 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-4 -translate-y-4">
                <RefreshCw size={100} />
              </div>
              <div className="flex justify-between items-start mb-2 relative z-10">
                <h3 className="font-bold text-xl text-orange-800">Hata Havuzu Sınavı</h3>
                <span className="bg-orange-200 text-orange-800 text-xs font-black px-2 py-1 rounded-md">ÖZEL SINAV</span>
              </div>
              <p className="text-sm text-orange-700 mb-4 relative z-10 font-medium">
                Önceki sınavlarda yanlış yaptığınız veya boş bıraktığınız sorulardan size özel oluşturulacak deneme sınavıdır. Soruyu doğru bildiğinizde havuzdan silinir.
              </p>
              <div className="flex items-center gap-1.5 text-xs font-bold text-orange-600 mb-4 bg-white/60 p-3 rounded-xl border border-orange-100/50 relative z-10 w-max">
                <BookOpen size={16} /> Havuzda Çözülmeyi Bekleyen {mistakeCount} Soru Var
              </div>
              <Link href="/exam/mistakes" className="btn bg-orange-500 hover:bg-orange-600 text-white w-full inline-flex justify-center items-center gap-2 relative z-10 font-bold shadow-lg shadow-orange-500/30">
                Bilemediğim Sorulardan Sınav Hazırla <Wand2 size={16} />
              </Link>
            </div>
          )}

          {exams.map((exam) => {
            // Find attempts for this exam
            const attempts = scores.filter(s => s.examId === exam.id);
            const bestScore = attempts.length > 0 ? Math.max(...attempts.map(a => a.score?.total || 0)) : null;
            const lastAttempt = attempts.length > 0 ? attempts[0] : null;

            // Check if active
            const now = new Date().getTime();
            let isWaiting = false;
            let isExpired = false;
            if (exam.startTime && now < new Date(exam.startTime).getTime()) isWaiting = true;
            if (exam.endTime && now > new Date(exam.endTime).getTime()) isExpired = true;

            return (
              <div key={exam.id} className="card hover:shadow-lg transition-shadow cursor-pointer relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-primary group-hover:w-2 transition-all"></div>
                <div className="pl-2">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg">{exam.title}</h3>
                    <div className="flex gap-2">
                      <span className="bg-primary-soft text-primary text-xs font-bold px-2 py-1 rounded-md">{exam.level}</span>
                      {attempts.length > 0 && (
                        <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1">
                          <Check size={12} /> Çözüldü
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted mb-4">{exam.description}</p>
                  
                  <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-500 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-1.5"><BookOpen size={14} className="text-slate-400" /> {exam.questions.length} Soru</div>
                    <div className="flex items-center gap-1.5"><Clock size={14} className="text-slate-400" /> {exam.recommendedTimeMinutes} Dakika</div>
                    <div className="flex items-center gap-1.5"><Award size={14} className="text-slate-400" /> 100 Puan</div>
                  </div>

                  {attempts.length > 0 && (
                    <div className="mb-4 bg-green-50 p-3 rounded-xl border border-green-100">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-green-700 uppercase">Önceki Denemeleriniz ({attempts.length})</span>
                        {bestScore !== null && (
                          <span className="text-xs font-black text-green-800 bg-green-200 px-2 py-0.5 rounded-full">En Yüksek: {bestScore} Puan</span>
                        )}
                      </div>
                      <div className="text-sm text-green-800">
                        Son deneme: <strong>{lastAttempt.score?.total} Puan</strong> 
                        <span className="text-xs opacity-75 ml-2">({new Date(lastAttempt.date).toLocaleString('tr-TR')})</span>
                      </div>
                    </div>
                  )}
                  
                  {isWaiting ? (
                    <div className="bg-amber-50 text-amber-700 p-3 rounded-xl font-medium text-sm text-center flex items-center justify-center gap-2">
                      <Clock size={18} /> Bu sınav {new Date(exam.startTime).toLocaleString('tr-TR')} tarihinde başlayacak.
                    </div>
                  ) : isExpired ? (
                    <div className="bg-red-50 text-red-700 p-3 rounded-xl font-medium text-sm text-center flex items-center justify-center gap-2">
                      <Clock size={18} /> Bu sınavın süresi dolmuştur.
                    </div>
                  ) : (
                    <Link href={`/exam/${exam.id}`} className="btn btn-primary w-full inline-flex justify-center items-center gap-2">
                      {attempts.length > 0 ? (
                        <>Yeniden Dene <RefreshCw size={16} /></>
                      ) : (
                        <>Sınava Başla <BookOpen size={16} /></>
                      )}
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
          
          {exams.length === 0 && (
            <div className="text-center p-10 bg-slate-50 rounded-2xl border border-slate-100 text-slate-500">
              Şu anda aktif bir sınav bulunmuyor.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
