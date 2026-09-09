import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Layers, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  X, 
  FolderTree, 
  ArrowRight, 
  ArrowLeft,
  Heart, 
  Brain, 
  Wind, 
  Droplet, 
  Activity, 
  Pill, 
  Microscope, 
  Shield, 
  BookOpen, 
  Clock, 
  Filter, 
  LayoutGrid, 
  Table as TableIcon,
  ChevronRight,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { curriculumService } from '../../services/curriculumService';
import { catalogService } from '../../services/catalogService';

const AVAILABLE_ICONS = [
  { name: 'Heart', icon: Heart, label: 'Cardiology / Vascular' },
  { name: 'Wind', icon: Wind, label: 'Pulmonology / Respiratory' },
  { name: 'Droplet', icon: Droplet, label: 'Renal / Nephrology' },
  { name: 'Activity', icon: Activity, label: 'Gastroenterology / Surgery' },
  { name: 'Brain', icon: Brain, label: 'Neurology / Psychiatry' },
  { name: 'Pill', icon: Pill, label: 'Clinical Pharmacology' },
  { name: 'Microscope', icon: Microscope, label: 'Pathology / Hematology' },
  { name: 'Shield', icon: Shield, label: 'Emergency / Ethics' },
  { name: 'BookOpen', icon: BookOpen, label: 'General Medicine' }
];

