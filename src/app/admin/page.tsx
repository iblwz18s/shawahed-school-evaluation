'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Building2,
  FileCheck2,
  Clock,
  AlertCircle,
  CheckCircle2,
  Users,
  Settings,
  History,
  ExternalLink,
  Check,
  Ban,
  Loader2,
  ArrowLeft,
  ShieldCheck,
  BarChart2,
  Filter,
  FileText,
} from 'lucide-react';
import { ProgressBar } from '@/components/common/ProgressBar';
import { StatusBadge } from '@/components/common/Badge';
import { ReviewModal } from '@/components/evidence/ReviewModal';
import { EvidenceItem } from '@/types';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [pendingEvidences, setPendingEvidences] = useState<EvidenceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewingEvidence, setReviewingEvidence] = useState<EvidenceItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadData = async () => {
    try {
      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();
      if (!meData.user || meData.user.role !== 'admin') {
        router.push('/login');
        return;
      }

      const [statsRes, pendingRes] = await Promise.all([
        fetch('/api/stats', { cache: 'no-store' }),
        fetch('/api/evidences?status=pending', { cache: 'no-store' }),
      ]);

      if (statsRes.ok) {
        const sData = await statsRes.json();
        setStats(sData);
      }

      if (pendingRes.ok) {
        const pData = await pendingRes.json();
        setPendingEvidences(pData.evidences || []);
      }
    } catch (err) {
      console.error('Admin load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [router]);

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

      {/* رأس لوحة المدير */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-moe-700 bg-moe-50 px-2.5 py-0.5 rounded-full border border-moe-200">
              لوحة الإدارة المركزية
            </span>
            <span className="text-xs text-slate-500">
              المدرسة: {stats?.schoolSetting?.schoolName || 'ثانوية رواد المعرفة'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            لوحة تحكم مدير المدرسة
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            متابعة نسب اكتمال الشواهد للمؤشرات، مراجعة واعتماد المرفوعات، وإدارة المستخدمين
          </p>
        </div>

        {/* أزرار الإجراءات السريعة */}
        {/* أزرار الإجراءات السريعة */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 w-full md:w-auto">
          <Link
            href="/admin/reviews"
            className="inline-flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-3 py-2.5 rounded-xl transition-all shadow-sm"
          >
            <Clock className="w-4 h-4 shrink-0" />
            <span>المراجعة ({stats?.pendingEvidencesCount || 0})</span>
          </Link>
          <Link
            href="/admin/evidences"
            className="inline-flex items-center justify-center gap-2 bg-moe-800 hover:bg-moe-900 text-white text-xs font-bold px-3 py-2.5 rounded-xl transition-all shadow-sm"
          >
            <FileCheck2 className="w-4 h-4 shrink-0" />
            <span>مستودع الشواهد</span>
          </Link>
          <Link
            href="/admin/users"
            className="inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-2.5 rounded-xl transition-all border border-slate-200"
          >
            <Users className="w-4 h-4 shrink-0" />
            <span>المستخدمين</span>
          </Link>
          <Link
            href="/admin/audit"
            className="inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-2.5 rounded-xl transition-all border border-slate-200"
          >
            <History className="w-4 h-4 shrink-0" />
            <span>سجل العمليات</span>
          </Link>
          <Link
            href="/admin/settings"
            className="col-span-2 sm:col-span-1 p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-2"
            title="إعدادات المدرسة"
          >
            <Settings className="w-4 h-4" />
            <span className="sm:hidden text-xs font-bold">إعدادات المدرسة</span>
          </Link>
        </div>
      </div>

      {/* بطاقات المؤشرات والشواهد المحددة في الوثيقة (قسم 22) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* إجمالي المؤشرات المطبقة */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-medium text-slate-500">المؤشرات المطبقة</span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {stats?.totalIndicators || 49}
          </div>
          <span className="text-[11px] text-slate-400 block">
            {stats?.schoolSetting?.schoolType === 'government' ? 'مدرسة حكومية (49 مؤشر)' : '52 مؤشر'}
          </span>
        </div>

        {/* مؤشرات لديها شاهد معتمد */}
        <div className="bg-white rounded-2xl p-5 border border-emerald-200 bg-emerald-50/20 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-800">مؤشرات بشاهد معتمد</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700">
            {stats?.indicatorsWithApproved || 0}
          </div>
          <span className="text-[11px] text-emerald-600 block">
            نسبة الاكتمال: {stats?.completionRate || 0}%
          </span>
        </div>

        {/* مؤشرات بدون شاهد معتمد */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-medium text-slate-500">مؤشرات بدون شاهد</span>
          <div className="text-2xl sm:text-3xl font-black text-slate-700">
            {stats?.indicatorsWithoutEvidence || 0}
          </div>
          <span className="text-[11px] text-slate-400 block">تحتاج إلى شواهد</span>
        </div>

        {/* الشواهد المعتمدة */}
        <div className="bg-white rounded-2xl p-5 border border-emerald-200 bg-emerald-50/20 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-800">شواهد معتمدة</span>
            <FileCheck2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700">
            {stats?.totalApprovedEvidences || 0}
          </div>
          <span className="text-[11px] text-emerald-600 block">معتمدة من مدير المدرسة</span>
        </div>

        {/* شواهد قيد المراجعة */}
        <div className="bg-white rounded-2xl p-5 border border-amber-200 bg-amber-50/20 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-800">قيد المراجعة</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-700">
            {stats?.pendingEvidencesCount || 0}
          </div>
          <span className="text-[11px] text-amber-600 block">تنتظر قرار المدير</span>
        </div>

        {/* شواهد مرفوضة */}
        <div className="bg-white rounded-2xl p-5 border border-rose-200 bg-rose-50/20 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-rose-800">شواهد مرفوضة</span>
            <AlertCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-700">
            {stats?.rejectedEvidencesCount || 0}
          </div>
          <span className="text-[11px] text-rose-600 block">معادة للمعلم بملاحظة</span>
        </div>
      </div>

      {/* جدول اكتمال الشواهد حسب المجالات الأربعة كما نصت الوثيقة */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-moe-700" />
            <h2 className="text-lg font-bold text-slate-900">
              اكتمال الشواهد حسب مجالات التقويم المدرسي
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            المجموع الحكومي المعتمد: 49 مؤشرًا
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <th className="py-3.5 px-4 font-bold">المجال</th>
                <th className="py-3.5 px-4 font-bold text-center">عدد المؤشرات</th>
                <th className="py-3.5 px-4 font-bold text-center">مكتمل بشاهد معتمد</th>
                <th className="py-3.5 px-4 font-bold text-center">بدون شاهد</th>
                <th className="py-3.5 px-4 font-bold">نسبة اكتمال الشواهد</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats?.domains?.map((d: any) => {
                const pendingCount = d.totalIndicators - d.completedIndicators;
                const rate =
                  d.totalIndicators > 0
                    ? Math.round((d.completedIndicators / d.totalIndicators) * 100)
                    : 0;

                return (
                  <tr key={d.domainId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4 font-bold text-slate-900">
                      <span className="font-mono text-moe-700 ml-1.5 font-black">
                        {d.domainCode}.
                      </span>
                      {d.domainName}
                    </td>
                    <td className="py-4 px-4 text-center font-bold text-slate-700">
                      {d.totalIndicators}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        {d.completedIndicators}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="inline-flex items-center gap-1 font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                        {pendingCount}
                      </span>
                    </td>
                    <td className="py-4 px-4 w-56">
                      <div className="space-y-1">
                        <ProgressBar value={rate} showPercentage={true} size="sm" />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* قائمة "بانتظار المراجعة" السريعة (Section 22 of BRD) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg font-bold text-slate-900">
              قائمة بانتظار المراجعة والاعتماد ({pendingEvidences.length})
            </h2>
          </div>
          <Link
            href="/admin/reviews"
            className="text-xs text-moe-800 font-bold hover:underline flex items-center gap-1"
          >
            <span>عرض صفحة المراجعة المخصصة</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
        </div>

        {pendingEvidences.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <th className="py-3 px-4 font-bold">اسم الشاهد</th>
                  <th className="py-3 px-4 font-bold">المؤشر</th>
                  <th className="py-3 px-4 font-bold">المعلم</th>
                  <th className="py-3 px-4 font-bold">تاريخ الرفع</th>
                  <th className="py-3 px-4 font-bold text-center">الرابط</th>
                  <th className="py-3 px-4 font-bold text-center">الإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingEvidences.slice(0, 5).map((ev) => (
                  <tr key={ev.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 max-w-xs">
                      {ev.title}
                    </td>
                    <td className="py-3.5 px-4">
                      {ev.indicator && (
                        <div className="space-y-0.5">
                          <span className="font-mono text-moe-800 font-bold dir-ltr inline-block">
                            {ev.indicator.code}
                          </span>
                          <p className="text-[11px] text-slate-500 line-clamp-1">
                            {ev.indicator.text}
                          </p>
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      {ev.submittedBy?.name || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {new Date(ev.createdAt).toLocaleDateString('ar-SA')}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {ev.evidenceType === 'report' ? (
                        <Link
                          href={`/reports/${ev.id}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-2 py-1 rounded-md border border-purple-200"
                          title="عرض تقرير التوثيق A4"
                        >
                          <span>تقرير</span>
                          <FileText className="w-3 h-3" />
                        </Link>
                      ) : (
                        <a
                          href={ev.url || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-moe-700 hover:text-moe-900 bg-moe-50 hover:bg-moe-100 px-2 py-1 rounded-md border border-moe-200"
                          title="فتح الرابط الخارجي"
                        >
                          <span>فتح</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => setReviewingEvidence(ev)}
                        className="inline-flex items-center gap-1 bg-moe-800 hover:bg-moe-900 text-white font-bold px-3 py-1 rounded-lg text-xs shadow-sm"
                      >
                        <Check className="w-3 h-3" />
                        <span>مراجعة</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-500">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-800">
              رائع! تم مراجعة جميع الشواهد المرفوعة، ولا توجد شواهد معلقة حالياً.
            </p>
          </div>
        )}
      </div>

      {/* نافذة المراجعة */}
      <ReviewModal
        isOpen={!!reviewingEvidence}
        onClose={() => setReviewingEvidence(null)}
        onSuccess={(msg) => {
          showToast(msg);
          loadData();
        }}
        evidence={reviewingEvidence}
      />
    </div>
  );
}
