import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Sparkles, 
  FileText, 
  Video, 
  Image as ImageIcon, 
  Brain, 
  Radio, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  ArrowLeft, 
  Eye, 
  ExternalLink, 
  Clock, 
  ZoomIn, 
  X, 
  Layers, 
  UploadCloud
} from 'lucide-react';
import { curriculumService } from '../../services/curriculumService';
import { catalogService } from '../../services/catalogService';

export default function FacultyContentStudioPage() {
  const { examId = 'neet-pg', subjectId, chapterId, topicId } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState(() => catalogService.getExamById(examId) || { id: examId, name: examId.toUpperCase() });
  const [subject, setSubject] = useState(() => curriculumService.getSubjectById(subjectId));
  const [chapter, setChapter] = useState(() => curriculumService.getChapterById(chapterId));
  const [topic, setTopic] = useState(() => curriculumService.getTopicById(topicId));

  const [activeTab, setActiveTab] = useState('pdf');
  const [toastMessage, setToastMessage] = useState('');
  const [lightboxImage, setLightboxImage] = useState(null);

  // Forms
  const [newPdfTitle, setNewPdfTitle] = useState('');
  const [newPdfFile, setNewPdfFile] = useState('Cardiology_Clinical_Notes_2026.pdf');
  const [newPdfPages, setNewPdfPages] = useState(24);
  const [newPdfAuthor, setNewPdfAuthor] = useState('Dr. Sarah Jenkins');

  const [newImageTitle, setNewImageTitle] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=900&auto=format&fit=crop&q=80');
  const [newImageCaption, setNewImageCaption] = useState('');

  const [videoTitle, setVideoTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoDuration, setVideoDuration] = useState('38:40');
  const [videoInstructor, setVideoInstructor] = useState('Dr. Sarah Jenkins');

  const [newCardQ, setNewCardQ] = useState('');
  const [newCardA, setNewCardA] = useState('');
  const [flippedCardId, setFlippedCardId] = useState(null);

  const [liveTitle, setLiveTitle] = useState('');
  const [liveDate, setLiveDate] = useState('2026-09-12');
  const [liveTime, setLiveTime] = useState('20:00');
  const [liveDuration, setLiveDuration] = useState('1.5 hours');
  const [liveZoom, setLiveZoom] = useState('https://zoom.us/j/9876543210');

  const [clinicalNotes, setClinicalNotes] = useState('');

  useEffect(() => {
    const foundExam = catalogService.getExamById(examId);
    if (foundExam) setExam(foundExam);
    const foundSub = curriculumService.getSubjectById(subjectId);
    if (foundSub) setSubject(foundSub);
    const foundChap = curriculumService.getChapterById(chapterId);
    if (foundChap) setChapter(foundChap);
    const foundTopic = curriculumService.getTopicById(topicId);
    if (foundTopic) {
      setTopic(foundTopic);
      if (foundTopic.content?.video) {
        setVideoTitle(foundTopic.content.video.title || '');
        setVideoUrl(foundTopic.content.video.url || '');
        setVideoDuration(foundTopic.content.video.duration || '38:40');
        setVideoInstructor(foundTopic.content.video.instructor || 'Dr. Sarah Jenkins');
      }
      setClinicalNotes(foundTopic.content?.clinicalNotes || '');
    }
  }, [examId, subjectId, chapterId, topicId]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const persistTopicContent = (updatedContent) => {
    if (!topic) return;
    const updatedTopic = {
      ...topic,
      content: {
        ...topic.content,
        ...updatedContent
      }
    };
    curriculumService.saveTopic(updatedTopic);
    setTopic(updatedTopic);
    showToast('Topic channels saved and synchronized to candidate LMS!');
  };

  // Handlers
  const handleAddPdf = (e) => {
    e.preventDefault();
    if (!newPdfTitle.trim()) return;
    const existingPdfs = topic.content?.pdfList || (topic.content?.pdf ? [topic.content.pdf] : []);
    const newPdfItem = {
      id: `pdf-${Date.now()}`,
      title: newPdfTitle.trim(),
      fileName: newPdfFile.trim() || 'Clinical_Study_Guide.pdf',
      pages: Number(newPdfPages) || 18,
      size: `${(Math.random() * 4 + 2).toFixed(1)} MB`,
      updated: 'Just now',
      author: newPdfAuthor.trim() || 'Dr. Sarah Jenkins'
    };
    persistTopicContent({ pdfList: [...existingPdfs, newPdfItem] });
    setNewPdfTitle('');
    showToast(`PDF "${newPdfItem.title}" uploaded!`);
  };

  const handleDeletePdf = (id) => {
    const existingPdfs = topic.content?.pdfList || (topic.content?.pdf ? [topic.content.pdf] : []);
    persistTopicContent({ pdfList: existingPdfs.filter(p => p.id !== id) });
    showToast('PDF removed.');
  };

  const handleAddImage = (e) => {
    e.preventDefault();
    if (!newImageTitle.trim()) return;
    const existingImgs = topic.content?.images || [];
    const newImgItem = {
      id: `img-${Date.now()}`,
      title: newImageTitle.trim(),
      url: newImageUrl.trim(),
      caption: newImageCaption.trim() || 'Clinical diagram and diagnostic criteria.'
    };
    persistTopicContent({ images: [...existingImgs, newImgItem] });
    setNewImageTitle('');
    setNewImageCaption('');
    showToast('ECG Diagram added to lightbox!');
  };

  const handleDeleteImage = (id) => {
    const existingImgs = topic.content?.images || [];
    persistTopicContent({ images: existingImgs.filter(i => i.id !== id) });
    showToast('Diagram removed.');
  };

  const handleSaveVideo = (e) => {
    e.preventDefault();
    if (!videoUrl.trim()) return;
    const videoData = {
      title: videoTitle.trim() || topic.title,
      url: videoUrl.trim(),
      duration: videoDuration.trim() || '38:40',
      instructor: videoInstructor.trim() || 'Dr. Sarah Jenkins',
      chapters: [
        { time: '00:00', title: 'Pathophysiology & Clinical Presentation' },
        { time: '12:30', title: 'Diagnostic Criteria & ECG Recognition' },
        { time: '26:15', title: 'Emergency Management & Guidelines' }
      ]
    };
    persistTopicContent({ video: videoData });
    showToast('Video lecture synchronized!');
  };

  const handleAddFlashcard = (e) => {
    e.preventDefault();
    if (!newCardQ.trim() || !newCardA.trim()) return;
    const existing = topic.content?.flashcards || [];
    const newCard = {
      id: `fc-${Date.now()}`,
      question: newCardQ.trim(),
      answer: newCardA.trim(),
      highYield: true
    };
    persistTopicContent({ flashcards: [...existing, newCard] });
    setNewCardQ('');
    setNewCardA('');
    showToast('Active recall card added!');
  };

  const handleDeleteFlashcard = (id) => {
    const existing = topic.content?.flashcards || [];
    persistTopicContent({ flashcards: existing.filter(c => c.id !== id) });
    showToast('Card deleted.');
  };

  const handleAddLiveClass = (e) => {
    e.preventDefault();
    if (!liveTitle.trim()) return;
    const existing = topic.content?.liveClasses || [];
    const newClass = {
      id: `live-${Date.now()}`,
      topic: liveTitle.trim(),
      instructor: 'Dr. Sarah Jenkins',
      date: liveDate,
      time: liveTime,
      duration: liveDuration,
      status: 'upcoming',
      zoomLink: liveZoom.trim()
    };
    persistTopicContent({ liveClasses: [...existing, newClass] });
    setLiveTitle('');
    showToast('Live session scheduled!');
  };

  const handleSaveNotes = (e) => {
    e.preventDefault();
    persistTopicContent({ clinicalNotes: clinicalNotes.trim() });
    showToast('Clinical pearls updated!');
  };

  if (!topic) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center space-y-4">
        <h2 className="text-xl font-black text-slate-800">Topic Not Found</h2>
        <Link
          to={`/faculty/exams/${examId}/subjects/${subjectId}/chapters/${chapterId}/topics`}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Topics</span>
        </Link>
      </div>
    );
  }

  const pdfList = topic.content?.pdfList || (topic.content?.pdf ? [topic.content.pdf] : []);
  const imagesList = topic.content?.images || [];
  const flashcardsList = topic.content?.flashcards || [];
  const liveList = topic.content?.liveClasses || [];

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Link 
              to={`/faculty/exams/${examId}/subjects/${subjectId}/chapters/${chapterId}/topics`}
              className="text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-wider flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Topics</span>
            </Link>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
              Faculty Content Studio • Level 5
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {topic.title}
              </h1>
              <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                {topic.difficulty || 'High-Yield'}
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>{topic.duration || '45 mins'}</span>
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {exam?.name} ➡️ {subject?.name} ➡️ Unit #{chapter?.chapterNumber || 1}: {chapter?.title}
            </p>
          </div>
        </div>

        {/* LMS Student Preview Link */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/day/3"
            target="_blank"
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Eye className="w-4 h-4 text-slate-500" />
            <span>Candidate Preview</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </Link>
        </div>
      </div>

      {/* Studio Channel Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'pdf', label: 'PDF Notes', icon: FileText, count: pdfList.length },
          { id: 'images', label: 'Clinical Diagrams & ECG', icon: ImageIcon, count: imagesList.length },
          { id: 'video', label: 'Video Lecture', icon: Video, active: Boolean(topic.content?.video) },
          { id: 'flashcards', label: 'Active Recall Cards', icon: Brain, count: flashcardsList.length },
          { id: 'live', label: 'Live Masterclass', icon: Radio, count: liveList.length },
          { id: 'notes', label: 'Guideline Pearls', icon: Sparkles }
        ].map((tab) => {
          const TabIcon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer border ${
                isSelected
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-600/20'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <TabIcon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                  isSelected ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: PDF NOTES */}
      {activeTab === 'pdf' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in">
          {/* Upload Form */}
          <div className="lg:col-span-1 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-indigo-600" />
              <span>+ Add PDF Study Guide</span>
            </h3>
            <form onSubmit={handleAddPdf} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Guide Title</label>
                <input
                  type="text"
                  placeholder="e.g. Clinical ECG Mastery: Arrhythmias"
                  value={newPdfTitle}
                  onChange={(e) => setNewPdfTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">File Name</label>
                <input
                  type="text"
                  value={newPdfFile}
                  onChange={(e) => setNewPdfFile(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Page Count</label>
                  <input
                    type="number"
                    value={newPdfPages}
                    onChange={(e) => setNewPdfPages(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Lead Author</label>
                  <input
                    type="text"
                    value={newPdfAuthor}
                    onChange={(e) => setNewPdfAuthor(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-sm shadow-indigo-600/20"
              >
                Upload PDF Guide
              </button>
            </form>
          </div>

          {/* List of PDFs */}
          <div className="lg:col-span-2 space-y-3">
            {pdfList.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 border border-slate-200/80 text-center text-slate-400 text-xs">
                No PDF study notes uploaded yet.
              </div>
            ) : (
              pdfList.map((pdf) => (
                <div
                  key={pdf.id}
                  className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 font-black text-xs">
                      PDF
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{pdf.title}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {pdf.fileName} • {pdf.pages || 20} Pages • Authored by {pdf.author || 'Dr. Sarah Jenkins'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={`/assets/docs/${pdf.fileName}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview</span>
                    </a>
                    <button
                      onClick={() => handleDeletePdf(pdf.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: CLINICAL DIAGRAMS & ECG */}
      {activeTab === 'images' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in">
          {/* Upload Form */}
          <div className="lg:col-span-1 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-indigo-600" />
              <span>+ Add Clinical Diagram / ECG</span>
            </h3>
            <form onSubmit={handleAddImage} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Diagram Title</label>
                <input
                  type="text"
                  placeholder="e.g. 12-Lead ECG: Monomorphic VT with Fusion Beats"
                  value={newImageTitle}
                  onChange={(e) => setNewImageTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">High-Res Image URL</label>
                <input
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Diagnostic Caption & Pearl</label>
                <textarea
                  rows="3"
                  value={newImageCaption}
                  onChange={(e) => setNewImageCaption(e.target.value)}
                  placeholder="Clinical notes for candidates during lightbox inspection..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-sm shadow-indigo-600/20"
              >
                Add Diagram
              </button>
            </form>
          </div>

          {/* Grid of Diagrams */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {imagesList.map((img) => (
              <div
                key={img.id}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div
                  onClick={() => setLightboxImage(img)}
                  className="relative aspect-video bg-slate-900 cursor-pointer overflow-hidden"
                >
                  <img
                    src={img.url}
                    alt={img.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-1.5 font-bold text-xs">
                    <ZoomIn className="w-4 h-4" />
                    <span>Enlarge ECG</span>
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-slate-900 line-clamp-1">{img.title}</h4>
                    <button
                      onClick={() => handleDeleteImage(img.id)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2">{img.caption}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: VIDEO LECTURE */}
      {activeTab === 'video' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs space-y-6 animate-in fade-in max-w-3xl">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Video className="w-5 h-5 text-indigo-600" />
              <span>Video Lecture Masterclass</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Provide the high-definition Vimeo or YouTube lecture stream for this topic.
            </p>
          </div>

          <form onSubmit={handleSaveVideo} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Lecture Title</label>
              <input
                type="text"
                placeholder="e.g. Ventricular Tachycardia: Step-by-Step Diagnostic Criteria"
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Embed Video URL</label>
              <input
                type="url"
                placeholder="https://vimeo.com/123456789 or YouTube embed"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Video Duration</label>
                <input
                  type="text"
                  value={videoDuration}
                  onChange={(e) => setVideoDuration(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Instructor Name</label>
                <input
                  type="text"
                  value={videoInstructor}
                  onChange={(e) => setVideoInstructor(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-md shadow-indigo-600/20"
            >
              Save Video Lecture
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: ACTIVE RECALL FLASHCARDS */}
      {activeTab === 'flashcards' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in">
          {/* Form */}
          <div className="lg:col-span-1 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-600" />
              <span>+ Add High-Yield Card</span>
            </h3>
            <form onSubmit={handleAddFlashcard} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Question / Vignette Cue</label>
                <textarea
                  rows="3"
                  value={newCardQ}
                  onChange={(e) => setNewCardQ(e.target.value)}
                  placeholder="e.g. What is the pathognomonic finding for AV dissociation in VT?"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium resize-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Answer / Clinical Pearl</label>
                <textarea
                  rows="3"
                  value={newCardA}
                  onChange={(e) => setNewCardA(e.target.value)}
                  placeholder="Independent P waves marching across wide QRS complexes with capture/fusion beats."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition-all shadow-sm shadow-purple-600/20"
              >
                Add Flashcard
              </button>
            </form>
          </div>

          {/* Cards Display */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {flashcardsList.map((card, idx) => {
              const isFlipped = flippedCardId === card.id;
              return (
                <div
                  key={card.id}
                  onClick={() => setFlippedCardId(isFlipped ? null : card.id)}
                  className={`p-6 rounded-3xl border shadow-2xs transition-all cursor-pointer flex flex-col justify-between min-h-[160px] ${
                    isFlipped
                      ? 'bg-purple-50 border-purple-300 text-purple-900'
                      : 'bg-white border-slate-200/80 hover:border-purple-200 text-slate-900'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider">
                      <span className={isFlipped ? 'text-purple-600' : 'text-slate-400'}>
                        Card #{idx + 1} • {isFlipped ? 'Answer' : 'Question (Click to Flip)'}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFlashcard(card.id);
                        }}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-xs font-bold leading-relaxed">
                      {isFlipped ? card.answer : card.question}
                    </p>
                  </div>

                  <div className="text-[10px] font-semibold text-slate-400 pt-3">
                    {isFlipped ? 'Click to view question' : 'Click to reveal answer'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 5: LIVE MASTERCLASS */}
      {activeTab === 'live' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs space-y-6 animate-in fade-in max-w-3xl">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Radio className="w-5 h-5 text-rose-600" />
              <span>Schedule Live Grand Rounds Masterclass</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Host a live interactive discussion, case vignette review, and Q&A session for this topic.
            </p>
          </div>

          <form onSubmit={handleAddLiveClass} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Masterclass Topic</label>
              <input
                type="text"
                value={liveTitle}
                onChange={(e) => setLiveTitle(e.target.value)}
                placeholder={`Live Masterclass: ${topic.title}`}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium"
                required
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Session Date</label>
                <input
                  type="date"
                  value={liveDate}
                  onChange={(e) => setLiveDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Start Time</label>
                <input
                  type="time"
                  value={liveTime}
                  onChange={(e) => setLiveTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Duration</label>
                <input
                  type="text"
                  value={liveDuration}
                  onChange={(e) => setLiveDuration(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Zoom / Meeting Host Link</label>
              <input
                type="url"
                value={liveZoom}
                onChange={(e) => setLiveZoom(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition-all shadow-md shadow-rose-600/20"
            >
              Schedule Live Class
            </button>
          </form>
        </div>
      )}

      {/* TAB 6: CLINICAL GUIDELINE PEARLS */}
      {activeTab === 'notes' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs space-y-4 animate-in fade-in max-w-4xl">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>High-Yield Clinical Pearls & Guideline Revisions</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Guidelines from ACC/AHA, ESC, and Gold-Standard textbooks formatted for fast revision.
            </p>
          </div>

          <form onSubmit={handleSaveNotes} className="space-y-4 text-xs">
            <textarea
              rows="12"
              value={clinicalNotes}
              onChange={(e) => setClinicalNotes(e.target.value)}
              placeholder="Type clinical pearls, high-yield diagnostic pitfalls, drug of choice..."
              className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 font-mono text-xs leading-relaxed focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />

            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-md shadow-indigo-600/20"
            >
              Save Guideline Pearls
            </button>
          </form>
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-4xl w-full bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 space-y-4 p-6 text-white"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black">{lightboxImage.title}</h3>
              <button
                onClick={() => setLightboxImage(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="aspect-video bg-black flex items-center justify-center overflow-hidden rounded-2xl">
              <img
                src={lightboxImage.url}
                alt={lightboxImage.title}
                className="max-h-full max-w-full object-contain"
              />
            </div>

            <p className="text-xs text-slate-300">{lightboxImage.caption}</p>
          </div>
        </div>
      )}
    </div>
  );
}
