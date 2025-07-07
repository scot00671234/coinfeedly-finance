interface NewsApiArticle {
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  source: {
    name: string;
  };
  content: string;
}

interface NewsApiResponse {
  articles: NewsApiArticle[];
  totalResults: number;
  status: string;
}

class NewsAPIService {
  private baseUrl = 'https://newsapi.org/v2';
  private apiKey = process.env.NEWS_API_KEY;

  async getFinancialNews(limit: number = 20): Promise<NewsApiArticle[]> {
    if (!this.apiKey) {
      console.log('NEWS_API_KEY not found, using fallback news generation');
      return [];
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/everything?q=finance OR stock OR market OR crypto OR bitcoin OR economy&sortBy=publishedAt&pageSize=${limit}&language=en&apiKey=${this.apiKey}`
      );

      if (!response.ok) {
        throw new Error(`News API error: ${response.status}`);
      }

      const data: NewsApiResponse = await response.json();
      return data.articles || [];
    } catch (error) {
      console.error('Error fetching news:', error);
      return [];
    }
  }

  async getTechNews(limit: number = 20): Promise<NewsApiArticle[]> {
    if (!this.apiKey) {
      return [];
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/everything?q=technology OR AI OR artificial intelligence OR software OR startup&sortBy=publishedAt&pageSize=${limit}&language=en&apiKey=${this.apiKey}`
      );

      if (!response.ok) {
        throw new Error(`News API error: ${response.status}`);
      }

      const data: NewsApiResponse = await response.json();
      return data.articles || [];
    } catch (error) {
      console.error('Error fetching tech news:', error);
      return [];
    }
  }

  async getWorldNews(limit: number = 20): Promise<NewsApiArticle[]> {
    if (!this.apiKey) {
      return [];
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/top-headlines?category=general&pageSize=${limit}&language=en&apiKey=${this.apiKey}`
      );

      if (!response.ok) {
        throw new Error(`News API error: ${response.status}`);
      }

      const data: NewsApiResponse = await response.json();
      return data.articles || [];
    } catch (error) {
      console.error('Error fetching world news:', error);
      return [];
    }
  }

  async getCryptoNews(limit: number = 20): Promise<NewsApiArticle[]> {
    if (!this.apiKey) {
      return [];
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/everything?q=cryptocurrency OR bitcoin OR ethereum OR blockchain OR defi&sortBy=publishedAt&pageSize=${limit}&language=en&apiKey=${this.apiKey}`
      );

      if (!response.ok) {
        throw new Error(`News API error: ${response.status}`);
      }

      const data: NewsApiResponse = await response.json();
      return data.articles || [];
    } catch (error) {
      console.error('Error fetching crypto news:', error);
      return [];
    }
  }
}

export const newsAPIService = new NewsAPIService();
export type { NewsApiArticle };