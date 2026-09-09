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
  Gauge,
  ShieldCheck
} from 'lucide-react';
import { catalogService } from '../../services/catalogService';
import { curriculumService } from '../../services/curriculumService';
import { peopleService } from '../../services/peopleService';
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

export default function FacultyExamsPage() {
  const navigate = useNavigate();
  const [exams, setExams] = useState(() => catalogService.getExams());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountryFilter, setSelectedCountryFilter] = useState('all');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards' (default is table)

  const currentFaculty = peopleService.getCurrentFacultyProfile();
  const assignedSubjectIds = currentFaculty?.assignedSubjects || [];
  const assignedExamsList = currentFaculty?.assignedExams || [];

  // Modal / Drawer State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [deletingExam, setDeletingExam] = useState(null);
  const [forceDeleteConfirm, setForceDeleteConfirm] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // 15 Parameters for Add/Edit
  const [formFullName, setFormFullName] = useState('');
  const [formCountry, setFormCountry] = useState('United States');
  const [formAuthority, setFormAuthority] = useState('');
  const [formFor, setFormFor] = useState([]);
  const [formCustomFor, setFormCustomFor] = useState('');
  const [formPurpose, setFormPurpose] = useState('');
  const [formStages, setFormStages] = useState(1);
  const [formExamStructure, setFormExamStructure] = useState('');
  const [formStep1, setFormStep1] = useState('');
  const [formStep2, setFormStep2] = useState('');
  const [formFinalStep, setFormFinalStep] = useState('');
  const [formEnglishRequirement, setFormEnglishRequirement] = useState('');
  const [formFeeAmount, setFormFeeAmount] = useState('');
  const [formFeeCurrency, setFormFeeCurrency] = useState('USD');
  const [formCareerPath, setFormCareerPath] = useState('');
  const [formDifficulty, setFormDifficulty] = useState('Moderate');
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
      // Auto-assign created exam to current faculty profile
      if (currentFaculty && generatedId) {
        const currentAssigned = currentFaculty.assignedExams || [];
        if (!currentAssigned.includes(generatedId)) {
          peopleService.updateFaculty(currentFaculty.id, {
            assignedExams: [...currentAssigned, generatedId]
          });
        }
      }
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

  // Helper: Strictly check if an exam is assigned to current faculty
  const isExamAssigned = (exam) => {
    if (!exam) return false;
    if (assignedExamsList.includes(exam.id)) return true;
    const subjects = curriculumService.getSubjects(exam.id) || [];
    return subjects.some(s => 
      assignedSubjectIds.includes(s.id) || 
      (currentFaculty?.email && s.facultyEmail === currentFaculty.email) ||
      (currentFaculty?.name && s.assignedFacultyName && s.assignedFacultyName.toLowerCase().includes(currentFaculty.name.toLowerCase().split(' ')[0]))
    );
  };

  // Base list of exams strictly restricted to assigned only
  const assignedExams = useMemo(() => {
    return exams.filter(isExamAssigned);
  }, [exams, assignedExamsList, assignedSubjectIds, currentFaculty]);

  // Filtered exams by search and country
  const filteredExams = useMemo(() => {
    return assignedExams.filter((exam) => {
      const q = searchQuery.toLowerCase().trim();
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
  }, [assignedExams, searchQuery, selectedCountryFilter]);

  // Unique countries present in assigned exams
  const catalogCountries = useMemo(() => {
    const set = new Set(assignedExams.map(e => e.country).filter(Boolean));
    return Array.from(set);
  }, [assignedExams]);

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
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Faculty Academic Hierarchy • Level 1
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
              Assigned Licensing Tracks
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Exams & Curriculum Tracks
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure and explore licensing exam programs, curriculum structure, and faculty departmental assignments.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm shadow-indigo-600/20 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Exam Track</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto flex-1">
          <div className="relative w-full sm:w-72">
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
          <div className="relative w-full sm:w-48">
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

          {/* Scope Indicator Badge */}
          <div className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 text-indigo-700 px-3 py-1.5 rounded-xl text-xs font-bold shrink-0">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>Assigned Programs ({filteredExams.length})</span>
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

      {/* Grid of Exam Cards or Table */}
      {filteredExams.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-200/80 shadow-2xs text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-base font-black text-slate-900">No Assigned Exam Programs Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            No licensing programs matching your search filters are assigned to your faculty profile.
          </p>
        </div>
      ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExams.map((exam) => {
            const allExamSubjects = curriculumService.getSubjects(exam.id) || [];
            const assignedSubjectsInExam = allExamSubjects.filter(s => 
              assignedSubjectIds.includes(s.id) || 
              (currentFaculty?.email && s.facultyEmail === currentFaculty.email) ||
              (currentFaculty?.name && s.assignedFacultyName && s.assignedFacultyName.toLowerCase().includes(currentFaculty.name.toLowerCase().split(' ')[0]))
            );
            const assignedSubjectIdsInExam = assignedSubjectsInExam.map(s => s.id);
            const assignedChaptersCount = curriculumService.getChapters(null, exam.id)
              .filter(c => assignedSubjectIdsInExam.includes(c.subjectId)).length;
            const difficultyCls = getDifficultyBadge(exam.difficulty);

            return (
              <div
                key={exam.id}
                className="bg-white rounded-2xl border shadow-2xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group border-indigo-200 ring-1 ring-indigo-50 hover:border-indigo-400"
              >
                <div className="p-5 space-y-3.5">
                  {/* Top Bar: Country, Assigned Badge & Status */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200/60">
                        {exam.country}
                      </span>
                      <span className="text-[10px] font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                        Assigned Track
                      </span>
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

                  {/* Metrics Badges: Assigned Subjects & Chapters */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                    <div className="bg-slate-50 p-2 rounded-xl">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Assigned Subjects</span>
                      <span className="text-xs font-extrabold text-indigo-600">{assignedSubjectsInExam.length} Modules</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Chapters</span>
                      <span className="text-xs font-extrabold text-slate-800">{assignedChaptersCount} Units</span>
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
                    to={`/faculty/exams/${exam.id}/subjects`}
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
                <th className="py-3 px-4 text-center">My Subjects</th>
                <th className="py-3 px-4 text-center">Stages</th>
                <th className="py-3 px-4">Difficulty</th>
                <th className="py-3 px-4">2026 Starting Fee</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExams.map((exam) => {
                const allExamSubjects = curriculumService.getSubjects(exam.id) || [];
                const assignedSubjectsInExam = allExamSubjects.filter(s => 
                  assignedSubjectIds.includes(s.id) || 
                  (currentFaculty?.email && s.facultyEmail === currentFaculty.email) ||
                  (currentFaculty?.name && s.assignedFacultyName && s.assignedFacultyName.toLowerCase().includes(currentFaculty.name.toLowerCase().split(' ')[0]))
                );
                const difficultyCls = getDifficultyBadge(exam.difficulty);

                return (
                  <tr key={exam.id} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div>
                        <div className="flex items-center gap-2">
                          <Link 
                            to={`/faculty/exams/${exam.id}/subjects`}
                            className="font-extrabold text-slate-900 hover:text-indigo-600 transition-colors text-xs"
                          >
                            {exam.fullName || exam.name}
                          </Link>
                          <span className="text-[9.5px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                            Assigned
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium">{exam.authority || exam.purpose}</p>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-700 font-semibold">
                      <span className="bg-slate-100 px-2 py-0.5 rounded-md text-[11px] text-slate-700 border border-slate-200/60">
                        {exam.country || 'International'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center font-bold">
                      <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-extrabold text-[11px] border border-indigo-100">
                        {assignedSubjectsInExam.length} Modules
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px]">
                        {exam.stages || 1} Stages
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      {exam.difficulty ? (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${difficultyCls}`}>
                          {exam.difficulty}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-emerald-700">
                      {(exam.feeAmount !== undefined && exam.feeAmount !== null && exam.feeAmount !== '') ? (
                        <span>{exam.feeCurrency} {Number(exam.feeAmount).toLocaleString()}</span>
                      ) : (
                        <span className="text-slate-400 font-normal">N/A</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center">
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
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(exam)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Edit Exam"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenDeleteModal(exam)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Exam"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <Link
                          to={`/faculty/exams/${exam.id}/subjects`}
                          className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white font-bold text-[11px] transition-colors ml-1 inline-flex items-center gap-1"
                        >
                          <span>Subjects</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ======================================================================= */}
      {/* 15-PARAMETER MODAL: ADD / EDIT EXAM TRACK                               */}
      {/* ======================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95">
            {/* Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    {editingExam ? 'Edit Exam Track' : 'Add New Exam Program'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Enter syllabus structure, authority, stages, and eligibility metadata
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form */}
            <form onSubmit={handleSaveExam} className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
              {/* 1. Full Name */}
              <div>
                <label className="font-extrabold text-slate-700 block mb-1">
                  1. Full Name of Exam Track <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. United States Medical Licensing Examination (USMLE)"
                  value={formFullName}
                  onChange={(e) => setFormFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              {/* 2 & 3. Country & Authority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">
                    2. Country / Jurisdiction <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formCountry}
                    onChange={(e) => setFormCountry(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
                  >
                    {COUNTRIES_LIST.map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">
                    3. Regulatory Authority / Council
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. FSMB & NBME, GMC, NMC"
                    value={formAuthority}
                    onChange={(e) => setFormAuthority(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* 4. For (Audience Multi-Select) */}
              <div>
                <label className="font-extrabold text-slate-700 block mb-1.5">
                  4. For (Candidate Audience Checkboxes)
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {PRESET_AUDIENCES.map((aud) => {
                    const isSelected = formFor.includes(aud);
                    return (
                      <button
                        type="button"
                        key={aud}
                        onClick={() => toggleAudience(aud)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer border ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {isSelected ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3 text-slate-400" />}
                        <span>{aud}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Add custom candidate audience..."
                    value={formCustomFor}
                    onChange={(e) => setFormCustomFor(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                  <button
                    type="button"
                    onClick={addCustomAudience}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                  >
                    Add Tag
                  </button>
                </div>
              </div>

              {/* 5. Purpose */}
              <div>
                <label className="font-extrabold text-slate-700 block mb-1">
                  5. Purpose of the Exam
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Licensing examination for medical practitioners to practice medicine in the United States."
                  value={formPurpose}
                  onChange={(e) => setFormPurpose(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 leading-relaxed"
                />
              </div>

              {/* 6 & 7. Stages & Exam Structure */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">
                    6. Number of Stages
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formStages}
                    onChange={(e) => setFormStages(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">
                    7. Exam Structure Overview
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Step 1 (MCQ), Step 2 CK (Clinical), Step 3 (FIP/ACM)"
                    value={formExamStructure}
                    onChange={(e) => setFormExamStructure(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              {/* 8, 9, 10. Step 1, Step 2, Final Step */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    8. Step 1 / Part 1
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Basic Sciences & Pathology"
                    value={formStep1}
                    onChange={(e) => setFormStep1(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 font-medium focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    9. Step 2 / Part 2
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Clinical Knowledge (CK)"
                    value={formStep2}
                    onChange={(e) => setFormStep2(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 font-medium focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    10. Final Step / Certification
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Step 3 or OSCE Clinical"
                    value={formFinalStep}
                    onChange={(e) => setFormFinalStep(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 font-medium focus:outline-none"
                  />
                </div>
              </div>

              {/* 11. English Requirement & 12. Starting Fee */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">
                    11. English Requirement
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. OET Medicine (Grade B) / IELTS 7.5"
                    value={formEnglishRequirement}
                    onChange={(e) => setFormEnglishRequirement(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">
                    12. 2026 Starting Fee
                  </label>
                  <div className="flex items-center gap-2">
                    <select
                      value={formFeeCurrency}
                      onChange={(e) => setFormFeeCurrency(e.target.value)}
                      className="w-24 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-700 focus:outline-none cursor-pointer"
                    >
                      {CURRENCIES.map(curr => (
                        <option key={curr} value={curr}>{curr}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      placeholder="e.g. 1000"
                      value={formFeeAmount}
                      onChange={(e) => setFormFeeAmount(e.target.value)}
                      className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>
              </div>

              {/* 13. Career Path */}
              <div>
                <label className="font-extrabold text-slate-700 block mb-1">
                  13. Post-Exam Career Path
                </label>
                <input
                  type="text"
                  placeholder="e.g. US Residency Match (ERAS/NRMP) leading to Board Certification"
                  value={formCareerPath}
                  onChange={(e) => setFormCareerPath(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              {/* 14. Difficulty & 15. Best For */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">
                    14. Difficulty Level
                  </label>
                  <select
                    value={formDifficulty}
                    onChange={(e) => setFormDifficulty(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-700 focus:outline-none cursor-pointer"
                  >
                    {DIFFICULTIES.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">
                    15. Best For Summary Tag
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. High-earning US clinical residency"
                    value={formBestFor}
                    onChange={(e) => setFormBestFor(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              {/* Footer CTA */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 font-bold hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                >
                  {editingExam ? 'Save Changes' : 'Create Exam Track'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* DELETE CONFIRMATION MODAL                                               */}
      {/* ======================================================================= */}
      {deletingExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-slate-900">
                {forceDeleteConfirm ? 'Cascade Delete Required' : 'Delete Exam Program?'}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {forceDeleteConfirm ? (
                  <span className="text-rose-600 font-semibold">
                    This exam program has associated curriculum subjects and units. Deleting will cascade and remove all child subjects and syllabus.
                  </span>
                ) : (
                  `Are you sure you want to remove "${deletingExam.fullName || deletingExam.name}"? This action can be undone only by restoring defaults.`
                )}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => {
                  setDeletingExam(null);
                  setForceDeleteConfirm(false);
                }}
                className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100 transition-colors text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirmDelete(forceDeleteConfirm)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm shadow-rose-600/20 transition-all cursor-pointer"
              >
                {forceDeleteConfirm ? 'Confirm Cascade Delete' : 'Delete Exam'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
