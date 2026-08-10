'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Module {
  id: string;
  title: string;
  questionCount: number;
}

export default function TrainingListPage() {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const [student, setStudent] = useState<any>(null);
  const [mistakeCounts, setMistakeCounts] = useState<Record<string, number>>({});
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);

  useEffect(() => {
    const session = localStorage.getItem('student_session');
    if (!session) {
      router.push('/');
      return;
    }
    
    const parsedStudent = JSON.parse(session);
    setStudent(parsedStudent);

    const lastActiveStr = localStorage.getItem("last_active_training");
    if (lastActiveStr && !sessionStorage.getItem('has_auto_redirected')) {
       sessionStorage.setItem('has_auto_redirected', 'true');
       const parsedLast = JSON.parse(lastActiveStr);
       window.location.href = parsedLast.url;
       return;
    }

    const fetchModulesAndProgress = async () => {
      try {
        const [modRes, progRes] = await Promise.all([
          fetch('/api/modules'),
          fetch(`/api/training-progress?studentId=${parsedStudent.id}`)
        ]);

        const modData = await modRes.json();
        const progData = await progRes.json();
        
        // Check for cloud sync auto-resume
        const cloudActiveTraining = progData.progress?.lastActiveTraining;
        if (cloudActiveTraining && !sessionStorage.getItem('has_auto_redirected')) {
           sessionStorage.setItem('has_auto_redirected', 'true');
           window.location.href = cloudActiveTraining;
           return;
        }

        const progress = progData.progress || {};
        
        // 1. Get local visited module and its timestamp
        let localModData = null;
        try {
          const str = localStorage.getItem('last_visited_module_data');
          if (str) localModData = JSON.parse(str);
        } catch(e) {}

        let activeModId = localModData?.id || localStorage.getItem('last_visited_module');
        let localTs = localModData?.ts || 0;

        // 2. Find the most recently updated module in the cloud
        let latestCloudModId = null;
        let latestCloudTs = 0;
        
        for (const [mId, mData] of Object.entries(progress)) {
          if (mId === 'unknownWords' || mId === 'lastActiveTraining' || mId === 'lastVisitedModule') continue;
          const data = mData as any;
          if (data.lastUpdated) {
            const ts = new Date(data.lastUpdated).getTime();
            if (ts > latestCloudTs) {
              latestCloudTs = ts;
              latestCloudModId = mId;
            }
          }
        }

        // 3. Compare and select the newest one
        if (latestCloudTs > localTs && latestCloudModId) {
          activeModId = latestCloudModId;
        } else if (!activeModId && progress.lastVisitedModule) {
          activeModId = progress.lastVisitedModule;
        } else if (!activeModId && cloudActiveTraining) {
          try {
            activeModId = cloudActiveTraining.split('/training/')[1].split('?')[0];
          } catch(e) {}
        }
        
        setActiveModuleId(activeModId);

        const mods = modData.modules || [];
        setModules(mods);

        const progress = progData.progress || {};
        const counts: Record<string, number> = {};
        
        mods.forEach((mod: Module) => {
          if (progress[mod.id] && progress[mod.id].mistakes) {
            counts[mod.id] = progress[mod.id].mistakes.length;
          } else {
            counts[mod.id] = 0;
          }
        });
        
        setMistakeCounts(counts);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setLoading(false);
      }
    };

    fetchModulesAndProgress();
  }, [router]);

  if (!student) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500">Yönlendiriliyor...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Antrenman Modu</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-500 bg-white px-3 py-1 rounded-full shadow-sm">👤 {student.name}</span>
            {student.role === 'admin' && (
              <Link href="/admin" className="text-emerald-600 hover:text-emerald-800 font-medium">
                Admin Paneli
              </Link>
            )}
            <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-800 font-medium">
              Öğrenci Paneli
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
          <div className="p-4 border-b border-slate-100 bg-indigo-50/50 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">📚 Kelime Sepetim</h2>
              <p className="text-slate-500 text-sm mt-1">Antrenmanlarda işaretlediğiniz bilmediğiniz kelimeleri ve örnek cümleleri çalışın.</p>
            </div>
            <Link href="/training/vocabulary" className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-sm hover:bg-indigo-700 transition-colors whitespace-nowrap">
              Kelimelere Çalış ➔
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-lg font-semibold text-slate-800">Eğitim Modülleri</h2>
            <p className="text-slate-500 text-sm mt-1">Çalışmak istediğiniz dersi seçin ve interaktif olarak kelime/çeviri pratiği yapın.</p>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-500 flex justify-center items-center gap-2">
              <span className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></span>
              Veriler yükleniyor...
            </div>
          ) : modules.length === 0 ? (
            <div className="p-12 text-center text-slate-500">Henüz modül bulunmamaktadır.</div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {modules.map((mod) => {
                const isActive = activeModuleId === mod.id;
                return (
                <li key={mod.id} className={`p-4 sm:p-6 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 relative ${isActive ? 'bg-indigo-50/70 hover:bg-indigo-50 border-l-4 border-indigo-600' : 'hover:bg-slate-50'}`}>
                  {isActive && (
                    <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg rounded-tr-lg shadow-sm">
                      📍 Kaldığınız Yer
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className={`text-lg font-bold ${isActive ? 'text-indigo-900' : 'text-slate-800'}`}>{mod.title}</h3>
                    <p className={`text-sm mt-1 font-medium ${isActive ? 'text-indigo-600/80' : 'text-slate-500'}`}>{mod.questionCount} soru içeriyor</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => router.push(`/training/${mod.id}?mode=all`)}
                      className="inline-flex justify-center items-center px-4 py-2 border-2 border-indigo-600 text-sm font-bold rounded-lg shadow-sm text-indigo-700 bg-white hover:bg-indigo-50 focus:outline-none transition-colors"
                    >
                      📚 Tüm Havuz
                    </button>
                    <button
                      onClick={() => router.push(`/training/${mod.id}?mode=mistakes`)}
                      disabled={!mistakeCounts[mod.id]}
                      className={`inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-bold rounded-lg shadow-sm transition-colors ${mistakeCounts[mod.id] ? 'text-white bg-amber-500 hover:bg-amber-600' : 'text-slate-400 bg-slate-100 cursor-not-allowed'}`}
                    >
                      ⚠️ Bilemediklerim ({mistakeCounts[mod.id] || 0})
                    </button>
                  </div>
                </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
