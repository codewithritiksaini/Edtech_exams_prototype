import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import LiveSessionModal from '../../components/LiveSessionModal';
import TestDetailsModal from '../../components/student/dashboard/TestDetailsModal';
import DashboardHero from '../../components/student/dashboard/DashboardHero';
import ContinueLearningCard from '../../components/student/dashboard/ContinueLearningCard';
import NextLiveSessionCard from '../../components/student/dashboard/NextLiveSessionCard';
import AssessmentCard from '../../components/student/dashboard/AssessmentCard';
import WeekPaceCard from '../../components/student/dashboard/WeekPaceCard';
import TodayProgress from '../../components/student/dashboard/TodayProgress';
import TodaySchedule from '../../components/student/dashboard/TodaySchedule';
import UpNextTimeline from '../../components/student/dashboard/UpNextTimeline';
import ExploreProgram from '../../components/student/dashboard/ExploreProgram';

import { dashboardUserData } from '../../data/mockData';
import { curriculumService } from '../../services/curriculumService';
import { catalogService } from '../../services/catalogService';
import { 
  learningProgressService, 
  RESOURCE_TITLES 
} from '../../services/learningProgressService';
import { 
  liveSessionsService, 
  SESSION_STATUS, 
  getLiveSessionStatus, 
  toggleSessionReminder, 
  isReminderSet,
  getSessionTimes 
} from '../../services/liveSessionsService';
import { 
  cbtTestService, 
  CBT_STATUS, 
  getTestStatus,
  getTestTimes 
} from '../../services/cbtTestService';

