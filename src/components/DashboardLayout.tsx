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
      <div className="flex h-screen bg-gray-100">
        <Sidebar active={active} />
        <main className="flex-1 overflow-auto p-8">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
} 