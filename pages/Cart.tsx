import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Trash2, 
  ChevronLeft, 
  Check, 
  MessageCircle, 
  Copy, 
  X, 
  ShoppingCart,
  Shield,
  CreditCard,
  ArrowRight,
  ShoppingBag,
  Zap,
  QrCode,
  User,
  Info
} from 'lucide-react';
import { CartItem, SiteConfig } from '../types';
import { PIX_LOGO_URL } from '../constants';
import { getGames, createOrder } from '../store';

interface CartProps {
  items: CartItem[];
  onRemove: (index: number) => void;
  onUpdate: (index: number, updates: Partial<CartItem>) => void;
  config: SiteConfig;
}

/**
 * Função para calcular o CRC16 (Padrão CCITT)
 * Obrigatório para que o payload PIX seja validado pelos aplicativos bancários.
 */
const calculateCRC16 = (data: string): string => {
  let crc = 0xFFFF;
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xFFFF;
      } else {
        crc = (crc << 1) & 0xFFFF;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
};

const Cart: React.FC<CartProps> = ({ items, onRemove, onUpdate, config }) => {
  const navigate = useNavigate();
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'info' | 'payment'>('info');
  const [copied, setCopied] = useState(false);
  
  const [payerName, setPayerName] = useState('');
  const [payerEmail, setPayerEmail] = useState('');
  const [payerPhone, setPayerPhone] = useState('');

  const allGames = getGames();

  const calculateItemPrice = (item: CartItem) => {
    const table = config.priceTable[item.type as keyof typeof config.priceTable] as Record<number, number>;
    return table[item.days] || 0;
  };

  const selectedItems = items.filter(item => item.selected !== false);
  const total = selectedItems.reduce((sum, item) => sum + calculateItemPrice(item), 0);

  /**
   * GERAÇÃO DO PAYLOAD PIX AUTOMATIZADO (BR CODE / PIX ESTÁTICO)
   * Este bloco gera a string "Copia e Cola" real aceita por todos os bancos.
   */
  const pixPayload = useMemo(() => {
    const key = config.pixKey.trim();
    const storeName = config.siteName.substring(0, 25).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
    const city = "BRASIL";
    const amount = total.toFixed(2);

    const f = (id: string, val: string) => `${id}${val.length.toString().padStart(2, '0')}${val}`;

    const merchantAccount = f('00', 'br.gov.bcb.pix') + f('01', key);
    
    let payload = '000201';
    payload += f('26', merchantAccount);
    payload += '52040000';
    payload += '5303986';
    payload += f('54', amount);
    payload += '5802BR';
    payload += f('59', storeName);
    payload += f('60', city);
    payload += f('62', f('05', 'TROIA'));
    payload += '6304';

    const crc = calculateCRC16(payload);
    return payload + crc;
  }, [config.pixKey, config.siteName, total]);

  const handleStartCheckout = () => {
    if (selectedItems.length === 0) return;
    setIsCheckoutModalOpen(true);
    setCheckoutStep('info');
  };

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutStep('payment');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFinish = () => {
    const orderItems = selectedItems.map(item => ({
      title: item.title,
      type: item.type,
      days: item.days,
      price: calculateItemPrice(item)
    }));

    createOrder({
      customer_name: payerName,
      customer_email: payerEmail,
      customer_phone: payerPhone,
      items: orderItems,
      total: total
    });

    let message = `🚀 *NOVO PEDIDO - ${config.siteName}*\n\n`;
    message += `👤 *CLIENTE:* ${payerName}\n`;
    message += `💳 *MÉTODO:* PIX AUTOMATIZADO\n\n`;
    selectedItems.forEach((item) => {
      message += `🎮 *${item.title}* (${item.type} - ${item.days}d)\n`;
    });
    message += `\n💰 *TOTAL:* R$ ${total.toFixed(2).replace('.', ',')}\n\nO pagamento foi gerado via Copia e Cola automático. Segue o comprovante anexo.`;
    
    window.open(`https://wa.me/${config.contactPhone}?text=${encodeURIComponent(message)}`, '_blank');
    setIsCheckoutModalOpen(false);
  };

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(pixPayload)}&color=000000&bgcolor=ffffff&margin=1`;

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 bg-[#09090b]">
        <div className="w-20 h-20 bg-zinc-900 rounded-3xl flex items-center justify-center mb-6 border border-white/5 shadow-2xl">
          <ShoppingBag className="w-10 h-10 text-zinc-600" />
        </div>
        <h2 className="text-2xl font-black text-white mb-2 uppercase italic tracking-tighter">Seu carrinho está vazio</h2>
        <p className="text-zinc-600 mb-10 font-bold uppercase tracking-widest text-[10px]">Escolha um jogo para começar</p>
        <Link to="/catalog" className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-95 shadow-lg shadow-blue-600/20">
          Ver Catálogo Completo
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] pt-12 pb-32">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="flex items-center justify-between mb-12">
           <div>
              <button 
                onClick={() => navigate(-1)} 
                className="flex items-center gap-2 text-zinc-600 hover:text-white transition-colors text-[9px] font-black uppercase tracking-widest mb-4"
              >
                <ChevronLeft className="w-4 h-4" /> VOLTAR
              </button>
              <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">
                CARRINHO DE <span className="text-blue-500">COMPRAS</span>
              </h1>
           </div>
           <div className="text-right hidden sm:block">
              <span className="text-zinc-600 text-[9px] font-black uppercase tracking-widest block">ITENS NO CARRINHO</span>
              <span className="text-white font-black text-2xl tracking-tighter italic">{items.length} GAMES</span>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-4">
            {items.map((item, idx) => {
              const gameData = allGames.find(g => g.id === item.gameId);
              const price = calculateItemPrice(item);
              const availableDays = Object.keys(config.priceTable[item.type] || {}).map(Number).sort((a,b) => a-b);

              return (
                <div key={idx} className="bg-zinc-900/50 border border-white/5 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 group hover:border-blue-500/20 transition-all">
                  <div className="flex items-center gap-6 flex-1 w-full">
                    <div className="w-16 h-20 bg-zinc-800 rounded-xl overflow-hidden shadow-xl shrink-0 border border-white/5">
                      {gameData?.imageUrl ? (
                        <img src={gameData.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                          <ShoppingBag className="w-6 h-6 text-zinc-700" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">{gameData?.platform || 'Digital'}</span>
                      </div>
                      <h3 className="text-lg font-black text-white uppercase italic tracking-tight truncate">{item.title}</h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="text-[8px] font-black text-zinc-400 bg-zinc-950 border border-white/5 px-2 py-0.5 rounded uppercase">{item.type}</span>
                        <span className="text-[8px] font-black text-zinc-500 bg-zinc-950 border border-white/5 px-2 py-0.5 rounded uppercase">{item.days} Dias</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between md:justify-end gap-6 w-full md:w-auto">
                    <div className="flex items-center gap-4 bg-zinc-950 p-2 rounded-xl border border-white/5">
                      <select 
                        value={item.days}
                        onChange={(e) => onUpdate(idx, { days: Number(e.target.value) })}
                        className="bg-transparent text-[10px] font-black text-zinc-400 uppercase outline-none px-2 cursor-pointer"
                      >
                        {availableDays.map(d => <option key={d} value={d}>{d} Dias</option>)}
                      </select>
                    </div>

                    <div className="text-right">
                       <span className="text-[8px] font-black text-zinc-700 uppercase block tracking-widest">Valor</span>
                       <span className="text-xl font-black text-white italic tracking-tighter">R$ {price.toFixed(2).replace('.', ',')}</span>
                    </div>

                    <button 
                      onClick={() => onRemove(idx)} 
                      className="p-3 bg-zinc-950 text-zinc-700 hover:text-red-500 rounded-xl border border-white/5 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="lg:col-span-4">
            <div className="bg-zinc-900 border border-white/5 rounded-[2.5rem] p-8 md:p-10 space-y-10 shadow-2xl">
              <div>
                <h3 className="text-white font-black uppercase italic tracking-tighter text-xl">Resumo do Pedido</h3>
                <div className="h-1 w-12 bg-blue-600 mt-2 rounded-full"></div>
              </div>

              <div className="space-y-4 pt-4">
                 <div className="flex justify-between items-center text-[10px] font-black text-zinc-600 uppercase tracking-widest">
                    <span>Subtotal</span>
                    <span className="text-zinc-300">R$ {total.toFixed(2).replace('.', ',')}</span>
                 </div>
                 <div className="flex justify-between items-center text-[10px] font-black text-zinc-600 uppercase tracking-widest">
                    <span>Taxa de Serviço</span>
                    <span className="text-emerald-500">Grátis</span>
                 </div>
                 
                 <div className="pt-6 border-t border-white/5 flex flex-col gap-1">
                    <span className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">Total do Pedido</span>
                    <div className="flex items-baseline gap-2">
                       <span className="text-blue-500 font-black text-lg">R$</span>
                       <span className="text-5xl font-black text-white italic tracking-tighter">{total.toFixed(2).replace('.', ',')}</span>
                    </div>
                 </div>
              </div>

              <div className="space-y-4">
                 <button 
                  onClick={handleStartCheckout}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-6 rounded-2xl transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3 active:scale-95 uppercase tracking-widest text-xs"
                 >
                   Finalizar Pagamento <ArrowRight className="w-4 h-4" />
                 </button>
                 <div className="bg-zinc-950/50 p-6 rounded-2xl border border-white/5">
                    <p className="text-[9px] text-zinc-600 font-bold leading-relaxed uppercase tracking-widest text-center">
                      {config.checkoutNote || 'Envio imediato após confirmação.'}
                    </p>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isCheckoutModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6 bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="bg-zinc-950 w-full max-w-xl rounded-[2.5rem] md:rounded-[3rem] border border-white/10 relative shadow-2xl animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh] no-scrollbar">
              <button onClick={() => setIsCheckoutModalOpen(false)} className="absolute top-4 right-4 md:top-6 md:right-6 text-zinc-500 hover:text-white z-20 p-2 bg-zinc-900/50 rounded-full border border-white/5"><X className="w-5 h-5" /></button>
              
              <div className="p-6 md:p-10">
                {checkoutStep === 'info' ? (
                  <div className="animate-in slide-in-from-right-4 duration-300">
                    <div className="mb-8 text-center">
                        <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-600/20">
                          <User className="w-6 h-6 text-blue-500" />
                        </div>
                        <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Identificação</h2>
                        <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest mt-1">Dados para entrega do pedido</p>
                    </div>

                    <form onSubmit={handleProceedToPayment} className="space-y-5">
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest px-2">Nome Completo</label>
                          <input 
                            type="text" required value={payerName} onChange={e => setPayerName(e.target.value)}
                            className="w-full bg-zinc-900 border border-white/5 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:border-blue-500 transition-all font-bold placeholder:text-zinc-800 shadow-inner"
                            placeholder="Seu nome"
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div className="space-y-2">
                            <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest px-2">E-mail</label>
                            <input 
                              type="email" required value={payerEmail} onChange={e => setPayerEmail(e.target.value)}
                              className="w-full bg-zinc-900 border border-white/5 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:border-blue-500 transition-all font-bold placeholder:text-zinc-800 shadow-inner"
                              placeholder="exemplo@email.com"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest px-2">WhatsApp</label>
                            <input 
                              type="tel" required value={payerPhone} onChange={e => setPayerPhone(e.target.value)}
                              className="w-full bg-zinc-900 border border-white/5 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:border-blue-500 transition-all font-bold placeholder:text-zinc-800 shadow-inner"
                              placeholder="(00) 00000-0000"
                            />
                          </div>
                        </div>
                        <button 
                          type="submit"
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl transition-all shadow-xl active:scale-95 uppercase tracking-[0.2em] text-[10px] mt-2"
                        >
                          Ir para o Pagamento
                        </button>
                    </form>
                  </div>
                ) : (
                  <div className="animate-in slide-in-from-right-4 duration-300 space-y-6">
                    <div className="text-center">
                        <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-blue-600/20">
                          <QrCode className="w-6 h-6 text-blue-500" />
                        </div>
                        <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">PAGAMENTO PIX</h2>
                        <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest mt-1">Simples • Rápido • Seguro</p>
                    </div>

                    <div className="flex flex-col items-center">
                        {/* QR Code centralizado e responsivo */}
                        <div className="relative group mb-6">
                            <div className="absolute -inset-4 bg-blue-600/5 rounded-[2.5rem] blur-xl group-hover:bg-blue-600/10 transition-all"></div>
                            <div className="relative bg-white p-4 rounded-3xl shadow-xl border-2 border-zinc-100 flex items-center justify-center">
                                <img 
                                  src={qrCodeUrl} 
                                  alt="PIX QR Code" 
                                  className="w-36 h-36 md:w-44 md:h-44 object-contain rounded-lg"
                                />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-lg shadow-md flex items-center justify-center border border-zinc-100 p-1">
                                    <img src={PIX_LOGO_URL} className="w-full h-full object-contain" alt="Pix" />
                                </div>
                            </div>
                        </div>

                        <div className="w-full space-y-4">
                            {/* Área Copia e Cola mais compacta */}
                            <div className="bg-zinc-900/80 p-5 rounded-2xl border border-white/5 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                      <Copy className="w-3 h-3 text-blue-500" /> PIX COPIA E COLA
                                    </span>
                                    <button 
                                      onClick={() => copyToClipboard(pixPayload)} 
                                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${copied ? 'bg-emerald-600 text-white' : 'bg-blue-600/10 text-blue-500 hover:bg-blue-600 hover:text-white border border-blue-600/20'}`}
                                    >
                                      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                      {copied ? 'Copiado' : 'Copiar'}
                                    </button>
                                </div>
                                <div className="bg-zinc-950 p-3 rounded-xl border border-white/5">
                                    <code className="text-[9px] text-zinc-500 font-mono break-all block leading-tight line-clamp-2 opacity-60">
                                      {pixPayload}
                                    </code>
                                </div>
                            </div>

                            {/* Detalhes de pagamento em grid otimizado */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-zinc-900/50 p-4 rounded-2xl border border-white/5 flex flex-col justify-center">
                                    <span className="text-[7px] font-black text-zinc-600 uppercase block mb-1 tracking-widest">Valor Total</span>
                                    <span className="text-xl font-black text-white italic tracking-tighter leading-none">R$ {total.toFixed(2).replace('.', ',')}</span>
                                </div>
                                <div className="bg-zinc-900/50 p-4 rounded-2xl border border-white/5 flex flex-col justify-center">
                                    <span className="text-[7px] font-black text-zinc-600 uppercase block mb-1 tracking-widest">Recebedor</span>
                                    <span className="text-[9px] font-black text-blue-500 uppercase truncate leading-none">{config.siteName}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 pt-2">
                        <button 
                          onClick={handleFinish} 
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-5 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-xl active:scale-95 uppercase tracking-[0.2em] text-[9px]"
                        >
                          <MessageCircle className="w-4 h-4" /> Enviar Comprovante WhatsApp
                        </button>
                        
                        <div className="flex items-center justify-center gap-3">
                          <button onClick={() => setCheckoutStep('info')} className="text-zinc-600 hover:text-white text-[8px] font-black uppercase tracking-widest py-1 transition-colors">Voltar aos dados</button>
                          <div className="w-1 h-1 bg-zinc-800 rounded-full"></div>
                          <span className="text-[8px] text-zinc-700 font-bold uppercase tracking-widest flex items-center gap-1.5">
                            <Shield className="w-2.5 h-2.5" /> Pagamento Seguro
                          </span>
                        </div>
                    </div>
                  </div>
                )}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Cart;