export default function StudentDashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  // 1. Enrollment Context
  const enrolledExamId = dashboardUserData.examCategory || 'neet-pg';
  const enrolledExamObj = catalogService.getExamById(enrolledExamId);
  const enrolledCourse = enrolledExamObj?.name || dashboardUserData.enrolledCourse || 'NEET PG & NExT 2026';
  const enrolledPlan = searchParams.get('plan') || dashboardUserData.packageTier || 'Standard Package (6 Months)';
  const completedDayParam = searchParams.get('completedDay');

  // Completion toast notification
  const [completionBanner, setCompletionBanner] = useState('');
  useEffect(() => {
    if (completedDayParam) {
      const dayNum = parseInt(completedDayParam, 10);
      setCompletionBanner(`🎉 Outstanding work! Day ${dayNum} clinical module has been marked as Completed.`);
      const timer = setTimeout(() => setCompletionBanner(''), 6500);
      return () => clearTimeout(timer);
    }
  }, [completedDayParam]);

  // 2. Real-Time Reactive Clock (5-second interval for countdowns & live/test status switches)
  const [currentTime, setCurrentTime] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // 3. Learning Progress Service Integration
  const [highestUnlockedDay, setHighestUnlockedDay] = useState(() => 
    learningProgressService.getHighestUnlockedDay()
  );
  const [completedDaysList, setCompletedDaysList] = useState(() => 
    learningProgressService.getCompletedDays()
  );

  useEffect(() => {
    const unsubProgress = learningProgressService.subscribe(() => {
      setHighestUnlockedDay(learningProgressService.getHighestUnlockedDay());
      setCompletedDaysList(learningProgressService.getCompletedDays());
    });
    const unsubLectures = learningProgressService.subscribeLectures(() => {
      setHighestUnlockedDay(learningProgressService.getHighestUnlockedDay());
      setCompletedDaysList(learningProgressService.getCompletedDays());
    });
    return () => {
      unsubProgress();
      unsubLectures();
    };
  }, []);

  // Current Day Resolved Content & Sequence
  const currentDayData = useMemo(() => {
    return curriculumService.getDayResolvedContent(highestUnlockedDay, enrolledExamId);
  }, [highestUnlockedDay, enrolledExamId]);

  const mandatorySequence = useMemo(() => {
    return learningProgressService.getMandatorySequence(currentDayData);
  }, [currentDayData]);

  const completedResourcesCount = useMemo(() => {
    if (!currentDayData || mandatorySequence.length === 0) return 0;
    return mandatorySequence.filter(key => 
      learningProgressService.isResourceCompleted(highestUnlockedDay, key, currentDayData)
    ).length;
  }, [highestUnlockedDay, currentDayData, mandatorySequence, completedDaysList]);

  const totalMandatoryCount = mandatorySequence.length || 4;
  const isCurrentDayDone = useMemo(() => {
    return learningProgressService.isDayCompleted(highestUnlockedDay, currentDayData);
  }, [highestUnlockedDay, currentDayData, completedDaysList]);

  const dayProgressPct = totalMandatoryCount > 0 
    ? Math.round((completedResourcesCount / totalMandatoryCount) * 100) 
    : 0;

  const currentResourceKey = useMemo(() => {
    return learningProgressService.getCurrentActiveResource(highestUnlockedDay, currentDayData);
  }, [highestUnlockedDay, currentDayData, completedDaysList]);

  const currentResourceTitle = RESOURCE_TITLES[currentResourceKey] || 'Video Lecture';

  // 4. Live Sessions Service Integration
  const [sessions, setSessions] = useState(() => liveSessionsService.getAllSessions());
  const [reminderVersion, setReminderVersion] = useState(0);
  const [selectedLiveSession, setSelectedLiveSession] = useState(null);

  useEffect(() => {
    const unsub = liveSessionsService.subscribe((updated) => {
      setSessions([...updated]);
    });
    const handleReminders = () => setReminderVersion(v => v + 1);
    window.addEventListener('medprep-live-reminders-updated', handleReminders);
    return () => {
      unsub();
      window.removeEventListener('medprep-live-reminders-updated', handleReminders);
    };
  }, []);

  // Filter sessions strictly for enrolled exam
  const enrolledSessions = useMemo(() => {
    return sessions.filter(s => !s.examId || s.examId === enrolledExamId);
  }, [sessions, enrolledExamId]);

  // Featured Next Live Session (Priority: Live Now -> Next Upcoming -> null)
  const nextLiveSession = useMemo(() => {
    if (!enrolledSessions || enrolledSessions.length === 0) return null;

    // 1. Live Now
    const liveNow = enrolledSessions.find(s => getLiveSessionStatus(s, currentTime) === SESSION_STATUS.LIVE);
    if (liveNow) return liveNow;

    // 2. Nearest Upcoming session
    const upcoming = enrolledSessions
      .filter(s => getLiveSessionStatus(s, currentTime) === SESSION_STATUS.UPCOMING)
      .sort((a, b) => getSessionTimes(a).startTime.getTime() - getSessionTimes(b).startTime.getTime());

    // Prefer upcoming session linked to current week / study day
    const linkedToCurrentDay = upcoming.find(s => s.studyPlan?.dayNumber === highestUnlockedDay);
    if (linkedToCurrentDay) return linkedToCurrentDay;

    return upcoming[0] || null;
  }, [enrolledSessions, currentTime, highestUnlockedDay]);

  const isNextLiveReminderSet = useMemo(() => {
    if (!nextLiveSession) return false;
    return isReminderSet(nextLiveSession.id);
  }, [nextLiveSession, reminderVersion]);

  // 5. CBT Test Service Integration
  const [testsList, setTestsList] = useState(() => cbtTestService.getAllTests(enrolledExamId));
  const [selectedTestForDetails, setSelectedTestForDetails] = useState(null);

  useEffect(() => {
    const unsubTests = cbtTestService.subscribe(() => {
      setTestsList(cbtTestService.getAllTests(enrolledExamId));
    });
    const handleTestsEvent = () => setTestsList(cbtTestService.getAllTests(enrolledExamId));
    window.addEventListener('medprep-tests-updated', handleTestsEvent);
    return () => {
      unsubTests();
      window.removeEventListener('medprep-tests-updated', handleTestsEvent);
    };
  }, [enrolledExamId]);

  // Filter tests strictly for enrolled exam track
  const enrolledTests = useMemo(() => {
    return testsList.filter(t => !t.examTrack || t.examTrack === enrolledExamId || t.courseId === enrolledExamId);
  }, [testsList, enrolledExamId]);

  // Featured Test Selection (Priority: Active Attempt -> Available Now -> Nearest Upcoming -> Completed -> Expired)
  const featuredTest = useMemo(() => {
    if (!enrolledTests || enrolledTests.length === 0) return null;

    // 1. In progress or paused attempt
    const inProgress = enrolledTests.find(t => {
      const st = getTestStatus(t, currentTime);
      return st === CBT_STATUS.IN_PROGRESS || st === CBT_STATUS.PAUSED;
    });
    if (inProgress) return inProgress;

    // 2. Available now
    const available = enrolledTests.find(t => getTestStatus(t, currentTime) === CBT_STATUS.AVAILABLE);
    if (available) return available;

    // 3. Nearest upcoming test
    const upcoming = enrolledTests
      .filter(t => getTestStatus(t, currentTime) === CBT_STATUS.UPCOMING)
      .sort((a, b) => getTestTimes(a).startTime.getTime() - getTestTimes(b).startTime.getTime());
    if (upcoming.length > 0) return upcoming[0];

    // 4. Completed test
    const completed = enrolledTests.find(t => getTestStatus(t, currentTime) === CBT_STATUS.SUBMITTED);
    if (completed) return completed;

    // 5. Fallback
    return enrolledTests[0] || null;
  }, [enrolledTests, currentTime]);

  // 6. Week Pace Tracking
  const weekNumber = useMemo(() => {
    if (highestUnlockedDay <= 7) return 1;
    if (highestUnlockedDay <= 14) return 2;
    if (highestUnlockedDay <= 21) return 3;
    return 4;
  }, [highestUnlockedDay]);

  const weekDayOffset = (weekNumber - 1) * 7;
  const completedIndicesThisWeek = useMemo(() => {
    const indices = [];
    for (let i = 0; i < 7; i++) {
      const dNum = weekDayOffset + i + 1;
      if (completedDaysList.includes(dNum)) {
        indices.push(i);
      }
    }
    return indices;
  }, [completedDaysList, weekDayOffset]);

  const activeDayIndexInWeek = Math.min(6, Math.max(0, highestUnlockedDay - weekDayOffset - 1));

  // 7. Today's Schedule Items (Derived from actual Day Content resources)
  const todayScheduleItems = useMemo(() => {
    const timeSlots = ['09:30 AM', '11:00 AM', '02:00 PM', '04:30 PM', '06:00 PM'];
    
    return mandatorySequence.map((key, idx) => {
      const isDone = learningProgressService.isResourceCompleted(highestUnlockedDay, key, currentDayData);
      const isCurrent = !isDone && key === currentResourceKey;

      let desc = 'Required clinical module';
      if (key === 'video') desc = currentDayData?.video?.duration ? `${currentDayData.video.duration} clinical video lecture` : 'Clinical video masterclass';
      else if (key === 'notes') desc = currentDayData?.pdf?.pages ? `${currentDayData.pdf.pages} page high-yield notes` : 'Clinical PDF guidebook';
      else if (key === 'images') desc = Array.isArray(currentDayData?.images) ? `${currentDayData.images.length} diagnostic charts & ECGs` : 'Diagnostic image drills';
      else if (key === 'flashcards') desc = Array.isArray(currentDayData?.flashcards) ? `${currentDayData.flashcards.length} active recall cards` : 'Spaced repetition cards';
      else if (key === 'test') desc = 'End-of-day checkpoint quiz';

      return {
        id: `res-${key}`,
        key,
        title: RESOURCE_TITLES[key] || key,
        subtitle: desc,
        timeSlot: timeSlots[idx] || '03:00 PM',
        status: isDone ? 'COMPLETED' : isCurrent ? 'CURRENT' : 'UPCOMING'
      };
    });
  }, [mandatorySequence, highestUnlockedDay, currentDayData, currentResourceKey, completedDaysList]);

  // Section 16: Check if today actually has a scheduled Live Session
  const todayLiveSession = useMemo(() => {
    const hasLive = Boolean(currentDayData?.hasLive && currentDayData?.live?.hasSession !== false);
    if (!hasLive) return null;

    // Find linked session in liveSessionsService
    const matched = enrolledSessions.find(s => s.studyPlan?.dayNumber === highestUnlockedDay);
    if (matched) return matched;

    // If day is marked as having live but no specific session object, build clean representation
    return {
      id: `live-day-${highestUnlockedDay}`,
      title: currentDayData?.live?.title || `Live Clinical Grand Rounds (Day ${highestUnlockedDay})`,
      faculty: currentDayData?.live?.faculty || 'Dr. Siddharth V. (AIIMS New Delhi)',
      formattedTime: currentDayData?.live?.time ? `Tonight • ${currentDayData.live.time}` : 'Tonight • 8:00 PM IST',
      college: 'Lead Clinical Mentor',
      meetingLink: 'https://meet.google.com/medprep-stemi-live'
    };
  }, [currentDayData, highestUnlockedDay, enrolledSessions]);

  // 8. Up Next Timeline (3–5 actual upcoming chronological items)
  const upNextItems = useMemo(() => {
    const list = [];

    // Item 1: Next Live Session (if upcoming tonight or tomorrow)
    if (nextLiveSession && getLiveSessionStatus(nextLiveSession, currentTime) === SESSION_STATUS.UPCOMING) {
      list.push({
        type: 'live',
        when: nextLiveSession.formattedTime ? nextLiveSession.formattedTime.split('•')[0].trim() : 'Tonight • 8:00 PM',
        title: nextLiveSession.title,
        subtitle: `${nextLiveSession.faculty} • Live Masterclass`,
        badge: 'Live Session',
        link: '/student/live-sessions',
        linkText: 'View Class'
      });
    }

    // Item 2: Tomorrow's Study Day (Day N+1)
    const nextDayNum = highestUnlockedDay + 1;
    const nextDayData = curriculumService.getDayResolvedContent(nextDayNum, enrolledExamId);
    list.push({
      type: 'day',
      when: 'Tomorrow',
      title: nextDayData ? `Day ${nextDayNum}: ${nextDayData.title}` : `Day ${nextDayNum}: Clinical Milestone`,
      subtitle: nextDayData?.subjectName || 'Cardiology & Clinical Hemodynamics',
      badge: 'Study Day',
      link: `/day/${nextDayNum}`,
      linkText: 'Preview Day'
    });

    // Item 3: Upcoming Assessment (CBT Test)
    const upcomingTest = enrolledTests.find(t => getTestStatus(t, currentTime) === CBT_STATUS.UPCOMING);
    if (upcomingTest) {
      list.push({
        type: 'test',
        when: upcomingTest.formattedWindow ? upcomingTest.formattedWindow.split('•')[0].trim() : 'Scheduled Mock',
        title: upcomingTest.name || upcomingTest.title,
        subtitle: `${upcomingTest.totalQuestions || 20} Questions • ${upcomingTest.durationMinutes || 45} mins`,
        badge: 'Assessment',
        link: '/student/tests',
        linkText: 'Test Center'
      });
    }

    return list.slice(0, 4);
  }, [nextLiveSession, highestUnlockedDay, enrolledExamId, enrolledTests, currentTime]);

  // Event Handlers
  const handleResumeResource = (resKey = currentResourceKey) => {
    // Navigate to current valid resource without bypassing sequential gating
    navigate(`/day/${highestUnlockedDay}?tab=${resKey || 'video'}`);
  };

  const handleStartTest = (test) => {
    cbtTestService.startAttempt(test.id);
    navigate(`/test/${test.id}`);
  };

  const handleResumeTest = (test) => {
    navigate(`/test/${test.id}`);
  };

  const handleViewTestResult = (test) => {
    navigate(`/student/tests/${test.id}/result`);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-7 animate-in fade-in duration-300 pb-12">
      
      {/* Return / Milestone Completion Toast Banner */}
      {completionBanner && (
        <div className="bg-emerald-600 text-white p-4 sm:p-5 rounded-2xl shadow-md flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏆</span>
            <div>
              <p className="font-bold text-sm sm:text-base">{completionBanner}</p>
              <p className="text-xs text-emerald-100 mt-0.5">
                Spaced repetition schedule updated. High-yield flashcards added to retention queue.
              </p>
            </div>
          </div>
          <button 
            onClick={() => setCompletionBanner('')}
            className="text-white/80 hover:text-white text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-700/50 hover:bg-emerald-700 transition-colors cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 1. Hero Welcome Section */}
      <DashboardHero
        userName={dashboardUserData.name}
        enrolledCourse={enrolledCourse}
        enrolledPlan={enrolledPlan}
        candidateId="MBBS Candidate MED-2026-904"
        daysLeft={dashboardUserData.daysLeft}
        overallProgress={dashboardUserData.overallProgress}
        streakDays={14}
        targetExamDate={dashboardUserData.targetExamDate}
        currentSystem={`Week ${weekNumber} • Cardiology & Hemodynamics`}
      />

      {/* 2. PRIMARY ACTION: Continue Learning Card */}
      <ContinueLearningCard
        dayNumber={highestUnlockedDay}
        subjectName={currentDayData?.subjectName || 'Cardiology & Hemodynamics'}
        dayTitle={currentDayData?.title || 'Cardiac Arrhythmias & ECG Interpretation'}
        completedCount={completedResourcesCount}
        totalCount={totalMandatoryCount}
        progressPct={dayProgressPct}
        currentResourceTitle={currentResourceTitle}
        currentResourceKey={currentResourceKey}
        isDayDone={isCurrentDayDone}
        onResume={() => handleResumeResource(currentResourceKey)}
      />

      {/* 3. Three-Card Action Grid: Live Session, Assessment, Week Pace */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* Card A: Next Live Session */}
        <NextLiveSessionCard
          session={nextLiveSession}
          currentTime={currentTime}
          isReminderActive={isNextLiveReminderSet}
          onToggleReminder={(s) => toggleSessionReminder(s.id)}
          onJoinSession={(s) => setSelectedLiveSession(s)}
          onBrowseSessions={() => navigate('/student/live-sessions')}
        />

        {/* Card B: Scheduled Assessment */}
        <AssessmentCard
          test={featuredTest}
          currentTime={currentTime}
          onStartTest={handleStartTest}
          onResumeTest={handleResumeTest}
          onViewResult={handleViewTestResult}
          onViewDetails={(t) => setSelectedTestForDetails(t)}
          onBrowseTests={() => navigate('/student/tests')}
        />

        {/* Card C: Week Pace Tracker */}
        <WeekPaceCard
          weekNumber={weekNumber}
          completedDaysCount={completedIndicesThisWeek.length}
          totalDaysInWeek={7}
          activeDayIndex={activeDayIndexInWeek}
          completedIndices={completedIndicesThisWeek}
          onNavigateStudyPlan={() => navigate('/student/study-plan')}
        />

      </div>

      {/* 4. Compact Today's Progress */}
      <TodayProgress
        completedCount={completedResourcesCount}
        totalCount={totalMandatoryCount}
        studyTime={currentDayData?.estimatedTime || '1.5 hrs'}
        dayProgressPct={dayProgressPct}
      />

      {/* 5. Today's Learning Schedule (Derived from active day's resources + Live Session only if today has one) */}
      <TodaySchedule
        dayNumber={highestUnlockedDay}
        targetHours={currentDayData?.estimatedTime || '3.5 hours'}
        items={todayScheduleItems}
        liveSession={todayLiveSession}
        onResumeResource={(resKey) => handleResumeResource(resKey)}
        onJoinLiveSession={(s) => setSelectedLiveSession(s)}
      />

      {/* 6. Up Next Timeline (3–5 upcoming items) */}
      <UpNextTimeline items={upNextItems} />

      {/* 7. Explore Your Program (Compact navigation footer) */}
      <ExploreProgram />

      {/* Interactive Modals */}
      <LiveSessionModal
        isOpen={Boolean(selectedLiveSession)}
        onClose={() => setSelectedLiveSession(null)}
        session={selectedLiveSession}
      />

      <TestDetailsModal
        isOpen={Boolean(selectedTestForDetails)}
        onClose={() => setSelectedTestForDetails(null)}
        test={selectedTestForDetails}
        currentTime={currentTime}
      />

    </div>
  );
}
