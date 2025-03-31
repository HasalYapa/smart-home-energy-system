'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BoltIcon } from '@heroicons/react/24/outline';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to login page after showing splash screen
    const timer = setTimeout(() => {
      router.push('/auth/login');
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-b from-blue-500 to-blue-700">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm flex flex-col">
        <div className="p-6 rounded-full bg-white text-blue-600 mb-6 animate-pulse">
          <BoltIcon className="h-16 w-16" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-2">Smart Home Energy Management</h1>
        <p className="text-xl text-blue-100">Optimize your energy usage and reduce costs</p>
      </div>
    </main>
  );
}
