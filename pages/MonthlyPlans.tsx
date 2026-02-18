
import React, { useState, useEffect } from 'react';
import { Check, Zap, Sparkles, ShieldCheck, Gamepad2, Rocket, ShoppingCart } from 'lucide-react';
import { getSiteConfig } from '../store';
import { MonthlyPlan } from '../types';

const MonthlyPlans: React.FC = () => {
  const [plans, setPlans] = useState<MonthlyPlan[]>([]);
  const [config] = useState(getSiteConfig());

  useEffect(() => {
    setPlans(config.monthlyPlans || []);
    window.scrollTo(0, 0);
  }, [config]);

  return (
    <div className="bg-[#09090b] min-h-screen pb-24">
      {/* Header Section */}
      <section className="relative py-20 md:py-32 overflow-hidden border-b border-white/5 bg-zinc-950/50">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-blue-600/5 blur-[120px] rounded-full"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <h1 className="text-4xl md:text-7xl font-black text-white uppercase italic tracking-tighter leading-none mb-6">
            {config.monthlyPlansTitle || 'CATÁLOGO DE PLANOS'}
          </h1>
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs md:text-sm max-w-2xl mx-auto">
            {config.monthlyPlansSubtitle || 'Explore nossas modalidades de assinatura e escolha o acesso que melhor se adapta ao seu perfil gamer.'}
          </p>
        </div>
      </section>

      {/* Plans Catalog Grid - Alterado para 3 colunas para combinar com o estilo do catálogo */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
          {plans.map((plan) => (
            <div 
              key={plan.id} 
              className={`group relative bg-zinc-900/40 border ${plan.featured ? 'border-blue-600/50 shadow-2xl shadow-blue-600/10' : 'border-white/5'} rounded-[2rem] overflow-hidden flex flex-col hover:border-blue-500/30 transition-all duration-500 h-full shadow-2xl`}
            >
              {plan.featured && (
                <div className="absolute top-4 left-4 z-20 bg-blue-600 text-white px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg">
                  RECOMENDADO
                </div>
              )}

              {/* Plan Image - Estilo idêntico ao do catálogo: w-full h-auto para não cortar e sem bordas */}
              <div className="relative overflow-hidden block w-full bg-transparent">
                {plan.imageUrl ? (
                  <img 
                    src={plan.imageUrl} 
                    alt={plan.name} 
                    className="w-full h-auto transition-transform duration-700 group-hover:scale-105 block" 
                  />
                ) : (
                  <div className="w-full aspect-[3/4] bg-zinc-800 flex items-center justify-center">
                    <Gamepad2 className="w-16 h-16 text-zinc-700" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
              </div>

              {/* Plan Info - Abaixo da imagem como no catálogo */}
              <div className="p-6 md:p-8 flex flex-col flex-grow">
                <div className="mb-6">
                  <h3 className="text-xl md:text-2xl font-black text-white uppercase italic tracking-tighter mb-2 group-hover:text-blue-400 transition-colors">
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-blue-500 font-black text-xs">R$</span>
                    <span className="text-3xl font-black text-white italic tracking-tighter">{plan.price}</span>
                    <span className="text-zinc-600 font-bold text-[9px] uppercase ml-1">/mês</span>
                  </div>
                  
                  <div className="bg-zinc-950/50 p-4 rounded-2xl border border-white/5 mb-6">
                    <span className="text-[7px] font-black text-zinc-600 uppercase tracking-widest block mb-1">OBSERVAÇÃO</span>
                    <p className="text-zinc-400 text-[10px] font-medium leading-relaxed italic">
                      "{plan.description}"
                    </p>
                  </div>
                </div>

                <div className="space-y-3 flex-grow">
                  <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest block mb-2">VANTAGENS INCLUSAS</span>
                  {plan.features.map((feature, j) => (
                    <div key={j} className="flex items-start gap-2.5">
                      <div className="w-3.5 h-3.5 bg-emerald-500/20 rounded flex items-center justify-center mt-0.5 shrink-0">
                        <Check className="w-2.5 h-2.5 text-emerald-500" />
                      </div>
                      <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-tight">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-8">
                  <a 
                    href={`https://wa.me/${config.contactPhone}?text=Olá! Gostaria de saber mais e assinar o plano: ${plan.name}`}
                    target="_blank"
                    className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-black uppercase tracking-widest text-[9px] transition-all active:scale-95 shadow-2xl ${plan.featured ? 'bg-blue-600 text-white shadow-blue-600/20' : 'bg-zinc-800 text-zinc-400 hover:bg-blue-600 hover:text-white border border-white/5'}`}
                  >
                    <ShoppingCart className="w-4 h-4" /> ALUGAR PLANO
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ / Info Section */}
      <section className="max-w-4xl mx-auto px-6 mt-20 text-center">
        <div className="inline-flex items-center gap-3 px-6 py-4 bg-zinc-900 border border-white/5 rounded-[2rem] text-zinc-400">
          <ShieldCheck className="w-6 h-6 text-blue-500" />
          <p className="text-[10px] md:text-xs font-black uppercase tracking-widest">
            Liberação imediata via WhatsApp após a confirmação.
          </p>
        </div>
        <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest mt-10 max-w-2xl mx-auto leading-relaxed">
          ASSINATURAS SEM FIDELIDADE. O CATÁLOGO DE ASSINATURAS É ATUALIZADO SEMANALMENTE COM NOVOS LANÇAMENTO
        </p>
      </section>
    </div>
  );
};

export default MonthlyPlans;
