
import { Game, Category, DashboardStats, SiteConfig, StorePlatform, Order, GamePlatform, MonthlyPlan } from './types';
import { INITIAL_GAMES, INITIAL_CATEGORIES, PRICE_TABLE, ADMIN_EMAIL } from './constants';

const GAMES_KEY = 'gamerent_games_v3';
const CATEGORIES_KEY = 'gamerent_categories_v3';
const GAME_PLATFORMS_KEY = 'gamerent_game_platforms_v1';
const CONFIG_KEY = 'gamerent_config_v4'; 
const PLATFORMS_KEY = 'gamerent_platforms_v3';
const ORDERS_KEY = 'gamerent_orders_v1';
const SYNC_QUEUE_KEY = 'gamerent_sync_queue';

// IndexedDB Helper
const DB_NAME = 'TroiaGamesDB';
const DB_VERSION = 1;

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('data')) db.createObjectStore('data');
      if (!db.objectStoreNames.contains('syncQueue')) db.createObjectStore('syncQueue', { autoIncrement: true });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const getDBItem = async (key: string): Promise<any> => {
  const db = await openDB();
  return new Promise((resolve) => {
    const transaction = db.transaction('data', 'readonly');
    const store = transaction.objectStore('data');
    const request = store.get(key);
    request.onsuccess = () => resolve(request.result);
  });
};

const setDBItem = async (key: string, value: any): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve) => {
    const transaction = db.transaction('data', 'readwrite');
    const store = transaction.objectStore('data');
    store.put(value, key);
    transaction.oncomplete = () => resolve();
  });
};

const addToSyncQueue = async (action: string, data: any): Promise<void> => {
  const db = await openDB();
  const transaction = db.transaction('syncQueue', 'readwrite');
  const store = transaction.objectStore('syncQueue');
  store.add({ action, data, timestamp: Date.now() });
};

// Sincronização automática ao voltar online
export const syncOfflineData = async () => {
  if (!navigator.onLine) return;
  
  const db = await openDB();
  const transaction = db.transaction('syncQueue', 'readwrite');
  const store = transaction.objectStore('syncQueue');
  const request = store.getAll();

  request.onsuccess = async () => {
    const items = request.result;
    if (items.length === 0) return;

    console.log(`Sincronizando ${items.length} ações pendentes...`);
    
    for (const item of items) {
      try {
        // Simulação de chamada real ao backend
        // const res = await fetch(`http://localhost:3001/api/sync`, { method: 'POST', body: JSON.stringify(item) });
        // if (res.ok) ...
        console.log('Sincronizado:', item.action);
      } catch (err) {
        console.error('Erro ao sincronizar item:', err);
      }
    }
    
    // Limpa a fila após tentativa de sincronização (ou sucesso dependendo da lógica)
    const clearTrans = db.transaction('syncQueue', 'readwrite');
    clearTrans.objectStore('syncQueue').clear();
  };
};

window.addEventListener('online', syncOfflineData);

