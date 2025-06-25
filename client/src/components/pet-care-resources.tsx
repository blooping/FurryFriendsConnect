import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Utensils, GraduationCap, Heart, ArrowRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const nutritionContent = (
  <div className="space-y-3">
    <h4 className="font-semibold text-lg">General Nutrition Tips</h4>
    <ul className="list-disc pl-6 space-y-1">
      <li>Feed your pet a balanced diet appropriate for their age, size, and species.</li>
      <li>Provide fresh, clean water at all times.</li>
      <li>Consult your vet for recommended food brands and portion sizes.</li>
      <li>Avoid feeding pets human food, especially chocolate, onions, grapes, and bones.</li>
      <li>Monitor your pet's weight and adjust food as needed to prevent obesity.</li>
    </ul>
    <h4 className="font-semibold text-lg mt-4">Life Stage Nutrition</h4>
    <ul className="list-disc pl-6 space-y-1">
      <li><b>Puppies/Kittens:</b> Need more calories, protein, and fat for growth.</li>
      <li><b>Adults:</b> Feed maintenance diets and avoid overfeeding treats.</li>
      <li><b>Seniors:</b> May need lower-calorie food and supplements for joint health.</li>
    </ul>
  </div>
);

const trainingContent = (
  <div className="space-y-3">
    <h4 className="font-semibold text-lg">Training Basics</h4>
    <ul className="list-disc pl-6 space-y-1">
      <li>Use positive reinforcement (treats, praise) to encourage good behavior.</li>
      <li>Be consistent with commands and routines.</li>
      <li>Start socialization early—expose your pet to new people, pets, and environments.</li>
      <li>Be patient; training takes time and repetition.</li>
      <li>Enroll in obedience classes if needed for extra support.</li>
    </ul>
    <h4 className="font-semibold text-lg mt-4">Common Training Goals</h4>
    <ul className="list-disc pl-6 space-y-1">
      <li>House training (using litter box or going outside)</li>
      <li>Basic commands: sit, stay, come, down</li>
      <li>Leash walking without pulling</li>
      <li>Discouraging biting, chewing, or scratching</li>
    </ul>
  </div>
);

const healthContent = (
  <div className="space-y-3">
    <h4 className="font-semibold text-lg">Health & Wellness Essentials</h4>
    <ul className="list-disc pl-6 space-y-1">
      <li>Schedule annual vet checkups and keep vaccinations up to date.</li>
      <li>Use flea, tick, and heartworm prevention as recommended by your vet.</li>
      <li>Groom your pet regularly: brush fur, trim nails, clean ears and teeth.</li>
      <li>Watch for signs of illness: changes in appetite, energy, or bathroom habits.</li>
      <li>Keep emergency vet and poison control numbers handy.</li>
    </ul>
    <h4 className="font-semibold text-lg mt-4">Emergency Resources</h4>
    <ul className="list-disc pl-6 space-y-1">
      <li>ASPCA Poison Control: <a href="https://www.aspca.org/pet-care/animal-poison-control" className="text-coral underline" target="_blank" rel="noopener noreferrer">aspca.org/pet-care/animal-poison-control</a></li>
      <li>Find your nearest 24/7 emergency vet clinic in advance.</li>
    </ul>
  </div>
);

export default function PetCareResources() {
  const [openModal, setOpenModal] = useState<null | number>(null);
  const resources = [
    {
      icon: Utensils,
      title: "Nutrition Guide",
      description: "Learn about proper feeding schedules, food types, and nutritional needs for different pets and life stages.",
      bgColor: "from-mint/20 to-powder/20",
      iconBg: "bg-mint",
      content: nutritionContent
    },
    {
      icon: GraduationCap,
      title: "Training Tips", 
      description: "Discover effective training techniques, behavioral tips, and socialization strategies for your new pet.",
      bgColor: "from-butter/20 to-peach/20",
      iconBg: "bg-butter",
      content: trainingContent
    },
    {
      icon: Heart,
      title: "Health & Wellness",
      description: "Essential information about vaccinations, regular checkups, and recognizing signs of illness.",
      bgColor: "from-lavender/20 to-mint/20", 
      iconBg: "bg-lavender",
      content: healthContent
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
              <>
                <Card key={index} className={`bg-gradient-to-br ${resource.bgColor} hover:shadow-lg transition-all duration-300 cursor-pointer group`} onClick={() => setOpenModal(index)}>
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
                <Dialog open={openModal === index} onOpenChange={() => setOpenModal(null)}>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>{resource.title}</DialogTitle>
                    </DialogHeader>
                    {resource.content}
                  </DialogContent>
                </Dialog>
              </>
            );
          })}
        </div>
      </div>
    </section>
  );
}
