import React from 'react';
import AdminDashboard from '@/components/AdminDashboard';

// Force dynamic execution for instant CMS state synchronization
export const revalidate = 0;

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <AdminDashboard />
    </div>
  );
}
