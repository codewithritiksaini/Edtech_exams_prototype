import React, { useState, useMemo } from 'react';
import {
  X, Users, Clock, Calendar, CheckCircle2, Plus, Edit3,
  Trash2, Eye, BookOpen, ChevronDown, ChevronUp, Activity,
  CalendarCheck, CalendarX, AlertCircle, Video, Brain, FileText
} from 'lucide-react';
import {
  STANDARD_TIME_SLOTS,
  getFacultySlotMatrix,
  SUBJECT_COLOR_MAP,
  normalizeTimeSlot
} from '../../../utils/scheduleSlotUtils';

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function FacultySlotDetailModal({
  isOpen,
  onClose,
  faculty,               // { email, name, specialty, slotsByDay }
  subjects,
  lectures,
  schedule,
  weekNumber,
  selectedExamId,
  weekDayNumbers,
  onOpenModal,           // (slot=null, targetDay, targetSubjectId, targetTimeSlot, targetFacultyEmail)
  onEditSlot,
  onDeleteSlot,
  onPreviewSlot,
}) {
  const [expandedDay, setExpandedDay] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const matrix = useMemo(() => {
    if (!faculty?.email || !isOpen) return [];
    return getFacultySlotMatrix(
      faculty.email, selectedExamId, weekNumber, schedule, subjects
    );
  }, [faculty, isOpen, selectedExamId, weekNumber, schedule, subjects]);

  const facSubjects = useMemo(() => {
    if (!faculty?.email) return [];
    return subjects.filter(s =>
      s.examId === selectedExamId &&
      s.facultyEmail?.toLowerCase() === faculty.email?.toLowerCase()
    );
  }, [faculty, subjects, selectedExamId]);

  const totalBooked = matrix.reduce((s, d) => s + d.bookedCount, 0);
  const totalSlots = matrix.length * STANDARD_TIME_SLOTS.length;
  const utilPct = totalSlots > 0 ? Math.round((totalBooked / totalSlots) * 100) : 0;

  if (!isOpen || !faculty) return null;

  return (
    <div className="fixed inset-0 -top-6 z-[9999] flex items-start justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-2xl h-full bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-indigo-600 to-purple-600 text-white shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-white font-black text-sm shrink-0">
                {faculty.name?.split(' ').map(n => n[0]).slice(0, 2).join('')}
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-black truncate">{faculty.name}</h2>
                <p className="text-indigo-200 text-xs font-medium truncate">{faculty.specialty}</p>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {facSubjects.map(s => (
                    <span key={s.id} className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-white/20 border border-white/30 text-white">
                      {s.code}: {s.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>


          {/* Utilization KPIs */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            {[
              { label: 'Booked', value: totalBooked, icon: <CalendarCheck className="w-3.5 h-3.5" />, bg: 'bg-white/10' },
              { label: 'Available', value: totalSlots - totalBooked, icon: <CalendarX className="w-3.5 h-3.5" />, bg: 'bg-white/10' },
              { label: 'Utilization', value: `${utilPct}%`, icon: <Activity className="w-3.5 h-3.5" />, bg: 'bg-white/10' },
            ].map(kpi => (
              <div key={kpi.label} className={`${kpi.bg} border border-white/20 rounded-xl p-2.5 text-center`}>
                <div className="flex items-center justify-center gap-1 text-indigo-200 text-[10px] font-bold mb-1">
                  {kpi.icon}
                  {kpi.label}
                </div>
                <div className="text-xl font-black text-white">{kpi.value}</div>
              </div>
            ))}
          </div>

          {/* Utilization bar */}
          <div className="mt-3">
            <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  utilPct >= 70 ? 'bg-rose-400' : utilPct >= 40 ? 'bg-amber-400' : 'bg-emerald-400'
                }`}
                style={{ width: `${utilPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="px-4 py-3 border-b border-slate-100 shrink-0 flex items-center gap-2">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">View:</span>
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl">
            {[
              { val: 'all', label: 'All Slots' },
              { val: 'available', label: '✅ Free Only' },
              { val: 'booked', label: '🔴 Booked Only' },
            ].map(opt => (
              <button
                key={opt.val}
                onClick={() => setFilterStatus(opt.val)}
                className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                  filterStatus === opt.val
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <span className="ml-auto text-[11px] text-slate-400 font-medium">Week {weekNumber} — 7 Days</span>
        </div>

        {/* Scrollable Day-by-Day Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {matrix.map((dayData, dayIdx) => {
            const dayName = DAY_NAMES[dayIdx];
            const isExpanded = expandedDay === dayData.dayNumber || expandedDay === null;

            // Filter slots based on filterStatus
            const visibleSlots = dayData.slots.filter(slotData => {
              if (filterStatus === 'all') return true;
              if (filterStatus === 'available') return slotData.status === 'empty';
              if (filterStatus === 'booked') return slotData.status === 'booked';
              return true;
            });

            if (filterStatus !== 'all' && visibleSlots.length === 0) return null;

            const hasBookingsToday = dayData.bookedCount > 0;

            return (
              <div
                key={dayData.dayNumber}
                className={`rounded-2xl border overflow-hidden transition-all ${
                  hasBookingsToday
                    ? 'border-indigo-200 shadow-sm'
                    : 'border-slate-200'
                }`}
              >
                {/* Day Header */}
                <button
                  onClick={() => setExpandedDay(expandedDay === dayData.dayNumber ? null : dayData.dayNumber)}
                  className={`w-full p-3 flex items-center justify-between gap-2 text-left cursor-pointer transition-colors ${
                    hasBookingsToday ? 'bg-indigo-50 hover:bg-indigo-100' : 'bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black ${
                      hasBookingsToday ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {dayData.dayNumber}
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-900 flex items-center gap-2">
                        {dayName}
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          hasBookingsToday
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'bg-slate-200 text-slate-500'
                        }`}>
                          Day {dayData.dayNumber}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium flex items-center gap-2 mt-0.5">
                        <span className="text-indigo-600 font-bold">{dayData.bookedCount} booked</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-emerald-600 font-bold">{dayData.emptyCount} available</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick slot indicator strip */}
                  <div className="flex items-center gap-1 mr-2">
                    {dayData.slots.map(slotData => (
                      <div
                        key={slotData.slotInfo.id}
                        title={`${slotData.slotInfo.label} (${slotData.slotInfo.timeRange}): ${
                          slotData.status === 'booked'
                            ? (slotData.session?.dayTitle || 'Booked')
                            : 'Available'
                        }`}
                        className={`w-2 h-5 rounded-full ${
                          slotData.status === 'booked' ? 'bg-indigo-500' : 'bg-slate-200'
                        }`}
                      />
                    ))}
                  </div>

                  {expandedDay === dayData.dayNumber
                    ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                    : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  }
                </button>

                {/* Expanded slot details */}
                {expandedDay === dayData.dayNumber && (
                  <div className="divide-y divide-slate-100">
                    {visibleSlots.map(slotData => {
                      const { slotInfo, status, session } = slotData;
                      const isBooked = status === 'booked';
                      const subj = session ? subjects.find(s => s.id === session.subjectId) : null;
                      const colorInfo = session
                        ? (SUBJECT_COLOR_MAP[session.subjectColor || subj?.color] || SUBJECT_COLOR_MAP.rose)
                        : null;

                      // Linked lectures for this session
                      const linkedLectures = session
                        ? lectures.filter(l => (session.lectureIds || []).includes(l.id))
                        : [];

                      return (
                        <div
                          key={slotInfo.id}
                          className={`p-4 ${isBooked ? `${colorInfo?.bg}` : 'bg-white hover:bg-green-50/40 transition-colors'}`}
                        >
                          {/* Slot Time Badge */}
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className={`inline-flex items-center gap-1.5 text-[11px] font-black px-2.5 py-1 rounded-lg border ${slotInfo.bgClass} ${slotInfo.textClass} ${slotInfo.borderClass}`}>
                              <Clock className="w-3 h-3" />
                              {slotInfo.icon} {slotInfo.label} — {slotInfo.timeRange}
                            </span>

                            {isBooked ? (
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200">
                                🔴 BOOKED
                              </span>
                            ) : (
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                                ✅ AVAILABLE
                              </span>
                            )}
                          </div>

                          {isBooked && session ? (
                            <div className="space-y-2">
                              {/* Subject + Lecture Info */}
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-md text-white ${colorInfo?.tag}`}>
                                  {session.subjectCode || subj?.code || 'SUB'}: {session.subjectName || subj?.name}
                                </span>
                                {session.hasLive && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-red-100 text-red-700 border border-red-200">🔴 Live Class</span>
                                )}
                                {session.hasTest && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-700 border border-amber-200">📝 CBT Test</span>
                                )}
                              </div>

                              <div>
                                <p className="text-xs font-black text-slate-900 leading-snug">{session.dayTitle}</p>
                                {session.moduleTitle && (
                                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">📁 {session.moduleTitle}</p>
                                )}
                              </div>

                              {/* Linked lectures */}
                              {linkedLectures.length > 0 && (
                                <div className="space-y-1">
                                  {linkedLectures.map(lec => (
                                    <div key={lec.id} className="flex items-center gap-2 text-[10px] text-slate-600 font-medium bg-white/60 rounded-lg px-2 py-1 border border-white/80">
                                      <BookOpen className="w-2.5 h-2.5 text-indigo-400 shrink-0" />
                                      <span className="truncate">{lec.title}</span>
                                      <span className="shrink-0 text-slate-400 ml-auto">{lec.duration}</span>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Duration + Slot ID */}
                              <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                                <Clock className="w-2.5 h-2.5" />
                                <span>{session.estimatedTime}</span>
                                <span className="text-slate-200">•</span>
                                <span className="font-mono text-slate-300">{session.id}</span>
                              </div>

                              {/* Action buttons */}
                              <div className="flex items-center gap-1.5 pt-1">
                                <button
                                  onClick={() => onEditSlot && onEditSlot(session)}
                                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[10px] font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 transition-all cursor-pointer flex items-center gap-1"
                                >
                                  <Edit3 className="w-2.5 h-2.5" /> Edit
                                </button>
                                <button
                                  onClick={() => onPreviewSlot && onPreviewSlot(session)}
                                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[10px] font-bold text-slate-600 hover:bg-sky-50 hover:text-sky-700 hover:border-sky-200 transition-all cursor-pointer flex items-center gap-1"
                                >
                                  <Eye className="w-2.5 h-2.5" /> Preview
                                </button>
                                <button
                                  onClick={() => onDeleteSlot && onDeleteSlot(session)}
                                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[10px] font-bold text-slate-500 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 transition-all cursor-pointer flex items-center gap-1"
                                >
                                  <Trash2 className="w-2.5 h-2.5" /> Remove
                                </button>
                              </div>
                            </div>
                          ) : (
                            /* Empty Slot — Book Action */
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-[11px] text-slate-400 font-medium">
                                No class scheduled for this slot — {facSubjects.length > 0 ? `${facSubjects.map(s => s.name).join(' or ')}` : 'any subject'} can be booked here.
                              </p>
                              <button
                                onClick={() => {
                                  onClose();
                                  onOpenModal && onOpenModal(
                                    null,
                                    dayData.dayNumber,
                                    facSubjects[0]?.id || null,
                                    slotInfo.timeRange,
                                    faculty.email
                                  );
                                }}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black transition-all cursor-pointer flex items-center gap-1 shrink-0 shadow-xs"
                              >
                                <Plus className="w-3 h-3" />
                                Schedule Class
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Quick Book Overlay — Button to add a session for any remaining empty slot */}
                    {filterStatus !== 'booked' && dayData.emptyCount > 0 && (
                      <div className="p-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
                        <span className="text-[11px] text-slate-400 font-medium">
                          {dayData.emptyCount} slot{dayData.emptyCount > 1 ? 's' : ''} still available on Day {dayData.dayNumber}
                        </span>
                        <button
                          onClick={() => {
                            const firstEmpty = dayData.slots.find(s => s.status === 'empty');
                            onOpenModal && onOpenModal(
                              null,
                              dayData.dayNumber,
                              facSubjects[0]?.id || null,
                              firstEmpty?.slotInfo?.timeRange || null,
                              faculty.email
                            );
                          }}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-[10px] font-bold text-emerald-700 hover:bg-emerald-100 transition-all cursor-pointer flex items-center gap-1"
                        >
                          <Plus className="w-2.5 h-2.5" />
                          Quick Schedule
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50/60 shrink-0 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-medium">
            Slot ID format: <span className="font-mono">sched-{'{'}examId{'}'}-d{'{'}day{'}'}-...</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
