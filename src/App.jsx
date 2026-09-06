import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import PackageSelectionPage from './pages/PackageSelectionPage';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);

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
      
      {/* Sticky Header */}
      <Navbar 
        onOpenLogin={() => setIsLoginOpen(true)}
      />

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

      {/* Footer */}
      <Footer 
        onExploreCourses={handleExploreCourses}
      />
    </div>
  );
}
