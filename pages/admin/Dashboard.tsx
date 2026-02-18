
import React, { useState, useEffect, useMemo } from 'react';
import { getStats, getGames, getOrders } from '../../store';
import { DashboardStats, Game, Order } from '../../types';
import { 
  Gamepad2, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  DollarSign,
  ArrowUpRight,
  Activity,
  ShoppingBag
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import TrendIndicator from '../../components/TrendIndicator';

type TimeRange = 'Hoje' | 'Semana' | 'Mês';

const Dashboard: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>('Semana');
  const [gameStats, setGameStats] = useState<DashboardStats>(getStats());
  const [orders, setOrders] = useState<Order[]>([]);
  const [recentGames, setRecentGames] = useState<Game[]>([]);

  useEffect(() => {
    const initDashboard = async () => {
      setMounted(true);
      setGameStats(getStats());
      
      // Correção: Aguardar a promessa de getOrders()
      const fetchedOrders = await getOrders();
      setOrders(fetchedOrders);
      
      setRecentGames(getGames().filter(g => !g.externalUrl).sort((a, b) => b.id.localeCompare(a.id)).slice(0, 6));
    };
    
    initDashboard();
  }, []);

  const approvedOrders = useMemo(() => {
    // Garantir que orders seja sempre um array antes de filtrar
    if (!Array.isArray(orders)) return [];
    return orders.filter(o => o.status === 'Aprovado');
  }, [orders]);

  const stats = useMemo(() => {
    const totalRevenue = approvedOrders.reduce((acc, curr) => acc + curr.total, 0);
    const approvedCount = approvedOrders.length;
    
    return {
      totalGames: gameStats.totalGames,
      availableGames: gameStats.availableGames,
      rentedGames: approvedCount, // Consideramos alugados os pedidos aprovados
      projectedRevenue: totalRevenue
    };
  }, [gameStats, approvedOrders]);

  const chartData = useMemo(() => {
    const now = new Date();
    
    if (timeRange === 'Hoje') {
      const hours = ['00h', '04h', '08h', '12h', '16h', '20h', '23h'];
      return hours.map(label => {
        const hourLimit = parseInt(label);
        const count = approvedOrders.filter(o => {
          const d = new Date(o.created_at);
          return d.toDateString() === now.toDateString() && d.getHours() >= hourLimit && d.getHours() < hourLimit + 4;
        }).length;
        return { name: label, loc: count };
      });
    }

    if (timeRange === 'Semana') {
      const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
      const last7Days = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date();
        d.setDate(now.getDate() - (6 - i));
        return d;
      });

      return last7Days.map(date => {
        const count = approvedOrders.filter(o => new Date(o.created_at).toDateString() === date.toDateString()).length;
        return { name: days[date.getDay()], loc: count };
      });
    }

    if (timeRange === 'Mês') {
      const weeks = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'];
      return weeks.map((label, i) => {
        const count = approvedOrders.filter(o => {
          const d = new Date(o.created_at);
          const isThisMonth = d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
          const weekIndex = Math.floor((d.getDate() - 1) / 7);
          return isThisMonth && weekIndex === i;
        }).length;
        return { name: label, loc: count };
      });
    }

    return [];
  }, [approvedOrders, timeRange]);

  if (!mounted) return null;

  const StatCard = ({ title, value, icon: Icon, color, trend }: any) => (
    <div className="bg-zinc-900 border border-white/5 rounded-3xl p-8 relative overflow-hidden group hover:border-blue-500/30 transition-all shadow-xl">
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className={`p-4 rounded-2xl ${color} bg-opacity-10`}>
            <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
          </div>
          {trend && (
            <TrendIndicator trend={trend} />
          )}
        </div>
        <h3 className="text-zinc-500 text-xs font-black uppercase tracking-[0.2em]">{title}</h3>
        <p className="text-4xl font-black text-white mt-2 tracking-tighter">{value}</p>
      </div>
      <div className={`absolute -right-8 -bottom-8 w-32 h-32 ${color} opacity-[0.03] rounded-full blur-3xl group-hover:opacity-[0.06] transition-all`}></div>
    </div>
  );

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white mb-2 uppercase italic tracking-tighter">SISTEMA <span className="text-blue-500">DASHBOARD</span></h1>
          <p className="text-zinc-500 font-medium uppercase tracking-widest text-[9px]">Análise real baseada em pedidos aprovados</p>
        </div>
        <div className="flex items-center gap-2 bg-zinc-900 p-1.5 rounded-2xl border border-white/5">
           {(['Hoje', 'Semana', 'Mês'] as TimeRange[]).map((range) => (
             <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${timeRange === range ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-zinc-500 hover:text-white'}`}
             >
                {range}
             </button>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Acervo Total" value={stats.totalGames} icon={Gamepad2} color="bg-blue-500" trend={4} />
        <StatCard title="Disponíveis" value={stats.availableGames} icon={CheckCircle2} color="bg-emerald-500" trend={12} />
        <StatCard title="Aluguéis Pagos" value={stats.rentedGames} icon={ShoppingBag} color="bg-amber-500" trend={-2} />
        <StatCard title="Receita Real" value={`R$ ${stats.projectedRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} icon={DollarSign} color="bg-emerald-600" trend={24} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8 min-w-0">
           <div className="bg-zinc-900 border border-white/5 rounded-[2.5rem] p-10 shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between mb-10">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center border border-blue-600/20">
                       <TrendingUp className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                       <h3 className="text-sm font-black text-white uppercase tracking-widest">Fluxo de Vendas (Aprovadas)</h3>
                       <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Gráfico baseado em pedidos liquidados</p>
                    </div>
                 </div>
              </div>
              
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f1f23" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      stroke="#52525b" 
                      fontSize={11} 
                      fontWeight="bold" 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <YAxis 
                      stroke="#52525b" 
                      fontSize={11} 
                      fontWeight="bold" 
                      tickLine={false} 
                      axisLine={false} 
                      allowDecimals={false}
                    />
                    <Tooltip 
                      cursor={{fill: 'rgba(59, 130, 246, 0.05)'}}
                      contentStyle={{ 
                        backgroundColor: '#09090b', 
                        border: '1px solid #27272a', 
                        borderRadius: '16px', 
                        fontSize: '11px', 
                        fontWeight: 'bold' 
                      }} 
                      itemStyle={{ color: '#3b82f6' }}
                    />
                    <Bar dataKey="loc" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={timeRange === 'Mês' ? 60 : 40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
           </div>
        </div>

        <div className="lg:col-span-4 bg-zinc-900 border border-white/5 rounded-[2.5rem] p-10 shadow-2xl flex flex-col">
           <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center border border-white/5">
                 <Activity className="w-6 h-6 text-zinc-400" />
              </div>
              <div>
                 <h3 className="text-sm font-black text-white uppercase tracking-widest">Adicionados</h3>
                 <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Novidades no acervo</p>
              </div>
           </div>
           
           <div className="space-y-6 flex-grow overflow-y-auto no-scrollbar max-h-[400px]">
             {recentGames.map(game => (
               <div key={game.id} className="flex items-center gap-4 p-3 hover:bg-zinc-800/50 rounded-2xl transition-all group cursor-default">
                  <div className="w-12 h-14 rounded-xl overflow-hidden shadow-lg border border-white/5 shrink-0">
                    <img src={game.imageUrl} className="w-full h-full object-cover" alt={game.title} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-white truncate uppercase tracking-tight">{game.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] font-black text-zinc-600 uppercase bg-zinc-950 px-2 py-0.5 rounded border border-white/5">{game.platform}</span>
                      <span className="text-[9px] font-black text-blue-500 uppercase">{game.category}</span>
                    </div>
                  </div>
               </div>
             ))}
           </div>

           <button 
             onClick={() => window.location.hash = '#/admin/games'}
             className="w-full mt-10 py-5 bg-zinc-800 hover:bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl transition-all shadow-xl active:scale-95"
           >
              Ver Biblioteca Completa
           </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
