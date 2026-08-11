'use client';

import { useState, useEffect, useRef, Suspense, use, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

import { HighlightableText } from '@/components/HighlightableText';
import { DictionaryModal } from '@/components/DictionaryModal';
import { RefreshCw } from 'lucide-react';

interface Question {
  id: string;
  type: string;
  sentence: string;
  answer: string;
  hint: string;
  explanation?: string;
  pairs?: any;
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
  const langParam = searchParams.get('lang') as 'all' | 'bg' | 'tr' | null;

  const [student, setStudent] = useState<any>(null);
  const [data, setData] = useState<ModuleData | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeQuestion, setActiveQuestion] = useState<{ id: string, type?: string, display: string, displayParts?: { trText: string | null, bgText: string | null }, expected: string, fitbTarget: string | null, hint: string, explanation?: string, originalHint: string, pairs?: any, answer?: string } | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  
  // Scramble states
  const [scrambleWords, setScrambleWords] = useState<string[]>([]);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  
  const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong' | 'typo'>('none');
  const [score, setScore] = useState(0);
  
  // New State
  const [sessionQuestions, setSessionQuestions] = useState<Question[]>([]);
  const [mistakesPool, setMistakesPool] = useState<string[]>([]);
  const [unknownWords, setUnknownWords] = useState<string[]>([]);
  const [customDictionary, setCustomDictionary] = useState<Record<string, string>>({});
  const [customMeaning, setCustomMeaning] = useState<string>('');

  const [selectedWord, setSelectedWord] = useState<{word: string} | null>(null);

  useEffect(() => {
    if (selectedWord && customDictionary[selectedWord.word.toLowerCase()]) {
      setCustomMeaning(customDictionary[selectedWord.word.toLowerCase()]);
    } else {
      setCustomMeaning('');
    }
  }, [selectedWord, customDictionary]);
  const [isSwapped, setIsSwapped] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [langFilter, setLangFilter] = useState<'all' | 'bg' | 'tr'>(langParam || 'bg');
  const [dictionaryWord, setDictionaryWord] = useState<string | null>(null);
  
  // Keyboard State
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [layout, setLayout] = useState<LayoutType>('bg');
  const [isCaps, setIsCaps] = useState(false);
  const [preferNativeKeyboard, setPreferNativeKeyboard] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();
  const modProgressRef = useRef<any>(null);
  
  // Admin Mode State
  const [adminMode, setAdminMode] = useState(false);
  
  // Font State
  const [useCursiveBg, setUseCursiveBg] = useState(false);

  // Settings Modal State
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  // Swipe Refs
  const touchStartRef = useRef<{ x: number, y: number } | null>(null);

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

  // Selection Listener for Unknown Words
  useEffect(() => {
    const handleSelection = () => {
      setTimeout(() => {
        // Don't close the modal if the user is interacting with the custom meaning input
        if (document.activeElement?.id === 'custom-meaning-input') {
          return;
        }

        const selection = window.getSelection();
        if (selection && selection.toString().trim()) {
          const raw = selection.toString().trim();
          const word = raw.replace(/[.,!?;:()]/g, '');
          // Check if it's mostly Bulgarian characters and not too long
          if (/[А-Яа-я]/i.test(word) && word.length < 30) {
            setSelectedWord({ word: word.toLowerCase() });
          } else {
            setSelectedWord(null);
          }
        } else {
          setSelectedWord(null);
        }
      }, 50);
    };
    document.addEventListener('selectionchange', handleSelection);
    return () => document.removeEventListener('selectionchange', handleSelection);
  }, []);

  const [isWordAdded, setIsWordAdded] = useState(false);

  const handleAddUnknownWord = async () => {
    if (!selectedWord || !student?.id) return;
    const word = selectedWord.word;
    const wordLower = word.toLowerCase();
    
    // Show success state
    setIsWordAdded(true);
    
    const newDict = { ...customDictionary };
    let dictChanged = false;
    if (customMeaning.trim() !== "" && newDict[wordLower] !== customMeaning.trim()) {
      newDict[wordLower] = customMeaning.trim();
      dictChanged = true;
      setCustomDictionary(newDict);
    }
    
    const wordAlreadyInList = unknownWords.includes(word);
    
    if (wordAlreadyInList && !dictChanged) {
      setTimeout(() => {
        window.getSelection()?.removeAllRanges();
        setSelectedWord(null);
        setIsWordAdded(false);
      }, 1000);
      return;
    }
    
    const newWords = wordAlreadyInList ? unknownWords : [...unknownWords, word];
    if (!wordAlreadyInList) {
      setUnknownWords(newWords);
    }
    
    try {
      await fetch('/api/training-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: student.id,
          unknownWords: newWords,
          ...(dictChanged ? { customDictionary: newDict } : {})
        })
      });
    } catch(e) {
      console.error(e);
    }
    
    // Hide after 1 second
    setTimeout(() => {
      window.getSelection()?.removeAllRanges();
      setSelectedWord(null);
      setIsWordAdded(false);
    }, 1000);
  };

  const handleRemoveUnknownWord = async (wordToRemove: string) => {
    if (!student?.id) return;
    const newWords = unknownWords.filter(w => w.toLowerCase() !== wordToRemove.toLowerCase());
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
    } catch(e) { console.error(e); }
  };


  // 2. Fetch Module & Set Questions
  useEffect(() => {
    if (!student?.id) return;

    const fetchAll = async () => {
      try {
        const [modRes, progRes] = await Promise.all([
          fetch(`/api/modules/${moduleId}?studentId=${student.id}`),
          fetch(`/api/training-progress?studentId=${student.id}`)
        ]);

        const modData = await modRes.json();
        const progData = await progRes.json();
        const modProgress = progData.progress?.[moduleId] || { mistakes: [], allProgress: 0, mistakesProgress: 0, score: 0 };
        modProgressRef.current = modProgress;
        
        setData(modData);

        const progress = progData.progress || {};
        
        const globalUnknownWords = progress.unknownWords || [];
        setUnknownWords(globalUnknownWords);
        const globalCustomDict = progress.customDictionary || {};
        setCustomDictionary(globalCustomDict);

        const mistakes = modProgress.mistakes || [];
        setMistakesPool(mistakes);

        let activePool: Question[] = [];
        if (mode === 'mistakes') {
          activePool = modData.questions.filter((q: Question) => mistakes.includes(q.id));
        } else {
          activePool = modData.questions;
        }

        // Prioritize questions containing unknown words
        if (globalUnknownWords.length > 0 && mode !== 'mistakes') {
          activePool = [...activePool].sort((a, b) => {
            const aText = (a.sentence + ' ' + a.answer).toLowerCase();
            const bText = (b.sentence + ' ' + b.answer).toLowerCase();
            const aHas = globalUnknownWords.some((w: string) => aText.includes(w));
            const bHas = globalUnknownWords.some((w: string) => bText.includes(w));
            if (aHas && !bHas) return -1;
            if (!aHas && bHas) return 1;
            return 0;
          });
        }
        
        setSessionQuestions(activePool);

        // Load from localStorage or cloud based on timestamp
        const localStateStr = localStorage.getItem(`training_state_${student.id}_${moduleId}_${mode}`);
        let localStateToApply = null;
        
        if (localStateStr) {
          try {
            localStateToApply = JSON.parse(localStateStr);
          } catch(e) {}
        }
        
        let stateToApply = null;
        if (localStateToApply && modProgress.uiState) {
           const localTs = localStateToApply.timestamp || 0;
           const cloudTs = modProgress.uiState.timestamp || 0;
           stateToApply = cloudTs > localTs ? modProgress.uiState : localStateToApply;
        } else if (localStateToApply) {
           stateToApply = localStateToApply;
        } else if (modProgress.uiState) {
           stateToApply = modProgress.uiState;
        }

        if (stateToApply) {
          // If lang param explicitly set from module list, use that lang's progress index
          if (langParam && mode !== 'mistakes') {
            const savedIdx = langParam === 'bg'
              ? (modProgress.bgProgress ?? Math.min(modProgress.allProgress || 0, activePool.length))
              : langParam === 'tr' ? (modProgress.trProgress || 0)
              : modProgress.allProgress || 0;
            if (savedIdx >= 0 && savedIdx < activePool.length) setCurrentIndex(savedIdx);
          } else if (typeof stateToApply.currentIndex === 'number' && stateToApply.currentIndex >= 0 && stateToApply.currentIndex < activePool.length) {
            setCurrentIndex(stateToApply.currentIndex);
          } else {
            const currentLang = stateToApply.langFilter || 'bg';
            const savedIndex = mode === 'mistakes' ? modProgress.mistakesProgress : 
              (currentLang === 'bg' ? (modProgress.bgProgress ?? Math.min(modProgress.allProgress || 0, modData.questions?.length || 0)) : 
               currentLang === 'tr' ? (modProgress.trProgress || 0) : 
               modProgress.allProgress);
            if (savedIndex >= 0 && savedIndex < activePool.length) setCurrentIndex(savedIndex);
          }
          if (typeof stateToApply.score === 'number') setScore(stateToApply.score);
          else if (modProgress.score) setScore(modProgress.score);
          
          if (stateToApply.searchQuery !== undefined) setSearchQuery(stateToApply.searchQuery);
          // If lang param is explicitly set in URL (from module list), use that; otherwise restore saved lang
          if (langParam) {
            setLangFilter(langParam);
          } else if (stateToApply.langFilter !== undefined) {
            setLangFilter(stateToApply.langFilter);
          }
          if (stateToApply.isSwapped !== undefined) setIsSwapped(stateToApply.isSwapped);
          if (stateToApply.layout !== undefined) setLayout(stateToApply.layout);
          if (stateToApply.useCursiveBg !== undefined) setUseCursiveBg(stateToApply.useCursiveBg);
          
          // Also load mistakes if they were saved in uiState (for manual cloud sync)
          if (stateToApply.mistakes && Array.isArray(stateToApply.mistakes)) {
            setMistakesPool(stateToApply.mistakes);
            if (mode === 'mistakes') {
              activePool = modData.questions.filter((q: Question) => stateToApply.mistakes.includes(q.id));
              setSessionQuestions(activePool);
            }
          }
        } else {
          const currentLang = langParam || 'bg';
          const savedIndex = mode === 'mistakes' ? modProgress.mistakesProgress 
            : (currentLang === 'bg' ? (modProgress.bgProgress ?? Math.min(modProgress.allProgress || 0, modData.questions?.length || 0))
            : currentLang === 'tr' ? (modProgress.trProgress || 0)
            : modProgress.allProgress || 0);
          if (savedIndex >= 0 && savedIndex < activePool.length) {
            setCurrentIndex(savedIndex);
          }
          if (modProgress.score) {
             setScore(modProgress.score);
          }
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching module:', err);
        setLoading(false);
      }
    };

    if (moduleId) {
      localStorage.setItem('last_visited_module', moduleId as string); // keep for backward compatibility
      localStorage.setItem('last_visited_module_data', JSON.stringify({ id: moduleId, ts: Date.now() }));
    }
    fetchAll();
  }, [moduleId, mode, student?.id]);

  // Persist UI state to localStorage
  useEffect(() => {
    if (!student?.id || !moduleId || loading) return;
    const state = {
      currentIndex,
      score,
      searchQuery,
      langFilter,
      isSwapped,
      layout,
      useCursiveBg,
      mistakes: mistakesPool,
      timestamp: Date.now()
    };
    localStorage.setItem(`training_state_${student.id}_${moduleId}_${mode}`, JSON.stringify(state));
    
    // Also store globally for PWA auto-resume
    localStorage.setItem('last_active_training', JSON.stringify({
      url: `/training/${moduleId}?mode=${mode}`
    }));
  }, [student?.id, moduleId, mode, currentIndex, score, searchQuery, langFilter, isSwapped, layout, useCursiveBg, mistakesPool, loading]);

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
      explanation: (q as any).explanation,
      originalHint: hint,
      pairs: q.pairs
    });
    
    setFeedback('none');
    setUserAnswer('');
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, isSwapped, filteredQuestions]);


  const pendingUpdates = useRef<any>({});
  const [isCloudSaving, setIsCloudSaving] = useState(false);

  const syncProgress = (updates: any) => {
    if (!student) return;
    pendingUpdates.current = { ...pendingUpdates.current, ...updates };
    if (modProgressRef.current) {
      modProgressRef.current = { ...modProgressRef.current, ...updates };
    }
  };

  const handleCloudSync = async (clearActive: boolean = false) => {
    if (!student || !moduleId) return;
    setIsCloudSaving(true);
    
    // Gather full state
    const state = {
      currentIndex,
      score,
      searchQuery,
      langFilter,
      isSwapped,
      layout,
      useCursiveBg,
      mistakes: mistakesPool,
      timestamp: Date.now()
    };

    const progKey = mode === 'mistakes' ? 'mistakesProgress' : (langFilter === 'bg' ? 'bgProgress' : langFilter === 'tr' ? 'trProgress' : 'allProgress');

    const payload = {
      studentId: student.id,
      moduleId,
      uiState: state,
      lastActiveTraining: clearActive ? "" : `/training/${moduleId}?mode=${mode}`,
      lastVisitedModule: clearActive ? "" : moduleId,
      [progKey]: currentIndex,
      ...pendingUpdates.current
    };

    try {
      await fetch('/api/training-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      pendingUpdates.current = {};
    } catch(e) {
      console.error('Failed to sync to cloud', e);
    }
    setIsCloudSaving(false);
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
           if (newMatchedIds.length === activeQuestion?.pairs?.length) {
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
                const insertIdx = Math.min(originalIndex + 4, next.length);
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
         const originalIndex = next.findIndex(q => q.id === qOriginal.id);
         if (originalIndex !== -1) {
            const insertIdx = Math.min(originalIndex + 4, next.length);
            next.splice(insertIdx, 0, { ...qOriginal, id: qOriginal.id + '_retry_' + Date.now() });
         }
         return next;
       });
    }
    
    if (!mistakesPool.includes(activeQuestion.id) && !activeQuestion.id.includes('_retry_')) {
      saveMistakes([...mistakesPool, activeQuestion.id]);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setUserAnswer('');
      setFeedback('none');
      setIsSwapped(false);
      setIsFlipped(false);
      setSelectedMatch(null);
      setMatchedIds([]);
    }
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = { x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY };
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    const dx = touchStartRef.current.x - touchEndX;
    const dy = touchStartRef.current.y - touchEndY;
    
    // Check if the swipe is mostly horizontal and long enough
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      if (dx > 0) {
        // Swipe left
        if (currentIndex < filteredQuestions.length - 1) {
          setCurrentIndex(currentIndex + 1);
        }
      } else {
        // Swipe right
        handlePrev();
      }
    }
    
    touchStartRef.current = null;
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
           const progKey = mode === 'mistakes' ? 'mistakesProgress' : (langFilter === 'bg' ? 'bgProgress' : langFilter === 'tr' ? 'trProgress' : 'allProgress');
           syncProgress({ [progKey]: nextIdx });
       }
    } else {
       setCurrentIndex(filteredQuestions.length);
       if (!searchQuery.trim()) {
           const progKey = mode === 'mistakes' ? 'mistakesProgress' : (langFilter === 'bg' ? 'bgProgress' : langFilter === 'tr' ? 'trProgress' : 'allProgress');
           syncProgress({ [progKey]: filteredQuestions.length });
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
    <>
      <div 
        className="min-h-screen bg-slate-50 flex flex-col pb-36 sm:pb-24 overflow-x-hidden relative"
        style={{ touchAction: 'pan-y' }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >

      {/* Dictionary Modal */}
      {dictionaryWord && (
        <DictionaryModal 
          word={dictionaryWord}
          customMeaning={customDictionary[dictionaryWord.toLowerCase()]}
          examples={
            Array.from(new Set(
              sessionQuestions
                .filter(q => 
                  (q.sentence && q.sentence.toLowerCase().includes(dictionaryWord.toLowerCase())) || 
                  (q.answer && q.answer.toLowerCase().includes(dictionaryWord.toLowerCase()))
                )
                .map(q => {
                  let bg = '';
                  let tr = '';
                  
                  if (q.sentence?.match(/[А-Яа-я]/)) {
                    bg = q.sentence;
                    tr = q.answer?.match(/[А-Яа-я]/) ? (q.hint || '') : (q.answer || '');
                  } else if (q.answer?.match(/[А-Яа-я]/)) {
                    bg = q.answer;
                    tr = q.sentence || q.hint || '';
                  } else {
                    bg = q.sentence || q.answer || '';
                  }
                  
                  if (tr.startsWith('Türkçesi: ')) tr = tr.replace('Türkçesi: ', '');
                  if (tr.startsWith('Bulgarcası: ')) tr = tr.replace('Bulgarcası: ', '');
                  if (tr === bg) tr = '';
                  
                  return JSON.stringify({ bg, tr });
                })
            )).map(str => JSON.parse(str))
          }
          onClose={() => setDictionaryWord(null)}
          onRemove={() => handleRemoveUnknownWord(dictionaryWord)}
        />
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="bg-slate-50 border-b border-slate-100 p-4 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-lg">⚙️ Ayarlar</h3>
              <button onClick={() => setShowSettingsModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 text-slate-500 hover:bg-slate-300">✕</button>
            </div>
            <div className="p-4 flex flex-col gap-5">
              
              {/* Search */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Arama</label>
                <div className="relative w-full">
                  <select
                    value={langFilter}
                    onChange={(e) => {
                      const newLang = e.target.value as any;
                      
                      // Save current language's progress before switching
                      const progKey = mode === 'mistakes' ? 'mistakesProgress' : (langFilter === 'bg' ? 'bgProgress' : langFilter === 'tr' ? 'trProgress' : 'allProgress');
                      syncProgress({ [progKey]: currentIndex });
                      
                      setLangFilter(newLang);
                      if (modProgressRef.current && mode !== 'mistakes') {
                        const savedIdx = newLang === 'bg' 
                            ? (modProgressRef.current.bgProgress ?? Math.min(modProgressRef.current.allProgress || 0, filteredQuestions.length))
                            : (modProgressRef.current.trProgress || 0);
                        setCurrentIndex(savedIdx);
                      } else {
                        setCurrentIndex(0);
                      }
                    }}
                    className="text-input py-1 px-2 text-xs font-medium w-full sm:w-auto mt-2 sm:mt-0"
                  >
                    <option value="all">Tümü</option>
                    <option value="bg">BG</option>
                    <option value="tr">TR</option>
                  </select>
                  <input 
                    type="text" 
                    placeholder="🔍 Sorularda Ara..." 
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentIndex(0);
                    }}
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Language Filter */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Dil Filtresi</label>
                <div className="flex bg-slate-100 rounded-xl p-1 border border-slate-200 w-full justify-between">
                  <button onClick={() => { 
                    const progKey = mode === 'mistakes' ? 'mistakesProgress' : (langFilter === 'bg' ? 'bgProgress' : langFilter === 'tr' ? 'trProgress' : 'allProgress');
                    syncProgress({ [progKey]: currentIndex });
                    
                    setLangFilter('all'); 
                    if (modProgressRef.current && mode !== 'mistakes') {
                      setCurrentIndex(modProgressRef.current.allProgress || 0);
                    } else {
                      setCurrentIndex(0);
                    }
                  }} className={`flex-1 py-2 text-sm rounded-lg transition-colors font-bold ${langFilter === 'all' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:bg-slate-200'}`}>Tümü 🌐</button>
                  
                  <button onClick={() => { 
                    const progKey = mode === 'mistakes' ? 'mistakesProgress' : (langFilter === 'bg' ? 'bgProgress' : langFilter === 'tr' ? 'trProgress' : 'allProgress');
                    syncProgress({ [progKey]: currentIndex });
                    
                    setLangFilter('bg'); 
                    if (modProgressRef.current && mode !== 'mistakes') {
                      setCurrentIndex(modProgressRef.current.bgProgress ?? Math.min(modProgressRef.current.allProgress || 0, filteredQuestions.length));
                    } else {
                      setCurrentIndex(0);
                    }
                  }} className={`flex-1 py-2 text-sm rounded-lg transition-colors font-bold ${langFilter === 'bg' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:bg-slate-200'}`}>BG 🇧🇬</button>
                  
                  <button onClick={() => { 
                    const progKey = mode === 'mistakes' ? 'mistakesProgress' : (langFilter === 'bg' ? 'bgProgress' : langFilter === 'tr' ? 'trProgress' : 'allProgress');
                    syncProgress({ [progKey]: currentIndex });
                    
                    setLangFilter('tr'); 
                    if (modProgressRef.current && mode !== 'mistakes') {
                      setCurrentIndex(modProgressRef.current.trProgress || 0);
                    } else {
                      setCurrentIndex(0);
                    }
                  }} className={`flex-1 py-2 text-sm rounded-lg transition-colors font-bold ${langFilter === 'tr' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:bg-slate-200'}`}>TR 🇹🇷</button>
                </div>
              </div>

              {/* Toggles */}
              <div className="flex flex-col gap-3">
                <label className="flex items-center justify-between cursor-pointer p-3 bg-slate-50 rounded-xl border border-slate-100 hover:bg-slate-100 transition-colors">
                  <span className="font-bold text-slate-700 text-sm">✍️ El Yazısı Modu</span>
                  <div className="relative">
                    <input type="checkbox" className="sr-only" checked={useCursiveBg} onChange={(e) => setUseCursiveBg(e.target.checked)} />
                    <div className={`block w-10 h-6 rounded-full transition-colors ${useCursiveBg ? 'bg-indigo-500' : 'bg-slate-300'}`}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${useCursiveBg ? 'translate-x-4' : ''}`}></div>
                  </div>
                </label>

                {(student?.role === 'admin' || student?.isAdminMode || student?.username === 'mustafasacar') && (
                  <label className="flex items-center justify-between cursor-pointer p-3 bg-slate-50 rounded-xl border border-slate-100 hover:bg-slate-100 transition-colors">
                    <span className="font-bold text-slate-700 text-sm">👑 Admin Modu</span>
                    <div className="relative">
                      <input type="checkbox" className="sr-only" checked={adminMode} onChange={(e) => { setAdminMode(e.target.checked); setFeedback('none'); setUserAnswer(''); setKeyboardOpen(false); }} />
                      <div className={`block w-10 h-6 rounded-full transition-colors ${adminMode ? 'bg-indigo-500' : 'bg-slate-300'}`}></div>
                      <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${adminMode ? 'translate-x-4' : ''}`}></div>
                    </div>
                  </label>
                )}
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2 mt-2">
                <button 
                  onClick={() => {
                    handleSwap();
                    setShowSettingsModal(false);
                  }}
                  className="flex items-center justify-center gap-2 p-3 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-xl transition-colors font-bold text-sm"
                >
                  <RefreshCw size={16} className={isSwapped ? 'rotate-180' : ''} /> <span>Yönü Değiştir</span>
                </button>
                <button
                  onClick={() => {
                    const shuffled = [...filteredQuestions].sort(() => Math.random() - 0.5);
                    setSessionQuestions(shuffled);
                    setCurrentIndex(0);
                    setFeedback('none');
                    setUserAnswer('');
                    setShowSettingsModal(false);
                  }}
                  className="flex items-center justify-center gap-2 p-3 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl transition-colors font-bold text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg> <span>Karıştır</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Exit Confirmation Modal */}
      {showExitModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
            <div className="p-6 text-center">
              <div className="text-4xl mb-3">💾</div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Çıkmak istediğinizden emin misiniz?</h3>
              <p className="text-sm text-slate-500 mb-6">İlerlemenizi kaydetmek ister misiniz?</p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={async () => {
                    setShowExitModal(false);
                    await handleCloudSync(true);
                    localStorage.removeItem('last_active_training');
                    router.push('/training');
                  }}
                  className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors"
                >
                  💾 Kaydedip Çık
                </button>
                <button
                  onClick={() => {
                    setShowExitModal(false);
                    localStorage.removeItem('last_active_training');
                    localStorage.removeItem(`training_state_${student?.id}_${moduleId}_${mode}`);
                    router.push('/training');
                  }}
                  className="w-full py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                >
                  🚪 Kaydetmeden Çık
                </button>
                <button
                  onClick={() => setShowExitModal(false)}
                  className="w-full py-2 text-slate-400 hover:text-slate-600 text-sm font-medium transition-colors"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header (Compact Duolingo Style) */}
      <header className="bg-white border-b border-slate-200 px-3 pt-2 pb-1.5 sticky top-0 z-10 flex flex-col gap-1.5">
        {/* Top Row: X | Slider | Lang Flag | Save | Settings */}
        <div className="flex items-center gap-2">
          {/* Close Button */}
          <button onClick={() => setShowExitModal(true)} className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex-shrink-0 transition-colors">
            <span className="text-lg font-bold">✕</span>
          </button>

          {/* Progress Slider */}
          <div className="flex-1 relative h-7">
            {/* Track Background */}
            <div className="absolute top-1/2 left-0 right-0 h-3 -mt-1.5 bg-slate-100 rounded-full border border-slate-200"></div>
            
            {/* Active Track */}
            <div 
              className="absolute top-1/2 left-0 h-3 -mt-1.5 bg-green-500 rounded-full transition-all duration-150"
              style={{ width: `calc(${filteredQuestions.length > 1 ? (currentIndex / (filteredQuestions.length - 1)) * 100 : 100}% + ${filteredQuestions.length > 1 ? (0.5 - (currentIndex / (filteredQuestions.length - 1))) * 28 : 0}px)` }}
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-white/30 rounded-t-full"></div>
            </div>
            
            {/* Draggable Thumb / Ball */}
            <div 
              className="absolute top-1/2 w-7 h-7 -mt-3.5 bg-white rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.15)] border-[2.5px] border-green-500 flex items-center justify-center text-[11px] font-black text-green-600 transition-all duration-150 pointer-events-none z-10"
              style={{ 
                left: `calc(${filteredQuestions.length > 1 ? (currentIndex / (filteredQuestions.length - 1)) * 100 : 100}% + ${filteredQuestions.length > 1 ? (0.5 - (currentIndex / (filteredQuestions.length - 1))) * 28 : 0}px)`,
                transform: 'translateX(-50%)'
              }}
            >
              {currentIndex + 1}
            </div>

            {/* Invisible Native Slider for Interaction */}
            {filteredQuestions.length > 0 && (
              <input 
                type="range"
                min={0}
                max={Math.max(0, filteredQuestions.length - 1)}
                value={currentIndex}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (val !== currentIndex) {
                    setCurrentIndex(val);
                    setFeedback('none');
                    setUserAnswer('');
                    setKeyboardOpen(false);
                    
                    const progKey = mode === 'mistakes' ? 'mistakesProgress' : (langFilter === 'bg' ? 'bgProgress' : langFilter === 'tr' ? 'trProgress' : 'allProgress');
                    syncProgress({ [progKey]: val });
                  }
                }}
                className="absolute top-1/2 -mt-3.5 left-0 w-full h-7 opacity-0 cursor-pointer z-20 touch-none"
              />
            )}
          </div>

          {/* Right Controls: Lang flag | Save | Settings */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Language Toggle Flag */}
            <button
              onClick={() => {
                // Save current language's progress before switching
                const progKey = mode === 'mistakes' ? 'mistakesProgress' : (langFilter === 'bg' ? 'bgProgress' : langFilter === 'tr' ? 'trProgress' : 'allProgress');
                syncProgress({ [progKey]: currentIndex });
                
                const newLang = langFilter === 'bg' ? 'tr' : 'bg';
                setLangFilter(newLang);
                if (modProgressRef.current && mode !== 'mistakes') {
                  const savedIdx = newLang === 'bg'
                    ? (modProgressRef.current.bgProgress ?? Math.min(modProgressRef.current.allProgress || 0, filteredQuestions.length))
                    : (modProgressRef.current.trProgress || 0);
                  setCurrentIndex(savedIdx);
                } else {
                  setCurrentIndex(0);
                }
              }}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 shadow-sm transition-colors text-lg"
              title={`Dil: ${langFilter === 'bg' ? 'Bulgarca' : 'Türkçe'} — değiştirmek için tıkla`}
            >
              {langFilter === 'bg' ? '🇧🇬' : '🇹🇷'}
            </button>
            <button 
              onClick={() => handleCloudSync(false)} 
              disabled={isCloudSaving}
              className={`w-10 h-10 flex items-center justify-center rounded-xl transition-colors border shadow-sm relative ${isCloudSaving ? 'bg-indigo-50 text-indigo-400 border-indigo-200' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-indigo-200'}`}
              title="Kaydet"
            >
              <span className="text-xl">{isCloudSaving ? '⏳' : '💾'}</span>
            </button>
            <button 
              onClick={() => setShowSettingsModal(true)} 
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors border border-slate-200 shadow-sm relative"
            >
              <span className="text-xl">⚙️</span>
              {searchQuery && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>}
            </button>
          </div>
        </div>

        {/* Module Title Row */}
        {data?.title && (
          <div className="flex items-center gap-1.5 px-1 pb-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex-shrink-0">Ders:</span>
            <span className="text-[11px] font-semibold text-slate-600 truncate">{data.title}</span>
            <span className="flex-shrink-0 text-xs ml-auto">{langFilter === 'bg' ? '🇧🇬 BG' : '🇹🇷 TR'}</span>
          </div>
        )}
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
                 <button onClick={async () => {
                   await handleCloudSync(true);
                   localStorage.removeItem(`training_state_${student?.id}_${moduleId}_mistakes`);
                   localStorage.removeItem('last_active_training');
                   localStorage.removeItem('last_visited_module');
                   router.push(`/training/${moduleId}?mode=all`);
                 }} className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors">Tüm Havuza Geç</button>
              ) : (
                 <button onClick={async () => { 
                  setCurrentIndex(0);
                  const progKey = mode === 'mistakes' ? 'mistakesProgress' : (langFilter === 'bg' ? 'bgProgress' : langFilter === 'tr' ? 'trProgress' : 'allProgress');
                  syncProgress({ [progKey]: 0 });
                  await handleCloudSync(true);
                   localStorage.removeItem(`training_state_${student?.id}_${moduleId}_all`);
                   localStorage.removeItem('last_active_training');
                   localStorage.removeItem('last_visited_module');
                   window.location.reload(); 
                 }} className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors">Baştan Başla</button>
              )}
              <button onClick={async () => {
                await handleCloudSync(true);
                localStorage.removeItem('last_active_training');
                router.push('/training');
              }} className="px-6 py-3 bg-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-300 transition-colors">Modül Seçimine Dön</button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col mt-2 sm:mt-4">
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
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mb-6 flex flex-col gap-3">
                  <div className="flex justify-between items-start gap-4">
                    {/* Text Container */}
                    <div className="flex-1 flex flex-col gap-2 min-w-0">
                      {activeQuestion?.displayParts?.trText && (
                        <div className="text-lg sm:text-xl font-bold text-indigo-700 leading-relaxed">
                          <HighlightableText text={activeQuestion.displayParts.trText} unknownWords={unknownWords} onWordClick={setDictionaryWord} />
                        </div>
                      )}
                      {activeQuestion?.displayParts?.bgText && (
                        <div className={`text-lg sm:text-xl font-bold text-slate-900 leading-relaxed ${useCursiveBg ? 'bg-cursive' : ''}`}>
                          {activeQuestion.displayParts.bgText.split('_____').map((part, i, arr) => (
                            <span key={i}>
                              <HighlightableText text={part} unknownWords={unknownWords} onWordClick={setDictionaryWord} />
                              {i < arr.length - 1 && <span className="text-red-500 mx-1 tracking-widest">_______</span>}
                            </span>
                          ))}
                        </div>
                      )}
                      {(!activeQuestion?.displayParts?.trText && !activeQuestion?.displayParts?.bgText) && (
                        <div className="text-lg sm:text-xl font-bold text-slate-800 leading-relaxed whitespace-pre-wrap break-words">
                          <HighlightableText text={activeQuestion?.display || ''} unknownWords={unknownWords} onWordClick={setDictionaryWord} />
                        </div>
                      )}
                    </div>

                    {/* Action Buttons (TTS and Admin Delete) */}
                    <div className="flex flex-col gap-2 shrink-0">
                      {(!isEditingQuestion && adminMode) && (
                        <>
                          <button
                            onClick={() => {
                              const rawQ = filteredQuestions[currentIndex];
                              setEditForm({
                                sentence: rawQ?.sentence || '',
                                answer: rawQ?.answer || '',
                                hint: rawQ?.hint || '',
                                explanation: rawQ?.explanation || ''
                              });
                              setIsEditingQuestion(true);
                            }}
                            className="w-10 h-10 flex items-center justify-center bg-blue-50 text-blue-500 hover:bg-blue-100 hover:text-blue-700 rounded-xl transition-colors shadow-sm"
                            title="Soruyu Düzenle"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteQuestion()}
                            className="w-10 h-10 flex items-center justify-center bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 rounded-xl transition-colors shadow-sm"
                            title="Soruyu Sil"
                          >
                            🗑️
                          </button>
                        </>
                      )}
                      {activeQuestion && (
                        <button 
                          onClick={() => speakText(activeQuestion.answer || activeQuestion.expected)} 
                          className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center hover:bg-indigo-100 hover:scale-105 active:scale-95 transition-all shadow-sm"
                          title="Bulgarca okunuşunu dinle"
                        >
                          <span className="text-xl">🔊</span>
                        </button>
                      )}
                    </div>
                  </div>
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
                      <div className={`text-2xl sm:text-3xl font-black text-indigo-700 text-center ${useCursiveBg ? 'bg-cursive' : ''}`}>
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
                            className={`p-3 sm:p-4 rounded-xl font-bold text-center transition-all border-2 shadow-sm ${isMatched ? 'bg-green-100 border-green-200 text-green-700 opacity-50' : isSelected ? 'bg-indigo-100 border-indigo-400 text-indigo-700 scale-105' : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-200 hover:bg-slate-50'} ${useCursiveBg ? 'bg-cursive text-xl' : 'text-sm sm:text-base'}`}
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
                        className={`px-3 sm:px-4 py-1.5 sm:py-2 font-bold text-sm sm:text-base rounded-lg border shadow-sm transition-colors ${feedback === 'wrong' ? 'bg-red-100 text-red-900 border-red-200' : feedback === 'correct' ? 'bg-green-100 text-green-900 border-green-200' : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'} ${useCursiveBg ? 'bg-cursive text-xl' : ''}`}
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
                        className={`px-3 sm:px-5 py-2 sm:py-3 bg-white text-slate-700 font-extrabold text-base sm:text-lg rounded-xl shadow-sm border-2 border-slate-200 hover:border-indigo-400 hover:text-indigo-600 hover:shadow-md transition-all active:scale-95 disabled:opacity-50 ${useCursiveBg ? 'bg-cursive text-2xl' : ''}`}
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
                    onFocus={() => { 
                      if (!preferNativeKeyboard && !adminMode) {
                        setKeyboardOpen(true);
                      } 
                    }}
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

              {/* Açıklama / Kural Kutusu */}
              {(feedback !== 'none' || adminMode) && activeQuestion?.explanation && (
                <div className="mt-4 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 shadow-sm">
                  <div className="flex gap-2 items-start">
                    <span className="text-indigo-400 text-lg">💡</span>
                    <p className="text-indigo-900 text-sm sm:text-base leading-relaxed">
                      <HighlightableText text={activeQuestion.explanation} unknownWords={unknownWords} onWordClick={setDictionaryWord} />
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
          {/* Virtual Keyboard (Moved ABOVE the Action Buttons) */}
          <div 
            className={`bg-white border-b border-slate-200 p-2 sm:p-4 transition-all duration-300 ${(keyboardOpen && !preferNativeKeyboard && feedback === 'none') || (isEditingQuestion && keyboardOpen) ? 'h-auto opacity-100' : 'h-0 opacity-0 overflow-hidden py-0 border-transparent'}`}
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

          {/* Buttons & Feedback (Moved BELOW the Keyboard) */}
          {!isEditingQuestion && (
            <div className="max-w-3xl mx-auto px-3 py-3 sm:py-5 flex flex-row items-center justify-between gap-2">
              
              {/* Feedback Text (Left Side) */}
              {feedback !== 'none' && (
                <div className="flex-1 flex flex-col justify-center">
                  {feedback === 'correct' && (
                    <div className="text-green-700 animate-in slide-in-from-bottom-2">
                      <div className="font-black text-lg sm:text-2xl flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-full bg-green-200 flex items-center justify-center text-green-700 text-sm">✓</div>
                        Harika!
                      </div>
                    </div>
                  )}
                  {feedback === 'typo' && (
                    <div className="text-amber-800 animate-in slide-in-from-bottom-2">
                      <div className="font-black text-lg sm:text-2xl flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-full bg-amber-200 flex items-center justify-center text-amber-700 text-sm">!</div>
                        Harf hatası!
                      </div>
                      <div className="text-xs sm:text-base font-bold mt-0.5 opacity-90 truncate max-w-[180px] sm:max-w-none">
                        Doğrusu: <span className="font-black">{activeQuestion?.fitbTarget || activeQuestion?.expected}</span>
                      </div>
                    </div>
                  )}
                  {feedback === 'wrong' && (
                    <div className="text-red-700 animate-in slide-in-from-bottom-2">
                      <div className="font-black text-lg sm:text-2xl flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-full bg-red-200 flex items-center justify-center text-red-700 text-sm">✕</div>
                        {userAnswer.trim() ? "Yanlış" : "Pas geçildi"}
                      </div>
                      <div className="text-xs sm:text-base font-bold mt-0.5 opacity-90 truncate max-w-[180px] sm:max-w-none">
                        Doğrusu: <span className="font-black">{activeQuestion?.fitbTarget || activeQuestion?.expected}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons (Right Side or Full Row) */}
              <div className={`flex flex-row gap-2 shrink-0 ${feedback === 'none' ? 'w-full' : 'w-auto'}`}>
                {feedback === 'none' && !flashcardMode && (
                  <button 
                    className="flex-1 min-w-[80px] bg-sky-500 text-white font-black hover:bg-sky-400 py-3 rounded-xl text-xs sm:text-sm shadow-[0_4px_0_0_rgb(2,132,199)] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-1.5 uppercase"
                    onClick={() => {
                      if (!keyboardOpen) {
                        setPreferNativeKeyboard(false);
                        setKeyboardOpen(true);
                      } else {
                        setKeyboardOpen(false);
                      }
                    }}
                  >
                    <span>KLAVYE</span>
                  </button>
                )}
                {adminMode ? (
                  <button
                    onClick={() => setCurrentIndex(p => Math.min(filteredQuestions.length - 1, p + 1))}
                    disabled={currentIndex >= filteredQuestions.length - 1}
                    className="flex-1 px-4 py-3 rounded-xl font-black text-xs sm:text-sm transition-all bg-indigo-600 text-white hover:bg-indigo-500 shadow-[0_4px_0_0_rgb(67,56,202)] active:translate-y-1 active:shadow-none flex items-center justify-center gap-2 uppercase"
                  >
                    <span>SONRAKİ</span>
                  </button>
                ) : flashcardMode ? (
                  <button
                    onClick={() => setFlashcardMode(false)}
                    className="flex-1 px-4 py-3 rounded-xl font-black text-xs sm:text-sm transition-all bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-200 shadow-[0_4px_0_0_rgb(226,232,240)] active:translate-y-1 active:shadow-none flex items-center justify-center uppercase"
                  >
                    YAZMA MODU
                  </button>
                ) : (
                  <>
                    {feedback === 'none' && (
                      <button
                         onClick={handleSkip}
                         className="flex-1 min-w-[80px] px-2 py-3 rounded-xl font-black text-xs sm:text-sm transition-all bg-slate-500 text-white hover:bg-slate-400 shadow-[0_4px_0_0_rgb(71,85,105)] active:translate-y-1 active:shadow-none flex items-center justify-center whitespace-nowrap uppercase"
                      >
                         PAS GEÇ
                      </button>
                    )}
                    {activeQuestion?.type !== 'matching' && (
                      <button
                        onClick={feedback === 'none' ? handleCheck : handleNext}
                        disabled={feedback === 'none' && (activeQuestion?.type === 'scramble' ? selectedWords.length === 0 : !userAnswer.trim())}
                        className={`flex-[1.5] min-w-[100px] px-3 py-3 rounded-xl font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 whitespace-nowrap uppercase ${
                          feedback === 'none' 
                            ? ((activeQuestion?.type === 'scramble' ? selectedWords.length > 0 : userAnswer.trim()) 
                                ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-[0_4px_0_0_rgb(67,56,202)] active:translate-y-1 active:shadow-none' 
                                : 'bg-indigo-100 text-indigo-400 shadow-[0_4px_0_0_rgb(224,231,255)] cursor-not-allowed') 
                            : feedback === 'correct' 
                                ? 'bg-green-500 text-white hover:bg-green-400 shadow-[0_4px_0_0_rgb(22,163,74)] active:translate-y-1 active:shadow-none' 
                                : feedback === 'typo' 
                                    ? 'bg-amber-500 text-white hover:bg-amber-400 shadow-[0_4px_0_0_rgb(217,119,6)] active:translate-y-1 active:shadow-none' 
                                    : 'bg-red-500 text-white hover:bg-red-400 shadow-[0_4px_0_0_rgb(220,38,38)] active:translate-y-1 active:shadow-none'
                        }`}
                      >
                        {feedback === 'none' ? 'KONTROL ET' : 'DEVAM ET'}
                      </button>
                    )}
                    {activeQuestion?.type === 'matching' && feedback !== 'none' && (
                       <button
                         onClick={handleNext}
                         className="flex-[2] px-6 py-3 rounded-xl font-bold text-sm transition-all bg-green-600 text-white hover:bg-green-700 shadow-[0_3px_0_0_rgb(21,128,61)] active:translate-y-1 active:shadow-none flex items-center justify-center"
                       >
                          DEVAM ET
                       </button>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}
      </div>

      {selectedWord && (
        <div className="fixed top-28 left-1/2 -translate-x-1/2 z-[99999] bg-slate-900 text-white px-5 py-4 rounded-2xl shadow-2xl flex flex-col sm:flex-row items-center gap-3 animate-in slide-in-from-top-5 pointer-events-auto border border-slate-700">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="font-bold text-lg truncate max-w-[150px]">"{selectedWord.word}"</span>
            <input 
              id="custom-meaning-input"
              type="text" 
              placeholder="Kelimenin anlamı..." 
              value={customMeaning} 
              onChange={(e) => setCustomMeaning(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                   e.preventDefault();
                   handleAddUnknownWord();
                }
              }}
              className="flex-1 sm:w-40 px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500 placeholder:text-slate-500"
            />
          </div>
          <button 
            onPointerDown={(e) => {
              e.preventDefault(); // Prevent selection from clearing before click
              handleAddUnknownWord();
            }}
            disabled={isWordAdded}
            className={`w-full sm:w-auto px-4 py-2.5 rounded-xl font-bold text-sm transition-colors whitespace-nowrap shadow-sm cursor-pointer ${
              isWordAdded ? 'bg-emerald-500 text-white' : 'bg-indigo-500 hover:bg-indigo-400 text-white'
            }`}
          >
            {isWordAdded ? '✅ Eklendi' : '➕ Listeme Ekle'}
          </button>
        </div>
      )}
    </>
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
