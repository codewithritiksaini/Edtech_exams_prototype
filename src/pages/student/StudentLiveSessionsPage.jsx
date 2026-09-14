import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Radio, 
  Calendar, 
  Clock, 
  Users, 
  Play, 
  Video, 
  Sparkles, 
  CheckCircle2, 
  ExternalLink, 
  Bell, 
  BellOff, 
  Search,
  Filter,
  AlertCircle,
  Lock,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  BookOpen,
  Layers,
  Award,
  RefreshCw,
  FileText
} from 'lucide-react';
import LiveSessionModal from '../../components/LiveSessionModal';
import { 
  liveSessionsService,
  SESSION_STATUS,
  getLiveSessionStatus,
  canJoinLiveSession,
  canWatchReplay,
  canSetReminder,
  formatSessionCountdown,
  getFeaturedSession,
  toggleSessionReminder,
  isReminderSet,
  getSessionTimes
} from '../../services/liveSessionsService';

export default function StudentLiveSessionsPage() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState(() => liveSessionsService.getAllSessions());
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [selectedLiveSession, setSelectedLiveSession] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all'); // 'all' | 'live' | 'upcoming' | 'past' | 'plan'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [toastMessage, setToastMessage] = useState('');
  const [reminderVersion, setReminderVersion] = useState(0);

  // 1. Reactive interval timer: update currentTime every 10 seconds (or 1s if near transition)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 10000);

    // Subscribe to service updates
    const unsubscribe = liveSessionsService.subscribe((updated) => {
      setSessions([...updated]);
    });

    // Subscribe to reminder updates
    const handleRemindersUpdated = () => {
      setReminderVersion(v => v + 1);
    };
    window.addEventListener('medprep-live-reminders-updated', handleRemindersUpdated);

    return () => {
      clearInterval(timer);
      unsubscribe();
      window.removeEventListener('medprep-live-reminders-updated', handleRemindersUpdated);
    };
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 4500);
  };

  const handleToggleReminder = (session) => {
    const updatedState = toggleSessionReminder(session.id);
    setReminderVersion(v => v + 1);
    if (updatedState) {
      showToast(`🔔 Reminder set for "${session.title}". You will receive SMS & WhatsApp alert 15 mins before.`);
    } else {
      showToast(`🔕 Reminder cancelled for "${session.title}".`);
    }
  };

  const handleAddToCalendar = (session) => {
    const times = getSessionTimes(session);
    showToast(`📅 "${session.title}" added to your clinical study calendar (${times.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} IST).`);
  };

  const handleWatchReplay = (session) => {
    setSelectedLiveSession({
      ...session,
      isReplay: true,
      description: session.description || 'Full HD on-demand lecture replay with interactive chapter navigation, clinical case breakdowns, and downloadable slide deck.'
    });
  };

  // Status counts for filters
  const counts = useMemo(() => {
    let live = 0;
    let upcoming = 0;
    let past = 0;
    let plan = 0;

    sessions.forEach(s => {
      const st = getLiveSessionStatus(s, currentTime);
      if (st === SESSION_STATUS.LIVE) live++;
      if (st === SESSION_STATUS.UPCOMING) upcoming++;
      if (st === SESSION_STATUS.ENDED) past++;
      if (s.studyPlan) plan++;
    });

    return { all: sessions.length, live, upcoming, past, plan };
  }, [sessions, currentTime]);

  // Filtered session list
  const filteredSessions = useMemo(() => {
    return sessions.filter(session => {
      const status = getLiveSessionStatus(session, currentTime);

      // Category filter
      if (activeCategory === 'live' && status !== SESSION_STATUS.LIVE) return false;
      if (activeCategory === 'upcoming' && status !== SESSION_STATUS.UPCOMING) return false;
      if (activeCategory === 'past' && status !== SESSION_STATUS.ENDED) return false;
      if (activeCategory === 'plan' && !session.studyPlan) return false;

      // Topic filter
      if (selectedTopic !== 'All') {
        const text = `${session.title} ${session.topic} ${session.description}`.toLowerCase();
        if (!text.includes(selectedTopic.toLowerCase())) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = session.title?.toLowerCase().includes(q);
        const matchFaculty = session.faculty?.toLowerCase().includes(q);
        const matchTopic = session.topic?.toLowerCase().includes(q);
        const matchDesc = session.description?.toLowerCase().includes(q);
        if (!matchTitle && !matchFaculty && !matchTopic && !matchDesc) return false;
      }

      return true;
    });
  }, [sessions, activeCategory, selectedTopic, searchQuery, currentTime]);

  // Featured session dynamically computed
  const featuredSession = useMemo(() => {
    return getFeaturedSession(sessions, currentTime);
  }, [sessions, currentTime]);

  const featuredStatus = featuredSession ? getLiveSessionStatus(featuredSession, currentTime) : null;
  const isFeaturedLive = featuredStatus === SESSION_STATUS.LIVE;
  const isFeaturedUpcoming = featuredStatus === SESSION_STATUS.UPCOMING;
  const isFeaturedEnded = featuredStatus === SESSION_STATUS.ENDED;

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300 pb-12">
      
      {/* Dynamic Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 max-w-md bg-slate-900 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-3 border border-slate-700 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-3">
            <span className="text-xl">✅</span>
            <span className="text-xs sm:text-sm font-semibold">{toastMessage}</span>
          </div>
          <button 
            onClick={() => setToastMessage('')}
            className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-bold uppercase tracking-wider mb-2">
            <Radio className="w-3.5 h-3.5 text-red-600 animate-pulse" />
            <span>Interactive Faculty Broadcast Hub • NEET PG & NExT 2026</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Live Faculty Sessions & Grand Rounds
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
            Attend real-time clinical case discussions, differential diagnosis drills, 12-lead ECG emergencies, and interact directly with national medical faculties.
          </p>
        </div>

        {/* Dynamic status pill */}
        <div className="flex items-center gap-2 shrink-0">
          {counts.live > 0 ? (
            <span className="text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-4 py-2.5 rounded-2xl shadow-xs flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
              <span><strong>{counts.live} Session Live Now</strong></span>
            </span>
          ) : (
            <span className="text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-4 py-2.5 rounded-2xl shadow-2xs flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-brand-600" />
              <span>Next Session: <strong>Tonight @ 10:00 PM IST</strong></span>
            </span>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FEATURED SESSION CARD (DYNAMIC HERO BY LIFECYCLE)                         */}
      {/* ========================================================================= */}
      {featuredSession && (
        <div className={`rounded-3xl p-6 sm:p-8 shadow-lg relative overflow-hidden text-white transition-all ${
          isFeaturedLive 
            ? 'bg-gradient-to-br from-red-600 via-rose-700 to-slate-950 border border-red-500/40 ring-2 ring-red-500/20'
            : isFeaturedUpcoming
              ? 'bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-indigo-800/40'
              : 'bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 border border-purple-800/40'
        }`}>
          {/* Ambient blur accents */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-4 max-w-3xl">
              
              {/* Badges row */}
              <div className="flex flex-wrap items-center gap-2.5">
                {isFeaturedLive && (
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/90 text-white text-xs font-black uppercase tracking-wider shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                    LIVE NOW IN PROGRESS
                  </span>
                )}
                {isFeaturedUpcoming && (
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/80 text-white text-xs font-black uppercase tracking-wider">
                    <Clock className="w-3.5 h-3.5 text-amber-300" />
                    {formatSessionCountdown(featuredSession, currentTime)}
                  </span>
                )}
                {isFeaturedEnded && (
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/80 text-white text-xs font-black uppercase tracking-wider">
                    <Play className="w-3 h-3 fill-current" />
                    RECENT MASTERCLASS REPLAY
                  </span>
                )}

                {featuredSession.studyPlan && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-slate-100 text-xs font-bold border border-white/10">
                    <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                    Study Plan: Week {featuredSession.studyPlan.weekNumber}, Day {featuredSession.studyPlan.dayNumber}
                  </span>
                )}

                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 text-white/90 text-xs font-medium">
                  {featuredSession.formattedTime}
                </span>
              </div>

              {/* Title & Description */}
              <div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
                  {featuredSession.title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-200 mt-2 leading-relaxed">
                  {featuredSession.description}
                </p>
              </div>

              {/* Faculty & Class Specs */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-200 pt-1">
                <span className="flex items-center gap-1.5 font-bold text-white">
                  👨‍⚕️ {featuredSession.faculty} <span className="font-normal text-slate-300">({featuredSession.college || featuredSession.facultyTitle})</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 font-semibold">
                  <Clock className="w-3.5 h-3.5 text-amber-300" />
                  {featuredSession.duration} Class
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 font-semibold">
                  <Users className="w-3.5 h-3.5 text-emerald-300" />
                  {featuredSession.attendeesCount} Doctors Enrolled
                </span>
              </div>
            </div>

            {/* Featured Action Area (Strict Lifecycle Enforcement) */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0 lg:min-w-[260px]">
              {isFeaturedLive ? (
                // State: LIVE NOW -> Active Join Button
                <>
                  <Link
                    to={`/live-session/${featuredSession.id}`}
                    className="px-6 py-4 bg-white text-red-700 hover:bg-red-50 font-black rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2.5 cursor-pointer text-sm tracking-wide group"
                  >
                    <Radio className="w-4 h-4 text-red-600 animate-pulse" />
                    <span>Join Live Broadcast Room</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <button
                    onClick={() => setSelectedLiveSession(featuredSession)}
                    className="text-xs text-white/90 hover:text-white text-center font-bold px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
                  >
                    💬 Quick Slide & Q&A Preview
                  </button>
                </>
              ) : isFeaturedUpcoming ? (
                // State: UPCOMING -> NO Join Button Allowed!
                <>
                  <div className="px-5 py-3.5 rounded-2xl bg-white/10 border border-white/20 text-white text-xs font-bold flex items-center justify-center gap-2">
                    <Clock className="w-4 h-4 text-amber-300" />
                    <span>Starts at {featuredSession.formattedTime.split('•').pop().trim()}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggleReminder(featuredSession)}
                      className={`flex-1 px-4 py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        isReminderSet(featuredSession.id)
                          ? 'bg-amber-400 text-slate-950 shadow-md'
                          : 'bg-white/15 hover:bg-white/25 text-white border border-white/20'
                      }`}
                    >
                      {isReminderSet(featuredSession.id) ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-slate-950" />
                          <span>Reminder Set</span>
                        </>
                      ) : (
                        <>
                          <Bell className="w-3.5 h-3.5 text-amber-300" />
                          <span>Remind Me</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleAddToCalendar(featuredSession)}
                      className="px-3 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center"
                      title="Add to Google Calendar"
                    >
                      <Calendar className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-[11px] text-slate-400 text-center font-medium">
                    🔒 Broadcast unlocks at start time
                  </span>
                </>
              ) : (
                // State: ENDED -> Watch Replay if available
                <>
                  {canWatchReplay(featuredSession) ? (
                    <button
                      onClick={() => handleWatchReplay(featuredSession)}
                      className="px-6 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2.5 cursor-pointer text-sm"
                    >
                      <Play className="w-4 h-4 fill-current text-slate-950" />
                      <span>Watch Replay ({featuredSession.duration})</span>
                    </button>
                  ) : (
                    <div className="px-5 py-3.5 rounded-2xl bg-slate-800 text-slate-400 text-xs font-bold text-center border border-slate-700">
                      Session Ended • Replay Processing
                    </div>
                  )}
                  <Link
                    to={`/live-session/${featuredSession.id}`}
                    className="text-xs text-white/80 hover:text-white text-center font-bold px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    View Session Case Notes
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SEARCH, CATEGORY & TOPIC FILTER CONTROLS                                  */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">
              Grand Rounds Schedule & Clinical Sessions
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Filter by lifecycle state, search by faculty, or view sessions linked directly to your 28-day study plan.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by faculty, ECG, topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9.5 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:border-brand-500 shadow-2xs"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeCategory === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
            }`}
          >
            <span>All Sessions</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              activeCategory === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {counts.all}
            </span>
          </button>

          <button
            onClick={() => setActiveCategory('live')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeCategory === 'live'
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200/60'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${activeCategory === 'live' ? 'bg-white animate-ping' : 'bg-red-500'}`} />
            <span>Live Now</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              activeCategory === 'live' ? 'bg-white/20 text-white' : 'bg-red-200 text-red-800'
            }`}>
              {counts.live}
            </span>
          </button>

          <button
            onClick={() => setActiveCategory('upcoming')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeCategory === 'upcoming'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200/60'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Upcoming</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              activeCategory === 'upcoming' ? 'bg-white/20 text-white' : 'bg-indigo-200 text-indigo-800'
            }`}>
              {counts.upcoming}
            </span>
          </button>

          <button
            onClick={() => setActiveCategory('plan')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeCategory === 'plan'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-200/60'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>My Study Plan</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              activeCategory === 'plan' ? 'bg-white/20 text-white' : 'bg-brand-200 text-brand-800'
            }`}>
              {counts.plan}
            </span>
          </button>

          <button
            onClick={() => setActiveCategory('past')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeCategory === 'past'
                ? 'bg-slate-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Past / Replays</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              activeCategory === 'past' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {counts.past}
            </span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SESSIONS GRID (WITH STRICT ACTION BUTTON RULES)                           */}
      {/* ========================================================================= */}
      {filteredSessions.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-2xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Calendar className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-slate-900">No sessions found matching your filter</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try switching filter tabs or clearing your search keywords to view upcoming and archived grand rounds.
          </p>
          <button
            onClick={() => { setActiveCategory('all'); setSearchQuery(''); setSelectedTopic('All'); }}
            className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs hover:bg-slate-800 transition-colors cursor-pointer mt-2"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSessions.map((session) => {
            const status = getLiveSessionStatus(session, currentTime);
            const isLive = status === SESSION_STATUS.LIVE;
            const isUpcoming = status === SESSION_STATUS.UPCOMING;
            const isEnded = status === SESSION_STATUS.ENDED;
            const replayReady = canWatchReplay(session);
            const hasReminder = isReminderSet(session.id);
            const countdownText = formatSessionCountdown(session, currentTime);

            return (
              <div
                key={session.id}
                className={`bg-white rounded-3xl border flex flex-col justify-between transition-all duration-200 hover:shadow-md ${
                  isLive
                    ? 'border-red-300 ring-2 ring-red-500/20 shadow-sm'
                    : 'border-slate-200 shadow-2xs hover:border-slate-300'
                }`}
              >
                {/* Card Top / Body */}
                <div className="p-6 space-y-4">
                  
                  {/* Status badge + Study plan badge */}
                  <div className="flex items-start justify-between gap-2">
                    {isLive ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600 text-white text-[11px] font-black uppercase tracking-wider shadow-xs animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                        LIVE NOW
                      </span>
                    ) : isUpcoming ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-[11px] font-bold">
                        <Clock className="w-3 h-3 text-indigo-600" />
                        {countdownText}
                      </span>
                    ) : replayReady ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                        <Play className="w-3 h-3 fill-current" />
                        REPLAY READY
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-semibold">
                        SESSION ENDED
                      </span>
                    )}

                    {session.studyPlan && (
                      <span className="text-[10px] font-bold px-2 py-0.8 rounded-md bg-brand-50 text-brand-700 border border-brand-200 flex items-center gap-1 shrink-0">
                        <BookOpen className="w-3 h-3 text-brand-600" />
                        Day {session.studyPlan.dayNumber}
                      </span>
                    )}
                  </div>

                  {/* Title & Topic */}
                  <div>
                    <h4 className="text-base font-bold text-slate-900 leading-snug hover:text-brand-600 transition-colors">
                      {session.title}
                    </h4>
                    {session.topic && (
                      <p className="text-[11px] font-bold text-brand-700 mt-1">
                        {session.topic}
                      </p>
                    )}
                  </div>

                  {/* Faculty info */}
                  <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                    <div className="w-9 h-9 rounded-xl bg-brand-100 text-brand-700 font-extrabold flex items-center justify-center text-xs shrink-0">
                      {session.faculty ? session.faculty.split(' ').map(n => n[0]).join('').slice(0, 2) : 'DR'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {session.faculty}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {session.college || session.facultyTitle || 'Clinical Faculty'}
                      </p>
                    </div>
                  </div>

                  {/* Time & Duration specifications */}
                  <div className="space-y-1 text-xs text-slate-600">
                    <div className="flex items-center gap-2 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{session.formattedTime}</span>
                    </div>
                    <div className="flex items-center gap-2 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{session.duration} Interactive Presentation</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                    {session.description}
                  </p>
                </div>

                {/* Card Footer: Strict Access Rules */}
                <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/50 rounded-b-3xl">
                  
                  {isLive ? (
                    // 1. LIVE STATE -> Active Join Button
                    <div className="space-y-2">
                      <Link
                        to={`/live-session/${session.id}`}
                        className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                      >
                        <Radio className="w-4 h-4 text-white animate-pulse" />
                        <span>Join Live Session →</span>
                      </Link>
                      <div className="flex items-center justify-between text-[11px] text-emerald-700 font-semibold px-1">
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          Class in session
                        </span>
                        <span>{session.attendeesCount || 340}+ attending</span>
                      </div>
                    </div>
                  ) : isUpcoming ? (
                    // 2. UPCOMING STATE -> NO JOIN BUTTON! Starts at ... + Remind Me
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-[11px] font-bold text-slate-600 bg-white border border-slate-200 px-3 py-2 rounded-xl flex items-center gap-1.5 flex-1 truncate shadow-2xs">
                          <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span className="truncate">Starts at {session.formattedTime.split('•').pop().trim()}</span>
                        </div>

                        <button
                          onClick={() => handleToggleReminder(session)}
                          className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0 ${
                            hasReminder
                              ? 'bg-amber-400 text-slate-950 shadow-2xs'
                              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs'
                          }`}
                        >
                          {hasReminder ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-slate-950" />
                              <span>Set</span>
                            </>
                          ) : (
                            <>
                              <Bell className="w-3.5 h-3.5 text-slate-400" />
                              <span>Remind Me</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 pt-0.5">
                        <span className="flex items-center gap-1">
                          <Lock className="w-3 h-3 text-slate-400" />
                          Join unlocks at start time
                        </span>
                        <button
                          onClick={() => handleAddToCalendar(session)}
                          className="hover:text-brand-600 font-medium cursor-pointer"
                        >
                          + Calendar
                        </button>
                      </div>
                    </div>
                  ) : replayReady ? (
                    // 3. ENDED STATE WITH REPLAY -> Watch Replay Button
                    <div className="space-y-2">
                      <button
                        onClick={() => handleWatchReplay(session)}
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Watch Replay ({session.duration})</span>
                      </button>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                        <span className="font-medium text-emerald-700">Full HD Recording Available</span>
                        <Link 
                          to={`/live-session/${session.id}`}
                          className="text-brand-600 hover:underline font-semibold"
                        >
                          Case Details →
                        </Link>
                      </div>
                    </div>
                  ) : (
                    // 4. ENDED STATE WITHOUT REPLAY -> Disabled / Ended badge (NO broken replay button!)
                    <div className="flex items-center justify-between py-1">
                      <span className="px-3 py-1.5 rounded-xl bg-slate-200/80 text-slate-600 text-xs font-bold">
                        Session Ended
                      </span>
                      <span className="text-[11px] text-slate-400 italic">
                        No recording available
                      </span>
                    </div>
                  )}

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* RECORDED MASTERCLASSES ARCHIVE (ON-DEMAND REPLAYS)                        */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold uppercase tracking-wider mb-1">
              <Play className="w-3 h-3 fill-current" />
              <span>On-Demand Learning Library</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">Recorded Masterclasses Archive</h3>
            <p className="text-xs text-slate-500 mt-0.5">Stream high-yield past grand rounds anytime with synchronized transcripts and slide decks</p>
          </div>
          <span className="text-xs font-semibold text-brand-600 bg-brand-50 px-3.5 py-1.5 rounded-full border border-brand-200 self-start sm:self-auto">
            Available 24/7 on Demand
          </span>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {[
            { 
              title: 'Cardiology ECG Masterclass: Axis, Hemiblocks & Fascicular Conduction Abnormalities', 
              date: 'Sep 2, 2026', 
              dur: '1h 22m', 
              fac: 'Dr. Siddharth V. (AIIMS Lead Mentor)', 
              views: '1,420 views',
              yieldBadge: 'High-Yield Clinical'
            },
            { 
              title: 'Valvular Murmurs Clinical Auscultation & Phonocardiograms Drill', 
              date: 'Aug 28, 2026', 
              dur: '58m', 
              fac: 'Dr. Siddharth V.', 
              views: '1,080 views',
              yieldBadge: 'Clinical Auscultation'
            },
            { 
              title: 'Heart Failure Guideline Pharmacotherapy: Landmark SGLT2i & ARNI Trials Breakdown', 
              date: 'Aug 22, 2026', 
              dur: '1h 10m', 
              fac: 'Dr. Priya Sharma (PGI Lead)', 
              views: '1,690 views',
              yieldBadge: 'Pharmacology Drill'
            },
            { 
              title: 'Emergency Management of Acute Pulmonary Embolism & PERC Criteria Rules', 
              date: 'Aug 15, 2026', 
              dur: '45m', 
              fac: 'Dr. Siddharth V.', 
              views: '940 views',
              yieldBadge: 'Emergency Vignettes'
            },
          ].map((rec, i) => (
            <div key={i} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 p-3 rounded-2xl transition-colors">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 border border-brand-100">
                  <Video className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{rec.title}</h4>
                    <span className="hidden sm:inline-block text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {rec.yieldBadge}
                    </span>
                  </div>
                  <span className="text-slate-500 text-[11px] block mt-1">
                    {rec.fac} • {rec.date} • {rec.dur} • <span className="text-brand-600 font-semibold">{rec.views}</span>
                  </span>
                </div>
              </div>

              <button 
                onClick={() => setSelectedLiveSession({
                  title: rec.title,
                  faculty: rec.fac,
                  duration: rec.dur,
                  description: 'Full HD on-demand lecture replay with interactive chapter navigation, phonocardiogram audio drills, and synchronized transcript.',
                  isReplay: true
                })}
                className="px-4 py-2 bg-slate-100 hover:bg-brand-600 hover:text-white text-slate-700 font-bold rounded-xl text-xs transition-all cursor-pointer self-start sm:self-auto flex items-center gap-1.5 shadow-2xs"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Watch Replay</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Replay / Case Drill Preview Modal */}
      <LiveSessionModal
        isOpen={Boolean(selectedLiveSession)}
        onClose={() => setSelectedLiveSession(null)}
        session={selectedLiveSession}
      />
    </div>
  );
}
