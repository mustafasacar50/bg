"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut, ArrowLeft, User, Settings as SettingsIcon } from "lucide-react";

export default function SettingsPage() {
  const [student, setStudent] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const session = localStorage.getItem("student_session");
    if (!session) {
      router.push("/");
    } else {
      setStudent(JSON.parse(session));
    }
  }, [router]);

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
  );
}
