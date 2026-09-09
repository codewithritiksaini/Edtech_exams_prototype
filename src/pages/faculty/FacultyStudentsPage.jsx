import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Mail, 
  Award, 
  CheckCircle2, 
  Filter, 
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { facultyStudentDirectory } from '../../data/mockData';

export default function FacultyStudentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTrack, setSelectedTrack] = useState('all');

  const filteredStudents = facultyStudentDirectory.filter((st) => {
    const matchesSearch = st.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          st.course.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTrack = selectedTrack === 'all' || st.course.toLowerCase().includes(selectedTrack.toLowerCase());
    return matchesSearch && matchesTrack;
  });

  return (
    <div className="space-y-6 animate-in fade-in max-w-6xl">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Faculty Department Roster
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
              1,420 Enrolled Doctors
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Enrolled Candidates & Doubts
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            Monitor candidate study pace, active recall flashcard accuracy, and cohort performance across your assigned licensing tracks.
          </p>
        </div>

        {/* Filter & Search */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <select
            value={selectedTrack}
            onChange={(e) => setSelectedTrack(e.target.value)}
            className="px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700"
          >
            <option value="all">All Licensing Tracks</option>
            <option value="neet">NEET PG</option>
            <option value="usmle">USMLE Step 1</option>
            <option value="plab">PLAB 1</option>
          </select>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search doctor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-44 sm:w-56"
            />
          </div>
        </div>
      </div>

      {/* Students Directory Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-slate-900">
            Active Candidates Directory ({filteredStudents.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                <th className="pb-3">Doctor Candidate</th>
                <th className="pb-3">Course / Track</th>
                <th className="pb-3">Enrolled Tier</th>
                <th className="pb-3">Syllabus Completion</th>
                <th className="pb-3">Q-Bank Accuracy</th>
                <th className="pb-3 text-right">Last Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((st) => (
                <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 pr-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={st.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                        alt={st.name}
                        className="w-9 h-9 rounded-2xl object-cover border border-slate-200"
                      />
                      <div>
                        <span className="font-bold text-slate-900 block">{st.name}</span>
                        <span className="text-[11px] text-slate-400">{st.email}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 pr-3 font-semibold text-slate-700">
                    {st.course}
                  </td>

                  <td className="py-4 pr-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {st.packageTier || 'Full Prep Pro'}
                    </span>
                  </td>

                  <td className="py-4 pr-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${st.progress || 60}%` }} />
                      </div>
                      <span className="font-bold text-emerald-600">{st.progress || 60}%</span>
                    </div>
                  </td>

                  <td className="py-4 pr-3 font-bold text-indigo-600">
                    {st.qbankAccuracy || '82%'}
                  </td>

                  <td className="py-4 text-right text-slate-400 text-[11px]">
                    {st.lastActive || '2 hours ago'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
