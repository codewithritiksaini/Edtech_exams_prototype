import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import FacultyNavbar from '../components/FacultyNavbar';
import FacultySidebar from '../components/FacultySidebar';
import Breadcrumbs from '../components/common/Breadcrumbs';
import { authService, USER_ROLES } from '../services/authService';

export default function FacultyLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());

  // Authentication guard
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user) {
      navigate('/faculty/login?redirect=' + encodeURIComponent(location.pathname));
    } else if (user.role === USER_ROLES.STUDENT) {
      navigate('/dashboard');
    } else {
      setCurrentUser(user);
    }

    const unsubscribe = authService.subscribe((updatedUser) => {
      if (!updatedUser) {
        navigate('/faculty/login');
      } else if (updatedUser.role === USER_ROLES.STUDENT) {
        navigate('/dashboard');
      } else {
        setCurrentUser(updatedUser);
      }
    });
    return unsubscribe;
  }, [navigate, location.pathname]);

  // Persistent Sidebar Pin/Unpin State
  const [isSidebarPinned, setIsSidebarPinned] = useState(() => {
    try {
      const saved = localStorage.getItem('medprep_faculty_sidebar_pinned');
      return saved !== null ? JSON.parse(saved) : true;
    } catch (e) {
      return true;
    }
  });
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleTogglePin = () => {
    setIsSidebarPinned(prev => {
      const next = !prev;
      localStorage.setItem('medprep_faculty_sidebar_pinned', JSON.stringify(next));
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
      {/* Sticky Faculty Topbar */}
      <FacultyNavbar 
        onToggleSidebar={handleToggleSidebar} 
        isSidebarOpen={isMobileSidebarOpen} 
      />

      <div className="flex-1 flex">
        {/* Persistent Pinnable & Collapsible Faculty Sidebar */}
        <FacultySidebar 
          isPinned={isSidebarPinned}
          onTogglePin={handleTogglePin}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
          {/* Breadcrumbs Bar */}
          <div className="bg-white border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-2 shadow-2xs">
            <Breadcrumbs basePath="faculty" />
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
