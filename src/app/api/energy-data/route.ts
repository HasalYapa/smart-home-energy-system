import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Function to validate date format
function isValidDateFormat(dateString: string): boolean {
  // Check for MM/DD/YYYY or M/D/YYYY format (with or without leading zeros)
  const regex = /^(0?[1-9]|1[0-2])\/(0?[1-9]|[12][0-9]|3[01])\/\d{4}$/;
  return regex.test(dateString);
}

// Calculate electricity bill based on Sri Lanka tariff structure
function calculateElectricityBill(monthlyKwh: number): { total: number, breakdown: any } {
  // Convert kWh to units (1 unit = 1000 kWh)
  const monthlyUnits = monthlyKwh / 1000;
  
  // Sri Lanka electricity tariff structure
  const tariffs = {
    // Consumption up to 60 units per month
    lowConsumption: {
      tier1: { range: [0, 30], unitCharge: 2.5, fixedCharge: 30.00 },
      tier2: { range: [31, 60], unitCharge: 5, fixedCharge: 60.00 }
    },
    // Consumption above 60 units per month
    highConsumption: {
      tier1: { range: [0, 30], unitCharge: 2.5, fixedCharge: 0.99 },
      tier2: { range: [31, 60], unitCharge: 4.85, fixedCharge: 0.99 }
    }
  };

  let total = 0;
  let breakdown = {
    consumption: monthlyKwh,
    unitsConsumed: monthlyUnits,
    fixedCharge: 0,
    variableCharge: 0,
    tiers: [] as any[],
    total: 0
  };

  // Determine which tariff structure to use
  const tariffStructure = monthlyUnits <= 60 ? tariffs.lowConsumption : tariffs.highConsumption;

  if (monthlyUnits <= 30) {
    // Only tier 1 applies
    total = monthlyUnits * tariffStructure.tier1.unitCharge + tariffStructure.tier1.fixedCharge;
    breakdown.fixedCharge = tariffStructure.tier1.fixedCharge;
    breakdown.variableCharge = monthlyUnits * tariffStructure.tier1.unitCharge;
    breakdown.tiers.push({
      range: `0-30 units`,
      units: monthlyUnits,
      rate: tariffStructure.tier1.unitCharge,
      charge: monthlyUnits * tariffStructure.tier1.unitCharge
    });
  } else if (monthlyUnits <= 60) {
    // Tier 1 and 2 apply
    const tier1Units = 30;
    const tier2Units = monthlyUnits - 30;
    
    total = (tier1Units * tariffStructure.tier1.unitCharge) + 
            (tier2Units * tariffStructure.tier2.unitCharge) + 
            tariffStructure.tier2.fixedCharge;
            
    breakdown.fixedCharge = tariffStructure.tier2.fixedCharge;
    breakdown.variableCharge = (tier1Units * tariffStructure.tier1.unitCharge) + 
                              (tier2Units * tariffStructure.tier2.unitCharge);
    
    breakdown.tiers.push({
      range: `0-30 units`,
      units: tier1Units,
      rate: tariffStructure.tier1.unitCharge,
      charge: tier1Units * tariffStructure.tier1.unitCharge
    });
    
    breakdown.tiers.push({
      range: `31-60 units`,
      units: tier2Units,
      rate: tariffStructure.tier2.unitCharge,
      charge: tier2Units * tariffStructure.tier2.unitCharge
    });
  } else {
    // Above 60 units - high consumption tariff with multiple tiers
    const tier1Units = 30;
    const tier2Units = 30;
    const remainingUnits = monthlyUnits - 60;
    
    // For the first 60 units
    const firstTiersCharge = (tier1Units * tariffStructure.tier1.unitCharge) + 
                             (tier2Units * tariffStructure.tier2.unitCharge);
    
    // For units above 60 (additional tiers at the same rate)
    const remainingCharge = remainingUnits * tariffStructure.tier2.unitCharge;
    
    // Fixed charges
    const fixedCharge = tariffStructure.tier2.fixedCharge;
    
    total = firstTiersCharge + remainingCharge + fixedCharge;
    
    breakdown.fixedCharge = fixedCharge;
    breakdown.variableCharge = firstTiersCharge + remainingCharge;
    
    breakdown.tiers.push({
      range: `0-30 units`,
      units: tier1Units,
      rate: tariffStructure.tier1.unitCharge,
      charge: tier1Units * tariffStructure.tier1.unitCharge
    });
    
    breakdown.tiers.push({
      range: `31-60 units`,
      units: tier2Units,
      rate: tariffStructure.tier2.unitCharge,
      charge: tier2Units * tariffStructure.tier2.unitCharge
    });
    
    breakdown.tiers.push({
      range: `> 60 units`,
      units: remainingUnits,
      rate: tariffStructure.tier2.unitCharge,
      charge: remainingUnits * tariffStructure.tier2.unitCharge
    });
  }

  breakdown.total = total;
  return { total, breakdown };
}

