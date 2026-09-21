'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  FileText,
  Upload,
  Plus,
  Trash2,
  Sparkles,
  Eye,
  Download,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Calendar,
  Users,
  Layers,
  ArrowLeft,
  ArrowRight,
  Check,
  RefreshCw,
  ChevronDown,
  Info,
  Printer,
} from 'lucide-react';
import { EvidenceItem, ReportData, ReportType, UserSession } from '@/types';
import { getCurrentHijriInfo, formatHijriOnly } from '@/lib/hijri-date';
import { REPORT_CATALOG, getCategoryIdForReportType } from '@/lib/report-catalog';

export interface ReportTypeOption {
  value: ReportType;
  label: string;
  description: string;
  defaultTitle: string;
  executorLabel: string;
  secATitle: string;
  secBTitle: string;
  secCTitle: string;
  secDTitle: string;
}

export const REPORT_TYPES: ReportTypeOption[] = [
  {
    value: 'program_activity',
    label: 'برنامج / نشاط',
    description: 'مناسب لتوثيق الفعاليات والأنشطة اللاصفية والبرامج المدرسية العامة والمعارض.',
    defaultTitle: 'برنامج تعزيز المهارات والأنشطة المدرسية',
    executorLabel: 'اسم المنفذ',
    secATitle: 'الأهداف العامة للبرنامج / النشاط',
    secBTitle: 'خطوات وإجراءات التنفيذ',
    secCTitle: 'النتائج ومؤشرات الأثر',
    secDTitle: 'ملاحظات وتوصيات إضافية',
  },
  {
    value: 'teaching_strategy',
    label: 'استراتيجية تدريس',
    description: 'مناسب لتوثيق تطبيق استراتيجيات التعلم النشط والممارسات الصفية التفاعلية للدروس.',
    defaultTitle: 'استراتيجية فكر - زاوج - شارك في الحصة الصفية',
    executorLabel: 'المعلم المنفذ',
    secATitle: 'أهداف تطبيق الاستراتيجية',
    secBTitle: 'خطوات التطبيق داخل الصف',
    secCTitle: 'مخرجات التعلم وأثر الاستراتيجية',
    secDTitle: 'ملاحظات المعلم',
  },
  {
    value: 'school_initiative',
    label: 'مبادرة مدرسية',
    description: 'مناسب لتوثيق المشاريع والمبادرات التطويرية المدرسية النوعية ومراحل إنجازها.',
    defaultTitle: 'مبادرة واحة الإبداع والتطوير المدرسي',
    executorLabel: 'صاحب / فريق المبادرة',
    secATitle: 'أهداف المبادرة المدرسية',
    secBTitle: 'مراحل وخطوات التنفيذ',
    secCTitle: 'المخرجات والنتائج المحققة',
    secDTitle: 'توصيات الاستدامة والتطوير',
  },
  {
    value: 'training_workshop',
    label: 'دورة تدريبية / ورشة عمل',
    description: 'مناسب لتوثيق الورش التطويرية والبرامج التدريبية المهنية للمعلمين أو الطلاب.',
    defaultTitle: 'ورشة عمل توظيف التطبيقات الرقمية في التدريس',
    executorLabel: 'المدرب / مقدم الورشة',
    secATitle: 'أهداف الدورة / الورشة',
    secBTitle: 'محاور التدريب وخطة العمل',
    secCTitle: 'مخرجات التدريب والمكتسبات',
    secDTitle: 'ملاحظات / تقييم الورشة',
  },
  {
    value: 'meeting',
    label: 'اجتماع / لقاء',
    description: 'مناسب لتوثيق الاجتماعات الدورية واللجان المدرسية وجداول الأعمال والقرارات.',
    defaultTitle: 'اجتماع لجنة التوجيه الطلابي لمتابعة الانضباط المدرسي',
    executorLabel: 'رئيس / منسق الاجتماع',
    secATitle: 'محاور الاجتماع / جدول الأعمال',
    secBTitle: 'أبرز ما تم مناقشته خلال اللقاء',
    secCTitle: 'القرارات والتوصيات المعتمدة',
    secDTitle: 'موعد الاجتماع القادم / ملاحظات',
  },
  {
    value: 'occasion',
    label: 'يوم عالمي / مناسبة',
    description: 'مناسب لتوثيق الاحتفاء بالأيام العالمية والوطنية والمناسبات التعليمية الخاصة.',
    defaultTitle: 'فعاليات الاحتفاء باليوم العالمي للغة العربية',
    executorLabel: 'المشرف على الفعالية',
    secATitle: 'أهداف تفعيل المناسبة',
    secBTitle: 'الفعاليات والأنشطة المنفذة',
    secCTitle: 'تفاعل الطلاب ومؤشرات المشاركة',
    secDTitle: 'أثر التفعيل / كلمة ختامية',
  },
  {
    value: 'classroom_visit',
    label: 'زيارة صفية / زيارة تبادلية',
    description: 'مناسب لتوثيق الزيارات الإشرافية والزيارات التبادلية بين المعلمين ونقل الخبرات.',
    defaultTitle: 'زيارة صفية تبادلية لتبادل الممارسات التدريسية المتميزة',
    executorLabel: 'المعلم المزار',
    secATitle: 'الهدف من الزيارة الصفية',
    secBTitle: 'الممارسات التدريسية المتميزة الملاحظة',
    secCTitle: 'الملاحظات التطويرية المشتركة',
    secDTitle: 'التوصيات / خطة نقل الخبرة',
  },
  {
    value: 'results_analysis',
    label: 'تحليل نتائج / خطة علاجية',
    description: 'مناسب لتوثيق تحليل نتائج الاختبارات، تشخيص الفجوات، وتطبيق الخطط العلاجية.',
    defaultTitle: 'تحليل نتائج الاختبار وتشخيص الفجوات وتطبيق الخطة العلاجية',
    executorLabel: 'المعلم المحلل',
    secATitle: 'نقاط القوة الملاحظة في النتائج',
    secBTitle: 'الفجوات ونقاط الضعف التعليمية',
    secCTitle: 'الإجراءات والخطط العلاجية المنفذة',
    secDTitle: 'مؤشرات التحسن بعد العلاج والمتابعة',
  },
];

interface ReportBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message?: string) => void;
  indicatorId: string;
  indicatorCode?: string;
  indicatorText?: string;
  currentUser: UserSession | null;
  initialEvidence?: EvidenceItem | null;
}

