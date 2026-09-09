import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ManageScheduleTab from '../../components/admin/ManageScheduleTab';
import { authService } from '../../services/authService';
import { catalogService } from '../../services/catalogService';

export default function AdminSchedulePage() {
  const { examId = 'neet-pg' } = useParams();
  const navigate = useNavigate();
  const [currentUser] = useState(() => authService.getCurrentUser());
  const [exams] = useState(() => catalogService.getExams());

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Exam Switcher Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {exams.map((ex) => {
          const isCurrent = ex.id === examId;
          return (
            <button
              key={ex.id}
              onClick={() => navigate(`/admin/schedule/${ex.id}`)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2.5 shrink-0 cursor-pointer border ${
                isCurrent
                  ? 'bg-white text-emerald-800 border-emerald-300 shadow-sm ring-2 ring-emerald-500/10'
                  : 'bg-white/60 text-slate-600 border-slate-200/80 hover:bg-white hover:text-slate-900'
              }`}
            >
              <span className="text-base">{ex.flag}</span>
              <span>{ex.name} — Schedule</span>
            </button>
          );
        })}
      </div>

      {/* Render the full interactive Schedule Planner */}
      <ManageScheduleTab
        key={examId}
        isAdmin={true}
        currentUser={currentUser}
        initialExamId={examId}
      />
    </div>
  );
}
