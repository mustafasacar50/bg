/* eslint-disable @typescript-eslint/no-explicit-any */
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
  const [allProgressCounts, setAllProgressCounts] = useState<Record<string, number>>({});
  const [bgProgressCounts, setBgProgressCounts] = useState<Record<string, number>>({});
  const [trProgressCounts, setTrProgressCounts] = useState<Record<string, number>>({});
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  
  const [activeLangFilter, setActiveLangFilter] = useState<'bg' | 'tr' | 'all'>('bg');

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
          if (mId === 'unknownWords' || mId === 'lastActiveTraining' || mId === 'lastVisitedModule' || mId === 'customDictionary') continue;
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

        const counts: Record<string, number> = {};
        const allCounts: Record<string, number> = {};
        const bgCounts: Record<string, number> = {};
        const trCounts: Record<string, number> = {};
        
        mods.forEach((mod: any) => {
          if (progress[mod.id]) {
            counts[mod.id] = progress[mod.id].mistakes ? progress[mod.id].mistakes.length : 0;
            const stateIdx = progress[mod.id].uiState?.currentIndex;
            const fallbackAll = progress[mod.id].allProgress || 0;
            allCounts[mod.id] = stateIdx !== undefined ? stateIdx : fallbackAll;
            
            // Migrate bgProgress if missing but allProgress exists (since bg was default)
            bgCounts[mod.id] = progress[mod.id].bgProgress ?? Math.min(fallbackAll, mod.bgCount || 0);
            trCounts[mod.id] = progress[mod.id].trProgress || 0;
          } else {
            counts[mod.id] = 0;
            allCounts[mod.id] = 0;
            bgCounts[mod.id] = 0;
            trCounts[mod.id] = 0;
          }
        });
        
        setMistakeCounts(counts);
        setAllProgressCounts(allCounts);
        setBgProgressCounts(bgCounts);
        setTrProgressCounts(trCounts);
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
    <div className="min-h-screen bg-slate-50 py-6 px-3 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Antrenman Modu</h1>
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="flex items-center gap-1.5 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full shadow-sm transition-colors">
              <span>👤</span> {student.name.split(' ')[0]}
            </Link>
            <Link href="/settings" className="flex items-center justify-center w-8 h-8 text-slate-500 hover:text-indigo-600 bg-white border border-slate-200 rounded-full shadow-sm transition-colors" title="Ayarlar">
              ⚙️
            </Link>
            {student.role === 'admin' && (
              <Link href="/admin" className="text-emerald-600 hover:text-emerald-800 text-sm font-medium ml-1">
                Admin
              </Link>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
          <div className="p-4 bg-indigo-50/50 flex flex-col items-center gap-2">
            <Link href="/training/vocabulary" className="w-full sm:w-auto text-center bg-indigo-600 text-white px-6 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-indigo-700 transition-colors">
              📚 Bilinmeyen Kelimeler ➔
            </Link>
            <p className="text-slate-500 text-[11px] text-center max-w-sm">
              Antrenmanlarda işaretlediğiniz bilmediğiniz kelimeleri ve örnek cümleleri çalışın.
            </p>
          </div>
        </div>
        
        {/* Language Filter Toggle */}
        <div className="flex justify-center mb-6">
          <div className="bg-white border border-slate-200 rounded-xl p-1 inline-flex shadow-sm">
            <button
              onClick={() => setActiveLangFilter('bg')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeLangFilter === 'bg' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
            >
              🇧🇬 Bulgarca
            </button>
            <button
              onClick={() => setActiveLangFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeLangFilter === 'all' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
            >
              🌍 Karma
            </button>
            <button
              onClick={() => setActiveLangFilter('tr')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeLangFilter === 'tr' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
            >
              🇹🇷 Türkçe
            </button>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center text-slate-500 flex justify-center items-center gap-2">
            <span className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></span>
            Veriler yükleniyor...
          </div>
        ) : modules.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center text-slate-500">Henüz modül bulunmamaktadır.</div>
        ) : (
          <div className="flex flex-col gap-4">
            {modules.map((mod: any) => {
              const isActive = activeModuleId === mod.id;
              
              const totalQuestions = activeLangFilter === 'bg' ? mod.bgCount : activeLangFilter === 'tr' ? mod.trCount : mod.questionCount;
              const progressCount = activeLangFilter === 'bg' ? bgProgressCounts[mod.id] || 0 : activeLangFilter === 'tr' ? trProgressCounts[mod.id] || 0 : allProgressCounts[mod.id] || 0;
              
              // Only show module if it has questions for the selected language
              if (totalQuestions === 0) return null;
              
              const progressPercent = totalQuestions > 0 ? Math.min(100, Math.round((progressCount / totalQuestions) * 100)) : 0;
              
              return (
              <div key={mod.id} className={`bg-white rounded-2xl shadow-sm border p-4 sm:p-5 transition-all relative ${isActive ? 'border-indigo-500 ring-4 ring-indigo-50/50' : 'border-slate-200 hover:border-indigo-300 hover:shadow-md'}`}>
                {isActive && (
                  <div className="absolute top-0 right-4 bg-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-b-lg shadow-sm z-20">
                    📍 Kaldığınız Yer
                  </div>
                )}
                <div className="flex flex-col gap-3">
                  <h3 className={`text-base font-bold ${isActive ? 'text-indigo-900' : 'text-slate-800'} pr-24 leading-tight`}>{mod.title}</h3>
                  
                  {/* Row 1: Progress (Left) & Mistakes (Right) */}
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-md border ${isActive ? 'bg-indigo-100/50 text-indigo-700 border-indigo-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                      {progressCount > 0 ? `${progressCount} / ${totalQuestions}` : `${totalQuestions} soru`}
                    </span>
                    
                    {mistakeCounts[mod.id] > 0 && (
                      <button
                        onClick={() => router.push(`/training/${mod.id}?mode=mistakes&lang=${activeLangFilter}`)}
                        className="inline-flex items-center px-3 py-1 bg-amber-100 text-amber-700 hover:bg-amber-200 border border-amber-200 text-[11px] font-bold rounded-lg shadow-sm transition-colors"
                      >
                        ⚠️ Bilemediklerim ({mistakeCounts[mod.id]})
                      </button>
                    )}
                  </div>
                  
                  {/* Row 2: Tüm Havuz Button (Slider) */}
                  <button
                    onClick={() => router.push(`/training/${mod.id}?mode=all&lang=${activeLangFilter}`)}
                    className="relative w-full inline-flex justify-center items-center py-2.5 border border-indigo-200 text-sm font-extrabold rounded-xl shadow-sm text-indigo-700 bg-white hover:bg-indigo-50 focus:outline-none overflow-hidden transition-colors mt-1"
                  >
                    <div className="absolute inset-0 bg-indigo-100/80 transition-all duration-300" style={{ width: `${progressPercent}%` }}></div>
                    {progressPercent > 0 && (
                      <span className="absolute left-3 text-indigo-500 font-black text-xs drop-shadow-sm">
                        %{progressPercent}
                      </span>
                    )}
                    <span className="relative z-10 flex items-center">
                      📚 Tüm Havuz
                    </span>
                  </button>
                </div>
              </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
