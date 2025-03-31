'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  BoltIcon, 
  ArrowTrendingDownIcon, 
  ClockIcon,
  CurrencyDollarIcon 
} from '@heroicons/react/24/outline';

// Sample data (to be replaced with actual API data)
const sampleData = {
  currentUsage: 3.2, // kWh
  averageUsage: 4.5, // kWh
  savingsPotential: 15, // percentage
  peakHours: '6 PM - 9 PM',
  estimatedBill: 4500, // LKR
};

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState(sampleData);
  const [hasUploadedData, setHasUploadedData] = useState(false);
  
  // Mock loading effect
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Fetch data from the API
    const fetchData = async () => {
      try {
        const response = await fetch('/api/energy-data');
        const apiData = await response.json();
        
        console.log('API Data:', apiData);
        
        if (apiData.data && apiData.data.length > 0 && apiData.predictions) {
          // We have actual uploaded data
          setHasUploadedData(true);
          
          // Calculate average daily usage
          const avgUsage = apiData.predictions.predictedUsage || 0;
          
          // Update dashboard with real data
          setDashboardData({
            currentUsage: avgUsage,
            averageUsage: avgUsage * 1.1, // Just for comparison
            savingsPotential: Math.round(apiData.predictions.savings.potential) || 15,
            peakHours: apiData.predictions.peakHours || '6 PM - 9 PM',
            estimatedBill: Math.round(apiData.predictions.predictedBill) || 4500,
          });
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  return (
    <DashboardLayout active="dashboard">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600">Overview of your home energy usage</p>
        {hasUploadedData && (
          <p className="text-green-600 mt-1">
            Using your uploaded energy data for analysis
          </p>
        )}
      </div>
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Current Usage */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                <BoltIcon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Current Usage</p>
                <p className="text-2xl font-bold">{dashboardData.currentUsage} kWh</p>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              {dashboardData.currentUsage < dashboardData.averageUsage 
                ? <span className="text-green-600">Below average</span> 
                : <span className="text-red-600">Above average</span>
              }
            </div>
          </div>
          
          {/* Savings Potential */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                <ArrowTrendingDownIcon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Savings Potential</p>
                <p className="text-2xl font-bold">{dashboardData.savingsPotential}%</p>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              Based on your current usage patterns
            </div>
          </div>
          
          {/* Peak Hours */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
                <ClockIcon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Peak Hours</p>
                <p className="text-2xl font-bold">{dashboardData.peakHours}</p>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              Try to reduce usage during these hours
            </div>
          </div>
          
          {/* Estimated Bill */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                <CurrencyDollarIcon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Estimated Bill</p>
                <p className="text-2xl font-bold">{dashboardData.estimatedBill} LKR</p>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              Projected for current month
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Recommendations</h2>
        <div className="bg-white rounded-lg shadow p-6">
          <ul className="space-y-4">
            <li className="flex items-start">
              <div className="flex-shrink-0 p-2 rounded-full bg-blue-100 text-blue-600 mr-4">
                <BoltIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Use AC between 8 PM – 10 PM for cost efficiency.</p>
                <p className="text-sm text-gray-600 mt-1">
                  Running your air conditioner during these hours can save up to 12% on energy costs.
                </p>
              </div>
            </li>
            <li className="flex items-start">
              <div className="flex-shrink-0 p-2 rounded-full bg-blue-100 text-blue-600 mr-4">
                <BoltIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Shift washing machine usage to 11 AM – 1 PM to reduce load.</p>
                <p className="text-sm text-gray-600 mt-1">
                  Using your washing machine during off-peak hours helps balance the grid and reduces your energy costs.
                </p>
              </div>
            </li>
          </ul>
        </div>
      </div>
      
      {!hasUploadedData && (
        <div className="mt-8 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <h3 className="font-medium text-yellow-800 mb-2">No Data Uploaded Yet</h3>
          <p className="text-yellow-700">
            For more accurate predictions and personalized recommendations, please upload your energy usage data on the 
            <a href="/dashboard/data-upload" className="underline font-medium ml-1">Data Upload</a> page.
          </p>
        </div>
      )}
    </DashboardLayout>
  );
} 