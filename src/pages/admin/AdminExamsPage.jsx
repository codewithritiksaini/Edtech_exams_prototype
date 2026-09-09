import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  AlertTriangle, 
  CheckCircle2, 
  Check,
  X, 
  Layers, 
  Users, 
  Globe2, 
  Sparkles,
  ChevronRight,
  ArrowRight,
  Filter,
  Calendar
} from 'lucide-react';
import { catalogService } from '../../services/catalogService';
import { curriculumService } from '../../services/curriculumService';

const AVAILABLE_FLAGS = [
  { flag: '🇮🇳', country: 'India', regionCode: 'IN', currency: '₹' },
  { flag: '🇺🇸', country: 'United States', regionCode: 'US', currency: '$' },
  { flag: '🇬🇧', country: 'United Kingdom', regionCode: 'UK', currency: '£' },
  { flag: '🇪🇺', country: 'Europe', regionCode: 'EU', currency: '€' },
  { flag: '🇦🇺', country: 'Australia', regionCode: 'AU', currency: 'A$' },
  { flag: '🇨🇦', country: 'Canada', regionCode: 'CA', currency: 'C$' },
  { flag: '🇩🇪', country: 'Germany', regionCode: 'DE', currency: '€' },
  { flag: '🌐', country: 'Global / Multi-Region', regionCode: 'GL', currency: '$' }
];

