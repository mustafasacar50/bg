'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
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

export default function TrainingSessionPage({ params }: { params: Promise<{ id: string }> }) {
  // We'll use React's use() hook for the promise inside useEffect, but since this is a client component, 
  // it's easier to unwrap it in useEffect or just use React.use(). Wait, client components in Next 15 
  // should use `use(params)`.
  const [moduleId, setModuleId] = useState<string | null>(null);
  
  useEffect(() => {
    params.then(p => setModuleId(p.id));
  }, [params]);

  const [data, setData] = useState<ModuleData | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Session State
  const [sessionQuestions, setSessionQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none');
  const [score, setScore] = useState(0);
  
  // Keyboard State
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [layout, setLayout] = useState<LayoutType>('bg');
  const [isCaps, setIsCaps] = useState(false);
  const [preferNativeKeyboard, setPreferNativeKeyboard] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!moduleId) return;
    fetch(`/api/modules/${moduleId}`)
      .then(res => res.json())
      .then((modData: ModuleData) => {
        setData(modData);
        // Shuffle and pick 20 questions for a session
        const shuffled = [...modData.questions].sort(() => 0.5 - Math.random());
        setSessionQuestions(shuffled.slice(0, 20));
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching module:', err);
        setLoading(false);
      });
  }, [moduleId]);

  const currentQuestion = sessionQuestions[currentIndex];

  const handleCheck = () => {
    if (!currentQuestion) return;
    
    // Normalize both strings for comparison (remove spaces, lowercase)
    const normalizedUser = userAnswer.trim().toLowerCase();
    const normalizedAnswer = currentQuestion.answer.trim().toLowerCase();
    
    if (normalizedUser === normalizedAnswer) {
      setFeedback('correct');
      setScore(s => s + 1);
    } else {
      setFeedback('wrong');
    }
  };

  const handleNext = () => {
    setUserAnswer('');
    setFeedback('none');
    if (currentIndex < sessionQuestions.length - 1) {
      setCurrentIndex(i => i + 1);
    } else {
      // Finished session
      setCurrentIndex(sessionQuestions.length);
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

  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-500">Yükleniyor...</div>;
  if (!data) return <div className="min-h-screen flex items-center justify-center text-red-500">Modül bulunamadı.</div>;

  const isFinished = currentIndex >= sessionQuestions.length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/training')} className="text-slate-400 hover:text-slate-600">
            ✕
          </button>
          <div className="w-48 sm:w-64 bg-slate-200 h-3 rounded-full overflow-hidden">
            <div 
              className="bg-indigo-500 h-full transition-all duration-500" 
              style={{ width: `${(currentIndex / sessionQuestions.length) * 100}%` }}
            />
          </div>
        </div>
        <div className="text-sm font-bold text-indigo-600">Puan: {score}</div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 pb-48 flex flex-col">
        {isFinished ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center mt-12">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Antrenman Tamamlandı!</h2>
            <p className="text-slate-600 mb-8">20 soruluk seti başarıyla bitirdiniz. Toplam doğru sayınız: <span className="font-bold text-indigo-600">{score}</span></p>
            <div className="flex gap-4 justify-center">
              <button onClick={() => window.location.reload()} className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors">Tekrar Oyna</button>
              <Link href="/training" className="px-6 py-3 bg-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-300 transition-colors">Modül Seçimine Dön</Link>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col mt-4">
            <h1 className="text-2xl font-extrabold text-slate-800 mb-2">Çeviriyi yazın</h1>
            <p className="text-slate-500 mb-8 font-medium">{currentQuestion?.hint}</p>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-xl">🤖</div>
              <div className="text-lg font-medium text-slate-700">
                {currentQuestion?.sentence.replace('_____', '...')}
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
            
            <div className="flex-1 w-full">
              {feedback === 'correct' && (
                <div className="text-green-700">
                  <div className="font-black text-xl mb-1 flex items-center gap-2"><span>✅</span> Harika!</div>
                </div>
              )}
              {feedback === 'wrong' && (
                <div className="text-red-700">
                  <div className="font-black text-xl mb-1 flex items-center gap-2"><span>❌</span> Yanlış cevap</div>
                  <div className="font-medium text-sm">Doğru cevap: <span className="font-bold">{currentQuestion?.answer}</span></div>
                </div>
              )}
              {feedback === 'none' && (
                <button 
                  className="hidden sm:block text-slate-400 font-bold hover:text-slate-600 px-4 py-2 rounded-lg"
                  onClick={() => setKeyboardOpen(!keyboardOpen)}
                  title="Klavyeyi Aç/Kapat"
                >
                  ⌨️ Sanal Klavye
                </button>
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
