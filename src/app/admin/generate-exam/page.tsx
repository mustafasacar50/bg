"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Wand2, CheckCircle2, Eye, BookOpen } from "lucide-react";
import Link from "next/link";
import questionBank from "@/data/questions.json";

export default function GenerateExamPage() {
  const [title, setTitle] = useState("Yeni Deneme Sınavı");
  const [mcqCount, setMcqCount] = useState(5);
  const [matchCount, setMatchCount] = useState(2);
  const [blankCount, setBlankCount] = useState(2);
  const [readingCount, setReadingCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [createdExamId, setCreatedExamId] = useState("");
  
  // Lesson filter states
  const [availableLessons, setAvailableLessons] = useState<string[]>([]);
  const [selectedLessons, setSelectedLessons] = useState<string[]>([]);
  
  // Date states (default empty means no restriction)
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [timeLimit, setTimeLimit] = useState(30);

  // Used questions tracking
  const [usedQuestionIds, setUsedQuestionIds] = useState<string[]>([]);

  useEffect(() => {
    // Sınav sayısını çekip default ismi ayarla
    fetch("/api/manage-exams")
      .then(res => res.json())
      .then(data => {
        if (data.exams) {
          setTitle(`Yeni Deneme Sınavı ${data.exams.length + 1}`);
          
          // Collect used question IDs from existing exams
          let usedIds: string[] = [];
          data.exams.forEach((exam: any) => {
            if (exam.questions && Array.isArray(exam.questions)) {
              usedIds = [...usedIds, ...exam.questions];
            }
          });
          setUsedQuestionIds(usedIds);
        }
      })
      .catch(err => console.error("Could not fetch exams for default title", err));
      
    // Extract unique lessons from question bank
    const lessons = new Set<string>();
    questionBank.forEach((q: any) => {
      if (q.lesson) lessons.add(q.lesson);
    });
    const lessonsArray = Array.from(lessons).sort((a, b) => {
      // Try to extract the number before ".DERS" or ". DERS"
      const matchA = a.match(/(\d+)\s*\.\s*DERS/i);
      const matchB = b.match(/(\d+)\s*\.\s*DERS/i);
      if (matchA && matchB) {
        return parseInt(matchA[1]) - parseInt(matchB[1]);
      }
      // Fallback to basic string sort if no numbers found
      return a.localeCompare(b);
    });
    setAvailableLessons(lessonsArray);
    
  }, []);

  const toggleLesson = (lesson: string) => {
    if (selectedLessons.includes(lesson)) {
      setSelectedLessons(selectedLessons.filter(l => l !== lesson));
    } else {
      setSelectedLessons([...selectedLessons, lesson]);
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData("index", index.toString());
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData("index"));
    if (isNaN(dragIndex) || dragIndex === dropIndex) return;

    const newLessons = [...availableLessons];
    const draggedItem = newLessons[dragIndex];
    newLessons.splice(dragIndex, 1);
    newLessons.splice(dropIndex, 0, draggedItem);
    
    setAvailableLessons(newLessons);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      // Filter questions by lesson if any lessons are selected
      let filteredBank = questionBank as any[];
      if (selectedLessons.length > 0) {
        filteredBank = filteredBank.filter(q => selectedLessons.includes(q.lesson));
      }
      
      if (filteredBank.length === 0) {
        throw new Error("Seçilen derslerde hiç soru bulunamadı.");
      }

      // Filter out used questions
      const unusedBank = filteredBank.filter(q => !usedQuestionIds.includes(q.id));

      if (unusedBank.length === 0) {
        throw new Error("Seçilen derslerde kullanılmamış hiç soru bulunamadı. Lütfen eski sınavları silin veya yeni sorular ekleyin.");
      }

      // Filter questions by type
      const mcqs = unusedBank.filter(q => q.type === "mcq");
      const matches = unusedBank.filter(q => q.type === "match" || q.type === "matching");
      const blanks = unusedBank.filter(q => q.type === "blank");
      const readings = unusedBank.filter(q => q.type === "reading");

      // Check available questions
      if (mcqs.length < mcqCount) throw new Error(`Seçilen derslerde yeterli test sorusu yok. İstenen: ${mcqCount}, Bulunan: ${mcqs.length}`);
      if (matches.length < matchCount) throw new Error(`Seçilen derslerde yeterli eşleştirme sorusu yok. İstenen: ${matchCount}, Bulunan: ${matches.length}`);
      if (blanks.length < blankCount) throw new Error(`Seçilen derslerde yeterli boşluk doldurma sorusu yok. İstenen: ${blankCount}, Bulunan: ${blanks.length}`);
      if (readings.length < readingCount) throw new Error(`Seçilen derslerde yeterli okuma parçası sorusu yok. İstenen: ${readingCount}, Bulunan: ${readings.length}`);

      // Randomly select requested amounts
      const shuffle = (array: any[]) => [...array].sort(() => 0.5 - Math.random());
      
      const selectedQuestions = [
        ...shuffle(mcqs).slice(0, mcqCount),
        ...shuffle(matches).slice(0, matchCount),
        ...shuffle(blanks).slice(0, blankCount),
        ...shuffle(readings).slice(0, readingCount)
      ];

      if (selectedQuestions.length === 0) {
        throw new Error("Lütfen en az 1 soru seçin.");
      }

      let totalWeight = 0;
      selectedQuestions.forEach(q => {
        if (q.type === "mcq") totalWeight += 1;
        else if (q.type === "match" || q.type === "matching") totalWeight += 2;
        else if (q.type === "blank") totalWeight += 3;
        else if (q.type === "reading") totalWeight += 4;
      });

      const baseUnit = 100 / totalWeight;
      let questionPoints: Record<string, number> = {};
      let runningSum = 0;

      selectedQuestions.forEach((q, index) => {
        let weight = 0;
        if (q.type === "mcq") weight = 1;
        else if (q.type === "match" || q.type === "matching") weight = 2;
        else if (q.type === "blank") weight = 3;
        else if (q.type === "reading") weight = 4;

        let points = 0;
        if (index === selectedQuestions.length - 1) {
          // Küsüratları son soruya ekleyerek tam 100 olmasını sağla
          points = 100 - runningSum;
        } else {
          points = Math.round(weight * baseUnit);
          runningSum += points;
        }
        questionPoints[q.id] = points;
      });

      // We only need to store the question IDs in the exam object to keep exams.json lightweight
      const questionIds = selectedQuestions.map(q => q.id);

      const response = await fetch("/api/generate-exam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: selectedLessons.length > 0 
            ? `Otomatik oluşturulmuş sınav. İçerdiği dersler: ${selectedLessons.join(", ")}`
            : "Otomatik olarak tüm konulardan oluşturulmuş pratik sınavı.",
          timeLimit,
          startTime: startTime ? new Date(startTime).toISOString() : null,
          endTime: endTime ? new Date(endTime).toISOString() : null,
          questions: questionIds,
          questionPoints: questionPoints,
          lessons: selectedLessons
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || "Sınav oluşturulamadı");
      }

      if (result.exam && result.exam.id) {
        setCreatedExamId(result.exam.id);
      }
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper to format lesson names for display (e.g. "A1_Ders1" -> "A1 Ders 1")
  const formatLessonName = (lesson: string) => {
    return lesson.replace(/_/g, ' ').replace(/-/g, ' ');
  };

  return (
    <div className="py-4 max-w-3xl mx-auto">
      <Link href="/admin" className="flex items-center gap-2 text-slate-500 hover:text-primary mb-6 transition-colors w-max">
        <ArrowLeft size={20} />
        <span className="font-semibold">Admin Paneline Dön</span>
      </Link>

      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-primary/10 p-3 rounded-xl text-primary">
            <Wand2 size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Dinamik Sınav Üretici</h1>
            <p className="text-slate-500 text-sm">Soru bankasından rastgele sorularla anında sınav oluşturun.</p>
          </div>
        </div>

        {success ? (
          <div className="bg-green-50 text-green-700 p-8 rounded-xl border border-green-100 flex flex-col items-center justify-center text-center">
            <CheckCircle2 size={48} className="mb-4 text-green-500" />
            <h2 className="text-xl font-bold mb-2">Sınav Başarıyla Oluşturuldu!</h2>
            <p className="mb-6">Öğrencileriniz panellerinde bu sınavı hemen görebilirler.</p>
            <div className="flex gap-4">
              <button onClick={() => {
                setSuccess(false);
                // Also update the count for the new exam title
                setTitle(prev => {
                  const num = parseInt(prev.replace("Yeni Deneme Sınavı ", "")) || 0;
                  return `Yeni Deneme Sınavı ${num + 1}`;
                });
              }} className="btn bg-white text-green-700 border border-green-200 hover:bg-green-100 px-6 py-3 rounded-full font-bold">
                Yeni Bir Sınav Daha Üret
              </button>
              <Link 
                href={`/admin/exam-preview/${createdExamId}`}
                className="btn btn-primary bg-green-600 hover:bg-green-700 px-6 py-3 rounded-full font-bold flex items-center gap-2"
              >
                <Eye size={20} /> Sınavı Önizle ve Düzenle
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleGenerate} className="flex flex-col gap-6">
            <div>
              <label className="label">Sınav Başlığı</label>
              <input 
                type="text" 
                className="text-input" 
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
              />
            </div>

            {/* LESSON FILTERS */}
            {availableLessons.length > 0 && (
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen size={20} className="text-indigo-600" />
                  <label className="label mb-0">Ders Filtresi (Opsiyonel)</label>
                </div>
                <p className="text-sm text-slate-500 mb-4">
                  Soruların hangi derslerden seçileceğini belirleyin. Hiçbirini seçmezseniz tüm havuzdan karışık soru gelir.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {availableLessons.map((lesson, index) => (
                    <label 
                      key={lesson}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDrop={(e) => handleDrop(e, index)}
                      onDragOver={handleDragOver}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-grab active:cursor-grabbing transition-colors ${
                        selectedLessons.includes(lesson) 
                          ? 'bg-indigo-50 border-indigo-200 text-indigo-900' 
                          : 'bg-white border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                        checked={selectedLessons.includes(lesson)}
                        onChange={() => toggleLesson(lesson)}
                      />
                      <span className="font-semibold text-sm">{formatLessonName(lesson)}</span>
                    </label>
                  ))}
                </div>
                {selectedLessons.length > 0 && (
                  <div className="mt-4 text-xs font-bold text-indigo-600 flex justify-end">
                    <button type="button" onClick={() => setSelectedLessons([])} className="hover:underline">
                      Seçimleri Temizle
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 p-6 rounded-xl border border-slate-100">
              <div>
                <label className="label text-sm">Başlangıç Zamanı</label>
                <div className="text-xs text-slate-400 mb-2">Opsiyonel</div>
                <input 
                  type="datetime-local" 
                  className="text-input" 
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                />
              </div>
              
              <div>
                <label className="label text-sm">Bitiş Zamanı</label>
                <div className="text-xs text-slate-400 mb-2">Opsiyonel</div>
                <input 
                  type="datetime-local" 
                  className="text-input" 
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                />
              </div>

              <div>
                <label className="label text-sm">Süre (Dakika)</label>
                <div className="text-xs text-slate-400 mb-2">Varsayılan: 30dk</div>
                <input 
                  type="number" 
                  min="1"
                  className="text-input" 
                  value={timeLimit}
                  onChange={e => setTimeLimit(parseInt(e.target.value) || 30)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 p-6 rounded-xl border border-slate-100">
              <div>
                <label className="label text-sm">Test (Çoktan Seçmeli)</label>
                <div className="text-xs font-bold text-indigo-500 mb-2">
                  Kullanılabilir: {
                    (selectedLessons.length > 0 
                      ? questionBank.filter(q => selectedLessons.includes(q.lesson) && q.type === 'mcq' && !usedQuestionIds.includes(q.id)) 
                      : questionBank.filter(q => q.type === 'mcq' && !usedQuestionIds.includes(q.id))
                    ).length
                  } soru
                </div>
                <input 
                  type="number" 
                  min="0"
                  max={(selectedLessons.length > 0 ? questionBank.filter(q => selectedLessons.includes(q.lesson) && q.type === 'mcq' && !usedQuestionIds.includes(q.id)) : questionBank.filter(q => q.type === 'mcq' && !usedQuestionIds.includes(q.id))).length}
                  className="text-input" 
                  value={mcqCount}
                  onChange={e => setMcqCount(parseInt(e.target.value) || 0)}
                />
              </div>
              
              <div>
                <label className="label text-sm">Eşleştirme</label>
                <div className="text-xs font-bold text-indigo-500 mb-2">
                  Kullanılabilir: {
                    (selectedLessons.length > 0 
                      ? questionBank.filter(q => selectedLessons.includes(q.lesson) && (q.type === 'match' || q.type === 'matching') && !usedQuestionIds.includes(q.id)) 
                      : questionBank.filter(q => (q.type === 'match' || q.type === 'matching') && !usedQuestionIds.includes(q.id))
                    ).length
                  } soru
                </div>
                <input 
                  type="number" 
                  min="0"
                  max={(selectedLessons.length > 0 ? questionBank.filter(q => selectedLessons.includes(q.lesson) && (q.type === 'match' || q.type === 'matching') && !usedQuestionIds.includes(q.id)) : questionBank.filter(q => (q.type === 'match' || q.type === 'matching') && !usedQuestionIds.includes(q.id))).length}
                  className="text-input" 
                  value={matchCount}
                  onChange={e => setMatchCount(parseInt(e.target.value) || 0)}
                />
              </div>

              <div>
                <label className="label text-sm">Boşluk Doldurma</label>
                <div className="text-xs font-bold text-indigo-500 mb-2">
                  Kullanılabilir: {
                    (selectedLessons.length > 0 
                      ? questionBank.filter(q => selectedLessons.includes(q.lesson) && q.type === 'blank' && !usedQuestionIds.includes(q.id)) 
                      : questionBank.filter(q => q.type === 'blank' && !usedQuestionIds.includes(q.id))
                    ).length
                  } soru
                </div>
                <input 
                  type="number" 
                  min="0"
                  max={(selectedLessons.length > 0 ? questionBank.filter(q => selectedLessons.includes(q.lesson) && q.type === 'blank' && !usedQuestionIds.includes(q.id)) : questionBank.filter(q => q.type === 'blank' && !usedQuestionIds.includes(q.id))).length}
                  className="text-input" 
                  value={blankCount}
                  onChange={e => setBlankCount(parseInt(e.target.value) || 0)}
                />
              </div>

              <div>
                <label className="label text-sm">Okuma Parçası</label>
                <div className="text-xs font-bold text-indigo-500 mb-2">
                  Kullanılabilir: {
                    (selectedLessons.length > 0 
                      ? questionBank.filter(q => selectedLessons.includes(q.lesson) && q.type === 'reading' && !usedQuestionIds.includes(q.id)) 
                      : questionBank.filter(q => q.type === 'reading' && !usedQuestionIds.includes(q.id))
                    ).length
                  } soru
                </div>
                <input 
                  type="number" 
                  min="0"
                  max={(selectedLessons.length > 0 ? questionBank.filter(q => selectedLessons.includes(q.lesson) && q.type === 'reading' && !usedQuestionIds.includes(q.id)) : questionBank.filter(q => q.type === 'reading' && !usedQuestionIds.includes(q.id))).length}
                  className="text-input" 
                  value={readingCount}
                  onChange={e => setReadingCount(parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between bg-purple-50 p-4 rounded-xl border border-purple-100">
              <div className="text-purple-900 font-medium">Toplam Sınav Puanı:</div>
              <div className="text-2xl font-black text-purple-700">
                100 Puan
              </div>
            </div>
            <div className="text-xs text-purple-400 text-right -mt-4">
              (Otomatik Küsürat Düzeltmeli - Çoktan Seçmeli: 1x, Eşleştirme: 2x, Boşluk Doldurma: 3x, Okuma: 4x)
            </div>

            {error && <div className="text-red-500 font-bold bg-red-50 p-4 rounded-xl border border-red-200">{error}</div>}

            <button disabled={loading} type="submit" className="btn btn-primary flex items-center justify-center gap-2 py-4 text-lg">
              {loading ? "Üretiliyor..." : (
                <>
                  <Wand2 size={24} /> Sınavı Oluştur
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
