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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // If activeTab is restricted for Faculty, reset to dashboard
  useEffect(() => {
    if (!isAdmin && ['exams', 'packages', 'faculty', 'analytics'].includes(activeTab)) {
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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      
      {/* Top Persistent Admin Navbar */}
      <AdminNavbar 
        onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
      />

      <div className="flex-grow flex">
        
        {/* Left Persistent Admin Sidebar (Automatically Scoped) */}
        <AdminSidebar 
          activeTab={activeTab}
          onSelectTab={(tab) => setActiveTab(tab)}
          isCollapsed={isSidebarCollapsed}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Main Content Viewport */}
        <main className="flex-grow p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">

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
          {/* TAB 2: COURSE SETUP — MANAGE EXAMS (ADMIN ONLY)                       */}
          {/* ===================================================================== */}
          {activeTab === 'exams' && isAdmin && (
            <div className="space-y-6 animate-in fade-in">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Course Setup (Phase 5.2)</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                      Manage Medical Exam Tracks
                    </h2>
                    <p className="text-xs text-slate-500">
                      Rule 3 Enforced: Packages and content depend on these master exam categories.
                    </p>
                  </div>

                  <button className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer">
                    <Plus className="w-4 h-4" />
                    <span>Create New Exam Category</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {[
                    { id: 'neet-pg', name: 'NEET PG & NExT 2026', flag: '🇮🇳 India', weeks: 28, status: 'Active', packages: 3 },
                    { id: 'usmle', name: 'USMLE Step 1 & 2 CK', flag: '🇺🇸 United States', weeks: 24, status: 'Active', packages: 3 },
                    { id: 'plab', name: 'PLAB 1 & 2 (UK GMC)', flag: '🇬🇧 United Kingdom', weeks: 16, status: 'Active', packages: 3 },
                    { id: 'europe', name: 'European Medical Licensing', flag: '🇪🇺 Germany/Switzerland', weeks: 12, status: 'Active', packages: 3 }
                  ].map((exam) => (
                    <div key={exam.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                          {exam.flag}
                        </span>
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {exam.status}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900">{exam.name}</h3>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span>📚 {exam.weeks} Weeks Curriculum</span>
                        <span>📦 {exam.packages} Package Tiers</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 3: COURSE SETUP — MANAGE PACKAGES (ADMIN ONLY)                    */}
          {/* ===================================================================== */}
          {activeTab === 'packages' && isAdmin && (
            <div className="space-y-6 animate-in fade-in">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold">
                      <Package className="w-3.5 h-3.5 text-purple-600" />
                      <span>Package Tiers & Feature Toggles (Phase 5.2)</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                      Manage Package Tiers & Permissions
                    </h2>
                    <p className="text-xs text-slate-500">
                      Rule 4 Enforced: Toggling features off disables corresponding student tabs.
                    </p>
                  </div>

                  <button className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer">
                    <Plus className="w-4 h-4" />
                    <span>Create New Package</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  {[
                    { name: 'Basic Tier', validity: '3 Months', price: '₹14,999', features: ['PDF Notes: ON', 'Video Lessons: ON', 'Flashcards: OFF', 'Live Grand Rounds: OFF', 'Test Series: 5 Tests'] },
                    { name: 'Standard Tier', validity: '6 Months', price: '₹24,999', features: ['PDF Notes: ON', 'Video Lessons: ON', 'Flashcards: ON', 'Live Grand Rounds: ON', 'Test Series: 15 Tests'], popular: true },
                    { name: 'Premium Tier', validity: '12 Months', price: '₹39,999', features: ['PDF Notes: ON', 'Video Lessons: ON', 'Flashcards: ON', 'Live Grand Rounds: Unlimited', 'Test Series: All 30 Tests'] }
                  ].map((pkg, i) => (
                    <div key={i} className={`p-5 rounded-2xl border ${pkg.popular ? 'border-indigo-400 bg-indigo-50/20' : 'border-slate-200 bg-slate-50'} space-y-3`}>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500">{pkg.validity}</span>
                        {pkg.popular && <span className="text-[10px] bg-indigo-600 text-white font-bold px-2 py-0.5 rounded-full">Most Enrolled</span>}
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">{pkg.name}</h3>
                      <div className="text-xl font-black text-slate-900">{pkg.price}</div>
                      <ul className="text-xs space-y-1 text-slate-600 pt-2 border-t border-slate-200">
                        {pkg.features.map((f, idx) => (
                          <li key={idx} className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 4: MANAGE FACULTY (ADMIN ONLY)                                    */}
          {/* ===================================================================== */}
          {activeTab === 'faculty' && isAdmin && (
            <div className="space-y-6 animate-in fade-in">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold">
                      <GraduationCap className="w-3.5 h-3.5 text-amber-600" />
                      <span>Faculty Directory & Assignment Scope (Phase 5.3)</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                      Manage Faculty Members & Permissions
                    </h2>
                    <p className="text-xs text-slate-500">
                      Rule 7 Enforced: Faculty can only access and manage content within their assigned scope.
                    </p>
                  </div>

                  <button className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer">
                    <Plus className="w-4 h-4" />
                    <span>Add New Faculty Member</span>
                  </button>
                </div>

                <div className="divide-y divide-slate-100 pt-2">
                  {[
                    { name: 'Dr. Siddharth V.', spec: 'MD (AIIMS New Delhi)', track: 'NEET PG & USMLE Cardiology', scope: 'Weeks 1–4', students: '680 Enrolled' },
                    { name: 'Dr. Ananya Sen', spec: 'MD Pharmacology (PGI Chandigarh)', track: 'USMLE Pharmacology', scope: 'Weeks 5–8', students: '420 Enrolled' },
                    { name: 'Dr. Marcus Vance', spec: 'MRCP (UK GMC Lead)', track: 'PLAB 1 & 2 Clinical Practice', scope: 'Weeks 1–16', students: '320 Enrolled' }
                  ].map((fac, i) => (
                    <div key={i} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900">{fac.name}</span>
                          <span className="text-xs text-slate-400 font-medium">{fac.spec}</span>
                        </div>
                        <p className="text-xs text-indigo-700 font-medium">
                          Assigned Track: <strong>{fac.track}</strong> ({fac.scope})
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-xl">
                          {fac.students}
                        </span>
                        <button className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer">
                          Edit Scope
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 5: MANAGE STUDENTS (FILTERED BY SCOPE)                             */}
          {/* ===================================================================== */}
          {activeTab === 'students' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold">
                      <Users className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Enrolled Candidates Directory</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                      {isAdmin ? 'All Enrolled Candidates (1,420)' : 'Cardiology Track Candidates (680)'}
                    </h2>
                    <p className="text-xs text-slate-500">
                      Rule 8 Enforced: Progress is read-only; admin can extend validity or upgrade package tier.
                    </p>
                  </div>

                  {/* Search Bar */}
                  <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      placeholder="Search doctor name, roll no..."
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:bg-white focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Students Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-bold">
                        <th className="pb-3 px-3">Candidate</th>
                        <th className="pb-3 px-3">Enrolled Course</th>
                        <th className="pb-3 px-3">Package Tier</th>
                        <th className="pb-3 px-3">Curriculum Progress</th>
                        <th className="pb-3 px-3">Latest Mock Score</th>
                        <th className="pb-3 px-3">Status</th>
                        <th className="pb-3 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {visibleStudents.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-3">
                            <div className="font-bold text-slate-900">{s.name}</div>
                            <div className="text-[11px] font-mono text-slate-400">{s.roll}</div>
                          </td>
                          <td className="py-3.5 px-3 font-semibold text-slate-700">{s.course}</td>
                          <td className="py-3.5 px-3">
                            <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold border border-indigo-100">
                              {s.package}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 font-mono font-bold text-slate-700">{s.progress}</td>
                          <td className="py-3.5 px-3 font-bold text-brand-600">{s.score}</td>
                          <td className="py-3.5 px-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {s.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-right">
                            <button className="text-indigo-600 hover:text-indigo-800 font-bold text-xs cursor-pointer">
                              Manage Account
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 6: CONTENT MANAGEMENT (PHASE 5.4 INTEGRATION)                     */}
          {/* ===================================================================== */}
          {activeTab === 'content' && (
            <div className="space-y-6 animate-in fade-in">
              
              {/* Cascading Selector: Exam -> Week -> Day */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h2 className="text-lg font-black text-slate-900">
                      Content Hierarchy Selector (Rule 5 Enforced)
                    </h2>
                    <p className="text-xs text-slate-500">
                      Hierarchy: <strong>Exam → Week → Day → Content Type</strong>. No loose content.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
                    Drip-Feed Pipeline
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">1. Select Exam Track</label>
                    <select
                      value={selectedCourse}
                      onChange={(e) => setSelectedCourse(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="neet-pg">NEET PG & NExT 2026</option>
                      {isAdmin && (
                        <>
                          <option value="usmle">USMLE Step 1 & 2 CK</option>
                          <option value="plab">PLAB 1 & 2 (UK GMC)</option>
                          <option value="europe">European Licensing</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">2. Select Week</label>
                    <select
                      value={selectedWeek}
                      onChange={(e) => setSelectedWeek(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="1">Week 1 — Cardiology Basics & Rhythm</option>
                      <option value="2">Week 2 — Valvular Diseases & Echo</option>
                      <option value="3">Week 3 — Heart Failure & Pharmacology</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">3. Select Day</label>
                    <select
                      value={selectedDay}
                      onChange={(e) => setSelectedDay(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="1">Day 1 — Introduction to Vectors</option>
                      <option value="2">Day 2 — Chamber Enlargement</option>
                      <option value="3">Day 3 — Cardiac Arrhythmias & ECG (Active)</option>
                      <option value="4">Day 4 — Ischemic Heart Disease</option>
                    </select>
                  </div>
                </div>

                {uploadSuccessMessage && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{uploadSuccessMessage}</span>
                  </div>
                )}
              </div>

              {/* 4 Content Modality Uploaders */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* 1. PDF Notes */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-600" />
                      <h3 className="text-sm font-bold text-slate-900">PDF High-Yield Notes</h3>
                    </div>
                    <span className="text-[11px] font-bold text-slate-400">PDF Tab</span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Note Title</label>
                      <input
                        type="text"
                        value={pdfTitle}
                        onChange={(e) => setPdfTitle(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Attached PDF File</label>
                      <div className="p-3 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-xs flex items-center justify-between">
                        <span className="font-mono text-slate-600">{pdfFile}</span>
                        <span className="text-indigo-600 font-bold cursor-pointer">Replace</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Video Lecture */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <Video className="w-4 h-4 text-purple-600" />
                      <h3 className="text-sm font-bold text-slate-900">Video Lesson</h3>
                    </div>
                    <span className="text-[11px] font-bold text-slate-400">Video Tab</span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Lesson Title</label>
                      <input
                        type="text"
                        value={videoTitle}
                        onChange={(e) => setVideoTitle(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Video Stream URL</label>
                      <input
                        type="text"
                        value={videoLink}
                        onChange={(e) => setVideoLink(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Image & ECG Strips */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-emerald-600" />
                      <h3 className="text-sm font-bold text-slate-900">Clinical Diagram / ECG Strip</h3>
                    </div>
                    <span className="text-[11px] font-bold text-slate-400">Images Tab</span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Caption / Diagnostic Pearl</label>
                      <input
                        type="text"
                        value={imageCaption}
                        onChange={(e) => setImageCaption(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
                      <div className="w-12 h-12 bg-slate-200 rounded-lg flex items-center justify-center shrink-0">
                        <ImageIcon className="w-5 h-5 text-slate-500" />
                      </div>
                      <div className="text-xs">
                        <div className="font-bold text-slate-800">ecg_vt_dissociation_01.png</div>
                        <div className="text-[11px] text-slate-400">Resolution: 1920x1080 • Zoom Lightbox Enabled</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. Active Recall Flashcards */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <Brain className="w-4 h-4 text-amber-600" />
                      <h3 className="text-sm font-bold text-slate-900">Anki Flashcard Deck ({flashcardList.length} Cards)</h3>
                    </div>
                    <span className="text-[11px] font-bold text-slate-400">Flashcards Tab</span>
                  </div>

                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {flashcardList.map((card, i) => (
                      <div key={i} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs flex items-center justify-between gap-2">
                        <div>
                          <div className="font-bold text-slate-800">Q: {card.question}</div>
                          <div className="text-slate-500 text-[11px]">A: {card.answer}</div>
                        </div>
                        <button onClick={() => handleRemoveFlashcard(i)} className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <input
                      type="text"
                      placeholder="Card Question (Prompt)"
                      value={newCardQ}
                      onChange={(e) => setNewCardQ(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Card Answer (Rationale)"
                        value={newCardA}
                        onChange={(e) => setNewCardA(e.target.value)}
                        className="flex-grow p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                      />
                      <button
                        type="button"
                        onClick={handleAddFlashcard}
                        className="px-3 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700 shrink-0 cursor-pointer"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>

              </div>

              {/* Publish Button Bar */}
              <div className="flex items-center justify-between p-5 bg-white rounded-2xl border border-slate-200">
                <span className="text-xs text-slate-500">
                  Changes save immediately and sync with the student LMS Day Content View.
                </span>
                <button
                  onClick={handleSaveContent}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Publish Day Content Changes</span>
                </button>
              </div>

            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 7: LIVE SESSIONS (PHASE 5.5 INTEGRATION)                          */}
          {/* ===================================================================== */}
          {activeTab === 'live' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-xl font-black text-slate-900">
                      Live Grand Rounds Scheduler (Rule 10 Enforced)
                    </h2>
                    <p className="text-xs text-slate-500">
                      Sessions automatically populate on the Student Dashboard and the assigned Day's Live tab.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-red-700 bg-red-50 px-3 py-1 rounded-full border border-red-200">
                    Live Broadcast Hub
                  </span>
                </div>

                {/* Form */}
                <form onSubmit={handleScheduleSession} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700 block mb-1">Session Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Acute Coronary Syndrome Case Conference"
                      value={sessionTitle}
                      onChange={(e) => setSessionTitle(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Date</label>
                    <input
                      type="date"
                      value={sessionDate}
                      onChange={(e) => setSessionDate(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Time</label>
                    <input
                      type="time"
                      value={sessionTime}
                      onChange={(e) => setSessionTime(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                      required
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700 block mb-1">Clinical Topic</label>
                    <input
                      type="text"
                      value={sessionTopic}
                      onChange={(e) => setSessionTopic(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                      required
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700 block mb-1">Zoom / Broadcast Link</label>
                    <input
                      type="url"
                      value={sessionLink}
                      onChange={(e) => setSessionLink(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                      required
                    />
                  </div>

                  <div className="sm:col-span-4 flex justify-end">
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <Radio className="w-4 h-4" />
                      <span>Schedule Grand Round Broadcast</span>
                    </button>
                  </div>
                </form>

                {/* Scheduled Sessions Table */}
                <div className="pt-4 border-t border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900 mb-3">Scheduled Sessions Roster</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-bold">
                          <th className="pb-3 px-3">Session Title</th>
                          <th className="pb-3 px-3">Faculty Instructor</th>
                          <th className="pb-3 px-3">Scheduled Time</th>
                          <th className="pb-3 px-3">Attendees</th>
                          <th className="pb-3 px-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {liveSessions.map((session) => (
                          <tr key={session.id} className="hover:bg-slate-50/80">
                            <td className="py-3 px-3 font-bold text-slate-900">{session.title}</td>
                            <td className="py-3 px-3 font-medium text-slate-600">{session.faculty}</td>
                            <td className="py-3 px-3 font-mono font-bold text-indigo-700">{session.time}</td>
                            <td className="py-3 px-3 text-slate-600">{session.attendees} Registered</td>
                            <td className="py-3 px-3 text-right">
                              <span className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer">
                                Manage Room
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 8: MANAGE TESTS & COHORT RESULTS (PHASE 5.5 & PHASE 6)             */}
          {/* ===================================================================== */}
          {activeTab === 'tests' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-xl font-black text-slate-900">
                      Assessment Scheduler & CBT Question Engine (Rule 9 Enforced)
                    </h2>
                    <p className="text-xs text-slate-500">
                      Target tests by batch/tier. Synchronized with student CBT testing room.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    Proctored CBT Mode
                  </span>
                </div>

                {/* Create Test Form */}
                <form onSubmit={handleScheduleTest} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Target Exam Course</label>
                    <select
                      value={newTestCourse}
                      onChange={(e) => setNewTestCourse(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                    >
                      <option value="neet-pg">NEET PG & NExT 2026</option>
                      {isAdmin && (
                        <>
                          <option value="usmle">USMLE Step 1 & 2 CK</option>
                          <option value="plab">PLAB 1 & 2 (UK)</option>
                          <option value="europe">Europe Licensing</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700 block mb-1">Test Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Cardiology Mock Test 2 — Arrhythmias & ECG"
                      value={newTestName}
                      onChange={(e) => setNewTestName(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Applicable Tier / Batch</label>
                    <select
                      value={newTestBatch}
                      onChange={(e) => setNewTestBatch(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                    >
                      <option value="All Enrolled Students">All Enrolled Students</option>
                      <option value="Standard & Premium Only">Standard & Premium Only</option>
                      <option value="Premium VIP Only">Premium VIP Only</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Date</label>
                    <input
                      type="date"
                      value={newTestDate}
                      onChange={(e) => setNewTestDate(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Time</label>
                    <input
                      type="time"
                      value={newTestTime}
                      onChange={(e) => setNewTestTime(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Duration</label>
                    <select
                      value={newTestDuration}
                      onChange={(e) => setNewTestDuration(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                    >
                      <option value="30 mins">30 Minutes</option>
                      <option value="45 mins">45 Minutes</option>
                      <option value="60 mins">60 Minutes</option>
                      <option value="90 mins">90 Minutes</option>
                      <option value="2 hours">2 Hours</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Publish Assessment</span>
                    </button>
                  </div>
                </form>

                {/* Scheduled Tests Table */}
                <div className="pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-slate-900">Scheduled Assessment Roster</h3>
                    <span className="text-xs text-slate-500">Live synchronized test store</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-bold">
                          <th className="pb-3 px-3">Test Title</th>
                          <th className="pb-3 px-3">Track & Batch</th>
                          <th className="pb-3 px-3">Date & Time</th>
                          <th className="pb-3 px-3">Format</th>
                          <th className="pb-3 px-3">Status</th>
                          <th className="pb-3 px-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {scheduledTests.map((t) => (
                          <tr key={t.id} className="hover:bg-slate-50/80">
                            <td className="py-3.5 px-3">
                              <div className="font-bold text-slate-900">{t.name}</div>
                              <div className="text-[11px] font-mono text-slate-400">{t.id}</div>
                            </td>
                            <td className="py-3.5 px-3">
                              <div className="font-semibold text-slate-800">{t.courseId.toUpperCase()}</div>
                              <div className="text-[11px] text-slate-500">{t.batch}</div>
                            </td>
                            <td className="py-3.5 px-3 font-medium text-slate-700">{t.dateTime}</td>
                            <td className="py-3.5 px-3 font-mono text-slate-600">
                              {t.totalQuestions} Qs • {t.duration}
                            </td>
                            <td className="py-3.5 px-3">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                {t.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-3 text-right">
                              <button
                                onClick={() => handleOpenCohortResults(t)}
                                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-lg border border-indigo-200 transition-colors cursor-pointer"
                              >
                                View Results ({t.submissionsCount || 412})
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 9: REPORTS & ANALYTICS (ADMIN ONLY)                               */}
          {/* ===================================================================== */}
          {activeTab === 'analytics' && isAdmin && (
            <div className="space-y-6 animate-in fade-in">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-xl font-black text-slate-900">
                      Platform Financial & Cohort Analytics
                    </h2>
                    <p className="text-xs text-slate-500">
                      Rule 2 Enforced: Platform revenue and commercial analytics are restricted to Super Admin.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-brand-700 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
                    SaaS Performance
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                    <span className="text-xs font-semibold text-slate-500">Gross Platform Bookings</span>
                    <div className="text-2xl font-black text-slate-900">₹62.4 Lakhs</div>
                    <span className="text-[11px] font-bold text-emerald-700">+22.8% YoY</span>
                  </div>

                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                    <span className="text-xs font-semibold text-slate-500">Average Student LTV</span>
                    <div className="text-2xl font-black text-slate-900">₹27,800</div>
                    <span className="text-[11px] font-bold text-indigo-700">Standard Tier Dominant</span>
                  </div>

                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                    <span className="text-xs font-semibold text-slate-500">Mock Examination Pass Rate</span>
                    <div className="text-2xl font-black text-slate-900">88.4%</div>
                    <span className="text-[11px] font-bold text-purple-700">High Clinical Mastery</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Cohort Test Results Modal */}
      {cohortModalOpen && selectedCohortTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div 
            className="bg-white rounded-3xl w-full max-w-4xl border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                  Cohort Evaluation Report
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-1">
                  {selectedCohortTest.name}
                </h3>
                <p className="text-xs text-slate-500">
                  Track: {selectedCohortTest.courseId.toUpperCase()} • Duration: {selectedCohortTest.duration}
                </p>
              </div>
              <button
                onClick={() => setCohortModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Top KPI Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-center">
                <div className="text-xs text-slate-500 font-semibold">Total Submissions</div>
                <div className="text-xl font-black text-slate-900">{cohortSubmissions.length}</div>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-center">
                <div className="text-xs text-slate-500 font-semibold">Cohort Average</div>
                <div className="text-xl font-black text-brand-600">76.4%</div>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-center">
                <div className="text-xs text-slate-500 font-semibold">Highest Score</div>
                <div className="text-xl font-black text-emerald-600">96 / 100</div>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-center">
                <div className="text-xs text-slate-500 font-semibold">Pass Rate</div>
                <div className="text-xl font-black text-indigo-600">89.2%</div>
              </div>
            </div>

            {/* Submissions Roster */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase font-bold">
                    <th className="pb-2.5 px-3">Candidate</th>
                    <th className="pb-2.5 px-3">Score</th>
                    <th className="pb-2.5 px-3">Percentage</th>
                    <th className="pb-2.5 px-3">Time Taken</th>
                    <th className="pb-2.5 px-3">Outcome</th>
                    <th className="pb-2.5 px-3">Submitted At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cohortSubmissions.map((sub, idx) => (
                    <tr key={sub.id || idx} className={`hover:bg-slate-50 ${sub.isCurrentStudent ? 'bg-indigo-50/50' : ''}`}>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{sub.candidateName}</span>
                          {sub.isCurrentStudent && (
                            <span className="text-[10px] bg-indigo-600 text-white font-bold px-1.5 py-0.2 rounded-md">
                              Current Student
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">{sub.rollNo}</div>
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-900">{sub.score} / {sub.totalMarks || 100}</td>
                      <td className="py-3 px-3 font-bold text-brand-600">{sub.percentage}%</td>
                      <td className="py-3 px-3 text-slate-600">{sub.timeTaken}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          sub.status === 'Pass' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {sub.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-400 text-[11px]">{sub.submittedAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setCohortModalOpen(false)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