const DEFAULT_CONFIG: SiteConfig = {
  siteName: 'Troia Games',
  siteSubtitle: 'A Revolução no Aluguel de Games',
  logoText: 'TROIA GAMES',
  logoImageUrl: '', 
  footerLogoImageUrl: '', 
  iconImageUrl: '', 
  stockPrimaryLabel: 'P',
  stockSecondaryLabel: 'S',
  heroSlides: [
    {
      title: 'ALUGUE OS MELHORES JOGOS DO MUNDO',
      subtitle: 'Entrega digital imediata via WhatsApp. Jogue hoje mesmo os maiores lançamentos do PS5, Xbox e PC.',
      imageUrl: 'https://images.unsplash.com/photo-1550745679-33d599292350?auto=format&fit=crop&q=80&w=1600'
    },
    {
      title: 'LANÇAMENTOS 2025',
      subtitle: 'Os títulos mais aguardados do ano já estão disponíveis para reserva imediata.',
      imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=1600'
    }
  ],
  featuredTitle: 'JOGOS EM DESTAQUE',
  newReleasesTitle: 'ÚLTIMOS LANÇAMENTOS',
  categoriesTitle: 'EXPLORE POR CATEGORIA',
  bannerTitle: 'JOGUE SEM LIMITES AGORA!',
  bannerSubtitle: 'Acesso completo, suporte 24h e a maior biblioteca digital do Brasil.',
  bannerImageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1600',
  bannerButtonText: 'FALAR COM ATENDENTE',
  bannerButtonUrl: 'https://wa.me/5522999566934',
  footerDescription: 'Sua plataforma definitiva para locação de mídia digital. Segurança, rapidez e os melhores preços do mercado brasileiro.',
  contactPhone: '5522999566934',
  contactEmail: 'testetroia2',
  contactAddress: 'Atendimento Online Global',
  instagramUrl: 'https://instagram.com/troiagames',
  instagramIconUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg',
  whatsappIconUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg',
  checkoutNote: 'O acesso será enviado via WhatsApp após a confirmação do pagamento.',
  pixKey: 'geovannetv@gmail.com',
  adminEmails: [ADMIN_EMAIL],
  priceTable: PRICE_TABLE,
  partnerStoreTitle: 'COMPRE SEUS JOGOS FÍSICOS NO MERCADO LIVRE',
  partnerStoreSubtitle: 'Confira nosso acervo de produtos físicos e consoles disponíveis para entrega imediata em nossa loja oficial no Mercado Livre.',
  partnerStoreBadgeText: 'Loja Oficial Parceira',
  partnerStoreBannerImageUrl: '',
  monthlyPlans: [
    {
      id: 'plan_1',
      name: 'Starter Gamer',
      price: '49,90',
      description: 'Ideal para quem joga casualmente e quer economizar.',
      features: [
        'Acesso a 1 jogo simultâneo',
        'Troca grátis a cada 15 dias',
        'Suporte via WhatsApp em horário comercial',
        'Contas Secundárias ilimitadas',
        'Sem fidelidade, cancele quando quiser'
      ],
      icon: 'Gamepad2',
      featured: false
    },
    {
      id: 'plan_2',
      name: 'Pro Player',
      price: '89,90',
      description: 'O plano mais assinado. Ideal para gamers frequentes.',
      features: [
        'Acesso a 2 jogos simultâneos',
        'Trocas ilimitadas',
        'Suporte prioritário 24/7',
        'Acesso a Lançamentos no dia 1',
        'Contas Primárias inclusas',
        'Descontos exclusivos na loja parceira'
      ],
      icon: 'Zap',
      featured: true
    },
    {
      id: 'plan_3',
      name: 'Elite Troia',
      price: '149,90',
      description: 'Experiência suprema para quem não abre mão de nada.',
      features: [
        'Acesso a 4 jogos simultâneos',
        'Fila zero para novos títulos',
        'Suporte VIP via Gerente de Conta',
        'Sorteios mensais de Gift Cards',
        'Acesso antecipado a Betas e Demos',
        'Cashback em todas as locações avulsas'
      ],
      icon: 'Sparkles',
      featured: false
    }
  ],
  monthlyPlansTitle: 'CATÁLOGO DE PLANOS',
  monthlyPlansSubtitle: 'Explore nossas modalidades de assinatura e escolha o acesso que melhor se adapta ao seu perfil gamer.',
  monthlyPlansBadgeText: 'ASSINATURAS'
};

const INITIAL_PLATFORMS: StorePlatform[] = [
  { id: 'all', label: 'TODOS', iconName: 'Layers' },
  { id: 'PS4', label: 'PS4', iconName: 'Gamepad' },
  { id: 'PS5', label: 'PS5', iconName: 'Gamepad2' },
  { id: 'Xbox One', label: 'XBOX ONE', iconName: 'Joystick' },
  { id: 'Xbox Series', label: 'XBOX SERIES', iconName: 'Joystick' },
  { id: 'Nintendo Switch', label: 'SWITCH', iconName: 'Smartphone' },
  { id: 'PC', label: 'PC DIGITAL', iconName: 'Monitor' },
];

const INITIAL_GAME_PLATFORMS: GamePlatform[] = [
  { id: 'PS4', name: 'PS4' },
  { id: 'PS5', name: 'PS5' },
  { id: 'Xbox One', name: 'Xbox One' },
  { id: 'Xbox Series', name: 'Xbox Series' },
  { id: 'Nintendo Switch', name: 'Nintendo Switch' },
  { id: 'PC', name: 'PC' },
];

// Carregamento Híbrido (IndexedDB > LocalStorage > Initial)
export const getGames = (): Game[] => {
  const stored = localStorage.getItem(GAMES_KEY);
  if (stored === null) {
    localStorage.setItem(GAMES_KEY, JSON.stringify(INITIAL_GAMES));
    setDBItem(GAMES_KEY, INITIAL_GAMES);
    return INITIAL_GAMES;
  }
  return JSON.parse(stored);
};

