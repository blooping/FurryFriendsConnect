import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Bot, Send, X } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import PetCard from "./pet-card";
import AdoptionModal from "./adoption-modal";
import { Link } from "wouter";

interface ChatMessage {
  type: "user" | "ai";
  message: string;
  matches?: any[];
}

const matchingQuestions = [
  { key: "petType", question: "Do you have a preferred pet type? (dog, cat, rabbit, bird, or any)" },
  { key: "livingSpace", question: "What is your living space? (apartment, house, etc.)" },
  { key: "sizePreference", question: "What size pet would you prefer? (small, medium, large)" },
  { key: "activityLevel", question: "How active are you? (low, moderate, high)" },
  { key: "experienceLevel", question: "What is your experience with pets? (none, some, experienced)" },
  { key: "otherPets", question: "Do you have other pets? (yes/no)" },
  { key: "specialNeeds", question: "Are you open to pets with special needs? (yes/no)" },
  { key: "additionalInfo", question: "Any other preferences or considerations? (optional)" },
];

const stopTriggers = ["stop", "show pets", "done", "enough", "that's all"];

function isMatchingIntent(message: string) {
  const triggers = ["match", "recommend", "best pet", "find me a pet", "suggest a pet", "pet for me"];
  return triggers.some(trigger => message.toLowerCase().includes(trigger));
}

function formatMatches(matches: any[]) {
  if (!matches || matches.length === 0) return "Sorry, I couldn't find any good matches right now.";
  return (
    "Here are your top pet matches:\n\n" +
    matches.slice(0, 3).map((m: any, i: number) =>
      `${i + 1}. ${m.name} (ID: ${m.petId})\nMatch Score: ${m.matchScore}%\nWhy this pet: ${m.reasoning}\n\nCare Tips:\n${(m.careAdvice || []).map((tip: string) => `• ${tip}`).join("\n")}`
    ).join("\n\n")
  );
}

// Helper component for displaying a pet match in the chat
function PetMatchCard({ pet }: { pet: any }) {
  const imageUrl = pet.imageUrl || "/default-pet.png";
  return (
    <div className="flex items-center gap-4 bg-white rounded-lg shadow p-3 mb-2">
      <img src={imageUrl} alt={pet.name} className="w-16 h-16 object-cover rounded-lg border" />
      <div className="flex-1">
        <div className="font-bold text-coral text-lg">{pet.name}</div>
        <div className="text-xs text-gray-500 mb-2">{pet.breed} • {pet.age}</div>
        <AdoptionModal pet={pet}>
          <Button size="sm" className="gradient-coral-peach text-white px-3 py-1 rounded-full text-xs font-medium">
            Adopt
          </Button>
        </AdoptionModal>
      </div>
    </div>
  );
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
  const [matchingSession, setMatchingSession] = useState<{
    collecting: boolean;
    preferences: Record<string, any>;
    currentStep: number;
  } | null>(null);

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      // If we're collecting preferences and have all of them, send them as a special message
      if (matchingSession?.collecting && matchingSession.currentStep >= matchingQuestions.length) {
        const prefMessage = `MATCH_PREFERENCES:${JSON.stringify(matchingSession.preferences)}`;
        const response = await apiRequest("POST", "/api/ai/chat", {
          message: prefMessage,
          chatHistory: messages,
        });
        return await response.json();
      }

      // Regular chat message
      const response = await apiRequest("POST", "/api/ai/chat", {
        message,
        chatHistory: messages,
      });
      return await response.json();
    },
    onSuccess: (data) => {
      // If the response contains matches, attach them to the message
      if (data.matches && Array.isArray(data.matches) && data.matches.length > 0) {
        setMessages(prev => [
          ...prev,
          {
            type: "ai",
            message: data.response || "Here are your top pet matches:",
            matches: data.matches,
          }
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          {
            type: "ai",
            message: data.response,
          }
        ]);
      }

      // If this was a matching intent, start collecting preferences
      if (data.isMatchingIntent && !matchingSession) {
        setMatchingSession({ collecting: true, preferences: {}, currentStep: 0 });
        setMessages(prev => [
          ...prev,
          {
            type: "ai",
            message: "I'll help you find your perfect pet match! Let me ask you a few questions to understand your preferences better.\n\n" + matchingQuestions[0].question
          }
        ]);
      }
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
    setMessages(prev => [...prev, { type: "user", message: userMessage }]);
    setCurrentMessage("");

    // If in matching session, collect answers
    if (matchingSession?.collecting) {
      // Check for stop triggers
      if (stopTriggers.some(trigger => userMessage.toLowerCase().includes(trigger))) {
        // Send collected preferences to server and show matches
        const prefMessage = `MATCH_PREFERENCES:${JSON.stringify(matchingSession.preferences)}`;
        apiRequest("POST", "/api/ai/chat", {
          message: prefMessage,
          chatHistory: messages,
        }).then(async res => {
          const data = await res.json();
          setMessages(prev => [...prev, { type: "ai", message: data.response }]);
          setMatchingSession(null);
        });
        return;
      }

      const step = matchingSession.currentStep;
      const key = matchingQuestions[step].key;
      let answer = userMessage.trim();
      const newPrefs = { ...matchingSession.preferences, [key]: answer };

      if (step + 1 < matchingQuestions.length) {
        setMatchingSession({ collecting: true, preferences: newPrefs, currentStep: step + 1 });
        setMessages(prev => [...prev, {
          type: "ai",
          message: matchingQuestions[step + 1].question
        }]);
      } else {
        // All preferences collected, send to server
        const prefMessage = `MATCH_PREFERENCES:${JSON.stringify(newPrefs)}`;
        apiRequest("POST", "/api/ai/chat", {
          message: prefMessage,
          chatHistory: messages,
        }).then(async res => {
          const data = await res.json();
          setMessages(prev => [...prev, { type: "ai", message: data.response }]);
          setMatchingSession(null);
        });
      }
      return;
    }

    // Only start matching session if the message is a matching intent
    if (isMatchingIntent(userMessage)) {
      setMatchingSession({ collecting: true, preferences: {}, currentStep: 0 });
      setMessages(prev => [...prev, {
        type: "ai",
        message: matchingQuestions[0].question
      }]);
      return;
    }

    // Otherwise, just send the message to the AI as a normal chat
    chatMutation.mutate(userMessage);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
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
                  <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                  {/* Render pet matches if present */}
                  {msg.matches && Array.isArray(msg.matches) && msg.matches.length > 0 && (
                    <div className="mt-3">
                      {msg.matches.map((pet: any) => (
                        <PetMatchCard key={pet.id} pet={pet} />
                      ))}
                    </div>
                  )}
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
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="flex-1"
              />
              <Button 
                onClick={handleSendMessage}
                className="gradient-coral-peach text-white"
                disabled={chatMutation.isPending}
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
