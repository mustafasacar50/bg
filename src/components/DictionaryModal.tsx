'use client';
import React, { useEffect, useState } from 'react';
import { GrammarCard } from './GrammarCard';

interface DictionaryModalProps {
  word: string;
  customMeaning?: string;
  examples: { bg: string, tr: string }[];
  onClose: () => void;
  onRemove: () => void;
}

export function DictionaryModal({ word, customMeaning, examples, onClose, onRemove }: DictionaryModalProps) {
  const [dict, setDict] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [richCard, setRichCard] = useState<any>(null);

  useEffect(() => {
    // First, try the rich vocabulary lookup
    fetch(`/api/dictionary-lookup?word=${encodeURIComponent(word)}`)
      .then(r => r.json())
      .then(data => {
        if (data.found && data.card) {
          // Found in rich vocabulary!
          setRichCard(data.card);
          setLoading(false);
        } else {
          // Fallback to simple dictionary
          return fetch('/dictionary.json')
            .then(r => r.json())
            .then(dictData => {
              setDict(dictData);
              setLoading(false);
            });
        }
      })
      .catch((err) => {
        console.error('Failed to load dictionary:', err);
        setLoading(false);
      });
  }, [word]);

  // Try to find the exact match first, then fallback to partial matches (for flat dictionary)
  let meaning = '';
  if (!loading && !richCard) {
    const lowerWord = word.toLowerCase();
    meaning = dict[lowerWord] || dict[word];
    if (!meaning) {
       const partialMatch = Object.entries(dict).find(([k]) => k.toLowerCase().includes(lowerWord));
       if (partialMatch) {
         meaning = partialMatch[1] + ` (Eşleşme: ${partialMatch[0]})`;
       }
    }
  }

  return (
    <div className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className="w-full sm:w-[500px] sm:max-h-[85vh] bg-slate-50 sm:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-4 duration-300 relative"
        onClick={e => e.stopPropagation()}
        style={{ maxHeight: '90vh' }}
      >
        <div className="p-4 sm:p-6 bg-white border-b border-slate-100 flex items-center justify-between z-10 shadow-sm rounded-t-3xl">
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
          {loading ? (
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
               <div className="animate-pulse flex flex-col gap-3">
                 <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                 <div className="h-8 bg-slate-200 rounded w-3/4"></div>
                 <div className="h-24 bg-slate-200 rounded w-full mt-4"></div>
               </div>
            </div>
          ) : richCard ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-2 relative">
               <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2 bg-indigo-500 text-white text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full shadow z-10">Zengin Veritabanı</div>
               <GrammarCard card={richCard} defaultOpen={true} />
            </div>
          ) : (
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Sözlük Anlamı</h3>
              {customMeaning ? (
                <p className="text-lg font-bold text-emerald-600">{customMeaning} <span className="text-xs text-emerald-500 font-normal ml-2">(Kişisel Havuz)</span></p>
              ) : meaning ? (
                <p className="text-lg font-bold text-indigo-700">{meaning}</p>
              ) : (
                <p className="text-slate-500 italic">Sözlükte tam karşılığı bulunamadı.</p>
              )}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Örnek Cümleler ({examples.length})</h3>
            {examples.length > 0 ? (
              <div className="flex flex-col gap-2">
                {examples.slice(0, 5).map((ex, idx) => {
                  const regex = new RegExp(`(?<=^|[^А-Яа-яA-Za-z0-9_])(${word.replace(/[-[\]{}()*+?.,\\\\^$|#\\s]/g, '\\\\$&')})(?=$|[^А-Яа-яA-Za-z0-9_])`, 'gi');
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
              </div>
            ) : (
              <div className="bg-slate-100 p-4 rounded-xl text-center text-slate-500 italic text-sm">
                Bu havuzda başka örnek cümle bulunamadı.
              </div>
            )}
          </div>

        </div>
        
        <div className="p-4 sm:p-6 bg-white border-t border-slate-100 flex justify-end sticky bottom-0 z-10 rounded-b-3xl shadow-[0_-10px_20px_-15px_rgba(0,0,0,0.1)]">
          <button 
            onClick={() => {
              onRemove();
              onClose();
            }}
            title="Öğrendim (Sepetten Çıkar)"
            className="w-12 h-12 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 flex items-center justify-center transition-colors"
          >
            🗑️
          </button>
        </div>

      </div>
    </div>
  );
}

