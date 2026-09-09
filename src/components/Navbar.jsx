import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Stethoscope, Menu, X, ArrowRight, UserCheck, Sparkles } from 'lucide-react';

export default function Navbar({ onOpenLogin, onOpenDemo }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    setMobileMenuOpen(false);
    if (!isHomePage) {
      window.location.href = `/#${sectionId}`;
      return;
    }
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled ? 'glass-nav shadow-sm py-3' : 'bg-white/95 backdrop-blur-md py-4 border-b border-slate-100'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group focus:outline-none">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-brand-500/25 group-hover:scale-105 transition-transform">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-slate-900 font-sans">
                  MedPrep<span className="text-brand-600">Pro</span>
                </span>
                <span className="bg-brand-100 text-brand-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                  Global
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Medical Licensing Exam Platform
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => scrollToSection('hero')}
              className="text-sm font-semibold text-slate-700 hover:text-brand-600 transition-colors"
            >
              Home
            </button>
            <button 
              onClick={() => scrollToSection('courses')}
              className="text-sm font-semibold text-slate-700 hover:text-brand-600 transition-colors flex items-center gap-1"
            >
              Courses
              <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
            </button>
            <button 
              onClick={() => scrollToSection('how-it-works')}
              className="text-sm font-semibold text-slate-700 hover:text-brand-600 transition-colors"
            >
              How It Works
            </button>
            <button 
              onClick={() => scrollToSection('what-you-get')}
              className="text-sm font-semibold text-slate-700 hover:text-brand-600 transition-colors"
            >
              What You Get
            </button>
            <button 
              onClick={() => scrollToSection('testimonials')}
              className="text-sm font-semibold text-slate-700 hover:text-brand-600 transition-colors"
            >
              Testimonials
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-2.5">
            <Link
              to="/student/dashboard"
              className="px-3 py-1.5 text-xs font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200/80 rounded-xl transition-all"
            >
              Student LMS
            </Link>
            <Link
              to="/faculty"
              className="px-3 py-1.5 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200/80 rounded-xl transition-all"
            >
              Faculty
            </Link>
            <Link
              to="/admin"
              className="px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 rounded-xl transition-all"
            >
              Admin
            </Link>
            <button
              onClick={onOpenLogin}
              className="px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:text-brand-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
            >
              Login
            </button>
            <button
              onClick={() => scrollToSection('courses')}
              className="px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 active:scale-95 rounded-xl shadow-sm shadow-brand-500/25 transition-all flex items-center gap-1.5 group cursor-pointer"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={onOpenLogin}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg cursor-pointer"
            >
              Login
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-slate-200 pb-3 space-y-2 animate-in fade-in slide-in-from-top-2">
            <button
              onClick={() => scrollToSection('hero')}
              className="block w-full text-left px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-100 rounded-lg"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection('courses')}
              className="block w-full text-left px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-100 rounded-lg"
            >
              Courses (NEET PG, USMLE, PLAB, Europe)
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="block w-full text-left px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-100 rounded-lg"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection('what-you-get')}
              className="block w-full text-left px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-100 rounded-lg"
            >
              Everything You Get
            </button>
            <button
              onClick={() => scrollToSection('testimonials')}
              className="block w-full text-left px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-100 rounded-lg"
            >
              Student Reviews
            </button>
            <div className="pt-2 border-t border-slate-200 space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-3">Portals Direct Access</span>
              <div className="grid grid-cols-3 gap-2 px-3">
                <Link
                  to="/student/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2 text-center text-xs font-bold text-brand-700 bg-brand-50 border border-brand-200 rounded-lg"
                >
                  Student LMS
                </Link>
                <Link
                  to="/faculty"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2 text-center text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200 rounded-lg"
                >
                  Faculty
                </Link>
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2 text-center text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg"
                >
                  Admin
                </Link>
              </div>
            </div>
            <div className="pt-2">
              <button
                onClick={() => scrollToSection('courses')}
                className="w-full py-2.5 text-center text-sm font-bold text-white bg-brand-600 rounded-xl shadow"
              >
                Choose Exam & Get Started
              </button>
            </div>
          </div>
        )}

      </div>
    </header>
  );
}
