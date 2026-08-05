"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { ChevronLeft, Clock, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";

type LayoutType = "bg" | "tr";

export default function ExamPage() {
  const router = useRouter();
  const params = useParams();
  const examId = params.id as string;
  
  const [student, setStudent] = useState<any>(null);
  const [activeInput, setActiveInput] = useState<HTMLInputElement | null>(null);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [layout, setLayout] = useState<LayoutType>("bg");
  
  const [exam, setExam] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState<any>({ total: 0, mcq: "", match: "", blank: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  // Timer states
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [status, setStatus] = useState<"WAITING" | "ACTIVE" | "EXPIRED">("ACTIVE");

  useEffect(() => {
    const session = localStorage.getItem("student_session");
    if (!session) {
      router.push("/");
    } else {
      setStudent(JSON.parse(session));
    }
  }, [router]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const examRes = await fetch(`/api/manage-exams?id=${examId}`);
        const examData = await examRes.json();
        
        const qRes = await fetch('/api/questions');
        const qData = await qRes.json();

        if (examData.exam && qData.questions) {
          const fetchedExam = examData.exam;
          setExam(fetchedExam);
          
          const examQs = fetchedExam.questions.map((qId: string) => 
            qData.questions.find((q: any) => q.id === qId)
          ).filter(Boolean);
          
          setQuestions(examQs);

          // Check Schedule
          const now = new Date().getTime();
          if (fetchedExam.startTime && now < new Date(fetchedExam.startTime).getTime()) {
            setStatus("WAITING");
          } else if (fetchedExam.endTime && now > new Date(fetchedExam.endTime).getTime()) {
            setStatus("EXPIRED");
          } else {
            // Set Timer
            if (fetchedExam.recommendedTimeMinutes) {
              setTimeLeft(fetchedExam.recommendedTimeMinutes * 60);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load exam", err);
      }
      setLoading(false);
    };
    fetchData();
  }, [examId]);

  useEffect(() => {
    if (status !== "ACTIVE" || timeLeft === null || showResults) return;

    if (timeLeft <= 0) {
      // Auto submit
      handleFinalSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, status, showResults]);

  const isQuestionUnanswered = (q: any) => {
    if (q.type === 'mcq') return !answers[q.id];
    if (q.type === 'matching' || q.type === 'match') return q.pairs.some((p: any) => !answers[`${q.id}_${p.word}`]);
    if (q.type === 'blank') {
      const blankKeys = Object.keys(q.answers || { [q.id]: q.answer });
      return blankKeys.some(bId => !answers[bId]);
    }
    return false;
  };

  const totalRequired = questions?.length || 0;
  const answeredCount = questions?.filter(q => !isQuestionUnanswered(q)).length || 0;
  const unansweredCount = totalRequired - answeredCount;

  useEffect(() => {
    if (showConfirmSubmit && answeredCount >= totalRequired) {
      setShowConfirmSubmit(false);
    }
  }, [answeredCount, totalRequired, showConfirmSubmit]);

  const handleAnswerChange = (qId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [qId]: value }));
  };

  const normalize = (value: string) => value
    .toLocaleUpperCase('bg-BG')
    .trim()
    .replace(/[.,!?;:]+$/g, '')

  const handleFinalSubmit = async () => {
    setKeyboardOpen(false);

    const mcqs = questions.filter(q => q.type === "mcq");
    const matches = questions.filter(q => q.type === "matching" || q.type === "match");
    const blanks = questions.filter(q => q.type === "blank");

    let earnedPoints = 0;
    let maxPoints = 0;
    
    // Test (MCQ) scoring
    mcqs.forEach(q => {
      const pts = exam.questionPoints ? (exam.questionPoints[q.id] || q.points || 5) : (q.points || 5);
      maxPoints += pts;
      if (answers[q.id] === q.answer) earnedPoints += pts;
    });

    // Match scoring
    matches.forEach(q => {
      const qPts = exam.questionPoints ? (exam.questionPoints[q.id] || q.points || 10) : (q.points || 10);
      maxPoints += qPts;
      
      let correctPairs = 0;
      q.pairs.forEach((p: any) => {
        if (answers[`${q.id}_${p.word}`] === p.match) correctPairs++;
      });
      
      if (q.pairs.length > 0) {
        earnedPoints += (correctPairs / q.pairs.length) * qPts;
      }
    });

    // Blank scoring
    blanks.forEach(q => {
      const qPts = exam.questionPoints ? (exam.questionPoints[q.id] || q.points || 15) : (q.points || 15);
      maxPoints += qPts;
      
      let correctBlanks = 0;
      const blankKeys = Object.keys(q.answers || { [q.id]: q.answer });
      
      blankKeys.forEach(bId => {
        const expected = q.answers ? q.answers[bId] : q.answer;
        if (normalize(answers[bId] || "") === normalize(expected)) {
          correctBlanks++;
        }
      });
      
      if (blankKeys.length > 0) {
        earnedPoints += (correctBlanks / blankKeys.length) * qPts;
      }
    });

    // Normalize to 100
    const finalScore = maxPoints > 0 ? Math.round((earnedPoints / maxPoints) * 100) : 0;
    
    const scoreData = {
      total: finalScore,
      mcq: mcqs.reduce((acc, q) => acc + (answers[q.id] === q.answer ? 1 : 0), 0) + "/" + mcqs.length,
      match: matches.reduce((acc, q) => acc + q.pairs.reduce((pAcc: number, p: any) => pAcc + (answers[`${q.id}_${p.word}`] === p.match ? 1 : 0), 0), 0) + "/" + matches.reduce((acc, q) => acc + q.pairs.length, 0),
      blank: blanks.reduce((acc, q) => acc + Object.keys(q.answers || { [q.id]: q.answer }).reduce((bAcc: number, bId) => {
        const expected = q.answers ? q.answers[bId] : q.answer;
        return bAcc + (normalize(answers[bId] || "") === normalize(expected) ? 1 : 0);
      }, 0), 0) + "/" + blanks.reduce((acc, q) => acc + Object.keys(q.answers || { [q.id]: q.answer }).length, 0),
    };

    setScore(scoreData as any);
    setShowResults(true);

    // Save to GitHub via our API
    setIsSubmitting(true);
    try {
      await fetch('/api/submit-exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student,
          examId,
          score: scoreData,
          answers,
          date: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error("Sonuç gönderilemedi:", error);
    }
    setIsSubmitting(false);
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (answeredCount < totalRequired && !showConfirmSubmit) {
      setShowConfirmSubmit(true);
      return;
    }
    handleFinalSubmit();
  };

  // Keyboard Logic
  const layouts = {
    bg: ['А','Б','В','Г','Д','Е','Ж','З','И','Й','К','Л','М','Н','О','П','Р','С','Т','У','Ф','Х','Ц','Ч','Ш','Щ','Ъ','Ь','Ю','Я'],
    tr: ['A','B','C','Ç','D','E','F','G','Ğ','H','I','İ','J','K','L','M','N','O','Ö','P','R','S','Ş','T','U','Ü','V','Y','Z']
  };

  const insertText = (text: string) => {
    if (!activeInput) return;
    const input = activeInput;
    const start = input.selectionStart ?? input.value.length;
    const end = input.selectionEnd ?? input.value.length;
    
    const newVal = input.value.slice(0, start) + text + input.value.slice(end);
    
    // Create synthetic event
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
    nativeInputValueSetter?.call(input, newVal);
    const ev2 = new Event('input', { bubbles: true});
    input.dispatchEvent(ev2);
    
    setTimeout(() => {
      input.setSelectionRange(start + text.length, start + text.length);
      input.focus();
    }, 0);
  };

  const backspace = () => {
    if (!activeInput) return;
    const input = activeInput;
    const start = input.selectionStart ?? input.value.length;
    const end = input.selectionEnd ?? input.value.length;
    
    let newVal = input.value;
    let newPos = start;

    if (start !== end) {
      newVal = input.value.slice(0, start) + input.value.slice(end);
    } else if (start > 0) {
      newVal = input.value.slice(0, start - 1) + input.value.slice(end);
      newPos = start - 1;
    }

    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
    nativeInputValueSetter?.call(input, newVal);
    const ev2 = new Event('input', { bubbles: true});
    input.dispatchEvent(ev2);
    
    setTimeout(() => {
      input.setSelectionRange(newPos, newPos);
      input.focus();
    }, 0);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const renderFormattedText = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-black text-slate-800">{part.slice(2, -2)}</strong>;
      }
      return <span key={index}>{part}</span>;
    });
  };

  if (loading) {
    return <div className="p-10 flex justify-center text-primary"><Loader2 className="animate-spin" size={40} /></div>;
  }

  if (!exam || !questions) return <div className="p-10 text-center font-bold text-red-500">Sınav bulunamadı.</div>;

  if (status === "WAITING") {
    return (
      <div className="p-10 text-center flex flex-col items-center justify-center min-h-[60vh]">
        <Clock size={48} className="text-amber-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Sınav Henüz Başlamadı</h2>
        <p className="text-slate-600 mb-6">Bu sınav {new Date(exam.startTime).toLocaleString('tr-TR')} tarihinde başlayacaktır.</p>
        <Link href="/dashboard" className="btn btn-primary">Panoya Dön</Link>
      </div>
    );
  }

  if (status === "EXPIRED") {
    return (
      <div className="p-10 text-center flex flex-col items-center justify-center min-h-[60vh]">
        <Clock size={48} className="text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Sınav Süresi Doldu</h2>
        <p className="text-slate-600 mb-6">Bu sınava giriş süresi sona ermiştir.</p>
        <Link href="/dashboard" className="btn btn-primary">Panoya Dön</Link>
      </div>
    );
  }

  return (
    <div className="pb-32 relative">
      <div className="mb-4">
        <Link href="/dashboard" className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-primary transition-colors">
          <ChevronLeft size={16} /> Panoya Dön
        </Link>
      </div>

      {/* Timer Bar */}
      {!showResults && timeLeft !== null && (
        <div className={`sticky top-0 z-50 p-3 mb-6 rounded-b-xl border-b shadow-sm flex items-center justify-center gap-2 font-mono text-xl font-bold transition-colors ${
          timeLeft < 60 ? 'bg-red-500 text-white border-red-600 animate-pulse' : 'bg-white text-slate-800 border-slate-200'
        }`}>
          <Clock size={20} />
          {formatTime(timeLeft)}
        </div>
      )}

      <section className="hero">
        <span className="eyebrow">📱 Mobil uyumlu • {exam.level} düzeyi</span>
        <h1>{exam.title}</h1>
        <p>{exam.description}</p>
        <div className="summary-grid">
          <div className="summary-item"><strong>{questions.length}</strong><span>bölüm</span></div>
          <div className="summary-item"><strong>100</strong><span>toplam puan</span></div>
          <div className="summary-item"><strong>{exam.recommendedTimeMinutes} dk</strong><span>sınav süresi</span></div>
        </div>
      </section>

      <section className="card">
        <div className="student-row">
          <div>
            <label className="label">Ad ve soyad</label>
            <div className="font-semibold text-lg">{student?.name}</div>
          </div>
          <div>
            <label className="label">Sınıf / grup</label>
            <div className="font-semibold text-lg">{student?.group || student?.role}</div>
          </div>
        </div>
        <div className="progress-wrap">
          <div className="progress-label"><span>Yanıtlama durumu</span><strong>{answeredCount} / {totalRequired}</strong></div>
          <div className="progress"><div style={{ width: `${(answeredCount / totalRequired) * 100}%` }}></div></div>
        </div>
      </section>

      <form onSubmit={handleSubmit} noValidate>
        {questions.map((q, qIndex) => {
          const isUnanswered = isQuestionUnanswered(q);
          const highlightClass = showConfirmSubmit && isUnanswered ? 'bg-orange-50/50 border-orange-200 ring-4 ring-orange-50' : '';

          if (q.type === "mcq") {
            return (
              <section key={q.id} className={`card transition-colors duration-300 ${highlightClass}`}>
                <div className="section-head">
                  <div>
                    <h2>{qIndex + 1}. Çoktan Seçmeli</h2>
                  </div>
                  <span className="points">{exam.questionPoints?.[q.id] || q.points} puan</span>
                </div>
                <div className={`question ${showResults ? (answers[q.id] === q.answer ? 'is-correct' : 'is-wrong') : ''}`}>
                  <div className="question-title"><span className="qno">{qIndex + 1}</span>{renderFormattedText(q.question)}</div>
                  <div className="options flex flex-col gap-3">
                    {q.options.map((opt: any) => {
                      const isSelected = answers[q.id] === opt.id;
                      return (
                        <label 
                          key={opt.id} 
                          className={`option flex items-center p-4 border rounded-xl cursor-pointer transition-all ${isSelected ? 'selected-cell' : 'border-slate-200 hover:bg-slate-50 hover:border-slate-300'}`}
                        >
                          <input 
                            type="radio" 
                            name={q.id} 
                            value={opt.id} 
                            checked={isSelected}
                            onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                            disabled={showResults}
                            className="w-5 h-5 text-indigo-600 border-slate-300 focus:ring-indigo-500 mr-3"
                          /> 
                          <span className={isSelected ? 'font-bold text-indigo-800' : 'text-slate-700 font-medium'}>
                            {opt.text}
                          </span>
                        </label>
                      )
                    })}
                  </div>
                  {showResults && (
                    <div className="feedback mt-3">
                      {answers[q.id] === q.answer ? '✓ Doğru' : '✗ Yanlış veya boş'}
                    </div>
                  )}
                </div>
              </section>
            );
          }

          if (q.type === "matching" || q.type === "match") {
            return (
              <section key={q.id} className={`card transition-colors duration-300 ${highlightClass}`}>
                <div className="section-head">
                  <div>
                    <h2>{qIndex + 1}. Eşleştirme</h2>
                    <p>{renderFormattedText(q.question)}</p>
                  </div>
                  <span className="points">{exam.questionPoints?.[q.id] || q.points} puan</span>
                </div>
                <div className="match-grid">
                  {q.pairs.map((pair: any, pIndex: number) => {
                    const ansKey = `${q.id}_${pair.word}`;
                    const isCorrect = answers[ansKey] === pair.match;
                    const isSelected = !!answers[ansKey];
                    return (
                      <div key={pair.word} className={`match-row p-3 rounded-xl border transition-all ${isSelected ? 'selected-cell' : 'border-transparent'} ${showResults ? (isCorrect ? 'is-correct' : 'is-wrong') : ''}`}>
                        <span className="match-word font-bold text-slate-800">{pair.word}</span>
                        <select 
                          className={`flex-1 p-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none transition-colors ${isSelected ? 'border-indigo-500 bg-white text-indigo-800 font-bold shadow-sm' : 'border-slate-200 bg-slate-50'}`}
                          value={answers[ansKey] || ""}
                          onChange={(e) => handleAnswerChange(ansKey, e.target.value)}
                          disabled={showResults}
                        >
                          <option value="">Seçiniz…</option>
                          {q.options.map((opt: any) => (
                            <option key={opt.id} value={opt.id}>{opt.text}</option>
                          ))}
                        </select>
                        {showResults && (
                          <div className="feedback w-full mt-2">
                            {isCorrect ? '✓ Doğru' : `✗ Doğru cevap: ${q.options.find((o:any) => o.id === pair.match)?.text}`}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          }

          if (q.type === "blank") {
            const correctAnswerForBlank = q.answers ? q.answers[q.id] : "";
            const isCorrect = normalize(answers[q.id] || "") === normalize(correctAnswerForBlank);
            const isSelected = !!answers[q.id];
            
            return (
              <section key={q.id} className={`card transition-colors duration-300 ${highlightClass}`}>
                <div className="section-head">
                  <div>
                    <h2>{qIndex + 1}. Boşluk Doldurma</h2>
                  </div>
                  <span className="points">{exam.questionPoints?.[q.id] || q.points} puan</span>
                </div>
                <div className={`question ${showResults ? (isCorrect ? 'is-correct' : 'is-wrong') : ''}`}>
                  <div className={`blank-line p-4 rounded-xl border transition-all ${isSelected ? 'selected-cell' : 'border-slate-100 bg-slate-50/50'}`}>
                    <div>
                      <div className="sentence"><span className="qno">{qIndex + 1}</span>{renderFormattedText(q.sentence)}</div>
                      <div className="hint text-slate-500 font-medium">{q.hint}</div>
                    </div>
                    <input 
                      className={`text-input answer-input font-bold tracking-wider ${isSelected ? 'border-primary text-primary-dark ring-2 ring-primary/20' : ''}`}
                      type="text" 
                      autoComplete="off" 
                      autoCapitalize="characters" 
                      spellCheck="false" 
                      placeholder="Bulgarca yazınız"
                      value={answers[q.id] || ""}
                      onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                      onFocus={(e) => {
                        setActiveInput(e.target);
                        setKeyboardOpen(true);
                      }}
                      disabled={showResults}
                    />
                  </div>
                  {showResults && (
                    <div className="feedback mt-3">
                      {isCorrect ? '✓ Doğru' : `✗ Doğru cevap: ${correctAnswerForBlank}`}
                    </div>
                  )}
                </div>
                <div className="keyboard-help mt-4 text-xs font-semibold text-slate-400 flex items-center justify-center gap-1">
                  ⌨️ Yazma alanına dokunduğunuzda Bulgarca klavye açılır.
                </div>
              </section>
            );
          }
          return null;
        })}

        {!showResults && (
          <section className="card bg-transparent border-0 shadow-none p-0">
            <div className="actions w-full">
              {showConfirmSubmit ? (
                <div className="flex flex-col items-center gap-4 w-full">
                  <div className="bg-orange-50 text-orange-700 p-5 rounded-2xl border border-orange-200 w-full flex items-center justify-center gap-3">
                    <AlertCircle size={24} className="text-orange-500" />
                    <div>
                      <strong className="block text-lg">Dikkat!</strong> 
                      <span className="font-medium">{unansweredCount} tane soruyu boş bıraktınız. Boş sorular renkli olarak işaretlendi.</span>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 w-full">
                    <button 
                      className="btn bg-white text-slate-700 border-2 border-slate-200 hover:bg-slate-50 hover:border-slate-300 flex-1 py-4 font-bold text-lg" 
                      type="button" 
                      onClick={() => setShowConfirmSubmit(false)}
                    >
                      Geri Dön ve Doldur
                    </button>
                    <button 
                      className="btn bg-orange-500 hover:bg-orange-600 text-white flex-1 py-4 font-bold text-lg" 
                      type="button"
                      onClick={handleFinalSubmit}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Kaydediliyor...' : 'Yine de Sınavı Bitir'}
                    </button>
                  </div>
                </div>
              ) : (
                <button className="btn btn-primary w-full py-4 font-bold text-lg shadow-xl shadow-primary/20" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Kaydediliyor...' : 'Sınavı Bitir ve Puanı Gör'}
                </button>
              )}
            </div>
          </section>
        )}
      </form>

      {showResults && (
        <section className="card result-card show mt-8" aria-live="polite">
          <div className="score-circle">
            <div className="score-number"><strong>{score.total}</strong><span>/ 100</span></div>
          </div>
          <h2 className="result-title">{score.total >= 90 ? 'Çok başarılı!' : score.total >= 75 ? 'Başarılı!' : 'Çalışmaya devam'}</h2>
          <p className="result-message">
            {score.total >= 90 ? 'A1 düzeyindeki temel ifadeleri çok iyi kullanıyorsunuz.' : 
             score.total >= 75 ? 'Küçük tekrarlarla bilginizi daha da sağlamlaştırabilirsiniz.' : 
             'Temel kelimeleri ve cümle kalıplarını yeniden gözden geçirin.'}
          </p>
          <div className="breakdown">
            <div><strong>{score.mcq}</strong><span>Çoktan seçmeli</span></div>
            <div><strong>{score.match}</strong><span>Eşleştirme</span></div>
            <div><strong>{score.blank}</strong><span>Boşluk doldurma</span></div>
          </div>
          <div className="mt-6 flex flex-col gap-3">
             <Link href="/dashboard" className="btn btn-secondary w-full py-4 text-lg font-bold">Panoya Dön</Link>
          </div>
        </section>
      )}

      {/* Keyboard */}
      {!showResults && (
        <>
          <button className="floating-kb" type="button" onClick={() => setKeyboardOpen(true)} style={{ display: keyboardOpen ? 'none' : 'block' }}>
            ⌨️ Klavye
          </button>

          <div className="keyboard-shell" aria-hidden={!keyboardOpen}>
            <div className={`keyboard ${keyboardOpen ? 'open' : ''}`}>
              <div className="kb-top">
                <div className="kb-tabs">
                  <button type="button" className={`kb-tab ${layout === 'bg' ? 'active' : ''}`} onClick={() => setLayout('bg')}>БГ Bulgarca</button>
                  <button type="button" className={`kb-tab ${layout === 'tr' ? 'active' : ''}`} onClick={() => setLayout('tr')}>TR Türkçe</button>
                </div>
                <button type="button" className="kb-close" onClick={() => setKeyboardOpen(false)}>Kapat</button>
              </div>
              <div className="keys">
                {layouts[layout].map(letter => (
                  <button key={letter} type="button" className="key" onClick={(e) => { e.preventDefault(); insertText(letter); }}>
                    {letter}
                  </button>
                ))}
                <button type="button" className="key action space" onClick={(e) => { e.preventDefault(); insertText(' '); }}>Boşluk</button>
                <button type="button" className="key action wide" onClick={(e) => { e.preventDefault(); backspace(); }}>⌫ Sil</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
