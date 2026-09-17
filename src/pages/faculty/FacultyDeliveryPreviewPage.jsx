import React, { useMemo, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Eye, 
  ShieldAlert, 
  AlertTriangle, 
  Calendar, 
  BookOpen, 
  CheckCircle2, 
  Lock,
  Layers,
  Sparkles
} from 'lucide-react';
import { authService } from '../../services/authService';
import { peopleService } from '../../services/peopleService';
import { curriculumService } from '../../services/curriculumService';
import DayContentView from '../DayContentView';

/**
 * FacultyDeliveryPreviewPage
 * 
 * Secure, read-only Faculty Preview route:
 * /faculty/preview/delivery/:deliveryDayId
 * 
 * Enforces role authentication, scope validation, and passes canonical
 * slot information to DayContentView in faculty-preview mode.
 */
export default function FacultyDeliveryPreviewPage() {
  const { deliveryDayId } = useParams();
  const navigate = useNavigate();

  const currentUser = authService.getCurrentUser();
  const facultyProfile = peopleService.getCurrentFacultyProfile();

  // Role & Authentication Enforcement
  useEffect(() => {
    if (!currentUser) {
      navigate(`/faculty/login?redirect=${encodeURIComponent(window.location.pathname)}`, { replace: true });
      return;
    }

    // If an active student attempts to enter faculty preview, redirect to student dashboard
    if (currentUser.role === 'student') {
      navigate('/student/dashboard', { replace: true });
    }
  }, [currentUser, navigate]);

  // Canonical Slot Resolution
  const slot = useMemo(() => {
    if (!deliveryDayId) return null;
    return curriculumService.getDeliverySlotById(deliveryDayId);
  }, [deliveryDayId]);

  // Scope Authorization Check
  const isAuthorized = useMemo(() => {
    if (!slot || !currentUser) return false;

    // Admin has global authority
    if (currentUser.role === 'admin' || currentUser.email?.toLowerCase() === 'admin@demo.com') {
      return true;
    }

    const facultyEmail = (facultyProfile?.email || currentUser.email || '').toLowerCase();

    // 1. Slot is explicitly assigned to this faculty member
    if (slot.facultyEmail && slot.facultyEmail.toLowerCase() === facultyEmail) {
      return true;
    }

    // 2. Slot is in the schedule for this faculty member
    const facultySlots = curriculumService.getFacultySchedule(facultyEmail);
    if (facultySlots.some(s => s.id === slot.id)) {
      return true;
    }

    // 3. Faculty's assigned subjects cover this slot's subject
    if (facultyProfile?.assignedSubjects && Array.isArray(facultyProfile.assignedSubjects)) {
      const slotSubject = slot.subjectName || slot.subject || '';
      const match = facultyProfile.assignedSubjects.some(sub => 
        sub === slotSubject || 
        sub === slot.subjectId || 
        (slotSubject && sub.toLowerCase() === slotSubject.toLowerCase())
      );
      if (match) return true;
    }

    return false;
  }, [slot, currentUser, facultyProfile]);

  // Unauthenticated fallback
  if (!currentUser || currentUser.role === 'student') {
    return null;
  }

  // Error State 1: Slot Not Found
  if (!slot) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-800/90 rounded-3xl border border-slate-700/80 p-8 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-black text-white tracking-tight">
              Delivery Day Not Found
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              This delivery slot could not be found or has been removed from the curriculum schedule.
            </p>
            <p className="text-[11px] font-mono text-slate-500 pt-1">
              Identifier: {deliveryDayId || 'None'}
            </p>
          </div>

          <div className="pt-2">
            <Link
              to="/faculty/schedule"
              className="inline-flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-lg shadow-indigo-600/30 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Schedule</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Error State 2: Out of Scope / Access Restricted
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-800/90 rounded-3xl border border-slate-700/80 p-8 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-black text-white tracking-tight">
              Access Restricted
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              This delivery slot is outside your assigned teaching scope.
            </p>
            <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-700/60 text-left space-y-1 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span>Slot:</span>
                <span className="font-semibold text-slate-200">{slot.dayTitle || slot.title}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Subject:</span>
                <span className="font-semibold text-slate-200">{slot.subjectName || slot.subject}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Day Number:</span>
                <span className="font-semibold text-slate-200">Day {slot.dayNumber}</span>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Link
              to="/faculty/schedule"
              className="inline-flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to My Schedule</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Authorized Preview Experience
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      
      {/* ========================================================================= */}
      {/* Persistent Faculty Preview Banner (Always Visible)                        */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-50 bg-slate-900 text-white border-b border-indigo-900/60 shadow-md backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Left: Preview Mode Identity & Read-Only Notice */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 font-bold text-[11px] tracking-wide uppercase">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              <Eye className="w-3.5 h-3.5" />
              <span>Faculty Preview</span>
            </div>

            <div className="h-4 w-px bg-slate-700 hidden sm:block" />

            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-200">
                  Student-facing view • Read-only
                </span>
                <span className="text-[10px] px-2 py-0.2 rounded-full bg-slate-800 text-slate-400 border border-slate-700 hidden md:inline-block">
                  Slot ID: {slot.id}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Progress and activity are not recorded. All scheduled resources are unlocked for review.
              </p>
            </div>
          </div>

          {/* Right: Slot Context Meta & Back Action */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden lg:flex items-center gap-2 text-xs text-slate-300 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
              <span className="font-bold text-indigo-400">Day {slot.dayNumber}</span>
              <span>•</span>
              <span className="truncate max-w-[160px] font-medium">{slot.subjectName || slot.subject}</span>
              <span>•</span>
              <span className="text-[11px] text-slate-400">{slot.examId?.toUpperCase() || 'EXAM'}</span>
            </div>

            <Link
              to="/faculty/schedule"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Schedule</span>
            </Link>
          </div>

        </div>
      </header>

      {/* ========================================================================= */}
      {/* Embedded Student Delivery View (Configured in Faculty-Preview Mode)       */}
      {/* ========================================================================= */}
      <div className="flex-1">
        <DayContentView
          mode="faculty-preview"
          previewSlot={slot}
          onBackToSchedule={() => navigate('/faculty/schedule')}
        />
      </div>

    </div>
  );
}
