import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <section className="mb-12">
      <div className="bg-gradient-to-r from-primary to-blue-600 rounded-2xl p-8 text-white">
        <h2 className="text-4xl font-bold mb-4">Real-time Financial Intelligence</h2>
        <p className="text-xl mb-6 text-blue-100">
          Stay ahead of the markets with AI-powered news analysis and real-time data
        </p>
        <div className="flex flex-wrap gap-4">
          <Link href="/articles">
            <Button 
              size="lg" 
              className="bg-white text-primary hover:bg-gray-100 transition-colors"
            >
              Latest Articles
            </Button>
          </Link>
          <Link href="/markets">
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-primary transition-colors"
            >
              Market Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
