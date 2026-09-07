import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Package, 
  Users, 
  GraduationCap, 
  UploadCloud, 
  Video, 
  FileText, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Radio, 
  Sparkles, 
  Search, 
  Image as ImageIcon, 
  Brain, 
  X, 
  Crown, 
  TrendingUp, 
  DollarSign, 
  Layers
} from 'lucide-react';
import AdminNavbar from '../components/admin/AdminNavbar';
import AdminSidebar from '../components/admin/AdminSidebar';
import ManageExamsTab from '../components/admin/ManageExamsTab';
import ManagePackagesTab from '../components/admin/ManagePackagesTab';
import ManageFacultyTab from '../components/admin/ManageFacultyTab';
import ManageStudentsTab from '../components/admin/ManageStudentsTab';
import ContentManagementTab from '../components/admin/ContentManagementTab';
import LiveSessionsTab from '../components/admin/LiveSessionsTab';
import ManageTestsTab from '../components/admin/ManageTestsTab';
import ReportsAnalyticsTab from '../components/admin/ReportsAnalyticsTab';
import { authService, USER_ROLES } from '../services/authService';
import { 
  testService, 
  initialCohortTestResults, 
  dashboardLiveSessions 
} from '../data/mockData';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());

  // If user is not logged in or is a student, redirect to appropriate destination
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user) {
      navigate('/login');
    } else if (user.role === USER_ROLES.STUDENT) {
      navigate('/dashboard');
    } else {
      setCurrentUser(user);
    }

    const unsubscribe = authService.subscribe((updatedUser) => {
      if (!updatedUser) {
        navigate('/login');
      } else if (updatedUser.role === USER_ROLES.STUDENT) {
        navigate('/dashboard');
      } else {
        setCurrentUser(updatedUser);
      }
    });
    return unsubscribe;
  }, [navigate]);

  const isAdmin = currentUser?.role === USER_ROLES.ADMIN;

  // Active tab state: 'dashboard' | 'exams' | 'packages' | 'faculty' | 'students' | 'content' | 'live' | 'tests' | 'analytics'
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Persistent Sidebar Pin/Unpin state
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

  // If activeTab is restricted for Faculty, reset to dashboard
  useEffect(() => {
    if (!isAdmin && ['packages', 'faculty', 'analytics'].includes(activeTab)) {
      setActiveTab('dashboard');
    }
  }, [isAdmin, activeTab]);

  // Current formatted date
  const todayDateString = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  // =========================================================================
  // CONTENT MANAGEMENT STATE (Course → Week → Day)
  // =========================================================================
  const [selectedCourse, setSelectedCourse] = useState('neet-pg');
  const [selectedWeek, setSelectedWeek] = useState('1');
  const [selectedDay, setSelectedDay] = useState('3');
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState('');

  const [pdfTitle, setPdfTitle] = useState('Clinical ECG Mastery: Arrhythmias & AV Blocks');
  const [pdfFile, setPdfFile] = useState('ECG_Mastery_Arrhythmias_2026.pdf');
  const [imageCaption, setImageCaption] = useState('Fig: Monomorphic VT with AV Dissociation & Extreme Right Axis');
  const [videoTitle, setVideoTitle] = useState('Wide Complex Tachycardias: Brugada vs Vereckei Criteria');
  const [videoLink, setVideoLink] = useState('https://vimeo.com/medpreppro/cardio-day03-wct');
  const [flashcardList, setFlashcardList] = useState([
    { question: 'Hallmark of AV dissociation in VT?', answer: 'Independent sinus P waves marching across wide QRS complexes with capture & fusion beats.' },
    { question: 'First-line drug for stable Monomorphic VT with normal LV function?', answer: 'IV Procainamide or IV Amiodarone. Avoid CCBs (Verapamil).' }
  ]);
  const [newCardQ, setNewCardQ] = useState('');
  const [newCardA, setNewCardA] = useState('');

  // =========================================================================
  // LIVE SESSIONS STATE
  // =========================================================================
  const [liveSessions, setLiveSessions] = useState(dashboardLiveSessions);
  const [sessionTitle, setSessionTitle] = useState('');
  const [sessionDate, setSessionDate] = useState('2026-09-06');
  const [sessionTime, setSessionTime] = useState('20:00');
  const [sessionTopic, setSessionTopic] = useState('STEMI & Acute Coronary Syndrome Drills');
  const [sessionLink, setSessionLink] = useState('https://zoom.us/j/medprep-grand-rounds-08');

  // =========================================================================
  // TEST MANAGEMENT STATE
  // =========================================================================
  const [scheduledTests, setScheduledTests] = useState(() => testService.getAllTests());
  const [newTestCourse, setNewTestCourse] = useState('neet-pg');
  const [newTestName, setNewTestName] = useState('');
  const [newTestBatch, setNewTestBatch] = useState('All Enrolled Students');
  const [newTestDate, setNewTestDate] = useState('2026-09-13');
  const [newTestTime, setNewTestTime] = useState('10:00');
  const [newTestDuration, setNewTestDuration] = useState('45 mins');
  const [newTestQuestions, setNewTestQuestions] = useState(20);
  const [newTestMarks, setNewTestMarks] = useState(100);

  // Cohort Results Modal State
  const [cohortModalOpen, setCohortModalOpen] = useState(false);
  const [selectedCohortTest, setSelectedCohortTest] = useState(null);
  const [cohortSubmissions, setCohortSubmissions] = useState(initialCohortTestResults);

  useEffect(() => {
    const unsubscribe = testService.subscribe((updatedTests) => {
      setScheduledTests(updatedTests);
      const studentSubmissions = testService.getStudentSubmissions();
      if (studentSubmissions.length > 0) {
        const enriched = [
          ...studentSubmissions.map(s => ({
            id: `sub-student-${s.testId}`,
            candidateName: s.candidateName,
            rollNo: s.rollNo,
            score: s.score,
            totalMarks: s.totalMarks,
            percentage: s.percentage,
            timeTaken: s.timeTakenFormatted,
            status: s.status,
            submittedAt: s.submittedAt,
            isCurrentStudent: true
          })),
          ...initialCohortTestResults.filter(r => !r.isCurrentStudent)
        ];
        setCohortSubmissions(enriched);
      }
    });
    return unsubscribe;
  }, []);

  // =========================================================================
  // STUDENTS DIRECTORY STATE
  // =========================================================================
  const [studentSearch, setStudentSearch] = useState('');
  const studentDirectory = [
    { id: 1, name: 'Dr. Ritik Saini', roll: 'MEDPREP-2026-NEET-0428', course: 'NEET PG & NExT 2026', package: 'Standard (6 Mo)', progress: '32%', score: '76/100', status: 'Active' },
    { id: 2, name: 'Dr. Kabir Anand', roll: 'MEDPREP-2026-USMLE-0112', course: 'USMLE Step 1 & 2', package: 'Premium (12 Mo)', progress: '48%', score: '88/100', status: 'Active' },
    { id: 3, name: 'Dr. Sarah Jenkins', roll: 'MEDPREP-2026-PLAB-0891', course: 'PLAB 1 & 2 (UK)', package: 'Standard (6 Mo)', progress: '65%', score: '82/100', status: 'Active' },
    { id: 4, name: 'Dr. Lukas Weber', roll: 'MEDPREP-2026-EUR-0344', course: 'Europe Licensing (EU)', package: 'Basic (3 Mo)', progress: '19%', score: '64/100', status: 'Active' },
    { id: 5, name: 'Dr. Priya Sharma', roll: 'MEDPREP-2026-NEET-0914', course: 'NEET PG & NExT 2026', package: 'Premium (12 Mo)', progress: '74%', score: '92/100', status: 'Active' }
  ];

  // Actions
  const handleAddFlashcard = () => {
    if (!newCardQ || !newCardA) return;
    setFlashcardList([...flashcardList, { question: newCardQ, answer: newCardA }]);
    setNewCardQ('');
    setNewCardA('');
  };

  const handleRemoveFlashcard = (idx) => {
    setFlashcardList(flashcardList.filter((_, i) => i !== idx));
  };

  const handleSaveContent = () => {
    setUploadSuccessMessage(`Successfully published Day ${selectedDay} (${selectedCourse.toUpperCase()}) content to student LMS!`);
    setTimeout(() => setUploadSuccessMessage(''), 4000);
  };

  const handleScheduleSession = (e) => {
    e.preventDefault();
    if (!sessionTitle) return;
    const newSession = {
      id: Date.now(),
      title: sessionTitle,
      faculty: currentUser?.name || 'Dr. Siddharth V.',
      time: `${sessionTime} IST`,
      topic: sessionTopic,
      attendees: 120,
      zoomUrl: sessionLink
    };
    setLiveSessions([newSession, ...liveSessions]);
    setSessionTitle('');
    alert('Live Grand Round session broadcast scheduled successfully!');
  };

  const handleScheduleTest = (e) => {
    e.preventDefault();
    if (!newTestName) return;
    const created = testService.addTest({
      name: newTestName,
      courseId: newTestCourse,
      batch: newTestBatch,
      dateTime: `${newTestDate} @ ${newTestTime} IST`,
      duration: newTestDuration,
      totalQuestions: Number(newTestQuestions),
      totalMarks: Number(newTestMarks)
    });
    setNewTestName('');
    alert(`Assessment "${created.name}" created and synced with student test portal!`);
  };

  const handleOpenCohortResults = (test) => {
    setSelectedCohortTest(test);
    setCohortModalOpen(true);
  };

  // Filter students based on role scope (Rule 2)
  const visibleStudents = studentDirectory.filter((s) => {
    const matchesQuery = s.name.toLowerCase().includes(studentSearch.toLowerCase()) || 
                         s.roll.toLowerCase().includes(studentSearch.toLowerCase()) ||
                         s.course.toLowerCase().includes(studentSearch.toLowerCase());
    if (!isAdmin) {
      // Faculty only sees Cardiology / NEET PG students
      return matchesQuery && s.course.includes('NEET PG');
    }
    return matchesQuery;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans overflow-x-hidden w-full max-w-full">
      
      {/* Top Persistent Admin Navbar */}
      <AdminNavbar 
        onToggleSidebar={handleToggleSidebar}
      />

      <div className="flex-grow flex min-w-0 w-full max-w-full overflow-x-hidden">
        
        {/* Left Persistent Admin Sidebar (Automatically Scoped) */}
        <AdminSidebar 
          activeTab={activeTab}
          onSelectTab={(tab) => setActiveTab(tab)}
          isPinned={isSidebarPinned}
          onTogglePin={handleTogglePin}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Main Content Viewport */}
        <main className="flex-grow min-w-0 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">

          {/* ===================================================================== */}
          {/* TAB 1: DASHBOARD OVERVIEW (PHASE 5.1 MISSION CONTROL)                 */}
          {/* ===================================================================== */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-in fade-in">
              
              {/* Top Greeting Banner */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      {todayDateString}
                    </span>
                    <span className="text-slate-300">•</span>
                    {isAdmin ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                        <Crown className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Super Admin (Full Platform Control)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 border border-purple-200 text-purple-800 text-xs font-bold">
                        <GraduationCap className="w-3.5 h-3.5 text-purple-600" />
                        <span>Faculty Account (Cardiology Scope)</span>
                      </span>
                    )}
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {isAdmin ? 'Welcome, Super Admin 👋' : `Welcome, ${currentUser?.name || 'Faculty Member'} 👨‍⚕️`}
                  </h1>

                  <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
                    {isAdmin
                      ? 'Platform Mission Control. Orchestrate all 4 medical licensing tracks, 12 subscription tiers, faculty assignments, daily drip feeds, and proctored CBT series.'
                      : 'Clinical Teaching Workspace. Manage daily arrhythmia notes, ECG lightbox strips, live grand rounds, and Cardiology mock test evaluations.'}
                  </p>
                </div>

                {/* Account Scope Summary Badge */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1 shrink-0 self-start md:self-auto min-w-[240px]">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Authenticated Account
                  </div>
                  <div className="text-xs font-extrabold text-slate-900">
                    {currentUser?.email}
                  </div>
                  <div className="text-[11px] text-indigo-700 font-semibold pt-1">
                    {isAdmin ? 'Full Platform Authority' : currentUser?.assignedScope}
                  </div>
                </div>
              </div>

              {/* Summary Cards Row (Part D - 5 cards for Admin, 4 cards for Faculty) */}
              {isAdmin ? (
                /* ADMIN SUMMARY CARDS (5 Full Platform Cards) */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500">Live Exam Tracks</span>
                      <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <BookOpen className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-2xl font-black text-slate-900">4 Categories</div>
                    <div className="text-[11px] text-indigo-700 font-bold">
                      NEET PG, USMLE, PLAB, Europe
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500">Active Packages</span>
                      <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                        <Package className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-2xl font-black text-slate-900">12 Tiers</div>
                    <div className="text-[11px] text-purple-700 font-bold">
                      Basic / Standard / Premium
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500">Enrolled Students</span>
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <Users className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-2xl font-black text-slate-900">1,420 Doctors</div>
                    <div className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      <span>+84 this week • 96% Active</span>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500">Clinical Faculty</span>
                      <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-2xl font-black text-slate-900">8 Members</div>
                    <div className="text-[11px] text-amber-700 font-bold">
                      AIIMS, PGI & Top Hospital Leads
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2 sm:col-span-2 lg:col-span-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500">Platform Revenue</span>
                      <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                        <DollarSign className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-2xl font-black text-slate-900">₹5,20,000</div>
                    <div className="text-[11px] text-brand-700 font-bold flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      <span>+18.4% MRR growth</span>
                    </div>
                  </div>

                </div>
              ) : (
                /* FACULTY SUMMARY CARDS (4 Scoped Cards) */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500">Assigned Exam Modules</span>
                      <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                        <BookOpen className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-2xl font-black text-slate-900">2 Active Tracks</div>
                    <div className="text-[11px] text-purple-700 font-bold">
                      NEET PG & USMLE Cardio (Weeks 1–4)
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500">Students in My Scope</span>
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <Users className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-2xl font-black text-slate-900">680 Candidates</div>
                    <div className="text-[11px] text-emerald-700 font-bold">
                      Currently studying Week 1 Cardio
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500">Units Uploaded This Week</span>
                      <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <UploadCloud className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-2xl font-black text-slate-900">14 Units</div>
                    <div className="text-[11px] text-indigo-700 font-bold">
                      Week 1 Curriculum 100% Ready
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500">Upcoming Live Grand Rounds</span>
                      <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                        <Radio className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-2xl font-black text-red-600">2 Scheduled</div>
                    <div className="text-[11px] text-slate-600 font-bold">
                      Tonight @ 8:00 PM IST
                    </div>
                  </div>

                </div>
              )}

              {/* Quick Action Shortcuts Bar */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Quick Operational Shortcuts
                  </span>
                  <span className="text-[11px] text-slate-400">1-click navigation into modules</span>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  {isAdmin ? (
                    <>
                      <button
                        onClick={() => setActiveTab('exams')}
                        className="px-3.5 py-2 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Add New Exam</span>
                      </button>

                      <button
                        onClick={() => setActiveTab('packages')}
                        className="px-3.5 py-2 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Add Package Tier</span>
                      </button>

                      <button
                        onClick={() => setActiveTab('faculty')}
                        className="px-3.5 py-2 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Assign Faculty</span>
                      </button>
                    </>
                  ) : null}

                  <button
                    onClick={() => setActiveTab('content')}
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Upload Daily Content</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('live')}
                    className="px-3.5 py-2 bg-slate-50 hover:bg-red-50 hover:text-red-700 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Radio className="w-3.5 h-3.5 text-red-600" />
                    <span>Schedule Live Round</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('tests')}
                    className="px-3.5 py-2 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Create Mock Test</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('students')}
                    className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Users className="w-3.5 h-3.5 text-slate-500" />
                    <span>{isAdmin ? 'View All Students (1.4k)' : 'View My Students (680)'}</span>
                  </button>
                </div>
              </div>

              {/* Two Column Layout: Recent Activity Feed + Curriculum Readiness */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left 2 Columns: Activity Feed */}
                <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-indigo-600" />
                      <h3 className="text-base font-bold text-slate-900">
                        {isAdmin ? 'Recent Platform-Wide Activity' : 'Recent Scope Activity & Submissions'}
                      </h3>
                    </div>
                    <span className="text-xs text-slate-400">Live Audit Log</span>
                  </div>

                  <div className="divide-y divide-slate-100">
                    
                    <div className="py-3 flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">New Student Enrolled in NEET PG Standard</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Enrollment
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">
                          Dr. Ritik Saini (Roll: MEDPREP-2026-NEET-0428) purchased 6-month tier.
                        </p>
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium shrink-0">12 mins ago</span>
                    </div>

                    <div className="py-3 flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">Dr. Siddharth V. uploaded Day 3 Arrhythmia Content</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                            Curriculum
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">
                          Published high-yield PDF notes, 2 ECG strips, and 4 active recall flashcards for NEET PG Week 1.
                        </p>
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium shrink-0">1 hour ago</span>
                    </div>

                    <div className="py-3 flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">Live Grand Round Scheduled: STEMI & Acute ECG Drills</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-50 text-red-700 border border-red-200">
                            Live Session
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">
                          Assigned to Dr. Siddharth V. Scheduled for Tonight @ 8:00 PM IST (340+ registered).
                        </p>
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium shrink-0">3 hours ago</span>
                    </div>

                    <div className="py-3 flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">Cardiology Grand Mock Test #01 Submissions Processed</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                            Test Evaluated
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">
                          412 candidate submissions evaluated and national percentiles updated.
                        </p>
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium shrink-0">5 hours ago</span>
                    </div>

                    {isAdmin && (
                      <div className="py-3 flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900">New Faculty Assigned: Dr. Ananya Sen</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                              Faculty Scope
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">
                            Assigned to USMLE Step 1 & 2 CK Clinical Pharmacology track.
                          </p>
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium shrink-0">Yesterday</span>
                      </div>
                    )}

                  </div>
                </div>

                {/* Right 1 Column: Platform Health & Mission Control Widget */}
                <div className="space-y-6">
                  
                  {/* Curriculum Readiness Widget */}
                  <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-indigo-600" />
                        <h4 className="text-sm font-bold text-slate-900">Curriculum Readiness</h4>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Operational
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-bold text-slate-700">NEET PG & NExT 2026</span>
                          <span className="font-mono font-bold text-indigo-600">100%</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-600 rounded-full w-full" />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-bold text-slate-700">USMLE Step 1 & 2 CK</span>
                          <span className="font-mono font-bold text-indigo-600">92%</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-600 rounded-full w-[92%]" />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-bold text-slate-700">PLAB 1 & 2 (UK GMC)</span>
                          <span className="font-mono font-bold text-indigo-600">88%</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-600 rounded-full w-[88%]" />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-bold text-slate-700">Europe Medical Licensing</span>
                          <span className="font-mono font-bold text-indigo-600">75%</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-600 rounded-full w-[75%]" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Presentation Note Callout */}
                  <div className="bg-gradient-to-br from-indigo-50/70 via-purple-50/40 to-white rounded-3xl p-5 border border-indigo-100 shadow-sm space-y-2.5">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-100/80 text-indigo-800 text-[10px] font-bold uppercase tracking-wider">
                      <Sparkles className="w-3 h-3 text-indigo-600" />
                      <span>Role-Based Scoping</span>
                    </div>

                    <h4 className="text-xs font-extrabold text-slate-900 leading-snug">
                      {isAdmin ? 'Super Admin Mission Control' : 'Cardiology Faculty Teaching Workspace'}
                    </h4>

                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {isAdmin 
                        ? 'As an Admin, you have unrestricted authority over all 4 exam tracks, commercial pricing, faculty assignments, and subscription revenues.'
                        : 'As a Faculty member, your dashboard is automatically scoped to your assigned cardiology modules. Course creation and revenue reports are restricted.'}
                    </p>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 2: COURSE SETUP — MANAGE EXAMS & COURSES (ADMIN & FACULTY)      */}
          {/* ===================================================================== */}
          {activeTab === 'exams' && (
            <ManageExamsTab />
          )}

          {/* ===================================================================== */}
          {/* TAB 3: COURSE SETUP — MANAGE PACKAGES (ADMIN ONLY)                    */}
          {/* ===================================================================== */}
          {activeTab === 'packages' && isAdmin && (
            <ManagePackagesTab />
          )}

          {/* ===================================================================== */}
          {/* TAB 4: MANAGE FACULTY (ADMIN ONLY)                                    */}
          {/* ===================================================================== */}
          {activeTab === 'faculty' && isAdmin && (
            <ManageFacultyTab />
          )}

          {/* ===================================================================== */}
          {/* TAB 5: MANAGE STUDENTS (FILTERED BY SCOPE)                             */}
          {/* ===================================================================== */}
          {activeTab === 'students' && (
            <ManageStudentsTab />
          )}

          {/* ===================================================================== */}
          {/* TAB 6: CONTENT MANAGEMENT (PHASE 5.4 INTEGRATION)                     */}
          {/* ===================================================================== */}
          {activeTab === 'content' && (
            <ContentManagementTab />
          )}

          {/* ===================================================================== */}
          {/* TAB 7: LIVE SESSIONS (PHASE 5.5 PART A)                               */}
          {/* ===================================================================== */}
          {activeTab === 'live' && (
            <LiveSessionsTab />
          )}

          {/* ===================================================================== */}
          {/* TAB 8: MANAGE TESTS & COHORT RESULTS (PHASE 5.5 PART B)               */}
          {/* ===================================================================== */}
          {activeTab === 'tests' && (
            <ManageTestsTab />
          )}

          {/* ===================================================================== */}
          {/* TAB 9: REPORTS & ANALYTICS (PHASE 5.5 PART C - ADMIN ONLY)            */}
          {/* ===================================================================== */}
          {activeTab === 'analytics' && isAdmin && (
            <ReportsAnalyticsTab />
          )}

        </main>
      </div>

    </div>
  );
}
