import { useState, useEffect, useRef } from "react";
import { useTheme } from "@/components/ui/theme-provider";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "wouter";

interface HeaderProps {
  toggleSidebar: () => void;
  title?: string;
}

export default function Header({ toggleSidebar, title = "Financial Dashboard" }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [, setLocation] = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setNotificationOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleLogout = async () => {
    await logout();
  };

  const formatDate = () => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date().toLocaleDateString('en-US', options);
  };

  return (
    <header className="bg-gray-900 border-b border-gray-800 py-3 px-4 md:px-6 flex justify-between items-center sticky top-0 z-20">
      <div className="flex items-center">
        <button 
          className="mr-4 text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800 md:hidden"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          <i className="ri-menu-line text-xl"></i>
        </button>
        <div>
          <h1 className="text-lg font-bold text-white mb-0.5">{title}</h1>
          <p className="text-xs text-gray-400 hidden md:block">{formatDate()}</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        <div className="hidden md:flex relative">
          <input 
            type="text" 
            placeholder="Search..." 
            className="bg-gray-800 text-sm rounded-lg py-2 pl-10 pr-4 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-300"
          />
          <i className="ri-search-line absolute left-3 top-2.5 text-gray-400"></i>
        </div>
        
        <div className="relative" ref={notificationRef}>
          <button 
            className="relative p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            onClick={() => setNotificationOpen(!notificationOpen)}
            aria-label="Notifications"
          >
            <i className="ri-notification-3-line text-xl"></i>
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
          {notificationOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-lg shadow-lg py-2 bg-gray-800 border border-gray-700 ring-1 ring-black ring-opacity-5 z-50">
              <div className="px-4 py-2 border-b border-gray-700">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-semibold text-white">Notifications</h3>
                  <span className="text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded-md">3 new</span>
                </div>
              </div>
              <div className="max-h-60 overflow-y-auto">
                <div className="px-4 py-3 hover:bg-gray-750 cursor-pointer border-l-2 border-blue-500">
                  <div className="flex">
                    <div className="w-8 h-8 rounded-full bg-blue-500 bg-opacity-20 flex items-center justify-center text-blue-500 mr-3 flex-shrink-0">
                      <i className="ri-calendar-check-line"></i>
                    </div>
                    <div>
                      <p className="text-sm text-white font-medium">EMI Payment Due</p>
                      <p className="text-xs text-gray-400">Your EMI payment of ₹32,500 is due in 7 days</p>
                      <p className="text-xs text-gray-500 mt-1">3 hours ago</p>
                    </div>
                  </div>
                </div>
                <div className="px-4 py-3 hover:bg-gray-750 cursor-pointer border-l-2 border-green-500">
                  <div className="flex">
                    <div className="w-8 h-8 rounded-full bg-green-500 bg-opacity-20 flex items-center justify-center text-green-500 mr-3 flex-shrink-0">
                      <i className="ri-bank-card-line"></i>
                    </div>
                    <div>
                      <p className="text-sm text-white font-medium">Loan Approved</p>
                      <p className="text-xs text-gray-400">Your loan application #LN73928 has been approved</p>
                      <p className="text-xs text-gray-500 mt-1">Yesterday</p>
                    </div>
                  </div>
                </div>
                <div className="px-4 py-3 hover:bg-gray-750 cursor-pointer">
                  <div className="flex">
                    <div className="w-8 h-8 rounded-full bg-purple-500 bg-opacity-20 flex items-center justify-center text-purple-500 mr-3 flex-shrink-0">
                      <i className="ri-funds-line"></i>
                    </div>
                    <div>
                      <p className="text-sm text-white font-medium">Investment Update</p>
                      <p className="text-xs text-gray-400">Your mutual funds have grown by 2.3% this month</p>
                      <p className="text-xs text-gray-500 mt-1">2 days ago</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-4 py-2 border-t border-gray-700">
                <button className="text-xs text-blue-400 hover:text-blue-300 w-full text-center">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>
        
        <button 
          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          <i className={theme === "dark" ? "ri-moon-line text-xl" : "ri-sun-line text-xl"}></i>
        </button>
        
        {user && (
          <div className="relative" ref={dropdownRef}>
            <button 
              className="flex items-center bg-gray-800 hover:bg-gray-750 rounded-lg px-2 py-1.5 text-gray-300 hover:text-white transition-colors"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-medium mr-2">
                {user?.fullName.split(' ').map(n => n[0]).join('')}
              </div>
              <span className="hidden md:block text-sm font-medium mr-1">{user?.fullName?.split(' ')[0]}</span>
              <i className={`ri-arrow-down-s-line transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}></i>
            </button>
            
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-lg shadow-lg py-2 bg-gray-800 border border-gray-700 ring-1 ring-black ring-opacity-5 z-50">
                <div className="px-4 py-2 border-b border-gray-700">
                  <p className="text-sm font-medium text-white">{user?.fullName}</p>
                  <p className="text-xs text-gray-400">{user?.email}</p>
                </div>
                <button 
                  className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-750 flex items-center"
                  onClick={() => {
                    setDropdownOpen(false);
                    setLocation("/profile");
                  }}
                >
                  <i className="ri-user-settings-line mr-2 text-gray-400"></i> My Profile
                </button>
                <button 
                  className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-750 flex items-center"
                  onClick={() => {
                    setDropdownOpen(false);
                    setLocation("/settings");
                  }}
                >
                  <i className="ri-settings-3-line mr-2 text-gray-400"></i> Settings
                </button>
                <button 
                  className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-750 flex items-center"
                  onClick={() => {
                    setDropdownOpen(false);
                    setLocation("/loans/apply");
                  }}
                >
                  <i className="ri-bank-card-line mr-2 text-gray-400"></i> Apply for Loan
                </button>
                <div className="border-t border-gray-700 my-1"></div>
                <button 
                  className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-750 flex items-center"
                  onClick={handleLogout}
                >
                  <i className="ri-logout-box-r-line mr-2"></i> Sign out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
