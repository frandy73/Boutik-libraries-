export interface Product {
  id: string;
  code: string;
  description: string;
  price: number; // In HTG
  category: string;
  imageUrl: string;
  summary?: string; // Description courte du contenu du livre
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  relatedProducts?: Product[]; // For showing product cards inside chat
}

export enum AppView {
  CATALOG = 'CATALOG',
  CHAT = 'CHAT'
}

export interface AiResponse {
  intent: 'ADD_TO_CART' | 'SEARCH' | 'GREETING' | 'SPECIAL_REQUEST' | 'UNKNOWN';
  items: {
    productCode: string; // Should match Product.code OR be the Title of the missing book for SPECIAL_REQUEST
    quantity: number;
  }[];
  message?: string;
}