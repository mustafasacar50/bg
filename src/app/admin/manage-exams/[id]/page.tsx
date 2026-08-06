"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { ChevronLeft, Save, Search, ArrowRight, ArrowLeft, Loader2, Edit3, SaveAll } from "lucide-react";
import Link from "next/link";

export default function ExamEditorPage() {
  const router = useRouter();
  const params = useParams();
  const examId = params.id as string;

  const [exam, setExam] = useState<any>(null);
  const [allQuestions, setAllQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  
  // Local state for edits
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [level, setLevel] = useState("");
  const [time, setTime] = useState<number>(0);
  
  // Group targeting states
  const [groups, setGroups] = useState<any[]>([]);
  const [targetGroups, setTargetGroups] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(false);

  // Transfer list states (only stores IDs)
  const [examQuestionIds, setExamQuestionIds] = useState<string[]>([]);
  
  // Saving points state
  const [savingPoints, setSavingPoints] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [examId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [examRes, qRes, groupRes] = await Promise.all([
        fetch(`/api/manage-exams?id=${examId}`),
        fetch('/api/questions'),
        fetch('/api/groups')
      ]);

      const examData = await examRes.json();
      const qData = await qRes.json();
      const groupData = await groupRes.json();

      if (groupData.groups) {
        setGroups(groupData.groups);
      }

      if (examData.exam && qData.questions) {
        const e = examData.exam;
        setExam(e);
        setTitle(e.title || "");
        setDescription(e.description || "");
        setLevel(e.level || "A1");
        setTime(e.recommendedTimeMinutes || 30);
        setTargetGroups(e.targetGroups || []);
        setIsPublic(e.isPublic || false);
        setExamQuestionIds(e.questions || []);
        
        setAllQuestions(qData.questions);
      }
    } catch (error) {
      console.error("Failed to load data", error);
      alert("Veriler yüklenirken hata oluştu.");
    }
    setLoading(false);
  };

  // Fuzzy Search Helper
  // converts "ka to" into /ka.*to/i
  const createFuzzyRegex = (query: string) => {
    if (!query) return null;
    const clean = query.toLowerCase().replace(/\s+/g, '.*');
    try {
      return new RegExp(clean, 'i');
    } catch {
      return null;
    }
  };

  const regex = useMemo(() => createFuzzyRegex(searchQuery), [searchQuery]);

  // Derived states for Transfer List
  const examQuestionsList = useMemo(() => {
    return examQuestionIds
      .map(id => allQuestions.find(q => q.id === id))
      .filter(Boolean);
  }, [examQuestionIds, allQuestions]);

  const poolQuestionsList = useMemo(() => {
    return allQuestions
      .filter(q => !examQuestionIds.includes(q.id))
      .filter(q => filterType === "all" || q.type === filterType || (filterType === "match" && (q.type === "matching" || q.type === "match")))
      .filter(q => {
        if (!regex) return true;
        // Search in text depending on type
        const textToSearch = q.question + " " + (q.sentence || "") + " " + (q.hint || "");
        return regex.test(textToSearch);
      });
  }, [allQuestions, examQuestionIds, regex, filterType]);

  const addToExam = (qId: string) => {
    setExamQuestionIds(prev => [...prev, qId]);
  };

  const removeFromExam = (qId: string) => {
    setExamQuestionIds(prev => prev.filter(id => id !== qId));
  };

  const handlePointChange = async (qId: string, newPoints: string) => {
    const pointsNum = parseInt(newPoints);
    if (isNaN(pointsNum)) return;

    setSavingPoints(qId);
    
    // Update local state instantly for UI
    setAllQuestions(prev => prev.map(q => q.id === qId ? { ...q, points: pointsNum } : q));

    // Update API permanently
    try {
      await fetch('/api/questions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: qId, points: pointsNum })
      });
    } catch (e) {
      console.error("Failed to save point", e);
    }
    setSavingPoints(null);
  };

  const handleSaveExam = async () => {
    setSaving(true);
    try {
      const updatedExam = {
        ...exam,
        title,
        description,
        level,
        recommendedTimeMinutes: time,
        targetGroups: isPublic ? [] : targetGroups,
        isPublic: isPublic,
        questions: examQuestionIds
      };

      const res = await fetch('/api/manage-exams', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedExam)
      });
      
      const data = await res.json();
      if (data.success) {
        alert("Sınav başarıyla güncellendi!");
        router.push("/admin/manage-exams");
      } else {
        alert(data.error || "Hata oluştu.");
      }
    } catch (e) {
      alert("Kaydetme sırasında hata oluştu.");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="flex flex-col items-center text-slate-400 gap-4">
          <Loader2 size={40} className="animate-spin text-primary" />
          <p className="font-bold">Editör Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!exam) {
    return <div className="text-center p-10 font-bold text-red-500">Sınav bulunamadı!</div>;
  }

  const QuestionCard = ({ q, inExam }: { q: any, inExam: boolean }) => (
    <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow flex gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
            {q.type}
          </span>
          <span className="text-xs text-slate-400 truncate">{q.id}</span>
        </div>
        <div className="text-sm font-semibold text-slate-800 line-clamp-3 leading-snug">
          {(() => {
            const text = q.question || q.sentence || q.text || "";
            
            // If it's a reading question, replace ____1____ with the answer
            if (q.type === 'reading') {
              const parts = text.split(/(____\d+____)/g);
              return parts.map((part: string, i: number) => {
                const match = part.match(/____(\d+)____/);
                if (match) {
                  const blankKey = match[1];
                  const answerKey = `${q.id}_${blankKey}`;
                  const answerText = q.answers ? q.answers[answerKey] : "_____";
                  return (
                    <span key={i} className="text-indigo-700 font-bold px-1 mx-1 border-b-2 border-indigo-200">
                      {answerText}
                    </span>
                  );
                }
                return <span key={i}>{part}</span>;
              });
            }

            // Normal text formatting for MCQ etc. (replace **word** with a styled span)
            const parts = text.split(/(\*\*.*?\*\*)/g);
            return parts.map((part: string, i: number) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                const content = part.slice(2, -2);
                return (
                  <span key={i} className="text-indigo-700 font-black px-1 mx-1 bg-indigo-50/50 rounded inline-block">
                    — {content}
                  </span>
                );
              }
              return <span key={i}>{part}</span>;
            });
          })()}
        </div>
      </div>
      
      <div className="flex flex-col items-end gap-2 shrink-0">
        {/* Point Editor */}
        <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-1">
          <input 
            type="number" 
            className="w-12 text-center text-sm font-bold bg-transparent outline-none"
            value={q.points}
            onChange={(e) => {
              // Just update local temp without DB hit for fast typing
              setAllQuestions(prev => prev.map(oldQ => oldQ.id === q.id ? { ...oldQ, points: parseInt(e.target.value) || 0 } : oldQ));
            }}
            onBlur={(e) => handlePointChange(q.id, e.target.value)}
          />
          <span className="text-xs text-slate-500 font-bold pr-1">p</span>
          {savingPoints === q.id && <Loader2 size={12} className="animate-spin text-primary" />}
        </div>
        
        {/* Transfer Button */}
        {inExam ? (
          <button 
            onClick={() => removeFromExam(q.id)}
            className="w-full flex justify-center items-center gap-1 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold py-1.5 px-2 rounded-lg transition-colors"
          >
            Çıkar <ArrowRight size={14} />
          </button>
        ) : (
          <button 
            onClick={() => addToExam(q.id)}
            className="w-full flex justify-center items-center gap-1 bg-green-50 hover:bg-green-100 text-green-700 text-xs font-bold py-1.5 px-2 rounded-lg transition-colors"
          >
            <ArrowLeft size={14} /> Ekle
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="py-4 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <Link href="/admin/manage-exams" className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-primary transition-colors">
          <ChevronLeft size={16} /> Sınav Yönetimine Dön
        </Link>
        <button 
          onClick={handleSaveExam}
          disabled={saving}
          className="btn btn-primary flex items-center gap-2 px-6 py-2 rounded-full shadow-lg"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <SaveAll size={18} />}
          Sınavı Kaydet
        </button>
      </div>

      {/* Editor Header / Meta Data */}
      <div className="card mb-6 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Edit3 className="text-primary" />
          <h1 className="text-xl font-bold">Genel Sınav Ayarları</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Sınav Başlığı</label>
            <input type="text" className="text-input" value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="label">Açıklama</label>
            <input type="text" className="text-input" value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          <div>
            <label className="label">Seviye (Örn: A1)</label>
            <input type="text" className="text-input" value={level} onChange={e => setLevel(e.target.value)} />
          </div>
          <div>
            <label className="label">Süre (Dakika)</label>
            <input type="number" className="text-input" value={time} onChange={e => setTime(parseInt(e.target.value) || 0)} />
          </div>
        </div>
        {/* GROUP FILTERS */}
        <div className="mt-6 border-t border-slate-100 pt-6">
          <div className="flex justify-between items-start mb-2">
            <label className="label mb-0">Hedef Gruplar / Sınıflar</label>
            {/* Public Toggle */}
            <label className="flex items-center cursor-pointer gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-700">Herkese Açık</span>
              <div className="relative">
                <input 
                  type="checkbox" 
                  className="sr-only" 
                  checked={isPublic} 
                  onChange={() => {
                    setIsPublic(!isPublic);
                    if (!isPublic) setTargetGroups([]);
                  }} 
                />
                <div className={`block w-10 h-6 rounded-full transition-colors ${isPublic ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isPublic ? 'transform translate-x-4' : ''}`}></div>
              </div>
            </label>
          </div>
          
          <p className="text-sm text-slate-500 mb-4">
            {isPublic 
              ? "Bu sınav herkese açık olarak yayınlanacak. Belirli gruplara atamak için 'Herkese Açık' modunu kapatın." 
              : "Sınavın sadece belirli sınıflara görünmesini istiyorsanız seçin. Hiçbirini seçmezseniz sınav kapalı (gizli) kalır."}
          </p>
          
          {!isPublic && (
            groups.length === 0 ? (
              <div className="bg-amber-50 text-amber-700 p-4 rounded-xl border border-amber-200 text-sm font-semibold">
                Sistemde hiç grup/sınıf bulunmuyor. Lütfen admin panelinden grup ekleyin.
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {groups.map((g) => (
                    <label 
                      key={g.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        targetGroups.includes(g.name) 
                          ? 'bg-pink-50 border-pink-200 text-pink-900' 
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 text-pink-600 rounded border-gray-300 focus:ring-pink-500"
                        checked={targetGroups.includes(g.name)}
                        onChange={() => {
                          if (targetGroups.includes(g.name)) {
                            setTargetGroups(targetGroups.filter(t => t !== g.name));
                          } else {
                            setTargetGroups([...targetGroups, g.name]);
                          }
                        }}
                      />
                      <span className="font-semibold text-sm">{g.name}</span>
                    </label>
                  ))}
                </div>
                {targetGroups.length > 0 && (
                  <div className="mt-3 text-xs font-bold text-pink-600 flex justify-end">
                    <button type="button" onClick={() => setTargetGroups([])} className="hover:underline">
                      Grup Seçimlerini Temizle
                    </button>
                  </div>
                )}
              </>
            )
          )}
        </div>
      </div>

      {/* Transfer List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[800px]">
        {/* Left: In Exam */}
        <div className="flex flex-col bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden shadow-inner">
          <div className="p-4 bg-white border-b border-slate-200 shadow-sm z-10 flex justify-between items-center">
            <div>
              <h2 className="font-bold text-lg text-slate-800">Sınavdaki Sorular</h2>
              <p className="text-xs text-slate-500">{examQuestionsList.length} Soru Eklendi</p>
            </div>
            <div className="bg-primary-soft text-primary font-bold px-3 py-1 rounded-lg text-sm">
              Toplam {examQuestionsList.reduce((acc, q) => acc + (q.points || 0), 0)} Puan
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {examQuestionsList.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 font-medium">
                Sınavda hiç soru yok. Sağdan ekleyin.
              </div>
            ) : (
              examQuestionsList.map(q => <QuestionCard key={q.id} q={q} inExam={true} />)
            )}
          </div>
        </div>

        {/* Right: Pool */}
        <div className="flex flex-col bg-slate-100 border border-slate-200 rounded-2xl overflow-hidden shadow-inner">
          <div className="p-4 bg-white border-b border-slate-200 shadow-sm z-10 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <h2 className="font-bold text-lg text-slate-800">Soru Havuzu</h2>
              <span className="text-xs font-bold bg-slate-200 text-slate-600 px-2 py-1 rounded-lg">
                {poolQuestionsList.length} Soru Bulundu
              </span>
            </div>
            {/* Search and Filter */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Akıllı arama (Örn: 'ka to')"
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary-soft transition-all"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              <select 
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary-soft"
              >
                <option value="all">Tüm Tipler</option>
                <option value="mcq">Test (MCQ)</option>
                <option value="match">Eşleştirme</option>
                <option value="blank">Boşluk Doldurma</option>
                <option value="reading">Okuma Parçası</option>
              </select>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {poolQuestionsList.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 font-medium text-center p-6">
                Aramanıza uygun soru bulunamadı. Lütfen kelimeleri kontrol edin.
              </div>
            ) : (
              // Slice for performance if too many
              poolQuestionsList.slice(0, 100).map(q => <QuestionCard key={q.id} q={q} inExam={false} />)
            )}
            {poolQuestionsList.length > 100 && (
              <div className="text-center text-xs text-slate-400 font-bold py-2">
                ...ve {poolQuestionsList.length - 100} soru daha. Daraltmak için arama yapın.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
