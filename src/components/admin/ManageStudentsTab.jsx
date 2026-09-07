import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  Award, 
  Calendar, 
  Radio, 
  ShieldCheck, 
  TrendingUp, 
  X, 
  ChevronRight, 
  ArrowUpRight, 
  Sparkles, 
  ShieldAlert, 
  FileText,
  CreditCard,
  Eye,
  AlertCircle
} from 'lucide-react';
import { peopleService } from '../../services/peopleService';
import { authService, USER_ROLES } from '../../services/authService';

export default function ManageStudentsTab() {
  const [currentUser, setCurrentUser] = useState(() => authService.getCurrentUser());
  const [students, setStudents] = useState(() => peopleService.getStudents());
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [examFilter, setExamFilter] = useState('all');
  const [tierFilter, setTierFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Detail Modal State
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Admin Actions State inside Modal
  const [extendMonths, setExtendMonths] = useState(3);
  const [selectedNewTier, setSelectedNewTier] = useState('Premium Tier');

  useEffect(() => {
    const unsubscribeAuth = authService.subscribe((user) => setCurrentUser(user));
    const unsubscribePeople = peopleService.subscribe((payload) => setStudents(payload.students));
    return () => {
      unsubscribeAuth();
      unsubscribePeople();
    };
  }, []);

  const isAdmin = currentUser?.role === USER_ROLES.ADMIN;
  const isFaculty = currentUser?.role === USER_ROLES.FACULTY;

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Automatic account-based scoping for Faculty
  // Dr. Siddharth V. is assigned to neet-pg & usmle
  const facultyAssignedExams = ['neet-pg', 'usmle'];

  // 1. Scoping step
  const scopedStudents = isFaculty 
    ? students.filter(s => facultyAssignedExams.includes(s.examId))
    : students;

  // 2. Filter step
  const filteredStudents = scopedStudents.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.roll.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesExam = examFilter === 'all' || s.examId === examFilter;
    const matchesTier = tierFilter === 'all' || s.packageTier.toLowerCase().includes(tierFilter.toLowerCase());
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesExam && matchesTier && matchesStatus;
  });

  // Admin Action Handlers
  const handleExtendPackage = () => {
    if (!selectedStudent) return;
    peopleService.extendStudentPackage(selectedStudent.id, Number(extendMonths));
    setStudents(peopleService.getStudents());
    const updated = peopleService.getStudents().find(s => s.id === selectedStudent.id);
    setSelectedStudent(updated);
    showToast(`Package validity extended by +${extendMonths} months for ${selectedStudent.name}.`);
  };

  const handleUpdateTier = () => {
    if (!selectedStudent) return;
    peopleService.updateStudentPackageTier(selectedStudent.id, selectedNewTier);
    setStudents(peopleService.getStudents());
    const updated = peopleService.getStudents().find(s => s.id === selectedStudent.id);
    setSelectedStudent(updated);
    showToast(`Package tier updated to ${selectedNewTier} for ${selectedStudent.name}.`);
  };

  const handleToggleStudentStatus = () => {
    if (!selectedStudent) return;
    if (confirm(`Are you sure you want to change status for ${selectedStudent.name}?`)) {
      peopleService.toggleStudentStatus(selectedStudent.id);
      setStudents(peopleService.getStudents());
      const updated = peopleService.getStudents().find(s => s.id === selectedStudent.id);
      setSelectedStudent(updated);
      showToast(`Student status updated to ${updated?.status}.`);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="flex items-center gap-2 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold shadow-xs transition-all">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold mb-1.5">
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                {isAdmin ? 'Platform-Wide Directory (Phase 5.3)' : 'Scoped Clinical Cohort (Phase 5.3)'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {isAdmin ? 'Manage Enrolled Candidates (All Tracks)' : 'Assigned Students Directory (Cardiology Track)'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isAdmin 
                ? 'Full directory of all candidates across NEET PG, USMLE, PLAB & Europe. Extend packages or upgrade access.' 
                : 'Showing only candidates enrolled in your assigned exam tracks (NEET PG & USMLE). Billing actions are restricted to Admin.'}
            </p>
          </div>

          {/* Scoped Badge Indicator */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className={`px-3 py-1 rounded-xl text-xs font-bold border ${
              isAdmin 
                ? 'bg-indigo-50 text-indigo-700 border-indigo-200' 
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              {isAdmin ? '👑 All 1,420 Enrolled Doctors' : '👨‍⚕️ 680 Doctors in Faculty Scope'}
            </span>
          </div>
        </div>

        {/* Search & Multi-Filters Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Search candidate, roll no, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white"
            />
          </div>

          {/* Exam Filter (Only shown to Admin, or limited for Faculty) */}
          {isAdmin ? (
            <select
              value={examFilter}
              onChange={(e) => setExamFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">All Exam Categories</option>
              <option value="neet-pg">🇮🇳 NEET PG & NExT</option>
              <option value="usmle">🇺🇸 USMLE Step 1 & 2</option>
              <option value="plab">🇬🇧 PLAB 1 & 2</option>
              <option value="europe">🇪🇺 Europe Licensing</option>
            </select>
          ) : (
            <select
              value={examFilter}
              onChange={(e) => setExamFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">My Assigned Exams (NEET PG & USMLE)</option>
              <option value="neet-pg">🇮🇳 NEET PG & NExT Only</option>
              <option value="usmle">🇺🇸 USMLE Step 1 & 2 Only</option>
            </select>
          )}

          {/* Package Tier Filter */}
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="all">All Package Tiers</option>
            <option value="basic">Basic Tier</option>
            <option value="standard">Standard Tier</option>
            <option value="premium">Premium Tier</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="all">All Statuses</option>
            <option value="Active">Active Enrolled</option>
            <option value="Expired">Expired Validity</option>
          </select>

        </div>

        {/* Students Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-2xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-bold">
                <th className="py-3 px-4">Candidate & Roll</th>
                <th className="py-3 px-4">Enrolled Exam</th>
                <th className="py-3 px-4">Package Tier</th>
                <th className="py-3 px-4">Curriculum Progress</th>
                <th className="py-3 px-4 text-center">Latest Mock Score</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                  
                  {/* Candidate */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={s.avatar} 
                        alt={s.name} 
                        className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0" 
                      />
                      <div>
                        <div className="font-bold text-slate-900 text-xs sm:text-sm">
                          {s.name}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">
                          {s.roll}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Enrolled Course */}
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-slate-800 text-xs">
                      {s.examName}
                    </span>
                  </td>

                  {/* Package Tier */}
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] border ${
                      s.packageTier.includes('Premium')
                        ? 'bg-purple-50 text-purple-700 border-purple-200'
                        : s.packageTier.includes('Standard')
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      {s.packageTier}
                    </span>
                  </td>

                  {/* Progress Bar */}
                  <td className="py-3.5 px-4 min-w-[140px]">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className="text-slate-600">{s.progress}%</span>
                        <span className="text-slate-400 font-normal">Week {Math.ceil(s.progress / 25)}</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-600 rounded-full transition-all duration-500" 
                          style={{ width: `${s.progress}%` }} 
                        />
                      </div>
                    </div>
                  </td>

                  {/* Latest Mock Score */}
                  <td className="py-3.5 px-4 text-center">
                    <div className="space-y-0.5">
                      <span className="font-bold text-slate-900 text-xs">
                        {s.mockScore}
                      </span>
                      <div className="text-[10px] font-bold text-brand-600">
                        {s.percentile}
                      </div>
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-4 text-center">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                      s.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${s.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                      <span>{s.status}</span>
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setSelectedStudent(s)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-bold text-xs transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{isAdmin ? 'Manage' : 'View Profile'}</span>
                    </button>
                  </td>

                </tr>
              ))}

              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                    No candidates match the specified filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Scoping Explanation Card */}
        {isFaculty && (
          <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-indigo-900 text-xs flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-indigo-800 leading-relaxed">
              <strong>Account-Based Scoping Active:</strong> As a faculty member assigned to Cardiology, you have read-only visibility into the progress and test scores of your assigned cohort. Billing modifications (package extension, tier upgrades) are reserved for platform administrators.
            </p>
          </div>
        )}

      </div>

      {/* ======================================================================= */}
      {/* DRAWER: STUDENT DETAIL PROFILE & ACTIONS (ADMIN / FACULTY)              */}
      {/* ======================================================================= */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity cursor-pointer"
            onClick={() => setSelectedStudent(null)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
            <div className="w-screen max-w-2xl bg-white shadow-2xl border-l border-slate-200 flex flex-col h-full animate-in slide-in-from-right duration-300">
              
              {/* Drawer Sticky Header */}
              <div className="p-5 sm:p-6 border-b border-slate-100 flex items-start justify-between shrink-0 bg-white sticky top-0 z-10">
                <div className="flex items-center gap-3.5">
                  <img 
                    src={selectedStudent.avatar} 
                    alt={selectedStudent.name} 
                    className="w-12 h-12 rounded-full object-cover border border-slate-200" 
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black text-slate-900">
                        {selectedStudent.name}
                      </h3>
                      <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold border ${
                        selectedStudent.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {selectedStudent.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-mono">
                      {selectedStudent.roll} • {selectedStudent.email}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedStudent(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Scrollable Body */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
                {/* Quick Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Enrolled Exam</span>
                    <div className="font-bold text-slate-900 line-clamp-1">{selectedStudent.examName}</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Package Tier</span>
                    <div className="font-bold text-indigo-700">{selectedStudent.packageTier}</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Enrolled Date</span>
                    <div className="font-bold text-slate-700">{selectedStudent.enrollmentDate}</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Valid Until</span>
                    <div className="font-bold text-slate-700">{selectedStudent.expiryDate}</div>
                  </div>
                </div>

                {/* Curriculum Progress Breakdown */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Week-Wise Curriculum Completion</span>
                  </h4>
                  <div className="space-y-2 text-xs">
                    {selectedStudent.weekProgress?.map((wp, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-semibold">
                          <span className="text-slate-700">{wp.week}</span>
                          <span className="font-bold text-indigo-700">{wp.completion}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              wp.completion === 100 ? 'bg-emerald-500' : wp.completion > 50 ? 'bg-indigo-600' : 'bg-amber-500'
                            }`}
                            style={{ width: `${wp.completion}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Test Performance & Live Attendance Logs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 text-xs">
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-slate-800">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Scheduled CBT Performance</span>
                    </div>
                    <div className="text-sm font-black text-slate-900">
                      Score: {selectedStudent.mockScore}
                    </div>
                    <div className="text-[11px] text-brand-600 font-bold">
                      National Percentile: {selectedStudent.percentile}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-slate-800">
                      <Radio className="w-4 h-4 text-amber-600" />
                      <span>Live Grand Rounds Attendance</span>
                    </div>
                    <div className="text-sm font-black text-slate-900">
                      {selectedStudent.liveAttendance}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Verified live webinar logging
                    </div>
                  </div>
                </div>

                {/* ADMIN ACTIONS SECTION (Strictly Hidden for Faculty!) */}
                {isAdmin && (
                  <div className="pt-4 border-t border-slate-100 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                        Administrative Account Actions (Admin Only)
                      </span>
                      <span className="text-[10px] bg-purple-50 text-purple-700 font-bold px-2 py-0.5 rounded">
                        Billing & Access Control
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      
                      {/* Action 1: Extend Validity */}
                      <div className="p-3.5 rounded-2xl border border-slate-200 bg-white space-y-2">
                        <span className="font-bold text-slate-800 block">Extend Package Validity</span>
                        <div className="flex items-center gap-2">
                          <select
                            value={extendMonths}
                            onChange={(e) => setExtendMonths(e.target.value)}
                            className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white focus:outline-none"
                          >
                            <option value={1}>+1 Month</option>
                            <option value={3}>+3 Months</option>
                            <option value={6}>+6 Months</option>
                            <option value={12}>+12 Months</option>
                          </select>
                          <button
                            onClick={handleExtendPackage}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs cursor-pointer text-xs"
                          >
                            Extend
                          </button>
                        </div>
                      </div>

                      {/* Action 2: Change Package Tier */}
                      <div className="p-3.5 rounded-2xl border border-slate-200 bg-white space-y-2">
                        <span className="font-bold text-slate-800 block">Upgrade / Downgrade Tier</span>
                        <div className="flex items-center gap-2">
                          <select
                            value={selectedNewTier}
                            onChange={(e) => setSelectedNewTier(e.target.value)}
                            className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white focus:outline-none"
                          >
                            <option value="Basic Tier">Basic Tier</option>
                            <option value="Standard Tier">Standard Tier</option>
                            <option value="Premium Tier">Premium Tier</option>
                          </select>
                          <button
                            onClick={handleUpdateTier}
                            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-xs cursor-pointer text-xs"
                          >
                            Update
                          </button>
                        </div>
                      </div>

                    </div>

                    {/* Action 3: Suspend / Deactivate */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-slate-500">
                        Account Status: <strong>{selectedStudent.status}</strong>
                      </span>
                      <button
                        onClick={handleToggleStudentStatus}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs cursor-pointer transition-colors ${
                          selectedStudent.status === 'Active'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                        }`}
                      >
                        {selectedStudent.status === 'Active' ? 'Deactivate Student Account' : 'Re-Activate Account'}
                      </button>
                    </div>

                  </div>
                )}

                {/* Read-only notice for Faculty */}
                {isFaculty && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500 text-center">
                    Account lifecycle actions (package extension, tier upgrade, suspension) are restricted to platform administrators.
                  </div>
                )}
              </div>

              {/* Drawer Sticky Footer */}
              <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/90 flex justify-end shrink-0 sticky bottom-0 z-10">
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Close Profile
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
