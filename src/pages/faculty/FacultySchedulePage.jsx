import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  BookOpen, 
  Radio, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Layers, 
  FileText,
  UploadCloud,
  Check,
  Plus,
  Sliders,
  CalendarCheck,
  AlertCircle
} from 'lucide-react';
import { catalogService } from '../../services/catalogService';
import { curriculumService } from '../../services/curriculumService';
import { peopleService } from '../../services/peopleService';
import { facultyAvailabilityService, WEEKDAYS } from '../../services/facultyAvailabilityService';
import { STANDARD_TIME_SLOTS } from '../../utils/scheduleSlotUtils';

export default function FacultySchedulePage() {
  const { examId = 'neet-pg' } = useParams();
  const navigate = useNavigate();

  const [exams, setExams] = useState(() => catalogService.getExams());
  const [currentExam, setCurrentExam] = useState(() => 
    catalogService.getExamById(examId) || { id: examId, name: examId.toUpperCase() }
  );
  const [scheduleSlots, setScheduleSlots] = useState(() => curriculumService.getSchedule(examId));
  const [selectedWeek, setSelectedWeek] = useState(1);

  // Faculty profile & Availability state
  const currentFaculty = peopleService.getCurrentFacultyProfile();
  const facultyEmail = currentFaculty?.email || 'faculty@demo.com';

  const [availabilityProfile, setAvailabilityProfile] = useState(() => 
    facultyAvailabilityService.getAvailabilityForFaculty(facultyEmail)
  );
  const [selectedWeekday, setSelectedWeekday] = useState('Monday');
  const [availabilitySaveSuccess, setAvailabilitySaveSuccess] = useState(false);
  const [isAvailabilityPanelOpen, setIsAvailabilityPanelOpen] = useState(false);

  // Synchronize with services
  useEffect(() => {
    const unsubCatalog = catalogService.subscribe(payload => {
      setExams(payload.exams);
      const matched = payload.exams.find(e => e.id === examId);
      if (matched) setCurrentExam(matched);
    });

    const handleScheduleUpdate = () => {
      setScheduleSlots(curriculumService.getSchedule(examId));
    };
    window.addEventListener('medprep-schedule-updated', handleScheduleUpdate);

    const unsubAvail = facultyAvailabilityService.subscribe(() => {
      setAvailabilityProfile(facultyAvailabilityService.getAvailabilityForFaculty(facultyEmail));
    });

    return () => {
      unsubCatalog();
      window.removeEventListener('medprep-schedule-updated', handleScheduleUpdate);
      unsubAvail();
    };
  }, [examId, facultyEmail]);

  // Transform curriculumService schedule slots into 4 dynamic weeks (28 days)
  const weeksData = useMemo(() => {
    const cleanFacultyName = currentFaculty?.name ? currentFaculty.name.replace(/^Dr\.\s*/i, '').toLowerCase().trim() : '';

    return [1, 2, 3, 4].map(weekNum => {
      const startDay = (weekNum - 1) * 7 + 1;
      const endDay = weekNum * 7;
      const weekSlots = scheduleSlots.filter(s => Number(s.weekNumber) === weekNum);

      // Find first non-empty subject in this week
      const firstSubjectName = weekSlots.find(s => s.subjectName)?.subjectName || 'Clinical Medicine';
      
      const isWeekAssignedToMe = weekSlots.some(s => 
        s.facultyEmail?.toLowerCase() === facultyEmail.toLowerCase() ||
        (cleanFacultyName && s.facultyName?.toLowerCase().includes(cleanFacultyName))
      );

      const days = Array.from({ length: 7 }, (_, i) => {
        const dayNumber = startDay + i;
        const matchingSlots = weekSlots.filter(s => Number(s.dayNumber) === dayNumber);
        const primarySlot = matchingSlots[0] || null;

        const isDayAssignedToMe = primarySlot ? (
          primarySlot.facultyEmail?.toLowerCase() === facultyEmail.toLowerCase() ||
          (cleanFacultyName && primarySlot.facultyName?.toLowerCase().includes(cleanFacultyName))
        ) : false;

        return {
          day: dayNumber,
          title: primarySlot?.dayTitle?.replace(/^Day \d+ (—|-)? ?/, '') || primarySlot?.moduleTitle || `Day ${dayNumber} Curriculum`,
          type: primarySlot?.subjectName || firstSubjectName,
          live: Boolean(primarySlot?.hasLive),
          liveTime: primarySlot?.lectureTimeSlot || '8:00 PM',
          hasTest: Boolean(primarySlot?.hasTest),
          assigned: isDayAssignedToMe,
          status: primarySlot?.status || (dayNumber <= 2 ? 'Released' : 'Scheduled'),
          slotData: primarySlot
        };
      });

      return {
        weekNumber: weekNum,
        title: `Week ${weekNum}: ${firstSubjectName}`,
        specialty: isWeekAssignedToMe ? `${firstSubjectName} (Your Department)` : firstSubjectName,
        assignedToMe: isWeekAssignedToMe,
        days
      };
    });
  }, [scheduleSlots, currentFaculty, facultyEmail]);

  const currentWeekData = weeksData.find(w => w.weekNumber === selectedWeek) || weeksData[0];

  // Handler: Toggle single standard slot for selected weekday
  const handleToggleSlot = (slotId) => {
    const updated = facultyAvailabilityService.toggleSlot(facultyEmail, selectedWeekday, slotId);
    setAvailabilityProfile(updated);
    setAvailabilitySaveSuccess(true);
    setTimeout(() => setAvailabilitySaveSuccess(false), 2000);
  };

  // Handler: Batch apply current weekday's pattern to all Mon-Fri weekdays
  const handleApplyToAllWeekdays = () => {
    const currentDaySlots = availabilityProfile?.declaredWeeklySlots?.[selectedWeekday] || [];
    const newWeekly = { ...availabilityProfile?.declaredWeeklySlots };
    ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].forEach(day => {
      newWeekly[day] = [...currentDaySlots];
    });
    const updated = facultyAvailabilityService.setAvailabilityForFaculty(facultyEmail, newWeekly);
    setAvailabilityProfile(updated);
    setAvailabilitySaveSuccess(true);
    setTimeout(() => setAvailabilitySaveSuccess(false), 2000);
  };

  // Summary calculation of total declared slots
  const totalDeclaredSlots = useMemo(() => {
    if (!availabilityProfile?.declaredWeeklySlots) return 0;
    return Object.values(availabilityProfile.declaredWeeklySlots).reduce((sum, arr) => sum + (arr?.length || 0), 0);
  }, [availabilityProfile]);

  return (
    <div className="space-y-6 animate-in fade-in max-w-6xl">
      {/* Exam Switcher Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {exams.map((ex) => {
          const isCurrent = ex.id === examId;
          return (
            <button
              key={ex.id}
              onClick={() => {
                navigate(`/faculty/schedule/${ex.id}`);
                setCurrentExam(ex);
              }}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2.5 shrink-0 cursor-pointer border ${
                isCurrent
                  ? 'bg-white text-indigo-700 border-indigo-300 shadow-sm ring-2 ring-indigo-500/10'
                  : 'bg-white/60 text-slate-600 border-slate-200/80 hover:bg-white hover:text-slate-900'
              }`}
            >
              <span className="text-base">{ex.flag || '🩺'}</span>
              <span>{ex.name}</span>
            </button>
          );
        })}
      </div>

      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Faculty Teaching Timetable
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
              Live Delivery & Timetable
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {currentExam.name} — Teaching Calendar
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            Live delivery schedule synchronized with curriculum services. Review confirmed clinical lessons, grand rounds, and declare your weekly teaching availability.
          </p>
        </div>

        {/* Action CTAs */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setIsAvailabilityPanelOpen(!isAvailabilityPanelOpen)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border ${
              isAvailabilityPanelOpen
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>{isAvailabilityPanelOpen ? 'Hide Availability' : 'Declare Availability'}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-white/30 text-[10px] font-black">
              {totalDeclaredSlots} Slots
            </span>
          </button>

          <Link
            to="/faculty/upload"
            className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Quick Import</span>
          </Link>
        </div>
      </div>

      {/* Interactive Clinician Availability Declaration Panel */}
      {isAvailabilityPanelOpen && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-200 shadow-sm space-y-5 animate-in slide-in-from-top-4 duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-black text-slate-900">
                  Declare Weekly Teaching Availability
                </h3>
                {availabilitySaveSuccess && (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-black animate-in fade-in flex items-center gap-1">
                    <Check className="w-3 h-3" /> Saved to Timetable Engine
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Select your preferred 6 standard lecture windows. Administrative timetable coordinators will match your declared availability when assigning cohort masterclasses.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleApplyToAllWeekdays}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Copy {selectedWeekday} to Mon–Fri
              </button>
            </div>
          </div>

          {/* Weekday Selector Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {WEEKDAYS.map(day => {
              const count = availabilityProfile?.declaredWeeklySlots?.[day]?.length || 0;
              const isSelected = selectedWeekday === day;
              return (
                <button
                  key={day}
                  onClick={() => setSelectedWeekday(day)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>{day}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                    isSelected ? 'bg-white/30 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* 6 Standard Time Slots Grid for Selected Day */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {STANDARD_TIME_SLOTS.map(slot => {
              const daySlots = availabilityProfile?.declaredWeeklySlots?.[selectedWeekday] || [];
              const isAvailable = daySlots.includes(slot.id);

              return (
                <div
                  key={slot.id}
                  onClick={() => handleToggleSlot(slot.id)}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start justify-between gap-3 ${
                    isAvailable
                      ? 'bg-emerald-50/70 border-emerald-400 shadow-xs'
                      : 'bg-slate-50 border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-black text-slate-900">
                      <span>{slot.icon}</span>
                      <span>{slot.label}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">
                      {slot.timeRange}
                    </div>
                    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      isAvailable ? 'bg-emerald-200/60 text-emerald-900' : 'bg-slate-200/80 text-slate-600'
                    }`}>
                      {isAvailable ? '✓ Declared Available' : 'Off-Duty'}
                    </span>
                  </div>

                  <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors shrink-0 ${
                    isAvailable ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-400'
                  }`}>
                    {isAvailable ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <span>
              Configuring for: <strong className="text-slate-700">{facultyEmail}</strong> ({currentFaculty?.specialty || 'Faculty'})
            </span>
            <span>Changes persist immediately into admin slot matrix.</span>
          </div>
        </div>
      )}

      {/* Week Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {weeksData.map((wk) => {
          const isSelected = selectedWeek === wk.weekNumber;
          return (
            <button
              key={wk.weekNumber}
              onClick={() => setSelectedWeek(wk.weekNumber)}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                  : 'bg-white text-slate-700 border-slate-200/80 hover:border-indigo-200'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-extrabold uppercase">
                <span className={isSelected ? 'text-indigo-200' : 'text-slate-400'}>
                  Week {wk.weekNumber}
                </span>
                {wk.assignedToMe && (
                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${
                    isSelected ? 'bg-indigo-700 text-white' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  }`}>
                    Your Dept
                  </span>
                )}
              </div>
              <div className="text-xs font-black mt-1 line-clamp-1">
                {wk.title.replace(`Week ${wk.weekNumber}: `, '')}
              </div>
              <div className={`text-[10px] mt-1 ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                7 Daily Curriculum Deliverables
              </div>
            </button>
          );
        })}
      </div>

      {/* Days Table / Grid */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-slate-900">
              {currentWeekData.title}
            </h2>
            <p className="text-xs text-slate-500">
              Department Specialty: <span className="font-bold text-slate-700">{currentWeekData.specialty}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {currentWeekData.days.map((d) => (
            <div
              key={d.day}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-3 group ${
                d.live
                  ? 'bg-rose-50/40 border-rose-200 shadow-xs'
                  : 'bg-slate-50/60 border-slate-200/80 hover:bg-white hover:border-indigo-200'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2.5 py-0.5 rounded-lg">
                    Day #{d.day}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {d.live && (
                      <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black uppercase flex items-center gap-1">
                        <Radio className="w-3 h-3" />
                        <span>{d.liveTime || 'Live Clinic'}</span>
                      </span>
                    )}
                    {d.hasTest && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black uppercase">
                        CBT
                      </span>
                    )}
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      d.status === 'Released'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : d.status === 'Live Tonight'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {d.status}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                    {d.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">{d.type}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">
                  {d.assigned ? `Lead: ${currentFaculty?.name || 'Assigned'}` : 'Department Assigned'}
                </span>

                <div className="flex items-center gap-3">
                  <Link
                    to={`/day/${d.day}`}
                    target="_blank"
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    <span>LMS View</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
