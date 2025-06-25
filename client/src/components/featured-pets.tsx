import { useQuery } from "@tanstack/react-query";
import PetCard from "./pet-card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Pet } from "@shared/schema";

export default function FeaturedPets() {
  const { data: pets, isLoading } = useQuery<Pet[]>({
    queryKey: ["/api/pets"],
  });

  // Sort so 'puspin' and 'aspin' cats/dogs come first
  const sortedPets = (pets || []).slice().sort((a, b) => {
    const isAspinPuspin = (pet: Pet) => {
      const breed = pet.breed?.toLowerCase();
      return (
        (pet.type === 'cat' && breed === 'puspin') ||
        (pet.type === 'dog' && breed === 'aspin')
      );
    };
    if (isAspinPuspin(a) && !isAspinPuspin(b)) return -1;
    if (!isAspinPuspin(a) && isAspinPuspin(b)) return 1;
    return 0;
  });

  const featuredPets = sortedPets.slice(0, 6);

  if (isLoading) {
    return (
      <section className="py-16 px-4 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-bold text-4xl text-gray-800 mb-4" style={{ fontFamily: 'Nunito, sans-serif' }}>
              Featured Pets
            </h2>
            <p className="text-lg text-gray-600">These adorable pets are looking for loving homes</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
                <div className="w-full h-64 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4 bg-white/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-bold text-4xl text-gray-800 mb-4" style={{ fontFamily: 'Nunito, sans-serif' }}>
            Featured Pets
          </h2>
          <p className="text-lg text-gray-600">These adorable pets are looking for loving homes</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredPets.map((pet) => (
            <PetCard key={pet.id} pet={pet} />
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/pets">
            <Button className="bg-white text-coral border-2 border-coral px-8 py-3 rounded-full hover:bg-coral hover:text-white transition-all duration-300 font-semibold">
              View All Pets
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
