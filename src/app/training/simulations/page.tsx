'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SimulationsCenterPage() {
  const [simModules, setSimModules] = useState<any[]>([]);
  const [progressCounts, setProgressCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const session = localStorage.getItem('student_session');
    if (!session) {
      router.push('/');
      return;
    }
    
    const parsedStudent = JSON.parse(session);

    const fetchData = async () => {
      try {
        const [modRes, progRes] = await Promise.all([
          fetch('/api/modules'),
          fetch(`/api/training-progress?studentId=${parsedStudent.id}`)
        ]);

        const modData = await modRes.json();
        const progData = await progRes.json();
        
        const sMods = (modData.modules || []).filter((m: any) => m.id.startsWith('simulations_'));
        
        // Seviye sıralaması
        sMods.sort((a: any, b: any) => {
          const lA = parseInt(a.id.split('_l')[1]?.split('_')[0] || '99');
          const lB = parseInt(b.id.split('_l')[1]?.split('_')[0] || '99');
          return lA - lB;
        });

        setSimModules(sMods);

        const progress = progData.progress || {};
        const allCounts: Record<string, number> = {};
        
        sMods.forEach((mod: any) => {
          if (progress[mod.id]) {
            const stateIdx = progress[mod.id].uiState?.currentIndex;
            const fallbackAll = progress[mod.id].allProgress || 0;
            allCounts[mod.id] = stateIdx !== undefined ? stateIdx : fallbackAll;
          } else {
            allCounts[mod.id] = 0;
          }
        });
        
        setProgressCounts(allCounts);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);

  // Duolingo tarzı zig-zag yörünge sınıfı (sağ-orta-sol-orta)
  const getTranslateClass = (index: number) => {
    const mod = index % 4;
    if (mod === 0) return 'translate-x-0';
    if (mod === 1) return 'translate-x-14 sm:translate-x-24';
    if (mod === 2) return 'translate-x-0';
    if (mod === 3) return '-translate-x-14 sm:-translate-x-24';
    return '';
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] py-6 px-3 sm:px-6 lg:px-8 font-sans overflow-x-hidden">
      <div className="max-w-2xl mx-auto">
        
        {/* Üst Kısım / Header */}
        <div className="flex items-center gap-4 mb-10 sticky top-4 z-50 bg-[#f3f4f6]/90 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-slate-200/50">
          <Link href="/training" className="w-10 h-10 flex flex-shrink-0 items-center justify-center bg-white border-2 border-slate-300 text-slate-500 rounded-full hover:bg-slate-100 hover:text-slate-800 transition-colors shadow-sm font-bold text-lg">
            ←
          </Link>
          <div>
             <h1 className="text-xl sm:text-2xl font-black text-slate-800">Hayat Simülasyonları</h1>
             <p className="text-slate-500 text-xs sm:text-sm font-bold mt-0.5">Yolculuğunu takip et ve ustalaş!</p>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-3xl shadow-sm border-2 border-slate-200 p-12 text-center text-slate-500 flex justify-center items-center gap-2 font-bold">
            <span className="w-6 h-6 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></span>
            Harita Yükleniyor...
          </div>
        ) : simModules.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-sm border-2 border-slate-200 p-12 text-center text-slate-500 font-bold">
            Henüz hiç simülasyon bulunamadı.
          </div>
        ) : (
          <div className="relative flex flex-col items-center py-6 mt-2 pb-32">
            
            {/* Ortadan Geçen Ana Çizgi */}
            <div className="absolute top-10 bottom-24 w-4 bg-[#e5e7eb] rounded-full z-0 left-1/2 -translate-x-1/2 shadow-inner border-x-2 border-dashed border-slate-300"></div>

            <div className="space-y-12 sm:space-y-16 relative w-full flex flex-col items-center">
              {simModules.map((mod: any, index: number) => {
                const totalQuestions = mod.questionCount;
                const progressCount = progressCounts[mod.id] || 0;
                const progressPercent = totalQuestions > 0 ? Math.min(100, Math.round((progressCount / totalQuestions) * 100)) : 0;
                
                // Durum Mantığı
                const isCompleted = progressPercent === 100;
                const isStarted = progressPercent > 0 && progressPercent < 100;
                const isLocked = !isStarted && !isCompleted;
                
                // Seviye sayısını bul
                const match = mod.id.match(/_l(\d+)_/);
                const levelNum = match ? parseInt(match[1]) : index + 1;

                // Dinamik Stiller
                let buttonColor = "bg-[#e5e7eb] border-[#d1d5db] text-[#9ca3af]"; // Locked / Default
                let icon = "🔒";
                let shadowClass = "shadow-[0_8px_0_0_#d1d5db]";
                
                if (isCompleted) {
                   buttonColor = "bg-[#ffc800] border-[#e6b400] text-white"; // Altın Sarısı
                   icon = "👑";
                   shadowClass = "shadow-[0_8px_0_0_#e6b400]";
                } else if (isStarted) {
                   buttonColor = "bg-[#58cc02] border-[#58a700] text-white"; // Duolingo Yeşili
                   icon = "⭐";
                   shadowClass = "shadow-[0_8px_0_0_#58a700]";
                }

                // Animasyon: Aktif olan veya başlanmış olan node'u hafif zıplatabiliriz
                const animationClass = isStarted ? 'animate-bounce-slight' : '';

                return (
                  <div key={mod.id} className={`relative z-10 flex flex-col items-center group w-full ${getTranslateClass(index)}`}>
                    
                    {/* Bilgi Balonu (Sadece başlanan/biten veya hover olunanlarda göster) */}
                    <div className="bg-white border-2 border-slate-200 px-4 py-2 rounded-2xl shadow-sm text-center mb-4 relative z-20 min-w-[140px] max-w-[200px] transition-transform transform group-hover:-translate-y-1">
                       <h3 className="text-sm font-black text-slate-700 leading-tight">
                         {mod.title.replace(`Seviye ${levelNum}: `, '')}
                       </h3>
                       <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
                         Seviye {levelNum} • {totalQuestions} Adım
                       </p>
                       {/* Balonun altındaki ok işareti */}
                       <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-b-2 border-r-2 border-slate-200 rotate-45"></div>
                    </div>

                    {/* Devasa Oyun Butonu (Düğüm) */}
                    <button
                      onClick={() => router.push(`/training/${mod.id}?mode=all&lang=bg`)}
                      className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 flex items-center justify-center text-3xl sm:text-4xl transition-all active:translate-y-2 active:shadow-none hover:brightness-110 z-10 ${buttonColor} ${shadowClass} ${animationClass}`}
                    >
                      <span className="drop-shadow-md">{icon}</span>
                      
                      {/* Tamamlanma Çemberi (Progress Ring) - Sadece Başlanmışsa */}
                      {isStarted && (
                        <svg className="absolute -inset-2 w-[calc(100%+16px)] h-[calc(100%+16px)] -rotate-90 pointer-events-none">
                          <circle cx="50%" cy="50%" r="48%" stroke="rgba(88, 204, 2, 0.2)" strokeWidth="6" fill="none" />
                          <circle cx="50%" cy="50%" r="48%" stroke="#58cc02" strokeWidth="6" fill="none" strokeDasharray="300" strokeDashoffset={300 - (300 * progressPercent) / 100} className="transition-all duration-1000 ease-out" />
                        </svg>
                      )}
                    </button>

                  </div>
                );
              })}
              
              {/* Harita Sonu Sandık / Ödül */}
              <div className="relative z-10 mt-10">
                 <div className="w-16 h-16 bg-gradient-to-b from-amber-200 to-amber-500 rounded-2xl shadow-lg border-4 border-amber-600 flex items-center justify-center text-3xl rotate-12">
                   🎁
                 </div>
              </div>

            </div>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes bounce-slight {
          0%, 100% { transform: translateY(-3%); animation-timing-function: cubic-bezier(0.8,0,1,1); }
          50% { transform: none; animation-timing-function: cubic-bezier(0,0,0.2,1); }
        }
        .animate-bounce-slight {
          animation: bounce-slight 2s infinite;
        }
      `}} />
    </div>
  );
}
