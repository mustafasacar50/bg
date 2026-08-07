'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Module {
  id: string;
  title: string;
  questionCount: number;
}

export default function TrainingListPage() {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/modules')
      .then(res => res.json())
      .then(data => {
        setModules(data.modules || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching modules:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Antrenman Modu</h1>
          <Link href="/" className="text-indigo-600 hover:text-indigo-800 font-medium">
            Ana Sayfaya Dön
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-lg font-semibold text-slate-800">Eğitim Modülleri</h2>
            <p className="text-slate-500 text-sm mt-1">Çalışmak istediğiniz dersi seçin ve interaktif olarak kelime/çeviri pratiği yapın.</p>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-500">Yükleniyor...</div>
          ) : modules.length === 0 ? (
            <div className="p-12 text-center text-slate-500">Henüz modül bulunmamaktadır.</div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {modules.map((mod) => (
                <li key={mod.id} className="p-4 sm:p-6 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">{mod.title}</h3>
                    <p className="text-sm text-slate-500 mt-1 font-medium">{mod.questionCount} soru içeriyor</p>
                    <p className="text-xs text-slate-400 mt-1">Dosya: {mod.id}.json</p>
                  </div>
                  <button
                    onClick={() => router.push(`/training/${mod.id}`)}
                    className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-2.5 border border-transparent text-sm font-bold rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                  >
                    Antrenmana Başla
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
