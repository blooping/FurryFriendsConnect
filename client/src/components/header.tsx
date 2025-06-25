import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X, Heart, Bell } from "lucide-react";
import LoadingSpinner from "@/components/ui/loading-spinner";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  type Notification = {
    id: number;
    userId: number;
    type: string;
    message: string;
    isRead: boolean;
    createdAt: string | Date;
    data?: any;
  };
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    fetch("/api/me", { credentials: "include" })
      .then(res => setIsAuthenticated(res.status === 200))
      .catch(() => setIsAuthenticated(false))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      const fetchNotifications = () => {
        fetch("/api/notifications", { credentials: "include" })
          .then(res => res.json())
          .then(setNotifications);
      };
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [loading, isAuthenticated]);

  const unreadCount = notifications.filter((n: Notification) => !n.isRead).length;
  const handleBellClick = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications && unreadCount > 0) {
      notifications.filter((n: Notification) => !n.isRead).forEach(n => {
        fetch(`/api/notifications/${n.id}/read`, { method: "POST", credentials: "include" })
          .then(() => setNotifications((notifications: Notification[]) => notifications.map(x => x.id === n.id ? { ...x, isRead: true } : x)));
      });
    }
  };

  if (loading) {
    return (
      <nav className="bg-white/90 backdrop-blur-md shadow-lg sticky top-0 z-50 h-16 flex items-center justify-center">
        <LoadingSpinner size={32} />
      </nav>
    );
  }

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
            {isAuthenticated && (
              <Link href="/submit-pet" className="text-gray-700 hover:text-coral transition-colors">
                Submit Pet
              </Link>
            )}
            {/* Only show AI Matching if authenticated */}
            {isAuthenticated && (
              <Link href="/ai-matching" className="text-gray-700 hover:text-coral transition-colors">
                AI Matching
              </Link>
            )}
            {isAuthenticated && (
              <Link href="/profile" className="text-gray-700 hover:text-coral transition-colors">
                Profile
              </Link>
            )}
            <Link href="/pet-care" className="text-gray-700 hover:text-coral transition-colors">Pet Care</Link>
          </div>

          <div className="flex items-center space-x-4">
            {!isAuthenticated && (
              <Link href="/login">
                <Button className="gradient-coral-peach text-white px-6 py-2 rounded-full hover:shadow-lg transition-all duration-300 font-medium">
                  Sign In
                </Button>
              </Link>
            )}
            <button 
              className="md:hidden text-gray-700"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            {/* Notification Bell */}
            {isAuthenticated && (
              <div className="relative">
                <button onClick={handleBellClick} className="relative p-2 rounded-full hover:bg-gray-100 focus:outline-none">
                  <Bell className="h-6 w-6 text-gray-700" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-coral text-white text-xs rounded-full px-1.5 py-0.5">{unreadCount}</span>
                  )}
                </button>
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-lg z-50 border border-gray-200 max-h-96 overflow-y-auto">
                    <div className="p-4 border-b font-semibold text-coral">Notifications</div>
                    {notifications.length === 0 ? (
                      <div className="p-4 text-gray-500">No notifications.</div>
                    ) : (
                      notifications.map((n: Notification) => (
                        <div key={n.id} className={`px-4 py-3 border-b last:border-b-0 ${n.isRead ? "bg-white" : "bg-peach/20"}`}>
                          <div className="text-gray-800 text-sm">{n.message}</div>
                          <div className="text-xs text-gray-500 mt-1">{new Date(n.createdAt).toLocaleString()}</div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              <Link href="/pets" className="text-gray-700 hover:text-coral transition-colors">
                Find Pets
              </Link>
              {isAuthenticated && (
                <Link href="/submit-pet" className="text-gray-700 hover:text-coral transition-colors">
                  Submit Pet
                </Link>
              )}
              {/* Only show AI Matching if authenticated in mobile menu */}
              {isAuthenticated && (
                <Link href="/ai-matching" className="text-gray-700 hover:text-coral transition-colors">
                  AI Matching
                </Link>
              )}
              {isAuthenticated && (
                <Link href="/profile" className="text-gray-700 hover:text-coral transition-colors">
                  Profile
                </Link>
              )}
              <Link href="/pet-care" className="text-gray-700 hover:text-coral transition-colors">Pet Care</Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
