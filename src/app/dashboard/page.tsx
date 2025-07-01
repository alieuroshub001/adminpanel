'use client';

import { useState } from 'react';
import DashboardContent from '@/components/AdminDashboard/dashboard';

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <DashboardContent 
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
    />
  );
}