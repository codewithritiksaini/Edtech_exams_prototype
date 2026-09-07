import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Stethoscope, 
  Bell, 
  ChevronDown, 
  LogOut, 
  ExternalLink,
  ShieldCheck,
  Crown,
  GraduationCap,
  Menu
} from 'lucide-react';
import { authService, USER_ROLES } from '../../services/authService';

export default function AdminNavbar({ onToggleSidebar }) {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);

  useEffect(() => {
    const unsubscribe = authService.subscribe((user) => {
      setCurrentUser(user);
    });
    return unsubscribe;
  }, []);

  const handleLogout = () => {
    setProfileDropdownOpen(false);
    authService.logout();
    navigate('/login');
  };

  const isAdmin = currentUser?.role === USER_ROLES.ADMIN;

  const dummyNotifications = [
    {
      id: 1,
      title: 'New Student Enrolled in USMLE Premium',
      desc: 'Dr. Kabir Anand completed 12-month tier enrollment.',
      time: '8m ago'
    },
    {
      id: 2,
      title: 'Cardiology Grand Mock #01 Results Ready',
      desc: '412 resident submissions evaluated and ranked.',
      time: '1h ago'
    },
    {
      id: 3,
      title: 'Day 3 Content Published',
      desc: 'High-Yield Arrhythmia PDF notes & ECG strips live on student LMS.',
      time: '3h ago'
    }
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-slate-200 shadow-xs font-sans h-16">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
          
          {/* Left: Hamburger + Brand Logo + Auto-Detected Role Badge */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 focus:outline-none cursor-pointer"
              aria-label="Toggle Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link to="/admin" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-slate-900">
                  MedPrep<span className="text-indigo-600">Pro</span>
                </span>
                <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-indigo-200 hidden sm:inline-block">
                  Admin Portal
                </span>
              </div>
            </Link>

            {/* Account Role Badge (Determined by login credentials, not manual toggle) */}
            <div className="hidden md:flex items-center gap-2 pl-3 border-l border-slate-200">
              {isAdmin ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                  <Crown className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Super Admin Account</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-800 text-xs font-bold">
                  <GraduationCap className="w-3.5 h-3.5 text-purple-600" />
                  <span>Faculty Account ({currentUser?.assignedScope ? 'Cardiology' : 'Faculty Scope'})</span>
                </span>
              )}
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2.5 sm:gap-4">
            
            {/* View Student LMS Demo Shortcut */}
            <Link
              to="/dashboard"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200 transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              <span>View Student LMS</span>
            </Link>

            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  setProfileDropdownOpen(false);
                }}
                className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Admin Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-white animate-pulse" />
                )}
              </button>

              {notificationsOpen && (
                <div 
                  className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50 animate-in fade-in slide-in-from-top-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-4 pb-2.5 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Platform Notifications</h4>
                      <p className="text-[11px] text-slate-500">Live system updates</p>
                    </div>
                    <button
                      onClick={() => setUnreadCount(0)}
                      className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                    >
                      Mark all read
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                    {dummyNotifications.map((notif) => (
                      <div 
                        key={notif.id}
                        className="p-3.5 hover:bg-slate-50 transition-colors flex items-start gap-3"
                      >
                        <div className="w-2 h-2 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                        <div className="space-y-0.5">
                          <h5 className="text-xs font-bold text-slate-900 leading-snug">
                            {notif.title}
                          </h5>
                          <p className="text-[11px] text-slate-500 leading-relaxed">
                            {notif.desc}
                          </p>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {notif.time}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 px-4 border-t border-slate-100 text-center">
                    <span className="text-xs text-indigo-600 font-bold hover:underline cursor-pointer">
                      View full audit log →
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Avatar & Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setProfileDropdownOpen(!profileDropdownOpen);
                  setNotificationsOpen(false);
                }}
                className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <img
                  src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'}
                  alt={currentUser?.name || 'User'}
                  className="w-8 h-8 rounded-xl object-cover ring-2 ring-indigo-600/30"
                />
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1">
                    <span>{currentUser?.name}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <div className="text-[10px] text-indigo-700 font-medium truncate max-w-[140px]">
                    {currentUser?.roleLabel}
                  </div>
                </div>
              </button>

              {profileDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900">{currentUser?.name}</p>
                    <p className="text-[11px] text-slate-500">{currentUser?.email}</p>
                    <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-bold">
                      <ShieldCheck className="w-3 h-3 text-indigo-600" />
                      <span>{currentUser?.assignedScope}</span>
                    </div>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/dashboard"
                      className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                      <span>Open Student LMS Portal</span>
                    </Link>
                  </div>

                  <div className="pt-1 border-t border-slate-100">
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 font-bold flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
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
    {/* Permanent spacer taking 64px (h-16) document flow space so page content starts below the fixed navbar */}
    <div className="h-16 shrink-0 w-full" aria-hidden="true" />
  </>
  );
}
