import { useTheme } from "@/components/ui/theme-provider";

interface HeaderProps {
  toggleSidebar: () => void;
  title?: string;
}

export default function Header({ toggleSidebar, title = "Financial Dashboard" }: HeaderProps) {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="bg-dark-card border-b border-gray-800 sticky top-0 z-10">
      <div className="flex items-center justify-between h-16 px-4">
        <div className="flex items-center">
          <button 
            className="text-gray-300 hover:text-white mr-4 md:hidden"
            onClick={toggleSidebar}
          >
            <i className="ri-menu-line text-xl"></i>
          </button>
          <h1 className="text-xl font-semibold text-white">{title}</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search..." 
              className="bg-gray-800 text-sm rounded-lg py-2 pl-10 pr-4 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-300"
            />
            <i className="ri-search-line absolute left-3 top-2.5 text-gray-400"></i>
          </div>
          
          <button className="w-9 h-9 flex items-center justify-center rounded-full text-gray-300 hover:bg-gray-700">
            <i className="ri-notification-3-line text-xl"></i>
          </button>
          
          <button 
            className="w-9 h-9 flex items-center justify-center rounded-full text-gray-300 hover:bg-gray-700"
            onClick={toggleTheme}
          >
            <i className={theme === "dark" ? "ri-moon-line text-xl" : "ri-sun-line text-xl"}></i>
          </button>
        </div>
      </div>
    </header>
  );
}
