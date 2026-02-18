import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, ChevronRight, MessageCircle, Search, Zap, CheckCircle2, Gamepad2 } from 'lucide-react';
import { getGames, getCategories } from '../store';
import { Game, Category, SiteConfig, CartItem } from '../types';
import GameCard from '../components/GameCard';
import { PIX_LOGO_URL } from '../constants';

interface HomeProps {
  config: SiteConfig;
  onAddToCart: (item: CartItem) => void;
}

const Home: React.FC<HomeProps> = ({ config, onAddToCart }) => {
  const [games, setGames] = useState<Game[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const location = useLocation();

  useEffect(() => {
    setGames(getGames());
    setCategories(getCategories());
  }, []);

  useEffect(() => {
    // Verifica se há solicitação de scroll vindo de outra página
    if (location.state && (location.state as any).scrollTo === 'como-funciona') {
      setTimeout(() => {
        const element = document.getElementById('como-funciona');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 500);
    }
  }, [location]);

  const featuredGames = games.filter(g => g.isFeatured && !g.id?.startsWith('partner_') && !g.externalUrl).slice(0, 4);
  const slides = config.heroSlides || [];

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="bg-[#09090b]">
      {/* Hero Slider */}
      <section className="relative h-[65vh] sm:h-[70vh] md:h-[80vh] lg:h-[88vh] overflow-hidden bg-black">
        {slides.map((slide, index) => (
          <div 
            key={index}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          >
            <div className="absolute inset-0 z-0">
               <img src={slide.imageUrl} className="w-full h-full object-cover blur-[80px] opacity-30 scale-125 transition-transform duration-[8000ms]" alt="" aria-hidden="true" />
            </div>
            <div className="absolute inset-0 z-10 flex items-center justify-center p-0">
              <img src={slide.imageUrl} className="w-full h-full object-contain pointer-events-none" alt={slide.title} loading="eager" />
            </div>
            {/* Sombreamentos removidos conforme solicitado */}
            <div className="absolute inset-0 z-30 flex items-end pb-8 md:pb-28">
              <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 w-full text-center md:text-left">
                <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out">
                  {/* Escrita "Destaque" e textos do slide removidos conforme solicitado */}
                  <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center md:justify-start">
                    <Link to="/catalog" className="bg-blue-600 hover:bg-blue-700 text-white font-black px-6 md:px-12 py-3.5 md:py-5 rounded-xl md:rounded-2xl transition-all uppercase tracking-widest text-[9px] md:text-[10px] text-center active:scale-95 shadow-xl shadow-blue-600/30">
                      Explorar Acervo
                    </Link>
                    <a href={`https://wa.me/${config.contactPhone}`} target="_blank" className="bg-white/5 hover:bg-white/10 backdrop-blur-md text-white font-black px-6 md:px-10 py-3.5 md:py-5 rounded-xl md:rounded-2xl border border-white/10 flex items-center justify-center gap-3 transition-all uppercase tracking-widest text-[9px] md:text-[10px] active:scale-95">
                      <MessageCircle className="w-4 h-4" /> Suporte 24h
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        {slides.length > 1 && (
          <div className="absolute bottom-4 md:bottom-8 left-1/2 md:left-12 -translate-x-1/2 md:translate-x-0 z-40 flex items-center gap-2 md:gap-3">
            {slides.map((_, i) => (
              <button key={i} onClick={() => setCurrentSlide(i)} className={`h-1 transition-all duration-500 rounded-full ${i === currentSlide ? 'w-8 md:w-16 bg-blue-600' : 'w-3 md:w-6 bg-white/20 hover:bg-white/40'}`} />
            ))}
          </div>
        )}
      </section>

      {/* Destaques */}
      <section className="py-12 md:py-24">
        <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12">
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 mb-8 md:mb-12">
            <h2 className="text-xl md:text-2xl font-black text-white uppercase italic tracking-tighter text-center sm:text-left">{config.featuredTitle}</h2>
            <Link to="/catalog" className="text-[9px] md:text-[10px] font-black text-zinc-600 hover:text-blue-500 flex items-center gap-2 transition-colors uppercase tracking-widest">
              Ver Tudo <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {featuredGames.map(game => <GameCard key={game.id} game={game} />)}
          </div>
        </div>
      </section>

      {/* Categorias */}
      <section className="py-12 md:py-24 border-t border-white/5 bg-zinc-950/50">
        <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12">
          <div className="max-w-xl mx-auto text-center mb-10 md:mb-16">
            <h2 className="text-xl md:text-2xl font-black text-white uppercase italic tracking-tighter mb-4">{config.categoriesTitle}</h2>
            <div className="h-1 w-12 md:w-16 bg-blue-600 mx-auto rounded-full"></div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 md:gap-4">
            {categories.map(cat => (
              <Link key={cat.id} to={`/catalog?category=${cat.name}`} className="bg-zinc-900 border border-white/5 p-4 md:p-8 rounded-xl md:rounded-[2rem] text-center hover:bg-blue-600 transition-all group relative overflow-hidden flex items-center justify-center">
                <span className="text-[8px] md:text-[10px] font-black text-zinc-500 group-hover:text-white uppercase tracking-[0.2em]">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section id="como-funciona" className="py-20 md:py-32 border-t border-white/5 relative overflow-hidden bg-zinc-950/30 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12">
          <div className="text-center mb-16 md:mb-24">
             <h2 className="text-3xl md:text-5xl font-black text-white uppercase italic tracking-tighter mb-4">COMO FUNCIONA A <span className="text-blue-500">TROIA GAMES</span></h2>
             <p className="text-zinc-500 font-bold uppercase tracking-[0.3em] text-[10px] md:text-xs">Simples, Rápido e 100% Digital</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
             {[
               { icon: Search, title: "1. ESCOLHA", desc: "Navegue pelo nosso catálogo e escolha seu jogo favorito para PS4 ou PS5." },
               { icon: PIX_LOGO_URL, title: "2. PAGUE", desc: "Finalize via PIX automático e receba a confirmação em segundos no sistema." },
               { icon: CheckCircle2, title: "3. RECEBA", desc: "Os dados de acesso são enviados imediatamente ao seu WhatsApp de cadastro." },
               { icon: Gamepad2, title: "4. JOGUE", desc: "Configure em seu console e divirta-se sem limites durante o período contratado!" }
             ].map((step, i) => (
               <div key={i} className="bg-zinc-900/40 border border-white/5 p-10 rounded-[2.5rem] hover:border-blue-500/30 transition-all group">
                  <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white mb-8 shadow-xl shadow-blue-600/20 group-hover:scale-110 transition-transform">
                     {typeof step.icon === 'string' ? (
                       <img src={step.icon} className="w-8 h-8 object-contain brightness-0 invert" alt="Pix" />
                     ) : (
                       <step.icon className="w-8 h-8" />
                     )}
                  </div>
                  <h3 className="text-white font-black text-xl mb-4 uppercase italic tracking-tighter">{step.title}</h3>
                  <p className="text-zinc-500 text-sm font-medium leading-relaxed">{step.desc}</p>
               </div>
             ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;