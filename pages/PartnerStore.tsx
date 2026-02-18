import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, Store, ExternalLink, ChevronDown, Filter, Layers } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { getGames, getSiteConfig, getStorePlatforms, getCategories } from '../store';
import { Game, SiteConfig, StorePlatform, Category } from '../types';
import GameCard from '../components/GameCard';

const PartnerStore: React.FC = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [config] = useState<SiteConfig>(getSiteConfig());
  const [platforms, setPlatforms] = useState<StorePlatform[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recent');
  const [isGenreMenuOpen, setIsGenreMenuOpen] = useState(false);
  
  const genreMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const allGames = getGames();
    setGames(allGames.filter(g => g.id?.startsWith('partner_') || !!g.externalUrl));
    setPlatforms(getStorePlatforms());
    setCategories(getCategories());
    window.scrollTo(0, 0);

    const handleClickOutside = (event: MouseEvent) => {
      if (genreMenuRef.current && !genreMenuRef.current.contains(event.target as Node)) {
        setIsGenreMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredGames = useMemo(() => {
    let result = games.filter(g => {
      const matchSearch = g.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchPlatform = selectedPlatform === 'all' || g.platform === selectedPlatform;
      const matchCategory = selectedCategory === 'all' || g.category === selectedCategory;
      return matchSearch && matchPlatform && matchCategory;
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
    <div className="bg-[#09090b] min-h-screen pb-20">
      {/* Header da Loja Parceira - DINÂMICO E SEM CORTE */}
      <div className="relative w-full overflow-hidden bg-zinc-950">
        {config.partnerStoreBannerImageUrl ? (
          <div className="w-full h-auto">
            <img 
              src={config.partnerStoreBannerImageUrl} 
              className="w-full h-auto object-contain block mx-auto" 
              alt="Banner Parceira" 
            />
          </div>
        ) : (
          <div className="relative py-16 md:py-24 bg-gradient-to-r from-[#002b5c] via-[#004ea1] to-[#005bb5]">
             <div className="absolute inset-0 bg-white/10 opacity-30 blur-[100px] translate-x-1/2 -translate-y-1/2 rounded-full"></div>
             <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="flex flex-col md:flex-row items-center justify-between gap-10">
                   <div className="max-w-2xl text-center md:text-left">
                      <div className="inline-flex items-center gap-2 bg-black/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-white text-[9px] font-black uppercase tracking-[0.3em] mb-6 whitespace-nowrap">
                         <Store className="w-3 h-3" />
                         <span className="whitespace-nowrap">{config.partnerStoreBadgeText}</span>
                      </div>
                      <h1 className="text-4xl md:text-7xl font-black text-white uppercase italic tracking-tighter leading-[0.95] mb-6">
                         {config.partnerStoreTitle}
                      </h1>
                      <p className="font-bold text-lg md:text-xl leading-relaxed text-blue-100 opacity-90">
                         {config.partnerStoreSubtitle}
                      </p>
                   </div>
                </div>
             </div>
          </div>
        )}
        
        {config.partnerStoreBannerImageUrl && (
          <div className="bg-zinc-900/50 backdrop-blur-md border-y border-white/5 py-8">
            <div className="max-w-7xl mx-auto px-6 text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-blue-600/20 px-3 py-1 rounded-full border border-blue-500/20 text-blue-400 text-[9px] font-black uppercase tracking-[0.3em] mb-4">
                <Store className="w-3 h-3" />
                <span>{config.partnerStoreBadgeText}</span>
              </div>
              <h2 className="text-2xl md:text-4xl font-black text-white uppercase italic tracking-tighter mb-2">{config.partnerStoreTitle}</h2>
              <p className="text-zinc-400 font-bold text-xs uppercase tracking-widest">{config.partnerStoreSubtitle}</p>
            </div>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
        {/* Busca e Filtros Complementares */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 md:gap-6 mb-12 bg-zinc-900/40 p-4 md:p-6 rounded-[2rem] border border-white/5">
           <div className="relative w-full lg:max-w-md">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-zinc-700" />
              <input 
                type="text" 
                placeholder="Buscar na loja parceira..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-950 border border-white/10 rounded-2xl pl-16 pr-6 py-4 text-sm text-white focus:outline-none focus:border-blue-500/5 shadow-inner font-medium placeholder:text-zinc-800"
              />
           </div>
           
           <div className="flex items-center gap-4 md:gap-8 w-full lg:w-auto justify-between lg:justify-end">
              <div className="flex flex-col">
                <span className="text-[8px] md:text-[9px] font-black text-zinc-600 uppercase tracking-widest">Catálogo</span>
                <span className="text-white font-black text-xs md:text-lg">{filteredGames.length} <span className="text-blue-500 uppercase text-[8px] md:text-[10px]">Produtos</span></span>
              </div>
              
              <div className="h-8 w-px bg-white/5 hidden md:block"></div>

              <div className="flex flex-col items-end">
                <span className="text-[8px] md:text-[9px] font-black text-zinc-600 uppercase tracking-widest text-right">Ordenar por</span>
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

        {/* Grid de Produtos */}
        {filteredGames.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredGames.map(game => <GameCard key={game.id} game={game} />)}
          </div>
        ) : (
          <div className="text-center py-48 bg-zinc-900/10 border border-white/5 rounded-[4rem]">
             <Store className="w-20 h-20 text-zinc-800 mx-auto mb-6" />
             <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Nenhum produto encontrado</h3>
             <p className="text-zinc-600 font-bold uppercase tracking-widest mt-2 text-xs">Tente ajustar sua busca ou filtros.</p>
             <button 
               onClick={() => { setSelectedPlatform('all'); setSelectedCategory('all'); setSearchQuery(''); }}
               className="mt-8 bg-blue-600 text-white px-8 py-3 rounded-lg font-black uppercase tracking-widest text-[9px] active:scale-95"
             >
               Limpar Tudo
             </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PartnerStore;