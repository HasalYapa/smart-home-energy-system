'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  ChartBarIcon, 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon,
  CurrencyDollarIcon,
  ReceiptPercentIcon,
  TableCellsIcon
} from '@heroicons/react/24/outline';
import { Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend, 
  ChartOptions 
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Sample data (to be replaced with API data)
const historicalBills = [
  { month: 'Jan', amount: 4200, usage: 280 },
  { month: 'Feb', amount: 4500, usage: 310 },
  { month: 'Mar', amount: 4800, usage: 330 },
  { month: 'Apr', amount: 5200, usage: 370 },
  { month: 'May', amount: 5600, usage: 410 },
  { month: 'Jun', amount: 6100, usage: 450 },
  { month: 'Jul', amount: 6400, usage: 480 },
  { month: 'Aug', amount: 6700, usage: 510 },
  { month: 'Sep', amount: 6300, usage: 470 },
  { month: 'Oct', amount: 5800, usage: 420 },
  { month: 'Nov', amount: 5200, usage: 380 },
];

const currentMonthEstimate = {
  month: 'Dec',
  predictedAmount: 4900,
  predictedUsage: 350,
  percentageChange: -5.8,
  savingsAmount: 300,
};

const chartData = {
  labels: [...historicalBills.map(bill => bill.month), currentMonthEstimate.month],
  datasets: [
    {
      label: 'Bill Amount (LKR)',
      data: [...historicalBills.map(bill => bill.amount), currentMonthEstimate.predictedAmount],
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.5)',
      tension: 0.3,
    },
  ],
};

const usageChartData = {
  labels: [...historicalBills.map(bill => bill.month), currentMonthEstimate.month],
  datasets: [
    {
      label: 'Energy Usage (kWh)',
      data: [...historicalBills.map(bill => bill.usage), currentMonthEstimate.predictedUsage],
      borderColor: 'rgb(16, 185, 129)',
      backgroundColor: 'rgba(16, 185, 129, 0.5)',
      tension: 0.3,
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
      beginAtZero: false,
      title: {
        display: true,
        text: 'Amount (LKR)',
      },
    },
  },
};

const usageChartOptions: ChartOptions<'line'> = {
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
      beginAtZero: false,
      title: {
        display: true,
        text: 'Energy (kWh)',
      },
    },
  },
};

interface BillBreakdown {
  consumption: number;
  fixedCharge: number;
  variableCharge: number;
  total: number;
  tiers: {
    range: string;
    units: number;
    rate: number;
    charge: number;
  }[];
}

