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
  Edit3, 
  ArrowLeft, 
  Eye, 
  ExternalLink, 
  Clock, 
  Download, 
  Play, 
  RotateCw, 
  ZoomIn, 
  X, 
  Check, 
  Layers, 
  FolderTree, 
  Copy,
  UploadCloud,
  HelpCircle,
  Maximize2
} from 'lucide-react';
import { curriculumService } from '../../services/curriculumService';
import { catalogService } from '../../services/catalogService';

export default function AdminContentStudioPage() {
  const { examId = 'neet-pg', subjectId, chapterId, topicId } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState(() => catalogService.getExamById(examId) || { id: examId, name: examId.toUpperCase() });
  const [subject, setSubject] = useState(() => curriculumService.getSubjectById(subjectId));
  const [chapter, setChapter] = useState(() => curriculumService.getChapterById(chapterId));
  const [topic, setTopic] = useState(() => curriculumService.getTopicById(topicId));

  // Active Content Tab: 'pdf' | 'images' | 'video' | 'flashcards' | 'live' | 'notes'
  const [activeTab, setActiveTab] = useState('pdf');
  const [toastMessage, setToastMessage] = useState('');

  // Image Lightbox Modal
  const [lightboxImage, setLightboxImage] = useState(null);

  // Forms State
  // 1. PDF Form
  const [newPdfTitle, setNewPdfTitle] = useState('');
  const [newPdfFile, setNewPdfFile] = useState('Clinical_Study_Notes.pdf');
  const [newPdfPages, setNewPdfPages] = useState(20);
  const [newPdfAuthor, setNewPdfAuthor] = useState('Dr. Siddharth V.');

  // 2. Image Form
  const [newImageTitle, setNewImageTitle] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=900&auto=format&fit=crop&q=80');
  const [newImageCaption, setNewImageCaption] = useState('');

  // 3. Video Form
  const [videoTitle, setVideoTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoDuration, setVideoDuration] = useState('32:15');
  const [videoInstructor, setVideoInstructor] = useState('Dr. Rajiv Mehta');
  const [videoChapters, setVideoChapters] = useState([]);
  const [newChapterTime, setNewChapterTime] = useState('');
  const [newChapterLabel, setNewChapterLabel] = useState('');

  // 4. Flashcards Form
  const [newCardQ, setNewCardQ] = useState('');
  const [newCardA, setNewCardA] = useState('');

  // 5. Live Classes Form
  const [newLiveTitle, setNewLiveTitle] = useState('');
  const [newLiveInstructor, setNewLiveInstructor] = useState('Dr. Rajiv Mehta (MD, DM Cardiology)');
  const [newLiveDate, setNewLiveDate] = useState('Tomorrow');
  const [newLiveTime, setNewLiveTime] = useState('07:00 PM - 08:15 PM IST');
  const [newLiveDuration, setNewLiveDuration] = useState('75 mins');
  const [newLivePlatform, setNewLivePlatform] = useState('Zoom Live Interactive');
  const [newLiveJoinUrl, setNewLiveJoinUrl] = useState('https://zoom.us/j/9876543210');
  const [newLiveMeetingId, setNewLiveMeetingId] = useState('987 654 3210');
  const [newLivePasscode, setNewLivePasscode] = useState('CARDIO2026');
  const [newLiveRecordingUrl, setNewLiveRecordingUrl] = useState('');

  // 6. Clinical Notes
  const [clinicalNotes, setClinicalNotes] = useState('');

  // Load initial topic data into forms
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
        setVideoDuration(foundTopic.content.video.duration || '32:15');
        setVideoInstructor(foundTopic.content.video.instructor || 'Dr. Rajiv Mehta');
        setVideoChapters(foundTopic.content.video.chapters || []);
      }
      setClinicalNotes(foundTopic.content?.clinicalNotes || '');
    }
  }, [examId, subjectId, chapterId, topicId]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
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
    showToast('Topic content saved and synchronized!');
  };

  // 1. PDF Handlers
  const handleAddPdf = (e) => {
    e.preventDefault();
    if (!newPdfTitle.trim()) return;
    const existingPdfs = topic.content?.pdfList || (topic.content?.pdf ? [topic.content.pdf] : []);
    const newPdfItem = {
      id: `pdf-${Date.now()}`,
      title: newPdfTitle.trim(),
      fileName: newPdfFile.trim() || 'Clinical_Study_Guide.pdf',
      pages: Number(newPdfPages) || 15,
      size: `${(Math.random() * 4 + 2).toFixed(1)} MB`,
      updated: 'Just now',
      author: newPdfAuthor.trim() || 'Specialist Lead'
    };
    persistTopicContent({ pdfList: [...existingPdfs, newPdfItem] });
    setNewPdfTitle('');
    showToast(`PDF "${newPdfItem.title}" uploaded!`);
  };

  const handleDeletePdf = (pdfId) => {
    const existingPdfs = topic.content?.pdfList || (topic.content?.pdf ? [topic.content.pdf] : []);
    const filtered = existingPdfs.filter(p => p.id !== pdfId);
    persistTopicContent({ pdfList: filtered });
    showToast('PDF removed.');
  };

  // 2. Image Handlers
  const handleAddImage = (e) => {
    e.preventDefault();
    if (!newImageTitle.trim()) return;
    const existingImgs = topic.content?.images || [];
    const newImgItem = {
      id: `img-${Date.now()}`,
      title: newImageTitle.trim(),
      url: newImageUrl.trim() || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=900&auto=format&fit=crop&q=80',
      caption: newImageCaption.trim() || 'Clinical finding and diagnostic pearl.'
    };
    persistTopicContent({ images: [...existingImgs, newImgItem] });
    setNewImageTitle('');
    setNewImageCaption('');
    showToast('Diagram added to clinical lightbox!');
  };

  const handleDeleteImage = (imgId) => {
    const existingImgs = topic.content?.images || [];
    persistTopicContent({ images: existingImgs.filter(i => i.id !== imgId) });
    showToast('Diagram removed.');
  };

  // 3. Video Handlers
  const handleSaveVideo = (e) => {
    e.preventDefault();
    const videoData = {
      title: videoTitle.trim() || `${topic.title} Lecture`,
      url: videoUrl.trim() || 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      duration: videoDuration.trim() || '35 mins',
      instructor: videoInstructor.trim() || 'Dr. Rajiv Mehta',
      chapters: videoChapters
    };
    persistTopicContent({ video: videoData });
  };

  const handleAddVideoChapter = () => {
    if (!newChapterTime.trim() || !newChapterLabel.trim()) return;
    setVideoChapters([...videoChapters, { time: newChapterTime.trim(), label: newChapterLabel.trim() }]);
    setNewChapterTime('');
    setNewChapterLabel('');
  };

  const handleDeleteVideoChapter = (idx) => {
    setVideoChapters(videoChapters.filter((_, i) => i !== idx));
  };

  // 4. Flashcard Handlers
  const handleAddFlashcard = (e) => {
    e.preventDefault();
    if (!newCardQ.trim() || !newCardA.trim()) return;
    const existingCards = topic.content?.flashcards || [];
    const newCard = {
      id: `fc-${Date.now()}`,
      question: newCardQ.trim(),
      answer: newCardA.trim()
    };
    persistTopicContent({ flashcards: [...existingCards, newCard] });
    setNewCardQ('');
    setNewCardA('');
    showToast('Flashcard added to active recall deck!');
  };

  const handleDeleteFlashcard = (cardId) => {
    const existingCards = topic.content?.flashcards || [];
    persistTopicContent({ flashcards: existingCards.filter(c => c.id !== cardId) });
    showToast('Flashcard removed.');
  };

  // 5. Live Session Handlers
  const handleAddLiveSession = (e) => {
    e.preventDefault();
    if (!newLiveTitle.trim()) return;
    const existingSessions = topic.content?.liveClasses || [];
    const newSession = {
      id: `live-${Date.now()}`,
      title: newLiveTitle.trim(),
      instructor: newLiveInstructor.trim(),
      date: newLiveDate.trim(),
      time: newLiveTime.trim(),
      duration: newLiveDuration.trim(),
      platform: newLivePlatform.trim(),
      joinUrl: newLiveJoinUrl.trim(),
      meetingId: newLiveMeetingId.trim(),
      passcode: newLivePasscode.trim(),
      status: 'Scheduled',
      recordingUrl: newLiveRecordingUrl.trim()
    };
    persistTopicContent({ liveClasses: [...existingSessions, newSession] });
    setNewLiveTitle('');
    showToast('Live grand rounds masterclass scheduled!');
  };

  const handleDeleteLiveSession = (sessionId) => {
    const existingSessions = topic.content?.liveClasses || [];
    persistTopicContent({ liveClasses: existingSessions.filter(s => s.id !== sessionId) });
    showToast('Live session removed.');
  };

  // 6. Clinical Notes Handler
  const handleSaveNotes = (e) => {
    e.preventDefault();
    persistTopicContent({ clinicalNotes: clinicalNotes.trim() });
  };

  if (!topic) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4">
        <Sparkles className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-base font-bold text-slate-800">Topic Not Found</h2>
        <p className="text-xs text-slate-500">The requested topic could not be located.</p>
        <Link 
          to={`/admin/subjects/${subjectId}/chapters/${chapterId}/topics`}
          className="inline-flex px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
        >
          Back to Topics
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
      {/* Toast */}
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
              to={`/admin/subjects/${subjectId}/chapters/${chapterId}/topics`}
              className="text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-wider flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Topics</span>
            </Link>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
              Level 5 • Master Content Studio
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

        {/* Action Link to Student LMS View */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            to={`/day/3`}
            target="_blank"
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            title="Preview how candidates see this content on LMS"
          >
            <Eye className="w-4 h-4 text-slate-500" />
            <span>Student Preview</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </Link>
        </div>
      </div>

      {/* Content Studio Tab Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'pdf', label: 'PDF Notes', icon: FileText, count: pdfList.length },
          { id: 'images', label: 'Clinical Diagrams & ECG', icon: ImageIcon, count: imagesList.length },
          { id: 'video', label: 'Video Lecture', icon: Video, active: Boolean(topic.content?.video) },
          { id: 'flashcards', label: 'Active Recall Cards', icon: Brain, count: flashcardsList.length },
          { id: 'live', label: 'Live Masterclass', icon: Radio, count: liveList.length },
          { id: 'notes', label: 'Clinical Guideline Pearls', icon: Sparkles }
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

      {/* TAB 1: PDF NOTES STUDIO */}
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
                <label className="font-bold text-slate-700">Document Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aortic Murmurs & Maneuvers Guide"
                  value={newPdfTitle}
                  onChange={(e) => setNewPdfTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">File Name (.pdf)</label>
                <input
                  type="text"
                  value={newPdfFile}
                  onChange={(e) => setNewPdfFile(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Page Count</label>
                  <input
                    type="number"
                    value={newPdfPages}
                    onChange={(e) => setNewPdfPages(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-700"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Author</label>
                  <input
                    type="text"
                    value={newPdfAuthor}
                    onChange={(e) => setNewPdfAuthor(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-700"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm cursor-pointer"
              >
                Upload PDF Guide
              </button>
            </form>
          </div>

          {/* PDF List */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm font-black text-slate-900">
              Attached PDF Documents ({pdfList.length})
            </h3>
            <div className="space-y-3">
              {pdfList.map((pdf) => (
                <div
                  key={pdf.id}
                  className="bg-white rounded-2xl border border-slate-200/90 p-4 flex items-center justify-between gap-4 shadow-2xs hover:shadow-xs transition-all"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{pdf.title}</h4>
                      <p className="text-[11px] text-slate-400">
                        {pdf.fileName} • {pdf.pages || 15} Pages • {pdf.size || '3.5 MB'} • By {pdf.author || 'Faculty'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => alert(`Simulating PDF download: ${pdf.fileName}`)}
                      className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 cursor-pointer"
                      title="Download PDF"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePdf(pdf.id)}
                      className="p-2 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 cursor-pointer"
                      title="Delete PDF"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {pdfList.length === 0 && (
                <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 text-xs text-slate-400">
                  No PDF study guides attached yet. Use the form on the left to upload.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CLINICAL DIAGRAMS & ECG LIGHTBOX */}
      {activeTab === 'images' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Add Diagram Bar */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs">
            <h3 className="text-sm font-black text-slate-900 mb-3 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-indigo-600" />
              <span>+ Add Clinical Diagram or ECG Strip</span>
            </h3>
            <form onSubmit={handleAddImage} className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Figure Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wiggers Diagram & Auscultation Points"
                  value={newImageTitle}
                  onChange={(e) => setNewImageTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Image URL</label>
                <input
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-700"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Clinical Diagnostic Caption</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Fig 1: Aortic stenosis pressure gradient"
                    value={newImageCaption}
                    onChange={(e) => setNewImageCaption(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-700"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shrink-0 cursor-pointer"
                  >
                    Add Image
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Diagram Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {imagesList.map((img) => (
              <div
                key={img.id}
                className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs group hover:shadow-md transition-all"
              >
                <div 
                  onClick={() => setLightboxImage(img)}
                  className="h-48 overflow-hidden relative cursor-pointer bg-slate-100"
                >
                  <img
                    src={img.url}
                    alt={img.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="px-3 py-1.5 rounded-xl bg-white/90 text-slate-900 font-bold text-xs flex items-center gap-1.5 shadow-sm">
                      <ZoomIn className="w-4 h-4 text-indigo-600" />
                      <span>Zoom Lightbox</span>
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-bold text-slate-900">{img.title}</h4>
                    <button
                      onClick={() => handleDeleteImage(img.id)}
                      className="p-1 rounded text-slate-400 hover:text-rose-600 cursor-pointer"
                      title="Delete Image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    {img.caption}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {imagesList.length === 0 && (
            <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 text-xs text-slate-400">
              No clinical diagrams or ECG strips uploaded yet. Use the bar above to add images.
            </div>
          )}
        </div>
      )}

      {/* TAB 3: VIDEO LECTURE */}
      {activeTab === 'video' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in">
          {/* Video Metadata Form */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Video className="w-4 h-4 text-indigo-600" />
              <span>Lecture Video Settings</span>
            </h3>

            <form onSubmit={handleSaveVideo} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Lecture Title</label>
                <input
                  type="text"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  placeholder="e.g. Clinical Auscultation & Murmurs"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Embed Video URL (YouTube / Vimeo embed)</label>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/embed/dQw4w9WgXcQ"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Duration</label>
                  <input
                    type="text"
                    value={videoDuration}
                    onChange={(e) => setVideoDuration(e.target.value)}
                    placeholder="32:15"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-700"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Instructor Name</label>
                  <input
                    type="text"
                    value={videoInstructor}
                    onChange={(e) => setVideoInstructor(e.target.value)}
                    placeholder="Dr. Rajiv Mehta"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-700"
                  />
                </div>
              </div>

              {/* Chapter Timestamps */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="font-bold text-slate-700 block">Chapter Timestamps</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="08:12"
                    value={newChapterTime}
                    onChange={(e) => setNewChapterTime(e.target.value)}
                    className="w-24 px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Aortic Stenosis vs Sclerosis"
                    value={newChapterLabel}
                    onChange={(e) => setNewChapterLabel(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddVideoChapter}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-xs"
                  >
                    + Add
                  </button>
                </div>

                <div className="space-y-1.5 pt-1 max-h-40 overflow-y-auto">
                  {videoChapters.map((ch, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                      <span className="font-mono font-bold text-indigo-600">{ch.time}</span>
                      <span className="flex-1 px-3 text-slate-700 truncate">{ch.label}</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteVideoChapter(idx)}
                        className="text-slate-400 hover:text-rose-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm cursor-pointer"
              >
                Save Video Configuration
              </button>
            </form>
          </div>

          {/* Video Preview */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-3">
            <h3 className="text-sm font-black text-slate-900">Lecture Player Preview</h3>
            <div className="aspect-video bg-slate-900 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
              {videoUrl ? (
                <iframe
                  src={videoUrl}
                  title="Lecture Video Preview"
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="text-center text-slate-500 text-xs space-y-2">
                  <Play className="w-8 h-8 text-slate-600 mx-auto" />
                  <p>Provide a video URL to preview playback.</p>
                </div>
              )}
            </div>
            <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
              <span className="font-bold text-slate-900 block">{videoTitle || 'Untitled Lecture'}</span>
              <p className="text-slate-500">Instructor: {videoInstructor} • Duration: {videoDuration}</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ACTIVE RECALL FLASHCARDS */}
      {activeTab === 'flashcards' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in">
          {/* Add Card Form */}
          <div className="lg:col-span-1 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Brain className="w-4 h-4 text-indigo-600" />
              <span>+ Add Flashcard</span>
            </h3>

            <form onSubmit={handleAddFlashcard} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Clinical Prompt / Question (Front)</label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Which physical exam maneuver uniquely increases HCM & MVP murmurs?"
                  value={newCardQ}
                  onChange={(e) => setNewCardQ(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">High-Yield Clinical Rationale (Back)</label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Valsalva maneuver (strain phase) and sudden standing from squatting..."
                  value={newCardA}
                  onChange={(e) => setNewCardA(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-800"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm cursor-pointer"
              >
                Add Flashcard to Deck
              </button>
            </form>
          </div>

          {/* Cards List */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm font-black text-slate-900">
              Flashcard Roster ({flashcardsList.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {flashcardsList.map((fc, i) => (
                <div
                  key={fc.id || i}
                  className="bg-white rounded-2xl border border-slate-200/90 p-4 space-y-3 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                        Card #{i + 1}
                      </span>
                      <button
                        onClick={() => handleDeleteFlashcard(fc.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 cursor-pointer"
                        title="Delete Flashcard"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Q:</span>
                      <p className="text-xs font-bold text-slate-900 leading-snug">{fc.question}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-[10px] font-bold text-emerald-600 uppercase">A:</span>
                      <p className="text-xs text-slate-600 leading-snug">{fc.answer}</p>
                    </div>
                  </div>
                </div>
              ))}

              {flashcardsList.length === 0 && (
                <div className="col-span-full bg-white rounded-3xl p-8 text-center border border-slate-200 text-xs text-slate-400">
                  No flashcards created for this topic yet.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: LIVE MASTERCLASS */}
      {activeTab === 'live' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in">
          {/* Add Live Class Form */}
          <div className="lg:col-span-1 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Radio className="w-4 h-4 text-red-600" />
              <span>Schedule Live Grand Rounds</span>
            </h3>

            <form onSubmit={handleAddLiveSession} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Broadcast Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Live Masterclass: Auscultation Maneuvers"
                  value={newLiveTitle}
                  onChange={(e) => setNewLiveTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Faculty Specialist</label>
                <input
                  type="text"
                  value={newLiveInstructor}
                  onChange={(e) => setNewLiveInstructor(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Date</label>
                  <input
                    type="text"
                    value={newLiveDate}
                    onChange={(e) => setNewLiveDate(e.target.value)}
                    placeholder="Tomorrow"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-700"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Time</label>
                  <input
                    type="text"
                    value={newLiveTime}
                    onChange={(e) => setNewLiveTime(e.target.value)}
                    placeholder="07:00 PM IST"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-700"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Zoom / Meet Join Link</label>
                <input
                  type="url"
                  value={newLiveJoinUrl}
                  onChange={(e) => setNewLiveJoinUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-700"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-sm cursor-pointer"
              >
                Publish Live Session
              </button>
            </form>
          </div>

          {/* Live Sessions List */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm font-black text-slate-900">
              Scheduled Live Masterclasses ({liveList.length})
            </h3>
            <div className="space-y-3">
              {liveList.map((live) => (
                <div
                  key={live.id}
                  className="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-3 shadow-2xs hover:shadow-xs transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{live.title}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                          <span>{live.status || 'Scheduled'}</span>
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {live.instructor} • {live.date} @ {live.time} • {live.duration}
                      </p>
                    </div>

                    <button
                      onClick={() => handleDeleteLiveSession(live.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400 text-[11px]">Platform: {live.platform || 'Zoom'}</span>
                    <a
                      href={live.joinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center gap-1"
                    >
                      <span>Join Room</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}

              {liveList.length === 0 && (
                <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 text-xs text-slate-400">
                  No live grand rounds broadcast scheduled for this topic.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: CLINICAL GUIDELINE PEARLS */}
      {activeTab === 'notes' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>High-Yield Clinical Pearls & Diagnostic Traps</span>
              </h3>
              <p className="text-xs text-slate-500">
                These pearls appear in highlighted callout boxes on the candidate's learning room.
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveNotes} className="space-y-4 text-xs">
            <textarea
              rows={8}
              value={clinicalNotes}
              onChange={(e) => setClinicalNotes(e.target.value)}
              placeholder="Write high-yield clinical pearls, diagnostic criteria, and memorization mnemonics..."
              className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 font-medium text-slate-800 leading-relaxed focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm cursor-pointer"
            >
              Save Clinical Pearls
            </button>
          </form>
        </div>
      )}

      {/* Lightbox Zoom Modal for Diagrams */}
      {lightboxImage && (
        <div 
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in cursor-zoom-out"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl border border-slate-800 space-y-4 p-6 cursor-default"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-900">{lightboxImage.title}</h3>
              <button
                onClick={() => setLightboxImage(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[65vh] overflow-hidden rounded-2xl bg-slate-100 flex items-center justify-center">
              <img
                src={lightboxImage.url}
                alt={lightboxImage.title}
                className="max-h-[65vh] w-auto object-contain"
              />
            </div>

            <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl">
              <strong>Clinical Caption:</strong> {lightboxImage.caption}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
