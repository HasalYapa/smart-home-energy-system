'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title, 
  Tooltip, 
  Legend, 
  ChartData, 
  ChartOptions 
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Sample data (to be replaced with API data)
const dailyUsageData = {
  labels: ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'],
  datasets: [
    {
      label: 'kWh',
      data: [2.1, 1.8, 1.5, 3.8, 4.2, 3.5, 5.2, 4.9],
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.5)',
      tension: 0.3,
    },
  ],
};

const weeklyUsageData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [
    {
      label: 'kWh',
      data: [28.5, 31.2, 29.8, 32.1, 33.5, 38.2, 36.1],
      backgroundColor: 'rgba(59, 130, 246, 0.8)',
    },
  ],
};

const monthlyUsageData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  datasets: [
    {
      label: 'kWh',
      data: [320, 350, 390, 420, 450, 480, 510, 520, 480, 450, 400, 360],
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.5)',
      tension: 0.3,
    },
  ],
};

const appliancessData = {
  labels: ['AC', 'Refrigerator', 'Washing Machine', 'TV', 'Lights', 'Water Heater', 'Other'],
  datasets: [
    {
      label: 'kWh',
      data: [125, 85, 60, 40, 35, 95, 70],
      backgroundColor: [
        'rgba(255, 99, 132, 0.8)',
        'rgba(54, 162, 235, 0.8)',
        'rgba(255, 206, 86, 0.8)',
        'rgba(75, 192, 192, 0.8)',
        'rgba(153, 102, 255, 0.8)',
        'rgba(255, 159, 64, 0.8)',
        'rgba(199, 199, 199, 0.8)',
      ],
    },
  ],
};

const chartOptions: ChartOptions<'line'> = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: false,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: 'Energy (kWh)',
      },
    },
  },
};

const barChartOptions: ChartOptions<'bar'> = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: false,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: 'Energy (kWh)',
      },
    },
  },
};

