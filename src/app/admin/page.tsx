/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Users, Search, RefreshCw, Wand2, FolderCog, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
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
        fetchResults();
      }
    } catch(e) {}
  }, [router]);

  // In a real app, use NextAuth or similar. For this static-like setup, simple protection.
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin123") {
      setIsAuthenticated(true);
      fetchResults();
    } else {
      alert("Hatalı şifre!");
    }
  };

  const fetchResults = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin-results");
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        // Sort by date descending
        const sorted = (data.results || []).sort((a: any, b: any) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setResults(sorted);
      }
    } catch (err) {
      setError("Veriler çekilirken bir hata oluştu.");
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("student_session");
    setIsAuthenticated(false);
    setPassword("");
    router.push("/");
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
          <div className="mt-4 text-center">
            <button onClick={handleLogout} className="text-sm text-slate-500 hover:text-red-500 font-bold transition-colors">
              Farklı bir hesapla giriş yap (Çıkış)
            </button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="py-4">
      <header className="flex flex-col sm:flex-row justify-between items-center mb-6 bg-white p-4 rounded-2xl shadow-sm border border-slate-200 gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="bg-primary-soft p-2 rounded-lg text-primary">
            <Users size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Sınav Sonuçları</h2>
            <p className="text-sm text-slate-500">Tüm öğrencilerin analizleri</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-start sm:justify-end">
          <Link href="/admin/users" className="p-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-2 text-sm font-bold">
            <Users size={16} />
            Kullanıcıları Yönet
          </Link>
          <Link href="/admin/groups" className="p-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-2 text-sm font-bold">
            <Users size={16} />
            Sınıfları Yönet
          </Link>
          <Link href="/admin/manage-exams" className="p-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-2 text-sm font-bold">
            <FolderCog size={16} />
            Sınavları Yönet
          </Link>
          <Link href="/admin/generate-exam" className="p-2 bg-primary text-white hover:bg-primary-dark rounded-lg transition-colors flex items-center gap-2 text-sm font-bold">
            <Wand2 size={16} />
            Sınav Üret
          </Link>
          <Link href="/dashboard" className="p-2 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 rounded-lg transition-colors flex items-center gap-2 text-sm font-bold">
            Öğrenci Paneli
          </Link>
          <Link href="/training" className="p-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-2 text-sm font-bold">
            🚀 Antrenman
          </Link>
          <button onClick={fetchResults} className="p-2 text-slate-500 hover:text-primary hover:bg-primary-soft rounded-lg transition-colors flex items-center gap-2 text-sm font-bold">
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Yenile
          </button>
          <button onClick={handleLogout} className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2 text-sm font-bold">
            Çıkış Yap
          </button>
        </div>
      </header>

      <div className="mb-6">
        <Link href="/admin/generate-exam" className="block w-full text-center p-4 bg-green-500 text-white text-xl font-bold rounded-xl shadow-lg hover:bg-green-600">
          ✨ DİNAMİK SINAV ÜRET (BURAYA TIKLAYIN) ✨
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 border border-red-100 text-sm font-semibold">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-slate-500 font-semibold animate-pulse">Yükleniyor...</div>
        ) : results.length === 0 ? (
          <div className="p-10 text-center text-slate-500 font-semibold">Henüz hiç sınav sonucu yok.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-4">Öğrenci</th>
                  <th className="p-4">Sınıf</th>
                  <th className="p-4">Sınav ID</th>
                  <th className="p-4">Tarih</th>
                  <th className="p-4 text-center">Toplam Puan</th>
                  <th className="p-4">Detaylar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {results.map((r, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-bold text-slate-800">{r.student?.name}</td>
                    <td className="p-4 text-slate-600">{r.student?.group}</td>
                    <td className="p-4 text-slate-600">{r.examId}</td>
                    <td className="p-4 text-slate-500">
                      {new Date(r.date).toLocaleString('tr-TR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full font-bold text-xs ${
                        r.score?.total >= 90 ? 'bg-green-100 text-green-700' : 
                        r.score?.total >= 70 ? 'bg-blue-100 text-blue-700' : 
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {r.score?.total}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="text-xs text-slate-500">
                        Test: {r.score?.mcq} | Eşleş: {r.score?.match} | Boşluk: {r.score?.blank}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
