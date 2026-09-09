import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import DashboardNavbar from '../components/DashboardNavbar';
import DashboardSidebar from '../components/DashboardSidebar';
import Breadcrumbs from '../components/common/Breadcrumbs';

export default function StudentLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-brand-500 selection:text-white">
      {/* Sticky Student LMS Header */}
      <DashboardNavbar 
        onToggleSidebar={() => setIsSidebarOpen(prev => !prev)} 
        isSidebarOpen={isSidebarOpen} 
      />

      <div className="flex-1 flex">
        {/* Persistent Student LMS Sidebar */}
        <DashboardSidebar 
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Main LMS Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
          {/* Breadcrumbs Bar */}
          <div className="bg-white border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-2 shadow-2xs">
            <Breadcrumbs basePath="student" />
          </div>

          {/* Child Routed Page */}
          <main className="flex-1 px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
