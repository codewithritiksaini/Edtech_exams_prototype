import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Sliders,
  CalendarX,
  CalendarCheck,
  Check,
  Copy,
  ChevronRight,
  ShieldCheck,
  UserCheck,
  Sparkles,
  Info
} from 'lucide-react';
import { peopleService } from '../../services/peopleService';
import { facultyAvailabilityService, WEEKDAYS } from '../../services/facultyAvailabilityService';
import { STANDARD_TIME_SLOTS } from '../../utils/scheduleSlotUtils';

export default function FacultyAvailabilityPage() {
  // Scope Protection: strictly lock to authenticated faculty profile
  const currentFaculty = peopleService.getCurrentFacultyProfile();
  const facultyEmail = currentFaculty?.email || 'faculty@demo.com';

  const [availabilityProfile, setAvailabilityProfile] = useState(() =>
    facultyAvailabilityService.getAvailabilityForFaculty(facultyEmail)
  );

  const [activeWeekday, setActiveWeekday] = useState('Monday');
  const [saveToast, setSaveToast] = useState(null);

  // Exception Form State
  const [isExceptionModalOpen, setIsExceptionModalOpen] = useState(false);
  const [exceptionDate, setExceptionDate] = useState('');
  const [exceptionType, setExceptionType] = useState('UNAVAILABLE');
  const [exceptionReason, setExceptionReason] = useState('');
  const [exceptionSlots, setExceptionSlots] = useState(['slot-morning']);

  // Synchronize with storage updates
  useEffect(() => {
    const unsub = facultyAvailabilityService.subscribe(() => {
      setAvailabilityProfile(facultyAvailabilityService.getAvailabilityForFaculty(facultyEmail));
    });
    return () => unsub();
  }, [facultyEmail]);

  const triggerToast = (msg, type = 'success') => {
    setSaveToast({ message: msg, type });
    setTimeout(() => setSaveToast(null), 3000);
  };

  // ---------------------------------------------------------------------------
  // Handlers: Weekly Slot Declaration
  // ---------------------------------------------------------------------------
  const handleToggleSlot = (slotId) => {
    const updated = facultyAvailabilityService.toggleSlot(facultyEmail, activeWeekday, slotId);
    setAvailabilityProfile(updated);
    triggerToast(`Updated ${activeWeekday} availability.`);
  };

  const handleSetDayAll = (isAvailable) => {
    const updated = facultyAvailabilityService.setDayAvailability(facultyEmail, activeWeekday, isAvailable);
    setAvailabilityProfile(updated);
    triggerToast(`Marked ${activeWeekday} as ${isAvailable ? 'available' : 'unavailable'}.`);
  };

  const handleApplyToAllWeekdays = () => {
    const currentSlots = availabilityProfile?.declaredWeeklySlots?.[activeWeekday] || [];
    const newWeekly = { ...availabilityProfile?.declaredWeeklySlots };
    ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].forEach(day => {
      newWeekly[day] = [...currentSlots];
    });

    const updated = facultyAvailabilityService.setAvailabilityForFaculty(facultyEmail, newWeekly, {
      preferredNoticeDays: availabilityProfile?.preferredNoticeDays,
      maxDailySlots: availabilityProfile?.maxDailySlots,
      dateExceptions: availabilityProfile?.dateExceptions
    });
    setAvailabilityProfile(updated);
    triggerToast(`Applied ${activeWeekday}'s availability pattern to all Mon–Fri weekdays!`);
  };

  // ---------------------------------------------------------------------------
  // Handlers: Teaching Preferences
  // ---------------------------------------------------------------------------
  const handlePreferenceChange = (field, value) => {
    const updated = facultyAvailabilityService.setAvailabilityForFaculty(
      facultyEmail,
      availabilityProfile?.declaredWeeklySlots,
      {
        preferredNoticeDays: field === 'notice' ? Number(value) : availabilityProfile?.preferredNoticeDays,
        maxDailySlots: field === 'maxDaily' ? Number(value) : availabilityProfile?.maxDailySlots,
        dateExceptions: availabilityProfile?.dateExceptions
      }
    );
    setAvailabilityProfile(updated);
    triggerToast('Teaching preferences saved.');
  };

  // ---------------------------------------------------------------------------
  // Handlers: Date Exceptions
  // ---------------------------------------------------------------------------
  const handleCreateException = (e) => {
    e.preventDefault();
    if (!exceptionDate) {
      alert('Please choose a date for the exception.');
      return;
    }

    const updated = facultyAvailabilityService.addDateException(facultyEmail, {
      date: exceptionDate,
      type: exceptionType,
      reason: exceptionReason.trim(),
      slots: exceptionType === 'OVERRIDE' ? exceptionSlots : []
    });

    setAvailabilityProfile(updated);
    setIsExceptionModalOpen(false);
    setExceptionDate('');
    setExceptionReason('');
    setExceptionSlots(['slot-morning']);
    triggerToast(`Date exception added for ${exceptionDate}.`);
  };

  const handleDeleteException = (excId) => {
    const updated = facultyAvailabilityService.removeDateException(facultyEmail, excId);
    setAvailabilityProfile(updated);
    triggerToast('Date exception removed.');
  };

  // Metrics
  const weeklySlotCount = useMemo(() => {
    if (!availabilityProfile?.declaredWeeklySlots) return 0;
    return Object.values(availabilityProfile.declaredWeeklySlots).reduce(
      (sum, slots) => sum + (slots?.length || 0),
      0
    );
  }, [availabilityProfile]);

  const activeDaySlots = availabilityProfile?.declaredWeeklySlots?.[activeWeekday] || [];
  const dateExceptions = availabilityProfile?.dateExceptions || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Toast Notification */}
      {saveToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-900 text-white shadow-xl border border-slate-700 animate-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{saveToast.message}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Faculty Availability Control
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
              {currentFaculty?.name || 'Dr. Siddharth V.'} ({facultyEmail})
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            My Teaching Availability
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Declare recurring weekly teaching windows and date-specific exceptions. Admin scheduling validates against your declared availability in real time to prevent conflicts.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <Link
            to="/faculty/schedule"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
          >
            <Calendar className="w-4 h-4 text-slate-500" />
            <span>View My Assigned Schedule</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-indigo-500" />
            Weekly Available Slots
          </span>
          <div className="text-2xl font-black text-slate-900">
            {weeklySlotCount} <span className="text-xs text-slate-400 font-normal">/ 42 windows</span>
          </div>
          <div className="text-[11px] text-slate-500">
            Across 7 days a week
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <CalendarCheck className="w-3.5 h-3.5 text-emerald-500" />
            Active Day ({activeWeekday})
          </span>
          <div className="text-2xl font-black text-emerald-700">
            {activeDaySlots.length} <span className="text-xs text-slate-400 font-normal">/ 6 windows</span>
          </div>
          <div className="text-[11px] text-emerald-600 font-medium">
            {activeDaySlots.length > 0 ? 'Accepting bookings' : 'Marked unavailable'}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <CalendarX className="w-3.5 h-3.5 text-rose-500" />
            Date Exceptions
          </span>
          <div className="text-2xl font-black text-slate-900">
            {dateExceptions.length}
          </div>
          <div className="text-[11px] text-slate-500">
            Blackouts & custom overrides
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-amber-500" />
            Notice Period
          </span>
          <div className="text-2xl font-black text-slate-900">
            {availabilityProfile?.preferredNoticeDays || 2} Days
          </div>
          <div className="text-[11px] text-slate-500">
            Max {availabilityProfile?.maxDailySlots || 3} sessions / day
          </div>
        </div>
      </div>

      {/* Main Grid: Weekly Availability + Preferences & Exceptions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 cols): Weekly Matrix */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <span>Weekly Teaching Schedule</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-100">
                    Recurring Rule
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Select a day to configure standard clinical teaching windows.
                </p>
              </div>

              {/* Day Quick Actions */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleApplyToAllWeekdays}
                  title="Copy this day's pattern to Monday through Friday"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition-all"
                >
                  <Copy className="w-3 h-3 text-slate-500" />
                  <span>Copy to Mon–Fri</span>
                </button>
              </div>
            </div>

            {/* Weekday Selector Pills */}
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {WEEKDAYS.map(day => {
                const isSelected = activeWeekday === day;
                const count = availabilityProfile?.declaredWeeklySlots?.[day]?.length || 0;
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setActiveWeekday(day)}
                    className={`p-3 rounded-2xl text-center border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                        : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-[11px] font-bold uppercase tracking-wider">
                      {day.slice(0, 3)}
                    </div>
                    <div className={`text-xs font-black mt-1 ${isSelected ? 'text-emerald-400' : count > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {count} slots
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Day Header Actions */}
            <div className="flex items-center justify-between bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
              <div className="text-xs font-bold text-slate-800">
                Configuring <span className="text-emerald-700 font-black">{activeWeekday}</span> ({activeDaySlots.length} of 6 slots active)
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSetDayAll(true)}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:text-emerald-700 hover:border-emerald-300 transition-colors cursor-pointer"
                >
                  Enable All
                </button>
                <button
                  type="button"
                  onClick={() => handleSetDayAll(false)}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:text-rose-700 hover:border-rose-300 transition-colors cursor-pointer"
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* 6 Standard Clinical Windows */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {STANDARD_TIME_SLOTS.map(stdSlot => {
                const isDeclared = activeDaySlots.includes(stdSlot.id);

                return (
                  <div
                    key={stdSlot.id}
                    onClick={() => handleToggleSlot(stdSlot.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer select-none flex items-center justify-between gap-3 ${
                      isDeclared
                        ? 'bg-emerald-50/60 border-emerald-300 shadow-2xs'
                        : 'bg-slate-50/40 border-slate-200 opacity-60 hover:opacity-90 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl shrink-0">{stdSlot.icon}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-black ${isDeclared ? 'text-slate-900' : 'text-slate-600'}`}>
                            {stdSlot.label} Window
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isDeclared ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                          }`}>
                            {isDeclared ? 'Available' : 'Unavailable'}
                          </span>
                        </div>
                        <div className="text-[11px] font-medium text-slate-500 mt-0.5">
                          {stdSlot.timeRange}
                        </div>
                      </div>
                    </div>

                    <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                      isDeclared ? 'bg-emerald-600 text-white' : 'border-2 border-slate-300 text-transparent'
                    }`}>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (1 col): Date Exceptions & Preferences */}
        <div className="space-y-6">
          
          {/* Preferences Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-600" />
              <span>Teaching Preferences</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Preferred Notice Period
                </label>
                <select
                  value={availabilityProfile?.preferredNoticeDays || 2}
                  onChange={(e) => handlePreferenceChange('notice', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value={1}>1 Day (24 hours notice)</option>
                  <option value={2}>2 Days (48 hours notice)</option>
                  <option value={3}>3 Days notice</option>
                  <option value={5}>5 Days notice</option>
                  <option value={7}>1 Week notice</option>
                </select>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Prevents last-minute bookings from Admin
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Maximum Daily Sessions
                </label>
                <select
                  value={availabilityProfile?.maxDailySlots || 3}
                  onChange={(e) => handlePreferenceChange('maxDaily', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value={1}>1 Session per day</option>
                  <option value={2}>2 Sessions per day</option>
                  <option value={3}>3 Sessions per day (Standard)</option>
                  <option value={4}>4 Sessions per day</option>
                </select>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Helps balance clinical duties with teaching
                </span>
              </div>
            </div>
          </div>

          {/* Date Exceptions Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <CalendarX className="w-4 h-4 text-rose-500" />
                  <span>Date Exceptions</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Blackouts for conferences, leaves, or custom overrides
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsExceptionModalOpen(true)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Date</span>
              </button>
            </div>

            {/* List of Exceptions */}
            {dateExceptions.length === 0 ? (
              <div className="p-6 text-center rounded-2xl bg-slate-50 border border-slate-200 text-slate-400 text-xs space-y-1">
                <CalendarCheck className="w-8 h-8 text-slate-300 mx-auto mb-1" />
                <p className="font-bold text-slate-600">No active date exceptions</p>
                <p className="text-[11px]">Your recurring weekly schedule is active for all calendar dates.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {dateExceptions.map(exc => (
                  <div
                    key={exc.id}
                    className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-slate-900">
                          {exc.date}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          exc.type === 'UNAVAILABLE'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : 'bg-sky-100 text-sky-800 border border-sky-200'
                        }`}>
                          {exc.type}
                        </span>
                      </div>
                      {exc.reason && (
                        <p className="text-slate-600 text-[11px] italic">
                          "{exc.reason}"
                        </p>
                      )}
                      {exc.type === 'OVERRIDE' && exc.slots?.length > 0 && (
                        <div className="text-[10px] text-slate-500">
                          Allowed: {exc.slots.join(', ')}
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteException(exc.id)}
                      title="Remove Exception"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-white transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Date Exception Modal */}
      {isExceptionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                  <CalendarX className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Add Date Exception</h3>
                  <p className="text-xs text-slate-500">Blackout or custom window</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsExceptionModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateException} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Target Date *
                </label>
                <input
                  type="date"
                  required
                  value={exceptionDate}
                  onChange={(e) => setExceptionDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Exception Type *
                </label>
                <select
                  value={exceptionType}
                  onChange={(e) => setExceptionType(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="UNAVAILABLE">Unavailable All Day (Blackout / Leave)</option>
                  <option value="OVERRIDE">Available with Custom Time Slots</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Reason / Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. AIIMS Annual Cardiology Conference"
                  value={exceptionReason}
                  onChange={(e) => setExceptionReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsExceptionModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold cursor-pointer transition-all"
                >
                  Save Exception
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
