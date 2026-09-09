import React, { useState } from 'react';
import { 
  Video, 
  Radio, 
  Calendar, 
  Clock, 
  Users, 
  Plus, 
  ExternalLink, 
  CheckCircle2, 
  Trash2, 
  X,
  Play
} from 'lucide-react';
import { dashboardLiveSessions } from '../../data/mockData';

export default function FacultyLiveSessionsPage() {
  const [liveSessionsList, setLiveSessionsList] = useState(dashboardLiveSessions);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [successToast, setSuccessToast] = useState('');

  // Schedule form state
  const [liveCourse, setLiveCourse] = useState('NEET PG & NExT 2026');
  const [liveDay, setLiveDay] = useState('Day 3 (Week 1)');
  const [liveTopic, setLiveTopic] = useState('');
  const [liveDate, setLiveDate] = useState('2026-09-15');
  const [liveTime, setLiveTime] = useState('20:00');
  const [liveDuration, setLiveDuration] = useState('1.5 hours');
  const [liveLink, setLiveLink] = useState('https://zoom.us/j/9876543210');

  const handleScheduleSubmit = (e) => {
    e.preventDefault();
    if (!liveTopic.trim()) return;

    const newSession = {
      id: `live-${Date.now()}`,
      course: liveCourse,
      topic: liveTopic.trim(),
      dayInfo: liveDay,
      instructor: 'Dr. Sarah Jenkins',
      date: liveDate,
      time: `${liveTime} IST`,
      duration: liveDuration,
      status: 'upcoming',
      registeredStudents: 380,
      zoomLink: liveLink.trim()
    };

    setLiveSessionsList(prev => [newSession, ...prev]);
    setIsScheduleModalOpen(false);
    setLiveTopic('');
    setSuccessToast(`Live broadcast scheduled: "${newSession.topic}"!`);
    setTimeout(() => setSuccessToast(''), 4000);
  };

  const handleDeleteSession = (id) => {
    setLiveSessionsList(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className="space-y-6 animate-in fade-in max-w-6xl">
      {/* Toast */}
      {successToast && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-3 text-xs font-semibold animate-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Faculty Grand Rounds
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-100">
              Live Broadcast Center
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Schedule & Host Live Masterclasses
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            Stream interactive clinical discussions, ECG strip breakdowns, and live Q&A sessions with enrolled medical graduates.
          </p>
        </div>

        <button
          onClick={() => setIsScheduleModalOpen(true)}
          className="px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-rose-600/20 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Schedule Masterclass</span>
        </button>
      </div>

      {/* Sessions Timetable Cards */}
      <div className="space-y-4">
        <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
          Broadcast Timetable & Archives ({liveSessionsList.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {liveSessionsList.map((session) => {
            const isLive = session.status === 'live';
            const isUpcoming = session.status === 'upcoming';

            return (
              <div
                key={session.id}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-indigo-600">
                      {session.course}
                    </span>
                    <div className="flex items-center gap-2">
                      {isLive && (
                        <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black uppercase animate-pulse">
                          <Radio className="w-3 h-3" />
                          <span>Live Now</span>
                        </span>
                      )}
                      {isUpcoming && (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-black uppercase">
                          Upcoming
                        </span>
                      )}
                      {!isLive && !isUpcoming && (
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase">
                          Recorded Archive
                        </span>
                      )}
                      <button
                        onClick={() => handleDeleteSession(session.id)}
                        className="text-slate-300 hover:text-rose-600 p-1 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-black text-slate-900 group-hover:text-rose-600 transition-colors">
                    {session.topic}
                  </h3>

                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 font-semibold">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{session.date}</span>
                      </span>
                      <span className="flex items-center gap-1.5 font-semibold">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{session.time} ({session.duration})</span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-500 pt-1 border-t border-slate-200/50">
                      <span>Instructor: {session.instructor || 'Dr. Sarah Jenkins'}</span>
                      <span className="font-bold text-indigo-600">{session.registeredStudents || 380} Cohort Doctors</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-mono truncate max-w-[200px]">
                    {session.zoomLink || 'https://zoom.us/j/...'}
                  </span>
                  <a
                    href={session.zoomLink || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-rose-600/25 transition-all cursor-pointer"
                  >
                    <Radio className="w-3.5 h-3.5" />
                    <span>Launch Host Room</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Schedule Modal */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl space-y-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
                  <Radio className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Schedule Live Masterclass</h3>
                  <p className="text-xs text-slate-500">Broadcast to enrolled candidates</p>
                </div>
              </div>
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Exam Track</label>
                <select
                  value={liveCourse}
                  onChange={(e) => setLiveCourse(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium"
                >
                  <option value="NEET PG & NExT 2026">NEET PG & NExT 2026</option>
                  <option value="USMLE Step 1 & 2 CK">USMLE Step 1 & 2 CK</option>
                  <option value="PLAB 1 & 2 / UKMLA">PLAB 1 & 2 / UKMLA</option>
                  <option value="Europe Medical Licensing">Europe Medical Licensing</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Masterclass Topic</label>
                <input
                  type="text"
                  placeholder="e.g. High-Yield Arrhythmias: Wide QRS Complex Tachycardias"
                  value={liveTopic}
                  onChange={(e) => setLiveTopic(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Date</label>
                  <input
                    type="date"
                    value={liveDate}
                    onChange={(e) => setLiveDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Time (IST)</label>
                  <input
                    type="time"
                    value={liveTime}
                    onChange={(e) => setLiveTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Duration</label>
                  <select
                    value={liveDuration}
                    onChange={(e) => setLiveDuration(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium"
                  >
                    <option value="45 mins">45 mins</option>
                    <option value="1 hour">1 hour</option>
                    <option value="1.5 hours">1.5 hours</option>
                    <option value="2 hours">2 hours</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Zoom / Host Link</label>
                  <input
                    type="url"
                    value={liveLink}
                    onChange={(e) => setLiveLink(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition-all shadow-md shadow-rose-600/20"
                >
                  Schedule Broadcast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
