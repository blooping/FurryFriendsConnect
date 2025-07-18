import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import Footer from "@/components/footer";
import AdoptionModal from "@/components/adoption-modal";
import DocumentViewer from "@/components/document-viewer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, MapPin, Calendar, Info, MessageCircle, FileText, Eye } from "lucide-react";
import { Pet } from "@shared/schema";
import { formatAge, formatLocation, getPetImageUrl, getDefaultPetImage, capitalizeFirst } from "@/lib/utils";
import { useEffect, useState } from "react";
import LoadingSpinner from "@/components/ui/loading-spinner";

export default function PetDetail() {
  const { id } = useParams<{ id: string }>();
  
  const { data: pet, isLoading } = useQuery<Pet>({
    queryKey: [`/api/pets/${id}`],
    enabled: !!id,
  });

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  useEffect(() => {
    fetch("/api/me", { credentials: "include" })
      .then(res => setIsAuthenticated(res.status === 200))
      .catch(() => setIsAuthenticated(false));
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lavender to-mint">
        <Header />
        <div className="max-w-6xl mx-auto px-4 py-12">
          <LoadingSpinner />
        </div>
        <Footer />
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lavender to-mint">
        <Header />
        <div className="max-w-6xl mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Pet Not Found</h1>
          <p className="text-gray-600">The pet you're looking for doesn't exist or has been adopted.</p>
        </div>
        <Footer />
      </div>
    );
  }

  const imageUrl = pet.imageUrl || getDefaultPetImage(pet.type);

  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender to-mint">
      <Header />
      
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Pet Image */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <img 
                src={imageUrl}
                alt={pet.name}
                className="w-full h-96 object-cover"
              />
            </div>

            {/* Pet Details */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex justify-between items-start mb-4">
                <h1 className="font-bold text-4xl text-gray-800" style={{ fontFamily: 'Nunito, sans-serif' }}>
                  {pet.name}
                </h1>
                <Badge 
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    pet.status === 'available' ? 'bg-green-100 text-green-800' :
                    pet.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}
                >
                  {capitalizeFirst(pet.status)}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center text-gray-600">
                  <Info className="w-4 h-4 mr-2" />
                  {capitalizeFirst(pet.breed)} • {capitalizeFirst(pet.gender)}
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  {formatAge(pet.age)}
                </div>
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  {formatLocation(pet.location)}
                </div>
              </div>

              <p className="text-gray-700 mb-6 leading-relaxed">
                {pet.description}
              </p>

              {pet.status === 'available' && isAuthenticated && (
                <div className="space-y-4">
                  <AdoptionModal pet={pet}>
                    <Button className="w-full gradient-coral-peach text-white py-3 rounded-xl font-semibold text-lg hover:shadow-lg transition-all duration-300">
                      <Heart className="w-5 h-5 mr-2" />
                      Apply to Adopt {pet.name}
                    </Button>
                  </AdoptionModal>
                  <Button variant="outline" className="w-full border-coral text-coral hover:bg-coral hover:text-white py-3 rounded-xl font-semibold transition-all duration-300">
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Schedule a Meet & Greet
                  </Button>
                </div>
              )}
              {pet.status === 'available' && !isAuthenticated && (
                <div className="space-y-4">
                  <Button className="w-full gradient-coral-peach text-white py-3 rounded-xl font-semibold text-lg hover:shadow-lg transition-all duration-300" onClick={() => window.location.href = "/login"}>
                    <Heart className="w-5 h-5 mr-2" />
                    <span>Sign in to Apply to Adopt</span>
                  </Button>
                  <Button variant="outline" className="w-full border-coral text-coral hover:bg-coral hover:text-white py-3 rounded-xl font-semibold transition-all duration-300">
                    <MessageCircle className="w-5 h-5 mr-2" />
                    <span>Schedule a Meet & Greet</span>
                  </Button>
                </div>
              )}
              
              {pet.status === 'pending' && (
                <div className="text-center py-4">
                  <Badge className="bg-yellow-100 text-yellow-800 px-4 py-2 text-lg">
                    Adoption Pending
                  </Badge>
                  <p className="text-gray-600 mt-2">This pet has an adoption application in progress.</p>
                </div>
              )}
              
              {pet.status === 'adopted' && (
                <div className="text-center py-4">
                  <Badge className="bg-green-100 text-green-800 px-4 py-2 text-lg">
                    Adopted
                  </Badge>
                  <p className="text-gray-600 mt-2">This pet has found their forever home!</p>
                </div>
              )}
            </div>
          </div>

          {/* Additional Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Personality */}
            {pet.personality && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold text-xl text-gray-800 mb-4" style={{ fontFamily: 'Nunito, sans-serif' }}>
                    Personality
                  </h3>
                  <div className="space-y-2">
                    {Object.entries(pet.personality as Record<string, any>).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                        <span className="font-medium">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Care Needs */}
            {pet.careNeeds && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold text-xl text-gray-800 mb-4" style={{ fontFamily: 'Nunito, sans-serif' }}>
                    Care Needs
                  </h3>
                  <div className="space-y-2">
                    {Object.entries(pet.careNeeds as Record<string, any>).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                        <span className="font-medium">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Pet Documents */}
          {pet.documentsUrl && typeof pet.documentsUrl === 'string' && (
            <Card className="mt-8">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="h-6 w-6 text-coral" />
                  <h3 className="font-bold text-xl text-gray-800" style={{ fontFamily: 'Nunito, sans-serif' }}>
                    Pet Documents
                  </h3>
                </div>
                <p className="text-gray-600 mb-4">
                  View {pet.name}'s documents including vet records, adoption papers, and other important information.
                </p>
                <DocumentViewer 
                  documentUrl={pet.documentsUrl} 
                  documentName={`${pet.name}'s Documents`}
                >
                  <Button className="gradient-coral-peach text-white hover:shadow-lg transition-all duration-300">
                    <Eye className="w-4 h-4 mr-2" />
                    View Documents
                  </Button>
                </DocumentViewer>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
