import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, Bot } from "lucide-react";

export default function HeroSection() {
  const [petType, setPetType] = useState("");
  const [age, setAge] = useState("");
  const [location, setLocation] = useState("");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (petType) params.append("type", petType);
    if (age) params.append("age", age);
    if (location) params.append("location", location);
    
    window.location.href = `/pets?${params.toString()}`;
  };

  return (
    <section className="relative py-20 px-4">
      <div className="max-w-6xl mx-auto text-center">
        <h1 className="font-bold text-5xl md:text-6xl text-gray-800 mb-6" style={{ fontFamily: 'Nunito, sans-serif' }}>
          Find Your Perfect{" "}
          <span className="text-transparent bg-clip-text gradient-coral-peach">Furry Friend</span>
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
          Discover loving pets waiting for their forever homes. Our AI-powered matching helps you find the perfect companion based on your lifestyle and preferences.
        </p>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl shadow-xl p-6 max-w-4xl mx-auto mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select value={petType} onValueChange={setPetType}>
              <SelectTrigger>
                <SelectValue placeholder="Pet Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dog">Dogs</SelectItem>
                <SelectItem value="cat">Cats</SelectItem>
                <SelectItem value="rabbit">Rabbits</SelectItem>
                <SelectItem value="bird">Birds</SelectItem>
              </SelectContent>
            </Select>

            <Select value={age} onValueChange={setAge}>
              <SelectTrigger>
                <SelectValue placeholder="Age" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="young">Puppy/Kitten</SelectItem>
                <SelectItem value="adult">Adult</SelectItem>
                <SelectItem value="senior">Senior</SelectItem>
              </SelectContent>
            </Select>

            <Input 
              placeholder="Location" 
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="focus:ring-2 focus:ring-coral focus:border-transparent"
            />

            <Button 
              onClick={handleSearch}
              className="gradient-coral-peach text-white hover:shadow-lg transition-all duration-300 font-medium"
            >
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
        </div>

        {/* AI Matching CTA */}
        {/* Removed Try AI Pet Matching button as requested */}
      </div>
    </section>
  );
}