export default function BillEstimation() {
  const [chartView, setChartView] = useState<'amount' | 'usage'>('amount');
  const [hasUploadedData, setHasUploadedData] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [estimationData, setEstimationData] = useState({
    billChartData: chartData,
    usageChartData: usageChartData,
    currentEstimate: currentMonthEstimate,
    billBreakdown: null as BillBreakdown | null
  });
  
  useEffect(() => {
    // Fetch data from API
    const fetchData = async () => {
      try {
        const response = await fetch('/api/energy-data');
        const apiData = await response.json();
        
        console.log('Bill Estimation API Data:', apiData);
        
        if (apiData.data && apiData.data.length > 0 && apiData.predictions) {
          setHasUploadedData(true);
          
          // Get uploaded data
          const uploadedData = apiData.data;
          const predictions = apiData.predictions;
          
          // Extract dates and totalKwh from uploaded data
          const dates = uploadedData.map((item: any) => {
            // Extract month from MM/DD/YYYY format
            const date = new Date(item.date);
            return date.toLocaleDateString('en-US', { month: 'short' });
          });
          
          const usage = uploadedData.map((item: any) => item.totalKwh);
          
          // Calculate bill amounts based on usage (simplified)
          const amounts = usage.map((kwh: number) => {
            // Convert daily usage to monthly (assuming 30 days)
            const monthlyKwh = kwh * 30;
            // Estimate bill using the predicted bill from API
            return Math.round(monthlyKwh * (predictions.predictedBill / predictions.monthlyKwh));
          });
          
          // Get this month as string (e.g., 'Dec')
          const currentMonth = new Date().toLocaleDateString('en-US', { month: 'short' });
          
          // Calculate percentage change from previous month
          const previousAmount = amounts[amounts.length - 1] || 5200;
          const currentAmount = predictions.predictedBill;
          const percentageChange = ((currentAmount - previousAmount) / previousAmount) * 100;
          
          // Create updated estimate
          const updatedEstimate = {
            month: currentMonth,
            predictedAmount: Math.round(predictions.predictedBill),
            predictedUsage: Math.round(predictions.monthlyKwh), 
            percentageChange: Math.round(percentageChange * 10) / 10,
            savingsAmount: Math.round(predictions.savings.amount),
          };
          
          // Create updated chart data
          const updatedBillChartData = {
            labels: [...dates, currentMonth],
            datasets: [
              {
                label: 'Bill Amount (LKR)',
                data: [...amounts, updatedEstimate.predictedAmount],
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
                tension: 0.3,
              },
            ],
          };
          
          const updatedUsageChartData = {
            labels: [...dates, currentMonth],
            datasets: [
              {
                label: 'Energy Usage (kWh)',
                data: [...usage.map((u: number) => u * 30), updatedEstimate.predictedUsage], // Convert daily to monthly
                borderColor: 'rgb(16, 185, 129)',
                backgroundColor: 'rgba(16, 185, 129, 0.5)',
                tension: 0.3,
              },
            ],
          };
          
          // Update state with the new data
          setEstimationData({
            billChartData: updatedBillChartData,
            usageChartData: updatedUsageChartData,
            currentEstimate: updatedEstimate,
            billBreakdown: predictions.billBreakdown
          });
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching bill estimation data:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  return (
    <DashboardLayout active="bill estimation">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Bill Estimation</h1>
        <p className="text-gray-600">Predict your electricity bill and explore savings opportunities</p>
        {hasUploadedData && (
          <p className="text-green-600 mt-1">
            Using your uploaded energy data for bill predictions
          </p>
        )}
      </div>
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
          <div className="md:col-span-3 h-80 bg-gray-200 rounded-lg"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                  <CurrencyDollarIcon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Predicted Bill</p>
                  <p className="text-2xl font-bold">{estimationData.currentEstimate.predictedAmount} LKR</p>
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-500">
                For {estimationData.currentEstimate.month} 
                {estimationData.currentEstimate.percentageChange < 0 ? (
                  <span className="text-green-600 ml-2">
                    ({estimationData.currentEstimate.percentageChange}% from last month)
                  </span>
                ) : (
                  <span className="text-red-600 ml-2">
                    (+{estimationData.currentEstimate.percentageChange}% from last month)
                  </span>
                )}
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                  <ChartBarIcon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Predicted Usage</p>
                  <p className="text-2xl font-bold">{estimationData.currentEstimate.predictedUsage} kWh</p>
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-500">
                Based on your current usage patterns
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                  <ArrowTrendingDownIcon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Potential Savings</p>
                  <p className="text-2xl font-bold">{estimationData.currentEstimate.savingsAmount} LKR</p>
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-500">
                If you implement all recommendations
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Billing Trends</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => setChartView('amount')}
                  className={`px-4 py-2 rounded-lg ${
                    chartView === 'amount' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Bill Amount
                </button>
                <button
                  onClick={() => setChartView('usage')}
                  className={`px-4 py-2 rounded-lg ${
                    chartView === 'usage' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Energy Usage
                </button>
              </div>
            </div>
            
            <div className="h-80">
              {chartView === 'amount' ? (
                <Line options={chartOptions} data={estimationData.billChartData} />
              ) : (
                <Line options={usageChartOptions} data={estimationData.usageChartData} />
              )}
            </div>
            
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2">AI Insight</h3>
              <p className="text-blue-700">
                {hasUploadedData ? (
                  <>
                    Based on your uploaded data, your electricity bill for {estimationData.currentEstimate.month} is 
                    projected to be {estimationData.currentEstimate.percentageChange < 0 ? 'lower' : 'higher'} than last month. 
                    You can save up to {estimationData.currentEstimate.savingsAmount} LKR by implementing our energy-saving recommendations.
                  </>
                ) : (
                  <>
                    Your electricity usage typically peaks in August and decreases towards the end of the year. 
                    This December, we predict a 5.8% decrease in your bill compared to November due to your recent implementation 
                    of our energy-saving recommendations.
                  </>
                )}
              </p>
            </div>
          </div>
          
          {estimationData.billBreakdown && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Bill Breakdown</h2>
                <button
                  onClick={() => setShowBreakdown(!showBreakdown)}
                  className="flex items-center px-4 py-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200"
                >
                  <TableCellsIcon className="h-5 w-5 mr-1" />
                  {showBreakdown ? 'Hide Details' : 'Show Details'}
                </button>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">
                Bill calculated using Sri Lanka electricity tariffs where 1 unit equals 1000 kWh of electricity consumption.
                Total monthly consumption: <span className="font-medium">{(estimationData.billBreakdown.consumption / 1000).toFixed(2)} units ({estimationData.billBreakdown.consumption.toFixed(2)} kWh)</span>
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center">
                    <div className="p-2 rounded-full bg-blue-100 text-blue-600 mr-3">
                      <ReceiptPercentIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Fixed Charge</p>
                      <p className="font-semibold text-gray-800">{estimationData.billBreakdown.fixedCharge.toFixed(2)} LKR</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center">
                    <div className="p-2 rounded-full bg-green-100 text-green-600 mr-3">
                      <ChartBarIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Variable Charge</p>
                      <p className="font-semibold text-gray-800">{estimationData.billBreakdown.variableCharge.toFixed(2)} LKR</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center">
                    <div className="p-2 rounded-full bg-purple-100 text-purple-600 mr-3">
                      <CurrencyDollarIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Total Bill</p>
                      <p className="font-semibold text-gray-800">{estimationData.billBreakdown.total.toFixed(2)} LKR</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {showBreakdown && (
                <div className="mt-4">
                  <h3 className="font-medium text-gray-800 mb-3">Tariff Breakdown</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Consumption Range
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Units Consumed (1 unit = 1000 kWh)
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Unit Charge (LKR/unit)
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Charge Amount (LKR)
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {estimationData.billBreakdown.tiers.map((tier, idx) => (
                          <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {tier.range}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {tier.units.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {tier.rate.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {tier.charge.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-blue-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                            Fixed Charge
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            -
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            -
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                            {estimationData.billBreakdown.fixedCharge.toFixed(2)}
                          </td>
                        </tr>
                        <tr className="bg-gray-100">
                          <td colSpan={3} className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            Total
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {estimationData.billBreakdown.total.toFixed(2)} LKR
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                    <h4 className="font-medium text-yellow-800 mb-1">Notes</h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• The tariff structure is based on the Public Utilities Commission of Sri Lanka electricity pricing.</li>
                      <li>• Different rates apply depending on whether your monthly consumption is above or below 60 units (60,000 kWh).</li>
                      <li>• Fixed charges vary by consumption tier.</li>
                      <li>• 1 unit in the tariff table equals 1000 kWh of electricity consumption.</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Savings Opportunities</h2>
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 p-2 rounded-full bg-green-100 text-green-600 mr-4">
                    <ArrowTrendingDownIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">Shift heavy appliance usage to off-peak hours</h3>
                    <p className="text-gray-600 mt-1">
                      Potential monthly savings: <span className="font-medium">150 LKR</span>
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="border rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 p-2 rounded-full bg-green-100 text-green-600 mr-4">
                    <ArrowTrendingDownIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">Optimize AC temperature settings</h3>
                    <p className="text-gray-600 mt-1">
                      Potential monthly savings: <span className="font-medium">120 LKR</span>
                    </p>
                  </div>
                </div>
              </div>
              
              {estimationData.currentEstimate.predictedUsage > 60 && (
                <div className="border rounded-lg p-4 bg-blue-50">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 p-2 rounded-full bg-blue-100 text-blue-600 mr-4">
                      <ArrowTrendingDownIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">Reduce consumption below 60 kWh to lower your tariff</h3>
                      <p className="text-gray-600 mt-1">
                        Potential monthly savings: <span className="font-medium">
                          {Math.round(estimationData.currentEstimate.savingsAmount * 0.4)} LKR
                        </span>
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Your consumption puts you in a higher tariff bracket with more expensive rates.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="border rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 p-2 rounded-full bg-green-100 text-green-600 mr-4">
                    <ArrowTrendingDownIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">Replace remaining incandescent bulbs with LEDs</h3>
                    <p className="text-gray-600 mt-1">
                      Potential monthly savings: <span className="font-medium">30 LKR</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {!hasUploadedData && (
            <div className="mt-8 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <h3 className="font-medium text-yellow-800 mb-2">Demo Data</h3>
              <p className="text-yellow-700">
                You're currently viewing demo bill estimation data. For personalized bill predictions, please upload your energy data on the 
                <a href="/dashboard/data-upload" className="underline font-medium ml-1">Data Upload</a> page.
              </p>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
} 