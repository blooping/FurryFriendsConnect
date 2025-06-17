import { useState } from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Bot, Heart, Sparkles } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

interface UserPreferences {
  petType: string;
  livingSpace: string;
  activityLevel: string;
  experience: string;
  timeAvailable: string;
  familySituation: string;
  budget: string;
  allergies: string;
}

interface PetMatch {
  petId: number;
  matchScore: number;
  reasoning: string;
  careAdvice: string[];
  pet?: {
    id: number;
    name: string;
    type: string;
    breed: string;
    age: string;
    imageUrl: string;
    location: string;
  };
}

export default function AIMatching() {
  const [preferences, setPreferences] = useState<UserPreferences>({
    petType: "",
    livingSpace: "",
    activityLevel: "",
    experience: "",
    timeAvailable: "",
    familySituation: "",
    budget: "",
    allergies: "",
  });
  
  const [matches, setMatches] = useState<PetMatch[]>([]);
  const { toast } = useToast();

  const matchingMutation = useMutation({
    mutationFn: async (prefs: UserPreferences) => {
      const response = await apiRequest("POST", "/api/ai/match", {
        userPreferences: prefs,
      });
      return await response.json();
    },
    onSuccess: (data: PetMatch[]) => {
      setMatches(data);
      toast({
        title: "Matches Found!",
        description: `Found ${data.length} potential matches for you.`,
      });
    },
    onError: () => {
      toast({
        title: "Matching Failed",
        description: "Unable to generate matches. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (field: keyof UserPreferences, value: string) => {
    setPreferences(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const requiredFields = ['livingSpace', 'activityLevel', 'experience', 'timeAvailable', 'familySituation'];
    const missingFields = requiredFields.filter(field => !preferences[field as keyof UserPreferences]);
    
    if (missingFields.length > 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields to get the best matches.",
        variant: "destructive",
      });
      return;
    }

    matchingMutation.mutate(preferences);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender to-mint">
      <Header />
      
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 gradient-coral-peach rounded-full mb-4">
              <Bot className="text-white h-8 w-8" />
            </div>
            <h1 className="font-bold text-4xl text-gray-800 mb-4" style={{ fontFamily: 'Nunito, sans-serif' }}>
              AI Pet Matching
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Tell us about your lifestyle and preferences, and our AI will find the perfect pet companions for you.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Preferences Form */}
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-coral" />
                  Your Preferences
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="petType">Preferred Pet Type (Optional)</Label>
                    <Select value={preferences.petType} onValueChange={(value) => handleInputChange("petType", value)}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Any pet type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">No preference</SelectItem>
                        <SelectItem value="dog">Dog</SelectItem>
                        <SelectItem value="cat">Cat</SelectItem>
                        <SelectItem value="rabbit">Rabbit</SelectItem>
                        <SelectItem value="bird">Bird</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="livingSpace">Living Space *</Label>
                    <Select value={preferences.livingSpace} onValueChange={(value) => handleInputChange("livingSpace", value)}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select your living space" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="apartment">Apartment</SelectItem>
                        <SelectItem value="house-small-yard">House with small yard</SelectItem>
                        <SelectItem value="house-large-yard">House with large yard</SelectItem>
                        <SelectItem value="condo">Condo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="activityLevel">Activity Level *</Label>
                    <Select value={preferences.activityLevel} onValueChange={(value) => handleInputChange("activityLevel", value)}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="How active are you?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low - Prefer quiet activities</SelectItem>
                        <SelectItem value="moderate">Moderate - Some daily exercise</SelectItem>
                        <SelectItem value="high">High - Very active lifestyle</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="experience">Pet Experience *</Label>
                    <Select value={preferences.experience} onValueChange={(value) => handleInputChange("experience", value)}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Your experience with pets" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="first-time">First-time pet owner</SelectItem>
                        <SelectItem value="some">Some experience</SelectItem>
                        <SelectItem value="experienced">Very experienced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="timeAvailable">Time Available *</Label>
                    <Select value={preferences.timeAvailable} onValueChange={(value) => handleInputChange("timeAvailable", value)}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="How much time can you dedicate?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="minimal">Minimal - Less than 1 hour daily</SelectItem>
                        <SelectItem value="moderate">Moderate - 1-3 hours daily</SelectItem>
                        <SelectItem value="lots">Lots - More than 3 hours daily</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="familySituation">Family Situation *</Label>
                    <Select value={preferences.familySituation} onValueChange={(value) => handleInputChange("familySituation", value)}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Your family situation" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">Single person</SelectItem>
                        <SelectItem value="couple">Couple</SelectItem>
                        <SelectItem value="family-young-kids">Family with young children</SelectItem>
                        <SelectItem value="family-older-kids">Family with older children</SelectItem>
                        <SelectItem value="seniors">Senior household</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="budget">Budget (Optional)</Label>
                    <Input
                      id="budget"
                      value={preferences.budget}
                      onChange={(e) => handleInputChange("budget", e.target.value)}
                      placeholder="Monthly budget for pet care"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="allergies">Allergies or Special Considerations</Label>
                    <Textarea
                      id="allergies"
                      value={preferences.allergies}
                      onChange={(e) => handleInputChange("allergies", e.target.value)}
                      placeholder="Any allergies or special needs to consider..."
                      className="mt-2"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={matchingMutation.isPending}
                    className="w-full gradient-coral-peach text-white py-3 rounded-xl font-semibold text-lg hover:shadow-lg transition-all duration-300"
                  >
                    {matchingMutation.isPending ? "Finding Matches..." : "Find My Perfect Pet"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Results */}
            <div className="space-y-6">
              {matches.length === 0 && !matchingMutation.isPending && (
                <Card className="shadow-xl">
                  <CardContent className="p-8 text-center">
                    <Bot className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="font-bold text-xl text-gray-800 mb-2">Ready to Find Your Match?</h3>
                    <p className="text-gray-600">Fill out the form to get personalized pet recommendations powered by AI.</p>
                  </CardContent>
                </Card>
              )}

              {matchingMutation.isPending && (
                <Card className="shadow-xl">
                  <CardContent className="p-8 text-center">
                    <div className="animate-spin h-12 w-12 border-4 border-coral border-t-transparent rounded-full mx-auto mb-4"></div>
                    <h3 className="font-bold text-xl text-gray-800 mb-2">Analyzing Your Preferences...</h3>
                    <p className="text-gray-600">Our AI is finding the perfect pet matches for you.</p>
                  </CardContent>
                </Card>
              )}

              {matches.map((match, index) => (
                <Card key={index} className="shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-xl text-gray-800" style={{ fontFamily: 'Nunito, sans-serif' }}>
                          Pet Match #{index + 1}
                        </h3>
                        <p className="text-gray-600">Pet ID: {match.petId}</p>
                      </div>
                      <Badge className="gradient-coral-peach text-white px-3 py-1 rounded-full font-semibold">
                        {match.matchScore}% Match
                      </Badge>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Why This Match:</h4>
                      <p className="text-gray-700 text-sm leading-relaxed">{match.reasoning}</p>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Care Tips:</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {match.careAdvice.map((tip, tipIndex) => (
                          <li key={tipIndex} className="text-gray-700 text-sm">{tip}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex gap-3">
                      <Link href={`/pets/${match.petId}`}>
                        <Button className="gradient-coral-peach text-white hover:shadow-lg transition-all duration-300">
                          <Heart className="w-4 h-4 mr-2" />
                          View Pet Details
                        </Button>
                      </Link>
                      <Button variant="outline" className="border-coral text-coral hover:bg-coral hover:text-white transition-all duration-300">
                        Get More Info
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
