"use client";
import React, { useState, useEffect } from 'react';

interface ReadingSimulatorProps {
  question: any;
  onCheck: (isCorrect: boolean, feedback: 'correct' | 'wrong' | 'typo', userInput: string) => void;
  onNext?: () => void;
}

export default function ReadingSimulator({ question, onCheck, onNext }: ReadingSimulatorProps) {
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isHintActive, setIsHintActive] = useState(false);
  
  const readingQuestions = question.readingQuestions || [];
  const currentSubQuestion = readingQuestions[currentQuestionIdx];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsHintActive(true);
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsHintActive(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handleSelect = (option: string) => {
    if (isAnswered) return;
    setSelectedAnswer(option);
  };

  const handleSubmit = () => {
    if (!selectedAnswer) return;
    
    setIsAnswered(true);
    const isCorrect = selectedAnswer === currentSubQuestion.correctAnswer;
    
    if (isCorrect) {
      setTimeout(() => {
        if (currentQuestionIdx < readingQuestions.length - 1) {
          setCurrentQuestionIdx(currentQuestionIdx + 1);
          setSelectedAnswer(null);
          setIsAnswered(false);
        } else {
          // All sub-questions answered correctly
          onCheck(true, 'correct', selectedAnswer);
          setTimeout(() => {
            if (onNext) onNext();
          }, 1000);
        }
      }, 1000);
    } else {
      setTimeout(() => {
        // Just show wrong state, they must try again or skip (handled by parent?)
        // In this case, we let them retry immediately
        setIsAnswered(false);
        setSelectedAnswer(null);
      }, 1500);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Reading Text Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-amber-400"></div>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">📖</span>
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">{question.context || "Okuma Parçası"}</h3>
        </div>
        
        <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 font-medium relative overflow-hidden">
          {question.readingText?.split('\n').map((line: string, i: number) => (
            <p key={i} className="mb-2 last:mb-0 relative z-10">{line}</p>
          ))}
          
          {question.readingTranslation && (
            <div className={`transition-all duration-300 ease-in-out mt-4 pt-4 border-t border-slate-200 relative z-10 ${isHintActive ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 border-transparent overflow-hidden mt-0 pt-0'}`}>
              <p className="text-sm text-indigo-600/90 italic font-medium">
                {question.readingTranslation}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Questions Area */}
      {currentSubQuestion && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 animate-fade-in-up">
           <div className="mb-4">
             <span className="bg-slate-100 text-slate-500 text-xs font-bold px-2 py-1 rounded-md mb-2 inline-block">
               Soru {currentQuestionIdx + 1} / {readingQuestions.length}
             </span>
             <h4 className="text-lg font-bold text-slate-800">{currentSubQuestion.questionText}</h4>
             {currentSubQuestion.translation && (
               <p className="text-sm text-slate-500">{currentSubQuestion.translation}</p>
             )}
           </div>

           <div className="flex flex-col gap-3">
             {currentSubQuestion.options.map((opt: string, idx: number) => {
               const isSelected = selectedAnswer === opt;
               const isCorrectAnswer = opt === currentSubQuestion.correctAnswer;
               
               let btnClass = "bg-white border-slate-200 text-slate-700 hover:border-indigo-300 hover:bg-slate-50";
               
               if (isAnswered && isSelected) {
                 btnClass = isCorrectAnswer 
                   ? "bg-emerald-50 border-emerald-500 text-emerald-700" 
                   : "bg-rose-50 border-rose-500 text-rose-700";
               } else if (isSelected) {
                 btnClass = "bg-indigo-50 border-indigo-500 text-indigo-700 ring-2 ring-indigo-500/20";
               }

               return (
                 <button
                   key={idx}
                   onClick={() => handleSelect(opt)}
                   disabled={isAnswered}
                   className={`w-full text-left p-4 rounded-xl border-2 transition-all font-medium ${btnClass}`}
                 >
                   {opt}
                 </button>
               );
             })}
           </div>

           <div className="mt-6">
             <button
                onClick={handleSubmit}
                disabled={!selectedAnswer || isAnswered}
                className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
             >
               {isAnswered ? 'Kontrol Ediliyor...' : 'Cevapla'}
             </button>
           </div>
        </div>
      )}

      {/* Floating Hint Bubble */}
      <div className={`fixed bottom-8 right-8 pointer-events-none transition-all duration-500 z-50 ${isHintActive ? 'scale-100 opacity-100' : 'scale-95 opacity-50'}`}>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-lg border text-sm font-medium transition-colors duration-300 ${isHintActive ? 'bg-amber-100 border-amber-200 text-amber-700 shadow-amber-500/20' : 'bg-white/90 border-slate-200 text-slate-400 backdrop-blur-sm'}`}>
            <span className="text-base">💡</span>
            <span>Çeviriyi görmek için <kbd className={`px-2 py-0.5 rounded-md border shadow-sm transition-colors ${isHintActive ? 'bg-amber-200 border-amber-300 text-amber-800' : 'bg-slate-100 border-slate-200'}`}>SPACE</kbd> tuşuna basılı tutun</span>
        </div>
      </div>
    </div>
  );
}
