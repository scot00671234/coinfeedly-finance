interface YahooQuote {
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

interface YahooApiResponse {
  quoteResponse: {
    result: Array<{
      symbol: string;
      longName?: string;
      shortName?: string;
      regularMarketPrice?: number;
      regularMarketChange?: number;
      regularMarketChangePercent?: number;
      regularMarketVolume?: number;
      marketCap?: number;
      currency?: string;
      exchange?: string;
    }>;
  };
}

class YahooFinanceService {
  private baseUrl = 'https://query1.finance.yahoo.com/v7/finance/quote';

  async getQuotes(symbols: string[]): Promise<YahooQuote[]> {
    try {
      const symbolsParam = symbols.join(',');
      const url = `${this.baseUrl}?symbols=${symbolsParam}`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`Yahoo Finance API error: ${response.status}`);
      }

      const data: YahooApiResponse = await response.json();
      
      return data.quoteResponse.result.map(quote => ({
        symbol: quote.symbol,
        name: quote.longName || quote.shortName || quote.symbol,
        price: quote.regularMarketPrice || 0,
        change: quote.regularMarketChange || 0,
        changePercent: quote.regularMarketChangePercent || 0,
        volume: quote.regularMarketVolume,
        marketCap: quote.marketCap,
        currency: quote.currency,
        exchange: quote.exchange
      }));
    } catch (error) {
      console.error('Error fetching Yahoo Finance data:', error);
      return [];
    }
  }

  async getIndices(): Promise<YahooQuote[]> {
    const indices = ['^GSPC', '^DJI', '^IXIC', '^RUT', '^VIX'];
    return this.getQuotes(indices);
  }

  async getTopGainers(): Promise<YahooQuote[]> {
    try {
      // This would typically require a more sophisticated API or screener
      // For now, we'll use a predefined list of popular stocks
      const symbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'AMD', 'NFLX', 'CRM'];
      const quotes = await this.getQuotes(symbols);
      
      // Sort by change percent descending
      return quotes
        .filter(quote => quote.changePercent > 0)
        .sort((a, b) => b.changePercent - a.changePercent)
        .slice(0, 10);
    } catch (error) {
      console.error('Error fetching top gainers:', error);
      return [];
    }
  }

  async getMarketNews(symbols: string[]): Promise<Array<{
    headline: string;
    summary: string;
    publishedAt: Date;
    symbols: string[];
    source: string;
  }>> {
    // Yahoo Finance doesn't provide a direct news API in their free tier
    // This would need to be implemented with a proper news API or web scraping
    // For now, return empty array
    return [];
  }
}

export const yahooFinanceService = new YahooFinanceService();
