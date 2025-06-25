import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AdoptionModal from "@/components/adoption-modal";
import DocumentViewer from "@/components/document-viewer";
import { Pet } from "@shared/schema";
import { formatAge, formatLocation, getPetImageUrl, getDefaultPetImage, capitalizeFirst } from "@/lib/utils";
import { Heart, FileText } from "lucide-react";
import { useEffect, useState } from "react";

interface PetCardProps {
  pet: Pet;
}

export default function PetCard({ pet }: PetCardProps) {
  const imageUrl = pet.imageUrl || getDefaultPetImage(pet.type);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    fetch("/api/me", { credentials: "include" })
      .then(res => setIsAuthenticated(res.status === 200))
      .catch(() => setIsAuthenticated(false));
  }, []);

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group">
      <div className="relative">
        <Link href={`/pets/${pet.id}`}>
          <img 
            src={imageUrl} 
            alt={pet.name}
            className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
          />
        </Link>
        {pet.documentsUrl && (
          <div className="absolute top-2 right-2">
            <DocumentViewer 
              documentUrl={pet.documentsUrl} 
              documentName={`${pet.name}'s Documents`}
            >
              <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white transition-all duration-200 cursor-pointer">
                <FileText className="w-4 h-4 text-coral" />
              </div>
            </DocumentViewer>
          </div>
        )}
      </div>
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
          <div className="flex gap-2">
            {pet.status === 'available' && isAuthenticated && (
              <AdoptionModal pet={pet}>
                <Button size="sm" className="gradient-coral-peach text-white px-3 py-1 rounded-full hover:shadow-lg transition-all duration-300 text-xs font-medium">
                  <Heart className="w-3 h-3 mr-1" />
                  Adopt
                </Button>
              </AdoptionModal>
            )}
            {pet.status === 'available' && !isAuthenticated && (
              <Button size="sm" className="gradient-coral-peach text-white px-3 py-1 rounded-full hover:shadow-lg transition-all duration-300 text-xs font-medium" onClick={() => window.location.href = "/login"}>
                <Heart className="w-3 h-3 mr-1" />
                Sign in to Adopt
              </Button>
            )}
            <Link href={`/pets/${pet.id}`}>
              <Button size="sm" variant="outline" className="border-coral text-coral hover:bg-coral hover:text-white px-3 py-1 rounded-full transition-all duration-300 text-xs font-medium">
                View Details
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
