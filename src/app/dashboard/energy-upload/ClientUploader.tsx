'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveClientData, ENERGY_DATA_KEY } from '@/lib/data-storage';
import { CloudArrowUpIcon, ExclamationCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function ClientUploader() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
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
  };

  const parseCSV = (csvContent: string): any[] => {
    try {
      // Basic CSV parsing (simplified version)
      const lines = csvContent.split(/\r?\n/).filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim());
      
      // Process data rows
      const data = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        
        if (values.length !== headers.length) continue;
        
        const entry: Record<string, any> = {};
        for (let j = 0; j < headers.length; j++) {
          const header = headers[j];
          const value = values[j];
          
          // Parse numeric values
          if (header !== 'date' && !isNaN(Number(value))) {
            entry[header] = Number(value);
          } else {
            entry[header] = value;
          }
        }
        
        data.push(entry);
      }
      
      return data;
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
      
      // Save directly to client storage
      const success = saveClientData(ENERGY_DATA_KEY, energyData);
      
      if (!success) {
        throw new Error('Error saving data to browser storage');
      }
      
      setUploadStatus('success');
      setSuccessMessage(`Successfully uploaded ${energyData.length} data points. Your dashboard will now use this data.`);
      
      // Refresh the dashboard data after a successful upload
      setTimeout(() => {
        router.push('/dashboard');
        router.refresh(); // Force a refresh of the page
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
    setSuccessMessage(null);
  };

  return (
    <div className="mt-8 bg-white rounded-lg shadow p-6 max-w-3xl">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Upload (Client-only)</h2>
      
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
          <p className="text-sm text-gray-600 mb-4">
            This upload method uses your browser's storage. Data will only be available on this device.
          </p>
          
          <div className="mb-4">
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label htmlFor="client-file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                    <span>Upload a file</span>
                    <input 
                      id="client-file-upload" 
                      name="client-file-upload" 
                      type="file" 
                      className="sr-only" 
                      accept=".csv"
                      onChange={handleFileChange}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">CSV up to 5MB</p>
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
              {isUploading ? 'Uploading...' : 'Upload and Save Locally'}
            </button>
          </div>
        </>
      )}
    </div>
  );
} 