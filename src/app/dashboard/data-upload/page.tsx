'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { CloudArrowUpIcon, ExclamationCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function DataUpload() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setError(null);
    
    if (!selectedFile) {
      return;
    }
    
    // Validate file type
    if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      setFile(null);
      return;
    }
    
    setFile(selectedFile);
    
    // Preview the file contents
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csvContent = event.target?.result as string;
        const parsedData = parseCSV(csvContent);
        
        if (parsedData.length > 0) {
          setPreview(parsedData.slice(0, 5)); // Show first 5 rows in preview
        } else {
          setError('Could not parse CSV file. Please check the format.');
        }
      } catch (error) {
        setError('Error reading file. Please check the format.');
        console.error(error);
      }
    };
    
    reader.readAsText(selectedFile);
  };

  const parseCSV = (csvContent: string): any[] => {
    try {
      // Determine if the file is tab-separated or comma-separated
      const firstLine = csvContent.split(/\r?\n/)[0];
      const separator = firstLine.includes('\t') ? '\t' : ',';
      
      // Split by new line, handling different line endings
      const lines = csvContent.split(/\r?\n/);
      
      // Extract headers from first line and normalize them
      const rawHeaders = lines[0].split(separator).map(header => header.trim());
      const normalizedHeaders: Record<string, string> = {};
      
      // Normalize headers to expected format
      rawHeaders.forEach(header => {
        const lowerHeader = header.toLowerCase();
        if (lowerHeader === 'date') {
          normalizedHeaders[header] = 'date';
        } else if (lowerHeader === 'total kwh') {
          normalizedHeaders[header] = 'totalKwh';
        } else if (lowerHeader === 'appliance') {
          normalizedHeaders[header] = 'appliance';
        } else if (lowerHeader === 'kwh') {
          normalizedHeaders[header] = 'kwh';
        } else if (lowerHeader === 'hours used') {
          normalizedHeaders[header] = 'hoursUsed';
        } else {
          // Keep other headers as is
          normalizedHeaders[header] = header;
        }
      });
      
      console.log('CSV Headers:', rawHeaders);
      console.log('Normalized Headers:', normalizedHeaders);
      
      // Process data rows
      const data = [];
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue; // Skip empty lines
        
        const values = line.split(separator).map(val => val.trim());
        
        if (values.length !== rawHeaders.length) {
          console.warn(`Line ${i + 1} has ${values.length} values, expected ${rawHeaders.length}`);
          continue; // Skip malformed lines
        }
        
        // Check if this is an appliance-specific row in your format
        const dateIndex = rawHeaders.findIndex(h => h.toLowerCase() === 'date');
        const applianceIndex = rawHeaders.findIndex(h => h.toLowerCase() === 'appliance');
        const totalKwhIndex = rawHeaders.findIndex(h => h.toLowerCase() === 'total kwh');
        const kwhIndex = rawHeaders.findIndex(h => h.toLowerCase() === 'kwh');
        const hoursUsedIndex = rawHeaders.findIndex(h => h.toLowerCase() === 'hours used');
        
        if (dateIndex !== -1 && applianceIndex !== -1) {
          // This appears to be the appliance-specific format
          let dateValue = values[dateIndex];
          const applianceName = values[applianceIndex]?.replace(/0+$/, ''); // Remove trailing zeros
          const applianceKwh = kwhIndex !== -1 ? Number(values[kwhIndex]) : 0;
          const totalKwh = totalKwhIndex !== -1 ? Number(values[totalKwhIndex]) : 0;
          
          // Fix date format
          if (dateValue) {
            // Extract just the date part (remove trailing zeros)
            const dateMatch = dateValue.match(/^(\d{1,2}\/\d{1,2}\/\d{4})/);
            if (dateMatch) {
              dateValue = dateMatch[1];
            }
          }
          
          // Create entry with correct format for our system
          const entry: Record<string, any> = {
            date: dateValue
          };
          
          // Add total kWh
          if (totalKwhIndex !== -1) {
            entry.totalKwh = totalKwh;
          }
          
          // Add appliance-specific kWh as a field
          if (applianceName) {
            // Convert appliance name to camelCase for field name
            const fieldName = applianceName.charAt(0).toLowerCase() + applianceName.slice(1);
            entry[fieldName] = applianceKwh;
          }
          
          data.push(entry);
        } else {
          // Generic row handling (for other CSV formats)
          const entry: Record<string, any> = {};
          
          for (let j = 0; j < rawHeaders.length; j++) {
            const originalHeader = rawHeaders[j];
            const header = normalizedHeaders[originalHeader] || originalHeader;
            let value = values[j];
            
            // Clean up date format
            if (header.toLowerCase() === 'date') {
              const dateMatch = value.match(/^(\d{1,2}\/\d{1,2}\/\d{4})/);
              if (dateMatch) {
                value = dateMatch[1];
              }
            } else if (typeof value === 'string') {
              // Remove trailing zeros for text fields
              value = value.replace(/0+$/, '');
            }
            
            // Parse numeric values
            if (header !== 'date' && !isNaN(Number(value))) {
              entry[header] = Number(value);
            } else {
              entry[header] = value;
            }
          }
          
          data.push(entry);
        }
      }
      
      console.log('Parsed data before grouping:', data);
      
      // Group entries by date and aggregate values
      const entriesByDate: Record<string, any> = {};
      
      data.forEach((entry) => {
        const date = entry.date;
        if (!date) return; // Skip entries without date
        
        if (!entriesByDate[date]) {
          entriesByDate[date] = { 
            date,
            totalKwh: entry.totalKwh || 0
          };
        } else {
          // Add to total kWh if present
          if (entry.totalKwh) {
            entriesByDate[date].totalKwh += entry.totalKwh;
          }
        }
        
        // Add all other fields (appliances)
        Object.keys(entry).forEach(key => {
          if (key !== 'date' && key !== 'totalKwh' && typeof entry[key] === 'number') {
            entriesByDate[date][key] = (entriesByDate[date][key] || 0) + entry[key];
          }
        });
      });
      
      console.log('Grouped data:', entriesByDate);
      return Object.values(entriesByDate);
    } catch (error) {
      console.error('Error parsing CSV:', error);
      return [];
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }
    
    setIsUploading(true);
    setError(null);
    
    try {
      // Read file content
      const content = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = reject;
        reader.readAsText(file);
      });
      
      // Parse CSV data
      const energyData = parseCSV(content);
      
      if (energyData.length === 0) {
        throw new Error('No valid data could be parsed from the file');
      }
      
      // Send to API
      const response = await fetch('/api/energy-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ energyData }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Error uploading data');
      }
      
      setUploadStatus('success');
      setSuccessMessage(`Successfully uploaded ${energyData.length} data points. Your dashboard will now use this data.`);
      
      // Refresh the dashboard data after a successful upload
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
      
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('error');
      setError((error as Error).message || 'Failed to upload data');
    } finally {
      setIsUploading(false);
    }
  };

  const resetUpload = () => {
    setFile(null);
    setUploadStatus('idle');
    setError(null);
    setPreview([]);
    setSuccessMessage(null);
  };

  return (
    <DashboardLayout active="data upload">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Data Upload</h1>
        <p className="text-gray-600">Upload your energy consumption data for analysis</p>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6 max-w-3xl">
        {uploadStatus === 'success' ? (
          <div className="text-center py-8">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Upload Successful!</h3>
            <p className="mt-2 text-gray-500">{successMessage}</p>
            <div className="mt-6">
              <button
                onClick={resetUpload}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Upload Another File
              </button>
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Upload CSV File</h2>
            
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-2">
                Upload a CSV file with your energy consumption data. The file should have the following columns:
              </p>
              <div className="bg-gray-50 p-3 rounded-md text-xs font-mono">
                date,totalKwh,airConditioner,refrigerator,washingMachine,lighting,computer,television...
              </div>
              <p className="text-sm text-gray-600 mt-2">
                The date should be in MM/DD/YYYY format. Additional appliance columns are optional.
              </p>
            </div>
            
            <div className="mb-6">
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                      <span>Upload a file</span>
                      <input 
                        id="file-upload" 
                        name="file-upload" 
                        type="file" 
                        className="sr-only" 
                        accept=".csv"
                        onChange={handleFileChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">CSV up to 10MB</p>
                </div>
              </div>
              
              {error && (
                <div className="mt-2 text-sm text-red-600 flex items-center">
                  <ExclamationCircleIcon className="h-5 w-5 mr-1" />
                  {error}
                </div>
              )}
              
              {file && !error && (
                <div className="mt-2 text-sm text-green-600">
                  Selected file: {file.name}
                </div>
              )}
            </div>
            
            {preview.length > 0 && (
              <div className="mb-6">
                <h3 className="text-md font-medium text-gray-800 mb-2">Preview:</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        {Object.keys(preview[0]).map((header) => (
                          <th 
                            key={header}
                            scope="col"
                            className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {preview.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          {Object.values(row).map((value: any, valueIndex) => (
                            <td 
                              key={valueIndex}
                              className="px-3 py-2 whitespace-nowrap text-gray-500"
                            >
                              {value?.toString()}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Showing first {preview.length} of {preview.length} records
                </p>
              </div>
            )}
            
            <div className="flex justify-end">
              <button
                onClick={handleUpload}
                disabled={isUploading || !file || !!error}
                className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                  ${isUploading || !file || !!error 
                    ? 'bg-gray-300 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                  }`}
              >
                {isUploading ? 'Uploading...' : 'Upload and Analyze'}
              </button>
            </div>
          </>
        )}
      </div>
      
      <div className="mt-6 bg-blue-50 rounded-lg shadow p-6 max-w-3xl">
        <h2 className="text-lg font-semibold text-blue-800 mb-2">Sample Data Format</h2>
        <p className="text-sm text-blue-700 mb-3">
          Your data should follow this format. Make sure dates are in MM/DD/YYYY format.
        </p>
        <div className="overflow-x-auto bg-white rounded-md p-3">
          <pre className="text-xs text-gray-700">
            date,totalKwh,airConditioner,refrigerator,washingMachine<br/>
            10/01/2023,28.5,12.3,6.2,5.1<br/>
            10/02/2023,26.7,10.5,6.4,4.8<br/>
            10/03/2023,29.2,14.1,6.3,3.9<br/>
          </pre>
        </div>
      </div>
    </DashboardLayout>
  );
} 