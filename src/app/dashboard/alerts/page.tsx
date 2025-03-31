'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  BellAlertIcon, 
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
  BoltIcon,
  ClockIcon,
  CurrencyDollarIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

// Sample alerts data (to be replaced with API data)
const sampleAlerts = [
  {
    id: 1,
    type: 'warning',
    title: 'High Energy Usage Detected',
    message: 'Your energy usage for the past 3 hours is 40% higher than your usual consumption.',
    timestamp: 'Today, 2:15 PM',
    read: false,
  },
  {
    id: 2,
    type: 'info',
    title: 'Off-peak Hours Started',
    message: 'Off-peak hours have started. This is a good time to run your washing machine and other high-power appliances.',
    timestamp: 'Today, 10:00 AM',
    read: false,
  },
  {
    id: 3,
    type: 'warning',
    title: 'AC Running During Peak Hours',
    message: 'Your air conditioner is running during peak electricity hours. Consider adjusting the temperature or timing to save on your bill.',
    timestamp: 'Yesterday, 6:30 PM',
    read: true,
  },
  {
    id: 4,
    type: 'info',
    title: 'Weekly Energy Report Available',
    message: 'Your weekly energy consumption report is now available. You used 15% less energy compared to last week.',
    timestamp: 'Mar 28, 9:00 AM',
    read: true,
  },
  {
    id: 5,
    type: 'warning',
    title: 'Approaching Monthly Budget',
    message: 'You have used 85% of your monthly energy budget, and there are still 8 days left in the billing cycle.',
    timestamp: 'Mar 27, 3:45 PM',
    read: true,
  },
];

// Sample alert settings
const alertSettings = [
  {
    id: 'high-usage',
    name: 'High Usage Alerts',
    description: 'Notify when energy usage exceeds your typical consumption',
    enabled: true,
    icon: BoltIcon,
  },
  {
    id: 'peak-hours',
    name: 'Peak Hour Alerts',
    description: 'Remind you when peak and off-peak hours begin',
    enabled: true,
    icon: ClockIcon,
  },
  {
    id: 'budget',
    name: 'Budget Alerts',
    description: 'Alert when approaching your monthly energy budget',
    enabled: true,
    icon: CurrencyDollarIcon,
  },
  {
    id: 'weekly-report',
    name: 'Weekly Report Notifications',
    description: 'Send weekly energy usage summary reports',
    enabled: false,
    icon: InformationCircleIcon,
  },
];

export default function Alerts() {
  const [alerts, setAlerts] = useState(sampleAlerts);
  const [settings, setSettings] = useState(alertSettings);
  const [view, setView] = useState<'alerts' | 'settings'>('alerts');
  
  const dismissAlert = (id: number) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
  };
  
  const markAllAsRead = () => {
    setAlerts(alerts.map(alert => ({ ...alert, read: true })));
  };
  
  const toggleSetting = (id: string) => {
    setSettings(settings.map(setting => 
      setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
    ));
  };
  
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <ExclamationTriangleIcon className="h-6 w-6" />;
      case 'info':
        return <InformationCircleIcon className="h-6 w-6" />;
      default:
        return <InformationCircleIcon className="h-6 w-6" />;
    }
  };
  
  const getAlertColor = (type: string) => {
    switch (type) {
      case 'warning':
        return 'bg-orange-100 text-orange-600';
      case 'info':
        return 'bg-blue-100 text-blue-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };
  
  const unreadCount = alerts.filter(alert => !alert.read).length;
  
  return (
    <DashboardLayout active="alerts">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Alerts & Notifications</h1>
        <p className="text-gray-600">Stay informed about your energy usage patterns</p>
      </div>
      
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center mb-4 sm:mb-0">
          <div className="flex items-center bg-white rounded-lg shadow px-4 py-2 mr-4">
            <BellAlertIcon className="h-5 w-5 text-gray-500 mr-2" />
            <span className="text-gray-800 font-medium">
              {unreadCount} Unread {unreadCount === 1 ? 'Alert' : 'Alerts'}
            </span>
          </div>
          
          {unreadCount > 0 && (
            <button 
              onClick={markAllAsRead}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Mark all as read
            </button>
          )}
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setView('alerts')}
            className={`px-4 py-2 rounded-lg ${
              view === 'alerts' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Alerts
          </button>
          <button
            onClick={() => setView('settings')}
            className={`px-4 py-2 rounded-lg ${
              view === 'settings' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Notification Settings
          </button>
        </div>
      </div>
      
      {view === 'alerts' ? (
        <div className="bg-white rounded-lg shadow">
          {alerts.length > 0 ? (
            <div className="divide-y">
              {alerts.map((alert) => (
                <div 
                  key={alert.id} 
                  className={`p-4 ${!alert.read ? 'bg-blue-50' : ''}`}
                >
                  <div className="flex items-start">
                    <div className={`flex-shrink-0 p-2 rounded-full mr-4 ${getAlertColor(alert.type)}`}>
                      {getAlertIcon(alert.type)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-gray-800">{alert.title}</h3>
                          <p className="text-sm text-gray-500">{alert.timestamp}</p>
                        </div>
                        
                        <button 
                          onClick={() => dismissAlert(alert.id)}
                          className="p-1 rounded-full hover:bg-gray-200"
                        >
                          <XMarkIcon className="h-5 w-5 text-gray-500" />
                        </button>
                      </div>
                      
                      <p className="mt-2 text-gray-600">{alert.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <BellAlertIcon className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-1">No Alerts</h3>
              <p className="text-gray-500">You don't have any alerts at this moment.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Notification Settings</h2>
          
          <div className="space-y-6">
            {settings.map((setting) => (
              <div key={setting.id} className="flex items-start justify-between">
                <div className="flex items-start">
                  <div className="p-2 rounded-full bg-blue-100 text-blue-600 mr-4">
                    <setting.icon className="h-6 w-6" />
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-800">{setting.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{setting.description}</p>
                  </div>
                </div>
                
                <label className="inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={setting.enabled}
                    onChange={() => toggleSetting(setting.id)}
                  />
                  <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            ))}
          </div>
          
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0 p-2 rounded-full bg-blue-100 text-blue-600 mr-4">
                <Cog6ToothIcon className="h-6 w-6" />
              </div>
              
              <div>
                <h3 className="font-medium text-blue-800">Notification Delivery</h3>
                <p className="mt-1 text-blue-700">
                  You can receive notifications through this dashboard, email, or mobile push notifications. 
                  Configure your delivery preferences in your profile settings.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
} 