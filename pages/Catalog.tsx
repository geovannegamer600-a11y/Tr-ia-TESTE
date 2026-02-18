import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Search, 
  ChevronDown, 
  Filter, 
  X, 
  Monitor, 
  Gamepad2, 
  Smartphone, 
  Layers, 
  Cpu, 
  Joystick,
  Gamepad
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { getGames, getCategories, getStorePlatforms } from '../store';
import { Game, Platform, Category, CartItem, StorePlatform } from '../types';
import GameCard from '../components/GameCard';

interface CatalogProps {
  onAddToCart: (item: CartItem) => void;
}

const Catalog: React.FC<CatalogProps> = ({ onAddToCart }) => {
  const location = useLocation();
  const [games, setGames] = useState<Game[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [platforms, setPlatforms] = useState<StorePlatform[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recent');
  const [isGenreMenuOpen, setIsGenreMenuOpen] = useState(false);
  
  const genreMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setGames(getGames());
    setCategories(getCategories());
    setPlatforms(getStorePlatforms());
    
    const params = new URLSearchParams(location.search);
    const q = params.get('q');
    const cat = params.get('category');
    if (q) setSearchQuery(q);
    if (cat) setSelectedCategory(cat);

    const handleClickOutside = (event: MouseEvent) => {
      if (genreMenuRef.current && !genreMenuRef.current.contains(event.target as Node)) {
        setIsGenreMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [location.search]);

  useEffect(() => {
    // Efeito para focar nos jogos quando solicitado pelo rodapé ou outra página
    if (location.state && (location.state as any).scrollTo === 'games-list-section') {
      setTimeout(() => {
        const element = document.getElementById('games-list-section');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 500);
    }
  }, [location]);

  const filteredGames = useMemo(() => {
    let result = games.filter(g => {
      // REGRA ESTREITA: Ocultar produtos da Loja Parceira do catálogo de locação
      const isPartnerProduct = g.id?.startsWith('partner_') || !!g.externalUrl;
      const isDigitalRental = !isPartnerProduct;
      
      const matchSearch = g.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchPlatform = selectedPlatform === 'all' || g.platform === selectedPlatform;
      const matchCategory = selectedCategory === 'all' || g.category === selectedCategory;
      return isDigitalRental && matchSearch && matchPlatform && matchCategory;
    });

    if (sortBy === 'az') result.sort((a, b) => a.title.localeCompare(b.title));
    if (sortBy === 'recent') result.sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime());
    if (sortBy === 'price-low') result.sort((a, b) => a.price - b.price);

    return result;
  }, [games, searchQuery, selectedPlatform, selectedCategory, sortBy]);

  const IconRenderer = ({ name, className }: { name: string, className?: string }) => {
    const Icon = (LucideIcons as any)[name] || LucideIcons.HelpCircle;
    return <Icon className={className} />;
  };

  return (
    <div className="bg-[#09090b] min-h-screen">
      {/* Barra de Filtros com Scroll no Mobile */}
      <div className="bg-gradient-to-r from-[#002b5c] via-[#004ea1] to-[#005bb5] sticky top-16 md:top-20 z-[60] border-b border-white/10 shadow-2xl backdrop-blur-md w-full">
        <div className="max-w-7xl mx-auto flex items-stretch w-full">
          
          <div className="flex flex-1 items-center overflow-x-auto scrollbar-hide no-scrollbar scroll-smooth flex-nowrap">
            {platforms.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPlatform(p.id)}
                className={`group flex items-center gap-2 md:gap-3 px-5 md:px-6 py-4 md:py-6 text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap border-b-2 md:border-b-4 h-full relative shrink-0 ${
                  selectedPlatform === p.id 
                  ? 'bg-white/10 text-white border-white' 
                  : 'text-blue-100/60 border-transparent hover:text-white hover:bg-white/5'
                }`}
              >
                <IconRenderer 
                   name={p.iconName} 
                   className={`w-3.5 h-3.5 md:w-4 md:h-4 transition-transform group-hover:scale-110 ${selectedPlatform === p.id ? 'text-white' : 'text-blue-300/40'}`} 
                />
                {p.label}
              </button>
            ))}
          </div>
          
          <div className="relative flex items-center border-l border-white/10 shrink-0 bg-[#005bb5]/80 backdrop-blur-md" ref={genreMenuRef}>
            <button
              onClick={() => setIsGenreMenuOpen(!isGenreMenuOpen)}
              className={`px-4 md:px-10 py-4 md:py-6 text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-2 transition-all whitespace-nowrap border-b-2 md:border-b-4 h-full ${
                selectedCategory !== 'all' || isGenreMenuOpen
                ? 'bg-white/10 text-white border-white'
                : 'text-blue-100/70 border-transparent hover:text-white hover:bg-white/5'
              }`}
            >
              <Filter className="w-3.5 h-3.5 md:w-4 md:h-4" />
              <span className="hidden sm:inline">GÊNEROS</span> 
              <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${isGenreMenuOpen ? 'rotate-180 text-white' : 'text-blue-300'}`} />
            </button>

            {/* Mega Menu Dropdown */}
            {isGenreMenuOpen && (
              <div 
                className="absolute right-0 top-full mt-0 w-[280px] sm:w-[500px] md:w-[700px] bg-white shadow-2xl border-x border-b border-zinc-200 animate-in fade-in slide-in-from-top-4 duration-300 z-[70] rounded-b-2xl md:rounded-b-[2rem] overflow-hidden"
              >
                <div className="p-6 md:p-14 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-3 md:gap-x-12 max-h-[70vh] overflow-y-auto no-scrollbar">
                  <div className="sm:col-span-2 md:col-span-3 border-b border-zinc-100 pb-3 mb-1 sticky top-0 bg-white z-10">
                    <button 
                      onClick={() => { setSelectedCategory('all'); setIsGenreMenuOpen(false); }}
                      className={`flex items-center gap-2 text-left text-[8px] font-black uppercase tracking-[0.3em] transition-colors ${selectedCategory === 'all' ? 'text-blue-600' : 'text-zinc-400 hover:text-blue-600'}`}
                    >
                      <Layers className="w-3.5 h-3.5" /> TODOS OS GÊNEROS
                    </button>
                  </div>
                  
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => { setSelectedCategory(cat.name); setIsGenreMenuOpen(false); }}
                      className={`text-left text-[11px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 py-2 md:py-1 ${selectedCategory === cat.name ? 'text-blue-600' : 'text-zinc-900 hover:text-blue-600 hover:translate-x-2'}`}
                    >
                      <div className={`w-1 h-1 rounded-full ${selectedCategory === cat.name ? 'bg-blue-600 scale-150' : 'bg-zinc-200'}`} />
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div id="games-list-section" className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-6 md:py-12 relative z-10 scroll-mt-32">
        
        {/* Search & Sort Responsivo */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 md:gap-6 mb-8 md:mb-12 bg-zinc-900/40 p-4 md:p-6 rounded-2xl md:rounded-[2rem] border border-white/5">
           <div className="relative w-full lg:max-w-md">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-zinc-700" />
              <input 
                type="text" 
                placeholder="Busque um título..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-950 border border-white/10 rounded-xl md:rounded-2xl pl-12 md:pl-16 pr-4 py-3 md:py-4 text-sm text-white focus:outline-none focus:border-blue-600/5 shadow-inner font-medium placeholder:text-zinc-800"
              />
           </div>

           <div className="flex items-center gap-4 md:gap-8 w-full lg:w-auto justify-between lg:justify-end">
              <div className="flex flex-col">
                <span className="text-[8px] md:text-[9px] font-black text-zinc-600 uppercase tracking-widest">Acervo</span>
                <span className="text-white font-black text-xs md:text-lg">{filteredGames.length} <span className="text-zinc-700 text-[8px] md:text-[10px] uppercase">Games</span></span>
              </div>
              
              <div className="h-8 w-px bg-white/5 hidden md:block"></div>

              <div className="flex flex-col items-end">
                <span className="text-[8px] md:text-[9px] font-black text-zinc-600 uppercase tracking-widest text-right">Filtrar</span>
                <select 
                  value={sortBy} 
                  onChange={e => setSortBy(e.target.value)}
                  className="bg-zinc-900 text-blue-500 font-black outline-none cursor-pointer text-[10px] md:text-xs uppercase tracking-tighter hover:text-white transition-colors text-right px-2 py-1 rounded-lg border border-white/5"
                >
                  <option value="recent" className="bg-zinc-900 text-white">MAIS NOVOS</option>
                  <option value="az" className="bg-zinc-900 text-white">A-Z</option>
                  <option value="price-low" className="bg-zinc-900 text-white">MENOR PREÇO</option>
                </select>
              </div>
           </div>
        </div>

        {/* Listagem */}
        {filteredGames.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
            {filteredGames.map(game => <GameCard key={game.id} game={game} />)}
          </div>
        ) : (
          <div className="text-center py-20 md:py-40 bg-zinc-900/10 border border-white/5 rounded-[2rem] md:rounded-[4rem]">
             <h3 className="text-lg md:text-2xl font-black text-white mb-2 uppercase italic tracking-tighter">Nenhum resultado</h3>
             <p className="text-zinc-600 text-[10px] font-bold uppercase mb-8">Tente ajustar seus filtros ou busca.</p>
             <button 
               onClick={() => { setSelectedPlatform('all'); setSelectedCategory('all'); setSearchQuery(''); }}
               className="bg-blue-600 text-white px-8 py-3 rounded-lg font-black uppercase tracking-widest text-[9px] active:scale-95"
             >
               Limpar Tudo
             </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Catalog;