import React, { useState, useEffect } from 'react';
import { getOrders, updateOrderStatus, deleteOrder } from '../../store';
import { Order } from '../../types';
import { 
  Search, 
  ShoppingBag, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  ExternalLink, 
  Eye, 
  X,
  User,
  Smartphone,
  Mail,
  Calendar,
  AlertCircle
} from 'lucide-react';

const OrdersManager: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<Order['status'] | 'Todos'>('Todos');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const allOrders = await getOrders();
      setOrders(allOrders);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusUpdate = async (id: string, status: Order['status']) => {
    await updateOrderStatus(id, status);
    loadData();
    if (selectedOrder?.id === id) {
      setSelectedOrder(prev => prev ? { ...prev, status } : null);
    }
  };

  const confirmDelete = async () => {
    if (deleteId) {
      await deleteOrder(deleteId);
      loadData();
      setDeleteId(null);
      setSelectedOrder(null);
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = (o.customer_name?.toLowerCase().includes(search.toLowerCase()) || '') || 
                          (o.id?.toLowerCase().includes(search.toLowerCase()) || '');
    const matchesStatus = filterStatus === 'Todos' || o.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'Aprovado': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'Cancelado': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
    }
  };

  return (
    <div className="space-y-8 md:space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl md:text-4xl font-black text-white uppercase italic tracking-tighter">LISTA DE <span className="text-blue-500">PEDIDOS</span></h1>
        <div className="px-4 py-2 bg-zinc-900 border border-white/5 rounded-xl text-[10px] font-black uppercase text-zinc-500 tracking-widest w-fit">
           {orders.length} Registros
        </div>
      </div>

      <div className="bg-zinc-900 border border-white/5 rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-5 md:p-8 border-b border-white/5 bg-zinc-900/50 flex flex-col xl:flex-row gap-6 items-center justify-between">
           <div className="relative w-full max-w-lg">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-zinc-700" />
              <input 
                type="text" 
                placeholder="Buscar cliente ou pedido..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-zinc-950 border border-white/5 text-white pl-12 md:pl-16 pr-4 py-3 md:py-4 rounded-xl md:rounded-2xl w-full outline-none focus:border-blue-600/50 shadow-inner text-sm font-bold"
              />
           </div>
           <div className="flex items-center gap-1.5 md:gap-2 bg-zinc-950 p-1.5 rounded-xl md:rounded-2xl border border-white/5 overflow-x-auto no-scrollbar w-full xl:w-auto">
              {['Todos', 'Pendente', 'Aprovado', 'Cancelado'].map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s as any)}
                  className={`px-4 md:px-6 py-2.5 md:py-3 rounded-lg md:rounded-xl text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${filterStatus === s ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-zinc-600 hover:text-white'}`}
                >
                  {s}
                </button>
              ))}
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[900px]">
            <thead>
              <tr className="bg-zinc-950/50 text-zinc-600 text-[9px] md:text-[10px] uppercase tracking-widest font-black">
                <th className="px-6 md:px-10 py-4 md:py-6">ID Pedido</th>
                <th className="px-6 md:px-10 py-4 md:py-6">Cliente</th>
                <th className="px-6 md:px-10 py-4 md:py-6">Data</th>
                <th className="px-6 md:px-10 py-4 md:py-6">Total</th>
                <th className="px-6 md:px-10 py-4 md:py-6 text-center">Status</th>
                <th className="px-6 md:px-10 py-4 md:py-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredOrders.length === 0 ? (
                <tr><td colSpan={6} className="p-20 text-center text-zinc-700 font-black uppercase tracking-widest text-[10px] italic">Nenhum pedido encontrado</td></tr>
              ) : (
                filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-zinc-800/20 transition-all group">
                    <td className="px-6 md:px-10 py-4 md:py-6 font-mono text-[10px] text-zinc-500">{order.id}</td>
                    <td className="px-6 md:px-10 py-4 md:py-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-white uppercase text-[11px] md:text-xs">{order.customer_name}</span>
                        <span className="text-[10px] text-zinc-600 truncate max-w-[150px]">{order.customer_email}</span>
                      </div>
                    </td>
                    <td className="px-6 md:px-10 py-4 md:py-6">
                      <span className="text-zinc-500 text-[10px] font-bold uppercase">{new Date(order.created_at).toLocaleDateString()}</span>
                    </td>
                    <td className="px-6 md:px-10 py-4 md:py-6">
                      <span className="text-blue-400 font-black text-xs">R$ {order.total.toFixed(2).replace('.', ',')}</span>
                    </td>
                    <td className="px-6 md:px-10 py-4 md:py-6 text-center">
                      <span className={`px-3 py-1 rounded-lg text-[8px] md:text-[9px] font-black uppercase tracking-widest border inline-block ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 md:px-10 py-4 md:py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                         <button 
                           onClick={() => setSelectedOrder(order)}
                           className="p-2 md:p-3 bg-zinc-950 text-zinc-500 hover:text-blue-500 rounded-lg border border-white/5 transition-all"
                         >
                            <Eye className="w-4 h-4" />
                         </button>
                         <button 
                           onClick={() => setDeleteId(order.id)} 
                           className="p-2 md:p-3 bg-zinc-950 text-zinc-500 hover:text-red-500 rounded-lg border border-white/5 transition-all"
                         >
                            <Trash2 className="w-4 h-4" />
                         </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detalhes do Pedido - Modal Responsivo */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/95 backdrop-blur-xl animate-in fade-in">
           <div className="bg-zinc-950 w-full max-w-4xl max-h-[95vh] overflow-y-auto rounded-t-[2rem] sm:rounded-[3rem] border-x border-t sm:border border-white/10 shadow-2xl p-6 md:p-14 relative no-scrollbar animate-in slide-in-from-bottom-full sm:zoom-in-95">
              <button onClick={() => setSelectedOrder(null)} className="absolute top-6 right-6 md:top-10 md:right-10 p-2 md:p-3 bg-zinc-900 text-zinc-500 hover:text-white rounded-full transition-all border border-white/5 z-10"><X className="w-5 h-5 md:w-6 md:h-6" /></button>
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 pt-6">
                 <div className="lg:col-span-7 space-y-8 md:space-y-10">
                    <div>
                       <span className={`px-4 py-1.5 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest border mb-4 md:mb-6 inline-block ${getStatusColor(selectedOrder.status)}`}>
                         PEDIDO: {selectedOrder.status}
                       </span>
                       <h2 className="text-3xl md:text-4xl font-black text-white uppercase italic tracking-tighter leading-none">Resumo da <span className="text-blue-500">Transação</span></h2>
                       <p className="text-zinc-600 font-mono text-[10px] md:text-xs mt-2">{selectedOrder.id}</p>
                    </div>

                    <div className="space-y-4 md:space-y-6">
                       <h3 className="text-[9px] md:text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] border-b border-white/5 pb-3">Conteúdo do Carrinho</h3>
                       <div className="space-y-2 md:space-y-3">
                          {selectedOrder.items.map((item, i) => (
                            <div key={i} className="flex items-center justify-between bg-zinc-900/50 p-4 md:p-5 rounded-xl md:rounded-2xl border border-white/5 group hover:border-blue-500/20 transition-all">
                               <div className="flex items-center gap-3 md:gap-4 min-w-0">
                                  <div className="w-8 h-8 md:w-10 md:h-10 bg-zinc-950 rounded-lg flex items-center justify-center border border-white/5 shrink-0"><ShoppingBag className="w-4 h-4 md:w-5 md:h-5 text-blue-500" /></div>
                                  <div className="min-w-0">
                                     <p className="font-bold text-white uppercase text-[11px] md:text-xs truncate">{item.title}</p>
                                     <div className="flex items-center gap-2 mt-1">
                                       <span className="text-[8px] font-black text-zinc-600 uppercase bg-zinc-950 px-2 py-0.5 rounded tracking-tighter">{item.type}</span>
                                       <span className="text-[8px] font-black text-blue-500 uppercase bg-zinc-950 px-2 py-0.5 rounded tracking-tighter">{item.days}d</span>
                                     </div>
                                  </div>
                               </div>
                               <span className="text-xs md:text-sm font-black text-white shrink-0">R$ {item.price.toFixed(2).replace('.', ',')}</span>
                            </div>
                          ))}
                       </div>
                    </div>
                 </div>

                 <div className="lg:col-span-5 space-y-6 md:space-y-8">
                    <div className="bg-zinc-900 p-6 md:p-8 rounded-[2rem] border border-white/5 space-y-6 md:space-y-8">
                       <h3 className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-3">
                         <User className="w-4 h-4 text-blue-500" /> DADOS DO COMPRADOR
                       </h3>
                       <div className="space-y-5 md:space-y-6">
                          <div className="flex items-start gap-4">
                             <div className="p-2.5 bg-zinc-950 rounded-lg border border-white/5 shrink-0"><User className="w-3.5 h-3.5 text-zinc-600" /></div>
                             <div className="min-w-0">
                                <span className="text-[8px] font-black text-zinc-700 uppercase block mb-0.5">Nome Completo</span>
                                <span className="text-[11px] font-bold text-white uppercase truncate block">{selectedOrder.customer_name}</span>
                             </div>
                          </div>
                          <div className="flex items-start gap-4">
                             <div className="p-2.5 bg-zinc-950 rounded-lg border border-white/5 shrink-0"><Mail className="w-3.5 h-3.5 text-zinc-600" /></div>
                             <div className="min-w-0 flex-1">
                                <span className="text-[8px] font-black text-zinc-700 uppercase block mb-0.5">E-mail</span>
                                <span className="text-[11px] font-bold text-white block truncate">{selectedOrder.customer_email}</span>
                             </div>
                          </div>
                          {selectedOrder.customer_phone && (
                            <div className="flex items-start gap-4">
                               <div className="p-2.5 bg-zinc-950 rounded-lg border border-white/5 shrink-0"><Smartphone className="w-3.5 h-3.5 text-zinc-600" /></div>
                               <div>
                                  <span className="text-[8px] font-black text-zinc-700 uppercase block mb-0.5">Telefone</span>
                                  <a href={`https://wa.me/${selectedOrder.customer_phone.replace(/\D/g,'')}`} target="_blank" className="text-emerald-500 text-[11px] font-bold flex items-center gap-1.5 hover:underline transition-all">
                                     {selectedOrder.customer_phone} <ExternalLink className="w-3 h-3" />
                                  </a>
                               </div>
                            </div>
                          )}
                       </div>
                    </div>

                    <div className="bg-blue-600 p-6 md:p-8 rounded-[2rem] shadow-2xl shadow-blue-600/20 text-white">
                       <div className="flex justify-between items-center mb-1">
                          <span className="text-[9px] font-black uppercase tracking-widest opacity-80">Receita Total</span>
                          <Calendar className="w-4 h-4 opacity-50" />
                       </div>
                       <div className="flex items-baseline gap-1.5">
                          <span className="text-sm font-black opacity-60">R$</span>
                          <span className="text-4xl md:text-5xl font-black italic tracking-tighter leading-none">{selectedOrder.total.toFixed(2).replace('.', ',')}</span>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 md:gap-4">
                       <button 
                         onClick={() => handleStatusUpdate(selectedOrder.id, 'Aprovado')}
                         disabled={selectedOrder.status === 'Aprovado'}
                         className="flex flex-col items-center justify-center p-4 md:p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl md:rounded-3xl text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all group disabled:opacity-40"
                       >
                          <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8 mb-2 md:mb-3 group-hover:scale-110 transition-transform" />
                          <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest">Aprovar</span>
                       </button>
                       <button 
                         onClick={() => handleStatusUpdate(selectedOrder.id, 'Cancelado')}
                         disabled={selectedOrder.status === 'Cancelado'}
                         className="flex flex-col items-center justify-center p-4 md:p-6 bg-red-500/10 border border-red-500/20 rounded-2xl md:rounded-3xl text-red-500 hover:bg-red-500 hover:text-white transition-all group disabled:opacity-40"
                       >
                          <XCircle className="w-6 h-6 md:w-8 md:h-8 mb-2 md:mb-3 group-hover:scale-110 transition-transform" />
                          <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest">Cancelar</span>
                       </button>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Confirmação de Exclusão Omitida */}
    </div>
  );
};

export default OrdersManager;