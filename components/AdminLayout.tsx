
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  UserCog, 
  Gamepad2, 
  Tags, 
  Settings, 
  LogOut, 
  ChevronRight,
  Home as HomeIcon,
  CircleUser,
  LayoutGrid,
  Monitor,
  Menu,
  X,
  ShoppingBag
} from 'lucide-react';
import { User } from '../types';

interface AdminLayoutProps {
  children: React.ReactNode;
  user: User | null;
  onLogout: () => void;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, user, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { label: 'Dashboard', icon: UserCog, path: '/admin' },
    { label: 'Pedidos', icon: ShoppingBag, path: '/admin/orders' },
    { label: 'Gerenciar Jogos', icon: Gamepad2, path: '/admin/games' },
    { label: 'Tags Consoles', icon: Monitor, path: '/admin/game-platforms' },
    { label: 'Barra Catálogo', icon: LayoutGrid, path: '/admin/platforms' },
    { label: 'Gêneros', icon: Tags, path: '/admin/categories' },
    { label: 'Configurações', icon: Settings, path: '/admin/config' },
    { label: 'Site Público', icon: HomeIcon, path: '/' },
  ];

  const NavContent = () => (
    <>
      <div className="p-6 flex items-center justify-between">
        <Link to="/admin" className="flex items-center space-x-2" onClick={() => setIsMobileMenuOpen(false)}>
          <UserCog className="w-6 h-6 text-blue-500" />
          <span className="font-bold text-lg tracking-tight text-white uppercase">PAINEL ADM</span>
        </Link>
        <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden text-zinc-500 hover:text-white transition-colors">
          <X className="w-6 h-6" />
        </button>
      </div>

      <nav className="flex-grow px-4 space-y-1 mt-4">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'}`}
            >
              <div className="flex items-center space-x-3">
                <item.icon className="w-4 h-4" />
                <span className="text-sm font-semibold">{item.label}</span>
              </div>
              {isActive && <ChevronRight className="w-4 h-4" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5">
        <div className="flex items-center space-x-3 p-3 bg-zinc-950 rounded-xl mb-4 border border-white/5">
           <CircleUser className="w-8 h-8 text-zinc-600" />
           <div className="flex-1 min-w-0">
             <p className="text-xs font-bold text-white truncate">Administrador</p>
             <p className="text-[10px] text-zinc-500 truncate">{user?.email}</p>
           </div>
        </div>
        <button 
          onClick={() => { onLogout(); navigate('/'); }} 
          className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all text-xs font-bold uppercase tracking-widest"
        >
          <LogOut className="w-4 h-4" />
          <span>Sair</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-200">
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-zinc-900 border-r border-white/5 flex flex-col hidden lg:flex sticky top-0 h-screen">
        <NavContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[200] lg:hidden animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-zinc-900 flex flex-col border-r border-white/10 animate-in slide-in-from-left duration-300 shadow-2xl">
            <NavContent />
          </aside>
        </div>
      )}

      <main className="flex-grow flex flex-col min-w-0">
        <header className="bg-zinc-900/80 backdrop-blur-md border-b border-white/5 h-16 flex items-center justify-between px-6 lg:hidden sticky top-0 z-[100]">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 -ml-2 text-zinc-400 hover:text-white transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <span className="font-black text-white uppercase italic tracking-tighter text-sm">Painel ADM</span>
          </div>
          <button onClick={() => { onLogout(); navigate('/'); }} className="text-zinc-500 hover:text-white transition-colors"><LogOut className="w-5 h-5" /></button>
        </header>
        <div className="p-4 md:p-6 lg:p-10">{children}</div>
      </main>
    </div>
  );
};

export default AdminLayout;
