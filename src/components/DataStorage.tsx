'use client';

import { useEffect } from 'react';

// This is a client-only component to ensure localStorage is available
export default function DataStorage() {
  // Handle storing data in localStorage for client-side access
  useEffect(() => {
    // Add a helper method to the window object for server components to use
    window.saveEnergyData = (data: any) => {
      try {
        localStorage.setItem('energy-data', JSON.stringify(data));
        return true;
      } catch (error) {
        console.error('Error saving to localStorage:', error);
        return false;
      }
    };

    window.getEnergyData = () => {
      try {
        const data = localStorage.getItem('energy-data');
        return data ? JSON.parse(data) : null;
      } catch (error) {
        console.error('Error reading from localStorage:', error);
        return null;
      }
    };

    // Add event listener for the server to request storage operations
    const handleStorageRequest = (event: MessageEvent<any>) => {
      if (event.data && event.data.type === 'saveEnergyData') {
        const success = window.saveEnergyData(event.data.data);
        if (event.source && 'postMessage' in event.source) {
          (event.source as WindowProxy).postMessage(
            { type: 'saveEnergyDataResponse', success },
            { targetOrigin: '*' }
          );
        }
      }
      
      if (event.data && event.data.type === 'getEnergyData') {
        const data = window.getEnergyData();
        if (event.source && 'postMessage' in event.source) {
          (event.source as WindowProxy).postMessage(
            { type: 'getEnergyDataResponse', data },
            { targetOrigin: '*' }
          );
        }
      }
    };

    window.addEventListener('message', handleStorageRequest);

    return () => {
      window.removeEventListener('message', handleStorageRequest);
    };
  }, []);

  // This component doesn't render anything visible
  return null;
}

// Add type definitions for the window object
declare global {
  interface Window {
    saveEnergyData: (data: any) => boolean;
    getEnergyData: () => any;
  }
} 