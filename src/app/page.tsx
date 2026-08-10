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
    // If already logged in, redirect to dashboard or active training
    const session = localStorage.getItem("student_session");
    if (session) {
      try {
        const user = JSON.parse(session);
        if (user.role === 'admin') {
          router.push("/admin");
        } else {
          const lastActiveStr = localStorage.getItem("last_active_training");
          if (lastActiveStr && !sessionStorage.getItem('has_auto_redirected')) {
             sessionStorage.setItem('has_auto_redirected', 'true');
             const parsed = JSON.parse(lastActiveStr);
             window.location.href = parsed.url;
          } else {
             window.location.href = `/dashboard?t=${Date.now()}`;
          }
        }
      } catch(e) {
        window.location.href = `/dashboard?t=${Date.now()}`;
      }
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
          // Use hard navigation with a timestamp to completely bypass old Safari/PWA caches
          window.location.href = `/dashboard?t=${Date.now()}`;
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

      </div>
    </div>
  );
}
