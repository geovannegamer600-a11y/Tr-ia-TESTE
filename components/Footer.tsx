import React from 'react';
import { Gamepad2, Mail, Phone, MapPin } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { SiteConfig } from '../types';

interface FooterProps {
  config: SiteConfig;
}

const Footer: React.FC<FooterProps> = ({ config }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleHowItWorksClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      navigate('/', { state: { scrollTo: 'como-funciona' } });
    } else {
      const element = document.getElementById('como-funciona');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleAllGamesClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (location.pathname !== '/catalog') {
      navigate('/catalog', { state: { scrollTo: 'games-list-section' } });
    } else {
      const element = document.getElementById('games-list-section');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <footer className="bg-zinc-950 text-zinc-400 pt-20 pb-10 border-t border-white/5 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-center md:text-left">
          <div className="space-y-6 flex flex-col items-center md:items-start">
            <div className="flex items-center space-x-3">
              {config.logoImageUrl ? (
                <img src={config.logoImageUrl} alt={config.siteName} className="h-8 w-auto object-contain" />
              ) : (
                <Gamepad2 className="w-6 h-6 text-blue-500" />
              )}
              <span className="text-lg font-bold tracking-tight text-white uppercase">
                {config.logoText || config.siteName}
              </span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs opacity-60">
              {config.footerDescription}
            </p>
          </div>

          <div>
            <h3 className="text-white font-bold text-xs uppercase tracking-widest mb-8">Catálogo</h3>
            <ul className="space-y-4 text-sm">
              <li><Link to="/" className="hover:text-blue-400 transition-colors">Destaques</Link></li>
              <li><button onClick={handleAllGamesClick} className="hover:text-blue-400 transition-colors bg-transparent border-none p-0 cursor-pointer text-left">Todos os Games</button></li>
              <li><Link to="/catalog?filter=new" className="hover:text-blue-400 transition-colors">Novidades</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold text-xs uppercase tracking-widest mb-8">Links Úteis</h3>
            <ul className="space-y-4 text-sm">
              <li><a href={`https://wa.me/${config.contactPhone}`} target="_blank" className="hover:text-blue-400 transition-colors">Suporte Direto</a></li>
              <li><Link to="/login" className="hover:text-blue-400 transition-colors">Minha Conta</Link></li>
              <li><button onClick={handleHowItWorksClick} className="hover:text-blue-400 transition-colors bg-transparent border-none p-0 cursor-pointer">Como Funciona</button></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold text-xs uppercase tracking-widest mb-8">Contatos</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-center justify-center md:justify-start space-x-3">
                 <Phone className="w-4 h-4 text-blue-500" />
                 <span className="text-zinc-300">{config.contactPhone}</span>
              </li>
              <li className="flex items-center justify-center md:justify-start space-x-3">
                 <Mail className="w-4 h-4 text-blue-500" />
                 <span className="text-zinc-300 truncate">{config.contactEmail}</span>
              </li>
              <li className="flex items-center justify-center md:justify-start space-x-3">
                 <MapPin className="w-4 h-4 text-blue-500" />
                 <span className="text-zinc-300">{config.contactAddress}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 mt-16 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">
            © {new Date().getFullYear()} {config.siteName} • Locadora Digital
          </p>
          <div className="flex items-center space-x-6 text-[10px] font-bold text-zinc-700 uppercase tracking-widest">
             <span>Digital</span>
             <span>Instantâneo</span>
             <span>Seguro</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;