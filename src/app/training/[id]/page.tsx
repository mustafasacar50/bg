'use client';

import { useState, useEffect, useRef, Suspense, use, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { RefreshCw } from 'lucide-react';

interface Question {
  id: string;
  type: string;
  sentence: string;
  answer: string;
  hint: string;
  explanation?: string;
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
  const [showExplanation, setShowExplanation] = useState(false);
  
  const [isEditingQuestion, setIsEditingQuestion] = useState(false);
  const [editForm, setEditForm] = useState({ sentence: '', answer: '', hint: '', explanation: '' });
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [focusedEditField, setFocusedEditField] = useState<string | null>(null);

  // New features state
  const [flashcardMode, setFlashcardMode] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [matchingPairs, setMatchingPairs] = useState<{bg: any[], tr: any[]}>({bg: [], tr: []});
  const [matchedIds, setMatchedIds] = useState<number[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<{type: 'bg'|'tr', idx: number, id: number} | null>(null);

  const mode = searchParams.get('mode') || 'all'; 

  const [student, setStudent] = useState<any>(null);
  const [data, setData] = useState<ModuleData | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeQuestion, setActiveQuestion] = useState<{ id: string, type?: string, display: string, displayParts?: { trText: string | null, bgText: string | null }, expected: string, fitbTarget: string | null, hint: string, explanation?: string } | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  
  // Scramble states
  const [scrambleWords, setScrambleWords] = useState<string[]>([]);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  
  const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong' | 'typo'>('none');
  const [score, setScore] = useState(0);
  
  // New State
  const [sessionQuestions, setSessionQuestions] = useState<Question[]>([]);
  const [mistakesPool, setMistakesPool] = useState<string[]>([]);
  const [isSwapped, setIsSwapped] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [langFilter, setLangFilter] = useState<'all' | 'bg' | 'tr'>('all');
  
  // Keyboard State
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [layout, setLayout] = useState<LayoutType>('bg');
  const [isCaps, setIsCaps] = useState(false);
  const [preferNativeKeyboard, setPreferNativeKeyboard] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  
  // Admin Mode State
  const [adminMode, setAdminMode] = useState(false);

  // 1. Initialize Student & Score
  useEffect(() => {
    try {
      const storedStudent = JSON.parse(localStorage.getItem('student_session') || 'null');
      if (!storedStudent) {
        router.push('/');
        return;
      }
      setStudent(storedStudent);
      if (storedStudent.role === 'admin') {
        setAdminMode(true);
      }
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
    
    // Sadece soru değiştiyse veya swap yapıldıysa state'i sıfırla
    if (activeQuestion && activeQuestion.id === q.id && !isSwapped) {
       return;
    }
    
    let expected = q.answer;
    let hint = q.hint;
    let rawSentence = q.sentence;
    
    if (isSwapped) {
      const match = q.sentence.match(/:\s*(.*)\)/);
      if (match) {
        if (q.sentence.includes('İlgili formu')) {
          rawSentence = `(Bulgarca: ${q.answer})`;
          expected = match[1].trim();
          hint = 'Diğer formu yazınız';
        } else {
          rawSentence = `(${q.sentence.includes('Türkçesi:') ? 'Bulgarcası' : 'Türkçesi'}: ${q.answer})`;
          expected = match[1].trim();
          hint = q.sentence.includes('Türkçesi:') ? 'Bulgarca karşılığını yazınız' : 'Türkçe karşılığını yazınız';
        }
      } else {
         if (q.sentence.includes('Kelimeleri sıraya dizerek cümleyi kurunuz:')) {
            rawSentence = q.answer;
            expected = q.sentence.replace(/Kelimeleri sıraya dizerek cümleyi kurunuz:\s*/i, '').trim();
         } else {
            // Fallback if no match
            rawSentence = q.answer;
            expected = q.sentence;
         }
      }
    }

    // Clean up prefixes
    let cleanSentence = rawSentence;
    const trMatch = cleanSentence.match(/Çeviriniz\s*\(Türkçesi:\s*(.*)\)/i);
    const bgMatch = cleanSentence.match(/Çeviriniz\s*\(Bulgarcası:\s*(.*)\)/i);
    if (trMatch) cleanSentence = trMatch[1];
    else if (bgMatch) cleanSentence = bgMatch[1];
    else {
       cleanSentence = cleanSentence.replace(/^\(Türkçesi:\s*/i, '').replace(/^\(Bulgarcası:\s*/i, '').replace(/\)$/, '');
    }
    cleanSentence = cleanSentence.replace(/Kelimeleri sıraya dizerek cümleyi kurunuz:\s*/i, '');

    let fitbTarget = null;
    const words = expected.split(' ').filter(w => w.trim());
    let maskedWords: string[] | null = null;
    if (q.type === 'matching') {
      const bgItems = q.pairs.map((p: any, i: number) => ({ id: i, text: p.bg })).sort(() => Math.random() - 0.5);
      const trItems = q.pairs.map((p: any, i: number) => ({ id: i, text: p.tr })).sort(() => Math.random() - 0.5);
      setMatchingPairs({ bg: bgItems, tr: trItems });
      setMatchedIds([]);
      setSelectedMatch(null);
    }

    if (words.length > 1 && q.type !== 'scramble' && q.type !== 'error_correction' && q.type !== 'matching') {
       const targetIdx = Math.floor(Math.random() * words.length);
       const targetWordRaw = words[targetIdx];
       
       const punctuationMatch = targetWordRaw.match(/[.,!?]+$/);
       const punctuation = punctuationMatch ? punctuationMatch[0] : '';
       fitbTarget = targetWordRaw.replace(/[.,!?]+$/, '');
       
       maskedWords = [...words];
       maskedWords[targetIdx] = `_____${punctuation}`;
    }
    
    if (q.type === 'scramble') {
      const shuffle = (array: string[]) => [...array].sort(() => 0.5 - Math.random());
      setScrambleWords(shuffle(words));
      setSelectedWords([]);
    }
    
    const isExpectedBg = hint.toLowerCase().includes('bulgarca');
    setLayout(isExpectedBg ? 'bg' : 'tr');
    
    // Build displayParts for rendering colored parts
    const displayParts = {
      trText: isExpectedBg ? cleanSentence : (maskedWords ? maskedWords.join(' ') : null),
      bgText: isExpectedBg ? (maskedWords ? maskedWords.join(' ') : null) : cleanSentence,
    };
    
    setActiveQuestion({ 
      id: q.id, 
      type: q.type, 
      display: cleanSentence, // fallback for scrambling
      displayParts,
      expected, 
      fitbTarget, 
      hint: '', // User requested to remove the hint row entirely from display
      explanation: (q as any).explanation 
    });
    
    setFeedback('none');
    setUserAnswer('');
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, isSwapped, filteredQuestions]);


  const pendingUpdates = useRef<any>({});
  const syncTimeout = useRef<NodeJS.Timeout | null>(null);

  const syncProgress = (updates: any) => {
    if (!student) return;
    
    pendingUpdates.current = { ...pendingUpdates.current, ...updates };
    
    if (syncTimeout.current) clearTimeout(syncTimeout.current);
    
    syncTimeout.current = setTimeout(() => {
      const mergedUpdates = { ...pendingUpdates.current };
      pendingUpdates.current = {};
      
      fetch('/api/training-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: student.id,
          moduleId,
          ...mergedUpdates
        })
      }).catch(e => console.error('Failed to sync training progress', e));
    }, 500);
  };

  const handleMatchSelect = (type: 'bg' | 'tr', idx: number, id: number) => {
    if (matchedIds.includes(id)) return;
    
    if (!selectedMatch) {
      setSelectedMatch({ type, idx, id });
    } else {
      if (selectedMatch.type === type) {
        setSelectedMatch({ type, idx, id });
      } else {
        if (selectedMatch.id === id) {
           const newMatchedIds = [...matchedIds, id];
           setMatchedIds(newMatchedIds);
           setSelectedMatch(null);
           if (newMatchedIds.length === activeQuestion.pairs.length) {
              setFeedback('correct');
           }
        } else {
           setSelectedMatch(null);
           if (navigator.vibrate) navigator.vibrate(50);
        }
      }
    }
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

  // Auto-resize textarea when value changes externally (admin mode, wrong feedback, etc.)
  useEffect(() => {
    if (inputRef.current) {
      const el = inputRef.current as HTMLTextAreaElement;
      el.style.height = 'auto';
      el.style.height = el.scrollHeight + 'px';
    }
  }, [activeQuestion, adminMode, feedback, userAnswer, selectedWords]);

  const saveMistakes = (newPool: string[]) => {
    setMistakesPool(newPool);
    syncProgress({ mistakes: newPool });
  };

  const pendingMistakeRemove = useRef<string | null>(null);
  const lastCheckTime = useRef(0);

  const handleEditSave = async () => {
    if (!activeQuestion) return;
    setIsSavingEdit(true);
    
    try {
      const res = await fetch(`/api/modules/${moduleId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          questionId: activeQuestion.id,
          updatedData: editForm
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Update local state
      setSessionQuestions((prev: Question[]) => prev.map((q: Question) => q.id === activeQuestion.id ? { ...q, ...editForm } : q));
      setIsEditingQuestion(false);
    } catch (err) {
      console.error('Error saving question:', err);
      alert('Soru güncellenirken hata oluştu!');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDeleteQuestion = async () => {
    if (!activeQuestion) return;
    if (!confirm('Bu soruyu kalıcı olarak silmek istediğinize emin misiniz?')) return;
    
    setIsSavingEdit(true);
    try {
      const res = await fetch(`/api/modules/${moduleId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          questionId: activeQuestion.id
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Update local state
      setSessionQuestions((prev: Question[]) => prev.filter((q: Question) => q.id !== activeQuestion.id));
      setIsEditingQuestion(false);
      setFeedback('none');
      setUserAnswer('');
    } catch (err) {
      console.error('Error deleting question:', err);
      alert('Soru silinirken hata oluştu!');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleCheck = () => {
    if (!activeQuestion) return;
    lastCheckTime.current = Date.now();
    
    const expectedStr = activeQuestion.fitbTarget || activeQuestion.expected;
    
    let currentAnswer = userAnswer;
    if (activeQuestion.type === 'scramble') {
      currentAnswer = selectedWords.join(' ');
    }
    
    const normalizeString = (str: string) => {
      return str.trim()
        .replace(/I/g, 'ı')
        .replace(/İ/g, 'i')
        .toLowerCase()
        .replace(/ı/g, 'i');
    };
    
    const normalizedUser = normalizeString(currentAnswer);
    const normalizedAnswer = normalizeString(expectedStr);
    
    if (normalizedUser === normalizedAnswer) {
      setFeedback('correct');
      if (mistakesPool.includes(activeQuestion.id)) {
        pendingMistakeRemove.current = activeQuestion.id;
        syncScore(1); 
      } else if (mode === 'all') {
        syncScore(1); 
      }
    } else {
      const dist = levenshteinDistance(normalizedUser, normalizedAnswer);
      let isTypo = dist <= 1 || (normalizedAnswer.length > 4 && dist <= 2);
      
      if (activeQuestion.type === 'scramble') {
        const userW = normalizedUser.split(' ');
        const expectedW = normalizedAnswer.split(' ');
        let diffCount = 0;
        for (let i = 0; i < Math.max(userW.length, expectedW.length); i++) {
           if (userW[i] !== expectedW[i]) diffCount++;
        }
        isTypo = diffCount > 0 && diffCount <= 2;
      }
      
      if (isTypo) {
        setFeedback('typo');
        if (mistakesPool.includes(activeQuestion.id)) {
           syncScore(0.5); // reduced points for typo
        } else if (mode === 'all') {
           syncScore(0.5);
        }
      } else {
        setFeedback('wrong');
        
        // SRS: Insert question again 3 steps later
        const qOriginal = filteredQuestions[currentIndex];
        if (qOriginal && mode === 'all') {
           setSessionQuestions(prev => {
             const next = [...prev];
             const originalIndex = next.findIndex(q => q.id === qOriginal.id);
             if (originalIndex !== -1) {
                const insertIdx = Math.min(currentIndex + 4, next.length);
                // Duplicate it for spaced repetition
                next.splice(insertIdx, 0, { ...qOriginal, id: qOriginal.id + '_retry_' + Date.now() });
             }
             return next;
           });
        }
        
        if (!mistakesPool.includes(activeQuestion.id) && !activeQuestion.id.includes('_retry_')) {
          saveMistakes([...mistakesPool, activeQuestion.id]);
          syncScore(-0.2); 
        }
      }
    }
  };

  const speakText = (text: string) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'bg-BG';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSkip = () => {
    if (!activeQuestion) return;
    setFeedback('wrong');
    
    // SRS: Insert question again 3 steps later
    const qOriginal = filteredQuestions[currentIndex];
    if (qOriginal && mode === 'all') {
       setSessionQuestions(prev => {
         const next = [...prev];
         const insertIdx = Math.min(currentIndex + 4, next.length);
         next.splice(insertIdx, 0, { ...qOriginal, id: qOriginal.id + '_retry_' + Date.now() });
         return next;
       });
    }
    
    if (!mistakesPool.includes(activeQuestion.id) && !activeQuestion.id.includes('_retry_')) {
      saveMistakes([...mistakesPool, activeQuestion.id]);
    }
  };

  const handleNext = () => {
    if (Date.now() - lastCheckTime.current < 800) return; // Prevent double-click or enter-hold auto-advance
    if (!activeQuestion) return;
    
    if (pendingMistakeRemove.current) {
      saveMistakes(mistakesPool.filter(id => id !== pendingMistakeRemove.current));
      pendingMistakeRemove.current = null;
    }
    
    setUserAnswer('');
    setFeedback('none');
    setIsSwapped(false);
    setIsFlipped(false);
    setSelectedMatch(null);
    setMatchedIds([]);
    
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

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentIndex(prev => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setCurrentIndex(prev => Math.min(filteredQuestions.length - 1, prev + 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (feedback === 'none') {
          if (userAnswer.trim()) handleCheck();
        } else {
          handleNext();
        }
      } else if (e.key === ' ') {
        e.preventDefault();
        if (feedback === 'none') {
          handleSkip();
        } else {
          handleNext();
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [filteredQuestions.length, feedback, activeQuestion, mistakesPool, mode, searchQuery, sessionQuestions]);

  const editRefs = useRef<Record<string, HTMLTextAreaElement | null>>({
    sentence: null, answer: null, hint: null, explanation: null
  });

  // Keyboard Functions
  const insertText = (text: string) => {
    const input = (isEditingQuestion && focusedEditField) ? editRefs.current[focusedEditField] : inputRef.current;
    if (!input) return;
    
    const start = input.selectionStart ?? 0;
    const end = input.selectionEnd ?? 0;
    
    if (isEditingQuestion && focusedEditField) {
      const current = (editForm as any)[focusedEditField] || '';
      const nextValue = current.slice(0, start) + text + current.slice(end);
      setEditForm(prev => ({ ...prev, [focusedEditField]: nextValue }));
    } else {
      const current = userAnswer;
      const nextValue = current.slice(0, start) + text + current.slice(end);
      setUserAnswer(nextValue);
    }
    
    setTimeout(() => {
      input.focus();
      input.setSelectionRange(start + text.length, start + text.length);
    }, 0);
  };

  const backspace = () => {
    const input = (isEditingQuestion && focusedEditField) ? editRefs.current[focusedEditField] : inputRef.current;
    if (!input) return;
    
    const start = input.selectionStart ?? 0;
    const end = input.selectionEnd ?? 0;
    
    const current = (isEditingQuestion && focusedEditField) ? ((editForm as any)[focusedEditField] || '') : userAnswer;
    
    if (start === end && start > 0) {
      const nextValue = current.slice(0, start - 1) + current.slice(end);
      if (isEditingQuestion && focusedEditField) setEditForm(prev => ({ ...prev, [focusedEditField]: nextValue }));
      else setUserAnswer(nextValue);
      
      setTimeout(() => {
        input.focus();
        input.setSelectionRange(start - 1, start - 1);
      }, 0);
    } else if (start !== end) {
      const nextValue = current.slice(0, start) + current.slice(end);
      if (isEditingQuestion && focusedEditField) setEditForm(prev => ({ ...prev, [focusedEditField]: nextValue }));
      else setUserAnswer(nextValue);
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
    <div className="min-h-screen bg-slate-50 flex flex-col pb-36 sm:pb-24">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-2 py-2 sm:px-4 sm:py-3 flex flex-col items-center sticky top-0 z-10 gap-2">
        
        {/* Top Row: Close, Search, Language */}
        <div className="flex w-full items-center justify-between gap-1 flex-wrap sm:flex-nowrap">
          <div className="flex items-center flex-1 min-w-0">
            <button onClick={() => router.push('/training')} className="text-slate-400 hover:text-slate-600 mr-1 sm:mr-2 flex-shrink-0 text-xl">
              ✕
            </button>
            
            {(student?.role === 'admin' || student?.isAdminMode || student?.username === 'mustafasacar') && (
              <label className="flex items-center gap-1.5 cursor-pointer mr-2 bg-slate-100 px-2 py-1 rounded-full border border-slate-200">
                <div className="relative">
                  <input type="checkbox" className="sr-only" checked={adminMode} onChange={(e) => { setAdminMode(e.target.checked); setFeedback('none'); setUserAnswer(''); setKeyboardOpen(false); }} />
                  <div className={`block w-6 h-3 rounded-full transition-colors ${adminMode ? 'bg-indigo-500' : 'bg-slate-300'}`}></div>
                  <div className={`dot absolute left-0.5 top-[2px] bg-white w-2 h-2 rounded-full transition-transform ${adminMode ? 'translate-x-3' : ''}`}></div>
                </div>
                <span className="text-[10px] font-bold text-slate-500 select-none">Admin</span>
              </label>
            )}
            
            {/* Search Input */}
            <div className="relative flex-1 min-w-0 max-w-[200px]">
              <input 
                type="text" 
                placeholder="🔍 Ara..." 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentIndex(0);
                }}
                className="w-full bg-slate-100 border-none rounded-full px-3 py-1 text-xs outline-none focus:ring-2 focus:ring-indigo-500 min-w-0"
              />
            </div>
          </div>
          
          {/* Language Filter */}
          <div className="flex bg-slate-100 rounded-full p-0.5 border border-slate-200 flex-shrink-0">
            <button
              onClick={() => { setLangFilter('all'); setCurrentIndex(0); }}
              className={`px-2 py-0.5 text-sm sm:text-base rounded-full transition-colors ${langFilter === 'all' ? 'bg-white shadow-sm grayscale-0' : 'grayscale opacity-50 hover:opacity-100 hover:grayscale-0'}`}
              title="Tümü"
            >
              🌐
            </button>
            <button
              onClick={() => { setLangFilter('bg'); setCurrentIndex(0); }}
              className={`px-2 py-0.5 text-sm sm:text-base rounded-full transition-colors ${langFilter === 'bg' ? 'bg-white shadow-sm grayscale-0' : 'grayscale opacity-50 hover:opacity-100 hover:grayscale-0'}`}
              title="Bulgarca"
            >
              🇧🇬
            </button>
            <button
              onClick={() => { setLangFilter('tr'); setCurrentIndex(0); }}
              className={`px-2 py-0.5 text-sm sm:text-base rounded-full transition-colors ${langFilter === 'tr' ? 'bg-white shadow-sm grayscale-0' : 'grayscale opacity-50 hover:opacity-100 hover:grayscale-0'}`}
              title="Türkçe"
            >
              🇹🇷
            </button>
          </div>
        </div>
        
        {/* Bottom Row: Slider, Random, Score */}
        <div className="flex flex-wrap sm:flex-nowrap w-full items-center justify-between gap-3 sm:gap-4">
          
          <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-2 flex-shrink-0 order-1 sm:order-2">
            {(!isEditingQuestion && adminMode) && (
              <button 
                onClick={() => {
                  const rawQ = filteredQuestions[currentIndex];
                  setEditForm({
                    sentence: rawQ.sentence,
                    answer: rawQ.answer,
                    hint: rawQ.hint,
                    explanation: rawQ.explanation || ''
                  });
                  setIsEditingQuestion(true);
                  setFeedback('none');
                }}
                className="flex items-center justify-center p-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg transition-colors shadow-sm border border-indigo-100"
                title="Düzenle"
              >
                ✏️
              </button>
            )}

            {!isEditingQuestion && (
              <button 
                onClick={handleSwap}
                className="flex items-center justify-center p-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg transition-colors shadow-sm border border-amber-100"
                title="Soruyu ters çevir (Bulgarca <-> Türkçe)"
              >
                <RefreshCw size={20} className={isSwapped ? 'rotate-180 transition-transform duration-500' : 'transition-transform duration-500'} />
              </button>
            )}

            <button
              onClick={() => {
                const shuffled = [...filteredQuestions].sort(() => Math.random() - 0.5);
                setSessionQuestions(shuffled);
                setCurrentIndex(0);
                setFeedback('none');
                setUserAnswer('');
              }}
              className="p-1.5 bg-slate-100 text-slate-500 hover:bg-indigo-100 hover:text-indigo-600 rounded-lg transition-colors shadow-sm border border-slate-200 flex items-center justify-center"
              title="Soruları Karıştır"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
            </button>
            <div className="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg font-black text-sm border border-indigo-100 shadow-sm whitespace-nowrap">
              Puan: {score.toFixed(1)}
            </div>
          </div>

          {/* Interactive Progress Slider */}
          {!isFinished && !isSearchEmpty && filteredQuestions.length > 0 ? (
            <div className="w-full sm:w-auto sm:flex-1 flex items-center gap-2 order-2 sm:order-1">
              <button 
                onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                disabled={currentIndex === 0}
                className="text-slate-400 font-black text-xl hover:text-indigo-600 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors px-2"
                title="Önceki Soru"
              >
                ◀
              </button>
              
              <div className="flex-1 flex items-center">
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
                  className="w-full h-3 sm:h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              <button 
                onClick={() => setCurrentIndex(Math.min(filteredQuestions.length - 1, currentIndex + 1))}
                disabled={currentIndex >= filteredQuestions.length - 1}
                className="text-slate-400 font-black text-xl hover:text-indigo-600 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors px-2"
                title="Sonraki Soru"
              >
                ▶
              </button>
              
              <span className="text-xs font-bold text-slate-500 whitespace-nowrap w-[50px] text-right">
                {currentIndex + 1} / {filteredQuestions.length}
              </span>
            </div>
          ) : (
            <div className="hidden sm:block flex-1 order-2 sm:order-1"></div>
          )}

        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-6 sm:py-8 pb-48 flex flex-col relative z-0">
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
          <div className="flex-1 flex flex-col mt-2 sm:mt-4">
            {/* Space recovered from removed button row */}

            {isEditingQuestion ? (
              <div className="bg-white rounded-xl shadow-sm border-2 border-indigo-100 p-4 sm:p-6 mb-4 sm:mb-8 flex flex-col gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Soru Cümlesi (Sentence)</label>
                  <textarea ref={el => { editRefs.current['sentence'] = el; }} onFocus={() => { setFocusedEditField('sentence'); setLayout('tr'); setKeyboardOpen(true); }} value={editForm.sentence} onChange={e => setEditForm({...editForm, sentence: e.target.value})} className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all resize-y" rows={2} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Cevap (Answer)</label>
                  <textarea ref={el => { editRefs.current['answer'] = el; }} onFocus={() => { setFocusedEditField('answer'); setLayout('bg'); setKeyboardOpen(true); }} value={editForm.answer} onChange={e => setEditForm({...editForm, answer: e.target.value})} className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all resize-y" rows={2} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">İpucu (Hint)</label>
                  <textarea ref={el => { editRefs.current['hint'] = el; }} onFocus={() => { setFocusedEditField('hint'); setLayout('tr'); setKeyboardOpen(true); }} value={editForm.hint} onChange={e => setEditForm({...editForm, hint: e.target.value})} className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all resize-y" rows={2} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Açıklama (Explanation)</label>
                  <textarea ref={el => { editRefs.current['explanation'] = el; }} onFocus={() => { setFocusedEditField('explanation'); setLayout('tr'); setKeyboardOpen(true); }} value={editForm.explanation || ''} onChange={e => setEditForm({...editForm, explanation: e.target.value})} className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all resize-y" rows={2} />
                </div>
                <div className="flex gap-2 mt-2">
                  <button disabled={isSavingEdit} onClick={handleEditSave} className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                    {isSavingEdit ? 'Kaydediliyor...' : 'Kaydet'}
                  </button>
                  <button disabled={isSavingEdit} onClick={() => setIsEditingQuestion(false)} className="px-6 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-lg hover:bg-slate-200 disabled:opacity-50 transition-colors">
                    İptal
                  </button>
                  <div className="flex-1"></div>
                  <button disabled={isSavingEdit} onClick={handleDeleteQuestion} className="px-4 sm:px-6 py-2.5 bg-red-50 text-red-600 font-bold rounded-lg hover:bg-red-100 disabled:opacity-50 transition-colors" title="Soruyu Sil">
                    <span className="hidden sm:inline">🗑️ Soruyu Sil</span>
                    <span className="sm:hidden">🗑️</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 mb-4 sm:mb-6 flex flex-col gap-2 relative">
                  {(!isEditingQuestion && adminMode) && (
                    <button
                      onClick={() => handleDeleteQuestion()}
                      className="absolute top-2 right-2 p-1.5 text-xs bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 rounded-lg transition-colors opacity-60 hover:opacity-100 z-10"
                      title="Soruyu Sil"
                    >
                      🗑️ Sil
                    </button>
                  )}
                  {activeQuestion?.displayParts?.trText && (
                    <div className="text-base sm:text-lg font-bold text-indigo-700 leading-relaxed w-full pr-12">
                      {activeQuestion.displayParts.trText}
                    </div>
                  )}
                  {activeQuestion?.displayParts?.bgText && (
                    <div className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed w-full pr-12">
                      {activeQuestion.displayParts.bgText.split('_____').map((part, i, arr) => (
                        <span key={i}>
                          {part}
                          {i < arr.length - 1 && <span className="text-red-500 mx-1 tracking-widest">_______</span>}
                        </span>
                      ))}
                    </div>
                  )}
                  {(!activeQuestion?.displayParts?.trText && !activeQuestion?.displayParts?.bgText) && (
                    <div className="text-base sm:text-lg font-bold text-slate-700 leading-relaxed w-full pr-12 whitespace-pre-wrap">
                      {activeQuestion?.display}
                    </div>
                  )}
                  
                  {/* TTS Button */}
                  {activeQuestion && (
                    <button 
                      onClick={() => speakText(activeQuestion.answer || activeQuestion.expected)} 
                      className="absolute top-4 right-4 w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center hover:bg-indigo-100 hover:scale-105 active:scale-95 transition-all shadow-sm"
                      title="Bulgarca okunuşunu dinle"
                    >
                      <span className="text-xl">🔊</span>
                    </button>
                  )}
                </div>

              {/* Flashcard Mode */}
              {flashcardMode && !adminMode ? (
                <div className="flex flex-col items-center justify-center min-h-[150px]">
                  {!isFlipped ? (
                    <button onClick={() => setIsFlipped(true)} className="px-8 py-4 bg-indigo-600 text-white font-black text-xl rounded-2xl shadow-lg hover:bg-indigo-700 active:scale-95 transition-all">
                      Kartı Çevir
                    </button>
                  ) : (
                    <div className="flex flex-col items-center gap-6 w-full animate-in zoom-in-95 duration-300">
                      <div className="text-2xl sm:text-3xl font-black text-indigo-700 text-center">
                        {activeQuestion?.answer || activeQuestion?.expected}
                      </div>
                      <div className="flex w-full gap-2 sm:gap-4 mt-4">
                        <button onClick={() => { setFeedback('wrong'); setTimeout(handleNext, 100); }} className="flex-1 px-2 sm:px-4 py-3 bg-red-100 text-red-700 font-bold rounded-xl hover:bg-red-200 active:scale-95 transition-all shadow-sm">
                          Bilemedim (Tekrarla)
                        </button>
                        <button onClick={() => { setFeedback('typo'); setTimeout(handleNext, 100); }} className="flex-1 px-2 sm:px-4 py-3 bg-amber-100 text-amber-700 font-bold rounded-xl hover:bg-amber-200 active:scale-95 transition-all shadow-sm">
                          Zorlandım
                        </button>
                        <button onClick={() => { setFeedback('correct'); setTimeout(handleNext, 100); }} className="flex-1 px-2 sm:px-4 py-3 bg-green-100 text-green-700 font-bold rounded-xl hover:bg-green-200 active:scale-95 transition-all shadow-sm">
                          Bildiğim (Geç)
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : activeQuestion?.type === 'matching' && !adminMode ? (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-row justify-between gap-2 sm:gap-6 w-full">
                    <div className="flex flex-col gap-2 w-1/2">
                      {matchingPairs.bg.map((item, idx) => {
                        const isMatched = matchedIds.includes(item.id);
                        const isSelected = selectedMatch?.type === 'bg' && selectedMatch.idx === idx;
                        return (
                          <button 
                            key={`bg-${idx}`}
                            disabled={isMatched || feedback !== 'none'}
                            onClick={() => handleMatchSelect('bg', idx, item.id)}
                            className={`p-3 sm:p-4 rounded-xl text-sm sm:text-base font-bold text-center transition-all border-2 shadow-sm ${isMatched ? 'bg-green-100 border-green-200 text-green-700 opacity-50' : isSelected ? 'bg-indigo-100 border-indigo-400 text-indigo-700 scale-105' : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-200 hover:bg-slate-50'}`}
                          >
                            {item.text}
                          </button>
                        )
                      })}
                    </div>
                    <div className="flex flex-col gap-2 w-1/2">
                      {matchingPairs.tr.map((item, idx) => {
                        const isMatched = matchedIds.includes(item.id);
                        const isSelected = selectedMatch?.type === 'tr' && selectedMatch.idx === idx;
                        return (
                          <button 
                            key={`tr-${idx}`}
                            disabled={isMatched || feedback !== 'none'}
                            onClick={() => handleMatchSelect('tr', idx, item.id)}
                            className={`p-3 sm:p-4 rounded-xl text-sm sm:text-base font-bold text-center transition-all border-2 shadow-sm ${isMatched ? 'bg-green-100 border-green-200 text-green-700 opacity-50' : isSelected ? 'bg-indigo-100 border-indigo-400 text-indigo-700 scale-105' : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-200 hover:bg-slate-50'}`}
                          >
                            {item.text}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              ) : activeQuestion?.type === 'scramble' && !adminMode ? (
                <div className="flex flex-col gap-3 sm:gap-4">
                  {/* Selected Words Area (The Sentence) */}
                  <div className={`flex flex-wrap gap-1.5 sm:gap-2 min-h-[56px] sm:min-h-[64px] p-3 sm:p-4 bg-white border-2 rounded-xl items-start transition-colors ${(feedback === 'wrong') ? 'border-red-400 bg-red-50' : feedback === 'typo' ? 'border-amber-400 bg-amber-50' : feedback === 'correct' ? 'border-green-400 bg-green-50' : 'border-slate-200 focus:border-indigo-400'}`}>
                    {selectedWords.map((word, idx) => (
                      <button 
                        key={`sel-${idx}`}
                        disabled={feedback !== 'none'}
                        onClick={() => {
                          const newSel = [...selectedWords];
                          newSel.splice(idx, 1);
                          setSelectedWords(newSel);
                          setScrambleWords([...scrambleWords, word]);
                        }}
                        className={`px-3 sm:px-4 py-1.5 sm:py-2 font-bold text-sm sm:text-base rounded-lg border shadow-sm transition-colors ${feedback === 'wrong' ? 'bg-red-100 text-red-900 border-red-200' : feedback === 'correct' ? 'bg-green-100 text-green-900 border-green-200' : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'}`}
                      >
                        {word}
                      </button>
                    ))}
                    {selectedWords.length === 0 && <span className="text-slate-300 font-medium my-auto ml-2 text-sm sm:text-base">Kelimeleri buraya dizin...</span>}
                  </div>
                  
                  {/* Word Pool */}
                  <div className="flex flex-wrap gap-2 sm:gap-3 mt-1 sm:mt-2 justify-center">
                    {scrambleWords.map((word, idx) => (
                      <button 
                        key={`pool-${idx}`}
                        disabled={feedback !== 'none'}
                        onClick={() => {
                          const newPool = [...scrambleWords];
                          newPool.splice(idx, 1);
                          setScrambleWords(newPool);
                          setSelectedWords([...selectedWords, word]);
                        }}
                        className="px-3 sm:px-5 py-2 sm:py-3 bg-white text-slate-700 font-extrabold text-base sm:text-lg rounded-xl shadow-sm border-2 border-slate-200 hover:border-indigo-400 hover:text-indigo-600 hover:shadow-md transition-all active:scale-95 disabled:opacity-50"
                      >
                        {word}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <textarea
                    ref={inputRef as any}
                    inputMode={preferNativeKeyboard ? "text" : "none"}
                    className={`w-full bg-white border-2 rounded-xl px-4 py-4 text-base sm:text-xl outline-none transition-colors resize-none overflow-hidden min-h-[70px] ${(feedback === 'wrong' || adminMode) ? 'border-red-400 bg-red-50 text-red-900 font-bold' : feedback === 'typo' ? 'border-amber-400 bg-amber-50 text-amber-900 font-bold' : feedback === 'correct' ? 'border-green-400 bg-green-50 text-green-900 font-bold' : 'border-slate-200 focus:border-indigo-400'}`}
                    placeholder={adminMode ? "Admin Modu Aktif" : "Cevabınızı buraya yazın..."}
                    value={(feedback === 'wrong' && !userAnswer.trim() && activeQuestion?.type !== 'scramble') || adminMode ? (activeQuestion?.fitbTarget || activeQuestion?.expected || '') : userAnswer}
                    onChange={(e) => {
                      setUserAnswer(e.target.value);
                      e.target.style.height = 'auto';
                      e.target.style.height = (e.target.scrollHeight) + 'px';
                    }}
                    onFocus={() => { if (!preferNativeKeyboard && !adminMode) setKeyboardOpen(true); }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        (feedback === 'none' && !adminMode) ? handleCheck() : handleNext();
                      }
                    }}
                    disabled={feedback !== 'none' || adminMode}
                    rows={2}
                  />
                </div>
              )}

              {/* Doğru Cevap (Yanlış veya eksik yazıldıysa metin kutusunun altında göster) */}
              {(feedback === 'wrong' || feedback === 'typo') && !adminMode && userAnswer.trim() !== '' && (
                <div className={`mt-3 flex items-center gap-2 px-2 text-[15px] font-bold ${feedback === 'wrong' ? 'text-red-600' : 'text-amber-600'} animate-in fade-in`}>
                  <span>{feedback === 'wrong' ? 'Doğrusu:' : 'Doğru yazım:'}</span>
                  <span className="bg-white px-3 py-1.5 rounded-lg border shadow-sm text-lg text-slate-800">
                    {activeQuestion?.fitbTarget || activeQuestion?.expected}
                  </span>
                </div>
              )}

              {/* Açıklama / Kural Kutusu */}
              {(feedback !== 'none' || adminMode) && activeQuestion?.explanation && (
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 mt-8 flex items-start gap-4">
                  <div className="bg-indigo-100 p-2 rounded-lg mt-1 shrink-0">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-indigo-900 mb-1 text-sm uppercase tracking-wider">BİLGİ NOTU & KURAL</h4>
                    <p className="text-indigo-900 text-[15px] font-medium leading-relaxed whitespace-pre-wrap">
                      {activeQuestion.explanation}
                    </p>
                  </div>
                </div>
              )}
              </>
            )}
            </div>
          )}
        </main>

      {/* Footer Area (Check Button & Feedback) */}
      {!isFinished && (
        <div className={`fixed bottom-0 left-0 right-0 z-50 transition-colors duration-300 ${isEditingQuestion ? 'bg-indigo-50 border-t-2 border-indigo-200' : feedback === 'correct' ? 'bg-green-100 border-t-2 border-green-200' : feedback === 'typo' ? 'bg-amber-100 border-t-2 border-amber-200' : feedback === 'wrong' ? 'bg-red-100 border-t-2 border-red-200' : 'bg-white border-t border-slate-200 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]'}`}>
          {!isEditingQuestion && (
            <div className="max-w-3xl mx-auto px-3 sm:px-4 py-3 sm:py-6 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
              
              <div className="flex-1 w-full flex items-center justify-between sm:justify-start">
                {feedback === 'correct' && (
                  <div className="text-green-700">
                    <div className="font-black text-lg sm:text-xl flex items-center gap-2"><span>✅</span> Harika!</div>
                  </div>
                )}
                {feedback === 'typo' && (
                  <div className="text-amber-800">
                    <div className="font-black text-lg sm:text-xl flex items-center gap-2"><span>⚠️</span> Harf hatası!</div>
                  </div>
                )}
                {feedback === 'wrong' && (
                  <div className="text-red-700">
                    <div className="font-black text-lg sm:text-xl flex items-center gap-2"><span>❌</span> {userAnswer.trim() ? "Yanlış" : "Pas geçtiniz"}</div>
                  </div>
                )}
                {feedback === 'none' && !flashcardMode && (
                  <div className="flex items-center gap-2">
                    <button 
                      className="text-slate-400 font-bold hover:text-slate-600 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-sm bg-slate-50 border border-slate-200"
                      onClick={() => setKeyboardOpen(!keyboardOpen)}
                      title="Klavyeyi Aç/Kapat"
                    >
                      ⌨️ <span className="hidden sm:inline">Sanal Klavye</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="flex flex-row w-full gap-2 sm:gap-3">
                {adminMode ? (
                  <button
                    onClick={() => setCurrentIndex(p => Math.min(filteredQuestions.length - 1, p + 1))}
                    disabled={currentIndex >= filteredQuestions.length - 1}
                    className="flex-1 px-4 sm:px-8 py-2.5 rounded-xl font-black text-sm sm:text-lg transition-all bg-indigo-600 text-white hover:bg-indigo-700 shadow-md disabled:opacity-30 flex items-center justify-center gap-2"
                  >
                    <span>SONRAKİ</span>
                    <span className="text-lg">⏭️</span>
                  </button>
                ) : flashcardMode ? (
                  <button
                    onClick={() => setFlashcardMode(false)}
                    className="flex-1 px-2 py-2.5 rounded-xl font-black text-xs sm:text-lg transition-all bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 shadow-sm border border-slate-200 active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <span>Yazma Moduna Geç</span>
                  </button>
                ) : (
                  <>
                    {feedback === 'none' && (
                      <button
                        onClick={handleSkip}
                        className="flex-[0.5] px-2 py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 shadow-sm border border-slate-200 active:scale-95 flex items-center justify-center gap-1.5"
                      >
                        <span className="text-base">⏭️</span>
                        <span className="hidden sm:inline">PAS GEÇ</span>
                      </button>
                    )}
                    {feedback === 'none' && activeQuestion?.type !== 'matching' && (
                      <button
                        onClick={() => setFlashcardMode(true)}
                        className="flex-[0.5] px-2 py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700 shadow-sm border border-indigo-200 active:scale-95 flex items-center justify-center gap-1.5"
                        title="Yazmadan akıldan tekrar etmek için flaşkarta geç"
                      >
                        <span className="text-base">📇</span>
                        <span className="hidden sm:inline">Flaşkart</span>
                      </button>
                    )}
                    {activeQuestion?.type !== 'matching' && (
                      <button
                        onClick={feedback === 'none' ? handleCheck : handleNext}
                        disabled={feedback === 'none' && (activeQuestion?.type === 'scramble' ? selectedWords.length === 0 : !userAnswer.trim())}
                        className={`flex-[1.5] px-2 py-2.5 rounded-xl font-black text-xs sm:text-lg transition-all active:scale-95 flex items-center justify-center gap-1.5 ${feedback === 'none' ? ((activeQuestion?.type === 'scramble' ? selectedWords.length > 0 : userAnswer.trim()) ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md' : 'bg-slate-200 text-slate-400 cursor-not-allowed') : feedback === 'correct' ? 'bg-green-600 text-white hover:bg-green-700 shadow-md' : feedback === 'typo' ? 'bg-amber-600 text-white hover:bg-amber-700 shadow-md' : 'bg-red-600 text-white hover:bg-red-700 shadow-md'}`}
                      >
                        {feedback === 'none' ? (
                          <>
                            <span className="text-base sm:text-lg">✔️</span>
                            <span>KONTROL ET</span>
                          </>
                        ) : (
                          <>
                            <span>DEVAM ET</span>
                            <span className="text-base sm:text-lg">⏭️</span>
                          </>
                        )}
                      </button>
                    )}
                    {activeQuestion?.type === 'matching' && feedback !== 'none' && (
                       <button
                         onClick={handleNext}
                         className="flex-[1.5] px-2 py-2.5 rounded-xl font-black text-xs sm:text-lg transition-all bg-green-600 text-white hover:bg-green-700 shadow-md active:scale-95 flex items-center justify-center gap-1.5"
                       >
                          <span>DEVAM ET</span>
                          <span className="text-base sm:text-lg">⏭️</span>
                       </button>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Virtual Keyboard */}
          <div 
            className={`bg-white border-t border-slate-200 p-2 sm:p-4 transition-all duration-300 ${(keyboardOpen && !preferNativeKeyboard && feedback === 'none') || (isEditingQuestion && keyboardOpen) ? 'h-auto opacity-100' : 'h-0 opacity-0 overflow-hidden py-0 border-transparent'}`}
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
