
export type Platform = string;

export type GameStatus = 'Disponível' | 'Alugado' | 'Indisponível';

export interface Category {
  id: string;
  name: string;
}

export interface GamePlatform {
  id: string;
  name: string;
}

export interface StorePlatform {
  id: string;
  label: string;
  iconName: string;
}

export interface HeroSlide {
  title: string;
  subtitle: string;
  imageUrl: string;
}

export interface MonthlyPlan {
  id: string;
  name: string;
  price: string;
  description: string;
  imageUrl?: string;
  features: string[];
  icon: string;
  featured: boolean;
}

export interface Game {
  id: string;
  title: string;
  description: string;
  platform: Platform;
  category: string;
  status: GameStatus;
  stockPrimary: number;
  stockSecondary: number;
  minStockPrimary: number;
  minStockSecondary: number;
  // Novos campos para o Sistema de Retrocompatibilidade
  ps5Compatible?: boolean;
  stockPrimaryPS5?: number;
  stockSecondaryPS5?: number;
  
  isFeatured: boolean;
  isNew: boolean;
  mostRented: boolean;
  price: number;
  // Preços individuais por tipo de conta
  pricePrimary?: number;
  priceSecondary?: number;
  
  // Tabela de preços customizada por jogo (Dias -> Preço)
  customPriceTable?: {
    Primária?: Record<number, number>;
    Secundária?: Record<number, number>;
  };
  
  imageUrl: string;
  images: string[];
  rating: string;
  releaseDate: string;
  externalUrl?: string;
}

export interface User {
  email: string;
  isAdmin: boolean;
}

export interface DashboardStats {
  totalGames: number;
  availableGames: number;
  rentedGames: number;
  featuredGames: number;
}

export interface SiteConfig {
  siteName: string;
  siteSubtitle: string;
  logoText: string;
  logoImageUrl: string;
  footerLogoImageUrl: string;
  iconImageUrl: string;
  stockPrimaryLabel: string;
  stockSecondaryLabel: string;
  heroSlides: HeroSlide[];
  featuredTitle: string;
  newReleasesTitle: string;
  categoriesTitle: string;
  bannerTitle: string;
  bannerSubtitle: string;
  bannerImageUrl: string;
  bannerButtonText: string;
  bannerButtonUrl: string;
  footerDescription: string;
  contactPhone: string;
  contactEmail: string;
  contactAddress: string;
  instagramUrl: string;
  instagramIconUrl: string;
  whatsappIconUrl: string;
  checkoutNote: string;
  pixKey: string;
  adminEmails: string[];
  priceTable: {
    Primária: Record<number, number>;
    Secundária: Record<number, number>;
  };
  partnerStoreTitle: string;
  partnerStoreSubtitle: string;
  partnerStoreBadgeText: string;
  partnerStoreBannerImageUrl: string;
  monthlyPlans: MonthlyPlan[];
  monthlyPlansTitle: string;
  monthlyPlansSubtitle: string;
  monthlyPlansBadgeText: string;
}

export interface CartItem {
  gameId: string;
  title: string;
  type: 'Primária' | 'Secundária';
  days: number;
  selected?: boolean;
  console?: 'PS4' | 'PS5'; // Novo campo no carrinho
}

export interface OrderItem {
  title: string;
  type: string;
  days: number;
  price: number;
  console?: string;
}

export interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  items: OrderItem[];
  total: number;
  status: 'Pendente' | 'Aprovado' | 'Cancelado';
  created_at: string;
}
