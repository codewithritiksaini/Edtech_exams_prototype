import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  BookOpen, 
  Layers, 
  FileText,
  CheckCircle2, 
  AlertCircle,
  ChevronRight,
  ExternalLink,
  Sliders,
  Filter,
  CalendarCheck,
  CalendarDays,
  CalendarX,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  FolderTree,
  Eye
} from 'lucide-react';
import { catalogService } from '../../services/catalogService';
import { curriculumService } from '../../services/curriculumService';
import { peopleService } from '../../services/peopleService';
import { facultyAvailabilityService } from '../../services/facultyAvailabilityService';

export default function FacultySchedulePage() {
  const { examId: routeExamId } = useParams();

  // SCOPE ENFORCEMENT: Strictly locked to authenticated faculty profile.
  // URL query params or spoofed IDs are deliberately ignored to enforce role boundary.
  const currentFaculty = peopleService.getCurrentFacultyProfile();
  const facultyEmail = currentFaculty?.email || 'faculty@demo.com';

  const [exams, setExams] = useState(() => catalogService.getExams());
  const [selectedExamFilter, setSelectedExamFilter] = useState(routeExamId || 'all');
  const [timeHorizonFilter, setTimeHorizonFilter] = useState('upcoming'); // 'today' | 'week' | 'upcoming' | 'all'
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'Scheduled' | 'Confirmed' | 'Completed' | 'Cancelled'

  const [scheduleSlots, setScheduleSlots] = useState(() => 
    curriculumService.getFacultySchedule(facultyEmail, selectedExamFilter === 'all' ? null : selectedExamFilter)
  );

  // Synchronize with services
  useEffect(() => {
    const unsubCatalog = catalogService.subscribe(payload => {
      setExams(payload.exams);
    });

    const handleScheduleUpdate = () => {
      setScheduleSlots(
        curriculumService.getFacultySchedule(
          facultyEmail, 
          selectedExamFilter === 'all' ? null : selectedExamFilter
        )
      );
    };

    window.addEventListener('medprep-schedule-updated', handleScheduleUpdate);
    window.addEventListener('medprep-delivery-plan-updated', handleScheduleUpdate);

    return () => {
      unsubCatalog();
      window.removeEventListener('medprep-schedule-updated', handleScheduleUpdate);
      window.removeEventListener('medprep-delivery-plan-updated', handleScheduleUpdate);
    };
  }, [facultyEmail, selectedExamFilter]);

  // Compute Date Boundaries for Horizons
  const { todayStr, weekStartStr, weekEndStr } = useMemo(() => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    // Compute Monday of current week
    const dayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday
    const distanceToMonday = (dayOfWeek + 6) % 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - distanceToMonday);

    // Compute Sunday of current week
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    return {
      todayStr: today,
      weekStartStr: monday.toISOString().split('T')[0],
      weekEndStr: sunday.toISOString().split('T')[0]
    };
  }, []);

  // Filter and Enrich Slots with Canonical Academic Data
  const enrichedSlots = useMemo(() => {
    return scheduleSlots.map(slot => {
      // Canonically resolve academic entities
      const primaryLectureId = slot.lectureIds?.[0] || 
        slot.deliveryItems?.find(i => i.type === 'lecture')?.lectureId || null;
      
      const canonicalLecture = primaryLectureId ? curriculumService.getLectureById(primaryLectureId) : null;
      const canonicalSubject = slot.subjectId ? curriculumService.getSubjectById(slot.subjectId) : null;
      const canonicalModule = slot.moduleId ? curriculumService.getModuleById(slot.moduleId) : null;
      const exam = exams.find(e => e.id === slot.examId);

      // Safe date formatting
      let displayDate = slot.scheduledDate || 'Date to be announced';
      let weekdayName = '';
      if (slot.scheduledDate) {
        try {
          const parts = slot.scheduledDate.split('-');
          if (parts.length === 3) {
            const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
            displayDate = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
            weekdayName = d.toLocaleDateString('en-US', { weekday: 'long' });
          }
        } catch (e) {
          // ignore
        }
      }

      return {
        ...slot,
        canonicalLecture,
        canonicalSubject,
        canonicalModule,
        examName: exam?.name || slot.examId?.toUpperCase() || 'Medical Track',
        resolvedTitle: canonicalLecture?.title || slot.dayTitle?.replace(/^Day \d+ (—|-)? ?/, '') || slot.moduleTitle || 'Clinical Session',
        resolvedSubjectName: canonicalSubject?.name || slot.subjectName || 'Medical Subject',
        resolvedModuleName: canonicalModule?.title || slot.moduleTitle || 'Clinical Module',
        displayDate,
        weekdayName,
        isCancelled: String(slot.status).toLowerCase() === 'cancelled',
        isToday: slot.scheduledDate === todayStr,
        isThisWeek: slot.scheduledDate >= weekStartStr && slot.scheduledDate <= weekEndStr
      };
    });
  }, [scheduleSlots, exams, todayStr, weekStartStr, weekEndStr]);

  // Apply Horizon & Status Filters
  const filteredSlots = useMemo(() => {
    return enrichedSlots.filter(slot => {
      // Horizon filter
      if (timeHorizonFilter === 'today') {
        if (slot.scheduledDate !== todayStr) return false;
      } else if (timeHorizonFilter === 'week') {
        if (!slot.scheduledDate || slot.scheduledDate < weekStartStr || slot.scheduledDate > weekEndStr) {
          return false;
        }
      } else if (timeHorizonFilter === 'upcoming') {
        if (slot.scheduledDate && slot.scheduledDate < todayStr) return false;
      }

      // Status filter
      if (statusFilter !== 'all') {
        if (String(slot.status).toLowerCase() !== statusFilter.toLowerCase()) return false;
      }

      return true;
    }).sort((a, b) => {
      if (a.scheduledDate && b.scheduledDate) {
        return a.scheduledDate.localeCompare(b.scheduledDate);
      }
      return (a.dayNumber || 0) - (b.dayNumber || 0);
    });
  }, [enrichedSlots, timeHorizonFilter, statusFilter, todayStr, weekStartStr, weekEndStr]);

  // KPI Metrics
  const metrics = useMemo(() => {
    return {
      totalAssigned: enrichedSlots.length,
      todayCount: enrichedSlots.filter(s => s.isToday && !s.isCancelled).length,
      thisWeekCount: enrichedSlots.filter(s => s.isThisWeek && !s.isCancelled).length,
      upcomingCount: enrichedSlots.filter(s => s.scheduledDate >= todayStr && !s.isCancelled).length,
      cancelledCount: enrichedSlots.filter(s => s.isCancelled).length
    };
  }, [enrichedSlots, todayStr]);

  // Status Badge Helper
  const renderStatusBadge = (status, isCancelled) => {
    if (isCancelled || String(status).toLowerCase() === 'cancelled') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
          <CalendarX className="w-3 h-3" />
          Cancelled
        </span>
      );
    }
    if (String(status).toLowerCase() === 'completed') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-800 border border-indigo-200 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" />
          Completed
        </span>
      );
    }
    if (String(status).toLowerCase() === 'in progress') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1 animate-pulse">
          In Progress
        </span>
      );
    }
    if (String(status).toLowerCase() === 'confirmed') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-sky-100 text-sky-800 border border-sky-200 flex items-center gap-1">
          Confirmed
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
        <CalendarCheck className="w-3 h-3" />
        Scheduled
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Faculty Teaching Calendar
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
              {currentFaculty?.name || 'Dr. Siddharth V.'} ({facultyEmail})
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            My Teaching Schedule
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Live lectures and clinical sessions assigned to you by Academic Administration. Canonical curriculum entities update automatically if lecture details change.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <Link
            to="/faculty/availability"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm"
          >
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>Manage My Availability</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </Link>
        </div>
      </div>

      {/* KPI Dashboard Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div 
          onClick={() => setTimeHorizonFilter('today')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer select-none ${
            timeHorizonFilter === 'today'
              ? 'bg-emerald-50 border-emerald-300 shadow-xs'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
            Today's Classes
          </span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {metrics.todayCount}
          </div>
          <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">
            Sessions today
          </div>
        </div>

        <div 
          onClick={() => setTimeHorizonFilter('week')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer select-none ${
            timeHorizonFilter === 'week'
              ? 'bg-indigo-50 border-indigo-300 shadow-xs'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <CalendarDays className="w-3.5 h-3.5 text-indigo-600" />
            This Week
          </span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {metrics.thisWeekCount}
          </div>
          <div className="text-[10px] text-indigo-700 font-semibold mt-0.5">
            Mon–Sun window
          </div>
        </div>

        <div 
          onClick={() => setTimeHorizonFilter('upcoming')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer select-none ${
            timeHorizonFilter === 'upcoming'
              ? 'bg-sky-50 border-sky-300 shadow-xs'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <CalendarCheck className="w-3.5 h-3.5 text-sky-600" />
            Upcoming
          </span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {metrics.upcomingCount}
          </div>
          <div className="text-[10px] text-sky-700 font-semibold mt-0.5">
            Active bookings ahead
          </div>
        </div>

        <div 
          onClick={() => setTimeHorizonFilter('all')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer select-none ${
            timeHorizonFilter === 'all'
              ? 'bg-slate-100 border-slate-300 shadow-xs'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-slate-600" />
            Total Assigned
          </span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {metrics.totalAssigned}
          </div>
          <div className="text-[10px] text-slate-500 font-semibold mt-0.5">
            Across all exams
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <CalendarX className="w-3.5 h-3.5 text-rose-500" />
            Cancelled Sessions
          </span>
          <div className="text-2xl font-black text-rose-700">
            {metrics.cancelledCount}
          </div>
          <div className="text-[10px] text-slate-400">
            Retained in audit log
          </div>
        </div>
      </div>

      {/* Control Bar: Filters & View Modes */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex items-center justify-between flex-wrap gap-4">
        {/* Left: Time Horizon Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          {[
            { id: 'today', label: "Today's Classes" },
            { id: 'week', label: 'This Week' },
            { id: 'upcoming', label: 'Upcoming' },
            { id: 'all', label: 'All Classes' }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setTimeHorizonFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                timeHorizonFilter === tab.id
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Right: Exam Filter, Status Filter & View Toggle */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Exam Filter */}
          <select
            value={selectedExamFilter}
            onChange={(e) => setSelectedExamFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Assigned Exams</option>
            {exams.map(e => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Main Schedule List / Feed */}
      {filteredSlots.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs space-y-3">
          <CalendarCheck className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-black text-slate-800">
            No Teaching Sessions Found
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            {timeHorizonFilter === 'today'
              ? 'You have no live classes or clinical lectures scheduled for today.'
              : timeHorizonFilter === 'week'
              ? 'No classes are scheduled for you in the current week.'
              : 'You have no assigned classes matching the current filter criteria.'}
          </p>
          <div className="pt-2">
            <Link
              to="/faculty/availability"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
            >
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Update Teaching Availability</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredSlots.map(slot => {
            const isStruck = slot.isCancelled;

            return (
              <div
                key={slot.id}
                className={`bg-white rounded-3xl p-5 sm:p-6 border transition-all hover:shadow-sm space-y-4 ${
                  slot.isToday && !slot.isCancelled
                    ? 'border-emerald-300 ring-2 ring-emerald-500/10'
                    : slot.isCancelled
                    ? 'border-rose-200 bg-rose-50/20 opacity-75'
                    : 'border-slate-200'
                }`}
              >
                {/* Top Row: Date, Time & Status */}
                <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-2xl flex items-center justify-center font-bold shrink-0 ${
                      slot.isToday ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      <CalendarIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-black text-slate-900 flex items-center gap-2">
                        <span>{slot.displayDate}</span>
                        {slot.isToday && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-white">
                            Today
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{slot.lectureTimeSlot || 'Time to be announced'}</span>
                        <span>•</span>
                        <span>{slot.estimatedTime || '1.5 hours'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {renderStatusBadge(slot.status, slot.isCancelled)}
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 border border-slate-200">
                      {slot.examName}
                    </span>
                  </div>
                </div>

                {/* Middle: Canonical Academic Hierarchy Context */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="md:col-span-2 space-y-2">
                    {/* Subject & Module Pills */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {slot.resolvedSubjectName}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                        <FolderTree className="w-3 h-3 text-slate-400" />
                        {slot.resolvedModuleName}
                      </span>
                    </div>

                    {/* Resolved Lecture Title */}
                    <h3 className={`text-base font-black text-slate-900 ${isStruck ? 'line-through text-slate-400' : ''}`}>
                      {slot.resolvedTitle}
                    </h3>

                    {/* Delivery Day reference */}
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <span className="font-bold text-slate-700">Delivery Plan Reference:</span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold">
                        Week {slot.weekNumber} • Day {slot.dayNumber}
                      </span>
                      {slot.notes && (
                        <>
                          <span>•</span>
                          <span className="italic">"{slot.notes}"</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="flex flex-row md:flex-col justify-end md:justify-center items-end gap-2 shrink-0">
                    {slot.canonicalLecture ? (
                      <Link
                        to={`/faculty/exams/${slot.examId}/subjects/${slot.subjectId}/modules/${slot.moduleId}/lectures/${slot.canonicalLecture.id}/content`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Content Studio</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    ) : (
                      <Link
                        to="/faculty/upload"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Manage Content</span>
                      </Link>
                    )}

                    <a
                      href={`/day/${slot.dayNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-slate-500 hover:text-slate-800 text-[11px] font-bold hover:bg-slate-100 transition-colors"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Preview Delivery Day</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
