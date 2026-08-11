"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut, ArrowLeft, User, Settings as SettingsIcon } from "lucide-react";

export default function SettingsPage() {
  const [student, setStudent] = useState<any>(null);
  
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);
  
  const router = useRouter();

  useEffect(() => {
    const session = localStorage.getItem("student_session");
    if (!session) {
      router.push("/");
    } else {
      const parsed = JSON.parse(session);
      setStudent(parsed);
      setName(parsed.name || "");
      setUsername(parsed.username || "");
    }
  }, [router]);

  const handleSave = async () => {
    if (!currentPassword) {
      setError("Değişiklik yapmak için mevcut şifrenizi girmelisiniz.");
      setSuccess("");
      return;
    }

    if (!name || !username) {
       setError("Ad Soyad ve Kullanıcı Adı boş olamaz.");
       setSuccess("");
       return;
    }

    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: student.id,
          name,
          username,
          password: newPassword || undefined, // only update if provided
          isUserSelfUpdate: true,
          currentPassword
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Bir hata oluştu.");
      } else {
        setSuccess("Profiliniz başarıyla güncellendi!");
        setCurrentPassword("");
        setNewPassword("");
        
        // Update local session
        const updatedStudent = { ...student, ...data.user };
        setStudent(updatedStudent);
        localStorage.setItem("student_session", JSON.stringify(updatedStudent));
      }
    } catch (err) {
      setError("Sunucuya bağlanırken bir hata oluştu.");
    }
    
    setSaving(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("student_session");
    router.push("/");
  };

  if (!student) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500">Yönlendiriliyor...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => router.back()} className="p-2 bg-white text-slate-500 hover:text-indigo-600 rounded-full shadow-sm border border-slate-200 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <SettingsIcon size={24} className="text-indigo-600" /> Ayarlar
          </h1>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
          <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-indigo-50 p-3 rounded-full text-indigo-600">
                <User size={32} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">{student.name}</h2>
                {student.group && (
                  <p className="text-sm font-medium text-slate-500">Grup: {student.group}</p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {error && <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium">{error}</div>}
              {success && <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl text-sm font-medium">{success}</div>}

              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="font-bold text-slate-700">Profil Bilgileri</h3>
                
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Kullanıcı Adı</label>
                  <input 
                    type="text" 
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Ad Soyad</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="font-bold text-slate-700">Şifre Değiştir</h3>
                
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Mevcut Şifre (Güncelleme için Zorunlu)</label>
                  <input 
                    type="password" 
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Yeni Şifre (İsteğe Bağlı)</label>
                  <input 
                    type="password" 
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                </button>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-6">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 bg-rose-50 text-rose-600 hover:bg-rose-100 py-3 px-4 rounded-xl font-bold transition-colors"
                >
                  <LogOut size={18} />
                  Çıkış Yap
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
