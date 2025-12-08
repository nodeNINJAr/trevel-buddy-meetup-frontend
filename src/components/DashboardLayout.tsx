"use client";

import React from 'react';
import { DashboardSidebar } from './DashboardSidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen">
      <DashboardSidebar />
      <main className="lg:pl-64">
        {children}
      </main>
    </div>
  );
}
