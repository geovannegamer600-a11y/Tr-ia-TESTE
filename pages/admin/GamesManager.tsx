import React, { useState, useEffect, useRef } from 'react';
import { getGames, getCategories, getGamePlatforms, updateGame, deleteGame } from '../../store';
import { Game, Category, Platform, GameStatus, GamePlatform } from '../../types';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  Image as ImageIcon, 
  Upload, 
  Check,
  AlertTriangle,
  Clock,
  Filter,
  Package,
  Shield,
  CreditCard,
  ExternalLink,
  Zap,
  AlertCircle,
  RotateCcw,
  Gamepad2,
  Gamepad,
  DollarSign,
  PlusCircle
} from 'lucide-react';
import ImageResizerModal from '../../components/ImageResizerModal';

const GamesManager: React.FC = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [gamePlatforms, setGamePlatforms] = useState<GamePlatform[]>([]);
  const [search, setSearch] = useState('');
  
  const [filterPlatform, setFilterPlatform] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<Partial<Game> | null>(null);
  
  const [resizerImage, setResizerImage] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados para gerenciar a adição de novas faixas de preço no modal do jogo
  const [newDay, setNewDay] = useState<string>('');
  const [newVal, setNewVal] = useState<string>('');
  const [priceType, setPriceType] = useState<'Primária' | 'Secundária'>('Primária');

  useEffect(() => {
    setGames(getGames());
    setCategories(getCategories());
    setGamePlatforms(getGamePlatforms());

    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredGames = games.filter(g => {
    if (g.id?.startsWith('partner_') || !!g.externalUrl) return false;
    const matchesSearch = g.title.toLowerCase().includes(search.toLowerCase());
    const matchesPlatform = filterPlatform === 'all' || g.platform === filterPlatform;
    const matchesCategory = filterCategory === 'all' || g.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || g.status === filterStatus;
    return matchesSearch && matchesPlatform && matchesCategory && matchesStatus;
  });

  const clearFilters = () => {
    setFilterPlatform('all');
    setFilterCategory('all');
    setFilterStatus('all');
    setSearch('');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGame) return;

    const gameToSave: Game = {
      id: editingGame.id || `game_${Date.now()}`,
      title: editingGame.title || '',
      description: editingGame.description || '',
      platform: (editingGame.platform as Platform) || 'PS5',
      category: editingGame.category || (categories[0]?.name || 'Geral'),
      status: (editingGame.status as GameStatus) || 'Disponível',
      stockPrimary: Number(editingGame.stockPrimary) || 0,
      stockSecondary: Number(editingGame.stockSecondary) || 0,
      minStockPrimary: Number(editingGame.minStockPrimary) || 0,
      minStockSecondary: Number(editingGame.minStockSecondary) || 0,
      isFeatured: !!editingGame.isFeatured,
      isNew: !!editingGame.isNew,
      mostRented: !!editingGame.mostRented,
      price: Number(editingGame.price) || 0,
      pricePrimary: Number(editingGame.pricePrimary) || Number(editingGame.price) || 0,
      priceSecondary: Number(editingGame.priceSecondary) || Number(editingGame.price) || 0,
      customPriceTable: editingGame.customPriceTable || {},
      imageUrl: editingGame.imageUrl || 'https://picsum.photos/600/800',
      images: editingGame.images || [],
      rating: editingGame.rating || '18',
      releaseDate: editingGame.releaseDate || new Date().toISOString().split('T')[0],
      externalUrl: editingGame.externalUrl || '',
      ps5Compatible: !!editingGame.ps5Compatible,
      stockPrimaryPS5: Number(editingGame.stockPrimaryPS5) || 0,
      stockSecondaryPS5: Number(editingGame.stockSecondaryPS5) || 0
    };

    updateGame(gameToSave);
    setGames(getGames());
    setIsModalOpen(false);
    setEditingGame(null);
  };

  const addCustomPrice = () => {
    if (!newDay || !newVal || !editingGame) return;
    const daysNum = parseInt(newDay);
    const priceNum = parseFloat(newVal);
    
    const currentTable = editingGame.customPriceTable || {};
    const typeTable = currentTable[priceType] || {};
    
    const updatedTable = {
      ...currentTable,
      [priceType]: {
        ...typeTable,
        [daysNum]: priceNum
      }
    };

    setEditingGame({ ...editingGame, customPriceTable: updatedTable });
    setNewDay('');
    setNewVal('');
  };

  const removeCustomPrice = (type: 'Primária' | 'Secundária', days: number) => {
    if (!editingGame?.customPriceTable) return;
    const currentTable = { ...editingGame.customPriceTable };
    const typeTable = { ...currentTable[type] };
    delete typeTable[days];
    currentTable[type] = typeTable;
    setEditingGame({ ...editingGame, customPriceTable: currentTable });
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteGame(deleteId);
      setGames(getGames());
      setDeleteId(null);
    }
  };

  const openModal = (game?: Game) => {
    setEditingGame(game || {
      status: 'Disponível',
      platform: 'PS5',
      stockPrimary: 1,
      stockSecondary: 1,
      minStockPrimary: 1,
      minStockSecondary: 1,
      isFeatured: false,
      isNew: true,
      price: 45,
      pricePrimary: 45,
      priceSecondary: 40,
      customPriceTable: { Primária: {}, Secundária: {} },
      rating: '18',
      category: categories[0]?.name || 'Geral',
      releaseDate: new Date().toISOString().split('T')[0],
      ps5Compatible: false,
      stockPrimaryPS5: 0,
      stockSecondaryPS5: 0
    });
    setIsModalOpen(true);
  };

  const handleImageUploadRequest = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setResizerImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const isFilterActive = filterPlatform !== 'all' || filterCategory !== 'all' || filterStatus !== 'all';

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white mb-2 uppercase italic tracking-tighter">GERENCIAR <span className="text-blue-500">JOGOS</span></h1>
          <p className="text-zinc-500 font-medium">Controle total sobre os títulos e estoque da locadora.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white font-black px-10 py-5 rounded-2xl transition-all shadow-xl shadow-blue-600/20 flex items-center gap-3 active:scale-95 uppercase tracking-widest text-xs"
        >
          <Plus className="w-5 h-5" /> NOVO TÍTULO
        </button>
      </div>

      <div className="bg-zinc-900 border border-white/5 rounded-[3rem] shadow-2xl overflow-hidden">
        <div className="p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-zinc-900/50">
          <div className="relative flex-grow max-w-xl">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-700" />
            <input 
              type="text" 
              placeholder="Buscar título..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-zinc-950 border border-white/5 text-white font-bold pl-16 pr-6 py-5 rounded-2xl focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600/50 w-full placeholder:text-zinc-800 transition-all shadow-inner outline-none"
            />
          </div>
          <div className="flex items-center gap-4 relative" ref={filterRef}>
             <div className="px-5 py-3 bg-zinc-950 border border-white/5 rounded-xl text-[10px] font-black uppercase text-zinc-500 tracking-widest">
                {filteredGames.length} Jogos
             </div>
             <button 
                onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
                className={`p-4 bg-zinc-950 border rounded-xl transition-all relative ${isFilterActive || isFilterMenuOpen ? 'border-blue-500 text-blue-500 shadow-lg shadow-blue-500/10' : 'border-white/5 text-zinc-700 hover:text-blue-500'}`}
             >
                <Filter className="w-5 h-5" />
                {isFilterActive && <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-zinc-950"></div>}
             </button>

             {isFilterMenuOpen && (
               <div className="absolute right-0 top-full mt-4 w-72 bg-zinc-950 border border-white/10 rounded-[2rem] shadow-2xl p-6 z-[80] animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Filtrar Jogos</h3>
                    {isFilterActive && (
                      <button onClick={clearFilters} className="text-[8px] font-black text-blue-500 hover:text-white flex items-center gap-1 uppercase tracking-widest transition-colors">
                        <RotateCcw className="w-3 h-3" /> Limpar
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[8px] font-black text-zinc-600 uppercase tracking-widest px-1">Plataforma</label>
                      <select 
                        value={filterPlatform}
                        onChange={(e) => setFilterPlatform(e.target.value)}
                        className="w-full bg-zinc-900 border border-white/5 rounded-xl px-4 py-2 text-[10px] font-bold text-white focus:outline-none focus:border-blue-500 transition-all"
                      >
                        <option value="all">TODAS</option>
                        {gamePlatforms.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[8px] font-black text-zinc-600 uppercase tracking-widest px-1">Categoria / Gênero</label>
                      <select 
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="w-full bg-zinc-900 border border-white/5 rounded-xl px-4 py-2 text-[10px] font-bold text-white focus:outline-none focus:border-blue-500 transition-all"
                      >
                        <option value="all">TODAS</option>
                        {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[8px] font-black text-zinc-600 uppercase tracking-widest px-1">Status do Jogo</label>
                      <select 
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-full bg-zinc-900 border border-white/5 rounded-xl px-4 py-2 text-[10px] font-bold text-white focus:outline-none focus:border-blue-500 transition-all"
                      >
                        <option value="all">TODOS</option>
                        <option value="Disponível">DISPONÍVEL</option>
                        <option value="Alugado">ALUGADO / EM USO</option>
                        <option value="Indisponível">INDISPONÍVEL</option>
                      </select>
                    </div>
                  </div>

                  <button 
                    onClick={() => setIsFilterMenuOpen(false)}
                    className="w-full mt-6 bg-blue-600 py-3 rounded-xl text-[9px] font-black text-white uppercase tracking-widest shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
                  >
                    Aplicar Filtros
                  </button>
               </div>
             )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-950/50 text-zinc-600 text-[10px] uppercase tracking-[0.3em] font-black">
                <th className="px-10 py-6">Título</th>
                <th className="px-10 py-6">Plataforma</th>
                <th className="px-10 py-6">Estoque P/S</th>
                <th className="px-10 py-6">Status</th>
                <th className="px-10 py-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredGames.length > 0 ? filteredGames.map(game => {
                const isPrimaryLow = game.stockPrimary <= (game.minStockPrimary || 0) && game.stockPrimary > 0;
                const isSecondaryLow = game.stockSecondary <= (game.minStockSecondary || 0) && game.stockSecondary > 0;
                
                return (
                  <tr key={game.id} className="hover:bg-zinc-800/20 transition-all group">
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-6">
                         <div className="w-12 h-16 rounded-xl overflow-hidden shadow-xl group-hover:scale-105 transition-transform border border-white/5">
                            <img src={game.imageUrl} className="w-full h-full object-cover" />
                         </div>
                         <div className="min-w-0">
                           <div className="flex items-center gap-2">
                             <p className="text-sm font-black text-white truncate uppercase tracking-tight">{game.title}</p>
                             {game.ps5Compatible && <span className="text-[8px] bg-blue-600/20 text-blue-400 px-1.5 py-0.5 rounded font-black uppercase tracking-widest">PS5 Ok</span>}
                           </div>
                           <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mt-1">ID: {game.id}</p>
                         </div>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <span className="px-3 py-1 bg-zinc-950 border border-white/5 rounded-lg text-[10px] font-black text-zinc-400 uppercase tracking-widest">{game.platform}</span>
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-4">
                         <div className="flex flex-col items-center gap-1 relative group/tip">
                            <CreditCard className={`w-3.5 h-3.5 ${game.stockPrimary <= 0 ? 'text-red-500' : isPrimaryLow ? 'text-amber-500' : 'text-emerald-500'}`} />
                            <span className={`text-[10px] font-black ${game.stockPrimary <= 0 ? 'text-red-500' : isPrimaryLow ? 'text-amber-500' : 'text-zinc-300'}`}>{game.stockPrimary}</span>
                            {isPrimaryLow && <AlertTriangle className="w-3 h-3 text-amber-500 absolute -top-4 animate-bounce" />}
                         </div>
                         <div className="w-px h-8 bg-white/5"></div>
                         <div className="flex flex-col items-center gap-1 relative group/tip">
                            <CreditCard className={`w-3.5 h-3.5 ${game.stockSecondary <= 0 ? 'text-red-500' : isSecondaryLow ? 'text-amber-500' : 'text-blue-500'}`} />
                            <span className={`text-[10px] font-black ${game.stockSecondary <= 0 ? 'text-red-500' : isSecondaryLow ? 'text-amber-500' : 'text-zinc-300'}`}>{game.stockSecondary}</span>
                            {isSecondaryLow && <AlertTriangle className="w-3 h-3 text-amber-500 absolute -top-4 animate-bounce" />}
                         </div>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      {game.status === 'Disponível' && (game.stockPrimary > 0 || game.stockSecondary > 0) ? (
                        <span className="flex items-center gap-2 text-emerald-500 text-[10px] font-black uppercase tracking-widest">
                          <Check className="w-4 h-4" /> Disponível
                        </span>
                      ) : (
                        <span className="flex items-center gap-2 text-red-400 text-[10px] font-black uppercase tracking-widest">
                          <Clock className="w-4 h-4" /> Esgotado / Em Uso
                        </span>
                      )}
                    </td>
                    <td className="px-10 py-6 text-right">
                      <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => openModal(game)} className="p-3 bg-zinc-950 text-zinc-500 hover:text-blue-500 rounded-xl border border-white/5 transition-all"><Edit2 className="w-4 h-4" /></button>
                         <button onClick={() => setDeleteId(game.id)} className="p-3 bg-zinc-950 text-zinc-500 hover:text-red-500 rounded-xl border border-white/5 transition-all"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={5} className="px-10 py-20 text-center">
                    <p className="text-zinc-600 font-black uppercase tracking-widest text-xs italic">Nenhum jogo encontrado com os filtros selecionados.</p>
                    {isFilterActive && (
                      <button onClick={clearFilters} className="mt-4 text-blue-500 font-bold uppercase text-[10px] hover:text-white transition-colors">Limpar filtros</button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && editingGame && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-zinc-950 w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-[3.5rem] border border-white/10 shadow-2xl flex flex-col animate-in zoom-in-95 duration-300 no-scrollbar">
             <div className="sticky top-0 bg-zinc-950/80 backdrop-blur-md px-12 py-10 border-b border-white/5 flex items-center justify-between z-10">
                <div>
                   <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mb-2 block">Editor de Registro</span>
                   <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">
                      {editingGame.id ? 'EDITAR GAME' : 'NOVO TÍTULO'}
                   </h2>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-4 bg-zinc-900 text-zinc-500 hover:text-white rounded-2xl border border-white/5 transition-all"><X className="w-8 h-8" /></button>
             </div>

             <form onSubmit={handleSave} className="p-12 space-y-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                   
                   <div className="lg:col-span-4 space-y-6">
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-[3/4] bg-zinc-900 border-2 border-dashed border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center cursor-pointer hover:border-blue-500/50 hover:bg-zinc-800/50 transition-all overflow-hidden relative group shadow-inner"
                      >
                         {editingGame.imageUrl ? (
                           <>
                             <img src={editingGame.imageUrl} className="w-full h-full object-cover" />
                             <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
                                <Upload className="w-10 h-10 text-white mb-3" />
                                <span className="text-[10px] font-black text-white uppercase tracking-widest">Alterar Arte</span>
                             </div>
                           </>
                         ) : (
                           <div className="text-center p-8">
                              <ImageIcon className="w-16 h-16 text-zinc-800 mx-auto mb-6" />
                              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Enviar Arte do Jogo</p>
                              <p className="text-[9px] text-zinc-800 mt-4 uppercase font-bold">Padrão 3:4 Automático</p>
                           </div>
                         )}
                         <input 
                           type="file" 
                           ref={fileInputRef} 
                           className="hidden" 
                           onChange={handleImageUploadRequest}
                           accept="image/*"
                         />
                      </div>
                   </div>

                   <div className="lg:col-span-8 space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div className="md:col-span-2 space-y-3">
                           <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-1">Título Oficial</label>
                           <input 
                              type="text" 
                              required
                              value={editingGame.title || ''}
                              onChange={(e) => setEditingGame({ ...editingGame, title: e.target.value })}
                              className="w-full bg-zinc-900 border border-white/5 rounded-2xl px-6 py-5 text-white font-bold focus:ring-4 focus:ring-blue-600/5 shadow-inner"
                              placeholder="Nome Completo do Jogo"
                           />
                         </div>

                         <div className="space-y-3">
                           <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-1">Plataforma</label>
                           <select 
                              value={editingGame.platform || 'PS5'}
                              onChange={(e) => setEditingGame({ ...editingGame, platform: e.target.value as Platform })}
                              className="w-full bg-zinc-900 border border-white/5 rounded-2xl px-6 py-5 text-white font-bold focus:ring-4 focus:ring-blue-600/5"
                           >
                              {gamePlatforms.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                           </select>
                         </div>

                         <div className="space-y-3">
                           <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-1">Gênero</label>
                           <select 
                              value={editingGame.category || categories[0]?.name}
                              onChange={(e) => setEditingGame({ ...editingGame, category: e.target.value })}
                              className="w-full bg-zinc-900 border border-white/5 rounded-2xl px-6 py-5 text-white font-bold focus:ring-4 focus:ring-blue-600/5"
                           >
                              {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                           </select>
                         </div>

                         {/* Retrocompatibilidade PS4/PS5 */}
                         <div className="md:col-span-2 space-y-6">
                            <div className="p-6 bg-blue-600/5 border border-blue-600/10 rounded-3xl flex items-center justify-between">
                               <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                                     <Gamepad2 className="w-6 h-6" />
                                  </div>
                                  <div>
                                     <p className="text-xs font-black text-white uppercase tracking-[0.2em]">Habilitar Retrocompatibilidade?</p>
                                     <p className="text-[9px] text-zinc-500 font-bold uppercase mt-1">Marque se este jogo pode ser alugado tanto para PS4 quanto para PS5.</p>
                                  </div>
                               </div>
                               <button 
                                 type="button"
                                 onClick={() => setEditingGame({ ...editingGame, ps5Compatible: !editingGame.ps5Compatible })}
                                 className={`w-14 h-7 rounded-full transition-all relative ${editingGame.ps5Compatible ? 'bg-blue-600' : 'bg-zinc-800'}`}
                               >
                                  <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${editingGame.ps5Compatible ? 'left-8' : 'left-1'}`}></div>
                               </button>
                            </div>

                            {/* Seção de Estoques Independentes */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                               {/* Estoque PS5 (PADRÃO) */}
                               <div className="space-y-6 p-8 bg-zinc-950 border border-white/5 rounded-[2.5rem]">
                                  <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] flex items-center gap-3">
                                     <Gamepad className="w-4 h-4" /> ESTOQUE PS5 (PADRÃO)
                                  </h4>
                                  <div className="grid grid-cols-2 gap-4">
                                     <div className="space-y-3">
                                       <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest px-1">Primária</label>
                                       <input 
                                          type="number" 
                                          min="0"
                                          value={editingGame.stockPrimary ?? 0}
                                          onChange={(e) => setEditingGame({ ...editingGame, stockPrimary: parseInt(e.target.value) })}
                                          className="w-full bg-zinc-900 border border-white/5 rounded-2xl px-5 py-4 text-white font-bold"
                                       />
                                     </div>
                                     <div className="space-y-3">
                                       <label className="text-[10px] font-black text-blue-500 uppercase tracking-widest px-1">Secundária</label>
                                       <input 
                                          type="number" 
                                          min="0"
                                          value={editingGame.stockSecondary ?? 0}
                                          onChange={(e) => setEditingGame({ ...editingGame, stockSecondary: parseInt(e.target.value) })}
                                          className="w-full bg-zinc-900 border border-white/5 rounded-2xl px-5 py-4 text-white font-bold"
                                       />
                                     </div>
                                  </div>

                                  {/* Alerta de Estoque Mínimo PS5/Geral */}
                                  <div className="pt-4 border-t border-white/5 grid grid-cols-2 gap-4">
                                     <div className="space-y-3">
                                       <label className="text-[10px] font-black text-amber-500/50 uppercase tracking-widest px-1">Mínimo Alerta (P)</label>
                                       <input 
                                          type="number" 
                                          min="0"
                                          value={editingGame.minStockPrimary ?? 0}
                                          onChange={(e) => setEditingGame({ ...editingGame, minStockPrimary: parseInt(e.target.value) })}
                                          className="w-full bg-zinc-900 border border-white/5 rounded-2xl px-5 py-4 text-white font-bold opacity-60 focus:opacity-100"
                                       />
                                     </div>
                                     <div className="space-y-3">
                                       <label className="text-[10px] font-black text-amber-500/50 uppercase tracking-widest px-1">Mínimo Alerta (S)</label>
                                       <input 
                                          type="number" 
                                          min="0"
                                          value={editingGame.minStockSecondary ?? 0}
                                          onChange={(e) => setEditingGame({ ...editingGame, minStockSecondary: parseInt(e.target.value) })}
                                          className="w-full bg-zinc-900 border border-white/5 rounded-2xl px-5 py-4 text-white font-bold opacity-60 focus:opacity-100"
                                       />
                                     </div>
                                  </div>
                               </div>

                               {/* Estoque PS4 (Aparece condicionalmente se a toggle de retro estiver ON) */}
                               {editingGame.ps5Compatible && (
                                 <div className="space-y-6 p-8 bg-blue-600/5 border border-blue-600/10 rounded-[2.5rem] animate-in zoom-in-95 duration-300">
                                    <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] flex items-center gap-3">
                                       <Gamepad2 className="w-4 h-4" /> ESTOQUE EXCLUSIVO PS4
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4">
                                       <div className="space-y-3">
                                         <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest px-1">Primária PS4</label>
                                         <input 
                                            type="number" 
                                            min="0"
                                            value={editingGame.stockPrimaryPS5 ?? 0}
                                            onChange={(e) => setEditingGame({ ...editingGame, stockPrimaryPS5: parseInt(e.target.value) })}
                                            className="w-full bg-zinc-900 border border-blue-600/10 rounded-2xl px-5 py-4 text-white font-bold"
                                         />
                                       </div>
                                       <div className="space-y-3">
                                         <label className="text-[10px] font-black text-blue-500 uppercase tracking-widest px-1">Secundária PS4</label>
                                         <input 
                                            type="number" 
                                            min="0"
                                            value={editingGame.stockSecondaryPS5 ?? 0}
                                            onChange={(e) => setEditingGame({ ...editingGame, stockSecondaryPS5: parseInt(e.target.value) })}
                                            className="w-full bg-zinc-900 border border-blue-600/10 rounded-2xl px-5 py-4 text-white font-bold"
                                         />
                                       </div>
                                    </div>
                                 </div>
                               )}
                            </div>
                         </div>

                         {/* Configuração Individual de Preços (TABELA DIAS/VALORES) */}
                         <div className="md:col-span-2 space-y-8 p-8 bg-emerald-600/5 border border-emerald-600/10 rounded-[2.5rem]">
                            <div className="flex items-center justify-between">
                              <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] flex items-center gap-3">
                                <DollarSign className="w-4 h-4" /> PRECIFICAÇÃO INDIVIDUAL (DIAS E VALORES)
                              </h4>
                              <div className="flex bg-zinc-900 p-1 rounded-xl">
                                <button type="button" onClick={() => setPriceType('Primária')} className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${priceType === 'Primária' ? 'bg-emerald-600 text-white' : 'text-zinc-600'}`}>Primária</button>
                                <button type="button" onClick={() => setPriceType('Secundária')} className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${priceType === 'Secundária' ? 'bg-emerald-600 text-white' : 'text-zinc-600'}`}>Secundária</button>
                              </div>
                            </div>

                            <div className="flex gap-4">
                              <div className="flex-1 space-y-2">
                                <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest px-1">Dias</label>
                                <input type="number" value={newDay} onChange={e => setNewDay(e.target.value)} className="w-full bg-zinc-900 border border-white/5 rounded-xl px-4 py-3 text-white text-sm" placeholder="Ex: 7" />
                              </div>
                              <div className="flex-1 space-y-2">
                                <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest px-1">Valor (R$)</label>
                                <input type="number" step="0.01" value={newVal} onChange={e => setNewVal(e.target.value)} className="w-full bg-zinc-900 border border-white/5 rounded-xl px-4 py-3 text-white text-sm" placeholder="Ex: 45.00" />
                              </div>
                              <button type="button" onClick={addCustomPrice} className="mt-7 bg-emerald-600 hover:bg-emerald-700 text-white px-6 rounded-xl transition-all"><Plus className="w-5 h-5" /></button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                              {(['Primária', 'Secundária'] as const).map(type => (
                                <div key={type} className="space-y-3">
                                  <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block border-b border-white/5 pb-2">Lista {type}</span>
                                  <div className="space-y-2 max-h-[200px] overflow-y-auto no-scrollbar">
                                    {Object.entries(editingGame.customPriceTable?.[type] || {}).sort(([a],[b]) => Number(a)-Number(b)).map(([days, price]) => (
                                      <div key={days} className="flex items-center justify-between bg-zinc-950 p-3 rounded-xl border border-white/5 group/row">
                                        <span className="text-[10px] font-bold text-white uppercase">{days} DIAS - <span className="text-emerald-500">R$ {Number(price).toFixed(2)}</span></span>
                                        <button type="button" onClick={() => removeCustomPrice(type, Number(days))} className="text-zinc-700 hover:text-red-500 transition-colors opacity-0 group-hover/row:opacity-100"><X className="w-4 h-4" /></button>
                                      </div>
                                    ))}
                                    {Object.keys(editingGame.customPriceTable?.[type] || {}).length === 0 && (
                                      <p className="text-[9px] text-zinc-700 uppercase italic font-bold text-center py-4">Tabela Global (Padrão)</p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                         </div>

                         <div className="space-y-3">
                           <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-1">Status Global</label>
                           <select 
                              value={editingGame.status || 'Disponível'}
                              onChange={(e) => setEditingGame({ ...editingGame, status: e.target.value as GameStatus })}
                              className={`w-full bg-zinc-900 border border-white/5 rounded-2xl px-6 py-5 font-black uppercase text-[11px] tracking-widest focus:ring-4 focus:ring-blue-600/5 ${editingGame.status === 'Disponível' ? 'text-emerald-500' : 'text-zinc-600'}`}
                           >
                              <option value="Disponível">✅ Disponível Agora</option>
                              <option value="Alugado">⏳ Em Uso / Alugado</option>
                              <option value="Indisponível">❌ Indisponível</option>
                           </select>
                         </div>

                         <div className="space-y-3">
                           <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-1">Preço Base Exibição (Catálogo)</label>
                           <input 
                              type="number" 
                              step="0.01"
                              value={editingGame.price ?? 0}
                              onChange={(e) => setEditingGame({ ...editingGame, price: parseFloat(e.target.value) })}
                              className="w-full bg-zinc-900 border border-white/5 rounded-2xl px-6 py-5 text-white font-bold focus:ring-4 focus:ring-blue-600/5 shadow-inner"
                              placeholder="Valor do Item"
                           />
                         </div>

                         <div className="md:col-span-2 space-y-3">
                           <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-1">Descrição do Jogo</label>
                           <textarea 
                              rows={5}
                              value={editingGame.description || ''}
                              onChange={(e) => setEditingGame({ ...editingGame, description: e.target.value })}
                              className="w-full bg-zinc-900 border border-white/5 rounded-[2rem] px-8 py-6 text-white font-medium focus:ring-4 focus:ring-blue-600/5 shadow-inner placeholder:text-zinc-800"
                              placeholder="Fale sobre o game..."
                           ></textarea>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="flex items-center justify-end gap-6 pt-12 border-t border-white/5">
                   <button 
                     type="button" 
                     onClick={() => setIsModalOpen(false)}
                     className="px-12 py-5 rounded-2xl bg-zinc-900 text-zinc-500 font-black uppercase tracking-widest text-xs hover:text-white transition-all border border-white/5"
                   >
                     CANCELAR
                   </button>
                   <button 
                     type="submit"
                     className="px-16 py-5 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-[0.3em] text-xs hover:bg-blue-700 transition-all shadow-2xl shadow-blue-600/20 active:scale-95"
                   >
                     SALVAR ALTERAÇÕES
                   </button>
                </div>
             </form>
          </div>
        </div>
      )}

      {resizerImage && (
        <ImageResizerModal 
          image={resizerImage}
          aspect={3/4}
          title="Ajustar Capa do Jogo (3:4)"
          onConfirm={(cropped) => {
            setEditingGame(prev => ({ ...prev, imageUrl: cropped }));
            setResizerImage(null);
          }}
          onCancel={() => setResizerImage(null)}
        />
      )}

      {deleteId && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-200">
           <div className="bg-zinc-950 w-full max-w-md rounded-[3rem] border border-white/10 p-10 text-center shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="w-20 h-20 bg-red-500/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-red-500/20">
                 <AlertCircle className="w-10 h-10 text-red-500" />
              </div>
              <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-4">Excluir Título</h2>
              <p className="text-zinc-500 text-[11px] font-bold uppercase tracking-widest leading-relaxed mb-10">
                Deseja realmente excluir este jogo? Esta ação não pode ser desfeita e removerá o título permanentemente do acervo.
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

export default GamesManager;