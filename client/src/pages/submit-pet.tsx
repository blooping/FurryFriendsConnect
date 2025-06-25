import { useState, useEffect } from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Heart, Camera } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { InsertPet } from "@shared/schema";

interface PetSubmissionData {
  name: string;
  type: string;
  breed: string;
  age: string;
  gender: string;
  description: string;
  location: string;
  image: File | null;
  imageUrl?: string;
  documents: File | null;
  personality: {
    energyLevel: string;
    goodWithKids: boolean;
    goodWithPets: boolean;
    temperament: string;
  };
  careNeeds: {
    exerciseNeeds: string;
    groomingNeeds: string;
    specialNeeds: string;
  };
  ownerContact: {
    name: string;
    email: string;
    phone: string;
    reason: string;
  };
  agreeToTerms: boolean;
}

export default function SubmitPet() {
  const [formData, setFormData] = useState<PetSubmissionData>({
    name: "",
    type: "",
    breed: "",
    age: "",
    gender: "",
    description: "",
    location: "",
    image: null,
    imageUrl: "",
    documents: null,
    personality: {
      energyLevel: "",
      goodWithKids: false,
      goodWithPets: false,
      temperament: "",
    },
    careNeeds: {
      exerciseNeeds: "",
      groomingNeeds: "",
      specialNeeds: "",
    },
    ownerContact: {
      name: "",
      email: "",
      phone: "",
      reason: "",
    },
    agreeToTerms: false,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if user is authenticated by calling a protected endpoint
    fetch("/api/me", { credentials: "include" })
      .then(res => setIsAuthenticated(res.status === 200))
      .catch(() => setIsAuthenticated(false));
  }, []);

  const submitPetMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return await fetch("/api/pets", {
        method: "POST",
        body: data,
      }).then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/pets/search"] });
      
      toast({
        title: "Pet Submitted Successfully!",
        description: "Your pet has been added to our platform and is now available for adoption.",
      });
      
      resetForm();
    },
    onError: () => {
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your pet. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      type: "",
      breed: "",
      age: "",
      gender: "",
      description: "",
      location: "",
      image: null,
      imageUrl: "",
      documents: null,
      personality: {
        energyLevel: "",
        goodWithKids: false,
        goodWithPets: false,
        temperament: "",
      },
      careNeeds: {
        exerciseNeeds: "",
        groomingNeeds: "",
        specialNeeds: "",
      },
      ownerContact: {
        name: "",
        email: "",
        phone: "",
        reason: "",
      },
      agreeToTerms: false,
    });
  };

  const handleInputChange = (field: string, value: any) => {
    if (field === "image") {
      setFormData(prev => ({
        ...prev,
        image: value
      }));
      return;
    }
    if (field === "documents") {
      setFormData(prev => ({
        ...prev,
        documents: value
      }));
      return;
    }
    const fieldParts = field.split('.');
    
    if (fieldParts.length === 2) {
      setFormData(prev => ({
        ...prev,
        [fieldParts[0]]: {
          ...(prev[fieldParts[0] as keyof PetSubmissionData] as object),
          [fieldParts[1]]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.documents) {
      toast({
        title: "Pet Documents Required",
        description: "Please upload pet documents to continue.",
        variant: "destructive",
      });
      return;
    }
    if (!formData.agreeToTerms) {
      toast({
        title: "Agreement Required",
        description: "Please agree to the terms and conditions to continue.",
        variant: "destructive",
      });
      return;
    }

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key === "image" && value) {
        data.append("image", value as File);
      } else if (key === "documents" && value) {
        data.append("documents", value as File);
      } else if (typeof value === "object" && value !== null) {
        data.append(key, JSON.stringify(value));
      } else if (value !== undefined && value !== null) {
        data.append(key, value as string);
      }
    });
    submitPetMutation.mutate(data);
  };

  if (isAuthenticated === false) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-lavender to-mint">
        <Header />
        <div className="bg-white p-8 rounded shadow-md w-full max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4">Sign In Required</h2>
          <p className="mb-6">You must be signed in to submit a pet for adoption.</p>
          <Button onClick={() => window.location.href = "/login"} className="w-full">Go to Login</Button>
        </div>
        <Footer />
      </div>
    );
  }

  if (isAuthenticated === null) {
    return null; // or a loading spinner
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender to-mint">
      <Header />
      
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 gradient-coral-peach rounded-full mb-4">
              <PlusCircle className="text-white h-8 w-8" />
            </div>
            <h1 className="font-bold text-4xl text-gray-800 mb-4" style={{ fontFamily: 'Nunito, sans-serif' }}>
              Submit a Pet for Adoption
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Help a pet find their forever home by adding them to our platform. Fill out the details below to get started.
            </p>
          </div>

          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-coral" />
                Pet Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Pet Information */}
                <div className="space-y-6">
                  <h3 className="font-semibold text-lg text-gray-800 border-b pb-2">Basic Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Pet Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="Enter pet's name"
                        className="mt-2"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="type">Pet Type *</Label>
                      <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select pet type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dog">Dog</SelectItem>
                          <SelectItem value="cat">Cat</SelectItem>
                          <SelectItem value="rabbit">Rabbit</SelectItem>
                          <SelectItem value="bird">Bird</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="breed">Breed *</Label>
                      <Input
                        id="breed"
                        value={formData.breed}
                        onChange={(e) => handleInputChange("breed", e.target.value)}
                        placeholder="e.g., Golden Retriever"
                        className="mt-2"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="age">Age *</Label>
                      <Input
                        id="age"
                        value={formData.age}
                        onChange={(e) => handleInputChange("age", e.target.value)}
                        placeholder="e.g., 2 years"
                        className="mt-2"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="gender">Gender *</Label>
                      <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleInputChange("location", e.target.value)}
                      placeholder="e.g., San Francisco, CA"
                      className="mt-2"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="image">Pet Photo *</Label>
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={e => handleInputChange("image", e.target.files?.[0] || null)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="documents">Pet Documents (e.g. vet records, adoption papers) *</Label>
                    <Input
                      id="documents"
                      type="file"
                      accept="application/pdf,image/*"
                      onChange={e => handleInputChange("documents", e.target.files?.[0] || null)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      placeholder="Describe your pet's personality, behavior, and what makes them special..."
                      className="mt-2 h-32"
                      required
                    />
                  </div>
                </div>

                {/* Personality Section */}
                <div className="space-y-6">
                  <h3 className="font-semibold text-lg text-gray-800 border-b pb-2">Personality & Temperament</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Energy Level</Label>
                      <Select value={formData.personality.energyLevel} onValueChange={(value) => handleInputChange("personality.energyLevel", value)}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select energy level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Low">Low - Calm and relaxed</SelectItem>
                          <SelectItem value="Moderate">Moderate - Balanced energy</SelectItem>
                          <SelectItem value="High">High - Very active</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="temperament">Temperament</Label>
                      <Input
                        id="temperament"
                        value={formData.personality.temperament}
                        onChange={(e) => handleInputChange("personality.temperament", e.target.value)}
                        placeholder="e.g., Friendly, playful, gentle"
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="goodWithKids"
                        checked={formData.personality.goodWithKids}
                        onCheckedChange={(checked) => handleInputChange("personality.goodWithKids", checked)}
                      />
                      <Label htmlFor="goodWithKids">Good with children</Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="goodWithPets"
                        checked={formData.personality.goodWithPets}
                        onCheckedChange={(checked) => handleInputChange("personality.goodWithPets", checked)}
                      />
                      <Label htmlFor="goodWithPets">Good with other pets</Label>
                    </div>
                  </div>
                </div>

                {/* Care Needs Section */}
                <div className="space-y-6">
                  <h3 className="font-semibold text-lg text-gray-800 border-b pb-2">Care Requirements</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Exercise Needs</Label>
                      <Select value={formData.careNeeds.exerciseNeeds} onValueChange={(value) => handleInputChange("careNeeds.exerciseNeeds", value)}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select exercise needs" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Low - short daily walks">Low - short daily walks</SelectItem>
                          <SelectItem value="Moderate - daily walks and play">Moderate - daily walks and play</SelectItem>
                          <SelectItem value="High - 2+ hours daily">High - 2+ hours daily</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Grooming Needs</Label>
                      <Select value={formData.careNeeds.groomingNeeds} onValueChange={(value) => handleInputChange("careNeeds.groomingNeeds", value)}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select grooming needs" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Low - minimal grooming">Low - minimal grooming</SelectItem>
                          <SelectItem value="Moderate - weekly brushing">Moderate - weekly brushing</SelectItem>
                          <SelectItem value="High - daily brushing required">High - daily brushing required</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="specialNeeds">Special Needs or Medical Conditions</Label>
                    <Textarea
                      id="specialNeeds"
                      value={formData.careNeeds.specialNeeds}
                      onChange={(e) => handleInputChange("careNeeds.specialNeeds", e.target.value)}
                      placeholder="Any medical conditions, special dietary needs, or care requirements..."
                      className="mt-2 h-24"
                    />
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-6">
                  <h3 className="font-semibold text-lg text-gray-800 border-b pb-2">Contact Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="ownerName">Your Name *</Label>
                      <Input
                        id="ownerName"
                        value={formData.ownerContact.name}
                        onChange={(e) => handleInputChange("ownerContact.name", e.target.value)}
                        placeholder="Your full name"
                        className="mt-2"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="ownerEmail">Email *</Label>
                      <Input
                        id="ownerEmail"
                        type="email"
                        value={formData.ownerContact.email}
                        onChange={(e) => handleInputChange("ownerContact.email", e.target.value)}
                        placeholder="your.email@example.com"
                        className="mt-2"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="ownerPhone">Phone Number *</Label>
                    <Input
                      id="ownerPhone"
                      type="tel"
                      value={formData.ownerContact.phone}
                      onChange={(e) => handleInputChange("ownerContact.phone", e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      className="mt-2"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="reason">Reason for Rehoming *</Label>
                    <Textarea
                      id="reason"
                      value={formData.ownerContact.reason}
                      onChange={(e) => handleInputChange("ownerContact.reason", e.target.value)}
                      placeholder="Please explain why you're looking to rehome your pet..."
                      className="mt-2 h-24"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onCheckedChange={(checked) => handleInputChange("agreeToTerms", checked)}
                  />
                  <Label htmlFor="agreeToTerms" className="text-sm">
                    I agree to the terms and conditions and confirm that I have the right to rehome this pet. I understand that FurryFriends will screen potential adopters.
                  </Label>
                </div>

                <Button 
                  type="submit" 
                  disabled={submitPetMutation.isPending}
                  className="w-full gradient-coral-peach text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg transition-all duration-300"
                >
                  {submitPetMutation.isPending ? "Submitting Pet..." : "Submit Pet for Adoption"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}