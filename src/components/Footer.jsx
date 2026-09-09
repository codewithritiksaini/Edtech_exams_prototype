import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Stethoscope, 
  Mail, 
  Phone, 
  MapPin, 
  Twitter, 
  Youtube, 
  Linkedin, 
  Instagram,
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export default function Footer({ onExploreCourses }) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top CTA Banner */}
        <div className="bg-gradient-to-r from-brand-900 to-indigo-950 rounded-3xl p-8 sm:p-12 mb-16 border border-brand-800/40 relative overflow-hidden shadow-2xl">
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="max-w-xl text-center lg:text-left">
              <span className="text-xs font-bold text-brand-400 tracking-wider uppercase">
                Ready to Start Your Medical Journey?
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                Choose your exam and unlock high-yield clinical mastery today.
              </h3>
              <p className="text-sm text-slate-300 mt-2">
                Join over 10,000+ medical candidates studying with structured week-by-week roadmaps.
              </p>
            </div>
            <button
              onClick={onExploreCourses}
              className="px-8 py-4 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm sm:text-base rounded-xl transition-all shadow-lg shadow-brand-500/25 shrink-0 flex items-center gap-2 group"
            >
              <span>Explore Exam Packages</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Main Footer Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          
          {/* Column 1: Brand & Intro */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
                <Stethoscope className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-white">
                MedPrep<span className="text-brand-500">Pro</span>
              </span>
            </div>
            
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Empowering medical students and doctors worldwide to conquer licensing exams with clinical confidence. 
              Comprehensive prep for NEET PG, USMLE, PLAB / UKMLA, and European Approbation.
            </p>

            <div className="pt-2 flex items-center gap-4 text-slate-400">
              <a href="#twitter" className="w-9 h-9 rounded-lg bg-slate-900 hover:bg-brand-600 hover:text-white flex items-center justify-center transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#youtube" className="w-9 h-9 rounded-lg bg-slate-900 hover:bg-red-600 hover:text-white flex items-center justify-center transition-colors">
                <Youtube className="w-4 h-4" />
              </a>
              <a href="#linkedin" className="w-9 h-9 rounded-lg bg-slate-900 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="#instagram" className="w-9 h-9 rounded-lg bg-slate-900 hover:bg-pink-600 hover:text-white flex items-center justify-center transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Exam Categories */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Exam Categories
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/packages/neet-pg" className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5">
                  <span>🇮🇳</span> NEET PG & NExT
                </Link>
              </li>
              <li>
                <Link to="/packages/usmle" className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5">
                  <span>🇺🇸</span> USMLE Step 1 & 2 CK
                </Link>
              </li>
              <li>
                <Link to="/packages/plab" className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5">
                  <span>🇬🇧</span> PLAB / UKMLA
                </Link>
              </li>
              <li>
                <Link to="/packages/europe" className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5">
                  <span>🇪🇺</span> Europe Medical Licensing
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Portal Directory */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Portals & LMS
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link to="/student/dashboard" className="hover:text-white transition-colors">Student LMS Dashboard</Link></li>
              <li><Link to="/student/courses" className="hover:text-white transition-colors">Student 5-Level Learning</Link></li>
              <li><Link to="/faculty" className="hover:text-white transition-colors">Faculty Academic Console</Link></li>
              <li><Link to="/admin" className="hover:text-white transition-colors">Super Admin Mission Control</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Unified Portal Sign In</Link></li>
            </ul>
          </div>

          {/* Column 4: Contact & Support */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Contact & Support
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-400" />
                <span>support@medpreppro.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-400" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-400" />
                <span>Global Student Support Hub</span>
              </li>
              <li className="text-xs text-slate-500 pt-2">
                Academic Counseling: 9 AM - 9 PM IST
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Prototype Disclaimer */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} MedPrep Pro by Britannica Overseas. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <span>Prototype Demo (Phase 1)</span>
            <span>•</span>
            <span className="text-brand-400 font-semibold">Stakeholder Presentation Mode</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
