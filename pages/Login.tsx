import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Gamepad2, 
  Mail, 
  Lock, 
  AlertCircle, 
  CheckCircle2, 
  ChevronLeft, 
  ShieldCheck, 
  RefreshCw,
  ArrowRight,
  KeyRound,
  X
} from 'lucide-react';
import { ADMIN_EMAIL } from '../constants';

interface LoginProps {
  onLogin: (email: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [step, setStep] = useState<'form' | 'verify'>('form');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [generatedCode, setGeneratedCode] = useState('');
  const [userCode, setUserCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showInAppCode, setShowInAppCode] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Acesso Administrativo Direto
    if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      if (password === 'admin123') {
        onLogin(email);
        navigate('/admin');
      } else {
        setError('Senha administrativa incorreta.');
      }
      return;
    }

    setIsLoading(true);

    if (isRegister) {
      // Simulação de Cadastro Local
      const storedUsers = JSON.parse(localStorage.getItem('gamerent_registered_accounts') || '[]');
      const emailExists = storedUsers.some((u: any) => u.email.toLowerCase() === email.toLowerCase());
      
      if (emailExists) {
        setError('Este e-mail já está cadastrado.');
        setIsLoading(false);
        return;
      }

      // Fluxo de Verificação Simulado (Client-side)
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedCode(code);
      setStep('verify');
      setShowInAppCode(true);
      setSuccess('Verificação necessária. Use o código exibido abaixo.');
      setIsLoading(false);
    } else {
      // Login Local
      const storedUsers = JSON.parse(localStorage.getItem('gamerent_registered_accounts') || '[]');
      const user = storedUsers.find((u: any) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
      
      if (user) {
        onLogin(email);
        navigate('/');
      } else {
        setError('E-mail ou senha incorretos.');
      }
      setIsLoading(false);
    }
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (userCode === generatedCode) {
      setTimeout(() => {
        const users = JSON.parse(localStorage.getItem('gamerent_registered_accounts') || '[]');
        users.push({ email, password });
        localStorage.setItem('gamerent_registered_accounts', JSON.stringify(users));
        onLogin(email);
        setIsLoading(false);
        navigate('/');
      }, 500);
    } else {
      setError('Código inválido.');
      setIsLoading(false);
    }
  };

