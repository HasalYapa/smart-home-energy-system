/**
 * Data storage utilities for the Smart Home Energy Management System
 * 
 * This file provides a unified API for storing and retrieving energy data
 * that works in both client and server environments.
 */

// Client-side storage functions (for direct DOM access)
export function saveClientData(key: string, data: any): boolean {
  if (typeof window === 'undefined') {
    console.warn('Attempted to use client storage in server environment');
    return false;
  }

  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    return false;
  }
}

export function getClientData<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') {
    console.warn('Attempted to use client storage in server environment');
    return fallback;
  }

  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return fallback;
  }
}

// Functions to check environment
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

export function isClient(): boolean {
  return typeof window !== 'undefined';
}

// Data key constants
export const ENERGY_DATA_KEY = 'energy-data'; 