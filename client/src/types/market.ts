export interface MarketQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume?: number;
  marketCap?: number;
  currency?: string;
  exchange?: string;
}

export interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap?: number;
  volume?: number;
  rank?: number;
  circulatingSupply?: number;
}

export interface WebSocketMessage {
  type: 'market-data-update' | 'new-article' | 'news-event';
  data: any;
}
