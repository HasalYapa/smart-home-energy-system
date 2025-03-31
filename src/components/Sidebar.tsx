'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  HomeIcon, 
  ChartBarIcon, 
  LightBulbIcon, 
  BellAlertIcon, 
  CurrencyDollarIcon,
  ArrowUpTrayIcon,
  UserCircleIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface SidebarProps {
  active: string;
}

export default function Sidebar({ active }: SidebarProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  
  // Check if we're on mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
      // Auto-close sidebar on mobile
      if (window.innerWidth < 768) {
        setIsOpen(false);
      } else {
        setIsOpen(true);
      }
    };
    
    // Initial check
    checkIfMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);
  
  const menuItems = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Energy Usage', href: '/dashboard/energy-usage', icon: ChartBarIcon },
    { name: 'Recommendations', href: '/dashboard/recommendations', icon: LightBulbIcon },
    { name: 'Bill Estimation', href: '/dashboard/bill-estimation', icon: CurrencyDollarIcon },
    { name: 'Alerts', href: '/dashboard/alerts', icon: BellAlertIcon },
    { name: 'Data Upload', href: '/dashboard/data-upload', icon: ArrowUpTrayIcon },
    { name: 'Energy Upload', href: '/dashboard/energy-upload', icon: ArrowUpTrayIcon },
  ];
  
  const handleLogout = () => {
    // Clear logged in status
    localStorage.removeItem('loggedIn');
    // Redirect to login page
    router.push('/auth/login');
  };

  // Close sidebar on mobile after clicking a link
  const handleLinkClick = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Mobile toggle button - fixed position */}
      <button 
        className="md:hidden fixed top-4 left-4 z-30 p-2 rounded-md bg-gray-800 text-white"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
      >
        {isOpen ? (
          <XMarkIcon className="h-6 w-6" />
        ) : (
          <Bars3Icon className="h-6 w-6" />
        )}
      </button>
      
      {/* Overlay for mobile when sidebar is open - helps with accessibility */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div 
        className={`fixed md:static h-full bg-gray-800 text-white z-30 transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${isOpen ? 'w-64' : 'w-0 md:w-64 overflow-hidden'}
        `}
      >
        <div className="flex flex-col h-full px-4 py-8">
          <h1 className="text-2xl font-bold mb-8 text-center">Smart Home Energy</h1>
          <nav className="flex-1">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center p-3 rounded-lg hover:bg-gray-700 transition-colors ${
                      active === item.name.toLowerCase() ? 'bg-blue-600' : ''
                    }`}
                    onClick={handleLinkClick}
                  >
                    <item.icon className="h-6 w-6 mr-3" />
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="mt-auto pt-4 border-t border-gray-700 space-y-2">
            <Link
              href="/auth/profile"
              className="flex items-center p-3 rounded-lg hover:bg-gray-700 transition-colors"
              onClick={handleLinkClick}
            >
              <UserCircleIcon className="h-6 w-6 mr-3" />
              <span>Profile Settings</span>
            </Link>
            <button
              onClick={() => {
                handleLinkClick();
                handleLogout();
              }}
              className="flex items-center p-3 rounded-lg hover:bg-gray-700 transition-colors w-full text-left"
            >
              <ArrowLeftOnRectangleIcon className="h-6 w-6 mr-3" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
} 