import { GoogleGenAI } from "@google/genai";
import type { NewsEvent } from "@shared/schema";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || ""
});

export async function generateArticle(newsEvent: NewsEvent): Promise<{
  title: string;
  content: string;
  summary: string;
  authorName: string;
  category: string;
  tags: string[];
  relatedSymbols: string[];
}> {
  try {
    const systemPrompt = `You are a professional financial journalist writing for a sophisticated finance news platform. 
    
    Write a comprehensive, professional article based on the provided news event. The article should be:
    - Well-researched and authoritative
    - Between 800-1200 words
    - Include market analysis and implications
    - Written in a Bloomberg/Financial Times style
    - Professional but accessible
    - Include relevant financial metrics and context
    
    Do not mention that this is AI-generated content. Write as if you are an experienced financial reporter.
    
    Return the response in JSON format with the following structure:
    {
      "title": "compelling headline",
      "content": "full article content with multiple paragraphs",
      "summary": "2-3 sentence summary",
      "authorName": "realistic financial journalist name",
      "category": "one of: BREAKING, CRYPTO, STOCKS, COMMODITIES, EARNINGS",
      "tags": ["relevant", "tags", "array"],
      "relatedSymbols": ["SYMBOL1", "SYMBOL2"]
    }`;

    const userPrompt = `News Event: ${newsEvent.headline}
    
    Summary: ${newsEvent.summary}
    
    Source: ${newsEvent.source}
    
    Related Symbols: ${newsEvent.symbols?.join(', ') || 'N/A'}
    
    Published: ${newsEvent.publishedAt}
    
    Generate a professional financial news article based on this information.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            title: { type: "string" },
            content: { type: "string" },
            summary: { type: "string" },
            authorName: { type: "string" },
            category: { type: "string" },
            tags: { type: "array", items: { type: "string" } },
            relatedSymbols: { type: "array", items: { type: "string" } }
          },
          required: ["title", "content", "summary", "authorName", "category", "tags", "relatedSymbols"]
        }
      },
      contents: userPrompt
    });

    const rawJson = response.text;
    
    if (rawJson) {
      return JSON.parse(rawJson);
    } else {
      throw new Error("Empty response from Gemini API");
    }
  } catch (error) {
    console.error("Error generating article:", error);
    throw new Error(`Failed to generate article: ${error}`);
  }
}

export async function analyzeSentiment(text: string): Promise<{
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  marketImplication: string;
}> {
  try {
    const systemPrompt = `You are a financial sentiment analysis expert. 
    
    Analyze the sentiment of the financial news text and provide:
    - Overall sentiment (positive, negative, or neutral)
    - Confidence score (0-1)
    - Market implication (brief description of how this might affect markets)
    
    Focus on market-moving sentiment rather than general news sentiment.
    
    Return JSON format:
    {
      "sentiment": "positive|negative|neutral",
      "confidence": 0.95,
      "marketImplication": "brief market impact description"
    }`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            sentiment: { type: "string", enum: ["positive", "negative", "neutral"] },
            confidence: { type: "number", minimum: 0, maximum: 1 },
            marketImplication: { type: "string" }
          },
          required: ["sentiment", "confidence", "marketImplication"]
        }
      },
      contents: text
    });

    const rawJson = response.text;
    
    if (rawJson) {
      return JSON.parse(rawJson);
    } else {
      throw new Error("Empty response from Gemini API");
    }
  } catch (error) {
    console.error("Error analyzing sentiment:", error);
    throw new Error(`Failed to analyze sentiment: ${error}`);
  }
}

export async function generateMarketSummary(marketData: any[]): Promise<string> {
  try {
    const systemPrompt = `You are a financial market analyst. 
    
    Write a concise market summary (2-3 paragraphs) based on the provided market data.
    Focus on:
    - Overall market direction
    - Notable movers
    - Key themes and trends
    - What investors should watch
    
    Write in a professional, Bloomberg-style tone.`;

    const dataString = marketData.map(item => 
      `${item.symbol}: ${item.price} (${item.changePercent}%)`
    ).join(', ');

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Market Data: ${dataString}\n\nGenerate a market summary based on this data.`
    });

    return response.text || "Market analysis temporarily unavailable.";
  } catch (error) {
    console.error("Error generating market summary:", error);
    return "Market analysis temporarily unavailable.";
  }
}
