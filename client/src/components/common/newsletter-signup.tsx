import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setIsSubscribing(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Successfully subscribed!",
        description: "You'll receive the latest financial news and market analysis",
      });
      
      setEmail("");
    } catch (error) {
      toast({
        title: "Subscription failed",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <section className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 text-center">
      <h3 className="text-2xl font-bold text-white mb-4">Stay Informed</h3>
      <p className="text-gray-300 mb-6">
        Get the latest financial news and market analysis delivered to your inbox
      </p>
      
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 bg-white border-0 focus:ring-2 focus:ring-primary"
          disabled={isSubscribing}
        />
        <Button 
          type="submit" 
          disabled={isSubscribing}
          className="bg-primary hover:bg-blue-700 transition-colors"
        >
          {isSubscribing ? 'Subscribing...' : 'Subscribe'}
        </Button>
      </form>
    </section>
  );
}
