'use client';

import { useState, useEffect } from 'react';

// Hook to use localStorage with state
export function useLocalStorage<T>(key: string, initialValue: T) {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // If in browser, get from localStorage
      if (typeof window !== 'undefined') {
        const item = window.localStorage.getItem(key);
        // Parse stored json or return initialValue
        return item ? JSON.parse(item) : initialValue;
      }

      return initialValue;
    } catch (error) {
      // If error, return initialValue
      console.error(error);
      return initialValue;
    }
  });

  // Function to update localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function for same API as useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to localStorage if in browser
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Effect to update state if localStorage changes from another component
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.error('Error parsing localStorage value:', error);
        }
      }
    };

    // Listen for changes to storage
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    }
  }, [key]);

  return [storedValue, setValue] as const;
}

// Client component that provides access to localStorage
export default function ClientStorage() {
  // This is a utility component that can be used to check if client-side storage is available
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    // Check if localStorage is available
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      setIsAvailable(true);
    } catch (e) {
      setIsAvailable(false);
      console.error('localStorage is not available:', e);
    }
  }, []);

  return (
    <div style={{ display: 'none' }} data-testid="client-storage">
      {/* Hidden component that can be used to verify client storage is loaded */}
      <div data-storage-available={isAvailable}></div>
    </div>
  );
} 