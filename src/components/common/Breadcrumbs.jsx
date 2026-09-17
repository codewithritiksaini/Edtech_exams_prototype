import React from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ChevronRight, Home, Layers, BookOpen, FolderTree, FileText, Sparkles } from 'lucide-react';
import { catalogService } from '../../services/catalogService';
import { curriculumService } from '../../services/curriculumService';

export default function Breadcrumbs({ basePath = 'admin', customCrumbs = null }) {
  const location = useLocation();
  const params = useParams();

  // If custom crumbs provided, render directly
  if (customCrumbs && Array.isArray(customCrumbs)) {
    return (
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs font-medium text-slate-500 overflow-x-auto py-1">
        {customCrumbs.map((crumb, idx) => {
          const isLast = idx === customCrumbs.length - 1;
          return (
            <React.Fragment key={crumb.path || idx}>
              {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
              {isLast || !crumb.path ? (
                <span className="font-bold text-slate-800 shrink-0 flex items-center gap-1.5">
                  {crumb.icon && <crumb.icon className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                  <span className="truncate max-w-[200px] sm:max-w-[300px]">{crumb.label}</span>
                </span>
              ) : (
                <Link 
                  to={crumb.path} 
                  className="hover:text-indigo-600 transition-colors shrink-0 flex items-center gap-1 text-slate-600"
                >
                  {crumb.icon && <crumb.icon className="w-3.5 h-3.5 shrink-0" />}
                  <span className="truncate max-w-[150px]">{crumb.label}</span>
                </Link>
              )}
            </React.Fragment>
          );
        })}
      </nav>
    );
  }

  // Auto-generate crumbs based on path and params
  const pathname = location.pathname;
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) return null;

  const crumbs = [];

  // 1. Root / Base Crumb
  const rootSegment = segments[0] || 'admin';
  const rootLabels = {
    admin: 'Admin Console',
    faculty: 'Faculty Console',
    student: 'Student LMS',
    dashboard: 'Student LMS'
  };
  crumbs.push({
    label: rootLabels[rootSegment] || 'Home',
    path: `/${rootSegment}`,
    icon: Home
  });

  // Check for Exam -> Subject -> Module -> Lecture -> Content hierarchy
  const { examId, subjectId, moduleId, lectureId, dayId, testId } = params;

  if (segments.includes('exams') || examId) {
    crumbs.push({
      label: 'Exams',
      path: `/${rootSegment}/exams`,
      icon: BookOpen
    });

    if (examId) {
      const exam = catalogService.getExamById(examId);
      const examName = exam ? exam.name : examId.toUpperCase();
      crumbs.push({
        label: examName,
        path: `/${rootSegment}/exams/${examId}/subjects`
      });

      if (segments.includes('subjects') || subjectId) {
        if (subjectId) {
          const subject = curriculumService.getSubjectById(subjectId);
          crumbs.push({
            label: subject ? subject.name : 'Subject',
            path: (segments.includes('modules') || moduleId)
              ? `/${rootSegment}/exams/${examId}/subjects/${subjectId}/modules`
              : null,
            icon: Layers
          });

          if (segments.includes('modules') || moduleId) {
            if (moduleId) {
              const module = curriculumService.getModuleById(moduleId);
              crumbs.push({
                label: module ? module.title : 'Module',
                path: (segments.includes('lectures') || lectureId)
                  ? `/${rootSegment}/exams/${examId}/subjects/${subjectId}/modules/${moduleId}/lectures`
                  : null,
                icon: FolderTree
              });

              if (segments.includes('lectures') || lectureId) {
                if (lectureId) {
                  const lecture = curriculumService.getLectureById(lectureId);
                  crumbs.push({
                    label: lecture ? lecture.title : 'Lecture',
                    path: segments.includes('content')
                      ? `/${rootSegment}/exams/${examId}/subjects/${subjectId}/modules/${moduleId}/lectures`
                      : null,
                    icon: FileText
                  });

                  if (segments.includes('content')) {
                    crumbs.push({
                      label: 'Content Studio',
                      path: null,
                      icon: Sparkles
                    });
                  }
                } else {
                  crumbs.push({
                    label: 'Lectures',
                    path: null,
                    icon: FileText
                  });
                }
              }
            } else {
              crumbs.push({
                label: 'Modules',
                path: null,
                icon: FolderTree
              });
            }
          }
        } else {
          crumbs.push({
            label: 'Subjects',
            path: null,
            icon: Layers
          });
        }
      }
    }
  } else if (segments.includes('courses') || (rootSegment === 'student' && examId)) {
    crumbs.push({
      label: 'My Courses',
      path: `/${rootSegment}/courses`,
      icon: BookOpen
    });

    if (examId) {
      const exam = catalogService.getExamById(examId);
      crumbs.push({
        label: exam?.name || examId.toUpperCase(),
        path: `/${rootSegment}/courses/${examId}/subjects`
      });

      if (subjectId) {
        const subject = curriculumService.getSubjectById(subjectId);
        crumbs.push({
          label: subject?.name || 'Subject',
          path: `/${rootSegment}/courses/${examId}/subjects/${subjectId}/modules`
        });

        if (moduleId) {
          const module = curriculumService.getModuleById(moduleId);
          crumbs.push({
            label: module?.title || 'Module',
            path: `/${rootSegment}/courses/${examId}/subjects/${subjectId}/modules/${moduleId}/lectures`
          });

          if (lectureId) {
            const lecture = curriculumService.getLectureById(lectureId);
            crumbs.push({
              label: lecture?.title || 'Lecture Study Room',
              path: null
            });
          }
        }
      }
    }
  } else if (segments.includes('subjects') && !examId) {
    crumbs.push({
      label: 'Subjects',
      path: `/${rootSegment}/subjects`,
      icon: Layers
    });

    if (subjectId) {
      const subject = curriculumService.getSubjectById(subjectId);
      crumbs.push({
        label: subject ? subject.name : 'Subject',
        path: (segments.includes('modules') || moduleId)
          ? `/${rootSegment}/subjects/${subjectId}/modules`
          : null,
        icon: Layers
      });

      if (segments.includes('modules') || moduleId) {
        if (moduleId) {
          const module = curriculumService.getModuleById(moduleId);
          crumbs.push({
            label: module ? module.title : 'Module',
            path: (segments.includes('lectures') || lectureId)
              ? `/${rootSegment}/subjects/${subjectId}/modules/${moduleId}/lectures`
              : null,
            icon: FolderTree
          });

          if (segments.includes('lectures') || lectureId) {
            if (lectureId) {
              const lecture = curriculumService.getLectureById(lectureId);
              crumbs.push({
                label: lecture ? lecture.title : 'Lecture',
                path: segments.includes('content')
                  ? `/${rootSegment}/subjects/${subjectId}/modules/${moduleId}/lectures`
                  : null,
                icon: FileText
              });

              if (segments.includes('content')) {
                crumbs.push({
                  label: 'Content Studio',
                  path: null,
                  icon: Sparkles
                });
              }
            } else {
              crumbs.push({
                label: 'Lectures',
                path: null,
                icon: FileText
              });
            }
          }
        } else {
          crumbs.push({
            label: 'Modules',
            path: null,
            icon: FolderTree
          });
        }
      }
    }
  } else if (segments.includes('schedule')) {
    crumbs.push({
      label: 'Study Schedule Planner',
      path: `/${rootSegment}/schedule`
    });
    if (examId) {
      const exam = catalogService.getExamById(examId);
      crumbs.push({
        label: exam?.name || examId.toUpperCase(),
        path: `/${rootSegment}/schedule/${examId}`
      });
    }
    if (params.dayNumber) {
      crumbs.push({
        label: `Day ${params.dayNumber} Mapping`,
        path: null
      });
    }
  } else if (segments.includes('study-plan')) {
    crumbs.push({
      label: 'Study Plan',
      path: `/${rootSegment}/study-plan`
    });
    if (dayId || params.dayId) {
      crumbs.push({
        label: `Day ${dayId || params.dayId} Study Room`,
        path: null
      });
    }
  } else if (segments.includes('tests')) {
    crumbs.push({
      label: 'Assessments & Tests',
      path: `/${rootSegment}/tests`
    });
    if (testId) {
      crumbs.push({
        label: `Test ID: ${testId}`,
        path: `/${rootSegment}/tests/${testId}`
      });
      if (segments.includes('questions')) {
        crumbs.push({
          label: 'Question Bank Authoring',
          path: null
        });
      }
    }
  } else if (segments.includes('questions') && !testId) {
    crumbs.push({
      label: 'Question Bank',
      path: `/${rootSegment}/questions`
    });
    if (segments.includes('new')) {
      crumbs.push({
        label: 'Create Question',
        path: null
      });
    } else if (segments.includes('edit')) {
      crumbs.push({
        label: 'Edit Question',
        path: null
      });
    } else if (segments.includes('preview')) {
      crumbs.push({
        label: 'Question Preview',
        path: null
      });
    }
  } else if (segments.includes('packages')) {
    crumbs.push({
      label: 'Packages & Pricing',
      path: `/${rootSegment}/packages`
    });
  } else if (rootSegment === 'faculty' && (segments.length === 1 || segments[1] === 'dashboard')) {
    crumbs.push({
      label: 'Command Center',
      path: '/faculty/dashboard'
    });
  } else if (rootSegment === 'admin' && segments.includes('faculty')) {
    crumbs.push({
      label: 'Faculty Directory',
      path: `/${rootSegment}/faculty`
    });
  } else if (segments.includes('upload')) {
    crumbs.push({
      label: 'Quick Content Import',
      path: `/${rootSegment}/upload`
    });
  } else if (segments.includes('doubts')) {
    crumbs.push({
      label: 'Doubts & Q&A Desk',
      path: `/${rootSegment}/doubts`
    });
  } else if (segments.includes('availability')) {
    crumbs.push({
      label: 'My Availability',
      path: `/${rootSegment}/availability`
    });
  } else if (segments.includes('students')) {
    crumbs.push({
      label: 'Students Directory',
      path: `/${rootSegment}/students`
    });
  } else if (segments.includes('live-sessions')) {
    crumbs.push({
      label: 'Live Grand Rounds',
      path: `/${rootSegment}/live-sessions`
    });
  } else if (segments.includes('analytics') || segments.includes('progress')) {
    crumbs.push({
      label: 'Reports & Analytics',
      path: `/${rootSegment}/analytics`
    });
  } else if (segments.includes('settings')) {
    crumbs.push({
      label: 'Settings',
      path: `/${rootSegment}/settings`
    });
  }

  // If crumbs only has root and we are on a specific page
  if (crumbs.length === 1 && segments.length > 1) {
    const lastSeg = segments[segments.length - 1];
    crumbs.push({
      label: lastSeg.charAt(0).toUpperCase() + lastSeg.slice(1).replace(/-/g, ' '),
      path: null
    });
  }

  return (
    <nav 
      aria-label="Breadcrumb" 
      className="flex items-center gap-1.5 text-xs font-medium text-slate-500 overflow-x-auto py-1 scrollbar-none"
    >
      {crumbs.map((crumb, idx) => {
        const isLast = idx === crumbs.length - 1;
        return (
          <React.Fragment key={crumb.path || idx}>
            {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />}
            {isLast || !crumb.path ? (
              <span className="font-bold text-slate-800 shrink-0 flex items-center gap-1.5">
                {crumb.icon && <crumb.icon className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                <span className="truncate max-w-[200px] sm:max-w-[320px]">{crumb.label}</span>
              </span>
            ) : (
              <Link 
                to={crumb.path} 
                className="hover:text-indigo-600 transition-colors shrink-0 flex items-center gap-1 text-slate-600"
              >
                {crumb.icon && <crumb.icon className="w-3.5 h-3.5 shrink-0" />}
                <span className="truncate max-w-[160px]">{crumb.label}</span>
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
