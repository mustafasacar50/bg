"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Wand2, CheckCircle2, Eye } from "lucide-react";
import Link from "next/link";
import questionBank from "@/data/questions.json";

export default function GenerateExamPage() {
  const [title, setTitle] = useState("Yeni Deneme Sınavı");
  const [mcqCount, setMcqCount] = useState(5);
  const [matchCount, setMatchCount] = useState(2);
  const [blankCount, setBlankCount] = useState(2);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [createdExamId, setCreatedExamId] = useState("");
  
  // Date states (default empty means no restriction)
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [timeLimit, setTimeLimit] = useState(30);

  useEffect(() => {
    // Sınav sayısını çekip default ismi ayarla
    fetch("/api/manage-exams")
      .then(res => res.json())
      .then(data => {
        if (data.exams) {
          setTitle(`Yeni Deneme Sınavı ${data.exams.length + 1}`);
        }
      })
      .catch(err => console.error("Could not fetch exams for default title", err));
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      // Filter questions by type
      const mcqs = questionBank.filter(q => q.type === "mcq");
      const matches = questionBank.filter(q => q.type === "match");
      const blanks = questionBank.filter(q => q.type === "blank");

      // Randomly select requested amounts
      const shuffle = (array: any[]) => [...array].sort(() => 0.5 - Math.random());
      
      const selectedQuestions = [
        ...shuffle(mcqs).slice(0, mcqCount),
        ...shuffle(matches).slice(0, matchCount),
        ...shuffle(blanks).slice(0, blankCount)
      ];

      if (selectedQuestions.length === 0) {
        throw new Error("Lütfen en az 1 soru seçin.");
      }

      let totalWeight = 0;
      selectedQuestions.forEach(q => {
        if (q.type === "mcq") totalWeight += 1;
        else if (q.type === "match" || q.type === "matching") totalWeight += 2;
        else if (q.type === "blank") totalWeight += 3;
      });

      const baseUnit = 100 / totalWeight;
      let questionPoints: Record<string, number> = {};
      let runningSum = 0;

      selectedQuestions.forEach((q, index) => {
        let weight = 0;
        if (q.type === "mcq") weight = 1;
        else if (q.type === "match" || q.type === "matching") weight = 2;
        else if (q.type === "blank") weight = 3;

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
          description: "Otomatik olarak oluşturulmuş pratik sınavı.",
          timeLimit,
          startTime: startTime ? new Date(startTime).toISOString() : null,
          endTime: endTime ? new Date(endTime).toISOString() : null,
          questions: questionIds,
          questionPoints: questionPoints
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
                <div className="text-xs text-slate-400 mb-2">Havuzda: {questionBank.filter(q => q.type === "mcq").length} soru</div>
                <input 
                  type="number" 
                  min="0"
                  max={questionBank.filter(q => q.type === "mcq").length}
                  className="text-input" 
                  value={mcqCount}
                  onChange={e => setMcqCount(parseInt(e.target.value) || 0)}
                />
              </div>
              
              <div>
                <label className="label text-sm">Eşleştirme</label>
                <div className="text-xs text-slate-400 mb-2">Havuzda: {questionBank.filter(q => q.type === "match").length} soru</div>
                <input 
                  type="number" 
                  min="0"
                  max={questionBank.filter(q => q.type === "match").length}
                  className="text-input" 
                  value={matchCount}
                  onChange={e => setMatchCount(parseInt(e.target.value) || 0)}
                />
              </div>

              <div>
                <label className="label text-sm">Boşluk Doldurma</label>
                <div className="text-xs text-slate-400 mb-2">Havuzda: {questionBank.filter(q => q.type === "blank").length} soru</div>
                <input 
                  type="number" 
                  min="0"
                  max={questionBank.filter(q => q.type === "blank").length}
                  className="text-input" 
                  value={blankCount}
                  onChange={e => setBlankCount(parseInt(e.target.value) || 0)}
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
              (Otomatik Küsürat Düzeltmeli - Çoktan Seçmeli: 1x, Eşleştirme: 2x, Boşluk Doldurma: 3x)
            </div>

            {error && <div className="text-red-500 font-bold bg-red-50 p-4 rounded-xl">{error}</div>}

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
