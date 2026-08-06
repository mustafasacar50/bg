"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ChevronLeft, Edit3, Save, Eye, Loader2 } from "lucide-react";
import Link from "next/link";

export default function ExamPreviewPage() {
  const router = useRouter();
  const params = useParams();
  const examId = params.id as string;
  
  const [exam, setExam] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  // Keyboard State
  type LayoutType = "bg" | "tr";
  const [activeInput, setActiveInput] = useState<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [layout, setLayout] = useState<LayoutType>("bg");

  useEffect(() => {
    if (editMode) setKeyboardOpen(true);
    else setKeyboardOpen(false);
  }, [editMode]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const examRes = await fetch(`/api/manage-exams?id=${examId}`);
        const examData = await examRes.json();
        
        const qRes = await fetch('/api/questions');
        const qData = await qRes.json();

        if (examData.exam && qData.questions) {
          setExam(examData.exam);
          const examQs = examData.exam.questions.map((qId: string) => 
            qData.questions.find((q: any) => q.id === qId)
          ).filter(Boolean);
          
          setQuestions(examQs);
        }
      } catch (err) {
        console.error("Failed to load exam preview", err);
      }
      setLoading(false);
    };
    fetchData();
  }, [examId]);

  const updateQuestionState = (qId: string, updates: any) => {
    setQuestions(prev => prev.map(q => q.id === qId ? { ...q, ...updates } : q));
  };

  const saveQuestion = async (q: any) => {
    setSavingId(q.id);
    try {
      await fetch('/api/questions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(q)
      });
    } catch (e) {
      alert("Soru kaydedilemedi.");
    }
    setSavingId(null);
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
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      input instanceof HTMLTextAreaElement ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype, 
      "value"
    )?.set;
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

    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      input instanceof HTMLTextAreaElement ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype, 
      "value"
    )?.set;
    nativeInputValueSetter?.call(input, newVal);
    const ev2 = new Event('input', { bubbles: true});
    input.dispatchEvent(ev2);
    
    setTimeout(() => {
      input.setSelectionRange(newPos, newPos);
      input.focus();
    }, 0);
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

  const renderReadingText = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(____\d+____)/g);
    
    return parts.map((part, index) => {
      const match = part.match(/____(\d+)____/);
      if (match) {
        const blankKey = match[1];
        return (
          <span key={index} className="inline-block mx-1 align-middle">
            <input 
              type="text"
              className={`text-input answer-input font-bold tracking-wider w-32 py-1 px-2 text-center text-sm border-b-2 bg-slate-50 border-slate-300 focus:border-primary focus:bg-indigo-50 focus:text-primary-dark shadow-sm`}
              placeholder={q.answers ? q.answers[blankKey] : `${blankKey}. boşluk`}
              onFocus={(e) => {
                setActiveInput(e.target);
                setKeyboardOpen(true);
              }}
            />
          </span>
        );
      }
      return <span key={index} className="text-lg text-slate-700 leading-10">{part}</span>;
    });
  };

  if (loading) {
    return <div className="p-10 flex justify-center text-primary"><Loader2 className="animate-spin" size={40} /></div>;
  }

  if (!exam || questions.length === 0) {
    return <div className="p-10 text-center font-bold text-red-500">Sınav bulunamadı!</div>;
  }

  return (
    <div className="pb-32 relative">
      {/* Admin Toolbar */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 p-4 mb-6 shadow-sm flex items-center justify-between">
        <Link href="/admin/generate-exam" className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-primary transition-colors">
          <ChevronLeft size={16} /> Geri Dön
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-slate-600">
            {editMode ? "Satıriçi Düzenleme Aktif" : "Canlı Önizleme Modu"}
          </span>
          <button 
            onClick={() => setEditMode(!editMode)}
            className={`btn flex items-center gap-2 rounded-full px-5 py-2 ${
              editMode ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 border border-amber-300' : 'btn-primary'
            }`}
          >
            {editMode ? <><Eye size={18} /> Önizlemeye Geç</> : <><Edit3 size={18} /> Düzenleme Modu</>}
          </button>
        </div>
      </div>

      {/* Keyboard */}
      <button className="fixed bottom-4 right-4 z-[60] bg-primary text-white p-3 rounded-full shadow-lg" type="button" onClick={() => setKeyboardOpen(!keyboardOpen)} style={{ display: editMode ? 'block' : 'none' }}>
        ⌨️
      </button>

      <div className={`fixed bottom-0 left-0 right-0 z-[55] bg-white border-t border-slate-200 p-4 transition-transform ${keyboardOpen ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-2">
            <div className="flex gap-2">
              <button type="button" className={`text-xs font-bold px-3 py-1 rounded ${layout === 'bg' ? 'bg-primary text-white' : 'bg-slate-200'}`} onClick={() => setLayout('bg')}>БГ</button>
              <button type="button" className={`text-xs font-bold px-3 py-1 rounded ${layout === 'tr' ? 'bg-primary text-white' : 'bg-slate-200'}`} onClick={() => setLayout('tr')}>TR</button>
            </div>
            <button type="button" className="text-xs text-slate-400" onClick={() => setKeyboardOpen(false)}>Kapat</button>
          </div>
          <div className="flex flex-wrap gap-1">
            {layouts[layout].map(letter => (
              <button key={letter} type="button" className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded hover:bg-slate-200 font-bold" onClick={() => insertText(letter)}>
                {letter}
              </button>
            ))}
            <button type="button" className="w-20 h-8 flex items-center justify-center bg-slate-100 rounded hover:bg-slate-200 text-xs font-bold" onClick={() => insertText(' ')}>Boşluk</button>
            <button type="button" className="w-16 h-8 flex items-center justify-center bg-red-100 text-red-600 rounded hover:bg-red-200 text-xs font-bold" onClick={() => backspace()}>⌫</button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4">
        <section className="hero">
          <span className="eyebrow">📱 Mobil uyumlu • {exam.level} düzeyi</span>
          <h1>{exam.title}</h1>
          <p>{exam.description}</p>
        </section>

        <form onSubmit={e => e.preventDefault()} noValidate>
          {questions.map((q, qIndex) => {
            const currentPoints = exam.questionPoints ? (exam.questionPoints[q.id] || q.points) : q.points;
            
            if (q.type === "mcq") {
              return (
                <section key={q.id} className="card relative">
                  {editMode && savingId === q.id && (
                    <div className="absolute top-2 right-2 text-green-500 flex items-center gap-1 text-xs font-bold bg-green-50 px-2 py-1 rounded-md">
                      <Loader2 size={12} className="animate-spin" /> Kaydediliyor
                    </div>
                  )}
                  <div className="section-head">
                    <h2>{qIndex + 1}. Çoktan Seçmeli</h2>
                    {editMode ? (
                      <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-md border border-amber-200">
                        <input 
                          type="number" 
                          className="w-12 text-center text-sm font-bold bg-transparent outline-none text-amber-700" 
                          value={q.points || 0}
                          onChange={(e) => updateQuestionState(q.id, { points: parseInt(e.target.value) || 0 })}
                          onBlur={() => saveQuestion(q)}
                        /> <span className="text-amber-700 text-xs">puan</span>
                      </div>
                    ) : (
                      <span className="points">{currentPoints} puan</span>
                    )}
                  </div>
                  
                  <div className="question">
                    {editMode ? (
                      <textarea 
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-lg font-bold mb-4 outline-none focus:border-primary"
                        value={q.question}
                        onChange={(e) => updateQuestionState(q.id, { question: e.target.value })}
                        onBlur={() => saveQuestion(q)}
                        onFocus={(e) => setActiveInput(e.target)}
                      />
                    ) : (
                      <div className="question-title"><span className="qno">{qIndex + 1}</span>{renderFormattedText(q.question)}</div>
                    )}
                    
                    <div className="options">
                      {q.options.map((opt: any) => (
                        <div key={opt.id} className="flex items-center gap-2 mb-2 w-full">
                          {editMode && (
                            <input 
                              type="radio" 
                              name={`correct_${q.id}`} 
                              checked={q.answer === opt.id}
                              onChange={() => {
                                updateQuestionState(q.id, { answer: opt.id });
                                saveQuestion({ ...q, answer: opt.id });
                              }}
                              className="w-5 h-5 accent-green-500 cursor-pointer"
                              title="Doğru cevap olarak işaretle"
                            />
                          )}
                          {!editMode && (
                            <input type="radio" disabled />
                          )}
                          
                          {editMode ? (
                            <input 
                              type="text"
                              className={`flex-1 bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm outline-none focus:border-primary ${q.answer === opt.id ? 'border-green-400 bg-green-50 font-bold' : ''}`}
                              value={opt.text}
                              onChange={(e) => {
                                const newOpts = q.options.map((o: any) => o.id === opt.id ? { ...o, text: e.target.value } : o);
                                updateQuestionState(q.id, { options: newOpts });
                              }}
                              onBlur={() => saveQuestion(q)}
                              onFocus={(e) => setActiveInput(e.target)}
                            />
                          ) : (
                            <label className="option w-full ml-0">{opt.text}</label>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              );
            }

            if (q.type === "matching" || q.type === "match") {
              return (
                <section key={q.id} className="card relative">
                  {editMode && savingId === q.id && (
                     <div className="absolute top-2 right-2 text-green-500 flex items-center gap-1 text-xs font-bold bg-green-50 px-2 py-1 rounded-md">
                       <Loader2 size={12} className="animate-spin" /> Kaydediliyor
                     </div>
                  )}
                  <div className="section-head">
                    <div>
                      <h2>{qIndex + 1}. Eşleştirme</h2>
                      {editMode ? (
                        <input 
                          type="text" 
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm mt-1 outline-none"
                          value={q.question}
                          onChange={(e) => updateQuestionState(q.id, { question: e.target.value })}
                          onBlur={() => saveQuestion(q)}
                          onFocus={(e) => setActiveInput(e.target)}
                        />
                      ) : (
                        <p>{renderFormattedText(q.question)}</p>
                      )}
                    </div>
                    {editMode ? (
                      <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-md border border-amber-200 shrink-0">
                        <input 
                          type="number" 
                          className="w-12 text-center text-sm font-bold bg-transparent outline-none text-amber-700" 
                          value={q.points || 0}
                          onChange={(e) => updateQuestionState(q.id, { points: parseInt(e.target.value) || 0 })}
                          onBlur={() => saveQuestion(q)}
                        /> <span className="text-amber-700 text-xs">puan</span>
                      </div>
                    ) : (
                      <span className="points shrink-0">{currentPoints} puan</span>
                    )}
                  </div>
                  
                  <div className="match-grid">
                    {q.pairs.map((pair: any, pIndex: number) => (
                      <div key={pIndex} className="match-row p-2 bg-slate-50 rounded-lg mb-2 flex items-center gap-2">
                        {editMode ? (
                          <>
                            <input 
                              type="text"
                              className="flex-1 bg-white border border-slate-200 rounded-md p-1.5 text-sm font-bold outline-none"
                              value={pair.word}
                              onChange={(e) => {
                                const newPairs = [...q.pairs];
                                newPairs[pIndex] = { ...newPairs[pIndex], word: e.target.value };
                                updateQuestionState(q.id, { pairs: newPairs });
                              }}
                              onBlur={() => saveQuestion(q)}
                              onFocus={(e) => setActiveInput(e.target)}
                            />
                            <span className="text-slate-400">➡️</span>
                            <select 
                              className="flex-1 bg-white border border-slate-200 rounded-md p-1.5 text-sm outline-none text-green-700 font-bold"
                              value={pair.match}
                              onChange={(e) => {
                                const newPairs = [...q.pairs];
                                newPairs[pIndex] = { ...newPairs[pIndex], match: e.target.value };
                                updateQuestionState(q.id, { pairs: newPairs });
                                saveQuestion({ ...q, pairs: newPairs });
                              }}
                            >
                              {q.options.map((opt: any) => (
                                <option key={opt.id} value={opt.id}>{opt.text}</option>
                              ))}
                            </select>
                          </>
                        ) : (
                          <>
                            <span className="match-word flex-1">{pair.word}</span>
                            <select className="flex-1">
                              <option>Seçiniz…</option>
                            </select>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {editMode && (
                    <div className="mt-4 p-3 bg-slate-100 rounded-lg">
                      <h4 className="text-xs font-bold text-slate-500 mb-2 uppercase">Havuzdaki Şıklar (Options)</h4>
                      {q.options.map((opt: any, oIndex: number) => (
                        <div key={opt.id} className="flex items-center gap-2 mb-1">
                          <span className="text-xs bg-slate-200 px-2 py-1 rounded text-slate-600 font-mono">{opt.id}</span>
                          <input 
                            type="text"
                            className="flex-1 bg-white border border-slate-200 rounded-md p-1 text-sm outline-none"
                            value={opt.text}
                            onChange={(e) => {
                              const newOpts = [...q.options];
                              newOpts[oIndex] = { ...newOpts[oIndex], text: e.target.value };
                              updateQuestionState(q.id, { options: newOpts });
                            }}
                            onBlur={() => saveQuestion(q)}
                            onFocus={(e) => setActiveInput(e.target)}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              );
            }

            if (q.type === "blank") {
              return (
                <section key={q.id} className="card relative">
                  {editMode && savingId === q.id && (
                     <div className="absolute top-2 right-2 text-green-500 flex items-center gap-1 text-xs font-bold bg-green-50 px-2 py-1 rounded-md">
                       <Loader2 size={12} className="animate-spin" /> Kaydediliyor
                     </div>
                  )}
                  <div className="section-head">
                    <h2>{qIndex + 1}. Boşluk Doldurma</h2>
                    {editMode ? (
                      <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-md border border-amber-200">
                        <input 
                          type="number" 
                          className="w-12 text-center text-sm font-bold bg-transparent outline-none text-amber-700" 
                          value={q.points || 0}
                          onChange={(e) => updateQuestionState(q.id, { points: parseInt(e.target.value) || 0 })}
                          onBlur={() => saveQuestion(q)}
                        /> <span className="text-amber-700 text-xs">puan</span>
                      </div>
                    ) : (
                      <span className="points">{currentPoints} puan</span>
                    )}
                  </div>
                  <div className="question">
                    <div className="blank-line flex flex-col gap-2">
                      {editMode ? (
                        <>
                          <div className="flex flex-col gap-1 w-full">
                            <label className="text-xs font-bold text-slate-500">Cümle (Boşluk yerine ___ koyun)</label>
                            <textarea 
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm outline-none"
                              value={q.sentence}
                              onChange={(e) => updateQuestionState(q.id, { sentence: e.target.value })}
                              onBlur={() => saveQuestion(q)}
                              onFocus={(e) => setActiveInput(e.target)}
                            />
                          </div>
                          
                          <div className="flex flex-col gap-1 w-full mt-2">
                            <label className="text-xs font-bold text-slate-500">Doğru Cevap (Kelime)</label>
                            <input 
                              type="text" 
                              className="w-full bg-green-50 border border-green-200 text-green-800 font-bold rounded-lg p-2 text-sm outline-none uppercase"
                              value={q.answers ? q.answers[q.id] : q.answer || ""}
                              onChange={(e) => {
                                if (q.answers) {
                                  updateQuestionState(q.id, { answers: { ...q.answers, [q.id]: e.target.value } });
                                } else {
                                  updateQuestionState(q.id, { answer: e.target.value });
                                }
                              }}
                              onBlur={() => saveQuestion(q)}
                              onFocus={(e) => setActiveInput(e.target)}
                            />
                          </div>

                          <div className="flex flex-col gap-1 w-full mt-2">
                            <label className="text-xs font-bold text-slate-500">İpucu (Türkçe karşılığı vs.)</label>
                            <input 
                              type="text" 
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm outline-none italic"
                              value={q.hint || ""}
                              onChange={(e) => updateQuestionState(q.id, { hint: e.target.value })}
                              onBlur={() => saveQuestion(q)}
                              onFocus={(e) => setActiveInput(e.target)}
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <div className="sentence"><span className="qno">{qIndex + 1}</span>{renderFormattedText(q.sentence)}</div>
                            <div className="hint">{q.hint}</div>
                          </div>
                          <input 
                            className="text-input answer-input focus:bg-indigo-50" 
                            type="text" 
                            placeholder={q.answers ? q.answers[q.id] : (q.answer || "Bulgarca yazınız")}
                            onFocus={(e) => {
                              setActiveInput(e.target);
                              setKeyboardOpen(true);
                            }}
                          />
                        </>
                      )}
                    </div>
                  </div>
                </section>
              );
            }

            if (q.type === "reading") {
              return (
                <section key={q.id} className="card relative">
                  {editMode && savingId === q.id && (
                     <div className="absolute top-2 right-2 text-green-500 flex items-center gap-1 text-xs font-bold bg-green-50 px-2 py-1 rounded-md">
                       <Loader2 size={12} className="animate-spin" /> Kaydediliyor
                     </div>
                  )}
                  <div className="section-head">
                    <div>
                      <h2>{qIndex + 1}. Okuma Parçası (Boşluk Doldurma)</h2>
                      {q.trHint && (
                        editMode ? (
                          <div className="flex flex-col gap-1 w-full mt-2">
                            <label className="text-xs font-bold text-slate-500">Parçanın Türkçe Çevirisi (Sınav Sonu Gösterilir)</label>
                            <textarea 
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm outline-none"
                              value={q.trHint}
                              rows={2}
                              onChange={(e) => updateQuestionState(q.id, { trHint: e.target.value })}
                              onBlur={() => saveQuestion(q)}
                              onFocus={(e) => setActiveInput(e.target)}
                            />
                          </div>
                        ) : (
                          <div className="mt-2 p-2 bg-indigo-50/50 border border-indigo-100 border-dashed rounded text-xs text-indigo-400">
                            <strong>Sınav bitiminde görünecek çeviri:</strong> {q.trHint}
                          </div>
                        )
                      )}
                    </div>
                    {editMode ? (
                      <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-md border border-amber-200">
                        <input 
                          type="number" 
                          className="w-12 text-center text-sm font-bold bg-transparent outline-none text-amber-700" 
                          value={q.points || 0}
                          onChange={(e) => updateQuestionState(q.id, { points: parseInt(e.target.value) || 0 })}
                          onBlur={() => saveQuestion(q)}
                        /> <span className="text-amber-700 text-xs">puan</span>
                      </div>
                    ) : (
                      <span className="points">{currentPoints} puan</span>
                    )}
                  </div>
                  <div className="question p-6 bg-slate-50 border border-slate-200 rounded-2xl">
                    <div className="reading-text relative leading-loose">
                      {editMode ? (
                        <div className="flex flex-col gap-4 w-full">
                          <textarea 
                            className="w-full bg-white border border-slate-200 rounded-lg p-3 text-sm outline-none font-mono"
                            rows={5}
                            value={q.text}
                            onChange={(e) => updateQuestionState(q.id, { text: e.target.value })}
                            onBlur={() => saveQuestion(q)}
                            onFocus={(e) => setActiveInput(e.target)}
                          />
                          <div className="bg-slate-100 p-3 rounded-lg">
                            <h4 className="text-xs font-bold text-slate-500 mb-2 uppercase">Doğru Cevaplar</h4>
                            {Object.keys(q.answers || {}).map((blankKey) => (
                              <div key={blankKey} className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-bold text-slate-500 w-8">{blankKey}.</span>
                                <input 
                                  type="text" 
                                  className="flex-1 bg-white border border-slate-200 rounded-lg p-2 text-sm outline-none font-bold"
                                  value={q.answers[blankKey]}
                                  onChange={(e) => {
                                    const newAnswers = { ...q.answers, [blankKey]: e.target.value };
                                    updateQuestionState(q.id, { answers: newAnswers });
                                  }}
                                  onBlur={() => saveQuestion(q)}
                                  onFocus={(e) => setActiveInput(e.target)}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        renderReadingText(q.text)
                      )}
                    </div>
                  </div>
                </section>
              );
            }
            return null;
          })}
        </form>
      </div>

      {/* Keyboard */}
      {editMode && (
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