export default function AdminExamsPage() {
  const navigate = useNavigate();
  const [exams, setExams] = useState(() => catalogService.getExams());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegionFilter, setSelectedRegionFilter] = useState('all');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [deletingExam, setDeletingExam] = useState(null);
  const [forceDeleteConfirm, setForceDeleteConfirm] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formCountry, setFormCountry] = useState('India');
  const [formFlag, setFormFlag] = useState('🇮🇳');
  const [formDescription, setFormDescription] = useState('');
  const [formWeeks, setFormWeeks] = useState(24);
  const [formStatus, setFormStatus] = useState('Active');
  const [formTag, setFormTag] = useState('National Medical Board Aligned');

  // Sync with catalog service
  useEffect(() => {
    const unsubscribe = catalogService.subscribe((payload) => {
      setExams(payload.exams);
    });
    return unsubscribe;
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleOpenCreateModal = () => {
    setEditingExam(null);
    setFormName('');
    setFormCountry('India');
    setFormFlag('🇮🇳');
    setFormDescription('Targeted clinical curriculum, grand mock tests, and faculty-led high-yield revision modules.');
    setFormWeeks(24);
    setFormStatus('Active');
    setFormTag('National Licensing Examination');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (exam) => {
    setEditingExam(exam);
    setFormName(exam.name);
    setFormCountry(exam.country);
    setFormFlag(exam.flag);
    setFormDescription(exam.description);
    setFormWeeks(exam.weeks || 24);
    setFormStatus(exam.status);
    setFormTag(exam.tag || 'Licensing Examination');
    setIsModalOpen(true);
  };

  const handleSaveExam = (e) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert('Please provide a valid exam title.');
      return;
    }

    if (editingExam) {
      catalogService.updateExam(editingExam.id, {
        name: formName.trim(),
        country: formCountry,
        flag: formFlag,
        description: formDescription,
        weeks: Number(formWeeks),
        status: formStatus,
        tag: formTag
      });
      showToast(`Updated exam "${formName}" successfully!`);
    } else {
      const generatedId = formName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      catalogService.createExam({
        id: generatedId || `exam-${Date.now()}`,
        name: formName.trim(),
        country: formCountry,
        flag: formFlag,
        description: formDescription,
        weeks: Number(formWeeks),
        status: formStatus,
        tag: formTag,
        packagesCount: 3,
        enrolledStudents: 0
      });
      showToast(`Created new exam "${formName}" successfully!`);
    }

    setIsModalOpen(false);
  };

  const handleToggleStatus = (examId) => {
    const exam = catalogService.getExamById(examId);
    if (!exam) return;
    const nextStatus = exam.status === 'Active' ? 'Inactive' : 'Active';
    catalogService.updateExam(examId, { status: nextStatus });
    showToast(`Exam "${exam.name}" status changed to ${nextStatus}.`);
  };

  const handleOpenDeleteModal = (exam) => {
    setDeletingExam(exam);
    setForceDeleteConfirm(false);
  };

  const handleConfirmDelete = (force = false) => {
    if (!deletingExam) return;
    const result = catalogService.deleteExam(deletingExam.id, force);
    if (!result.success) {
      if (result.hasDependents && !force) {
        setForceDeleteConfirm(true);
        return;
      }
      alert(result.reason);
      return;
    }
    showToast(`Exam track "${deletingExam.name}" deleted successfully.`);
    setDeletingExam(null);
    setForceDeleteConfirm(false);
  };

  // Filtered exams
  const filteredExams = useMemo(() => {
    return exams.filter((exam) => {
      const matchesSearch = 
        exam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exam.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (exam.tag && exam.tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesRegion = selectedRegionFilter === 'all' || 
        (selectedRegionFilter === 'IN' && exam.country === 'India') ||
        (selectedRegionFilter === 'US' && exam.country === 'United States') ||
        (selectedRegionFilter === 'UK' && exam.country === 'United Kingdom') ||
        (selectedRegionFilter === 'EU' && (exam.country === 'Europe' || exam.country === 'Germany'));

      return matchesSearch && matchesRegion;
    });
  }, [exams, searchQuery, selectedRegionFilter]);

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Level 1 • Master Academic Programs
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
              {exams.length} Tracks Configured
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Exams & Curriculum Tracks
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            Select any exam track below to drill down into its <strong>Subjects ➡️ Chapters ➡️ Topics ➡️ Content Studio</strong>. 
            All changes persist across student, faculty, and testing portals.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm shadow-indigo-600/20 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Exam Track</span>
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search exam, country, or tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          {/* Region filter pills */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
            {['all', 'IN', 'US', 'UK', 'EU'].map((reg) => (
              <button
                key={reg}
                onClick={() => setSelectedRegionFilter(reg)}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer text-[11px] ${
                  selectedRegionFilter === reg
                    ? 'bg-white text-indigo-700 shadow-2xs font-extrabold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {reg === 'all' ? 'All' : reg}
              </button>
            ))}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                viewMode === 'cards' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-500'
              }`}
            >
              Cards
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-500'
              }`}
            >
              Table
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Exam Cards (Cards View: Exactly 3 Cards Per Row) */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExams.map((exam) => {
            const subjectsCount = curriculumService.getSubjects(exam.id).length;
            const chaptersCount = curriculumService.getChapters(null, exam.id).length;

            return (
              <div
                key={exam.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between overflow-hidden group"
              >
                <div className="p-5 space-y-4">
                  {/* Top Bar: Flag + Status Toggle */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{exam.flag}</span>
                      <span className="text-xs font-bold text-slate-500">{exam.country}</span>
                    </div>
                    <button
                      onClick={() => handleToggleStatus(exam.id)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold cursor-pointer transition-colors ${
                        exam.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}
                    >
                      {exam.status}
                    </button>
                  </div>

                  {/* Title & Tag */}
                  <div className="space-y-1">
                    <h3 className="text-base font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {exam.name}
                    </h3>
                    <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md inline-block">
                      {exam.tag || 'Licensing Program'}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {exam.description}
                  </p>

                  {/* Metrics Badges */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                    <div className="bg-slate-50 p-2 rounded-xl">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Subjects</span>
                      <span className="text-xs font-extrabold text-slate-800">{subjectsCount} Modules</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Chapters</span>
                      <span className="text-xs font-extrabold text-slate-800">{chaptersCount} Units</span>
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(exam)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-white border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
                      title="Edit Exam Metadata"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenDeleteModal(exam)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                      title="Delete Exam Program"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* PRIMARY ACTION: EXPLORE SUBJECTS (Level 2 Drilldown) */}
                  <Link
                    to={`/admin/subjects?exam=${exam.id}`}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                  >
                    <span>Explore Subjects</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Exam Track</th>
                <th className="py-3 px-4">Country</th>
                <th className="py-3 px-4 text-center">Modules</th>
                <th className="py-3 px-4 text-center">Duration</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExams.map((exam) => (
                <tr key={exam.id} className="hover:bg-indigo-50/30 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{exam.flag}</span>
                      <div>
                        <Link 
                          to={`/admin/subjects?exam=${exam.id}`}
                          className="font-extrabold text-slate-900 hover:text-indigo-600 transition-colors"
                        >
                          {exam.name}
                        </Link>
                        <p className="text-[11px] text-slate-400 font-normal">{exam.tag}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-medium">{exam.country}</td>
                  <td className="py-3.5 px-4 text-center font-bold text-indigo-700">
                    {curriculumService.getSubjects(exam.id).length} Subjects
                  </td>
                  <td className="py-3.5 px-4 text-center text-slate-600">{exam.weeks || 24} Weeks</td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      exam.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {exam.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEditModal(exam)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200/80 hover:border-indigo-200 transition-colors cursor-pointer"
                        title="Edit Exam"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenDeleteModal(exam)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200/80 hover:border-rose-200 transition-colors cursor-pointer"
                        title="Delete Exam"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <Link
                        to={`/admin/subjects?exam=${exam.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-2xs transition-all ml-1"
                      >
                        <span>Explore</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Slide-over / Modal for Add & Edit Exam */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-lg font-black text-slate-900">
                {editingExam ? 'Edit Exam Track' : 'Create New Exam Track'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExam} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Exam Title / Program Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AMC (Australian Medical Council)"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Country / Region</label>
                  <select
                    value={formCountry}
                    onChange={(e) => {
                      const item = AVAILABLE_FLAGS.find(f => f.country === e.target.value);
                      if (item) {
                        setFormCountry(item.country);
                        setFormFlag(item.flag);
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-800"
                  >
                    {AVAILABLE_FLAGS.map(f => (
                      <option key={f.country} value={f.country}>{f.flag} {f.country}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Duration (Weeks)</label>
                  <input
                    type="number"
                    min="4"
                    max="52"
                    value={formWeeks}
                    onChange={(e) => setFormWeeks(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Accreditation / Tag</label>
                <input
                  type="text"
                  value={formTag}
                  onChange={(e) => setFormTag(e.target.value)}
                  placeholder="e.g. National Board Aligned"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-800"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Description</label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-800"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-sm"
                >
                  {editingExam ? 'Save Changes' : 'Create Exam'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Exam Confirmation Modal */}
      {deletingExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Delete Exam Track?
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  This will remove the master program from the catalog.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
              <span className="text-2xl">{deletingExam.flag}</span>
              <div>
                <h4 className="text-xs font-bold text-slate-900">{deletingExam.name}</h4>
                <p className="text-[11px] text-slate-500">{deletingExam.country} • {deletingExam.tag}</p>
              </div>
            </div>

            {(forceDeleteConfirm || (deletingExam.enrolledStudents > 0) || (deletingExam.packagesCount > 0)) && (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1.5">
                <div className="font-bold flex items-center gap-1.5 text-amber-950">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Active Dependencies Detected</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  This exam currently has <strong>{deletingExam.packagesCount || 3} packages</strong> and <strong>{deletingExam.enrolledStudents || 0} enrolled candidates</strong>.
                  We recommend setting its status to <strong>Inactive</strong> instead of permanently deleting.
                </p>
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setDeletingExam(null);
                  setForceDeleteConfirm(false);
                }}
                className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>

              {(deletingExam.enrolledStudents > 0 || deletingExam.packagesCount > 0) && (
                <button
                  type="button"
                  onClick={() => {
                    handleToggleStatus(deletingExam.id);
                    setDeletingExam(null);
                    setForceDeleteConfirm(false);
                  }}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 transition-colors cursor-pointer"
                >
                  Deactivate Instead
                </button>
              )}

              <button
                type="button"
                onClick={() => handleConfirmDelete(true)}
                className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-600/20 transition-all cursor-pointer"
              >
                {forceDeleteConfirm ? 'Yes, Force Delete' : 'Delete Exam'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
