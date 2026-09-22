import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { testPresentationService } from '../../services/testPresentationService.js';
import TestPreviewShell from '../../components/common/TestPreviewShell.jsx';
import { RefreshCw, AlertCircle, ArrowLeft } from 'lucide-react';

export default function AdminTestPreviewPage() {
  const { id } = useParams();
  const [previewModel, setPreviewModel] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    try {
      const model = testPresentationService.getTestPreviewModel(id);
      setPreviewModel(model);
    } catch (e) {
      console.error('[AdminTestPreviewPage] Error loading preview model:', e);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="flex items-center gap-3 text-slate-600 text-sm font-semibold">
          <RefreshCw className="w-5 h-5 animate-spin text-indigo-600" />
          <span>Generating Admin Test Preview...</span>
        </div>
      </div>
    );
  }

  if (!previewModel) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center max-w-md shadow-sm space-y-4">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">Test Not Found</h3>
          <p className="text-xs text-slate-500">
            The assessment with ID <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">{id}</code> could not be located.
          </p>
          <Link
            to="/admin/tests"
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Return to Admin Tests
          </Link>
        </div>
      </div>
    );
  }

  return (
    <TestPreviewShell
      previewModel={previewModel}
      role="admin"
      exitUrl={`/admin/tests/${id}/review`}
    />
  );
}
