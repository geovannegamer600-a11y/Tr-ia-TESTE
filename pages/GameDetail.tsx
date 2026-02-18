import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Monitor, 
  Tag, 
  Clock, 
  ShieldCheck, 
  Shield, 
  CreditCard, 
  X, 
  ShoppingCart,
  ChevronRight,
  Calendar,
  AlertTriangle,
  Award,
  Gamepad2,
  Gamepad,
  Check
} from 'lucide-react';
import { getGames, getSiteConfig } from '../store';
import { Game, CartItem, SiteConfig } from '../types';

interface GameDetailProps {
  onAddToCart: (item: CartItem) => void;
}

const GameDetail: React.FC<GameDetailProps> = ({ onAddToCart }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [game, setGame] = useState<Game | null>(null);
  const [config] = useState<SiteConfig>(getSiteConfig());
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedConsole, setSelectedConsole] = useState<'PS4' | 'PS5'>('PS4');
  const [selectedRentType, setSelectedRentType] = useState<'Primária' | 'Secundária'>('Primária');
  const [selectedDays, setSelectedDays] = useState<number>(7);

  useEffect(() => {
    const games = getGames();
    const found = games.find(g => g.id === id);
    if (found) {
      setGame(found);
      if (found.platform === 'PS5') {
        setSelectedConsole('PS5');
      } else {
        setSelectedConsole('PS4');
      }

      const customT = found.customPriceTable?.[selectedRentType];
      if (customT && Object.keys(customT).length > 0) {
        setSelectedDays(Number(Object.keys(customT).sort((a,b)=>Number(a)-Number(b))[0]));
      }
    }
    window.scrollTo(0, 0);
  }, [id, selectedRentType]);

  useEffect(() => {
    if (!game) return;

    const stockP = (game.ps5Compatible && selectedConsole === 'PS5') ? game.stockPrimaryPS5 || 0 : game.stockPrimary;
    const stockS = (game.ps5Compatible && selectedConsole === 'PS5') ? game.stockSecondaryPS5 || 0 : game.stockSecondary;
    
    if (selectedRentType === 'Primária' && stockP <= 0 && stockS > 0) {
      setSelectedRentType('Secundária');
    }

    const customT = game.customPriceTable?.[selectedRentType];
    if (customT && Object.keys(customT).length > 0) {
       if (customT[selectedDays] === undefined) {
          setSelectedDays(Number(Object.keys(customT).sort((a,b) => Number(a)-Number(b))[0]));
       }
    }
  }, [selectedConsole, game, selectedRentType, selectedDays]);

  if (!game) return null;

  const getStock = (type: 'Primária' | 'Secundária') => {
    if (selectedConsole === 'PS5' && game.ps5Compatible) {
      return type === 'Primária' ? (game.stockPrimaryPS5 || 0) : (game.stockSecondaryPS5 || 0);
    }
    return type === 'Primária' ? game.stockPrimary : game.stockSecondary;
  };

  const currentStockPrimary = getStock('Primária');
  const currentStockSecondary = getStock('Secundária');
  const isOutOfStockSelection = currentStockPrimary <= 0 && currentStockSecondary <= 0;

  const getIndividualPrice = () => {
    const customTable = game.customPriceTable?.[selectedRentType];
    if (customTable && customTable[selectedDays] !== undefined) {
      return customTable[selectedDays] as number;
    }

    const globalBaseTable = config.priceTable[selectedRentType];
    const globalBasePriceFor7Days = (globalBaseTable[7] || 45) as number; 
    
    const gameBasePrice = (selectedRentType === 'Primária' 
      ? (game.pricePrimary ?? game.price) 
      : (game.priceSecondary ?? game.price)) as number;
    
    const globalPriceForSelectedDays = (globalBaseTable[selectedDays] || 0) as number;
    return gameBasePrice + (globalPriceForSelectedDays - globalBasePriceFor7Days);
  };

  const currentPrice = getIndividualPrice();

  const getAvailableDays = () => {
    const customT = game.customPriceTable?.[selectedRentType];
    if (customT && Object.keys(customT).length > 0) {
      return Object.keys(customT).map(Number).sort((a,b) => a-b);
    }
    return Object.keys(config.priceTable[selectedRentType]).map(Number).sort((a,b) => a-b);
  };

  const availableDays = getAvailableDays();

  const confirmAction = () => {
    onAddToCart({ 
      gameId: game.id, 
      title: game.title, 
      type: selectedRentType, 
      days: selectedDays, 
      console: selectedConsole,
      selected: true 
    });
    setIsModalOpen(false);
    navigate('/cart');
  };

  const getDisplayStartingPrice = () => {
    const customT = game.customPriceTable?.['Primária'];
    if (customT && Object.keys(customT).length > 0) {
      const values = Object.values(customT) as number[];
      return Math.min(...values);
    }
    return (game.pricePrimary ?? game.price ?? 40) as number;
  };

  return (
    <div className="bg-[#09090b] min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 pt-6 md:pt-10">
        
        <div className="flex flex-wrap items-center gap-2 text-[8px] md:text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-6 md:mb-10 overflow-hidden">
          <Link to="/" className="hover:text-white transition-colors text-blue-500/80">HOME</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/catalog" className="hover:text-white transition-colors">CATÁLOGO</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-zinc-400 truncate">{game.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
          {/* Lado Esquerdo: O Card (Imagem) */}
          <div className="lg:col-span-5 space-y-8">
            <div className="max-w-md mx-auto lg:mx-0">
              <div className="group relative rounded-[2.5rem] overflow-hidden border border-white/5 shadow-[0_32px_64px_-15px_rgba(0,0,0,0.8)]">
                <img 
                  src={game.imageUrl} 
                  alt={game.title} 
                  className="w-full h-auto transition-transform duration-1000 group-hover:scale-110 block" 
                />
              </div>
            </div>
          </div>

          {/* Lado Direito: Informações e Detalhes ao Lado do Card */}
          <div className="lg:col-span-7 space-y-10">
            {/* Título e Chamada */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-black text-white leading-[0.95] uppercase italic tracking-tighter">
                {game.title}
              </h1>
            </div>

            {/* Sessão de Preço e Botão de Ação */}
            <div className="bg-zinc-900/40 border border-white/5 rounded-[2.5rem] p-8 md:p-10 space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                  <span className="text-zinc-600 text-[10px] font-black uppercase tracking-widest block mb-2">A PARTIR DE</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-blue-500 font-black text-base md:text-xl">R$</span>
                    <span className="text-white text-4xl md:text-5xl font-black italic tracking-tighter leading-none">
                      {getDisplayStartingPrice().toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-black px-12 py-6 rounded-3xl transition-all shadow-[0_20px_40px_-10px_rgba(37,99,235,0.4)] flex items-center justify-center gap-4 active:scale-95 uppercase tracking-[0.2em] text-xs md:text-sm"
                >
                  <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" /> CONFIRMAR ALUGUEL
                </button>
              </div>
            </div>

            {/* Detalhes do Jogo ao lado do card */}
            <div className="space-y-8">
              <div className="flex flex-col gap-4">
                <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter flex items-center gap-3">
                   DETALHES <span className="text-blue-500">DO JOGO</span>
                </h2>
                <div className="h-1 w-12 bg-blue-600 rounded-full"></div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  { icon: Monitor, label: 'Plataforma', value: game.ps5Compatible ? `${game.platform} & PS5` : game.platform, color: 'text-blue-500' },
                  { icon: Tag, label: 'Gênero', value: game.category, color: 'text-blue-400' },
                  { icon: Award, label: 'Classificação', value: game.rating === 'L' ? 'Livre' : `${game.rating} anos`, color: 'text-emerald-500' },
                  { icon: Clock, label: 'Entrega', value: 'Via WhatsApp', color: 'text-amber-500' },
                  { icon: ShieldCheck, label: 'Suporte', value: '24 Horas', color: 'text-blue-500' }
                ].map((item, i) => (
                  <div key={i} className="bg-zinc-900/40 border border-white/5 p-5 rounded-3xl hover:bg-zinc-800/40 hover:border-blue-500/20 transition-all group">
                    <item.icon className={`w-5 h-5 ${item.color} mb-3 transition-transform group-hover:scale-110`} />
                    <span className="text-[8px] text-zinc-600 uppercase font-black block mb-1 tracking-widest">{item.label}</span>
                    <span className="text-white font-bold text-xs uppercase tracking-tight">{item.value}</span>
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t border-white/5">
                <p className="text-sm md:text-base text-zinc-400 leading-relaxed font-medium">{game.description}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="bg-[#0c0c0e] w-full max-w-xl rounded-t-[3.5rem] sm:rounded-[3rem] border border-white/10 p-8 md:p-10 relative shadow-2xl animate-in slide-in-from-bottom-full sm:zoom-in-95 duration-400 max-h-[95vh] overflow-y-auto no-scrollbar">
              
              <div className="flex items-center justify-between mb-8">
                 <div className="space-y-1">
                    <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none">PLANO DE <span className="text-blue-500">ACESSO</span></h2>
                    <p className="text-[8px] text-zinc-600 font-black uppercase tracking-[0.2em]">Configuração Instantânea</p>
                 </div>
                 <button onClick={() => setIsModalOpen(false)} className="p-2.5 bg-zinc-900/50 text-zinc-500 hover:text-white rounded-2xl border border-white/5 transition-all"><X className="w-5 h-5" /></button>
              </div>

              <div className="space-y-10">
                {game.ps5Compatible && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                       <span className="w-5 h-5 bg-blue-600 text-white rounded-lg flex items-center justify-center text-[10px] font-black">1</span>
                       <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Console de Uso</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: 'PS4' as const, icon: Gamepad, label: 'PLAYSTATION 4' },
                        { id: 'PS5' as const, icon: Gamepad2, label: 'PLAYSTATION 5' }
                      ].map((console) => (
                        <button 
                          key={console.id}
                          onClick={() => setSelectedConsole(console.id)}
                          className={`relative flex flex-col items-center justify-center p-5 rounded-3xl border-2 transition-all duration-300 ${selectedConsole === console.id ? 'bg-blue-600/10 border-blue-600 text-white' : 'bg-zinc-900/40 border-white/5 text-zinc-600 hover:border-white/20'}`}
                        >
                          <console.icon className="w-6 h-6 mb-2" />
                          <span className="font-black uppercase text-[10px] tracking-tighter italic">{console.label}</span>
                          {selectedConsole === console.id && (
                            <div className="absolute top-2 right-2 bg-blue-600 rounded-full p-0.5"><Check className="w-2.5 h-2.5 text-white" /></div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                     <span className="w-5 h-5 bg-blue-600 text-white rounded-lg flex items-center justify-center text-[10px] font-black">2</span>
                     <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Tipo de Conta ({selectedConsole})</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'Primária' as const, icon: CreditCard, label: 'PRIMÁRIA', stock: currentStockPrimary },
                      { id: 'Secundária' as const, icon: CreditCard, label: 'SECUNDÁRIA', stock: currentStockSecondary }
                    ].map((type) => (
                      <button 
                        key={type.id}
                        disabled={type.stock <= 0}
                        onClick={() => setSelectedRentType(type.id)}
                        className={`relative p-5 rounded-3xl border-2 text-left transition-all duration-300 ${selectedRentType === type.id ? 'bg-blue-600/10 border-blue-600' : 'bg-zinc-900/40 border-white/5'} ${type.stock <= 0 ? 'opacity-20 grayscale' : ''}`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <type.icon className={`w-6 h-6 ${selectedRentType === type.id ? 'text-blue-500' : 'text-zinc-700'}`} />
                          <span className={`text-[7px] font-black px-1.5 py-0.5 rounded ${type.stock > 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                            {type.stock > 0 ? `${type.stock} UNID.` : 'ESGOTADO'}
                          </span>
                        </div>
                        <span className="block font-black text-white text-sm uppercase italic tracking-tighter leading-none">{type.label}</span>
                        {selectedRentType === type.id && (
                          <div className="absolute top-2 right-2 bg-blue-600 rounded-full p-0.5"><Check className="w-2.5 h-2.5 text-white" /></div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                     <span className="w-5 h-5 bg-blue-600 text-white rounded-lg flex items-center justify-center text-[10px] font-black">3</span>
                     <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Duração do Acesso</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {availableDays.map(d => (
                      <button 
                        key={d} 
                        onClick={() => setSelectedDays(d)} 
                        className={`px-6 py-3 rounded-xl font-black text-[9px] transition-all border-2 uppercase tracking-widest ${selectedDays === d ? 'bg-blue-600 text-white border-blue-600 shadow-lg' : 'bg-zinc-900 text-zinc-600 border-white/5 hover:border-zinc-800'}`}
                      >
                        {d} DIAS
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-8 border-t border-white/5 flex items-center justify-between gap-6">
                   <div className="space-y-1">
                      <span className="text-[7px] text-zinc-600 font-black uppercase tracking-widest block">VALOR TOTAL ({selectedConsole})</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-blue-500 font-black text-xs">R$</span>
                        <span className="text-3xl font-black text-white italic tracking-tighter leading-none">{currentPrice.toFixed(2).replace('.', ',')}</span>
                      </div>
                   </div>
                   <button 
                    onClick={confirmAction} 
                    disabled={isOutOfStockSelection}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl transition-all shadow-xl active:scale-95 uppercase tracking-[0.2em] text-[10px] disabled:opacity-30 disabled:grayscale"
                   >
                     ALUGAR AGORA
                   </button>
                </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default GameDetail;