export default function EnergyUsage() {
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [hasUploadedData, setHasUploadedData] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // State for chart data
  const [energyData, setEnergyData] = useState({
    daily: dailyUsageData,
    weekly: weeklyUsageData,
    monthly: monthlyUsageData,
    appliances: appliancessData
  });
  
  useEffect(() => {
    // Fetch data from API
    const fetchData = async () => {
      try {
        const response = await fetch('/api/energy-data');
        const apiData = await response.json();
        
        console.log('Energy Usage API Data:', apiData);
        
        if (apiData.data && apiData.data.length > 0) {
          setHasUploadedData(true);
          
          // Process the data for charts
          const uploadedData = apiData.data;
          
          // Extract dates and energy usage
          const dates = uploadedData.map((item: any) => item.date);
          const usage = uploadedData.map((item: any) => item.totalKwh);
          
          // Collect all appliance data
          const applianceMap: {[key: string]: number} = {};
          uploadedData.forEach((item: any) => {
            if (item.appliances && item.appliances.length > 0) {
              item.appliances.forEach((appliance: any) => {
                if (appliance.name && appliance.kwh) {
                  if (!applianceMap[appliance.name]) {
                    applianceMap[appliance.name] = 0;
                  }
                  applianceMap[appliance.name] += appliance.kwh;
                }
              });
            }
          });
          
          // Create daily data from uploaded data
          const updatedDailyData = {
            labels: dates,
            datasets: [
              {
                label: 'kWh',
                data: usage,
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
                tension: 0.3,
              },
            ],
          };
          
          // Create appliance breakdown
          const applianceLabels = Object.keys(applianceMap);
          const applianceValues = Object.values(applianceMap);
          
          const updatedApplianceData = {
            labels: applianceLabels,
            datasets: [
              {
                label: 'kWh',
                data: applianceValues,
                backgroundColor: [
                  'rgba(255, 99, 132, 0.8)',
                  'rgba(54, 162, 235, 0.8)',
                  'rgba(255, 206, 86, 0.8)',
                  'rgba(75, 192, 192, 0.8)',
                  'rgba(153, 102, 255, 0.8)',
                  'rgba(255, 159, 64, 0.8)',
                  'rgba(199, 199, 199, 0.8)',
                ],
              },
            ],
          };
          
          // Update state with the new data
          setEnergyData(prev => ({
            ...prev,
            daily: updatedDailyData,
            appliances: updatedApplianceData
          }));
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching energy usage data:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const getChartData = () => {
    switch (timeframe) {
      case 'daily':
        return energyData.daily;
      case 'weekly':
        return energyData.weekly;
      case 'monthly':
        return energyData.monthly;
      default:
        return energyData.daily;
    }
  };
  
  // Find highest consumption appliance for insights
  const getHighestConsumptionAppliance = () => {
    if (!energyData.appliances.labels || energyData.appliances.labels.length === 0) {
      return { name: 'AC', usage: 125, percentage: 24.5 };
    }
    
    const maxIndex = energyData.appliances.datasets[0].data.indexOf(
      Math.max(...energyData.appliances.datasets[0].data)
    );
    
    const totalUsage = energyData.appliances.datasets[0].data.reduce((sum, val) => sum + val, 0);
    const name = energyData.appliances.labels[maxIndex];
    const usage = energyData.appliances.datasets[0].data[maxIndex];
    const percentage = (usage / totalUsage) * 100;
    
    return { name, usage, percentage: Math.round(percentage * 10) / 10 };
  };
  
  const highestConsumption = getHighestConsumptionAppliance();
  
  return (
    <DashboardLayout active="energy usage">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Energy Usage</h1>
        <p className="text-gray-600">Analyze your energy consumption patterns</p>
        {hasUploadedData && (
          <p className="text-green-600 mt-1">
            Using your uploaded energy data for analysis
          </p>
        )}
      </div>
      
      {loading ? (
        <div className="grid gap-6 animate-pulse">
          <div className="h-80 bg-gray-200 rounded-lg"></div>
          <div className="h-80 bg-gray-200 rounded-lg"></div>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Energy Consumption</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => setTimeframe('daily')}
                  className={`px-4 py-2 rounded-lg ${
                    timeframe === 'daily' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Daily
                </button>
                <button
                  onClick={() => setTimeframe('weekly')}
                  className={`px-4 py-2 rounded-lg ${
                    timeframe === 'weekly' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Weekly
                </button>
                <button
                  onClick={() => setTimeframe('monthly')}
                  className={`px-4 py-2 rounded-lg ${
                    timeframe === 'monthly' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Monthly
                </button>
              </div>
            </div>
            
            <div className="h-80">
              {timeframe === 'weekly' ? (
                <Bar options={barChartOptions} data={getChartData()} />
              ) : (
                <Line options={chartOptions} data={getChartData()} />
              )}
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Appliance Usage Breakdown</h2>
            <div className="h-80">
              <Bar options={barChartOptions} data={energyData.appliances} />
            </div>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium text-gray-800 mb-2">Highest Consumption</h3>
                <p className="text-gray-600">{highestConsumption.name} - {highestConsumption.usage} kWh ({highestConsumption.percentage}%)</p>
                <p className="mt-2 text-sm text-gray-500">
                  Consider using your {highestConsumption.name} during off-peak hours or adjusting its settings 
                  to reduce consumption by up to 20%.
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium text-gray-800 mb-2">Optimization Opportunity</h3>
                <p className="text-gray-600">Shift high-power appliances to off-peak hours</p>
                <p className="mt-2 text-sm text-gray-500">
                  Running energy-intensive appliances during off-peak hours can save you money
                  and help balance the power grid.
                </p>
              </div>
            </div>
          </div>
          
          {!hasUploadedData && (
            <div className="mt-8 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <h3 className="font-medium text-yellow-800 mb-2">Demo Data</h3>
              <p className="text-yellow-700">
                You're currently viewing demo data. For personalized energy usage analysis, please upload your energy data on the 
                <a href="/dashboard/data-upload" className="underline font-medium ml-1">Data Upload</a> page.
              </p>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
} 