import Header from "@/components/header";
import Footer from "@/components/footer";
import { Card } from "@/components/ui/card";

export default function PetCarePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender to-mint flex flex-col">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-8 text-center text-coral">Pet Care Resources</h1>
        <div className="grid gap-8 md:grid-cols-2">
          {/* Nutrition Guide */}
          <Card className="p-6 bg-white shadow-md rounded-lg">
            <h2 className="text-xl font-semibold mb-2 text-coral">Nutrition Guide</h2>
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
              <li>Feed pets a balanced diet appropriate for their species, age, and health.</li>
              <li>Provide fresh, clean water at all times.</li>
              <li>Avoid toxic foods: chocolate, grapes, onions, garlic, xylitol, and cooked bones.</li>
              <li>Consult your vet for special dietary needs or allergies.</li>
              <li>Use treats in moderation to avoid obesity.</li>
            </ul>
          </Card>
          {/* Training Tips */}
          <Card className="p-6 bg-white shadow-md rounded-lg">
            <h2 className="text-xl font-semibold mb-2 text-coral">Training Tips</h2>
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
              <li>Use positive reinforcement: reward good behavior with treats or praise.</li>
              <li>Be patient and consistent—short, frequent training sessions work best.</li>
              <li>Socialize pets early with people and other animals.</li>
              <li>Teach basic commands: sit, stay, come, and leave it.</li>
              <li>Never use physical punishment; redirect unwanted behavior instead.</li>
            </ul>
          </Card>
          {/* Health & Wellness */}
          <Card className="p-6 bg-white shadow-md rounded-lg">
            <h2 className="text-xl font-semibold mb-2 text-coral">Health & Wellness</h2>
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
              <li>Schedule regular vet checkups and vaccinations.</li>
              <li>Keep up with flea, tick, and heartworm prevention.</li>
              <li>Groom regularly: brush fur, trim nails, and clean ears as needed.</li>
              <li>Provide daily exercise and mental stimulation.</li>
              <li>Watch for signs of illness: changes in appetite, energy, or behavior.</li>
            </ul>
          </Card>
          {/* Emergency & Safety */}
          <Card className="p-6 bg-white shadow-md rounded-lg">
            <h2 className="text-xl font-semibold mb-2 text-coral">Emergency & Safety</h2>
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
              <li>Keep emergency vet contacts handy.</li>
              <li>Pet-proof your home: secure toxic plants, chemicals, and small objects.</li>
              <li>Microchip and ID tag your pets for easy identification.</li>
              <li>Know basic pet first aid: CPR, wound care, and choking response.</li>
              <li>ASPCA Poison Control: <a href="https://www.aspca.org/pet-care/animal-poison-control" className="text-coral underline" target="_blank" rel="noopener noreferrer">aspca.org/pet-care/animal-poison-control</a></li>
            </ul>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
} 