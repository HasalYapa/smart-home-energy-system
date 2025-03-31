'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { ChartBarIcon, LightBulbIcon, ClockIcon, ArrowTrendingDownIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { Doughnut } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend,
  ChartOptions 
} from 'chart.js';
import React from 'react';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

// Sample data
const sampleRecommendations = [
  {
    id: 1,
    title: 'Schedule washing machine for off-peak hours',
    description: 'Running your washing machine between 10 PM and 6 AM can reduce your costs by up to 20%.',
    savings: 120,
    impact: 'high' as const,
    category: 'scheduling',
    icon: <ClockIcon className="h-5 w-5" />,
    difficulty: 'easy' as const
  },
  {
    id: 2,
    title: 'Replace remaining incandescent bulbs with LEDs',
    description: 'LED bulbs use up to 80% less energy than incandescent bulbs and last much longer.',
    savings: 85,
    impact: 'medium' as const,
    category: 'appliance',
    icon: <LightBulbIcon className="h-5 w-5" />,
    difficulty: 'easy' as const
  },
  {
    id: 3,
    title: 'Optimize refrigerator temperature',
    description: 'Set your refrigerator to 3-4°C and freezer to -18°C for optimal efficiency.',
    savings: 60,
    impact: 'medium' as const,
    category: 'appliance',
    icon: <ChartBarIcon className="h-5 w-5" />,
    difficulty: 'easy' as const
  },
  {
    id: 4,
    title: 'Reduce AC usage by 1 hour per day',
    description: 'Cutting back on air conditioning by just one hour per day can save significant energy.',
    savings: 180,
    impact: 'high' as const,
    category: 'behavioral',
    icon: <ArrowTrendingDownIcon className="h-5 w-5" />,
    difficulty: 'medium' as const
  },
  {
    id: 5,
    title: 'Unplug electronics when not in use',
    description: 'Many devices continue to draw power even when turned off. Unplug them to eliminate this "phantom power".',
    savings: 45,
    impact: 'low' as const,
    category: 'behavioral',
    icon: <ArrowTrendingDownIcon className="h-5 w-5" />,
    difficulty: 'easy' as const
  },
  {
    id: 6,
    title: 'Install smart power strips',
    description: 'Smart power strips cut power to devices that are in standby mode, reducing phantom energy usage.',
    savings: 70,
    impact: 'medium' as const,
    category: 'appliance',
    icon: <ChartBarIcon className="h-5 w-5" />,
    difficulty: 'medium' as const
  },
];

// Chart configuration
const chartData = {
  labels: ['Easy', 'Medium', 'Hard'],
  datasets: [
    {
      data: [310, 250, 0],
      backgroundColor: ['#4ade80', '#facc15', '#f87171'],
      borderColor: ['#22c55e', '#eab308', '#ef4444'],
      borderWidth: 1,
    },
  ],
};

const chartOptions: ChartOptions<'doughnut'> = {
  responsive: true,
  plugins: {
    legend: {
      position: 'right' as const,
    },
    title: {
      display: true,
      text: 'Potential Monthly Savings by Difficulty',
      font: {
        size: 14,
      }
    },
  },
};

