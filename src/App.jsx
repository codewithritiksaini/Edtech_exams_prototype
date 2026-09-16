import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import PackageSelectionPage from './pages/PackageSelectionPage';
import DashboardPage from './pages/DashboardPage';
import DayContentView from './pages/DayContentView';
import LoginPage from './pages/LoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import TestExperiencePage from './pages/TestExperiencePage';
import AdminLayout from './layouts/AdminLayout';
import FacultyLayout from './layouts/FacultyLayout';
import StudentLayout from './layouts/StudentLayout';
import AdminExamsPage from './pages/admin/AdminExamsPage';
import AdminSubjectsPage from './pages/admin/AdminSubjectsPage';
import AdminModulesPage from './pages/admin/AdminModulesPage';
import AdminLecturesPage from './pages/admin/AdminLecturesPage';
import AdminContentStudioPage from './pages/admin/AdminContentStudioPage';
import AdminOverviewPage from './pages/admin/AdminOverviewPage';
import AdminSchedulePage from './pages/admin/AdminSchedulePage';
import AdminPackagesPage from './pages/admin/AdminPackagesPage';
import AdminFacultyPage from './pages/admin/AdminFacultyPage';
import AdminStudentsPage from './pages/admin/AdminStudentsPage';
import AdminTestsPage from './pages/admin/AdminTestsPage';
import AdminLiveSessionsPage from './pages/admin/AdminLiveSessionsPage';
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage';
import AdminSamplePapersPage from './pages/admin/AdminSamplePapersPage';
import FacultyOverviewPage from './pages/faculty/FacultyOverviewPage';
import FacultyExamsPage from './pages/faculty/FacultyExamsPage';
import FacultySamplePapersPage from './pages/faculty/FacultySamplePapersPage';
import FacultySubjectsPage from './pages/faculty/FacultySubjectsPage';
import FacultyModulesPage from './pages/faculty/FacultyModulesPage';
import FacultyLecturesPage from './pages/faculty/FacultyLecturesPage';
import FacultyContentStudioPage from './pages/faculty/FacultyContentStudioPage';
import FacultyDirectUploadPage from './pages/faculty/FacultyDirectUploadPage';
import FacultyLiveSessionsPage from './pages/faculty/FacultyLiveSessionsPage';
import FacultyTestsPage from './pages/faculty/FacultyTestsPage';
import FacultyStudentsPage from './pages/faculty/FacultyStudentsPage';
import FacultyStudentDetailPage from './pages/faculty/FacultyStudentDetailPage';
import FacultyDoubtsPage from './pages/faculty/FacultyDoubtsPage';
import FacultyAnalyticsPage from './pages/faculty/FacultyAnalyticsPage';
import FacultySchedulePage from './pages/faculty/FacultySchedulePage';
import FacultyAvailabilityPage from './pages/faculty/FacultyAvailabilityPage';
import FacultyQuestionAuthoringPage from './pages/faculty/FacultyQuestionAuthoringPage';
import FacultyTestResultsPage from './pages/faculty/FacultyTestResultsPage';
import StudentCoursesPage from './pages/student/StudentCoursesPage';
import StudentExamOverviewPage from './pages/student/StudentExamOverviewPage';
import StudentSubjectsPage from './pages/student/StudentSubjectsPage';
import StudentModulesPage from './pages/student/StudentModulesPage';
import StudentLecturesPage from './pages/student/StudentLecturesPage';
import StudentLectureLearnPage from './pages/student/StudentLectureLearnPage';
import StudentDashboardPage from './pages/student/StudentDashboardPage';
import StudentStudyPlanPage from './pages/student/StudentStudyPlanPage';
import StudentLiveSessionsPage from './pages/student/StudentLiveSessionsPage';
import StudentLiveRoomPage from './pages/student/StudentLiveRoomPage';
import StudentTestsPage from './pages/student/StudentTestsPage';
import StudentProgressPage from './pages/student/StudentProgressPage';
import StudentSettingsPage from './pages/student/StudentSettingsPage';
import ExamDataPreviewPage from './pages/prototype/ExamDataPreviewPage';
import QuestionBankPage from './pages/QuestionBankPage';
import QuestionEditorPage from './pages/QuestionEditorPage';
import QuestionPreviewPage from './pages/QuestionPreviewPage';
import { authService, USER_ROLES } from './services/authService';

