import React, { useState, useRef, useEffect } from 'react';
import { getSiteConfig, saveSiteConfig, getGames, updateGame, deleteGame, getCategories } from '../../store';
import { SiteConfig, HeroSlide, Game, Category, MonthlyPlan } from '../../types';
import { 
  Save, 
  CheckCircle, 
  DollarSign, 
  Trash2, 
  Edit2,
  Layout,
  Upload,
  Zap,
  Palette,
  Phone,
  Mail,
  MapPin,
  PlusCircle,
  X,
  Plus,
  ShieldAlert,
  Instagram,
  Lock,
  Shield,
  CreditCard,
  Store,
  ExternalLink,
  Image as ImageIcon,
  AlertCircle,
  Type,
  Globe,
  Clock,
  Package,
  Sparkles,
  Gamepad2,
  Star
} from 'lucide-react';
import ImageResizerModal from '../../components/ImageResizerModal';

interface ConfigManagerProps {
  onSave: () => void;
}

const InputGroup = ({ label, value, onChange, icon: Icon, placeholder, type = "text" }: any) => (
  <div className="space-y-3">
    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] px-2 block">{label}</label>
    <div className="relative group">
      {Icon && <Icon className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-700 group-focus-within:text-blue-500 transition-colors" />}
      <input 
        type={type}
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full bg-zinc-900 border border-white/5 rounded-2xl px-6 ${Icon ? 'pl-16' : ''} py-5 text-white focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600/50 transition-all text-sm font-bold outline-none placeholder:text-zinc-800 shadow-inner`}
      />
    </div>
  </div>
);

const ConfigManager: React.FC<ConfigManagerProps> = ({ onSave }) => {
  const [config, setConfig] = useState<SiteConfig>(getSiteConfig());
  const [partnerGames, setPartnerGames] = useState<Game[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'pricing' | 'brand' | 'home' | 'footer' | 'checkout' | 'security' | 'partner'>('pricing');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  
  const [alertMsg, setAlertMsg] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ msg: string; onConfirm: () => void } | null>(null);

  const [isPartnerProductModalOpen, setIsPartnerProductModalOpen] = useState(false);
  const [editingPartnerProduct, setEditingPartnerProduct] = useState<Partial<Game> | null>(null);
  const [resizerData, setResizerData] = useState<{ image: string; slideIndex: number | 'logo' | 'footerLogo' | 'icon' | 'banner' | 'partnerBanner' | 'partnerProduct' | 'planImage'; aspect: number } | null>(null);

  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Partial<MonthlyPlan> | null>(null);
  const [newFeature, setNewFeature] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const allGames = getGames();
    setPartnerGames(allGames.filter(g => !!g.externalUrl));
    setCategories(getCategories());
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    saveSiteConfig(config);
    setSaved(true);
    onSave(); 
    setTimeout(() => setSaved(false), 3000);
  };

  const handleImageUploadRequest = (e: React.ChangeEvent<HTMLInputElement>, slideIndex: any, aspect: number) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setResizerData({ image: reader.result as string, slideIndex, aspect });
      };
      reader.readAsDataURL(file);
    }
  };

  const addHeroSlide = () => {
    const newSlide: HeroSlide = {
      title: 'NOVO SLIDE IMPACTANTE',
      subtitle: 'Descrição da sua nova promoção or lançamento...',
      imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1600'
    };
    setConfig({ ...config, heroSlides: [...(config.heroSlides || []), newSlide] });
  };

  const removeHeroSlide = (index: number) => {
    if (config.heroSlides.length <= 1) {
      setAlertMsg("O site deve ter pelo menos um slide ativo no Hero.");
      return;
    }
    setConfirmModal({
      msg: "Tem certeza que deseja remover este banner permanentemente?",
      onConfirm: () => {
        const updated = config.heroSlides.filter((_, i) => i !== index);
        setConfig({ ...config, heroSlides: updated });
        setConfirmModal(null);
      }
    });
  };

  const updateHeroSlide = (index: number, updates: Partial<HeroSlide>) => {
    const updated = config.heroSlides.map((slide, i) => i === index ? { ...slide, ...updates } : slide);
    setConfig({ ...config, heroSlides: updated });
  };

  const addAdmin = () => {
    if (!newAdminEmail) return;
    if (config.adminEmails.includes(newAdminEmail)) {
      setAlertMsg("Este e-mail já está na lista de administradores.");
      return;
    }
    setConfig({ ...config, adminEmails: [...config.adminEmails, newAdminEmail] });
    setNewAdminEmail('');
  };

  const removeAdmin = (email: string) => {
    if (config.adminEmails.length <= 1) {
      setAlertMsg("Deve haver pelo menos um administrador configurado.");
      return;
    }
    setConfirmModal({
      msg: `Deseja remover ${email} do acesso administrativo?`,
      onConfirm: () => {
        setConfig({ ...config, adminEmails: config.adminEmails.filter(e => e !== email) });
        setConfirmModal(null);
      }
    });
  };

  const handleSavePartnerProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPartnerProduct) return;
    const product: Game = {
      id: editingPartnerProduct.id || `partner_${Date.now()}`,
      title: editingPartnerProduct.title || '',
      imageUrl: editingPartnerProduct.imageUrl || 'https://picsum.photos/600/800',
      externalUrl: editingPartnerProduct.externalUrl || '',
      price: Number(editingPartnerProduct.price) || 0,
      platform: (editingPartnerProduct.platform as any) || 'Físico',
      category: editingPartnerProduct.category || 'Geral',
      description: editingPartnerProduct.description || '',
      status: 'Disponível',
      stockPrimary: 1,
      stockSecondary: 0,
      minStockPrimary: 0,
      minStockSecondary: 0,
      isFeatured: false,
      isNew: false,
      mostRented: false,
      images: [],
      rating: 'L',
      releaseDate: new Date().toISOString().split('T')[0]
    };
    updateGame(product);
    loadData();
    setIsPartnerProductModalOpen(false);
    setEditingPartnerProduct(null);
  };

  const deletePartnerProduct = (id: string) => {
    setConfirmModal({
      msg: "Deseja remover este produto da Loja Parceira?",
      onConfirm: () => {
        deleteGame(id);
        loadData();
        setConfirmModal(null);
      }
    });
  };

  const ImageUploadButton = ({ label, value, onUpload, aspect = 1 }: any) => {
    const inputRef = useRef<HTMLInputElement>(null);
    return (
      <div className="space-y-4">
        <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] px-2 block">{label}</label>
        <div 
          onClick={() => inputRef.current?.click()}
          className={`relative group cursor-pointer ${aspect === 1 ? 'w-32 h-32' : 'aspect-video w-full'} bg-zinc-900 border-2 border-dashed border-white/10 rounded-3xl overflow-hidden hover:border-blue-600/50 transition-all flex flex-col items-center justify-center p-2 shadow-inner`}
        >
          {value ? (
            <>
              <img src={value} className="absolute inset-0 w-full h-full object-contain group-hover:scale-105 transition-transform" alt="Preview" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                 <Upload className="w-6 h-6 text-white" />
              </div>
            </>
          ) : (
            <div className="text-center">
              <ImageIcon className="w-8 h-8 text-zinc-800 mx-auto mb-2" />
              <span className="text-[8px] font-black text-zinc-700 uppercase">Upload</span>
            </div>
          )}
          <input type="file" ref={inputRef} className="hidden" accept="image/*" onChange={onUpload} />
        </div>
      </div>
    );
  };

  // Funções para gerenciar planos mensais
  const openPlanModal = (plan?: MonthlyPlan) => {
    setEditingPlan(plan || {
      name: '',
      price: '',
      description: '',
      imageUrl: '',
      features: [],
      icon: 'Gamepad2',
      featured: false
    });
    setNewFeature('');
    setIsPlanModalOpen(true);
  };

  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;
    
    const planToSave = {
      ...editingPlan,
      id: editingPlan.id || `plan_${Date.now()}`
    } as MonthlyPlan;

    const currentPlans = config.monthlyPlans || [];
    const updatedPlans = editingPlan.id 
      ? currentPlans.map(p => p.id === editingPlan.id ? planToSave : p)
      : [...currentPlans, planToSave];

    setConfig({ ...config, monthlyPlans: updatedPlans });
    setIsPlanModalOpen(false);
  };

  const removePlan = (id: string) => {
    setConfirmModal({
      msg: "Deseja remover este plano mensal?",
      onConfirm: () => {
        const updated = config.monthlyPlans.filter(p => p.id !== id);
        setConfig({ ...config, monthlyPlans: updated });
        setConfirmModal(null);
      }
    });
  };

  return (
    <div className="space-y-12 pb-24 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div>
          <h1 className="text-4xl font-black text-white mb-2 uppercase italic tracking-tighter">CONFIGURAÇÃO <span className="text-blue-500">SISTEMA</span></h1>
          <p className="text-zinc-500 font-medium uppercase tracking-widest text-[10px]">Gestão avançada da plataforma</p>
        </div>
        <button 
          onClick={() => handleSubmit()}
          className={`flex items-center justify-center gap-4 px-12 py-6 rounded-[2.5rem] font-black transition-all transform active:scale-95 shadow-2xl ${saved ? 'bg-emerald-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/30'}`}
        >
          {saved ? <CheckCircle className="w-6 h-6" /> : <Save className="w-6 h-6" />}
          <span className="uppercase tracking-[0.3em] text-[10px]">{saved ? 'SALVO COM SUCESSO' : 'SALVAR ALTERAÇÕES'}</span>
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 bg-zinc-900/50 p-3 rounded-[2.5rem] border border-white/5 gap-3">
        {[
          { id: 'pricing', label: 'Planos Mensais', icon: DollarSign },
          { id: 'brand', label: 'Identidade', icon: Palette },
          { id: 'home', label: 'Banners', icon: Layout },
          { id: 'partner', label: 'Parceira', icon: Store },
          { id: 'footer', label: 'Rodapé', icon: MapPin },
          { id: 'checkout', label: 'Checkout', icon: Zap },
          { id: 'security', label: 'Segurança', icon: Lock }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex flex-col md:flex-row items-center justify-center gap-3 px-6 py-5 rounded-[1.8rem] text-[9px] font-black transition-all uppercase tracking-widest ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'text-zinc-600 hover:text-white hover:bg-zinc-800 border border-transparent hover:border-white/5'}`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-12">
        {activeTab === 'pricing' && (
          <div className="bg-zinc-900/40 p-12 rounded-[4rem] border border-white/5 space-y-12 shadow-2xl">
             <div className="flex items-center justify-between border-b border-white/5 pb-8">
                <div>
                   <h3 className="text-white font-black uppercase italic text-xl">Planos Mensais</h3>
                   <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mt-1">Gerencie as assinaturas disponíveis no site</p>
                </div>
                <button onClick={() => openPlanModal()} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-blue-600/20 active:scale-95">
                  <PlusCircle className="w-5 h-5" /> NOVO PLANO
                </button>
             </div>

             <div className="bg-zinc-950 p-8 rounded-[2.5rem] border border-white/5 space-y-6">
                <div className="flex items-center gap-3">
                   <Type className="w-5 h-5 text-blue-500" />
                   <h3 className="text-white font-black uppercase italic text-lg">Textos da Página de Planos</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <InputGroup label="Badge de Topo" value={config.monthlyPlansBadgeText} onChange={(v:string) => setConfig({...config, monthlyPlansBadgeText: v})} placeholder="Ex: ASSINATURAS" />
                   <InputGroup label="Título da Página" value={config.monthlyPlansTitle} onChange={(v:string) => setConfig({...config, monthlyPlansTitle: v})} placeholder="Ex: CATÁLOGO DE PLANOS" />
                   <div className="md:col-span-2">
                     <InputGroup label="Subtítulo Descritivo" value={config.monthlyPlansSubtitle} onChange={(v:string) => setConfig({...config, monthlyPlansSubtitle: v})} placeholder="Descreva seus planos aqui..." />
                   </div>
                </div>
             </div>

             <div className="bg-zinc-950 p-8 rounded-[2.5rem] border border-white/5 space-y-6">
                <div className="flex items-center gap-3">
                   <Package className="w-5 h-5 text-blue-500" />
                   <h3 className="text-white font-black uppercase italic text-lg">Rótulos de Estoque</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <InputGroup label="Label Primária" value={config.stockPrimaryLabel} onChange={(v:string) => setConfig({...config, stockPrimaryLabel: v})} placeholder="Ex: P" />
                   <InputGroup label="Label Secundária" value={config.stockSecondaryLabel} onChange={(v:string) => setConfig({...config, stockSecondaryLabel: v})} placeholder="Ex: S" />
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {(config.monthlyPlans || []).map(plan => (
                  <div key={plan.id} className="bg-zinc-950 p-8 rounded-[2.5rem] border border-white/5 flex flex-col group relative overflow-hidden">
                     {plan.imageUrl && (
                       <div className="absolute inset-0 z-0 opacity-20">
                         <img src={plan.imageUrl} className="w-full h-full object-cover blur-sm" alt="" />
                       </div>
                     )}
                     <div className="relative z-10">
                        <div className="flex items-center justify-between mb-6">
                            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                              {plan.icon === 'Zap' && <Zap className="w-6 h-6" />}
                              {plan.icon === 'Sparkles' && <Sparkles className="w-6 h-6" />}
                              {plan.icon === 'Gamepad2' && <Gamepad2 className="w-6 h-6" />}
                            </div>
                            {plan.featured && <Star className="w-5 h-5 text-amber-500 fill-amber-500" />}
                        </div>
                        <h4 className="text-lg font-black text-white uppercase italic tracking-tighter mb-1">{plan.name}</h4>
                        <p className="text-blue-500 font-black text-xl mb-4">R$ {plan.price}</p>
                        <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest line-clamp-2 mb-6">"{plan.description}"</p>
                        
                        <div className="mt-auto flex items-center gap-3 pt-6 border-t border-white/5">
                            <button onClick={() => openPlanModal(plan)} className="flex-1 py-3 bg-zinc-900 text-zinc-400 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all">Editar</button>
                            <button onClick={() => removePlan(plan.id)} className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
                        </div>
                     </div>
                  </div>
                ))}
                {(config.monthlyPlans || []).length === 0 && (
                   <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-[3rem]">
                      <Sparkles className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
                      <p className="text-zinc-600 font-black uppercase tracking-widest text-[10px]">Nenhum plano mensal configurado.</p>
                   </div>
                )}
             </div>
          </div>
        )}

        {activeTab === 'brand' && (
          <div className="bg-zinc-900/40 p-12 rounded-[4rem] border border-white/5 space-y-12 shadow-2xl">
             <div className="border-b border-white/5 pb-8">
                <h3 className="text-white font-black uppercase italic text-xl">Identidade Visual</h3>
                <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mt-1">Configurações de marca e logotipo</p>
             </div>
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <ImageUploadButton label="Logotipo Principal" value={config.logoImageUrl} aspect={16/5} onUpload={(e:any) => handleImageUploadRequest(e, 'logo', 16/5)} />
                <ImageUploadButton label="Logotipo Rodapé" value={config.footerLogoImageUrl} aspect={16/5} onUpload={(e:any) => handleImageUploadRequest(e, 'footerLogo', 16/5)} />
                <ImageUploadButton label="Favicon / Ícone" value={config.iconImageUrl} aspect={1/1} onUpload={(e:any) => handleImageUploadRequest(e, 'icon', 1/1)} />
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
                <InputGroup label="Nome do Site" value={config.siteName} onChange={(v:string) => setConfig({...config, siteName: v})} icon={Globe} />
                <InputGroup label="Texto do Logo (Se não houver imagem)" value={config.logoText} onChange={(v:string) => setConfig({...config, logoText: v})} icon={Type} />
                <div className="md:col-span-2">
                   <InputGroup label="Slogan / Subtítulo" value={config.siteSubtitle} onChange={(v:string) => setConfig({...config, siteSubtitle: v})} icon={Zap} />
                </div>
             </div>
          </div>
        )}

        {activeTab === 'partner' && (
           <div className="bg-zinc-900/40 p-12 rounded-[4rem] border border-white/5 space-y-12 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/5 pb-8">
                 <div>
                    <h3 className="text-white font-black uppercase italic text-xl">Loja Parceira (Mercado Livre)</h3>
                    <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mt-1">Configure o topo e os produtos físicos</p>
                 </div>
                 <button onClick={() => { setEditingPartnerProduct({ price: 0 }); setIsPartnerProductModalOpen(true); }} className="bg-amber-500 hover:bg-amber-600 text-black px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-amber-500/20 active:scale-95">
                   <PlusCircle className="w-5 h-5" /> NOVO PRODUTO
                 </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="md:col-span-2">
                    <ImageUploadButton label="Banner da Loja Parceira" value={config.partnerStoreBannerImageUrl} aspect={16/5} onUpload={(e:any) => handleImageUploadRequest(e, 'partnerBanner', 16/5)} />
                 </div>
                 <InputGroup label="Título do Header" value={config.partnerStoreTitle} onChange={(v:string) => setConfig({...config, partnerStoreTitle: v})} icon={Type} />
                 <InputGroup label="Texto da Badge" value={config.partnerStoreBadgeText} onChange={(v:string) => setConfig({...config, partnerStoreBadgeText: v})} icon={Zap} />
                 <div className="md:col-span-2">
                    <InputGroup label="Subtítulo Descritivo" value={config.partnerStoreSubtitle} onChange={(v:string) => setConfig({...config, partnerStoreSubtitle: v})} />
                 </div>
              </div>

              <div className="pt-8 border-t border-white/5">
                 <h4 className="text-sm font-black text-white uppercase tracking-widest mb-8">PRODUTOS VINCULADOS</h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {partnerGames.map(game => (
                       <div key={game.id} className="bg-zinc-950 p-6 rounded-[2rem] border border-white/5 flex items-center gap-6 group relative">
                          <div className="w-16 h-20 rounded-xl overflow-hidden shadow-lg border border-white/5 shrink-0">
                             <img src={game.imageUrl} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                             <p className="text-[11px] font-black text-white truncate uppercase italic tracking-tighter">{game.title}</p>
                             <p className="text-[10px] text-zinc-600 font-bold mt-1">R$ {game.price.toFixed(2)}</p>
                             <a href={game.externalUrl} target="_blank" className="text-[8px] text-blue-500 hover:underline mt-1 truncate block font-bold uppercase tracking-widest">Link ML <ExternalLink className="w-2 h-2 inline" /></a>
                          </div>
                          <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button onClick={() => { setEditingPartnerProduct(game); setIsPartnerProductModalOpen(true); }} className="p-2 text-zinc-500 hover:text-blue-500 transition-colors"><Edit2 className="w-4 h-4" /></button>
                             <button onClick={() => deletePartnerProduct(game.id)} className="p-2 text-zinc-700 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                          </div>
                       </div>
                    ))}
                    {partnerGames.length === 0 && (
                       <div className="col-span-full py-12 text-center border-2 border-dashed border-white/5 rounded-[2rem]">
                          <Store className="w-10 h-10 text-zinc-800 mx-auto mb-4" />
                          <p className="text-[10px] font-black text-zinc-700 uppercase tracking-widest italic">Nenhum produto físico cadastrado.</p>
                       </div>
                    )}
                 </div>
              </div>
           </div>
        )}

        {activeTab === 'footer' && (
          <div className="bg-zinc-900/40 p-12 rounded-[4rem] border border-white/5 space-y-12 shadow-2xl">
             <div className="border-b border-white/5 pb-8">
                <h3 className="text-white font-black uppercase italic text-xl">Rodapé e Contatos</h3>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="md:col-span-2 space-y-3">
                   <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] px-2 block">Descrição Institucional</label>
                   <textarea value={config.footerDescription} onChange={e => setConfig({...config, footerDescription: e.target.value})} className="w-full bg-zinc-900 border border-white/5 rounded-3xl px-8 py-6 text-white text-sm font-medium focus:ring-4 focus:ring-blue-600/5 outline-none min-h-[120px]" />
                </div>
                <InputGroup label="WhatsApp (Apenas Números)" value={config.contactPhone} onChange={(v:string) => setConfig({...config, contactPhone: v})} icon={Phone} />
                <InputGroup label="E-mail de Contato" value={config.contactEmail} onChange={(v:string) => setConfig({...config, contactEmail: v})} icon={Mail} />
                <InputGroup label="Endereço / Localidade" value={config.contactAddress} onChange={(v:string) => setConfig({...config, contactAddress: v})} icon={MapPin} />
                <InputGroup label="Instagram URL" value={config.instagramUrl} onChange={(v:string) => setConfig({...config, instagramUrl: v})} icon={Instagram} />
             </div>
          </div>
        )}

        {activeTab === 'checkout' && (
          <div className="bg-zinc-900/40 p-12 rounded-[4rem] border border-white/5 space-y-12 shadow-2xl">
             <div className="border-b border-white/5 pb-8">
                <h3 className="text-white font-black uppercase italic text-xl">Pagamento e Checkout</h3>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <InputGroup label="Chave PIX Oficial" value={config.pixKey} onChange={(v:string) => setConfig({...config, pixKey: v})} icon={Zap} />
                <div className="md:col-span-2 space-y-3">
                   <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] px-2 block">Nota de Checkout (WhatsApp)</label>
                   <textarea value={config.checkoutNote} onChange={e => setConfig({...config, checkoutNote: e.target.value})} className="w-full bg-zinc-900 border border-white/5 rounded-3xl px-8 py-6 text-white text-sm font-medium focus:ring-4 focus:ring-blue-600/5 outline-none min-h-[100px]" />
                </div>
             </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="bg-zinc-900/40 p-12 rounded-[4rem] border border-white/5 space-y-12 shadow-2xl">
             <div className="border-b border-white/5 pb-8">
                <h3 className="text-white font-black uppercase italic text-xl">Administradores</h3>
             </div>
             <div className="space-y-8">
                <div className="flex gap-4">
                   <div className="flex-1">
                      <InputGroup label="Novo E-mail Administrativo" value={newAdminEmail} onChange={setNewAdminEmail} icon={Mail} placeholder="email@exemplo.com" />
                   </div>
                   <button onClick={addAdmin} className="mt-7 px-10 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all outline-none">Adicionar</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {config.adminEmails.map(email => (
                      <div key={email} className="flex items-center justify-between p-6 bg-zinc-950 rounded-2xl border border-white/5 group">
                         <div className="flex items-center gap-4">
                            <Shield className="w-5 h-5 text-blue-500" />
                            <span className="text-sm font-bold text-white">{email}</span>
                         </div>
                         <button onClick={() => removeAdmin(email)} className="p-3 text-zinc-700 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 outline-none"><Trash2 className="w-4 h-4" /></button>
                      </div>
                   ))}
                </div>
             </div>
          </div>
        )}

        {activeTab === 'home' && (
          <div className="bg-zinc-900/40 p-12 rounded-[4rem] border border-white/5 space-y-12 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-8">
               <h3 className="text-white font-black uppercase italic text-xl">Gestão de Banners</h3>
               <button onClick={addHeroSlide} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 outline-none">
                 <Plus className="w-4 h-4" /> NOVO SLIDE
               </button>
            </div>
            <div className="grid grid-cols-1 gap-12">
               {(config.heroSlides || []).map((slide, index) => (
                 <div key={index} className="bg-zinc-950/50 p-10 rounded-[3rem] border border-white/5 relative group">
                    <button onClick={() => removeHeroSlide(index)} className="absolute -top-4 -right-4 bg-red-600 text-white p-4 rounded-full shadow-2xl opacity-0 group-hover:opacity-100 transition-all z-20 outline-none"><Trash2 className="w-5 h-5" /></button>
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                       <div className="lg:col-span-4"><ImageUploadButton label={`Slide ${index + 1}`} value={slide.imageUrl} aspect={16/9} onUpload={(e:any) => handleImageUploadRequest(e, index, 16/9)} /></div>
                       <div className="lg:col-span-8 space-y-8">
                          <InputGroup label="Título" value={slide.title} onChange={(v:string) => updateHeroSlide(index, { title: v })} />
                          <InputGroup label="Descrição" value={slide.subtitle} onChange={(v:string) => updateHeroSlide(index, { subtitle: v })} />
                       </div>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        )}
      </div>

      {/* MODAL DE PRODUTO PARCEIRO */}
      {isPartnerProductModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl animate-in fade-in duration-200">
           <div className="bg-zinc-950 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[3.5rem] border border-white/10 p-12 shadow-2xl animate-in zoom-in-95 duration-200 no-scrollbar">
              <div className="flex items-center justify-between mb-10">
                 <div>
                    <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1 block">Editor de Produto Físico</span>
                    <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">LOJA PARCEIRA</h2>
                 </div>
                 <button onClick={() => setIsPartnerProductModalOpen(false)} className="p-3 bg-zinc-900 text-zinc-500 rounded-2xl hover:text-white transition-all outline-none"><X className="w-6 h-6" /></button>
              </div>

              <form onSubmit={handleSavePartnerProduct} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                 <div className="lg:col-span-4">
                    <ImageUploadButton label="Imagem do Produto" value={editingPartnerProduct?.imageUrl} aspect={3/4} onUpload={(e:any) => handleImageUploadRequest(e, 'partnerProduct', 3/4)} />
                 </div>
                 <div className="lg:col-span-8 space-y-8">
                    <InputGroup label="Título do Produto" value={editingPartnerProduct?.title} onChange={(v:string) => setEditingPartnerProduct({...editingPartnerProduct, title: v})} />
                    <div className="grid grid-cols-2 gap-8">
                       <InputGroup label="Preço (R$)" type="number" value={editingPartnerProduct?.price} onChange={(v:string) => setEditingPartnerProduct({...editingPartnerProduct, price: parseFloat(v)})} icon={DollarSign} />
                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-2 block">Plataforma</label>
                          <select value={editingPartnerProduct?.platform || 'PS5'} onChange={e => setEditingPartnerProduct({...editingPartnerProduct, platform: e.target.value})} className="w-full bg-zinc-900 border border-white/5 rounded-2xl px-6 py-5 text-white font-bold outline-none focus:ring-4 focus:ring-blue-600/5 transition-all">
                             <option value="PS5">PS5</option>
                             <option value="PS4">PS4</option>
                             <option value="Xbox">Xbox</option>
                             <option value="Switch">Switch</option>
                             <option value="Acessório">Acessório</option>
                             <option value="Console">Console</option>
                          </select>
                       </div>
                    </div>
                    <InputGroup label="URL do Mercado Livre" value={editingPartnerProduct?.externalUrl} onChange={(v:string) => setEditingPartnerProduct({...editingPartnerProduct, externalUrl: v})} icon={ExternalLink} placeholder="https://mercadolivre.com.br/..." />
                    <button type="submit" className="w-full py-6 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-[0.3em] rounded-2xl transition-all shadow-xl shadow-blue-600/20 active:scale-95 outline-none">SALVAR PRODUTO</button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {/* MODAL DE PLANO MENSAL */}
      {isPlanModalOpen && editingPlan && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl animate-in fade-in duration-200">
           <div className="bg-zinc-950 w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-[3.5rem] border border-white/10 p-12 shadow-2xl animate-in zoom-in-95 duration-200 no-scrollbar">
              <div className="flex items-center justify-between mb-10">
                 <div>
                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1 block">Editor de Assinatura</span>
                    <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">PLANO MENSAL</h2>
                 </div>
                 <button onClick={() => setIsPlanModalOpen(false)} className="p-3 bg-zinc-900 text-zinc-500 rounded-2xl hover:text-white transition-all outline-none"><X className="w-6 h-6" /></button>
              </div>

              <form onSubmit={handleSavePlan} className="space-y-8">
                 <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                   <div className="lg:col-span-4">
                     <ImageUploadButton label="Imagem do Plano (Catálogo)" value={editingPlan.imageUrl} aspect={4/5} onUpload={(e:any) => handleImageUploadRequest(e, 'planImage', 4/5)} />
                   </div>
                   
                   <div className="lg:col-span-8 space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <InputGroup label="Nome do Plano" value={editingPlan.name} onChange={(v:string) => setEditingPlan({...editingPlan, name: v})} />
                        <InputGroup label="Preço (Texto)" value={editingPlan.price} onChange={(v:string) => setEditingPlan({...editingPlan, price: v})} placeholder="Ex: 49,90" />
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-2 block">Ícone</label>
                          <select value={editingPlan.icon} onChange={e => setEditingPlan({...editingPlan, icon: e.target.value})} className="w-full bg-zinc-900 border border-white/5 rounded-2xl px-6 py-5 text-white font-bold outline-none focus:ring-4 focus:ring-blue-600/5">
                              <option value="Gamepad2">Controle (Gamepad2)</option>
                              <option value="Zap">Raio (Zap)</option>
                              <option value="Sparkles">Estrelas (Sparkles)</option>
                          </select>
                        </div>
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-2 block">Destaque (Popular)</label>
                          <button type="button" onClick={() => setEditingPlan({...editingPlan, featured: !editingPlan.featured})} className={`w-full py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest border transition-all ${editingPlan.featured ? 'bg-amber-500/10 border-amber-500 text-amber-500' : 'bg-zinc-900 border-white/5 text-zinc-600'}`}>
                              {editingPlan.featured ? 'ESTÁ EM DESTAQUE' : 'SEM DESTAQUE'}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-2 block">DESCRIÇÃO DO PLANO (OBSERVAÇÃO)</label>
                        <textarea value={editingPlan.description} onChange={e => setEditingPlan({...editingPlan, description: e.target.value})} placeholder="Ex: Ideal para quem joga casualmente e quer economizar." className="w-full bg-zinc-900 border border-white/5 rounded-2xl px-8 py-6 text-white text-sm font-medium focus:ring-4 focus:ring-blue-600/5 outline-none min-h-[100px]" />
                      </div>
                   </div>
                 </div>

                 <div className="space-y-6">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-2 block">Vantagens (Features)</label>
                    <div className="flex gap-4">
                       <input type="text" value={newFeature} onChange={e => setNewFeature(e.target.value)} className="flex-1 bg-zinc-900 border border-white/5 rounded-2xl px-6 py-4 text-white text-sm font-bold" placeholder="Digite uma vantagem..." />
                       <button type="button" onClick={() => { if(newFeature) { setEditingPlan({...editingPlan, features: [...(editingPlan.features || []), newFeature]}); setNewFeature(''); } }} className="bg-blue-600 text-white px-8 rounded-2xl font-black uppercase text-[10px] tracking-widest"><Plus className="w-5 h-5" /></button>
                    </div>
                    <div className="space-y-2">
                       {(editingPlan.features || []).map((feat, i) => (
                          <div key={i} className="flex items-center justify-between bg-zinc-950 p-4 rounded-xl border border-white/5">
                             <span className="text-xs font-bold text-zinc-300">{feat}</span>
                             <button type="button" onClick={() => setEditingPlan({...editingPlan, features: (editingPlan.features || []).filter((_, idx) => idx !== i)})} className="text-zinc-700 hover:text-red-500 transition-colors"><X className="w-4 h-4" /></button>
                          </div>
                       ))}
                    </div>
                 </div>

                 <button type="submit" className="w-full py-6 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-[0.3em] rounded-2xl transition-all shadow-xl active:scale-95">SALVAR PLANO</button>
              </form>
           </div>
        </div>
      )}

      {/* MODAL DE ALERTA */}
      {alertMsg && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-200">
           <div className="bg-zinc-950 w-full max-w-md rounded-[3rem] border border-white/10 p-10 text-center shadow-2xl animate-in zoom-in-95 duration-200">
              <ShieldAlert className="w-12 h-12 text-amber-500 mx-auto mb-6" />
              <h2 className="text-2xl font-black text-white uppercase italic mb-4">Atenção</h2>
              <p className="text-zinc-500 text-xs font-bold uppercase mb-10">{alertMsg}</p>
              <button onClick={() => setAlertMsg(null)} className="w-full py-5 rounded-2xl bg-blue-600 text-white font-black uppercase text-[10px] tracking-widest outline-none">OK</button>
           </div>
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO */}
      {confirmModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-200">
           <div className="bg-zinc-950 w-full max-w-md rounded-[3rem] border border-white/10 p-10 text-center shadow-2xl animate-in zoom-in-95 duration-200">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-6" />
              <h2 className="text-2xl font-black text-white uppercase italic mb-4">Confirmar</h2>
              <p className="text-zinc-500 text-xs font-bold uppercase mb-10">{confirmModal.msg}</p>
              <div className="flex gap-4">
                 <button onClick={() => setConfirmModal(null)} className="flex-1 py-5 rounded-2xl bg-zinc-900 text-zinc-500 font-black uppercase text-[10px] outline-none">Não</button>
                 <button onClick={confirmModal.onConfirm} className="flex-1 py-5 rounded-2xl bg-red-600 text-white font-black uppercase text-[10px] outline-none">Sim, Continuar</button>
              </div>
           </div>
        </div>
      )}

      {resizerData && (
        <ImageResizerModal 
          image={resizerData.image}
          aspect={resizerData.aspect}
          onConfirm={(cropped) => {
            if (typeof resizerData.slideIndex === 'number') {
              updateHeroSlide(resizerData.slideIndex, { imageUrl: cropped });
            } else if (resizerData.slideIndex === 'logo') {
              setConfig({ ...config, logoImageUrl: cropped });
            } else if (resizerData.slideIndex === 'footerLogo') {
              setConfig({ ...config, footerLogoImageUrl: cropped });
            } else if (resizerData.slideIndex === 'icon') {
              setConfig({ ...config, iconImageUrl: cropped });
            } else if (resizerData.slideIndex === 'partnerBanner') {
              setConfig({ ...config, partnerStoreBannerImageUrl: cropped });
            } else if (resizerData.slideIndex === 'partnerProduct') {
              setEditingPartnerProduct(prev => ({ ...prev, imageUrl: cropped }));
            } else if (resizerData.slideIndex === 'planImage') {
              setEditingPlan(prev => ({ ...prev, imageUrl: cropped }));
            }
            setResizerData(null);
          }}
          onCancel={() => setResizerData(null)}
        />
      )}
    </div>
  );
};

export default ConfigManager;