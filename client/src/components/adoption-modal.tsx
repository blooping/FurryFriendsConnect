import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Heart } from "lucide-react";
import { Pet } from "@shared/schema";

interface AdoptionModalProps {
  pet: Pet;
  children: React.ReactNode;
}

interface AdoptionFormData {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  housingType: string;
  petExperience: string;
  reasonForAdoption: string;
  agreeToTerms: boolean;
}

export default function AdoptionModal({ pet, children }: AdoptionModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [formData, setFormData] = useState<AdoptionFormData>({
    fullName: "",
    email: "",
    phone: "",
    city: "",
    housingType: "",
    petExperience: "",
    reasonForAdoption: "",
    agreeToTerms: false,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const adoptionMutation = useMutation({
    mutationFn: async (data: AdoptionFormData) => {
      // Only submit the adoption application for authenticated users
      return await apiRequest("POST", "/api/applications", {
        petId: pet.id,
        applicationData: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/pets/search"] });
      queryClient.invalidateQueries({ queryKey: [`/api/pets/${pet.id}`] });
      setIsOpen(false);
      resetForm();
      toast({
        title: "Application Submitted!",
        description: `Your adoption application for ${pet.name} has been submitted successfully. We'll be in touch soon!`,
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

  const resetForm = () => {
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      city: "",
      housingType: "",
      petExperience: "",
      reasonForAdoption: "",
      agreeToTerms: false,
    });
  };

  const handleInputChange = (field: keyof AdoptionFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

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

    console.log("Submitting application:", {
      petId: pet.id,
      applicationData: formData,
    });

    adoptionMutation.mutate(formData);
  };

  useEffect(() => {
    if (isOpen) {
      fetch("/api/me", { credentials: "include" })
        .then(res => setIsAuthenticated(res.status === 200))
        .catch(() => setIsAuthenticated(false));
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-coral" />
            Adopt {pet.name}
          </DialogTitle>
        </DialogHeader>
        {isAuthenticated === false ? (
          <div className="text-center py-8">
            <h2 className="text-xl font-bold mb-4">Sign In Required</h2>
            <p className="mb-6">You must be signed in to submit an adoption application.</p>
            <Button onClick={() => window.location.href = "/login"} className="w-full">Go to Login</Button>
          </div>
        ) : isAuthenticated === null ? null : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  placeholder="Your full name"
                  className="mt-2"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="your.email@example.com"
                  className="mt-2"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="mt-2"
                  required
                />
              </div>
              <div>
                <Label htmlFor="city">City, State *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  placeholder="San Francisco, CA"
                  className="mt-2"
                  required
                />
              </div>
            </div>

            <div>
              <Label>Housing Type *</Label>
              <Select value={formData.housingType} onValueChange={(value) => handleInputChange("housingType", value)}>
                <SelectTrigger className="mt-2">
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
              <Label htmlFor="petExperience">Pet Experience *</Label>
              <Textarea
                id="petExperience"
                value={formData.petExperience}
                onChange={(e) => handleInputChange("petExperience", e.target.value)}
                placeholder="Tell us about your experience with pets..."
                className="mt-2 h-24"
                required
              />
            </div>

            <div>
              <Label htmlFor="reasonForAdoption">Why do you want to adopt {pet.name}? *</Label>
              <Textarea
                id="reasonForAdoption"
                value={formData.reasonForAdoption}
                onChange={(e) => handleInputChange("reasonForAdoption", e.target.value)}
                placeholder={`Tell us why ${pet.name} would be perfect for your family...`}
                className="mt-2 h-24"
                required
              />
            </div>

            <div className="flex items-center space-x-3">
              <Checkbox
                id="agreeToTerms"
                checked={formData.agreeToTerms}
                onCheckedChange={(checked) => handleInputChange("agreeToTerms", checked as boolean)}
              />
              <Label htmlFor="agreeToTerms" className="text-sm">
                I agree to the adoption terms and conditions and understand the responsibilities of pet ownership
              </Label>
            </div>

            <Button 
              type="submit" 
              disabled={adoptionMutation.isPending}
              className="w-full gradient-coral-peach text-white py-3 rounded-xl font-semibold text-lg hover:shadow-lg transition-all duration-300"
            >
              {adoptionMutation.isPending ? "Submitting Application..." : `Apply to Adopt ${pet.name}`}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}