  const handleResendCode = () => {
    setError('');
    setSuccess('');
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    setShowInAppCode(true);
    setSuccess('Novo código gerado com sucesso.');
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center px-4 md:px-6 py-10 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full sm:w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[100px] md:blur-[150px] -translate-x-1/4 md:-translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-full sm:w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[100px] md:blur-[150px] translate-x-1/4 md:translate-x-1/2 translate-y-1/2"></div>

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

        {showInAppCode && generatedCode && (
          <div className="w-full max-w-sm px-4 animate-in slide-in-from-top-4 duration-500 mb-8 mx-auto">
            <div className="bg-zinc-900 border-2 border-blue-600/50 rounded-2xl p-4 shadow-2xl flex items-center gap-4 text-left">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Ativação Troia Games</p>
                <p className="text-white text-xs font-bold mt-0.5">Seu código é: <span className="text-blue-400 text-lg font-black ml-1 tracking-tighter">{generatedCode}</span></p>
              </div>
              <button onClick={() => setShowInAppCode(false)} className="text-zinc-600 hover:text-white p-1"><X className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>

      <div className="w-full max-w-lg bg-zinc-900/60 rounded-3xl md:rounded-[3.5rem] border border-white/5 p-8 md:p-12 backdrop-blur-3xl shadow-2xl relative z-10">
        
        {step === 'form' ? (
          <>
            <div className="flex bg-zinc-950 p-1.5 md:p-2 rounded-2xl md:rounded-[2rem] mb-8 md:mb-12 border border-white/5">
              <button 
                onClick={() => { setIsRegister(false); setError(''); setSuccess(''); }}
                className={`flex-1 py-3 md:py-5 rounded-xl md:rounded-2xl font-black text-[9px] md:text-[11px] uppercase tracking-[0.3em] md:tracking-[0.4em] transition-all ${!isRegister ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/10' : 'text-zinc-600 hover:text-zinc-300'}`}
              >
                ACESSO
              </button>
              <button 
                onClick={() => { setIsRegister(true); setError(''); setSuccess(''); }}
                className={`flex-1 py-3 md:py-5 rounded-xl md:rounded-2xl font-black text-[9px] md:text-[11px] uppercase tracking-[0.3em] md:tracking-[0.4em] transition-all ${isRegister ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/10' : 'text-zinc-600 hover:text-zinc-300'}`}
              >
                CADASTRO
              </button>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 md:p-5 flex items-center space-x-3 text-red-500 text-[9px] md:text-[11px] font-black uppercase tracking-widest mb-6 md:mb-10">
                <AlertCircle className="w-4 h-4 md:w-5 md:h-5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
              <div className="space-y-2 md:space-y-3">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest px-2 block">E-mail de Acesso</label>
                <div className="relative group">
                  <Mail className="absolute left-5 md:left-6 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-zinc-700 group-focus-within:text-blue-500 transition-colors" />
                  <input 
                    type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-zinc-950 border border-white/5 rounded-xl md:rounded-3xl pl-12 md:pl-16 pr-6 md:pr-8 py-4 md:py-6 text-white text-sm focus:outline-none focus:border-blue-500/5 transition-all font-bold tracking-wide placeholder:text-zinc-900"
                    placeholder="exemplo@mail.com"
                  />
                </div>
              </div>

              <div className="space-y-2 md:space-y-3">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest px-2 block">Crie uma Senha</label>
                <div className="relative group">
                  <Lock className="absolute left-5 md:left-6 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-zinc-700 group-focus-within:text-blue-500 transition-colors" />
                  <input 
                    type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-zinc-950 border border-white/5 rounded-xl md:rounded-3xl pl-12 md:pl-16 pr-6 md:pr-8 py-4 md:py-6 text-white text-sm focus:outline-none focus:border-blue-500/5 transition-all font-bold tracking-wide placeholder:text-zinc-900"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 md:py-8 rounded-xl md:rounded-[2.5rem] transition-all transform hover:scale-[1.01] shadow-2xl shadow-blue-600/20 uppercase tracking-[0.3em] md:tracking-[0.4em] text-[10px] md:text-xs active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : (isRegister ? 'FINALIZAR CADASTRO' : 'ENTRAR NA CONTA')}
              </button>
            </form>
          </>
        ) : (
          <div className="animate-in fade-in zoom-in-95 duration-300">
            <div className="text-center mb-10">
               <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-blue-600/20">
                  <KeyRound className="w-8 h-8 text-blue-500" />
               </div>
               <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Confirme seu E-mail</h2>
               <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mt-2 px-4 leading-relaxed">Verificamos seu endereço <span className="text-blue-500">{email}</span>. Insira o código de 6 dígitos.</p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center space-x-3 text-red-500 text-[9px] font-black uppercase tracking-widest mb-6">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}
            
            {success && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-center space-x-3 text-emerald-500 text-[9px] font-black uppercase tracking-widest mb-6">
                <CheckCircle2 className="w-4 h-4" />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleVerifyCode} className="space-y-8">
               <div className="relative group">
                  <input 
                    type="text" 
                    required 
                    maxLength={6}
                    autoFocus
                    value={userCode} 
                    onChange={(e) => setUserCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-zinc-950 border border-white/5 rounded-2xl md:rounded-3xl py-6 text-center text-white text-3xl font-black focus:outline-none focus:ring-4 focus:ring-blue-600/5 transition-all tracking-[0.5em] placeholder:text-zinc-900"
                    placeholder="000000"
                  />
               </div>

               <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-6 rounded-2xl transition-all shadow-xl active:scale-95 disabled:opacity-50 uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3"
               >
                 {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'VALIDAR E FINALIZAR'}
               </button>

               <div className="flex flex-col gap-4">
                 <button 
                   type="button"
                   onClick={handleResendCode}
                   className="w-full text-blue-500 hover:text-white text-[9px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                 >
                   Gerar Novo Código
                 </button>
                 <button 
                   type="button"
                   onClick={() => { setStep('form'); setError(''); setSuccess(''); setShowInAppCode(false); }}
                   className="w-full text-zinc-600 hover:text-white text-[9px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                 >
                   <ArrowRight className="w-3 h-3 rotate-180" /> Alterar E-mail
                 </button>
               </div>
            </form>
          </div>
        )}

        <div className="mt-8 md:mt-12 flex items-center justify-center gap-2">
          <div className="h-px w-6 bg-white/5"></div>
          <p className="text-center text-[8px] font-black uppercase text-zinc-700 tracking-[0.2em] flex items-center gap-2">
            <ShieldCheck className="w-3 h-3 text-blue-500/50" /> PROTEÇÃO ATIVA TROIA GAMES
          </p>
          <div className="h-px w-6 bg-white/5"></div>
        </div>
      </div>
    </div>
  );
};

export default Login;