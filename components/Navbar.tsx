import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Gamepad2, Search, Menu, X, UserCog, LogOut, ShoppingCart, ChevronDown, User as UserIcon, Settings, Store, Heart, LogIn, Zap, Info } from 'lucide-react';
import { User, SiteConfig, Category } from '../types';
import { getCategories } from '../store';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  config: SiteConfig;
  cartCount: number;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout, config, cartCount }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateFavorites = () => {
      const favorites = JSON.parse(localStorage.getItem('gamerent_favorites') || '[]');
      setFavoriteCount(favorites.length);
    };

    updateFavorites();
    window.addEventListener('storage', updateFavorites);
    const interval = setInterval(updateFavorites, 1000);

    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('storage', updateFavorites);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  return (
    <nav className="bg-[#09090b] border-b border-white/5 sticky top-0 z-[1000]">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 md:space-x-3 group shrink-0" onClick={() => setIsOpen(false)}>
              {config.logoImageUrl ? (
                <img src={config.logoImageUrl} alt={config.siteName} className="h-6 md:h-10 w-auto" />
              ) : (
                <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-600 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-transform">
                  <Gamepad2 className="w-4 h-4 md:w-6 md:h-6 text-white" />
                </div>
              )}
              <span className="font-black text-sm md:text-xl tracking-tighter text-white uppercase italic whitespace-nowrap">
                {config.logoText || config.siteName}
              </span>
            </Link>
            
            <div className="hidden lg:ml-10 lg:flex lg:items-center lg:space-x-6">
              <Link to="/" className="text-zinc-500 hover:text-white text-[10px] font-black uppercase tracking-[0.2em] transition-colors">Início</Link>
              <Link to="/catalog" className="text-zinc-500 hover:text-white text-[10px] font-black uppercase tracking-[0.2em] transition-colors">Catálogo</Link>
              <Link to="/monthly-plans" className="text-zinc-500 hover:text-white text-[10px] font-black uppercase tracking-[0.2em] transition-colors">Planos Mensais</Link>
              <Link to="/partner-store" className="flex items-center gap-2 text-blue-500 hover:text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] transition-colors">
                <Store className="w-3.5 h-3.5" /> Loja Parceira
              </Link>
            </div>
          </div>

          <div className="hidden lg:flex items-center space-x-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700" />
              <input 
                type="text" 
                placeholder="Buscar..." 
                className="bg-zinc-900/50 border border-white/5 rounded-full pl-10 pr-4 py-2 text-xs font-bold focus:outline-none focus:border-blue-500/50 transition-all w-48 xl:w-64 placeholder:text-zinc-800"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') navigate(`/catalog?q=${(e.target as HTMLInputElement).value}`);
                }}
              />
            </div>

            <div className="flex items-center gap-2">
              <Link to="/settings?tab=favorites" className="relative text-zinc-400 hover:text-red-500 transition-all group">
                <div className="p-2 rounded-lg bg-zinc-900 border border-white/5 group-hover:bg-red-500/10 transition-all">
                  <Heart className={`w-5 h-5 ${favoriteCount > 0 ? 'fill-red-500 text-red-500' : ''}`} />
                </div>
                {favoriteCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-black w-4 h-4 flex items-center justify-center rounded-full">
                    {favoriteCount}
                  </span>
                )}
              </Link>

              <Link to="/cart" className="relative text-zinc-400 hover:text-white transition-all group">
                <div className="p-2 rounded-lg bg-zinc-900 border border-white/5 group-hover:bg-blue-600/10 transition-all">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[8px] font-black w-4 h-4 flex items-center justify-center rounded-full">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>

            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button 
                   onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                   className="flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-zinc-900 border border-white/5 hover:border-blue-500/30 transition-all"
                >
                   <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white text-[10px] font-black">
                      {user.email.charAt(0).toUpperCase()}
                   </div>
                   <ChevronDown className={`w-3 h-3 text-zinc-700 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl p-1.5 animate-in fade-in slide-in-from-top-2 duration-200 z-[110]">
                     {user.isAdmin && (
                       <Link to="/admin" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all text-[9px] font-black uppercase tracking-widest">
                          <UserCog className="w-3.5 h-3.5" /> Painel ADM
                       </Link>
                     )}
                     <Link to="/settings" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all text-[9px] font-black uppercase tracking-widest">
                        <Settings className="w-3.5 h-3.5" /> Minha Conta
                     </Link>
                     <button onClick={() => { onLogout(); setIsUserMenuOpen(false); navigate('/'); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-all text-[9px] font-black uppercase tracking-widest text-left">
                        <LogOut className="w-3.5 h-3.5" /> Sair
                     </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-all active:scale-95 shadow-lg shadow-blue-600/20">
                <LogIn className="w-3.5 h-3.5" />
                <span className="text-[10px] font-black uppercase tracking-widest">Entrar</span>
              </Link>
            )}
          </div>

          <div className="lg:hidden flex items-center gap-3">
            <Link to="/cart" className="relative text-zinc-500 p-2">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-blue-600 text-white text-[8px] font-black w-4 h-4 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>
            <button onClick={() => setIsOpen(!isOpen)} className="text-zinc-400 p-2 focus:outline-none z-[1100]">
              {isOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="lg:hidden fixed inset-0 bg-black z-[1050] animate-in fade-in duration-300 flex flex-col pt-16">
          <div className="flex flex-col h-full p-6 overflow-y-auto no-scrollbar space-y-6">
            <div className="relative mb-2">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
              <input 
                type="text" 
                placeholder="Pesquisar games..." 
                className="w-full bg-zinc-900 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-sm text-white focus:outline-none focus:border-blue-500 shadow-inner"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    navigate(`/catalog?q=${(e.target as HTMLInputElement).value}`);
                    setIsOpen(false);
                  }
                }}
              />
            </div>
            
            <div className="flex flex-col gap-3">
              <Link to="/" onClick={() => setIsOpen(false)} className="block p-5 bg-zinc-900 border border-white/5 rounded-2xl text-xl font-black text-white uppercase italic tracking-tighter hover:bg-blue-600/20 transition-all">
                Início
              </Link>
              <Link to="/catalog" onClick={() => setIsOpen(false)} className="block p-5 bg-zinc-900 border border-white/5 rounded-2xl text-xl font-black text-white uppercase italic tracking-tighter hover:bg-blue-600/20 transition-all">
                Catálogo
              </Link>
              <Link to="/monthly-plans" onClick={() => setIsOpen(false)} className="block p-5 bg-zinc-900 border border-white/5 rounded-2xl text-xl font-black text-white uppercase italic tracking-tighter hover:bg-blue-600/20 transition-all">
                Planos Mensais
              </Link>
              <Link to="/partner-store" onClick={() => setIsOpen(false)} className="block p-5 bg-blue-600/10 border border-blue-500/20 rounded-2xl text-xl font-black text-blue-500 uppercase italic tracking-tighter hover:bg-blue-600/20 transition-all">
                Loja Parceira
              </Link>
            </div>

            <div className="pt-6 border-t border-white/5 flex flex-col gap-4">
              {user ? (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4 p-5 bg-zinc-900 rounded-[2rem] border border-white/5 shadow-lg">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-base font-black uppercase">
                      {user.email.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white truncate">{user.email}</p>
                      <p className="text-[10px] text-zinc-600 uppercase font-black tracking-widest">Perfil Premium</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-2">
                    {user.isAdmin && (
                      <Link to="/admin" onClick={() => setIsOpen(false)} className="flex items-center gap-4 p-4.5 bg-zinc-900/50 rounded-2xl text-zinc-400 font-black uppercase tracking-widest text-[11px] border border-white/5">
                        <UserCog className="w-5 h-5 text-blue-500" /> Painel ADM
                      </Link>
                    )}
                    <Link to="/settings" onClick={() => setIsOpen(false)} className="flex items-center gap-4 p-4.5 bg-zinc-900/50 rounded-2xl text-zinc-400 font-black uppercase tracking-widest text-[11px] border border-white/5">
                      <Settings className="w-5 h-5 text-blue-500" /> Minha Conta
                    </Link>
                    <Link to="/settings?tab=favorites" onClick={() => setIsOpen(false)} className="flex items-center gap-4 p-4.5 bg-zinc-900/50 rounded-2xl text-zinc-400 font-black uppercase tracking-widest text-[11px] border border-white/5">
                      <Heart className="w-5 h-5 text-red-500" /> Favoritos
                    </Link>
                    <button onClick={() => { onLogout(); setIsOpen(false); navigate('/'); }} className="flex items-center gap-4 p-4.5 bg-red-500/5 rounded-2xl text-red-500 font-black uppercase tracking-widest text-[11px] border border-red-500/10 w-full text-left">
                      <LogOut className="w-5 h-5" /> Sair da Conta
                    </button>
                  </div>
                </div>
              ) : (
                <Link to="/login" onClick={() => setIsOpen(false)} className="flex items-center justify-center gap-4 bg-blue-600 text-white p-6 rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-600/30 active:scale-95 mt-4">
                  <LogIn className="w-5 h-5" /> Entrar na Troia
                </Link>
              )}
            </div>
            
            <div className="h-20 shrink-0"></div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;