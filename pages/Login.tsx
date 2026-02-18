
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Gamepad2, 
  Mail, 
  Lock, 
  AlertCircle, 
  ChevronLeft, 
  RefreshCw
} from 'lucide-react';
import { User } from '../types';
import { getSiteConfig } from '../store';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulação de delay de rede
    setTimeout(() => {
      try {
        const config = getSiteConfig();
        const isAdmin = config.adminEmails.some(e => e.toLowerCase() === email.toLowerCase());
        
        const userData: User = {
          email: email,
          isAdmin: isAdmin
        };

        // Salva na sessão local
        localStorage.setItem('troia_session', JSON.stringify(userData));
        onLogin(userData);
        
        if (isAdmin) {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } catch (err: any) {
        setError('Erro ao processar login.');
      } finally {
        setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center px-4 md:px-6 py-10 relative overflow-hidden">
      <div className="mb-8 md:mb-16 flex flex-col items-center relative z-10 w-full max-w-lg text-center">
        <Link to="/" className="flex items-center space-x-2 md:space-x-3 mb-6 md:mb-10 group opacity-60 hover:opacity-100 transition-all text-zinc-400 mx-auto">
          <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 group-hover:text-blue-500" />
          <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] group-hover:text-white">VOLTAR AO SITE</span>
        </Link>
        
        <div className="flex items-center space-x-3 md:space-x-5 justify-center mb-8">
          <div className="w-10 h-10 md:w-16 md:h-16 bg-blue-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-600/20">
            <Gamepad2 className="w-6 h-6 md:w-10 md:h-10 text-white" />
          </div>
          <span className="text-3xl md:text-5xl font-black tracking-tighter text-white uppercase italic">
            TROIA<span className="text-blue-600">GAMES</span>
          </span>
        </div>
      </div>

      <div className="w-full max-w-lg bg-zinc-900/60 rounded-3xl md:rounded-[3.5rem] border border-white/5 p-8 md:p-12 backdrop-blur-3xl shadow-2xl relative z-10">
        <div className="flex bg-zinc-950 p-1.5 md:p-2 rounded-2xl md:rounded-[2rem] mb-8 md:mb-12 border border-white/5">
          <button 
            onClick={() => setIsRegister(false)}
            className={`flex-1 py-3 md:py-5 rounded-xl md:rounded-2xl font-black text-[9px] md:text-[11px] uppercase tracking-[0.3em] transition-all ${!isRegister ? 'bg-blue-600 text-white shadow-xl' : 'text-zinc-600'}`}
          >
            ACESSO
          </button>
          <button 
            onClick={() => setIsRegister(true)}
            className={`flex-1 py-3 md:py-5 rounded-xl md:rounded-2xl font-black text-[9px] md:text-[11px] uppercase tracking-[0.3em] transition-all ${isRegister ? 'bg-blue-600 text-white shadow-xl' : 'text-zinc-600'}`}
          >
            CADASTRO
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center space-x-3 text-red-500 text-[11px] font-black uppercase mb-6">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest px-2 block">E-mail</label>
            <div className="relative group">
              <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-700 group-focus-within:text-blue-500" />
              <input 
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-950 border border-white/5 rounded-2xl pl-16 pr-6 py-4 text-white text-sm focus:outline-none focus:border-blue-500 transition-all font-bold"
                placeholder="exemplo@mail.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest px-2 block">Senha</label>
            <div className="relative group">
              <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-700 group-focus-within:text-blue-500" />
              <input 
                type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-950 border border-white/5 rounded-2xl pl-16 pr-6 py-4 text-white text-sm focus:outline-none focus:border-blue-500 transition-all font-bold"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl transition-all shadow-xl uppercase tracking-widest text-xs active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : (isRegister ? 'CADASTRAR' : 'ENTRAR')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
