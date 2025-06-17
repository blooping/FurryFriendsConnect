import { Link } from "wouter";
import { Heart, Mail, Phone, MapPin } from "lucide-react";
import { FaFacebookF, FaTwitter, FaInstagram } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link href="/">
              <div className="flex items-center space-x-3 mb-4 cursor-pointer">
                <div className="gradient-coral-peach p-2 rounded-full">
                  <Heart className="text-white h-5 w-5" />
                </div>
                <span className="font-bold text-xl" style={{ fontFamily: 'Nunito, sans-serif' }}>FurryFriends</span>
              </div>
            </Link>
            <p className="text-gray-400 mb-4">Connecting loving pets with their forever families through AI-powered matching.</p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-coral transition-colors">
                <FaFacebookF />
              </a>
              <a href="#" className="text-gray-400 hover:text-coral transition-colors">
                <FaTwitter />
              </a>
              <a href="#" className="text-gray-400 hover:text-coral transition-colors">
                <FaInstagram />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-4" style={{ fontFamily: 'Nunito, sans-serif' }}>Find Pets</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/pets?type=dog"><a className="hover:text-white transition-colors">Dogs</a></Link></li>
              <li><Link href="/pets?type=cat"><a className="hover:text-white transition-colors">Cats</a></Link></li>
              <li><Link href="/pets?type=rabbit"><a className="hover:text-white transition-colors">Rabbits</a></Link></li>
              <li><Link href="/pets?type=bird"><a className="hover:text-white transition-colors">Birds</a></Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-4" style={{ fontFamily: 'Nunito, sans-serif' }}>Resources</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#pet-care" className="hover:text-white transition-colors">Pet Care Guide</a></li>
              <li><a href="#pet-care" className="hover:text-white transition-colors">Training Tips</a></li>
              <li><a href="#pet-care" className="hover:text-white transition-colors">Health & Wellness</a></li>
              <li><Link href="/ai-matching"><a className="hover:text-white transition-colors">AI Matching</a></Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-4" style={{ fontFamily: 'Nunito, sans-serif' }}>Contact</h4>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-center"><Mail className="mr-2 h-4 w-4" />hello@furryfriends.com</li>
              <li className="flex items-center"><Phone className="mr-2 h-4 w-4" />+1 (555) 123-4567</li>
              <li className="flex items-center"><MapPin className="mr-2 h-4 w-4" />San Francisco, CA</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 FurryFriends. All rights reserved. | Privacy Policy | Terms of Service</p>
        </div>
      </div>
    </footer>
  );
}
