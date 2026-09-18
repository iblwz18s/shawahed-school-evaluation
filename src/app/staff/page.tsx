'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FileCheck,
  Clock,
  AlertCircle,
  CheckCircle2,
  PlusCircle,
  ExternalLink,
  Pencil,
  Trash2,
  Loader2,
  Calendar,
  Layers,
  ArrowUpRight,
  BookOpen,
  FileText,
  Video,
  Folder,
  File,
  Presentation,
  Download,
} from 'lucide-react';
import { StatusBadge } from '@/components/common/Badge';
import { EvidenceChoiceModal } from '@/components/evidence/EvidenceChoiceModal';
import { ExternalLinkModal } from '@/components/evidence/ExternalLinkModal';
import { ReportBuilderModal } from '@/components/evidence/ReportBuilderModal';
import { EvidenceItem, UserSession } from '@/types';

export default function StaffDashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [evidences, setEvidences] = useState<EvidenceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isExternalModalOpen, setIsExternalModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [editingEvidence, setEditingEvidence] = useState<EvidenceItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // قائمة المؤشرات المتاحة للاختيار عند الضغط على إضافة شاهد من اللوحة العامة
  const [availableIndicators, setAvailableIndicators] = useState<any[]>([]);
  const [selectedIndicatorId, setSelectedIndicatorId] = useState<string>('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleOpenEdit = (evidence: EvidenceItem) => {
    setEditingEvidence(evidence);
    setSelectedIndicatorId(evidence.indicatorId);
    if (evidence.evidenceType === 'report') {
      setIsReportModalOpen(true);
    } else {
      setIsExternalModalOpen(true);
    }
  };

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
    switch (sub) {
      case 'video':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-800 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
            <Video className="w-3 h-3 text-rose-600" />
            فيديو خارجي
          </span>
        );
      case 'folder':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
            <Folder className="w-3 h-3 text-amber-600" />
            مجلد سحابي
          </span>
        );
      case 'presentation':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-800 bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200">
            <Presentation className="w-3 h-3 text-orange-600" />
            عرض تقديمي
          </span>
        );
      case 'other':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
            <ExternalLink className="w-3 h-3 text-slate-500" />
            رابط إلكتروني
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
            <File className="w-3 h-3 text-blue-600" />
            ملف رقمي
          </span>
        );
    }
  };

  useEffect(() => {
    async function loadData() {
      try {
        const meRes = await fetch('/api/auth/me');
        const meData = await meRes.json();
        if (!meData.user) {
          router.push('/login');
          return;
        }
        setCurrentUser(meData.user);

        // جلب شواهد المعلم
        const evRes = await fetch('/api/evidences?my=true');
        const evData = await evRes.json();
        setEvidences(evData.evidences || []);

        // جلب قائمة المؤشرات للإضافة السريعة
        const indRes = await fetch('/api/domains');
        const domData = await indRes.json();
        const flatIndicators: any[] = [];
        domData.domains?.forEach((d: any) => {
          d.standards?.forEach((s: any) => {
            // we will need indicator list or direct code
          });
        });
      } catch (err) {
        console.error('Staff load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [router]);

  const reloadEvidences = async () => {
    try {
      const evRes = await fetch('/api/evidences?my=true');
      const evData = await evRes.json();
      setEvidences(evData.evidences || []);
    } catch (err) {
      console.error('Reload error:', err);
    }
  };

  const handleDelete = async (evidenceId: string) => {
    if (!confirm('هل أنت متأكد من رغبتك في حذف هذا الشاهد؟')) return;
    try {
      const res = await fetch(`/api/evidences/${evidenceId}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('تم حذف الشاهد بنجاح');
        reloadEvidences();
      } else {
        const d = await res.json();
        alert(d.error || 'فشل حذف الشاهد');
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-moe-700" />
      </div>
    );
  }

  const approvedCount = evidences.filter((e) => e.status === 'approved').length;
  const pendingCount = evidences.filter((e) => e.status === 'pending').length;
  const rejectedCount = evidences.filter((e) => e.status === 'rejected').length;

  const filteredEvidences = evidences.filter((e) => {
    if (statusFilter === 'all') return true;
    return e.status === statusFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 duration-200 border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ترحيب ورأس لوحة المعلم */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-moe-700 bg-moe-50 px-2.5 py-0.5 rounded-full border border-moe-200">
              بوابة الكادر التعليمي
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            أهلاً بك، {currentUser?.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            متابعة الشواهد المرفوعة، حالات الاعتماد، وملاحظات الإدارة
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/#domains-section"
            className="inline-flex items-center gap-2 bg-moe-800 hover:bg-moe-900 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>إضافة شاهد من دليل المؤشرات</span>
          </Link>
        </div>
      </div>

      {/* بطاقات الإحصائيات الأربع للمعلم */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-medium text-slate-500">إجمالي شواهدي</span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {evidences.length}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-emerald-200 shadow-sm space-y-1 bg-emerald-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-800">الشواهد المعتمدة</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700">
            {approvedCount}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-amber-200 shadow-sm space-y-1 bg-amber-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-800">قيد المراجعة</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-700">
            {pendingCount}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-rose-200 shadow-sm space-y-1 bg-rose-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-rose-800">شواهد مرفوضة</span>
            <AlertCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-700">
            {rejectedCount}
          </div>
        </div>
      </div>

      {/* تبويبات التصفية وقائمة الشواهد */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-moe-700" />
            <h2 className="text-lg font-bold text-slate-900">
              سجل الشواهد التي رفعتها ({filteredEvidences.length})
            </h2>
          </div>

          {/* فلاتر الحالة */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setStatusFilter('all')}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                statusFilter === 'all'
                  ? 'bg-white text-slate-900 font-bold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              الكل ({evidences.length})
            </button>
            <button
              onClick={() => setStatusFilter('approved')}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                statusFilter === 'approved'
                  ? 'bg-white text-emerald-800 font-bold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              معتمد ({approvedCount})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                statusFilter === 'pending'
                  ? 'bg-white text-amber-800 font-bold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              قيد المراجعة ({pendingCount})
            </button>
            <button
              onClick={() => setStatusFilter('rejected')}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                statusFilter === 'rejected'
                  ? 'bg-white text-rose-800 font-bold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              مرفوض ({rejectedCount})
            </button>
          </div>
        </div>

        {/* عرض الشواهد */}
        {filteredEvidences.length > 0 ? (
          <div className="space-y-4">
            {filteredEvidences.map((evidence) => (
              <div
                key={evidence.id}
                className="p-5 rounded-2xl border border-slate-200/90 hover:border-moe-200 transition-all space-y-3 bg-white"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1.5 max-w-3xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={evidence.status} />
                      {getEvidenceTypeBadge(evidence)}
                      {evidence.indicator && (
                        <Link
                          href={`/indicators/${encodeURIComponent(evidence.indicator.code)}`}
                          className="font-mono text-xs font-bold text-moe-800 bg-moe-50 hover:bg-moe-100 px-2 py-0.5 rounded border border-moe-200 dir-ltr inline-block transition-colors"
                        >
                          مؤشر: {evidence.indicator.code}
                        </Link>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-slate-900">{evidence.title}</h3>

                    {evidence.indicator && (
                      <p className="text-xs text-slate-500 line-clamp-1">
                        {evidence.indicator.text}
                      </p>
                    )}
                  </div>

                  {/* أزرار الإجراءات */}
                  <div className="flex items-center gap-2 self-end sm:self-start">
                    {evidence.evidenceType === 'report' ? (
                      <>
                        <Link
                          href={`/reports/${evidence.id}`}
                          target="_blank"
                          className="p-2 text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors"
                          title="عرض تقرير التوثيق A4"
                        >
                          <FileText className="w-4 h-4" />
                        </Link>
                        {evidence.pdfUrl && (
                          <a
                            href={evidence.pdfUrl}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors"
                            title="تحميل ملف PDF"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        )}
                      </>
                    ) : (
                      evidence.url && (
                        <a
                          href={evidence.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-slate-600 hover:text-moe-800 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
                          title="معاينة الرابط"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )
                    )}

                    {/* المعلم يستطيع تعديل الشاهد غير المعتمد فقط */}
                    {evidence.status !== 'approved' && (
                      <button
                        onClick={() => handleOpenEdit(evidence)}
                        className="p-2 text-slate-600 hover:text-moe-800 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
                        title="تعديل الشاهد"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    )}

                    {/* المعلم يستطيع حذف الشاهد غير المعتمد فقط */}
                    {evidence.status !== 'approved' && (
                      <button
                        onClick={() => handleDelete(evidence.id)}
                        className="p-2 text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition-colors"
                        title="حذف الشاهد"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* سبب الرفض إن وجد */}
                {evidence.status === 'rejected' && evidence.rejectionReason && (
                  <div className="bg-rose-50 p-3.5 rounded-xl border border-rose-200 text-xs text-rose-900 space-y-1">
                    <span className="font-bold flex items-center gap-1 text-rose-700">
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                      سبب الرفض وملاحظات الإدارة:
                    </span>
                    <p className="leading-relaxed">{evidence.rejectionReason}</p>
                    <div className="pt-1">
                      <button
                        onClick={() => handleOpenEdit(evidence)}
                        className="text-xs font-bold text-rose-800 hover:underline"
                      >
                        اضغط هنا لتعديل الشاهد وإعادة إرساله للمراجعة ←
                      </button>
                    </div>
                  </div>
                )}

                {/* الفوتر الصغير للبطاقة */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-3">
                    <span>العام الدراسي: {evidence.academicYear}</span>
                    <span>•</span>
                    <span>{evidence.semester || 'الفصل الأول'}</span>
                  </div>
                  <span>تاريخ الرفع: {new Date(evidence.createdAt).toLocaleDateString('ar-SA')}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500 space-y-3">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-medium text-slate-700">لم تضف أي شاهد بعد في هذا التصنيف.</p>
            <p className="text-xs text-slate-400">
              تصفح دليل المؤشرات واختر المؤشر المناسب لإرفاق الرابط المعتمد.
            </p>
          </div>
        )}
      </div>

      {/* نوافذ التعديل */}
      <ExternalLinkModal
        isOpen={isExternalModalOpen}
        onClose={() => {
          setIsExternalModalOpen(false);
          setEditingEvidence(null);
        }}
        onSuccess={() => {
          showToast('تم تحديث الشاهد وإرساله للمراجعة بنجاح.');
          reloadEvidences();
        }}
        indicatorId={selectedIndicatorId || editingEvidence?.indicatorId || ''}
        indicatorCode={editingEvidence?.indicator?.code}
        indicatorText={editingEvidence?.indicator?.text}
        initialEvidence={editingEvidence}
      />

      <ReportBuilderModal
        isOpen={isReportModalOpen}
        onClose={() => {
          setIsReportModalOpen(false);
          setEditingEvidence(null);
        }}
        onSuccess={() => {
          showToast('تم حفظ التقرير وإرساله للمراجعة بنجاح.');
          reloadEvidences();
        }}
        indicatorId={selectedIndicatorId || editingEvidence?.indicatorId || ''}
        indicatorCode={editingEvidence?.indicator?.code}
        indicatorText={editingEvidence?.indicator?.text}
        initialEvidence={editingEvidence}
        currentUser={currentUser}
      />
    </div>
  );
}
