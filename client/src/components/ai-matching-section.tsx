import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Bot, Heart, Home, Lightbulb, Send, ArrowRight } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function AIMatchingSection() {
  const [message, setMessage] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [, setLocation] = useLocation();

  useEffect(() => {
    fetch("/api/me", { credentials: "include" })
      .then(res => setIsAuthenticated(res.status === 200))
      .catch(() => setIsAuthenticated(false));
  }, []);

  const mockChatMessages = [
    {
      type: "ai",
      message: "Hi! I'm here to help you find your perfect pet companion. Let's start with a few questions about your lifestyle."
    },
    {
      type: "ai", 
      message: "Do you live in an apartment or house? How much time can you dedicate to exercise and training?"
    },
    {
      type: "user",
      message: "I live in an apartment and can walk a pet for about 30 minutes daily."
    },
    {
      type: "ai",
      message: "Based on your lifestyle, I'd recommend smaller to medium-sized dogs or cats. Here are some perfect matches:",
      matches: [
        { name: "Luna", matchScore: 95, description: "Perfect for apartments" }
      ]
    }
  ];

  return (
    <section className="py-16 px-4 gradient-mint-powder bg-opacity-30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 gradient-coral-peach rounded-full mb-4">
            <Bot className="text-white text-2xl h-8 w-8" />
          </div>
          <h2 className="font-bold text-4xl text-gray-800 mb-4" style={{ fontFamily: 'Nunito, sans-serif' }}>
            AI-Powered Pet Matching
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our advanced AI, powered by Gemini, analyzes your lifestyle, preferences, and living situation to find your perfect pet match.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* AI Chat Interface Mockup */}
          <Card className="shadow-xl overflow-hidden">
            <div className="gradient-coral-peach p-4 text-white">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">AI Pet Matchmaker</h3>
                  <p className="text-white/80 text-sm">Powered by Gemini AI</p>
                </div>
              </div>
            </div>
            
            <CardContent className="p-6 space-y-4 h-96 overflow-y-auto">
              {mockChatMessages.map((msg, index) => (
                <div key={index} className={`flex items-start space-x-3 ${msg.type === 'user' ? 'justify-end' : ''}`}>
                  {msg.type === 'ai' && (
                    <div className="w-8 h-8 bg-coral rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="text-white text-xs h-4 w-4" />
                    </div>
                  )}
                  <div className={`rounded-lg p-3 max-w-sm ${
                    msg.type === 'user' 
                      ? 'gradient-coral-peach text-white' 
                      : 'bg-gray-100'
                  }`}>
                    <p className="text-sm">{msg.message}</p>
                    {msg.matches && (
                      <div className="space-y-2 mt-2">
                        {msg.matches.map((match, i) => (
                          <div key={i} className="flex items-center space-x-2 bg-white rounded p-2">
                            <div className="w-8 h-8 bg-mint rounded overflow-hidden">
                              <div className="w-full h-full gradient-coral-peach opacity-60"></div>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-gray-800">{match.name} - {match.matchScore}% Match</p>
                              <p className="text-xs text-gray-600">{match.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>

            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <Input 
                  placeholder="Tell me about your ideal pet..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="focus:ring-2 focus:ring-coral focus:border-transparent text-sm"
                />
                <Button className="gradient-coral-peach text-white hover:shadow-lg transition-all duration-300">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>

          {/* AI Features */}
          <div className="space-y-8">
            <div className="flex items-start space-x-4">
              <div className="bg-mint p-3 rounded-full flex-shrink-0">
                <Heart className="text-gray-700 h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-xl text-gray-800 mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
                  Personality Matching
                </h3>
                <p className="text-gray-600">
                  Our AI analyzes pet personalities and matches them with your lifestyle and preferences for the perfect compatibility.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-butter p-3 rounded-full flex-shrink-0">
                <Home className="text-gray-700 h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-xl text-gray-800 mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
                  Lifestyle Assessment
                </h3>
                <p className="text-gray-600">
                  Get recommendations based on your living space, schedule, experience level, and family situation.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-lavender p-3 rounded-full flex-shrink-0">
                <Lightbulb className="text-gray-700 h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-xl text-gray-800 mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
                  Smart Care Tips
                </h3>
                <p className="text-gray-600">
                  Receive personalized care advice, training tips, and health recommendations for your new pet.
                </p>
              </div>
            </div>

            {/* Start AI Matching Button */}
            {isAuthenticated ? (
              <Link href="/ai-matching">
                <Button className="gradient-coral-peach text-white px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 font-semibold">
                  Start AI Matching <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <Button
                className="gradient-coral-peach text-white px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
                onClick={() => setLocation("/login")}
              >
                Sign In to Use AI Matching <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