const AVAILABLE_COLORS = [
  { id: 'rose', name: 'Rose Red', bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-200' },
  { id: 'sky', name: 'Sky Blue', bg: 'bg-sky-50', text: 'text-sky-600', border: 'border-sky-200' },
  { id: 'amber', name: 'Warm Amber', bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' },
  { id: 'emerald', name: 'Emerald', bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' },
  { id: 'indigo', name: 'Indigo', bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200' },
  { id: 'purple', name: 'Purple', bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
  { id: 'cyan', name: 'Cyan', bg: 'bg-cyan-50', text: 'text-cyan-600', border: 'border-cyan-200' }
];

export default function AdminSubjectsPage() {
  const { examId: routeExamId } = useParams();
  const navigate = useNavigate();

  const [exams, setExams] = useState(() => catalogService.getExams());
  const selectedExamId = routeExamId || 'neet-pg';

  const [subjects, setSubjects] = useState(() => curriculumService.getSubjects());
  const [chapters, setChapters] = useState(() => curriculumService.getChapters());
  const [topics, setTopics] = useState(() => curriculumService.getTopics());

  // View & Filter State
  const [viewMode, setViewMode] = useState('grid');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formIcon, setFormIcon] = useState('Heart');
  const [formColor, setFormColor] = useState('rose');
  const [formStatus, setFormStatus] = useState('Active');
  const [formFacultyName, setFormFacultyName] = useState('Dr. Siddharth V. (AIIMS)');

  useEffect(() => {
    const unsubCurriculum = curriculumService.subscribeCurriculum(() => {
      setSubjects(curriculumService.getSubjects());
      setChapters(curriculumService.getChapters());
      setTopics(curriculumService.getTopics());
    });
    const unsubCatalog = catalogService.subscribe((payload) => {
      setExams(payload.exams);
    });
    return () => {
      unsubCurriculum();
      unsubCatalog();
    };
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const selectedExam = useMemo(() => {
    return exams.find(e => e.id === selectedExamId) || exams[0] || { id: 'neet-pg', name: 'NEET PG', flag: '🇮🇳' };
  }, [exams, selectedExamId]);

  // Filter subjects for current exam
  const examSubjects = useMemo(() => {
    return subjects
      .filter(s => s.examId === selectedExamId)
      .filter(s => {
        if (statusFilter !== 'all' && s.status !== statusFilter) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return s.name.toLowerCase().includes(q) || (s.code && s.code.toLowerCase().includes(q));
        }
        return true;
      })
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [subjects, selectedExamId, statusFilter, searchQuery]);

  const handleOpenCreateModal = () => {
    setEditingSubject(null);
    setFormName('');
    setFormCode(`${selectedExamId.toUpperCase().slice(0, 4)}-${Math.floor(100 + Math.random() * 900)}`);
    setFormDescription('Comprehensive clinical pathophysiology, emergency management, pharmacotherapy, and grand round case vignettes.');
    setFormIcon('Heart');
    setFormColor('rose');
    setFormStatus('Active');
    setFormFacultyName('Dr. Siddharth V. (AIIMS)');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (subject) => {
    setEditingSubject(subject);
    setFormName(subject.name);
    setFormCode(subject.code || '');
    setFormDescription(subject.description || '');
    setFormIcon(subject.icon || 'Heart');
    setFormColor(subject.color || 'rose');
    setFormStatus(subject.status || 'Active');
    setFormFacultyName(subject.assignedFacultyName || 'Dr. Siddharth V. (AIIMS)');
    setIsModalOpen(true);
  };

  const handleSaveSubject = (e) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (editingSubject) {
      curriculumService.saveSubject({
        ...editingSubject,
        name: formName.trim(),
        code: formCode.trim(),
        description: formDescription.trim(),
        icon: formIcon,
        color: formColor,
        status: formStatus,
        assignedFacultyName: formFacultyName
      });
      showToast(`Subject "${formName}" updated successfully!`);
    } else {
      curriculumService.saveSubject({
        examId: selectedExamId,
        name: formName.trim(),
        code: formCode.trim(),
        description: formDescription.trim(),
        icon: formIcon,
        color: formColor,
        status: formStatus,
        assignedFacultyName: formFacultyName
      });
      showToast(`New subject "${formName}" added successfully!`);
    }
    setIsModalOpen(false);
  };

  const handleDeleteSubject = (subjectId, subjectName) => {
    if (window.confirm(`Are you sure you want to delete subject "${subjectName}"? This will remove all associated chapters and topics.`)) {
      curriculumService.deleteSubject(subjectId);
      showToast(`Subject "${subjectName}" deleted.`);
    }
  };

  const handleMoveOrder = (subjectId, direction) => {
    curriculumService.moveSubjectOrder(subjectId, direction);
  };

  // Helper to resolve icon component
  const getSubjectIcon = (iconName) => {
    const item = AVAILABLE_ICONS.find(i => i.name === iconName);
    return item ? item.icon : BookOpen;
  };

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
            <Link 
              to="/admin/exams"
              className="text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-wider flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to All Exams</span>
            </Link>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
              Level 2 • Subject Modules
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{selectedExam.flag}</span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {selectedExam.name} — Subjects
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            Manage medical discipline modules for <strong>{selectedExam.name}</strong>. 
            Click <strong>"Manage Chapters ➡️"</strong> on any subject to explore its syllabus units and clinical topics.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm shadow-indigo-600/20 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Subject Module</span>
        </button>
      </div>

      {/* Exam Switcher Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {exams.map((exam) => {
          const isCurrent = exam.id === selectedExamId;
          const subCount = subjects.filter(s => s.examId === exam.id).length;
          return (
            <button
              key={exam.id}
              onClick={() => navigate(`/admin/exams/${exam.id}/subjects`)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2.5 shrink-0 cursor-pointer border ${
                isCurrent
                  ? 'bg-white text-indigo-700 border-indigo-200 shadow-sm ring-2 ring-indigo-500/10'
                  : 'bg-white/60 text-slate-600 border-slate-200/80 hover:bg-white hover:text-slate-900'
              }`}
            >
              <span className="text-base">{exam.flag}</span>
              <span>{exam.name}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                isCurrent ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'
              }`}>
                {subCount}
              </span>
            </button>
          );
        })}
      </div>

      {/* Toolbar: Search, Status Filter, View Toggle */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search subjects or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          {/* Status Filters */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
            {['all', 'Active', 'Draft'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer text-[11px] ${
                  statusFilter === st
                    ? 'bg-white text-indigo-700 shadow-2xs font-extrabold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {st === 'all' ? 'All Subjects' : st}
              </button>
            ))}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-400'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-400'
              }`}
              title="Table View"
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {examSubjects.map((subject, idx) => {
            const IconComponent = getSubjectIcon(subject.icon);
            const subjectChapters = chapters.filter(c => c.subjectId === subject.id);
            const subjectTopics = topics.filter(t => t.subjectId === subject.id);
            const colorMeta = AVAILABLE_COLORS.find(c => c.id === subject.color) || AVAILABLE_COLORS[0];

            return (
              <div
                key={subject.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between overflow-hidden group"
              >
                <div className="p-5 space-y-4">
                  {/* Top: Icon + Code + Reorder + Status */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl ${colorMeta.bg} ${colorMeta.text} border ${colorMeta.border} flex items-center justify-center shadow-2xs shrink-0`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                          {subject.code || `MOD-0${idx + 1}`}
                        </span>
                        <h3 className="text-base font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {subject.name}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleMoveOrder(subject.id, 'up')}
                        disabled={idx === 0}
                        className="p-1 rounded text-slate-300 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveOrder(subject.id, 'down')}
                        disabled={idx === examSubjects.length - 1}
                        className="p-1 rounded text-slate-300 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {subject.description || 'Clinical module covering core pathophysiology and cases.'}
                  </p>

                  {/* Faculty Specialist Assignment */}
                  <div className="bg-slate-50 p-2.5 rounded-xl text-xs space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Assigned Faculty Lead
                    </span>
                    <div className="font-bold text-slate-800 text-xs truncate">
                      {subject.assignedFacultyName || 'Dr. Siddharth V. (AIIMS)'}
                    </div>
                  </div>

                  {/* Counts Row */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                    <div className="bg-indigo-50/50 p-2 rounded-xl border border-indigo-100/60">
                      <span className="text-[10px] text-indigo-700 font-bold block uppercase">Chapters</span>
                      <span className="text-xs font-extrabold text-indigo-900">{subjectChapters.length} Units</span>
                    </div>
                    <div className="bg-emerald-50/50 p-2 rounded-xl border border-emerald-100/60">
                      <span className="text-[10px] text-emerald-700 font-bold block uppercase">Topics</span>
                      <span className="text-xs font-extrabold text-emerald-900">{subjectTopics.length} Topics</span>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(subject)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-white transition-colors cursor-pointer"
                      title="Edit Subject"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteSubject(subject.id, subject.name)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-white transition-colors cursor-pointer"
                      title="Delete Subject"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* LEVEL 3 DRILLDOWN ACTION */}
                  <Link
                    to={`/admin/exams/${selectedExamId}/subjects/${subject.id}/chapters`}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                  >
                    <span>Manage Chapters</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}

          {examSubjects.length === 0 && (
            <div className="col-span-full bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4">
              <Layers className="w-12 h-12 text-slate-300 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-800">No Subject Modules Found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  No subjects match your query for {selectedExam.name}. Click below to add the first subject module.
                </p>
              </div>
              <button
                onClick={handleOpenCreateModal}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
              >
                + Add First Subject
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Subject Module</th>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Faculty Lead</th>
                <th className="py-3 px-4 text-center">Chapters</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {examSubjects.map((subject) => {
                const IconComponent = getSubjectIcon(subject.icon);
                const colorMeta = AVAILABLE_COLORS.find(c => c.id === subject.color) || AVAILABLE_COLORS[0];
                const count = chapters.filter(c => c.subjectId === subject.id).length;

                return (
                  <tr key={subject.id} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg ${colorMeta.bg} ${colorMeta.text} flex items-center justify-center shrink-0`}>
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <Link
                          to={`/admin/exams/${selectedExamId}/subjects/${subject.id}/chapters`}
                          className="font-extrabold hover:text-indigo-600 transition-colors"
                        >
                          {subject.name}
                        </Link>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-500">{subject.code}</td>
                    <td className="py-3.5 px-4 text-slate-700">{subject.assignedFacultyName || 'Faculty Lead'}</td>
                    <td className="py-3.5 px-4 text-center font-bold text-indigo-600">{count} Units</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                        {subject.status || 'Active'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/admin/exams/${selectedExamId}/subjects/${subject.id}/chapters`}
                        className="inline-flex items-center gap-1 text-indigo-600 font-bold hover:underline"
                      >
                        <span>Manage Chapters</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Subject Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-lg font-black text-slate-900">
                {editingSubject ? 'Edit Subject Module' : `Add Subject to ${selectedExam.name}`}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubject} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Subject Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cardiology & Hemodynamics"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Subject Code</label>
                  <input
                    type="text"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    placeholder="e.g. CARD-101"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Color Theme</label>
                  <select
                    value={formColor}
                    onChange={(e) => setFormColor(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-800"
                  >
                    {AVAILABLE_COLORS.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Icon Representative</label>
                <div className="grid grid-cols-3 gap-2">
                  {AVAILABLE_ICONS.map(i => {
                    const IconComp = i.icon;
                    const isSelected = formIcon === i.name;
                    return (
                      <button
                        key={i.name}
                        type="button"
                        onClick={() => setFormIcon(i.name)}
                        className={`p-2 rounded-xl border flex items-center gap-2 transition-all text-left cursor-pointer ${
                          isSelected 
                            ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-bold ring-2 ring-indigo-500/10' 
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <IconComp className="w-4 h-4 shrink-0" />
                        <span className="text-[10px] truncate">{i.label.split('/')[0]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Assigned Faculty Specialist</label>
                <input
                  type="text"
                  value={formFacultyName}
                  onChange={(e) => setFormFacultyName(e.target.value)}
                  placeholder="e.g. Dr. Siddharth V. (AIIMS)"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-800"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Module Description</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-800"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-sm cursor-pointer"
                >
                  {editingSubject ? 'Save Changes' : 'Create Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
