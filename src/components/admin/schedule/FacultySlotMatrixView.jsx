import React, { useState, useMemo } from 'react';
import {
  Users, Calendar, Clock, CheckCircle2, Plus, Eye,
  Edit3, Trash2, ChevronRight, Activity, BookOpen,
  AlertCircle, Video, Brain, FileText, LayoutGrid
} from 'lucide-react';
import {
  STANDARD_TIME_SLOTS,
  getFacultySlotMatrix,
  SUBJECT_COLOR_MAP
} from '../../../utils/scheduleSlotUtils';

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function FacultySlotMatrixView({
  facultyAvailability,     // [{email, name, specialty, bookedCount, slotsByDay}]
  subjects,
  schedule,
  weekNumber,
  selectedExamId,
  weekDayNumbers,          // e.g. [1,2,3,4,5,6,7] for week 1
  onOpenModal,             // (slot=null, targetDay, targetSubjectId, targetTimeSlot, targetFacultyEmail)
  onEditSlot,
  onDeleteSlot,
  onPreviewSlot,
  onInspectFaculty,        // opens FacultySlotDetailModal
}) {
  const [filterFaculty, setFilterFaculty] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'available' | 'booked'
  const [expandedFaculty, setExpandedFaculty] = useState(null);

  const displayFaculty = useMemo(() => {
    if (filterFaculty === 'all') return facultyAvailability;
    return facultyAvailability.filter(f => f.email === filterFaculty);
  }, [facultyAvailability, filterFaculty]);

  // Build full slot matrix for all faculty
  const facultyMatrices = useMemo(() => {
    const result = {};
    facultyAvailability.forEach(fac => {
      result[fac.email] = getFacultySlotMatrix(
        fac.email, selectedExamId, weekNumber, schedule, subjects
      );
    });
    return result;
  }, [facultyAvailability, selectedExamId, weekNumber, schedule, subjects]);

  const totalSlotCount = facultyAvailability.length * 7 * STANDARD_TIME_SLOTS.length;
  const totalBooked = facultyAvailability.reduce((sum, f) => {
    const matrix = facultyMatrices[f.email];
    if (!matrix) return sum;
    return sum + matrix.reduce((s, day) => s + day.bookedCount, 0);
  }, 0);

  return (
    <div className="space-y-5">

      {/* Header KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Faculty', value: facultyAvailability.length, icon: <Users className="w-4 h-4 text-indigo-500" />, color: 'indigo' },
          { label: 'Slots Booked', value: totalBooked, icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />, color: 'emerald' },
          { label: 'Slots Available', value: totalSlotCount - totalBooked, icon: <Calendar className="w-4 h-4 text-sky-500" />, color: 'sky' },
          { label: 'Utilization', value: `${totalSlotCount > 0 ? Math.round((totalBooked / totalSlotCount) * 100) : 0}%`, icon: <Activity className="w-4 h-4 text-amber-500" />, color: 'amber' },
        ].map(stat => (
          <div key={stat.label} className={`bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs`}>
            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              {stat.icon}
              {stat.label}
            </div>
            <div className="text-2xl font-black text-slate-900">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs">
        <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Filter:</span>

        <select
          value={filterFaculty}
          onChange={e => setFilterFaculty(e.target.value)}
          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
        >
          <option value="all">All Faculty ({facultyAvailability.length})</option>
          {facultyAvailability.map(f => (
            <option key={f.email} value={f.email}>{f.name}</option>
          ))}
        </select>

        <div className="flex items-center bg-slate-100 p-0.5 rounded-xl">
          {[
            { val: 'all', label: 'All Slots' },
            { val: 'available', label: '✅ Available Only' },
            { val: 'booked', label: '🔴 Booked Only' },
          ].map(opt => (
            <button
              key={opt.val}
              onClick={() => setFilterStatus(opt.val)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                filterStatus === opt.val
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <span className="ml-auto text-[11px] text-slate-400 font-medium">
          Week {weekNumber} • Days {weekDayNumbers[0]}–{weekDayNumbers[6]}
        </span>
      </div>

      {/* Faculty Cards */}
      <div className="space-y-4">
        {displayFaculty.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-200 rounded-3xl p-10 text-center">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-500">No faculty assigned to this exam track</p>
          </div>
        ) : displayFaculty.map(fac => {
          const matrix = facultyMatrices[fac.email] || [];
          const totalFacBooked = matrix.reduce((s, d) => s + d.bookedCount, 0);
          const totalFacSlots = matrix.length * STANDARD_TIME_SLOTS.length;
          const utilPct = totalFacSlots > 0 ? Math.round((totalFacBooked / totalFacSlots) * 100) : 0;
          const isExpanded = expandedFaculty === fac.email;

          // Subjects taught by this faculty
          const facSubjects = subjects.filter(s =>
            s.examId === selectedExamId &&
            s.facultyEmail?.toLowerCase() === fac.email?.toLowerCase()
          );

          return (
            <div key={fac.email} className="bg-white border border-slate-200 rounded-3xl shadow-xs overflow-hidden">

              {/* Faculty Header */}
              <div className="p-4 sm:p-5 flex items-center justify-between gap-3 flex-wrap border-b border-slate-100">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-sm shrink-0">
                    {fac.name?.split(' ').map(n => n[0]).slice(0, 2).join('')}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-black text-slate-900 truncate">{fac.name}</div>
                    <div className="text-[11px] text-slate-500 truncate">{fac.specialty}</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {facSubjects.map(s => (
                        <span key={s.id} className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {s.code}: {s.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Utilization Bar */}
                  <div className="hidden sm:flex flex-col items-end gap-1">
                    <span className="text-[11px] font-black text-slate-600">{totalFacBooked}/{totalFacSlots} Slots Used</span>
                    <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${utilPct >= 70 ? 'bg-rose-500' : utilPct >= 40 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${utilPct}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-400">{utilPct}% utilization</span>
                  </div>

                  <button
                    onClick={() => onInspectFaculty && onInspectFaculty(fac)}
                    className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 text-[11px] font-bold hover:bg-indigo-100 transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Eye className="w-3 h-3" />
                    Inspect Full Details
                  </button>

                  <button
                    onClick={() => setExpandedFaculty(isExpanded ? null : fac.email)}
                    className="px-3 py-1.5 rounded-xl bg-slate-50 text-slate-600 border border-slate-200 text-[11px] font-bold hover:bg-slate-100 transition-all cursor-pointer flex items-center gap-1"
                  >
                    <LayoutGrid className="w-3 h-3" />
                    {isExpanded ? 'Collapse' : 'Expand Matrix'}
                  </button>
                </div>
              </div>

              {/* Compact Day Row (always visible) */}
              <div className="p-4 sm:p-5">
                <div className="grid grid-cols-7 gap-1.5">
                  {matrix.map((dayData, idx) => {
                    const bookedSlots = dayData.slots.filter(s => s.status === 'booked');
                    const emptySlots = dayData.slots.filter(s => s.status === 'empty');
                    const hasBookings = bookedSlots.length > 0;

                    return (
                      <div
                        key={dayData.dayNumber}
                        className={`rounded-xl border p-2 text-center space-y-1.5 transition-all ${
                          hasBookings
                            ? 'bg-indigo-50 border-indigo-200'
                            : 'bg-slate-50 border-dashed border-slate-200'
                        }`}
                      >
                        <div className="text-[9px] font-black text-slate-500 uppercase tracking-wider">
                          {DAY_SHORT[idx]}
                        </div>
                        <div className="text-[10px] font-black text-slate-700">
                          D{dayData.dayNumber}
                        </div>

                        {/* Slot status mini dots */}
                        <div className="flex flex-col gap-0.5 items-center">
                          {dayData.slots.map(slotData => {
                            let dotColor = 'bg-slate-200';
                            let statusLabel = 'Off-Duty / Unset';
                            if (slotData.status === 'booked') {
                              dotColor = 'bg-indigo-500';
                              statusLabel = slotData.session?.dayTitle || 'Booked';
                            } else if (slotData.isDeclaredAvailable) {
                              dotColor = 'bg-emerald-400';
                              statusLabel = 'Clinician Declared Available';
                            }

                            return (
                              <div
                                key={slotData.slotInfo.id}
                                title={`${slotData.slotInfo.label}: ${statusLabel}`}
                                className={`w-full h-1 rounded-full ${dotColor}`}
                              />
                            );
                          })}
                        </div>

                        <div className="text-[9px] font-bold">
                          <span className={hasBookings ? 'text-indigo-600' : 'text-slate-400'}>
                            {bookedSlots.length}B
                          </span>
                          <span className="text-slate-300 mx-0.5">/</span>
                          <span className="text-emerald-600 font-black">
                            {dayData.slots.filter(s => s.isDeclaredAvailable && s.status !== 'booked').length}A
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center gap-4 mt-2 text-[10px] font-medium text-slate-400 flex-wrap">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-1 bg-indigo-500 rounded-full inline-block"/> Booked (B)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-1 bg-emerald-400 rounded-full inline-block"/> Declared Available (A)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-1 bg-slate-200 rounded-full inline-block"/> Off-Duty / Unset
                  </span>
                </div>
              </div>

              {/* Expanded Full Matrix */}
              {isExpanded && (
                <div className="border-t border-slate-100 overflow-x-auto">
                  <div className="p-4 sm:p-5 min-w-[700px]">
                    <h4 className="text-xs font-black text-slate-800 mb-3 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-indigo-500" />
                      Full Slot Matrix — {fac.name} — Week {weekNumber}
                    </h4>

                    {/* Column headers: Days */}
                    <div className="grid gap-2" style={{ gridTemplateColumns: `120px repeat(7, 1fr)` }}>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-end pb-1">Time Slot</div>
                      {matrix.map((dayData, idx) => (
                        <div key={dayData.dayNumber} className="text-center">
                          <div className="text-[10px] font-black text-slate-500 uppercase">{DAY_SHORT[idx]}</div>
                          <div className={`text-xs font-black ${dayData.bookedCount > 0 ? 'text-indigo-700' : 'text-slate-400'}`}>
                            Day {dayData.dayNumber}
                          </div>
                          <div className="text-[9px] text-slate-400 font-medium">
                            {dayData.bookedCount}B · {dayData.emptyCount}F
                          </div>
                        </div>
                      ))}

                      {/* Row for each standard slot */}
                      {STANDARD_TIME_SLOTS.map((stdSlot, slotIdx) => {
                        if (filterStatus === 'booked') {
                          // Only show this row if there is at least one booked cell
                          const anyBooked = matrix.some(d => d.slots[slotIdx]?.status === 'booked');
                          if (!anyBooked) return null;
                        }
                        if (filterStatus === 'available') {
                          const anyEmpty = matrix.some(d => d.slots[slotIdx]?.status === 'empty');
                          if (!anyEmpty) return null;
                        }

                        return (
                          <React.Fragment key={stdSlot.id}>
                            {/* Slot label */}
                            <div className={`p-2 rounded-xl border text-center ${stdSlot.bgClass} ${stdSlot.borderClass}`}>
                              <div className="text-[9px] font-black text-slate-600">{stdSlot.icon} {stdSlot.label}</div>
                              <div className="text-[8px] text-slate-500 font-medium mt-0.5 leading-tight">{stdSlot.timeRange}</div>
                            </div>

                            {/* Cells for each day */}
                            {matrix.map((dayData, dayIdx) => {
                              const cellSlot = dayData.slots[slotIdx];
                              const isBooked = cellSlot?.status === 'booked';
                              const session = cellSlot?.session;

                              if (filterStatus === 'available' && isBooked) {
                                return <div key={dayData.dayNumber} className="p-1 rounded-xl bg-slate-50 border border-dashed border-slate-100 flex items-center justify-center">
                                  <span className="text-[8px] text-slate-300 font-bold">—</span>
                                </div>;
                              }
                              if (filterStatus === 'booked' && !isBooked) {
                                return <div key={dayData.dayNumber} className="p-1 rounded-xl bg-slate-50 border border-dashed border-slate-100 flex items-center justify-center">
                                  <span className="text-[8px] text-slate-300 font-bold">—</span>
                                </div>;
                              }

                              if (isBooked && session) {
                                const subj = subjects.find(s => s.id === session.subjectId);
                                const colorInfo = SUBJECT_COLOR_MAP[session.subjectColor || subj?.color] || SUBJECT_COLOR_MAP.rose;
                                return (
                                  <div
                                    key={dayData.dayNumber}
                                    className={`p-2 rounded-xl border space-y-1 ${colorInfo.bg} ${colorInfo.border} group relative`}
                                  >
                                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded text-white inline-block ${colorInfo.tag}`}>
                                      {session.subjectCode || subj?.code || 'SUB'}
                                    </span>
                                    <p className="text-[9px] font-bold text-slate-800 leading-tight line-clamp-2">
                                      {session.dayTitle?.replace(/^Day \d+ [\u2014-] ?/, '') || 'Lecture'}
                                    </p>
                                    <div className="flex items-center gap-1 text-[8px] text-slate-500 flex-wrap">
                                      {session.hasLive && <span className="text-red-500 font-bold">🔴 Live</span>}
                                      {session.hasTest && <span className="text-amber-600 font-bold">📝 CBT</span>}
                                      <span>{session.estimatedTime || '1.5h'}</span>
                                    </div>
                                    {/* Hover Actions */}
                                    <div className="absolute top-1 right-1 hidden group-hover:flex items-center gap-0.5 bg-white/90 rounded-lg p-0.5 border border-slate-200 shadow-sm">
                                      <button onClick={() => onEditSlot && onEditSlot(session)} title="Edit" className="p-0.5 rounded hover:bg-slate-100 cursor-pointer">
                                        <Edit3 className="w-2.5 h-2.5 text-slate-500" />
                                      </button>
                                      <button onClick={() => onPreviewSlot && onPreviewSlot(session)} title="Preview" className="p-0.5 rounded hover:bg-slate-100 cursor-pointer">
                                        <Eye className="w-2.5 h-2.5 text-slate-500" />
                                      </button>
                                      <button onClick={() => onDeleteSlot && onDeleteSlot(session)} title="Delete" className="p-0.5 rounded hover:bg-red-50 cursor-pointer">
                                        <Trash2 className="w-2.5 h-2.5 text-rose-500" />
                                      </button>
                                    </div>
                                  </div>
                                );
                              }

                              // Empty slot: check if declared available
                              const isDeclared = cellSlot?.isDeclaredAvailable;
                              return (
                                <div
                                  key={dayData.dayNumber}
                                  className={`p-2 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1 min-h-[60px] cursor-pointer group ${
                                    isDeclared
                                      ? 'border-emerald-200 bg-emerald-50/50 hover:border-emerald-500 hover:bg-emerald-100/60'
                                      : 'border-dashed border-slate-200 bg-slate-50/40 hover:border-slate-300 hover:bg-slate-100/50'
                                  }`}
                                  onClick={() => onOpenModal && onOpenModal(
                                    null,
                                    dayData.dayNumber,
                                    facSubjects[0]?.id || null,
                                    stdSlot.timeRange,
                                    fac.email
                                  )}
                                >
                                  {isDeclared ? (
                                    <span className="text-[8px] font-black text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 rounded">
                                      ✓ Available
                                    </span>
                                  ) : (
                                    <span className="text-[8px] font-medium text-slate-400">
                                      Off-Duty
                                    </span>
                                  )}
                                  <div className="opacity-0 group-hover:opacity-100 transition-all flex items-center gap-0.5 text-[8px] font-bold text-indigo-600">
                                    <Plus className="w-2.5 h-2.5" />
                                    <span>Assign</span>
                                  </div>
                                </div>
                              );
                            })}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
