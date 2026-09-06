import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import PackageSelectionPage from './pages/PackageSelectionPage';
import DashboardPage from './pages/DashboardPage';
import DayContentView from './pages/DayContentView';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const location = useLocation();

  const isLmsView = location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/day');

  const handleExploreCourses = () => {
    const el = document.getElementById('courses');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.location.href = '/#courses';
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-brand-500 selection:text-white">
      <ScrollToTop />
      
      {/* Sticky Marketing Header (Hidden on logged-in student LMS routes) */}
      {!isLmsView && (
        <Navbar 
          onOpenLogin={() => setIsLoginOpen(true)}
        />
      )}

      {/* Main Content View */}
      <main className="flex-grow">
        <Routes>
          <Route 
            path="/" 
            element={
              <HomePage 
                isLoginOpen={isLoginOpen} 
                onCloseLogin={() => setIsLoginOpen(false)} 
              />
            } 
          />
          <Route 
            path="/packages/:examId" 
            element={<PackageSelectionPage />} 
          />
          <Route 
            path="/packages" 
            element={<PackageSelectionPage />} 
          />
          <Route 
            path="/dashboard" 
            element={<DashboardPage />} 
          />
          <Route 
            path="/day/:dayId" 
            element={<DayContentView />} 
          />
          {/* Catch-all redirect to homepage */}
          <Route 
            path="*" 
            element={
              <HomePage 
                isLoginOpen={isLoginOpen} 
                onCloseLogin={() => setIsLoginOpen(false)} 
              />
            } 
          />
        </Routes>
      </main>

      {/* Footer (Hidden on logged-in student LMS routes) */}
      {!isLmsView && (
        <Footer 
          onExploreCourses={handleExploreCourses}
        />
      )}
    </div>
  );
}
