import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Home, 
  UploadCloud, 
  Video, 
  FileText, 
  Users, 
  BarChart3, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Radio, 
  HelpCircle, 
  Sparkles, 
  AlertCircle, 
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Search,
  BookOpen,
  Image as ImageIcon,
  Brain,
  Edit2
} from 'lucide-react';
import FacultyNavbar from '../components/FacultyNavbar';
import FacultySidebar from '../components/FacultySidebar';
import { 
  facultyProfileData, 
  facultySummaryMetrics, 
  facultyRecentActivity, 
  facultyStudentDirectory,
  dashboardLiveSessions, 
  dashboardTests,
  testService,
  initialCohortTestResults 
} from '../data/mockData';

export default function FacultyDashboardPage() {
  const navigate = useNavigate();

  // Sidebar Tab state: 'overview' | 'upload' | 'live' | 'tests' | 'students' | 'analytics'
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Content Upload Cascading Selector state
  const [selectedCourse, setSelectedCourse] = useState('neet-pg');
  const [selectedWeek, setSelectedWeek] = useState('1');
  const [selectedDay, setSelectedDay] = useState('3');

  // Uploaded state per day feedback
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState('');

  // PDF form state
  const [pdfTitle, setPdfTitle] = useState('Clinical ECG Mastery: Arrhythmias & AV Blocks');
  const [pdfFile, setPdfFile] = useState('ECG_Mastery_Arrhythmias_2026.pdf');

  // Images form state
  const [imageCaption, setImageCaption] = useState('Fig: Monomorphic VT with AV Dissociation & Extreme Right Axis');

  // Video form state
  const [videoTitle, setVideoTitle] = useState('Wide Complex Tachycardias: Brugada vs Vereckei Criteria');
  const [videoLink, setVideoLink] = useState('https://vimeo.com/medpreppro/cardio-day03-wct');

  // Flashcards repeatable form state
  const [flashcardList, setFlashcardList] = useState([
    { question: 'Hallmark of AV dissociation in VT?', answer: 'Independent sinus P waves marching across wide QRS complexes with capture & fusion beats.' },
    { question: 'Class III antiarrhythmic mechanism of action?', answer: 'Blocks outward K+ channels, prolonging action potential duration & QT interval.' }
  ]);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');

  // Live Session form state
  const [liveSessionsList, setLiveSessionsList] = useState(dashboardLiveSessions);
  const [liveCourse, setLiveCourse] = useState('neet-pg');
  const [liveDay, setLiveDay] = useState('Day 3 (Week 1)');
  const [liveTopic, setLiveTopic] = useState('STEMI & Acute Coronary Syndrome Grand Rounds');
  const [liveDate, setLiveDate] = useState('2026-09-06');
  const [liveTime, setLiveTime] = useState('20:00');
  const [liveDuration, setLiveDuration] = useState('1.5 hours');
  const [liveLink, setLiveLink] = useState('https://zoom.us/j/9876543210');

  // Tests form & state (Phase 6 Reactive Store)
  const [testsList, setTestsList] = useState(() => testService.getTests());
  const [testCourse, setTestCourse] = useState('NEET PG & NExT 2026');
  const [testName, setTestName] = useState('Cardiology Mock Test 1');
  const [testBatchTier, setTestBatchTier] = useState('All Students of this Course');
  const [testDate, setTestDate] = useState('2026-09-18');
  const [testTime, setTestTime] = useState('18:00');
  const [testDuration, setTestDuration] = useState('45 mins');
  const [testTotalMarks, setTestTotalMarks] = useState('100');
  const [testQuestionCount, setTestQuestionCount] = useState('20');

  // Cohort Results Modal State
  const [activeResultsModalTest, setActiveResultsModalTest] = useState(null);
  const [cohortResultsData, setCohortResultsData] = useState(null);

  // Sync test store across browser sessions and tabs
  React.useEffect(() => {
    const handleSync = () => {
      setTestsList(testService.getTests());
      if (activeResultsModalTest) {
        setCohortResultsData(testService.getCohortResults(activeResultsModalTest.id));
      }
    };
    window.addEventListener('medprep-tests-updated', handleSync);
    window.addEventListener('medprep-results-updated', handleSync);
    return () => {
      window.removeEventListener('medprep-tests-updated', handleSync);
      window.removeEventListener('medprep-results-updated', handleSync);
    };
  }, [activeResultsModalTest]);

  // Students Search state
  const [studentSearchTerm, setStudentSearchTerm] = useState('');

  const triggerUploadSuccess = (msg) => {
    setUploadSuccessMessage(msg);
    setTimeout(() => setUploadSuccessMessage(''), 3000);
  };

  const handleAddFlashcard = () => {
    if (!newQuestion.trim() || !newAnswer.trim()) return;
    setFlashcardList([...flashcardList, { question: newQuestion.trim(), answer: newAnswer.trim() }]);
    setNewQuestion('');
    setNewAnswer('');
    triggerUploadSuccess('New flashcard added to deck!');
  };

  const handleRemoveFlashcard = (index) => {
    setFlashcardList(flashcardList.filter((_, i) => i !== index));
  };

  const handleScheduleLiveSession = (e) => {
    e.preventDefault();
    const newSession = {
      id: `live-${Date.now()}`,
      title: liveTopic,
      faculty: facultyProfileData.name,
      time: `${liveTime} IST (${liveDuration})`,
      date: liveDate,
      status: 'Scheduled',
      badge: 'New Scheduled',
      attendeesCount: 0,
      description: `Live interactive session for ${liveCourse.toUpperCase()} • ${liveDay}`
    };
    setLiveSessionsList([newSession, ...liveSessionsList]);
    triggerUploadSuccess(`Live session "${liveTopic}" scheduled successfully!`);
  };

  const handleCreateTest = (e) => {
    e.preventDefault();
    const newTest = {
      id: `test-${Date.now()}`,
      name: testName,
      courseId: testCourse.toLowerCase().includes('neet') ? 'neet-pg' : testCourse.toLowerCase().includes('usmle') ? 'usmle' : 'plab',
      course: testCourse,
      batch: testBatchTier,
      date: testDate,
      time: `${testTime} IST`,
      duration: testDuration,
      durationSeconds: testDuration.includes('210') ? 12600 : testDuration.includes('60') || testDuration.includes('1 hr') ? 3600 : 2700,
      totalMarks: parseInt(testTotalMarks, 10) || 100,
      questionsCount: parseInt(testQuestionCount, 10) || 20,
      status: 'Upcoming',
      badge: 'Newly Scheduled',
      pattern: 'NExT/USMLE Clinical Simulation',
      startsIn: `Starts on ${testDate}`,
      instructions: [
        `Examination: ${testName}`,
        `Candidate Batch: ${testBatchTier}`,
        `Total marks: ${testTotalMarks} Marks (${testQuestionCount} clinical questions).`,
        'Marking Scheme: +5 marks per correct response, -1 mark negative marking for incorrect choices.',
        'Proctored countdown clock enforces automatic submission upon timer expiration.'
      ]
    };

    testService.saveTest(newTest);
    triggerUploadSuccess(`Assessment "${testName}" scheduled successfully for ${testBatchTier}!`);
  };

  const handleOpenResults = (testObj) => {
    const results = testService.getCohortResults(testObj.id);
    setActiveResultsModalTest(testObj);
    setCohortResultsData(results);
  };

  const handleCancelTest = (testId, name) => {
    const updated = testsList.filter((t) => t.id !== testId);
    testService.saveTest(updated);
    setTestsList(updated);
    triggerUploadSuccess(`Test "${name}" was cancelled.`);
  };

  const filteredStudents = facultyStudentDirectory.filter((s) => 
    s.name.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
    s.course.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
    s.packageTier.toLowerCase().includes(studentSearchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Top Navbar */}
      <FacultyNavbar 
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
      />

      <div className="flex-grow flex">
        
        {/* Left Sidebar */}
        <FacultySidebar 
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Main Workspace Area */}
        <main className="flex-grow p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-10">
          
          {/* Notification Toast */}
          {uploadSuccessMessage && (
            <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs sm:text-sm font-bold animate-in slide-in-from-top-4">
              <CheckCircle2 className="w-5 h-5" />
              <span>{uploadSuccessMessage}</span>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 3. Faculty Dashboard Overview (Landing Page)                              */}
          {/* ========================================================================= */}
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-in fade-in">
              
              {/* Welcome Header */}
              <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 rounded-3xl p-6 sm:p-8 border border-indigo-900/50 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Faculty Management Console</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-white">
                    Welcome, {facultyProfileData.name}
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
                    {facultyProfileData.institution}. Manage clinical lecture notes, multi-image ECG strips, flashcards, and live grand rounds.
                  </p>
                </div>

                <button
                  onClick={() => setActiveTab('upload')}
                  className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 shrink-0 self-start lg:self-auto"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Upload Daily Content</span>
                </button>
              </div>

              {/* 4 Summary Cards Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                
                <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-2">
                  <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
                    Assigned Courses
                  </span>
                  <div className="text-2xl font-black text-white">
                    {facultySummaryMetrics.coursesAssigned}
                  </div>
                  <p className="text-xs text-indigo-400 font-medium">
                    NEET PG & USMLE Cardio
                  </p>
                </div>

                <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-2">
                  <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
                    Students Enrolled
                  </span>
                  <div className="text-2xl font-black text-emerald-400">
                    {facultySummaryMetrics.studentsEnrolled.toLocaleString()}+
                  </div>
                  <p className="text-xs text-slate-400">
                    Active across 4 cohorts
                  </p>
                </div>

                <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-2">
                  <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
                    Units Uploaded This Week
                  </span>
                  <div className="text-2xl font-black text-brand-400">
                    {facultySummaryMetrics.contentUploadedThisWeek} Units
                  </div>
                  <p className="text-xs text-slate-400">
                    Week 1 Curriculum 100% Ready
                  </p>
                </div>

                <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-2">
                  <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
                    Upcoming Live Sessions
                  </span>
                  <div className="text-2xl font-black text-red-400">
                    {facultySummaryMetrics.upcomingLiveSessions} Scheduled
                  </div>
                  <p className="text-xs text-red-300 font-medium">
                    Tonight @ 8:00 PM IST
                  </p>
                </div>

              </div>

              {/* Recent Activity Log & Quick Action Banner */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Recent Activity Log */}
                <div className="lg:col-span-2 bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Clock className="w-4 h-4 text-indigo-400" />
                      <span>Recent Supply-Side Activity</span>
                    </h3>
                    <span className="text-xs text-slate-500">Live Audit Log</span>
                  </div>

                  <div className="divide-y divide-slate-800/80">
                    {facultyRecentActivity.map((act) => (
                      <div key={act.id} className="py-3.5 flex items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{act.action}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700">
                              {act.badge}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">{act.target} • <span className="text-slate-500">{act.course}</span></p>
                        </div>
                        <span className="text-xs text-slate-500 shrink-0 font-medium">{act.time}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Supply Side USP Card */}
                <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900 rounded-3xl p-6 border border-indigo-800/50 flex flex-col justify-between">
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                      Demo Presentation Note
                    </span>
                    <h4 className="text-base font-bold text-white leading-snug">
                      Connecting the Supply Side to the Student Experience
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Every material uploaded here is instantly organized by <strong>Course → Week → Day</strong>. 
                      If faculty assigns only a PDF and Video for Day 2, the other 3 tabs on the student side are automatically disabled.
                    </p>
                  </div>

                  <div className="pt-6 border-t border-indigo-800/40">
                    <Link
                      to="/day/3"
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>Preview Day 3 as Student</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* 4. Content Upload Section (MAIN SECTION)                                  */}
          {/* ========================================================================= */}
          {activeTab === 'upload' && (
            <div className="space-y-8 animate-in fade-in">
              
              {/* Header */}
              <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-4">
                <div>
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                    Content Management Pipeline
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
                    Upload & Assign Daily Curriculum
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400">
                    Select the target exam, week, and day to assign or update study materials.
                  </p>
                </div>

                {/* Cascading Dropdowns: Course -> Week -> Day */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-800">
                  
                  {/* 1. Select Course */}
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1.5">
                      1. Select Course Track
                    </label>
                    <select
                      value={selectedCourse}
                      onChange={(e) => setSelectedCourse(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="neet-pg">🇮🇳 NEET PG & NExT 2026</option>
                      <option value="usmle">🇺🇸 USMLE Step 1 & 2 CK</option>
                      <option value="plab">🇬🇧 PLAB 1 & 2 / UKMLA</option>
                      <option value="europe">🇪🇺 Europe Medical Licensing</option>
                    </select>
                  </div>

                  {/* 2. Select Week */}
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1.5">
                      2. Select Curriculum Week
                    </label>
                    <select
                      value={selectedWeek}
                      onChange={(e) => setSelectedWeek(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="1">Week 1: Cardiology & Hemodynamics</option>
                      <option value="2">Week 2: Respiratory & Pulmonology</option>
                      <option value="3">Week 3: Renal & Acid-Base Balance</option>
                      <option value="4">Week 4: Gastroenterology & Liver</option>
                    </select>
                  </div>

                  {/* 3. Select Day */}
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1.5">
                      3. Select Target Day
                    </label>
                    <select
                      value={selectedDay}
                      onChange={(e) => setSelectedDay(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="1">Day 1 — Valvular Heart Diseases & Murmurs</option>
                      <option value="2">Day 2 — Heart Failure & Pharmacotherapy</option>
                      <option value="3">Day 3 — Cardiac Arrhythmias & ECG</option>
                      <option value="4">Day 4 — Acute Coronary Syndromes</option>
                      <option value="5">Day 5 — Congenital Heart Defects</option>
                      <option value="6">Day 6 — Active Recall Flashcards Sprint</option>
                      <option value="7">Day 7 — Subject Grand Mock Test</option>
                    </select>
                  </div>

                </div>
              </div>

              {/* Active Day Content Summary Card */}
              <div className="bg-indigo-950/40 p-5 rounded-2xl border border-indigo-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/30 text-indigo-300 flex items-center justify-center shrink-0 border border-indigo-500/30">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white">
                      Editing Day {selectedDay}: Clinical Arrhythmias & ECG Interpretation
                    </h4>
                    <p className="text-xs text-slate-400">
                      Currently Assigned: 📄 PDF Notes, 🖼️ 3 Images, 🎥 1 Video, 🗂️ 4 Flashcards, 🔴 Live Session Scheduled
                    </p>
                  </div>
                </div>

                <Link
                  to={`/day/${selectedDay}`}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors shrink-0 flex items-center gap-1.5"
                >
                  <span>Verify on Student View</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* 4 Content Types Upload Workspaces */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* 1. PDF Notes Uploader */}
                <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-brand-400" />
                      <h3 className="text-sm font-bold text-white">Upload PDF Study Notes</h3>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/50">Active</span>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Document Title</label>
                    <input
                      type="text"
                      value={pdfTitle}
                      onChange={(e) => setPdfTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>

                  {/* Drag-and-drop placeholder box */}
                  <div className="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-2xl p-6 text-center space-y-2 bg-slate-950/40 cursor-pointer transition-colors">
                    <UploadCloud className="w-8 h-8 text-indigo-400 mx-auto" />
                    <p className="text-xs text-slate-300 font-semibold">{pdfFile}</p>
                    <p className="text-[11px] text-slate-500">Click or drag & drop updated PDF here (max 50 MB)</p>
                  </div>

                  <button
                    onClick={() => triggerUploadSuccess(`PDF "${pdfTitle}" uploaded and assigned to Day ${selectedDay}!`)}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    Save & Publish PDF Notes
                  </button>
                </div>

                {/* 2. Images & Diagrams Uploader */}
                <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-emerald-400" />
                      <h3 className="text-sm font-bold text-white">Upload Clinical Diagrams & ECG Strips</h3>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/50">3 Active</span>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Image Caption / Clinical Descriptor</label>
                    <input
                      type="text"
                      value={imageCaption}
                      onChange={(e) => setImageCaption(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div className="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-2xl p-6 text-center space-y-2 bg-slate-950/40 cursor-pointer transition-colors">
                    <ImageIcon className="w-8 h-8 text-emerald-400 mx-auto" />
                    <p className="text-xs text-slate-300 font-semibold">Drop 12-lead ECG strips, Wiggers diagrams, or pathology slides</p>
                    <p className="text-[11px] text-slate-500">PNG, JPG, DICOM supported</p>
                  </div>

                  <button
                    onClick={() => triggerUploadSuccess(`New clinical image uploaded for Day ${selectedDay}!`)}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    Save Clinical Diagram
                  </button>
                </div>

                {/* 3. Video Lecture Uploader */}
                <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Video className="w-4 h-4 text-purple-400" />
                      <h3 className="text-sm font-bold text-white">Video Lecture Management</h3>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/50">28:40 mins</span>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Lecture Title</label>
                    <input
                      type="text"
                      value={videoTitle}
                      onChange={(e) => setVideoTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Streaming URL or Video Cloud ID</label>
                    <input
                      type="text"
                      value={videoLink}
                      onChange={(e) => setVideoLink(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono"
                    />
                  </div>

                  <button
                    onClick={() => triggerUploadSuccess(`Video lecture updated for Day ${selectedDay}!`)}
                    className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    Update Video Lesson
                  </button>
                </div>

                {/* 4. Flashcards Repeatable Builder */}
                <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Brain className="w-4 h-4 text-amber-400" />
                      <h3 className="text-sm font-bold text-white">Active Recall Flashcard Deck</h3>
                    </div>
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800/50">
                      {flashcardList.length} Cards in Deck
                    </span>
                  </div>

                  {/* Existing cards mini-list */}
                  <div className="space-y-2 max-h-36 overflow-y-auto">
                    {flashcardList.map((fc, i) => (
                      <div key={i} className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/80 flex items-start justify-between gap-2 text-xs">
                        <div className="space-y-0.5">
                          <span className="font-bold text-indigo-300">Q: {fc.question}</span>
                          <p className="text-slate-400 text-[11px]">A: {fc.answer}</p>
                        </div>
                        <button
                          onClick={() => handleRemoveFlashcard(i)}
                          className="text-slate-500 hover:text-rose-400 p-1"
                          title="Remove Card"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Repeatable form to add new card */}
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Add Card to Day {selectedDay}</span>
                    <input
                      type="text"
                      placeholder="Question prompt..."
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                    />
                    <input
                      type="text"
                      placeholder="Clinical answer..."
                      value={newAnswer}
                      onChange={(e) => setNewAnswer(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddFlashcard}
                      className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-indigo-300 font-bold text-xs rounded-lg border border-slate-700 flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Add Another Flashcard</span>
                    </button>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* 5. Schedule Live Session Section                                          */}
          {/* ========================================================================= */}
          {activeTab === 'live' && (
            <div className="space-y-8 animate-in fade-in">
              
              <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
                <div>
                  <span className="text-xs font-bold text-red-400 uppercase tracking-wider">
                    Interactive Grand Rounds
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
                    Schedule a Live Faculty Session
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400">
                    Host clinical case presentations, diagnostic drills, and live doubts for enrolled cohorts.
                  </p>
                </div>

                <form onSubmit={handleScheduleLiveSession} className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                  <div>
                    <label className="text-xs text-slate-300 block mb-1">Target Course Track</label>
                    <select
                      value={liveCourse}
                      onChange={(e) => setLiveCourse(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                    >
                      <option value="neet-pg">NEET PG & NExT 2026</option>
                      <option value="usmle">USMLE Step 1 & 2 CK</option>
                      <option value="plab">PLAB 1 & 2 / UKMLA</option>
                      <option value="europe">Europe Medical Licensing</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-slate-300 block mb-1">Curriculum Day Placement</label>
                    <input
                      type="text"
                      value={liveDay}
                      onChange={(e) => setLiveDay(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-xs text-slate-300 block mb-1">Session Topic & Focus</label>
                    <input
                      type="text"
                      value={liveTopic}
                      onChange={(e) => setLiveTopic(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-300 block mb-1">Date</label>
                    <input
                      type="date"
                      value={liveDate}
                      onChange={(e) => setLiveDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-300 block mb-1">Time (IST)</label>
                    <input
                      type="time"
                      value={liveTime}
                      onChange={(e) => setLiveTime(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-300 block mb-1">Duration</label>
                    <select
                      value={liveDuration}
                      onChange={(e) => setLiveDuration(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                    >
                      <option value="45 mins">45 mins</option>
                      <option value="1 hour">1 hour</option>
                      <option value="1.5 hours">1.5 hours</option>
                      <option value="2 hours">2 hours</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-slate-300 block mb-1">Broadcast / Zoom Link</label>
                    <input
                      type="text"
                      value={liveLink}
                      onChange={(e) => setLiveLink(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono"
                    />
                  </div>

                  <div className="md:col-span-2 pt-2">
                    <button
                      type="submit"
                      className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-md shadow-red-600/30 transition-colors flex items-center justify-center gap-2"
                    >
                      <Radio className="w-4 h-4" />
                      <span>Schedule Live Grand Round</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Scheduled Sessions Table */}
              <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-4">
                <h3 className="text-base font-bold text-white">All Scheduled Faculty Sessions</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400">
                        <th className="py-3 px-4">Topic</th>
                        <th className="py-3 px-4">Date & Time</th>
                        <th className="py-3 px-4">Duration</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {liveSessionsList.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-800/40">
                          <td className="py-3.5 px-4 font-bold text-white">{s.title}</td>
                          <td className="py-3.5 px-4 text-slate-300">{s.date} • {s.time}</td>
                          <td className="py-3.5 px-4 text-slate-400">75 mins</td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-950 text-red-300 border border-red-800/50">
                              {s.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => triggerUploadSuccess(`Session link copied to clipboard!`)}
                              className="text-xs font-bold text-indigo-400 hover:text-indigo-300"
                            >
                              Copy Link
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

          {/* ========================================================================= */}
          {/* 6. Manage Tests Section (Phase 6 Detailed Scheduling & Results)           */}
          {/* ========================================================================= */}
          {activeTab === 'tests' && (
            <div className="space-y-8 animate-in fade-in">
              
              {/* Test Creation Form */}
              <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950 border border-indigo-700/60 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Faculty Assessment Scheduler</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white">
                    Create & Schedule Examination
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    Configure timed assessments tied to specific courses and student package tiers. Scheduled tests immediately reflect on enrolled candidate dashboards.
                  </p>
                </div>

                <form onSubmit={handleCreateTest} className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800">
                  
                  {/* Course Track */}
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Select Course Track</label>
                    <select
                      value={testCourse}
                      onChange={(e) => setTestCourse(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
                    >
                      <option value="NEET PG & NExT 2026">NEET PG & NExT 2026</option>
                      <option value="USMLE Step 1 & 2 CK">USMLE Step 1 & 2 CK</option>
                      <option value="PLAB 1 & 2 / UKMLA">PLAB 1 & 2 / UKMLA</option>
                      <option value="Europe Medical Licensing">Europe Medical Licensing</option>
                    </select>
                  </div>

                  {/* Test Title */}
                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-slate-300 block mb-1">Test Name / Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Cardiology Mock Test 1"
                      value={testName}
                      onChange={(e) => setTestName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
                      required
                    />
                  </div>

                  {/* Batch / Tier */}
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Applicable Batch / Tier</label>
                    <select
                      value={testBatchTier}
                      onChange={(e) => setTestBatchTier(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
                    >
                      <option value="All Students of this Course">All Students of this Course</option>
                      <option value="All Premium Students">All Premium Students</option>
                      <option value="Standard & Premium Students Only">Standard & Premium Students Only</option>
                    </select>
                  </div>

                  {/* Exam Date */}
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Test Date</label>
                    <input
                      type="date"
                      value={testDate}
                      onChange={(e) => setTestDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
                    />
                  </div>

                  {/* Start Time */}
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Test Start Time</label>
                    <input
                      type="time"
                      value={testTime}
                      onChange={(e) => setTestTime(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
                    />
                  </div>

                  {/* Duration Dropdown */}
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Duration</label>
                    <select
                      value={testDuration}
                      onChange={(e) => setTestDuration(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
                    >
                      <option value="30 mins">30 mins</option>
                      <option value="45 mins">45 mins</option>
                      <option value="60 mins (1 hr)">60 mins (1 hr)</option>
                      <option value="90 mins (1.5 hr)">90 mins (1.5 hr)</option>
                      <option value="120 mins (2 hr)">120 mins (2 hr)</option>
                      <option value="210 mins (3.5 hr)">210 mins (3.5 hr)</option>
                    </select>
                  </div>

                  {/* Total Marks */}
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Total Marks</label>
                    <input
                      type="number"
                      value={testTotalMarks}
                      onChange={(e) => setTestTotalMarks(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
                    />
                  </div>

                  {/* Number of Questions */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-300">Number of Questions</label>
                      <span className="text-[10px] text-indigo-400">Linked to Q-Bank</span>
                    </div>
                    <input
                      type="number"
                      value={testQuestionCount}
                      onChange={(e) => setTestQuestionCount(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
                    />
                  </div>

                  {/* Notice & Submit Action */}
                  <div className="sm:col-span-3 pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-[11px] text-slate-400">
                      ℹ️ Questions automatically linked via Question Bank module (vignettes with NExT/USMLE clinical format).
                    </p>

                    <button
                      type="submit"
                      className="w-full sm:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Schedule & Release Test</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Scheduled Tests Table */}
              <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white">Scheduled Assessments Roster</h3>
                    <p className="text-xs text-slate-400">Overview of upcoming, live, and completed examination series.</p>
                  </div>
                  <span className="text-xs text-indigo-400 font-mono font-bold">
                    {testsList.length} Total Tests
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/40">
                        <th className="py-3 px-4">Test Name</th>
                        <th className="py-3 px-4">Course</th>
                        <th className="py-3 px-4">Batch</th>
                        <th className="py-3 px-4">Date & Time</th>
                        <th className="py-3 px-4">Duration</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {testsList.map((t) => (
                        <tr key={t.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-white">
                            <div>{t.name}</div>
                            <div className="text-[10px] text-slate-400">{t.questionsCount || t.questions || 20} Questions • {t.totalMarks || 100} Marks</div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-300 font-medium">{t.course || 'NEET PG & NExT'}</td>
                          <td className="py-3.5 px-4 text-slate-400">{t.batch || 'All Students'}</td>
                          <td className="py-3.5 px-4 text-slate-300">
                            <div>{t.date}</div>
                            <div className="text-[10px] text-slate-400">{t.time || '18:00 IST'}</div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-400">{t.duration}</td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                              t.status === 'Live'
                                ? 'bg-emerald-950 text-emerald-300 border-emerald-800/60 animate-pulse'
                                : t.status === 'Completed'
                                ? 'bg-indigo-950 text-indigo-300 border-indigo-800/60'
                                : 'bg-slate-800 text-slate-300 border-slate-700'
                            }`}>
                              {t.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleOpenResults(t)}
                                className="px-3 py-1 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-600/40 rounded-lg text-xs font-bold transition-colors"
                              >
                                View Results
                              </button>
                              <button
                                onClick={() => triggerUploadSuccess(`Test config editor opened for "${t.name}"`)}
                                className="text-[11px] text-slate-400 hover:text-white px-2 py-1"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleCancelTest(t.id, t.name)}
                                className="text-[11px] text-rose-400 hover:text-rose-300 px-2 py-1"
                              >
                                Cancel
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ============================================================= */}
              {/* POPUP MODAL: Cohort Test Results View (Part A.3)              */}
              {/* ============================================================= */}
              {activeResultsModalTest && cohortResultsData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
                  <div className="bg-slate-900 rounded-3xl max-w-4xl w-full border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
                    
                    {/* Modal Header */}
                    <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                      <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-950 border border-indigo-700/60 text-indigo-300 text-[10px] font-bold uppercase tracking-wider mb-1">
                          <span>Cohort Examination Performance Report</span>
                        </div>
                        <h3 className="text-xl font-black text-white">
                          {activeResultsModalTest.name}
                        </h3>
                        <p className="text-xs text-slate-400">
                          Track: {activeResultsModalTest.course || 'NEET PG'} • Target Batch: {activeResultsModalTest.batch || 'All Students'}
                        </p>
                      </div>

                      <button
                        onClick={() => setActiveResultsModalTest(null)}
                        className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Top Summary Metrics */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center">
                        <div className="text-[11px] text-slate-400 font-medium">Average Score</div>
                        <div className="text-xl font-black text-white mt-1">
                          {cohortResultsData.summary.averageScore}
                        </div>
                        <div className="text-[10px] text-slate-500">Cohort Mean</div>
                      </div>

                      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center">
                        <div className="text-[11px] text-slate-400 font-medium">Highest Score</div>
                        <div className="text-xl font-black text-emerald-400 mt-1">
                          {cohortResultsData.summary.highestScore}
                        </div>
                        <div className="text-[10px] text-slate-500">Top Candidate</div>
                      </div>

                      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center">
                        <div className="text-[11px] text-slate-400 font-medium">Candidates Attempted</div>
                        <div className="text-xl font-black text-indigo-400 mt-1">
                          {cohortResultsData.summary.attemptedCount} / {cohortResultsData.summary.totalEligible || 450}
                        </div>
                        <div className="text-[10px] text-slate-500">Submissions</div>
                      </div>

                      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center">
                        <div className="text-[11px] text-slate-400 font-medium">Cohort Pass Rate</div>
                        <div className="text-xl font-black text-amber-400 mt-1">
                          {cohortResultsData.summary.passRate}
                        </div>
                        <div className="text-[10px] text-slate-500">Threshold: ≥50%</div>
                      </div>
                    </div>

                    {/* Candidate Submissions Table */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                          Candidate Attempts & Diagnostic Scores
                        </h4>
                        <span className="text-[11px] text-slate-400">
                          {cohortResultsData.students?.length || 0} Submissions Recorded
                        </span>
                      </div>

                      <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-slate-900/60 border-b border-slate-800 text-slate-400">
                              <th className="py-3 px-4">Student Name</th>
                              <th className="py-3 px-4">Score</th>
                              <th className="py-3 px-4">Percentage</th>
                              <th className="py-3 px-4">Time Taken</th>
                              <th className="py-3 px-4">Status</th>
                              <th className="py-3 px-4 text-right">Submitted At</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800">
                            {cohortResultsData.students?.map((s) => {
                              const isRitik = s.name === 'Dr. Ritik Saini';
                              return (
                                <tr 
                                  key={s.id} 
                                  className={`hover:bg-slate-800/40 transition-colors ${
                                    isRitik ? 'bg-indigo-950/40 border-l-2 border-indigo-500' : ''
                                  }`}
                                >
                                  <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2.5">
                                    <img 
                                      src={s.avatar} 
                                      alt={s.name} 
                                      className="w-7 h-7 rounded-full object-cover border border-slate-700" 
                                    />
                                    <div>
                                      <div className="flex items-center gap-1.5">
                                        <span>{s.name}</span>
                                        {isRitik && (
                                          <span className="text-[9px] bg-brand-500 text-white font-bold px-1.5 py-0.2 rounded">
                                            Current Candidate
                                          </span>
                                        )}
                                      </div>
                                      <div className="text-[10px] text-slate-400 font-normal">{s.course}</div>
                                    </div>
                                  </td>
                                  <td className="py-3.5 px-4 font-bold text-slate-200">{s.score}</td>
                                  <td className="py-3.5 px-4 font-bold text-indigo-400">{s.percentage}</td>
                                  <td className="py-3.5 px-4 text-slate-400">{s.timeTaken}</td>
                                  <td className="py-3.5 px-4">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                      s.status === 'Pass' 
                                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60' 
                                        : 'bg-rose-950 text-rose-300 border border-rose-800/60'
                                    }`}>
                                      {s.status}
                                    </span>
                                  </td>
                                  <td className="py-3.5 px-4 text-right text-slate-400 text-[11px]">
                                    {s.submittedAt}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Bottom Modal Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                      <button
                        onClick={() => triggerUploadSuccess('Grade sheet exported in CSV format')}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Export Cohort CSV</span>
                      </button>

                      <button
                        onClick={() => setActiveResultsModalTest(null)}
                        className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-colors"
                      >
                        Close Window
                      </button>
                    </div>

                  </div>
                </div>
              )}

            </div>
          )}

          {/* ========================================================================= */}
          {/* 7. My Students Section                                                    */}
          {/* ========================================================================= */}
          {activeTab === 'students' && (
            <div className="space-y-6 animate-in fade-in">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-white">
                    Enrolled Students Directory
                  </h2>
                  <p className="text-xs text-slate-400">
                    Review candidate milestones, active recall accuracy, and study progress.
                  </p>
                </div>

                {/* Search Bar */}
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="Search candidate name or track..."
                    value={studentSearchTerm}
                    onChange={(e) => setStudentSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Students Table */}
              <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400">
                        <th className="py-3.5 px-4">Student Name</th>
                        <th className="py-3.5 px-4">Enrolled Course</th>
                        <th className="py-3.5 px-4">Package Tier</th>
                        <th className="py-3.5 px-4">Progress %</th>
                        <th className="py-3.5 px-4">Accuracy</th>
                        <th className="py-3.5 px-4">Last Active</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/70">
                      {filteredStudents.map((st) => (
                        <tr key={st.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <img src={st.avatar} alt={st.name} className="w-8 h-8 rounded-full object-cover border border-indigo-500/50" />
                              <div>
                                <span className="font-bold text-white block">{st.name}</span>
                                <span className="text-[10px] text-slate-400">{st.email}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-300 font-medium">{st.course}</td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-indigo-300 border border-slate-700">
                              {st.packageTier}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${st.progress}%` }} />
                              </div>
                              <span className="font-bold text-emerald-400">{st.progress}%</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-200">{st.qbankAccuracy}</td>
                          <td className="py-3.5 px-4 text-slate-400">{st.lastActive}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* 8. Reports & Analytics                                                    */}
          {/* ========================================================================= */}
          {activeTab === 'analytics' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
                <div>
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Cohort Intelligence</span>
                  <h2 className="text-2xl font-black text-white mt-1">Curriculum Performance Analytics</h2>
                  <p className="text-xs text-slate-400">Aggregated student completion metrics across all 19 medical subjects.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                    <span className="text-xs text-slate-400">Average Grand Test Score</span>
                    <div className="text-2xl font-black text-emerald-400">74.2%</div>
                    <span className="text-[11px] text-emerald-500">↑ 4.2% from previous batch</span>
                  </div>

                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                    <span className="text-xs text-slate-400">Daily Flashcard Recall Rate</span>
                    <div className="text-2xl font-black text-brand-400">88.6%</div>
                    <span className="text-[11px] text-slate-400">Avg review interval: 4.2 days</span>
                  </div>

                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                    <span className="text-xs text-slate-400">Live Grand Round Attendance</span>
                    <div className="text-2xl font-black text-purple-400">91.4%</div>
                    <span className="text-[11px] text-purple-300">Over 340 doctors per clinic</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

    </div>
  );
}
