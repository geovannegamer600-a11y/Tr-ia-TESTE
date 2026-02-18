
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  User, 
  Settings, 
  LogOut, 
  ChevronRight, 
  Gamepad2,
  Mail,
  Smartphone,
  CheckCircle2,
  Lock,
  Heart,
  Gamepad,
  ShieldCheck,
  Save,
  RefreshCw
} from 'lucide-react';
import { User as UserType, Game } from '../types';
import { getGames } from '../store';
import GameCard from '../components/GameCard';

const UserSettings: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<UserType & { phoneNumber?: string } | null>(null);
  const [activeSection, setActiveSection] = useState('profile');
  const [favoriteGames, setFavoriteGames] = useState<Game[]>([]);
  const [phoneInput, setPhoneInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab) setActiveSection(tab);
  }, [location.search]);

  useEffect(() => {
    const stored = localStorage.getItem('gamerent_user');
    if (stored) {
      const parsedUser = JSON.parse(stored);
      setUser(parsedUser);
      setPhoneInput(parsedUser.phoneNumber || '');
    } else {
      navigate('/login');
    }

    const loadFavorites = () => {
      const favoritesIds = JSON.parse(localStorage.getItem('gamerent_favorites') || '[]');
      const allGames = getGames();
      setFavoriteGames(allGames.filter(g => favoritesIds.includes(g.id)));
    };

    loadFavorites();
    window.addEventListener('storage', loadFavorites);
    return () => window.removeEventListener('storage', loadFavorites);
  }, [navigate]);

  if (!user) return null;

  const menuItems = [
    { id: 'profile', label: 'Meu Perfil', icon: User },
    { id: 'favorites', label: 'Meus Favoritos', icon: Heart },
    { id: 'rentals', label: 'Meus Aluguéis', icon: Gamepad2 },
    { id: 'security', label: 'Segurança', icon: Lock },
  ];

  const handleUpdateProfile = () => {
    setIsSaving(true);
    const updatedUser = { ...user, phoneNumber: phoneInput };
    setUser(updatedUser);
    localStorage.setItem('gamerent_user', JSON.stringify(updatedUser));
    
    setTimeout(() => {
      setIsSaving(false);
      alert('Perfil atualizado com sucesso!');
    }, 800);
  };

  return (
    <div className="bg-[#09090b] min-h-screen pt-12 pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/5 pb-8">
          <div>
            <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">MINHA <span className="text-blue-600">CONTA</span></h1>
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-[9px] mt-1">Gerencie seus dados e assinaturas Troia Games</p>
          </div>
          <div className="flex items-center gap-3 bg-zinc-900/50 px-4 py-2 rounded-2xl border border-white/5">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px] font-black italic">
              {user.email.charAt(0).toUpperCase()}
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black text-white uppercase truncate max-w-[120px]">{user.email.split('@')[0]}</p>
              <p className="text-[8px] font-bold text-zinc-500 uppercase">Membro Premium</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sidebar */}
          <div className="lg:col-span-3 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  navigate(`/settings?tab=${item.id}`, { replace: true });
                }}
                className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all border ${activeSection === item.id ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20' : 'bg-zinc-900/30 border-white/5 text-zinc-500 hover:text-white hover:bg-zinc-800'}`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                </div>
                <ChevronRight className={`w-3 h-3 transition-transform ${activeSection === item.id ? 'rotate-90' : ''}`} />
              </button>
            ))}
            <div className="pt-4 mt-4 border-t border-white/5">
              <button 
                onClick={() => { localStorage.removeItem('gamerent_user'); window.location.href = '/'; }}
                className="w-full flex items-center gap-3 p-4 text-red-500 hover:bg-red-500/10 rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest"
              >
                <LogOut className="w-4 h-4" /> Sair da Conta
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-9">
            <div className="bg-zinc-900/40 border border-white/5 rounded-[2.5rem] p-6 md:p-10 min-h-[500px] shadow-2xl overflow-hidden relative">
               
               {activeSection === 'profile' && (
                 <div className="animate-in fade-in duration-500 space-y-10">
                    <div className="flex items-center gap-6 pb-8 border-b border-white/5">
                      <div className="w-20 h-20 rounded-3xl bg-zinc-800 border border-blue-600/30 flex items-center justify-center text-3xl font-black text-white italic shadow-2xl">
                        {user.email.charAt(0).toUpperCase()}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">{user.email.split('@')[0]}</h2>
                          <span className="bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full border border-emerald-500/20 text-[8px] font-black uppercase tracking-widest flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" /> E-mail Verificado
                          </span>
                        </div>
                        <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">{user.email}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest px-2">E-mail de Acesso</label>
                          <div className="relative">
                             <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700" />
                             <input type="text" readOnly value={user.email} className="w-full bg-zinc-950 border border-white/5 rounded-xl pl-12 pr-4 py-4 text-zinc-500 font-bold text-xs" />
                          </div>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest px-2">WhatsApp / Telefone</label>
                          <div className="relative">
                             <Smartphone className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500" />
                             <input 
                                type="text" 
                                value={phoneInput}
                                onChange={(e) => setPhoneInput(e.target.value)}
                                placeholder="(22) 99999-9999" 
                                className="w-full bg-zinc-950 border border-white/5 rounded-xl pl-12 pr-4 py-4 text-white font-bold text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none transition-all" 
                             />
                          </div>
                       </div>
                    </div>

                    <div className="pt-8 flex justify-end">
                       <button 
                         onClick={handleUpdateProfile}
                         disabled={isSaving}
                         className="bg-blue-600 hover:bg-blue-700 text-white font-black px-8 py-4 rounded-xl transition-all shadow-xl active:scale-95 uppercase tracking-widest text-[10px] flex items-center gap-2 disabled:opacity-50"
                       >
                         {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                         Atualizar Cadastro
                       </button>
                    </div>
                 </div>
               )}

               {activeSection === 'favorites' && (
                 <div className="animate-in fade-in duration-500 space-y-8">
                    <div className="flex items-center justify-between border-b border-white/5 pb-6">
                       <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Jogos Salvos</h2>
                       <span className="text-[10px] font-black text-zinc-600 uppercase bg-zinc-950 px-3 py-1 rounded-full border border-white/5">{favoriteGames.length} Itens</span>
                    </div>

                    {favoriteGames.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {favoriteGames.map(game => (
                          <div key={game.id} className="scale-95 hover:scale-100 transition-transform">
                             <GameCard game={game} />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-20 text-center bg-zinc-950/30 rounded-[2rem] border border-white/5 border-dashed">
                         <Heart className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
                         <h3 className="text-white font-black uppercase text-sm mb-1">Sua lista está vazia</h3>
                         <p className="text-zinc-600 text-[9px] font-bold uppercase tracking-widest">Adicione jogos ao favoritos para vê-los aqui.</p>
                      </div>
                    )}
                 </div>
               )}

               {activeSection === 'rentals' && (
                 <div className="animate-in fade-in duration-500 space-y-8">
                    <div className="flex items-center justify-between border-b border-white/5 pb-6">
                       <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Histórico de Aluguéis</h2>
                    </div>

                    <div className="py-20 text-center bg-zinc-950/30 rounded-[2rem] border border-white/5 border-dashed">
                       <Gamepad className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
                       <h3 className="text-white font-black uppercase text-sm mb-1">Nenhum pedido ativo</h3>
                       <p className="text-zinc-600 text-[9px] font-bold uppercase tracking-widest">Seu histórico aparecerá aqui após seu primeiro aluguel.</p>
                    </div>
                 </div>
               )}

               {activeSection === 'security' && (
                 <div className="animate-in fade-in duration-500 space-y-8">
                    <div className="flex items-center justify-between border-b border-white/5 pb-6">
                       <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Segurança</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest px-2">Nova Senha</label>
                          <div className="relative">
                             <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700" />
                             <input type="password" placeholder="••••••••" className="w-full bg-zinc-950 border border-white/5 rounded-xl pl-12 pr-4 py-4 text-white font-bold text-xs" />
                          </div>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest px-2">Confirmar Senha</label>
                          <div className="relative">
                             <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700" />
                             <input type="password" placeholder="••••••••" className="w-full bg-zinc-950 border border-white/5 rounded-xl pl-12 pr-4 py-4 text-white font-bold text-xs" />
                          </div>
                       </div>
                    </div>

                    <div className="pt-8 flex justify-end">
                       <button className="bg-zinc-800 hover:bg-zinc-700 text-white font-black px-8 py-4 rounded-xl transition-all uppercase tracking-widest text-[10px] border border-white/5">Alterar Senha</button>
                    </div>
                 </div>
               )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSettings;
