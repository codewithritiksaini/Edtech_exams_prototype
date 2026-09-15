import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, FileText } from 'lucide-react';

export default function ExploreProgram() {
  return (
    <section className="bg-slate-100/80 rounded-2xl p-5 sm:p-6 border border-slate-200/80">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
            EXPLORE YOUR PROGRAM
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Subjects • Modules • Lectures • Clinical Resources
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/student/courses"
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold rounded-xl border border-slate-200 shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5 text-brand-600" />
            <span>Browse Courses</span>
          </Link>

          <Link
            to="/student/tests"
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold rounded-xl border border-slate-200 shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5 text-brand-600" />
            <span>Test Center</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
