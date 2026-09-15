import React, { useState } from 'react';
import { X, Plus, Tag } from 'lucide-react';

export default function TagInput({ tags = [], onChange, placeholder = 'Add tag and press Enter...' }) {
  const [inputVal, setInputVal] = useState('');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  const addTag = () => {
    const trimmed = inputVal.trim().replace(/^#/, '');
    if (!trimmed) return;

    if (!tags.some(t => t.toLowerCase() === trimmed.toLowerCase())) {
      onChange([...tags, trimmed]);
    }
    setInputVal('');
  };

  const removeTag = (indexToRemove) => {
    onChange(tags.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5 min-h-[32px] p-1.5 bg-slate-50 border border-slate-200 rounded-2xl items-center focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
        {tags.map((tag, idx) => (
          <span
            key={idx}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold shadow-2xs group"
          >
            <Tag className="w-3 h-3 text-slate-400" />
            <span>{tag}</span>
            <button
              type="button"
              onClick={() => removeTag(idx)}
              className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer ml-0.5"
              title="Remove tag"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}

        <div className="flex-1 flex items-center gap-1 min-w-[120px] px-1">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={tags.length === 0 ? placeholder : 'Add another tag...'}
            className="w-full text-xs text-slate-800 placeholder:text-slate-400 bg-transparent border-none outline-none py-1"
          />
          {inputVal.trim() && (
            <button
              type="button"
              onClick={addTag}
              className="p-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all cursor-pointer shrink-0"
              title="Add Tag"
            >
              <Plus className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
      <p className="text-[11px] text-slate-400">Press Enter or comma to create a tag.</p>
    </div>
  );
}
