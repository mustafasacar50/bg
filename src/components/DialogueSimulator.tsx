"use client";
import React, { useState, useEffect, useRef } from 'react';

interface DialogueSimulatorProps {
  question: any;
  onCheck: (isCorrect: boolean, feedback: 'correct' | 'wrong' | 'typo', userInput: string) => void;
  onNext: () => void;
  moduleDescription?: string;
}

export default function DialogueSimulator({ question, onCheck, onNext, moduleDescription }: DialogueSimulatorProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isHintActive, setIsHintActive] = useState(false);
  const [playerTurn, setPlayerTurn] = useState(false);
  const [inputText, setInputText] = useState('');
  const topRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  const speakerName = question.speaker || 'Bot';
  const isPlayerFirst = speakerName.toLowerCase() === 'siz' || question.sentence === '...';

  // Sorunun id'si değiştiğinde, GEÇMİŞ MESAJLARI SİLMEDEN yeni soruyu başlat
  useEffect(() => {
    setIsCompleted(false);
    setIsTyping(false);
    setPlayerTurn(false);
    setInputText('');
    isFirstRender.current = true;

    // Sayfa başı görünsün (Senaryo bağlamı)
    setTimeout(() => {
       topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);

    let timeoutId: NodeJS.Timeout;

    if (isPlayerFirst) {
      // Eğer ilk konuşan oyuncu ise (Siz), doğrudan şıkları/yazı alanını göster
      setPlayerTurn(true);
    } else {
      // Değilse, karşı tarafın mesajını yazıyor gibi göster
      setIsTyping(true);
      timeoutId = setTimeout(() => {
        setIsTyping(false);
        // Önceki mesajların SONUNA ekle (Devamlılık)
        setMessages(prev => [...prev, { speaker: 'bot', text: question.sentence, hint: question.explanation }]);
        setPlayerTurn(true);
      }, 1200);
    }

    return () => clearTimeout(timeoutId);
  }, [question.id]);

  useEffect(() => {
    if (isFirstRender.current && messages.length === 0 && !playerTurn && !isTyping) {
        return; 
    }
    isFirstRender.current = false;
    setTimeout(() => {
       bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 150);
  }, [messages, isTyping, playerTurn]);

  // Özel Klavye Dinleyicisi (Space ile Çeviriyi Aç/Kapat)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Kullanıcı yazı yazıyorsa engelleme
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') {
        return; 
      }
      
      if (e.code === 'Space') {
        e.preventDefault(); // Sayfayı aşağı kaydırmayı engelle
        setIsHintActive(prev => !prev);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleOptionClick = (optionText: string) => {
    if (!playerTurn || isCompleted) return;
    
    setPlayerTurn(false);
    
    // Doğru cevap kontrolü (küçük/büyük harf ve noktalama toleransı uygulanabilir)
    const normalizedInput = optionText.trim().toLowerCase().replace(/[.,!?]/g, '');
    const normalizedAnswer = (question.answer || '').trim().toLowerCase().replace(/[.,!?]/g, '');
    const isCorrect = normalizedInput === normalizedAnswer;

    if (isCorrect) {
      // Doğruysa mavi balon ekle ve bitir
      setMessages(prev => [...prev, { speaker: 'player', text: optionText }]);
      setIsCompleted(true);
      setTimeout(() => {
        onCheck(true, 'correct', optionText);
        setTimeout(() => {
          if (onNext) onNext();
        }, 1500);
      }, 800);
    } else {
      // Yanlışsa kırmızı balon (isError: true) ile ekle
      setMessages(prev => [...prev, { speaker: 'player', text: optionText, isError: true }]);
      
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        onCheck(false, 'wrong', optionText);
        
        // 1.5 saniye sonra YANLIŞ CEVABI GEÇMİŞTEN SİL ve tekrar sıra oyuncuya geçsin
        setTimeout(() => {
          setMessages(prev => prev.filter(m => !m.isError));
          setPlayerTurn(true);
        }, 1500);
      }, 1000);
    }
  };

  const handleTextSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    handleOptionClick(inputText.trim());
  };

  return (
    <div className="flex flex-col h-auto min-h-[300px] bg-slate-50 rounded-xl border border-slate-200 shadow-inner overflow-hidden relative animate-fade-in">
      <div ref={topRef} />
      <div className="bg-white px-4 py-3 border-b border-slate-200 flex items-center gap-3 shadow-sm z-10">
        <div className="text-2xl">👤</div>
        <div>
          <h3 className="font-bold text-slate-800 text-sm">{isPlayerFirst ? 'Sıra Sende' : speakerName}</h3>
          <p className="text-xs text-emerald-500 font-medium">Çevrimiçi</p>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-4">
        {moduleDescription && (
          <div className="bg-slate-100 border border-slate-200 rounded-xl p-3 flex items-start gap-3 shadow-sm">
            <span className="text-xl">🎬</span>
            <div>
               <p className="text-[10px] uppercase font-bold text-slate-500 mb-0.5">Senaryo Bağlamı</p>
               <p className="text-xs text-slate-700 font-medium">{moduleDescription}</p>
            </div>
          </div>
        )}

        <div className="text-center">
            <span className="bg-indigo-100 text-indigo-800 text-[10px] uppercase font-bold px-3 py-1 rounded-full shadow-sm">
                Diyalog Simülasyonu
            </span>
        </div>

        {messages.map((msg, idx) => {
          const isBot = msg.speaker === 'bot';
          // Yanlış mesaj ise kırmızı (bg-rose-500), doğru oyuncu mesajı ise mavi (bg-indigo-500)
          const bubbleColor = isBot 
             ? 'bg-white border border-slate-200 text-slate-800 rounded-tl-none' 
             : msg.isError 
                ? 'bg-rose-500 text-white rounded-tr-none animate-pulse'
                : 'bg-indigo-500 text-white rounded-tr-none';

          return (
            <div key={idx} className={`flex w-full ${isBot ? 'justify-start' : 'justify-end'} ${msg.isError ? 'transition-all duration-300' : ''}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2 shadow-sm ${bubbleColor}`}>
                <p className="text-sm font-medium">{msg.text}</p>
                {/* Botun söylediği cümlede ipucu varsa (Space basılınca göster) */}
                {isBot && msg.hint && (
                  <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isHintActive ? 'max-h-20 opacity-100 mt-1 border-t border-slate-100 pt-1' : 'max-h-0 opacity-0 mt-0 border-transparent pt-0'}`}>
                    <p className="text-[11px] text-slate-500 italic">{msg.hint}</p>
                  </div>
                )}
                {/* Yanlış cevap uyarısı */}
                {!isBot && msg.isError && (
                  <div className="mt-1 pt-1 border-t border-rose-400">
                    <p className="text-[10px] font-bold text-rose-100">❌ Bu cevap senaryoya uymadı. Geri sarılıyor...</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex gap-1">
              <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
          </div>
        )}
        
      </div>

      {playerTurn && (
        <div className="bg-white border-t border-slate-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10 animate-fade-in-up">
          {question.explanation && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl shadow-sm">
              <p className="text-xs font-bold text-amber-800 uppercase tracking-wide flex items-center gap-1.5 mb-1">
                <span>🎯</span> Senaryo Görevi
              </p>
              <p className="text-sm font-medium text-amber-900 leading-snug">{question.explanation}</p>
            </div>
          )}
          <p className="text-xs text-slate-500 mb-3 text-center font-medium">Bu duruma nasıl cevap verirsin?</p>
          
          {question.options && question.options.length > 0 ? (
            <div className="flex flex-col gap-2">
              {question.options.map((opt: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => handleOptionClick(opt)}
                  className="w-full text-left bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-xl p-3 transition-all duration-200 group relative overflow-hidden"
                >
                  <div className="flex flex-col relative z-10">
                      <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-slate-700 group-hover:text-indigo-700">{opt}</span>
                          <span className="text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">➔</span>
                      </div>
                      {/* Çeviri Gösterimi (optionsTr varsa onu, yoksa sadece doğru şıkta hint'i kullan) */}
                      {((question.hint && opt === question.answer) || (question.optionsTr && question.optionsTr[idx])) && (
                          <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isHintActive ? 'max-h-20 opacity-100 mt-1' : 'max-h-0 opacity-0 mt-0'}`}>
                              <span className="text-xs text-indigo-500/80 italic font-medium">
                                TR: {question.optionsTr && question.optionsTr[idx] ? question.optionsTr[idx] : question.hint}
                              </span>
                          </div>
                      )}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <form onSubmit={handleTextSubmit} className="flex gap-2 mt-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Cevabınızı buraya yazın..."
                className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isCompleted}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Gönder
              </button>
            </form>
          )}
        </div>
      )}

      {/* Floating Translate Toggle Button */}
      <button 
        onClick={() => setIsHintActive(prev => !prev)}
        className={`absolute top-4 right-4 z-50 transition-all duration-300 flex items-center gap-2 px-3 py-2 rounded-full shadow-md border text-xs font-bold hover:scale-105 active:scale-95 cursor-pointer ${
          isHintActive 
          ? 'bg-amber-100 border-amber-300 text-amber-700 shadow-amber-200/50' 
          : 'bg-white/90 border-slate-200 text-slate-500 backdrop-blur-sm'
        }`}
      >
        <span className="text-base">{isHintActive ? '👁️' : '👁️‍🗨️'}</span>
        <span className="hidden sm:inline">{isHintActive ? 'Çeviriyi Kapat' : 'Çeviriyi Aç'}</span>
        <span className="sm:hidden">{isHintActive ? 'Kapat' : 'Çevir'}</span>
      </button>

      <div ref={bottomRef} className="h-4" />
    </div>
  );
}
