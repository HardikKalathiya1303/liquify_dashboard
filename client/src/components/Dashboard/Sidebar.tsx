import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

export default function Sidebar({ isOpen, toggleSidebar }: SidebarProps) {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { path: "/", label: "Dashboard", icon: "ri-dashboard-line" },
    { path: "/loans", label: "Loans", icon: "ri-funds-line" },
    { path: "/transactions", label: "Transactions", icon: "ri-exchange-funds-line" },
    { path: "/analytics", label: "Analytics", icon: "ri-pie-chart-line" },
    { path: "/profile", label: "Profile", icon: "ri-user-settings-line" },
    { path: "/settings", label: "Settings", icon: "ri-settings-3-line" },
  ];

  const handleLogout = async () => {
    await logout();
  };

  return (
    <aside className={`w-64 bg-dark-card transition-all duration-300 ${isOpen ? 'block' : 'hidden'} md:block h-screen fixed z-10`}>
      <div className="flex flex-col h-full">
        <div className="p-5">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <i className="ri-money-dollar-circle-line text-white text-xl"></i>
            </div>
            <span className="text-xl font-semibold text-white">Liquify</span>
          </div>
        </div>
        
        <nav className="mt-5 flex-1 px-3 space-y-1">
          {navItems.map((item) => (
            <Link 
              key={item.path} 
              href={item.path}
              className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg ${
                location === item.path 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-300 hover:bg-gray-700'
              } group`}
            >
              <i className={`${item.icon} mr-3 text-xl`}></i>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        
        {user && (
          <div className="p-4 mt-auto">
            <div className="bg-dark-card-hover rounded-lg p-3">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                  {user.fullName.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-white">{user.fullName}</p>
                  <p className="text-xs text-gray-400">Premium Member</p>
                </div>
                <div className="ml-auto">
                  <button className="text-gray-400 hover:text-white" onClick={handleLogout}>
                    <i className="ri-logout-box-r-line"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
