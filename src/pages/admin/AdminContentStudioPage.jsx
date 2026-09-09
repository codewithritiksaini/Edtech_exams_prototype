import React, { useState, useEffect, useMemo } from 'react';
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
  X, 
  Check, 
  UploadCloud, 
  AlertTriangle, 
  Search, 
  Filter,
  BookOpen, 
  ZoomIn,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown
} from 'lucide-react';
import { curriculumService } from '../../services/curriculumService';
import { catalogService } from '../../services/catalogService';

export default function AdminContentStudioPage() {
  const { examId: routeExamId, subjectId, chapterId, topicId } = useParams();
  const navigate = useNavigate();

  const [subject, setSubject] = useState(() => curriculumService.getSubjectById(subjectId));
  const effectiveExamId = routeExamId || subject?.examId || 'neet-pg';
  const [exam, setExam] = useState(() => catalogService.getExamById(effectiveExamId) || { id: effectiveExamId, name: effectiveExamId.toUpperCase(), flag: '🩺' });
  const [chapter, setChapter] = useState(() => curriculumService.getChapterById(chapterId));
  const [topic, setTopic] = useState(() => curriculumService.getTopicById(topicId));

  // Filters & State
  const [activeTypeFilter, setActiveTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Accordion Expand/Collapse State (Set of expanded asset IDs)
  const [expandedRowIds, setExpandedRowIds] = useState(new Set());

  // Modals State
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null); // null = Add, object = Edit
  const [previewAsset, setPreviewAsset] = useState(null);

  // Form State for Add / Edit Modal / Drawer
  const [selectedContentType, setSelectedContentType] = useState('pdf'); // 'pdf' | 'ppt' | 'image' | 'video' | 'flashcard' | 'live' | 'notes'
  
  // File Uploader state
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = React.useRef(null);

  // 1. PDF fields
  const [pdfTitle, setPdfTitle] = useState('');
  const [pdfFileName, setPdfFileName] = useState('Clinical_Study_Guide.pdf');
  const [pdfPages, setPdfPages] = useState(18);
  const [pdfAuthor, setPdfAuthor] = useState('Dr. Rajiv Mehta');

  // 1.5 PPT fields
  const [pptTitle, setPptTitle] = useState('');
  const [pptFileName, setPptFileName] = useState('Lecture_Slides.pptx');
  const [pptSlides, setPptSlides] = useState(25);
  const [pptAuthor, setPptAuthor] = useState('Dr. Rajiv Mehta');

  // 2. Image fields
  const [imageTitle, setImageTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=900&auto=format&fit=crop&q=80');
  const [imageCaption, setImageCaption] = useState('');

  // 3. Video fields
  const [videoTitle, setVideoTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('https://www.youtube.com/embed/dQw4w9WgXcQ');
  const [videoDuration, setVideoDuration] = useState('32:15');
  const [videoInstructor, setVideoInstructor] = useState('Dr. Rajiv Mehta');
  const [videoChaptersText, setVideoChaptersText] = useState('00:00 - Introduction\n08:12 - Murmur Auscultation\n18:40 - Clinical Case');

  // 4. Flashcard fields
  const [cardQuestion, setCardQuestion] = useState('');
  const [cardAnswer, setCardAnswer] = useState('');

  // 5. Live fields
  const [liveTitle, setLiveTitle] = useState('');
  const [liveInstructor, setLiveInstructor] = useState('Dr. Rajiv Mehta (MD, DM Cardiology)');
  const [liveDate, setLiveDate] = useState('Tomorrow');
  const [liveTime, setLiveTime] = useState('07:00 PM IST');
  const [liveDuration, setLiveDuration] = useState('75 mins');
  const [livePlatform, setLivePlatform] = useState('Zoom Live Interactive');
  const [liveJoinUrl, setLiveJoinUrl] = useState('https://zoom.us/j/9876543210');

  // 6. Clinical Notes fields
  const [notesContent, setNotesContent] = useState('');

  // File Uploader logic
  const processSelectedFile = (file) => {
    if (!file) return;
    setIsUploading(true);
    setUploadProgress(20);

    const formattedSize = file.size > 1024 * 1024 
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
      : `${(file.size / 1024).toFixed(0)} KB`;

    setTimeout(() => {
      setUploadProgress(100);
      setIsUploading(false);
      setUploadedFile({
        name: file.name,
        size: formattedSize,
        type: file.type,
        rawFile: file,
        previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
      });

      // Auto populate form values
      const cleanBaseName = file.name.replace(/\.[^/.]+$/, "").replace(/_/g, ' ');

      if (selectedContentType === 'pdf') {
        setPdfFileName(file.name);
        if (!pdfTitle) setPdfTitle(cleanBaseName);
      } else if (selectedContentType === 'ppt') {
        setPptFileName(file.name);
        if (!pptTitle) setPptTitle(cleanBaseName);
      } else if (selectedContentType === 'image') {
        if (!imageTitle) setImageTitle(cleanBaseName);
        if (file.type.startsWith('image/')) {
          setImageUrl(URL.createObjectURL(file));
        }
      } else if (selectedContentType === 'video') {
        if (!videoTitle) setVideoTitle(cleanBaseName);
      }
    }, 300);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) processSelectedFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processSelectedFile(file);
  };

  // Subscribe to changes
  useEffect(() => {
    const unsub = curriculumService.subscribeCurriculum(() => {
      const foundSub = curriculumService.getSubjectById(subjectId);
      setSubject(foundSub);
      const exId = routeExamId || foundSub?.examId || 'neet-pg';
      const foundEx = catalogService.getExamById(exId);
      if (foundEx) setExam(foundEx);
      setChapter(curriculumService.getChapterById(chapterId));
      const foundTop = curriculumService.getTopicById(topicId);
      setTopic(foundTop);
    });
    return unsub;
  }, [subjectId, chapterId, topicId, routeExamId]);

  useEffect(() => {
    const foundSub = curriculumService.getSubjectById(subjectId);
    if (foundSub) setSubject(foundSub);
    const exId = routeExamId || foundSub?.examId || 'neet-pg';
    const foundEx = catalogService.getExamById(exId);
    if (foundEx) setExam(foundEx);
    const foundChap = curriculumService.getChapterById(chapterId);
    if (foundChap) setChapter(foundChap);
    const foundTop = curriculumService.getTopicById(topicId);
    if (foundTop) setTopic(foundTop);
  }, [routeExamId, subjectId, chapterId, topicId]);

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
  };

  // Convert all content assets into unified items
  const unifiedAssets = useMemo(() => {
    if (!topic || !topic.content) return [];
    const list = [];

    // 1. PDF Guides
    const pdfs = topic.content.pdfList || (topic.content.pdf ? [topic.content.pdf] : []);
    pdfs.forEach((p, idx) => {
      list.push({
        id: p.id || `pdf-${idx}`,
        type: 'pdf',
        typeLabel: 'PDF Study Guide',
        title: p.title || p.fileName || 'Clinical PDF Document',
        subtitle: p.fileName || 'Study Guide.pdf',
        specs: `${p.pages || 15} Pages • ${p.size || '3.5 MB'}`,
        author: p.author || 'Dr. Rajiv Mehta',
        status: 'Published',
        updated: p.updated || 'Recently updated',
        raw: p
      });
    });

    // 1.5 PPT Presentations
    const ppts = topic.content.pptList || (topic.content.ppt ? [topic.content.ppt] : []);
    ppts.forEach((p, idx) => {
      list.push({
        id: p.id || `ppt-${idx}`,
        type: 'ppt',
        typeLabel: 'PPT Slide Deck',
        title: p.title || p.fileName || 'Clinical PPT Presentation',
        subtitle: p.fileName || 'Lecture_Slides.pptx',
        specs: `${p.slides || 25} Slides • ${p.size || '7.5 MB'}`,
        author: p.author || 'Dr. Rajiv Mehta',
        status: 'Published',
        updated: p.updated || 'Recently updated',
        raw: p
      });
    });

    // 2. Clinical Diagrams & Images
    const imgs = topic.content.images || [];
    imgs.forEach((img, idx) => {
      list.push({
        id: img.id || `img-${idx}`,
        type: 'image',
        typeLabel: 'Clinical Diagram',
        title: img.title || `Clinical Figure #${idx + 1}`,
        subtitle: img.caption || 'High-yield clinical diagnostic pearl',
        specs: 'High-Res Diagnostic Image',
        author: 'Clinical Lead',
        status: 'Active',
        updated: 'Attached Asset',
        thumbnail: img.url,
        raw: img
      });
    });

    // 3. Video Lecture
    if (topic.content.video && (topic.content.video.title || topic.content.video.url)) {
      const v = topic.content.video;
      list.push({
        id: v.id || 'video-primary',
        type: 'video',
        typeLabel: 'Video Lecture',
        title: v.title || `${topic.title} Video Masterclass`,
        subtitle: v.url || 'Lecture Video Stream',
        specs: `${v.duration || '35 mins'} • ${v.chapters?.length || 0} Chapters`,
        author: v.instructor || 'Dr. Rajiv Mehta',
        status: 'Published',
        updated: 'Recorded',
        thumbnail: v.thumbnail || null,
        raw: v
      });
    }

    // 4. Flashcards (Active Recall)
    const cards = topic.content.flashcards || [];
    cards.forEach((fc, idx) => {
      list.push({
        id: fc.id || `card-${idx}`,
        type: 'flashcard',
        typeLabel: 'Flashcard Q&A',
        title: fc.question || `Flashcard #${idx + 1}`,
        subtitle: fc.answer,
        specs: 'Active Recall Q&A',
        author: 'Faculty Specialist',
        status: 'Active',
        updated: 'Active Deck',
        raw: fc
      });
    });

    // 5. Live Classes
    const lives = topic.content.liveClasses || [];
    lives.forEach((live, idx) => {
      list.push({
        id: live.id || `live-${idx}`,
        type: 'live',
        typeLabel: 'Live Masterclass',
        title: live.title || 'Live Grand Rounds Masterclass',
        subtitle: `${live.date || 'Scheduled'} • ${live.time || '07:00 PM'}`,
        specs: `${live.duration || '75 mins'} • ${live.platform || 'Zoom'}`,
        author: live.instructor || 'Dr. Rajiv Mehta',
        status: live.status || 'Scheduled',
        updated: live.date || 'Upcoming',
        raw: live
      });
    });

    // 6. Clinical Pearls & Notes
    if (topic.content.clinicalNotes && topic.content.clinicalNotes.trim()) {
      list.push({
        id: 'clinical-notes-primary',
        type: 'notes',
        typeLabel: 'Clinical Pearls',
        title: 'High-Yield Clinical Pearls & Diagnostic Traps',
        subtitle: topic.content.clinicalNotes.slice(0, 100) + (topic.content.clinicalNotes.length > 100 ? '...' : ''),
        specs: 'Clinical Guideline Pearls',
        author: 'Editorial Board',
        status: 'Published',
        updated: 'Synced with LMS',
        raw: { text: topic.content.clinicalNotes }
      });
    }

    return list;
  }, [topic]);

  // Toggle single row expand
  const toggleRowExpand = (id) => {
    setExpandedRowIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedRowIds(new Set(unifiedAssets.map(a => a.id)));
  };

  const collapseAll = () => {
    setExpandedRowIds(new Set());
  };

  // 1. Assets matching Search Query
  const searchFilteredAssets = useMemo(() => {
    if (!searchQuery.trim()) return unifiedAssets;
    const q = searchQuery.toLowerCase().trim();
    return unifiedAssets.filter(item => (
      item.title.toLowerCase().includes(q) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
      (item.author && item.author.toLowerCase().includes(q)) ||
      (item.specs && item.specs.toLowerCase().includes(q))
    ));
  }, [unifiedAssets, searchQuery]);

  // 2. Relative Content Type Counts (computed from Search + Status)
  const relativeTypeCounts = useMemo(() => {
    const base = searchFilteredAssets.filter(item => {
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      return true;
    });

    const c = { all: base.length, pdf: 0, ppt: 0, image: 0, video: 0, flashcard: 0, live: 0, notes: 0 };
    base.forEach(a => {
      if (c[a.type] !== undefined) c[a.type]++;
    });
    return c;
  }, [searchFilteredAssets, statusFilter]);

  // 3. Relative Status Counts (computed from Search + Content Type)
  const relativeStatusCounts = useMemo(() => {
    const base = searchFilteredAssets.filter(item => {
      if (activeTypeFilter !== 'all' && item.type !== activeTypeFilter) return false;
      return true;
    });

    const c = { all: base.length, Published: 0, Active: 0, Scheduled: 0, Draft: 0 };
    base.forEach(a => {
      if (c[a.status] !== undefined) {
        c[a.status]++;
      } else {
        c[a.status] = 1;
      }
    });
    return c;
  }, [searchFilteredAssets, activeTypeFilter]);

  // 4. Final Filtered Assets matching all active criteria simultaneously
  const filteredAssets = useMemo(() => {
    return searchFilteredAssets.filter(item => {
      if (activeTypeFilter !== 'all' && item.type !== activeTypeFilter) return false;
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      return true;
    });
  }, [searchFilteredAssets, activeTypeFilter, statusFilter]);

  // Dynamic search placeholder based on active filters
  const searchPlaceholder = useMemo(() => {
    if (activeTypeFilter !== 'all') {
      const typeNames = {
        pdf: 'PDF Guides',
        ppt: 'PPT Slides',
        image: 'Diagrams & ECG',
        video: 'Video Lectures',
        flashcard: 'Flashcards',
        live: 'Live Sessions',
        notes: 'Clinical Pearls'
      };
      return `Search within ${typeNames[activeTypeFilter] || 'selected type'}...`;
    }
    if (statusFilter !== 'all') {
      return `Search ${statusFilter} assets...`;
    }
    return 'Search content by title, file or author...';
  }, [activeTypeFilter, statusFilter]);

  const hasActiveFilters = Boolean(searchQuery.trim() || activeTypeFilter !== 'all' || statusFilter !== 'all');

  const resetAllFilters = () => {
    setSearchQuery('');
    setActiveTypeFilter('all');
    setStatusFilter('all');
  };

  // Open Modal to Add New Asset
  const handleOpenAddModal = (defaultType = 'pdf') => {
    setEditingAsset(null);
    setSelectedContentType(defaultType);
    setUploadedFile(null);
    setUploadProgress(0);
    
    // Reset fields
    setPdfTitle('');
    setPdfFileName('Clinical_Study_Guide.pdf');
    setPdfPages(18);
    setPdfAuthor('Dr. Rajiv Mehta');

    setPptTitle('');
    setPptFileName('Lecture_Slides.pptx');
    setPptSlides(25);
    setPptAuthor('Dr. Rajiv Mehta');

    setImageTitle('');
    setImageUrl('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=900&auto=format&fit=crop&q=80');
    setImageCaption('');

    setVideoTitle('');
    setVideoUrl('https://www.youtube.com/embed/dQw4w9WgXcQ');
    setVideoDuration('32:15');
    setVideoInstructor('Dr. Rajiv Mehta');
    setVideoChaptersText('00:00 - Introduction\n08:12 - Murmur Auscultation\n18:40 - Clinical Case');

    setCardQuestion('');
    setCardAnswer('');

    setLiveTitle('');
    setLiveInstructor('Dr. Rajiv Mehta (MD, DM Cardiology)');
    setLiveDate('Tomorrow');
    setLiveTime('07:00 PM IST');
    setLiveDuration('75 mins');
    setLivePlatform('Zoom Live Interactive');
    setLiveJoinUrl('https://zoom.us/j/9876543210');

    setNotesContent(topic?.content?.clinicalNotes || '');

    setIsAddEditModalOpen(true);
  };

  // Open Modal to Edit Existing Asset
  const handleOpenEditModal = (asset) => {
    setEditingAsset(asset);
    setSelectedContentType(asset.type);
    setUploadedFile(null);
    setUploadProgress(0);

    if (asset.type === 'pdf') {
      setPdfTitle(asset.raw.title || '');
      setPdfFileName(asset.raw.fileName || 'Clinical_Study_Guide.pdf');
      setPdfPages(asset.raw.pages || 15);
      setPdfAuthor(asset.raw.author || 'Dr. Rajiv Mehta');
    } else if (asset.type === 'ppt') {
      setPptTitle(asset.raw.title || '');
      setPptFileName(asset.raw.fileName || 'Lecture_Slides.pptx');
      setPptSlides(asset.raw.slides || 25);
      setPptAuthor(asset.raw.author || 'Dr. Rajiv Mehta');
    } else if (asset.type === 'image') {
      setImageTitle(asset.raw.title || '');
      setImageUrl(asset.raw.url || '');
      setImageCaption(asset.raw.caption || '');
    } else if (asset.type === 'video') {
      setVideoTitle(asset.raw.title || '');
      setVideoUrl(asset.raw.url || '');
      setVideoDuration(asset.raw.duration || '35 mins');
      setVideoInstructor(asset.raw.instructor || 'Dr. Rajiv Mehta');
      if (asset.raw.chapters && Array.isArray(asset.raw.chapters)) {
        setVideoChaptersText(asset.raw.chapters.map(c => `${c.time} - ${c.label}`).join('\n'));
      }
    } else if (asset.type === 'flashcard') {
      setCardQuestion(asset.raw.question || '');
      setCardAnswer(asset.raw.answer || '');
    } else if (asset.type === 'live') {
      setLiveTitle(asset.raw.title || '');
      setLiveInstructor(asset.raw.instructor || 'Dr. Rajiv Mehta');
      setLiveDate(asset.raw.date || 'Tomorrow');
      setLiveTime(asset.raw.time || '07:00 PM IST');
      setLiveDuration(asset.raw.duration || '75 mins');
      setLivePlatform(asset.raw.platform || 'Zoom');
      setLiveJoinUrl(asset.raw.joinUrl || '');
    } else if (asset.type === 'notes') {
      setNotesContent(topic?.content?.clinicalNotes || '');
    }

    setIsAddEditModalOpen(true);
  };

  // Submit Add / Edit Form
  const handleSaveAsset = (e) => {
    e.preventDefault();

    if (selectedContentType === 'pdf') {
      if (!pdfTitle.trim()) return;
      const existing = topic.content?.pdfList || (topic.content?.pdf ? [topic.content.pdf] : []);
      if (editingAsset && editingAsset.type === 'pdf') {
        const updatedList = existing.map(p => {
          if (p.id === editingAsset.id) {
            return {
              ...p,
              title: pdfTitle.trim(),
              fileName: pdfFileName.trim(),
              pages: Number(pdfPages) || 15,
              author: pdfAuthor.trim()
            };
          }
          return p;
        });
        persistTopicContent({ pdfList: updatedList });
        showToast(`PDF "${pdfTitle}" updated successfully!`);
      } else {
        const newPdf = {
          id: `pdf-${Date.now()}`,
          title: pdfTitle.trim(),
          fileName: pdfFileName.trim() || 'Clinical_Study_Guide.pdf',
          pages: Number(pdfPages) || 15,
          size: uploadedFile?.size || `${(Math.random() * 3 + 2).toFixed(1)} MB`,
          updated: 'Just now',
          author: pdfAuthor.trim() || 'Faculty Lead'
        };
        persistTopicContent({ pdfList: [...existing, newPdf] });
        showToast(`PDF "${pdfTitle}" uploaded and added to topic!`);
        // Expand the newly created asset
        setExpandedRowIds(prev => new Set([...prev, newPdf.id]));
      }
    } else if (selectedContentType === 'ppt') {
      if (!pptTitle.trim()) return;
      const existing = topic.content?.pptList || (topic.content?.ppt ? [topic.content.ppt] : []);
      if (editingAsset && editingAsset.type === 'ppt') {
        const updatedList = existing.map(p => {
          if (p.id === editingAsset.id) {
            return {
              ...p,
              title: pptTitle.trim(),
              fileName: pptFileName.trim(),
              slides: Number(pptSlides) || 25,
              author: pptAuthor.trim()
            };
          }
          return p;
        });
        persistTopicContent({ pptList: updatedList });
        showToast(`Presentation "${pptTitle}" updated!`);
      } else {
        const newPpt = {
          id: `ppt-${Date.now()}`,
          title: pptTitle.trim(),
          fileName: pptFileName.trim() || 'Lecture_Slides.pptx',
          slides: Number(pptSlides) || 25,
          size: uploadedFile?.size || `${(Math.random() * 5 + 4).toFixed(1)} MB`,
          updated: 'Just now',
          author: pptAuthor.trim() || 'Dr. Rajiv Mehta'
        };
        persistTopicContent({ pptList: [...existing, newPpt] });
        showToast(`Presentation "${pptTitle}" uploaded and added!`);
        setExpandedRowIds(prev => new Set([...prev, newPpt.id]));
      }
    } else if (selectedContentType === 'image') {
      if (!imageTitle.trim()) return;
      const existing = topic.content?.images || [];
      if (editingAsset && editingAsset.type === 'image') {
        const updatedList = existing.map(img => {
          if (img.id === editingAsset.id) {
            return {
              ...img,
              title: imageTitle.trim(),
              url: imageUrl.trim(),
              caption: imageCaption.trim()
            };
          }
          return img;
        });
        persistTopicContent({ images: updatedList });
        showToast(`Diagram "${imageTitle}" updated!`);
      } else {
        const newImg = {
          id: `img-${Date.now()}`,
          title: imageTitle.trim(),
          url: imageUrl.trim() || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=900&auto=format&fit=crop&q=80',
          caption: imageCaption.trim() || 'Clinical finding and diagnostic pearl.'
        };
        persistTopicContent({ images: [...existing, newImg] });
        showToast(`Clinical diagram "${imageTitle}" added!`);
        setExpandedRowIds(prev => new Set([...prev, newImg.id]));
      }
    } else if (selectedContentType === 'video') {
      if (!videoTitle.trim()) return;
      const parsedChapters = videoChaptersText
        .split('\n')
        .map(line => line.trim())
        .filter(Boolean)
        .map(line => {
          const parts = line.split('-');
          if (parts.length >= 2) {
            return { time: parts[0].trim(), label: parts.slice(1).join('-').trim() };
          }
          return { time: '00:00', label: line };
        });

      const videoData = {
        id: 'video-primary',
        title: videoTitle.trim(),
        url: videoUrl.trim() || 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        duration: videoDuration.trim() || '35 mins',
        instructor: videoInstructor.trim() || 'Dr. Rajiv Mehta',
        chapters: parsedChapters
      };
      persistTopicContent({ video: videoData });
      showToast(`Video lecture "${videoTitle}" configured!`);
      setExpandedRowIds(prev => new Set([...prev, 'video-primary']));
    } else if (selectedContentType === 'flashcard') {
      if (!cardQuestion.trim() || !cardAnswer.trim()) return;
      const existing = topic.content?.flashcards || [];
      if (editingAsset && editingAsset.type === 'flashcard') {
        const updatedList = existing.map(fc => {
          if (fc.id === editingAsset.id) {
            return {
              ...fc,
              question: cardQuestion.trim(),
              answer: cardAnswer.trim()
            };
          }
          return fc;
        });
        persistTopicContent({ flashcards: updatedList });
        showToast('Flashcard updated!');
      } else {
        const newCard = {
          id: `fc-${Date.now()}`,
          question: cardQuestion.trim(),
          answer: cardAnswer.trim()
        };
        persistTopicContent({ flashcards: [...existing, newCard] });
        showToast('Flashcard added to active recall deck!');
        setExpandedRowIds(prev => new Set([...prev, newCard.id]));
      }
    } else if (selectedContentType === 'live') {
      if (!liveTitle.trim()) return;
      const existing = topic.content?.liveClasses || [];
      if (editingAsset && editingAsset.type === 'live') {
        const updatedList = existing.map(lc => {
          if (lc.id === editingAsset.id) {
            return {
              ...lc,
              title: liveTitle.trim(),
              instructor: liveInstructor.trim(),
              date: liveDate.trim(),
              time: liveTime.trim(),
              duration: liveDuration.trim(),
              platform: livePlatform.trim(),
              joinUrl: liveJoinUrl.trim()
            };
          }
          return lc;
        });
        persistTopicContent({ liveClasses: updatedList });
        showToast('Live session updated!');
      } else {
        const newSession = {
          id: `live-${Date.now()}`,
          title: liveTitle.trim(),
          instructor: liveInstructor.trim(),
          date: liveDate.trim(),
          time: liveTime.trim(),
          duration: liveDuration.trim(),
          platform: livePlatform.trim(),
          joinUrl: liveJoinUrl.trim(),
          status: 'Scheduled'
        };
        persistTopicContent({ liveClasses: [...existing, newSession] });
        showToast('Live masterclass scheduled!');
        setExpandedRowIds(prev => new Set([...prev, newSession.id]));
      }
    } else if (selectedContentType === 'notes') {
      persistTopicContent({ clinicalNotes: notesContent.trim() });
      showToast('Clinical pearls & guideline notes saved!');
      setExpandedRowIds(prev => new Set([...prev, 'clinical-notes-primary']));
    }

    setIsAddEditModalOpen(false);
  };

  const backTopicsUrl = routeExamId
    ? `/admin/exams/${effectiveExamId}/subjects/${subjectId}/chapters/${chapterId}/topics`
    : `/admin/subjects/${subjectId}/chapters/${chapterId}/topics`;

  if (!topic) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4">
        <Sparkles className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-base font-bold text-slate-800">Topic Not Found</h2>
        <p className="text-xs text-slate-500">The requested topic could not be located in the curriculum database.</p>
        <Link 
          to={backTopicsUrl}
          className="inline-flex px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
        >
          Back to Topics
        </Link>
      </div>
    );
  }

  const renderContentTypeBadge = (type) => {
    switch (type?.toLowerCase()) {
      case 'pdf':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 text-sky-700 border border-sky-200/80 font-black text-xs uppercase tracking-wider shadow-2xs">
            <FileText className="w-3.5 h-3.5 text-sky-600" />
            <span>PDF</span>
          </span>
        );
      case 'image':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-black text-xs uppercase tracking-wider shadow-2xs">
            <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
            <span>IMAGE</span>
          </span>
        );
      case 'video':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-200/80 font-black text-xs uppercase tracking-wider shadow-2xs">
            <Video className="w-3.5 h-3.5 text-purple-600" />
            <span>VIDEO</span>
          </span>
        );
      case 'ppt':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 text-orange-700 border border-orange-200/80 font-black text-xs uppercase tracking-wider shadow-2xs">
            <FileText className="w-3.5 h-3.5 text-orange-600" />
            <span>PPT</span>
          </span>
        );
      case 'flashcard':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200/80 font-black text-xs uppercase tracking-wider shadow-2xs">
            <Brain className="w-3.5 h-3.5 text-amber-600" />
            <span>FLASHCARD</span>
          </span>
        );
      case 'live':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200/80 font-black text-xs uppercase tracking-wider shadow-2xs">
            <Radio className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
            <span>LIVE</span>
          </span>
        );
      case 'notes':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200/80 font-black text-xs uppercase tracking-wider shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>NOTES</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200/80 font-black text-xs uppercase tracking-wider shadow-2xs">
            <span>{type?.toUpperCase() || 'FILE'}</span>
          </span>
        );
    }
  };

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
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-3">
          <div>
            <Link 
              to={backTopicsUrl}
              className="text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-wider inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Topics</span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {topic.title}
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Track: <strong className="text-slate-700">{exam?.flag} {exam?.name}</strong> • Subject: <strong className="text-slate-700">{subject?.name}</strong> • Unit #{chapter?.chapterNumber || 1}: <strong className="text-slate-700">{chapter?.title}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="shrink-0">
          <button
            onClick={() => handleOpenAddModal('pdf')}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Content Asset</span>
          </button>
        </div>
      </div>

      {/* Toolbar: Search, Content Type Dropdown, Status Dropdown & Expand/Collapse Toggle */}
      <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Left: Search Bar & Relative Filter Dropdowns */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full lg:w-auto flex-wrap">
            {/* Search Bar */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="w-4 h-4 text-slate-400 hover:text-slate-600 absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer flex items-center justify-center"
                  title="Clear search text"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Content Type Filter Dropdown (Relative) */}
            <div className="relative w-full sm:w-52">
              <Filter className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none ${activeTypeFilter !== 'all' ? 'text-indigo-600' : 'text-slate-400'}`} />
              <select
                value={activeTypeFilter}
                onChange={(e) => setActiveTypeFilter(e.target.value)}
                className={`w-full pl-8 pr-8 py-2 rounded-xl border text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer appearance-none transition-all ${
                  activeTypeFilter !== 'all'
                    ? 'bg-indigo-50/70 border-indigo-200 text-indigo-900 font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <option value="all">All Content Types ({relativeTypeCounts.all})</option>
                <option value="pdf">PDF Guides ({relativeTypeCounts.pdf})</option>
                <option value="ppt">PPT Slides ({relativeTypeCounts.ppt})</option>
                <option value="image">Diagrams & ECG ({relativeTypeCounts.image})</option>
                <option value="video">Video Lectures ({relativeTypeCounts.video})</option>
                <option value="flashcard">Flashcards ({relativeTypeCounts.flashcard})</option>
                <option value="live">Live Sessions ({relativeTypeCounts.live})</option>
                <option value="notes">Clinical Pearls ({relativeTypeCounts.notes})</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Status Filter Dropdown (Relative) */}
            <div className="relative w-full sm:w-44">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`w-full pl-3.5 pr-8 py-2 rounded-xl border text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer appearance-none transition-all ${
                  statusFilter !== 'all'
                    ? 'bg-indigo-50/70 border-indigo-200 text-indigo-900 font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <option value="all">All Status ({relativeStatusCounts.all})</option>
                <option value="Published">Published ({relativeStatusCounts.Published || 0})</option>
                <option value="Active">Active ({relativeStatusCounts.Active || 0})</option>
                <option value="Scheduled">Scheduled ({relativeStatusCounts.Scheduled || 0})</option>
                <option value="Draft">Draft ({relativeStatusCounts.Draft || 0})</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Clear All Active Filters Button */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="text-xs font-bold text-slate-500 hover:text-indigo-600 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                title="Reset all filters"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Right: Quick Stats & Expand/Collapse All */}
          <div className="flex items-center gap-2.5 text-xs font-bold w-full lg:w-auto justify-between lg:justify-end">
            <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700">
              {filteredAssets.length} of {unifiedAssets.length} Assets
            </span>

            <div className="inline-flex items-center bg-slate-100 p-0.5 rounded-xl">
              <button
                type="button"
                onClick={expandAll}
                className="px-2.5 py-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white text-[11px] font-bold transition-all cursor-pointer"
                title="Expand all asset rows"
              >
                Expand All
              </button>
              <button
                type="button"
                onClick={collapseAll}
                className="px-2.5 py-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white text-[11px] font-bold transition-all cursor-pointer"
                title="Collapse all asset rows"
              >
                Collapse All
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* EXPANDABLE ACCORDION TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs">
        <table className="w-full text-left text-xs table-fixed">
          <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
            <tr>
              <th className="py-3 px-3 w-16 text-center">S.NO.</th>
              <th className="py-3 px-4 w-[34%]">CONTENT ASSET INFO</th>
              <th className="py-3 px-4 w-[32%]">FACULTY / LEAD</th>
              <th className="py-3 px-3 w-28 text-center">FORMAT / TYPE</th>
              <th className="py-3 px-3 w-28 text-center">STATUS</th>
              <th className="py-3 px-4 w-24 text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredAssets.map((asset, idx) => {
              const isExpanded = expandedRowIds.has(asset.id);

              return (
                <React.Fragment key={asset.id}>
                  {/* TOP CORE INFO ROW */}
                  <tr className={`transition-colors ${isExpanded ? 'bg-indigo-50/25' : 'hover:bg-slate-50/70'}`}>
                    {/* S.NO. & Accordion Chevron Toggle */}
                    <td className="py-3 px-3 text-center align-middle">
                      <button
                        type="button"
                        onClick={() => toggleRowExpand(asset.id)}
                        className="inline-flex items-center gap-1.5 text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer group"
                        title={isExpanded ? "Collapse details" : "Expand details"}
                      >
                        <span className={`p-1 rounded-md transition-colors ${
                          isExpanded 
                            ? 'bg-indigo-100 text-indigo-700' 
                            : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600'
                        }`}>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </span>
                        <span className="font-mono font-bold text-xs text-slate-700">
                          #{idx + 1}
                        </span>
                      </button>
                    </td>

                    {/* CONTENT ASSET INFO */}
                    <td className="py-3 px-4 align-top">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono font-bold text-indigo-600 tracking-wider">
                            ID: {asset.id.toUpperCase().slice(0, 14)}
                          </span>
                        </div>
                        <h3 
                          onClick={() => toggleRowExpand(asset.id)} 
                          className="font-bold text-slate-900 text-xs sm:text-[13px] hover:text-indigo-600 transition-colors cursor-pointer leading-snug line-clamp-1"
                          title={asset.title}
                        >
                          {asset.title}
                        </h3>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                          {asset.type === 'pdf' && <FileText className="w-3 h-3 text-sky-600 shrink-0" />}
                          {asset.type === 'image' && <ImageIcon className="w-3 h-3 text-emerald-600 shrink-0" />}
                          {asset.type === 'video' && <Video className="w-3 h-3 text-purple-600 shrink-0" />}
                          {asset.type === 'flashcard' && <Brain className="w-3 h-3 text-amber-600 shrink-0" />}
                          {asset.type === 'live' && <Radio className="w-3 h-3 text-rose-600 shrink-0" />}
                          {asset.type === 'notes' && <Sparkles className="w-3 h-3 text-indigo-600 shrink-0" />}
                          <span className="truncate max-w-xs">{asset.subtitle || 'Clinical learning material'}</span>
                        </div>
                      </div>
                    </td>

                    {/* FACULTY / LEAD */}
                    <td className="py-3 px-4 align-top">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono font-bold text-slate-400 tracking-wider">
                            FACULTY ID: {asset.type === 'live' ? 'FAC-CAR-01' : 'FAC-NEET-01'}
                          </span>
                        </div>
                        <p className="font-bold text-slate-900 text-xs sm:text-[13px] leading-snug truncate">
                          {asset.author}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">
                          Clinical Cardiology Lead
                        </p>
                      </div>
                    </td>

                    {/* FORMAT / TYPE */}
                    <td className="py-3 px-3 text-center align-middle">
                      {renderContentTypeBadge(asset.type)}
                    </td>

                    {/* STATUS */}
                    <td className="py-3 px-3 text-center align-middle">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider uppercase border shadow-2xs ${
                        asset.status === 'Scheduled'
                          ? 'bg-rose-50 border-rose-200/80 text-rose-700'
                          : 'bg-emerald-50 border-emerald-200/80 text-emerald-700'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${asset.status === 'Scheduled' ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
                        <span>{asset.status}</span>
                      </span>
                    </td>

                    {/* ACTIONS */}
                    <td className="py-3 px-4 text-right align-middle">
                      <button
                        type="button"
                        onClick={() => toggleRowExpand(asset.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          isExpanded
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                        }`}
                      >
                        <span>{isExpanded ? 'Collapse' : 'Details'}</span>
                        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                    </td>
                  </tr>

                  {/* EXPANDED INNER BOXED ACCORDION PANEL (COMPACT & SLEEK) */}
                  {isExpanded && (
                    <tr className="bg-slate-50/70 border-t border-b border-slate-200/90 animate-in fade-in">
                      <td colSpan={6} className="px-4 py-3">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
                          
                          {/* Card 1: Specifications & Metadata (5 cols) */}
                          <div className="lg:col-span-5 bg-white rounded-xl p-3 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
                            <div>
                              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block pb-1 border-b border-slate-100">
                                SPECIFICATIONS & METADATA
                              </span>
                              <div className="pt-1.5 space-y-1 text-xs">
                                {asset.type === 'pdf' && (
                                  <>
                                    <div className="flex justify-between py-0.5 border-b border-slate-100/60 text-[11px]">
                                      <span className="text-slate-500">File Name:</span>
                                      <span className="font-mono font-bold text-slate-800 truncate max-w-[180px]">{asset.raw.fileName}</span>
                                    </div>
                                    <div className="flex justify-between py-0.5 border-b border-slate-100/60 text-[11px]">
                                      <span className="text-slate-500">Page Count:</span>
                                      <span className="font-bold text-slate-800">{asset.raw.pages} Pages</span>
                                    </div>
                                    <div className="flex justify-between py-0.5 border-b border-slate-100/60 text-[11px]">
                                      <span className="text-slate-500">File Size:</span>
                                      <span className="font-bold text-slate-800">{asset.raw.size}</span>
                                    </div>
                                    <div className="flex justify-between py-0.5 text-[11px]">
                                      <span className="text-slate-500">Author:</span>
                                      <span className="font-bold text-slate-800">{asset.raw.author}</span>
                                    </div>
                                  </>
                                )}

                                {asset.type === 'ppt' && (
                                  <>
                                    <div className="flex justify-between py-0.5 border-b border-slate-100/60 text-[11px]">
                                      <span className="text-slate-500">File Name:</span>
                                      <span className="font-mono font-bold text-slate-800 truncate max-w-[180px]">{asset.raw.fileName}</span>
                                    </div>
                                    <div className="flex justify-between py-0.5 border-b border-slate-100/60 text-[11px]">
                                      <span className="text-slate-500">Slide Count:</span>
                                      <span className="font-bold text-slate-800">{asset.raw.slides || 25} Slides</span>
                                    </div>
                                    <div className="flex justify-between py-0.5 border-b border-slate-100/60 text-[11px]">
                                      <span className="text-slate-500">File Size:</span>
                                      <span className="font-bold text-slate-800">{asset.raw.size || '7.5 MB'}</span>
                                    </div>
                                    <div className="flex justify-between py-0.5 text-[11px]">
                                      <span className="text-slate-500">Author:</span>
                                      <span className="font-bold text-slate-800">{asset.raw.author}</span>
                                    </div>
                                  </>
                                )}

                                {asset.type === 'image' && (
                                  <>
                                    <div className="flex justify-between py-0.5 border-b border-slate-100/60 text-[11px]">
                                      <span className="text-slate-500">Image Type:</span>
                                      <span className="font-bold text-slate-800">Clinical Diagnostic Diagram</span>
                                    </div>
                                    <div className="flex justify-between py-0.5 border-b border-slate-100/60 text-[11px]">
                                      <span className="text-slate-500">Resolution:</span>
                                      <span className="font-bold text-slate-800">High-Resolution Diagnostic</span>
                                    </div>
                                    <div className="flex justify-between py-0.5 text-[11px]">
                                      <span className="text-slate-500">Source:</span>
                                      <span className="font-mono font-bold text-indigo-600 truncate max-w-[180px]">Curriculum Asset</span>
                                    </div>
                                  </>
                                )}

                                {asset.type === 'video' && (
                                  <>
                                    <div className="flex justify-between py-0.5 border-b border-slate-100/60 text-[11px]">
                                      <span className="text-slate-500">Total Duration:</span>
                                      <span className="font-bold text-slate-800">{asset.raw.duration}</span>
                                    </div>
                                    <div className="flex justify-between py-0.5 border-b border-slate-100/60 text-[11px]">
                                      <span className="text-slate-500">Instructor:</span>
                                      <span className="font-bold text-slate-800">{asset.raw.instructor}</span>
                                    </div>
                                    <div className="flex justify-between py-0.5 text-[11px]">
                                      <span className="text-slate-500">Index Chapters:</span>
                                      <span className="font-bold text-slate-800">{asset.raw.chapters?.length || 0} Key Points</span>
                                    </div>
                                  </>
                                )}

                                {asset.type === 'flashcard' && (
                                  <>
                                    <div className="flex justify-between py-0.5 border-b border-slate-100/60 text-[11px]">
                                      <span className="text-slate-500">Deck Mode:</span>
                                      <span className="font-bold text-slate-800">Spaced Repetition Recall</span>
                                    </div>
                                    <div className="flex justify-between py-0.5 text-[11px]">
                                      <span className="text-slate-500">Yield:</span>
                                      <span className="font-bold text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded text-[10px] border border-amber-200">Exam Essential</span>
                                    </div>
                                  </>
                                )}

                                {asset.type === 'live' && (
                                  <>
                                    <div className="flex justify-between py-0.5 border-b border-slate-100/60 text-[11px]">
                                      <span className="text-slate-500">Broadcast:</span>
                                      <span className="font-bold text-slate-800">{asset.raw.date} @ {asset.raw.time}</span>
                                    </div>
                                    <div className="flex justify-between py-0.5 text-[11px]">
                                      <span className="text-slate-500">Platform:</span>
                                      <span className="font-bold text-slate-800">{asset.raw.platform || 'Zoom'}</span>
                                    </div>
                                  </>
                                )}

                                {asset.type === 'notes' && (
                                  <div className="py-0.5 text-[11px]">
                                    <span className="text-slate-500">Category:</span>
                                    <span className="font-bold text-slate-800 ml-2">Clinical Pearls & Guidelines</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Card 2: Clinical Context & Preview (4 cols) */}
                          <div className="lg:col-span-4 bg-white rounded-xl p-3 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
                            <div>
                              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block pb-1 border-b border-slate-100">
                                CLINICAL CONTEXT & PREVIEW
                              </span>
                              <div className="pt-1.5">
                                {asset.type === 'image' && asset.thumbnail && (
                                  <div className="flex items-center gap-2.5">
                                    <div 
                                      onClick={() => setPreviewAsset(asset)}
                                      className="w-16 h-14 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 relative cursor-pointer group shrink-0"
                                    >
                                      <img src={asset.thumbnail} alt={asset.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                      <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                                        <ZoomIn className="w-3 h-3" />
                                      </div>
                                    </div>
                                    <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                                      {asset.raw.caption}
                                    </p>
                                  </div>
                                )}

                                {asset.type === 'video' && (
                                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 text-[11px]">
                                    <p className="font-bold text-slate-800 mb-0.5 text-[10px]">Key Chapters:</p>
                                    <div className="space-y-0.5 max-h-16 overflow-y-auto">
                                      {(asset.raw.chapters || []).slice(0, 3).map((ch, i) => (
                                        <div key={i} className="flex items-center gap-1.5 text-[10px]">
                                          <span className="font-mono font-bold text-indigo-600">{ch.time}</span>
                                          <span className="text-slate-600 truncate">{ch.label}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {asset.type === 'flashcard' && (
                                  <div className="space-y-1 text-[11px]">
                                    <p className="text-slate-800 line-clamp-1"><strong className="text-slate-400 font-normal">Q:</strong> {asset.raw.question}</p>
                                    <p className="text-emerald-800 line-clamp-1"><strong className="text-emerald-600 font-normal">A:</strong> {asset.raw.answer}</p>
                                  </div>
                                )}

                                {asset.type === 'live' && (
                                  <div className="p-2 rounded-lg bg-rose-50 border border-rose-100 text-rose-900 text-[11px] space-y-0.5">
                                    <p className="font-bold text-[10px]">Live Room Link</p>
                                    <p className="text-[10px] font-mono truncate">{asset.raw.joinUrl || 'Zoom link ready'}</p>
                                  </div>
                                )}

                                {asset.type === 'pdf' && (
                                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 text-[11px] space-y-0.5">
                                    <span className="font-bold text-slate-800 block text-[10px]">Syllabus Coverage:</span>
                                    <p className="text-slate-500 text-[10px] leading-relaxed line-clamp-2">
                                      Comprehensive study guide covering diagnostic pearl criteria, hemodynamics, and exam recall.
                                    </p>
                                  </div>
                                )}

                                {asset.type === 'ppt' && (
                                  <div className="p-2 bg-orange-50/50 rounded-lg border border-orange-100 text-[11px] space-y-0.5">
                                    <span className="font-bold text-orange-900 block text-[10px]">Presentation Slide Deck:</span>
                                    <p className="text-slate-600 text-[10px] leading-relaxed line-clamp-2">
                                      Interactive clinical presentation slides optimized for high-yield visual review and faculty lectures.
                                    </p>
                                  </div>
                                )}

                                {asset.type === 'notes' && (
                                  <div className="p-2 bg-indigo-50/50 rounded-lg border border-indigo-100 text-[11px] line-clamp-2 text-slate-700">
                                    {asset.raw.text}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Card 3: QUICK ACTIONS (3 cols) - NO TRASH BUTTON! */}
                          <div className="lg:col-span-3 bg-white rounded-xl p-3 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block pb-1 border-b border-slate-100">
                              QUICK ACTIONS
                            </span>

                            <div className="space-y-1.5 pt-1.5">
                              {/* Green Preview Button */}
                              <button
                                type="button"
                                onClick={() => setPreviewAsset(asset)}
                                className="w-full py-1.5 px-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                              >
                                <Eye className="w-3.5 h-3.5 text-emerald-600" />
                                <span>View Content Details</span>
                              </button>

                              {/* Indigo Edit Button */}
                              <button
                                type="button"
                                onClick={() => handleOpenEditModal(asset)}
                                className="w-full py-1.5 px-3 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                              >
                                <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
                                <span>Edit Content Asset</span>
                              </button>
                            </div>
                          </div>

                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}

            {filteredAssets.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  <div className="max-w-xs mx-auto space-y-2">
                    <UploadCloud className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="font-bold text-xs text-slate-600">
                      {hasActiveFilters ? 'No matching content assets' : 'No content assets found'}
                    </p>
                    {hasActiveFilters ? (
                      <div className="space-y-2 pt-1">
                        <p className="text-[11px] text-slate-400">No assets match your current filter combination.</p>
                        <button
                          type="button"
                          onClick={resetAllFilters}
                          className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Clear Active Filters</span>
                        </button>
                      </div>
                    ) : (
                      <>
                        <p className="text-[11px] text-slate-400">Upload notes, images, videos or flashcards for this topic.</p>
                        <button
                          onClick={() => handleOpenAddModal('pdf')}
                          className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-xs cursor-pointer"
                        >
                          + Add Content Asset
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* SLIDE-OVER DRAWER: ADD / EDIT CONTENT ASSET */}
      {isAddEditModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
          {/* Backdrop Overlay */}
          <div 
            onClick={() => setIsAddEditModalOpen(false)}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity cursor-pointer" 
          />

          {/* Slide-over Drawer Panel */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-8 sm:pl-12 pointer-events-none">
            <div className="w-screen max-w-lg sm:max-w-xl bg-white shadow-2xl flex flex-col pointer-events-auto animate-in slide-in-from-right duration-300">
              
              {/* Drawer Header */}
              <div className="px-6 py-4.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80 shrink-0">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse" />
                    <h2 className="text-base sm:text-lg font-black text-slate-900">
                      {editingAsset ? `Edit ${editingAsset.typeLabel}` : 'Add Content Asset'}
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 truncate max-w-xs sm:max-w-sm">
                    Topic: <strong className="text-slate-800">{topic.title}</strong>
                  </p>
                </div>
                <button 
                  type="button"
                  onClick={() => setIsAddEditModalOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
                  title="Close Drawer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Scrollable Body Form */}
              <form onSubmit={handleSaveAsset} id="asset-drawer-form" className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
                
                {/* 1. Content Format / Type Selection Dropdown */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block text-xs">
                    Content Type / Format <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={selectedContentType}
                      onChange={(e) => {
                        setSelectedContentType(e.target.value);
                        setUploadedFile(null);
                      }}
                      disabled={!!editingAsset}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 appearance-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed pr-10 shadow-2xs"
                    >
                      <option value="pdf">📄 PDF Study Guide (.pdf)</option>
                      <option value="ppt">📊 PowerPoint Presentation (.ppt, .pptx)</option>
                      <option value="image">🖼️ Clinical Diagram & ECG Strip (.png, .jpg, .webp)</option>
                      <option value="video">🎥 Video Lecture Masterclass (.mp4, stream)</option>
                      <option value="flashcard">🧠 Flashcard Q&A (Spaced Repetition)</option>
                      <option value="live">📡 Live Masterclass (Zoom / Interactive)</option>
                      <option value="notes">✨ Clinical Pearls & Guidelines</option>
                    </select>
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                  {editingAsset && (
                    <p className="text-[11px] text-slate-400">Content format cannot be changed while editing an existing item.</p>
                  )}
                </div>

                {/* 2. Interactive File Uploader (for file-based content) */}
                {['pdf', 'ppt', 'image', 'video'].includes(selectedContentType) && (
                  <div className="space-y-1.5 pt-1 border-t border-slate-100">
                    <label className="font-bold text-slate-700 flex items-center justify-between text-xs">
                      <span>Upload Asset File</span>
                      <span className="text-[11px] font-normal text-slate-400">
                        {selectedContentType === 'pdf' && 'Accepts .pdf (up to 50MB)'}
                        {selectedContentType === 'ppt' && 'Accepts .ppt, .pptx (up to 100MB)'}
                        {selectedContentType === 'image' && 'Accepts .png, .jpg, .webp, .svg'}
                        {selectedContentType === 'video' && 'Accepts .mp4, .mov or stream URL'}
                      </span>
                    </label>

                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      className="hidden"
                      accept={
                        selectedContentType === 'pdf' ? '.pdf' :
                        selectedContentType === 'ppt' ? '.ppt,.pptx' :
                        selectedContentType === 'image' ? 'image/*,.png,.jpg,.jpeg,.webp' :
                        selectedContentType === 'video' ? 'video/*,.mp4,.mov' : '*'
                      }
                    />

                    {!uploadedFile ? (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed rounded-2xl p-5 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${
                          isDragging
                            ? 'border-indigo-500 bg-indigo-50/70 scale-[0.99]'
                            : 'border-slate-200 hover:border-indigo-400 bg-slate-50/70 hover:bg-slate-50'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-xl bg-white shadow-2xs border border-slate-200/80 flex items-center justify-center text-indigo-600">
                          <UploadCloud className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">
                            <span className="text-indigo-600 hover:underline">Click to browse file</span> or drag and drop here
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {selectedContentType === 'pdf' && 'Upload high-yield PDF clinical study guide'}
                            {selectedContentType === 'ppt' && 'Upload presentation slides deck (.ppt, .pptx)'}
                            {selectedContentType === 'image' && 'Upload clinical diagram, histopathology or ECG'}
                            {selectedContentType === 'video' && 'Upload MP4 lecture video or attach stream below'}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/80 space-y-2">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                              {selectedContentType === 'pdf' && <FileText className="w-4 h-4 text-sky-600" />}
                              {selectedContentType === 'ppt' && <FileText className="w-4 h-4 text-orange-600" />}
                              {selectedContentType === 'image' && <ImageIcon className="w-4 h-4 text-emerald-600" />}
                              {selectedContentType === 'video' && <Video className="w-4 h-4 text-purple-600" />}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-900 truncate">{uploadedFile.name}</p>
                              <p className="text-[11px] text-slate-400">{uploadedFile.size} • Ready for upload</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 text-[11px] font-bold transition-colors cursor-pointer"
                            >
                              Change
                            </button>
                            <button
                              type="button"
                              onClick={() => setUploadedFile(null)}
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Remove file"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Upload progress bar */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500">
                            <span className="text-emerald-600 flex items-center gap-1 font-bold">
                              <CheckCircle2 className="w-3 h-3" /> File attached successfully
                            </span>
                            <span>100%</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-emerald-500 h-full rounded-full transition-all duration-300 w-full" />
                          </div>
                        </div>

                        {/* Image Preview thumbnail if available */}
                        {uploadedFile.previewUrl && (
                          <div className="mt-2 h-24 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                            <img src={uploadedFile.previewUrl} alt="Preview" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* 3. DYNAMIC FIELDS FOR SELECTED CONTENT TYPE */}
                
                {/* Form: PDF */}
                {selectedContentType === 'pdf' && (
                  <div className="space-y-3 pt-2 border-t border-slate-100 animate-in fade-in">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Document Title</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Valvular Lesions & Auscultation Pearls"
                        value={pdfTitle}
                        onChange={(e) => setPdfTitle(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">File Name (.pdf)</label>
                      <input
                        type="text"
                        value={pdfFileName}
                        onChange={(e) => setPdfFileName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-700"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700">Page Count</label>
                        <input
                          type="number"
                          min="1"
                          value={pdfPages}
                          onChange={(e) => setPdfPages(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-700"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700">Author / Specialist</label>
                        <input
                          type="text"
                          value={pdfAuthor}
                          onChange={(e) => setPdfAuthor(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-700"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Form: PPT */}
                {selectedContentType === 'ppt' && (
                  <div className="space-y-3 pt-2 border-t border-slate-100 animate-in fade-in">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Presentation Title</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Clinical Hemodynamics Auscultation Masterclass"
                        value={pptTitle}
                        onChange={(e) => setPptTitle(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">File Name (.ppt / .pptx)</label>
                      <input
                        type="text"
                        value={pptFileName}
                        onChange={(e) => setPptFileName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-700"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700">Slide Count</label>
                        <input
                          type="number"
                          min="1"
                          value={pptSlides}
                          onChange={(e) => setPptSlides(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-700"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700">Author / Faculty</label>
                        <input
                          type="text"
                          value={pptAuthor}
                          onChange={(e) => setPptAuthor(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-700"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Form: Image / Diagram */}
                {selectedContentType === 'image' && (
                  <div className="space-y-3 pt-2 border-t border-slate-100 animate-in fade-in">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Figure Title</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Wiggers Diagram & Heart Sounds"
                        value={imageTitle}
                        onChange={(e) => setImageTitle(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Image URL / Asset Source</label>
                      <input
                        type="url"
                        required
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-700"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Clinical Diagnostic Caption</label>
                      <textarea
                        rows={2}
                        placeholder="e.g. Fig 1: Relationship of ventricular pressure and murmur timing..."
                        value={imageCaption}
                        onChange={(e) => setImageCaption(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-700"
                      />
                    </div>
                  </div>
                )}

                {/* Form: Video */}
                {selectedContentType === 'video' && (
                  <div className="space-y-3 pt-2 border-t border-slate-100 animate-in fade-in">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Lecture Title</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Auscultation Mastery & Case Discussions"
                        value={videoTitle}
                        onChange={(e) => setVideoTitle(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Video Embed URL (YouTube / Vimeo / MP4)</label>
                      <input
                        type="url"
                        required
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-700"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700">Duration (e.g. 35 mins)</label>
                        <input
                          type="text"
                          value={videoDuration}
                          onChange={(e) => setVideoDuration(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-700"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700">Instructor Name</label>
                        <input
                          type="text"
                          value={videoInstructor}
                          onChange={(e) => setVideoInstructor(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-700"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Video Chapters (one per line: time - title)</label>
                      <textarea
                        rows={3}
                        value={videoChaptersText}
                        onChange={(e) => setVideoChaptersText(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-700"
                      />
                    </div>
                  </div>
                )}

                {/* Form: Flashcard */}
                {selectedContentType === 'flashcard' && (
                  <div className="space-y-3 pt-2 border-t border-slate-100 animate-in fade-in">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Question / Clinical Prompt (Front)</label>
                      <textarea
                        rows={2}
                        required
                        placeholder="e.g. What happens to the murmur of Hypertrophic Cardiomyopathy during Valsalva maneuver?"
                        value={cardQuestion}
                        onChange={(e) => setCardQuestion(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Clinical Explanation / Answer (Back)</label>
                      <textarea
                        rows={2}
                        required
                        placeholder="e.g. Murmur INTENSIFIES because reduced venous return decreases LV cavity size."
                        value={cardAnswer}
                        onChange={(e) => setCardAnswer(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-700"
                      />
                    </div>
                  </div>
                )}

                {/* Form: Live Masterclass */}
                {selectedContentType === 'live' && (
                  <div className="space-y-3 pt-2 border-t border-slate-100 animate-in fade-in">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Broadcast Session Title</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Live Grand Rounds: Valvular Lesions Auscultation"
                        value={liveTitle}
                        onChange={(e) => setLiveTitle(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700">Date</label>
                        <input
                          type="text"
                          value={liveDate}
                          onChange={(e) => setLiveDate(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-700"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700">Time</label>
                        <input
                          type="text"
                          value={liveTime}
                          onChange={(e) => setLiveTime(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-700"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Join Link (Zoom / Meet)</label>
                      <input
                        type="url"
                        value={liveJoinUrl}
                        onChange={(e) => setLiveJoinUrl(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-700"
                      />
                    </div>
                  </div>
                )}

                {/* Form: Clinical Notes */}
                {selectedContentType === 'notes' && (
                  <div className="space-y-3 pt-2 border-t border-slate-100 animate-in fade-in">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Clinical Pearls & Guidelines Content</label>
                      <textarea
                        rows={6}
                        required
                        placeholder="Write high-yield diagnostic pearls, guidelines, and mnemonics..."
                        value={notesContent}
                        onChange={(e) => setNotesContent(e.target.value)}
                        className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-800 leading-relaxed focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                )}
              </form>

              {/* Drawer Sticky Footer */}
              <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/80 flex items-center justify-end gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsAddEditModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="asset-drawer-form"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer flex items-center gap-2"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>{editingAsset ? 'Save Changes' : 'Upload & Add Asset'}</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* PREVIEW MODAL */}
      {previewAsset && (
        <div 
          onClick={() => setPreviewAsset(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in cursor-zoom-out"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-200 space-y-4 p-6 cursor-default"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                  {previewAsset.typeLabel}
                </span>
                <h3 className="text-sm font-black text-slate-900">{previewAsset.title}</h3>
              </div>
              <button
                onClick={() => setPreviewAsset(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* PREVIEW CONTENT */}
            {previewAsset.type === 'image' && (
              <div className="space-y-3">
                <div className="max-h-[60vh] overflow-hidden rounded-2xl bg-slate-100 flex items-center justify-center">
                  <img
                    src={previewAsset.raw.url}
                    alt={previewAsset.title}
                    className="max-h-[60vh] w-auto object-contain"
                  />
                </div>
                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <strong>Clinical Caption:</strong> {previewAsset.raw.caption}
                </p>
              </div>
            )}

            {previewAsset.type === 'video' && (
              <div className="space-y-3">
                <div className="aspect-video bg-slate-900 rounded-2xl overflow-hidden shadow-inner">
                  <iframe
                    src={previewAsset.raw.url}
                    title={previewAsset.title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>Instructor: <strong>{previewAsset.raw.instructor}</strong></span>
                  <span>Duration: <strong>{previewAsset.raw.duration}</strong></span>
                </div>
              </div>
            )}

            {previewAsset.type === 'pdf' && (
              <div className="p-8 text-center space-y-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                <div className="w-16 h-16 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center mx-auto">
                  <FileText className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">{previewAsset.raw.title}</h4>
                  <p className="text-xs text-slate-500">{previewAsset.raw.fileName} • {previewAsset.raw.pages} Pages • By {previewAsset.raw.author}</p>
                </div>
                <button
                  onClick={() => alert(`Simulating viewing/downloading ${previewAsset.raw.fileName}`)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Study Guide</span>
                </button>
              </div>
            )}

            {previewAsset.type === 'ppt' && (
              <div className="p-8 text-center space-y-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                <div className="w-16 h-16 rounded-2xl bg-orange-100 text-orange-700 flex items-center justify-center mx-auto">
                  <FileText className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">{previewAsset.raw.title}</h4>
                  <p className="text-xs text-slate-500">{previewAsset.raw.fileName} • {previewAsset.raw.slides || 25} Slides • By {previewAsset.raw.author}</p>
                </div>
                <button
                  onClick={() => alert(`Simulating downloading presentation ${previewAsset.raw.fileName}`)}
                  className="px-4 py-2 rounded-xl bg-orange-600 text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Presentation Slides</span>
                </button>
              </div>
            )}

            {previewAsset.type === 'flashcard' && (
              <div className="p-6 space-y-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Question (Front)</span>
                  <p className="text-sm font-bold text-slate-900">{previewAsset.raw.question}</p>
                </div>
                <div className="pt-3 border-t border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase">Clinical Pearl (Answer)</span>
                  <p className="text-xs text-slate-700">{previewAsset.raw.answer}</p>
                </div>
              </div>
            )}

            {previewAsset.type === 'live' && (
              <div className="p-6 space-y-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                <div>
                  <h4 className="text-sm font-black text-slate-900">{previewAsset.raw.title}</h4>
                  <p className="text-xs text-slate-500 mt-1">Instructor: {previewAsset.raw.instructor} • {previewAsset.raw.date} @ {previewAsset.raw.time}</p>
                </div>
                <a
                  href={previewAsset.raw.joinUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs"
                >
                  <Radio className="w-3.5 h-3.5 animate-pulse" />
                  <span>Join Live Broadcast</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

            {previewAsset.type === 'notes' && (
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs text-slate-800 leading-relaxed whitespace-pre-line">
                {previewAsset.raw.text}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
