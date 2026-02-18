import { Game, Category, DashboardStats, SiteConfig, StorePlatform, Order, GamePlatform } from './types';
import { INITIAL_GAMES, INITIAL_CATEGORIES, PRICE_TABLE, ADMIN_EMAIL } from './constants';
import { supabase } from './lib/supabase';

// Export supabase to be used by other components (fixes error in App.tsx)
export { supabase };

// Cache local para manter performance síncrona onde necessário
let cachedGames: Game[] = [];
let cachedConfig: SiteConfig | null = null;

export const fetchAllData = async () => {
  try {
    const [gamesRes, configRes] = await Promise.all([
      supabase.from('games').select('*').order('created_at', { ascending: false }),
      supabase.from('site_config').select('*').single()
    ]);

    if (gamesRes.data) cachedGames = gamesRes.data;
    if (configRes.data) cachedConfig = configRes.data.config_data;
  } catch (error) {
    console.error('Erro ao carregar dados do Supabase:', error);
  }
};

export const getGames = (): Game[] => {
  // Retorna cache se disponível, senão retorna iniciais enquanto carrega
  return cachedGames.length > 0 ? cachedGames : INITIAL_GAMES;
};

export const saveGames = async (games: Game[]) => {
  cachedGames = games;
  const { error } = await supabase.from('games').upsert(games);
  if (error) console.error('Erro ao salvar games:', error);
};

export const getCategories = (): Category[] => {
  const stored = localStorage.getItem('gamerent_categories_v3');
  return stored ? JSON.parse(stored) : INITIAL_CATEGORIES;
};

export const saveCategories = async (categories: Category[]) => {
  localStorage.setItem('gamerent_categories_v3', JSON.stringify(categories));
  // Sincronizar com Supabase se necessário
  await supabase.from('categories').upsert(categories);
};

export const getSiteConfig = (): SiteConfig => {
  if (cachedConfig) return cachedConfig;
  const stored = localStorage.getItem('gamerent_config_v4');
  return stored ? JSON.parse(stored) : DEFAULT_CONFIG;
};

export const saveSiteConfig = async (config: SiteConfig) => {
  cachedConfig = config;
  localStorage.setItem('gamerent_config_v4', JSON.stringify(config));
  await supabase.from('site_config').upsert({ id: 1, config_data: config });
};

export const createOrder = async (orderData: Partial<Order>) => {
  const { data, error } = await supabase
    .from('orders')
    .insert([{ ...orderData, created_at: new Date().toISOString() }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getOrders = async (): Promise<Order[]> => {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) return [];
  return data || [];
};

export const updateOrderStatus = async (orderId: string, status: Order['status']) => {
  await supabase.from('orders').update({ status }).eq('id', orderId);
};

// Fixed: Added missing deleteOrder function (fixes error in OrdersManager.tsx)
export const deleteOrder = async (id: string) => {
  const { error } = await supabase.from('orders').delete().eq('id', id);
  if (error) console.error('Erro ao excluir pedido:', error);
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
  const { error } = await supabase.from('games').upsert(game);
  if (!error) {
    cachedGames = cachedGames.some(g => g.id === game.id)
      ? cachedGames.map(g => g.id === game.id ? game : g)
      : [game, ...cachedGames];
  }
};

export const deleteGame = async (id: string) => {
  await supabase.from('games').delete().eq('id', id);
  cachedGames = cachedGames.filter(g => g.id !== id);
};

export const getGamePlatforms = (): GamePlatform[] => {
  const stored = localStorage.getItem('gamerent_game_platforms_v1');
  return stored ? JSON.parse(stored) : [
    { id: 'PS4', name: 'PS4' },
    { id: 'PS5', name: 'PS5' }
  ];
};

// Fixed: Added missing saveGamePlatforms function (fixes error in GamePlatformsManager.tsx)
export const saveGamePlatforms = async (platforms: GamePlatform[]) => {
  localStorage.setItem('gamerent_game_platforms_v1', JSON.stringify(platforms));
};

export const getStorePlatforms = (): StorePlatform[] => {
  const stored = localStorage.getItem('gamerent_platforms_v3');
  return stored ? JSON.parse(stored) : [
    { id: 'all', label: 'TODOS', iconName: 'Layers' },
    { id: 'PS4', label: 'PS4', iconName: 'Gamepad' },
    { id: 'PS5', label: 'PS5', iconName: 'Gamepad2' }
  ];
};

// Fixed: Added missing saveStorePlatforms function (fixes error in PlatformsManager.tsx)
export const saveStorePlatforms = async (platforms: StorePlatform[]) => {
  localStorage.setItem('gamerent_platforms_v3', JSON.stringify(platforms));
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
