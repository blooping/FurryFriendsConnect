import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AdoptionModal from "@/components/adoption-modal";
import { Pet } from "@shared/schema";
import { formatAge, formatLocation, getPetImageUrl, getDefaultPetImage, capitalizeFirst } from "@/lib/utils";
import { Heart } from "lucide-react";

interface PetCardProps {
  pet: Pet;
}

export default function PetCard({ pet }: PetCardProps) {
  const imageUrl = pet.imageUrl || getDefaultPetImage(pet.type);

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group">
      <Link href={`/pets/${pet.id}`}>
        <img 
          src={imageUrl} 
          alt={pet.name}
          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
        />
      </Link>
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <Link href={`/pets/${pet.id}`}>
            <h3 className="font-bold text-xl text-gray-800 cursor-pointer hover:text-coral transition-colors" style={{ fontFamily: 'Nunito, sans-serif' }}>
              {pet.name}
            </h3>
          </Link>
          <Badge 
            className="bg-mint text-gray-800 px-3 py-1 rounded-full text-sm font-medium"
          >
            {formatAge(pet.age)}
          </Badge>
        </div>
        <p className="text-gray-600 mb-4">
          {capitalizeFirst(pet.breed)} • {capitalizeFirst(pet.gender)}
        </p>
        <p className="text-gray-700 mb-4 text-sm line-clamp-2">
          {pet.description}
        </p>
        <div className="flex justify-between items-center">
          <span className="text-coral font-semibold">
            {formatLocation(pet.location)}
          </span>
          <Link href={`/pets/${pet.id}`}>
            <Button className="gradient-coral-peach text-white px-4 py-2 rounded-full hover:shadow-lg transition-all duration-300 text-sm font-medium">
              Meet {pet.name}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
