'use client';

import React from 'react';
import Sidebar from './Sidebar';
import AuthGuard from './AuthGuard';

interface DashboardLayoutProps {
  children: React.ReactNode;
  active: string;
}

export default function DashboardLayout({ children, active }: DashboardLayoutProps) {
  return (
    <AuthGuard>
      <div className="flex h-screen bg-gray-100 relative">
        <Sidebar active={active} />
        <main className="flex-1 overflow-auto p-4 md:p-8">
          <div className="md:pt-0 pt-8">
            {children}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
} 