import { Card, CardContent } from "@/components/ui/card";
import { Utensils, GraduationCap, Heart, ArrowRight } from "lucide-react";

export default function PetCareResources() {
  const resources = [
    {
      icon: Utensils,
      title: "Nutrition Guide",
      description: "Learn about proper feeding schedules, food types, and nutritional needs for different pets and life stages.",
      bgColor: "from-mint/20 to-powder/20",
      iconBg: "bg-mint"
    },
    {
      icon: GraduationCap,
      title: "Training Tips", 
      description: "Discover effective training techniques, behavioral tips, and socialization strategies for your new pet.",
      bgColor: "from-butter/20 to-peach/20",
      iconBg: "bg-butter"
    },
    {
      icon: Heart,
      title: "Health & Wellness",
      description: "Essential information about vaccinations, regular checkups, and recognizing signs of illness.",
      bgColor: "from-lavender/20 to-mint/20", 
      iconBg: "bg-lavender"
    }
  ];

  return (
    <section id="pet-care" className="py-16 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-bold text-4xl text-gray-800 mb-4" style={{ fontFamily: 'Nunito, sans-serif' }}>
            Pet Care Resources
          </h2>
          <p className="text-lg text-gray-600">Everything you need to know about caring for your new furry friend</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {resources.map((resource, index) => {
            const IconComponent = resource.icon;
            return (
              <Card key={index} className={`bg-gradient-to-br ${resource.bgColor} hover:shadow-lg transition-all duration-300 cursor-pointer group`}>
                <CardContent className="p-6">
                  <div className={`${resource.iconBg} p-3 rounded-full w-fit mb-4`}>
                    <IconComponent className="text-gray-700 h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-xl text-gray-800 mb-3" style={{ fontFamily: 'Nunito, sans-serif' }}>
                    {resource.title}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {resource.description}
                  </p>
                  <div className="text-coral font-semibold hover:underline group-hover:text-peach transition-colors flex items-center">
                    Read More <ArrowRight className="ml-1 h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
