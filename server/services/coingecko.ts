interface CoinGeckoData {
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

interface CoinGeckoApiResponse {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  market_cap_rank: number;
  circulating_supply: number;
}

class CoinGeckoService {
  private baseUrl = 'https://api.coingecko.com/api/v3';

  async getTopCoins(limit: number = 50): Promise<CoinGeckoData[]> {
    try {
      const url = `${this.baseUrl}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false&price_change_percentage=24h`;
      
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'CoinFeedly/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }

      const data: CoinGeckoApiResponse[] = await response.json();
      
      return data.map(coin => ({
        id: coin.id,
        symbol: coin.symbol,
        name: coin.name,
        price: coin.current_price,
        change: coin.price_change_24h,
        changePercent: coin.price_change_percentage_24h,
        marketCap: coin.market_cap,
        volume: coin.total_volume,
        rank: coin.market_cap_rank,
        circulatingSupply: coin.circulating_supply
      }));
    } catch (error) {
      console.error('Error fetching CoinGecko data:', error);
      return [];
    }
  }

  async getCoinBySymbol(symbol: string): Promise<CoinGeckoData | null> {
    try {
      const coins = await this.getTopCoins(250);
      return coins.find(coin => coin.symbol.toLowerCase() === symbol.toLowerCase()) || null;
    } catch (error) {
      console.error('Error fetching coin by symbol:', error);
      return null;
    }
  }

  async getTrendingCoins(): Promise<CoinGeckoData[]> {
    try {
      const url = `${this.baseUrl}/search/trending`;
      
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'CoinFeedly/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Extract coin IDs from trending and fetch their market data
      const coinIds = data.coins.map((coin: any) => coin.item.id).slice(0, 10);
      
      if (coinIds.length === 0) {
        return [];
      }

      const marketUrl = `${this.baseUrl}/coins/markets?vs_currency=usd&ids=${coinIds.join(',')}&order=market_cap_desc&per_page=10&page=1&sparkline=false&price_change_percentage=24h`;
      
      const marketResponse = await fetch(marketUrl, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'CoinFeedly/1.0'
        }
      });

      if (!marketResponse.ok) {
        return [];
      }

      const marketData: CoinGeckoApiResponse[] = await marketResponse.json();
      
      return marketData.map(coin => ({
        id: coin.id,
        symbol: coin.symbol,
        name: coin.name,
        price: coin.current_price,
        change: coin.price_change_24h,
        changePercent: coin.price_change_percentage_24h,
        marketCap: coin.market_cap,
        volume: coin.total_volume,
        rank: coin.market_cap_rank,
        circulatingSupply: coin.circulating_supply
      }));
    } catch (error) {
      console.error('Error fetching trending coins:', error);
      return [];
    }
  }

  async getGlobalMarketData(): Promise<{
    totalMarketCap: number;
    totalVolume: number;
    btcDominance: number;
    ethDominance: number;
    activeCoins: number;
  } | null> {
    try {
      const url = `${this.baseUrl}/global`;
      
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'CoinFeedly/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }

      const data = await response.json();
      const global = data.data;
      
      return {
        totalMarketCap: global.total_market_cap.usd,
        totalVolume: global.total_volume.usd,
        btcDominance: global.market_cap_percentage.btc,
        ethDominance: global.market_cap_percentage.eth,
        activeCoins: global.active_cryptocurrencies
      };
    } catch (error) {
      console.error('Error fetching global market data:', error);
      return null;
    }
  }
}

export const coinGeckoService = new CoinGeckoService();
