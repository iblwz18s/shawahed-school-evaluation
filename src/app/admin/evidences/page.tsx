'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FileCheck2,
  Filter,
  Search,
  ExternalLink,
  Trash2,
  Check,
  Ban,
  ArrowRight,
  Loader2,
  Calendar,
  User,
} from 'lucide-react';
import { StatusBadge } from '@/components/common/Badge';
import { ReviewModal } from '@/components/evidence/ReviewModal';
import { EvidenceItem } from '@/types';

export default function AdminEvidencesPage() {
  const router = useRouter();
  const [evidences, setEvidences] = useState<EvidenceItem[]>([]);
  const [domains, setDomains] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // الفلاتر
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [reviewingEvidence, setReviewingEvidence] = useState<EvidenceItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadAll = async () => {
    try {
      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();
      if (!meData.user || meData.user.role !== 'admin') {
        router.push('/login');
        return;
      }

      const [evRes, domRes] = await Promise.all([
        fetch('/api/evidences'),
        fetch('/api/domains'),
      ]);

      if (evRes.ok) {
        const evData = await evRes.json();
        setEvidences(evData.evidences || []);
      }

      if (domRes.ok) {
        const domData = await domRes.json();
        setDomains(domData.domains || []);
      }
    } catch (err) {
      console.error('Admin evidences error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الشاهد نهائياً؟')) return;
    try {
      const res = await fetch(`/api/evidences/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('تم حذف الشاهد بنجاح');
        loadAll();
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

  // تطبيق الفلاتر
  const filteredEvidences = evidences.filter((e) => {
    if (selectedStatus !== 'all' && e.status !== selectedStatus) return false;
    if (
      selectedDomain !== 'all' &&
      e.indicator?.standard?.domain?.id !== selectedDomain &&
      e.indicator?.standard?.domain?.code !== selectedDomain
    ) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = e.title.toLowerCase().includes(q);
      const matchCode = e.indicator?.code?.toLowerCase().includes(q);
      const matchTeacher = e.submittedBy?.name?.toLowerCase().includes(q);
      if (!matchTitle && !matchCode && !matchTeacher) return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 duration-200 border border-slate-700">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* الرأس */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="space-y-1">
          <Link
            href="/admin"
            className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
          >
            <span>لوحة تحكم المدير</span>
            <ArrowRight className="w-3.5 h-3.5 rotate-180" />
          </Link>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <FileCheck2 className="w-6 h-6 text-moe-700" />
            <span>مستودع الشواهد الشامل ({filteredEvidences.length})</span>
          </h1>
          <p className="text-xs text-slate-500">
            تصفح وبحث وإدارة جميع الشواهد المرفوعة في المنصة
          </p>
        </div>
      </div>

      {/* شريط الفلاتر والبحث */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* حقل البحث */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث بالعنوان أو المعلم أو المؤشر..."
              className="w-full px-3.5 py-2 pr-9 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-moe-600"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
          </div>

          {/* فلتر الحالة */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-moe-600"
            >
              <option value="all">كافة الحالات (معتمد، معلق، مرفوض)</option>
              <option value="approved">معتمد فقط</option>
              <option value="pending">قيد المراجعة فقط</option>
              <option value="rejected">مرفوض فقط</option>
            </select>
          </div>

          {/* فلتر المجال */}
          <div>
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-moe-600"
            >
              <option value="all">كافة المجالات الأربعة</option>
              {domains.map((d) => (
                <option key={d.id} value={d.id}>
                  مجال {d.code}: {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* جدول الشواهد */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredEvidences.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <th className="py-3.5 px-4 font-bold">الحالة</th>
                  <th className="py-3.5 px-4 font-bold">اسم الشاهد</th>
                  <th className="py-3.5 px-4 font-bold">المؤشر</th>
                  <th className="py-3.5 px-4 font-bold">المجال</th>
                  <th className="py-3.5 px-4 font-bold">المعلم</th>
                  <th className="py-3.5 px-4 font-bold">العام</th>
                  <th className="py-3.5 px-4 font-bold text-center">الرابط</th>
                  <th className="py-3.5 px-4 font-bold text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEvidences.map((ev) => (
                  <tr key={ev.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <StatusBadge status={ev.status} />
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            ev.evidenceType === 'report'
                              ? 'bg-purple-50 text-purple-800 border border-purple-200'
                              : 'bg-blue-50 text-blue-800 border border-blue-200'
                          }`}
                        >
                          {ev.evidenceType === 'report' ? 'تقرير A4' : 'رابط خارجي'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 max-w-xs">
                      {ev.title}
                    </td>
                    <td className="py-3.5 px-4">
                      {ev.indicator && (
                        <Link
                          href={`/indicators/${encodeURIComponent(ev.indicator.code)}`}
                          className="font-mono text-moe-800 font-bold hover:underline dir-ltr inline-block"
                        >
                          {ev.indicator.code}
                        </Link>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {ev.indicator?.standard?.domain?.name || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      {ev.submittedBy?.name || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                      {ev.academicYear}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {ev.evidenceType === 'report' ? (
                        <div className="flex items-center justify-center gap-1">
                          <Link
                            href={`/reports/${ev.id}`}
                            target="_blank"
                            className="inline-flex items-center gap-1 text-moe-700 hover:text-moe-900 bg-moe-50 hover:bg-moe-100 px-2 py-1 rounded-md border border-moe-200 text-[11px] font-bold"
                          >
                            <span>معاينة</span>
                          </Link>
                          {ev.pdfUrl && (
                            <a
                              href={ev.pdfUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded-md border border-emerald-200 text-[11px] font-bold"
                            >
                              <span>PDF</span>
                            </a>
                          )}
                        </div>
                      ) : (
                        ev.url && (
                          <a
                            href={ev.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-moe-700 hover:text-moe-900 bg-moe-50 hover:bg-moe-100 px-2 py-1 rounded-md border border-moe-200"
                            title="فتح الرابط"
                          >
                            <span>فتح</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setReviewingEvidence(ev)}
                          className="p-1.5 text-moe-800 hover:bg-moe-50 rounded-lg transition-colors"
                          title="مراجعة أو تغيير الحالة"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(ev.id)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="حذف الشاهد"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-500">
            <p className="text-sm font-bold text-slate-800">لا توجد شواهد مطابقة لمعايير البحث الحالية.</p>
          </div>
        )}
      </div>

      {/* نافذة المراجعة */}
      <ReviewModal
        isOpen={!!reviewingEvidence}
        onClose={() => setReviewingEvidence(null)}
        onSuccess={(msg) => {
          showToast(msg);
          loadAll();
        }}
        evidence={reviewingEvidence}
      />
    </div>
  );
}
