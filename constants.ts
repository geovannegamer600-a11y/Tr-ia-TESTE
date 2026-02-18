import { Game, Category } from './types';

export const INITIAL_CATEGORIES: Category[] = [
  { id: '1', name: 'Ação e Aventura' },
  { id: '2', name: 'RPG' },
  { id: '3', name: 'Esportes' },
  { id: '4', name: 'FPS' },
  { id: '5', name: 'Estratégia' },
  { id: '6', name: 'Terror' },
  { id: '7', name: 'Corrida' },
];

export const INITIAL_GAMES: Game[] = [
  {
    id: '1',
    title: 'Call of Duty: Black Ops 7',
    description: 'A mais nova e intensa experiência de combate da franquia Call of Duty.',
    platform: 'PS5',
    category: 'FPS',
    status: 'Disponível',
    stockPrimary: 5,
    stockSecondary: 10,
    minStockPrimary: 2,
    minStockSecondary: 3,
    isFeatured: true,
    isNew: true,
    mostRented: true,
    price: 45.00,
    imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800',
    images: [],
    rating: '18',
    releaseDate: '2024-10-25'
  },
  {
    id: '2',
    title: 'Elden Ring: Shadow of the Erdtree',
    description: 'Explore o Reino das Sombras, uma terra obscurecida pela Térvore onde Miquella, o Gentil, espera.',
    platform: 'PS5',
    category: 'RPG',
    status: 'Disponível',
    stockPrimary: 2,
    stockSecondary: 4,
    minStockPrimary: 1,
    minStockSecondary: 2,
    isFeatured: true,
    isNew: true,
    mostRented: true,
    price: 49.90,
    imageUrl: 'https://picsum.photos/seed/elden/600/800',
    images: ['https://picsum.photos/seed/elden1/800/450', 'https://picsum.photos/seed/elden2/800/450'],
    rating: '16',
    releaseDate: '2024-06-21'
  },
  {
    id: '3',
    title: 'God of War Ragnarök',
    description: 'Kratos e Atreus devem viajar para cada um dos nove reinos em busca de respostas enquanto as forças de Odin se preparam para a batalha profetizada.',
    platform: 'PS5',
    category: 'Ação e Aventura',
    status: 'Alugado',
    stockPrimary: 0,
    stockSecondary: 0,
    minStockPrimary: 1,
    minStockSecondary: 1,
    isFeatured: true,
    isNew: false,
    mostRented: true,
    price: 35.00,
    imageUrl: 'https://picsum.photos/seed/gow/600/800',
    images: ['https://picsum.photos/seed/gow1/800/450'],
    rating: '18',
    releaseDate: '2022-11-09'
  }
];

export const ADMIN_EMAIL = 'geovannetv@gmail.com';
export const WHATSAPP_NUMBER = '5522999566934';

// Ícone oficial Pix (apenas o diamante) conforme solicitado pelo usuário
export const PIX_LOGO_URL = 'https://logospng.org/download/pix/logo-pix-icone-512.png';

// Tabela de Preços Profissional
export const PRICE_TABLE = {
  Primária: {
    3: 40,
    7: 45,
    10: 50,
    15: 60,
    20: 70,
    30: 80,
    45: 90,
    60: 100,
    75: 110,
    90: 120
  },
  Secundária: {
    7: 40,
    15: 50,
    30: 60,
    45: 70,
    60: 80,
    90: 100
  }
};
