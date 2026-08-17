"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Map, ArrowLeft, Star, Play, CheckCircle2 } from "lucide-react";

interface Module {
  id: string;
  title: string;
  questionCount: number;
}

const LEVEL_CONFIG: Record<number, { title: string, color: string, ring: string, bg: string, iconColor: string }> = {
  1: { title: "Seviye 1: Temel İletişim", color: "from-emerald-400 to-green-500", ring: "ring-emerald-200", bg: "bg-emerald-50", iconColor: "text-emerald-500" },
  2: { title: "Seviye 2: Günlük İhtiyaçlar", color: "from-blue-400 to-cyan-500", ring: "ring-blue-200", bg: "bg-blue-50", iconColor: "text-blue-500" },
  3: { title: "Seviye 3: Sosyal Yaşam", color: "from-orange-400 to-amber-500", ring: "ring-orange-200", bg: "bg-orange-50", iconColor: "text-orange-500" },
  4: { title: "Seviye 4: İş ve Ev", color: "from-pink-400 to-rose-500", ring: "ring-pink-200", bg: "bg-pink-50", iconColor: "text-pink-500" },
  5: { title: "Seviye 5: Resmi Kurumlar", color: "from-purple-500 to-indigo-600", ring: "ring-purple-200", bg: "bg-purple-50", iconColor: "text-purple-500" }
};

export default function DialoguesHubPage() {
  const [modules, setModules] = useState<Module[]>([]);
  const [completedCounts, setCompletedCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const session = localStorage.getItem("student_session");
    if (!session) {
      router.push("/");
      return;
    }
    const parsedStudent = JSON.parse(session);

    const fetchData = async () => {
      try {
        const [modRes, progRes] = await Promise.all([
          fetch("/api/modules"),
          fetch(`/api/training-progress?studentId=${parsedStudent.id}`)
        ]);

        const modData = await modRes.json();
        const progData = await progRes.json();

        // Sadece 'simulations_l' ile başlayanları al
        const simModules = (modData.modules || []).filter((m: Module) => m.id.startsWith("simulations_l"));
        
        // İsme göre sırala
        simModules.sort((a: Module, b: Module) => a.id.localeCompare(b.id));
        setModules(simModules);

        const progress = progData.progress || {};
        const completed: Record<string, number> = {};
        
        simModules.forEach((mod: Module) => {
          if (progress[mod.id]) {
            const p = progress[mod.id];
            const maxProg = Math.max(p.allProgress || 0, p.uiState?.currentIndex || 0);
            completed[mod.id] = maxProg;
          } else {
            completed[mod.id] = 0;
          }
        });
        
        setCompletedCounts(completed);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching dialogues:", err);
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  // Modülleri seviyelere göre grupla
  const groupedModules: Record<number, Module[]> = { 1: [], 2: [], 3: [], 4: [], 5: [] };
  modules.forEach(m => {
    const match = m.id.match(/simulations_l(\d)_/);
    if (match && match[1]) {
      const lvl = parseInt(match[1]);
      if (groupedModules[lvl]) groupedModules[lvl].push(m);
    }
  });

  // Zikzak pattern: Sol, Orta, Sağ
  const getAlignment = (index: number) => {
    const pos = index % 4;
    if (pos === 0) return "justify-center";
    if (pos === 1) return "justify-end pr-10 md:pr-32";
    if (pos === 2) return "justify-center";
    return "justify-start pl-10 md:pl-32";
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20 font-sans">
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-4 flex items-center shadow-sm">
        <Link href="/dashboard" className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors text-slate-600">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-xl font-bold ml-2 flex items-center gap-2">
          <Map className="text-indigo-500" />
          Hikaye Haritası
        </h1>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 overflow-x-hidden">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Hayat Simülasyonları</h2>
          <p className="text-slate-500 mt-2 text-lg">Gerçek hayattan senaryolarla pratik yapın.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-16 relative py-4">
            {/* Arka plan bağlantı çizgisi */}
            <div className="absolute top-10 bottom-10 left-1/2 w-3 -ml-[1.5px] bg-slate-200 rounded-full z-0 opacity-40"></div>

            {[1, 2, 3, 4, 5].map(level => {
              const levelMods = groupedModules[level];
              if (!levelMods || levelMods.length === 0) return null;
              
              const conf = LEVEL_CONFIG[level];

              return (
                <div key={level} className="relative z-10 mb-16">
                  <div className={`mb-10 flex flex-col items-center sticky top-[72px] z-20 py-2`}>
                    <div className={`px-6 py-2 rounded-full font-bold text-white shadow-md bg-gradient-to-r ${conf.color}`}>
                      {conf.title}
                    </div>
                  </div>

                  <div className="flex flex-col gap-12 md:gap-16">
                    {levelMods.map((mod, idx) => {
                      const isComplete = completedCounts[mod.id] >= mod.questionCount && mod.questionCount > 0;
                      const inProgress = completedCounts[mod.id] > 0 && !isComplete;
                      const progressPercent = mod.questionCount > 0 ? (completedCounts[mod.id] / mod.questionCount) * 100 : 0;
                      
                      return (
                        <div key={mod.id} className={`flex w-full ${getAlignment(idx)}`}>
                          <Link href={`/training/${mod.id}`} className="group relative z-10">
                            {/* Gölgeli Buton Tasarımı (Oyun Vari) */}
                            <div className="relative transform transition-transform group-hover:scale-105 active:scale-95 duration-200">
                              <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 shadow-xl flex flex-col items-center justify-center bg-white ${isComplete ? 'border-yellow-400' : inProgress ? 'border-indigo-400' : 'border-slate-300'} ring-8 ${isComplete ? 'ring-yellow-100' : inProgress ? 'ring-indigo-50' : 'ring-transparent'}`}>
                                
                                {isComplete ? (
                                  <Star size={40} className="text-yellow-400 fill-yellow-400 drop-shadow-md mb-1" />
                                ) : inProgress ? (
                                  <Play size={40} className="text-indigo-500 fill-indigo-100 drop-shadow-md ml-1 mb-1" />
                                ) : (
                                  <Star size={40} className="text-slate-300 fill-slate-100 drop-shadow-sm mb-1" />
                                )}
                                
                                {/* Progress Bar for InProgress */}
                                {inProgress && (
                                  <div className="w-12 h-2 bg-slate-100 rounded-full overflow-hidden mt-1">
                                    <div className="h-full bg-indigo-500" style={{width: `${progressPercent}%`}}></div>
                                  </div>
                                )}
                              </div>

                              {/* Tooltip (Title) */}
                              <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 w-48 text-center pointer-events-none">
                                <div className={`px-3 py-1.5 rounded-xl text-sm font-bold shadow-sm inline-block bg-white text-slate-700 border border-slate-200`}>
                                  {mod.title.split(': ')[1] || mod.title}
                                </div>
                              </div>
                            </div>
                          </Link>
                        </div>
                      );
                    })}
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
