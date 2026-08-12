/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { FolderCog, Trash2, ChevronLeft, Calendar, FileQuestion, Users, RefreshCw, Eye, PenLine } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ManageExamsPage() {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // State for exam details modal
  const [selectedExam, setSelectedExam] = useState<any | null>(null);

  const router = useRouter();

  useEffect(() => {
    const sessionStr = localStorage.getItem("student_session");
    if (!sessionStr) {
      router.push("/");
      return;
    }
    try {
      const session = JSON.parse(sessionStr);
      if (session.role === 'admin') {
        setIsAuthenticated(true);
        fetchExams();
      }
    } catch(e) {}
  }, [router]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin123") {
      setIsAuthenticated(true);
      fetchExams();
    } else {
      alert("Hatalı şifre!");
    }
  };

  const fetchExams = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/manage-exams");
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        // Sort by date created (assuming ID contains timestamp or is somewhat sequential)
        setExams(data.exams || []);
      }
    } catch (err) {
      setError("Sınavlar çekilirken bir hata oluştu.");
    }
    setLoading(false);
  };

  const deleteExam = async (id: string, title: string) => {
    if (!confirm(`"${title}" adlı sınavı kalıcı olarak silmek istediğinize emin misiniz?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/manage-exams?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (data.error) {
        alert("Hata: " + data.error);
      } else {
        setExams(exams.filter(e => e.id !== id));
        if (selectedExam?.id === id) {
          setSelectedExam(null);
        }
      }
    } catch (err) {
      alert("Sınav silinirken bir hata oluştu.");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex flex-col justify-center max-w-sm mx-auto">
        <div className="card p-8">
          <h1 className="text-2xl font-bold mb-4 text-center">Admin Paneli</h1>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input 
              type="password" 
              placeholder="Admin Şifresi" 
              className="text-input"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">Giriş Yap</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4 relative">
      <div className="mb-4">
        <Link href="/admin" className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-primary transition-colors">
          <ChevronLeft size={16} /> Öğrenci Sonuçlarına Dön
        </Link>
      </div>

      <header className="flex flex-col sm:flex-row justify-between items-center mb-6 bg-white p-4 rounded-2xl shadow-sm border border-slate-200 gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
            <FolderCog size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Sınavları Yönet</h2>
            <p className="text-sm text-slate-500">Üretilen tüm sınavları görün ve düzenleyin</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchExams} className="p-2 text-slate-500 hover:text-primary hover:bg-primary-soft rounded-lg transition-colors flex items-center gap-2 text-sm font-bold">
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Yenile
          </button>
        </div>
      </header>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 border border-red-100 text-sm font-semibold">
          {error}
        </div>
      )}

      {loading ? (
        <div className="p-10 text-center text-slate-500 font-semibold animate-pulse card">Sınavlar yükleniyor...</div>
      ) : exams.length === 0 ? (
        <div className="p-10 text-center text-slate-500 font-semibold card">Henüz üretilmiş bir sınav yok.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exams.map((exam) => (
            <div key={exam.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-slate-800 line-clamp-2 leading-tight">{exam.title}</h3>
                  <span className="bg-primary-soft text-primary text-xs font-bold px-2 py-1 rounded-md ml-2 shrink-0">
                    {exam.level}
                  </span>
                </div>
                <div className="flex gap-2 flex-wrap mb-4">
                    {exam.isPublic ? (
                      <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                        Herkese Açık
                      </span>
                    ) : (
                      (!exam.targetGroups || exam.targetGroups.length === 0) ? (
                        <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                          Gizli (Grupsuz)
                        </span>
                      ) : (
                        exam.targetGroups.map((group: string) => (
                          <span key={group} className="text-[10px] font-bold bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full">
                            Grup: {group}
                          </span>
                        ))
                      )
                    )}
                  </div>
                <p className="text-sm text-slate-500 line-clamp-2 mb-4 h-10">{exam.description}</p>
                
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="bg-slate-50 p-2 rounded-lg flex items-center gap-2 text-xs font-medium text-slate-600">
                    <FileQuestion size={14} className="text-slate-400" />
                    <span>{exam.questions?.length || 0} Soru</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg flex items-center gap-2 text-xs font-medium text-slate-600">
                    <Calendar size={14} className="text-slate-400" />
                    <span>{exam.recommendedTimeMinutes} dk</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 mt-2 pt-4 border-t border-slate-100">
                <Link 
                  href={`/admin/manage-exams/${exam.id}`}
                  className="flex-1 bg-primary-soft hover:bg-primary/20 text-primary py-2 rounded-xl text-sm font-bold flex justify-center items-center gap-1 transition-colors"
                >
                  <PenLine size={16} /> Düzenle
                </Link>
                <button 
                  onClick={() => setSelectedExam(exam)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-xl text-sm font-bold flex justify-center items-center gap-1 transition-colors"
                >
                  <Eye size={16} /> İncele
                </button>
                <button 
                  onClick={() => deleteExam(exam.id, exam.title)}
                  className="bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-xl transition-colors flex justify-center items-center px-4"
                  title="Sınavı Sil"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Exam Details Modal */}
      {selectedExam && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto overflow-x-hidden border border-slate-200">
            <div className="sticky top-0 bg-white/90 backdrop-blur border-b border-slate-100 p-4 sm:p-6 flex justify-between items-start z-10">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-primary-soft text-primary text-xs font-bold px-2 py-1 rounded-md">{selectedExam.level}</span>
                  <span className="text-xs font-bold text-slate-400">ID: {selectedExam.id}</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-800">{selectedExam.title}</h2>
              </div>
              <button 
                onClick={() => setSelectedExam(null)}
                className="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full font-bold transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="p-4 sm:p-6">
              <div className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-100">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Açıklama</h3>
                <p className="text-slate-700">{selectedExam.description}</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <div className="text-center p-3 bg-blue-50 text-blue-700 rounded-xl border border-blue-100">
                  <span className="block text-2xl font-bold">{selectedExam.questions?.length || 0}</span>
                  <span className="text-xs font-bold uppercase tracking-wider">Soru</span>
                </div>
                <div className="text-center p-3 bg-purple-50 text-purple-700 rounded-xl border border-purple-100">
                  <span className="block text-2xl font-bold">{selectedExam.recommendedTimeMinutes}</span>
                  <span className="text-xs font-bold uppercase tracking-wider">Dakika</span>
                </div>
                <div className="text-center p-3 bg-green-50 text-green-700 rounded-xl border border-green-100">
                  <span className="block text-2xl font-bold">100</span>
                  <span className="text-xs font-bold uppercase tracking-wider">Tam Puan</span>
                </div>
                <div className="text-center p-3 bg-orange-50 text-orange-700 rounded-xl border border-orange-100">
                  <span className="block text-2xl font-bold">A1</span>
                  <span className="text-xs font-bold uppercase tracking-wider">Seviye</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Link 
                  href={`/exam/${selectedExam.id}`}
                  className="flex-1 btn btn-primary flex items-center justify-center gap-2"
                  target="_blank"
                >
                  <Eye size={18} /> Sınavı Önizle
                </Link>
                <button 
                  onClick={() => deleteExam(selectedExam.id, selectedExam.title)}
                  className="px-6 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl transition-colors border border-red-100 flex items-center gap-2"
                >
                  <Trash2 size={18} /> Sil
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
