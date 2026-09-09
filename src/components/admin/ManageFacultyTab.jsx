import React, { useState, useEffect, useRef } from 'react';
import { 
  GraduationCap, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  X, 
  BookOpen, 
  ShieldAlert, 
  Video, 
  FileText, 
  Sparkles, 
  Filter, 
  Mail, 
  Key,
  Layers,
  Calendar,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Check
} from 'lucide-react';
import { peopleService } from '../../services/peopleService';
import { catalogService } from '../../services/catalogService';
import { curriculumService } from '../../services/curriculumService';

export default function ManageFacultyTab() {
  const [facultyList, setFacultyList] = useState(() => peopleService.getFacultyList());
  const [catalogExams, setCatalogExams] = useState(() => catalogService.getExams());
  const [searchQuery, setSearchQuery] = useState('');
  const [examFilter, setExamFilter] = useState('all');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);
  
  // Protective Deletion Warning Modal
  const [safetyModalOpen, setSafetyModalOpen] = useState(false);
  const [safetyWarningData, setSafetyWarningData] = useState(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState('');

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('demo123');
  const [formSpecialty, setFormSpecialty] = useState('MD Clinical Specialist');
  const [formSelectedExams, setFormSelectedExams] = useState(['neet-pg']);
  const [formSelectedSubjects, setFormSelectedSubjects] = useState(['sub-neet-cardio']);
  const [formWeeks, setFormWeeks] = useState('Weeks 1–4 (Core Concepts)');
  const [formStatus, setFormStatus] = useState('Active');

  // Multi-Select Dropdown States
  const [isExamDropdownOpen, setIsExamDropdownOpen] = useState(false);
  const [isSubjectDropdownOpen, setIsSubjectDropdownOpen] = useState(false);
  const [subjectDropdownSearch, setSubjectDropdownSearch] = useState('');
  const examDropdownRef = useRef(null);
  const subjectDropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (examDropdownRef.current && !examDropdownRef.current.contains(event.target)) {
        setIsExamDropdownOpen(false);
      }
      if (subjectDropdownRef.current && !subjectDropdownRef.current.contains(event.target)) {
        setIsSubjectDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const unsubscribe = peopleService.subscribe((payload) => {
      setFacultyList(payload.faculty);
    });
    return unsubscribe;
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleOpenCreateModal = () => {
    setEditingFaculty(null);
    setFormName('');
    setFormEmail('');
    setFormPassword('demo123');
    setFormSpecialty('MD Clinical Specialist');
    setFormSelectedExams(['neet-pg']);
    const defaultSubs = curriculumService.getSubjectsByExam('neet-pg') || [];
    setFormSelectedSubjects(defaultSubs.length > 0 ? [defaultSubs[0].id] : []);
    setFormWeeks('Weeks 1–4 (Cardiology & Clinical Vignettes)');
    setFormStatus('Active');
    setIsExamDropdownOpen(false);
    setIsSubjectDropdownOpen(false);
    setSubjectDropdownSearch('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (fac) => {
    setEditingFaculty(fac);
    setFormName(fac.name);
    setFormEmail(fac.email);
    setFormPassword('demo123');
    setFormSpecialty(fac.specialty);
    setFormSelectedExams([...(fac.assignedExams || ['neet-pg'])]);
    setFormSelectedSubjects([...(fac.assignedSubjects || [])]);
    setFormWeeks(fac.assignedWeeks || 'All Weeks');
    setFormStatus(fac.status);
    setIsExamDropdownOpen(false);
    setIsSubjectDropdownOpen(false);
    setSubjectDropdownSearch('');
    setIsModalOpen(true);
  };

  const handleToggleSubject = (subjectId) => {
    setFormSelectedSubjects(prev => {
      if (prev.includes(subjectId)) {
        return prev.filter(id => id !== subjectId);
      } else {
        return [...prev, subjectId];
      }
    });
  };

  const handleSelectAllSubjectsForExam = (examId) => {
    const examSubs = curriculumService.getSubjectsByExam(examId) || [];
    const examSubIds = examSubs.map(s => s.id);
    setFormSelectedSubjects(prev => {
      const remaining = prev.filter(id => !examSubIds.includes(id));
      return [...remaining, ...examSubIds];
    });
  };

  const handleDeselectAllSubjectsForExam = (examId) => {
    const examSubs = curriculumService.getSubjectsByExam(examId) || [];
    const examSubIds = examSubs.map(s => s.id);
    setFormSelectedSubjects(prev => prev.filter(id => !examSubIds.includes(id)));
  };

  const handleToggleExamInForm = (examId) => {
    setFormSelectedExams(prev => {
      let next;
      if (prev.includes(examId)) {
        if (prev.length === 1) return prev; // keep at least 1
        next = prev.filter(id => id !== examId);
        // Also remove subjects belonging to this unselected exam
        const removedExamSubs = curriculumService.getSubjectsByExam(examId) || [];
        const removedIds = removedExamSubs.map(s => s.id);
        setFormSelectedSubjects(curr => curr.filter(id => !removedIds.includes(id)));
      } else {
        next = [...prev, examId];
        // Automatically pre-select first subject of newly added exam
        const addedSubs = curriculumService.getSubjectsByExam(examId) || [];
        if (addedSubs.length > 0) {
          setFormSelectedSubjects(curr => [...curr, addedSubs[0].id]);
        }
      }
      return next;
    });
  };

  const handleSaveFaculty = (e) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) {
      alert('Please fill out Faculty Name and valid Email.');
      return;
    }

    if (formSelectedSubjects.length === 0) {
      alert('Please select at least one teaching subject for this faculty member.');
      return;
    }

    const matchedLabels = formSelectedExams.map(id => {
      const ex = catalogExams.find(e => e.id === id);
      return ex?.name || id.toUpperCase();
    });

    const facultyData = {
      ...(editingFaculty ? { id: editingFaculty.id } : {}),
      name: formName.trim(),
      email: formEmail.trim().toLowerCase(),
      specialty: formSpecialty,
      assignedExams: formSelectedExams,
      assignedExamsLabels: matchedLabels,
      assignedSubjects: formSelectedSubjects,
      assignedWeeks: formWeeks,
      status: formStatus
    };

    peopleService.saveFaculty(facultyData);
    setFacultyList(peopleService.getFacultyList());
    setIsModalOpen(false);
    showToast(
      editingFaculty 
        ? `Faculty profile "${formName}" updated with ${formSelectedSubjects.length} subject(s)!` 
        : `Faculty "${formName}" provisioned with ${formSelectedSubjects.length} subject(s)! Login enabled for ${formEmail.trim().toLowerCase()}`
    );
  };

  const handleToggleStatus = (id) => {
    peopleService.toggleFacultyStatus(id);
    setFacultyList(peopleService.getFacultyList());
    showToast('Faculty active status toggled.');
  };

  const handleRemoveClick = (fac) => {
    const result = peopleService.removeFaculty(fac.id);
    if (!result.success) {
      setSafetyWarningData(result);
      setSafetyModalOpen(true);
    } else {
      setFacultyList(peopleService.getFacultyList());
      showToast(`Faculty member "${fac.name}" removed.`);
    }
  };

  const handleDeactivateInstead = () => {
    if (!safetyWarningData?.faculty) return;
    peopleService.toggleFacultyStatus(safetyWarningData.faculty.id);
    setFacultyList(peopleService.getFacultyList());
    setSafetyModalOpen(false);
    showToast(`Faculty member "${safetyWarningData.faculty.name}" deactivated instead.`);
  };

  // Filtered Faculty
  const filteredFaculty = facultyList.filter(fac => {
    const matchesSearch = fac.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          fac.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          fac.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesExam = examFilter === 'all' || 
                        fac.assignedExams?.includes(examFilter);
    return matchesSearch && matchesExam;
  });

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="flex items-center gap-2 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold shadow-xs transition-all">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold mb-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-amber-600" />
              <span>Admin-Only Portal Provisioning (Phase 5.3)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Manage Faculty Specialists & Scope
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Provision clinician accounts. Faculty created here can immediately log in through the single unified login form.
            </p>
          </div>

          <button 
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Faculty</span>
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Search faculty name, email, MD specialty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white"
            />
          </div>

          {/* Exam Filter Dropdown */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-bold text-slate-400 shrink-0 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filter by Track:
            </span>
            <select
              value={examFilter}
              onChange={(e) => setExamFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">All Assigned Tracks ({facultyList.length})</option>
              <option value="neet-pg">🇮🇳 NEET PG & NExT</option>
              <option value="usmle">🇺🇸 USMLE Step 1 & 2</option>
              <option value="plab">🇬🇧 PLAB 1 & 2</option>
              <option value="europe">🇪🇺 Europe Licensing</option>
            </select>
          </div>

        </div>

        {/* Faculty Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-2xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-bold">
                <th className="py-3 px-4">Faculty Specialist</th>
                <th className="py-3 px-4">Login Email</th>
                <th className="py-3 px-4">Assigned Exam(s) & Subject(s)</th>
                <th className="py-3 px-4">Granular Scope</th>
                <th className="py-3 px-4 text-center">Content Uploaded</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredFaculty.map((fac) => (
                <tr key={fac.id} className="hover:bg-slate-50/60 transition-colors">
                  
                  {/* Name & Specialty */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={fac.avatar} 
                        alt={fac.name} 
                        className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0" 
                      />
                      <div>
                        <div className="font-bold text-slate-900 text-xs sm:text-sm">
                          {fac.name}
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium">
                          {fac.specialty}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Login Email */}
                  <td className="py-3.5 px-4">
                    <span className="font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded text-[11px] flex items-center gap-1 w-fit">
                      <Mail className="w-3 h-3 text-slate-400" />
                      {fac.email}
                    </span>
                  </td>

                  {/* Assigned Exams & Subjects (Badges) */}
                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap gap-1">
                        {fac.assignedExamsLabels?.map((label, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold border border-indigo-100 text-[10px]">
                            {label}
                          </span>
                        ))}
                      </div>
                      {fac.assignedSubjects && fac.assignedSubjects.length > 0 ? (
                        <div className="flex flex-wrap items-center gap-1">
                          {fac.assignedSubjects.slice(0, 3).map((subId) => {
                            const sub = curriculumService.getSubjectById(subId);
                            return sub ? (
                              <span key={subId} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[9.5px] border border-slate-200/80">
                                {sub.name}
                              </span>
                            ) : null;
                          })}
                          {fac.assignedSubjects.length > 3 && (
                            <span className="text-[9.5px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                              +{fac.assignedSubjects.length - 3} more
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[10px] text-amber-600 font-medium italic">
                          No subjects assigned
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Granular Scope */}
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-slate-700 text-xs flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                      {fac.assignedWeeks}
                    </span>
                  </td>

                  {/* Content Uploaded Count */}
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-bold text-[11px] border border-emerald-200">
                      <FileText className="w-3 h-3 text-emerald-600" />
                      <span>{fac.contentUploadedCount || 0} Units</span>
                    </span>
                  </td>

                  {/* Status Toggle Switch */}
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => handleToggleStatus(fac.id)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold cursor-pointer transition-all ${
                        fac.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                          : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${fac.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                      <span>{fac.status}</span>
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEditModal(fac)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                        title="Edit Faculty Scope"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRemoveClick(fac)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Remove Faculty"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>

                </tr>
              ))}

              {filteredFaculty.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                    No faculty found matching the query "{searchQuery}".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Informative Banner */}
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-[11px] text-amber-800 leading-relaxed">
            <strong>Unified Login Connectivity (Phase 5.1):</strong> When a faculty specialist logs in using their registered email, the platform auto-detects their account role and automatically scopes their sidebar to only their assigned exams.
          </p>
        </div>

      </div>

      {/* ======================================================================= */}
      {/* DRAWER: ADD / EDIT FACULTY                                              */}
      {/* ======================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity cursor-pointer"
            onClick={() => setIsModalOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
            <div className="w-screen max-w-xl bg-white shadow-2xl border-l border-slate-200 flex flex-col h-full animate-in slide-in-from-right duration-300">
              
              {/* Drawer Sticky Header */}
              <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white sticky top-0 z-10">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                    {editingFaculty ? 'Edit Faculty Scope' : 'Add New Faculty Member'}
                  </span>
                  <h3 className="text-lg font-black text-slate-900 mt-1">
                    {editingFaculty ? `Edit "${editingFaculty.name}"` : 'Provision Faculty Specialist'}
                  </h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveFaculty} className="flex-1 flex flex-col min-h-0">
                <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs">
                  {/* Name & Specialty */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Faculty Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Dr. Rajesh Sharma"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Clinical Specialty *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. MD Neurology (NIMHANS)"
                        value={formSpecialty}
                        onChange={(e) => setFormSpecialty(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                  </div>

                  {/* Login Email & Password */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 flex items-center justify-between">
                        <span>Login Email *</span>
                        <span className="text-[10px] text-indigo-600 font-semibold">Single Login ID</span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. sharma.neuro@demo.com"
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Initial Password</label>
                      <input
                        type="text"
                        value={formPassword}
                        onChange={(e) => setFormPassword(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                  </div>

                  {/* 1. Assign Exam Category Scope - Multi-Select Dropdown */}
                  <div className="space-y-1.5 pt-1" ref={examDropdownRef}>
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-800 text-xs">
                        Assign Exam Category Scope (Multi-Select Dropdown) *
                      </label>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {formSelectedExams.length} Selected
                      </span>
                    </div>

                    <div className="relative">
                      {/* Trigger Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setIsExamDropdownOpen(prev => !prev);
                          setIsSubjectDropdownOpen(false);
                        }}
                        className={`w-full min-h-[44px] px-3.5 py-2 rounded-xl border bg-white text-left transition-all flex items-center justify-between gap-2 cursor-pointer ${
                          isExamDropdownOpen 
                            ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs' 
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0">
                          {formSelectedExams.length === 0 ? (
                            <span className="text-slate-400 text-xs">Select Exam Tracks...</span>
                          ) : (
                            formSelectedExams.map(examId => {
                              const ex = catalogExams.find(e => e.id === examId) || { id: examId, name: examId.toUpperCase() };
                              return (
                                <span
                                  key={examId}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-900 border border-indigo-200 text-xs font-bold shrink-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleExamInForm(examId);
                                  }}
                                >
                                  <span>{ex.flag}</span>
                                  <span>{ex.name}</span>
                                  <X className="w-3 h-3 text-indigo-400 hover:text-indigo-700 cursor-pointer" />
                                </span>
                              );
                            })
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-slate-400 shrink-0 ml-2">
                          {isExamDropdownOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </button>

                      {/* Dropdown Menu */}
                      {isExamDropdownOpen && (
                        <div className="absolute top-full left-0 right-0 mt-1 z-40 bg-white rounded-2xl border border-slate-200 shadow-xl p-2.5 space-y-1.5 animate-in fade-in slide-in-from-top-1">
                          <div className="flex items-center justify-between px-2 py-1 text-[11px] font-bold text-slate-500 border-b border-slate-100 pb-1.5">
                            <span>Available Exam Tracks</span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  const allIds = catalogExams.map(e => e.id);
                                  setFormSelectedExams(allIds);
                                }}
                                className="text-indigo-600 hover:underline cursor-pointer"
                              >
                                Select All ({catalogExams.length})
                              </button>
                              <span>•</span>
                              <button
                                type="button"
                                onClick={() => {
                                  if (catalogExams.length > 0) {
                                    setFormSelectedExams([catalogExams[0].id]);
                                  }
                                }}
                                className="text-slate-400 hover:underline cursor-pointer"
                              >
                                Reset
                              </button>
                            </div>
                          </div>

                          <div className="max-h-56 overflow-y-auto space-y-1 p-0.5">
                            {catalogExams.map((exam) => {
                              const isChecked = formSelectedExams.includes(exam.id);
                              return (
                                <div
                                  key={exam.id}
                                  onClick={() => handleToggleExamInForm(exam.id)}
                                  className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                                    isChecked
                                      ? 'bg-indigo-50/80 border-indigo-200 text-indigo-950 font-bold'
                                      : 'bg-white border-transparent hover:bg-slate-50 text-slate-700'
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5">
                                    <span className="text-xl">{exam.flag}</span>
                                    <div>
                                      <div className="text-xs font-bold text-slate-900 leading-snug">{exam.name}</div>
                                      <div className="text-[10px] text-slate-400">{exam.region} • {curriculumService.getSubjectsByExam(exam.id)?.length || 0} Subjects</div>
                                    </div>
                                  </div>
                                  <div className={`w-4 h-4 rounded flex items-center justify-center text-[10px] font-bold ${
                                    isChecked ? 'bg-indigo-600 text-white' : 'border border-slate-300 text-transparent'
                                  }`}>
                                    ✓
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          <div className="pt-1.5 border-t border-slate-100 flex justify-end">
                            <button
                              type="button"
                              onClick={() => setIsExamDropdownOpen(false)}
                              className="px-3 py-1 bg-indigo-600 text-white font-bold text-xs rounded-lg hover:bg-indigo-700 cursor-pointer"
                            >
                              Done
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 2. Assign Teaching Subject(s) - Multi-Select Dropdown */}
                  <div className="space-y-1.5 pt-2" ref={subjectDropdownRef}>
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="font-bold text-slate-800 text-xs block">
                          Assign Teaching Subject(s) (Multi-Select Dropdown) *
                        </label>
                        <span className="text-[11px] text-slate-500">
                          Faculty will only get teaching & authoring access to the subjects selected below.
                        </span>
                      </div>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0">
                        {formSelectedSubjects.length} Selected
                      </span>
                    </div>

                    <div className="relative">
                      {/* Trigger Button */}
                      <button
                        type="button"
                        onClick={() => {
                          if (formSelectedExams.length > 0) {
                            setIsSubjectDropdownOpen(prev => !prev);
                            setIsExamDropdownOpen(false);
                          }
                        }}
                        className={`w-full min-h-[44px] px-3.5 py-2 rounded-xl border bg-white text-left transition-all flex items-center justify-between gap-2 ${
                          formSelectedExams.length === 0
                            ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed'
                            : isSubjectDropdownOpen
                            ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs cursor-pointer'
                            : 'border-slate-200 hover:border-slate-300 cursor-pointer'
                        }`}
                      >
                        <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0">
                          {formSelectedExams.length === 0 ? (
                            <span className="text-slate-400 text-xs italic">Please select an exam track above first...</span>
                          ) : formSelectedSubjects.length === 0 ? (
                            <span className="text-slate-400 text-xs">Click to select teaching subject(s)...</span>
                          ) : (
                            <>
                              {formSelectedSubjects.slice(0, 3).map(subId => {
                                const allSubs = curriculumService.getSubjects ? curriculumService.getSubjects() : [];
                                const sub = allSubs.find(s => s.id === subId) || { id: subId, name: subId };
                                return (
                                  <span
                                    key={subId}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-900 border border-indigo-200 text-xs font-bold shrink-0"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleToggleSubject(subId);
                                    }}
                                  >
                                    <Layers className="w-3 h-3 text-indigo-600 shrink-0" />
                                    <span className="truncate max-w-[140px]">{sub.name}</span>
                                    <X className="w-3 h-3 text-indigo-400 hover:text-indigo-700 cursor-pointer shrink-0" />
                                  </span>
                                );
                              })}
                              {formSelectedSubjects.length > 3 && (
                                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
                                  +{formSelectedSubjects.length - 3} more
                                </span>
                              )}
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-slate-400 shrink-0 ml-2">
                          {isSubjectDropdownOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </button>

                      {/* Dropdown Menu */}
                      {isSubjectDropdownOpen && formSelectedExams.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 z-40 bg-white rounded-2xl border border-slate-200 shadow-xl p-3 space-y-2.5 animate-in fade-in slide-in-from-top-1">
                          {/* Search Input inside Dropdown */}
                          <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                              <input
                                type="text"
                                placeholder="Filter subjects by name or code..."
                                value={subjectDropdownSearch}
                                onChange={(e) => setSubjectDropdownSearch(e.target.value)}
                                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-slate-50"
                              />
                            </div>
                            {subjectDropdownSearch && (
                              <button
                                type="button"
                                onClick={() => setSubjectDropdownSearch('')}
                                className="text-xs text-slate-400 hover:text-slate-600 px-1 font-bold"
                              >
                                Clear
                              </button>
                            )}
                          </div>

                          {/* Quick Global Action Header */}
                          <div className="flex items-center justify-between px-1 text-[11px] font-bold text-slate-500 border-b border-slate-100 pb-1.5">
                            <span>Subjects by Track</span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  const allAvailableSubs = formSelectedExams.flatMap(examId => curriculumService.getSubjectsByExam(examId) || []);
                                  const allSubIds = allAvailableSubs.map(s => s.id);
                                  setFormSelectedSubjects(allSubIds);
                                }}
                                className="text-indigo-600 hover:underline cursor-pointer"
                              >
                                Select All
                              </button>
                              <span>•</span>
                              <button
                                type="button"
                                onClick={() => setFormSelectedSubjects([])}
                                className="text-slate-400 hover:underline cursor-pointer"
                              >
                                Clear All
                              </button>
                            </div>
                          </div>

                          {/* Grouped Subjects Scrollable List */}
                          <div className="max-h-60 overflow-y-auto space-y-3 p-1 divide-y divide-slate-100">
                            {formSelectedExams.map(examId => {
                              const exam = catalogExams.find(e => e.id === examId) || { id: examId, name: examId.toUpperCase() };
                              const allExamSubjects = curriculumService.getSubjectsByExam(examId) || [];
                              const filteredExamSubjects = allExamSubjects.filter(sub => 
                                !subjectDropdownSearch ||
                                sub.name.toLowerCase().includes(subjectDropdownSearch.toLowerCase()) ||
                                (sub.code && sub.code.toLowerCase().includes(subjectDropdownSearch.toLowerCase()))
                              );
                              const selectedInThisExam = allExamSubjects.filter(s => formSelectedSubjects.includes(s.id)).length;

                              return (
                                <div key={examId} className="pt-2.5 first:pt-0 space-y-1.5">
                                  {/* Track Group Header */}
                                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 px-1">
                                    <div className="flex items-center gap-1.5">
                                      <span>{exam.flag}</span>
                                      <span className="text-slate-900">{exam.name}</span>
                                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-100 font-extrabold">
                                        {selectedInThisExam} of {allExamSubjects.length} selected
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1 text-[10px]">
                                      <button
                                        type="button"
                                        onClick={() => handleSelectAllSubjectsForExam(examId)}
                                        className="text-indigo-600 hover:underline cursor-pointer font-bold"
                                      >
                                        All
                                      </button>
                                      <span className="text-slate-300">|</span>
                                      <button
                                        type="button"
                                        onClick={() => handleDeselectAllSubjectsForExam(examId)}
                                        className="text-slate-400 hover:underline cursor-pointer"
                                      >
                                        None
                                      </button>
                                    </div>
                                  </div>

                                  {/* Subject items */}
                                  {filteredExamSubjects.length === 0 ? (
                                    <div className="text-[11px] text-slate-400 italic px-2 py-1">
                                      {subjectDropdownSearch ? 'No matching subjects found in this track.' : 'No subjects configured yet.'}
                                    </div>
                                  ) : (
                                    <div className="space-y-1">
                                      {filteredExamSubjects.map(sub => {
                                        const isChecked = formSelectedSubjects.includes(sub.id);
                                        return (
                                          <div
                                            key={sub.id}
                                            onClick={() => handleToggleSubject(sub.id)}
                                            className={`p-2 rounded-xl border flex items-center justify-between gap-2 cursor-pointer transition-all ${
                                              isChecked
                                                ? 'bg-indigo-50/90 border-indigo-200 text-indigo-950 font-bold shadow-2xs'
                                                : 'bg-white border-transparent hover:bg-slate-50 text-slate-700'
                                            }`}
                                          >
                                            <div className="flex items-center gap-2 min-w-0">
                                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                                                {sub.code || 'SUB'}
                                              </span>
                                              <span className="text-xs font-semibold truncate">{sub.name}</span>
                                            </div>
                                            <div className={`w-4 h-4 rounded shrink-0 flex items-center justify-center text-[10px] font-bold ${
                                              isChecked ? 'bg-indigo-600 text-white' : 'border border-slate-300 text-transparent'
                                            }`}>
                                              ✓
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {/* Dropdown Footer */}
                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                            <span className="text-slate-500 font-medium">
                              {formSelectedSubjects.length} subject{formSelectedSubjects.length !== 1 ? 's' : ''} assigned
                            </span>
                            <button
                              type="button"
                              onClick={() => setIsSubjectDropdownOpen(false)}
                              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-colors cursor-pointer"
                            >
                              Done
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Selected Subjects Quick-View Badges Bar (shown below dropdown for fast review) */}
                    {formSelectedSubjects.length > 0 && !isSubjectDropdownOpen && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {formSelectedSubjects.map(subId => {
                          const allSubs = curriculumService.getSubjects ? curriculumService.getSubjects() : [];
                          const sub = allSubs.find(s => s.id === subId) || { id: subId, name: subId };
                          return (
                            <span
                              key={subId}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold border border-slate-200/80 transition-colors"
                            >
                              <span>{sub.name}</span>
                              <X 
                                className="w-3 h-3 text-slate-400 hover:text-red-500 cursor-pointer" 
                                onClick={() => handleToggleSubject(subId)}
                              />
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Granular Scope (Weeks/Days) */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">
                      Granular Curriculum Scope (Weeks / Days) *
                    </label>
                    <select
                      value={formWeeks}
                      onChange={(e) => setFormWeeks(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                      <option value="All Weeks">All Weeks (Complete Course Curriculum)</option>
                      <option value="Weeks 1–4 (Cardiology & ECG)">Weeks 1–4 (Cardiology & ECG)</option>
                      <option value="Weeks 5–8 (Neurology & Pharmacology)">Weeks 5–8 (Neurology & Pharmacology)</option>
                      <option value="Weeks 9–12 (General Surgery & Trauma)">Weeks 9–12 (General Surgery & Trauma)</option>
                      <option value="Weeks 13–16 (Pediatrics & OBGYN)">Weeks 13–16 (Pediatrics & OBGYN)</option>
                    </select>
                  </div>

                  {/* Status Toggle */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="font-bold text-slate-700">Account Status:</span>
                    <button
                      type="button"
                      onClick={() => setFormStatus(formStatus === 'Active' ? 'Inactive' : 'Active')}
                      className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                        formStatus === 'Active' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {formStatus === 'Active' ? '✓ Active Clinician' : '✕ Inactive (Suspended)'}
                    </button>
                  </div>

                  {/* Content Preservation Notice */}
                  {editingFaculty && (
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>
                        This faculty member has authored active materials in the curriculum. 
                        Changing permissions preserves existing uploaded notes, diagrams, and CBT tests.
                      </span>
                    </div>
                  )}
                </div>

                {/* Drawer Sticky Footer */}
                <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/90 flex items-center justify-end gap-2 shrink-0 sticky bottom-0 z-10">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs cursor-pointer"
                  >
                    {editingFaculty ? 'Save Changes' : 'Provision Faculty'}
                  </button>
                </div>
              </form>

            </div>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* DRAWER: PROTECTIVE WARNING WHEN REMOVING FACULTY WITH CONTENT           */}
      {/* ======================================================================= */}
      {safetyModalOpen && safetyWarningData && (
        <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity cursor-pointer"
            onClick={() => setSafetyModalOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col h-full animate-in slide-in-from-right duration-300">
              
              {/* Drawer Header */}
              <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white sticky top-0 z-10">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <button
                  onClick={() => setSafetyModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Scrollable Body */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs">
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-slate-900">
                    Faculty Member Has Uploaded Content
                  </h3>
                  <p className="text-xs text-amber-800 font-bold">
                    "{safetyWarningData.faculty.name}"
                  </p>
                  <p className="text-xs text-slate-600 pt-1 leading-relaxed">
                    {safetyWarningData.reason}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-700">
                  To preserve published day modules and student bookmark history, do not delete this profile. 
                  Instead, toggle status to <strong>Inactive</strong> to suspend platform login.
                </div>
              </div>

              {/* Drawer Sticky Footer */}
              <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/90 flex items-center justify-end gap-2 shrink-0 sticky bottom-0 z-10">
                <button
                  onClick={() => setSafetyModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 font-bold text-xs text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeactivateInstead}
                  className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs cursor-pointer"
                >
                  Deactivate Faculty Instead
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
