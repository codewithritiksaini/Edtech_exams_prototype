// =============================================================================
// CONTENT SERVICE — PHASE 5.4 CONTENT MANAGEMENT PIPELINE
// Manages Exam -> Week -> Day -> Content Type (PDF, Video, Images, Flashcards)
// Persists in localStorage and powers both Admin CMS and Student Day View
// =============================================================================

import { dayContentStore } from '../data/mockData';

const STORAGE_KEY_CONTENT = 'medprep_content_store_v1';

// Initial curriculum structure
export const INITIAL_CURRICULUM = {
  'neet-pg': {
    name: 'NEET PG & NExT 2026',
    weeks: [
      {
        id: '1',
        title: 'Week 1 — Cardiology & ECG Foundations',
        days: [
          { id: '1', title: 'Day 1 — Valvular Heart Diseases & Murmurs' },
          { id: '2', title: 'Day 2 — ECG Basics: Axis, Intervals & Hypertrophy' },
          { id: '3', title: 'Day 3 — Cardiac Arrhythmias, VT/VF & ACLS' },
          { id: '4', title: 'Day 4 — Ischemic Heart Disease & STEMI Pathways' }
        ]
      },
      {
        id: '2',
        title: 'Week 2 — Valvular Diseases & Echocardiography',
        days: [
          { id: '5', title: 'Day 5 — Heart Failure with Preserved EF' },
          { id: '6', title: 'Day 6 — Infective Endocarditis & Duke Criteria' },
          { id: '7', title: 'Day 7 — Weekly Grand Revision & CBT Assessment' }
        ]
      },
      {
        id: '3',
        title: 'Week 3 — Heart Failure & Advanced Pharmacology',
        days: [
          { id: '8', title: 'Day 8 — Inotropes, Beta-Blockers & ARNI Therapy' },
          { id: '9', title: 'Day 9 — Cardiomyopathies (DCM, HCM, RCM)' }
        ]
      }
    ]
  },
  'usmle': {
    name: 'USMLE Step 1 & 2 CK',
    weeks: [
      {
        id: '1',
        title: 'Week 1 — Cardiovascular Physiology & Pathology',
        days: [
          { id: '1', title: 'Day 1 — Cardiac Hemodynamics & Wiggers Curve' },
          { id: '2', title: 'Day 2 — Pressure-Volume Loops & Valvular Shifts' },
          { id: '3', title: 'Day 3 — Antiarrhythmic Drugs & Ion Channel Mechanisms' }
        ]
      },
      {
        id: '2',
        title: 'Week 2 — Autonomic & Neuro-Pharmacology',
        days: [
          { id: '4', title: 'Day 4 — Sympathetic & Parasympathetic Agonists' },
          { id: '5', title: 'Day 5 — Cholinergic Toxins & Antidotes' }
        ]
      }
    ]
  },
  'plab': {
    name: 'PLAB 1 & 2 / UKMLA',
    weeks: [
      {
        id: '1',
        title: 'Week 1 — NHS Clinical Guidelines & Acute Presentations',
        days: [
          { id: '1', title: 'Day 1 — Chest Pain Triage & NICE Guidelines' },
          { id: '2', title: 'Day 2 — Acute Breathlessness & Sepsis 6 Protocol' }
        ]
      }
    ]
  },
  'europe': {
    name: 'Europe Medical Licensing',
    weeks: [
      {
        id: '1',
        title: 'Week 1 — Fachsprachprüfung (FSP) Medical Terminology',
        days: [
          { id: '1', title: 'Day 1 — Kardiovaskuläre Anamnese & Symptome' },
          { id: '2', title: 'Day 2 — Patientenerstgespräch & Befunderhebung' }
        ]
      }
    ]
  }
};

const STORAGE_KEY_CURRICULUM = 'medprep_curriculum_store_v1';

class ContentService {
  constructor() {
    this.curriculumStore = this.loadCurriculum();
    this.store = this.loadStore();
  }

