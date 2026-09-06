import React, { useState } from 'react';
import HeroSection from '../components/HeroSection';
import CourseCategories from '../components/CourseCategories';
import HowItWorks from '../components/HowItWorks';
import WhatYouGet from '../components/WhatYouGet';
import Testimonials from '../components/Testimonials';
import DemoModal from '../components/DemoModal';
import LoginModal from '../components/LoginModal';

export default function HomePage({ isLoginOpen, onCloseLogin }) {
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  const handleExploreCourses = () => {
    const el = document.getElementById('courses');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* 1. Hero Section */}
      <HeroSection 
        onWatchDemo={() => setIsDemoOpen(true)}
        onExploreCourses={handleExploreCourses}
      />

      {/* 2. Course Categories Section (MOST IMPORTANT SECTION) */}
      <CourseCategories />

      {/* 3. How It Works Section */}
      <HowItWorks 
        onExploreCourses={handleExploreCourses}
      />

      {/* 4. What You Get Section */}
      <WhatYouGet />

      {/* 5. Testimonials Section */}
      <Testimonials />

      {/* Interactive Modals */}
      <DemoModal 
        isOpen={isDemoOpen} 
        onClose={() => setIsDemoOpen(false)}
        onExploreCourses={handleExploreCourses}
      />

      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={onCloseLogin}
      />
    </div>
  );
}
