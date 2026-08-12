'use client';

import React, { useState } from 'react';

export interface GrammarCardProps {
  card: Record<string, unknown>;
  isLearned?: boolean;
  onToggleLearned?: (bg: string) => void;
  defaultOpen?: boolean;
}

export function GrammarCard({ card, isLearned = false, onToggleLearned, defaultOpen = false }: GrammarCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [openTenses, setOpenTenses] = useState<Record<string, string>>({});

  const themes: Record<string, {color: string, badge: string, highlight: string, icon: string, tableHeader: string}> = {
    fiil: { color: "bg-purple-50/80 border-purple-200 text-purple-900", badge: "bg-purple-200 text-purple-800", highlight: "bg-purple-100 text-purple-900", icon: "🏃‍♂️", tableHeader: "bg-purple-100/80" },
    isim: { color: "bg-teal-50/80 border-teal-200 text-teal-900", badge: "bg-teal-200 text-teal-800", highlight: "bg-teal-100 text-teal-900", icon: "🏷️", tableHeader: "bg-teal-100/80" },
    'sıfat': { color: "bg-amber-50/80 border-amber-200 text-amber-900", badge: "bg-amber-200 text-amber-800", highlight: "bg-amber-100 text-amber-900", icon: "✨", tableHeader: "bg-amber-100/80" },
    zamir: { color: "bg-blue-50/80 border-blue-200 text-blue-900", badge: "bg-blue-200 text-blue-800", highlight: "bg-blue-100 text-blue-900", icon: "👤", tableHeader: "bg-blue-100/80" },
    'parçacık': { color: "bg-rose-50/80 border-rose-200 text-rose-900", badge: "bg-rose-200 text-rose-800", highlight: "bg-rose-100 text-rose-900", icon: "⚙️", tableHeader: "bg-rose-100/80" },
    edat: { color: "bg-cyan-50/80 border-cyan-200 text-cyan-900", badge: "bg-cyan-200 text-cyan-800", highlight: "bg-cyan-100 text-cyan-900", icon: "🔗", tableHeader: "bg-cyan-100/80" },
    'bağlaç': { color: "bg-sky-50/80 border-sky-200 text-sky-900", badge: "bg-sky-200 text-sky-800", highlight: "bg-sky-100 text-sky-900", icon: "🔀", tableHeader: "bg-sky-100/80" },
    zarf: { color: "bg-lime-50/80 border-lime-200 text-lime-900", badge: "bg-lime-200 text-lime-800", highlight: "bg-lime-100 text-lime-900", icon: "⏱️", tableHeader: "bg-lime-100/80" },
    'ünlem': { color: "bg-orange-50/80 border-orange-200 text-orange-900", badge: "bg-orange-200 text-orange-800", highlight: "bg-orange-100 text-orange-900", icon: "💬", tableHeader: "bg-orange-100/80" },
  };
  
  const t = themes[card.type] || { color: "bg-slate-50 border-slate-200 text-slate-800", badge: "bg-slate-200 text-slate-700", highlight: "bg-slate-100 text-slate-800", icon: "📌", tableHeader: "bg-slate-100" };

  const hasContent = (card.matchedForm && card.matchedForm !== card.bg) || 
                     card.notes || 
                     (card.type === 'isim' && card.gender) || 
                     card.nounForms || 
                     card.pronounForms || 
                     card.conjugation || 
                     card.forms || 
                     (card.examples && card.examples.length > 0);

  const toggleCard = () => {
    if (hasContent) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className={`rounded-2xl border shadow-sm transition-all overflow-hidden ${t.color} ${isLearned ? 'opacity-50 grayscale hover:opacity-75' : ''}`}>
      
      {/* Header */}
      <div className="w-full p-4 flex items-center gap-2 flex-wrap transition-colors">
        <div 
          onClick={toggleCard}
          className={`flex-1 flex items-center gap-2 flex-wrap ${hasContent ? 'cursor-pointer' : 'cursor-default'}`}
        >
          <span className="text-lg">{t.icon}</span>
          <span className={`font-black text-xl ${isLearned ? 'line-through decoration-2' : ''}`}>{card.bg}</span>
          <span className="opacity-75 text-sm font-medium">({card.tr})</span>
          {card.pronunciation && <span className="opacity-50 text-xs italic">[{card.pronunciation}]</span>}
        </div>
        
        <div className="ml-auto flex items-center gap-1 z-10">
          <span className={`px-2.5 py-1 text-[10px] font-black rounded-lg uppercase tracking-wider mr-1 ${t.badge}`}>
            {card.type}
          </span>
          {onToggleLearned && (
            <button 
              onClick={(e) => { e.stopPropagation(); onToggleLearned(card.bg); }}
              className={`w-7 h-7 flex items-center justify-center rounded-full transition-all ${isLearned ? 'bg-green-500 text-white shadow-inner' : 'hover:bg-black/10 text-slate-400 border border-slate-300'}`}
              title={isLearned ? "Öğrenildi olarak işaretlendi (Geri al)" : "Öğrenildi olarak işaretle"}
            >
              {isLearned ? '✓' : '✔'}
            </button>
          )}
          {hasContent && (
            <button 
              onClick={toggleCard}
              className={`w-7 h-7 flex items-center justify-center transform transition-transform opacity-60 hover:bg-black/10 hover:opacity-100 rounded-full ${isOpen ? 'rotate-180' : ''}`}
            >
              ▼
            </button>
          )}
        </div>
      </div>

      {/* Collapsible Content */}
      {isOpen && (
        <div className="px-4 pb-4 pt-1 border-t border-black/5">

      {/* Context Match Highlight */}
      {card.matchedForm && card.matchedForm !== card.bg && (
        <div className={`mb-3 px-3 py-2 rounded-xl text-sm font-medium border border-white/40 flex items-center gap-2 flex-wrap ${t.highlight}`}>
          <span>💡 Bu cümlede:</span>
          <span className="font-bold underline decoration-2 underline-offset-2">{card.matchedForm}</span>
          <span className="opacity-75 text-xs">({card.matchedReason})</span>
        </div>
      )}
      
      {/* Notes */}
      {card.notes && (
        <p className="text-sm font-medium opacity-80 mb-3 px-1 leading-relaxed">{card.notes}</p>
      )}

      {/* Gender for Nouns */}
      {card.type === 'isim' && card.gender && (
        <div className="mb-2 text-sm font-bold opacity-80 px-1 flex items-center gap-2">
          <span>Cinsiyet:</span>
          <span className={`capitalize px-2 py-0.5 rounded-md text-xs font-black ${card.gender === 'eril' ? 'bg-blue-200 text-blue-800' : card.gender === 'dişil' ? 'bg-pink-200 text-pink-800' : 'bg-gray-200 text-gray-700'}`}>{card.gender}</span>
        </div>
      )}

      {/* Noun Forms Table */}
      {card.nounForms && (
        <div className="mt-2 bg-white/60 rounded-xl overflow-hidden shadow-sm backdrop-blur-sm">
          <div className={`px-3 py-2 text-xs font-black uppercase tracking-widest border-b border-black/5 ${t.tableHeader}`}>
            İsim Formları
          </div>
          <div className="grid grid-cols-2 text-sm">
            {Object.entries(card.nounForms as Record<string, string>).map(([formName, form], i) => {
              const isMatched = form === card.matchedForm;
              const labels: Record<string, string> = { tekil: 'Tekil', tekil_belirli: 'Tekil (Belirli)', 'çoğul': 'Çoğul', 'çoğul_belirli': 'Çoğul (Belirli)' };
              return (
                <div key={formName} className={`flex justify-between items-center px-3 py-2.5 ${i % 2 === 0 ? 'border-r border-black/5' : ''} ${i < 2 ? 'border-b border-black/5' : ''} ${isMatched ? 'bg-black/5' : ''}`}>
                  <span className="opacity-60 text-xs font-bold">{labels[formName] || formName}</span>
                  <span className={`font-black ${isMatched ? '' : 'opacity-80'}`}>{form}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pronoun Forms Table */}
      {card.pronounForms && (
        <div className="mt-2 space-y-3">
          <div className="bg-white/60 rounded-xl overflow-hidden shadow-sm backdrop-blur-sm">
            <div className={`px-3 py-2 text-xs font-black uppercase tracking-widest border-b border-black/5 ${t.tableHeader}`}>
              {card.bg as string} İçin Zamir Formları
            </div>
            <div className="grid grid-cols-2 text-sm">
              {Object.entries(card.pronounForms as Record<string, string>).map(([caseName, form], i) => {
                const isMatched = form === card.matchedForm;
                return (
                  <div key={caseName} className={`flex justify-between items-center px-3 py-2.5 ${i % 2 === 0 ? 'border-r border-black/5' : ''} ${i < Object.entries(card.pronounForms as Record<string, string>).length - 2 ? 'border-b border-black/5' : ''} ${isMatched ? 'bg-black/5' : ''}`}>
                    <span className="opacity-60 text-xs font-bold capitalize">{caseName}</span>
                    <span className={`font-black ${isMatched ? '' : 'opacity-80'}`}>{form}</span>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Secondary Case Matrix (All Persons for the matched case) */}
          {(() => {
            if (!card.matchedReason) return null;
            const matchedCaseBase = (card.matchedReason as string).split('(')[0].trim().toLowerCase();
            
            const fullPronounMatrix: Record<string, {p: string, f: string}[]> = {
              "yalın": [
                { p: "Ben", f: "аз" }, { p: "Sen", f: "ти" }, { p: "O (Eril/Nötr)", f: "той / то" }, { p: "O (Dişil)", f: "тя" },
                { p: "Biz", f: "ние" }, { p: "Siz", f: "вие" }, { p: "Onlar", f: "те" }
              ],
              "belirtme kısa": [
                { p: "Beni", f: "ме" }, { p: "Seni", f: "те" }, { p: "Onu (Eril/Nötr)", f: "го" }, { p: "Onu (Dişil)", f: "я" },
                { p: "Bizi", f: "ни" }, { p: "Sizi", f: "ви" }, { p: "Onları", f: "ги" }
              ],
              "belirtme uzun": [
                { p: "Beni", f: "мене" }, { p: "Seni", f: "тебе" }, { p: "Onu (Eril/Nötr)", f: "него" }, { p: "Onu (Dişil)", f: "нея" },
                { p: "Bizi", f: "нас" }, { p: "Sizi", f: "вас" }, { p: "Onları", f: "тях" }
              ],
              "yönelme kısa": [
                { p: "Bana", f: "ми" }, { p: "Sana", f: "ти" }, { p: "Ona (Eril/Nötr)", f: "му" }, { p: "Ona (Dişil)", f: "ѝ" },
                { p: "Bize", f: "ни" }, { p: "Size", f: "ви" }, { p: "Onlara", f: "им" }
              ],
              "yönelme uzun": [
                { p: "Bana", f: "на мене" }, { p: "Sana", f: "на тебе" }, { p: "Ona (Eril/Nötr)", f: "на него" }, { p: "Ona (Dişil)", f: "на нея" },
                { p: "Bize", f: "на нас" }, { p: "Size", f: "на вас" }, { p: "Onlara", f: "на тях" }
              ]
            };

            const caseTable = fullPronounMatrix[matchedCaseBase];
            if (!caseTable) return null;

            return (
              <div className="bg-white/60 rounded-xl overflow-hidden shadow-sm backdrop-blur-sm border-t-2 border-indigo-300/30 mt-2">
                <div className={`px-3 py-2 text-xs font-black uppercase tracking-widest border-b border-black/5 ${t.tableHeader}`}>
                  Tüm Şahıslarda: <span className="text-indigo-600 ml-1">{matchedCaseBase}</span>
                </div>
                <div className="grid grid-cols-2 text-sm">
                  {caseTable.map((item, i) => {
                    // Extract actual matched word (which might be in 'той / то')
                    const isMatched = item.f.split('/').map(s => s.trim()).includes(card.matchedForm as string);
                    return (
                      <div key={item.p} className={`flex justify-between items-center px-3 py-2.5 ${i % 2 === 0 ? 'border-r border-black/5' : ''} ${i < caseTable.length - (caseTable.length % 2 === 0 ? 2 : 1) ? 'border-b border-black/5' : ''} ${isMatched ? 'bg-indigo-50 ring-1 ring-inset ring-indigo-200' : ''}`}>
                        <span className="opacity-60 text-xs font-bold">{item.p}</span>
                        <span className={`font-black ${isMatched ? 'text-indigo-700' : 'opacity-80'}`}>{item.f}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Verb Conjugation — Tab Tense Tables */}
      {card.conjugation && (() => {
        const tenses = Object.entries(card.conjugation as Record<string, unknown>);
        const tenseLabels: Record<string, string> = { present: 'Şimdiki Z.', past: 'Geçmiş Z.', future: 'Gelecek Z.', imperative: 'Emir Kipi' };
        const tenseColors: Record<string, string> = { present: 'bg-purple-200/80 text-purple-800', past: 'bg-indigo-200/80 text-indigo-800', future: 'bg-fuchsia-200/80 text-fuchsia-800', imperative: 'bg-amber-200/80 text-amber-800' };
        const tenseActiveColors: Record<string, string> = { present: 'bg-purple-500 text-white shadow-md', past: 'bg-indigo-500 text-white shadow-md', future: 'bg-fuchsia-500 text-white shadow-md', imperative: 'bg-amber-500 text-white shadow-md' };
        
        // Find which tense has the matched form — that's the default tab
        let defaultTense = 'present';
        for (const [tense, forms] of tenses) {
          if (Object.values(forms as Record<string, string>).some(f => f === card.matchedForm)) {
            defaultTense = tense;
            break;
          }
        }
        
        const tabKey = `tab-conjugation`;
        const activeTense = openTenses[tabKey] || defaultTense;
        const activeFormsEntry = tenses.find(([t]) => t === activeTense);
        const activeForms = activeFormsEntry ? activeFormsEntry[1] as Record<string, string> : {};

        return (
          <div className="mt-3">
            {/* Tab Buttons */}
            <div className="flex gap-1.5 mb-0">
              {tenses.map(([tense]) => {
                const isActive = tense === activeTense;
                const hasMatch = Object.values(card.conjugation?.[tense as keyof typeof card.conjugation] as Record<string, string> || {}).some(f => f === card.matchedForm);
                return (
                  <button
                    key={tense}
                    onClick={() => setOpenTenses(prev => ({ ...prev, [tabKey]: tense }))}
                    className={`flex-1 px-2 py-2 text-[11px] font-black uppercase tracking-wider rounded-t-xl transition-all duration-200 cursor-pointer relative ${isActive ? tenseActiveColors[tense] || 'bg-purple-500 text-white' : tenseColors[tense] || 'bg-purple-100 text-purple-700'} ${isActive ? 'scale-[1.02] z-10' : 'hover:brightness-95'}`}
                  >
                    {tenseLabels[tense] || tense}
                    {hasMatch && !isActive && <span className="ml-1 inline-block w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>}
                  </button>
                );
              })}
            </div>
            {/* Active Tense Table */}
            <div className="bg-white/60 rounded-b-xl rounded-tr-none overflow-hidden shadow-sm backdrop-blur-sm border-t-2 border-purple-300/30">
              <div className="grid grid-cols-2 text-sm">
                {Object.entries(activeForms as Record<string, string>).map(([person, form], i) => {
                  const isMatched = form === card.matchedForm;
                  return (
                    <div key={person} className={`flex justify-between items-center px-3 py-2.5 ${i % 2 === 0 ? 'border-r border-black/5' : ''} ${i < 4 ? 'border-b border-black/5' : ''} ${isMatched ? 'bg-purple-50 ring-1 ring-inset ring-purple-200' : ''}`}>
                      <span className="opacity-60 text-xs font-bold">{person}</span>
                      <span className={`font-black ${isMatched ? 'text-purple-700' : 'opacity-80'}`}>{form}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Adjective Forms */}
      {card.forms && (
        <div className="mt-3 bg-white/60 rounded-xl overflow-hidden shadow-sm backdrop-blur-sm">
          <div className={`px-3 py-2 text-xs font-black uppercase tracking-widest border-b border-black/5 ${t.tableHeader}`}>
            Cinsiyet Formları
          </div>
          <div className="grid grid-cols-2 text-sm">
            {Object.entries(card.forms as Record<string, string>).map(([gender, form], i) => {
              const isMatched = form === card.matchedForm;
              return (
                <div key={gender} className={`flex justify-between items-center px-3 py-2 ${i % 2 === 0 ? 'border-r border-black/5' : ''} ${i < 2 ? 'border-b border-black/5' : ''} ${isMatched ? 'bg-black/5' : ''}`}>
                  <span className="opacity-60 text-xs font-bold capitalize">{gender}</span>
                  <span className={`font-black ${isMatched ? '' : 'opacity-80'}`}>{form}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Examples */}
      {card.examples && (card.examples as unknown[]).length > 0 && (
        <div className="mt-3 space-y-1.5">
          <div className="text-[10px] font-black uppercase tracking-widest opacity-50 px-1">Örnekler</div>
          {Array.isArray(card.examples) && card.examples.map((ex: {bg?: string, tr?: string}, ei: number) => (
            <div key={ei} className="bg-white/40 rounded-lg px-3 py-2 text-sm border border-white/30">
              <div className="font-bold opacity-90">{ex.bg}</div>
              <div className="text-xs opacity-60 italic mt-0.5">{ex.tr}</div>
            </div>
          ))}
        </div>
      )}
        </div>
      )}
    </div>
  );
}
