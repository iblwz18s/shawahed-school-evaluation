'use client';

import React, { useState, useEffect } from 'react';
import { X, Link2, AlertTriangle, Loader2, Video, File, Folder, Presentation, Globe } from 'lucide-react';
import { EvidenceItem } from '@/types';

interface ExternalLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message?: string) => void;
  indicatorId: string;
  indicatorCode?: string;
  indicatorText?: string;
  initialEvidence?: EvidenceItem | null;
}

export const ExternalLinkModal: React.FC<ExternalLinkModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  indicatorId,
  indicatorCode,
  indicatorText,
  initialEvidence,
}) => {
  const [title, setTitle] = useState('');
  const [subType, setSubType] = useState<'video' | 'file' | 'folder' | 'presentation' | 'other'>('file');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [academicYear, setAcademicYear] = useState('1447-1448هـ / 2026م');
  const [semester, setSemester] = useState('الفصل الدراسي الأول');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isEditing = !!initialEvidence;

  useEffect(() => {
    if (initialEvidence) {
      setTitle(initialEvidence.title || '');
      setSubType((initialEvidence.subType as any) || 'file');
      setUrl(initialEvidence.url || '');
      setDescription(initialEvidence.description || '');
      setAcademicYear(initialEvidence.academicYear || '1447-1448هـ / 2026م');
      setSemester(initialEvidence.semester || 'الفصل الدراسي الأول');
    } else {
      setTitle('');
      setSubType('file');
      setUrl('');
      setDescription('');
      setAcademicYear('1447-1448هـ / 2026م');
      setSemester('الفصل الدراسي الأول');
    }
    setError(null);
  }, [initialEvidence, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedTitle = title.trim();
    const trimmedUrl = url.trim();

    if (!trimmedTitle) {
      setError('اسم الشاهد حقل إلزامي.');
      return;
    }

    if (!trimmedUrl) {
      setError('رابط الشاهد حقل إلزامي.');
      return;
    }

    if (!trimmedUrl.toLowerCase().startsWith('https://')) {
      setError('أدخل رابطًا صالحًا يبدأ بـ https://');
      return;
    }

    setLoading(true);

    try {
      const endpoint = isEditing ? `/api/evidences/${initialEvidence.id}` : '/api/evidences';
      const method = isEditing ? 'PATCH' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          indicatorId,
          title: trimmedTitle,
          evidenceType: 'external_link',
          subType,
          url: trimmedUrl,
          description: description.trim(),
          academicYear,
          semester,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'فشلت عملية حفظ الشاهد');
      }

      onSuccess(isEditing ? 'تم تعديل الشاهد بنجاح وإعادته للمراجعة' : 'تم إرسال الشاهد للمراجعة بنجاح.');
      onClose();
    } catch (err: any) {
      setError(err.message || 'حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* رأس النافذة */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {isEditing ? 'تعديل الشاهد الخارجي' : 'إدراج رابط خارجي'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Google Drive، فيديو، ملف، مجلد أو رابط آخر
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* جسم النموذج */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* تنبيه الصلاحيات المعتمد نصياً في الوثيقة */}
          <div className="p-3.5 bg-amber-50/90 border border-amber-200 text-amber-900 text-xs rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-amber-800">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>تنبيه هام:</span>
            </div>
            <p className="leading-relaxed text-[11.5px] text-amber-800">
              تأكد أن صلاحية الرابط تسمح لفريق التقويم بفتحه دون طلب صلاحية إضافية.
            </p>
          </div>

          {indicatorText && (
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-700">
              <span className="font-semibold text-slate-900 block mb-1">
                المؤشر المرتبط ({indicatorCode}):
              </span>
              <p className="line-clamp-2">{indicatorText}</p>
            </div>
          )}

          {/* اسم الشاهد */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              اسم الشاهد <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: الخطة التشغيلية السنوية المعتمدة..."
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-moe-600/20 focus:border-moe-600 transition-colors"
            />
          </div>

          {/* نوع الشاهد */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              نوع الشاهد
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { id: 'file', label: 'ملف', icon: File },
                { id: 'video', label: 'فيديو', icon: Video },
                { id: 'folder', label: 'مجلد', icon: Folder },
                { id: 'presentation', label: 'عرض تقديمي', icon: Presentation },
                { id: 'other', label: 'رابط آخر', icon: Globe },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = subType === item.id;
                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => setSubType(item.id as any)}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-medium flex flex-col items-center justify-center gap-1.5 transition-all ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-900 font-bold ring-2 ring-emerald-600/20'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-emerald-700' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* الرابط */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              رابط الشاهد (HTTPS) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://drive.google.com/... أو https://..."
                className="w-full px-3.5 py-2.5 pl-10 text-sm font-mono dir-ltr text-left bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-moe-600/20 focus:border-moe-600 transition-colors"
              />
              <Link2 className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              يفتح الرابط في تبويب جديد. إذا كان فيديو، يتم حفظ الرابط الخارجي دون رفعه إلى الخادم.
            </span>
          </div>

          {/* العام الدراسي والفصل */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                العام الدراسي
              </label>
              <input
                type="text"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-moe-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                الفصل الدراسي
              </label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-moe-600"
              >
                <option value="الفصل الدراسي الأول">الفصل الدراسي الأول</option>
                <option value="الفصل الدراسي الثاني">الفصل الدراسي الثاني</option>
                <option value="الفصل الدراسي الثالث">الفصل الدراسي الثالث</option>
                <option value="شامل العام كاملاً">شامل العام كاملاً</option>
              </select>
            </div>
          </div>

          {/* الوصف المختصر */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              وصف مختصر اختياري
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="وصف مختصر لمحتوى الملف أو الرابط..."
              className="w-full px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-moe-600"
            />
          </div>

          {/* الأزرار */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-moe-800 hover:bg-moe-900 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50 shadow-sm"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{isEditing ? 'حفظ وإعادة الإرسال' : 'إرسال الشاهد للمراجعة'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
