import React, { useState } from 'react';
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
  Search,
  Filter
} from 'lucide-react';
import LiveSessionModal from '../../components/LiveSessionModal';
import { dashboardLiveSessions } from '../../data/mockData';

export default function StudentLiveSessionsPage() {
  const [selectedLiveSession, setSelectedLiveSession] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [calendarToast, setCalendarToast] = useState('');

  const handleAddToCalendar = (sessionTitle) => {
    setCalendarToast(`📅 "${sessionTitle}" successfully added to your study calendar!`);
    setTimeout(() => setCalendarToast(''), 4000);
  };

  const handleSetReminder = (sessionTitle) => {
    setCalendarToast(`🔔 Reminder set for "${sessionTitle}". You'll receive a WhatsApp & SMS alert 30 minutes before.`);
    setTimeout(() => setCalendarToast(''), 4500);
  };

  const filteredSessions = activeCategory === 'all'
    ? dashboardLiveSessions
    : activeCategory === 'urgent'
      ? dashboardLiveSessions.filter(s => s.status === 'Live Soon')
      : dashboardLiveSessions;

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Calendar / Reminder Toast */}
      {calendarToast && (
        <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-lg flex items-center justify-between border border-slate-800 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <span className="text-xl">✅</span>
            <span className="text-xs sm:text-sm font-semibold">{calendarToast}</span>
          </div>
          <button 
            onClick={() => setCalendarToast('')}
            className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-bold uppercase tracking-wider mb-2">
            <Radio className="w-3.5 h-3.5 text-red-600" />
            <span>Interactive Faculty Broadcast Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Live Faculty Sessions & Grand Rounds
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl">
            Attend real-time clinical case discussions, differential diagnosis drills, ECG emergency walkthroughs, and engage directly with national medical faculties.
          </p>
        </div>

        <span className="text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-4 py-2.5 rounded-2xl self-start sm:self-auto shadow-2xs flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
          <span>Next Session: <strong>Tonight @ 8:00 PM IST</strong></span>
        </span>
      </div>

      {/* Featured Tonight Live Session Card */}
      <div className="bg-gradient-to-br from-red-600 via-rose-700 to-red-800 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-white text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              <span>TONIGHT'S FEATURED CLINICAL GRAND ROUNDS</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              STEMI & Acute ECG Grand Rounds: Localization & Reperfusion
            </h2>

            <p className="text-xs sm:text-sm text-red-100 leading-relaxed">
              Deep-dive case study of anteroseptal vs inferior STEMI, Sgarbossa criteria in LBBB, ventricular arrhythmias, 
              and emergency cath-lab activation guidelines with high-yield exam vignette breakdowns.
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs pt-1 text-red-100">
              <span className="flex items-center gap-1.5 font-semibold">
                👨‍⚕️ Dr. Siddharth V. (AIIMS New Delhi Faculty)
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                1.5 Hours Interactive Class
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                340+ Doctors Registered
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <button
              onClick={() => setSelectedLiveSession(dashboardLiveSessions[0])}
              className="px-6 py-3.5 bg-white text-red-700 hover:bg-red-50 font-black rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              <Radio className="w-4 h-4 text-red-600 animate-pulse" />
              <span>Join Live Broadcast Room</span>
            </button>
            <button
              onClick={() => handleAddToCalendar('STEMI & Acute ECG Grand Rounds')}
              className="text-xs text-white/90 hover:text-white text-center font-bold px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
            >
              + Add to Google Calendar
            </button>
          </div>
        </div>
      </div>

      {/* Upcoming Live Sessions Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Upcoming Live Class Schedule</h3>
            <p className="text-xs text-slate-500">Live clinical seminars scheduled for this week</p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeCategory === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Scheduled ({dashboardLiveSessions.length})
            </button>
            <button
              onClick={() => setActiveCategory('urgent')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeCategory === 'urgent' ? 'bg-white text-red-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Live Soon
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {filteredSessions.map((session) => {
            const isLiveSoon = session.status === 'Live Soon';
            return (
              <div
                key={session.id}
                className={`rounded-3xl p-6 border flex flex-col justify-between transition-all bg-white hover:shadow-md ${
                  isLiveSoon
                    ? 'border-red-300 ring-1 ring-red-400/20 shadow-xs'
                    : 'border-slate-200 shadow-2xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                      isLiveSoon ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {session.badge}
                    </span>
                    <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {session.time}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 mb-1 leading-snug">
                    {session.title}
                  </h4>

                  <p className="text-xs font-bold text-brand-700 mb-2.5">
                    {session.faculty}
                  </p>

                  <p className="text-xs text-slate-500 leading-relaxed mb-4">
                    {session.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleSetReminder(session.title)}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer flex items-center gap-1"
                  >
                    <Bell className="w-3.5 h-3.5 text-slate-400" />
                    <span>+ Reminder</span>
                  </button>

                  <button
                    onClick={() => setSelectedLiveSession(session)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                      isLiveSoon
                        ? 'bg-red-600 hover:bg-red-700 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <Radio className="w-3.5 h-3.5" />
                    <span>Join Session</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recorded Lectures Archive */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recorded Masterclasses Archive</h3>
            <p className="text-xs text-slate-500 mt-0.5">Stream high-yield past grand rounds anytime on demand</p>
          </div>
          <span className="text-xs font-semibold text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
            Available 24/7 on Demand
          </span>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {[
            { title: 'Cardiology ECG Masterclass: Axis & Conduction Abnormalities', date: 'Sep 2, 2026', dur: '1h 22m', fac: 'Dr. Siddharth V. (AIIMS Lead)', views: '1,240 views' },
            { title: 'Valvular Murmurs Clinical Auscultation & Phonocardiograms', date: 'Aug 28, 2026', dur: '58m', fac: 'Dr. Siddharth V.', views: '980 views' },
            { title: 'Heart Failure Pharmacotherapy: Landmark SGLT2i & ARNI Trials', date: 'Aug 22, 2026', dur: '1h 10m', fac: 'Dr. Priya Sharma (PGI Lead)', views: '1,560 views' },
            { title: 'Emergency Management of Acute Pulmonary Embolism (PERC Criteria)', date: 'Aug 15, 2026', dur: '45m', fac: 'Dr. Siddharth V.', views: '890 views' },
          ].map((rec, i) => (
            <div key={i} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 p-2 rounded-xl transition-colors">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  <Video className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{rec.title}</h4>
                  <span className="text-slate-500 text-[11px] block mt-0.5">
                    {rec.fac} • {rec.date} • {rec.dur} • <span className="text-brand-600 font-semibold">{rec.views}</span>
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedLiveSession({
                  title: rec.title,
                  faculty: rec.fac,
                  duration: rec.dur,
                  description: 'Full HD on-demand lecture replay with interactive chapter navigation and synchronized transcript.',
                  isReplay: true
                })}
                className="px-4 py-2 bg-slate-100 hover:bg-brand-600 hover:text-white text-slate-700 font-bold rounded-xl text-xs transition-all cursor-pointer self-start sm:self-auto flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Watch Replay</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Live Session Modal */}
      <LiveSessionModal
        isOpen={Boolean(selectedLiveSession)}
        onClose={() => setSelectedLiveSession(null)}
        session={selectedLiveSession}
      />
    </div>
  );
}
