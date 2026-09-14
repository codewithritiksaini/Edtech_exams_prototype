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
  Sparkles,
  ArrowRight,
  Filter,
  GraduationCap,
  Award,
  DollarSign,
  Gauge
} from 'lucide-react';
import { catalogService } from '../../services/catalogService';
import { curriculumService } from '../../services/curriculumService';
import { COUNTRIES_LIST } from '../../data/countriesData';

const PRESET_AUDIENCES = [
  'Medical Students',
  'IMGs',
  'FMGs',
  'Interns & MBBS Graduates',
  'Resident Doctors',
  'Licensed Specialists'
];

const CURRENCIES = ['USD', 'INR', 'GBP', 'EUR', 'AUD', 'CAD'];
const DIFFICULTIES = ['Low', 'Moderate', 'Moderate–High', 'High', 'Very High'];

const getDifficultyBadge = (difficulty) => {
  switch (difficulty) {
    case 'Very High':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'High':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'Moderate–High':
    case 'Moderate-High':
      return 'bg-amber-50 text-amber-800 border-amber-200';
    case 'Moderate':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'Low':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
};

export default function AdminExamsPage() {
  const navigate = useNavigate();
  const [exams, setExams] = useState(() => catalogService.getExams());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountryFilter, setSelectedCountryFilter] = useState('all');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards' (default is table)

  // Modal / Drawer State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [deletingExam, setDeletingExam] = useState(null);
  const [forceDeleteConfirm, setForceDeleteConfirm] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // The 15 Parameters (strictly these and no other fields in form)
  // 1. Full Name
  const [formFullName, setFormFullName] = useState('');
  // 2. Country
  const [formCountry, setFormCountry] = useState('United States');
  // 3. Authority
  const [formAuthority, setFormAuthority] = useState('');
  // 4. For (Multi-select / Checkbox)
  const [formFor, setFormFor] = useState([]);
  const [formCustomFor, setFormCustomFor] = useState('');
  // 5. Purpose
  const [formPurpose, setFormPurpose] = useState('');
  // 6. Stages
  const [formStages, setFormStages] = useState(1);
  // 7. Exam Structure
  const [formExamStructure, setFormExamStructure] = useState('');
  // 8. Step 1 / Part 1
  const [formStep1, setFormStep1] = useState('');
  // 9. Step 2 / Part 2
  const [formStep2, setFormStep2] = useState('');
  // 10. Final Step
  const [formFinalStep, setFormFinalStep] = useState('');
  // 11. English Requirement
  const [formEnglishRequirement, setFormEnglishRequirement] = useState('');
  // 12. 2026 Starting Fee (Number + Currency Dropdown)
  const [formFeeAmount, setFormFeeAmount] = useState('');
  const [formFeeCurrency, setFormFeeCurrency] = useState('USD');
  // 13. Career Path
  const [formCareerPath, setFormCareerPath] = useState('');
  // 14. Difficulty
  const [formDifficulty, setFormDifficulty] = useState('Moderate');
  // 15. Best For
  const [formBestFor, setFormBestFor] = useState('');

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
    setFormFullName('');
    setFormCountry('United States');
    setFormAuthority('');
    setFormFor(['Medical Students', 'IMGs']);
    setFormCustomFor('');
    setFormPurpose('');
    setFormStages(3);
    setFormExamStructure('');
    setFormStep1('');
    setFormStep2('');
    setFormFinalStep('');
    setFormEnglishRequirement('');
    setFormFeeAmount('');
    setFormFeeCurrency('USD');
    setFormCareerPath('');
    setFormDifficulty('Moderate');
    setFormBestFor('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (exam) => {
    setEditingExam(exam);
    setFormFullName(exam.fullName || exam.name || '');
    setFormCountry(exam.country || 'United States');
    setFormAuthority(exam.authority || '');
    setFormFor(Array.isArray(exam.forAudience) ? exam.forAudience : (exam.for ? [exam.for] : []));
    setFormCustomFor('');
    setFormPurpose(exam.purpose || '');
    setFormStages(exam.stages || 1);
    setFormExamStructure(exam.examStructure || '');
    setFormStep1(exam.step1 || '');
    setFormStep2(exam.step2 || '');
    setFormFinalStep(exam.finalStep || '');
    setFormEnglishRequirement(exam.englishRequirement || '');
    setFormFeeAmount(exam.feeAmount !== undefined ? exam.feeAmount : '');
    setFormFeeCurrency(exam.feeCurrency || 'USD');
    setFormCareerPath(exam.careerPath || '');
    setFormDifficulty(exam.difficulty || 'Moderate');
    setFormBestFor(exam.bestFor || '');
    setIsModalOpen(true);
  };

  const toggleAudience = (audience) => {
    setFormFor(prev => 
      prev.includes(audience) 
        ? prev.filter(item => item !== audience)
        : [...prev, audience]
    );
  };

  const addCustomAudience = (e) => {
    e.preventDefault();
    const trimmed = formCustomFor.trim();
    if (trimmed && !formFor.includes(trimmed)) {
      setFormFor(prev => [...prev, trimmed]);
      setFormCustomFor('');
    }
  };

  const handleSaveExam = (e) => {
    e.preventDefault();
    if (!formFullName.trim()) {
      alert('Please provide Full Name for the exam track.');
      return;
    }

    const payload = {
      name: formFullName.trim(),
      fullName: formFullName.trim(),
      country: formCountry,
      authority: formAuthority.trim(),
      forAudience: formFor,
      purpose: formPurpose.trim(),
      stages: Number(formStages) || 1,
      examStructure: formExamStructure.trim(),
      step1: formStep1.trim(),
      step2: formStep2.trim(),
      finalStep: formFinalStep.trim(),
      englishRequirement: formEnglishRequirement.trim(),
      feeAmount: Number(formFeeAmount) || 0,
      feeCurrency: formFeeCurrency,
      careerPath: formCareerPath.trim(),
      difficulty: formDifficulty,
      bestFor: formBestFor.trim()
    };

    if (editingExam) {
      catalogService.updateExam(editingExam.id, payload);
      showToast(`Updated exam "${formFullName}" successfully!`);
    } else {
      const generatedId = formFullName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      catalogService.createExam({
        id: generatedId || `exam-${Date.now()}`,
        ...payload,
        packagesCount: 0,
        enrolledStudents: 0,
        status: 'Active'
      });
      showToast(`Created new exam "${formFullName}" successfully!`);
    }

    setIsModalOpen(false);
  };

  const handleToggleStatus = (examId) => {
    const exam = catalogService.getExamById(examId);
    if (!exam) return;
    const nextStatus = exam.status === 'Active' ? 'Inactive' : 'Active';
    catalogService.updateExam(examId, { status: nextStatus });
    showToast(`Exam "${exam.fullName || exam.name}" status changed to ${nextStatus}.`);
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
    showToast(`Exam track "${deletingExam.fullName || deletingExam.name}" deleted successfully.`);
    setDeletingExam(null);
    setForceDeleteConfirm(false);
  };

  // Filtered exams
  const filteredExams = useMemo(() => {
    return exams.filter((exam) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        !q ||
        (exam.fullName && exam.fullName.toLowerCase().includes(q)) ||
        (exam.name && exam.name.toLowerCase().includes(q)) ||
        (exam.country && exam.country.toLowerCase().includes(q)) ||
        (exam.authority && exam.authority.toLowerCase().includes(q)) ||
        (exam.bestFor && exam.bestFor.toLowerCase().includes(q)) ||
        (exam.purpose && exam.purpose.toLowerCase().includes(q));
      
      const matchesCountry = selectedCountryFilter === 'all' || exam.country === selectedCountryFilter;

      return matchesSearch && matchesCountry;
    });
  }, [exams, searchQuery, selectedCountryFilter]);

  // Unique countries present in the current catalog for filter pills
  const catalogCountries = useMemo(() => {
    const set = new Set(exams.map(e => e.country).filter(Boolean));
    return Array.from(set);
  }, [exams]);

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
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Exams & Curriculum Tracks
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure licensing exam programs, eligibility, structure, fees, and career pathways
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
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto flex-1">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search exam, authority, country, or purpose..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Country Dropdown Filter */}
          <div className="relative w-full sm:w-56">
            <select
              value={selectedCountryFilter}
              onChange={(e) => setSelectedCountryFilter(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">All Countries</option>
              {catalogCountries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs shrink-0 self-end sm:self-auto">
          <button
            onClick={() => setViewMode('table')}
            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
              viewMode === 'table' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Table
          </button>
          <button
            onClick={() => setViewMode('cards')}
            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
              viewMode === 'cards' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Cards
          </button>
        </div>
      </div>

      {/* Grid of Exam Cards */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExams.map((exam) => {
            const subjectsCount = curriculumService.getSubjects(exam.id).length;
            const modulesCount = curriculumService.getModules(null, exam.id).length;
            const difficultyCls = getDifficultyBadge(exam.difficulty);

            return (
              <div
                key={exam.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between overflow-hidden group"
              >
                <div className="p-5 space-y-3.5">
                  {/* Top Bar: Country & Status Toggle */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200/60">
                      {exam.country}
                    </span>
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

                  {/* Title & Authority */}
                  <div className="space-y-1">
                    <h3 className="text-base font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                      {exam.fullName || exam.name}
                    </h3>
                    {exam.authority && (
                      <p className="text-[11px] font-bold text-indigo-600">
                        {exam.authority}
                      </p>
                    )}
                  </div>

                  {/* Purpose */}
                  {exam.purpose && (
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {exam.purpose}
                    </p>
                  )}

                  {/* Key Parameter Badges: Difficulty, Fee, Stages */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {exam.difficulty && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${difficultyCls}`}>
                        {exam.difficulty}
                      </span>
                    )}
                    {(exam.feeAmount !== undefined && exam.feeAmount !== null && exam.feeAmount !== '') && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        Fee: {exam.feeCurrency} {Number(exam.feeAmount).toLocaleString()}
                      </span>
                    )}
                    {exam.stages && (
                      <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                        {exam.stages} Stages
                      </span>
                    )}
                  </div>

                  {/* For: Target Audience */}
                  {Array.isArray(exam.forAudience) && exam.forAudience.length > 0 && (
                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Target Candidates</span>
                      <div className="flex flex-wrap gap-1">
                        {exam.forAudience.slice(0, 3).map((aud, i) => (
                          <span key={i} className="text-[10px] bg-slate-50 text-slate-600 border border-slate-200 px-1.5 py-0.5 rounded">
                            {aud}
                          </span>
                        ))}
                        {exam.forAudience.length > 3 && (
                          <span className="text-[10px] text-slate-400 self-center">
                            +{exam.forAudience.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Metrics Badges: Subjects & Modules */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                    <div className="bg-slate-50 p-2 rounded-xl">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Subjects</span>
                      <span className="text-xs font-extrabold text-slate-800">{subjectsCount} Modules</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Modules</span>
                      <span className="text-xs font-extrabold text-slate-800">{modulesCount} Units</span>
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
                <th className="py-3 px-4">Exam Track & Authority</th>
                <th className="py-3 px-4">Country</th>
                <th className="py-3 px-4 text-center">Stages</th>
                <th className="py-3 px-4">Difficulty</th>
                <th className="py-3 px-4">2026 Starting Fee</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExams.map((exam) => (
                <tr key={exam.id} className="hover:bg-indigo-50/30 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    <div>
                      <Link 
                        to={`/admin/subjects?exam=${exam.id}`}
                        className="font-extrabold text-slate-900 hover:text-indigo-600 transition-colors"
                      >
                        {exam.fullName || exam.name}
                      </Link>
                      <p className="text-[11px] text-slate-500 font-medium">{exam.authority || exam.purpose}</p>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 font-semibold">{exam.country}</td>
                  <td className="py-3.5 px-4 text-center font-bold text-indigo-700">
                    {exam.stages || 1} Stages
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getDifficultyBadge(exam.difficulty)}`}>
                      {exam.difficulty || 'Moderate'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-800">
                    {exam.feeCurrency || 'USD'} {Number(exam.feeAmount || 0).toLocaleString()}
                  </td>
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

      {/* ======================================================================= */}
      {/* SLIDE-OVER DRAWER: STRICTLY THE 15 SPECIFIED FORM FIELDS               */}
      {/* ======================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            onClick={() => setIsModalOpen(false)}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity cursor-pointer"
          />

          {/* Slide-over Drawer Panel */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10 pointer-events-none">
            <div className="w-screen max-w-xl sm:max-w-2xl bg-white shadow-2xl flex flex-col pointer-events-auto animate-in slide-in-from-right duration-300">

              {/* Drawer Header */}
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/90 shrink-0">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                    <h2 className="text-base sm:text-lg font-black text-slate-900">
                      {editingExam ? 'Edit Exam Track' : 'Create New Exam Track'}
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500">
                    Fill in the official parameters and structure below to {editingExam ? 'update' : 'create'} this program.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
                  title="Close Drawer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Scrollable Body: Exactly 15 Form Fields */}
              <form onSubmit={handleSaveExam} id="exam-drawer-form" className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
                
                {/* SECTION 1: PROGRAM IDENTITY & ELIGIBILITY */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100">
                    <GraduationCap className="w-4 h-4 text-indigo-600" />
                    <span className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px]">
                      1. Program Identity & Eligibility
                    </span>
                  </div>

                  {/* 1. Full Name */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. United States Medical Licensing Examination"
                      value={formFullName}
                      onChange={(e) => setFormFullName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  {/* 2. Country & 3. Authority */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-700">Country *</label>
                      <select
                        value={formCountry}
                        onChange={(e) => setFormCountry(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      >
                        {COUNTRIES_LIST.map(c => (
                          <option key={c.code} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-700">Authority</label>
                      <input
                        type="text"
                        placeholder="e.g. USMLE / FSMB / ECFMG"
                        value={formAuthority}
                        onChange={(e) => setFormAuthority(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  {/* 4. For (Multi-select / Checkbox) */}
                  <div className="space-y-2">
                    <label className="font-bold text-slate-700">For (Target Candidate Groups)</label>
                    <div className="flex flex-wrap gap-1.5">
                      {PRESET_AUDIENCES.map((aud) => {
                        const isSelected = formFor.includes(aud);
                        return (
                          <button
                            key={aud}
                            type="button"
                            onClick={() => toggleAudience(aud)}
                            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                              isSelected 
                                ? 'bg-indigo-50 text-indigo-700 border-indigo-300 shadow-2xs' 
                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            <span className={`w-3.5 h-3.5 rounded flex items-center justify-center border text-[9px] ${
                              isSelected ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-300'
                            }`}>
                              {isSelected ? '✓' : ''}
                            </span>
                            <span>{aud}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Custom Add tag if needed */}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        placeholder="Add another audience group..."
                        value={formCustomFor}
                        onChange={(e) => setFormCustomFor(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addCustomAudience(e);
                          }
                        }}
                        className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                      <button
                        type="button"
                        onClick={addCustomAudience}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                      >
                        Add
                      </button>
                    </div>

                    {/* Selected non-preset tags display */}
                    {formFor.filter(f => !PRESET_AUDIENCES.includes(f)).length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {formFor.filter(f => !PRESET_AUDIENCES.includes(f)).map((f, i) => (
                          <span key={i} className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-lg text-[11px] font-bold">
                            <span>{f}</span>
                            <button type="button" onClick={() => toggleAudience(f)} className="hover:text-rose-600">×</button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 5. Purpose */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">Purpose</label>
                    <textarea
                      rows={2}
                      placeholder="e.g. U.S. Medical Licensing & Residency"
                      value={formPurpose}
                      onChange={(e) => setFormPurpose(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
                    />
                  </div>
                </div>

                {/* SECTION 2: STRUCTURE & STAGES */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100">
                    <Layers className="w-4 h-4 text-indigo-600" />
                    <span className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px]">
                      2. Structure & Examination Stages
                    </span>
                  </div>

                  {/* 6. Stages & 7. Exam Structure */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-700">Stages</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        placeholder="e.g. 3"
                        value={formStages}
                        onChange={(e) => setFormStages(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>

                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="font-bold text-slate-700">Exam Structure</label>
                      <input
                        type="text"
                        placeholder="e.g. Step 1 → Step 2 CK → Step 3"
                        value={formExamStructure}
                        onChange={(e) => setFormExamStructure(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  {/* 8. Step 1 / Part 1 */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">Step 1 / Part 1</label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Basic Medical Sciences"
                      value={formStep1}
                      onChange={(e) => setFormStep1(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
                    />
                  </div>

                  {/* 9. Step 2 / Part 2 */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">Step 2 / Part 2</label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Clinical Knowledge"
                      value={formStep2}
                      onChange={(e) => setFormStep2(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
                    />
                  </div>

                  {/* 10. Final Step */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">Final Step</label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Step 3"
                      value={formFinalStep}
                      onChange={(e) => setFormFinalStep(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
                    />
                  </div>
                </div>

                {/* SECTION 3: PREREQUISITES & FEES */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100">
                    <DollarSign className="w-4 h-4 text-indigo-600" />
                    <span className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px]">
                      3. Prerequisites & Fees
                    </span>
                  </div>

                  {/* 11. English Requirement */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">English Requirement</label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Not specific to USMLE (or IELTS 7.5 / OET Grade B)"
                      value={formEnglishRequirement}
                      onChange={(e) => setFormEnglishRequirement(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
                    />
                  </div>

                  {/* 12. 2026 Starting Fee (Number + Currency Dropdown) */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">2026 Starting Fee</label>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2">
                        <input
                          type="number"
                          min="0"
                          placeholder="e.g. 695"
                          value={formFeeAmount}
                          onChange={(e) => setFormFeeAmount(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <select
                          value={formFeeCurrency}
                          onChange={(e) => setFormFeeCurrency(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        >
                          {CURRENCIES.map(curr => (
                            <option key={curr} value={curr}>{curr}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECTION 4: CAREER & POSITIONING */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100">
                    <Award className="w-4 h-4 text-indigo-600" />
                    <span className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px]">
                      4. Career Path & Positioning
                    </span>
                  </div>

                  {/* 13. Career Path */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">Career Path</label>
                    <textarea
                      rows={2}
                      placeholder="e.g. ECFMG → Residency → Practice"
                      value={formCareerPath}
                      onChange={(e) => setFormCareerPath(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
                    />
                  </div>

                  {/* 14. Difficulty & 15. Best For */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-700">Difficulty</label>
                      <select
                        value={formDifficulty}
                        onChange={(e) => setFormDifficulty(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      >
                        {DIFFICULTIES.map(diff => (
                          <option key={diff} value={diff}>{diff}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-700">Best For</label>
                      <input
                        type="text"
                        placeholder="e.g. Doctors targeting USA"
                        value={formBestFor}
                        onChange={(e) => setFormBestFor(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>

              </form>

              {/* Drawer Sticky Footer */}
              <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/90 flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 font-bold hover:bg-slate-200/60 transition-colors cursor-pointer text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="exam-drawer-form"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-sm shadow-indigo-600/20 transition-all cursor-pointer text-xs"
                >
                  {editingExam ? 'Save Changes' : 'Create Exam Track'}
                </button>
              </div>

            </div>
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

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <h4 className="text-xs font-bold text-slate-900">{deletingExam.fullName || deletingExam.name}</h4>
              <p className="text-[11px] text-slate-500">{deletingExam.country} • {deletingExam.authority || 'Licensing Program'}</p>
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
