
import React, { useState, useEffect } from 'react';
import { getGamePlatforms, saveGamePlatforms } from '../../store';
import { GamePlatform } from '../../types';
import { Plus, Edit2, Trash2, X, Search, Monitor, PlusCircle, AlertCircle } from 'lucide-react';

const GamePlatformsManager: React.FC = () => {
  const [platforms, setPlatforms] = useState<GamePlatform[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlatform, setEditingPlatform] = useState<Partial<GamePlatform> | null>(null);
  const [search, setSearch] = useState('');
  
  // Estado para confirmação de exclusão
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    setPlatforms(getGamePlatforms());
  }, []);

  const filteredPlatforms = platforms.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlatform) return;

    let updatedPlatforms;
    if (editingPlatform.id) {
      updatedPlatforms = platforms.map(p => p.id === editingPlatform.id ? (editingPlatform as GamePlatform) : p);
    } else {
      updatedPlatforms = [...platforms, { id: `gplt_${Date.now()}`, name: editingPlatform.name || '' }];
    }

    setPlatforms(updatedPlatforms);
    saveGamePlatforms(updatedPlatforms);
    setIsModalOpen(false);
    setEditingPlatform(null);
  };

  const confirmDelete = () => {
    if (deleteId) {
      const updated = platforms.filter(p => p.id !== deleteId);
      setPlatforms(updated);
      saveGamePlatforms(updated);
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white mb-2 uppercase italic tracking-tighter">TAGS <span className="text-blue-500">CONSOLES</span></h1>
          <p className="text-zinc-500 font-medium">Cadastre as plataformas de hardware para os jogos (PS5, Xbox, etc).</p>
        </div>
        <button 
          onClick={() => { setEditingPlatform({ name: '' }); setIsModalOpen(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-black px-10 py-5 rounded-2xl transition-all shadow-xl shadow-blue-600/20 flex items-center gap-3 active:scale-95 uppercase tracking-widest text-xs"
        >
          <PlusCircle className="w-5 h-5" /> NOVA TAG
        </button>
      </div>

      <div className="bg-zinc-900 border border-white/5 rounded-[3rem] shadow-2xl overflow-hidden">
        <div className="p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-zinc-900/50">
           <div className="relative flex-grow max-w-xl">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-700" />
              <input 
                type="text" 
                placeholder="Filtrar tags..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-zinc-950 border border-white/5 text-white font-bold pl-16 pr-6 py-5 rounded-2xl focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600/50 w-full placeholder:text-zinc-800 transition-all shadow-inner outline-none"
              />
           </div>
           <div className="px-5 py-3 bg-zinc-950 border border-white/5 rounded-xl text-[10px] font-black uppercase text-zinc-500 tracking-widest">
              {filteredPlatforms.length} Tags
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-950/50 text-zinc-600 text-[10px] uppercase tracking-[0.3em] font-black">
                <th className="px-10 py-6">Nome da Tag</th>
                <th className="px-10 py-6">ID de Registro</th>
                <th className="px-10 py-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredPlatforms.map(p => (
                <tr key={p.id} className="hover:bg-zinc-800/20 transition-all group">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 bg-blue-600/5 border border-blue-600/10 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shadow-lg">
                        <Monitor className="w-5 h-5 text-blue-500 group-hover:text-white transition-all" />
                      </div>
                      <span className="font-black text-white uppercase tracking-tighter text-sm">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <span className="px-3 py-1 bg-zinc-950 border border-white/5 rounded-lg text-[10px] font-black text-zinc-600 uppercase tracking-widest">{p.id}</span>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => { setEditingPlatform(p); setIsModalOpen(true); }}
                        className="p-3 bg-zinc-950 text-zinc-500 hover:text-blue-500 rounded-xl border border-white/5 transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setDeleteId(p.id)}
                        className="p-3 bg-zinc-950 text-zinc-500 hover:text-red-500 rounded-xl border border-white/5 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && editingPlatform && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="bg-zinc-950 w-full max-w-lg rounded-[3.5rem] border border-white/10 shadow-2xl p-12 animate-in zoom-in-95 duration-300">
              <div className="flex items-center justify-between mb-10">
                 <div>
                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1 block">Editor de Tags</span>
                    <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">
                       {editingPlatform.id ? 'EDITAR' : 'NOVA'}
                    </h2>
                 </div>
                 <button onClick={() => setIsModalOpen(false)} className="p-4 bg-zinc-900 text-zinc-500 hover:text-white rounded-2xl border border-white/5 transition-all"><X className="w-8 h-8" /></button>
              </div>

              <form onSubmit={handleSave} className="space-y-10">
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-2 block">Nome da Tag</label>
                    <input 
                       type="text" 
                       required
                       autoFocus
                       value={editingPlatform.name || ''}
                       onChange={(e) => setEditingPlatform({ ...editingPlatform, name: e.target.value })}
                       className="w-full bg-zinc-900 border border-white/5 rounded-2xl px-8 py-6 text-white font-black uppercase tracking-tight text-xl focus:ring-4 focus:ring-blue-600/5 shadow-inner outline-none"
                       placeholder="EX: PS5"
                    />
                 </div>
                 <div className="flex items-center gap-6 pt-6">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-8 py-6 rounded-2xl bg-zinc-900 text-zinc-500 font-black uppercase tracking-widest text-xs hover:text-white transition-all border border-white/5">CANCELAR</button>
                    <button type="submit" className="flex-1 px-8 py-6 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-[0.3em] text-xs hover:bg-blue-700 transition-all shadow-2xl shadow-blue-600/20 active:scale-95">SALVAR</button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-200">
           <div className="bg-zinc-950 w-full max-w-md rounded-[3rem] border border-white/10 p-10 text-center shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="w-20 h-20 bg-red-500/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-red-500/20">
                 <AlertCircle className="w-10 h-10 text-red-500" />
              </div>
              <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-4">Excluir Tag</h2>
              <p className="text-zinc-500 text-[11px] font-bold uppercase tracking-widest leading-relaxed mb-10">
                Tem certeza que deseja remover esta tag? Jogos vinculados a ela precisarão ser atualizados manualmente.
              </p>
              <div className="flex gap-4">
                 <button onClick={() => setDeleteId(null)} className="flex-1 py-5 rounded-2xl bg-zinc-900 text-zinc-500 font-black uppercase tracking-widest text-[10px] hover:text-white transition-all">MANTER</button>
                 <button onClick={confirmDelete} className="flex-1 py-5 rounded-2xl bg-red-600 text-white font-black uppercase tracking-widest text-[10px] shadow-xl shadow-red-600/20 active:scale-95 transition-all">EXCLUIR</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default GamePlatformsManager;