interface Recommendation {
  id: number;
  title: string;
  description: string;
  savings: number;
  impact: 'high' | 'medium' | 'low';
  category: string;
  icon: React.ReactNode;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface InsightData {
  recommendation: string;
  description?: string;
  potentialSavings: number;
  type: string;
}

// Sort function for recommendations
const sortOptions = {
  'savings-high': (a: Recommendation, b: Recommendation) => b.savings - a.savings,
  'savings-low': (a: Recommendation, b: Recommendation) => a.savings - b.savings,
  'difficulty-easy': (a: Recommendation, b: Recommendation) => {
    const difficultyOrder = { 'easy': 0, 'medium': 1, 'hard': 2 };
    return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
  },
  'impact-high': (a: Recommendation, b: Recommendation) => {
    const impactOrder = { 'high': 0, 'medium': 1, 'low': 2 };
    return impactOrder[a.impact] - impactOrder[b.impact];
  },
};

export default function Recommendations() {
  const [sortBy, setSortBy] = useState<keyof typeof sortOptions>('savings-high');
  const [loading, setLoading] = useState(true);
  const [hasUploadedData, setHasUploadedData] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>(sampleRecommendations);
  const [savingsData, setSavingsData] = useState(chartData);
  
  useEffect(() => {
    // Fetch data from API
    const fetchData = async () => {
      try {
        const response = await fetch('/api/energy-data');
        const apiData = await response.json();
        
        console.log('Recommendations API Data:', apiData);
        
        if (apiData.data && apiData.data.length > 0 && apiData.predictions) {
          setHasUploadedData(true);
          
          // Get uploaded data and predictions
          const predictions = apiData.predictions;
          
          // Generate custom recommendations based on the data
          if (predictions.insights && predictions.insights.length > 0) {
            const customRecommendations = predictions.insights.map((insight: InsightData, index: number) => {
              // Determine impact based on potential savings
              let impact: 'high' | 'medium' | 'low' = 'medium';
              if (insight.potentialSavings > 100) impact = 'high';
              else if (insight.potentialSavings < 50) impact = 'low';
              
              // Determine difficulty
              let difficulty: 'easy' | 'medium' | 'hard' = 'medium';
              if (insight.type === 'behavioral') difficulty = 'easy';
              else if (insight.type === 'installation') difficulty = 'hard';
              
              // Determine icon based on category
              let icon: React.ReactNode = <ChartBarIcon className="h-5 w-5" />;
              if (insight.type === 'scheduling') icon = <ClockIcon className="h-5 w-5" />;
              else if (insight.type === 'appliance') icon = <LightBulbIcon className="h-5 w-5" />;
              else if (insight.type === 'behavioral') icon = <ArrowTrendingDownIcon className="h-5 w-5" />;
              
              return {
                id: index + 1,
                title: insight.recommendation,
                description: insight.description || 'Implementing this recommendation can help reduce your energy consumption.',
                savings: insight.potentialSavings,
                impact,
                category: insight.type,
                icon,
                difficulty
              };
            });
            
            // If we have fewer than 3 recommendations, add some generic ones
            if (customRecommendations.length < 3) {
              const additionalRecommendations = sampleRecommendations.slice(0, 3 - customRecommendations.length);
              setRecommendations([...customRecommendations, ...additionalRecommendations]);
            } else {
              setRecommendations(customRecommendations);
            }
            
            // Update chart data
            const easyRecs = customRecommendations.filter((r: Recommendation) => r.difficulty === 'easy');
            const mediumRecs = customRecommendations.filter((r: Recommendation) => r.difficulty === 'medium');
            const hardRecs = customRecommendations.filter((r: Recommendation) => r.difficulty === 'hard');
            
            const easySavings = easyRecs.reduce((total: number, r: Recommendation) => total + r.savings, 0);
            const mediumSavings = mediumRecs.reduce((total: number, r: Recommendation) => total + r.savings, 0);
            const hardSavings = hardRecs.reduce((total: number, r: Recommendation) => total + r.savings, 0);
            
            setSavingsData({
              ...chartData,
              datasets: [{
                ...chartData.datasets[0],
                data: [easySavings, mediumSavings, hardSavings]
              }]
            });
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching recommendations data:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Sort recommendations
  const sortedRecommendations = [...recommendations].sort(sortOptions[sortBy]);
  
  // Calculate total potential savings
  const totalSavings = sortedRecommendations.reduce((total, rec) => total + rec.savings, 0);
  
  const getImpactClass = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getDifficultyClass = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <DashboardLayout active="recommendations">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Energy Saving Recommendations</h1>
        <p className="text-gray-600">Personalized suggestions to reduce your energy consumption and costs</p>
        {hasUploadedData && (
          <p className="text-green-600 mt-1">
            Recommendations based on your uploaded energy data
          </p>
        )}
      </div>
      
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
          <div className="lg:col-span-2">
            <div className="h-24 bg-gray-200 rounded-lg mb-4"></div>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg mb-4"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded-lg"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-green-100 text-green-600 mr-3">
                    <CurrencyDollarIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">Potential Monthly Savings</h2>
                    <p className="text-3xl font-bold text-green-600">{totalSavings} LKR</p>
                  </div>
                </div>
                <div>
                  <label htmlFor="sort" className="text-sm text-gray-500 block mb-1">Sort by:</label>
                  <select 
                    id="sort" 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as keyof typeof sortOptions)}
                    className="border rounded-lg px-3 py-2 text-sm bg-white"
                  >
                    <option value="savings-high">Highest Savings</option>
                    <option value="savings-low">Lowest Savings</option>
                    <option value="difficulty-easy">Easiest First</option>
                    <option value="impact-high">Highest Impact</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              {sortedRecommendations.map((recommendation) => (
                <div key={recommendation.id} className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="p-6">
                    <div className="flex justify-between">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 p-2 rounded-full bg-blue-100 text-blue-600 mr-4">
                          {recommendation.icon}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-800">{recommendation.title}</h3>
                          <p className="text-gray-600 mt-1">{recommendation.description}</p>
                          <div className="flex space-x-2 mt-2">
                            <span className={`${getImpactClass(recommendation.impact)} text-xs px-2 py-1 rounded-full`}>
                              {recommendation.impact.charAt(0).toUpperCase() + recommendation.impact.slice(1)} Impact
                            </span>
                            <span className={`${getDifficultyClass(recommendation.difficulty)} text-xs px-2 py-1 rounded-full`}>
                              {recommendation.difficulty.charAt(0).toUpperCase() + recommendation.difficulty.slice(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-green-600 font-bold">{recommendation.savings} LKR</div>
                        <div className="text-gray-500 text-sm">monthly savings</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Savings Breakdown</h2>
              <div className="h-64">
                <Doughnut data={savingsData} options={chartOptions} />
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Energy Saving Tips</h2>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="flex-shrink-0 p-1 rounded-full bg-green-100 text-green-600 mr-3">
                    <LightBulbIcon className="h-4 w-4" />
                  </div>
                  <p className="text-gray-700 text-sm">Set your water heater to 120°F to save up to 10% on water heating costs.</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 p-1 rounded-full bg-green-100 text-green-600 mr-3">
                    <LightBulbIcon className="h-4 w-4" />
                  </div>
                  <p className="text-gray-700 text-sm">Clean or replace HVAC filters regularly to improve efficiency.</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 p-1 rounded-full bg-green-100 text-green-600 mr-3">
                    <LightBulbIcon className="h-4 w-4" />
                  </div>
                  <p className="text-gray-700 text-sm">Use ceiling fans to circulate air and reduce the load on your AC.</p>
                </li>
              </ul>
            </div>
            
            {!hasUploadedData && (
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <h3 className="font-medium text-yellow-800 mb-2">Demo Data</h3>
                <p className="text-yellow-700 text-sm">
                  You're currently viewing sample recommendations. For personalized energy-saving suggestions, please upload your energy data on the 
                  <a href="/dashboard/data-upload" className="underline font-medium ml-1">Data Upload</a> page.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
} 