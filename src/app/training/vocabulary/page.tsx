'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Question {
  id: string;
  sentence: string;
  answer: string;
}

export default function VocabularyPage() {
  const [student, setStudent] = useState<any>(null);
  const [unknownWords, setUnknownWords] = useState<string[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingWord, setEditingWord] = useState<{old: string, new: string} | null>(null);
  const [expandedWords, setExpandedWords] = useState<Record<string, boolean>>({});
  const router = useRouter();

  const toggleExpand = (word: string) => {
    setExpandedWords(prev => ({ ...prev, [word]: !prev[word] }));
  };

  useEffect(() => {
    const session = localStorage.getItem('student_session');
    if (!session) {
      router.push('/');
      return;
    }
    const parsedStudent = JSON.parse(session);
    setStudent(parsedStudent);

    const fetchData = async () => {
      try {
        const [progRes, modRes] = await Promise.all([
          fetch(`/api/training-progress?studentId=${parsedStudent.id}`),
          fetch(`/api/modules/vocab?studentId=${parsedStudent.id}`)
        ]);
        
        const progData = await progRes.json();
        const modData = await modRes.json();
        
        setUnknownWords(progData.progress?.unknownWords || []);
        setQuestions(modData.questions || []);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);

  const updateWords = async (newWords: string[]) => {
    setUnknownWords(newWords);
    try {
      await fetch('/api/training-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: student.id,
          unknownWords: newWords
        })
      });
    } catch(e) {
      console.error(e);
    }
  };

  const handleRemoveWord = (word: string) => {
    updateWords(unknownWords.filter(w => w !== word));
  };

  const handleEditSave = () => {
    if (!editingWord || !editingWord.new.trim()) return;
    const newWords = unknownWords.map(w => w === editingWord.old ? editingWord.new.trim().toLowerCase() : w);
    updateWords(newWords);
    setEditingWord(null);
  };

  if (!student) return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500">Yükleniyor...</div>;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8 gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Link href="/training" className="text-slate-400 hover:text-indigo-600 transition-colors text-2xl">
              ←
            </Link>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">📚 Kelime Sepetim</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/training/vocab" className="bg-indigo-600 text-white px-5 py-2 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-sm whitespace-nowrap">
              Kelimelerle Antrenman Yap ➔
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500">Kelimeler yükleniyor...</div>
        ) : unknownWords.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
            <div className="text-4xl mb-4">📭</div>
            <h3 className="text-lg font-bold text-slate-700 mb-2">Kelime Sepetiniz Boş</h3>
            <p className="text-slate-500">Antrenman yaparken bilmediğiniz bir kelimeyi seçip "Listeme Ekle" butonuna basarak buraya ekleyebilirsiniz.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {unknownWords.map((word, idx) => {
              // Find matching questions for this specific word
              const examples = questions.filter(q => (q.sentence + ' ' + q.answer).toLowerCase().includes(word));
              const isEditing = editingWord?.old === word;
              const isExpanded = !!expandedWords[word];

              return (
                <div key={idx} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div 
                    className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50 flex flex-wrap justify-between items-center gap-4 cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={(e) => {
                      if (!isEditing) toggleExpand(word);
                    }}
                  >
                    
                    {isEditing ? (
                      <div className="flex items-center gap-2 w-full sm:w-auto flex-1" onClick={e => e.stopPropagation()}>
                        <input 
                          type="text" 
                          value={editingWord.new} 
                          onChange={e => setEditingWord({ ...editingWord, new: e.target.value })}
                          className="px-3 py-2 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-1 font-bold text-lg"
                          autoFocus
                        />
                        <button onClick={handleEditSave} className="bg-emerald-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-emerald-600">Kaydet</button>
                        <button onClick={() => setEditingWord(null)} className="bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-bold hover:bg-slate-300">İptal</button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <span className="text-xl sm:text-2xl font-black text-indigo-700">"{word}"</span>
                        <span className="text-xs font-bold bg-indigo-100 text-indigo-600 px-2 py-1 rounded-md">{examples.length} Örnek</span>
                        <span className="text-slate-400 text-sm ml-2">{isExpanded ? '▲' : '▼'}</span>
                      </div>
                    )}

                    {!isEditing && (
                      <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                        {student.role === 'admin' && (
                          <button onClick={() => setEditingWord({ old: word, new: word })} className="px-3 py-1.5 bg-amber-50 text-amber-600 font-bold rounded-lg hover:bg-amber-100 text-sm">
                            ✏️ Düzenle
                          </button>
                        )}
                        <button onClick={() => handleRemoveWord(word)} className="px-3 py-1.5 bg-emerald-50 text-emerald-600 font-bold rounded-lg hover:bg-emerald-100 text-sm transition-colors">
                          ✓ Öğrendim (Sil)
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {isExpanded && examples.length > 0 && (
                    <div className="p-4 sm:p-5 divide-y divide-slate-100 animate-in slide-in-from-top-2 duration-200">
                      <p className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">İçinde Geçtiği Cümleler</p>
                      {examples.map((ex, i) => {
                        const bgText = ex.sentence.includes('Türkçesi:') ? ex.answer : ex.sentence;
                        const trText = ex.sentence.includes('Türkçesi:') ? ex.sentence : ex.answer;
                        
                        const regex = new RegExp(`(${word})`, 'gi');
                        const highlightedBg = bgText.split(regex).map((part, index) => 
                          part.toLowerCase() === word.toLowerCase() ? <span key={index} className="bg-yellow-200 text-yellow-900 px-1 rounded font-bold">{part}</span> : part
                        );

                        return (
                          <div key={i} className="py-3 flex flex-col gap-1">
                            <div className="text-slate-800 font-medium text-lg leading-relaxed">{highlightedBg}</div>
                            <div className="mt-1 text-slate-500 text-sm">
                              {trText}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
