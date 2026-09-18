'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ExternalLink,
  PlusCircle,
  CheckCircle,
  Clock,
  AlertCircle,
  FileCheck2,
  Calendar,
  User,
  ChevronRight,
  Pencil,
  Trash2,
  Check,
  Ban,
  HelpCircle,
  Info,
  FileText,
  Download,
  Eye,
  Video,
  File,
  Folder,
  Presentation,
  Globe,
} from 'lucide-react';
import { StatusBadge } from '@/components/common/Badge';
import { EvidenceChoiceModal } from '@/components/evidence/EvidenceChoiceModal';
import { ExternalLinkModal } from '@/components/evidence/ExternalLinkModal';
import { ReportBuilderModal } from '@/components/evidence/ReportBuilderModal';
import { ReviewModal } from '@/components/evidence/ReviewModal';
import { EvidenceItem, UserSession } from '@/types';

interface IndicatorClientViewProps {
  indicator: any;
  evidences: EvidenceItem[];
  currentUser: UserSession | null;
}

export const IndicatorClientView: React.FC<IndicatorClientViewProps> = ({
  indicator,
  evidences: initialEvidences,
  currentUser,
}) => {
  const router = useRouter();
  const [evidences, setEvidences] = useState<EvidenceItem[]>(initialEvidences);

  // حالات النوافذ المنبثقة المطورة
  const [isChoiceModalOpen, setIsChoiceModalOpen] = useState(false);
  const [isExternalModalOpen, setIsExternalModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const [editingEvidence, setEditingEvidence] = useState<EvidenceItem | null>(null);
  const [reviewingEvidence, setReviewingEvidence] = useState<EvidenceItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const reloadData = async () => {
    try {
      const res = await fetch(`/api/indicators/${encodeURIComponent(indicator.code)}`);
      if (res.ok) {
        const data = await res.json();
        setEvidences(data.evidences || []);
      }
    } catch (err) {
      console.error('Reload indicator error:', err);
    }
  };

  const handleDelete = async (evidenceId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الشاهد؟')) return;
    try {
      const res = await fetch(`/api/evidences/${evidenceId}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('تم حذف الشاهد بنجاح');
        reloadData();
      } else {
        const data = await res.json();
        alert(data.error || 'فشل حذف الشاهد');
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleOpenEdit = (evidence: EvidenceItem) => {
    setEditingEvidence(evidence);
    if (evidence.evidenceType === 'report') {
      setIsReportModalOpen(true);
    } else {
      setIsExternalModalOpen(true);
    }
  };

  const approvedEvidences = evidences.filter((e) => e.status === 'approved');
  const pendingEvidences = evidences.filter((e) => e.status === 'pending');
  const rejectedEvidences = evidences.filter((e) => e.status === 'rejected');

  const isTeacher = currentUser?.role === 'teacher';
  const isAdmin = currentUser?.role === 'admin';

  const getEvidenceTypeBadge = (evidence: EvidenceItem) => {
    if (evidence.evidenceType === 'report') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-800 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
          <FileText className="w-3 h-3 text-purple-600" />
          تقرير توثيق A4
        </span>
      );
    }

    const sub = evidence.subType || 'file';
    let label = 'رابط خارجي';
    let Icon = Globe;
    if (sub === 'video') {
      label = 'فيديو';
      Icon = Video;
    } else if (sub === 'file') {
      label = 'ملف';
      Icon = File;
    } else if (sub === 'folder') {
      label = 'مجلد';
      Icon = Folder;
    } else if (sub === 'presentation') {
      label = 'عرض تقديمي';
      Icon = Presentation;
    }

    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
        <Icon className="w-3 h-3 text-blue-600" />
        {label}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* إشعار النجاح الفوري (Toast) */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 duration-200 border border-slate-700">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* مسار التنقل Breadcrumb */}
      <nav className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
        <Link href="/" className="hover:text-moe-800 transition-colors">
          الرئيسية
        </Link>
        <ChevronRight className="w-3.5 h-3.5 rotate-180 text-slate-400 shrink-0" />
        <span className="hover:text-moe-800 transition-colors">
          {indicator.standard.domain.name}
        </span>
        <ChevronRight className="w-3.5 h-3.5 rotate-180 text-slate-400 shrink-0" />
        <Link
          href={`/#domain-${indicator.standard.domain.id}`}
          className="hover:text-moe-800 transition-colors truncate max-w-[160px] sm:max-w-none"
        >
          {indicator.standard.name}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 rotate-180 text-slate-400 shrink-0" />
        <span className="font-mono text-moe-800 font-bold dir-ltr inline-block shrink-0">
          {indicator.code}
        </span>
      </nav>

      {/* بطاقة معلومات المؤشر العليا */}
      <div className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200 shadow-sm space-y-5 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs sm:text-sm font-bold text-moe-900 bg-moe-50 px-3 py-1 rounded-xl border border-moe-200 dir-ltr inline-block">
                مؤشر: {indicator.code}
              </span>
              <span className="text-[11px] sm:text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-xl">
                {indicator.standard.domain.name} • {indicator.standard.name}
              </span>
              {indicator.appliesToGovernment ? (
                <span className="text-[10.5px] sm:text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  مطبق على المدارس الحكومية والأهلية
                </span>
              ) : (
                <span className="text-[10.5px] sm:text-[11px] font-medium text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  خاص بالمدارس الأهلية والعالمية
                </span>
              )}
            </div>

            <h1 className="text-lg sm:text-2xl font-black text-slate-900 leading-snug sm:leading-relaxed">
              {indicator.text}
            </h1>
          </div>

          {/* زر إضافة شاهد للمعلم أو المدير: يفتح نافذة الاختيار البسيطة */}
          {currentUser && (
            <button
              onClick={() => {
                setEditingEvidence(null);
                setIsChoiceModalOpen(true);
              }}
              className="inline-flex items-center justify-center gap-2 bg-moe-800 hover:bg-moe-900 text-white text-xs sm:text-sm font-bold px-4 py-3 sm:py-2.5 rounded-xl transition-all shadow-sm shrink-0 w-full sm:w-auto"
            >
              <PlusCircle className="w-4 h-4 shrink-0" />
              <span>إضافة شاهد لهذا المؤشر</span>
            </button>
          )}
        </div>

        {/* إرشادات المدرسة إن وجدت */}
        {indicator.schoolGuidance && (
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-amber-900">
              <Info className="w-4 h-4 text-amber-600" />
              <span>إرشادات المدرسة والشواهد المقترحة:</span>
            </div>
            <p className="text-amber-800 leading-relaxed text-xs">
              {indicator.schoolGuidance}
            </p>
          </div>
        )}
      </div>

      {/* قسم الشواهد قيد المراجعة أو المرفوضة (تظهر فقط للمنسوبين المعنيين) */}
      {currentUser && (pendingEvidences.length > 0 || rejectedEvidences.length > 0) && (
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>شواهد بانتظار المراجعة أو تتطلب تعديلاً</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* الشواهد قيد المراجعة */}
            {pendingEvidences.map((evidence) => (
              <div
                key={evidence.id}
                className="bg-amber-50/40 border border-amber-200/80 rounded-2xl p-5 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <StatusBadge status="pending" />
                      {getEvidenceTypeBadge(evidence)}
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm mt-1">{evidence.title}</h3>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {evidence.evidenceType === 'report' ? (
                      <Link
                        href={`/reports/${evidence.id}`}
                        target="_blank"
                        className="p-2 text-slate-600 hover:text-moe-800 bg-white rounded-lg border border-slate-200 transition-colors flex items-center gap-1 text-xs"
                        title="معاينة التقرير"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    ) : (
                      evidence.url && (
                        <a
                          href={evidence.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-slate-500 hover:text-moe-800 bg-white rounded-lg border border-slate-200 transition-colors"
                          title="فتح الرابط"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )
                    )}
                  </div>
                </div>

                {evidence.description && (
                  <p className="text-xs text-slate-600 leading-relaxed">{evidence.description}</p>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2.5 border-t border-amber-100 text-[11px] text-slate-500">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{evidence.academicYear}</span>
                    </span>
                    {evidence.submittedBy && (
                      <>
                        <span>•</span>
                        <span>بواسطة: {evidence.submittedBy.name}</span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    {isAdmin && (
                      <button
                        onClick={() => setReviewingEvidence(evidence)}
                        className="inline-flex items-center gap-1 bg-moe-800 hover:bg-moe-900 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>مراجعة واعتماد</span>
                      </button>
                    )}

                    {isTeacher && evidence.submittedById === currentUser.id && (
                      <>
                        <button
                          onClick={() => handleOpenEdit(evidence)}
                          className="p-1.5 text-slate-600 hover:text-moe-800 hover:bg-white rounded-lg border border-slate-200 sm:border-transparent transition-colors"
                          title="تعديل الشاهد"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(evidence.id)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-white rounded-lg border border-rose-200 sm:border-transparent transition-colors"
                          title="حذف الشاهد"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* الشواهد المرفوضة */}
            {rejectedEvidences.map((evidence) => (
              <div
                key={evidence.id}
                className="bg-rose-50/40 border border-rose-200/80 rounded-2xl p-5 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <StatusBadge status="rejected" />
                      {getEvidenceTypeBadge(evidence)}
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm mt-1">{evidence.title}</h3>
                  </div>

                  {evidence.evidenceType === 'report' ? (
                    <Link
                      href={`/reports/${evidence.id}`}
                      target="_blank"
                      className="p-2 text-slate-600 hover:text-rose-800 bg-white rounded-lg border border-slate-200 transition-colors"
                      title="معاينة التقرير"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                  ) : (
                    evidence.url && (
                      <a
                        href={evidence.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-slate-500 hover:text-rose-800 bg-white rounded-lg border border-slate-200 transition-colors"
                        title="معاينة الرابط المرفوض"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )
                  )}
                </div>

                {/* سبب الرفض معروض بوضوح */}
                <div className="bg-white p-3 rounded-xl border border-rose-200 text-xs text-rose-800 space-y-1">
                  <span className="font-bold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                    سبب الرفض وملاحظات الإدارة:
                  </span>
                  <p className="leading-relaxed">{evidence.rejectionReason}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-rose-100 text-[11px] text-slate-500">
                  <span>{evidence.academicYear}</span>
                  {isTeacher && evidence.submittedById === currentUser.id && (
                    <button
                      onClick={() => handleOpenEdit(evidence)}
                      className="inline-flex items-center gap-1 bg-rose-700 hover:bg-rose-800 text-white px-3 py-1 rounded-lg text-xs font-semibold shadow-sm"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>تعديل وإعادة الإرسال</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* قسم الشواهد المعتمدة (يظهر للجميع بما فيهم الزوار وفريق التقويم) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-slate-900">
              الشواهد المعتمدة ({approvedEvidences.length})
            </h2>
          </div>
          <span className="text-xs text-slate-500">
            شواهد معتمدة رسميًا ومتاحة لفريق التقويم الخارجي
          </span>
        </div>

        {approvedEvidences.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {approvedEvidences.map((evidence) => (
              <div
                key={evidence.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-6 flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <StatusBadge status="approved" />
                        {getEvidenceTypeBadge(evidence)}
                      </div>
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-moe-900 transition-colors">
                        {evidence.title}
                      </h3>
                    </div>
                  </div>

                  {evidence.description && (
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {evidence.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {evidence.academicYear}
                    </span>
                    {evidence.semester && (
                      <>
                        <span>•</span>
                        <span>{evidence.semester}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* أزرار العرض وفق النوع: تقرير أو رابط خارجي */}
                <div className="pt-4 border-t border-slate-100">
                  {evidence.evidenceType === 'report' ? (
                    <div className="w-full flex flex-wrap sm:flex-nowrap items-center justify-between gap-2">
                      <Link
                        href={`/reports/${evidence.id}`}
                        target="_blank"
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 bg-moe-700 hover:bg-moe-800 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>عرض التقرير</span>
                      </Link>

                      {evidence.pdfUrl && (
                        <a
                          href={evidence.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-2 rounded-xl text-xs font-bold transition-colors border border-slate-200"
                        >
                          <Download className="w-3.5 h-3.5 text-slate-600" />
                          <span>تحميل PDF</span>
                        </a>
                      )}
                    </div>
                  ) : (
                    evidence.url && (
                      <div className="w-full flex flex-wrap sm:flex-nowrap items-center justify-between gap-2">
                        <span className="text-[11px] text-slate-400 font-mono truncate max-w-[150px] sm:max-w-[220px] dir-ltr text-left">
                          {evidence.url}
                        </span>
                        <a
                          href={evidence.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-1.5 bg-moe-700 hover:bg-moe-800 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow shrink-0 w-full sm:w-auto"
                        >
                          <span>فتح الشاهد</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* الحالة الفارغة */
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <FileCheck2 className="w-7 h-7" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="text-base font-bold text-slate-800">
                لا توجد شواهد معتمدة مضافة لهذا المؤشر حتى الآن.
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {currentUser
                  ? 'يمكنك إضافة شاهد بالضغط على زر إضافة شاهد بالأعلى لإرساله إلى إدارة المدرسة للمراجعة والاعتماد.'
                  : 'سيتم عرض الروابط والتقارير المعتمدة هنا فور اعتمادها من قِبل إدارة المدرسة.'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 1. نافذة الاختيار الأولية */}
      <EvidenceChoiceModal
        isOpen={isChoiceModalOpen}
        onClose={() => setIsChoiceModalOpen(false)}
        onSelectReport={() => setIsReportModalOpen(true)}
        onSelectExternalLink={() => setIsExternalModalOpen(true)}
        indicatorCode={indicator.code}
      />

      {/* 2. نافذة إدراج رابط خارجي */}
      <ExternalLinkModal
        isOpen={isExternalModalOpen}
        onClose={() => {
          setIsExternalModalOpen(false);
          setEditingEvidence(null);
        }}
        onSuccess={(msg) => {
          showToast(msg || 'تم إرسال الشاهد للمراجعة بنجاح.');
          reloadData();
          router.refresh();
        }}
        indicatorId={indicator.id}
        indicatorCode={indicator.code}
        indicatorText={indicator.text}
        initialEvidence={editingEvidence}
      />

      {/* 3. نافذة إنشاء التقرير المكتبي A4 */}
      <ReportBuilderModal
        isOpen={isReportModalOpen}
        onClose={() => {
          setIsReportModalOpen(false);
          setEditingEvidence(null);
        }}
        onSuccess={(msg) => {
          showToast(msg || 'تم حفظ التقرير وإرساله للمراجعة بنجاح.');
          reloadData();
          router.refresh();
        }}
        indicatorId={indicator.id}
        indicatorCode={indicator.code}
        indicatorText={indicator.text}
        currentUser={currentUser}
        initialEvidence={editingEvidence}
      />

      {/* 4. نافذة مراجعة واعتماد الشاهد للمدير */}
      <ReviewModal
        isOpen={!!reviewingEvidence}
        onClose={() => setReviewingEvidence(null)}
        onSuccess={(msg) => {
          showToast(msg);
          reloadData();
          router.refresh();
        }}
        evidence={reviewingEvidence}
      />
    </div>
  );
};
