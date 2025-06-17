import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Bot, Send, X } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface ChatMessage {
  type: "user" | "ai";
  message: string;
}

export default function AIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      type: "ai",
      message: "Hi! I'm your AI pet companion assistant. I can help you find the perfect pet or answer any questions about pet care. How can I help you today?"
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState("");

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest("POST", "/api/ai/chat", {
        message,
        chatHistory: messages,
      });
      return await response.json();
    },
    onSuccess: (data) => {
      setMessages(prev => [...prev, {
        type: "ai",
        message: data.response
      }]);
    },
    onError: () => {
      setMessages(prev => [...prev, {
        type: "ai", 
        message: "I'm sorry, I'm having trouble connecting right now. Please try again later!"
      }]);
    }
  });

  const handleSendMessage = () => {
    if (!currentMessage.trim()) return;

    const userMessage = currentMessage;
    setMessages(prev => [...prev, {
      type: "user",
      message: userMessage
    }]);
    
    setCurrentMessage("");
    chatMutation.mutate(userMessage);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button 
          onClick={() => setIsOpen(true)}
          className="gradient-coral-peach text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
        >
          <Bot className="h-6 w-6 group-hover:scale-110 transition-transform" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-2rem)]">
      <Card className="shadow-2xl">
        <CardHeader className="gradient-coral-peach p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">AI Pet Assistant</h3>
                <p className="text-white/80 text-sm">Powered by Gemini AI</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="h-80 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, index) => (
              <div key={index} className={`flex items-start space-x-3 ${msg.type === 'user' ? 'justify-end' : ''}`}>
                {msg.type === 'ai' && (
                  <div className="w-8 h-8 bg-coral rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="text-white h-4 w-4" />
                  </div>
                )}
                <div className={`rounded-lg p-3 max-w-xs ${
                  msg.type === 'user' 
                    ? 'gradient-coral-peach text-white' 
                    : 'bg-gray-100'
                }`}>
                  <p className="text-sm">{msg.message}</p>
                </div>
              </div>
            ))}
            
            {chatMutation.isPending && (
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-coral rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="text-white h-4 w-4" />
                </div>
                <div className="bg-gray-100 rounded-lg p-3 max-w-xs">
                  <p className="text-sm">Thinking...</p>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <Input 
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about pets..."
                className="focus:ring-2 focus:ring-coral focus:border-transparent text-sm"
                disabled={chatMutation.isPending}
              />
              <Button 
                onClick={handleSendMessage}
                disabled={chatMutation.isPending || !currentMessage.trim()}
                className="gradient-coral-peach text-white hover:shadow-lg transition-all duration-300"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
