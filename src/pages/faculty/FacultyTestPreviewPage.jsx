import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { testPresentationService } from '../../services/testPresentationService.js';
import { peopleService } from '../../services/peopleService.js';
import TestPreviewShell from '../../components/common/TestPreviewShell.jsx';
import { RefreshCw, AlertCircle, ArrowLeft, ShieldAlert } from 'lucide-react';

export default function FacultyTestPreviewPage() {
  const { id } = useParams();
  const facultyProfile = peopleService.getCurrentFacultyProfile();
  const [previewModel, setPreviewModel] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setPermissionDenied(false);

    try {
      const model = testPresentationService.getTestPreviewModel(id);
      if (!model) {
        setPreviewModel(null);
        return;
      }

      // Check Faculty scope: test must belong to faculty or match assigned exam tracks
      const originalTest = testPresentationService.getTestById(id);
      if (originalTest && facultyProfile) {
        const assignedExamIds = facultyProfile.assignedExamIds || [facultyProfile.primaryExamTrackId || 'neet-pg'];
        const isExamAssigned = assignedExamIds.includes(originalTest.examId || 'neet-pg');
        const isOwnTest = originalTest.facultyId === facultyProfile.id || !originalTest.facultyId;

        if (!isExamAssigned && !isOwnTest) {
          setPermissionDenied(true);
          return;
        }
      }

      setPreviewModel(model);
    } catch (e) {
      console.error('[FacultyTestPreviewPage] Error loading preview model:', e);
    } finally {
      setIsLoading(false);
    }
  }, [id, facultyProfile]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="flex items-center gap-3 text-slate-600 text-sm font-semibold">
          <RefreshCw className="w-5 h-5 animate-spin text-teal-600" />
          <span>Generating Faculty Test Delivery Preview...</span>
        </div>
      </div>
    );
  }

  if (permissionDenied) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-3xl border border-rose-200 text-center max-w-md shadow-sm space-y-4">
          <ShieldAlert className="w-10 h-10 text-rose-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">Access Restricted</h3>
          <p className="text-xs text-slate-500">
            This assessment is assigned to another medical specialty or curriculum track outside your faculty profile.
          </p>
          <Link
            to="/faculty/tests"
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Return to Faculty Assessments
          </Link>
        </div>
      </div>
    );
  }

  if (!previewModel) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center max-w-md shadow-sm space-y-4">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">Assessment Not Found</h3>
          <p className="text-xs text-slate-500">
            The assessment with ID <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">{id}</code> could not be located.
          </p>
          <Link
            to="/faculty/tests"
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Return to Faculty Assessments
          </Link>
        </div>
      </div>
    );
  }

  return (
    <TestPreviewShell
      previewModel={previewModel}
      role="faculty"
      exitUrl={`/faculty/tests/${id}/review`}
    />
  );
}
