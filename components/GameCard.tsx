
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Game } from '../types';
import { AlertCircle, ExternalLink, ShoppingCart, Heart, AlertTriangle } from 'lucide-react';
import { getSiteConfig } from '../store';

interface GameCardProps {
  game: Game;
}

const GameCard: React.FC<GameCardProps> = ({ game }) => {
  const navigate = useNavigate();
  const [config] = useState(getSiteConfig());
  const isOutOfStock = game.stockPrimary <= 0 && game.stockSecondary <= 0;
  const isPartnerProduct = !!game.externalUrl;
  
  // Lógica de Estoque Baixo (Critério definido no Admin)
  const isPrimaryLow = game.stockPrimary > 0 && game.stockPrimary <= (game.minStockPrimary || 0);
  const isSecondaryLow = game.stockSecondary > 0 && game.stockSecondary <= (game.minStockSecondary || 0);
  const isLowStockGeneral = !isOutOfStock && (isPrimaryLow || isSecondaryLow);

  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem('gamerent_favorites') || '[]');
    setIsFavorite(favorites.includes(game.id));
  }, [game.id]);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const favorites = JSON.parse(localStorage.getItem('gamerent_favorites') || '[]');
    let newFavorites;
    if (favorites.includes(game.id)) {
      newFavorites = favorites.filter((id: string) => id !== game.id);
    } else {
      newFavorites = [...favorites, game.id];
    }
    localStorage.setItem('gamerent_favorites', JSON.stringify(newFavorites));
    setIsFavorite(!isFavorite);
  };

  // Preço a ser exibido no card (Prioriza pricePrimary se for locação)
  const displayPrice = isPartnerProduct ? game.price : (game.pricePrimary ?? game.price ?? 40);

  return (
    <div className="group bg-zinc-900/40 rounded-[2rem] overflow-hidden border border-white/5 hover:border-blue-500/30 transition-all duration-500 flex flex-col h-full shadow-2xl relative">
      {/* Imagem */}
      <div className="relative overflow-hidden block">
        {isPartnerProduct ? (
           <a href={game.externalUrl} target="_blank" rel="noopener noreferrer" className="w-full block">
             <img src={game.imageUrl} alt={game.title} className="w-full h-auto transition-transform duration-700 group-hover:scale-105" />
           </a>
        ) : (
          <Link to={`/game/${game.id}`} className="w-full block">
            <img src={game.imageUrl} alt={game.title} className="w-full h-auto transition-transform duration-700 group-hover:scale-105" />
          </Link>
        )}
        
        {/* Overlays e Tags */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
          {isPartnerProduct && (
            <span className="bg-blue-600 text-white text-[9px] font-black px-3 py-1.5 rounded-lg shadow-2xl uppercase tracking-[0.2em] whitespace-nowrap">Físico</span>
          )}
          {!isPartnerProduct && (isOutOfStock || game.status === 'Alugado') ? (
            <span className="bg-red-600/90 backdrop-blur-md text-white text-[9px] font-black px-3 py-1.5 rounded-lg shadow-2xl flex items-center gap-1 uppercase tracking-[0.2em] whitespace-nowrap">
              <AlertCircle className="w-3 h-3" /> Esgotado
            </span>
          ) : null}
        </div>

        {/* Botão Favoritos */}
        <button 
          onClick={toggleFavorite}
          className={`absolute top-4 right-4 z-20 p-3 rounded-2xl backdrop-blur-xl border transition-all duration-300 active:scale-90 ${
            isFavorite 
            ? 'bg-red-500 border-red-400 text-white shadow-lg shadow-red-500/40' 
            : 'bg-black/40 border-white/10 text-white/70 hover:text-white hover:bg-black/60'
          }`}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
        </button>
      </div>
      
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] whitespace-nowrap">
            {game.platform}
          </span>
          {!isPartnerProduct && !isOutOfStock && game.status === 'Disponível' && (
            <div className="flex gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest whitespace-nowrap">Disponível</span>
            </div>
          )}
        </div>

        {isPartnerProduct ? (
          <a href={game.externalUrl} target="_blank" rel="noopener noreferrer">
            <h3 className="text-white font-black text-lg leading-tight mb-2 group-hover:text-blue-400 transition-colors uppercase italic tracking-tighter">
              {game.title}
            </h3>
          </a>
        ) : (
          <Link to={`/game/${game.id}`}>
            <h3 className="text-white font-black text-lg leading-tight mb-2 group-hover:text-blue-400 transition-colors uppercase italic tracking-tighter">
              {game.title}
            </h3>
          </Link>
        )}

        {/* Estoque e Alerta Posicionado Abaixo */}
        {!isPartnerProduct && (
          <div className="mb-5">
            <div className="flex items-center gap-3 py-2 border-y border-white/5">
              <div className="flex items-center gap-1.5">
                <span className={`text-[10px] font-black uppercase ${game.stockPrimary <= 0 ? 'text-zinc-700' : isPrimaryLow ? 'text-amber-500' : 'text-emerald-500'}`}>
                  {config.stockPrimaryLabel}
                </span>
                <span className={`text-[10px] font-bold tracking-tight ${game.stockPrimary <= 0 ? 'text-zinc-600' : isPrimaryLow ? 'text-amber-500' : 'text-zinc-300'}`}>
                  {game.stockPrimary}
                </span>
              </div>
              <div className="w-px h-3 bg-white/10"></div>
              <div className="flex items-center gap-1.5">
                <span className={`text-[10px] font-black uppercase ${game.stockSecondary <= 0 ? 'text-zinc-700' : isSecondaryLow ? 'text-amber-500' : 'text-blue-500'}`}>
                  {config.stockSecondaryLabel}
                </span>
                <span className={`text-[10px] font-bold tracking-tight ${game.stockSecondary <= 0 ? 'text-zinc-600' : isSecondaryLow ? 'text-amber-500' : 'text-zinc-300'}`}>
                  {game.stockSecondary}
                </span>
              </div>
            </div>
            
            {/* Alerta de Estoque Baixo em baixo do estoque */}
            {isLowStockGeneral && (
              <div className="mt-2 flex items-center gap-1.5 text-amber-500 animate-pulse">
                <AlertTriangle className="w-3 h-3" />
                <span className="text-[8px] font-black uppercase tracking-widest">Poucas Unidades</span>
              </div>
            )}
          </div>
        )}
        
        <div className="mt-auto space-y-4">
          <div className="flex items-end justify-between">
            <div className="flex flex-col">
              <span className="text-[9px] text-zinc-600 font-black uppercase tracking-widest mb-1">
                {isPartnerProduct ? 'Preço de Compra' : 'Plano Mensal'}
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-blue-500 font-black text-xs">R$</span>
                <span className="text-white font-black text-2xl italic tracking-tighter">{displayPrice.toFixed(2).replace('.', ',')}</span>
              </div>
            </div>
          </div>

          {isPartnerProduct ? (
            <a 
              href={game.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl transition-all text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-600/10 active:scale-95 whitespace-nowrap"
            >
              Comprar Agora <ExternalLink className="w-4 h-4" />
            </a>
          ) : (
            <Link 
              to={`/game/${game.id}`}
              className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl transition-all text-[10px] font-black uppercase tracking-[0.2em] active:scale-95 shadow-2xl whitespace-nowrap ${
                isOutOfStock 
                ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20'
              }`}
            >
              <ShoppingCart className="w-4 h-4" /> 
              {isOutOfStock ? 'Indisponível' : 'ALUGAR AGORA'}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameCard;