// Mock AI prediction function
function generatePredictions(data: any[]) {
  if (!data || data.length === 0) {
    return null;
  }

  // Calculate average daily consumption
  const totalKwh = data.reduce((sum, entry) => sum + entry.totalKwh, 0);
  const avgDailyKwh = totalKwh / data.length;

  // Find highest consuming appliance
  const applianceTotals: Record<string, number> = {};
  
  data.forEach(entry => {
    Object.keys(entry).forEach(key => {
      if (key !== 'date' && key !== 'totalKwh') {
        applianceTotals[key] = (applianceTotals[key] || 0) + (entry[key] || 0);
      }
    });
  });
  
  let highestConsumingAppliance = '';
  let highestConsumption = 0;
  
  Object.entries(applianceTotals).forEach(([appliance, consumption]) => {
    if (consumption > highestConsumption) {
      highestConsumption = consumption;
      highestConsumingAppliance = appliance;
    }
  });

  // Calculate monthly consumption estimate (assuming 30 days)
  const monthlyKwh = avgDailyKwh * 30;
  
  // Use Sri Lanka tariff structure to calculate the bill
  const { total: predictedBill, breakdown } = calculateElectricityBill(monthlyKwh);

  // Calculate potential savings
  // Assuming 15% potential savings from recommendations
  const potentialSavingsPercent = 15;
  const potentialSavings = (predictedBill * potentialSavingsPercent) / 100;

  // Generate insights based on data
  const insights = [];

  // Add insight for highest consuming appliance
  insights.push({
    recommendation: `Reduce ${highestConsumingAppliance.replace(/([A-Z])/g, ' $1').toLowerCase()} usage by 1 hour per day`,
    description: `Your ${highestConsumingAppliance.replace(/([A-Z])/g, ' $1').toLowerCase()} is consuming the most energy. Consider reducing its usage.`,
    potentialSavings: Math.round((highestConsumption / totalKwh) * potentialSavings),
    type: 'behavioral'
  });

  // Add scheduling recommendation
  insights.push({
    recommendation: 'Shift high-energy activities to off-peak hours (10 PM - 6 AM)',
    description: 'Running high-consumption appliances during off-peak hours can reduce your electricity costs significantly.',
    potentialSavings: Math.round(potentialSavings * 0.4),
    type: 'scheduling'
  });

  // Add appliance maintenance recommendation
  insights.push({
    recommendation: 'Ensure optimal temperature settings for refrigeration',
    description: 'Set your refrigerator to 3-4°C and freezer to -18°C for optimal energy efficiency.',
    potentialSavings: Math.round(potentialSavings * 0.25),
    type: 'appliance'
  });

  // Add installation recommendation
  insights.push({
    recommendation: 'Consider installing LED lighting throughout your home',
    description: 'LED bulbs use up to 80% less energy than incandescent bulbs and last much longer.',
    potentialSavings: Math.round(potentialSavings * 0.35),
    type: 'installation'
  });

  // Add tier-specific recommendations based on consumption
  if (monthlyKwh > 60) {
    insights.push({
      recommendation: 'Try to reduce consumption below 60 kWh per month',
      description: 'Your consumption puts you in a higher tariff bracket. Reducing usage below 60 kWh per month can significantly lower your bill.',
      potentialSavings: Math.round(potentialSavings * 0.5),
      type: 'behavioral'
    });
  }

  return {
    avgKwh: parseFloat(avgDailyKwh.toFixed(2)),
    predictedUsage: parseFloat(avgDailyKwh.toFixed(2)),
    monthlyKwh: parseFloat(monthlyKwh.toFixed(2)),
    predictedBill: Math.round(predictedBill),
    billBreakdown: breakdown,
    highestConsumingAppliance,
    highestConsumption: parseFloat(highestConsumption.toFixed(2)),
    savings: {
      potential: potentialSavingsPercent,
      amount: Math.round(potentialSavings)
    },
    insights
  };
}

export async function GET() {
  try {
    // Path to the data file
    const dataDir = path.join(process.cwd(), 'data');
    const dataFile = path.join(dataDir, 'energy-data.json');
    
    // Check if data file exists
    if (!fs.existsSync(dataFile)) {
      return NextResponse.json({ message: 'No data found', data: [] });
    }
    
    // Read data file
    const fileData = fs.readFileSync(dataFile, 'utf8');
    const data = JSON.parse(fileData);
    
    // Generate predictions if data exists
    const predictions = generatePredictions(data);
    
    return NextResponse.json({ 
      message: 'Data retrieved successfully', 
      data, 
      predictions
    });
  } catch (error) {
    console.error('Error retrieving energy data:', error);
    return NextResponse.json(
      { message: 'Failed to retrieve energy data', error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { energyData } = await request.json();
    
    // Basic validation
    if (!energyData || !Array.isArray(energyData) || energyData.length === 0) {
      return NextResponse.json(
        { message: 'Invalid data format. Expected an array of energy data entries.' },
        { status: 400 }
      );
    }
    
    // Validate each entry
    for (const entry of energyData) {
      if (!entry.date || !isValidDateFormat(entry.date)) {
        return NextResponse.json(
          { message: 'Invalid date format. Expected MM/DD/YYYY or M/D/YYYY format.' },
          { status: 400 }
        );
      }
    }
    
    // Ensure data directory exists
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Write data to file
    fs.writeFileSync(
      path.join(dataDir, 'energy-data.json'),
      JSON.stringify(energyData)
    );
    
    // Generate predictions
    const predictions = generatePredictions(energyData);
    
    return NextResponse.json({ 
      message: 'Data saved successfully',
      predictions
    });
  } catch (error) {
    console.error('Error saving energy data:', error);
    return NextResponse.json(
      { message: 'Failed to save energy data', error: (error as Error).message },
      { status: 500 }
    );
  }
} 