export const ReportBuilderModal: React.FC<ReportBuilderModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  indicatorId,
  indicatorCode,
  indicatorText,
  currentUser,
  initialEvidence,
}) => {
  const [activeTab, setActiveTab] = useState<'form' | 'preview' | 'final'>('form');

  // بيانات التقرير
  const [reportType, setReportType] = useState<ReportType>('program_activity');
  const [catalogCategoryId, setCatalogCategoryId] = useState<string>(() =>
    getCategoryIdForReportType('program_activity')
  );
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'برنامج' | 'نشاط'>('برنامج');
  const [executor, setExecutor] = useState('');
  const [date, setDate] = useState(() => getCurrentHijriInfo().hijriDate);
  const [audience, setAudience] = useState('جميع طلاب المدرسة');
  const [beneficiariesCount, setBeneficiariesCount] = useState('');

  // حقول خاصة بالأنواع
  const [subject, setSubject] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [tools, setTools] = useState<string[]>(['أوراق عمل تفاعلية', 'شاشة العرض الذكية']);
  const [initiativeIdea, setInitiativeIdea] = useState('');
  const [visitingTeacher, setVisitingTeacher] = useState('');
  const [visitedTeacher, setVisitedTeacher] = useState('');
  const [visitPeriod, setVisitPeriod] = useState('الحصة الثالثة');
  const [nextMeetingDate, setNextMeetingDate] = useState('');
  const [occasionSignificance, setOccasionSignificance] = useState('');
  const [weaknesses, setWeaknesses] = useState<string[]>(['صعوبة في مهارات التفكير الناقد وحل المشكلات']);

  // القوائم النصية العامة
  const [objectives, setObjectives] = useState<string[]>(['']);
  const [steps, setSteps] = useState<string[]>(['']);
  const [outcomes, setOutcomes] = useState<string[]>(['']);
  const [images, setImages] = useState<Array<{ url: string; caption?: string }>>([]);
  const [notes, setNotes] = useState('');

  // حالات المعالجة
  const [uploadingImage, setUploadingImage] = useState(false);
  const [enhancingAi, setEnhancingAi] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [generatedPdfUrl, setGeneratedPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [availableDraft, setAvailableDraft] = useState<any | null>(null);

  // إدارة وضع المعاينة المتجاوبة وتصغير A4 المتناسب
  const [previewZoomMode, setPreviewZoomMode] = useState<'fit' | '100%'>('fit');
  const [previewScale, setPreviewScale] = useState(1);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const previewIframeRef = useRef<HTMLIFrameElement>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEditing = !!initialEvidence;

  const currentTypeConfig = REPORT_TYPES.find((r) => r.value === reportType) || REPORT_TYPES[0];
  const activeCategory =
    REPORT_CATALOG.find((c) => c.id === catalogCategoryId) || REPORT_CATALOG[0];

  // اختيار النوع (الخطوة الأولى) ثم إظهار قائمة القوالب الخاصة به
  const handleSelectCategory = (categoryId: string) => {
    const cat = REPORT_CATALOG.find((c) => c.id === categoryId);
    if (!cat) return;
    setCatalogCategoryId(cat.id);
    setSelectedTemplate('');
    setReportType(cat.reportType);
  };

  // اختيار القالب (الخطوة الثانية) يعبّئ عنوان التقرير فقط حالياً
  const handleSelectTemplate = (item: string) => {
    setSelectedTemplate(item);
    if (!item) return;
    setTitle(item);
    if (item.includes('نشاط') || item.includes('فعالية')) {
      setType('نشاط');
    } else if (item.includes('برنامج') || item.includes('استراتيجية') || item.includes('مبادرة')) {
      setType('برنامج');
    }
  };

  // مزامنة النوع المختار عند تغيّر نوع التقرير (تحميل شاهد أو استعادة مسودة)
  useEffect(() => {
    setCatalogCategoryId((prev) => {
      const stillValid = REPORT_CATALOG.find((c) => c.id === prev && c.reportType === reportType);
      return stillValid ? prev : getCategoryIdForReportType(reportType);
    });
  }, [reportType]);

  const getDraftKey = (rType = reportType) => {
    const uid = currentUser?.id || 'guest';
    return `report-draft:${uid}:${indicatorId}:${rType}`;
  };

  useEffect(() => {
    if (initialEvidence && initialEvidence.reportData) {
      try {
        const parsed: ReportData = JSON.parse(initialEvidence.reportData);
        setReportType((parsed.reportType as ReportType) || 'program_activity');
        setTitle(parsed.title || initialEvidence.title || '');
        setType(parsed.type === 'نشاط' ? 'نشاط' : 'برنامج');
        setExecutor(parsed.executor || '');
        setDate(formatHijriOnly(parsed.date || ''));
        setAudience(parsed.audience || '');
        setBeneficiariesCount(parsed.beneficiariesCount || '');
        setSubject(parsed.subject || '');
        setGradeLevel(parsed.gradeLevel || '');
        setTools(parsed.tools && parsed.tools.length > 0 ? parsed.tools : ['أوراق عمل تفاعلية', 'شاشة العرض الذكية']);
        setInitiativeIdea(parsed.initiativeIdea || '');
        setVisitingTeacher(parsed.visitingTeacher || '');
        setVisitedTeacher(parsed.visitedTeacher || '');
        setVisitPeriod(parsed.visitPeriod || 'الحصة الثالثة');
        setNextMeetingDate(parsed.nextMeetingDate || '');
        setOccasionSignificance(parsed.occasionSignificance || '');
        setWeaknesses(parsed.weaknesses && parsed.weaknesses.length > 0 ? parsed.weaknesses : ['صعوبة في مهارات التفكير الناقد وحل المشكلات']);
        setObjectives(parsed.objectives && parsed.objectives.length > 0 ? parsed.objectives : ['']);
        setSteps(parsed.steps && parsed.steps.length > 0 ? parsed.steps : ['']);
        setOutcomes(parsed.outcomes && parsed.outcomes.length > 0 ? parsed.outcomes : ['']);
        setImages(parsed.images || []);
        setNotes(parsed.notes || '');
        setGeneratedPdfUrl(initialEvidence.pdfUrl || initialEvidence.url || null);
      } catch (err) {
        console.error('Parse reportData error:', err);
      }
    } else {
      setReportType('program_activity');
      setTitle('');
      setType('برنامج');
      setExecutor(currentUser?.name || '');
      setDate(getCurrentHijriInfo().hijriDate);
      setAudience('جميع طلاب المدرسة');
      setBeneficiariesCount('');
      setSubject('');
      setGradeLevel('');
      setTools(['أوراق عمل تفاعلية', 'شاشة العرض الذكية']);
      setInitiativeIdea('');
      setVisitingTeacher(currentUser?.name || '');
      setVisitedTeacher('');
      setVisitPeriod('الحصة الثالثة');
      setNextMeetingDate('');
      setOccasionSignificance('');
      setWeaknesses(['صعوبة في مهارات التفكير الناقد وحل المشكلات']);
      setObjectives(['تنمية المهارات المعرفية والتطبيقية للمتعلمين']);
      setSteps(['التخطيط للنشاط وإعداد الموارد اللازمة', 'تنفيذ الفعاليات بمشاركة الطلاب المستهدفين']);
      setOutcomes(['تحقيق أثر إيجابي ودافعية مرتفعة نحو التعلم']);
      setImages([]);
      setNotes('');
      setGeneratedPdfUrl(null);
    }
    setActiveTab('form');
    setError(null);
  }, [initialEvidence, isOpen, currentUser]);

  // فحص المسودات المحفوظة عند فتح النموذج
  useEffect(() => {
    if (!isOpen || isEditing) {
      setAvailableDraft(null);
      return;
    }
    try {
      const key = getDraftKey(reportType);
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && (parsed.title || (parsed.objectives && parsed.objectives.some((o: string) => o.trim())))) {
          setAvailableDraft(parsed);
        }
      }
    } catch (e) {
      console.warn('Draft check error:', e);
    }
  }, [isOpen, reportType, indicatorId, currentUser, isEditing]);

  // حفظ تلقائي للمسودة في localStorage مع تجنب تخزين base64
  useEffect(() => {
    if (!isOpen || isEditing) return;

    const timer = setTimeout(() => {
      try {
        const safeImages = (images || [])
          .filter(img => img.url && !img.url.startsWith('data:image'))
          .map(img => ({ url: img.url, caption: img.caption }));

        const draftObj = {
          savedAt: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
          reportType,
          title,
          type,
          executor,
          date,
          audience,
          beneficiariesCount,
          subject,
          gradeLevel,
          tools,
          initiativeIdea,
          visitingTeacher,
          visitedTeacher,
          visitPeriod,
          nextMeetingDate,
          occasionSignificance,
          weaknesses,
          objectives,
          steps,
          outcomes,
          images: safeImages,
          notes,
        };

        if (title.trim() || objectives.some(o => o.trim()) || notes.trim()) {
          const key = getDraftKey(reportType);
          localStorage.setItem(key, JSON.stringify(draftObj));
        }
      } catch (e) {
        console.warn('Auto-save error:', e);
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [
    isOpen,
    isEditing,
    reportType,
    title,
    type,
    executor,
    date,
    audience,
    beneficiariesCount,
    subject,
    gradeLevel,
    tools,
    initiativeIdea,
    visitingTeacher,
    visitedTeacher,
    visitPeriod,
    nextMeetingDate,
    occasionSignificance,
    weaknesses,
    objectives,
    steps,
    outcomes,
    images,
    notes,
  ]);

  // تحديث نسبة التصغير لورقة A4 هندسياً لمطابقة شاشات الجوال بدقة ومنع أي تداخل
  useEffect(() => {
    if (!isOpen) return;

    const updateScale = () => {
      if (previewContainerRef.current && previewZoomMode === 'fit') {
        const containerWidth = previewContainerRef.current.clientWidth - 24;
        if (containerWidth < 794) {
          const s = Math.max(0.35, Math.min(1, containerWidth / 794));
          setPreviewScale(s);
        } else {
          setPreviewScale(1);
        }
      } else {
        setPreviewScale(1);
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [isOpen, activeTab, previewZoomMode, previewHtml]);

  const handleRestoreDraft = () => {
    if (!availableDraft) return;
    try {
      if (availableDraft.title) setTitle(availableDraft.title);
      if (availableDraft.type) setType(availableDraft.type);
      if (availableDraft.executor) setExecutor(availableDraft.executor);
      if (availableDraft.date) setDate(availableDraft.date);
      if (availableDraft.audience) setAudience(availableDraft.audience);
      if (availableDraft.beneficiariesCount) setBeneficiariesCount(availableDraft.beneficiariesCount);
      if (availableDraft.subject) setSubject(availableDraft.subject);
      if (availableDraft.gradeLevel) setGradeLevel(availableDraft.gradeLevel);
      if (availableDraft.tools?.length) setTools(availableDraft.tools);
      if (availableDraft.initiativeIdea) setInitiativeIdea(availableDraft.initiativeIdea);
      if (availableDraft.visitingTeacher) setVisitingTeacher(availableDraft.visitingTeacher);
      if (availableDraft.visitedTeacher) setVisitedTeacher(availableDraft.visitedTeacher);
      if (availableDraft.visitPeriod) setVisitPeriod(availableDraft.visitPeriod);
      if (availableDraft.nextMeetingDate) setNextMeetingDate(availableDraft.nextMeetingDate);
      if (availableDraft.occasionSignificance) setOccasionSignificance(availableDraft.occasionSignificance);
      if (availableDraft.weaknesses?.length) setWeaknesses(availableDraft.weaknesses);
      if (availableDraft.objectives?.length) setObjectives(availableDraft.objectives);
      if (availableDraft.steps?.length) setSteps(availableDraft.steps);
      if (availableDraft.outcomes?.length) setOutcomes(availableDraft.outcomes);
      if (availableDraft.images?.length) setImages(availableDraft.images);
      if (availableDraft.notes) setNotes(availableDraft.notes);
      setAvailableDraft(null);
    } catch (e) {
      console.error('Error restoring draft:', e);
    }
  };

  const handleDiscardDraft = () => {
    try {
      const key = getDraftKey(reportType);
      localStorage.removeItem(key);
    } catch (e) {}
    setAvailableDraft(null);
  };

  // إدارة قوائم النصوص الديناميكية
  const updateItem = (list: string[], setList: (v: string[]) => void, idx: number, val: string) => {
    const next = [...list];
    next[idx] = val;
    setList(next);
  };

  const addItem = (list: string[], setList: (v: string[]) => void) => {
    setList([...list, '']);
  };

  const removeItem = (list: string[], setList: (v: string[]) => void, idx: number) => {
    if (list.length === 1) {
      setList(['']);
      return;
    }
    setList(list.filter((_, i) => i !== idx));
  };

  // تصغير وضغط الصورة في المتصفح عبر HTML5 Canvas بحد أقصى 1600px قبل رفعها
  const compressImageInBrowser = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;

      img.onload = () => {
        const maxDimension = 1600;
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else resolve(file);
          },
          'image/jpeg',
          0.85
        );
      };
      img.onerror = reject;

      reader.readAsDataURL(file);
    });
  };

  // رفع الصور
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > 6) {
      setError('الحد الأقصى للصور في التقرير هو 6 صور.');
      return;
    }

    setUploadingImage(true);
    setError(null);

    try {
      for (let i = 0; i < files.length; i++) {
        const originalFile = files[i];
        const compressedBlob = await compressImageInBrowser(originalFile);

        const formData = new FormData();
        formData.append('file', compressedBlob, originalFile.name);

        const res = await fetch('/api/upload/image', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'فشل رفع الصورة');

        setImages((prev) => [...prev, { url: data.url, caption: '' }]);
      }
    } catch (err: any) {
      setError(err.message || 'خطأ أثناء رفع الصورة');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // النصوص الافتراضية الأولية التي يتم استبدالها بصياغة الذكاء الاصطناعي المخصصة للعنوان
  const DEFAULT_BOILERPLATES = [
    'تنمية المهارات المعرفية والتطبيقية للمتعلمين',
    'التخطيط للنشاط وإعداد الموارد اللازمة',
    'تنفيذ الفعاليات بمشاركة الطلاب المستهدفين',
    'تحقيق أثر إيجابي ودافعية مرتفعة نحو التعلم',
    'صعوبة في مهارات التفكير الناقد وحل المشكلات',
    'أوراق عمل تفاعلية',
    'شاشة العرض الذكية',
  ];

  // دمج ذكي يلتقط العنوان ويملأ الحقول المضافة من المستخدم أو يستبدل النصوص العامة الافتراضية
  const fillListWithAi = (
    userList: string[],
    aiList?: string[],
    boilerplates: string[] = DEFAULT_BOILERPLATES
  ): string[] => {
    if (!aiList || aiList.length === 0) {
      return userList.length > 0 ? userList : [''];
    }

    const result = [...userList];
    const aiQueue = [...aiList];

    // الخطوة 1: استبدال الخانات الفارغة أو الخانات التي تحوي نصاً عاماً قديماً بصياغة الذكاء الاصطناعي
    for (let i = 0; i < result.length; i++) {
      const currentVal = (result[i] || '').trim();
      const isBoilerplate = boilerplates.some((b) => b.trim() === currentVal);
      if (!currentVal || isBoilerplate) {
        if (aiQueue.length > 0) {
          result[i] = aiQueue.shift()!;
        }
      }
    }

    // الخطوة 2: إذا بقيت عناصر من الذكاء الاصطناعي لم تُدرج بعد، ندرج المتبقي
    while (aiQueue.length > 0) {
      const nextItem = aiQueue.shift()!;
      if (!result.includes(nextItem)) {
        result.push(nextItem);
      }
    }

    return result.length > 0 ? result : [''];
  };

  // إعداد التقرير بالذكاء الاصطناعي بأسلوب تربوي سعودي مهني ومباشر يلتقط العنوان الفعلي ويملأ جميع البنود
  const handleAiEnhance = async () => {
    setEnhancingAi(true);
    setError(null);

    const effectiveTitle = title.trim() || currentTypeConfig.defaultTitle;
    if (!title.trim()) {
      setTitle(effectiveTitle);
    }

    try {
      const res = await fetch('/api/ai/enhance-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportType,
          title: effectiveTitle,
          type,
          subject: subject.trim(),
          gradeLevel: gradeLevel.trim(),
          audience: audience.trim(),
          objectives,
          steps,
          outcomes,
          weaknesses,
          tools,
          notes: notes.trim(),
          requestedCounts: {
            objectives: Math.max(objectives.length, 3),
            steps: Math.max(steps.length, 4),
            outcomes: Math.max(outcomes.length, 3),
            weaknesses: Math.max(weaknesses.length, 3),
            tools: Math.max(tools.length, 3),
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل إعداد التقرير بالذكاء الاصطناعي');

      if (data.enhanced) {
        if (data.enhanced.objectives?.length) {
          setObjectives((prev) => fillListWithAi(prev, data.enhanced.objectives));
        }
        if (data.enhanced.steps?.length) {
          setSteps((prev) => fillListWithAi(prev, data.enhanced.steps));
        }
        if (data.enhanced.outcomes?.length) {
          setOutcomes((prev) => fillListWithAi(prev, data.enhanced.outcomes));
        }
        if (data.enhanced.tools?.length) {
          setTools((prev) => fillListWithAi(prev, data.enhanced.tools));
        }
        if (data.enhanced.weaknesses?.length) {
          setWeaknesses((prev) => fillListWithAi(prev, data.enhanced.weaknesses));
        }
        if (data.enhanced.notes && (!notes.trim() || notes.includes('استثمار مخرجات'))) {
          setNotes(data.enhanced.notes);
        }
        if (data.enhanced.initiativeIdea) {
          setInitiativeIdea(data.enhanced.initiativeIdea);
        }
        if (data.enhanced.occasionSignificance) {
          setOccasionSignificance(data.enhanced.occasionSignificance);
        }
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء إعداد التقرير بالذكاء الاصطناعي');
    } finally {
      setEnhancingAi(false);
    }
  };

  // تكوين كائن البيانات المهيكلة
  const getReportDataObject = (): ReportData => {
    return {
      reportType,
      title: title.trim(),
      type,
      executor: executor.trim() || currentUser?.name || '',
      date,
      audience: audience.trim(),
      beneficiariesCount: beneficiariesCount.trim(),
      subject: subject.trim() || undefined,
      gradeLevel: gradeLevel.trim() || undefined,
      tools: tools.map((t) => t.trim()).filter(Boolean),
      initiativeIdea: initiativeIdea.trim() || undefined,
      visitingTeacher: visitingTeacher.trim() || undefined,
      visitedTeacher: visitedTeacher.trim() || undefined,
      visitPeriod: visitPeriod.trim() || undefined,
      nextMeetingDate: nextMeetingDate.trim() || undefined,
      occasionSignificance: occasionSignificance.trim() || undefined,
      weaknesses: weaknesses.map((w) => w.trim()).filter(Boolean),
      objectives: objectives.map((o) => o.trim()).filter(Boolean),
      steps: steps.map((s) => s.trim()).filter(Boolean),
      outcomes: outcomes.map((o) => o.trim()).filter(Boolean),
      images,
      notes: notes.trim() || undefined,
    };
  };

  // الانتقال للمعاينة الحية Live HTML Preview
  const handleSwitchToPreview = async () => {
    setError(null);
    setLoadingPreview(true);
    const effectiveTitle = title.trim() || currentTypeConfig.defaultTitle;
    const reportData = {
      ...getReportDataObject(),
      title: effectiveTitle,
    };

    try {
      const res = await fetch('/api/reports/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportData,
          indicatorCode,
          indicatorText,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'فشل في إنشاء المعاينة');
      }
      if (data.html) {
        setPreviewHtml(data.html);
        setActiveTab('preview');
      }
    } catch (err: any) {
      console.error('Preview error:', err);
      setError(err.message || 'حدث خطأ أثناء تحميل المعاينة الحية');
    } finally {
      setLoadingPreview(false);
    }
  };

  // دالة الطباعة وحفظ التقرير كـ PDF المباشرة من المتصفح
  const handlePrintReport = () => {
    if (previewIframeRef.current?.contentWindow) {
      previewIframeRef.current.contentWindow.focus();
      previewIframeRef.current.contentWindow.print();
    }
  };

  // توليد PDF النهائي ونقله للتبويب النهائي بسلاسة
  const handleGenerateFinalPdf = async () => {
    setGeneratingPdf(true);
    setError(null);

    const reportData = getReportDataObject();

    // التأكد من توفر كود المعاينة HTML
    if (!previewHtml) {
      try {
        const pRes = await fetch('/api/reports/preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reportData, indicatorCode, indicatorText }),
        });
        const pData = await pRes.json();
        if (pData.html) setPreviewHtml(pData.html);
      } catch (e) {}
    }

    try {
      const res = await fetch('/api/reports/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportData,
          indicatorCode,
          indicatorText,
        }),
      });

      const data = await res.json();
      if (res.ok && data.pdfUrl) {
        setGeneratedPdfUrl(data.pdfUrl);
      }
      // الانتقال مباشرة إلى تبويب النسخة النهائية دون إظهار خطأ يربك المستخدم
      setActiveTab('final');
    } catch (err: any) {
      console.warn('PDF generation fallback to direct print/save:', err);
      setActiveTab('final');
    } finally {
      setGeneratingPdf(false);
    }
  };

  // حفظ وإرسال التقرير للمراجعة (حالة pending)
  const handleSaveAndSubmit = async () => {
    setSubmitting(true);
    setError(null);

    const reportData = getReportDataObject();

    try {
      const endpoint = isEditing ? `/api/evidences/${initialEvidence.id}` : '/api/evidences';
      const method = isEditing ? 'PATCH' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          indicatorId,
          title: title.trim(),
          evidenceType: 'report',
          subType: reportType,
          reportData,
          pdfUrl: generatedPdfUrl,
          url: generatedPdfUrl,
          description: `توثيق ${currentTypeConfig.label}: ${title.trim()}`,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل حفظ التقرير');

      // مسح المسودة المحفوظة تلقائياً بعد الإرسال الناجح
      try {
        const key = getDraftKey(reportType);
        localStorage.removeItem(key);
      } catch (e) {}

      onSuccess(isEditing ? 'تم تعديل التقرير وإعادة إرساله بنجاح' : 'تم حفظ التقرير وإرساله للمراجعة بنجاح');
      onClose();
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء الحفظ');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[96vh] sm:max-h-[92vh]">
        {/* رأس النافذة والتبويبات */}
        <div className="p-4 sm:px-6 sm:py-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 relative">
          <div className="pl-8 sm:pl-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-moe-700 bg-moe-50 px-2.5 py-0.5 rounded border border-moe-200">
                توثيق مدرسي A4
              </span>
              {indicatorCode && (
                <span className="text-xs text-slate-500 font-mono dir-ltr inline-block">
                  مؤشر: {indicatorCode}
                </span>
              )}
            </div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 mt-0.5">
              {isEditing ? 'تعديل تقرير التوثيق' : `إنشاء تقرير: ${currentTypeConfig.label}`}
            </h2>
          </div>

          {/* تبويبات الانتقال */}
          <div className="flex items-center gap-1.5 bg-slate-200/70 p-1 rounded-xl self-stretch sm:self-center overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('form')}
              className={`flex-1 sm:flex-initial text-center px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'form' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              1. إدخال البيانات
            </button>
            <button
              type="button"
              onClick={handleSwitchToPreview}
              className={`flex-1 sm:flex-initial text-center px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 whitespace-nowrap ${
                activeTab === 'preview' ? 'bg-white text-moe-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>2. معاينة حية</span>
            </button>
            {generatedPdfUrl && (
              <button
                type="button"
                onClick={() => setActiveTab('final')}
                className={`flex-1 sm:flex-initial text-center px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 whitespace-nowrap ${
                  activeTab === 'final' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>3. النسخة النهائية</span>
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors absolute top-3 left-3 sm:static"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-4 sm:mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2 shrink-0">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* جسم النافذة: حسب التبويب النشط */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* التبويب 1: نموذج إدخال البيانات */}
          {activeTab === 'form' && (
            <div className="space-y-5">
              {/* تنبيه وجود مسودة محفوظة تلقائياً */}
              {availableDraft && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/90 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-950 shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-200/60 flex items-center justify-center text-amber-800 shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-extrabold text-amber-950">
                        توجد مسودة محفوظة تلقائياً لهذا التقرير{' '}
                        <span className="font-mono text-[11px] text-amber-800 font-normal">({availableDraft.savedAt})</span>
                      </p>
                      <p className="text-[11px] text-amber-800/90 mt-0.5">
                        {availableDraft.title ? `العنوان: "${availableDraft.title}"` : 'مسودة غير معنونة مع عناصر وملاحظات'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      type="button"
                      onClick={handleRestoreDraft}
                      className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold transition-all shadow-xs"
                    >
                      استعادة المسودة
                    </button>
                    <button
                      type="button"
                      onClick={handleDiscardDraft}
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-xl font-semibold border border-slate-200 transition-all"
                    >
                      تجاهل وبدء جديد
                    </button>
                  </div>
                </div>
              )}

              {/* اختيار نوع التقرير: (1) النوع ثم (2) القالب من قائمة منسدلة */}
              <div className="bg-gradient-to-l from-slate-50 to-emerald-50/30 p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-moe-700" />
                    <span>نوع التقرير</span>
                    <span className="text-rose-500">*</span>
                  </label>
                </div>

                {/* الخطوة 1: أزرار الأنواع */}
                <div className="flex flex-wrap gap-1.5">
                  {REPORT_CATALOG.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleSelectCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-xl text-[11.5px] font-bold border transition-all ${
                        catalogCategoryId === cat.id
                          ? 'bg-moe-700 text-white border-moe-700 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-moe-300 hover:bg-moe-50'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* الخطوة 2: القالب من قائمة منسدلة */}
                {activeCategory.items.length > 0 && (
                  <div className="relative">
                    <select
                      value={selectedTemplate}
                      onChange={(e) => handleSelectTemplate(e.target.value)}
                      className="w-full appearance-none px-4 py-2.5 text-xs sm:text-sm font-bold bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-moe-600 focus:ring-2 focus:ring-moe-100 text-slate-800 shadow-sm cursor-pointer pr-4 pl-10"
                      dir="rtl"
                    >
                      <option value="">— اختر القالب —</option>
                      {activeCategory.items.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  </div>
                )}

                <p className="text-[11.5px] text-moe-900 bg-white/80 border border-moe-200/60 px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-2xs">
                  <Info className="w-3.5 h-3.5 shrink-0 text-moe-700" />
                  <span>{currentTypeConfig.description}</span>
                </p>
              </div>

              {/* اسم / عنوان التقرير */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {reportType === 'teaching_strategy'
                    ? 'اسم الاستراتيجية'
                    : reportType === 'school_initiative'
                    ? 'اسم المبادرة'
                    : reportType === 'training_workshop'
                    ? 'عنوان الدورة / الورشة'
                    : reportType === 'meeting'
                    ? 'عنوان الاجتماع'
                    : reportType === 'occasion'
                    ? 'اسم المناسبة / الفعالية'
                    : reportType === 'classroom_visit'
                    ? 'موضوع الدرس / عنوان الزيارة'
                    : reportType === 'results_analysis'
                    ? 'اسم المادة / الاختبار'
                    : 'اسم البرنامج / النشاط'}{' '}
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => {
                    const val = e.target.value;
                    setTitle(val);
                    if (val.includes('نشاط') || val.includes('فعالية')) {
                      setType('نشاط');
                    } else if (val.includes('برنامج')) {
                      setType('برنامج');
                    }
                  }}
                  placeholder={`مثال: ${currentTypeConfig.defaultTitle}`}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-moe-600 font-medium"
                />
              </div>

              {/* شبكة البيانات التعريفية المخصصة حسب نوع التقرير */}
              {reportType === 'teaching_strategy' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">المعلم المنفذ</label>
                      <input
                        type="text"
                        value={executor}
                        onChange={(e) => setExecutor(e.target.value)}
                        placeholder="اسم المعلم"
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-moe-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">المادة الدراسية</label>
                      <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="مثال: الرياضيات / العلوم"
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-moe-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">الصف / المرحلة</label>
                      <input
                        type="text"
                        value={gradeLevel}
                        onChange={(e) => setGradeLevel(e.target.value)}
                        placeholder="مثال: الخامس الابتدائي"
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-moe-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ التطبيق (هجري)</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          placeholder="مثال: ١٧-٠٩-١٤٤٨هـ"
                          className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-moe-600 font-mono"
                        />
                        <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* الأدوات والوسائل المستخدمة */}
                  <div className="p-3 bg-slate-50/70 border border-slate-200 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800">الأدوات والوسائل المستخدمة</label>
                      <button
                        type="button"
                        onClick={() => addItem(tools, setTools)}
                        className="text-[11px] text-moe-700 font-bold hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> إضافة وسيلة
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {tools.map((tool, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={tool}
                            onChange={(e) => updateItem(tools, setTools, idx, e.target.value)}
                            placeholder={`وسيلة رقم ${idx + 1}`}
                            className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-moe-600"
                          />
                          <button
                            type="button"
                            onClick={() => removeItem(tools, setTools, idx)}
                            className="p-1.5 text-slate-400 hover:text-rose-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {reportType === 'school_initiative' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">صاحب / فريق المبادرة</label>
                      <input
                        type="text"
                        value={executor}
                        onChange={(e) => setExecutor(e.target.value)}
                        placeholder="اسم المعلم أو الفريق المنفذ"
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-moe-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">الفئة المستهدفة</label>
                      <input
                        type="text"
                        value={audience}
                        onChange={(e) => setAudience(e.target.value)}
                        placeholder="مثال: طلاب المدرسة / المعلمون"
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-moe-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ الإطلاق / المدة</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          placeholder="مثال: الفصل الدراسي الأول"
                          className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-moe-600"
                        />
                        <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">فكرة المبادرة وأسبابها</label>
                    <textarea
                      rows={2}
                      value={initiativeIdea}
                      onChange={(e) => setInitiativeIdea(e.target.value)}
                      placeholder="وصف فكرة المبادرة والدوافع التربوية لإطلاقها..."
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-moe-600"
                    />
                  </div>
                </div>
              )}

              {reportType === 'training_workshop' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">المدرب / مقدم الورشة</label>
                    <input
                      type="text"
                      value={executor}
                      onChange={(e) => setExecutor(e.target.value)}
                      placeholder="اسم المدرب"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-moe-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">الفئة المستهدفة</label>
                    <input
                      type="text"
                      value={audience}
                      onChange={(e) => setAudience(e.target.value)}
                      placeholder="معلمون / إداريون / طلاب"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-moe-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">التاريخ والوقت</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        placeholder="مثال: ١٧-٠٩-١٤٤٨هـ (الساعة ٩ ص)"
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-moe-600"
                      />
                      <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">عدد الحضور</label>
                    <input
                      type="text"
                      value={beneficiariesCount}
                      onChange={(e) => setBeneficiariesCount(e.target.value)}
                      placeholder="مثال: 25 متدرب"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-moe-600"
                    />
                  </div>
                </div>
              )}

              {reportType === 'meeting' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">رئيس / منسق الاجتماع</label>
                    <input
                      type="text"
                      value={executor}
                      onChange={(e) => setExecutor(e.target.value)}
                      placeholder="اسم رئيس الاجتماع"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-moe-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">الحاضرون / الفئة</label>
                    <input
                      type="text"
                      value={audience}
                      onChange={(e) => setAudience(e.target.value)}
                      placeholder="مثال: أعضاء لجنة التوجيه الطلابي"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-moe-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ ووقت الاجتماع</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        placeholder="مثال: ١٧-٠٩-١٤٤٨هـ"
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-moe-600"
                      />
                      <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">موعد الاجتماع القادم</label>
                    <input
                      type="text"
                      value={nextMeetingDate}
                      onChange={(e) => setNextMeetingDate(e.target.value)}
                      placeholder="مثال: الخميس القادم"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-moe-600"
                    />
                  </div>
                </div>
              )}

              {reportType === 'occasion' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">المشرف على الفعالية</label>
                      <input
                        type="text"
                        value={executor}
                        onChange={(e) => setExecutor(e.target.value)}
                        placeholder="اسم رائد النشاط أو المشرف"
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-moe-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">الفئة المشاركة</label>
                      <input
                        type="text"
                        value={audience}
                        onChange={(e) => setAudience(e.target.value)}
                        placeholder="مثال: جميع طلاب ومنسوبي المدرسة"
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-moe-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ المناسبة (هجري)</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          placeholder="مثال: ١٧-٠٩-١٤٤٨هـ"
                          className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-moe-600 font-mono"
                        />
                        <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">أهمية المناسبة وأهداف التفعيل</label>
                    <textarea
                      rows={2}
                      value={occasionSignificance}
                      onChange={(e) => setOccasionSignificance(e.target.value)}
                      placeholder="نبذة عن أهمية المناسبة والغايات التربوية والقيمية المراد ترسيخها..."
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-moe-600"
                    />
                  </div>
                </div>
              )}

              {reportType === 'classroom_visit' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">المعلم الزائر</label>
                    <input
                      type="text"
                      value={visitingTeacher}
                      onChange={(e) => setVisitingTeacher(e.target.value)}
                      placeholder="اسم المعلم الزائر"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-moe-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">المعلم المزار</label>
                    <input
                      type="text"
                      value={visitedTeacher}
                      onChange={(e) => {
                        setVisitedTeacher(e.target.value);
                        setExecutor(e.target.value);
                      }}
                      placeholder="اسم المعلم المزار"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-moe-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">المادة والصف</label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="مثال: لغتي الجميلة - الصف الرابع"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-moe-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ الزيارة والحصة</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        placeholder="مثال: ١٧-٠٩-١٤٤٨هـ (الحصة ٢)"
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-moe-600"
                      />
                      <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                    </div>
                  </div>
                </div>
              )}

              {reportType === 'results_analysis' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">المعلم المحلل</label>
                    <input
                      type="text"
                      value={executor}
                      onChange={(e) => setExecutor(e.target.value)}
                      placeholder="اسم معلم المادة"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-moe-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">الصف / الشعبة</label>
                    <input
                      type="text"
                      value={gradeLevel}
                      onChange={(e) => setGradeLevel(e.target.value)}
                      placeholder="مثال: السادس الابتدائي (أ، ب)"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-moe-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ التحليل / الفصل</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        placeholder="مثال: منتصف الفصل الأول"
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-moe-600"
                      />
                      <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">عدد الطلاب المختبرين</label>
                    <input
                      type="text"
                      value={beneficiariesCount}
                      onChange={(e) => setBeneficiariesCount(e.target.value)}
                      placeholder="مثال: 48 طالب"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-moe-600"
                    />
                  </div>
                </div>
              )}

              {reportType === 'program_activity' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">اسم المنفذ</label>
                    <input
                      type="text"
                      value={executor}
                      onChange={(e) => setExecutor(e.target.value)}
                      placeholder="اسم المعلم أو المشرف"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-moe-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ التنفيذ (هجري)</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        placeholder="مثال: ١٧-٠٩-١٤٤٨هـ"
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-moe-600 font-mono"
                      />
                      <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">الفئة المستهدفة</label>
                    <input
                      type="text"
                      value={audience}
                      onChange={(e) => setAudience(e.target.value)}
                      placeholder="مثال: طلاب المرحلة الثانوية"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-moe-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">عدد المستفيدين</label>
                    <input
                      type="text"
                      value={beneficiariesCount}
                      onChange={(e) => setBeneficiariesCount(e.target.value)}
                      placeholder="مثال: 120 طالب"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-moe-600"
                    />
                  </div>
                </div>
              )}

              {/* زر الذكاء الاصطناعي لإعداد التقرير */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-gradient-to-r from-moe-50 via-emerald-50 to-teal-50 border border-moe-200/90 rounded-2xl">
                <div className="space-y-0.5">
                  <span className="text-xs font-extrabold text-moe-950 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-moe-700" />
                    إعداد التقرير بالذكاء الاصطناعي
                  </span>
                  <p className="text-[11px] text-slate-600">
                    صياغة تربوية مقننة لـ ({currentTypeConfig.label}) بأسلوب معلم سعودي مهني ومباشر وفق المعايير.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={enhancingAi}
                  onClick={handleAiEnhance}
                  className="flex items-center justify-center gap-1.5 bg-moe-700 hover:bg-moe-800 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl border border-moe-600 transition-all shadow-xs disabled:opacity-50 shrink-0 w-full sm:w-auto active:scale-98"
                >
                  {enhancingAi ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-emerald-200" />}
                  <span>{enhancingAi ? 'جاري إعداد التقرير...' : 'إعداد التقرير بالذكاء الاصطناعي'}</span>
                </button>
              </div>

              {/* القسم الأول: الأهداف / المحاور / نقاط القوة */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">{currentTypeConfig.secATitle}</label>
                  <button
                    type="button"
                    onClick={() => addItem(objectives, setObjectives)}
                    className="text-[11px] text-moe-700 font-bold hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> إضافة بند
                  </button>
                </div>
                {objectives.map((obj, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={obj}
                      onChange={(e) => updateItem(objectives, setObjectives, idx, e.target.value)}
                      placeholder={`البند رقم ${idx + 1}`}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-moe-600"
                    />
                    <button
                      type="button"
                      onClick={() => removeItem(objectives, setObjectives, idx)}
                      className="p-2 text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* القسم الثاني: الخطوات / الممارسات / الفجوات */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">{currentTypeConfig.secBTitle}</label>
                  <button
                    type="button"
                    onClick={() => {
                      if (reportType === 'results_analysis') {
                        addItem(weaknesses, setWeaknesses);
                      } else {
                        addItem(steps, setSteps);
                      }
                    }}
                    className="text-[11px] text-moe-700 font-bold hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> إضافة بند
                  </button>
                </div>
                {(reportType === 'results_analysis' ? weaknesses : steps).map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => {
                        if (reportType === 'results_analysis') {
                          updateItem(weaknesses, setWeaknesses, idx, e.target.value);
                        } else {
                          updateItem(steps, setSteps, idx, e.target.value);
                        }
                      }}
                      placeholder={`البند رقم ${idx + 1}`}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-moe-600"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (reportType === 'results_analysis') {
                          removeItem(weaknesses, setWeaknesses, idx);
                        } else {
                          removeItem(steps, setSteps, idx);
                        }
                      }}
                      className="p-2 text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* القسم الثالث: النتائج / المخرجات / الخطط العلاجية */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">{currentTypeConfig.secCTitle}</label>
                  <button
                    type="button"
                    onClick={() => {
                      if (reportType === 'results_analysis') {
                        addItem(steps, setSteps);
                      } else {
                        addItem(outcomes, setOutcomes);
                      }
                    }}
                    className="text-[11px] text-moe-700 font-bold hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> إضافة بند
                  </button>
                </div>
                {(reportType === 'results_analysis' ? steps : outcomes).map((out, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={out}
                      onChange={(e) => {
                        if (reportType === 'results_analysis') {
                          updateItem(steps, setSteps, idx, e.target.value);
                        } else {
                          updateItem(outcomes, setOutcomes, idx, e.target.value);
                        }
                      }}
                      placeholder={`البند رقم ${idx + 1}`}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-moe-600"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (reportType === 'results_analysis') {
                          removeItem(steps, setSteps, idx);
                        } else {
                          removeItem(outcomes, setOutcomes, idx);
                        }
                      }}
                      className="p-2 text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* قسم إضافي خاص بتحليل النتائج: مؤشرات التحسن بعد العلاج */}
              {reportType === 'results_analysis' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800">مؤشرات التحسن بعد العلاج</label>
                    <button
                      type="button"
                      onClick={() => addItem(outcomes, setOutcomes)}
                      className="text-[11px] text-moe-700 font-bold hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> إضافة مؤشر
                    </button>
                  </div>
                  {outcomes.map((out, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={out}
                        onChange={(e) => updateItem(outcomes, setOutcomes, idx, e.target.value)}
                        placeholder={`مؤشر التحسن رقم ${idx + 1}`}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-moe-600"
                      />
                      <button
                        type="button"
                        onClick={() => removeItem(outcomes, setOutcomes, idx)}
                        className="p-2 text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* الصور والشواهد الموثقة */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-slate-800">
                      {reportType === 'teaching_strategy'
                        ? 'صور التطبيق داخل الصف'
                        : reportType === 'meeting'
                        ? 'صور الاجتماع / كشف التوقيع'
                        : reportType === 'results_analysis'
                        ? 'شواهد تحليل الدرجات / أوراق العمل'
                        : reportType === 'classroom_visit'
                        ? 'صور / شواهد الزيارة'
                        : reportType === 'training_workshop'
                        ? 'صور الورشة / التفاعل'
                        : 'شواهد التوثيق المصور'}{' '}
                      ({images.length} من 6)
                    </label>
                    <span className="text-[11px] text-slate-500 block">
                      يتم ضغط وتصحيح أبعاد الصور تلقائياً للحفاظ على جودة وسرعة التقرير.
                    </span>
                  </div>
                  {images.length < 6 && (
                    <label className="cursor-pointer inline-flex items-center gap-1 bg-moe-50 hover:bg-moe-100 text-moe-800 text-xs font-bold px-3 py-1.5 rounded-xl border border-moe-200 transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>رفع صور</span>
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {uploadingImage && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2 text-xs text-slate-600">
                    <Loader2 className="w-4 h-4 animate-spin text-moe-700" />
                    <span>جاري ضغط ومعالجة الصور المرفوعة...</span>
                  </div>
                )}

                {images.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {images.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative p-2 bg-slate-50 border border-slate-200 rounded-2xl group flex flex-col items-center"
                      >
                        <img
                          src={img.url}
                          alt={`صورة ${idx + 1}`}
                          className="w-full h-28 object-contain rounded-xl bg-white border border-slate-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-3 left-3 p-1.5 bg-rose-600 text-white rounded-full opacity-80 hover:opacity-100 shadow"
                          title="حذف الصورة"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                        <input
                          type="text"
                          value={img.caption || ''}
                          onChange={(e) => {
                            const next = [...images];
                            next[idx].caption = e.target.value;
                            setImages(next);
                          }}
                          placeholder="وصف الصورة (اختياري)..."
                          className="mt-1.5 w-full text-[11px] px-2 py-1 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-moe-600"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* الملاحظات والتوصيات الختامية */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {currentTypeConfig.secDTitle} (اختياري)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="أي ملاحظات ختامية أو توصيات للتطوير المستقبلي..."
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-moe-600"
                />
              </div>
            </div>
          )}

          {/* التبويب 2: المعاينة الحية Live HTML Preview (مطابقة لورقة A4 مثل موقع نماذج تعليمية) */}
          {activeTab === 'preview' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-moe-700" />
                  <span className="text-xs font-bold text-slate-800">
                    معاينة حية مطابقة لورقة A4 الرسمية (بدون ضغط أو تشويه)
                  </span>
                </div>

                {/* أزرار التحكم في طريقة العرض والطباعة المباشرة مثل نماذج تعليمية */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPreviewZoomMode('fit')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      previewZoomMode === 'fit'
                        ? 'bg-moe-800 text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                    title="ملاءمة كامل ورقة A4 على شاشة الجوال دون أي تشويه أو تداخل"
                  >
                    ملائمة الشاشة (A4 كامل)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewZoomMode('100%')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      previewZoomMode === '100%'
                        ? 'bg-moe-800 text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                    title="الحجم الطبيعي 100% مع إمكانية التمرير الحر"
                  >
                    الحجم الطبيعي (100%)
                  </button>
                  <button
                    type="button"
                    onClick={handlePrintReport}
                    className="inline-flex items-center gap-1 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-3 py-1 rounded-lg transition-all shadow-xs"
                    title="طباعة أو تصدير التقرير كـ PDF مباشرة"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>طباعة / حفظ PDF</span>
                  </button>
                </div>
              </div>

              {/* حاوية العرض المتكيفة لـ A4 */}
              <div
                ref={previewContainerRef}
                className="border border-slate-300 rounded-2xl bg-slate-200/80 shadow-inner p-2 sm:p-4 flex justify-center items-start overflow-x-auto min-h-[480px]"
              >
                {previewZoomMode === 'fit' ? (
                  /* وضع ملائمة الشاشة: تصغير هندسي متناسب لورقة A4 كاملة بعرض الشاشة دون أي تداخل نصوص أو صور */
                  <div
                    style={{
                      width: '794px',
                      height: `${1150 * previewScale}px`,
                      overflow: 'hidden',
                    }}
                    className="flex justify-center shrink-0"
                  >
                    <div
                      style={{
                        transform: `scale(${previewScale})`,
                        transformOrigin: 'top center',
                        width: '794px',
                        height: '1150px',
                      }}
                    >
                      <iframe
                        ref={previewIframeRef}
                        srcDoc={previewHtml}
                        title="Live Preview"
                        className="w-[794px] h-[1150px] bg-white rounded-xl shadow-2xl border border-slate-300 block"
                      />
                    </div>
                  </div>
                ) : (
                  /* وضع الحجم الطبيعي 100%: ورقة A4 كاملة مع إمكانية التمرير الحر أفقياً وعمودياً */
                  <div className="overflow-auto max-w-full w-full flex justify-center p-2">
                    <iframe
                      ref={previewIframeRef}
                      srcDoc={previewHtml}
                      title="Live Preview"
                      className="w-[794px] min-w-[794px] h-[1150px] bg-white rounded-xl shadow-2xl border border-slate-300 block shrink-0"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* التبويب 3: النسخة النهائية وتوليد / حفظ PDF */}
          {activeTab === 'final' && (
            <div className="space-y-6 text-center py-6 sm:py-8">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-1.5 max-w-md mx-auto">
                <h3 className="text-lg font-bold text-slate-900">
                  تم تجهيز التقرير بنجاح وفق مقاس A4 المعتمد!
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  تم تنسيق التقرير بالكامل بالخطوط الرسمية المعتمدة وتوزيع الصور والهيدر والفوتر. يمكنك حفظه كـ PDF أو طباعته مباشرة، ثم اعتماده.
                </p>
              </div>

              {/* أزرار التحميل والطباعة والمعاينة */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                {generatedPdfUrl && (
                  <a
                    href={generatedPdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-moe-800 hover:bg-moe-900 text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm"
                  >
                    <Download className="w-4 h-4" />
                    <span>تحميل ملف PDF المباشر</span>
                  </a>
                )}

                <button
                  type="button"
                  onClick={handlePrintReport}
                  className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة / حفظ بتنسيق PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl border border-slate-200 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  <span>معاينة ورقة A4</span>
                </button>
              </div>

              {/* توجيه للمعلم */}
              <div className="max-w-md mx-auto bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-600 text-right space-y-1">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  الخطوة المتبقية:
                </span>
                <p className="text-[11.5px] leading-relaxed">
                  اضغط على زر <strong>"{isEditing ? 'حفظ وإعادة الإرسال' : 'حفظ وإرسال للمراجعة'}"</strong> بالأسفل لاعتماد التقرير رسميًا وإرفاقه ضمن شواهد المؤشر.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* شريط الإجراءات السفلي */}
        <div className="p-3 sm:px-6 sm:py-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shrink-0">
          <div className="flex items-center justify-between sm:justify-start gap-2 order-2 sm:order-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors"
            >
              إلغاء
            </button>
            {activeTab === 'preview' && (
              <button
                type="button"
                onClick={() => setActiveTab('form')}
                className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-3 py-2 rounded-xl transition-colors border border-slate-300 sm:hidden"
              >
                <ArrowRight className="w-4 h-4" />
                <span>العودة للبيانات</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 order-1 sm:order-2">
            {activeTab === 'preview' && (
              <button
                type="button"
                onClick={() => setActiveTab('form')}
                className="hidden sm:inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-4 py-2.5 rounded-xl transition-colors border border-slate-300"
              >
                <ArrowRight className="w-4 h-4" />
                <span>العودة لتعديل البيانات</span>
              </button>
            )}

            {activeTab === 'form' && (
              <button
                type="button"
                disabled={loadingPreview}
                onClick={handleSwitchToPreview}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-3 sm:px-4 py-2.5 rounded-xl transition-colors border border-slate-300 disabled:opacity-50"
              >
                {loadingPreview ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                <span>{loadingPreview ? 'جاري المعاينة...' : 'معاينة حية'}</span>
              </button>
            )}

            {/* زر توليد PDF النهائي */}
            {activeTab !== 'final' && (
              <button
                type="button"
                disabled={generatingPdf || !title.trim()}
                onClick={handleGenerateFinalPdf}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-3 sm:px-5 py-2.5 rounded-xl transition-all shadow-sm disabled:opacity-50"
              >
                {generatingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                <span>{generatingPdf ? 'جاري التوليد...' : 'إنشاء PDF'}</span>
              </button>
            )}

            {/* زر الحفظ النهائي والإرسال للمراجعة */}
            <button
              type="button"
              disabled={submitting || !title.trim()}
              onClick={handleSaveAndSubmit}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-moe-800 hover:bg-moe-900 text-white text-xs font-bold px-4 sm:px-6 py-2.5 rounded-xl transition-all shadow-md disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              <span>{isEditing ? 'حفظ وإعادة الإرسال' : 'حفظ وإرسال للمراجعة'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
