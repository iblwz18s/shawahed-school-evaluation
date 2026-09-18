'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Check,
  Ban,
  ArrowRight,
  Loader2,
  Calendar,
  User,
} from 'lucide-react';
import { ReviewModal } from '@/components/evidence/ReviewModal';
import { EvidenceItem } from '@/types';

export default function AdminReviewsPage() {
  const router = useRouter();
  const [pendingEvidences, setPendingEvidences] = useState<EvidenceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewingEvidence, setReviewingEvidence] = useState<EvidenceItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadPending = async () => {
    try {
      const res = await fetch('/api/evidences?status=pending');
      if (res.ok) {
        const data = await res.json();
        setPendingEvidences(data.evidences || []);
      }
    } catch (err) {
      console.error('Fetch pending error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPending();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-moe-700" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 duration-200 border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* الرأس */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link
              href="/admin"
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
            >
              <span>لوحة تحكم المدير</span>
              <ArrowRight className="w-3.5 h-3.5 rotate-180" />
            </Link>
          </div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <Clock className="w-6 h-6 text-amber-600" />
            <span>قائمة مراجعة واعتماد الشواهد ({pendingEvidences.length})</span>
          </h1>
          <p className="text-xs text-slate-500">
            فحص الشواهد المرفوعة والتأكد من فتح الرابط ومطابقته للمؤشر قبل إتاحته للزوار
          </p>
        </div>
      </div>

      {/* قائمة الشواهد المعلقة */}
      {pendingEvidences.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {pendingEvidences.map((evidence) => (
            <div
              key={evidence.id}
              className="bg-white rounded-2xl border border-slate-200/90 hover:border-moe-200 p-6 shadow-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-3 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                    <Clock className="w-3 h-3 text-amber-600" />
                    بانتظار المراجعة
                  </span>
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      evidence.evidenceType === 'report'
                        ? 'bg-purple-50 text-purple-800 border border-purple-200'
                        : 'bg-blue-50 text-blue-800 border border-blue-200'
                    }`}
                  >
                    {evidence.evidenceType === 'report' ? 'تقرير توثيق A4' : 'رابط خارجي'}
                  </span>
                  {evidence.subType && (
                    <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      {evidence.subType === 'video'
                        ? 'فيديو'
                        : evidence.subType === 'file'
                        ? 'ملف'
                        : evidence.subType === 'folder'
                        ? 'مجلد'
                        : evidence.subType === 'presentation'
                        ? 'عرض تقديمي'
                        : evidence.subType}
                    </span>
                  )}
                  {evidence.indicator && (
                    <span className="font-mono text-xs font-bold text-moe-800 bg-moe-50 px-2.5 py-0.5 rounded border border-moe-200 dir-ltr inline-block">
                      {evidence.indicator.code}
                    </span>
                  )}
                  <span className="text-xs text-slate-500">
                    العام الدراسي: {evidence.academicYear}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900">{evidence.title}</h3>
                  {evidence.indicator && (
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                      <strong className="text-slate-800">المؤشر: </strong>
                      {evidence.indicator.text}
                    </p>
                  )}
                  {evidence.description && (
                    <p className="text-xs text-slate-500 mt-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      {evidence.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1 text-slate-600">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    المعلم: <strong>{evidence.submittedBy?.name}</strong>
                  </span>
                  <span>•</span>
                  <span>تاريخ الرفع: {new Date(evidence.createdAt).toLocaleString('ar-SA')}</span>
                </div>
              </div>

              {/* أزرار اتخاذ القرار وفق نوع الشاهد */}
              <div className="flex flex-col sm:flex-row md:flex-col items-stretch md:items-end gap-2 shrink-0">
                {evidence.evidenceType === 'report' ? (
                  <div className="flex flex-col sm:flex-row md:flex-col gap-2 w-full">
                    <Link
                      href={`/reports/${evidence.id}`}
                      target="_blank"
                      className="inline-flex items-center justify-center gap-1.5 text-xs text-moe-700 hover:text-moe-900 font-bold bg-moe-50 hover:bg-moe-100 px-4 py-2 rounded-xl border border-moe-200 transition-colors"
                    >
                      <span>فتح المعاينة</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                    {evidence.pdfUrl && (
                      <a
                        href={evidence.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 text-xs text-emerald-700 hover:text-emerald-900 font-bold bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-xl border border-emerald-200 transition-colors"
                      >
                        <span>تحميل PDF</span>
                      </a>
                    )}
                  </div>
                ) : (
                  evidence.url && (
                    <a
                      href={evidence.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 text-xs text-moe-700 hover:text-moe-900 font-bold bg-moe-50 hover:bg-moe-100 px-4 py-2.5 rounded-xl border border-moe-200 transition-colors"
                    >
                      <span>فتح الرابط ومعاينته</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )
                )}

                <button
                  onClick={() => setReviewingEvidence(evidence)}
                  className="inline-flex items-center justify-center gap-1.5 text-xs text-white font-bold bg-moe-800 hover:bg-moe-900 px-5 py-2.5 rounded-xl transition-all shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  <span>مراجعة (اعتماد / رفض)</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-800">قائمة المراجعة فارغة تماماً</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            تم مراجعة كافة الشواهد المقدمة من المعلمين. ستظهر أي شواهد جديدة هنا فور رفعها.
          </p>
          <div className="pt-4">
            <Link
              href="/admin/evidences"
              className="text-xs text-moe-800 font-bold hover:underline"
            >
              الانتقال إلى مستودع الشواهد الشامل ←
            </Link>
          </div>
        </div>
      )}

      {/* نافذة المراجعة */}
      <ReviewModal
        isOpen={!!reviewingEvidence}
        onClose={() => setReviewingEvidence(null)}
        onSuccess={(msg) => {
          showToast(msg);
          loadPending();
        }}
        evidence={reviewingEvidence}
      />
    </div>
  );
}
