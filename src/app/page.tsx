"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GraduationCap, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // If already logged in, redirect to dashboard
    const session = localStorage.getItem("student_session");
    if (session) {
      const user = JSON.parse(session);
      if (user.role === 'admin') router.push("/admin");
      else router.push("/dashboard");
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;
    
    setLoading(true);
    setError("");

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await res.json();
      
      if (data.success) {
        localStorage.setItem("student_session", JSON.stringify(data.user));
        if (data.user.role === 'admin') {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
      } else {
        setError(data.error || "Giriş başarısız.");
      }
    } catch (err) {
      setError("Bağlantı hatası oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center">
      <div className="hero mb-6 text-center py-10">
        <div className="flex justify-center mb-4">
          <div className="bg-white/20 p-4 rounded-full">
            <GraduationCap size={48} />
          </div>
        </div>
        <h1 className="text-3xl font-bold">Bulgarca Sınav Modülü</h1>
        <p className="mt-2 text-white/80">Sınavlara katılmak için giriş yapın</p>
      </div>

      <div className="card">
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm font-bold border border-red-200">{error}</div>}
        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div>
            <label className="label" htmlFor="username">Kullanıcı Adı</label>
            <input 
              id="username"
              type="text" 
              className="text-input" 
              placeholder="Kullanıcı adınızı girin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="password">Şifre</label>
            <input 
              id="password"
              type="password" 
              className="text-input" 
              placeholder="Şifrenizi girin"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" disabled={loading} className="btn btn-primary flex items-center justify-center gap-2 mt-2">
            {loading ? 'Giriş Yapılıyor...' : 'Sisteme Giriş Yap'} <ArrowRight size={18} />
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-slate-200">
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto text-lg leading-relaxed">
            Öğrenciler için interaktif Bulgarca sınav platformuna ve interaktif antrenman moduna hoş geldiniz.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/training"
              className="px-8 py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 hover:-translate-y-1 transition-all duration-300 shadow-[0_4px_14px_0_rgb(79,70,229,0.39)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.23)] flex items-center justify-center gap-2"
            >
              <span>🚀</span> Antrenman Modu
            </Link>
            <Link
              href="/dashboard"
              className="px-8 py-4 bg-white text-indigo-600 font-bold rounded-xl border-2 border-indigo-100 hover:border-indigo-600 hover:bg-indigo-50 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <span>📝</span> Sınava Gir
            </Link>
            <Link
              href="/admin"
              className="px-8 py-4 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-900 hover:-translate-y-1 transition-all duration-300 shadow-lg flex items-center justify-center gap-2"
            >
              <span>⚙️</span> Yönetici Paneli
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
