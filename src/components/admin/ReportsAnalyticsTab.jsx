import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Users, 
  BookOpen, 
  Download, 
  Calendar, 
  ArrowUpRight, 
  GraduationCap, 
  CheckCircle2, 
  Sparkles, 
  PieChart, 
  Layers, 
  Radio, 
  Star,
  FileSpreadsheet,
  FileText
} from 'lucide-react';

export default function ReportsAnalyticsTab() {
  const [dateRange, setDateRange] = useState('Last 6 Months');
  const [selectedExamMetric, setSelectedExamMetric] = useState('all');
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4500);
  };

  const handleExport = (format) => {
    showToast(`✅ Generating and exporting platform ${format} report for ${dateRange}... Download starting.`);
  };

  // Monthly enrollment data for trend chart
  const enrollmentMonths = [
    { month: 'Oct 2025', neet: 120, usmle: 85, plab: 38, europe: 22, total: 265 },
    { month: 'Nov 2025', neet: 145, usmle: 98, plab: 42, europe: 28, total: 313 },
    { month: 'Dec 2025', neet: 160, usmle: 110, plab: 50, europe: 35, total: 355 },
    { month: 'Jan 2026', neet: 190, usmle: 135, plab: 62, europe: 44, total: 431 },
    { month: 'Feb 2026', neet: 215, usmle: 152, plab: 74, europe: 51, total: 492 },
    { month: 'Mar 2026', neet: 250, usmle: 175, plab: 88, europe: 64, total: 577 }
  ];

  // Revenue breakdown by exam
  const revenueByExam = [
    { name: 'NEET PG & NExT 2026', amount: '₹42.5 L', percentage: 44.5, color: 'bg-indigo-600', textColor: 'text-indigo-700', bgSoft: 'bg-indigo-50', count: '680 Enrolled' },
    { name: 'USMLE Step 1 & 2 CK', amount: '₹31.2 L', percentage: 32.7, color: 'bg-blue-600', textColor: 'text-blue-700', bgSoft: 'bg-blue-50', count: '415 Enrolled' },
    { name: 'PLAB 1 & 2 / UKMLA', amount: '₹12.8 L', percentage: 13.4, color: 'bg-emerald-600', textColor: 'text-emerald-700', bgSoft: 'bg-emerald-50', count: '185 Enrolled' },
    { name: 'Europe Medical Licensing', amount: '₹8.9 L', percentage: 9.4, color: 'bg-purple-600', textColor: 'text-purple-700', bgSoft: 'bg-purple-50', count: '140 Enrolled' }
  ];

  // Package tier popularity
  const packagePopularity = [
    { tier: 'Standard Tier (6 Months)', percentage: 52, count: '738 Doctors', revenue: '₹48.2 L', color: 'bg-indigo-600', desc: 'Core choice: Complete lecture vault, QBank & Anki flashcards' },
    { tier: 'Premium VIP (12 Months)', percentage: 31, count: '440 Doctors', revenue: '₹36.8 L', color: 'bg-amber-500', desc: 'High margin: Weekly Live Grand Rounds + 1-on-1 Residency counseling' },
    { tier: 'Basic Foundation (3 Months)', percentage: 17, count: '242 Doctors', revenue: '₹10.4 L', color: 'bg-slate-400', desc: 'Entry tier: PDF notes & core clinical modules only' }
  ];

  // Faculty activity scoreboard
  const facultyActivity = [
    { name: 'Dr. Siddharth V.', specialty: 'DM Interventional Cardiology', track: 'NEET PG & USMLE', uploadsThisMonth: 18, liveRounds: 5, rating: '4.92', studentsServed: 620 },
    { name: 'Dr. Ananya Sen', specialty: 'MD General Medicine', track: 'NEET PG Internal Medicine', uploadsThisMonth: 14, liveRounds: 4, rating: '4.88', studentsServed: 540 },
    { name: 'Dr. Marcus Vance', specialty: 'MD, FACC Cardiology', track: 'USMLE Step 1 & 2', uploadsThisMonth: 12, liveRounds: 3, rating: '4.85', studentsServed: 380 },
    { name: 'Dr. Priya Sharma', specialty: 'MRCP, NHS Consultant', track: 'PLAB 1 & 2 / UKMLA', uploadsThisMonth: 11, liveRounds: 3, rating: '4.86', studentsServed: 185 },
    { name: 'Dr. Elena Rossi', specialty: 'MD Approbation Specialist', track: 'Europe Medical Licensing', uploadsThisMonth: 9, liveRounds: 2, rating: '4.90', studentsServed: 140 }
  ];

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
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-8">
        
        {/* Header Bar with Export Options */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-800 text-xs font-bold mb-1.5 border border-brand-200/60">
              <BarChart3 className="w-3.5 h-3.5 text-brand-600" />
              <span>Executive Business Intelligence (Part C — Admin Only)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Platform Financial & Academic Analytics
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Super Admin commercial dashboard tracking student enrollment growth, package tier performance, and faculty productivity.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="Last 30 Days">Last 30 Days</option>
              <option value="Last 3 Months">Last 3 Months</option>
              <option value="Last 6 Months">Last 6 Months</option>
              <option value="Year to Date">Year to Date (2026)</option>
            </select>

            <button
              onClick={() => handleExport('PDF')}
              className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-rose-600" />
              <span>Export PDF</span>
            </button>

            <button
              onClick={() => handleExport('Excel')}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export Excel</span>
            </button>
          </div>
        </div>

        {/* ------------------------------------------------------------------- */}
        {/* 1. TOP EXECUTIVE KPI STATS CARDS                                    */}
        {/* ------------------------------------------------------------------- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="p-5 bg-gradient-to-br from-indigo-50/70 to-white rounded-2xl border border-indigo-100 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-indigo-700">
              <span>Gross Platform Revenue</span>
              <DollarSign className="w-4 h-4" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">₹95.4 Lakhs</div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+24.6% vs previous period</span>
            </div>
          </div>

          <div className="p-5 bg-gradient-to-br from-blue-50/70 to-white rounded-2xl border border-blue-100 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-blue-700">
              <span>Active Enrolled Candidates</span>
              <Users className="w-4 h-4" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">1,420 Doctors</div>
            <div className="text-[11px] text-slate-500 font-medium">Across all 4 licensing tracks</div>
          </div>

          <div className="p-5 bg-gradient-to-br from-purple-50/70 to-white rounded-2xl border border-purple-100 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-purple-700">
              <span>Average Course Completion</span>
              <TrendingUp className="w-4 h-4" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">74.6%</div>
            <div className="text-[11px] text-purple-700 font-bold">88.4% Mock Exam Turnout</div>
          </div>

          <div className="p-5 bg-gradient-to-br from-amber-50/70 to-white rounded-2xl border border-amber-100 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-amber-800">
              <span>Faculty Satisfaction Index</span>
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">4.89 / 5.0</div>
            <div className="text-[11px] text-amber-900 font-medium">Based on 3,420 candidate reviews</div>
          </div>

        </div>

        {/* ------------------------------------------------------------------- */}
        {/* 2. ENROLLMENT TREND CHART & REVENUE BY EXAM                         */}
        {/* ------------------------------------------------------------------- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Enrollment Trend (2 Columns) */}
          <div className="lg:col-span-2 p-6 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-600" />
                  <span>Student Sign-Up Trend (Past 6 Months)</span>
                </h3>
                <p className="text-[11px] text-slate-400">Monthly new doctor registrations broken down by exam</p>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-bold">
                <span className="flex items-center gap-1 text-indigo-600"><span className="w-2 h-2 rounded-full bg-indigo-600" /> NEET PG</span>
                <span className="flex items-center gap-1 text-blue-600"><span className="w-2 h-2 rounded-full bg-blue-600" /> USMLE</span>
                <span className="flex items-center gap-1 text-emerald-600"><span className="w-2 h-2 rounded-full bg-emerald-600" /> PLAB</span>
                <span className="flex items-center gap-1 text-purple-600"><span className="w-2 h-2 rounded-full bg-purple-600" /> Europe</span>
              </div>
            </div>

            {/* Visual Bar Chart */}
            <div className="space-y-3 pt-2">
              {enrollmentMonths.map((m) => (
                <div key={m.month} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 w-20">{m.month}</span>
                    <div className="flex-grow mx-3 h-6 bg-slate-100 rounded-lg overflow-hidden flex">
                      <div style={{ width: `${(m.neet / m.total) * 100}%` }} className="bg-indigo-600 h-full" title={`NEET PG: ${m.neet}`} />
                      <div style={{ width: `${(m.usmle / m.total) * 100}%` }} className="bg-blue-500 h-full" title={`USMLE: ${m.usmle}`} />
                      <div style={{ width: `${(m.plab / m.total) * 100}%` }} className="bg-emerald-500 h-full" title={`PLAB: ${m.plab}`} />
                      <div style={{ width: `${(m.europe / m.total) * 100}%` }} className="bg-purple-500 h-full" title={`Europe: ${m.europe}`} />
                    </div>
                    <span className="font-bold text-slate-900 font-mono text-xs w-16 text-right">{m.total} docs</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs text-slate-600 font-medium">
              <span>Overall 6-Month Candidate Intake: <strong>2,433 Doctor Registrations</strong></span>
              <span className="text-emerald-700 font-bold">+117% Growth Rate</span>
            </div>
          </div>

          {/* Revenue by Exam Category (1 Column) */}
          <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <PieChart className="w-4 h-4 text-emerald-600" />
                <span>Revenue by Exam Category</span>
              </h3>
              <p className="text-[11px] text-slate-400">Total bookings distribution across tracks</p>
            </div>

            <div className="space-y-3 pt-1">
              {revenueByExam.map((rev) => (
                <div key={rev.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 line-clamp-1">{rev.name}</span>
                    <span className="font-black text-slate-900">{rev.amount}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      style={{ width: `${rev.percentage}%` }} 
                      className={`h-full ${rev.color}`} 
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>{rev.count}</span>
                    <span className="font-bold text-slate-700">{rev.percentage}% of total</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-200/80 text-xs text-indigo-900">
              <strong>Dominant Track:</strong> NEET PG generates 44.5% of gross revenue, with USMLE Step 1 seeing the fastest international expansion.
            </div>
          </div>

        </div>

        {/* ------------------------------------------------------------------- */}
        {/* 3. PACKAGE POPULARITY & STUDENT ENGAGEMENT                          */}
        {/* ------------------------------------------------------------------- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          
          {/* Package Popularity */}
          <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-500" />
                <span>Package Tier Popularity (Rule 9 Validation)</span>
              </h3>
              <p className="text-[11px] text-slate-400">Share of enrollment across Basic, Standard, and Premium tiers</p>
            </div>

            <div className="space-y-4">
              {packagePopularity.map((pkg) => (
                <div key={pkg.tier} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900 block">{pkg.tier}</span>
                      <span className="text-[10px] text-slate-500">{pkg.desc}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-slate-900 text-sm block">{pkg.percentage}%</span>
                      <span className="text-[10px] text-slate-400 font-mono">{pkg.count}</span>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      style={{ width: `${pkg.percentage}%` }} 
                      className={`h-full ${pkg.color}`} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Student Engagement Metrics */}
          <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>Candidate Learning & Engagement Health</span>
              </h3>
              <p className="text-[11px] text-slate-400">Platform-wide content utilization metrics</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-center">
                <span className="text-xs font-semibold text-slate-500">Video Watch Time</span>
                <div className="text-xl font-black text-slate-900">38.4 mins</div>
                <span className="text-[10px] text-emerald-700 font-bold">+12% Daily Avg</span>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-center">
                <span className="text-xs font-semibold text-slate-500">PDF Notes Download</span>
                <div className="text-xl font-black text-indigo-700">91.2%</div>
                <span className="text-[10px] text-slate-400">High offline retention</span>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-center">
                <span className="text-xs font-semibold text-slate-500">Flashcards Retention</span>
                <div className="text-xl font-black text-amber-600">84.5%</div>
                <span className="text-[10px] text-slate-400">Spaced recall mastery</span>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-center">
                <span className="text-xs font-semibold text-slate-500">Live Round Attendance</span>
                <div className="text-xl font-black text-rose-600">78.9%</div>
                <span className="text-[10px] text-slate-400">Live webinar turnout</span>
              </div>
            </div>

            <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl text-xs text-purple-900 leading-relaxed">
              <strong>Pedagogical Insight:</strong> Over 84% of candidate doctors who practice with daily flashcards score above the 90th percentile in the scheduled CBT grand tests.
            </div>
          </div>

        </div>

        {/* ------------------------------------------------------------------- */}
        {/* 4. FACULTY ACTIVITY SCOREBOARD                                      */}
        {/* ------------------------------------------------------------------- */}
        <div className="space-y-3">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-indigo-600" />
              <span>Faculty Clinical Productivity & Content Activity</span>
            </h3>
            <p className="text-[11px] text-slate-400">Monthly upload count, live broadcast sessions, and candidate feedback</p>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-bold">
                  <th className="py-3 px-4">Faculty Specialist</th>
                  <th className="py-3 px-4">Assigned Exam Track</th>
                  <th className="py-3 px-4 text-center">Units Uploaded (This Month)</th>
                  <th className="py-3 px-4 text-center">Live Grand Rounds</th>
                  <th className="py-3 px-4 text-center">Doctors Mentored</th>
                  <th className="py-3 px-4 text-right">Student Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {facultyActivity.map((f) => (
                  <tr key={f.name} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{f.name}</div>
                      <div className="text-[10px] text-slate-400">{f.specialty}</div>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {f.track}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                        {f.uploadsThisMonth} Units
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                        {f.liveRounds} Broadcasts
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono text-slate-700">
                      {f.studentsServed}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <span className="inline-flex items-center gap-1 font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        <span>{f.rating}</span>
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
  );
}
