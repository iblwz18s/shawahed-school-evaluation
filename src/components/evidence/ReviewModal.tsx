'use client';

import React, { useState } from 'react';
import { X, CheckCircle, AlertTriangle, ExternalLink, Loader2, FileCheck, Ban } from 'lucide-react';
import { EvidenceItem } from '@/types';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  evidence: EvidenceItem | null;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  evidence,
}) => {
  const [action, setAction] = useState<'approve' | 'reject'>('approve');
  const [rejectionReason, setRejectionReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen || !evidence) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (action === 'reject' && !rejectionReason.trim()) {
      setError('يرجى كتابة سبب الرفض لتوضيح ما يحتاج المعلم تعديله.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/evidences/${evidence.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          rejectionReason: action === 'reject' ? rejectionReason.trim() : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'فشلت عملية المراجعة');
      }

      onSuccess(data.message);
      onClose();
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء معالجة الشاهد');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden flex flex-col max-h-[94vh] sm:max-h-[90vh]">
        {/* رأس النافذة */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm sm:text-base">
            <FileCheck className="w-5 h-5 text-moe-700" />
            <span>مراجعة الشاهد واعتماده</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* جسم النافذة */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* تفاصيل الشاهد المراد مراجعته */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 text-xs">
            <div className="flex justify-between items-start gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      evidence.evidenceType === 'report'
                        ? 'bg-purple-100 text-purple-800 border border-purple-200'
                        : 'bg-blue-100 text-blue-800 border border-blue-200'
                    }`}
                  >
                    {evidence.evidenceType === 'report' ? 'تقرير توثيق A4' : 'رابط خارجي'}
                  </span>
                  {evidence.subType && (
                    <span className="text-[10px] text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded">
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
                </div>
                <span className="font-bold text-slate-900 text-sm block">{evidence.title}</span>
              </div>

              {/* زر المعاينة حسب النوع */}
              <div className="flex items-center gap-1.5 shrink-0">
                {evidence.evidenceType === 'report' ? (
                  <>
                    <a
                      href={`/reports/${evidence.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-moe-700 hover:text-moe-900 font-bold bg-moe-50 hover:bg-moe-100 px-2.5 py-1.5 rounded-lg border border-moe-200 transition-colors"
                    >
                      <span>معاينة التقرير</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    {evidence.pdfUrl && (
                      <a
                        href={evidence.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-emerald-700 hover:text-emerald-900 font-bold bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded-lg border border-emerald-200 transition-colors"
                        title="تحميل PDF"
                      >
                        <span>PDF</span>
                      </a>
                    )}
                  </>
                ) : (
                  evidence.url && (
                    <a
                      href={evidence.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-moe-700 hover:text-moe-900 font-medium bg-moe-50 hover:bg-moe-100 px-2.5 py-1.5 rounded-md border border-moe-200 transition-colors"
                    >
                      <span>فتح الرابط</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )
                )}
              </div>
            </div>

            {evidence.indicator && (
              <div className="text-slate-600">
                <span className="font-semibold text-slate-800">المؤشر: </span>
                <span className="font-mono text-moe-800 dir-ltr inline-block font-bold">
                  {evidence.indicator.code}
                </span>{' '}
                - {evidence.indicator.text}
              </div>
            )}

            {evidence.submittedBy && (
              <div className="text-slate-500 text-[11px] pt-1">
                مقدم الشاهد: <span className="text-slate-700 font-medium">{evidence.submittedBy.name}</span>
              </div>
            )}
          </div>

          {/* خيار القرار: اعتماد أو رفض */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800">
              قرار المراجعة <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAction('approve')}
                className={`py-3 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  action === 'approve'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/20'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <CheckCircle className={`w-4 h-4 ${action === 'approve' ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>اعتماد الشاهد</span>
              </button>

              <button
                type="button"
                onClick={() => setAction('reject')}
                className={`py-3 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  action === 'reject'
                    ? 'bg-rose-50 border-rose-500 text-rose-800 ring-2 ring-rose-500/20'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Ban className={`w-4 h-4 ${action === 'reject' ? 'text-rose-600' : 'text-slate-400'}`} />
                <span>رفض الشاهد</span>
              </button>
            </div>
          </div>

          {/* حقل سبب الرفض في حال اختيار الرفض */}
          {action === 'reject' && (
            <div className="space-y-1.5 animate-in fade-in duration-150">
              <label className="block text-xs font-bold text-slate-800">
                سبب الرفض والملاحظات <span className="text-rose-500">* (إلزامي)</span>
              </label>
              <textarea
                required
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="اذكر سبب الرفض (مثال: الرابط لا يفتح لعدم وجود صلاحية مشاركة، أو المحتوى غير مطابق للمؤشر)..."
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-rose-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-colors"
              />
              <span className="text-[11px] text-slate-500 block">
                سيتم إرسال هذا السبب إلى المعلم لتعديل الشاهد وإعادة رفعه.
              </span>
            </div>
          )}

          {/* أزرار الحفظ */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="order-2 sm:order-1 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors text-center"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`order-1 sm:order-2 flex items-center justify-center gap-2 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50 shadow-sm w-full sm:w-auto ${
                action === 'approve'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{action === 'approve' ? 'تأكيد اعتماد الشاهد' : 'تأكيد رفض الشاهد'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
