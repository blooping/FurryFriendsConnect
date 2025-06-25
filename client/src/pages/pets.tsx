import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Header from "@/components/header";
import Footer from "@/components/footer";
import PetCard from "@/components/pet-card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Pet } from "@shared/schema";
import LoadingSpinner from "@/components/ui/loading-spinner";

export default function Pets() {
  const [location] = useLocation();
  const [petType, setPetType] = useState("");
  const [age, setAge] = useState("");
  const [locationFilter, setLocationFilter] = useState("");

  // Parse URL parameters on component mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("type")) setPetType(params.get("type") || "");
    if (params.get("age")) setAge(params.get("age") || "");
    if (params.get("location")) setLocationFilter(params.get("location") || "");
  }, [location]);

  const { data: pets, isLoading } = useQuery<Pet[]>({
    queryKey: ["/api/pets/search", { type: petType, age, location: locationFilter }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (petType && petType !== "all") params.append("type", petType);
      if (age && age !== "all") params.append("age", age);
      if (locationFilter) params.append("location", locationFilter);
      
      const response = await fetch(`/api/pets/search?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch pets");
      return response.json();
    },
  });

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (petType && petType !== "all") params.append("type", petType);
    if (age && age !== "all") params.append("age", age);
    if (locationFilter) params.append("location", locationFilter);
    
    window.history.pushState({}, "", `/pets?${params.toString()}`);
    // The query will automatically refetch due to the queryKey dependency
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender to-mint">
      <Header />
      
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="font-bold text-4xl text-gray-800 mb-4" style={{ fontFamily: 'Nunito, sans-serif' }}>
              Find Your Perfect Pet
            </h1>
            <p className="text-lg text-gray-600">Browse our available pets looking for loving homes</p>
          </div>

          {/* Search Filters */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select value={petType} onValueChange={setPetType}>
                <SelectTrigger>
                  <SelectValue placeholder="Pet Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
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
                  <SelectItem value="all">All Ages</SelectItem>
                  <SelectItem value="young">Young</SelectItem>
                  <SelectItem value="adult">Adult</SelectItem>
                  <SelectItem value="senior">Senior</SelectItem>
                </SelectContent>
              </Select>

              <Input 
                placeholder="Location" 
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
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

          {/* Results */}
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <>
              <div className="text-center mb-6">
                <p className="text-gray-600">
                  {pets?.length || 0} pets found
                </p>
              </div>
              
              {pets && pets.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {pets.map((pet) => (
                    <PetCard key={pet.id} pet={pet} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600 text-lg">No pets found matching your criteria.</p>
                  <p className="text-gray-500 mt-2">Try adjusting your search filters.</p>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
