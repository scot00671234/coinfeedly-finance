import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";
import ArticleCard from "@/components/articles/article-card";
import type { Article } from "@shared/schema";

const categories = [
  { value: "all", label: "All Categories" },
  { value: "BREAKING", label: "Breaking News" },
  { value: "CRYPTO", label: "Cryptocurrency" },
  { value: "STOCKS", label: "Stocks" },
  { value: "COMMODITIES", label: "Commodities" },
  { value: "EARNINGS", label: "Earnings" },
];

export default function Articles() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 12;

  // Build query parameters
  const queryParams = new URLSearchParams();
  queryParams.append("limit", articlesPerPage.toString());
  queryParams.append("offset", ((currentPage - 1) * articlesPerPage).toString());
  
  if (searchQuery) {
    queryParams.append("search", searchQuery);
  }
  
  if (selectedCategory !== "all") {
    queryParams.append("category", selectedCategory);
  }

  const { data: articles = [], isLoading } = useQuery<Article[]>({
    queryKey: [`/api/articles?${queryParams.toString()}`],
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Financial News & Analysis</h1>
        <p className="text-gray-600">Stay informed with the latest market developments and expert analysis</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search articles, companies, or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </form>
          
          <div className="flex gap-4">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button type="submit" onClick={handleSearch}>
              Search
            </Button>
          </div>
        </div>
      </div>

      {/* Articles Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No articles found</h3>
            <p className="text-gray-600">
              {searchQuery || selectedCategory !== "all" 
                ? "Try adjusting your search terms or filters"
                : "Check back later for new articles"}
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Results info */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing {articles.length} articles
                {searchQuery && ` for "${searchQuery}"`}
                {selectedCategory !== "all" && ` in ${categories.find(c => c.value === selectedCategory)?.label}`}
              </p>
              
              {(searchQuery || selectedCategory !== "all") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                    setCurrentPage(1);
                  }}
                >
                  Clear filters
                </Button>
              )}
            </div>
          </div>

          {/* Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>

          {/* Pagination */}
          {articles.length === articlesPerPage && (
            <div className="mt-8 flex justify-center">
              <div className="flex gap-2">
                {currentPage > 1 && (
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => prev - 1)}
                  >
                    Previous
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => prev + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