function QuestionBankRedirect() {
  const user = authService.getCurrentUser();
  if (!user) return <Navigate to="/login?redirect=/questions" replace />;
  if (user.role === USER_ROLES.STUDENT) return <Navigate to="/student/dashboard" replace />;
  if (user.role === USER_ROLES.FACULTY) return <Navigate to="/faculty/questions" replace />;
  return <Navigate to="/admin/questions" replace />;
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const location = useLocation();

  const isAppView = location.pathname.startsWith('/dashboard') || 
                    location.pathname.startsWith('/student') || 
                    location.pathname.startsWith('/day') || 
                    location.pathname.startsWith('/test') ||
                    location.pathname.startsWith('/live-session') ||
                    location.pathname.startsWith('/faculty') ||
                    location.pathname.startsWith('/admin') ||
                    location.pathname.startsWith('/prototype') ||
                    location.pathname.startsWith('/questions') ||
                    location.pathname.startsWith('/question-bank') ||
                    location.pathname === '/login';

  const handleExploreCourses = () => {
    const el = document.getElementById('courses');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.location.href = '/#courses';
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-brand-500 selection:text-white">
      <ScrollToTop />
      
      {/* Sticky Marketing Header (Hidden on logged-in student LMS & faculty routes) */}
      {!isAppView && (
        <Navbar 
          onOpenLogin={() => setIsLoginOpen(true)}
        />
      )}

      {/* Main Content View */}
      <main className="flex-grow">
        <Routes>
          <Route 
            path="/" 
            element={
              <HomePage 
                isLoginOpen={isLoginOpen} 
                onCloseLogin={() => setIsLoginOpen(false)} 
              />
            } 
          />
          <Route 
            path="/packages/:examId" 
            element={<PackageSelectionPage />} 
          />
          <Route 
            path="/packages" 
            element={<PackageSelectionPage />} 
          />
          <Route 
            path="/student/legacy-dashboard" 
            element={<DashboardPage />} 
          />
          <Route 
            path="/day/:dayId" 
            element={<DayContentView />} 
          />
          <Route 
            path="/live-session/:sessionId" 
            element={<StudentLiveRoomPage />} 
          />
          <Route 
            path="/test/:testId" 
            element={<TestExperiencePage />} 
          />
          <Route 
            path="/prototype/exam-data" 
            element={<ExamDataPreviewPage />} 
          />
          <Route 
            path="/questions" 
            element={<QuestionBankRedirect />} 
          />
          <Route 
            path="/question-bank" 
            element={<QuestionBankRedirect />} 
          />
          <Route 
            path="/login" 
            element={<LoginPage />} 
          />
          <Route 
            path="/admin/login" 
            element={<LoginPage />} 
          />
          <Route 
            path="/admin/legacy" 
            element={<AdminDashboardPage />} 
          />

          {/* Admin Portal Hierarchy & Operations (Phase 2 & Phase 3) */}
          <Route element={<AdminLayout />}>
            {/* Dashboard / Mission Control */}
            <Route path="/admin" element={<AdminOverviewPage />} />
            <Route path="/admin/dashboard" element={<AdminOverviewPage />} />

            {/* Level 1: Exams */}
            <Route path="/admin/exams" element={<AdminExamsPage />} />

            {/* Level 2: Subjects */}
            <Route path="/admin/exams/:examId/subjects" element={<AdminSubjectsPage />} />
            <Route path="/admin/subjects" element={<AdminSubjectsPage />} />

            {/* Level 3: Modules & Lectures (Subject-based & Exam-based) */}
            <Route path="/admin/subjects/:subjectId/modules" element={<AdminModulesPage />} />
            <Route path="/admin/exams/:examId/subjects/:subjectId/modules" element={<AdminModulesPage />} />

            {/* Level 4: Lectures */}
            <Route path="/admin/subjects/:subjectId/modules/:moduleId/lectures" element={<AdminLecturesPage />} />
            <Route path="/admin/exams/:examId/subjects/:subjectId/modules/:moduleId/lectures" element={<AdminLecturesPage />} />

            {/* Level 5: Lecture Content Studio */}
            <Route path="/admin/subjects/:subjectId/modules/:moduleId/lectures/:lectureId/content" element={<AdminContentStudioPage />} />
            <Route path="/admin/exams/:examId/subjects/:subjectId/modules/:moduleId/lectures/:lectureId/content" element={<AdminContentStudioPage />} />

            {/* Phase 3: Admin Operations & Management Sub-Pages */}
            <Route path="/admin/schedule-classes" element={<AdminSchedulePage />} />
            <Route path="/admin/packages" element={<AdminPackagesPage />} />
            <Route path="/admin/faculty" element={<AdminFacultyPage />} />
            <Route path="/admin/students" element={<AdminStudentsPage />} />
            <Route path="/admin/tests" element={<AdminTestsPage />} />
            <Route path="/admin/questions" element={<QuestionBankPage />} />
            <Route path="/admin/questions/new" element={<QuestionEditorPage />} />
            <Route path="/admin/questions/:questionId/edit" element={<QuestionEditorPage />} />
            <Route path="/admin/questions/:questionId/preview" element={<QuestionPreviewPage />} />
            <Route path="/admin/sample-papers" element={<AdminSamplePapersPage />} />
            <Route path="/admin/live-sessions" element={<AdminLiveSessionsPage />} />
            <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
          </Route>

          <Route 
            path="/faculty/login" 
            element={<LoginPage />} 
          />
          {/* Deprecated legacy route: Redirect to modern faculty portal */}
          <Route 
            path="/faculty/legacy" 
            element={<Navigate to="/faculty" replace />} 
          />

          {/* Phase 4: Faculty Portal with Scoped Hierarchy & Operations */}
          <Route element={<FacultyLayout />}>
            {/* Dashboard / Overview */}
            <Route path="/faculty" element={<FacultyOverviewPage />} />
            <Route path="/faculty/dashboard" element={<FacultyOverviewPage />} />

            {/* Level 1: Assigned Exams */}
            <Route path="/faculty/exams" element={<FacultyExamsPage />} />

            {/* Level 2: Assigned Subjects */}
            <Route path="/faculty/exams/:examId/subjects" element={<FacultySubjectsPage />} />
            <Route path="/faculty/subjects" element={<FacultySubjectsPage />} />

            {/* Level 3: Modules & Syllabus */}
            <Route path="/faculty/exams/:examId/subjects/:subjectId/modules" element={<FacultyModulesPage />} />
            <Route path="/faculty/subjects/:subjectId/modules" element={<FacultyModulesPage />} />

            {/* Level 4: Lectures Roster */}
            <Route path="/faculty/exams/:examId/subjects/:subjectId/modules/:moduleId/lectures" element={<FacultyLecturesPage />} />
            <Route path="/faculty/subjects/:subjectId/modules/:moduleId/lectures" element={<FacultyLecturesPage />} />

            {/* Level 5: Lecture Content Studio */}
            <Route path="/faculty/exams/:examId/subjects/:subjectId/modules/:moduleId/lectures/:lectureId/content" element={<FacultyContentStudioPage />} />
            <Route path="/faculty/subjects/:subjectId/modules/:moduleId/lectures/:lectureId/content" element={<FacultyContentStudioPage />} />

            {/* Operational Management Sub-Pages */}
            <Route path="/faculty/schedule" element={<FacultySchedulePage />} />
            <Route path="/faculty/schedule/:examId" element={<FacultySchedulePage />} />
            <Route path="/faculty/availability" element={<FacultyAvailabilityPage />} />
            <Route path="/faculty/upload" element={<FacultyDirectUploadPage />} />
            <Route path="/faculty/live-sessions" element={<FacultyLiveSessionsPage />} />
            <Route path="/faculty/tests" element={<FacultyTestsPage />} />
            <Route path="/faculty/questions" element={<QuestionBankPage />} />
            <Route path="/faculty/questions/new" element={<QuestionEditorPage />} />
            <Route path="/faculty/questions/:questionId/edit" element={<QuestionEditorPage />} />
            <Route path="/faculty/questions/:questionId/preview" element={<QuestionPreviewPage />} />
            <Route path="/faculty/sample-papers" element={<FacultySamplePapersPage />} />
            <Route path="/faculty/tests/:testId/questions" element={<FacultyQuestionAuthoringPage />} />
            <Route path="/faculty/tests/:testId/results" element={<FacultyTestResultsPage />} />
            <Route path="/faculty/students" element={<FacultyStudentsPage />} />
            <Route path="/faculty/students/:studentId" element={<FacultyStudentDetailPage />} />
            <Route path="/faculty/doubts" element={<FacultyDoubtsPage />} />
            <Route path="/faculty/analytics" element={<FacultyAnalyticsPage />} />
          </Route>

          {/* Student LMS Portal (Phase 5 Academic Hierarchy & Phase 6 Operations) */}
          <Route element={<StudentLayout />}>
            {/* Student LMS Dashboard / Mission Control */}
            <Route path="/student" element={<StudentDashboardPage />} />
            <Route path="/student/dashboard" element={<StudentDashboardPage />} />
            <Route path="/dashboard" element={<StudentDashboardPage />} />

            {/* Level 0: My Courses Directory */}
            <Route path="/student/courses" element={<StudentCoursesPage />} />

            {/* Level 1: Exam Track Overview — Commented out for now as curriculum is shown directly on My Courses page
            <Route path="/student/courses/:examId" element={<StudentExamOverviewPage />} />
            */}

            {/* Level 2: Subjects */}
            <Route path="/student/courses/:examId/subjects" element={<StudentSubjectsPage />} />

            {/* Level 3: Modules */}
            <Route path="/student/courses/:examId/subjects/:subjectId/modules" element={<StudentModulesPage />} />

            {/* Level 4: Lectures */}
            <Route path="/student/courses/:examId/subjects/:subjectId/modules/:moduleId/lectures" element={<StudentLecturesPage />} />

            {/* Level 5: Lecture Study Room */}
            <Route path="/student/courses/:examId/subjects/:subjectId/modules/:moduleId/lectures/:lectureId" element={<StudentLectureLearnPage />} />

            {/* Phase 6: Student Operations Sub-Pages */}
            <Route path="/student/study-plan" element={<StudentStudyPlanPage />} />
            <Route path="/student/live-sessions" element={<StudentLiveSessionsPage />} />
            <Route path="/student/tests" element={<StudentTestsPage />} />
            <Route path="/student/progress" element={<StudentProgressPage />} />
            <Route path="/student/settings" element={<StudentSettingsPage />} />
          </Route>
          {/* Catch-all redirect to homepage */}
          <Route 
            path="*" 
            element={
              <HomePage 
                isLoginOpen={isLoginOpen} 
                onCloseLogin={() => setIsLoginOpen(false)} 
              />
            } 
          />
        </Routes>
      </main>

      {/* Footer (Hidden on logged-in student LMS & faculty routes) */}
      {!isAppView && (
        <Footer 
          onExploreCourses={handleExploreCourses}
        />
      )}
    </div>
  );
}
