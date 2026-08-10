'use client';
import React, { useEffect, useState } from 'react';

interface DictionaryModalProps {
  word: string;
  examples: { bg: string, tr: string }[];
  onClose: () => void;
  onRemove: () => void;
}

export function DictionaryModal({ word, examples, onClose, onRemove }: DictionaryModalProps) {
  const [dict, setDict] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/dictionary.json')
      .then(r => r.json())
      .then(data => {
        setDict(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load dictionary:', err);
        setLoading(false);
      });
  }, []);

  // Try to find the exact match first, then fallback to partial matches
  let meaning = '';
  if (!loading) {
    const lowerWord = word.toLowerCase();
    meaning = dict[lowerWord] || dict[word];
    if (!meaning) {
       // Search for partial matches in dictionary keys
       const partialMatch = Object.entries(dict).find(([k]) => k.toLowerCase().includes(lowerWord));
       if (partialMatch) {
         meaning = partialMatch[1] + ` (Eşleşme: ${partialMatch[0]})`;
       }
    }
  }

  return (
    <div className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className="w-full sm:w-[500px] sm:max-h-[85vh] bg-slate-50 sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-4 duration-300"
        onClick={e => e.stopPropagation()}
        style={{ maxHeight: '90vh' }}
      >
        <div className="p-4 sm:p-6 bg-white border-b border-slate-100 flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 text-xl font-black">
               📚
             </div>
             <div>
               <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800">{word}</h2>
               <p className="text-xs sm:text-sm font-semibold text-slate-400">Kelime Çalışma Modu</p>
             </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex flex-col gap-6">
          
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Sözlük Anlamı</h3>
            {loading ? (
              <div className="animate-pulse flex h-6 bg-slate-200 rounded w-1/2"></div>
            ) : meaning ? (
              <p className="text-lg font-bold text-indigo-700">{meaning}</p>
            ) : (
              <p className="text-slate-500 italic">Sözlükte tam karşılığı bulunamadı.</p>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Örnek Cümleler ({examples.length})</h3>
            {examples.length > 0 ? (
              <div className="flex flex-col gap-2">
                {examples.slice(0, 5).map((ex, idx) => {
                  // highlight the word in the example text too
                  const regex = new RegExp(`(?<=^|[^А-Яа-яA-Za-z0-9_])(${word.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')})(?=$|[^А-Яа-яA-Za-z0-9_])`, 'gi');
                  const parts = ex.bg.split(regex);
                  
                  return (
                    <div key={idx} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col gap-1.5">
                      <div className="text-sm sm:text-base text-slate-800 font-medium leading-relaxed">
                        {parts.map((p, i) => (
                          p.toLowerCase() === word.toLowerCase() 
                            ? <span key={i} className="font-bold text-amber-700 bg-amber-100 px-1 rounded">{p}</span>
                            : <span key={i}>{p}</span>
                        ))}
                      </div>
                      {ex.tr && (
                        <div className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                          {ex.tr}
                        </div>
                      )}
                    </div>
                  );
                })}
                {examples.length > 5 && (
                  <div className="text-center text-sm font-semibold text-slate-400 pt-2">
                    + {examples.length - 5} örnek daha var
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-slate-100 p-4 rounded-xl text-center text-slate-500 italic text-sm">
                Bu havuzda başka örnek cümle bulunamadı.
              </div>
            )}
          </div>

        </div>
        
        <div className="p-4 sm:p-6 bg-white border-t border-slate-100 flex gap-3 sticky bottom-0">
          <button 
            onClick={() => {
              onRemove();
              onClose();
            }}
            className="flex-1 py-3.5 bg-emerald-50 text-emerald-600 font-bold rounded-xl hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            ✅ Öğrendim (Sepetten Çıkar)
          </button>
        </div>

      </div>
    </div>
  );
}
