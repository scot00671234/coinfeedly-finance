import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Brain, Target, AlertTriangle, Calendar } from "lucide-react";
import { formatCurrency, formatPercent } from "@/lib/utils";

interface Article {
  id: number;
  title: string;
  summary: string;
  category: string;
  authorName: string;
  publishedAt: string;
  featured: boolean;
  tags: string[];
  relatedSymbols: string[];
}

interface MarketData {
  id: number;
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

export default function Analysis() {
  const { data: articles = [], isLoading: articlesLoading } = useQuery({
    queryKey: ['/api/articles'],
  });

  const { data: marketData = [], isLoading: marketLoading } = useQuery({
    queryKey: ['/api/market-data'],
  });

  const { data: topGainers = [] } = useQuery({
    queryKey: ['/api/market-data/gainers'],
  });

  // Filter analysis-focused articles
  const analysisArticles = articles.filter((article: Article) => 
    article.category === 'economics' || 
    article.tags.some(tag => tag.toLowerCase().includes('analysis'))
  );

  const marketSentiment = {
    overall: "Bullish",
    confidence: 76,
    factors: [
      { factor: "Institutional Adoption", impact: "Positive", strength: "High" },
      { factor: "Federal Reserve Policy", impact: "Positive", strength: "Medium" },
      { factor: "Economic Indicators", impact: "Neutral", strength: "Medium" },
      { factor: "Geopolitical Risks", impact: "Negative", strength: "Low" }
    ]
  };

  if (articlesLoading || marketLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-neutral-200 rounded w-64"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-neutral-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-neutral-900 mb-2">Market Analysis</h1>
          <p className="text-lg text-neutral-600">In-depth financial analysis and market insights</p>
        </div>

        {/* Market Sentiment Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2 border-neutral-200">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-neutral-900 flex items-center">
                <Brain className="h-5 w-5 mr-2" />
                Market Sentiment Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900">Overall Sentiment</h3>
                    <p className="text-neutral-600">Based on news, social media, and market data</p>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-green-100 text-green-800 text-lg px-3 py-1">
                      {marketSentiment.overall}
                    </Badge>
                    <p className="text-sm text-neutral-600 mt-1">
                      {marketSentiment.confidence}% Confidence
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-neutral-900">Key Factors</h4>
                  {marketSentiment.factors.map((factor, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-neutral-100 rounded-lg">
                      <span className="font-medium text-neutral-900">{factor.factor}</span>
                      <div className="flex items-center space-x-2">
                        <Badge variant={
                          factor.impact === 'Positive' ? 'default' : 
                          factor.impact === 'Negative' ? 'destructive' : 'secondary'
                        } className={
                          factor.impact === 'Positive' ? 'bg-green-100 text-green-800' :
                          factor.impact === 'Negative' ? 'bg-red-100 text-red-800' :
                          'bg-neutral-100 text-neutral-800'
                        }>
                          {factor.impact}
                        </Badge>
                        <span className="text-sm text-neutral-600">{factor.strength}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-neutral-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-neutral-900 flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Key Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-neutral-600">VIX (Fear Index)</p>
                <p className="text-2xl font-bold text-neutral-900">18.4</p>
                <p className="text-sm text-green-600">Low Volatility</p>
              </div>
              <div>
                <p className="text-sm text-neutral-600">Market Breadth</p>
                <p className="text-2xl font-bold text-neutral-900">67%</p>
                <p className="text-sm text-green-600">Bullish</p>
              </div>
              <div>
                <p className="text-sm text-neutral-600">Put/Call Ratio</p>
                <p className="text-2xl font-bold text-neutral-900">0.85</p>
                <p className="text-sm text-neutral-600">Neutral</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="border-neutral-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-neutral-900">
                Top Performers Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topGainers.slice(0, 5).map((asset: MarketData) => (
                  <div key={asset.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium text-neutral-900">{asset.symbol}</p>
                      <p className="text-sm text-neutral-600">{asset.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-neutral-900">{formatCurrency(asset.price)}</p>
                      <p className="text-sm text-green-600 flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        +{formatPercent(asset.changePercent)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-neutral-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-neutral-900 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Risk Assessment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 bg-amber-50 rounded-lg">
                  <p className="font-medium text-amber-800">Medium Risk Level</p>
                  <p className="text-sm text-amber-700 mt-1">
                    Current market conditions show moderate volatility with mixed signals from economic indicators.
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-neutral-600">Inflation Risk</span>
                    <span className="text-sm font-medium text-amber-600">Medium</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-neutral-600">Interest Rate Risk</span>
                    <span className="text-sm font-medium text-green-600">Low</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-neutral-600">Credit Risk</span>
                    <span className="text-sm font-medium text-green-600">Low</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-neutral-600">Geopolitical Risk</span>
                    <span className="text-sm font-medium text-red-600">High</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analysis Articles */}
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">Latest Analysis</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {analysisArticles.slice(0, 4).map((article: Article) => (
              <Card key={article.id} className="border-neutral-200 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <Badge variant="secondary" className="bg-neutral-100 text-neutral-800">
                      {article.category.charAt(0).toUpperCase() + article.category.slice(1)}
                    </Badge>
                    <div className="flex items-center text-sm text-neutral-500">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(article.publishedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-3 line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-neutral-600 text-sm mb-4 line-clamp-3">
                    {article.summary}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-neutral-500">By {article.authorName}</p>
                    {article.relatedSymbols.length > 0 && (
                      <div className="flex space-x-1">
                        {article.relatedSymbols.slice(0, 3).map((symbol, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {symbol}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}