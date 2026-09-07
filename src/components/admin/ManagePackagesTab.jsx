import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  X, 
  FileText, 
  Video, 
  Brain, 
  Radio, 
  Sparkles, 
  DollarSign, 
  Clock, 
  ShieldCheck, 
  Filter,
  Check,
  AlertCircle
} from 'lucide-react';
import { catalogService } from '../../services/catalogService';

export default function ManagePackagesTab() {
  const [exams, setExams] = useState(() => catalogService.getExams());
  const [packages, setPackages] = useState(() => catalogService.getAllPackages());
  const [selectedExamFilter, setSelectedExamFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Form State
  const [formExamId, setFormExamId] = useState('');
  const [formName, setFormName] = useState('Standard Tier');
  const [formPrice, setFormPrice] = useState(24999);
  const [formDuration, setFormDuration] = useState('6 Months');
  const [formPopular, setFormPopular] = useState(false);
  const [formStatus, setFormStatus] = useState('Active');
  const [formFeatures, setFormFeatures] = useState({
    pdfNotes: true,
    videoLectures: true,
    flashcards: true,
    liveSessions: false,
    testSeries: true
  });

  // Sync with catalogService
  useEffect(() => {
    const unsubscribe = catalogService.subscribe((payload) => {
      setExams(payload.exams);
      setPackages(payload.packages);
    });
    return unsubscribe;
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleOpenCreateModal = () => {
    setEditingPackage(null);
    // Dependency rule: default to filtered exam or first active exam
    const defaultExamId = selectedExamFilter !== 'all' ? selectedExamFilter : (exams[0]?.id || 'neet-pg');
    setFormExamId(defaultExamId);
    setFormName('Standard Tier');
    setFormPrice(defaultExamId === 'usmle' ? 469 : defaultExamId === 'plab' ? 299 : defaultExamId === 'europe' ? 389 : 22999);
    setFormDuration('6 Months');
    setFormPopular(false);
    setFormStatus('Active');
    setFormFeatures({
      pdfNotes: true,
      videoLectures: true,
      flashcards: true,
      liveSessions: false,
      testSeries: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (pkg) => {
    setEditingPackage(pkg);
    setFormExamId(pkg.examId);
    setFormName(pkg.name);
    setFormPrice(pkg.price);
    setFormDuration(pkg.duration);
    setFormPopular(Boolean(pkg.popular));
    setFormStatus(pkg.status);
    setFormFeatures({ ...pkg.features });
    setIsModalOpen(true);
  };

  const handleToggleFeature = (featureKey) => {
    setFormFeatures(prev => ({
      ...prev,
      [featureKey]: !prev[featureKey]
    }));
  };

  const handleToggleStatus = (id) => {
    catalogService.togglePackageStatus(id);
    setPackages(catalogService.getAllPackages());
    showToast('Package tier visibility status updated.');
  };

  const handleDeletePackage = (pkg) => {
    if (confirm(`Are you sure you want to delete package "${pkg.name}" for ${pkg.examName}?`)) {
      catalogService.deletePackage(pkg.id);
      setPackages(catalogService.getAllPackages());
      showToast(`Package "${pkg.name}" deleted.`);
    }
  };

  const handleSavePackage = (e) => {
    e.preventDefault();
    if (!formExamId) {
      alert('Rule 4 Enforced: Please select an Exam category first. Packages cannot exist without an Exam.');
      return;
    }
    if (!formName.trim()) {
      alert('Please enter a package name.');
      return;
    }

    const pkgData = {
      ...(editingPackage ? { id: editingPackage.id } : {}),
      examId: formExamId,
      name: formName.trim(),
      price: Number(formPrice),
      duration: formDuration,
      features: formFeatures,
      popular: formPopular,
      status: formStatus
    };

    catalogService.savePackage(pkgData);
    setPackages(catalogService.getAllPackages());
    setIsModalOpen(false);
    showToast(editingPackage ? `Package "${formName}" updated successfully!` : `New package "${formName}" created!`);
  };

  // Live preview text generator
  const getEnabledFeaturesList = () => {
    const active = [];
    if (formFeatures.pdfNotes) active.push('PDF Notes');
    if (formFeatures.videoLectures) active.push('Video Lectures');
    if (formFeatures.flashcards) active.push('Flashcards');
    if (formFeatures.liveSessions) active.push('Live Grand Rounds');
    if (formFeatures.testSeries) active.push('CBT Test Series');
    return active.length > 0 ? active.join(', ') : 'No learning assets enabled';
  };

  const currentCurrency = catalogService.getCurrencyForExam(formExamId);

  // Filtered packages
  const filteredPackages = packages.filter(pkg => {
    const matchesExam = selectedExamFilter === 'all' || pkg.examId === selectedExamFilter;
    const matchesSearch = pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          pkg.examName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          pkg.duration.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesExam && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Toast Notification */}
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
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold mb-1.5">
              <Package className="w-3.5 h-3.5 text-purple-600" />
              <span>Pricing Tiers & Feature Matrix (Phase 5.2)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Manage Package Tiers & Permissions
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Rule 4 Enforced: Feature toggles here dictate which study tabs students unlock in their Day Content View (Phase 4).
            </p>
          </div>

          <button 
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add New Package</span>
          </button>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Exam Filter Dropdown */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-bold text-slate-500 shrink-0 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-slate-400" /> Select Exam:
            </span>
            <select
              value={selectedExamFilter}
              onChange={(e) => setSelectedExamFilter(e.target.value)}
              className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 w-full sm:w-64"
            >
              <option value="all">All Exams ({packages.length} Tiers)</option>
              {exams.map((exam) => (
                <option key={exam.id} value={exam.id}>
                  {exam.flag} {exam.name}
                </option>
              ))}
            </select>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Search package tier, validity..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white"
            />
          </div>
        </div>

        {/* Packages Table View */}
        <div className="overflow-x-auto border border-slate-200 rounded-2xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-bold">
                <th className="py-3 px-4">Package Name & Exam</th>
                <th className="py-3 px-4">Price (Currency)</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Features Included</th>
                <th className="py-3 px-4 text-center">Subscribers</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPackages.map((pkg) => {
                const parentExam = exams.find(e => e.id === pkg.examId);
                return (
                  <tr key={pkg.id} className="hover:bg-slate-50/60 transition-colors">
                    
                    {/* Package Name & Exam */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 text-xs sm:text-sm">
                            {pkg.name}
                          </span>
                          {pkg.popular && (
                            <span className="text-[10px] bg-indigo-100 text-indigo-700 font-extrabold px-2 py-0.2 rounded-full border border-indigo-200">
                              MOST POPULAR
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                          <span>{parentExam?.flag || '🎯'}</span>
                          <span className="font-semibold text-slate-600">{parentExam?.name || pkg.examName}</span>
                        </div>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="py-3.5 px-4">
                      <span className="text-sm font-black text-slate-900">
                        {pkg.formattedPrice}
                      </span>
                    </td>

                    {/* Duration */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold text-[11px]">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{pkg.duration}</span>
                      </span>
                    </td>

                    {/* Feature Toggles Row */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span 
                          title={`PDF Notes: ${pkg.features?.pdfNotes ? 'ENABLED' : 'DISABLED'}`}
                          className={`p-1.5 rounded-lg border text-xs ${
                            pkg.features?.pdfNotes 
                              ? 'bg-blue-50 text-blue-700 border-blue-200 font-bold' 
                              : 'bg-slate-100 text-slate-300 border-slate-200 opacity-50 line-through'
                          }`}
                        >
                          📄 PDF
                        </span>

                        <span 
                          title={`Video Lectures: ${pkg.features?.videoLectures ? 'ENABLED' : 'DISABLED'}`}
                          className={`p-1.5 rounded-lg border text-xs ${
                            pkg.features?.videoLectures 
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-200 font-bold' 
                              : 'bg-slate-100 text-slate-300 border-slate-200 opacity-50 line-through'
                          }`}
                        >
                          🎥 Video
                        </span>

                        <span 
                          title={`Flashcards: ${pkg.features?.flashcards ? 'ENABLED' : 'DISABLED'}`}
                          className={`p-1.5 rounded-lg border text-xs ${
                            pkg.features?.flashcards 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold' 
                              : 'bg-slate-100 text-slate-300 border-slate-200 opacity-50 line-through'
                          }`}
                        >
                          🗂️ Cards
                        </span>

                        <span 
                          title={`Live Sessions: ${pkg.features?.liveSessions ? 'ENABLED' : 'DISABLED'}`}
                          className={`p-1.5 rounded-lg border text-xs ${
                            pkg.features?.liveSessions 
                              ? 'bg-amber-50 text-amber-700 border-amber-200 font-bold' 
                              : 'bg-slate-100 text-slate-300 border-slate-200 opacity-50 line-through'
                          }`}
                        >
                          📡 Live
                        </span>

                        <span 
                          title={`Test Series: ${pkg.features?.testSeries ? 'ENABLED' : 'DISABLED'}`}
                          className={`p-1.5 rounded-lg border text-xs ${
                            pkg.features?.testSeries 
                              ? 'bg-rose-50 text-rose-700 border-rose-200 font-bold' 
                              : 'bg-slate-100 text-slate-300 border-slate-200 opacity-50 line-through'
                          }`}
                        >
                          📝 Tests
                        </span>
                      </div>
                    </td>

                    {/* Active Subscribers */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-bold text-slate-700 text-xs">
                        {(pkg.activeSubscribers || 0).toLocaleString()}
                      </span>
                    </td>

                    {/* Status Toggle */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(pkg.id)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold cursor-pointer transition-all ${
                          pkg.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${pkg.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                        <span>{pkg.status}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(pkg)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                          title="Edit Package"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePackage(pkg)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Package"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })}

              {filteredPackages.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                    No packages match the selected criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Helpful Info Footer */}
        <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-indigo-900 text-xs flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <p className="text-[11px] text-indigo-800 leading-relaxed">
            <strong>Feature Lock Logic:</strong> When a student logs in to Day Content View (Phase 4), the platform reads their enrolled tier's feature toggles. If Flashcards or Live Grand Rounds are disabled, the student sees a lock badge prompting an upgrade.
          </p>
        </div>

      </div>

      {/* ======================================================================= */}
      {/* DRAWER: ADD / EDIT PACKAGE                                              */}
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
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
                    {editingPackage ? 'Edit Package Tier' : 'Create Pricing Tier'}
                  </span>
                  <h3 className="text-lg font-black text-slate-900 mt-1">
                    {editingPackage ? `Edit "${editingPackage.name}"` : 'Add New Package Tier'}
                  </h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSavePackage} className="flex-1 flex flex-col min-h-0">
                <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs">
                  {/* Select Exam (Rule 4: Mandatory Parent Dependency) */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 flex items-center justify-between">
                      <span>Parent Exam Track (Mandatory) *</span>
                      <span className="text-[10px] text-indigo-600 font-semibold">Rule 4: Exam ➔ Package Dependency</span>
                    </label>
                    <select
                      required
                      value={formExamId}
                      onChange={(e) => {
                        const newExamId = e.target.value;
                        setFormExamId(newExamId);
                        // Adjust default currency price
                        if (newExamId === 'usmle') setFormPrice(469);
                        else if (newExamId === 'plab') setFormPrice(299);
                        else if (newExamId === 'europe') setFormPrice(389);
                        else setFormPrice(22999);
                      }}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white"
                    >
                      <option value="" disabled>-- Select An Exam Category --</option>
                      {exams.map((exam) => (
                        <option key={exam.id} value={exam.id}>
                          {exam.flag} {exam.name} ({exam.country})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Package Name & Duration */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Package Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Standard Tier / Sprint Pass"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Validity Duration *</label>
                      <select
                        value={formDuration}
                        onChange={(e) => setFormDuration(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      >
                        <option value="1 Month">1 Month Fast-Track</option>
                        <option value="3 Months">3 Months Essential</option>
                        <option value="6 Months">6 Months Comprehensive</option>
                        <option value="12 Months">12 Months Complete VIP</option>
                      </select>
                    </div>
                  </div>

                  {/* Price with Auto-Detected Currency */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 flex items-center justify-between">
                      <span>Price ({currentCurrency}) *</span>
                      <span className="text-[11px] text-slate-400 font-medium">Auto-derived from Exam region</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-black text-slate-500 text-sm">
                        {currentCurrency}
                      </span>
                      <input
                        type="number"
                        required
                        min={0}
                        value={formPrice}
                        onChange={(e) => setFormPrice(e.target.value)}
                        className="w-full pl-8 pr-4 py-2 rounded-xl border border-slate-200 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                  </div>

                  {/* Feature Matrix Toggles (Most Important CMS Element) */}
                  <div className="space-y-2 pt-1">
                    <label className="font-bold text-slate-800 flex items-center justify-between">
                      <span>Included Learning Features (Student LMS Permissions)</span>
                      <span className="text-[10px] text-slate-400">Click to toggle ON/OFF</span>
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      
                      {/* PDF Notes */}
                      <div 
                        onClick={() => handleToggleFeature('pdfNotes')}
                        className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          formFeatures.pdfNotes ? 'bg-blue-50/70 border-blue-200 text-blue-900' : 'bg-slate-50 border-slate-200 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-600" />
                          <div>
                            <div className="font-bold text-[11px]">PDF Clinical Notes</div>
                            <div className="text-[10px] opacity-70">19 subjects & summaries</div>
                          </div>
                        </div>
                        <span className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] font-bold ${formFeatures.pdfNotes ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                          {formFeatures.pdfNotes ? '✓' : ''}
                        </span>
                      </div>

                      {/* Video Lectures */}
                      <div 
                        onClick={() => handleToggleFeature('videoLectures')}
                        className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          formFeatures.videoLectures ? 'bg-indigo-50/70 border-indigo-200 text-indigo-900' : 'bg-slate-50 border-slate-200 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Video className="w-4 h-4 text-indigo-600" />
                          <div>
                            <div className="font-bold text-[11px]">Video Masterclasses</div>
                            <div className="text-[10px] opacity-70">Full HD clinical lectures</div>
                          </div>
                        </div>
                        <span className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] font-bold ${formFeatures.videoLectures ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                          {formFeatures.videoLectures ? '✓' : ''}
                        </span>
                      </div>

                      {/* Flashcards */}
                      <div 
                        onClick={() => handleToggleFeature('flashcards')}
                        className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          formFeatures.flashcards ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Brain className="w-4 h-4 text-emerald-600" />
                          <div>
                            <div className="font-bold text-[11px]">Smart Flashcards</div>
                            <div className="text-[10px] opacity-70">Spaced recall decks</div>
                          </div>
                        </div>
                        <span className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] font-bold ${formFeatures.flashcards ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                          {formFeatures.flashcards ? '✓' : ''}
                        </span>
                      </div>

                      {/* Live Sessions */}
                      <div 
                        onClick={() => handleToggleFeature('liveSessions')}
                        className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          formFeatures.liveSessions ? 'bg-amber-50/70 border-amber-200 text-amber-900' : 'bg-slate-50 border-slate-200 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Radio className="w-4 h-4 text-amber-600" />
                          <div>
                            <div className="font-bold text-[11px]">Live Grand Rounds</div>
                            <div className="text-[10px] opacity-70">Weekly interactive case drills</div>
                          </div>
                        </div>
                        <span className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] font-bold ${formFeatures.liveSessions ? 'bg-amber-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                          {formFeatures.liveSessions ? '✓' : ''}
                        </span>
                      </div>

                      {/* Test Series */}
                      <div 
                        onClick={() => handleToggleFeature('testSeries')}
                        className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all sm:col-span-2 ${
                          formFeatures.testSeries ? 'bg-rose-50/70 border-rose-200 text-rose-900' : 'bg-slate-50 border-slate-200 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-rose-600" />
                          <div>
                            <div className="font-bold text-[11px]">CBT Grand Mock Tests & National Rank Benchmarking</div>
                            <div className="text-[10px] opacity-70">Simulated exam engine with percentiles & answer rationales</div>
                          </div>
                        </div>
                        <span className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] font-bold ${formFeatures.testSeries ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                          {formFeatures.testSeries ? '✓' : ''}
                        </span>
                      </div>

                    </div>
                  </div>

                  {/* DYNAMIC LIVE PREVIEW BAR (Required by Phase 5.2 spec) */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-700 space-y-1">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      Live Student Access Preview:
                    </span>
                    <p className="text-slate-600">
                      "Students on this package will see: <span className="font-bold text-indigo-700">{getEnabledFeaturesList()}</span> only"
                    </p>
                  </div>

                  {/* Badging & Status */}
                  <div className="grid grid-cols-2 gap-3 items-center pt-1">
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                      <input
                        type="checkbox"
                        checked={formPopular}
                        onChange={(e) => setFormPopular(e.target.checked)}
                        className="w-4 h-4 text-indigo-600 rounded"
                      />
                      <span>Mark as "Most Popular"</span>
                    </label>

                    <div className="flex items-center justify-end gap-2">
                      <span className="font-bold text-slate-700 text-[11px]">Status:</span>
                      <button
                        type="button"
                        onClick={() => setFormStatus(formStatus === 'Active' ? 'Inactive' : 'Active')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          formStatus === 'Active' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {formStatus === 'Active' ? 'Active' : 'Inactive'}
                      </button>
                    </div>
                  </div>
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
                    {editingPackage ? 'Save Changes' : 'Save Package'}
                  </button>
                </div>
              </form>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
