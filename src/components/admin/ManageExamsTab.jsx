import React, { useState, useEffect } from 'react';
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
  ShieldAlert,
  Sparkles,
  ChevronRight,
  Filter
} from 'lucide-react';
import { catalogService } from '../../services/catalogService';

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

export default function ManageExamsTab() {
  const [exams, setExams] = useState(() => catalogService.getExams());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegionFilter, setSelectedRegionFilter] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  
  // Safety Deletion Warning Modal
  const [safetyModalOpen, setSafetyModalOpen] = useState(false);
  const [safetyWarningData, setSafetyWarningData] = useState(null);

  // Success Notification
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

  const handleFlagSelect = (item) => {
    setFormFlag(item.flag);
    setFormCountry(item.country);
  };

  const handleSaveExam = (e) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert('Please enter a valid Exam Name.');
      return;
    }

    const matchedFlagObj = AVAILABLE_FLAGS.find(f => f.country === formCountry) || AVAILABLE_FLAGS[0];

    const examData = {
      ...(editingExam ? { id: editingExam.id } : {}),
      name: formName.trim(),
      country: formCountry,
      flag: formFlag,
      regionCode: matchedFlagObj.regionCode,
      currency: matchedFlagObj.currency,
      tag: formTag,
      description: formDescription,
      weeks: Number(formWeeks),
      status: formStatus
    };

    catalogService.saveExam(examData);
    setExams(catalogService.getExams());
    setIsModalOpen(false);
    showToast(editingExam ? `Exam "${formName}" updated successfully!` : `New exam category "${formName}" created and synced!`);
  };

  const handleToggleStatus = (id) => {
    catalogService.toggleExamStatus(id);
    setExams(catalogService.getExams());
    showToast('Exam active status updated.');
  };

  const handleDeleteClick = (exam) => {
    const result = catalogService.deleteExam(exam.id);
    if (!result.success) {
      setSafetyWarningData({
        exam,
        reason: result.reason
      });
      setSafetyModalOpen(true);
    } else {
      setExams(catalogService.getExams());
      showToast(`Exam "${exam.name}" removed from catalog.`);
    }
  };

  const handleDeactivateInstead = () => {
    if (!safetyWarningData?.exam) return;
    catalogService.toggleExamStatus(safetyWarningData.exam.id);
    setExams(catalogService.getExams());
    setSafetyModalOpen(false);
    showToast(`Exam "${safetyWarningData.exam.name}" deactivated successfully instead of deleting.`);
  };

  // Filtered list
  const filteredExams = exams.filter(exam => {
    const matchesSearch = exam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          exam.country.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRegion = selectedRegionFilter === 'all' || 
                          (selectedRegionFilter === 'active' && exam.status === 'Active') ||
                          (selectedRegionFilter === 'inactive' && exam.status === 'Inactive') ||
                          exam.country.toLowerCase().includes(selectedRegionFilter.toLowerCase());
    return matchesSearch && matchesRegion;
  });

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Toast Banner */}
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
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold mb-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              <span>Core Product Catalog (Phase 5.2)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Manage Medical Exam Tracks
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Create and manage primary exam categories. Whatever is activated here reflects directly on the student Homepage.
            </p>
          </div>

          <button 
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add New Exam</span>
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Search exam name or country..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filter:
            </span>
            <select
              value={selectedRegionFilter}
              onChange={(e) => setSelectedRegionFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">All Exams ({exams.length})</option>
              <option value="active">Active Only ({exams.filter(e => e.status === 'Active').length})</option>
              <option value="inactive">Inactive Only ({exams.filter(e => e.status === 'Inactive').length})</option>
              <option value="India">India</option>
              <option value="United States">United States</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="Europe">Europe</option>
            </select>
          </div>
        </div>

        {/* Exams Table (Classic CMS View) */}
        <div className="overflow-x-auto border border-slate-200 rounded-2xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-bold">
                <th className="py-3 px-4">Exam Track & Flag</th>
                <th className="py-3 px-4">Region / Country</th>
                <th className="py-3 px-4 text-center">Packages</th>
                <th className="py-3 px-4 text-center">Enrolled Students</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExams.map((exam) => (
                <tr key={exam.id} className="hover:bg-slate-50/60 transition-colors">
                  {/* Exam Name */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl shrink-0">{exam.flag}</span>
                      <div>
                        <div className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                          <span>{exam.name}</span>
                          {exam.popular && (
                            <span className="text-[10px] bg-amber-100 text-amber-800 font-extrabold px-1.5 py-0.2 rounded">
                              HOT
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-1 max-w-xs">
                          {exam.description}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Country */}
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold text-[11px]">
                      <Globe2 className="w-3 h-3 text-slate-400" />
                      <span>{exam.country}</span>
                    </span>
                  </td>

                  {/* Packages Count */}
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold text-[11px]">
                      <Layers className="w-3 h-3 text-indigo-600" />
                      <span>{exam.packagesCount || 3} Tiers</span>
                    </span>
                  </td>

                  {/* Enrolled Students */}
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px]">
                      <Users className="w-3 h-3 text-slate-400" />
                      <span>{(exam.enrolledStudents || 0).toLocaleString()} Doctors</span>
                    </span>
                  </td>

                  {/* Status Toggle Switch (Data Toggle) */}
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => handleToggleStatus(exam.id)}
                      title={`Click to switch to ${exam.status === 'Active' ? 'Inactive' : 'Active'}`}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold cursor-pointer transition-all ${
                        exam.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                          : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${exam.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                      <span>{exam.status}</span>
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEditModal(exam)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                        title="Edit Exam"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteClick(exam)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete / Deactivate Exam"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredExams.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                    No matching exams found for query "{searchQuery}".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Informative Hint Banner */}
        <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold">Catalog Dependency Rule (Phase 5.2):</span>
            <p className="text-amber-800 text-[11px]">
              Exams marked as <strong>Inactive</strong> are automatically hidden from the student-facing Homepage. 
              Packages and faculty content can only be created under active exams.
            </p>
          </div>
        </div>

      </div>

      {/* ======================================================================= */}
      {/* SLIDE-OVER DRAWER: ADD / EDIT EXAM                                      */}
      {/* ======================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity cursor-pointer"
            onClick={() => setIsModalOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
            <div className="w-screen max-w-lg bg-white shadow-2xl border-l border-slate-200 flex flex-col h-full animate-in slide-in-from-right duration-300">
              
              {/* Sticky Header */}
              <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white sticky top-0 z-10">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                    {editingExam ? 'Edit Exam Track' : 'Create New Category'}
                  </span>
                  <h3 className="text-lg font-black text-slate-900 mt-1">
                    {editingExam ? `Edit "${editingExam.name}"` : 'Add New Medical Exam Track'}
                  </h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Form */}
              <form onSubmit={handleSaveExam} className="flex-1 flex flex-col min-h-0">
                <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs">
                  
                  {/* Exam Name */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Exam Title / Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. AMC (Australian Medical Council)"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  {/* Country / Region Selection (Flag automatically associated) */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Country / Target Region *</label>
                    <select
                      value={formCountry}
                      onChange={(e) => {
                        const matched = AVAILABLE_FLAGS.find(f => f.country === e.target.value);
                        if (matched) {
                          setFormCountry(matched.country);
                          setFormFlag(matched.flag);
                        }
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white cursor-pointer"
                    >
                      {AVAILABLE_FLAGS.map((f, i) => (
                        <option key={i} value={f.country}>
                          {f.flag} {f.country}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Short Description */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">
                      Short Description (Shown on Homepage Card) *
                    </label>
                    <textarea
                      rows={2}
                      required
                      placeholder="Targeted clinical guidelines, mock CBT tests, and high-yield question solving..."
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  {/* Accreditation Tag & Status Toggle */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Accreditation Tag</label>
                      <input
                        type="text"
                        placeholder="e.g. GMC Approved"
                        value={formTag}
                        onChange={(e) => setFormTag(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-semibold text-slate-900 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Catalog Visibility</label>
                      <button
                        type="button"
                        onClick={() => setFormStatus(formStatus === 'Active' ? 'Draft' : 'Active')}
                        className={`w-full py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          formStatus === 'Active' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                            : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}
                      >
                        {formStatus === 'Active' ? <Check className="w-3.5 h-3.5" /> : null}
                        <span>{formStatus === 'Active' ? 'Active on Catalog' : 'Draft / Inactive'}</span>
                      </button>
                    </div>
                  </div>

                </div>

                {/* Sticky Footer */}
                <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/90 shrink-0 flex items-center justify-end gap-2 sticky bottom-0 z-10">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs cursor-pointer"
                  >
                    {editingExam ? 'Save Changes' : 'Create Exam Track'}
                  </button>
                </div>
              </form>

            </div>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* SLIDE-OVER DRAWER: SAFETY DELETION WARNING                              */}
      {/* ======================================================================= */}
      {safetyModalOpen && safetyWarningData && (
        <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in">
          <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity cursor-pointer"
            onClick={() => setSafetyModalOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl border-l border-rose-200 flex flex-col h-full animate-in slide-in-from-right duration-300">
              
              {/* Header */}
              <div className="p-5 sm:p-6 border-b border-rose-100 flex items-center justify-between shrink-0 bg-white sticky top-0 z-10">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      Cannot Delete Exam Track
                    </h3>
                    <p className="text-xs text-rose-700 font-bold">
                      "{safetyWarningData.exam.name}"
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSafetyModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs">
                <p className="text-slate-600 leading-relaxed">
                  {safetyWarningData.reason}
                </p>

                <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900">
                  Deleting this exam would break active packages, student study plans, and historical mock test records. 
                  Instead, toggle its status to <strong>Inactive</strong> to safely remove it from the public homepage.
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/90 shrink-0 flex items-center justify-end gap-2 sticky bottom-0 z-10">
                <button
                  onClick={() => setSafetyModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-100 cursor-pointer text-xs"
                >
                  Close
                </button>
                <button
                  onClick={handleDeactivateInstead}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs cursor-pointer"
                >
                  Deactivate Exam Instead
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
