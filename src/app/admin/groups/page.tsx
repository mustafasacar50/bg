"use client";

import { useState, useEffect } from "react";
import { Users, Trash2, Edit2, X, Check, RefreshCw, ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function GroupsAdminPage() {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const sessionStr = localStorage.getItem("student_session");
    if (!sessionStr) {
      router.push("/");
      return;
    }
    try {
      const session = JSON.parse(sessionStr);
      if (session.role === 'admin') {
        setIsAuthenticated(true);
        fetchGroups();
      }
    } catch(e) {}
  }, [router]);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [editingGroupId, setEditingGroupId] = useState("");
  const [groupName, setGroupName] = useState("");
  const [modalSaving, setModalSaving] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin123") {
      setIsAuthenticated(true);
      fetchGroups();
    } else {
      alert("Hatalı şifre!");
    }
  };

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/groups");
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setGroups(data.groups || []);
      }
    } catch (err) {
      setError("Gruplar çekilirken bir hata oluştu.");
    }
    setLoading(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" isimli grubu silmek istediğinize emin misiniz? Bu işlem, bu gruptaki öğrencilerin gruplarını silmez ancak eşleşmeyi bozar.`)) return;
    
    try {
      const res = await fetch(`/api/groups?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setGroups(groups.filter(g => g.id !== id));
      } else {
        alert("Silinirken hata oluştu: " + data.error);
      }
    } catch (err) {
      alert("Silinirken bir hata oluştu.");
    }
  };

  const openAddModal = () => {
    setModalMode("add");
    setGroupName("");
    setIsModalOpen(true);
  };

  const openEditModal = (group: any) => {
    setModalMode("edit");
    setEditingGroupId(group.id);
    setGroupName(group.name);
    setIsModalOpen(true);
  };

  const handleSaveGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) return;
    
    setModalSaving(true);
    
    try {
      const isEdit = modalMode === "edit";
      const url = "/api/groups";
      const method = isEdit ? "PUT" : "POST";
      const body = isEdit ? { id: editingGroupId, name: groupName.trim() } : { name: groupName.trim() };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();

      if (data.error) {
        alert(data.error);
      } else {
        setIsModalOpen(false);
        fetchGroups(); // Refresh list
      }
    } catch (err) {
      alert("Kaydedilirken bir hata oluştu.");
    }
    
    setModalSaving(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex flex-col justify-center max-w-sm mx-auto">
        <div className="card p-8">
          <h1 className="text-2xl font-bold mb-4 text-center">Grup Yönetimi</h1>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input 
              type="password" 
              placeholder="Admin Şifresi" 
              className="text-input"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">Giriş Yap</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4">
      <Link href="/admin" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 font-medium mb-4">
        <ArrowLeft size={16} /> Admin Paneline Dön
      </Link>

      <header className="flex flex-col sm:flex-row justify-between items-center mb-6 bg-white p-4 rounded-2xl shadow-sm border border-slate-200 gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="bg-pink-100 p-2 rounded-lg text-pink-600">
            <Users size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Sınıfları / Grupları Yönet</h2>
            <p className="text-sm text-slate-500">Sistemdeki toplam {groups.length} grup</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-start sm:justify-end">
          <button onClick={openAddModal} className="p-2 bg-pink-600 text-white hover:bg-pink-700 rounded-lg transition-colors flex items-center gap-2 text-sm font-bold">
            <Plus size={16} />
            Yeni Grup Ekle
          </button>
          <button onClick={fetchGroups} className="p-2 text-slate-500 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors flex items-center gap-2 text-sm font-bold">
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Yenile
          </button>
        </div>
      </header>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 border border-red-100 text-sm font-semibold">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-slate-500 font-semibold animate-pulse">Yükleniyor...</div>
        ) : groups.length === 0 ? (
          <div className="p-10 text-center text-slate-500 font-semibold">Sistemde henüz grup yok.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-4">Grup Adı</th>
                  <th className="p-4">Grup ID</th>
                  <th className="p-4 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {groups.map((g) => (
                  <tr key={g.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-bold text-slate-800 text-base">{g.name}</td>
                    <td className="p-4 text-slate-400 font-mono text-xs">{g.id}</td>
                    <td className="p-4 flex gap-2 justify-end">
                      <button 
                        onClick={() => openEditModal(g)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Düzenle"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(g.id, g.name)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Sil"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">
                {modalMode === "add" ? "Yeni Grup Ekle" : "Grubu Düzenle"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveGroup} className="p-4 flex flex-col gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Grup / Sınıf Adı</label>
                <input 
                  type="text" 
                  required
                  className="text-input" 
                  value={groupName} 
                  onChange={e => setGroupName(e.target.value)} 
                  placeholder="Örn: A1 Sınıfı, Grup 1, vb."
                />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition-colors"
                >
                  İptal
                </button>
                <button 
                  type="submit" 
                  disabled={modalSaving}
                  className="px-4 py-2 bg-pink-600 text-white rounded-xl font-bold hover:bg-pink-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {modalSaving ? <RefreshCw size={16} className="animate-spin" /> : <Check size={16} />}
                  {modalMode === "add" ? "Ekle" : "Kaydet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
