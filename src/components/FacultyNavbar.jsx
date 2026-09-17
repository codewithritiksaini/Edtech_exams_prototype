import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Stethoscope, 
  ExternalLink, 
  Bell, 
  User, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  ChevronDown,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { facultyProfileData } from '../data/mockData';

export default function FacultyNavbar({ onToggleSidebar, isSidebarOpen }) {
  const navigate = useNavigate();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const handleLogout = () => {
    setProfileDropdownOpen(false);
    navigate('/faculty/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white text-slate-900 border-b border-slate-200 shadow-xs">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left: Mobile hamburger + Logo + Faculty Portal Badge */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle Sidebar"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link to="/faculty" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-slate-900 font-sans">
                  MedPrep<span className="text-indigo-600">Pro</span>
                </span>
                <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider hidden sm:inline-block">
                  Faculty Portal
                </span>
              </div>
            </Link>
          </div>

          {/* Right: Quick Switch to Student LMS + Faculty Profile Dropdown */}
          <div className="flex items-center gap-3">
            
            {/* Quick Demo Shortcut to Student LMS for Presentation Preview */}
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition-colors shadow-xs"
              title="Preview Student LMS experience for demo presentation (read-only)"
            >
              <span>Preview Student Experience</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            {/* Notification Bell */}
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors relative"
              aria-label="Faculty Alerts"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-white" />
            </button>

            {/* Faculty Avatar Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-100 transition-colors focus:outline-none"
              >
                <img
                  src={facultyProfileData.avatar}
                  alt={facultyProfileData.name}
                  className="w-8 h-8 rounded-full object-cover border-2 border-indigo-500 shadow-xs"
                />
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-bold text-slate-900 leading-tight">
                    {facultyProfileData.name}
                  </div>
                  <div className="text-[10px] text-indigo-600 font-semibold">
                    Clinical Faculty Lead
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 text-slate-800">
                  <div className="p-4 border-b border-slate-100 bg-slate-50">
                    <div className="text-sm font-bold text-slate-900">{facultyProfileData.name}</div>
                    <div className="text-xs text-slate-500">{facultyProfileData.degree}</div>
                    <div className="text-[10px] text-indigo-600 font-medium mt-1">{facultyProfileData.institution}</div>
                  </div>

                  <div className="p-2 space-y-1">
                    <Link
                      to="/dashboard"
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Switch to Student Dashboard</span>
                    </Link>
                    <button
                      onClick={() => setProfileDropdownOpen(false)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <Settings className="w-4 h-4 text-slate-500" />
                      <span>Curriculum Settings</span>
                    </button>
                    <div className="border-t border-slate-100 my-1" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
}
