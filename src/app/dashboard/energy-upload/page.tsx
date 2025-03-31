import DashboardLayout from '@/components/DashboardLayout';
import ClientUploader from './ClientUploader';
import { isProduction } from '@/lib/data-storage';

export default function EnergyUpload() {
  return (
    <DashboardLayout active="energy upload">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Energy Data Upload</h1>
        <p className="text-gray-600">Upload your energy consumption data for analysis</p>
      </div>
      
      {/* Client uploader for local storage in the browser */}
      <ClientUploader />
      
      {/* Info for users */}
      <div className="mt-6 bg-blue-50 rounded-lg shadow p-6 max-w-3xl">
        <h2 className="text-lg font-semibold text-blue-800 mb-2">About Client Storage</h2>
        <p className="text-blue-700 mb-4">
          In this demo application, we're using your browser's local storage to save the uploaded data.
          This means:
        </p>
        <ul className="list-disc pl-6 text-blue-700 space-y-2">
          <li>Data is stored only on your device</li>
          <li>Data will be lost if you clear your browser data</li>
          <li>Data won't be accessible from other devices</li>
          <li>In a production environment, we would use a database instead</li>
        </ul>
      </div>
    </DashboardLayout>
  );
} 