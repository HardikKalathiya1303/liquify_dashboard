import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

export default function Sidebar({ isOpen, toggleSidebar }: SidebarProps) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [isMobile, setIsMobile] = useState(false);
  
  // Check if screen is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkIfMobile();
    
    // Add event listener
    window.addEventListener('resize', checkIfMobile);
    
    // Clean up
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const navItems = [
    { path: "/", label: "Dashboard", icon: "ri-dashboard-line" },
    { path: "/loans", label: "Loans", icon: "ri-funds-line" },
    { path: "/loans/apply", label: "Apply for Loan", icon: "ri-bank-card-line" },
    { path: "/transactions", label: "Transactions", icon: "ri-exchange-funds-line" },
    { path: "/analytics", label: "Analytics", icon: "ri-pie-chart-line" },
    { path: "/profile", label: "Profile", icon: "ri-user-settings-line" },
    { path: "/settings", label: "Settings", icon: "ri-settings-3-line" },
  ];

  const handleLogout = async () => {
    await logout();
  };
  
  const handleNavClick = () => {
    if (isMobile) {
      toggleSidebar();
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
      
      {/* Sidebar */}
      <aside 
        className={`w-64 bg-gray-900 border-r border-gray-800 transition-all duration-300 ease-in-out 
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0 h-screen fixed md:sticky top-0 z-30 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900`}
      >
        <div className="flex flex-col h-full">
          <div className="p-5 border-b border-gray-800">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <img 
                  src="/images/liquify-logo.png" 
                  alt="Liquify Logo" 
                  className="h-10"
                  onClick={() => {
                    if (isMobile) toggleSidebar();
                  }}
                />
              </Link>
            </div>
          </div>
          
          <div className="p-4">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-full bg-gray-800 text-gray-300 text-sm rounded-lg px-4 py-2.5 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <i className="ri-search-line absolute left-3 top-2.5 text-gray-400"></i>
            </div>
          </div>
          
          <nav className="mt-2 flex-1 px-3 space-y-1">
            <div className="text-xs uppercase font-semibold text-gray-500 tracking-wider px-3 py-2">
              Main
            </div>
            {navItems.slice(0, 1).map((item) => (
              <Link 
                key={item.path} 
                href={item.path}
                onClick={handleNavClick}
                className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg ${
                  location === item.path 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white' 
                    : 'text-gray-300 hover:bg-gray-800'
                } group transition-colors duration-150`}
              >
                <i className={`${item.icon} mr-3 text-xl ${location === item.path ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}></i>
                <span>{item.label}</span>
              </Link>
            ))}
            
            <div className="text-xs uppercase font-semibold text-gray-500 tracking-wider px-3 py-2 mt-6">
              Finance
            </div>
            {navItems.slice(1, 5).map((item) => (
              <Link 
                key={item.path} 
                href={item.path}
                onClick={handleNavClick}
                className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg ${
                  location === item.path 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white' 
                    : 'text-gray-300 hover:bg-gray-800'
                } group transition-colors duration-150`}
              >
                <i className={`${item.icon} mr-3 text-xl ${location === item.path ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}></i>
                <span>{item.label}</span>
                {item.label === "Loans" && (
                  <span className="ml-auto bg-blue-600 text-xs px-1.5 py-0.5 rounded-md text-white">3</span>
                )}
              </Link>
            ))}
            
            <div className="text-xs uppercase font-semibold text-gray-500 tracking-wider px-3 py-2 mt-6">
              Account
            </div>
            {navItems.slice(5).map((item) => (
              <Link 
                key={item.path} 
                href={item.path}
                onClick={handleNavClick}
                className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg ${
                  location === item.path 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white' 
                    : 'text-gray-300 hover:bg-gray-800'
                } group transition-colors duration-150`}
              >
                <i className={`${item.icon} mr-3 text-xl ${location === item.path ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}></i>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
          
          {user && (
            <div className="p-4 mt-auto border-t border-gray-800">
              <div className="bg-gray-800 hover:bg-gray-750 rounded-lg p-3 transition-colors duration-150 cursor-pointer">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-medium">
                    {user.fullName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-white truncate max-w-[100px]">{user.fullName}</p>
                    <p className="text-xs text-gray-400">Premium Member</p>
                  </div>
                  <div className="ml-auto">
                    <button 
                      className="text-gray-400 hover:text-white p-1.5 rounded-full hover:bg-gray-700 transition-colors duration-150" 
                      onClick={handleLogout}
                      title="Logout"
                    >
                      <i className="ri-logout-box-r-line"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
