import React, { useState, useEffect } from 'react';
import { 
  X, 
  Layers, 
  FolderPlus, 
  CheckCircle2, 
  AlertCircle, 
  BookOpen, 
  Hash, 
  FileText,
  Tag
} from 'lucide-react';
import { STRUCTURE_ITEM_TYPES } from '../../services/examPatternHelper.js';

export default function StructureItemModal({
  isOpen,
  onClose,
  item = null,
  itemType = STRUCTURE_ITEM_TYPES.SECTION,
  parentId = null,
  curriculumScope = null,
  examSubjects = [],
  onSave
}) {
  if (!isOpen) return null;

  const isEditing = Boolean(item && item.id);
  const type = item?.type || itemType || STRUCTURE_ITEM_TYPES.SECTION;

  const [name, setName] = useState(item?.name || '');
  const [code, setCode] = useState(item?.code || '');
  const [description, setDescription] = useState(item?.description || '');
  const [quota, setQuota] = useState(item?.quota !== undefined && item?.quota !== null ? item.quota : '');
  const [selectedSubjectIds, setSelectedSubjectIds] = useState(
    Array.isArray(item?.curriculumScope?.subjectIds) ? item.curriculumScope.subjectIds : []
  );
  const [error, setError] = useState(null);

  useEffect(() => {
    if (item) {
      setName(item.name || '');
      setCode(item.code || '');
      setDescription(item.description || '');
      setQuota(item.quota !== undefined && item.quota !== null ? item.quota : '');
      setSelectedSubjectIds(Array.isArray(item.curriculumScope?.subjectIds) ? item.curriculumScope.subjectIds : []);
    } else {
      setName('');
      setCode('');
      setDescription('');
      setQuota('');
      setSelectedSubjectIds([]);
    }
    setError(null);
  }, [item, isOpen]);

  // Compute available subjects in Step 2's curriculumScope
  const availableScopedSubjects = React.useMemo(() => {
    if (!curriculumScope || !Array.isArray(curriculumScope.subjects)) {
      return examSubjects;
    }
    const scopedIdSet = new Set(curriculumScope.subjects.map(s => s.subjectId));
    return examSubjects.filter(s => scopedIdSet.has(s.id));
  }, [curriculumScope, examSubjects]);

  const toggleSubject = (subId) => {
    setSelectedSubjectIds(prev => 
      prev.includes(subId) ? prev.filter(id => id !== subId) : [...prev, subId]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Item name is required.');
      return;
    }

    const payload = {
      ...(item || {}),
      name: name.trim(),
      code: (code || '').trim().toUpperCase(),
      description: (description || '').trim(),
      quota: quota !== '' && !isNaN(Number(quota)) ? Number(quota) : null,
      curriculumScope: selectedSubjectIds.length > 0 ? {
        subjectIds: selectedSubjectIds
      } : null
    };

    if (!isEditing) {
      payload.type = type;
      if (parentId) {
        payload.parentId = parentId;
      }
    }

    onSave(payload);
    onClose();
  };

  const getTypeLabel = () => {
    switch (type) {
      case STRUCTURE_ITEM_TYPES.PHASE:
        return 'Phase';
      case STRUCTURE_ITEM_TYPES.BLOCK:
        return 'Block';
      case STRUCTURE_ITEM_TYPES.SECTION:
      default:
        return 'Section';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
              type === STRUCTURE_ITEM_TYPES.PHASE 
                ? 'bg-purple-50 text-purple-600' 
                : type === STRUCTURE_ITEM_TYPES.BLOCK 
                ? 'bg-amber-50 text-amber-600' 
                : 'bg-indigo-50 text-indigo-600'
            }`}>
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {isEditing ? `Edit ${getTypeLabel()}` : `Add New ${getTypeLabel()}`}
              </h3>
              <p className="text-xs text-slate-500">
                {type === STRUCTURE_ITEM_TYPES.PHASE && 'Optional macro division for multi-stage test sessions.'}
                {type === STRUCTURE_ITEM_TYPES.SECTION && 'Primary container for organizing test questions.'}
                {type === STRUCTURE_ITEM_TYPES.BLOCK && 'Optional grouping subdivision inside a Section.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {getTypeLabel()} Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={`e.g. ${type === STRUCTURE_ITEM_TYPES.PHASE ? 'Clinical Phase 1' : type === STRUCTURE_ITEM_TYPES.BLOCK ? 'Cardiology Vignettes' : 'Section A — General Medicine'}`}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Identifier / Code (Optional)
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. SEC-A"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-900 uppercase focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Questions (Optional)
              </label>
              <input
                type="number"
                min="1"
                value={quota}
                onChange={(e) => setQuota(e.target.value)}
                placeholder="e.g. 50"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Candidate instructions or section focus..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none"
            />
          </div>

          {/* Curriculum Scope Mapping (Only for Section / Block) */}
          {type !== STRUCTURE_ITEM_TYPES.PHASE && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                  Curriculum Subject Mapping (Optional)
                </label>
                <span className="text-[11px] text-slate-400">
                  {selectedSubjectIds.length > 0 ? `${selectedSubjectIds.length} selected` : 'All Stage Scope'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mb-2">
                Optionally restrict this {getTypeLabel().toLowerCase()} to specific subjects selected in Step 2.
              </p>

              {availableScopedSubjects.length === 0 ? (
                <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl text-xs text-amber-800">
                  No subjects selected in Step 2 Curriculum Scope yet. Select subjects in Step 2 to enable granular mapping.
                </div>
              ) : (
                <div className="max-h-36 overflow-y-auto space-y-1.5 p-2 bg-slate-50 border border-slate-200 rounded-xl">
                  {availableScopedSubjects.map(sub => {
                    const isChecked = selectedSubjectIds.includes(sub.id);
                    return (
                      <label
                        key={sub.id}
                        className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                          isChecked ? 'bg-indigo-50 text-indigo-900 font-medium' : 'hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleSubject(sub.id)}
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span>{sub.name}</span>
                        </div>
                        {sub.code && <span className="text-[10px] font-mono text-slate-400">{sub.code}</span>}
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isEditing ? 'Save Changes' : `Create ${getTypeLabel()}`}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