export const saveGames = async (games: Game[]) => {
  localStorage.setItem(GAMES_KEY, JSON.stringify(games));
  await setDBItem(GAMES_KEY, games);
  if (!navigator.onLine) await addToSyncQueue('SAVE_GAMES', games);
};

export const getCategories = (): Category[] => {
  const stored = localStorage.getItem(CATEGORIES_KEY);
  if (!stored) {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(INITIAL_CATEGORIES));
    return INITIAL_CATEGORIES;
  }
  return JSON.parse(stored);
};

export const saveCategories = async (categories: Category[]) => {
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
  await setDBItem(CATEGORIES_KEY, categories);
  if (!navigator.onLine) await addToSyncQueue('SAVE_CATEGORIES', categories);
};

export const getGamePlatforms = (): GamePlatform[] => {
  const stored = localStorage.getItem(GAME_PLATFORMS_KEY);
  if (!stored) return INITIAL_GAME_PLATFORMS;
  return JSON.parse(stored);
};

export const saveGamePlatforms = async (platforms: GamePlatform[]) => {
  localStorage.setItem(GAME_PLATFORMS_KEY, JSON.stringify(platforms));
  await setDBItem(GAME_PLATFORMS_KEY, platforms);
};

export const getStorePlatforms = (): StorePlatform[] => {
  const stored = localStorage.getItem(PLATFORMS_KEY);
  if (!stored) return INITIAL_PLATFORMS;
  return JSON.parse(stored);
};

export const saveStorePlatforms = async (platforms: StorePlatform[]) => {
  localStorage.setItem(PLATFORMS_KEY, JSON.stringify(platforms));
  await setDBItem(PLATFORMS_KEY, platforms);
};

export const getSiteConfig = (): SiteConfig => {
  const stored = localStorage.getItem(CONFIG_KEY);
  if (!stored) return DEFAULT_CONFIG;
  return { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
};

export const saveSiteConfig = async (config: SiteConfig) => {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  await setDBItem(CONFIG_KEY, config);
  if (!navigator.onLine) await addToSyncQueue('SAVE_CONFIG', config);
};

export const getOrders = (): Order[] => {
  const stored = localStorage.getItem(ORDERS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const createOrder = async (orderData: Partial<Order>) => {
  const orders = getOrders();
  const newOrder: Order = {
    id: `ORD-${Date.now()}`,
    customer_name: orderData.customer_name || 'Visitante',
    customer_email: orderData.customer_email || 'anonimo@email.com',
    customer_phone: orderData.customer_phone || '',
    items: orderData.items || [],
    total: orderData.total || 0,
    status: 'Pendente',
    created_at: new Date().toISOString(),
    ...orderData
  } as Order;
  
  const updatedOrders = [newOrder, ...orders];
  localStorage.setItem(ORDERS_KEY, JSON.stringify(updatedOrders));
  await setDBItem(ORDERS_KEY, updatedOrders);
  
  if (!navigator.onLine) await addToSyncQueue('CREATE_ORDER', newOrder);
  return newOrder;
};

export const updateOrderStatus = async (orderId: string, status: Order['status']) => {
  const orders = getOrders();
  const index = orders.findIndex(o => o.id === orderId);
  if (index !== -1) {
    orders[index].status = status;
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    await setDBItem(ORDERS_KEY, orders);
    if (!navigator.onLine) await addToSyncQueue('UPDATE_ORDER_STATUS', { orderId, status });
  }
};

export const deleteOrder = async (orderId: string) => {
  const orders = getOrders();
  const updated = orders.filter(o => o.id !== orderId);
  localStorage.setItem(ORDERS_KEY, JSON.stringify(updated));
  await setDBItem(ORDERS_KEY, updated);
};

export const getStats = (): DashboardStats => {
  const games = getGames();
  return {
    totalGames: games.length,
    availableGames: games.filter(g => g.status === 'Disponível' && (g.stockPrimary > 0 || g.stockSecondary > 0)).length,
    rentedGames: games.filter(g => g.status === 'Alugado' || (g.stockPrimary === 0 && g.stockSecondary === 0)).length,
    featuredGames: games.filter(g => g.isFeatured).length,
  };
};

export const updateGame = async (game: Game) => {
  const games = getGames();
  const updatedGames = games.some(g => g.id === game.id)
    ? games.map(g => (g.id === game.id ? game : g))
    : [...games, game];

  await saveGames(updatedGames);
};

export const deleteGame = async (id: string) => {
  const games = getGames();
  const filteredGames = games.filter(g => String(g.id) !== String(id));
  await saveGames(filteredGames);
};
