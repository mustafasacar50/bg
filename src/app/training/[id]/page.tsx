'use client';

import { useState, useEffect, useRef, Suspense, use } from 'react';
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
  const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none');
  const [score, setScore] = useState(0);
  
  // New State
  const [mistakesPool, setMistakesPool] = useState<string[]>([]);
  const [isSwapped, setIsSwapped] = useState(false);
  
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
      setStudent(storedStudent);
      if (storedStudent && storedStudent.trainingScore) {
        setScore(storedStudent.trainingScore);
      }
    } catch(e) {}
  }, []);

  // 2. Fetch Module & Set Questions
  useEffect(() => {
    fetch(`/api/modules/${moduleId}`)
      .then(res => res.json())
      .then((modData: ModuleData) => {
        setData(modData);
        
        let mistakes: string[] = [];
        try {
          mistakes = JSON.parse(localStorage.getItem(`training_mistakes_${moduleId}`) || '[]');
        } catch(e) {}
        setMistakesPool(mistakes);

        let activeQuestions: Question[] = [];
        if (mode === 'mistakes') {
          activeQuestions = modData.questions.filter(q => mistakes.includes(q.id));
        } else {
          activeQuestions = modData.questions;
        }
        
        setSessionQuestions(activeQuestions);

        // Load progress
        try {
          const savedIndex = parseInt(localStorage.getItem(`training_${mode}_progress_${moduleId}`) || '0');
          if (savedIndex >= 0 && savedIndex < activeQuestions.length) {
            setCurrentIndex(savedIndex);
          }
        } catch(e) {}
        
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching module:', err);
        setLoading(false);
      });
  }, [moduleId, mode]);

  const currentQuestion = sessionQuestions[currentIndex];

  let displaySentence = currentQuestion?.sentence.replace('_____', '...');
  let expectedAnswer = currentQuestion?.answer || '';
  let hint = currentQuestion?.hint || '';

  if (isSwapped && currentQuestion) {
    const match = currentQuestion.sentence.match(/:\s*(.*?)\)/);
    if (match) {
      displaySentence = `... (${currentQuestion.sentence.includes('Türkçesi:') ? 'Bulgarcası' : 'Türkçesi'}: ${currentQuestion.answer})`;
      expectedAnswer = match[1].trim().toUpperCase();
      hint = currentQuestion.sentence.includes('Türkçesi:') ? 'Bulgarca karşılığını yazınız' : 'Türkçe karşılığını yazınız';
    }
  }

  const syncScore = (pointsDelta: number) => {
    setScore(s => s + pointsDelta);
    if (!student) return;

    const newScore = (student.trainingScore || 0) + pointsDelta;
    const updatedStudent = { ...student, trainingScore: newScore };
    setStudent(updatedStudent);
    localStorage.setItem('student_session', JSON.stringify(updatedStudent));

    fetch('/api/training-scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId: student.id, pointsDelta })
    }).catch(e => console.error('Failed to sync training score', e));
  };

  const saveMistakes = (newPool: string[]) => {
    setMistakesPool(newPool);
    localStorage.setItem(`training_mistakes_${moduleId}`, JSON.stringify(newPool));
  };

  const handleCheck = () => {
    if (!currentQuestion) return;
    
    const normalizedUser = userAnswer.trim().toLowerCase();
    const normalizedAnswer = expectedAnswer.trim().toLowerCase();
    
    if (normalizedUser === normalizedAnswer) {
      setFeedback('correct');
      if (mistakesPool.includes(currentQuestion.id)) {
        saveMistakes(mistakesPool.filter(id => id !== currentQuestion.id));
        syncScore(1); 
      } else if (mode === 'all') {
        syncScore(1); 
      }
    } else {
      setFeedback('wrong');
      if (!mistakesPool.includes(currentQuestion.id)) {
        saveMistakes([...mistakesPool, currentQuestion.id]);
        syncScore(-0.2); 
      }
    }
  };

  const handleSkip = () => {
    if (!currentQuestion) return;
    // Show answer as if wrong, but no point penalty
    setFeedback('wrong');
    if (!mistakesPool.includes(currentQuestion.id)) {
      saveMistakes([...mistakesPool, currentQuestion.id]);
      // 0 points for skipping, so we don't call syncScore() with any penalty
    }
  };

  const handleNext = () => {
    setUserAnswer('');
    setFeedback('none');
    setIsSwapped(false);
    
    let nextIdx = currentIndex;
    
    if (mode === 'mistakes' && feedback === 'correct') {
      const updatedQuestions = sessionQuestions.filter(q => q.id !== currentQuestion.id);
      setSessionQuestions(updatedQuestions);
      if (currentIndex >= updatedQuestions.length) {
         nextIdx = Math.max(0, updatedQuestions.length - 1);
      }
    } else {
      nextIdx = currentIndex + 1;
    }

    if (nextIdx < sessionQuestions.length || (mode === 'mistakes' && feedback === 'correct')) {
       setCurrentIndex(nextIdx);
       localStorage.setItem(`training_${mode}_progress_${moduleId}`, nextIdx.toString());
    } else {
       setCurrentIndex(sessionQuestions.length);
    }
  };

  const handleSwap = () => {
    const newSwapped = !isSwapped;
    setIsSwapped(newSwapped);
    
    // Auto switch keyboard layout if we swap
    if (newSwapped) {
      setLayout(currentQuestion?.sentence.includes('Türkçesi:') ? 'bg' : 'tr');
    } else {
      setLayout(currentQuestion?.sentence.includes('Türkçesi:') ? 'tr' : 'bg');
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

  const isFinished = sessionQuestions.length === 0 || (currentIndex >= sessionQuestions.length && mode === 'all') || (currentIndex >= sessionQuestions.length && mode === 'mistakes' && feedback !== 'correct');

  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-500">Yükleniyor...</div>;
  if (!data) return <div className="min-h-screen flex items-center justify-center text-red-500">Modül bulunamadı.</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-4 flex flex-col sm:flex-row items-center justify-between sticky top-0 z-10 gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto flex-1">
          <button onClick={() => router.push('/training')} className="text-slate-400 hover:text-slate-600">
            ✕
          </button>
          
          {/* Interactive Progress Slider */}
          {!isFinished && sessionQuestions.length > 0 && (
            <div className="flex-1 max-w-xl mx-4 flex items-center gap-3">
              <input 
                type="range" 
                min="0" 
                max={sessionQuestions.length - 1} 
                value={currentIndex}
                onChange={(e) => {
                  const newIdx = parseInt(e.target.value);
                  setCurrentIndex(newIdx);
                  localStorage.setItem(`training_${mode}_progress_${moduleId}`, newIdx.toString());
                  setFeedback('none');
                  setUserAnswer('');
                  setIsSwapped(false);
                }}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <span className="text-xs font-bold text-slate-500 whitespace-nowrap min-w-[50px] text-right">
                {currentIndex + 1} / {sessionQuestions.length}
              </span>
            </div>
          )}
        </div>
        <div className="text-sm font-bold text-indigo-600 px-4 py-1.5 bg-indigo-50 rounded-full">
          Puan: {Number.isInteger(score) ? score : score.toFixed(1)}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 pb-48 flex flex-col">
        {isFinished ? (
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
                 <button onClick={() => { localStorage.setItem(`training_${mode}_progress_${moduleId}`, '0'); window.location.reload(); }} className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors">Baştan Başla</button>
              )}
              <Link href="/training" className="px-6 py-3 bg-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-300 transition-colors">Modül Seçimine Dön</Link>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col mt-4">
            <div className="flex justify-between items-center mb-2">
              <h1 className="text-2xl font-extrabold text-slate-800">Çeviriyi yazın</h1>
              <button 
                onClick={handleSwap}
                className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg text-sm font-bold transition-colors"
                title="Soruyu ters çevir (Bulgarca <-> Türkçe)"
              >
                🔄 Yön Değiştir
              </button>
            </div>
            
            <p className="text-slate-500 mb-8 font-medium">{hint}</p>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-xl">🤖</div>
              <div className="text-lg font-medium text-slate-700">
                {displaySentence}
              </div>
            </div>

            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                inputMode={preferNativeKeyboard ? "text" : "none"}
                className={`w-full bg-white border-2 rounded-xl px-4 py-4 text-xl outline-none transition-colors ${feedback === 'wrong' ? 'border-red-400 bg-red-50 text-red-900' : feedback === 'correct' ? 'border-green-400 bg-green-50 text-green-900' : 'border-slate-200 focus:border-indigo-400'}`}
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
        <div className={`fixed bottom-0 left-0 right-0 z-50 transition-colors duration-300 ${feedback === 'correct' ? 'bg-green-100 border-t-2 border-green-200' : feedback === 'wrong' ? 'bg-red-100 border-t-2 border-red-200' : 'bg-white border-t border-slate-200'}`}>
          <div className="max-w-3xl mx-auto px-4 py-4 sm:py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            
            <div className="flex-1 w-full flex items-center">
              {feedback === 'correct' && (
                <div className="text-green-700">
                  <div className="font-black text-xl mb-1 flex items-center gap-2"><span>✅</span> Harika!</div>
                </div>
              )}
              {feedback === 'wrong' && (
                <div className="text-red-700">
                  <div className="font-black text-xl mb-1 flex items-center gap-2"><span>❌</span> {userAnswer.trim() ? "Yanlış cevap" : "Pas geçtiniz"}</div>
                  <div className="font-medium text-sm">Doğru cevap: <span className="font-bold">{expectedAnswer}</span></div>
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
              className={`w-full sm:w-auto px-8 py-3 rounded-xl font-black text-lg transition-all ${feedback === 'none' ? (userAnswer.trim() ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md' : 'bg-slate-200 text-slate-400 cursor-not-allowed') : feedback === 'correct' ? 'bg-green-600 text-white hover:bg-green-700 shadow-md' : 'bg-red-600 text-white hover:bg-red-700 shadow-md'}`}
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
