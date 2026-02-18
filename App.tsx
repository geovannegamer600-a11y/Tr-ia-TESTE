
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import PartnerStore from './pages/PartnerStore';
import GameDetail from './pages/GameDetail';
import MonthlyPlans from './pages/MonthlyPlans';
import Cart from './pages/Cart';
import Login from './pages/Login';
import UserSettings from './pages/UserSettings';
import Dashboard from './pages/admin/Dashboard';
import GamesManager from './pages/admin/GamesManager';
import OrdersManager from './pages/admin/OrdersManager';
import CategoriesManager from './pages/admin/CategoriesManager';
import GamePlatformsManager from './pages/admin/GamePlatformsManager';
import PlatformsManager from './pages/admin/PlatformsManager';
import ConfigManager from './pages/admin/ConfigManager';
import AdminLayout from './components/AdminLayout';
import FloatingSocials from './components/FloatingSocials';
import { User, SiteConfig, CartItem } from './types';
import { getSiteConfig, fetchAllData } from './store';
import { X, CheckCircle2, RefreshCw } from 'lucide-react';

interface ProtectedRouteProps {
  user: User | null;
  children: React.ReactNode;
}

const AdminRoute: React.FC<ProtectedRouteProps> = ({ user, children }) => {
  if (!user) return <Navigate to="/login" replace />;
  if (!user.isAdmin) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const UserRoute: React.FC<ProtectedRouteProps> = ({ user, children }) => {
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(getSiteConfig());
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'offline' } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initApp = async () => {
      await fetchAllData();
      
      // Checar sessão local
      const storedUser = localStorage.getItem('troia_session');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        const config = getSiteConfig();
        const isAdmin = config.adminEmails.some(e => e.toLowerCase() === parsed.email.toLowerCase());
        setUser({ ...parsed, isAdmin });
      }

      setIsLoading(false);
    };

    initApp();

    const storedCart = localStorage.getItem('gamerent_cart');
    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    }
  }, []);

  const showNotification = (message: string, type: 'success' | 'info' | 'offline' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleLogout = () => {
    localStorage.removeItem('troia_session');
    setUser(null);
    showNotification('Até breve!');
  };

  const handleAddToCart = (item: CartItem) => {
    setCartItems(prev => {
      const newItems = [...prev, item];
      localStorage.setItem('gamerent_cart', JSON.stringify(newItems));
      return newItems;
    });
    showNotification('Item adicionado ao carrinho.');
  };

  const handleRemoveFromCart = (index: number) => {
    setCartItems(prev => {
      const newItems = prev.filter((_, i) => i !== index);
      localStorage.setItem('gamerent_cart', JSON.stringify(newItems));
      return newItems;
    });
    showNotification('Item removido.', 'info');
  };

  const handleUpdateCartItem = (index: number, updates: Partial<CartItem>) => {
    setCartItems(prev => {
      const newItems = prev.map((item, i) => i === index ? { ...item, ...updates } : item);
      localStorage.setItem('gamerent_cart', JSON.stringify(newItems));
      return newItems;
    });
  };

  const refreshConfig = () => {
    setSiteConfig(getSiteConfig());
    showNotification('Configurações salvas.');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <RefreshCw className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <Router future={{ v7_relativeSplatPath: true }}>
      <div className="flex flex-col min-h-screen bg-[#09090b] text-zinc-100">
        <Navbar 
          user={user} 
          onLogout={handleLogout} 
          config={siteConfig} 
          cartCount={cartItems.length}
        />
        
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home config={siteConfig} onAddToCart={handleAddToCart} />} />
            <Route path="/catalog" element={<Catalog onAddToCart={handleAddToCart} />} />
            <Route path="/monthly-plans" element={<MonthlyPlans />} />
            <Route path="/partner-store" element={<PartnerStore />} />
            <Route path="/game/:id" element={<GameDetail onAddToCart={handleAddToCart} />} />
            <Route path="/cart" element={
              <Cart 
                items={cartItems} 
                onRemove={handleRemoveFromCart} 
                onUpdate={handleUpdateCartItem} 
                config={siteConfig}
              />
            } />
            <Route path="/login" element={<Login onLogin={(u) => setUser(u)} />} />
            <Route path="/settings" element={<UserRoute user={user}><UserSettings /></UserRoute>} />

            <Route path="/admin" element={<AdminRoute user={user}><AdminLayout user={user} onLogout={handleLogout}><Dashboard /></AdminLayout></AdminRoute>} />
            <Route path="/admin/orders" element={<AdminRoute user={user}><AdminLayout user={user} onLogout={handleLogout}><OrdersManager /></AdminLayout></AdminRoute>} />
            <Route path="/admin/games" element={<AdminRoute user={user}><AdminLayout user={user} onLogout={handleLogout}><GamesManager /></AdminLayout></AdminRoute>} />
            <Route path="/admin/categories" element={<AdminRoute user={user}><AdminLayout user={user} onLogout={handleLogout}><CategoriesManager /></AdminLayout></AdminRoute>} />
            <Route path="/admin/game-platforms" element={<AdminRoute user={user}><AdminLayout user={user} onLogout={handleLogout}><GamePlatformsManager /></AdminLayout></AdminRoute>} />
            <Route path="/admin/platforms" element={<AdminRoute user={user}><AdminLayout user={user} onLogout={handleLogout}><PlatformsManager /></AdminLayout></AdminRoute>} />
            <Route path="/admin/config" element={<AdminRoute user={user}><AdminLayout user={user} onLogout={handleLogout}><ConfigManager onSave={refreshConfig} /></AdminLayout></AdminRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          {notification && (
            <div className="fixed bottom-6 right-6 z-[100] animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className={`flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border ${notification.type === 'success' ? 'bg-zinc-900 border-emerald-500/30 text-emerald-400' : 'bg-zinc-900 border-zinc-800 text-zinc-400'}`}>
                {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <RefreshCw className="w-5 h-5" />}
                <span className="text-sm font-semibold">{notification.message}</span>
                <button onClick={() => setNotification(null)} className="ml-2 hover:text-white"><X className="w-4 h-4" /></button>
              </div>
            </div>
          )}

          <FloatingSocials config={siteConfig} />
        </main>
        <Footer config={siteConfig} />
      </div>
    </Router>
  );
};

export default App;