  loadCurriculum() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CURRICULUM);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Curriculum store read error:', e);
    }
    return JSON.parse(JSON.stringify(INITIAL_CURRICULUM));
  }

  saveCurriculum() {
    try {
      localStorage.setItem(STORAGE_KEY_CURRICULUM, JSON.stringify(this.curriculumStore));
      window.dispatchEvent(new CustomEvent('medprep-curriculum-updated', { detail: this.curriculumStore }));
    } catch (e) {
      console.warn('Curriculum store save error:', e);
    }
  }

  getCurriculumStructure(examId) {
    return this.curriculumStore[examId] || this.curriculumStore['neet-pg'];
  }

  addWeek(examId, weekTitle) {
    const track = this.curriculumStore[examId] || this.curriculumStore['neet-pg'];
    const newWeekId = String(track.weeks.length + 1);
    const newWeek = {
      id: newWeekId,
      title: weekTitle || `Week ${newWeekId} — Advanced Clinical Systems`,
      days: [
        { id: String(Date.now()).slice(-4), title: `Day 1 — Comprehensive Case Analysis` }
      ]
    };
    track.weeks.push(newWeek);
    this.saveCurriculum();
    return newWeek;
  }

  addDay(examId, weekId, dayTitle) {
    const track = this.curriculumStore[examId] || this.curriculumStore['neet-pg'];
    const week = track.weeks.find(w => w.id === String(weekId)) || track.weeks[0];
    if (!week) return null;

    const nextDayNum = week.days.length + 1;
    const newDayId = String(Date.now()).slice(-4);
    const newDay = {
      id: newDayId,
      title: dayTitle || `Day ${nextDayNum} — Clinical Diagnostic Workshop`
    };
    week.days.push(newDay);
    this.saveCurriculum();
    return newDay;
  }

  loadStore() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CONTENT);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Content store read error:', e);
    }
    // Fallback clone of mock data
    return { ...dayContentStore };
  }

  saveStore() {
    try {
      localStorage.setItem(STORAGE_KEY_CONTENT, JSON.stringify(this.store));
      window.dispatchEvent(new CustomEvent('medprep-content-updated', { detail: this.store }));
    } catch (e) {
      console.warn('Content store save error:', e);
    }
  }

  getDayContent(dayId = '3') {
    const key = String(dayId);
    if (!this.store[key]) {
      // Default template for newly created days
      this.store[key] = {
        dayNumber: Number(dayId),
        weekNumber: 1,
        title: `Day ${dayId} — Clinical Practice & Review`,
        estimatedTime: '1.5 hours',
        activeTabs: ['notes', 'images', 'video', 'flashcards'],
        pdf: null,
        pdfList: [],
        images: [],
        video: null,
        flashcards: [],
        live: { hasSession: false }
      };
      this.saveStore();
    }

    const data = this.store[key];
    // Ensure pdfList exists
    if (!data.pdfList) {
      data.pdfList = data.pdf ? [data.pdf] : [];
    }
    return data;
  }

  // 1. PDF Upload / Delete
  uploadPdf(dayId, pdfData) {
    const day = this.getDayContent(dayId);
    const newPdf = {
      id: `pdf-${Date.now()}`,
      fileName: pdfData.fileName || 'Clinical_Module_Notes.pdf',
      title: pdfData.title || 'High-Yield Clinical Notes',
      pages: Number(pdfData.pages) || 18,
      size: pdfData.size || '3.5 MB',
      updated: 'Just now',
      author: pdfData.author || 'Dr. Siddharth V. (MD Cardiology)'
    };
    day.pdf = newPdf;
    day.pdfList = [newPdf, ...(day.pdfList || []).filter(p => p.id !== newPdf.id)];
    this.saveStore();
    return day;
  }

  deletePdf(dayId, pdfId) {
    const day = this.getDayContent(dayId);
    day.pdfList = (day.pdfList || []).filter(p => p.id !== pdfId);
    day.pdf = day.pdfList[0] || null;
    this.saveStore();
    return day;
  }

  // 2. Images Upload / Delete
  uploadImage(dayId, imageData) {
    const day = this.getDayContent(dayId);
    const newImg = {
      id: `img-${Date.now()}`,
      title: imageData.title || 'Diagnostic ECG / Histology Diagram',
      url: imageData.url || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=900&auto=format&fit=crop&q=80',
      caption: imageData.caption || 'Clinical diagnostic specimen & ECG rhythm strip with annotated wave vectors.'
    };
    day.images = [newImg, ...(day.images || [])];
    this.saveStore();
    return day;
  }

  deleteImage(dayId, imageId) {
    const day = this.getDayContent(dayId);
    day.images = (day.images || []).filter(img => img.id !== imageId);
    this.saveStore();
    return day;
  }

  // 3. Video Upload / Link
  saveVideo(dayId, videoData) {
    const day = this.getDayContent(dayId);
    const newVideo = {
      title: videoData.title || 'Clinical Lecture: Arrhythmias & Differential Diagnosis',
      duration: videoData.duration || '42:15',
      instructor: videoData.instructor || 'Dr. Siddharth V.',
      url: videoData.url || 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      thumbnail: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&auto=format&fit=crop&q=80',
      chapters: [
        { time: '00:00', label: 'Mechanism of Reentry & Triggered Activity' },
        { time: '12:30', label: 'Narrow vs Wide Complex Tachycardia' },
        { time: '28:15', label: 'Amiodarone & Antiarrhythmic Pharmacodynamics' }
      ]
    };
    day.video = newVideo;
    this.saveStore();
    return day;
  }

  deleteVideo(dayId) {
    const day = this.getDayContent(dayId);
    day.video = null;
    this.saveStore();
    return day;
  }

  // 4. Flashcards Set
  addFlashcard(dayId, cardData) {
    const day = this.getDayContent(dayId);
    const newCard = {
      id: `fc-${Date.now()}`,
      question: cardData.question,
      answer: cardData.answer
    };
    day.flashcards = [...(day.flashcards || []), newCard];
    this.saveStore();
    return day;
  }

  deleteFlashcard(dayId, cardId) {
    const day = this.getDayContent(dayId);
    day.flashcards = (day.flashcards || []).filter(c => c.id !== cardId);
    this.saveStore();
    return day;
  }

  // Bulk Overview Matrix Helper
  getCurriculumOverview(examId, weekId) {
    const curriculum = this.getCurriculumStructure(examId);
    const selectedWeek = curriculum.weeks.find(w => w.id === String(weekId)) || curriculum.weeks[0];

    return (selectedWeek?.days || []).map(d => {
      const content = this.store[String(d.id)] || dayContentStore[String(d.id)] || {};
      const hasPdf = Boolean(content.pdf || content.pdfList?.length > 0);
      const hasImages = Boolean(content.images && content.images.length > 0);
      const hasVideo = Boolean(content.video);
      const hasFlashcards = Boolean(content.flashcards && content.flashcards.length > 0);
      const hasLive = Boolean(content.live?.hasSession);

      return {
        dayId: d.id,
        title: d.title,
        hasPdf,
        hasImages,
        hasVideo,
        hasFlashcards,
        hasLive,
        totalAssets: [hasPdf, hasImages, hasVideo, hasFlashcards, hasLive].filter(Boolean).length
      };
    });
  }

  subscribe(callback) {
    const handler = (e) => callback(e.detail || this.store);
    window.addEventListener('medprep-content-updated', handler);
    return () => window.removeEventListener('medprep-content-updated', handler);
  }
}

export const contentService = new ContentService();
