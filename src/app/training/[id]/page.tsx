'use client';

import { useState, useEffect, useRef, Suspense, use, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface Question {
  id: string;
  type: string;
  sentence: string;
  answer: string;
  hint: string;
}

interface ModuleData {
  title: string;
  questions: Question[];
}

type LayoutType = 'bg' | 'tr';
const layouts = {
  bg: ['А','Б','В','Г','Д','Е','Ж','З','И','Й','К','Л','М','Н','О','П','Р','С','Т','У','Ф','Х','Ц','Ч','Ш','Щ','Ъ','Ь','Ю','Я'],
  tr: ['A','B','C','Ç','D','E','F','G','Ğ','H','I','İ','J','K','L','M','N','O','Ö','P','R','S','Ş','T','U','Ü','V','Y','Z']
};

function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix = Array(a.length + 1).fill(null).map(() => Array(b.length + 1).fill(null));

  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j] + 1, // deletion
        matrix[i - 1][j - 1] + indicator // substitution
      );
    }
  }
  return matrix[a.length][b.length];
}

function TrainingContent({ moduleId }: { moduleId: string }) {
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') || 'all'; 

  const [student, setStudent] = useState<any>(null);
  const [data, setData] = useState<ModuleData | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Session State
  const [sessionQuestions, setSessionQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<'none' | 'correct' | 'typo' | 'wrong'>('none');
  const [score, setScore] = useState(0);
  
  // New State
  const [mistakesPool, setMistakesPool] = useState<string[]>([]);
  const [isSwapped, setIsSwapped] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [langFilter, setLangFilter] = useState<'all' | 'bg' | 'tr'>('all');
  const [activeQuestion, setActiveQuestion] = useState<any>(null);
  
  // Keyboard State
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [layout, setLayout] = useState<LayoutType>('bg');
  const [isCaps, setIsCaps] = useState(false);
  const [preferNativeKeyboard, setPreferNativeKeyboard] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // 1. Initialize Student & Score
  useEffect(() => {
    try {
      const storedStudent = JSON.parse(localStorage.getItem('student_session') || 'null');
      if (!storedStudent) {
        router.push('/');
        return;
      }
      setStudent(storedStudent);
      if (storedStudent.trainingScore) {
        setScore(storedStudent.trainingScore);
      }
    } catch(e) {
      router.push('/');
    }
  }, [router]);

  // 2. Fetch Module & Set Questions
  useEffect(() => {
    if (!student?.id) return;

    const fetchAll = async () => {
      try {
        const [modRes, progRes] = await Promise.all([
          fetch(`/api/modules/${moduleId}`),
          fetch(`/api/training-progress?studentId=${student.id}`)
        ]);

        const modData = await modRes.json();
        const progData = await progRes.json();
        
        setData(modData);

        const progress = progData.progress || {};
        const modProgress = progress[moduleId] || { mistakes: [], allProgress: 0, mistakesProgress: 0, score: 0 };
        
        const mistakes = modProgress.mistakes || [];
        setMistakesPool(mistakes);

        let activePool: Question[] = [];
        if (mode === 'mistakes') {
          activePool = modData.questions.filter((q: Question) => mistakes.includes(q.id));
        } else {
          activePool = modData.questions;
        }
        
        setSessionQuestions(activePool);

        const savedIndex = mode === 'mistakes' ? modProgress.mistakesProgress : modProgress.allProgress;
        if (savedIndex >= 0 && savedIndex < activePool.length) {
          setCurrentIndex(savedIndex);
        }
        
        if (modProgress.score) {
           setScore(modProgress.score);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching module:', err);
        setLoading(false);
      }
    };

    fetchAll();
  }, [moduleId, mode, student?.id]);

  // Derived Filtered Questions
  const filteredQuestions = useMemo(() => {
    let base = sessionQuestions;

    if (langFilter === 'bg') {
      base = base.filter(q => q.hint.toLowerCase().includes('bulgarca'));
    } else if (langFilter === 'tr') {
      base = base.filter(q => q.hint.toLowerCase().includes('türkçe'));
    }

    if (!searchQuery.trim()) return base;
    const terms = searchQuery.toLowerCase().split(' ').filter(t => t);
    return base.filter(q => {
      const text = `${q.sentence} ${q.answer}`.toLowerCase();
      return terms.every(term => text.includes(term));
    });
  }, [sessionQuestions, searchQuery, langFilter]);

  // Set Active Question and Generate Fill-In-The-Blank (if applicable)
  useEffect(() => {
    const q = filteredQuestions[currentIndex];
    if (!q) {
      setActiveQuestion(null);
      return;
    }
    
    let display = q.sentence.replace('_____', '...');
    let expected = q.answer;
    let hint = q.hint;
    
    if (isSwapped) {
      const match = q.sentence.match(/:\s*(.*?)\)/);
      if (match) {
        display = `... (${q.sentence.includes('Türkçesi:') ? 'Bulgarcası' : 'Türkçesi'}: ${q.answer})`;
        expected = match[1].trim();
        hint = q.sentence.includes('Türkçesi:') ? 'Bulgarca karşılığını yazınız' : 'Türkçe karşılığını yazınız';
      }
    }

    let fitbTarget = null;
    const words = expected.split(' ').filter(w => w.trim());
    
    if (words.length > 1) {
       const targetIdx = Math.floor(Math.random() * words.length);
       const targetWordRaw = words[targetIdx];
       
       const punctuationMatch = targetWordRaw.match(/[.,!?]+$/);
       const punctuation = punctuationMatch ? punctuationMatch[0] : '';
       fitbTarget = targetWordRaw.replace(/[.,!?]+$/, '');
       
       const maskedWords = [...words];
       maskedWords[targetIdx] = `_____${punctuation}`;
       
       // Show masked version below the source sentence
       display = `${display}\n(Boşluk Doldurma: ${maskedWords.join(' ')})`;
    }
    
    setActiveQuestion({ id: q.id, display, expected, fitbTarget, hint });
    setLayout(hint.toLowerCase().includes('bulgarca') ? 'bg' : 'tr');
    setFeedback('none');
    setUserAnswer('');
  }, [currentIndex, isSwapped, filteredQuestions]);


  const syncProgress = (updates: any) => {
    if (!student) return;
    
    fetch('/api/training-progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId: student.id,
        moduleId,
        ...updates
      })
    }).catch(e => console.error('Failed to sync training progress', e));
  };

  const syncScore = (pointsDelta: number) => {
    const newScore = score + pointsDelta;
    setScore(newScore);
    if (!student) return;

    const updatedStudent = { ...student, trainingScore: (student.trainingScore || 0) + pointsDelta };
    setStudent(updatedStudent);
    localStorage.setItem('student_session', JSON.stringify(updatedStudent));

    syncProgress({ score: newScore });

    fetch('/api/training-scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId: student.id, pointsDelta })
    }).catch(e => console.error('Failed to sync training score to scores.json', e));
  };

  const saveMistakes = (newPool: string[]) => {
    setMistakesPool(newPool);
    syncProgress({ mistakes: newPool });
  };

  const handleCheck = () => {
    if (!activeQuestion) return;
    
    const isFitb = !!activeQuestion.fitbTarget;
    const expectedStr = isFitb ? activeQuestion.fitbTarget : activeQuestion.expected;
    
    const normalizedUser = userAnswer.trim().toLocaleLowerCase('tr-TR');
    const normalizedAnswer = expectedStr.trim().toLocaleLowerCase('tr-TR');
    
    if (normalizedUser === normalizedAnswer) {
      setFeedback('correct');
      if (mistakesPool.includes(activeQuestion.id)) {
        saveMistakes(mistakesPool.filter(id => id !== activeQuestion.id));
        syncScore(1); 
      } else if (mode === 'all') {
        syncScore(1); 
      }
    } else {
      const dist = levenshteinDistance(normalizedUser, normalizedAnswer);
      const isTypo = dist === 1 || (normalizedAnswer.length > 4 && dist === 2);
      
      if (isTypo) {
        setFeedback('typo');
        if (mistakesPool.includes(activeQuestion.id)) {
           syncScore(0.9);
        } else if (mode === 'all') {
           syncScore(0.9);
        }
      } else {
        setFeedback('wrong');
        if (!mistakesPool.includes(activeQuestion.id)) {
          saveMistakes([...mistakesPool, activeQuestion.id]);
          syncScore(-0.2); 
        }
      }
    }
  };

  const handleSkip = () => {
    if (!activeQuestion) return;
    setFeedback('wrong');
    if (!mistakesPool.includes(activeQuestion.id)) {
      saveMistakes([...mistakesPool, activeQuestion.id]);
    }
  };

  const handleNext = () => {
    setUserAnswer('');
    setFeedback('none');
    setIsSwapped(false);
    
    let nextIdx = currentIndex;
    
    if (mode === 'mistakes' && feedback === 'correct') {
      const updatedQuestions = sessionQuestions.filter(q => q.id !== activeQuestion.id);
      setSessionQuestions(updatedQuestions);
      if (currentIndex >= updatedQuestions.length) {
         nextIdx = Math.max(0, updatedQuestions.length - 1);
      }
    } else {
      nextIdx = currentIndex + 1;
    }

    if (nextIdx < filteredQuestions.length || (mode === 'mistakes' && feedback === 'correct')) {
       setCurrentIndex(nextIdx);
       if (!searchQuery.trim()) {
           syncProgress({ [mode === 'mistakes' ? 'mistakesProgress' : 'allProgress']: nextIdx });
       }
    } else {
       setCurrentIndex(filteredQuestions.length);
       if (!searchQuery.trim()) {
           syncProgress({ [mode === 'mistakes' ? 'mistakesProgress' : 'allProgress']: filteredQuestions.length });
       }
    }
  };

  const handleSwap = () => {
    const newSwapped = !isSwapped;
    setIsSwapped(newSwapped);
    
    const q = filteredQuestions[currentIndex];
    if (newSwapped) {
      setLayout(q?.sentence.includes('Türkçesi:') ? 'bg' : 'tr');
    } else {
      setLayout(q?.sentence.includes('Türkçesi:') ? 'tr' : 'bg');
    }
  };

  // Keyboard Functions
  const insertText = (text: string) => {
    if (!inputRef.current) return;
    const input = inputRef.current;
    const start = input.selectionStart ?? 0;
    const end = input.selectionEnd ?? 0;
    const current = userAnswer;
    const nextValue = current.slice(0, start) + text + current.slice(end);
    setUserAnswer(nextValue);
    
    setTimeout(() => {
      input.focus();
      input.setSelectionRange(start + text.length, start + text.length);
    }, 0);
  };

  const backspace = () => {
    if (!inputRef.current) return;
    const input = inputRef.current;
    const start = input.selectionStart ?? 0;
    const end = input.selectionEnd ?? 0;
    if (start === end && start > 0) {
      const current = userAnswer;
      const nextValue = current.slice(0, start - 1) + current.slice(end);
      setUserAnswer(nextValue);
      setTimeout(() => {
        input.focus();
        input.setSelectionRange(start - 1, start - 1);
      }, 0);
    } else if (start !== end) {
      const current = userAnswer;
      const nextValue = current.slice(0, start) + current.slice(end);
      setUserAnswer(nextValue);
      setTimeout(() => {
        input.focus();
        input.setSelectionRange(start, start);
      }, 0);
    }
  };

  const isFinished = sessionQuestions.length === 0 || (currentIndex >= filteredQuestions.length && mode === 'all') || (currentIndex >= filteredQuestions.length && mode === 'mistakes' && feedback !== 'correct' && feedback !== 'typo');
  const isSearchEmpty = sessionQuestions.length > 0 && filteredQuestions.length === 0 && searchQuery.trim() !== '';

  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-500">Yükleniyor...</div>;
  if (!data) return <div className="min-h-screen flex items-center justify-center text-red-500">Modül bulunamadı.</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-4 flex flex-col items-center justify-between sticky top-0 z-10 gap-4 sm:flex-row">
        
        <div className="flex w-full items-center gap-2 sm:w-auto flex-1 flex-col sm:flex-row">
          
          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto flex-1 sm:flex-none">
            <button onClick={() => router.push('/training')} className="text-slate-400 hover:text-slate-600 mr-2">
              ✕
            </button>
            
            {/* Search Input */}
            <div className="relative flex-1 sm:min-w-[150px] max-w-[200px]">
              <input 
                type="text" 
                placeholder="🔍 Kelime ara..." 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentIndex(0);
                }}
                className="w-full bg-slate-100 border-none rounded-full px-4 py-1.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            {/* Language Filter */}
            <div className="flex bg-slate-100 rounded-full p-1 border border-slate-200">
              <button
                onClick={() => { setLangFilter('all'); setCurrentIndex(0); }}
                className={`px-3 py-0.5 text-xs font-bold rounded-full transition-colors ${langFilter === 'all' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Tümü
              </button>
              <button
                onClick={() => { setLangFilter('bg'); setCurrentIndex(0); }}
                className={`px-3 py-0.5 text-xs font-bold rounded-full transition-colors ${langFilter === 'bg' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Bulgarca
              </button>
              <button
                onClick={() => { setLangFilter('tr'); setCurrentIndex(0); }}
                className={`px-3 py-0.5 text-xs font-bold rounded-full transition-colors ${langFilter === 'tr' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Türkçe
              </button>
            </div>
          </div>
          
          {/* Interactive Progress Slider */}
          {!isFinished && !isSearchEmpty && filteredQuestions.length > 0 && (
            <div className="flex-1 w-full mx-2 flex items-center gap-2 mt-2 sm:mt-0">
              <button 
                onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                disabled={currentIndex === 0}
                className="text-slate-400 font-black text-xl hover:text-indigo-600 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
                title="Önceki Soru"
              >
                ◀
              </button>
              
              <div className="flex-1 flex items-center gap-2">
                <input 
                  type="range" 
                  min="0" 
                  max={filteredQuestions.length - 1} 
                  value={currentIndex}
                  onChange={(e) => {
                    const newIdx = parseInt(e.target.value);
                    setCurrentIndex(newIdx);
                    if (!searchQuery.trim()) {
                      syncProgress({ [mode === 'mistakes' ? 'mistakesProgress' : 'allProgress']: newIdx });
                    }
                    setFeedback('none');
                    setUserAnswer('');
                    setIsSwapped(false);
                  }}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              <button 
                onClick={() => setCurrentIndex(Math.min(filteredQuestions.length - 1, currentIndex + 1))}
                disabled={currentIndex >= filteredQuestions.length - 1}
                className="text-slate-400 font-black text-xl hover:text-indigo-600 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
                title="Sonraki Soru"
              >
                ▶
              </button>
              
              <span className="text-xs font-bold text-slate-500 whitespace-nowrap min-w-[45px] text-right">
                {currentIndex + 1} / {filteredQuestions.length}
              </span>
              
              <button
                onClick={() => {
                  const shuffled = [...sessionQuestions].sort(() => 0.5 - Math.random());
                  setSessionQuestions(shuffled);
                  setCurrentIndex(0);
                  setSearchQuery('');
                }}
                className="ml-1 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-indigo-600 rounded-lg px-2 py-1.5 text-sm font-bold transition-colors"
                title="Soruları Karıştır"
              >
                🔀
              </button>
            </div>
          )}
        </div>

        <div className="text-sm font-bold text-indigo-600 px-4 py-1.5 bg-indigo-50 rounded-full shrink-0">
          Puan: {Number.isInteger(score) ? score : score.toFixed(1)}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 pb-48 flex flex-col">
        {isSearchEmpty ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center mt-12">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Eşleşme Bulunamadı</h2>
            <p className="text-slate-600 mb-8">"{searchQuery}" araması ile eşleşen bir soru mevcut havuzda yok.</p>
            <button onClick={() => setSearchQuery('')} className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors">Aramayı Temizle</button>
          </div>
        ) : isFinished ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center mt-12">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              {mode === 'mistakes' ? "Harika! Bilinmeyen soru kalmadı." : "Antrenman Tamamlandı!"}
            </h2>
            <p className="text-slate-600 mb-8">Havuzdaki tüm soruları tamamladınız.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {mode === 'mistakes' ? (
                 <button onClick={() => router.push(`/training/${moduleId}?mode=all`)} className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors">Tüm Havuza Geç</button>
              ) : (
                 <button onClick={() => { syncProgress({ allProgress: 0 }); window.location.reload(); }} className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors">Baştan Başla</button>
              )}
              <Link href="/training" className="px-6 py-3 bg-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-300 transition-colors">Modül Seçimine Dön</Link>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col mt-4">
            <div className="flex justify-between items-center mb-2">
              <h1 className="text-2xl font-extrabold text-slate-800">
                {activeQuestion?.fitbTarget ? "Boşluğu doldurun" : "Çeviriyi yazın"}
              </h1>
              <button 
                onClick={handleSwap}
                className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg text-sm font-bold transition-colors"
                title="Soruyu ters çevir (Bulgarca <-> Türkçe)"
              >
                🔄 Yön Değiştir
              </button>
            </div>
            
            <p className="text-slate-500 mb-8 font-medium">{activeQuestion?.hint}</p>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8 flex items-start gap-4 whitespace-pre-wrap">
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-xl shrink-0 mt-1">🤖</div>
              <div className="text-lg font-medium text-slate-700 leading-relaxed">
                {activeQuestion?.display}
              </div>
            </div>

            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                inputMode={preferNativeKeyboard ? "text" : "none"}
                className={`w-full bg-white border-2 rounded-xl px-4 py-4 text-xl outline-none transition-colors ${feedback === 'wrong' ? 'border-red-400 bg-red-50 text-red-900' : feedback === 'typo' ? 'border-amber-400 bg-amber-50 text-amber-900' : feedback === 'correct' ? 'border-green-400 bg-green-50 text-green-900' : 'border-slate-200 focus:border-indigo-400'}`}
                placeholder="Cevabınızı buraya yazın..."
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onFocus={() => { if (!preferNativeKeyboard) setKeyboardOpen(true); }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    feedback === 'none' ? handleCheck() : handleNext();
                  }
                }}
                disabled={feedback !== 'none'}
              />
            </div>
          </div>
        )}
      </main>

      {/* Footer Area (Check Button & Feedback) */}
      {!isFinished && (
        <div className={`fixed bottom-0 left-0 right-0 z-50 transition-colors duration-300 ${feedback === 'correct' ? 'bg-green-100 border-t-2 border-green-200' : feedback === 'typo' ? 'bg-amber-100 border-t-2 border-amber-200' : feedback === 'wrong' ? 'bg-red-100 border-t-2 border-red-200' : 'bg-white border-t border-slate-200'}`}>
          <div className="max-w-3xl mx-auto px-4 py-4 sm:py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            
            <div className="flex-1 w-full flex items-center">
              {feedback === 'correct' && (
                <div className="text-green-700">
                  <div className="font-black text-xl mb-1 flex items-center gap-2"><span>✅</span> Harika!</div>
                </div>
              )}
              {feedback === 'typo' && (
                <div className="text-amber-800">
                  <div className="font-black text-xl mb-1 flex items-center gap-2"><span>⚠️</span> Harf hatası var! (+0.9 puan)</div>
                  <div className="font-medium text-sm">Doğrusu şöyle olmalıydı: <span className="font-bold">{activeQuestion?.fitbTarget ? activeQuestion.fitbTarget : activeQuestion?.expected}</span></div>
                </div>
              )}
              {feedback === 'wrong' && (
                <div className="text-red-700">
                  <div className="font-black text-xl mb-1 flex items-center gap-2"><span>❌</span> {userAnswer.trim() ? "Yanlış cevap" : "Pas geçtiniz"}</div>
                  <div className="font-medium text-sm">Doğru cevap: <span className="font-bold">{activeQuestion?.fitbTarget ? activeQuestion.fitbTarget : activeQuestion?.expected}</span></div>
                </div>
              )}
              {feedback === 'none' && (
                <div className="flex items-center gap-4">
                  <button 
                    className="hidden sm:block text-slate-400 font-bold hover:text-slate-600 px-4 py-2 rounded-lg"
                    onClick={() => setKeyboardOpen(!keyboardOpen)}
                    title="Klavyeyi Aç/Kapat"
                  >
                    ⌨️ Sanal Klavye
                  </button>
                  <button 
                    className="text-amber-500 font-bold hover:text-amber-600 hover:underline"
                    onClick={handleSkip}
                    title="Cevabı göster ve bu soruyu atla"
                  >
                    ⏭️ Pas
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={feedback === 'none' ? handleCheck : handleNext}
              disabled={feedback === 'none' && !userAnswer.trim()}
              className={`w-full sm:w-auto px-8 py-3 rounded-xl font-black text-lg transition-all ${feedback === 'none' ? (userAnswer.trim() ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md' : 'bg-slate-200 text-slate-400 cursor-not-allowed') : feedback === 'correct' ? 'bg-green-600 text-white hover:bg-green-700 shadow-md' : feedback === 'typo' ? 'bg-amber-600 text-white hover:bg-amber-700 shadow-md' : 'bg-red-600 text-white hover:bg-red-700 shadow-md'}`}
            >
              {feedback === 'none' ? 'KONTROL ET' : 'DEVAM ET'}
            </button>
          </div>

          {/* Virtual Keyboard */}
          <div 
            className={`bg-white border-t border-slate-200 p-2 sm:p-4 transition-all duration-300 ${keyboardOpen && !preferNativeKeyboard && feedback === 'none' ? 'h-auto opacity-100' : 'h-0 opacity-0 overflow-hidden py-0 border-transparent'}`}
            onPointerDown={(e) => e.preventDefault()}
          >
            <div className="max-w-3xl mx-auto pb-2">
              <div className="flex justify-between items-center mb-2 px-1">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-500 cursor-pointer">
                  <input type="checkbox" checked={preferNativeKeyboard} onChange={(e) => { setPreferNativeKeyboard(e.target.checked); if (e.target.checked) setKeyboardOpen(false); }} className="w-3 h-3" />
                  Sistem Klavyesi
                </label>
                <button type="button" className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full hover:bg-slate-200" onClick={() => setKeyboardOpen(false)}>Kapat</button>
              </div>
              <div className="flex flex-wrap justify-center gap-[4px]">
                {layouts[layout].map(letter => {
                  const displayLetter = isCaps ? letter : letter.toLowerCase();
                  return (
                    <button key={letter} type="button" className="flex items-center justify-center bg-slate-100 rounded hover:bg-slate-200 font-semibold text-base sm:text-lg shadow-sm" style={{ width: 'calc(10% - 4px)', height: '2.5rem', minWidth: '28px' }} onClick={() => insertText(displayLetter)}>
                      {displayLetter}
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-center items-center gap-1.5 mt-2 px-1">
                <button type="button" className={`flex items-center justify-center rounded-md font-bold px-3 h-10 shadow-sm ${isCaps ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'}`} onClick={() => setIsCaps(!isCaps)}>
                  aA
                </button>
                <button type="button" className="flex-1 max-w-[200px] flex items-center justify-center bg-slate-200 text-slate-700 rounded-md text-sm font-bold h-10 shadow-sm" onClick={() => insertText(' ')}>Boşluk</button>
                <button type="button" className="flex items-center justify-center bg-red-100 text-red-600 rounded-md px-3 h-10 font-bold shadow-sm" onClick={() => backspace()}>⌫</button>
                <div className="flex gap-1 ml-auto bg-slate-100 p-1 rounded-md shadow-inner">
                  <button type="button" className={`text-[10px] font-bold px-2 h-8 rounded ${layout === 'bg' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`} onClick={() => setLayout('bg')}>БГ</button>
                  <button type="button" className={`text-[10px] font-bold px-2 h-8 rounded ${layout === 'tr' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`} onClick={() => setLayout('tr')}>TR</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrainingSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-500">Yükleniyor...</div>}>
      <TrainingContent moduleId={id} />
    </Suspense>
  );
}
