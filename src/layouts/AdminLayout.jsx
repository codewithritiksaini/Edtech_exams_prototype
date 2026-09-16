import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import AdminNavbar from '../components/admin/AdminNavbar';
import AdminSidebar from '../components/admin/AdminSidebar';
import Breadcrumbs from '../components/common/Breadcrumbs';
import { authService, USER_ROLES } from '../services/authService';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());

  // Role authentication guard
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user) {
      navigate('/login?redirect=' + encodeURIComponent(location.pathname));
    } else if (user.role !== USER_ROLES.ADMIN) {
      if (user.role === USER_ROLES.FACULTY) {
        navigate('/faculty');
      } else {
        navigate('/student/dashboard');
      }
    } else {
      setCurrentUser(user);
    }

    const unsubscribe = authService.subscribe((updatedUser) => {
      if (!updatedUser) {
        navigate('/login');
      } else if (updatedUser.role !== USER_ROLES.ADMIN) {
        if (updatedUser.role === USER_ROLES.FACULTY) {
          navigate('/faculty');
        } else {
          navigate('/student/dashboard');
        }
      } else {
        setCurrentUser(updatedUser);
      }
    });
    return unsubscribe;
  }, [navigate, location.pathname]);

  // Persistent Sidebar Pin/Unpin State
  const [isSidebarPinned, setIsSidebarPinned] = useState(() => {
    try {
      const saved = localStorage.getItem('medprep_sidebar_pinned');
      return saved !== null ? JSON.parse(saved) : true;
    } catch (e) {
      return true;
    }
  });
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleTogglePin = () => {
    setIsSidebarPinned(prev => {
      const next = !prev;
      localStorage.setItem('medprep_sidebar_pinned', JSON.stringify(next));
      return next;
    });
  };

  const handleToggleSidebar = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsMobileSidebarOpen(prev => !prev);
    } else {
      handleTogglePin();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Fixed Admin Topbar */}
      <AdminNavbar onToggleSidebar={handleToggleSidebar} />

      <div className="flex-1 flex">
        {/* Persistent Collapsible & Pinnable Sidebar */}
        <AdminSidebar 
          isPinned={isSidebarPinned}
          onTogglePin={handleTogglePin}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
          {/* Top Breadcrumbs Bar */}
          <div className="bg-white border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-2 shadow-2xs">
            <Breadcrumbs basePath="admin" />
          </div>

          {/* Child Routed Page View */}
          <main className="flex-1 px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
