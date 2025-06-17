import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X, Heart } from "lucide-react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white/90 backdrop-blur-md shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/">
            <div className="flex items-center space-x-3 cursor-pointer">
              <div className="gradient-coral-peach p-2 rounded-full">
                <Heart className="text-white h-6 w-6" />
              </div>
              <span className="font-bold text-2xl text-gray-800" style={{ fontFamily: 'Nunito, sans-serif' }}>
                FurryFriends
              </span>
            </div>
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/pets" className="text-gray-700 hover:text-coral transition-colors">
              Find Pets
            </Link>
            <Link href="/submit-pet" className="text-gray-700 hover:text-coral transition-colors">
              Submit Pet
            </Link>
            <Link href="/ai-matching" className="text-gray-700 hover:text-coral transition-colors">
              AI Matching
            </Link>
            <a href="#pet-care" className="text-gray-700 hover:text-coral transition-colors">Pet Care</a>
          </div>

          <div className="flex items-center space-x-4">
            <Button className="gradient-coral-peach text-white px-6 py-2 rounded-full hover:shadow-lg transition-all duration-300 font-medium">
              Sign In
            </Button>
            <button 
              className="md:hidden text-gray-700"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              <Link href="/pets" className="text-gray-700 hover:text-coral transition-colors">
                Find Pets
              </Link>
              <Link href="/submit-pet" className="text-gray-700 hover:text-coral transition-colors">
                Submit Pet
              </Link>
              <Link href="/ai-matching" className="text-gray-700 hover:text-coral transition-colors">
                AI Matching
              </Link>
              <a href="#pet-care" className="text-gray-700 hover:text-coral transition-colors">Pet Care</a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
