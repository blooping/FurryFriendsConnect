import Header from "@/components/header";
import HeroSection from "@/components/hero-section";
import FeaturedPets from "@/components/featured-pets";
import AIMatchingSection from "@/components/ai-matching-section";
import PetCareResources from "@/components/pet-care-resources";
import ContactForm from "@/components/contact-form";
import Footer from "@/components/footer";
import AIChat from "@/components/ai-chat";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender to-mint">
      <Header />
      <HeroSection />
      <FeaturedPets />
      <AIMatchingSection />
      <PetCareResources />
      <ContactForm />
      <Footer />
      <AIChat />
    </div>
  );
}
