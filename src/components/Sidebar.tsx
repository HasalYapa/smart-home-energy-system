'use client';

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
  ArrowLeftOnRectangleIcon
} from '@heroicons/react/24/outline';

interface SidebarProps {
  active: string;
}

export default function Sidebar({ active }: SidebarProps) {
  const router = useRouter();
  
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

  return (
    <div className="flex flex-col h-full bg-gray-800 text-white w-64 px-4 py-8">
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
        >
          <UserCircleIcon className="h-6 w-6 mr-3" />
          <span>Profile Settings</span>
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center p-3 rounded-lg hover:bg-gray-700 transition-colors w-full text-left"
        >
          <ArrowLeftOnRectangleIcon className="h-6 w-6 mr-3" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
} 