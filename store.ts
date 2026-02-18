
import { Game, Category, DashboardStats, SiteConfig, StorePlatform, Order, GamePlatform } from './types';
import { INITIAL_GAMES, INITIAL_CATEGORIES, PRICE_TABLE, ADMIN_EMAIL } from './constants';

// Chaves do LocalStorage
const KEYS = {
  GAMES: 'troia_games_data_v1',
  CONFIG: 'troia_config_data_v1',
  ORDERS: 'troia_orders_data_v1',
  CATEGORIES: 'troia_categories_data_v1',
  GAME_PLATFORMS: 'troia_game_platforms_data_v1',
  STORE_PLATFORMS: 'troia_store_platforms_data_v1'
};

// Cache em memória
let cachedGames: Game[] = [];
let cachedConfig: SiteConfig | null = null;

export const fetchAllData = async () => {
  // Simula carregamento
  const storedGames = localStorage.getItem(KEYS.GAMES);
  const storedConfig = localStorage.getItem(KEYS.CONFIG);

  cachedGames = storedGames ? JSON.parse(storedGames) : INITIAL_GAMES;
  cachedConfig = storedConfig ? JSON.parse(storedConfig) : DEFAULT_CONFIG;
  
  if (!storedGames) localStorage.setItem(KEYS.GAMES, JSON.stringify(INITIAL_GAMES));
  if (!storedConfig) localStorage.setItem(KEYS.CONFIG, JSON.stringify(DEFAULT_CONFIG));
};

export const getGames = (): Game[] => {
  if (cachedGames.length > 0) return cachedGames;
  const stored = localStorage.getItem(KEYS.GAMES);
  return stored ? JSON.parse(stored) : INITIAL_GAMES;
};

export const saveGames = async (games: Game[]) => {
  cachedGames = games;
  localStorage.setItem(KEYS.GAMES, JSON.stringify(games));
};

export const getCategories = (): Category[] => {
  const stored = localStorage.getItem(KEYS.CATEGORIES);
  return stored ? JSON.parse(stored) : INITIAL_CATEGORIES;
};

export const saveCategories = async (categories: Category[]) => {
  localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(categories));
};

export const getSiteConfig = (): SiteConfig => {
  if (cachedConfig) return cachedConfig;
  const stored = localStorage.getItem(KEYS.CONFIG);
  return stored ? JSON.parse(stored) : DEFAULT_CONFIG;
};

export const saveSiteConfig = async (config: SiteConfig) => {
  cachedConfig = config;
  localStorage.setItem(KEYS.CONFIG, JSON.stringify(config));
};

export const createOrder = async (orderData: Partial<Order>) => {
  const orders = await getOrders();
  const newOrder = {
    ...orderData,
    id: `ORD-${Date.now()}`,
    created_at: new Date().toISOString(),
    status: orderData.status || 'Pendente'
  } as Order;
  
  const updatedOrders = [newOrder, ...orders];
  localStorage.setItem(KEYS.ORDERS, JSON.stringify(updatedOrders));
  return newOrder;
};

export const getOrders = async (): Promise<Order[]> => {
  const stored = localStorage.getItem(KEYS.ORDERS);
  return stored ? JSON.parse(stored) : [];
};

export const updateOrderStatus = async (orderId: string, status: Order['status']) => {
  const orders = await getOrders();
  const updated = orders.map(o => o.id === orderId ? { ...o, status } : o);
  localStorage.setItem(KEYS.ORDERS, JSON.stringify(updated));
};

export const deleteOrder = async (id: string) => {
  const orders = await getOrders();
  const updated = orders.filter(o => o.id !== id);
  localStorage.setItem(KEYS.ORDERS, JSON.stringify(updated));
};

export const getStats = (): DashboardStats => {
  const games = getGames();
  return {
    totalGames: games.length,
    availableGames: games.filter(g => g.status === 'Disponível').length,
    rentedGames: games.filter(g => g.status === 'Alugado').length,
    featuredGames: games.filter(g => g.isFeatured).length,
  };
};

export const updateGame = async (game: Game) => {
  const games = getGames();
  const index = games.findIndex(g => g.id === game.id);
  let updatedGames;
  
  if (index >= 0) {
    updatedGames = games.map(g => g.id === game.id ? game : g);
  } else {
    updatedGames = [game, ...games];
  }
  
  cachedGames = updatedGames;
  localStorage.setItem(KEYS.GAMES, JSON.stringify(updatedGames));
};

export const deleteGame = async (id: string) => {
  const games = getGames();
  const updated = games.filter(g => g.id !== id);
  cachedGames = updated;
  localStorage.setItem(KEYS.GAMES, JSON.stringify(updated));
};

export const getGamePlatforms = (): GamePlatform[] => {
  const stored = localStorage.getItem(KEYS.GAME_PLATFORMS);
  return stored ? JSON.parse(stored) : [
    { id: 'PS4', name: 'PS4' },
    { id: 'PS5', name: 'PS5' }
  ];
};

export const saveGamePlatforms = async (platforms: GamePlatform[]) => {
  localStorage.setItem(KEYS.GAME_PLATFORMS, JSON.stringify(platforms));
};

export const getStorePlatforms = (): StorePlatform[] => {
  const stored = localStorage.getItem(KEYS.STORE_PLATFORMS);
  return stored ? JSON.parse(stored) : [
    { id: 'all', label: 'TODOS', iconName: 'Layers' },
    { id: 'PS4', label: 'PS4', iconName: 'Gamepad' },
    { id: 'PS5', label: 'PS5', iconName: 'Gamepad2' }
  ];
};

export const saveStorePlatforms = async (platforms: StorePlatform[]) => {
  localStorage.setItem(KEYS.STORE_PLATFORMS, JSON.stringify(platforms));
};

const DEFAULT_CONFIG: SiteConfig = {
  siteName: 'Troia Games',
  siteSubtitle: 'A Revolução no Aluguel de Games',
  logoText: 'TROIA GAMES',
  logoImageUrl: '', 
  footerLogoImageUrl: '', 
  iconImageUrl: '', 
  stockPrimaryLabel: 'P',
  stockSecondaryLabel: 'S',
  heroSlides: [],
  featuredTitle: 'JOGOS EM DESTAQUE',
  newReleasesTitle: 'ÚLTIMOS LANÇAMENTOS',
  categoriesTitle: 'EXPLORE POR CATEGORIA',
  bannerTitle: 'JOGUE SEM LIMITES AGORA!',
  bannerSubtitle: 'Acesso completo, suporte 24h e a maior biblioteca digital do Brasil.',
  bannerImageUrl: '',
  bannerButtonText: 'FALAR COM ATENDENTE',
  bannerButtonUrl: '',
  footerDescription: 'Sua plataforma definitiva para locação de mídia digital.',
  contactPhone: '5522999566934',
  contactEmail: 'contato@troiagames.com',
  contactAddress: 'Atendimento Online Global',
  instagramUrl: '',
  instagramIconUrl: '',
  whatsappIconUrl: '',
  checkoutNote: 'O acesso será enviado via WhatsApp após a confirmação do pagamento.',
  pixKey: 'geovannetv@gmail.com',
  adminEmails: [ADMIN_EMAIL],
  priceTable: PRICE_TABLE,
  partnerStoreTitle: 'LOJA PARCEIRA',
  partnerStoreSubtitle: '',
  partnerStoreBadgeText: 'Parceiro',
  partnerStoreBannerImageUrl: '',
  monthlyPlans: [],
  monthlyPlansTitle: 'PLANOS',
  monthlyPlansSubtitle: '',
  monthlyPlansBadgeText: 'ASSINATURAS'
};
