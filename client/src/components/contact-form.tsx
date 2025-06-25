import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface ApplicationData {
  fullName: string;
  email: string;
  phone: string;
  city: string; 
  housingType: string;
  petExperience: string;
  agreeToTerms: boolean;
}

export default function ContactForm() {
  const [formData, setFormData] = useState<ApplicationData>({
    fullName: "",
    email: "",
    phone: "",
    city: "",
    housingType: "",
    petExperience: "",
    agreeToTerms: false,
  });

  const { toast } = useToast();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/me", { credentials: "include" })
      .then(res => setIsAuthenticated(res.status === 200))
      .catch(() => setIsAuthenticated(false));
  }, []);

  const applicationMutation = useMutation({
    mutationFn: async (data: ApplicationData) => {
      // For demo purposes, we'll create a user first
      const userResponse = await apiRequest("POST", "/api/users", {
        username: data.email.split("@")[0],
        email: data.email,
        password: "temporary", // In real app, would handle auth properly
        fullName: data.fullName,
        phone: data.phone,
        city: data.city,
        housingType: data.housingType,
        petExperience: data.petExperience,
      });
      
      const user = await userResponse.json();
      
      // Then create an adoption application (without a specific pet for now)
      return await apiRequest("POST", "/api/applications", {
        userId: user.id,
        petId: 1, // Placeholder - in real app would select a pet
        applicationData: data,
      });
    },
    onSuccess: () => {
      toast({
        title: "Application Submitted!",
        description: "Thank you for your interest in adopting a pet. We'll be in touch soon!",
      });
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        city: "",
        housingType: "",
        petExperience: "",
        agreeToTerms: false,
      });
    },
    onError: () => {
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your application. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.agreeToTerms) {
      toast({
        title: "Agreement Required",
        description: "Please agree to the terms and conditions to continue.",
        variant: "destructive",
      });
      return;
    }

    applicationMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof ApplicationData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (isAuthenticated === false) {
    return (
      <section className="py-16 px-4 gradient-lavender-mint bg-opacity-30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-bold text-4xl text-gray-800 mb-4" style={{ fontFamily: 'Nunito, sans-serif' }}>
              Sign In Required
            </h2>
            <p className="text-lg text-gray-600">You must be signed in to submit an adoption application.</p>
            <button onClick={() => window.location.href = "/login"} className="mt-6 px-6 py-3 bg-coral text-white rounded-lg font-semibold text-lg">Go to Login</button>
          </div>
        </div>
      </section>
    );
  }
  if (isAuthenticated === null) {
    return null; // or a loading spinner
  }

  return (
    <section className="py-16 px-4 gradient-lavender-mint bg-opacity-30">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-bold text-4xl text-gray-800 mb-4" style={{ fontFamily: 'Nunito, sans-serif' }}>
            Start Your Adoption Journey
          </h2>
          <p className="text-lg text-gray-600">Ready to welcome a new family member? Fill out our adoption application below.</p>
        </div>

        <Card className="shadow-xl">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="fullName" className="text-gray-700 font-medium">Full Name</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    placeholder="Your full name"
                    className="mt-2 focus:ring-2 focus:ring-coral focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-gray-700 font-medium">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="your.email@example.com"
                    className="mt-2 focus:ring-2 focus:ring-coral focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="phone" className="text-gray-700 font-medium">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="mt-2 focus:ring-2 focus:ring-coral focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="city" className="text-gray-700 font-medium">City, State</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    placeholder="San Francisco, CA"
                    className="mt-2 focus:ring-2 focus:ring-coral focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <Label className="text-gray-700 font-medium">Housing Type</Label>
                <Select value={formData.housingType} onValueChange={(value) => handleInputChange("housingType", value)}>
                  <SelectTrigger className="mt-2 focus:ring-2 focus:ring-coral focus:border-transparent">
                    <SelectValue placeholder="Select housing type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="apartment">Apartment</SelectItem>
                    <SelectItem value="house-small-yard">House with small yard</SelectItem>
                    <SelectItem value="house-large-yard">House with large yard</SelectItem>
                    <SelectItem value="condo">Condo</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="petExperience" className="text-gray-700 font-medium">Tell us about your experience with pets</Label>
                <Textarea
                  id="petExperience"
                  value={formData.petExperience}
                  onChange={(e) => handleInputChange("petExperience", e.target.value)}
                  placeholder="Share your experience with pets, lifestyle, and what you're looking for in a companion..."
                  className="mt-2 h-32 focus:ring-2 focus:ring-coral focus:border-transparent"
                  required
                />
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox
                  id="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onCheckedChange={(checked) => handleInputChange("agreeToTerms", checked as boolean)}
                  className="focus:ring-coral"
                />
                <Label htmlFor="agreeToTerms" className="text-gray-700">
                  I agree to the adoption terms and conditions
                </Label>
              </div>

              <Button 
                type="submit" 
                disabled={applicationMutation.isPending}
                className="w-full gradient-coral-peach text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg transition-all duration-300"
              >
                {applicationMutation.isPending ? "Submitting..." : "Submit Application"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
